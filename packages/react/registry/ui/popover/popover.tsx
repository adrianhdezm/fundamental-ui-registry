/*
 * Port of fundamental-react (Popover) and @fundamental-ngx/core (popover) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Popover as BasePopover } from '@base-ui/react/popover';
import { useRender } from '@base-ui/react/use-render';
import {
    createContext,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useLayoutEffect,
    useState,
    type CSSProperties,
    type KeyboardEvent as ReactKeyboardEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
    type Ref,
    type RefObject
} from 'react';
import { cn, cva } from '@/lib/utils';
import { iconGlyphChar } from '@/ui/icon/icon';
import {
    getPlacement,
    normalizeTriggers,
    type Placement,
    type PlacementAlign,
    type PlacementSide,
    type PopoverFillMode,
    type TriggerConfig
} from './popover-position';

export * from './popover-position';

/** A handle that connects a `Popover` with triggers rendered elsewhere, and opens or closes it from code. */
export type PopoverHandle<Payload = unknown> = BasePopover.Handle<Payload>;
/** Details of an open state change: `reason` (`trigger-press`, `outside-press`, `escape-key`, ...), `event`, `cancel()`. */
export type PopoverOpenChangeDetails = BasePopover.Root.ChangeEventDetails;
type OffsetFunction = Exclude<BasePopover.Positioner.Props['sideOffset'], number | undefined>;
type Offset = number | OffsetFunction;

/**
 * Creates a handle for a popover whose trigger lives outside of it (Angular's `fdPopoverTrigger`), or to open and
 * close a popover from code.
 *
 * ```tsx
 * const details = createPopoverHandle();
 * <PopoverTrigger handle={details} render={<Button label="Details" />} />
 * <Popover handle={details}><PopoverBody>…</PopoverBody></Popover>
 * ```
 */
export const createPopoverHandle: <Payload = unknown>() => PopoverHandle<Payload> = BasePopover.createHandle;

/** Size of the arrow, which is also the gap between the trigger and a body with an arrow (0.5rem). */
const ARROW_SIZE = 8;

