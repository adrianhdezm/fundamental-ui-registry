/*
 * Port of @fundamental-ngx/core (fixed-card-layout) with the visual design of fundamental-styles,
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
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type KeyboardEvent as ReactKeyboardEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactElement,
    type Ref,
    type RefCallback
} from 'react';
import { cn } from '@/lib/utils';

const REM = 16;
/** Minimum card width: 20rem. */
const CARD_MINIMUM_WIDTH = 20 * REM;
const CARD_GAP = REM;
const MAX_COLUMNS = 10;
/** Pointer movement (horizontal plus vertical) in px before a press becomes a drag (the CDK's threshold). */
const DRAG_THRESHOLD = 5;

export interface FixedCardLayoutChange {
    numberOfColumns: number;
    screenSize: number;
}

/** A card of the layout as `onCardDraggedDropped` reports it: its React `key` (or position) and its rank. */
export interface FixedCardLayoutCardInfo {
    key: string;
    rank: number;
}

export interface CardDropped {
    previousIndex: number;
    currentIndex: number;
    layoutColumns: number;
    /** The cards in their new order. */
    items: FixedCardLayoutCardInfo[];
}

/** Width modifiers per column (1-based), e.g. `{ 1: 2, 2: 1 }`: the free space goes 2:1 to the first two columns. */
export type ColumnsWidthConfig = Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, number>>;

/** Number of columns of at least the card width that fit, with gaps. */
function columnsThatFit(width: number, cardWidth: number): number {
    const withoutGap = Math.max(Math.floor((width || 1) / (cardWidth || 1)), 1);
    const required = withoutGap * cardWidth + (withoutGap - 1) * CARD_GAP;
    return Math.max(required > width ? withoutGap - 1 : withoutGap, 1);
}

function mergeRefs<E>(...refs: (Ref<E> | undefined)[]): RefCallback<E> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
}

/** A copy of an element for the drag preview and the placeholder, without ids (as the CDK's clones). */
function cloneWithoutIds(element: HTMLElement): HTMLElement {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    clone.removeAttribute('tabindex');
    clone.querySelectorAll('[tabindex]').forEach((el) => el.setAttribute('tabindex', '-1'));
    return clone;
}

interface ItemHandlers {
    register: (key: string, element: HTMLElement | null) => void;
    onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>, key: string) => void;
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>, key: string) => void;
}

const LayoutContext = createContext<ItemHandlers | null>(null);
const CardKeyContext = createContext<string | null>(null);

export interface FixedCardLayoutCardProps extends ComponentProps<'div'> {
    /** Position of the card (Angular's `fdCardDef` number); drag and drop swap it. Default: its position. */
    rank?: number;
}

/**
 * A card of a fixed card layout (Angular's `fdCardDef` template and `fdFixedCardLayoutItem`): the focus target of
 * the keyboard navigation, a `group` labelled by the title of the card inside it, and what is dragged.
 *
 * Native props, `className` and `ref` go to the element.
 */
export function FixedCardLayoutCard({
    rank: _rank,
    className,
    onKeyDown,
    onPointerDown,
    'aria-labelledby': ariaLabelledby,
    ref,
    children,
    ...props
}: FixedCardLayoutCardProps) {
    const layout = useContext(LayoutContext);
    const key = useContext(CardKeyContext);
    const element = useRef<HTMLDivElement | null>(null);
    const [titleId, setTitleId] = useState<string | null>(null);
    // labelled by the card title (Angular queries `fd-card-title`): the first heading with an id
    useLayoutEffect(() => {
        const heading = element.current?.querySelector(
            'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id], [role=heading][id]'
        );
        const id = heading?.id || null;
        if (id !== titleId) setTitleId(id);
    });
    const register = layout?.register;
    const own = useCallback(
        (node: HTMLDivElement | null) => {
            element.current = node;
            if (key !== null) register?.(key, node);
        },
        [key, register]
    );
    return (
        <div
            role="group"
            tabIndex={0}
            {...props}
            ref={ref ? mergeRefs(own, ref) : own}
            aria-labelledby={ariaLabelledby ?? titleId ?? undefined}
            className={cn('outline-none focus-visible:outline-sap focus-visible:outline-offset-1', className)}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                if (!event.defaultPrevented && key !== null) layout?.onKeyDown(event, key);
            }}
            onPointerDown={(event) => {
                onPointerDown?.(event);
                if (!event.defaultPrevented && key !== null) layout?.onPointerDown(event, key);
            }}
        >
            {children}
        </div>
    );
}

