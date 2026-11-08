/*
 * Port of @fundamental-ngx/core (progress-indicator) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useCallback, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';
import { Icon } from '@/ui/icon/icon';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';

export type ProgressIndicatorState = 'informative' | 'positive' | 'critical' | 'negative';

/** Colours of the bar, the track and the icon, and the icon, per state. */
const STATES: Record<ProgressIndicatorState | 'neutral', { vars: string; glyph: string | null }> = {
    neutral: {
        vars: '[--pi-bar:var(--sapProgress_Value_Background)] [--pi-bar-border:var(--sapProgress_Value_BorderColor)] [--pi-track:var(--sapProgress_Background)] [--pi-track-border:var(--sapProgress_BorderColor)]',
        glyph: null
    },
    informative: {
        vars: '[--pi-bar:var(--sapProgress_Value_InformationBackground)] [--pi-bar-border:var(--sapProgress_Value_InformationBorderColor)] [--pi-track:var(--sapProgress_InformationBackground)] [--pi-track-border:var(--sapProgress_InformationBorderColor)] [--pi-icon:var(--sapProgress_Value_InformationTextColor)]',
        glyph: 'information'
    },
    positive: {
        vars: '[--pi-bar:var(--sapProgress_Value_PositiveBackground)] [--pi-bar-border:var(--sapProgress_Value_PositiveBorderColor)] [--pi-track:var(--sapProgress_PositiveBackground)] [--pi-track-border:var(--sapProgress_PositiveBorderColor)] [--pi-icon:var(--sapProgress_Value_PositiveTextColor)]',
        glyph: 'sys-enter-2'
    },
    critical: {
        vars: '[--pi-bar:var(--sapProgress_Value_CriticalBackground)] [--pi-bar-border:var(--sapProgress_Value_CriticalBorderColor)] [--pi-track:var(--sapProgress_CriticalBackground)] [--pi-track-border:var(--sapProgress_CriticalBorderColor)] [--pi-icon:var(--sapProgress_Value_CriticalTextColor)]',
        glyph: 'alert'
    },
    negative: {
        vars: '[--pi-bar:var(--sapProgress_Value_NegativeBackground)] [--pi-bar-border:var(--sapProgress_Value_NegativeBorderColor)] [--pi-track:var(--sapProgress_NegativeBackground)] [--pi-track-border:var(--sapProgress_NegativeBorderColor)] [--pi-icon:var(--sapProgress_Value_NegativeTextColor)]',
        glyph: 'sys-cancel-2'
    }
};

/** Above the track, inside its border as fundamental-styles: as wide as the text, at most the track. */
const LABEL_POSITION = 'absolute start-px top-px max-w-[calc(100%-1.25rem-2px)]';

const LABEL = 'block truncate text-sap-progress-font-size leading-[normal] text-sap-field-text-color select-none';

export interface ProgressIndicatorProps extends ComponentProps<'div'> {
    valueNow?: number;
    valueMin?: number;
    valueMax?: number;
    /** Text of the value; the value and the unit ("42%") by default. */
    valueText?: string | null;
    /** Unit appended to the value in the default text. */
    unit?: string;
    /** Value state: colours the bar and shows a status icon. Neutral when unset. */
    state?: ProgressIndicatorState | null;
    /** Animates changes of the value. */
    animate?: boolean;
    /** Accessible name of the close button in the popover of a truncated text. */
    closeLabel?: string;
}

/**
 * Progress indicator: a bar that shows how much of a task is done, with the value (or a text) above it and an icon
 * for a value state. A text that does not fit is truncated and shows in full in a popover on click.
 *
 * The bar is the `progressbar`: `aria-label`, `aria-labelledby` and `aria-describedby` name it; the other native
 * props, `className` and `ref` go to the root.
 *
 * ```tsx
 * <ProgressIndicator valueNow={42} aria-label="Upload" />
 * <ProgressIndicator state="positive" valueNow={80} valueText="80 of 100 MB" aria-label="Download" />
 * ```
 */
