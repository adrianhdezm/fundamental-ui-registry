import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import {
    DateTimeFormatsProvider,
    DatetimeAdapterProvider,
    FD_DATETIME_FORMATS,
    FdDate,
    useDatetimeAdapter,
    type DateTimeFormats,
    type FdDateTimeFormatOptions
} from '@/lib/datetime';
import { Button } from '@/ui/button/button';
import { type SpecialDayRule } from '@/ui/calendar/calendar';
import { FormItem, FormLabel } from '@/ui/form/form';
import { Select, SelectOption } from '@/ui/select/select';
import { Title } from '@/ui/title/title';
import { DatetimePicker, type DatetimePickerProps } from './datetime-picker';

const HEADING = 'mt-6 mb-2 first:mt-0';
const VALUE = 'mt-1 font-sap-font-family text-sap-font-size text-sap-text-color';

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

/** Shows a date for the value lines of the stories. */
const show = (date: FdDate | null | undefined) => date?.toString() ?? 'none';

const meta = {
    title: 'Components/Datetime Picker',
    component: DatetimePicker,
    parameters: {
        docs: {
            description: {
                component:
                    'A datetime picker opens a calendar and time columns side by side; the picked values apply with OK and are dropped with Cancel, or apply at once without the footer. On narrow screens a switch shows either the calendar or the time. ' +
                    'Typed values are read while typing (or on Enter and blur with `processInputOnBlur`); an unreadable or disabled date sets the error state once the field was left. F4 and Alt+Down open the picker, Escape closes it. ' +
                    'Dates go through the `DatetimeAdapter` of `useDatetimeAdapter()` (by default `FdDate`, see `DatetimeAdapterProvider`) and the formats of `DateTimeFormatsProvider`.'
            }
        }
    }
} satisfies Meta<typeof DatetimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------------------------------------------------------
 * Playground
 * ---------------------------------------------------------------------------------------------------------------- */

type PlaygroundArgs = Pick<
    DatetimePickerProps,
    | 'placeholder'
    | 'disabled'
    | 'state'
    | 'message'
    | 'messageType'
    | 'showFooter'
    | 'processInputOnBlur'
    | 'allowNull'
    | 'showWeekNumbers'
    | 'markWeekends'
    | 'keepTwoDigitsTime'
    | 'spinnerButtons'
    | 'mobile'
    | 'mobileLandscape'
> & { locale: string; compact: boolean; disableWeekends: boolean };

function PlaygroundExample({ locale, compact, disableWeekends, ...args }: PlaygroundArgs) {
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9, 14, 30, 0));
    return (
        <DatetimeAdapterProvider locale={locale}>
            <FormItem data-density={compact ? 'compact' : undefined}>
                <FormLabel htmlFor="dev-datetime-picker">Meeting</FormLabel>
                <DatetimePicker
                    inputId="dev-datetime-picker"
                    {...args}
                    date={date}
                    onDateChange={setDate}
                    disableFunction={disableWeekends ? (d) => [1, 7].includes(d.getDayOfWeek()) : undefined}
                    mobileConfig={{ title: 'Meeting', approveButtonText: 'Save', cancelButtonText: 'Cancel' }}
                />
            </FormItem>
            <Value>Value: {show(date)}</Value>
        </DatetimeAdapterProvider>
    );
}

export const Playground: StoryObj<PlaygroundArgs> = {
    args: {
        placeholder: '',
        disabled: false,
        state: null,
        message: '',
        messageType: 'default',
        showFooter: true,
        processInputOnBlur: false,
        allowNull: true,
        showWeekNumbers: true,
        markWeekends: true,
        keepTwoDigitsTime: false,
        spinnerButtons: true,
        mobile: false,
        mobileLandscape: false,
        locale: 'en-US',
        compact: false,
        disableWeekends: false
    },
    argTypes: {
        state: { control: 'select', options: [null, 'success', 'error', 'warning', 'information'] },
        messageType: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] },
        locale: { control: 'text' }
    },
    render: (args) => <PlaygroundExample {...args} />
};

/* ------------------------------------------------------------------------------------------------------------------
 * Angular stories
 * ---------------------------------------------------------------------------------------------------------------- */

