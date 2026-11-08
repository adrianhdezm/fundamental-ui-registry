/*
 * Port of fundamental-react (DatePicker) and @fundamental-ngx/core (date-picker) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useCallback, useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { useDateTimeFormats, useDatetimeAdapter, type FdDate } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import { Bar, BarElement, BarRight, ButtonBar } from '@/ui/bar/bar';
import { Button, type ButtonProps } from '@/ui/button/button';
import {
    Calendar,
    DateRange,
    type CalendarActions,
    type CalendarLabels,
    type CalendarProps,
    type CalendarType,
    type CalendarYearGrid,
    type DaysOfWeek,
    type DisableDateFunction,
    type FdCalendarView,
    type NavigationButtonDisableFunction,
    type SpecialDayRule
} from '@/ui/calendar/calendar';
import {
    Dialog,
    DialogBody,
    DialogCloseButton,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle,
    type DialogOpenChangeDetails
} from '@/ui/dialog/dialog';
import { FormInputMessageGroup } from '@/ui/form/form-input-message-group';
import { FormMessage, type FormMessageType } from '@/ui/form/form-message';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    type InputGroupInputProps,
    type InputGroupProps
} from '@/ui/input-group/input-group';
import {
    Popover,
    PopoverBody,
    PopoverTrigger,
    type Placement,
    type PopoverOpenChangeDetails,
    type TriggerConfig
} from '@/ui/popover/popover';

export type DatePickerState = 'success' | 'error' | 'warning' | 'default' | 'information';

/** The value of a date picker: a date, dates, a range or ranges, by `type` and `allowMultipleSelection`. */
export type DatePickerValue<D> = D | D[] | DateRange<D> | DateRange<D>[] | null;

/** Dialog options of a date picker in mobile mode. */
export interface DatePickerMobileConfig {
    title?: string;
    /** Shows a close button in the header (default true). */
    hasCloseButton?: boolean;
    approveButtonText?: string;
    cancelButtonText?: string;
}

export interface DatePickerLabels {
    inputLabel: string;
    rangeInputLabel: string;
    toggleLabel: string;
    calendarLabel: string;
    closeLabel: string;
    /** Read with the message, by the state of the field. */
    successStateLabel: string;
    informationStateLabel: string;
    warningStateLabel: string;
    errorStateLabel: string;
}

export const DATE_PICKER_LABELS: DatePickerLabels = {
    inputLabel: 'Date input',
    rangeInputLabel: 'Date range input',
    toggleLabel: 'Open picker',
    calendarLabel: 'Choose date',
    closeLabel: 'Close',
    successStateLabel: 'Value state Success',
    informationStateLabel: 'Value state Information',
    warningStateLabel: 'Value state Warning',
    errorStateLabel: 'Value state Error'
};

const DEFAULT_MESSAGE_TRIGGERS = ['focusin', 'focusout'] as const;
const DEFAULT_YEAR_GRID: CalendarYearGrid = { rows: 4, cols: 5 };
const DEFAULT_AGGREGATED_YEAR_GRID: CalendarYearGrid = { rows: 4, cols: 3 };
const NO_DATES: never[] = [];

export interface DatePickerProps<D = FdDate> extends Omit<
    ComponentProps<'div'>,
    'defaultValue' | 'onChange' | 'placeholder' | 'children'
