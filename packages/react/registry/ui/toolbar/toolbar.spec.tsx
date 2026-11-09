import { createRef, useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Button } from '@/ui/button/button';
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/ui/menu/menu';
import { Select, SelectOption } from '@/ui/select/select';
import { Title } from '@/ui/title/title';
import {
    Toolbar,
    ToolbarForceOverflowContext,
    ToolbarItem,
    ToolbarLabel,
    ToolbarOverflowButton,
    ToolbarSeparator,
    ToolbarSpacer,
    toolbarOverflow,
    type OverflowPriority,
    type ToolbarActions,
    type ToolbarOverflowItem
} from './toolbar';

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const stable = async () => {
    await frame();
    await frame();
};

interface OverflowHostProps {
    width?: number;
    display?: string;
    force?: boolean;
    onOpenChange?: (open: boolean) => void;
    actionsRef?: React.Ref<ToolbarActions>;
}

/** The Angular test host: seven 100px items with every priority, two of them in a group. */
function OverflowHost({ width = 1000, display = 'block', force = false, onOpenChange, actionsRef }: OverflowHostProps) {
    const item = (id: string) => (
        <button id={id} style={{ width: 100 }}>
            {id.toUpperCase()}
        </button>
    );
    return (
        <div style={{ width, display }}>
            <Toolbar
                shouldOverflow
                forceOverflow={force}
                aria-label="Actions"
                onOverflowOpenChange={onOpenChange}
                actionsRef={actionsRef}
            >
                <ToolbarSpacer />
                <ToolbarItem>{item('a')}</ToolbarItem>
                <ToolbarItem overflowPriority="low">{item('b')}</ToolbarItem>
                <ToolbarItem overflowGroup={1}>{item('c')}</ToolbarItem>
                <ToolbarItem overflowGroup={1}>{item('d')}</ToolbarItem>
                <ToolbarItem overflowPriority="never">{item('e')}</ToolbarItem>
                <ToolbarItem overflowPriority="disappear">{item('g')}</ToolbarItem>
                <ToolbarItem overflowPriority="always">{item('f')}</ToolbarItem>
            </Toolbar>
        </div>
    );
}

async function setupOverflow(props: OverflowHostProps = {}) {
    let open = false;
    const actions = createRef<ToolbarActions>();
    const screen = await render(
        <OverflowHost {...props} actionsRef={actions} onOpenChange={(next) => (open = next)} />
    );
    await stable();
    const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
    const moreButton = () => toolbar.querySelector<HTMLButtonElement>('button[aria-label="More"]');
    const panel = () => document.querySelector<HTMLElement>('[data-toolbar-overflow]')!;
    return {
        screen,
        toolbar,
        actions,
        moreButton,
        panel,
        isOpen: () => open,
        rerender: async (next: OverflowHostProps) => {
            await screen.rerender(
                <OverflowHost {...props} {...next} actionsRef={actions} onOpenChange={(value) => (open = value)} />
            );
            await stable();
        },
        /** Ids of the items in the toolbar row, in DOM order. */
        inRow: () =>
            [...toolbar.querySelectorAll<HTMLElement>(':scope > [data-toolbar-item] > * > button[id]')].map(
                (b) => b.id
            ),
        /** Ids of the items in the overflow panel, wherever it is. */
        inPanel: () => [...panel().querySelectorAll<HTMLElement>(':scope > * > button[id]')].map((b) => b.id),
        open: async () => {
            await userEvent.click(moreButton()!);
            await stable();
        }
    };
}

