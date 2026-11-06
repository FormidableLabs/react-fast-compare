// Type-checks `index.js` from its JSDoc and checks it against `index.d.ts`
// (`pnpm types:check`):
//
// 1. Runs `tsc` with `tsconfig.json` (`checkJs`, `strict`), emitting only
//    declarations, to a temp dir. Any type error fails.
// 2. Compares the emitted `index.d.ts` with the hand-written one, which is
//    what 3.x publishes. Statement order is ignored: `tsc` emits
//    `export = isEqual;` before the declaration, and 3.2.2's file has it
//    after. Anything else that differs fails, so the two can't drift.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

const { log, error } = console;

const rootDir = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const tsc = path.join(
  path.dirname(require.resolve('typescript/package.json')),
  'bin',
  'tsc'
);

// Non-empty lines, trimmed and sorted.
const normalize = (text) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();

// Returns the exit code.
const check = (outDir) => {
  try {
    execFileSync(
      process.execPath,
      [
        tsc,
        '--project',
        path.join(rootDir, 'tsconfig.json'),
        '--noEmit',
        'false',
        '--declaration',
        '--emitDeclarationOnly',
        '--removeComments',
        '--outDir',
        outDir,
      ],
      { cwd: rootDir, stdio: 'inherit' }
    );
  } catch {
    error('types:check: tsc failed.');
    return 1;
  }

  const emitted = fs.readFileSync(path.join(outDir, 'index.d.ts'), 'utf8');
  const published = fs.readFileSync(path.join(rootDir, 'index.d.ts'), 'utf8');
  if (normalize(emitted).join('\n') !== normalize(published).join('\n')) {
    error('types:check: declarations from JSDoc differ from index.d.ts.');
    error('\n--- emitted from index.js ---\n' + emitted);
    error('--- index.d.ts ---\n' + published);
    return 1;
  }
  log('types:check: OK (index.js JSDoc matches index.d.ts)');
  return 0;
};

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rfc-types-check-'));
try {
  process.exitCode = check(outDir);
} finally {
  fs.rmSync(outDir, { recursive: true, force: true });
}
