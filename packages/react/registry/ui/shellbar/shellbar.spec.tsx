import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Button } from '@/ui/button/button';
import { MenuItem } from '@/ui/menu/menu';
import { ProductSwitch, ProductSwitchBody } from '@/ui/product-switch/product-switch';
import {
    ProductMenu,
    Shellbar,
    ShellbarAction,
    ShellbarActions,
    ShellbarBranding,
    ShellbarContextArea,
    ShellbarSearch,
    ShellbarTitle,
    ShellbarUserMenu,
    type ShellbarGroupFlexOptions,
    type ShellbarMenuItem,
    type ShellbarSize,
    type ShellbarUserMenuItem
} from './shellbar';

interface HostProps {
    width?: number;
    size?: ShellbarSize;
    context?: boolean;
    toggled?: boolean;
    onClicked?: (what: string) => void;
    onSearched?: (text: string) => void;
    onHidden?: (items: HTMLElement[]) => void;
    onToggle?: () => void;
    productSwitch?: boolean;
}

/** Mirrors the Angular test host. */
function Host({
    width = 1300,
    size,
    context = false,
    toggled = false,
    onClicked,
    onSearched,
    onHidden,
    onToggle,
    productSwitch = false
}: HostProps) {
    return (
        <div style={{ width }}>
            <Shellbar
                size={size}
                showNavigationButton
                showBackButton
                onNavigationButtonClick={() => onClicked?.('navigation')}
                onBackButtonClick={() => onClicked?.('back')}
            >
                <ShellbarBranding interactiveBranding aria-label="Home" onClick={() => onClicked?.('home')}>
                    <ShellbarTitle>Corporate Portal</ShellbarTitle>
                </ShellbarBranding>
                {context && (
                    <ShellbarContextArea onContentItemVisibilityChange={onHidden}>
                        <span className="inline-block w-40" data-hide-priority="1">
                            First
                        </span>
                        <span className="inline-block w-40" data-hide-priority="2">
                            Second
                        </span>
                    </ShellbarContextArea>
                )}
                <ShellbarSearch onSearchSubmit={onSearched} />
                <ShellbarActions
                    productSwitch={
                        productSwitch && (
                            <ProductSwitch>
                                <ProductSwitchBody
                                    forceListMode
                                    defaultProducts={[
                                        { title: 'Fiori Home', icon: 'home', callback: () => onClicked?.('home') },
                                        { title: 'S/4 HANA Cloud', icon: 'cloud' }
                                    ]}
                                />
                            </ProductSwitch>
                        )
                    }
                >
                    <ShellbarAction
                        glyph="bell"
                        label="Notifications"
                        notificationCount={3}
                        onClick={() => onClicked?.('notifications')}
                    />
                    <ShellbarAction glyph="feedback" label="Feedback" toggled={toggled} onClick={onToggle} />
                    <ShellbarAction glyph="sys-help" label="Help" />
                </ShellbarActions>
            </Shellbar>
        </div>
    );
}

const wait = (ms = 100) => new Promise((r) => setTimeout(r, ms));
const menuItems = () => [...document.querySelectorAll<HTMLElement>('[role=menuitem]')];

async function setup(props: HostProps = {}) {
    const screen = await render(<Host {...props} />);
    await wait(150);
    const root = screen.container;
    const bar = () => root.querySelector<HTMLElement>('[data-size]')!;
    const button = (name: RegExp) =>
        [...root.querySelectorAll<HTMLElement>('button')].find(
            (b) => name.test(b.getAttribute('aria-label') ?? '') && b.offsetParent !== null
        );
    const search = () => root.querySelector<HTMLElement>('[role=search]');
    return { screen, root, bar, button, search };
}

interface MenuHostProps {
    groupFlex?: ShellbarGroupFlexOptions | null;
    onPicked?: (what: string) => void;
}

