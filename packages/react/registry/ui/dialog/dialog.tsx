/*
 * Port of fundamental-react (Dialog) and @fundamental-ngx/core (dialog) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useDirection } from '@base-ui/react/direction-provider';
import { useRender } from '@base-ui/react/use-render';
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
    useSyncExternalStore,
    type ComponentProps,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    type ReactElement,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Bar, BarElement, BarLeft, BarMiddle, BarRight, ButtonBar } from '@/ui/bar/bar';
import { BusyIndicator } from '@/ui/busy-indicator/busy-indicator';
import { Button, type ButtonProps } from '@/ui/button/button';
import { Icon } from '@/ui/icon/icon';
import { Title, TitleSizeContext, type HeaderSize, type TitleProps } from '@/ui/title/title';

type DimensionValue = string | number;

/** Position of the dialog window in its backdrop; values are CSS lengths or pixels. */
export interface DialogPosition {
    top?: DimensionValue;
    bottom?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
}

export type DialogDensity = 'cozy' | 'compact';
/** Horizontal padding of the header, body and footer: s 1rem, m and l 2rem, xl 3rem (fundamental-react `size`). */
export type DialogPaddingSize = 's' | 'm' | 'l' | 'xl';

export interface DialogLoadingConfig {
    isLoading: boolean;
    /** Label of the busy indicator, below its dots and as its accessible name. */
    loadingLabel?: string;
    /** Text shown above the busy indicator. */
    loadingContent?: string;
}

/** Details of an open state change: `reason` (`trigger-press`, `escape-key`, `outside-press`, `close-press`, ...). */
export type DialogOpenChangeDetails = BaseDialog.Root.ChangeEventDetails;
/** A handle that connects a `Dialog` with triggers rendered elsewhere, and opens or closes it from code. */
export type DialogHandle<Payload = unknown> = BaseDialog.Handle<Payload>;

/**
 * Creates a handle for a dialog whose trigger lives outside of it, or to open and close it from code.
 *
 * ```tsx
 * const details = createDialogHandle();
 * <DialogTrigger handle={details} render={<Button label="Details" />} />
 * <Dialog handle={details}><DialogPopup>…</DialogPopup></Dialog>
 * ```
 */
export const createDialogHandle: <Payload = unknown>() => DialogHandle<Payload> = BaseDialog.createHandle;

function px(value: DimensionValue | undefined | null): string | undefined {
    return value === undefined || value === null ? undefined : typeof value === 'number' ? `${value}px` : value;
}

function widthToSize(width: number): DialogPaddingSize {
    return width < 599 ? 's' : width < 1023 ? 'm' : width < 1439 ? 'l' : 'xl';
}
const PADDING: Record<DialogPaddingSize, string> = { s: '1rem', m: '2rem', l: '2rem', xl: '3rem' };

/* ------------------------------------------------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------------------------------------------- */

interface DialogRootContextValue {
    fullScreen: boolean;
    setFullScreen: (fullScreen: boolean) => void;
    loading: DialogLoadingConfig;
    hidden: boolean;
    hasBackdrop: boolean;
    focusTrapped: boolean;
}

const DialogRootContext = createContext<DialogRootContextValue | null>(null);

export interface DialogProps<Payload = unknown> {
    children?: BaseDialog.Root.Props<Payload>['children'];
    /** Whether the dialog is open (controlled). */
    open?: boolean;
    /** Whether the dialog is open initially (uncontrolled). */
    defaultOpen?: boolean;
    /** Called when the dialog opens or closes; `details.reason` says why, `details.cancel()` keeps it as it is. */
    onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
    /** Called after the open or close transition has finished. */
    onOpenChangeComplete?: (open: boolean) => void;
    /** Connects triggers outside the dialog and opens or closes it from code, see `createDialogHandle`. */
    handle?: DialogHandle<Payload>;
    /** Imperative `close()` and `unmount()` (Base UI `actionsRef`). */
    actionsRef?: BaseDialog.Root.Props['actionsRef'];
    /** Closes the dialog on Escape (default true). */
    escKeyCloseable?: boolean;
    /** Closes the dialog on a click on the backdrop (default false). */
    backdropClickCloseable?: boolean;
    /** Keeps the focus inside the dialog and returns it when the dialog closes (default true). */
    focusTrapped?: boolean;
    /** Dims the page behind the dialog and blocks it (default true). */
    hasBackdrop?: boolean;
    /** Whether the window fills the screen (controlled). */
    fullScreen?: boolean;
    /** Whether the window fills the screen initially (uncontrolled; back to it when the dialog closes). */
    defaultFullScreen?: boolean;
    /** Called when the full-screen button toggles the window. */
    onFullScreenChange?: (fullScreen: boolean) => void;
    /** Shows a busy indicator at the end of the body (Angular's `dialogRef.loading()`). */
    loading?: boolean | DialogLoadingConfig;
    /** Hides the dialog without closing it (Angular's `dialogRef.hide()`). */
    hidden?: boolean;
}

const NOT_LOADING: DialogLoadingConfig = { isLoading: false };

/**
 * Dialog: a modal window with a header, a scrolling body and a footer, on Base UI's Dialog. It moves the focus into
 * the window, keeps it there and gives it back when the dialog closes; it closes on Escape and, with
 * `backdropClickCloseable`, on a click on the backdrop. The window can be draggable, resizable, full screen,
 * mobile and positioned.
 *
 * `Dialog` renders no element: it holds the state and the options its parts read. Open it with a `DialogTrigger`,
 * the `open` prop, a handle (`createDialogHandle`), or from code with `useDialogService()`.
 *
 * ```tsx
 * <Dialog>
 *     <DialogTrigger render={<Button label="Open" />} />
 *     <DialogPopup width="25rem">
 *         <DialogHeader>
 *             <DialogTitle>Title</DialogTitle>
 *             <DialogCloseButton />
 *         </DialogHeader>
 *         <DialogBody>Content</DialogBody>
 *         <DialogFooter>
 *             <DialogClose render={<ButtonBar variant="emphasized" label="OK" />} />
 *         </DialogFooter>
 *     </DialogPopup>
 * </Dialog>
 * ```
 */
