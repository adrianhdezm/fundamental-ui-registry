/*
 * Port of @fundamental-ngx/core (micro-process-flow) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    Children,
    createContext,
    isValidElement,
    use,
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type FocusEvent,
    type KeyboardEvent,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconFont } from '@/ui/icon/icon';

export type MicroProcessFlowItemType = 'positive' | 'critical' | 'negative' | 'information' | 'none';

interface FlowContextValue {
    independentSteps: boolean;
    count: number;
    /** Whether the focusable element of the step at index is in the tab order. */
    tabbable(index: number): boolean;
}

const FlowContext = createContext<FlowContextValue | null>(null);
/** Index of the step a part is rendered in. */
const ItemIndexContext = createContext(-1);

const FOCUSABLE = 'focus:z-5 focus:outline-sap focus:outline-offset-[0.0625rem]';

/** Tab order, marker and focus outline of the element of a step that takes the focus. */
function useFocusableProps() {
    const flow = use(FlowContext);
    const index = use(ItemIndexContext);
    return {
        tabIndex: flow?.tabbable(index) ? 0 : -1,
        'data-mpf-focusable': ''
    };
}

/**
 * The element of a step that takes the focus, usually a `MicroProcessFlowIcon` (or pass `focusable` to the icon).
 * Only the steps in view are in the tab order, and the flow is one tab stop: Left and Right move between the steps.
 * Renders a `<div>`; `render` renders another element, e.g. a `StatusIndicator`.
 */
export function MicroProcessFlowFocusableItem({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    const focusable = useFocusableProps();
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, ...focusable, className: cn(FOCUSABLE, className) }
    });
}

/**
 * An object between two steps, e.g. an icon on the connector. Put it in the `MicroProcessFlowItem` before it: it is
 * drawn on that step's connector. Renders a `<span>`; `render` renders another element, e.g. an `Icon`.
 */
export function MicroProcessFlowIntermediaryItem({ render, className, ...props }: useRender.ComponentProps<'span'>) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: { ...props, className: cn('relative z-3 leading-none', className) }
    });
}

/** Colours of a step per state: background, border, their hover values and the icon colour. */
const STATES: Record<MicroProcessFlowItemType, string> = {
    none: '[--mpf-bg:var(--sapNeutralBackground)] [--mpf-border:var(--sapNeutralBorderColor)] [--mpf-hover-bg:var(--mpf-bg)] [--mpf-hover-border:var(--mpf-border)] [--mpf-icon:var(--sapButton_Neutral_Background)]',
    positive:
        '[--mpf-bg:var(--sapPositiveElementColor)] [--mpf-border:var(--sapPositiveElementColor)] [--mpf-hover-bg:var(--sapButton_Success_Hover_Background)] [--mpf-hover-border:var(--sapButton_Success_Hover_Background)] [--mpf-icon:var(--mpf-active-icon)]',
    information:
        '[--mpf-bg:var(--sapInformativeElementColor)] [--mpf-border:var(--sapInformativeElementColor)] [--mpf-hover-bg:var(--sapButton_Information_Hover_Background)] [--mpf-hover-border:var(--sapInformationBorderColor)] [--mpf-icon:var(--mpf-active-icon)] [--mpf-hover-icon:var(--sapButton_Information_Hover_TextColor)] [--mpf-active-border:var(--sapContent_Selected_ForegroundColor)]',
    negative:
        '[--mpf-bg:var(--sapNegativeElementColor)] [--mpf-border:var(--sapNegativeElementColor)] [--mpf-hover-bg:var(--sapButton_Negative_Hover_Background)] [--mpf-hover-border:var(--sapButton_Negative_Hover_Background)] [--mpf-icon:var(--mpf-active-icon)]',
    critical:
        '[--mpf-bg:var(--sapCriticalElementColor)] [--mpf-border:var(--sapCriticalElementColor)] [--mpf-hover-bg:var(--sapButton_Critical_Hover_Background)] [--mpf-hover-border:var(--sapButton_Critical_Hover_Background)] [--mpf-icon:var(--mpf-active-icon)]'
};

