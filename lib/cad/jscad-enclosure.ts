import modeling from '@jscad/modeling';
import stlSerializer from '@jscad/stl-serializer';
import type { EnclosureParameters } from '@/lib/templates/types';

type Geometry = unknown;

export type EnclosurePart = 'base' | 'lid';

export interface JscadModelFileUrls {
  base: string;
  lid: string;
}

export interface JscadGenerateResult {
  success: true;
  modelId: string;
  files: JscadModelFileUrls;
  engine: 'jscad';
}

const { booleans, primitives, transforms } = modeling;
const { cuboid, cylinder } = primitives;
const { subtract, union } = booleans;
const { translate } = transforms;
const { serialize } = stlSerializer;

const LID_HEIGHT = 5;
const LID_CLEARANCE = 0.4;

export function encodeEnclosureParams(params: EnclosureParameters): string {
  return Buffer.from(JSON.stringify(params), 'utf8').toString('base64url');
}

export function decodeEnclosureParams(encoded: string): EnclosureParameters {
  return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as EnclosureParameters;
}

export function createJscadDownloadUrls(params: EnclosureParameters): JscadModelFileUrls {
  const encoded = encodeEnclosureParams(params);
  return {
    base: `/api/cad/stl/base?p=${encoded}`,
    lid: `/api/cad/stl/lid?p=${encoded}`,
  };
}

export function createJscadModelResult(modelId: string, params: EnclosureParameters): JscadGenerateResult {
  return {
    success: true,
    modelId,
    files: createJscadDownloadUrls(params),
    engine: 'jscad',
  };
}

export function generateEnclosureStl(params: EnclosureParameters, part: EnclosurePart): string {
  const geometry = part === 'base' ? createBase(params) : createLid(params);
  const serialized = serialize({ binary: false }, geometry);
  return serialized.join('');
}

function createBase(params: EnclosureParameters): Geometry {
  const { innerDimensions: inner, wallThickness: wall, cornerRadius } = params;
  const outerLength = inner.length + wall * 2;
  const outerWidth = inner.width + wall * 2;
  const baseHeight = inner.height + wall;

  const outer = cuboid({
    size: [outerLength, outerWidth, baseHeight],
    center: [0, 0, baseHeight / 2],
  });

  const cavity = cuboid({
    size: [inner.length, inner.width, inner.height + LID_HEIGHT * 2],
    center: [0, 0, wall + inner.height / 2 + LID_HEIGHT],
  });

  let base = subtract(outer, cavity);

  const standoffs = (params.mountingHoles || [])
    .filter((hole) => hole.type === 'standoff' || hole.type === 'threaded')
    .map((hole) => {
      const x = hole.x - inner.length / 2;
      const y = hole.y - inner.width / 2;
      const height = Math.max(params.standoffHeight || 4, wall);
      const post = cylinder({
        radius: hole.diameter / 2 + 1.25,
        height,
        segments: 32,
        center: [x, y, wall + height / 2],
      });
      const bore = cylinder({
        radius: hole.diameter / 2,
        height: height + 1,
        segments: 32,
        center: [x, y, wall + height / 2],
      });
      return subtract(post, bore);
    });

  if (standoffs.length > 0) {
    base = union(base, ...standoffs);
  }

  const portCutouts = (params.portCutouts || [])
    .filter((port) => port.wall === 'front' || port.wall === 'back' || port.wall === 'left' || port.wall === 'right')
    .map((port) => {
      const z = wall + port.y + port.height / 2;

      if (port.wall === 'front' || port.wall === 'back') {
        const y = port.wall === 'front' ? -outerWidth / 2 : outerWidth / 2;
        return cuboid({
          size: [port.width, wall * 4, port.height],
          center: [port.x - inner.length / 2, y, z],
        });
      }

      const x = port.wall === 'left' ? -outerLength / 2 : outerLength / 2;
      return cuboid({
        size: [wall * 4, port.width, port.height],
        center: [x, port.x - inner.width / 2, z],
      });
    });

  if (portCutouts.length > 0) {
    base = subtract(base, ...portCutouts);
  }

  if (cornerRadius > 0) {
    return base;
  }

  return base;
}

function createLid(params: EnclosureParameters): Geometry {
  const { innerDimensions: inner, wallThickness: wall } = params;
  const outerLength = inner.length + wall * 2;
  const outerWidth = inner.width + wall * 2;

  let lid = cuboid({
    size: [outerLength, outerWidth, LID_HEIGHT],
    center: [0, 0, LID_HEIGHT / 2],
  });

  if (params.lidType === 'snap' || params.lidType === 'slide') {
    const lipHeight = Math.max(params.lidOverlap || 2, 1);
    const lip = cuboid({
      size: [
        Math.max(inner.length - LID_CLEARANCE, 1),
        Math.max(inner.width - LID_CLEARANCE, 1),
        lipHeight,
      ],
      center: [0, 0, -lipHeight / 2],
    });
    lid = union(lid, lip);
  }

  if (params.lidType === 'screw') {
    const screwInset = Math.max(wall + 3, 5);
    const holes = [
      [outerLength / 2 - screwInset, outerWidth / 2 - screwInset],
      [outerLength / 2 - screwInset, -outerWidth / 2 + screwInset],
      [-outerLength / 2 + screwInset, outerWidth / 2 - screwInset],
      [-outerLength / 2 + screwInset, -outerWidth / 2 + screwInset],
    ].map(([x, y]) =>
      cylinder({
        radius: 1.6,
        height: LID_HEIGHT + 2,
        segments: 32,
        center: [x, y, LID_HEIGHT / 2],
      })
    );
    lid = subtract(lid, ...holes);
  }

  if (params.ventilation?.type === 'slots' || params.ventilation?.type === 'honeycomb') {
    const slotSpacing = params.ventilation.density === 'high' ? 5 : params.ventilation.density === 'low' ? 10 : 7;
    const slotWidth = params.ventilation.type === 'honeycomb' ? 3 : 2;
    const usableLength = Math.max(inner.length - 20, 0);
    const count = Math.max(Math.floor(usableLength / slotSpacing), 0);
    const slots = Array.from({ length: count }, (_, index) => {
      const x = -usableLength / 2 + index * slotSpacing;
      const raw = cuboid({
        size: [slotWidth, Math.max(inner.width - 16, 4), LID_HEIGHT + 2],
        center: [x, 0, LID_HEIGHT / 2],
      });
      return params.ventilation.type === 'honeycomb' && index % 2
        ? translate([0, slotSpacing / 3, 0], raw)
        : raw;
    });

    if (slots.length > 0) {
      lid = subtract(lid, ...slots);
    }
  }

  return lid;
}
