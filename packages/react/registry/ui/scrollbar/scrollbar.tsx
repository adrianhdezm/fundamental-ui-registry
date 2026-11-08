/*
 * Port of @fundamental-ngx/core (scrollbar) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { cn } from '@/lib/utils';

export interface ScrollbarProps extends useRender.ComponentProps<'div'> {
    /** Hides the horizontal overflow: no horizontal scrollbar, and the content is clipped. */
    noHorizontalScroll?: boolean;
    /** Hides the vertical overflow: no vertical scrollbar, and the content is clipped. */
    noVerticalScroll?: boolean;
    /** Shows the scrollbars even when the content fits (`overflow: scroll`). */
    alwaysVisible?: boolean;
}

/**
 * A scroll container with SAP-themed scrollbars. Renders a `<div>` (`render` renders another element) that scrolls
 * in both directions when its content overflows; give it a size. The ref is the element, so `ref.current.scroll()`
 * scrolls it. Make it focusable (`tabIndex={0}` and a label) when its content has nothing focusable, so keyboard
 * users can scroll it.
 *
 * ```tsx
 * <Scrollbar tabIndex={0} aria-label="Terms" className="h-60">…</Scrollbar>
 * <Scrollbar noHorizontalScroll alwaysVisible className="h-60">…</Scrollbar>
 * ```
 */
export function Scrollbar({
    noHorizontalScroll = false,
    noVerticalScroll = false,
    alwaysVisible = false,
    render,
    className,
    ...props
}: ScrollbarProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'box-border block font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-text-color',
                'scrollbar-sap focus-visible:outline-sap focus-visible:-outline-offset-2',
                noHorizontalScroll ? 'overflow-x-hidden' : alwaysVisible ? 'overflow-x-scroll' : 'overflow-x-auto',
                noVerticalScroll ? 'overflow-y-hidden' : alwaysVisible ? 'overflow-y-scroll' : 'overflow-y-auto',
                className
            )
        }
    });
}
