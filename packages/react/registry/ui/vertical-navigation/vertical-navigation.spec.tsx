import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    ListNavigationItem,
    ListNavigationItemArrow,
    ListNavigationItemIcon,
    ListNavigationItemList,
    ListNavigationItemText,
    VerticalNavigation,
    VerticalNavigationGroupHeader
} from './vertical-navigation';

const wait = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
const item = (name: string) =>
    [...document.querySelectorAll<HTMLElement>('[role=treeitem]')].find(
        (el) => el.querySelector('[data-slot=list-navigation-item-text]')!.textContent!.trim() === name
    )!;
const focusedName = () =>
    (document.activeElement as HTMLElement).querySelector('[data-slot=list-navigation-item-text]')?.textContent?.trim();
const nav = () => document.querySelector<HTMLElement>('nav[data-slot=vertical-navigation]')!;

interface HostProps {
    condensed?: boolean;
    /** Controls Calendar's `expanded`; otherwise it is uncontrolled. */
    controlled?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    onOverview?: () => void;
}

/** Angular's spec host: Overview, an expandable Calendar with Today (current) and Upcoming, a header and Support. */
function Host({ condensed = false, controlled = true, onExpandedChange, onOverview }: HostProps) {
    const [expanded, setExpanded] = useState(false);
    const [current, setCurrent] = useState('Today');
    return (
        <>
            <VerticalNavigation condensed={condensed}>
                <ListNavigationItem onClick={onOverview}>
                    <ListNavigationItemIcon glyph="home" />
                    <ListNavigationItemText>Overview</ListNavigationItemText>
                </ListNavigationItem>
                <ListNavigationItem
                    expanded={controlled ? expanded : undefined}
                    onExpandedChange={(next) => {
                        setExpanded(next);
                        onExpandedChange?.(next);
                    }}
                >
                    <ListNavigationItemIcon glyph="calendar" />
                    <ListNavigationItemText>Calendar</ListNavigationItemText>
                    <ListNavigationItemArrow />
                    <ul>
                        <ListNavigationItem indicated={current === 'Today'} onClick={() => setCurrent('Today')}>
                            <ListNavigationItemText>Today</ListNavigationItemText>
                        </ListNavigationItem>
                        <ListNavigationItem>
                            <ListNavigationItemText>Upcoming</ListNavigationItemText>
                        </ListNavigationItem>
                    </ul>
                </ListNavigationItem>
                <VerticalNavigationGroupHeader>Services</VerticalNavigationGroupHeader>
                <ListNavigationItem>
                    <ListNavigationItemIcon glyph="headset" />
                    <ListNavigationItemText>Support</ListNavigationItemText>
                </ListNavigationItem>
            </VerticalNavigation>
            <output data-testid="expanded">{String(expanded)}</output>
        </>
    );
}

const expandedState = () => document.querySelector('[data-testid=expanded]')!.textContent === 'true';

async function setup(props: HostProps = {}) {
    const screen = await render(<Host {...props} />);
    await wait();
    return screen;
}

