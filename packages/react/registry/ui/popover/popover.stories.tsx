import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { Dialog, DialogBody, DialogHeader, DialogPopup, DialogTitle, DialogTrigger } from '@/ui/dialog/dialog';
import { Icon } from '@/ui/icon/icon';
import { Title } from '@/ui/title/title';
import {
    PLACEMENTS,
    Popover,
    PopoverBody,
    PopoverBodyFooter,
    PopoverBodyHeader,
    PopoverClose,
    PopoverTrigger,
    createPopoverHandle,
    type Placement,
    type PopoverProps
} from './popover';

const meta = {
    title: 'Components/Popover',
    component: Popover,
    parameters: {
        docs: {
            description: {
                component:
                    "A popover shows content in an overlay next to its trigger, on Base UI's Popover. Compose it from " +
                    '`Popover` (state and options), `PopoverTrigger` (the control; `render` your own `Button`), ' +
                    '`PopoverBody` (the surface, in a portal) and, inside the body, `PopoverBodyHeader`, ' +
                    '`PopoverBodyFooter`, `PopoverTitle` and `PopoverClose`. The body flips when there is no room, ' +
                    'closes on outside click and Escape, moves focus into the body, keeps Tab inside it and returns ' +
                    'focus to the trigger. Alt+ArrowDown opens it from the keyboard.\n\n' +
                    '```tsx\n' +
                    '<Popover placement="bottom-start" noArrow={false}>\n' +
                    '    <PopoverTrigger render={<Button label="Details" />} />\n' +
                    '    <PopoverBody aria-label="Details">\n' +
                    '        <div className="p-4">Content</div>\n' +
                    '    </PopoverBody>\n' +
                    '</Popover>\n' +
                    '```\n\n' +
                    'Other popups reuse its parts: `popoverSurfaceVariants` and `popoverArrowClassName` style a Base UI ' +
                    "popup and arrow like a popover body, and `getPlacement` turns a `placement` into Base UI's " +
                    '`side` and `align`.'
            }
        }
    },
    argTypes: {
        placement: { control: 'select', options: PLACEMENTS },
        fillControlMode: { control: 'inline-radio', options: [null, 'at-least', 'equal', 'fit-content'] }
    },
    args: {
        placement: 'bottom-start',
        noArrow: false,
        disabled: false,
        fixedPosition: false,
        closeOnOutsideClick: true,
        closeOnEscapeKey: true,
        focusTrapped: true,
        focusAutoCapture: true,
        restoreFocusOnClose: true,
        resizable: false,
        disableScrollbar: false,
        applyOverlay: false
    }
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Stand-in for the header bar until the bar is ported: a back button and a title. */
function HeaderBar({ title, back }: { title: string; back?: ReactNode }) {
    return (
        <div
            role="toolbar"
            aria-label={title}
            className="flex h-11 items-center gap-2 rounded-t-[inherit] bg-sap-page-header-background px-2 shadow-sap-content-header-shadow compact:h-8"
        >
            {back ?? <Button variant="transparent" glyph="navigation-left-arrow" aria-label="Back" />}
            <Title level={5}>{title}</Title>
        </div>
    );
}

/** Stand-in for the footer bar until the bar is ported: actions at the end. */
function FooterBar({ children }: { children: ReactNode }) {
    return (
        <div
            role="toolbar"
            aria-label="Actions"
            className="flex h-11 items-center justify-end gap-2 rounded-b-[inherit] bg-sap-page-footer-background px-2 compact:h-8"
        >
            {children}
        </div>
    );
}

/** Stand-in for an avatar until the avatar is ported. */
function Avatar({ glyph, label, size = 'm' }: { glyph: string; label?: string; size?: 'm' | 'xl' }) {
    return (
        <span
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            className={
                size === 'xl'
                    ? 'm-4 inline-flex size-28 items-center justify-center rounded-full bg-sap-avatar-6-background text-sap-avatar-6-text-color'
                    : 'inline-flex size-12 items-center justify-center rounded-sap-element-border-corner-radius bg-sap-avatar-3-background text-sap-avatar-3-text-color'
            }
        >
            <Icon glyph={glyph} className={size === 'xl' ? 'text-[3rem]' : 'text-[1.5rem]'} />
        </span>
    );
}

const GROUP = <Avatar glyph="group" label="Group" size="xl" />;

/** A focusable avatar as a trigger: not a button, so `nativeButton={false}`. */
const avatarTrigger = (glyph: string, label: string) => (
    <PopoverTrigger
        nativeButton={false}
        aria-label={label}
        className="rounded-sap-element-border-corner-radius focus-visible:outline-sap"
        render={<span />}
    >
        <Avatar glyph={glyph} />
    </PopoverTrigger>
);

export const Playground: Story = {
    render: (args) => (
        <div className="flex h-96 items-center justify-center">
            <Popover {...args}>
                <PopoverTrigger render={<Button label="Open Popover" />} />
                <PopoverBody aria-label="Playground">
                    <div className="p-4">Popover content</div>
                </PopoverBody>
            </Popover>
        </div>
    )
};

export const Simple: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Popovers on an avatar, a header with a back button, a header and footer, and a fixed placement ' +
                    'that does not flip.'
            }
        }
    },
    render: () => (
        <div className="flex flex-wrap items-start gap-6">
            <Popover>
                {avatarTrigger('person-placeholder', 'Photo')}
                <PopoverBody aria-label="Group">{GROUP}</PopoverBody>
            </Popover>

            <Popover placement="bottom">
                {avatarTrigger('money-bills', 'Money bills')}
                <PopoverBody aria-label="Header" minWidth="25rem">
                    <PopoverBodyHeader>
                        <HeaderBar title="Header" />
                    </PopoverBodyHeader>
                    {GROUP}
                </PopoverBody>
            </Popover>

            <Popover>
                <PopoverTrigger render={<Button label="Sample" />} />
                <PopoverBody aria-label="Title">
                    <PopoverBodyHeader>
                        <HeaderBar title="Title" />
                    </PopoverBodyHeader>
                    {GROUP}
                    <PopoverBodyFooter>
                        <FooterBar>
                            <Button variant="emphasized" label="Save" />
                            <Button variant="transparent" label="Cancel" />
                        </FooterBar>
                    </PopoverBodyFooter>
                </PopoverBody>
            </Popover>

            <Popover placement="bottom" fixedPosition noArrow={false}>
                <PopoverTrigger render={<Button label="Fixed Position" />} />
                <PopoverBody aria-label="Fixed position">
                    <div className="p-4">This popover keeps its placement even when it does not fit.</div>
                </PopoverBody>
            </Popover>
        </div>
    )
};

