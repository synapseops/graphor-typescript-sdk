import { parseCLIOptions } from '../src/options';

// Mock process.argv
const mockArgv = (args: string[]) => {
  const originalArgv = process.argv;
  process.argv = ['node', 'test.js', ...args];
  return () => {
    process.argv = originalArgv;
  };
};

describe('parseCLIOptions', () => {
  it('default parsing should be stdio', () => {
    const cleanup = mockArgv([]);

    const result = parseCLIOptions();

    expect(result.transport).toBe('stdio');
    expect(result.debug).toBe(false);

    cleanup();
  });

  it('using http transport with a port', () => {
    const cleanup = mockArgv(['--transport=http', '--port=2222']);

    const result = parseCLIOptions();

    expect(result.transport).toBe('http');
    expect(result.port).toBe(2222);
    cleanup();
  });

  it('debug flag', () => {
    const cleanup = mockArgv(['--debug']);

    const result = parseCLIOptions();

    expect(result.debug).toBe(true);
    cleanup();
  });

  it('socket option', () => {
    const cleanup = mockArgv(['--transport=http', '--socket=/tmp/mcp.sock']);

    const result = parseCLIOptions();

    expect(result.transport).toBe('http');
    expect(result.socket).toBe('/tmp/mcp.sock');
    cleanup();
  });
});
