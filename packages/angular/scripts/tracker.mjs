/**
 * Keeps the issue tracker in docs/issues/README.md up to date.
 *
 * docs/issues/tracker.json holds the Angular issues found while porting the components to React (one entry per row
 * of packages/react/docs/parity/README.md, "Angular issues found while porting"), and the patterns that group rows
 * with one root cause. This script checks the entries and rewrites the tables between the tracker markers.
 *
 *   status   reported → reproduced → covered → fixed → verified,
 *            or a side exit: not-reproducible, wont-fix (reason in notes), decision-needed (question in notes)
 *
 * Usage: node scripts/tracker.mjs [--check]   (--check fails when the tables are out of date or an entry is invalid)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const dir = join(root, 'docs/issues');
const readmePath = join(dir, 'README.md');
const { patterns, issues } = JSON.parse(readFileSync(join(dir, 'tracker.json'), 'utf8'));
const errors = [];

/** Main path in order, then the side exits. */
const STATUS = {
    reported: '⬜ reported',
    reproduced: '🔍 reproduced',
    covered: '🧪 covered',
    fixed: '🔧 fixed',
    verified: '✅ verified',
    'not-reproducible': '➖ not reproducible',
    'wont-fix': '🚫 won’t fix',
    'decision-needed': '❓ decision needed'
};
const ORDER = ['reported', 'reproduced', 'covered', 'fixed', 'verified'];
const KINDS = ['visual', 'computed-only', 'behaviour', 'a11y', 'test'];
const CONFIRMED = ['rendered', 'read from the code'];
const FIELDS = ['repro', 'test', 'fix', 'notes'];

/** Checks the fields a status needs: what was reproduced, the covering test, the fix, a reason. */
function checkEntry(e, where) {
    if (!STATUS[e.status]) return errors.push(`${where}: unknown status "${e.status}"`);
    for (const f of FIELDS) if (typeof e[f] !== 'string') errors.push(`${where}: "${f}" must be a string`);
    const step = ORDER.indexOf(e.status);
    if (step >= 1 && !e.repro) errors.push(`${where}: ${e.status} without "repro"`);
    if (step >= 2 && !e.test) errors.push(`${where}: ${e.status} without "test"`);
    if (step >= 3 && !e.fix) errors.push(`${where}: ${e.status} without "fix"`);
    if (e.status === 'not-reproducible' && !e.repro)
        errors.push(`${where}: not-reproducible without the evidence in "repro"`);
    if (e.status === 'wont-fix' && !e.notes) errors.push(`${where}: wont-fix without a reason in "notes"`);
    if (e.status === 'decision-needed' && !e.notes)
        errors.push(`${where}: decision-needed without the question in "notes"`);
}

const ids = new Set();
const perComponent = {};
for (const i of issues) {
    const where = i.id ?? '(issue without id)';
    if (ids.has(i.id)) errors.push(`${where}: duplicate id`);
    ids.add(i.id);
    perComponent[i.component] = (perComponent[i.component] ?? 0) + 1;
    if (i.id !== `${i.component}-${perComponent[i.component]}`)
        errors.push(
            `${where}: expected id "${i.component}-${perComponent[i.component]}" (component, then its row number)`
        );
    if (!i.issue) errors.push(`${where}: empty "issue"`);
    if (!KINDS.includes(i.kind)) errors.push(`${where}: unknown kind "${i.kind}"`);
    if (!CONFIRMED.includes(i.confirmed)) errors.push(`${where}: unknown confirmed "${i.confirmed}"`);
    if (i.source !== `../../../react/docs/parity/components/${i.component}.md`)
        errors.push(`${where}: source should link the component's React report`);
    else if (!existsSync(resolve(dir, i.source))) errors.push(`${where}: ${i.source} does not exist`);
    // a row read from the code is reproduced (or shown not to reproduce) before it is fixed
    checkEntry(i, where);
    if (i.pattern && !patterns.some((p) => p.id === i.pattern)) errors.push(`${where}: unknown pattern "${i.pattern}"`);
}
for (const p of patterns) {
    if (ids.has(p.id)) errors.push(`${p.id}: duplicate id`);
    ids.add(p.id);
    if (!p.id.startsWith('pattern-')) errors.push(`${p.id}: pattern ids start with "pattern-"`);
    for (const f of ['title', 'cause', 'rule']) if (!p[f]) errors.push(`${p.id}: empty "${f}"`);
    checkEntry(p, p.id);
    const linked = issues.filter((i) => i.pattern === p.id).map((i) => i.id);
    if ([...linked].sort().join() !== [...p.issues].sort().join())
        errors.push(
            `${p.id}: "issues" (${p.issues.join(', ')}) and the issues with this pattern (${linked.join(', ')}) differ`
        );
}

