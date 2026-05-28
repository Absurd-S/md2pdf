import { MarkdownConverter } from '../converter.js';

function detectFormat(outputPath) {
  if (!outputPath) return null;
  const ext = outputPath.toLowerCase();
  if (ext.endsWith('.html')) return 'html';
  if (ext.endsWith('.pdf')) return 'pdf';
  if (ext.endsWith('.png')) return 'png';
  return null;
}

export async function convertCommand(input, options) {
  const converter = new MarkdownConverter(options);

  try {
    const format = options.format || detectFormat(options.output) || 'html';
    const result = await converter.convert(input, format, options.output);

    if (result.warning) {
      console.warn(`Warning: ${result.warning}`);
    }

    console.log(`Converted: ${result.filepath}`);
    if (options.debug) {
      console.log('Options:', JSON.stringify(options, null, 2));
    }
  } finally {
    await converter.close();
  }
}

export async function serveCommand(options) {
  const { createServer } = await import('../http/server.js');
  const server = createServer(options);
  console.log(`MD2PDF server: http://${options.host || '0.0.0.0'}:${options.port || 3000}`);
  console.log('Endpoints:');
  console.log('  GET  /api/health');
  console.log('  POST /api/convert');
  console.log('  GET  /              (frontend UI)');

  process.on('SIGINT', () => { server.close(); process.exit(0); });
  process.on('SIGTERM', () => { server.close(); process.exit(0); });
}