export function Dialog<Payload = unknown>({
    children,
    open,
    defaultOpen,
    onOpenChange,
    onOpenChangeComplete,
    handle,
    actionsRef,
    escKeyCloseable = true,
    backdropClickCloseable = false,
    focusTrapped = true,
    hasBackdrop = true,
    fullScreen: fullScreenProp,
    defaultFullScreen = false,
    onFullScreenChange,
    loading = false,
    hidden = false
}: DialogProps<Payload>) {
    const [ownFullScreen, setOwnFullScreen] = useState(defaultFullScreen);
    const fullScreen = fullScreenProp ?? ownFullScreen;
    const setFullScreen = useCallback(
        (next: boolean) => {
            if (fullScreenProp === undefined) setOwnFullScreen(next);
            onFullScreenChange?.(next);
        },
        [fullScreenProp, onFullScreenChange]
    );
    const loadingState = typeof loading === 'boolean' ? (loading ? { isLoading: true } : NOT_LOADING) : loading;
    // a hidden dialog lets the page be used: no focus trap, no inert page
    const modal = hidden || !focusTrapped ? false : hasBackdrop ? true : 'trap-focus';

    const context = useMemo<DialogRootContextValue>(
        () => ({ fullScreen, setFullScreen, loading: loadingState, hidden, hasBackdrop, focusTrapped }),
        [fullScreen, setFullScreen, loadingState, hidden, hasBackdrop, focusTrapped]
    );

    return (
        <DialogRootContext.Provider value={context}>
            <BaseDialog.Root<Payload>
                open={open}
                defaultOpen={defaultOpen}
                handle={handle}
                actionsRef={actionsRef}
                modal={modal}
                disablePointerDismissal={!backdropClickCloseable || hidden}
                onOpenChange={(next, details) => {
                    if (!next && details.reason === 'escape-key' && !escKeyCloseable) {
                        details.cancel();
                        return;
                    }
                    onOpenChange?.(next, details);
                }}
                onOpenChangeComplete={(next) => {
                    // the next opening starts with the window at its normal size
                    if (!next) setOwnFullScreen(defaultFullScreen);
                    onOpenChangeComplete?.(next);
                }}
            >
                {children}
            </BaseDialog.Root>
        </DialogRootContext.Provider>
    );
}

/**
 * The element that opens the dialog: a `<button>` by default; render your own control with `render`, e.g.
 * `render={<Button label="Open" />}`. Outside of its `Dialog`, connect it with `handle`.
 */
export function DialogTrigger(props: BaseDialog.Trigger.Props) {
    return <BaseDialog.Trigger {...props} />;
}

/** A button inside the window that closes the dialog, e.g. `<DialogClose render={<ButtonBar label="Cancel" />} />`. */
export function DialogClose(props: BaseDialog.Close.Props) {
    return <BaseDialog.Close {...props} />;
}

/** Text that describes the dialog: the window gets `aria-describedby` pointing at it. Renders a `<p>`. */
export function DialogDescription(props: BaseDialog.Description.Props) {
    return <BaseDialog.Description {...props} />;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Window
 * ---------------------------------------------------------------------------------------------------------------- */

/** The dialogs with a backdrop that are open, oldest first: only the oldest dims the page. */
let backdropStack: symbol[] = [];
const stackListeners = new Set<() => void>();
const subscribeStack = (listener: () => void) => {
    stackListeners.add(listener);
    return () => stackListeners.delete(listener);
};
const setStack = (next: symbol[]) => {
    backdropStack = next;
    stackListeners.forEach((listener) => listener());
};

interface DialogWindowContextValue {
    mobile: boolean;
    verticalPadding: boolean;
    horizontalPadding: boolean;
    disablePaddings: boolean;
    responsivePadding: boolean;
    bodyMinHeight: string | undefined;
}

const DialogWindowContext = createContext<DialogWindowContextValue | null>(null);

export interface DialogPopupProps extends Omit<BaseDialog.Popup.Props, 'className' | 'style'> {
    className?: string;
    style?: CSSProperties;
    ref?: Ref<HTMLDivElement>;
    /** Classes for the backdrop that dims the page, e.g. `before:bg-sap-information-background before:opacity-90`. */
    backdropClassName?: string;
    width?: DimensionValue;
    height?: DimensionValue;
    minWidth?: DimensionValue;
    minHeight?: DimensionValue;
    maxWidth?: DimensionValue;
    maxHeight?: DimensionValue;
    /** Places the window instead of centring it. */
    position?: DialogPosition;
    /** Full-screen window for phones; the full-screen button hides. */
    mobile?: boolean;
    /** Keeps the outer spacing and rounded corners of a mobile window. */
    mobileOuterSpacing?: boolean;
    /** The window can be dragged by its header. */
    draggable?: boolean;
    /** The window can be resized from its bottom end corner. */
    resizable?: boolean;
    /** Horizontal paddings that follow the window width (1rem, 2rem or 3rem). */
    responsivePadding?: boolean;
    /** A fixed horizontal padding size (fundamental-react `size`): s 1rem, m and l 2rem, xl 3rem. */
    size?: DialogPaddingSize | null;
    /** Vertical padding of the body (default true). */
    verticalPadding?: boolean;
    /** Horizontal padding of the body (default true). */
    horizontalPadding?: boolean;
    /** No paddings around the body content. */
    disablePaddings?: boolean;
    /** Minimum height of the body. */
    bodyMinHeight?: string;
    /** Forces a density inside the dialog. */
    contentDensity?: DialogDensity | null;
    /** Element the dialog is rendered into (default `document.body`). */
    container?: BaseDialog.Portal.Props['container'];
    /** Keeps the dialog in the DOM while closed (hidden). */
    keepMounted?: boolean;
}

/** Defaults for the props of the `DialogPopup` inside, set by the dialog service from its config. */
const DialogPopupDefaultsContext = createContext<Partial<DialogPopupProps>>({});

function defined<T extends object>(props: T): Partial<T> {
    return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) as Partial<T>;
}

/**
 * The dialog window, in a portal over a backdrop that dims the page: the SAP dialog surface with its header, body
 * and footer as children. `role="dialog"` with `aria-modal`, labelled by its `DialogTitle` (or `aria-label`,
 * `aria-labelledby`) and described by `DialogDescription` (or `aria-describedby`); `role="alertdialog"` for alerts.
 * Native props, `className` (Angular's `dialogPanelClass`) and `ref` go to the window.
 */
