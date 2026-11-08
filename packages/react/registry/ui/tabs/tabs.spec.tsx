import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    Tab,
    TabCount,
    TabItem,
    TabLink,
    TabList,
    TabNav,
    TabTag,
    type TabListActions,
    type TabListProps,
    type TabModes
} from './tabs';

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const stable = async () => {
    await frame();
    await frame();
    await frame();
};

const tabs = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>('[role=tablist] [role=tab]')];
const panel = (root: HTMLElement) => root.querySelector<HTMLElement>('[role=tabpanel]:not(.hidden)');
const selectedId = (root: HTMLElement) => root.querySelector('[role=tablist] [role=tab][aria-selected=true]')?.id;

interface HostProps {
    collapsible?: boolean;
    maxVisible?: number;
    onValueChange?: TabListProps['onValueChange'];
}

/** The Angular test host: four tabs (the third disabled) and a tab nav of two links. */
function Host({ collapsible = false, maxVisible = Number.POSITIVE_INFINITY, onValueChange }: HostProps) {
    return (
        <div style={{ width: 800 }}>
            <TabList
                ariaLabel="Tabs"
                collapsibleTabs={collapsible}
                maxVisibleTabs={maxVisible}
                onValueChange={onValueChange}
            >
                <Tab id="t1" title="One">
                    Content one
                </Tab>
                <Tab id="t2" title="Two" count="5">
                    Content two
                </Tab>
                <Tab id="t3" title="Three" disabled>
                    Content three
                </Tab>
                <Tab id="t4" title="Four" tabState="error">
                    Content four
                </Tab>
            </TabList>
        </div>
    );
}

async function setup(props: HostProps = {}) {
    const screen = await render(<Host {...props} />);
    await stable();
    return { screen, root: screen.container };
}

