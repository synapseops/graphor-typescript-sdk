import { McpTool, asTextContentResult, asErrorResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['parse', 'reprocess'],
    httpMethod: 'post',
    httpPath: '/sources/process',
  },
  tool: {
    name: 'parse',
    description:
      'Re-process (re-parse) an existing source with a different partitioning strategy. ' +
      'Useful for changing how a document is segmented after initial upload. ' +
      'Provide file_id (preferred) or file_name.',
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'Unique identifier for the source (preferred).',
        },
        file_name: {
          type: 'string',
          description: 'The display name of the file to re-process.',
        },
        partition_method: {
          type: 'string',
          enum: ['basic', 'hi_res', 'hi_res_ft', 'mai', 'graphorlm'],
          description:
            'The partitioning strategy to apply.\n' +
            '- "basic" (Fast) — Fastest, rule-based partitioning with minimal overhead.\n' +
            '- "hi_res" (Balanced) — Balanced speed and accuracy using layout-aware parsing.\n' +
            '- "hi_res_ft" (Accurate) — High-accuracy parsing with fine-tuned models.\n' +
            '- "mai" (VLM) — Vision-language model for complex visual documents.\n' +
            '- "graphorlm" (Agentic) — Agentic pipeline with the highest accuracy.',
        },
      },
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    if (args['file_id'] == null && args['file_name'] == null) {
      return asErrorResult('At least one of file_id or file_name must be provided.');
    }

    const params: Graphor.SourceParseParams = {
      ...(args['file_id'] != null && { file_id: args['file_id'] as string }),
      ...(args['file_name'] != null && { file_name: args['file_name'] as string }),
    };
    if (args['partition_method'] != null) {
      params.partition_method = args['partition_method'] as Graphor.PublicPartitionMethod;
    }

    const result = await client.sources.parse(params);
    return asTextContentResult(result);
  },
};

export default tool;
