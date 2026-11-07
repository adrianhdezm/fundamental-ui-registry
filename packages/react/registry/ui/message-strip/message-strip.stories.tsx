import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { Icon } from '@/ui/icon/icon';
import { Link } from '@/ui/link/link';
import {
    MESSAGE_STRIP_INDICATION_COLORS,
    MESSAGE_STRIP_TYPES,
    MessageStrip,
    type MessageStripIndicationColor
} from './message-strip';
import {
    MessageStripAlertProvider,
    useMessageStripAlertRef,
    useMessageStripAlerts,
    type MessageStripAlertPosition
} from './message-strip-alert';

const col = 'flex flex-col gap-4';

const meta = {
    title: 'Components/Message Strip',
    component: MessageStrip,
    parameters: {
        docs: {
            description: {
                component:
                    'Message strips show information about the current context inline, coloured by type or by an ' +
                    'indication colour. They are a `note` named by a hidden type description and their text. They ' +
                    'can be dismissible, dismiss themselves after a delay (`autoDismiss`, `duration`, ' +
                    '`mousePersist`), or appear as alerts at the edges of the screen: wrap the app in ' +
                    '`MessageStripAlertProvider` and call `useMessageStripAlerts().open(...)`.\n\n' +
                    '```tsx\n' +
                    '<MessageStrip type="warning">Your session expires in 5 minutes.</MessageStrip>\n' +
                    '<MessageStrip indicationColor="6" icon={<Icon glyph="survey" />}>Survey open</MessageStrip>\n' +
                    '```'
            }
        }
    },
    argTypes: {
        type: { control: 'select', options: [null, ...MESSAGE_STRIP_TYPES] },
        indicationColor: { control: 'select', options: [null, ...MESSAGE_STRIP_INDICATION_COLORS] }
    },
    args: {
        type: 'information',
        dismissible: true,
        noIcon: false,
        children: 'A message strip with some information.'
    }
} satisfies Meta<typeof MessageStrip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Types: Story = {
    render: () => (
        <div className={col}>
            <MessageStrip type="warning">Warning Message Strip</MessageStrip>
            <MessageStrip type="success" dismissible={false}>
                Success Message Strip
            </MessageStrip>
            <MessageStrip type="information">Information Message Strip</MessageStrip>
            <MessageStrip type="error" dismissible={false}>
                Error Message Strip
            </MessageStrip>
            <MessageStrip dismissible={false}>This is a message.</MessageStrip>
            <MessageStrip>A dismissible normal message strip.</MessageStrip>
            <MessageStrip type="warning" noIcon>
                A dismissible warning message strip without icon.
            </MessageStrip>
            <MessageStrip type="information">
                A long message wraps onto several lines. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </MessageStrip>
        </div>
    )
};

export const WithoutIcons: Story = {
    name: 'Without icons',
    render: () => (
        <div className={col}>
            <MessageStrip type="warning" noIcon>
                Warning Message Strip
            </MessageStrip>
            <MessageStrip type="success" dismissible={false} noIcon>
                Success Message Strip
            </MessageStrip>
            <MessageStrip type="information" noIcon>
                Information Message Strip
            </MessageStrip>
            <MessageStrip type="error" dismissible={false} noIcon>
                Error Message Strip
            </MessageStrip>
        </div>
    )
};

export const Widths: Story = {
    render: () => (
        <div className={col}>
            <MessageStrip type="warning" noIcon minWidth="200px">
                Minimum width 200px.
            </MessageStrip>
            <MessageStrip type="success" dismissible={false} width="70%">
                70% wide.
            </MessageStrip>
            <MessageStrip type="information" width="50%">
                50% wide.
            </MessageStrip>
            <MessageStrip type="error" dismissible={false} width="200px">
                200px wide, so the text wraps.
            </MessageStrip>
        </div>
    )
};

/**
 * Colour names and icons of fundamental-styles' "Custom Message Strip" story; its `cursor` is not an SAP-icons glyph
 * of `Icon` (it is in SAP-icons-TNT), so 8 uses `cursor-arrow`.
 */
const COLORS: Record<string, [string, string]> = {
    '1': ['Dark Red', 'master-task-triangle-2'],
    '2': ['Red', 'cloud'],
    '3': ['Yellow', 'heart-2'],
    '4': ['Green', 'circle-task'],
    '5': ['Blue', 'feedback'],
    '6': ['Teal', 'text-color'],
    '7': ['Purple', 'away'],
    '8': ['Pink', 'cursor-arrow'],
    '9': ['Black/White', 'copy'],
    '10': ['Grey', 'reset']
};

/** The colours with a link in fundamental-styles' story. */
const WITH_LINK = new Set(['1', '1b', '2', '2b', '3']);

export const IndicationColors: Story = {
    name: 'Indication colors and custom icon',
    render: () => (
        <div className={col}>
            <MessageStrip dismissible={false} icon={<Icon glyph="master-task-triangle-2" />}>
                Message with a custom icon
            </MessageStrip>
            <MessageStrip type="error" icon={<Icon glyph="not-editable" />}>
                Error Message Strip
            </MessageStrip>
            {MESSAGE_STRIP_INDICATION_COLORS.map((color: MessageStripIndicationColor) => {
                const [name, glyph] = COLORS[color.replace('b', '')]!;
                return (
                    <MessageStrip key={color} indicationColor={color} icon={<Icon glyph={glyph} />}>
                        Message Strip with indication color {color} ({name})
                        {WITH_LINK.has(color) && (
                            <>
                                {' '}
                                <Link href="#" subtle>
                                    Link
                                </Link>
                            </>
                        )}
                    </MessageStrip>
                );
            })}
        </div>
    )
};