export function DialogPopup(props: DialogPopupProps) {
    const defaults = useContext(DialogPopupDefaultsContext);
    const { container, keepMounted, ...rest } = { ...defaults, ...defined(props) };
    const className = cn(defaults.className, props.className);
    return (
        <BaseDialog.Portal container={container} keepMounted={keepMounted}>
            <DialogWindow {...rest} targeted={!!container} className={className} />
        </BaseDialog.Portal>
    );
}

const ROOT_DEFAULTS: DialogRootContextValue = {
    fullScreen: false,
    setFullScreen: () => undefined,
    loading: NOT_LOADING,
    hidden: false,
    hasBackdrop: true,
    focusTrapped: true
};

const INTERACTIVE = 'button, input, textarea, select, a[href], [contenteditable]:not([contenteditable="false"])';

/** Mounted while the dialog is open: backdrop, viewport and window, and the drag and resize state of one opening. */
function DialogWindow({
    backdropClassName,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    position,
    mobile = false,
    mobileOuterSpacing = false,
    draggable: draggableProp = false,
    resizable: resizableProp = false,
    responsivePadding = false,
    size,
    verticalPadding = true,
    horizontalPadding = true,
    disablePaddings = false,
    bodyMinHeight,
    contentDensity,
    initialFocus,
    className,
    style,
    ref,
    children,
    onPointerDown,
    targeted,
    ...props
}: Omit<DialogPopupProps, 'container' | 'keepMounted'> & { targeted: boolean }) {
    const root = useContext(DialogRootContext) ?? ROOT_DEFAULTS;
    const { fullScreen, hidden, hasBackdrop, focusTrapped } = root;
    const direction = useDirection();
    const windowEl = useRef<HTMLDivElement | null>(null);
    const viewportEl = useRef<HTMLDivElement | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [pinned, setPinned] = useState<{ top: string; left?: string; right?: string } | null>(null);
    const [resized, setResized] = useState<{ width: string; height: string } | null>(null);
    const [paddingSize, setPaddingSize] = useState<DialogPaddingSize | null>(null);
    const full = mobile || fullScreen;
    const draggable = draggableProp && !full;
    const resizable = resizableProp && !full;

    // only the oldest open dialog dims the page, so stacked dialogs keep one block layer
    const [key] = useState(() => Symbol('dialog'));
    useLayoutEffect(() => {
        if (!hasBackdrop) return;
        setStack([...backdropStack, key]);
        return () => setStack(backdropStack.filter((k) => k !== key));
    }, [hasBackdrop, key]);
    const dims = useSyncExternalStore(
        subscribeStack,
        () => hasBackdrop && backdropStack[0] === key,
        () => hasBackdrop
    );

    // horizontal paddings that follow the window width
    useEffect(() => {
        const el = windowEl.current;
        if (!responsivePadding || !el) return;
        const observer = new ResizeObserver(([entry]) => setPaddingSize(widthToSize(entry!.contentRect.width)));
        observer.observe(el);
        return () => observer.disconnect();
    }, [responsivePadding]);
    const padding = size ? PADDING[size] : responsivePadding && paddingSize ? PADDING[paddingSize] : undefined;

    /** Drags the window by its header, inside the viewport. */
    const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        const el = windowEl.current;
        const viewport = viewportEl.current;
        const target = event.target as Element;
        if (!draggable || !el || !viewport || event.button !== 0) return;
        const header = target.closest('[data-dialog-header]');
        if (!header || !el.contains(header) || target.closest(INTERACTIVE)) return;
        event.preventDefault();
        const start = { x: event.clientX, y: event.clientY };
        const base = offset;
        const rect = el.getBoundingClientRect();
        const bounds = viewport.getBoundingClientRect();
        const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
        const move = (e: PointerEvent) => {
            setDragging(true);
            setOffset({
                x: base.x + clamp(e.clientX - start.x, bounds.left - rect.left, bounds.right - rect.right),
                y: base.y + clamp(e.clientY - start.y, bounds.top - rect.top, bounds.bottom - rect.bottom)
            });
        };
        const stop = () => {
            setDragging(false);
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', stop);
            document.removeEventListener('pointercancel', stop);
        };
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', stop);
        document.addEventListener('pointercancel', stop);
    };

    /** Resizes from the bottom end corner; the window is pinned to its current place first. */
    const startResize = (event: ReactPointerEvent<HTMLSpanElement>) => {
        const el = windowEl.current;
        const viewport = viewportEl.current;
        if (!el || !viewport) return;
        event.preventDefault();
        event.stopPropagation();
        const host = viewport.getBoundingClientRect();
        const start = el.getBoundingClientRect();
        const rtl = getComputedStyle(el).direction === 'rtl';
        setOffset({ x: 0, y: 0 });
        setPinned(
            rtl
                ? { top: `${start.top - host.top}px`, right: `${host.right - start.right}px` }
                : { top: `${start.top - host.top}px`, left: `${start.left - host.left}px` }
        );
        const handle = event.currentTarget;
        handle.setPointerCapture?.(event.pointerId);
        const move = (e: PointerEvent) => {
            const dx = rtl ? start.left - e.clientX : e.clientX - start.right;
            const maxW = rtl ? start.right - host.left : host.right - start.left;
            const w = Math.min(Math.max(start.width + dx, 0), maxW);
            const h = Math.min(Math.max(start.height + e.clientY - start.bottom, 0), host.bottom - start.top);
            setResized({ width: `${w}px`, height: `${h}px` });
        };
        const stop = () => {
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', stop);
            handle.removeEventListener('pointercancel', stop);
        };
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', stop);
        handle.addEventListener('pointercancel', stop);
    };

    const placed = !!position && !full;
    const sized = resized && !fullScreen ? resized : { width: px(width), height: px(height) };

    const windowContext = useMemo<DialogWindowContextValue>(
        () => ({ mobile, verticalPadding, horizontalPadding, disablePaddings, responsivePadding, bodyMinHeight }),
        [mobile, verticalPadding, horizontalPadding, disablePaddings, responsivePadding, bodyMinHeight]
    );

    return (
        <>
            {dims && (
                <BaseDialog.Backdrop
                    forceRender
                    data-dialog-backdrop=""
                    className={cn(
                        'fixed inset-0 z-[999]',
                        "before:absolute before:inset-0 before:bg-sap-block-layer-background before:opacity-(--sapBlockLayer_Opacity) before:content-['']",
                        'transition-opacity duration-150 ease-[cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none',
                        'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[ending-style]:duration-75 data-[ending-style]:ease-[cubic-bezier(0.4,0,1,1)]',
                        hidden && 'hidden',
                        backdropClassName
                    )}
                />
            )}
            <BaseDialog.Viewport
                ref={viewportEl}
                data-density={contentDensity || undefined}
                // a portal leaves the subtree of a DirectionProvider: keep its direction
                dir={direction === 'rtl' ? 'rtl' : undefined}
                className={cn(
                    'm-0 box-border p-0 font-sap-font-family text-sap-font-size text-sap-text-color',
                    hasBackdrop
                        ? 'fixed inset-0 z-[999] flex items-center justify-center'
                        : targeted || !!position
                          ? 'relative inline-block'
                          : 'fixed start-1/2 top-1/2 z-[1000] block -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2',
                    hidden && 'hidden'
                )}
            >
                <DialogWindowContext.Provider value={windowContext}>
                    <BaseDialog.Popup
                        aria-modal={hasBackdrop || focusTrapped ? true : undefined}
                        aria-description={props['aria-description'] ?? (resizable ? 'Resizable' : undefined)}
                        {...props}
                        ref={(node: HTMLDivElement | null) => {
                            windowEl.current = node;
                            if (typeof ref === 'function') return ref(node);
                            if (ref) ref.current = node;
                        }}
                        // without a focus trap the window itself takes the focus
                        initialFocus={initialFocus ?? (focusTrapped ? undefined : windowEl)}
                        onPointerDown={(event) => {
                            onPointerDown?.(event);
                            startDrag(event);
                        }}
                        className={cn(
                            'relative m-0 box-border flex flex-col p-0 outline-none [--dlg-px:1rem]',
                            'min-w-80 min-h-[7.5rem] max-w-[calc(100vw_-_10%)] max-h-[calc(100vh_-_6%)]',
                            // the shadow token on its own: the shadow-* utility adds Tailwind's transparent ring layers
                            'rounded-sap-element-border-corner-radius [box-shadow:var(--sapContent_Shadow3)]',
                            'transition-opacity duration-150 ease-[cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none',
                            'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[ending-style]:duration-75 data-[ending-style]:ease-[cubic-bezier(0.4,0,1,1)]',
                            !resizable && 'overflow-hidden',
                            full &&
                                'fixed! inset-0! size-full! min-w-full! max-w-full! min-h-full! max-h-full! translate-none! rounded-none',
                            full && '[&_[data-dialog-bar]]:rounded-none [&_[data-dialog-body]]:rounded-none',
                            // the full-size minimums give way to the maximums, and the margin centres the window
                            mobile &&
                                mobileOuterSpacing &&
                                'm-auto! rounded-sap-element-border-corner-radius min-w-0! min-h-0! max-w-[calc(100vw_-_10%)]! max-h-[calc(100vh_-_6%)]!',
                            draggable &&
                                (dragging
                                    ? 'hover:[&_[data-dialog-header]]:cursor-grabbing'
                                    : 'hover:[&_[data-dialog-header]]:cursor-grab'),
                            className
                        )}
                        style={{
                            position: pinned || placed ? 'absolute' : undefined,
                            top: pinned ? pinned.top : placed ? px(position.top) : undefined,
                            bottom: pinned ? undefined : placed ? px(position.bottom) : undefined,
                            left: pinned ? pinned.left : placed ? px(position.left) : undefined,
                            right: pinned ? pinned.right : placed ? px(position.right) : undefined,
                            translate: offset.x || offset.y ? `${offset.x}px ${offset.y}px` : undefined,
                            width: sized.width,
                            height: sized.height,
                            minWidth: px(minWidth),
                            minHeight: px(minHeight),
                            maxWidth: px(maxWidth),
                            maxHeight: px(maxHeight),
                            ...(padding ? { ['--dlg-px' as string]: padding } : null),
                            ...style
                        }}
                    >
                        {resizable && (
                            <span
                                role="presentation"
                                aria-hidden="true"
                                data-dialog-resize-handle=""
                                className="absolute -end-2 -bottom-2 z-[1001] flex size-6 cursor-se-resize items-start justify-start overflow-hidden text-[1rem] leading-4 rtl:cursor-sw-resize"
                                onPointerDown={startResize}
                            >
                                <Icon
                                    glyph="resize-corner"
                                    className="size-4 text-sap-button-lite-text-color rtl:-scale-x-100"
                                />
                            </span>
                        )}
                        {children}
                    </BaseDialog.Popup>
                </DialogWindowContext.Provider>
            </BaseDialog.Viewport>
        </>
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Parts
 * ---------------------------------------------------------------------------------------------------------------- */

const BAR = '[--bar-px:var(--dlg-px)] shrink-0';

export interface DialogTitleProps extends Omit<TitleProps, 'render'> {
    /** Heading level (default 2, as fundamental-styles); the size stays the dialog title size (5). */
    level?: HeaderSize;
}

/**
 * The title of the dialog: an SAP title (`<h2>` with the header 5 size by default) that labels the window
 * (`aria-labelledby`). In a `DialogHeader` it goes to the start of the header bar.
 */
export function DialogTitle({ level = 2, headerSize, wrap, twoLineClamp, ...props }: DialogTitleProps) {
    // the id goes to Base UI's title, which names the window with it
    return (
        <BaseDialog.Title
            {...props}
            render={<Title level={level} headerSize={headerSize} wrap={wrap} twoLineClamp={twoLineClamp} />}
        />
    );
}

/** Content of a dialog subheader bar, e.g. a search field: `<DialogSubheader><BarMiddle>…</BarMiddle></DialogSubheader>`. */
export function DialogSubheader({ className, children, ...props }: ComponentProps<'div'>) {
    return (
        <Bar {...props} barDesign="subheader" data-dialog-bar="" className={cn(BAR, className)}>
            {hasBarAreas(children) ? (
                children
            ) : (
                <BarLeft>
                    <BarElement>{children}</BarElement>
                </BarLeft>
            )}
        </Bar>
    );
}

const AREAS: unknown[] = [BarLeft, BarMiddle, BarRight];
function hasBarAreas(children: ReactNode): boolean {
    return Children.toArray(children).some((child) => isValidElement(child) && AREAS.includes(child.type));
}
const isType = (child: ReactNode, type: unknown): child is ReactElement => isValidElement(child) && child.type === type;

/**
 * Header of a dialog: a header bar with the `DialogTitle` (and any other content) at the start and the
 * `DialogFullScreenButton` and `DialogCloseButton` at the end, and a `DialogSubheader` bar below it. Put
 * `BarLeft`/`BarMiddle`/`BarRight` areas directly inside for a custom header. Its title size is 5. Native props go to
 * its element, a `<div>`: a `<header>` would be a banner landmark of the page while the dialog is not modal (use
 * `render={<header />}` where that is wanted).
 */
export function DialogHeader({ render, className, children, ...props }: useRender.ComponentProps<'div'>) {
    const items = Children.toArray(children);
    const subheader = items.filter((child) => isType(child, DialogSubheader));
    const rest = items.filter((child) => !isType(child, DialogSubheader));
    const custom = hasBarAreas(rest);
    const isButton = (child: ReactNode) => isType(child, DialogCloseButton) || isType(child, DialogFullScreenButton);
    const buttons = rest.filter(isButton);
    const start = rest.filter((child) => !isButton(child));
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-dialog-header': '',
            className: cn('block shrink-0', className),
            children: (
                <TitleSizeContext.Provider value={5}>
                    <Bar
                        role="group"
                        data-dialog-bar=""
                        barDesign={subheader.length ? 'header-with-subheader' : 'header'}
                        className={cn(BAR, 'rounded-t-sap-element-border-corner-radius')}
                    >
                        {custom ? (
                            rest
                        ) : (
                            <>
                                <BarLeft>
                                    {/* one element per item, as fundamental-styles; the title truncates */}
                                    {start.map((child, index) => (
                                        <BarElement key={isValidElement(child) ? child.key : index} className="min-w-0">
                                            {child}
                                        </BarElement>
                                    ))}
                                </BarLeft>
                                {buttons.length > 0 && (
                                    <BarRight>
                                        <BarElement>{buttons}</BarElement>
                                    </BarRight>
                                )}
                            </>
                        )}
                    </Bar>
                    {subheader}
                </TitleSizeContext.Provider>
            )
        }
    });
}

