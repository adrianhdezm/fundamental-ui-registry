/*
 * Port of @fundamental-ngx/core (resizable-card-layout) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    Children,
    createContext,
    isValidElement,
    useContext,
    useEffect,
    useId,
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
import { iconGlyphChar } from '@/ui/icon/icon';

/** Width of one column in pixels (20rem). */
export const horizontalResizeStep = 320;
/** Height of one row in pixels (1rem). */
export const verticalResizeStep = 16;
export const gap = 16;
/** A card snaps to the next column once it is resized more than half a column. */
export const horizontalResizeOffset = 160;
export const verticalResizeOffset = 8;

export type LayoutSize = 'sm' | 'md' | 'lg' | 'xl';
export type ResizeDirection = 'vertical' | 'horizontal' | 'both';
/** Direction of the last horizontal pointer move: 1 wider, -1 narrower. */
export type CardState = 1 | 0 | -1;

export interface ResizableCardItemConfig {
    title?: string;
    rank?: number;
    cardWidthColSpan?: number;
    cardHeightRowSpan?: number;
    cardMiniHeaderRowSpan?: number;
    cardMiniContentRowSpan?: number;
    resizable?: boolean;
}

export type ResizableCardLayoutConfig = ResizableCardItemConfig[];

/** A card as the events report it: its configuration now, and its React `key` (or position). */
export interface ResizableCardItemState extends Required<Omit<ResizableCardItemConfig, 'title'>> {
    key: string;
    title: string | undefined;
}

export interface ResizedEvent {
    card: ResizableCardItemState;
    prevCardWidth: number;
    prevCardHeight: number;
    cardWidth: number;
    cardHeight: number;
    cardWidthColSpan: number;
    cardHeightRowSpan: number;
    newCardWidthColSpan: number;
    newCardHeightRowSpan: number;
}

const COLUMNS: Record<LayoutSize, number> = { sm: 1, md: 2, lg: 3, xl: 4 };
const PADDING: Record<LayoutSize, number> = { sm: 8, md: 16, lg: 16, xl: 48 };

/** Columns a card of this width occupies (a column counts once it is more than half filled). */
function columnSpan(width: number): number {
    const base = Math.floor(width / horizontalResizeStep);
    return width - base * horizontalResizeStep - base * gap > horizontalResizeOffset ? base + 1 : base;
}

function layoutSizeFor(width: number): LayoutSize {
    return width <= 656 ? 'sm' : width <= 975 ? 'md' : width <= 1359 ? 'lg' : 'xl';
}

function mergeRefs<E>(...refs: (Ref<E> | undefined)[]): RefCallback<E> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
}

type ResizedHandler = (event: ResizedEvent) => void;

/** What the layout reads from a card's props. */
interface ItemInputs {
    title: string | undefined;
    rank: number;
    widthSpan: number;
    heightSpan: number;
    miniHeaderSpan: number;
    miniContentSpan: number;
    resizable: boolean;
    onResizing?: ResizedHandler;
    onResized?: ResizedHandler;
    onMiniHeaderReached?: ResizedHandler;
    onMiniContentReached?: ResizedHandler;
}

/** The state of a card, kept by the layout (Angular keeps it in the item component's signals). */
interface Item {
    key: string;
    inputs: ItemInputs;
    element: HTMLElement | null;
    rank: number;
    prevRank: number;
    widthSpan: number;
    /** Span chosen by configuration or by resizing, restored when the layout is wide enough. */
    originalWidthSpan: number;
    heightSpan: number;
    /** Pixel sizes while resizing; otherwise the spans decide. */
    widthPx: number | null;
    heightPx: number | null;
    start: number | null;
    top: number;
    startingColumnPosition: number;
    cardState: CardState;
    /** Height span before the latest vertical change. */
    previousCardHeightRowSpan: number;
    resizing: boolean;
    indicationWidth: number;
    maxColumns: number;
    prevX: number;
    prevY: number;
    prevCardWidth: number;
    prevCardHeight: number;
    direction: ResizeDirection;
    detach: (() => void) | null;
}