const PLACEMENT_ROWS: Placement[][] = [
    ['top-start', 'top', 'top-end'],
    ['left-start', 'right-start'],
    ['left', 'right'],
    ['left-end', 'right-end'],
    ['bottom-start', 'bottom', 'bottom-end']
];
const placementGlyph = (p: Placement) =>
    p.startsWith('top')
        ? 'navigation-up-arrow'
        : p.startsWith('bottom')
          ? 'navigation-down-arrow'
          : p.startsWith('left')
            ? 'navigation-left-arrow'
            : 'navigation-right-arrow';

export const Placements: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Every placement with the arrow shown and a resizable body. `top`/`bottom` align `start` and `end` ' +
                    'with the reading direction; `left` and `right` are physical sides and stay put in RTL.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col items-center gap-6 py-40">
            {PLACEMENT_ROWS.map((row) => (
                <div key={row.join()} className="flex w-[36rem] justify-between">
                    {row.map((p) => (
                        <Popover key={p} placement={p} noArrow={false} resizable>
                            <PopoverTrigger render={<Button glyph={placementGlyph(p)} aria-label={p} title={p} />} />
                            <PopoverBody aria-label={p} minWidth="9rem" minHeight="9rem">
                                <div className="p-4">{p}</div>
                            </PopoverBody>
                        </Popover>
                    ))}
                </div>
            ))}
        </div>
    )
};

