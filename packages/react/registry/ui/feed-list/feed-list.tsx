/*
 * Port of @fundamental-ngx/core (feed-list-item) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { createContext, use, useMemo, useState, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FormattedText } from '@/ui/formatted-text/formatted-text';
import { Link } from '@/ui/link/link';

interface FeedListContextValue {
    mobile: boolean;
    borderLess: boolean;
}

const FeedListContext = createContext<FeedListContextValue | null>(null);
/** Whether the item around a part is in mobile mode. */
const FeedListItemMobileContext = createContext(false);

export interface FeedListProps extends ComponentProps<'div'> {
    /** Puts the author, footer and actions of every item in a header above the text. */
    mobile?: boolean;
    /** Stacks the items (default). */
    isGroup?: boolean;
    /** No borders between items. */
    borderLess?: boolean;
}

/**
 * Feed list: posts and comments with an author, a collapsible text, an avatar, actions and a footer. In mobile mode
 * the author, footer and actions go in a header above the text. The list is a `role="list"` of `FeedListItem`s; name
 * it with `aria-label`.
 *
 * ```tsx
 * <FeedList aria-label="Comments">
 *     <FeedListItem
 *         authorTitle="John Doe"
 *         text="Looks good to me."
 *         avatar={<FeedListAvatar><Avatar size="s" label="John Doe" /></FeedListAvatar>}
 *         footer={<FeedListFooter><FeedListFooterByline>Aug 20, 2020</FeedListFooterByline></FeedListFooter>}
 *     />
 * </FeedList>
 * ```
 */
export function FeedList({
    mobile = false,
    isGroup = true,
    borderLess = false,
    className,
    children,
    ...props
}: FeedListProps) {
    const context = useMemo(() => ({ mobile, borderLess }), [mobile, borderLess]);
    return (
        <FeedListContext.Provider value={context}>
            <div
                role="list"
                {...props}
                className={cn(
                    'm-0 box-border flex max-w-[40rem] bg-sap-list-background p-0 font-sap-font-family text-sap-font-size text-sap-text-color',
                    isGroup && 'flex-col',
                    className
                )}
            >
                {children}
            </div>
        </FeedListContext.Provider>
    );
}

/** The avatar of the author, e.g. an `Avatar` of size `s`. Pass it as the item's `avatar`. */
export function FeedListAvatar({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            {...props}
            className={cn(
                'm-0 me-3 box-border inline-flex h-12 max-w-12 shrink-0 grow-0 basis-12 items-center justify-center overflow-hidden p-0 [&_img]:size-full [&_img]:object-contain',
                className
            )}
        />
    );
}

/** Actions of a post, e.g. a menu button. Pass it as the item's `actions`. */
export function FeedListAction({ className, ...props }: ComponentProps<'div'>) {
    const mobile = use(FeedListItemMobileContext);
    return (
        <div
            {...props}
            className={cn(
                mobile
                    ? 'm-0 box-border block shrink-0 p-0 pb-1 ps-3'
                    : 'relative -end-4 -top-4 float-end m-2 box-border block p-0',
                className
            )}
        />
    );
}

/** The footer of a post: `FeedListFooterByline`s such as the date and a reply link. Pass it as the item's `footer`. */
export function FeedListFooter({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            {...props}
            className={cn(
                // links (e.g. Reply) take the size and line height of the byline
                'm-0 box-border flex p-0 pt-1.5 text-sap-font-small-size [&_a]:[font-size:inherit] [&_a]:[line-height:inherit]',
                className
            )}
        />
    );
}

export type FeedListFooterBylineProps = useRender.ComponentProps<'small'>;

/** A byline in the footer; bylines are separated by bullets. Renders a `<small>`; `render` renders another element. */
export function FeedListFooterByline({ render, className, ...props }: FeedListFooterBylineProps) {
    return useRender({
        render,
        defaultTagName: 'small',
        props: {
            ...props,
            className: cn(
                "[font-size:smaller] text-sap-content-label-color not-last:after:px-1 not-last:after:content-['•']",
                className
            )
        }
    });
}

/** Angular's URL sanitizer: schemes other than javascript:, and relative URLs, pass; others get an `unsafe:` prefix. */
const SAFE_URL = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
const safeUrl = (url: string) => (SAFE_URL.test(url) ? url : `unsafe:${url}`);

