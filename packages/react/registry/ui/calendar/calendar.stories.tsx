import type { Meta, StoryObj } from '@storybook/react-vite';
import { useLayoutEffect, useRef, useState, type ComponentType, type FocusEvent, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { DatetimeAdapterProvider, FdDate, useDatetimeAdapter } from '@/lib/datetime';
import { ButtonBar } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogCloseButton,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle
} from '@/ui/dialog/dialog';
import { SegmentedButton, SegmentedButtonItem } from '@/ui/segmented-button/segmented-button';
import { Title } from '@/ui/title/title';
import {
    Calendar,
    CalendarCloseButton,
    CalendarLegend,
    CalendarLegendItem,
    DateRange,
    type CalendarActions,
    type CalendarCurrent,
    type CalendarProps,
    type CalendarYearGrid,
    type FdCalendarView,
    type SpecialDayRule
} from './calendar';

const HEADING = 'mt-6 mb-2 first:mt-0';
const VALUE = 'font-sap-font-family text-sap-font-size text-sap-text-color';
const ROW = 'flex flex-wrap items-start gap-6';

function Heading({ children }: { children: ReactNode }) {
    return (
        <Title level={3} headerSize={5} className={HEADING}>
            {children}
        </Title>
    );
}

function Value({ children, className }: { children: ReactNode; className?: string }) {
    return <p className={`${VALUE} ${className ?? ''}`}>{children}</p>;
}

/** Formats a date for the value lines of the stories. */
const show = (date: FdDate | null | undefined) => (date ? date.toDateString() : '-');

type PlaygroundArgs = Pick<
    CalendarProps,
    | 'calType'
    | 'allowMultipleSelection'
    | 'markWeekends'
    | 'showWeekNumbers'
    | 'startingDayOfWeek'
    | 'rangeHoverEffect'
    | 'showCalendarLegend'
    | 'legendCol'
    | 'defaultActiveView'
> & { locale: string; disableWeekends: boolean; disablePastDates: boolean; compact: boolean };

