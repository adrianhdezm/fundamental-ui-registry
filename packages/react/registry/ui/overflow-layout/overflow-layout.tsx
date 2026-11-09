/*
 * Port of @fundamental-ngx/core (overflow-layout) with the visual design of fundamental-styles,
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
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';

/** What an item knows about where it renders: `<OverflowItem>{({ hidden }) => …}</OverflowItem>`. */
export interface OverflowItemContext<T = unknown> {
    /** True when the item renders in the overflow popover (or the custom "more" control). */
    hidden: boolean;
    /** Index among the items of the same place (the row or the popover). */
    index: number;
    first: boolean;
    last: boolean;
    /** Index among all items. */
    globalIndex: number;
    /** The `item` data of the `OverflowItem`. */
    item: T;
}

/** An item of the layout as the "more" control and `onHiddenItemsChange` see it. */
export interface OverflowItemRef<T = unknown> {
    /** The React key of the item (as `Children.toArray` gives it). */
    key: string;
    /** The `item` data of the `OverflowItem` (undefined for a plain child). */
    item: T;
    globalIndex: number;
    /** True when the item has `forceVisibility`. */
    forced: boolean;
}

export interface OverflowItemProps<T = unknown> {
    /** Data passed to the item context, to `renderMore` and to `onHiddenItemsChange`. */
    item?: T;
    /** Keeps the item in the row, also while it is hidden (it then moves out of the popover). */
    forceVisibility?: boolean;
    /** Called when the item moves into (`true`) or out of (`false`) the overflow popover. */
    onHiddenChange?: (hidden: boolean) => void;
    /** The content, or a function of the item context. */
    children?: ReactNode | ((context: OverflowItemContext<T>) => ReactNode);
}

const ItemContext = createContext<OverflowItemContext | null>(null);

/** The context of the `OverflowItem` the component renders in, or `null` outside of an overflow layout. */
export function useOverflowItem<T = unknown>(): OverflowItemContext<T> | null {
    return useContext(ItemContext) as OverflowItemContext<T> | null;
}

/**
 * An item of an `OverflowLayout`, with data, forced visibility and the hidden state (Angular's `fdOverflowItemRef`
 * and `fdOverflowLayoutItem`). Use it as a direct child of the layout; plain children are items too.
 *
 * ```tsx
 * <OverflowItem key={tag} item={tag} forceVisibility={tag === selected}>
 *     {({ hidden }) => <InfoLabel>{hidden ? `${tag} (hidden)` : tag}</InfoLabel>}
 * </OverflowItem>
 * ```
 */
export function OverflowItem<T = unknown>({ children }: OverflowItemProps<T>): ReactNode {
    const context = useContext(ItemContext) as OverflowItemContext<T> | null;
    if (typeof children !== 'function') return children;
    return context ? children(context) : null;
}

/** Imperative actions of an overflow layout, through `actionsRef`. */
export interface OverflowLayoutActions {
    /** Re-measures the items, e.g. after their content changed width. */
    triggerRecalculation(): void;
}

export interface OverflowLayoutProps<T = unknown> extends Omit<ComponentProps<'div'>, 'children'> {
    /** The items: `OverflowItem` elements or any other elements, each with a `key`. */
    children?: ReactNode;
    /** Upper limit of items in the row. */
    maxVisibleItems?: number;
    /** Side of the "more" control (`left` is the start in RTL too); items overflow from the start when it is `left`. */
    showMorePosition?: 'left' | 'right';
    /** Renders the "more" control (Angular's `renderShowMoreButton`); without it hidden items are not shown. */
    showMoreButton?: boolean;
    /** Lists hidden items in reverse order in the popover. */
    reverseHiddenItems?: boolean;
    /** Arrow keys move focus between the focusable elements of the visible items. */
    enableKeyboardNavigation?: boolean;
    /** Role of the row of items (and the popover's list), e.g. `list` or `tablist`; items get `listitem` with `list`. */
    ariaRole?: string;
    /** Accessible name of the row of items, e.g. of a tab list. */
    ariaLabel?: string;
    /** Text of the "more" button and name of its popover. */
    moreItemsButtonText?: (count: number) => string;
    /** A custom "more" control in place of the button and popover (Angular's `fdOverflowExpand`). */
    renderMore?: (hiddenItems: OverflowItemRef<T>[]) => ReactNode;
    onVisibleItemsCountChange?: (count: number) => void;
    onHiddenItemsCountChange?: (count: number) => void;
    onHiddenItemsChange?: (hiddenItems: OverflowItemRef<T>[]) => void;
    /** Imperative actions: `triggerRecalculation()`. */
    actionsRef?: Ref<OverflowLayoutActions>;
}

interface Entry {
    key: string;
    node: ReactNode;
    props: OverflowItemProps<unknown> | null;
    ref: OverflowItemRef<unknown>;
}

interface Measurement {
    widths: ReadonlyMap<string, number>;
    more: number | null;
    available: number;
}

const defaultMoreText = (count: number) => `${count} more`;
/** Width of the "more" control until it renders for the first time (Angular's estimate). */
const MORE_ESTIMATE = 96;
const FOCUSABLE = ':scope > [data-overflow-item] :is(a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]))';

