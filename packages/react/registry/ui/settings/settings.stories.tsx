import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Avatar } from '@/ui/avatar/avatar';
import { Bar, BarElement, BarLeft, ButtonBar } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import { DialogBody, DialogFooter, DialogPopup, DialogProvider, useDialogService } from '@/ui/dialog/dialog';
import { FormItem, FormLabel } from '@/ui/form/form';
import { Input } from '@/ui/input/input';
import { List, ListContent, ListGroupHeader, ListIcon, ListItem, ListLink, ListTitle } from '@/ui/list/list';
import { MessageStrip } from '@/ui/message-strip/message-strip';
import { Switch } from '@/ui/switch/switch';
import { Title } from '@/ui/title/title';
import { Toolbar } from '@/ui/toolbar/toolbar';
import {
    SettingsContainer,
    SettingsContent,
    SettingsContentContainer,
    SettingsList,
    SettingsListArea,
    SettingsListContainer,
    SettingsListFooter,
    SettingsListItem,
    SettingsProfileCard,
    SettingsProfileCardName,
    SettingsProfileCardSubline,
    SettingsSpacing,
    settingsDialogConfig,
    useSettings
} from './settings';

const PHOTO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' fill='%23a2c4e6'/><circle cx='40' cy='31' r='15' fill='%23557a9e'/><path d='M12 80c3-18 15-26 28-26s25 8 28 26z' fill='%23557a9e'/></svg>";
const THEMES = ['Automatic', 'Morning Horizon', 'Evening Horizon', 'High Contrast Black', 'High Contrast White'];
const SOURCES = ['Leave Requests', 'Purchase Orders', 'Travel Expenses'];
const LANGUAGE_FIELDS = [
    { id: 'settings-language', label: 'Display Language', value: 'English (United States)' },
    { id: 'settings-region', label: 'Region', value: 'United States' },
    { id: 'settings-date', label: 'Date Format', value: 'MM.DD.YYYY' },
    { id: 'settings-time', label: 'Time Format', value: '12 Hour' }
];
const TEXT = 'm-0 mt-2 font-sap-font-family text-sap-font-size text-sap-text-color';

function AccountView() {
    return (
        <SettingsContent>
            <SettingsProfileCard>
                <Avatar circle size="xl" image={PHOTO} aria-label="Edit avatar of Alain Chevallier" zoomGlyph="edit" />
                <SettingsProfileCardName>Alain Chevallier</SettingsProfileCardName>
                <SettingsProfileCardSubline>alain.chevallier@example.com</SettingsProfileCardSubline>
                <SettingsProfileCardSubline>Delivery Manager</SettingsProfileCardSubline>
                <Button label="Manage Account" glyph="user-settings" />
            </SettingsProfileCard>
            <SettingsContentContainer>
                <SettingsSpacing size="small" />
                <FormItem>
                    <FormLabel htmlFor="settings-name">Display name</FormLabel>
                    <Input id="settings-name" defaultValue="Alain Chevallier" />
                </FormItem>
            </SettingsContentContainer>
        </SettingsContent>
    );
}

function AppearanceView() {
    return (
        <SettingsContent noPadding>
            <Toolbar title="Themes" />
            <List aria-label="Themes">
                <ListGroupHeader>
                    <ListTitle>SAP Horizon</ListTitle>
                </ListGroupHeader>
                {THEMES.map((theme) => (
                    <ListItem key={theme} interactive defaultSelected={theme === 'Morning Horizon'}>
                        <Avatar colorAccent={7} glyph="product" size="s" aria-label={theme} />
                        <ListContent>
                            <ListTitle>{theme}</ListTitle>
                        </ListContent>
                    </ListItem>
                ))}
            </List>
        </SettingsContent>
    );
}

function LanguageView() {
    return (
        <SettingsContent>
            {LANGUAGE_FIELDS.map((field) => (
                <div key={field.id}>
                    <FormItem>
                        <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                        <Input id={field.id} defaultValue={field.value} />
                    </FormItem>
                    <SettingsSpacing size="form" />
                </div>
            ))}
        </SettingsContent>
    );
}

function DetailView() {
    return (
        <SettingsContent>
            <Switch defaultChecked>Allow notifications</Switch>
            <SettingsSpacing size="small" />
            <Switch>Play a sound</Switch>
        </SettingsContent>
    );
}