interface PopoverContextValue {
    handle: PopoverHandle;
    placement: Placement;
    sideOffset: Offset;
    alignOffset: Offset;
    fixedPosition: boolean;
    anchor: BasePopover.Positioner.Props['anchor'];
    collisionBoundary: BasePopover.Positioner.Props['collisionBoundary'];
    triggers: TriggerConfig[];
    disabled: boolean;
    noArrow: boolean;
    focusTrapped: boolean;
    focusAutoCapture: boolean;
    restoreFocusOnClose: boolean;
    fillControlMode: PopoverFillMode | null;
    maxWidth: number | null;
    disableScrollbar: boolean;
    resizable: boolean;
    /** The page is dimmed behind the body and the trigger raised above it. */
    modal: boolean;
    onClickOutside: ((event: PointerEvent) => void) | undefined;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export interface PopoverProps {
    children?: ReactNode;
    /** Whether the popover is open (controlled). */
    open?: boolean;
    /** Whether the popover is open initially (uncontrolled). */
    defaultOpen?: boolean;
    /** Called when the popover opens or closes; `details.reason` says why, `details.cancel()` keeps the old state. */
    onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
    /** Called after the open or close transition has finished. */
    onOpenChangeComplete?: (open: boolean) => void;
    /** Connects triggers outside the popover and opens or closes it from code, see `createPopoverHandle`. */
    handle?: PopoverHandle;
    /** Preferred placement of the body. It flips to the other side when there is no room, unless `fixedPosition`. */
    placement?: Placement;
    /** Extra distance from the trigger in px, or a function of the anchor and body sizes (Base UI `sideOffset`). */
    sideOffset?: Offset;
    /** Shift along the trigger edge in px, or a function of the anchor and body sizes (Base UI `alignOffset`). */
    alignOffset?: Offset;
    /** Keeps the placement even when the body does not fit. */
    fixedPosition?: boolean;
    /** Element to position the body against, when different from the trigger (Angular's `appendTo`). */
    anchor?: BasePopover.Positioner.Props['anchor'];
    /**
     * The area the body must fit in before it flips (fundamental-react's `flipContainer`): an element, a rectangle
     * or `'clipping-ancestors'` (default: the scroll containers and the viewport).
     */
    collisionBoundary?: BasePopover.Positioner.Props['collisionBoundary'];
    /**
     * Events on the trigger that open and close the popover. `click` (default) toggles on press, Enter and Space;
     * `mouseenter`/`mouseleave` open on hover and close once the pointer leaves trigger and body; any other DOM
     * event (`focusin`, `focusout`, `dblclick`, ...) is listened to on the trigger. A lone trigger toggles; with
     * several, even entries open and odd entries close, or pass `{ trigger, openAction, closeAction }`.
     * `[]` leaves opening to `open` or the handle. Alt+ArrowDown on the trigger always opens.
     */
    triggers?: readonly (string | TriggerConfig)[];
    /** Prevents opening, disables the trigger and closes an open popover. */
    disabled?: boolean;
    /** Hides the arrow (default true, as in fundamental-ngx). */
    noArrow?: boolean;
    /** Closes on a press outside the body and the trigger (default true). */
    closeOnOutsideClick?: boolean;
    /** Closes on Escape (default true). Inside a dialog, Escape closes the popover first. */
    closeOnEscapeKey?: boolean;
    /** Keeps Tab inside the body: it wraps from the last tabbable element to the first (default true). */
    focusTrapped?: boolean;
    /** Moves focus to the first tabbable element of the body when it opens (default true). */
    focusAutoCapture?: boolean;
    /** Returns focus to the trigger when the popover closes (default true). */
    restoreFocusOnClose?: boolean;
    /** Body width relative to the trigger: `at-least` as wide, `equal` exactly as wide, `fit-content` its content. */
    fillControlMode?: PopoverFillMode | null;
    /** Maximum width of the body in px; also caps the width that `fillControlMode` takes from the trigger. */
    maxWidth?: number | null;
    /** Renders the content without the scrolling wrapper. */
    disableScrollbar?: boolean;
    /** Shows a corner handle that resizes the body. */
    resizable?: boolean;
    /** Dims the page behind the body while open, when outside click or Escape cannot close it. */
    applyOverlay?: boolean;
    /** Called on a press outside the open body and its trigger (fundamental-react), also when `closeOnOutsideClick` is false. */
    onClickOutside?: (event: PointerEvent) => void;
    /** Called on Escape while open (fundamental-react), also when `closeOnEscapeKey` is false. */
    onEscapeKey?: (event: KeyboardEvent) => void;
    /** Imperative `close()` and `unmount()` (Base UI `actionsRef`). */
    actionsRef?: BasePopover.Root.Props['actionsRef'];
}

/**
 * Popover: content in an overlay next to its trigger, on Base UI's Popover. The body is placed on the preferred
 * side of the trigger and flips when there is no room; it closes on outside click and Escape, moves focus into the
 * body, keeps Tab inside it and returns focus to the trigger. Alt+ArrowDown opens it from the keyboard.
 *
 * `Popover` renders no element: it holds the state and the options its parts read.
 *
 * ```tsx
 * <Popover placement="bottom-start" noArrow={false}>
 *     <PopoverTrigger render={<Button label="Details" />} />
 *     <PopoverBody aria-label="Details">
 *         <PopoverBodyHeader>…</PopoverBodyHeader>
 *         <div className="p-4">Content</div>
 *         <PopoverBodyFooter>…</PopoverBodyFooter>
 *     </PopoverBody>
 * </Popover>
 * ```
 */
export function Popover({
    children,
    open,
    defaultOpen,
    onOpenChange,
    onOpenChangeComplete,
    handle: handleProp,
    placement = 'bottom-start',
    sideOffset = 0,
    alignOffset = 0,
    fixedPosition = false,
    anchor,
    collisionBoundary,
    triggers = DEFAULT_TRIGGERS,
    disabled = false,
    noArrow = true,
    closeOnOutsideClick = true,
    closeOnEscapeKey = true,
    focusTrapped = true,
    focusAutoCapture = true,
    restoreFocusOnClose = true,
    fillControlMode = null,
    maxWidth = null,
    disableScrollbar = false,
    resizable = false,
    applyOverlay = false,
    onClickOutside,
    onEscapeKey,
    actionsRef
}: PopoverProps) {
    const [ownHandle] = useState(() => createPopoverHandle());
    const handle = handleProp ?? ownHandle;
    const normalized = useMemo(() => normalizeTriggers(triggers), [triggers]);
    const clickTrigger = normalized.some((t) => t.trigger === 'click');
    const modal = applyOverlay && (!closeOnOutsideClick || !closeOnEscapeKey);

    // a popover disabled while open closes
    useEffect(() => {
        if (disabled && handle.isOpen) handle.close();
    }, [disabled, handle]);

    const context = useMemo<PopoverContextValue>(
        () => ({
            handle,
            placement,
            sideOffset,
            alignOffset,
            fixedPosition,
            anchor,
            collisionBoundary,
            triggers: normalized,
            disabled,
            noArrow,
            focusTrapped,
            focusAutoCapture,
            restoreFocusOnClose,
            fillControlMode,
            maxWidth,
            disableScrollbar,
            resizable,
            modal,
            onClickOutside
        }),
        [
            handle,
            placement,
            sideOffset,
            alignOffset,
            fixedPosition,
            anchor,
            collisionBoundary,
            normalized,
            disabled,
            noArrow,
            focusTrapped,
            focusAutoCapture,
            restoreFocusOnClose,
            fillControlMode,
            maxWidth,
            disableScrollbar,
            resizable,
            modal,
            onClickOutside
        ]
    );

    return (
        <PopoverContext.Provider value={context}>
            <BasePopover.Root
                handle={handle}
                open={open === undefined ? undefined : open && !disabled}
                defaultOpen={defaultOpen && !disabled}
                actionsRef={actionsRef}
                onOpenChangeComplete={onOpenChangeComplete}
                onOpenChange={(next, details) => {
                    if (details.reason === 'escape-key') onEscapeKey?.(details.event);
                    const blocked =
                        (next && disabled) ||
                        (details.reason === 'trigger-press' && !clickTrigger) ||
                        // a press outside on a focusable element moves focus out before it is a press
                        (!next &&
                            (details.reason === 'outside-press' || details.reason === 'focus-out') &&
                            !closeOnOutsideClick) ||
                        (!next && details.reason === 'escape-key' && !closeOnEscapeKey);
                    if (blocked) {
                        details.cancel();
                        return;
                    }
                    onOpenChange?.(next, details);
                }}
            >
                {children}
            </BasePopover.Root>
        </PopoverContext.Provider>
    );
}

const DEFAULT_TRIGGERS = ['click'] as const;
const HOVER_EVENTS = new Set(['mouseenter', 'mouseleave']);
/** Events Base UI's trigger handles itself; any other trigger event gets its own listener. */
const BASE_UI_EVENTS = new Set(['click', ...HOVER_EVENTS]);

export interface PopoverTriggerProps extends Omit<BasePopover.Trigger.Props, 'ref'> {
    ref?: Ref<HTMLElement>;
}

/**
 * The element that opens the popover: a `<button>` by default, with `aria-haspopup`, `aria-expanded` and
 * `aria-controls`. Render your own control with `render`, e.g. `render={<Button label="Open" />}`; for an element
 * that is not a button, also pass `nativeButton={false}`: it becomes focusable and opens with Enter and Space.
 *
 * Outside of its `Popover`, connect it with `handle` (see `createPopoverHandle`).
 */
export function PopoverTrigger({
    id: idProp,
    disabled,
    openOnHover,
    delay,
    closeDelay,
    className,
    onKeyDown,
    ref,
    ...props
}: PopoverTriggerProps) {
    const parent = useContext(PopoverContext);
    // a trigger connected by handle to another popover than the one it sits in takes none of its options
    const context = props.handle && parent?.handle !== props.handle ? null : parent;
    const autoId = useId();
    const id = idProp ?? `fd-popover-trigger-${autoId}`;
    const element = useRef<HTMLElement | null>(null);
    const triggers = context?.triggers;
    const hover = !!triggers?.some((t) => HOVER_EVENTS.has(t.trigger));
    const isDisabled = disabled ?? context?.disabled ?? false;

    // trigger events Base UI does not handle (focusin, focusout, dblclick, ...)
    useEffect(() => {
        const el = element.current;
        if (!el || !context || isDisabled) return;
        const { handle } = context;
        const offs = context.triggers
            .filter((t) => !BASE_UI_EVENTS.has(t.trigger))
            .map((t) => {
                const listener = (event: Event) => {
                    if (handle.isOpen) {
                        if (t.closeAction) handle.close();
                    } else if (t.openAction) {
                        handle.open(id);
                    }
                    if (t.stopPropagation) event.stopImmediatePropagation();
                };
                el.addEventListener(t.trigger, listener);
                return () => el.removeEventListener(t.trigger, listener);
            });
        return () => offs.forEach((off) => off());
    }, [context, id, isDisabled]);

    return (
        <BasePopover.Trigger
            {...props}
            ref={(node: HTMLElement | null) => {
                element.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            id={id}
            disabled={isDisabled}
            openOnHover={openOnHover ?? hover}
            delay={delay ?? (hover ? 0 : undefined)}
            closeDelay={closeDelay ?? (hover ? 50 : undefined)}
            className={(state) =>
                cn(
                    // above the dimmed page of a modal popover
                    context?.modal && state.open && 'relative z-[1001]',
                    typeof className === 'function' ? className(state) : className
                )
            }
            onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.key === 'ArrowDown' && event.altKey && context && !isDisabled) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!context.handle.isOpen) context.handle.open(id);
                }
            }}
        />
    );
}

