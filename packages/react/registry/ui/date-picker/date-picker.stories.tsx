import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type FocusEvent, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import {
    DateTimeFormatsProvider,
    DatetimeAdapterProvider,
    FD_DATETIME_FORMATS,
    FdDate,
    type DateTimeFormats,
    type FdDateTimeFormatOptions
} from '@/lib/datetime';
import { Button } from '@/ui/button/button';
import { DateRange, type CalendarCurrent, type FdCalendarView, type SpecialDayRule } from '@/ui/calendar/calendar';
import { FormItem, FormLabel } from '@/ui/form/form';
import { SegmentedButton, SegmentedButtonItem } from '@/ui/segmented-button/segmented-button';
import { Title } from '@/ui/title/title';
import { DatePicker, type DatePickerProps, type DatePickerState } from './date-picker';

const HEADING = 'mt-6 mb-2 first:mt-0';
const VALUE = 'mt-1 font-sap-font-family text-sap-font-size text-sap-text-color';
const ROW = 'flex flex-wrap items-start gap-6';

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

/** Formats a date for the value lines of the stories. */
const show = (date: FdDate | null | undefined) => (date ? date.toDateString() : 'none');

const meta = {
    title: 'Components/Date Picker',
    component: DatePicker,
    parameters: {
        docs: {
            description: {
                component:
                    'A date picker is a date field with a button that opens a calendar. It picks a date, a range, or several dates or ranges. Typed dates are read while typing (or on Enter and blur with `processInputOnBlur`); an unreadable or disabled date sets the error state. ' +
                    'F4 and Alt+Down open the calendar, Escape closes it and returns to the field. In mobile mode the calendar opens in a dialog that can be approved or cancelled. ' +
                    'Dates go through the `DatetimeAdapter` of `useDatetimeAdapter()` (by default `FdDate`, see `DatetimeAdapterProvider`) and the formats of `DateTimeFormatsProvider`.'
            }
        }
    }
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------------------------------------------------------
 * Playground (fundamental-react's Dev story)
 * ---------------------------------------------------------------------------------------------------------------- */

type PlaygroundArgs = Pick<
    DatePickerProps,
    | 'type'
    | 'allowMultipleSelection'
    | 'placeholder'
    | 'disabled'
    | 'readOnly'
    | 'state'
    | 'message'
    | 'messageType'
    | 'processInputOnBlur'
    | 'showTodayButton'
    | 'closeOnDateChoose'
    | 'showWeekNumbers'
    | 'markWeekends'
    | 'startingDayOfWeek'
    | 'rangeHoverEffect'
    | 'mobile'
> & { locale: string; compact: boolean; disableWeekends: boolean; disablePastDates: boolean };

function PlaygroundExample({ locale, compact, disableWeekends, disablePastDates, ...args }: PlaygroundArgs) {
    const disable = (d: FdDate) =>
        (disableWeekends && [1, 7].includes(d.getDayOfWeek())) ||
        (disablePastDates && d.getTimeStamp() < FdDate.getToday().getTimeStamp());
    return (
        <DatetimeAdapterProvider locale={locale}>
            <FormItem data-density={compact ? 'compact' : undefined}>
                <FormLabel htmlFor="dev-datepicker">Date</FormLabel>
                <DatePicker
                    key={`${args.type}-${args.allowMultipleSelection}`}
                    inputId="dev-datepicker"
                    {...args}
                    disableFunction={disableWeekends || disablePastDates ? disable : undefined}
                    disableRangeStartFunction={disableWeekends || disablePastDates ? disable : undefined}
                    disableRangeEndFunction={disableWeekends || disablePastDates ? disable : undefined}
                    mobileConfig={{ title: 'Date', approveButtonText: 'Save', cancelButtonText: 'Cancel' }}
                />
            </FormItem>
        </DatetimeAdapterProvider>
    );
}

export const Playground: StoryObj<PlaygroundArgs> = {
    args: {
        type: 'single',
        allowMultipleSelection: false,
        placeholder: 'Pick a date',
        disabled: false,
        readOnly: false,
        state: null,
        message: '',
        messageType: 'default',
        processInputOnBlur: false,
        showTodayButton: true,
        closeOnDateChoose: true,
        showWeekNumbers: true,
        markWeekends: true,
        rangeHoverEffect: false,
        mobile: false,
        locale: 'en-US',
        compact: false,
        disableWeekends: false,
        disablePastDates: false
    },
    argTypes: {
        type: { control: 'inline-radio', options: ['single', 'range'] },
        state: { control: 'select', options: [null, 'success', 'error', 'warning', 'information'] },
        messageType: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] },
        startingDayOfWeek: { control: 'select', options: [undefined, 1, 2, 3, 4, 5, 6, 7] },
        locale: { control: 'text' }
    },
    render: (args) => <PlaygroundExample {...args} />
};