const meta = {
    title: 'Components/Calendar',
    component: Calendar,
    subcomponents: { CalendarLegend, CalendarLegendItem, CalendarCloseButton } as Record<
        string,
        ComponentType<unknown>
    >,
    parameters: {
        docs: {
            description: {
                component:
                    'A calendar picks a date, several dates, a range or several ranges; the header switches to month, year and years range views. Today, weekends, special days with a legend, week numbers and disabled dates show in the day view. ' +
                    'Dates go through the `DatetimeAdapter` of `useDatetimeAdapter()` (by default `FdDate` and `Intl` in the locale, see `DatetimeAdapterProvider`). The arrow keys move between the cells and change the month or page at the edges; Enter and Space select.'
            }
        }
    }
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundExample({ locale, disableWeekends, disablePastDates, compact, ...args }: PlaygroundArgs) {
    const [date, setDate] = useState<FdDate | null>(null);
    const [range, setRange] = useState<DateRange<FdDate> | null>(null);
    const disable = (d: FdDate) =>
        (disableWeekends && [1, 7].includes(d.getDayOfWeek())) ||
        (disablePastDates && d.getTimeStamp() < FdDate.getToday().getTimeStamp());
    const rules: SpecialDayRule<FdDate>[] = [
        { specialDayNumber: 5, legendText: 'Team meeting', rule: (d) => d.getDayOfWeek() === 3 },
        { specialDayNumber: 6, legendText: 'Release', appointment: true, rule: (d) => d.day === 15 }
    ];
    return (
        <DatetimeAdapterProvider locale={locale}>
            <div data-density={compact ? 'compact' : undefined}>
                <Calendar
                    key={`${args.defaultActiveView}`}
                    {...args}
                    selectedDate={date}
                    onSelectedDateChange={setDate}
                    selectedRangeDate={range}
                    onSelectedRangeDateChange={setRange}
                    disableFunction={disableWeekends || disablePastDates ? disable : undefined}
                    specialDaysRules={args.showCalendarLegend ? rules : []}
                />
            </div>
            <Value>
                {args.calType === 'range' ? `${show(range?.start)} – ${show(range?.end)}` : `Selected: ${show(date)}`}
            </Value>
        </DatetimeAdapterProvider>
    );
}

export const Playground: StoryObj<PlaygroundArgs> = {
    args: {
        calType: 'single',
        allowMultipleSelection: false,
        markWeekends: true,
        showWeekNumbers: false,
        rangeHoverEffect: false,
        showCalendarLegend: false,
        legendCol: false,
        defaultActiveView: 'day',
        locale: 'en-US',
        disableWeekends: false,
        disablePastDates: false,
        compact: false
    },
    argTypes: {
        calType: { control: 'inline-radio', options: ['single', 'range'] },
        defaultActiveView: { control: 'inline-radio', options: ['day', 'month', 'year', 'aggregatedYear'] },
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
    const adapter = useDatetimeAdapter();
    const disable = (d: FdDate) => {
        const day = adapter.getDayOfWeek(d);
        return day === 1 || day === 7 || adapter.compareDate(d, adapter.today()) < 0;
    };
    return (
        <div className={ROW}>
            <div>
                <Heading>Single date</Heading>
                <Calendar selectedDate={date} onSelectedDateChange={setDate} />
                <Value>Selected: {show(date)}</Value>
            </div>
            <div>
                <Heading>Week numbers, Monday first, no weekends</Heading>
                <Calendar showWeekNumbers startingDayOfWeek={2} markWeekends={false} />
            </div>
            <div>
                <Heading>Weekends and past days disabled</Heading>
                <Calendar defaultSelectedDate={null} disableFunction={disable} />
            </div>
        </div>
    );
}

export const Single: Story = { name: 'Single date', render: () => <SingleExample /> };

function RangesExample() {
    const [range, setRange] = useState<DateRange<FdDate> | null>(
        new DateRange(new FdDate(2024, 3, 6), new FdDate(2024, 3, 13))
    );
    const [dates, setDates] = useState<FdDate[]>([new FdDate(2024, 3, 4), new FdDate(2024, 3, 7)]);
    const [ranges, setRanges] = useState<DateRange<FdDate>[]>([
        new DateRange(new FdDate(2024, 3, 4), new FdDate(2024, 3, 6))
    ]);
    return (
        <div className={ROW}>
            <div>
                <Heading>Range with hover effect</Heading>
                <Calendar
                    calType="range"
                    rangeHoverEffect
                    selectedRangeDate={range}
                    onSelectedRangeDateChange={setRange}
                />
                <Value>
                    {show(range?.start)} – {show(range?.end)}
                </Value>
            </div>
            <div>
                <Heading>Several dates (Shift-click adds a span)</Heading>
                <Calendar
                    allowMultipleSelection
                    showWeekNumbers
                    selectedMultipleDates={dates}
                    onSelectedMultipleDatesChange={setDates}
                />
                <Value>{dates.length} dates</Value>
            </div>
            <div>
                <Heading>Several ranges</Heading>
                <Calendar
                    calType="range"
                    allowMultipleSelection
                    rangeHoverEffect
                    selectedMultipleDateRanges={ranges}
                    onSelectedMultipleDateRangesChange={setRanges}
                />
                <div className={VALUE}>
                    {ranges.map((r, index) => (
                        <span key={index} className="block">
                            {show(r.start)} – {show(r.end)}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export const Ranges: Story = { name: 'Ranges and several dates', render: () => <RangesExample /> };

const SPECIAL_RULES: SpecialDayRule<FdDate>[] = [
    { specialDayNumber: 5, legendText: 'Team meeting', rule: (d) => d.getDayOfWeek() === 3 },
    { specialDayNumber: 6, legendText: 'Release', appointment: true, rule: (d) => d.day === 15 },
    { specialDayNumber: 10, legendText: 'Holiday', rule: (d) => d.month === 3 && d.day === 29 }
];

export const SpecialDays: Story = {
    name: 'Special days, months and years',
    render: () => (
        <div className={ROW}>
            <div>
                <Heading>Special days with a legend</Heading>
                <Calendar
                    defaultSelectedDate={new FdDate(2024, 3, 9)}
                    specialDaysRules={SPECIAL_RULES}
                    showCalendarLegend
                />
            </div>
            <div>
                <Heading>Legend in a column</Heading>
                <Calendar
                    defaultSelectedDate={new FdDate(2024, 3, 9)}
                    specialDaysRules={SPECIAL_RULES}
                    showCalendarLegend
                    legendCol
                />
            </div>
            <div>
                <Heading>Months and years ranges</Heading>
                <div className="flex flex-col gap-4">
                    <Calendar calType="range" dateRangeFormat="month" defaultActiveView="month" rangeHoverEffect />
                    <Calendar calType="range" dateRangeFormat="year" defaultActiveView="year" rangeHoverEffect />
                </div>
            </div>
        </div>
    )
};

/** Five rows of three years; the years range view lists eight periods of 15 years. */
const YEAR_GRID: CalendarYearGrid = { rows: 5, cols: 3, yearMapping: (year) => `${year} AD` };
const AGGREGATED_YEAR_GRID: CalendarYearGrid = { rows: 8, cols: 1 };
const noEarlier = (_: unknown, current: CalendarCurrent, view: FdCalendarView) =>
    view === 'day' ? current.year <= 2024 && current.month <= 1 : current.year <= 2024;
const noLater = (_: unknown, current: CalendarCurrent, view: FdCalendarView) =>
    view === 'day' ? current.year >= 2024 && current.month >= 12 : current.year >= 2024;

function FormsExample() {
    const [model, setModel] = useState<FdDate | null>(new FdDate(2024, 6, 1));
    const [valid, setValid] = useState(true);
    return (
        <div className={ROW}>
            <div>
                <Heading>Form value</Heading>
                <Calendar selectedDate={model} onSelectedDateChange={setModel} onIsValidDateChange={setValid} />
                <Value>
                    Value: {show(model)}, valid: {String(valid)}
                </Value>
            </div>
            <div>
                <Heading>Navigation limited to 2024</Heading>
                <Calendar
                    defaultSelectedDate={new FdDate(2024, 6, 1)}
                    previousButtonDisableFunction={noEarlier}
                    nextButtonDisableFunction={noLater}
                />
            </div>
            <div>
                <Heading>Large year grid</Heading>
                <Calendar defaultActiveView="year" yearGrid={{ rows: 6, cols: 4 }} />
            </div>
            <div>
                <Heading>Own year and years range grids</Heading>
                <Calendar yearGrid={YEAR_GRID} aggregatedYearGrid={AGGREGATED_YEAR_GRID} />
            </div>
        </div>
    );
}

export const Forms: Story = { name: 'Forms and navigation', render: () => <FormsExample /> };

export const Locale: Story = {
    render: () => (
        <DatetimeAdapterProvider locale="de-DE">
            <Heading>German locale (an adapter of its own)</Heading>
            <Calendar defaultSelectedDate={new FdDate(2024, 3, 9)} showWeekNumbers />
        </DatetimeAdapterProvider>
    )
};

const LOCALES = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ar-EG', name: 'العربية' }
];

function LocaleSwitcherExample() {
    const [locale, setLocale] = useState('en-US');
    return (
        <DatetimeAdapterProvider locale={locale}>
            <Heading>Locale, switched live (BCP 47 tags)</Heading>
            <SegmentedButton aria-label="Locale" value={locale} onValueChange={setLocale}>
                {LOCALES.map((option) => (
                    <SegmentedButtonItem key={option.code} value={option.code} label={option.name} />
                ))}
            </SegmentedButton>
            <Value>Current locale: {locale}</Value>
            <Calendar defaultSelectedDate={new FdDate(2024, 3, 9)} showWeekNumbers />
        </DatetimeAdapterProvider>
    );
}

export const LocaleSwitcher: Story = { name: 'Locale switcher', render: () => <LocaleSwitcherExample /> };

/** A field as a form control: value, touched, dirty and valid. */
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
        /** A value from code, e.g. from a server. */
        write: setValue,
        /** Props for the calendar. */
        calendar: {
            onValueChange: () => setDirty(true),
            onIsValidDateChange: setValid,
            onBlur: (event: FocusEvent) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setTouched(true);
            }
        },
        status: `Touched: ${touched}, dirty: ${dirty}, valid: ${valid}`
    };
}

function ReactiveFormsExample() {
    const invalid = new FdDate(NaN);
    const date = useField<FdDate | null>(new FdDate(2024, 9, 20));
    const dates = useField<FdDate[]>([new FdDate(2024, 9, 2), new FdDate(2024, 9, 3), new FdDate(2024, 9, 4)]);
    const range = useField<DateRange<FdDate> | null>(new DateRange(new FdDate(2024, 10, 11), new FdDate(2024, 10, 19)));
    const ranges = useField<DateRange<FdDate>[]>([
        new DateRange(new FdDate(2024, 10, 1), new FdDate(2024, 10, 10)),
        new DateRange(new FdDate(2024, 10, 14), new FdDate(2024, 10, 18))
    ]);
    return (
        <form className={ROW} onSubmit={(event) => event.preventDefault()}>
            <div>
                <Heading>Single date</Heading>
                <Calendar
                    startingDayOfWeek={2}
                    selectedDate={date.value}
                    onSelectedDateChange={date.write}
                    {...date.calendar}
                />
                <Value>
                    {date.status}
                    <br />
                    Selected: {show(date.value)}
                </Value>
                <Button label="Set invalid date" onClick={() => date.write(invalid)} />
            </div>
            <div>
                <Heading>Several dates</Heading>
                <Calendar
                    allowMultipleSelection
                    showWeekNumbers
                    startingDayOfWeek={2}
                    selectedMultipleDates={dates.value}
                    onSelectedMultipleDatesChange={dates.write}
                    {...dates.calendar}
                />
                <Value>
                    {dates.status}
                    <br />
                    {dates.value.length} dates
                </Value>
                <Button label="Set invalid dates" onClick={() => dates.write([invalid])} />
            </div>
            <div>
                <Heading>Range</Heading>
                <Calendar
                    calType="range"
                    startingDayOfWeek={2}
                    selectedRangeDate={range.value}
                    onSelectedRangeDateChange={range.write}
                    {...range.calendar}
                />
                <Value>
                    {range.status}
                    <br />
                    {show(range.value?.start)} – {show(range.value?.end)}
                </Value>
                <Button label="Set invalid range" onClick={() => range.write(new DateRange(invalid, invalid))} />
            </div>
            <div>
                <Heading>Several ranges</Heading>
                <Calendar
                    calType="range"
                    allowMultipleSelection
                    startingDayOfWeek={2}
                    selectedMultipleDateRanges={ranges.value}
                    onSelectedMultipleDateRangesChange={ranges.write}
                    {...ranges.calendar}
                />
                <Value>
                    {ranges.status}
                    <br />
                    {ranges.value.length} ranges
                </Value>
                <Button label="Set invalid ranges" onClick={() => ranges.write([new DateRange(invalid, invalid)])} />
            </div>
        </form>
    );
}

export const ReactiveForms: Story = { name: 'Reactive forms', render: () => <ReactiveFormsExample /> };

function ProgrammaticExample() {
    const adapter = useDatetimeAdapter();
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 31));
    return (
        <>
            <Heading>The value changes from outside</Heading>
            <Calendar selectedDate={date} onSelectedDateChange={setDate} />
            <Value>Selected: {show(date)}</Value>
            <Button label="Next day" onClick={() => setDate(adapter.addCalendarDays(date ?? adapter.today(), 1))} />
        </>
    );
}

export const Programmatic: Story = { name: 'Programmatic date change', render: () => <ProgrammaticExample /> };

function MobileExample() {
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9));
    const [layout, setLayout] = useState<'landscape' | 'portrait' | null>(null);
    const [picked, setPicked] = useState<FdDate | null>(date);
    const open = (next: 'landscape' | 'portrait') => {
        setPicked(date);
        setLayout(next);
    };
    return (
        <>
            <Dialog open={layout !== null} onOpenChange={(next) => !next && setLayout(null)}>
                <DialogPopup
                    mobile
                    responsivePadding
                    verticalPadding={false}
                    width={layout === 'portrait' ? '22.5rem' : '40rem'}
                    height={layout === 'portrait' ? '40rem' : '25rem'}
                >
                    <DialogHeader>
                        <DialogTitle>Pick a date</DialogTitle>
                        <CalendarCloseButton render={<DialogCloseButton mobile />} />
                    </DialogHeader>
                    <DialogBody>
                        <Calendar
                            mobileLandscape={layout === 'landscape'}
                            mobilePortrait={layout === 'portrait'}
                            selectedDate={picked}
                            onSelectedDateChange={setPicked}
                            escapeFocusFunction={null}
                        />
                    </DialogBody>
                    <DialogFooter>
                        <DialogClose
                            render={<ButtonBar variant="emphasized" label="OK" />}
                            onClick={() => setDate(picked)}
                        />
                    </DialogFooter>
                </DialogPopup>
            </Dialog>
            <div className="flex flex-wrap gap-2">
                <Button label="Open in landscape mode" onClick={() => open('landscape')} />
                <Button label="Open in portrait mode" onClick={() => open('portrait')} />
            </div>
            <Value className="mt-2">Selected: {show(date)}</Value>
        </>
    );
}

