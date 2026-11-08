import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { DialogBody, DialogPopup, DialogProvider, useDialogService, type DialogService } from '@/ui/dialog/dialog';
import { ListLink, ListTitle } from '@/ui/list/list';
import {
    SETTINGS_DIALOG_CLASS,
    SettingsContainer,
    SettingsContent,
    SettingsListArea,
    SettingsListContainer,
    SettingsList,
    SettingsListItem,
    SettingsProfileCardName,
    SettingsSpacing,
    settingsDialogConfig,
    useSettings,
    type SettingsActions
} from './settings';

const wait = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
const item = (name: string) =>
    [...document.querySelectorAll<HTMLElement>('[data-slot=list-item]')].find((li) => li.textContent?.trim() === name)!;
const title = () => document.querySelector('[data-settings-header] h2')?.textContent?.trim();
const back = () => document.querySelector<HTMLElement>('button[data-settings-header-button]');
const listArea = () => document.querySelector<HTMLElement>('[data-settings-list-area]');
const visible = (el: HTMLElement | null) => !!el && el.getBoundingClientRect().height > 0;

const detail = (
    <SettingsContent className="detail">
        Detail view
        <SettingsSpacing size="large" />
    </SettingsContent>
);
const more = <SettingsContent className="more">More view</SettingsContent>;

function Host({
    actionsRef,
    ...props
}: {
    actionsRef?: React.Ref<SettingsActions>;
    value?: string | null;
    onValueChange?: (value: string) => void;
}) {
    return (
        <div style={{ height: '30rem' }}>
            <SettingsContainer backBtnAriaLabel="Back" actionsRef={actionsRef} {...props}>
                <SettingsListArea>
                    <SettingsListContainer>
                        <SettingsList aria-label="Settings">
                            <SettingsListItem
                                value="account"
                                view={<SettingsContent className="account">Account view</SettingsContent>}
                                defaultSelected
                            >
                                <ListLink>
                                    <ListTitle>User Account</ListTitle>
                                </ListLink>
                            </SettingsListItem>
                            <SettingsListItem
                                value="language"
                                view={<SettingsContent className="language">Language view</SettingsContent>}
                            >
                                <ListLink>
                                    <ListTitle>Language</ListTitle>
                                </ListLink>
                            </SettingsListItem>
                        </SettingsList>
                    </SettingsListContainer>
                </SettingsListArea>
            </SettingsContainer>
        </div>
    );
}

async function setup(props: Parameters<typeof Host>[0] = {}) {
    const actions = createRef<SettingsActions>();
    const screen = await render(<Host actionsRef={actions} {...props} />);
    await wait();
    return { screen, root: screen.container, actions: () => actions.current! };
}

/* ------------------------------------------------------------------------------------------------------------------
 * The Angular spec
 * ---------------------------------------------------------------------------------------------------------------- */