/* ------------------------------------------------------------------------------------------------------------------
 * Angular stories
 * ---------------------------------------------------------------------------------------------------------------- */

function SingleExample() {
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9));
    return (
        <>
            <Heading>Single date</Heading>
            <FormItem>
                <FormLabel htmlFor="dp-single">Delivery date</FormLabel>
                <DatePicker
                    inputId="dp-single"
                    placeholder="mm/dd/yyyy"
                    selectedDate={date}
                    onSelectedDateChange={setDate}
                />
            </FormItem>
            <Value>Date: {show(date)}</Value>

            <Heading>Long format, today button, week starts on Monday</Heading>
            <DatePicker
                selectedDate={date}
                onSelectedDateChange={setDate}
                customDateTimeFormat={{ year: 'numeric', month: 'long', day: 'numeric' }}
                startingDayOfWeek={2}
                showWeekNumbers={false}
                showTodayButton
            />

            <Heading>Read on Enter and blur only, opening above</Heading>
            <DatePicker selectedDate={date} onSelectedDateChange={setDate} processInputOnBlur placement="top-start" />

            <Heading>Months and years</Heading>
            <div className="flex flex-wrap gap-4">
                <DatePicker
                    selectedDate={date}
                    onSelectedDateChange={setDate}
                    dateRangeFormat="month"
                    aria-label="Month"
                />
                <DatePicker
                    selectedDate={date}
                    onSelectedDateChange={setDate}
                    dateRangeFormat="year"
                    aria-label="Year"
                />
            </div>

            <Heading>States and messages</Heading>
            <div className="flex flex-col items-start gap-3">
                <DatePicker selectedDate={date} state="success" message="Date is available" messageType="success" />
                <DatePicker selectedDate={date} state="warning" message="Weekend delivery" messageType="warning" />
                <DatePicker
                    selectedDate={date}
                    state="information"
                    message="Dates are local"
                    messageType="information"
                />
                <DatePicker selectedDate={date} disabled />
            </div>
        </>
    );
}

export const Single: Story = { render: () => <SingleExample /> };

function RangeExample() {
    const [range, setRange] = useState<DateRange<FdDate> | null>(
        new DateRange(new FdDate(2024, 3, 4), new FdDate(2024, 3, 8))
    );
    const [dates, setDates] = useState([new FdDate(2024, 3, 4), new FdDate(2024, 3, 6)]);
    const [ranges, setRanges] = useState([
        new DateRange(new FdDate(2024, 3, 4), new FdDate(2024, 3, 6)),
        new DateRange(new FdDate(2024, 3, 18), new FdDate(2024, 3, 20))
    ]);
    return (
        <>
            <Heading>Range with hover effect</Heading>
            <DatePicker
                type="range"
                selectedRangeDate={range}
                onSelectedRangeDateChange={setRange}
                rangeHoverEffect
                showTodayButton
            />
            <Value>
                Range: {show(range?.start)} to {show(range?.end)}
            </Value>

            <Heading>Multiple dates (Shift+click fills a span)</Heading>
            <DatePicker
                allowMultipleSelection
                selectedMultipleDates={dates}
                onSelectedMultipleDatesChange={setDates}
                className="w-96"
            />
            <Value>{dates.length} dates</Value>

            <Heading>Multiple ranges</Heading>
            <DatePicker
                type="range"
                allowMultipleSelection
                selectedMultipleDateRanges={ranges}
                onSelectedMultipleDateRangesChange={setRanges}
                className="w-96"
            />
            <Value>{ranges.length} ranges</Value>
        </>
    );
}

export const RangeAndMultiple: Story = { name: 'Range and multiple', render: () => <RangeExample /> };

/** A picker as a form control: value, touched, dirty and valid. */
function useField<T>(initial: T) {
    const [value, setValue] = useState(initial);
    const [touched, setTouched] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [valid, setValid] = useState(true);
    return {
        value,
        touched,
        dirty,
        valid,
        write: setValue,
        /** Props for the picker. */
        picker: {
            onValueChange: () => setDirty(true),
            onValidityChange: setValid,
            onBlur: (event: FocusEvent) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setTouched(true);
            }
        },
        status: `Touched: ${touched}, dirty: ${dirty}, valid: ${valid}`
    };
}

