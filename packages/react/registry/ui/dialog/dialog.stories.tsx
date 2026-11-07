import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { BarElement, BarLeft, BarMiddle, BarRight, ButtonBar } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { Input, Textarea } from '@/ui/input/input';
import { LayoutGrid, LayoutGridCol } from '@/ui/layout-grid/layout-grid';
import { List, ListItem, ListSecondary, ListTitle } from '@/ui/list/list';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogCloseButton,
    DialogDescription,
    DialogFooter,
    DialogFullScreenButton,
    DialogHeader,
    DialogPopup,
    DialogProvider,
    DialogSubheader,
    DialogTitle,
    DialogTrigger,
    useDialogRef,
    useDialogService,
    type DialogConfig,
    type DialogOpenChangeDetails,
    type DialogPaddingSize,
    type DialogPopupProps,
    type DialogProps,
    type DialogRef
} from './dialog';

const meta = {
    title: 'Components/Dialog',
    component: Dialog,
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 520 },
            description: {
                component:
                    "A dialog interrupts the current task in a modal window, on Base UI's Dialog. Compose it from " +
                    '`Dialog` (state and options), `DialogTrigger`, `DialogPopup` (the window over a backdrop, in a ' +
                    'portal) and, inside the window, `DialogHeader` (with `DialogTitle`, `DialogFullScreenButton`, ' +
                    '`DialogCloseButton` and `DialogSubheader`), `DialogBody` and `DialogFooter`. It moves the focus ' +
                    'into the window, keeps it there, closes on Escape (and with `backdropClickCloseable` on a ' +
                    'backdrop click) and gives the focus back when it closes. Windows can be draggable, resizable, ' +
                    'full screen, mobile, positioned, stacked, hidden and loading.\n\n' +
                    '```tsx\n' +
                    '<Dialog>\n' +
                    '    <DialogTrigger render={<Button label="Open" />} />\n' +
                    '    <DialogPopup width="25rem">\n' +
                    '        <DialogHeader>\n' +
                    '            <DialogTitle>Title</DialogTitle>\n' +
                    '            <DialogCloseButton />\n' +
                    '        </DialogHeader>\n' +
                    '        <DialogBody>Content</DialogBody>\n' +
                    '        <DialogFooter>\n' +
                    '            <DialogClose render={<ButtonBar variant="emphasized" label="OK" />} />\n' +
                    '        </DialogFooter>\n' +
                    '    </DialogPopup>\n' +
                    '</Dialog>\n' +
                    '```\n\n' +
                    'From code, `useDialogService()` (below a `DialogProvider`) opens a render function, an element or ' +
                    'a `DialogDefaultContent` object and returns a `DialogRef`: `close(result)`, `dismiss(reason)`, ' +
                    '`hide()`, `loading()`, `toggleFullScreen()` and `afterClosed`, a promise of the result.'
            }
        }
    },
    args: {
        escKeyCloseable: true,
        backdropClickCloseable: true,
        focusTrapped: true,
        hasBackdrop: true
    }
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

const PINEAPPLE =
    'The pineapple (Ananas comosus) is a tropical plant with an edible fruit and the most economically significant ' +
    'plant in the family Bromeliaceae. The pineapple is indigenous to South America, where it has been cultivated ' +
    'for many centuries. The introduction of the pineapple to Europe in the 17th century made it a significant ' +
    'cultural icon of luxury.';

const FACTS = [
    'You can grow your own pineapple by planting the top of the pineapple in soil',
    'Pulling leaves from a pineapple is not an indication of ripeness',
    'A pineapple cannot continue to ripen after it has been picked',
    'One of the ways you can tell if a pineapple is ripe is by smelling it'
];

/** The live region that reports how a dialog ended. */
function Status({ children }: { children: ReactNode }) {
    return (
        <p className="m-0 w-full font-sap-font-family text-sap-font-size text-sap-text-color" aria-live="polite">
            {children}
        </p>
    );
}

/** Reports the result of a dialog opened by the service. */
function report(ref: DialogRef<any, any>, set: (text: string) => void): void {
    void ref.afterClosed.then((result) =>
        set(
            result.status === 'closed'
                ? `Dialog closed with result: ${result.value}`
                : `Dialog dismissed with result: ${result.reason}`
        )
    );
}

const row = 'flex flex-wrap items-center gap-2';

/* ------------------------------------------------------------------------------------------------------------------
 * fundamental-react stories
 * ---------------------------------------------------------------------------------------------------------------- */

interface ProductProps extends DialogProps {
    label?: string;
    title?: string;
    header?: ReactNode;
    subheader?: ReactNode;
    size?: DialogPaddingSize;
    popup?: Partial<DialogPopupProps>;
    children?: ReactNode;
}