describe('SettingsContainer', () => {
    afterEach(async () => {
        await page.viewport(1280, 800);
        window.dispatchEvent(new Event('resize'));
    });

    it('shows the list and the view of the selected item side by side on large screens', async () => {
        const { root } = await setup();
        expect(root.querySelector('[data-settings-view]')!.getAttribute('data-settings-view')).toBe('lg');
        expect(visible(listArea())).toBe(true);
        expect(root.querySelector('.account')!.textContent).toBe('Account view');
        expect(title()).toBe('User Account');
        expect(back()).toBeNull();
    });

    it('opens the view of a clicked item and moves the selection', async () => {
        const { root } = await setup();
        await userEvent.click(item('Language'));
        await wait();
        expect(root.querySelector('.language')).not.toBeNull();
        expect(root.querySelector('.account')).toBeNull();
        expect(title()).toBe('Language');
        expect(item('Language').hasAttribute('data-selected')).toBe(true);
        expect(item('User Account').hasAttribute('data-selected')).toBe(false);
    });

    it('pushes further views with a back button', async () => {
        const { root, actions } = await setup();
        actions().pushView(detail, 'Details');
        await wait();
        expect(root.querySelector('.detail')).not.toBeNull();
        expect(title()).toBe('Details');
        expect(document.activeElement).toBe(back());
        await userEvent.click(back()!);
        await wait();
        expect(title()).toBe('User Account');
        expect(back()).toBeNull();
    });

    it('replaces the list with the view on medium screens', async () => {
        await page.viewport(800, 700);
        window.dispatchEvent(new Event('resize'));
        const { root } = await setup();
        expect(root.querySelector('[data-settings-view]')!.getAttribute('data-settings-view')).toBe('md');
        expect(root.querySelector('[data-settings-detail-area]')).toBeNull();
        await userEvent.click(item('Language'));
        await wait();
        expect(visible(listArea())).toBe(false);
        expect(listArea()!.hidden).toBe(true);
        expect(root.querySelector('.language')).not.toBeNull();
        await userEvent.click(back()!);
        await wait();
        expect(visible(listArea())).toBe(true);
        expect(document.activeElement?.textContent?.trim()).toBe('Language');
    });

    it('spacing is hidden from assistive technology', async () => {
        const { actions } = await setup();
        actions().pushView(detail, 'Details');
        await wait();
        const spacing = document.querySelector('.detail [role=presentation]')!;
        expect(spacing.getAttribute('aria-hidden')).toBe('true');
        expect(spacing.getBoundingClientRect().height).toBe(48);
    });

    it('two pushed views go back one at a time', async () => {
        const { root, actions } = await setup();
        actions().pushView(detail, 'Details');
        actions().pushView(more, 'More');
        await wait();
        expect(title()).toBe('More');
        expect(root.querySelector('.more')).not.toBeNull();
        expect(root.querySelector('.detail')).toBeNull();
        await userEvent.click(back()!);
        await wait();
        expect(title()).toBe('Details');
        expect(root.querySelector('.detail')).not.toBeNull();
        await userEvent.click(back()!);
        await wait();
        expect(title()).toBe('User Account');
        expect(root.querySelector('.account')).not.toBeNull();
        expect(back()).toBeNull();
    });

    it('selecting another item clears the pushed views', async () => {
        const { root, actions } = await setup();
        actions().pushView(detail, 'Details');
        actions().pushView(more, 'More');
        await wait();
        await userEvent.click(item('Language'));
        await wait();
        expect(title()).toBe('Language');
        expect(root.querySelector('.language')).not.toBeNull();
        expect(root.querySelector('.more')).toBeNull();
        expect(back()).toBeNull();
    });

    it('popView on an empty stack keeps the item view', async () => {
        const { root, actions } = await setup();
        actions().popView();
        await wait();
        expect(title()).toBe('User Account');
        expect(root.querySelector('.account')).not.toBeNull();
        expect(back()).toBeNull();
    });
});

/* ------------------------------------------------------------------------------------------------------------------
 * React API
 * ---------------------------------------------------------------------------------------------------------------- */

