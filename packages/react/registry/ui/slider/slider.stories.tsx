import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { Slider, type SliderCustomValue, type SliderProps, type SliderValue } from './slider';

const TEXT = 'm-0 font-sap-font-family text-sap-font-size text-sap-text-color';
const SMALL = 'm-0 font-sap-font-family text-sap-font-small-size text-sap-content-label-color';

const MONTHS: SliderCustomValue[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((label, i) => ({
    value: i + 1,
    label
}));
const DAYS: SliderCustomValue[] = Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: `Jan ${i + 1}` }));

const meta = {
    title: 'Components/Slider',
    component: Slider,
    parameters: {
        docs: {
            description: {
                component:
                    "Picks a number, a range or one of a list of custom values, on Base UI's Slider. Drag a handle or press the track; with the keyboard the arrows move by `step`, Shift+arrows and Page Up/Down by `jump`, Home and End to the ends. " +
                    'A range slider moves both handles together from the range between them. Ticks, labels, a vertical layout and read-only or editable tooltips are optional.'
            }
        }
    },
    args: {
        'aria-label': 'Slider',
        defaultValue: 30,
        min: 0,
        max: 100,
        step: 1,
        jump: 10,
        mode: 'single',
        showTicks: false,
        showTicksLabels: false,
        tickmarksBetweenLabels: 1,
        hideProgressBar: false,
        disabled: false,
        vertical: false,
        cozy: false
    },
    argTypes: {
        mode: { control: 'inline-radio', options: ['single', 'range'] },
        tooltipMode: { control: 'select', options: [null, 'readonly', 'editable'] }
    },
    render: (args) => (
        <div className="max-w-xl">
            <Slider {...args} />
        </div>
    )
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

const json = (value: SliderValue) => JSON.stringify(value);

/** A controlled slider with its value printed below it (Angular's `[(ngModel)]` examples). */
function Controlled({
    initial,
    print = (value) => `Value: ${json(value)}`,
    ...props
}: SliderProps & { initial: SliderValue; print?: ((value: SliderValue) => string) | false }) {
    const [value, setValue] = useState<SliderValue>(initial);
    return (
        <>
            <Slider {...props} value={value} onValueChange={setValue} />
            {print && <p className={SMALL}>{print(value)}</p>}
        </>
    );
}

const range = (value: SliderValue) => {
    const [a, b] = (value ?? []) as number[];
    return `Min: ${a}, max: ${b}`;
};

export const Playground: Story = {};

export const Basic: Story = {
    render: () => (
        <div className="flex max-w-xl flex-col gap-2">
            <p className={TEXT} id="sl-1">
                Default: min 0, max 100, step 1
            </p>
            <Controlled aria-labelledby="sl-1" initial={30} />
            <p className={`${TEXT} mt-4`} id="sl-2">
                Negative minimum: min -100
            </p>
            <Controlled aria-labelledby="sl-2" min={-100} initial={-20} />
            <p className={`${TEXT} mt-4`} id="sl-3">
                min -50, max 50, step 5
            </p>
            <Controlled aria-labelledby="sl-3" min={-50} max={50} step={5} initial={10} />
            <p className={`${TEXT} mt-4`} id="sl-4">
                min -1, max 1, step 0.2
            </p>
            <Controlled aria-labelledby="sl-4" min={-1} max={1} step={0.2} initial={0.4} />
            <p className={`${TEXT} mt-4`} id="sl-5">
                Cozy (larger touch handles)
            </p>
            <Controlled aria-labelledby="sl-5" cozy initial={30} print={false} />
            <p className={`${TEXT} mt-4`} id="sl-6">
                Disabled
            </p>
            <Slider aria-labelledby="sl-6" disabled value={30} />
        </div>
    )
};

export const TicksAndLabels: Story = {
    name: 'Ticks, labels and tooltips',
    render: () => (
        <div className="flex max-w-xl flex-col gap-2">
            <p className={TEXT} id="sl-t1">
                Tick marks
            </p>
            <Controlled aria-labelledby="sl-t1" showTicks max={50} initial={20} print={false} />
            <p className={`${TEXT} mt-4`} id="sl-t2">
                Ticks, labels every second tick and a read-only tooltip
            </p>
            <Controlled
                aria-labelledby="sl-t2"
                showTicks
                showTicksLabels
                tooltipMode="readonly"
                max={50}
                step={5}
                tickmarksBetweenLabels={2}
                initial={25}
            />
            <p className={`${TEXT} mt-4`} id="sl-t3">
                Custom values
            </p>
            <Controlled
                aria-labelledby="sl-t3"
                showTicks
                showTicksLabels
                tooltipMode="readonly"
                customValues={MONTHS}
                initial={MONTHS[2]}
            />
            <p className={`${TEXT} mt-4`} id="sl-t4">
                Editable tooltip
            </p>
            <Controlled aria-labelledby="sl-t4" tooltipMode="editable" initial={60} />
        </div>
    )
};

export const Range: Story = {
    render: () => (
        <div className="flex max-w-xl flex-col gap-2">
            <p className={TEXT} id="sl-r1">
                Range with an editable tooltip; drag the range between the handles to move both
            </p>
            <Controlled
                aria-labelledby="sl-r1"
                mode="range"
                showTicks
                tooltipMode="editable"
                step={5}
                initial={[20, 70]}
                print={range}
            />
            <p className={`${TEXT} mt-4`} id="sl-r2">
                Range with custom values
            </p>
            <Controlled
                aria-labelledby="sl-r2"
                mode="range"
                showTicks
                showTicksLabels
                customValues={MONTHS}
                initial={[MONTHS[1], MONTHS[5]]}
            />
        </div>
    )
};

export const Vertical: Story = {
    render: () => (
        <div className="flex flex-wrap gap-12">
            <div className="flex h-80 gap-12">
                <Slider vertical aria-label="Volume" defaultValue={50} />
                <Slider vertical aria-label="Bass" tooltipMode="readonly" defaultValue={30} />
                <Slider vertical aria-label="Range" mode="range" defaultValue={[20, 60]} />
                <Slider vertical cozy showTicks showTicksLabels aria-label="Treble" step={10} defaultValue={70} />
            </div>
            <div className="flex flex-col gap-2">
                <p className={TEXT} id="sl-v1">
                    Range with an editable tooltip and ticks
                </p>
                <div className="h-80">
                    <Controlled
                        vertical
                        aria-labelledby="sl-v1"
                        mode="range"
                        showTicks
                        tooltipMode="editable"
                        initial={[20, 70]}
                        print={false}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <p className={TEXT} id="sl-v2">
                    Range with custom values
                </p>
                <div className="h-80">
                    <Controlled
                        vertical
                        aria-labelledby="sl-v2"
                        mode="range"
                        showTicks
                        showTicksLabels
                        customValues={DAYS}
                        initial={[DAYS[4], DAYS[6]]}
                        print={false}
                    />
                </div>
            </div>
        </div>
    )
};

/** Value, touched and dirty of a slider, the React form of Angular's reactive form example. */
function FormExample() {
    const [value, setValue] = useState<SliderValue>(40);
    const [touched, setTouched] = useState(false);
    const [dirty, setDirty] = useState(false);
    return (
        <form className="flex max-w-xl flex-col gap-2" onSubmit={(event) => event.preventDefault()}>
            <Slider
                aria-label="Percentage"
                name="slider"
                value={value}
                onValueChange={(next) => {
                    setValue(next);
                    setDirty(true);
                }}
                onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setTouched(true);
                }}
            />
            <p className={SMALL}>
                Value: {json(value)}, touched: {String(touched)}, dirty: {String(dirty)}
            </p>
        </form>
    );
}