/**
 * The SAP popover surface: background, radius, typography and shadow (a stronger one with an arrow). Exported for
 * the popups of other components (menu, select, ...), so they look like a popover body.
 */
export const popoverSurfaceVariants = cva(
    [
        'relative flex max-h-full max-w-full whitespace-nowrap outline-none',
        'font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color',
        'rounded-sap-popover-border-corner-radius bg-sap-group-content-background transition-all duration-[125ms]'
    ],
    {
        variants: {
            // the shadow token on its own: the shadow-* utility adds Tailwind's transparent ring and inset layers
            arrow: { true: '[box-shadow:var(--sapContent_Shadow2)]', false: '[box-shadow:var(--sapContent_Shadow1)]' }
        },
        defaultVariants: { arrow: false }
    }
);

/**
 * The arrow: two triangles drawn with borders, the outline (`::after`, popover border colour) under the fill
 * (`::before`, body colour). Base UI places it against the trigger centre and sets `data-side` to the side the body
 * is on, so the arrow sits on the opposite edge. Exported for the arrows of other Base UI popups.
 */
export const popoverArrowClassName = [
    'pointer-events-none [--fd-arrow:0.5rem]',
    "before:absolute before:z-[3] before:size-0 before:border-solid before:border-transparent before:content-['']",
    "after:absolute after:z-[2] after:size-0 after:border-solid after:border-transparent after:content-['']",
    // body below the trigger: arrow on its top edge, pointing up
    'data-[side=bottom]:bottom-full data-[side=bottom]:h-(--fd-arrow) data-[side=bottom]:w-[calc(var(--fd-arrow)*2)]',
    'data-[side=bottom]:after:top-0 data-[side=bottom]:after:left-0 data-[side=bottom]:after:border-x-(length:--fd-arrow) data-[side=bottom]:after:border-t-0 data-[side=bottom]:after:border-b-(length:--fd-arrow) data-[side=bottom]:after:border-b-(color:--fdPopover_Border_Color)',
    'data-[side=bottom]:before:top-(--fdPopover_Border_Width) data-[side=bottom]:before:left-(--fdPopover_Border_Width) data-[side=bottom]:before:border-x-[calc(var(--fd-arrow)_-_var(--fdPopover_Border_Width))] data-[side=bottom]:before:border-t-0',
    'data-[side=bottom]:before:border-b-[calc(var(--fd-arrow)_-_var(--fdPopover_Border_Width))] data-[side=bottom]:before:border-b-sap-group-content-background',
    // body above the trigger: arrow on its bottom edge, pointing down
    'data-[side=top]:top-full data-[side=top]:h-(--fd-arrow) data-[side=top]:w-[calc(var(--fd-arrow)*2)]',
    'data-[side=top]:after:top-0 data-[side=top]:after:left-0 data-[side=top]:after:border-x-(length:--fd-arrow) data-[side=top]:after:border-b-0 data-[side=top]:after:border-t-(length:--fd-arrow) data-[side=top]:after:border-t-(color:--fdPopover_Border_Color)',
    'data-[side=top]:before:top-0 data-[side=top]:before:left-(--fdPopover_Border_Width) data-[side=top]:before:border-x-[calc(var(--fd-arrow)_-_var(--fdPopover_Border_Width))] data-[side=top]:before:border-b-0',
    'data-[side=top]:before:border-t-[calc(var(--fd-arrow)_-_var(--fdPopover_Border_Width))] data-[side=top]:before:border-t-sap-group-content-background',
    // body right of the trigger: arrow on its left edge, pointing left
    'data-[side=right]:right-full data-[side=right]:h-[calc(var(--fd-arrow)*2)] data-[side=right]:w-(--fd-arrow)',
    'data-[side=right]:after:top-0 data-[side=right]:after:left-0 data-[side=right]:after:border-y-(length:--fd-arrow) data-[side=right]:after:border-l-0 data-[side=right]:after:border-r-(length:--fd-arrow) data-[side=right]:after:border-r-(color:--fdPopover_Border_Color)',
    'data-[side=right]:before:top-(--fdPopover_Border_Width) data-[side=right]:before:left-(--fdPopover_Border_Width) data-[side=right]:before:border-y-[calc(var(--fd-arrow)_-_var(--fdPopover_Border_Width))] data-[side=right]:before:border-l-0',
    'data-[side=right]:before:border-r-[calc(var(--fd-arrow)_-_var(--fdPopover_Border_Width))] data-[side=right]:before:border-r-sap-group-content-background',
    // body left of the trigger: arrow on its right edge, pointing right
    'data-[side=left]:left-full data-[side=left]:h-[calc(var(--fd-arrow)*2)] data-[side=left]:w-(--fd-arrow)',
    'data-[side=left]:after:top-0 data-[side=left]:after:left-0 data-[side=left]:after:border-y-(length:--fd-arrow) data-[side=left]:after:border-r-0 data-[side=left]:after:border-l-(length:--fd-arrow) data-[side=left]:after:border-l-(color:--fdPopover_Border_Color)',
    'data-[side=left]:before:top-(--fdPopover_Border_Width) data-[side=left]:before:left-0 data-[side=left]:before:border-y-[calc(var(--fd-arrow)_-_var(--fdPopover_Border_Width))] data-[side=left]:before:border-r-0',
    'data-[side=left]:before:border-l-[calc(var(--fd-arrow)_-_var(--fdPopover_Border_Width))] data-[side=left]:before:border-l-sap-group-content-background'
].join(' ');