export const NoArrow: Story = {
    name: 'No arrow',
    parameters: {
        docs: {
            description: {
                story:
                    'Without an arrow (the default) the body touches the trigger and has the lighter shadow. Any focusable ' +
                    'element can be a trigger: an icon or an avatar with `nativeButton={false}`.'
            }
        }
    },
    render: () => (
        <div className="flex items-center justify-center gap-10 py-40">
            {(
                [
                    ['left', 'cart', 'Cart'],
                    ['top', 'person-placeholder', 'Photo'],
                    ['bottom', 'money-bills', 'Money bills'],
                    ['right', 'menu2', 'Menu']
                ] as const
            ).map(([placement, glyph, label]) => (
                <Popover key={placement} placement={placement}>
                    {glyph === 'cart' || glyph === 'menu2' ? (
                        <PopoverTrigger
                            nativeButton={false}
                            aria-label={label}
                            className="focus-visible:outline-sap"
                            render={<span />}
                        >
                            <Icon glyph={glyph} size="lg" />
                        </PopoverTrigger>
                    ) : (
                        avatarTrigger(glyph, label)
                    )}
                    <PopoverBody aria-label={label}>
                        <div className="p-4">Option 1</div>
                    </PopoverBody>
                </Popover>
            ))}
        </div>
    )
};

export const FixedPosition: Story = {
    name: 'Fixed position',
    parameters: {
        docs: {
            description: {
                story:
                    "`fixedPosition` (fundamental-react's `disableEdgeDetection`) keeps the placement even when the body " +
                    'does not fit, so it does not flip while the page scrolls.'
            }
        }
    },
    render: () => (
        <div className="flex gap-4">
            <Popover placement="top" fixedPosition noArrow={false}>
                <PopoverTrigger
                    render={<Button variant="transparent" glyph="navigation-up-arrow" aria-label="Above" />}
                />
                <PopoverBody aria-label="Above">
                    <div className="p-4">Always above the trigger</div>
                </PopoverBody>
            </Popover>
            <Popover placement="bottom" fixedPosition noArrow={false}>
                <PopoverTrigger
                    render={<Button variant="transparent" glyph="navigation-down-arrow" aria-label="Below" />}
                />
                <PopoverBody aria-label="Below">
                    <div className="p-4">Always below the trigger</div>
                </PopoverBody>
            </Popover>
        </div>
    )
};

function FlipContainerExample() {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <div className="flex items-center gap-4">
            <div className="h-32 w-44 bg-sap-neutral-background" />
            <div
                ref={setBox}
                className="border border-sap-group-content-border-color pt-[13.75rem] pe-[8.75rem] pb-[15.625rem] ps-10"
            >
                <Popover placement="bottom" noArrow={false} collisionBoundary={box ?? undefined}>
                    <PopoverTrigger
                        render={<Button variant="transparent" glyph="navigation-up-arrow" aria-label="Open" />}
                    />
                    <PopoverBody aria-label="Options">
                        <div className="p-4">Flips inside the bordered box</div>
                    </PopoverBody>
                </Popover>
            </div>
        </div>
    );
}

export const CustomFlipContainer: Story = {
    name: 'Custom flip container',
    parameters: {
        docs: {
            description: {
                story:
                    "`collisionBoundary` (fundamental-react's `flipContainer`) is the area the body must fit in before " +
                    'it flips; here the bordered box instead of the viewport.'
            }
        }
    },
    render: () => <FlipContainerExample />
};

function ProgrammaticExample() {
    const [open, setOpen] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const add = (entry: string) => setLog((l) => [`${new Date().toLocaleTimeString()} ${entry}`, ...l].slice(0, 6));
    return (
        <>
            <div className="flex flex-wrap items-center gap-4">
                <Popover
                    open={open}
                    onOpenChange={(next, details) => {
                        add(`onOpenChange: ${next} (${details.reason})`);
                        setOpen(next);
                    }}
                    triggers={[]}
                    closeOnOutsideClick={false}
                    noArrow={false}
                    placement="bottom"
                    disabled={disabled}
                >
                    {avatarTrigger('person-placeholder', 'Photo')}
                    <PopoverBody aria-label="Group">{GROUP}</PopoverBody>
                </Popover>
                <Button label="Open Popover" onClick={() => setOpen(true)} disabled={disabled} />
                <Button label="Close Popover" onClick={() => setOpen(false)} disabled={disabled} />
                <Button variant="transparent" label="Toggle Disabled" onClick={() => setDisabled(!disabled)} />
            </div>
            <ul className="mt-4 text-sap-font-small-size text-sap-content-label-color">
                {log.length ? log.map((entry, i) => <li key={i}>{entry}</li>) : <li>No events yet.</li>}
            </ul>
        </>
    );
}

