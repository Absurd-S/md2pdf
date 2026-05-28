import { MarkdownConverter } from '../converter.js';
import { listAvailableThemes } from '../highlight.js';
import { readFileSync } from 'fs';

let converterInstance = null;

function getConverter() {
  if (!converterInstance) {
    converterInstance = new MarkdownConverter();
  }
  return converterInstance;
}

const MIME_TYPES = { html: 'text/html', pdf: 'application/pdf', png: 'image/png' };
const FORMATS = ['html', 'pdf', 'png'];

export function setupRoutes(app) {
  app.get('/api/health', async (req, res) => {
    res.json({
      status: 'ok',
      version: '1.0.0',
      formats: FORMATS,
      puppeteerReady: true,
      themes: listAvailableThemes(),
    });
  });

  app.get('/api/themes', async (req, res) => {
    res.json({ themes: listAvailableThemes() });
  });

  app.post('/api/convert', async (req, res) => {
    try {
      const { markdown, format = 'html', options = {} } = req.body;
      if (!markdown) {
        return res.status(400).json({
          success: false,
          error: { code: 'INPUT_EMPTY', message: 'No markdown content provided.' },
        });
      }
      if (!FORMATS.includes(format)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_FORMAT', message: `Unsupported format: ${format}. Use ${FORMATS.join(', ')}.` },
        });
      }

      const converter = getConverter();
      const startTime = Date.now();
      const result = await converter.convert(markdown, format, `./output/tmp_${Date.now()}.${format}`);
      const buffer = readFileSync(result.filepath);

      res.json({
        success: true,
        format,
        mimeType: MIME_TYPES[format] || 'application/octet-stream',
        data: buffer.toString('base64'),
        metadata: {
          title: options.title || 'Document',
          sizeBytes: buffer.length,
          conversionTimeMs: Date.now() - startTime,
        },
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { code: 'CONVERSION_FAILED', message: err.message },
      });
    }
  });

  for (const fmt of FORMATS) {
    app.post(`/api/convert/${fmt}`, async (req, res) => {
      const { markdown, options = {} } = req.body;
      if (!markdown) {
        return res.status(400).json({
          success: false,
          error: { code: 'INPUT_EMPTY', message: 'No markdown content provided.' },
        });
      }

      try {
        const converter = getConverter();
        const startTime = Date.now();
        const result = await converter.convert(markdown, fmt, `./output/tmp_${Date.now()}.${fmt}`);
        const buffer = readFileSync(result.filepath);

        res.json({
          success: true,
          format: fmt,
          mimeType: MIME_TYPES[fmt] || 'application/octet-stream',
          data: buffer.toString('base64'),
          metadata: {
            title: options.title || 'Document',
            sizeBytes: buffer.length,
            conversionTimeMs: Date.now() - startTime,
          },
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: { code: 'CONVERSION_FAILED', message: err.message },
        });
      }
    });
  }
}