/** The arrow of a popover body, pointing at the trigger. `PopoverBody` renders it unless `noArrow`. */
export function PopoverArrow({
    className,
    ...props
}: Omit<BasePopover.Arrow.Props, 'className'> & { className?: string }) {
    return <BasePopover.Arrow {...props} className={cn(popoverArrowClassName, className)} />;
}

export interface PopoverBodyProps extends Omit<BasePopover.Popup.Props, 'className' | 'style'> {
    className?: string;
    style?: CSSProperties;
    ref?: Ref<HTMLDivElement>;
    /** Minimum width of the body, e.g. `"25rem"`. */
    minWidth?: string;
    /** Maximum width of the body, e.g. `"32rem"` (the popover's numeric `maxWidth` wins). */
    maxWidth?: string;
    /** Minimum height of the body. */
    minHeight?: string;
    /** Maximum height of the body; the content scrolls between the header and the footer. */
    maxHeight?: string;
    /** Element the body is rendered into (default `document.body`). */
    container?: BasePopover.Portal.Props['container'];
    /** Keeps the body in the DOM while closed (hidden). */
    keepMounted?: boolean;
}

/**
 * The body of the popover, in a portal next to the trigger: the SAP popover surface with an optional arrow, a
 * scrolling wrapper and an optional resize handle. A dialog by default (`role="dialog"`); give it an `aria-label`
 * or `aria-labelledby`, or another `role` (`region`, `menu`, `listbox`, ...). Native props, `className` and `ref`
 * go to the surface element.
 */
