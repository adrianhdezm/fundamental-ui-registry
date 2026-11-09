import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Icon } from '@/ui/icon/icon';
import {
    ListNavigationItem,
    ListNavigationItemArrow,
    ListNavigationItemText,
    VerticalNavigation,
    VerticalNavigationGroupHeader
} from './vertical-navigation';

@Component({
    imports: [
        VerticalNavigation,
        VerticalNavigationGroupHeader,
        ListNavigationItem,
        ListNavigationItemText,
        ListNavigationItemArrow,
        Icon
    ],
    template: `
        <fd-vertical-navigation [condensed]="condensed()">
            <li fd-list-navigation-item (click)="current.set('Overview')">
                <fd-icon glyph="home" /><span fd-list-navigation-item-text>Overview</span>
            </li>
            <li fd-list-navigation-item [(expanded)]="expanded">
                <fd-icon glyph="calendar" /><span fd-list-navigation-item-text>Calendar</span>
                <button fd-list-navigation-item-arrow></button>
                <ul>
                    <li fd-list-navigation-item [indicated]="current() === 'Today'" (click)="current.set('Today')">
                        <span fd-list-navigation-item-text>Today</span>
                    </li>
                    <li fd-list-navigation-item><span fd-list-navigation-item-text>Upcoming</span></li>
                </ul>
            </li>
            <li fd-vertical-navigation-group-header>Services</li>
            <li fd-list-navigation-item>
                <fd-icon glyph="headset" /><span fd-list-navigation-item-text>Support</span>
            </li>
        </fd-vertical-navigation>
    `
})
class Host {
    readonly condensed = signal(false);
    readonly expanded = signal(false);
    readonly current = signal('Today');
}

const wait = (ms = 50) => new Promise((r) => setTimeout(r, ms));
const item = (name: string) =>
    [...document.querySelectorAll<HTMLElement>('[role=treeitem]')].find(
        (el) => el.querySelector('[fd-list-navigation-item-text]')!.textContent!.trim() === name
    )!;
const focusedName = () =>
    (document.activeElement as HTMLElement).querySelector('[fd-list-navigation-item-text]')?.textContent?.trim();

async function setup(condensed = false) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.condensed.set(condensed);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await wait();
    return { fixture, host: fixture.componentInstance, root: fixture.nativeElement as HTMLElement };
}

describe('VerticalNavigation', () => {
    afterEach(() => document.documentElement.removeAttribute('dir'));

    it('renders a tree with one tab stop and second-level groups', async () => {
        const { root } = await setup();
        expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Main Navigation');
        expect(root.querySelector('[role=tree]')).not.toBeNull();
        expect(item('Overview').tabIndex).toBe(0);
        expect(item('Calendar').tabIndex).toBe(-1);
        expect(item('Calendar').getAttribute('aria-expanded')).toBe('false');
        expect(item('Today').getAttribute('aria-level')).toBe('2');
        expect(item('Calendar').querySelector('ul')!.getAttribute('role')).toBe('group');
    });

    it('marks the current page, and its collapsed parent with the indicator', async () => {
        await setup();
        expect(item('Today').getAttribute('aria-selected')).toBe('true');
        expect(item('Calendar').querySelector(':scope > span.bg-sap-selected-color')).not.toBeNull();
    });

    it('moves between visible items and expands with the arrow keys', async () => {
        const { host } = await setup();
        item('Overview').focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(focusedName()).toBe('Calendar');
        await userEvent.keyboard('{ArrowDown}');
        expect(focusedName()).toBe('Support');
        await userEvent.keyboard('{ArrowUp}{ArrowRight}');
        await wait();
        expect(host.expanded()).toBe(true);
        expect(focusedName()).toBe('Today');
        await userEvent.keyboard('{ArrowDown}');
        expect(focusedName()).toBe('Upcoming');
        await userEvent.keyboard('{ArrowLeft}');
        await wait();
        expect(host.expanded()).toBe(false);
        expect(focusedName()).toBe('Calendar');
        await userEvent.keyboard('{End}');
        expect(focusedName()).toBe('Support');
    });

    it('toggles with clicks, Enter and Space', async () => {
        const { host } = await setup();
        await userEvent.click(item('Calendar'));
        await wait();
        expect(host.expanded()).toBe(true);
        await userEvent.click(item('Upcoming'));
        expect(host.expanded()).toBe(true);
        item('Calendar').focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        expect(host.expanded()).toBe(false);
        await userEvent.keyboard(' ');
        await wait();
        expect(host.expanded()).toBe(true);
    });

    it('shows icons only when condensed and opens second-level items in a panel', async () => {
        const { host, root } = await setup(true);
        expect(root.querySelector('fd-vertical-navigation > div')!.className).toContain('w-[3.25rem]');
        expect(item('Overview').querySelector('[fd-list-navigation-item-text]')!.className).toContain('sr-only-sap');
        item('Calendar').focus();
        await userEvent.keyboard('{ArrowRight}');
        await wait();
        expect(host.expanded()).toBe(true);
        expect(focusedName()).toBe('Today');
        await userEvent.keyboard('{Escape}');
        await wait();
        expect(host.expanded()).toBe(false);
        expect(focusedName()).toBe('Calendar');
        await userEvent.click(item('Calendar'));
        await wait();
        expect(host.expanded()).toBe(true);
        document.body.click();
        await wait();
        expect(host.expanded()).toBe(false);
    });

    it('Right and Left are mirrored in RTL', async () => {
        document.documentElement.setAttribute('dir', 'rtl');
        const { host } = await setup();
        item('Calendar').focus();
        await userEvent.keyboard('{ArrowRight}');
        await wait();
        expect(host.expanded()).toBe(false);
        expect(focusedName()).toBe('Calendar');
        await userEvent.keyboard('{ArrowLeft}');
        await wait();
        expect(host.expanded()).toBe(true);
        expect(focusedName()).toBe('Today');
        await userEvent.keyboard('{ArrowRight}');
        await wait();
        expect(host.expanded()).toBe(false);
        expect(focusedName()).toBe('Calendar');
    });

    it('group headers are not focusable and are skipped by the arrow keys', async () => {
        const { root } = await setup();
        const header = root.querySelector<HTMLElement>('[fd-vertical-navigation-group-header]')!;
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
        expect(root.contains(document.activeElement)).toBe(false);
    });

    it('switching condensed at runtime keeps the current item and tab stop', async () => {
        const { fixture, host, root } = await setup();
        item('Overview').focus();
        await userEvent.keyboard('{End}');
        expect(focusedName()).toBe('Support');
        const support = item('Support');
        const tabStops = () =>
            [...root.querySelectorAll<HTMLElement>('[role=treeitem]')].filter((i) => i.tabIndex === 0);
        expect(tabStops()).toEqual([support]);
        host.condensed.set(true);
        await fixture.whenStable();
        await wait();
        expect(root.querySelector('fd-vertical-navigation > div')!.className).toContain('w-[3.25rem]');
        expect(item('Support')).toBe(support);
        expect(document.activeElement).toBe(support);
        expect(tabStops()).toEqual([support]);
        host.condensed.set(false);
        await fixture.whenStable();
        await wait();
        expect(root.querySelector('fd-vertical-navigation > div')!.className).toContain('w-60');
        expect(document.activeElement).toBe(support);
        expect(tabStops()).toEqual([support]);
        await userEvent.keyboard('{ArrowUp}');
        expect(focusedName()).toBe('Calendar');
    });
});