export const Form: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    '`value` with `onValueChange`, the React form of Angular’s reactive forms (touched from `onBlur` ' +
                    "when the focus leaves the slider). With `name`, Base UI's hidden range inputs submit the value; " +
                    'inside a Base UI `Field` the slider reports dirty and touched too.'
            }
        }
    },
    render: () => <FormExample />
};

export const OpenEditableTooltip: Story = {
    name: 'Open: Editable tooltip',
    tags: ['!autodocs'],
    render: () => (
        <div className="flex max-w-xl flex-col gap-12 pt-12">
            <Slider aria-label="Value" tooltipMode="editable" defaultValue={60} />
            <Slider aria-label="Range" mode="range" showTicks tooltipMode="editable" step={5} defaultValue={[20, 70]} />
        </div>
    ),
    play: async ({ canvasElement }) => {
        let input: HTMLElement | null = null;
        await waitFor(() => {
            input = canvasElement.querySelector<HTMLElement>('[data-slot=slider-handle] input');
            expect(input).not.toBeNull();
        });
        input!.focus();
        await waitFor(() => expect(canvasElement.querySelector('[data-slot=slider-tooltip] input')).not.toBeNull());
    }
};

// fundamental-styles' examples, at their width (half the page) and values, for the visual comparison

export const Standard: Story = {
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' Standard, Range and Mobile examples: a slider, a range and a cozy slider."
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-8">
            <div className="w-1/2">
                <Slider aria-label="slider" defaultValue={50} />
            </div>
            <div className="w-1/2">
                <Slider aria-label="range slider" mode="range" defaultValue={[40, 80]} />
            </div>
            <div className="w-1/2">
                <Slider aria-label="mobile slider" cozy defaultValue={50} />
            </div>
        </div>
    )
};

export const Ticks: Story = {
    parameters: {
        docs: {
            description: { story: "fundamental-styles' Ticks and Ticks and labels examples: a tick every 10." }
        }
    },
    render: () => (
        <div className="flex flex-col gap-8">
            <div className="w-1/2">
                <Slider aria-label="slider with ticks" showTicks step={10} defaultValue={50} />
            </div>
            <div className="w-1/2">
                <Slider
                    aria-label="slider with ticks and labels"
                    showTicks
                    showTicksLabels
                    step={10}
                    defaultValue={50}
                />
            </div>
        </div>
    )
};
