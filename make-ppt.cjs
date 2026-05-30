const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// ── Design Tokens (Anthropic brand) ──
const C = {
  cream:  "faf9f5",
  coral:  "cc785c",
  dark:   "181715",
  ink:    "141413",
  body:   "3d3d3a",
  muted:  "6c6a64",
  line:   "e6dfd8",
  card:   "efe9de",
  soft:   "f5f0e8",
  white:  "ffffff",
};

const FT = "Georgia";
const FB = "Calibri";

const shadow = () => ({ type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.08 });
const card = (x, y, w, h) => ({ x, y, w, h, fill: { color: C.white }, shadow: shadow(), rectRadius: 0.08 });

function title(s, txt, ico) {
  if (ico) s.addImage({ data: ico, x: 0.7, y: 0.45, w: 0.35, h: 0.35 });
  s.addText(txt, { x: ico ? 1.15 : 0.7, y: 0.4, w: 8, h: 0.55, fontSize: 24, fontFace: FT, color: C.ink, margin: 0 });
}
function footer(s) {
  s.addText("MD2PDF 项目验收  ·  AI 辅助开发实践", { x: 0.5, y: 5.15, w: 5, h: 0.3, fontSize: 8, fontFace: FB, color: C.muted, margin: 0 });
}

function iconSvg(Icon, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(Icon, { color, size: String(size) }));
}
async function iconPng(Icon, color, size = 256) {
  const svg = iconSvg(Icon, color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

async function main() {
  const { HiOutlineLightBulb, HiOutlineCodeBracket, HiOutlineCpuChip, HiOutlinePhoto,
          HiOutlineDocumentText, HiOutlineSwatch, HiOutlineChartBar,
          HiOutlineAcademicCap, HiOutlineHeart,
          HiOutlineSparkles, HiOutlineComputerDesktop } = require("react-icons/hi2");

  const ico = {
    bulb:    await iconPng(HiOutlineLightBulb, "#cc785c"),
    code:    await iconPng(HiOutlineCodeBracket, "#cc785c"),
    chip:    await iconPng(HiOutlineCpuChip, "#cc785c"),
    photo:   await iconPng(HiOutlinePhoto, "#cc785c"),
    doc:     await iconPng(HiOutlineDocumentText, "#cc785c"),
    swatch:  await iconPng(HiOutlineSwatch, "#cc785c"),
    chart:   await iconPng(HiOutlineChartBar, "#cc785c"),
    heart:   await iconPng(HiOutlineHeart, "#cc785c"),
    spark:   await iconPng(HiOutlineSparkles, "#cc785c"),
    desktop: await iconPng(HiOutlineComputerDesktop, "#cc785c"),
  };

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "AI 辅助开发实践";
  pres.title = "MD2PDF — Markdown 转换工坊";

  // ========================
  // SLIDE 1 — 封面 (Dark)
  // ========================
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.coral } });
    s.addText("*", { x: 4.5, y: 0.9, w: 1, h: 0.7, fontFace: FT, fontSize: 36, color: C.coral, align: "center", margin: 0 });
    s.addText("MD2PDF", { x: 1, y: 1.5, w: 8, h: 0.7, fontFace: FT, fontSize: 40, color: C.white, align: "center", margin: 0 });
    s.addText("Markdown 转换工坊", { x: 1, y: 2.1, w: 8, h: 0.5, fontFace: FB, fontSize: 20, color: C.line, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.8, y: 2.8, w: 2.4, h: 0.03, fill: { color: C.coral } });
    s.addText("AI 辅助开发实践", { x: 1, y: 3.05, w: 8, h: 0.45, fontFace: FB, fontSize: 16, color: C.muted, align: "center", margin: 0 });
    s.addText("AI 工具：DeepSeek + 豆包       技术栈：Node.js · markdown-it · Puppeteer", {
      x: 1.5, y: 3.8, w: 7, h: 0.5, fontSize: 11, fontFace: FB, color: C.muted, align: "center", margin: 0,
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.425, w: 10, h: 0.2, fill: { color: C.coral } });
  }

  // ========================
  // SLIDE 2 — 项目缘起
  // ========================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    title(s, "项目缘起", ico.bulb);

    s.addText([
      { text: "痛点", options: { bold: true, fontSize: 16, color: C.ink, breakLine: true } },
      { text: "", options: { fontSize: 7, breakLine: true } },
      { text: "日常写作中，Markdown 文档需要频繁转换为不同格式——发布博客要 HTML，打印作业要 PDF，社交分享要 PNG。市面上的在线工具要么广告泛滥，要么排版丑陋，要么样式不可定制。", options: { breakLine: true } },
      { text: "", options: { fontSize: 10, breakLine: true } },
      { text: "契机", options: { bold: true, fontSize: 16, color: C.ink, breakLine: true } },
      { text: "", options: { fontSize: 7, breakLine: true } },
      { text: "在接触 DeepSeek 和豆包之后，我意识到 AI 可以让一个人完成过去需要团队协作的工作量。于是决定借助 AI 的力量，从零搭建一个属于自己的 Markdown 转换工具——既是实用工具，也是一次 AI 辅助开发的深度学习实践。", options: { breakLine: true } },
    ], { x: 0.8, y: 1.3, w: 5.5, h: 3.6, fontFace: FB, fontSize: 12, color: C.body, lineSpacingMultiple: 1.3, valign: "top", margin: 0 });

    // Right card
    s.addShape(pres.shapes.RECTANGLE, card(6.7, 1.3, 2.8, 3.6));
    s.addImage({ data: ico.spark, x: 7.1, y: 1.6, w: 0.4, h: 0.4 });
    s.addText("核心目标", { x: 6.9, y: 2.15, w: 2.4, h: 0.4, fontSize: 14, fontFace: FB, color: C.ink, bold: true, align: "center", margin: 0 });
    s.addText([
      { text: "零学习成本", options: { breakLine: true } },
      { text: "粘贴即用，无需注册", options: { breakLine: true } },
      { text: "", options: { fontSize: 6, breakLine: true } },
      { text: "输出美观", options: { breakLine: true } },
      { text: "专业排版，可自定义", options: { breakLine: true } },
      { text: "", options: { fontSize: 6, breakLine: true } },
      { text: "AI 协作", options: { breakLine: true } },
      { text: "全程人机协作开发", options: { breakLine: true } },
      { text: "", options: { fontSize: 6, breakLine: true } },
      { text: "开源共享", options: { breakLine: true } },
      { text: "GitHub · MIT 协议", options: {} },
    ], { x: 7.1, y: 2.65, w: 2.0, h: 2.0, fontFace: FB, fontSize: 11, color: C.body, lineSpacingMultiple: 1.35, margin: 0 });
    footer(s);
  }

  // ========================
  // SLIDE 3 — AI 协作流程
  // ========================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    title(s, "AI 协作流程", ico.chip);

    const steps = [
      { label: "需求分析", sub: "DeepSeek 头脑风暴\n确定功能边界", x: 0.2 },
      { label: "技术选型", sub: "对比 Node.js vs Python\n选定技术栈", x: 2.1 },
      { label: "架构设计", sub: "豆包生成初版方案\nDeepSeek 审查优化", x: 4.0 },
      { label: "编码实现", sub: "AI 生成骨架代码\n人工调整细节", x: 5.9 },
      { label: "测试验证", sub: "自动化测试用例\n浏览器手动验收", x: 7.8 },
    ];

    steps.forEach((st, i) => {
      const x = st.x;
      s.addShape(pres.shapes.RECTANGLE, card(x, 1.6, 1.85, 2.2));
      // Number
      s.addShape(pres.shapes.OVAL, { x: x + 0.6, y: 1.8, w: 0.6, h: 0.6, fill: { color: C.coral } });
      s.addText(String(i + 1), { x: x + 0.6, y: 1.8, w: 0.6, h: 0.6, fontSize: 18, fontFace: FB, color: C.white, align: "center", valign: "middle", bold: true, margin: 0 });
      s.addText(st.label, { x: x + 0.05, y: 2.6, w: 1.75, h: 0.35, fontSize: 13, fontFace: FB, color: C.ink, bold: true, align: "center", margin: 0 });
      s.addText(st.sub, { x: x + 0.1, y: 3.0, w: 1.65, h: 0.7, fontSize: 9, fontFace: FB, color: C.muted, align: "center", lineSpacingMultiple: 1.35, margin: 0 });
      if (i < steps.length - 1) {
        s.addText("→", { x: x + 1.88, y: 2.2, w: 0.2, h: 0.4, fontSize: 16, color: C.coral, align: "center", margin: 0 });
      }
    });

    // AI role bottom cards
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.2, w: 4.0, h: 0.75, fill: { color: C.soft }, rectRadius: 0.06 });
    s.addText([
      { text: "DeepSeek    架构设计 · 代码审查 · 复杂 Debug · 技术决策", options: {} },
    ], { x: 1.0, y: 4.3, w: 3.6, h: 0.55, fontSize: 10, fontFace: FB, color: C.body, lineSpacingMultiple: 1.3, valign: "middle", margin: 0 });

    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 4.2, w: 4.0, h: 0.75, fill: { color: C.soft }, rectRadius: 0.06 });
    s.addText([
      { text: "豆包          快速原型 · CSS 样式 · 文档撰写 · 设计建议", options: {} },
    ], { x: 5.4, y: 4.3, w: 3.6, h: 0.55, fontSize: 10, fontFace: FB, color: C.body, lineSpacingMultiple: 1.3, valign: "middle", margin: 0 });

    footer(s);
  }

  // ========================
  // SLIDE 4 — 技术架构
  // ========================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    title(s, "技术架构", ico.code);

    const fy = 1.7;
    const nodes = [
      { label: "Markdown\n.md 文件", x: 0.4, w: 1.5, fill: C.soft },
      { label: "markdown-it\n8 插件解析", x: 2.15, w: 1.6, fill: C.soft },
      { label: "HTML Body\n结构化文档", x: 4.0, w: 1.5, fill: C.soft },
      { label: "模板包裹\nDESIGN.md 令牌", x: 5.75, w: 1.6, fill: C.soft },
    ];

    nodes.forEach(n => {
      s.addShape(pres.shapes.RECTANGLE, { x: n.x, y: fy, w: n.w, h: 1.0, fill: { color: n.fill }, shadow: shadow(), rectRadius: 0.06 });
      s.addText(n.label, { x: n.x, y: fy, w: n.w, h: 1.0, fontSize: 11, fontFace: FB, color: C.ink, align: "center", valign: "middle", lineSpacingMultiple: 1.4, margin: 0 });
    });
    for (let i = 0; i < nodes.length - 1; i++) {
      s.addText("→", { x: nodes[i].x + nodes[i].w + 0.02, y: fy + 0.2, w: 0.2, h: 0.5, fontSize: 18, color: C.coral, align: "center", valign: "middle", margin: 0 });
    }

    // Output branches via Puppeteer
    const ox = 7.7;
    s.addShape(pres.shapes.RECTANGLE, { x: ox - 0.3, y: 1.95, w: 0.4, h: 0.5, fill: { color: C.soft }, rectRadius: 0.04 });
    s.addText("via", { x: ox - 0.3, y: 1.95, w: 0.4, h: 0.5, fontSize: 7, fontFace: FB, color: C.muted, align: "center", valign: "middle", margin: 0 });

    const outputs = [
      { label: "HTML", sub: "导出网页", y: fy - 0.15, bg: C.coral },
      { label: "PDF", sub: "A4 打印", y: fy + 0.45, bg: C.dark },
      { label: "PNG", sub: "全页截图", y: fy + 1.05, bg: C.dark },
    ];
    outputs.forEach(o => {
      s.addShape(pres.shapes.RECTANGLE, { x: ox, y: o.y, w: 1.8, h: 0.5, fill: { color: o.bg }, rectRadius: 0.06 });
      s.addText([{ text: o.label + "  ", options: { bold: true, color: C.white } }, { text: o.sub, options: { color: C.line } }], {
        x: ox, y: o.y, w: 1.8, h: 0.5, fontSize: 11, fontFace: FB, align: "center", valign: "middle", margin: 0,
      });
    });

    s.addText("Puppeteer", { x: 7.3, y: fy + 1.6, w: 2.7, h: 0.3, fontSize: 9, fontFace: FB, color: C.muted, align: "center", margin: 0 });

    // Bottom tech chips
    s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.2, w: 8.4, h: 0.7, fill: { color: C.soft }, rectRadius: 0.06 });
    s.addText("Node.js v24  ·  Express 5  ·  Commander  ·  markdown-it + 8 plugins  ·  highlight.js  ·  Puppeteer", {
      x: 1.0, y: 4.25, w: 8.0, h: 0.6, fontSize: 11, fontFace: FB, color: C.body, align: "center", valign: "middle", margin: 0,
    });

    footer(s);
  }

  // ========================
  // SLIDE 5 — 功能展示
  // ========================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    title(s, "功能展示", ico.desktop);

    const feats = [
      { ico: ico.doc, title: "HTML 导出", desc: "Anthropic 风格排版\n奶油画布 · 衬线标题\n深色代码块 · 珊瑚点缀", accent: C.coral },
      { ico: ico.photo, title: "PDF 导出", desc: "Chromium 高质量渲染\nA4 / Letter 纸张可选\n打印背景色完整保留", accent: C.dark },
      { ico: ico.chart, title: "PNG 导出", desc: "全页高清截图\n自适应内容高度\n2x Retina 分辨率", accent: C.dark },
    ];

    feats.forEach((f, i) => {
      const x = 0.7 + i * 3.1;
      s.addShape(pres.shapes.RECTANGLE, card(x, 1.5, 2.8, 3.0));
      s.addShape(pres.shapes.RECTANGLE, { x: x, y: 1.5, w: 2.8, h: 0.05, fill: { color: f.accent } });
      s.addImage({ data: f.ico, x: x + 1.1, y: 1.9, w: 0.5, h: 0.5 });
      s.addText(f.title, { x: x + 0.2, y: 2.55, w: 2.4, h: 0.4, fontSize: 16, fontFace: FB, color: C.ink, bold: true, align: "center", margin: 0 });
      s.addText(f.desc, { x: x + 0.3, y: 3.0, w: 2.2, h: 1.2, fontSize: 11, fontFace: FB, color: C.muted, align: "center", lineSpacingMultiple: 1.5, margin: 0 });
    });

    // Workflow bar
    s.addShape(pres.shapes.RECTANGLE, { x: 1.3, y: 4.8, w: 7.4, h: 0.55, fill: { color: C.soft }, rectRadius: 0.04 });
    s.addText("📝 粘贴 Markdown   →   👀 实时预览   →   📥 一键导出       拖拽上传 · Ctrl+Enter 快捷下载", {
      x: 1.5, y: 4.8, w: 7.0, h: 0.55, fontSize: 11, fontFace: FB, color: C.muted, align: "center", valign: "middle", margin: 0,
    });

    footer(s);
  }

  // ========================
  // SLIDE 6 — 设计亮点
  // ========================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    title(s, "设计亮点", ico.swatch);

    const tokens = [
      { label: "奶油画布", color: C.cream, text: "#faf9f5", desc: "温暖的底色\n刻意不用纯白", dark: false },
      { label: "衬线标题", color: C.card, text: "Cormorant\nGaramond", desc: "字重 400\n负 letter-spacing", dark: false },
      { label: "深色代码块", color: C.dark, text: "#181715", desc: "JetBrains Mono\n黑底白字高亮", dark: true },
      { label: "珊瑚色点缀", color: C.coral, text: "#cc785c", desc: "主 CTA 按钮\n克制不溢用", dark: true },
    ];

    tokens.forEach((t, i) => {
      const x = 0.6 + i * 2.35;
      s.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.0, h: 1.6, fill: { color: t.color }, shadow: shadow(), rectRadius: 0.08 });
      s.addText(t.text, { x: x + 0.15, y: 1.65, w: 1.7, h: 0.8, fontSize: 11, fontFace: FB, color: t.dark ? C.white : C.ink, align: "center", valign: "middle", lineSpacingMultiple: 1.2, margin: 0 });
      s.addText(t.label, { x, y: 3.25, w: 2.0, h: 0.35, fontSize: 13, fontFace: FB, color: C.ink, bold: true, align: "center", margin: 0 });
      s.addText(t.desc, { x, y: 3.6, w: 2.0, h: 0.7, fontSize: 10, fontFace: FB, color: C.muted, align: "center", lineSpacingMultiple: 1.4, margin: 0 });
    });

    s.addText("设计系统参考 Anthropic Claude 品牌规范 (DESIGN.md)，包含完整的色彩、字体、圆角、间距令牌", {
      x: 1, y: 4.6, w: 8, h: 0.45, fontSize: 10, fontFace: FB, color: C.muted, align: "center", margin: 0,
    });
    footer(s);
  }

  // ========================
  // SLIDE 7 — AI 工具对比
  // ========================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    title(s, "AI 工具使用对比", ico.chart);

    const cols = [
      { name: "DeepSeek", accent: C.coral, items: [
        "架构设计与技术选型",
        "复杂 Bug 调试定位",
        "代码审查与重构建议",
        "markdown-it 插件链设计",
        "Puppeteer 配置优化",
        "推理能力强，逻辑清晰",
        "长上下文支持好",
        "代码生成准确率高",
      ]},
      { name: "豆包 (Doubao)", accent: C.muted, items: [
        "CSS 样式与 UI 美化",
        "设计系统文档生成",
        "README / 注释等文案",
        "DESIGN.md 令牌体系",
        "前端页面布局迭代",
        "响应速度快，交互友好",
        "UI / 视觉建议直观",
        "中文理解细腻",
      ]},
    ];

    cols.forEach((col, ci) => {
      const x = 0.8 + ci * 4.6;
      const cw = 4.0;
      s.addShape(pres.shapes.RECTANGLE, card(x, 1.5, cw, 3.4));
      s.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: cw, h: 0.05, fill: { color: col.accent } });
      s.addText(col.name, { x: x + 0.3, y: 1.75, w: cw - 0.6, h: 0.4, fontSize: 18, fontFace: FB, color: C.ink, bold: true, margin: 0 });

      s.addText(col.items.map((item, i) => ({
        text: item,
        options: { bullet: true, breakLine: i < col.items.length - 1, color: C.body },
      })), { x: x + 0.4, y: 2.2, w: cw - 0.8, h: 2.5, fontFace: FB, fontSize: 11, lineSpacingMultiple: 1.3, margin: 0 });
    });

    footer(s);
  }

  // ========================
  // SLIDE 8 — 项目成果
  // ========================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    title(s, "项目成果", ico.chart);

    const stats = [
      { num: "3", label: "输出格式", sub: "HTML / PDF / PNG" },
      { num: "~1100", label: "行代码", sub: "前端 + 后端" },
      { num: "23", label: "源文件", sub: "核心模块" },
      { num: "6", label: "依赖", sub: "精简后" },
    ];
    stats.forEach((st, i) => {
      const x = 0.6 + i * 2.3;
      s.addShape(pres.shapes.RECTANGLE, card(x, 1.5, 2.0, 1.8));
      s.addText(st.num, { x, y: 1.55, w: 2.0, h: 0.65, fontSize: 38, fontFace: FT, color: C.coral, align: "center", margin: 0 });
      s.addText(st.label, { x, y: 2.25, w: 2.0, h: 0.35, fontSize: 12, fontFace: FB, color: C.ink, bold: true, align: "center", margin: 0 });
      s.addText(st.sub, { x, y: 2.6, w: 2.0, h: 0.3, fontSize: 10, fontFace: FB, color: C.muted, align: "center", margin: 0 });
    });

    s.addShape(pres.shapes.RECTANGLE, card(0.8, 3.7, 8.4, 1.3));
    s.addText([
      { text: "实现功能", options: { bold: true, fontSize: 12, color: C.ink, breakLine: true } },
      { text: "三种使用方式（前端 Web UI · CLI 命令行 · REST API）始终在线", options: { bullet: true, breakLine: true } },
      { text: "Anthropic 品牌设计语言——奶油画布、衬线标题、深色代码块、珊瑚色点缀", options: { bullet: true, breakLine: true } },
      { text: "实时预览 + 拖拽上传 + 离线 HTML 降级，服务端不可用时浏览器直接生成", options: { bullet: true, breakLine: true } },
      { text: "GitHub 开源 · MIT 协议 · 中英双语 README", options: { bullet: true } },
    ], { x: 1.1, y: 3.8, w: 7.8, h: 1.1, fontFace: FB, fontSize: 11, color: C.body, lineSpacingMultiple: 1.4, valign: "middle", margin: 0 });

    footer(s);
  }

  // ========================
  // SLIDE 9 — 心得感悟
  // ========================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };
    title(s, "心得感悟", ico.heart);

    const insights = [
      { title: "AI 是工具，不是替代者",
        body: "AI 能加速编码、生成方案，但最终的判断力、审美品味、系统设计思维仍然来自人。本项目约 70% 的代码由 AI 辅助生成，但 100% 的架构决策和设计方向由人来做出。" },
      { title: "学会提问比学会编码更重要",
        body: "用好 AI 的关键不是技术能力，而是表达能力——能把需求拆解成清晰的 Prompt，能指出 AI 输出中的问题，能在多轮对话中收敛到正确方案。这是一种全新的元技能。" },
      { title: "人机协作让「一个人」变成「一支队伍」",
        body: "过去需要前后端分离、多人协作的项目，现在借助 AI 一个人就能完成。这不仅是效率的提升，更是创造力边界的扩展。未来工程师的核心竞争力 = 领域知识 + AI 驾驭力 + 批判性思维。" },
    ];

    insights.forEach((ins, i) => {
      const y = 1.45 + i * 1.2;
      s.addShape(pres.shapes.RECTANGLE, card(0.8, y, 8.4, 1.0));
      s.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 0.06, h: 1.0, fill: { color: C.coral } });
      s.addText(ins.title, { x: 1.15, y: y + 0.08, w: 7.8, h: 0.3, fontSize: 14, fontFace: FB, color: C.ink, bold: true, margin: 0 });
      s.addText(ins.body, { x: 1.15, y: y + 0.4, w: 7.8, h: 0.55, fontSize: 10.5, fontFace: FB, color: C.body, lineSpacingMultiple: 1.3, margin: 0 });
    });

    footer(s);
  }

  // ========================
  // SLIDE 10 — 致谢 & QA (Dark)
  // ========================
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.coral } });
    s.addText("*", { x: 4.5, y: 0.9, w: 1, h: 0.7, fontFace: FT, fontSize: 36, color: C.coral, align: "center", margin: 0 });
    s.addText("感谢聆听", { x: 1, y: 1.6, w: 8, h: 0.7, fontFace: FT, fontSize: 36, color: C.white, align: "center", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.8, y: 2.45, w: 2.4, h: 0.03, fill: { color: C.coral } });
    s.addText("Q & A", { x: 1, y: 2.7, w: 8, h: 0.5, fontFace: FB, fontSize: 18, color: C.line, align: "center", margin: 0 });

    s.addText([
      { text: "AI 工具：DeepSeek + 豆包", options: { breakLine: true } },
      { text: "技术栈：Node.js · markdown-it · Puppeteer · Express", options: { breakLine: true } },
      { text: "GitHub：github.com/Absurd-S/md2pdf", options: { breakLine: true } },
      { text: "开源协议：MIT", options: {} },
    ], { x: 2, y: 3.4, w: 6, h: 1.4, fontFace: FB, fontSize: 13, color: C.muted, align: "center", lineSpacingMultiple: 1.8, margin: 0 });

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.425, w: 10, h: 0.2, fill: { color: C.coral } });
  }

  // ── Save ──
  await pres.writeFile({ fileName: "D:/MyFile/CODE/ClaudeCode/MD2PDF/MD2PDF_验收演示.pptx" });
  console.log("Done: MD2PDF_验收演示.pptx");
}

main().catch(err => { console.error(err); process.exit(1); });