> {
    /** Content shown in the popover above the calendar (Angular's projected content). */
    children?: ReactNode;
    /** Id of the input (default: the picker's id with `-input`). */
    inputId?: string;
    /** A date (`single`, default) or a range. */
    type?: CalendarType;
    /** Several dates, or several ranges with `type="range"`. */
    allowMultipleSelection?: boolean;
    placeholder?: string;
    disabled?: boolean;
    /** Shows the value without the calendar button; the field cannot be edited (fundamental-react). */
    readOnly?: boolean;
    required?: boolean;
    /** The display and parse format of the dates; by default `dateInput` of the formats. */
    customDateTimeFormat?: unknown;
    /** A value state message, shown under the field on focus and in the popover. */
    message?: ReactNode;
    messageType?: FormMessageType;
    /** Events on the field that show and hide the message (default focus in and out). */
    messageTriggers?: readonly (string | TriggerConfig)[];
    /** Placement of the calendar popover (default `bottom-start`). */
    placement?: Placement;
    /** An unreadable or disabled date sets the error state, unless a `state` is set (default true). */
    useValidation?: boolean;
    state?: DatePickerState | null;
    /** An empty field is a valid (null) value (default true). */
    allowNull?: boolean;
    /** Closes the calendar when a date, or the end of a range, is picked (default true). */
    closeOnDateChoose?: boolean;
    /** Reads typed dates on Enter and blur only, instead of while typing. */
    processInputOnBlur?: boolean;
    /** Returns the focus to the field without scrolling it into view. */
    preventScrollOnFocus?: boolean;
    /** The calendar button is in the tab order (default false: F4 and Alt+Down open the calendar). */
    buttonFocusable?: boolean;
    /** A footer button that selects today. */
    showTodayButton?: boolean;
    todayButtonLabel?: string;
    /** The month shown when the calendar opens without a value (fundamental-react). */
    openToDate?: D | null;
    markWeekends?: boolean;
    /** Week numbers in the calendar (default true). */
    showWeekNumbers?: boolean;
    specialDaysRules?: SpecialDayRule<D>[];
    /** First day of the week, 1 (Sunday) to 7; by default from the locale. */
    startingDayOfWeek?: DaysOfWeek | null;
    yearGrid?: CalendarYearGrid;
    aggregatedYearGrid?: CalendarYearGrid;
    rangeHoverEffect?: boolean;
    /** Picks months or years instead of days. */
    dateRangeFormat?: '' | 'month' | 'year';
    showCalendarLegend?: boolean;
    legendCol?: boolean;
    disableFunction?: DisableDateFunction<D>;
    disableRangeStartFunction?: DisableDateFunction<D>;
    disableRangeEndFunction?: DisableDateFunction<D>;
    previousButtonDisableFunction?: NavigationButtonDisableFunction<D> | null;
    nextButtonDisableFunction?: NavigationButtonDisableFunction<D> | null;
    /** Opens the calendar in a full-screen dialog. */
    mobile?: boolean;
    mobileConfig?: DatePickerMobileConfig;
    /** The layout of the calendar in the mobile dialog: portrait unless landscape is set. */
    mobileLandscape?: boolean;
    mobilePortrait?: boolean;
    labels?: Partial<DatePickerLabels>;
    calendarLabels?: Partial<CalendarLabels>;
    /** Element the popover (or the mobile dialog) is rendered into (default `document.body`). */
    container?: HTMLElement | null;

    /** The selected date (controlled; `null` for none). */
    selectedDate?: D | null;
    defaultSelectedDate?: D | null;
    onSelectedDateChange?: (date: D | null) => void;
    /** The selected dates with `allowMultipleSelection` (controlled). */
    selectedMultipleDates?: D[];
    defaultSelectedMultipleDates?: D[];
    onSelectedMultipleDatesChange?: (dates: D[]) => void;
    /** The selected range with `type="range"` (controlled). */
    selectedRangeDate?: DateRange<D> | null;
    defaultSelectedRangeDate?: DateRange<D> | null;
    onSelectedRangeDateChange?: (range: DateRange<D> | null) => void;
    /** The selected ranges with `type="range"` and `allowMultipleSelection` (controlled). */
    selectedMultipleDateRanges?: DateRange<D>[];
    defaultSelectedMultipleDateRanges?: DateRange<D>[];
    onSelectedMultipleDateRangesChange?: (ranges: DateRange<D>[]) => void;
    /** The user changed the value (Angular's form value): the date, dates, range or ranges of the selection mode. */
    onValueChange?: (value: DatePickerValue<D>) => void;
    /** Whether the value is valid (readable, allowed, and present unless `allowNull`); on mount and on change. */
    onValidityChange?: (valid: boolean) => void;
    /** Whether the calendar is open (controlled). */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** The calendar view (controlled). */
    activeView?: FdCalendarView;
    /** The calendar view at first (default `day`, or the `dateRangeFormat` view). */
    defaultActiveView?: FdCalendarView;
    onActiveViewChange?: (view: FdCalendarView) => void;

    /** Props for the input (fundamental-react). */
    inputProps?: InputGroupInputProps;
    /** Props for the input group (fundamental-react). */
    inputGroupProps?: Omit<InputGroupProps, 'children'>;
    /** Props for the calendar button (fundamental-react). */
    buttonProps?: Omit<ButtonProps, 'render'>;
    /** Props for the calendar (fundamental-react). */
    calendarProps?: Partial<CalendarProps<D>>;
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

/**
 * Date picker: a date field with a button that opens a calendar in a popover. Single dates, ranges and multiple
 * dates or ranges; typed dates are read while typing, or on Enter and blur with `processInputOnBlur`. A date that
 * cannot be read, or one the disable functions reject, sets the error state. F4 and Alt+Down open the calendar,
 * Escape closes it and returns to the field. In mobile mode the calendar opens in a dialog that can be approved or
 * cancelled. Dates go through the `DatetimeAdapter` of `useDatetimeAdapter()` (by default `FdDate`).
 *
 * ```tsx
 * <DatePicker selectedDate={date} onSelectedDateChange={setDate} />
 * <DatePicker type="range" selectedRangeDate={range} onSelectedRangeDateChange={setRange} showTodayButton />
 * ```
 */
export function DatePicker<D = FdDate>({
    id: idProp,
    inputId,
    type = 'single',
    allowMultipleSelection = false,
    placeholder,
    disabled = false,
    readOnly = false,
    required = false,
    customDateTimeFormat,
    message,
    messageType = 'default',
    messageTriggers = DEFAULT_MESSAGE_TRIGGERS,
    placement = 'bottom-start',
    useValidation = true,
    state,
    allowNull = true,
    closeOnDateChoose = true,
    processInputOnBlur = false,
    preventScrollOnFocus = false,
    buttonFocusable = false,
    showTodayButton = false,
    todayButtonLabel = 'Today',
    openToDate,
    markWeekends = true,
    showWeekNumbers = true,
    specialDaysRules,
    startingDayOfWeek,
    yearGrid = DEFAULT_YEAR_GRID,
    aggregatedYearGrid = DEFAULT_AGGREGATED_YEAR_GRID,
    rangeHoverEffect = false,
    dateRangeFormat = '',
    showCalendarLegend = false,
    legendCol = false,
    disableFunction,
    disableRangeStartFunction,
    disableRangeEndFunction,
    previousButtonDisableFunction,
    nextButtonDisableFunction,
    mobile = false,
    mobileConfig = {},
    mobileLandscape = false,
    mobilePortrait = false,
    labels: labelsProp,
    calendarLabels,
    container,
    selectedDate: selectedDateProp,
    defaultSelectedDate = null,
    onSelectedDateChange,
    selectedMultipleDates: selectedMultipleDatesProp,
    defaultSelectedMultipleDates = NO_DATES,
    onSelectedMultipleDatesChange,
    selectedRangeDate: selectedRangeDateProp,
    defaultSelectedRangeDate = null,
    onSelectedRangeDateChange,
    selectedMultipleDateRanges: selectedMultipleDateRangesProp,
    defaultSelectedMultipleDateRanges = NO_DATES,
    onSelectedMultipleDateRangesChange,
    onValueChange,
    onValidityChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    activeView: activeViewProp,
    defaultActiveView,
    onActiveViewChange,
    inputProps,
    inputGroupProps,
    buttonProps,
    calendarProps,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    className,
    children,
    ref,
    ...props
}: DatePickerProps<D>) {
    const a = useDatetimeAdapter<D>();
    const formats = useDateTimeFormats<unknown>();
    const autoId = useId();
    const id = idProp ?? `fd-date-picker${autoId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    const labels = { ...DATE_PICKER_LABELS, ...labelsProp };
    const single = type === 'single';
    const canOpen = !disabled && !readOnly;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const setRoot = (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
    };
    const groupRef = useRef<HTMLDivElement>(null);
    const fieldRef = useRef<HTMLInputElement>(null);

    const [selectedDate, setSelectedDate] = useControlled<D | null>(
        selectedDateProp,
        () => defaultSelectedDate,
        onSelectedDateChange
    );
    const [selectedMultipleDates, setSelectedMultipleDates] = useControlled<D[]>(
        selectedMultipleDatesProp,
        () => defaultSelectedMultipleDates,
        onSelectedMultipleDatesChange
    );
    const [selectedRangeDate, setSelectedRangeDate] = useControlled<DateRange<D> | null>(
        selectedRangeDateProp,
        () => defaultSelectedRangeDate,
        onSelectedRangeDateChange
    );
    const [selectedMultipleDateRanges, setSelectedMultipleDateRanges] = useControlled<DateRange<D>[]>(
        selectedMultipleDateRangesProp,
        () => defaultSelectedMultipleDateRanges,
        onSelectedMultipleDateRangesChange
    );
    const [isOpen, setOpenState] = useControlled<boolean>(openProp, () => defaultOpen, onOpenChange);
    // month and year range formats start in their view
    const [activeView, setActiveView] = useControlled<FdCalendarView>(
        activeViewProp,
        () => defaultActiveView ?? (dateRangeFormat || 'day'),
        onActiveViewChange
    );
    const [messageShown, setMessageShown] = useState(false);
    /** A range whose start is picked and whose end is still missing: shown in the calendar, not the value yet. */
    const [draftRange, setDraftRange] = useState<DateRange<D> | null>(null);

    /** The current value, by the selection mode. */
    const value: DatePickerValue<D> = allowMultipleSelection
        ? single
            ? (selectedMultipleDates ?? [])
            : (selectedMultipleDateRanges ?? [])
        : single
          ? (selectedDate ?? null)
          : (selectedRangeDate ?? null);

    // parsing and formatting

    const delimiter = formats.rangeDelimiter;
    const displayFormat = customDateTimeFormat ?? formats.display.dateInput;
    const parseFormat = customDateTimeFormat ?? formats.parse.dateInput;

    const isValidDate = (date: D | null | undefined): date is D => date != null && a.isValid(date);

    const parseDate = (text: string): D | null => {
        text = text.trim();
        return text ? a.parse(text, parseFormat) : null;
    };

    const parseRange = (text: string): DateRange<D> => {
        // the full delimiter first: dashes may also separate the parts of a date
        const parts = text.includes(delimiter) ? text.split(delimiter) : text.split(delimiter.trim());
        const [start, end] = parts.map((part) => parseDate(part));
        if (isValidDate(start) && isValidDate(end) && a.compareDate(start, end) > 0)
            return new DateRange<D>(end, start);
        return new DateRange<D>(start ?? null, end ?? null);
    };

    const parseValue = (text: string): DatePickerValue<D> => {
        if (!text) return allowMultipleSelection ? [] : null;
        if (single) {
            return allowMultipleSelection ? text.split(',').map((part) => parseDate(part) as D) : parseDate(text);
        }
        return allowMultipleSelection ? text.split(',').map((part) => parseRange(part)) : parseRange(text);
    };

    const formatDate = (date: D | null | undefined): string => (isValidDate(date) ? a.format(date, displayFormat) : '');

    const formatRange = (range: DateRange<D> | null | undefined): string => {
        if (!range?.start && !range?.end) return '';
        return formatDate(range.start) + delimiter + formatDate(range.end);
    };

    const formatValue = (next: DatePickerValue<D>): string => {
        if (next == null) return '';
        if (Array.isArray(next)) {
            return (next as (D | DateRange<D>)[])
                .map((item) => (item instanceof DateRange ? formatRange(item) : formatDate(item)))
                .join(', ');
        }
        return next instanceof DateRange ? formatRange(next) : formatDate(next);
    };

    /** All dates of the value can be formatted. */
    const readable = (next: DatePickerValue<D>): boolean => {
        const valid = (date: D | null | undefined) => date == null || a.isValid(date);
        const items: (D | DateRange<D>)[] = next == null ? [] : Array.isArray(next) ? next : [next];
        return items.every((item) =>
            item instanceof DateRange
                ? valid(item.start) && valid(item.end) && !!item.start === !!item.end
                : valid(item)
        );
    };

    const firstDateOf = (next: DatePickerValue<D>): D | null => {
        const first = Array.isArray(next) ? next[0] : next;
        const date = first instanceof DateRange ? first.start : first;
        return isValidDate(date) ? date : null;
    };

    const sameValue = (x: DatePickerValue<D>, y: DatePickerValue<D>): boolean => {
        const eq = (p: D | DateRange<D> | null | undefined, q: D | DateRange<D> | null | undefined): boolean => {
            if (p instanceof DateRange || q instanceof DateRange) {
                const rp = p as DateRange<D> | null;
                const rq = q as DateRange<D> | null;
                return (
                    a.datesEqual(rp?.start, rq?.start) && a.datesEqual(rp?.end, rq?.end) && !!rp?.start === !!rq?.start
                );
            }
            if (p == null || q == null) return p == q;
            return a.datesEqual(p, q);
        };
        if (Array.isArray(x) || Array.isArray(y)) {
            const xs = (x ?? []) as (D | DateRange<D>)[];
            const ys = (y ?? []) as (D | DateRange<D>)[];
            return xs.length === ys.length && xs.every((item, i) => eq(item, ys[i]));
        }
        return eq(x, y);
    };

    // validation

    const isDateValid = (date: D | null | undefined, disable: DisableDateFunction<D>): boolean =>
        isValidDate(date) && !disable?.(date);

    const isRangeValid = (range: DateRange<D> | null | undefined): boolean =>
        !!range &&
        isDateValid(range.start, disableRangeStartFunction) &&
        isDateValid(range.end, disableRangeEndFunction);

    const isValueValid = (next: DatePickerValue<D>): boolean => {
        const empty = next == null || (Array.isArray(next) && next.length === 0);
        if (empty) return allowNull;
        if (Array.isArray(next)) {
            return (next as (D | DateRange<D>)[]).every((item) =>
                item instanceof DateRange ? isRangeValid(item) : isDateValid(item, disableFunction)
            );
        }
        if (next instanceof DateRange) return (!next.start && !next.end && allowNull) || isRangeValid(next);
        return isDateValid(next, disableFunction);
    };

    /** The value cannot be read, is not allowed, or is missing without `allowNull`. */
    const invalid = !isValueValid(value);
    const valid = !invalid;
    useEffect(() => {
        onValidityChange?.(valid);
    }, [valid]);

    // the text of the field: the formatted value, or what was typed (Angular's linked signal)

    const sourceOf = (next: DatePickerValue<D>) => `${readable(next) ? 1 : 0}|${formatValue(next)}`;
    const source = sourceOf(value);
    const [text, setText] = useState(() => formatValue(value));
    const [textSource, setTextSource] = useState(source);
    // the value, the locale or the format changed: a readable value shows formatted, an unreadable one keeps the text
    if (source !== textSource) {
        setTextSource(source);
        if (readable(value)) setText(formatValue(value));
    }
    /** Sets the text of the field for a value written at the same time, so that value does not replace it. */
    const writeText = (next: string, forValue: DatePickerValue<D>) => {
        setText(next);
        setTextSource(sourceOf(forValue));
    };

    const computedState: DatePickerState = state ?? (useValidation && invalid ? 'error' : 'default');

    /** The state, read as the description of the field; the message describes it too (its message group). */
    const stateLabel =
        computedState === 'default'
            ? ''
            : {
                  success: labels.successStateLabel,
                  information: labels.informationStateLabel,
                  warning: labels.warningStateLabel,
                  error: labels.errorStateLabel
              }[computedState];
    const descriptionId = `${id}-description`;

    // the value

    const setValue = (next: DatePickerValue<D>) => {
        if (allowMultipleSelection) {
            if (single) setSelectedMultipleDates((next as D[] | null) ?? []);
            else setSelectedMultipleDateRanges((next as DateRange<D>[] | null) ?? []);
        } else if (single) {
            setSelectedDate(next as D | null);
        } else {
            setSelectedRangeDate(next as DateRange<D> | null);
        }
    };

    const commit = (next: DatePickerValue<D>) => {
        setValue(next);
        writeText(formatValue(next), next);
        onValueChange?.(next);
    };

    // opening and closing

    const calendarActions = useRef<CalendarActions<D> | null>(null);
    const focusCalendarPending = useRef(false);
    const focusFieldPending = useRef(false);
    /** The value when the mobile dialog opened, restored when it is cancelled. */
    const snapshot = useRef<{ value: DatePickerValue<D> } | null>(null);
    const latest = useRef({ value, openToDate, firstDateOf });
    latest.current = { value, openToDate, firstDateOf };

    /** The calendar of this opening has been shown the month of the value. */
    const calendarShown = useRef(false);

    /**
     * Once the calendar is there: shows the month of the value (or `openToDate`) and, when opened by the user,
     * focuses the active cell.
     */
    const setCalendarActions = useCallback((actions: CalendarActions<D> | null) => {
        calendarActions.current = actions;
        if (!actions) return;
        if (!calendarShown.current) {
            calendarShown.current = true;
            const { value: current, openToDate: openTo, firstDateOf: first } = latest.current;
            actions.setCurrentlyDisplayed(first(current) ?? openTo);
        }
        if (!focusCalendarPending.current) return;
        focusCalendarPending.current = false;
        actions.initialFocus();
    }, []);

    useEffect(() => {
        if (!isOpen) calendarShown.current = false;
        if (isOpen || !focusFieldPending.current) return;
        focusFieldPending.current = false;
        fieldRef.current?.focus({ preventScroll: preventScrollOnFocus });
    }, [isOpen, preventScrollOnFocus]);

    /** Opens or closes the calendar; closing returns the focus to the field unless `focusField` is false. */
    const setOpen = (open: boolean, focusField = true) => {
        if (open && !canOpen) return;
        if (open === isOpen) return;
        setMessageShown(false);
        setDraftRange(null);
        if (open) {
            focusCalendarPending.current = true;
            if (mobile) snapshot.current = { value };
        } else {
            focusCalendarPending.current = false;
            snapshot.current = null;
            // the mobile dialog returns the focus itself
            focusFieldPending.current = focusField && !mobile;
        }
        setOpenState(open);
    };

    const closeAfterPick = () => {
        // in mobile mode the dialog buttons close
        if (mobile) return;
        setOpen(false);
    };

    // picking in the calendar

    const pickDate = (date: D | null) => {
        if (!date) return;
        commit(date);
        if (closeOnDateChoose) closeAfterPick();
    };

    const pickDates = (dates: D[]) => commit(dates ?? []);

    const pickRange = (range: DateRange<D> | null) => {
        // months or years of a single date picker: the calendar picks ranges, the picker takes their start
        if (single) {
            if (range?.start) pickDate(range.start);
            return;
        }
        // the first click only starts the range
        if (!range?.end) {
            setDraftRange(range);
            return;
        }
        setDraftRange(null);
        if (sameValue(range, selectedRangeDate)) return;
        commit(new DateRange<D>(range.start, range.end));
        if (closeOnDateChoose) closeAfterPick();
    };

    const pickRanges = (ranges: DateRange<D>[]) => {
        if (sameValue(ranges, selectedMultipleDateRanges)) return;
        commit(ranges);
    };

    /** Selects today. */
    const selectToday = () => {
        const today = a.today();
        if (single) {
            if (allowMultipleSelection) pickDates([today]);
            else pickDate(today);
        } else {
            const range = new DateRange<D>(today, today);
            if (allowMultipleSelection) pickRanges([range]);
            else pickRange(range);
        }
    };

    // typing

    /** Reads typed text; `typing` is true for input events. */
    const read = (raw: string, typing: boolean) => {
        if (!typing && !processInputOnBlur) {
            // already read while typing: tidy the text of a readable value
            if (!invalid && readable(value)) writeText(formatValue(value), value);
            return;
        }
        const trimmed = raw.trim();
        const next = parseValue(trimmed);
        const changed = !sameValue(next, value);
        const nextInvalid = !trimmed ? !allowNull : !isValueValid(next);
        if (changed) {
            setValue(next);
            onValueChange?.(next);
        }
        // keep what was typed, spaces included
        if (typing) writeText(raw, next);
        else if (!nextInvalid && trimmed) writeText(formatValue(next), next);
        if (!nextInvalid) calendarActions.current?.setCurrentlyDisplayed(firstDateOf(next));
    };

    const onFieldKeyDown = (event: Parameters<NonNullable<InputGroupInputProps['onKeyDown']>>[0]) => {
        inputProps?.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === 'Enter') {
            read(event.currentTarget.value, false);
        } else if (event.key === 'F4') {
            event.preventDefault();
            setOpen(!isOpen);
        } else if (event.key === 'ArrowDown' && event.altKey) {
            event.preventDefault();
            setOpen(true);
        }
    };

    // mobile dialog

    const dialogApprove = () => {
        snapshot.current = null;
        setOpen(false);
    };

    const dialogDismiss = () => {
        const saved = snapshot.current;
        snapshot.current = null;
        if (saved && !sameValue(saved.value, value)) commit(saved.value);
        setOpen(false);
    };

    const onPopoverOpenChange = (open: boolean, details: PopoverOpenChangeDetails) => {
        if (!open && (details.reason === 'outside-press' || details.reason === 'focus-out')) {
            // the field is part of the picker: pressing or focusing it keeps the calendar open
            const event = details.event as (Event & { relatedTarget?: EventTarget | null }) | undefined;
            const inside = (node: EventTarget | null | undefined) =>
                node instanceof Node && !!rootRef.current?.contains(node);
            if (inside(event?.target) || inside(event?.relatedTarget)) {
                details.cancel();
                return;
            }
            // the focus went elsewhere: it stays there
            setOpen(false, false);
            return;
        }
        setOpen(open);
    };

    const onDialogOpenChange = (open: boolean, details: DialogOpenChangeDetails) => {
        if (open) return;
        // closed with Escape or the close button: discard like cancel
        details.cancel();
        dialogDismiss();
    };

    // rendering

    const fieldLabel = ariaLabelledBy
        ? undefined
        : (ariaLabel ?? (single ? labels.inputLabel : labels.rangeInputLabel));
    const describedBy = [inputProps?.['aria-describedby'], stateLabel && descriptionId].filter(Boolean).join(' ');

    const toggleButtonProps: ButtonProps = {
        variant: 'transparent',
        glyph: 'appointment-2',
        'aria-label': labels.toggleLabel,
        title: labels.toggleLabel,
        tabIndex: buttonFocusable ? undefined : -1,
        disabled: disabled,
        ...buttonProps,
        className: cn(isOpen && 'text-(--igBtnFocusColor,var(--sapButton_Selected_TextColor))', buttonProps?.className)
    };

    const control = (
        <FormInputMessageGroup
            open={messageShown}
            onOpenChange={(open) => setMessageShown(open && !isOpen)}
            triggers={message ? messageTriggers : []}
        >
            <InputGroup
                state={computedState}
                disabled={disabled}
                readOnly={readOnly}
                showFocus
                {...inputGroupProps}
                ref={groupRef}
            >
                <InputGroupInput
                    type="text"
                    autoComplete="off"
                    id={inputId ?? `${id}-input`}
                    placeholder={placeholder || undefined}
                    aria-label={fieldLabel}
                    aria-labelledby={ariaLabelledBy}
                    aria-required={required || undefined}
                    aria-invalid={computedState === 'error' || undefined}
                    {...inputProps}
                    // fundamental-styles' date picker field: the compact field padding at the start (the group
                    // keeps 0.625rem there), and an italic placeholder also in HC (the group sets `not-italic`)
                    className={cn('compact:first:ps-2 hc:placeholder:italic!', inputProps?.className)}
                    ref={fieldRef}
                    value={text}
                    disabled={disabled}
                    readOnly={readOnly}
                    aria-describedby={describedBy || undefined}
                    onChange={(event) => {
                        inputProps?.onChange?.(event);
                        const raw = event.currentTarget.value;
                        if (processInputOnBlur) setText(raw);
                        else read(raw, true);
                    }}
                    onKeyDown={onFieldKeyDown}
                    onClick={(event) => {
                        inputProps?.onClick?.(event);
                        if (mobile) setOpen(true);
                    }}
                    onBlur={(event) => {
                        inputProps?.onBlur?.(event);
                        read(event.currentTarget.value, false);
                    }}
                />
                {!readOnly && (
                    <InputGroupAddon button>
                        {/* the calendar opens in a dialog (the popover body or the mobile dialog), so
                            aria-haspopup is "dialog" where upstream says "grid" */}
                        {mobile ? (
                            <Button
                                {...toggleButtonProps}
                                aria-haspopup="dialog"
                                aria-expanded={isOpen}
                                onClick={(event) => {
                                    buttonProps?.onClick?.(event);
                                    setOpen(!isOpen);
                                }}
                            />
                        ) : (
                            <PopoverTrigger render={<Button {...toggleButtonProps} />} />
                        )}
                    </InputGroupAddon>
                )}
            </InputGroup>
            {message ? <FormMessage type={messageType}>{message}</FormMessage> : null}
        </FormInputMessageGroup>
    );

    const calendar = (
        <>
            <Calendar<D>
                id={`${id}-calendar`}
                calType={type}
                allowMultipleSelection={allowMultipleSelection}
                activeView={activeView}
                onActiveViewChange={setActiveView}
                markWeekends={markWeekends}
                showWeekNumbers={showWeekNumbers}
                specialDaysRules={specialDaysRules}
                startingDayOfWeek={startingDayOfWeek}
                yearGrid={yearGrid}
                aggregatedYearGrid={aggregatedYearGrid}
                rangeHoverEffect={rangeHoverEffect}
                dateRangeFormat={dateRangeFormat}
                showCalendarLegend={showCalendarLegend}
                legendCol={legendCol}
                disableFunction={disableFunction}
                disableRangeStartFunction={disableRangeStartFunction}
                disableRangeEndFunction={disableRangeEndFunction}
                previousButtonDisableFunction={previousButtonDisableFunction}
                nextButtonDisableFunction={nextButtonDisableFunction}
                mobileLandscape={mobile && mobileLandscape}
                mobilePortrait={mobile && (mobilePortrait || !mobileLandscape)}
                labels={calendarLabels}
                {...calendarProps}
                actionsRef={setCalendarActions}
                selectedDate={isValidDate(selectedDate) ? selectedDate : null}
                selectedMultipleDates={selectedMultipleDates ?? []}
                selectedRangeDate={single ? null : (draftRange ?? selectedRangeDate ?? null)}
                selectedMultipleDateRanges={selectedMultipleDateRanges ?? []}
                onSelectedDateChange={pickDate}
                onSelectedMultipleDatesChange={pickDates}
                onSelectedRangeDateChange={pickRange}
                onSelectedMultipleDateRangesChange={pickRanges}
            />
            {showTodayButton && (
                // the popover's bottom corners, and a decisive (4rem) button, as fundamental-styles' footer
                <Bar
                    barDesign="footer"
                    className={cn('overflow-hidden', !mobile && 'rounded-b-sap-popover-border-corner-radius')}
                >
                    <BarRight>
                        <BarElement>
                            <Button
                                decisive
                                // `decisive` alone loses to the compact button minimum (a button issue)
                                className="compact:min-w-16"
                                label={todayButtonLabel}
                                onClick={selectToday}
                            />
                        </BarElement>
                    </BarRight>
                </Bar>
            )}
        </>
    );

    const description = stateLabel ? (
        <div className="hidden" aria-hidden="true">
            <div id={descriptionId}>{stateLabel}</div>
        </div>
    ) : null;

    if (mobile) {
        const title = mobileConfig.title;
        return (
            <div {...props} id={id} ref={setRoot} className={cn('inline-block', className)}>
                {control}
                {description}
                <Dialog open={isOpen} onOpenChange={onDialogOpenChange} escKeyCloseable backdropClickCloseable={false}>
                    <DialogPopup
                        mobile
                        disablePaddings
                        container={container}
                        aria-label={title ? undefined : labels.calendarLabel}
                        initialFocus={false}
                        finalFocus={fieldRef}
                    >
                        <DialogHeader>
                            {title && <DialogTitle id={`${id}-dialog-title`}>{title}</DialogTitle>}
                            {mobileConfig.hasCloseButton !== false && (
                                <DialogCloseButton mobile aria-label={labels.closeLabel} />
                            )}
                        </DialogHeader>
                        <DialogBody>
                            {children}
                            {calendar}
                        </DialogBody>
                        {(mobileConfig.approveButtonText || mobileConfig.cancelButtonText) && (
                            <DialogFooter>
                                {mobileConfig.approveButtonText && (
                                    <ButtonBar
                                        variant="emphasized"
                                        label={mobileConfig.approveButtonText}
                                        onClick={dialogApprove}
                                    />
                                )}
                                {mobileConfig.cancelButtonText && (
                                    <ButtonBar label={mobileConfig.cancelButtonText} onClick={dialogDismiss} />
                                )}
                            </DialogFooter>
                        )}
                    </DialogPopup>
                </Dialog>
            </div>
        );
    }

    return (
        <div {...props} id={id} ref={setRoot} className={cn('inline-block', className)}>
            <Popover
                placement={placement}
                open={isOpen}
                onOpenChange={onPopoverOpenChange}
                disabled={!canOpen}
                anchor={groupRef}
                closeOnEscapeKey
                focusTrapped
                focusAutoCapture={false}
                restoreFocusOnClose={false}
            >
                {control}
                <PopoverBody aria-label={labels.calendarLabel} container={container}>
                    {message ? (
                        <FormMessage type={messageType} embedded static>
                            {message}
                        </FormMessage>
                    ) : null}
                    {children}
                    {calendar}
                </PopoverBody>
            </Popover>
            {description}
        </div>
    );
}
