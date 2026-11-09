import { DirectionProvider } from '@base-ui/react/direction-provider';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Button } from '@/ui/button/button';
import { iconGlyphChar } from '@/ui/icon/icon';
import {
    Notification,
    NotificationActions,
    NotificationBody,
    NotificationContent,
    NotificationFooter,
    NotificationGroup,
    NotificationGroupGrowingItem,
    NotificationGroupGrowingItemTitle,
    NotificationGroupHeader,
    NotificationGroupHeaderTitle,
    NotificationGroupList,
    NotificationHeader,
    NotificationList,
    NotificationParagraph,
    NotificationProvider,
    NotificationTitle,
    useNotificationRef,
    useNotificationService,
    type NotificationActionKey,
    type NotificationService
} from './notification';

const LONG = 'A very long text that needs more than two lines in a narrow notification. '.repeat(6);
const wait = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));
const banners = () => [...document.querySelectorAll<HTMLElement>('[data-notification-container] [data-notification]')];

function SimpleNotification({ n, text = 'Short' }: { n: number; text?: string }) {
    return (
        <Notification>
            <NotificationBody>
                <NotificationContent>
                    <NotificationHeader>
                        <NotificationTitle>Title {n}</NotificationTitle>
                    </NotificationHeader>
                    <NotificationParagraph>{text}</NotificationParagraph>
                    <NotificationFooter>
                        <span>Source</span>
                    </NotificationFooter>
                </NotificationContent>
            </NotificationBody>
        </Notification>
    );
}

function GroupHost() {
    return (
        <div style={{ width: '20rem' }}>
            <NotificationGroup>
                <NotificationGroupHeader>
                    <NotificationGroupHeaderTitle>Today</NotificationGroupHeaderTitle>
                </NotificationGroupHeader>
                <NotificationGroupList>
                    {[1, 2, 3].map((n) => (
                        <SimpleNotification key={n} n={n} text={n === 1 ? LONG : 'Short'} />
                    ))}
                </NotificationGroupList>
            </NotificationGroup>
        </div>
    );
}

function BannerContent() {
    const ref = useNotificationRef<string>();
    return (
        <Notification>
            <NotificationBody>
                <NotificationContent>
                    <NotificationHeader>
                        <NotificationTitle>{ref.data}</NotificationTitle>
                    </NotificationHeader>
                </NotificationContent>
            </NotificationBody>
        </Notification>
    );
}

function BannerWithActions() {
    return (
        <Notification>
            <NotificationBody>
                <NotificationContent>
                    <NotificationHeader>
                        <NotificationTitle>Saved</NotificationTitle>
                    </NotificationHeader>
                </NotificationContent>
                <NotificationActions>
                    <Button glyph="accept" aria-label="Approve" />
                    <Button glyph="decline" aria-label="Close" />
                </NotificationActions>
            </NotificationBody>
        </Notification>
    );
}

function ActionsHost({ withHeader = true, extra = false }: { withHeader?: boolean; extra?: boolean }) {
    return (
        <Notification>
            <NotificationBody>
                <NotificationContent>
                    {withHeader && (
                        <>
                            <NotificationHeader id="first-header">
                                <NotificationTitle>First</NotificationTitle>
                            </NotificationHeader>
                            <NotificationHeader id="second-header">
                                <NotificationTitle>Second</NotificationTitle>
                            </NotificationHeader>
                        </>
                    )}
                    <NotificationParagraph>Text</NotificationParagraph>
                </NotificationContent>
                <NotificationActions>
                    <Button id="btn1" glyph="accept" aria-label="Accept" />
                    <Button id="btn2" glyph="decline" aria-label="Decline" aria-describedby="existing" />
                    {extra && <Button id="btn3" glyph="overflow" aria-label="More" />}
                </NotificationActions>
            </NotificationBody>
        </Notification>
    );
}