describe('VerticalNavigation', () => {
    it('renders a tree with one tab stop and second-level groups', async () => {
        await setup();
        expect(nav().getAttribute('aria-label')).toBe('Main Navigation');
        expect(nav().querySelector('[role=tree]')).not.toBeNull();
        expect(item('Overview').tabIndex).toBe(0);
        expect(item('Calendar').tabIndex).toBe(-1);
        expect(item('Calendar').getAttribute('aria-expanded')).toBe('false');
        expect(item('Overview').hasAttribute('aria-expanded')).toBe(false);
        expect(item('Overview').getAttribute('aria-level')).toBe('1');
        expect(item('Today').getAttribute('aria-level')).toBe('2');
        expect(item('Calendar').querySelector('ul')!.getAttribute('role')).toBe('group');
    });

    it('gives each text an id of its item', async () => {
        await setup();
        const text = item('Calendar').querySelector('[data-slot=list-navigation-item-text]')!;
        expect(text.id).toBe(`${item('Calendar').id}-text`);
    });

    it('marks the current page, and its collapsed parent with the indicator', async () => {
        await setup();
        expect(item('Today').getAttribute('aria-selected')).toBe('true');
        expect(item('Overview').getAttribute('aria-selected')).toBe('false');
        const indicator = ':scope > [data-slot=list-navigation-item-indicator]';
        expect(item('Calendar').querySelector(indicator)).not.toBeNull();
        await userEvent.click(item('Calendar'));
        await wait();
        // expanded, the indicator moves to the current child
        expect(item('Calendar').querySelector(indicator)).toBeNull();
        expect(item('Today').querySelector(indicator)).not.toBeNull();
    });

    it('moves between visible items and expands with the arrow keys', async () => {
        await setup();
        item('Overview').focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(focusedName()).toBe('Calendar');
        await userEvent.keyboard('{ArrowDown}');
        expect(focusedName()).toBe('Support');
        await userEvent.keyboard('{ArrowUp}{ArrowRight}');
        await wait();
        expect(expandedState()).toBe(true);
        expect(focusedName()).toBe('Today');
        await userEvent.keyboard('{ArrowDown}');
        expect(focusedName()).toBe('Upcoming');
        await userEvent.keyboard('{ArrowLeft}');
        await wait();
        expect(expandedState()).toBe(false);
        expect(focusedName()).toBe('Calendar');
        await userEvent.keyboard('{End}');
        expect(focusedName()).toBe('Support');
        await userEvent.keyboard('{Home}');
        expect(focusedName()).toBe('Overview');
        // no wrapping at the ends
        await userEvent.keyboard('{ArrowUp}');
        expect(focusedName()).toBe('Overview');
    });

    it('toggles with clicks, Enter and Space', async () => {
        const onOverview = vi.fn();
        await setup({ onOverview });
        await userEvent.click(item('Calendar'));
        await wait();
        expect(expandedState()).toBe(true);
        await userEvent.click(item('Upcoming'));
        expect(expandedState()).toBe(true);
        item('Calendar').focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        expect(expandedState()).toBe(false);
        await userEvent.keyboard(' ');
        await wait();
        expect(expandedState()).toBe(true);
        // Enter on an item without children activates it
        item('Overview').focus();
        await userEvent.keyboard('{Enter}');
        expect(onOverview).toHaveBeenCalledTimes(1);
    });

    it('works uncontrolled, reporting expanded changes', async () => {
        const onExpandedChange = vi.fn();
        await setup({ controlled: false, onExpandedChange });
        await userEvent.click(item('Calendar'));
        await wait();
        expect(onExpandedChange).toHaveBeenLastCalledWith(true);
        expect(item('Calendar').getAttribute('aria-expanded')).toBe('true');
        expect(focusedName()).toBe('Today');
    });

    it('shows icons only when condensed and opens second-level items in a panel', async () => {
        await setup({ condensed: true });
        expect(nav().className).toContain('w-[3.25rem]');
        expect(item('Overview').querySelector('[data-slot=list-navigation-item-text]')!.className).toContain(
            'sr-only-sap'
        );
        item('Calendar').focus();
        await userEvent.keyboard('{ArrowRight}');
        await wait();
        expect(expandedState()).toBe(true);
        expect(focusedName()).toBe('Today');
        // the panel shows the parent's text, and the parent leaves the arrow-key rows
        expect(item('Calendar').querySelector('[data-slot=list-navigation-item-text]')!.className).not.toContain(
            'sr-only-sap'
        );
        expect(item('Calendar').hasAttribute('data-focusable')).toBe(false);
        await userEvent.keyboard('{Escape}');
        await wait();
        expect(expandedState()).toBe(false);
        expect(focusedName()).toBe('Calendar');
        await userEvent.click(item('Calendar'));
        await wait();
        expect(expandedState()).toBe(true);
        document.body.click();
        await wait();
        expect(expandedState()).toBe(false);
    });

    it('Right and Left are mirrored in RTL', async () => {
        await render(
            <DirectionProvider direction="rtl">
                <div dir="rtl">
                    <Host />
                </div>
            </DirectionProvider>
        );
        await wait();
        item('Calendar').focus();
        await userEvent.keyboard('{ArrowRight}');
        await wait();
        expect(expandedState()).toBe(false);
        expect(focusedName()).toBe('Calendar');
        await userEvent.keyboard('{ArrowLeft}');
        await wait();
        expect(expandedState()).toBe(true);
        expect(focusedName()).toBe('Today');
        await userEvent.keyboard('{ArrowRight}');
        await wait();
        expect(expandedState()).toBe(false);
        expect(focusedName()).toBe('Calendar');
    });

    it('group headers are not focusable and are skipped by the arrow keys', async () => {
        await setup();
        const header = document.querySelector<HTMLElement>('[data-slot=vertical-navigation-group-header]')!;
        expect(header.getAttribute('role')).toBe('none');
        expect(header.hasAttribute('tabindex')).toBe(false);
        item('Calendar').focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(focusedName()).toBe('Support');
        await userEvent.keyboard('{ArrowUp}');
        expect(focusedName()).toBe('Calendar');
        // the header is not in the tab order either: Tab leaves the tree
        await userEvent.keyboard('{ArrowDown}');
        await userEvent.tab({ shift: true });
        expect(document.activeElement).not.toBe(header);
        expect(nav().contains(document.activeElement)).toBe(false);
    });

    it('switching condensed at runtime keeps the current item and tab stop', async () => {
        const screen = await setup();
        item('Overview').focus();
        await userEvent.keyboard('{End}');
        expect(focusedName()).toBe('Support');
        const support = item('Support');
        const tabStops = () =>
            [...nav().querySelectorAll<HTMLElement>('[role=treeitem]')].filter((i) => i.tabIndex === 0);
        expect(tabStops()).toEqual([support]);
        await screen.rerender(<Host condensed />);
        await wait();
        expect(nav().className).toContain('w-[3.25rem]');
        expect(item('Support')).toBe(support);
        expect(document.activeElement).toBe(support);
        expect(tabStops()).toEqual([support]);
        await screen.rerender(<Host />);
        await wait();
        expect(nav().className).toContain('w-60');
        expect(document.activeElement).toBe(support);
        expect(tabStops()).toEqual([support]);
        await userEvent.keyboard('{ArrowUp}');
        expect(focusedName()).toBe('Calendar');
    });

    it('moves the tab stop to a visible item when the current one is hidden', async () => {
        await setup({ controlled: false });
        await userEvent.click(item('Calendar'));
        await wait();
        await userEvent.click(item('Upcoming'));
        expect(item('Upcoming').tabIndex).toBe(0);
        item('Calendar').focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        expect(item('Calendar').tabIndex).toBe(0);
        expect(item('Upcoming').tabIndex).toBe(-1);
    });

    it('takes second-level items in a ListNavigationItemList', async () => {
        await render(
            <VerticalNavigation>
                <ListNavigationItem defaultExpanded>
                    <ListNavigationItemText>Calendar</ListNavigationItemText>
                    <ListNavigationItemList>
                        <ListNavigationItem>
                            <ListNavigationItemText>Today</ListNavigationItemText>
                        </ListNavigationItem>
                    </ListNavigationItemList>
                </ListNavigationItem>
            </VerticalNavigation>
        );
        await wait();
        // expandable by its child items, without an arrow
        expect(item('Calendar').getAttribute('aria-expanded')).toBe('true');
        expect(item('Calendar').querySelector('[data-slot=list-navigation-item-list]')!.getAttribute('role')).toBe(
            'group'
        );
        expect(item('Today').offsetParent).not.toBeNull();
    });

    it('spreads native props, merges className and forwards refs', async () => {
        const navRef = createRef<HTMLElement>();
        const itemRef = createRef<HTMLLIElement>();
        const listRef = createRef<HTMLUListElement>();
        const textRef = createRef<HTMLSpanElement>();
        const arrowRef = createRef<HTMLButtonElement>();
        const headerRef = createRef<HTMLLIElement>();
        await render(
            <VerticalNavigation ref={navRef} aria-label="Pages" className="custom-nav" data-testid="nav">
                <VerticalNavigationGroupHeader ref={headerRef} className="custom-header" data-x="header">
                    Group
                </VerticalNavigationGroupHeader>
                <ListNavigationItem ref={itemRef} className="custom-item" data-x="item" id="calendar">
                    <ListNavigationItemIcon glyph="calendar" className="custom-icon" />
                    <ListNavigationItemText ref={textRef} className="custom-text">
                        Calendar
                    </ListNavigationItemText>
                    <ListNavigationItemArrow ref={arrowRef} className="custom-arrow" />
                    <ListNavigationItemList ref={listRef} className="custom-list" />
                </ListNavigationItem>
            </VerticalNavigation>
        );
        await wait();
        expect(navRef.current).toBe(nav());
        expect(nav().getAttribute('aria-label')).toBe('Pages');
        expect(nav().dataset['testid']).toBe('nav');
        expect(nav().className).toContain('custom-nav');
        expect(nav().className).toContain('w-60');
        expect(itemRef.current!.id).toBe('calendar');
        expect(itemRef.current!.dataset['x']).toBe('item');
        expect(itemRef.current!.className).toContain('custom-item');
        expect(itemRef.current!.querySelector('.custom-icon')).not.toBeNull();
        expect(textRef.current!.className).toContain('custom-text');
        expect(arrowRef.current!.className).toContain('custom-arrow');
        expect(arrowRef.current!.getAttribute('aria-hidden')).toBe('true');
        expect(arrowRef.current!.tabIndex).toBe(-1);
        expect(listRef.current!.className).toContain('custom-list');
        expect(headerRef.current!.dataset['x']).toBe('header');
        expect(headerRef.current!.className).toContain('custom-header');
    });
});
