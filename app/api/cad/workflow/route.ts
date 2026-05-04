import { NextResponse } from 'next/server';
import { getRun, start } from 'workflow/api';
import {
  generateCadAssetsWorkflow,
  type CadGenerationWorkflowInput,
  type CadGenerationWorkflowResult,
} from '@/workflows/cad-generation';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const input = (await req.json()) as CadGenerationWorkflowInput;
    const run = await start(generateCadAssetsWorkflow, [input]);

    return NextResponse.json({
      success: true,
      runId: run.runId,
      status: await run.status,
      message: 'CAD generation workflow started',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start CAD generation workflow',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const runId = new URL(req.url).searchParams.get('runId');

    if (!runId) {
      return NextResponse.json(
        { success: false, error: 'Missing runId query parameter' },
        { status: 400 }
      );
    }

    const run = getRun<CadGenerationWorkflowResult>(runId);
    const status = await run.status;

    if (status === 'completed') {
      return NextResponse.json({
        success: true,
        runId,
        status,
        result: await run.returnValue,
      });
    }

    return NextResponse.json({
      success: true,
      runId,
      status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read CAD generation workflow',
      },
      { status: 500 }
    );
  }
}