function isItem(node: ReactNode): node is ReactElement<OverflowItemProps<unknown>> {
    return isValidElement(node) && node.type === OverflowItem;
}

/** Splits the items into the visible row and the hidden ones, as Angular's layout. */
function computeLayout(
    entries: Entry[],
    { widths, more, available }: Measurement,
    max: number,
    fromEnd: boolean,
    reverse: boolean
): { visible: Entry[]; hidden: Entry[] } {
    const width = (entry: Entry) => widths.get(entry.key) ?? 0;
    const total = entries.reduce((sum, entry) => sum + width(entry), 0);
    if (total <= available && entries.length <= max) return { visible: entries, hidden: [] };

    const forced = entries.filter((entry) => entry.ref.forced);
    let budget = available - (more ?? MORE_ESTIMATE) - forced.reduce((sum, entry) => sum + width(entry), 0);
    let slots = max - forced.length;
    const kept = new Set<Entry>(forced);
    let full = false;
    for (const entry of fromEnd ? [...entries].reverse() : entries) {
        if (entry.ref.forced) continue;
        if (!full && slots > 0 && width(entry) <= budget) {
            kept.add(entry);
            budget -= width(entry);
            slots--;
        } else {
            full = true;
        }
    }
    const hidden = entries.filter((entry) => !kept.has(entry));
    return { visible: entries.filter((entry) => kept.has(entry)), hidden: reverse ? hidden.reverse() : hidden };
}

function sameMeasurement(a: Measurement, b: Measurement): boolean {
    if (a.available !== b.available || a.more !== b.more || a.widths.size !== b.widths.size) return false;
    for (const [key, width] of a.widths) if (b.widths.get(key) !== width) return false;
    return true;
}

const sameKeys = (a: readonly OverflowItemRef[], b: readonly OverflowItemRef[]) =>
    a.length === b.length && a.every((ref, i) => ref.key === b[i]!.key);

/**
 * Overflow layout: shows as many items as fit in one row (and at most `maxVisibleItems`); the rest go into a
 * "N more" popover. Items with `forceVisibility` always stay in the row. Arrow keys move focus between the
 * focusable elements of the visible items.
 *
 * ```tsx
 * <OverflowLayout maxVisibleItems={5} ariaRole="list" ariaLabel="Tags">
 *     {tags.map((tag) => (
 *         <InfoLabel key={tag} className="me-2">{tag}</InfoLabel>
 *     ))}
 * </OverflowLayout>
 * ```
 */
