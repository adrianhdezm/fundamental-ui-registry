import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Avatar } from '@/ui/avatar/avatar';
import { Bar, BarRight } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import { List, ListContent, ListItem, ListSubline, ListTitle } from '@/ui/list/list';
import { MessageStrip } from '@/ui/message-strip/message-strip';
import { MessageToastProvider, useMessageToastService } from '@/ui/message-toast/message-toast';
import { Title } from '@/ui/title/title';
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

const PHOTO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' fill='%23a2c4e6'/><circle cx='40' cy='31' r='15' fill='%23557a9e'/><path d='M12 80c3-18 15-26 28-26s25 8 28 26z' fill='%23557a9e'/></svg>";

const meta = {
    title: 'Components/User Menu',
    component: UserMenu,
    subcomponents: {
        UserMenuControl,
        UserMenuControlElement,
        UserMenuBody,
        UserMenuHeader,
        UserMenuHeaderContainer,
        UserMenuUserName,
        UserMenuSubline,
        UserMenuHeaderContentArea,
        UserMenuContentContainer,
        UserMenuList,
        UserMenuListItem,
        UserMenuSublist,
        UserMenuFooter
    } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 720 },
            description: {
                component:
                    'The user menu opens from the avatar of the signed-in user, usually in the shellbar. It shows the user name and details, ' +
                    'free header content, panels such as other accounts, a list of actions with optional submenus, and a footer. ' +
                    'When the user name scrolls out of view it appears in a header bar. Arrow keys move between items; the Right arrow ' +
                    '(Left in RTL) opens a submenu and the Left arrow or Escape closes it. In mobile mode the menu opens in a full-screen ' +
                    'dialog and submenus replace the main view.\n\n' +
                    '`UserMenuControl`, `UserMenuBody` and `UserMenuFooter` are direct children of `UserMenu`; `useUserMenu()` gives the ' +
                    'components inside the open state and `close()`.\n\n' +
                    '```tsx\n' +
                    '<UserMenu>\n' +
                    '    <UserMenuControl><Avatar size="xs" circle interactive label="Lisa Miller" /></UserMenuControl>\n' +
                    '    <UserMenuBody>\n' +
                    '        <UserMenuHeader>\n' +
                    '            <UserMenuHeaderContainer>\n' +
                    '                <UserMenuUserName>Lisa Miller</UserMenuUserName>\n' +
                    '                <UserMenuSubline>lisa.miller@test.com</UserMenuSubline>\n' +
                    '            </UserMenuHeaderContainer>\n' +
                    '        </UserMenuHeader>\n' +
                    '        <UserMenuContentContainer>\n' +
                    '            <UserMenuList aria-label="User actions">\n' +
                    '                <UserMenuListItem icon="action-settings" text="Settings" />\n' +
                    '                <UserMenuListItem icon="globe" text="Language" submenu={\n' +
                    '                    <UserMenuSublist><UserMenuListItem text="English" /></UserMenuSublist>\n' +
                    '                } />\n' +
                    '            </UserMenuList>\n' +
                    '        </UserMenuContentContainer>\n' +
                    '    </UserMenuBody>\n' +
                    '    <UserMenuFooter>…</UserMenuFooter>\n' +
                    '</UserMenu>\n' +
                    '```'
            }
        }
    }
} satisfies Meta<typeof UserMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

const ACCOUNTS = [
    { name: 'Lisa Miller', mail: 'lisa.miller@test.com' },
    { name: 'John Doe', mail: 'john.doe@test.com' },
    { name: 'Jane Doe', mail: 'jane.doe@test.com' }
];

/**
 * Stand-in for the panel of other accounts (panel is not ported yet): an expand button, a title and an action over
 * a list of accounts.
 */