interface CardEntry {
    key: string;
    element: ReactElement<FixedCardLayoutCardProps>;
    rankProp: number | undefined;
    index: number;
}

interface DragState {
    key: string;
    /** The card whose place the dragged card takes (the placeholder is above it). */
    over: string | null;
}

export interface FixedCardLayoutProps extends ComponentProps<'div'> {
    /** Turns off reordering by pointer and keyboard. */
    disableDragDrop?: boolean;
    /** Milliseconds a pointer has to be held before a drag starts (default 200). */
    dragStartDelay?: number;
    /** Minimum card width in pixels; at least 20rem (default 320). */
    cardMinimumWidth?: number;
    /** Shares of the free space per column. */
    columnsWidthConfig?: ColumnsWidthConfig | null;
    /** At most this many columns (default 10). */
    maxColumns?: number;
    /** Called with the number of columns and the width whenever either changes. */
    onLayoutChange?: (change: FixedCardLayoutChange) => void;
    /** Called after a drop or a keyboard move swapped two cards. */
    onCardDraggedDropped?: (event: CardDropped) => void;
}

/**
 * Fixed card layout: cards of the same width in as many columns as fit (at least 20rem each). Cards are placed row
 * by row and keep their own height. They can be reordered by dragging, or with Alt and the arrow keys; the arrow keys
 * alone move the focus between cards.
 *
 * ```tsx
 * <FixedCardLayout onCardDraggedDropped={save}>
 *     <FixedCardLayoutCard key="orders" rank={1}><Card>...</Card></FixedCardLayoutCard>
 *     <FixedCardLayoutCard key="invoices" rank={2}><Card>...</Card></FixedCardLayoutCard>
 * </FixedCardLayout>
 * ```
 *
 * Native props, `className` and `ref` go to the root element.
 */
