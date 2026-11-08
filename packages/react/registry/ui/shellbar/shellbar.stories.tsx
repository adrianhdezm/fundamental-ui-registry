import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps, type ComponentType } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Avatar } from '@/ui/avatar/avatar';
import { Bar, BarRight } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import { Icon } from '@/ui/icon/icon';
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/ui/menu/menu';
import { MessageToastProvider, useMessageToastService } from '@/ui/message-toast/message-toast';
import { ObjectStatus } from '@/ui/object-status/object-status';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';
import { ProductSwitch, ProductSwitchBody, type ProductSwitchItem } from '@/ui/product-switch/product-switch';
import { Switch } from '@/ui/switch/switch';
import {
    UserMenu,
    UserMenuBody,
    UserMenuContentContainer,
    UserMenuControl,
    UserMenuControlElement,
    UserMenuFooter,
    UserMenuHeader,
    UserMenuHeaderContainer,
    UserMenuList,
    UserMenuListItem,
    UserMenuSubline,
    UserMenuUserName,
    useUserMenu
} from '@/ui/user-menu/user-menu';
import {
    ProductMenu,
    Shellbar,
    ShellbarAction,
    ShellbarActions,
    ShellbarBranding,
    ShellbarContextArea,
    ShellbarLogo,
    ShellbarSearch,
    ShellbarSeparator,
    ShellbarSubtitle,
    ShellbarTitle,
    ShellbarUserMenu,
    type ShellbarGroupFlexOptions,
    type ShellbarMenuItem,
    type ShellbarProps,
    type ShellbarSize,
    type ShellbarUser,
    type ShellbarUserMenuItem
} from './shellbar';

/** A neutral placeholder logo. */
const LOGO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'><rect width='60' height='30' rx='4' fill='%230070f2'/><text x='30' y='20' font-family='Arial' font-size='13' font-weight='bold' fill='white' text-anchor='middle'>ACME</text></svg>";

/** A placeholder user photo. */
const PHOTO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23d1efff'/><circle cx='16' cy='12' r='6' fill='%23a16c32'/><path d='M4 32c1-8 6-11 12-11s11 3 12 11z' fill='%230064d9'/></svg>";

const NOTE = 'm-0 font-sap-font-family text-sap-font-small-size text-sap-content-label-color';

const PRODUCTS: ProductSwitchItem[] = [
    { title: 'Home', subtitle: 'Central Home', icon: 'home' },
    { title: 'Analytics Cloud', icon: 'business-objects-experience' },
    { title: 'Catalog', subtitle: 'Ariba', icon: 'contacts' },
    { title: 'Guided Buying', icon: 'credit-card' },
    { title: 'Strategic Procurement', icon: 'cart-3' },
    { title: 'Human Capital Management', icon: 'customer' }
];

/** The product switch of Angular's stories: its products, as a list when `list` (small shellbars). */
function StoryProductSwitch({ list = false }: { list?: boolean }) {
    return (
        <ProductSwitch>
            <ProductSwitchBody defaultProducts={PRODUCTS} forceListMode={list} />
        </ProductSwitch>
    );
}

/** A user menu item that closes the menu when chosen (Angular's `(click)="menu.close()"`). */
function ClosingItem(props: Omit<ComponentProps<typeof UserMenuListItem>, 'onClick'>) {
    const menu = useUserMenu();
    return <UserMenuListItem {...props} onClick={() => menu?.close()} />;
}

/**
 * The user menu of Angular's shellbar stories (`StoryShellbarUserMenu`). An element, not a component, so that
 * `ShellbarActions` sees a `UserMenu` child and puts it after the actions, before the product switch.
 */
const USER_MENU = (
    <UserMenu>
        <UserMenuControl>
            <UserMenuControlElement render={<Avatar size="xs" circle interactive label="Lisa Miller" />} />
        </UserMenuControl>
        <UserMenuBody>
            <UserMenuHeader>
                <Avatar circle size="l" label="Lisa Miller" />
                <UserMenuHeaderContainer>
                    <UserMenuUserName>Lisa Miller</UserMenuUserName>
                    <UserMenuSubline>lisa.miller@test.com</UserMenuSubline>
                    <UserMenuSubline>User Experience Designer</UserMenuSubline>
                </UserMenuHeaderContainer>
                <Button label="Manage Account" glyph="user-settings" />
            </UserMenuHeader>
            <UserMenuContentContainer>
                <UserMenuList aria-label="User actions">
                    <ClosingItem icon="action-settings" text="Settings" />
                    <ClosingItem icon="message-information" text="About" />
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
);

