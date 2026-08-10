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
          enum: ['auto', 'fast', 'balanced', 'accurate', 'agentic'],
          description:
            'The partitioning strategy to apply. When omitted, the system default is used.\n' +
            '- "fast" — Fastest, rule-based partitioning with minimal overhead.\n' +
            '- "balanced" — Balanced speed and accuracy using layout-aware parsing.\n' +
            '- "accurate" — High-accuracy parsing with fine-tuned models.\n' +
            '- "agentic" — Agentic pipeline with the highest accuracy.\n' +
            '- "auto" — Classifies each page and routes it to the cheapest method that can read it (PDFs only).',
        },
        enrichment: {
          type: 'string',
          enum: ['full', 'none'],
          description:
            "LLM enrichment level. 'full' (default) annotates pages, sections and the document for better retrieval. " +
            "'none' skips LLM annotation for faster, cheaper parsing.",
        },
        indexing: {
          type: 'string',
          enum: ['full', 'none'],
          description:
            "Retrieval indexing level. 'full' (default) chunks, embeds and indexes the source. " +
            "'none' parses only — the source is NOT searchable (ask, extract and retrieve_chunks return nothing for it) " +
            'until indexed later via index_build. Rejected with 400 on deployments without indexing support.',
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
    if (args['enrichment'] != null) {
      params.enrichment = args['enrichment'] as string;
    }
    if (args['indexing'] != null) {
      params.indexing = args['indexing'] as string;
    }

    const result = await client.sources.ingestURL(params);
    return asTextContentResult(result);
  },
};

export default tool;
