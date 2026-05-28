<p align="center">
  <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f4dd.svg" width="80" alt="MD2PDF" />
</p>

<h1 align="center">MD2PDF</h1>

<p align="center">
  <strong>Markdown → HTML / PDF / PNG 一键转换</strong><br>
  奶油画布 · 衬线标题 · 深色代码块 · 珊瑚色点缀<br>
  设计语言参考 <a href="https://claude.com">Anthropic Claude</a> 品牌系统。
</p>

<p align="center">
  <b>中文</b> &nbsp;|&nbsp;
  <a href="README_EN.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node.js">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-coral" alt="PRs">
</p>

---

## 项目定位

一个**开箱即用**的 Markdown 转换工具。粘贴 Markdown，实时预览，一键导出 HTML / PDF / PNG。没有构建步骤，没有框架依赖，纯原生前端 + Node.js 后端。

适合写技术文档、周报、博客草稿、项目 README——写完即导出，格式不丢。

## 快速开始

```bash
git clone https://github.com/Absurd-S/md2pdf.git
cd md2pdf
npm install
npm start
```

浏览器打开 `http://localhost:3000`，左侧粘贴 Markdown，右侧实时预览，上方选择格式点击导出。

### CLI 命令行

也支持直接在终端转换：

```bash
# HTML
node bin/cli.js convert README.md -f html -o output.html

# PDF（A4 纸张）
node bin/cli.js convert doc.md -f pdf -o doc.pdf --page-size A4

# PNG（全页截图, 2x Retina）
node bin/cli.js convert doc.md -f png -o doc.png --width 1200 --scale 2

# 带目录 + 自定义代码主题
node bin/cli.js convert doc.md -f html -o doc.html --toc --theme monokai

# 启动 HTTP 服务（同 npm start）
node bin/cli.js serve --port 3000
```

全局安装后可直接使用 `md2pdf` 命令：

```bash
npm link
md2pdf convert doc.md -f pdf -o doc.pdf
```

## 功能亮点

- **3 种导出格式** — HTML、PDF、PNG，覆盖网页发布、打印归档、截图分享三大场景
- **Anthropic 设计语言** — 奶油画布底色（`#faf9f5`），衬线标题（Cormorant Garamond），珊瑚色链接，深色代码块
- **代码块黑底白字** — JetBrains Mono 等宽字体，`#181715` 底色，搭配 highlight.js 语法高亮
- **CJK 一等公民** — 字体栈内置 PingFang SC / Microsoft YaHei / Noto Sans SC，行高为中文阅读调优
- **纯离线可用** — 所有静态资源本地提供，`npm install` 后断网也能跑
- **HTML 离线降级** — 服务端不可用时，浏览器端直接生成 HTML 并下载，无需后端

## 页面截图

<!-- 首次启动后在此处补充截图 -->
<!-- ![screenshot](https://user-images.githubusercontent.com/...) -->

## API 接口

前端页面背后是 REST API。你也可以在脚本、CI 流水线或其他工具中直接调用。

### 端点一览

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 健康检查，返回可用格式与 highlight.js 主题列表 |
| `GET` | `/api/themes` | 列出所有 highlight.js 主题名称 |
| `POST` | `/api/convert` | 通用转换（JSON body，指定 format） |
| `POST` | `/api/convert/:format` | 快捷转换，`:format` 为 `html` / `pdf` / `png` |

### 调用示例

```bash
# 转 PDF
curl -X POST http://localhost:3000/api/convert/pdf \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# 你好\n\n**加粗文字**"}'
```

返回：

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

`data` 字段为 Base64 编码的文件内容，客户端解码后即可得到二进制文件。

## 架构

```
Markdown 字符串 / .md 文件
        │
        ▼
   markdown-it + 8 个插件
   (anchor, toc, footnote, emoji,
    sub/sup, deflist, mark)
        │
        ▼
   HTML Body
        │
        ▼
   模板包裹（Anthropic 设计令牌）
        │
        ├──▶ HTML  ──▶ 写出 .html
        ├──▶ PDF   ──▶ Puppeteer → page.pdf()
        └──▶ PNG   ──▶ Puppeteer → page.screenshot({ fullPage: true })
```

## 项目结构

```
md2pdf/
├── src/
│   ├── converter.js            # MarkdownConverter 核心转换引擎
│   ├── render-engine.js        # markdown-it 实例 + 插件链
│   ├── highlight.js            # highlight.js 主题加载
│   ├── config.js               # 配置级联（默认值 → rc 文件 → 参数）
│   ├── template/
│   │   ├── html-template.js    # 完整 HTML 文档包装器
│   │   └── default-styles.css  # Anthropic 设计令牌驱动的 CSS
│   ├── exporters/
│   │   ├── html.js             # HTML 文件写出
│   │   ├── pdf.js              # Puppeteer → PDF
│   │   └── png.js              # Puppeteer → 全页截图
│   ├── http/
│   │   ├── server.js           # Express 服务器
│   │   └── routes.js           # API 路由
│   └── web/
│       ├── index.html          # 前端单页面
│       ├── app.css             # 前端样式（DESIGN.md 令牌驱动）
│       ├── app.js              # 前端交互逻辑
│       └── vendor/             # 离线 vendor 打包
├── config/
│   └── default.json            # 默认配置
├── DESIGN.md                   # Anthropic 品牌设计系统参考
└── test/
    └── fixtures/               # 测试用 Markdown 样本
```

## 设计说明

输出排版遵循 [Anthropic Claude 品牌设计系统](DESIGN.md)：

- **奶油画布**（`#faf9f5`）—— 温暖的底色，刻意不用纯白，是品牌的核心区隔
- **衬线标题** —— Cormorant Garamond / Tiempos Headline，字重 400，负 letter-spacing
- **深色代码块** —— `#181715` 底色 + JetBrains Mono 14px + `github-dark` 语法高亮
- **珊瑚色点缀** —— `#cc785c` 用于链接和主按钮，克制使用，不外溢
- **墨水正文** —— 标题 `#141413`、正文 `#3d3d3a`，暖黑而非纯黑

完整令牌参考见 [`DESIGN.md`](DESIGN.md)。

## 依赖

| 包 | 用途 |
|---------|---------|
| [`markdown-it`](https://github.com/markdown-it/markdown-it) | Markdown → HTML（含 8 个插件） |
| [`highlight.js`](https://highlightjs.org/) | 代码语法高亮 |
| [`puppeteer`](https://pptr.dev/) | HTML → PDF / PNG 渲染 |
| [`express`](https://expressjs.com/) | HTTP 服务 + 静态文件托管 |

没有 React，没有 Vue，没有 Webpack。前端是原生 HTML/CSS/JS。

## 快捷键

| 快捷键 | 操作 |
|----------|--------|
| `Ctrl+Enter` | 导出当前所选格式 |

## 开源许可

MIT © Absurd-S

---

<p align="center">
  <sub>Built with markdown-it + Puppeteer. Design inspired by Anthropic.</sub>
</p>
