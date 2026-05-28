<p align="center">
  <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f4dd.svg" width="80" alt="MD2PDF" />
</p>

<h1 align="center">MD2PDF</h1>

<p align="center">
  <strong>Markdown → HTML / PDF / PNG</strong><br>
  Cream canvas · Serif headlines · Dark code blocks · Coral accents<br>
  Design language inspired by <a href="https://claude.com">Anthropic Claude</a>.
</p>

<p align="center">
  <a href="README.md">中文</a> &nbsp;|&nbsp;
  <b>English</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node.js">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-coral" alt="PRs">
</p>

---

## Quick Start

```bash
git clone https://github.com/Absurd-S/md2pdf.git
cd md2pdf
npm install
npm start
```

Open `http://localhost:3000` — paste Markdown on the left, live preview on the right, pick a format and export.

### CLI

Convert directly from the terminal:

```bash
# HTML
node bin/cli.js convert README.md -f html -o output.html

# PDF (A4)
node bin/cli.js convert doc.md -f pdf -o doc.pdf --page-size A4

# PNG (full-page, 2x Retina)
node bin/cli.js convert doc.md -f png -o doc.png --width 1200 --scale 2

# With table of contents + custom code theme
node bin/cli.js convert doc.md -f html -o doc.html --toc --theme monokai

# Start the HTTP server (same as npm start)
node bin/cli.js serve --port 3000
```

Install globally for the `md2pdf` command:

```bash
npm link
md2pdf convert doc.md -f pdf -o doc.pdf
```

## Features

- **3 Export Formats** — HTML, PDF, PNG. Web publishing, print archiving, screenshot sharing.
- **Anthropic Design Language** — Cream canvas (`#faf9f5`), serif display headlines (Cormorant Garamond), coral links, dark code blocks.
- **Dark Code Blocks** — JetBrains Mono on `#181715` background, with highlight.js syntax highlighting.
- **CJK First-class** — Font stack includes PingFang SC / Microsoft YaHei / Noto Sans SC. Line-height tuned for Chinese readability.
- **Fully Offline** — All static assets served locally. Works without internet after `npm install`.
- **HTML Offline Fallback** — When the server is down, the browser generates and downloads HTML directly.

## Screenshots

<!-- Add screenshots after first launch -->
<!-- ![screenshot](https://user-images.githubusercontent.com/...) -->

## API

The web UI is backed by a REST API. You can call it from scripts, CI pipelines, or other tools.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check + available formats & themes |
| `GET` | `/api/themes` | List all highlight.js theme names |
| `POST` | `/api/convert` | Convert Markdown (JSON body, specify format) |
| `POST` | `/api/convert/:format` | Shorthand conversion (`html` / `pdf` / `png`) |

### Example

```bash
curl -X POST http://localhost:3000/api/convert/pdf \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello\n\n**bold text**"}'
```

Response:

```json
{
  "success": true,
  "format": "pdf",
  "mimeType": "application/pdf",
  "data": "JVBERi0xLjQK...",
  "metadata": {
    "title": "Document",
    "sizeBytes": 23451,
    "conversionTimeMs": 823
  }
}
```

The `data` field is Base64-encoded. Decode it client-side to get the binary file.

## Architecture

```
Markdown String / .md File
        │
        ▼
   markdown-it + 8 plugins
   (anchor, toc, footnote, emoji,
    sub/sup, deflist, mark)
        │
        ▼
   HTML Body
        │
        ▼
   Anthropic-styled Template
   (DESIGN.md design tokens)
        │
        ├──▶ HTML  ──▶ write .html
        ├──▶ PDF   ──▶ Puppeteer → page.pdf()
        └──▶ PNG   ──▶ Puppeteer → page.screenshot({ fullPage: true })
```

## Project Structure

```
md2pdf/
├── src/
│   ├── converter.js            # MarkdownConverter — core engine
│   ├── render-engine.js        # markdown-it instance + plugin chain
│   ├── highlight.js            # highlight.js theme loader
│   ├── config.js               # Config cascade (defaults → rc → args)
│   ├── template/
│   │   ├── html-template.js    # Full HTML document wrapper
│   │   └── default-styles.css  # Anthropic design token CSS
│   ├── exporters/
│   │   ├── html.js             # Write .html
│   │   ├── pdf.js              # Puppeteer → PDF
│   │   └── png.js              # Puppeteer → full-page PNG
│   ├── http/
│   │   ├── server.js           # Express server
│   │   └── routes.js           # API route handlers
│   ├── cli/
│   │   └── index.js            # CLI command handlers
│   └── web/
│       ├── index.html          # SPA frontend
│       ├── app.css             # UI styles (DESIGN.md tokens)
│       ├── app.js              # Frontend logic
│       └── vendor/             # Offline vendor bundles
├── bin/
│   └── cli.js                  # CLI entry point
├── config/
│   └── default.json            # Default configuration
├── DESIGN.md                   # Anthropic brand design system reference
└── test/
    └── fixtures/               # Test markdown samples
```

## Design

The output styling follows the [Anthropic Claude brand design system](DESIGN.md):

- **Cream canvas** (`#faf9f5`) — deliberately warm, never pure white. The brand's defining color choice.
- **Serif display** — Cormorant Garamond / Tiempos Headline for h1–h3 at weight 400 with negative letter-spacing.
- **Dark code blocks** — `#181715` background, JetBrains Mono 14px, `github-dark` syntax highlighting.
- **Coral accent** — `#cc785c` on links and primary buttons. Used sparingly.
- **Ink text** — `#141413` for headlines, `#3d3d3a` for body. Warm dark, never pure black.

See [`DESIGN.md`](DESIGN.md) for the full token reference.

## Dependencies

| Package | Purpose |
|---------|---------|
| [`markdown-it`](https://github.com/markdown-it/markdown-it) | Markdown → HTML (8 plugins) |
| [`highlight.js`](https://highlightjs.org/) | Code syntax highlighting |
| [`puppeteer`](https://pptr.dev/) | HTML → PDF / PNG rendering |
| [`express`](https://expressjs.com/) | HTTP server + static hosting |
| [`commander`](https://github.com/tj/commander.js) | CLI argument parsing |

No React. No Vue. No build step. Vanilla HTML/CSS/JS frontend.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Export current format |

## License

MIT © Absurd-S

---

<p align="center">
  <sub>Built with markdown-it + Puppeteer. Design inspired by Anthropic.</sub>
</p>
