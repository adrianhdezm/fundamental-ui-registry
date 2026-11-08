/*
 * Port of @fundamental-ngx/core (infinite-scroll) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { useCallback, useRef, type RefCallback } from 'react';

export interface InfiniteScrollOptions {
    /** Fires once this percentage of the content is scrolled into view (when no `scrollOffset` is set). */
    scrollPercent?: number;
    /** Fires within this many pixels of the end instead of at `scrollPercent`. */
    scrollOffset?: number | null;
    /**
     * Called when the container is scrolled past `scrollPercent` (or to within `scrollOffset` of the end), 50ms after
     * the last scroll event; again on later scrolls while it stays there, so guard against loading twice.
     */
    onScrollAction?: () => void;
}

/** Waits this long after the last scroll event before checking the position (Angular's `debounceTime(50)`). */
const DEBOUNCE = 50;

/** Whether the scroll position of `element` is far enough to load more. */
export function shouldTriggerAction(
    element: HTMLElement,
    { scrollPercent = 75, scrollOffset }: Pick<InfiniteScrollOptions, 'scrollPercent' | 'scrollOffset'> = {}
): boolean {
    const bottom = element.scrollTop + element.offsetHeight;
    return scrollOffset
        ? bottom > element.scrollHeight - scrollOffset
        : bottom / element.scrollHeight > scrollPercent / 100;
}

/**
 * Calls `onScrollAction` when a scroll container nears the end of its content, e.g. to load more items. Returns a
 * ref callback for the scroll container; the options are read on every check, so they can change between renders.
 *
 * ```tsx
 * const ref = useInfiniteScroll<HTMLUListElement>({ scrollOffset: 40, onScrollAction: loadMore });
 * <List ref={ref} className="h-72 overflow-auto">…</List>
 * ```
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLElement>(
    options: InfiniteScrollOptions = {}
): RefCallback<T> {
    const latest = useRef(options);
    latest.current = options;

    return useCallback((container: T | null) => {
        if (!container) return;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const onScroll = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (shouldTriggerAction(container, latest.current)) latest.current.onScrollAction?.();
            }, DEBOUNCE);
        };
        container.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            clearTimeout(timer);
            container.removeEventListener('scroll', onScroll);
        };
    }, []);
}

export interface InfiniteScrollProps extends InfiniteScrollOptions, useRender.ComponentProps<'div'> {}

/**
 * A scroll container that calls `onScrollAction` when it is scrolled near the end of its content, e.g. to load more
 * list items. Renders a `<div>` (`render` renders another element, such as a `List`) and has no styles of its own:
 * give it a height and `overflow-auto`. `useInfiniteScroll` does the same for an element of your own.
 *
 * ```tsx
 * <InfiniteScroll scrollOffset={40} onScrollAction={loadMore} render={<List aria-label="Products" />} className="h-72 overflow-auto">
 *     {items.map((item) => <ListItem key={item.id}>…</ListItem>)}
 * </InfiniteScroll>
 * ```
 */
export function InfiniteScroll({
    scrollPercent,
    scrollOffset,
    onScrollAction,
    render,
    ref,
    ...props
}: InfiniteScrollProps) {
    const scrollRef = useInfiniteScroll<HTMLDivElement>({ scrollPercent, scrollOffset, onScrollAction });
    return useRender({
        render,
        ref: ref ? [ref, scrollRef] : scrollRef,
        defaultTagName: 'div',
        props
    });
}