describe('TabList', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('links tabs and panels and selects the first tab', async () => {
        const { root } = await setup();
        expect(root.querySelector('[role=tablist]')?.getAttribute('aria-label')).toBe('Tabs');
        const [one] = tabs(root);
        expect(one!.getAttribute('aria-selected')).toBe('true');
        expect(one!.getAttribute('aria-controls')).toBe('t1-panel');
        expect(panel(root)?.id).toBe('t1-panel');
        expect(panel(root)?.getAttribute('aria-labelledby')).toBe('t1');
        expect(panel(root)?.getAttribute('tabindex')).toBe('0');
        expect(panel(root)?.textContent?.trim()).toBe('Content one');
        // every panel is in the DOM, so every aria-controls points at one
        expect(root.querySelectorAll('[role=tabpanel]')).toHaveLength(4);
        expect(root.querySelector('#t3-panel')?.textContent).toBe('');
    });

    it('selects tabs by click and skips disabled ones', async () => {
        const onValueChange = vi.fn();
        const { root } = await setup({ onValueChange });
        expect(onValueChange).toHaveBeenLastCalledWith('t1', 0);
        await userEvent.click(tabs(root)[1]!);
        expect(panel(root)?.textContent?.trim()).toBe('Content two');
        expect(onValueChange).toHaveBeenLastCalledWith('t2', 1);
        const disabled = tabs(root)[2]!;
        expect(disabled.getAttribute('aria-disabled')).toBe('true');
        await userEvent.click(disabled, { force: true });
        expect(panel(root)?.textContent?.trim()).toBe('Content two');
        expect(onValueChange).toHaveBeenCalledTimes(2);
    });

    it('moves between tabs with the arrow keys as one tab stop', async () => {
        const { root } = await setup();
        expect(root.querySelectorAll('[role=tab][tabindex="0"]')).toHaveLength(1);
        tabs(root)[0]!.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement?.id).toBe('t2');
        // moving does not select
        expect(selectedId(root)).toBe('t1');
        await userEvent.keyboard('{ArrowRight}');
        // the disabled tab is skipped
        expect(document.activeElement?.id).toBe('t4');
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement?.id).toBe('t1');
        await userEvent.keyboard('{End}{Enter}');
        expect(panel(root)?.textContent?.trim()).toBe('Content four');
        expect(root.querySelectorAll('[role=tab][tabindex="0"]')).toHaveLength(1);
        await userEvent.keyboard('{ArrowLeft}{ }');
        expect(selectedId(root)).toBe('t2');
    });

    it('Home moves to the first enabled tab, End to the last', async () => {
        const { root } = await setup();
        tabs(root)[3]!.focus();
        await userEvent.keyboard('{Home}');
        expect(document.activeElement?.id).toBe('t1');
        await userEvent.keyboard('{End}');
        expect(document.activeElement?.id).toBe('t4');
    });

    it('mirrors the arrow keys in RTL', async () => {
        const screen = await render(
            <DirectionProvider direction="rtl">
                <div dir="rtl">
                    <TabList ariaLabel="Tabs">
                        <Tab id="r1" title="One" />
                        <Tab id="r2" title="Two" />
                    </TabList>
                </div>
            </DirectionProvider>
        );
        await stable();
        tabs(screen.container)[0]!.focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement?.id).toBe('r2');
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement?.id).toBe('r1');
    });

    it('collapses the selected tab when collapsible', async () => {
        const onValueChange = vi.fn();
        const { root } = await setup({ collapsible: true, onValueChange });
        await userEvent.click(tabs(root)[0]!);
        expect(panel(root)).toBeNull();
        expect(tabs(root)[0]!.getAttribute('aria-selected')).toBe('false');
        expect(onValueChange).toHaveBeenLastCalledWith(null, -1);
        await userEvent.click(tabs(root)[0]!);
        expect(panel(root)?.textContent?.trim()).toBe('Content one');
    });

    it('lists tabs that do not fit in a "More" menu', async () => {
        const { root } = await setup({ maxVisible: 2 });
        expect(tabs(root)).toHaveLength(2);
        const more = root.querySelector<HTMLButtonElement>('button[aria-label=More]')!;
        // the "More" button is outside the tablist
        expect(more.closest('[role=tablist]')).toBeNull();
        await userEvent.click(more);
        await stable();
        const items = [...document.querySelectorAll<HTMLElement>('[role=menuitem]')];
        expect(items.map((i) => i.textContent?.trim())).toEqual(['Three', 'Four']);
        // a disabled tab cannot be picked
        expect(items[0]!.getAttribute('aria-disabled')).toBe('true');
        await userEvent.click(items[1]!);
        await stable();
        expect(panel(root)?.textContent?.trim()).toBe('Content four');
        expect(tabs(root).some((t) => t.id === 't4')).toBe(true);
        // the picked tab gets the focus
        expect(document.activeElement?.id).toBe('t4');
    });

    it('the More menu opens with the keyboard and returns the focus to the More button on Escape', async () => {
        const { root } = await setup({ maxVisible: 2 });
        const more = root.querySelector<HTMLButtonElement>('button[aria-label=More]')!;
        more.focus();
        await userEvent.keyboard('{Enter}');
        await stable();
        expect(more.getAttribute('aria-expanded')).toBe('true');
        expect(document.querySelectorAll('[role=menu] [role=menuitem]')).toHaveLength(2);
        await userEvent.keyboard('{Escape}');
        await stable();
        expect(more.getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(more);
        // the arrow keys on the More button do not move into the tabs
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(more);
    });

    it('without collapseOverflow, tabs that do not fit are hidden without a More button', async () => {
        const screen = await render(
            <div style={{ width: 300 }}>
                <TabList ariaLabel="Tabs" collapseOverflow={false}>
                    {['Overview', 'Details', 'Notes', 'Attachments', 'History'].map((title) => (
                        <Tab key={title} title={title} />
                    ))}
                </TabList>
            </div>
        );
        await stable();
        expect(tabs(screen.container).length).toBeLessThan(5);
        expect(screen.container.querySelector('button[aria-label=More]')).toBeNull();
    });

    it('reports the visible and hidden tab counts', async () => {
        const visible = vi.fn();
        const hidden = vi.fn();
        await render(
            <TabList
                ariaLabel="Tabs"
                maxVisibleTabs={2}
                onVisibleItemsCountChange={visible}
                onHiddenItemsCountChange={hidden}
            >
                <Tab title="One" />
                <Tab title="Two" />
                <Tab title="Three" />
            </TabList>
        );
        await stable();
        expect(visible).toHaveBeenLastCalledWith(2);
        expect(hidden).toHaveBeenLastCalledWith(1);
    });

    it('renders titles, counts, states and title content by mode', async () => {
        const screen = await render(<ModesHost mode={null} />);
        await stable();
        const root = screen.container;
        const [first, second] = tabs(root);
        // default mode: the count above the tag
        expect(second!.querySelector('span.block')?.textContent).toBe('5');
        expect(second!.textContent).toBe('5Two');
        // the value state colours the tab
        const negative = getComputedStyle(document.documentElement).getPropertyValue('--sapNegativeTextColor');
        expect(getComputedStyle(first!.parentElement!).getPropertyValue('--tab-tag')).toBe(negative);
        // title content replaces the title
        expect(tabs(root)[2]!.querySelector('b')?.textContent).toBe('(12)');

        await screen.rerender(<ModesHost mode="icon-only" />);
        await stable();
        // icon-only: the title is hidden text, the count in the round icon
        expect(tabs(root)[0]!.querySelector('.sr-only-sap')?.textContent).toBe('One');
        expect(tabs(root)[1]!.querySelector('[data-glyph] + span')?.textContent).toBe('5');

        await screen.rerender(<ModesHost mode="process" />);
        await stable();
        // process: arrows between the tabs, none after the last
        expect(root.querySelectorAll('[role=tablist] [role=tab] + span[aria-hidden=true][data-glyph]')).toHaveLength(2);

        await screen.rerender(<ModesHost mode="filter" />);
        await stable();
        // filter: the header has a large count, a label and a separator after it
        const header = tabs(root)[0]!;
        expect(header.querySelector('.text-\\[1\\.5rem\\]')?.textContent).toBe('120');
        expect(
            header.closest('[data-overflow-item]')!.firstElementChild!.lastElementChild!.getAttribute('aria-hidden')
        ).toBe('true');
    });

    it('compact density makes the tabs smaller', async () => {
        const screen = await render(<ModesHost mode="icon-only" />);
        await stable();
        const root = screen.container;
        const icon = () => tabs(root)[0]!.querySelector<HTMLElement>('[data-tab-icon]')!.getBoundingClientRect().height;
        expect(icon()).toBe(42);
        document.documentElement.setAttribute('data-density', 'compact');
        expect(icon()).toBe(30);
        await screen.rerender(<ModesHost mode="filter" />);
        await stable();
        expect(tabs(root)[1]!.getBoundingClientRect().height).toBe(76);
        document.documentElement.removeAttribute('data-density');
        expect(tabs(root)[1]!.getBoundingClientRect().height).toBe(88);
    });

    it('names tabs with ariaLabel or ariaLabelledBy', async () => {
        const screen = await render(
            <>
                <span id="external">External name</span>
                <TabList ariaLabel="Tabs" mode="icon-only">
                    <Tab id="a" glyph="cart" title="Cart" ariaLabel="Shopping cart" />
                    <Tab id="b" glyph="cart" title="Other" ariaLabelledBy="external" />
                </TabList>
            </>
        );
        await stable();
        const [a, b] = tabs(screen.container);
        expect(a!.getAttribute('aria-label')).toBe('Shopping cart');
        expect(a!.querySelector('.sr-only-sap')).toBeNull();
        expect(b!.getAttribute('aria-labelledby')).toBe('external');
    });

    it('calls onOpenChange of a tab when its panel opens and closes', async () => {
        const open = vi.fn();
        const screen = await render(
            <TabList ariaLabel="Tabs">
                <Tab id="a" title="A" />
                <Tab id="b" title="B" onOpenChange={open} />
            </TabList>
        );
        await stable();
        expect(open).not.toHaveBeenCalled();
        await userEvent.click(tabs(screen.container)[1]!);
        expect(open).toHaveBeenLastCalledWith(true);
        await userEvent.click(tabs(screen.container)[0]!);
        expect(open).toHaveBeenLastCalledWith(false);
    });

    it('passes className, native props and the ref to the root, the panels and the tab links (fundamental-react)', async () => {
        const ref = createRef<HTMLDivElement>();
        const panelRef = createRef<HTMLDivElement>();
        const screen = await render(
            <TabList ref={ref} className="blue" data-sample="Sample" ariaLabel="Tabs">
                <Tab
                    ref={panelRef}
                    title="Tab 1"
                    className="panel"
                    data-sample="Panel"
                    linkProps={{ 'data-sample': 'Link', className: 'link' }}
                >
                    Content
                </Tab>
            </TabList>
        );
        await stable();
        expect(ref.current).toBe(screen.container.firstElementChild);
        expect(ref.current!.className).toContain('blue');
        expect(ref.current!.getAttribute('data-sample')).toBe('Sample');
        expect(panelRef.current!.getAttribute('role')).toBe('tabpanel');
        expect(panelRef.current!.className).toContain('panel');
        expect(panelRef.current!.getAttribute('data-sample')).toBe('Panel');
        const [link] = tabs(screen.container);
        expect(link!.tagName).toBe('A');
        expect(link!.getAttribute('data-sample')).toBe('Link');
        expect(link!.className).toContain('link');
    });
});

