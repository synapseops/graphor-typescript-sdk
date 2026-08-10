import { McpTool, asImageContentResult, asErrorResult } from '../types';
import { Graphor } from 'graphor';

const tool: McpTool = {
  metadata: {
    resource: 'sources',
    operation: 'read',
    tags: ['screenshot', 'page', 'visual'],
    httpMethod: 'get',
    httpPath: '/sources/{file_id}/pages/{page_number}/screenshot',
  },
  tool: {
    name: 'get_page_screenshot',
    description:
      'Render one page of an ingested source as a PNG image. ' +
      'Useful to visually inspect a page when the parsed text is ambiguous — charts, stamps, ' +
      'signatures, complex layouts — or to verify what a citation points at.\n\n' +
      'Returns the rendered page as an image.',
    inputSchema: {
      type: 'object',
      properties: {
        file_id: {
          type: 'string',
          description: 'Unique identifier of the source file.',
        },
        page_number: {
          type: 'number',
          description: '1-based page number to render.',
        },
        max_width: {
          type: 'number',
          description: 'Optional maximum width of the rendered image in pixels.',
        },
      },
      required: ['file_id', 'page_number'],
    },
  },
  handler: async (client: Graphor, args: Record<string, unknown> = {}) => {
    const fileId = args['file_id'] as string | undefined;
    const pageNumber = args['page_number'] as number | undefined;
    if (!fileId || pageNumber == null) {
      return asErrorResult('file_id and page_number are required.');
    }

    const params: Graphor.SourceGetPageScreenshotParams = { file_id: fileId };
    if (args['max_width'] != null) {
      params.max_width = args['max_width'] as number;
    }

    const result = await client.sources.getPageScreenshot(pageNumber, params);
    return asImageContentResult(result.image_base64, 'image/png');
  },
};

export default tool;
