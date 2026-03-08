import { McpTool, asTextContentResult, asErrorResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'read',
    tags: ['elements', 'chunks'],
    httpMethod: 'get',
    httpPath: '/sources/get-elements',
  },
  tool: {
    name: 'get_elements',
    description:
      'Retrieve the parsed elements (chunks/partitions) of a specific source with pagination. ' +
      'Useful for inspecting how a file was segmented or reviewing chunk content. ' +
      'Requires the file_id (from list_sources or get_build_status).\n\n' +
      'Each element in the response contains: element_id, element_type, text, markdown, html, ' +
      'position, page_number, bounding_box, and optionally img_base64.',
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'Unique identifier of the source (from list_sources or get_build_status).',
        },
        page: {
          type: 'number',
          description: 'The 1-based page number for pagination.',
        },
        page_size: {
          type: 'number',
          description: 'The number of elements per page (max 100).',
        },
        suppress_img_base64: {
          type: 'boolean',
          description:
            'When true, the img_base64 field is omitted from each element. ' +
            'Useful to reduce payload size when images are not needed.',
        },
        type: {
          type: 'string',
          description: 'Filter by element type (e.g. NarrativeText, Title, Table, Image).',
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
      required: ['file_id'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const fileId = args['file_id'] as string | undefined;
    if (!fileId) {
      return asErrorResult('file_id is required.');
    }

    const params: Graphor.SourceGetElementsParams = {
      file_id: fileId,
      ...(args['page'] != null && { page: args['page'] as number }),
      ...(args['page_size'] != null && { page_size: args['page_size'] as number }),
      ...(args['suppress_img_base64'] != null && {
        suppress_img_base64: args['suppress_img_base64'] as boolean,
      }),
      ...(args['type'] != null && { type: args['type'] as string }),
      ...(args['page_numbers'] != null && { page_numbers: args['page_numbers'] as number[] }),
      ...(args['elementsToRemove'] != null && {
        elementsToRemove: args['elementsToRemove'] as string[],
      }),
    };

    const result = await client.sources.getElements(params);
    return asTextContentResult(result);
  },
};

export default tool;
