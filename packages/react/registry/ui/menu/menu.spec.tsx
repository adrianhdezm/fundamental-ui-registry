import { createRef, useState, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    Menu,
    MenuAddon,
    MenuCheckboxItem,
    MenuContent,
    MenuItem,
    MenuItemInput,
    MenuPopup,
    MenuRadioGroup,
    MenuRadioItem,
    MenuShortcut,
    MenuSubtitle,
    MenuTitle,
    MenuTrigger,
    Submenu,
    type MenuMobileConfig,
    type MenuPathItem,
    type MenuProps
} from './menu';

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const wait = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));
const settle = async (ms = 60) => {
    await frame();
    await frame();
    await wait(ms);
};

const items = () => [...document.querySelectorAll<HTMLElement>('[data-menu-link]')];
/** The item element by the text of its title. */
const link = (title: string) =>
    items().find((e) => e.querySelector('[data-menu-title]')?.textContent?.trim() === title);
const item = (text: string) => items().find((e) => e.textContent?.trim() === text)!;
const focused = () => document.activeElement?.textContent?.trim();
const trigger = () => document.querySelector<HTMLElement>('#trigger')!;

/** Mirrors the Angular test host: a submenu, a disabled item, a leaf, a toggle and a single-choice group. */
function Host({ onPath, onLeaf }: { onPath?: (path: MenuPathItem[]) => void; onLeaf?: () => void }) {
    const [toggled, setToggled] = useState(false);
    const [sort, setSort] = useState<unknown>('asc');
    return (
        <>
            <output data-testid="state">{`${toggled}|${String(sort)}`}</output>
            <Menu onActivePathChange={onPath}>
                <MenuTrigger id="trigger">Open</MenuTrigger>
                <MenuPopup aria-label="Test menu">
                    <MenuItem
                        submenu={
                            <>
                                <MenuItem>Child 1</MenuItem>
                                <MenuItem>Child 2</MenuItem>
                            </>
                        }
                    >
                        <MenuTitle>Parent</MenuTitle>
                        <MenuAddon submenuIndicator />
                    </MenuItem>
                    <MenuItem disabled>Disabled</MenuItem>
                    <MenuItem onClick={onLeaf}>Leaf</MenuItem>
                    <MenuCheckboxItem checked={toggled} onCheckedChange={setToggled}>
                        Toggle
                    </MenuCheckboxItem>
                    <MenuItem hasSeparator>Sort</MenuItem>
                    <MenuRadioGroup aria-label="Sort" value={sort} onValueChange={setSort}>
                        <MenuRadioItem value="asc">Asc</MenuRadioItem>
                        <MenuRadioItem value="desc">Desc</MenuRadioItem>
                    </MenuRadioGroup>
                </MenuPopup>
            </Menu>
        </>
    );
}

async function open(props: Parameters<typeof Host>[0] = {}) {
    const screen = await render(<Host {...props} />);
    await settle();
    await userEvent.click(trigger());
    await settle();
    return screen;
}

