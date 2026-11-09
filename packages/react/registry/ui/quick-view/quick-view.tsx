/*
 * Port of @fundamental-ngx/core (quick-view) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    Children,
    Fragment,
    createContext,
    isValidElement,
    useContext,
    useId,
    useLayoutEffect,
    useState,
    type ComponentProps,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import { Bar, BarElement, BarLeft, BarMiddle, BarRight, type BarProps } from '@/ui/bar/bar';
import { FormGroup, FormGroupHeader, FormItem, FormLabel, type FormLabelProps } from '@/ui/form/form';
import { PopoverBodyHeader } from '@/ui/popover/popover';
import { Title, type HeaderSize, type TitleProps } from '@/ui/title/title';

/** Children of `type`, and the others, in their order; fragments are looked into. */
function partition(children: ReactNode, types: unknown[]): [ReactNode[], ReactNode[]] {
    const matched: ReactNode[] = [];
    const rest: ReactNode[] = [];
    const walk = (nodes: ReactNode) => {
        for (const child of Children.toArray(nodes)) {
            if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
                walk(child.props.children);
            } else if (isValidElement(child) && types.includes(child.type)) matched.push(child);
            else rest.push(child);
        }
    };
    walk(children);
    return [matched, rest];
}

export interface QuickViewProps extends ComponentProps<'div'> {
    /** Id of the quick view (`fd-quick-view-…` by default). */
    id?: string;
}

/**
 * Quick view: a short overview of a person, an object or a company in a popover or a dialog, with an optional
 * header (`QuickViewTitle`), a subheader with an avatar and groups of label-value pairs. The title goes on top, the
 * other children into the content area. Native props, `className` and `ref` go to the root `<div>`.
 *
 * ```tsx
 * <QuickView>
 *     <QuickViewTitle>Contact</QuickViewTitle>
 *     <QuickViewSubheader>
 *         <Avatar size="s" label="Ann Smith" />
 *         <QuickViewSubheaderTitle>Ann Smith</QuickViewSubheaderTitle>
 *         <QuickViewSubheaderSubtitle>Sales manager</QuickViewSubheaderSubtitle>
 *     </QuickViewSubheader>
 *     <QuickViewGroup>
 *         <QuickViewGroupTitle>Contact details</QuickViewGroupTitle>
 *         <QuickViewGroupItem>
 *             <QuickViewGroupItemLabel>Email</QuickViewGroupItemLabel>
 *             <QuickViewGroupItemContent>
 *                 <QuickViewGroupItemContentElement render={<Link href="mailto:ann@example.com" />}>
 *                     ann@example.com
 *                 </QuickViewGroupItemContentElement>
 *             </QuickViewGroupItemContent>
 *         </QuickViewGroupItem>
 *     </QuickViewGroup>
 * </QuickView>
 * ```
 */
export function QuickView({ id, className, children, ...props }: QuickViewProps) {
    const autoId = `fd-quick-view-${useId()}`;
    const [titles, content] = partition(children, [QuickViewTitle]);
    return (
        <div
            {...props}
            id={id ?? autoId}
            data-quick-view=""
            className={cn(
                'm-0 box-border block min-w-80 border-0 p-0 [forced-color-adjust:none]',
                'font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-text-color',
                className
            )}
        >
            {titles}
            <div
                data-quick-view-content=""
                className="m-0 box-border bg-sap-group-content-background p-4 [[data-dialog-body]_&]:py-0"
            >
                {content}
            </div>
        </div>
    );
}

export type QuickViewTitleAlign = 'left' | 'middle' | 'right';

export interface QuickViewTitleProps extends ComponentProps<'div'> {
    /** Area of the header bar the title is in: the start (`left`), the centre (`middle`) or the end (`right`). */
    align?: QuickViewTitleAlign;
}

/**
 * Header bar of a quick view, sticky in a popover body. The title truncates; put a back button or other controls
 * in it as children. Native props go to the sticky header element.
 */
export function QuickViewTitle({ align = 'middle', children, ...props }: QuickViewTitleProps) {
    const Area = align === 'left' ? BarLeft : align === 'right' ? BarRight : BarMiddle;
    return (
        <PopoverBodyHeader {...props}>
            <Bar barDesign="header" role="group">
                <Area>
                    {/* nowrap also as text-wrap: the bar element's [text-wrap:auto] would wrap the truncated title */}
                    <BarElement className="block min-w-0 truncate [text-wrap:nowrap]">{children}</BarElement>
                </Area>
            </Bar>
        </PopoverBodyHeader>
    );
}

export type QuickViewSubheaderProps = Omit<BarProps, 'barDesign'>;

/**
 * Avatar, title and subtitle of the object: the avatar (and any other child) first, then the
 * `QuickViewSubheaderTitle` and `QuickViewSubheaderSubtitle` in a column. A header-with-subheader bar
 * (`role="group"`); native props go to it.
 */
export function QuickViewSubheader({ className, children, ...props }: QuickViewSubheaderProps) {
    const [texts, others] = partition(children, [QuickViewSubheaderTitle, QuickViewSubheaderSubtitle]);
    return (
        <Bar
            role="group"
            {...props}
            barDesign="header-with-subheader"
            data-quick-view-subheader=""
            // the bar's minimum height stays, as fundamental-styles (Angular: min-h-0)
            className={cn('h-auto [--bar-px:0] [--bar-pb:0.75rem]', className)}
        >
            <BarLeft className="items-start [&>:not([data-quick-view-subheader-text])]:me-3">
                {others}
                <div
                    data-quick-view-subheader-text=""
                    className="flex h-full min-w-0 max-w-full flex-col justify-center gap-1"
                >
                    {texts}
                </div>
            </BarLeft>
        </Bar>
    );
}