export interface DialogBodyProps extends useRender.ComponentProps<'div'> {
    /** No paddings, e.g. for a list that fills the body. */
    disablePaddings?: boolean;
}

/**
 * Scrolling body of a dialog; shows a busy indicator at its end while the dialog is `loading`. Its paddings follow
 * the `DialogPopup` options (`verticalPadding`, `horizontalPadding`, `disablePaddings`, `responsivePadding`, `size`).
 */
export function DialogBody({ disablePaddings, render, className, style, children, ...props }: DialogBodyProps) {
    const options = useContext(DialogWindowContext);
    const loading = useContext(DialogRootContext)?.loading ?? NOT_LOADING;
    const none = disablePaddings ?? options?.disablePaddings ?? false;
    const vertical = options?.verticalPadding ?? true;
    const horizontal = (options?.horizontalPadding ?? true) || !!options?.responsivePadding;
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-dialog-body': '',
            style: { minHeight: options?.bodyMinHeight, ...style },
            className: cn(
                'relative m-0 box-border block grow overflow-auto p-0 scrollbar-sap',
                'bg-sap-group-content-background font-sap-font-family text-sap-font-size text-sap-text-color',
                'rounded-sap-element-border-corner-radius [[data-dialog-header]~&]:rounded-t-none [&:has(~[data-dialog-footer])]:rounded-b-none',
                !none && vertical && 'py-4',
                !none && horizontal && 'px-(--dlg-px)',
                className
            ),
            children: (
                <>
                    {children}
                    {loading.isLoading && (
                        <div data-dialog-loader="" className="mt-6 mb-2 text-center">
                            {loading.loadingContent && (
                                <p className="m-0 mb-4 text-sap-font-size text-sap-text-color">
                                    {loading.loadingContent}
                                </p>
                            )}
                            <BusyIndicator
                                loading
                                size="l"
                                label={loading.loadingLabel}
                                aria-label={loading.loadingLabel || 'Loading'}
                            />
                        </div>
                    )}
                </>
            )
        }
    });
}