interface DynamicProps {
    ids?: string[];
    mode?: TabModes | null;
    defaultValue?: string | null;
    selectDefault?: boolean;
    actions?: React.Ref<TabListActions>;
    onValueChange?: TabListProps['onValueChange'];
}

function DynamicHost({
    ids = ['a', 'b', 'c'],
    mode = null,
    defaultValue,
    selectDefault,
    actions,
    onValueChange
}: DynamicProps) {
    return (
        <div style={{ width: 800 }}>
            <TabList
                ariaLabel="Dynamic tabs"
                mode={mode}
                defaultValue={defaultValue}
                selectDefaultOnTabsChange={selectDefault}
                actionsRef={actions}
                onValueChange={onValueChange}
            >
                {ids.map((id) => (
                    <Tab key={id} id={id} title={`Tab ${id}`} glyph="cart">
                        Content {id}
                    </Tab>
                ))}
            </TabList>
        </div>
    );
}

function ModesHost({ mode }: { mode: TabModes | null }) {
    return (
        <div style={{ width: 800 }}>
            <TabList ariaLabel="Modes" mode={mode}>
                {mode === 'filter' && <Tab key="header" header title="Products" count="120" />}
                <Tab key="one" title="One" glyph="cart" tabState="error" />
                <Tab key="two" title="Two" glyph="employee" count="5" />
                {mode !== 'filter' && (
                    <Tab
                        key="three"
                        count="12"
                        glyph="alert"
                        titleContent={
                            <TabTag>
                                Inbox <b>(12)</b>
                            </TabTag>
                        }
                    />
                )}
            </TabList>
        </div>
    );
}