export const Programmatic: Story = {
    name: 'Programmatic control',
    parameters: {
        docs: {
            description: {
                story:
                    '`open` with `onOpenChange` controls the popover; `triggers={[]}` leaves opening to the app. ' +
                    '`disabled` blocks opening and disables the trigger.'
            }
        }
    },
    render: () => <ProgrammaticExample />
};

export const Triggers: Story = {
    name: 'Trigger events',
    parameters: {
        docs: {
            description: {
                story:
                    'A single trigger toggles. With several, even entries open and odd entries close; or pass ' +
                    '`{ trigger, openAction, closeAction }` objects. Hover opens at once and closes once the pointer ' +
                    'leaves the trigger and the body.'
            }
        }
    },
    render: () => (
        <div className="flex flex-wrap gap-4">
            <Popover triggers={['mouseenter', 'mouseleave']} focusAutoCapture={false}>
                <PopoverTrigger render={<Button label="Hover" />} />
                <PopoverBody aria-label="Hover">
                    <div className="p-4">Opens on hover.</div>
                </PopoverBody>
            </Popover>
            <Popover triggers={['focusin', 'focusout']} focusAutoCapture={false}>
                <PopoverTrigger render={<Button label="Focus" />} />
                <PopoverBody aria-label="Focus">
                    <div className="p-4">Opens on focus.</div>
                </PopoverBody>
            </Popover>
            <Popover triggers={[{ trigger: 'dblclick', openAction: true, closeAction: true }]}>
                <PopoverTrigger render={<Button label="Double click" />} />
                <PopoverBody aria-label="Double click">
                    <div className="p-4">Opens on double click.</div>
                </PopoverBody>
            </Popover>
        </div>
    )
};

const externalPopover = createPopoverHandle();

export const ExternalTrigger: Story = {
    name: 'External trigger',
    parameters: {
        docs: {
            description: {
                story:
                    'A handle from `createPopoverHandle()` connects a trigger rendered anywhere, with aria-haspopup, ' +
                    'aria-controls and aria-expanded; `handle.open(triggerId)` and `handle.close()` work from code.'
            }
        }
    },
    render: () => (
        <>
            <PopoverTrigger handle={externalPopover} render={<Button label="Popover Trigger" />} />
            <Popover handle={externalPopover}>
                <PopoverBody aria-label="Connected popover">
                    <div className="p-3">This popover is connected to the trigger element.</div>
                </PopoverBody>
            </Popover>
        </>
    )
};