const weekend = (date: FdDate) => [1, 7].includes(date.getDayOfWeek());
const after2024 = (date: FdDate) => date.year > 2024;
const atStart = (_: unknown, current: CalendarCurrent, view: FdCalendarView) =>
    view === 'day' ? current.year <= 2024 && current.month <= 1 : current.year <= 2024;
const atEnd = (_: unknown, current: CalendarCurrent, view: FdCalendarView) =>
    view === 'day' ? current.year >= 2024 && current.month >= 12 : current.year >= 2024;

function DisableExample() {
    const date = useField<FdDate | null>(new FdDate(2024, 3, 12));
    const dates = useField<FdDate[]>([new FdDate(2024, 3, 12)]);
    const range = useField<DateRange<FdDate> | null>(new DateRange(new FdDate(2024, 3, 11), new FdDate(2024, 3, 15)));
    const [navigated, setNavigated] = useState<FdDate | null>(new FdDate(2024, 3, 12));
    const state = (valid: boolean): DatePickerState => (valid ? 'success' : 'error');
    return (
        <form onSubmit={(event) => event.preventDefault()}>
            <Heading>Weekends disabled; typing one makes the control invalid</Heading>
            <FormItem>
                <FormLabel htmlFor="dp-disable-single">Date</FormLabel>
                <DatePicker
                    inputId="dp-disable-single"
                    selectedDate={date.value}
                    onSelectedDateChange={date.write}
                    {...date.picker}
                    disableFunction={weekend}
                    state={state(date.valid)}
                    message={date.valid ? 'The date is a weekday' : 'Pick a weekday'}
                    messageType={state(date.valid)}
                />
            </FormItem>
            <Value>
                {date.status}, date: {show(date.value)}
            </Value>

            <Heading>Multiple dates, weekends disabled</Heading>
            <FormItem>
                <FormLabel htmlFor="dp-disable-multi">Dates</FormLabel>
                <DatePicker
                    inputId="dp-disable-multi"
                    allowMultipleSelection
                    className="w-96"
                    selectedMultipleDates={dates.value}
                    onSelectedMultipleDatesChange={dates.write}
                    {...dates.picker}
                    disableFunction={weekend}
                    state={state(dates.valid)}
                    message={dates.valid ? 'All dates are weekdays' : 'Pick weekdays only'}
                    messageType={state(dates.valid)}
                />
            </FormItem>
            <Value>
                {dates.status}, {dates.value.length} dates
            </Value>

            <Heading>Range starting on a weekday and ending in 2024</Heading>
            <FormItem>
                <FormLabel htmlFor="dp-disable-range">Period</FormLabel>
                <DatePicker
                    inputId="dp-disable-range"
                    type="range"
                    selectedRangeDate={range.value}
                    onSelectedRangeDateChange={range.write}
                    {...range.picker}
                    disableRangeStartFunction={weekend}
                    disableRangeEndFunction={after2024}
                    state={state(range.valid)}
                    message={range.valid ? '' : 'Start on a weekday and end in 2024'}
                    messageType="error"
                />
            </FormItem>
            <Value>
                {range.status}, start: {show(range.value?.start)}, end: {show(range.value?.end)}
            </Value>

            <Heading>Navigation limited to 2024</Heading>
            <DatePicker
                selectedDate={navigated}
                onSelectedDateChange={setNavigated}
                previousButtonDisableFunction={atStart}
                nextButtonDisableFunction={atEnd}
            />
        </form>
    );
}

export const DisableFunctions: Story = { name: 'Disable functions', render: () => <DisableExample /> };

const RULES: SpecialDayRule<FdDate>[] = [
    { specialDayNumber: 5, legendText: 'Team meeting', rule: (d) => d.getDayOfWeek() === 3 },
    { specialDayNumber: 6, legendText: 'Release', appointment: true, rule: (d) => d.day === 15 },
    { specialDayNumber: 10, legendText: 'Holiday', rule: (d) => d.month === 3 && d.day === 29 }
];

