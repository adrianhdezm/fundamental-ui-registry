/*
 * Port of @fundamental-ngx/core (notification) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useDirection } from '@base-ui/react/direction-provider';
import { useRender } from '@base-ui/react/use-render';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    type ReactElement,
    type ReactNode
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui/icon/icon';
import { Link } from '@/ui/link/link';

/* ------------------------------------------------------------------------------------------------------------------
 * Contexts
 * ---------------------------------------------------------------------------------------------------------------- */

interface NotificationContextValue {
    /** The More/Less state of the footer. */
    expanded: boolean;
    setExpanded(expanded: boolean): void;
    /** A title or paragraph is cut off (or the texts are expanded): the footer shows More/Less. */
    autoShowTrigger: boolean;
    /** Registers the id of a title or paragraph (the first one names the notification). */
    register(kind: 'title' | 'paragraph', id: string): () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

/** Where a notification is rendered: in a group list (a list item of level 2), a list (a list item) or alone. */
const NotificationListContext = createContext<'group' | 'list' | null>(null);

interface NotificationGroupContextValue {
    expanded: boolean;
    toggle(): void;
    titleId: string | null;
    listId: string | null;
    register(kind: 'title' | 'list', id: string): () => void;
}

const NotificationGroupContext = createContext<NotificationGroupContextValue | null>(null);

/** Ids registered by the parts, in mount order: returns the first id of each kind and the register function. */
function useRegistry<K extends string>(): [(kind: K) => string | null, (kind: K, id: string) => () => void] {
    const [ids, setIds] = useState<Partial<Record<K, string[]>>>({});
    const register = useCallback((kind: K, id: string) => {
        setIds((all) => ({ ...all, [kind]: [...(all[kind] ?? []), id] }));
        return () =>
            setIds((all) => {
                const list = [...(all[kind] ?? [])];
                const index = list.indexOf(id);
                if (index >= 0) list.splice(index, 1);
                return { ...all, [kind]: list };
            });
    }, []);
    return [(kind: K) => ids[kind]?.[0] ?? null, register];
}

/* ------------------------------------------------------------------------------------------------------------------
 * Service: refs and config
 * ---------------------------------------------------------------------------------------------------------------- */

export interface NotificationCloseResult<P> {
    status: 'closed' | 'dismissed';
    /** The result of `close()`. */
    value?: P;
    /** The reason of `dismiss()`. */
    reason?: unknown;
}

/**
 * Handle of a notification opened by the service, from `useNotificationService().open()` or, inside the
 * notification, `useNotificationRef()`. `afterClosed` resolves with the result of `close()` or the reason of
 * `dismiss()`.
 */
export class NotificationRef<T = unknown, P = unknown> {
    readonly data: T | undefined;
    readonly afterClosed: Promise<NotificationCloseResult<P>>;
    #closed = false;
    #resolve!: (result: NotificationCloseResult<P>) => void;

