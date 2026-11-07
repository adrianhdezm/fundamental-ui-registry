import { createRef, useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    Tree,
    TreeItem,
    TreeItemButton,
    TreeItemIcon,
    TreeItemText,
    type TreeAcceptableDataSource,
    type TreeDataSource,
    type TreeItemData,
    type TreeItemState,
    type TreeSelectionPlacement,
    type TreeSelectionType
} from './tree';

const frame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));

/** The resolved colour of a theme variable. */
const themeColor = (variable: string) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${variable})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
};

async function mount(ui: ReactNode) {
    const screen = await render(ui);
    await frame();
    const root = screen.container;
    const rows = () => [...root.querySelectorAll<HTMLElement>('[role=treeitem]')];
    /** The row of the item whose text is the given one. */
    const row = (text: string) =>
        rows().find((r) => (r.querySelector('[data-slot=tree-item-text]') ?? r).textContent!.trim() === text)!;
    const texts = () => rows().map((r) => r.textContent!.trim());
    const expander = (text: string) => row(text).querySelector<HTMLElement>('[data-slot=tree-expander]')!;
    const tree = () => root.querySelector<HTMLElement>('[role=tree]')!;
    return { screen, root, rows, row, texts, expander, tree };
}

function Nested({ onExpand, onB }: { onExpand?: (expanded: boolean) => void; onB?: () => void }) {
    return (
        <Tree aria-label="Nested">
            <TreeItem onExpandedChange={onExpand}>
                <TreeItemText>A</TreeItemText>
                <TreeItem>
                    <TreeItemText>A1</TreeItemText>
                    <TreeItem>
                        <TreeItemText>A1a</TreeItemText>
                    </TreeItem>
                </TreeItem>
                <TreeItem>
                    <TreeItemText>A2</TreeItemText>
                </TreeItem>
            </TreeItem>
            <TreeItem navigatable onTreeItemClick={onB}>
                <TreeItemText>B</TreeItemText>
            </TreeItem>
        </Tree>
    );
}

type Data = Partial<TreeItemData<{ title: string; value: number }>>;

interface DataProps {
    source?: TreeAcceptableDataSource<Data>;
    selection?: TreeSelectionType;
    placement?: TreeSelectionPlacement;
    value?: unknown;
    onValueChange?: (value: unknown) => void;
    onDataRequested?: () => void;
    onDataReceived?: () => void;
}

function DataTree({ source, selection, placement, value, onValueChange, ...props }: DataProps) {
    return (
        <Tree
            aria-label="Data"
            dataSource={source}
            selection={selection}
            selectionPlacement={placement}
            value={value}
            onValueChange={onValueChange}
            {...props}
            renderItem={(item) => (
                <TreeItem
                    id={item.id}
                    value={item.data.value}
                    childNodes={item.children}
                    defaultExpanded={!!item.expanded}
                >
                    <TreeItemText>{item.data.title}</TreeItemText>
                </TreeItem>
            )}
        />
    );
}

/** A tree whose selected value is state, as a form control would keep it. */
function ControlledData({ initial, spy, ...rest }: DataProps & { initial?: unknown; spy: (v: unknown) => void }) {
    const [value, setValue] = useState<unknown>(initial ?? null);
    return (
        <DataTree
            {...rest}
            value={value}
            onValueChange={(v) => {
                setValue(v);
                spy(v);
            }}
        />
    );
}

const DATA: Data[] = [
    {
        data: { title: 'Fruits', value: 1 },
        children: [{ data: { title: 'Apple', value: 2 } }, { data: { title: 'Pear', value: 3 } }]
    },
    { data: { title: 'Vegetables', value: 4 } }
];

interface FeaturesProps {
    dir?: 'ltr' | 'rtl';
    noBorder?: boolean;
    indicator?: boolean;
    selection?: TreeSelectionType;
    placement?: TreeSelectionPlacement;
    independent?: boolean;
    state?: TreeItemState | null;
    aExpanded?: boolean;
    a1Expanded?: boolean;
    onA?: (expanded: boolean) => void;
}

