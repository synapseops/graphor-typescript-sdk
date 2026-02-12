import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';
import type { SourceAskParams } from 'graphor/resources/sources';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['qa', 'chat'],
    httpMethod: 'post',
    httpPath: '/sources/ask-sources',
  },
  tool: {
    name: 'ask',
    description:
      'Ask a natural-language question grounded on the project\'s ingested sources. ' +
      'Supports conversation memory via conversation_id, scoping to specific files, ' +
      'and optional structured JSON output via output_schema.',
    inputSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'The natural-language question to ask about the sources.',
        },
        conversation_id: {
          type: 'string',
          description:
            'An existing conversation identifier to maintain context across multiple turns.',
        },
        reset: {
          type: 'boolean',
          description: 'When true, starts a new conversation discarding any previous history.',
        },
        file_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Restrict the search scope to specific source file IDs.',
        },
        file_names: {
          type: 'array',
          items: { type: 'string' },
          description: 'Restrict the search scope to specific source file names.',
        },
        output_schema: {
          type: 'object',
          description:
            'A JSON Schema for requesting structured output. When provided, the response includes structured_output.',
        },
        thinking_level: {
          type: 'string',
          enum: ['fast', 'balanced', 'accurate'],
          description:
            "Controls model and thinking budget: 'fast' (cheapest/fastest), 'balanced', or 'accurate' (most thorough).",
        },
      },
      required: ['question'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const params: SourceAskParams = {
      question: args.question as string,
      ...(args.conversation_id != null && { conversation_id: args.conversation_id as string }),
      ...(args.reset != null && { reset: args.reset as boolean }),
      ...(args.file_ids != null && { file_ids: args.file_ids as string[] }),
      ...(args.file_names != null && { file_names: args.file_names as string[] }),
      ...(args.output_schema != null && { output_schema: args.output_schema as Record<string, unknown> }),
      ...(args.thinking_level != null && {
        thinking_level: args.thinking_level as 'fast' | 'balanced' | 'accurate',
      }),
    };

    const result = await client.sources.ask(params);
    return asTextContentResult(result);
  },
};

export default tool;