const cardWidth = (item: Item) => item.widthPx ?? item.widthSpan * horizontalResizeStep + (item.widthSpan - 1) * gap;
const cardHeight = (item: Item) => item.heightPx ?? item.heightSpan * verticalResizeStep;

function state(item: Item): ResizableCardItemState {
    return {
        key: item.key,
        title: item.inputs.title,
        rank: item.rank,
        cardWidthColSpan: item.widthSpan,
        cardHeightRowSpan: item.heightSpan,
        cardMiniHeaderRowSpan: item.inputs.miniHeaderSpan,
        cardMiniContentRowSpan: item.inputs.miniContentSpan,
        resizable: item.inputs.resizable
    };
}

function resizedEvent(item: Item): ResizedEvent {
    const width = cardWidth(item);
    const height = cardHeight(item);
    return {
        card: state(item),
        prevCardWidth: item.prevCardWidth,
        prevCardHeight: item.prevCardHeight,
        cardWidth: width,
        cardHeight: height,
        cardWidthColSpan: item.widthSpan,
        cardHeightRowSpan: item.heightSpan,
        newCardWidthColSpan: columnSpan(width),
        newCardHeightRowSpan: Math.floor(height / verticalResizeStep)
    };
}

interface ItemContextValue {
    item: Item;
    register: (element: HTMLElement | null) => void;
    startResize: (event: ReactPointerEvent, direction: ResizeDirection) => void;
}

const ItemContext = createContext<ItemContextValue | null>(null);

export interface ResizableCardItemProps extends Omit<ComponentProps<'div'>, 'title'> {
    /** The whole configuration of the card; wins over the layout's `layoutConfig` and the other props. */
    config?: ResizableCardItemConfig | null;
    /** Names the card (`aria-label`) and identifies it in `onLayoutChange`. */
    title?: string | null;
    /** Position: cards are placed by rank. Default: its position. */
    rank?: number | null;
    /** Width in columns of 20rem (default 1). */
    cardWidthColSpan?: number;
    /** Height in rows of 1rem. */
    cardHeightRowSpan?: number | null;
    /** Height in rows of the header alone: the card snaps to it below the mini content height. */
    cardMiniHeaderRowSpan?: number | null;
    /** Height in rows of the content shown at the least, under the mini header. */
    cardMiniContentRowSpan?: number | null;
    /** The card shows resize handles (default true). */
    resizable?: boolean;
    /** Called on every pointer move while resizing. */
    onResizing?: ResizedHandler;
    /** Called when a resize ends (and when the layout narrows the card). */
    onResized?: ResizedHandler;
    /** Called when shrinking snaps the card to its mini header. */
    onMiniHeaderReached?: ResizedHandler;
    /** Called when resizing snaps the card to its mini content height. */
    onMiniContentReached?: ResizedHandler;
}

/**
 * A card of a resizable card layout: a `group` named by its `title`, placed by the layout. Its width snaps to columns
 * of 20rem and its height to 1rem rows; it is resized by dragging its end edge, bottom edge or corner (shown on
 * hover), down to its mini content or mini header height.
 *
 * Native props, `className` and `ref` go to the element.
 */
