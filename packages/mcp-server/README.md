# Graphor TypeScript MCP Server

It is generated with [Stainless](https://www.stainless.com/).

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

If you use MCP, you can install the MCP server by clicking the link below. You will need to set your environment variables
in VS Code's `mcp.json`, which can be found via Command Palette > MCP: Open User Configuration.

[Open VS Code](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22graphor-mcp%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22graphor-mcp%22%5D%2C%22env%22%3A%7B%22GRAPHOR_API_KEY%22%3A%22My%20API%20Key%22%7D%7D)

### Claude Code

If you use Claude Code, you can install the MCP server by running the command below in your terminal. You will need to set your
environment variables in Claude Code's `.claude.json`, which can be found in your home directory.

```
claude mcp add graphor_mcp_api --env GRAPHOR_API_KEY="My API Key" -- npx -y graphor-mcp
```

## Code Mode

This MCP server is built on the "Code Mode" tool scheme. In this MCP Server,
your agent will write code against the TypeScript SDK, which will then be executed in an
isolated sandbox. To accomplish this, the server will expose two tools to your agent:

- The first tool is a docs search tool, which can be used to generically query for
  documentation about your API/SDK.

- The second tool is a code tool, where the agent can write code against the TypeScript SDK.
  The code will be executed in a sandbox environment without web or filesystem access. Then,
  anything the code returns or prints will be returned to the agent as the result of the
  tool call.

Using this scheme, agents are capable of performing very complex tasks deterministically
and repeatably.

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
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const client = new MultiServerMCPClient({
  graphor: {
    url: "https://mcp.graphor.workers.dev/sse",
    transport: "sse",
  }
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
