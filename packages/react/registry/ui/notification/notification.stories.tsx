import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ActionSheet, ActionSheetBody, ActionSheetControl, ActionSheetItem } from '@/ui/action-sheet/action-sheet';
import { Avatar, type ColorAccent } from '@/ui/avatar/avatar';
import { Button } from '@/ui/button/button';
import { Icon } from '@/ui/icon/icon';
import { MessageStrip } from '@/ui/message-strip/message-strip';
import { ObjectStatus } from '@/ui/object-status/object-status';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';
import { Title } from '@/ui/title/title';
import {
    Notification,
    NotificationActions,
    NotificationBody,
    NotificationContent,
    NotificationFooter,
    NotificationFooterContent,
    NotificationGroup,
    NotificationGroupGrowingItem,
    NotificationGroupGrowingItemTitle,
    NotificationGroupHeader,
    NotificationGroupHeaderTitle,
    NotificationGroupList,
    NotificationHeader,
    NotificationList,
    NotificationMessageStrip,
    NotificationMessageStripContainer,
    NotificationParagraph,
    NotificationPopover,
    NotificationProvider,
    NotificationSeparator,
    NotificationTitle,
    useNotificationRef,
    useNotificationService,
    type NotificationActionKey,
    type NotificationRef
} from './notification';

const TEXT = 'font-sap-font-family text-sap-font-size text-sap-text-color';
const LONG =
    'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

/** Transparent icon buttons of a notification. */
function ActionButtons({ actions }: { actions: { glyph: string; label: string; onClick?: () => void }[] }) {
    return (
        <NotificationActions>
            {actions.map((action) => (
                <Button
                    key={action.label}
                    variant="transparent"
                    glyph={action.glyph}
                    aria-label={action.label}
                    title={action.label}
                    onClick={action.onClick}
                />
            ))}
        </NotificationActions>
    );
}

/** Product name · Feature name · time. */
function Footnotes({ time = '11:11 AM', feature = true }: { time?: string; feature?: boolean }) {
    return (
        <>
            <NotificationFooterContent>Product name</NotificationFooterContent>
            <NotificationSeparator />
            {feature && (
                <>
                    <NotificationFooterContent>Feature name</NotificationFooterContent>
                    <NotificationSeparator />
                </>
            )}
            <NotificationFooterContent>{time}</NotificationFooterContent>
        </>
    );
}

/** The item of Angular's story: avatar, status icon, title, paragraph, footnotes, an object status and actions. */
function StoryNotificationItem({
    title = 'Notification title',
    text = 'Description of the notification topic',
    unread = false,
    selected = false,
    actions = ['decline']
}: {
    title?: string;
    text?: string;
    unread?: boolean;
    selected?: boolean;
    actions?: string[];
}) {
    return (
        <Notification selected={selected}>
            <NotificationBody>
                <Avatar size="xs" glyph="batch-payments" colorAccent={10} aria-label="Payments" />
                <NotificationContent>
                    <NotificationHeader>
                        <Icon glyph="error" color="negative" aria-label="Negative" />
                        <NotificationTitle unread={unread}>{title}</NotificationTitle>
                    </NotificationHeader>
                    <NotificationParagraph>{text}</NotificationParagraph>
                    <NotificationFooter>
                        <Footnotes />
                    </NotificationFooter>
                    <ObjectStatus
                        indicationColor={2}
                        secondaryIndication
                        inverted
                        label="Important"
                        glyph="high-priority"
                    />
                </NotificationContent>
                <ActionButtons actions={actions.map((glyph) => ({ glyph, label: glyph }))} />
            </NotificationBody>
        </Notification>
    );
}