export const CustomContentAndLinks: Story = {
    name: 'Custom content and links',
    render: () => (
        <div className={col}>
            <MessageStrip type="information" noIcon dismissible={false}>
                Information Message Strip{' '}
                <Link href="#" emphasized>
                    Link
                </Link>
            </MessageStrip>
            <MessageStrip type="error" dismissBtnTitle="Dismiss alert">
                <b>Error</b>
                <br />
                There was some error. There was some error. There was some error. There was some error.
                <Link href="https://experience.sap.com">Learn more</Link>
            </MessageStrip>
            <MessageStrip type="warning" dismissBtnTitle="Dismiss alert">
                <b>Issue</b>
                <br />
                There is some problem. <br /> There is some problem. There is some problem. There is some problem.
                <Link href="https://experience.sap.com">Learn more</Link>
            </MessageStrip>
            <MessageStrip type="success" dismissBtnTitle="Dismiss alert">
                <b>Done</b>
                <br />
                Task completed successfully. <br /> Task completed successfully. <br /> Task completed successfully.
                Task completed successfully.
                <Link href="https://experience.sap.com">Learn more</Link>
            </MessageStrip>
            <MessageStrip type="information" dismissBtnTitle="Dismiss alert">
                <b>Info</b>
                <br />
                For your information. For your information. For your information. For your information.
                <Link href="https://experience.sap.com">Learn more</Link>
            </MessageStrip>
        </div>
    )
};

function AutoDismissDemo() {
    const [open, setOpen] = useState(false);
    return (
        <div className={col}>
            <MessageStrip
                type="information"
                autoDismiss
                mousePersist
                duration={5000}
                open={open}
                onOpenChange={setOpen}
            >
                Dismissed after 5 seconds, unless the pointer is over it; then 5 seconds after it leaves.
            </MessageStrip>
            <Button className="self-start" label="Open message strip" onClick={() => setOpen(true)} />
        </div>
    );
}

export const AutoDismiss: Story = {
    name: 'Auto dismiss',
    render: () => <AutoDismissDemo />
};

/** Content of a component alert: it reads its alert to close it. */
function AlertContent() {
    const ref = useMessageStripAlertRef();
    return (
        <>
            Created from a component.{' '}
            <Button variant="transparent" data-density="compact" label="Close" onClick={() => ref?.dismiss()} />
        </>
    );
}

const ALERT_TYPES = ['information', 'success', 'warning', 'error'] as const;

function AlertsDemo() {
    const alerts = useMessageStripAlerts();
    const count = useRef(0);
    const strip = () => ({ type: ALERT_TYPES[count.current++ % 4], duration: 8000, mousePersist: true });
    const openText = (position: MessageStripAlertPosition) =>
        alerts.open({ position, content: `Text alert #${count.current + 1}`, messageStrip: strip() });
    const openTemplate = (position: MessageStripAlertPosition) =>
        alerts.open({
            position,
            content: (ref) => (
                <>
                    Rendered from a function with its own close button.{' '}
                    <Button variant="transparent" data-density="compact" label="Close" onClick={() => ref.dismiss()} />
                </>
            ),
            messageStrip: { ...strip(), duration: 0 }
        });
    const openComponent = (position: MessageStripAlertPosition) =>
        alerts.open({
            position,
            content: <AlertContent />,
            messageStrip: { ...strip(), dismissible: false, duration: 0 }
        });
    return (
        <div className={col}>
            <div className="flex flex-wrap gap-2">
                <Button label="Text top-start" onClick={() => openText('top-start')} />
                <Button label="Function top-middle" onClick={() => openTemplate('top-middle')} />
                <Button label="Component top-end" onClick={() => openComponent('top-end')} />
            </div>
            <div className="flex flex-wrap gap-2">
                <Button label="Text bottom-start" onClick={() => openText('bottom-start')} />
                <Button label="Function bottom-middle" onClick={() => openTemplate('bottom-middle')} />
                <Button label="Component bottom-end" onClick={() => openComponent('bottom-end')} />
            </div>
            <Button
                variant="transparent"
                className="self-start"
                label={`Dismiss all (${alerts.openAlerts.length})`}
                onClick={() => alerts.dismissAll()}
            />
        </div>
    );
}

export const Alerts: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Alerts in the six positions, with text, a function of the alert ref, and a component that ' +
                    'reads its alert with `useMessageStripAlertRef()`. Text alerts dismiss themselves after 8 ' +
                    'seconds, unless the pointer is over them.'
            }
        }
    },
    render: () => (
        <MessageStripAlertProvider>
            <AlertsDemo />
        </MessageStripAlertProvider>
    )
};

export const OpenAlerts: Story = {
    name: 'Open: alerts',
    tags: ['!autodocs'],
    render: Alerts.render,
    play: async ({ canvasElement }) => {
        // one alert per position: text, function and component alerts at the top and the bottom
        const buttons = [...canvasElement.querySelectorAll<HTMLElement>('button')].slice(0, 6);
        for (const button of buttons) await userEvent.click(button);
        await waitFor(() => expect(document.querySelectorAll('[role=alert]')).toHaveLength(6));
    }
};
