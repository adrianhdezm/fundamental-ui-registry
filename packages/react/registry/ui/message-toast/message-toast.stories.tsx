import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import {
    MessageToastProvider,
    useMessageToastRef,
    useMessageToastService,
    type MessageToastPlacement,
    type MessageToastPosition
} from './message-toast';

const TEXT = 'm-0 w-full font-sap-font-family text-sap-font-size text-sap-text-color';

const PLACEMENTS: MessageToastPlacement[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right'
];

/** Angular's toast component: reads its data from the ref. */
function StoryToastContent() {
    const ref = useMessageToastRef<{ content: string }>();
    return <div>{ref.data.content}</div>;
}

/** The Angular demo, in a provider of its own. */
function MessageToastDemo({ keepOpen = false }: { keepOpen?: boolean }) {
    return (
        <MessageToastProvider>
            <MessageToastButtons keepOpen={keepOpen} />
        </MessageToastProvider>
    );
}

/** The Angular demo: toasts from a string, a component and a template, and at every position. */
function MessageToastButtons({ keepOpen = false }: { keepOpen?: boolean }) {
    const toasts = useMessageToastService();
    const bound = useRef<HTMLButtonElement | null>(null);
    // the Open stories keep the toasts open (duration 0), so the a11y run checks them
    const duration = (ms: number) => (keepOpen ? 0 : ms);
    const at = (
        position: MessageToastPosition,
        label = typeof position === 'string' ? position : 'a custom position'
    ) => toasts.open(`Message toast at ${label}.`, { position, duration: duration(3000) });
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
                <Button
                    label="Open from string"
                    onClick={() =>
                        toasts.open('Message toast created from a string. It disappears after 5000 ms.', {
                            duration: duration(5000)
                        })
                    }
                />
                <Button
                    label="Open from component"
                    onClick={() =>
                        toasts.open(<StoryToastContent />, {
                            duration: duration(7500),
                            maxWidth: '25rem',
                            data: {
                                content:
                                    'Message toast created from a component. It stays open while the pointer is over it, has a custom width and disappears after 7500 ms.'
                            }
                        })
                    }
                />
                <Button
                    label="Open from template"
                    onClick={() =>
                        toasts.open<{ content: string }>((toast) => toast.data.content, {
                            data: { content: 'Message toast created from a template.' },
                            duration: duration(3000)
                        })
                    }
                />
                <Button
                    label="Open animated toast"
                    onClick={() =>
                        toasts.open('An animated message toast.', { animated: true, duration: duration(5000) })
                    }
                />
                <Button variant="emphasized" label="Hide all" onClick={() => toasts.hideAll()} />
            </div>
            <p className={TEXT}>Positions:</p>
            <div className="flex flex-wrap gap-2">
                {PLACEMENTS.map((p) => (
                    <Button key={p} label={p} onClick={() => at(p)} />
                ))}
                <Button label="Custom position" onClick={() => at({ top: '6rem', left: '40%' })} />
                <Button
                    ref={bound}
                    label="Bound to this button"
                    onClick={() =>
                        at({ boundTo: bound.current!, side: 'top', align: 'center', sideOffset: 16 }, 'the button')
                    }
                />
            </div>
        </div>
    );
}

/** fundamental-styles' Default toast story: a short and a long message. */
function TextsButton() {
    const toasts = useMessageToastService();
    return (
        <Button
            label="Show messages"
            onClick={() => {
                toasts.open('Product added', { duration: 0 });
                toasts.open(
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                    { duration: 0 }
                );
            }}
        />
    );
}

/** The toasts of this demo are rendered in the story root (fixed on the screen all the same). */
function TextsDemo() {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    return (
        <div ref={setContainer}>
            {container && (
                <MessageToastProvider container={container}>
                    <TextsButton />
                </MessageToastProvider>
            )}
        </div>
    );
}

const meta = {
    title: 'Components/Message Toast',
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 360 },
            description: {
                component:
                    'A message toast shows a short message about an action and disappears by itself (3 s by default; it stays while hovered or focused). ' +
                    'Open it with `useMessageToastService()` (below a `MessageToastProvider`) from a string, an element or a render function, ' +
                    'at a corner or edge of the screen, a custom place or next to an element. Toasts at the same place stack; F6 moves the focus to them.\n\n' +
                    '```tsx\n' +
                    '<MessageToastProvider>\n' +
                    '    <App />\n' +
                    '</MessageToastProvider>\n\n' +
                    "useMessageToastService().open('Order saved', { duration: 5000 });\n" +
                    '```'
            }
        }
    }
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Message toast', render: () => <MessageToastDemo /> };

/** Clicks the buttons with these labels and waits until that many toasts are open. */
async function openToasts(canvasElement: HTMLElement, labels: string[], count = labels.length): Promise<void> {
    const buttons = [...canvasElement.querySelectorAll<HTMLElement>('button')];
    for (const label of labels) await userEvent.click(buttons.find((b) => b.textContent!.trim() === label)!);
    await waitFor(() => expect(document.querySelectorAll('[data-message-toast]')).toHaveLength(count));
}

export const OpenMessageToast: Story = {
    name: 'Open: message toast',
    tags: ['!autodocs'],
    render: () => <MessageToastDemo keepOpen />,
    play: ({ canvasElement }) =>
        openToasts(canvasElement, ['Open from string', 'Open from component', 'Open from template'])
};

export const OpenPositions: Story = {
    name: 'Open: positions',
    tags: ['!autodocs'],
    render: () => <MessageToastDemo keepOpen />,
    play: ({ canvasElement }) => openToasts(canvasElement, [...PLACEMENTS, 'Custom position', 'Bound to this button'])
};

export const OpenTexts: Story = {
    name: 'Open: short and long message',
    tags: ['!autodocs'],
    parameters: {
        docs: { description: { story: "fundamental-styles' Default toast story: a short and a long message." } }
    },
    render: () => <TextsDemo />,
    play: ({ canvasElement }) => openToasts(canvasElement, ['Show messages'], 2)
};
