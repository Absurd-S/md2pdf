import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
import puppeteer from 'puppeteer';
import { renderMarkdown } from './render-engine.js';
import { buildHtmlDocument } from './template/html-template.js';
import { loadThemeCss } from './highlight.js';
import { resolveConfig } from './config.js';
import { exportHtml } from './exporters/html.js';
import { exportPdf } from './exporters/pdf.js';
import { exportPng } from './exporters/png.js';

const FORMAT_EXT = {
  html: '.html',
  pdf: '.pdf',
  png: '.png',
};

export class MarkdownConverter {
  constructor(userOptions = {}) {
    this.options = resolveConfig(userOptions);
    this._browser = null;
  }

  async _getBrowser() {
    if (!this._browser) {
      this._browser = await puppeteer.launch({
        headless: this.options.puppeteer?.headless !== false,
        executablePath: this.options.puppeteer?.executablePath || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this._browser;
  }

  async _renderFullHtml(mdString, overrides = {}) {
    const opts = { ...this.options, ...overrides };
    const bodyHtml = renderMarkdown(mdString, {
      toc: opts.toc,
      tocDepth: opts.tocDepth,
      highlight: opts.highlight,
    });
    const themeCss = loadThemeCss(opts.theme || 'github-dark');
    const customCss = opts.css ? readFileSync(opts.css, 'utf-8') : '';

    return buildHtmlDocument(bodyHtml, {
      title: opts.title || 'Document',
      lang: opts.lang || 'zh-CN',
      highlightCss: themeCss,
      customCss,
    });
  }

  _readInput(input) {
    if (Buffer.isBuffer(input)) return input.toString('utf-8');
    if (existsSync(input)) return readFileSync(input, 'utf-8');
    return input;
  }

  _defaultOutput(inputPath, format) {
    if (typeof inputPath === 'string' && existsSync(inputPath)) {
      const base = inputPath.replace(extname(inputPath), '');
      return base + FORMAT_EXT[format];
    }
    return 'output' + FORMAT_EXT[format];
  }

  async convert(input, format, outputPath) {
    const mdString = this._readInput(input);
    if (!FORMAT_EXT[format]) {
      throw new Error(`Unsupported format: ${format}. Use html, pdf, or png.`);
    }

    const target = outputPath || this._defaultOutput(
      typeof input === 'string' && existsSync(input) ? input : 'document',
      format
    );

    const fullHtml = await this._renderFullHtml(mdString);

    switch (format) {
      case 'html':
        return exportHtml(fullHtml, target);
      case 'pdf': {
        const browser = await this._getBrowser();
        return exportPdf(fullHtml, target, browser, this.options.pdf);
      }
      case 'png': {
        const browser = await this._getBrowser();
        return exportPng(fullHtml, target, browser, this.options.png);
      }
      default:
        throw new Error(`Unknown format: ${format}`);
    }
  }

  async toHtml(input, outputPath) { return this.convert(input, 'html', outputPath); }
  async toPdf(input, outputPath) { return this.convert(input, 'pdf', outputPath); }
  async toPng(input, outputPath) { return this.convert(input, 'png', outputPath); }

  async close() {
    if (this._browser) {
      await this._browser.close();
      this._browser = null;
    }
  }
}