export function OverflowLayout<T = unknown>({
    children,
    maxVisibleItems = Number.POSITIVE_INFINITY,
    showMorePosition = 'right',
    showMoreButton = true,
    reverseHiddenItems = false,
    enableKeyboardNavigation = true,
    ariaRole,
    ariaLabel,
    moreItemsButtonText = defaultMoreText,
    renderMore,
    onVisibleItemsCountChange,
    onHiddenItemsCountChange,
    onHiddenItemsChange,
    actionsRef,
    className,
    onKeyDown,
    ref,
    ...props
}: OverflowLayoutProps<T>) {
    const root = useRef<HTMLDivElement | null>(null);
    const row = useRef<HTMLDivElement | null>(null);
    const moreContainer = useRef<HTMLDivElement | null>(null);
    const [measurement, setMeasurement] = useState<Measurement>(() => ({
        widths: new Map(),
        more: null,
        available: Number.POSITIVE_INFINITY
    }));

    const entries = useMemo<Entry[]>(
        () =>
            Children.toArray(children).map((node, globalIndex) => {
                const key = isValidElement(node) && node.key != null ? String(node.key) : String(globalIndex);
                const itemProps = isItem(node) ? node.props : null;
                return {
                    key,
                    node,
                    props: itemProps,
                    ref: { key, item: itemProps?.item, globalIndex, forced: !!itemProps?.forceVisibility }
                };
            }),
        [children]
    );
    const { visible, hidden } = computeLayout(
        entries,
        measurement,
        maxVisibleItems,
        showMorePosition === 'left',
        reverseHiddenItems
    );
    const hasMore = showMoreButton && hidden.length > 0;

    const measure = useCallback(() => {
        const host = root.current;
        const items = row.current;
        if (!host || !items) return;
        setMeasurement((previous) => {
            const widths = new Map(previous.widths);
            items.querySelectorAll<HTMLElement>(':scope > [data-overflow-item]').forEach((el) => {
                const key = el.dataset['overflowItem']!;
                const style = getComputedStyle(el);
                const width =
                    el.getBoundingClientRect().width + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
                widths.set(key, Math.ceil(width));
            });
            const more = moreContainer.current
                ? Math.ceil(moreContainer.current.getBoundingClientRect().width)
                : (previous.more ?? MORE_ESTIMATE);
            const next = { widths, more, available: host.clientWidth };
            return sameMeasurement(previous, next) ? previous : next;
        });
    }, []);

    useImperativeHandle(actionsRef, () => ({ triggerRecalculation: measure }), [measure]);

    // re-measure when the layout, the row, an item or the "more" control changes size
    const observer = useRef<ResizeObserver | null>(null);
    const observed = useRef(new Set<Element>());
    // a layout effect, so the observer exists when the next one observes the first render
    useLayoutEffect(() => {
        const resize = new ResizeObserver(() => measure());
        observer.current = resize;
        return () => {
            resize.disconnect();
            observer.current = null;
            observed.current = new Set();
        };
    }, [measure]);
    useLayoutEffect(() => {
        const resize = observer.current;
        if (!resize) return;
        const current = new Set<Element>(
            [root.current, row.current, moreContainer.current].filter((el): el is HTMLDivElement => !!el)
        );
        row.current?.querySelectorAll(':scope > [data-overflow-item]').forEach((el) => current.add(el));
        for (const el of observed.current) if (!current.has(el)) resize.unobserve(el);
        for (const el of current) if (!observed.current.has(el)) resize.observe(el);
        observed.current = current;
    });

    // measure before paint when items come or go, and when the "more" control appears with its real width
    const signature = entries.map((entry) => String(entry.key)).join('\u0000');
    useLayoutEffect(() => measure(), [measure, signature, hasMore]);

    // outputs, after the layout changed
    const announced = useRef(new Map<string, boolean>());
    const emitted = useRef<{ visible: number; hidden: OverflowItemRef<T>[] } | null>(null);
    useEffect(() => {
        const hiddenKeys = new Set(hidden.map((entry) => entry.key));
        const next = new Map<string, boolean>();
        for (const entry of entries) {
            const isHidden = hiddenKeys.has(entry.key);
            const before = announced.current.get(entry.key);
            if (before !== undefined && before !== isHidden) entry.props?.onHiddenChange?.(isHidden);
            next.set(entry.key, isHidden);
        }
        announced.current = next;

        const refs = hidden.map((entry) => entry.ref as OverflowItemRef<T>);
        const previous = emitted.current;
        emitted.current = { visible: visible.length, hidden: refs };
        if (!previous || previous.visible !== visible.length) onVisibleItemsCountChange?.(visible.length);
        if (!previous || previous.hidden.length !== refs.length) onHiddenItemsCountChange?.(refs.length);
        if (!previous || !sameKeys(previous.hidden, refs)) onHiddenItemsChange?.(refs);
    });

    const onArrowKey = (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !enableKeyboardNavigation) return;
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        const focusables = Array.from(row.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
        const index = focusables.indexOf(document.activeElement as HTMLElement);
        if (index < 0) return;
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const next = focusables[index + ((event.key === 'ArrowRight') !== rtl ? 1 : -1)];
        if (next) {
            event.preventDefault();
            next.focus();
        }
    };

    const context = (entry: Entry, index: number, list: Entry[], isHidden: boolean): OverflowItemContext => ({
        hidden: isHidden,
        index,
        first: index === 0,
        last: index === list.length - 1,
        globalIndex: entry.ref.globalIndex,
        item: entry.ref.item
    });
    const itemRole = ariaRole === 'list' ? 'listitem' : undefined;
    const moreText = moreItemsButtonText(hidden.length);

    const more = hasMore && (
        <div ref={moreContainer} className="m-0 flex shrink-0 items-center p-0">
            {renderMore ? (
                renderMore(hidden.map((entry) => entry.ref as OverflowItemRef<T>))
            ) : (
                <Popover placement="bottom" noArrow={false}>
                    <PopoverTrigger render={<Button variant="transparent" menu label={moreText} />} />
                    {/* the popover is a dialog: named like its "N more" control */}
                    <PopoverBody aria-label={moreText}>
                        <div className="m-0 flex max-w-[19.5rem] flex-wrap gap-2 p-2 whitespace-normal" role={ariaRole}>
                            {hidden.map((entry, i) => (
                                <div key={entry.key} className="flex" role={itemRole}>
                                    <ItemContext.Provider value={context(entry, i, hidden, true)}>
                                        {entry.node}
                                    </ItemContext.Provider>
                                </div>
                            ))}
                        </div>
                    </PopoverBody>
                </Popover>
            )}
        </div>
    );

    return (
        <div
            {...props}
            ref={(node) => {
                root.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            className={cn(
                'm-0 box-border flex w-full items-center justify-between gap-1 p-0 font-sap-font-family text-sap-font-size text-sap-text-color',
                className
            )}
            onKeyDown={onArrowKey}
        >
            {showMorePosition === 'left' && more}
            <div ref={row} className="m-0 inline-flex min-w-0 items-center p-0" role={ariaRole} aria-label={ariaLabel}>
                {visible.map((entry, i) => (
                    <div
                        key={entry.key}
                        data-overflow-item={entry.key}
                        className="flex shrink-0 items-center"
                        role={itemRole}
                    >
                        <ItemContext.Provider value={context(entry, i, visible, false)}>
                            {entry.node}
                        </ItemContext.Provider>
                    </div>
                ))}
            </div>
            {showMorePosition === 'right' && more}
        </div>
    );
}