/** fundamental-react's "Product Added" dialog: a title, three facts and No / Yes actions that close it. */
function ProductDialog({
    label = 'Show Dialog',
    title = 'Product Added',
    header,
    subheader,
    size,
    popup,
    children,
    ...dialog
}: ProductProps) {
    return (
        <Dialog {...dialog}>
            <DialogTrigger render={<Button label={label} />} />
            <DialogPopup size={size} {...popup}>
                <DialogHeader>
                    {header}
                    <DialogTitle>{title}</DialogTitle>
                    {subheader && <DialogSubheader>{subheader}</DialogSubheader>}
                </DialogHeader>
                <DialogBody>
                    {children ?? (
                        <>
                            <p className="mt-0">
                                <b>The new product have been added to your catalog.</b>
                            </p>
                            <p>
                                Automatic Product ID: <b>PD-3465334</b>
                            </p>
                            <p className="mb-0">
                                Expiration date: <b>13/03/2018</b>
                            </p>
                        </>
                    )}
                </DialogBody>
                <DialogFooter>
                    <DialogClose render={<ButtonBar variant="emphasized" label="Yes" />} />
                    <DialogClose render={<ButtonBar label="No" />} />
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
}

type PlaygroundArgs = DialogProps & {
    width?: string;
    draggable?: boolean;
    resizable?: boolean;
    mobile?: boolean;
    verticalPadding?: boolean;
    responsivePadding?: boolean;
};

function PlaygroundExample({
    width,
    draggable,
    resizable,
    mobile,
    verticalPadding,
    responsivePadding,
    ...dialog
}: PlaygroundArgs) {
    const [status, setStatus] = useState('');
    return (
        <div className={row}>
            <Dialog
                {...dialog}
                onOpenChange={(open, details) => !open && setStatus(`Dialog closed: ${details.reason}`)}
            >
                <DialogTrigger render={<Button label="Open dialog" />} />
                <DialogPopup
                    width={width || undefined}
                    draggable={draggable}
                    resizable={resizable}
                    mobile={mobile}
                    verticalPadding={verticalPadding}
                    responsivePadding={responsivePadding}
                >
                    <DialogHeader>
                        <DialogTitle>Playground Dialog</DialogTitle>
                        <DialogFullScreenButton />
                        <DialogCloseButton title="Close" />
                    </DialogHeader>
                    <DialogBody>This is the dialog playground body text.</DialogBody>
                    <DialogFooter>
                        <DialogClose render={<ButtonBar variant="emphasized" label="Save" />} />
                        <DialogClose render={<ButtonBar label="Cancel" />} />
                    </DialogFooter>
                </DialogPopup>
            </Dialog>
            <Status>{status}</Status>
        </div>
    );
}

export const Playground: StoryObj<PlaygroundArgs> = {
    args: {
        width: '25rem',
        draggable: false,
        resizable: false,
        mobile: false,
        verticalPadding: true,
        responsivePadding: false,
        escKeyCloseable: true,
        backdropClickCloseable: true,
        focusTrapped: true,
        hasBackdrop: true
    },
    argTypes: { width: { control: 'text' } },
    render: (args) => <PlaygroundExample {...args} />
};

export const Default: Story = {
    name: 'Default',
    parameters: {
        docs: {
            description: {
                story: 'A trigger opens the dialog; its actions are `DialogClose` buttons, so they close it (fundamental-react `primary`).'
            }
        }
    },
    render: () => <ProductDialog />
};

export const Header: Story = {
    name: 'Header content',
    parameters: {
        docs: { description: { story: 'Other content of the header goes to its start, before the title.' } }
    },
    render: () => <ProductDialog header={<span>Test header</span>} />
};

export const Subheader: Story = {
    name: 'Subheader',
    parameters: {
        docs: { description: { story: '`DialogSubheader` adds a subheader bar below the header bar.' } }
    },
    render: () => <ProductDialog subheader="Test subheader" />
};

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
    render: () => {
        const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt';
        return (
            <div className={row}>
                <ProductDialog label="Show Small Dialog" title="Small Dialog" size="s">
                    {text}
                </ProductDialog>
                <ProductDialog label="Show Medium Dialog" title="Medium Dialog" size="m">
                    {text}
                </ProductDialog>
                <ProductDialog label="Show Large Dialog" title="Large Dialog" size="l">
                    {text}
                </ProductDialog>
                <ProductDialog label="Show XL Dialog" title="XL Dialog" size="xl">
                    {text}
                </ProductDialog>
            </div>
        );
    }
};

/* ------------------------------------------------------------------------------------------------------------------
 * Angular stories
 * ---------------------------------------------------------------------------------------------------------------- */