    constructor(data?: T) {
        this.data = data;
        this.afterClosed = new Promise((resolve) => (this.#resolve = resolve));
    }

    get isClosed(): boolean {
        return this.#closed;
    }

    close(result?: P): void {
        this.#end({ status: 'closed', value: result });
    }

    dismiss(reason?: unknown): void {
        this.#end({ status: 'dismissed', reason });
    }

    /** @internal Called by the service when the notification is closed. */
    _onEnd: (() => void) | null = null;

    #end(result: NotificationCloseResult<P>): void {
        if (this.#closed) return;
        this.#closed = true;
        this.#resolve(result);
        this._onEnd?.();
    }
}

/** Options of a notification opened by the service. */
export interface NotificationConfig<T = unknown> {
    id?: string;
    data?: T;
    /** CSS width of the notification, e.g. `"25rem"`. */
    width?: string;
    ariaLabel?: string | null;
    ariaLabelledBy?: string | null;
    /** Moves the focus into the notification, keeps Tab in it and returns the focus when closed (default true). */
    shouldTrapFocus?: boolean;
    /** Dismisses the notification with the reason "escape" on Escape (default false). */
    escKeyCloseable?: boolean;
}

const NotificationConfigContext = createContext<NotificationConfig | null>(null);
const NotificationRefContext = createContext<NotificationRef<any, any> | null>(null);

/* ------------------------------------------------------------------------------------------------------------------
 * The notification and its parts
 * ---------------------------------------------------------------------------------------------------------------- */

export type NotificationActionKey = 'enter' | 'delete';

export interface NotificationProps extends useRender.ComponentProps<'div'> {
    /** CSS width, e.g. `"25rem"`. */
    width?: string | null;
    selected?: boolean;
    /**
     * Called on Enter and Delete/Backspace on the notification (not from its buttons, links or fields), e.g. to open
     * or remove it (Angular's `actionKeyHandler`).
     */
    onActionKey?: (event: ReactKeyboardEvent<HTMLElement>, key: NotificationActionKey) => void;
}

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isEditable(target: EventTarget | null, host: HTMLElement): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return true;
    const interactive = target.closest('button, a[href], [role="button"], [role="link"]');
    return !!interactive && interactive !== host;
}

/**
 * A notification: an item with a title, a description, footnotes and actions, in a list, a group or a banner opened
 * by `useNotificationService()`. A focusable `<div>` (an `<li>` in a `NotificationList` or `NotificationGroupList`),
 * named by its first title, else its first paragraph. Long titles and paragraphs are clamped to two lines; the
 * footer then shows a More/Less link.
 *
 * ```tsx
 * <Notification>
 *     <NotificationBody>
 *         <NotificationContent>
 *             <NotificationHeader><NotificationTitle unread>New order</NotificationTitle></NotificationHeader>
 *             <NotificationParagraph>Order 4711 was placed.</NotificationParagraph>
 *         </NotificationContent>
 *     </NotificationBody>
 * </Notification>
 * ```
 */
export function Notification({
    width,
    selected = false,
    onActionKey,
    render,
    className,
    style,
    onKeyDown,
    ref,
    children,
    ...props
}: NotificationProps) {
    const list = useContext(NotificationListContext);
    const config = useContext(NotificationConfigContext);
    const notificationRef = useContext(NotificationRefContext);
    const element = useRef<HTMLElement | null>(null);
    const [firstId, register] = useRegistry<'title' | 'paragraph'>();
    const [expanded, setExpanded] = useState(false);
    // set by the check only, as Angular's signal: it stays true while the texts collapse, so the link keeps the focus
    const [autoShowTrigger, setAutoShowTrigger] = useState(false);

    useEffect(() => {
        const root = element.current;
        if (!root) return;
        const check = () => {
            const truncatedNow = [
                root.querySelector<HTMLElement>('[data-nt-title]'),
                root.querySelector<HTMLElement>('[data-nt-paragraph]')
            ].some((el) => !!el && el.scrollHeight > el.clientHeight + 1);
            setAutoShowTrigger(truncatedNow || expanded);
        };
        check();
        const observer = new ResizeObserver(check);
        observer.observe(root);
        return () => observer.disconnect();
    }, [expanded]);

    const context = useMemo<NotificationContextValue>(
        () => ({ expanded, setExpanded, autoShowTrigger, register }),
        [expanded, autoShowTrigger, register]
    );

    const labelledBy = config?.ariaLabelledBy || firstId('title') || firstId('paragraph') || undefined;

    const rendered = useRender({
        render,
        defaultTagName: list ? 'li' : 'div',
        ref: ref ? [ref, element] : element,
        props: {
            tabIndex: 0,
            role: list === 'group' ? 'listitem' : undefined,
            'aria-level': list === 'group' ? 2 : undefined,
            id: config?.id || undefined,
            'aria-label': config?.ariaLabel || undefined,
            'aria-labelledby': labelledBy,
            ...props,
            'data-notification': '',
            'data-selected': selected ? '' : undefined,
            style: { width: width || config?.width || undefined, ...style },
            className: cn(
                'm-0 box-border flex cursor-pointer flex-col p-0 font-sap-font-family text-sap-font-size text-sap-text-color',
                'rounded-sap-tile-border-corner-radius border-(length:--sapList_BorderWidth) border-solid border-sap-list-border-color',
                'bg-sap-list-background enabled-hover:bg-sap-list-hover-background',
                'active:border-sap-list-active-background active:bg-sap-list-selection-background-color',
                'data-selected:border-sap-list-selection-border-color data-selected:bg-sap-list-selection-background-color data-selected:enabled-hover:bg-sap-list-hover-selection-background',
                'focus:outline-sap focus:-outline-offset-4',
                // room for the action buttons next to the title
                'has-[[data-nt-actions]_button]:[&_[data-nt-title]]:pe-8 compact:has-[[data-nt-actions]_button]:[&_[data-nt-title]]:pe-11',
                'has-[[data-nt-actions]_button+button]:[&_[data-nt-title]]:pe-[4.375rem] compact:has-[[data-nt-actions]_button+button]:[&_[data-nt-title]]:pe-[4.875rem]',
                config && '[box-shadow:var(--sapContent_Shadow2)]',
                className
            ),
            onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
                onKeyDown?.(event as ReactKeyboardEvent<HTMLDivElement>);
                if (event.defaultPrevented) return;
                if (event.key === 'Escape' && config?.escKeyCloseable && notificationRef) {
                    event.stopPropagation();
                    notificationRef.dismiss('escape');
                    return;
                }
                if (!onActionKey || isEditable(event.target, event.currentTarget)) return;
                if (event.key === 'Enter') onActionKey(event, 'enter');
                else if (event.key === 'Delete' || event.key === 'Backspace') onActionKey(event, 'delete');
            },
            children: (
                <NotificationListContext.Provider value={null}>
                    <NotificationContext.Provider value={context}>{children}</NotificationContext.Provider>
                </NotificationListContext.Provider>
            )
        }
    });
    return rendered;
}

/** Registers an id with the notification or group above, if any. */
function useRegisterId<K extends string>(
    target: { register(kind: K, id: string): () => void } | null,
    kind: K,
    id: string
): void {
    const register = target?.register;
    useLayoutEffect(() => register?.(kind, id), [register, kind, id]);
}

export interface NotificationTitleProps extends useRender.ComponentProps<'h4'> {
    /** Bold title. */
    unread?: boolean;
}

/** Title of a notification: an `<h4>` (`render` renders another element), bold while unread. */
export function NotificationTitle({ unread = false, id: idProp, render, className, ...props }: NotificationTitleProps) {
    const notification = useContext(NotificationContext);
    const autoId = useId();
    const id = idProp ?? `fd-notification-title-${autoId}`;
    useRegisterId(notification, 'title', id);
    return useRender({
        render,
        defaultTagName: 'h4',
        props: {
            ...props,
            id,
            'data-nt-title': '',
            className: cn(
                'm-0 box-border flex-1 p-0 text-sap-font-header6-size leading-5 text-sap-list-text-color',
                unread ? 'font-bold' : 'font-normal',
                notification?.expanded ? 'block overflow-visible' : 'line-clamp-2 max-h-10',
                className
            )
        }
    });
}

/** Description of a notification: a `<p>`, clamped to two lines until expanded. */
export function NotificationParagraph({ id: idProp, render, className, ...props }: useRender.ComponentProps<'p'>) {
    const notification = useContext(NotificationContext);
    const autoId = useId();
    const id = idProp ?? `fd-notification-paragraph-${autoId}`;
    useRegisterId(notification, 'paragraph', id);
    return useRender({
        render,
        defaultTagName: 'p',
        props: {
            ...props,
            id,
            'data-nt-paragraph': '',
            className: cn(
                'm-0 box-border p-0 text-sap-font-size text-sap-list-text-color',
                notification?.expanded ? 'block overflow-visible' : 'line-clamp-2 max-h-11',
                className
            )
        }
    });
}

/** The icon and title row of a notification. */
export function NotificationHeader({ id: idProp, render, className, ...props }: useRender.ComponentProps<'div'>) {
    const autoId = useId();
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            id: idProp ?? `fd-notification-header-${autoId}`,
            'data-nt-header': '',
            className: cn('m-0 box-border flex w-full gap-1 p-0 [&>[data-glyph]]:pt-0.5', className)
        }
    });
}

