import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export type CLIOptions = {
  debug: boolean;
  transport: 'stdio' | 'http';
  port: number | undefined;
  socket: string | undefined;
};

export function parseCLIOptions(): CLIOptions {
  const opts = yargs(hideBin(process.argv))
    .option('debug', { type: 'boolean', description: 'Enable debug logging' })
    .option('port', {
      type: 'number',
      default: 3000,
      description: 'Port to serve on if using http transport',
    })
    .option('socket', { type: 'string', description: 'Unix socket to serve on if using http transport' })
    .option('transport', {
      type: 'string',
      choices: ['stdio', 'http'],
      default: 'stdio',
      description: 'What transport to use; stdio for local servers or http for remote servers',
    })
    .env('MCP_SERVER')
    .version(true)
    .help();

  const argv = opts.parseSync();

  return {
    debug: !!argv.debug,
    transport: argv.transport as 'stdio' | 'http',
    port: argv.port,
    socket: argv.socket,
  };
}