function AccountsPanel() {
    const [expanded, setExpanded] = useState(true);
    return (
        <div className="mb-1 border-b border-solid border-sap-group-title-border-color">
            <div className="flex min-h-11 items-center gap-2 px-2 compact:min-h-8">
                <Button
                    variant="transparent"
                    glyph={expanded ? 'slim-arrow-down' : 'slim-arrow-right'}
                    aria-expanded={expanded}
                    aria-controls="user-menu-accounts"
                    aria-label={expanded ? 'Hide other accounts' : 'Show other accounts'}
                    onClick={() => setExpanded(!expanded)}
                />
                <Title level={5} className="flex-1">
                    Accounts (3)
                </Title>
                <Button variant="transparent" glyph="user-edit" aria-label="Add account" title="Add account" />
            </div>
            {expanded && (
                <List subline id="user-menu-accounts" aria-label="Other accounts">
                    {ACCOUNTS.map((account, index) => (
                        <ListItem key={account.mail} interactive active={index === 0}>
                            <Avatar size="s" circle label={account.name} />
                            <ListContent>
                                <ListTitle>{account.name}</ListTitle>
                                <ListSubline>{account.mail}</ListSubline>
                            </ListContent>
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
}

/** A list item that reports its action in a toast and closes the menu. */
function ActionItem(props: Omit<ComponentProps<typeof UserMenuListItem>, 'onClick'>) {
    const menu = useUserMenu();
    const toasts = useMessageToastService();
    return (
        <UserMenuListItem
            {...props}
            onClick={() => {
                toasts.open(`${props.text} action performed`, { duration: 5000 });
                menu?.close();
            }}
        />
    );
}

interface ExampleProps {
    mobile?: boolean;
    count?: number;
    name?: string;
}

/** Angular's story user menu: header with details, a message strip and an action, accounts, actions and a footer. */
function Example({ mobile = false, count = 20, name = 'Lisa Miller' }: ExampleProps) {
    return (
        <div className="flex justify-end">
            <UserMenu mobile={mobile}>
                <UserMenuControl>
                    <UserMenuControlElement
                        render={<Avatar size="xs" circle interactive aria-label="Lisa Miller" image={PHOTO} />}
                    />
                </UserMenuControl>
                <UserMenuBody>
                    <UserMenuHeader>
                        {/* the photo, not initials: an edit button showing "LM" would have visible text missing from its name */}
                        <Avatar
                            circle
                            size="l"
                            zoomGlyph="edit"
                            aria-label="Edit avatar"
                            title="Edit avatar"
                            image={PHOTO}
                        />
                        <UserMenuHeaderContainer>
                            <UserMenuUserName>{name}</UserMenuUserName>
                            <UserMenuSubline>lisa.miller@test.com</UserMenuSubline>
                            <UserMenuSubline>User Experience Designer</UserMenuSubline>
                            <UserMenuSubline>Primary Employment</UserMenuSubline>
                        </UserMenuHeaderContainer>
                        <UserMenuHeaderContentArea>
                            <MessageStrip type="information" dismissible={false}>
                                This is an information message.
                            </MessageStrip>
                        </UserMenuHeaderContentArea>
                        <Button label="Manage Account" glyph="user-settings" />
                    </UserMenuHeader>
                    <UserMenuContentContainer>
                        <AccountsPanel />
                        <UserMenuList aria-label="User actions">
                            <ActionItem icon="action-settings" text="Settings" subtitle="Configure profile" />
                            <UserMenuListItem
                                icon="card"
                                text="Menu Item"
                                subtitle="Menu Item Subtitle"
                                submenu={
                                    <UserMenuSublist hasIcons>
                                        <ActionItem
                                            icon="card"
                                            text="Sub-menu Item"
                                            subtitle="Sub-menu Item Subtitle"
                                            iconAfter="accept"
                                            iconAfterActive
                                        />
                                        <UserMenuListItem
                                            text="Sub-menu Item"
                                            submenu={
                                                <UserMenuSublist hasIcons>
                                                    <ActionItem
                                                        icon="card"
                                                        text="Second Level Item 1"
                                                        subtitle="Second Level Subtitle"
                                                        iconAfter="accept"
                                                        iconAfterActive
                                                    />
                                                    <ActionItem text="Second Level Item 2" />
                                                </UserMenuSublist>
                                            }
                                        />
                                    </UserMenuSublist>
                                }
                            />
                            {Array.from({ length: count }, (_, i) => (
                                <ActionItem key={i} icon="card" text={`Menu Item ${i + 1}`} />
                            ))}
                            <UserMenuListItem icon="official-service" text="Legal Information" />
                            <ActionItem icon="message-information" text="About" />
                        </UserMenuList>
                    </UserMenuContentContainer>
                </UserMenuBody>
                <UserMenuFooter>
                    <Bar barDesign="footer">
                        <BarRight>
                            <Button variant="transparent" label="Sign Out" glyph="log" />
                        </BarRight>
                    </Bar>
                </UserMenuFooter>
            </UserMenu>
        </div>
    );
}

const withToasts = (node: ReactNode) => <MessageToastProvider>{node}</MessageToastProvider>;

/** Opens the menu from the avatar and waits for its items. */
const openMenu: Story['play'] = async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Lisa Miller' }));
    await waitFor(() => expect(document.querySelector('[role=menuitem]')).not.toBeNull());
};

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Click the avatar: the header with the user details, a message strip and an action, a panel of other ' +
                    'accounts (a stand-in until panel is ported), the actions (one with two levels of submenus) and a ' +
                    'footer bar. Choosing an action shows a toast and closes the menu.'
            }
        }
    },
    render: () => withToasts(<Example />)
};

export const Mobile: Story = {
    parameters: {
        docs: { description: { story: 'With `mobile` the menu opens in a full-screen dialog.' } }
    },
    render: () => withToasts(<Example mobile />)
};

export const OpenDesktop: Story = {
    name: 'Open: desktop',
    tags: ['!autodocs'],
    render: () => withToasts(<Example count={2} />),
    play: openMenu
};

export const OpenLong: Story = {
    name: 'Open: long name, scrolling',
    tags: ['!autodocs'],
    render: () => withToasts(<Example name="Maximilian Alexander Featherstonehaugh-Montgomery the Third" />),
    play: openMenu
};

export const OpenSubmenu: Story = {
    name: 'Open: submenu',
    tags: ['!autodocs'],
    render: () => withToasts(<Example count={2} />),
    play: async (context) => {
        await openMenu(context);
        await waitFor(() => expect(document.activeElement?.textContent).toContain('Settings'));
        const rtl = getComputedStyle(document.activeElement!).direction === 'rtl';
        await userEvent.keyboard(rtl ? '{ArrowDown}{ArrowLeft}' : '{ArrowDown}{ArrowRight}');
        await screen.findByText('Sub-menu Item Subtitle');
    }
};

export const OpenMobile: Story = {
    name: 'Open: mobile',
    tags: ['!autodocs'],
    render: () => withToasts(<Example mobile count={2} />),
    play: openMenu
};

/* ------------------------------------------------------------------------------------------------------------------
 * Visual reference: fundamental-styles' first example, open in boxes of the page
 * ---------------------------------------------------------------------------------------------------------------- */

/** fundamental-styles' first user menu, open in a box of the page, its submenu opened by `play`. */
function StaticMenu({ variant, mobile = false }: { variant: string; mobile?: boolean }) {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <div
            ref={setBox}
            data-variant={variant}
            className={mobile ? 'relative h-[40rem] w-[22rem]' : 'relative h-[34rem] w-[42rem]'}
        >
            {box && (
                <UserMenu defaultOpen mobile={mobile} container={box}>
                    <UserMenuControl>
                        <Avatar size="xs" circle interactive aria-label={`Lisa Miller ${variant}`} image={PHOTO} />
                    </UserMenuControl>
                    <UserMenuBody>
                        <UserMenuHeader>
                            <Avatar circle size="l" zoomGlyph="edit" aria-label="Edit avatar" image={PHOTO} />
                            <UserMenuHeaderContainer>
                                <UserMenuUserName>Lisa Miller</UserMenuUserName>
                                <UserMenuSubline>lisa.miller@test.com</UserMenuSubline>
                                <UserMenuSubline>User Experience Designer</UserMenuSubline>
                                <UserMenuSubline>Primary Employment</UserMenuSubline>
                            </UserMenuHeaderContainer>
                            <UserMenuHeaderContentArea>
                                <MessageStrip type="information" dismissible={false}>
                                    This is an information massage.
                                </MessageStrip>
                            </UserMenuHeaderContentArea>
                        </UserMenuHeader>
                        <UserMenuContentContainer>
                            <UserMenuList aria-label="User actions">
                                <UserMenuListItem icon="action-settings" text="Settings" />
                                <UserMenuListItem
                                    icon="card"
                                    text="Menu Item"
                                    subtitle="Sub-menu List Item"
                                    submenu={
                                        <UserMenuSublist hasIcons>
                                            <UserMenuListItem icon="card" text="Sub-menu Item" />
                                            <UserMenuListItem text="Sub-menu Item" />
                                        </UserMenuSublist>
                                    }
                                />
                                <UserMenuListItem icon="official-service" text="Legal Information" />
                                <UserMenuListItem icon="message-information" text="About" />
                            </UserMenuList>
                        </UserMenuContentContainer>
                    </UserMenuBody>
                    <UserMenuFooter>
                        <Bar barDesign="footer">
                            <BarRight>
                                <Button variant="transparent" label="Sign Out" glyph="log" />
                            </BarRight>
                        </Bar>
                    </UserMenuFooter>
                </UserMenu>
            )}
        </div>
    );
}

