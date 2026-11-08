import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button, type ButtonVariant } from '@/ui/button/button';
import { Icon } from '@/ui/icon/icon';
import { MenuItem } from '@/ui/menu/menu';
import { Title } from '@/ui/title/title';
import { SplitButton, type SplitButtonProps } from './split-button';

const meta = {
    title: 'Components/Split Button',
    component: SplitButton,
    parameters: {
        docs: {
            description: {
                component:
                    'A split button runs its main action, or opens a menu of alternatives from the arrow (click, ' +
                    'Enter, Space, ArrowDown, or Alt+ArrowDown from either button). The chosen alternative becomes ' +
                    'the main action unless `mainAction.keepMainAction` is set; without a `mainAction` the first ' +
                    'item is the main action. `fixedWidth` keeps the main button width. The menu items are the ' +
                    'children (`MenuItem`s); the main button calls the `onClick` of the item it shows.\n\n' +
                    '```tsx\n' +
                    '<SplitButton variant="emphasized" onPrimaryButtonClick={log}>\n' +
                    '    <MenuItem onClick={save}>Save</MenuItem>\n' +
                    '    <MenuItem onClick={saveAs}>Save as</MenuItem>\n' +
                    '</SplitButton>\n' +
                    '```'
            }
        }
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['standard', 'emphasized', 'ghost', 'positive', 'negative', 'attention', 'transparent']
        }
    },
    args: {
        variant: 'standard',
        disabled: false,
        fixedWidth: true,
        expandButtonAriaLabel: 'More actions',
        'aria-label': 'Split button'
    },
    render: (args) => (
        <SplitButton {...args}>
            <MenuItem>Option 1</MenuItem>
            <MenuItem>Option 2 with long text</MenuItem>
            <MenuItem>Option 3</MenuItem>
        </SplitButton>
    )
} satisfies Meta<SplitButtonProps>;
export default meta;
type Story = StoryObj<typeof meta>;

const TEXT = 'm-0 font-sap-font-family text-sap-font-size text-sap-text-color';

function Heading({ children }: { children: ReactNode }) {
    return (
        <Title level={3} headerSize={6} className="mt-4 mb-1 first:mt-0">
            {children}
        </Title>
    );
}

/** The last action, announced politely. */
function useLog(): [ReactNode, (text: string) => void] {
    const [last, setLast] = useState('');
    return [
        <p key="log" className={TEXT} aria-live="polite">
            {last}
        </p>,
        setLast
    ];
}

/** The items of a split button, each logging its click. */
const options = (log: (text: string) => void, names = ['Option 1', 'Option 2']) =>
    names.map((name) => (
        <MenuItem key={name} onClick={() => log(`${name} clicked`)}>
            {name}
        </MenuItem>
    ));

export const Playground: Story = {};

/** In the order and with the texts of fundamental-styles' story, for the visual comparison. */
const VARIANTS: [ButtonVariant, string][] = [
    ['emphasized', 'Emphasized'],
    ['standard', 'Standard'],
    ['transparent', 'Transparent'],
    ['ghost', 'Ghost'],
    ['positive', 'Positive'],
    ['negative', 'Negative'],
    ['attention', 'Attention']
];

function TypesExample() {
    const [log, setLast] = useLog();
    return (
        <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap items-center gap-2">
                {VARIANTS.map(([variant, label]) => (
                    <SplitButton key={variant} variant={variant} aria-label={`${label} split button`}>
                        {options(setLast, [label, 'Option 2'])}
                    </SplitButton>
                ))}
            </div>
            {log}
        </div>
    );
}

export const Types: Story = {
    name: 'Types',
    parameters: {
        docs: { description: { story: 'The seven button types; the first option is the main action.' } }
    },
    render: () => <TypesExample />
};