function ListHost({ onActionKey }: { onActionKey?: (event: unknown, key: NotificationActionKey) => void }) {
    return (
        <>
            <NotificationList>
                <NotificationGroup>
                    <NotificationGroupHeader>
                        <NotificationGroupHeaderTitle>Today</NotificationGroupHeaderTitle>
                    </NotificationGroupHeader>
                    <NotificationGroupList>
                        {[1, 2, 3].map((n) => (
                            <Notification key={n} onActionKey={onActionKey}>
                                <NotificationBody>
                                    <NotificationContent>
                                        <NotificationHeader>
                                            <NotificationTitle>Title {n}</NotificationTitle>
                                        </NotificationHeader>
                                        <NotificationParagraph>Text {n}</NotificationParagraph>
                                    </NotificationContent>
                                    <NotificationActions>
                                        <Button glyph="accept" aria-label={`Accept ${n}`} />
                                        <Button glyph="decline" aria-label={`Decline ${n}`} />
                                    </NotificationActions>
                                </NotificationBody>
                            </Notification>
                        ))}
                    </NotificationGroupList>
                    <NotificationGroupGrowingItem aria-label="Show more notifications">
                        <NotificationGroupGrowingItemTitle>More</NotificationGroupGrowingItemTitle>
                    </NotificationGroupGrowingItem>
                </NotificationGroup>
            </NotificationList>
            <Notification data-untitled="">
                <NotificationBody>
                    <NotificationContent>
                        <NotificationParagraph>Only a description</NotificationParagraph>
                    </NotificationContent>
                </NotificationBody>
            </Notification>
        </>
    );
}

let service!: NotificationService;
function Capture() {
    service = useNotificationService();
    return null;
}

async function setupService(): Promise<NotificationService> {
    await render(
        <NotificationProvider>
            <Capture />
        </NotificationProvider>
    );
    return service;
}

/* ------------------------------------------------------------------------------------------------------------------
 * The Angular spec
 * ---------------------------------------------------------------------------------------------------------------- */

