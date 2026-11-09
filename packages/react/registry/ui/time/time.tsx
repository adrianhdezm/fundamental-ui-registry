/*
 * Port of fundamental-react (Time) and @fundamental-ngx/core (time) with the visual design of fundamental-styles,
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
    type CSSProperties,
    type FocusEvent,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
    type Ref,
    type RefCallback
} from 'react';
import { useDatetimeAdapter, type FdDate } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';

export type FdTimeActiveView = 'hour' | 'minute' | 'second' | 'meridian';
export type Meridian = 'AM' | 'PM';

/** A value of a time column and its label. */
export interface SelectableViewItem<T> {
    value: T;
    label: string;
}

/** Texts of a time column. */
export interface TimeColumnConfig {
    label: string;
    fullLabel: string;
    decreaseLabel: string;
    increaseLabel: string;
    navigationInstruction: string;
}

/** Texts of the time, in English by default. */
export interface TimeLabels {
    componentAriaName: string;
    hours: TimeColumnConfig;
    minutes: TimeColumnConfig;
    seconds: TimeColumnConfig;
    period: TimeColumnConfig;
}

const NAVIGATION =
    'To move between items in this list, press top arrow or bottom arrow. To switch between lists press left arrow or right arrow.';

export const TIME_LABELS: TimeLabels = {
    componentAriaName: 'Time picker',
    hours: {
        label: 'Hrs',
        fullLabel: 'Hours',
        decreaseLabel: 'Decrease hours',
        increaseLabel: 'Increase hours',
        navigationInstruction: NAVIGATION
    },
    minutes: {
        label: 'Min',
        fullLabel: 'Minutes',
        decreaseLabel: 'Decrease minutes',
        increaseLabel: 'Increase minutes',
        navigationInstruction: NAVIGATION
    },
    seconds: {
        label: 'Sec',
        fullLabel: 'Seconds',
        decreaseLabel: 'Decrease seconds',
        increaseLabel: 'Increase seconds',
        navigationInstruction: NAVIGATION
    },
    period: {
        label: 'Period',
        fullLabel: 'Period',
        decreaseLabel: 'Decrease period',
        increaseLabel: 'Increase period',
        navigationInstruction: NAVIGATION
    }
};

const ITEM =
    'm-0 box-border flex h-(--time-item-h) min-h-(--time-item-h) w-12 shrink-0 items-center justify-center rounded-(--sapButton_BorderCornerRadius) border border-solid p-0';

const LABEL =
    'm-0 block h-8 cursor-text overflow-hidden p-0 text-sap-font-small-size leading-8 whitespace-nowrap text-sap-content-label-color';

const COLLAPSED =
    'cursor-default border-transparent bg-sap-content-selected-background text-sap-content-selected-text-color hover:bg-sap-content-selected-hover-background group-focus-visible/col:outline-(length:--sapContent_FocusWidth) group-focus-visible/col:[outline-style:var(--sapContent_FocusStyle)] group-focus-visible/col:-outline-offset-[0.1875rem] group-focus-visible/col:outline-sap-content-focus-color';

const ITEM_REST =
    'cursor-default border-sap-list-background bg-sap-legend-working-background hover:bg-sap-list-hover-background active:border-transparent active:bg-sap-content-selected-background active:text-sap-content-selected-text-color';

/** The selected value; the column's focus shows on it. */
const ITEM_CURRENT =
    'cursor-default border-sap-list-selection-border-color bg-sap-legend-working-background hover:bg-sap-list-hover-background group-focus-visible/col:outline-(length:--sapContent_FocusWidth) group-focus-visible/col:[outline-style:var(--sapContent_FocusStyle)] group-focus-visible/col:-outline-offset-[0.1875rem] group-focus-visible/col:outline-sap-content-focus-color';

function mergeRefs<E>(...refs: (Ref<E> | undefined)[]): RefCallback<E> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
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

/** What a time column can be asked to do from code, see `actionsRef`. */
export interface TimeColumnActions {
    /** Focuses the spinbutton. */
    focus(): void;
    /** Selects the value a number of steps away. */
    step(steps: number): void;
}

