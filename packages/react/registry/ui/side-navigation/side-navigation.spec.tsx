import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef, useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    NestedList,
    NestedListContent,
    NestedListExpandIcon,
    NestedListHeader,
    NestedListIcon,
    NestedListItem,
    NestedListLink,
    NestedListPopover,
    NestedListTitle
} from '@/ui/nested-list/nested-list';
import {
    SideNavigation,
    SideNavigationMain,
    SideNavigationUtility,
    type SideNavigationModel,
    type SideNavigationProps
} from './side-navigation';

const wait = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
const row = (name: string) =>
    [...document.querySelectorAll<HTMLElement>('[role=treeitem]')].find(
        (el) => el.textContent?.trim() === name && el.offsetParent !== null
    )!;
const focused = () => document.activeElement?.textContent?.trim();

interface HostProps {
    condensed?: boolean;
    selectable?: boolean;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    selectedLink?: string;
    onChoose?: (name: string) => void;
}

/** Angular's spec host: Home and an expandable Settings in the main list, Help in the utility list. */
function Host({
    condensed = false,
    selectable = true,
    expanded,
    onExpandedChange,
    selectedLink = 'Home',
    onChoose
}: HostProps) {
    const settingsRow = (
        <NestedListContent>
            <NestedListLink>
                <NestedListTitle>Settings</NestedListTitle>
            </NestedListLink>
            <NestedListExpandIcon />
        </NestedListContent>
    );
    const settingsList = (textOnly: boolean) => (
        <NestedList textOnly={textOnly}>
            <NestedListItem>
                <NestedListLink onClick={() => onChoose?.('Profile')}>
                    <NestedListTitle>Profile</NestedListTitle>
                </NestedListLink>
            </NestedListItem>
            <NestedListItem>
                <NestedListLink>
                    <NestedListTitle>Security</NestedListTitle>
                </NestedListLink>
            </NestedListItem>
        </NestedList>
    );
    return (
        <SideNavigation condensed={condensed} selectable={selectable}>
            <SideNavigationMain>
                <NestedList>
                    <NestedListHeader>Overview</NestedListHeader>
                    <NestedListItem>
                        <NestedListLink selected={selectedLink === 'Home'} onClick={() => onChoose?.('Home')}>
                            <NestedListIcon glyph="home" />
                            <NestedListTitle>Home</NestedListTitle>
                        </NestedListLink>
                    </NestedListItem>
                    <NestedListItem expanded={expanded} onExpandedChange={onExpandedChange}>
                        {condensed ? (
                            <NestedListPopover>
                                {settingsRow}
                                {settingsList(false)}
                            </NestedListPopover>
                        ) : (
                            <>
                                {settingsRow}
                                {settingsList(true)}
                            </>
                        )}
                    </NestedListItem>
                </NestedList>
            </SideNavigationMain>
            <SideNavigationUtility>
                <NestedList>
                    <NestedListItem>
                        <NestedListLink selected={selectedLink === 'Help'}>
                            <NestedListTitle>Help</NestedListTitle>
                        </NestedListLink>
                    </NestedListItem>
                </NestedList>
            </SideNavigationUtility>
        </SideNavigation>
    );
}