function SpecialDaysExample() {
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9));
    return (
        <>
            <Heading>Special days and a legend</Heading>
            <DatePicker
                selectedDate={date}
                onSelectedDateChange={setDate}
                specialDaysRules={RULES}
                showCalendarLegend
            />

            <Heading>Legend in a column</Heading>
            <DatePicker
                selectedDate={date}
                onSelectedDateChange={setDate}
                specialDaysRules={RULES}
                showCalendarLegend
                legendCol
            />
        </>
    );
}

export const SpecialDays: Story = { name: 'Special days', render: () => <SpecialDaysExample /> };

function FormsExample() {
    const single = useField<FdDate | null>(null);
    const range = useField<DateRange<FdDate> | null>(new DateRange(new FdDate(2024, 3, 4), new FdDate(2024, 3, 8)));
    const multi = useField<FdDate[]>([new FdDate(2024, 3, 4)]);
    const multiRange = useField<DateRange<FdDate>[]>([new DateRange(new FdDate(2024, 3, 4), new FdDate(2024, 3, 6))]);
    return (
        <form onSubmit={(event) => event.preventDefault()}>
            <Heading>Required; type a wrong date to see the error</Heading>
            <FormItem>
                <FormLabel htmlFor="dp-form" required>
                    Start
                </FormLabel>
                <DatePicker
                    inputId="dp-form"
                    selectedDate={single.value}
                    onSelectedDateChange={single.write}
                    {...single.picker}
                    allowNull={false}
                    required
                    message="Enter a date such as 3/9/2024"
                    messageType="error"
                    state={!single.valid && single.touched ? 'error' : null}
                />
            </FormItem>
            <Value>
                {single.status}, value: {show(single.value)}
            </Value>

            <Heading>Range</Heading>
            <DatePicker
                type="range"
                aria-label="Range"
                selectedRangeDate={range.value}
                onSelectedRangeDateChange={range.write}
                {...range.picker}
            />
            <Value>
                Valid: {String(range.valid)}, value: {show(range.value?.start)} to {show(range.value?.end)}
            </Value>

            <Heading>Multiple dates and multiple ranges</Heading>
            <div className="flex flex-col items-start gap-3">
                <DatePicker
                    allowMultipleSelection
                    className="w-96"
                    selectedMultipleDates={multi.value}
                    onSelectedMultipleDatesChange={multi.write}
                    {...multi.picker}
                />
                <DatePicker
                    type="range"
                    allowMultipleSelection
                    className="w-96"
                    selectedMultipleDateRanges={multiRange.value}
                    onSelectedMultipleDateRangesChange={multiRange.write}
                    {...multiRange.picker}
                />
            </div>
            <Value>
                {multi.value.length} dates, {multiRange.value.length} ranges
            </Value>
        </form>
    );
}

export const Forms: Story = { render: () => <FormsExample /> };

const LOCALES = ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP', 'ar-EG'];

function LocaleExample() {
    const [locale, setLocale] = useState('en-US');
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9));
    const [range, setRange] = useState<DateRange<FdDate> | null>(
        new DateRange(new FdDate(2024, 3, 4), new FdDate(2024, 3, 8))
    );
    return (
        <DatetimeAdapterProvider locale={locale}>
            <Heading>Locale (an adapter of its own)</Heading>
            <SegmentedButton aria-label="Locale" value={locale} onValueChange={setLocale}>
                {LOCALES.map((code) => (
                    <SegmentedButtonItem key={code} value={code} label={code} />
                ))}
            </SegmentedButton>
            <FormItem className="mt-3">
                <FormLabel htmlFor="dp-locale">Date</FormLabel>
                <DatePicker inputId="dp-locale" selectedDate={date} onSelectedDateChange={setDate} />
            </FormItem>
            <FormItem className="mt-3">
                <FormLabel htmlFor="dp-locale-range">Range</FormLabel>
                <DatePicker
                    inputId="dp-locale-range"
                    type="range"
                    selectedRangeDate={range}
                    onSelectedRangeDateChange={setRange}
                />
            </FormItem>
        </DatetimeAdapterProvider>
    );
}

export const Locale: Story = {
    parameters: {
        docs: { description: { story: "Also fundamental-react's Localized story (`es`, `fr`): set `locale`." } }
    },
    render: () => <LocaleExample />
};

const MOBILE_CONFIG = { title: 'Delivery date', approveButtonText: 'Save', cancelButtonText: 'Cancel' };

