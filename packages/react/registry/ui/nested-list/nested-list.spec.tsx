import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef, useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    NESTED_LIST_SCOPE_ATTRIBUTE,
    NestedList,
    NestedListContent,
    NestedListExpandIcon,
    NestedListHeader,
    NestedListIcon,
    NestedListItem,
    NestedListLink,
    NestedListPopover,
    NestedListProvider,
    NestedListTitle,
    PreparedNestedList,
    type NestedListModel
} from './nested-list';

const wait = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
const row = (name: string) =>
    [...document.querySelectorAll<HTMLElement>('[role=treeitem]')].find(
        (el) => el.textContent?.trim() === name && el.offsetParent !== null
    )!;
const focused = () => document.activeElement?.textContent?.trim();
const popoverBody = () =>
    document.querySelector<HTMLElement>('[data-nested-scope] [data-slot=nested-list-popover-header]')?.parentElement ??
    null;

interface HostProps {
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    homeSelected?: boolean;
    settingsSelected?: boolean;
    onHome?: () => void;
}

/** A nested list on its own, outside a side navigation (Angular's spec host). */
function Host({ expanded, onExpandedChange, homeSelected = false, settingsSelected = false, onHome }: HostProps) {
    return (
        <NestedList>
            <NestedListHeader>Overview</NestedListHeader>
            <NestedListItem>
                <NestedListLink selected={homeSelected} onClick={onHome}>
                    <NestedListIcon glyph="home" />
                    <NestedListTitle>Home</NestedListTitle>
                </NestedListLink>
            </NestedListItem>
            <NestedListItem expanded={expanded} onExpandedChange={onExpandedChange}>
                <NestedListContent selected={settingsSelected}>
                    <NestedListLink>
                        <NestedListTitle>Settings</NestedListTitle>
                    </NestedListLink>
                    <NestedListExpandIcon />
                </NestedListContent>
                <NestedList textOnly>
                    <NestedListItem>
                        <NestedListLink>
                            <NestedListTitle>Profile</NestedListTitle>
                        </NestedListLink>
                    </NestedListItem>
                    <NestedListItem>
                        <NestedListLink>
                            <NestedListTitle>Security</NestedListTitle>
                        </NestedListLink>
                    </NestedListItem>
                </NestedList>
            </NestedListItem>
            <NestedListItem>
                <NestedListLink>
                    <NestedListTitle>Help</NestedListTitle>
                </NestedListLink>
            </NestedListItem>
        </NestedList>
    );
}

/** The host with an expanded state of its own, as Angular's `[(expanded)]`. */
function TwoWayHost(props: Omit<HostProps, 'expanded' | 'onExpandedChange'> & { onChange?: (v: boolean) => void }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <Host
            {...props}
            expanded={expanded}
            onExpandedChange={(v) => {
                setExpanded(v);
                props.onChange?.(v);
            }}
        />
    );
}

