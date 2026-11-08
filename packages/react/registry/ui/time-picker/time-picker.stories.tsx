import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import {
    DatetimeAdapterProvider,
    FdDate,
    getDefaultDatetimeAdapter,
    type FdDateTimeFormatOptions
} from '@/lib/datetime';
import { Button } from '@/ui/button/button';
import { FormItem, FormLabel } from '@/ui/form/form';
import { SegmentedButton, SegmentedButtonItem } from '@/ui/segmented-button/segmented-button';
import { TIME_LABELS } from '@/ui/time/time';
import { Title } from '@/ui/title/title';
import { TimePicker, type TimePickerProps } from './time-picker';

const HEADING = 'mt-6 mb-2 first:mt-0';
const VALUE = 'mt-2 font-sap-font-family text-sap-font-size text-sap-text-color';
const COLUMN = 'flex flex-col items-start gap-3';

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

/** The time of a value line: `toTimeString()` or "none". */
const show = (time: FdDate | null | undefined) => time?.toTimeString() ?? 'none';

const SECONDS_24: FdDateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
const SECONDS_12: FdDateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
const DAY_PERIOD: FdDateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    dayPeriod: true
};

type PlaygroundArgs = Pick<
    TimePickerProps,
    | 'disabled'
    | 'required'
    | 'spinnerButtons'
    | 'meridian'
    | 'displayHours'
    | 'displayMinutes'
    | 'displaySeconds'
    | 'allowNull'
    | 'tablet'
    | 'message'
    | 'messageType'
    | 'placement'
    | 'useValidation'
    | 'state'
    | 'buttonFocusable'
    | 'keepTwoDigitsTime'
    | 'minuteStep'
    | 'placeholder'
    | 'timePickerInputLabel'
    | 'timePickerButtonLabel'
    | 'onTimeChange'
    | 'onOpenChange'
> & { locale: string; compact: boolean };

const meta = {
    title: 'Components/Time Picker',
    component: TimePicker,
    parameters: {
        docs: {
            description: {
                component:
                    'A time picker is a time field with a button that opens the time columns. Typed times are read on Enter and when the field loses the focus; an unreadable time sets the error state. ' +
                    'The columns follow the display format (12-hour clock, seconds) unless set. Alt+Down opens the columns, Escape closes them and returns to the field. ' +
                    'Times go through the `DatetimeAdapter` of `useDatetimeAdapter()` (by default `FdDate`) and the formats of `useDateTimeFormats()`.'
            }
        }
    }
} satisfies Meta<typeof TimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundExample({ locale, compact, onTimeChange, ...args }: PlaygroundArgs) {
    const [time, setTime] = useState<FdDate | null>(new FdDate(2024, 3, 9, 10, 30, 34));
    return (
        <DatetimeAdapterProvider locale={locale}>
            <div data-density={compact ? 'compact' : undefined}>
                <FormItem>
                    <FormLabel htmlFor="tp-playground">Time</FormLabel>
                    <TimePicker
                        {...args}
                        inputId="tp-playground"
                        time={time}
                        onTimeChange={(next) => {
                            setTime(next);
                            onTimeChange?.(next);
                        }}
                    />
                </FormItem>
                <Value>Time: {show(time)}</Value>
            </div>
        </DatetimeAdapterProvider>
    );
}

/** fundamental-react's `dev` story: every option, with the changes in the actions panel. */
export const Playground: StoryObj<PlaygroundArgs> = {
    args: {
        disabled: false,
        required: false,
        spinnerButtons: true,
        allowNull: true,
        tablet: false,
        message: '',
        messageType: 'default',
        placement: 'bottom-start',
        useValidation: true,
        buttonFocusable: true,
        keepTwoDigitsTime: false,
        minuteStep: 1,
        timePickerInputLabel: 'Time picker input',
        timePickerButtonLabel: 'Open picker',
        locale: 'en-US',
        compact: false,
        onTimeChange: fn(),
        onOpenChange: fn()
    },
    argTypes: {
        meridian: { control: 'boolean' },
        displayHours: { control: 'boolean' },
        displayMinutes: { control: 'boolean' },
        displaySeconds: { control: 'boolean' },
        state: { control: 'select', options: [null, 'success', 'error', 'warning', 'information', 'default'] },
        messageType: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] },
        placement: { control: 'select', options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] },
        minuteStep: { control: { type: 'number', min: 1, max: 30 } },
        locale: { control: 'text' }
    },
    render: (args) => <PlaygroundExample {...args} />
};