function MobileExample() {
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9));
    const [range, setRange] = useState<DateRange<FdDate> | null>(null);
    return (
        <>
            <Heading>Mobile: the calendar opens in a dialog</Heading>
            <DatePicker mobile selectedDate={date} onSelectedDateChange={setDate} mobileConfig={MOBILE_CONFIG} />
            <Value>Date: {show(date)}</Value>

            <Heading>Mobile range</Heading>
            <DatePicker
                mobile
                type="range"
                selectedRangeDate={range}
                onSelectedRangeDateChange={setRange}
                mobileConfig={{ title: 'Trip', approveButtonText: 'Save', cancelButtonText: 'Cancel' }}
            />
        </>
    );
}

export const Mobile: Story = { render: () => <MobileExample /> };

/** Two-digit dates and " to " between the ends of a range, for every picker below. */
const CUSTOM_FORMATS: DateTimeFormats<FdDateTimeFormatOptions> = {
    ...FD_DATETIME_FORMATS,
    display: { ...FD_DATETIME_FORMATS.display, dateInput: { year: '2-digit', month: '2-digit', day: '2-digit' } },
    rangeDelimiter: ' to '
};

function FormatsExample() {
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9));
    const [dates, setDates] = useState([new FdDate(2024, 3, 4), new FdDate(2024, 3, 5), new FdDate(2024, 3, 6)]);
    const [range, setRange] = useState<DateRange<FdDate> | null>(
        new DateRange(new FdDate(2024, 3, 9), new FdDate(2024, 3, 10))
    );
    const [ranges, setRanges] = useState([
        new DateRange(new FdDate(2024, 8, 1), new FdDate(2024, 8, 6)),
        new DateRange(new FdDate(2024, 8, 10), new FdDate(2024, 8, 15)),
        new DateRange(new FdDate(2024, 8, 20), new FdDate(2024, 8, 25))
    ]);
    return (
        <DateTimeFormatsProvider formats={CUSTOM_FORMATS}>
            <Heading>Formats provided with DateTimeFormatsProvider (two digits)</Heading>
            <DatePicker selectedDate={date} onSelectedDateChange={setDate} placeholder="mm/dd/yy" />

            <Heading>A format of the picker (customDateTimeFormat)</Heading>
            <DatePicker
                selectedDate={date}
                onSelectedDateChange={setDate}
                customDateTimeFormat={{ year: '2-digit', month: 'long', day: '2-digit' }}
            />

            <Heading>Multiple dates</Heading>
            <DatePicker
                allowMultipleSelection
                className="w-96"
                selectedMultipleDates={dates}
                onSelectedMultipleDatesChange={setDates}
            />

            <Heading>Range, with &quot; to &quot; between the dates</Heading>
            <DatePicker
                type="range"
                selectedRangeDate={range}
                onSelectedRangeDateChange={setRange}
                placeholder="mm/dd/yy to mm/dd/yy"
            />

            <Heading>Multiple ranges</Heading>
            <DatePicker
                type="range"
                allowMultipleSelection
                className="w-[32rem]"
                selectedMultipleDateRanges={ranges}
                onSelectedMultipleDateRangesChange={setRanges}
            />
        </DateTimeFormatsProvider>
    );
}

export const CustomFormats: Story = {
    name: 'Custom formats',
    parameters: {
        docs: {
            description: {
                story: "Also fundamental-react's Date Formats story: formats are `Intl.DateTimeFormat` options of the adapter instead of Moment patterns."
            }
        }
    },
    render: () => <FormatsExample />
};

function ScrollExample() {
    const [preventScroll, setPreventScroll] = useState(false);
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9));
    return (
        <>
            <Heading>Prevent scrolling when the calendar closes</Heading>
            <Value>
                Scroll the box so the field is partly out of view, open the calendar and close it with Escape. Scrolling
                to the field on focus is {preventScroll ? 'off' : 'on'}.
            </Value>
            <Button className="my-2" label="Toggle scroll on focus" onClick={() => setPreventScroll(!preventScroll)} />
            <div
                tabIndex={0}
                aria-label="Scrolling box"
                role="region"
                className="h-40 overflow-auto rounded-sap-element-border-corner-radius border border-sap-group-content-border-color p-4"
            >
                <div className="h-32"></div>
                <DatePicker
                    selectedDate={date}
                    onSelectedDateChange={setDate}
                    preventScrollOnFocus={preventScroll}
                    allowNull={false}
                />
                <div className="h-64"></div>
            </div>
            <Value>Date: {show(date)}</Value>
        </>
    );
}

