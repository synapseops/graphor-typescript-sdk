import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  SetLevelRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ClientOptions } from 'graphor';
import Graphor from 'graphor';
import { allTools } from './tools';
import { HandlerFunction, McpTool } from './types';

export { ClientOptions } from 'graphor';

function getInstructions(): string {
  return `The current time in Unix timestamps is ${Date.now()}.

 # Graphor MCP Guide

## What is Graphor?

Graphor is a document intelligence platform that ingests files, web pages, GitHub repos, and YouTube videos into a private knowledge base an AI agent investigates and cites. These tools provide conversational Q&A, structured data extraction, and semantic search over your ingested documents.

## Core Capabilities

- **Multi-source ingestion**: Upload PDFs, DOCX, images, audio, video, web pages, GitHub repos, and YouTube videos
- **Conversational chat**: Ask questions with memory across conversation turns, answered with page-level citations
- **Structured extraction**: Extract typed data using JSON Schema validation
- **Semantic search**: Retrieve relevant chunks for custom RAG pipelines

---

## Common Use Cases

### 1. Upload & Chat with Documents

Upload a file using the \`ingest_file\` tool. Ingestion is asynchronous: it returns a \`build_id\` immediately — poll \`get_build_status\` until the status is completed, then use the returned \`file_id\` with \`ask\`.
Pass \`conversation_id\` from the response to maintain context across multiple turns.

### 2. Extract Structured Data

Use the \`extract\` tool with a \`user_instruction\` describing what to extract and an \`output_schema\` (JSON Schema) defining the desired shape.

### 3. Semantic Search (Custom RAG)

Use the \`retrieve_chunks\` tool to find relevant text chunks without generating an answer.

### 4. Upload from External Sources

- Web pages: use \`ingest_url\` (set \`crawlUrls: true\` to follow links)
- GitHub repos: use \`ingest_github\`
- YouTube videos: use \`ingest_youtube\`

All ingest tools return a \`build_id\` — poll \`get_build_status\` until completion.

### 5. Manage Documents

- List all sources: \`list_sources\`
- Delete a source: \`delete_source\`
- Re-parse with a different strategy: \`reprocess\`
- Inspect parsed elements: \`get_elements\`
- Render a page as an image: \`get_page_screenshot\`

---

## Special Features

**Conversation Memory**: Pass \`conversation_id\` from a previous \`ask\` response to maintain context across multiple turns.

**Scoped Queries**: Use \`file_names\` or \`file_ids\` in \`ask\`, \`extract\`, and \`retrieve_chunks\` to restrict searches to specific documents.

**Thinking Levels**: Control cost/depth with \`thinking_level: "fast" | "balanced" | "accurate" | "max"\` in \`ask\` and \`extract\` — each level is a real search budget, from bounded lookup to exhaustive investigation.

**Ingestion Levels**: Every ingest tool and \`reprocess\` accept \`enrichment\` and \`indexing\` (\`"full"\` default | \`"none"\`). \`enrichment: "none"\` skips LLM annotation for faster, cheaper parsing. \`indexing: "none"\` parses without making the source searchable — \`ask\`/\`extract\`/\`retrieve_chunks\` return nothing for it until you run \`index_build\`, which indexes the existing build without re-parsing.

**File Upload Modes**: The \`ingest_file\` tool supports two modes:
- \`file_path\`: Provide an absolute path to a local file (works in local/stdio MCP).
- \`file_content\` + \`file_name\`: Provide text content directly (works in both local and remote MCP; best for text files like .md, .txt, .csv, .html).
For binary files (PDF, DOCX, images, etc.), use \`file_path\`.

**Binary file upload fallback**: If \`file_path\` is not available (e.g. remote MCP on Cloudflare) and the file is binary, you can upload it directly via curl in the user's terminal:
\`\`\`
curl -s -X POST "{base_url}/sources/ingest-file" \\
  -H "Authorization: Bearer {api_key}" \\
  -F "file=@/path/to/document.pdf" \\
  -F "method=balanced"
\`\`\`
Use the GRAPHOR_BASE_URL and GRAPHOR_API_KEY environment variables for the base_url and api_key values.

---

## Method Reference

| Tool | Description |
|------|-------------|
| \`ask\` | Ask questions grounded on ingested sources, with citations |
| \`extract\` | Extract structured data using JSON Schema |
| \`retrieve_chunks\` | Semantic search for relevant chunks |
| \`ingest_file\` | Upload a local file (async → build_id) |
| \`ingest_url\` | Ingest a web page (async → build_id) |
| \`ingest_github\` | Ingest a GitHub repository (async → build_id) |
| \`ingest_youtube\` | Ingest a YouTube video (async → build_id) |
| \`get_build_status\` | Poll an ingestion build; reports enrichment, indexing and searchable |
| \`list_sources\` | List all ingested sources |
| \`delete_source\` | Delete a source |
| \`reprocess\` | Re-process a source with a different strategy (async → build_id) |
| \`get_elements\` | Get parsed elements of a source |
| \`index_build\` | Index an existing build without re-parsing (the way out of indexing: "none") |
| \`get_page_screenshot\` | Render a page of a source as a PNG image |
`;
}

