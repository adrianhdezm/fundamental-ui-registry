/**
 * Keeps the porting tracker in docs/parity/README.md up to date.
 *
 * docs/parity/tracker.json holds what only a person can judge: each component's phase (1: has a fundamental-react
 * source, 2: Angular only), its fundamental-react story files, status, visual result and notes. This script adds
 * what can be counted (stories of the fundamental-react source, of the Angular package and of this package, and the
 * tests of this package) and rewrites the table between the tracker markers.
 *
 *   status    todo · in progress · done (stories, tests, a11y and the visual comparison complete; see the README)
 *   visual    e.g. "80/80": matching cases × combinations of `pnpm visual <name>`, after fixes
 *
 * Usage: node scripts/tracker.mjs [--check]   (--check fails when the table is out of date)
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const angularUi = resolve(root, '../angular/registry/ui');
const checkOnly = process.argv.includes('--check');
const readmePath = join(root, 'docs/parity/README.md');
const { components } = JSON.parse(readFileSync(join(root, 'docs/parity/tracker.json'), 'utf8'));
const errors = [];

/** Named story exports of the story files in a folder (`export const X: Story` / `export const X = {`). */
function countStories(dir, ext) {
    if (!existsSync(dir)) return 0;
    return readdirSync(dir)
        .filter((f) => f.endsWith(ext))
        .reduce((n, f) => n + [...readFileSync(join(dir, f), 'utf8').matchAll(/^export const \w+\s*[:=]/gm)].length, 0);
}

/** `it(` blocks of the spec files in a folder. */
function countTests(dir) {
    if (!existsSync(dir)) return 0;
    return readdirSync(dir)
        .filter((f) => /\.spec\.tsx?$/.test(f))
        .reduce((n, f) => n + [...readFileSync(join(dir, f), 'utf8').matchAll(/^\s*it\(/gm)].length, 0);
}

const STATUS = { todo: '⬜ todo', 'in progress': '🟡 in progress', done: '✅ done' };
const SOURCE_URL = 'https://github.com/SAP/fundamental-react/tree/main/';

const rows = components.map((c) => {
    const dir = join(root, 'registry/ui', c.name);
    const report = existsSync(join(root, 'docs/parity/components', `${c.name}.md`));
    if (!STATUS[c.status]) errors.push(`${c.name}: unknown status "${c.status}"`);
    if (c.status === 'done' && !report) errors.push(`${c.name}: done without docs/parity/components/${c.name}.md`);
    if (c.status === 'done' && !c.visual) errors.push(`${c.name}: done without a visual result`);
    if (c.status !== 'todo' && !existsSync(dir))
        errors.push(`${c.name}: ${c.status} but registry/ui/${c.name} is missing`);
    if (c.status === 'todo' && existsSync(dir)) errors.push(`${c.name}: has a folder but is "todo"`);
    const name = report ? `[${c.name}](components/${c.name}.md)` : c.name;
    const source = c.source
        ? c.source.map((s) => `[${s.split('/').at(-1).replace('.stories.js', '')}](${SOURCE_URL}${s})`).join(', ')
        : '—';
    return [
        name,
        String(c.phase),
        source,
        c.source ? String(c.sourceStories) : '—',
        String(countStories(join(angularUi, c.name), '.stories.ts')),
        String(countStories(dir, '.stories.tsx')),
        String(countTests(dir)),
        c.visual ?? '—',
        STATUS[c.status] ?? c.status,
        c.notes ?? ''
    ];
});

const header = [
    'Component',
    'Phase',
    'fundamental-react source',
    'Source stories',
    'Angular stories',
    'React stories',
    'React tests',
    'Visual',
    'Status',
    'Gaps and notes'
];
const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
const line = (cells) => `| ${cells.map((c, i) => c.padEnd(widths[i])).join(' | ')} |`;
const done = components.filter((c) => c.status === 'done').length;
const inProgress = components.filter((c) => c.status === 'in progress').length;
const phase1 = components.filter((c) => c.phase === 1);
const table = [
    `**Progress:** ${done} of ${components.length} done, ${inProgress} in progress ` +
        `(phase 1: ${phase1.filter((c) => c.status === 'done').length} of ${phase1.length}).`,
    '',
    line(header),
    line(widths.map((w) => '-'.repeat(w))),
    ...rows.map(line)
].join('\n');

const readme = readFileSync(readmePath, 'utf8');
const start = '<!-- tracker:start -->';
const end = '<!-- tracker:end -->';
if (!readme.includes(start) || !readme.includes(end)) errors.push(`${readmePath}: tracker markers missing`);
// formatted as `pnpm format` would, so the check agrees with Prettier
const updated = await format(readme.replace(new RegExp(`${start}[\\s\\S]*${end}`), `${start}\n\n${table}\n\n${end}`), {
    ...(await resolveConfig(readmePath)),
    filepath: readmePath
});

if (checkOnly && updated !== readme) errors.push('docs/parity/README.md is out of date: run `pnpm tracker`');
if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
}
if (!checkOnly) writeFileSync(readmePath, updated);
console.log(`tracker: ${done}/${components.length} done${checkOnly ? ', up to date' : ''}`);
