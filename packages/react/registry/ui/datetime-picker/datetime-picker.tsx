/*
 * Port of @fundamental-ngx/core (datetime-picker) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    useCallback,
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type FocusEvent,
    type ReactNode,
    type Ref
} from 'react';
import { useDateTimeFormats, useDatetimeAdapter, type FdDate } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import { Bar, BarElement, BarRight, ButtonBar } from '@/ui/bar/bar';
import { Button, type ButtonProps } from '@/ui/button/button';
import {
    Calendar,
    type CalendarActions,
    type CalendarLabels,
    type CalendarProps,
    type CalendarYearGrid,
    type DaysOfWeek,
    type DisableDateFunction,
    type FdCalendarView,
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
import { InputGroup, InputGroupAddon, InputGroupInput, type InputGroupInputProps } from '@/ui/input-group/input-group';
import {
    Popover,
    PopoverBody,
    PopoverBodyFooter,
    PopoverTrigger,
    type Placement,
    type PopoverOpenChangeDetails,
    type TriggerConfig
} from '@/ui/popover/popover';
import { SegmentedButton, SegmentedButtonItem } from '@/ui/segmented-button/segmented-button';
import { Time, type TimeLabels, type TimeProps } from '@/ui/time/time';

export type DatetimePickerState = 'success' | 'error' | 'warning' | 'default' | 'information';

/** Dialog options of a datetime picker in mobile mode. */
export interface DatetimePickerMobileConfig {
    title?: string;
    /** Shows a close button in the header (default true). */
    hasCloseButton?: boolean;
    approveButtonText?: string;
    cancelButtonText?: string;
}

export interface DatetimePickerLabels {
    inputLabel: string;
    toggleLabel: string;
    pickerLabel: string;
    displayTypeLabel: string;
    dateLabel: string;
    timeLabel: string;
    okLabel: string;
    cancelLabel: string;
    closeLabel: string;
    /** Read with the message, by the state of the field. */
    successStateLabel: string;
    informationStateLabel: string;
    warningStateLabel: string;
    errorStateLabel: string;
}

export const DATETIME_PICKER_LABELS: DatetimePickerLabels = {
    inputLabel: 'Date and time input',
    toggleLabel: 'Open picker',
    pickerLabel: 'Choose date and time',
    displayTypeLabel: 'Show date or time',
    dateLabel: 'Date',
    timeLabel: 'Time',
    okLabel: 'OK',
    cancelLabel: 'Cancel',
    closeLabel: 'Close',
    successStateLabel: 'Value state Success',
    informationStateLabel: 'Value state Information',
    warningStateLabel: 'Value state Warning',
    errorStateLabel: 'Value state Error'
};

/** What a datetime picker can be asked to do from code (Angular's public members), see `actionsRef`. */
export interface DatetimePickerActions {
    /** Opens or closes the picker; closing without OK drops the picked values. */
    setOpen(open: boolean): void;
    /** Applies the picked date and time and closes. */
    submit(): void;
    /** Drops the picked date and time and closes. */
    cancel(): void;
    /** Reads a text as the field does: `typing` for input events, otherwise as Enter and blur. */
    read(text: string, typing: boolean): void;
    /** Whether the value is unreadable or not allowed (Angular's `invalid` and `validate()`). */
    isInvalid(): boolean;
}

const DEFAULT_MESSAGE_TRIGGERS: readonly string[] = ['focusin', 'focusout'];
const NO_TRIGGERS: readonly string[] = [];
const DEFAULT_YEAR_GRID: CalendarYearGrid = { rows: 4, cols: 5 };
const DEFAULT_AGGREGATED_YEAR_GRID: CalendarYearGrid = { rows: 4, cols: 3 };

export interface DatetimePickerProps<D = FdDate> extends Omit<
    ComponentProps<'div'>,
    'defaultValue' | 'onChange' | 'placeholder' | 'children'