/**
 * Footer of a dialog: a footer bar whose buttons go to the end (at least 4rem wide, as decisive buttons). Put
 * `BarLeft`/`BarMiddle`/`BarRight` areas directly inside for a custom footer. Native props go to its element, a
 * `<div>` (a `<footer>` would be a content info landmark of the page while the dialog is not modal).
 */
export function DialogFooter({ render, className, children, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-dialog-footer': '',
            className: cn('block shrink-0', className),
            children: (
                <Bar
                    barDesign="footer"
                    data-dialog-bar=""
                    className={cn(
                        BAR,
                        'overflow-hidden rounded-b-sap-element-border-corner-radius [&_button]:min-w-16'
                    )}
                >
                    {hasBarAreas(children) ? children : <BarRight>{children}</BarRight>}
                </Bar>
            )
        }
    });
}

export interface DialogHeaderButtonProps extends Omit<ButtonProps, 'glyph' | 'label' | 'variant'> {
    /** Cozy size in a mobile dialog; compact otherwise (default: the window's `mobile`). */
    mobile?: boolean;
}

/**
 * Close button for the dialog header: a transparent, compact button with the decline icon, named "Close". It closes
 * the dialog (reason `close-press`) after its own `onClick`.
 */
export function DialogCloseButton({ mobile, title, 'aria-label': ariaLabel, ...props }: DialogHeaderButtonProps) {
    const windowMobile = useContext(DialogWindowContext)?.mobile ?? false;
    const inDialog = useContext(DialogRootContext) !== null;
    const button = (
        <Button
            {...props}
            variant="transparent"
            glyph="decline"
            title={title}
            aria-label={ariaLabel || 'Close'}
            data-density={(mobile ?? windowMobile) ? undefined : 'compact'}
        />
    );
    return inDialog ? <BaseDialog.Close render={button} /> : button;
}

/**
 * Full-screen toggle for the dialog header: a transparent, compact button named "Enter full screen" or "Exit full
 * screen" (or its `title`). It toggles the window after its own `onClick` (unless that calls `preventDefault()`),
 * and hides in a mobile dialog.
 */
