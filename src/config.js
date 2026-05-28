import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDefaultConfig() {
  const raw = readFileSync(resolve(__dirname, '../config/default.json'), 'utf-8');
  return JSON.parse(raw);
}

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (override[key] !== null && typeof override[key] === 'object' && !Array.isArray(override[key])) {
      result[key] = deepMerge(result[key] || {}, override[key]);
    } else if (override[key] !== undefined && override[key] !== null) {
      result[key] = override[key];
    }
  }
  return result;
}

function findRcFile(startDir) {
  let dir = startDir;
  const root = resolve('/');
  while (dir !== root && dir !== resolve(dir, '..')) {
    const rcPath = resolve(dir, '.md2pdfrc.json');
    if (existsSync(rcPath)) return rcPath;
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function loadRcConfig() {
  const cwd = process.cwd();
  const rcPath = findRcFile(cwd);
  if (rcPath) {
    try {
      return JSON.parse(readFileSync(rcPath, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

export function resolveConfig(cliOptions = {}) {
  const defaults = loadDefaultConfig();
  const rc = loadRcConfig();
  return deepMerge(deepMerge(defaults, rc), cliOptions);
}

export default { resolveConfig };