> {
    /** Content shown in the picker above the calendar (Angular's projected content). */
    children?: ReactNode;
    /** Id of the input (default: the picker's id with `-input`). */
    inputId?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    /** The display and parse format; by default `dateTimeInput` of the formats. */
    customDateTimeFormat?: unknown;
    /** A 12-hour clock; by default from the format. */
    meridian?: boolean;
    /** By default from the format. */
    displayHours?: boolean;
    /** By default from the format. */
    displayMinutes?: boolean;
    /** By default from the format. */
    displaySeconds?: boolean;
    /** Two digits for the values of the time columns. */
    keepTwoDigitsTime?: boolean;
    /** Spinner buttons on the time columns (default true). */
    spinnerButtons?: boolean;
    /** A value state message, shown under the field on focus and in the picker. */
    message?: ReactNode;
    messageType?: FormMessageType;
    /** Events on the field that show and hide the message (default focus in and out). */
    messageTriggers?: readonly (string | TriggerConfig)[];
    /** Placement of the popover (default `bottom-start`). */
    placement?: Placement;
    /** An unreadable or disabled date sets the error state once the field was left, unless a `state` is set (default true). */
    useValidation?: boolean;
    state?: DatetimePickerState | null;
    /** An empty field is a valid (null) value (default true). */
    allowNull?: boolean;
    /** OK and Cancel buttons (default true); without them a pick applies at once. */
    showFooter?: boolean;
    /** Reads typed values on Enter and blur only, instead of while typing. */
    processInputOnBlur?: boolean;
    /** Returns the focus to the field without scrolling it into view. */
    preventScrollOnFocus?: boolean;
    /** The button is in the tab order (default false: F4 and Alt+Down open the picker). */
    buttonFocusable?: boolean;
    markWeekends?: boolean;
    /** Week numbers in the calendar (default true). */
    showWeekNumbers?: boolean;
    /** First day of the week, 1 (Sunday) to 7; by default from the locale. */
    startingDayOfWeek?: DaysOfWeek | null;
    yearGrid?: CalendarYearGrid;
    aggregatedYearGrid?: CalendarYearGrid;
    specialDaysRules?: SpecialDayRule<D>[];
    showCalendarLegend?: boolean;
    legendCol?: boolean;
    /** Days that cannot be picked; a typed one sets the error state. */
    disableFunction?: DisableDateFunction<D>;
    /** Opens the picker in a full-screen dialog. */
    mobile?: boolean;
    mobileConfig?: DatetimePickerMobileConfig;
    /** The layout in the mobile dialog: portrait (calendar or time) unless landscape is set. */
    mobileLandscape?: boolean;
    mobilePortrait?: boolean;
    labels?: Partial<DatetimePickerLabels>;
    calendarLabels?: Partial<CalendarLabels>;
    timeLabels?: Partial<TimeLabels>;
    /** Element the popover (or the mobile dialog) is rendered into (default `document.body`). */
    container?: HTMLElement | null;

    /** The value; a new `date` replaces what was typed or picked (Angular's `date` input). */
    date?: D | null;
    /** The value at first (uncontrolled, default none). */
    defaultDate?: D | null;
    /**
     * A change by the user (Angular's `dateChange`): a submitted pick or accepted typing that differs from the value.
     * Not for a `date` set from outside, Cancel or a submit without a change, nor for an invalid value (unreadable or
     * disabled text, or `null` without `allowNull`), which `onValueChange` still gets.
     */
    onDateChange?: (date: D | null) => void;
    /** Every change by the user, valid or not (Angular's form value, `registerOnChange`). */
    onValueChange?: (value: D | null) => void;
    /** Whether the value is valid (readable, allowed, and present unless `allowNull`); on mount and on change. */
    onValidityChange?: (valid: boolean) => void;
    /** The field was left or the picker closed (Angular's form touched state). */
    onTouched?: () => void;
    /** The picker closed without applying, by Cancel, Escape or a press outside (Angular's `closed`). */
    onClosed?: () => void;
    /** Whether the picker is open (controlled). */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** The calendar view (controlled). */
    activeView?: FdCalendarView;
    /** The calendar view at first (default `day`). */
    defaultActiveView?: FdCalendarView;
    onActiveViewChange?: (view: FdCalendarView) => void;

    /** Props for the input. */
    inputProps?: Omit<InputGroupInputProps, 'value' | 'defaultValue'>;
    /** Props for the button that opens the picker. */
    buttonProps?: Omit<ButtonProps, 'render'>;
    /** Further props for the calendar. */
    calendarProps?: Partial<CalendarProps<D>>;
    /** Further props for the time columns. */
    timeProps?: Omit<TimeProps<D>, 'time' | 'defaultTime' | 'onTimeChange' | 'id'>;
    /** `setOpen`, `submit`, `cancel`, `read` and `isInvalid` from code. */
    actionsRef?: Ref<DatetimePickerActions>;
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
 * Datetime picker: a field with a button that opens a calendar and time columns side by side. The picked date and
 * time apply with OK and are dropped with Cancel, or apply at once without the footer. On narrow screens (and in the
 * mobile portrait dialog) a switch shows either the calendar or the time. Typed values are read while typing, or on
 * Enter and blur with `processInputOnBlur`; an unreadable or disabled date sets the error state once the field was
 * left. F4 and Alt+Down open the picker, Escape closes it. Dates go through the `DatetimeAdapter` of
 * `useDatetimeAdapter()` (by default `FdDate`) and the formats of `useDateTimeFormats()`.
 *
 * Native props, `className` and `ref` go to the root; `aria-label` and `aria-labelledby` go to the input.
 *
 * ```tsx
 * <DatetimePicker date={date} onDateChange={setDate} />
 * <DatetimePicker defaultDate={date} showFooter={false} />
 * ```
 */
export function DatetimePicker<D = FdDate>({
    id: idProp,
    inputId,
    placeholder,
    disabled = false,
    required = false,
    customDateTimeFormat,
    meridian,
    displayHours,
    displayMinutes,
    displaySeconds,
    keepTwoDigitsTime = false,
    spinnerButtons = true,
    message,
    messageType = 'default',
    messageTriggers = DEFAULT_MESSAGE_TRIGGERS,
    placement = 'bottom-start',
    useValidation = true,
    state,
    allowNull = true,
    showFooter = true,
    processInputOnBlur = false,
    preventScrollOnFocus = false,
    buttonFocusable = false,
    markWeekends = true,
    showWeekNumbers = true,
    startingDayOfWeek,
    yearGrid = DEFAULT_YEAR_GRID,
    aggregatedYearGrid = DEFAULT_AGGREGATED_YEAR_GRID,
    specialDaysRules,
    showCalendarLegend = false,
    legendCol = false,
    disableFunction,
    mobile = false,
    mobileConfig = {},
    mobileLandscape = false,
    mobilePortrait = false,
    labels: labelsProp,
    calendarLabels,
    timeLabels,
    container,
    date: dateProp,
    defaultDate = null,
    onDateChange,
    onValueChange,
    onValidityChange,
    onTouched,
    onClosed,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    activeView: activeViewProp,
    defaultActiveView = 'day',
    onActiveViewChange,
    inputProps,
    buttonProps,
    calendarProps,
    timeProps,
    actionsRef,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    className,
    children,
    onBlur,
    ref,
    ...props
}: DatetimePickerProps<D>) {
    const a = useDatetimeAdapter<D>();
    const formats = useDateTimeFormats<unknown>();
    const autoId = useId();
    const id = idProp ?? `fd-datetime-picker${autoId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    const labels = { ...DATETIME_PICKER_LABELS, ...labelsProp };

    const rootRef = useRef<HTMLDivElement | null>(null);
    const setRoot = (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
    };
    const groupRef = useRef<HTMLDivElement>(null);
    const fieldRef = useRef<HTMLInputElement | null>(null);
    const bodyRef = useRef<HTMLDivElement | null>(null);

    const displayFormat = customDateTimeFormat ?? formats.display.dateTimeInput;
    const parseFormat = customDateTimeFormat ?? formats.parse.dateTimeInput;
    const isValidDate = (date: D | null | undefined): date is D => date != null && a.isValid(date);
    const format = (date: D | null | undefined) => (isValidDate(date) ? a.format(date, displayFormat) : '');

    // the value: follows `date`, and also holds what the user typed or picked (Angular's linked signal)
    const [ownValue, setOwnValue] = useState<D | null>(() => (dateProp !== undefined ? dateProp : defaultDate));
    const [seenDate, setSeenDate] = useState(dateProp);
    let value = ownValue;
    // an equal date (e.g. a new object each render) is no new date
    const sameDate =
        dateProp === seenDate ||
        (isValidDate(dateProp) && isValidDate(seenDate) && a.dateTimesEqual(dateProp, seenDate));
    if (dateProp !== undefined && !sameDate) {
        // a new date from outside: it replaces the value
        setSeenDate(dateProp);
        setOwnValue(dateProp);
        value = dateProp;
    }
    /** The value, updated at once so the events of one render go on from it. */
    const valueRef = useRef(value);
    valueRef.current = value;

    // the text of the field: the formatted value, or what was typed. It follows the value, the locale and the format;
    // an unreadable value keeps what was typed
    const formatted = format(value);
    const [textState, setTextState] = useState({ value, formatted, text: formatted });
    let text = textState.text;
    if (textState.value !== value || textState.formatted !== formatted) {
        text = value != null && !a.isValid(value) ? textState.text : formatted;
        setTextState({ value, formatted, text });
    }
    /** Sets the text of the field for a value written at the same time, so that value does not replace it. */
    const writeText = (next: string, forValue: D | null) =>
        setTextState({ value: forValue, formatted: format(forValue), text: next });

    const [isOpen, setOpenState] = useControlled<boolean>(openProp, () => defaultOpen, onOpenChange);
    const openRef = useRef(isOpen);
    openRef.current = isOpen;
    const [activeView, setActiveView] = useControlled<FdCalendarView>(
        activeViewProp,
        () => defaultActiveView,
        onActiveViewChange
    );
    const [messageShown, setMessageShown] = useState(false);
    /** Calendar or time, on narrow screens and in the mobile portrait layout. */
    const [displayType, setDisplayType] = useState<'date' | 'time'>('date');
    /** The picked values, updated at once (a pick and OK may follow each other before a render). */
    const temp = useRef<{ date: D | null; time: D | null } | null>(null);
    // they start from the value (also for a picker open at first), and again on every opening
    temp.current ??= { date: isValidDate(value) ? value : null, time: isValidDate(value) ? value : a.now() };
    const [tempDate, setTempDate] = useState<D | null>(temp.current.date);
    const [tempTime, setTempTime] = useState<D | null>(temp.current.time);
    /** The picked values were reset for this opening. */
    const tempReset = useRef(isOpen);
    const [touched, setTouched] = useState(false);

    // validation

    const isValueValid = (next: D | null | undefined): boolean => {
        if (next == null) return allowNull;
        return a.isValid(next) && !disableFunction?.(next);
    };
    /** The value cannot be read, is not allowed, or is missing without `allowNull`. */
    const invalid = !isValueValid(value);
    const valid = !invalid;
    useEffect(() => {
        onValidityChange?.(valid);
    }, [valid]);

    const computedState: DatetimePickerState = state ?? (useValidation && invalid && touched ? 'error' : 'default');

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

    const showMeridian = meridian ?? a.isTimeFormatIncludesDayPeriod(displayFormat);
    const showHours = displayHours ?? a.isTimeFormatIncludesHours(displayFormat);
    const showMinutes = displayMinutes ?? a.isTimeFormatIncludesMinutes(displayFormat);
    const showSeconds = displaySeconds ?? a.isTimeFormatIncludesSeconds(displayFormat);

    // the value

    const markTouched = () => {
        setTouched(true);
        onTouched?.();
    };

    /** A change by the user: the value, `onDateChange` when it is valid (as upstream), and the form value. */
    const setDate = (next: D | null) => {
        valueRef.current = next;
        setOwnValue(next);
        if (isValueValid(next)) onDateChange?.(next);
        onValueChange?.(next);
    };

    // opening and closing

    const calendarActions = useRef<CalendarActions<D> | null>(null);
    const focusCalendarPending = useRef(false);
    const focusFieldPending = useRef(false);
    const preventScroll = useRef(preventScrollOnFocus);
    preventScroll.current = preventScrollOnFocus;

    /** Once the calendar is there: shows the month of the picked date and, when just opened, focuses the active day. */
    const setCalendarActions = useCallback((actions: CalendarActions<D> | null) => {
        calendarActions.current = actions;
        if (!actions || !focusCalendarPending.current) return;
        focusCalendarPending.current = false;
        actions.setCurrentlyDisplayed(temp.current!.date);
        actions.initialFocus();
    }, []);

    useEffect(() => {
        if (isOpen || !focusFieldPending.current) return;
        focusFieldPending.current = false;
        fieldRef.current?.focus({ preventScroll: preventScroll.current });
    }, [isOpen]);

    /** The picked values start from the current value, or today and now. */
    const resetTemp = () => {
        const current = valueRef.current;
        const validValue = isValidDate(current);
        temp.current = { date: validValue ? current : null, time: validValue ? current : a.now() };
        setTempDate(temp.current.date);
        setTempTime(temp.current.time);
        setDisplayType('date');
    };

    // opened from outside (`open`): the picked values start from the value too
    useLayoutEffect(() => {
        if (!isOpen) {
            tempReset.current = false;
            return;
        }
        if (!tempReset.current) resetTemp();
        tempReset.current = true;
    }, [isOpen]);

    /** Opens or closes the picker; closing without OK drops the picked values and returns to the field. */
    const setOpen = (open: boolean, focusField = true) => {
        if (open && disabled) return;
        if (open === openRef.current) return;
        openRef.current = open;
        if (open) {
            resetTemp();
            tempReset.current = true;
            focusCalendarPending.current = true;
        } else {
            markTouched();
            focusCalendarPending.current = false;
            // the mobile dialog returns the focus itself
            focusFieldPending.current = focusField && !mobile;
        }
        setOpenState(open);
        setMessageShown(false);
        if (!open) onClosed?.();
    };

    const apply = (day: D | null, time: D | null) => {
        const next = a.setTime(
            a.clone(day ?? a.today()),
            a.getHours(time ?? a.now()),
            a.getMinutes(time ?? a.now()),
            a.getSeconds(time ?? a.now())
        );
        // no change, no onDateChange
        if (a.dateTimesEqual(next, valueRef.current)) return;
        setDate(next);
        writeText(format(next), next);
    };

    const pickDate = (date: D | null) => {
        if (!date) return;
        temp.current = { time: temp.current!.time, date };
        setTempDate(date);
        if (!showFooter && !mobile) apply(date, temp.current.time);
    };

    const pickTime = (time: D | null) => {
        if (!time) return;
        temp.current = { date: temp.current!.date, time };
        setTempTime(time);
        if (!showFooter && !mobile) apply(temp.current.date, time);
    };

    const submit = () => {
        apply(temp.current!.date, temp.current!.time);
        openRef.current = false;
        focusCalendarPending.current = false;
        focusFieldPending.current = !mobile;
        setOpenState(false);
        setMessageShown(false);
        markTouched();
    };

    const cancel = () => setOpen(false);

    // typing

    /** Reads typed text; `typing` is true for input events. */
    const read = (raw: string, typing: boolean) => {
        if (typing === processInputOnBlur) return;
        const trimmed = raw.trim();
        const next = trimmed ? a.parse(trimmed, parseFormat) : null;
        const current = valueRef.current;
        const same = next == null || current == null ? next == current : a.dateTimesEqual(next, current);
        const changed = !same || (next != null && !a.isValid(next));
        if (changed) setDate(next);
        // the value the field now shows: an equal date read again keeps the value it has
        const shown = changed ? next : current;
        // keep what was typed, spaces included
        if (typing) writeText(raw, shown);
        else if (isValidDate(shown)) writeText(format(shown), shown);
        if (isValidDate(next)) calendarActions.current?.setCurrentlyDisplayed(next);
    };

    const onFieldBlur = (raw: string) => {
        markTouched();
        if (processInputOnBlur) {
            read(raw, false);
            return;
        }
        // already read while typing: tidy the text of a readable value
        const current = valueRef.current;
        if (isValidDate(current)) writeText(format(current), current);
    };

    useImperativeHandle(actionsRef, () => ({ setOpen, submit, cancel, read, isInvalid: () => invalid }));

    // a picker disabled while open closes
    useEffect(() => {
        if (disabled && openRef.current) setOpen(false, false);
    }, [disabled]);

    const {
        onKeyDown: inputKeyDown,
        onBlur: inputBlur,
        onChange: inputChange,
        onClick: inputClick,
        ...restInputProps
    } = inputProps ?? {};

    const onFieldKeyDown = (event: Parameters<NonNullable<InputGroupInputProps['onKeyDown']>>[0]) => {
        inputKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === 'Enter') {
            read(event.currentTarget.value, false);
        } else if (event.key === 'F4') {
            event.preventDefault();
            setOpen(!openRef.current);
        } else if (event.key === 'ArrowDown' && event.altKey) {
            event.preventDefault();
            setOpen(true);
        }
    };

    /** Inside the picker: the root (field and button) or the open popover. */
    const inside = (node: unknown) =>
        node instanceof Node && (!!rootRef.current?.contains(node) || !!bodyRef.current?.contains(node));

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
        onBlur?.(event);
        if (!inside(event.relatedTarget)) onTouched?.();
    };

    const onPopoverOpenChange = (open: boolean, details: PopoverOpenChangeDetails) => {
        if (!open && (details.reason === 'outside-press' || details.reason === 'focus-out')) {
            // the field is part of the picker: pressing or focusing it keeps the picker open
            const event = details.event as (Event & { relatedTarget?: EventTarget | null }) | undefined;
            const inRoot = (node: EventTarget | null | undefined) =>
                node instanceof Node && !!rootRef.current?.contains(node);
            if (inRoot(event?.target) || inRoot(event?.relatedTarget)) {
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
        setOpen(false);
    };

    // rendering

    const fieldLabel = ariaLabelledBy ? undefined : (ariaLabel ?? labels.inputLabel);
    const describedBy = [restInputProps['aria-describedby'], stateLabel && descriptionId].filter(Boolean).join(' ');

    const toggleButtonProps: ButtonProps = {
        variant: 'transparent',
        glyph: 'date-time',
        'aria-label': labels.toggleLabel,
        title: labels.toggleLabel,
        tabIndex: buttonFocusable ? undefined : -1,
        disabled,
        ...buttonProps,
        className: cn(isOpen && 'text-(--igBtnFocusColor,var(--sapButton_Selected_TextColor))', buttonProps?.className)
    };

    const control = (
        <FormInputMessageGroup
            open={messageShown}
            onOpenChange={(open) => setMessageShown(open && !openRef.current)}
            triggers={message ? messageTriggers : NO_TRIGGERS}
        >
            <InputGroup state={computedState} disabled={disabled} showFocus ref={groupRef}>
                <InputGroupInput
                    type="text"
                    autoComplete="off"
                    id={inputId ?? `${id}-input`}
                    placeholder={placeholder || undefined}
                    aria-label={fieldLabel}
                    aria-labelledby={ariaLabelledBy}
                    aria-required={required || undefined}
                    aria-invalid={computedState === 'error' || undefined}
                    {...restInputProps}
                    ref={(node: HTMLInputElement | null) => {
                        fieldRef.current = node;
                        const inputRef = restInputProps.ref;
                        if (typeof inputRef === 'function') return inputRef(node);
                        if (inputRef) inputRef.current = node;
                    }}
                    value={text}
                    disabled={disabled}
                    aria-describedby={describedBy || undefined}
                    onChange={(event) => {
                        inputChange?.(event);
                        const raw = event.currentTarget.value;
                        if (processInputOnBlur) setTextState((s) => ({ ...s, text: raw }));
                        else read(raw, true);
                    }}
                    onKeyDown={onFieldKeyDown}
                    onClick={(event) => {
                        inputClick?.(event);
                        if (mobile) setOpen(true);
                    }}
                    onBlur={(event) => {
                        inputBlur?.(event);
                        onFieldBlur(event.currentTarget.value);
                    }}
                />
                <InputGroupAddon button>
                    {/* the picker opens in a dialog (the popover body or the mobile dialog), so aria-haspopup is
                        "dialog" */}
                    {mobile ? (
                        <Button
                            {...toggleButtonProps}
                            aria-haspopup="dialog"
                            aria-expanded={isOpen}
                            onClick={(event) => {
                                buttonProps?.onClick?.(event);
                                setOpen(!openRef.current);
                            }}
                        />
                    ) : (
                        <PopoverTrigger render={<Button {...toggleButtonProps} />} />
                    )}
                </InputGroupAddon>
            </InputGroup>
            {message ? <FormMessage type={messageType}>{message}</FormMessage> : null}
        </FormInputMessageGroup>
    );

    const portrait = mobile && !mobileLandscape;
    const hiddenClass = portrait ? 'hidden' : 'max-[60rem]:hidden';

    const picker = (
        <div
            className={
                mobile ? 'pb-4' : 'max-h-[80vh] max-w-[80vw] overflow-auto pb-4 max-[60rem]:min-w-[min(20rem,90vw)]'
            }
        >
            {message ? (
                <FormMessage type={messageType} embedded static>
                    {message}
                </FormMessage>
            ) : null}
            <div className={cn('mt-4 w-full justify-center', portrait ? 'flex' : 'hidden max-[60rem]:flex')}>
                <SegmentedButton
                    aria-label={labels.displayTypeLabel}
                    value={displayType}
                    onValueChange={(next) => setDisplayType(next as 'date' | 'time')}
                >
                    <SegmentedButtonItem value="date" label={labels.dateLabel} />
                    <SegmentedButtonItem value="time" label={labels.timeLabel} />
                </SegmentedButton>
            </div>
            {children}
            <div className="mx-4 flex items-center justify-center">
                <Calendar<D>
                    id={`${id}-calendar`}
                    calType="single"
                    activeView={activeView}
                    onActiveViewChange={setActiveView}
                    escapeFocusFunction={null}
                    // the full-width portrait calendar of fundamental-styles' mobile pattern, as the date picker's
                    mobilePortrait={portrait}
                    disableFunction={disableFunction}
                    markWeekends={markWeekends}
                    showWeekNumbers={showWeekNumbers}
                    specialDaysRules={specialDaysRules}
                    showCalendarLegend={showCalendarLegend}
                    legendCol={legendCol}
                    startingDayOfWeek={startingDayOfWeek}
                    yearGrid={yearGrid}
                    aggregatedYearGrid={aggregatedYearGrid}
                    labels={calendarLabels}
                    {...calendarProps}
                    className={cn(displayType !== 'date' && hiddenClass, calendarProps?.className)}
                    actionsRef={setCalendarActions}
                    selectedDate={tempDate}
                    onSelectedDateChange={pickDate}
                />
                {!portrait && (
                    <div
                        aria-hidden="true"
                        className="mx-7 my-10.5 w-px self-stretch bg-sap-group-content-border-color max-[60rem]:hidden"
                    />
                )}
                <Time<D>
                    {...timeProps}
                    id={`${id}-time`}
                    className={cn('w-auto', displayType !== 'time' && hiddenClass, timeProps?.className)}
                    time={tempTime}
                    meridian={showMeridian}
                    displayHours={showHours}
                    displayMinutes={showMinutes}
                    displaySeconds={showSeconds}
                    keepTwoDigits={keepTwoDigitsTime}
                    spinnerButtons={spinnerButtons}
                    disabled={disabled}
                    labels={timeLabels}
                    onTimeChange={pickTime}
                />
            </div>
        </div>
    );

    const description = stateLabel ? (
        <div className="hidden" aria-hidden="true">
            <div id={descriptionId}>{stateLabel}</div>
        </div>
    ) : null;

    if (mobile) {
        const title = mobileConfig.title;
        return (
            <div {...props} id={id} ref={setRoot} className={cn('inline-block', className)} onBlur={handleBlur}>
                {control}
                {description}
                <Dialog open={isOpen} onOpenChange={onDialogOpenChange} escKeyCloseable backdropClickCloseable={false}>
                    <DialogPopup
                        mobile
                        disablePaddings
                        container={container}
                        aria-label={title ? undefined : labels.pickerLabel}
                        initialFocus={false}
                        finalFocus={fieldRef}
                    >
                        <DialogHeader>
                            {title && <DialogTitle id={`${id}-dialog-title`}>{title}</DialogTitle>}
                            {mobileConfig.hasCloseButton !== false && (
                                <DialogCloseButton mobile aria-label={labels.closeLabel} />
                            )}
                        </DialogHeader>
                        <DialogBody>{picker}</DialogBody>
                        <DialogFooter>
                            <ButtonBar
                                variant="emphasized"
                                label={mobileConfig.approveButtonText || labels.okLabel}
                                disabled={!tempDate}
                                onClick={submit}
                            />
                            <ButtonBar label={mobileConfig.cancelButtonText || labels.cancelLabel} onClick={cancel} />
                        </DialogFooter>
                    </DialogPopup>
                </Dialog>
            </div>
        );
    }

    return (
        <div {...props} id={id} ref={setRoot} className={cn('inline-block', className)} onBlur={handleBlur}>
            <Popover
                placement={placement}
                open={isOpen}
                onOpenChange={onPopoverOpenChange}
                disabled={disabled}
                anchor={groupRef}
                closeOnEscapeKey
                focusTrapped
                focusAutoCapture={false}
                restoreFocusOnClose={false}
            >
                {control}
                <PopoverBody
                    aria-label={labels.pickerLabel}
                    container={container}
                    ref={(node: HTMLDivElement | null) => {
                        bodyRef.current = node;
                    }}
                >
                    {picker}
                    {showFooter && (
                        <PopoverBodyFooter>
                            {/* the popover's bottom corners and decisive (4rem) buttons, as the date picker's footer and
                                fundamental-styles' footer buttons */}
                            <Bar
                                barDesign="footer"
                                className="overflow-hidden rounded-b-sap-popover-border-corner-radius"
                            >
                                <BarRight>
                                    <BarElement>
                                        <Button
                                            variant="emphasized"
                                            decisive
                                            label={labels.okLabel}
                                            disabled={!tempDate}
                                            onClick={submit}
                                        />
                                    </BarElement>
                                    <BarElement>
                                        <Button
                                            variant="transparent"
                                            decisive
                                            label={labels.cancelLabel}
                                            onClick={cancel}
                                        />
                                    </BarElement>
                                </BarRight>
                            </Bar>
                        </PopoverBodyFooter>
                    )}
                </PopoverBody>
            </Popover>
            {description}
        </div>
    );
}
