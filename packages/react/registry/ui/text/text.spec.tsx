import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Text, type TextProps } from './text';

const LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(12);

type Props = TextProps & { text?: string };

/** A frame for layout and ResizeObserver callbacks to settle. */
const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

async function setup(initial: Props = {}) {
    let current: Props = { text: LONG, moreLabel: 'more', ...initial };
    const changes: boolean[] = [];
    const ui = ({ text, ...p }: Props) => (
        <div style={{ width: 300 }}>
            <Text id="text" onCollapsedChange={(c) => changes.push(c)} {...p}>
                {text}
            </Text>
        </div>
    );
    const screen = await render(ui(current));
    await frame();
    const paragraph = () => document.getElementById('text')!;
    return {
        changes,
        paragraph,
        clamp: () => paragraph().querySelector<HTMLElement>(':scope > span')!,
        toggle: () => paragraph().querySelector<HTMLElement>('button'),
        update: async (change: Props) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
            await frame();
        }
    };
}

describe('Text', () => {
    it('maxLines clamps the text', async () => {
        const { clamp, toggle, update } = await setup();
        const full = clamp().getBoundingClientRect().height;
        await update({ maxLines: 2 });
        const clamped = clamp().getBoundingClientRect().height;
        expect(clamped).toBeLessThan(full);
        expect(clamped).toBeLessThanOrEqual(2 * 20);
        expect(clamp().scrollHeight).toBeGreaterThan(clamp().clientHeight);
        expect(getComputedStyle(clamp()).webkitLineClamp).toBe('2');
        // not expandable: no More toggle
        expect(toggle()).toBeNull();

        await update({ maxLines: 4 });
        expect(clamp().getBoundingClientRect().height).toBeGreaterThan(clamped);
        await update({ maxLines: null });
        expect(clamp().getBoundingClientRect().height).toBe(full);
    });

    it('expandable shows More/Less and toggles the collapsed state (uncontrolled)', async () => {
        const { changes, clamp, toggle } = await setup({ maxLines: 2, expandable: true });
        const clamped = clamp().getBoundingClientRect().height;
        expect(toggle()!.textContent!.trim()).toBe('more');
        expect(toggle()!.getAttribute('aria-expanded')).toBe('false');
        // capitalized like fundamental-styles' toggle
        expect(getComputedStyle(toggle()!).textTransform).toBe('capitalize');

        await userEvent.click(toggle()!);
        await frame();
        expect(changes).toEqual([false]);
        expect(clamp().getBoundingClientRect().height).toBeGreaterThan(clamped);
        expect(toggle()!.textContent!.trim()).toBe('Less');
        expect(toggle()!.getAttribute('aria-expanded')).toBe('true');

        // keyboard: Enter and Space
        toggle()!.focus();
        await userEvent.keyboard('{Enter}');
        await frame();
        expect(changes).toEqual([false, true]);
        expect(clamp().getBoundingClientRect().height).toBe(clamped);
        await userEvent.keyboard(' ');
        await frame();
        expect(changes).toEqual([false, true, false]);
        expect(document.activeElement).toBe(toggle());
    });

    it('collapsed is controlled by the parent', async () => {
        const { changes, clamp, toggle, update } = await setup({ maxLines: 2, expandable: true, collapsed: true });
        const clamped = clamp().getBoundingClientRect().height;
        await userEvent.click(toggle()!);
        await frame();
        // asks the parent, which does not change the state
        expect(changes).toEqual([false]);
        expect(clamp().getBoundingClientRect().height).toBe(clamped);
        expect(toggle()!.getAttribute('aria-expanded')).toBe('false');

        await update({ collapsed: false });
        expect(clamp().getBoundingClientRect().height).toBeGreaterThan(clamped);
        expect(toggle()!.getAttribute('aria-expanded')).toBe('true');
        await update({ collapsed: true });
        expect(clamp().getBoundingClientRect().height).toBe(clamped);
        expect(toggle()!.getAttribute('aria-expanded')).toBe('false');
    });

    it('an expandable text that starts expanded shows the Less toggle', async () => {
        const { clamp, toggle, update } = await setup({ maxLines: 2, expandable: true, defaultCollapsed: false });
        expect(toggle()!.textContent!.trim()).toBe('Less');
        expect(getComputedStyle(clamp()).webkitLineClamp).toBe('none');
        // and measures again when the text changes while expanded
        await update({ text: 'Short text' });
        expect(toggle()).toBeNull();
        await update({ text: LONG });
        expect(toggle()!.textContent!.trim()).toBe('Less');
    });

    it('shows no toggle when the text fits in maxLines', async () => {
        const { toggle, update } = await setup({ maxLines: 2, expandable: true, text: 'Short text' });
        expect(toggle()).toBeNull();
        await update({ text: LONG });
        expect(toggle()).not.toBeNull();
        await update({ text: 'Short again' });
        expect(toggle()).toBeNull();
    });

    it('whitespace preserve and hyphenation', async () => {
        const { paragraph, clamp, update } = await setup({ text: 'First line\nSecond line\n\nFourth   line' });
        expect(getComputedStyle(paragraph()).whiteSpaceCollapse).toBe('collapse');
        const collapsed = clamp().getBoundingClientRect().height;
        await update({ whitespaces: true });
        expect(getComputedStyle(paragraph()).whiteSpaceCollapse).toBe('preserve');
        expect(clamp().getBoundingClientRect().height).toBeGreaterThanOrEqual(collapsed * 3.5);
        expect(clamp().innerText).toContain('Fourth   line');

        expect(getComputedStyle(paragraph()).hyphens).toBe('manual');
        await update({ hyphenation: 'auto' });
        expect(getComputedStyle(paragraph()).hyphens).toBe('auto');
        await update({ hyphenation: 'manual' });
        expect(getComputedStyle(paragraph()).hyphens).toBe('manual');
        await update({ hyphenation: 'none' });
        expect(getComputedStyle(paragraph()).hyphens).toBe('none');
    });

    it('subline variant', async () => {
        const { paragraph, update } = await setup();
        const probe = document.createElement('span');
        paragraph().appendChild(probe);
        probe.style.color = 'var(--sapContent_LabelColor)';
        const labelColor = getComputedStyle(probe).color;
        probe.remove();
        expect(getComputedStyle(paragraph()).fontSize).toBe('14px');

        await update({ subline: true });
        expect(getComputedStyle(paragraph()).fontSize).toBe('12px');
        expect(getComputedStyle(paragraph()).color).toBe(labelColor);
        // two lines at most
        expect(getComputedStyle(paragraph()).webkitLineClamp).toBe('2');
        const lineHeight = parseFloat(getComputedStyle(paragraph()).fontSize) * 1.5;
        expect(paragraph().getBoundingClientRect().height).toBeLessThanOrEqual(2 * lineHeight);
    });

    it('maxLines 0 or negative does not clamp and shows no toggle', async () => {
        const { clamp, toggle, update } = await setup({ expandable: true });
        const full = clamp().getBoundingClientRect().height;
        for (const lines of [0, -1, -5]) {
            await update({ maxLines: lines });
            expect(clamp().getBoundingClientRect().height).toBe(full);
            expect(getComputedStyle(clamp()).webkitLineClamp).toBe('none');
            expect(toggle()).toBeNull();
        }
        await update({ maxLines: 2 });
        expect(clamp().getBoundingClientRect().height).toBeLessThan(full);
        expect(toggle()).not.toBeNull();
    });

    it('custom moreLabel and lessLabel replace the toggle text', async () => {
        const { toggle, update } = await setup({
            maxLines: 2,
            expandable: true,
            moreLabel: 'Show all',
            lessLabel: 'Show fewer'
        });
        expect(toggle()!.textContent!.trim()).toBe('Show all');
        await userEvent.click(toggle()!);
        await frame();
        expect(toggle()!.textContent!.trim()).toBe('Show fewer');
        await update({ lessLabel: 'Collapse' });
        expect(toggle()!.textContent!.trim()).toBe('Collapse');
    });

    it('selected text takes the selection colours', async () => {
        const { paragraph, clamp } = await setup();
        const probe = document.createElement('span');
        paragraph().appendChild(probe);
        probe.style.color = 'var(--sapSelectedColor)';
        const selected = getComputedStyle(probe).color;
        probe.style.color = 'var(--sapContent_ContrastTextColor)';
        const contrast = getComputedStyle(probe).color;
        probe.remove();
        expect(getComputedStyle(clamp(), '::selection').backgroundColor).toBe(selected);
        expect(getComputedStyle(clamp(), '::selection').color).toBe(contrast);
    });

    it('passes className, native props and the ref through; render swaps the element', async () => {
        const ref = createRef<HTMLParagraphElement>();
        const screen = await render(
            <div>
                <Text ref={ref} className="m-1" title="Hint" data-testid="spread">
                    Spread
                </Text>
                <Text render={<div />} id="as-div">
                    Block
                </Text>
            </div>
        );
        const paragraph = screen.container.querySelector<HTMLElement>('[data-testid="spread"]')!;
        expect(ref.current).toBe(paragraph);
        expect(paragraph.tagName).toBe('P');
        expect(paragraph.classList.contains('m-1')).toBe(true);
        expect(paragraph.title).toBe('Hint');
        expect(screen.container.querySelector('#as-div')!.tagName).toBe('DIV');
    });
});
