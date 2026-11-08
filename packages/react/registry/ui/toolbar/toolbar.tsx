/*
 * Port of @fundamental-ngx/core (toolbar) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    Children,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type ComponentProps,
    type KeyboardEvent,
    type ReactNode,
    type Ref
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/ui/button/button';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';
import { Title } from '@/ui/title/title';

export type ToolbarVariant = 'solid' | 'transparent' | 'auto' | 'info';
/** never stays, always overflows, disappear is hidden when overflowing; low overflows before high. */
export type OverflowPriority = 'always' | 'disappear' | 'low' | 'high' | 'never';

const PRIORITY_SCORE: Record<OverflowPriority, number> = { always: 0, disappear: 1, low: 2, high: 3, never: 4 };
const ITEM_MARGIN = 8;

/** What the overflow algorithm needs to know about an item. */
export interface ToolbarOverflowItem {
    width: number;
    priority: OverflowPriority;
    group: number;
}

/**
 * Items that do not fit into `available` pixels (after `used` pixels), by priority and group:
 * higher priorities and earlier items stay longest; a group overflows as a whole.
 */
export function toolbarOverflow<T extends ToolbarOverflowItem>(
    items: readonly T[],
    available: number,
    used: number,
    forceOverflow = false
): T[] {
    const overflown: T[] = [];
    sortByPriorityAndGroup(items).reduce((width, item) => {
        const itemWidth = item.width + 2;
        const always = item.priority === 'always' || forceOverflow;
        if ((itemWidth + width > available && item.priority !== 'never') || always) {
            overflown.push(item);
            return always ? width : Number.MAX_SAFE_INTEGER;
        }
        return width + itemWidth;
    }, used);

    for (const item of [...overflown]) {
        if (item.group === 0 || item.priority === 'disappear') continue;
        for (const member of items) {
            if (
                member.group === item.group &&
                member.priority !== 'never' &&
                member.priority !== 'always' &&
                !overflown.includes(member)
            ) {
                overflown.push(member);
            }
        }
    }
    return overflown.sort((a, b) => PRIORITY_SCORE[b.priority] - PRIORITY_SCORE[a.priority]);
}

function sortByPriorityAndGroup<T extends ToolbarOverflowItem>(items: readonly T[]): T[] {
    const groups = new Map<number, { items: T[]; index: number; priority: number }>();
    const singles: { items: T[]; index: number; priority: number }[] = [];
    items.forEach((item, index) => {
        const score = PRIORITY_SCORE[item.priority];
        if (item.group === 0 || item.priority === 'never' || item.priority === 'always') {
            singles.push({ items: [item], index, priority: score });
            return;
        }
        const group = groups.get(item.group) ?? { items: [], index, priority: -Infinity };
        group.items.push(item);
        group.priority = Math.max(group.priority, score);
        groups.set(item.group, group);
    });
    return [...groups.values(), ...singles]
        .sort((a, b) => b.priority - a.priority || a.index - b.index)
        .flatMap((group) => group.items);
}

/**
 * Set by a container (e.g. the global actions of a dynamic page) to move all items of the toolbars inside it into
 * the overflow popover (Angular's `FD_TOOLBAR_FORCE_OVERFLOW`).
 */
export const ToolbarForceOverflowContext = createContext(false);

/** An overflowable item as the toolbar tracks it; its content renders into `container`, which the toolbar moves. */
interface ItemRecord {
    priority: OverflowPriority;
    group: number;
    /** Stays in the toolbar row, where the item belongs. */
    anchor: HTMLElement;
    /** Holds the item's content: in the anchor, or in the overflow panel. */
    container: HTMLElement;
    overflown: boolean;
    /** Width in the toolbar, remembered while the item is in the overflow panel. */
    lastWidth: number;
}

interface ToolbarContextValue {
    register(record: ItemRecord): () => void;
    /** Recomputes the overflow, e.g. after an item changed its priority. */
    invalidate(): void;
    /** Counts a spacer (flexible or fixed) or a separator while it is mounted. */
    count(kind: 'flexible' | 'separator'): () => void;
}

