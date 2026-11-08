/*
 * Port of @fundamental-ngx/core (grid-list) with the visual design of fundamental-styles,
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
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type CSSProperties,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    type Ref,
    type RefCallback
} from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { Icon } from '@/ui/icon/icon';
import { ObjectStatus } from '@/ui/object-status/object-status';
import { Radio, RadioGroup } from '@/ui/radio/radio';
import { Toolbar, ToolbarLabel } from '@/ui/toolbar/toolbar';

export type GridListSelectionMode =
    'none' | 'delete' | 'singleSelect' | 'singleSelectLeft' | 'singleSelectRight' | 'multiSelect';
export type GridListItemType = 'inactive' | 'active' | 'detail' | 'detailsAndActive' | 'navigation';
export type GridListItemState = 'unread' | 'locked' | 'error' | 'draft';
export type GridListItemStatus = 'success' | 'warning' | 'error' | 'neutral';

/** What changed with a selection (Angular's `selectionChange` event without the selection itself). */
export interface GridListSelectionDetails<T = unknown> {
    added: T[];
    removed: T[];
    /** Indexes of the items whose state changed. */
    index: number[];
}

/** Passed to the item callbacks: the index of the item in the list and its value. */
export interface GridListItemEvent<T = unknown> {
    index: number;
    value: T | undefined;
}

/** Column spans for S, M, L and XL. */
type Spans = [number, number, number, number];

/**
 * Parses a layout pattern such as 'XL4-L3-M2-S1'. For the list the numbers are items per row
 * (12, 6, 4, 3, 2 or 1); for an item they are column spans out of 12. Missing sizes inherit from
 * the next smaller one; S defaults to the full width.
 */
export function parseGridListLayout(pattern: string, itemsPerRow = true): Spans {
    const spans: (number | undefined)[] = [undefined, undefined, undefined, undefined];
    const order = ['S', 'M', 'L', 'XL'];
    for (const [, size, num] of pattern.toUpperCase().matchAll(/(XL|L|M|S)(\d+)/g)) {
        const n = Number(num);
        const valid = itemsPerRow ? [1, 2, 3, 4, 6, 12].includes(n) : n >= 1 && n <= 12;
        if (!valid) throw new Error(`Invalid grid list layout pattern: ${pattern}`);
        spans[order.indexOf(size)] = itemsPerRow ? 12 / n : n;
    }
    let previous = 12;
    return spans.map((span) => (previous = span ?? previous)) as Spans;
}

/** The spans as the `--gl-*` custom properties the columns read. */
function spanStyle(spans: Spans | undefined): CSSProperties | undefined {
    if (!spans) return undefined;
    return { '--gl-s': spans[0], '--gl-m': spans[1], '--gl-l': spans[2], '--gl-xl': spans[3] } as CSSProperties;
}

const STATUS_COLOR: Record<GridListItemStatus, string> = {
    success: 'bg-sap-success-border-color',
    warning: 'bg-sap-warning-border-color',
    error: 'bg-sap-error-border-color',
    neutral: 'bg-sap-neutral-border-color'
};

/** Interactive elements inside an item; they are reached with Enter or F2 and left with Escape or F2. */
const INNER_FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([data-grid-list-item])';

/** An item card of a grid list. */
const ITEM = '[data-grid-list-item]';

/** Column classes shared by the full-width rows (title bar, group header, footer and more button). */
const FULL_ROW = 'col-span-12 block min-w-0';

interface GridListContextValue {
    id: string;
    mode: GridListSelectionMode;
    selectable: boolean;
    isSelected(key: unknown): boolean;
    /** Selects (or deselects) an item; with `range` in multi selection, the range from the last toggled item. */
    toggle(key: unknown, select: boolean, range?: boolean): void;
    /** Silently takes the `selected` prop of an item into the selection. */
    sync(key: unknown, selected: boolean): void;
    register(element: HTMLElement, key: unknown): () => void;
    /** Index of an item card among the items of the list. */
    indexOf(element: HTMLElement): number;
    /** Makes the item card the tab stop. */
    setActive(element: HTMLElement): void;
}

const GridListContext = createContext<GridListContextValue | null>(null);

/**
 * Roles of a full-width row inside a list: a list item, or a row with one cell when the list is a selectable grid,
 * so the list keeps valid children. Outside a list, none.
 */
function useRowRoles(): { row: string | undefined; cell: string | undefined } {
    const list = use(GridListContext);
    return {
        row: list ? (list.selectable ? 'row' : 'listitem') : undefined,
        cell: list?.selectable ? 'gridcell' : undefined
    };
}

/** Sets every ref in the list. */
function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
}

/** Imperative actions of a grid list, through `actionsRef`. */
export interface GridListActions {
    /** Deselects all items (and reports it). */
    clearSelection(): void;
    /** Focuses the item at the index and makes it the tab stop. */
    focusItem(index: number): void;
}