/** Angular's Notifications story: unread, selected, long, overflow actions and a message strip. */
function NotificationStates() {
    const [last, setLast] = useState('');
    const [sheetOpen, setSheetOpen] = useState(false);
    const picked = (action: string) => {
        setLast(`${action} action performed`);
        setSheetOpen(false);
    };
    return (
        <div className="flex max-w-[27rem] flex-col gap-2">
            <StoryNotificationItem title="Unread notification" unread />
            <StoryNotificationItem title="Selected notification" selected actions={['accept', 'decline']} />
            <StoryNotificationItem
                title={`Notification title (unread) ${LONG}`}
                unread
                text={`Description of notification topic ${LONG}`}
                actions={['accept', 'decline']}
            />
            <Notification>
                <NotificationBody>
                    <Avatar size="xs" glyph="product" colorAccent={2} aria-label="Product" />
                    <NotificationContent>
                        <NotificationHeader>
                            <NotificationTitle unread>Notification with overflow actions</NotificationTitle>
                        </NotificationHeader>
                        <NotificationParagraph>Description of the notification topic</NotificationParagraph>
                        <NotificationFooter>
                            <Footnotes feature={false} />
                        </NotificationFooter>
                    </NotificationContent>
                    <NotificationActions>
                        <ActionSheet noArrow placement="bottom-end" open={sheetOpen} onOpenChange={setSheetOpen}>
                            <ActionSheetControl
                                render={
                                    <Button
                                        variant="transparent"
                                        glyph="overflow"
                                        aria-label="More actions"
                                        title="More actions"
                                    />
                                }
                            />
                            <ActionSheetBody aria-label="Notification actions">
                                <ActionSheetItem label="Approve" glyph="accept" onClick={() => picked('Approve')} />
                                <ActionSheetItem label="Reject" glyph="decline" onClick={() => picked('Reject')} />
                                <ActionSheetItem
                                    label="Forward"
                                    glyph="arrow-right"
                                    onClick={() => picked('Forward')}
                                />
                            </ActionSheetBody>
                        </ActionSheet>
                        <Button
                            variant="transparent"
                            glyph="decline"
                            aria-label="Clear notification"
                            title="Clear notification"
                        />
                    </NotificationActions>
                </NotificationBody>
            </Notification>
            <Notification>
                <NotificationMessageStripContainer>
                    <MessageStrip type="error">A message strip above the notification.</MessageStrip>
                </NotificationMessageStripContainer>
                <NotificationBody>
                    <Avatar size="xs" glyph="batch-payments" aria-label="Payments" />
                    <NotificationContent>
                        <NotificationHeader>
                            <Icon glyph="error" color="negative" aria-label="Negative" />
                            <NotificationTitle unread>Notification with a message strip</NotificationTitle>
                        </NotificationHeader>
                        <NotificationParagraph>Description of the notification topic</NotificationParagraph>
                        <NotificationFooter>
                            <Footnotes feature={false} />
                        </NotificationFooter>
                    </NotificationContent>
                    <ActionButtons actions={[{ glyph: 'decline', label: 'Clear notification' }]} />
                </NotificationBody>
            </Notification>
            <p className={TEXT} aria-live="polite">
                {last}
            </p>
        </div>
    );
}

const GROUPS = [
    { title: 'Today', expanded: true, items: ['Leave request approved', 'New purchase order', 'Invoice overdue'] },
    { title: 'Yesterday', expanded: false, items: ['Meeting moved', 'Report ready'] }
];

/** The notification popover body of Angular's group story: header, message strip and the groups. */
function GroupsBody({ onActionKey }: { onActionKey?: (event: unknown, key: NotificationActionKey) => void }) {
    return (
        <NotificationPopover aria-labelledby="story-notifications-title">
            <div className="flex items-center gap-2 px-4 py-2">
                <Title level={4} id="story-notifications-title" className="flex-1">
                    Notifications
                </Title>
                <Button variant="transparent" label="Clear all" />
                <Button variant="transparent" glyph="sort" aria-label="Sort notifications" />
            </div>
            <NotificationMessageStrip>
                <MessageStrip type="warning" dismissible>
                    A dismissible warning message strip.
                </MessageStrip>
            </NotificationMessageStrip>
            <NotificationList>
                {GROUPS.map((group) => (
                    <NotificationGroup key={group.title} defaultExpanded={group.expanded}>
                        <NotificationGroupHeader>
                            <NotificationGroupHeaderTitle>{group.title}</NotificationGroupHeaderTitle>
                        </NotificationGroupHeader>
                        <NotificationGroupList>
                            {group.items.map((item, i) => (
                                <Notification key={item} onActionKey={onActionKey}>
                                    <NotificationBody>
                                        <Avatar size="xs" glyph="batch-payments" aria-label="Payments" />
                                        <NotificationContent>
                                            <NotificationHeader>
                                                <NotificationTitle unread={i === 0}>{item}</NotificationTitle>
                                            </NotificationHeader>
                                            <NotificationParagraph>
                                                Description of the notification topic.
                                            </NotificationParagraph>
                                            <NotificationFooter>
                                                <Footnotes feature={false} />
                                            </NotificationFooter>
                                        </NotificationContent>
                                        <ActionButtons actions={[{ glyph: 'decline', label: 'Clear notification' }]} />
                                    </NotificationBody>
                                </Notification>
                            ))}
                        </NotificationGroupList>
                        <NotificationGroupGrowingItem aria-label="Show more notifications">
                            <NotificationGroupGrowingItemTitle>More (2)</NotificationGroupGrowingItemTitle>
                        </NotificationGroupGrowingItem>
                    </NotificationGroup>
                ))}
            </NotificationList>
        </NotificationPopover>
    );
}