const ToolbarContext = createContext<ToolbarContextValue | null>(null);

const subscribeNothing = () => () => {};
/** False on the server and while hydrating, so the first client render matches the server HTML. */
const useClient = () =>
    useSyncExternalStore(
        subscribeNothing,
        () => true,
        () => false
    );

/**
 * The overflow panel. Its items (the elements in each item's `contents` container) keep their height (`shrink-0`):
 * past 50vh the panel scrolls instead of squeezing them.
 */
const PANEL_CLASS =
    'scrollbar-sap box-border flex max-h-[50vh] max-w-full flex-col overflow-auto px-2 py-1 [--tb-sep-h:1px] *:*:shrink-0 compact:max-w-80 compact:px-1.5 compact:py-[0.1875rem]';

/** The element of an item that is measured: the first element its content renders. */
const itemElement = (record: ItemRecord) => record.container.firstElementChild as HTMLElement | null;

function ItemSlot({ priority, group, children }: { priority: OverflowPriority; group: number; children?: ReactNode }) {
    const toolbar = useContext(ToolbarContext);
    const client = useClient();
    const anchor = useRef<HTMLSpanElement | null>(null);
    const [container] = useState(() => {
        if (typeof document === 'undefined') return null;
        const element = document.createElement('span');
        element.className = 'contents';
        return element;
    });
    const record = useRef<ItemRecord | null>(null);

    useLayoutEffect(() => {
        const node = anchor.current;
        if (!toolbar || !node || !container) return;
        node.appendChild(container);
        const item: ItemRecord = { priority, group, anchor: node, container, overflown: false, lastWidth: 0 };
        record.current = item;
        const unregister = toolbar.register(item);
        return () => {
            unregister();
            record.current = null;
            container.remove();
        };
        // priority and group changes are applied below, without registering again
    }, [toolbar, container, client]);

    useLayoutEffect(() => {
        const item = record.current;
        if (!item || (item.priority === priority && item.group === group)) return;
        item.priority = priority;
        item.group = group;
        toolbar?.invalidate();
    }, [toolbar, priority, group]);

    if (!toolbar) return children;
    // on the server and while hydrating the content renders in place; it moves into its container afterwards
    if (!client || !container) return <span className="contents">{children}</span>;
    return (
        <>
            <span ref={anchor} data-toolbar-item="" className="contents" />
            {createPortal(children, container)}
        </>
    );
}

export interface ToolbarItemOptions {
    /** When the item moves into the overflow popover, see `OverflowPriority` (default `high`). */
    overflowPriority?: OverflowPriority;
    /** Items of the same non-zero group overflow together. */
    overflowGroup?: number;
}

export interface ToolbarItemProps extends ToolbarItemOptions {
    /** The control, e.g. an `Input`, a `Checkbox` or a `Select`. */
    children?: ReactNode;
}

/**
 * A toolbar child that moves into the overflow popover when it does not fit (Angular's `fd-toolbar-item`). It keeps
 * its state there: the content is moved, not rendered again. The first element of the content is measured.
 *
 * ```tsx
 * <ToolbarItem overflowPriority="low"><Checkbox label="Only mine" /></ToolbarItem>
 * ```
 */
export function ToolbarItem({ overflowPriority = 'high', overflowGroup = 0, children }: ToolbarItemProps) {
    return (
        <ItemSlot priority={overflowPriority} group={overflowGroup}>
            {children}
        </ItemSlot>
    );
}

export interface ToolbarLabelProps extends useRender.ComponentProps<'span'>, ToolbarItemOptions {}

/**
 * Text in a toolbar, an item that overflows too. Render a label with `render={<label htmlFor="…" />}`.
 *
 * ```tsx
 * <ToolbarLabel>Filtered by Category</ToolbarLabel>
 * ```
 */
