/*
 * Port of fundamental-react (Wizard) and @fundamental-ngx/core (wizard) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    Children,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type CSSProperties,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    type ReactNode,
    type Ref,
    type RefCallback
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ActionSheet, ActionSheetBody, ActionSheetControl, ActionSheetItem } from '@/ui/action-sheet/action-sheet';
import { Icon, type IconFont } from '@/ui/icon/icon';

export type WizardStepStatus = 'completed' | 'current' | 'upcoming' | 'active';
export type WizardSize = 'sm' | 'md' | 'lg' | 'xl';
export type WizardContentBackground = 'solid' | 'list' | 'transparent';

/** A step as the callbacks report it: its `id`, `label` and position among all steps. */
export interface WizardStepInfo {
    id: string;
    label: string;
    index: number;
}

/** Narrower steps stack their labels. */
export const STEP_MIN_WIDTH = 168;
/** Width of a stacked step that shows its connector. */
const STACKED_TOP_WIDTH = 64;
/** Width of a stacked step, and the extra room after the last one. */
const STACKED_WIDTH = 4;
const STACKED_LAST_OFFSET = 38;

/** Horizontal paddings per size, shared by the progress bar and the content. */
const SIZE_PADDING: Record<WizardSize, string> = {
    sm: 'px-4',
    md: 'px-8',
    lg: 'px-8',
    xl: 'px-12'
};

function mergeRefs<E>(...refs: (Ref<E> | undefined)[]): RefCallback<E> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
}

/** What a step tells the wizard about itself. */
interface StepRecord {
    /** Stable per mounted step. */
    key: object;
    id: string;
    element: HTMLElement;
    label: string;
    status: WizardStepStatus;
    visited: boolean;
    completed: boolean;
    isSummary: boolean;
    branching: boolean;
    hasContent: boolean;
    glyph: string | null;
    glyphFont: IconFont;
    setStatus: (status: WizardStepStatus) => void;
    focusElement: () => HTMLElement | null;
}

const RECORD_FIELDS = [
    'id',
    'element',
    'label',
    'status',
    'visited',
    'completed',
    'isSummary',
    'branching',
    'hasContent',
    'glyph',
    'glyphFont'
] as const;

