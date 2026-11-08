import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { ProgressIndicator } from './progress-indicator';

const box = 'flex flex-col gap-2';

const meta = {
    title: 'Components/Progress Indicator',
    component: ProgressIndicator,
    parameters: {
        docs: {
            description: {
                component:
                    'A bar that shows the progress of a task with its value (or a text) above it and an icon for a value state. ' +
                    'A text that does not fit is truncated and shows in full in a popover on click. Give it an accessible name with `aria-label` or `aria-labelledby`.'
            }
        }
    },
    argTypes: { state: { control: 'select', options: [null, 'informative', 'positive', 'critical', 'negative'] } },
    args: { valueNow: 42, valueMin: 0, valueMax: 100, 'aria-label': 'Progress', animate: false }
} satisfies Meta<typeof ProgressIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <div className="max-w-xl">
            <ProgressIndicator {...args} />
        </div>
    )
};

/** The first five are fundamental-styles' Layout example. */
export const Values: Story = {
    render: () => (
        <div className={box}>
            <ProgressIndicator aria-label="Empty" valueNow={0} />
            <ProgressIndicator aria-label="Started" valueNow={42} />
            <ProgressIndicator aria-label="Most" valueNow={69} />
            <ProgressIndicator aria-label="Done" valueNow={100} />
            <ProgressIndicator aria-label="Download" valueNow={80} valueText="80 of 100 MB" />
            <ProgressIndicator aria-label="Upload" valueNow={25} unit="MB" />
            <ProgressIndicator aria-label="Steps" valueMin={1} valueMax={5} valueNow={3} valueText="Step 3 of 5" />
        </div>
    )
};

export const States: Story = {
    render: () => (
        <div className={box}>
            <ProgressIndicator aria-label="Neutral" valueNow={42} />
            <ProgressIndicator aria-label="Informative" state="informative" valueNow={42} />
            <ProgressIndicator aria-label="Positive" state="positive" valueNow={42} />
            <ProgressIndicator aria-label="Critical" state="critical" valueNow={42} />
            <ProgressIndicator aria-label="Negative" state="negative" valueNow={42} />
        </div>
    )
};

const truncation = () => (
    <div className="w-56">
        <ProgressIndicator
            aria-label="Import"
            state="informative"
            valueNow={35}
            valueText="Importing 35 of 100 records from the customer master data, please wait"
        />
    </div>
);

export const Truncation: Story = {
    parameters: {
        docs: { description: { story: 'The text does not fit: click it, or press Enter on it, to read it in full.' } }
    },
    render: truncation
};

export const OpenTruncation: Story = {
    name: 'Open: Truncation popover',
    tags: ['!autodocs'],
    render: truncation,
    play: async ({ canvasElement }) => {
        let label: HTMLElement | null = null;
        await waitFor(() => {
            label = canvasElement.querySelector<HTMLElement>('button[aria-haspopup]');
            expect(label).not.toBeNull();
        });
        await userEvent.click(label!);
        await waitFor(() => expect(document.querySelector('[role=dialog]')?.textContent).toContain('please wait'));
    }
};

function AnimationDemo() {
    const [value, setValue] = useState(30);
    return (
        <div className="flex max-w-xl flex-col gap-2">
            <ProgressIndicator animate aria-label="Upload" valueNow={value} />
            <div className="flex gap-2">
                <Button label="-10" onClick={() => setValue(Math.max(0, value - 10))} />
                <Button label="+10" onClick={() => setValue(Math.min(100, value + 10))} />
            </div>
        </div>
    );
}

export const Animation: Story = { render: () => <AnimationDemo /> };
