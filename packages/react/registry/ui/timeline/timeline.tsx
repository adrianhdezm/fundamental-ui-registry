/*
 * Port of @fundamental-ngx/core (timeline) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    createContext,
    Fragment,
    use,
    useCallback,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type Key,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconFont } from '@/ui/icon/icon';
import { Skeleton } from '@/ui/skeleton/skeleton';
import { Text } from '@/ui/text/text';

export type TimelineAxis = 'vertical' | 'horizontal';
/** left, right or double for a vertical axis; top, bottom or double for a horizontal one. */
export type TimelineSidePosition = 'left' | 'right' | 'top' | 'bottom' | 'double';

/** Side of the main line a node is rendered on: first is left (top), second is right (bottom). */
type TimelineSide = 'first' | 'second';

/** Gap between the end of a connecting line and the next node. */
const LINE_GAP = 4;
/** Minimum line length between consecutive nodes on alternating sides of a vertical timeline. */
const DOUBLE_OFFSET = 24;

/** The elements of a rendered node that the timeline measures and lays out. */
interface TimelineNodeEntry {
    side: TimelineSide;
    host: HTMLElement;
    marker: HTMLElement;
    line: HTMLElement;
    post: HTMLElement;
}

interface TimelineContextValue {
    axis: TimelineAxis;
    register(entry: TimelineNodeEntry): () => void;
    calculatePositions(): void;
}

const TimelineContext = createContext<TimelineContextValue | null>(null);
const TimelineSideContext = createContext<TimelineSide>('second');

export interface TimelineNodeProps extends ComponentProps<'div'> {
    /** Icon on the line instead of the dot. */
    glyph?: string | null;
    /** Icon font of the glyph. */
    glyphFont?: IconFont;
}

/**
 * A post on the timeline with its node (a dot or an icon) on the main line. Render it from the timeline's
 * `renderNode`; its content is usually a `TimelineNodeHeader`, a `TimelineNodeBody` and a `TimelineNodeFooter`.
 */
export function TimelineNode({
    glyph,
    glyphFont = 'SAP-icons',
    ref,
    className,
    children,
    ...props
}: TimelineNodeProps) {
    const timeline = use(TimelineContext);
    const side = use(TimelineSideContext);
    const vertical = (timeline?.axis ?? 'vertical') === 'vertical';
    const first = side === 'first';
    const host = useRef<HTMLDivElement | null>(null);
    const marker = useRef<HTMLDivElement>(null);
    const line = useRef<HTMLDivElement>(null);
    const post = useRef<HTMLDivElement>(null);
    const register = timeline?.register;

    useLayoutEffect(
        () =>
            register?.({
                side,
                host: host.current!,
                marker: marker.current!,
                line: line.current!,
                post: post.current!
            }),
        [register, side]
    );

    const icon = !!glyph;
    return (
        <div
            role="listitem"
            {...props}
            ref={(node) => {
                host.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            className={cn('relative box-border flex shrink-0', !vertical && 'w-80', className)}
        >
            <div
                className={
                    vertical
                        ? cn(
                              'absolute top-2 flex h-full w-6 flex-[1_0] flex-col items-center',
                              first ? '-end-6' : '-start-6'
                          )
                        : cn('absolute start-2 flex h-6 w-full items-center', first ? '-bottom-6' : '-top-6')
                }
            >
                <div
                    className={
                        vertical
                            ? cn('flex-none pb-1', icon ? 'pt-1' : 'pt-3')
                            : cn('flex-none pe-1', icon ? 'ps-1' : 'ps-3')
                    }
                >
                    <div
                        ref={marker}
                        className={
                            icon
                                ? 'm-0 flex items-center justify-center p-0'
                                : 'm-0 size-1.5 rounded-full bg-sap-content-foreground-border-color p-0'
                        }
                    >
                        {icon && (
                            <Icon
                                glyph={glyph}
                                font={glyphFont}
                                className="size-[1.375rem] text-[1.375rem] leading-none text-sap-content-non-interactive-icon-color"
                            />
                        )}
                    </div>
                </div>
                <div
                    ref={line}
                    className={cn(
                        'box-border shrink-0 border border-solid border-sap-content-foreground-border-color',
                        vertical ? 'w-0' : 'h-0'
                    )}
                />
            </div>
            <div
                ref={post}
                className={cn(
                    'relative m-0 box-border h-auto grow rounded-[0.25rem] border border-solid border-sap-group-content-border-color bg-sap-group-content-background p-2',
                    "after:absolute after:box-border after:size-[0.8rem] after:border-t after:border-r after:border-solid after:border-sap-group-content-border-color after:bg-sap-group-content-background after:content-['']",
                    vertical
                        ? first
                            ? 'me-4 mb-5 after:-end-[0.4375rem] after:top-4 after:rotate-45 rtl:after:-rotate-135'
                            : 'ms-4 mb-5 after:-start-[0.4375rem] after:top-4 after:-rotate-135 rtl:after:rotate-45'
                        : first
                          ? 'me-5 mb-4 after:start-4 after:-bottom-[0.4375rem] after:rotate-135'
                          : 'me-5 mt-4 after:start-4 after:-top-[0.4375rem] after:-rotate-45'
                )}
            >
                {children}
            </div>
        </div>
    );
}

/** Header row of a post: avatar and header info. */
export function TimelineNodeHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('m-0 mb-2 box-border flex items-center p-0', className)} />;
}

