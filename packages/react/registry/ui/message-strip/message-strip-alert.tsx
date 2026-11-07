/*
 * Port of @fundamental-ngx/core (message-strip) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useDirection } from '@base-ui/react/direction-provider';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { MessageStrip, type MessageStripProps } from './message-strip';

export type MessageStripAlertPosition = `${'top' | 'bottom'}-${'start' | 'middle' | 'end'}`;

export const MESSAGE_STRIP_ALERT_POSITIONS: MessageStripAlertPosition[] = [
    'top-start',
    'top-middle',
    'top-end',
    'bottom-start',
    'bottom-middle',
    'bottom-end'
];

/** Message strip props of an alert, plus its timer. */
export interface MessageStripAlertStripConfig extends Omit<
    MessageStripProps,
    'children' | 'open' | 'defaultOpen' | 'onOpenChange' | 'autoDismiss' | 'actionsRef' | 'duration'
> {
    /** Milliseconds before the alert dismisses itself; 0 or less keeps it open. Default 10000. */
    duration?: number;
}

export interface OpenMessageStripAlertConfig {
    /** Default top-middle; narrow screens (below 600px) always use the middle. */
    position?: MessageStripAlertPosition;
    /**
     * Content: text, any element (components inside can read the alert with `useMessageStripAlertRef()`), or a
     * function of the alert ref.
     */
    content: ReactNode | ((ref: MessageStripAlertRef) => ReactNode);
    messageStrip?: MessageStripAlertStripConfig;
}

/** Handle of an open alert. */
export class MessageStripAlertRef {
    /** Resolves once, when the alert is dismissed. */
    readonly afterDismissed: Promise<void>;
    private closed = false;
    private resolve!: () => void;
    private readonly onDismiss: (ref: MessageStripAlertRef) => void;

    constructor(onDismiss: (ref: MessageStripAlertRef) => void) {
        this.onDismiss = onDismiss;
        this.afterDismissed = new Promise((resolve) => (this.resolve = resolve));
    }

    /** True once dismissed. */
    get dismissed(): boolean {
        return this.closed;
    }

    dismiss(): void {
        if (this.closed) return;
        this.closed = true;
        this.onDismiss(this);
        this.resolve();
    }
}

export interface MessageStripAlerts {
    /** Opens an alert; the newest is shown first. */
    open(config: OpenMessageStripAlertConfig): MessageStripAlertRef;
    /** Dismisses every open alert. */
    dismissAll(): void;
    /** Open alerts, newest first. */
    openAlerts: MessageStripAlertRef[];
}

interface AlertEntry {
    key: number;
    ref: MessageStripAlertRef;
    config: OpenMessageStripAlertConfig;
}

const AlertsContext = createContext<MessageStripAlerts | null>(null);
const AlertRefContext = createContext<MessageStripAlertRef | null>(null);

/** The alerts of the nearest `MessageStripAlertProvider`. */
export function useMessageStripAlerts(): MessageStripAlerts {
    const alerts = useContext(AlertsContext);
    if (!alerts) throw new Error('useMessageStripAlerts must be used inside a MessageStripAlertProvider');
    return alerts;
}

/** The alert a component is rendered in, or null outside alerts. */
export function useMessageStripAlertRef(): MessageStripAlertRef | null {
    return useContext(AlertRefContext);
}

const NARROW = '(max-width: 599px)';

function useNarrow(): boolean {
    const [narrow, setNarrow] = useState(() => typeof matchMedia === 'function' && matchMedia(NARROW).matches);
    useEffect(() => {
        if (typeof matchMedia !== 'function') return;
        const query = matchMedia(NARROW);
        setNarrow(query.matches);
        const listener = (event: MediaQueryListEvent) => setNarrow(event.matches);
        query.addEventListener('change', listener);
        return () => query.removeEventListener('change', listener);
    }, []);
    return narrow;
}

/**
 * Shows message strips as alerts in fixed layers at the edges of the screen. Wrap the app once; open alerts with
 * `useMessageStripAlerts()`.
 *
 * ```tsx
 * <MessageStripAlertProvider><App /></MessageStripAlertProvider>
 *
 * const alerts = useMessageStripAlerts();
 * const ref = alerts.open({ content: 'Saved', messageStrip: { type: 'success', duration: 5000 } });
 * ref.dismiss();
 * ```
 */
