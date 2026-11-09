import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    UserMenu,
    UserMenuBody,
    UserMenuContentContainer,
    UserMenuControl,
    UserMenuControlElement,
    UserMenuFooter,
    UserMenuHeader,
    UserMenuHeaderContainer,
    UserMenuHeaderContentArea,
    UserMenuList,
    UserMenuListItem,
    UserMenuSublist,
    UserMenuSubline,
    UserMenuUserName,
    useUserMenu
} from './user-menu';

const wait = (ms = 100) => new Promise((r) => setTimeout(r, ms));
const focusedText = () => document.activeElement?.textContent?.trim();
const item = (name: string) =>
    [...document.querySelectorAll<HTMLElement>('[role=menuitem]')].find((el) => el.textContent?.trim() === name)!;
const control = () => document.querySelector<HTMLElement>('#control')!;

interface HostProps {
    mobile?: boolean;
    onPicked?: (value: string) => void;
    onOpen?: (open: boolean) => void;
}

/** Mirrors the Angular test host. */
function Host({ mobile = false, onPicked, onOpen }: HostProps) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <output data-testid="open">{String(open)}</output>
            <UserMenu
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);
                    onOpen?.(next);
                }}
                mobile={mobile}
            >
                <UserMenuControl id="control">Avatar</UserMenuControl>
                <UserMenuBody>
                    <UserMenuHeader>
                        <UserMenuHeaderContainer>
                            <UserMenuUserName id="name">Lisa Miller</UserMenuUserName>
                            <UserMenuSubline>lisa.miller@test.com</UserMenuSubline>
                        </UserMenuHeaderContainer>
                    </UserMenuHeader>
                    <UserMenuContentContainer>
                        <UserMenuList>
                            <UserMenuListItem
                                icon="action-settings"
                                text="Settings"
                                onClick={() => onPicked?.('Settings')}
                            />
                            <UserMenuListItem
                                icon="globe"
                                text="Language"
                                onClick={() => onPicked?.('Language')}
                                submenu={
                                    <UserMenuSublist>
                                        <UserMenuListItem text="English" onClick={() => onPicked?.('English')} />
                                        <UserMenuListItem text="German" />
                                    </UserMenuSublist>
                                }
                            />
                            <UserMenuListItem icon="message-information" text="About" />
                        </UserMenuList>
                    </UserMenuContentContainer>
                </UserMenuBody>
                <UserMenuFooter>
                    <button type="button">Sign out</button>
                </UserMenuFooter>
            </UserMenu>
            <button type="button" id="outside">
                Outside
            </button>
        </>
    );
}

async function setup(props: HostProps = {}) {
    const screen = await render(<Host {...props} />);
    const isOpen = () => screen.getByTestId('open').element().textContent === 'true';
    return { screen, isOpen };
}

const NAME = 'Maximilian Alexander Featherstonehaugh-Montgomery the Third of Somewhere Rather Far Away';

function TextHost() {
    return (
        <div className="w-48">
            <UserMenuUserName id="clamped">{NAME}</UserMenuUserName>
            <UserMenuUserName truncate id="truncated">
                {NAME}
            </UserMenuUserName>
            <UserMenuSubline id="subline">{NAME}</UserMenuSubline>
            <UserMenuSubline wrap id="wrapped">
                {NAME}
            </UserMenuSubline>
        </div>
    );
}