/** Title, text and subtitle of a post header. */
export function TimelineNodeHeaderInfo({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('m-0 box-border block p-0 not-first:ms-[0.3125rem]', className)} />;
}

/** Bold title of a post header, e.g. the user name. Renders a `<span>`; `render` renders another element. */
export function TimelineNodeHeaderInfoTitle({ render, className, ...props }: useRender.ComponentProps<'span'>) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: { ...props, className: cn('me-[0.3rem] font-bold', className) }
    });
}

/** Text after the title, e.g. what the user did. Renders a `<span>`; `render` renders another element. */
export function TimelineNodeHeaderInfoText({ render, className, ...props }: useRender.ComponentProps<'span'>) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: { ...props, className: cn('font-normal', className) }
    });
}

/** Smaller line under the title, e.g. the date. Renders a `<div>`; `render` renders another element. */
export function TimelineNodeHeaderInfoSubtitle({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn('mt-0.5 block text-sap-font-small-size text-sap-content-label-color', className)
        }
    });
}

export interface TimelineNodeBodyProps extends Omit<ComponentProps<'div'>, 'content'> {
    /** Text of the post. */
    content?: string | null;
    /** Collapses the text to this many lines, with a More/Less toggle. */
    maxLines?: number | null;
}

/** Text of a post; with `maxLines` it collapses and gets a More/Less toggle. Children follow the text. */
export function TimelineNodeBody({ content, maxLines, className, children, ...props }: TimelineNodeBodyProps) {
    const timeline = use(TimelineContext);
    return (
        <div {...props} className={cn('block', className)}>
            {content && (
                <Text
                    maxLines={maxLines || null}
                    expandable={!!maxLines}
                    onCollapsedChange={() => timeline?.calculatePositions()}
                >
                    {content}
                </Text>
            )}
            {children}
        </div>
    );
}

/** Actions of a post. */
export function TimelineNodeFooter({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('mt-2 flex flex-wrap items-center gap-2', className)} />;
}

/** Imperative actions of a timeline, through `actionsRef`. */
export interface TimelineActions {
    /** Recomputes the connecting lines, e.g. after the content of a node changed its size. */
    calculatePositions(): void;
}

export interface TimelineProps<T = unknown> extends Omit<ComponentProps<'div'>, 'children'> {
    /** Nodes in chronological order; `null` or `undefined` shows loading placeholders. */
    dataSource?: readonly T[] | null;
    /** Renders a node of the data source, as a `TimelineNode`. */
    renderNode?: (item: T, index: number) => ReactNode;
    /** Key of a node: nodes with the same key keep their DOM when the data changes. Default: the item itself. */
    trackBy?: (index: number, item: T) => Key;
    /** Direction of the main line. */
    axis?: TimelineAxis;
    /** Side of the line the nodes are on, or `double` to alternate. */
    layout?: TimelineSidePosition;
    /** `calculatePositions()`, to redraw the lines after a node changed its size. */
    actionsRef?: Ref<TimelineActions>;
}

