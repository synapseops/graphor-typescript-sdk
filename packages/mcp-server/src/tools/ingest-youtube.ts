import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'write',
    tags: ['ingest', 'youtube'],
    httpMethod: 'post',
    httpPath: '/sources/ingest-youtube',
  },
  tool: {
    name: 'ingest_youtube',
    description:
      'Ingest a public YouTube video as a source into the knowledge graph. ' +
      'Downloads the transcript/captions, partitions the text, generates embeddings, ' +
      'and persists everything in the knowledge graph.\n\n' +
      'Returns a build_id immediately — use get_build_status to poll until processing completes ' +
      'and obtain the file_id for subsequent calls.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The YouTube video URL to ingest (e.g. https://www.youtube.com/watch?v=...).',
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
    const params: Graphor.SourceIngestYoutubeParams = { url: args['url'] as string };
    if (args['enrichment'] != null) {
      params.enrichment = args['enrichment'] as string;
    }
    if (args['indexing'] != null) {
      params.indexing = args['indexing'] as string;
    }
    const result = await client.sources.ingestYoutube(params);
    return asTextContentResult(result);
  },
};

export default tool;
