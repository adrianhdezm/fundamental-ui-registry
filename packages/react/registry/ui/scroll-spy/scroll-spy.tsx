/*
 * Port of @fundamental-ngx/core (scroll-spy) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { useCallback, useRef, type RefCallback } from 'react';

export interface ScrollSpyOptions {
    /** Tag names of the children to track, e.g. `['section', 'h2']` (any case). Nothing is tracked by default. */
    trackedTags?: readonly string[];
    /** Reports `undefined` when no tracked child is reached yet (scrolling back above all of them). */
    fireEmpty?: boolean;
    /** Part of the container height (0-1) below the top that still counts as reached. */
    targetPercent?: number;
    /** Pixel offset added to the reach line. */
    targetOffset?: number;
    /** Stops tracking (Angular's `scrollSpyDisabled`), e.g. while a programmatic scroll runs. */
    disabled?: boolean;
    /**
     * Called with the tracked child that is now at the top: once when the container is first laid out, on every
     * change while scrolling, and again (with the same child) whenever the container is resized.
     */
    onSpyChange?: (element: HTMLElement | undefined) => void;
}

/**
 * Tracks which direct child of a scroll container (with one of the tracked tag names) is at the top. Returns a ref
 * callback for the scroll container; the options are read on every scroll, so they can change between renders.
 *
 * ```tsx
 * const ref = useScrollSpy({ trackedTags: ['section'], onSpyChange: (el) => setActive(el?.id) });
 * <div ref={ref} className="h-96 overflow-auto">…</div>
 * ```
 */
export function useScrollSpy<T extends HTMLElement = HTMLElement>(options: ScrollSpyOptions = {}): RefCallback<T> {
    const latest = useRef(options);
    latest.current = options;

    return useCallback((container: T | null) => {
        if (!container) return;
        let current: HTMLElement | undefined;
        const spy = (forced: boolean) => {
            const {
                trackedTags = [],
                fireEmpty = false,
                targetPercent = 0,
                targetOffset = 0,
                disabled = false,
                onSpyChange
            } = latest.current;
            if (disabled) return;
            const children = Array.from(container.children) as HTMLElement[];
            if (!children.length) return;
            const tags = trackedTags.map((tag) => tag.toUpperCase());
            const origin = children[0].offsetTop + targetOffset;
            const line = container.scrollTop + container.offsetHeight * targetPercent;
            let spied: HTMLElement | undefined;
            for (const child of children) {
                if (tags.includes(child.tagName) && child.offsetTop - origin <= line) spied = child;
            }
            if (forced || ((spied || fireEmpty) && spied !== current)) {
                current = spied;
                onSpyChange?.(spied);
            }
        };
        const onScroll = () => spy(false);
        // fires once when observing starts: the first report after layout
        const observer = new ResizeObserver(() => spy(true));
        container.addEventListener('scroll', onScroll, { passive: true });
        observer.observe(container);
        return () => {
            container.removeEventListener('scroll', onScroll);
            observer.disconnect();
        };
    }, []);
}

export interface ScrollSpyProps extends ScrollSpyOptions, useRender.ComponentProps<'div'> {}

/**
 * A scroll container that reports which tracked child is at the top, e.g. to highlight the current entry of a table
 * of contents. Renders a `<div>` (`render` renders another element) and has no styles of its own: give it a height
 * and `overflow-auto`. `useScrollSpy` does the same for an element of your own.
 *
 * ```tsx
 * <ScrollSpy trackedTags={['section']} onSpyChange={(el) => setActive(el?.id)} className="h-96 overflow-auto">
 *     <section id="intro">…</section>
 *     <section id="usage">…</section>
 * </ScrollSpy>
 * ```
 */
export function ScrollSpy({
    trackedTags,
    fireEmpty,
    targetPercent,
    targetOffset,
    disabled,
    onSpyChange,
    render,
    ref,
    ...props
}: ScrollSpyProps) {
    const spyRef = useScrollSpy<HTMLDivElement>({
        trackedTags,
        fireEmpty,
        targetPercent,
        targetOffset,
        disabled,
        onSpyChange
    });
    return useRender({
        render,
        ref: ref ? [ref, spyRef] : spyRef,
        defaultTagName: 'div',
        props
    });
}