/** Keys that follow the identity of the items (objects) or their value (primitives), as Angular's default track. */
function useIdentityKeys() {
    const ids = useRef(new WeakMap<object, number>());
    const next = useRef(0);
    return (item: unknown): string => {
        if ((typeof item === 'object' && item !== null) || typeof item === 'function') {
            let id = ids.current.get(item);
            if (id === undefined) {
                id = ++next.current;
                ids.current.set(item, id);
            }
            return `o${id}`;
        }
        return `${typeof item}:${String(item)}`;
    };
}

/**
 * Timeline: posts in chronological order along a vertical or horizontal line, on one side or alternating on both
 * sides. Nodes are rendered from `dataSource` with `renderNode`; without a data source it shows loading
 * placeholders. Each node shows a dot or an icon on the line, joined to the next one by a connecting line.
 *
 * ```tsx
 * <Timeline
 *     dataSource={posts}
 *     layout="double"
 *     renderNode={(post) => (
 *         <TimelineNode glyph={post.glyph}>
 *             <TimelineNodeHeader>...</TimelineNodeHeader>
 *             <TimelineNodeBody content={post.text} />
 *         </TimelineNode>
 *     )}
 * />
 * ```
 */
export function Timeline<T = unknown>({
    dataSource,
    renderNode,
    trackBy,
    axis = 'vertical',
    layout = 'right',
    actionsRef,
    ref,
    className,
    'aria-label': ariaLabel = 'Timeline',
    ...props
}: TimelineProps<T>) {
    const host = useRef<HTMLDivElement | null>(null);
    const nodes = useRef(new Set<TimelineNodeEntry>());
    const observer = useRef<ResizeObserver | null>(null);
    const [, setVersion] = useState(0);
    const identityKey = useIdentityKeys();

    const loading = !dataSource;
    const sides = {
        first: layout !== 'right' && layout !== 'bottom',
        second: layout !== 'left' && layout !== 'top'
    };
    const loadingSide: TimelineSide = sides.first ? 'first' : 'second';

    /**
     * Spaces alternating nodes of a double-sided vertical timeline so that each node comes after the previous one,
     * then draws the line of every node up to the next one.
     */
    const layoutLines = useCallback(() => {
        const root = host.current;
        if (!root) return;
        const rtl = getComputedStyle(root).direction === 'rtl';
        const inDocumentOrder = (side: TimelineSide) =>
            [...nodes.current]
                .filter((node) => node.side === side)
                .sort((a, b) => (a.host.compareDocumentPosition(b.host) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        const first = inDocumentOrder('first');
        const second = inDocumentOrder('second');
        const double = first.length > 0 && second.length > 0;
        const order = double
            ? Array.from({ length: Math.max(first.length, second.length) }, (_, i) => [first[i], second[i]])
                  .flat()
                  .filter((node): node is TimelineNodeEntry => !!node)
            : [...first, ...second];
        const start = (rect: DOMRect) => (axis === 'vertical' ? rect.top : rtl ? -rect.right : rect.left);
        const markerStart = (node: TimelineNodeEntry) => start(node.marker.getBoundingClientRect());

        if (axis === 'vertical' && double) {
            order.forEach((node) => (node.host.style.marginTop = ''));
            order.forEach((node, i) => {
                const previous = order[i - 1]?.marker.getBoundingClientRect();
                const gap = previous ? previous.bottom + DOUBLE_OFFSET - markerStart(node) : 0;
                if (gap > 0) node.host.style.marginTop = `${gap}px`;
            });
        } else {
            order.forEach((node) => (node.host.style.marginTop = ''));
        }
        order.forEach((node, i) => {
            const next = order[i + 1];
            node.line.style.opacity = next ? '' : '0';
            node.line.style[axis === 'vertical' ? 'width' : 'height'] = '';
            if (!next) return;
            const size = Math.max(0, markerStart(next) - start(node.line.getBoundingClientRect()) - LINE_GAP);
            node.line.style[axis === 'vertical' ? 'height' : 'width'] = `${size}px`;
        });
    }, [axis]);
    const layoutRef = useRef(layoutLines);
    layoutRef.current = layoutLines;

    const calculatePositions = useCallback(() => setVersion((n) => n + 1), []);
    useImperativeHandle(actionsRef, () => ({ calculatePositions }), [calculatePositions]);

    // the timeline and every post: a resize (wrapping text, More/Less) moves the nodes after it
    useLayoutEffect(() => {
        const resize = new ResizeObserver(() => layoutRef.current());
        observer.current = resize;
        if (host.current) resize.observe(host.current);
        nodes.current.forEach((node) => resize.observe(node.post));
        return () => {
            resize.disconnect();
            observer.current = null;
        };
    }, []);

    const register = useCallback((entry: TimelineNodeEntry) => {
        nodes.current.add(entry);
        observer.current?.observe(entry.post);
        return () => {
            nodes.current.delete(entry);
            observer.current?.unobserve(entry.post);
        };
    }, []);

    // after every render: nodes may have been added, removed or changed
    useLayoutEffect(() => layoutLines());

    const context = useMemo<TimelineContextValue>(
        () => ({ axis, register, calculatePositions }),
        [axis, register, calculatePositions]
    );

    const items = (dataSource ?? []).map((data, index) => ({ data, index }));
    const firstItems = sides.first ? items.filter((item) => !sides.second || item.index % 2 === 0) : [];
    const secondItems = sides.second ? items.filter((item) => !sides.first || item.index % 2 === 1) : [];

    const keys = new Map<string, number>();
    const keyOf = (item: { data: T; index: number }) => {
        const base = trackBy ? `t:${String(trackBy(item.index, item.data))}` : identityKey(item.data);
        // the same item twice gets two nodes
        const seen = keys.get(base) ?? 0;
        keys.set(base, seen + 1);
        return seen ? `${base}#${seen}` : base;
    };
    // keys in data order, so a node keeps its key whichever side it moves to
    const itemKeys = items.map(keyOf);

    const vertical = axis === 'vertical';
    const listClass = (side: TimelineSide) => {
        const used = sides[side] || (loading && loadingSide === side);
        const offset = side === 'second' && sides.first;
        return cn(
            'relative m-0 box-border flex p-0',
            vertical ? 'flex-[1_0_calc(50%_-_0.75rem)] flex-col' : 'grow',
            !vertical && (side === 'first' ? 'items-end' : 'items-start'),
            !used && (vertical ? 'flex-[0_0_0]' : 'hidden'),
            offset && (vertical ? 'pt-6' : 'ps-[4.688rem]')
        );
    };

    const placeholders = [0, 1, 2].map((i) => (
        <TimelineNode key={`placeholder-${i}`}>
            <TimelineNodeHeader>
                <Skeleton width="100%" height="32px">
                    <circle cx="16" cy="16" r="16" />
                    <rect x="37" y="0" width="120" height="12" rx="4" />
                    <rect x="37" y="20" width="80" height="8" rx="4" />
                </Skeleton>
            </TimelineNodeHeader>
            <Skeleton type="text" />
        </TimelineNode>
    ));

    const list = (side: TimelineSide, sideItems: typeof items) => (
        <div className={listClass(side)}>
            <TimelineSideContext value={side}>
                {loading && loadingSide === side && placeholders}
                {sideItems.map((item) => (
                    <Fragment key={itemKeys[item.index]}>{renderNode?.(item.data, item.index)}</Fragment>
                ))}
            </TimelineSideContext>
        </div>
    );

    return (
        <div
            role="list"
            aria-label={ariaLabel ?? undefined}
            aria-busy={loading || undefined}
            {...props}
            ref={(node) => {
                host.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            className={cn(
                'm-0 box-border flex justify-center p-0 font-sap-font-family text-sap-font-size leading-(--sapContent_LineHeight) text-sap-text-color',
                vertical ? 'max-w-[50rem] items-stretch' : 'flex-col',
                className
            )}
        >
            <TimelineContext value={context}>
                {list('first', firstItems)}
                <div className={vertical ? 'h-full w-6 flex-[0_0_1.5rem]' : 'h-6 w-full'} />
                {list('second', secondItems)}
            </TimelineContext>
        </div>
    );
}
