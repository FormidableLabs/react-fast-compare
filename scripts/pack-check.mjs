// Checks what the package publishes (`pnpm pack:check`):
//
// 1. Packs the package with `pnpm pack`, or takes a tarball given with
//    `--tarball <file>` (e.g. a published version from
//    `npm pack react-fast-compare@3.2.2`).
// 2. Runs publint and attw (`@arethetypeswrong/cli`) on it.
// 3. Installs it outside the repo and loads it with `require()` and
//    `import()`: both must give the same working `isEqual` function.
// 4. Type probe: compiles `test/types/` against the installed package with
//    TypeScript (`module: nodenext`), as a CommonJS (`.cts`) and an ES module
//    (`.mts`) consumer.
// 5. Compares it against `pack-snapshot.json`: manifest fields, file list,
//    how attw resolves the types, `index.d.ts`, and `index.js` minified
//    without comments. In 3.x only formatting and comments may change in
//    `index.js` (see CONTRIBUTING). Pass `--update` to rewrite the snapshot
//    after an intended change.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { publint } from 'publint';
import { formatMessage } from 'publint/utils';
import { minify } from 'terser';

const { log, error } = console;

// Every field that makes consumers install another package. The package has
// none, and this check doesn't install any.
const DEPENDENCY_FIELDS = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
  'bundleDependencies',
  'bundledDependencies',
];

// Manifest fields that change how consumers resolve or install the package.
const SNAPSHOT_FIELDS = [
  'name',
  'type',
  'main',
  'module',
  'types',
  'typings',
  'exports',
  'imports',
  'browser',
  'sideEffects',
  'files',
  'bin',
  'engines',
  'os',
  'cpu',
  ...DEPENDENCY_FIELDS,
  'peerDependenciesMeta',
];

const args = process.argv.slice(2);
const update = args.includes('--update');
const tarballArg = args.includes('--tarball')
  ? args[args.indexOf('--tarball') + 1]
  : null;
const rootDir = path.resolve(import.meta.dirname, '..');
const workDir = path.join(rootDir, 'node_modules/.cache/pack-check');
const snapshotPath = path.join(rootDir, 'pack-snapshot.json');
const failures = [];
const require = createRequire(import.meta.url);

const run = (cmd, cmdArgs, opts = {}) =>
  execFileSync(cmd, cmdArgs, { encoding: 'utf8', ...opts });

