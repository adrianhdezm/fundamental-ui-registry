/*
 * Port of @fundamental-ngx/core (content-density) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { createContext, useContext } from 'react';

export type ContentDensityMode = 'cozy' | 'compact' | 'condensed';

export interface ContentDensityOptions {
    /** Explicit density; wins over the shorthands. An empty value sets none. */
    density?: ContentDensityMode | '' | null;
    /** Shorthand for compact density. */
    compact?: boolean;
    /** Shorthand for cozy density (resets an inherited compact density). */
    cozy?: boolean;
    /** Shorthand for condensed density (tables and lists). */
    condensed?: boolean;
}

/** The density of the options: the explicit one, else compact, condensed or cozy, else none (`null`). */
export function resolveContentDensity({
    density,
    compact = false,
    cozy = false,
    condensed = false
}: ContentDensityOptions): ContentDensityMode | null {
    if (density) return density;
    if (compact) return 'compact';
    if (condensed) return 'condensed';
    if (cozy) return 'cozy';
    return null;
}

/**
 * The props that set a density on an element of your own: `data-density`, or nothing when no density is given.
 *
 * ```tsx
 * <section {...contentDensityProps({ compact: true })}>…</section>
 * ```
 */
export function contentDensityProps(options: ContentDensityOptions): { 'data-density'?: ContentDensityMode } {
    const density = resolveContentDensity(options);
    return density ? { 'data-density': density } : {};
}

const ContentDensityContext = createContext<ContentDensityMode | null>(null);

/**
 * The density set by the nearest `ContentDensity` above (or `null`), e.g. to carry it into a portal, which leaves
 * the DOM subtree that `data-density` applies to: `<div data-density={useContentDensity() ?? undefined}>`.
 */
export function useContentDensity(): ContentDensityMode | null {
    return useContext(ContentDensityContext);
}

export interface ContentDensityProps extends useRender.ComponentProps<'div'>, ContentDensityOptions {}

/**
 * Sets the content density for an element and everything inside it (Angular's `fdContentDensity`, `fdCompact`,
 * `fdCozy` and `fdCondensed`). It writes `data-density`, which components read through the Tailwind `compact:` and
 * `condensed:` variants, so density is pure CSS and the nearest `data-density` wins. Renders a `<div>`; `render`
 * renders another element. `data-density` on `<html>` is the global density.
 *
 * ```tsx
 * <ContentDensity compact render={<section />}>…</ContentDensity>
 * <ContentDensity density="condensed">…</ContentDensity>
 * ```
 */
export function ContentDensity({ density, compact, cozy, condensed, render, children, ...props }: ContentDensityProps) {
    const parent = useContext(ContentDensityContext);
    const own = resolveContentDensity({ density, compact, cozy, condensed });
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-density': own ?? undefined,
            children: <ContentDensityContext.Provider value={own ?? parent}>{children}</ContentDensityContext.Provider>
        }
    });
}