export const FillControlMode: Story = {
    name: 'Fill control mode',
    parameters: {
        docs: {
            description: {
                story:
                    "`fillControlMode` sizes the body from the trigger: `equal` (fundamental-react's `matchTarget`), " +
                    "`at-least` (`minTarget`) or `fit-content` (`none`); the popover's `maxWidth` caps the width."
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-6">
            <div>
                <p className="mb-2">
                    <strong>Equal</strong>: the body is exactly as wide as the trigger.
                </p>
                <Popover triggers={['mouseenter', 'mouseleave']} fillControlMode="equal" focusAutoCapture={false}>
                    <PopoverTrigger
                        nativeButton={false}
                        render={<div className="border border-dashed border-sap-group-content-border-color p-6" />}
                    >
                        Control Element - Hover over me!
                    </PopoverTrigger>
                    <PopoverBody aria-label="Equal">
                        <div className="whitespace-normal p-3">
                            This popover matches the width of the control element.
                        </div>
                    </PopoverBody>
                </Popover>
            </div>
            <div>
                <p className="mb-2">
                    <strong>At least</strong>: at least as wide as the trigger, wider if the content needs it.
                </p>
                <Popover triggers={['mouseenter', 'mouseleave']} fillControlMode="at-least" focusAutoCapture={false}>
                    <PopoverTrigger
                        nativeButton={false}
                        render={
                            <div className="inline-block w-[200px] border border-dashed border-sap-group-content-border-color p-6" />
                        }
                    >
                        Narrow Control (200px)
                    </PopoverTrigger>
                    <PopoverBody aria-label="At least">
                        <div className="p-3">
                            This popover expands beyond the control because this content is wider.
                        </div>
                    </PopoverBody>
                </Popover>
            </div>
            <div>
                <p className="mb-2">
                    <strong>Max width</strong>: <code>maxWidth</code> limits the filled width.
                </p>
                <Popover
                    triggers={['mouseenter', 'mouseleave']}
                    fillControlMode="equal"
                    maxWidth={200}
                    focusAutoCapture={false}
                >
                    <PopoverTrigger
                        nativeButton={false}
                        render={
                            <div className="w-[400px] border border-dashed border-sap-group-content-border-color p-6" />
                        }
                    >
                        Wide Control Element (400px) - Hover over me!
                    </PopoverTrigger>
                    <PopoverBody aria-label="Max width">
                        <div className="whitespace-normal p-3">Popover limited to 200px despite wider control.</div>
                    </PopoverBody>
                </Popover>
            </div>
        </div>
    )
};

const closableBody = (label: string) => (
    <PopoverBody aria-label={label} minWidth="25rem">
        <PopoverBodyHeader>
            <HeaderBar title="Header" />
        </PopoverBodyHeader>
        <div className="p-4">
            <PopoverClose render={<Button label="Close" />} />
        </div>
    </PopoverBody>
);

export const Closing: Story = {
    name: 'Prevent closing',
    parameters: {
        docs: {
            description: {
                story:
                    'With `applyOverlay`, a popover that cannot be closed by outside click or Escape dims the page ' +
                    'behind it. `PopoverClose` closes it.'
            }
        }
    },
    render: () => (
        <div className="flex flex-wrap gap-4">
            <Popover closeOnOutsideClick={false} applyOverlay>
                <PopoverTrigger render={<Button label="Prevent Close on Outside Click" />} />
                {closableBody('Prevent close on outside click')}
            </Popover>
            <Popover closeOnEscapeKey={false} applyOverlay>
                <PopoverTrigger render={<Button label="Prevent Close on Escape Key" />} />
                {closableBody('Prevent close on Escape')}
            </Popover>
            <Popover closeOnEscapeKey={false} closeOnOutsideClick={false} applyOverlay>
                <PopoverTrigger render={<Button label="Prevent Close on Outside Click & on Escape Key" />} />
                {closableBody('Prevent close on outside click and Escape')}
            </Popover>
        </div>
    )
};

export const Focus: Story = {
    name: 'Focus handling',
    parameters: {
        docs: {
            description: {
                story:
                    'Focus moves into the body, is trapped there and returns to the trigger on close. Close buttons ' +
                    '(`PopoverClose`) in the header and footer close the popover; `focusTrapped`, `focusAutoCapture` ' +
                    'and `restoreFocusOnClose` can be turned off.'
            }
        }
    },
    render: () => (
        <div className="flex flex-wrap gap-4">
            <Popover>
                <PopoverTrigger render={<Button label="Trapped focus (default)" />} />
                <PopoverBody aria-label="Trapped focus">
                    <div className="flex gap-2 p-4">
                        <Button label="First" />
                        <Button label="Second" />
                    </div>
                </PopoverBody>
            </Popover>
            <Popover focusTrapped={false} focusAutoCapture={false}>
                <PopoverTrigger render={<Button label="Focus stays on trigger" />} />
                <PopoverBody aria-label="Focus stays on trigger">
                    <div className="flex gap-2 p-4">
                        <Button label="First" />
                        <Button label="Second" />
                    </div>
                </PopoverBody>
            </Popover>
            <Popover>
                <PopoverTrigger render={<Button label="Header and footer" />} />
                <PopoverBody aria-label="Header" minWidth="25rem">
                    <PopoverBodyHeader>
                        <HeaderBar
                            title="Header"
                            back={
                                <PopoverClose
                                    render={
                                        <Button variant="transparent" glyph="navigation-left-arrow" aria-label="Back" />
                                    }
                                />
                            }
                        />
                    </PopoverBodyHeader>
                    {GROUP}
                    <PopoverBodyFooter>
                        <FooterBar>
                            <PopoverClose render={<Button variant="emphasized" label="Save" />} />
                            <PopoverClose render={<Button variant="transparent" label="Cancel" />} />
                        </FooterBar>
                    </PopoverBodyFooter>
                </PopoverBody>
            </Popover>
            <Popover restoreFocusOnClose={false}>
                <PopoverTrigger render={<Button label="No restore focus" />} />
                <PopoverBody aria-label="No restore focus">
                    <div className="p-4">
                        <PopoverClose render={<Button variant="transparent" label="Close me" />} />
                    </div>
                </PopoverBody>
            </Popover>
        </div>
    )
};

export const NonDialog: Story = {
    name: 'Body roles',
    parameters: {
        docs: {
            description: {
                story: 'The body is a dialog by default; set `role` for menus, listboxes or regions.'
            }
        }
    },
    render: () => (
        <Popover focusTrapped={false}>
            <PopoverTrigger render={<Button label="Region popover" />} />
            <PopoverBody role="region" aria-label="Details">
                <div className="p-4">A non-modal region with details.</div>
            </PopoverBody>
        </Popover>
    )
};

export const Nested: Story = {
    name: 'Popover inside popover',
    render: () => (
        <Popover>
            <PopoverTrigger render={<Button label="Open first" />} />
            <PopoverBody aria-label="First level">
                <div className="p-4">
                    <Popover placement="right-start">
                        <PopoverTrigger render={<Button label="Open second" />} />
                        <PopoverBody aria-label="Second level">
                            <div className="p-4">Second level</div>
                        </PopoverBody>
                    </Popover>
                </div>
            </PopoverBody>
        </Popover>
    )
};

export const ScrollContainer: Story = {
    name: 'Inside a scroll container',
    parameters: {
        docs: {
            description: {
                story:
                    'The body follows its trigger while a container (or the page) scrolls, and flips when it runs out ' +
                    'of room (fundamental-react\'s "out of boundaries").'
            }
        }
    },
    render: () => (
        <div
            tabIndex={0}
            role="region"
            aria-label="Items"
            className="scrollbar-sap h-64 w-80 overflow-auto border border-sap-group-content-border-color p-4"
        >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((i) => (
                <div key={i} className="py-2">
                    <Popover placement="right">
                        <PopoverTrigger render={<Button label={`Item ${i}`} />} />
                        <PopoverBody aria-label={`Item ${i}`}>
                            <div className="p-3">Details of item {i}</div>
                        </PopoverBody>
                    </Popover>
                </div>
            ))}
        </div>
    )
};

function DynamicExample() {
    const [items, setItems] = useState(['One']);
    return (
        <Popover>
            <PopoverTrigger render={<Button label="Dynamic" />} />
            <PopoverBody aria-label="Dynamic content">
                <div className="flex flex-col gap-2 p-4">
                    {items.map((item, i) => (
                        <span key={i}>{item}</span>
                    ))}
                    <Button label="Add line" onClick={() => setItems([...items, `Line ${items.length + 1}`])} />
                </div>
            </PopoverBody>
        </Popover>
    );
}

export const Dynamic: Story = {
    name: 'Dynamic content',
    render: () => <DynamicExample />
};

export const Text: Story = {
    name: 'Text only',
    render: () => (
        <Popover focusAutoCapture={false}>
            <PopoverTrigger render={<Button label="Text popover" />} />
            <PopoverBody aria-label="Text">
                <div className="p-4">A popover with plain text content.</div>
            </PopoverBody>
        </Popover>
    )
};

export const InDialog: Story = {
    name: 'In a dialog',
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 400 },
            description: { story: 'A popover inside a dialog: Escape closes the popover first, then the dialog.' }
        }
    },
    render: () => (
        <Dialog>
            <DialogTrigger render={<Button label="Open Dialog" />} />
            <DialogPopup width="25rem">
                <DialogHeader>
                    <DialogTitle level={1}>Popover Example</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <Popover noArrow={false}>
                        <PopoverTrigger render={<Button label="Click me!" />} />
                        <PopoverBody aria-label="Button details">
                            <div className="p-3">This is the button&apos;s popover!</div>
                        </PopoverBody>
                    </Popover>
                    <p className="mt-4 mb-0">Escape closes the popover first, and the dialog only on a second press.</p>
                </DialogBody>
            </DialogPopup>
        </Dialog>
    )
};