export interface FeedListItemProps extends Omit<ComponentProps<'div'>, 'children'> {
    /** Name of the author, before the text. */
    authorTitle?: string;
    /** Makes the author a link (opened in a new tab). */
    authorLink?: string | null;
    /** The text of the post; HTML with `isRichText`. */
    text?: string;
    /** Characters shown before the More link; 500, or 300 in mobile mode, by default. */
    maxChars?: number | null;
    /** The text is HTML, shown in full with `FormattedText`. */
    isRichText?: boolean;
    /** Puts the author, footer and actions in a header above the text (also set by the list). */
    mobile?: boolean;
    /** Text of the More link; `{count}` is the number of hidden characters. */
    moreLabel?: string;
    /** Text of the Less link. */
    lessLabel?: string;
    /** The avatar, a `FeedListAvatar`. */
    avatar?: ReactNode;
    /** The actions, a `FeedListAction`. */
    actions?: ReactNode;
    /** The footer, a `FeedListFooter`. */
    footer?: ReactNode;
}

/**
 * A post of a feed list: the author (a link with `authorLink`), and a text collapsed to `maxChars` characters (500, or
 * 300 in mobile mode) with a More/Less link, or rich text. The `avatar`, `actions` and `footer` go beside, above or
 * below the text, or in a header in mobile mode.
 */
export function FeedListItem({
    authorTitle = '',
    authorLink,
    text = '',
    maxChars,
    isRichText = false,
    mobile = false,
    moreLabel = '{count} more',
    lessLabel = 'Less',
    avatar,
    actions,
    footer,
    className,
    ...props
}: FeedListItemProps) {
    const list = use(FeedListContext);
    const isMobile = mobile || !!list?.mobile;
    // the text that was expanded; a new text starts collapsed again
    const [expanded, setExpanded] = useState<string | null>(null);
    const collapsed = expanded !== text;
    const limit = maxChars || (isMobile ? 300 : 500);
    const hasMore = !isRichText && text.length > limit;
    const shownText = hasMore && collapsed ? `${text.substring(0, limit)}...` : text;
    const borderless = !!list?.borderLess;

    // the colon and the space come from CSS
    const author = (
        <span className="m-0 me-1 p-0 font-bold after:content-[':']">
            {authorLink ? (
                <Link
                    emphasized
                    target="_blank"
                    className="inline-block max-w-3/4 truncate align-top font-normal"
                    href={safeUrl(authorLink)}
                    title={authorTitle}
                >
                    {authorTitle}
                </Link>
            ) : (
                <span>{authorTitle}</span>
            )}
        </span>
    );

    return (
        <FeedListItemMobileContext.Provider value={isMobile}>
            <div
                role="listitem"
                {...props}
                className={cn(
                    'm-0 box-border p-4',
                    isMobile ? 'block' : 'flex',
                    borderless
                        ? 'pt-4 pb-3 [&+&]:pt-3 last:pb-4'
                        : '[&+&]:border-0 [&+&]:border-t [&+&]:border-solid [&+&]:border-sap-list-border-color [&+&]:last:border-b',
                    className
                )}
            >
                {isMobile ? (
                    <div className="m-0 box-border flex justify-between p-0">
                        <div className="m-0 box-border flex p-0">
                            {avatar}
                            <div>
                                {author}
                                {footer}
                            </div>
                        </div>
                        {actions}
                    </div>
                ) : (
                    avatar
                )}
                <div className="m-0 box-border min-w-0 flex-1 p-0">
                    {!isMobile && actions}
                    <p className={isMobile ? 'm-0 p-0 pt-2.5' : 'm-0 p-0'}>
                        {!isMobile && author}
                        {isRichText ? (
                            // a span: a block inside the paragraph, as Angular's fd-formatted-text
                            <FormattedText htmlText={text} render={<span />} />
                        ) : (
                            <>
                                <span>{shownText}</span>
                                {hasMore && (
                                    <Link
                                        href="#"
                                        className="ms-1 cursor-pointer"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setExpanded(collapsed ? text : null);
                                        }}
                                    >
                                        {collapsed ? moreLabel.replace('{count}', `${text.length - limit}`) : lessLabel}
                                    </Link>
                                )}
                            </>
                        )}
                    </p>
                    {!isMobile && footer}
                </div>
            </div>
        </FeedListItemMobileContext.Provider>
    );
}