function BehaviorsExample() {
    const [log, setLast] = useLog();
    const callback = () => setLast('Main action callback');
    return (
        <div className="flex flex-col items-start gap-2">
            <Heading>Default: the chosen option becomes the main action</Heading>
            <SplitButton aria-label="Default" onPrimaryButtonClick={() => setLast('Main button clicked')}>
                {options(setLast)}
            </SplitButton>
            <Heading>Additional main action until an option is chosen</Heading>
            <SplitButton
                aria-label="Additional main action"
                mainAction={{ mainActionTitle: 'Main action', callback }}
                onPrimaryButtonClick={() => setLast('Main button clicked')}
            >
                {options(setLast, ['Option 1', 'Option 2 with long text'])}
            </SplitButton>
            <Heading>Constant main action</Heading>
            <SplitButton
                aria-label="Constant main action"
                mainAction={{ mainActionTitle: 'Primary button', keepMainAction: true, callback }}
            >
                {options(setLast, ['Option 1', 'Option 2 with long text'])}
            </SplitButton>
            <Heading>Flexible width</Heading>
            <SplitButton aria-label="Flexible width" fixedWidth={false}>
                {options(setLast, ['Option 1', 'Option 2 with long text'])}
            </SplitButton>
            <Heading>Disabled</Heading>
            <SplitButton aria-label="Disabled" disabled>
                {options(setLast)}
            </SplitButton>
            {log}
        </div>
    );
}

export const Behaviors: Story = {
    name: 'Main action behaviours',
    render: () => <BehaviorsExample />
};

function TemplateExample() {
    const [log, setLast] = useLog();
    return (
        <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap items-center gap-2">
                <SplitButton
                    aria-label="Template action"
                    mainAction={{
                        mainActionTitle: (
                            <>
                                Template <Icon glyph="home" className="mx-2" /> action
                            </>
                        ),
                        callback: () => setLast('Template action clicked')
                    }}
                >
                    {options(setLast)}
                </SplitButton>
                <SplitButton
                    aria-label="Document actions"
                    glyph="menu"
                    expandButtonTitle="Show the actions"
                    variant="transparent"
                >
                    <MenuItem addonBefore="save" onClick={() => setLast('Save clicked')}>
                        Save
                    </MenuItem>
                    <MenuItem addonBefore="print" onClick={() => setLast('Print clicked')}>
                        Print
                    </MenuItem>
                </SplitButton>
            </div>
            {log}
        </div>
    );
}

export const Template: Story = {
    name: 'Content title and custom arrow',
    parameters: {
        docs: {
            description: {
                story:
                    "`mainAction.mainActionTitle` takes any content (Angular's `fd-split-button-action-title` " +
                    'template); `glyph` and `expandButtonTitle` change the arrow button.'
            }
        }
    },
    render: () => <TemplateExample />
};

function ProgrammaticExample() {
    const [selected, setSelected] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    return (
        <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap items-center gap-3">
                <SplitButton
                    aria-label="Programmatic"
                    mainAction={{ mainActionTitle: 'Action button' }}
                    selected={selected}
                    onSelectedChange={setSelected}
                    open={open}
                    onOpenChange={setOpen}
                    menuProps={{ closeOnOutsideClick: false }}
                >
                    <MenuItem id="story-option-1">Option 1</MenuItem>
                    <MenuItem id="story-option-2">Option 2</MenuItem>
                </SplitButton>
                <Button label="Open" onClick={() => setOpen(true)} />
                <Button label="Close" onClick={() => setOpen(false)} />
                <Button label="Select Option 1" onClick={() => setSelected('story-option-1')} />
                <Button label="Select Option 2" onClick={() => setSelected('story-option-2')} />
            </div>
            <p className={TEXT}>selected: {selected ?? 'none'}</p>
        </div>
    );
}

export const Programmatic: Story = {
    name: 'Programmatic selection and open / close',
    parameters: {
        docs: {
            description: {
                story:
                    '`selected` (the `id` of a `MenuItem`) with `onSelectedChange`, and `open` with `onOpenChange`, ' +
                    'driven by the buttons next to it.'
            }
        }
    },
    render: () => <ProgrammaticExample />
};

/** Opens the menu of the first split button of the story. */
async function openMenu(canvasElement: HTMLElement): Promise<void> {
    const arrow = canvasElement.querySelector<HTMLElement>('[role=group] > button[aria-haspopup=menu]')!;
    await userEvent.click(arrow);
    await waitFor(() => expect(arrow.getAttribute('aria-expanded')).toBe('true'));
    await waitFor(() => expect(document.querySelector('[role=menu] [role=menuitem]')).not.toBeNull());
}

export const OpenMenu: Story = {
    name: 'Open: menu',
    tags: ['!autodocs'],
    render: () => <TypesExample />,
    play: ({ canvasElement }) => openMenu(canvasElement)
};