const ACTIONS = [
    { glyph: 'ai', label: 'Joule', count: 0 },
    { glyph: 'bell', label: 'Notifications', count: 72 },
    { glyph: 'feedback', label: 'Feedback', count: 0 },
    { glyph: 'sys-help', label: 'Help', count: 0 }
];

interface ExampleProps extends Pick<ShellbarProps, 'size' | 'showSearchFieldOnSizeSmall'> {
    width?: number;
    search?: boolean;
    navigation?: boolean;
}

/**
 * Angular's story shellbar: navigation and back buttons, branding, search, four actions, user menu, product switch.
 * Each action reports itself in a message toast, as Angular's.
 */
function Example({ width, search = true, navigation = true, ...props }: ExampleProps) {
    const toasts = useMessageToastService();
    const toast = (text: string) => toasts.open(text, { duration: 2000 });
    return (
        <div style={{ maxWidth: width }}>
            <Shellbar
                {...props}
                showNavigationButton={navigation}
                showBackButton={navigation}
                onNavigationButtonClick={() => toast('Navigation')}
                onBackButtonClick={() => toast('Back')}
            >
                <ShellbarBranding
                    interactiveBranding
                    aria-label="ACME Corporate Portal home"
                    onClick={() => toast('Home')}
                >
                    <ShellbarLogo>
                        <img src={LOGO} alt="ACME" />
                    </ShellbarLogo>
                    <ShellbarTitle>Corporate Portal</ShellbarTitle>
                </ShellbarBranding>
                {search && (
                    <ShellbarSearch
                        placeholder="Search everything"
                        onSearchSubmit={(text) => toast(`Search: ${text}`)}
                    />
                )}
                <ShellbarActions productSwitch={<StoryProductSwitch />}>
                    {ACTIONS.map((action) => (
                        <ShellbarAction
                            key={action.label}
                            glyph={action.glyph}
                            label={action.label}
                            notificationCount={action.count}
                            notificationLabel={action.count ? `${action.count} new` : null}
                            onClick={() => toast(action.label)}
                        />
                    ))}
                    {USER_MENU}
                </ShellbarActions>
            </Shellbar>
        </div>
    );
}

const SIZES: { size: ShellbarSize; width: number }[] = [
    { size: 'xl', width: 1300 },
    { size: 'l', width: 1000 },
    { size: 'm', width: 560 },
    { size: 's', width: 319 }
];

function Sizes() {
    return (
        <div className="flex flex-col gap-6">
            {SIZES.map((s) => (
                <div key={s.size}>
                    <p className={`${NOTE} mb-1`}>
                        {s.size.toUpperCase()}: {s.width}px
                    </p>
                    <Example width={s.width} />
                </div>
            ))}
        </div>
    );
}

/** Toggle actions: `variant` sets the button type and `toggled` shows it pressed (aria-pressed). */
const TOGGLES = [
    { glyph: 'account', label: 'Account', variant: 'transparent' },
    { glyph: 'filter', label: 'Filter', variant: 'attention' },
    { glyph: 'cart', label: 'Cart', variant: 'positive' }
] as const;