describe('VerticalNavigation issues', () => {
    afterEach(() => document.querySelectorAll('fd-vertical-navigation').forEach((el) => el.remove()));

    /** The computed value of a theme variable for a CSS property. */
    const themed = (property: 'color' | 'fontSize' | 'borderTopLeftRadius', value: string) => {
        const probe = document.createElement('div');
        probe.style[property] = value;
        document.body.appendChild(probe);
        const computed = getComputedStyle(probe)[property];
        probe.remove();
        return computed;
    };
    const text = (name: string) => item(name).querySelector<HTMLElement>('[fd-list-navigation-item-text]')!;
    const textStart = (name: string) =>
        text(name).getBoundingClientRect().left + parseFloat(getComputedStyle(text(name)).paddingLeft);

    it('lines first-level texts up with the second-level ones, 0.25rem after the icon (vertical-navigation-1)', async () => {
        const { fixture, host } = await setup();
        host.expanded.set(true);
        await fixture.whenStable();
        const icon = item('Overview').querySelector('fd-icon')!;
        expect(getComputedStyle(icon).marginInlineEnd).toBe('4px');
        expect(textStart('Overview')).toBe(textStart('Today'));
    });

    it('shows the group header as a list group header title (vertical-navigation-2)', async () => {
        const { root } = await setup();
        const header = root.querySelector<HTMLElement>('[fd-vertical-navigation-group-header]')!;
        const title = header.querySelector<HTMLElement>(':scope > span')!;
        expect(title.textContent!.trim()).toBe('Services');
        const style = getComputedStyle(title);
        expect([style.fontSize, style.lineHeight, style.color]).toEqual([
            themed('fontSize', 'var(--sapFontHeader6Size)'),
            '32px',
            themed('color', 'var(--sapList_TableGroupHeaderTextColor)')
        ]);
        expect([getComputedStyle(header).paddingLeft, getComputedStyle(header).paddingBottom]).toEqual(['15px', '0px']);
    });

    it('lays the condensed panel out as fundamental-styles (vertical-navigation-3)', async () => {
        const { fixture, host } = await setup(true);
        host.expanded.set(true);
        await fixture.whenStable();
        await wait();
        const parent = item('Calendar');
        const header = parent.querySelector<HTMLElement>(':scope > div > div')!;
        const icon = header.querySelector<HTMLElement>('fd-icon')!;
        expect(getComputedStyle(header).paddingInlineStart).toBe('0px');
        expect(getComputedStyle(icon).paddingInlineStart).toBe('14px');
        expect(getComputedStyle(text('Calendar')).fontSize).toBe(themed('fontSize', 'var(--sapFontSize)'));
        expect(getComputedStyle(item('Today')).paddingInlineStart).toBe('0px');
        expect(getComputedStyle(header).borderTopLeftRadius).toBe(
            themed('borderTopLeftRadius', 'var(--sapPopover_BorderCornerRadius)')
        );
        expect(header.getBoundingClientRect().height).toBe(43);
    });

    it('sets the vertical nav text style on the column (vertical-navigation-4)', async () => {
        const fixture = TestBed.createComponent(Host);
        const root = fixture.nativeElement as HTMLElement;
        // a page text style the column must not take (Tailwind's preflight sets a 1.5 line height on html)
        Object.assign(root.style, { lineHeight: '1.5', fontSize: '1.25rem', fontWeight: '700', color: 'red' });
        document.body.appendChild(root);
        await fixture.whenStable();
        const column = getComputedStyle(root.querySelector('fd-vertical-navigation > div')!);
        expect([column.fontSize, column.lineHeight, column.fontWeight, column.color]).toEqual([
            themed('fontSize', 'var(--sapFontSize)'),
            'normal',
            '400',
            themed('color', 'var(--sapTextColor)')
        ]);
    });
});
