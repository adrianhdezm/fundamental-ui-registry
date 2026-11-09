import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType, type ReactNode } from 'react';
import { expect, userEvent } from 'storybook/test';
import { DatetimeAdapterProvider, FdDate, useDatetimeAdapter } from '@/lib/datetime';
import { Button } from '@/ui/button/button';
import { Title } from '@/ui/title/title';
import { Time, TimeColumn, TIME_LABELS, type FdTimeActiveView, type TimeProps } from './time';

const HEADING = 'mt-6 mb-2 first:mt-0';
const VALUE = 'font-sap-font-family text-sap-font-size text-sap-text-color';
const ROW = 'flex flex-wrap items-start gap-8';

function Heading({ children }: { children: ReactNode }) {
    return (
        <Title level={3} headerSize={5} className={HEADING}>
            {children}
        </Title>
    );
}

function Value({ children }: { children: ReactNode }) {
    return <p className={VALUE}>{children}</p>;
}

/** Hours, minutes and seconds of a time for the value lines of the stories. */
const show = (time: FdDate | null) => (time ? `${time.hour}h ${time.minute}m ${time.second}s` : 'none');

type PlaygroundArgs = Pick<
    TimeProps,
    | 'meridian'
    | 'keepTwoDigits'
    | 'disabled'
    | 'displayHours'
    | 'displayMinutes'
    | 'displaySeconds'
    | 'tablet'
    | 'elementsAtOnce'
    | 'spinnerButtons'
    | 'minuteStep'
    | 'defaultActiveView'
> & { locale: string; compact: boolean };

const meta = {
    title: 'Components/Time',
    component: Time,
    subcomponents: { TimeColumn } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            description: {
                component:
                    'Time picks hours, minutes, seconds and the period in columns. The active column shows a window of values; the others show the selected value. ' +
                    'Each column is a spinbutton: Up and Down, Page Up and Page Down, Home and End, the mouse wheel, dragging, typing digits (or A and P) and the spinner buttons change it; Left and Right move between the columns. ' +
                    'Times go through the `DatetimeAdapter` of `useDatetimeAdapter()` (by default `FdDate`); the date part is kept.'
            }
        }
    }
} satisfies Meta<typeof Time>;
export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundExample({ locale, compact, ...args }: PlaygroundArgs) {
    const [time, setTime] = useState<FdDate | null>(new FdDate(2024, 3, 9, 12, 55, 6));
    return (
        <DatetimeAdapterProvider locale={locale}>
            <div data-density={compact ? 'compact' : undefined}>
                <Time key={args.defaultActiveView} {...args} time={time} onTimeChange={setTime} />
            </div>
            <Value>{time?.toTimeString()}</Value>
        </DatetimeAdapterProvider>
    );
}

export const Playground: StoryObj<PlaygroundArgs> = {
    args: {
        meridian: false,
        keepTwoDigits: false,
        disabled: false,
        displayHours: true,
        displayMinutes: true,
        displaySeconds: true,
        tablet: false,
        elementsAtOnce: 7,
        spinnerButtons: true,
        minuteStep: 1,
        defaultActiveView: 'hour',
        locale: 'en-US',
        compact: false
    },
    argTypes: {
        defaultActiveView: { control: 'inline-radio', options: ['hour', 'minute', 'second', 'meridian'] },
        elementsAtOnce: { control: { type: 'number', min: 1, step: 2 } },
        minuteStep: { control: { type: 'number', min: 1, max: 30 } },
        locale: { control: 'text' }
    },
    render: (args) => <PlaygroundExample {...args} />
};

/* ------------------------------------------------------------------------------------------------------------------
 * Angular stories
 * ---------------------------------------------------------------------------------------------------------------- */

function BasicExample() {
    const [time, setTime] = useState(new FdDate(2024, 3, 9, 14, 30, 15));
    return (
        <div className={ROW}>
            <div>
                <Heading>24-hour clock</Heading>
                <Time time={time} onTimeChange={setTime} />
                <Value>{time.toTimeString()}</Value>
            </div>
            <div>
                <Heading>12-hour clock with two digits</Heading>
                <Time
                    time={time}
                    onTimeChange={setTime}
                    meridian
                    keepTwoDigits
                    displaySeconds={false}
                    defaultActiveView="meridian"
                />
            </div>
            <div>
                <Heading>Hours only, without spinners</Heading>
                <Time
                    time={time}
                    onTimeChange={setTime}
                    displayMinutes={false}
                    displaySeconds={false}
                    spinnerButtons={false}
                />
            </div>
        </div>
    );
}

export const Basic: Story = {
    render: () => <BasicExample />,
    play: async ({ canvasElement }) => {
        // the keyboard: Down steps the hours of the first time, Right moves to its minutes
        const hours = canvasElement.querySelector<HTMLElement>('[role=spinbutton]')!;
        hours.focus();
        await userEvent.keyboard('{ArrowDown}{ArrowRight}');
        await expect(hours.getAttribute('aria-valuetext')).toBe('15');
        await expect(document.activeElement!.getAttribute('aria-label')).toBe('Minutes');
    }
};

function OptionsExample() {
    const [time, setTime] = useState(new FdDate(2024, 3, 9, 9, 45, 0));
    return (
        <div className={ROW}>
            <div>
                <Heading>Minutes in steps of 15</Heading>
                <Time
                    time={time}
                    onTimeChange={setTime}
                    minuteStep={15}
                    displaySeconds={false}
                    defaultActiveView="minute"
                />
            </div>
            <div>
                <Heading>Five values, compact</Heading>
                <Time time={time} onTimeChange={setTime} elementsAtOnce={5} data-density="compact" />
            </div>
            <div>
                <Heading>Tablet</Heading>
                <Time time={time} onTimeChange={setTime} tablet displaySeconds={false} />
            </div>
            <div>
                <Heading>Disabled</Heading>
                <Time defaultTime={new FdDate(2024, 3, 9, 18, 0, 0)} disabled />
            </div>
        </div>
    );
}