function BasicExample() {
    const adapter = useDatetimeAdapter();
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9, 14, 30, 0));
    const weekend = (d: FdDate) => [1, 7].includes(d.getDayOfWeek());
    return (
        <>
            <Heading>Date and time, applied with OK</Heading>
            <FormItem>
                <FormLabel htmlFor="dtp-basic">Meeting</FormLabel>
                <DatetimePicker inputId="dtp-basic" date={date} onDateChange={setDate} />
            </FormItem>
            <Value>Value: {show(date)}</Value>
            <Button
                className="mt-2"
                label="Next day"
                onClick={() => setDate(adapter.addCalendarDays(date ?? FdDate.getNow(), 1))}
            />

            <Heading>Without footer: a pick applies at once</Heading>
            <DatetimePicker
                aria-label="Meeting, applied at once"
                date={date}
                onDateChange={setDate}
                showFooter={false}
            />

            <Heading>24-hour clock with seconds, two digits, long date</Heading>
            <DatetimePicker
                aria-label="Meeting, long date"
                date={date}
                onDateChange={setDate}
                customDateTimeFormat={{
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }}
                keepTwoDigitsTime
                spinnerButtons={false}
                className="w-80"
            />

            <Heading>Read on Enter and blur only, weekends disabled</Heading>
            <DatetimePicker
                aria-label="Meeting on a weekday"
                date={date}
                onDateChange={setDate}
                processInputOnBlur
                disableFunction={weekend}
            />

            <Heading>States and messages</Heading>
            <div className="flex flex-col items-start gap-3">
                <DatetimePicker
                    aria-label="Success"
                    date={date}
                    state="success"
                    message="Room is free"
                    messageType="success"
                />
                <DatetimePicker
                    aria-label="Warning"
                    date={date}
                    state="warning"
                    message="Late in the day"
                    messageType="warning"
                />
                <DatetimePicker
                    aria-label="Information"
                    date={date}
                    state="information"
                    message="Times are local"
                    messageType="information"
                />
                <DatetimePicker aria-label="Disabled" date={date} disabled />
            </div>
        </>
    );
}

export const Basic: Story = {
    parameters: {
        docs: {
            description: { story: 'Also the Simple, Programmatic Change, Disabled and on-blur upstream examples.' }
        }
    },
    render: () => <BasicExample />
};

const RULES: SpecialDayRule<FdDate>[] = [
    { specialDayNumber: 5, legendText: 'Team meeting', rule: (d) => d.getDayOfWeek() === 3 },
    { specialDayNumber: 6, legendText: 'Release', appointment: true, rule: (d) => d.day === 15 }
];

function SpecialDaysExample() {
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9, 9, 0, 0));
    return (
        <>
            <Heading>Special days and a legend</Heading>
            <DatetimePicker
                aria-label="Meeting"
                date={date}
                onDateChange={setDate}
                specialDaysRules={RULES}
                showCalendarLegend
            />

            <Heading>Legend in a column</Heading>
            <DatetimePicker
                aria-label="Meeting, legend in a column"
                date={date}
                onDateChange={setDate}
                specialDaysRules={RULES}
                showCalendarLegend
                legendCol
            />
        </>
    );
}

export const SpecialDays: Story = { name: 'Special days', render: () => <SpecialDaysExample /> };

function FormsExample() {
    // the form control: its value (every user change), its validity, touched and disabled states
    const [value, setValue] = useState<FdDate | null>(new FdDate(2024, 3, 9, 8, 0, 0));
    const [valid, setValid] = useState(true);
    const [touched, setTouched] = useState(false);
    const [disabled, setDisabled] = useState(false);
    return (
        <form onSubmit={(event) => event.preventDefault()}>
            <Heading>Required; leave a wrong value to see the error</Heading>
            <FormItem>
                <FormLabel htmlFor="dtp-form" required>
                    Start
                </FormLabel>
                <DatetimePicker
                    inputId="dtp-form"
                    date={value}
                    onValueChange={setValue}
                    onValidityChange={setValid}
                    onTouched={() => setTouched(true)}
                    disabled={disabled}
                    allowNull={false}
                    required
                    message="Enter a date and time such as 3/9/2024, 2:30 PM"
                    messageType="information"
                />
            </FormItem>
            <Value>
                Valid: {String(valid)}, touched: {String(touched)}, value: {show(value)}
            </Value>
            <div className="mt-2 flex gap-2">
                <Button label="Set to null" onClick={() => setValue(null)} />
                <Button label={disabled ? 'Enable' : 'Disable'} onClick={() => setDisabled(!disabled)} />
            </div>
        </form>
    );
}

