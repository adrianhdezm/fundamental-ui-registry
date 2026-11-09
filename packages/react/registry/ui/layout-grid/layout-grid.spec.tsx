import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { LayoutGrid, LayoutGridCol, LayoutGridRow, type LayoutGridColProps, type LayoutGridProps } from './layout-grid';

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/** Helpers to measure the columns of a rendered grid. */
function measure(root: HTMLElement) {
    const el = (id: string) => root.querySelector<HTMLElement>(`#${id}`)!;
    /** Share of the row (in twelfths) a column spans. */
    const span = (id: string) => {
        const col = el(id);
        return Math.round((col.getBoundingClientRect().width / col.parentElement!.clientWidth) * 12 * 100) / 100;
    };
    const margin = (id: string, side: 'Start' | 'End') => {
        const col = el(id);
        const value = getComputedStyle(col)[`marginInline${side}`];
        return Math.round((parseFloat(value) / col.parentElement!.clientWidth) * 12);
    };
    const offset = (id: string) => margin(id, 'Start');
    const offsetAfter = (id: string) => margin(id, 'End');
    const resize = async (width: number) => {
        await page.viewport(width, 800);
        await frame();
    };
    return { el, span, offset, offsetAfter, resize };
}

function Main({ noGap = false }: { noGap?: boolean }) {
    return (
        <>
            <LayoutGrid noGap={noGap} id="main">
                <LayoutGridCol id="a" span={12} colMd={6}>
                    <div className="h-8">A</div>
                </LayoutGridCol>
                <LayoutGridCol id="b" span={12} colMd={6} colLg={4} colXl={3}>
                    <div className="h-8">B</div>
                </LayoutGridCol>
                <LayoutGridCol id="c" span={6} colOffset={6}>
                    <div className="h-8">C</div>
                </LayoutGridCol>
                <LayoutGridCol id="d" span={6} colOffset={0} colOffsetMd={3} colOffsetLg={6}>
                    <div className="h-8">D</div>
                </LayoutGridCol>
                <LayoutGridCol id="outer" span={12} colMd={6}>
                    <LayoutGrid>
                        <LayoutGridCol id="nested">
                            <div className="h-8">Nested</div>
                        </LayoutGridCol>
                    </LayoutGrid>
                </LayoutGridCol>
            </LayoutGrid>
            <LayoutGrid>
                <LayoutGridCol id="e" span={3}>
                    <div className="h-8">E</div>
                </LayoutGridCol>
                <LayoutGridCol id="f" colGrow>
                    <div className="h-8">F</div>
                </LayoutGridCol>
            </LayoutGrid>
        </>
    );
}

interface DynamicState extends Pick<LayoutGridProps, 'noGap' | 'noHorizontalGap' | 'noVerticalGap'> {
    span?: number;
    offset?: number;
    grow?: boolean;
    offsetPosition?: LayoutGridColProps['offsetPosition'];
}

function Dynamic({ span, offset, grow = false, offsetPosition, ...grid }: DynamicState) {
    return (
        <LayoutGrid className="custom-grid" id="grid" {...grid}>
            <LayoutGridCol
                id="dyn"
                className="custom-col"
                span={span}
                colOffset={offset}
                colGrow={grow}
                offsetPosition={offsetPosition}
            >
                <div className="h-8">Dynamic</div>
            </LayoutGridCol>
            <LayoutGridCol id="rest" span={3}>
                <div className="h-8">Rest</div>
            </LayoutGridCol>
            <LayoutGridCol id="invalid" span={13} colMd={0} colOffset={13} colOffsetMd={-1}>
                <div className="h-8">X</div>
            </LayoutGridCol>
            <LayoutGridCol id="xl" span={6} colOffsetMd={1} colOffsetLg={2} colOffsetXl={4}>
                <div className="h-8">XL</div>
            </LayoutGridCol>
        </LayoutGrid>
    );
}

/** The dynamic column spans 6 unless a state says otherwise; every update replaces the whole state. */
async function setupDynamic(state: DynamicState = {}) {
    const screen = await render(<Dynamic span={6} {...state} />);
    return {
        ...measure(screen.container),
        root: screen.container,
        update: (next: DynamicState) => screen.rerender(<Dynamic span={6} {...next} />)
    };
}

