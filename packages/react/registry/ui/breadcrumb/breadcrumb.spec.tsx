import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Link } from '@/ui/link/link';
import { Breadcrumb, BreadcrumbItem, type BreadcrumbProps, type BreadcrumbSeparatorStyle } from './breadcrumb';

const STEPS = ['Home', 'Products', 'Computers', 'Laptops'];

interface HostProps extends BreadcrumbProps {
    width?: string;
    dir?: 'ltr' | 'rtl';
    clicked?: (step: string) => void;
}

function Host({ width = '60rem', dir = 'ltr', clicked, ...props }: HostProps) {
    return (
        <div style={{ width }} dir={dir}>
            <Breadcrumb {...props}>
                {STEPS.map((step) => (
                    <BreadcrumbItem key={step}>
                        <Link
                            href="#"
                            onClick={(event) => {
                                event.preventDefault();
                                clicked?.(step);
                            }}
                        >
                            {step}
                        </Link>
                    </BreadcrumbItem>
                ))}
                <BreadcrumbItem>
                    <span aria-current="page">Current page</span>
                </BreadcrumbItem>
            </Breadcrumb>
        </div>
    );
}

const frames = (count = 3) =>
    new Promise<void>((resolve) => {
        const next = (left: number) => (left ? requestAnimationFrame(() => next(left - 1)) : resolve());
        next(count);
    });

async function until(condition: () => boolean) {
    for (let i = 0; i < 50 && !condition(); i++) await new Promise((resolve) => setTimeout(resolve, 20));
}

async function setup(initial: HostProps = {}) {
    let current: HostProps = { ...initial };
    const hidden = vi.fn<(count: number) => void>();
    const clicked = vi.fn<(step: string) => void>();
    const screen = await render(<Host onHiddenItemsCountChange={hidden} clicked={clicked} {...current} />);
    await frames();
    const el = screen.container;
    const lastHidden = () => hidden.mock.calls.at(-1)?.[0] ?? 0;
    /** The focusable links of the visible trail. */
    const focusables = () =>
        [...el.querySelectorAll<HTMLElement>('[role=list] :is(a, [aria-current])')].filter(
            (e) => !e.closest('[hidden]')
        );
    return {
        el,
        hidden: lastHidden,
        clicked,
        focusables,
        update: async (change: HostProps) => {
            current = { ...current, ...change };
            await screen.rerender(<Host onHiddenItemsCountChange={hidden} clicked={clicked} {...current} />);
            await frames();
        }
    };
}

