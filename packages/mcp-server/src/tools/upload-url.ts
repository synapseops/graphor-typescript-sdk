import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['upload', 'url', 'web'],
    httpMethod: 'post',
    httpPath: '/sources/upload-url-source',
  },
  tool: {
    name: 'upload_url',
    description:
      'Ingest a web page as a source into the knowledge graph. ' +
      'Optionally crawls linked pages when crawlUrls is true.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The web page URL to ingest.',
        },
        crawlUrls: {
          type: 'boolean',
          description: 'When true, also follows and ingests links found on the page.',
        },
        partition_method: {
          type: 'string',
          enum: ['basic', 'hi_res', 'hi_res_ft', 'mai', 'graphorlm'],
          description:
            'The partitioning strategy to apply. When omitted, the system default is used.\n' +
            '- "basic" (Fast) — Fastest, rule-based partitioning with minimal overhead.\n' +
            '- "hi_res" (Balanced) — Balanced speed and accuracy using layout-aware parsing.\n' +
            '- "hi_res_ft" (Accurate) — High-accuracy parsing with fine-tuned models.\n' +
            '- "mai" (VLM) — Vision-language model for complex visual documents.\n' +
            '- "graphorlm" (Agentic) — Agentic pipeline with the highest accuracy.',
        },
      },
      required: ['url'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const params: Graphor.SourceUploadURLParams = {
      url: args['url'] as string,
      ...(args['crawlUrls'] != null && { crawlUrls: args['crawlUrls'] as boolean }),
    };
    if (args['partition_method'] != null) {
      params.partition_method = args['partition_method'] as Graphor.PublicPartitionMethod;
    }

    const result = await client.sources.uploadURL(params);
    return asTextContentResult(result);
  },
};

export default tool;