describe('TabList selection', () => {
    it('selects the default tab first, and follows the default until a tab is chosen', async () => {
        const screen = await render(<DynamicHost defaultValue="b" />);
        await stable();
        const root = screen.container;
        expect(selectedId(root)).toBe('b');
        expect(panel(root)?.textContent?.trim()).toBe('Content b');
        await screen.rerender(<DynamicHost defaultValue="c" />);
        await stable();
        expect(selectedId(root)).toBe('c');
        await userEvent.click(tabs(root)[0]!);
        await screen.rerender(<DynamicHost defaultValue="b" />);
        await stable();
        expect(selectedId(root)).toBe('a');
    });

    it('selectTab() selects a tab by id (or panel id) and reports the change', async () => {
        const actions = createRef<TabListActions>();
        const onValueChange = vi.fn();
        const screen = await render(<DynamicHost actions={actions} onValueChange={onValueChange} />);
        await stable();
        const root = screen.container;
        onValueChange.mockClear();
        actions.current!.selectTab('c');
        await stable();
        expect(selectedId(root)).toBe('c');
        expect(panel(root)?.textContent?.trim()).toBe('Content c');
        expect(onValueChange.mock.calls).toEqual([['c', 2]]);
        // the panel id works too; an unknown id changes nothing
        actions.current!.selectTab('b-panel');
        actions.current!.selectTab('nope');
        await stable();
        expect(selectedId(root)).toBe('b');
        expect(onValueChange.mock.calls).toEqual([
            ['c', 2],
            ['b', 1]
        ]);
        expect(actions.current!.scrollElement()).toBe(root.querySelector('[role=tabpanel]')!.parentElement);
    });

    it('adding and removing tabs keeps the selected tab selected', async () => {
        const screen = await render(<DynamicHost />);
        await stable();
        const root = screen.container;
        await userEvent.click(tabs(root)[1]!);
        expect(selectedId(root)).toBe('b');
        await screen.rerender(<DynamicHost ids={['a', 'b', 'c', 'd']} />);
        await stable();
        expect(tabs(root).map((t) => t.id)).toEqual(['a', 'b', 'c', 'd']);
        expect(selectedId(root)).toBe('b');
        await screen.rerender(<DynamicHost ids={['b', 'c', 'd']} />);
        await stable();
        expect(selectedId(root)).toBe('b');
        // removing the selected tab selects the first one
        await screen.rerender(<DynamicHost ids={['c', 'd']} />);
        await stable();
        expect(selectedId(root)).toBe('c');
        expect(panel(root)?.textContent?.trim()).toBe('Content c');
    });

    it('selectDefaultOnTabsChange selects the default tab again when the tabs change', async () => {
        const screen = await render(<DynamicHost selectDefault defaultValue="a" />);
        await stable();
        const root = screen.container;
        await userEvent.click(tabs(root)[2]!);
        expect(selectedId(root)).toBe('c');
        await screen.rerender(<DynamicHost selectDefault defaultValue="a" ids={['a', 'b', 'c', 'd']} />);
        await stable();
        expect(selectedId(root)).toBe('a');
        // without a default among the tabs, the first one
        await userEvent.click(tabs(root)[2]!);
        await screen.rerender(<DynamicHost selectDefault defaultValue="a" ids={['b', 'c', 'd']} />);
        await stable();
        expect(selectedId(root)).toBe('b');
    });

    it('value controls the selected tab', async () => {
        const onValueChange = vi.fn();
        function Controlled({ value }: { value: string | null }) {
            return (
                <TabList ariaLabel="Controlled" value={value} onValueChange={onValueChange}>
                    <Tab id="x" title="X">
                        Content x
                    </Tab>
                    <Tab id="y" title="Y">
                        Content y
                    </Tab>
                </TabList>
            );
        }
        const screen = await render(<Controlled value="y" />);
        await stable();
        const root = screen.container;
        expect(selectedId(root)).toBe('y');
        await userEvent.click(tabs(root)[0]!);
        expect(onValueChange).toHaveBeenLastCalledWith('x', 0);
        // the parent did not change the value
        expect(selectedId(root)).toBe('y');
        await screen.rerender(<Controlled value={null} />);
        expect(selectedId(root)).toBeUndefined();
        expect(panel(root)).toBeNull();
    });
});