function AnchorExample() {
    const [target, setTarget] = useState<HTMLDivElement | null>(null);
    return (
        <>
            <div className="p-10 text-center">
                <Popover anchor={target}>
                    <PopoverTrigger render={<Button label="Trigger" />} />
                    <PopoverBody aria-label="Positioned against the container">
                        <div className="p-3">This popover is positioned relative to the container below</div>
                    </PopoverBody>
                </Popover>
            </div>
            <div ref={setTarget} className="border border-dashed border-sap-group-content-border-color p-2">
                Container (anchor)
            </div>
        </>
    );
}

export const AppendTo: Story = {
    name: 'Anchor',
    parameters: {
        docs: {
            description: { story: "`anchor` (Angular's `appendTo`) positions the body against another element." }
        }
    },
    render: () => <AnchorExample />
};

const OFFSET_PRESETS: Record<string, Pick<PopoverProps, 'placement' | 'sideOffset' | 'alignOffset'>> = {
    'Right, centred': { placement: 'right' },
    'Above, end-aligned': { placement: 'top-end' },
    'Over the trigger': { placement: 'bottom-start', sideOffset: ({ anchor }) => -anchor.height },
    'Below, 16px offset': { placement: 'bottom', sideOffset: 16 }
};

function OffsetsExample() {
    const names = Object.keys(OFFSET_PRESETS);
    const [preset, setPreset] = useState(names[0]!);
    return (
        <>
            <div className="flex flex-wrap gap-2">
                {names.map((name) => (
                    <Button key={name} label={name} toggled={name === preset} onClick={() => setPreset(name)} />
                ))}
            </div>
            <div className="flex h-72 items-center justify-center">
                <Popover {...OFFSET_PRESETS[preset]} noArrow={preset === 'Over the trigger'} focusAutoCapture={false}>
                    <PopoverTrigger render={<Button glyph="navigation-up-arrow" aria-label="Trigger" />} />
                    <PopoverBody aria-label="Positioned popover">{GROUP}</PopoverBody>
                </Popover>
            </div>
        </>
    );
}

