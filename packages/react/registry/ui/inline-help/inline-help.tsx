/*
 * Port of @fundamental-ngx/core (inline-help) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { useRender } from '@base-ui/react/use-render';
import {
    cloneElement,
    isValidElement,
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type ReactElement,
    type Ref,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui/icon/icon';
import {
    getPlacement,
    normalizeTriggers,
    popoverArrowClassName,
    popoverSurfaceVariants,
    type Placement,
    type TriggerConfig
} from '@/ui/popover/popover';

/** Hover and focus open the help; leaving the trigger with the pointer or the focus closes it. */
const DEFAULT_TRIGGERS: readonly TriggerConfig[] = [
    { trigger: 'mouseenter', openAction: true, closeAction: false },
    { trigger: 'mouseleave', openAction: false, closeAction: true },
    { trigger: 'focusin', openAction: true, closeAction: false },
    { trigger: 'focusout', openAction: false, closeAction: true }
];
const HOVER_EVENTS = new Set(['mouseenter', 'mouseleave', 'mouseover', 'mouseout']);
const LEAVE_EVENTS = new Set(['focusout', 'mouseleave', 'mouseout']);
/** Size of the popover arrow, also the gap between the trigger and a body with an arrow (0.5rem). */
const ARROW_SIZE = 8;

/**
 * The default trigger, a question-mark icon: the icon colour, a pointer cursor and the SAP focus outline (the
 * classes of Angular's form label help icon). Exported for triggers rendered elsewhere.
 */
export const inlineHelpIconClassName = 'cursor-pointer rounded-[0.25rem] text-sap-content-icon-color focus:outline-sap';

type AnchorProp = BaseTooltip.Positioner.Props['anchor'];
/** Details of an open state change: `reason` (`escape-key`, `outside-press`, ...), `event`, `cancel()`. */
export type InlineHelpOpenChangeDetails = BaseTooltip.Root.ChangeEventDetails;

export interface InlineHelpProps extends Omit<useRender.ComponentProps<'span'>, 'content'> {
    /** The help text, or rich content (Angular's `fdInlineHelp`, a string or a template). */
    content?: ReactNode;
    /** Where the help goes, relative to the trigger (default `bottom`). It flips when there is no room. */
    placement?: Placement;
    /**
     * Events on the trigger that open and close the help (default: hover and focus). A lone trigger (e.g.
     * `['click']`) toggles; with several, even entries open and odd entries close, or pass
     * `{ trigger, openAction, closeAction }`; `[]` leaves it to `open`.
     */
    triggers?: readonly (string | TriggerConfig)[];
    /** Closes the help on a press outside the trigger and the help (default false). */
    closeOnOutsideClick?: boolean;
    /** Closes the help on Escape (default false). */
    closeOnEscapeKey?: boolean;
    /** Hides the arrow (default false). */
    noArrow?: boolean;
    /** Keeps the placement even when the help does not fit. */
    fixedPosition?: boolean;
    /** The help does not open; an open help closes. */
    disabled?: boolean;
    /** Classes for the help body (Angular's `additionalBodyClass`), e.g. another background. */
    bodyClassName?: string;
    /** Element to position the help against, when different from the trigger (Angular's `appendTo`). */
    anchor?: AnchorProp;
    /** Element the help is rendered into (default `document.body`). */
    container?: BaseTooltip.Portal.Props['container'];
    /** Maximum width of the help in px; longer texts wrap. */
    maxWidth?: number | null;
    /** Id of the help body; the screen reader copy of the text gets `<bodyId>-text`. */
    bodyId?: string;
    /** Role of the help body (default `tooltip`). */
    bodyRole?: string;
    /** Whether the help is shown (controlled; Angular's `open()` and `close()`). */
    open?: boolean;
    /** Whether the help is shown initially (uncontrolled). */
    defaultOpen?: boolean;
    /** Called when the help opens or closes. */
    onOpenChange?: (open: boolean) => void;
}

/**
 * Inline help: help text in a small popover with an arrow that opens on hover and focus, on Base UI's Tooltip with
 * the SAP popover surface. It never moves focus. The trigger is a focusable question-mark icon named "Help"; render
 * another element with `render` (an input, a button, ...). The trigger is described by a hidden copy of the text
 * (`aria-describedby`), so screen readers announce the help without opening it.
 *
 * ```tsx
 * <InlineHelp content="Explains the field" />
 * <InlineHelp content="Format: YYYY-MM-DD" placement="right" render={<Input aria-label="Date" />} />
 * ```
 */