function ContextExample({ width, overflow = false }: { width?: number; overflow?: boolean }) {
    const [hidden, setHidden] = useState<HTMLElement[]>([]);
    const [overflowOpen, setOverflowOpen] = useState(false);
    const [toggled, setToggled] = useState<string[]>(['Filter']);
    const hiddenLabels = hidden.map((el) => el.dataset['label']).filter((label): label is string => !!label);
    return (
        <div style={{ maxWidth: width }}>
            <Shellbar showNavigationButton>
                <ShellbarBranding interactiveBranding aria-label="ACME Corporate Portal home">
                    <ShellbarLogo>
                        <img src={LOGO} alt="ACME" />
                    </ShellbarLogo>
                    <ShellbarTitle>Corporate Portal</ShellbarTitle>
                </ShellbarBranding>
                <ShellbarContextArea
                    onContentItemVisibilityChange={(items) => {
                        setHidden(items);
                        if (!items.length) setOverflowOpen(false);
                    }}
                >
                    {overflow && (
                        // priority 0: the overflow button hides last; it lists what does not fit
                        <span
                            data-hide-priority="0"
                            className="flex"
                            style={{ visibility: hidden.length ? 'visible' : 'hidden' }}
                        >
                            <Popover placement="bottom-end" open={overflowOpen} onOpenChange={setOverflowOpen}>
                                <PopoverTrigger
                                    render={
                                        <Button
                                            variant="transparent"
                                            glyph="slim-arrow-down"
                                            aria-label="Show hidden context items"
                                            title="More items"
                                        />
                                    }
                                />
                                <PopoverBody aria-label="Hidden context items">
                                    <ul className="m-0 flex list-none flex-col gap-2 p-4 font-sap-font-family text-sap-font-size text-sap-text-color">
                                        {hiddenLabels.map((label) => (
                                            <li key={label}>{label}</li>
                                        ))}
                                    </ul>
                                </PopoverBody>
                            </Popover>
                        </span>
                    )}
                    <ShellbarSeparator />
                    <Menu placement="bottom-start">
                        <MenuTrigger
                            render={<Button variant="transparent" menu label="EMEA" data-label="Region: EMEA" />}
                        />
                        <MenuPopup aria-label="Region">
                            <MenuItem>EMEA</MenuItem>
                            <MenuItem>Americas</MenuItem>
                            <MenuItem>APJ</MenuItem>
                        </MenuPopup>
                    </Menu>
                    <ShellbarSeparator />
                    <ObjectStatus
                        inverted
                        indicationColor={5}
                        label="Environment"
                        data-label="Environment"
                        data-hide-priority="4"
                    />
                    {/* stand-in for the object marker, which is not ported yet */}
                    <span
                        data-label="New Feature"
                        data-hide-priority="3"
                        className="inline-flex items-center gap-1 font-sap-font-family text-sap-font-size text-sap-content-label-color"
                    >
                        <Icon glyph="flag" />
                        New Feature
                    </span>
                    <Switch aria-label="Preview mode" data-label="Preview mode" data-hide-priority="2" />
                </ShellbarContextArea>
                <ShellbarActions assistiveTools onAssistiveToolsClick={() => undefined}>
                    {TOGGLES.map((action) => (
                        <ShellbarAction
                            key={action.label}
                            glyph={action.glyph}
                            label={action.label}
                            variant={action.variant}
                            toggled={toggled.includes(action.label)}
                            onClick={() =>
                                setToggled((list) =>
                                    list.includes(action.label)
                                        ? list.filter((l) => l !== action.label)
                                        : [...list, action.label]
                                )
                            }
                        />
                    ))}
                    <ShellbarAction glyph="bell" label="Notifications" notificationCount={3} />
                    {USER_MENU}
                </ShellbarActions>
            </Shellbar>
            <p className={`${NOTE} mt-2`} aria-live="polite">
                Hidden context items: {hidden.length}. Toggled: {toggled.join(', ') || 'none'}.
            </p>
        </div>
    );
}

const SIMPLE_USER: ShellbarUser = { fullName: 'William Wallingham', colorAccent: 6 };
const SIMPLE_USER_MENU: ShellbarUserMenuItem[] = [{ text: 'Settings' }, { text: 'Sign Out' }];

function SimpleExample() {
    const productItems: ShellbarMenuItem[] = [
        { name: 'Application A' },
        { name: 'Application B', glyph: 'action-settings' },
        { name: 'Application C' }
    ];
    return (
        <Shellbar>
            <ShellbarLogo>
                <img src={LOGO} alt="ACME" />
            </ShellbarLogo>
            <ProductMenu control="Corporate Portal" items={productItems} closePopoverOnSelect />
            <ShellbarSubtitle>Subtitle</ShellbarSubtitle>
            <ShellbarActions user={SIMPLE_USER} userMenu={SIMPLE_USER_MENU}>
                <ShellbarAction glyph="bell" label="Notifications" notificationCount={5} notificationLabel="5 unread" />
                <ShellbarAction glyph="sys-help" label="Help" />
            </ShellbarActions>
        </Shellbar>
    );
}

