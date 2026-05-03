import { 
  streamText, 
  tool, 
  convertToModelMessages, 
  stepCountIs,
  UIMessage,
  InferUITools,
  UIDataTypes
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { enclosureTemplates, getTemplateById } from '@/lib/templates/enclosure-templates';
import type { EnclosureParameters } from '@/lib/templates/types';

export const maxDuration = 60;

// Schema definitions for tool parameters
const DimensionsSchema = z.object({
  length: z.number().min(10).max(300).describe('Length in mm'),
  width: z.number().min(10).max(300).describe('Width in mm'),
  height: z.number().min(5).max(400).describe('Height in mm'),
});

const MountingHoleSchema = z.object({
  x: z.number().describe('X position from origin in mm'),
  y: z.number().describe('Y position from origin in mm'),
  diameter: z.number().min(1).max(10).describe('Hole diameter in mm'),
  type: z.enum(['through', 'standoff', 'threaded']),
});

const PortCutoutSchema = z.object({
  x: z.number().describe('X position on wall in mm'),
  y: z.number().describe('Y position on wall in mm'),
  width: z.number().describe('Cutout width in mm'),
  height: z.number().describe('Cutout height in mm'),
  wall: z.enum(['front', 'back', 'left', 'right', 'top', 'bottom']),
  type: z.enum(['usb', 'hdmi', 'power', 'ethernet', 'custom']),
  label: z.string().nullable(),
});

// Tool definitions
const tools = {
  generate_enclosure: tool({
    description: 'Generate a 3D enclosure based on specified parameters or a template. Use this to create custom enclosures or modify existing templates.',
    inputSchema: z.object({
      templateId: z.string().nullable().describe('Template ID to use as base (basic-box, electronics-enclosure, pcb-case, handheld-device, wall-mount, raspberry-pi-case)'),
      innerDimensions: DimensionsSchema.describe('Internal dimensions of the enclosure'),
      wallThickness: z.number().min(1).max(6).default(2.5).describe('Wall thickness in mm'),
      cornerRadius: z.number().min(0).max(20).default(3).describe('Corner radius in mm'),
      lidType: z.enum(['snap', 'screw', 'slide', 'none']).default('snap').describe('Type of lid attachment'),
      mountingHoles: z.array(MountingHoleSchema).nullable().describe('PCB or component mounting holes'),
      portCutouts: z.array(PortCutoutSchema).nullable().describe('Connector and port cutouts'),
      ventilation: z.object({
        type: z.enum(['slots', 'honeycomb', 'circular', 'none']).default('none'),
        area: z.enum(['top', 'bottom', 'sides', 'all']).default('sides'),
        density: z.enum(['low', 'medium', 'high']).default('medium'),
      }).nullable(),
      textEmboss: z.object({
        text: z.string(),
        position: z.enum(['top', 'front', 'back']),
        fontSize: z.number().default(8),
        depth: z.number().default(0.5),
      }).nullable(),
    }),
    execute: async (params) => {
      let baseParams: Partial<EnclosureParameters> = {};
      if (params.templateId) {
        const template = getTemplateById(params.templateId);
        if (template) {
          baseParams = { ...template.defaultParameters };
        }
      }

      const finalParams: EnclosureParameters = {
        ...baseParams,
        innerDimensions: params.innerDimensions,
        wallThickness: params.wallThickness,
        cornerRadius: params.cornerRadius,
        lidType: params.lidType,
        lidOverlap: baseParams.lidOverlap ?? 2,
        mountingHoles: params.mountingHoles ?? [],
        standoffHeight: baseParams.standoffHeight ?? 4,
        portCutouts: params.portCutouts ?? [],
        ventilation: params.ventilation ?? { type: 'none', area: 'all', density: 'medium' },
        textEmboss: params.textEmboss ?? undefined,
        printOrientation: baseParams.printOrientation ?? 'lid-up',
        supportRequired: baseParams.supportRequired ?? false,
      };

      const modelId = `enc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const outerDimensions = {
        length: finalParams.innerDimensions.length + (finalParams.wallThickness * 2),
        width: finalParams.innerDimensions.width + (finalParams.wallThickness * 2),
        height: finalParams.innerDimensions.height + finalParams.wallThickness + 5,
      };

      return {
        success: true,
        modelId,
        parameters: finalParams,
        outerDimensions,
        summary: `Generated ${params.templateId || 'custom'} enclosure: ${outerDimensions.length}x${outerDimensions.width}x${outerDimensions.height}mm (outer). Wall thickness: ${finalParams.wallThickness}mm, ${finalParams.lidType} lid, ${finalParams.mountingHoles?.length ?? 0} mounting holes, ${finalParams.portCutouts?.length ?? 0} port cutouts.`,
        cadServiceRequired: true,
        message: 'Enclosure design created. The 3D model preview will appear in the viewer. You can modify parameters or send to printer when ready.',
      };
    },
  }),

  generate_pcb_enclosure: tool({
    description: 'Generate an enclosure specifically designed to fit a PCB with automatic standoff placement and connector cutouts.',
    inputSchema: z.object({
      pcbName: z.string().describe('Name or description of the PCB'),
      pcbDimensions: DimensionsSchema.describe('PCB dimensions (length x width x component height)'),
      mountingHoles: z.array(MountingHoleSchema).describe('PCB mounting hole positions'),
      connectors: z.array(PortCutoutSchema).nullable().describe('Connector positions for cutouts'),
      clearanceTop: z.number().default(10).describe('Clearance above tallest component in mm'),
      clearanceBottom: z.number().default(3).describe('Clearance below PCB for wiring in mm'),
      wallThickness: z.number().default(2).describe('Wall thickness in mm'),
      lidType: z.enum(['snap', 'screw', 'slide']).default('screw'),
    }),
    execute: async (params) => {
      const modelId = `pcb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const wallClearance = 2;
      const innerDimensions = {
        length: params.pcbDimensions.length + (wallClearance * 2),
        width: params.pcbDimensions.width + (wallClearance * 2),
        height: params.pcbDimensions.height + params.clearanceTop + params.clearanceBottom + 4,
      };

      const outerDimensions = {
        length: innerDimensions.length + (params.wallThickness * 2),
        width: innerDimensions.width + (params.wallThickness * 2),
        height: innerDimensions.height + params.wallThickness + 5,
      };

      const standoffs = params.mountingHoles.map(hole => ({
        ...hole,
        x: hole.x + wallClearance,
        y: hole.y + wallClearance,
        type: 'standoff' as const,
      }));

      const portCutouts = (params.connectors ?? []).map(conn => ({
        ...conn,
        y: conn.y + params.clearanceBottom + 4,
      }));

      const enclosureParams: EnclosureParameters = {
        innerDimensions,
        wallThickness: params.wallThickness,
        cornerRadius: 2,
        lidType: params.lidType,
        lidOverlap: 2.5,
        mountingHoles: standoffs,
        standoffHeight: 4,
        portCutouts,
        ventilation: { type: 'honeycomb', area: 'top', density: 'low' },
        printOrientation: 'lid-up',
        supportRequired: true,
      };

      return {
        success: true,
        modelId,
        pcbName: params.pcbName,
        pcbDimensions: params.pcbDimensions,
        enclosureParameters: enclosureParams,
        outerDimensions,
        standoffPositions: standoffs,
        summary: `Generated PCB enclosure for "${params.pcbName}": ${outerDimensions.length}x${outerDimensions.width}x${outerDimensions.height}mm (outer). Includes ${standoffs.length} standoffs at 4mm height and ${portCutouts.length} connector cutouts.`,
        recommendations: [
          `PCB clearance: ${wallClearance}mm on each side`,
          `Top clearance: ${params.clearanceTop}mm above components`,
          `Bottom clearance: ${params.clearanceBottom}mm for wiring`,
          standoffs.length < 4 ? 'Consider adding more mounting points for stability' : 'Good mounting point coverage',
        ],
        message: 'PCB enclosure designed. Preview will show in the 3D viewer with PCB placement indicators.',
      };
    },
  }),

  list_templates: tool({
    description: 'List available enclosure templates with their descriptions and default parameters.',
    inputSchema: z.object({
      category: z.enum(['basic', 'electronics', 'pcb', 'handheld', 'wall-mount', 'din-rail', 'all']).default('all'),
    }),
    execute: async (params) => {
      const templates = params.category === 'all' 
        ? enclosureTemplates 
        : enclosureTemplates.filter(t => t.category === params.category);

      return {
        templates: templates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          tags: t.tags,
          defaultDimensions: t.defaultParameters.innerDimensions,
        })),
        count: templates.length,
      };
    },
  }),

  analyze_print_settings: tool({
    description: 'Analyze an enclosure design and recommend optimal 3D print settings.',
    inputSchema: z.object({
      modelId: z.string().describe('ID of the model to analyze'),
      material: z.enum(['PLA', 'PETG', 'ABS', 'TPU']).default('PLA'),
    }),
    execute: async (params) => {
      const recommendations = {
        material: params.material,
        layerHeight: params.material === 'TPU' ? 0.2 : 0.16,
        infill: params.material === 'ABS' ? 25 : 20,
        wallLoops: 3,
        topLayers: 5,
        bottomLayers: 4,
        printSpeed: params.material === 'ABS' ? 50 : 60,
        bedTemp: params.material === 'PLA' ? 60 : params.material === 'PETG' ? 70 : params.material === 'ABS' ? 100 : 50,
        nozzleTemp: params.material === 'PLA' ? 210 : params.material === 'PETG' ? 240 : params.material === 'ABS' ? 250 : 230,
        supports: true,
        brim: true,
        orientation: 'Lid facing up for best surface quality on visible faces',
        estimatedTime: '3-5 hours depending on size',
        notes: [
          params.material === 'ABS' ? 'Ensure enclosure is used on printer to prevent warping' : null,
          'Consider printing lid and base separately for large enclosures',
          'Use 100% infill for standoffs and mounting points',
        ].filter(Boolean),
      };

      return {
        success: true,
        modelId: params.modelId,
        printerCompatible: true,
        recommendations,
        message: `Recommended settings for ${params.material}: ${recommendations.layerHeight}mm layers, ${recommendations.infill}% infill, ${recommendations.nozzleTemp}°C nozzle temp. ${recommendations.orientation}`,
      };
    },
  }),

  send_to_printer: tool({
    description: 'Queue a model for 3D printing. Requires the CAD service to generate G-code first.',
    inputSchema: z.object({
      modelId: z.string().describe('ID of the model to print'),
      printerId: z.string().describe('ID of the target printer'),
      material: z.enum(['PLA', 'PETG', 'ABS', 'TPU']).default('PLA'),
      priority: z.enum(['low', 'normal', 'high']).default('normal'),
    }),
    execute: async (params) => {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        jobId,
        modelId: params.modelId,
        printerId: params.printerId,
        status: 'queued',
        message: `Print job ${jobId} queued for printer ${params.printerId}. The model will be sliced and sent to the printer. Check the printer status panel for progress.`,
        nextSteps: [
          'Ensure printer bed is clean and leveled',
          `Load ${params.material} filament if not already loaded`,
          'Monitor first layer adhesion',
        ],
      };
    },
  }),
} as const;

export type ChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>;

export async function POST(req: Request) {
  console.log('[v0] Chat API called');
  
  try {
    const { messages } = await req.json();
    console.log('[v0] Received messages:', messages.length);

    if (!process.env.OPENAI_API_KEY) {
      console.error('[v0] OPENAI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = streamText({
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(5),
    });

    console.log('[v0] Streaming response');
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[v0] Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
