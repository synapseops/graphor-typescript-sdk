#!/usr/bin/env node

import { selectTools } from './server';
import { parseCLIOptions } from './options';
import { launchStdioServer } from './stdio';
import { launchStreamableHTTPServer } from './http';

async function main() {
  const options = parseOptionsOrError();

  const selectedTools = selectTools();

  console.error(
    `MCP Server starting with ${selectedTools.length} tools:`,
    selectedTools.map((e) => e.tool.name),
  );

  switch (options.transport) {
    case 'stdio':
      await launchStdioServer();
      break;
    case 'http':
      await launchStreamableHTTPServer({
        debug: options.debug,
        port: options.port ?? options.socket,
      });
      break;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
  });
}

function parseOptionsOrError() {
  try {
    return parseCLIOptions();
  } catch (error) {
    console.error('Error parsing options:', error);
    process.exit(1);
  }
}