interface WizardContextValue {
    ariaLabel: string;
    appendToWizard: boolean;
    displaySummaryStep: boolean;
    showingSummary: boolean;
    steps: StepRecord[];
    navSteps: StepRecord[];
    lastNavStep: StepRecord | null;
    currentStep: StepRecord | null;
    shownSteps: StepRecord[];
    tabbableStep: StepRecord | null;
    stacked: ReadonlySet<object>;
    stackedTop: object | null;
    stackedItemsOf: (key: object) => StepRecord[];
    upsert: (record: StepRecord) => void;
    remove: (key: object) => void;
    goToStep: (key: object) => void;
    slotOf: (key: object) => HTMLElement | null;
    setBar: (bar: HTMLElement | null) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

interface StepContextValue {
    key: object;
    id: string;
    label: string;
    ariaLabel: string | undefined;
    status: WizardStepStatus;
    branching: boolean;
    isCompleted: boolean;
    stackedItems: StepRecord[];
    setHasContent: (has: boolean) => void;
    onIndicatorItemClick: (step: StepRecord) => void;
}

const StepContext = createContext<StepContextValue | null>(null);

const info = (step: StepRecord, steps: StepRecord[]): WizardStepInfo => ({
    id: step.id,
    label: step.label,
    index: steps.indexOf(step)
});

/** Statuses after making the step at `index` current: the steps before it completed, the ones after upcoming. */
const statusAt = (i: number, index: number): WizardStepStatus =>
    i === index ? 'current' : i < index ? 'completed' : 'upcoming';

/** The first element of `root` that the Tab key reaches. */
function firstTabbable(root: HTMLElement): HTMLElement | null {
    const candidates = root.querySelectorAll<HTMLElement>(
        'a[href], area[href], button, input, select, textarea, iframe, [tabindex], [contenteditable]:not([contenteditable="false"]), audio[controls], video[controls], summary'
    );
    for (const el of candidates) {
        if (el.tabIndex < 0) continue;
        if ((el as HTMLButtonElement).disabled) continue;
        if (el instanceof HTMLInputElement && el.type === 'hidden') continue;
        if (el.closest('[inert]')) continue;
        if (!el.getClientRects().length || getComputedStyle(el).visibility === 'hidden') continue;
        return el;
    }
    return null;
}

/** Stacks steps until every labelled step is at least STEP_MIN_WIDTH wide. */
function layoutSteps(steps: StepRecord[], width: number, current: StepRecord | null) {
    const hidden = new Set<StepRecord>();
    const left: StepRecord[] = [];
    const right: StepRecord[] = [];
    const before = (): StepRecord | null => {
        const index = current ? steps.indexOf(current) : -1;
        return index > 0 ? steps[index - 1]! : null;
    };
    const tooNarrow = (): boolean => {
        const labelled = steps.length - hidden.size;
        if (!labelled || !width) return false;
        const top = before();
        let fixed = 0;
        for (const step of hidden) fixed += step === top ? STACKED_TOP_WIDTH : STACKED_WIDTH;
        const last = steps.at(-1);
        if (last && hidden.has(last) && last !== top) fixed += STACKED_LAST_OFFSET;
        return (width - fixed) / labelled < STEP_MIN_WIDTH;
    };
    if (current && steps.includes(current)) {
        for (let i = 0; i < steps.length - 1 && tooNarrow(); i++) {
            const remaining = steps.filter((step) => !hidden.has(step));
            if (remaining.length <= 1) break;
            const index = Math.max(0, remaining.indexOf(current));
            const toHide = index > (remaining.length - 1) / 2 ? remaining[0]! : remaining[remaining.length - 1]!;
            hidden.add(toHide);
            if (remaining.indexOf(toHide) < index) left.push(toHide);
            else right.unshift(toHide);
        }
    }
    const top = hidden.size ? before() : null;
    if (top && left.length && !left.includes(top)) left.push(top);
    left.sort((a, b) => steps.indexOf(a) - steps.indexOf(b));
    return { hidden, top, left, right };
}

export interface WizardProps extends Omit<ComponentProps<'div'>, 'role'> {
    /** Shows the content of all visited steps one below the other (default); otherwise only the current step's. */
    appendToWizard?: boolean;
    /** Height of the scrolling content, e.g. `26rem`; by default it fills the viewport below its top. */
    contentHeight?: string | null;
    /** Paddings of the progress bar and content follow the viewport width. */
    responsivePaddings?: boolean;
    /** Shows the summary as a step of the progress bar instead of replacing the steps with it. */
    displaySummaryStep?: boolean;
    /** Name of the wizard region, also the default name of its navigation (default `Wizard`). */
    'aria-label'?: string;
}

/**
 * Wizard: breaks a long task into steps. The progress bar on top shows the steps; the content of the visited steps
 * shows one below the other (or only the current one with `appendToWizard={false}`), and scrolling the content
 * updates the current step. Visited steps can be clicked to go back; in the progress bar the steps form one tab stop
 * and Left and Right move between the visited ones. On narrow screens steps stack, and the indicator next to them
 * lists them in an action sheet.
 *
 * Renders a `<div role="region">`; `WizardNavigation` children go above the scrolling content, other children (a
 * footer `Bar`) below it. Each step's `WizardContent` renders in the scrolling content, not inside the step.
 *
 * ```tsx
 * <Wizard contentHeight="26rem">
 *     <WizardNavigation>
 *         <WizardProgressBar size="lg" aria-label="Steps">
 *             <WizardStep status={status[0]} onStatusChange={(s) => update(0, s)} label="Product type">
 *                 <WizardStepIndicator glyph="product" />
 *                 <WizardContent size="lg">…</WizardContent>
 *             </WizardStep>
 *         </WizardProgressBar>
 *     </WizardNavigation>
 * </Wizard>
 * ```
 */
export function Wizard({
    appendToWizard = true,
    contentHeight,
    responsivePaddings = false,
    displaySummaryStep = false,
    'aria-label': ariaLabel = 'Wizard',
    className,
    onKeyDown,
    children,
    ref,
    ...props
}: WizardProps) {
    const host = useRef<HTMLDivElement | null>(null);
    const wrapper = useRef<HTMLDivElement | null>(null);
    const [steps, setSteps] = useState<StepRecord[]>([]);
    const [bar, setBar] = useState<HTMLElement | null>(null);
    const [barWidth, setBarWidth] = useState(0);
    const [autoHeight, setAutoHeight] = useState<string | null>(null);
    const [slots, setSlots] = useState<ReadonlyMap<object, HTMLElement>>(new Map());
    const slotRefs = useRef(new Map<object, RefCallback<HTMLDivElement>>());
    /** Scrolling started by the wizard does not change the current step. */
    const programmaticScroll = useRef(false);
    const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    /** The current step the focus was last moved for; the first one does not move it. */
    const focusedFor = useRef<object | null | undefined>(undefined);
    const changedByScroll = useRef(false);

    const upsert = useCallback((record: StepRecord) => {
        setSteps((prev) => {
            const index = prev.findIndex((step) => step.key === record.key);
            const old = prev[index];
            if (old && RECORD_FIELDS.every((field) => old[field] === record[field])) return prev;
            const next = index >= 0 ? prev.with(index, record) : [...prev, record];
            return next.sort((a, b) =>
                a.element === b.element
                    ? 0
                    : a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING
                      ? -1
                      : 1
            );
        });
    }, []);
    const remove = useCallback((key: object) => {
        setSteps((prev) => (prev.some((step) => step.key === key) ? prev.filter((step) => step.key !== key) : prev));
    }, []);

    /** Steps in the progress bar: all but a hidden summary. */
    const navSteps = useMemo(
        () => steps.filter((step) => !step.isSummary || displaySummaryStep),
        [steps, displaySummaryStep]
    );
    const lastNavStep = navSteps.at(-1) ?? null;
    const currentStep = steps.find((step) => step.status === 'current' || step.status === 'active') ?? null;
    /** The summary replaces the steps. */
    const showingSummary = !!currentStep?.isSummary && !displaySummaryStep;
    const shownSteps = useMemo(() => {
        const withContent = steps.filter((step) => step.hasContent);
        if (showingSummary || !appendToWizard) return withContent.filter((step) => step === currentStep);
        return withContent.filter(
            (step) =>
                (step.visited || step.status === 'current' || step.status === 'completed') &&
                (!step.isSummary || displaySummaryStep)
        );
    }, [steps, showingSummary, appendToWizard, currentStep, displaySummaryStep]);
    const tabbableStep = currentStep && navSteps.includes(currentStep) ? currentStep : (navSteps[0] ?? null);
    const layout = useMemo(() => layoutSteps(navSteps, barWidth, currentStep), [navSteps, barWidth, currentStep]);

    const goToStep = useCallback(
        (key: object) => {
            const index = steps.findIndex((step) => step.key === key);
            if (index < 0) return;
            steps.forEach((step, i) => step.setStatus(statusAt(i, index)));
        },
        [steps]
    );

    const stacked = useMemo(() => new Set<object>([...layout.hidden].map((step) => step.key)), [layout]);
    const stackedItemsOf = useCallback(
        (key: object) => {
            if (key === lastNavStep?.key) return layout.right;
            if (key === layout.top?.key) return layout.left;
            return [];
        },
        [layout, lastNavStep]
    );

    const context = useMemo<WizardContextValue>(
        () => ({
            ariaLabel,
            appendToWizard,
            displaySummaryStep,
            showingSummary,
            steps,
            navSteps,
            lastNavStep,
            currentStep,
            shownSteps,
            tabbableStep,
            stacked,
            stackedTop: layout.top?.key ?? null,
            stackedItemsOf,
            upsert,
            remove,
            goToStep,
            slotOf: (key) => slots.get(key) ?? null,
            setBar
        }),
        [
            ariaLabel,
            appendToWizard,
            displaySummaryStep,
            showingSummary,
            steps,
            navSteps,
            lastNavStep,
            currentStep,
            shownSteps,
            tabbableStep,
            stacked,
            layout,
            stackedItemsOf,
            upsert,
            remove,
            goToStep,
            slots
        ]
    );

    /** A stable ref callback per step for its place in the scrolling content. */
    const slotRef = (key: object): RefCallback<HTMLDivElement> => {
        let callback = slotRefs.current.get(key);
        if (!callback) {
            callback = (node) => {
                setSlots((prev) => {
                    if (node ? prev.get(key) === node : !prev.has(key)) return prev;
                    const next = new Map(prev);
                    if (node) next.set(key, node);
                    else next.delete(key);
                    return next;
                });
            };
            slotRefs.current.set(key, callback);
        }
        return callback;
    };

    /** Fills the viewport below the content, unless a height is set. */
    const contentHeightRef = useRef(contentHeight);
    contentHeightRef.current = contentHeight;
    const updateHeight = useCallback(() => {
        const scroller = wrapper.current;
        if (contentHeightRef.current || !scroller) return;
        const section = scroller.parentElement!;
        const below = section.getBoundingClientRect().bottom - scroller.getBoundingClientRect().bottom;
        const top = scroller.getBoundingClientRect().top + window.scrollY;
        setAutoHeight(`calc(100svh - ${Math.max(0, top + below)}px)`);
    }, []);

    useEffect(() => {
        const root = host.current;
        if (!root) return;
        const onResize = () => {
            if (bar) {
                const style = getComputedStyle(bar);
                setBarWidth(
                    bar.clientWidth - parseFloat(style.paddingInlineStart) - parseFloat(style.paddingInlineEnd)
                );
            }
            updateHeight();
        };
        const observer = new ResizeObserver(onResize);
        observer.observe(root);
        if (bar) observer.observe(bar);
        window.addEventListener('resize', updateHeight);
        onResize();
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateHeight);
        };
    }, [bar, updateHeight]);

    useEffect(() => () => clearTimeout(scrollTimer.current), []);

    // a new current step: scroll to its content and focus it
    const currentKey = currentStep?.key ?? null;
    const shownKey = shownSteps.map((step) => step.id).join(' ');
    useEffect(() => {
        const scroller = wrapper.current;
        if (!scroller) return;
        const index = shownSteps.findIndex((step) => step.key === currentKey);
        const current = shownSteps[index];
        // wait until the content of the step is in its place
        if (current && !slots.has(current.key)) return;
        updateHeight();
        const fromScroll = changedByScroll.current;
        changedByScroll.current = false;
        // a step that became current by scrolling is already in view
        if (fromScroll) {
            focusedFor.current = currentKey;
            return;
        }
        const child = scroller.children[index] as HTMLElement | undefined;
        if (!current || !child) return;
        if (appendToWizard) {
            const top = child.offsetTop - (scroller.children[0] as HTMLElement).offsetTop;
            if (Math.abs(scroller.scrollTop - top) > 1) {
                programmaticScroll.current = true;
                scroller.scrollTo({ top, behavior: 'smooth' });
            }
        }
        // focus the first control of a new current step (not on the first rendering)
        if (focusedFor.current !== undefined && focusedFor.current !== currentKey) {
            firstTabbable(child)?.focus({ preventScroll: true });
        }
        focusedFor.current = currentKey;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentKey, shownKey, slots, appendToWizard]);

    const onScroll = () => {
        if (programmaticScroll.current) {
            clearTimeout(scrollTimer.current);
            scrollTimer.current = setTimeout(() => (programmaticScroll.current = false), 150);
            return;
        }
        const scroller = wrapper.current;
        if (!appendToWizard || showingSummary || !scroller) return;
        // the step whose content reached the top becomes current
        const children = Array.from(scroller.children) as HTMLElement[];
        let spied = 0;
        children.forEach((child, index) => {
            if (child.offsetTop - children[0]!.offsetTop <= scroller.scrollTop) spied = index;
        });
        const step = shownSteps[spied];
        if (step && step !== currentStep) {
            changedByScroll.current = true;
            goToStep(step.key);
        }
    };

    const onWizardKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
        const index = navSteps.findIndex((step) => step.focusElement() === document.activeElement);
        if (index < 0) return;
        event.preventDefault();
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const forward = (event.key === 'ArrowRight') !== rtl;
        const previous = navSteps[index - 1];
        // only completed (or current) steps lead on
        const next = forward
            ? navSteps[index]!.completed
                ? navSteps[index + 1]
                : undefined
            : previous?.status === 'completed' || previous?.status === 'current'
              ? previous
              : undefined;
        next?.focusElement()?.focus();
    };

    const navigation: ReactNode[] = [];
    const rest: ReactNode[] = [];
    Children.forEach(children, (child) => {
        if (isValidElement(child) && child.type === WizardNavigation) navigation.push(child);
        else rest.push(child);
    });

    return (
        <WizardContext.Provider value={context}>
            <div
                {...props}
                ref={mergeRefs(host, ref)}
                role="region"
                aria-label={ariaLabel}
                className={cn(
                    'relative m-0 box-border block p-0 font-sap-font-family text-sap-font-size text-sap-text-color',
                    responsivePaddings &&
                        'max-[599px]:[&_[data-wizard-pad]]:px-4 min-[600px]:max-[1439px]:[&_[data-wizard-pad]]:px-8 min-[1440px]:[&_[data-wizard-pad]]:px-12',
                    className
                )}
                onKeyDown={onWizardKeyDown}
            >
                <section className="relative m-0 box-border flex h-full flex-col p-0">
                    {navigation}
                    <div
                        ref={wrapper}
                        data-wizard-scroll=""
                        className="relative min-h-0 overflow-auto scrollbar-sap"
                        style={{ height: contentHeight ?? autoHeight ?? undefined }}
                        onScroll={onScroll}
                    >
                        {shownSteps.map((step, index) => (
                            // the last content fills the scrolling area, so scrolling can reach it
                            <div
                                key={step.id}
                                ref={slotRef(step.key)}
                                className={
                                    index === shownSteps.length - 1
                                        ? 'flex min-h-full flex-col [&>section]:flex-1'
                                        : undefined
                                }
                            />
                        ))}
                    </div>
                    {rest}
                </section>
            </div>
        </WizardContext.Provider>
    );
}