export interface GridListProps<T = unknown> extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
    /**
     * `multiSelect` (check boxes), `singleSelect` (the item itself), `singleSelectLeft` and `singleSelectRight`
     * (radio buttons), `delete` (a delete button per item) or `none` (default).
     */
    selectionMode?: GridListSelectionMode;
    /** Items per row per screen size, e.g. 'XL4-L3-M2-S1' (the default): 12, 6, 4, 3, 2 or 1. */
    layoutPattern?: string;
    /** Width of the list, e.g. '40rem'. */
    width?: string;
    /** Values of the selected items (controlled). An item without `value` is selected by its generated id. */
    value?: T[];
    /** Values of the initially selected items (uncontrolled). */
    defaultValue?: T[];
    /** Called with the values of the selected items and what changed when the user changes the selection. */
    onValueChange?: (value: T[], details: GridListSelectionDetails<T>) => void;
    /** Imperative actions: `clearSelection()`, `focusItem(index)`. */
    actionsRef?: Ref<GridListActions>;
}

/**
 * Grid list: items (cards) in a responsive grid with optional single or multiple selection, delete mode and arrow
 * key navigation. A selectable list is a `grid` of `row`s with one `gridcell` each, otherwise a `list`. One item is
 * in the tab order: arrow keys move between the items (up and down by row), Home and End to the first and last,
 * Enter or F2 into the item and Escape or F2 back, Space (or Enter) selects; in multi selection Shift with the arrow
 * keys, Home, End or a click selects ranges.
 *
 * ```tsx
 * <GridList aria-label="Products" selectionMode="multiSelect" onValueChange={setSelected}>
 *     <GridListTitleBar title="Products" />
 *     {products.map((product) => (
 *         <GridListItem key={product.id} value={product.id} title={product.name} description={product.vendor}>
 *             <GridListItemBody>{product.address}</GridListItemBody>
 *         </GridListItem>
 *     ))}
 * </GridList>
 * ```
 */
