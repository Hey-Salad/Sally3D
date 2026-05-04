import { NextResponse } from 'next/server';
import {
  decodeEnclosureParams,
  generateEnclosureStl,
  type EnclosurePart,
} from '@/lib/cad/jscad-enclosure';

export const maxDuration = 30;

export async function GET(
  req: Request,
  context: { params: Promise<{ part: string }> }
) {
  try {
    const { part } = await context.params;
    if (part !== 'base' && part !== 'lid') {
      return NextResponse.json({ error: 'Invalid STL part' }, { status: 400 });
    }

    const url = new URL(req.url);
    const encoded = url.searchParams.get('p');
    if (!encoded) {
      return NextResponse.json({ error: 'Missing encoded enclosure parameters' }, { status: 400 });
    }

    const params = decodeEnclosureParams(encoded);
    const stl = generateEnclosureStl(params, part as EnclosurePart);
    const filename = `sally-${part}.stl`;

    return new Response(stl, {
      headers: {
        'Content-Type': 'model/stl; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate STL' },
      { status: 500 }
    );
  }
}
