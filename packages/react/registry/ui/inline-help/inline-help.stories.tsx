import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { Input } from '@/ui/input/input';
import type { Placement } from '@/ui/popover/popover';
import { InlineHelp } from './inline-help';

const meta = {
    title: 'Components/Inline Help',
    component: InlineHelp,
    parameters: {
        docs: {
            description: {
                component:
                    'Inline help explains a field or control in a small popover that opens on hover and focus, on ' +
                    'Base UI’s Tooltip with the SAP popover surface. The help text is also available to screen ' +
                    'readers through `aria-describedby`.'
            }
        }
    },
    args: {
        content: 'Inline Help Tooltip',
        placement: 'bottom',
        noArrow: false,
        disabled: false,
        closeOnEscapeKey: false,
        closeOnOutsideClick: false
    }
} satisfies Meta<typeof InlineHelp>;
export default meta;
type Story = StoryObj<typeof meta>;

const item = 'flex items-center gap-2 py-3';

export const Playground: Story = {
    render: (args) => (
        <div className={item}>
            <span>Playground</span>
            <InlineHelp {...args} />
        </div>
    )
};

function PlacementsExample() {
    return (
        <div className="flex flex-col">
            <div className={item}>
                <span>Default</span>
                <InlineHelp content="Inline Help Tooltip" />
            </div>
            <div className={item}>
                <span>Left Position</span>
                <InlineHelp content="Inline Help Tooltip" placement="left" />
            </div>
            <div className={item}>
                <span>Right Position</span>
                <InlineHelp content="Inline Help Tooltip" placement="right" />
            </div>
            <div className={item}>
                <span>Top Position</span>
                <InlineHelp content="Inline Help Tooltip" placement="top" />
            </div>
            <div className={item}>
                <span>Bottom Position</span>
                <InlineHelp
                    placement="bottom"
                    content="Inline Help Tooltip Lorem ipsum, dolor sit amet consectetur adipisicing elit. Officia vitae ipsum facilis quasi similique! Aperiam incidunt perspiciatis quam architecto."
                />
            </div>
            <div className={`${item} max-w-sm`}>
                <InlineHelp
                    content="Inline Help Tooltip"
                    placement="right"
                    render={<Input placeholder="Inline help inside input" aria-label="Field with inline help" />}
                />
            </div>
            <div className={item}>
                <span>Disabled</span>
                <InlineHelp content="Inline Help Tooltip" disabled />
            </div>
            <div className={item}>
                <span>Close on Escape</span>
                <InlineHelp content="Inline Help Tooltip" closeOnEscapeKey />
            </div>
        </div>
    );
}

export const Default: Story = {
    name: 'Placements and states',
    parameters: {
        docs: {
            description: {
                story:
                    'A question-mark icon trigger on each side, a long text that wraps, an input as the trigger, a ' +
                    'disabled help, and a help that closes on Escape.'
            }
        }
    },
    render: () => <PlacementsExample />
};

/** Waits until the help body with the text is shown. */
async function waitForHelp(text: string): Promise<void> {
    await waitFor(() => expect(document.querySelector('[role=tooltip]')?.textContent).toContain(text));
}

export const OpenDefault: Story = {
    name: 'Open: Inline help',
    tags: ['!autodocs'],
    render: () => <PlacementsExample />,
    play: async ({ canvasElement }) => {
        // focus opens the help of the first trigger
        canvasElement.querySelector<HTMLElement>('[data-slot=inline-help]')!.focus();
        await waitForHelp('Inline Help Tooltip');
    }
};

const richContent = (
    <span>
        Help with <b>bold</b> text and a list:
        <ul className="list-disc ps-4">
            <li>First</li>
            <li>Second</li>
        </ul>
    </span>
);

export const Template: Story = {
    name: 'Template content',
    parameters: {
        docs: { description: { story: 'Rich content (Angular’s template) in the help body.' } }
    },
    render: () => (
        <div className={item}>
            <span>Rich help</span>
            <InlineHelp content={richContent} />
        </div>
    )
};

export const OpenTemplate: Story = {
    name: 'Open: Template content',
    tags: ['!autodocs'],
    render: Template.render,
    play: async ({ canvasElement }) => {
        canvasElement.querySelector<HTMLElement>('[data-slot=inline-help]')!.focus();
        await waitForHelp('Second');
    }
};

export const Triggers: Story = {
    name: 'Custom triggers',
    parameters: {
        docs: {
            description: {
                story:
                    'Help that toggles on click, on an icon and on a button; the button’s help also closes on a ' +
                    'press outside.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
                <span>Click</span>
                <InlineHelp content="Inline Help Tooltip" triggers={['click']} />
            </div>
            <InlineHelp
                content="Inline Help Tooltip"
                triggers={['click']}
                closeOnOutsideClick
                render={<Button label="Click on me, to display inline help" />}
            />
        </div>
    )
};

export const Styled: Story = {
    name: 'Custom body class',
    parameters: {
        docs: { description: { story: 'Another background for the help body (`bodyClassName`).' } }
    },
    render: () => (
        <InlineHelp content="Inline Help Tooltip" bodyClassName="bg-sap-information-background" triggers={['click']} />
    )
};

export const OpenStyled: Story = {
    name: 'Open: Custom body class',
    tags: ['!autodocs'],
    render: Styled.render,
    play: async ({ canvasElement }) => {
        canvasElement.querySelector<HTMLElement>('[data-slot=inline-help]')!.click();
        await waitForHelp('Inline Help Tooltip');
    }
};

function BodiesExample() {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    const help = (placement: Placement, label: string, noArrow = false) => (
        <InlineHelp
            content="Inline Help Tooltip"
            placement={placement}
            noArrow={noArrow}
            defaultOpen
            triggers={[]}
            container={box}
            bodyId={`body-${label}`}
            aria-label={label}
        />
    );
    return (
        <div ref={setBox} className="relative grid w-fit grid-cols-3 gap-x-56 gap-y-32 px-40 py-24">
            {box && (
                <>
                    {help('bottom', 'arrow-top')}
                    {help('top', 'arrow-bottom')}
                    {help('right', 'arrow-left')}
                    {help('left', 'arrow-right')}
                    {help('bottom', 'no-arrow', true)}
                </>
            )}
        </div>
    );
}

export const Bodies: Story = {
    name: 'Help bodies',
    parameters: {
        docs: {
            description: {
                story:
                    'Open help bodies rendered into a container of the page (`container`): with the arrow on each ' +
                    'side and without arrow.'
            }
        }
    },
    render: () => <BodiesExample />
};
