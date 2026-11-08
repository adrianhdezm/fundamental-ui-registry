/*
 * Port of fundamental-react (Breadcrumb) and @fundamental-ngx/core (breadcrumb) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    Children,
    createContext,
    Fragment,
    isValidElement,
    useContext,
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type FocusEvent,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui/icon/icon';
import { Link } from '@/ui/link/link';
import { Menu, MenuItem, MenuPopup, MenuTitle, MenuTrigger } from '@/ui/menu/menu';
import { OverflowItem, OverflowLayout } from '@/ui/overflow-layout/overflow-layout';

export type BreadcrumbSeparatorStyle =
    '' | 'backslash' | 'double-slash' | 'double-backslash' | 'greater-than' | 'double-greater-than';

const SEPARATOR: Record<BreadcrumbSeparatorStyle, string> = {
    '': '/',
    backslash: '\\',
    'double-slash': '//',
    'double-backslash': '\\\\',
    'greater-than': '>',
    'double-greater-than': '>>'
};
// the spacing is padding, so the box is as wide as fundamental-styles' (an empty span with a margined ::after)
const SEPARATOR_CLASS = 'm-0 p-0 px-1 text-sap-text-color';

/** Focusable elements of the trail, in order. */
const FOCUSABLE = 'a, button, [aria-current], [data-breadcrumb-more]';

interface ItemContextValue {
    /** True for the last item of the trail. */
    last: boolean;
    separator: string;
}

const BreadcrumbItemContext = createContext<ItemContextValue | null>(null);

/** True when the node holds a `Link`, an `<a>` or a `<button>` (at any depth of the React tree). */
function hasLink(node: ReactNode): boolean {
    return Children.toArray(node).some((child) => {
        if (!isValidElement<{ children?: ReactNode }>(child)) return false;
        if (child.type === Link || child.type === 'a' || child.type === 'button') return true;
        return hasLink(child.props.children);
    });
}

export type BreadcrumbItemProps = ComponentProps<'span'>;

/**
 * A step of the trail: a `Link`, or the current page as text with `aria-current="page"`. A separator follows it,
 * except after a last item without link.
 *
 * ```tsx
 * <BreadcrumbItem><Link href="/products">Products</Link></BreadcrumbItem>
 * <BreadcrumbItem><span aria-current="page">Laptops</span></BreadcrumbItem>
 * ```
 */
export function BreadcrumbItem({ className, children, ...props }: BreadcrumbItemProps) {
    const context = useContext(BreadcrumbItemContext);
    const separator = context?.last && !hasLink(children) ? '' : (context?.separator ?? SEPARATOR['']);
    return (
        <span
            {...props}
            className={cn(
                'm-0 box-border inline-flex items-center whitespace-nowrap p-0 py-px text-sap-content-label-color',
                '[&_a]:leading-6 [&_a]:whitespace-nowrap',
                className
            )}
        >
            {children}
            {separator && (
                <span aria-hidden="true" className={SEPARATOR_CLASS}>
                    {separator}
                </span>
            )}
        </span>
    );
}

/** The element that performs the navigation of a rendered item. */
const targetOf = (item: Element): HTMLElement => item.querySelector<HTMLElement>('a, button') ?? (item as HTMLElement);

/** Text shown for an item in the overflow menu: the link text without its screen reader additions. */
function textOf(item: Element): string {
    const target = targetOf(item);
    return (target.querySelector(':scope > span') ?? target).textContent?.trim() ?? '';
}

interface HiddenEntry {
    text: string;
    disabled: boolean;
}

const sameEntries = (a: HiddenEntry[], b: HiddenEntry[]) =>
    a.length === b.length && a.every((entry, i) => entry.text === b[i]!.text && entry.disabled === b[i]!.disabled);

/** The "more" link at the start of a collapsed trail, with the menu of the hidden items. */
function BreadcrumbMore({
    hidden,
    renderItem,
    separator,
    label
}: {
    hidden: number[];
    renderItem: (index: number) => ReactNode;
    separator: string;
    label: string;
}) {
    // the hidden items render out of sight, so that the menu can read their text and activate their links
    const store = useRef<HTMLDivElement | null>(null);
    const [entries, setEntries] = useState<HiddenEntry[]>([]);
    useLayoutEffect(() => {
        const next = Array.from(store.current?.children ?? []).map((item) => ({
            text: textOf(item),
            disabled: targetOf(item).getAttribute('aria-disabled') === 'true'
        }));
        setEntries((previous) => (sameEntries(previous, next) ? previous : next));
    });
    return (
        <>
            <span className="m-0 inline-flex items-center whitespace-nowrap p-0 py-px text-sap-content-label-color">
                <Menu placement="bottom-start">
                    <MenuTrigger
                        nativeButton={false}
                        render={
                            <Link
                                role="button"
                                data-breadcrumb-more=""
                                tabIndex={-1}
                                aria-label={label}
                                title={label}
                                // 1.5rem high as fundamental-styles' links (the icons alone are shorter), with the
                                // icons at their glyph width
                                className="h-6 leading-6 [&_[data-glyph]]:w-auto"
                            />
                        }
                    >
                        <Icon glyph="overflow" />
                        <Icon glyph="slim-arrow-down" />
                    </MenuTrigger>
                    <MenuPopup aria-label={label}>
                        {entries.map((entry, i) => (
                            <MenuItem
                                key={i}
                                disabled={entry.disabled}
                                onClick={() => {
                                    const item = store.current?.children[i];
                                    if (item) targetOf(item).click();
                                }}
                            >
                                <MenuTitle>{entry.text}</MenuTitle>
                            </MenuItem>
                        ))}
                    </MenuPopup>
                </Menu>
                <span aria-hidden="true" className={SEPARATOR_CLASS}>
                    {separator}
                </span>
            </span>
            <div ref={store} hidden>
                {hidden.map((index) => (
                    <Fragment key={index}>{renderItem(index)}</Fragment>
                ))}
            </div>
        </>
    );
}

