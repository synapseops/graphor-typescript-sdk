import { McpTool, asTextContentResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'read',
    tags: ['retrieval', 'rag', 'search'],
    httpMethod: 'post',
    httpPath: '/sources/prebuilt-rag',
  },
  tool: {
    name: 'retrieve_chunks',
    description:
      'Retrieve relevant document chunks via semantic search. ' +
      'Returns the most relevant text chunks with source metadata (file name, page number, relevance score). ' +
      'This is a pure retrieval endpoint — it does not generate an answer. Use the "ask" tool for Q&A.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The natural-language search query to find relevant chunks.',
        },
        file_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Restrict retrieval to specific source file IDs.',
        },
        file_names: {
          type: 'array',
          items: { type: 'string' },
          description: 'Restrict retrieval to specific source file names.',
        },
      },
      required: ['query'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const params: Graphor.SourceRetrieveChunksParams = {
      query: args['query'] as string,
      ...(args['file_ids'] != null && { file_ids: args['file_ids'] as string[] }),
      ...(args['file_names'] != null && { file_names: args['file_names'] as string[] }),
    };

    const result = await client.sources.retrieveChunks(params);
    return asTextContentResult(result);
  },
};

export default tool;
