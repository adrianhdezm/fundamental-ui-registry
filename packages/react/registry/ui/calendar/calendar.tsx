/*
 * Port of fundamental-react (Calendar) and @fundamental-ngx/core (calendar) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    createContext,
    useContext,
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type CSSProperties,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    type Ref,
    type RefCallback
} from 'react';
import { useDateTimeFormats, useDatetimeAdapter, type FdDate } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import { Button, buttonVariants, type ButtonProps } from '@/ui/button/button';

export type CalendarType = 'single' | 'range';
export type FdCalendarView = 'day' | 'month' | 'year' | 'aggregatedYear';
/** Day of the week from 1 (Sunday) to 7 (Saturday). */
export type DaysOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** The month shown. */
export interface CalendarCurrent {
    month: number;
    year: number;
}

/** A range of dates; either end may still be missing while it is picked. */
export class DateRange<D> {
    constructor(
        readonly start: D | null,
        readonly end: D | null
    ) {}
}

/** Marks days with a legend colour (1 to 20) and lists them in the legend. */
export interface SpecialDayRule<D> {
    specialDayNumber: number;
    rule: (date: D) => boolean;
    legendText?: string;
    /** Shows a round marker in the legend. */
    appointment?: boolean;
}

export interface CalendarYearGrid {
    rows: number;
    cols: number;
    /** Custom year labels, e.g. for other eras. */
    yearMapping?: (year: number) => string;
}

export interface AggregatedYear {
    startYear: number;
    endYear: number;
}

export type DisableDateFunction<D> = ((date: D) => boolean) | null | undefined;
export type EscapeFocusFunction = ((event?: KeyboardEvent) => void) | null | undefined;
export type NavigationButtonDisableFunction<D> = (
    date: D | null | undefined,
    currentlyDisplayed: CalendarCurrent,
    activeView: FdCalendarView
) => boolean;

/** Texts of the calendar, in English by default. */
export interface CalendarLabels {
    calendarRoleDescription: string;
    dayViewDescription: string;
    monthViewDescription: string;
    yearsViewDescription: string;
    yearsRangeViewDescription: string;
    previousMonthLabel: string;
    nextMonthLabel: string;
    previousYearLabel: string;
    nextYearLabel: string;
    monthSelectionLabel: string;
    yearSelectionLabel: string;
    yearsRangeSelectionLabel: string;
    dateSelectionLabel: string;
    weekColumnLabel: string;
    todayLabel: string;
    dateSelectedLabel: string;
    rangeStartLabel: string;
    rangeEndLabel: string;
    dayInPastLabel: string;
    legendLabel: string;
    workDayLabel: string;
    nonWorkDayLabel: string;
    closeCalendarLabel: string;
}

export const CALENDAR_LABELS: CalendarLabels = {
    calendarRoleDescription: 'Calendar',
    dayViewDescription: 'Calendar',
    monthViewDescription: 'Month picker',
    yearsViewDescription: 'Year picker',
    yearsRangeViewDescription: 'Years range picker',
    previousMonthLabel: 'Previous month',
    nextMonthLabel: 'Next month',
    previousYearLabel: 'Previous year',
    nextYearLabel: 'Next year',
    monthSelectionLabel: 'Select month',
    yearSelectionLabel: 'Select year',
    yearsRangeSelectionLabel: 'Select years range',
    dateSelectionLabel: 'Select date',
    weekColumnLabel: 'Calendar week',
    todayLabel: 'Today',
    dateSelectedLabel: 'Selected date',
    rangeStartLabel: 'Range start',
    rangeEndLabel: 'Range end',
    dayInPastLabel: 'Past days',
    legendLabel: 'Calendar Legend',
    workDayLabel: 'Work day',
    nonWorkDayLabel: 'Non-Work day',
    closeCalendarLabel: 'Close calendar'
};

/** A day of the day view. */
export interface CalendarDay<D> {
    date: D;
    id: string;
    index: number;
    label: string;
    ariaLabel: string;
    monthStatus: 'previous' | 'current' | 'next';
    weekend: boolean;
    current: boolean;
    past: boolean;
    selected: boolean;
    selectedFirst: boolean;
    selectedLast: boolean;
    inRange: boolean;
    hoverRange: boolean;
    disabled: boolean;
    specialDayNumber: number | null;
    tabbable: boolean;
}

/** A month, year or years period of the other views. */
interface PickerCell<D> {
    id: string;
    index: number;
    label: string;
    ariaLabel: string;
    value: number;
    date: D;
    current: boolean;
    selected: boolean;
    inRange: boolean;
    disabled: boolean;
    years?: AggregatedYear;
}

/** Background, text and border of a day per look. */
const DAY_LOOK = {
    work: '[--cal-bg:var(--sapLegend_WorkingBackground)] hover:[--cal-bg:var(--sapList_Hover_Background)]',
    weekend:
        '[--cal-bg:var(--sapLegend_NonWorkingBackground)] hover:[--cal-bg:var(--sapList_Hover_Background)] hover:brightness-105',
    other: '[--cal-bg:var(--sapList_Background)] [--cal-text:var(--sapContent_LabelColor)] hover:[--cal-bg:var(--sapList_Hover_Background)]',
    selected:
        '[--cal-bg:var(--sapContent_Selected_Background)] [--cal-text:var(--sapContent_Selected_TextColor)] hover:[--cal-bg:var(--sapList_Hover_Background)] border-2 border-sap-list-selection-border-color [&_[data-cal-text]]:font-sap-font-bold-family',
    range: '[--cal-bg:var(--sapList_SelectionBackgroundColor)] hover:[--cal-bg:var(--sapList_Hover_SelectionBackground)] border-2 border-sap-list-selection-border-color'
};

const CELL =
    'group/cell relative m-px box-border inline-block min-w-8 flex-1 cursor-pointer overflow-hidden rounded-(--sapButton_BorderCornerRadius) border-0 border-solid bg-(--cal-bg) p-0 align-middle outline-none [--cal-text:var(--sapTextColor)]';
const TABLE = 'm-0 box-border table w-full border-spacing-0 p-0';
const TEXT_WRAPPER = 'relative m-0 box-border flex h-full items-center justify-center p-0';
const TEXT =
    'relative box-border flex h-(--cal-text-h) max-w-[calc(100%-0.375rem)] min-w-[1.375rem] grow items-center justify-center rounded-[0.1875rem] text-sap-font-size text-(--cal-text) group-focus/cell:border-(length:--sapContent_FocusWidth) group-focus/cell:[border-style:var(--sapContent_FocusStyle)] group-focus/cell:border-sap-content-focus-color';
const SIDE_HELPER =
    'relative m-px box-border inline-flex h-[1.875rem] min-w-8 flex-1 items-center justify-center self-center border-0 bg-sap-list-background p-0 text-sap-font-small-size font-normal text-sap-content-label-color';
const TODAY =
    "border-2 border-sap-legend-current-date-time [box-shadow:inset_0_0_0_0.0625rem_var(--sapList_Background)] after:pointer-events-none after:absolute after:inset-px after:rounded-[0.3125rem] after:content-['']";
