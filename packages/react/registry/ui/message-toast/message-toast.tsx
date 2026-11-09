/*
 * Port of @fundamental-ngx/core (message-toast) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Toast as BaseToast, type ToastObject, type UseToastManagerReturnValue } from '@base-ui/react/toast';
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
    type CSSProperties,
    type ReactElement,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';

/** Corner or edge of the screen where toasts appear; new toasts stack away from it. */
export type MessageToastPlacement =
    'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/** A custom place on the screen, in CSS lengths. */
export interface MessageToastGlobalPosition {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    /** Centres horizontally. */
    center?: boolean;
}

/** Toasts next to an element (Angular's `boundTo` with a CDK connected position), placed by Base UI. */
export interface MessageToastBoundPosition {
    boundTo: Element;
    /** Side of the element the toasts are on (default top); flips to the other side when there is no room. */
    side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
    /** Alignment along that side (default center). */
    align?: 'start' | 'center' | 'end';
    /** Distance from the element, in pixels. */
    sideOffset?: number;
    /** Shift along the side, in pixels. */
    alignOffset?: number;
}

export type MessageToastPosition = MessageToastPlacement | MessageToastGlobalPosition | MessageToastBoundPosition;

/** Options of a toast. Set app-wide defaults with `<MessageToastProvider defaultConfig>`. */
export interface MessageToastConfig<T = unknown> {
    data?: T;
    ariaLabel?: string;
    id?: string;
    /** Where the toast appears (default bottom-center, see `setNewPositionStrategy`). */
    position?: MessageToastPosition;
    /** Time in ms before the toast disappears; 0 keeps it open (default 3000). */
    duration?: number;
    /** Keeps the toast open while the pointer is over it (default true). */
    mousePersist?: boolean;
    /** Slides the toast in and fades it out (default false). */
    animated?: boolean;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    height?: string;
    minHeight?: string;
    maxHeight?: string;
}

const DEFAULT_CONFIG: MessageToastConfig = { duration: 3000, mousePersist: true, animated: false };
const MAX_TIMEOUT = 2 ** 31 - 1;

/** What the toast does to Base UI's store; set when the toast is added. */
interface ToastControls {
    close(): void;
    /** Starts (ms > 0) or stops (0) Base UI's timer, which pauses while the toasts are hovered or focused. */
    setTimeout(ms: number): void;
}

/**
 * Handle of an open toast, from `useMessageToastService().open()` or, inside the toast, `useMessageToastRef()`.
 * `afterOpened` resolves once the toast is shown (after its slide-in), `afterDismissed` once it is gone.
 */
export class MessageToastRef<T = unknown> {
    readonly id: string;
    readonly data: T;
    readonly afterOpened: Promise<void>;
    readonly afterDismissed: Promise<void>;

    #config: MessageToastConfig<T>;
    #controls: ToastControls | null = null;
    #timer: ReturnType<typeof setTimeout> | null = null;
    #opened = false;
    #closing = false;
    #closed = false;
    #resolveOpened!: () => void;
    #resolveDismissed!: () => void;