export const Forms: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Also the Null Validity and Reactive Form upstream examples: `onValueChange`, `onValidityChange` and `onTouched` instead of a form control.'
            }
        }
    },
    render: () => <FormsExample />
};

const LOCALES = ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP', 'ar-EG'];

function LocaleExample() {
    const [locale, setLocale] = useState('en-US');
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9, 14, 30, 0));
    return (
        <DatetimeAdapterProvider locale={locale}>
            <Heading>Locale (an adapter of its own)</Heading>
            <FormItem>
                <FormLabel id="dtp-locale-select">Locale</FormLabel>
                <Select<string>
                    aria-labelledby="dtp-locale-select"
                    value={locale}
                    onValueChange={(code) => code && setLocale(code)}
                >
                    {LOCALES.map((code) => (
                        <SelectOption key={code} value={code}>
                            {code}
                        </SelectOption>
                    ))}
                </Select>
            </FormItem>
            <FormItem className="mt-3">
                <FormLabel htmlFor="dtp-locale">Date and time</FormLabel>
                <DatetimePicker inputId="dtp-locale" date={date} onDateChange={setDate} />
            </FormItem>
        </DatetimeAdapterProvider>
    );
}

export const Locale: Story = { render: () => <LocaleExample /> };

const MOBILE_CONFIG = { title: 'Meeting', approveButtonText: 'Save', cancelButtonText: 'Cancel' };

function MobileExample() {
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9, 14, 30, 0));
    return (
        <>
            <Heading>Mobile portrait: date or time</Heading>
            <DatetimePicker
                aria-label="Meeting"
                mobile
                date={date}
                onDateChange={setDate}
                mobileConfig={MOBILE_CONFIG}
            />

            <Heading>Mobile landscape: side by side</Heading>
            <DatetimePicker
                aria-label="Meeting, landscape"
                mobile
                mobileLandscape
                date={date}
                onDateChange={setDate}
                mobileConfig={{ title: 'Meeting' }}
            />
            <Value>Value: {show(date)}</Value>
        </>
    );
}

export const Mobile: Story = { render: () => <MobileExample /> };

/** A short month and a 24-hour clock for every picker below that has no format of its own. */
const CUSTOM_FORMATS: DateTimeFormats<FdDateTimeFormatOptions> = {
    ...FD_DATETIME_FORMATS,
    display: {
        ...FD_DATETIME_FORMATS.display,
        dateTimeInput: {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }
    }
};

const BASIC_FORMAT: FdDateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
};

function FormatsExample() {
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9, 14, 30, 0));
    return (
        <DateTimeFormatsProvider formats={CUSTOM_FORMATS}>
            <Heading>Format provided with DateTimeFormatsProvider</Heading>
            <DatetimePicker
                aria-label="Provided format"
                date={date}
                onDateChange={setDate}
                placeholder="MMM D, YYYY, HH:mm"
            />

            <Heading>A format of the picker (customDateTimeFormat)</Heading>
            <DatetimePicker
                aria-label="Long month"
                date={date}
                onDateChange={setDate}
                customDateTimeFormat={BASIC_FORMAT}
                className="w-80"
            />

            <Heading>With the period of the day</Heading>
            <DatetimePicker
                aria-label="Period of the day"
                date={date}
                onDateChange={setDate}
                customDateTimeFormat={{ ...BASIC_FORMAT, dayPeriod: true }}
                className="w-96"
            />
            <Value>Value: {show(date)}</Value>
        </DateTimeFormatsProvider>
    );
}

export const Formatting: Story = { render: () => <FormatsExample /> };

/* ------------------------------------------------------------------------------------------------------------------
 * Visual reference and open overlays
 * ---------------------------------------------------------------------------------------------------------------- */