/** The host with an expanded state of its own, as Angular's `[(expanded)]`; `expanded` reports it. */
function TwoWayHost({
    onExpanded,
    ...props
}: Omit<HostProps, 'expanded' | 'onExpandedChange'> & {
    onExpanded?: (v: boolean) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    return (
        <Host
            {...props}
            expanded={expanded}
            onExpandedChange={(v) => {
                setExpanded(v);
                onExpanded?.(v);
            }}
        />
    );
}

async function mount(ui: ReactNode) {
    const screen = await render(ui);
    await wait();
    return { screen, root: screen.container };
}

describe('SideNavigation', () => {
    it('renders trees of rows with levels, described by their group header', async () => {
        const { root } = await mount(<TwoWayHost />);
        const nav = root.querySelector('nav')!;
        expect(nav.getAttribute('aria-label')).toBe('Main Navigation');
        const tree = nav.querySelector('[role=tree]')!;
        expect(tree.getAttribute('aria-roledescription')).toBe('Navigation List Tree');
        const home = row('Home');
        expect(home.tagName).toBe('A');
        expect(home.getAttribute('aria-level')).toBe('1');
        expect(home.getAttribute('aria-describedby')).toBe(root.querySelector('[data-nested-header]')!.id);
        const settings = row('Settings');
        // the content row of an item with children is the row, not its link
        expect(settings.tagName).toBe('DIV');
        expect(settings.querySelector('a')!.tabIndex).toBe(-1);
        expect(settings.getAttribute('aria-expanded')).toBe('false');
        expect(root.querySelector('[role=group]')!.getAttribute('aria-hidden')).toBe('true');
    });

    it('expands with the button and the arrow keys and moves across all visible rows', async () => {
        const onExpanded = vi.fn();
        const { root } = await mount(<TwoWayHost onExpanded={onExpanded} />);
        await userEvent.click(root.querySelector<HTMLElement>('[data-slot=nested-list-expand-icon]')!);
        await wait();
        expect(onExpanded).toHaveBeenLastCalledWith(true);
        expect(row('Settings').getAttribute('aria-expanded')).toBe('true');
        row('Home').focus();
        await userEvent.keyboard('{ArrowDown}{ArrowDown}');
        expect(focused()).toBe('Profile');
        expect(row('Profile').getAttribute('aria-level')).toBe('2');
        await userEvent.keyboard('{End}');
        expect(focused()).toBe('Help');
        await userEvent.keyboard('{Home}{ArrowDown}{ArrowLeft}');
        await wait();
        expect(onExpanded).toHaveBeenLastCalledWith(false);
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Help');
        await userEvent.keyboard('{ArrowUp}{ArrowRight}');
        await wait();
        expect(onExpanded).toHaveBeenLastCalledWith(true);
    });

    it('selects the clicked row and highlights its parent', async () => {
        const onChoose = vi.fn();
        await mount(<Host expanded onChoose={onChoose} />);
        expect(row('Home').getAttribute('aria-selected')).toBe('true');
        await userEvent.click(row('Profile'));
        await wait();
        expect(onChoose).toHaveBeenLastCalledWith('Profile');
        expect(row('Profile').getAttribute('aria-selected')).toBe('true');
        expect(row('Settings').getAttribute('aria-selected')).toBe('true');
        expect(row('Home').getAttribute('aria-selected')).toBe('false');
    });

    it('keeps the selected props when items are not selectable', async () => {
        await mount(<Host selectable={false} />);
        await userEvent.click(row('Help'));
        await wait();
        expect(row('Home').getAttribute('aria-label')).toBe('Home, Selected');
        expect(row('Help').hasAttribute('aria-selected')).toBe(false);
    });

    it('opens child lists in popovers when condensed', async () => {
        const onExpanded = vi.fn();
        const onChoose = vi.fn();
        const { root } = await mount(<TwoWayHost condensed onExpanded={onExpanded} onChoose={onChoose} />);
        expect(root.querySelector('nav')!.className).toContain('w-16');
        expect(root.querySelector('nav')!.hasAttribute('data-condensed')).toBe(true);
        expect(root.querySelector<HTMLElement>('[data-nested-header]')!.className).toBe('hidden');
        expect(root.querySelector('[role=tree]')!.getAttribute('aria-roledescription')).toBe(
            'Navigation List Menu Bar'
        );
        row('Settings').focus();
        await userEvent.keyboard('{ArrowRight}');
        await wait(150);
        expect(onExpanded).toHaveBeenLastCalledWith(true);
        expect(focused()).toBe('Profile');
        await userEvent.keyboard('{Enter}');
        expect(onChoose).toHaveBeenLastCalledWith('Profile');
        await userEvent.keyboard('{ArrowLeft}');
        await wait(150);
        expect(onExpanded).toHaveBeenLastCalledWith(false);
        expect(focused()).toBe('Settings');
    });

    it('builds the navigation from data', async () => {
        const chosen = vi.fn();
        const config: SideNavigationModel = {
            mainNavigation: {
                items: [
                    { headerTitle: 'Header' },
                    { link: { icon: 'home', title: 'Link 1', callback: () => chosen('Link 1') } },
                    {
                        expanded: true,
                        link: { icon: 'activate', title: 'Link 2' },
                        list: {
                            textOnly: true,
                            items: [{ link: { title: 'Sublink', callback: () => chosen('Sublink') } }]
                        }
                    }
                ]
            },
            utilityNavigation: { items: [{ link: { icon: 'log', title: 'Sign Out' } }] }
        };
        const { root, screen } = await mount(<SideNavigation sideNavigationConfiguration={config} />);
        expect(root.querySelector('[data-nested-header]')!.textContent!.trim()).toBe('Header');
        expect(row('Link 2').getAttribute('aria-expanded')).toBe('true');
        await userEvent.click(row('Sublink'));
        expect(chosen).toHaveBeenLastCalledWith('Sublink');
        expect(row('Sign Out').closest('[data-slot=side-navigation-utility]')).not.toBeNull();
        expect(row('Link 1').closest('[data-slot=side-navigation-main]')).not.toBeNull();

        // the model's condensed flag condenses it too
        await screen.rerender(<SideNavigation sideNavigationConfiguration={{ ...config, condensed: true }} />);
        await wait(150);
        expect(root.querySelector('nav')!.className).toContain('w-16');
        expect(row('Link 2').getAttribute('aria-haspopup')).toBe('tree');
    });

    it('mirrors the arrow keys that expand and collapse in RTL', async () => {
        const onExpanded = vi.fn();
        await mount(
            <DirectionProvider direction="rtl">
                <div dir="rtl">
                    <TwoWayHost onExpanded={onExpanded} />
                </div>
            </DirectionProvider>
        );
        row('Settings').focus();
        await userEvent.keyboard('{ArrowRight}');
        await wait();
        expect(onExpanded).not.toHaveBeenCalled();
        await userEvent.keyboard('{ArrowLeft}');
        await wait();
        expect(onExpanded).toHaveBeenLastCalledWith(true);
        expect(row('Settings').getAttribute('aria-expanded')).toBe('true');
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Profile');
        await userEvent.keyboard('{ArrowUp}{ArrowRight}');
        await wait();
        expect(onExpanded).toHaveBeenLastCalledWith(false);
        expect(row('Settings').getAttribute('aria-expanded')).toBe('false');
    });

    it('opens and closes the child list when expanded changes from outside', async () => {
        const { root, screen } = await mount(<Host expanded={false} />);
        const group = root.querySelector('[role=group]')!;
        await screen.rerender(<Host expanded />);
        await wait();
        expect(row('Settings').getAttribute('aria-expanded')).toBe('true');
        expect(group.hasAttribute('aria-hidden')).toBe(false);
        expect(row('Profile')).toBeTruthy();
        await screen.rerender(<Host expanded={false} />);
        await wait();
        expect(row('Settings').getAttribute('aria-expanded')).toBe('false');
        expect(group.getAttribute('aria-hidden')).toBe('true');
        expect(row('Profile')).toBeUndefined();
    });

    it('moves the selection when selected changes from outside and items are not selectable', async () => {
        const { screen } = await mount(<Host selectable={false} />);
        expect(row('Home').getAttribute('aria-label')).toBe('Home, Selected');
        expect(row('Help').getAttribute('aria-label')).toBe('Help');
        await screen.rerender(<Host selectable={false} selectedLink="Help" />);
        await wait();
        expect(row('Home').getAttribute('aria-label')).toBe('Home');
        expect(row('Help').getAttribute('aria-label')).toBe('Help, Selected');
        expect(row('Help').className).toContain('border-b-sap-list-selection-border-color');
        expect(row('Home').className).not.toContain('border-b-sap-list-selection-border-color');
    });

    it('moves from the main list into the utility list and back with the arrow keys', async () => {
        await mount(<Host />);
        row('Settings').focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Help');
        expect(document.activeElement!.closest('[data-slot=side-navigation-utility]')).not.toBeNull();
        await userEvent.keyboard('{ArrowUp}');
        expect(focused()).toBe('Settings');
        expect(document.activeElement!.closest('[data-slot=side-navigation-main]')).not.toBeNull();
        await userEvent.keyboard('{End}{ArrowDown}');
        expect(focused()).toBe('Home');
    });

    it('expands the items of the expand buttons independently and selects clicked sub links', async () => {
        // fundamental-react's "handle side nav list link click" and "handle side nav sub link click"
        const sub = (title: string, children: string[]) => (
            <NestedListItem>
                <NestedListContent>
                    <NestedListLink href="#">
                        <NestedListTitle>{title}</NestedListTitle>
                    </NestedListLink>
                    <NestedListExpandIcon />
                </NestedListContent>
                <NestedList textOnly>
                    {children.map((child) => (
                        <NestedListItem key={child}>
                            <NestedListLink href="#">
                                <NestedListTitle>{child}</NestedListTitle>
                            </NestedListLink>
                        </NestedListItem>
                    ))}
                </NestedList>
            </NestedListItem>
        );
        const { root } = await mount(
            <SideNavigation>
                <SideNavigationMain>
                    <NestedList textOnly>
                        {sub('Link Item 2', ['Item 21', 'Item 25'])}
                        {sub('Link Item 4', ['Item 41'])}
                    </NestedList>
                </SideNavigationMain>
            </SideNavigation>
        );
        const buttons = root.querySelectorAll<HTMLElement>('[data-slot=nested-list-expand-icon]');
        expect(row('Link Item 2').getAttribute('aria-expanded')).toBe('false');
        expect(root.querySelector('[aria-selected=true]')).toBeNull();
        await userEvent.click(buttons[0]!);
        await wait();
        expect(row('Link Item 2').getAttribute('aria-expanded')).toBe('true');
        expect(row('Link Item 4').getAttribute('aria-expanded')).toBe('false');
        await userEvent.click(buttons[1]!);
        await wait();
        expect(row('Link Item 2').getAttribute('aria-expanded')).toBe('true');
        expect(row('Link Item 4').getAttribute('aria-expanded')).toBe('true');
        await userEvent.click(row('Item 21'));
        await wait();
        expect(row('Item 21').getAttribute('aria-selected')).toBe('true');
        await userEvent.click(row('Item 25'));
        await wait();
        expect(row('Item 25').getAttribute('aria-selected')).toBe('true');
        expect(row('Item 21').getAttribute('aria-selected')).toBe('false');
    });

    it('calls the onClick of a link with the event when it is selected', async () => {
        // fundamental-react's onItemSelect: the link's own click handler, with the event
        const onClick = vi.fn();
        await mount(
            <SideNavigation>
                <NestedList>
                    <NestedListItem id="item-1">
                        <NestedListLink href="#" onClick={onClick}>
                            <NestedListTitle>Link Item 1</NestedListTitle>
                        </NestedListLink>
                    </NestedListItem>
                </NestedList>
            </SideNavigation>
        );
        await userEvent.click(document.querySelector<HTMLElement>('#item-1 a')!);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ target: expect.anything() }));
    });

    it('condenses while the window is at most collapseWidth wide', async () => {
        const props: SideNavigationProps = { 'aria-label': 'Navigation' };
        const { root, screen } = await mount(<SideNavigation {...props} collapseWidth={100000} />);
        const nav = root.querySelector('nav')!;
        expect(nav.getAttribute('aria-label')).toBe('Navigation');
        expect(nav.className).toContain('w-16');
        await screen.rerender(<SideNavigation {...props} collapseWidth={1} />);
        await wait();
        expect(nav.className).toContain('w-full');
        window.dispatchEvent(new Event('resize'));
        await wait();
        expect(nav.className).toContain('w-full');
        await screen.rerender(<SideNavigation {...props} />);
        expect(nav.className).toContain('w-full');
    });

    it('renders a skip link before the lists, outside the arrow-key rows', async () => {
        const { root } = await mount(
            <SideNavigation skipLink={{ href: '#content', label: 'Skip navigation' }}>
                <NestedList>
                    <NestedListItem>
                        <NestedListLink href="#">
                            <NestedListTitle>Link Item</NestedListTitle>
                        </NestedListLink>
                    </NestedListItem>
                </NestedList>
            </SideNavigation>
        );
        const skip = root.querySelector<HTMLAnchorElement>('[data-slot=side-navigation-skip-link]')!;
        expect(root.querySelector('nav')!.firstElementChild).toBe(skip);
        expect(skip.getAttribute('href')).toBe('#content');
        expect(skip.textContent).toBe('Skip navigation');
        expect(skip.getBoundingClientRect().width).toBeLessThanOrEqual(1);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(skip);
        expect(skip.getBoundingClientRect().width).toBeGreaterThan(1);
        await userEvent.keyboard('{Tab}');
        expect(focused()).toBe('Link Item');
        await userEvent.keyboard('{ArrowDown}{ArrowUp}');
        expect(focused()).toBe('Link Item');
    });

    it('spreads native props, merges className and forwards refs', async () => {
        const navRef = createRef<HTMLElement>();
        const mainRef = createRef<HTMLDivElement>();
        const utilityRef = createRef<HTMLDivElement>();
        const { root } = await mount(
            <SideNavigation ref={navRef} className="custom-nav" data-sample="Sample" id="nav">
                <SideNavigationMain ref={mainRef} className="custom-main" data-sample="Main">
                    <NestedList data-sample="List">
                        <NestedListHeader data-sample="Header">Group Title</NestedListHeader>
                        <NestedListItem data-sample="Item">
                            <NestedListLink>
                                <NestedListTitle>A</NestedListTitle>
                            </NestedListLink>
                        </NestedListItem>
                    </NestedList>
                </SideNavigationMain>
                <SideNavigationUtility ref={utilityRef} className="custom-utility" data-sample="Utility" />
            </SideNavigation>
        );
        const nav = root.querySelector('nav')!;
        expect(navRef.current).toBe(nav);
        expect(nav.id).toBe('nav');
        expect(nav.getAttribute('data-sample')).toBe('Sample');
        expect(nav.className).toContain('custom-nav');
        expect(nav.className).toContain('flex-col');
        expect(mainRef.current!.getAttribute('data-sample')).toBe('Main');
        expect(mainRef.current!.className).toContain('custom-main');
        expect(mainRef.current!.className).toContain('overflow-y-auto');
        expect(utilityRef.current!.getAttribute('data-sample')).toBe('Utility');
        expect(utilityRef.current!.className).toContain('custom-utility');
        // fundamental-react's SideNavList, its title and SideNavListItem spread props too
        expect(root.querySelector('ul')!.getAttribute('data-sample')).toBe('List');
        const header = root.querySelector('[data-nested-header]')!;
        expect(header.tagName).toBe('LI');
        expect(header.getAttribute('data-sample')).toBe('Header');
        expect(root.querySelector('li[data-nested-item]')!.getAttribute('data-sample')).toBe('Item');
    });

    it('lays the main list out above the utility list, the main list scrolling', async () => {
        const items = Array.from({ length: 20 }, (_, i) => `Link ${i + 1}`);
        const { root } = await mount(
            <div style={{ height: '20rem' }}>
                <SideNavigation>
                    <SideNavigationMain>
                        <NestedList>
                            {items.map((item) => (
                                <NestedListItem key={item}>
                                    <NestedListLink>
                                        <NestedListTitle>{item}</NestedListTitle>
                                    </NestedListLink>
                                </NestedListItem>
                            ))}
                        </NestedList>
                    </SideNavigationMain>
                    <SideNavigationUtility>
                        <NestedList>
                            <NestedListItem>
                                <NestedListLink>
                                    <NestedListTitle>Help</NestedListTitle>
                                </NestedListLink>
                            </NestedListItem>
                        </NestedList>
                    </SideNavigationUtility>
                </SideNavigation>
            </div>
        );
        const nav = root.querySelector('nav')!.getBoundingClientRect();
        const main = root.querySelector<HTMLElement>('[data-slot=side-navigation-main]')!;
        const utility = root.querySelector('[data-slot=side-navigation-utility]')!.getBoundingClientRect();
        expect(nav.height).toBe(320);
        expect(Math.round(utility.bottom)).toBe(Math.round(nav.bottom));
        expect(main.scrollHeight).toBeGreaterThan(main.clientHeight);
        expect(getComputedStyle(root.querySelector('nav')!).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });
});
