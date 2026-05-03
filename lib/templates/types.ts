// Enclosure template types and parameter definitions

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface MountingHole {
  x: number;
  y: number;
  diameter: number;
  type: 'through' | 'standoff' | 'threaded';
}

export interface PortCutout {
  x: number;
  y: number;
  width: number;
  height: number;
  wall: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  type: 'usb' | 'hdmi' | 'power' | 'ethernet' | 'custom';
  label?: string;
}

export interface VentilationPattern {
  type: 'slots' | 'honeycomb' | 'circular' | 'none';
  area: 'top' | 'bottom' | 'sides' | 'all';
  density: 'low' | 'medium' | 'high';
}

export interface EnclosureParameters {
  // Basic dimensions
  innerDimensions: Dimensions;
  wallThickness: number;
  cornerRadius: number;
  
  // Lid configuration
  lidType: 'snap' | 'screw' | 'slide' | 'none';
  lidOverlap: number;
  
  // Mounting
  mountingHoles: MountingHole[];
  standoffHeight: number;
  
  // Ports and cutouts
  portCutouts: PortCutout[];
  
  // Ventilation
  ventilation: VentilationPattern;
  
  // Additional features
  textEmboss?: {
    text: string;
    position: 'top' | 'front' | 'back';
    fontSize: number;
    depth: number;
  };
  
  // Material considerations
  printOrientation: 'lid-up' | 'lid-down' | 'side';
  supportRequired: boolean;
}

export interface PCBSpecification {
  name: string;
  dimensions: {
    length: number;
    width: number;
    height: number; // component height
  };
  mountingHoles: MountingHole[];
  connectors: PortCutout[];
  clearanceTop: number;
  clearanceBottom: number;
}

export interface EnclosureTemplate {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'electronics' | 'pcb' | 'handheld' | 'wall-mount' | 'din-rail';
  thumbnail: string;
  defaultParameters: Partial<EnclosureParameters>;
  constraints: {
    minDimensions: Dimensions;
    maxDimensions: Dimensions;
    minWallThickness: number;
    maxWallThickness: number;
  };
  tags: string[];
}

export interface GeneratedModel {
  id: string;
  templateId: string;
  parameters: EnclosureParameters;
  cadQueryCode: string;
  stlUrl?: string;
  stepUrl?: string;
  createdAt: Date;
  status: 'generating' | 'ready' | 'error';
  errorMessage?: string;
}

export interface PrintJob {
  id: string;
  modelId: string;
  printerId: string;
  status: 'queued' | 'preparing' | 'printing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTime?: number;
  fileName: string;
}

export interface Printer {
  id: string;
  name: string;
  type: 'octoprint' | 'creality-cloud' | 'direct';
  status: 'online' | 'offline' | 'printing' | 'error';
  buildVolume: Dimensions;
  currentJob?: PrintJob;
  temperature?: {
    hotend: number;
    bed: number;
  };
  apiUrl?: string;
}
