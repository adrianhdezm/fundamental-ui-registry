/*
 * Port of fundamental-react (Tile) and @fundamental-ngx/core (tile) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { iconGlyphChar, iconVariants, type IconFont } from '@/ui/icon/icon';
import { useTile } from './tile';

export type NumericContentState = 'negative' | 'critical' | 'positive' | 'informative' | 'neutral';
export type NumericContentSize = 's' | 'm' | 'l';

const STATE_COLOR: Record<NumericContentState, string> = {
    neutral: 'text-sap-neutral-text-color',
    positive: 'text-sap-positive-text-color',
    critical: 'text-sap-critical-text-color',
    negative: 'text-sap-negative-text-color',
    informative: 'text-sap-informative-text-color'
};

interface NumericContentContextValue {
    size: NumericContentSize;
    /** Inside a small tile. */
    smallTile: boolean;
}

const NumericContentContext = createContext<NumericContentContextValue | null>(null);

export interface NumericContentProps extends useRender.ComponentProps<'div'> {
    /** l (default), m or s. In a small tile the height is the small tile's whatever the size. */
    size?: NumericContentSize | null;
}

/**
 * Numeric content of a KPI or launch tile: launch icon, KPI value and scale.
 *
 * ```tsx
 * <NumericContent>
 *     <NumericContentKpiContainer><NumericContentKpi state="positive">12</NumericContentKpi></NumericContentKpiContainer>
 *     <NumericContentScaleContainer>
 *         <NumericContentScale state="positive">
 *             <NumericContentScaleArrow glyph="up" />
 *             <NumericContentScaleText>M</NumericContentScaleText>
 *         </NumericContentScale>
 *     </NumericContentScaleContainer>
 * </NumericContent>
 * ```
 */
export function NumericContent({ size, render, className, children, ...props }: NumericContentProps) {
    const smallTile = !!useTile()?.small;
    const resolved = size ?? 'l';
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex w-full p-0 font-sap-font-family',
                smallTile ? 'h-[2.375rem]' : { l: 'h-12', m: 'h-10', s: 'h-9' }[resolved],
                className
            ),
            children: <NumericContentContext value={{ size: resolved, smallTile }}>{children}</NumericContentContext>
        }
    });
}

/** Spacing shared by the launch icon and KPI containers. */
function containerClass(content: NumericContentContextValue | null): string {
    const size = content?.size ?? 'l';
    return cn(
        'm-0 box-border flex h-full items-center overflow-hidden p-0 [&:first-child:last-child]:m-0',
        content?.smallTile ? 'me-1.5 pt-2' : size === 'l' ? 'me-1.5 pt-0.5' : 'me-2 pt-0'
    );
}

export type NumericContentLaunchIconContainerProps = useRender.ComponentProps<'div'>;

/** Holds the launch icon. */
export function NumericContentLaunchIconContainer({
    render,
    className,
    ...props
}: NumericContentLaunchIconContainerProps) {
    const content = useContext(NumericContentContext);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                containerClass(content),
                content?.smallTile ? 'w-6 max-w-6 min-w-6' : 'w-7 max-w-7 min-w-7',
                content?.size === 'm' && 'items-end',
                className
            )
        }
    });
}

export type NumericContentKpiContainerProps = useRender.ComponentProps<'div'>;

/** Holds the KPI value. */
export function NumericContentKpiContainer({ render, className, ...props }: NumericContentKpiContainerProps) {
    const content = useContext(NumericContentContext);
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, className: cn(containerClass(content), className) }
    });
}

export type NumericContentScaleContainerProps = useRender.ComponentProps<'div'>;

/** Holds the scale. */
export function NumericContentScaleContainer({ render, className, ...props }: NumericContentScaleContainerProps) {
    const content = useContext(NumericContentContext);
    const size = content?.size ?? 'l';
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex h-full overflow-hidden p-0 [&:first-child:last-child]:m-0',
                content?.smallTile
                    ? size === 's'
                        ? 'pt-0 pb-1'
                        : 'py-1'
                    : { l: 'pt-2 pb-1.5', m: 'pt-1.5 pb-[0.188rem]', s: 'pt-0 pb-[0.313rem]' }[size],
                className
            )
        }
    });
}