export const Mobile: Story = { render: () => <MobileExample /> };

/** Clicks the button that opens the calendar dialog and waits for its grid and the end of its transition. */
async function openMobile(canvasElement: HTMLElement, label: string): Promise<void> {
    const button = [...canvasElement.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent!.includes(label)
    )!;
    await userEvent.click(button);
    await waitFor(() => expect(document.querySelector('[role=dialog][data-open] [role=grid]')).not.toBeNull());
    const animated = [...document.querySelectorAll<HTMLElement>('[role=dialog], [data-dialog-backdrop]')];
    await Promise.all(animated.flatMap((el) => el.getAnimations().map((a) => a.finished)));
}

export const OpenMobileLandscape: Story = {
    name: 'Open: mobile landscape',
    tags: ['!autodocs'],
    render: () => <MobileExample />,
    play: ({ canvasElement }) => openMobile(canvasElement, 'landscape')
};

export const OpenMobilePortrait: Story = {
    name: 'Open: mobile portrait',
    tags: ['!autodocs'],
    render: () => <MobileExample />,
    play: ({ canvasElement }) => openMobile(canvasElement, 'portrait')
};

/* ------------------------------------------------------------------------------------------------------------------
 * fundamental-react stories
 * ---------------------------------------------------------------------------------------------------------------- */