/** Angular's group story: the groups in a popover; Enter and Delete on a notification report an action. */
function NotificationGroupDemo() {
    const [last, setLast] = useState('');
    return (
        <>
            <Popover noArrow={false}>
                <PopoverTrigger render={<Button label="Open notification group" />} />
                <PopoverBody aria-labelledby="story-notifications-title">
                    <GroupsBody
                        onActionKey={(_, key) =>
                            setLast(key === 'enter' ? 'Notification opened' : 'Notification removed')
                        }
                    />
                </PopoverBody>
            </Popover>
            <p className={TEXT} aria-live="polite">
                {last}
            </p>
        </>
    );
}

/** Angular's component content: reads its data and closes itself through the ref. */
function StoryNotificationContent() {
    const ref = useNotificationRef<{ title: string }, string>();
    return (
        <Notification>
            <NotificationBody>
                <Avatar size="xs" glyph="product" aria-label="Product" />
                <NotificationContent>
                    <NotificationHeader>
                        <Icon glyph="sys-enter-2" color="positive" aria-label="Positive" />
                        <NotificationTitle unread>{ref.data?.title}</NotificationTitle>
                    </NotificationHeader>
                    <NotificationParagraph>
                        Opened from a component with the notification service.
                    </NotificationParagraph>
                    <NotificationFooter>
                        <NotificationFooterContent>Orders</NotificationFooterContent>
                        <NotificationSeparator />
                        <NotificationFooterContent>Just now</NotificationFooterContent>
                    </NotificationFooter>
                </NotificationContent>
                <ActionButtons
                    actions={[
                        { glyph: 'accept', label: 'Approve', onClick: () => ref.close('approved') },
                        { glyph: 'decline', label: 'Close', onClick: () => ref.dismiss('closed') }
                    ]}
                />
            </NotificationBody>
        </Notification>
    );
}

/** Angular's service story: banners from a component and from a template (a render function). */
function ServiceButtons() {
    const service = useNotificationService();
    const [status, setStatus] = useState('');
    const [count, setCount] = useState(0);
    const report = (ref: NotificationRef<any, any>) =>
        ref.afterClosed.then((result) =>
            setStatus(
                result.status === 'closed'
                    ? `Notification closed: ${result.value}`
                    : `Notification dismissed: ${result.reason}`
            )
        );
    return (
        <>
            <div className="flex flex-wrap gap-2">
                <Button
                    label="Open from component"
                    onClick={() => {
                        setCount(count + 1);
                        report(
                            service.open(<StoryNotificationContent />, {
                                data: { title: `New order ${count + 1}` },
                                width: '25rem'
                            })
                        );
                    }}
                />
                <Button
                    label="Open from template"
                    onClick={() =>
                        report(
                            service.open<unknown, string>(
                                (ref) => (
                                    <Notification width="25rem">
                                        <NotificationBody>
                                            <NotificationContent>
                                                <NotificationHeader>
                                                    <NotificationTitle>Opened from a template</NotificationTitle>
                                                </NotificationHeader>
                                                <NotificationParagraph>
                                                    Press Escape to dismiss it.
                                                </NotificationParagraph>
                                            </NotificationContent>
                                            <ActionButtons
                                                actions={[
                                                    {
                                                        glyph: 'decline',
                                                        label: 'Close',
                                                        onClick: () => ref.close('closed')
                                                    }
                                                ]}
                                            />
                                        </NotificationBody>
                                    </Notification>
                                ),
                                { escKeyCloseable: true }
                            )
                        )
                    }
                />
                <Button label="Close all" onClick={() => service.destroyAll()} />
            </div>
            <p className={TEXT} aria-live="polite">
                {status}
            </p>
        </>
    );
}

function NotificationServiceDemo() {
    return (
        <NotificationProvider>
            <ServiceButtons />
        </NotificationProvider>
    );
}

/* fundamental-styles' stories, with its texts, for the visual comparison */

