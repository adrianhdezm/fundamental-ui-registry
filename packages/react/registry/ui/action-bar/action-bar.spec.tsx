import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Button } from '@/ui/button/button';
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/ui/menu/menu';
import {
    ActionBar,
    ActionBarActions,
    ActionBarBack,
    ActionBarDescription,
    ActionBarHeader,
    ActionBarTitle,
    type ActionBarSize
} from './action-bar';

interface HostProps {
    size?: ActionBarSize;
    back?: boolean;
    actionsHidden?: boolean;
    width?: string;
    title?: string;
}

const LONG = 'A very long page title that will never fit into the action bar of this narrow test container';

async function setup(initial: HostProps = {}) {
    let current: HostProps = {
        size: 'm_l',
        back: true,
        actionsHidden: false,
        width: '800px',
        title: 'Page Title',
        ...initial
    };
    const onBack = vi.fn();
    const ui = (p: HostProps) => (
        <div style={{ width: p.width }}>
            <ActionBar size={p.size} data-testid="bar">
                <ActionBarHeader>
                    {p.back && (
                        <ActionBarBack data-testid="back">
                            <Button
                                variant="transparent"
                                glyph="navigation-left-arrow"
                                aria-label="Back"
                                onClick={onBack}
                            />
                        </ActionBarBack>
                    )}
                    <ActionBarTitle data-testid="title">{p.title}</ActionBarTitle>
                    <ActionBarActions data-testid="actions" hidden={p.actionsHidden}>
                        <Button label="Cancel" />
                        <Button variant="emphasized" label="Save" />
                    </ActionBarActions>
                </ActionBarHeader>
                <ActionBarDescription data-testid="description" withBackBtn={p.back}>
                    Action bar description
                </ActionBarDescription>
            </ActionBar>
        </div>
    );
    const screen = await render(ui(current));
    const q = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
    return {
        onBack,
        bar: () => q('bar'),
        back: () => q('back').querySelector('button')!,
        title: () => q('title'),
        heading: () => q('title').querySelector<HTMLElement>('h2')!,
        actions: () => q('actions'),
        description: () => q('description'),
        update: async (change: HostProps) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

const rect = (el: Element) => el.getBoundingClientRect();

describe('ActionBar', () => {
    it('back button has an accessible name and is clickable', async () => {
        const { onBack, back } = await setup();
        expect(back().getAttribute('aria-label')).toBe('Back');
        expect(back().getAttribute('type')).toBe('button');
        await userEvent.click(back());
        expect(onBack).toHaveBeenCalledTimes(1);
        back().focus();
        await userEvent.keyboard('{Enter}');
        expect(onBack).toHaveBeenCalledTimes(2);
    });

    it('back button comes first in the header, before the title', async () => {
        const { back, title } = await setup();
        expect(rect(back()).right).toBeLessThanOrEqual(rect(title()).left);
    });

    it('renders the title as a level 2 heading in the header 3 size', async () => {
        const { heading } = await setup();
        expect(heading().tagName).toBe('H2');
        expect(heading().textContent!.trim()).toBe('Page Title');
        const probe = document.createElement('div');
        probe.style.fontSize = 'var(--sapFontHeader3Size)';
        document.body.appendChild(probe);
        expect(getComputedStyle(heading()).fontSize).toBe(getComputedStyle(probe).fontSize);
        probe.remove();
    });

    it('level and headerSize change the heading level and size', async () => {
        const screen = await render(
            <ActionBar>
                <ActionBarHeader>
                    <ActionBarTitle level={3} headerSize={5}>
                        Page Title
                    </ActionBarTitle>
                </ActionBarHeader>
            </ActionBar>
        );
        const heading = screen.container.querySelector('h3')!;
        const probe = document.createElement('div');
        probe.style.fontSize = 'var(--sapFontHeader5Size)';
        document.body.appendChild(probe);
        expect(getComputedStyle(heading).fontSize).toBe(getComputedStyle(probe).fontSize);
        probe.remove();
    });

    it('the title is tall enough for its descenders', async () => {
        const { heading } = await setup({ title: 'Typography' });
        const range = document.createRange();
        range.selectNodeContents(heading());
        // the heading clips its overflow: its box must hold the glyphs' full ascent and descent
        expect(rect(heading()).height).toBeGreaterThanOrEqual(range.getBoundingClientRect().height - 0.5);
    });

    it('a long title truncates on one line', async () => {
        const { heading } = await setup({ width: '400px', title: LONG });
        const style = getComputedStyle(heading());
        expect(style.whiteSpace).toBe('nowrap');
        expect(style.textOverflow).toBe('ellipsis');
        expect(heading().scrollWidth).toBeGreaterThan(heading().clientWidth);
        // stays on one line, the header keeps its height
        expect(rect(heading()).height).toBeLessThanOrEqual(32);
    });

    it('the long title never pushes the actions out of the bar', async () => {
        const { bar, actions } = await setup({ width: '400px', title: LONG });
        expect(rect(actions()).right).toBeLessThanOrEqual(rect(bar()).right);
        expect(rect(actions()).width).toBeGreaterThan(100);
    });

    it('description is rendered below the title', async () => {
        const { title, description } = await setup();
        expect(description().tagName).toBe('P');
        expect(rect(description()).top).toBeGreaterThanOrEqual(rect(title()).bottom);
        expect(description().textContent!.trim()).toBe('Action bar description');
    });

    it('withBackBtn indents the description to the title next to the back button', async () => {
        const { update, title, description } = await setup();
        const indent = () => parseFloat(getComputedStyle(description()).paddingInlineStart);
        expect(indent()).toBe(40);
        expect(Math.abs(rect(description()).left + indent() - rect(title()).left)).toBeLessThanOrEqual(4);

        await update({ back: false });
        expect(indent()).toBe(0);
        expect(rect(description()).left).toBe(rect(title()).left);
    });

    it('actions area aligns to the end in LTR and RTL', async () => {
        const { update, bar, actions, title } = await setup();
        const padding = () => parseFloat(getComputedStyle(bar()).paddingRight);
        expect(rect(bar()).right - rect(actions()).right).toBeCloseTo(padding(), 0);
        expect(rect(title()).left).toBeLessThan(rect(actions()).left);

        document.documentElement.setAttribute('dir', 'rtl');
        try {
            await update({});
            expect(rect(actions()).left - rect(bar()).left).toBeCloseTo(padding(), 0);
            expect(rect(title()).right).toBeGreaterThan(rect(actions()).right);
        } finally {
            document.documentElement.removeAttribute('dir');
        }
    });

    it('size sets the horizontal padding', async () => {
        const { update, bar } = await setup({ size: 's' });
        const padding = () => getComputedStyle(bar()).paddingLeft;
        expect(padding()).toBe('16px');
        await update({ size: 'm_l' });
        expect(padding()).toBe('32px');
        await update({ size: 'xl' });
        expect(padding()).toBe('48px');
        await update({ size: undefined });
        expect(padding()).toBe('32px');
    });

    it('the hidden attribute hides the actions', async () => {
        const { update, actions } = await setup();
        expect(actions().checkVisibility({ visibilityProperty: true })).toBe(true);
        await update({ actionsHidden: true });
        expect(actions().checkVisibility({ visibilityProperty: true })).toBe(false);
    });

    it('hides the back button and description on small screens', async () => {
        const { back, description } = await setup({ width: '100%' });
        expect(rect(back()).width).toBeGreaterThan(0);
        await page.viewport(500, 800);
        try {
            expect(getComputedStyle(back().parentElement!).display).toBe('none');
            expect(getComputedStyle(description()).display).toBe('none');
        } finally {
            await page.viewport(1280, 800);
        }
        expect(getComputedStyle(description()).display).not.toBe('none');
    });

    it('passes className, native props and the ref to every part', async () => {
        const refs = {
            bar: createRef<HTMLDivElement>(),
            header: createRef<HTMLDivElement>(),
            back: createRef<HTMLDivElement>(),
            title: createRef<HTMLDivElement>(),
            actions: createRef<HTMLDivElement>(),
            description: createRef<HTMLParagraphElement>()
        };
        const screen = await render(
            <ActionBar ref={refs.bar} data-sample="bar" className="mt-4" aria-labelledby="page-title">
                <ActionBarHeader ref={refs.header} data-sample="header">
                    <ActionBarBack ref={refs.back} data-sample="back">
                        <Button
                            variant="transparent"
                            glyph="navigation-left-arrow"
                            aria-label="Back"
                            data-sample="button"
                        />
                    </ActionBarBack>
                    <ActionBarTitle
                        ref={refs.title}
                        data-sample="title"
                        headingProps={{ id: 'page-title', title: 'Hint' }}
                    >
                        Page Title
                    </ActionBarTitle>
                    <ActionBarActions ref={refs.actions} data-sample="actions" role="group" aria-label="Page actions">
                        <Button label="Save" />
                    </ActionBarActions>
                </ActionBarHeader>
                <ActionBarDescription
                    ref={refs.description}
                    data-sample="description"
                    className="text-sap-negative-color"
                >
                    Description
                </ActionBarDescription>
            </ActionBar>
        );
        const root = screen.container;
        for (const [name, ref] of Object.entries(refs)) {
            expect(ref.current, name).toBe(root.querySelector(`[data-sample="${name}"]`));
        }
        expect(refs.bar.current!.tagName).toBe('DIV');
        expect(getComputedStyle(refs.bar.current!).marginTop).toBe('16px');
        expect(root.querySelector('[data-sample="button"]')!.tagName).toBe('BUTTON');

        const heading = root.querySelector('h2')!;
        expect(heading.id).toBe('page-title');
        expect(heading.title).toBe('Hint');
        expect(refs.bar.current!.getAttribute('aria-labelledby')).toBe('page-title');
        expect(screen.getByRole('group', { name: 'Page actions' }).element()).toBe(refs.actions.current);

        const probe = document.createElement('div');
        probe.style.color = 'var(--sapNegativeColor)';
        document.body.appendChild(probe);
        expect(getComputedStyle(refs.description.current!).color).toBe(getComputedStyle(probe).color);
        probe.remove();
    });

    it('render renders another root element', async () => {
        const screen = await render(
            <ActionBar render={<header />} data-testid="bar">
                <ActionBarHeader>
                    <ActionBarTitle>Page Title</ActionBarTitle>
                </ActionBarHeader>
            </ActionBar>
        );
        const bar = screen.container.querySelector('[data-testid="bar"]')!;
        expect(bar.tagName).toBe('HEADER');
        expect(getComputedStyle(bar).paddingLeft).toBe('32px');
    });
    it('the overflow button in the actions opens its menu and gets the focus back on Escape', async () => {
        const screen = await render(
            <ActionBar>
                <ActionBarHeader>
                    <ActionBarTitle>Page Title</ActionBarTitle>
                    <ActionBarActions>
                        <Menu placement="bottom-end">
                            <MenuTrigger render={<Button variant="transparent" glyph="overflow" aria-label="More" />} />
                            <MenuPopup aria-label="Page actions">
                                {['Edit', 'Delete', 'Assign', 'Expire', 'Archive'].map((action) => (
                                    <MenuItem key={action}>{action}</MenuItem>
                                ))}
                            </MenuPopup>
                        </Menu>
                    </ActionBarActions>
                </ActionBarHeader>
            </ActionBar>
        );
        const more = screen.container.querySelector<HTMLElement>('button[aria-label=More]')!;
        await userEvent.click(more);
        await expect.poll(() => more.getAttribute('aria-expanded')).toBe('true');
        const menu = document.getElementById(more.getAttribute('aria-controls')!)!;
        expect(menu.getAttribute('role')).toBe('menu');
        // placement bottom-end: the menu ends under the end of the button
        await expect
            .poll(() =>
                Math.abs(
                    menu.closest('[role=presentation]')!.getBoundingClientRect().right -
                        more.getBoundingClientRect().right
                )
            )
            .toBeLessThan(2);
        await expect.poll(() => document.activeElement!.textContent!.trim()).toBe('Edit');
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => more.getAttribute('aria-expanded')).toBe('false');
        // Base UI returns the focus once the menu has finished closing
        await expect.poll(() => document.activeElement).toBe(more);
    });
});