export const PreventScrollOnFocus: Story = { name: 'Prevent scroll on focus', render: () => <ScrollExample /> };

/* ------------------------------------------------------------------------------------------------------------------
 * fundamental-react stories
 * ---------------------------------------------------------------------------------------------------------------- */

export const Primary: Story = {
    render: () => (
        <FormItem>
            <FormLabel htmlFor="primary-datepicker">Date</FormLabel>
            <DatePicker inputId="primary-datepicker" />
        </FormItem>
    )
};

export const Compact: Story = {
    parameters: { docs: { description: { story: '`data-density="compact"` on the picker or an ancestor.' } } },
    render: () => (
        <FormItem data-density="compact">
            <FormLabel htmlFor="compact-datepicker">Date</FormLabel>
            <DatePicker inputId="compact-datepicker" />
        </FormItem>
    )
};

export const Disabled: Story = {
    render: () => (
        <FormItem>
            <FormLabel htmlFor="disabled-datepicker">Date</FormLabel>
            <DatePicker inputId="disabled-datepicker" disabled />
        </FormItem>
    )
};

export const ReadOnly: Story = {
    name: 'Read-only',
    render: () => (
        <FormItem>
            <FormLabel htmlFor="readOnly-datepicker">Date</FormLabel>
            <DatePicker inputId="readOnly-datepicker" readOnly defaultSelectedDate={new FdDate(2012, 12, 12)} />
        </FormItem>
    )
};

export const OpenToDate: Story = {
    name: 'Open to date',
    parameters: { docs: { description: { story: 'Without a value the calendar opens on January 2000.' } } },
    render: () => (
        <FormItem>
            <FormLabel htmlFor="openTo-datepicker">Date</FormLabel>
            <DatePicker inputId="openTo-datepicker" openToDate={new FdDate(2000, 1, 1)} />
        </FormItem>
    )
};

export const RangeSelection: Story = {
    name: 'Range selection',
    render: () => (
        <div className={ROW}>
            <FormItem>
                <FormLabel htmlFor="rangeSelection">Select a date range</FormLabel>
                <DatePicker inputId="rangeSelection" type="range" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="rangeSelectionDefaultValue">Select a date range (default set)</FormLabel>
                <DatePicker
                    inputId="rangeSelectionDefaultValue"
                    type="range"
                    defaultSelectedRangeDate={new DateRange(new FdDate(1992, 12, 30), new FdDate(1993, 12, 4))}
                />
            </FormItem>
        </div>
    )
};

export const ValidationStates: Story = {
    name: 'Validation states',
    render: () => (
        <div className={ROW}>
            {(['error', 'warning', 'success', 'information'] as const).map((state) => (
                <FormItem key={state}>
                    <FormLabel htmlFor={`${state}-state`}>Date</FormLabel>
                    <DatePicker
                        inputId={`${state}-state`}
                        state={state}
                        message="Test validation state"
                        messageType={state}
                    />
                </FormItem>
            ))}
        </div>
    )
};

export const WeekdayStart: Story = {
    name: 'Weekday start (Monday)',
    render: () => (
        <FormItem>
            <FormLabel htmlFor="weekday-start">Date</FormLabel>
            <DatePicker inputId="weekday-start" startingDayOfWeek={2} />
        </FormItem>
    )
};

export const TodayButton: Story = {
    name: 'Today button',
    parameters: {
        docs: {
            description: {
                story: "fundamental-react's `todayActionType`: `showTodayButton` selects today and closes (`select`); with `closeOnDateChoose={false}` it selects today and stays open (`navigate`). `todayButtonLabel` localizes it."
            }
        }
    },
    render: () => (
        <div className={ROW}>
            <FormItem data-density="compact">
                <FormLabel htmlFor="englishTodayButtonDP">Compact date picker with today selection button</FormLabel>
                <DatePicker inputId="englishTodayButtonDP" showTodayButton />
            </FormItem>
            <DatetimeAdapterProvider locale="hi-IN">
                <FormItem>
                    <FormLabel htmlFor="hindiTodayButtonDP">
                        Today button that stays open, custom locale, and default date
                    </FormLabel>
                    <DatePicker
                        inputId="hindiTodayButtonDP"
                        showTodayButton
                        closeOnDateChoose={false}
                        todayButtonLabel="आज"
                        defaultSelectedDate={new FdDate(1992, 12, 30)}
                    />
                </FormItem>
            </DatetimeAdapterProvider>
        </div>
    )
};

