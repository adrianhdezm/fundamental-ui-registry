import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';
import { Scrollbar, type ScrollbarProps } from './scrollbar';

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const stable = async () => {
    await frame();
    await frame();
};

interface HostProps extends ScrollbarProps {
    contentWidth?: number;
    contentHeight?: number;
}

/** Mirrors the Angular test host: a 200x100 focusable scrollbar with 600x400 content. */
function Host({ contentWidth = 600, contentHeight = 400, ...props }: HostProps) {
    return (
        <Scrollbar data-testid="bar" tabIndex={0} aria-label="Content" style={{ width: 200, height: 100 }} {...props}>
            <div style={{ width: contentWidth, height: contentHeight }}>Content</div>
        </Scrollbar>
    );
}

async function setup(initial: HostProps = {}) {
    let current = initial;
    const screen = await render(<Host {...current} />);
    const element = document.querySelector<HTMLElement>('[data-testid="bar"]')!;
    return {
        screen,
        element,
        update: async (change: HostProps) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
        }
    };
}

/** Resolves a theme color variable to the computed rgb() string. */
function themeColor(variable: string): string {
    const probe = document.createElement('div');
    probe.style.color = `var(${variable})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
}

describe('Scrollbar', () => {
    it('applies the SAP scrollbar colors', async () => {
        const { element } = await setup();
        const face = themeColor('--sapScrollBar_FaceColor');
        const track = themeColor('--sapScrollBar_TrackColor');
        expect(getComputedStyle(element).scrollbarColor).toBe(`${face} ${track}`);
    });

    it('uses the SAP text typography', async () => {
        const { element } = await setup();
        const style = getComputedStyle(element);
        expect(style.fontFamily).toContain('72');
        expect(style.color).toBe(themeColor('--sapTextColor'));
        expect(style.lineHeight).toBe('normal');
        expect(style.boxSizing).toBe('border-box');
    });

    it('reports its scrolling to scroll listeners, and popovers inside follow it', async () => {
        const onScroll = vi.fn();
        const { element } = await setup({ onScroll });
        element.scrollTop = 50;
        element.dispatchEvent(new Event('scroll'));
        expect(onScroll).toHaveBeenCalledTimes(1);
        element.scrollTop = 0;

        // Angular registers the element as a CDK scrollable so overlays follow it; Base UI's positioner follows
        // every scrolling ancestor of its anchor by itself
        await render(
            <Scrollbar data-testid="popover-bar" style={{ width: 300, height: 120 }}>
                <div style={{ height: 600, paddingTop: 20 }}>
                    <Popover>
                        <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
                        <PopoverBody aria-label="Details" data-testid="surface">
                            Details
                        </PopoverBody>
                    </Popover>
                </div>
            </Scrollbar>
        );
        const bar = document.querySelector<HTMLElement>('[data-testid="popover-bar"]')!;
        await userEvent.click(document.querySelector<HTMLElement>('[data-testid="trigger"]')!);
        await stable();
        const surface = () => document.querySelector<HTMLElement>('[data-testid="surface"]')!;
        const before = surface().getBoundingClientRect().top;
        bar.scrollTop = 10;
        bar.dispatchEvent(new Event('scroll'));
        await stable();
        await expect.poll(() => surface().getBoundingClientRect().top).toBeCloseTo(before - 10, 0);
    });

    it('scrolls in both directions by default and only when needed', async () => {
        const { element } = await setup();
        const style = getComputedStyle(element);
        expect(style.overflowX).toBe('auto');
        expect(style.overflowY).toBe('auto');
        expect(element.scrollHeight).toBeGreaterThan(element.clientHeight);
        expect(element.scrollWidth).toBeGreaterThan(element.clientWidth);
    });

    it('noHorizontalScroll hides the horizontal overflow', async () => {
        const { element, update } = await setup();
        await update({ noHorizontalScroll: true });
        expect(getComputedStyle(element).overflowX).toBe('hidden');
        expect(getComputedStyle(element).overflowY).toBe('auto');
    });

    it('noVerticalScroll hides the vertical overflow', async () => {
        const { element, update } = await setup();
        await update({ noVerticalScroll: true });
        expect(getComputedStyle(element).overflowY).toBe('hidden');
        expect(getComputedStyle(element).overflowX).toBe('auto');
    });

    it('alwaysVisible shows the scrollbars even when the content fits', async () => {
        const { element, update } = await setup();
        await update({ contentWidth: 100, contentHeight: 50, alwaysVisible: true });
        const style = getComputedStyle(element);
        expect(style.overflowX).toBe('scroll');
        expect(style.overflowY).toBe('scroll');
        // noHorizontalScroll still wins over alwaysVisible
        await update({ noHorizontalScroll: true });
        expect(getComputedStyle(element).overflowX).toBe('hidden');
        expect(getComputedStyle(element).overflowY).toBe('scroll');
    });

    it('the ref scrolls the element (Angular scroll())', async () => {
        const ref = createRef<HTMLDivElement>();
        const { element } = await setup({ ref });
        expect(ref.current).toBe(element);
        ref.current!.scroll({ top: 120, left: 80 });
        expect(element.scrollTop).toBe(120);
        expect(element.scrollLeft).toBe(80);
    });

    it('shows the SAP focus outline on keyboard focus only', async () => {
        const { element } = await setup();
        await userEvent.click(element);
        expect(document.activeElement).toBe(element);
        expect(getComputedStyle(element).outlineStyle).toBe('none');
        element.blur();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(element);
        const style = getComputedStyle(element);
        expect(style.outlineStyle).not.toBe('none');
        expect(style.outlineColor).toBe(themeColor('--sapContent_FocusColor'));
        expect(style.outlineOffset).toBe(`-${style.outlineWidth}`);
    });

    it('passes native props and className, and render renders another element', async () => {
        const { element, update } = await setup({ id: 'terms', className: 'h-40 p-4', role: 'region' });
        expect(element.tagName).toBe('DIV');
        expect(element.id).toBe('terms');
        expect(element.getAttribute('role')).toBe('region');
        expect(element.getAttribute('aria-label')).toBe('Content');
        expect(element.className).toContain('scrollbar-sap');
        expect(element.className).toContain('p-4');
        // a className overflow wins over the default
        await update({ className: 'overflow-hidden' });
        expect(getComputedStyle(element).overflowX).toBe('hidden');
        expect(getComputedStyle(element).overflowY).toBe('hidden');
        await update({ className: undefined, render: <section /> });
        const section = document.querySelector<HTMLElement>('[data-testid="bar"]')!;
        expect(section.tagName).toBe('SECTION');
        expect(section.className).toContain('scrollbar-sap');
    });
});
