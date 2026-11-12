// Reports the size of `index.js` (`pnpm size`): raw, minified, and minified
// with gzip and brotli. Minified with terser (compress + top-level mangle).
// Report only: it never fails on a size change.
//
// `--base <git ref>` also measures `index.js` at that ref and shows the
// difference (e.g. `pnpm size --base master`). If the ref can't be read, the
// report leaves the comparison out.
//
// In GitHub Actions the table is also appended to the job summary.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { minify } from 'terser';

const { log, warn } = console;

const args = process.argv.slice(2);
const baseRef = args.includes('--base') ? args[args.indexOf('--base') + 1] : '';
const rootDir = path.resolve(import.meta.dirname, '..');
const FILE = 'index.js';

const measure = async (source) => {
  const { code } = await minify(source, {
    compress: true,
    mangle: { toplevel: true },
  });
  return {
    raw: Buffer.byteLength(source),
    min: Buffer.byteLength(code),
    gzip: zlib.gzipSync(code, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(code, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
    }).length,
  };
};

const readBase = (ref) => {
  try {
    return execFileSync('git', ['show', `${ref}:${FILE}`], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    warn(`size: can't read ${FILE} at ${ref}; no comparison.`);
    return null;
  }
};

const current = await measure(
  fs.readFileSync(path.join(rootDir, FILE), 'utf8')
);
const baseSource = baseRef ? readBase(baseRef) : null;
const base = baseSource === null ? null : await measure(baseSource);

const ROWS = [
  ['raw', 'Raw'],
  ['min', 'Minified'],
  ['gzip', 'Min + gzip'],
  ['brotli', 'Min + brotli'],
];
const diff = (a, b) => {
  const d = a - b;
  return d === 0 ? '0' : `${d > 0 ? '+' : ''}${d}`;
};

const lines = [`### Size: \`${FILE}\``, ''];
if (base) {
  lines.push(
    `| | \`${baseRef}\` (B) | This tree (B) | Diff (B) |`,
    '|---|--:|--:|--:|',
    ...ROWS.map(
      ([key, label]) =>
        `| ${label} | ${base[key]} | ${current[key]} | ${diff(current[key], base[key])} |`
    )
  );
} else {
  lines.push(
    '| | This tree (B) |',
    '|---|--:|',
    ...ROWS.map(([key, label]) => `| ${label} | ${current[key]} |`)
  );
}
lines.push('', 'Minified with terser (compress, top-level mangle).', '');
const report = lines.join('\n');

log(report);
if (process.env.GITHUB_STEP_SUMMARY)
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
