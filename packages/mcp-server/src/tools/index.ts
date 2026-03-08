import type { McpTool } from '../types';

import askTool from './ask';
import extractTool from './extract';
import retrieveChunksTool from './retrieve-chunks';
import ingestFileTool from './ingest-file';
import ingestUrlTool from './ingest-url';
import ingestGithubTool from './ingest-github';
import ingestYoutubeTool from './ingest-youtube';
import getBuildStatusTool from './get-build-status';
import listSourcesTool from './list-sources';
import deleteSourceTool from './delete-source';
import reprocessTool from './reprocess';
import getElementsTool from './get-elements';

export {
  askTool,
  extractTool,
  retrieveChunksTool,
  ingestFileTool,
  ingestUrlTool,
  ingestGithubTool,
  ingestYoutubeTool,
  getBuildStatusTool,
  listSourcesTool,
  deleteSourceTool,
  reprocessTool,
  getElementsTool,
};

export const allTools: McpTool[] = [
  askTool,
  extractTool,
  retrieveChunksTool,
  ingestFileTool,
  ingestUrlTool,
  ingestGithubTool,
  ingestYoutubeTool,
  getBuildStatusTool,
  listSourcesTool,
  deleteSourceTool,
  reprocessTool,
  getElementsTool,
];
