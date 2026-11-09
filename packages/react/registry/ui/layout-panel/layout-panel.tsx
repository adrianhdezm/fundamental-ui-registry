/*
 * Port of fundamental-react (LayoutPanel) and @fundamental-ngx/core (layout-panel) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { Children, isValidElement, useId, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const BORDER = 'border-solid border-sap-group-title-border-color';

/**
 * Sorts the children whose component is one of `order` into that order, as the Angular templates project their
 * slots. Only direct children are known; other children (text, elements, wrapper components that render a part)
 * keep their place, so a part inside a wrapper is never moved behind the others.
 */
function slots(children: ReactNode, order: ElementType[]): ReactNode[] {
    const items = Children.toArray(children);
    const rank = (child: ReactNode) => (isValidElement(child) ? order.indexOf(child.type as ElementType) : -1);
    // a stable sort: parts of the same kind keep their order
    const known = items.filter((child) => rank(child) !== -1).sort((a, b) => rank(a) - rank(b));
    return items.map((child) => (rank(child) === -1 ? child : known.shift()));
}

export type LayoutPanelHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface LayoutPanelTitleProps extends useRender.ComponentProps<'h3'> {
    /** Heading level: renders `<h1>`…`<h6>`; default 3. The size is the group title size whatever the level. */
    level?: LayoutPanelHeadingLevel;
}

/** Title of a layout panel: a heading with the group title typography (Angular's `fd-layout-panel-title`). */
export function LayoutPanelTitle({ level = 3, render, className, ...props }: LayoutPanelTitleProps) {
    return useRender({
        render,
        defaultTagName: `h${level}` as const,
        props: {
            ...props,
            className: cn(
                'm-0 flex-1 p-0 font-sap-font-header-family text-sap-group-title-font-size leading-[normal] font-normal text-sap-group-title-text-color',
                className
            )
        }
    });
}

export type LayoutPanelDescriptionProps = useRender.ComponentProps<'p'>;

/** Description under the title, in the label colour. */
export function LayoutPanelDescription({ render, className, ...props }: LayoutPanelDescriptionProps) {
    return useRender({
        render,
        defaultTagName: 'p',
        props: { ...props, className: cn('m-0 mt-1 p-0 text-sap-content-label-color', className) }
    });
}

export interface LayoutPanelHeadProps extends Omit<useRender.ComponentProps<'div'>, 'title'> {
    /** Title, rendered as a `LayoutPanelTitle` before the children (fundamental-react's `title`). */
    title?: ReactNode;
    /** Description, rendered as a `LayoutPanelDescription` after the title (fundamental-react's `description`). */
    description?: ReactNode;
    /** Heading level of the `title`; default 3 (fundamental-react's `headingLevel`). */
    headingLevel?: LayoutPanelHeadingLevel;
}

/** Holds the title and description at the start of the header. */
export function LayoutPanelHead({
    title,
    description,
    headingLevel = 3,
    render,
    className,
    children,
    ...props
}: LayoutPanelHeadProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn('m-0 block min-w-0 p-0 break-words', className),
            children: (
                <>
                    {title != null && title !== false && (
                        <LayoutPanelTitle level={headingLevel}>{title}</LayoutPanelTitle>
                    )}
                    {description != null && description !== false && (
                        <LayoutPanelDescription>{description}</LayoutPanelDescription>
                    )}
                    {children}
                </>
            )
        }
    });
}

export type LayoutPanelActionsProps = useRender.ComponentProps<'div'>;

/** Actions at the end of the header, e.g. buttons. */
export function LayoutPanelActions({ render, className, ...props }: LayoutPanelActionsProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 flex shrink-0 items-center gap-2 p-0 text-sap-font-small-size leading-[normal] text-sap-neutral-text-color',
                className
            )
        }
    });
}

export type LayoutPanelHeaderProps = useRender.ComponentProps<'div'>;

/** Header of the panel: the head first and the actions at the end, whatever the order of the children. */
export function LayoutPanelHeader({ render, className, children, ...props }: LayoutPanelHeaderProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                `m-0 box-border flex min-h-10 flex-wrap items-center justify-between gap-2 border-0 border-b p-4 ${BORDER}`,
                className
            ),
            children: slots(children, [LayoutPanelHead, LayoutPanelActions])
        }
    });
}

export type LayoutPanelFiltersProps = useRender.ComponentProps<'div'>;

/** Filters between the header and the body. */
export function LayoutPanelFilters({ render, className, ...props }: LayoutPanelFiltersProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                `m-0 box-border block border-0 border-b px-4 py-2 transition-all duration-150 ease-in ${BORDER}`,
                className
            )
        }
    });
}

export interface LayoutPanelBodyProps extends useRender.ComponentProps<'div'> {
    /** Content reaches the panel edges (no padding), e.g. a table or an image. */
    bleed?: boolean;
}

/** Body of the panel; its first and last children lose their outer margins. */
export function LayoutPanelBody({ bleed = false, render, className, ...props }: LayoutPanelBodyProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border block h-full p-4 [&>:first-child]:mt-0 [&>:last-child]:mb-0',
                bleed && 'p-0',
                className
            )
        }
    });
}

export interface LayoutPanelFooterProps extends useRender.ComponentProps<'div'> {
    /** Aligns the content at the start or the end; centred by default. */
    position?: 'start' | 'end' | null;
}

/** Footer of the panel. */
export function LayoutPanelFooter({ position, render, className, ...props }: LayoutPanelFooterProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                `m-0 box-border flex items-center justify-center gap-2 border-0 border-t px-4 py-2 ${BORDER}`,
                position === 'start' && 'justify-start',
                position === 'end' && 'justify-end',
                className
            )
        }
    });
}

export interface LayoutPanelProps extends useRender.ComponentProps<'div'> {
    /** Removes the background colour, e.g. on a coloured page. */
    transparent?: boolean;
    /** URL of a background image, covering the panel. */
    backgroundImage?: string | null;
}

/**
 * Layout panel: a rounded content container with a header (title, description, actions), filters, body and footer.
 * The parts are placed in that order whatever the order of the children.
 *
 * ```tsx
 * <LayoutPanel>
 *     <LayoutPanelHeader>
 *         <LayoutPanelHead title="Sales" description="Per quarter" />
 *         <LayoutPanelActions><Button label="Edit" /></LayoutPanelActions>
 *     </LayoutPanelHeader>
 *     <LayoutPanelBody>...</LayoutPanelBody>
 * </LayoutPanel>
 * ```
 */
export function LayoutPanel({
    transparent = false,
    backgroundImage,
    id,
    render,
    className,
    style,
    children,
    ...props
}: LayoutPanelProps) {
    const autoId = `fd-layout-panel-${useId()}`;
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            id: id ?? autoId,
            ...props,
            style: backgroundImage ? { backgroundImage: `url("${backgroundImage}")`, ...style } : style,
            className: cn(
                'm-0 box-border block overflow-hidden rounded-2xl border-0 p-0 font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-text-color',
                'bg-cover bg-center',
                transparent ? 'bg-transparent' : 'bg-sap-group-content-background',
                className
            ),
            children: slots(children, [LayoutPanelHeader, LayoutPanelFilters, LayoutPanelBody, LayoutPanelFooter])
        }
    });
}