/** Pushes the details of a source: `useSettings().pushView`. */
function NotificationsView() {
    const settings = useSettings();
    return (
        <SettingsContent noPadding>
            <List aria-label="Notification sources">
                {SOURCES.map((source) => (
                    <ListItem key={source}>
                        <ListLink
                            navigationIndicator
                            href="#"
                            onClick={(event) => {
                                event.preventDefault();
                                settings.pushView(<DetailView />, source);
                            }}
                        >
                            <ListTitle>{source}</ListTitle>
                        </ListLink>
                    </ListItem>
                ))}
            </List>
        </SettingsContent>
    );
}

function ResetView() {
    return (
        <SettingsContent>
            <MessageStrip type="warning">Resetting restores the default settings and signs you out.</MessageStrip>
        </SettingsContent>
    );
}

const ENTRIES = [
    { glyph: 'user-settings', title: 'User Account', view: <AccountView /> },
    { glyph: 'palette', title: 'Appearance', view: <AppearanceView /> },
    { glyph: 'globe', title: 'Language & Region', view: <LanguageView /> },
    { glyph: 'bell', title: 'Notifications', view: <NotificationsView /> }
];

/** Angular's settings: four views, one of them pushing details, and Reset Settings in the footer list. */
function StorySettings({ onReset }: { onReset?: (reset: boolean) => void }) {
    return (
        <SettingsContainer backBtnAriaLabel="Navigate Back">
            <SettingsListArea>
                <Bar barDesign="header">
                    <BarLeft>
                        <BarElement>
                            <Title level={2} headerSize={5} id="settings-title">
                                Settings
                            </Title>
                        </BarElement>
                    </BarLeft>
                </Bar>
                <SettingsListContainer>
                    <SettingsList navigationIndicator noBorder aria-labelledby="settings-title">
                        {ENTRIES.map((entry, i) => (
                            <SettingsListItem
                                key={entry.title}
                                view={entry.view}
                                defaultSelected={i === 0}
                                onClick={() => onReset?.(false)}
                            >
                                <ListLink navigationIndicator>
                                    <ListIcon glyph={entry.glyph} />
                                    <ListTitle>{entry.title}</ListTitle>
                                </ListLink>
                            </SettingsListItem>
                        ))}
                    </SettingsList>
                    <SettingsListFooter navigationIndicator noBorder aria-label="Reset">
                        <SettingsListItem view={<ResetView />} onClick={() => onReset?.(true)}>
                            <ListLink navigationIndicator>
                                <ListIcon glyph="reset" />
                                <ListTitle>Reset Settings</ListTitle>
                            </ListLink>
                        </SettingsListItem>
                    </SettingsListFooter>
                </SettingsListContainer>
            </SettingsListArea>
        </SettingsContainer>
    );
}

/** The settings dialog: Save and Cancel while Reset Settings is open, else Close. */
function SettingsDialogContent({ close, dismiss }: { close: (r: string) => void; dismiss: (r: string) => void }) {
    const [resetMode, setResetMode] = useState(false);
    return (
        <DialogPopup>
            <DialogBody>
                <StorySettings onReset={setResetMode} />
            </DialogBody>
            <DialogFooter>
                {resetMode ? (
                    <>
                        <ButtonBar variant="emphasized" label="Save" onClick={() => close('Save')} />
                        <ButtonBar label="Cancel" onClick={() => dismiss('Cancel')} />
                    </>
                ) : (
                    <ButtonBar label="Close" onClick={() => close('Close')} />
                )}
            </DialogFooter>
        </DialogPopup>
    );
}

function SettingsDialogButton() {
    const dialogs = useDialogService();
    const [result, setResult] = useState('');
    const open = () => {
        const ref = dialogs.open<unknown, string>(
            (dialog) => <SettingsDialogContent close={(r) => dialog.close(r)} dismiss={(r) => dialog.dismiss(r)} />,
            settingsDialogConfig({ ariaLabelledBy: 'settings-title' })
        );
        ref.afterClosed.then((r) => setResult(r.status === 'closed' ? `Closed: ${r.value}` : `Dismissed: ${r.reason}`));
    };
    return (
        <>
            <Button label="Open settings" glyph="action-settings" onClick={open} />
            <p className={TEXT} aria-live="polite">
                {result}
            </p>
        </>
    );
}

