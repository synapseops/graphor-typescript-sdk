# Graphor TypeScript MCP Server

## Installation

### Direct invocation

You can run the MCP Server directly via `npx`:

```sh
export GRAPHOR_API_KEY="My API Key"
npx -y graphor-mcp@latest
```

### Via MCP Client

There is a partial list of existing clients at [modelcontextprotocol.io](https://modelcontextprotocol.io/clients). If you already
have a client, consult their documentation to install the MCP server.

For clients with a configuration JSON, it might look something like this:

```json
{
  "mcpServers": {
    "graphor_api": {
      "command": "npx",
      "args": ["-y", "graphor-mcp"],
      "env": {
        "GRAPHOR_API_KEY": "My API Key"
      }
    }
  }
}
```

### Cursor

If you use Cursor, you can install the MCP server by using the button below. You will need to set your environment variables
in Cursor's `mcp.json`, which can be found in Cursor Settings > Tools & MCP > New MCP Server.

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=graphor-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImdyYXBob3ItbWNwIl0sImVudiI6eyJHUkFQSE9SX0FQSV9LRVkiOiJNeSBBUEkgS2V5In19)

### VS Code

Add the server to VS Code's `mcp.json`, which can be found via Command Palette > MCP: Open User Configuration, and set your environment variables:

```json
{
  "servers": {
    "graphor_api": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "graphor-mcp"],
      "env": {
        "GRAPHOR_API_KEY": "My API Key"
      }
    }
  }
}
```

### Claude Code

If you use Claude Code, you can install the MCP server by running the command below in your terminal. You will need to set your
environment variables in Claude Code's `.claude.json`, which can be found in your home directory.

```
claude mcp add graphor_mcp_api --env GRAPHOR_API_KEY="My API Key" -- npx -y graphor-mcp
```

## Tools

| Tool                  | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `ask`                 | Ask questions grounded on ingested sources, with citations                  |
| `extract`             | Extract structured data using JSON Schema                                   |
| `retrieve_chunks`     | Semantic search for relevant chunks                                         |
| `ingest_file`         | Upload a local file (async, returns a `build_id`)                           |
| `ingest_url`          | Ingest a web page (async, returns a `build_id`)                             |
| `ingest_github`       | Ingest a GitHub repository (async, returns a `build_id`)                    |
| `ingest_youtube`      | Ingest a YouTube video (async, returns a `build_id`)                        |
| `get_build_status`    | Poll an ingestion build                                                     |
| `list_sources`        | List ingested sources, or the sources of one folder                         |
| `delete_source`       | Delete a source                                                             |
| `reprocess`           | Re-process a source with a different strategy (async, returns a `build_id`) |
| `get_elements`        | Get parsed elements of a source                                             |
| `index_build`         | Index an existing build without re-parsing                                  |
| `get_page_screenshot` | Render a page of a source as a PNG image                                    |
| `list_folders`        | List the folders of the project                                             |
| `create_folder`       | Create an empty folder                                                      |
| `move_sources`        | Move sources to a folder                                                    |

A folder is a `/`-separated path such as `Contracts/2026`; `""` is the top level. The ingest tools take `folder`, `ask`, `extract` and `retrieve_chunks` take `folders` (every source at or below each folder; an empty list is no folder scope), and `list_sources` takes `folder` and `recursive` (`""` or `/` lists only the top level). Renaming, removing and deleting folders are not tools; use the SDK. When the API does not apply a folder parameter, the tool returns an error instead of a result that would cover the whole project.

## Remote Server

Graphor provides a hosted remote MCP server, ideal for web-based AI applications and agentic workflows that cannot run local `npx` processes. The remote server uses **OAuth** for authentication — a browser window will open for you to log in when connecting for the first time.

**Remote server URL:**

```
https://mcp.graphor.workers.dev/sse
```

> Source code: [github.com/synapseops/graphor-mcp-server](https://github.com/synapseops/graphor-mcp-server)

### Web Apps (e.g. Claude.ai)

Web-based AI clients like [Claude.ai](https://claude.ai) support remote MCP servers natively. Simply provide the SSE URL and authenticate through the OAuth flow in your browser.

In Claude.ai, go to **Settings > Connectors > Add custom connector**, fill in the **Name** (e.g. "Graphor") and the **Remote MCP server URL**:

```
https://mcp.graphor.workers.dev/sse
```

You will be redirected to a login page to authorize access. Once authenticated, the Graphor tools will be available in your conversations.

### Desktop Clients (e.g. Claude Desktop)

Desktop clients that don't natively support remote MCP servers can connect using [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) as a local proxy:

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

When you launch the client, a browser window will open for you to log in through the OAuth flow. After authenticating, the tools will be available.

> If you run into issues, try clearing the auth cache: `rm -rf ~/.mcp-auth`

### Agentic Workflows (e.g. LangChain, CrewAI)

For agentic frameworks that support MCP tool integration, connect to the remote server using `mcp-remote` as an SSE proxy to handle the OAuth flow.

**LangChain (Python):**

```python
from langchain_mcp_adapters.client import MultiServerMCPClient

async with MultiServerMCPClient(
    {
        "graphor": {
            "url": "https://mcp.graphor.workers.dev/sse",
            "transport": "sse",
        }
    }
) as client:
    tools = client.get_tools()
    # Use tools with your LangChain agent
```

**LangChain (TypeScript):**

```typescript
import { MultiServerMCPClient } from '@langchain/mcp-adapters';

const client = new MultiServerMCPClient({
  graphor: {
    url: 'https://mcp.graphor.workers.dev/sse',
    transport: 'sse',
  },
});

const tools = await client.getTools();
// Use tools with your LangChain agent
```

> Note: The OAuth authentication flow will open a browser window on the first connection. For headless environments, you may need to complete the OAuth flow beforehand or use `mcp-remote` as a local proxy.

### Self-hosted Remote Server

You can also run the MCP server yourself with `--transport=http`, which launches it as a remote server using Streamable HTTP transport. The `--port` setting can choose the port it will run on, and the `--socket` setting allows it to run on a Unix socket.

Authorization can be provided via the `Authorization` header using the Bearer scheme.

Additionally, authorization can be provided via the following headers:
| Header | Equivalent client option | Security scheme |
| ------------------- | ------------------------ | --------------- |
| `x-graphor-api-key` | `apiKey` | HTTPBearer |

A configuration JSON for a self-hosted server might look like this, assuming the server is hosted at `http://localhost:3000`:

```json
{
  "mcpServers": {
    "graphor_api": {
      "url": "http://localhost:3000",
      "headers": {
        "Authorization": "Bearer <auth value>"
      }
    }
  }
}
```
