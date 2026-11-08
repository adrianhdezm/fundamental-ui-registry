import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ButtonBar } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogCloseButton,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle,
    DialogTrigger
} from '@/ui/dialog/dialog';
import { NO_MAIL, UNABLE_TO_LOAD } from '../../../docs/assets/illustrations';
import {
    IllustratedMessage,
    IllustratedMessageActions,
    IllustratedMessageFigcaption,
    IllustratedMessageText,
    IllustratedMessageTitle,
    type IllustratedMessageProps,
    type IllustratedMessageType,
    type SvgConfig
} from './illustrated-message';

const meta = {
    title: 'Components/Illustrated Message',
    component: IllustratedMessage,
    subcomponents: {
        IllustratedMessageFigcaption,
        IllustratedMessageTitle,
        IllustratedMessageText,
        IllustratedMessageActions
    },
    argTypes: {
        type: {
            control: 'select',
            options: [undefined, 'scene', 'dialog', 'spot', 'dot', 'base', 'large', 'medium', 'small', 'xsmall']
        },
        svgAriaLabel: { control: 'text' },
        noSvg: { control: 'boolean' },
        svgConfig: { control: false }
    },
    parameters: {
        docs: {
            description: {
                component:
                    'An illustrated message pairs an SAP illustration with a title, a text and actions, for empty states, errors and onboarding. ' +
                    'Sizes: scene (large), dialog (medium), spot (small), dot (extra small) and base (text only); without a `type` it follows the available width. ' +
                    'Illustrations come from a sprite URL or inline SVG per size (the stories use SAP illustrations from @ui5/webcomponents-fiori).'
            }
        }
    }
} satisfies Meta<typeof IllustratedMessage>;
export default meta;
type Story = StoryObj<typeof meta>;

const TEXT = 'font-sap-font-family text-sap-font-size text-sap-text-color';

/** The message of the Angular stories: "No mail" with two actions. */
function Message({
    title = 'No mail',
    svgConfig = NO_MAIL,
    ...props
}: Omit<IllustratedMessageProps, 'title'> & { title?: string }) {
    return (
        <IllustratedMessage svgConfig={svgConfig} {...props}>
            <IllustratedMessageFigcaption>
                <IllustratedMessageTitle>{title}</IllustratedMessageTitle>
                <IllustratedMessageText>
                    Your inbox is empty. New messages appear here; check again later or refresh.
                </IllustratedMessageText>
            </IllustratedMessageFigcaption>
            <IllustratedMessageActions>
                <Button variant="emphasized" label="Refresh" />
                <Button label="Settings" />
            </IllustratedMessageActions>
        </IllustratedMessage>
    );
}

export const Playground: Story = {
    args: { type: 'dialog', svgAriaLabel: 'Empty mailbox', noSvg: false },
    render: (args) => <Message {...args} />
};

export const Scene: Story = {
    name: 'Scene',
    render: () => <Message type="scene" svgAriaLabel="Empty mailbox" />
};

export const DialogSize: Story = {
    name: 'Dialog',
    render: () => <Message type="dialog" svgConfig={UNABLE_TO_LOAD} title="Unable to load data" />
};

export const Spot: Story = {
    name: 'Spot',
    render: () => <Message type="spot" />
};

export const Dot: Story = {
    name: 'Dot',
    render: () => (
        <div className="flex max-w-sm items-start gap-4">
            <Message type="dot" />
        </div>
    )
};

export const Responsive: Story = {
    name: 'Responsive (resize the box)',
    parameters: {
        docs: {
            description: {
                story: 'Without a `type` the size follows the width: large from 682px, medium from 361px, small from 261px, extra small from 161px, text only below.'
            }
        }
    },
    render: () => (
        <div
            className="resize-x overflow-hidden border border-dashed border-sap-group-content-border-color"
            style={{ width: '30rem' }}
        >
            <Message svgAriaLabel="Empty mailbox" />
        </div>
    )
};

export const TextOnly: Story = {
    name: 'Without illustration',
    render: () => <Message type="dialog" noSvg />
};

