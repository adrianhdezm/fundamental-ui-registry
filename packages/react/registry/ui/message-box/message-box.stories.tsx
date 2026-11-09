import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { BarElement, BarLeft, BarRight, ButtonBar } from '@/ui/bar/bar';
import { Button, type ButtonVariant } from '@/ui/button/button';
import {
    Dialog,
    DialogClose,
    DialogProvider,
    DialogTrigger,
    type DialogPaddingSize,
    type DialogProps
} from '@/ui/dialog/dialog';
import { Link } from '@/ui/link/link';
import {
    MessageBox,
    MessageBoxBody,
    MessageBoxFooter,
    MessageBoxHeader,
    MessageBoxSemanticIcon,
    MessageBoxTitle,
    useMessageBoxRef,
    useMessageBoxService,
    type MessageBoxConfig,
    type MessageBoxProps,
    type MessageBoxRef,
    type MessageBoxType
} from './message-box';

const meta = {
    title: 'Components/Message Box',
    component: MessageBox,
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 420 },
            description: {
                component:
                    'A message box is a modal alert dialog for messages that need a decision: errors, warnings, ' +
                    'successes, information and confirmations. It is the window of a `Dialog` (`role="alertdialog"`): ' +
                    'it traps the focus, closes on Escape and gives the focus back. `type` colours the header line ' +
                    'and, with `showSemanticIcon`, adds the type icon before the title.\n\n' +
                    '```tsx\n' +
                    '<Dialog>\n' +
                    '    <DialogTrigger render={<Button label="Delete" />} />\n' +
                    '    <MessageBox type="confirmation" showSemanticIcon>\n' +
                    '        <MessageBoxHeader>\n' +
                    '            <MessageBoxTitle>Delete order?</MessageBoxTitle>\n' +
                    '        </MessageBoxHeader>\n' +
                    '        <MessageBoxBody>The order will be deleted permanently.</MessageBoxBody>\n' +
                    '        <MessageBoxFooter>\n' +
                    '            <DialogClose render={<ButtonBar variant="emphasized" label="Delete" />} />\n' +
                    '            <DialogClose render={<ButtonBar label="Cancel" />} />\n' +
                    '        </MessageBoxFooter>\n' +
                    '    </MessageBox>\n' +
                    '</Dialog>\n' +
                    '```\n\n' +
                    'From code, `useMessageBoxService()` (below a `DialogProvider`) opens a render function, an ' +
                    'element or a `MessageBoxContent` object and returns its `MessageBoxRef`.'
            }
        }
    },
    args: { type: 'confirmation', showSemanticIcon: true }
} satisfies Meta<typeof MessageBox>;
export default meta;
type Story = StoryObj<typeof meta>;

const row = 'flex flex-wrap items-center gap-2';
const TYPES: MessageBoxType[] = ['confirmation', 'error', 'success', 'warning', 'information'];
const capitalize = (text: string) => text[0]!.toUpperCase() + text.slice(1);
const PINEAPPLES = 'Pineapples are tropical fruits. Do you want to read more about them?';

/** The live region that reports how a message box ended. */
function Status({ children }: { children: ReactNode }) {
    return (
        <p className="m-0 w-full font-sap-font-family text-sap-font-size text-sap-text-color" aria-live="polite">
            {children}
        </p>
    );
}