export const FlipContainer: Story = {
    name: 'Flip',
    parameters: {
        docs: {
            description: {
                story: "fundamental-react's custom flip container: in a scrolling box with no room below the field, the calendar opens above it."
            }
        }
    },
    render: () => (
        <div
            tabIndex={0}
            role="region"
            aria-label="Box with little room"
            className="h-[30rem] overflow-auto border border-sap-group-content-border-color p-4"
        >
            <div className="h-[26rem]"></div>
            <FormItem>
                <FormLabel htmlFor="flip-container">Date</FormLabel>
                <DatePicker inputId="flip-container" />
            </FormItem>
        </div>
    )
};

/* ------------------------------------------------------------------------------------------------------------------
 * Visual reference and open overlays
 * ---------------------------------------------------------------------------------------------------------------- */

function ReferenceExample({ open = false, mobile = false }: { open?: boolean; mobile?: boolean }) {
    // the popover (or dialog) renders into the page, so the visual comparison finds it in the story
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    return (
        <div className="h-[30rem]">
            {/* as fundamental-styles, the label and the field share a box as wide as the label */}
            <div className="inline-block">
                <FormLabel htmlFor="todaySelectionDateInput">en-US DatePicker with today selection</FormLabel>
                {container && (
                    <DatePicker
                        className="block"
                        inputId="todaySelectionDateInput"
                        placeholder="Pick a date"
                        showTodayButton
                        openToDate={new FdDate(2018, 2, 1)}
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
                story: "fundamental-styles' Today Selection Button story, for the visual comparison (the field; `Reference: open` shows the calendar)."
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
                story: "fundamental-styles' Today Selection Button story, for the visual comparison: the calendar is open and renders into the page (`container`)."
            }
        }
    },
    render: () => <ReferenceExample open />
};

/** Opens the picker with its button (or its field) and waits for the calendar and the end of its transition. */
async function openPicker(canvasElement: HTMLElement, target: 'button' | 'input' = 'button'): Promise<void> {
    const control = canvasElement.querySelector<HTMLElement>(
        target === 'button' ? 'button[aria-label="Open picker"], button[aria-label="Choose Date"]' : 'input'
    )!;
    await userEvent.click(control);
    await waitFor(() => expect(document.querySelector('[role=dialog] [role=grid]')).not.toBeNull());
    const animated = [...document.querySelectorAll<HTMLElement>('[role=dialog], [data-dialog-backdrop]')];
    await Promise.all(animated.flatMap((el) => el.getAnimations().map((a) => a.finished)));
}

export const OpenCalendar: Story = {
    name: 'Open: calendar',
    tags: ['!autodocs'],
    render: () => (
        <DatePicker
            defaultSelectedDate={new FdDate(2024, 3, 9)}
            showTodayButton
            message="Dates are local"
            messageType="information"
        />
    ),
    play: ({ canvasElement }) => openPicker(canvasElement)
};

export const OpenRange: Story = {
    name: 'Open: range',
    tags: ['!autodocs'],
    render: () => (
        <DatePicker
            type="range"
            defaultSelectedRangeDate={new DateRange(new FdDate(2024, 3, 4), new FdDate(2024, 3, 8))}
            rangeHoverEffect
            showTodayButton
        />
    ),
    play: ({ canvasElement }) => openPicker(canvasElement)
};

export const OpenLegend: Story = {
    name: 'Open: legend',
    tags: ['!autodocs'],
    render: () => (
        <DatePicker
            defaultSelectedDate={new FdDate(2024, 3, 9)}
            specialDaysRules={RULES}
            showCalendarLegend
            legendCol
        />
    ),
    play: ({ canvasElement }) => openPicker(canvasElement)
};

export const OpenMobile: Story = {
    name: 'Open: mobile',
    tags: ['!autodocs'],
    render: () => <DatePicker mobile defaultSelectedDate={new FdDate(2024, 3, 9)} mobileConfig={MOBILE_CONFIG} />,
    play: ({ canvasElement }) => openPicker(canvasElement, 'input')
};

export const ReferenceMobile: Story = {
    name: 'Reference: mobile',
    tags: ['!autodocs'],
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' Mobile Portrait story, for the visual comparison: the dialog renders into the page."
            }
        }
    },
    render: () => <ReferenceExample mobile />
};
