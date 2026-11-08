/*
 * Port of @fundamental-ngx/core (slider) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { DirectionProvider, useDirection } from '@base-ui/react/direction-provider';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type CSSProperties,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent as ReactPointerEvent
} from 'react';
import { cn } from '@/lib/utils';

/** A named value of a slider with custom values. */
export interface SliderCustomValue {
    value: number | string;
    label: string;
}

export type SliderValue = number | number[] | SliderCustomValue | SliderCustomValue[] | null | undefined;

interface TickMark {
    index: number;
    position: number;
    label: string;
}

/** Ticks closer than this (px) collapse to the two ends. */
const MIN_DISTANCE_BETWEEN_TICKS = 8;

/** The arrows icon of the handles (SAP icon font). */
const HANDLE_ICON = '';

/** Stops a touch from reaching Base UI's control, which would start a press on the track. */
const stopTouch = (event: TouchEvent) => event.stopPropagation();

export interface SliderProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange' | 'children'> {
    /** A number, two numbers for a range, or custom values (controlled). */
    value?: SliderValue;
    /** Initial value (uncontrolled). */
    defaultValue?: SliderValue;
    /** Called with the new value (sorted for a range; the custom value items with `customValues`). */
    onValueChange?: (value: SliderValue) => void;
    mode?: 'single' | 'range';
    min?: number;
    max?: number;
    step?: number;
    /** Step of Shift+arrows and Page Up/Down. */
    jump?: number;
    /** Named values instead of numbers; the value is then the chosen item(s). */
    customValues?: SliderCustomValue[];
    showTicks?: boolean;
    showTicksLabels?: boolean;
    /** Labels every n-th tick (and the first and last). */
    tickmarksBetweenLabels?: number;
    hideProgressBar?: boolean;
    /** Shows the value above the handles while the slider is hovered or focused, or an input to type it. */
    tooltipMode?: 'readonly' | 'editable' | null;
    vertical?: boolean;
    /** Larger handles for touch. */
    cozy?: boolean;
    disabled?: boolean;
    /** Name of the field when a form is submitted (Base UI's hidden range inputs; indexes for custom values). */
    name?: string;
    /** Name of the range between the handles; `{min}` and `{max}` are replaced. */
    rangeAriaLabel?: string;
}

/**
 * SAP Fiori slider, on Base UI's Slider: picks a number, a range of two numbers or one of a list of custom values
 * by dragging a handle, pressing the track or with the keyboard (arrows by `step`, Shift+arrows and Page Up/Down by
 * `jump`, Home and End). A range slider also moves both handles together from the range between them. Ticks,
 * labels, a vertical layout and read-only or editable value tooltips are optional.
 *
 * ```tsx
 * <Slider aria-label="Volume" value={volume} onValueChange={setVolume} />
 * <Slider mode="range" aria-label="Price" showTicks showTicksLabels step={10} defaultValue={[20, 60]} />
 * ```
 */
