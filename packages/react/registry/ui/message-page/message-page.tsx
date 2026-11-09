/*
 * Port of fundamental-react (MessagePage) and @fundamental-ngx/core (message-page) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { Children, isValidElement, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconFont } from '@/ui/icon/icon';

export type MessagePageType = '' | 'filter' | 'search' | 'no-items' | 'error';

const GLYPH: Record<MessagePageType, string> = {
    '': 'documents',
    filter: 'filter',
    search: 'search',
    'no-items': 'product',
    error: 'document'
};

const has = (node: ReactNode) => node != null && node !== false && node !== '';

/**
 * Sorts the children whose component is one of `order` into that order, as the Angular template projects its slots.
 * Only direct children are known; other children (text, elements, wrapper components that render a part) keep their
 * place, so a part inside a wrapper is never moved behind the others.
 */
function slots(children: ReactNode, order: ElementType[]): ReactNode[] {
    const items = Children.toArray(children);
    const rank = (child: ReactNode) => (isValidElement(child) ? order.indexOf(child.type as ElementType) : -1);
    // a stable sort: parts of the same kind keep their order
    const known = items.filter((child) => rank(child) !== -1).sort((a, b) => rank(a) - rank(b));
    return items.map((child) => (rank(child) === -1 ? child : known.shift()));
}

export type MessagePageTitleProps = useRender.ComponentProps<'div'>;

/** Title of the message page, centred in the header 2 size (Angular's `fd-message-page-title`). */
export function MessagePageTitle({ render, className, ...props }: MessagePageTitleProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 mt-8 mb-2 box-border block max-w-[30rem] p-0 text-center text-sap-font-header2-size text-sap-group-title-text-color',
                className
            )
        }
    });
}

export type MessagePageSubtitleProps = useRender.ComponentProps<'div'>;

/** Subtitle under the title, in the header 5 size and the label colour (Angular's `fd-message-page-subtitle`). */
export function MessagePageSubtitle({ render, className, ...props }: MessagePageSubtitleProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            // start-aligned, as fundamental-styles: the column centres a short subtitle, a long one reads from the start
            className: cn(
                'm-0 mb-8 box-border block max-w-[30rem] p-0 text-sap-font-header5-size text-sap-content-label-color',
                className
            )
        }
    });
}

export type MessagePageActionsProps = useRender.ComponentProps<'div'>;

/** Actions after the subtitle, side by side and centred, e.g. buttons (Angular's `fd-message-page-actions`). */
export function MessagePageActions({ render, className, ...props }: MessagePageActionsProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex min-h-8 max-w-[30rem] flex-wrap items-center justify-center gap-2 p-0',
                className
            )
        }
    });
}

export type MessagePageMoreProps = useRender.ComponentProps<'div'>;

/** The "more" area after the actions, e.g. a details button or link (Angular's `fd-message-page-more`). */
export function MessagePageMore({ render, className, ...props }: MessagePageMoreProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn('m-0 mt-2 box-border flex min-h-8 max-w-[30rem] items-center justify-center p-0', className)
        }
    });
}

export interface MessagePageProps extends Omit<useRender.ComponentProps<'div'>, 'title'> {
    /** Kind of message; sets the icon: `filter`, `search`, `no-items`, `error`, or `''` (documents). */
    type?: MessagePageType | null;
    /** Shows the icon (or the `image`); default true. */
    hasIcon?: boolean;
    /** Icon instead of the one of the type. */
    glyph?: string | null;
    /** Icon font of the `glyph`. */
    glyphFont?: IconFont;
    /** Content in place of the icon, e.g. an illustration (fundamental-react's `image`). */
    image?: ReactNode;
    /** Title, rendered as a `MessagePageTitle` (fundamental-react's `title`). */
    title?: ReactNode;
    /** Subtitle, rendered as a `MessagePageSubtitle` (fundamental-react's `subtitle`). */
    subtitle?: ReactNode;
    /** Actions, rendered in a `MessagePageActions` (fundamental-react's `actions`). */
    actions?: ReactNode;
    /** Content of a `MessagePageMore` (fundamental-react's `more`). */
    more?: ReactNode;
}

/**
 * Message page: a full-page message when there is nothing to show, e.g. no search results or a missing page, with an
 * icon, a title, a subtitle and actions. The content is a polite live region (`role="status"`). The parts are placed
 * in the order title, subtitle, actions, more whatever the order of the children.
 *
 * ```tsx
 * <MessagePage type="search">
 *     <MessagePageTitle>No matching items found.</MessagePageTitle>
 *     <MessagePageSubtitle>Check the search term.</MessagePageSubtitle>
 * </MessagePage>
 * ```
 */
export function MessagePage({
    type,
    hasIcon = true,
    glyph,
    glyphFont = 'SAP-icons',
    image,
    title,
    subtitle,
    actions,
    more,
    render,
    className,
    children,
    ...props
}: MessagePageProps) {
    // the parts of the props go with the children, so they are sorted with them
    const content = slots(
        [
            has(title) && <MessagePageTitle>{title}</MessagePageTitle>,
            has(subtitle) && <MessagePageSubtitle>{subtitle}</MessagePageSubtitle>,
            has(actions) && <MessagePageActions>{actions}</MessagePageActions>,
            has(more) && <MessagePageMore>{more}</MessagePageMore>,
            children
        ],
        [MessagePageTitle, MessagePageSubtitle, MessagePageActions, MessagePageMore]
    );
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex size-full items-center justify-center bg-sap-background-color p-0',
                'font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color',
                className
            ),
            children: (
                <div className="m-0 box-border flex max-w-[30rem] flex-col items-center rounded-sap-element-border-corner-radius bg-sap-group-content-background p-4">
                    {hasIcon && (
                        <div className="m-0 box-border flex h-32 w-full items-center justify-center p-0">
                            {has(image) ? (
                                image
                            ) : (
                                // as wide as the glyph (not the icon's 1em box), as fundamental-styles
                                <Icon
                                    glyph={glyph || GLYPH[type ?? '']}
                                    font={glyphFont}
                                    color="non-interactive"
                                    className="w-auto max-w-[30rem] text-[6rem] leading-none opacity-50"
                                />
                            )}
                        </div>
                    )}
                    <div
                        role="status"
                        aria-live="polite"
                        className="m-0 box-border flex max-w-[30rem] flex-col items-center p-0 pb-8"
                    >
                        {content}
                    </div>
                </div>
            )
        }
    });
}