export const Offsets: Story = {
    name: 'Offsets',
    parameters: {
        docs: {
            description: {
                story:
                    '`placement` with `sideOffset` and `alignOffset` (numbers, or functions of the trigger and body ' +
                    "sizes) take the place of Angular's exact CDK positions; the body still flips when it does not fit."
            }
        }
    },
    render: () => <OffsetsExample />
};

export const Dropdown: Story = {
    parameters: {
        docs: { description: { story: 'A button with the menu arrow (`menu`) opens a dropdown popover.' } }
    },
    render: () => (
        <div className="flex flex-wrap gap-4">
            <Popover>
                <PopoverTrigger render={<Button label="Dropdown Popover" menu />} />
                <PopoverBody aria-label="Dropdown">{GROUP}</PopoverBody>
            </Popover>
            <Popover disabled>
                <PopoverTrigger render={<Button label="Disabled Dropdown Popover" menu />} />
                <PopoverBody aria-label="Dropdown">{GROUP}</PopoverBody>
            </Popover>
            <Popover>
                <PopoverTrigger render={<Button label="Dropdown with icon" glyph="filter" menu />} />
                <PopoverBody aria-label="Filter">{GROUP}</PopoverBody>
            </Popover>
        </div>
    )
};

export const Resizable: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Drag the corner handle to resize the body; `minWidth`, `minHeight`, `maxWidth` and `maxHeight` on ' +
                    'the body set its limits.'
            }
        }
    },
    render: () => (
        <Popover placement="bottom-start" resizable>
            <PopoverTrigger render={<Button label="Open resizable popover" />} />
            <PopoverBody
                aria-label="Resizable content area"
                minWidth="18rem"
                minHeight="10rem"
                maxWidth="32rem"
                maxHeight="24rem"
            >
                <div className="flex flex-col items-start gap-3 whitespace-normal p-4">
                    <Title level={4}>Resizable content area</Title>
                    <p className="m-0">
                        Drag the resize handle to make room for longer content, tables, previews, or forms while keeping
                        the popover within its configured limits.
                    </p>
                </div>
                <PopoverBodyFooter>
                    <FooterBar>
                        <Button variant="emphasized" label="Save changes" />
                    </FooterBar>
                </PopoverBodyFooter>
            </PopoverBody>
        </Popover>
    )
};