export interface MicroProcessFlowItemProps extends ComponentProps<'div'> {
    /** Value state of the step: the colours of its icon. */
    state?: MicroProcessFlowItemType;
    /** Marks the connector to the next step as interrupted. */
    intermediate?: boolean;
}

/**
 * A step of a micro process flow: its content (e.g. a focusable `MicroProcessFlowIcon` or a status indicator) and
 * the connector to the next step, optionally marked as intermediate or carrying a `MicroProcessFlowIntermediaryItem`
 * child.
 */
export function MicroProcessFlowItem({
    state = 'none',
    intermediate = false,
    className,
    children,
    ...props
}: MicroProcessFlowItemProps) {
    const flow = use(FlowContext);
    const index = use(ItemIndexContext);
    const last = !!flow && index === flow.count - 1;
    const content: ReactNode[] = [];
    const intermediary: ReactNode[] = [];
    Children.toArray(children).forEach((child) =>
        (isValidElement(child) && child.type === MicroProcessFlowIntermediaryItem ? intermediary : content).push(child)
    );
    return (
        <div
            {...props}
            data-mpf-item=""
            className={cn(
                'relative m-0 my-[calc(var(--sapContent_FocusWidth)*2)] box-border flex items-stretch justify-start p-0 ps-[0.1875rem]',
                'font-sap-font-family text-sap-font-size text-sap-text-color',
                STATES[state] ?? STATES.none,
                className
            )}
        >
            <div className="m-0 box-border flex min-h-(--mpf-min) w-full min-w-(--mpf-min) items-center justify-start p-0">
                <div className="contents">{content}</div>
                {!last && (
                    <div
                        className={cn(
                            'relative m-0 ms-[0.1875rem] box-border flex h-full min-w-(--mpf-connector) grow items-center justify-center p-0',
                            "before:absolute before:z-1 before:block before:w-full before:border-0 before:border-b before:border-solid before:border-sap-content-foreground-border-color before:content-['']",
                            flow?.independentSteps && 'before:border-transparent',
                            intermediate &&
                                "after:absolute after:inset-y-0 after:start-1/2 after:z-2 after:-ms-0.5 after:block after:w-1 after:bg-sap-negative-element-color after:content-['']"
                        )}
                    >
                        {intermediary}
                    </div>
                )}
            </div>
        </div>
    );
}

export interface MicroProcessFlowIconProps extends useRender.ComponentProps<'div'> {
    /** Glyph of the icon; without it the step is an empty circle. */
    glyph?: string | null;
    /** Icon font of the glyph. */
    font?: IconFont;
    /** Accessible name of the icon (Angular's `ariaLabel`); `aria-label` names the circle itself, e.g. a button. */
    glyphAriaLabel?: string | null;
    /** Makes the icon the focusable element of its step (Angular's `fdMicroProcessFlowFocusableItem` on it). */
    focusable?: boolean;
}

/** The round icon of a step; its colours follow the state of its step. Renders a `<div>`. */
export function MicroProcessFlowIcon({
    glyph,
    font = 'SAP-icons',
    glyphAriaLabel,
    focusable = false,
    render,
    className,
    ...props
}: MicroProcessFlowIconProps) {
    const focusableProps = useFocusableProps();
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            ...(focusable ? focusableProps : {}),
            className: cn(
                // 50%, as fundamental-styles (rounded-full computes to a huge length)
                'group/mpf-icon m-0 box-border flex min-h-(--mpf-min) min-w-(--mpf-min) items-center justify-center rounded-[50%] border border-solid border-(--mpf-border) bg-(--mpf-bg) p-0',
                'hover:border-(--mpf-hover-border) hover:bg-(--mpf-hover-bg)',
                'active:border-(--mpf-active-border,var(--sapHighlightColor)) active:bg-sap-highlight-color',
                focusable && FOCUSABLE,
                className
            ),
            children: glyph ? (
                <Icon
                    glyph={glyph}
                    font={font}
                    aria-label={glyphAriaLabel ?? undefined}
                    className="text-(length:--mpf-icon-size) text-(--mpf-icon) group-hover/mpf-icon:text-(--mpf-hover-icon,var(--mpf-icon)) group-active/mpf-icon:text-(--mpf-active-icon)"
                />
            ) : null
        }
    });
}

