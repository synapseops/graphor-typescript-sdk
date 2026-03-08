import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['ingest', 'url', 'web'],
    httpMethod: 'post',
    httpPath: '/sources/ingest-url',
  },
  tool: {
    name: 'ingest_url',
    description:
      'Ingest a web page (or a set of crawled pages) as a source into the knowledge graph. ' +
      'Returns a build_id immediately — use get_build_status to poll until processing completes ' +
      'and obtain the file_id for subsequent calls.\n\n' +
      'If the URL points directly to a downloadable file (detected via URL path extension or HTTP Content-Type), ' +
      'the file is downloaded and then processed in the background.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The web page URL to ingest.',
        },
        crawlUrls: {
          type: 'boolean',
          description:
            'When true, also follows and ingests links found on the page. ' +
            'Ignored when the URL resolves to a file.',
        },
        method: {
          type: 'string',
          enum: ['fast', 'balanced', 'accurate', 'vlm', 'agentic'],
          description:
            'The partitioning strategy to apply. When omitted, the system default is used.\n' +
            '- "fast" — Fastest, rule-based partitioning with minimal overhead.\n' +
            '- "balanced" — Balanced speed and accuracy using layout-aware parsing.\n' +
            '- "accurate" — High-accuracy parsing with fine-tuned models.\n' +
            '- "vlm" — Vision-language model for complex visual documents.\n' +
            '- "agentic" — Agentic pipeline with the highest accuracy.',
        },
      },
      required: ['url'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const params: Graphor.SourceIngestURLParams = {
      url: args['url'] as string,
      ...(args['crawlUrls'] != null && { crawlUrls: args['crawlUrls'] as boolean }),
    };
    if (args['method'] != null) {
      params.method = args['method'] as Graphor.Method;
    }

    const result = await client.sources.ingestURL(params);
    return asTextContentResult(result);
  },
};

export default tool;