describe('Menu', () => {
    it('opens from its trigger, announces it and focuses the first item', async () => {
        await open();
        expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
        expect(document.getElementById(trigger().getAttribute('aria-controls')!)!.getAttribute('role')).toBe('menu');
        expect(focused()).toBe('Parent');
        expect(item('Leaf').getAttribute('aria-posinset')).toBe('3');
        expect(item('Leaf').getAttribute('aria-setsize')).toBe('7');
    });

    it('skips disabled items with the arrow keys and closes on Escape', async () => {
        await open();
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Leaf');
        await userEvent.keyboard('{ArrowUp}');
        expect(focused()).toBe('Parent');
        await userEvent.keyboard('{End}');
        expect(focused()).toBe('Desc');
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(trigger());
    });

    it('opens a submenu with ArrowRight and returns with ArrowLeft', async () => {
        const paths: number[] = [];
        await open({ onPath: (path) => paths.push(path.length) });
        await userEvent.keyboard('{ArrowRight}');
        await settle();
        const parent = item('Parent');
        expect(parent.getAttribute('aria-expanded')).toBe('true');
        expect(focused()).toBe('Child 1');
        expect(paths.at(-1)).toBe(1);
        await userEvent.keyboard('{ArrowLeft}');
        await settle();
        expect(parent.getAttribute('aria-expanded')).toBe('false');
        expect(focused()).toBe('Parent');
        expect(paths.at(-1)).toBe(0);
    });

    it('mirrors ArrowRight and ArrowLeft in RTL', async () => {
        const { DirectionProvider } = await import('@base-ui/react/direction-provider');
        await render(
            <DirectionProvider direction="rtl">
                <div dir="rtl">
                    <Host />
                </div>
            </DirectionProvider>
        );
        await settle();
        await userEvent.click(trigger());
        await settle();
        await userEvent.keyboard('{ArrowRight}');
        await settle();
        expect(item('Parent').getAttribute('aria-expanded')).toBe('false');
        await userEvent.keyboard('{ArrowLeft}');
        await settle();
        expect(focused()).toBe('Child 1');
        await userEvent.keyboard('{ArrowRight}');
        await settle();
        expect(focused()).toBe('Parent');
    });

    it('selects a plain item and closes the menu', async () => {
        let selected = 0;
        await open({ onLeaf: () => selected++ });
        await userEvent.keyboard('{ArrowDown}{Enter}');
        await settle();
        expect(selected).toBe(1);
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('keeps the menu open for toggles and single-choice options', async () => {
        const screen = await open();
        await userEvent.click(item('Toggle'));
        await settle();
        expect(screen.getByTestId('state').element().textContent).toBe('true|asc');
        expect(item('Toggle').getAttribute('role')).toBe('menuitemcheckbox');
        expect(item('Toggle').getAttribute('aria-checked')).toBe('true');
        await userEvent.click(item('Desc'));
        await settle();
        expect(screen.getByTestId('state').element().textContent).toBe('true|desc');
        expect(item('Desc').getAttribute('role')).toBe('menuitemradio');
        expect(item('Desc').getAttribute('aria-checked')).toBe('true');
        expect(item('Asc').getAttribute('aria-checked')).toBe('false');
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('a second trigger click closes the menu', async () => {
        await open();
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
        await userEvent.click(trigger());
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
        expect(link('Leaf')).toBeUndefined();
        await userEvent.click(trigger());
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('Enter and Space on a submenu parent open it and focus its first child', async () => {
        await open();
        expect(focused()).toBe('Parent');
        await userEvent.keyboard('{Enter}');
        await settle();
        expect(item('Parent').getAttribute('aria-expanded')).toBe('true');
        expect(focused()).toBe('Child 1');
        await userEvent.keyboard('{ArrowLeft}');
        await settle();
        expect(item('Parent').getAttribute('aria-expanded')).toBe('false');
        await userEvent.keyboard(' ');
        await settle();
        expect(item('Parent').getAttribute('aria-expanded')).toBe('true');
        expect(focused()).toBe('Child 1');
    });

    it('shows a check mark on a toggle that is on and a dot on the chosen option', async () => {
        await open();
        const mark = (el: HTMLElement) => el.querySelector<HTMLElement>('[data-menu-mark]')!;
        expect(mark(item('Toggle')).querySelector('[data-glyph]')).toBeNull();
        await userEvent.click(item('Toggle'));
        await settle();
        const check = mark(item('Toggle')).querySelector<HTMLElement>('[data-glyph]')!;
        expect(check.getBoundingClientRect().width).toBeGreaterThan(0);
        const dot = () => mark(item('Asc')).querySelector<HTMLElement>('span');
        expect(dot()!.getBoundingClientRect().width).toBeGreaterThan(0);
        expect(mark(item('Desc')).querySelector('span')).toBeNull();
        await userEvent.click(item('Desc'));
        await settle();
        expect(dot()).toBeNull();
        expect(mark(item('Desc')).querySelector('span')).not.toBeNull();
    });
});

const LONG = 'A very long menu item text that does not fit into the width of the menu and wraps or is truncated';

interface ConfigProps extends MenuProps {
    truncate?: boolean;
    hideShortcut?: boolean;
    events?: string[];
    onLeaf?: () => void;
    onLastDisabled?: () => void;
    popupId?: string;
}

/** A menu whose options all come from props. */
function ConfigHost({
    truncate = false,
    hideShortcut = true,
    events = [],
    onLeaf,
    onLastDisabled,
    popupId,
    ...menu
}: ConfigProps) {
    return (
        <>
            <Menu
                {...menu}
                onOpenChange={(next, details) => {
                    const rendered = !!document.querySelector('[aria-label="Configurable menu"]');
                    if (next) events.push(rendered ? 'beforeOpen (rendered)' : 'beforeOpen');
                    events.push(`openChange: ${next}`);
                    menu.onOpenChange?.(next, details);
                }}
            >
                <MenuTrigger id="trigger">Open</MenuTrigger>
                <MenuPopup aria-label="Configurable menu" id={popupId}>
                    <MenuItem disabled>First disabled</MenuItem>
                    <MenuItem
                        submenu={
                            <Submenu aria-label="Children">
                                <MenuItem>Child 1</MenuItem>
                                <MenuItem>Child 2</MenuItem>
                            </Submenu>
                        }
                    >
                        <MenuTitle>Parent</MenuTitle>
                        <MenuAddon submenuIndicator />
                    </MenuItem>
                    <MenuItem onClick={onLeaf}>
                        <MenuAddon glyph="cart" />
                        <MenuContent>
                            <MenuTitle truncate={truncate}>{LONG}</MenuTitle>
                            <MenuSubtitle truncate={truncate}>{LONG}</MenuSubtitle>
                        </MenuContent>
                        <MenuAddon glyph="decline" />
                    </MenuItem>
                    <MenuItem>
                        <MenuTitle>Save</MenuTitle>
                        <MenuShortcut hideOnMobile={hideShortcut}>Ctrl + S</MenuShortcut>
                    </MenuItem>
                    <MenuItem disabled onClick={onLastDisabled}>
                        Last disabled
                    </MenuItem>
                </MenuPopup>
            </Menu>
            <button id="outside">Outside</button>
        </>
    );
}

async function setup(initial: ConfigProps = {}) {
    let current = initial;
    const screen = await render(<ConfigHost {...current} />);
    await settle();
    return {
        screen,
        update: async (change: Partial<ConfigProps>) => {
            current = { ...current, ...change };
            await screen.rerender(<ConfigHost {...current} />);
            await settle();
        }
    };
}

const dialog = () => document.querySelector<HTMLElement>('[role=dialog]');

describe('Menu options', () => {
    it('a disabled menu does not open from its trigger', async () => {
        const events: string[] = [];
        const { update } = await setup({ disabled: true, events });
        await userEvent.click(trigger(), { force: true });
        await settle();
        expect(document.querySelector('[role=menu]')).toBeNull();
        trigger().focus();
        await userEvent.keyboard('{ArrowDown}');
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
        await update({ mobile: true });
        await userEvent.click(trigger(), { force: true });
        await settle();
        expect(dialog()).toBeNull();
        expect(events).toEqual([]);
    });

    it('a menu disabled while open closes', async () => {
        const { update } = await setup();
        await userEvent.click(trigger());
        await settle();
        expect(link('Save')).toBeDefined();
        await update({ disabled: true });
        expect(link('Save')).toBeUndefined();
    });

    it('placement, fillControlMode and bodyClassName shape the popup', async () => {
        await render(
            <Menu placement="top-start" fillControlMode="equal">
                <MenuTrigger id="trigger" style={{ width: 320, marginTop: 300 }}>
                    Open
                </MenuTrigger>
                <MenuPopup aria-label="Plain menu" bodyClassName="config-body">
                    <MenuItem>Option 1</MenuItem>
                    <MenuItem>Option 2</MenuItem>
                </MenuPopup>
            </Menu>
        );
        await settle();
        await userEvent.click(trigger());
        await settle();
        const body = document.querySelector<HTMLElement>('.config-body')!;
        expect(body).not.toBeNull();
        expect(body.getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger().getBoundingClientRect().top + 1);
        expect(Math.round(body.getBoundingClientRect().width)).toBe(
            Math.round(trigger().getBoundingClientRect().width)
        );
    });

    it('controlled open renders the items only while open and reports user changes', async () => {
        const events: string[] = [];
        const { update } = await setup({ open: false, events });
        expect(link('Save')).toBeUndefined();
        await update({ open: true });
        expect(link('Save')).toBeDefined();
        await update({ open: false });
        expect(link('Save')).toBeUndefined();
        // controlled changes are not reported; a user change is, once
        expect(events).toEqual([]);
        await userEvent.click(trigger());
        await settle();
        expect(events).toEqual(['beforeOpen', 'openChange: true']);
        // the change is not applied until the prop follows
        expect(link('Save')).toBeUndefined();
    });

    it('onOpenChange(true) comes once per opening, before the items render', async () => {
        const events: string[] = [];
        await setup({ events });
        await userEvent.click(trigger());
        await settle();
        await userEvent.keyboard('{Escape}');
        await settle();
        await userEvent.click(trigger());
        await settle();
        expect(events.filter((e) => e.startsWith('beforeOpen'))).toEqual(['beforeOpen', 'beforeOpen']);
    });

    it('Home and End focus the first and last enabled items, without wrapping', async () => {
        await setup();
        await userEvent.click(trigger());
        await settle();
        expect(document.activeElement).toBe(link('Parent'));
        await userEvent.keyboard('{End}');
        expect(document.activeElement).toBe(link('Save'));
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(link('Save'));
        await userEvent.keyboard('{Home}');
        expect(document.activeElement).toBe(link('Parent'));
        await userEvent.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(link('Parent'));
    });

    it('Space activates the focused item and closes the menu', async () => {
        let selected = 0;
        await setup({ onLeaf: () => selected++ });
        await userEvent.click(trigger());
        await settle();
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(link(LONG));
        await userEvent.keyboard(' ');
        await settle();
        expect(selected).toBe(1);
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('clicking a disabled item does nothing', async () => {
        let selected = 0;
        await setup({ onLastDisabled: () => selected++ });
        await userEvent.click(trigger());
        await settle();
        const disabled = link('Last disabled')!;
        expect(disabled.getAttribute('aria-disabled')).toBe('true');
        expect(disabled.getAttribute('tabindex')).toBe('-1');
        disabled.click();
        await settle();
        expect(selected).toBe(0);
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('Tab closes a desktop menu', async () => {
        await setup();
        await userEvent.click(trigger());
        await settle();
        await userEvent.keyboard('{Tab}');
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('closes on outside click unless closeOnOutsideClick is false, and on Escape unless closeOnEscapeKey is false', async () => {
        const { update } = await setup();
        await userEvent.click(trigger());
        await settle();
        await userEvent.click(document.querySelector<HTMLElement>('#outside')!);
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
        await update({ closeOnOutsideClick: false, closeOnEscapeKey: false });
        await userEvent.click(trigger());
        await settle();
        await userEvent.click(document.querySelector<HTMLElement>('#outside')!);
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
        link('Parent')!.focus();
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('hovering a submenu parent opens it after openOnHoverTime and hovering a sibling closes it', async () => {
        const { update } = await setup();
        await userEvent.click(trigger());
        await settle();
        const parent = link('Parent')!;
        await userEvent.hover(parent);
        await settle(100);
        expect(parent.getAttribute('aria-expanded')).toBe('true');
        expect(link('Child 1')).toBeDefined();
        // Base UI blocks pointer events outside the submenu while the pointer heads to it
        await userEvent.hover(link('Save')!, { force: true });
        await settle(150);
        expect(parent.getAttribute('aria-expanded')).toBe('false');
        await update({ openOnHoverTime: 300 });
        await userEvent.hover(link('Parent')!, { force: true });
        await wait(100);
        expect(link('Parent')!.getAttribute('aria-expanded')).toBe('false');
        await wait(400);
        expect(link('Parent')!.getAttribute('aria-expanded')).toBe('true');
    });

    it('submenu parents announce their submenu except in mobile mode', async () => {
        const { update } = await setup();
        await userEvent.click(trigger());
        await settle();
        let parent = link('Parent')!;
        expect(parent.getAttribute('aria-haspopup')).toBe('menu');
        expect(parent.getAttribute('aria-expanded')).toBe('false');
        await userEvent.keyboard('{ArrowRight}');
        await settle();
        const submenu = document.getElementById(parent.getAttribute('aria-controls')!)!;
        expect(submenu.querySelector('[role=menu]')!.getAttribute('aria-label')).toBe('Children');
        expect(link('Save')!.hasAttribute('aria-haspopup')).toBe(false);
        await userEvent.keyboard('{Escape}');
        await settle();
        await update({ mobile: true });
        await userEvent.click(trigger());
        await expect.poll(dialog).not.toBeNull();
        await settle();
        parent = link('Parent')!;
        expect(parent.hasAttribute('aria-haspopup')).toBe(false);
        expect(parent.hasAttribute('aria-expanded')).toBe(false);
        expect(parent.hasAttribute('aria-controls')).toBe(false);
    });

    it('Escape in a submenu closes the whole menu', async () => {
        await setup();
        await userEvent.click(trigger());
        await settle();
        await userEvent.keyboard('{ArrowRight}');
        await settle();
        expect(focused()).toBe('Child 1');
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(trigger());
    });

    it('mobile mode opens a dialog with the mobileConfig title and buttons', async () => {
        const config: MenuMobileConfig = {
            title: 'Groceries',
            approveButtonText: 'Apply',
            cancelButtonText: 'Cancel',
            hasCloseButton: true
        };
        const { update } = await setup({ mobile: true, mobileConfig: config });
        const button = (name: string) =>
            [...dialog()!.querySelectorAll<HTMLElement>('button')].find(
                (b) => b.textContent!.trim().startsWith(name) || b.getAttribute('aria-label') === name
            );
        for (const name of ['Apply', 'Cancel', 'Close']) {
            await userEvent.click(trigger());
            await expect.poll(dialog).not.toBeNull();
            await settle();
            expect(trigger().getAttribute('aria-expanded')).toBe('true');
            const title = document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!;
            expect(title.textContent!.trim()).toBe('Groceries');
            expect(document.activeElement).toBe(link('Parent'));
            expect(button(name)).toBeDefined();
            await userEvent.click(button(name)!);
            await expect.poll(dialog).toBeNull();
            expect(trigger().getAttribute('aria-expanded')).toBe('false');
        }
        await update({ mobileConfig: { title: 'Groceries', hasCloseButton: false } });
        await userEvent.click(trigger());
        await expect.poll(dialog).not.toBeNull();
        await settle();
        expect(button('Close')).toBeUndefined();
        expect(button('Apply')).toBeUndefined();
    });

    it('mobile mode navigates into a submenu and back', async () => {
        const paths: number[] = [];
        await setup({
            mobile: true,
            mobileConfig: { title: 'Groceries' },
            onActivePathChange: (path) => paths.push(path.length)
        });
        await userEvent.click(trigger());
        await expect.poll(dialog).not.toBeNull();
        await settle();
        const heading = () => dialog()!.querySelector<HTMLElement>('h1')!.textContent!.trim();
        expect(heading()).toBe('Groceries');
        await userEvent.click(link('Parent')!);
        await settle();
        expect(heading()).toBe('Parent');
        expect(paths.at(-1)).toBe(1);
        expect(link('Save')!.checkVisibility()).toBe(false);
        expect(document.activeElement).toBe(link('Child 1'));
        const back = document.querySelector<HTMLElement>('[aria-label="Go to previous menu level: Parent"]')!;
        await userEvent.click(back);
        await settle();
        expect(heading()).toBe('Groceries');
        expect(link('Child 1')).toBeUndefined();
        expect(document.activeElement).toBe(link('Parent'));
        // the arrow keys move between the enabled items of the level, Enter activates
        await userEvent.keyboard('{ArrowDown}{ArrowDown}');
        expect(document.activeElement).toBe(link('Save'));
        await userEvent.keyboard('{Enter}');
        await expect.poll(dialog).toBeNull();
    });

    it('hides shortcuts in mobile mode unless hideOnMobile is false', async () => {
        const { update } = await setup();
        const shortcut = () => link('Save')!.lastElementChild as HTMLElement;
        await userEvent.click(trigger());
        await settle();
        expect(shortcut().getBoundingClientRect().width).toBeGreaterThan(0);
        await userEvent.keyboard('{Escape}');
        await update({ mobile: true });
        await userEvent.click(trigger());
        await expect.poll(dialog).not.toBeNull();
        await settle();
        expect(getComputedStyle(shortcut()).display).toBe('none');
        await update({ hideShortcut: false });
        expect(shortcut().getBoundingClientRect().width).toBeGreaterThan(0);
    });

    it('renders addons before and after the title', async () => {
        await setup();
        await userEvent.click(trigger());
        await settle();
        const el = link(LONG)!;
        const addons = [...el.querySelectorAll<HTMLElement>(':scope > [aria-hidden=true]')];
        const [before, after] = addons.map((a) => a.getBoundingClientRect());
        const title = el.querySelector<HTMLElement>('[data-menu-title]')!.getBoundingClientRect();
        expect(before!.right).toBeLessThanOrEqual(title.left + 1);
        expect(after!.left).toBeGreaterThanOrEqual(title.right - 1);
    });

    it('a list with icons aligns texts after the icon column', async () => {
        await setup();
        await userEvent.click(trigger());
        await settle();
        const save = link('Save')!;
        const long = link(LONG)!;
        const saveTitle = save.querySelector<HTMLElement>('[data-menu-title]')!.getBoundingClientRect();
        const longTitle = long.querySelector<HTMLElement>('[data-menu-title]')!.getBoundingClientRect();
        expect(Math.abs(saveTitle.left - longTitle.left)).toBeLessThan(1);
    });

    it('truncate clips the title and subtitle to one line', async () => {
        const { update } = await setup();
        await userEvent.click(trigger());
        await settle();
        const el = () => link(LONG)!;
        const line = link('Save')!.querySelector<HTMLElement>('[data-menu-title]')!.offsetHeight;
        const texts = () => [
            el().querySelector<HTMLElement>('[data-menu-title]')!,
            el().querySelector<HTMLElement>('[data-menu-title] + span')!
        ];
        for (const text of texts()) expect(text.offsetHeight).toBeGreaterThan(line * 1.5);
        await update({ truncate: true });
        for (const text of texts()) {
            expect(text.offsetHeight).toBeLessThan(line * 1.5);
            expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
            expect(getComputedStyle(text).textOverflow).toBe('ellipsis');
        }
    });

    it('disableScrollbar removes the scroll container', async () => {
        const { update } = await setup();
        const scroller = () => {
            const popup = document.querySelector('[aria-label="Configurable menu"]')!;
            for (let el = popup.parentElement; el && el.getAttribute('role') !== 'presentation'; el = el.parentElement)
                if (getComputedStyle(el).overflowY === 'auto') return el;
            return null;
        };
        await userEvent.click(trigger());
        await settle();
        expect(scroller()).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await update({ disableScrollbar: true });
        await userEvent.click(trigger());
        await settle();
        expect(document.querySelector('[aria-label="Configurable menu"]')).not.toBeNull();
        expect(scroller()).toBeNull();
    });

    it('restoreFocusOnClose=false leaves the focus where it was', async () => {
        await setup({ restoreFocusOnClose: false });
        await userEvent.click(trigger());
        await settle();
        expect(document.activeElement).toBe(link('Parent'));
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).not.toBe(trigger());
    });

    it('focusAutoCapture=false leaves the focus on the trigger', async () => {
        await setup({ focusAutoCapture: false });
        await userEvent.click(trigger());
        await settle();
        expect(link('Parent')).toBeDefined();
        expect(document.activeElement).not.toBe(link('Parent'));
    });

    it('hover triggers open the menu on hover and not on click', async () => {
        await setup({ triggers: ['mouseenter', 'mouseleave'] });
        await userEvent.hover(trigger());
        await settle(100);
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
        await userEvent.hover(document.querySelector<HTMLElement>('#outside')!, { force: true });
        await settle(200);
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('the menu id names the menu element for aria-controls', async () => {
        await setup({ popupId: 'my-menu' });
        await userEvent.click(trigger());
        await settle();
        expect(trigger().getAttribute('aria-controls')).toBe('my-menu');
        expect(document.getElementById('my-menu')!.getAttribute('role')).toBe('menu');
    });
});

describe('Menu items', () => {
    async function openMenu(children: ReactNode, props: MenuProps = {}) {
        await render(
            <Menu defaultOpen {...props}>
                <MenuTrigger id="trigger">Open</MenuTrigger>
                <MenuPopup aria-label="Items">{children}</MenuPopup>
            </Menu>
        );
        await settle();
    }

    it('an input keeps the menu open, takes the focus on Enter and keeps its keys', async () => {
        await openMenu(
            <>
                <MenuItem>
                    <MenuItemInput aria-label="Text" />
                </MenuItem>
                <MenuItem>After</MenuItem>
            </>
        );
        const input = document.querySelector<HTMLInputElement>('input')!;
        const el = input.closest<HTMLElement>('[data-menu-link]')!;
        el.focus();
        await userEvent.keyboard('{Enter}');
        expect(document.activeElement).toBe(input);
        await userEvent.keyboard('ab{ArrowDown}');
        expect(input.value).toBe('ab');
        expect(document.activeElement).toBe(input);
        await userEvent.click(input);
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('closeOnSelect=false keeps the menu open after a plain item', async () => {
        await openMenu(<MenuItem>Keep</MenuItem>, { closeOnSelect: false });
        await userEvent.click(item('Keep'));
        await settle();
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('selected and an open submenu show the selection colours, separators draw a line', async () => {
        await openMenu(
            <>
                <MenuItem selected hasSeparator>
                    Selected
                </MenuItem>
                <MenuItem>Plain</MenuItem>
            </>
        );
        const bg = (text: string) => getComputedStyle(item(text)).backgroundColor;
        expect(bg('Selected')).not.toBe(bg('Plain'));
        const li = item('Selected').parentElement!;
        expect(getComputedStyle(li).borderBottomWidth).toBe('1px');
        expect(getComputedStyle(item('Plain').parentElement!).borderBottomWidth).toBe('0px');
    });

    it('href renders a link item', async () => {
        await openMenu(<MenuItem href="#target">Link</MenuItem>);
        const el = item('Link');
        expect(el.tagName).toBe('A');
        expect(el.getAttribute('href')).toBe('#target');
        expect(el.getAttribute('role')).toBe('menuitem');
    });

    it('a submenu from data opens level by level', async () => {
        interface Node {
            title: string;
            children: Node[];
        }
        const tree: Node[] = [
            { title: 'Documents', children: [{ title: 'Shared', children: [{ title: 'With me', children: [] }] }] }
        ];
        const renderNode = (node: Node): ReactNode => (
            <MenuItem key={node.title} submenu={node.children.length ? node.children.map(renderNode) : undefined}>
                {node.title}
            </MenuItem>
        );
        await openMenu(tree.map(renderNode));
        item('Documents').focus();
        await userEvent.keyboard('{ArrowRight}');
        await settle();
        await userEvent.keyboard('{ArrowRight}');
        await settle();
        expect(focused()).toBe('With me');
    });
});

describe('fundamental-react', () => {
    it('passes className, native props and the ref to the menu, its item and the item <li>', async () => {
        const menuRef = createRef<HTMLElement>();
        const itemRef = createRef<HTMLElement>();
        await render(
            <Menu defaultOpen>
                <MenuTrigger>Open</MenuTrigger>
                <MenuPopup aria-label="Spread" data-sample="menu" className="custom-menu" ref={menuRef}>
                    <MenuItem
                        data-sample="item"
                        className="custom-item"
                        ref={itemRef}
                        listItemProps={{ 'data-sample': 'li' } as object}
                        addonBefore="accept"
                    >
                        Option 1
                    </MenuItem>
                </MenuPopup>
            </Menu>
        );
        await settle();
        expect(menuRef.current!.tagName).toBe('NAV');
        expect(menuRef.current!.getAttribute('data-sample')).toBe('menu');
        expect(menuRef.current!.classList.contains('custom-menu')).toBe(true);
        expect(itemRef.current!.getAttribute('data-sample')).toBe('item');
        expect(itemRef.current!.classList.contains('custom-item')).toBe(true);
        expect(itemRef.current!.parentElement!.getAttribute('data-sample')).toBe('li');
        expect(itemRef.current!.querySelector('[data-glyph]')).not.toBeNull();
    });

    it('url (href), addonBefore and addonAfter render a link with icons', async () => {
        await render(
            <Menu defaultOpen>
                <MenuTrigger>Open</MenuTrigger>
                <MenuPopup aria-label="Addons">
                    <MenuItem href="/" addonBefore="history" addonAfter="accept">
                        Option 3
                    </MenuItem>
                </MenuPopup>
            </Menu>
        );
        await settle();
        const el = item('Option 3');
        expect(el.tagName).toBe('A');
        expect(el.querySelectorAll('[data-glyph]')).toHaveLength(2);
    });
});