function Features({
    dir = 'ltr',
    noBorder,
    indicator,
    selection,
    placement,
    independent,
    state,
    aExpanded = false,
    a1Expanded = false,
    onA
}: FeaturesProps) {
    return (
        <>
            <div dir={dir}>
                <Tree
                    aria-label="Features"
                    noBorder={noBorder}
                    navigationIndicator={indicator}
                    selection={selection}
                    selectionPlacement={placement}
                    independentSections={independent}
                >
                    <TreeItem value="A" expanded={aExpanded} onExpandedChange={onA}>
                        <TreeItemIcon glyph="laptop" />
                        <TreeItemText>A</TreeItemText>
                        <TreeItem value="A1" expanded={a1Expanded}>
                            <TreeItemText>A1</TreeItemText>
                            <TreeItem value="A1a">
                                <TreeItemText>A1a</TreeItemText>
                            </TreeItem>
                        </TreeItem>
                    </TreeItem>
                    <TreeItem value="B" navigatable state={state}>
                        <TreeItemText>B</TreeItemText>
                        <TreeItemButton>Edit B</TreeItemButton>
                    </TreeItem>
                    <TreeItem value="C">
                        <TreeItemText>C</TreeItemText>
                    </TreeItem>
                </Tree>
            </div>
            <button type="button">After</button>
        </>
    );
}

