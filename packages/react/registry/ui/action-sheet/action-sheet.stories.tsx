import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { PLACEMENTS } from '@/ui/popover/popover';
import {
    ActionSheet,
    ActionSheetBody,
    ActionSheetControl,
    ActionSheetItem,
    type ActionSheetProps
} from './action-sheet';

const TEXT = 'font-sap-font-family text-sap-font-size text-sap-text-color';

const meta = {
    title: 'Components/Action Sheet',
    component: ActionSheet,
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 420 },
            description: {
                component:
                    'An action sheet lists the actions for the control that opens it: in a popover, or in mobile mode in a ' +
                    'sheet at the bottom of the screen. ArrowUp/ArrowDown, Home and End move between the actions; Escape and ' +
                    'Tab close it and the focus returns to the control. Close buttons close it when chosen.'
            }
        }
    },
    argTypes: {
        placement: { control: 'select', options: PLACEMENTS },
        controlTitleHeading: { control: 'select', options: [1, 2, 3, 4, 5, 6] }
    },
    args: {
        mobile: false,
        placement: 'bottom',
        noArrow: false,
        controlTitle: 'Choose an action',
        controlTitleHeading: 2
    }
} satisfies Meta<typeof ActionSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Mirrors Angular's story component: a settings button, four actions and a close button (and Cancel on phones). */
function Example(props: ActionSheetProps) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState('');
    const picked = (action: string) => {
        setLast(`${action} action performed`);
        setOpen(false);
    };
    return (
        <>
            <div className="relative">
                <ActionSheet controlTitle="Choose an action" {...props} open={open} onOpenChange={setOpen}>
                    <ActionSheetControl
                        id={`${id}-control`}
                        title="Open action sheet"
                        render={
                            <Button
                                glyph="settings"
                                aria-label={props.mobile ? 'Open action sheet (mobile)' : 'Open action sheet'}
                            />
                        }
                    />
                    <ActionSheetBody aria-labelledby={`${id}-control`}>
                        <ActionSheetItem label="Search" glyph="search" onClick={() => picked('Search')} />
                        <ActionSheetItem label="Download" glyph="download" onClick={() => picked('Download')} />
                        <ActionSheetItem label="Accept" glyph="accept" onClick={() => picked('Accept')} />
                        <ActionSheetItem label="Reject" glyph="cancel" disabled />
                        <ActionSheetItem label="Decide later" isCloseButton />
                        {props.mobile && <ActionSheetItem label="Cancel" negative isCloseButton />}
                    </ActionSheetBody>
                </ActionSheet>
            </div>
            <p className={TEXT} aria-live="polite">
                {last}
            </p>
        </>
    );
}

export const Playground: Story = {
    render: (args) => <Example {...args} />
};

export const Default: Story = {
    name: 'Action sheet',
    parameters: {
        docs: { description: { story: 'The actions in a popover below the control, with an arrow.' } }
    },
    render: () => <Example />
};

export const Mobile: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'On phones the actions open in a sheet at the bottom of the screen, over a block layer, with the ' +
                    '`controlTitle` in a bar above them and a negative Cancel action at the end. A click on the block ' +
                    'layer closes it.'
            }
        }
    },
    render: () => <Example mobile />
};

/** The texts and glyphs of fundamental-styles' stories, for the visual comparison. */
function FsItems({ mobile = false }: { mobile?: boolean }) {
    return (
        <>
            <ActionSheetItem label="Upload file" glyph="attachment" />
            <ActionSheetItem label="Assign user" glyph="add" />
            <ActionSheetItem label="Print" glyph="print" />
            <ActionSheetItem label="Download" glyph="download" />
            <ActionSheetItem label="Decide Later" isCloseButton />
            {mobile && <ActionSheetItem label="Cancel" negative isCloseButton />}
        </>
    );
}

function InPageExample() {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <div ref={setBox} className="relative h-[20rem]">
            {/* kept open (controlled, changes ignored), so the visual cases can focus and hover each action */}
            <ActionSheet open onOpenChange={() => undefined} placement="bottom-start">
                <ActionSheetControl
                    render={<Button variant="transparent" glyph="settings" aria-label="More Options" />}
                />
                {box && (
                    <ActionSheetBody
                        container={box}
                        // no focus on opening, so the visual cases can show each state
                        initialFocus={false}
                        aria-label="List of contextual options"
                        data-variant="popover"
                    >
                        <FsItems />
                    </ActionSheetBody>
                )}
            </ActionSheet>
        </div>
    );
}

export const InPage: Story = {
    name: 'Open in the page',
    tags: ['!autodocs'],
    parameters: {
        docs: {
            description: {
                story: 'An action sheet kept open in a container of the page (`container`), the visual reference case.'
            }
        }
    },
    render: () => <InPageExample />
};

function PhoneFrameExample() {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        // a transformed frame is the containing block of the fixed sheet: a 350 × 600 phone screen
        <div ref={setBox} className="relative h-[600px] w-[350px] [transform:translateZ(0)]">
            <ActionSheet
                open
                onOpenChange={() => undefined}
                mobile
                controlTitle="Control Title"
                controlTitleHeading={6}
            >
                <ActionSheetControl
                    render={<Button variant="transparent" glyph="settings" aria-label="More Options" />}
                />
                {box && (
                    <ActionSheetBody container={box} aria-label="List of contextual options" data-variant="mobile">
                        <FsItems mobile />
                    </ActionSheetBody>
                )}
            </ActionSheet>
        </div>
    );
}

export const PhoneFrame: Story = {
    name: 'Mobile in a phone frame',
    tags: ['!autodocs'],
    parameters: {
        docs: {
            description: {
                story: 'A mobile action sheet kept open in a 350 × 600 frame (`container`), the visual reference case.'
            }
        }
    },
    render: () => <PhoneFrameExample />
};

/** Clicks the control and waits until the actions are open and the first one has the focus. */
async function openSheet(canvas: HTMLElement): Promise<void> {
    const control = canvas.querySelector<HTMLElement>('[aria-haspopup]')!;
    await userEvent.click(control);
    await waitFor(() => {
        expect(control.getAttribute('aria-expanded')).toBe('true');
        expect(document.activeElement?.getAttribute('role')).toBe('menuitem');
    });
}

export const OpenDefault: Story = {
    name: 'Open: action sheet',
    tags: ['!autodocs'],
    render: Default.render,
    play: ({ canvasElement }) => openSheet(canvasElement)
};

export const OpenMobile: Story = {
    name: 'Open: mobile',
    tags: ['!autodocs'],
    render: Mobile.render,
    play: ({ canvasElement }) => openSheet(canvasElement)
};