/**
 * Avatar, content and actions of a notification. The buttons of its `NotificationActions` are described by the
 * first header (`aria-describedby`), unless they already have a description.
 */
export function NotificationBody({ render, className, ref, ...props }: useRender.ComponentProps<'div'>) {
    const element = useRef<HTMLElement | null>(null);
    useEffect(() => {
        const host = element.current;
        if (!host) return;
        const apply = () => {
            const id = host.querySelector('[data-nt-header]')?.id;
            if (!id) return;
            host.querySelectorAll(
                ':scope > [data-nt-actions] button, :scope > [data-nt-actions] a[role="button"]'
            ).forEach((button) => {
                if (!button.hasAttribute('aria-describedby')) button.setAttribute('aria-describedby', id);
            });
        };
        apply();
        // buttons added later get the description too
        const observer = new MutationObserver(apply);
        observer.observe(host, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);
    return useRender({
        render,
        defaultTagName: 'div',
        ref: ref ? [ref, element] : element,
        props: { ...props, className: cn('relative m-0 box-border flex gap-3 p-4', className) }
    });
}

/** The header, paragraph, footer and status of a notification, in a column. */
export function NotificationContent({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn('m-0 box-border flex w-full flex-col items-start gap-3 p-0 compact:gap-2', className)
        }
    });
}