const LINK =
    'group/mpf-link m-0 box-border flex shrink-0 cursor-pointer items-center gap-[0.313rem] border-0 p-0 px-[0.313rem] text-sap-font-size text-sap-group-title-text-color [text-shadow:var(--sapContent_TextShadow)] outline-none focus:outline-sap focus:-outline-offset-[0.1875rem]';
const LINK_ICON = 'text-sap-button-text-color group-hover/mpf-link:text-sap-button-hover-text-color';

export interface MicroProcessFlowProps extends ComponentProps<'div'> {
    /** Steps without connecting lines. */
    independentSteps?: boolean;
    /** Duration of the scrolling in milliseconds. */
    transitionSpeed?: number;
    /** Timing function of the scrolling. */
    transitionTimingFunction?: string;
    /** Announced after the number of steps hidden at the start. */
    previousLabel?: string;
    /** Announced after the number of steps hidden at the end. */
    nextLabel?: string;
}

const sameWidths = (a: number[], b: number[]) => a.length === b.length && a.every((w, i) => w === b[i]);

/** The largest offset that still fills the row. */
function maxOffset(widths: number[], available: number): number {
    let used = 0;
    for (let index = widths.length - 1; index >= 0; index--) {
        used += widths[index];
        if (used > available + 0.5) return index + 1;
    }
    return 0;
}

/**
 * Micro process flow: a compact row of process steps (`MicroProcessFlowItem` children) joined by connectors. Steps
 * that do not fit are reached with the "previous" and "next" links at the ends, which show how many steps are hidden.
 * The flow is one tab stop: Left and Right (mirrored in RTL) move between the steps and scroll them into view.
 *
 * ```tsx
 * <MicroProcessFlow>
 *     <MicroProcessFlowItem state="positive">
 *         <MicroProcessFlowIcon focusable glyph="pending" glyphAriaLabel="Pending" />
 *     </MicroProcessFlowItem>
 * </MicroProcessFlow>
 * ```
 */