/** fundamental-styles' examples, with their texts (its own demo illustrations are not SAP ones: ours differ). */
const SIZES: {
    type: IllustratedMessageType;
    title: string;
    text: string;
    action: string;
    config: SvgConfig;
    label: string;
}[] = [
    {
        type: 'large',
        title: 'Delivery Delay',
        text: 'A broken cooling system resulted in melted ice cream in transit. Another delivery is already on the way.',
        action: 'Check Delivery Schedule',
        config: NO_MAIL,
        label: 'Empty mailbox'
    },
    {
        type: 'medium',
        title: 'Unknown File Format',
        text: "We found some files that have an unknown file format. Let's take a look and fix the issue.",
        action: 'Add File Format',
        config: UNABLE_TO_LOAD,
        label: 'Unable to load data'
    },
    {
        type: 'small',
        title: 'All Caught Up',
        text: "You've read all of the messages in your inbox! Check back later.",
        action: 'Add File Format',
        config: NO_MAIL,
        label: 'Empty mailbox'
    },
    {
        type: 'xsmall',
        title: 'Delivery Delay',
        text: 'A broken cooling system resulted in melted ice cream in transit. Another delivery is already on the way.',
        action: 'Contact Us',
        config: NO_MAIL,
        label: 'Empty mailbox'
    },
    {
        type: 'base',
        title: 'Delivery Delay',
        text: 'A broken cooling system resulted in melted ice cream in transit. Another delivery is already on the way.',
        action: 'Contact Us',
        config: NO_MAIL,
        label: 'Empty mailbox'
    }
];

export const Sizes: Story = {
    name: 'Sizes (fundamental-styles examples)',
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' Large, Medium, Small, Extra Small and Base examples with their texts: `large`, `medium`, `small`, `xsmall` and `base` are the same sizes as scene, dialog, spot, dot and text only."
            }
        }
    },
    render: () => (
        <div className="flex flex-col items-center gap-8">
            {SIZES.map(({ type, title, text, action, config, label }) => (
                <IllustratedMessage key={type} type={type} svgConfig={config} svgAriaLabel={label}>
                    <IllustratedMessageFigcaption>
                        <IllustratedMessageTitle render={<h2 />}>{title}</IllustratedMessageTitle>
                        <IllustratedMessageText>{text}</IllustratedMessageText>
                    </IllustratedMessageFigcaption>
                    <IllustratedMessageActions>
                        <Button label={action} />
                    </IllustratedMessageActions>
                </IllustratedMessage>
            ))}
        </div>
    )
};

/** Upstream's medium example: the message in a dialog opened by a button. */
function InDialogExample() {
    const [result, setResult] = useState('');
    return (
        <>
            <Dialog onOpenChange={(open) => open && setResult('')}>
                <DialogTrigger render={<Button label="Open dialog illustrated message" />} />
                <DialogPopup width="30rem" aria-describedby="story-im-dialog-description">
                    <DialogHeader>
                        <DialogTitle level={1}>Unknown File Format Detected</DialogTitle>
                        <DialogCloseButton title="Close" onClick={() => setResult('Dialog dismissed: Close button')} />
                    </DialogHeader>
                    <DialogBody>
                        <IllustratedMessage type="medium" svgConfig={UNABLE_TO_LOAD}>
                            <IllustratedMessageFigcaption id="story-im-dialog-description">
                                <IllustratedMessageTitle render={<h2 />}>Unknown File Format</IllustratedMessageTitle>
                                <IllustratedMessageText>
                                    We found some files that have an unknown file format. Let&apos;s take a look and fix
                                    the issue.
                                </IllustratedMessageText>
                            </IllustratedMessageFigcaption>
                        </IllustratedMessage>
                    </DialogBody>
                    <DialogFooter>
                        <DialogClose
                            render={<ButtonBar variant="emphasized" label="Add File Format" />}
                            onClick={() => setResult('Dialog closed: Add')}
                        />
                        <DialogClose
                            render={<ButtonBar label="Close" />}
                            onClick={() => setResult('Dialog dismissed: Close button')}
                        />
                    </DialogFooter>
                </DialogPopup>
            </Dialog>
            <p className={TEXT} aria-live="polite">
                {result}
            </p>
        </>
    );
}

export const InDialog: Story = {
    name: 'In a dialog',
    render: () => <InDialogExample />
};

export const OpenInDialog: Story = {
    name: 'Open: in a dialog',
    tags: ['!autodocs'],
    render: () => <InDialogExample />,
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open dialog illustrated message' }));
        await waitFor(() =>
            expect(document.querySelector('[role=dialog][data-open] figure[data-size]')).not.toBeNull()
        );
        const animated = [...document.querySelectorAll<HTMLElement>('[role=dialog], [data-dialog-backdrop]')];
        await Promise.all(animated.flatMap((el) => el.getAnimations().map((a) => a.finished)));
    }
};