export function PopoverBody({ container, keepMounted, ...props }: PopoverBodyProps) {
    const context = useContext(PopoverContext);
    return (
        <BasePopover.Portal container={container} keepMounted={keepMounted}>
            {context?.modal && (
                <BasePopover.Backdrop className="fixed inset-0 z-[1000] bg-(--fdModal_BackgroundColor)" />
            )}
            <PopoverSurface {...props} />
        </BasePopover.Portal>
    );
}

const DEFAULT_OPTIONS: Omit<PopoverContextValue, 'handle'> = {
    placement: 'bottom-start',
    sideOffset: 0,
    alignOffset: 0,
    fixedPosition: false,
    anchor: undefined,
    collisionBoundary: undefined,
    triggers: normalizeTriggers(DEFAULT_TRIGGERS),
    disabled: false,
    noArrow: true,
    focusTrapped: true,
    focusAutoCapture: true,
    restoreFocusOnClose: true,
    fillControlMode: null,
    maxWidth: null,
    disableScrollbar: false,
    resizable: false,
    modal: false,
    onClickOutside: undefined
};

const FOCUSABLE =
    'a[href], area[href], button, input, select, textarea, iframe, summary, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]';

/** Tabbable elements inside `root`, in DOM order. */
function tabbables(root: HTMLElement): HTMLElement[] {
    return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) =>
            el.tabIndex >= 0 &&
            !el.matches(':disabled, [inert], [inert] *') &&
            (typeof el.checkVisibility !== 'function' || el.checkVisibility({ visibilityProperty: true }))
    );
}