export interface WizardNavigationProps extends ComponentProps<'nav'> {}

/** The navigation landmark around the progress bar: a `<nav>` named by its `aria-label` or the wizard's. */
export function WizardNavigation({ className, ...props }: WizardNavigationProps) {
    const wizard = useContext(WizardContext);
    return (
        <nav
            {...props}
            aria-label={props['aria-label'] || wizard?.ariaLabel || undefined}
            className={cn('m-0 block p-0', className)}
        />
    );
}

export interface WizardProgressBarProps extends Omit<ComponentProps<'ul'>, 'role'> {
    /** Horizontal padding: sm 1rem, md and lg 2rem, xl 3rem; none by default. */
    size?: WizardSize | null;
}

/** The bar of steps: a `<ul role="list">` of `WizardStep`s, hidden while the summary replaces the steps. */
export function WizardProgressBar({ size, className, style, ref, ...props }: WizardProgressBarProps) {
    const wizard = useContext(WizardContext);
    const setBar = wizard?.setBar;
    const barRef = useCallback((node: HTMLUListElement | null) => setBar?.(node), [setBar]);
    return (
        <ul
            {...props}
            ref={mergeRefs(barRef, ref)}
            role="list"
            data-wizard-pad=""
            className={cn(
                'relative z-10 m-0 box-border table h-16 w-full table-fixed list-none p-0 pt-4',
                'bg-sap-object-header-background font-sap-font-family text-sap-font-size text-sap-text-color [box-shadow:var(--sapContent_HeaderShadow)]',
                size && SIZE_PADDING[size],
                className
            )}
            style={wizard?.showingSummary ? { ...style, display: 'none' } : style}
        />
    );
}

