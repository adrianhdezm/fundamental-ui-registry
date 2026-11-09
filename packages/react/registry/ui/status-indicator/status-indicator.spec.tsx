import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    StatusIndicator,
    type StatusIndicatorColor,
    type StatusIndicatorLabelPosition,
    type StatusIndicatorProps,
    type StatusIndicatorSize
} from './status-indicator';

const SQUARE = 'M0,0 L10,0 L10,10 L0,10 Z';

const DEFAULTS: StatusIndicatorProps = {
    path: [SQUARE],
    viewBox: '0 0 10 10',
    fillPercentage: 40,
    statusLabel: '40%',
    labelPosition: 'right',
    'aria-label': 'Budget used'
};

function Host({ onClick, ...props }: StatusIndicatorProps) {
    return (
        <div>
            <button id="before">Before</button>
            <StatusIndicator id="si" {...DEFAULTS} {...props} onClick={onClick} />
        </div>
    );
}

async function setup(initial: StatusIndicatorProps = {}) {
    const onClick = vi.fn();
    let current: StatusIndicatorProps = { onClick, ...initial };
    const screen = await render(<Host {...current} />);
    const root = screen.container;
    const element = () => root.querySelector<HTMLElement>('#si')!;
    const svg = () => element().querySelector('svg') as SVGSVGElement;
    const label = () => element().querySelector<HTMLElement>(':scope > span');
    const gradients = () => Array.from(element().querySelectorAll('linearGradient'));
    const stops = (i = 0) => Array.from(gradients()[i].querySelectorAll('stop')).map((s) => s.getAttribute('offset'));
    const vector = () => ['x1', 'y1', 'x2', 'y2'].map((a) => gradients()[0].getAttribute(a)).join(' ');
    const polygon = () => element().querySelector<SVGPolygonElement>('mask polygon');
    const update = async (change: StatusIndicatorProps) => {
        current = { ...current, ...change };
        await screen.rerender(<Host {...current} />);
        // radial polygons are measured after render
        await new Promise((resolve) => requestAnimationFrame(resolve));
    };
    return { screen, onClick, element, svg, label, gradients, stops, vector, polygon, update };
}

function points(polygon: SVGPolygonElement): [number, number][] {
    return (polygon.getAttribute('points') ?? '').split(' ').map((p) => p.split(',').map(Number) as [number, number]);
}

/** Resolves a CSS colour (e.g. a theme variable) to its computed rgb value. */
function color(value: string): string {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const result = getComputedStyle(probe).color;
    probe.remove();
    return result;
}

