import { McpTool, asTextContentResult, asErrorResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['reprocess', 'parse'],
    httpMethod: 'post',
    httpPath: '/sources/reprocess',
  },
  tool: {
    name: 'reprocess',
    description:
      'Re-process an existing source with a different partitioning strategy. ' +
      'Useful for changing how a document is segmented after initial ingestion.\n\n' +
      'Returns a build_id immediately — use get_build_status to poll until processing completes.',
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'Unique identifier of the source to re-process.',
        },
        method: {
          type: 'string',
          enum: ['fast', 'balanced', 'accurate', 'vlm', 'agentic'],
          description:
            'The partitioning strategy to apply. Defaults to "fast" when omitted.\n' +
            '- "fast" — Fastest, rule-based partitioning with minimal overhead.\n' +
            '- "balanced" — Balanced speed and accuracy using layout-aware parsing.\n' +
            '- "accurate" — High-accuracy parsing with fine-tuned models.\n' +
            '- "vlm" — Vision-language model for complex visual documents.\n' +
            '- "agentic" — Agentic pipeline with the highest accuracy.',
        },
      },
      required: ['file_id'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const fileId = args['file_id'] as string | undefined;
    if (!fileId) {
      return asErrorResult('file_id is required.');
    }

    const params: Graphor.SourceReprocessParams = { file_id: fileId };
    if (args['method'] != null) {
      params.method = args['method'] as Graphor.Method;
    }

    const result = await client.sources.reprocess(params);
    return asTextContentResult(result);
  },
};

export default tool;