export interface BreadcrumbProps extends ComponentProps<'nav'> {
    /** `BreadcrumbItem`s, from the root to the current page. */
    children?: ReactNode;
    /** Lists the collapsed items from the root down instead of from the current page up. */
    reverse?: boolean;
    /** The separator between the items: `/` by default. */
    separatorStyle?: BreadcrumbSeparatorStyle;
    /** Accessible name of the navigation. */
    ariaLabel?: string;
    /** Accessible name of the "more" link and of its menu. */
    moreLabel?: string;
    /** Called with the number of items in the trail when it changes. */
    onVisibleItemsCountChange?: (count: number) => void;
    /** Called with the number of collapsed items when it changes. */
    onHiddenItemsCountChange?: (count: number) => void;
}

/**
 * Breadcrumb: the trail from the root to the current page. Items that do not fit collapse into a menu at the start,
 * behind a "more" link. The trail has one tab stop; the arrow keys move between the visible links (mirrored in RTL).
 *
 * ```tsx
 * <Breadcrumb>
 *     <BreadcrumbItem><Link href="/">Home</Link></BreadcrumbItem>
 *     <BreadcrumbItem><span aria-current="page">Laptops</span></BreadcrumbItem>
 * </Breadcrumb>
 * ```
 */
export function Breadcrumb({
    children,
    reverse = false,
    separatorStyle = '',
    ariaLabel = 'Breadcrumb trail',
    moreLabel = 'More',
    onVisibleItemsCountChange,
    onHiddenItemsCountChange,
    className,
    onKeyDown,
    onFocus,
    ref,
    ...props
}: BreadcrumbProps) {
    const nav = useRef<HTMLElement | null>(null);
    const current = useRef<HTMLElement | null>(null);
    // the counts re-render the trail when the layout changes, so the tab stop follows the visible links
    const [, setVisible] = useState(0);
    const [, setHidden] = useState(0);

    const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
    const separator = SEPARATOR[separatorStyle];
    const renderItem = (index: number) => (
        <BreadcrumbItemContext.Provider value={{ last: index === items.length - 1, separator }}>
            {items[index]}
        </BreadcrumbItemContext.Provider>
    );

    const focusables = () =>
        Array.from(nav.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
            (el) => !el.closest('[hidden]') && el.getAttribute('aria-disabled') !== 'true'
        );

    // one tab stop: the last focused visible link, or the first one
    useLayoutEffect(() => {
        const visible = focusables();
        const stop = current.current && visible.includes(current.current) ? current.current : visible[0];
        nav.current?.querySelectorAll<HTMLElement>(FOCUSABLE).forEach((el) => (el.tabIndex = el === stop ? 0 : -1));
    });

    const focusIn = (event: FocusEvent<HTMLElement>) => {
        onFocus?.(event);
        const target = event.target as HTMLElement;
        const visible = focusables();
        if (!visible.includes(target)) return;
        current.current = target;
        visible.forEach((el) => (el.tabIndex = el === target ? 0 : -1));
    };

    const arrowKey = (event: KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event);
        const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        if (!keys.includes(event.key) || event.defaultPrevented) return;
        const visible = focusables();
        const index = visible.indexOf(event.target as HTMLElement);
        if (index === -1) return;
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const next =
            event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? index + 1 : index - 1;
        const el = visible[Math.max(0, Math.min(next, visible.length - 1))]!;
        if (el !== visible[index]) {
            event.preventDefault();
            el.focus();
        }
    };

    return (
        <nav
            aria-label={ariaLabel}
            {...props}
            ref={(node) => {
                nav.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            className={cn(
                'm-0 mb-2 box-border flex flex-wrap items-center p-0 font-sap-font-family text-sap-font-size',
                className
            )}
            onKeyDown={arrowKey}
            onFocus={focusIn}
        >
            <OverflowLayout
                showMorePosition="left"
                ariaRole="list"
                // no gap: the separator after the "more" link spaces it from the first item
                className="justify-start gap-0"
                reverseHiddenItems={!reverse}
                enableKeyboardNavigation={false}
                onVisibleItemsCountChange={(count) => {
                    setVisible(count);
                    onVisibleItemsCountChange?.(count);
                }}
                onHiddenItemsCountChange={(count) => {
                    setHidden(count);
                    onHiddenItemsCountChange?.(count);
                }}
                renderMore={(hidden) => (
                    <BreadcrumbMore
                        hidden={hidden.map((ref) => ref.item as number)}
                        renderItem={renderItem}
                        separator={separator}
                        label={moreLabel}
                    />
                )}
            >
                {items.map((item, index) => (
                    <OverflowItem key={item.key ?? index} item={index}>
                        {renderItem(index)}
                    </OverflowItem>
                ))}
            </OverflowLayout>
        </nav>
    );
}