export function InlineHelp({
    content,
    placement = 'bottom',
    triggers = DEFAULT_TRIGGERS,
    closeOnOutsideClick = false,
    closeOnEscapeKey = false,
    noArrow = false,
    fixedPosition = false,
    disabled = false,
    bodyClassName,
    anchor,
    container,
    maxWidth = null,
    bodyId: bodyIdProp,
    bodyRole = 'tooltip',
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    render,
    ref,
    ...props
}: InlineHelpProps) {
    const autoId = useId();
    const bodyId = bodyIdProp ?? `fd-inline-help-${autoId}`;
    const textId = `${bodyId}-text`;
    const [openState, setOpenState] = useState(defaultOpen);
    const open = (openProp ?? openState) && !disabled;
    const openRef = useRef(open);
    openRef.current = open;
    const trigger = useRef<HTMLElement | null>(null);
    const body = useRef<HTMLDivElement | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const setOpen = useCallback(
        (next: boolean) => {
            clearTimeout(closeTimer.current);
            if (openRef.current === next || (next && disabled)) return;
            openRef.current = next;
            if (openProp === undefined) setOpenState(next);
            onOpenChange?.(next);
        },
        [openProp, onOpenChange, disabled]
    );
    const closeSoon = useCallback(() => {
        clearTimeout(closeTimer.current);
        // a short delay, so the pointer can move onto the help and back
        closeTimer.current = setTimeout(() => setOpen(false), 100);
    }, [setOpen]);

    // a help disabled while open closes
    useEffect(() => {
        if (disabled && openState) setOpenState(false);
    }, [disabled, openState]);

    const normalized = useMemo(() => normalizeTriggers(triggers), [triggers]);
    const hover = normalized.some((t) => HOVER_EVENTS.has(t.trigger));

    // the trigger events, listened to on the trigger
    useEffect(() => {
        const el = trigger.current;
        if (!el || disabled) return;
        // whether the help was open when the current press started: a click that toggles keeps a help the same
        // press opened by focusing the trigger (a tap on a touch screen focuses, then clicks)
        let openAtPress: boolean | null = null;
        const onPointerDown = () => {
            openAtPress = openRef.current;
        };
        el.addEventListener('pointerdown', onPointerDown, true);
        const offs = normalized.map((t) => {
            const listener = (event: Event) => {
                const related = (event as FocusEvent | MouseEvent).relatedTarget as Node | null;
                // moving within the trigger, or between the trigger and the help, keeps it open
                const within =
                    LEAVE_EVENTS.has(event.type) &&
                    !!related &&
                    (el.contains(related) || !!body.current?.contains(related));
                const pressOpened = event.type === 'click' && openAtPress === false && t.openAction;
                if (event.type === 'click') openAtPress = null;
                if (openRef.current) {
                    if (!t.closeAction || within || pressOpened) return;
                    if (HOVER_EVENTS.has(t.trigger)) closeSoon();
                    else setOpen(false);
                } else if (t.openAction) {
                    setOpen(true);
                }
                if (t.stopPropagation) event.stopImmediatePropagation();
            };
            el.addEventListener(t.trigger, listener);
            return () => el.removeEventListener(t.trigger, listener);
        });
        return () => {
            el.removeEventListener('pointerdown', onPointerDown, true);
            offs.forEach((off) => off());
            clearTimeout(closeTimer.current);
        };
    }, [normalized, setOpen, closeSoon, disabled]);

    // the trigger keeps its own description and adds the help text
    const describe = (own: unknown) => cn(typeof own === 'string' ? own : undefined, textId);
    const renderElement: ReactElement =
        render && isValidElement<Record<string, unknown>>(render)
            ? cloneElement(render, { 'aria-describedby': describe(render.props['aria-describedby']) })
            : ((render as ReactElement | undefined) ?? <Icon glyph="question-mark" />);
    const element = useRender({
        render: renderElement,
        ref: ref ? [trigger, ref as Ref<HTMLElement>] : trigger,
        props: {
            ...(render ? {} : { tabIndex: 0, 'aria-label': 'Help', className: inlineHelpIconClassName }),
            ...props,
            'aria-describedby': describe(props['aria-describedby']),
            'data-slot': 'inline-help'
        }
    });

    const { side, align } = getPlacement(placement);

    return (
        <>
            {element}
            {/* the text for assistive technology: hidden, it still describes the trigger, and adds nothing to
                the name of a label or button around it */}
            <span id={textId} hidden>
                {content}
            </span>
            <BaseTooltip.Root
                open={open}
                onOpenChange={(next, details) => {
                    const target = details.event?.target as Node | null;
                    const allowed =
                        !next &&
                        ((details.reason === 'escape-key' && closeOnEscapeKey) ||
                            // presses on the trigger are not outside: its triggers handle them
                            (details.reason === 'outside-press' &&
                                closeOnOutsideClick &&
                                !(target && trigger.current?.contains(target))));
                    if (!allowed) {
                        details.cancel();
                        return;
                    }
                    setOpen(false);
                }}
            >
                <BaseTooltip.Portal container={container}>
                    <BaseTooltip.Positioner
                        anchor={anchor ?? trigger}
                        side={side}
                        align={align}
                        sideOffset={noArrow ? 0 : ARROW_SIZE}
                        arrowPadding={ARROW_SIZE}
                        collisionAvoidance={
                            fixedPosition ? { side: 'none', align: 'none', fallbackAxisSide: 'none' } : undefined
                        }
                        className="z-[1000]"
                    >
                        <BaseTooltip.Popup
                            ref={body}
                            id={bodyId}
                            role={bodyRole}
                            data-slot="inline-help-body"
                            className={cn(
                                popoverSurfaceVariants({ arrow: !noArrow }),
                                'p-3 text-sap-font-small-size leading-[normal] whitespace-normal',
                                bodyClassName
                            )}
                            style={{ maxWidth: maxWidth != null ? `${maxWidth}px` : undefined }}
                            onMouseEnter={hover ? () => clearTimeout(closeTimer.current) : undefined}
                            onMouseLeave={
                                hover
                                    ? (event) => {
                                          if (!trigger.current?.contains(event.relatedTarget as Node | null))
                                              closeSoon();
                                      }
                                    : undefined
                            }
                        >
                            {!noArrow && <BaseTooltip.Arrow className={popoverArrowClassName} />}
                            {content}
                        </BaseTooltip.Popup>
                    </BaseTooltip.Positioner>
                </BaseTooltip.Portal>
            </BaseTooltip.Root>
        </>
    );
}