export const Compact: Story = {
    parameters: { docs: { description: { story: '`data-density="compact"` on the calendar or an ancestor.' } } },
    render: () => (
        <div data-density="compact">
            <Calendar defaultSelectedDate={new FdDate(2024, 3, 9)} />
        </div>
    )
};

function OpenToDateExample() {
    const actions = useRef<CalendarActions>(null);
    // fundamental-react's openToDate: show a month without selecting a date in it
    useLayoutEffect(() => actions.current?.setCurrentlyDisplayed(new FdDate(2000, 1, 1)), []);
    return <Calendar defaultSelectedDate={null} actionsRef={actions} />;
}

export const OpenToDate: Story = {
    name: 'Open to date',
    parameters: {
        docs: {
            description: {
                story: 'Shows January 2000 without a selection, with `actionsRef.current.setCurrentlyDisplayed(date)`.'
            }
        }
    },
    render: () => <OpenToDateExample />
};

function TodayButtonExample() {
    const adapter = useDatetimeAdapter();
    const actions = useRef<CalendarActions>(null);
    const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9));
    return (
        <div className="flex flex-col items-start gap-2">
            <Calendar selectedDate={date} onSelectedDateChange={setDate} actionsRef={actions} />
            <Button
                label="Today"
                onClick={() => {
                    setDate(adapter.today());
                    actions.current?.setCurrentlyDisplayed(adapter.today());
                }}
            />
        </div>
    );
}