/** Buttons at the top end of a notification, e.g. a close button (transparent `Button`s). */
export function NotificationActions({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-nt-actions': '',
            className: cn('absolute end-0 top-0 m-0 box-border flex gap-0.5 ps-1 pe-2 pt-2', className)
        }
    });
}

/** A footnote, e.g. the source or the time. */
export function NotificationFooterContent({ render, className, ...props }: useRender.ComponentProps<'span'>) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            className: cn('max-w-1/2 truncate text-sap-content-label-color only:max-w-full', className)
        }
    });
}

/** A dot between footnotes. */
export function NotificationSeparator({ render, className, ...props }: useRender.ComponentProps<'span'>) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            role: 'presentation',
            'aria-hidden': true,
            ...props,
            className: cn("m-0 mx-2 p-0 text-sap-content-label-color before:content-['·']", className)
        }
    });
}

export interface NotificationFooterProps extends useRender.ComponentProps<'div'> {
    /** Shows (true) or hides (false) the More/Less link; by default it shows while a text is cut off. */
    showTrigger?: boolean;
    /** Whether the texts are expanded (controlled). */
    expanded?: boolean;
    /** Whether the texts are expanded at first (uncontrolled). */
    defaultExpanded?: boolean;
    /** Called when the More/Less link is pressed. */
    onExpandedChange?: (expanded: boolean) => void;
    moreLabel?: string;
    lessLabel?: string;
}

/**
 * The footnotes of a notification (`NotificationFooterContent`s and `NotificationSeparator`s). A More/Less link
 * appears when the title or the paragraph is cut off; `showTrigger` and `expanded` take control of it.
 */
export function NotificationFooter({
    showTrigger,
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    moreLabel = 'More',
    lessLabel = 'Less',
    render,
    className,
    children,
    ...props
}: NotificationFooterProps) {
    const notification = useContext(NotificationContext);
    const [ownExpanded, setOwnExpanded] = useState(defaultExpanded);
    const expanded = expandedProp ?? ownExpanded;
    const setExpanded = notification?.setExpanded;
    useLayoutEffect(() => {
        setExpanded?.(expanded);
        return () => setExpanded?.(false);
    }, [setExpanded, expanded]);

    const toggle = () => {
        const next = !expanded;
        if (expandedProp === undefined) setOwnExpanded(next);
        onExpandedChange?.(next);
    };
    const show = showTrigger ?? notification?.autoShowTrigger ?? false;

    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-nt-footer': '',
            // the full width, as Angular's: fundamental-styles' footer is as wide as its content, so the 50% maximum
            // of a footnote resolves against the footnotes themselves and two short footnotes get truncated
            className: cn('m-0 box-border flex w-full items-center p-0', className),
            children: (
                <>
                    {children}
                    {show && (
                        <Link
                            role="button"
                            tabIndex={0}
                            className="ms-4"
                            aria-expanded={expanded}
                            aria-label={
                                expanded
                                    ? `${lessLabel} button. Show less text.`
                                    : `${moreLabel} button. Show the full texts.`
                            }
                            onClick={toggle}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') toggle();
                                else if (event.key === ' ') {
                                    event.preventDefault();
                                    toggle();
                                }
                            }}
                        >
                            {expanded ? lessLabel : moreLabel}
                        </Link>
                    )}
                </>
            )
        }
    });
}

/** Container of message strips above the body of a notification. */
export function NotificationMessageStripContainer({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, className: cn('pt-4 ps-4 pe-2 empty:p-0', className) }
    });
}

/** Wrapper of a message strip in a notification popover, above the list. */
export function NotificationMessageStrip({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, className: cn('m-0 box-border block p-2', className) }
    });
}

/* ------------------------------------------------------------------------------------------------------------------
 * Lists, popover and groups
 * ---------------------------------------------------------------------------------------------------------------- */