/** Open bodies rendered inside the story, as fundamental-styles shows them; the visual reference cases. */
function BodyVariantsExample() {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    const open = (placement: Placement, label: string, extra: Partial<PopoverProps> = {}) => (
        <Popover defaultOpen placement={placement} focusAutoCapture={false} closeOnOutsideClick={false} {...extra}>
            <PopoverTrigger render={<Button glyph={placementGlyph(placement)} aria-label={label} />} />
            {box && (
                <PopoverBody aria-label={label} container={box} data-variant={label}>
                    <div className="p-4">{label}</div>
                </PopoverBody>
            )}
        </Popover>
    );
    return (
        <div ref={setBox} className="relative flex flex-col gap-[10rem] px-24 py-[6rem]">
            <div className="flex justify-between">
                {open('bottom-start', 'No arrow')}
                {open('bottom-start', 'Arrow top', { noArrow: false })}
                {open('top-start', 'Arrow bottom', { noArrow: false })}
                {open('right-start', 'Arrow left', { noArrow: false })}
                {open('left-start', 'Arrow right', { noArrow: false })}
            </div>
            <div className="flex justify-between">
                {open('bottom-start', 'Resizable', { noArrow: false, resizable: true })}
                {open('top-start', 'Resizable above', { noArrow: false, resizable: true })}
            </div>
        </div>
    );
}

export const BodyVariants: Story = {
    name: 'Body variants',
    parameters: {
        docs: {
            description: {
                story:
                    'Open bodies rendered into a container of the page (`container`): without arrow, with the arrow on ' +
                    'each side, and resizable below and above the trigger.'
            }
        }
    },
    render: () => <BodyVariantsExample />
};

/** Clicks a trigger and waits until its body is open. */
async function openPopover(trigger: HTMLElement): Promise<void> {
    await userEvent.click(trigger);
    await waitFor(() => {
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(document.getElementById(trigger.getAttribute('aria-controls') ?? '')).not.toBeNull();
    });
}
const triggers = (root: ParentNode) => [...root.querySelectorAll<HTMLElement>('[aria-haspopup]')];

export const OpenSimple: Story = {
    name: 'Open: simple',
    tags: ['!autodocs'],
    render: Simple.render,
    play: ({ canvasElement }) => openPopover(triggers(canvasElement)[0]!)
};
export const OpenHeaderFooter: Story = {
    name: 'Open: header and footer',
    tags: ['!autodocs'],
    render: Simple.render,
    play: ({ canvasElement }) => openPopover(triggers(canvasElement)[2]!)
};
export const OpenNonDialog: Story = {
    name: 'Open: body roles',
    tags: ['!autodocs'],
    render: NonDialog.render,
    play: ({ canvasElement }) => openPopover(triggers(canvasElement)[0]!)
};
export const OpenNested: Story = {
    name: 'Open: popover inside popover',
    tags: ['!autodocs'],
    render: Nested.render,
    play: async ({ canvasElement }) => {
        const first = triggers(canvasElement)[0]!;
        await openPopover(first);
        const body = document.getElementById(first.getAttribute('aria-controls')!)!;
        await openPopover(triggers(body)[0]!);
    }
};
export const OpenInDialog: Story = {
    name: 'Open: in a dialog',
    tags: ['!autodocs'],
    render: InDialog.render,
    play: async ({ canvasElement }) => {
        await userEvent.click(canvasElement.querySelector<HTMLElement>('button')!);
        const trigger = () => document.querySelector<HTMLElement>('[role=dialog] [aria-haspopup]');
        await waitFor(() => expect(trigger()).not.toBeNull());
        await openPopover(trigger()!);
    }
};
export const OpenResizable: Story = {
    name: 'Open: resizable',
    tags: ['!autodocs'],
    render: Resizable.render,
    play: ({ canvasElement }) => openPopover(triggers(canvasElement)[0]!)
};
export const OpenDropdown: Story = {
    name: 'Open: dropdown',
    tags: ['!autodocs'],
    render: Dropdown.render,
    play: ({ canvasElement }) => openPopover(triggers(canvasElement)[2]!)
};
export const OpenPrevent: Story = {
    name: 'Open: prevent closing',
    tags: ['!autodocs'],
    render: Closing.render,
    play: ({ canvasElement }) => openPopover(triggers(canvasElement)[2]!)
};