interface PineappleProps {
    label: string;
    heading?: string;
    popup?: Partial<DialogPopupProps>;
    dialog?: Partial<DialogProps>;
    fullScreen?: boolean;
}

/** The Angular template dialog: the pineapple text, Interested / Cancel, and how it ended. */
function PineappleDialog({
    label,
    heading = 'Origin of the Pineapple Word',
    popup,
    dialog,
    fullScreen
}: PineappleProps) {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState('');
    const close = (result: string) => {
        setOpen(false);
        setStatus(`Dialog closed with result: ${result}`);
    };
    const onOpenChange = (next: boolean, details: DialogOpenChangeDetails) => {
        setOpen(next);
        if (!next) setStatus(`Dialog dismissed with result: ${details.reason}`);
    };
    return (
        <>
            <Dialog {...dialog} open={open} onOpenChange={onOpenChange}>
                <DialogTrigger render={<Button label={label} />} />
                <DialogPopup width="25rem" responsivePadding {...popup}>
                    <DialogHeader>
                        <DialogTitle>{heading}</DialogTitle>
                        {fullScreen && <DialogFullScreenButton />}
                        <DialogCloseButton title="Close" />
                    </DialogHeader>
                    <DialogBody>
                        <DialogDescription className="m-0">{PINEAPPLE}</DialogDescription>
                    </DialogBody>
                    <DialogFooter>
                        <ButtonBar variant="emphasized" label="Interested" onClick={() => close('Continue')} />
                        <ButtonBar label="Cancel" onClick={() => close('Cancel')} />
                    </DialogFooter>
                </DialogPopup>
            </Dialog>
            {status && <Status>{status}</Status>}
        </>
    );
}