/* ------------------------------------------------------------------------------------------------------------------
 * Angular stories
 * ---------------------------------------------------------------------------------------------------------------- */

function BasicExample() {
    const [time, setTime] = useState<FdDate | null>(new FdDate(2024, 3, 9, 14, 30, 0));
    return (
        <>
            <Heading>Default (the format of the locale)</Heading>
            <FormItem>
                <FormLabel htmlFor="tp-basic">Meeting time</FormLabel>
                <TimePicker inputId="tp-basic" time={time} onTimeChange={setTime} />
            </FormItem>
            <Value>Time: {show(time)}</Value>

            <Heading>24-hour clock with seconds</Heading>
            <TimePicker
                time={time}
                onTimeChange={setTime}
                meridian={false}
                displayFormat={SECONDS_24}
                keepTwoDigitsTime
                timePickerInputLabel="Time, 24-hour clock with seconds"
            />

            <Heading>Day period format ("in the afternoon")</Heading>
            <TimePicker
                time={time}
                onTimeChange={setTime}
                displayFormat={DAY_PERIOD}
                timePickerInputLabel="Time with the day period"
            />

            <Heading>Minutes in steps of 15, no spinners</Heading>
            <TimePicker
                time={time}
                onTimeChange={setTime}
                minuteStep={15}
                spinnerButtons={false}
                timePickerInputLabel="Time in 15-minute steps"
            />

            <Heading>Minutes in steps of 5, 10 and 30</Heading>
            <div className={COLUMN}>
                <TimePicker
                    time={time}
                    onTimeChange={setTime}
                    minuteStep={5}
                    timePickerInputLabel="Time in 5-minute steps"
                />
                <TimePicker
                    time={time}
                    onTimeChange={setTime}
                    minuteStep={10}
                    timePickerInputLabel="Time in 10-minute steps"
                />
                <TimePicker
                    time={time}
                    onTimeChange={setTime}
                    minuteStep={30}
                    timePickerInputLabel="Time in 30-minute steps"
                />
            </div>

            <Heading>Compact</Heading>
            <TimePicker time={time} onTimeChange={setTime} data-density="compact" timePickerInputLabel="Compact time" />

            <Heading>States and messages</Heading>
            <div className={COLUMN}>
                <TimePicker
                    time={time}
                    state="success"
                    message="Time is available"
                    messageType="success"
                    timePickerInputLabel="Success time"
                />
                <TimePicker
                    time={time}
                    state="warning"
                    message="Outside office hours"
                    messageType="warning"
                    timePickerInputLabel="Warning time"
                />
                <TimePicker
                    time={time}
                    state="information"
                    message="Times are local"
                    messageType="information"
                    timePickerInputLabel="Information time"
                />
                <TimePicker time={time} disabled timePickerInputLabel="Disabled time" />
            </div>
        </>
    );
}

export const Basic: Story = {
    parameters: {
        docs: {
            description: {
                story: 'The display format sets the columns: a 12-hour clock with a period column for en-US, hours, minutes and seconds for a 24-hour format with seconds. Minute steps, spinners, compact density, states and messages.'
            }
        }
    },
    render: () => <BasicExample />
};

