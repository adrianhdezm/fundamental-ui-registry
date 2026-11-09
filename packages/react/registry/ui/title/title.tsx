/*
 * Port of fundamental-react (Title) and @fundamental-ngx/core (title) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { createContext, isValidElement, useContext } from 'react';
import { cn } from '@/lib/utils';

export type HeaderSize = 1 | 2 | 3 | 4 | 5 | 6;

/** Default visual size for the titles inside a component (e.g. dialogs use 5). An explicit `headerSize` wins. */
export const TitleSizeContext = createContext<HeaderSize | null>(null);

const SIZE: Record<HeaderSize, string> = {
    1: 'text-sap-font-header1-size',
    2: 'text-sap-font-header2-size',
    3: 'text-sap-font-header3-size',
    4: 'text-sap-font-header4-size',
    5: 'text-sap-font-header5-size',
    6: 'text-sap-font-header6-size'
};

export interface TitleProps extends useRender.ComponentProps<'h2'> {
    /** Heading level: renders `<h1>`…`<h6>` and sets the visual size unless `headerSize` is given. */
    level?: HeaderSize;
    /** Visual size, independent of the heading level (fundamental-react's `levelStyle`). */
    headerSize?: HeaderSize | null;
    /** Wraps long titles instead of truncating them. */
    wrap?: boolean;
    /** Clamps to two lines. */
    twoLineClamp?: boolean;
}

/**
 * Title: a heading with the SAP header typography. The visual size follows the heading level unless `headerSize`
 * decouples them, so the document outline stays semantic.
 *
 * ```tsx
 * <Title level={2}>Section</Title>
 * <Title level={1} headerSize={4}>Page title styled smaller</Title>
 * ```
 */
export function Title({
    level,
    headerSize,
    wrap = false,
    twoLineClamp = false,
    render,
    className,
    ...props
}: TitleProps) {
    const defaultSize = useContext(TitleSizeContext);
    const renderedTag = isValidElement(render) && typeof render.type === 'string' ? render.type : null;
    const tagLevel = level ?? (renderedTag && /^h[1-6]$/.test(renderedTag) ? Number(renderedTag[1]) : null);
    const size = (headerSize ?? defaultSize ?? tagLevel ?? 5) as HeaderSize;
    return useRender({
        render,
        defaultTagName: level ? (`h${level}` as const) : 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border p-0 truncate font-sap-font-header-family font-normal text-sap-text-color',
                SIZE[size],
                // after the size: tailwind-merge drops a line-height that comes before a font size
                'leading-[normal]',
                wrap && 'overflow-auto whitespace-normal text-clip',
                twoLineClamp && 'line-clamp-2 whitespace-normal',
                className
            )
        }
    });
}