/** Opens the Angular template dialog from code: a render function that gets the `DialogRef`. */
function TemplateExample({
    actions
}: {
    actions: { label: string; config?: DialogConfig<string>; after?: (ref: DialogRef<string, string>) => void }[];
}) {
    const dialogs = useDialogService();
    const [status, setStatus] = useState('');
    const open = (config?: DialogConfig<string>, after?: (ref: DialogRef<string, string>) => void) => {
        const ref = dialogs.open<string, string>(
            (dialog) => (
                <DialogPopup>
                    <DialogHeader>
                        <DialogTitle>The History of Pineapple</DialogTitle>
                        <DialogCloseButton title="Close" />
                    </DialogHeader>
                    <DialogBody>
                        <DialogDescription className="m-0">{dialog.data ?? PINEAPPLE}</DialogDescription>
                    </DialogBody>
                    <DialogFooter>
                        <ButtonBar variant="emphasized" label="Interested" onClick={() => dialog.close('Continue')} />
                        <ButtonBar label="Cancel" onClick={() => dialog.dismiss('Cancel')} />
                    </DialogFooter>
                </DialogPopup>
            ),
            { width: '25rem', responsivePadding: true, ...config }
        );
        report(ref, setStatus);
        after?.(ref);
    };
    return (
        <div className={row}>
            {actions.map((action) => (
                <Button key={action.label} label={action.label} onClick={() => open(action.config, action.after)} />
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
                    "`useDialogService().open(render, config)` (Angular's template-based dialog): the render function " +
                    'gets the `DialogRef`; `afterClosed` resolves with the `close()` result or the `dismiss()` reason.'
            }
        }
    },
    render: () => (
        <DialogProvider>
            <TemplateExample actions={[{ label: 'Open from template' }]} />
        </DialogProvider>
    )
};

/** A dialog component opened by the service; it reads its DialogRef with `useDialogRef()`. */
function FactsDialog() {
    const ref = useDialogRef<{ title: string }, string>();
    const dialogs = useDialogService();
    return (
        <DialogPopup aria-describedby="story-dialog-c-body">
            <DialogHeader>
                <DialogTitle>{ref.data?.title}</DialogTitle>
                <DialogFullScreenButton title={ref.isFullScreen ? 'Exit full-screen mode' : 'Enter full-screen mode'} />
            </DialogHeader>
            <DialogBody>
                <p className="m-0 text-justify" id="story-dialog-c-body">
                    {PINEAPPLE}
                </p>
                <ul className="mb-0 list-disc ps-6">
                    {FACTS.map((fact) => (
                        <li key={fact}>{fact}</li>
                    ))}
                </ul>
            </DialogBody>
            <DialogFooter>
                <ButtonBar variant="emphasized" label="Interesting" onClick={() => ref.close('Continue')} />
                <ButtonBar
                    label="Open another dialog"
                    onClick={() => dialogs.open(<SecondDialog />, { responsivePadding: true })}
                />
                <ButtonBar label="Cancel" onClick={() => ref.dismiss('Cancel')} />
            </DialogFooter>
        </DialogPopup>
    );
}

function SecondDialog() {
    const ref = useDialogRef();
    return (
        <DialogPopup>
            <DialogHeader>
                <DialogTitle>Second dialog</DialogTitle>
                <DialogCloseButton title="Close" />
            </DialogHeader>
            <DialogBody>
                This is the second dialog. It is independent from the first one; only one block layer dims the page.
            </DialogBody>
            <DialogFooter>
                <ButtonBar variant="emphasized" label="Close" onClick={() => ref.close()} />
            </DialogFooter>
        </DialogPopup>
    );
}

function ComponentExample() {
    const dialogs = useDialogService();
    const [status, setStatus] = useState('');
    return (
        <div className={row}>
            <Button
                label="Open from component"
                onClick={() =>
                    report(
                        dialogs.open(<FactsDialog />, {
                            data: { title: 'Pineapple Fun Facts' },
                            width: '25rem',
                            responsivePadding: true,
                            draggable: true,
                            resizable: true
                        }),
                        setStatus
                    )
                }
            />
            <Status>{status}</Status>
        </div>
    );
}

export const ComponentBased: Story = {
    name: 'From code: component (draggable, resizable, full screen, stacked)',
    parameters: {
        docs: {
            description: {
                story:
                    'An element opened by the service; inside, `useDialogRef()` gives its `DialogRef` and data. The ' +
                    'window can be dragged by its header, resized from its corner and toggled to full screen; a second ' +
                    'dialog stacks on top with one block layer.'
            }
        }
    },
    render: () => (
        <DialogProvider>
            <ComponentExample />
        </DialogProvider>
    )
};

function ObjectExample() {
    const dialogs = useDialogService();
    const [status, setStatus] = useState('');
    const open = () => {
        const ref: DialogRef<unknown, string> = dialogs.open<unknown, string>(
            {
                title: 'Dialog title',
                content: <p className="m-0">You can also create a dialog without building the whole template.</p>,
                subHeader: (
                    <BarMiddle>
                        <BarElement fullWidth>
                            <Input type="search" placeholder="Search" aria-label="Search" />
                        </BarElement>
                    </BarMiddle>
                ),
                approveButton: 'OK',
                approveButtonCallback: () => ref.close('Approved'),
                cancelButton: 'Cancel',
                cancelButtonCallback: () => ref.close('Canceled'),
                closeButtonCallback: () => ref.dismiss('Dismissed'),
                closeButtonTitle: 'Close',
                allowFullScreen: true,
                fullScreenExpandButtonText: 'Enter full-screen mode',
                fullScreenMinifyButtonText: 'Exit full-screen mode'
            },
            { width: '25rem', resizable: true, draggable: true }
        );
        report(ref, setStatus);
    };
    return (
        <div className={row}>
            <Button label="Open dialog from object" onClick={open} />
            <Status>{status}</Status>
        </div>
    );
}

export const ObjectBased: Story = {
    name: 'From code: object',
    parameters: {
        docs: {
            description: {
                story:
                    'A `DialogDefaultContent` object: title, subheader, content, approve and cancel buttons, a close ' +
                    'button and a full-screen toggle, without writing the dialog.'
            }
        }
    },
    render: () => (
        <DialogProvider>
            <ObjectExample />
        </DialogProvider>
    )
};

export const Configuration: Story = {
    name: 'Configuration',
    parameters: {
        docs: {
            description: {
                story:
                    'A draggable window (by its header), a resizable one (from its bottom end corner) and one that only ' +
                    'its buttons close (`escKeyCloseable={false}`). The first two also close on a backdrop click.'
            }
        }
    },
    render: () => (
        <div className={row}>
            <PineappleDialog
                label="Open draggable dialog"
                popup={{ draggable: true }}
                dialog={{ backdropClickCloseable: true }}
            />
            <PineappleDialog
                label="Open resizable dialog"
                popup={{ resizable: true }}
                dialog={{ backdropClickCloseable: true }}
                fullScreen
            />
            <PineappleDialog label="Open dialog closable only with its buttons" dialog={{ escKeyCloseable: false }} />
        </div>
    )
};

interface Fruit {
    id: number;
    name: string;
    price: number;
}
const FRUITS: Fruit[] = [
    { id: 1, name: 'Pineapple', price: 3 },
    { id: 2, name: 'Orange', price: 1 },
    { id: 3, name: 'Banana', price: 2 },
    { id: 4, name: 'Kiwi', price: 2 },
    { id: 5, name: 'Mango', price: 4 },
    { id: 6, name: 'Strawberries', price: 5 }
];

function ComplexExample() {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const searchField = useRef<HTMLInputElement>(null);
    const filtered = FRUITS.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
    const total = FRUITS.filter((f) => selected.has(f.id)).reduce((sum, f) => sum + f.price, 0);
    const toggle = (fruit: Fruit, on: boolean) => {
        const next = new Set(selected);
        if (on) next.add(fruit.id);
        else next.delete(fruit.id);
        setSelected(next);
    };
    return (
        <Dialog>
            <DialogTrigger render={<Button label="Open with custom header and footer" />} />
            <DialogPopup width="24rem" height="28rem" responsivePadding initialFocus={searchField}>
                <DialogHeader>
                    <BarLeft>
                        <BarElement>
                            <DialogTitle>Fresh Market</DialogTitle>
                        </BarElement>
                    </BarLeft>
                    <BarRight>
                        <ButtonBar
                            label="Clear"
                            onClick={() => {
                                setSearch('');
                                setSelected(new Set());
                            }}
                        />
                    </BarRight>
                    <DialogSubheader>
                        <BarMiddle>
                            <BarElement fullWidth>
                                <Input
                                    ref={searchField}
                                    type="search"
                                    placeholder="Search"
                                    aria-label="Search produce"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </BarElement>
                        </BarMiddle>
                    </DialogSubheader>
                </DialogHeader>
                <DialogBody disablePaddings>
                    <List selection noBorder aria-multiselectable="true" aria-label="Produce">
                        {filtered.map((fruit) => (
                            <ListItem key={fruit.id}>
                                <Checkbox
                                    aria-label={fruit.name}
                                    checked={selected.has(fruit.id)}
                                    onCheckedChange={(on) => toggle(fruit, on)}
                                />
                                <ListTitle>{fruit.name}</ListTitle>
                                <ListSecondary>{fruit.price} €</ListSecondary>
                            </ListItem>
                        ))}
                    </List>
                </DialogBody>
                <DialogFooter>
                    <BarLeft>
                        <BarElement>Total price: {total} €</BarElement>
                    </BarLeft>
                    <BarRight>
                        <DialogClose render={<ButtonBar glyph="cart" variant="emphasized" label="Checkout" />} />
                    </BarRight>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
}

export const Complex: Story = {
    name: 'Custom header, subheader and footer',
    parameters: {
        docs: {
            description: {
                story:
                    'Bar areas directly in `DialogHeader` and `DialogFooter` make a custom header and footer; ' +
                    '`DialogSubheader` holds a search field, `initialFocus` starts the focus there, and the body is a list without paddings.'
            }
        }
    },
    render: () => <ComplexExample />
};

export const Position: Story = {
    name: 'Position',
    parameters: { docs: { description: { story: '`position` places the window instead of centring it.' } } },
    render: () => (
        <PineappleDialog label="Open in bottom right" popup={{ position: { bottom: '6rem', right: '6rem' } }} />
    )
};

export const Mobile: Story = {
    name: 'Mobile',
    parameters: {
        docs: {
            description: {
                story:
                    'A mobile window fills the screen, in cozy density here (`contentDensity`); `mobileOuterSpacing` ' +
                    'keeps a margin and rounded corners.'
            }
        }
    },
    render: () => (
        <div className={row}>
            <PineappleDialog
                label="Open in mobile mode"
                popup={{ width: undefined, mobile: true, contentDensity: 'cozy' }}
            />
            <PineappleDialog
                label="Open in mobile mode with outer spacing"
                popup={{ width: undefined, mobile: true, mobileOuterSpacing: true }}
            />
        </div>
    )
};

export const States: Story = {
    name: 'Closing, dismissing, hiding and loading',
    parameters: {
        docs: {
            description: {
                story: "The `DialogRef` closes, dismisses, hides and shows a busy indicator in the dialog (Angular's dialog states)."
            }
        }
    },
    render: () => (
        <DialogProvider>
            <TemplateExample
                actions={[
                    {
                        label: 'Open self closing dialog',
                        config: { data: 'This dialog will be closed after 4s.' },
                        after: (ref) => setTimeout(() => ref.close('timeout'), 4000)
                    },
                    {
                        label: 'Open self dismissing dialog',
                        config: { data: 'This dialog will be dismissed after 4s.' },
                        after: (ref) => setTimeout(() => ref.dismiss('timeout'), 4000)
                    },
                    {
                        label: 'Open self hiding dialog',
                        config: { data: 'This dialog will be hidden for 2s after 2s.' },
                        after: (ref) => {
                            setTimeout(() => ref.hide(true), 2000);
                            setTimeout(() => ref.hide(false), 4000);
                        }
                    },
                    {
                        label: 'Open loading dialog',
                        config: { data: 'Loading the details.' },
                        after: (ref) =>
                            ref.loading({
                                isLoading: true,
                                loadingLabel: 'Loading',
                                loadingContent: 'Now loading data from a far, far away server.'
                            })
                    }
                ]}
            />
        </DialogProvider>
    )
};

function BackdropExample() {
    const container = useRef<HTMLDivElement>(null);
    const dialog = (
        label: string,
        text: string,
        dialogProps: Partial<DialogProps>,
        popup: Partial<DialogPopupProps>
    ) => (
        <Dialog {...dialogProps}>
            <DialogTrigger render={<Button label={label} />} />
            <DialogPopup width="20rem" {...popup}>
                <DialogHeader>
                    <DialogTitle>Backdrop configuration</DialogTitle>
                    <DialogCloseButton title="Close" />
                </DialogHeader>
                <DialogBody>{text}</DialogBody>
                <DialogFooter>
                    <DialogClose render={<ButtonBar variant="emphasized" label="Close" />} />
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
    return (
        <>
            <div className={row}>
                {dialog(
                    'Custom backdrop',
                    'This dialog has a custom backdrop.',
                    {},
                    {
                        backdropClassName: 'before:bg-sap-information-background before:opacity-90'
                    }
                )}
                {dialog('Custom container', 'This dialog has been opened inside a local div.', {}, { container })}
                {dialog(
                    'Static dialog',
                    'This dialog is in a local div without backdrop, as a static element.',
                    { hasBackdrop: false, focusTrapped: false },
                    { container }
                )}
            </div>
            <div ref={container} className="mt-2" />
        </>
    );
}

export const Backdrop: Story = {
    name: 'Backdrop and container',
    parameters: {
        docs: {
            description: {
                story:
                    '`backdropClassName` styles the backdrop (its `before:` layer dims the page), `container` renders ' +
                    'the dialog into an element of the page, and without backdrop and focus trap it flows there as a static element.'
            }
        }
    },
    render: () => <BackdropExample />
};

const label = 'block pb-1 font-sap-font-family text-sap-font-small-size text-sap-content-label-color';

function FormExample() {
    const [responsivePadding, setResponsivePadding] = useState(false);
    const [verticalPadding, setVerticalPadding] = useState(true);
    const [status, setStatus] = useState('');
    const [open, setOpen] = useState(false);
    const close = (result: string) => {
        setOpen(false);
        setStatus(`Dialog closed with result: ${result}`);
    };
    return (
        <div className="flex flex-wrap items-center gap-4">
            <Checkbox label="Responsive padding" checked={responsivePadding} onCheckedChange={setResponsivePadding} />
            <Checkbox label="Vertical padding" checked={verticalPadding} onCheckedChange={setVerticalPadding} />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={<Button label="Open form" />} />
                <DialogPopup width="30rem" responsivePadding={responsivePadding} verticalPadding={verticalPadding}>
                    <DialogHeader>
                        <DialogTitle>The History of Pineapple</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <div className="flex flex-col gap-2">
                            <div>
                                <label className={label} htmlFor="story-dialog-form-name">
                                    Name:
                                </label>
                                <Input
                                    id="story-dialog-form-name"
                                    placeholder="Enter first and last name"
                                    defaultValue="Amelia Perry"
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="story-dialog-form-street">
                                    Street/No.:
                                </label>
                                <LayoutGrid noGap>
                                    <LayoutGridCol span={8} className="pe-2">
                                        <Input
                                            id="story-dialog-form-street"
                                            required
                                            placeholder="Enter address"
                                            defaultValue="Myrtle St."
                                        />
                                    </LayoutGridCol>
                                    <LayoutGridCol span={4}>
                                        <Input
                                            aria-label="Street number"
                                            required
                                            placeholder="Enter street number"
                                            defaultValue="495"
                                        />
                                    </LayoutGridCol>
                                </LayoutGrid>
                            </div>
                            <div>
                                <label className={label} htmlFor="story-dialog-form-zip">
                                    ZIP Code/City:
                                </label>
                                <LayoutGrid noGap>
                                    <LayoutGridCol span={4} className="pe-2">
                                        <Input
                                            id="story-dialog-form-zip"
                                            required
                                            placeholder="Enter ZIP code"
                                            defaultValue="43823"
                                        />
                                    </LayoutGridCol>
                                    <LayoutGridCol span={8}>
                                        <Input
                                            aria-label="City"
                                            required
                                            placeholder="Enter city"
                                            defaultValue="Downtown"
                                        />
                                    </LayoutGridCol>
                                </LayoutGrid>
                            </div>
                            <div>
                                <label className={label} htmlFor="story-dialog-form-bio">
                                    Bio:
                                </label>
                                <Textarea
                                    id="story-dialog-form-bio"
                                    rows={3}
                                    defaultValue="Grows pineapples on the balcony."
                                />
                            </div>
                        </div>
                    </DialogBody>
                    <DialogFooter>
                        <ButtonBar variant="emphasized" label="Save" onClick={() => close('Save')} />
                        <ButtonBar label="Cancel" onClick={() => close('Cancel')} />
                    </DialogFooter>
                </DialogPopup>
            </Dialog>
            <Status>{status}</Status>
        </div>
    );
}

export const Form: Story = {
    name: 'Form',
    parameters: {
        docs: {
            description: {
                story:
                    'A form in a dialog: fields in a layout grid, with the paddings as options. Plain labels stand in ' +
                    'for the form label until form is ported.'
            }
        }
    },
    render: () => <FormExample />
};

function OptionsPopover({ id, label: text, options }: { id: string; label: string; options: string[] }) {
    return (
        <div>
            <span className={label} id={id}>
                {text}
            </span>
            <Popover fillControlMode="at-least">
                <PopoverTrigger aria-describedby={id} render={<Button menu label="Select options" />} />
                <PopoverBody aria-labelledby={id}>
                    <List aria-labelledby={id} className="min-w-60">
                        {options.map((option) => (
                            <ListItem key={option} interactive>
                                <ListTitle>{option}</ListTitle>
                            </ListItem>
                        ))}
                    </List>
                </PopoverBody>
            </Popover>
        </div>
    );
}

function InnerPopoversExample() {
    return (
        <Dialog>
            <DialogTrigger render={<Button label="Open from component" />} />
            <DialogPopup width="25rem" responsivePadding>
                <DialogHeader>
                    <DialogTitle>Pineapple Fun Facts</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <div className="flex flex-col gap-4">
                        <OptionsPopover
                            id="story-dialog-first-list"
                            label="The first list of options"
                            options={[
                                'Photo Voltaic',
                                'Settings',
                                'Heating Cooling',
                                'Competitor',
                                'Chalkboard',
                                'Database'
                            ]}
                        />
                        <OptionsPopover
                            id="story-dialog-second-list"
                            label="The second list of options"
                            options={['Apple', 'Tomato', 'Banana', 'Grapes', 'Pumpkin', 'Kiwi', 'Mango', 'Pear']}
                        />
                    </div>
                </DialogBody>
                <DialogFooter>
                    <DialogClose render={<ButtonBar variant="emphasized" label="Interesting" />} />
                    <DialogClose render={<ButtonBar label="Cancel" />} />
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
}

export const InnerPopovers: Story = {
    name: 'Inner popovers',
    parameters: {
        docs: {
            description: {
                story:
                    'Popovers in the dialog open above it, and Escape closes the popover first. Popovers with lists ' +
                    'stand in for the multi inputs until multi-input is ported.'
            }
        }
    },
    render: () => <InnerPopoversExample />
};

/* ------------------------------------------------------------------------------------------------------------------
 * Open dialogs in the page: the visual reference cases
 * ---------------------------------------------------------------------------------------------------------------- */

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt';

function StaticDialog({
    variant,
    title = 'Lorem ipsum',
    container,
    popup,
    loading,
    children
}: {
    variant: string;
    title?: string;
    container: HTMLElement;
    popup?: Partial<DialogPopupProps>;
    loading?: boolean;
    children?: ReactNode;
}) {
    return (
        <Dialog defaultOpen hasBackdrop={false} focusTrapped={false} loading={loading}>
            <DialogPopup
                data-variant={variant}
                container={container}
                width="39rem"
                finalFocus={false}
                initialFocus={false}
                {...popup}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogBody>{children ?? LOREM}</DialogBody>
                <DialogFooter>
                    <ButtonBar variant="emphasized" label="Save" />
                    <ButtonBar label="Cancel" />
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
}

function VariantsExample() {
    const [slots, setSlots] = useState<HTMLElement[]>([]);
    const names = ['Small', 'Medium', 'Large', 'Extra large', 'Resizable', 'Draggable', 'Loading'];
    return (
        <div className="flex flex-col gap-6">
            {names.map((name, index) => (
                <div
                    key={name}
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
            {slots.length === names.length && (
                <>
                    <StaticDialog variant="Small" title="Small Dialog" container={slots[0]!} popup={{ size: 's' }} />
                    <StaticDialog variant="Medium" title="Medium Dialog" container={slots[1]!} popup={{ size: 'm' }} />
                    <StaticDialog variant="Large" title="Large Dialog" container={slots[2]!} popup={{ size: 'l' }} />
                    <StaticDialog
                        variant="Extra large"
                        title="Extra Large Dialog"
                        container={slots[3]!}
                        popup={{ size: 'xl' }}
                    />
                    <StaticDialog variant="Resizable" container={slots[4]!} popup={{ resizable: true }} />
                    <StaticDialog variant="Draggable" container={slots[5]!} popup={{ draggable: true }} />
                    <StaticDialog variant="Loading" title="Loading Data..." container={slots[6]!} loading>
                        <strong>Status:</strong> Connecting 127.0.0.1
                    </StaticDialog>
                </>
            )}
        </div>
    );
}

export const Variants: Story = {
    name: 'Window variants',
    parameters: {
        docs: {
            description: {
                story:
                    'Open windows rendered into the page (`container`, no backdrop): the padding sizes, a resizable, a ' +
                    'draggable and a loading window, as in the fundamental-styles stories.'
            }
        }
    },
    render: () => <VariantsExample />
};

/* ------------------------------------------------------------------------------------------------------------------
 * Open stories: the a11y run checks the open dialogs
 * ---------------------------------------------------------------------------------------------------------------- */

/** Clicks the button with this label and waits until the dialog has faded in. */
async function openDialog(canvasElement: HTMLElement, text: string): Promise<void> {
    const button = [...canvasElement.querySelectorAll<HTMLElement>('button')].find(
        (b) => b.textContent!.trim() === text
    )!;
    await userEvent.click(button);
    await waitFor(() => expect(document.querySelectorAll('[role=dialog][data-open]')).toHaveLength(1));
    const animated = [...document.querySelectorAll<HTMLElement>('[role=dialog], [data-dialog-backdrop]')];
    await Promise.all(animated.flatMap((el) => el.getAnimations().map((a) => a.finished)));
}

export const OpenDefault: Story = {
    name: 'Open: default',
    tags: ['!autodocs'],
    render: Default.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Show Dialog')
};
export const OpenSubheader: Story = {
    name: 'Open: subheader',
    tags: ['!autodocs'],
    render: Subheader.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Show Dialog')
};
export const OpenTemplate: Story = {
    name: 'Open: render function',
    tags: ['!autodocs'],
    render: TemplateBased.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Open from template')
};
export const OpenComponent: Story = {
    name: 'Open: component',
    tags: ['!autodocs'],
    render: ComponentBased.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Open from component')
};
export const OpenObject: Story = {
    name: 'Open: object',
    tags: ['!autodocs'],
    render: ObjectBased.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Open dialog from object')
};
export const OpenComplex: Story = {
    name: 'Open: custom header and footer',
    tags: ['!autodocs'],
    render: Complex.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Open with custom header and footer')
};
export const OpenResizable: Story = {
    name: 'Open: resizable',
    tags: ['!autodocs'],
    render: Configuration.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Open resizable dialog')
};
export const OpenLoading: Story = {
    name: 'Open: loading',
    tags: ['!autodocs'],
    render: States.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Open loading dialog')
};
export const OpenPosition: Story = {
    name: 'Open: position',
    tags: ['!autodocs'],
    render: Position.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Open in bottom right')
};
export const OpenMobile: Story = {
    name: 'Open: mobile',
    tags: ['!autodocs'],
    render: Mobile.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Open in mobile mode')
};
export const OpenBackdrop: Story = {
    name: 'Open: custom backdrop',
    tags: ['!autodocs'],
    render: Backdrop.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Custom backdrop')
};
export const OpenInnerPopover: Story = {
    name: 'Open: inner popover',
    tags: ['!autodocs'],
    render: InnerPopovers.render,
    play: async ({ canvasElement }) => {
        await openDialog(canvasElement, 'Open from component');
        const trigger = document.querySelector<HTMLElement>('[role=dialog] [aria-haspopup]')!;
        await userEvent.click(trigger);
        const body = () => document.getElementById(trigger.getAttribute('aria-controls') ?? '');
        await waitFor(() => expect(body()?.querySelector('li')).toBeTruthy());
        // the list is above the dialog
        const list = body()!;
        const item = list.querySelector('li')!.getBoundingClientRect();
        const hit = document.elementFromPoint(item.left + item.width / 2, item.top + item.height / 2);
        await expect(list.contains(hit)).toBe(true);
    }
};
export const OpenForm: Story = {
    name: 'Open: form',
    tags: ['!autodocs'],
    render: Form.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Open form')
};
export const OpenPlayground: StoryObj<PlaygroundArgs> = {
    name: 'Open: playground',
    tags: ['!autodocs'],
    args: Playground.args,
    render: Playground.render,
    play: ({ canvasElement }) => openDialog(canvasElement, 'Open dialog')
};