/** Markdown table cell: no pipes or line breaks. */
const cell = (s) => (s ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ');
const table = (header, rows) =>
    [
        `| ${header.join(' | ')} |`,
        `| ${header.map(() => '---').join(' | ')} |`,
        ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`)
    ].join('\n');
const tally = (list) =>
    Object.keys(STATUS)
        .map((s) => [s, list.filter((e) => e.status === s).length])
        .filter(([, n]) => n)
        .map(([s, n]) => `${STATUS[s]}: ${n}`)
        .join(' · ');

const done = issues.filter((i) => ['verified', 'not-reproducible', 'wont-fix'].includes(i.status)).length;
const generated = [
    `**Progress:** ${done} of ${issues.length} issues closed (verified, not reproducible or won’t fix).`,
    '',
    `Issues: ${tally(issues)}.`,
    '',
    `Patterns: ${tally(patterns)}.`,
    '',
    '### Patterns',
    '',
    table(
        ['Pattern', 'Root cause', 'Rule', 'Issues', 'Status', 'Fix'],
        patterns.map((p) => [`\`${p.id}\`: ${p.title}`, p.cause, p.rule, p.issues.join(', '), STATUS[p.status], p.fix])
    ),
    '',
    '### Decisions needed',
    '',
    issues.some((i) => i.status === 'decision-needed')
        ? table(
              ['ID', 'Issue', 'Question'],
              issues.filter((i) => i.status === 'decision-needed').map((i) => [i.id, i.issue, i.notes])
          )
        : 'None.',
    '',
    '### Issues',
    '',
    // one table per component: a pull request rewrites only the tables of the components it works on (Prettier pads
    // a table to its widest cell, so one table for every issue would conflict between any two pull requests)
    ...[...new Set(issues.map((i) => i.component))].flatMap((component) => {
        const list = issues.filter((i) => i.component === component);
        return [
            `#### ${component}`,
            '',
            `[React report](${list[0].source}) · ${tally(list)}`,
            '',
            table(
                ['ID', 'Issue', 'Kind', 'Confirmed', 'Pattern', 'Status', 'Test', 'Fix', 'Notes'],
                list.map((i) => [
                    i.id,
                    i.issue,
                    i.kind,
                    i.confirmed,
                    i.pattern ?? '',
                    STATUS[i.status],
                    i.test,
                    i.fix,
                    i.notes
                ])
            ),
            ''
        ];
    })
].join('\n');

const readme = readFileSync(readmePath, 'utf8');
const start = '<!-- tracker:start -->';
const end = '<!-- tracker:end -->';
if (!readme.includes(start) || !readme.includes(end)) errors.push(`${readmePath}: tracker markers missing`);
// formatted as `pnpm format` would, so the check agrees with Prettier
const updated = await format(
    readme.replace(new RegExp(`${start}[\\s\\S]*${end}`), () => `${start}\n\n${generated}\n\n${end}`),
    {
        ...(await resolveConfig(readmePath)),
        filepath: readmePath
    }
);

if (checkOnly && updated !== readme) errors.push('docs/issues/README.md is out of date: run `pnpm tracker`');
if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
}
if (!checkOnly) writeFileSync(readmePath, updated);
console.log(`tracker: ${done}/${issues.length} issues closed${checkOnly ? ', up to date' : ''}`);