/** A list of notifications or notification groups: a `<ul>` named "Notifications" by default. */
export function NotificationList({
    'aria-label': ariaLabel = 'Notifications',
    render,
    className,
    children,
    ...props
}: useRender.ComponentProps<'ul'>) {
    return useRender({
        render,
        defaultTagName: 'ul',
        props: {
            role: 'list',
            'aria-label': ariaLabel,
            ...props,
            className: cn('m-0 box-border block size-full list-none overflow-auto p-0', className),
            children: <NotificationListContext.Provider value="list">{children}</NotificationListContext.Provider>
        }
    });
}

/**
 * The body of a notification popover (a `role="dialog"`, 27rem wide): a header toolbar, message strips and the
 * `NotificationList`. Name it with `aria-labelledby`.
 */
export function NotificationPopover({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            role: 'dialog',
            ...props,
            className: cn(
                'm-0 box-border flex max-h-[40rem] w-[27rem] max-w-[27rem] flex-col p-0 max-sm:w-auto max-sm:max-w-[25rem]',
                className
            )
        }
    });
}

export interface NotificationGroupProps extends useRender.ComponentProps<'li'> {
    /** Whether the group is expanded (controlled). */
    expanded?: boolean;
    /** Whether the group starts expanded (uncontrolled; Angular's `expanded`). */
    defaultExpanded?: boolean;
    /** Called when the header expands or collapses the group. */
    onExpandedChange?: (expanded: boolean) => void;
    /** Announced while the group is expanded. */
    expandedDescription?: string;
    /** Announced while the group is collapsed. */
    collapsedDescription?: string;
}

/**
 * A collapsible group of notifications, e.g. "Today": an `<li>` of a `NotificationList` with a
 * `NotificationGroupHeader`, a `NotificationGroupList` and an optional `NotificationGroupGrowingItem`, which show
 * only while the group is expanded. Named by its `NotificationGroupHeaderTitle`.
 */
export function NotificationGroup({
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    expandedDescription = 'Notification group expanded',
    collapsedDescription = 'Notification group collapsed',
    render,
    className,
    children,
    ...props
}: NotificationGroupProps) {
    const [ownExpanded, setOwnExpanded] = useState(defaultExpanded);
    const expanded = expandedProp ?? ownExpanded;
    const [firstId, register] = useRegistry<'title' | 'list'>();
    const expandedRef = useRef(expanded);
    expandedRef.current = expanded;
    const toggle = useCallback(() => {
        const next = !expandedRef.current;
        if (expandedProp === undefined) setOwnExpanded(next);
        onExpandedChange?.(next);
    }, [expandedProp, onExpandedChange]);
    const titleId = firstId('title');
    const listId = firstId('list');
    const context = useMemo<NotificationGroupContextValue>(
        () => ({ expanded, toggle, titleId, listId, register }),
        [expanded, toggle, titleId, listId, register]
    );
    return useRender({
        render,
        defaultTagName: 'li',
        props: {
            role: 'listitem',
            tabIndex: -1,
            'aria-level': 1,
            'aria-labelledby': titleId ?? undefined,
            'aria-description': expanded ? expandedDescription : collapsedDescription,
            ...props,
            className: cn('m-0 box-border block list-none p-0', className),
            children: (
                <NotificationListContext.Provider value={null}>
                    <NotificationGroupContext.Provider value={context}>{children}</NotificationGroupContext.Provider>
                </NotificationListContext.Provider>
            )
        }
    });
}

/** Expands and collapses its group: a `role="button"` with an arrow, the title and other content. */
export function NotificationGroupHeader({
    title = 'Expand/Collapse',
    render,
    className,
    onClick,
    onKeyDown,
    children,
    ...props
}: useRender.ComponentProps<'div'>) {
    const group = useContext(NotificationGroupContext);
    const expanded = group?.expanded ?? false;
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            role: 'button',
            tabIndex: 0,
            title,
            'aria-controls': group?.listId ?? undefined,
            'aria-expanded': expanded,
            ...props,
            className: cn(
                'sticky top-0 z-10 m-0 mt-3 mb-2 box-border flex h-sap-element-line-height cursor-pointer items-center gap-3 p-0 px-2 bg-sap-list-group-header-background focus:outline-sap focus:-outline-offset-4',
                // fundamental-styles' transparent bottom border
                'border-0 border-b-(length:--sapList_BorderWidth) border-solid border-transparent',
                className
            ),
            onClick: (event: ReactMouseEvent<HTMLDivElement>) => {
                onClick?.(event);
                if (!event.defaultPrevented) group?.toggle();
            },
            onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => {
                onKeyDown?.(event);
                if (event.defaultPrevented || (event.key !== 'Enter' && event.key !== ' ')) return;
                event.preventDefault();
                group?.toggle();
            },
            children: (
                <>
                    <span className="mx-2 inline-flex items-center justify-center text-[1rem]">
                        <Icon
                            glyph={expanded ? 'slim-arrow-down' : 'slim-arrow-right'}
                            className="size-4 text-sap-content-icon-color"
                        />
                    </span>
                    {children}
                </>
            )
        }
    });
}