export interface QuickViewSubheaderTitleProps extends Omit<TitleProps, 'level' | 'wrap' | 'headerSize'> {
    /** Wraps a long title instead of truncating it. */
    allowWrap?: boolean;
    /** Heading level and size: an `<h5>` by default. */
    headerSize?: HeaderSize;
}

/** Name of the object: an SAP title, `<h5>` by default. */
export function QuickViewSubheaderTitle({
    allowWrap = false,
    headerSize = 5,
    className,
    ...props
}: QuickViewSubheaderTitleProps) {
    return <Title {...props} level={headerSize} wrap={allowWrap} className={cn('block min-w-0', className)} />;
}

export interface QuickViewSubheaderSubtitleProps extends ComponentProps<'div'> {
    /** Wraps a long subtitle instead of truncating it. */
    allowWrap?: boolean;
}

/** A short description of the object, e.g. a job title. */
export function QuickViewSubheaderSubtitle({
    allowWrap = false,
    className,
    ...props
}: QuickViewSubheaderSubtitleProps) {
    return (
        <div
            {...props}
            className={cn(
                'm-0 box-border block min-w-0 border-0 p-0 [forced-color-adjust:none]',
                'font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-tile-text-color',
                allowWrap ? 'whitespace-normal' : 'truncate',
                className
            )}
        />
    );
}

/** Registers the id of the group title with its group. */
const GroupContext = createContext<((id: string | null) => void) | null>(null);

/**
 * A group of label-value pairs (`role="group"`), named by its `QuickViewGroupTitle` unless `aria-labelledby` or
 * `aria-label` is given. Native props go to the group element.
 */
export function QuickViewGroup(props: ComponentProps<'div'>) {
    const [titleId, setTitleId] = useState<string | null>(null);
    const named = props['aria-labelledby'] != null || props['aria-label'] != null;
    return (
        <GroupContext.Provider value={setTitleId}>
            <FormGroup
                role="group"
                {...props}
                aria-labelledby={named ? props['aria-labelledby'] : (titleId ?? undefined)}
            />
        </GroupContext.Provider>
    );
}

export interface QuickViewGroupTitleProps extends useRender.ComponentProps<'h3'> {
    /** Wraps a long title instead of truncating it. */
    allowWrap?: boolean;
    /** Id of the heading, which names the group (`fd-quick-view-group-title-…` by default). */
    id?: string;
    /** Heading level: an `<h3>` by default. */
    headingLevel?: HeaderSize;
}

/**
 * Title of a group: a heading (`<h3>` by default) in a form group header without border and padding. Native props
 * and `className` go to the heading; `render` renders another element.
 */
export function QuickViewGroupTitle({
    allowWrap = false,
    id,
    headingLevel = 3,
    render,
    className,
    ...props
}: QuickViewGroupTitleProps) {
    const autoId = `fd-quick-view-group-title-${useId()}`;
    const titleId = id ?? autoId;
    const register = useContext(GroupContext);
    useLayoutEffect(() => {
        if (!register) return;
        register(titleId);
        return () => register(null);
    }, [register, titleId]);
    const heading = useRender({
        render,
        defaultTagName: `h${headingLevel}` as 'h3',
        props: {
            ...props,
            id: titleId,
            className: cn('m-0 p-0', allowWrap ? 'whitespace-normal' : 'truncate', className)
        }
    });
    return (
        <FormGroupHeader noBorder noPadding data-quick-view-group-title="">
            {heading}
        </FormGroupHeader>
    );
}

const ItemContext = createContext<string | null>(null);

export interface QuickViewGroupItemProps extends ComponentProps<'div'> {
    /** Id of the item; the label and the value element take `<id>-label` and `<id>-content`. */
    id?: string;
}

/** A label and its value: a form item. */
export function QuickViewGroupItem({ id, className, ...props }: QuickViewGroupItemProps) {
    const autoId = `fd-quick-view-group-item-${useId()}`;
    const itemId = id ?? autoId;
    return (
        <ItemContext.Provider value={itemId}>
            <FormItem
                {...props}
                id={itemId}
                className={cn('gap-1 pt-3 [[data-quick-view-group-title]+&]:pt-0 [&>a]:self-start', className)}
            />
        </ItemContext.Provider>
    );
}

export type QuickViewGroupItemLabelProps = Omit<FormLabelProps, 'id'>;

/** Label of a group item: a form label with the id `<item id>-label`. */
export function QuickViewGroupItemLabel(props: QuickViewGroupItemLabelProps) {
    const itemId = useContext(ItemContext);
    return <FormLabel {...props} {...(itemId ? { id: `${itemId}-label` } : {})} />;
}

/** Value of a group item; put the value in a `QuickViewGroupItemContentElement`. */
export function QuickViewGroupItemContent({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('block', className)} />;
}

/**
 * The value element, labelled by the item label and itself (`aria-labelledby="<item id>-label <item id>-content"`).
 * Renders a `<div>`; `render` renders another element, e.g. `render={<Link href="tel:…" />}`.
 */
export function QuickViewGroupItemContentElement({ render, ...props }: useRender.ComponentProps<'div'>) {
    const itemId = useContext(ItemContext);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...(itemId ? { id: `${itemId}-content`, 'aria-labelledby': `${itemId}-label ${itemId}-content` } : {}),
            ...props
        }
    });
}
