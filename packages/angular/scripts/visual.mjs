/**
 * Compares components with the fundamental-styles Storybook (the visual reference) in every combination of theme
 * (4), density (cozy, compact) and direction (LTR, RTL): 16 per case. Adapted from the React package's
 * scripts/visual.mjs (each package keeps its own copy).
 *
 * Each case in scripts/visual.config.mjs pairs an element of one of our stories with the matching element of a
 * fundamental-styles story. For every combination the script renders both, then compares
 *   - the computed styles that make up the look (size, spacing, typography, colours, borders, radius, shadow), and
 *   - element screenshots, pixel by pixel with a tolerance (the markup differs, so pixel-exact is not expected).
 * Style differences and screenshots over the tolerance are listed in .visual/<name>/report.md, with the
 * screenshots (ours, reference, diff) next to it, to be checked by hand and recorded in docs/issues/tracker.json.
 *
 * Usage:
 *   pnpm build-storybook                     # our Storybook, served from dist/storybook by this script
 *   pnpm visual <name> [<name> ...]          # or `pnpm visual --all`
 *   pnpm visual button --only=sap_horizon    # limit to combinations whose key contains the text
 *   VISUAL_WORKERS=4                         # pages rendering in parallel (default 4)
 *
 * The reference is https://sap.github.io/fundamental-styles/ (override with FS_URL).
 */
import { createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { CASES } from './visual.config.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FS_URL = (process.env.FS_URL ?? 'https://sap.github.io/fundamental-styles').replace(/\/$/, '');
const THEMES = ['sap_horizon', 'sap_horizon_dark', 'sap_horizon_hcb', 'sap_horizon_hcw'];
const DENSITIES = ['cozy', 'compact'];
const DIRS = ['ltr', 'rtl'];
/** Share of differing pixels (after pixelmatch's own anti-aliasing tolerance) still counted as a match. */
const PIXEL_TOLERANCE = 0.03;
/** Pixels of size difference still counted as a match (sub-pixel rounding, font hinting). */
const SIZE_TOLERANCE = 1;

const STYLE_PROPS = [
    'height',
    'min-height',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'line-height',
    'letter-spacing',
    'text-transform',
    'text-decoration-line',
    'text-underline-offset',
    'color',
    'background-color',
    'background-image',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-style',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'box-shadow',
    'opacity',
    'cursor'
];

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith('--only='))?.slice('--only='.length);
const names = args.includes('--all') ? Object.keys(CASES) : args.filter((a) => !a.startsWith('--'));
if (!names.length) {
    console.error(`usage: pnpm visual <name> [...] | --all\nknown: ${Object.keys(CASES).join(', ')}`);
    process.exit(1);
}
for (const name of names) {
    if (!CASES[name]) {
        console.error(`no visual cases for "${name}" in scripts/visual.config.mjs`);
        process.exit(1);
    }
}

const storybookDir = join(root, 'dist/storybook');
if (!existsSync(join(storybookDir, 'iframe.html'))) {
    console.error('dist/storybook is missing: run `pnpm build-storybook` first');
    process.exit(1);
}

const TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.png': 'image/png'
};
const server = createServer((req, res) => {
    const path = join(storybookDir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const file = existsSync(path) && statSync(path).isDirectory() ? join(path, 'index.html') : path;
    if (!file.startsWith(storybookDir) || !existsSync(file)) {
        res.writeHead(404).end();
        return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const OURS_URL = `http://127.0.0.1:${server.address().port}`;

const combos = THEMES.flatMap((theme) =>
    DENSITIES.flatMap((density) => DIRS.map((dir) => ({ theme, density, dir, key: `${theme}-${density}-${dir}` })))
).filter((c) => !only || c.key.includes(only));

const oursUrl = (story, c) =>
    `${OURS_URL}/iframe.html?id=${story}&viewMode=story&globals=theme:${c.theme};density:${c.density};dir:${c.dir}`;
const refUrl = (story, c) =>
    `${FS_URL}/iframe.html?id=${story}&viewMode=story&globals=styles-theme:${c.theme};contentDensity:${c.density};directionality:${c.dir}`;

/** Renders a story and returns the computed styles, size and screenshot of the element matched by `selector`. */
async function capture(page, url, selector, hover, props, focus) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // the end state of every element: no animation (e.g. pulsing busy dots) or transition in progress
    await page.addStyleTag({
        content: '*, *::before, *::after { animation: none !important; transition: none !important; }'
    });
    // inside the story: Storybook's own (hidden) controls are elsewhere in the iframe
    const el = page.locator('#storybook-root').locator(selector).first();
    await el.waitFor({ state: 'visible', timeout: 15000 });
    if (hover) await el.hover();
    else await page.mouse.move(0, 0);
    if (focus) {
        // keyboard focus, so :focus-visible applies: Tab into the page, then focus the element
        await page.keyboard.press('Tab');
        await el.focus();
    }
    // snap to whole pixels: an element at a fractional offset anti-aliases differently. A layout offset (relative
    // position) is snapped by Chromium; a transform is not. Absolutely positioned elements are left alone.
    await el.evaluate((node) => {
        const style = getComputedStyle(node);
        if (style.position !== 'static' && style.position !== 'relative') return;
        node.style.transition = 'none';
        node.style.position = 'relative';
        // RTL content starts at the right edge: snap that one there, the left edge in LTR
        const rtl = style.direction === 'rtl';
        const fraction = () => {
            const box = node.getBoundingClientRect();
            return { x: rtl ? box.right % 1 : box.x % 1, y: box.y % 1 };
        };
        const start = fraction();
        node.style.top = `${(parseFloat(style.top) || 0) - start.y}px`;
        node.style.left = `${(parseFloat(style.left) || 0) - start.x}px`;
        // a set `right` wins over `left` in RTL: shift with `right` instead
        if (Math.abs(fraction().x) > 0.01) {
            node.style.left = '';
            node.style.right = `${(parseFloat(style.right) || 0) + start.x}px`;
        }
    });
    await page.waitForTimeout(150);
    const styles = await el.evaluate((node, props) => {
        const cs = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return {
            width: box.width,
            height: box.height,
            styles: Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]))
        };
    }, props);
    const png = PNG.sync.read(await el.screenshot({ animations: 'disabled' }));
    return { ...styles, png };
}