export interface TimeColumnProps<T = unknown> extends Omit<ComponentProps<'div'>, 'children' | 'id'> {
    /** The id of the spinbutton; its label gets `<id>-label`. */
    id?: string;
    rows?: SelectableViewItem<T>[];
    activeValue?: SelectableViewItem<T> | null;
    /** The user picked a value. */
    onActiveValueChange?: (item: SelectableViewItem<T>) => void;
    /** The expanded column the keys act on. */
    active?: boolean;
    spinners?: boolean;
    /** Values shown while active; odd. */
    elementsAtOnce?: number;
    /** Wraps around from the last value to the first; off for short columns like the period. */
    loop?: boolean;
    disabled?: boolean;
    config?: TimeColumnConfig;
    /** The column wants to become active (focus or click). */
    onActivate?: () => void;
    /** `focus` and `step` from code. */
    actionsRef?: Ref<TimeColumnActions>;
}

/**
 * A column of a time: while active it shows a window of values around the selected one, which the arrow keys, the
 * mouse wheel, dragging, clicks, typing and the spinner buttons change; while inactive it shows only the selected
 * value. It is a spinbutton for assistive technology. Native props go to the column; `id` names the spinbutton.
 */
export function TimeColumn<T = unknown>({
    id: idProp,
    rows = [],
    activeValue,
    onActiveValueChange,
    active = false,
    spinners = true,
    elementsAtOnce = 7,
    loop = true,
    disabled = false,
    config = TIME_LABELS.hours,
    onActivate,
    actionsRef,
    className,
    ...props
}: TimeColumnProps<T>) {
    const autoId = useId();
    const id = idProp ?? `fd-time-column${autoId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    const indicatorRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const keys = useRef('');
    const keyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const dragged = useRef(false);
    /** The value, updated at once on changes so fast key presses go on from it (Angular's linked signal). */
    const current = useRef(activeValue);
    current.current = activeValue;

    useEffect(() => () => clearTimeout(keyTimer.current), []);

    const find = (value: SelectableViewItem<T> | null | undefined) =>
        value ? rows.findIndex((row) => row === value || row.value === value.value) : -1;
    const indexOf = (value: SelectableViewItem<T> | null | undefined) => Math.max(0, find(value));
    const index = indexOf(activeValue);
    const loops = loop && rows.length > elementsAtOnce;
    const currentItem = find(activeValue) >= 0 ? rows[index] : (activeValue ?? undefined);

    /** The values shown around the selected one; null where a short column has none. */
    const half = Math.floor(elementsAtOnce / 2);
    const shown = Array.from({ length: half * 2 + 1 }, (_, i) => {
        const at = index + i - half;
        if (loops) return rows[((at % rows.length) + rows.length) % rows.length];
        return rows[at] ?? null;
    });

    const focus = () => indicatorRef.current?.focus();

    const emit = (item: SelectableViewItem<T>, direction: number) => {
        current.current = item;
        onActiveValueChange?.(item);
        focus();
        // slide the values in from the side they came from
        listRef.current?.animate?.(
            [{ transform: `translateY(calc(var(--time-item-h) * ${direction}))` }, { transform: 'none' }],
            { duration: 150, easing: 'ease-out' }
        );
    };

    const step = (steps: number) => {
        if (!rows.length || disabled) return;
        const from = indexOf(current.current);
        let next = from + steps;
        if (loops) next = ((next % rows.length) + rows.length) % rows.length;
        else next = Math.max(0, Math.min(rows.length - 1, next));
        if (next === from) return;
        emit(rows[next], Math.sign(steps));
    };

    useImperativeHandle(actionsRef, () => ({ focus, step }));

    const pick = (item: SelectableViewItem<T>) => {
        if (dragged.current || disabled) return;
        let steps = rows.indexOf(item) - indexOf(current.current);
        if (loops && Math.abs(steps) > rows.length / 2) steps -= Math.sign(steps) * rows.length;
        emit(item, Math.sign(steps));
    };

    /** Typed digits pick the value: at once when no longer number can follow. */
    const typeDigit = (digit: string) => {
        clearTimeout(keyTimer.current);
        keys.current += digit;
        const typed = Number(keys.current);
        const last = Math.max(...rows.map((row) => Number(row.value)).filter((v) => !isNaN(v)));
        const done = typed * 10 > last || keys.current.length >= String(last).length;
        const apply = () => {
            const item = rows.find((row) => Number(row.value) === typed);
            if (item) emit(item, 0);
            keys.current = '';
        };
        if (done) apply();
        else keyTimer.current = setTimeout(apply, 500);
    };

    /** A letter picks the first value whose label starts with it, e.g. A and P for the period. */
    const typeLetter = (letter: string) => {
        const item = rows.find((row) => row.label.toLowerCase().startsWith(letter.toLowerCase()));
        if (item && indexOf(item) !== indexOf(current.current)) emit(item, 0);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const at = indexOf(current.current);
        if (event.key === 'ArrowDown') step(1);
        else if (event.key === 'ArrowUp') step(-1);
        else if (event.key === 'PageDown') step(elementsAtOnce);
        else if (event.key === 'PageUp') step(-elementsAtOnce);
        else if (event.key === 'Home') step(-at);
        else if (event.key === 'End') step(rows.length - 1 - at);
        else if (/^[0-9]$/.test(event.key)) typeDigit(event.key);
        else if (/^[a-z]$/i.test(event.key) && !event.ctrlKey && !event.metaKey) typeLetter(event.key);
        else return;
        event.preventDefault();
    };

    // React's wheel listeners are passive; the active column needs to keep the page from scrolling
    const onWheel = useRef<(event: WheelEvent) => void>(() => {});
    onWheel.current = (event: WheelEvent) => {
        if (!active) return;
        event.preventDefault();
        step(event.deltaY > 0 ? 1 : -1);
    };
    useEffect(() => {
        const element = indicatorRef.current;
        if (!element) return;
        const listener = (event: WheelEvent) => onWheel.current(event);
        element.addEventListener('wheel', listener, { passive: false });
        return () => element.removeEventListener('wheel', listener);
    }, []);

    /** Dragging moves one value per item height. */
    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!active || event.button !== 0) return;
        const element = event.currentTarget;
        const itemHeight = parseFloat(getComputedStyle(element).getPropertyValue('--time-item-h')) * 16 || 46;
        let last = event.clientY;
        dragged.current = false;
        const move = (e: PointerEvent) => {
            const steps = Math.trunc((last - e.clientY) / itemHeight);
            if (steps) {
                dragged.current = true;
                last -= steps * itemHeight;
                step(steps);
            }
        };
        const up = () => {
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', up);
            // a drag is no click on the value under the pointer
            setTimeout(() => (dragged.current = false));
        };
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
    };

    const style: CSSProperties | undefined = active
        ? { height: `calc(var(--time-item-h) * ${elementsAtOnce})` }
        : undefined;

    return (
        <div
            {...props}
            className={cn(
                'm-0 box-border flex flex-col items-center p-0 me-2 last:me-0',
                disabled && 'pointer-events-none',
                className
            )}
        >
            <span id={`${id}-label`} className={LABEL} aria-hidden="true">
                {config.label}
            </span>
            {active && spinners && (
                <Button
                    variant="transparent"
                    glyph="navigation-up-arrow"
                    tabIndex={-1}
                    aria-label={config.decreaseLabel}
                    title={config.decreaseLabel}
                    onClick={() => step(-1)}
                />
            )}
            <div
                ref={indicatorRef}
                role="spinbutton"
                tabIndex={0}
                id={id}
                aria-label={config.fullLabel}
                aria-valuenow={index}
                aria-valuemin={0}
                aria-valuemax={rows.length - 1}
                aria-valuetext={currentItem?.label}
                aria-description={config.navigationInstruction}
                aria-disabled={disabled || undefined}
                className={cn(
                    'group/col relative m-0 box-border flex w-12 flex-[1_1_auto] flex-col items-center justify-center overflow-hidden p-0 outline-none',
                    active && 'max-h-[calc(var(--time-item-h)*7)] justify-start',
                    // the labels stay readable; the disabled values dim
                    disabled && 'opacity-(--sapContent_DisabledOpacity)'
                )}
                style={style}
                onFocus={() => onActivate?.()}
                onKeyDown={onKeyDown}
                onPointerDown={onPointerDown}
            >
                {active ? (
                    <div ref={listRef} className="m-0 flex flex-col items-center p-0 touch-pan-x select-none">
                        {shown.map((item, i) =>
                            item ? (
                                <span
                                    key={i}
                                    aria-hidden="true"
                                    data-displayed-value={String(item.value)}
                                    className={cn(ITEM, item === currentItem ? ITEM_CURRENT : ITEM_REST)}
                                    onClick={() => pick(item)}
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <span key={i} aria-hidden="true" className={cn(ITEM, 'invisible')} />
                            )
                        )}
                    </div>
                ) : (
                    <span aria-hidden="true" className={cn(ITEM, COLLAPSED)} onClick={() => onActivate?.()}>
                        {currentItem?.label}
                    </span>
                )}
            </div>
            {active && spinners && (
                <Button
                    variant="transparent"
                    glyph="navigation-down-arrow"
                    tabIndex={-1}
                    aria-label={config.increaseLabel}
                    title={config.increaseLabel}
                    onClick={() => step(1)}
                />
            )}
        </div>
    );
}

/** What a time can be asked to do from code (Angular's public methods), see `actionsRef`. */
export interface TimeActions {
    /** Focuses the active column, e.g. when a time picker opens. */
    focusActiveColumn(): void;
}

export interface TimeProps<D = FdDate> extends Omit<ComponentProps<'div'>, 'children'> {
    /** A 12-hour clock with a period column. */
    meridian?: boolean;
    keepTwoDigits?: boolean;
    disabled?: boolean;
    displayHours?: boolean;
    displayMinutes?: boolean;
    displaySeconds?: boolean;
    /** Smaller paddings for tablets, and touch-sized values in compact density. */
    tablet?: boolean;
    /** Values shown in the active column; odd. */
    elementsAtOnce?: number;
    spinnerButtons?: boolean;
    minuteStep?: number;
    labels?: Partial<TimeLabels>;

    /** The time (controlled); its date part is kept. `null` or an invalid date shows today at 00:00:00. */
    time?: D | null;
    /** The time at first (uncontrolled, default today at 00:00:00). */
    defaultTime?: D | null;
    /** The user changed the time (Angular's model and form value). */
    onTimeChange?: (time: D) => void;
    /** The active column (controlled). */
    activeView?: FdTimeActiveView;
    /** The active column at first (uncontrolled, default `hour`). */
    defaultActiveView?: FdTimeActiveView;
    onActiveViewChange?: (view: FdTimeActiveView) => void;
    /** The focus left the time (Angular's form touched state); moving between the columns does not count. */
    onTouched?: () => void;
    /** `focusActiveColumn` from code. */
    actionsRef?: Ref<TimeActions>;
}

/**
 * Time: picks hours, minutes, seconds and the period in columns of values. Left and Right move between the columns
 * (mirrored in RTL); Up and Down, Page Up and Page Down, Home and End, the mouse wheel, dragging, typing digits (or A
 * and P) and the spinner buttons change the value of the active one. Dates go through the `DatetimeAdapter` of
 * `useDatetimeAdapter()` (by default `FdDate`).
 *
 * ```tsx
 * <Time time={time} onTimeChange={setTime} meridian displaySeconds={false} />
 * ```
 */
export function Time<D = FdDate>({
    id: idProp,
    meridian = false,
    keepTwoDigits = false,
    disabled = false,
    displayHours = true,
    displayMinutes = true,
    displaySeconds = true,
    tablet = false,
    elementsAtOnce = 7,
    spinnerButtons = true,
    minuteStep = 1,
    labels: labelsProp,
    time: timeProp,
    defaultTime,
    onTimeChange,
    activeView: activeViewProp,
    defaultActiveView = 'hour',
    onActiveViewChange,
    onTouched,
    actionsRef,
    ref,
    className,
    onKeyDown,
    onBlur,
    ...props
}: TimeProps<D>) {
    const a = useDatetimeAdapter<D>();
    const autoId = useId();
    const id = idProp ?? `fd-time${autoId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    const rootRef = useRef<HTMLDivElement>(null);
    const columnRefs = useRef<Partial<Record<FdTimeActiveView, TimeColumnActions | null>>>({});
    const labels = { ...TIME_LABELS, ...labelsProp };
    const locale = a.locale();

    const [timeState, setTimeState] = useControlled<D | null>(
        timeProp,
        () => (defaultTime === undefined ? a.today() : defaultTime),
        onTimeChange as ((time: D | null) => void) | undefined
    );
    const [activeView, setActiveViewState] = useControlled(activeViewProp, () => defaultActiveView, onActiveViewChange);
    /** The active view, updated at once: the focus that follows a change activates the same column. */
    const activeRef = useRef(activeView);
    activeRef.current = activeView;
    const setActiveView = (view: FdTimeActiveView) => {
        if (activeRef.current === view) return;
        activeRef.current = view;
        setActiveViewState(view);
    };
    const time = timeState && a.isValid(timeState) ? timeState : a.today();
    /** The time, updated at once so fast changes go on from it. */
    const latest = useRef(time);
    latest.current = time;
    const hour = a.getHours(time);
    const step = Math.max(1, minuteStep);

    const hourItems = useMemo(
        () => a.getHourNames({ meridian, twoDigit: keepTwoDigits }).map((label, value) => ({ value, label })),
        [a, locale, meridian, keepTwoDigits]
    );
    const minuteItems = useMemo(
        () =>
            a
                .getMinuteNames({ twoDigit: keepTwoDigits, minuteStep: step })
                .map((label, index) => ({ value: index * step, label })),
        [a, locale, keepTwoDigits, step]
    );
    const secondItems = useMemo(
        () => a.getSecondNames({ twoDigit: keepTwoDigits }).map((label, value) => ({ value, label })),
        [a, locale, keepTwoDigits]
    );
    const meridianItems = useMemo<SelectableViewItem<Meridian>[]>(() => {
        const [am, pm] = a.getDayPeriodNames();
        return [
            { value: 'AM', label: am },
            { value: 'PM', label: pm }
        ];
    }, [a, locale]);

    const activeHour = hourItems.find((item) => item.value === hour);
    const minute = Math.min(Math.round(a.getMinutes(time) / step) * step, 60 - step);
    const activeMinute = minuteItems.find((item) => item.value === minute);
    const activeSecond = secondItems.find((item) => item.value === a.getSeconds(time));
    const activeMeridian = meridianItems[hour >= 12 ? 1 : 0];

    const update = (next: D) => {
        latest.current = next;
        setTimeState(next);
    };
    const setHour = (value: number) => update(a.setHours(latest.current, value));
    const setMinute = (value: number) => update(a.setMinutes(latest.current, value));
    const setSecond = (value: number) => update(a.setSeconds(latest.current, value));
    /** Switches the period, keeping the hour on the clock. */
    const setMeridian = (value: Meridian) => {
        const current = a.getHours(latest.current);
        if ((value === 'PM') === current >= 12) return;
        setHour(value === 'PM' ? current + 12 : current - 12);
    };

    const visibleViews = (): FdTimeActiveView[] => {
        const views: [boolean, FdTimeActiveView][] = [
            [displayHours, 'hour'],
            [displayMinutes, 'minute'],
            [displaySeconds, 'second'],
            [meridian, 'meridian']
        ];
        return views.filter(([shown]) => shown).map(([, view]) => view);
    };

    const focusColumn = (view: FdTimeActiveView) => columnRefs.current[view]?.focus();

    useImperativeHandle(actionsRef, () => ({ focusActiveColumn: () => focusColumn(activeRef.current) }));

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
        event.preventDefault();
        const views = visibleViews();
        const rtl = rootRef.current ? getComputedStyle(rootRef.current).direction === 'rtl' : false;
        const forward = (event.key === 'ArrowRight') !== rtl;
        const index = views.indexOf(activeRef.current);
        const next = views[(index + (forward ? 1 : -1) + views.length) % views.length];
        setActiveView(next);
        focusColumn(next);
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
        onBlur?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onTouched?.();
    };

    const column = <T,>(
        view: FdTimeActiveView,
        suffix: string,
        rows: SelectableViewItem<T>[],
        value: SelectableViewItem<T> | undefined,
        config: TimeColumnConfig,
        onChange: (value: T) => void,
        loop = true
    ) => (
        <TimeColumn<T>
            key={view}
            id={`${id}-${suffix}`}
            rows={rows}
            activeValue={value}
            active={activeView === view}
            elementsAtOnce={elementsAtOnce}
            spinners={spinnerButtons}
            disabled={disabled}
            loop={loop}
            config={config}
            actionsRef={(actions) => {
                columnRefs.current[view] = actions;
            }}
            onActivate={() => setActiveView(view)}
            onActiveValueChange={(item) => onChange(item.value)}
        />
    );

    return (
        <div
            role="group"
            aria-label={labels.componentAriaName}
            {...props}
            id={id}
            ref={mergeRefs(rootRef, ref)}
            className={cn(
                'm-0 box-border flex justify-center p-4 font-sap-font-family text-sap-font-size text-sap-text-color',
                '[--time-item-h:2.875rem] compact:p-2 compact:[--time-item-h:2rem]',
                tablet && 'p-2 compact:[--time-item-h:2.875rem]',
                className
            )}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
        >
            {displayHours && column('hour', 'hours', hourItems, activeHour, labels.hours, setHour)}
            {displayMinutes && column('minute', 'minutes', minuteItems, activeMinute, labels.minutes, setMinute)}
            {displaySeconds && column('second', 'seconds', secondItems, activeSecond, labels.seconds, setSecond)}
            {meridian && column('meridian', 'period', meridianItems, activeMeridian, labels.period, setMeridian, false)}
        </div>
    );
}
