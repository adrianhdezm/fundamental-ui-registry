/**
 * Updates entries of docs/issues/tracker.json (then rewrites docs/issues/README.md), and prints the issue table of a
 * pull request body.
 *
 *   node scripts/issue.mjs set <id> [--status <s>] [--repro <text>] [--test <name>] [--fix <sha|HEAD>]
 *                                   [--notes <text>] [--add-notes <text>]
 *   node scripts/issue.mjs table <id> [<id> ...]     # Markdown table: issue, status, repro, test, fix
 *
 * `--fix HEAD` records the short hash of the current commit. Pattern ids (pattern-…) work too.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(root, 'docs/issues/tracker.json');
const tracker = JSON.parse(readFileSync(path, 'utf8'));
const [command, ...args] = process.argv.slice(2);
const find = (id) => {
    const entry = tracker.issues.find((i) => i.id === id) ?? tracker.patterns.find((p) => p.id === id);
    if (!entry) throw new Error(`no issue or pattern "${id}" in docs/issues/tracker.json`);
    return entry;
};

if (command === 'set') {
    const [id, ...options] = args;
    const entry = find(id);
    for (let i = 0; i < options.length; i += 2) {
        const [key, value] = [options[i].replace(/^--/, ''), options[i + 1]];
        if (value === undefined) throw new Error(`--${key} needs a value`);
        if (key === 'add-notes') entry.notes = [entry.notes, value].filter(Boolean).join(' ');
        else if (key === 'fix' && value === 'HEAD')
            entry.fix = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
        else if (['status', 'repro', 'test', 'fix', 'notes'].includes(key)) entry[key] = value;
        else throw new Error(`unknown option --${key}`);
    }
    const json = await format(JSON.stringify(tracker), { ...(await resolveConfig(path)), filepath: path });
    writeFileSync(path, json);
    execFileSync('node', [join(root, 'scripts/tracker.mjs')], { stdio: 'inherit' });
} else if (command === 'table') {
    // `<` outside code spans becomes `&lt;` so GitHub does not read it as a tag (inside code spans it shows as is).
    const escape = (s) =>
        s
            .split(/(`[^`]*`)/)
            .map((part, i) => (i % 2 ? part : part.replace(/</g, '&lt;')))
            .join('');
    const cell = (s) =>
        escape(s || '—')
            .replace(/\|/g, '\\|')
            .replace(/\n+/g, ' ');
    const STATUS = { verified: '✅ verified', fixed: '🔧 fixed', covered: '🧪 covered', reproduced: '🔍 reproduced' };
    const rows = args.map((id) => {
        const e = find(id);
        return `| ${id} | ${STATUS[e.status] ?? e.status} | ${cell(e.repro)} | ${cell(e.test)} | ${cell(e.fix)} |`;
    });
    console.log(['| Issue | Status | Repro | Test | Fix |', '| --- | --- | --- | --- | --- |', ...rows].join('\n'));
} else {
    console.error('usage: node scripts/issue.mjs set <id> [--status …] [--repro …] [--test …] [--fix …] | table <id…>');
    process.exit(1);
}