function MenuHost({ groupFlex = null, onPicked }: MenuHostProps) {
    const items: ShellbarMenuItem[] = [
        { name: 'Application A', callback: () => onPicked?.('A') },
        { name: 'Application B', callback: () => onPicked?.('B') }
    ];
    const userMenu: ShellbarUserMenuItem[] = [
        { text: 'Settings', callback: () => onPicked?.('Settings') },
        { text: 'Sign Out', callback: () => onPicked?.('Sign Out') }
    ];
    return (
        <Shellbar groupFlex={groupFlex}>
            <ProductMenu control="Corporate Portal" items={items} closePopoverOnSelect data-testid="product" />
            <ShellbarActions user={{ fullName: 'Lisa Miller' }} userMenu={userMenu} closePopoverOnSelect>
                <ShellbarAction glyph="bell" label="Notifications" />
            </ShellbarActions>
        </Shellbar>
    );
}

async function setupMenus(props: MenuHostProps = {}) {
    const screen = await render(<MenuHost {...props} />);
    await wait(150);
    return { screen, root: screen.container };
}

describe('Shellbar', () => {
    it('takes its size from its width and shows the search in the middle when extra large', async () => {
        const { bar, search } = await setup({ width: 1300 });
        expect(bar().dataset['size']).toBe('xl');
        expect(search()!.parentElement!.closest('[data-size]')).toBe(bar());
        expect(search()!.offsetParent).not.toBeNull();
    });

    it('follows width changes and custom breakpoints', async () => {
        const { screen, bar } = await setup({ width: 1300 });
        await screen.rerender(<Host width={1000} />);
        await wait(150);
        expect(bar().dataset['size']).toBe('l');
        await screen.rerender(<Host width={500} />);
        await wait(150);
        expect(bar().dataset['size']).toBe('m');
        await screen.rerender(<Host width={300} />);
        await wait(150);
        expect(bar().dataset['size']).toBe('s');
        await screen.rerender(<Host width={300} size="xl" />);
        await wait(150);
        expect(bar().dataset['size']).toBe('xl');

        const custom = await render(
            <div style={{ width: 500 }}>
                <Shellbar breakpoints={{ s: 0, m: 200, l: 400, xl: 2000 }} data-testid="custom" />
            </div>
        );
        await wait(150);
        expect(custom.container.querySelector<HTMLElement>('[data-testid=custom]')!.dataset['size']).toBe('l');
    });

    it('names actions with their notifications and runs their callbacks', async () => {
        const onClicked = vi.fn();
        const { button } = await setup({ onClicked });
        const bell = button(/^Notifications/)!;
        expect(bell.getAttribute('aria-label')).toBe('Notifications, 3');
        expect(bell.getAttribute('title')).toBe('Notifications');
        expect(bell.textContent).toBe('3');
        await userEvent.click(bell);
        expect(onClicked).toHaveBeenCalledWith('notifications');
    });

    it('makes the interactive branding a link reachable with the keyboard', async () => {
        const onClicked = vi.fn();
        const { root } = await setup({ onClicked });
        const branding = root.querySelector<HTMLElement>('[data-shellbar-branding]')!;
        expect(branding.getAttribute('role')).toBe('link');
        expect(branding.tabIndex).toBe(0);
        expect(branding.getAttribute('aria-label')).toBe('Home');
        branding.focus();
        await userEvent.keyboard('{Enter}');
        expect(onClicked).toHaveBeenCalledWith('home');
    });

    it('opens the search from a button below extra large and submits it', async () => {
        const onSearched = vi.fn();
        const { button, bar, search } = await setup({ width: 1000, onSearched });
        expect(bar().dataset['size']).toBe('l');
        expect(search()!.offsetParent).toBeNull();
        await userEvent.click(button(/^Search$/)!);
        await wait();
        const input = search()!.querySelector('input')!;
        expect(search()!.offsetParent).not.toBeNull();
        expect(document.activeElement).toBe(input);
        await userEvent.keyboard('orders{Enter}');
        expect(onSearched).toHaveBeenCalledWith('orders');
    });

    it('closes the search opened from its button with Escape or an empty search, and clears the text', async () => {
        const onSearched = vi.fn();
        const { button, search } = await setup({ width: 1000, onSearched });
        await userEvent.click(button(/^Search$/)!);
        await wait();
        await userEvent.keyboard('{Escape}');
        await wait();
        expect(search()!.offsetParent).toBeNull();
        expect(button(/^Search$/)).toBeDefined();

        await userEvent.click(button(/^Search$/)!);
        await wait();
        await userEvent.keyboard('abc');
        await userEvent.click(button(/^Clear$/)!);
        expect(search()!.querySelector('input')!.value).toBe('');
        expect(document.activeElement).toBe(search()!.querySelector('input'));
        expect(button(/^Clear$/)).toBeUndefined();
        await userEvent.click(button(/^Search$/)!);
        await wait();
        expect(onSearched).toHaveBeenCalledWith('');
        expect(search()!.offsetParent).toBeNull();
    });

    it('collapses actions that do not fit into an overflow menu', async () => {
        const { button, bar } = await setup({ width: 340 });
        expect(bar().dataset['size']).toBe('m');
        expect(button(/^Help$/)).toBeUndefined();
        const overflow = button(/^Collapsed Item Menu/)!;
        expect(overflow.getAttribute('aria-label')).toBe('Collapsed Item Menu, 3');
        await userEvent.click(overflow);
        await wait();
        expect(menuItems().map((i) => i.textContent?.trim())).toEqual(['Search', 'Notifications3', 'Feedback', 'Help']);
    });

    it('runs an action from the overflow menu and closes it', async () => {
        const onClicked = vi.fn();
        const { button } = await setup({ width: 340, onClicked });
        await userEvent.click(button(/^Collapsed Item Menu/)!);
        await wait();
        await userEvent.click(menuItems()[1]!);
        await wait();
        expect(onClicked).toHaveBeenCalledWith('notifications');
        expect(menuItems()).toHaveLength(0);
    });

    it('keeps the product switch out of the overflow menu, and returns from its products to the bar', async () => {
        const onClicked = vi.fn();
        const { button } = await setup({ width: 340, productSwitch: true, onClicked });
        await userEvent.click(button(/^Collapsed Item Menu/)!);
        await wait();
        expect(menuItems().map((i) => i.textContent?.trim())).toEqual(['Search', 'Notifications3', 'Feedback', 'Help']);
        await userEvent.keyboard('{Escape}');
        await wait();
        const switcher = button(/^Product switch$/)!;
        await userEvent.click(switcher);
        await wait();
        expect(menuItems().map((i) => i.getAttribute('aria-label'))).toEqual(['Fiori Home', 'S/4 HANA Cloud']);
        // back from the products: Escape closes them and the focus returns to the switch in the bar
        await userEvent.keyboard('{Escape}');
        await wait();
        expect(menuItems()).toHaveLength(0);
        expect(document.activeElement).toBe(switcher);
        // choosing a product closes them too
        await userEvent.click(switcher);
        await wait();
        await userEvent.click(menuItems()[0]!);
        await wait();
        expect(onClicked).toHaveBeenCalledWith('home');
        expect(menuItems()).toHaveLength(0);
    });

    it('shows the actions again when space returns', async () => {
        const { screen, button } = await setup({ width: 340 });
        expect(button(/^Help$/)).toBeUndefined();
        await screen.rerender(<Host width={1000} />);
        await wait(200);
        expect(button(/^Help$/)).toBeDefined();
        expect(button(/^Collapsed Item Menu/)).toBeUndefined();
    });

    it('opens the search in place of everything else on small screens', async () => {
        const { screen, bar, root, search } = await setup({ width: 300 });
        await screen.rerender(<Host width={300} size="s" />);
        await wait();
        expect(search()!.offsetParent).toBeNull();
        root.querySelector<HTMLElement>('[aria-label^="Collapsed"]')!.click();
        await wait();
        menuItems()[0]!.click();
        await wait();
        expect(search()!.offsetParent).not.toBeNull();
        expect(document.activeElement).toBe(search()!.querySelector('input'));
        expect(root.querySelector<HTMLElement>('[aria-label^="Collapsed"]')!.offsetParent).toBeNull();
        const cancel = [...bar().querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Cancel')!;
        await userEvent.click(cancel);
        await wait();
        expect(search()!.offsetParent).toBeNull();
    });

    it('hides context area items by priority when space runs out', async () => {
        const onHidden = vi.fn();
        await setup({ width: 460, context: true, onHidden });
        await wait();
        expect(onHidden).toHaveBeenCalled();
        expect(onHidden.mock.lastCall![0].length).toBeGreaterThan(0);
    });

    it('onContentItemVisibilityChange reports the hidden items and restores them when space returns', async () => {
        const onHidden = vi.fn();
        const { screen, root } = await setup({ width: 460, context: true, onHidden });
        await wait();
        const hidden: HTMLElement[] = onHidden.mock.lastCall![0];
        // the item with the highest priority number hides first
        expect(hidden.map((el) => el.textContent)).toEqual(hidden.length === 1 ? ['Second'] : ['Second', 'First']);
        expect(hidden.every((el) => el.offsetParent === null)).toBe(true);
        expect(root.querySelector('[role=group]')!.getAttribute('aria-label')).toBe('Additional information');
        await screen.rerender(<Host width={1300} context onHidden={onHidden} />);
        await wait(200);
        expect(onHidden.mock.lastCall![0]).toEqual([]);
        expect(hidden.every((el) => el.offsetParent !== null)).toBe(true);
    });

    it('a toggled action exposes aria-pressed', async () => {
        const onToggle = vi.fn();
        const { screen, button } = await setup({ onToggle });
        const feedback = button(/^Feedback$/)!;
        expect(feedback.hasAttribute('aria-pressed')).toBe(false);
        await userEvent.click(feedback);
        expect(onToggle).toHaveBeenCalled();
        await screen.rerender(<Host toggled onToggle={onToggle} />);
        expect(feedback.getAttribute('aria-pressed')).toBe('true');
    });

    it('the navigation and back buttons call their handlers', async () => {
        const onClicked = vi.fn();
        const { button } = await setup({ onClicked });
        await userEvent.click(button(/^Navigation$/)!);
        expect(onClicked).toHaveBeenLastCalledWith('navigation');
        await userEvent.click(button(/^Back$/)!);
        expect(onClicked).toHaveBeenLastCalledWith('back');
    });

    it('the product menu opens and runs the callback of a selected item', async () => {
        const onPicked = vi.fn();
        const { root } = await setupMenus({ onPicked });
        const control = [...root.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Corporate Portal')!;
        await userEvent.click(control);
        await wait();
        expect(menuItems().map((i) => i.textContent?.trim())).toEqual(['Application A', 'Application B']);
        await userEvent.click(menuItems()[1]!);
        await wait();
        expect(onPicked).toHaveBeenCalledWith('B');
        expect(menuItems()).toHaveLength(0);
    });

    it('the user menu built from user and userMenu opens and runs callbacks', async () => {
        const onPicked = vi.fn();
        const { root } = await setupMenus({ onPicked });
        const avatar = root.querySelector<HTMLElement>('[aria-label="Lisa Miller"]')!;
        expect(avatar.textContent?.trim()).toBe('LM');
        await userEvent.click(avatar.closest('button')!);
        await wait();
        expect(menuItems().map((i) => i.textContent?.trim())).toEqual(['Settings', 'Sign Out']);
        await userEvent.click(menuItems()[0]!);
        await wait();
        expect(onPicked).toHaveBeenCalledWith('Settings');
        expect(menuItems()).toHaveLength(0);
    });

    it('groupFlex lets a group shrink to its content so the others grow', async () => {
        const { screen, root } = await setupMenus();
        const product = () => root.querySelector<HTMLElement>('[data-testid=product]')!.parentElement!.parentElement!;
        const actions = () => root.querySelector<HTMLElement>('.order-3')!;
        expect(getComputedStyle(product()).minWidth).toBe('auto');
        expect(getComputedStyle(actions()).flexShrink).toBe('0');
        await screen.rerender(
            <MenuHost groupFlex={{ product: { shrink: true, flexBasisAuto: true }, actions: { shrink: true } }} />
        );
        const style = getComputedStyle(product());
        expect([style.minWidth, style.flexShrink, style.flexGrow, style.flexBasis]).toEqual(['0px', '1', '0', 'auto']);
        expect(getComputedStyle(actions()).flexShrink).toBe('1');
    });

    it('a product menu without items is a heading; link items are links', async () => {
        const screen = await render(
            <Shellbar>
                <ProductMenu control="Plain" />
                <ProductMenu
                    control="Links"
                    items={[{ name: 'Docs', link: '#docs', newTab: true, glyph: 'learning-assistant' }]}
                />
            </Shellbar>
        );
        expect(screen.container.querySelector('h1')!.textContent).toBe('Plain');
        const control = [...screen.container.querySelectorAll('button')].find((b) => b.textContent === 'Links')!;
        await userEvent.click(control);
        await wait();
        const link = menuItems()[0]!;
        expect(link.tagName).toBe('A');
        expect(link.getAttribute('href')).toBe('#docs');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.querySelector('[data-glyph]')).not.toBeNull();
    });

    it('a user menu takes extra items, a custom button and reports the chosen item', async () => {
        const onItemClick = vi.fn();
        const screen = await render(
            <ShellbarUserMenu
                user={{ fullName: 'Lisa Miller' }}
                userMenu={[{ text: 'Settings' }]}
                onItemClick={onItemClick}
                button={<Button variant="transparent" label="Me" />}
            >
                <MenuItem>About</MenuItem>
            </ShellbarUserMenu>
        );
        const trigger = [...screen.container.querySelectorAll('button')].find((b) => b.textContent === 'Me')!;
        expect(trigger.className).toContain('rounded-[20rem]!');
        await userEvent.click(trigger);
        await wait();
        expect(menuItems().map((i) => i.textContent?.trim())).toEqual(['Settings', 'About']);
        await userEvent.click(menuItems()[0]!);
        expect(onItemClick).toHaveBeenCalledWith({ text: 'Settings' });
    });

    it('shows the assistive tools button and the product switch, and a custom navigation button', async () => {
        const onAssistive = vi.fn();
        const screen = await render(
            <Shellbar showNavigationButton navigationButton={<Button label="Menu" />}>
                <ShellbarActions
                    assistiveTools
                    onAssistiveToolsClick={onAssistive}
                    productSwitch={<Button aria-label="Product switch" glyph="grid" />}
                />
            </Shellbar>
        );
        const buttons = () => [...screen.container.querySelectorAll('button')];
        expect(buttons().some((b) => b.textContent === 'Menu')).toBe(true);
        expect(buttons().some((b) => b.getAttribute('aria-label') === 'Navigation')).toBe(false);
        const switcher = buttons().find((b) => b.getAttribute('aria-label') === 'Product switch')!;
        expect(switcher.parentElement!.className).toContain('ms-2');
        await userEvent.click(buttons().find((b) => b.getAttribute('aria-label') === 'Assistive Tools')!);
        expect(onAssistive).toHaveBeenCalled();
    });

    it('applies the shell colours to transparent buttons and keeps cozy density', async () => {
        const { bar, button } = await setup();
        expect(bar().dataset['density']).toBe('cozy');
        const help = getComputedStyle(button(/^Help$/)!);
        const shell = getComputedStyle(document.documentElement).getPropertyValue('--sapShell_InteractiveTextColor');
        const probe = document.createElement('span');
        probe.style.color = shell;
        document.body.appendChild(probe);
        expect(help.color).toBe(getComputedStyle(probe).color);
        probe.remove();
    });

    it('passes native props, className and ref to the bar (fundamental-react prop spreading)', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <Shellbar ref={ref} className="blue" data-sample="Sample" aria-label="Shell Bar" />
        );
        const bar = screen.container.querySelector<HTMLElement>('[data-sample]')!;
        expect(bar.getAttribute('data-sample')).toBe('Sample');
        expect(bar.getAttribute('aria-label')).toBe('Shell Bar');
        expect(bar.className).toContain('blue');
        expect(ref.current).toBe(bar);
    });
});
