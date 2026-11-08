import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import type { IconFont } from '@/ui/icon/icon';
import {
    MicroProcessFlow,
    MicroProcessFlowFocusableItem,
    MicroProcessFlowIcon,
    MicroProcessFlowIntermediaryItem,
    MicroProcessFlowItem
} from './micro-process-flow';

interface HostProps {
    steps: number[];
    independent?: boolean;
}

function Host({ steps, independent = false }: HostProps) {
    return (
        <div style={{ width: 800 }}>
            <button id="before">Before</button>
            <MicroProcessFlow transitionSpeed={0} independentSteps={independent}>
                {steps.map((step, i) => (
                    <MicroProcessFlowItem key={step} state={i === 0 ? 'positive' : 'none'} intermediate={i === 0}>
                        <MicroProcessFlowIcon
                            focusable
                            glyph="pending"
                            glyphAriaLabel={`Step ${step}`}
                            data-step={step}
                        />
                        <MicroProcessFlowIntermediaryItem>between</MicroProcessFlowIntermediaryItem>
                    </MicroProcessFlowItem>
                ))}
            </MicroProcessFlow>
            <button id="after">After</button>
        </div>
    );
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

async function setup(count = 3) {
    let props: HostProps = { steps: Array.from({ length: count }, (_, i) => i + 1) };
    const screen = await render(<Host {...props} />);
    await frame();
    const root = screen.container;
    const icons = () => [...root.querySelectorAll<HTMLElement>('[data-step]')];
    return {
        screen,
        root,
        icons,
        update: async (change: Partial<HostProps>) => {
            props = { ...props, ...change };
            await screen.rerender(<Host {...props} />);
            await frame();
        },
        tabbable: () =>
            icons()
                .filter((icon) => icon.tabIndex === 0)
                .map((icon) => Number(icon.dataset['step'])),
        links: () => [...root.querySelectorAll('[role=button]')].map((b) => b.getAttribute('aria-label')),
        items: () => [...root.querySelectorAll<HTMLElement>('[data-mpf-item]')]
    };
}

describe('MicroProcessFlow', () => {
    it('joins the steps with connectors, but not after the last', async () => {
        const { items, update, root } = await setup();
        expect(items()[0].textContent).toContain('between');
        expect(items()[2].textContent).not.toContain('between');
        // the intermediary item sits on the connector, after the step's content
        const connector = items()[0].querySelector<HTMLElement>('[class*="before:border-b"]')!;
        expect(connector.textContent).toBe('between');
        // the intermediate connector draws a mark; independent steps hide the lines
        expect(connector.className).toContain('after:bg-sap-negative-element-color');
        expect(getComputedStyle(connector, '::after').width).toBe('4px');
        expect(getComputedStyle(connector, '::before').borderBottomStyle).toBe('solid');
        await update({ independent: true });
        expect(connector.className).toContain('before:border-transparent');
        expect(getComputedStyle(connector, '::before').borderBottomColor).toBe('rgba(0, 0, 0, 0)');
        expect(root.querySelector('[data-glyph]')!.getAttribute('aria-label')).toBe('Step 1');
    });

    it('is one tab stop; Left and Right move between the steps', async () => {
        const { root, tabbable } = await setup();
        expect(tabbable()).toEqual([1, 2, 3]);
        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement!.getAttribute('data-step')).toBe('1');
        // inside the flow no step is in the tab order, so Tab leaves it
        expect(tabbable()).toEqual([]);
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        expect(document.activeElement!.getAttribute('data-step')).toBe('3');
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement!.getAttribute('data-step')).toBe('3');
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement!.getAttribute('data-step')).toBe('2');
        await userEvent.tab();
        expect(document.activeElement!.id).toBe('after');
        expect(tabbable()).toEqual([1, 2, 3]);
    });

    it('mirrors Left and Right in RTL', async () => {
        const { root } = await setup();
        root.setAttribute('dir', 'rtl');
        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement!.getAttribute('data-step')).toBe('2');
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement!.getAttribute('data-step')).toBe('1');
    });

    it('shows how many steps are hidden and scrolls to them', async () => {
        const { root, tabbable, links } = await setup(20);
        expect(links()).toHaveLength(1);
        const hidden = Number(links()[0]!.split(' ')[0]);
        const visible = tabbable();
        expect(visible[0]).toBe(1);
        expect(visible.length + hidden).toBe(20);
        await userEvent.click(root.querySelector('[aria-label$="next steps"]')!);
        await frame();
        // the previous link takes room too
        expect(links()[0]).toBe('1 previous steps');
        expect(tabbable()[0]).toBe(2);
        expect(1 + tabbable().length + Number(links()[1]!.split(' ')[0])).toBe(20);
        await userEvent.click(root.querySelector('[aria-label$="previous steps"]')!);
        await frame();
        expect(links()).toEqual([`${hidden} next steps`]);
    });

    it('the overflow links work with Enter and Space', async () => {
        const { root, links } = await setup(20);
        const hidden = Number(links()[0]!.split(' ')[0]);
        root.querySelector<HTMLElement>('[aria-label$="next steps"]')!.focus();
        await userEvent.keyboard('{Enter}');
        await frame();
        expect(links()[0]).toBe('1 previous steps');
        root.querySelector<HTMLElement>('[aria-label$="previous steps"]')!.focus();
        await userEvent.keyboard(' ');
        await frame();
        expect(links()).toEqual([`${hidden} next steps`]);
    });

    it('scrolls a step into view when the arrow keys reach it', async () => {
        const { icons, links, root } = await setup(20);
        const visible = 20 - Number(links()[0]!.split(' ')[0]);
        icons()[0].focus();
        for (let i = 0; i < visible; i++) await userEvent.keyboard('{ArrowRight}');
        await frame();
        expect(document.activeElement!.getAttribute('data-step')).toBe(String(visible + 1));
        expect(links()[0]).toBe('1 previous steps');
        const flow = root.querySelector('[data-mpf-item]')!.parentElement!.parentElement!.getBoundingClientRect();
        const focused = document.activeElement!.getBoundingClientRect();
        expect(focused.right).toBeLessThanOrEqual(flow.right + 0.5);
    });

    it('starts again at the first step when the steps change', async () => {
        const { root, links, update } = await setup(20);
        await userEvent.click(root.querySelector('[aria-label$="next steps"]')!);
        await frame();
        expect(links()[0]).toBe('1 previous steps');
        await update({ steps: Array.from({ length: 19 }, (_, i) => i + 1) });
        expect(links()).toHaveLength(1);
        expect(links()[0]).toMatch(/next steps$/);
    });

    it('renders the glyph in the given icon font', async () => {
        const Icon = ({ glyph, font }: { glyph: string | null; font: IconFont }) => (
            <MicroProcessFlowIcon glyph={glyph} font={font} glyphAriaLabel="Step" />
        );
        const screen = await render(<Icon glyph="actor" font="SAP-icons-TNT" />);
        const icon = () => screen.container.querySelector<HTMLElement>('[data-glyph]');
        const before = () => getComputedStyle(icon()!, '::before');
        expect(icon()!.dataset['glyph']).toBe(String.fromCodePoint(0xe03c));
        expect(before().fontFamily).toContain('SAP-icons-TNT');

        await screen.rerender(<Icon glyph="add-note" font="BusinessSuiteInAppSymbols" />);
        expect(icon()!.dataset['glyph']).toBe(String.fromCodePoint(0xe008));
        expect(before().fontFamily).toContain('SAP-icons-Business-Suite');

        // without a glyph the step renders no icon
        await screen.rerender(<Icon glyph={null} font="SAP-icons" />);
        expect(icon()).toBeNull();
    });

    it('the focusable item makes any element of a step the focus target', async () => {
        const screen = await render(
            <MicroProcessFlow>
                <MicroProcessFlowItem>
                    <MicroProcessFlowFocusableItem render={<span />} data-testid="custom">
                        A
                    </MicroProcessFlowFocusableItem>
                </MicroProcessFlowItem>
                <MicroProcessFlowItem>
                    <MicroProcessFlowFocusableItem data-testid="second">B</MicroProcessFlowFocusableItem>
                </MicroProcessFlowItem>
            </MicroProcessFlow>
        );
        await frame();
        const custom = screen.container.querySelector<HTMLElement>('[data-testid="custom"]')!;
        expect(custom.tagName).toBe('SPAN');
        expect(custom.tabIndex).toBe(0);
        custom.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement!.getAttribute('data-testid')).toBe('second');
        // a step outside of a flow is not in the tab order, and keeps its connector
        const alone = await render(
            <MicroProcessFlowItem>
                <MicroProcessFlowFocusableItem data-testid="alone">A</MicroProcessFlowFocusableItem>
            </MicroProcessFlowItem>
        );
        expect(alone.container.querySelector<HTMLElement>('[data-testid="alone"]')!.tabIndex).toBe(-1);
        expect(alone.container.querySelector('[class*="before:border-b"]')).not.toBeNull();
    });

    it('state colours the icon of a step', async () => {
        const screen = await render(
            <MicroProcessFlow>
                <MicroProcessFlowItem state="negative">
                    <MicroProcessFlowIcon glyph="map" data-testid="negative" />
                </MicroProcessFlowItem>
                <MicroProcessFlowItem>
                    <MicroProcessFlowIcon glyph="map" data-testid="none" />
                </MicroProcessFlowItem>
            </MicroProcessFlow>
        );
        const style = (id: string) =>
            getComputedStyle(screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!);
        expect(style('negative').backgroundColor).not.toBe(style('none').backgroundColor);
        expect(style('negative').borderTopLeftRadius).not.toBe('0px');
    });

    it('passes className, native props and the ref through', async () => {
        const ref = createRef<HTMLDivElement>();
        const itemRef = createRef<HTMLDivElement>();
        const screen = await render(
            <MicroProcessFlow ref={ref} id="flow" className="custom" data-x="1" aria-label="Process">
                <MicroProcessFlowItem ref={itemRef} className="item-custom">
                    <MicroProcessFlowIcon focusable glyph="map" />
                </MicroProcessFlowItem>
            </MicroProcessFlow>
        );
        const flow = screen.container.querySelector<HTMLElement>('#flow')!;
        expect(ref.current).toBe(flow);
        expect(flow.classList.contains('custom')).toBe(true);
        expect(flow.dataset['x']).toBe('1');
        expect(flow.getAttribute('aria-label')).toBe('Process');
        expect(itemRef.current!.classList.contains('item-custom')).toBe(true);
    });
});