function SettingsDialogDemo() {
    return (
        <DialogProvider>
            <SettingsDialogButton />
        </DialogProvider>
    );
}

/** The window of Angular's inline story. */
function InlineFrame({ children, height = 'h-[42.5rem]' }: { children: ReactNode; height?: string }) {
    return (
        <div
            className={`${height} max-w-[60rem] overflow-hidden rounded-sap-element-border-corner-radius bg-sap-group-content-background [box-shadow:var(--sapContent_Shadow1)]`}
        >
            {children}
        </div>
    );
}

const FS_ENTRIES = [
    { glyph: 'user-settings', title: 'User Account' },
    { glyph: 'palette', title: 'Appearance' },
    { glyph: 'globe', title: 'Language & Region' },
    { glyph: 'iphone', title: 'SAP Mobile Start Application' },
    { glyph: 'bell', title: 'Notifications' }
];

/** fundamental-styles' User account story, inline: the dialog body, 60rem by 42.5rem less the footer bar. */
function FsUserAccount() {
    return (
        <InlineFrame height="h-[39.75rem] compact:h-[40rem]">
            <SettingsContainer>
                <SettingsListArea>
                    <Bar barDesign="header">
                        <BarLeft>
                            <BarElement>
                                <Title level={1} headerSize={5}>
                                    Settings
                                </Title>
                            </BarElement>
                        </BarLeft>
                    </Bar>
                    <SettingsListContainer>
                        <SettingsList navigationIndicator noBorder aria-label="Settings">
                            {FS_ENTRIES.map((entry, i) => (
                                <SettingsListItem
                                    key={entry.title}
                                    defaultSelected={i === 0}
                                    view={
                                        <SettingsContent noBackground>
                                            <SettingsProfileCard>
                                                <Avatar
                                                    circle
                                                    size="xl"
                                                    image={PHOTO}
                                                    aria-label="Alain Chevallier"
                                                    zoomGlyph="edit"
                                                />
                                                <SettingsProfileCardName render={<h3 />}>
                                                    Alain Chevallier
                                                </SettingsProfileCardName>
                                                <SettingsProfileCardSubline>
                                                    alain.chevallier@sap.com
                                                </SettingsProfileCardSubline>
                                                <SettingsProfileCardSubline>
                                                    Delivery Manager, SAP SE
                                                </SettingsProfileCardSubline>
                                                <Button label="Manage Account" glyph="user-settings" />
                                            </SettingsProfileCard>
                                            <SettingsContentContainer />
                                        </SettingsContent>
                                    }
                                >
                                    <ListLink navigationIndicator href="#">
                                        <ListIcon glyph={entry.glyph} />
                                        <ListTitle>{entry.title}</ListTitle>
                                    </ListLink>
                                </SettingsListItem>
                            ))}
                        </SettingsList>
                    </SettingsListContainer>
                </SettingsListArea>
            </SettingsContainer>
        </InlineFrame>
    );
}

const meta = {
    title: 'Components/Settings',
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 760 },
            description: {
                component:
                    'Settings show a list of settings next to the view of the selected one, usually in a dialog (`settingsDialogConfig()` sizes it). ' +
                    'Each `SettingsListItem` passes its view as `view`. On medium and small screens (below 1024px and 600px) the list and the view replace each other, with a back button; ' +
                    'views can push further views with `useSettings().pushView(view, title)`.'
            }
        }
    }
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Dialog: Story = { name: 'Dialog', render: () => <SettingsDialogDemo /> };

export const Inline: Story = {
    render: () => (
        <InlineFrame>
            <StorySettings />
        </InlineFrame>
    )
};

export const UserAccount: Story = {
    name: 'fundamental-styles: user account',
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' User account story, inline: its list items, header and profile card."
            }
        }
    },
    render: () => <FsUserAccount />
};

export const OpenDialog: Story = {
    name: 'Open: dialog',
    tags: ['!autodocs'],
    render: () => <SettingsDialogDemo />,
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open settings' }));
        await waitFor(() => expect(document.querySelector('[role=dialog] [data-settings-view]')).not.toBeNull());
    }
};