/** Groups that may shrink take only the space their content needs. */
const GROWING: ShellbarGroupFlexOptions = {
    product: { shrink: true, flexBasisAuto: true },
    actions: { shrink: true, flexBasisAuto: true }
};

function GrowingExample() {
    return (
        <Shellbar groupFlex={GROWING}>
            <ShellbarBranding interactiveBranding aria-label="ACME Product Identifier home">
                <ShellbarLogo>
                    <img src={LOGO} alt="ACME" />
                </ShellbarLogo>
                <ShellbarTitle>Product Identifier</ShellbarTitle>
            </ShellbarBranding>
            <ShellbarActions productSwitch={<StoryProductSwitch />}>
                <ShellbarAction glyph="bell" label="Notifications" notificationCount={12} />
                <ShellbarAction glyph="sys-help" label="Help" />
                {USER_MENU}
            </ShellbarActions>
        </Shellbar>
    );
}

/** Product menu, actions, simple user menu and product switch, collapsing at each size. */
function CollapsibleExample() {
    const productItems: ShellbarMenuItem[] = [
        { name: 'Application A' },
        { name: 'Application B' },
        { name: 'Application C' }
    ];
    return (
        <div className="flex flex-col gap-6">
            {SIZES.map((s) => (
                <div key={s.size} style={{ maxWidth: s.width }}>
                    <p className={`${NOTE} mb-1`}>{s.size.toUpperCase()}</p>
                    <Shellbar size={s.size}>
                        <ShellbarLogo>
                            <img src={LOGO} alt="ACME" />
                        </ShellbarLogo>
                        <ProductMenu control="Corporate Portal" items={productItems} closePopoverOnSelect />
                        <ShellbarActions
                            user={SIMPLE_USER}
                            userMenu={SIMPLE_USER_MENU}
                            closePopoverOnSelect
                            productSwitch={<StoryProductSwitch list={s.size === 's'} />}
                        >
                            <ShellbarAction glyph="bell" label="Notifications" notificationCount={5} />
                            <ShellbarAction glyph="feedback" label="Feedback" />
                            <ShellbarAction glyph="sys-help" label="Help" />
                        </ShellbarActions>
                    </Shellbar>
                </div>
            ))}
        </div>
    );
}

/* fundamental-react's examples */

const PROFILE_MENU: ShellbarUserMenuItem[] = [{ text: 'Settings' }, { text: 'Sign Out' }];
const PROFILE: ShellbarUser = { initials: 'JS', fullName: 'John Snow', colorAccent: 8 };

/** fundamental-react's basic example (and fundamental-styles' mandatory elements): logo, title and user menu. */
function MandatoryExample({ back = false }: { back?: boolean }) {
    return (
        <Shellbar showBackButton={back}>
            <ShellbarBranding interactiveBranding aria-label="ACME Corporate Portal home">
                <ShellbarLogo>
                    <img src={LOGO} alt="ACME" />
                </ShellbarLogo>
                <ShellbarTitle>Corporate Portal</ShellbarTitle>
            </ShellbarBranding>
            <ShellbarActions user={PROFILE} userMenu={PROFILE_MENU} />
        </Shellbar>
    );
}

const FR_PRODUCT_MENU: ShellbarMenuItem[] = [{ name: 'Application A' }, { name: 'Application B' }];

/** fundamental-react's withProductMenu: product menu, subtitle, notifications, search and a user image. */
function ProductMenuExample() {
    return (
        <Shellbar>
            <ShellbarLogo>
                <img src={LOGO} alt="ACME" />
            </ShellbarLogo>
            <ProductMenu control="Corporate Portal" items={FR_PRODUCT_MENU} closePopoverOnSelect />
            <ShellbarSubtitle>Subtitle</ShellbarSubtitle>
            <ShellbarSearch placeholder="Search" />
            <ShellbarActions user={{ fullName: 'John Snow', image: PHOTO }} userMenu={PROFILE_MENU}>
                <ShellbarAction glyph="bell" label="Notifications" notificationCount={2} />
            </ShellbarActions>
        </Shellbar>
    );
}