describe('Toolbar', () => {
    afterEach(() => {
        document.documentElement.removeAttribute('data-density');
    });

    it('shouldOverflow moves items that do not fit into the overflow popover, by priority and group', async () => {
        const { inRow, inPanel, moreButton, open, toolbar, panel } = await setupOverflow({ width: 500 });
        // never stays, the high item stays longer than the low one, and C overflows with D (same group)
        expect(inRow()).toEqual(['a', 'e']);
        expect(inPanel()).toEqual(['d', 'c', 'b', 'g', 'f']);
        const more = moreButton()!;
        expect(more.getAttribute('aria-label')).toBe('More');
        expect(more.title).toBe('More');
        // a separator divides the items from the more button
        expect(more.previousElementSibling!.getAttribute('role')).toBe('separator');

        await open();
        const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
        // the popover dialog is named like the More button
        expect(dialog.getAttribute('aria-label')).toBe('More');
        expect(dialog.contains(panel())).toBe(true);
        expect(inPanel()).toEqual(['d', 'c', 'b', 'g', 'f']);
        // disappear items are not shown in the popover
        expect(dialog.querySelector<HTMLElement>('#g')!.checkVisibility()).toBe(false);
        // the first item of the popover takes the focus
        await expect.poll(() => document.activeElement).toBe(dialog.querySelector('#d'));
        expect(toolbar.querySelector('#d')).toBeNull();
    });

    it('always items overflow even when there is room', async () => {
        const { inRow, inPanel, moreButton } = await setupOverflow();
        expect(inRow()).toEqual(['a', 'b', 'c', 'd', 'e', 'g']);
        expect(inPanel()).toEqual(['f']);
        expect(moreButton()).not.toBeNull();
    });

    it('forceOverflow puts all overflowable items in the popover', async () => {
        const { rerender, inRow, inPanel } = await setupOverflow();
        await rerender({ force: true });
        expect(inRow()).toEqual([]);
        expect(inPanel().sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
        await rerender({ force: false });
        expect(inRow()).toEqual(['a', 'b', 'c', 'd', 'e', 'g']);
    });

    it('a container forces the overflow through ToolbarForceOverflowContext', async () => {
        const screen = await render(
            <ToolbarForceOverflowContext.Provider value={true}>
                <Toolbar aria-label="Global actions" style={{ width: 1000 }}>
                    <ToolbarOverflowButton id="one" label="One" />
                    <ToolbarOverflowButton id="two" label="Two" overflowPriority="never" />
                </Toolbar>
            </ToolbarForceOverflowContext.Provider>
        );
        await stable();
        const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
        // overflown items wait in a hidden area of the toolbar while the popover is closed
        expect(toolbar.querySelector(':scope > [data-toolbar-item] #one')).toBeNull();
        expect(toolbar.querySelector(':scope > [data-toolbar-item] #two')).toBeNull();
        expect(toolbar.querySelector<HTMLElement>('#one')!.checkVisibility()).toBe(false);
        expect(toolbar.querySelector('button[aria-label="More"]')).not.toBeNull();
    });

    it('overflown items are restored to their places when there is room, in their order', async () => {
        const { rerender, inRow, inPanel, open, moreButton, isOpen } = await setupOverflow({ width: 500 });
        await open();
        expect(isOpen()).toBe(true);
        await rerender({ width: 1000 });
        expect(inRow()).toEqual(['a', 'b', 'c', 'd', 'e', 'g']);
        expect(inPanel()).toEqual(['f']);
        // restored items are visible again
        expect(document.querySelector<HTMLElement>('#g')!.checkVisibility()).toBe(true);
        await rerender({ width: 500 });
        expect(inRow()).toEqual(['a', 'e']);
        await rerender({ width: 1000 });
        expect(inRow()).toEqual(['a', 'b', 'c', 'd', 'e', 'g']);
        expect(moreButton()).not.toBeNull();
    });

    it('the popover closes when nothing overflows any more', async () => {
        const screen = await render(
            <div style={{ width: 300 }}>
                <Toolbar shouldOverflow aria-label="Actions">
                    <ToolbarItem>
                        <button style={{ width: 200 }}>A</button>
                    </ToolbarItem>
                    <ToolbarItem>
                        <button style={{ width: 200 }}>B</button>
                    </ToolbarItem>
                </Toolbar>
            </div>
        );
        await stable();
        await userEvent.click(screen.container.querySelector<HTMLElement>('button[aria-label="More"]')!);
        await expect.poll(() => document.querySelector('[role="dialog"]')).not.toBeNull();
        await screen.rerender(
            <div style={{ width: 1000 }}>
                <Toolbar shouldOverflow aria-label="Actions">
                    <ToolbarItem>
                        <button style={{ width: 200 }}>A</button>
                    </ToolbarItem>
                    <ToolbarItem>
                        <button style={{ width: 200 }}>B</button>
                    </ToolbarItem>
                </Toolbar>
            </div>
        );
        await expect.poll(() => screen.container.querySelector('button[aria-label="More"]')).toBeNull();
        await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
    });

    it('items keep their state while they move into the popover and back', async () => {
        function Host({ width }: { width: number }) {
            return (
                <div style={{ width }}>
                    <Toolbar shouldOverflow aria-label="Filters">
                        <ToolbarItem>
                            <input aria-label="Search" style={{ width: 200 }} />
                        </ToolbarItem>
                        <ToolbarItem overflowPriority="low">
                            <input aria-label="Name" defaultValue="" style={{ width: 200 }} />
                        </ToolbarItem>
                    </Toolbar>
                </div>
            );
        }
        const screen = await render(<Host width={1000} />);
        await stable();
        await userEvent.type(page.getByRole('textbox', { name: 'Name' }), 'Jane');
        await screen.rerender(<Host width={300} />);
        await stable();
        const toolbar = screen.container.querySelector('[role="toolbar"]')!;
        expect(toolbar.querySelector(':scope > [data-toolbar-item] input[aria-label="Name"]')).toBeNull();
        await screen.rerender(<Host width={1000} />);
        await stable();
        expect(toolbar.querySelector<HTMLInputElement>('input[aria-label="Name"]')!.value).toBe('Jane');
    });

    it('updateCollapsibleItems recomputes the overflow after items change their width', async () => {
        const { toolbar, actions, inRow } = await setupOverflow();
        expect(inRow()).toEqual(['a', 'b', 'c', 'd', 'e', 'g']);
        toolbar.querySelectorAll<HTMLElement>('button[id]').forEach((b) => (b.style.width = '200px'));
        actions.current!.updateCollapsibleItems();
        await stable();
        expect(inRow()).not.toContain('b');
        expect(inRow()).toContain('a');
        expect(inRow()).toContain('e');
    });

    it('recomputes the overflow by itself when items change their width', async () => {
        const { toolbar, inRow, inPanel } = await setupOverflow();
        expect(inRow()).toEqual(['a', 'b', 'c', 'd', 'e', 'g']);
        toolbar.querySelectorAll<HTMLElement>('button[id]').forEach((b) => (b.style.width = '200px'));
        // the low priority item overflows first
        await expect.poll(inRow).toEqual(['a', 'c', 'd', 'e']);
        expect(inPanel()).toEqual(['b', 'g', 'f']);
    });

    it('recomputes the overflow when a hidden toolbar becomes visible', async () => {
        const { rerender, inRow } = await setupOverflow({ width: 500, display: 'none' });
        // while hidden nothing has a width; once shown the items are measured and overflow as usual
        await rerender({ display: 'block' });
        await expect.poll(inRow).toEqual(['a', 'e']);
        await rerender({ width: 1000, display: 'block' });
        await expect.poll(inRow).toEqual(['a', 'b', 'c', 'd', 'e', 'g']);
    });

    function TitleHost({ title }: { title: string }) {
        return (
            <Toolbar shouldOverflow title={title} style={{ width: 600 }}>
                <ToolbarItem>
                    <button id="a" style={{ width: 100 }}>
                        A
                    </button>
                </ToolbarItem>
                <ToolbarItem>
                    <button id="b" style={{ width: 100 }}>
                        B
                    </button>
                </ToolbarItem>
                <ToolbarItem>
                    <button id="c" style={{ width: 100 }}>
                        C
                    </button>
                </ToolbarItem>
            </Toolbar>
        );
    }

    it('a longer title moves more items into the overflow', async () => {
        const screen = await render(<TitleHost title="Short" />);
        await stable();
        const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
        const inRow = () =>
            [...toolbar.querySelectorAll<HTMLElement>(':scope > [data-toolbar-item] button[id]')].map((b) => b.id);
        expect(inRow()).toEqual(['a', 'b', 'c']);
        await screen.rerender(<TitleHost title="A much longer toolbar title that takes most of the room" />);
        await expect.poll(() => inRow().length).toBeLessThan(3);
        expect(toolbar.querySelector('button[aria-label="More"]')).not.toBeNull();
        await screen.rerender(<TitleHost title="Short" />);
        await expect.poll(inRow).toEqual(['a', 'b', 'c']);
    });

    it('the title truncates with an ellipsis and keeps the full text in title', async () => {
        const long = 'A very long toolbar title that does not fit into the toolbar at all, even without items';
        const screen = await render(<TitleHost title={long} />);
        await stable();
        const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
        const heading = toolbar.querySelector<HTMLElement>('[role=heading]')!;
        expect(getComputedStyle(heading).textOverflow).toBe('ellipsis');
        expect(heading.scrollWidth).toBeGreaterThan(heading.clientWidth);
        expect(heading.getBoundingClientRect().right).toBeLessThanOrEqual(toolbar.getBoundingClientRect().right);
        expect(heading.title).toBe(long);
        expect(heading.textContent).toBe(long);
    });

    it('overflown select and menu buttons still open their overlays from the popover', async () => {
        let fruit: string | null = null;
        function Host() {
            const [value, setValue] = useState<string | null>(null);
            return (
                <Toolbar shouldOverflow aria-label="Overlays" style={{ width: 200 }}>
                    <ToolbarOverflowButton label="First" />
                    <ToolbarItem>
                        <Select
                            placeholder="Fruit"
                            aria-label="Fruit"
                            value={value}
                            onValueChange={(next) => {
                                fruit = next as string | null;
                                setValue(next as string | null);
                            }}
                        >
                            <SelectOption value="apple">Apple</SelectOption>
                            <SelectOption value="pear">Pear</SelectOption>
                        </Select>
                    </ToolbarItem>
                    <ToolbarItem>
                        <Menu>
                            <MenuTrigger render={<Button menu label="Menu" />} />
                            <MenuPopup aria-label="Menu">
                                <MenuItem>Option 1</MenuItem>
                            </MenuPopup>
                        </Menu>
                    </ToolbarItem>
                </Toolbar>
            );
        }
        const screen = await render(<Host />);
        await stable();
        const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
        const more = () => toolbar.querySelector<HTMLElement>('button[aria-label="More"]')!;
        await expect.poll(() => toolbar.querySelector(':scope > [data-toolbar-item] [role="combobox"]')).toBeNull();
        await userEvent.click(more());
        await stable();
        const panel = document.querySelector<HTMLElement>('[role="dialog"] [data-toolbar-overflow]')!;
        const combobox = panel.querySelector<HTMLElement>('[role="combobox"]')!;
        await userEvent.click(combobox);
        await expect.poll(() => combobox.getAttribute('aria-expanded')).toBe('true');
        await userEvent.click(page.getByRole('option', { name: 'Pear' }));
        await expect.poll(() => fruit).toBe('pear');

        if (!document.querySelector('[role="dialog"] [data-toolbar-overflow]')) {
            await userEvent.click(more());
            await stable();
        }
        const menuButton = [...panel.querySelectorAll<HTMLElement>('button')].find(
            (b) => b.textContent!.trim() === 'Menu'
        )!;
        await userEvent.click(menuButton);
        await expect.poll(() => menuButton.getAttribute('aria-expanded')).toBe('true');
        expect(document.querySelector('[role=menu] [role=menuitem]')).not.toBeNull();
    });

    it('a long overflow popover scrolls instead of shrinking its items', async () => {
        const screen = await render(
            <div>
                <Button menu label="Reference" data-testid="reference" />
                <Toolbar shouldOverflow forceOverflow aria-label="Long">
                    {Array.from({ length: 30 }, (_, i) => (
                        <ToolbarOverflowButton key={i} label={`Button ${i + 1}`} />
                    ))}
                    <ToolbarItem>
                        <Menu>
                            <MenuTrigger render={<Button menu label="Menu button" />} />
                            <MenuPopup aria-label="Menu button">
                                <MenuItem>Option 1</MenuItem>
                            </MenuPopup>
                        </Menu>
                    </ToolbarItem>
                    <ToolbarItem>
                        <ToolbarSeparator />
                    </ToolbarItem>
                    <ToolbarLabel>Label</ToolbarLabel>
                </Toolbar>
            </div>
        );
        await stable();
        const reference = screen.container.querySelector<HTMLElement>('[data-testid="reference"]')!;
        const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
        await userEvent.click(toolbar.querySelector<HTMLElement>('button[aria-label="More"]')!);
        await stable();
        const panel = document.querySelector<HTMLElement>('[role="dialog"] [data-toolbar-overflow]')!;
        // capped at 50vh, the panel scrolls
        expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);
        const height = reference.getBoundingClientRect().height;
        const menuButton = [...panel.querySelectorAll<HTMLElement>('button')].find(
            (b) => b.textContent!.trim() === 'Menu button'
        )!;
        expect(menuButton.getBoundingClientRect().height).toBe(height);
        for (const button of panel.querySelectorAll<HTMLElement>('button')) {
            expect(button.getBoundingClientRect().height).toBe(height);
        }
        expect(panel.querySelector<HTMLElement>('[role="separator"]')!.getBoundingClientRect().height).toBe(1);
        // a truncated label would shrink to nothing
        expect(
            panel.querySelector<HTMLElement>('[data-toolbar-label]')!.getBoundingClientRect().height
        ).toBeGreaterThan(10);
    });

    it('Tab wraps inside the overflow popover', async () => {
        const { open } = await setupOverflow({ width: 500 });
        await open();
        const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
        await expect.poll(() => document.activeElement).toBe(dialog.querySelector('#d'));
        // d, c, b, f (g is hidden): Tab from the last one goes back to the first
        await userEvent.keyboard('{Tab}{Tab}{Tab}');
        expect(document.activeElement).toBe(dialog.querySelector('#f'));
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(dialog.querySelector('#d'));
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
        expect(document.activeElement).toBe(dialog.querySelector('#f'));
    });

    function PartsHost({
        title = 'Products',
        orientation
    }: {
        title?: string | null;
        orientation?: 'horizontal' | 'vertical';
    }) {
        return (
            <Toolbar title={title} headingLevel={3} aria-orientation={orientation} style={{ width: 600 }}>
                <ToolbarLabel id="label">Filtered by category</ToolbarLabel>
                <ToolbarSpacer id="fixed" fixed width="50px" />
                <button id="one">One</button>
                <ToolbarSeparator />
                <ToolbarSpacer id="flex" />
                <button id="two">Two</button>
            </Toolbar>
        );
    }

    it('spacer, separator, label; title renders a heading', async () => {
        const screen = await render(<PartsHost />);
        const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
        const heading = toolbar.querySelector<HTMLElement>('[role="heading"]')!;
        expect(heading.textContent).toBe('Products');
        expect(heading.getAttribute('aria-level')).toBe('3');
        expect(heading.title).toBe('Products');
        expect(toolbar.firstElementChild).toBe(heading);
        expect(toolbar.getAttribute('aria-labelledby')).toBe(heading.id);
        await expect.element(page.getByRole('toolbar', { name: 'Products' })).toBeInTheDocument();

        expect(toolbar.querySelector('#fixed')!.getBoundingClientRect().width).toBe(50);
        // the flexible spacer pushes the last button to the end
        const end = toolbar.getBoundingClientRect().right - parseFloat(getComputedStyle(toolbar).paddingRight);
        expect(toolbar.querySelector('#two')!.getBoundingClientRect().right).toBeCloseTo(end, 0);
        expect(toolbar.querySelector('#flex')!.getBoundingClientRect().width).toBeGreaterThan(100);
        const separator = toolbar.querySelector<HTMLElement>('[role="separator"]')!;
        expect(separator.getBoundingClientRect().width).toBe(1);
        expect(separator.getBoundingClientRect().height).toBe(32);
        const label = toolbar.querySelector<HTMLElement>('#label')!;
        expect(getComputedStyle(label).textOverflow).toBe('ellipsis');

        await screen.rerender(<PartsHost title={null} />);
        expect(toolbar.querySelector('[role="heading"]')).toBeNull();
        expect(toolbar.getAttribute('aria-labelledby')).toBeNull();
    });

    it('a Title child gives the toolbar the title look', async () => {
        const screen = await render(
            <Toolbar aria-labelledby="projected">
                <Title level={4} id="projected">
                    Projected
                </Title>
            </Toolbar>
        );
        const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
        expect(toolbar.className).toContain('bg-sap-group-title-background');
        await expect.element(page.getByRole('toolbar', { name: 'Projected' })).toBeInTheDocument();
    });

    it('info (active) type is clickable with keyboard', async () => {
        let clicks = 0;
        const host = (active: boolean) => (
            <Toolbar variant="info" active={active} aria-label="Filter info" onClick={() => clicks++}>
                <ToolbarLabel>Filtered by Category</ToolbarLabel>
            </Toolbar>
        );
        const screen = await render(host(true));
        const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
        expect(toolbar.tabIndex).toBe(0);
        await userEvent.click(toolbar);
        expect(clicks).toBe(1);
        toolbar.focus();
        await userEvent.keyboard('{Enter}');
        expect(clicks).toBe(2);
        await userEvent.keyboard(' ');
        expect(clicks).toBe(3);

        await screen.rerender(host(false));
        expect(toolbar.hasAttribute('tabindex')).toBe(false);
        toolbar.focus();
        await userEvent.keyboard('{Enter}');
        expect(clicks).toBe(3);
    });

    it('role toolbar with orientation and labelling', async () => {
        const screen = await render(<PartsHost />);
        const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
        expect(toolbar.getAttribute('aria-orientation')).toBe('horizontal');
        await screen.rerender(<PartsHost orientation="vertical" />);
        expect(toolbar.getAttribute('aria-orientation')).toBe('vertical');
        expect(toolbar.id).toMatch(/^fd-toolbar-/);
        await screen.unmount();

        const overflow = await setupOverflow();
        expect(overflow.toolbar.getAttribute('aria-label')).toBe('Actions');
        expect(overflow.toolbar.getAttribute('aria-labelledby')).toBeNull();
    });

    it('compact density makes the toolbar lower', async () => {
        const screen = await render(<PartsHost />);
        const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
        // a toolbar with a title keeps its height
        expect(toolbar.getBoundingClientRect().height).toBe(44);
        document.documentElement.setAttribute('data-density', 'compact');
        expect(toolbar.getBoundingClientRect().height).toBe(44);
        document.documentElement.removeAttribute('data-density');
        await screen.unmount();

        const { toolbar: plain, inRow } = await setupOverflow({ width: 500 });
        expect(plain.getBoundingClientRect().height).toBe(44);
        expect(inRow()).toEqual(['a', 'e']);
        document.documentElement.setAttribute('data-density', 'compact');
        expect(plain.getBoundingClientRect().height).toBe(32);
        expect(getComputedStyle(plain.querySelector('[role="separator"]')!).height).toBe('24px');
    });

    it('passes className, native props and the ref to the root; items outside a toolbar render in place', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <>
                <Toolbar ref={ref} className="custom" data-testid="toolbar" aria-label="Native">
                    <ToolbarLabel>Label</ToolbarLabel>
                </Toolbar>
                <ToolbarItem>
                    <button id="alone">Alone</button>
                </ToolbarItem>
            </>
        );
        const toolbar = screen.container.querySelector<HTMLElement>('[role="toolbar"]')!;
        expect(ref.current).toBe(toolbar);
        expect(toolbar.classList.contains('custom')).toBe(true);
        expect(toolbar.dataset['testid']).toBe('toolbar');
        expect(screen.container.querySelector('#alone')!.parentElement).toBe(screen.container);
    });
});

describe('toolbarOverflow', () => {
    const item = (priority: OverflowPriority, group = 0, width = 98): ToolbarOverflowItem & { name: string } => ({
        name: `${priority}${group}`,
        priority,
        group,
        width
    });

    it('keeps the items that fit, highest priority first, and overflows the rest', () => {
        const items = [item('low'), item('high'), item('never'), item('always')];
        const names = (available: number) => toolbarOverflow(items, available, 0).map((i) => i.name);
        expect(names(1000)).toEqual(['always0']);
        expect(names(250)).toEqual(['low0', 'always0']);
        expect(names(150)).toEqual(['high0', 'low0', 'always0']);
        // the used width (a title) counts
        expect(toolbarOverflow(items, 250, 100).map((i) => i.name)).toEqual(['high0', 'low0', 'always0']);
    });

    it('overflows a group as a whole, but not its never members', () => {
        const items = [item('high', 1), item('low', 1), item('never', 1), item('high')];
        // only low1 does not fit, but its group overflows with it
        expect(toolbarOverflow(items, 250, 0).map((i) => i.name)).toEqual(['high0', 'high1', 'low1']);
        expect(toolbarOverflow(items, 1000, 0)).toEqual([]);
    });
});