export function FixedCardLayout({
    disableDragDrop = false,
    dragStartDelay = 200,
    cardMinimumWidth: cardMinimumWidthProp = CARD_MINIMUM_WIDTH,
    columnsWidthConfig,
    maxColumns = MAX_COLUMNS,
    onLayoutChange,
    onCardDraggedDropped,
    className,
    children,
    ...props
}: FixedCardLayoutProps) {
    const layout = useRef<HTMLDivElement>(null);
    const items = useRef(new Map<string, HTMLElement>());
    const [width, setWidth] = useState(0);
    const [measure, setMeasure] = useState(0);
    const [height, setHeight] = useState<number | null>(null);
    const [drag, setDrag] = useState<DragState | null>(null);
    /** Rank changes by drag and drop, kept while the card's own `rank` stays the same (Angular's linkedSignal). */
    const [moved, setMoved] = useState<Record<string, { source: number | undefined; rank: number }>>({});
    const dragging = useRef(false);
    const focusAfterMove = useRef<string | null>(null);
    const cleanup = useRef<(() => void) | null>(null);
    useEffect(() => () => cleanup.current?.(), []);

    const cards: CardEntry[] = [];
    Children.forEach(children, (child) => {
        if (!isValidElement<FixedCardLayoutCardProps>(child)) return;
        const index = cards.length;
        cards.push({ key: child.key ?? String(index), element: child, rankProp: child.props.rank, index });
    });
    const rankOf = (card: CardEntry) => {
        const own = moved[card.key];
        return own && own.source === card.rankProp ? own.rank : (card.rankProp ?? card.index + 1);
    };
    /** Cards in rank order. */
    const ordered = [...cards].sort((a, b) => rankOf(a) - rankOf(b));
    const cardMinimumWidth = Math.max(cardMinimumWidthProp, CARD_MINIMUM_WIDTH);
    const columnCount =
        !cards.length || !width
            ? 1
            : Math.min(columnsThatFit(width, cardMinimumWidth), cards.length, maxColumns || MAX_COLUMNS, MAX_COLUMNS);
    /** Card keys per column, in row-by-row placement. */
    const columns: string[][] = Array.from({ length: columnCount }, () => []);
    ordered.forEach((card, i) => columns[i % columnCount].push(card.key));
    /** Pixel widths per column from the width config. */
    const columnWidths: number[] = (() => {
        if (!columnsWidthConfig || !Object.keys(columnsWidthConfig).length || columnCount === 1) return [];
        const modifiers = Array.from({ length: columnCount }, (_, i) =>
            Math.max(columnsWidthConfig[(i + 1) as 1] ?? 0, 0)
        );
        const total = modifiers.reduce((sum, m) => sum + m, 0) || 1;
        const free = width - cardMinimumWidth * columnCount;
        return modifiers.map((m) => Math.round(cardMinimumWidth + (free / total) * m));
    })();

    /** Height of the highest column (without the dragged card), optionally with extra space in one column. */
    const columnHeight = (column = -1, extra = 0, skip: string | null = null): number => {
        const heights = columns.map(
            (keys, i) =>
                keys.reduce((sum, key) => {
                    const element = items.current.get(key);
                    return sum + (element && key !== skip ? element.offsetHeight : 0) + CARD_GAP;
                }, 0) + (i === column ? extra : 0)
        );
        return Math.ceil(Math.max(0, ...heights) + 4);
    };

    // the latest render, for the pointer and keyboard handlers
    const latest = useRef({ ordered, columns, columnCount, columnHeight, rankOf, disableDragDrop, dragStartDelay });
    latest.current = { ordered, columns, columnCount, columnHeight, rankOf, disableDragDrop, dragStartDelay };
    const onDropped = useRef(onCardDraggedDropped);
    onDropped.current = onCardDraggedDropped;
    const onChange = useRef(onLayoutChange);
    onChange.current = onLayoutChange;

    // the width of the layout decides the columns; not while dragging
    useLayoutEffect(() => {
        const element = layout.current!;
        const update = () => {
            if (dragging.current) return;
            setWidth(element.getBoundingClientRect().width);
            setMeasure((n) => n + 1);
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // cards that change their height re-measure the layout
    const keys = cards.map((card) => card.key).join('\u0000');
    useLayoutEffect(() => {
        const observer = new ResizeObserver(() => setMeasure((n) => n + 1));
        items.current.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, [keys]);

    // the container height is the highest column (the columns are a wrapping flex column)
    useLayoutEffect(() => {
        if (dragging.current) return;
        const next = columnHeight();
        if (next !== height) setHeight(next);
    });

    useEffect(() => {
        if (width) onChange.current?.({ numberOfColumns: columnCount, screenSize: width });
    }, [columnCount, width]);

    // a card moved with the keyboard keeps the focus
    useLayoutEffect(() => {
        const key = focusAfterMove.current;
        if (key === null) return;
        focusAfterMove.current = null;
        items.current.get(key)?.focus();
    });

    /** Swaps the ranks of two cards. */
    const swap = (movedKey: string, replacedKey: string) => {
        const { ordered, columnCount, rankOf } = latest.current;
        const order = ordered.map((card) => card.key);
        const a = ordered.find((card) => card.key === movedKey)!;
        const b = ordered.find((card) => card.key === replacedKey)!;
        const ranks = new Map(ordered.map((card) => [card.key, rankOf(card)]));
        ranks.set(a.key, rankOf(b));
        ranks.set(b.key, rankOf(a));
        setMoved((prev) => ({
            ...prev,
            [a.key]: { source: a.rankProp, rank: rankOf(b) },
            [b.key]: { source: b.rankProp, rank: rankOf(a) }
        }));
        const items = [...ordered]
            .sort((x, y) => ranks.get(x.key)! - ranks.get(y.key)!)
            .map((card) => ({ key: card.key, rank: ranks.get(card.key)! }));
        onDropped.current?.({
            previousIndex: order.indexOf(movedKey),
            currentIndex: order.indexOf(replacedKey),
            layoutColumns: columnCount,
            items
        });
    };

    const isRtl = () => !!layout.current && getComputedStyle(layout.current).direction === 'rtl';

    /** Alt + arrow keys: swap with the card in the next column (left, right) or row (up, down). */
    const moveWithKeyboard = (event: ReactKeyboardEvent, key: string) => {
        const { ordered, columnCount } = latest.current;
        const index = ordered.findIndex((card) => card.key === key);
        const column = index % columnCount;
        let target = -1;
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowLeft': {
                const step = (event.key === 'ArrowRight') !== isRtl() ? 1 : -1;
                if (column + step >= 0 && column + step < columnCount) target = index + step;
                break;
            }
            case 'ArrowDown':
                target = index + columnCount;
                break;
            case 'ArrowUp':
                target = index - columnCount;
                break;
            default:
                return;
        }
        event.preventDefault();
        if (target < 0 || target >= ordered.length) return;
        focusAfterMove.current = key;
        swap(key, ordered[target].key);
    };

    const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, key: string) => {
        if (event.target !== event.currentTarget || dragging.current) return;
        if (event.altKey && !latest.current.disableDragDrop) {
            moveWithKeyboard(event, key);
            return;
        }
        // the CDK's FocusKeyManager: arrows without modifiers, wrapping, Left and Right swapped in RTL
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const rtl = isRtl();
        const next = ['ArrowDown', rtl ? 'ArrowLeft' : 'ArrowRight'];
        const previous = ['ArrowUp', rtl ? 'ArrowRight' : 'ArrowLeft'];
        const step = next.includes(event.key) ? 1 : previous.includes(event.key) ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        const { ordered } = latest.current;
        const index = ordered.findIndex((card) => card.key === key);
        const target = ordered[(index + step + ordered.length) % ordered.length];
        items.current.get(target.key)?.focus();
    };

    /** Drag and drop as the CDK: hold for `dragStartDelay`, then move 5px; the card's place is freed. */
    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>, key: string) => {
        if (latest.current.disableDragDrop || event.button !== 0 || dragging.current) return;
        cleanup.current?.();
        const item = event.currentTarget;
        const pointerId = event.pointerId;
        const startX = event.clientX;
        const startY = event.clientY;
        const startTime = Date.now();
        const delay = latest.current.dragStartDelay;
        let started = false;
        let over: string | null = null;
        let offsetX = 0;
        let offsetY = 0;
        let preview: HTMLElement | null = null;
        let draggedHeight = 0;

        const start = () => {
            started = true;
            dragging.current = true;
            const rect = item.getBoundingClientRect();
            offsetX = startX - rect.left;
            offsetY = startY - rect.top;
            draggedHeight = item.offsetHeight;
            // the dragged card follows the pointer, with fundamental-styles' preview look
            preview = item.ownerDocument.createElement('div');
            preview.setAttribute('aria-hidden', 'true');
            preview.setAttribute('data-fixed-card-layout-preview', '');
            preview.className =
                'pointer-events-none fixed top-0 left-0 z-[1000] m-0 box-border rounded-sap-element-border-corner-radius [box-shadow:var(--sapContent_Shadow2)]';
            preview.style.width = `${rect.width}px`;
            preview.style.height = `${rect.height}px`;
            preview.append(cloneWithoutIds(item));
            item.ownerDocument.body.append(preview);
            item.ownerDocument.body.style.userSelect = 'none';
            window.getSelection()?.removeAllRanges();
            // room for the placeholder in any column, so it does not wrap the columns
            setHeight(latest.current.columnHeight(-1, 0, key) + draggedHeight + REM);
            setDrag({ key, over: null });
        };

        const move = (e: PointerEvent) => {
            if (e.pointerId !== pointerId) return;
            if (!started) {
                if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) < DRAG_THRESHOLD) return;
                // moved before the delay: no drag (as the CDK, so that the page can still be scrolled)
                if (Date.now() < startTime + delay) {
                    stop();
                    return;
                }
                start();
            }
            e.preventDefault();
            if (preview) preview.style.transform = `translate(${e.clientX - offsetX}px, ${e.clientY - offsetY}px)`;
            // the card under the pointer (the dragged card's own place is hidden)
            const slot = item.ownerDocument
                .elementFromPoint(e.clientX, e.clientY)
                ?.closest<HTMLElement>('[data-fixed-card-layout-slot]');
            const target =
                slot && layout.current?.contains(slot) ? slot.getAttribute('data-fixed-card-layout-slot')! : null;
            if (target === null || target === over || target === key) return;
            over = target;
            const column = latest.current.columns.findIndex((keys) => keys.includes(target));
            const room = latest.current.columnHeight(column, draggedHeight + REM, key);
            setHeight((h) => Math.max(h ?? 0, room));
            setDrag({ key, over: target });
        };

        const end = (drop: boolean) => {
            stop();
            if (!started) return;
            preview?.remove();
            dragging.current = false;
            setDrag(null);
            setMeasure((n) => n + 1);
            // the click that ends a drag does not reach the card
            const swallow = (e: MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
            };
            window.addEventListener('click', swallow, { capture: true, once: true });
            setTimeout(() => window.removeEventListener('click', swallow, { capture: true }));
            if (!drop || over === null) return;
            const { columns, ordered, rankOf } = latest.current;
            const column = columns.find((keys) => keys.includes(key));
            const rank = (k: string) => rankOf(ordered.find((card) => card.key === k)!);
            // within a column of two, dropping the upper card on the lower one keeps the order (the placeholder is
            // above it)
            if (column?.includes(over) && column.length === 2 && rank(key) < rank(over)) return;
            swap(key, over);
        };
        const up = (e: PointerEvent) => e.pointerId === pointerId && end(true);
        const cancel = (e: PointerEvent) => e.pointerId === pointerId && end(false);
        const stop = () => {
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', up);
            document.removeEventListener('pointercancel', cancel);
            item.ownerDocument.body.style.userSelect = '';
            cleanup.current = null;
        };
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
        document.addEventListener('pointercancel', cancel);
        cleanup.current = () => {
            stop();
            preview?.remove();
            dragging.current = false;
        };
    };

    const [handlers] = useState<ItemHandlers>(() => ({
        register: (key, element) => {
            if (element) items.current.set(key, element);
            else items.current.delete(key);
        },
        onKeyDown: (event, key) => handlersRef.current.onKeyDown(event, key),
        onPointerDown: (event, key) => handlersRef.current.onPointerDown(event, key)
    }));
    const handlersRef = useRef({ onKeyDown, onPointerDown });
    handlersRef.current = { onKeyDown, onPointerDown };

    /** Fills the placeholder with a copy of the dragged card (Angular renders the card template again). */
    const fillPlaceholder = (node: HTMLDivElement | null) => {
        const source = drag && items.current.get(drag.key);
        if (node && source && !node.firstChild) node.append(cloneWithoutIds(source));
    };

    // re-measured on every change of `measure` (cards resized, width changed)
    void measure;

    return (
        <div
            {...props}
            className={cn(
                'm-0 box-border block p-0 font-sap-font-family text-sap-font-size text-sap-text-color',
                className
            )}
        >
            <div
                ref={layout}
                className="m-0 -mt-4 -ms-4 box-border flex flex-col flex-wrap content-start items-center justify-start p-0"
                style={{ height: height ?? undefined }}
            >
                <LayoutContext.Provider value={handlers}>
                    {ordered.map((card, index) => {
                        const column = index % columnCount;
                        const single = columns[column].length === 1;
                        const placeholder = drag !== null && drag.over === card.key;
                        return (
                            <div
                                key={card.key}
                                data-fixed-card-layout-slot={card.key}
                                className={cn(
                                    'm-0 box-border min-h-px w-full ps-4 pt-4 empty:pt-0',
                                    single && 'basis-full'
                                )}
                                style={{
                                    order: column + 1,
                                    width: `${100 / columnCount}%`,
                                    minWidth: columnWidths[column] ?? cardMinimumWidth,
                                    maxWidth: columnWidths[column],
                                    display: drag?.key === card.key ? 'none' : undefined
                                }}
                            >
                                {placeholder && (
                                    <div
                                        aria-hidden="true"
                                        inert
                                        data-fixed-card-layout-placeholder=""
                                        ref={fillPlaceholder}
                                        className="mb-4 box-border w-full min-w-full cursor-grabbing border-2 border-dashed border-sap-content-drag-and-drop-active-color opacity-30"
                                    />
                                )}
                                <CardKeyContext.Provider value={card.key}>{card.element}</CardKeyContext.Provider>
                            </div>
                        );
                    })}
                </LayoutContext.Provider>
                {Array.from({ length: columnCount - 1 }, (_, column) => (
                    <div key={`break-${column}`} className="m-0 w-0 basis-full p-0" style={{ order: column + 1 }} />
                ))}
            </div>
        </div>
    );
}
