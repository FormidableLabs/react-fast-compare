// Vitest reporter for `pnpm bench`: in GitHub Actions, appends the benchmark
// results to the job summary as Markdown tables. Elsewhere it does nothing;
// the default reporter already prints the tables.
import fs from 'node:fs';
import { createRequire } from 'node:module';

const BASELINE = 'published';
const { version } = createRequire(import.meta.url)(
  'react-fast-compare-published/package.json'
);

const format = (n, digits = 0) =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const versus = (task, baseline) => {
  if (!baseline || task === baseline) return '';
  const diff = (task.throughput.mean / baseline.throughput.mean - 1) * 100;
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
};

const table = (title, { tasks }) => {
  const baseline = tasks.find((task) => task.name === BASELINE);
  return [
    `#### ${title}`,
    '',
    `| | ops/s | Mean (µs) | ±RME | Samples | vs. ${BASELINE} |`,
    '|---|--:|--:|--:|--:|--:|',
    ...tasks.map(
      (task) =>
        `| ${task.name} | ${format(task.throughput.mean)} | ${format(task.latency.mean * 1000, 3)} | ${task.latency.rme.toFixed(2)}% | ${format(task.latency.samplesCount)} | ${versus(task, baseline)} |`
    ),
    '',
  ];
};

export default class SummaryReporter {
  sections = [];

  onTestCaseResult(testCase) {
    const benchmarks = testCase.benchmarks().filter((b) => b.tasks.length);
    for (const benchmark of benchmarks)
      this.sections.push(table(testCase.name, benchmark));
  }

  onTestRunEnd() {
    const file = process.env.GITHUB_STEP_SUMMARY;
    if (!file || !this.sections.length) return;
    const report = [
      '### Benchmarks',
      '',
      `\`${BASELINE}\` is react-fast-compare@${version}. Node ${process.version}; operations per second, higher is better. A report, not a check: CI runners are noisy, so compare locally before drawing conclusions.`,
      '',
      ...this.sections.flat(),
    ].join('\n');
    fs.appendFileSync(file, report + '\n');
  }
}
