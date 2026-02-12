import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';
import type { SourceExtractParams } from 'graphor/resources/sources';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['extraction', 'structured-data'],
    httpMethod: 'post',
    httpPath: '/sources/run-extraction',
  },
  tool: {
    name: 'extract',
    description:
      'Run a structured data extraction against one or more sources. ' +
      'Provide a user_instruction describing what to extract and an output_schema (JSON Schema) ' +
      'defining the desired output shape. Returns structured_output validated against the schema.',
    inputSchema: {
      type: 'object',
      properties: {
        user_instruction: {
          type: 'string',
          description: 'Natural-language instruction guiding what information to extract.',
        },
        output_schema: {
          type: 'object',
          description: 'JSON Schema describing the desired structured output shape.',
        },
        file_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of source file IDs to extract from.',
        },
        file_names: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of source file names to extract from.',
        },
        thinking_level: {
          type: 'string',
          enum: ['fast', 'balanced', 'accurate'],
          description:
            "Controls model and thinking budget: 'fast' (cheapest/fastest), 'balanced', or 'accurate' (most thorough).",
        },
      },
      required: ['user_instruction', 'output_schema'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const params: SourceExtractParams = {
      user_instruction: args.user_instruction as string,
      output_schema: args.output_schema as Record<string, unknown>,
      ...(args.file_ids != null && { file_ids: args.file_ids as string[] }),
      ...(args.file_names != null && { file_names: args.file_names as string[] }),
      ...(args.thinking_level != null && {
        thinking_level: args.thinking_level as 'fast' | 'balanced' | 'accurate',
      }),
    };

    const result = await client.sources.extract(params);
    return asTextContentResult(result);
  },
};

export default tool;