export function ProgressIndicator({
    valueNow = 0,
    valueMin = 0,
    valueMax = 100,
    valueText,
    unit = '%',
    state,
    animate = false,
    closeLabel = 'Close',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ref,
    className,
    ...props
}: ProgressIndicatorProps) {
    const range = valueMax - valueMin;
    const percent = range <= 0 ? 0 : Math.min(100, Math.max(0, ((valueNow - valueMin) / range) * 100));
    const text = valueText || `${valueNow}${unit}`;
    const { vars, glyph } = STATES[state ?? 'neutral'] ?? STATES.neutral;

    const root = useRef<HTMLDivElement | null>(null);
    const label = useRef<HTMLElement | null>(null);
    const [truncated, setTruncated] = useState(false);
    const [open, setOpen] = useState(false);
    const check = useCallback(() => {
        const el = label.current;
        if (el) setTruncated(el.scrollWidth > el.clientWidth + 1);
    }, []);
    useLayoutEffect(() => {
        const el = root.current;
        if (!el) return;
        const observer = new ResizeObserver(check);
        observer.observe(el);
        return () => observer.disconnect();
    }, [check]);
    // a new text may fit, or not, at the same width
    useLayoutEffect(check, [check, text]);

    const setRoot = useCallback(
        (el: HTMLDivElement | null) => {
            root.current = el;
            if (typeof ref === 'function') return ref(el);
            if (ref) ref.current = el;
        },
        [ref]
    );

    return (
        <div
            {...props}
            ref={setRoot}
            className={cn(
                'relative m-0 my-2 box-border block h-8 w-full border-0 px-0 pt-5 pb-1.5 font-sap-font-family font-normal text-sap-font-size leading-[normal] text-sap-text-color forced-color-adjust-none',
                vars,
                className
            )}
        >
            {truncated ? (
                <Popover open={open} onOpenChange={setOpen} placement="bottom" noArrow={false} fillControlMode="equal">
                    <PopoverTrigger
                        ref={label}
                        className={cn(
                            LABEL,
                            LABEL_POSITION,
                            'cursor-pointer appearance-none border-0 bg-transparent p-0 text-start outline-none focus-visible:outline-sap'
                        )}
                    >
                        {text}
                    </PopoverTrigger>
                    <PopoverBody aria-label={text}>
                        <div className="flex max-w-[95vw] items-center justify-between gap-2 py-1 ps-2 font-sap-font-family text-sap-font-size whitespace-normal text-sap-text-color">
                            <span>{text}</span>
                            <Button
                                variant="transparent"
                                glyph="decline"
                                aria-label={closeLabel}
                                onClick={() => setOpen(false)}
                            />
                        </div>
                    </PopoverBody>
                </Popover>
            ) : (
                <span ref={label} aria-hidden="true" className={cn(LABEL, LABEL_POSITION)}>
                    {text}
                </span>
            )}
            <div
                role="progressbar"
                aria-valuemin={valueMin}
                aria-valuemax={valueMax}
                aria-valuenow={valueNow}
                aria-valuetext={text}
                aria-label={ariaLabel || undefined}
                aria-labelledby={ariaLabelledBy || undefined}
                aria-describedby={ariaDescribedBy || undefined}
                className={cn(
                    'relative box-border flex h-1.5 min-h-1.5 w-[calc(100%-1.25rem)] min-w-16 rounded-[0.5rem] border border-solid border-(--pi-track-border) bg-(--pi-track)',
                    "before:absolute before:start-0 before:top-0 before:size-1 before:rounded-full before:bg-(--pi-bar) before:content-['']",
                    "after:absolute after:end-0 after:top-0 after:size-1 after:rounded-full after:bg-(--pi-bar) after:content-['']"
                )}
            >
                {percent > 0 && (
                    <div
                        style={{ width: `${percent}%`, minWidth: `${percent}%` }}
                        className={cn(
                            '-my-[0.1875rem] box-border h-2.5 shrink-0 rounded-[0.5rem] border border-solid border-(--pi-bar-border) bg-(--pi-bar)',
                            animate && 'transition-[width,min-width] duration-500 ease-in-out'
                        )}
                    />
                )}
                {glyph && (
                    <Icon
                        glyph={glyph}
                        className="absolute -end-5 -bottom-2.5 block w-auto text-sap-font-size leading-[normal] text-sap-text-color before:align-middle before:text-sap-font-large-size before:text-(--pi-icon)"
                    />
                )}
            </div>
        </div>
    );
}