function StackHost({ focusFirst = true }: { focusFirst?: boolean }) {
    return (
        <div style={{ width: 800, height: 240 }}>
            <TabList ariaLabel="Stacked" stackContent focusFirstFocusableElement={focusFirst}>
                {['s1', 's2', 's3', 's4'].map((id) => (
                    <Tab key={id} id={id} title={`Section ${id}`}>
                        <div style={{ height: 300 }}>
                            <button type="button" id={`${id}-button`}>
                                Edit {id}
                            </button>
                        </div>
                    </Tab>
                ))}
            </TabList>
        </div>
    );
}

describe('TabList with stacked content', () => {
    it('shows every panel and marks the tab of the panel in view', async () => {
        const screen = await render(<StackHost />);
        await stable();
        const root = screen.container;
        const panels = [...root.querySelectorAll<HTMLElement>('[role=tabpanel]')];
        expect(panels).toHaveLength(4);
        expect(panels.every((p) => !p.classList.contains('hidden') && p.textContent!.includes('Edit'))).toBe(true);
        expect(selectedId(root)).toBe('s1');
        const container = root.querySelector<HTMLElement>('[role=region]')!;
        expect(container.getAttribute('aria-label')).toBe('Stacked');
        container.scrollTop = panels[2]!.offsetTop;
        await expect.poll(() => selectedId(root)).toBe('s3');
        await stable();
        expect(tabs(root)[2]!.getAttribute('tabindex')).toBe('0');
    });

    it('selecting a stacked tab scrolls to its panel and focuses its first focusable element', async () => {
        const screen = await render(<StackHost />);
        await stable();
        const root = screen.container;
        await userEvent.click(tabs(root)[1]!);
        await stable();
        expect(selectedId(root)).toBe('s2');
        expect(document.activeElement?.id).toBe('s2-button');
        const container = root.querySelector<HTMLElement>('[role=region]')!;
        const panel2 = root.querySelectorAll<HTMLElement>('[role=tabpanel]')[1]!;
        await expect.poll(() => Math.round(container.scrollTop)).toBe(panel2.offsetTop);

        await screen.rerender(<StackHost focusFirst={false} />);
        await stable();
        await userEvent.click(tabs(root)[3]!);
        await stable();
        expect(selectedId(root)).toBe('s4');
        expect(document.activeElement).toBe(tabs(root)[3]);
    });
});