/** Colours of a step's indicator and label per look. */
const STEP_LOOK: Record<WizardStepStatus, string> = {
    completed:
        '[--wz-bg:var(--sapObjectHeader_Background)] [--wz-border:var(--sapContent_Selected_ForegroundColor)] [--wz-color:var(--sapContent_Selected_ForegroundColor)] [--wz-icon:var(--sapContent_Selected_ForegroundColor)] [--wz-label:var(--sapTextColor)]',
    current:
        '[--wz-bg:var(--sapContent_Selected_ForegroundColor)] hc:[--wz-bg:var(--sapContent_Selected_Background)] [--wz-border:var(--sapContent_Selected_ForegroundColor)] [--wz-color:var(--sapContent_ContrastTextColor)] [--wz-icon:var(--sapContent_ContrastIconColor)] [--wz-label:var(--sapContent_Selected_ForegroundColor)]',
    upcoming:
        '[--wz-bg:var(--sapObjectHeader_Background)] [--wz-border:var(--sapList_BorderColor)] [--wz-color:var(--sapContent_LabelColor)] [--wz-icon:var(--sapContent_LabelColor)] [--wz-label:var(--sapContent_LabelColor)]',
    active: '[--wz-bg:var(--sapActiveColor)] [--wz-border:var(--sapActiveColor)] [--wz-color:var(--sapContent_ContrastTextColor)] [--wz-icon:var(--sapContent_ContrastIconColor)] [--wz-label:var(--sapContent_LabelColor)]'
};