/** Mounted while open: positioner, surface and the resize state of one opening. */
function PopoverSurface({
    minWidth,
    maxWidth: maxWidthProp,
    minHeight,
    maxHeight,
    initialFocus,
    finalFocus,
    className,
    style,
    onKeyDown,
    ref,
    children,
    ...props
}: Omit<PopoverBodyProps, 'container' | 'keepMounted'>) {
    const options = useContext(PopoverContext) ?? DEFAULT_OPTIONS;
    const surface = useRef<HTMLDivElement | null>(null);
    const [resized, setResized] = useState<{ width: string; height: string } | null>(null);
    const { side, align } = getPlacement(options.placement);
    const arrow = !options.noArrow;
    const { sideOffset, fillControlMode: fill, maxWidth } = options;
    const fillWidth = maxWidth != null ? `min(var(--anchor-width), ${maxWidth}px)` : 'var(--anchor-width)';

    // fundamental-react's onClickOutside: any press outside the body and its trigger while open
    const { onClickOutside } = options;
    useEffect(() => {
        if (!onClickOutside) return;
        const listener = (event: PointerEvent) => {
            const root = surface.current;
            const target = event.target as Element | null;
            if (!root || !target || root.contains(target)) return;
            if (root.id && target.closest(`[aria-controls="${CSS.escape(root.id)}"]`)) return;
            onClickOutside(event);
        };
        document.addEventListener('pointerdown', listener, true);
        return () => document.removeEventListener('pointerdown', listener, true);
    }, [onClickOutside]);

    /** Keeps Tab inside the body while `focusTrapped`, wrapping at both ends, without focusable guard elements. */
    const trapTab = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Tab' || event.ctrlKey || event.altKey || event.metaKey || !options.focusTrapped) return;
        const root = surface.current;
        if (!root) return;
        const list = tabbables(root);
        if (!list.length) {
            event.preventDefault();
            return;
        }
        const active = document.activeElement;
        const inside = !!active && root.contains(active);
        // tabbable elements the browser would move to from the focused element
        const ahead = inside
            ? list.filter((el) =>
                  event.shiftKey
                      ? el.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING
                      : active.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
              )
            : [];
        if (ahead.length) return;
        event.preventDefault();
        (event.shiftKey ? list[list.length - 1] : list[0]).focus();
    };

    return (
        <BasePopover.Positioner
            side={side}
            align={align}
            sideOffset={
                arrow
                    ? typeof sideOffset === 'function'
                        ? (data) => sideOffset(data) + ARROW_SIZE
                        : sideOffset + ARROW_SIZE
                    : sideOffset
            }
            alignOffset={options.alignOffset}
            anchor={options.anchor}
            collisionBoundary={options.collisionBoundary}
            arrowPadding={ARROW_SIZE}
            collisionAvoidance={
                options.fixedPosition ? { side: 'none', align: 'none', fallbackAxisSide: 'none' } : undefined
            }
            className="z-[1000]"
        >
            <BasePopover.Popup
                {...props}
                ref={(node: HTMLDivElement | null) => {
                    surface.current = node;
                    if (typeof ref === 'function') return ref(node);
                    if (ref) ref.current = node;
                }}
                initialFocus={initialFocus ?? (options.focusAutoCapture ? undefined : false)}
                finalFocus={finalFocus ?? (options.restoreFocusOnClose ? undefined : false)}
                onKeyDown={(event) => {
                    onKeyDown?.(event);
                    trapTab(event);
                }}
                className={cn(popoverSurfaceVariants({ arrow }), className)}
                style={{
                    minWidth: fill === 'at-least' ? fillWidth : minWidth,
                    width: fill === 'equal' ? fillWidth : resized?.width,
                    maxWidth: maxWidth != null ? `${maxWidth}px` : maxWidthProp,
                    minHeight,
                    maxHeight,
                    height: resized?.height,
                    ...style
                }}
                render={(htmlProps, state) => (
                    <div {...htmlProps}>
                        {htmlProps.children}
                        {options.resizable && (
                            <ResizeHandle
                                side={state.side as PlacementSide}
                                align={state.align}
                                surface={surface}
                                onResize={setResized}
                            />
                        )}
                    </div>
                )}
            >
                {arrow && <PopoverArrow />}
                {options.disableScrollbar ? (
                    children
                ) : (
                    <div className="scrollbar-sap relative w-full max-h-full max-w-full overflow-auto rounded-[inherit]">
                        {children}
                    </div>
                )}
            </BasePopover.Popup>
        </BasePopover.Positioner>
    );
}