/**
 * fundamental-styles has no datetime picker story: its date picker pattern (the field, the popover with a footer
 * bar) and its Mobile Portrait story (a date/time switch, which is the datetime picker's mobile layout) are the
 * references, with the same label, placeholder, button name and title.
 */
function ReferenceExample({ open = false, mobile = false }: { open?: boolean; mobile?: boolean }) {
    // the popover (or dialog) renders into the page, so the visual comparison finds it in the story
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    return (
        <div className="h-[34rem]">
            {/* as fundamental-styles, the label and the field share a box as wide as the label */}
            <div className="inline-block">
                <FormLabel htmlFor="todaySelectionDateInput">en-US DatePicker with today selection</FormLabel>
                {container && (
                    <DatetimePicker
                        className="block"
                        inputId="todaySelectionDateInput"
                        placeholder="Pick a date"
                        // the closed field shows the placeholder, as fundamental-styles'; open, the picker shows February 2018
                        defaultDate={open || mobile ? new FdDate(2018, 2, 18, 9, 0, 0) : null}
                        defaultOpen={open || mobile}
                        mobile={mobile}
                        mobileConfig={{ title: 'Pick a date' }}
                        container={container}
                        labels={{ toggleLabel: 'Choose Date' }}
                    />
                )}
            </div>
            <div ref={setContainer} />
        </div>
    );
}

export const Reference: Story = {
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' date picker pattern (Today Selection Button), for the visual comparison of the field."
            }
        }
    },
    render: () => <ReferenceExample />
};

export const ReferenceOpen: Story = {
    name: 'Reference: open',
    tags: ['!autodocs'],
    parameters: {
        docs: {
            description: {
                story: 'For the visual comparison: the picker is open and renders into the page (`container`).'
            }
        }
    },
    render: () => <ReferenceExample open />
};

export const ReferenceMobile: Story = {
    name: 'Reference: mobile',
    tags: ['!autodocs'],
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' Mobile Portrait story (a date/time switch), for the visual comparison: the dialog renders into the page."
            }
        }
    },
    render: () => <ReferenceExample mobile />
};

/** Opens the picker with its button (or its field, in mobile mode) and waits for the calendar, the time and the end of the transition. */
async function openPicker(canvasElement: HTMLElement, target: 'button' | 'input' = 'button'): Promise<void> {
    const control = canvasElement.querySelector<HTMLElement>(
        target === 'button' ? 'button[aria-label="Open picker"]' : 'input'
    )!;
    await userEvent.click(control);
    await waitFor(() => {
        expect(document.querySelector('[role=dialog] [role=grid]')).not.toBeNull();
        expect(document.querySelector('[role=dialog] [id$="-time-hours"]')).not.toBeNull();
    });
    const animated = [...document.querySelectorAll<HTMLElement>('[role=dialog], [data-dialog-backdrop]')];
    await Promise.all(animated.flatMap((el) => el.getAnimations().map((a) => a.finished)));
}

export const OpenPopover: Story = {
    name: 'Open: popover',
    tags: ['!autodocs'],
    render: () => (
        <DatetimePicker
            defaultDate={new FdDate(2024, 3, 9, 14, 30, 0)}
            message="Times are local"
            messageType="information"
        />
    ),
    play: ({ canvasElement }) => openPicker(canvasElement)
};

export const OpenMobile: Story = {
    name: 'Open: mobile',
    tags: ['!autodocs'],
    render: () => (
        <DatetimePicker mobile defaultDate={new FdDate(2024, 3, 9, 14, 30, 0)} mobileConfig={MOBILE_CONFIG} />
    ),
    play: ({ canvasElement }) => openPicker(canvasElement, 'input')
};

export const OpenMobileLandscape: Story = {
    name: 'Open: mobile landscape',
    tags: ['!autodocs'],
    render: () => (
        <DatetimePicker
            mobile
            mobileLandscape
            defaultDate={new FdDate(2024, 3, 9, 14, 30, 0)}
            mobileConfig={{ title: 'Meeting' }}
        />
    ),
    play: ({ canvasElement }) => openPicker(canvasElement, 'input')
};
