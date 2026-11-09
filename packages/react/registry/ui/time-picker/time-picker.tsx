/*
 * Port of fundamental-react (TimePicker) and @fundamental-ngx/core (time-picker) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    useEffect,
    useId,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type FocusEvent,
    type ReactNode,
    type Ref
} from 'react';
import { useDatetimeAdapter, useDateTimeFormats, type FdDate } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/ui/button/button';
import { FormInputMessageGroup } from '@/ui/form/form-input-message-group';
import { FormMessage, type FormMessageType } from '@/ui/form/form-message';
import { InputGroup, InputGroupAddon, InputGroupInput, type InputGroupInputProps } from '@/ui/input-group/input-group';
import {
    Popover,
    PopoverBody,
    PopoverTrigger,
    type Placement,
    type PopoverBodyProps,
    type TriggerConfig
} from '@/ui/popover/popover';
import { Time, type TimeActions, type TimeLabels, type TimeProps } from '@/ui/time/time';

export type TimePickerState = 'success' | 'error' | 'warning' | 'default' | 'information';

/** What a time picker can be asked to do from code (Angular's public members), see `actionsRef`. */
export interface TimePickerActions {
    /** Opens or closes the time columns. */
    setOpen(open: boolean): void;
    /** Reads a typed time, as Enter and leaving the field do. */
    parse(value: string): void;
    /** Whether the typed text could not be read (Angular's `invalid` and `validate()`). */
    isInvalid(): boolean;
}

export interface TimePickerProps<D = FdDate> extends Omit<
    ComponentProps<'div'>,
    'children' | 'defaultValue' | 'onChange' | 'placeholder'