export function GridList<T = unknown>({
    selectionMode = 'none',
    layoutPattern = 'XL4-L3-M2-S1',
    width,
    value,
    defaultValue,
    onValueChange,
    actionsRef,
    id: idProp,
    ref,
    className,
    style,
    onKeyDown,
    children,
    ...props
}: GridListProps<T>) {
    const autoId = useId();
    const id = idProp ?? `fd-grid-list-${autoId}`;
    const rootRef = useRef<HTMLDivElement>(null);
    const registry = useRef(new Map<HTMLElement, unknown>());
    const activeIndex = useRef(0);
    const rangeAnchor = useRef<number | null>(null);
    const [uncontrolled, setUncontrolled] = useState<unknown[]>(() => defaultValue ?? []);
    const controlled = value !== undefined;
    const selection: unknown[] = controlled ? value : uncontrolled;
    // the latest selection, also between a change and the next render
    const selectionRef = useRef(selection);
    selectionRef.current = selection;
    const changeRef = useRef(onValueChange);
    changeRef.current = onValueChange;
    const selectable = selectionMode !== 'none' && selectionMode !== 'delete';
    const spans = parseGridListLayout(layoutPattern);

    /** The item cards of this list (not of nested lists), in document order. */
    const items = useCallback((): HTMLElement[] => {
        const root = rootRef.current;
        if (!root) return [];
        return [...root.querySelectorAll<HTMLElement>(ITEM)].filter(
            (el) => el.parentElement?.closest('[data-slot=grid-list]') === root && registry.current.has(el)
        );
    }, []);

    /** Keeps one item in the tab order: the last focused one, or the first. */
    const syncTabStops = useCallback(() => {
        const cards = items();
        activeIndex.current = Math.max(0, Math.min(activeIndex.current, cards.length - 1));
        cards.forEach((el, i) => {
            // the attribute, not the property: an element without it reads -1 but is not focusable
            const tabIndex = i === activeIndex.current ? '0' : '-1';
            if (el.getAttribute('tabindex') !== tabIndex) el.setAttribute('tabindex', tabIndex);
        });
    }, [items]);

    useLayoutEffect(syncTabStops);
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const observer = new MutationObserver(syncTabStops);
        observer.observe(root, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [syncTabStops]);

    const commit = (next: unknown[], details: GridListSelectionDetails<unknown>) => {
        selectionRef.current = next;
        if (!controlled) setUncontrolled(next);
        changeRef.current?.(next as T[], details as GridListSelectionDetails<T>);
    };

    const setRange = (from: number, to: number, select: boolean) => {
        const range = items().slice(from, to + 1);
        const keys = range.map((el) => registry.current.get(el));
        const current = selectionRef.current;
        const changed = keys.filter((k) => current.includes(k) !== select);
        if (!changed.length) return;
        commit(select ? [...current, ...changed] : current.filter((k) => !changed.includes(k)), {
            added: select ? changed : [],
            removed: select ? [] : changed,
            index: range.map((_, i) => from + i)
        });
    };

    const isSelected = (key: unknown) => selection.includes(key);

    const toggle = (key: unknown, select: boolean, range = false) => {
        const index = items().findIndex((el) => registry.current.get(el) === key);
        const current = selectionRef.current;
        if (selectionMode !== 'multiSelect') {
            if (!select || current.includes(key)) return;
            commit([key], { added: [key], removed: current, index: [index] });
            return;
        }
        const anchor = rangeAnchor.current;
        const from = range && anchor !== null ? Math.min(anchor, index) : index;
        const to = range && anchor !== null ? Math.max(anchor, index) : index;
        rangeAnchor.current = index;
        setRange(from, to, select);
    };

    const sync = (key: unknown, selected: boolean) => {
        if (controlled) return;
        setUncontrolled((current) => {
            if (selected === current.includes(key)) return current;
            if (!selected) return current.filter((k) => k !== key);
            return selectionMode === 'multiSelect' ? [...current, key] : [key];
        });
    };

    const register = useCallback((element: HTMLElement, key: unknown) => {
        registry.current.set(element, key);
        return () => {
            registry.current.delete(element);
        };
    }, []);

    const indexOf = (element: HTMLElement) => items().indexOf(element);

    const setActive = (element: HTMLElement) => {
        const index = indexOf(element);
        if (index < 0) return;
        activeIndex.current = index;
        syncTabStops();
    };

    const clearSelection = () => {
        const removed = selectionRef.current;
        commit([], { added: [], removed, index: [] });
    };

    useImperativeHandle(actionsRef, () => ({
        clearSelection,
        focusItem: (index: number) => items()[index]?.focus()
    }));

    // a mode change keeps at most what the new mode allows
    useEffect(() => {
        const current = selectionRef.current;
        const kept = !selectable ? [] : selectionMode === 'multiSelect' ? current : current.slice(0, 1);
        if (kept.length === current.length) return;
        commit(kept, { added: [], removed: current.slice(kept.length), index: [] });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectionMode]);

    /** The item in the next (or previous) row closest to the horizontal position of the current one. */
    const verticalNeighbour = (cards: HTMLElement[], index: number, down: boolean): number | undefined => {
        const rects = cards.map((el) => el.getBoundingClientRect());
        const current = rects[index];
        const candidates = rects
            .map((rect, i) => ({ rect, i }))
            .filter(({ rect }) => (down ? rect.top > current.bottom - 1 : rect.bottom < current.top + 1));
        if (!candidates.length) return undefined;
        const rowTop = down
            ? Math.min(...candidates.map(({ rect }) => rect.top))
            : Math.max(...candidates.map(({ rect }) => rect.top));
        const center = current.left + current.width / 2;
        return candidates
            .filter(({ rect }) => Math.abs(rect.top - rowTop) < 1)
            .reduce((best, c) =>
                Math.abs(c.rect.left + c.rect.width / 2 - center) <
                Math.abs(best.rect.left + best.rect.width / 2 - center)
                    ? c
                    : best
            ).i;
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const cards = items();
        const index = cards.indexOf(event.target as HTMLElement);
        if (index < 0) return;
        const multi = selectionMode === 'multiSelect';
        const isSelectedAt = (i: number) => selectionRef.current.includes(registry.current.get(cards[i]));
        let next: number | undefined;
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowRight': {
                const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
                next = index + ((event.key === 'ArrowRight') !== rtl ? 1 : -1);
                break;
            }
            case 'ArrowUp':
            case 'ArrowDown':
                next = verticalNeighbour(cards, index, event.key === 'ArrowDown');
                break;
            case 'Home':
            case 'End':
                next = event.key === 'Home' ? 0 : cards.length - 1;
                if (event.shiftKey && multi) {
                    setRange(Math.min(index, next), Math.max(index, next), isSelectedAt(index));
                }
                break;
            default:
                return;
        }
        event.preventDefault();
        if (next === undefined || next < 0 || next >= cards.length) return;
        // shift + arrow carries the selection state of the current item over
        if (event.shiftKey && multi && event.key.startsWith('Arrow')) {
            const select = isSelectedAt(index);
            if (isSelectedAt(next) !== select) setRange(next, next, select);
        }
        cards[next].focus();
    };

    const context: GridListContextValue = {
        id,
        mode: selectionMode,
        selectable,
        isSelected,
        toggle,
        sync,
        register,
        indexOf,
        setActive
    };

    return (
        <GridListContext value={context}>
            <div
                role={selectable ? 'grid' : 'list'}
                aria-multiselectable={selectionMode === 'multiSelect' || undefined}
                {...props}
                ref={mergeRefs(rootRef, ref)}
                id={id}
                data-slot="grid-list"
                style={{ width, ...spanStyle(spans), ...style }}
                onKeyDown={handleKeyDown}
                className={cn(
                    'm-0 box-border grid grid-cols-12 gap-2 p-1 font-sap-font-family text-sap-font-size text-sap-text-color min-[600px]:gap-4 min-[600px]:p-2',
                    className
                )}
            >
                {children}
            </div>
        </GridListContext>
    );
}