export function Slider({
    value: valueProp,
    defaultValue,
    onValueChange,
    mode = 'single',
    min: minProp = 0,
    max: maxProp = 100,
    step: stepProp = 1,
    jump = 10,
    customValues = [],
    showTicks = false,
    showTicksLabels = false,
    tickmarksBetweenLabels = 1,
    hideProgressBar = false,
    tooltipMode,
    vertical = false,
    cozy = false,
    disabled = false,
    name,
    rangeAriaLabel = 'Range from {min} to {max}',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-valuetext': ariaValueText,
    className,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...props
}: SliderProps) {
    const [uncontrolled, setUncontrolled] = useState<SliderValue>(defaultValue ?? null);
    const value = valueProp !== undefined ? valueProp : uncontrolled;
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [trackSize, setTrackSize] = useState(0);
    const [announcement, setAnnouncement] = useState('');
    const controlRef = useRef<HTMLDivElement>(null);
    const groupRef = useRef<HTMLDivElement>(null);

    // Base UI reads the direction from its DirectionProvider; the CSS direction of the slider wins, as Angular's
    // Directionality, so a `dir` attribute alone mirrors the keys and the pointer too
    const contextDir = useDirection();
    const [dir, setDir] = useState(contextDir);
    const rtl = dir === 'rtl' && !vertical;

    const isRange = mode === 'range';
    const isCustom = customValues.length > 0;
    const domain = isCustom
        ? { min: 0, max: customValues.length - 1, step: 1 }
        : { min: minProp, max: Math.max(maxProp, minProp), step: stepProp > 0 ? stepProp : 1 };

    /** Clamps and rounds to the nearest step. */
    const snap = (v: number) => {
        const clamped = Math.min(domain.max, Math.max(domain.min, v));
        return Number((domain.min + Math.round((clamped - domain.min) / domain.step) * domain.step).toFixed(6));
    };
    const toNumber = (v: number | SliderCustomValue): number => {
        if (isCustom) {
            const key = typeof v === 'object' ? v.value : v;
            const index = customValues.findIndex((item) => item.value === key);
            return index >= 0 ? index : 0;
        }
        return typeof v === 'number' ? v : Number(v) || domain.min;
    };
    const percent = (v: number) =>
        domain.max === domain.min ? 0 : ((v - domain.min) / (domain.max - domain.min)) * 100;
    /** The label of a numeric value (the custom value label or the number). */
    const labelOf = (v: number) => (isCustom ? (customValues[v]?.label ?? '') : `${v}`);

    /** Numeric values of the handles (indexes for custom values), sorted for a range. */
    let handleValues: number[];
    if (isRange) {
        const pair = Array.isArray(value) ? value : [];
        const a = pair[0] == null ? domain.min : snap(toNumber(pair[0]));
        const b = pair[1] == null ? domain.max : snap(toNumber(pair[1]));
        handleValues = [Math.min(a, b), Math.max(a, b)];
    } else {
        const single = Array.isArray(value) ? value[0] : value;
        handleValues = [single == null ? domain.min : snap(toNumber(single))];
    }
    const rangeLabelOf = ([a, b]: number[]) => rangeAriaLabel.replace('{min}', labelOf(a)).replace('{max}', labelOf(b));

    useLayoutEffect(() => {
        const control = controlRef.current;
        if (control) setDir(getComputedStyle(control).direction === 'rtl' ? 'rtl' : 'ltr');
    }, [contextDir]);

    useEffect(() => {
        const control = controlRef.current;
        if (!control) return;
        const observer = new ResizeObserver(() => {
            const rect = control.getBoundingClientRect();
            setTrackSize(vertical ? rect.height : rect.width);
        });
        observer.observe(control);
        return () => observer.disconnect();
    }, [vertical]);

    // touches on the range and the tooltips must not reach Base UI's control (a press on the track)
    useEffect(() => {
        const elements = [
            groupRef.current,
            ...(controlRef.current?.querySelectorAll('[data-slot=slider-tooltip]') ?? [])
        ];
        for (const el of elements) el?.addEventListener('touchstart', stopTouch as EventListener, { passive: true });
        return () => {
            for (const el of elements) el?.removeEventListener('touchstart', stopTouch as EventListener);
        };
    });

    const setValues = (values: number[]) => {
        const next = isRange ? [...values].sort((a, b) => a - b) : values.slice(0, 1);
        if (next.every((v, i) => v === handleValues[i])) return;
        const toValue = (v: number) => (isCustom ? customValues[v] : v);
        const result = (isRange ? next.map(toValue) : toValue(next[0])) as SliderValue;
        if (valueProp === undefined) setUncontrolled(result);
        onValueChange?.(result);
        if (isRange) setAnnouncement(rangeLabelOf(next));
    };

    const thumbInput = (index: number) =>
        controlRef.current?.querySelector<HTMLInputElement>(`[data-slot=slider-handle][data-index="${index}"] input`);

    /** Angular's keyboard handling, for one handle or (`indexes` [0, 1]) the whole range. */
    const onKeyDown = (event: KeyboardEvent<HTMLElement>, indexes: number[]) => {
        if (disabled) return;
        const { min, max, step } = domain;
        const big = isCustom ? step : Math.max(jump, step);
        const up = rtl ? 'ArrowLeft' : 'ArrowRight';
        const down = rtl ? 'ArrowRight' : 'ArrowLeft';
        let delta: number | null = null;
        let target: number | null = null;
        switch (event.key) {
            case 'ArrowUp':
            case up:
                delta = event.shiftKey ? big : step;
                break;
            case 'ArrowDown':
            case down:
                delta = -(event.shiftKey ? big : step);
                break;
            case 'PageUp':
                delta = big;
                break;
            case 'PageDown':
                delta = -big;
                break;
            case 'Home':
                target = min;
                break;
            case 'End':
                target = max;
                break;
            default:
                return;
        }
        // Base UI's own key handling (which keeps a range handle from passing the other) skips prevented events
        event.preventDefault();
        event.stopPropagation();
        const values = [...handleValues];
        if (indexes.length === 2) {
            // moving the range keeps its size and stops at the ends
            const [lo, hi] = values;
            let shift = target !== null ? (target === min ? min - lo : max - hi) : delta!;
            shift = Math.max(min - lo, Math.min(max - hi, shift));
            if (shift) setValues(values.map((v) => snap(v + shift)));
            return;
        }
        const index = indexes[0];
        const moved = snap(target ?? values[index] + delta!);
        values[index] = moved;
        setValues(values);
        // a range handle may pass the other one: the values stay sorted and the focus follows the moved value
        if (isRange) {
            const other = values[1 - index];
            const next = moved > other ? 1 : moved < other ? 0 : index;
            if (next !== index) thumbInput(next)?.focus();
        }
    };

    /** The value under a pointer. */
    const valueAt = (event: { clientX: number; clientY: number }) => {
        const rect = controlRef.current!.getBoundingClientRect();
        let ratio = vertical
            ? (rect.bottom - event.clientY) / (rect.height || 1)
            : (event.clientX - rect.left) / (rect.width || 1);
        if (rtl) ratio = 1 - ratio;
        return snap(domain.min + ratio * (domain.max - domain.min));
    };

    /** Dragging the range between the handles moves both (Base UI's control never sees the press). */
    const onRangePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (disabled || event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const target = event.currentTarget;
        target.focus();
        const start = valueAt(event);
        const [lo, hi] = handleValues;
        const { min, max } = domain;
        try {
            target.setPointerCapture(event.pointerId);
        } catch {
            // not an active pointer (e.g. a synthetic event); moves still arrive while over the target
        }
        const onMove = (e: PointerEvent) => {
            const shift = Math.max(min - lo, Math.min(max - hi, valueAt(e) - start));
            setValuesRef.current([snap(lo + shift), snap(hi + shift)]);
        };
        const onUp = () => {
            target.removeEventListener('pointermove', onMove);
            target.removeEventListener('pointerup', onUp);
            target.removeEventListener('pointercancel', onUp);
        };
        target.addEventListener('pointermove', onMove);
        target.addEventListener('pointerup', onUp);
        target.addEventListener('pointercancel', onUp);
    };
    // the drag listeners outlive the render that started them
    const setValuesRef = useRef(setValues);
    setValuesRef.current = setValues;

    const onTooltipInput = (input: HTMLInputElement, index: number) => {
        const number = parseFloat(input.value.replace(',', '.'));
        if (isNaN(number)) {
            input.value = `${handleValues[index]}`;
            return;
        }
        const values = [...handleValues];
        values[index] = snap(number);
        setValues(values);
        input.value = `${values[index]}`;
    };

    const positionStyle = (position: number): CSSProperties =>
        vertical ? { bottom: `${position}%` } : { insetInlineStart: `${position}%` };

    const tickMarks: TickMark[] = (() => {
        if (!showTicks) return [];
        const { min, max, step } = domain;
        const count = Math.round((max - min) / step) + 1;
        if (!isCustom && trackSize && count > Math.floor(trackSize / MIN_DISTANCE_BETWEEN_TICKS)) {
            return [
                { index: 0, position: 0, label: labelOf(min) },
                { index: 1, position: 100, label: labelOf(max) }
            ];
        }
        return Array.from({ length: count }, (_, index) => {
            const v = min + index * step;
            return { index, position: percent(v), label: labelOf(v) };
        });
    })();
    const tickInRange = (tick: TickMark) => {
        if (hideProgressBar) return false;
        const v = domain.min + tick.index * domain.step;
        return isRange ? v >= handleValues[0] && v <= handleValues[1] : v <= handleValues[0];
    };

    const tooltipShown = !!tooltipMode && (hovered || focused);

    const startDot = isRange
        ? 'before:border-sap-content-measure-indicator-color before:bg-sap-content-measure-indicator-color'
        : 'before:border-sap-content-selected-measure-indicator-color before:bg-sap-slider-selected-background';

    return (
        <DirectionProvider direction={dir}>
            <BaseSlider.Root
                data-slot="slider"
                {...props}
                value={isRange ? handleValues : handleValues[0]}
                onValueChange={(next) => setValues((Array.isArray(next) ? [...next] : [next]).map(snap))}
                min={domain.min}
                max={domain.max}
                step={domain.step}
                largeStep={isCustom ? 1 : Math.max(jump, domain.step)}
                orientation={vertical ? 'vertical' : 'horizontal'}
                thumbCollisionBehavior="swap"
                disabled={disabled}
                name={name}
                className={cn(
                    'relative m-0 box-border block min-w-16 max-w-full py-4 font-sap-font-family touch-none select-none',
                    // handle and track sizes (Horizon); cozy has the larger touch handles
                    '[--sl-track:0.25rem] [--sl-tick:0.5rem] [--sl-hw:1.5rem] [--sl-hh:1.25rem] [--sl-aw:2.25rem] [--sl-ah:2rem]',
                    cozy && '[--sl-hw:2rem] [--sl-hh:1.5rem] [--sl-aw:2.75rem] [--sl-ah:2.75rem]',
                    vertical
                        ? 'h-full min-w-0 px-4 py-[calc(var(--sl-hw)*0.5+0.125rem)]'
                        : 'px-[calc(var(--sl-hw)*0.5+0.125rem)]',
                    showTicks && showTicksLabels && !vertical && 'pb-8',
                    disabled && 'pointer-events-none cursor-not-allowed opacity-(--sapContent_DisabledOpacity)',
                    className
                )}
                onMouseEnter={(event: MouseEvent<HTMLDivElement>) => {
                    onMouseEnter?.(event);
                    setHovered(true);
                }}
                onMouseLeave={(event: MouseEvent<HTMLDivElement>) => {
                    onMouseLeave?.(event);
                    setHovered(false);
                }}
                onFocus={(event: FocusEvent<HTMLDivElement>) => {
                    onFocus?.(event);
                    setFocused(true);
                }}
                onBlur={(event: FocusEvent<HTMLDivElement>) => {
                    onBlur?.(event);
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
                }}
            >
                <BaseSlider.Control
                    ref={controlRef}
                    data-slot="slider-control"
                    className={cn(
                        'relative m-0 p-0',
                        "before:absolute before:box-border before:size-2 before:rounded-full before:border before:border-solid before:content-['']",
                        "after:absolute after:box-border after:size-2 after:rounded-full after:border after:border-solid after:content-['']",
                        startDot,
                        'after:border-sap-content-measure-indicator-color after:bg-sap-content-measure-indicator-color',
                        vertical
                            ? 'h-full w-(--sl-track) before:-bottom-[0.7rem] before:left-1/2 before:-translate-x-1/2 after:-top-[0.7rem] after:left-1/2 after:-translate-x-1/2'
                            : 'before:top-1/2 before:-start-[0.7rem] before:-translate-y-1/2 after:top-1/2 after:-end-[0.7rem] after:-translate-y-1/2'
                    )}
                >
                    {handleValues.map((handleValue, index) => (
                        <BaseSlider.Thumb
                            key={index}
                            index={index}
                            data-slot="slider-handle"
                            data-icon={HANDLE_ICON}
                            aria-label={ariaLabel ?? undefined}
                            aria-labelledby={ariaLabelledBy ?? undefined}
                            // undefined leaves the attribute out (Base UI's default names range handles "start/end range")
                            getAriaValueText={() =>
                                (ariaValueText || (isCustom ? labelOf(handleValue) : undefined)) as string
                            }
                            onKeyDown={(event) => onKeyDown(event, [index])}
                            // Base UI raises the active thumb with an inline z-index; the classes order the layers
                            style={{ zIndex: undefined }}
                            className={cn(
                                'z-[3] m-0 box-border flex cursor-pointer items-center justify-center p-0 outline-none',
                                'rounded-[0.5rem] border border-solid',
                                // a larger invisible touch target
                                "before:absolute before:top-1/2 before:left-1/2 before:h-(--sl-ah) before:w-(--sl-aw) before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
                                // the arrows icon of the handle
                                'after:font-sap-content-icon-font-family after:text-[0.875rem] after:leading-none after:text-sap-content-selected-foreground-color after:content-[attr(data-icon)]',
                                // Base UI positions the thumb (start or bottom, centred with `translate`)
                                vertical ? 'h-(--sl-hw) w-(--sl-hh) after:rotate-90' : 'h-(--sl-hh) w-(--sl-hw)',
                                isRange
                                    ? 'border-sap-slider-handle-border-color bg-sap-slider-range-handle-background hover:border-sap-slider-hover-handle-border-color hover:bg-sap-slider-hover-handle-background active:border-sap-content-focus-color active:bg-sap-slider-active-range-handle-background active:after:hidden'
                                    : 'border-sap-slider-handle-border-color bg-sap-slider-handle-background hover:border-sap-slider-hover-handle-border-color hover:bg-sap-slider-hover-handle-background active:border-sap-slider-active-handle-border-color active:bg-sap-slider-active-handle-background',
                                // the focus is on Base UI's visually hidden range input inside the thumb
                                'has-focus:z-[4] has-focus:border-(length:--sapContent_FocusWidth) has-focus:border-sap-content-focus-color has-focus:bg-sap-slider-active-range-handle-background has-focus:after:hidden'
                            )}
                        />
                    ))}
                    {tooltipShown &&
                        handleValues.map((handleValue, index) => (
                            <div
                                key={index}
                                data-slot="slider-tooltip"
                                style={positionStyle(percent(handleValue))}
                                onPointerDown={(event) => event.stopPropagation()}
                                className={cn(
                                    'absolute z-[5] box-border flex min-h-4 items-center rounded-[0.0625rem] bg-sap-background-color px-2 text-sap-font-small-size leading-4 whitespace-nowrap text-sap-text-color [box-shadow:var(--sapContent_Shadow1)]',
                                    'has-[input]:bg-transparent has-[input]:px-0 has-[input]:[box-shadow:none]',
                                    vertical
                                        ? 'left-[calc(100%+var(--sl-hh)/2+0.5rem)] translate-y-1/2'
                                        : 'bottom-[calc(var(--sl-hh)/2+0.5rem)] -translate-x-1/2 rtl:translate-x-1/2'
                                )}
                            >
                                {tooltipMode === 'editable' && !isCustom ? (
                                    <TooltipInput
                                        value={handleValue}
                                        disabled={disabled}
                                        aria-label={(ariaLabel || 'Value') + (isRange ? ` ${index + 1}` : '')}
                                        onCommit={(input) => onTooltipInput(input, index)}
                                    />
                                ) : (
                                    <span aria-hidden="true">{labelOf(handleValue)}</span>
                                )}
                            </div>
                        ))}
                    <BaseSlider.Track
                        data-slot="slider-track"
                        className={cn(
                            'relative z-[1] m-0 cursor-pointer rounded-[0.25rem] bg-sap-slider-background p-0 [box-shadow:inset_0_0_0_0_var(--sapSlider_BorderColor)] hc:[box-shadow:inset_0_0_0_0.0625rem_var(--sapSlider_BorderColor)]',
                            vertical ? 'h-full w-(--sl-track)' : 'h-(--sl-track) w-full'
                        )}
                    >
                        {!hideProgressBar && (
                            <BaseSlider.Indicator
                                data-slot="slider-range"
                                // Base UI makes a horizontal indicator `relative`; it is placed like the vertical one
                                style={{ position: 'absolute' }}
                                className={cn(
                                    'absolute box-border rounded-[0.25rem] border border-solid border-sap-slider-selected-border-color bg-sap-slider-selected-background',
                                    'hc:border-sap-slider-selected-background hc:[box-shadow:0_0_0_0.0625rem_var(--sapSlider_Selected_BorderColor)]',
                                    vertical ? 'left-0 w-full' : 'top-0 h-full'
                                )}
                            >
                                {isRange && (
                                    <div
                                        ref={groupRef}
                                        data-slot="slider-focus-range"
                                        role="group"
                                        tabIndex={disabled ? -1 : 0}
                                        aria-label={rangeLabelOf(handleValues)}
                                        onPointerDown={onRangePointerDown}
                                        onKeyDown={(event) => onKeyDown(event, [0, 1])}
                                        className={cn(
                                            'absolute m-0 cursor-grab rounded-[0.5rem] p-0 outline-none active:cursor-grabbing',
                                            'focus-visible:outline-(length:--sapContent_FocusWidth) focus-visible:[outline-style:var(--sapContent_FocusStyle)] focus-visible:outline-sap-content-focus-color',
                                            vertical
                                                ? 'inset-y-[calc(-1*var(--sl-hh)/1.1)] left-1/2 w-[calc(var(--sl-hh)+0.5rem)] -translate-x-1/2'
                                                : 'inset-x-[calc(-1*var(--sl-hh)/1.1)] top-1/2 h-[calc(var(--sl-hh)+0.5rem)] -translate-y-1/2'
                                        )}
                                    />
                                )}
                            </BaseSlider.Indicator>
                        )}
                    </BaseSlider.Track>
                    {showTicks && (
                        <div
                            data-slot="slider-tick-wrapper"
                            className={cn(
                                'absolute z-[2] m-0 p-0',
                                vertical
                                    ? 'inset-y-0 left-[calc((var(--sl-track)-var(--sl-tick))/2)] w-(--sl-tick)'
                                    : 'top-[calc((var(--sl-track)-var(--sl-tick))/2)] w-full'
                            )}
                        >
                            <div
                                data-slot="slider-ticks"
                                className={cn(
                                    'relative m-0 cursor-pointer p-0',
                                    vertical ? 'h-full w-(--sl-tick)' : 'h-(--sl-tick) w-full'
                                )}
                            >
                                {tickMarks.map((tick) => (
                                    <div
                                        key={tick.index}
                                        data-slot="slider-tick"
                                        data-in-range={tickInRange(tick) || undefined}
                                        style={positionStyle(tick.position)}
                                        className={cn(
                                            'absolute m-0 border-0 border-solid border-sap-content-measure-indicator-color p-0 data-[in-range]:border-sap-slider-selected-border-color',
                                            vertical
                                                ? 'left-0 h-0 w-(--sl-tick) border-t'
                                                : 'top-0 h-(--sl-tick) w-0 border-s'
                                        )}
                                    />
                                ))}
                            </div>
                            {showTicksLabels && (
                                <div
                                    data-slot="slider-labels"
                                    aria-hidden="true"
                                    className={cn(
                                        'absolute m-0 p-0',
                                        vertical
                                            ? 'inset-y-0 left-[calc(var(--sl-tick)+0.75rem)]'
                                            : 'top-[calc(var(--sl-tick)+0.5rem)] h-4 w-full'
                                    )}
                                >
                                    {tickMarks.map((tick, i) =>
                                        i === 0 || i === tickMarks.length - 1 || i % tickmarksBetweenLabels === 0 ? (
                                            <div
                                                key={tick.index}
                                                data-slot="slider-label"
                                                style={positionStyle(tick.position)}
                                                className={cn(
                                                    'absolute m-0 p-0 text-sap-font-small-size leading-4 whitespace-nowrap text-sap-content-label-color',
                                                    // horizontal: centred on the tick by a zero-width box, as fundamental-styles
                                                    vertical ? 'translate-y-1/2' : 'flex w-0 justify-center'
                                                )}
                                            >
                                                {tick.label}
                                            </div>
                                        ) : null
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </BaseSlider.Control>
                {isRange && (
                    <span className="sr-only-sap" role="status" aria-live="polite">
                        {announcement}
                    </span>
                )}
            </BaseSlider.Root>
        </DirectionProvider>
    );
}

/** The input of an editable tooltip: shows the handle value and applies typed text on Enter and blur. */
function TooltipInput({
    value,
    disabled,
    onCommit,
    'aria-label': ariaLabel
}: {
    value: number;
    disabled: boolean;
    onCommit: (input: HTMLInputElement) => void;
    'aria-label': string;
}) {
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.value = `${value}`;
    }, [value]);
    return (
        <input
            ref={ref}
            type="text"
            inputMode="decimal"
            defaultValue={`${value}`}
            disabled={disabled}
            aria-label={ariaLabel}
            style={{ width: `${`${value}`.length + 2}ch` }}
            onKeyDown={(event) => {
                if (event.key === 'Enter') onCommit(event.currentTarget);
            }}
            onBlur={(event) => onCommit(event.currentTarget)}
            className={cn(
                'm-0 box-border h-sap-element-compact-height min-w-8 rounded-sap-field-border-corner-radius px-1 text-center',
                'border-width-sap-field-border-width border-solid border-sap-field-border-color bg-sap-field-background font-sap-font-family text-sap-font-size text-sap-field-text-color',
                'outline-none focus:outline-sap focus:outline-offset-[-0.125rem]'
            )}
        />
    );
}