describe('Notification', () => {
    afterEach(() => service?.destroyAll());

    it('expands a group from its header and lists its notifications', async () => {
        const screen = await render(<GroupHost />);
        const el = screen.container;
        const header = el.querySelector<HTMLElement>('[role="button"][aria-expanded]')!;
        expect(header.getAttribute('aria-expanded')).toBe('false');
        expect(el.querySelectorAll('[data-notification]')).toHaveLength(0);
        header.focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        expect(header.getAttribute('aria-expanded')).toBe('true');
        expect(document.getElementById(header.getAttribute('aria-controls')!)!.getAttribute('role')).toBe('list');
        const items = [...el.querySelectorAll<HTMLElement>('[data-notification]')];
        expect(items[0]!.getAttribute('role')).toBe('listitem');
        expect(document.getElementById(items[0]!.getAttribute('aria-labelledby')!)!.textContent).toBe('Title 1');

        items[0]!.focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(items[1]);
        await userEvent.keyboard('{End}');
        expect(document.activeElement).toBe(items[2]);
    });

    it('offers More/Less for truncated texts', async () => {
        const screen = await render(<GroupHost />);
        screen.container.querySelector<HTMLElement>('[role="button"][aria-expanded]')!.click();
        await wait(150);
        const [first, second] = [...screen.container.querySelectorAll<HTMLElement>('[data-notification]')];
        expect(second!.querySelector('a[role=button]')).toBeNull();
        const more = first!.querySelector<HTMLElement>('a[role=button]')!;
        expect(more.textContent!.trim()).toBe('More');
        expect(more.getAttribute('aria-expanded')).toBe('false');
        expect(more.getAttribute('aria-label')).toBe('More button. Show the full texts.');
        const paragraph = first!.querySelector<HTMLElement>('[data-nt-paragraph]')!;
        const clamped = paragraph.getBoundingClientRect().height;
        await userEvent.click(more);
        await wait();
        expect(more.textContent!.trim()).toBe('Less');
        expect(more.getAttribute('aria-expanded')).toBe('true');
        expect(more.getAttribute('aria-label')).toBe('Less button. Show less text.');
        expect(paragraph.getBoundingClientRect().height).toBeGreaterThan(clamped);
        more.focus();
        await userEvent.keyboard('{Enter}');
        expect(more.textContent!.trim()).toBe('More');
        // the link stays while the texts collapse, so it keeps the focus
        expect(document.activeElement).toBe(more);
        await userEvent.keyboard('{ }');
        expect(more.textContent!.trim()).toBe('Less');
    });

    it('opens banners with the service, focuses them and returns the focus', async () => {
        const notifications = await setupService();
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        const ref = notifications.open(<BannerContent />, { data: 'Saved', escKeyCloseable: true });
        await wait();
        const banner = banners()[0]!;
        expect(banner.textContent!.trim()).toBe('Saved');
        expect(document.activeElement).toBe(banner);
        await userEvent.keyboard('{Escape}');
        expect(await ref.afterClosed).toEqual({ status: 'dismissed', reason: 'escape' });
        await wait();
        expect(notifications.isAnyOpened()).toBe(false);
        expect(banners()).toHaveLength(0);
        expect(document.activeElement).toBe(trigger);
        trigger.remove();
    });

    it('describes the action buttons by the first header and keeps existing descriptions', async () => {
        const screen = await render(<ActionsHost />);
        await wait();
        const button = (id: string) => document.getElementById(id)!;
        expect(button('btn1').getAttribute('aria-describedby')).toBe('first-header');
        expect(button('btn2').getAttribute('aria-describedby')).toBe('existing');

        await screen.rerender(<ActionsHost extra />);
        await wait();
        expect(button('btn3').getAttribute('aria-describedby')).toBe('first-header');
    });

    it('does not describe the action buttons without a header', async () => {
        await render(<ActionsHost withHeader={false} />);
        await wait();
        expect(document.getElementById('btn1')!.hasAttribute('aria-describedby')).toBe(false);
    });

    it('keeps Tab inside a banner without focusable aria-hidden anchors', async () => {
        const notifications = await setupService();
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        notifications.open(<BannerWithActions />);
        await wait();
        const banner = banners()[0]!;
        const [approve, close] = [...banner.querySelectorAll('button')];
        expect(document.querySelector('[data-notification-container] [aria-hidden="true"][tabindex="0"]')).toBeNull();
        expect(document.activeElement).toBe(banner);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(approve);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(close);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(banner);
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
        expect(document.activeElement).toBe(close);
        trigger.remove();
    });

    describe('lists and groups', () => {
        async function setup(onActionKey?: (event: unknown, key: NotificationActionKey) => void) {
            const screen = await render(<ListHost onActionKey={onActionKey} />);
            const el = screen.container;
            const header = el.querySelector<HTMLElement>('[role="button"][aria-expanded]')!;
            const expand = async () => {
                header.click();
                await wait();
            };
            const items = () => [...el.querySelectorAll<HTMLElement>('ul ul > [data-notification]')];
            return { screen, el, header, expand, items };
        }

        afterEach(() => document.documentElement.removeAttribute('dir'));

        it('labels the list, the group, its heading and the growing item', async () => {
            const { el, header, expand } = await setup();
            const list = el.querySelector<HTMLElement>('ul')!;
            expect(list.getAttribute('role')).toBe('list');
            expect(list.getAttribute('aria-label')).toBe('Notifications');

            const title = el.querySelector<HTMLElement>('[role="heading"]')!;
            expect(title.getAttribute('aria-level')).toBe('3');
            expect(header.getAttribute('title')).toBe('Expand/Collapse');

            const group = list.querySelector<HTMLElement>(':scope > li')!;
            expect(group.getAttribute('role')).toBe('listitem');
            expect(group.getAttribute('tabindex')).toBe('-1');
            expect(group.getAttribute('aria-level')).toBe('1');
            expect(group.getAttribute('aria-labelledby')).toBe(title.id);
            expect(group.getAttribute('aria-description')).toBe('Notification group collapsed');
            await expand();
            expect(group.getAttribute('aria-description')).toBe('Notification group expanded');

            const growing = el.querySelector<HTMLElement>('[aria-label="Show more notifications"]')!;
            expect(growing.getAttribute('role')).toBe('button');
            expect(growing.getAttribute('tabindex')).toBe('0');
        });

        it('toggles the group header with Space and ignores other keys', async () => {
            const { header } = await setup();
            header.focus();
            await userEvent.keyboard('{ }');
            expect(header.getAttribute('aria-expanded')).toBe('true');
            await userEvent.keyboard('a{ArrowDown}{Escape}');
            expect(header.getAttribute('aria-expanded')).toBe('true');
            await userEvent.keyboard('{ }');
            expect(header.getAttribute('aria-expanded')).toBe('false');
        });

        it('points the header arrow right when collapsed and down when expanded, mirrored in RTL', async () => {
            document.documentElement.setAttribute('dir', 'rtl');
            const { header, expand } = await setup();
            const icon = () => header.querySelector<HTMLElement>('[data-glyph]')!;
            expect(icon().getAttribute('data-glyph')).toBe(iconGlyphChar('slim-arrow-right'));
            expect(getComputedStyle(icon()).scale).toMatch(/^-1/);
            await expand();
            expect(icon().getAttribute('data-glyph')).toBe(iconGlyphChar('slim-arrow-down'));
        });

        it('moves between notifications with ArrowUp and Home', async () => {
            const { expand, items } = await setup();
            await expand();
            const [first, second, third] = items();
            expect(second!.getAttribute('aria-level')).toBe('2');
            third!.focus();
            await userEvent.keyboard('{ArrowUp}');
            expect(document.activeElement).toBe(second);
            await userEvent.keyboard('{Home}');
            expect(document.activeElement).toBe(first);
            await userEvent.keyboard('{ArrowUp}');
            expect(document.activeElement).toBe(first);
        });

        it('keeps the focused action button column across notifications', async () => {
            const { expand } = await setup();
            await expand();
            const button = (name: string) =>
                document.querySelector<HTMLElement>(`[data-nt-actions] button[aria-label="${name}"]`)!;
            button('Decline 1').focus();
            await userEvent.keyboard('{ArrowDown}');
            expect(document.activeElement).toBe(button('Decline 2'));
            await userEvent.keyboard('{End}');
            expect(document.activeElement).toBe(button('Decline 3'));
            await userEvent.keyboard('{ArrowUp}');
            expect(document.activeElement).toBe(button('Decline 2'));
        });

        it('runs onActionKey on Enter, Delete and Backspace but not on other keys or from nested buttons', async () => {
            const keys: string[] = [];
            const { expand, items } = await setup((_, key) => keys.push(key));
            await expand();
            items()[0]!.focus();
            await userEvent.keyboard('{Enter}{Delete}{Backspace}');
            expect(keys).toEqual(['enter', 'delete', 'delete']);
            await userEvent.keyboard('a{ }{Escape}');
            expect(keys).toEqual(['enter', 'delete', 'delete']);
            items()[0]!.querySelector<HTMLElement>('[data-nt-actions] button')!.focus();
            await userEvent.keyboard('{Enter}{Delete}');
            expect(keys).toEqual(['enter', 'delete', 'delete']);
        });

        it('labels a notification without a title by its paragraph', async () => {
            await setup();
            const untitled = document.querySelector<HTMLElement>('[data-untitled]')!;
            const paragraph = untitled.querySelector<HTMLElement>('[data-nt-paragraph]')!;
            expect(untitled.getAttribute('aria-labelledby')).toBe(paragraph.id);
        });
    });

    it('opens a banner from a template and destroyAll closes every banner', async () => {
        const notifications = await setupService();
        const template = (ref: { data?: string }) => (
            <Notification>
                <NotificationBody>
                    <NotificationContent>
                        <NotificationHeader>
                            <NotificationTitle>From a template {ref.data}</NotificationTitle>
                        </NotificationHeader>
                    </NotificationContent>
                </NotificationBody>
            </Notification>
        );
        const refs = [
            notifications.open(template, { data: 'A' }),
            notifications.open(template, { data: 'B' }),
            notifications.open(<BannerContent />, { data: 'C' })
        ];
        await wait();
        expect(banners().map((b) => b.textContent!.trim())).toEqual(['From a template A', 'From a template B', 'C']);
        expect(notifications.notifications).toHaveLength(3);

        notifications.destroyAll();
        const results = await Promise.all(refs.map((ref) => ref.afterClosed));
        expect(results.map((r) => r.status)).toEqual(['closed', 'closed', 'closed']);
        await wait();
        expect(notifications.isAnyOpened()).toBe(false);
        expect(banners()).toHaveLength(0);
    });
});