export const Options: Story = { render: () => <OptionsExample /> };

function ProgrammaticExample() {
    const adapter = useDatetimeAdapter();
    const [time, setTime] = useState(new FdDate(2024, 3, 9, 12, 0, 0));
    return (
        <>
            <Heading>Programmatically changed time</Heading>
            <Time time={time} onTimeChange={setTime} />
            <Value>Selected time: {show(time)}</Value>
            <Button label="Set hours to 11" onClick={() => setTime(adapter.setHours(time, 11))} />
        </>
    );
}

export const Programmatic: Story = { render: () => <ProgrammaticExample /> };

function ReactiveFormExample() {
    const [time, setTime] = useState<FdDate | null>(null);
    const [touched, setTouched] = useState(false);
    const [dirty, setDirty] = useState(false);
    return (
        <form onSubmit={(event) => event.preventDefault()}>
            <Heading>Select time</Heading>
            <Time
                time={time}
                onTimeChange={(next) => {
                    setTime(next);
                    setDirty(true);
                }}
                onTouched={() => setTouched(true)}
            />
            <Value>Time: {show(time)}</Value>
            <Value>
                Touched: {String(touched)}, dirty: {String(dirty)}, valid: true
            </Value>
        </form>
    );
}

export const ReactiveForm: Story = {
    name: 'Reactive form',
    parameters: {
        docs: {
            description: {
                story: 'Without a value the time shows today at 00:00:00; `onTimeChange` makes the form dirty and `onTouched` (the focus left the time) touched.'
            }
        }
    },
    render: () => <ReactiveFormExample />
};

/* ------------------------------------------------------------------------------------------------------------------
 * fundamental-react stories
 * ---------------------------------------------------------------------------------------------------------------- */

export const TwelveHour: Story = {
    name: '12-hour clock',
    parameters: {
        docs: { description: { story: "fundamental-react's `format12Hours` is `meridian`; 12:55:06 PM is set." } }
    },
    render: () => (
        <div className={ROW}>
            <div>
                <Heading>12-hour clock</Heading>
                <Time meridian keepTwoDigits />
            </div>
            <div>
                <Heading>12-hour clock, time set</Heading>
                <Time meridian keepTwoDigits defaultTime={new FdDate(2024, 3, 9, 12, 55, 6)} />
            </div>
        </div>
    )
};

export const TimeSet: Story = {
    name: 'Time set',
    parameters: {
        docs: { description: { story: 'A 24-hour clock at 22:34:12 (`time` or `defaultTime`).' } }
    },
    render: () => <Time keepTwoDigits defaultTime={new FdDate(2024, 3, 9, 22, 34, 12)} />
};

export const Disabled: Story = {
    render: () => <Time disabled defaultTime={new FdDate(2024, 3, 9, 8, 15, 0)} />
};

export const HiddenColumns: Story = {
    name: 'Hidden columns',
    parameters: {
        docs: {
            description: {
                story: "fundamental-react's `showHour`, `showMinute` and `showSecond` are `displayHours`, `displayMinutes` and `displaySeconds`; the first column shown starts active with `defaultActiveView`."
            }
        }
    },
    render: () => (
        <div className={ROW}>
            <div>
                <Heading>Without seconds</Heading>
                <Time displaySeconds={false} />
            </div>
            <div>
                <Heading>Without minutes</Heading>
                <Time displayMinutes={false} />
            </div>
            <div>
                <Heading>Without hours</Heading>
                <Time displayHours={false} defaultActiveView="minute" />
            </div>
        </div>
    )
};

/* ------------------------------------------------------------------------------------------------------------------
 * The fundamental-styles reference: 04:25:10, as its Default, Tablet and period examples
 * ---------------------------------------------------------------------------------------------------------------- */

const REFERENCE_TIME = new FdDate(2024, 3, 9, 4, 25, 10);
const REFERENCE_LABELS = { period: { ...TIME_LABELS.period, label: 'AM/PM' } };

function ReferenceRow({ tablet = false, label }: { tablet?: boolean; label: string }) {
    const views: [FdTimeActiveView, boolean, boolean][] = [
        ['hour', false, false],
        ['hour', true, false],
        ['meridian', true, true]
    ];
    return (
        <div className="flex flex-wrap items-start justify-around" aria-label={label} role="group">
            {views.map(([view, seconds, meridian], i) => (
                <Time
                    key={i}
                    aria-label={`${label} ${i + 1}`}
                    tablet={tablet}
                    keepTwoDigits
                    displaySeconds={seconds}
                    meridian={meridian}
                    defaultActiveView={view}
                    defaultTime={REFERENCE_TIME}
                    labels={REFERENCE_LABELS}
                />
            ))}
        </div>
    );
}

export const Reference: Story = {
    name: 'Default and tablet (fundamental-styles reference)',
    parameters: {
        docs: {
            description: {
                story: "04:25:10 as fundamental-styles' Default and Tablet stories: hours active without and with seconds, and the period active. For the visual comparison."
            }
        }
    },
    render: () => (
        <>
            <ReferenceRow label="Default" />
            <ReferenceRow label="Tablet" tablet />
        </>
    )
};