export function ToolbarLabel({
    overflowPriority = 'high',
    overflowGroup = 0,
    render,
    className,
    ...props
}: ToolbarLabelProps) {
    const element = useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            'data-toolbar-label': '',
            className: cn(
                'truncate font-sap-font-family text-sap-font-size text-sap-content-label-color in-data-[toolbar-overflow]:my-1.5',
                className
            )
        }
    });
    return (
        <ItemSlot priority={overflowPriority} group={overflowGroup}>
            {element}
        </ItemSlot>
    );
}

export interface ToolbarOverflowButtonProps extends ButtonProps, ToolbarItemOptions {}

/**
 * A button that overflows, and stretches and aligns to the start in the overflow popover.
 *
 * ```tsx
 * <ToolbarOverflowButton variant="transparent" label="Export" overflowPriority="low" />
 * ```
 */
export function ToolbarOverflowButton({
    overflowPriority = 'high',
    overflowGroup = 0,
    className,
    ...props
}: ToolbarOverflowButtonProps) {
    return (
        <ItemSlot priority={overflowPriority} group={overflowGroup}>
            <Button
                {...props}
                className={cn(
                    'in-data-[toolbar-overflow]:my-[0.1875rem] in-data-[toolbar-overflow]:w-auto in-data-[toolbar-overflow]:justify-start in-data-[toolbar-overflow]:text-start',
                    className
                )}
            />
        </ItemSlot>
    );
}

export interface ToolbarSpacerProps extends ComponentProps<'div'> {
    /** Width of a fixed spacer, e.g. `"100px"`. */
    width?: string;
    /** Keeps the given width instead of growing. */
    fixed?: boolean;
}

/** Flexible (or fixed-width) space between toolbar items. */
export function ToolbarSpacer({ width = '0px', fixed = false, className, style, ...props }: ToolbarSpacerProps) {
    const toolbar = useContext(ToolbarContext);
    useLayoutEffect(() => (toolbar && !fixed ? toolbar.count('flexible') : undefined), [toolbar, fixed]);
    return (
        <div
            {...props}
            style={{ width, ...style }}
            className={cn('m-0 h-full p-0', fixed ? 'inline-block flex-none' : 'flex-[1_auto]', className)}
        />
    );
}

/** Vertical line between toolbar items (horizontal in the overflow popover). */
export function ToolbarSeparator({ className, ...props }: ComponentProps<'div'>) {
    const toolbar = useContext(ToolbarContext);
    useLayoutEffect(() => toolbar?.count('separator'), [toolbar]);
    return (
        <div
            role="separator"
            {...props}
            className={cn(
                'm-0 block h-(--tb-sep-h) w-px bg-sap-toolbar-separator-color p-0 in-data-[toolbar-overflow]:my-[0.1875rem] in-data-[toolbar-overflow]:h-px in-data-[toolbar-overflow]:w-auto',
                className
            )}
        />
    );
}

/** Imperative actions of a toolbar, through `actionsRef`. */
export interface ToolbarActions {
    /** Recomputes the overflow, e.g. after items changed their width. */
    updateCollapsibleItems(): void;
}

export interface ToolbarProps extends Omit<ComponentProps<'div'>, 'title'> {
    /** Look of the toolbar: `solid` (default), `transparent`, `auto` or `info` (Angular's `fdType`). */
    variant?: ToolbarVariant;
    /** Title at the start, a heading that names the toolbar. A `Title` child works too. */
    title?: string | null;
    /** Id of the title heading. */
    titleId?: string;
    /** `aria-level` of the title heading (default 2). */
    headingLevel?: number;
    /** Interactive info toolbar: focusable, clicked with Enter and Space. */
    active?: boolean;
    /** Removes the bottom border. */
    clearBorder?: boolean;
    /** Moves the items that do not fit into the overflow popover. */
    shouldOverflow?: boolean;
    /** Moves all items into the overflow popover. */
    forceOverflow?: boolean;
    /** Name of the "more" button and its popover. */
    moreLabel?: string;
    /** Whether the overflow popover is open (controlled). */
    overflowOpen?: boolean;
    /** Whether the overflow popover is open initially (uncontrolled). */
    defaultOverflowOpen?: boolean;
    onOverflowOpenChange?: (open: boolean) => void;
    /** Imperative actions: `updateCollapsibleItems()`. */
    actionsRef?: Ref<ToolbarActions>;
}