describe('Tree', () => {
    it('is a tree of items with levels, positions and expansion states', async () => {
        const { tree, row, texts } = await mount(<Nested />);
        expect(tree().getAttribute('role')).toBe('tree');
        expect(tree().getAttribute('aria-label')).toBe('Nested');
        expect(texts()).toEqual(['A', 'B']);
        const a = row('A');
        expect(a.getAttribute('aria-level')).toBe('1');
        expect(a.getAttribute('aria-expanded')).toBe('false');
        expect(a.getAttribute('aria-setsize')).toBe('2');
        expect(a.getAttribute('aria-posinset')).toBe('1');
        // a leaf has no expansion state
        expect(row('B').hasAttribute('aria-expanded')).toBe(false);
        expect(row('B').getAttribute('aria-posinset')).toBe('2');
        // no selection: no selection state
        expect(a.hasAttribute('aria-selected')).toBe(false);
        expect(tree().hasAttribute('aria-multiselectable')).toBe(false);
    });

    it('expands and collapses with the expander and indents the children', async () => {
        const onExpand = vi.fn();
        const { row, texts, expander } = await mount(<Nested onExpand={onExpand} />);
        await userEvent.click(expander('A'));
        await frame();
        expect(texts()).toEqual(['A', 'A1', 'A2', 'B']);
        expect(onExpand).toHaveBeenLastCalledWith(true);
        expect(row('A').getAttribute('aria-expanded')).toBe('true');
        expect(row('A1').getAttribute('aria-level')).toBe('2');
        expect(row('A2').getAttribute('aria-setsize')).toBe('2');
        expect(row('A2').getAttribute('aria-posinset')).toBe('2');
        // level 2 is indented by 1.5rem while only level 1 is expanded
        expect(expander('A1').style.marginInlineStart).toBe('1.5rem');
        expect(document.activeElement).toBe(row('A'));
        // the expander does not activate the item
        expect(row('A').querySelector('[data-glyph]')!.getAttribute('aria-hidden')).toBe('true');
        await userEvent.click(expander('A'));
        await frame();
        expect(texts()).toEqual(['A', 'B']);
        expect(onExpand).toHaveBeenLastCalledWith(false);
        expect(onExpand).toHaveBeenCalledTimes(2);
    });

    it('is one tab stop moved with the arrow keys', async () => {
        const onB = vi.fn();
        const { row, texts } = await mount(<Nested onB={onB} />);
        expect(row('A').tabIndex).toBe(0);
        expect(row('B').tabIndex).toBe(-1);
        row('A').focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(row('B'));
        await frame();
        expect(row('B').tabIndex).toBe(0);
        expect(row('A').tabIndex).toBe(-1);
        await userEvent.keyboard('{ArrowUp}{ArrowRight}');
        await frame();
        expect(texts()).toEqual(['A', 'A1', 'A2', 'B']);
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(row('A1'));
        await userEvent.keyboard('{End}');
        expect(document.activeElement).toBe(row('B'));
        await userEvent.keyboard('{Home}{ArrowDown}{ArrowLeft}');
        expect(document.activeElement).toBe(row('A'));
        await userEvent.keyboard('{ArrowLeft}');
        await frame();
        expect(texts()).toEqual(['A', 'B']);
        expect(row('A').tabIndex).toBe(0);
        // Right on a leaf and Left on a top level item do nothing
        row('B').focus();
        await userEvent.keyboard('{ArrowRight}{ArrowLeft}');
        expect(document.activeElement).toBe(row('B'));
        await userEvent.keyboard('{Enter}');
        expect(onB).toHaveBeenCalledTimes(1);
        await userEvent.click(row('B'));
        expect(onB).toHaveBeenCalledTimes(2);
    });

    it('moves the tab stop to the first item when the focused item goes away', async () => {
        const { row, texts } = await mount(<Nested />);
        row('A').focus();
        await userEvent.keyboard('{ArrowRight}');
        await frame();
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(row('A1'));
        await frame();
        // collapsing A from the mouse removes the focused A1
        await userEvent.click(row('A').querySelector<HTMLElement>('[data-slot=tree-expander]')!);
        await frame();
        expect(texts()).toEqual(['A', 'B']);
        expect(row('A').tabIndex).toBe(0);
    });

    it('renders data items and loads children when they expand', async () => {
        const requested = vi.fn();
        const received = vi.fn();
        const { row, texts } = await mount(
            <DataTree source={DATA} onDataRequested={requested} onDataReceived={received} />
        );
        expect(requested).toHaveBeenCalledTimes(1);
        expect(received).toHaveBeenCalledTimes(1);
        expect(texts()).toEqual(['Fruits', 'Vegetables']);
        row('Fruits').focus();
        await userEvent.keyboard('{ArrowRight}');
        await frame();
        expect(texts()).toEqual(['Fruits', 'Apple', 'Pear', 'Vegetables']);
        expect(row('Pear').getAttribute('aria-level')).toBe('2');
        expect(row('Pear').getAttribute('aria-posinset')).toBe('2');
        expect(row('Pear').getAttribute('aria-setsize')).toBe('2');
    });

    it('shows loading rows until a promised data source and lazy children arrive', async () => {
        let resolveRoot!: (items: Data[]) => void;
        let resolveChildren!: (items: Data[]) => void;
        const lazy: TreeDataSource<Data> = {
            fetch: () => new Promise((resolve) => (resolveChildren = resolve)),
            getTotalItems: () => 1
        };
        const root = new Promise<Data[]>((resolve) => (resolveRoot = resolve));
        const { row, rows, texts } = await mount(<DataTree source={root} />);
        const busy = () => rows().filter((r) => r.getAttribute('aria-busy') === 'true');
        expect(busy()).toHaveLength(5);
        expect(busy()[0].getAttribute('aria-level')).toBe('1');
        resolveRoot([{ data: { title: 'Folder', value: 1 }, children: lazy }]);
        await frame();
        expect(texts()).toEqual(['Folder']);
        // the count says the item can expand before its children load
        expect(row('Folder').getAttribute('aria-expanded')).toBe('false');
        row('Folder').focus();
        await userEvent.keyboard('{ArrowRight}');
        await frame();
        expect(busy()).toHaveLength(5);
        expect(busy()[0].getAttribute('aria-label')).toBe('Loading');
        expect(busy()[0].getAttribute('aria-level')).toBe('2');
        resolveChildren([{ data: { title: 'File', value: 2 } }]);
        await frame();
        expect(texts()).toEqual(['Folder', 'File']);
    });

    it('shows a placeholder expander while the number of children is unknown', async () => {
        const unknown: TreeDataSource<Data> = { fetch: () => [{ data: { title: 'Inner', value: 2 } }] };
        const { row, texts } = await mount(
            <DataTree source={[{ data: { title: 'Folder', value: 1 }, children: unknown }]} />
        );
        const expander = row('Folder').querySelector<HTMLElement>('[data-slot=tree-expander]')!;
        expect(expander.getAttribute('aria-hidden')).toBe('true');
        expect(expander.querySelector('[data-glyph]')).toBeNull();
        expect(row('Folder').hasAttribute('aria-expanded')).toBe(false);
        expect(texts()).toEqual(['Folder']);
    });

    it('says when there is no data', async () => {
        const { texts, screen, rows } = await mount(<DataTree source={null} />);
        expect(texts()).toEqual(['No data']);
        expect(rows()[0].tabIndex).toBe(-1);
        // fundamental-react: a tree without items shows its empty text
        await screen.rerender(<Tree aria-label="Empty" noDataText="Nothing here" />);
        expect(texts()).toEqual(['Nothing here']);
    });

    it('selects one item as a value', async () => {
        const spy = vi.fn();
        const { row } = await mount(
            <ControlledData source={DATA} selection="single" placement="left" initial={4} spy={spy} />
        );
        expect(row('Vegetables').getAttribute('aria-selected')).toBe('true');
        expect(row('Fruits').getAttribute('aria-selected')).toBe('false');
        expect(row('Fruits').querySelector('[role=radio]')).not.toBeNull();
        await userEvent.click(row('Fruits'));
        expect(spy).toHaveBeenLastCalledWith(1);
        expect(row('Vegetables').getAttribute('aria-selected')).toBe('false');
        expect(row('Fruits').querySelector('[role=radio]')!.getAttribute('aria-checked')).toBe('true');
        // a second click deselects
        await userEvent.click(row('Fruits'));
        expect(spy).toHaveBeenLastCalledWith(null);
    });

    it('selects several items with checkboxes', async () => {
        const spy = vi.fn();
        const { tree, row } = await mount(
            <ControlledData source={DATA} selection="multiple" placement="right" spy={spy} />
        );
        expect(tree().getAttribute('aria-multiselectable')).toBe('true');
        row('Fruits').focus();
        await userEvent.keyboard(' ');
        await userEvent.click(row('Vegetables'));
        expect(spy).toHaveBeenLastCalledWith([1, 4]);
        const checkbox = row('Vegetables').querySelector<HTMLElement>('[role=checkbox]')!;
        expect(checkbox.getAttribute('aria-checked')).toBe('true');
        expect(row('Vegetables').querySelector<HTMLInputElement>('input[type=checkbox]')!.checked).toBe(true);
        expect(checkbox.tabIndex).toBe(-1);
        // fundamental-react: selected items take the selection colours (and the hover one under the pointer)
        expect(getComputedStyle(row('Vegetables')).backgroundColor).toBe(
            themeColor('--sapList_Hover_SelectionBackground')
        );
        await userEvent.unhover(row('Vegetables'));
        expect(getComputedStyle(row('Vegetables')).backgroundColor).toBe(
            themeColor('--sapList_SelectionBackgroundColor')
        );
        await userEvent.click(row('Fruits'));
        expect(spy).toHaveBeenLastCalledWith([4]);
    });

    it('keeps an uncontrolled selection from defaultValue, by item id when no value is given', async () => {
        const onValueChange = vi.fn();
        const { row } = await mount(
            <Tree aria-label="Ids" selection="multiple" defaultValue={['one']} onValueChange={onValueChange}>
                <TreeItem id="one">
                    <TreeItemText>One</TreeItemText>
                </TreeItem>
                <TreeItem id="two">
                    <TreeItemText>Two</TreeItemText>
                </TreeItem>
            </Tree>
        );
        expect(row('One').getAttribute('aria-selected')).toBe('true');
        await userEvent.click(row('Two'));
        expect(onValueChange).toHaveBeenLastCalledWith(['one', 'two']);
        expect(row('Two').getAttribute('aria-selected')).toBe('true');
    });

    describe('options', () => {
        it('removes the borders of the top level items with noBorder', async () => {
            const { row, screen } = await mount(<Features />);
            expect(getComputedStyle(row('A')).borderBottomColor).toBe(themeColor('--sapList_BorderColor'));
            await screen.rerender(<Features noBorder />);
            expect(getComputedStyle(row('A')).borderBottomColor).toBe('rgba(0, 0, 0, 0)');
        });

        it('renders the icon before the text', async () => {
            const { row } = await mount(<Features />);
            const icon = row('A').querySelector<HTMLElement>('[data-slot=tree-item-content] > [data-glyph]')!;
            expect(icon.getAttribute('aria-hidden')).toBe('true');
            expect(icon.nextElementSibling!.getAttribute('data-slot')).toBe('tree-item-text');
            expect(icon.getBoundingClientRect().width).toBeGreaterThan(0);
        });

        it('indents by the deepest expanded level and shrinks back when it collapses', async () => {
            const { row, expander, screen } = await mount(<Features />);
            await screen.rerender(<Features aExpanded />);
            await frame();
            expect(expander('A1').style.marginInlineStart).toBe('1.5rem');
            await screen.rerender(<Features aExpanded a1Expanded />);
            await frame();
            // two expanded levels: level 2 by 1rem, level 3 by 2.5rem (plus the expander width for a leaf)
            expect(expander('A1').style.marginInlineStart).toBe('1rem');
            const leafContent = row('A1a').querySelector<HTMLElement>('[data-slot=tree-item-content]')!;
            expect(leafContent.style.marginInlineStart).toBe('calc(2.5rem + var(--tree-exp))');
            await screen.rerender(<Features aExpanded />);
            await frame();
            expect(expander('A1').style.marginInlineStart).toBe('1.5rem');
        });

        it('shows the highlight indicator of the state', async () => {
            const { row, screen } = await mount(<Features />);
            expect(getComputedStyle(row('B')).boxShadow).toBe('none');
            const states: [TreeItemState, string][] = [
                ['error', '--sapErrorBorderColor'],
                ['warning', '--sapWarningBorderColor'],
                ['success', '--sapSuccessBorderColor'],
                ['default', '--sapInformationBorderColor']
            ];
            for (const [state, variable] of states) {
                await screen.rerender(<Features state={state} />);
                expect(getComputedStyle(row('B')).boxShadow).toBe(`${themeColor(variable)} 6px 0px 0px 0px inset`);
            }
            await screen.rerender(<Features state="error" dir="rtl" />);
            expect(getComputedStyle(row('B')).boxShadow).toBe(
                `${themeColor('--sapErrorBorderColor')} -6px 0px 0px 0px inset`
            );
        });

        it('marks the navigated item at the end of the row, with or without a highlight', async () => {
            const selected = themeColor('--sapSelectedColor');
            const { row, screen } = await mount(
                <Tree aria-label="Navigated">
                    <TreeItem navigatable navigated>
                        <TreeItemText>One</TreeItemText>
                    </TreeItem>
                </Tree>
            );
            expect(getComputedStyle(row('One')).boxShadow).toBe(`${selected} -3px 0px 0px 0px inset`);
            await screen.rerender(
                <Tree aria-label="Navigated">
                    <TreeItem navigatable navigated state="success">
                        <TreeItemText>One</TreeItemText>
                    </TreeItem>
                </Tree>
            );
            expect(getComputedStyle(row('One')).boxShadow).toBe(
                `${selected} -3px 0px 0px 0px inset, ${themeColor('--sapSuccessBorderColor')} 6px 0px 0px 0px inset`
            );
        });

        it('shows the navigation arrow on navigatable items with navigationIndicator', async () => {
            const { row, screen } = await mount(<Features />);
            const arrow = (text: string) => row(text).querySelector('[data-slot=tree-navigation-indicator]');
            expect(arrow('B')).toBeNull();
            await screen.rerender(<Features indicator />);
            expect(arrow('B')).not.toBeNull();
            expect(arrow('B')!.getAttribute('aria-hidden')).toBe('true');
            expect(arrow('A')).toBeNull();
            expect(arrow('C')).toBeNull();
        });

        it('places the selection control after the expander or at the end', async () => {
            const { row, screen } = await mount(<Features selection="multiple" placement="afterExpand" />);
            const control = (text: string) =>
                row(text).querySelector('[role=checkbox]')?.closest('[aria-hidden=true]') ?? null;
            // after the expander, on items that have one
            expect(control('A')!.previousElementSibling!.getAttribute('data-slot')).toBe('tree-expander');
            expect(control('C')).toBeNull();
            await screen.rerender(<Features selection="multiple" placement="right" />);
            for (const text of ['A', 'B', 'C']) expect(row(text).lastElementChild).toBe(control(text));
            // after the action buttons
            expect(control('B')!.previousElementSibling!.textContent).toBe('Edit B');
            // left: before the expander
            await screen.rerender(<Features selection="multiple" placement="left" />);
            expect(row('A').firstElementChild).toBe(control('A'));
        });

        it('puts left selection controls in one column with independentSections', async () => {
            const { row, screen } = await mount(<Features selection="single" placement="left" />);
            const control = (text: string) =>
                row(text).querySelector('[role=radio]')!.closest<HTMLElement>('[aria-hidden=true]')!;
            const content = () => row('C').querySelector<HTMLElement>('[data-slot=tree-item-content]')!;
            // the leaf's control takes the indentation of the expander it lacks
            expect(control('C').style.marginInlineStart).toBe('calc(0rem + var(--tree-exp))');
            expect(content().style.marginInlineStart).toBe('');
            await screen.rerender(<Features selection="single" placement="left" independent />);
            expect(control('C').style.marginInlineStart).toBe('');
            expect(content().style.marginInlineStart).toBe('calc(0rem + var(--tree-exp))');
            const left = (text: string) => row(text).querySelector('[role=radio]')!.getBoundingClientRect().left;
            expect(left('C')).toBe(left('A'));
        });

        it('keeps the selection controls out of the tab order and the accessibility tree', async () => {
            const { row, screen } = await mount(<Features selection="single" placement="left" />);
            const radio = row('A').querySelector<HTMLElement>('[role=radio]')!;
            expect(radio.tabIndex).toBe(-1);
            expect(radio.closest('[aria-hidden=true]')).not.toBeNull();
            await screen.rerender(<Features selection="multiple" placement="left" />);
            expect(row('A').querySelector<HTMLElement>('[role=checkbox]')!.tabIndex).toBe(-1);
        });

        it('mirrors Right and Left in RTL', async () => {
            function Rtl() {
                const [expanded, setExpanded] = useState(false);
                return (
                    <>
                        <Features dir="rtl" aExpanded={expanded} onA={setExpanded} />
                        <output>{String(expanded)}</output>
                    </>
                );
            }
            const { row, root } = await mount(<Rtl />);
            const expanded = () => root.querySelector('output')!.textContent;
            row('A').focus();
            await userEvent.keyboard('{ArrowLeft}');
            await frame();
            expect(expanded()).toBe('true');
            await userEvent.keyboard('{ArrowLeft}');
            expect(document.activeElement).toBe(row('A1'));
            await userEvent.keyboard('{ArrowRight}');
            expect(document.activeElement).toBe(row('A'));
            await userEvent.keyboard('{ArrowRight}');
            await frame();
            expect(expanded()).toBe('false');
        });

        it('reaches the action buttons with Tab from their item, keeping one item in the tab order', async () => {
            const { row } = await mount(<Features />);
            const b = row('B');
            b.focus();
            await frame();
            expect(b.tabIndex).toBe(0);
            expect(row('A').tabIndex).toBe(-1);
            await userEvent.tab();
            expect(document.activeElement!.textContent).toBe('Edit B');
            // keys on the button are the button's
            await userEvent.keyboard('{ArrowUp}');
            expect(document.activeElement!.textContent).toBe('Edit B');
            await userEvent.tab();
            expect(document.activeElement!.textContent).toBe('After');
            await userEvent.tab({ shift: true });
            await userEvent.tab({ shift: true });
            expect(document.activeElement).toBe(b);
        });
    });

    describe('props', () => {
        it('spreads native props on the tree and the item rows, and merges className', async () => {
            const { tree, row } = await mount(
                <Tree aria-label="Props" data-sample="free-samples" id="crazyTree" className="crazy-styles">
                    <TreeItem id="item" data-sample="item" className="item-class" aria-label="Custom name">
                        <TreeItemText className="text-class">One</TreeItemText>
                    </TreeItem>
                </Tree>
            );
            expect(tree().id).toBe('crazyTree');
            expect(tree().getAttribute('data-sample')).toBe('free-samples');
            expect(tree().classList).toContain('crazy-styles');
            expect(tree().classList).toContain('block');
            const one = row('One');
            expect(one.id).toBe('item');
            expect(one.getAttribute('data-sample')).toBe('item');
            expect(one.getAttribute('aria-label')).toBe('Custom name');
            expect(one.classList).toContain('item-class');
            expect(one.classList).toContain('flex');
            expect(one.querySelector('[data-slot=tree-item-text]')!.classList).toContain('text-class');
        });

        it('forwards the refs of the tree and the item rows', async () => {
            const treeRef = createRef<HTMLDivElement>();
            const itemRef = createRef<HTMLDivElement>();
            await mount(
                <Tree aria-label="Refs" ref={treeRef}>
                    <TreeItem ref={itemRef}>
                        <TreeItemText>One</TreeItemText>
                    </TreeItem>
                </Tree>
            );
            expect(treeRef.current!.getAttribute('role')).toBe('tree');
            expect(itemRef.current!.getAttribute('role')).toBe('treeitem');
        });

        it('takes items in fragments and conditional children, and the text as another element', async () => {
            const show = false as boolean;
            const { texts, row } = await mount(
                <Tree aria-label="Fragments">
                    <>
                        <TreeItem defaultExpanded>
                            <TreeItemText render={<div />}>One</TreeItemText>
                            <>
                                <TreeItem>
                                    <TreeItemText>One A</TreeItemText>
                                </TreeItem>
                            </>
                            {show && (
                                <TreeItem>
                                    <TreeItemText>Hidden</TreeItemText>
                                </TreeItem>
                            )}
                        </TreeItem>
                    </>
                    <TreeItem>
                        <TreeItemText>Two</TreeItemText>
                    </TreeItem>
                </Tree>
            );
            expect(texts()).toEqual(['One', 'One A', 'Two']);
            expect(row('One').querySelector('[data-slot=tree-item-text]')!.tagName).toBe('DIV');
            expect(row('Two').getAttribute('aria-posinset')).toBe('2');
            expect(row('One A').getAttribute('aria-setsize')).toBe('1');
        });

        it('uses the compact sizes in the compact density', async () => {
            const { row, screen } = await mount(<Nested />);
            // the 2.75rem line plus the 1px bottom border, as fundamental-styles
            expect(row('A').getBoundingClientRect().height).toBe(45);
            await screen.rerender(
                <div data-density="compact">
                    <Nested />
                </div>
            );
            expect(row('A').getBoundingClientRect().height).toBe(33);
        });
    });
});