describe('UserMenu', () => {
    afterEach(() => document.documentElement.removeAttribute('dir'));

    it('opens from the control in a popover labelled by the user name and focuses the first item', async () => {
        const { isOpen } = await setup();
        expect(control().getAttribute('role')).toBe('button');
        expect(control().getAttribute('aria-expanded')).toBe('false');
        await userEvent.click(control());
        await wait();
        expect(isOpen()).toBe(true);
        expect(control().getAttribute('aria-expanded')).toBe('true');
        const dialog = document.querySelector('[role=dialog]')!;
        expect(dialog.getAttribute('aria-labelledby')).toBe('name');
        expect(dialog.querySelectorAll('[role=menu] > [role=none]')).toHaveLength(3);
        expect(focusedText()).toBe('Settings');
    });

    it('moves between items with the arrow keys and keeps one tab stop', async () => {
        await setup();
        control().focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        await userEvent.keyboard('{ArrowDown}');
        expect(focusedText()).toBe('Language');
        expect(item('Language').tabIndex).toBe(0);
        expect(item('Settings').tabIndex).toBe(-1);
        await userEvent.keyboard('{End}');
        expect(focusedText()).toBe('About');
        await userEvent.keyboard('{Home}');
        expect(focusedText()).toBe('Settings');
        await userEvent.keyboard('{ArrowUp}');
        expect(focusedText()).toBe('Settings');
    });

    it('opens a submenu with the Right arrow and closes it with the Left arrow', async () => {
        await setup();
        control().focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        await userEvent.keyboard('{ArrowDown}{ArrowRight}');
        await wait(150);
        expect(item('Language').getAttribute('aria-expanded')).toBe('true');
        expect(item('Language').getAttribute('aria-haspopup')).toBe('menu');
        expect(focusedText()).toBe('English');
        expect(document.querySelector('[role=menu][aria-label=Language]')).not.toBeNull();
        await userEvent.keyboard('{ArrowDown}');
        expect(focusedText()).toBe('German');
        await userEvent.keyboard('{ArrowLeft}');
        await wait();
        expect(item('Language').getAttribute('aria-expanded')).toBe('false');
        expect(focusedText()).toBe('Language');
    });

    it('closes a submenu with Escape and keeps the menu open', async () => {
        const { isOpen } = await setup();
        control().focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        await userEvent.keyboard('{ArrowDown}{ArrowRight}');
        await wait(150);
        expect(focusedText()).toBe('English');
        await userEvent.keyboard('{Escape}');
        await wait();
        expect(item('Language').getAttribute('aria-expanded')).toBe('false');
        expect(focusedText()).toBe('Language');
        expect(isOpen()).toBe(true);
    });

    it('opens a submenu on hover', async () => {
        const picked = vi.fn();
        await setup({ onPicked: picked });
        await userEvent.click(control());
        await wait();
        await userEvent.hover(item('Language'));
        await wait();
        expect(item('Language').getAttribute('aria-expanded')).toBe('true');
        await userEvent.click(item('English'));
        // the click in the submenu does not reach its item
        expect(picked).toHaveBeenCalledWith('English');
        expect(picked).toHaveBeenCalledTimes(1);
    });

    it('a click on an item with a submenu opens it, and hovering another item closes it', async () => {
        await setup();
        await userEvent.click(control());
        await wait();
        await userEvent.click(item('Language'));
        await wait();
        expect(item('Language').getAttribute('aria-expanded')).toBe('true');
        await userEvent.hover(item('About'));
        await wait();
        expect(item('Language').getAttribute('aria-expanded')).toBe('false');
        expect(focusedText()).toBe('About');
    });

    it('closes with Escape and returns the focus to the control', async () => {
        const { isOpen } = await setup();
        control().focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        await userEvent.keyboard('{Escape}');
        await wait();
        expect(isOpen()).toBe(false);
        expect(document.activeElement).toBe(control());
    });

    it('opens in a dialog in mobile mode and shows submenus in place of the main view', async () => {
        const picked = vi.fn();
        const { isOpen } = await setup({ mobile: true, onPicked: picked });
        expect(control().getAttribute('aria-expanded')).toBe('false');
        await userEvent.click(control());
        await wait(300);
        expect(control().getAttribute('aria-expanded')).toBe('true');
        const dialog = document.querySelector('[role=dialog]')!;
        expect(dialog).not.toBeNull();
        expect(dialog.getAttribute('aria-labelledby')).toBe('name');
        expect(item('Language').hasAttribute('aria-expanded')).toBe(false);
        await userEvent.click(item('Language'));
        await wait(200);
        expect(document.querySelector('h1')?.textContent?.trim()).toBe('Language');
        expect(focusedText()).toBe('English');
        await userEvent.click(item('English'));
        expect(picked).toHaveBeenCalledWith('English');
        await userEvent.click(document.querySelector<HTMLElement>('[aria-label="Go back"]')!);
        await wait();
        expect(focusedText()).toBe('Language');
        expect(document.querySelector('h1')).toBeNull();
        await userEvent.click(document.querySelector<HTMLElement>('[aria-label="Close"]')!);
        await wait(300);
        expect(isOpen()).toBe(false);
    });

    it('keeps clicks inside the body from bubbling out of the menu', async () => {
        const picked = vi.fn();
        await setup({ onPicked: picked });
        await userEvent.click(control());
        await wait();
        const outside = vi.fn();
        document.addEventListener('click', outside);
        try {
            await userEvent.click(document.getElementById('name')!);
            await userEvent.click(item('Settings'));
            expect(picked).toHaveBeenCalledWith('Settings');
            expect(outside).not.toHaveBeenCalled();
            await userEvent.click(document.querySelector<HTMLElement>('[role=dialog] button:not([role])')!);
            expect(outside).toHaveBeenCalledOnce();
        } finally {
            document.removeEventListener('click', outside);
        }
    });

    it('the control is a focusable button (tabindex 0, aria-haspopup dialog)', async () => {
        await setup();
        expect(control().getAttribute('role')).toBe('button');
        expect(control().tabIndex).toBe(0);
        expect(control().getAttribute('aria-haspopup')).toBe('dialog');
        await userEvent.tab();
        expect(document.activeElement).toBe(control());
    });

    it('opens with Space and ignores other keys on the control', async () => {
        const { isOpen } = await setup();
        control().focus();
        await userEvent.keyboard('a{ArrowDown}{Tab}');
        await wait();
        expect(isOpen()).toBe(false);
        control().focus();
        await userEvent.keyboard('[Space]');
        await wait();
        expect(isOpen()).toBe(true);
        expect(focusedText()).toBe('Settings');
    });

    it('reopening after moving the focus starts on the first item', async () => {
        await setup();
        control().focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        await userEvent.keyboard('{End}');
        expect(focusedText()).toBe('About');
        await userEvent.keyboard('{Escape}');
        await wait();
        await userEvent.keyboard('{Enter}');
        await wait();
        expect(focusedText()).toBe('Settings');
        expect(item('Settings').tabIndex).toBe(0);
        expect(item('About').tabIndex).toBe(-1);
    });

    it('moving the focus out of the menu resets the tab stop to the first item', async () => {
        await setup();
        control().focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        await userEvent.keyboard('{ArrowDown}');
        expect(item('Language').tabIndex).toBe(0);
        // moving within the menu (into a submenu) keeps the item
        await userEvent.keyboard('{ArrowRight}');
        await wait(150);
        expect(focusedText()).toBe('English');
        expect(item('Language').tabIndex).toBe(0);
        await userEvent.keyboard('{ArrowLeft}');
        await wait();
        // leaving the menu makes the first item the tab stop again
        document.getElementById('outside')!.focus();
        await wait();
        expect(item('Language').tabIndex).toBe(-1);
        expect(item('Settings').tabIndex).toBe(0);
    });

    it('submenu arrows are mirrored in RTL', async () => {
        document.documentElement.setAttribute('dir', 'rtl');
        await setup();
        control().focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        await userEvent.keyboard('{ArrowDown}{ArrowRight}');
        await wait(150);
        expect(item('Language').getAttribute('aria-expanded')).toBe('false');
        await userEvent.keyboard('{ArrowLeft}');
        await wait(150);
        expect(item('Language').getAttribute('aria-expanded')).toBe('true');
        expect(focusedText()).toBe('English');
        await userEvent.keyboard('{ArrowRight}');
        await wait();
        expect(item('Language').getAttribute('aria-expanded')).toBe('false');
        expect(focusedText()).toBe('Language');
    });

    it('mobile mode focuses the first item when it opens and opens from the keyboard', async () => {
        const { isOpen } = await setup({ mobile: true });
        control().focus();
        await userEvent.keyboard('{Enter}');
        await wait(300);
        expect(isOpen()).toBe(true);
        expect(document.querySelector('[role=dialog]')).not.toBeNull();
        expect(focusedText()).toBe('Settings');
    });

    it('user name clamps to two lines, truncate keeps one line', async () => {
        await render(<TextHost />);
        const lineHeight = (el: HTMLElement) => parseFloat(getComputedStyle(el).lineHeight);
        const clamped = document.getElementById('clamped')!;
        expect(clamped.clientHeight).toBeCloseTo(2 * lineHeight(clamped), 0);
        expect(clamped.scrollHeight).toBeGreaterThan(clamped.clientHeight);
        const truncated = document.getElementById('truncated')!;
        expect(truncated.clientHeight).toBeCloseTo(lineHeight(truncated), 0);
        expect(getComputedStyle(truncated).textOverflow).toBe('ellipsis');
    });

    it('a subline truncates to one line unless it wraps', async () => {
        await render(<TextHost />);
        const subline = document.getElementById('subline')!;
        const wrapped = document.getElementById('wrapped')!;
        expect(getComputedStyle(subline).textOverflow).toBe('ellipsis');
        expect(subline.scrollWidth).toBeGreaterThan(subline.clientWidth);
        expect(wrapped.clientHeight).toBeGreaterThan(2 * subline.clientHeight);
        expect(wrapped.scrollWidth).toBe(wrapped.clientWidth);
    });

    it('shows the user name in the header bar once it scrolls out of view', async () => {
        await render(
            <UserMenu defaultOpen>
                <UserMenuControl>Avatar</UserMenuControl>
                <UserMenuBody>
                    <UserMenuHeader>
                        <UserMenuHeaderContainer>
                            <UserMenuUserName>Lisa Miller</UserMenuUserName>
                        </UserMenuHeaderContainer>
                    </UserMenuHeader>
                    <UserMenuContentContainer>
                        <UserMenuList>
                            {Array.from({ length: 40 }, (_, i) => (
                                <UserMenuListItem key={i} text={`Item ${i + 1}`} />
                            ))}
                        </UserMenuList>
                    </UserMenuContentContainer>
                </UserMenuBody>
            </UserMenu>
        );
        await wait();
        const bar = document.querySelector<HTMLElement>('[data-bar-design=header]')!;
        expect(bar.getAttribute('aria-hidden')).toBe('true');
        expect(bar.textContent).toBe('Lisa Miller');
        expect(getComputedStyle(bar).opacity).toBe('0');
        document.querySelector<HTMLElement>('[data-user-menu-scroll]')!.scrollTop = 400;
        await wait(300);
        expect(getComputedStyle(bar).opacity).toBe('1');
    });

    it('marks the control element while open and closes from useUserMenu', async () => {
        function CloseItem() {
            const menu = useUserMenu();
            return <UserMenuListItem text="Close me" onClick={menu?.close} />;
        }
        const screen = await render(
            <UserMenu>
                <UserMenuControl id="control">
                    <UserMenuControlElement id="element">Avatar</UserMenuControlElement>
                </UserMenuControl>
                <UserMenuBody>
                    <UserMenuList aria-label="Actions">
                        <CloseItem />
                    </UserMenuList>
                </UserMenuBody>
            </UserMenu>
        );
        const element = screen.container.querySelector('#element')!;
        expect(element.hasAttribute('data-state')).toBe(false);
        await userEvent.click(control());
        await wait();
        expect(element.getAttribute('data-state')).toBe('open');
        expect(document.querySelector('nav[aria-label=Actions]')).not.toBeNull();
        await userEvent.click(item('Close me'));
        await wait();
        expect(element.hasAttribute('data-state')).toBe(false);
        expect(document.querySelector('[role=menuitem]')).toBeNull();
    });

    it('item options: subtitle describes the item, icons, selection and truncation', async () => {
        await render(
            <UserMenu defaultOpen>
                <UserMenuControl>Avatar</UserMenuControl>
                <UserMenuBody>
                    <UserMenuList>
                        <UserMenuListItem
                            text="Settings"
                            subtitle="Configure profile"
                            subtitleId="sub"
                            iconAfter="accept"
                            iconAfterActive
                            selected
                            truncateText
                            truncateSubtitle
                        />
                        <UserMenuListItem text="Plain" hasSubmenu />
                    </UserMenuList>
                </UserMenuBody>
            </UserMenu>
        );
        await wait();
        const settings = item('SettingsConfigure profile');
        expect(settings.getAttribute('aria-describedby')).toBe('sub');
        expect(settings.querySelectorAll('[data-glyph]')).toHaveLength(1);
        expect(getComputedStyle(document.getElementById('sub')!).textOverflow).toBe('ellipsis');
        // a selected item has the selection border
        expect(getComputedStyle(settings).borderBottomColor).not.toBe('rgba(0, 0, 0, 0)');
        // hasSubmenu without a submenu shows the arrow only
        expect(item('Plain').getAttribute('aria-haspopup')).toBe('menu');
        expect(item('Plain').querySelectorAll('[data-glyph]')).toHaveLength(1);
    });

    it('passes native props, className and ref to the root elements', async () => {
        const root = createRef<HTMLDivElement>();
        const li = createRef<HTMLLIElement>();
        const button = createRef<HTMLButtonElement>();
        const screen = await render(
            <UserMenu ref={root} className="custom-root" data-testid="root" defaultOpen>
                <UserMenuControl data-testid="ctl" className="custom-control">
                    Avatar
                </UserMenuControl>
                <UserMenuBody className="custom-body">
                    <UserMenuHeader className="custom-header">
                        <UserMenuHeaderContainer>
                            <UserMenuUserName className="custom-name">Lisa</UserMenuUserName>
                        </UserMenuHeaderContainer>
                        <UserMenuHeaderContentArea data-testid="area">Area</UserMenuHeaderContentArea>
                    </UserMenuHeader>
                    <UserMenuContentContainer>
                        <UserMenuList className="custom-list">
                            <UserMenuListItem ref={li} buttonRef={button} text="One" data-testid="one" />
                        </UserMenuList>
                    </UserMenuContentContainer>
                </UserMenuBody>
                <UserMenuFooter className="custom-footer">Footer</UserMenuFooter>
            </UserMenu>
        );
        await wait();
        expect(root.current).toBe(screen.getByTestId('root').element());
        expect(root.current!.className).toContain('custom-root');
        expect(root.current!.className).toContain('inline-flex');
        expect(screen.getByTestId('ctl').element().className).toContain('custom-control');
        expect(document.querySelector('.custom-body')).not.toBeNull();
        expect(document.querySelector('.custom-header')).not.toBeNull();
        expect(document.querySelector('.custom-name')).not.toBeNull();
        expect(document.querySelector('nav.custom-list')).not.toBeNull();
        expect(document.querySelector('.custom-footer')?.textContent).toBe('Footer');
        expect(li.current?.tagName).toBe('LI');
        expect(li.current?.getAttribute('role')).toBe('none');
        expect(li.current?.dataset['testid']).toBe('one');
        expect(button.current?.getAttribute('role')).toBe('menuitem');
    });
});