export interface WizardStepProps extends Omit<ComponentProps<'li'>, 'role'> {
    /** Status of the step (controlled); the wizard changes it when steps are clicked or the content scrolls. */
    status?: WizardStepStatus;
    /** Status of the step initially (uncontrolled; default `upcoming`). */
    defaultStatus?: WizardStepStatus;
    /** Called when the wizard changes the status of the step. */
    onStatusChange?: (status: WizardStepStatus) => void;
    /** The steps after this one depend on its input (a dashed connector). */
    branching?: boolean;
    /** Text of the step. */
    label?: string;
    /** Smaller text below the label, e.g. `(Optional)`. */
    optionalText?: string;
    /** The summary at the end: it replaces the steps when it becomes current, unless `displaySummaryStep` is set. */
    isSummary?: boolean;
    /** Name of the step; also of its content when it has no label. */
    'aria-label'?: string;
    /** Role description of the step's button, e.g. `Step`. */
    ariaRoleDescription?: string;
    /** Decides whether a click on the step navigates to it. */
    stepClickValidator?: (visited: boolean, completed: boolean) => boolean | Promise<boolean>;
    /** Called when a click (or Enter or Space) on the visited step navigates to it. */
    onStepClick?: (step: WizardStepInfo) => void;
    /** Called when a step is chosen in the step's indicator (one stacked step, or the list of stacked steps). */
    onStepIndicatorItemClick?: (step: WizardStepInfo) => void;
}

/**
 * A step of the wizard: an `<li>` of the progress bar with its indicator (a `WizardStepIndicator` child), label and
 * connector, and its `WizardContent`, which renders in the wizard's scrolling content. Steps that were visited can be
 * clicked (or chosen with Enter or Space) to go back to them.
 */
