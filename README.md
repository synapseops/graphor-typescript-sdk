# Graphor TypeScript SDK

[![NPM version](https://img.shields.io/npm/v/graphor.svg?label=npm%20(stable))](https://npmjs.org/package/graphor)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)

The official TypeScript SDK for the [Graphor](https://graphorlm.com) API. Build intelligent document applications with ease.

**Features:**
- 📄 **Document Ingestion** — Upload files, web pages, GitHub repos, and YouTube videos
- 💬 **Document Chat** — Ask questions with conversational memory
- 📊 **Structured Extraction** — Extract data using JSON Schema
- 🔍 **Semantic Search** — Retrieve relevant chunks for custom RAG pipelines
- 🔒 **Type Safety** — Complete TypeScript definitions for all params and responses
- 🌐 **Multi-Runtime** — Works in Node.js, Deno, Bun, and browsers

## Documentation

📚 **Full documentation**: [docs.graphorlm.com/sdk/overview](https://docs.graphorlm.com/sdk/overview)

## Installation

```bash
npm install graphor
```

Or with your preferred package manager:

```bash
yarn add graphor
pnpm add graphor
```

## Quick Start

```typescript
import Graphor from 'graphor';
import fs from 'fs';

const client = new Graphor();  // Uses GRAPHOR_API_KEY env var

// Upload a document
const source = await client.sources.upload({ file: fs.createReadStream('document.pdf') });
console.log(`Uploaded: ${source.file_name}`);

// Process with a parsing strategy
await client.sources.parse({
  file_name: source.file_name,
  partition_method: 'graphorlm'  // Options: basic (Fast), hi_res (Balanced), hi_res_ft (Accurate), mai (VLM), graphorlm (Agentic)
});

// Ask questions about your documents
const response = await client.sources.ask({ question: 'What are the main topics?' });
console.log(`Answer: ${response.answer}`);
```

## Authentication

Set your API key as an environment variable (recommended):

```bash
export GRAPHOR_API_KEY="grlm_your_api_key_here"
```

```typescript
import Graphor from 'graphor';

const client = new Graphor();  // Automatically uses GRAPHOR_API_KEY
```

Or pass it directly:

```typescript
const client = new Graphor({ apiKey: 'grlm_your_api_key_here' });
```

## Core Features

### 📄 Upload Documents

Upload files, web pages, GitHub repositories, or YouTube videos:

```typescript
import Graphor from 'graphor';
import fs from 'fs';

const client = new Graphor();

// Upload a local file
const source = await client.sources.upload({ file: fs.createReadStream('report.pdf') });

// Upload from URL
const urlSource = await client.sources.uploadUrl({ url: 'https://example.com/article' });

// Upload from GitHub
const githubSource = await client.sources.uploadGithub({ url: 'https://github.com/org/repo' });

// Upload from YouTube
const youtubeSource = await client.sources.uploadYoutube({ url: 'https://youtube.com/watch?v=...' });
```

**Supported formats:** PDF, DOCX, TXT, MD, HTML, CSV, XLSX, PNG, JPG, MP3, MP4, and more.

📖 [Full upload documentation](https://docs.graphorlm.com/sdk/sources/upload)

### ⚙️ Process Documents

Reprocess documents with different OCR/parsing methods:

```typescript
// Reprocess with high-resolution parsing
const source = await client.sources.parse({
  file_name: 'document.pdf',
  partition_method: 'hi_res'  // Options: basic, hi_res, hi_res_ft, mai, graphorlm
});
```

📖 [Full processing documentation](https://docs.graphorlm.com/sdk/sources/process)

### 💬 Chat with Documents

Ask questions about your documents with conversational memory:

```typescript
// Ask a question
const response = await client.sources.ask({
  question: 'What are the key findings?'
});
console.log(response.answer);

// Follow-up question (maintains context)
const followUp = await client.sources.ask({
  question: 'Can you elaborate on the first point?',
  conversation_id: response.conversation_id
});
console.log(followUp.answer);

// Scope to specific documents
const scopedResponse = await client.sources.ask({
  question: 'Compare these two reports',
  file_names: ['report-2023.pdf', 'report-2024.pdf']
});
```

📖 [Full chat documentation](https://docs.graphorlm.com/sdk/chat)

### 📊 Extract Structured Data

Extract structured information using JSON Schema:

```typescript
const result = await client.sources.extract({
  file_names: ['invoice.pdf'],
  user_instruction: 'Extract invoice details',
  output_schema: {
    type: 'object',
    properties: {
      invoice_number: { type: 'string' },
      total_amount: { type: 'number' },
      line_items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            amount: { type: 'number' }
          }
        }
      }
    }
  }
});

console.log(result.structured_output);
// { invoice_number: "INV-001", total_amount: 1500.00, line_items: [...] }
```

📖 [Full extraction documentation](https://docs.graphorlm.com/sdk/extract)

### 🔍 Retrieve Chunks (Prebuilt RAG)

Build custom RAG pipelines with semantic search:

```typescript
// Retrieve relevant chunks
const result = await client.sources.retrieveChunks({
  query: 'What are the payment terms?'
});

for (const chunk of result.chunks) {
  console.log(`[${chunk.file_name}, Page ${chunk.page_number}]`);
  console.log(`Score: ${chunk.score.toFixed(2)}`);
  console.log(chunk.text);
  console.log('---');
}

// Use with your preferred LLM
const context = result.chunks.map(c => c.text).join('\n');
// Pass context to OpenAI, Anthropic, etc.
```

📖 [Full RAG documentation](https://docs.graphorlm.com/sdk/prebuilt-rag)

### 📋 Manage Sources

List, inspect, and delete documents:

```typescript
// List all sources
const sources = await client.sources.list();
for (const source of sources) {
  console.log(`${source.file_name}: ${source.status}`);
}

// Get document elements
const elements = await client.sources.loadElements({
  file_name: 'document.pdf',
  page: 1,
  page_size: 50
});

// Delete a source
const result = await client.sources.delete({ file_name: 'document.pdf' });
```

## File Uploads

Request parameters that correspond to file uploads can be passed in many different forms:

```typescript
import fs from 'fs';
import Graphor, { toFile } from 'graphor';

const client = new Graphor();

// Using fs.createReadStream (Node.js)
await client.sources.upload({ file: fs.createReadStream('/path/to/file') });

// Using File API (browsers)
await client.sources.upload({ file: new File(['my bytes'], 'file') });

// Using fetch Response
await client.sources.upload({ file: await fetch('https://somesite/file') });

// Using toFile helper
await client.sources.upload({ file: await toFile(Buffer.from('my bytes'), 'file') });
```

## Error Handling

```typescript
import Graphor from 'graphor';

const client = new Graphor();

try {
  const response = await client.sources.ask({ question: 'What is this about?' });
} catch (err) {
  if (err instanceof Graphor.BadRequestError) {
    console.log('Bad request');
  } else if (err instanceof Graphor.AuthenticationError) {
    console.log('Invalid API key');
  } else if (err instanceof Graphor.NotFoundError) {
    console.log('Resource not found');
  } else if (err instanceof Graphor.RateLimitError) {
    console.log('Rate limited - back off and retry');
  } else if (err instanceof Graphor.APIConnectionError) {
    console.log('Network error');
  } else if (err instanceof Graphor.APIError) {
    console.log(`API error: ${err.status}`);
  } else {
    throw err;
  }
}
```

| Status Code | Error Type |
|-------------|------------|
| 400 | `BadRequestError` |
| 401 | `AuthenticationError` |
| 403 | `PermissionDeniedError` |
| 404 | `NotFoundError` |
| 422 | `UnprocessableEntityError` |
| 429 | `RateLimitError` |
| ≥500 | `InternalServerError` |
| N/A | `APIConnectionError` |

## Configuration

### Retries

Requests are automatically retried twice with exponential backoff:

```typescript
// Configure default retries
const client = new Graphor({ maxRetries: 5 });

// Or per-request
await client.sources.ask({ question: '...' }, { maxRetries: 3 });
```

### Timeouts

Default timeout is 60 seconds:

```typescript
// Configure default timeout (in milliseconds)
const client = new Graphor({ timeout: 120 * 1000 });

// Or per-request
await client.sources.parse(
  { file_name: 'large-document.pdf', partition_method: 'graphorlm' },
  { timeout: 300 * 1000 }
);
```

## Complete Example

```typescript
import Graphor from 'graphor';
import fs from 'fs';

const client = new Graphor();

// 1. Upload a document
const source = await client.sources.upload({ file: fs.createReadStream('contract.pdf') });
console.log(`✅ Uploaded: ${source.file_name}`);

// 2. Process with advanced parsing
const processed = await client.sources.parse({
  file_name: source.file_name,
  partition_method: 'hi_res'
});
console.log(`✅ Processed: ${processed.status}`);

// 3. Ask questions
const response = await client.sources.ask({
  question: 'What are the key terms of this contract?',
  file_names: [source.file_name]
});
console.log(`📝 Answer: ${response.answer}`);

// 4. Extract structured data
const extracted = await client.sources.extract({
  file_names: [source.file_name],
  user_instruction: 'Extract contract details',
  output_schema: {
    type: 'object',
    properties: {
      parties: { type: 'array', items: { type: 'string' } },
      effective_date: { type: 'string' },
      termination_date: { type: 'string' },
      total_value: { type: 'number' }
    }
  }
});
console.log(`📊 Extracted: ${JSON.stringify(extracted.structured_output)}`);

// 5. Build custom RAG
const chunks = await client.sources.retrieveChunks({
  query: 'payment obligations',
  file_names: [source.file_name]
});
console.log(`🔍 Found ${chunks.total} relevant chunks`);
```

## MCP Server

Use the Graphor MCP Server to enable AI assistants to interact with this API, allowing them to explore endpoints, make test requests, and use documentation to help integrate this SDK into your application.

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=graphor-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImdyYXBob3ItbWNwIl0sImVudiI6eyJHUkFQSE9SX0FQSV9LRVkiOiJNeSBBUEkgS2V5In19)
[![Install in VS Code](https://img.shields.io/badge/_-Add_to_VS_Code-blue?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI0VFRSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjM1IDM5Ljg4NGEyLjQ5MSAyLjQ5MSAwIDAgMS0xLjc4MS0uNzNMMTIuNyAyNC43OGwtMy40NiAyLjYyNC0zLjQwNiAyLjU4MmExLjY2NSAxLjY2NSAwIDAgMS0xLjA4Mi4zMzggMS42NjQgMS42NjQgMCAwIDEtMS4wNDYtLjQzMWwtMi4yLTJhMS42NjYgMS42NjYgMCAwIDEgMC0yLjQ2M0w3LjQ1OCAyMCA0LjY3IDE3LjQ1MyAxLjUwNyAxNC41N2ExLjY2NSAxLjY2NSAwIDAgMSAwLTIuNDYzbDIuMi0yYTEuNjY1IDEuNjY1IDAgMCAxIDIuMTMtLjA5N2w2Ljg2MyA1LjIwOUwyOC40NTIuODQ0YTIuNDg4IDIuNDg4IDAgMCAxIDEuODQxLS43MjljLjM1MS4wMDkuNjk5LjA5MSAxLjAxOS4yNDVsOC4yMzYgMy45NjFhMi41IDIuNSAwIDAgMSAxLjQxNSAyLjI1M3YuMDk5LS4wNDVWMzMuMzd2LS4wNDUuMDk1YTIuNTAxIDIuNTAxIDAgMCAxLTEuNDE2IDIuMjU3bC04LjIzNSAzLjk2MWEyLjQ5MiAyLjQ5MiAwIDAgMS0xLjA3Ny4yNDZabS43MTYtMjguOTQ3LTExLjk0OCA5LjA2MiAxMS45NTIgOS4wNjUtLjAwNC0xOC4xMjdaIi8+PC9zdmc+)](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22graphor-mcp%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22graphor-mcp%22%5D%2C%22env%22%3A%7B%22GRAPHOR_API_KEY%22%3A%22My%20API%20Key%22%7D%7D)

Or manually add it to your MCP client's configuration:

```json
{
  "mcpServers": {
    "graphor_api": {
      "command": "npx",
      "args": ["-y", "graphor-mcp@latest"],
      "env": {
        "GRAPHOR_API_KEY": "grlm_your_api_key_here"
      }
    }
  }
}
```

> Note: You may need to set environment variables in your MCP client.

### Remote MCP Server (Web Apps & Agentic Workflows)

For web-based AI clients (e.g. [Claude.ai](https://claude.ai)) or agentic frameworks (e.g. LangChain, CrewAI) that cannot run local `npx` processes, use the hosted remote MCP server. Authentication is handled via **OAuth** — a browser window will open for you to log in.

```
https://mcp.graphor.workers.dev/sse
```

**Web apps (e.g. Claude.ai)** — in Claude.ai, go to **Settings > Connectors > Add custom connector**, fill in the name and the remote MCP server URL. You will be redirected to log in through the OAuth flow:

The full API of this library can be found in [api.md](api.md).

<!-- prettier-ignore -->
```js
import Graphor from 'graphor';

const client = new Graphor({
  apiKey: process.env['GRAPHOR_API_KEY'], // This is the default and can be omitted
});

const response = await client.sources.ingestURL({ url: 'url' });

console.log(response.build_id);
```

**Desktop clients (e.g. Claude Desktop)** — use [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) as a local proxy:

```json
{
  "mcpServers": {
    "graphor_api": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.graphor.workers.dev/sse"]
    }
  }
}
```

**Agentic workflows (e.g. LangChain)** — connect via SSE transport:

```typescript
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const client = new MultiServerMCPClient({
  graphor: {
    url: "https://mcp.graphor.workers.dev/sse",
    transport: "sse",
  }
});

const params: Graphor.SourceIngestURLParams = { url: 'url' };
const response: Graphor.SourceIngestURLResponse = await client.sources.ingestURL(params);
```

Documentation for each method, request param, and response field are available in docstrings and will appear on hover in most modern editors.

## File uploads

Request parameters that correspond to file uploads can be passed in many different forms:

- `File` (or an object with the same structure)
- a `fetch` `Response` (or an object with the same structure)
- an `fs.ReadStream`
- the return value of our `toFile` helper

```ts
import fs from 'fs';
import Graphor, { toFile } from 'graphor';

const client = new Graphor();

// If you have access to Node `fs` we recommend using `fs.createReadStream()`:
await client.sources.ingestFile({ file: fs.createReadStream('/path/to/file') });

// Or if you have the web `File` API you can pass a `File` instance:
await client.sources.ingestFile({ file: new File(['my bytes'], 'file') });

// You can also pass a `fetch` `Response`:
await client.sources.ingestFile({ file: await fetch('https://somesite/file') });

// Finally, if none of the above are convenient, you can use our `toFile` helper:
await client.sources.ingestFile({ file: await toFile(Buffer.from('my bytes'), 'file') });
await client.sources.ingestFile({ file: await toFile(new Uint8Array([0, 1, 2]), 'file') });
```

## Handling errors

When the library is unable to connect to the API,
or if the API returns a non-success status code (i.e., 4xx or 5xx response),
a subclass of `APIError` will be thrown:

<!-- prettier-ignore -->
```ts
const response = await client.sources.ingestURL({ url: 'url' }).catch(async (err) => {
  if (err instanceof Graphor.APIError) {
    console.log(err.status); // 400
    console.log(err.name); // BadRequestError
    console.log(err.headers); // {server: 'nginx', ...}
  } else {
    throw err;
  }
});
```

Error codes are as follows:

| Status Code | Error Type                 |
| ----------- | -------------------------- |
| 400         | `BadRequestError`          |
| 401         | `AuthenticationError`      |
| 403         | `PermissionDeniedError`    |
| 404         | `NotFoundError`            |
| 422         | `UnprocessableEntityError` |
| 429         | `RateLimitError`           |
| >=500       | `InternalServerError`      |
| N/A         | `APIConnectionError`       |

### Retries

Certain errors will be automatically retried 0 times by default, with a short exponential backoff.
Connection errors (for example, due to a network connectivity problem), 408 Request Timeout, 409 Conflict,
429 Rate Limit, and >=500 Internal errors will all be retried by default.

You can use the `maxRetries` option to configure or disable this:

<!-- prettier-ignore -->
```js
// Configure the default for all requests:
const client = new Graphor({
  maxRetries: 0, // default is 2
});

// Or, configure per-request:
await client.sources.ingestURL({ url: 'url' }, {
  maxRetries: 5,
});
```

### Timeouts

Requests time out after 10 minutes by default. You can configure this with a `timeout` option:

<!-- prettier-ignore -->
```ts
// Configure the default for all requests:
const client = new Graphor({
  timeout: 20 * 1000, // 20 seconds (default is 10 minutes)
});

// Override per-request:
await client.sources.ingestURL({ url: 'url' }, {
  timeout: 5 * 1000,
});
```

On timeout, an `APIConnectionTimeoutError` is thrown.

Note that requests which time out will be [retried twice by default](#retries).

## Advanced Usage

### Accessing raw Response data (e.g., headers)

The "raw" `Response` returned by `fetch()` can be accessed through the `.asResponse()` method on the `APIPromise` type that all methods return.
This method returns as soon as the headers for a successful response are received and does not consume the response body, so you are free to write custom parsing or streaming logic.

You can also use the `.withResponse()` method to get the raw `Response` along with the parsed data.
Unlike `.asResponse()` this method consumes the body, returning once it is parsed.

<!-- prettier-ignore -->
```ts
const client = new Graphor();

const response = await client.sources.ingestURL({ url: 'url' }).asResponse();
console.log(response.headers.get('X-My-Header'));
console.log(response.statusText); // access the underlying Response object

const { data: response, response: raw } = await client.sources
  .ingestURL({ url: 'url' })
  .withResponse();
console.log(raw.headers.get('X-My-Header'));
console.log(response.build_id);
```

### Logging

> [!IMPORTANT]
> All log messages are intended for debugging only. The format and content of log messages
> may change between releases.

#### Log levels

The log level can be configured in two ways:

1. Via the `GRAPHOR_LOG` environment variable
2. Using the `logLevel` client option (overrides the environment variable if set)

```ts
import Graphor from 'graphor';

const client = new Graphor({
  logLevel: 'debug', // Show all log messages
});
```

Available log levels, from most to least verbose:

- `'debug'` - Show debug messages, info, warnings, and errors
- `'info'` - Show info messages, warnings, and errors
- `'warn'` - Show warnings and errors (default)
- `'error'` - Show only errors
- `'off'` - Disable all logging

At the `'debug'` level, all HTTP requests and responses are logged, including headers and bodies.
Some authentication-related headers are redacted, but sensitive data in request and response bodies
may still be visible.

#### Custom logger

By default, this library logs to `globalThis.console`. You can also provide a custom logger.
Most logging libraries are supported, including [pino](https://www.npmjs.com/package/pino), [winston](https://www.npmjs.com/package/winston), [bunyan](https://www.npmjs.com/package/bunyan), [consola](https://www.npmjs.com/package/consola), [signale](https://www.npmjs.com/package/signale), and [@std/log](https://jsr.io/@std/log). If your logger doesn't work, please open an issue.

When providing a custom logger, the `logLevel` option still controls which messages are emitted, messages
below the configured level will not be sent to your logger.

```ts
import Graphor from 'graphor';
import pino from 'pino';

const logger = pino();

const client = new Graphor({
  logger: logger.child({ name: 'Graphor' }),
  logLevel: 'debug', // Send all messages to pino, allowing it to filter
});
```

### Making custom/undocumented requests

This library is typed for convenient access to the documented API. If you need to access undocumented
endpoints, params, or response properties, the library can still be used.

#### Undocumented endpoints

To make requests to undocumented endpoints, you can use `client.get`, `client.post`, and other HTTP verbs.
Options on the client, such as retries, will be respected when making these requests.

```ts
await client.post('/some/path', {
  body: { some_prop: 'foo' },
  query: { some_query_arg: 'bar' },
});
```

#### Undocumented request params

To make requests using undocumented parameters, you may use `// @ts-expect-error` on the undocumented
parameter. This library doesn't validate at runtime that the request matches the type, so any extra values you
send will be sent as-is.

```ts
client.sources.ingestURL({
  // ...
  // @ts-expect-error baz is not yet public
  baz: 'undocumented option',
});
```

For requests with the `GET` verb, any extra params will be in the query, all other requests will send the
extra param in the body.

If you want to explicitly send an extra argument, you can do so with the `query`, `body`, and `headers` request
options.

#### Undocumented response properties

To access undocumented response properties, you may access the response object with `// @ts-expect-error` on
the response object, or cast the response object to the requisite type. Like the request params, we do not
validate or strip extra properties from the response from the API.

### Customizing the fetch client

By default, this library expects a global `fetch` function is defined.

If you want to use a different `fetch` function, you can either polyfill the global:

```ts
import fetch from 'my-fetch';

globalThis.fetch = fetch;
```

Or pass it to the client:

```ts
import Graphor from 'graphor';
import fetch from 'my-fetch';

const client = new Graphor({ fetch });
```

### Fetch options

If you want to set custom `fetch` options without overriding the `fetch` function, you can provide a `fetchOptions` object when instantiating the client or making a request. (Request-specific options override client options.)

```ts
import Graphor from 'graphor';

const client = new Graphor({
  fetchOptions: {
    // `RequestInit` options
  },
});
```

#### Configuring proxies

To modify proxy behavior, you can provide custom `fetchOptions` that add runtime-specific proxy
options to requests:

<img src="https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/node.svg" align="top" width="18" height="21"> **Node** <sup>[[docs](https://github.com/nodejs/undici/blob/main/docs/docs/api/ProxyAgent.md#example---proxyagent-with-fetch)]</sup>

```ts
import Graphor from 'graphor';
import * as undici from 'undici';

const proxyAgent = new undici.ProxyAgent('http://localhost:8888');
const client = new Graphor({
  fetchOptions: {
    dispatcher: proxyAgent,
  },
});
```

<img src="https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/bun.svg" align="top" width="18" height="21"> **Bun** <sup>[[docs](https://bun.sh/guides/http/proxy)]</sup>

```ts
import Graphor from 'graphor';

const client = new Graphor({
  fetchOptions: {
    proxy: 'http://localhost:8888',
  },
});
```

<img src="https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/deno.svg" align="top" width="18" height="21"> **Deno** <sup>[[docs](https://docs.deno.com/api/deno/~/Deno.createHttpClient)]</sup>

```ts
import Graphor from 'npm:graphor';

const httpClient = Deno.createHttpClient({ proxy: { url: 'http://localhost:8888' } });
const client = new Graphor({
  fetchOptions: {
    client: httpClient,
  },
});
```

## Frequently Asked Questions

## Semantic versioning

This package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:

1. Changes that only affect static types, without breaking runtime behavior.
2. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals.)_
3. Changes that we do not expect to impact the vast majority of users in practice.

We take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.

We are keen for your feedback; please open an [issue](https://www.github.com/synapseops/graphor-typescript-sdk/issues) with questions, bugs, or suggestions.

## Requirements

- TypeScript >= 4.9
- Node.js 20+ (LTS)
- Also works in: Deno v1.28+, Bun 1.0+, Cloudflare Workers, Vercel Edge Runtime, and modern browsers

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Links

- 📚 [Documentation](https://docs.graphorlm.com/sdk/overview)
- 🐛 [Issue Tracker](https://github.com/synapseops/graphor-typescript-sdk/issues)
- 📦 [NPM](https://www.npmjs.com/package/graphor)
- 🏠 [Graphor](https://graphorlm.com)
