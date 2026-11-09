/*
 * Port of fundamental-react (LayoutGrid) and @fundamental-ngx/core (layout-grid) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { Children, isValidElement, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Span of 1-12 columns (or an offset of 0-12). */
export type LayoutGridSpan = number | null | undefined;

const valid = (n: LayoutGridSpan) => (n != null && Number.isInteger(n) && n >= 1 && n <= 12 ? n : undefined);
const validOffset = (n: LayoutGridSpan) => (n != null && Number.isInteger(n) && n >= 0 && n <= 12 ? n : undefined);

export type LayoutGridRowProps = useRender.ComponentProps<'div'>;

/**
 * A row of columns. The grid adds one around its children when it has no explicit rows; use rows to start a new
 * line of columns, or inside a column to nest columns.
 */
export function LayoutGridRow({ render, className, ...props }: LayoutGridRowProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            'data-fd-row': '',
            ...props,
            className: cn('relative m-0 box-border flex min-w-full flex-[0_0_100%] flex-wrap p-0', className)
        }
    });
}

export interface LayoutGridColProps extends useRender.ComponentProps<'div'> {
    /** Columns (1-12) spanned below 600px; default 12. Angular's `fdLayoutGridCol`. */
    span?: LayoutGridSpan;
    /** Columns spanned from 600px on; default `span`. */
    colMd?: LayoutGridSpan;
    /** Columns spanned from 1024px on; default `colMd`. */
    colLg?: LayoutGridSpan;
    /** Columns spanned from 1440px on; default `colLg`. */
    colXl?: LayoutGridSpan;
    /** Columns (0-12) of offset below 600px; default 0. */
    colOffset?: LayoutGridSpan;
    /** Offset from 600px on; default `colOffset`. */
    colOffsetMd?: LayoutGridSpan;
    /** Offset from 1024px on; default `colOffsetMd`. */
    colOffsetLg?: LayoutGridSpan;
    /** Offset from 1440px on; default `colOffsetLg`. */
    colOffsetXl?: LayoutGridSpan;
    /** Whether the offset is left before (the default) or after the column. */
    offsetPosition?: 'before' | 'after';
    /** Takes the remaining space of the row instead of a fixed span (fundamental-react's `full`). */
    colGrow?: boolean;
}

/**
 * A column spanning 1-12 of 12 columns, optionally different from 600px (md), 1024px (lg) and 1440px (xl) on.
 * Smaller breakpoints apply upwards until overridden.
 */
export function LayoutGridCol({
    span,
    colMd,
    colLg,
    colXl,
    colOffset,
    colOffsetMd,
    colOffsetLg,
    colOffsetXl,
    offsetPosition = 'before',
    colGrow = false,
    render,
    className,
    style,
    ...props
}: LayoutGridColProps) {
    // spans and offsets per breakpoint, inherited upwards; set on every column so nested grids do not inherit them
    const base = valid(span) ?? 12;
    const md = valid(colMd) ?? base;
    const lg = valid(colLg) ?? md;
    const xl = valid(colXl) ?? lg;
    const off = validOffset(colOffset) ?? 0;
    const offMd = validOffset(colOffsetMd) ?? off;
    const offLg = validOffset(colOffsetLg) ?? offMd;
    const offXl = validOffset(colOffsetXl) ?? offLg;
    const vars = {
        '--fd-col': base,
        '--fd-col-md': md,
        '--fd-col-lg': lg,
        '--fd-col-xl': xl,
        '--fd-off': off,
        '--fd-off-md': offMd,
        '--fd-off-lg': offLg,
        '--fd-off-xl': offXl
    } as CSSProperties;

    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            'data-fd-col': '',
            ...props,
            style: { ...vars, ...style },
            className: cn(
                'm-0 box-border px-1 py-0 min-[600px]:px-2',
                offsetPosition === 'after'
                    ? 'me-[calc(var(--fd-off)*100%/12)] min-[600px]:me-[calc(var(--fd-off-md)*100%/12)] min-[1024px]:me-[calc(var(--fd-off-lg)*100%/12)] min-[1440px]:me-[calc(var(--fd-off-xl)*100%/12)]'
                    : 'ms-[calc(var(--fd-off)*100%/12)] min-[600px]:ms-[calc(var(--fd-off-md)*100%/12)] min-[1024px]:ms-[calc(var(--fd-off-lg)*100%/12)] min-[1440px]:ms-[calc(var(--fd-off-xl)*100%/12)]',
                colGrow
                    ? 'min-w-[calc(100%/12)] max-w-none flex-1'
                    : 'min-w-[calc(var(--fd-col)*100%/12)] max-w-[calc(var(--fd-col)*100%/12)]',
                // a growing column keeps growing unless a larger breakpoint sets a span
                (!colGrow || valid(colMd)) &&
                    'min-[600px]:min-w-[calc(var(--fd-col-md)*100%/12)] min-[600px]:max-w-[calc(var(--fd-col-md)*100%/12)]',
                (!colGrow || valid(colLg)) &&
                    'min-[1024px]:min-w-[calc(var(--fd-col-lg)*100%/12)] min-[1024px]:max-w-[calc(var(--fd-col-lg)*100%/12)]',
                (!colGrow || valid(colXl)) &&
                    'min-[1440px]:min-w-[calc(var(--fd-col-xl)*100%/12)] min-[1440px]:max-w-[calc(var(--fd-col-xl)*100%/12)]',
                className
            )
        }
    });
}

export interface LayoutGridProps extends useRender.ComponentProps<'div'> {
    /** Removes the gutters between the columns, inline and block. */
    noGap?: boolean;
    /** Removes only the inline gutters. */
    noHorizontalGap?: boolean;
    /** Removes only the block gutters. */
    noVerticalGap?: boolean;
}

/** Whether the children hold explicit rows; otherwise the grid wraps them in one. */
const hasRows = (children: ReactNode) =>
    Children.toArray(children).some((child) => isValidElement(child) && child.type === LayoutGridRow);

/**
 * Layout grid: a responsive 12-column grid with gutters of 0.25rem, and 0.5rem from 600px on.
 *
 * ```tsx
 * <LayoutGrid>
 *     <LayoutGridCol span={12} colMd={6} colLg={4}>...</LayoutGridCol>
 *     <LayoutGridCol span={12} colMd={6} colLg={8}>...</LayoutGridCol>
 * </LayoutGrid>
 * ```
 */
export function LayoutGrid({
    noGap = false,
    noHorizontalGap = false,
    noVerticalGap = false,
    render,
    className,
    children,
    ...props
}: LayoutGridProps) {
    const horizontal = !noGap && !noHorizontalGap;
    const vertical = !noGap && !noVerticalGap;
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'relative m-0 box-border flex flex-[0_0_100%] flex-wrap px-1 py-0 min-[600px]:px-2',
                'font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-text-color',
                horizontal
                    ? [
                          '[&_[data-fd-row]]:-mx-1 [&_[data-fd-row]]:min-w-[calc(100%_+_0.5rem)]',
                          'min-[600px]:[&_[data-fd-row]]:-mx-2 min-[600px]:[&_[data-fd-row]]:min-w-[calc(100%_+_1rem)]'
                      ]
                    : '[&_[data-fd-row]_[data-fd-col]]:px-0',
                vertical && '[&>[data-fd-row]>[data-fd-col]]:py-1 min-[600px]:[&>[data-fd-row]>[data-fd-col]]:py-2',
                className
            ),
            children: hasRows(children) ? children : <LayoutGridRow>{children}</LayoutGridRow>
        }
    });
}