type Corner = 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';

/** Corner positions; the glyph (pointing to the bottom right) turns with the handle to point at its corner. */
const CORNERS: Record<Corner, string> = {
    'bottom-right': '-right-2 -bottom-2 cursor-se-resize',
    'top-right': '-top-2 -right-2 -rotate-90 cursor-ne-resize',
    'bottom-left': '-bottom-2 -left-2 rotate-90 cursor-sw-resize',
    'top-left': '-top-2 -left-2 rotate-180 cursor-nw-resize'
};

/**
 * The corner of the resize handle, away from the trigger as in fundamental-styles: below or above the trigger it is
 * on the side the body grows to (the inline end, or the start for an `end` alignment); beside the trigger it is on
 * the outer edge, at the bottom (the top for an `end` alignment).
 */
function handleCorner(side: PlacementSide, align: PlacementAlign, rtl: boolean): Corner {
    if (side === 'top' || side === 'bottom') {
        const right = (align === 'end') === rtl;
        return `${side}-${right ? 'right' : 'left'}`;
    }
    return `${align === 'end' ? 'top' : 'bottom'}-${side}`;
}

/** The corner handle of a resizable body: dragging it sets the body width and height (at least 48px). */
function ResizeHandle({
    side,
    align,
    surface,
    onResize
}: {
    side: PlacementSide;
    align: PlacementAlign;
    surface: RefObject<HTMLDivElement | null>;
    onResize: (size: { width: string; height: string }) => void;
}) {
    const self = useRef<HTMLSpanElement | null>(null);
    const [rtl, setRtl] = useState(false);
    useLayoutEffect(() => {
        const parent = self.current?.parentElement;
        if (parent) setRtl(getComputedStyle(parent).direction === 'rtl');
    }, []);
    const corner = handleCorner(side, align, rtl);

    const startResize = (event: ReactPointerEvent<HTMLSpanElement>) => {
        const root = surface.current;
        if (!root) return;
        event.preventDefault();
        const rect = root.getBoundingClientRect();
        // the body grows towards the handle
        const sx = corner.endsWith('left') ? -1 : 1;
        const sy = corner.startsWith('top') ? -1 : 1;
        const { clientX: startX, clientY: startY, pointerId } = event;
        const handle = event.currentTarget;
        handle.setPointerCapture?.(pointerId);
        const move = (e: PointerEvent) => {
            onResize({
                width: `${Math.max(rect.width + (e.clientX - startX) * sx, 48)}px`,
                height: `${Math.max(rect.height + (e.clientY - startY) * sy, 48)}px`
            });
        };
        const stop = () => {
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', stop);
        };
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', stop);
    };

    return (
        <span
            ref={self}
            role="presentation"
            aria-hidden="true"
            // physical corners and rotations: the glyph sits in the top left of the box in either direction
            dir="ltr"
            data-corner={corner}
            data-glyph={iconGlyphChar('resize-corner')}
            className={cn(
                'absolute flex size-6 items-start overflow-hidden text-[1rem] leading-4 text-sap-button-lite-text-color',
                'after:flex after:size-4 after:justify-center after:font-sap-content-icon-font-family after:text-[1rem] after:leading-4 after:content-[attr(data-glyph)]',
                CORNERS[corner]
            )}
            onPointerDown={startResize}
        />
    );
}

/** Sticky header of a popover body, e.g. a header bar; stays in place while the content scrolls. */
export function PopoverBodyHeader({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, className: cn('sticky top-0 z-[6] block', className) }
    });
}

/** Sticky footer of a popover body, e.g. a footer bar with actions; stays in place while the content scrolls. */
export function PopoverBodyFooter({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, className: cn('sticky bottom-0 z-[6] block', className) }
    });
}

/**
 * A heading that labels the body: the body gets `aria-labelledby` pointing at it. Renders an `<h2>`; use
 * `render={<Title level={5} />}` for an SAP title.
 */
export function PopoverTitle(props: BasePopover.Title.Props) {
    return <BasePopover.Title {...props} />;
}

/** A button inside the body that closes the popover, e.g. `<PopoverClose render={<Button label="Cancel" />} />`. */
export function PopoverClose(props: BasePopover.Close.Props) {
    return <BasePopover.Close {...props} />;
}