export interface NotificationGroupHeaderTitleProps extends useRender.ComponentProps<'span'> {
    /** Heading level (default 3). */
    ariaLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Title of a group header: a `role="heading"` that names the group. */
export function NotificationGroupHeaderTitle({
    ariaLevel = 3,
    id: idProp,
    render,
    className,
    ...props
}: NotificationGroupHeaderTitleProps) {
    const group = useContext(NotificationGroupContext);
    const autoId = useId();
    const id = idProp ?? `fd-notification-group-header-title-${autoId}`;
    useRegisterId(group, 'title', id);
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            role: 'heading',
            'aria-level': ariaLevel,
            ...props,
            id,
            className: cn(
                'm-0 box-border truncate p-0 font-sap-font-header-family text-sap-font-header5-size leading-8 font-normal text-sap-group-title-text-color',
                className
            )
        }
    });
}

/** Child indexes from a notification to an element inside it. */
function pathTo(notification: Element, target: Element): number[] {
    const path: number[] = [];
    for (let el: Element | null = target; el && el !== notification; el = el.parentElement) {
        if (!el.parentElement) break;
        path.unshift(Array.from(el.parentElement.children).indexOf(el));
    }
    return path;
}

/** Focuses the element at the same place as in another notification, or the notification. */
function focusByPath(notification: HTMLElement, path: number[]): void {
    let el: Element | null = notification;
    for (const index of path) el = el?.children.item(index) ?? null;
    (el instanceof HTMLElement && el.matches(FOCUSABLE) ? el : notification).focus();
}

/**
 * The notifications of a group (a `<ul>`), shown while the group is expanded. ArrowUp/ArrowDown, Home and End move
 * between them, keeping the focused button column.
 */
export function NotificationGroupList({
    id: idProp,
    render,
    className,
    onKeyDown,
    children,
    ...props
}: useRender.ComponentProps<'ul'>) {
    const group = useContext(NotificationGroupContext);
    const autoId = useId();
    const id = idProp ?? `fd-notification-group-list-${autoId}`;
    useRegisterId(group, 'list', id);
    const rendered = useRender({
        render,
        defaultTagName: 'ul',
        props: {
            role: 'list',
            ...props,
            id,
            className: cn('m-0 mx-2 mb-2 box-border flex list-none flex-col gap-2 p-0', className),
            onKeyDown: (event: ReactKeyboardEvent<HTMLUListElement>) => {
                onKeyDown?.(event);
                if (event.defaultPrevented || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
                const target = event.target as HTMLElement;
                if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
                const list = [...event.currentTarget.children].filter(
                    (el): el is HTMLElement => el instanceof HTMLElement && el.hasAttribute('data-notification')
                );
                if (!list.length) return;
                const current = list.findIndex((n) => n.contains(target));
                const last = list.length - 1;
                const next =
                    event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? last
                          : event.key === 'ArrowDown'
                            ? current === -1
                                ? 0
                                : Math.min(current + 1, last)
                            : current === -1
                              ? last
                              : Math.max(current - 1, 0);
                if (next === current) return;
                event.preventDefault();
                focusByPath(list[next]!, current === -1 ? [] : pathTo(list[current]!, target));
            },
            children: <NotificationListContext.Provider value="group">{children}</NotificationListContext.Provider>
        }
    });
    return group && !group.expanded ? null : rendered;
}

/** The "Show more" item at the end of a group: a `role="button"` (click, Enter, Space), shown while expanded. */
export function NotificationGroupGrowingItem({
    render,
    className,
    onKeyDown,
    ...props
}: useRender.ComponentProps<'div'>) {
    const group = useContext(NotificationGroupContext);
    const rendered = useRender({
        render,
        defaultTagName: 'div',
        props: {
            role: 'button',
            tabIndex: 0,
            ...props,
            className: cn(
                'mx-2 mb-2 box-border flex cursor-pointer flex-col items-center justify-center gap-2 p-4 rounded-sap-tile-border-corner-radius border-(length:--sapList_BorderWidth) border-solid border-sap-list-border-color bg-sap-list-background enabled-hover:bg-sap-list-hover-background active:bg-sap-list-selection-background-color focus:outline-sap focus:-outline-offset-4',
                className
            ),
            onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => {
                onKeyDown?.(event);
                if (event.defaultPrevented || event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.currentTarget.click();
                }
            }
        }
    });
    return group && !group.expanded ? null : rendered;
}

/** The text of a growing item, e.g. "More (2)". */
export function NotificationGroupGrowingItemTitle({ render, className, ...props }: useRender.ComponentProps<'span'>) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            className: cn(
                'm-0 p-0 font-sap-font-family text-sap-font-size font-bold text-sap-button-text-color',
                className
            )
        }
    });
}

