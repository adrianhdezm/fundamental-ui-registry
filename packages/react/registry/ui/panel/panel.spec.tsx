import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Panel, PanelContent, PanelTitle } from './panel';

interface HostProps {
    expanded?: boolean;
    fixed?: boolean;
    transparent?: boolean;
    noRadius?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
}

/** Angular's host: a controlled panel whose state the test reads back and sets. */
function Host({ expanded, fixed = false, transparent = false, noRadius = false, onExpandedChange }: HostProps) {
    const [open, setOpen] = useState(false);
    const value = expanded ?? open;
    return (
        <>
            <Panel
                expanded={value}
                onExpandedChange={(next) => {
                    setOpen(next);
                    onExpandedChange?.(next);
                }}
                fixed={fixed}
                transparent={transparent}
                noRadius={noRadius}
                expandAriaLabel="Show details"
                expandAriaLabelledBy="title"
            >
                <PanelTitle id="title">Details</PanelTitle>
                <button id="action">Edit</button>
                <PanelContent aria-labelledby="title" maxHeight="5rem">
                    <p id="text">Content</p>
                </PanelContent>
            </Panel>
            <output id="state">{String(value)}</output>
        </>
    );
}

async function setup(props: HostProps = {}) {
    const screen = await render(<Host {...props} />);
    const root = screen.container;
    return {
        root,
        rerender: (next: HostProps) => screen.rerender(<Host {...next} />),
        state: () => root.querySelector('#state')!.textContent,
        expandButton: () => root.querySelector<HTMLButtonElement>('[id^="fd-panel-"] > div > div > button'),
        content: () => root.querySelector<HTMLElement>('[role="region"]'),
        header: () => root.querySelector<HTMLElement>('[id^="fd-panel-"] > div')!
    };
}

const LONG = 'A very long panel title that does not fit into the narrow panel header at all';

interface LayoutProps {
    wrap?: boolean;
    height?: string | null;
    minHeight?: string | null;
    maxHeight?: string | null;
    noPadding?: boolean;
    transparentContent?: boolean;
    fillerHeight?: string;
}

function LayoutHost({
    wrap = true,
    height = null,
    minHeight = null,
    maxHeight = null,
    noPadding = false,
    transparentContent = false,
    fillerHeight = '1rem'
}: LayoutProps) {
    return (
        <Panel fixed className="mt-4 w-60" id="layout">
            <PanelTitle wrap={wrap}>{LONG}</PanelTitle>
            <PanelContent
                aria-label="Layout"
                className="text-sap-negative-color"
                height={height}
                minHeight={minHeight}
                maxHeight={maxHeight}
                noPadding={noPadding}
                transparent={transparentContent}
            >
                <div id="filler" style={{ height: fillerHeight }} />
            </PanelContent>
        </Panel>
    );
}

async function setupLayout(initial: LayoutProps = {}) {
    let props = initial;
    const screen = await render(<LayoutHost {...props} />);
    const root = screen.container;
    return {
        update: async (change: Partial<LayoutProps>) => {
            props = { ...props, ...change };
            await screen.rerender(<LayoutHost {...props} />);
        },
        panel: () => root.querySelector<HTMLElement>('#layout')!,
        title: () => root.querySelector<HTMLElement>('h4')!,
        content: () => root.querySelector<HTMLElement>('[role="region"]')!
    };
}

