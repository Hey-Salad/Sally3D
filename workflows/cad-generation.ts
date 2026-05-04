import {
  createJscadModelResult,
  generateEnclosureStl,
} from '@/lib/cad/jscad-enclosure';
import type { EnclosureParameters } from '@/lib/templates/types';

export interface CadGenerationWorkflowInput extends EnclosureParameters {
  modelId?: string;
}

export interface CadGenerationWorkflowResult {
  success: true;
  modelId: string;
  engine: 'jscad';
  files: {
    base: string;
    lid: string;
  };
  preview: {
    baseBytes: number;
    lidBytes: number;
  };
}

export async function generateCadAssetsWorkflow(
  input: CadGenerationWorkflowInput
): Promise<CadGenerationWorkflowResult> {
  'use workflow';

  const normalized = await normalizeCadGenerationInput(input);
  const preview = await renderCadPreview(normalized.params);
  const model = await createCadModelMetadata(normalized.modelId, normalized.params);

  return {
    ...model,
    preview,
  };
}

async function normalizeCadGenerationInput(input: CadGenerationWorkflowInput) {
  'use step';

  const { modelId, ...params } = input;

  return {
    modelId: modelId || `jscad_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    params: params as EnclosureParameters,
  };
}

async function renderCadPreview(params: EnclosureParameters) {
  'use step';

  const base = generateEnclosureStl(params, 'base');
  const lid = generateEnclosureStl(params, 'lid');

  return {
    baseBytes: Buffer.byteLength(base, 'utf8'),
    lidBytes: Buffer.byteLength(lid, 'utf8'),
  };
}

async function createCadModelMetadata(modelId: string, params: EnclosureParameters) {
  'use step';

  return createJscadModelResult(modelId, params);
}
