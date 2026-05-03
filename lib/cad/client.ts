/**
 * CAD Service Client
 * Connects to the CadQuery Python service running on Mac Mini/Raspberry Pi
 */

const CAD_SERVICE_URL = process.env.NEXT_PUBLIC_CAD_SERVICE_URL || process.env.CAD_SERVICE_URL;

export interface EnclosureParams {
  modelId?: string;
  innerDimensions: { length: number; width: number; height: number };
  wallThickness: number;
  cornerRadius: number;
  lidType: 'snap' | 'screw' | 'slide' | 'none';
  mountingHoles?: Array<{
    x: number;
    y: number;
    diameter: number;
    type: 'through' | 'standoff' | 'threaded';
  }>;
  portCutouts?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    wall: 'front' | 'back' | 'left' | 'right';
    type: string;
  }>;
  ventilation?: {
    type: 'slots' | 'honeycomb' | 'circular' | 'none';
    area: 'top' | 'bottom' | 'sides' | 'all';
    density: 'low' | 'medium' | 'high';
  };
  standoffHeight?: number;
}

export interface GenerateResponse {
  success: boolean;
  modelId: string;
  files: {
    base: string;
    lid: string;
  };
  error?: string;
}

export interface PreviewResponse {
  modelId: string;
  base: string; // base64 STL
  lid: string; // base64 STL
  params: EnclosureParams;
}

export class CADServiceClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || CAD_SERVICE_URL || '';
  }

  isConfigured(): boolean {
    return !!this.baseUrl;
  }

  async healthCheck(): Promise<{ status: string; cadquery_available: boolean }> {
    if (!this.baseUrl) {
      throw new Error('CAD service URL not configured');
    }

    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error('CAD service health check failed');
    }
    return response.json();
  }

  async generateEnclosure(params: EnclosureParams): Promise<GenerateResponse> {
    if (!this.baseUrl) {
      throw new Error('CAD service URL not configured. Set CAD_SERVICE_URL environment variable.');
    }

    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate enclosure');
    }

    return response.json();
  }

  async getPreview(modelId: string): Promise<PreviewResponse> {
    if (!this.baseUrl) {
      throw new Error('CAD service URL not configured');
    }

    const response = await fetch(`${this.baseUrl}/preview/${modelId}`);
    if (!response.ok) {
      throw new Error('Failed to get preview');
    }

    return response.json();
  }

  getDownloadUrl(modelId: string, part: 'base' | 'lid'): string {
    return `${this.baseUrl}/download/${modelId}/${part}`;
  }
}

// Singleton instance
export const cadClient = new CADServiceClient();