/* ------------------------------------------------------------------------------------------------------------------
 * Service
 * ---------------------------------------------------------------------------------------------------------------- */

/**
 * What the service opens: a render function that gets the `NotificationRef` (Angular's template with `let-ref`), or
 * a React element (Angular's component; it reads `useNotificationRef()`). It renders a `Notification`.
 */
export type NotificationContent<T = unknown, P = unknown> = ReactElement | ((ref: NotificationRef<T, P>) => ReactNode);

/** Opens notifications from code: the React form of Angular's `NotificationService`. */
export interface NotificationService {
    /** Opens a notification at the top end of the screen; newer ones are added below. */
    open<T = unknown, P = unknown>(
        content: NotificationContent<T, P>,
        config?: NotificationConfig<T>
    ): NotificationRef<T, P>;
    /** Closes all notifications. */
    destroyAll(): void;
    isAnyOpened(): boolean;
    /** Open notifications, oldest first. */
    readonly notifications: readonly NotificationRef[];
}

interface NotificationEntry {
    key: number;
    ref: NotificationRef<any, any>;
    content: NotificationContent<any, any>;
    config: NotificationConfig<any>;
}

class NotificationServiceStore implements NotificationService {
    #entries: readonly NotificationEntry[] = [];
    #listeners = new Set<() => void>();
    #version = 0;
    #next = 0;
    /** The element focused before the first focus-trapping notification opened. */
    previousFocus: HTMLElement | null = null;

    get entries(): readonly NotificationEntry[] {
        return this.#entries;
    }
    get notifications(): readonly NotificationRef[] {
        return this.#entries.map((e) => e.ref);
    }

    open = <T = unknown, P = unknown>(
        content: NotificationContent<T, P>,
        config: NotificationConfig<T> = {}
    ): NotificationRef<T, P> => {
        const merged: NotificationConfig<T> = { shouldTrapFocus: true, escKeyCloseable: false, ...config };
        const ref = new NotificationRef<T, P>(merged.data);
        // the focus before the first focus-trapping notification (Angular: before the first notification)
        if (merged.shouldTrapFocus && !this.#entries.some((e) => e.config.shouldTrapFocus)) {
            this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }
        const entry: NotificationEntry = {
            key: this.#next++,
            ref,
            content: content as NotificationEntry['content'],
            config: merged
        };
        ref._onEnd = () => {
            this.#entries = this.#entries.filter((e) => e !== entry);
            this.#emit();
        };
        this.#entries = [...this.#entries, entry];
        this.#emit();
        return ref;
    };