export function ResizableCardItem({
    config: _config,
    title: _title,
    rank: _rank,
    cardWidthColSpan: _width,
    cardHeightRowSpan: _height,
    cardMiniHeaderRowSpan: _miniHeader,
    cardMiniContentRowSpan: _miniContent,
    resizable: _resizable,
    onResizing: _onResizing,
    onResized: _onResized,
    onMiniHeaderReached: _onMiniHeader,
    onMiniContentReached: _onMiniContent,
    id,
    className,
    style,
    ref,
    children,
    ...props
}: ResizableCardItemProps) {
    const context = useContext(ItemContext);
    const autoId = useId();
    const [hovered, setHovered] = useState(false);
    if (!context) {
        return (
            <div
                role="group"
                tabIndex={0}
                {...props}
                id={id ?? `fd-card-item-${autoId}`}
                ref={ref}
                className={className}
            >
                {children}
            </div>
        );
    }
    const { item, register, startResize } = context;
    const resizable = item.inputs.resizable;
    const width = cardWidth(item);
    const height = cardHeight(item);
    return (
        <div
            role="group"
            tabIndex={0}
            aria-label={item.inputs.title}
            {...props}
            id={id ?? `fd-card-item-${autoId}`}
            ref={ref ? mergeRefs(register, ref) : register}
            style={{
                ...style,
                position: 'absolute',
                insetInlineStart: item.start ?? undefined,
                top: item.top,
                zIndex: item.resizing ? 1 : 0
            }}
            className={cn(
                'block outline-none transition-[inset-inline-start,top] duration-500 ease-in focus-visible:outline-sap motion-reduce:transition-none',
                className
            )}
        >
            <div
                className={cn(
                    'relative m-0 box-border flex min-w-80 p-0',
                    item.resizing && 'border-2 border-dashed border-sap-content-drag-and-drop-active-color'
                )}
            >
                <div
                    data-resizable-card-box=""
                    className="flex transition-[width,height] duration-250 ease-in-out motion-reduce:transition-none"
                    style={{ width, height }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <div className="relative order-1 h-[calc(100%_-_0.0625rem)] flex-1 [&>:not([data-resize-corner])]:h-full [&>:not([data-resize-corner])]:overflow-hidden [&>:not([data-resize-corner])>*]:shrink-0">
                        {children}
                        {resizable && (hovered || item.resizing) && (
                            <div
                                aria-hidden="true"
                                data-resize-corner=""
                                className="absolute end-0 -bottom-[0.35rem] z-2 flex size-6 min-w-6 items-start justify-start rtl:-end-1 rtl:-bottom-0.5"
                            >
                                <div
                                    data-glyph={iconGlyphChar('resize-corner')}
                                    className="absolute z-2 flex size-full min-w-4 cursor-nwse-resize items-center justify-center font-sap-content-icon-font-family text-[1rem] leading-4 text-sap-button-lite-text-color before:content-[attr(data-glyph)] rtl:[transform:rotate(90deg)] rtl:cursor-nesw-resize"
                                    onPointerDown={(event) => startResize(event, 'both')}
                                />
                            </div>
                        )}
                    </div>
                    {resizable && (
                        <>
                            <div
                                aria-hidden="true"
                                className="z-2 order-2 w-px cursor-ew-resize"
                                onPointerDown={(event) => startResize(event, 'horizontal')}
                            />
                            <div
                                aria-hidden="true"
                                className="absolute bottom-0 z-2 h-px w-[calc(100%_-_0.5rem)] cursor-ns-resize"
                                onPointerDown={(event) => startResize(event, 'vertical')}
                            />
                        </>
                    )}
                </div>
                <div
                    data-resizable-card-indication=""
                    className="transition-[width,height] duration-250 ease-in-out motion-reduce:transition-none"
                    style={{ width: item.indicationWidth, height }}
                />
            </div>
        </div>
    );
}

export interface ResizableCardLayoutProps extends ComponentProps<'div'> {
    /** Configuration per card, in content order (title, rank, spans, resizable); a card's own `config` wins. */
    layoutConfig?: ResizableCardLayoutConfig | null;
    /** Called when a card's height passes a row, when cards move to make room, and at the mini heights. */
    onStepChange?: ResizedHandler;
    /** Called on every pointer move while a card is resized. */
    onResizing?: ResizedHandler;
    /** Called when a resize ends (and when the layout narrows a card). */
    onResized?: ResizedHandler;
    onMiniHeaderReached?: ResizedHandler;
    onMiniContentReached?: ResizedHandler;
    /** Called with the configuration of every card (in content order) whenever it changes. */
    onLayoutChange?: (config: ResizableCardLayoutConfig) => void;
}

/**
 * Resizable card layout: cards placed in columns of 20rem (1 to 4 by the width of its container) that users resize
 * by dragging their end edge, bottom edge or corner. Widths snap to columns and heights to 1rem rows; other cards
 * move to make room. The arrow keys move the focus between the cards in rank order.
 *
 * ```tsx
 * <ResizableCardLayout onLayoutChange={save}>
 *     <ResizableCardItem key="sales" title="Sales" cardWidthColSpan={2} cardHeightRowSpan={20} cardMiniHeaderRowSpan={5} cardMiniContentRowSpan={10}>
 *         <Card>...</Card>
 *     </ResizableCardItem>
 * </ResizableCardLayout>
 * ```
 *
 * Native props, `className` and `ref` go to the root element.
 */
export function ResizableCardLayout({
    layoutConfig,
    onStepChange,
    onResizing,
    onResized,
    onMiniHeaderReached,
    onMiniContentReached,
    onLayoutChange,
    className,
    style,
    children,
    ref,
    onKeyDown,
    ...props
}: ResizableCardLayoutProps) {
    const root = useRef<HTMLDivElement | null>(null);
    const [layoutSize, setLayoutSize] = useState<LayoutSize>('xl');
    const [, setVersion] = useState(0);
    const bump = () => setVersion((v) => v + 1);
    const model = useRef({
        items: new Map<string, Item>(),
        /** Cards in content order. */
        cards: [] as Item[],
        /** Cards in rank order, as last arranged. */
        sorted: [] as Item[],
        columnsHeight: [] as number[],
        layoutHeight: 0,
        layoutShifted: false,
        size: 'xl' as LayoutSize
    }).current;
    model.size = layoutSize;
    const handlers = useRef({ onStepChange, onResizing, onResized, onMiniHeaderReached, onMiniContentReached });
    handlers.current = { onStepChange, onResizing, onResized, onMiniHeaderReached, onMiniContentReached };

    // read the cards' props: the configuration they get from the layout, their own `config`, or their props; a
    // rank or span that changes resets what resizing changed (Angular's linkedSignal)
    const elements: { key: string; element: ReactElement<ResizableCardItemProps> }[] = [];
    Children.forEach(children, (child) => {
        if (isValidElement<ResizableCardItemProps>(child))
            elements.push({ key: child.key ?? String(elements.length), element: child });
    });
    const seen = new Set<string>();
    model.cards = elements.map(({ key, element }, index) => {
        const p = element.props;
        const config = p.config ?? layoutConfig?.[index] ?? null;
        const inputs: ItemInputs = {
            title: config?.title ?? p.title ?? undefined,
            rank: config?.rank ?? p.rank ?? index + 1,
            widthSpan: config?.cardWidthColSpan ?? p.cardWidthColSpan ?? 1,
            heightSpan: config?.cardHeightRowSpan ?? p.cardHeightRowSpan ?? 0,
            miniHeaderSpan: config?.cardMiniHeaderRowSpan ?? p.cardMiniHeaderRowSpan ?? 0,
            miniContentSpan: config?.cardMiniContentRowSpan ?? p.cardMiniContentRowSpan ?? 0,
            resizable: config?.resizable ?? p.resizable ?? true,
            onResizing: p.onResizing,
            onResized: p.onResized,
            onMiniHeaderReached: p.onMiniHeaderReached,
            onMiniContentReached: p.onMiniContentReached
        };
        seen.add(key);
        let item = model.items.get(key);
        if (!item) {
            item = {
                key,
                inputs,
                element: null,
                rank: inputs.rank,
                prevRank: 0,
                widthSpan: inputs.widthSpan,
                originalWidthSpan: inputs.widthSpan,
                heightSpan: inputs.heightSpan,
                widthPx: null,
                heightPx: null,
                start: null,
                top: 0,
                startingColumnPosition: 0,
                cardState: 0,
                previousCardHeightRowSpan: 0,
                resizing: false,
                indicationWidth: 0,
                maxColumns: 4,
                prevX: 0,
                prevY: 0,
                prevCardWidth: 0,
                prevCardHeight: 0,
                direction: 'both',
                detach: null
            };
            model.items.set(key, item);
        } else {
            const before = item.inputs;
            if (before.rank !== inputs.rank) item.rank = inputs.rank;
            if (before.widthSpan !== inputs.widthSpan) {
                item.widthSpan = item.originalWidthSpan = inputs.widthSpan;
                item.widthPx = null;
            }
            if (before.heightSpan !== inputs.heightSpan) {
                item.heightSpan = inputs.heightSpan;
                item.heightPx = null;
            }
            item.inputs = inputs;
        }
        return item;
    });
    for (const key of [...model.items.keys()]) if (!seen.has(key)) model.items.delete(key);

    /* ------------------------------------------------------------------------------------------------------ */
    /* Placement (Angular's arrangeCards)                                                                      */
    /* ------------------------------------------------------------------------------------------------------ */

    const fitColumn = (item: Item, height: number): number => {
        const columns = COLUMNS[model.size];
        const span = columnSpan(cardWidth(item));
        const positions = model.columnsHeight.flatMap((h, i) => (h === height ? [i + 1] : []));
        for (const position of positions) {
            for (let start = Math.max(position - (span - 1), 1); start <= position; start++) {
                const fits =
                    span + start - 1 <= columns &&
                    Array.from({ length: span }, (_, s) => model.columnsHeight[start + s - 1]).every(
                        (h) => h !== undefined && h <= height
                    );
                if (fits) return start - 1;
            }
        }
        return -1;
    };

    const placeCard = (item: Item, index: number) => {
        const padding = PADDING[model.size];
        if (index === 0) {
            item.start = padding;
            item.top = 0;
            item.startingColumnPosition = 0;
            return;
        }
        const heights = [...new Set(model.columnsHeight)].sort((a, b) => a - b);
        for (const height of heights) {
            const column = fitColumn(item, height);
            if (column === -1) continue;
            item.start = column * horizontalResizeStep + padding + column * gap;
            item.top = height + (height > 0 ? verticalResizeStep : 0);
            item.startingColumnPosition = column;
            return;
        }
    };

    const updateColumnsHeight = (item: Item) => {
        const start = item.startingColumnPosition;
        const span = columnSpan(cardWidth(item));
        const height = cardHeight(item) + item.top;
        for (let i = 0; i < span; i++) model.columnsHeight[i + start] = height;
        if (start === span) model.columnsHeight[start] = height;
    };

    /** Places the cards by rank, each at the topmost position where it fits. */
    const arrange = (cards: readonly Item[]) => {
        model.columnsHeight = new Array(COLUMNS[model.size]).fill(0);
        model.sorted = [...cards].sort((a, b) => a.rank - b.rank);
        model.sorted.forEach((item, index) => {
            placeCard(item, index);
            updateColumnsHeight(item);
        });
        model.layoutHeight = Math.max(0, ...model.columnsHeight) + verticalResizeStep;
    };

    /* ------------------------------------------------------------------------------------------------------ */
    /* Layout reactions to the cards (Angular's cardResizing, cardResized, handleHorizontalResize)              */
    /* ------------------------------------------------------------------------------------------------------ */

    const emitStep = (event: ResizedEvent) => handlers.current.onStepChange?.(event);

    const cardResized = (item: Item) => {
        const event = resizedEvent(item);
        item.inputs.onResized?.(event);
        model.layoutShifted = false;
        arrange(model.cards);
        handlers.current.onResized?.(event);
    };

    const shift = (shifted: boolean, item: Item) => {
        model.layoutShifted = shifted;
        arrange(model.sorted);
        emitStep(resizedEvent(item));
    };

    const moveCardDown = (index: number) => {
        const current = model.sorted[index];
        let free = COLUMNS[model.size] - current.widthSpan;
        current.prevRank = current.rank;
        for (let i = 1; free > 0; i++) {
            const next = model.sorted[index + i];
            if (!next || free < next.widthSpan) break;
            next.prevRank = next.rank;
            next.rank = next.rank - 1;
            current.rank = next.prevRank;
            free -= next.widthSpan;
        }
    };

    /** While a card grows into the next column, cards at the end of its row move down (and back). */
    const handleHorizontalResize = (event: ResizedEvent, item: Item) => {
        const columns = COLUMNS[model.size];
        const change = event.cardWidth - event.prevCardWidth;
        const index = model.sorted.findIndex((card) => card.rank === item.rank);
        const cardState = item.cardState;
        if (event.cardWidth > event.prevCardWidth) {
            if (cardState === 1 && change > horizontalResizeOffset + gap && !model.layoutShifted) {
                model.sorted.forEach((card, i) => {
                    if (
                        i > index &&
                        card.startingColumnPosition + card.widthSpan === columns &&
                        card.widthSpan !== columns
                    ) {
                        moveCardDown(i);
                    }
                });
                shift(true, item);
            } else if (cardState === -1 && change < horizontalResizeOffset + gap && model.layoutShifted) {
                model.sorted.forEach((card) => {
                    if (card.prevRank) card.rank = card.prevRank;
                    card.prevRank = 0;
                });
                shift(false, item);
            }
        } else if (event.cardWidth < event.prevCardWidth) {
            if (cardState === -1 && -change > horizontalResizeOffset && !model.layoutShifted) {
                shift(true, item);
            } else if (cardState === 1 && -change < horizontalResizeOffset && model.layoutShifted) {
                shift(false, item);
            }
        }
    };

    const cardResizing = (item: Item) => {
        const event = resizedEvent(item);
        item.inputs.onResizing?.(event);
        handlers.current.onResizing?.(event);
        handleHorizontalResize(event, item);
        if (item.heightSpan !== item.previousCardHeightRowSpan) {
            arrange(model.sorted);
            emitStep(resizedEvent(item));
        }
    };

    const miniReached = (item: Item, which: 'header' | 'content') => {
        const event = resizedEvent(item);
        if (which === 'header') {
            item.inputs.onMiniHeaderReached?.(event);
            handlers.current.onMiniHeaderReached?.(event);
        } else {
            item.inputs.onMiniContentReached?.(event);
            handlers.current.onMiniContentReached?.(event);
        }
        emitStep(event);
    };

    /* ------------------------------------------------------------------------------------------------------ */
    /* Resizing a card (Angular's ResizableCardItem)                                                            */
    /* ------------------------------------------------------------------------------------------------------ */

    const stop = (item: Item) => {
        if (!item.resizing) return;
        item.detach?.();
        item.cardState = 0;
        item.indicationWidth = 0;
        item.resizing = false;
        cardResized(item);
    };

    /** Snaps the width to whole columns once it changed by more than half a column. */
    const snapWidth = (item: Item) => {
        const width = cardWidth(item);
        const increment = width - item.prevCardWidth;
        const span = Math.floor(width / horizontalResizeStep);
        const fraction = width % horizontalResizeStep;
        let snapped: number;
        if (increment > 0) {
            snapped =
                increment < horizontalResizeOffset + gap
                    ? item.prevCardWidth
                    : fraction - (span - 1) * gap > horizontalResizeOffset
                      ? (span + 1) * horizontalResizeStep
                      : span * horizontalResizeStep;
        } else {
            snapped =
                Math.abs(increment) < horizontalResizeOffset
                    ? item.prevCardWidth
                    : fraction - span * gap > horizontalResizeOffset
                      ? (span + 1) * horizontalResizeStep
                      : span * horizontalResizeStep;
        }
        const columns = Math.max(1, Math.round(snapped / horizontalResizeStep));
        item.originalWidthSpan = columns;
        item.widthSpan = columns;
        item.widthPx = null;
    };

    /** Snaps the height to whole rows. */
    const snapHeight = (item: Item) => {
        const height = cardHeight(item);
        const span = Math.floor(height / verticalResizeStep);
        item.heightSpan = height % verticalResizeStep > verticalResizeOffset ? span + 1 : span;
        item.heightPx = null;
    };

    const stopAndSnap = (item: Item) => {
        if (cardWidth(item) !== item.prevCardWidth) snapWidth(item);
        if (cardHeight(item) !== item.prevCardHeight) snapHeight(item);
        stop(item);
    };

    const setHeight = (item: Item, height: number) => {
        item.previousCardHeightRowSpan = item.heightSpan;
        item.heightSpan = Math.floor(height / verticalResizeStep);
        // keep the pixel height while resizing
        item.heightPx = height;
    };

    const resizeHorizontally = (item: Item, x: number) => {
        const rtl = !!item.element && getComputedStyle(item.element).direction === 'rtl';
        const difference = item.prevX - x;
        const indentation = (item.maxColumns - 1) * gap;
        const max = item.maxColumns * horizontalResizeStep + indentation;
        const width = rtl ? cardWidth(item) + difference : cardWidth(item) - difference;
        item.widthPx = Math.min(Math.max(width, horizontalResizeStep), max);
    };

    /** Resizes the height; below the mini content height the card snaps to it, or to the mini header. */
    const resizeVertically = (item: Item, y: number) => {
        const header = item.inputs.miniHeaderSpan * verticalResizeStep;
        const content = item.inputs.miniContentSpan * verticalResizeStep;
        const shrinking = item.prevY - y > 0;
        const height = cardHeight(item);
        let reachedHeader = false;
        if (header && height === header) {
            if (shrinking) {
                setHeight(item, header);
            } else {
                setHeight(item, header + content);
                stopAndSnap(item);
                miniReached(item, 'content');
            }
        } else if (height < content + header) {
            if (!shrinking) {
                setHeight(item, header + content);
                stopAndSnap(item);
                miniReached(item, 'content');
            }
        } else if (header && height === content + header && shrinking) {
            reachedHeader = true;
            setHeight(item, header);
            stopAndSnap(item);
            miniReached(item, 'header');
        } else {
            setHeight(item, height - (item.prevY - y));
        }
        if (cardHeight(item) <= content + header && shrinking && !reachedHeader && item.resizing) {
            setHeight(item, content + header);
            miniReached(item, 'content');
            stopAndSnap(item);
        }
    };

    const onMove = (item: Item, event: PointerEvent) => {
        if (!item.resizing) return;
        event.preventDefault();
        const { clientX, clientY } = event;
        const before = cardWidth(item);
        if (item.direction !== 'vertical') resizeHorizontally(item, clientX);
        if (item.direction !== 'horizontal') resizeVertically(item, clientY);
        if (!item.resizing) return;
        const width = cardWidth(item);
        const span = Math.floor(width / horizontalResizeStep);
        const thresholdReached = width - (span * horizontalResizeStep + span * gap) > horizontalResizeOffset;
        if (clientX !== item.prevX) {
            // wider or narrower (Angular takes the pointer direction, which is the other way round in RTL)
            if (width !== before) item.cardState = width > before ? 1 : -1;
            const future = (span + 1) * horizontalResizeStep + span * gap;
            item.indicationWidth = thresholdReached ? future - width : 0;
        }
        item.prevX = clientX;
        item.prevY = clientY;
        cardResizing(item);
    };

    const onUp = (item: Item) => {
        if (!item.resizing) return;
        if (cardWidth(item) !== item.prevCardWidth) snapWidth(item);
        if (cardHeight(item) !== item.prevCardHeight) snapHeight(item);
        stop(item);
    };

    const startResize = (item: Item, event: ReactPointerEvent, direction: ResizeDirection) => {
        if (!item.inputs.resizable || event.button !== 0 || item.resizing) return;
        event.preventDefault();
        item.resizing = true;
        item.prevX = event.clientX;
        item.prevY = event.clientY;
        item.prevCardWidth = cardWidth(item);
        item.prevCardHeight = cardHeight(item);
        item.previousCardHeightRowSpan = item.heightSpan;
        item.direction = direction;
        const pointerId = event.pointerId;
        const move = (e: PointerEvent) => {
            if (e.pointerId !== pointerId) return;
            onMove(item, e);
            bump();
        };
        const up = (e: PointerEvent) => {
            if (e.pointerId !== pointerId) return;
            onUp(item);
            bump();
        };
        const doc = (event.currentTarget as HTMLElement).ownerDocument;
        doc.addEventListener('pointermove', move);
        doc.addEventListener('pointerup', up);
        doc.addEventListener('pointercancel', up);
        doc.body.style.userSelect = 'none';
        item.detach = () => {
            doc.removeEventListener('pointermove', move);
            doc.removeEventListener('pointerup', up);
            doc.removeEventListener('pointercancel', up);
            doc.body.style.userSelect = '';
            item.detach = null;
        };
        bump();
    };

    // stop listening when unmounted mid-resize
    useEffect(() => () => model.items.forEach((item) => item.detach?.()), [model]);

    // the space available to the layout: its container, or the window when that has no width
    useLayoutEffect(() => {
        const element = root.current!;
        const container = element.parentElement ?? element;
        const update = () => setLayoutSize(layoutSizeFor(container.clientWidth || window.innerWidth));
        update();
        const observer = new ResizeObserver(update);
        observer.observe(container);
        window.addEventListener('resize', update);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', update);
        };
    }, []);

    // limit the card widths to the columns of the layout size, restoring the configured span when there is room
    const widths = model.cards.map((item) => `${item.key}:${item.inputs.widthSpan}`).join('|');
    useLayoutEffect(() => {
        let changed = false;
        model.cards.forEach((item) => {
            item.maxColumns = COLUMNS[layoutSize];
            const span = Math.min(item.maxColumns, item.originalWidthSpan);
            if (span === item.widthSpan) return;
            item.widthSpan = span;
            item.widthPx = null;
            changed = true;
            cardResized(item);
        });
        if (changed) bump();
    }, [layoutSize, widths]);

    // place the cards on every render: ranks, sizes and the layout size are read from the model
    arrange(model.cards);

    // report the configuration whenever it changes
    const configuration: ResizableCardLayoutConfig = model.cards.map((item) => {
        const { key: _key, ...config } = state(item);
        return config;
    });
    const signature = JSON.stringify(configuration);
    const reported = useRef<string | null>(null);
    useEffect(() => {
        if (reported.current === signature) return;
        reported.current = signature;
        onLayoutChange?.(JSON.parse(signature));
    });

    /** Arrow keys move the focus between the cards in rank order, with wrap (the CDK's FocusKeyManager). */
    const keyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const sorted = [...model.cards].sort((a, b) => a.rank - b.rank);
        const index = sorted.findIndex((item) => item.element === event.target);
        if (index < 0) return;
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const step = ['ArrowDown', rtl ? 'ArrowLeft' : 'ArrowRight'].includes(event.key)
            ? 1
            : ['ArrowUp', rtl ? 'ArrowRight' : 'ArrowLeft'].includes(event.key)
              ? -1
              : 0;
        if (!step) return;
        event.preventDefault();
        sorted[(index + step + sorted.length) % sorted.length].element?.focus();
    };

    const columns = COLUMNS[layoutSize];
    const padding = PADDING[layoutSize];
    return (
        <div
            {...props}
            ref={ref ? mergeRefs(root, ref) : root}
            style={{
                ...style,
                width: columns * horizontalResizeStep + 2 * padding + (columns - 1) * gap,
                height: model.layoutHeight
            }}
            className={cn(
                'relative m-0 mt-4 box-border block font-sap-font-family text-sap-font-size text-sap-text-color',
                layoutSize === 'sm' ? 'px-2' : layoutSize === 'xl' ? 'px-12' : 'px-4',
                className
            )}
            onKeyDown={keyDown}
        >
            {elements.map(({ key, element }) => {
                const item = model.items.get(key)!;
                return (
                    <ItemContext.Provider
                        key={key}
                        value={{
                            item,
                            register: (node) => (item.element = node),
                            startResize: (event, direction) => startResize(item, event, direction)
                        }}
                    >
                        {element}
                    </ItemContext.Provider>
                );
            })}
        </div>
    );
}
