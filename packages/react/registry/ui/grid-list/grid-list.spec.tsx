import { createRef, useState, type Ref } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    GridList,
    GridListFilterBar,
    GridListFooter,
    GridListGroupHeader,
    GridListItem,
    GridListItemBody,
    GridListItemFooterBar,
    GridListItemImage,
    GridListItemToolbar,
    GridListMoreButton,
    GridListTitleBar,
    parseGridListLayout,
    type GridListActions,
    type GridListSelectionDetails,
    type GridListSelectionMode
} from './grid-list';

type Change = GridListSelectionDetails<number> & { selection: number[] };

const IDS = [1, 2, 3, 4, 5, 6];

interface HostProps {
    mode: GridListSelectionMode;
    onChange: (change: Change) => void;
    onPress: (id: number) => void;
    onDelete: (id: number) => void;
    actionsRef?: Ref<GridListActions>;
}

function Host({ mode, onChange, onPress, onDelete, actionsRef }: HostProps) {
    return (
        <div style={{ width: 1100 }}>
            <GridList<number>
                aria-label="Products"
                layoutPattern="XL3-L3-M3-S3"
                selectionMode={mode}
                actionsRef={actionsRef}
                onValueChange={(selection, details) => onChange({ selection, ...details })}
            >
                {IDS.map((id) => (
                    <GridListItem<number>
                        key={id}
                        value={id}
                        title={`Item ${id}`}
                        type="detail"
                        onPress={() => onPress(id)}
                        onDelete={() => onDelete(id)}
                    >
                        <GridListItemBody>Body {id}</GridListItemBody>
                    </GridListItem>
                ))}
            </GridList>
        </div>
    );
}

async function setup(mode: GridListSelectionMode = 'multiSelect') {
    let last: Change | null = null;
    let pressed: number | null = null;
    let deleted: number | null = null;
    const actionsRef = createRef<GridListActions>();
    const handlers = {
        onChange: (change: Change) => (last = change),
        onPress: (id: number) => (pressed = id),
        onDelete: (id: number) => (deleted = id)
    };
    const screen = await render(<Host mode={mode} actionsRef={actionsRef} {...handlers} />);
    const el = screen.container;
    const items = () => [...el.querySelectorAll<HTMLElement>('[data-grid-list-item]')];
    return {
        el,
        items,
        actionsRef,
        list: () => el.querySelector<HTMLElement>('[data-slot="grid-list"]')!,
        last: () => last,
        pressed: () => pressed,
        deleted: () => deleted,
        setMode: (next: GridListSelectionMode) =>
            screen.rerender(<Host mode={next} actionsRef={actionsRef} {...handlers} />),
        unmount: () => screen.unmount()
    };
}

const active = () => document.activeElement as HTMLElement;