/** Normalises values that are equal but print differently (font stacks, sub-pixel lengths, transparent). */
function normalise(prop, value) {
    let v = value.trim();
    if (prop === 'font-family') v = v.split(',')[0].replace(/["']/g, '').trim();
    v = v.replace(/rgba\(0, 0, 0, 0\)/g, 'transparent');
    // equal for display: no minimum height, and shadows that are all transparent
    if (prop === 'min-height' && v === 'auto') v = '0px';
    if (prop === 'box-shadow' && /^(transparent 0px 0px 0px 0px(, )?)+$/.test(v)) v = 'none';
    v = v.replace(/(\d+\.\d+)px/g, (_, n) => `${Math.round(Number(n) * 2) / 2}px`);
    return v;
}

function compareImages(a, b, diffPath) {
    if (Math.abs(a.width - b.width) > SIZE_TOLERANCE || Math.abs(a.height - b.height) > SIZE_TOLERANCE) {
        return { ratio: 1, note: `size ${a.width}x${a.height} vs ${b.width}x${b.height}` };
    }
    const width = Math.min(a.width, b.width);
    const height = Math.min(a.height, b.height);
    const crop = (img) => {
        const out = new PNG({ width, height });
        PNG.bitblt(img, out, 0, 0, width, height, 0, 0);
        return out;
    };
    const diff = new PNG({ width, height });
    const pixels = pixelmatch(crop(a).data, crop(b).data, diff.data, width, height, { threshold: 0.15 });
    writeFileSync(diffPath, PNG.sync.write(diff));
    return { ratio: pixels / (width * height), note: '' };
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
/** Pages rendering in parallel (VISUAL_WORKERS); every comparison loads two stories. */
const WORKERS = Number(process.env.VISUAL_WORKERS ?? 4);

/** Renders one case in one combination and compares the two captures. */
async function compare(page, name, kase, c) {
    const outDir = join(root, '.visual', name);
    const id = `${kase.label.replace(/\W+/g, '-')}--${c.key}`;
    try {
        const props = [...STYLE_PROPS, ...(kase.props ?? [])];
        const ours = await capture(
            page,
            oursUrl(kase.ours.story, c),
            kase.ours.selector,
            kase.hover,
            props,
            kase.focus
        );
        // fundamental-styles shows focus with an is-focus class in its stories; refFocus focuses the element too
        const ref = await capture(page, refUrl(kase.ref.story, c), kase.ref.selector, kase.hover, props, kase.refFocus);
        writeFileSync(join(outDir, `${id}.ours.png`), PNG.sync.write(ours.png));
        writeFileSync(join(outDir, `${id}.ref.png`), PNG.sync.write(ref.png));
        const ignore = new Set(kase.ignore ?? []);
        // the style and colour of a border nobody can see do not matter
        for (const side of ['top', 'right', 'bottom', 'left']) {
            if (
                parseFloat(ours.styles[`border-${side}-width`]) === 0 &&
                parseFloat(ref.styles[`border-${side}-width`]) === 0
            ) {
                ignore.add(`border-${side}-color`);
                if (side === 'top') ignore.add('border-top-style');
            }
        }
        const styleDiffs = props
            .filter((p) => !ignore.has(p))
            .map((p) => [p, normalise(p, ours.styles[p]), normalise(p, ref.styles[p])])
            .filter(([, a, b]) => a !== b);
        if (!ignore.has('width') && Math.abs(ours.width - ref.width) > SIZE_TOLERANCE)
            styleDiffs.push(['width', `${ours.width}px`, `${ref.width}px`]);
        if (!ignore.has('height') && Math.abs(ours.height - ref.height) > SIZE_TOLERANCE)
            styleDiffs.push(['box height', `${ours.height}px`, `${ref.height}px`]);
        const image =
            kase.pixels === false
                ? { ratio: 0, note: 'not compared' }
                : compareImages(ours.png, ref.png, join(outDir, `${id}.diff.png`));
        const ok = !styleDiffs.length && image.ratio <= PIXEL_TOLERANCE;
        return { kase: kase.label, combo: c.key, ok, styleDiffs, image };
    } catch (error) {
        return {
            kase: kase.label,
            combo: c.key,
            ok: false,
            styleDiffs: [],
            image: { ratio: 1, note: String(error.message).split('\n')[0] }
        };
    }
}

const jobs = [];
for (const name of names) {
    const outDir = join(root, '.visual', name);
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });
    CASES[name].forEach((kase, k) =>
        combos.forEach((c, i) => jobs.push({ name, kase, c, order: k * combos.length + i }))
    );
}
const results = new Map(names.map((name) => [name, []]));
let next = 0;
await Promise.all(
    Array.from({ length: Math.min(WORKERS, jobs.length) }, async () => {
        const page = await context.newPage();
        while (next < jobs.length) {
            const job = jobs[next++];
            let row = await compare(page, job.name, job.kase, job.c);
            // capture a difference once more: a late reflow can leave one capture a pixel off; a real difference
            // shows in both
            if (!row.ok) row = await compare(page, job.name, job.kase, job.c);
            results.get(job.name).push({ ...row, order: job.order });
            process.stdout.write(row.ok ? '.' : 'x');
        }
        await page.close();
    })
);
process.stdout.write('\n');

let failures = 0;
for (const name of names) {
    const rows = results.get(name).sort((a, b) => a.order - b.order);
    const lines = [
        `# Visual comparison: ${name}`,
        '',
        `Reference: ${FS_URL}. Tolerance: ${PIXEL_TOLERANCE * 100}% of pixels, ${SIZE_TOLERANCE}px of size.`,
        '',
        '| Case | Combination | Result | Pixels | Style differences (ours → reference) |',
        '| ---- | ----------- | ------ | ------ | ------------------------------------ |',
        ...rows.map(
            (r) =>
                `| ${r.kase} | ${r.combo} | ${r.ok ? 'ok' : '**diff**'} | ${(r.image.ratio * 100).toFixed(1)}%${r.image.note ? ` (${r.image.note})` : ''} | ${r.styleDiffs.map(([p, a, b]) => `\`${p}\`: ${a} → ${b}`).join('<br>')} |`
        )
    ];
    writeFileSync(join(root, '.visual', name, 'report.md'), lines.join('\n') + '\n');
    const bad = rows.filter((r) => !r.ok).length;
    failures += bad;
    console.log(`${name}: ${rows.length - bad}/${rows.length} match, report in .visual/${name}/report.md`);
}

await browser.close();
server.close();
process.exit(failures ? 1 : 0);
