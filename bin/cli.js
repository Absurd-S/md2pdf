#!/usr/bin/env node
import { Command } from 'commander';
import { convertCommand, serveCommand } from '../src/cli/index.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('md2pdf')
  .description('Markdown → HTML / PDF / PNG 一键转换')
  .version(pkg.version);

program
  .command('convert [input]')
  .alias('c')
  .description('转换 Markdown 文件')
  .option('-f, --format <format>', '输出格式: html, pdf, png', 'html')
  .option('-o, --output <path>', '输出文件路径（默认根据 input 文件名 + 格式后缀）')
  .option('-t, --theme <theme>', 'highlight.js 主题', 'github-dark')
  .option('-c, --css <path>', '注入自定义 CSS 文件')
  .option('--title <title>', '文档标题')
  .option('--lang <lang>', '文档语言', 'zh-CN')
  .option('--toc', '生成目录')
  .option('--toc-depth <n>', '目录深度 (1-6)', parseInt, 3)
  .option('--no-highlight', '关闭代码高亮')
  .option('--page-size <size>', 'PDF 纸张: A4, Letter, Legal', 'A4')
  .option('--margin <margin>', 'PDF 边距 (如 20mm)', '20mm')
  .option('--landscape', 'PDF 横向')
  .option('--width <pixels>', 'PNG 视口宽度', parseInt, 1200)
  .option('--scale <n>', 'PNG 缩放倍率', parseFloat, 2)
  .option('--config <path>', '配置文件路径')
  .option('--debug', '输出调试信息')
  .action(async (input, options) => {
    try {
      await convertCommand(input || '', options);
    } catch (err) {
      console.error('Error:', err.message);
      if (options.debug) console.error(err);
      process.exit(1);
    }
  });

program
  .command('serve')
  .alias('s')
  .description('启动 HTTP 服务 + 前端页面')
  .option('-p, --port <port>', '端口号', parseInt, 3000)
  .option('-H, --host <host>', '绑定地址', '0.0.0.0')
  .option('--debug', '输出调试信息')
  .action(async (options) => {
    try {
      await serveCommand(options);
    } catch (err) {
      console.error('Error:', err.message);
      if (options.debug) console.error(err);
      process.exit(1);
    }
  });

program.parse();