    destroyAll = (): void => {
        [...this.#entries].forEach((entry) => entry.ref.close());
    };

    isAnyOpened = (): boolean => this.#entries.length > 0;

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

const NotificationServiceContext = createContext<NotificationServiceStore | null>(null);

export interface NotificationProviderProps {
    children?: ReactNode;
    /** Element the notifications are rendered in, instead of `document.body`; they stay fixed on the screen. */
    container?: HTMLElement | null;
}

/**
 * Renders the notifications opened by `useNotificationService()` below it, in a column 2rem from the top end of
 * the screen. Put it at the root of the app. Unmounting it closes its notifications.
 */
export function NotificationProvider({ children, container }: NotificationProviderProps) {
    const [store] = useState(() => new NotificationServiceStore());
    useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
    useEffect(() => () => store.destroyAll(), [store]);
    const direction = useDirection();
    const entries = store.entries;
    return (
        <NotificationServiceContext.Provider value={store}>
            {children}
            {entries.length > 0 &&
                createPortal(
                    <div
                        data-notification-container=""
                        dir={direction}
                        className="fixed end-8 top-8 z-[5000] flex max-w-[26rem] flex-col items-end gap-2 max-sm:max-w-[24rem]"
                    >
                        {entries.map((entry) => (
                            <ServiceNotification key={entry.key} entry={entry} store={store} />
                        ))}
                    </div>,
                    container ?? document.body
                )}
        </NotificationServiceContext.Provider>
    );
}

/**
 * The notification service of the nearest `NotificationProvider`: `open(content, config)` returns a
 * `NotificationRef`; `notifications` re-renders the component when it changes.
 *
 * ```tsx
 * const notifications = useNotificationService();
 * const ref = notifications.open(<OrderNotification />, { data: order });
 * const result = await ref.afterClosed; // { status: 'closed', value } or { status: 'dismissed', reason }
 * ```
 */
export function useNotificationService(): NotificationService {
    const store = useContext(NotificationServiceContext);
    if (!store) throw new Error('useNotificationService() needs a <NotificationProvider> above it');
    useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
    return store;
}

/** The `NotificationRef` of the notification this component is rendered in (Angular's `inject(NotificationRef)`). */
export function useNotificationRef<T = unknown, P = unknown>(): NotificationRef<T, P> {
    const ref = useContext(NotificationRefContext);
    if (!ref) throw new Error('useNotificationRef() is only available in a notification opened by the service');
    return ref as NotificationRef<T, P>;
}

/** Tabbable elements of a notification, the notification first. */
function tabbables(notification: HTMLElement): HTMLElement[] {
    return [
        notification,
        ...[...notification.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
            (el) =>
                el.tabIndex >= 0 &&
                !el.closest('[inert], [hidden]') &&
                (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0)
        )
    ];
}

/** A notification opened by the service: its content with the ref and config, focused and trapping Tab. */
function ServiceNotification({ entry, store }: { entry: NotificationEntry; store: NotificationServiceStore }) {
    const { ref, config, content } = entry;
    const host = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!config.shouldTrapFocus) return;
        const wrapper = host.current;
        const notification = wrapper?.querySelector<HTMLElement>('[data-notification]') ?? wrapper;
        if (!notification) return;
        // Tab on the last tabbable element wraps to the notification and Shift+Tab on the notification to the last
        // one, without focusable aria-hidden anchors (which axe reports)
        const onKeydown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab' || event.ctrlKey || event.altKey || event.metaKey) return;
            const list = tabbables(notification);
            const edge = event.shiftKey ? list[0] : list[list.length - 1];
            if (document.activeElement !== edge) return;
            event.preventDefault();
            (event.shiftKey ? list[list.length - 1] : list[0])!.focus();
        };
        notification.addEventListener('keydown', onKeydown);
        notification.focus();
        return () => {
            notification.removeEventListener('keydown', onKeydown);
            if (!ref.isClosed) return;
            if (!store.isAnyOpened()) {
                store.previousFocus?.focus();
                store.previousFocus = null;
            } else {
                // the focus moves to the newest remaining notification
                const container = notification.ownerDocument.querySelectorAll<HTMLElement>(
                    '[data-notification-container] [data-notification]'
                );
                const remaining = [...container].filter((el) => el !== notification && el.isConnected);
                remaining[remaining.length - 1]?.focus();
            }
        };
    }, [config.shouldTrapFocus, ref, store]);

    useEffect(() => {
        if (config.shouldTrapFocus) return;
        return () => {
            if (ref.isClosed && !store.isAnyOpened()) {
                store.previousFocus?.focus();
                store.previousFocus = null;
            }
        };
    }, [config.shouldTrapFocus, ref, store]);

    const body = typeof content === 'function' ? content(ref) : content;
    return (
        <div ref={host} data-notification-host="" className="contents">
            <NotificationRefContext.Provider value={ref}>
                <NotificationConfigContext.Provider value={config}>{body}</NotificationConfigContext.Provider>
            </NotificationRefContext.Provider>
        </div>
    );
}