// Pack
fs.rmSync(workDir, { recursive: true, force: true });
fs.mkdirSync(workDir, { recursive: true });
let tarball;
if (tarballArg) {
  tarball = path.resolve(tarballArg);
} else {
  const { filename } = JSON.parse(
    run('pnpm', ['pack', '--json', '--pack-destination', workDir], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'inherit'],
    })
  );
  tarball = path.resolve(workDir, filename);
}
const files = run('tar', ['tzf', tarball])
  .split('\n')
  .filter((f) => f && !f.endsWith('/'))
  .map((f) => f.replace(/^package\//, ''))
  .sort();

// Install outside the repo, so nothing resolves through the repo's
// `node_modules`. The package has no dependencies to link in.
const installRoot = fs.realpathSync(
  fs.mkdtempSync(path.join(os.tmpdir(), 'pack-check-'))
);
for (let dir = path.dirname(installRoot); ; dir = path.dirname(dir)) {
  if (fs.existsSync(path.join(dir, 'node_modules')))
    throw new Error(`${installRoot} isn't isolated: found ${dir}/node_modules`);

  if (dir === path.dirname(dir)) break;
}
const modulesDir = path.join(installRoot, 'node_modules');
fs.mkdirSync(modulesDir);
run('tar', ['xzf', tarball, '-C', installRoot]);
const manifest = JSON.parse(
  fs.readFileSync(path.join(installRoot, 'package/package.json'), 'utf8')
);
const installed = path.join(modulesDir, manifest.name);
fs.renameSync(path.join(installRoot, 'package'), installed);
for (const field of DEPENDENCY_FIELDS) {
  const value = manifest[field];
  // `bundleDependencies` is a list of names, or `true` for all of them.
  const names = Array.isArray(value) ? value : Object.keys(value ?? {});
  if (value === true || names.length)
    failures.push(`Unexpected ${field}: ${JSON.stringify(value)}`);
}
const readPublished = (file) =>
  fs.readFileSync(path.join(installed, file), 'utf8');

try {
  // publint
  const { messages, pkg } = await publint({
    pkgDir: installed,
    pack: false,
    level: 'warning',
  });
  for (const message of messages) {
    failures.push(
      `publint ${message.type} (${message.code}): ${formatMessage(message, pkg)}`
    );
  }

  // attw. It exits before a piped stdout is flushed, so write to a file.
  const attwJson = path.join(workDir, 'attw.json');
  const attwFd = fs.openSync(attwJson, 'w');
  try {
    run('attw', [tarball, '--format', 'json'], {
      stdio: ['ignore', attwFd, 'inherit'],
    });
  } catch {
    // Exits non-zero when it finds problems; they're read from the JSON.
  } finally {
    fs.closeSync(attwFd);
  }
  // No JSON means attw itself failed (its error is printed above).
  const attwOutput = fs.readFileSync(attwJson, 'utf8');
  if (!attwOutput.trim()) throw new Error('attw failed; see its output above');
  const { analysis } = JSON.parse(attwOutput);
  const stripPkg = (fileName) =>
    fileName?.replace(`/node_modules/${manifest.name}/`, '');
  for (const p of analysis.problems) {
    failures.push(
      `attw: ${[p.kind, p.entrypoint, p.resolutionKind, stripPkg(p.fileName)]
        .filter(Boolean)
        .join(' ')}`
    );
  }
  // Which types and JS file the package resolves to, per resolution mode.
  const resolutions = Object.fromEntries(
    Object.entries(analysis.entrypoints['.'].resolutions).map(([kind, r]) => [
      kind,
      `types=${stripPkg(r.resolution?.fileName) ?? 'none'} js=${stripPkg(r.implementationResolution?.fileName) ?? 'none'}`,
    ])
  );

  // Load with `require()` and `import()`.
  const loader = path.join(installRoot, 'load.mjs');
  fs.writeFileSync(
    loader,
    `import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const errors = [];
const spec = ${JSON.stringify(manifest.name)};
const cjs = require(spec);
const esm = (await import(spec)).default;
if (typeof cjs !== 'function') errors.push('require(): not a function');
if (esm !== cjs) errors.push('import(): default export is not module.exports');
if (typeof cjs === 'function') {
  if (cjs({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }) !== true) {
    errors.push('isEqual: equal objects compare false');
  }
  if (cjs({ a: 1 }, { a: 2 }) !== false) {
    errors.push('isEqual: different objects compare true');
  }
}
console.log(JSON.stringify(errors));
`
  );
  try {
    const errors = JSON.parse(
      run(process.execPath, [loader], {
        cwd: installRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    );
    failures.push(...errors.map((e) => `Loading ${manifest.name}: ${e}`));
  } catch (err) {
    failures.push(
      `Loading ${manifest.name} failed: ${(err.stderr || err.message).trim()}`
    );
  }

  // Type probe. Copy the fixtures next to the installed package, with a
  // tsconfig that clears the editor-only `paths`, and link in the React types.
  const probeSrc = path.join(rootDir, 'test/types');
  for (const file of fs.readdirSync(probeSrc)) {
    if (file !== 'tsconfig.json')
      fs.copyFileSync(path.join(probeSrc, file), path.join(installRoot, file));
  }
  fs.writeFileSync(
    path.join(installRoot, 'tsconfig.json'),
    JSON.stringify({
      extends: path.join(probeSrc, 'tsconfig.json'),
      compilerOptions: { paths: {} },
      include: ['*.ts', '*.cts', '*.mts'],
    })
  );
  fs.mkdirSync(path.join(modulesDir, '@types'));
  fs.symlinkSync(
    fs.realpathSync(path.join(rootDir, 'node_modules/@types/react')),
    path.join(modulesDir, '@types/react'),
    'junction'
  );
  const tsc = path.join(
    path.dirname(require.resolve('typescript/package.json')),
    'bin/tsc'
  );
  try {
    run(process.execPath, [tsc, '--project', installRoot], {
      cwd: installRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    failures.push(`Type probe (test/types) failed:\n${err.stdout.trim()}`);
  }

  // Published code. Minified without comments, so formatting and comments
  // don't count, and pretty-printed one statement per line, so a change shows
  // up as a readable diff. Without `compress`, the output depends only on the
  // code, not on the minifier's optimizations.
  const { code } = await minify(readPublished(manifest.main), {
    compress: false,
    mangle: false,
    format: { comments: false, beautify: true },
  });

  // Snapshot
  const snapshot = {
    manifest: Object.fromEntries(
      SNAPSHOT_FIELDS.filter((f) => f in manifest).map((f) => [f, manifest[f]])
    ),
    files,
    resolutions,
    types: readPublished(manifest.types ?? manifest.typings).split('\n'),
    code: code.split('\n'),
  };
  if (update) {
    fs.writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
    log(`Wrote ${path.relative(rootDir, snapshotPath)}`);
  } else {
    const expected = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    const diffs = [];
    for (const field of new Set([
      ...Object.keys(expected.manifest),
      ...Object.keys(snapshot.manifest),
    ])) {
      const [a, b] = [expected.manifest[field], snapshot.manifest[field]].map(
        (v) => JSON.stringify(v)
      );
      if (a !== b) diffs.push(`  manifest ${field}: ${a} -> ${b}`);
    }
    for (const kind of new Set([
      ...Object.keys(expected.resolutions),
      ...Object.keys(resolutions),
    ])) {
      const a = expected.resolutions[kind] ?? 'missing';
      const b = resolutions[kind] ?? 'missing';
      if (a !== b) diffs.push(`  resolution ${kind}: ${a} -> ${b}`);
    }
    diffs.push(...listDiff(expected.files, files, 'file '));
    diffs.push(...hunkDiff(expected.types, snapshot.types, 'types'));
    diffs.push(...hunkDiff(expected.code, snapshot.code, 'code'));
    if (diffs.length) {
      failures.push(
        `Published output differs from pack-snapshot.json (if intended, run \`pnpm pack:check --update\` and commit it):\n${diffs.join('\n')}`
      );
    }
  }
} finally {
  fs.rmSync(installRoot, { recursive: true, force: true });
}

log(`${manifest.name}@${manifest.version}: ${files.length} files`);
if (failures.length) {
  error(failures.join('\n\n'));
  process.exit(1);
}

// Entries removed and added (for unordered lists like the file list).
function listDiff(before, after, label) {
  const [a, b] = [new Set(before), new Set(after)];
  return [
    ...before.filter((x) => !b.has(x)).map((x) => `  - ${label}${x}`),
    ...after.filter((x) => !a.has(x)).map((x) => `  + ${label}${x}`),
  ];
}

// The one hunk spanning every changed line, for ordered text (`index.d.ts`,
// `index.js`). Run `--update` and `git diff` for a finer diff.
function hunkDiff(before, after, label) {
  let start = 0;
  while (
    start < before.length &&
    start < after.length &&
    before[start] === after[start]
  )
    start++;

  if (start === before.length && start === after.length) return [];
  let endBefore = before.length;
  let endAfter = after.length;
  while (
    endBefore > start &&
    endAfter > start &&
    before[endBefore - 1] === after[endAfter - 1]
  ) {
    endBefore--;
    endAfter--;
  }
  return [
    `  ${label}, line ${start + 1}:`,
    ...before.slice(start, endBefore).map((x) => `  - ${x}`),
    ...after.slice(start, endAfter).map((x) => `  + ${x}`),
  ];
}