describe('TabNav', () => {
    function NavHost({ links }: { links: { id: string; active: boolean; disabled?: boolean }[] }) {
        return (
            <TabNav aria-label="Pages">
                {links.map((link) => (
                    <TabItem key={link.id} disabled={link.disabled}>
                        <TabLink href="#" id={link.id} active={link.active} disabled={link.disabled}>
                            <TabTag>{link.id}</TabTag>
                        </TabLink>
                    </TabItem>
                ))}
            </TabNav>
        );
    }

    it('marks the active link and makes it the tab stop', async () => {
        const screen = await render(
            <NavHost
                links={[
                    { id: 'a', active: false },
                    { id: 'b', active: true }
                ]}
            />
        );
        await stable();
        const root = screen.container;
        const links = [...root.querySelectorAll<HTMLElement>('nav [role=tab]')];
        expect(root.querySelector('nav')?.getAttribute('role')).toBe('tablist');
        expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Pages');
        expect(links[1]!.getAttribute('aria-selected')).toBe('true');
        expect(links[1]!.getAttribute('tabindex')).toBe('0');
        expect(links[0]!.getAttribute('tabindex')).toBe('-1');
        links[1]!.focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(links[0]);
    });

    it('updates the tab stop when links are added and skips disabled links', async () => {
        const screen = await render(
            <NavHost
                links={[
                    { id: 'a', active: false },
                    { id: 'b', active: false }
                ]}
            />
        );
        await stable();
        const root = screen.container;
        const stops = () => [...root.querySelectorAll<HTMLElement>('nav [role=tab][tabindex="0"]')].map((l) => l.id);
        expect(stops()).toEqual(['a']);
        await screen.rerender(
            <NavHost
                links={[
                    { id: 'z', active: false },
                    { id: 'a', active: false },
                    { id: 'b', active: false }
                ]}
            />
        );
        await stable();
        expect(stops()).toEqual(['z']);
        await screen.rerender(
            <NavHost
                links={[
                    { id: 'z', active: false },
                    { id: 'a', active: false, disabled: true },
                    { id: 'b', active: false },
                    { id: 'c', active: true }
                ]}
            />
        );
        await stable();
        expect(stops()).toEqual(['c']);
        root.querySelector<HTMLElement>('#c')!.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement?.id).toBe('z');
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement?.id).toBe('b');
        expect(root.querySelector('#a')!.getAttribute('aria-disabled')).toBe('true');
    });

    it('passes className, native props and the ref to the nav and the parts', async () => {
        const ref = createRef<HTMLElement>();
        const linkRef = createRef<HTMLAnchorElement>();
        const screen = await render(
            <TabNav ref={ref} className="custom" data-sample="Sample" mode="icon-only" size="s">
                <TabItem className="item" tabItemState="success">
                    <TabLink ref={linkRef} href="#x" data-sample="Link">
                        <TabCount>3</TabCount>
                    </TabLink>
                </TabItem>
            </TabNav>
        );
        await stable();
        expect(ref.current).toBe(screen.container.querySelector('nav'));
        expect(ref.current!.className).toContain('custom');
        expect(ref.current!.className).toContain('px-4');
        expect(ref.current!.getAttribute('data-sample')).toBe('Sample');
        expect(linkRef.current!.getAttribute('data-sample')).toBe('Link');
        expect(screen.container.querySelector('.item')).not.toBeNull();
        // the count is placed at the icon in icon-only mode
        expect(screen.container.querySelector('nav span')!.className).toContain('absolute');
    });
});