describe('StatusIndicator', () => {
    it('fills the shape to the percentage with a gradient mask', async () => {
        const { element, stops, update } = await setup();
        expect(stops()).toEqual(['0.4', '0.4']);
        const mask = element().querySelector('mask') as SVGMaskElement;
        const filled = element().querySelector(`path[mask="url(#${mask.id})"]`);
        expect(filled).not.toBeNull();
        expect(mask.querySelector('path')?.getAttribute('fill')).toBe(
            `url(#${element().querySelector('linearGradient')!.id})`
        );
        // the fill animates from 0 to the percentage once
        const animate = element().querySelector('stop animate')!;
        expect(animate.getAttribute('attributeName')).toBe('offset');
        expect(animate.getAttribute('values')).toBe('0, 0.4');
        await update({ fillPercentage: 75 });
        expect(stops()).toEqual(['0.75', '0.75']);
    });

    it('clamps the percentage to 0–100', async () => {
        const { element, stops, update } = await setup();
        await update({ fillPercentage: 150 });
        expect(stops()).toEqual(['1', '1']);
        expect(element().getAttribute('aria-valuenow')).toBe('100');
        await update({ fillPercentage: -20 });
        expect(stops()).toEqual(['0', '0']);
        expect(element().getAttribute('aria-valuenow')).toBe('0');
        await update({ fillPercentage: null });
        expect(element().getAttribute('aria-valuenow')).toBe('0');
    });

    it('fills multiple shapes one after another', async () => {
        const { gradients, stops, update } = await setup();
        await update({ path: [SQUARE, SQUARE, SQUARE, SQUARE], fillPercentage: 60 });
        expect(gradients().length).toBe(4);
        // 60% of 4 shapes = 2.4 shapes: two full, 40% of the third, none of the fourth
        const offsets = [0, 1, 2, 3].map((i) => Number(stops(i)[0]));
        expect(offsets[0]).toBeGreaterThanOrEqual(1);
        expect(offsets[1]).toBeGreaterThanOrEqual(1);
        expect(offsets[2]).toBeCloseTo(0.4);
        expect(offsets[3]).toBeLessThanOrEqual(0);
    });

    it('gives every shape its own gradient and mask ids', async () => {
        const { element, update } = await setup();
        await update({ path: [SQUARE, SQUARE] });
        const ids = Array.from(element().querySelectorAll('mask, linearGradient')).map((e) => e.id);
        expect(new Set(ids).size).toBe(4);
        expect(ids.every((id) => id.startsWith(element().querySelector('svg')!.id))).toBe(true);
        // the SVG id derives from the root id, or is generated and valid in a url(#…) reference
        expect(element().querySelector('svg')!.id).toBe('si-svg');
        await update({ id: undefined });
        const generated = document.querySelector<HTMLElement>('[aria-label="Budget used"] svg')!.id;
        expect(generated).toMatch(/^fd-status-indicator-[\w-]+$/);
    });

    it('fill direction: lineardown, linearup and linearleft', async () => {
        const { vector, update } = await setup();
        expect(vector()).toBe('0 1 0 0');
        await update({ fillingType: 'linearup' });
        expect(vector()).toBe('0 0 0 1');
        await update({ fillingType: 'linearleft' });
        expect(vector()).toBe('0 0 1 0');
    });

    it('angled fill follows the angle (defaulting to 270)', async () => {
        const { vector, update } = await setup();
        await update({ fillingType: 'angled' });
        expect(vector()).toBe('0 1 0 0');
        const expected: [number, string][] = [
            [0, '1 0 0 0'],
            [30, '1 0 0 1'],
            [90, '0 0 0 1'],
            [150, '0 0 1 1'],
            [200, '0 0 1 0'],
            [240, '0 1 1 0'],
            [300, '0 1 0 0'],
            [330, '1 1 0 0'],
            [360, '1 0 0 0']
        ];
        for (const [angle, v] of expected) {
            await update({ angle });
            expect(vector(), `${angle}deg`).toBe(v);
        }
    });

    it('radial fill masks the shape with a polygon swept clockwise from 12 o’clock', async () => {
        const { element, polygon, gradients, update } = await setup();
        await update({ fillingType: 'radial', fillPercentage: 25 });
        expect(gradients().length).toBe(0);
        expect(polygon()).not.toBeNull();
        const pts = points(polygon()!);
        // starts at the top centre, ends at the centre, and covers the right side only
        expect(pts[0]).toEqual([5, 0]);
        expect(pts[pts.length - 1]).toEqual([5, 5]);
        expect(pts.every(([x]) => x >= 5)).toBe(true);
        expect(pts).toContainEqual([10, 5]);
        const mask = element().querySelector('mask') as SVGMaskElement;
        expect(element().querySelector(`path[mask="url(#${mask.id})"]`)).not.toBeNull();
    });

    it('radial fill counterclockwise mirrors the polygon', async () => {
        const { polygon, update } = await setup();
        await update({ fillingType: 'radial', fillPercentage: 25, fillDirection: 'counterclockwise' });
        const pts = points(polygon()!);
        expect(pts.every(([x]) => x <= 5)).toBe(true);
        expect(pts).toContainEqual([0, 5]);
    });

    it('radial fill of a full shape uses a gradient instead of a polygon', async () => {
        const { polygon, stops, update } = await setup();
        await update({ fillingType: 'radial', fillPercentage: 100 });
        expect(polygon()).toBeNull();
        expect(stops()).toEqual(['1', '1']);
    });

    it('label position before or after the shape, in a row or a column', async () => {
        const { element, svg, label, update } = await setup();
        const positions: [StatusIndicatorLabelPosition, 'row' | 'column', boolean][] = [
            ['right', 'row', false],
            ['left', 'row', true],
            ['top', 'column', true],
            ['bottom', 'column', false]
        ];
        for (const [position, direction, before] of positions) {
            await update({ labelPosition: position });
            expect(getComputedStyle(element()).flexDirection, position).toBe(direction);
            const labelBox = label()!.getBoundingClientRect();
            const svgBox = svg().getBoundingClientRect();
            if (direction === 'row') {
                if (before) expect(labelBox.right, position).toBeLessThanOrEqual(svgBox.left);
                else expect(labelBox.left, position).toBeGreaterThanOrEqual(svgBox.right);
            } else if (before) expect(labelBox.bottom, position).toBeLessThanOrEqual(svgBox.top);
            else expect(labelBox.top, position).toBeGreaterThanOrEqual(svgBox.bottom);
        }
        expect(label()!.textContent).toBe('40%');
        // no position, no label
        await update({ labelPosition: null });
        expect(label()).toBeNull();
    });

    it('label gaps follow the label size and the direction', async () => {
        const { element, label, update } = await setup({ labelSize: 'lg' });
        expect(getComputedStyle(label()!).marginInlineStart).toBe('12px');
        await update({ labelPosition: 'left', labelSize: 'xl' });
        expect(getComputedStyle(label()!).marginInlineEnd).toBe('16px');
        await update({ labelPosition: 'top', labelSize: 'sm' });
        expect(getComputedStyle(label()!).marginBottom).toBe('6px');
        await update({ labelPosition: 'bottom', labelSize: 'md' });
        expect(getComputedStyle(label()!).marginTop).toBe('8px');
        // in RTL the label after the shape sits on its left
        await update({ labelPosition: 'right', dir: 'rtl' });
        expect(label()!.getBoundingClientRect().right).toBeLessThanOrEqual(
            element().querySelector('svg')!.getBoundingClientRect().left
        );
    });

    it('status colours the shape with the element colour and the label with the text colour', async () => {
        const { element, label, update } = await setup();
        // neutral: the text colour, as fundamental-styles
        expect(getComputedStyle(label()!).color).toBe(color('var(--sapTextColor)'));
        expect(getComputedStyle(element().querySelector('path[mask]')!).fill).toBe('rgba(0, 0, 0, 0)');
        const colors: Record<StatusIndicatorColor, [string, string]> = {
            positive: ['--sapPositiveElementColor', '--sapPositiveTextColor'],
            critical: ['--sapCriticalElementColor', '--sapCriticalTextColor'],
            negative: ['--sapNegativeElementColor', '--sapNegativeTextColor']
        };
        const filled = () => element().querySelector('path[mask]') as SVGPathElement;
        for (const [status, [fill, text]] of Object.entries(colors) as [StatusIndicatorColor, [string, string]][]) {
            await update({ status });
            expect(getComputedStyle(filled()).fill, status).toBe(color(`var(${fill})`));
            expect(getComputedStyle(label()!).color, status).toBe(color(`var(${text})`));
        }
        // the outline of the shape in the neutral element colour
        const border = element().querySelector('path[fill="transparent"]')!;
        expect(getComputedStyle(border).stroke).toBe(color('var(--sapNeutralElementColor)'));
        expect(getComputedStyle(border).strokeWidth).toBe('0.25px');
    });

    it('the SVG is hidden from assistive technology', async () => {
        const { svg } = await setup();
        expect(svg().getAttribute('aria-hidden')).toBe('true');
    });

    it('is a progressbar with aria-valuenow, valuemin/max and valuetext', async () => {
        const { element, update } = await setup();
        expect(element().getAttribute('role')).toBe('progressbar');
        expect(element().getAttribute('aria-label')).toBe('Budget used');
        expect(element().getAttribute('aria-valuenow')).toBe('40');
        expect(element().getAttribute('aria-valuemin')).toBe('0');
        expect(element().getAttribute('aria-valuemax')).toBe('100');
        expect(element().getAttribute('aria-valuetext')).toBe('40%');
        await update({ 'aria-valuetext': '40 of 100 euros' });
        expect(element().getAttribute('aria-valuetext')).toBe('40 of 100 euros');
        await update({ role: 'meter' });
        expect(element().getAttribute('aria-valuenow')).toBe('40');
        await update({ 'aria-roledescription': 'Status Indicator', title: '40% of the budget' });
        expect(element().getAttribute('aria-roledescription')).toBe('Status Indicator');
        expect(element().getAttribute('title')).toBe('40% of the budget');
    });

    it('other roles have no value attributes', async () => {
        const { element, update } = await setup();
        await update({ role: 'img' });
        expect(element().getAttribute('role')).toBe('img');
        for (const attribute of ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext']) {
            expect(element().hasAttribute(attribute), attribute).toBe(false);
        }
        await update({ role: null });
        expect(element().hasAttribute('role')).toBe(false);
        expect(element().hasAttribute('aria-valuenow')).toBe(false);
    });

    it('is not focusable unless focusable', async () => {
        const { element, update } = await setup();
        expect(element().hasAttribute('tabindex')).toBe(false);
        document.getElementById('before')!.focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).not.toBe(element());

        await update({ focusable: true });
        expect(element().getAttribute('tabindex')).toBe('0');
        document.getElementById('before')!.focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(element());
        expect(getComputedStyle(element()).outlineStyle).not.toBe('none');
        // offset by the focus width, as fundamental-styles
        expect(getComputedStyle(element()).outlineOffset).toBe(getComputedStyle(element()).outlineWidth);
    });

    it('clickable variant shows a pointer and receives clicks', async () => {
        const { element, onClick, update } = await setup();
        expect(getComputedStyle(element()).cursor).not.toBe('pointer');
        await update({ clickable: true });
        expect(getComputedStyle(element()).cursor).toBe('pointer');
        await userEvent.click(element());
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('a clickable, focusable indicator is clicked with Enter and Space', async () => {
        const onKeyDown = vi.fn();
        const { element, onClick, update } = await setup({ clickable: true, focusable: true, onKeyDown });
        element().focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        expect(onClick).toHaveBeenCalledTimes(2);
        // the own keydown handler still runs
        expect(onKeyDown).toHaveBeenCalledTimes(2);
        await update({ clickable: false });
        element().focus();
        await userEvent.keyboard('{Enter}');
        expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('size sm, md, lg and xl render increasing sizes', async () => {
        const { svg, update } = await setup();
        const sizes: StatusIndicatorSize[] = ['sm', 'md', 'lg', 'xl'];
        const rects: DOMRect[] = [];
        for (const size of sizes) {
            await update({ size });
            rects.push(svg().getBoundingClientRect());
        }
        // sm 30×22, md 45×30, lg 80×55, xl 145×100 (px at 16px root)
        expect(rects.map((r) => Math.round(r.height))).toEqual([22, 30, 55, 100]);
        expect(rects.map((r) => Math.round(r.width))).toEqual([30, 45, 80, 145]);
    });

    it('labelSize changes the label font size', async () => {
        const { label, update } = await setup();
        const sizes: StatusIndicatorSize[] = ['sm', 'md', 'lg', 'xl'];
        const fonts: number[] = [];
        for (const size of sizes) {
            await update({ labelSize: size });
            fonts.push(parseFloat(getComputedStyle(label()!).fontSize));
        }
        for (let i = 1; i < fonts.length; i++) expect(fonts[i]).toBeGreaterThan(fonts[i - 1]);
        expect(fonts.slice(2)).toEqual([18, 30]);
    });

    it('passes className, native props and the ref through', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <StatusIndicator ref={ref} path={[SQUARE]} className="m-2" data-testid="spread" aria-label="Spread" />
        );
        const el = screen.container.querySelector<HTMLElement>('[data-testid="spread"]')!;
        expect(ref.current).toBe(el);
        expect(el.classList.contains('m-2')).toBe(true);
        expect(el.getAttribute('aria-label')).toBe('Spread');
    });
});
