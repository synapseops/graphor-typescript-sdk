import { McpTool, asTextContentResult, asErrorResult } from '../types';
import { Graphor } from 'graphor';
import type { SourceLoadElementsParams } from 'graphor/resources/sources';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'read',
    tags: ['elements', 'chunks'],
    httpMethod: 'post',
    httpPath: '/sources/elements',
  },
  tool: {
    name: 'load_elements',
    description:
      'Retrieve the parsed elements (chunks/partitions) of a specific source with pagination. ' +
      'Useful for inspecting how a file was segmented or reviewing chunk content. ' +
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
          description: 'The display name of the file.',
        },
        page: {
          type: 'number',
          description: 'The 1-based page number for pagination.',
        },
        page_size: {
          type: 'number',
          description: 'The number of elements per page.',
        },
        filter: {
          type: 'object',
          description: 'Optional filter to narrow down the returned elements.',
          properties: {
            type: {
              type: 'string',
              description: 'Filter by element type (e.g. NarrativeText, Title, Table).',
            },
            page_numbers: {
              type: 'array',
              items: { type: 'number' },
              description: 'Restrict results to specific page numbers from the original document.',
            },
            elementsToRemove: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of element types to exclude from the results.',
            },
          },
        },
      },
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    if (args.file_id == null && args.file_name == null) {
      return asErrorResult('At least one of file_id or file_name must be provided.');
    }

    const params: SourceLoadElementsParams = {
      ...(args.file_id != null && { file_id: args.file_id as string }),
      ...(args.file_name != null && { file_name: args.file_name as string }),
      ...(args.page != null && { page: args.page as number }),
      ...(args.page_size != null && { page_size: args.page_size as number }),
      ...(args.filter != null && { filter: args.filter as SourceLoadElementsParams.Filter }),
    };

    const result = await client.sources.loadElements(params);
    return asTextContentResult(result);
  },
};

export default tool;
