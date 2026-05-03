// OctoPrint API client for CR-10 Smart printer integration

import type { Printer, PrintJob } from '@/lib/templates/types';

interface OctoPrintConfig {
  apiUrl: string;
  apiKey: string;
}

interface OctoPrintPrinterState {
  state: {
    text: string;
    flags: {
      operational: boolean;
      printing: boolean;
      paused: boolean;
      error: boolean;
      ready: boolean;
    };
  };
  temperature: {
    tool0: { actual: number; target: number };
    bed: { actual: number; target: number };
  };
}

interface OctoPrintJobState {
  job: {
    file: { name: string; path: string };
    estimatedPrintTime: number;
  };
  progress: {
    completion: number;
    printTime: number;
    printTimeLeft: number;
  };
  state: string;
}

export class OctoPrintClient {
  private config: OctoPrintConfig;

  constructor(config: OctoPrintConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.config.apiUrl}/api${endpoint}`, {
      ...options,
      headers: {
        'X-Api-Key': this.config.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`OctoPrint API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getPrinterState(): Promise<OctoPrintPrinterState> {
    return this.request<OctoPrintPrinterState>('/printer');
  }

  async getJobState(): Promise<OctoPrintJobState> {
    return this.request<OctoPrintJobState>('/job');
  }

  async uploadFile(file: File | Blob, filename: string): Promise<{ done: boolean; local: { name: string } }> {
    const formData = new FormData();
    formData.append('file', file, filename);
    formData.append('select', 'true');
    formData.append('print', 'false');

    const response = await fetch(`${this.config.apiUrl}/api/files/local`, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.config.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async startPrint(filename: string): Promise<void> {
    await this.request(`/files/local/${filename}`, {
      method: 'POST',
      body: JSON.stringify({ command: 'select', print: true }),
    });
  }

  async pausePrint(): Promise<void> {
    await this.request('/job', {
      method: 'POST',
      body: JSON.stringify({ command: 'pause', action: 'pause' }),
    });
  }

  async resumePrint(): Promise<void> {
    await this.request('/job', {
      method: 'POST',
      body: JSON.stringify({ command: 'pause', action: 'resume' }),
    });
  }

  async cancelPrint(): Promise<void> {
    await this.request('/job', {
      method: 'POST',
      body: JSON.stringify({ command: 'cancel' }),
    });
  }

  async setTemperature(tool: 'tool0' | 'bed', target: number): Promise<void> {
    if (tool === 'bed') {
      await this.request('/printer/bed', {
        method: 'POST',
        body: JSON.stringify({ command: 'target', target }),
      });
    } else {
      await this.request('/printer/tool', {
        method: 'POST',
        body: JSON.stringify({ command: 'target', targets: { [tool]: target } }),
      });
    }
  }

  async homeAxes(axes: ('x' | 'y' | 'z')[]): Promise<void> {
    await this.request('/printer/printhead', {
      method: 'POST',
      body: JSON.stringify({ command: 'home', axes }),
    });
  }

  // Convert OctoPrint state to our Printer type
  async getPrinter(): Promise<Printer> {
    try {
      const [printerState, jobState] = await Promise.all([
        this.getPrinterState(),
        this.getJobState(),
      ]);

      const status = printerState.state.flags.printing
        ? 'printing'
        : printerState.state.flags.error
        ? 'error'
        : printerState.state.flags.operational
        ? 'online'
        : 'offline';

      let currentJob: PrintJob | undefined;
      if (printerState.state.flags.printing && jobState.job) {
        currentJob = {
          id: `octo_${Date.now()}`,
          modelId: '',
          printerId: 'octoprint-main',
          status: 'printing',
          progress: jobState.progress.completion ?? 0,
          fileName: jobState.job.file.name,
          estimatedTime: jobState.job.estimatedPrintTime,
        };
      }

      return {
        id: 'octoprint-main',
        name: 'CR-10 Smart (OctoPrint)',
        type: 'octoprint',
        status,
        buildVolume: { length: 300, width: 300, height: 400 },
        temperature: {
          hotend: Math.round(printerState.temperature.tool0?.actual ?? 0),
          bed: Math.round(printerState.temperature.bed?.actual ?? 0),
        },
        currentJob,
        apiUrl: this.config.apiUrl,
      };
    } catch (error) {
      // Return offline status if we can't connect
      return {
        id: 'octoprint-main',
        name: 'CR-10 Smart (OctoPrint)',
        type: 'octoprint',
        status: 'offline',
        buildVolume: { length: 300, width: 300, height: 400 },
        apiUrl: this.config.apiUrl,
      };
    }
  }
}

// Factory function to create client from environment variables
export function createOctoPrintClient(): OctoPrintClient | null {
  const apiUrl = process.env.OCTOPRINT_URL;
  const apiKey = process.env.OCTOPRINT_API_KEY;

  if (!apiUrl || !apiKey) {
    return null;
  }

  return new OctoPrintClient({ apiUrl, apiKey });
}
