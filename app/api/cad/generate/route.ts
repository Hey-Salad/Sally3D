import { NextResponse } from 'next/server';
import {
  createJscadModelResult,
  generateEnclosureStl,
} from '@/lib/cad/jscad-enclosure';
import type { EnclosureParameters } from '@/lib/templates/types';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const params = (await req.json()) as EnclosureParameters & { modelId?: string };
    const modelId = params.modelId || `jscad_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const { modelId: _ignored, ...enclosureParams } = params;
    const result = createJscadModelResult(modelId, enclosureParams as EnclosureParameters);

    return NextResponse.json({
      ...result,
      preview: {
        baseBytes: Buffer.byteLength(generateEnclosureStl(enclosureParams as EnclosureParameters, 'base'), 'utf8'),
        lidBytes: Buffer.byteLength(generateEnclosureStl(enclosureParams as EnclosureParameters, 'lid'), 'utf8'),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate CAD model' },
      { status: 500 }
    );
  }
}