const sameItems = (a: readonly ItemRecord[], b: readonly ItemRecord[]) =>
    a.length === b.length && a.every((item, i) => item === b[i]);

const FOCUSABLE =
    'a[href], area[href], button, input, select, textarea, iframe, summary, [contenteditable]:not([contenteditable="false"]), [tabindex]';

/** Tabbable elements inside `root`, in DOM order. */
function tabbables(root: HTMLElement): HTMLElement[] {
    return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) =>
            el.tabIndex >= 0 &&
            !el.matches(':disabled, [inert], [inert] *') &&
            (typeof el.checkVisibility !== 'function' || el.checkVisibility({ visibilityProperty: true }))
    );
}

const HEADING = ':scope > :is(h1, h2, h3, h4, h5, h6, [role="heading"])';

/**
 * Toolbar: a row of actions, optionally with a title, that moves the items that do not fit into an overflow
 * popover (`shouldOverflow`). Items are `ToolbarItem`, `ToolbarLabel` and `ToolbarOverflowButton`; other children
 * always stay in the row.
 *
 * ```tsx
 * <Toolbar title="Products" shouldOverflow>
 *     <ToolbarSpacer />
 *     <ToolbarOverflowButton variant="transparent" label="Add" />
 *     <ToolbarOverflowButton variant="transparent" label="Export" overflowPriority="low" />
 * </Toolbar>
 * ```
 */