/** A notification of fundamental-styles' Primary story. */
function FsNotification({
    title = 'Notification Title',
    text = 'Description of notification topic',
    unread = false,
    status,
    avatar = true,
    more,
    time = '11:11',
    actions,
    children
}: {
    title?: string;
    text?: string;
    unread?: boolean;
    status?: ReactNode;
    avatar?: boolean | { glyph: string; colorAccent: ColorAccent };
    more?: boolean;
    time?: string;
    actions: string[];
    children?: ReactNode;
}) {
    const avatarProps = typeof avatar === 'object' ? avatar : { glyph: 'product', colorAccent: 10 as ColorAccent };
    return (
        <Notification>
            <NotificationBody>
                {avatar && <Avatar size="xs" {...avatarProps} aria-label="Avatar" />}
                <NotificationContent>
                    <NotificationHeader>
                        {status}
                        <NotificationTitle unread={unread}>{title}</NotificationTitle>
                    </NotificationHeader>
                    <NotificationParagraph>{text}</NotificationParagraph>
                    <NotificationFooter showTrigger={more}>
                        <NotificationFooterContent>Product Name</NotificationFooterContent>
                        <NotificationSeparator />
                        <NotificationFooterContent>Feature Name</NotificationFooterContent>
                        <NotificationSeparator />
                        <NotificationFooterContent>{time}</NotificationFooterContent>
                    </NotificationFooter>
                    {children}
                </NotificationContent>
                <ActionButtons
                    actions={actions.map((label) => ({ glyph: label === 'Close' ? 'decline' : 'overflow', label }))}
                />
            </NotificationBody>
        </Notification>
    );
}

const FS_LONG_TITLE =
    'Notification Title lorem ipsum dolor sit amet, consectetur adipisicing elit. Et expedita quis adipisci libero culpa inventore sequi blanditiis nobis doloremque amet optio atque officia facilis reprehenderit ex nesciunt, dicta, beatae molestias. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis sequi corporis eius voluptatem praesentium, et sapiente enim facere. Ratione totam fuga laudantium quibusdam ducimus iste. Delectus eligendi debitis labore quam!';
const FS_LONG_TEXT =
    'Description of notification topic lorem ipsum dolor, sit amet consectetur adipisicing elit. Veritatis, impedit fuga sit eligendi cumque laborum quae id. Dolor nesciunt voluptatum, dolorem reprehenderit animi expedita harum fugit blanditiis quaerat vitae aliquid. Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur minima libero suscipit quidem sequi dolores? Natus necessitatibus, reprehenderit, repudiandae incidunt ipsam, unde molestiae doloremque distinctio ad placeat dolorem labore quasi!';

/** fundamental-styles' Primary story. */
function FsPrimary() {
    return (
        <div className="flex flex-col gap-4">
            <FsNotification
                unread
                more
                status={<Icon glyph="error" color="negative" aria-label="Status Negative" />}
                actions={['Close']}
            >
                <ObjectStatus
                    indicationColor={2}
                    secondaryIndication
                    inverted
                    label="Important"
                    glyph="high-priority"
                />
            </FsNotification>
            <FsNotification
                title={FS_LONG_TITLE}
                text={FS_LONG_TEXT}
                status={<Icon glyph="sys-enter-2" color="positive" aria-label="Status Positive" />}
                actions={['More Actions', 'Close']}
            />
            <FsNotification
                text="Description of notification"
                time="10:20"
                avatar={false}
                status={<Icon glyph="information" color="information" aria-label="Status Information" />}
                actions={['More Actions', 'Close']}
            />
            <FsNotification unread actions={['Close']} />
        </div>
    );
}

/** fundamental-styles' Notification group story, without the popover: the body inline, 27rem wide. */
function FsGroups() {
    const groups = [
        { title: 'Today', expanded: true, more: true, count: 5 },
        { title: 'Yesterday', expanded: true, more: false, count: 2 },
        { title: 'Last Week', expanded: false, more: false, count: 2 }
    ];
    return (
        <NotificationPopover aria-label="Notifications">
            <NotificationMessageStrip>
                <MessageStrip type="error">
                    Vivamus sagittis diam in vehicula lobortis sapien arcu mattis erat vel aliquet sem urna et.
                </MessageStrip>
            </NotificationMessageStrip>
            <NotificationList>
                {groups.map((group) => (
                    <NotificationGroup key={group.title} defaultExpanded={group.expanded}>
                        <NotificationGroupHeader>
                            <NotificationGroupHeaderTitle>{group.title}</NotificationGroupHeaderTitle>
                        </NotificationGroupHeader>
                        <NotificationGroupList>
                            {Array.from({ length: group.count }, (_, i) => (
                                <FsNotification
                                    key={i}
                                    unread
                                    time={`${11 + i}:00`}
                                    avatar={{ glyph: 'product', colorAccent: (i + 1) as ColorAccent }}
                                    actions={['More Actions', 'Close']}
                                />
                            ))}
                        </NotificationGroupList>
                        {group.more && (
                            <NotificationGroupGrowingItem title="More" aria-label="More">
                                <NotificationGroupGrowingItemTitle>More</NotificationGroupGrowingItemTitle>
                            </NotificationGroupGrowingItem>
                        )}
                    </NotificationGroup>
                ))}
            </NotificationList>
        </NotificationPopover>
    );
}