/* ------------------------------------------------------------------------------------------------------------------
 * React API
 * ---------------------------------------------------------------------------------------------------------------- */

describe('Notification (React API)', () => {
    afterEach(() => service?.destroyAll());

    it('passes native props, className and the ref to the root, and renders another element with render', async () => {
        let element: HTMLElement | null = null;
        const onClick = vi.fn();
        const screen = await render(
            <Notification
                ref={(node) => {
                    element = node;
                }}
                className="custom"
                data-testid="root"
                width="20rem"
                onClick={onClick}
            >
                <NotificationBody>
                    <NotificationContent>
                        <NotificationParagraph>Text</NotificationParagraph>
                    </NotificationContent>
                </NotificationBody>
            </Notification>
        );
        const root = screen.container.querySelector<HTMLElement>('[data-testid="root"]')!;
        expect(element).toBe(root);
        expect(root.tagName).toBe('DIV');
        expect(root.classList.contains('custom')).toBe(true);
        expect(root.getAttribute('tabindex')).toBe('0');
        expect(root.style.width).toBe('20rem');
        root.click();
        expect(onClick).toHaveBeenCalledOnce();

        await screen.rerender(<Notification render={<section />} data-testid="root" />);
        expect(screen.container.querySelector('[data-testid="root"]')!.tagName).toBe('SECTION');
    });

    it('shows the selected and unread states', async () => {
        const screen = await render(
            <Notification selected>
                <NotificationTitle unread>Unread</NotificationTitle>
            </Notification>
        );
        const root = screen.container.querySelector<HTMLElement>('[data-notification]')!;
        const title = root.querySelector<HTMLElement>('h4')!;
        expect(root.hasAttribute('data-selected')).toBe(true);
        expect(getComputedStyle(title).fontWeight).toBe('700');
        expect(getComputedStyle(root).backgroundColor).not.toBe(getComputedStyle(document.body).backgroundColor);
        await screen.rerender(
            <Notification>
                <NotificationTitle>Read</NotificationTitle>
            </Notification>
        );
        expect(root.hasAttribute('data-selected')).toBe(false);
        expect(getComputedStyle(root.querySelector('h4')!).fontWeight).toBe('400');
    });

    it('renders list items in a NotificationList', async () => {
        const screen = await render(
            <NotificationList aria-label="Inbox">
                <SimpleNotification n={1} />
            </NotificationList>
        );
        const list = screen.container.querySelector('ul')!;
        expect(list.getAttribute('aria-label')).toBe('Inbox');
        expect(list.querySelector(':scope > li[data-notification]')).not.toBeNull();
    });

    it('takes control of the More/Less link with showTrigger and expanded', async () => {
        const onExpandedChange = vi.fn();
        const host = (props: { expanded?: boolean; showTrigger?: boolean }) => (
            <Notification>
                <NotificationParagraph>Short</NotificationParagraph>
                <NotificationFooter
                    {...props}
                    moreLabel="Show more"
                    lessLabel="Show less"
                    onExpandedChange={onExpandedChange}
                />
            </Notification>
        );
        const screen = await render(host({ showTrigger: false }));
        await wait();
        expect(screen.container.querySelector('a[role=button]')).toBeNull();
        await screen.rerender(host({ showTrigger: true, expanded: false }));
        const link = screen.container.querySelector<HTMLElement>('a[role=button]')!;
        expect(link.textContent).toBe('Show more');
        await userEvent.click(link);
        expect(onExpandedChange).toHaveBeenCalledWith(true);
        expect(link.textContent).toBe('Show more');
        await screen.rerender(host({ showTrigger: true, expanded: true }));
        expect(link.textContent).toBe('Show less');
        expect(screen.container.querySelector<HTMLElement>('[data-nt-paragraph]')!.className).toContain('block');
    });

    it('controls a group with expanded and onExpandedChange, and the growing item works with the keyboard', async () => {
        const onExpandedChange = vi.fn();
        const onMore = vi.fn();
        function Host() {
            const [expanded, setExpanded] = useState(true);
            return (
                <NotificationGroup
                    expanded={expanded}
                    onExpandedChange={(next) => {
                        onExpandedChange(next);
                        setExpanded(next);
                    }}
                >
                    <NotificationGroupHeader>
                        <NotificationGroupHeaderTitle>Today</NotificationGroupHeaderTitle>
                    </NotificationGroupHeader>
                    <NotificationGroupList>
                        <SimpleNotification n={1} />
                    </NotificationGroupList>
                    <NotificationGroupGrowingItem aria-label="More" onClick={onMore}>
                        <NotificationGroupGrowingItemTitle>More</NotificationGroupGrowingItemTitle>
                    </NotificationGroupGrowingItem>
                </NotificationGroup>
            );
        }
        const screen = await render(
            <ul>
                <Host />
            </ul>
        );
        const growing = screen.container.querySelector<HTMLElement>('[aria-label="More"]')!;
        growing.focus();
        await userEvent.keyboard('{Enter}{ }');
        expect(onMore).toHaveBeenCalledTimes(2);
        const header = screen.container.querySelector<HTMLElement>('[aria-expanded]')!;
        await userEvent.click(header);
        expect(onExpandedChange).toHaveBeenCalledWith(false);
        expect(screen.container.querySelector('[data-notification]')).toBeNull();
        expect(screen.container.querySelector('[aria-label="More"]')).toBeNull();
    });

    it('applies the config of the service: id, aria-label, width and the banner shadow', async () => {
        const notifications = await setupService();
        notifications.open(<BannerContent />, { id: 'banner', ariaLabel: 'Order saved', width: '22rem', data: 'x' });
        await wait();
        const banner = banners()[0]!;
        expect(banner.id).toBe('banner');
        expect(banner.getAttribute('aria-label')).toBe('Order saved');
        expect(banner.style.width).toBe('22rem');
        expect(getComputedStyle(banner).boxShadow).not.toBe('none');
        const container = banner.closest<HTMLElement>('[data-notification-container]')!;
        expect(getComputedStyle(container).position).toBe('fixed');
        expect(container.getBoundingClientRect().right).toBeCloseTo(window.innerWidth - 32, 0);
    });

    it('places the banners at the top left in RTL', async () => {
        await render(
            <DirectionProvider direction="rtl">
                <NotificationProvider>
                    <Capture />
                </NotificationProvider>
            </DirectionProvider>
        );
        service.open(<BannerContent />, { data: 'RTL' });
        await wait();
        const container = banners()[0]!.closest<HTMLElement>('[data-notification-container]')!;
        expect(container.getAttribute('dir')).toBe('rtl');
        expect(container.getBoundingClientRect().left).toBeCloseTo(32, 0);
    });

    it('moves the focus to the newest remaining banner and leaves the focus alone without shouldTrapFocus', async () => {
        const notifications = await setupService();
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        const free = notifications.open(<BannerContent />, { data: 'Free', shouldTrapFocus: false });
        await wait();
        expect(document.activeElement).toBe(trigger);
        const first = notifications.open(<BannerContent />, { data: 'First' });
        const second = notifications.open(<BannerContent />, { data: 'Second' });
        await wait();
        expect(document.activeElement).toBe(banners()[2]);
        second.close('done');
        await wait();
        expect(document.activeElement).toBe(banners()[1]);
        first.close();
        free.close();
        await wait();
        expect(document.activeElement).toBe(trigger);
        trigger.remove();
    });

    it('closes its notifications when the provider unmounts', async () => {
        const screen = await render(
            <NotificationProvider>
                <Capture />
            </NotificationProvider>
        );
        const ref = service.open(<BannerContent />, { data: 'Gone' });
        await wait();
        screen.unmount();
        expect((await ref.afterClosed).status).toBe('closed');
        expect(banners()).toHaveLength(0);
    });

    it('throws when the hooks are used outside their provider or notification', async () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        await expect(render(<Capture />)).rejects.toThrow(/NotificationProvider/);
        await expect(render(<BannerContent />)).rejects.toThrow(/useNotificationRef/);
        spy.mockRestore();
    });
});