const TODAY_SELECTED = 'after:border after:border-solid after:border-sap-list-selection-border-color';
/** Special day markers: a coloured bar at the bottom, a rounded one on today. */
const SPECIAL =
    "[&_[data-cal-wrapper]]:after:absolute [&_[data-cal-wrapper]]:after:inset-x-0 [&_[data-cal-wrapper]]:after:bottom-0 [&_[data-cal-wrapper]]:after:h-[0.3125rem] [&_[data-cal-wrapper]]:after:shadow-[inset_0_-0.3125rem_0_var(--cal-legend)] [&_[data-cal-wrapper]]:after:content-['']";
const SPECIAL_SELECTED = '[&_[data-cal-wrapper]]:after:h-1';
const SPECIAL_TODAY =
    "[&_[data-cal-wrapper]]:after:absolute [&_[data-cal-wrapper]]:after:start-px [&_[data-cal-wrapper]]:after:bottom-px [&_[data-cal-wrapper]]:after:h-1 [&_[data-cal-wrapper]]:after:w-[calc(100%-0.125rem)] [&_[data-cal-wrapper]]:after:rounded-b-[0.3125rem] [&_[data-cal-wrapper]]:after:border-b-4 [&_[data-cal-wrapper]]:after:border-solid [&_[data-cal-wrapper]]:after:border-(--cal-legend) [&_[data-cal-wrapper]]:after:content-['']";

/** Sets every ref in the list. */
function mergeRefs<E>(...refs: (Ref<E> | undefined)[]): RefCallback<E> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
}

/** A legend colour as the `--cal-legend` variable. */
function legendStyle(color: string | null | undefined): CSSProperties | undefined {
    return color ? ({ '--cal-legend': color } as CSSProperties) : undefined;
}

function chunk<T>(items: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));
}

/** The legend inside a calendar tells it which special day's entry has the focus. */
const CalendarContext = createContext<{ setFocusedSpecialDay: (day: number | null) => void } | null>(null);

/* ------------------------------------------------------------------------------------------------------------------
 * Legend
 * ---------------------------------------------------------------------------------------------------------------- */

export type CalendarLegendItemType = 'today' | 'selected' | 'work' | 'non-work' | 'special';

export interface CalendarLegendItemProps extends Omit<ComponentProps<'div'>, 'color'> {
    /** The text; children replace it. */
    text?: ReactNode;
    /** CSS colour of the marker, e.g. `var(--sapLegendColor3)`. */
    color?: string | null;
    /** A round marker for appointments. */
    circle?: boolean;
    type?: CalendarLegendItemType;
}

/** An entry of the calendar legend: a marker and a text (Angular's `fd-calendar-legend-item`). */
export function CalendarLegendItem({
    text,
    color,
    circle = false,
    type = 'special',
    className,
    children,
    ...props
}: CalendarLegendItemProps) {
    return (
        <div
            role="listitem"
            tabIndex={0}
            {...props}
            className={cn(
                'm-0 box-border flex min-w-[7.5rem] gap-2 rounded-[0.25rem] p-1 font-sap-font-family outline-none compact:p-0.5',
                'focus:shadow-[inset_0_0_0_var(--sapContent_FocusWidth)_var(--sapContent_FocusColor)] active:shadow-[inset_0_0_0_var(--sapContent_FocusWidth)_var(--sapContent_FocusColor)]',
                className
            )}
        >
            <span
                data-slot="calendar-legend-marker"
                style={legendStyle(color)}
                className={cn(
                    'm-0 box-border size-4 shrink-0 border border-solid border-sap-content-foreground-border-color bg-sap-list-background p-0',
                    circle && 'rounded-full',
                    type === 'today' && 'border-2 border-sap-legend-current-date-time',
                    type === 'selected' && 'bg-sap-selected-color',
                    type === 'work' && 'bg-sap-legend-working-background',
                    type === 'non-work' && 'bg-sap-legend-non-working-background',
                    type === 'special' && 'bg-(--cal-legend)'
                )}
            />
            <span className="m-0 overflow-hidden p-0 align-middle text-sap-font-small-size leading-4 text-ellipsis whitespace-pre-line text-sap-content-label-color">
                {children ?? text}
            </span>
        </div>
    );
}

export interface CalendarLegendProps<D = FdDate> extends ComponentProps<'div'> {
    /** Lays the entries out in one column instead of as many as fit. */
    col?: boolean;
    displayTodayLegendItem?: boolean;
    displaySelectedLegendItem?: boolean;
    displayWorkDayLegendItem?: boolean;
    displayNonWorkDayLegendItem?: boolean;
    specialDaysRules?: SpecialDayRule<D>[];
    labels?: Partial<CalendarLabels>;
}

/**
 * The legend of a calendar: today, selected, work and non-work days and the special days (Angular's
 * `fd-calendar-legend`). Its own children come first. Inside a calendar, while a special day's entry has the focus,
 * only its days keep their markers.
 */