describe('Panel', () => {
    afterEach(() => {
        document.documentElement.removeAttribute('data-density');
        document.documentElement.removeAttribute('dir');
    });

    it('expand button toggles expanded and controls the content via aria-controls / aria-expanded', async () => {
        const onExpandedChange = vi.fn();
        const { state, rerender, expandButton, content } = await setup({ onExpandedChange });
        const button = expandButton()!;
        expect(button.getAttribute('aria-expanded')).toBe('false');
        expect(content()).toBeNull();

        await userEvent.click(button);
        expect(state()).toBe('true');
        expect(onExpandedChange).toHaveBeenLastCalledWith(true);
        expect(button.getAttribute('aria-expanded')).toBe('true');
        const controls = button.getAttribute('aria-controls')!;
        expect(controls).toMatch(/^fd-panel-content-/);
        expect(content()!.id).toBe(controls);
        expect(content()!.getAttribute('role')).toBe('region');
        expect(content()!.style.maxHeight).toBe('5rem');

        button.focus();
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => state()).toBe('false');
        expect(content()).toBeNull();
        // Base UI points aria-controls at the content only while it is rendered
        expect(button.hasAttribute('aria-controls')).toBe(false);
        await userEvent.keyboard(' ');
        await expect.poll(() => state()).toBe('true');
        expect(content()).not.toBeNull();

        // the controlled value drives the panel too
        await rerender({ expanded: false });
        expect(button.getAttribute('aria-expanded')).toBe('false');
        expect(content()).toBeNull();
    });

    it('fixed panels have no expand button and always show the content', async () => {
        const { root, rerender, expandButton, content } = await setup({ fixed: true });
        expect(expandButton()).toBeNull();
        expect(content()).not.toBeNull();
        expect(root.querySelector('#text')!.textContent).toBe('Content');
        // extra header content stays in the header
        expect(root.querySelector('#action')!.parentElement!.contains(root.querySelector('#title'))).toBe(true);
        await rerender({ fixed: false });
        expect(expandButton()).not.toBeNull();
        expect(content()).toBeNull();
    });

    it('title is the label of the expand button and content region', async () => {
        const { root, expandButton } = await setup({ expanded: true });
        const button = expandButton()!;
        expect(button.getAttribute('aria-labelledby')).toBe(`title ${button.id}`);
        expect(button.title).toBe('Show details');
        await expect.element(page.getByRole('button', { name: 'Details Show details' })).toBeInTheDocument();
        await expect.element(page.getByRole('region', { name: 'Details' })).toBeInTheDocument();
        expect(root.querySelector('[id^="fd-panel-"]')!.id).toMatch(/^fd-panel-/);
        expect(button.id).toMatch(/^fd-panel-expand-/);
    });

    it('header and content corners follow the expanded state', async () => {
        const { rerender, header, content } = await setup({ expanded: false });
        expect(getComputedStyle(header()).borderBottomLeftRadius).not.toBe('0px');
        await rerender({ expanded: true });
        expect(getComputedStyle(header()).borderBottomLeftRadius).toBe('0px');
        expect(getComputedStyle(content()!).borderBottomLeftRadius).not.toBe('0px');
        await rerender({ expanded: true, transparent: true });
        // the header keeps the group title background, as fundamental-styles' fd-panel--transparent
        expect(getComputedStyle(header()).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(getComputedStyle(content()!).backgroundColor).toBe('rgba(0, 0, 0, 0)');
        await rerender({ expanded: true, noRadius: true });
        expect(getComputedStyle(header()).borderTopLeftRadius).toBe('0px');
        expect(getComputedStyle(content()!).borderBottomLeftRadius).toBe('0px');
    });

    it('compact density sizes', async () => {
        const { header, expandButton } = await setup();
        const button = expandButton()!;
        const cozyButton = button.getBoundingClientRect().height;
        expect(getComputedStyle(header()).minHeight).toBe('44px');
        expect(button.parentElement!.getBoundingClientRect().height).toBe(44);
        expect(getComputedStyle(button).fontSize).toBe('16px');
        expect(getComputedStyle(button).lineHeight).toBe('normal');
        document.documentElement.setAttribute('data-density', 'compact');
        expect(getComputedStyle(header()).minHeight).toBe('40px');
        expect(button.parentElement!.getBoundingClientRect().height).toBe(40);
        expect(button.getBoundingClientRect().height).toBeLessThan(cozyButton);
    });

    it('content height, minHeight and maxHeight size the content and make it scroll', async () => {
        const { update, content } = await setupLayout();
        const height = () => content().getBoundingClientRect().height;
        const auto = height();
        await update({ minHeight: '10rem' });
        expect(height()).toBe(160);
        await update({ minHeight: null, fillerHeight: '20rem', maxHeight: '6rem' });
        expect(height()).toBe(96);
        expect(content().scrollHeight).toBeGreaterThan(content().clientHeight);
        await update({ maxHeight: null, height: '5rem' });
        expect(height()).toBe(80);
        expect(content().scrollHeight).toBeGreaterThan(content().clientHeight);
        await update({ height: null, fillerHeight: '1rem' });
        expect(height()).toBe(auto);
    });

    it('title wraps long text by default and truncates when wrap is false', async () => {
        const { update, title } = await setupLayout();
        const height = () => title().getBoundingClientRect().height;
        expect(getComputedStyle(title()).whiteSpace).toBe('normal');
        const wrapped = height();
        await update({ wrap: false });
        expect(getComputedStyle(title()).whiteSpace).toBe('nowrap');
        expect(getComputedStyle(title()).textOverflow).toBe('ellipsis');
        // one line instead of several
        expect(wrapped).toBeGreaterThan(height() * 1.5);
        expect(title().scrollWidth).toBeGreaterThan(title().clientWidth);
    });

    it('noPadding and transparent content remove padding and background', async () => {
        const { update, content } = await setupLayout();
        const style = () => getComputedStyle(content());
        expect(style().paddingLeft).toBe('16px');
        expect(style().paddingTop).toBe('10px');
        expect(style().backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        await update({ noPadding: true });
        expect(style().paddingLeft).toBe('0px');
        expect(style().paddingTop).toBe('0px');
        await update({ transparentContent: true });
        expect(style().backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });

    it('className is merged into the panel and content classes', async () => {
        const { panel, content } = await setupLayout();
        expect(panel().getBoundingClientRect().width).toBe(240);
        expect(getComputedStyle(panel()).marginTop).toBe('16px');
        expect(getComputedStyle(panel()).display).toBe('flex');
        // the user's text colour wins over the default content colour
        const probe = document.createElement('span');
        probe.style.color = 'var(--sapNegativeColor)';
        document.body.appendChild(probe);
        expect(getComputedStyle(content()).color).toBe(getComputedStyle(probe).color);
        probe.remove();
        expect(getComputedStyle(content()).overflow).toBe('auto');
    });

    it('uncontrolled: defaultExpanded, then the button toggles it and reports the change', async () => {
        const onExpandedChange = vi.fn();
        const screen = await render(
            <Panel defaultExpanded onExpandedChange={onExpandedChange} expandAriaLabel="Toggle">
                <PanelTitle>Uncontrolled</PanelTitle>
                <PanelContent aria-label="Body">Body</PanelContent>
            </Panel>
        );
        const button = page.getByRole('button', { name: 'Toggle' });
        await expect.element(button).toHaveAttribute('aria-expanded', 'true');
        await expect.element(page.getByRole('region', { name: 'Body' })).toBeInTheDocument();
        await button.click();
        expect(onExpandedChange).toHaveBeenLastCalledWith(false);
        await expect.element(button).toHaveAttribute('aria-expanded', 'false');
        expect(screen.container.querySelector('[role="region"]')).toBeNull();
    });

    it('places the title first in the header and the content below it, whatever the order of the children', async () => {
        const screen = await render(
            <Panel fixed>
                <PanelContent aria-label="Body">Body</PanelContent>
                <button id="action">Edit</button>
                <PanelTitle id="title">Title</PanelTitle>
            </Panel>
        );
        const panel = screen.container.querySelector<HTMLElement>('[id^="fd-panel-"]')!;
        const [header, content] = [...panel.children] as HTMLElement[];
        expect([...header.children].map((child) => child.id)).toEqual(['title', 'action']);
        expect(content.getAttribute('role')).toBe('region');
    });

    it('a toolbar in the header takes the end padding', async () => {
        const screen = await render(
            <>
                <Panel fixed data-testid="plain">
                    <PanelTitle>Plain</PanelTitle>
                </Panel>
                <Panel fixed data-testid="toolbar">
                    <PanelTitle>With a toolbar</PanelTitle>
                    <div role="toolbar" aria-label="Actions" />
                </Panel>
            </>
        );
        const header = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"] > div`)!;
        expect(getComputedStyle(header('plain')).paddingRight).toBe('8px');
        // a fixed header starts at 0.75rem: there is no expand button
        expect(getComputedStyle(header('plain')).paddingLeft).toBe('12px');
        expect(getComputedStyle(header('toolbar')).paddingRight).toBe('0px');
    });

    it('title: heading level, wrap and native props', async () => {
        const ref = createRef<HTMLHeadingElement>();
        const screen = await render(
            <PanelTitle level={5} ref={ref} className="custom" data-x="1">
                Title
            </PanelTitle>
        );
        const title = screen.container.querySelector('h5')!;
        expect(ref.current).toBe(title);
        expect(title.id).toMatch(/^fd-panel-title-/);
        expect(title.className).toContain('custom');
        expect(title.dataset['x']).toBe('1');
        // the group title typography, no synthetic bold
        expect(getComputedStyle(title).fontWeight).toBe('400');
    });

    it('content outside a panel is a plain region; role can be removed', async () => {
        const screen = await render(
            <>
                <PanelContent aria-label="Standalone" id="standalone">
                    Standalone
                </PanelContent>
                <PanelContent role={null} id="no-role">
                    No role
                </PanelContent>
            </>
        );
        await expect.element(page.getByRole('region', { name: 'Standalone' })).toBeInTheDocument();
        expect(screen.container.querySelector('#no-role')!.hasAttribute('role')).toBe(false);
    });

    it('the collapsed arrow is mirrored in RTL', async () => {
        document.documentElement.setAttribute('dir', 'rtl');
        const { expandButton } = await setup();
        const glyph = expandButton()!.querySelector<HTMLElement>('[data-glyph]')!;
        expect(getComputedStyle(glyph).scale).toBe('-1 1');
    });

    it('passes native props, className and ref to the root; ids can be set', async () => {
        const ref = createRef<HTMLDivElement>();
        const contentRef = createRef<HTMLDivElement>();
        const screen = await render(
            <Panel
                ref={ref}
                id="panel"
                expandId="expand"
                defaultExpanded
                className="custom"
                data-testid="root"
                aria-label="Panel"
                expandAriaLabel="Toggle"
            >
                <PanelTitle>Title</PanelTitle>
                <PanelContent ref={contentRef} id="content" data-x="1" aria-label="Body">
                    Body
                </PanelContent>
            </Panel>
        );
        const root = screen.container.querySelector<HTMLElement>('[data-testid="root"]')!;
        expect(ref.current).toBe(root);
        expect(root.id).toBe('panel');
        expect(root.className).toContain('custom');
        expect(root.getAttribute('aria-label')).toBe('Panel');
        const button = root.querySelector('button')!;
        expect(button.id).toBe('expand');
        expect(button.getAttribute('aria-controls')).toBe('content');
        expect(contentRef.current!.id).toBe('content');
        expect(contentRef.current!.dataset['x']).toBe('1');
    });
});
