/*
 * Port of @fundamental-ngx/core (dynamic-side-content) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { Children, isValidElement, useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type DynamicSideContentPosition = 'left' | 'right' | 'bottom' | 'equalSplit' | 'none';
/** sm hides the side content; md and lg give the main content two thirds, xl three quarters. */
export type DynamicSideContentSize = 'sm' | 'md' | 'lg' | 'xl';

export type DynamicSideContentMainProps = useRender.ComponentProps<'div'>;

/** Main content of a dynamic side content layout (Angular's `fd-dynamic-side-content-main`). */
export function DynamicSideContentMain({ id: idProp, render, ...props }: DynamicSideContentMainProps) {
    const autoId = useId();
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, id: idProp ?? `fd-dynamic-side-content-main-${autoId}`, 'data-dsc-main': '' }
    });
}

export type DynamicSideContentSideProps = useRender.ComponentProps<'div'>;

/** Side content of a dynamic side content layout (Angular's `fd-dynamic-side-content-side`). */
export function DynamicSideContentSide({ id: idProp, render, ...props }: DynamicSideContentSideProps) {
    const autoId = useId();
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, id: idProp ?? `fd-dynamic-side-content-side-${autoId}`, 'data-dsc-side': '' }
    });
}

/**
 * Puts the side content first (left), last (right, bottom) or keeps the order of the children (none, equalSplit).
 * Only direct `DynamicSideContentMain` and `DynamicSideContentSide` children are known; other children keep their
 * place.
 */
function ordered(children: ReactNode, position: DynamicSideContentPosition): ReactNode[] {
    const items = Children.toArray(children);
    const kind = (child: ReactNode) =>
        isValidElement(child)
            ? child.type === DynamicSideContentMain
                ? 'main'
                : child.type === DynamicSideContentSide
                  ? 'side'
                  : null
            : null;
    if (position !== 'left' && position !== 'right' && position !== 'bottom') return items;
    const first = position === 'left' ? 'side' : 'main';
    const known = items.filter((child) => kind(child) !== null);
    // a stable sort: parts of the same kind keep their order
    const sorted = [...known.filter((child) => kind(child) === first), ...known.filter((c) => kind(c) !== first)];
    return items.map((child) => (kind(child) === null ? child : sorted.shift()));
}

export interface DynamicSideContentProps extends useRender.ComponentProps<'div'> {
    /**
     * Where the side content goes: `left` or `right` of the main content, `bottom` (below it) or `equalSplit` (half
     * each). `none` (default) and `equalSplit` keep the order of the children; the others place the side content
     * whatever the order.
     */
    position?: DynamicSideContentPosition;
    /**
     * Screen size the layout is drawn for: `sm` hides the side content (except below the main content), `md` and
     * `lg` give the main content two thirds, `xl` (default) three quarters.
     */
    size?: DynamicSideContentSize;
}

/**
 * Dynamic side content: main content with supplementary side content next to it (left or right), below it, or in
 * an equal split. The size hides the side content (sm) or sets the share of the main content. Renders a `<div>`.
 *
 * ```tsx
 * <DynamicSideContent position="right" size="md">
 *     <DynamicSideContentMain>…</DynamicSideContentMain>
 *     <DynamicSideContentSide>…</DynamicSideContentSide>
 * </DynamicSideContent>
 * ```
 */
export function DynamicSideContent({
    position = 'none',
    size = 'xl',
    id: idProp,
    render,
    className,
    children,
    ...props
}: DynamicSideContentProps) {
    const autoId = useId();
    const below = position === 'bottom';
    const equal = position === 'equalSplit';
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            id: idProp ?? `fd-dynamic-side-content-${autoId}`,
            children: ordered(children, position),
            className: cn(
                'm-0 box-border flex w-full p-0 font-sap-font-family text-sap-font-size text-sap-text-color',
                '[&>[data-dsc-main]]:m-0 [&>[data-dsc-main]]:box-border [&>[data-dsc-main]]:block [&>[data-dsc-main]]:p-0',
                '[&>[data-dsc-side]]:m-0 [&>[data-dsc-side]]:box-border [&>[data-dsc-side]]:block [&>[data-dsc-side]]:flex-[1_1_0] [&>[data-dsc-side]]:p-0',
                size === 'sm'
                    ? '[&>[data-dsc-main]]:w-full [&>[data-dsc-side]]:hidden'
                    : size === 'xl'
                      ? '[&>[data-dsc-main]]:w-3/4'
                      : '[&>[data-dsc-main]]:w-[66.666%]',
                equal &&
                    'flex-row [&>[data-dsc-main]]:w-1/2 [&>[data-dsc-main]]:flex-[1_1_50%] [&>[data-dsc-side]]:w-1/2 [&>[data-dsc-side]]:flex-[1_1_50%]',
                below &&
                    'flex-col [&>[data-dsc-main]]:w-full [&>[data-dsc-side]]:block [&>[data-dsc-side]]:w-full [&>[data-dsc-side]]:flex-none',
                className
            )
        }
    });
}