export function CalendarLegend<D = FdDate>({
    col = false,
    displayTodayLegendItem = true,
    displaySelectedLegendItem = true,
    displayWorkDayLegendItem = true,
    displayNonWorkDayLegendItem = true,
    specialDaysRules = [],
    labels: labelsProp,
    className,
    children,
    ...props
}: CalendarLegendProps<D>) {
    const calendar = useContext(CalendarContext);
    const labels = { ...CALENDAR_LABELS, ...labelsProp };
    return (
        <div
            role="list"
            aria-label={labels.legendLabel}
            {...props}
            className={cn(
                'm-0 box-border block bg-sap-list-background p-2 [column-width:7.5rem]',
                col && '[column-width:auto]',
                className
            )}
        >
            {children}
            {displayTodayLegendItem && <CalendarLegendItem type="today" text={labels.todayLabel} />}
            {displaySelectedLegendItem && <CalendarLegendItem type="selected" text={labels.dateSelectedLabel} />}
            {displayWorkDayLegendItem && <CalendarLegendItem type="work" text={labels.workDayLabel} />}
            {displayNonWorkDayLegendItem && <CalendarLegendItem type="non-work" text={labels.nonWorkDayLabel} />}
            {specialDaysRules.map((rule) => (
                <CalendarLegendItem
                    key={rule.specialDayNumber}
                    text={rule.legendText}
                    circle={!!rule.appointment}
                    color={`var(--sapLegendColor${rule.specialDayNumber})`}
                    onFocus={() => calendar?.setFocusedSpecialDay(rule.specialDayNumber)}
                    onBlur={() => calendar?.setFocusedSpecialDay(null)}
                />
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Close button
 * ---------------------------------------------------------------------------------------------------------------- */

export interface CalendarCloseButtonProps extends Omit<ButtonProps, 'render'> {
    /** Another button to name, e.g. `render={<DialogCloseButton mobile />}`. */
    render?: useRender.RenderProp;
}

/**
 * A close button for a calendar in a dialog; it names itself "Close calendar" (Angular's `fd-calendar-close-button`
 * directive). A transparent button with the decline icon, or the element of `render`.
 */
export function CalendarCloseButton({ render, 'aria-label': ariaLabel, title, ...props }: CalendarCloseButtonProps) {
    const name = ariaLabel || CALENDAR_LABELS.closeCalendarLabel;
    const named = { 'aria-label': name, title: title ?? name };
    const element = useRender({
        render: render ?? <Button variant="transparent" glyph="decline" />,
        props: { ...props, ...named } as Record<string, unknown>
    });
    return element;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Calendar
 * ---------------------------------------------------------------------------------------------------------------- */

/** What a calendar can be asked to do from code (Angular's public methods), see `actionsRef`. */
export interface CalendarActions<D = FdDate> {
    /** Shows the month of a date. */
    setCurrentlyDisplayed(date: D | null | undefined): void;
    /** Focuses the active cell of the view, e.g. when a date picker opens. */
    initialFocus(): void;
    handlePreviousArrowClick(): void;
    handleNextArrowClick(): void;
    /** Whether the selection is complete and valid (Angular's form validator). */
    isModelValid(): boolean;
}

export interface CalendarProps<D = FdDate> extends Omit<ComponentProps<'div'>, 'children'> {
    calType?: CalendarType;
    /** Several dates, or several ranges with `calType="range"`. */
    allowMultipleSelection?: boolean;
    markWeekends?: boolean;
    showWeekNumbers?: boolean;
    mobileLandscape?: boolean;
    mobilePortrait?: boolean;
    /** First day of the week, 1 (Sunday) to 7; by default from the locale. */
    startingDayOfWeek?: DaysOfWeek | null;
    specialDaysRules?: SpecialDayRule<D>[];
    yearGrid?: CalendarYearGrid;
    aggregatedYearGrid?: CalendarYearGrid;
    /** Highlights the days between the range start and the hovered day while picking a range. */
    rangeHoverEffect?: boolean;
    /** Picks ranges of months (`month`) or years (`year`) instead of days. */
    dateRangeFormat?: '' | 'month' | 'year';
    showCalendarLegend?: boolean;
    legendCol?: boolean;
    disableFunction?: DisableDateFunction<D>;
    disableRangeStartFunction?: DisableDateFunction<D>;
    disableRangeEndFunction?: DisableDateFunction<D>;
    previousButtonDisableFunction?: NavigationButtonDisableFunction<D> | null;
    nextButtonDisableFunction?: NavigationButtonDisableFunction<D> | null;
    /**
     * What Tab does in the grid; by default it moves to the previous button, keeping the focus in the calendar. `null`
     * lets Tab leave the calendar.
     */
    escapeFocusFunction?: EscapeFocusFunction;
    labels?: Partial<CalendarLabels>;

    /** The view shown (controlled). */
    activeView?: FdCalendarView;
    /** The view shown first (uncontrolled, default `day`). */
    defaultActiveView?: FdCalendarView;
    onActiveViewChange?: (view: FdCalendarView) => void;
    /** The selected date (controlled; `null` for none). */
    selectedDate?: D | null;
    /** The selected date at first (uncontrolled, default today). */
    defaultSelectedDate?: D | null;
    onSelectedDateChange?: (date: D | null) => void;
    /** The selected dates with `allowMultipleSelection` (controlled). */
    selectedMultipleDates?: D[];
    defaultSelectedMultipleDates?: D[];
    onSelectedMultipleDatesChange?: (dates: D[]) => void;
    /** The selected range with `calType="range"` (controlled). */
    selectedRangeDate?: DateRange<D> | null;
    defaultSelectedRangeDate?: DateRange<D> | null;
    onSelectedRangeDateChange?: (range: DateRange<D> | null) => void;
    /** The selected ranges with `calType="range"` and `allowMultipleSelection` (controlled). */
    selectedMultipleDateRanges?: DateRange<D>[];
    defaultSelectedMultipleDateRanges?: DateRange<D>[];
    onSelectedMultipleDateRangesChange?: (ranges: DateRange<D>[]) => void;
    /**
     * The user changed the selection (Angular's form value): the date, dates, range or ranges of the selection mode.
     */
    onValueChange?: (value: D | null | D[] | DateRange<D> | DateRange<D>[]) => void;
    /** Whether a selection set from outside (and at first) is complete and valid (Angular's `isValidDateChange`). */
    onIsValidDateChange?: (valid: boolean) => void;
    /** A selection was made; e.g. a date picker closes. */
    onCloseCalendar?: () => void;
    /** Methods to call from code: `setCurrentlyDisplayed`, `initialFocus`, paging and `isModelValid`. */
    actionsRef?: Ref<CalendarActions<D>>;
}

/** Controlled or uncontrolled state, as Base UI's: `undefined` means uncontrolled. */
function useControlled<T>(
    value: T | undefined,
    defaultValue: () => T,
    onChange?: (value: T) => void
): [T, (next: T) => void] {
    const [own, setOwn] = useState<T>(defaultValue);
    const controlled = value !== undefined;
    return [
        controlled ? value : own,
        (next: T) => {
            if (!controlled) setOwn(next);
            onChange?.(next);
        }
    ];
}

type PendingFocus<D> = { type: 'active' } | { type: 'id'; id: string } | { type: 'date'; date: D };

/**
 * Calendar: picks a date, several dates, a range or several ranges, in a day view with month, year and years range
 * views to navigate. Weekends, today, special days (with a legend), week numbers and disabled dates show in the day
 * view. The arrow keys move between the days, months or years and change the month or page at the edges; Enter and
 * Space select. Dates go through the `DatetimeAdapter` of `useDatetimeAdapter()` (by default `FdDate`).
 *
 * ```tsx
 * <Calendar selectedDate={date} onSelectedDateChange={setDate} />
 * <Calendar calType="range" selectedRangeDate={range} onSelectedRangeDateChange={setRange} showWeekNumbers />
 * ```
 */
export function Calendar<D = FdDate>({
    id: idProp,
    calType = 'single',
    allowMultipleSelection = false,
    markWeekends = true,
    showWeekNumbers = false,
    mobileLandscape = false,
    mobilePortrait = false,
    startingDayOfWeek,
    specialDaysRules = [],
    yearGrid = { rows: 4, cols: 5 },
    aggregatedYearGrid = { rows: 4, cols: 3 },
    rangeHoverEffect = false,
    dateRangeFormat = '',
    showCalendarLegend = false,
    legendCol = false,
    disableFunction,
    disableRangeStartFunction,
    disableRangeEndFunction,
    previousButtonDisableFunction,
    nextButtonDisableFunction,
    escapeFocusFunction,
    labels: labelsProp,
    activeView: activeViewProp,
    defaultActiveView = 'day',
    onActiveViewChange,
    selectedDate: selectedDateProp,
    defaultSelectedDate,
    onSelectedDateChange,
    selectedMultipleDates: selectedMultipleDatesProp,
    defaultSelectedMultipleDates,
    onSelectedMultipleDatesChange,
    selectedRangeDate: selectedRangeDateProp,
    defaultSelectedRangeDate,
    onSelectedRangeDateChange,
    selectedMultipleDateRanges: selectedMultipleDateRangesProp,
    defaultSelectedMultipleDateRanges,
    onSelectedMultipleDateRangesChange,
    onValueChange,
    onIsValidDateChange,
    onCloseCalendar,
    actionsRef,
    ref,
    className,
    ...props
}: CalendarProps<D>) {
    const a = useDatetimeAdapter<D>();
    const formats = useDateTimeFormats<unknown>();
    const autoId = useId();
    const id = idProp ?? `fd-calendar${autoId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    const rootRef = useRef<HTMLDivElement>(null);
    const previousButtonRef = useRef<HTMLButtonElement>(null);
    const labels = { ...CALENDAR_LABELS, ...labelsProp };
    const single = calType === 'single';

    const [activeView, setActiveViewState] = useControlled(activeViewProp, () => defaultActiveView, onActiveViewChange);
    const [selectedDate, setSelectedDate] = useControlled<D | null>(
        selectedDateProp,
        () => (defaultSelectedDate === undefined ? a.today() : defaultSelectedDate),
        onSelectedDateChange
    );
    const [selectedMultipleDates, setSelectedMultipleDates] = useControlled<D[]>(
        selectedMultipleDatesProp,
        () => defaultSelectedMultipleDates ?? [],
        onSelectedMultipleDatesChange
    );
    const [selectedRangeDate, setSelectedRangeDate] = useControlled<DateRange<D> | null>(
        selectedRangeDateProp,
        () => defaultSelectedRangeDate ?? null,
        onSelectedRangeDateChange
    );
    const [selectedMultipleDateRanges, setSelectedMultipleDateRanges] = useControlled<DateRange<D>[]>(
        selectedMultipleDateRangesProp,
        () => defaultSelectedMultipleDateRanges ?? [],
        onSelectedMultipleDateRangesChange
    );

    const monthOf = (date: D): CalendarCurrent => ({ year: a.getYear(date), month: a.getMonth(date) });

    /** The date whose month shows: the selection's first date. */
    const anchorDate: D | null = allowMultipleSelection
        ? single
            ? (selectedMultipleDates?.[0] ?? null)
            : (selectedMultipleDateRanges?.[0]?.start ?? null)
        : single
          ? (selectedDate ?? null)
          : (selectedRangeDate?.start ?? selectedRangeDate?.end ?? null);

    const [displayed, setDisplayed] = useState<CalendarCurrent>(() =>
        monthOf(anchorDate && a.isValid(anchorDate) ? anchorDate : a.today())
    );
    // a calendar that starts in the year or years range view starts at the shown year, as switching to them does
    const [firstYear, setFirstYear] = useState(() => displayed.year);
    const [firstAggregatedYear, setFirstAggregatedYear] = useState(
        () => displayed.year - yearGrid.rows * yearGrid.cols
    );
    const [hoverDate, setHoverDate] = useState<D | null>(null);
    /** While a range start is picked with the hover effect. */
    const [rangePicking, setRangePicking] = useState(false);
    /** A range of several ranges whose end is still missing. */
    const [newRange, setNewRange] = useState<DateRange<D> | null>(null);
    /** The special day whose legend entry has the focus. */
    const [focusedSpecialDay, setFocusedSpecialDay] = useState<number | null>(null);
    const shiftAnchor = useRef<D | null>(null);
    const pendingFocus = useRef<PendingFocus<D> | null>(null);

    // show the month of a selection set from outside (not a range end picked in another month)
    const [anchorSeen, setAnchorSeen] = useState<D | null>(anchorDate);
    if (anchorDate !== anchorSeen) {
        setAnchorSeen(anchorDate);
        if (anchorDate && a.isValid(anchorDate) && !a.datesEqual(anchorDate, anchorSeen)) {
            const next = monthOf(anchorDate);
            if (next.year !== displayed.year || next.month !== displayed.month) setDisplayed(next);
        }
    }

    useEffect(() => {
        shiftAnchor.current = null;
    }, [allowMultipleSelection, calType]);

    // a selection written from outside (and the first one) reports its validity and drops the shift anchor, as
    // Angular's writeValue; the selections the calendar makes itself do not
    const modelValue: unknown = allowMultipleSelection
        ? single
            ? selectedMultipleDates
            : selectedMultipleDateRanges
        : single
          ? selectedDate
          : selectedRangeDate;
    const emitted = useRef<{ value: unknown } | null>(null);
    useEffect(() => {
        if (emitted.current && emitted.current.value === modelValue) return;
        shiftAnchor.current = null;
        onIsValidDateChange?.(isModelValid());
    }, [modelValue]);

    /** First day of the week from 1 (Sunday). */
    const weekStart = startingDayOfWeek ?? a.getFirstDayOfWeek() + 1;
    const weekDays = (() => {
        const start = weekStart - 1;
        const short = a.getDayOfWeekNames('short');
        const long = a.getDayOfWeekNames('long');
        return Array.from({ length: 7 }, (_, i) => ({ short: short[(start + i) % 7]!, long: long[(start + i) % 7]! }));
    })();

    /** Number of selected range ends: 0, 1 (start picked) or 2. */
    const rangeCounter = (() => {
        const range = selectedRangeDate;
        if (!range || !a.isValid(range.start)) return 0;
        if (!a.isValid(range.end) || a.datesEqual(range.start, range.end)) return 1;
        return 2;
    })();

    /** Number of picked range ends of several ranges. */
    const multiRangeCounter = [...(selectedMultipleDateRanges ?? []), ...(newRange ? [newRange] : [])].reduce(
        (count, range) => count + (range.start ? 1 : 0) + (range.end ? 1 : 0),
        0
    );

    const same = (x: D | null | undefined, y: D | null | undefined) => !!x && !!y && a.datesEqual(x, y);

    /** Whether a date is in a range (strictly, or including its ends). */
    const inRange = (date: D, range: DateRange<D>, inclusive = false): boolean => {
        if (!range.start || !range.end) return false;
        if (inclusive && (a.datesEqual(date, range.start) || a.datesEqual(date, range.end))) return true;
        return a.compareDate(date, range.start) > 0 && a.compareDate(date, range.end) < 0;
    };

    /** Disables the days that cannot start (or, once started, end) a range. */
    const disableRangeEnds = (cells: CalendarDay<D>[], picking: boolean) => {
        const fn = picking ? disableRangeEndFunction : disableRangeStartFunction;
        if (fn) for (const cell of cells) cell.disabled = cell.disabled || fn(cell.date);
    };

    /** Sets the selection states, disabled days and the hover range of the day cells. */
    const markSelection = (cells: CalendarDay<D>[]) => {
        for (const cell of cells) cell.disabled = !!disableFunction?.(cell.date);
        let rangeStart: D | null = null;
        if (allowMultipleSelection) {
            if (single) {
                const dates = selectedMultipleDates ?? [];
                for (const cell of cells) cell.selected = !cell.disabled && dates.some((date) => same(date, cell.date));
            } else {
                const ranges = [...(selectedMultipleDateRanges ?? []), ...(newRange ? [newRange] : [])];
                for (const range of ranges) {
                    for (const cell of cells) {
                        if (same(range.start, cell.date)) cell.selected = cell.selectedFirst = true;
                        if (same(range.end, cell.date)) cell.selected = cell.selectedLast = true;
                        if (inRange(cell.date, range)) cell.inRange = cell.selected = true;
                    }
                }
                rangeStart = newRange?.start ?? null;
                disableRangeEnds(cells, multiRangeCounter % 2 === 1);
            }
        } else if (single) {
            for (const cell of cells) cell.selected = !cell.disabled && same(selectedDate, cell.date);
        } else {
            const range = selectedRangeDate;
            if (range) {
                const startOk = !disableRangeStartFunction?.(range.start as D);
                const endOk = !disableRangeEndFunction?.(range.end as D);
                for (const cell of cells) {
                    if (startOk && !cell.disabled && same(range.start, cell.date))
                        cell.selected = cell.selectedFirst = true;
                    if (endOk && !cell.disabled && same(range.end, cell.date)) cell.selected = cell.selectedLast = true;
                    cell.inRange = inRange(cell.date, range);
                }
            }
            rangeStart = rangeCounter === 1 ? (range?.start ?? null) : null;
            disableRangeEnds(cells, rangeCounter === 1);
        }
        // the days between the picked start and the hovered day
        if (rangePicking && rangeStart && hoverDate) {
            const [from, to] =
                a.compareDate(hoverDate, rangeStart) < 0 ? [hoverDate, rangeStart] : [rangeStart, hoverDate];
            for (const cell of cells)
                cell.hoverRange = a.compareDate(cell.date, from) > 0 && a.compareDate(cell.date, to) < 0;
        }
    };

    const dayCells: CalendarDay<D>[] = (() => {
        const { year, month } = displayed;
        const first = a.createDate(year, month, 1);
        const offset = (a.getDayOfWeek(first) - weekStart + 7) % 7;
        const daysInMonth = a.getNumDaysInMonth(first);
        const total = Math.ceil((offset + daysInMonth) / 7) * 7;
        const today = a.today();
        const names = a.getDateNames();
        const cells = Array.from({ length: total }, (_, index): CalendarDay<D> => {
            const date = a.addCalendarDays(first, index - offset);
            const weekDay = a.getDayOfWeek(date);
            const monthStatus = index < offset ? 'previous' : index < offset + daysInMonth ? 'current' : 'next';
            return {
                date,
                id: `${id}-day-view-day-${index}`,
                index,
                label: names[a.getDate(date) - 1]!,
                ariaLabel: a.format(date, formats.display.dateA11yLabel),
                monthStatus,
                weekend: weekDay === 1 || weekDay === 7,
                current: a.datesEqual(date, today),
                past: a.compareDate(date, today) < 0,
                selected: false,
                selectedFirst: false,
                selectedLast: false,
                inRange: false,
                hoverRange: false,
                disabled: false,
                specialDayNumber: specialDaysRules.find((rule) => rule.rule(date))?.specialDayNumber ?? null,
                tabbable: false
            };
        });
        markSelection(cells);
        // the active day takes the tab stop: selected, today or the first of the month
        const inMonth = cells.filter((cell) => cell.monthStatus === 'current');
        const active =
            inMonth.find((cell) => cell.selected) ?? inMonth.find((cell) => cell.current) ?? inMonth[0] ?? cells[0];
        if (active) active.tabbable = true;
        return cells;
    })();

    const dayGrid = chunk(dayCells, 7);
    const fillerRows = Math.max(0, 6 - dayGrid.length);
    /** ISO week numbers of the rows, from their Thursday. */
    const weeks = dayGrid.map((row) => {
        const thursday = row.find((cell) => a.getDayOfWeek(cell.date) === 5) ?? row[0]!;
        return a.getWeekName(thursday.date);
    });

    const yearName = (year: number): string => {
        const mapping = yearGrid.yearMapping;
        return mapping ? mapping(year) : a.getYearName(a.createDate(year, 1, 1));
    };

    /** Marks the ends and the inside of a month or year range. */
    const markPickerRange = (cells: PickerCell<D>[], key: (date: D) => CalendarCurrent) => {
        const range = selectedRangeDate;
        // in range mode only the range is selected
        for (const cell of cells) cell.selected = false;
        if (!range) return;
        const sameKey = (date: D | null, cell: PickerCell<D>) => {
            if (!date) return false;
            const x = key(date);
            const y = key(cell.date);
            return x.year === y.year && x.month === y.month;
        };
        const hover = rangePicking && rangeCounter === 1 ? hoverDate : null;
        for (const cell of cells) {
            cell.selected = sameKey(range.start, cell) || sameKey(range.end, cell);
            cell.inRange = inRange(cell.date, range);
            if (hover && range.start) {
                const [from, to] = a.compareDate(hover, range.start) < 0 ? [hover, range.start] : [range.start, hover];
                cell.inRange ||= a.compareDate(cell.date, from) > 0 && a.compareDate(cell.date, to) < 0;
            }
        }
    };

    const monthCells: PickerCell<D>[] = (() => {
        const year = displayed.year;
        const today = a.today();
        // long names, as fundamental-styles: a short name is no part of the cell's accessible name ("January 2024")
        const names = a.getMonthNames('long');
        const cells = names.map((label, index) => {
            const month = index + 1;
            const date = a.createDate(year, month, 1);
            return {
                id: `${id}-month-view-month-${index}`,
                index,
                label,
                ariaLabel: a.format(date, formats.display.monthA11yLabel),
                value: month,
                date,
                current: month === a.getMonth(today) && year === a.getYear(today),
                selected: month === displayed.month,
                inRange: false,
                disabled: false
            };
        });
        if (dateRangeFormat === 'month') markPickerRange(cells, monthOf);
        return cells;
    })();

    const yearsPerPage = yearGrid.rows * yearGrid.cols;

    const yearCells: PickerCell<D>[] = (() => {
        const thisYear = a.getYear(a.today());
        const cells = Array.from({ length: yearsPerPage }, (_, index) => {
            const year = firstYear + index;
            const date = a.createDate(year, 1, 1);
            return {
                id: `${id}-year-view-year-${index}`,
                index,
                label: yearName(year),
                ariaLabel: a.format(date, formats.display.yearA11yLabel),
                value: year,
                date,
                current: year === thisYear,
                selected: year === displayed.year,
                inRange: false,
                disabled: false
            };
        });
        if (dateRangeFormat === 'year') markPickerRange(cells, (date) => ({ year: a.getYear(date), month: 1 }));
        return cells;
    })();

    const aggregatedCells: PickerCell<D>[] = (() => {
        const thisYear = a.getYear(a.today());
        const selectedYear = displayed.year;
        return Array.from({ length: aggregatedYearGrid.rows * aggregatedYearGrid.cols }, (_, index) => {
            const years = {
                startYear: firstAggregatedYear + yearsPerPage * index,
                endYear: firstAggregatedYear + yearsPerPage * (index + 1) - 1
            };
            const label = `${yearName(years.startYear)} - ${yearName(years.endYear)}`;
            const contains = (year: number) => year >= years.startYear && year <= years.endYear;
            return {
                id: `${id}-aggregated-year-view-years-${index}`,
                index,
                label,
                ariaLabel: label,
                value: years.startYear,
                date: a.createDate(years.startYear, 1, 1),
                current: contains(thisYear),
                selected: contains(selectedYear),
                inRange: false,
                disabled: false,
                years
            };
        });
    })();

    const pickerTabbable = (cells: PickerCell<D>[]): PickerCell<D> | undefined =>
        cells.find((cell) => cell.selected) ?? cells.find((cell) => cell.current) ?? cells[0];

    const monthName = a.getMonthNames('long')[displayed.month - 1];
    const yearsRangeLabel = (() => {
        const cells = activeView === 'aggregatedYear' ? aggregatedCells : yearCells;
        const first = cells[0]!;
        const last = cells.at(-1)!;
        return activeView === 'aggregatedYear'
            ? `${yearName(first.years!.startYear)} - ${yearName(last.years!.endYear)}`
            : `${yearName(first.value)} - ${yearName(last.value)}`;
    })();

    const previousLabel = activeView === 'day' ? labels.previousMonthLabel : labels.previousYearLabel;
    const nextLabel = activeView === 'day' ? labels.nextMonthLabel : labels.nextYearLabel;
    const navigationDisabled = (fn: NavigationButtonDisableFunction<D> | null | undefined) =>
        typeof fn === 'function' && fn(selectedDate, displayed, activeView);

    // focus a cell once the view shows it
    useLayoutEffect(() => {
        const pending = pendingFocus.current;
        if (!pending) return;
        pendingFocus.current = null;
        let target: string | undefined;
        if (pending.type === 'id') target = pending.id;
        else if (pending.type === 'date') target = dayCells.find((c) => a.datesEqual(c.date, pending.date))?.id;
        else if (activeView === 'day') target = dayCells.find((cell) => cell.tabbable)?.id;
        else if (activeView === 'month') target = pickerTabbable(monthCells)?.id;
        else if (activeView === 'year') target = pickerTabbable(yearCells)?.id;
        else target = pickerTabbable(aggregatedCells)?.id;
        if (target) rootRef.current?.querySelector<HTMLElement>(`[id="${target}"]`)?.focus();
    });

    const focusAfterRender = (pending: PendingFocus<D>) => {
        pendingFocus.current = pending;
    };
    const focusActiveCell = () => focusAfterRender({ type: 'active' });

    const setView = (view: FdCalendarView) => {
        if (view === activeView) return;
        const year = displayed.year;
        if (view === 'year') setFirstYear(year);
        if (view === 'aggregatedYear') setFirstAggregatedYear(year - yearsPerPage);
        setActiveViewState(view);
        focusActiveCell();
    };

    /** Switches to a view; the view's own header button switches back to the days. */
    const toggleView = (view: FdCalendarView) => setView(activeView === view ? 'day' : view);

    const page = (direction: 1 | -1) => {
        const { year, month } = displayed;
        switch (activeView) {
            case 'day': {
                const next = month + direction;
                setDisplayed(
                    next < 1
                        ? { year: year - 1, month: 12 }
                        : next > 12
                          ? { year: year + 1, month: 1 }
                          : { year, month: next }
                );
                break;
            }
            case 'month':
                setDisplayed({ year: year + direction, month });
                break;
            case 'year': {
                const first = firstYear + direction * yearsPerPage;
                setFirstYear(first);
                setDisplayed({ year: first, month });
                break;
            }
            case 'aggregatedYear':
                setFirstAggregatedYear(
                    (first) => first + direction * aggregatedYearGrid.rows * aggregatedYearGrid.cols * yearsPerPage
                );
                break;
        }
    };

    const emit = (value: D | null | D[] | DateRange<D> | DateRange<D>[]) => {
        emitted.current = { value };
        onValueChange?.(value);
    };

    const emitChange = (value: D | null | DateRange<D>) => {
        emit(value);
        onCloseCalendar?.();
    };

    const orderedRange = (first: D, second: D): DateRange<D> =>
        a.compareDate(first, second) <= 0 ? new DateRange(first, second) : new DateRange(second, first);

    const mergeRanges = (ranges: DateRange<D>[]): DateRange<D>[] => {
        const sorted = [...ranges].sort((x, y) => a.compareDate(x.start!, y.start!));
        const merged: DateRange<D>[] = [];
        for (const range of sorted) {
            const last = merged.at(-1);
            if (last && a.compareDate(last.end!, range.start!) >= 0) {
                merged[merged.length - 1] = new DateRange(
                    last.start,
                    a.compareDate(last.end!, range.end!) >= 0 ? last.end : range.end
                );
            } else {
                merged.push(range);
            }
        }
        return merged;
    };

    /** The dates from one to the other (either order), without disabled ones. */
    const fillRange = (from: D, to: D): D[] => {
        let current = a.compareDate(from, to) <= 0 ? from : to;
        const end = current === from ? to : from;
        const dates: D[] = [];
        while (a.compareDate(current, end) <= 0) {
            if (!disableFunction?.(current)) dates.push(current);
            current = a.addCalendarDays(current, 1);
        }
        return dates;
    };

    const writeMultipleDates = (next: D[]) => {
        setSelectedMultipleDates(next);
        emit(next);
    };

    /** Toggles dates; as a group they are all selected unless all already are. */
    const toggleDates = (dates: D[], group = false) => {
        const selected = selectedMultipleDates ?? [];
        const has = (date: D) => selected.some((s) => a.datesEqual(s, date));
        let next: D[];
        if (group && !dates.every(has)) next = [...selected, ...dates.filter((date) => !has(date))];
        else if (group || has(dates[0]!)) next = selected.filter((s) => !dates.some((d) => a.datesEqual(s, d)));
        else next = [...selected, dates[0]!];
        writeMultipleDates(next);
    };

    const addDates = (dates: D[]) => {
        const selected = selectedMultipleDates ?? [];
        writeMultipleDates([...selected, ...dates.filter((d) => !selected.some((s) => a.datesEqual(s, d)))]);
    };

    const selectRangeEnd = (date: D) => {
        const range = rangeCounter === 1 ? orderedRange(selectedRangeDate!.start!, date) : new DateRange<D>(date, null);
        setSelectedRangeDate(range);
        setRangePicking(rangeHoverEffect && rangeCounter !== 1);
        emitChange(range);
    };

    const selectMultipleRange = (date: D) => {
        const ranges = (selectedMultipleDateRanges ?? []).filter((range) => range.start || range.end);
        // a click into a range removes it
        const inside = ranges.findIndex((range) => range.end && inRange(date, range, true));
        if (inside > -1) ranges.splice(inside, 1);
        if (!newRange) {
            setNewRange(new DateRange<D>(date, null));
            setRangePicking(rangeHoverEffect);
            emitted.current = { value: ranges };
            setSelectedMultipleDateRanges(ranges);
            return;
        }
        setNewRange(null);
        setRangePicking(false);
        const merged = mergeRanges([...ranges, orderedRange(newRange.start!, date)]);
        setSelectedMultipleDateRanges(merged);
        emit(merged);
        onCloseCalendar?.();
    };

    /** Selects a day. */
    const selectDate = (cell: CalendarDay<D>, event?: MouseEvent | KeyboardEvent) => {
        event?.preventDefault();
        event?.stopPropagation();
        if (cell.disabled) return;
        const date = cell.date;
        if (allowMultipleSelection) {
            if (single) {
                if (event?.shiftKey && shiftAnchor.current) {
                    addDates(fillRange(shiftAnchor.current, date));
                } else {
                    toggleDates([date]);
                    shiftAnchor.current = date;
                }
            } else {
                selectMultipleRange(date);
            }
            return;
        }
        if (single) {
            setSelectedDate(date);
            emitChange(date);
            return;
        }
        selectRangeEnd(date);
    };

    /** Toggles the selection of the days of a week row (multiple selection). */
    const toggleWeek = (row: CalendarDay<D>[]) => {
        if (!allowMultipleSelection || !single) return;
        toggleDates(
            row.filter((cell) => !cell.disabled).map((cell) => cell.date),
            true
        );
    };

    /** Toggles the selection of a weekday column (multiple selection). */
    const toggleWeekColumn = (index: number) => {
        if (!allowMultipleSelection || !single) return;
        toggleDates(
            dayGrid
                .map((row) => row[index])
                .filter((cell): cell is CalendarDay<D> => !!cell && !cell.disabled)
                .map((cell) => cell.date),
            true
        );
    };

    /** Selects a month, year or years period. */
    const selectPickerCell = (view: FdCalendarView, cell: PickerCell<D>, event?: MouseEvent | KeyboardEvent) => {
        event?.preventDefault();
        event?.stopPropagation();
        const { year, month } = displayed;
        if (view === 'month') {
            setDisplayed({ year, month: cell.value });
            if (dateRangeFormat === 'month') {
                selectRangeEnd(cell.date);
                return;
            }
            setView('day');
        } else if (view === 'year') {
            setDisplayed({ year: cell.value, month });
            if (dateRangeFormat === 'year') {
                selectRangeEnd(cell.date);
                return;
            }
            setView(dateRangeFormat === 'month' ? 'month' : 'day');
        } else {
            setDisplayed({ year: cell.years!.startYear, month });
            setFirstYear(cell.years!.startYear);
            setActiveViewState('year');
            focusActiveCell();
        }
    };

    /** The cell offset of an arrow key, or null for other keys. */
    const arrowDelta = (event: KeyboardEvent, rowLength: number): number | null => {
        const rtl = !!rootRef.current && getComputedStyle(rootRef.current).direction === 'rtl';
        switch (event.key) {
            case 'ArrowLeft':
                return rtl ? 1 : -1;
            case 'ArrowRight':
                return rtl ? -1 : 1;
            case 'ArrowUp':
                return -rowLength;
            case 'ArrowDown':
                return rowLength;
            default:
                return null;
        }
    };

    const escapeFocus = (event: KeyboardEvent) => {
        if (escapeFocusFunction === null) return;
        event.preventDefault();
        if (escapeFocusFunction) escapeFocusFunction(event);
        else previousButtonRef.current?.focus();
    };

    const onDayKeyDown = (event: KeyboardEvent, cell: CalendarDay<D>) => {
        if (event.key === 'Tab' && !event.shiftKey) {
            escapeFocus(event);
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            selectDate(cell, event);
            return;
        }
        const delta = arrowDelta(event, 7);
        if (delta === null) return;
        event.preventDefault();
        const target = a.addCalendarDays(cell.date, delta);
        setHoverDate(target);
        const shown = dayCells.find((c) => a.datesEqual(c.date, target));
        if (shown) {
            // in the grid: focus now, so fast key presses go on from there
            rootRef.current?.querySelector<HTMLElement>(`[id="${shown.id}"]`)?.focus();
            return;
        }
        setDisplayed(monthOf(target));
        focusAfterRender({ type: 'date', date: target });
    };

    const onPickerKeyDown = (
        event: KeyboardEvent,
        view: FdCalendarView,
        cells: PickerCell<D>[],
        cols: number,
        cell: PickerCell<D>
    ) => {
        if (event.key === 'Tab' && !event.shiftKey) {
            escapeFocus(event);
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            selectPickerCell(view, cell, event);
            return;
        }
        const delta = arrowDelta(event, cols);
        if (delta === null) return;
        event.preventDefault();
        let index = cell.index + delta;
        // past the edges: the previous or next year (months) or page (years)
        if (index < 0 || index >= cells.length) {
            const direction = index < 0 ? -1 : 1;
            if (view === 'month') setDisplayed({ year: displayed.year + direction, month: displayed.month });
            else page(direction);
            index = (index + cells.length) % cells.length;
        }
        if (view === 'month') setHoverDate(cells[index]!.date);
        const targetId = cells[index]!.id;
        const element = rootRef.current?.querySelector<HTMLElement>(`[id="${targetId}"]`);
        if (element && index === cell.index + delta) element.focus();
        else focusAfterRender({ type: 'id', id: targetId });
    };

    /** Whether the selection is complete and valid. */
    function isModelValid(): boolean {
        if (allowMultipleSelection) {
            return single
                ? (selectedMultipleDates ?? []).every((date) => a.isValid(date))
                : (selectedMultipleDateRanges ?? []).every((r) => a.isValid(r.start) && a.isValid(r.end));
        }
        if (single) return a.isValid(selectedDate);
        const range = selectedRangeDate;
        return !!range && a.isValid(range.start) && a.isValid(range.end);
    }

    useImperativeHandle(actionsRef, () => ({
        setCurrentlyDisplayed: (date) => {
            if (a.isValid(date)) setDisplayed(monthOf(date));
        },
        initialFocus: () => {
            focusActiveCell();
            // focus now if nothing renders
            setDisplayed((current) => ({ ...current }));
        },
        handlePreviousArrowClick: () => page(-1),
        handleNextArrowClick: () => page(1),
        isModelValid
    }));

    const dayAriaLabel = (cell: CalendarDay<D>): string =>
        [
            cell.ariaLabel,
            cell.selectedFirst && calType === 'range' && labels.rangeStartLabel,
            cell.selectedLast && calType === 'range' && labels.rangeEndLabel,
            cell.current && labels.todayLabel,
            cell.selected && single && labels.dateSelectedLabel,
            cell.past && labels.dayInPastLabel
        ]
            .filter(Boolean)
            .join(', ');

    const pickerAriaLabel = (cell: PickerCell<D>): string =>
        [cell.ariaLabel, cell.current && labels.todayLabel, cell.selected && labels.dateSelectedLabel]
            .filter(Boolean)
            .join(', ');

    const dayClass = (cell: CalendarDay<D>): string => {
        const selected = cell.selected && (single || cell.selectedFirst || cell.selectedLast || allowMultipleSelection);
        const range = !selected && (cell.inRange || cell.hoverRange);
        const look = selected
            ? DAY_LOOK.selected
            : range
              ? DAY_LOOK.range
              : cell.monthStatus !== 'current'
                ? DAY_LOOK.other
                : cell.weekend && markWeekends
                  ? DAY_LOOK.weekend
                  : DAY_LOOK.work;
        const special =
            cell.specialDayNumber !== null && (focusedSpecialDay ?? cell.specialDayNumber) === cell.specialDayNumber;
        return cn(
            CELL,
            'h-(--cal-item-h)',
            look,
            cell.current && TODAY,
            cell.current && (selected || range) && TODAY_SELECTED,
            special && (cell.current ? SPECIAL_TODAY : SPECIAL),
            special && !cell.current && (selected || range) && SPECIAL_SELECTED,
            cell.disabled && 'pointer-events-none opacity-40'
        );
    };

    const pickerButtonClass = (cell: PickerCell<D>): string =>
        cn(
            buttonVariants({ variant: 'transparent' }),
            'w-full min-w-full px-0',
            (cell.selected || cell.inRange) &&
                'border-sap-button-selected-border-color bg-sap-button-selected-background text-sap-button-selected-text-color hover:bg-sap-button-selected-hover-background'
        );

    const weekHeaderClass = cn(
        SIDE_HELPER,
        allowMultipleSelection && single ? 'cursor-pointer' : 'pointer-events-none'
    );

    const picker = (cells: PickerCell<D>[], cols: number, description: string, view: FdCalendarView) => {
        const tabbable = pickerTabbable(cells);
        return (
            <table
                role="grid"
                className={cn(TABLE, 'pt-[1.875rem]')}
                id={`${id}-${view}-view`}
                aria-roledescription={description}
                aria-readonly="false"
                aria-multiselectable="false"
            >
                <tbody className="table-row-group" role="rowgroup">
                    {chunk(cells, cols).map((row, rowIndex) => (
                        <tr key={rowIndex} className="flex" role="row">
                            {row.map((cell) => (
                                <td
                                    key={cell.id}
                                    role="gridcell"
                                    id={cell.id}
                                    tabIndex={tabbable === cell ? 0 : -1}
                                    aria-selected={cell.selected}
                                    aria-disabled={cell.disabled || undefined}
                                    aria-label={pickerAriaLabel(cell)}
                                    data-fd-calendar-month={view === 'month' ? cell.value : undefined}
                                    data-fd-calendar-year={view === 'year' ? cell.value : undefined}
                                    className={cn(CELL, 'max-h-(--cal-item-h) [--cal-bg:transparent]')}
                                    onClick={(event) => selectPickerCell(view, cell, event)}
                                    onMouseEnter={() => setHoverDate(cell.date)}
                                    onKeyDown={(event) => onPickerKeyDown(event, view, cells, cols, cell)}
                                >
                                    <span className={pickerButtonClass(cell)}>
                                        <span data-cal-text className={cn(TEXT, 'text-inherit')}>
                                            {cell.label}
                                        </span>
                                    </span>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const multiselectable = calType === 'range' || allowMultipleSelection;

    return (
        <CalendarContext.Provider value={{ setFocusedSpecialDay }}>
            <div
                role="group"
                aria-roledescription={labels.calendarRoleDescription}
                {...props}
                id={id}
                ref={mergeRefs(rootRef, ref)}
                className={cn(
                    'm-0 box-border block w-[18rem] rounded-(--sapButton_BorderCornerRadius) bg-sap-list-background p-2 font-sap-font-family text-sap-font-size text-sap-text-color',
                    '[--cal-item-h:2.75rem] [--cal-text-h:2.125rem] compact:[--cal-item-h:2rem] compact:[--cal-text-h:1.375rem]',
                    (mobileLandscape || mobilePortrait) && 'h-full w-full p-0',
                    mobilePortrait && 'pt-4',
                    className
                )}
            >
                {/* header */}
                <div className="relative m-0 box-border flex w-full justify-center p-0 py-1 compact:py-[0.1875rem]">
                    <div className="m-0 me-1 grow-0 p-0">
                        <Button
                            ref={previousButtonRef}
                            variant="transparent"
                            glyph="slim-arrow-left"
                            id={`${id}-header-left-arrow`}
                            disabled={navigationDisabled(previousButtonDisableFunction)}
                            aria-label={previousLabel}
                            title={previousLabel}
                            onClick={() => page(-1)}
                        />
                    </div>
                    {activeView === 'day' && (
                        <div className="m-0 mx-1 grow p-0">
                            <Button
                                variant="transparent"
                                fullWidth
                                label={monthName}
                                aria-label={`${monthName}, ${labels.monthSelectionLabel}`}
                                data-fd-calendar-month={displayed.month}
                                onClick={() => toggleView('month')}
                            />
                        </div>
                    )}
                    {activeView === 'day' || activeView === 'month' ? (
                        <div className="m-0 mx-1 grow p-0">
                            <Button
                                variant="transparent"
                                fullWidth
                                label={yearName(displayed.year)}
                                aria-label={`${yearName(displayed.year)}, ${labels.yearSelectionLabel}`}
                                data-fd-calendar-year={displayed.year}
                                onClick={() => toggleView('year')}
                            />
                        </div>
                    ) : (
                        <div className="m-0 mx-1 grow p-0" aria-live="polite">
                            <Button
                                variant="transparent"
                                fullWidth
                                label={yearsRangeLabel}
                                aria-label={`${yearsRangeLabel}, ${
                                    activeView === 'aggregatedYear'
                                        ? labels.dateSelectionLabel
                                        : labels.yearsRangeSelectionLabel
                                }`}
                                onClick={() => toggleView('aggregatedYear')}
                            />
                        </div>
                    )}
                    <div className="m-0 ms-1 grow-0 p-0">
                        <Button
                            variant="transparent"
                            glyph="slim-arrow-right"
                            id={`${id}-header-right-arrow`}
                            disabled={navigationDisabled(nextButtonDisableFunction)}
                            aria-label={nextLabel}
                            title={nextLabel}
                            onClick={() => page(1)}
                        />
                    </div>
                </div>

                {activeView === 'day' && (
                    <table
                        role="grid"
                        className={TABLE}
                        id={`${id}-day-view`}
                        aria-roledescription={labels.dayViewDescription}
                        aria-readonly="false"
                        aria-multiselectable={multiselectable}
                    >
                        <thead className="table-row-group" role="rowgroup">
                            <tr className="flex" role="row">
                                {showWeekNumbers && (
                                    <th role="columnheader" className={SIDE_HELPER}>
                                        <span className="sr-only-sap">{labels.weekColumnLabel}</span>
                                    </th>
                                )}
                                {weekDays.map((day, index) => (
                                    <th
                                        key={index}
                                        role="columnheader"
                                        className={weekHeaderClass}
                                        aria-label={day.long}
                                        onClick={() => toggleWeekColumn(index)}
                                    >
                                        {day.short}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="table-row-group" role="rowgroup">
                            {dayGrid.map((row, rowIndex) => (
                                <tr key={rowIndex} className="flex" role="row">
                                    {showWeekNumbers && (
                                        <th
                                            role="rowheader"
                                            scope="row"
                                            className={weekHeaderClass}
                                            data-fd-calendar-week={weeks[rowIndex]}
                                            aria-label={`${labels.weekColumnLabel} ${weeks[rowIndex]}`}
                                            onClick={() => toggleWeek(row)}
                                        >
                                            {weeks[rowIndex]}
                                        </th>
                                    )}
                                    {row.map((cell) => (
                                        <td
                                            key={cell.id}
                                            role="gridcell"
                                            id={cell.id}
                                            tabIndex={cell.tabbable ? 0 : -1}
                                            aria-selected={cell.selected}
                                            aria-disabled={cell.disabled || undefined}
                                            aria-label={dayAriaLabel(cell)}
                                            data-fd-calendar-day={cell.index}
                                            data-fd-calendar-date-day={cell.label}
                                            data-fd-calendar-month-status={cell.monthStatus}
                                            style={legendStyle(
                                                cell.specialDayNumber
                                                    ? `var(--sapLegendColor${cell.specialDayNumber})`
                                                    : null
                                            )}
                                            className={dayClass(cell)}
                                            onClick={(event) => selectDate(cell, event)}
                                            onMouseEnter={() => setHoverDate(cell.date)}
                                            onKeyDown={(event) => onDayKeyDown(event, cell)}
                                        >
                                            <div data-cal-wrapper className={TEXT_WRAPPER}>
                                                <span data-cal-text className={TEXT}>
                                                    {cell.label}
                                                </span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {/* keep the height of six weeks */}
                            {Array.from({ length: fillerRows }, (_, index) => (
                                <tr key={`filler-${index}`} className="flex" aria-hidden="true">
                                    <td className="invisible m-px h-(--cal-item-h) min-w-8"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {activeView === 'month' && picker(monthCells, 3, labels.monthViewDescription, 'month')}
                {activeView === 'year' && picker(yearCells, yearGrid.cols, labels.yearsViewDescription, 'year')}
                {activeView === 'aggregatedYear' &&
                    picker(
                        aggregatedCells,
                        aggregatedYearGrid.cols,
                        labels.yearsRangeViewDescription,
                        'aggregatedYear'
                    )}

                {showCalendarLegend && specialDaysRules.length > 0 && (
                    <CalendarLegend specialDaysRules={specialDaysRules} col={legendCol} labels={labelsProp} />
                )}
            </div>
        </CalendarContext.Provider>
    );
}