describe('LayoutGrid', () => {
    afterEach(async () => {
        await page.viewport(1280, 800);
    });

    it('columns span from the S/M/L/XL props and inherit upwards (600/1024/1440px breakpoints)', async () => {
        const screen = await render(<Main />);
        const { span, resize } = measure(screen.container);
        await resize(500);
        expect([span('a'), span('b'), span('c'), span('e')]).toEqual([12, 12, 6, 3]);
        await resize(800);
        expect([span('a'), span('b'), span('c')]).toEqual([6, 6, 6]);
        await resize(1100);
        expect([span('a'), span('b'), span('c')]).toEqual([6, 4, 6]);
        await resize(1500);
        expect([span('a'), span('b'), span('c')]).toEqual([6, 3, 6]);
    });

    it('columns of a row wrap and a growing column takes the remaining space', async () => {
        const screen = await render(<Main />);
        const { el, span, resize } = measure(screen.container);
        await resize(800);
        // A and B share a line, C wraps to the next one
        expect(el('a').getBoundingClientRect().top).toBe(el('b').getBoundingClientRect().top);
        expect(el('c').getBoundingClientRect().top).toBeGreaterThan(el('a').getBoundingClientRect().top);
        expect(el('f').getBoundingClientRect().top).toBe(el('e').getBoundingClientRect().top);
        expect(span('e') + span('f')).toBeCloseTo(12, 1);
        expect(el('f').getBoundingClientRect().right).toBeCloseTo(
            el('f').parentElement!.getBoundingClientRect().right,
            0
        );
    });

    it('growing columns share the cells a spanned column leaves, per breakpoint', async () => {
        const screen = await render(
            <LayoutGrid>
                <LayoutGridCol id="first" span={12} colMd={8} colLg={7} colXl={6}>
                    Spanned
                </LayoutGridCol>
                <LayoutGridCol id="second" colGrow>
                    Shares
                </LayoutGridCol>
                <LayoutGridCol id="third" colGrow>
                    Shares
                </LayoutGridCol>
            </LayoutGrid>
        );
        const { el, span, resize } = measure(screen.container);
        await resize(800);
        expect([span('first'), span('second'), span('third')]).toEqual([8, 2, 2]);
        await resize(1100);
        expect([span('first'), span('second'), span('third')]).toEqual([7, 2.5, 2.5]);
        await resize(1500);
        expect([span('first'), span('second'), span('third')]).toEqual([6, 3, 3]);
        // below 600px the spanned column fills its line and the growing ones share the next
        await resize(500);
        expect([span('first'), span('second'), span('third')]).toEqual([12, 6, 6]);
        expect(el('second').getBoundingClientRect().top).toBeGreaterThan(el('first').getBoundingClientRect().top);
    });

    it('offsets per breakpoint', async () => {
        const screen = await render(<Main />);
        const { offset, el, resize } = measure(screen.container);
        await resize(500);
        expect([offset('c'), offset('d')]).toEqual([6, 0]);
        await resize(800);
        expect([offset('c'), offset('d')]).toEqual([6, 3]);
        await resize(1100);
        expect([offset('c'), offset('d')]).toEqual([6, 6]);
        await resize(1500);
        expect([offset('c'), offset('d')]).toEqual([6, 6]);
        // the offset column ends at the end of the row
        const row = el('c').parentElement!.getBoundingClientRect();
        expect(el('c').getBoundingClientRect().right).toBeCloseTo(row.right, 0);
    });

    it('offsetPosition "after" leaves the offset after the column', async () => {
        const { el, offset, offsetAfter, update, resize } = await setupDynamic({ offset: 2, offsetPosition: 'after' });
        await resize(800);
        expect([offset('dyn'), offsetAfter('dyn')]).toEqual([0, 2]);
        // the next column starts after the offset (6 + 2 columns from the start of the row)
        const row = el('dyn').parentElement!;
        const start = row.getBoundingClientRect().left;
        expect(((el('rest').getBoundingClientRect().left - start) / row.clientWidth) * 12).toBeCloseTo(8, 1);

        await update({ offset: 2 });
        expect([offset('dyn'), offsetAfter('dyn')]).toEqual([2, 0]);
    });

    it('offsets follow the reading direction', async () => {
        const screen = await render(
            <div dir="rtl">
                <LayoutGrid>
                    <LayoutGridCol id="rtl" span={6} colOffset={6}>
                        RTL
                    </LayoutGridCol>
                </LayoutGrid>
            </div>
        );
        const { el } = measure(screen.container);
        const col = el('rtl');
        const row = col.parentElement!.getBoundingClientRect();
        expect(col.getBoundingClientRect().left).toBeCloseTo(row.left, 0);
    });

    it('nested grids do not inherit the parent spans', async () => {
        const screen = await render(<Main />);
        const { span, resize } = measure(screen.container);
        for (const width of [500, 800, 1100, 1500]) {
            await resize(width);
            expect(span('nested')).toBe(12);
        }
        expect(span('outer')).toBe(6);
    });

    it('a row inside a column nests 12 columns in its width', async () => {
        const screen = await render(
            <LayoutGrid>
                <LayoutGridCol id="parent" span={6}>
                    <LayoutGridRow id="inner-row">
                        <LayoutGridCol id="inner" span={6}>
                            Inner
                        </LayoutGridCol>
                    </LayoutGridRow>
                </LayoutGridCol>
            </LayoutGrid>
        );
        const { el, resize } = measure(screen.container);
        await resize(800);
        const parent = el('parent').getBoundingClientRect();
        // the inner row spans the parent column with its gutters, as the outer row does
        expect(el('inner-row').getBoundingClientRect().width).toBeCloseTo(parent.width, 0);
        expect(getComputedStyle(el('inner-row')).marginInlineStart).toBe('-8px');
        expect(el('inner').getBoundingClientRect().width).toBeCloseTo(parent.width / 2, 0);
        // only the columns of the grid's own rows get vertical gutters
        expect(getComputedStyle(el('parent')).paddingTop).toBe('8px');
        expect(getComputedStyle(el('inner')).paddingTop).toBe('0px');
    });

    it('noGap removes the gutters', async () => {
        const screen = await render(<Main />);
        const { el, resize } = measure(screen.container);
        await resize(800);
        const style = () => getComputedStyle(el('a'));
        expect(style().paddingInlineStart).toBe('8px');
        expect(style().paddingTop).toBe('8px');
        expect(getComputedStyle(el('a').parentElement!).marginInlineStart).toBe('-8px');
        expect(getComputedStyle(el('main')).paddingInlineStart).toBe('8px');
        await resize(500);
        expect(style().paddingInlineStart).toBe('4px');
        expect(style().paddingTop).toBe('4px');
        expect(getComputedStyle(el('main')).paddingInlineStart).toBe('4px');

        await screen.rerender(<Main noGap />);
        expect(style().paddingInlineStart).toBe('0px');
        expect(style().paddingTop).toBe('0px');
        expect(getComputedStyle(el('a').parentElement!).marginInlineStart).toBe('0px');
    });

    it('adds a row only when the grid has no explicit rows', async () => {
        const screen = await render(<Main />);
        const grid = screen.container.querySelector('#main')!;
        expect([...grid.children].map((c) => c.hasAttribute('data-fd-row'))).toEqual([true]);
        expect(grid.firstElementChild!.querySelector('#a')).not.toBeNull();

        const rows = await render(
            <LayoutGrid id="rows">
                <LayoutGridRow id="row1">
                    <LayoutGridCol span={6}>1</LayoutGridCol>
                </LayoutGridRow>
                {[2, 3].map((n) => (
                    <LayoutGridRow key={n} id={`row${n}`}>
                        <LayoutGridCol span={6}>{n}</LayoutGridCol>
                    </LayoutGridRow>
                ))}
            </LayoutGrid>
        );
        const rowsGrid = rows.container.querySelector('#rows')!;
        expect([...rowsGrid.children].map((c) => c.id)).toEqual(['row1', 'row2', 'row3']);
    });

    it('ignores spans and offsets outside 1-12', async () => {
        const { span, offset, resize } = await setupDynamic();
        await resize(500);
        expect([span('invalid'), offset('invalid')]).toEqual([12, 0]);
        // invalid md values fall back to the (default) smaller breakpoint values
        await resize(800);
        expect([span('invalid'), offset('invalid')]).toEqual([12, 0]);
    });

    it('colOffsetXl applies from 1440px', async () => {
        const { offset, resize } = await setupDynamic();
        await resize(500);
        expect(offset('xl')).toBe(0);
        await resize(800);
        expect(offset('xl')).toBe(1);
        await resize(1100);
        expect(offset('xl')).toBe(2);
        await resize(1439);
        expect(offset('xl')).toBe(2);
        await resize(1500);
        expect(offset('xl')).toBe(4);
    });

    it('updates span, offset and grow when props change', async () => {
        const { span, offset, update, resize } = await setupDynamic();
        await resize(800);
        expect([span('dyn'), offset('dyn')]).toEqual([6, 0]);

        await update({ span: 4, offset: 2 });
        expect([span('dyn'), offset('dyn')]).toEqual([4, 2]);

        await update({ grow: true });
        // a growing column takes what the 3-column sibling leaves
        expect(span('dyn')).toBeCloseTo(9, 1);

        await update({ span: undefined });
        expect(span('dyn')).toBe(12);
    });

    it('noHorizontalGap removes only the inline gutters and noVerticalGap only the block gutters', async () => {
        const { el, update, resize } = await setupDynamic();
        await resize(800);
        const style = () => getComputedStyle(el('dyn'));
        const rowMargin = () => getComputedStyle(el('dyn').parentElement!).marginInlineStart;

        await update({ noHorizontalGap: true });
        expect(style().paddingInlineStart).toBe('0px');
        expect(rowMargin()).toBe('0px');
        expect(style().paddingTop).toBe('8px');

        await update({ noVerticalGap: true });
        expect(style().paddingInlineStart).toBe('8px');
        expect(rowMargin()).toBe('-8px');
        expect(style().paddingTop).toBe('0px');
    });

    it('uses the SAP font and text colour', async () => {
        const { el } = await setupDynamic();
        const probe = document.createElement('div');
        probe.style.fontFamily = 'var(--sapFontFamily)';
        probe.style.fontSize = 'var(--sapFontSize)';
        probe.style.color = 'var(--sapTextColor)';
        document.body.appendChild(probe);
        const expected = getComputedStyle(probe);
        const style = getComputedStyle(el('dyn'));
        expect([style.fontFamily, style.fontSize, style.color, style.lineHeight]).toEqual([
            expected.fontFamily,
            expected.fontSize,
            expected.color,
            'normal'
        ]);
        probe.remove();
    });

    it('merges a user class onto the column and grid', async () => {
        const { el } = await setupDynamic();
        const grid = el('grid');
        expect(grid.classList).toContain('custom-grid');
        expect(grid.classList).toContain('flex');
        expect(el('dyn').classList).toContain('custom-col');
        expect(el('dyn').classList).toContain('box-border');
    });

    it('passes native props, style, render and the refs to grid, row and column', async () => {
        const gridRef = createRef<HTMLDivElement>();
        const rowRef = createRef<HTMLDivElement>();
        const colRef = createRef<HTMLDivElement>();
        const screen = await render(
            <LayoutGrid ref={gridRef} data-testid="grid" aria-label="Grid" role="group">
                <LayoutGridRow ref={rowRef} data-testid="row" render={<section />}>
                    <LayoutGridCol ref={colRef} data-testid="col" title="Hint" style={{ color: 'red' }} span={6}>
                        Content
                    </LayoutGridCol>
                </LayoutGridRow>
            </LayoutGrid>
        );
        const get = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
        expect(gridRef.current).toBe(get('grid'));
        expect(gridRef.current!.tagName).toBe('DIV');
        expect(get('grid').getAttribute('aria-label')).toBe('Grid');
        expect(rowRef.current).toBe(get('row'));
        expect(rowRef.current!.tagName).toBe('SECTION');
        expect(rowRef.current!.hasAttribute('data-fd-row')).toBe(true);
        expect(colRef.current).toBe(get('col'));
        expect(colRef.current!.title).toBe('Hint');
        // the user style merges with the span variables
        expect(colRef.current!.style.color).toBe('red');
        expect(colRef.current!.style.getPropertyValue('--fd-col')).toBe('6');
        expect(rowRef.current!.contains(colRef.current)).toBe(true);
    });
});