export function MicroProcessFlow({
    independentSteps = false,
    transitionSpeed = 300,
    transitionTimingFunction = 'ease',
    previousLabel = 'previous steps',
    nextLabel = 'next steps',
    className,
    children,
    onKeyDown,
    onFocus,
    onBlur,
    ...props
}: MicroProcessFlowProps) {
    const container = useRef<HTMLDivElement>(null);
    const wrapper = useRef<HTMLDivElement>(null);
    /** Number of steps scrolled out at the start. */
    const [offset, setOffset] = useState(0);
    const [focusWithin, setFocusWithin] = useState(false);
    /** Widths of the steps, measured after rendering. */
    const [widths, setWidths] = useState<number[]>([]);
    const [containerWidth, setContainerWidth] = useState(0);

    const items = Children.toArray(children);
    const signature = items.map((item) => (isValidElement(item) ? item.key : String(item))).join('|');

    const itemElements = useCallback(
        () =>
            [...(wrapper.current?.children ?? [])].filter((el): el is HTMLElement => el.hasAttribute('data-mpf-item')),
        []
    );
    const focusableOf = (item: HTMLElement | undefined) =>
        item?.querySelector<HTMLElement>('[data-mpf-focusable]') ?? null;

    const measure = useCallback(() => {
        const next = itemElements().map((item) => item.getBoundingClientRect().width);
        const available = container.current?.getBoundingClientRect().width ?? 0;
        setWidths((current) => (sameWidths(current, next) ? current : next));
        setContainerWidth(available);
        setOffset((current) => Math.min(current, maxOffset(next, available)));
    }, [itemElements]);

    useLayoutEffect(() => {
        const el = container.current;
        if (!el) return;
        const observer = new ResizeObserver(() => measure());
        observer.observe(el);
        return () => observer.disconnect();
    }, [measure]);

    // new steps: measure them and start at the first
    useLayoutEffect(() => {
        setOffset(0);
        measure();
    }, [signature, measure]);

    /** Number of steps that fit from the first step in view. */
    let visibleCount = 0;
    let used = 0;
    for (const width of widths.slice(offset)) {
        if (used + width > containerWidth + 0.5) break;
        used += width;
        visibleCount++;
    }
    /** Number of steps hidden at the end. */
    const nextCount = containerWidth ? Math.max(0, items.length - offset - Math.max(1, visibleCount)) : 0;
    const shift = widths.slice(0, offset).reduce((sum, width) => sum + width, 0);

    /** Scrolls so the step at index is the first in view, as far as the remaining steps fill the row. */
    const scrollTo = (index: number) => setOffset(Math.max(0, Math.min(index, maxOffset(widths, containerWidth))));

    const context: FlowContextValue = {
        independentSteps,
        count: items.length,
        // steps in view are in the tab order, unless the focus is already in the flow
        tabbable: (index) => !focusWithin && index >= offset && index < offset + visibleCount
    };

    const activate = (action: () => void) => ({
        onClick: action,
        onKeyDown: (event: KeyboardEvent) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            action();
        }
    });

    const isStep = (el: EventTarget | null) => !!el && itemElements().some((item) => focusableOf(item) === el);

    return (
        <div
            {...props}
            className={cn(
                // a normal line height, as fundamental-styles (Angular: --sapContent_LineHeight)
                'm-0 box-border flex max-w-[calc(var(--mpf-item)*9+0.0625rem)] p-0 font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color',
                '[--mpf-item:2.75rem] [--mpf-min:1.875rem] [--mpf-connector:1.125rem] [--mpf-icon-size:var(--sapFontLargeSize)] [--mpf-direction:-1] rtl:[--mpf-direction:1]',
                'compact:[--mpf-item:2rem] compact:[--mpf-min:1.375rem] compact:[--mpf-connector:0.625rem] compact:[--mpf-icon-size:var(--sapFontSmallSize)]',
                '[--mpf-active-icon:var(--sapContent_ContrastIconColor)] hc:[--mpf-active-icon:var(--sapContent_ForegroundColor)]',
                className
            )}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.defaultPrevented || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
                const steps = itemElements();
                const focused = steps.findIndex((item) => focusableOf(item) === document.activeElement);
                if (focused < 0) return;
                event.preventDefault();
                event.stopPropagation();
                const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
                const target = focused + ((event.key === 'ArrowRight') !== rtl ? 1 : -1);
                if (target < 0 || target >= steps.length) return;
                // scroll as little as needed to bring the step into view
                if (target < offset) scrollTo(target);
                else if (target >= offset + visibleCount) scrollTo(offset + 1);
                focusableOf(steps[target])?.focus({ preventScroll: true });
            }}
            onFocus={(event: FocusEvent<HTMLDivElement>) => {
                onFocus?.(event);
                setFocusWithin(isStep(event.target));
            }}
            onBlur={(event: FocusEvent<HTMLDivElement>) => {
                onBlur?.(event);
                if (!isStep(event.relatedTarget)) setFocusWithin(false);
            }}
        >
            {offset > 0 && (
                <span
                    role="button"
                    tabIndex={0}
                    aria-label={`${offset} ${previousLabel}`}
                    className={LINK}
                    {...activate(() => scrollTo(offset - 1))}
                >
                    <Icon glyph="navigation-left-arrow" className={LINK_ICON} />
                    {offset}
                </span>
            )}
            <div ref={container} className="m-0 box-border flex w-full overflow-hidden p-0">
                <div
                    ref={wrapper}
                    className="m-0 box-border flex p-0 transition-transform"
                    style={{
                        transitionDuration: `${transitionSpeed}ms`,
                        transitionTimingFunction,
                        transform: shift ? `translateX(calc(${shift}px * var(--mpf-direction)))` : undefined
                    }}
                >
                    <FlowContext value={context}>
                        {items.map((item, index) => (
                            <ItemIndexContext key={isValidElement(item) ? item.key : index} value={index}>
                                {item}
                            </ItemIndexContext>
                        ))}
                    </FlowContext>
                </div>
            </div>
            {nextCount > 0 && (
                <span
                    role="button"
                    tabIndex={0}
                    aria-label={`${nextCount} ${nextLabel}`}
                    className={cn(LINK, 'justify-end')}
                    {...activate(() => scrollTo(offset + 1))}
                >
                    {nextCount}
                    <Icon glyph="navigation-right-arrow" className={LINK_ICON} />
                </span>
            )}
        </div>
    );
}