export function WizardStep({
    status: statusProp,
    defaultStatus = 'upcoming',
    onStatusChange,
    branching = false,
    label = '',
    optionalText = '',
    isSummary = false,
    'aria-label': ariaLabel,
    ariaRoleDescription,
    stepClickValidator,
    onStepClick,
    onStepIndicatorItemClick,
    id: idProp,
    className,
    style,
    children,
    ref,
    ...props
}: WizardStepProps) {
    const wizard = useContext(WizardContext);
    const autoId = useId();
    const id = idProp ?? `fd-wizard-step-${autoId}`;
    const [key] = useState(() => ({}));
    const element = useRef<HTMLLIElement | null>(null);
    const container = useRef<HTMLSpanElement | null>(null);
    const [hasContent, setHasContent] = useState(false);

    const [ownStatus, setOwnStatus] = useState(defaultStatus);
    const status = statusProp ?? ownStatus;
    const latest = useRef({ status, controlled: statusProp !== undefined, onStatusChange });
    latest.current = { status, controlled: statusProp !== undefined, onStatusChange };

    // visited once current (or completed); completed after being current
    const [track, setTrack] = useState(() => ({
        previous: status,
        visited: status === 'current' || status === 'completed',
        completedAfterCurrent: false
    }));
    if (track.previous !== status) {
        setTrack({
            previous: status,
            visited: track.visited || status === 'current' || status === 'completed',
            completedAfterCurrent:
                track.completedAfterCurrent || (track.previous === 'current' && status === 'completed')
        });
    }
    // the summary completes the steps
    if (wizard?.showingSummary && !isSummary && !track.completedAfterCurrent) {
        setTrack({ ...track, completedAfterCurrent: true });
    }
    const visited = track.visited;
    const isCompleted = status === 'completed' || track.completedAfterCurrent;

    const indicators: ReactNode[] = [];
    const rest: ReactNode[] = [];
    let indicatorProps: WizardStepIndicatorProps | undefined;
    Children.forEach(children, (child) => {
        if (isValidElement(child) && child.type === WizardStepIndicator) {
            indicatorProps ??= child.props as WizardStepIndicatorProps;
            indicators.push(child);
        } else rest.push(child);
    });
    const glyph = indicatorProps?.glyph ?? null;
    const glyphFont = indicatorProps?.glyphFont ?? 'SAP-icons';

    const setStatus = useCallback((next: WizardStepStatus) => {
        const { status: current, controlled, onStatusChange: onChange } = latest.current;
        if (next === current) return;
        latest.current.status = next;
        if (!controlled) setOwnStatus(next);
        onChange?.(next);
    }, []);
    const focusElement = useCallback(() => container.current, []);

    const upsert = wizard?.upsert;
    const remove = wizard?.remove;
    useLayoutEffect(() => {
        if (!upsert || !element.current) return;
        upsert({
            key,
            id,
            element: element.current,
            label,
            status,
            visited,
            completed: isCompleted,
            isSummary,
            branching,
            hasContent,
            glyph,
            glyphFont,
            setStatus,
            focusElement
        });
    }, [
        upsert,
        key,
        id,
        label,
        status,
        visited,
        isCompleted,
        isSummary,
        branching,
        hasContent,
        glyph,
        glyphFont,
        setStatus,
        focusElement
    ]);
    useLayoutEffect(() => () => remove?.(key), [remove, key]);

    const record = wizard?.steps.find((step) => step.key === key);
    const stackedItems = useMemo(() => wizard?.stackedItemsOf(key) ?? [], [wizard, key]);
    /** The indicator lists stacked steps in an action sheet, so the step itself is no button. */
    const listsStacked = stackedItems.length > 1;
    const hiddenSummary = isSummary && !wizard?.displaySummaryStep;
    const reachable = visited || status === 'current';
    const tabbable = !!wizard && wizard.tabbableStep?.key === key;
    const isStacked = !!wizard?.stacked.has(key);
    const stackedTop = wizard?.stackedTop === key;
    const last = wizard?.lastNavStep?.key === key;
    const showConnector = !last || branching;
    const navIndex = wizard?.navSteps.findIndex((step) => step.key === key) ?? -1;

    const report = (callback: ((step: WizardStepInfo) => void) | undefined, step: StepRecord) => {
        callback?.(info(step, wizard?.steps ?? [step]));
    };

    /** Navigates to the step if it was visited and the validator allows it. */
    const activate = async () => {
        if (!visited || stackedItems.length) return;
        if (stepClickValidator && (await stepClickValidator(visited, isCompleted)) !== true) return;
        if (record) report(onStepClick, record);
        wizard?.goToStep(key);
    };

    const stepContext = useMemo<StepContextValue>(
        () => ({
            key,
            id,
            label,
            ariaLabel,
            status,
            branching,
            isCompleted,
            stackedItems,
            setHasContent,
            onIndicatorItemClick: (step) => report(onStepIndicatorItemClick, step)
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key, id, label, ariaLabel, status, branching, isCompleted, stackedItems, onStepIndicatorItemClick, wizard]
    );

    const look = isCompleted && status !== 'current' && status !== 'active' ? 'completed' : status;

    return (
        <StepContext.Provider value={stepContext}>
            <li
                {...props}
                ref={mergeRefs(element, ref)}
                id={id}
                role="listitem"
                aria-label={ariaLabel || undefined}
                data-status={status}
                data-stacked={isStacked || undefined}
                className={cn(
                    'relative m-0 box-content table-cell w-full min-w-[10.5rem] p-0 align-top font-sap-font-family text-sap-font-size',
                    STEP_LOOK[look] ?? STEP_LOOK.upcoming,
                    isStacked && 'w-1 min-w-0 last:pe-[2.375rem]',
                    isStacked && status === 'upcoming' && 'z-(--wz-z)',
                    isStacked && stackedTop && 'w-16 min-w-16',
                    className
                )}
                style={
                    {
                        // stacked upcoming steps overlap: the earlier ones on top
                        ...(navIndex >= 0 ? { '--wz-z': String(Math.max(1, 10 - (navIndex + 1))) } : {}),
                        ...style,
                        ...(hiddenSummary ? { display: 'none' } : {})
                    } as CSSProperties
                }
            >
                <div className="m-0 box-border flex h-8 items-center p-0">
                    {(label || optionalText) && (
                        <span
                            ref={container}
                            data-wizard-step-container=""
                            role={listsStacked ? undefined : 'button'}
                            tabIndex={listsStacked ? undefined : tabbable ? 0 : -1}
                            aria-current={status === 'current' ? 'step' : undefined}
                            aria-disabled={reachable || listsStacked ? undefined : true}
                            aria-roledescription={listsStacked ? undefined : ariaRoleDescription || undefined}
                            className={cn(
                                'm-0 box-border flex min-w-0 cursor-pointer items-center p-0 outline-none focus:outline-sap',
                                !reachable && 'pointer-events-none cursor-default'
                            )}
                            onClick={() => void activate()}
                            onKeyDown={(event) => {
                                if (listsStacked || (event.key !== 'Enter' && event.key !== ' ')) return;
                                event.preventDefault();
                                void activate();
                            }}
                        >
                            {indicators}
                            <span
                                className={cn(
                                    'm-0 box-border flex max-h-8 max-w-full min-w-0 flex-col overflow-hidden p-0 text-sap-content-label-color',
                                    // stacked steps keep their label for assistive technology
                                    isStacked && 'sr-only-sap'
                                )}
                            >
                                <span
                                    className={cn(
                                        'm-0 max-w-full p-0 font-sap-font-bold-family leading-4 font-bold text-(--wz-label) hc:font-sap-font-family hc:font-normal',
                                        optionalText ? 'line-clamp-1 max-h-4' : 'line-clamp-2'
                                    )}
                                >
                                    {label}
                                </span>
                                {optionalText && (
                                    <span className="m-0 line-clamp-1 max-w-full p-0 text-sap-font-small-size text-sap-content-label-color">
                                        {optionalText}
                                    </span>
                                )}
                            </span>
                        </span>
                    )}
                    {rest}
                    {showConnector && (
                        <span
                            data-wizard-connector=""
                            className={cn(
                                'm-2 box-border max-w-full min-w-4 flex-auto border-0 border-b border-solid border-sap-list-border-color p-0',
                                isCompleted && 'border-sap-content-selected-foreground-color',
                                branching && 'border-dashed',
                                isStacked && !stackedTop && 'hidden',
                                // the stacked top step is 4rem wide: its connector takes what the indicator leaves
                                isStacked && stackedTop && 'min-w-0'
                            )}
                        />
                    )}
                </div>
            </li>
        </StepContext.Provider>
    );
}

export interface WizardStepIndicatorProps extends Omit<ComponentProps<'span'>, 'onClick'> {
    /** Glyph of an SAP icon in the indicator, before its children (e.g. a step number). */
    glyph?: string | null;
    /** Icon font of the glyph. */
    glyphFont?: IconFont;
    /** Name of the list of stacked steps (default `Steps`). */
    stackedLabel?: string;
    /** Called when a step is chosen in the indicator. */
    onItemClick?: (step: WizardStepInfo) => void;
}

/**
 * The round indicator of a step, with a glyph or a number. When steps stack on narrow screens, the indicator next to
 * them opens an action sheet that lists them (the visited ones can be chosen).
 */
export function WizardStepIndicator({
    glyph,
    glyphFont = 'SAP-icons',
    stackedLabel = 'Steps',
    onItemClick,
    className,
    children,
    ...props
}: WizardStepIndicatorProps) {
    const wizard = useContext(WizardContext);
    const step = useContext(StepContext);
    const stackedItems = step?.stackedItems ?? [];

    const itemClicked = (target: StepRecord | undefined, event: ReactMouseEvent) => {
        if (!target?.visited) return;
        event.preventDefault();
        event.stopPropagation();
        const steps = wizard?.steps ?? [target];
        onItemClick?.(info(target, steps));
        step?.onIndicatorItemClick(target);
        wizard?.goToStep(target.key);
    };

    const indicatorClass = cn(
        'relative m-0 ms-[0.1875rem] me-2 box-border flex size-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded-[50%] border border-solid p-0',
        'border-(--wz-border) bg-(--wz-bg) font-sap-font-family text-sap-font-size text-(--wz-color)',
        // the selection bar under the current step
        step?.status === 'current' &&
            "after:absolute after:-start-[0.1875rem] after:-bottom-4 after:inline-block after:h-[0.188rem] after:w-[calc(100%+0.375rem)] after:rounded-t-[0.125rem] after:bg-sap-selected-color after:transition-all after:duration-150 after:ease-in after:content-[''] hc:after:h-[0.313rem] hc:after:bg-sap-content-selected-foreground-color",
        className
    );

    const content = (
        <>
            {glyph && (
                <Icon
                    glyph={glyph}
                    font={glyphFont}
                    className="text-sap-font-large-size leading-none text-(--wz-icon)"
                />
            )}
            {children}
        </>
    );

    if (stackedItems.length > 1) {
        return (
            <ActionSheet>
                <ActionSheetControl
                    nativeButton={false}
                    render={<span {...props} className={cn(indicatorClass, 'pointer-events-auto')} />}
                    onClick={(event) => event.stopPropagation()}
                >
                    {content}
                    {/* named by its visible text and the label of the list */}
                    <span className="sr-only-sap">{stackedLabel}</span>
                </ActionSheetControl>
                <ActionSheetBody aria-label={stackedLabel}>
                    {stackedItems.map((item) => (
                        <ActionSheetItem
                            key={item.id}
                            label={item.label}
                            glyph={item.glyph}
                            glyphFont={glyphFont}
                            disabled={!item.visited}
                            isCloseButton
                            onClick={(event) => itemClicked(item, event)}
                        />
                    ))}
                </ActionSheetBody>
            </ActionSheet>
        );
    }

    return (
        <span {...props} className={indicatorClass} onClick={(event) => itemClicked(stackedItems[0], event)}>
            {content}
        </span>
    );
}

export interface WizardContentProps extends ComponentProps<'section'> {
    /** Background of the content area; `--sapBackgroundColor` by default. */
    contentBackground?: WizardContentBackground | null;
    /** Horizontal padding: sm 1rem, md and lg 2rem, xl 3rem; none by default. */
    size?: WizardSize | null;
}

/**
 * The content of a step: a `<section>` (named by the step's label) that renders in the wizard's scrolling content
 * below the progress bar, not inside the step, while the step is shown. Native props go to the section.
 */
export function WizardContent({ contentBackground, size, className, children, ...props }: WizardContentProps) {
    const wizard = useContext(WizardContext);
    const step = useContext(StepContext);
    const setHasContent = step?.setHasContent;
    useLayoutEffect(() => {
        if (!setHasContent) return;
        setHasContent(true);
        return () => setHasContent(false);
    }, [setHasContent]);

    const section = (
        <section
            data-wizard-pad=""
            id={step ? `${step.id}-content` : undefined}
            aria-label={step?.label || step?.ariaLabel || undefined}
            {...props}
            className={cn(
                'm-0 box-border block w-full p-0 pt-4',
                contentBackground === 'solid'
                    ? 'bg-sap-shell-background hc:bg-sap-background-color'
                    : contentBackground === 'list'
                      ? 'bg-sap-group-content-background hc:bg-sap-background-color'
                      : contentBackground === 'transparent'
                        ? 'bg-transparent hc:bg-sap-background-color'
                        : 'bg-sap-background-color',
                size && SIZE_PADDING[size],
                // the last content shown fills the scrolling area
                !!step && wizard?.shownSteps.at(-1)?.key === step.key && 'pb-6',
                className
            )}
        >
            <div className="m-0 box-border rounded-(--sapElement_BorderCornerRadius) bg-sap-group-content-background p-4 font-sap-font-family text-sap-font-size text-sap-text-color">
                {children}
            </div>
        </section>
    );

    // outside a wizard step the content renders in place
    if (!wizard || !step) return section;
    const slot = wizard.slotOf(step.key);
    return slot ? createPortal(section, slot) : null;
}

export interface WizardNextStepProps extends ComponentProps<'div'> {
    /** Floats the button at the bottom of the wizard (above a floating footer). */
    floating?: boolean;
    /** Hides it once its step is completed, except on the last step (default true). */
    canHide?: boolean;
}

/** The place of the button to the next step at the end of a step's content; hidden once the step is completed. */
export function WizardNextStep({ floating = false, canHide = true, className, style, ...props }: WizardNextStepProps) {
    const wizard = useContext(WizardContext);
    const step = useContext(StepContext);
    const hidden =
        !!step &&
        !!wizard &&
        canHide &&
        step.isCompleted &&
        wizard.appendToWizard &&
        step.key !== wizard.lastNavStep?.key &&
        !(step.branching && step.status === 'current');
    return (
        <div
            {...props}
            className={cn('m-0 mt-4 box-border block p-0', floating && 'absolute bottom-14', className)}
            style={hidden ? { ...style, display: 'none' } : style}
        />
    );
}