/** A condensed list, without a side navigation: the state comes from a provider. */
function CondensedHost({ onChange, rtl = false }: { onChange?: (v: boolean) => void; rtl?: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const ui = (
        <div dir={rtl ? 'rtl' : 'ltr'}>
            <NestedListProvider condensed>
                <div className="w-16">
                    <NestedList>
                        <NestedListHeader>Overview</NestedListHeader>
                        <NestedListItem>
                            <NestedListLink>
                                <NestedListIcon glyph="home" />
                                <NestedListTitle>Home</NestedListTitle>
                            </NestedListLink>
                        </NestedListItem>
                        <NestedListItem
                            expanded={expanded}
                            onExpandedChange={(v) => {
                                setExpanded(v);
                                onChange?.(v);
                            }}
                        >
                            <NestedListPopover>
                                <NestedListContent>
                                    <NestedListLink>
                                        <NestedListIcon glyph="settings" />
                                        <NestedListTitle>Settings</NestedListTitle>
                                    </NestedListLink>
                                    <NestedListExpandIcon />
                                </NestedListContent>
                                <NestedList>
                                    <NestedListItem>
                                        <NestedListLink>
                                            <NestedListTitle>Profile</NestedListTitle>
                                        </NestedListLink>
                                    </NestedListItem>
                                    <NestedListItem>
                                        <NestedListLink>
                                            <NestedListTitle>Security</NestedListTitle>
                                        </NestedListLink>
                                    </NestedListItem>
                                </NestedList>
                            </NestedListPopover>
                        </NestedListItem>
                    </NestedList>
                </div>
            </NestedListProvider>
            <button id="outside">Outside</button>
        </div>
    );
    return rtl ? <DirectionProvider direction="rtl">{ui}</DirectionProvider> : ui;
}

async function mount(ui: ReactNode) {
    const screen = await render(ui);
    await wait();
    return { screen, root: screen.container };
}

describe('NestedList', () => {
    it('wraps ArrowUp on the first row to the last and ArrowDown on the last row to the first', async () => {
        const { screen } = await mount(<Host expanded={false} />);
        row('Home').focus();
        await userEvent.keyboard('{ArrowUp}');
        expect(focused()).toBe('Help');
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Home');

        await screen.rerender(<Host expanded />);
        await wait();
        row('Help').focus();
        await userEvent.keyboard('{ArrowUp}');
        expect(focused()).toBe('Security');
        await userEvent.keyboard('{End}{ArrowDown}');
        expect(focused()).toBe('Home');
    });

    it('gives leaf rows no aria-expanded and ignores ArrowRight on them', async () => {
        const onChange = vi.fn();
        await mount(<TwoWayHost onChange={onChange} />);
        const home = row('Home');
        expect(home.hasAttribute('aria-expanded')).toBe(false);
        expect(row('Settings').getAttribute('aria-expanded')).toBe('false');
        home.focus();
        await userEvent.keyboard('{ArrowRight}');
        await wait();
        expect(focused()).toBe('Home');
        expect(onChange).not.toHaveBeenCalled();
        expect(row('Settings').getAttribute('aria-expanded')).toBe('false');
    });

    it('reflects selected and expanded set from outside', async () => {
        const { screen, root } = await mount(<Host expanded={false} />);
        expect(row('Home').getAttribute('aria-selected')).toBe('false');
        await screen.rerender(<Host expanded={false} homeSelected />);
        await wait();
        expect(row('Home').getAttribute('aria-selected')).toBe('true');
        await screen.rerender(<Host expanded={false} settingsSelected />);
        await wait();
        expect(row('Home').getAttribute('aria-selected')).toBe('false');
        expect(row('Settings').getAttribute('aria-selected')).toBe('true');

        const group = root.querySelector('[role=group]')!;
        expect(group.getAttribute('aria-hidden')).toBe('true');
        await screen.rerender(<Host expanded settingsSelected />);
        await wait();
        expect(row('Settings').getAttribute('aria-expanded')).toBe('true');
        expect(group.hasAttribute('aria-hidden')).toBe(false);
        expect(row('Profile')).toBeTruthy();
        await screen.rerender(<Host expanded={false} settingsSelected />);
        await wait();
        expect(row('Settings').getAttribute('aria-expanded')).toBe('false');
        expect(group.getAttribute('aria-hidden')).toBe('true');
    });

    it('works without a side navigation: the arrow keys move within the top list', async () => {
        const onChange = vi.fn();
        const { root } = await mount(<TwoWayHost onChange={onChange} />);
        const tree = root.querySelector('[role=tree]')!;
        expect(tree.hasAttribute(NESTED_LIST_SCOPE_ATTRIBUTE)).toBe(true);
        expect(tree.getAttribute('aria-roledescription')).toBe('Navigation List Tree');
        row('Home').focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Settings');
        await userEvent.keyboard('{ArrowRight}');
        await wait();
        expect(onChange).toHaveBeenLastCalledWith(true);
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Profile');
        expect(row('Profile').getAttribute('aria-level')).toBe('2');
        await userEvent.keyboard('{End}');
        expect(focused()).toBe('Help');
        await userEvent.click(row('Profile'));
        await wait();
        expect(row('Profile').getAttribute('aria-selected')).toBe('true');
        expect(row('Settings').getAttribute('aria-selected')).toBe('true');
        expect(row('Home').getAttribute('aria-selected')).toBe('false');
    });

    it('expands with the button and collapses with ArrowLeft, Home and End jump to the ends', async () => {
        const onChange = vi.fn();
        const { root } = await mount(<TwoWayHost onChange={onChange} />);
        const button = root.querySelector<HTMLElement>('[data-slot=nested-list-expand-icon]')!;
        expect(button.getAttribute('tabindex')).toBe('-1');
        expect(button.getAttribute('aria-hidden')).toBe('true');
        const collapsedGlyph = button.querySelector('[data-glyph]')!.getAttribute('data-glyph');
        await userEvent.click(button);
        await wait();
        expect(onChange).toHaveBeenLastCalledWith(true);
        expect(row('Settings').getAttribute('aria-expanded')).toBe('true');
        expect(button.querySelector('[data-glyph]')!.getAttribute('data-glyph')).not.toBe(collapsedGlyph);
        // the button does not select the row
        expect(row('Settings').getAttribute('aria-selected')).toBe('false');
        row('Settings').focus();
        await userEvent.keyboard('{ArrowLeft}');
        await wait();
        expect(onChange).toHaveBeenLastCalledWith(false);
        expect(row('Profile')).toBeUndefined();
        await userEvent.keyboard('{Home}');
        expect(focused()).toBe('Home');
        await userEvent.keyboard('{End}');
        expect(focused()).toBe('Help');
    });

    it('activates the link with Enter and Space, selecting the item', async () => {
        const onHome = vi.fn();
        await mount(<Host expanded={false} onHome={onHome} />);
        row('Home').focus();
        await userEvent.keyboard('{Enter}');
        expect(onHome).toHaveBeenCalledTimes(1);
        expect(row('Home').getAttribute('aria-selected')).toBe('true');
        row('Settings').focus();
        await userEvent.keyboard(' ');
        await wait();
        expect(row('Settings').getAttribute('aria-selected')).toBe('true');
        expect(row('Home').getAttribute('aria-selected')).toBe('false');
        await userEvent.keyboard('{ArrowUp}{Enter}');
        expect(onHome).toHaveBeenCalledTimes(2);
    });

    it('renders trees of rows with levels, described by the group header before them', async () => {
        const { root } = await mount(
            <NestedList>
                <NestedListHeader>First</NestedListHeader>
                <NestedListItem>
                    <NestedListLink>
                        <NestedListTitle>A</NestedListTitle>
                    </NestedListLink>
                </NestedListItem>
                <NestedListHeader id="second">Second</NestedListHeader>
                <NestedListItem>
                    <NestedListLink>
                        <NestedListTitle>B</NestedListTitle>
                    </NestedListLink>
                </NestedListItem>
            </NestedList>
        );
        const headers = root.querySelectorAll('[data-nested-header]');
        expect(headers[0]!.getAttribute('role')).toBe('presentation');
        expect(row('A').getAttribute('aria-describedby')).toBe(headers[0]!.id);
        expect(row('B').getAttribute('aria-describedby')).toBe('second');
        expect(row('A').getAttribute('aria-level')).toBe('1');
        expect(row('A').getAttribute('aria-label')).toBe('A');
        expect(row('A').getAttribute('tabindex')).toBe('0');
        expect(row('A').closest('li')!.getAttribute('role')).toBe('none');
    });

    it('keeps the selected props when items are not selectable', async () => {
        const { screen } = await mount(
            <NestedListProvider selectable={false}>
                <Host expanded={false} homeSelected />
            </NestedListProvider>
        );
        expect(row('Home').hasAttribute('aria-selected')).toBe(false);
        expect(row('Home').getAttribute('aria-label')).toBe('Home, Selected');
        await userEvent.click(row('Help'));
        await wait();
        expect(row('Home').getAttribute('aria-label')).toBe('Home, Selected');
        expect(row('Home').className).toContain('border-b-sap-list-selection-border-color');
        expect(row('Help').className).not.toContain('border-b-sap-list-selection-border-color');
        await screen.rerender(
            <NestedListProvider selectable={false}>
                <Host expanded={false} />
            </NestedListProvider>
        );
        await wait();
        expect(row('Home').getAttribute('aria-label')).toBe('Home');
    });

    it('shares the selection between the lists of a scoped provider, and moves across them', async () => {
        await mount(
            <NestedListProvider scoped>
                <nav {...{ [NESTED_LIST_SCOPE_ATTRIBUTE]: '' }}>
                    <NestedList>
                        <NestedListItem>
                            <NestedListLink>
                                <NestedListTitle>Main</NestedListTitle>
                            </NestedListLink>
                        </NestedListItem>
                    </NestedList>
                    <NestedList>
                        <NestedListItem>
                            <NestedListLink>
                                <NestedListTitle>Utility</NestedListTitle>
                            </NestedListLink>
                        </NestedListItem>
                    </NestedList>
                </nav>
            </NestedListProvider>
        );
        const lists = document.querySelectorAll('[role=tree]');
        expect([...lists].some((l) => l.hasAttribute(NESTED_LIST_SCOPE_ATTRIBUTE))).toBe(false);
        row('Main').focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Utility');
        await userEvent.click(row('Utility'));
        await userEvent.click(row('Main'));
        await wait();
        expect(row('Main').getAttribute('aria-selected')).toBe('true');
        expect(row('Utility').getAttribute('aria-selected')).toBe('false');
    });

    it('opens the popover on click when condensed and resets expanded when Escape or an outside click closes it', async () => {
        const onChange = vi.fn();
        await mount(<CondensedHost onChange={onChange} />);
        const settings = row('Settings');
        expect(settings.getAttribute('aria-haspopup')).toBe('tree');
        expect(document.querySelector<HTMLElement>('[data-slot=nested-list-expand-icon]')!.className).toBe('hidden');
        expect(document.querySelector<HTMLElement>('[data-nested-header]')!.className).toBe('hidden');
        // icons only: the titles are for assistive technology, and the items show them as tooltips
        expect(settings.querySelector('span:not([aria-hidden]):not([data-glyph])')!.className).toContain('sr-only-sap');
        expect(row('Home').closest('li')!.getAttribute('title')).toBe('Home');

        await userEvent.click(settings);
        await wait(150);
        expect(onChange).toHaveBeenLastCalledWith(true);
        expect(settings.getAttribute('aria-expanded')).toBe('true');
        expect(popoverBody()?.textContent).toContain('Profile');
        // the overlay is outside the navigation tree: its list is a tree of its own, named by the item
        const popoverList = popoverBody()!.querySelector('ul')!;
        expect(popoverList.getAttribute('role')).toBe('tree');
        expect(popoverList.getAttribute('aria-label')).toBe('Settings');
        expect(popoverList.getAttribute('aria-roledescription')).toBe('Navigation List Tree');
        expect(document.querySelector('[role=tree]')!.getAttribute('aria-roledescription')).toBe(
            'Navigation List Menu Bar'
        );

        await userEvent.keyboard('{Escape}');
        await wait(150);
        expect(onChange).toHaveBeenLastCalledWith(false);
        expect(settings.getAttribute('aria-expanded')).toBe('false');
        expect(popoverBody()).toBeNull();

        await userEvent.click(settings);
        await wait(150);
        expect(onChange).toHaveBeenLastCalledWith(true);
        await userEvent.click(settings);
        await wait(150);
        expect(onChange).toHaveBeenLastCalledWith(false);
        expect(popoverBody()).toBeNull();

        await userEvent.click(settings);
        await wait(150);
        await userEvent.click(document.getElementById('outside')!);
        await wait(150);
        expect(onChange).toHaveBeenLastCalledWith(false);
        expect(popoverBody()).toBeNull();
    });

    it('opens the popover with the arrow keys, moves in it and closes it with Left', async () => {
        await mount(<CondensedHost />);
        row('Home').focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Settings');
        await userEvent.keyboard('{ArrowRight}');
        await wait(150);
        expect(focused()).toBe('Profile');
        expect(row('Profile').getAttribute('aria-level')).toBe('2');
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Security');
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Profile');
        await userEvent.keyboard('{Enter}');
        await wait();
        expect(row('Profile').getAttribute('aria-selected')).toBe('true');
        expect(row('Settings').getAttribute('aria-selected')).toBe('true');
        expect(popoverBody()).not.toBeNull();
        await userEvent.keyboard('{ArrowLeft}');
        await wait(150);
        expect(popoverBody()).toBeNull();
        expect(focused()).toBe('Settings');
        expect(row('Settings').getAttribute('aria-selected')).toBe('true');
    });

    it('mirrors Right and Left in RTL and opens the popover to the left', async () => {
        await mount(<CondensedHost rtl />);
        row('Settings').focus();
        await userEvent.keyboard('{ArrowRight}');
        await wait(150);
        expect(popoverBody()).toBeNull();
        await userEvent.keyboard('{ArrowLeft}');
        await wait(150);
        expect(focused()).toBe('Profile');
        const surface = popoverBody()!.closest('[data-side]')!;
        expect(surface.getAttribute('data-side')).toBe('left');
        await userEvent.keyboard('{ArrowRight}');
        await wait(150);
        expect(popoverBody()).toBeNull();
        expect(focused()).toBe('Settings');
    });

    it('builds the list from data, with popovers for the first level when condensed', async () => {
        const callback = vi.fn();
        const list: NestedListModel = {
            items: [
                { headerTitle: 'Header' },
                { link: { icon: 'home', title: 'Link 1', callback, href: '#link-1' } },
                {
                    expanded: true,
                    link: { icon: 'activate', title: 'Link 2' },
                    list: { textOnly: true, items: [{ link: { title: 'Sublink 1', selected: true } }] }
                }
            ]
        };
        const { screen } = await mount(<PreparedNestedList list={list} />);
        expect(document.querySelector('[data-nested-header]')!.textContent).toBe('Header');
        expect(row('Link 1').getAttribute('href')).toBe('#link-1');
        expect(row('Link 2').getAttribute('aria-expanded')).toBe('true');
        expect(row('Sublink 1').getAttribute('aria-selected')).toBe('true');
        expect(row('Sublink 1').closest('ul')!.hasAttribute('data-text-only')).toBe(true);
        await userEvent.click(row('Link 1'));
        expect(callback).toHaveBeenCalledTimes(1);
        expect(row('Link 1').getAttribute('aria-selected')).toBe('true');

        await screen.rerender(<PreparedNestedList list={list} condensed />);
        await wait();
        expect(row('Link 2').getAttribute('aria-haspopup')).toBe('tree');
        // the child list moved into the popover, open as the item was expanded
        await wait(150);
        expect(popoverBody()?.textContent).toContain('Sublink 1');
        expect(popoverBody()!.querySelector('ul')!.getAttribute('aria-label')).toBe('Link 2');
    });

    it('spreads native props, merges className and forwards refs', async () => {
        const listRef = createRef<HTMLUListElement>();
        const linkRef = createRef<HTMLAnchorElement>();
        const contentRef = createRef<HTMLDivElement>();
        const { root } = await mount(
            <NestedList ref={listRef} className="custom-list" data-testid="list" aria-label="Nav">
                <NestedListItem className="custom-item" data-testid="item">
                    <NestedListLink ref={linkRef} className="custom-link" href="#a">
                        <NestedListTitle className="custom-title">A</NestedListTitle>
                    </NestedListLink>
                </NestedListItem>
                <NestedListItem>
                    <NestedListContent ref={contentRef} className="custom-content">
                        <NestedListLink>
                            <NestedListTitle>B</NestedListTitle>
                        </NestedListLink>
                    </NestedListContent>
                </NestedListItem>
            </NestedList>
        );
        const list = root.querySelector('ul')!;
        expect(listRef.current).toBe(list);
        expect(list.className).toContain('custom-list');
        expect(list.className).toContain('list-none');
        expect(list.getAttribute('aria-label')).toBe('Nav');
        expect(root.querySelector('[data-testid=item]')!.className).toContain('custom-item');
        expect(linkRef.current).toBe(row('A'));
        expect(row('A').className).toContain('custom-link');
        expect(contentRef.current).toBe(row('B'));
        expect(row('B').className).toContain('custom-content');
        expect(root.querySelector('.custom-title')).not.toBeNull();
    });

    it('renders the link as another element with render', async () => {
        await mount(
            <NestedList>
                <NestedListItem>
                    <NestedListLink render={<button type="button" />}>
                        <NestedListTitle>As button</NestedListTitle>
                    </NestedListLink>
                </NestedListItem>
            </NestedList>
        );
        expect(row('As button').tagName).toBe('BUTTON');
        expect(row('As button').getAttribute('role')).toBe('treeitem');
    });

    it('indents further levels and uses the compact sizes in the compact density', async () => {
        const { screen } = await mount(<Host expanded />);
        expect(row('Home').getBoundingClientRect().height).toBe(44);
        expect(getComputedStyle(row('Profile')).paddingInlineStart).toBe('44px');
        await screen.rerender(
            <div data-density="compact">
                <Host expanded />
            </div>
        );
        await wait();
        expect(row('Home').getBoundingClientRect().height).toBe(32);
    });
});