/** Opens fundamental-styles' two banners, into the story root. */
function FsBannerButton() {
    const service = useNotificationService();
    return (
        <Button
            label="Show banners"
            onClick={() => {
                for (let i = 0; i < 2; i++) {
                    service.open(
                        () => (
                            <FsNotification unread avatar={{ glyph: 'product', colorAccent: 10 }} actions={['Close']} />
                        ),
                        { shouldTrapFocus: false }
                    );
                }
            }}
        />
    );
}

/** fundamental-styles' Notification banner story: two banners at the top end. */
function FsBanner() {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    return (
        <div ref={setContainer}>
            {container && (
                <NotificationProvider container={container}>
                    <FsBannerButton />
                </NotificationProvider>
            )}
        </div>
    );
}

const meta = {
    title: 'Components/Notification',
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 520 },
            description: {
                component:
                    'A notification informs about an event with a title, a description, footnotes, a status and actions. Long texts are clamped to two lines with a More/Less link. ' +
                    'Notifications appear in lists and collapsible groups (arrow keys, Home and End move between them) or as banners opened by `useNotificationService()` below a `NotificationProvider`.\n\n' +
                    '```tsx\n' +
                    '<Notification>\n' +
                    '    <NotificationBody>\n' +
                    '        <NotificationContent>\n' +
                    '            <NotificationHeader><NotificationTitle unread>New order</NotificationTitle></NotificationHeader>\n' +
                    '            <NotificationParagraph>Order 4711 was placed.</NotificationParagraph>\n' +
                    '        </NotificationContent>\n' +
                    '    </NotificationBody>\n' +
                    '</Notification>\n' +
                    '```'
            }
        }
    }
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = { name: 'Notifications', render: () => <NotificationStates /> };

export const Group: Story = { name: 'Groups in a popover', render: () => <NotificationGroupDemo /> };

export const Service: Story = { name: 'Service', render: () => <NotificationServiceDemo /> };

export const Primary: Story = {
    name: 'fundamental-styles: notifications',
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' Primary story: unread with a forced More link, long texts clamped, without avatar, and two action buttons."
            }
        }
    },
    render: () => <FsPrimary />
};

export const Groups: Story = {
    name: 'fundamental-styles: groups',
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' Notification group story: the popover body inline, with expanded and collapsed groups and a growing item."
            }
        }
    },
    render: () => <FsGroups />
};

export const OpenBanners: Story = {
    name: 'Open: fundamental-styles banners',
    tags: ['!autodocs'],
    parameters: {
        docs: { description: { story: "fundamental-styles' Notification banner story: two banners from the service." } }
    },
    render: () => <FsBanner />,
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show banners' }));
        await waitFor(() => expect(canvasElement.querySelectorAll('[data-notification]')).toHaveLength(2));
    }
};

export const OpenGroup: Story = {
    name: 'Open: groups',
    tags: ['!autodocs'],
    render: () => <NotificationGroupDemo />,
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open notification group' }));
        await waitFor(() => expect(document.querySelector('[role="dialog"] [role="list"]')).not.toBeNull());
    }
};

export const OpenOverflow: Story = {
    name: 'Open: overflow actions',
    tags: ['!autodocs'],
    render: () => <NotificationStates />,
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'More actions' }));
        await waitFor(() => expect(document.querySelector('[role="menu"]')).not.toBeNull());
    }
};

export const OpenService: Story = {
    name: 'Open: service banner',
    tags: ['!autodocs'],
    render: () => <NotificationServiceDemo />,
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open from component' }));
        await waitFor(() =>
            expect(document.querySelector('[data-notification-container] [data-notification]')).not.toBeNull()
        );
    }
};