export function MessageStripAlertProvider({ children }: { children?: ReactNode }) {
    const [entries, setEntries] = useState<AlertEntry[]>([]);
    const current = useRef<AlertEntry[]>([]);
    const nextKey = useRef(0);
    const narrow = useNarrow();
    const direction = useDirection();

    const api = useMemo(() => {
        const update = (change: (entries: AlertEntry[]) => AlertEntry[]) => {
            current.current = change(current.current);
            setEntries(current.current);
        };
        return {
            open(config: OpenMessageStripAlertConfig) {
                const ref = new MessageStripAlertRef((closed) => {
                    update((list) => list.filter((entry) => entry.ref !== closed));
                    config.messageStrip?.onDismiss?.();
                });
                update((list) => [{ key: nextKey.current++, ref, config }, ...list]);
                return ref;
            },
            dismissAll() {
                current.current.forEach((entry) => entry.ref.dismiss());
            }
        };
    }, []);

    const value = useMemo<MessageStripAlerts>(
        () => ({ ...api, openAlerts: entries.map((entry) => entry.ref) }),
        [api, entries]
    );

    const groups = new Map<MessageStripAlertPosition, AlertEntry[]>();
    for (const entry of entries) {
        let position = entry.config.position ?? 'top-middle';
        if (narrow) position = position.startsWith('top') ? 'top-middle' : 'bottom-middle';
        groups.set(position, [...(groups.get(position) ?? []), entry]);
    }
    const positions = [...groups.keys()];
    const shared = positions.some((p) => p.startsWith('top')) && positions.some((p) => p.startsWith('bottom'));

    return (
        <AlertsContext.Provider value={value}>
            {children}
            {typeof document !== 'undefined' &&
                [...groups].map(([position, list]) =>
                    createPortal(
                        <AlertLayer
                            key={position}
                            position={position}
                            narrow={narrow}
                            shared={shared}
                            dir={direction}
                            entries={list}
                        />,
                        document.body,
                        position
                    )
                )}
        </AlertsContext.Provider>
    );
}

/** The fixed layer of one screen position. */
function AlertLayer({
    position,
    narrow,
    shared,
    dir,
    entries
}: {
    position: MessageStripAlertPosition;
    narrow: boolean;
    shared: boolean;
    dir: string;
    entries: AlertEntry[];
}) {
    const [vertical, horizontal] = position.split('-');
    return (
        <div
            dir={dir}
            data-message-strip-alerts={position}
            className={cn(
                'fixed z-[1000] flex',
                vertical === 'top' ? 'top-0' : 'bottom-0',
                horizontal === 'middle' ? 'left-1/2 -translate-x-1/2' : horizontal === 'start' ? 'start-0' : 'end-0',
                horizontal === 'middle' && (narrow ? 'w-[90vw]' : 'w-[33.33vw]'),
                narrow ? 'max-w-[90vw]' : 'max-w-[33.33vw]'
            )}
        >
            <div
                className={cn(
                    'scrollbar-sap flex w-full max-w-full flex-col gap-3 overflow-auto p-2',
                    shared ? 'max-h-[calc(50vh_-_1rem)]' : 'max-h-[calc(100vh_-_1rem)]',
                    vertical === 'bottom' && 'flex-col-reverse',
                    horizontal === 'middle' ? 'items-center' : horizontal === 'end' ? 'items-end' : 'items-start'
                )}
            >
                {entries.map((entry) => (
                    <MessageStripAlert key={entry.key} entry={entry} />
                ))}
            </div>
        </div>
    );
}

/** One alert: a message strip announced with role alert. */
function MessageStripAlert({ entry }: { entry: AlertEntry }) {
    const { ref, config } = entry;
    const { duration = 10000, onDismiss: _onDismiss, ...strip } = config.messageStrip ?? {};
    const content = typeof config.content === 'function' ? config.content(ref) : config.content;
    return (
        <div role="alert" className="block w-fit max-w-full">
            <AlertRefContext.Provider value={ref}>
                <MessageStrip
                    {...strip}
                    open
                    autoDismiss={duration > 0}
                    duration={duration}
                    onDismiss={() => ref.dismiss()}
                >
                    {content}
                </MessageStrip>
            </AlertRefContext.Provider>
        </div>
    );
}