describe('Breadcrumb', () => {
    it('is a labelled navigation list with separators and no separator after the current page', async () => {
        const { el } = await setup();
        const nav = el.querySelector('nav')!;
        expect(nav.getAttribute('aria-label')).toBe('Breadcrumb trail');
        // a <nav>: the navigation landmark Angular gives its host with role="navigation"
        expect(nav.getAttribute('role')).toBeNull();
        const list = el.querySelector('[role=list]')!;
        const items = [...list.querySelectorAll('[role=listitem]')];
        expect(items).toHaveLength(5);
        expect(items[0]!.textContent).toContain('/');
        expect(items[4]!.textContent!.trim()).toBe('Current page');
    });

    it('has one tab stop and moves between the links with the arrow keys', async () => {
        const { focusables } = await setup();
        expect(focusables().map((e) => e.tabIndex)).toEqual([0, -1, -1, -1, -1]);
        focusables()[0]!.focus();
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        expect(document.activeElement!.textContent!.trim()).toBe('Computers');
        expect(focusables()[2]!.tabIndex).toBe(0);
        expect(focusables()[0]!.tabIndex).toBe(-1);
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement!.textContent!.trim()).toBe('Products');
    });

    it('collapses items that do not fit into a menu that follows their links', async () => {
        const { el, hidden, clicked } = await setup({ width: '16rem' });
        await until(() => hidden() > 0);
        expect(hidden()).toBeGreaterThan(0);
        const more = el.querySelector<HTMLElement>('[data-breadcrumb-more]')!;
        expect(more.getAttribute('aria-haspopup')).toBe('menu');
        expect(more.getAttribute('aria-label')).toBe('More');
        await userEvent.click(more);
        await until(() => document.querySelectorAll('[role=menuitem]').length > 0);
        const items = [...document.querySelectorAll<HTMLElement>('[role=menuitem]')];
        expect(items.length).toBe(hidden());
        // from the current page up: the root last
        expect(items.at(-1)!.textContent!.trim()).toBe('Home');
        await userEvent.click(items.at(-1)!);
        expect(clicked).toHaveBeenCalledWith('Home');
    });

    it('lists the collapsed items from the root down with reverse', async () => {
        const { el, hidden } = await setup({ width: '16rem', reverse: true });
        await until(() => hidden() > 1);
        await userEvent.click(el.querySelector<HTMLElement>('[data-breadcrumb-more]')!);
        await until(() => document.querySelectorAll('[role=menuitem]').length > 0);
        const items = [...document.querySelectorAll<HTMLElement>('[role=menuitem]')];
        expect(items[0]!.textContent!.trim()).toBe('Home');
        expect(items.at(-1)!.textContent!.trim()).toBe(STEPS[hidden() - 1]);
        await userEvent.keyboard('{Escape}');
    });

    it('renders the separator of each separatorStyle and updates when it changes', async () => {
        const { el, update } = await setup();
        const separators = () =>
            [...el.querySelectorAll('[role=listitem] > span')].map(
                (item) => item.querySelector(':scope > span[aria-hidden=true]')?.textContent?.trim() ?? null
            );
        expect(separators()).toEqual(['/', '/', '/', '/', null]);
        const styles: [BreadcrumbSeparatorStyle, string][] = [
            ['backslash', '\\'],
            ['double-slash', '//'],
            ['double-backslash', '\\\\'],
            ['greater-than', '>'],
            ['double-greater-than', '>>']
        ];
        for (const [style, separator] of styles) {
            await update({ separatorStyle: style });
            expect(separators()).toEqual([separator, separator, separator, separator, null]);
        }
    });

    it('keeps the separator after a last item that is a link', async () => {
        const screen = await render(
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link href="#">Home</Link>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <Link href="#" aria-current="page">
                        Laptops
                    </Link>
                </BreadcrumbItem>
            </Breadcrumb>
        );
        const items = [...screen.container.querySelectorAll('[role=listitem]')];
        expect(items[1]!.querySelector('span[aria-hidden=true]')?.textContent).toBe('/');
    });

    it('restores collapsed items when the container grows', async () => {
        const { el, hidden, focusables, update } = await setup({ width: '16rem' });
        await until(() => hidden() > 0);
        expect(hidden()).toBeGreaterThan(0);
        await update({ width: '60rem' });
        await until(() => hidden() === 0);
        expect(hidden()).toBe(0);
        expect(el.querySelector('[data-breadcrumb-more]')).toBeNull();
        expect(focusables().map((e) => e.textContent!.trim())).toEqual([
            'Home',
            'Products',
            'Computers',
            'Laptops',
            'Current page'
        ]);
    });

    it('moves from the last link to the current page and back, and stops at the first link', async () => {
        const { focusables } = await setup();
        focusables()[3]!.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(focusables()[4]);
        expect(document.activeElement!.getAttribute('aria-current')).toBe('page');
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(focusables()[4]);
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement!.textContent!.trim()).toBe('Laptops');
        focusables()[0]!.focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement!.textContent!.trim()).toBe('Home');
    });

    it('moves next with ArrowDown and back with ArrowUp', async () => {
        const { focusables } = await setup();
        focusables()[0]!.focus();
        await userEvent.keyboard('{ArrowDown}{ArrowDown}');
        expect(document.activeElement!.textContent!.trim()).toBe('Computers');
        await userEvent.keyboard('{ArrowUp}');
        expect(document.activeElement!.textContent!.trim()).toBe('Products');
    });

    it('mirrors ArrowLeft and ArrowRight in RTL', async () => {
        const { focusables } = await setup({ dir: 'rtl' });
        focusables()[0]!.focus();
        await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
        expect(document.activeElement!.textContent!.trim()).toBe('Computers');
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement!.textContent!.trim()).toBe('Products');
    });

    it('the "more" link joins the tab stop and the arrow keys when items collapse', async () => {
        const { el, hidden, focusables } = await setup({ width: '16rem' });
        await until(() => hidden() > 0);
        const more = el.querySelector<HTMLElement>('[data-breadcrumb-more]')!;
        // the first visible control is the "more" link
        expect(more.tabIndex).toBe(0);
        expect(focusables().every((e) => e.tabIndex === -1)).toBe(true);
        more.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(focusables()[0]);
        expect(more.tabIndex).toBe(-1);
    });

    it('reports the visible and hidden counts', async () => {
        const visible = vi.fn<(count: number) => void>();
        const { hidden } = await setup({ width: '16rem', onVisibleItemsCountChange: visible });
        await until(() => hidden() > 0);
        expect(visible.mock.calls.at(-1)![0] + hidden()).toBe(5);
    });

    it('disables the menu item of a disabled collapsed link', async () => {
        const screen = await render(
            <div style={{ width: '12rem' }}>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link href="#" disabled>
                            Archive
                        </Link>
                    </BreadcrumbItem>
                    {STEPS.map((step) => (
                        <BreadcrumbItem key={step}>
                            <Link href="#">{step}</Link>
                        </BreadcrumbItem>
                    ))}
                    <BreadcrumbItem>
                        <span aria-current="page">Current page</span>
                    </BreadcrumbItem>
                </Breadcrumb>
            </div>
        );
        await until(() => !!screen.container.querySelector('[data-breadcrumb-more]'));
        await userEvent.click(screen.container.querySelector<HTMLElement>('[data-breadcrumb-more]')!);
        await until(() => document.querySelectorAll('[role=menuitem]').length > 0);
        const archive = [...document.querySelectorAll<HTMLElement>('[role=menuitem]')].find(
            (item) => item.textContent!.trim() === 'Archive'
        )!;
        expect(archive.getAttribute('aria-disabled')).toBe('true');
        await userEvent.keyboard('{Escape}');
    });

    // fundamental-react
    it('passes className, native props and the ref through, on the trail and on items', async () => {
        const ref = createRef<HTMLElement>();
        const item = createRef<HTMLSpanElement>();
        const screen = await render(
            <Breadcrumb ref={ref} data-sample="Sample" className="custom" ariaLabel="Path">
                <BreadcrumbItem ref={item} data-sample="Item" className="item-class">
                    <Link href="#">Name</Link>
                </BreadcrumbItem>
            </Breadcrumb>
        );
        const nav = screen.container.querySelector('nav')!;
        expect(ref.current).toBe(nav);
        expect(nav.dataset['sample']).toBe('Sample');
        expect(nav.classList.contains('custom')).toBe(true);
        expect(nav.getAttribute('aria-label')).toBe('Path');
        expect(item.current?.dataset['sample']).toBe('Item');
        expect(item.current?.classList.contains('item-class')).toBe(true);
    });
});