export const newMcpServer = async () =>
  new McpServer(
    {
      name: 'graphor_api',
      version: '0.22.0',
    },
    {
      instructions: getInstructions(),
      capabilities: { tools: {}, logging: {} },
    },
  );

/**
 * Initializes the provided MCP Server with the given tools and handlers.
 * If not provided, the default client, tools and handlers will be used.
 */
export async function initMcpServer(params: { server: Server | McpServer; clientOptions?: ClientOptions }) {
  const server = params.server instanceof McpServer ? params.server.server : params.server;

  const logAtLevel =
    (level: 'debug' | 'info' | 'warning' | 'error') =>
    (message: string, ...rest: unknown[]) => {
      void server.sendLoggingMessage({
        level,
        data: { message, rest },
      });
    };
  const logger = {
    debug: logAtLevel('debug'),
    info: logAtLevel('info'),
    warn: logAtLevel('warning'),
    error: logAtLevel('error'),
  };

  let client = new Graphor({
    logger,
    ...params.clientOptions,
    defaultHeaders: {
      ...params.clientOptions?.defaultHeaders,
    },
  });

  const providedTools = selectTools();
  const toolMap = Object.fromEntries(providedTools.map((mcpTool) => [mcpTool.tool.name, mcpTool]));

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: providedTools.map((mcpTool) => mcpTool.tool),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const mcpTool = toolMap[name];
    if (!mcpTool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return executeHandler(mcpTool.handler, client, args);
  });

  server.setRequestHandler(SetLevelRequestSchema, async (request) => {
    const { level } = request.params;
    switch (level) {
      case 'debug':
        client = client.withOptions({ logLevel: 'debug' });
        break;
      case 'info':
        client = client.withOptions({ logLevel: 'info' });
        break;
      case 'notice':
      case 'warning':
        client = client.withOptions({ logLevel: 'warn' });
        break;
      case 'error':
        client = client.withOptions({ logLevel: 'error' });
        break;
      default:
        client = client.withOptions({ logLevel: 'off' });
        break;
    }
    return {};
  });
}

/**
 * Returns all available tools for the MCP Server.
 */
export function selectTools(): McpTool[] {
  return [...allTools];
}

/**
 * Runs the provided handler with the given client and arguments.
 */
export async function executeHandler(
  handler: HandlerFunction,
  client: Graphor,
  args: Record<string, unknown> | undefined,
) {
  return await handler(client, args || {});
}

export const readEnv = (env: string): string | undefined => {
  if (typeof (globalThis as any).process !== 'undefined') {
    return (globalThis as any).process.env?.[env]?.trim();
  } else if (typeof (globalThis as any).Deno !== 'undefined') {
    return (globalThis as any).Deno.env?.get?.(env)?.trim();
  }
  return;
};

export const readEnvOrError = (env: string): string => {
  let envValue = readEnv(env);
  if (envValue === undefined) {
    throw new Error(`Environment variable ${env} is not set`);
  }
  return envValue;
};

export const requireValue = <T>(value: T | undefined, description: string): T => {
  if (value === undefined) {
    throw new Error(`Missing required value: ${description}`);
  }
  return value;
};