    constructor(id: string, data: T, config: MessageToastConfig<T>) {
        this.id = id;
        this.data = data;
        this.#config = config;
        this.afterOpened = new Promise((resolve) => (this.#resolveOpened = resolve));
        this.afterDismissed = new Promise((resolve) => (this.#resolveDismissed = resolve));
    }

    /** True from `open()` until `dismiss()` or the end of its duration. */
    get isOpen(): boolean {
        return !this.#closing;
    }

    dismiss(): void {
        if (this.#closing) return;
        this.#closing = true;
        this.#clearOwnTimer();
        this.#controls?.close();
    }

    /** Closes the toast after a time in ms. */
    dismissAfter(duration: number): void {
        if (this.#closing) return;
        const ms = Math.min(Math.max(duration, 0), MAX_TIMEOUT);
        this.#clearOwnTimer();
        if (this.#config.mousePersist) {
            this.#controls?.setTimeout(ms);
        } else {
            // without mousePersist the timer ignores the pointer, so it is not Base UI's (which pauses on hover)
            this.#timer = setTimeout(() => this.dismiss(), ms);
        }
    }

    cancelDismiss(): void {
        this.#clearOwnTimer();
        if (!this.#closing) this.#controls?.setTimeout(0);
    }

    /** @internal */
    _bind(controls: ToastControls): void {
        this.#controls = controls;
    }

    /** @internal Called once the toast is shown: starts its duration. */
    _opened(): void {
        if (this.#opened || this.#closing) return;
        this.#opened = true;
        this.#resolveOpened();
        const duration = this.#config.duration ?? 0;
        if (duration > 0) this.dismissAfter(duration);
    }

    /** @internal Called once the toast is removed (also when Base UI's timer closed it). */
    _dismissed(): void {
        if (this.#closed) return;
        this.#closing = true;
        this.#closed = true;
        this.#clearOwnTimer();
        this.#resolveDismissed();
    }

    /** @internal Base UI closed the toast itself (timer, Escape). */
    _closing(): void {
        this.#closing = true;
        this.#clearOwnTimer();
    }

    #clearOwnTimer(): void {
        if (this.#timer !== null) clearTimeout(this.#timer);
        this.#timer = null;
    }
}

/**
 * What the service opens: a string, a render function that gets the `MessageToastRef` (Angular's template with
 * `let-toast`), or a React element (Angular's component; it reads `useMessageToastRef()`).
 */
export type MessageToastContent<T = unknown> = string | ReactElement | ((ref: MessageToastRef<T>) => ReactNode);

/** Opens message toasts from code: the React form of Angular's `MessageToastService`. */
export interface MessageToastService {
    /** Opens a toast; toasts at the same position stack, bottom positions grow upwards. */
    open<T = unknown>(content: MessageToastContent<T>, config?: MessageToastConfig<T>): MessageToastRef<T>;
    /** Closes all open toasts. */
    hideAll(): void;
    /** Position of toasts opened without a position. */
    setNewPositionStrategy(position: MessageToastPosition): void;
    /** Open toasts, oldest first; a toast counts until it has faded out. */
    readonly toasts: readonly MessageToastRef[];
    readonly openCount: number;
    readonly hasOpenMessageToasts: boolean;
}

interface ToastEntry {
    ref: MessageToastRef<any>;
    content: MessageToastContent<any>;
    config: MessageToastConfig<any>;
    stack: string;
}

type ToastData = { entry: ToastEntry };
type BaseManager = UseToastManagerReturnValue<ToastData>;

let nextId = 0;

class MessageToastServiceStore implements MessageToastService {
    defaults: MessageToastConfig | undefined;
    manager: BaseManager | null = null;
    #defaultPosition: MessageToastPosition = 'bottom-center';
    #toasts: readonly MessageToastRef[] = [];
    #anchors = new WeakMap<Element, string>();
    #listeners = new Set<() => void>();
    #version = 0;

    get toasts(): readonly MessageToastRef[] {
        return this.#toasts;
    }
    get openCount(): number {
        return this.#toasts.length;
    }
    get hasOpenMessageToasts(): boolean {
        return this.#toasts.length > 0;
    }

    open = <T = unknown,>(content: MessageToastContent<T>, config?: MessageToastConfig<T>): MessageToastRef<T> => {
        const manager = this.manager;
        if (!manager) throw new Error('useMessageToastService().open() needs a mounted <MessageToastProvider>');
        const merged = { ...DEFAULT_CONFIG, ...this.defaults, ...config } as MessageToastConfig<T>;
        merged.position ??= this.#defaultPosition;
        const id = merged.id ?? `fd-message-toast-${nextId++}`;
        const data = (typeof content === 'string' ? content : merged.data) as T;
        const ref = new MessageToastRef<T>(id, data, merged);
        const entry: ToastEntry = { ref, content, config: merged, stack: this.#stackKey(merged.position) };
        ref._bind({
            close: () => manager.close(id),
            setTimeout: (timeout) => manager.update(id, { timeout })
        });
        this.#toasts = [...this.#toasts, ref as MessageToastRef];
        // the duration starts once the toast is shown (`_opened`), as Angular's
        manager.add({
            id,
            timeout: 0,
            data: { entry },
            onClose: () => ref._closing(),
            onRemove: () => {
                this.#toasts = this.#toasts.filter((r) => r !== (ref as MessageToastRef));
                ref._dismissed();
                this.#emit();
            }
        });
        this.#emit();
        return ref;
    };

    hideAll = (): void => {
        [...this.#toasts].forEach((ref) => ref.dismiss());
    };

    setNewPositionStrategy = (position: MessageToastPosition): void => {
        this.#defaultPosition = position;
    };

    /** Called when the provider unmounts: its toasts are gone. */
    destroy(): void {
        const refs = this.#toasts;
        this.#toasts = [];
        refs.forEach((ref) => ref._dismissed());
        this.#emit();
    }

    subscribe = (listener: () => void): (() => void) => {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    };
    getVersion = (): number => this.#version;

    /** Toasts with the same placement, the same custom place or the same element share a stack. */
    #stackKey(position: MessageToastPosition): string {
        if (typeof position === 'string') return position;
        if ('boundTo' in position) {
            let key = this.#anchors.get(position.boundTo);
            if (!key) this.#anchors.set(position.boundTo, (key = `bound-${nextId++}`));
            return `${key}:${position.side ?? 'top'}:${position.align ?? 'center'}`;
        }
        const { top, bottom, left, right, center } = position;
        return `global:${JSON.stringify({ top, bottom, left, right, center: !!center })}`;
    }

    #emit(): void {
        this.#version++;
        this.#listeners.forEach((listener) => listener());
    }
}

const MessageToastServiceContext = createContext<MessageToastServiceStore | null>(null);
const MessageToastRefContext = createContext<MessageToastRef<any> | null>(null);

export interface MessageToastProviderProps {
    children?: ReactNode;
    /** App-wide defaults of the toasts (Angular's `provideMessageToastConfig`). */
    defaultConfig?: MessageToastConfig;
    /** Element the toasts are rendered in, instead of `document.body`; they stay fixed on the screen. */
    container?: BaseToast.Portal.Props['container'];
}

/**
 * Renders the toasts opened by `useMessageToastService()` below it, in Base UI's toast viewport (a region named
 * "Notifications"; F6 moves the focus to it). Put it at the root of the app. Unmounting it closes its toasts.
 */
export function MessageToastProvider({ children, defaultConfig, container }: MessageToastProviderProps) {
    const [store] = useState(() => new MessageToastServiceStore());
    store.defaults = defaultConfig;
    useEffect(() => () => store.destroy(), [store]);
    return (
        <MessageToastServiceContext.Provider value={store}>
            {/* no limit: Angular shows every toast */}
            <BaseToast.Provider limit={Number.POSITIVE_INFINITY} timeout={0}>
                <ManagerBridge store={store} />
                {children}
                <BaseToast.Portal container={container}>
                    <BaseToast.Viewport
                        // each toast is its own live region (role alert, polite), as Angular's; the viewport's
                        // would announce it a second time
                        aria-live="off"
                        className="pointer-events-none fixed inset-0 z-[1000] outline-none"
                    >
                        <Stacks />
                    </BaseToast.Viewport>
                </BaseToast.Portal>
            </BaseToast.Provider>
        </MessageToastServiceContext.Provider>
    );
}

/** Hands Base UI's store methods to the service during render, so `open()` works in the first effects. */
function ManagerBridge({ store }: { store: MessageToastServiceStore }) {
    store.manager = BaseToast.useToastManager<ToastData>();
    return null;
}

/**
 * The message toast service of the nearest `MessageToastProvider`; `toasts`, `openCount` and
 * `hasOpenMessageToasts` re-render the component when they change.
 *
 * ```tsx
 * const toasts = useMessageToastService();
 * toasts.open('Order saved', { duration: 5000 });
 * ```
 */
export function useMessageToastService(): MessageToastService {
    const store = useContext(MessageToastServiceContext);
    if (!store) throw new Error('useMessageToastService() needs a <MessageToastProvider> above it');
    useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
    return store;
}

/** The `MessageToastRef` of the toast this component is rendered in (Angular's `inject(MessageToastRef)`). */
export function useMessageToastRef<T = unknown>(): MessageToastRef<T> {
    const ref = useContext(MessageToastRefContext);
    if (!ref) throw new Error('useMessageToastRef() is only available in a toast opened by useMessageToastService()');
    return ref as MessageToastRef<T>;
}

const PLACEMENT: Record<MessageToastPlacement, MessageToastGlobalPosition> = {
    'top-left': { top: '1rem', left: '1rem' },
    'top-center': { top: '1rem', center: true },
    'top-right': { top: '1rem', right: '1rem' },
    'bottom-left': { bottom: '1rem', left: '1rem' },
    'bottom-center': { bottom: '1rem', center: true },
    'bottom-right': { bottom: '1rem', right: '1rem' }
};

type Align = 'start' | 'center' | 'end';
type BaseToastObject = ToastObject<ToastData>;

/** Column of toasts at one position: new toasts are added away from the edge (above the older ones at the bottom). */
const stackClassName = (upwards: boolean, align: Align) =>
    cn(
        'pointer-events-none flex gap-4',
        upwards ? 'flex-col-reverse' : 'flex-col',
        { start: 'items-start', center: 'items-center', end: 'items-end' }[align]
    );

/** The toasts of the viewport, grouped in stacks by position, oldest first. */
function Stacks() {
    const { toasts } = BaseToast.useToastManager<ToastData>();
    const stacks = new Map<string, BaseToastObject[]>();
    for (const toast of [...toasts].reverse()) {
        const entry = toast.data?.entry;
        if (!entry) continue;
        const stack = stacks.get(entry.stack);
        if (stack) stack.push(toast);
        else stacks.set(entry.stack, [toast]);
    }
    return [...stacks].map(([key, items]) => {
        const position = items[0]!.data!.entry.config.position as MessageToastPosition;
        const children = items.map((toast) => <ServiceToast key={toast.id} toast={toast} />);
        if (typeof position === 'object' && 'boundTo' in position) {
            return (
                <BoundStack key={key} position={position} items={items}>
                    {children}
                </BoundStack>
            );
        }
        const global = typeof position === 'string' ? PLACEMENT[position] : position;
        const upwards = !global.top && !!global.bottom;
        const align: Align = global.center ? 'center' : global.right && !global.left ? 'end' : 'start';
        const style: CSSProperties = global.center
            ? { top: global.top, bottom: global.bottom, left: 0, right: 0 }
            : { top: global.top, bottom: global.bottom, left: global.left, right: global.right };
        return (
            <div
                key={key}
                data-message-toast-stack=""
                className={cn('fixed', stackClassName(upwards, align))}
                style={style}
            >
                {children}
            </div>
        );
    });
}

/** A stack next to an element, placed by Base UI's toast positioner (on the oldest toast still showing). */
function BoundStack({
    position,
    items,
    children
}: {
    position: MessageToastBoundPosition;
    items: BaseToastObject[];
    children: ReactNode;
}) {
    const side = position.side ?? 'top';
    const vertical = side === 'top' || side === 'bottom';
    const align: Align = vertical
        ? (position.align ?? 'center')
        : side === 'left' || side === 'inline-start'
          ? 'end'
          : 'start';
    const toast = items.find((t) => t.transitionStatus !== 'ending') ?? items[0]!;
    return (
        <BaseToast.Positioner
            toast={toast}
            anchor={position.boundTo}
            side={side}
            align={position.align ?? 'center'}
            sideOffset={position.sideOffset ?? 0}
            alignOffset={position.alignOffset ?? 0}
            data-message-toast-stack=""
            className={stackClassName(side === 'top', align)}
        >
            {children}
        </BaseToast.Positioner>
    );
}

/** A toast opened by the service: Base UI's toast root with Angular's ARIA, sizes and content. */
function ServiceToast({ toast }: { toast: BaseToastObject }) {
    const { ref, content, config } = toast.data!.entry;
    const element = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let active = true;
        const opened = () => active && ref._opened();
        const node = element.current;
        if (config.animated && node?.getAnimations) {
            // wait for the slide-in, which starts when Base UI removes data-starting-style
            requestAnimationFrame(() => {
                Promise.allSettled(node.getAnimations().map((a) => a.finished)).then(opened);
            });
        } else {
            opened();
        }
        return () => {
            active = false;
        };
    }, [ref, config.animated]);

    const body = typeof content === 'function' ? content(ref) : content;

    return (
        <BaseToast.Root
            toast={toast}
            ref={element}
            // no swipe to dismiss: Angular's toasts close by time or from code
            swipeDirection={[]}
            id={ref.id}
            role="alert"
            aria-live="polite"
            aria-modal={undefined}
            aria-label={config.ariaLabel || undefined}
            tabIndex={-1}
            data-message-toast=""
            style={{
                width: config.width,
                minWidth: config.minWidth,
                maxWidth: config.maxWidth,
                height: config.height,
                minHeight: config.minHeight,
                maxHeight: config.maxHeight
            }}
            className={cn(
                'pointer-events-auto m-0 box-border inline-flex w-auto max-w-60 p-4 outline-none',
                'rounded-sap-element-border-corner-radius bg-sap-indication-color-9-background [box-shadow:var(--sapContent_Lite_Shadow)]',
                'text-center font-sap-font-family text-sap-font-size text-sap-content-contrast-text-color',
                config.animated && [
                    'transition-[opacity,translate] duration-150 ease-[cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none',
                    'data-[starting-style]:translate-y-4 data-[starting-style]:opacity-0',
                    'data-[ending-style]:opacity-0 data-[ending-style]:duration-75 data-[ending-style]:ease-linear'
                ]
            )}
        >
            <MessageToastRefContext.Provider value={ref}>{body}</MessageToastRefContext.Provider>
        </BaseToast.Root>
    );
}