describe('SettingsContainer (React API)', () => {
    afterEach(async () => {
        await page.viewport(1280, 800);
        window.dispatchEvent(new Event('resize'));
    });

    it('opens items with Enter and follows a controlled value', async () => {
        const onValueChange = vi.fn();
        const { screen, root } = await setup({ value: 'language', onValueChange });
        expect(title()).toBe('Language');
        item('User Account').focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        expect(onValueChange).toHaveBeenCalledWith('account');
        // controlled: the view follows the value
        expect(root.querySelector('.language')).not.toBeNull();
        await screen.rerender(<Host value="account" onValueChange={onValueChange} />);
        expect(title()).toBe('User Account');
    });

    it('pushes views from inside a view with useSettings', async () => {
        function Pusher() {
            const settings = useSettings();
            return <button onClick={() => settings.pushView(more, 'More')}>Push</button>;
        }
        await render(
            <SettingsContainer>
                <SettingsListArea>
                    <SettingsList aria-label="Settings">
                        <SettingsListItem view={<Pusher />} defaultSelected>
                            <ListTitle>Item</ListTitle>
                        </SettingsListItem>
                    </SettingsList>
                </SettingsListArea>
            </SettingsContainer>
        );
        await wait();
        expect(title()).toBe('Item');
        await userEvent.click(
            document.querySelector<HTMLElement>(
                '[data-settings-detail-area] button:not([data-settings-header-button])'
            )!
        );
        await wait();
        expect(title()).toBe('More');
        expect(document.activeElement).toBe(back());
    });

    it('takes viewTitle as the title of the detail area and lays out the list area', async () => {
        await render(
            <SettingsContainer className="custom" data-testid="settings">
                <SettingsListArea>
                    <SettingsList aria-label="Settings">
                        <SettingsListItem viewTitle="Account settings" defaultSelected>
                            <ListTitle>Account</ListTitle>
                        </SettingsListItem>
                    </SettingsList>
                </SettingsListArea>
            </SettingsContainer>
        );
        await wait();
        expect(title()).toBe('Account settings');
        const root = document.querySelector<HTMLElement>('[data-testid="settings"]')!;
        expect(root.classList.contains('custom')).toBe(true);
        expect(listArea()!.getBoundingClientRect().width).toBe(320);
        expect(getComputedStyle(listArea()!).borderInlineEndWidth).toBe('1px');
    });

    it('focuses the selected item in a dialog and sizes the dialog with settingsDialogConfig', async () => {
        let dialogs!: DialogService;
        function Capture() {
            dialogs = useDialogService();
            return null;
        }
        await render(
            <DialogProvider>
                <Capture />
            </DialogProvider>
        );
        const config = settingsDialogConfig({ ariaLabel: 'Settings', dialogPanelClass: 'extra' });
        expect(config.disablePaddings).toBe(true);
        expect(config.dialogPanelClass).toContain('extra');
        const ref = dialogs.open(
            () => (
                <DialogPopup>
                    <DialogBody>
                        <SettingsContainer>
                            <SettingsListArea>
                                <SettingsList aria-label="Settings">
                                    <SettingsListItem view="First">
                                        <ListTitle>First</ListTitle>
                                    </SettingsListItem>
                                    <SettingsListItem view="Second" defaultSelected>
                                        <ListTitle>Second</ListTitle>
                                    </SettingsListItem>
                                </SettingsList>
                            </SettingsListArea>
                        </SettingsContainer>
                    </DialogBody>
                </DialogPopup>
            ),
            config
        );
        await wait(300);
        const win = document.querySelector<HTMLElement>('[role=dialog]')!;
        expect(win.getBoundingClientRect().width).toBe(960);
        expect(SETTINGS_DIALOG_CLASS).toContain('w-[60rem]');
        expect(document.activeElement).toBe(item('Second'));
        ref.close();
        await wait(300);
    });

    it('shows the list full width and the view with a back button on small screens', async () => {
        await page.viewport(500, 700);
        window.dispatchEvent(new Event('resize'));
        const { root } = await setup();
        expect(root.querySelector('[data-settings-view]')!.getAttribute('data-settings-view')).toBe('sm');
        expect(listArea()!.getBoundingClientRect().width).toBe(
            root.querySelector('[data-settings-view]')!.getBoundingClientRect().width
        );
        await userEvent.click(item('User Account'));
        await wait();
        expect(document.activeElement).toBe(back());
        expect(back()!.getAttribute('aria-label')).toBe('Back');
        expect(back()!.getAttribute('title')).toBe('Back');
    });

    it('renders the profile card name with the bold font and another element with render', async () => {
        const screen = await render(<SettingsProfileCardName render={<h3 />}>Alain</SettingsProfileCardName>);
        const name = screen.container.querySelector('h3')!;
        expect(getComputedStyle(name).fontFamily).toContain('72');
        expect(getComputedStyle(name).fontSize).toBe('16px');
    });

    it('throws when useSettings is used outside a container', async () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        function Outside() {
            useSettings();
            return null;
        }
        await expect(render(<Outside />)).rejects.toThrow(/SettingsContainer/);
        spy.mockRestore();
    });

    it('works without a container: the items keep their own selection', async () => {
        function Plain() {
            const [n] = useState(0);
            return (
                <SettingsList aria-label="Plain">
                    <SettingsListItem defaultSelected interactive>
                        <ListTitle>Plain {n}</ListTitle>
                    </SettingsListItem>
                </SettingsList>
            );
        }
        await render(<Plain />);
        expect(item('Plain 0').hasAttribute('data-selected')).toBe(true);
    });
});