describe('GridList', () => {
    it('uses grid semantics when selectable and list semantics otherwise', async () => {
        const { list, items, setMode } = await setup('multiSelect');
        expect(list().getAttribute('role')).toBe('grid');
        expect(list().getAttribute('aria-multiselectable')).toBe('true');
        expect(list().getAttribute('aria-label')).toBe('Products');
        expect(items()[0].getAttribute('role')).toBe('gridcell');
        expect(items()[0].parentElement!.getAttribute('role')).toBe('row');
        expect(items()[0].getAttribute('aria-selected')).toBe('false');

        await setMode('singleSelect');
        expect(list().getAttribute('role')).toBe('grid');
        expect(list().hasAttribute('aria-multiselectable')).toBe(false);

        await setMode('none');
        expect(list().getAttribute('role')).toBe('list');
        expect(items()[0].getAttribute('role')).toBe('listitem');
        expect(items()[0].parentElement!.getAttribute('role')).toBe('none');
        expect(items()[0].hasAttribute('aria-selected')).toBe(false);
    });

    it('keeps a single tab stop and moves focus with the arrow keys by row', async () => {
        const { items } = await setup();
        expect(items().map((i) => i.tabIndex)).toEqual([0, -1, -1, -1, -1, -1]);
        items()[0].focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(active()).toBe(items()[1]);
        expect(items().map((i) => i.tabIndex)).toEqual([-1, 0, -1, -1, -1, -1]);
        await userEvent.keyboard('{ArrowDown}');
        expect(active()).toBe(items()[4]);
        await userEvent.keyboard('{ArrowUp}');
        expect(active()).toBe(items()[1]);
        await userEvent.keyboard('{ArrowLeft}');
        expect(active()).toBe(items()[0]);
        // no item before the first
        await userEvent.keyboard('{ArrowLeft}');
        expect(active()).toBe(items()[0]);
        await userEvent.keyboard('{End}');
        expect(active()).toBe(items()[5]);
        await userEvent.keyboard('{Home}');
        expect(active()).toBe(items()[0]);
    });

    it('swaps ArrowLeft and ArrowRight in RTL', async () => {
        const { items, list } = await setup();
        list().setAttribute('dir', 'rtl');
        items()[1].focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(active()).toBe(items()[2]);
        await userEvent.keyboard('{ArrowRight}');
        expect(active()).toBe(items()[1]);
    });

    it('selects with Space and ranges with Shift+click in multi selection', async () => {
        const { items, last } = await setup();
        items()[1].focus();
        await userEvent.keyboard(' ');
        expect(last()!.selection).toEqual([2]);
        expect(items()[1].getAttribute('aria-selected')).toBe('true');
        expect(items()[1].querySelector<HTMLElement>('[role="checkbox"]')!.getAttribute('aria-checked')).toBe('true');

        // deselect item 2 (the range anchor), then Shift+click item 4: the range 2..4 takes the new state
        await userEvent.click(items()[1].querySelector<HTMLElement>('[data-gl-select]')!);
        expect(last()!.selection).toEqual([]);
        await userEvent.click(items()[3].querySelector<HTMLElement>('[data-gl-select]')!, { modifiers: ['Shift'] });
        expect(last()!.selection).toEqual([2, 3, 4]);
        expect(items()[2].getAttribute('aria-selected')).toBe('true');
        // the click focuses the item
        expect(active()).toBe(items()[3]);
    });

    it('moves into an item with Enter and back with Escape; F2 toggles', async () => {
        const { items } = await setup();
        const button = items()[0].querySelector('button')!;
        expect(button.tabIndex).toBe(-1);
        items()[0].focus();
        await userEvent.keyboard('{Enter}');
        expect(active()).toBe(button);
        expect(button.tabIndex).toBe(0);
        await userEvent.keyboard('{Escape}');
        expect(active()).toBe(items()[0]);
        expect(button.tabIndex).toBe(-1);
        await userEvent.keyboard('{F2}');
        expect(active()).toBe(button);
        await userEvent.keyboard('{F2}');
        expect(active()).toBe(items()[0]);
    });

    it('keeps at most one selected item when switching to single selection, none without selection', async () => {
        const { items, last, setMode } = await setup();
        items()[0].focus();
        await userEvent.keyboard(' ');
        await userEvent.keyboard('{ArrowRight} ');
        expect(last()!.selection).toEqual([1, 2]);
        await setMode('singleSelect');
        expect(last()).toEqual({ selection: [1], added: [], removed: [2], index: [] });
        await setMode('delete');
        expect(last()).toEqual({ selection: [], added: [], removed: [1], index: [] });
    });

    it('emits press on Space without selection mode', async () => {
        const { items, pressed } = await setup('none');
        items()[2].focus();
        await userEvent.keyboard(' ');
        expect(pressed()).toBe(3);
    });

    it('extends the selection with Shift+Arrow and Shift+End in multi selection', async () => {
        const { items, last } = await setup();
        await userEvent.click(items()[0].querySelector<HTMLElement>('[data-gl-select]')!);
        expect(last()!.selection).toEqual([1]);

        await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
        expect(last()).toEqual({ selection: [1, 2], added: [2], removed: [], index: [1] });
        expect(active()).toBe(items()[1]);

        await userEvent.keyboard('{Shift>}{End}{/Shift}');
        expect(last()!.selection).toEqual([1, 2, 3, 4, 5, 6]);
        expect(items().map((i) => i.getAttribute('aria-selected'))).toEqual(Array(6).fill('true'));
        expect(active()).toBe(items()[5]);
    });

    it('shows a delete button per item in delete mode that emits delete', async () => {
        const { items, deleted, pressed } = await setup('delete');
        const buttons = items().map((i) => i.querySelector<HTMLElement>('button[aria-label="Delete"]'));
        expect(buttons.every(Boolean)).toBe(true);
        await userEvent.click(buttons[3]!);
        expect(deleted()).toBe(4);
        // deleting is not an activation
        expect(pressed()).toBeNull();
    });

    it('shows a radio per item in single selection with a radio and selects on click', async () => {
        for (const mode of ['singleSelectLeft', 'singleSelectRight'] as const) {
            const { items, last, unmount } = await setup(mode);
            const radios = items().map((i) => i.querySelector<HTMLElement>('[role="radio"]'));
            expect(radios.every(Boolean)).toBe(true);
            expect(items()[0].querySelector('[role="checkbox"]')).toBeNull();
            // the radio comes first (left) or last (right) in the toolbar row
            const toolbar = items()[0].firstElementChild!;
            const select = items()[0].querySelector('[data-gl-select]')!;
            expect(mode === 'singleSelectLeft' ? toolbar.firstElementChild : toolbar.lastElementChild).toBe(select);

            await userEvent.click(items()[2].querySelector<HTMLElement>('[data-gl-select]')!);
            expect(last()!.selection).toEqual([3]);
            expect(radios[2]!.getAttribute('aria-checked')).toBe('true');
            await userEvent.click(items()[4].querySelector<HTMLElement>('[data-gl-select]')!);
            expect(last()).toEqual({ selection: [5], added: [5], removed: [3], index: [4] });
            expect(radios[2]!.getAttribute('aria-checked')).toBe('false');
            await unmount();
        }
    });

    it('selects the item itself on click and Space in single selection, without a control', async () => {
        const { items, last, pressed } = await setup('singleSelect');
        expect(items()[0].querySelector('[data-gl-select]')).toBeNull();
        await userEvent.click(items()[1].querySelector('[role="heading"]')!);
        expect(last()!.selection).toEqual([2]);
        items()[3].focus();
        // Enter moves into the item (it has a details button); Space selects
        await userEvent.keyboard(' ');
        expect(last()).toEqual({ selection: [4], added: [4], removed: [2], index: [3] });
        expect(pressed()).toBeNull();
    });

    it('clears the selection and focuses items through actionsRef', async () => {
        const { items, last, actionsRef } = await setup();
        await userEvent.click(items()[0].querySelector<HTMLElement>('[data-gl-select]')!);
        actionsRef.current!.clearSelection();
        expect(last()).toEqual({ selection: [], added: [], removed: [1], index: [] });
        actionsRef.current!.focusItem(4);
        expect(active()).toBe(items()[4]);
        expect(items()[4].tabIndex).toBe(0);
    });
});