> {
    /** Content above the time columns in the popover (Angular's projected content). */
    children?: ReactNode;
    /** The id of the input (default `<id>-input`), for a `<label htmlFor>`. */
    inputId?: string;
    /** Placeholder of the input; by default from the shown columns, e.g. `hh:mm am/pm`. */
    placeholder?: string;
    disabled?: boolean;
    /** Marks the input `aria-required`. */
    required?: boolean;
    spinnerButtons?: boolean;
    /** A 12-hour clock; by default from the display format. */
    meridian?: boolean;
    /** By default from the display format. */
    displayHours?: boolean;
    /** By default from the display format. */
    displayMinutes?: boolean;
    /** By default from the display format. */
    displaySeconds?: boolean;
    /** Accessible name of the input, unless `aria-label` or `aria-labelledby` is given. */
    timePickerInputLabel?: string;
    /** Accessible name and tooltip of the button. */
    timePickerButtonLabel?: string;
    /** An empty field is a valid (null) time (default true). */
    allowNull?: boolean;
    /** Smaller paddings for tablets, and touch-sized values in compact density. */
    tablet?: boolean;
    /** Value state message, shown under the field while it has the focus and above the open columns. */
    message?: ReactNode;
    messageType?: FormMessageType;
    /** Events on the field that show and hide the message (default `focusin`, `focusout`). */
    messageTriggers?: readonly (string | TriggerConfig)[];
    /** Placement of the popover (default `bottom-start`). */
    placement?: Placement;
    /** An unreadable time sets the error state, unless `state` is set (default true). */
    useValidation?: boolean;
    state?: TimePickerState | null;
    /** The button is in the tab order (default true). */
    buttonFocusable?: boolean;
    /** Two digits for the values of the columns. */
    keepTwoDigitsTime?: boolean;
    /** The display format of the adapter (with `FdDate`, `Intl.DateTimeFormat` options); default the formats' `timeInput`. */
    displayFormat?: unknown;
    /** The parse format of the adapter; default the formats' `timeInput`. */
    parseFormat?: unknown;
    minuteStep?: number;
    /** Texts of the time columns and of the popover. */
    timeLabels?: Partial<TimeLabels>;

    /** The time (controlled); `null` for none. */
    time?: D | null;
    /** The time at first (uncontrolled, default none). */
    defaultTime?: D | null;
    /** The user picked or typed a time (Angular's model and form value); `null` for an empty field. */
    onTimeChange?: (time: D | null) => void;
    /** Whether the time columns are open (controlled). */
    open?: boolean;
    /** Whether the time columns are open at first (uncontrolled). */
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** The focus left the time picker (Angular's form touched state). */
    onTouched?: () => void;
    /** The typed text became readable or unreadable (Angular's validator). */
    onInvalidChange?: (invalid: boolean) => void;
    /** Props of the input (fundamental-react's `inputProps`). */
    inputProps?: Omit<InputGroupInputProps, 'value' | 'defaultValue'>;
    /** Props of the button (fundamental-react's `buttonProps`). */
    buttonProps?: Omit<ButtonProps, 'disabled'>;
    /** Props of the popover body (fundamental-react's `popoverProps`). */
    popoverProps?: Omit<PopoverBodyProps, 'children' | 'initialFocus' | 'finalFocus'>;
    /** Further props of the time columns (fundamental-react's `timeProps`). */
    timeProps?: Omit<TimeProps<D>, 'time' | 'defaultTime' | 'onTimeChange' | 'id' | 'actionsRef'>;
    /** `setOpen`, `parse` and `isInvalid` from code. */
    actionsRef?: Ref<TimePickerActions>;
}

const NO_TRIGGERS: readonly string[] = [];
const MESSAGE_TRIGGERS: readonly string[] = ['focusin', 'focusout'];

/** Controlled or uncontrolled state, as Base UI's: `undefined` means uncontrolled. */
function useControlled<T>(value: T | undefined, defaultValue: T): [T, (next: T) => void] {
    const [own, setOwn] = useState<T>(defaultValue);
    const controlled = value !== undefined;
    return [controlled ? value : own, (next: T) => !controlled && setOwn(next)];
}

/**
 * Time picker: a time field with a button that opens the time columns in a popover. Typed times are read on Enter
 * and when the field loses the focus; a time that cannot be read sets the error state. The columns follow the
 * display format (12-hour clock, seconds) unless set. Alt+Down opens the columns and focuses the active one; Escape
 * closes them and returns to the field. Dates go through the `DatetimeAdapter` of `useDatetimeAdapter()` (by
 * default `FdDate`) and the formats of `useDateTimeFormats()`.
 *
 * Native props, `className` and `ref` go to the root; `aria-label`, `aria-labelledby` and `aria-describedby` go to
 * the input.
 *
 * ```tsx
 * <TimePicker time={time} onTimeChange={setTime} />
 * <TimePicker defaultTime={time} displaySeconds={false} message="Pick a time" messageType="information" />
 * ```
 */
export function TimePicker<D = FdDate>({
    children,
    id: idProp,
    inputId,
    placeholder,
    disabled = false,
    required = false,
    spinnerButtons = true,
    meridian,
    displayHours,
    displayMinutes,
    displaySeconds,
    timePickerInputLabel = 'Time picker input',
    timePickerButtonLabel = 'Open picker',
    allowNull = true,
    tablet = false,
    message,
    messageType = 'default',
    messageTriggers = MESSAGE_TRIGGERS,
    placement = 'bottom-start',
    useValidation = true,
    state,
    buttonFocusable = true,
    keepTwoDigitsTime = false,
    displayFormat: displayFormatProp,
    parseFormat: parseFormatProp,
    minuteStep = 1,
    timeLabels,
    time: timeProp,
    defaultTime = null,
    onTimeChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onTouched,
    onInvalidChange,
    inputProps,
    buttonProps,
    popoverProps,
    timeProps,
    actionsRef,
    ref,
    className,
    onBlur,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
}: TimePickerProps<D>) {
    const a = useDatetimeAdapter<D>();
    const formats = useDateTimeFormats<unknown>();
    const autoId = useId();
    const id = idProp ?? `fd-time-picker${autoId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    const rootRef = useRef<HTMLDivElement | null>(null);
    const groupRef = useRef<HTMLDivElement | null>(null);
    const fieldRef = useRef<HTMLInputElement | null>(null);
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const timeActions = useRef<TimeActions | null>(null);
    const labels = { componentAriaName: 'Time picker', ...timeLabels };

    const displayFormat = displayFormatProp ?? formats.display.timeInput;
    const parseFormat = parseFormatProp ?? formats.parse.timeInput;
    const format = (value: D | null | undefined) =>
        value == null || !a.isValid(value) ? '' : a.format(value, displayFormat);

    const [time, setTimeState] = useControlled<D | null>(timeProp, defaultTime);
    const [open, setOpenState] = useControlled(openProp, defaultOpen);
    const openRef = useRef(open);
    openRef.current = open;
    const [messageShown, setMessageShown] = useState(false);

    /** Whether a time is invalid as a form value (Angular's `writeValue`). */
    const invalidValue = (value: D | null | undefined) => (value == null ? !allowNull : !a.isValid(value));
    const [invalid, setInvalid] = useState(() => invalidValue(time));
    /** The last time the picker set itself: other changes are written from outside and validated as such. */
    const committed = useRef<D | null | undefined>(time);
    const [seenTime, setSeenTime] = useState(time);
    if (seenTime !== time) {
        setSeenTime(time);
        if (time !== committed.current) {
            committed.current = time;
            setInvalid(invalidValue(time));
        }
    }

    /**
     * The text of the field: the formatted time, or what was typed (Angular's linked signal). It follows the time,
     * the locale and the display format; an unreadable time keeps what was typed.
     */
    const formatted = format(time);
    const [textState, setTextState] = useState({ time, formatted, text: formatted });
    let text = textState.text;
    if (textState.time !== time || textState.formatted !== formatted) {
        text = time != null && !a.isValid(time) ? textState.text : formatted;
        setTextState({ time, formatted, text });
    }

    const reportedInvalid = useRef(invalid);
    useEffect(() => {
        if (reportedInvalid.current === invalid) return;
        reportedInvalid.current = invalid;
        onInvalidChange?.(invalid);
    }, [invalid, onInvalidChange]);

    const showMeridian = meridian ?? a.isTimeFormatIncludesDayPeriod(displayFormat);
    const showHours = displayHours ?? a.isTimeFormatIncludesHours(displayFormat);
    const showMinutes = displayMinutes ?? a.isTimeFormatIncludesMinutes(displayFormat);
    const showSeconds = displaySeconds ?? a.isTimeFormatIncludesSeconds(displayFormat);
    const defaultPlaceholder =
        [showHours && 'hh', showMinutes && 'mm', showSeconds && 'ss'].filter(Boolean).join(':') +
        (showMeridian ? ' am/pm' : '');

    /** The time shown in the columns: now when none is set (taken when the columns open). */
    const shownTime = useMemo(() => (time != null && a.isValid(time) ? time : a.now()), [a, time, open]);

    const computedState: TimePickerState = state == null && useValidation && invalid ? 'error' : (state ?? 'default');

    const commit = (next: D | null, typed?: string) => {
        committed.current = next;
        setTimeState(next);
        const nextFormatted = format(next);
        setTextState({
            time: next,
            formatted: nextFormatted,
            text: next === null || a.isValid(next) ? nextFormatted : (typed ?? '')
        });
        onTimeChange?.(next);
    };

    const parse = (raw: string) => {
        const value = raw.trim();
        if (value === format(time) && !invalid) return;
        if (!value) {
            setInvalid(!allowNull);
            commit(null);
            return;
        }
        // drop "in the morning" style periods written by dayPeriod formats
        const parsed = a.parse(
            value.replace(/\b(at night|in the morning|in the afternoon|in the evening)\b/g, '').trim(),
            parseFormat
        );
        setInvalid(!a.isValid(parsed));
        commit(parsed, value);
    };

    /** A time picked in the columns. */
    const pick = (next: D) => {
        if (a.dateTimesEqual(next, time)) return;
        setInvalid(false);
        commit(next);
    };

    const setOpen = (next: boolean) => {
        if (next && disabled) return;
        if (next === openRef.current) return;
        openRef.current = next;
        setOpenState(next);
        setMessageShown(false);
        onOpenChange?.(next);
    };

    useImperativeHandle(actionsRef, () => ({ setOpen, parse, isInvalid: () => invalid }));

    // a picker disabled while open closes
    useEffect(() => {
        if (disabled && openRef.current) setOpen(false);
    }, [disabled]);

    /** Inside the picker: the root (field and button) or the open columns. */
    const inside = (node: unknown) =>
        node instanceof Node && (!!rootRef.current?.contains(node) || !!bodyRef.current?.contains(node));

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
        onBlur?.(event);
        if (!inside(event.relatedTarget)) onTouched?.();
    };

    const { onKeyDown: inputKeyDown, onBlur: inputBlur, onChange: inputChange, ...restInputProps } = inputProps ?? {};
    const handleKeyDown = (event: Parameters<NonNullable<InputGroupInputProps['onKeyDown']>>[0]) => {
        inputKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === 'Enter') parse(event.currentTarget.value);
        else if (event.key === 'ArrowDown' && event.altKey) {
            event.preventDefault();
            setOpen(true);
        }
    };

    return (
        <Popover
            open={open}
            onOpenChange={(next, details) => {
                // presses in the field and the focus moving to it keep the columns open (Angular's popover control)
                if (!next && (details.reason === 'outside-press' || details.reason === 'focus-out')) {
                    const event = details.event as Event | undefined;
                    const target =
                        details.reason === 'focus-out'
                            ? (event as globalThis.FocusEvent)?.relatedTarget
                            : event?.target;
                    if (target instanceof Node && rootRef.current?.contains(target)) {
                        details.cancel();
                        return;
                    }
                }
                setOpen(next);
            }}
            placement={placement}
            anchor={groupRef}
            disabled={disabled}
            closeOnEscapeKey
            focusTrapped
        >
            <div
                {...props}
                id={id}
                ref={(node) => {
                    rootRef.current = node;
                    if (typeof ref === 'function') return ref(node);
                    if (ref) ref.current = node;
                }}
                className={cn('inline-block', className)}
                onBlur={handleBlur}
            >
                <FormInputMessageGroup
                    open={messageShown}
                    onOpenChange={(next) => setMessageShown(next && !openRef.current)}
                    triggers={message ? messageTriggers : NO_TRIGGERS}
                >
                    <InputGroup ref={groupRef} state={computedState} disabled={disabled} showFocus>
                        <InputGroupInput
                            type="text"
                            autoComplete="off"
                            {...restInputProps}
                            ref={(node: HTMLInputElement | null) => {
                                fieldRef.current = node;
                                const ref = restInputProps.ref;
                                if (typeof ref === 'function') return ref(node);
                                if (ref) ref.current = node;
                            }}
                            id={inputId || `${id}-input`}
                            value={text}
                            disabled={disabled}
                            placeholder={placeholder || defaultPlaceholder}
                            aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? timePickerInputLabel)}
                            aria-labelledby={ariaLabelledBy}
                            aria-describedby={ariaDescribedBy}
                            aria-required={required || undefined}
                            aria-invalid={computedState === 'error' || undefined}
                            onChange={(event) => {
                                inputChange?.(event);
                                const value = event.currentTarget.value;
                                setTextState((s) => ({ ...s, text: value }));
                            }}
                            onKeyDown={handleKeyDown}
                            onBlur={(event) => {
                                inputBlur?.(event);
                                parse(event.currentTarget.value);
                            }}
                        />
                        <InputGroupAddon button>
                            <PopoverTrigger
                                render={
                                    <Button
                                        variant="transparent"
                                        glyph="time-entry-request"
                                        aria-label={timePickerButtonLabel}
                                        title={timePickerButtonLabel}
                                        tabIndex={buttonFocusable ? undefined : -1}
                                        {...buttonProps}
                                        className={cn(
                                            open && 'text-(--igBtnFocusColor,var(--sapButton_Selected_TextColor))',
                                            buttonProps?.className
                                        )}
                                    />
                                }
                            />
                        </InputGroupAddon>
                    </InputGroup>
                    {message ? <FormMessage type={messageType}>{message}</FormMessage> : null}
                </FormInputMessageGroup>
            </div>
            <PopoverBody
                aria-label={labels.componentAriaName}
                {...popoverProps}
                ref={(node: HTMLDivElement | null) => {
                    bodyRef.current = node;
                    const bodyRefProp = popoverProps?.ref;
                    if (typeof bodyRefProp === 'function') return bodyRefProp(node);
                    if (bodyRefProp) bodyRefProp.current = node;
                }}
                // the active column takes the focus (Angular's focusActiveColumn after opening)
                initialFocus={() => {
                    timeActions.current?.focusActiveColumn();
                    return false;
                }}
                // back to the field, unless the focus moved on to something else (e.g. a press outside)
                finalFocus={() => {
                    const active = document.activeElement;
                    return !active || active === document.body || inside(active) ? (fieldRef.current ?? false) : false;
                }}
            >
                {message ? (
                    <FormMessage type={messageType} embedded>
                        {message}
                    </FormMessage>
                ) : null}
                {children}
                <Time<D>
                    {...timeProps}
                    id={`${id}-time`}
                    time={shownTime}
                    meridian={showMeridian}
                    displayHours={showHours}
                    displayMinutes={showMinutes}
                    displaySeconds={showSeconds}
                    keepTwoDigits={keepTwoDigitsTime}
                    spinnerButtons={spinnerButtons}
                    minuteStep={minuteStep}
                    tablet={tablet}
                    disabled={disabled}
                    labels={labels}
                    actionsRef={timeActions}
                    onTimeChange={pick}
                />
            </PopoverBody>
        </Popover>
    );
}
