import { createRef, useImperativeHandle, useState, type Ref } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    DEFAULT_FLEXIBLE_LAYOUT_CONFIG,
    FlexibleColumnLayout,
    FlexibleColumnLayoutConfigProvider,
    type FlexibleColumnLayout as Layout,
    type FlexibleColumnLayoutBackgroundDesign,
    type FlexibleColumnLayoutDefinition
} from './flexible-column-layout';

interface Controls {
    layout: () => Layout;
    setLayout: (layout: Layout) => void;
    setWidth: (width: number) => void;
    setDesign: (design: FlexibleColumnLayoutBackgroundDesign) => void;
    setExpandStart: (label: string | undefined) => void;
    setCollapseStart: (label: string | undefined) => void;
}

/** The Angular test host: a controlled layout in a container of a given width. */
function Host({
    initialLayout,
    initialWidth,
    changes,
    layoutDefinitions,
    controls
}: {
    initialLayout: Layout;
    initialWidth: number;
    changes: Layout[];
    layoutDefinitions?: Partial<FlexibleColumnLayoutDefinition>;
    controls: Ref<Controls>;
}) {
    const [layout, setLayout] = useState(initialLayout);
    const [width, setWidth] = useState(initialWidth);
    const [design, setDesign] = useState<FlexibleColumnLayoutBackgroundDesign>('solid');
    const [expandStart, setExpandStart] = useState<string | undefined>();
    const [collapseStart, setCollapseStart] = useState<string | undefined>();
    useImperativeHandle(controls, () => ({
        layout: () => layout,
        setLayout,
        setWidth,
        setDesign,
        setExpandStart,
        setCollapseStart
    }));
    return (
        <div style={{ width }}>
            <FlexibleColumnLayout
                className="h-64"
                layout={layout}
                onLayoutChange={(next) => {
                    changes.push(next);
                    setLayout(next);
                }}
                backgroundDesign={design}
                layoutDefinitions={layoutDefinitions}
                collapseTitleEndBtn="Collapse end"
                expandTitleStartBtn={expandStart}
                collapseTitleStartBtn={collapseStart}
                startColumn={<p>Start</p>}
                midColumn={<p>Mid</p>}
                endColumn={<p>End</p>}
            />
        </div>
    );
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const stable = async () => {
    await frame();
    await frame();
    await frame();
};

async function setup(
    layout: Layout,
    width = 1400,
    options: { layoutDefinitions?: Partial<FlexibleColumnLayoutDefinition>; provider?: boolean } = {}
) {
    const controls = createRef<Controls>();
    const changes: Layout[] = [];
    const host = (
        <Host
            initialLayout={layout}
            initialWidth={width}
            changes={changes}
            layoutDefinitions={options.layoutDefinitions}
            controls={controls}
        />
    );
    const screen = await render(
        options.provider ? (
            <FlexibleColumnLayoutConfigProvider layouts={{ TwoColumnsMidExpanded: { start: 40, mid: 60, end: 0 } }}>
                {host}
            </FlexibleColumnLayoutConfigProvider>
        ) : (
            host
        )
    );
    await stable();
    const fcl = screen.container.querySelector<HTMLElement>(':scope > div > div')!;
    const c = () => controls.current!;
    return {
        screen,
        fcl,
        changes,
        layout: () => c().layout(),
        set: async (fn: (controls: Controls) => void) => {
            fn(c());
            await stable();
        },
        resize: async (px: number) => {
            c().setWidth(px);
            await stable();
        },
        columns: () => [...fcl.querySelectorAll<HTMLElement>(':scope > div:not(:has(> button))')],
        separators: () => [...fcl.querySelectorAll<HTMLElement>(':scope > div:has(> button)')],
        buttons: () => [...fcl.querySelectorAll<HTMLButtonElement>(':scope > div > button')]
    };
}

function cssColor(variable: string): string {
    const probe = document.createElement('div');
    probe.style.backgroundColor = `var(${variable})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
}

describe('FlexibleColumnLayout', () => {
    afterEach(() => {
        document.documentElement.removeAttribute('dir');
        document.documentElement.removeAttribute('data-sap-theme');
    });

    it('each layout sets the start/mid/end widths from the layout definitions; hidden columns are aria-hidden and invisible', async () => {
        const layouts = DEFAULT_FLEXIBLE_LAYOUT_CONFIG.layouts;
        // these layouts adapt on wide screens, so they are checked between the break points
        const medium: Layout[] = ['TwoColumnsEndExpanded', 'ThreeColumnsStartMinimized'];
        for (const layout of Object.keys(layouts) as Layout[]) {
            const { screen, columns, ...fcl } = await setup(layout, medium.includes(layout) ? 1100 : 1400);
            expect(fcl.layout()).toBe(layout);
            const { start, mid, end } = layouts[layout];
            const cols = columns();
            // the columns transition their width and visibility
            await Promise.all(cols.flatMap((c) => c.getAnimations().map((a) => a.finished)));
            expect(cols.map((c) => c.style.width)).toEqual([`${start}%`, `${mid}%`, `${end}%`]);
            [start, mid, end].forEach((width, i) => {
                expect(cols[i].getAttribute('aria-hidden')).toBe(width ? null : 'true');
                expect(getComputedStyle(cols[i]).visibility).toBe(width ? 'visible' : 'hidden');
            });
            expect(cols.map((c) => c.textContent!.trim())).toEqual(['Start', 'Mid', 'End']);
            await screen.unmount();
        }
    });

    it('separators appear only between visible columns with the right arrow direction (mirrored in RTL)', async () => {
        const one = await setup('OneColumnStartFullScreen');
        expect(one.separators()).toHaveLength(0);
        await one.screen.unmount();

        const two = await setup('TwoColumnsStartExpanded');
        expect(two.buttons().map((b) => b.getAttribute('aria-label'))).toEqual(['Collapse']);
        await two.screen.unmount();

        const { buttons, separators, columns } = await setup('ThreeColumnsMidExpanded');
        expect(separators()).toHaveLength(2);
        // start separator sits between start and mid, end separator between mid and end
        const [start, mid, end] = columns();
        expect(start.nextElementSibling).toBe(separators()[0]);
        expect(mid.nextElementSibling).toBe(separators()[1]);
        expect(separators()[1].nextElementSibling).toBe(end);
        const [startButton, endButton] = buttons();
        expect(startButton.getAttribute('aria-label')).toBe('Expand');
        expect(startButton.title).toBe('Expand');
        expect(endButton.getAttribute('aria-label')).toBe('Collapse end');
        const startIcon = startButton.querySelector<HTMLElement>('[data-glyph]')!;
        const endIcon = endButton.querySelector<HTMLElement>('[data-glyph]')!;
        expect(startIcon.getAttribute('data-glyph')).toBe(String.fromCharCode(0xe1ed)); // slim-arrow-right
        expect(endIcon.getAttribute('data-glyph')).toBe(String.fromCharCode(0xe1ee)); // slim-arrow-left
        expect(getComputedStyle(startIcon).scale).not.toContain('-1');
        document.documentElement.setAttribute('dir', 'rtl');
        expect(getComputedStyle(startIcon).scale).toBe('-1 1');
        expect(getComputedStyle(endIcon).scale).toBe('-1 1');
    });

    it('clicking a separator or its button switches to the next layout and calls onLayoutChange', async () => {
        const { layout, changes, separators, buttons, columns } = await setup('TwoColumnsMidExpanded', 1100);
        await userEvent.click(buttons()[0]);
        await stable();
        expect(layout()).toBe('TwoColumnsStartExpanded');
        expect(changes).toEqual(['TwoColumnsStartExpanded']);
        expect(columns()[0].style.width).toBe('67%');
        // the separator itself (outside the button) toggles back
        const separator = separators()[0];
        const rect = separator.getBoundingClientRect();
        await userEvent.click(separator, { position: { x: rect.width / 2, y: 4 } });
        await stable();
        expect(layout()).toBe('TwoColumnsMidExpanded');
        expect(changes).toEqual(['TwoColumnsStartExpanded', 'TwoColumnsMidExpanded']);
    });

    it('the start separator switches ThreeColumnsMidExpanded to ThreeColumnsEndMinimized', async () => {
        const { layout, changes, buttons, columns } = await setup('ThreeColumnsMidExpanded');
        await userEvent.click(buttons()[0]);
        await stable();
        expect(layout()).toBe('ThreeColumnsEndMinimized');
        expect(changes).toEqual(['ThreeColumnsEndMinimized']);
        expect(columns().map((c) => c.style.width)).toEqual(['33%', '67%', '0%']);
    });

    it('expandTitleStartBtn and collapseTitleStartBtn label the start separator button', async () => {
        const { set, buttons } = await setup('TwoColumnsStartExpanded');
        await set((c) => {
            c.setExpandStart('Expand start');
            c.setCollapseStart('Collapse start');
        });
        expect(buttons()[0].getAttribute('aria-label')).toBe('Collapse start');
        expect(buttons()[0].title).toBe('Collapse start');

        await set((c) => c.setLayout('ThreeColumnsMidExpanded'));
        const [start, end] = buttons();
        expect(start.getAttribute('aria-label')).toBe('Expand start');
        expect(start.title).toBe('Expand start');
        // the end separator keeps its own label
        expect(end.getAttribute('aria-label')).toBe('Collapse end');
    });

    it('the separator buttons are keyboard operable', async () => {
        const { layout, buttons } = await setup('ThreeColumnsMidExpanded');
        buttons()[1].focus();
        await userEvent.keyboard('{Enter}');
        await stable();
        expect(layout()).toBe('ThreeColumnsEndExpanded');
        // only the end separator is left
        expect(buttons()).toHaveLength(1);
        buttons()[0].focus();
        await userEvent.keyboard(' ');
        await stable();
        expect(layout()).toBe('ThreeColumnsMidExpanded');
    });

    it('below smBreakPoint 2/3 column layouts collapse to one full-screen column and restore when wide again', async () => {
        const { layout, set, resize, columns, separators } = await setup('TwoColumnsMidExpanded', 1100);
        await resize(800);
        expect(layout()).toBe('OneColumnMidFullScreen');
        expect(columns().map((c) => c.style.width)).toEqual(['0%', '100%', '0%']);
        expect(separators()).toHaveLength(0);
        await resize(1100);
        expect(layout()).toBe('TwoColumnsMidExpanded');

        await set((c) => c.setLayout('ThreeColumnsEndMinimized'));
        await resize(800);
        expect(layout()).toBe('OneColumnEndFullScreen');
        await resize(1100);
        expect(layout()).toBe('ThreeColumnsEndMinimized');
    });

    it('between sm and lg three-column layouts reduce to two columns; above lg TwoColumnsEndExpanded becomes three columns', async () => {
        const { layout, set, resize, columns } = await setup('ThreeColumnsMidExpanded', 1400);
        await resize(1100);
        expect(layout()).toBe('ThreeColumnsStartMinimized');
        expect(columns()[0].getAttribute('aria-hidden')).toBe('true');
        await resize(1400);
        expect(layout()).toBe('ThreeColumnsMidExpanded');

        await set((c) => c.setLayout('ThreeColumnsEndExpanded'));
        await resize(1100);
        expect(layout()).toBe('TwoColumnsEndExpanded');
        await resize(1400);
        expect(layout()).toBe('ThreeColumnsEndExpanded');
        expect(columns().map((c) => c.style.width)).toEqual(['25%', '25%', '50%']);
    });

    it('a layout chosen while narrow replaces the one to restore', async () => {
        const { layout, set, resize } = await setup('TwoColumnsMidExpanded', 1100);
        await resize(800);
        expect(layout()).toBe('OneColumnMidFullScreen');
        await set((c) => c.setLayout('OneColumnStartFullScreen'));
        await resize(1100);
        expect(layout()).toBe('OneColumnStartFullScreen');

        // a multi-column layout chosen while narrow collapses and is the one restored later
        await resize(800);
        await set((c) => c.setLayout('ThreeColumnsEndExpanded'));
        expect(layout()).toBe('OneColumnEndFullScreen');
        await resize(1400);
        expect(layout()).toBe('ThreeColumnsEndExpanded');
    });

    it('FlexibleColumnLayoutConfigProvider overrides some widths and keeps the defaults', async () => {
        const { set, columns } = await setup('TwoColumnsMidExpanded', 1100, { provider: true });
        expect(columns().map((c) => c.style.width)).toEqual(['40%', '60%', '0%']);
        await set((c) => c.setLayout('TwoColumnsStartExpanded'));
        expect(columns().map((c) => c.style.width)).toEqual(['67%', '33%', '0%']);
    });

    it('layoutDefinitions overrides the widths of the provider', async () => {
        const { set, columns } = await setup('TwoColumnsMidExpanded', 1100, {
            provider: true,
            layoutDefinitions: { TwoColumnsStartExpanded: { start: 70, mid: 30, end: 0 } }
        });
        expect(columns().map((c) => c.style.width)).toEqual(['40%', '60%', '0%']);
        await set((c) => c.setLayout('TwoColumnsStartExpanded'));
        expect(columns().map((c) => c.style.width)).toEqual(['70%', '30%', '0%']);
    });

    it('backgroundDesign solid/translucent/transparent, including high contrast', async () => {
        const { set, separators } = await setup('TwoColumnsMidExpanded', 1100);
        const background = () => getComputedStyle(separators()[0]).backgroundColor;
        expect(background()).toBe(cssColor('--sapContent_ForegroundColor'));
        await set((c) => c.setDesign('translucent'));
        expect(background()).toBe(cssColor('--sapGroup_ContentBackground'));
        await set((c) => c.setDesign('transparent'));
        expect(background()).toBe('rgba(0, 0, 0, 0)');

        document.documentElement.setAttribute('data-sap-theme', 'sap_horizon_hcb');
        expect(background()).toBe(cssColor('--sapBackgroundColor'));
        await set((c) => c.setDesign('translucent'));
        expect(background()).toBe(cssColor('--sapBackgroundColor'));
        await set((c) => c.setDesign('solid'));
        expect(background()).toBe(cssColor('--sapContent_ForegroundColor'));
    });

    it('columns have borders next to the separators, none in high contrast', async () => {
        const { columns } = await setup('ThreeColumnsMidExpanded');
        const borders = () =>
            columns().map((c) => [getComputedStyle(c).borderLeftWidth, getComputedStyle(c).borderRightWidth]);
        expect(borders()).toEqual([
            ['0px', '1px'],
            ['1px', '1px'],
            ['1px', '0px']
        ]);
        expect(getComputedStyle(columns()[0]).borderRightColor).toBe(cssColor('--sapGroup_ContentBorderColor'));
        document.documentElement.setAttribute('dir', 'rtl');
        expect(borders()).toEqual([
            ['1px', '0px'],
            ['1px', '1px'],
            ['0px', '1px']
        ]);
        document.documentElement.setAttribute('data-sap-theme', 'sap_horizon_hcb');
        expect(borders().flat()).toEqual(Array(6).fill('0px'));
    });

    it('separator buttons are 1.5rem wide, 2rem high (1.625rem in compact)', async () => {
        const { buttons, fcl } = await setup('TwoColumnsMidExpanded', 1100);
        const size = () => {
            const rect = buttons()[0].getBoundingClientRect();
            return [rect.width, rect.height];
        };
        expect(size()).toEqual([24, 32]);
        fcl.setAttribute('data-density', 'compact');
        expect(size()).toEqual([24, 26]);
    });

    it('is uncontrolled with defaultLayout and still adapts to the width', async () => {
        const onLayoutChange = vi.fn();
        const screen = await render(
            <div style={{ width: 1100 }}>
                <FlexibleColumnLayout
                    defaultLayout="ThreeColumnsMidExpanded"
                    onLayoutChange={onLayoutChange}
                    startColumn="Start"
                    midColumn="Mid"
                    endColumn="End"
                />
            </div>
        );
        await stable();
        // reduced to two columns between the break points
        expect(onLayoutChange).toHaveBeenCalledWith('ThreeColumnsStartMinimized');
        const buttons = () => [...screen.container.querySelectorAll('button')];
        expect(buttons()).toHaveLength(2);
        await userEvent.click(buttons()[1]);
        await stable();
        expect(onLayoutChange).toHaveBeenLastCalledWith('TwoColumnsEndExpanded');
        expect(buttons()).toHaveLength(1);
    });

    it('passes className, native props and the ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <FlexibleColumnLayout
                ref={ref}
                id="fcl"
                data-testid="fcl"
                className="h-40"
                aria-label="Products"
                role="region"
                startColumn="Start"
            />
        );
        const root = screen.container.querySelector<HTMLElement>('#fcl')!;
        expect(ref.current).toBe(root);
        expect(root.getAttribute('data-testid')).toBe('fcl');
        expect(root.getAttribute('aria-label')).toBe('Products');
        expect(root.classList).toContain('h-40');
        expect(root.classList).toContain('flex');
    });
});