describe('GridList selection state', () => {
    it('is controlled by value and uncontrolled with defaultValue', async () => {
        const onValueChange = vi.fn();
        const list = (value?: number[]) => (
            <GridList<number> aria-label="List" selectionMode="multiSelect" value={value} onValueChange={onValueChange}>
                {[1, 2, 3].map((id) => (
                    <GridListItem key={id} value={id} title={`Item ${id}`} />
                ))}
            </GridList>
        );
        const screen = await render(list([2]));
        const items = () => [...screen.container.querySelectorAll<HTMLElement>('[data-grid-list-item]')];
        expect(items().map((i) => i.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
        items()[0].focus();
        await userEvent.keyboard(' ');
        expect(onValueChange).toHaveBeenLastCalledWith([2, 1], { added: [1], removed: [], index: [0] });
        // controlled: nothing changes until the value does
        expect(items()[0].getAttribute('aria-selected')).toBe('false');
        await screen.rerender(list([2, 1]));
        expect(items()[0].getAttribute('aria-selected')).toBe('true');

        const uncontrolled = await render(
            <GridList<number> aria-label="Other" selectionMode="singleSelect" defaultValue={[3]}>
                {[1, 2, 3].map((id) => (
                    <GridListItem key={id} value={id} title={`Other ${id}`} />
                ))}
            </GridList>
        );
        const others = [...uncontrolled.container.querySelectorAll<HTMLElement>('[data-grid-list-item]')];
        expect(others[2].getAttribute('aria-selected')).toBe('true');
        await userEvent.click(others[0]);
        expect(others[0].getAttribute('aria-selected')).toBe('true');
        expect(others[2].getAttribute('aria-selected')).toBe('false');
    });

    it("takes an item's selected prop into an uncontrolled list's selection", async () => {
        const Demo = () => {
            const [first, setFirst] = useState(true);
            return (
                <>
                    <button onClick={() => setFirst(!first)}>switch</button>
                    <GridList aria-label="List" selectionMode="multiSelect">
                        <GridListItem value="a" title="A" selected={first} />
                        <GridListItem value="b" title="B" selected={!first} />
                        <GridListItem value="c" title="C" />
                    </GridList>
                </>
            );
        };
        const screen = await render(<Demo />);
        const items = () => [...screen.container.querySelectorAll<HTMLElement>('[data-grid-list-item]')];
        expect(items().map((i) => i.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
        await userEvent.click(screen.container.querySelector('button')!);
        expect(items().map((i) => i.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
    });

    it('selects items without a value by their id', async () => {
        const onValueChange = vi.fn();
        const screen = await render(
            <GridList aria-label="List" selectionMode="multiSelect" onValueChange={onValueChange}>
                <GridListItem id="first" title="First" />
                <GridListItem title="Second" />
            </GridList>
        );
        const items = [...screen.container.querySelectorAll<HTMLElement>('[data-grid-list-item]')];
        expect(items[1].id).toMatch(/^fd-grid-list-item-.+$/);
        items[0].focus();
        await userEvent.keyboard(' ');
        expect(onValueChange).toHaveBeenLastCalledWith(['first'], { added: ['first'], removed: [], index: [0] });
    });

    it('moves the tab stop to an existing item when the active one is removed', async () => {
        const Demo = ({ count }: { count: number }) => (
            <GridList aria-label="List">
                {[1, 2, 3].slice(0, count).map((id) => (
                    <GridListItem key={id} value={id} title={`Item ${id}`} />
                ))}
            </GridList>
        );
        const screen = await render(<Demo count={3} />);
        const items = () => [...screen.container.querySelectorAll<HTMLElement>('[data-grid-list-item]')];
        items()[2].focus();
        expect(items().map((i) => i.tabIndex)).toEqual([-1, -1, 0]);
        await screen.rerender(<Demo count={2} />);
        await expect.poll(() => items().map((i) => i.tabIndex)).toEqual([-1, 0]);
    });
});

describe('GridList layout', () => {
    it('parses layout patterns into column spans', () => {
        expect(parseGridListLayout('XL4-L3-M2-S1')).toEqual([12, 6, 4, 3]);
        expect(parseGridListLayout('XL6-L8-M12', false)).toEqual([12, 12, 8, 6]);
        expect(parseGridListLayout('M2')).toEqual([12, 6, 6, 6]);
        expect(() => parseGridListLayout('XL5')).toThrow(/Invalid grid list layout pattern/);
        expect(() => parseGridListLayout('XL13', false)).toThrow();
    });

    it('lays out items per row from layoutPattern and spans from layoutItemPattern; width fixes an item', async () => {
        const screen = await render(
            <div style={{ width: 1100 }}>
                <GridList aria-label="List" layoutPattern="XL2-L2-M2-S1" width="1000px">
                    <GridListItem title="Half" data-testid="half" />
                    <GridListItem title="Wide" data-testid="wide" layoutItemPattern="XL12-L12-M12" />
                    <GridListItem title="Fixed" data-testid="fixed" width="12rem" />
                </GridList>
            </div>
        );
        const q = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
        const list = screen.container.querySelector<HTMLElement>('[data-slot="grid-list"]')!;
        expect(list.getBoundingClientRect().width).toBe(1000);
        // 1000px - 2 × 0.5rem padding - a 1rem gap: two columns of 484px
        expect(q('half').getBoundingClientRect().width).toBeCloseTo(484, 0);
        expect(q('wide').getBoundingClientRect().width).toBeCloseTo(984, 0);
        expect(q('fixed').getBoundingClientRect().width).toBe(192);
    });

    it('stretches items to the row height unless autoHeight, and noPadding removes the body padding', async () => {
        const screen = await render(
            <div style={{ width: 1100 }}>
                <GridList aria-label="List" layoutPattern="XL3-L3-M3-S3">
                    <GridListItem title="Auto" autoHeight data-testid="auto" />
                    <GridListItem title="Row" data-testid="row" />
                    <GridListItem title="Tall" noPadding data-testid="tall">
                        <GridListItemBody>
                            <div style={{ height: 200 }}>Tall</div>
                        </GridListItemBody>
                    </GridListItem>
                </GridList>
            </div>
        );
        const card = (id: string) =>
            screen.container.querySelector<HTMLElement>(`[data-testid="${id}"] [data-grid-list-item]`)!;
        const height = (id: string) => card(id).getBoundingClientRect().height;
        expect(height('row')).toBe(height('tall'));
        expect(height('auto')).toBeLessThan(height('row'));
        expect(getComputedStyle(card('tall').querySelector('[data-gl-body]')!).paddingTop).toBe('0px');
        expect(getComputedStyle(card('row').querySelector('[data-gl-body]')!).paddingTop).toBe('16px');
    });
});

interface PartsState {
    titleLevel?: number;
    disableToolbarClick?: boolean;
}

function Parts({ titleLevel = 2, disableToolbarClick, log }: PartsState & { log: (event: string) => void }) {
    return (
        <GridList aria-label="Parts">
            <GridListTitleBar title="Products" headingLevel={titleLevel} additionalTitle={<span>(5)</span>} />
            <GridListGroupHeader>Default group</GridListGroupHeader>
            <GridListGroupHeader headingLevel={5} aria-label="Group five">
                Level 5 group
            </GridListGroupHeader>
            <GridListItem value="nav" type="navigation" counter={7} title="Nav" onNavigate={() => log('navigate')} />
            <GridListItem
                value="error"
                state="error"
                status="success"
                type="detail"
                title="Error"
                onDetail={() => log('detail')}
            />
            <GridListItem value="locked" state="locked" title="Locked" onLocked={() => log('locked')} />
            <GridListItem value="draft" state="draft" title="Draft" onDraft={() => log('draft')} />
            <GridListItem value="plain" title="Plain" onCardClick={() => log('card')} />
            <GridListItem
                value="active"
                type="active"
                title="Active"
                disableToolbarClick={disableToolbarClick}
                onPress={(event) => log(`press ${event.index} ${event.value}`)}
            >
                <GridListItemToolbar>
                    <span data-testid="custom">Custom</span>
                </GridListItemToolbar>
                <GridListItemFooterBar>Custom footer</GridListItemFooterBar>
            </GridListItem>
        </GridList>
    );
}

describe('GridList parts', () => {
    async function renderParts(initial: PartsState = {}) {
        const log = vi.fn();
        const screen = await render(<Parts {...initial} log={log} />);
        const el = screen.container;
        const item = (title: string) =>
            [...el.querySelectorAll<HTMLElement>('[data-grid-list-item]')].find(
                (i) => i.querySelector('[role="heading"]')?.textContent?.trim() === title
            )!;
        return { el, log, item, update: (next: PartsState) => screen.rerender(<Parts {...next} log={log} />) };
    }

    it('the title bar is a heading with aria-level from headingLevel and contains the additional title', async () => {
        const { el, update } = await renderParts();
        const heading = el.querySelector<HTMLElement>('[data-toolbar-label][role="heading"]')!;
        expect(heading.getAttribute('aria-level')).toBe('2');
        expect(heading.textContent!.replace(/\s+/g, ' ').trim()).toBe('Products (5)');
        // a list item of the list
        expect(heading.closest('[role="listitem"]')!.parentElement!.dataset['slot']).toBe('grid-list');

        await update({ titleLevel: 4 });
        expect(heading.getAttribute('aria-level')).toBe('4');
    });

    it('the group header uses its headingLevel (default 3) and aria-label', async () => {
        const { el } = await renderParts();
        const headings = [...el.querySelectorAll('[role="heading"]')].filter((h) => h.textContent!.includes('group'));
        expect(headings.map((h) => [h.textContent!.trim(), h.getAttribute('aria-level')])).toEqual([
            ['Default group', '3'],
            ['Level 5 group', '5']
        ]);
        expect(headings[1].getAttribute('aria-label')).toBe('Group five');
    });

    it('state items show their state actions and statuses expose a status label', async () => {
        const { item } = await renderParts();
        expect(item('Error').textContent).toContain('Contains errors');
        expect(item('Error').querySelector('.sr-only-sap')!.textContent).toBe('Item has status. Status: success.');
        expect(item('Locked').querySelector('button')!.textContent!.trim()).toBe('Locked');
        expect(item('Draft').querySelector('button')!.textContent!.trim()).toBe('Draft');
        // no state, no status: neither a footer action nor a status label
        expect(item('Plain').querySelector('button')).toBeNull();
        expect(item('Plain').querySelector('.sr-only-sap')).toBeNull();
        // a footer bar replaces the state actions; toolbar content goes in the toolbar row
        expect(item('Active').textContent).toContain('Custom footer');
        expect(item('Active').firstElementChild!.contains(item('Active').querySelector('[data-testid="custom"]'))).toBe(
            true
        );
    });

    it('detail, draft and locked buttons emit their callbacks without a card click', async () => {
        const { item, log } = await renderParts();
        await userEvent.click(item('Error').querySelector<HTMLElement>('button[aria-label="Details"]')!);
        expect(log).toHaveBeenLastCalledWith('detail');
        await userEvent.click(item('Locked').querySelector('button')!);
        expect(log).toHaveBeenLastCalledWith('locked');
        await userEvent.click(item('Draft').querySelector('button')!);
        expect(log).toHaveBeenLastCalledWith('draft');
        expect(log).toHaveBeenCalledTimes(3);
        await userEvent.click(item('Plain'));
        expect(log).toHaveBeenLastCalledWith('card');
    });

    it('navigation items show the counter and indicator and emit navigate on click', async () => {
        const { item, log } = await renderParts();
        const nav = item('Nav');
        expect(nav.textContent).toContain('7');
        expect(nav.textContent).toContain('Item has 7 children.');
        expect(nav.querySelector('[data-glyph]') ?? nav.querySelector('[aria-hidden="true"]')).not.toBeNull();
        await userEvent.click(nav);
        expect(log).toHaveBeenLastCalledWith('navigate');
        nav.focus();
        await userEvent.keyboard('{Enter}');
        expect(log).toHaveBeenLastCalledWith('navigate');
    });

    it('active items emit press with their index and value; disableToolbarClick ignores toolbar clicks', async () => {
        const { item, log, el, update } = await renderParts();
        await userEvent.click(el.querySelector<HTMLElement>('[data-testid="custom"]')!);
        expect(log).toHaveBeenLastCalledWith('press 5 active');
        log.mockClear();
        await update({ disableToolbarClick: true });
        await userEvent.click(el.querySelector<HTMLElement>('[data-testid="custom"]')!);
        expect(log).not.toHaveBeenCalled();
        await userEvent.click(item('Active').querySelector('[role="heading"]')!);
        expect(log).toHaveBeenLastCalledWith('press 5 active');
    });

    it('filter bar, more button and footer activate with click, Enter and Space', async () => {
        const onClose = vi.fn();
        const onShowMore = vi.fn();
        const screen = await render(
            <GridList aria-label="List" selectionMode="multiSelect">
                <GridListFilterBar onClose={onClose}>Filtered by: Vendor</GridListFilterBar>
                <GridListItem title="Item" />
                <GridListMoreButton displayCount={1} totalCount={5} onShowMore={onShowMore} />
                <GridListFooter>Footer text</GridListFooter>
            </GridList>
        );
        const filter = screen.getByRole('button', { name: /Filtered by: Vendor/ });
        await expect.element(filter).toHaveAccessibleName('Filtered by: Vendor Remove filter');
        await userEvent.click(filter);
        filter.element().focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        expect(onClose).toHaveBeenCalledTimes(3);

        const more = screen.getByRole('button', { name: /More/ });
        await expect.element(more).toHaveTextContent('More[ 1 / 5 ]');
        await userEvent.click(more);
        more.element().focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        expect(onShowMore).toHaveBeenCalledTimes(3);

        // rows with one cell in a grid
        const footer = screen.getByText('Footer text').element();
        expect(footer.getAttribute('role')).toBe('gridcell');
        expect(footer.parentElement!.getAttribute('role')).toBe('row');
    });

    it('the navigation arrow is mirrored once in RTL', async () => {
        const screen = await render(
            <div dir="rtl">
                <GridList aria-label="List">
                    <GridListItem type="navigation" title="Nav" />
                </GridList>
            </div>
        );
        const icon = screen.container.querySelector<HTMLElement>('[data-gl-item-toolbar] [data-glyph]')!;
        // the icon mirrors its glyph itself; its wrapper must not turn it back
        const wrapper = getComputedStyle(icon.parentElement!);
        expect([wrapper.transform, wrapper.rotate]).toEqual(['none', 'none']);
        expect(getComputedStyle(icon).scale).toMatch(/^-1 1/);
    });

    it('rows have no roles outside a list', async () => {
        const screen = await render(<GridListTitleBar title="Alone" data-testid="bar" />);
        const bar = screen.container.querySelector<HTMLElement>('[data-testid="bar"]')!;
        expect(bar.hasAttribute('role')).toBe(false);
        expect(bar.firstElementChild!.hasAttribute('role')).toBe(false);
    });

    it('unread items are bold; a navigated interactive item shows the indicator', async () => {
        const screen = await render(
            <GridList aria-label="List">
                <GridListItem title="Unread" state="unread" />
                <GridListItem title="Navigated" type="active" navigated />
            </GridList>
        );
        const items = [...screen.container.querySelectorAll<HTMLElement>('[data-grid-list-item]')];
        expect(getComputedStyle(items[0].querySelector('[role="heading"]')!).fontWeight).toBe('700');
        expect(getComputedStyle(items[1], '::after').width).toBe('3px');
        expect(getComputedStyle(items[0], '::after').content).toBe('none');
    });
});

describe('GridList props', () => {
    it('passes native props, className and ref to the list and to the item column; id and aria-label to the card', async () => {
        const ref = createRef<HTMLDivElement>();
        const itemRef = createRef<HTMLDivElement>();
        const screen = await render(
            <GridList ref={ref} aria-label="List" className="custom" data-foo="bar" id="my-list">
                <GridListItem
                    ref={itemRef}
                    id="my-item"
                    aria-label="Item label"
                    className="item-class"
                    data-item="x"
                    title="Item"
                >
                    <GridListItemImage render={<img alt="" src="" data-testid="image" />} />
                    <GridListItemBody render={<p />} className="body-class">
                        Body
                    </GridListItemBody>
                </GridListItem>
            </GridList>
        );
        const root = screen.container.firstElementChild as HTMLElement;
        expect(ref.current).toBe(root);
        expect(root.id).toBe('my-list');
        expect(root.className).toContain('custom');
        expect(root.className).toContain('grid');
        expect(root.dataset['foo']).toBe('bar');
        expect(itemRef.current!.className).toContain('item-class');
        expect(itemRef.current!.dataset['item']).toBe('x');
        const card = itemRef.current!.firstElementChild as HTMLElement;
        expect(card.id).toBe('my-item');
        expect(card.getAttribute('aria-label')).toBe('Item label');
        const image = screen.container.querySelector('[data-testid="image"]')!;
        expect(image.hasAttribute('data-gl-image')).toBe(true);
        // image, header, body in that order
        expect(image.nextElementSibling!.hasAttribute('data-gl-header')).toBe(true);
        expect(image.nextElementSibling!.nextElementSibling!.tagName).toBe('P');
        expect(image.nextElementSibling!.nextElementSibling!.className).toContain('body-class');
    });

    it('a standalone item is focusable and shows its selected prop', async () => {
        const screen = await render(<GridListItem title="Alone" type="active" selected />);
        const card = screen.container.querySelector<HTMLElement>('[data-grid-list-item]')!;
        expect(card.tabIndex).toBe(0);
        expect(card.className).toContain('bg-sap-list-selection-background-color');
    });
});
