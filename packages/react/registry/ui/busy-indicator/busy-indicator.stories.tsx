import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { MessageToastProvider, useMessageToastService } from '@/ui/message-toast/message-toast';
import { BusyIndicator, BusyIndicatorExtended } from './busy-indicator';

// a plain field until the input component is ported
const FIELD =
    'h-sap-element-height rounded-sap-field-border-corner-radius border border-sap-field-border-color bg-sap-field-background px-2 text-sap-field-text-color';

const meta = {
    title: 'Components/Busy Indicator',
    component: BusyIndicator,
    parameters: {
        docs: {
            description: {
                component:
                    'The busy indicator shows that an action or a part of the page is loading. It is a progressbar ' +
                    'with an accessible name; wrapped content is covered and taken out of keyboard reach while loading.'
            }
        }
    },
    argTypes: { size: { control: 'inline-radio', options: ['s', 'm', 'l'] } },
    args: { loading: true, size: 'm', 'aria-label': 'Loading', label: '', block: false, contrast: false }
} satisfies Meta<typeof BusyIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Basic: Story = {
    render: () => (
        <div className="text-center">
            <BusyIndicator loading aria-label="Loading" title="Please wait" />
        </div>
    )
};

export const Sizes: Story = {
    render: () => (
        <div className="flex flex-col gap-6">
            {(['s', 'm', 'l'] as const).map((size) => (
                <div key={size} className="text-center">
                    <BusyIndicator loading size={size} aria-label={`${size} size loading`} aria-valuetext="Busy" />
                </div>
            ))}
        </div>
    )
};

export const Contrast: Story = {
    render: () => (
        <div className="rounded-sap-element-border-corner-radius bg-sap-shell-interactive-text-color p-6 text-center">
            <BusyIndicator loading contrast size="l" aria-label="Loading" />
        </div>
    )
};

function WrapperDemo() {
    const [loading, setLoading] = useState(true);
    return (
        <>
            <h5
                id="busy-label-1"
                className="mb-2 font-sap-font-header-family text-sap-font-header5-size text-sap-title-color"
            >
                Busy Indicator as a block wrapper
            </h5>
            <BusyIndicator loading={loading} block aria-labelledby="busy-label-1" aria-valuetext="Busy">
                <form className="flex max-w-sm flex-col gap-2 p-2">
                    <label htmlFor="bi-name" className="text-sap-content-label-color">
                        Name:
                    </label>
                    <input className={FIELD} id="bi-name" />
                    <label htmlFor="bi-surname" className="text-sap-content-label-color">
                        Surname:
                    </label>
                    <input className={FIELD} id="bi-surname" />
                    <label htmlFor="bi-password" className="text-sap-content-label-color">
                        Password:
                    </label>
                    <input className={FIELD} id="bi-password" type="password" />
                </form>
            </BusyIndicator>

            <h5
                id="busy-label-2"
                className="mb-2 mt-6 font-sap-font-header-family text-sap-font-header5-size text-sap-title-color"
            >
                Busy Indicator as an inline wrapper
            </h5>
            <BusyIndicator loading={loading} size="s" aria-labelledby="busy-label-2" aria-valuetext="Busy">
                <Button label="Save" />
            </BusyIndicator>

            <div className="mt-6">
                <Button label={loading ? 'Disable loading' : 'Enable loading'} onClick={() => setLoading(!loading)} />
            </div>
        </>
    );
}

export const Wrapper: Story = {
    name: 'As a wrapper',
    parameters: {
        docs: {
            description: {
                story: 'While loading, the wrapped content is covered and Tab skips over it. Toggle loading to interact with the form.'
            }
        }
    },
    render: () => <WrapperDemo />
};

export const Extended: Story = {
    name: 'With label (extended)',
    render: () => (
        <BusyIndicatorExtended className="w-[23.125rem] rounded-sap-element-border-corner-radius bg-sap-page-footer-background shadow-sap-content-shadow2">
            <BusyIndicator loading aria-label="Loading" label="Loading data..." aria-valuetext="Busy" />
        </BusyIndicatorExtended>
    )
};

/** Opens an extended busy indicator in a message toast that stays until "Hide all". */
function ToastButtons() {
    const toasts = useMessageToastService();
    return (
        <div className="flex flex-wrap gap-2">
            <Button
                label="Open from template"
                onClick={() =>
                    toasts.open(
                        () => (
                            <BusyIndicatorExtended>
                                <BusyIndicator
                                    loading
                                    contrast
                                    aria-label="Loading"
                                    title="Please wait"
                                    aria-valuetext="Busy"
                                />
                            </BusyIndicatorExtended>
                        ),
                        { mousePersist: true, duration: 0 }
                    )
                }
            />
            <Button variant="emphasized" label="Hide all" onClick={() => toasts.hideAll()} />
        </div>
    );
}

export const WithMessageToast: Story = {
    name: 'With message toast',
    parameters: {
        docs: {
            description: {
                story: 'An extended busy indicator in a message toast opened from a template. The toast stays open until "Hide all".'
            }
        }
    },
    render: () => (
        <MessageToastProvider>
            <ToastButtons />
        </MessageToastProvider>
    )
};

export const OpenMessageToast: Story = {
    name: 'Open: message toast',
    tags: ['!autodocs'],
    render: WithMessageToast.render,
    play: async ({ canvasElement }) => {
        await userEvent.click(canvasElement.querySelector<HTMLElement>('button')!);
        await waitFor(() => expect(document.querySelector('[data-message-toast] [role=progressbar]')).not.toBeNull());
    }
};