function FormsExample() {
    const [time, setTime] = useState<FdDate | null>(null);
    const [invalid, setInvalid] = useState(true);
    const [touched, setTouched] = useState(false);
    const valid = !invalid && time !== null;
    return (
        <>
            <Heading>Form field, required; type a wrong time to see the error</Heading>
            <FormItem>
                <FormLabel required htmlFor="tp-form">
                    Start
                </FormLabel>
                <TimePicker
                    inputId="tp-form"
                    time={time}
                    onTimeChange={setTime}
                    allowNull={false}
                    required
                    message="Enter a time such as 9:30 AM"
                    messageType="error"
                    state={!valid && touched ? 'error' : null}
                    onInvalidChange={setInvalid}
                    onTouched={() => setTouched(true)}
                />
            </FormItem>
            <Value>
                Valid: {String(valid)}, value: {show(time)}
            </Value>
        </>
    );
}

export const Forms: Story = {
    parameters: {
        docs: {
            description: {
                story: "Angular's reactive form: `onTimeChange` is the value, `onTouched` the touched state and `onInvalidChange` the validator (`allowNull={false}`: an empty field is invalid)."
            }
        }
    },
    render: () => <FormsExample />
};

const LOCALES = ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP', 'ar-EG'];

function LocaleAndNullExample() {
    const [locale, setLocale] = useState('en-US');
    const [time, setTime] = useState<FdDate | null>(new FdDate(2024, 3, 9, 14, 30, 0));
    const [value, setValue] = useState<FdDate | null>(new FdDate(2024, 3, 9, 9, 15, 0));
    const [invalid, setInvalid] = useState(false);
    return (
        <>
            <DatetimeAdapterProvider locale={locale}>
                <Heading>Locale (an adapter of its own)</Heading>
                <FormItem>
                    <FormLabel id="tp-locale-label">Locale</FormLabel>
                    <SegmentedButton
                        aria-labelledby="tp-locale-label"
                        value={locale}
                        onValueChange={(next) => setLocale(next)}
                    >
                        {LOCALES.map((option) => (
                            <SegmentedButtonItem key={option} value={option} label={option} />
                        ))}
                    </SegmentedButton>
                </FormItem>
                <FormItem>
                    <FormLabel htmlFor="tp-locale">Time</FormLabel>
                    <TimePicker inputId="tp-locale" time={time} onTimeChange={setTime} spinnerButtons={false} />
                </FormItem>
            </DatetimeAdapterProvider>

            <Heading>No empty value (allowNull false)</Heading>
            <TimePicker
                time={value}
                onTimeChange={setValue}
                allowNull={false}
                onInvalidChange={setInvalid}
                timePickerInputLabel="Time, never empty"
            />
            <Value>
                Value: {show(value)}, valid: {String(!invalid)}
            </Value>
            <div className="flex gap-2">
                <Button label="Set to null" onClick={() => setValue(null)} />
                <Button label="Set a valid time" onClick={() => setValue(new FdDate(2024, 3, 9, 9, 15, 0))} />
            </div>
        </>
    );
}

export const LocaleAndNull: Story = {
    name: 'Locale and null',
    parameters: {
        docs: {
            description: {
                story: "A `DatetimeAdapterProvider` gives the time picker an adapter of its own in a locale (Angular's `provideDateTimeFormats()`). With `allowNull={false}` an empty value, also one set from outside, is invalid."
            }
        }
    },
    render: () => <LocaleAndNullExample />
};

/** Opens the picker with its button and waits for the time columns. */
async function openPicker(canvasElement: HTMLElement, index = 0): Promise<void> {
    await userEvent.click(canvasElement.querySelectorAll<HTMLElement>('button[aria-haspopup]')[index]);
    await waitFor(() => expect(document.querySelector('[role="dialog"] [role="spinbutton"]')).not.toBeNull());
}

export const OpenTimeColumns: Story = {
    name: 'Open: Time columns',
    tags: ['!autodocs'],
    render: () => (
        <TimePicker
            defaultTime={new FdDate(2024, 3, 9, 14, 30, 0)}
            message="Times are local"
            messageType="information"
        />
    ),
    play: ({ canvasElement }) => openPicker(canvasElement)
};

