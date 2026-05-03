import type { EnclosureTemplate } from './types';

export const enclosureTemplates: EnclosureTemplate[] = [
  {
    id: 'basic-box',
    name: 'Basic Box',
    description: 'Simple rectangular enclosure with snap-fit or screw-on lid. Perfect for general electronics projects.',
    category: 'basic',
    thumbnail: '/templates/basic-box.png',
    defaultParameters: {
      innerDimensions: { length: 100, width: 60, height: 30 },
      wallThickness: 2.5,
      cornerRadius: 3,
      lidType: 'snap',
      lidOverlap: 2,
      standoffHeight: 0,
      mountingHoles: [],
      portCutouts: [],
      ventilation: { type: 'none', area: 'all', density: 'medium' },
      printOrientation: 'lid-up',
      supportRequired: false,
    },
    constraints: {
      minDimensions: { length: 20, width: 20, height: 10 },
      maxDimensions: { length: 300, width: 300, height: 400 },
      minWallThickness: 1.2,
      maxWallThickness: 6,
    },
    tags: ['simple', 'beginner', 'snap-fit'],
  },
  {
    id: 'electronics-enclosure',
    name: 'Electronics Enclosure',
    description: 'Ventilated enclosure with PCB standoffs, cable routing channels, and optional display cutout.',
    category: 'electronics',
    thumbnail: '/templates/electronics-enclosure.png',
    defaultParameters: {
      innerDimensions: { length: 120, width: 80, height: 40 },
      wallThickness: 2.5,
      cornerRadius: 4,
      lidType: 'screw',
      lidOverlap: 3,
      standoffHeight: 5,
      mountingHoles: [
        { x: 10, y: 10, diameter: 3, type: 'standoff' },
        { x: 110, y: 10, diameter: 3, type: 'standoff' },
        { x: 10, y: 70, diameter: 3, type: 'standoff' },
        { x: 110, y: 70, diameter: 3, type: 'standoff' },
      ],
      portCutouts: [
        { x: 0, y: 20, width: 12, height: 8, wall: 'back', type: 'usb' },
        { x: 0, y: 10, width: 10, height: 10, wall: 'back', type: 'power' },
      ],
      ventilation: { type: 'slots', area: 'sides', density: 'medium' },
      printOrientation: 'lid-up',
      supportRequired: false,
    },
    constraints: {
      minDimensions: { length: 40, width: 30, height: 15 },
      maxDimensions: { length: 300, width: 300, height: 400 },
      minWallThickness: 1.5,
      maxWallThickness: 5,
    },
    tags: ['electronics', 'ventilated', 'standoffs', 'cable-routing'],
  },
  {
    id: 'pcb-case',
    name: 'PCB Case',
    description: 'Precision enclosure designed around PCB specifications with exact mounting holes and connector cutouts.',
    category: 'pcb',
    thumbnail: '/templates/pcb-case.png',
    defaultParameters: {
      innerDimensions: { length: 100, width: 70, height: 35 },
      wallThickness: 2,
      cornerRadius: 2,
      lidType: 'screw',
      lidOverlap: 2.5,
      standoffHeight: 4,
      mountingHoles: [],
      portCutouts: [],
      ventilation: { type: 'honeycomb', area: 'top', density: 'low' },
      printOrientation: 'lid-up',
      supportRequired: true,
    },
    constraints: {
      minDimensions: { length: 20, width: 15, height: 10 },
      maxDimensions: { length: 300, width: 300, height: 400 },
      minWallThickness: 1.2,
      maxWallThickness: 4,
    },
    tags: ['pcb', 'precision', 'custom-cutouts'],
  },
  {
    id: 'handheld-device',
    name: 'Handheld Device',
    description: 'Ergonomic handheld enclosure with rounded edges, battery compartment, and button cutouts.',
    category: 'handheld',
    thumbnail: '/templates/handheld-device.png',
    defaultParameters: {
      innerDimensions: { length: 140, width: 70, height: 25 },
      wallThickness: 2.5,
      cornerRadius: 8,
      lidType: 'screw',
      lidOverlap: 3,
      standoffHeight: 3,
      mountingHoles: [],
      portCutouts: [],
      ventilation: { type: 'none', area: 'all', density: 'medium' },
      printOrientation: 'side',
      supportRequired: true,
    },
    constraints: {
      minDimensions: { length: 60, width: 40, height: 15 },
      maxDimensions: { length: 200, width: 120, height: 50 },
      minWallThickness: 2,
      maxWallThickness: 5,
    },
    tags: ['handheld', 'ergonomic', 'portable', 'battery'],
  },
  {
    id: 'wall-mount',
    name: 'Wall Mount Enclosure',
    description: 'Enclosure with integrated wall mounting brackets, keyhole slots, or DIN rail adapter.',
    category: 'wall-mount',
    thumbnail: '/templates/wall-mount.png',
    defaultParameters: {
      innerDimensions: { length: 150, width: 100, height: 50 },
      wallThickness: 3,
      cornerRadius: 3,
      lidType: 'screw',
      lidOverlap: 3,
      standoffHeight: 5,
      mountingHoles: [
        { x: 20, y: 0, diameter: 5, type: 'through' },
        { x: 130, y: 0, diameter: 5, type: 'through' },
      ],
      portCutouts: [],
      ventilation: { type: 'slots', area: 'bottom', density: 'medium' },
      printOrientation: 'lid-down',
      supportRequired: false,
    },
    constraints: {
      minDimensions: { length: 60, width: 40, height: 25 },
      maxDimensions: { length: 300, width: 300, height: 150 },
      minWallThickness: 2.5,
      maxWallThickness: 6,
    },
    tags: ['wall-mount', 'bracket', 'industrial'],
  },
  {
    id: 'raspberry-pi-case',
    name: 'Raspberry Pi Case',
    description: 'Pre-configured case for Raspberry Pi boards with GPIO access, camera slot, and proper ventilation.',
    category: 'pcb',
    thumbnail: '/templates/raspberry-pi-case.png',
    defaultParameters: {
      innerDimensions: { length: 90, width: 65, height: 30 },
      wallThickness: 2,
      cornerRadius: 3,
      lidType: 'snap',
      lidOverlap: 2,
      standoffHeight: 3,
      mountingHoles: [
        { x: 3.5, y: 3.5, diameter: 2.75, type: 'standoff' },
        { x: 61.5, y: 3.5, diameter: 2.75, type: 'standoff' },
        { x: 3.5, y: 52.5, diameter: 2.75, type: 'standoff' },
        { x: 61.5, y: 52.5, diameter: 2.75, type: 'standoff' },
      ],
      portCutouts: [
        { x: 0, y: 10, width: 15, height: 6, wall: 'left', type: 'usb', label: 'USB-C Power' },
        { x: 0, y: 25, width: 15, height: 16, wall: 'left', type: 'hdmi', label: 'Micro HDMI' },
        { x: 0, y: 15, width: 18, height: 14, wall: 'front', type: 'usb', label: 'USB 3.0' },
        { x: 0, y: 5, width: 16, height: 14, wall: 'front', type: 'ethernet' },
      ],
      ventilation: { type: 'slots', area: 'top', density: 'high' },
      printOrientation: 'lid-up',
      supportRequired: true,
    },
    constraints: {
      minDimensions: { length: 85, width: 56, height: 20 },
      maxDimensions: { length: 120, width: 90, height: 60 },
      minWallThickness: 1.5,
      maxWallThickness: 4,
    },
    tags: ['raspberry-pi', 'sbc', 'gpio', 'pre-configured'],
  },
];

export function getTemplateById(id: string): EnclosureTemplate | undefined {
  return enclosureTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: EnclosureTemplate['category']): EnclosureTemplate[] {
  return enclosureTemplates.filter(t => t.category === category);
}

export function searchTemplates(query: string): EnclosureTemplate[] {
  const lowerQuery = query.toLowerCase();
  return enclosureTemplates.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