export const TodayButton: Story = {
    name: 'Today button',
    parameters: {
        docs: {
            description: {
                story: "fundamental-react's `showToday`: a button next to the calendar selects and shows today."
            }
        }
    },
    render: () => <TodayButtonExample />
};

/* ------------------------------------------------------------------------------------------------------------------
 * The fundamental-styles reference: February 2018, as its Days, Months, Years and Legend stories
 * ---------------------------------------------------------------------------------------------------------------- */

const REFERENCE_RULES: SpecialDayRule<FdDate>[] = [
    { specialDayNumber: 7, rule: (d) => d.month === 2 && d.day === 17 },
    { specialDayNumber: 1, rule: (d) => d.month === 2 && d.day === 18 },
    { specialDayNumber: 5, rule: (d) => d.month === 2 && d.day === 19 },
    { specialDayNumber: 3, rule: (d) => d.month === 2 && d.day === 24 },
    { specialDayNumber: 9, rule: (d) => d.month === 2 && d.day === 25 }
];

export const Reference: Story = {
    name: 'Views (fundamental-styles reference)',
    parameters: {
        docs: {
            description: {
                story: 'February 2018 with a range from the 13th to the 18th, special days and week numbers; the month and year views of 2018; today, unselected and selected (the default selection); a legend. The dates of the fundamental-styles stories, for the visual comparison.'
            }
        }
    },
    render: () => (
        <div className={ROW}>
            <Calendar
                showWeekNumbers
                startingDayOfWeek={1}
                calType="range"
                defaultSelectedRangeDate={new DateRange(new FdDate(2018, 2, 13), new FdDate(2018, 2, 18))}
                specialDaysRules={REFERENCE_RULES}
                aria-label="Days"
            />
            <Calendar defaultActiveView="month" defaultSelectedDate={new FdDate(2018, 3, 1)} aria-label="Months" />
            <Calendar defaultActiveView="year" defaultSelectedDate={new FdDate(2018, 3, 1)} aria-label="Years" />
            <Calendar defaultSelectedDate={null} markWeekends={false} aria-label="Today" />
            <Calendar markWeekends={false} aria-label="Today selected" />
            <CalendarLegend
                className="min-w-[420px]"
                labels={{ dateSelectedLabel: 'Selected', workDayLabel: 'Work Day', nonWorkDayLabel: 'Non-Work Day' }}
                specialDaysRules={[
                    { specialDayNumber: 1, legendText: 'Holiday', rule: () => false },
                    { specialDayNumber: 2, legendText: 'School Vacation', rule: () => false },
                    { specialDayNumber: 3, legendText: 'Wedding', rule: () => false },
                    { specialDayNumber: 11, legendText: 'Appointment', appointment: true, rule: () => false }
                ]}
            />
        </div>
    )
};