export function DialogFullScreenButton({
    mobile,
    title,
    'aria-label': ariaLabel,
    onClick,
    ...props
}: DialogHeaderButtonProps) {
    const root = useContext(DialogRootContext) ?? ROOT_DEFAULTS;
    const windowMobile = useContext(DialogWindowContext)?.mobile ?? false;
    if (windowMobile) return null;
    return (
        <Button
            {...props}
            variant="transparent"
            glyph={root.fullScreen ? 'exit-full-screen' : 'full-screen'}
            title={title}
            aria-label={ariaLabel || title || (root.fullScreen ? 'Exit full screen' : 'Enter full screen')}
            data-density={mobile ? undefined : 'compact'}
            onClick={(event) => {
                onClick?.(event);
                if (!event.defaultPrevented) root.setFullScreen(!root.fullScreen);
            }}
        />
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Service
 * ---------------------------------------------------------------------------------------------------------------- */

/** Reasons a dialog opened by the service is dismissed with. */
export const DialogDismissReason = {
    ESCAPE: 'escape',
    BACKDROP: 'backdrop',
    CLOSE_BUTTON: 'close button',
    NAVIGATION_CHANGE: 'navigation change',
    SERVICE_DESTROYED: 'service destroyed'
} as const;

export type DialogStatus = 'pending' | 'loaded' | 'closed' | 'dismissed';

export interface DialogCloseResult<P> {
    status: 'closed' | 'dismissed';
    /** The result of `close()`. */
    value?: P;
    /** The reason of `dismiss()`. */
    reason?: unknown;
}

/**
 * Handle of a dialog opened by the service, from `useDialogService().open()` or, inside the dialog, `useDialogRef()`.
 * `afterClosed` resolves with the result of `close()` or the reason of `dismiss()`.
 */
export class DialogRef<T = unknown, P = unknown> {
    readonly data: T | undefined;
    readonly afterClosed: Promise<DialogCloseResult<P>>;
    readonly afterLoaded: Promise<void>;

    #status: DialogStatus = 'pending';
    #closeResult: DialogCloseResult<P> | null = null;
    #hidden = false;
    #fullScreen = false;
    #loading: DialogLoadingConfig = NOT_LOADING;
    #version = 0;
    #listeners = new Set<() => void>();
    #resolveClosed!: (result: DialogCloseResult<P>) => void;
    #resolveLoaded!: () => void;

    constructor(data?: T) {
        this.data = data;
        this.afterClosed = new Promise((resolve) => (this.#resolveClosed = resolve));
        this.afterLoaded = new Promise((resolve) => (this.#resolveLoaded = resolve));
    }

    get status(): DialogStatus {
        return this.#status;
    }
    get closeResult(): DialogCloseResult<P> | null {
        return this.#closeResult;
    }
    get isLoaded(): boolean {
        return this.#status !== 'pending';
    }
    get isClosed(): boolean {
        return this.#status === 'closed' || this.#status === 'dismissed';
    }
    get isOpen(): boolean {
        return this.isLoaded && !this.isClosed;
    }
    get isHidden(): boolean {
        return this.#hidden;
    }
    get isFullScreen(): boolean {
        return this.#fullScreen;
    }
    get loadingState(): DialogLoadingConfig {
        return this.#loading;
    }
    get isLoading(): boolean {
        return this.#loading.isLoading;
    }

    close(result?: P): void {
        this.#end({ status: 'closed', value: result });
    }

    dismiss(reason?: unknown): void {
        this.#end({ status: 'dismissed', reason });
    }

    /** Hides the dialog without closing it. */
    hide(isHidden: boolean): void {
        this.#hidden = isHidden;
        this.#emit();
    }

    /** Shows a busy indicator in the dialog body. */
    loading(state: boolean | DialogLoadingConfig): void {
        this.#loading = typeof state === 'boolean' ? { isLoading: state } : state;
        this.#emit();
    }

    toggleFullScreen(): void {
        this.#fullScreen = !this.#fullScreen;
        this.#emit();
    }

    /** Calls `listener` on every change of the state; returns the unsubscribe function. */
    subscribe = (listener: () => void): (() => void) => {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    };

    /** @internal A number that changes with the state, for `useSyncExternalStore`. */
    getVersion = (): number => this.#version;

    /** @internal Marks the dialog as rendered. */
    _loaded(): void {
        if (this.#status !== 'pending') return;
        this.#status = 'loaded';
        this.#resolveLoaded();
        this.#emit();
    }

    #end(result: DialogCloseResult<P>): void {
        if (this.isClosed) return;
        this.#status = result.status;
        this.#closeResult = result;
        this.#emit();
        this.#resolveClosed(result);
    }

    #emit(): void {
        this.#version++;
        this.#listeners.forEach((listener) => listener());
    }
}

/** Options of a dialog opened by the service. Set app-wide defaults with `<DialogProvider defaultConfig>`. */
export interface DialogConfig<T = unknown> {
    id?: string;
    data?: T;
    width?: DimensionValue;
    height?: DimensionValue;
    minWidth?: DimensionValue;
    minHeight?: DimensionValue;
    maxWidth?: DimensionValue;
    maxHeight?: DimensionValue;
    /** Places the window instead of centring it. */
    position?: DialogPosition;
    ariaLabel?: string;
    /** Id of the element that names the dialog; a `DialogTitle` sets it when empty. */
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    /** Dims the page behind the dialog (default true). */
    hasBackdrop?: boolean;
    /** Dismisses the dialog with the reason "backdrop" on a backdrop click (default false). */
    backdropClickCloseable?: boolean;
    /** Classes for the backdrop. */
    backdropClass?: string;
    /** Classes for the dialog window. */
    dialogPanelClass?: string;
    /** Dismisses the dialog with the reason "escape" on Escape (default true). */
    escKeyCloseable?: boolean;
    /** Keeps the focus inside the dialog and restores it when the dialog closes (default true). */
    focusTrapped?: boolean;
    /** Element the dialog is rendered in, instead of `document.body`. */
    container?: HTMLElement | 'body';
    /** Full-screen window for phones. */
    mobile?: boolean;
    /** Keeps the outer spacing and rounded corners of a mobile dialog. */
    mobileOuterSpacing?: boolean;
    verticalPadding?: boolean;
    horizontalPadding?: boolean;
    /** No paddings around the body content. */
    disablePaddings?: boolean;
    /** Horizontal paddings that follow the window width (1rem, 2rem or 3rem). */
    responsivePadding?: boolean;
    bodyMinHeight?: string;
    /** Dismisses the dialog with the reason "navigation change" on history navigation (default true). */
    closeOnNavigation?: boolean;
    /** Forces a density inside the dialog. */
    contentDensity?: DialogDensity;
    /** The window can be dragged by its header. */
    draggable?: boolean;
    /** The window can be resized from its bottom end corner. */
    resizable?: boolean;
}

const DEFAULT_CONFIG: DialogConfig = {
    hasBackdrop: true,
    backdropClickCloseable: false,
    escKeyCloseable: true,
    focusTrapped: true,
    container: 'body',
    verticalPadding: true,
    horizontalPadding: true,
    disablePaddings: false,
    responsivePadding: false,
    closeOnNavigation: true
};

/** Content of a dialog built from an object: title, body and footer buttons. */
export interface DialogDefaultContent {
    title?: ReactNode;
    titleId?: string;
    titleHeadingLevel?: HeaderSize;
    content?: ReactNode;
    contentId?: string;
    subHeader?: ReactNode;
    approveButton?: string;
    approveButtonId?: string;
    approveButtonAriaLabel?: string;
    approveButtonCallback?: () => void;
    cancelButton?: string;
    cancelButtonId?: string;
    cancelButtonAriaLabel?: string;
    cancelButtonCallback?: () => void;
    /** Shows a close button in the header; it is called before the dialog closes. */
    closeButtonCallback?: () => void;
    closeButtonTitle?: string;
    closeButtonAriaLabel?: string;
    /** Shows a full-screen toggle in the header. */
    allowFullScreen?: boolean;
    /** Called when the full-screen toggle is pressed, before the window toggles. */
    fullScreenButtonCallback?: () => void;
    fullScreenExpandButtonText?: string;
    fullScreenMinifyButtonText?: string;
}

/**
 * What the service opens: a render function that gets the `DialogRef` and the config, a React element (e.g. a
 * component that calls `useDialogRef()`), or a `DialogDefaultContent` object. The function or element renders a
 * `DialogPopup`.
 */
export type DialogContent<T = unknown, P = unknown> =
    ((ref: DialogRef<T, P>, config: DialogConfig<T>) => ReactNode) | ReactElement | DialogDefaultContent;

/** Opens dialogs from code: the React form of Angular's `DialogService`. */
export interface DialogService {
    open<T = unknown, P = unknown>(content: DialogContent<T, P>, config?: DialogConfig<T>): DialogRef<T, P>;
    /** Dismisses every open dialog with `reason`. */
    dismissAll(reason?: unknown): void;
    /** Open dialogs, oldest first. */
    readonly dialogs: readonly DialogRef[];
    readonly hasOpenDialogs: boolean;
    readonly openDialogCount: number;
}

interface DialogEntry {
    key: number;
    ref: DialogRef<any, any>;
    content: DialogContent<any, any>;
    config: DialogConfig<any>;
}

class DialogServiceStore implements DialogService {
    defaults: DialogConfig | undefined;
    #dialogs: readonly DialogRef[] = [];
    #entries: readonly DialogEntry[] = [];
    #listeners = new Set<() => void>();
    #version = 0;
    #next = 0;

    get dialogs(): readonly DialogRef[] {
        return this.#dialogs;
    }
    get hasOpenDialogs(): boolean {
        return this.#dialogs.length > 0;
    }
    get openDialogCount(): number {
        return this.#dialogs.length;
    }
    get entries(): readonly DialogEntry[] {
        return this.#entries;
    }

    open = <T = unknown, P = unknown>(content: DialogContent<T, P>, config?: DialogConfig<T>): DialogRef<T, P> => {
        const merged = { ...DEFAULT_CONFIG, ...this.defaults, ...config } as DialogConfig<T>;
        const ref = new DialogRef<T, P>(merged.data);
        const entry: DialogEntry = {
            key: this.#next++,
            ref,
            content: content as DialogEntry['content'],
            config: merged
        };
        this.#dialogs = [...this.#dialogs, ref as DialogRef];
        this.#entries = [...this.#entries, entry];
        const off = ref.subscribe(() => {
            if (!ref.isClosed) return;
            off();
            this.#dialogs = this.#dialogs.filter((r) => r !== (ref as DialogRef));
            this.#emit();
        });
        this.#emit();
        return ref;
    };

    dismissAll = (reason?: unknown): void => {
        [...this.#dialogs].forEach((ref) => ref.dismiss(reason));
    };

    /** Removes a closed dialog once it has faded out. */
    remove(entry: DialogEntry): void {
        this.#entries = this.#entries.filter((e) => e !== entry);
        this.#emit();
    }

    subscribe = (listener: () => void): (() => void) => {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    };
    getVersion = (): number => this.#version;

    #emit(): void {
        this.#version++;
        this.#listeners.forEach((listener) => listener());
    }
}

const DialogServiceContext = createContext<DialogServiceStore | null>(null);
const DialogRefContext = createContext<DialogEntry['ref'] | null>(null);

export interface DialogProviderProps {
    children?: ReactNode;
    /** App-wide defaults of the dialogs opened by `useDialogService()` (Angular's `provideDialogDefaultConfig`). */
    defaultConfig?: DialogConfig;
}

/**
 * Renders the dialogs opened by `useDialogService()` below it: put it at the root of the app, or of a part with its
 * own text direction or density. Unmounting it dismisses its open dialogs ("service destroyed").
 */
export function DialogProvider({ children, defaultConfig }: DialogProviderProps) {
    const [store] = useState(() => new DialogServiceStore());
    store.defaults = defaultConfig;
    useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
    useEffect(() => () => store.dismissAll(DialogDismissReason.SERVICE_DESTROYED), [store]);
    return (
        <DialogServiceContext.Provider value={store}>
            {children}
            {store.entries.map((entry) => (
                <ServiceDialog key={entry.key} entry={entry} onExited={() => store.remove(entry)} />
            ))}
        </DialogServiceContext.Provider>
    );
}

/**
 * The dialog service of the nearest `DialogProvider`: `open(content, config)` returns a `DialogRef`; `dialogs`,
 * `hasOpenDialogs` and `openDialogCount` re-render the component when they change.
 *
 * ```tsx
 * const dialogs = useDialogService();
 * const ref = dialogs.open((ref) => <DialogPopup>…</DialogPopup>, { data, width: '25rem' });
 * const result = await ref.afterClosed; // { status: 'closed', value } or { status: 'dismissed', reason }
 * ```
 */
export function useDialogService(): DialogService {
    const store = useContext(DialogServiceContext);
    if (!store) throw new Error('useDialogService() needs a <DialogProvider> above it');
    useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
    return store;
}

/** The `DialogRef` of the service dialog this component is rendered in (Angular's `inject(DialogRef)`). */
export function useDialogRef<T = unknown, P = unknown>(): DialogRef<T, P> {
    const ref = useContext(DialogRefContext);
    if (!ref) throw new Error('useDialogRef() is only available in a dialog opened by useDialogService()');
    useSyncExternalStore(ref.subscribe, ref.getVersion, ref.getVersion);
    return ref as DialogRef<T, P>;
}

const REASONS: Partial<Record<DialogOpenChangeDetails['reason'], string>> = {
    'escape-key': DialogDismissReason.ESCAPE,
    'outside-press': DialogDismissReason.BACKDROP,
    'close-press': DialogDismissReason.CLOSE_BUTTON
};

function isDefaultContent(content: DialogEntry['content']): content is DialogDefaultContent {
    return typeof content === 'object' && content !== null && !isValidElement(content);
}

/** A dialog opened by the service: the root with the config, the content and the ref's state. */
function ServiceDialog({ entry, onExited }: { entry: DialogEntry; onExited: () => void }) {
    const { ref, config, content } = entry;
    useSyncExternalStore(ref.subscribe, ref.getVersion, ref.getVersion);
    useEffect(() => ref._loaded(), [ref]);

    useEffect(() => {
        if (!config.closeOnNavigation) return;
        const dismiss = () => ref.dismiss(DialogDismissReason.NAVIGATION_CHANGE);
        window.addEventListener('popstate', dismiss);
        window.addEventListener('hashchange', dismiss);
        return () => {
            window.removeEventListener('popstate', dismiss);
            window.removeEventListener('hashchange', dismiss);
        };
    }, [config.closeOnNavigation, ref]);

    const defaults = useMemo<Partial<DialogPopupProps>>(
        () =>
            defined({
                id: config.id,
                'aria-label': config.ariaLabel,
                'aria-labelledby': config.ariaLabelledBy,
                'aria-describedby': config.ariaDescribedBy,
                className: config.dialogPanelClass,
                backdropClassName: config.backdropClass,
                container: config.container === 'body' ? undefined : config.container,
                width: config.width,
                height: config.height,
                minWidth: config.minWidth,
                minHeight: config.minHeight,
                maxWidth: config.maxWidth,
                maxHeight: config.maxHeight,
                position: config.position,
                mobile: config.mobile,
                mobileOuterSpacing: config.mobileOuterSpacing,
                draggable: config.draggable,
                resizable: config.resizable,
                responsivePadding: config.responsivePadding,
                verticalPadding: config.verticalPadding,
                horizontalPadding: config.horizontalPadding,
                disablePaddings: config.disablePaddings,
                bodyMinHeight: config.bodyMinHeight,
                contentDensity: config.contentDensity
            }),
        [config]
    );

    const body =
        typeof content === 'function' ? (
            content(ref, config)
        ) : isDefaultContent(content) ? (
            <DialogDefault content={content} />
        ) : (
            content
        );

    return (
        <DialogRefContext.Provider value={ref}>
            <Dialog
                open={!ref.isClosed}
                onOpenChange={(open, details) => {
                    if (!open) ref.dismiss(REASONS[details.reason] ?? details.reason);
                }}
                onOpenChangeComplete={(open) => {
                    if (!open) onExited();
                }}
                escKeyCloseable={config.escKeyCloseable}
                backdropClickCloseable={config.backdropClickCloseable}
                focusTrapped={config.focusTrapped}
                hasBackdrop={config.hasBackdrop}
                fullScreen={ref.isFullScreen}
                onFullScreenChange={(fullScreen) => {
                    if (fullScreen !== ref.isFullScreen) ref.toggleFullScreen();
                }}
                loading={ref.loadingState}
                hidden={ref.isHidden}
            >
                <DialogPopupDefaultsContext.Provider value={defaults}>{body}</DialogPopupDefaultsContext.Provider>
            </Dialog>
        </DialogRefContext.Provider>
    );
}

/** The dialog rendered for a `DialogDefaultContent` object. */
function DialogDefault({ content: c }: { content: DialogDefaultContent }) {
    const ref = useDialogRef();
    const defaults = useContext(DialogPopupDefaultsContext);
    const id = useId();
    const approve = useRef<HTMLButtonElement | null>(null);
    const contentId = c.contentId || `fd-dialog-default-content-${id}`;
    return (
        <DialogPopup
            aria-describedby={defaults['aria-describedby'] ?? (c.content != null ? contentId : undefined)}
            initialFocus={c.approveButton ? approve : undefined}
        >
            <DialogHeader>
                <DialogTitle id={c.titleId || `fd-dialog-default-title-${id}`} level={c.titleHeadingLevel ?? 2}>
                    {c.title}
                </DialogTitle>
                {c.allowFullScreen && (
                    <DialogFullScreenButton
                        title={
                            (ref.isFullScreen ? c.fullScreenMinifyButtonText : c.fullScreenExpandButtonText) ||
                            undefined
                        }
                        onClick={() => c.fullScreenButtonCallback?.()}
                    />
                )}
                {c.closeButtonCallback && (
                    <DialogCloseButton
                        title={c.closeButtonTitle}
                        aria-label={c.closeButtonAriaLabel}
                        onClick={() => c.closeButtonCallback?.()}
                    />
                )}
                {c.subHeader != null && <DialogSubheader>{c.subHeader}</DialogSubheader>}
            </DialogHeader>
            {c.content != null && <DialogBody id={contentId}>{c.content}</DialogBody>}
            {(c.approveButton || c.cancelButton) && (
                <DialogFooter>
                    {c.approveButton && (
                        <ButtonBar
                            ref={approve}
                            variant="emphasized"
                            id={c.approveButtonId || `fd-dialog-default-approve-${id}`}
                            label={c.approveButton}
                            aria-label={c.approveButtonAriaLabel}
                            onClick={() => c.approveButtonCallback?.()}
                        />
                    )}
                    {c.cancelButton && (
                        <ButtonBar
                            id={c.cancelButtonId || `fd-dialog-default-cancel-${id}`}
                            label={c.cancelButton}
                            aria-label={c.cancelButtonAriaLabel}
                            onClick={() => c.cancelButtonCallback?.()}
                        />
                    )}
                </DialogFooter>
            )}
        </DialogPopup>
    );
}