export const Variants: Story = {
    name: 'Variants',
    tags: ['!autodocs'],
    parameters: {
        docs: {
            description: {
                story:
                    "fundamental-styles' first example, open in a box of the page (`container`) with its submenu open: the " +
                    'visual reference cases.'
            }
        }
    },
    render: () => <StaticMenu variant="Desktop" />,
    play: async ({ canvasElement }) => {
        const parent = await waitFor(() => {
            const el = canvasElement.querySelector<HTMLElement>('[data-variant="Desktop"] [aria-haspopup="menu"]');
            expect(el).not.toBeNull();
            return el!;
        });
        parent.focus();
        await userEvent.keyboard(getComputedStyle(parent).direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}');
        await waitFor(() => expect(parent.getAttribute('aria-expanded')).toBe('true'));
        // no focus ring in the reference pictures
        await waitFor(() => expect(document.activeElement?.closest('[role=menu]')).not.toBeNull());
        (document.activeElement as HTMLElement).blur();
        canvasElement.querySelector('[data-variant="Desktop"]')!.setAttribute('data-ready', '');
    }
};

export const VariantsMobile: Story = {
    name: 'Variants: mobile',
    tags: ['!autodocs'],
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' mobile example, open: the visual reference cases of mobile mode."
            }
        }
    },
    render: () => <StaticMenu variant="Mobile" mobile />,
    play: async ({ canvasElement }) => {
        await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menuitem'));
        (document.activeElement as HTMLElement).blur();
        canvasElement.querySelector('[data-variant="Mobile"]')!.setAttribute('data-ready', '');
    }
};