export interface NumericContentLaunchIconProps extends Omit<useRender.ComponentProps<'span'>, 'children'> {
    glyph?: string | null;
    glyphFont?: IconFont;
}

/** Launch icon of a launch tile. Decorative unless it has an `aria-label` (then `role="img"`). */
export function NumericContentLaunchIcon({
    glyph,
    glyphFont = 'SAP-icons',
    render,
    className,
    ...props
}: NumericContentLaunchIconProps) {
    const content = useContext(NumericContentContext);
    const label = props['aria-label'];
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            role: label ? 'img' : 'presentation',
            'aria-hidden': label ? undefined : true,
            ...props,
            'data-glyph': iconGlyphChar(glyph, glyphFont) || undefined,
            className: cn(
                iconVariants({ font: glyphFont }),
                'text-sap-tile-icon-color',
                content?.smallTile ? 'text-[1.5rem] leading-[normal]' : 'text-[1.75rem] leading-[normal]',
                className
            )
        }
    });
}

export interface NumericContentKpiProps extends useRender.ComponentProps<'div'> {
    /** Semantic colour of the value; neutral by default. */
    state?: NumericContentState | null;
    /** Shows an icon in the KPI style instead of a value. */
    glyph?: string | null;
    glyphFont?: IconFont;
}

/** KPI value; with a glyph it shows an icon in the KPI style instead. */
export function NumericContentKpi({
    state,
    glyph,
    glyphFont = 'SAP-icons',
    render,
    className,
    ...props
}: NumericContentKpiProps) {
    const content = useContext(NumericContentContext);
    const glyphChar = iconGlyphChar(glyph, glyphFont);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-glyph': glyphChar || undefined,
            className: cn(
                glyphChar && iconVariants({ font: glyphFont }),
                'm-0 p-0 font-sap-font-family font-thin',
                STATE_COLOR[state ?? 'neutral'],
                content?.smallTile
                    ? 'text-[1.5rem] leading-[normal] rtl:text-right rtl:[direction:ltr]'
                    : {
                          l: 'text-[2.25rem] leading-[normal]',
                          m: 'text-[2rem] leading-[normal]',
                          s: 'text-[1.75rem] leading-[normal]'
                      }[content?.size ?? 'l'],
                className
            )
        }
    });
}

export interface NumericContentScaleProps extends useRender.ComponentProps<'div'> {
    /** Semantic colour of the scale; neutral by default. */
    state?: NumericContentState | null;
}

/** Scale (unit and trend arrow) next to the KPI value. */
export function NumericContentScale({ state, render, className, ...props }: NumericContentScaleProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex flex-col items-center justify-between p-0',
                STATE_COLOR[state ?? 'neutral'],
                className
            )
        }
    });
}

export interface NumericContentScaleArrowProps extends Omit<useRender.ComponentProps<'span'>, 'children'> {
    glyph?: string | null;
    glyphFont?: IconFont;
}

/** Trend arrow of the scale. Decorative unless it has an `aria-label` (then `role="img"`). */
export function NumericContentScaleArrow({
    glyph,
    glyphFont = 'SAP-icons',
    render,
    className,
    ...props
}: NumericContentScaleArrowProps) {
    const label = props['aria-label'];
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            role: label ? 'img' : props.role,
            'aria-hidden': label ? undefined : true,
            'data-glyph': iconGlyphChar(glyph, glyphFont) || undefined,
            className: cn(iconVariants({ font: glyphFont }), 'text-[0.875rem] leading-[normal]', className)
        }
    });
}

export type NumericContentScaleTextProps = useRender.ComponentProps<'span'>;

/** Unit of the scale, e.g. "M" or "%". */
export function NumericContentScaleText({ render, className, ...props }: NumericContentScaleTextProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: { ...props, className: cn('m-0 p-0 text-[0.875rem] leading-[normal]', className) }
    });
}