/** Reports the result of a message box opened by the service. */
function report(ref: MessageBoxRef<any, any>, set: (text: string) => void): void {
    void ref.afterClosed.then((result) =>
        set(
            result.status === 'closed'
                ? `Message box closed with result: ${result.value}`
                : `Message box dismissed with result: ${result.reason}`
        )
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * fundamental-react stories
 * ---------------------------------------------------------------------------------------------------------------- */

interface SimpleProps extends Omit<MessageBoxProps, 'title'> {
    label: string;
    title: string;
    trigger?: ButtonVariant;
    actions?: { label: string; variant?: ButtonVariant }[];
    dialog?: DialogProps;
}

/** fundamental-react's message box: a title, a text and actions that close it. */
function SimpleMessageBox({
    label,
    title,
    trigger,
    actions = [{ label: 'OK', variant: 'emphasized' }],
    dialog,
    children,
    ...box
}: SimpleProps) {
    return (
        <Dialog {...dialog}>
            <DialogTrigger render={<Button label={label} variant={trigger} />} />
            <MessageBox {...box}>
                <MessageBoxHeader>
                    <MessageBoxTitle>{title}</MessageBoxTitle>
                </MessageBoxHeader>
                <MessageBoxBody>{children}</MessageBoxBody>
                <MessageBoxFooter>
                    {actions.map((action) => (
                        <DialogClose
                            key={action.label}
                            render={<ButtonBar variant={action.variant} label={action.label} />}
                        />
                    ))}
                </MessageBoxFooter>
            </MessageBox>
        </Dialog>
    );
}

type PlaygroundArgs = MessageBoxProps & Pick<DialogProps, 'escKeyCloseable' | 'backdropClickCloseable'>;

function PlaygroundExample({ escKeyCloseable, backdropClickCloseable, ...box }: PlaygroundArgs) {
    const [status, setStatus] = useState('');
    return (
        <div className={row}>
            <Dialog
                escKeyCloseable={escKeyCloseable}
                backdropClickCloseable={backdropClickCloseable}
                onOpenChange={(open, details) => !open && setStatus(`Message box closed: ${details.reason}`)}
            >
                <DialogTrigger render={<Button label="Open message box" />} />
                <MessageBox {...box}>
                    <MessageBoxHeader>
                        <MessageBoxTitle>Playground</MessageBoxTitle>
                    </MessageBoxHeader>
                    <MessageBoxBody>This is the message box playground body text.</MessageBoxBody>
                    <MessageBoxFooter>
                        <DialogClose render={<ButtonBar variant="emphasized" label="OK" />} />
                        <DialogClose render={<ButtonBar label="Cancel" />} />
                    </MessageBoxFooter>
                </MessageBox>
            </Dialog>
            <Status>{status}</Status>
        </div>
    );
}

export const Playground: StoryObj<PlaygroundArgs> = {
    args: {
        type: 'confirmation',
        showSemanticIcon: true,
        customSemanticIcon: '',
        width: '24rem',
        mobile: false,
        escKeyCloseable: true,
        backdropClickCloseable: false
    },
    argTypes: {
        type: { control: 'select', options: TYPES },
        customSemanticIcon: { control: 'text' },
        width: { control: 'text' }
    },
    render: ({ customSemanticIcon, width, ...args }) => (
        <PlaygroundExample {...args} customSemanticIcon={customSemanticIcon || null} width={width || undefined} />
    )
};

export const Default: Story = {
    name: 'Default',
    parameters: {
        docs: {
            description: {
                story: 'A trigger opens the message box; its action is a `DialogClose` button, so it closes it (fundamental-react `primary`).'
            }
        }
    },
    render: () => (
        <SimpleMessageBox label="Show Message Box" title="Message Box">
            <p className="m-0">This is a message box.</p>
        </SimpleMessageBox>
    )
};

const TYPE_EXAMPLES: Record<MessageBoxType, { text: string; trigger?: ButtonVariant }> = {
    confirmation: { text: 'Are you sure?' },
    error: { text: 'This is an error message!', trigger: 'negative' },
    success: { text: 'This is a success message.', trigger: 'positive' },
    warning: { text: 'This is a warning!', trigger: 'attention' },
    information: { text: 'This is some information.' }
};

export const Types: Story = {
    name: 'Semantic types',
    parameters: {
        docs: {
            description: {
                story:
                    '`type` colours the header line; `showSemanticIcon` adds the icon of the type before the title ' +
                    '(fundamental-react `types`, Angular "Semantic types").'
            }
        }
    },
    render: () => (
        <div className={row}>
            {TYPES.map((type) => (
                <SimpleMessageBox
                    key={type}
                    label={capitalize(type)}
                    title={capitalize(type)}
                    trigger={TYPE_EXAMPLES[type].trigger}
                    type={type}
                    showSemanticIcon
                    width="22rem"
                    actions={
                        type === 'confirmation'
                            ? [{ label: 'Yes', variant: 'emphasized' }, { label: 'No' }]
                            : [{ label: 'OK', variant: 'emphasized' }]
                    }
                >
                    <p className="m-0">{TYPE_EXAMPLES[type].text}</p>
                </SimpleMessageBox>
            ))}
        </div>
    )
};

const SIZES: { size: DialogPaddingSize; label: string; title: string }[] = [
    { size: 's', label: 'Small', title: 'Small Message Box' },
    { size: 'm', label: 'Medium', title: 'Medium Message Box' },
    { size: 'l', label: 'Large', title: 'Large Message Box' },
    { size: 'xl', label: 'Extra Large', title: 'Extra Large Message Box' }
];

export const Sizes: Story = {
    name: 'Sizes (horizontal padding)',
    parameters: {
        docs: {
            description: {
                story:
                    "`size` sets the horizontal padding of the header, body and footer (fundamental-react's `size`): " +
                    's 1rem, m and l 2rem, xl 3rem. `responsivePadding` picks it from the window width.'
            }
        }
    },
    render: () => (
        <div className={row}>
            {SIZES.map(({ size, label, title }) => (
                <SimpleMessageBox key={size} label={label} title={title} size={size}>
                    <p className="m-0">This is a message box.</p>
                </SimpleMessageBox>
            ))}
        </div>
    )
};

/* ------------------------------------------------------------------------------------------------------------------
 * Angular stories: the service
 * ---------------------------------------------------------------------------------------------------------------- */

/** Opens the Angular template message box from code: a render function that gets the `MessageBoxRef`. */
function TemplateExample({ actions }: { actions: { label: string; config: MessageBoxConfig<{ title: string }> }[] }) {
    const messageBoxes = useMessageBoxService();
    const [status, setStatus] = useState('');
    const open = (config: MessageBoxConfig<{ title: string }>) =>
        report(
            messageBoxes.open<{ title: string }, string>(
                (messageBox) => (
                    <MessageBox>
                        <MessageBoxHeader>
                            <MessageBoxTitle>{messageBox.data?.title}</MessageBoxTitle>
                        </MessageBoxHeader>
                        <MessageBoxBody>{PINEAPPLES}</MessageBoxBody>
                        <MessageBoxFooter>
                            <ButtonBar variant="emphasized" label="OK" onClick={() => messageBox.close('OK')} />
                            <ButtonBar label="Cancel" onClick={() => messageBox.dismiss('Cancel')} />
                        </MessageBoxFooter>
                    </MessageBox>
                ),
                config
            ),
            setStatus
        );
    return (
        <div className={row}>
            {actions.map((action) => (
                <Button key={action.label} label={action.label} onClick={() => open(action.config)} />
            ))}
            <Status>{status}</Status>
        </div>
    );
}

export const TemplateBased: Story = {
    name: 'From code: render function',
    parameters: {
        docs: {
            description: {
                story:
                    "`useMessageBoxService().open(render, config)` (Angular's template-based message box): the render " +
                    'function gets the `MessageBoxRef`; `afterClosed` resolves with the `close()` result or the ' +
                    '`dismiss()` reason.'
            }
        }
    },
    render: () => (
        <DialogProvider>
            <TemplateExample
                actions={[{ label: 'Open from template', config: { width: '24rem', data: { title: 'Pineapples' } } }]}
            />
        </DialogProvider>
    )
};

/** A message box component; it reads its ref with `useMessageBoxRef()`. */
function CheckoutMessageBox() {
    const ref = useMessageBoxRef<{ count: number }, string>();
    return (
        <MessageBox>
            <MessageBoxHeader>
                <MessageBoxSemanticIcon glyph="cart" />
                <MessageBoxTitle>Checkout</MessageBoxTitle>
            </MessageBoxHeader>
            <MessageBoxBody>
                <p className="m-0">Your cart holds {ref.data?.count} items. Continue to checkout?</p>
            </MessageBoxBody>
            <MessageBoxFooter>
                <ButtonBar variant="emphasized" label="Checkout" onClick={() => ref.close('checkout')} />
                <ButtonBar label="Cancel" onClick={() => ref.dismiss('cancel')} />
            </MessageBoxFooter>
        </MessageBox>
    );
}

/** A custom header and footer. */
function ComplexMessageBox() {
    const ref = useMessageBoxRef<unknown, string>();
    return (
        <MessageBox>
            <MessageBoxHeader>
                <BarLeft>
                    <BarElement>
                        <MessageBoxTitle>Complex message box</MessageBoxTitle>
                    </BarElement>
                </BarLeft>
                <BarRight>
                    <ButtonBar glyph="decline" aria-label="Close" onClick={() => ref.dismiss('x')} />
                </BarRight>
            </MessageBoxHeader>
            <MessageBoxBody>
                <p className="m-0">Headers and footers can hold their own bar areas.</p>
            </MessageBoxBody>
            <MessageBoxFooter>
                <BarLeft>
                    <BarElement>3 of 5 steps done</BarElement>
                </BarLeft>
                <BarRight>
                    <ButtonBar variant="emphasized" label="Continue" onClick={() => ref.close('next')} />
                </BarRight>
            </MessageBoxFooter>
        </MessageBox>
    );
}

function OthersExample() {
    const messageBoxes = useMessageBoxService();
    const [status, setStatus] = useState('');
    const object = () => {
        const ref: MessageBoxRef<unknown, string> = messageBoxes.open<unknown, string>(
            {
                title: 'Delete order',
                content: 'The order 4711 will be deleted permanently. Do you want to continue?',
                approveButton: 'Delete',
                approveButtonCallback: () => ref.close('Deleted'),
                cancelButton: 'Cancel',
                cancelButtonCallback: () => ref.dismiss('Canceled')
            },
            { type: 'confirmation', showSemanticIcon: true, width: '24rem' }
        );
        report(ref, setStatus);
    };
    return (
        <div className={row}>
            <Button
                label="Open from component"
                onClick={() =>
                    report(messageBoxes.open(<CheckoutMessageBox />, { data: { count: 3 }, width: '22rem' }), setStatus)
                }
            />
            <Button label="Open from object" onClick={object} />
            <Button
                label="Open with custom header and footer"
                onClick={() => report(messageBoxes.open(<ComplexMessageBox />, { width: '26rem' }), setStatus)}
            />
            <Status>{status}</Status>
        </div>
    );
}

export const Others: Story = {
    name: 'From code: component, object and custom layout',
    parameters: {
        docs: {
            description: {
                story:
                    'An element that reads its ref with `useMessageBoxRef()` (with its own semantic icon), a ' +
                    '`MessageBoxContent` object (title, content, approve and cancel buttons), and a custom header and ' +
                    'footer with bar areas.'
            }
        }
    },
    render: () => (
        <DialogProvider>
            <OthersExample />
        </DialogProvider>
    )
};

export const ServiceTypes: Story = {
    name: 'From code: semantic types',
    parameters: {
        docs: { description: { story: 'The types from code: `type` and `showSemanticIcon` are config options.' } }
    },
    render: () => (
        <DialogProvider>
            <TemplateExample
                actions={TYPES.map((type) => ({
                    label: `Open ${type}`,
                    config: { type, showSemanticIcon: true, width: '22rem', data: { title: capitalize(type) } }
                }))}
            />
        </DialogProvider>
    )
};

export const Position: Story = {
    name: 'Custom position',
    parameters: { docs: { description: { story: '`position` places the message box instead of centring it.' } } },
    render: () => (
        <DialogProvider>
            <TemplateExample
                actions={[
                    {
                        label: 'Open at the top',
                        config: { position: { top: '2rem' }, width: '22rem', data: { title: 'Positioned' } }
                    }
                ]}
            />
        </DialogProvider>
    )
};

export const Mobile: Story = {
    name: 'Mobile',
    parameters: { docs: { description: { story: 'A mobile message box fills the screen.' } } },
    render: () => (
        <DialogProvider>
            <TemplateExample
                actions={[
                    {
                        label: 'Open in mobile mode',
                        config: { mobile: true, type: 'warning', showSemanticIcon: true, data: { title: 'Mobile' } }
                    }
                ]}
            />
        </DialogProvider>
    )
};

/* ------------------------------------------------------------------------------------------------------------------
 * Open message boxes in the page: the visual reference cases
 * ---------------------------------------------------------------------------------------------------------------- */

/** fundamental-styles' "Semantic types" and "Responsive" texts. */
const STATIC: {
    variant: string;
    type: MessageBoxType;
    text: string;
    icon?: boolean;
    size?: DialogPaddingSize;
    more?: boolean;
}[] = [
    {
        variant: 'confirmation',
        type: 'confirmation',
        icon: true,
        text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    },
    {
        variant: 'error',
        type: 'error',
        icon: true,
        text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    {
        variant: 'success',
        type: 'success',
        icon: true,
        text: 'Vivamus sagittis diam in vehicula lobortis sapien arcu mattis erat vel aliquet sem urna et mattis erat vel aliquet in sem urna et sagittis diam in vehicula.'
    },
    {
        variant: 'warning',
        type: 'warning',
        icon: true,
        text: 'Vivamus sagittis diam in vehicula lobortis sapien arcu mattis erat vel aliquet sem urna et.'
    },
    {
        variant: 'information',
        type: 'information',
        icon: true,
        text: 'Vivamus sagittis diam in vehicula lobortis.'
    },
    {
        variant: 's',
        type: 'information',
        size: 's',
        more: true,
        text: 'Informative message box for a small screen in cozy mode (mobile) and a "Show more" link in the body.'
    },
    {
        variant: 'm',
        type: 'error',
        size: 'm',
        text: 'Error message box for a medium-sized screen in cozy mode (mobile).'
    },
    {
        variant: 'l',
        type: 'success',
        size: 'l',
        text: 'Success message box for a large screen in compact mode (desktop).'
    },
    {
        variant: 'xl',
        type: 'warning',
        size: 'xl',
        text: 'Warning message box for an extra large screen in compact mode (desktop).'
    }
];

function StaticMessageBox({ item, container }: { item: (typeof STATIC)[number]; container: HTMLElement }) {
    return (
        <Dialog defaultOpen hasBackdrop={false} focusTrapped={false}>
            <MessageBox
                data-variant={item.variant}
                container={container}
                width="39rem"
                initialFocus={false}
                finalFocus={false}
                type={item.type}
                showSemanticIcon={item.icon}
                size={item.size}
            >
                <MessageBoxHeader>
                    <MessageBoxTitle level={1}>{capitalize(item.type)}</MessageBoxTitle>
                </MessageBoxHeader>
                <MessageBoxBody>
                    {item.text}
                    {item.more && (
                        <div className="mt-4">
                            <Link href="#">Show more</Link>
                        </div>
                    )}
                </MessageBoxBody>
                <MessageBoxFooter>
                    {item.type === 'confirmation' && !item.size ? (
                        <>
                            <ButtonBar variant="emphasized" label="OK" />
                            <ButtonBar label="Cancel" />
                        </>
                    ) : (
                        <ButtonBar variant="emphasized" label="Close" />
                    )}
                </MessageBoxFooter>
            </MessageBox>
        </Dialog>
    );
}

function VariantsExample() {
    const [slots, setSlots] = useState<HTMLElement[]>([]);
    return (
        <div className="flex flex-col gap-6">
            {STATIC.map((item, index) => (
                <div
                    key={item.variant}
                    ref={(node) => {
                        if (node && slots[index] !== node)
                            setSlots((current) => {
                                const next = [...current];
                                next[index] = node;
                                return next;
                            });
                    }}
                />
            ))}
            {slots.filter(Boolean).length === STATIC.length &&
                STATIC.map((item, index) => (
                    <StaticMessageBox key={item.variant} item={item} container={slots[index]!} />
                ))}
        </div>
    );
}

export const Variants: Story = {
    name: 'Message box variants',
    parameters: {
        docs: {
            description: {
                story:
                    'Open message boxes rendered into the page (`container`, no backdrop): the semantic types and the ' +
                    'padding sizes, as in the fundamental-styles stories.'
            }
        }
    },
    render: () => <VariantsExample />
};

/* ------------------------------------------------------------------------------------------------------------------
 * Open stories: the a11y run checks the open message boxes
 * ---------------------------------------------------------------------------------------------------------------- */

/** Clicks the button with this label and waits until the message box has faded in. */
async function openMessageBox(canvasElement: HTMLElement, text: string): Promise<void> {
    // semantic buttons add a hidden description ("Negative Action", ...) after their label
    const button = [...canvasElement.querySelectorAll<HTMLElement>('button')].find((b) =>
        b.textContent!.trim().startsWith(text)
    )!;
    await userEvent.click(button);
    await waitFor(() => expect(document.querySelectorAll('[role=alertdialog][data-open]')).toHaveLength(1));
    const animated = [...document.querySelectorAll<HTMLElement>('[role=alertdialog], [data-dialog-backdrop]')];
    await Promise.all(animated.flatMap((el) => el.getAnimations().map((a) => a.finished)));
}

export const OpenDefault: Story = {
    name: 'Open: default',
    tags: ['!autodocs'],
    render: Default.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Show Message Box')
};
export const OpenConfirmation: Story = {
    name: 'Open: confirmation',
    tags: ['!autodocs'],
    render: Types.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Confirmation')
};
export const OpenError: Story = {
    name: 'Open: error',
    tags: ['!autodocs'],
    render: Types.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Error')
};
export const OpenSuccess: Story = {
    name: 'Open: success',
    tags: ['!autodocs'],
    render: Types.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Success')
};
export const OpenWarning: Story = {
    name: 'Open: warning',
    tags: ['!autodocs'],
    render: Types.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Warning')
};
export const OpenInformation: Story = {
    name: 'Open: information',
    tags: ['!autodocs'],
    render: Types.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Information')
};
export const OpenSizes: Story = {
    name: 'Open: extra large',
    tags: ['!autodocs'],
    render: Sizes.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Extra Large')
};
export const OpenTemplate: Story = {
    name: 'Open: render function',
    tags: ['!autodocs'],
    render: TemplateBased.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Open from template')
};
export const OpenObject: Story = {
    name: 'Open: object',
    tags: ['!autodocs'],
    render: Others.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Open from object')
};
export const OpenComponent: Story = {
    name: 'Open: component',
    tags: ['!autodocs'],
    render: Others.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Open from component')
};
export const OpenComplex: Story = {
    name: 'Open: custom header and footer',
    tags: ['!autodocs'],
    render: Others.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Open with custom header and footer')
};
export const OpenPosition: Story = {
    name: 'Open: position',
    tags: ['!autodocs'],
    render: Position.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Open at the top')
};
export const OpenMobile: Story = {
    name: 'Open: mobile',
    tags: ['!autodocs'],
    render: Mobile.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Open in mobile mode')
};
export const OpenPlayground: StoryObj<PlaygroundArgs> = {
    name: 'Open: playground',
    tags: ['!autodocs'],
    args: Playground.args,
    render: Playground.render,
    play: ({ canvasElement }) => openMessageBox(canvasElement, 'Open message box')
};