/** fundamental-react's coPilot: an action with a menu, notifications with a popover, product switch, all collapsing. */
function CoPilotExample() {
    return (
        <Shellbar>
            <ShellbarLogo>
                <img src={LOGO} alt="ACME" />
            </ShellbarLogo>
            <ProductMenu control="Corporate Portal" items={FR_PRODUCT_MENU} closePopoverOnSelect />
            <ShellbarSubtitle>Subtitle</ShellbarSubtitle>
            <ShellbarSearch placeholder="Search" />
            <ShellbarActions user={PROFILE} userMenu={PROFILE_MENU} productSwitch={<StoryProductSwitch />}>
                <Menu placement="bottom-end">
                    <MenuTrigger
                        render={
                            <Button variant="transparent" glyph="settings" aria-label="Settings, 5" title="Settings" />
                        }
                    />
                    <MenuPopup aria-label="Settings">
                        <MenuItem>Option 1</MenuItem>
                        <MenuItem>Option 2</MenuItem>
                        <MenuItem>Option 3</MenuItem>
                    </MenuPopup>
                </Menu>
                <ShellbarAction glyph="ai" label="Joule" />
                <ShellbarAction glyph="bell" label="Notifications" notificationCount={2} />
            </ShellbarActions>
        </Shellbar>
    );
}

/** Clicks the button named `name` in the story and waits for the menu it opens. */
function openFrom(name: string | RegExp): Story['play'] {
    return async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name }));
        await waitFor(() => expect(document.querySelector('[role=menuitem]')).not.toBeNull());
    };
}

const meta = {
    title: 'Components/Shellbar',
    component: Shellbar,
    subcomponents: {
        ShellbarBranding,
        ShellbarLogo,
        ShellbarTitle,
        ShellbarSubtitle,
        ShellbarSeparator,
        ShellbarContextArea,
        ShellbarSearch,
        ShellbarActions,
        ShellbarAction,
        ShellbarUserMenu,
        ProductMenu
    } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 420 },
            description: {
                component:
                    'The shellbar is the top bar of an application: navigation and back buttons, the branding (logo and ' +
                    'title), an optional context area, a search field, actions, the user menu and the product switch. ' +
                    'Its size follows its width (s below 320px, m below 600px, l below 1240px, xl above). Actions that ' +
                    'do not fit collapse into an overflow menu, context area items hide by `data-hide-priority`, and ' +
                    'the search moves from the middle (xl) behind a search button; on small sizes it opens in place of ' +
                    'everything else. Transparent buttons inside the shellbar take the shell colours.\n\n' +
                    'A `UserMenu` child of `ShellbarActions` goes after the simple user menu and before the product switch.\n\n' +
                    '```tsx\n' +
                    '<Shellbar>\n' +
                    '    <ShellbarBranding interactiveBranding aria-label="Product home" onClick={home}>\n' +
                    '        <ShellbarLogo><img src="logo.svg" alt="Company" /></ShellbarLogo>\n' +
                    '        <ShellbarTitle>Product</ShellbarTitle>\n' +
                    '    </ShellbarBranding>\n' +
                    '    <ShellbarSearch placeholder="Search" onSearchSubmit={search} />\n' +
                    '    <ShellbarActions user={{ fullName: "Lisa Miller" }} userMenu={[{ text: "Sign out" }]}>\n' +
                    '        <ShellbarAction glyph="bell" label="Notifications" notificationCount={3} />\n' +
                    '    </ShellbarActions>\n' +
                    '</Shellbar>\n' +
                    '```'
            }
        }
    },
    // the stories report their actions in message toasts, as Angular's (its service is app-wide)
    decorators: [
        (Story) => (
            <MessageToastProvider>
                <Story />
            </MessageToastProvider>
        )
    ],
    argTypes: {
        size: { control: 'inline-radio', options: [undefined, 's', 'm', 'l', 'xl'] }
    }
} satisfies Meta<typeof Shellbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    args: { showSearchFieldOnSizeSmall: false },
    render: (args) => <Example size={args.size} showSearchFieldOnSizeSmall={args.showSearchFieldOnSizeSmall} />
};