export type GridListItemImageProps = useRender.ComponentProps<'span'>;

/**
 * Avatar or image at the start of an item body: renders its `render` element, e.g.
 * `<GridListItemImage render={<Avatar size="s" image="…" aria-label="…" />} />`, or a `<span>` around its children.
 */
export function GridListItemImage({ render, className, ...props }: GridListItemImageProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: { ...props, 'data-gl-image': '', className: cn('me-3 shrink-0', className) }
    });
}

export type GridListItemBodyProps = useRender.ComponentProps<'div'>;

/** Content of an item body (a `<div>`; `render` renders another element, e.g. an `<img>`). */
export function GridListItemBody({ render, className, ...props }: GridListItemBodyProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border w-full p-0 text-sap-list-text-color [[data-gl-header]+&]:pt-4 [[data-gl-image]+&]:max-w-[calc(100%_-_3.75rem)]',
                className
            )
        }
    });
}

export type GridListItemToolbarProps = ComponentProps<'div'>;

/** Custom content in the toolbar row of an item. */
export function GridListItemToolbar({ className, ...props }: GridListItemToolbarProps) {
    return <div {...props} data-gl-toolbar="" className={cn('flex min-w-0 items-center gap-2', className)} />;
}

export type GridListItemFooterBarProps = ComponentProps<'div'>;

/** Custom content at the bottom of an item; replaces the state actions. */
export function GridListItemFooterBar({ className, ...props }: GridListItemFooterBarProps) {
    return <div {...props} className={cn('block', className)} />;
}

export interface GridListItemProps<T = unknown> extends Omit<ComponentProps<'div'>, 'title'> {
    /** Value of the item in the selection of the list and in the callbacks. */
    value?: T;
    /**
     * Selected state. In a list, a defined value is taken into an uncontrolled list's selection whenever it changes
     * (Angular's `selected` input); an item outside a list shows it.
     */
    selected?: boolean;
    /**
     * `inactive` (default), `active` (pressable), `detail` (a details button), `detailsAndActive` (both) or
     * `navigation` (pressable, with a navigation arrow).
     */
    type?: GridListItemType;
    /** `unread` (bold), `error` (an error status), `locked` and `draft` (a button at the bottom). */
    state?: GridListItemState | null;
    /** Highlight at the start edge. */
    status?: GridListItemStatus | null;
    /** Counter in the toolbar row. */
    counter?: number | null;
    /** Shows the navigated indicator on interactive items. */
    navigated?: boolean;
    title?: string | null;
    /** `aria-level` of the title (default 3). */
    titleLevel?: number;
    description?: string | null;
    /** Height of the content instead of the row height. */
    autoHeight?: boolean;
    noPadding?: boolean;
    /** Column spans of this item, e.g. 'XL6-L6-M12'. */
    layoutItemPattern?: string | null;
    /** Fixed width (min and max), e.g. '12rem'. */
    width?: string | null;
    /** Clicks in the custom toolbar content do not activate the item. */
    disableToolbarClick?: boolean;
    detailsLabel?: string;
    deleteLabel?: string;
    lockedLabel?: string;
    draftLabel?: string;
    errorLabel?: string;
    counterLabel?: (count: number) => string;
    statusLabel?: (status: GridListItemStatus) => string;
    /** Activation of active, detailsAndActive items, and of any item by keyboard without selection. */
    onPress?: (event: GridListItemEvent<T>) => void;
    onDetail?: (event: GridListItemEvent<T>) => void;
    onDelete?: (event: GridListItemEvent<T>) => void;
    onNavigate?: (event: GridListItemEvent<T>) => void;
    /** Any click on the item that is not a navigation. */
    onCardClick?: (event: GridListItemEvent<T>) => void;
    onDraft?: (event: GridListItemEvent<T>) => void;
    onLocked?: (event: GridListItemEvent<T>) => void;
}

/**
 * An item (card) of a grid list. Children: a `GridListItemImage`, `GridListItemBody` content, a
 * `GridListItemToolbar` (custom toolbar content) and a `GridListItemFooterBar` (replaces the state actions); the
 * title and description go between the image and the body. Native props go to the column around the card; `id`,
 * `aria-label` and `aria-labelledby` to the card.
 */