export const OpenTimeColumnsSeconds: Story = {
    name: 'Open: 24-hour clock with seconds',
    tags: ['!autodocs'],
    render: () => (
        <TimePicker defaultTime={new FdDate(2024, 3, 9, 14, 30, 15)} displayFormat={SECONDS_24} keepTwoDigitsTime />
    ),
    play: ({ canvasElement }) => openPicker(canvasElement)
};

/* ------------------------------------------------------------------------------------------------------------------
 * fundamental-react stories
 * ---------------------------------------------------------------------------------------------------------------- */

/** fundamental-react's examples: a form label and a picker with hours, minutes and seconds. */
function Labelled({ id, label = 'Time', ...props }: TimePickerProps & { id: string; label?: string }) {
    return (
        <FormItem>
            <FormLabel htmlFor={`${id}-input`}>{label}</FormLabel>
            <TimePicker id={id} timePickerButtonLabel="Show/hide time picker" {...props} />
        </FormItem>
    );
}

export const Primary: Story = {
    parameters: {
        docs: {
            description: {
                story: "fundamental-react's `primary`: hours, minutes and seconds on a 24-hour clock, no time yet (the columns show now)."
            }
        }
    },
    render: () => <Labelled id="timepickerPrimaryExample" displayFormat={SECONDS_24} />
};

export const Disabled: Story = {
    render: () => <Labelled id="timepickerDisabledExample" displayFormat={SECONDS_24} disabled />
};

export const Format12Hours: Story = {
    name: '12-hour clock',
    parameters: {
        docs: {
            description: { story: "fundamental-react's `format12Hours` is `meridian` (by default from the format)." }
        }
    },
    render: () => <Labelled id="timepicker12HrExample" displayFormat={SECONDS_12} />
};

export const InitialValue: Story = {
    name: 'Initial value',
    parameters: {
        docs: {
            description: {
                story: "fundamental-react's `value='10:30:34 am'`: a time of the adapter, here `getDefaultDatetimeAdapter().parse()`."
            }
        }
    },
    render: () => (
        <Labelled
            id="timepickerInitExample"
            displayFormat={SECONDS_12}
            defaultTime={getDefaultDatetimeAdapter().parse('10:30:34 am', SECONDS_12)}
        />
    )
};

export const HideSeconds: Story = {
    name: 'Hide seconds',
    parameters: {
        docs: {
            description: {
                story: "fundamental-react's `showSecond={false}`: a format without seconds, or `displaySeconds={false}`."
            }
        }
    },
    render: () => (
        <Labelled
            id="timepickerHideSecondExample"
            displayFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        />
    )
};

/* ------------------------------------------------------------------------------------------------------------------
 * The fundamental-styles reference: its time picker pattern, 4:25:10 PM in tablet mode
 * ---------------------------------------------------------------------------------------------------------------- */

const REFERENCE_LABELS = { period: { ...TIME_LABELS.period, label: 'AM/PM' } };

/** The field and, with `open`, the open columns, rendered inside the story as fundamental-styles shows them. */
function ReferenceExample({ open = false }: { open?: boolean }) {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <div ref={setBox} className="relative min-h-[36rem]">
            {box && (
                <>
                    <FormLabel htmlFor="tabletTimepicker">Cozy Timepicker</FormLabel>
                    <TimePicker
                        id="reference"
                        inputId="tabletTimepicker"
                        defaultTime={new FdDate(2024, 3, 9, 16, 25, 10)}
                        defaultOpen={open}
                        displayFormat={SECONDS_12}
                        keepTwoDigitsTime
                        tablet
                        timeLabels={REFERENCE_LABELS}
                        popoverProps={{ container: box }}
                    />
                </>
            )}
        </div>
    );
}

export const Reference: Story = {
    name: 'Open: fundamental-styles reference',
    tags: ['!autodocs'],
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' time picker pattern: 4:25:10 PM with seconds, two digits and the tablet columns, open (`defaultOpen`) with the body inside the story. For the visual comparison."
            }
        }
    },
    render: () => <ReferenceExample open />
};

export const ReferenceClosed: Story = {
    name: 'fundamental-styles reference, closed',
    tags: ['!autodocs'],
    render: () => <ReferenceExample />
};