export const Basic: Story = { render: () => <Example /> };

export const Responsive: Story = {
    name: 'Responsive sizes',
    parameters: { docs: { story: { iframeHeight: 520 } } },
    render: () => <Sizes />
};

export const ContextArea: Story = {
    name: 'Context area',
    parameters: {
        docs: {
            description: {
                story: 'Branding with a context area, and toggle actions: `variant` sets the button type and `toggled` shows it pressed.'
            }
        }
    },
    render: () => <ContextExample />
};

export const ContextAreaOverflow: Story = {
    name: 'Context area overflow',
    parameters: {
        docs: {
            description: {
                story: 'Context items hide by `data-hide-priority` when space runs out; `onContentItemVisibilityChange` reports them, here listed in a popover behind the arrow button (priority 0, so it hides last).'
            }
        }
    },
    render: () => <ContextExample width={560} overflow />
};

export const ProductMenuAndSimpleUserMenu: Story = {
    name: 'Product menu and simple user menu',
    render: () => <SimpleExample />
};

export const GrowingGroups: Story = {
    name: 'Growing groups',
    parameters: {
        docs: {
            description: {
                story: '`groupFlex` lets the product and actions groups shrink (`shrink`) and size to their content (`flexBasisAuto`), so they take only the space they need.'
            }
        }
    },
    render: () => <GrowingExample />
};

export const CollapsibleLinks: Story = {
    name: 'Collapsible links',
    parameters: {
        docs: {
            story: { iframeHeight: 520 },
            description: {
                story: 'A product menu, actions, a simple user menu (`user` and `userMenu`) and the product switch at each size: actions collapse into the overflow menu and, on small screens, the product switch shows a list.'
            }
        }
    },
    render: () => <CollapsibleExample />
};

export const MandatoryElements: Story = {
    name: 'Mandatory elements',
    parameters: {
        docs: {
            description: {
                story: 'The minimum shellbar for a single application with only user settings (fundamental-react’s basic example): without a user image, the initials show.'
            }
        }
    },
    render: () => <MandatoryExample />
};

export const WithBackButton: Story = {
    name: 'With back button',
    render: () => <MandatoryExample back />
};

export const WithProductMenu: Story = {
    name: 'With product menu',
    parameters: {
        docs: {
            description: {
                story: 'The product menu navigates to applications within the product, with a subtitle, a search and a user image.'
            }
        }
    },
    render: () => <ProductMenuExample />
};

export const CoPilot: Story = {
    name: 'Actions with menus',
    parameters: {
        docs: {
            description: {
                story: 'fundamental-react’s coPilot example: an action that opens a menu (a `Menu` among the actions), Joule (fundamental-styles’ successor of CoPilot), notifications, the user menu and the product switch.'
            }
        }
    },
    render: () => <CoPilotExample />
};

export const OpenUserMenu: Story = {
    name: 'Open: user menu',
    tags: ['!autodocs'],
    render: () => <Example />,
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Lisa Miller' }));
        const menu = await screen.findByRole('dialog', { name: 'Lisa Miller' });
        await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Settings' })).toHaveFocus());
        await expect(within(menu).getByRole('button', { name: 'Sign Out' })).toBeVisible();
    }
};

export const OpenProductSwitch: Story = {
    name: 'Open: product switch',
    tags: ['!autodocs'],
    render: () => <Example />,
    play: openFrom('Product switch')
};

export const OpenProductMenu: Story = {
    name: 'Open: product menu',
    tags: ['!autodocs'],
    render: () => <SimpleExample />,
    play: openFrom('Corporate Portal')
};

export const OpenSimpleUserMenu: Story = {
    name: 'Open: simple user menu',
    tags: ['!autodocs'],
    render: () => <SimpleExample />,
    play: openFrom('William Wallingham')
};

export const OpenOverflowMenu: Story = {
    name: 'Open: overflow menu',
    tags: ['!autodocs'],
    render: () => <Example width={340} />,
    play: openFrom(/^Collapsed Item Menu/)
};
