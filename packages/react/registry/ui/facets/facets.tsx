/*
 * Port of @fundamental-ngx/core (facets) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { createContext, useContext, useId, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FacetType = 'form' | 'key-value' | 'image' | 'rating-indicator' | 'custom';

/** The type of the enclosing facet, for its content rows. */
const FacetTypeContext = createContext<FacetType | null>(null);

/**
 * Group of facets in an object page header: facets wrap and keep their spacing. A `group` named by `aria-label`.
 *
 * ```tsx
 * <FacetGroup aria-label="Product facets">
 *     <Facet type="key-value" facetTitle="Status">
 *         <ObjectStatus status="positive" label="Delivery" large />
 *     </Facet>
 * </FacetGroup>
 * ```
 */
export function FacetGroup({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            role="group"
            {...props}
            className={cn(
                'm-0 box-border flex flex-wrap items-start gap-8 p-0 font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color',
                className
            )}
        />
    );
}

export interface FacetProps extends ComponentProps<'div'> {
    /** What the facet shows; sets its layout. Image facets come first in the group and have no title. */
    type?: FacetType;
    /** Title above the content; the facet (a `group`) is labelled by it. Not shown for image facets. */
    facetTitle?: ReactNode;
    /** Text below the title of a rating facet, e.g. the number of reviews. */
    subtitle?: ReactNode;
    /** Makes the title a heading of this level. */
    headingLevel?: number | string | null;
    /** Pushes the facet to the end of the group. */
    alignEnd?: boolean;
}

/**
 * A facet: a titled block of key information (form rows, a key value, a rating or an image).
 *
 * ```tsx
 * <Facet type="form" facetTitle="Technical data" headingLevel={3}>
 *     <FacetContent>
 *         <FormLabel colon htmlFor="unit">Base unit</FormLabel>
 *         <Text id="unit">Each</Text>
 *     </FacetContent>
 * </Facet>
 * ```
 */
export function Facet({
    type = 'custom',
    facetTitle,
    subtitle,
    headingLevel,
    alignEnd = false,
    id: idProp,
    className,
    children,
    ...props
}: FacetProps) {
    const autoId = useId();
    const id = idProp ?? `fd-facet-${autoId}`;
    const titleId = `fd-facet-title-${autoId}`;
    const hasTitle = type !== 'image' && facetTitle != null && facetTitle !== '' && facetTitle !== false;
    const hasSubtitle = type === 'rating-indicator' && subtitle != null && subtitle !== '' && subtitle !== false;
    const level = parseLevel(headingLevel);
    return (
        <FacetTypeContext.Provider value={type}>
            <div
                role={type !== 'image' ? 'group' : undefined}
                aria-labelledby={hasTitle ? titleId : undefined}
                {...props}
                id={id}
                className={cn(
                    'm-0 box-border block p-0 font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color',
                    alignEnd ? 'order-1 ms-8 flex flex-1 flex-col items-end' : 'me-8',
                    type !== 'image' && 'mb-4',
                    type === 'image' && '-order-1 flex',
                    type === 'form' && 'flex flex-col',
                    // large object statuses use the regular font, not the light one
                    type === 'key-value' && '[&_[class~="group/os"]]:font-sap-font-family',
                    type === 'rating-indicator' && [
                        'inline-flex flex-col items-start justify-start',
                        // a rating indicator stacks its stars and the dynamic text, which sits at the end
                        '[&_[data-slot=rating-indicator]]:my-0 [&_[data-slot=rating-indicator]]:flex-col [&_[data-slot=rating-indicator]]:items-start',
                        '[&_[data-slot=rating-indicator]>span]:self-end'
                    ],
                    className
                )}
            >
                {hasTitle && (
                    <div
                        id={titleId}
                        role={level ? 'heading' : undefined}
                        aria-level={level}
                        className={cn(
                            'm-0 mb-4 truncate p-0 font-sap-font-family text-sap-font-large-size leading-[normal] font-normal text-sap-title-color',
                            hasSubtitle && 'mb-0'
                        )}
                    >
                        {facetTitle}
                    </div>
                )}
                {hasSubtitle && (
                    <span className="m-0 mb-4 p-0 text-sap-font-small-size leading-[normal] text-sap-content-label-color">
                        {subtitle}
                    </span>
                )}
                {children}
            </div>
        </FacetTypeContext.Provider>
    );
}

/** Angular's `headingLevel` takes a number or a tag name such as `'h3'`. */
function parseLevel(level: number | string | null | undefined): number | undefined {
    if (level === null || level === undefined || level === '') return undefined;
    const n = Number(String(level).replace(/\D/g, ''));
    return n > 0 ? n : undefined;
}

/**
 * A row of a form facet (label and value, or an icon and a link), or the content of a rating facet. Renders a
 * `<div>`; `render` renders another element.
 */
export function FacetContent({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    const type = useContext(FacetTypeContext);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex p-0',
                type === 'form' && 'not-last:mb-2 [&>[data-glyph]]:me-2',
                type === 'rating-indicator' && 'flex-col',
                className
            )
        }
    });
}

/** Value of a form facet row. Renders a `<span>`; `render` renders another element. */
export function FacetFormValue({ render, className, ...props }: useRender.ComponentProps<'span'>) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            className: cn(
                'm-0 p-0 font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-group-title-text-color',
                className
            )
        }
    });
}

export interface FacetContainerProps extends ComponentProps<'div'> {
    flexDirection?: CSSProperties['flexDirection'];
    alignItems?: CSSProperties['alignItems'];
    justifyContent?: CSSProperties['justifyContent'];
    /** Gap in rem. */
    flexGap?: number;
}

/** Flex container for laying out facets or facet content (a column by default, `flexDirection="row"` for a row). */
export function FacetContainer({
    flexDirection = 'column',
    alignItems = 'start',
    justifyContent = 'start',
    flexGap = 1,
    style,
    className,
    ...props
}: FacetContainerProps) {
    return (
        <div
            {...props}
            style={{ gap: `${flexGap}rem`, flexDirection, alignItems, justifyContent, ...style }}
            className={cn('flex', className)}
        />
    );
}