export function GridListItem<T = unknown>({
    value,
    selected: selectedProp,
    type = 'inactive',
    state,
    status,
    counter,
    navigated = false,
    title,
    titleLevel = 3,
    description,
    autoHeight = false,
    noPadding = false,
    layoutItemPattern,
    width,
    disableToolbarClick = false,
    detailsLabel = 'Details',
    deleteLabel = 'Delete',
    lockedLabel = 'Locked',
    draftLabel = 'Draft',
    errorLabel = 'Contains errors',
    counterLabel = (count) => `Item has ${count} children.`,
    statusLabel = (value) => `Item has status. Status: ${value}.`,
    onPress,
    onDetail,
    onDelete,
    onNavigate,
    onCardClick,
    onDraft,
    onLocked,
    id: idProp,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    className,
    style,
    children,
    ...props
}: GridListItemProps<T>) {
    const list = use(GridListContext);
    const autoId = useId();
    const id = idProp ?? `fd-grid-list-item-${autoId}`;
    const key: unknown = value ?? id;
    const cardRef = useRef<HTMLDivElement>(null);
    const [inner, setInner] = useState(false);

    const mode = list?.mode ?? 'none';
    const selected = list ? list.isSelected(key) : !!selectedProp;
    const spans = layoutItemPattern ? parseGridListLayout(layoutItemPattern, false) : undefined;
    const interactive = type === 'active' || type === 'detailsAndActive' || type === 'navigation';

    let image: ReactNode = null;
    let toolbarContent: ReactNode = null;
    let footerBar: ReactNode = null;
    const content: ReactNode[] = [];
    for (const child of Children.toArray(children)) {
        if (isValidElement(child) && child.type === GridListItemImage) image = child;
        else if (isValidElement(child) && child.type === GridListItemToolbar) toolbarContent = child;
        else if (isValidElement(child) && child.type === GridListItemFooterBar) footerBar = child;
        else content.push(child);
    }

    const hasToolbar =
        !!counter ||
        !!toolbarContent ||
        (type !== 'inactive' && type !== 'active') ||
        (mode !== 'none' && mode !== 'singleSelect');

    const register = list?.register;
    useLayoutEffect(() => {
        if (!register || !cardRef.current) return;
        return register(cardRef.current, key);
    }, [register, key]);

    const sync = list?.sync;
    useLayoutEffect(() => {
        if (selectedProp !== undefined) sync?.(key, selectedProp);
        // only a change of the prop is taken into the selection
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProp]);

    /** The interactive elements inside the card, outside inert parts. */
    const innerElements = useCallback((): HTMLElement[] => {
        const card = cardRef.current;
        if (!card) return [];
        return [...card.querySelectorAll<HTMLElement>(INNER_FOCUSABLE)].filter((el) => !el.closest('[inert]'));
    }, []);

    // inner interactive elements leave the tab sequence until the item is entered, also when they are added later
    const innerRef = useRef(inner);
    innerRef.current = inner;
    const applyInner = useCallback(() => {
        const tabIndex = innerRef.current ? '0' : '-1';
        innerElements().forEach((el) => {
            if (el.getAttribute('tabindex') !== tabIndex) el.setAttribute('tabindex', tabIndex);
        });
    }, [innerElements]);
    useLayoutEffect(applyInner);
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;
        const observer = new MutationObserver(applyInner);
        observer.observe(card, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [applyInner]);

    const itemEvent = (): GridListItemEvent<T> => ({
        index: list && cardRef.current ? list.indexOf(cardRef.current) : 0,
        value
    });

    const emit = (event: MouseEvent, callback?: (event: GridListItemEvent<T>) => void) => {
        event.preventDefault();
        event.stopPropagation();
        callback?.(itemEvent());
    };

    const focusCard = () => cardRef.current?.focus();

    const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) list?.setActive(event.currentTarget);
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInner(false);
    };

    const handleSelectClick = (event: MouseEvent) => {
        event.stopPropagation();
        list?.toggle(key, mode === 'multiSelect' ? !selected : true, event.shiftKey);
        focusCard();
    };

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (disableToolbarClick && target.closest('[data-gl-toolbar]')) return;
        if (mode === 'singleSelect') list?.toggle(key, true);
        if (type === 'navigation') {
            onNavigate?.(itemEvent());
            return;
        }
        if (interactive) onPress?.(itemEvent());
        onCardClick?.(itemEvent());
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const onItem = event.target === event.currentTarget;
        if (!onItem) {
            if (event.key === 'Escape' || event.key === 'F2' || event.key === 'F7') {
                event.preventDefault();
                event.stopPropagation();
                setInner(false);
                focusCard();
            }
            return;
        }
        const elements = innerElements();
        if (
            ((event.key === 'Enter' && !event.shiftKey) || event.key === 'F2' || event.key === 'F7') &&
            elements.length
        ) {
            event.preventDefault();
            innerRef.current = true;
            setInner(true);
            elements.forEach((el) => el.setAttribute('tabindex', '0'));
            elements[0].focus();
            return;
        }
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        if (mode === 'multiSelect') list?.toggle(key, !selected);
        else if (list?.selectable) list.toggle(key, true);
        else if (type === 'navigation') onNavigate?.(itemEvent());
        else onPress?.(itemEvent());
    };

    const hoverable = interactive || mode === 'singleSelect';
    const selectedLook = selected && hoverable;
    const selectClass = cn(
        'flex cursor-pointer items-center',
        mode === 'singleSelectRight' ? '-me-[0.6875rem]' : '-ms-[0.6875rem]'
    );
    const controlLabel = ariaLabel ?? title ?? undefined;
    const radio = (
        <span data-gl-select="" className={selectClass} onClick={handleSelectClick}>
            <span inert className="flex">
                <RadioGroup value={selected ? 'selected' : null} name={`${list?.id ?? id}-radio`}>
                    <Radio value="selected" aria-label={controlLabel} />
                </RadioGroup>
            </span>
        </span>
    );
    const showStateActions = !!footerBar || state === 'error' || state === 'locked' || state === 'draft';

    return (
        <div
            {...props}
            role={list?.selectable ? 'row' : 'none'}
            style={{ ...spanStyle(spans), minWidth: width ?? undefined, maxWidth: width ?? undefined, ...style }}
            className={cn(
                'col-span-(--gl-s) block min-w-0 min-[600px]:col-span-(--gl-m) min-[1024px]:col-span-(--gl-l) min-[1440px]:col-span-(--gl-xl)',
                className
            )}
        >
            <div
                ref={cardRef}
                data-grid-list-item=""
                id={id}
                role={list?.selectable ? 'gridcell' : 'listitem'}
                tabIndex={list ? undefined : 0}
                aria-selected={list?.selectable ? selected : undefined}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={cn(
                    'relative m-0 box-border flex flex-col overflow-hidden rounded-(--gl-r) bg-sap-list-background p-0 font-sap-font-family text-sap-font-size text-sap-list-text-color [box-shadow:var(--sapContent_Shadow0)] outline-none',
                    '[--gl-r:var(--sapTile_BorderCornerRadius)] hc:[--gl-r:1rem]',
                    "focus:before:pointer-events-none focus:before:absolute focus:before:inset-0 focus:before:z-1 focus:before:block focus:before:rounded-(--gl-r) focus:before:content-['']",
                    'focus:before:border-[0.1775rem] focus:before:border-solid focus:before:border-sap-list-background focus:before:[box-shadow:inset_0_0_0_var(--sapContent_FocusWidth)_var(--sapContent_FocusColor)]',
                    'hc:focus:before:inset-[0.1875rem] hc:focus:before:border-(length:--sapContent_FocusWidth) hc:focus:before:border-sap-content-focus-color hc:focus:before:[box-shadow:none] hc:focus:before:[border-style:var(--sapContent_FocusStyle)]',
                    autoHeight ? 'h-auto' : 'h-full',
                    state === 'unread' && '[&_[data-gl-body]_*]:font-bold',
                    hoverable &&
                        'cursor-pointer hover:bg-sap-list-hover-background hover:[box-shadow:0_0_0_0.0625rem_var(--sapTile_Interactive_BorderColor),var(--sapContent_Shadow2)]',
                    interactive &&
                        !selectedLook &&
                        'active:bg-sap-list-active-background active:[&_*]:text-sap-list-active-text-color! active:[&_*]:[text-shadow:none]!',
                    interactive &&
                        navigated &&
                        "after:absolute after:inset-y-0 after:end-0 after:block after:w-[0.1875rem] after:rounded-e-(--gl-r) after:bg-sap-list-selection-border-color after:content-['']",
                    selectedLook &&
                        'bg-sap-list-selection-background-color [box-shadow:0_0_0_0.125rem_var(--sapList_SelectionBorderColor)] hover:bg-sap-list-hover-selection-background focus:before:border-sap-list-selection-background-color'
                )}
            >
                {status && (
                    <>
                        <span
                            data-gl-highlight=""
                            className={cn(
                                'absolute inset-y-0 start-0 z-1 block w-1.5 rounded-s-(--gl-r)',
                                STATUS_COLOR[status]
                            )}
                        />
                        <span className="sr-only-sap">{statusLabel(status)}</span>
                    </>
                )}
                {hasToolbar && (
                    <div
                        data-gl-item-toolbar=""
                        className="m-0 box-border flex h-11 min-h-11 shrink-0 items-center gap-2 border-0 bg-transparent px-4 py-0 compact:h-8 compact:min-h-8"
                    >
                        {mode === 'singleSelectLeft' && radio}
                        {mode === 'multiSelect' && (
                            <span data-gl-select="" className={selectClass} onClick={handleSelectClick}>
                                <Checkbox inert checked={selected} aria-label={controlLabel} />
                            </span>
                        )}
                        {toolbarContent}
                        <span className="flex-1" />
                        {!!counter && (
                            <span data-gl-counter="" className="text-sap-content-marker-text-color">
                                {counter}
                                <span className="sr-only-sap">{counterLabel(counter)}</span>
                            </span>
                        )}
                        {(type === 'detail' || type === 'detailsAndActive') && (
                            <Button
                                variant="transparent"
                                glyph="edit"
                                data-density="compact"
                                aria-label={detailsLabel}
                                title={detailsLabel}
                                onClick={(event) => emit(event, onDetail)}
                            />
                        )}
                        {mode === 'delete' && (
                            <Button
                                variant="transparent"
                                glyph="decline"
                                data-density="compact"
                                aria-label={deleteLabel}
                                title={deleteLabel}
                                onClick={(event) => emit(event, onDelete)}
                            />
                        )}
                        {type === 'navigation' && (
                            <span className="-me-4 flex w-10 items-center justify-center text-sap-content-non-interactive-icon-color">
                                <Icon glyph="navigation-right-arrow" />
                            </span>
                        )}
                        {mode === 'singleSelectRight' && radio}
                    </div>
                )}
                <div
                    data-gl-body=""
                    className={cn(
                        'm-0 box-border flex h-full flex-wrap [word-break:break-word]',
                        noPadding ? 'p-0' : 'p-4'
                    )}
                >
                    {image}
                    {(title || description) && (
                        <div
                            data-gl-header=""
                            className="m-0 flex flex-[0_0_100%] flex-col p-0 [[data-gl-image]+&]:max-w-[calc(100%_-_3.75rem)]"
                        >
                            {title && (
                                <div
                                    role="heading"
                                    aria-level={titleLevel}
                                    className="m-0 mt-0.5 p-0 font-sap-font-family text-sap-font-large-size leading-[normal] whitespace-normal text-sap-list-text-color"
                                >
                                    {title}
                                </div>
                            )}
                            {description && (
                                <span className="m-0 mt-2 mb-0.5 inline-block p-0 text-sap-content-label-color">
                                    {description}
                                </span>
                            )}
                        </div>
                    )}
                    {content}
                    {showStateActions && (
                        <div data-gl-actions="" className="m-0 order-1 mt-4 basis-full p-0">
                            {footerBar ??
                                (state === 'error' ? (
                                    <ObjectStatus status="negative" label={errorLabel} />
                                ) : state === 'locked' ? (
                                    <Button
                                        variant="transparent"
                                        glyph="private"
                                        data-density="compact"
                                        label={lockedLabel}
                                        onClick={(event) => emit(event, onLocked)}
                                    />
                                ) : (
                                    <Button
                                        variant="transparent"
                                        data-density="compact"
                                        label={draftLabel}
                                        onClick={(event) => emit(event, onDraft)}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export interface GridListTitleBarProps extends Omit<ComponentProps<'div'>, 'title'> {
    title?: string | null;
    /** Content after the title in the heading, e.g. the item count "(5)". */
    additionalTitle?: ReactNode;
    /** `aria-level` of the title (default 2). */
    headingLevel?: number;
}

/** Title bar above the items: a solid toolbar with the title as a heading; children follow the title. */
export function GridListTitleBar({
    title,
    additionalTitle,
    headingLevel = 2,
    className,
    children,
    ...props
}: GridListTitleBarProps) {
    const roles = useRowRoles();
    return (
        <div role={roles.row} {...props} data-gl-title-bar="" className={cn(FULL_ROW, className)}>
            <div role={roles.cell}>
                <Toolbar variant="solid">
                    {/* in the text colour, as fundamental-styles' title bar text */}
                    <ToolbarLabel role="heading" aria-level={headingLevel} className="text-sap-text-color">
                        {title}
                        {additionalTitle != null && <> {additionalTitle}</>}
                    </ToolbarLabel>
                    {children}
                </Toolbar>
            </div>
        </div>
    );
}

/** Pushes the following title bar content to the end. */
export function GridListTitleBarSpacer({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('block flex-1', className)} />;
}

export interface GridListGroupHeaderProps extends ComponentProps<'div'> {
    /** `aria-level` of the heading (default 3). */
    headingLevel?: number;
}

/** Heading of a group of items. `aria-label` goes to the heading. */
export function GridListGroupHeader({
    headingLevel = 3,
    'aria-label': ariaLabel,
    className,
    children,
    ...props
}: GridListGroupHeaderProps) {
    const roles = useRowRoles();
    return (
        <div
            role={roles.row}
            {...props}
            data-gl-group-header=""
            className={cn(
                FULL_ROW,
                'm-0 flex h-8 items-center truncate p-0 text-sap-font-header5-size leading-8 font-bold text-sap-list-group-header-text-color',
                // after items, as fundamental-styles' group headers without --no-margin
                '[:not([data-gl-title-bar],[data-gl-filter],[data-gl-group-header])+&]:mt-3',
                className
            )}
        >
            <div className="min-w-0 truncate" role={roles.cell}>
                <div role="heading" className="m-0 truncate p-0" aria-level={headingLevel} aria-label={ariaLabel}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export interface GridListFilterBarProps extends ComponentProps<'div'> {
    /** Announced after the filter text: what activating the bar does. */
    removeLabel?: string;
    /** Called when the bar is activated (click, Enter or Space): remove the filter. */
    onClose?: () => void;
}

/** Info bar showing the active filter; activating it removes the filter. */
export function GridListFilterBar({
    removeLabel = 'Remove filter',
    onClose,
    className,
    children,
    ...props
}: GridListFilterBarProps) {
    const roles = useRowRoles();
    return (
        <div role={roles.row} {...props} data-gl-filter="" className={cn(FULL_ROW, className)}>
            <div role={roles.cell}>
                <div
                    role="button"
                    tabIndex={0}
                    className="relative m-0 box-border flex h-8 min-h-8 cursor-pointer items-center gap-2 border-b border-solid border-sap-group-title-border-color bg-sap-infobar-background px-2 font-sap-font-family text-sap-font-size text-sap-infobar-text-color outline-none hover:bg-sap-infobar-hover-background active:bg-sap-infobar-active-background focus:after:pointer-events-none focus:after:absolute focus:after:inset-0.5 focus:after:border-(length:--sapContent_FocusWidth) focus:after:border-sap-content-focus-color focus:after:content-[''] focus:after:[border-style:var(--sapContent_FocusStyle)]"
                    onClick={() => onClose?.()}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') onClose?.();
                        if (event.key === ' ') event.preventDefault();
                    }}
                    onKeyUp={(event) => {
                        if (event.key === ' ') onClose?.();
                    }}
                >
                    <span className="min-w-0 flex-1 truncate">{children}</span>
                    <span className="sr-only-sap">{removeLabel}</span>
                    <Icon glyph="decline" />
                </div>
            </div>
        </div>
    );
}

export interface GridListMoreButtonProps extends Omit<ComponentProps<'div'>, 'title'> {
    title?: string;
    /** Number of items shown. */
    displayCount?: number;
    /** Number of items in all. */
    totalCount?: number;
    /** Called when the button is activated (click, Enter or Space): show more items. */
    onShowMore?: () => void;
}

/** Loads more items: shows the displayed and total counts. */
export function GridListMoreButton({
    title = 'More',
    displayCount,
    totalCount,
    onShowMore,
    className,
    ...props
}: GridListMoreButtonProps) {
    const roles = useRowRoles();
    return (
        <div role={roles.row} {...props} data-gl-more="" className={cn(FULL_ROW, className)}>
            <div role={roles.cell}>
                <div
                    role="button"
                    tabIndex={0}
                    className="group/more m-0 box-border cursor-pointer rounded-(--gl-r) bg-sap-group-content-background p-[0.813rem] text-center font-sap-font-family text-sap-font-size [box-shadow:var(--sapContent_Shadow0)] outline-none hover:bg-sap-list-hover-background focus:outline-sap focus:-outline-offset-[0.1875rem] active:bg-sap-list-active-background [--gl-r:var(--sapTile_BorderCornerRadius)] hc:[--gl-r:1rem]"
                    onClick={() => onShowMore?.()}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') onShowMore?.();
                        if (event.key === ' ') {
                            event.preventDefault();
                            onShowMore?.();
                        }
                    }}
                >
                    <span className="m-0 block p-0 font-bold text-sap-link-visited-color group-active/more:text-sap-list-active-text-color">
                        {title}
                    </span>
                    <span className="m-0 mt-[0.813rem] block p-0 text-sap-link-visited-color group-active/more:text-sap-list-active-text-color">
                        <bdi dir="ltr">
                            [ {displayCount} / {totalCount} ]
                        </bdi>
                    </span>
                </div>
            </div>
        </div>
    );
}

/** Footer text below the items. */
export function GridListFooter({ className, children, ...props }: ComponentProps<'div'>) {
    const roles = useRowRoles();
    return (
        <div
            role={roles.row}
            {...props}
            data-gl-footer=""
            className={cn(
                FULL_ROW,
                'm-0 p-0 font-sap-font-family text-sap-font-size text-sap-list-footer-text-color',
                className
            )}
        >
            <div role={roles.cell}>{children}</div>
        </div>
    );
}