export function Toolbar({
    variant = 'solid',
    title,
    titleId: titleIdProp,
    headingLevel = 2,
    active = false,
    clearBorder = false,
    shouldOverflow = false,
    forceOverflow = false,
    moreLabel = 'More',
    overflowOpen: overflowOpenProp,
    defaultOverflowOpen = false,
    onOverflowOpenChange,
    actionsRef,
    id: idProp,
    className,
    children,
    onKeyDown,
    ref,
    ...props
}: ToolbarProps) {
    const autoId = useId();
    const id = idProp ?? `fd-toolbar-${autoId}`;
    const titleId = titleIdProp ?? `fd-toolbar-title-${autoId}`;
    const containerForce = useContext(ToolbarForceOverflowContext);
    const should = shouldOverflow || containerForce;
    const force = forceOverflow || containerForce;

    const host = useRef<HTMLDivElement | null>(null);
    const hiddenArea = useRef<HTMLDivElement | null>(null);
    const [panel] = useState(() => {
        if (typeof document === 'undefined') return null;
        const element = document.createElement('div');
        element.className = PANEL_CLASS;
        element.setAttribute('data-toolbar-overflow', '');
        return element;
    });

    const [ownOpen, setOwnOpen] = useState(defaultOverflowOpen);
    const open = overflowOpenProp ?? ownOpen;
    const setOpen = useCallback(
        (next: boolean) => {
            setOwnOpen(next);
            onOverflowOpenChange?.(next);
        },
        [onOverflowOpenChange]
    );

    const records = useRef(new Set<ItemRecord>());
    const separators = useRef(0);
    const [flexibleSpacers, setFlexibleSpacers] = useState(0);
    const [, setVersion] = useState(0);
    const [overflown, setOverflown] = useState<ItemRecord[]>([]);
    const options = useRef({ should, force });
    options.current = { should, force };

    const recompute = useCallback(() => {
        const root = host.current;
        if (!root) return;
        const items = [...records.current].sort((a, b) =>
            a.anchor.compareDocumentPosition(b.anchor) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
        );
        const measured = items.map((record) => {
            const element = itemElement(record);
            if (!record.overflown && element?.clientWidth) record.lastWidth = element.clientWidth + ITEM_MARGIN;
            return { record, width: record.lastWidth, priority: record.priority, group: record.group };
        });
        const density = root.closest('[data-density]')?.getAttribute('data-density');
        const button = density === 'compact' || density === 'condensed' ? 32 : 36;
        const available = root.clientWidth - (button + 4 * ITEM_MARGIN + 1 + separators.current);
        const used = root.querySelector<HTMLElement>(HEADING)?.clientWidth ?? 0;
        const { should: overflow, force: all } = options.current;
        const next = overflow ? toolbarOverflow(measured, available, used, all).map((item) => item.record) : [];
        setOverflown((previous) => (sameItems(previous, next) ? previous : next));
    }, []);

    const context = useMemo<ToolbarContextValue>(
        () => ({
            register(record) {
                records.current.add(record);
                setVersion((n) => n + 1);
                return () => {
                    records.current.delete(record);
                    setVersion((n) => n + 1);
                };
            },
            invalidate: () => setVersion((n) => n + 1),
            count(kind) {
                if (kind === 'flexible') setFlexibleSpacers((n) => n + 1);
                else separators.current++;
                setVersion((n) => n + 1);
                return () => {
                    if (kind === 'flexible') setFlexibleSpacers((n) => n - 1);
                    else separators.current--;
                    setVersion((n) => n + 1);
                };
            }
        }),
        []
    );

    useImperativeHandle(actionsRef, () => ({ updateCollapsibleItems: () => setVersion((n) => n + 1) }), []);

    // move overflown items into the panel (in their overflow order) and the others back to their places
    useLayoutEffect(() => {
        if (!panel) return;
        for (const record of records.current) {
            if (record.overflown && !overflown.includes(record)) {
                record.anchor.appendChild(record.container);
                record.container.style.display = '';
                record.overflown = false;
            }
        }
        for (const record of overflown) {
            record.overflown = true;
            record.container.style.display = record.priority === 'disappear' ? 'none' : '';
            panel.appendChild(record.container);
        }
    }, [overflown, panel]);

    // the panel waits in the hidden area while the popover is closed
    useLayoutEffect(() => {
        if (panel && !panel.parentElement) hiddenArea.current?.appendChild(panel);
    }, [panel]);

    // Tab wraps inside the panel: its items are React children of the toolbar, not of the popover body, so the
    // body's own focus trap (a React handler) does not see their key presses
    useLayoutEffect(() => {
        if (!panel) return;
        const trap = (event: globalThis.KeyboardEvent) => {
            if (event.key !== 'Tab' || event.ctrlKey || event.altKey || event.metaKey) return;
            const list = tabbables(panel);
            if (!list.length) return;
            const edge = event.shiftKey ? list[0] : list[list.length - 1];
            if (document.activeElement !== edge) return;
            event.preventDefault();
            (event.shiftKey ? list[list.length - 1] : list[0])!.focus();
        };
        panel.addEventListener('keydown', trap);
        return () => panel.removeEventListener('keydown', trap);
    }, [panel]);

    // recompute the overflow when the items or options change (and after every render: widths may have changed)
    useLayoutEffect(() => recompute());

    // ... and when the toolbar, its title or an item changes size
    const observer = useRef<ResizeObserver | null>(null);
    useLayoutEffect(() => {
        const resize = new ResizeObserver(() => recompute());
        observer.current = resize;
        return () => {
            resize.disconnect();
            observer.current = null;
        };
    }, [recompute]);
    useLayoutEffect(() => {
        const resize = observer.current;
        const root = host.current;
        if (!resize || !root) return;
        resize.observe(root);
        const heading = root.querySelector(HEADING);
        if (heading) resize.observe(heading);
        for (const record of records.current) {
            const element = itemElement(record);
            if (element) resize.observe(element);
        }
    });

    const hasOverflow = overflown.length > 0;
    // nothing to show: the popover closes
    useLayoutEffect(() => {
        if (!hasOverflow && open) setOpen(false);
    }, [hasOverflow, open, setOpen]);

    /** Shows the panel in the popover body while it is open. */
    const slot = useCallback(
        (node: HTMLDivElement | null) => {
            if (!node || !panel) return;
            node.appendChild(panel);
            return () => {
                hiddenArea.current?.appendChild(panel);
            };
        },
        [panel]
    );

    const activate = (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !active || event.target !== event.currentTarget) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.currentTarget.click();
    };

    const titled = !!title || Children.toArray(children).some((child) => isValidElement(child) && child.type === Title);

    return (
        <div
            role="toolbar"
            tabIndex={active ? 0 : undefined}
            {...props}
            aria-orientation={props['aria-orientation'] ?? 'horizontal'}
            aria-labelledby={props['aria-labelledby'] ?? (title ? titleId : undefined)}
            id={id}
            ref={(node) => {
                host.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            onKeyDown={activate}
            className={cn(
                'm-0 box-border flex h-(--tb-h) min-h-(--tb-h) items-center gap-2 py-0 ps-(--tb-ps) pe-2 [&>:not([role=heading])]:shrink-0 [&>[data-toolbar-item]>*>*]:shrink-0',
                'border-b border-solid border-sap-group-title-border-color font-sap-font-family text-sap-font-size',
                '[--tb-h:2.75rem] compact:[--tb-h:2rem] [--tb-sep-h:2rem] compact:[--tb-sep-h:1.5rem] [--tb-ps:0.5rem]',
                variant === 'transparent' ? 'bg-transparent' : 'bg-sap-toolbar-background',
                variant === 'info' && [
                    'relative [--tb-h:2rem] compact:[--tb-h:2rem] bg-sap-infobar-non-interactive-background text-sap-list-text-color',
                    // labels take the text colour of the info bar
                    '[&_[data-toolbar-label]]:text-inherit',
                    '[&_[data-glyph]]:h-4 [&_[data-glyph]]:text-base [&_[data-glyph]]:leading-4 [&_[data-glyph]]:text-sap-list-text-color'
                ],
                variant === 'info' &&
                    active && [
                        'cursor-pointer outline-none bg-sap-infobar-background text-sap-infobar-text-color',
                        'enabled-hover:bg-sap-infobar-hover-background active:bg-sap-infobar-active-background',
                        "focus:after:pointer-events-none focus:after:absolute focus:after:inset-px focus:after:content-['']",
                        'focus:after:border-(length:--sapContent_FocusWidth) focus:after:[border-style:var(--sapContent_FocusStyle)] focus:after:border-sap-content-focus-color'
                    ],
                titled && '[--tb-h:2.75rem] compact:[--tb-h:2.75rem] [--tb-ps:1rem] bg-sap-group-title-background',
                clearBorder && 'border-b-0',
                className
            )}
        >
            {title && (
                <Title
                    render={<span />}
                    role="heading"
                    aria-level={headingLevel}
                    headerSize={4}
                    title={title}
                    id={titleId}
                    className="min-w-[6.25rem] shrink truncate text-sap-group-title-font-size leading-[normal] text-sap-group-title-text-color"
                >
                    {title}
                </Title>
            )}
            <ToolbarContext.Provider value={context}>{children}</ToolbarContext.Provider>
            {hasOverflow && (
                <>
                    {!flexibleSpacers && <ToolbarSpacer />}
                    <ToolbarSeparator />
                    <Popover placement="bottom-end" open={open} onOpenChange={(next) => setOpen(next)}>
                        <PopoverTrigger
                            render={
                                <Button
                                    variant="transparent"
                                    glyph="overflow"
                                    aria-haspopup="true"
                                    aria-label={moreLabel}
                                    title={moreLabel}
                                />
                            }
                        />
                        {/* the popover is a dialog: named like its "More" button */}
                        <PopoverBody aria-label={moreLabel}>
                            <div ref={slot} />
                        </PopoverBody>
                    </Popover>
                </>
            )}
            <div hidden ref={hiddenArea} />
        </div>
    );
}
