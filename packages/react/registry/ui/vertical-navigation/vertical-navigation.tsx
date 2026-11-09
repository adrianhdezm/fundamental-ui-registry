/*
 * Port of @fundamental-ngx/core (vertical-navigation) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useDirection } from '@base-ui/react/direction-provider';
import {
    Children,
    cloneElement,
    createContext,
    isValidElement,
    use,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconProps } from '@/ui/icon/icon';

const ITEM_SLOT = 'list-navigation-item';
const ITEM_SELECTOR = `[data-slot=${ITEM_SLOT}]`;

interface NavigationContextValue {
    condensed: boolean;
    /** The id of the item reachable with Tab. */
    tabbableId: string | null;
    itemFocused: (id: string) => void;
    /** Recomputes the tab stop after the focusable items changed. */
    refresh: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface ItemContextValue {
    id: string;
    textId: string;
    parent: ItemContextValue | null;
    expanded: boolean;
    expandable: boolean;
    visible: boolean;
    /** First-level item of a condensed navigation. */
    condensedLevel: boolean;
    /** Condensed and expanded: the second-level items show in a panel over the content. */
    panelOpen: boolean;
    /** A second-level item shown in the panel of its condensed parent. */
    inPanel: boolean;
    hasIcon: boolean;
    el: { current: HTMLLIElement | null };
    setExpanded: (expanded: boolean) => void;
    registerChild: () => () => void;
    registerIndicatedChild: () => () => void;
    registerIcon: () => () => void;
    registerArrow: () => () => void;
}

const ItemContext = createContext<ItemContextValue | null>(null);

/** A count of registered parts, and a stable function that registers one and returns its unregistration. */
function useRegistry(): [number, () => () => void] {
    const [count, setCount] = useState(0);
    const register = useCallback(() => {
        setCount((n) => n + 1);
        return () => setCount((n) => n - 1);
    }, []);
    return [count, register];
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
}

export interface VerticalNavigationProps extends ComponentProps<'nav'> {
    /** Shows the icons only and opens second-level items in a panel over the content. */
    condensed?: boolean;
}

/**
 * Vertical navigation: the side navigation of SAP Fiori, with icons, texts, second-level items and an indicator for
 * the current page. Condensed, it shows the icons only and opens second-level items in a panel over the content.
 * Up and Down move between the visible items, Right and Left (mirrored in RTL) expand and collapse, Enter and Space
 * toggle.
 *
 * ```tsx
 * <VerticalNavigation>
 *     <ListNavigationItem indicated>
 *         <ListNavigationItemIcon glyph="home" />
 *         <ListNavigationItemText>Overview</ListNavigationItemText>
 *     </ListNavigationItem>
 *     <ListNavigationItem>
 *         <ListNavigationItemIcon glyph="calendar" />
 *         <ListNavigationItemText>Calendar</ListNavigationItemText>
 *         <ListNavigationItemArrow />
 *         <ListNavigationItemList>
 *             <ListNavigationItem>
 *                 <ListNavigationItemText>Today</ListNavigationItemText>
 *             </ListNavigationItem>
 *         </ListNavigationItemList>
 *     </ListNavigationItem>
 * </VerticalNavigation>
 * ```
 */
export function VerticalNavigation({
    condensed = false,
    'aria-label': ariaLabel = 'Main Navigation',
    className,
    children,
    onKeyDown,
    ref,
    ...props
}: VerticalNavigationProps) {
    const root = useRef<HTMLElement | null>(null);
    const active = useRef<string | null>(null);
    const [tabbableId, setTabbableId] = useState<string | null>(null);

    const focusableItems = useCallback(
        () => [...(root.current?.querySelectorAll<HTMLElement>(`${ITEM_SELECTOR}[data-focusable]`) ?? [])],
        []
    );
    /** The last focused visible item, or the first. */
    const refresh = useCallback(() => {
        const items = focusableItems();
        const current = items.find((i) => i.id === active.current) ?? items[0];
        setTabbableId(current?.id ?? null);
    }, [focusableItems]);
    // the items' first refresh runs before this element's ref is set
    useLayoutEffect(refresh, [refresh]);
    const itemFocused = useCallback(
        (id: string) => {
            active.current = id;
            refresh();
        },
        [refresh]
    );
    const context = useMemo<NavigationContextValue>(
        () => ({ condensed, tabbableId, itemFocused, refresh }),
        [condensed, tabbableId, itemFocused, refresh]
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        const all = [...(root.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])];
        const current = all.findIndex((i) => i === document.activeElement);
        if (current < 0) return;
        const focusable = (i: HTMLElement) => i.hasAttribute('data-focusable');
        let target: HTMLElement | undefined;
        if (event.key === 'Home') target = all.find(focusable);
        else if (event.key === 'End') target = all.findLast(focusable);
        else if (event.key === 'ArrowDown') target = all.slice(current + 1).find(focusable);
        else target = all.slice(0, current).findLast(focusable);
        target?.focus();
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <nav
            aria-label={ariaLabel}
            {...props}
            ref={(node) => {
                root.current = node;
                assignRef(ref, node);
            }}
            data-slot="vertical-navigation"
            data-condensed={condensed ? '' : undefined}
            onKeyDown={handleKeyDown}
            className={cn(
                'm-0 box-border flex h-full flex-col justify-between bg-sap-list-alternating-background p-0 font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-text-color [box-shadow:var(--sapContent_Shadow0)]',
                condensed ? 'w-[3.25rem]' : 'w-60',
                className
            )}
        >
            <ul role="tree" className="m-0 box-border w-full list-none p-0">
                <NavigationContext value={context}>{children}</NavigationContext>
            </ul>
        </nav>
    );
}

export interface ListNavigationItemProps extends ComponentProps<'li'> {
    /** Shows the second-level items (controlled). */
    expanded?: boolean;
    /** Shows the second-level items at first (uncontrolled). */
    defaultExpanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    /** Marks the item of the current page. */
    indicated?: boolean;
}

const LIST_CLASS = 'm-0 box-border list-none p-0';

const isList = (child: unknown): child is ReactElement<ComponentProps<'ul'>> =>
    isValidElement(child) && (child.type === 'ul' || child.type === ListNavigationItemList);

const PANEL_CLASS = 'absolute start-[0.325rem] top-0 z-[3] flex h-full flex-col';
const PANEL_HEADER_CLASS =
    'box-border flex h-full min-h-0 w-[14.325rem] shrink-0 items-start whitespace-nowrap rounded-t-sap-popover-border-corner-radius rounded-es-sap-popover-border-corner-radius bg-sap-list-alternating-background [box-shadow:var(--sapContent_Shadow1)]';
const PANEL_LIST_CLASS =
    'ms-[2.925rem] box-border block w-[11.4rem] shrink-0 overflow-hidden rounded-b-sap-popover-border-corner-radius bg-sap-list-alternating-background [box-shadow:var(--sapContent_Shadow1)]';

/**
 * An item of a vertical navigation (Angular's `fd-list-navigation-item`): an icon, a text, and optionally an arrow
 * with a list of second-level items. `indicated` marks the current page.
 */
export function ListNavigationItem({
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    indicated = false,
    id: idProp,
    className,
    children,
    onClick,
    onKeyDown,
    onFocus,
    ref,
    ...props
}: ListNavigationItemProps) {
    const nav = use(NavigationContext);
    const parent = use(ItemContext);
    const autoId = useId();
    const id = idProp ?? `fd-list-navigation-item-${autoId}`;
    const rtl = useDirection() === 'rtl';
    const el = useRef<HTMLLIElement | null>(null);

    const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
    const expanded = expandedProp ?? uncontrolled;
    const [childItems, registerChild] = useRegistry();
    const [indicatedChildren, registerIndicatedChild] = useRegistry();
    const [icons, registerIcon] = useRegistry();
    const [arrows, registerArrow] = useRegistry();

    /** Items with an arrow have second-level items. */
    const expandable = arrows > 0 || childItems > 0;
    const visible = !parent || (parent.expanded && parent.visible);
    const condensedLevel = !parent && !!nav?.condensed;
    const panelOpen = condensedLevel && expanded && expandable;
    const inPanel = !!parent?.panelOpen;
    /** Visible, without condensed parents whose panel is open (their children take the focus). */
    const focusable = visible && !(!!nav?.condensed && expanded && expandable);
    /** The indicator marks the item, or its collapsed parent when a child is indicated. */
    const showIndicator =
        !panelOpen && ((indicated && !(expandable && expanded)) || (!expanded && indicatedChildren > 0));

    /** Where the focus goes once a change of `expanded` from this item has rendered. */
    const pendingFocus = useRef<boolean | null>(null);
    const latest = useRef({ expanded, expandable, controlled: expandedProp !== undefined, onExpandedChange });
    latest.current = { expanded, expandable, controlled: expandedProp !== undefined, onExpandedChange };
    const updateExpanded = useCallback((next: boolean) => {
        if (!latest.current.controlled) setUncontrolled(next);
        latest.current.onExpandedChange?.(next);
    }, []);
    /** Expands (moving the focus to the first second-level item) or collapses (back to this item). */
    const setExpanded = useCallback(
        (next: boolean) => {
            if (!latest.current.expandable || latest.current.expanded === next) return;
            pendingFocus.current = next;
            updateExpanded(next);
        },
        [updateExpanded]
    );

    useEffect(() => {
        if (pendingFocus.current !== expanded) return;
        pendingFocus.current = null;
        if (expanded) el.current?.querySelector<HTMLElement>(`[role=group] ${ITEM_SELECTOR}`)?.focus();
        else el.current?.focus();
    }, [expanded]);

    // children and indicated children register with their parent
    const parentRegisterChild = parent?.registerChild;
    useLayoutEffect(() => parentRegisterChild?.(), [parentRegisterChild]);
    const parentRegisterIndicated = parent?.registerIndicatedChild;
    useLayoutEffect(() => (indicated ? parentRegisterIndicated?.() : undefined), [indicated, parentRegisterIndicated]);

    // the navigation keeps one tab stop on a focusable item
    const refresh = nav?.refresh;
    useLayoutEffect(() => {
        refresh?.();
        return () => queueMicrotask(() => refresh?.());
    }, [focusable, refresh]);

    // a condensed panel closes on clicks outside it
    useEffect(() => {
        if (!panelOpen) return;
        const close = (event: globalThis.MouseEvent) => {
            if (!el.current?.contains(event.target as Node)) updateExpanded(false);
        };
        const timer = setTimeout(() => document.addEventListener('click', close));
        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', close);
        };
    }, [panelOpen, updateExpanded]);

    const context: ItemContextValue = {
        id,
        textId: `${id}-text`,
        parent,
        expanded,
        expandable,
        visible,
        condensedLevel,
        panelOpen,
        inPanel,
        hasIcon: icons > 0,
        el,
        setExpanded,
        registerChild,
        registerIndicatedChild,
        registerIcon,
        registerArrow
    };

    const handleClick = (event: MouseEvent<HTMLLIElement>) => {
        onClick?.(event);
        event.stopPropagation();
        if (expandable) setExpanded(!expanded);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
        onKeyDown?.(event);
        if (event.target !== event.currentTarget || event.defaultPrevented) return;
        const open = rtl ? 'ArrowLeft' : 'ArrowRight';
        const close = rtl ? 'ArrowRight' : 'ArrowLeft';
        if (event.key === open) {
            event.preventDefault();
            setExpanded(true);
        } else if (event.key === close) {
            event.preventDefault();
            if (expandable && expanded) setExpanded(false);
            else parent?.setExpanded(false);
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            if (expandable) setExpanded(!expanded);
            else event.currentTarget.click();
        } else if (event.key === 'Escape' && parent?.panelOpen) {
            event.preventDefault();
            parent.setExpanded(false);
        }
    };

    const handleFocus = (event: FocusEvent<HTMLLIElement>) => {
        onFocus?.(event);
        if (event.target === event.currentTarget) nav?.itemFocused(id);
    };

    // the second-level lists go to their own slot, which becomes the panel list when condensed
    const content = Children.toArray(children);
    const lists = content.filter(isList).map((list) =>
        list.type === 'ul'
            ? cloneElement(list, {
                  role: list.props.role ?? 'group',
                  className: cn(LIST_CLASS, list.props.className)
              })
            : list
    );
    const rest = content.filter((child) => !isList(child));
    const isExpanded = expanded && expandable;

    return (
        <li
            role="treeitem"
            aria-level={parent ? 2 : 1}
            aria-expanded={expandable ? expanded : undefined}
            aria-selected={indicated}
            tabIndex={nav?.tabbableId === id ? 0 : -1}
            {...props}
            id={id}
            ref={(node) => {
                el.current = node;
                assignRef(ref, node);
            }}
            data-slot={ITEM_SLOT}
            data-focusable={focusable ? '' : undefined}
            data-expanded={isExpanded ? '' : undefined}
            data-indicated={indicated ? '' : undefined}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            className={cn(
                'relative m-0 box-border block h-11 cursor-pointer list-none bg-transparent ps-2 pe-4 whitespace-nowrap outline-none',
                '[--vn-fg:var(--sapList_TextColor)] [--vn-ic:var(--sapHighlightColor)] [--vn-arrow:var(--sapContent_NonInteractiveIconColor)]',
                // the focus frame covers the row, not the second-level items below it
                "focus-visible:before:pointer-events-none focus-visible:before:absolute focus-visible:before:inset-x-0 focus-visible:before:top-0 focus-visible:before:h-11 focus-visible:before:outline-sap focus-visible:before:-outline-offset-[0.3125rem] focus-visible:before:content-['']",
                indicated && 'focus-visible:before:-outline-offset-[0.375rem]',
                '[&:hover:not(:has(li:hover))]:bg-sap-list-hover-background [&:hover:not(:has(li:hover))]:[--vn-ic:var(--sapList_TextColor)]',
                '[&:active:not(:has(li:active))]:bg-sap-list-active-background [&:active:not(:has(li:active))]:[--vn-fg:var(--sapContent_ContrastTextColor)] [&:active:not(:has(li:active))]:[--vn-ic:var(--sapContent_ContrastIconColor)] [&:active:not(:has(li:active))]:[--vn-arrow:var(--sapContent_ContrastIconColor)]',
                indicated && [
                    '[--vn-fg:var(--sapSelectedColor)] [--vn-ic:var(--sapSelectedColor)] [--vn-arrow:var(--sapSelectedColor)]',
                    // the selected colour is too dark for text on high contrast black: keep the indicator, use the selected text colour
                    'hc:[--vn-fg:var(--sapContent_Selected_TextColor)] hc:[--vn-ic:var(--sapContent_Selected_TextColor)] hc:[--vn-arrow:var(--sapContent_Selected_TextColor)]'
                ],
                // the focus frame of the first item starts on its top border, as fundamental-styles' outline
                parent
                    ? 'w-full'
                    : 'border-0 border-solid border-sap-list-border-color not-last:border-b first:border-t first:focus-visible:before:-top-px',
                // in a condensed panel, second-level rows have no padding (their texts start 1rem in)
                inPanel && 'ps-0 pe-0',
                // expanded: the second-level list spans the full width below the row
                isExpanded &&
                    !condensedLevel &&
                    'h-auto overflow-hidden ps-3 [&_ul]:-ms-3 [&_ul]:-me-4 [&_ul]:block [&_ul]:w-auto',
                !isExpanded && '[&_ul]:hidden',
                condensedLevel && 'w-[3.25rem] ps-0 pe-0',
                panelOpen && 'overflow-visible',
                className
            )}
        >
            <ItemContext value={context}>
                <div
                    data-slot="list-navigation-item-panel"
                    data-open={panelOpen ? '' : undefined}
                    className={panelOpen ? PANEL_CLASS : 'contents'}
                >
                    <div className={panelOpen ? PANEL_HEADER_CLASS : 'contents'}>{rest}</div>
                    <div className={panelOpen ? PANEL_LIST_CLASS : 'contents'}>{lists}</div>
                </div>
            </ItemContext>
            {showIndicator && (
                <span
                    aria-hidden="true"
                    data-slot="list-navigation-item-indicator"
                    className="pointer-events-none absolute end-0 top-0 h-11 w-[0.1875rem] rounded-sap-field-border-corner-radius bg-sap-selected-color"
                />
            )}
        </li>
    );
}

export type ListNavigationItemListProps = ComponentProps<'ul'>;

/** The second-level items of a navigation item: a group of the tree (Angular's `<ul fd-list>` in an item). */
export function ListNavigationItemList({ className, ...props }: ListNavigationItemListProps) {
    return <ul role="group" {...props} data-slot="list-navigation-item-list" className={cn(LIST_CLASS, className)} />;
}

export type ListNavigationItemTextProps = ComponentProps<'span'>;

/** The text of a navigation item; it names the item. */
export function ListNavigationItemText({ id, className, ...props }: ListNavigationItemTextProps) {
    const item = use(ItemContext);
    const child = !!item?.parent;
    return (
        <span
            {...props}
            id={id ?? item?.textId}
            data-slot="list-navigation-item-text"
            className={cn(
                'm-0 box-border inline-block max-w-36 truncate p-0 ps-1 align-middle font-sap-font-family text-(--vn-fg)',
                // second-level texts and the parent's text in a condensed panel are the smaller size
                child || item?.panelOpen ? 'ps-0 text-sap-font-size' : 'text-sap-font-large-size',
                'leading-11',
                // second-level texts start after the parent's icon column, or 1rem in when it has none
                child && (item?.inPanel ? 'ms-4' : item?.parent?.hasIcon ? 'ms-11' : 'ms-4'),
                // condensed: the icon shows, the text still names the item
                item?.condensedLevel && !item.panelOpen && 'sr-only-sap',
                // an expanded parent moves its padding to the row, keeping the text in place
                (item?.panelOpen || (item?.expanded && item.expandable)) && 'ps-0',
                className
            )}
        />
    );
}

export type ListNavigationItemIconProps = IconProps;

/** The icon of a navigation item (Angular's `<fd-icon>` in an item). */
export function ListNavigationItemIcon({ className, ...props }: ListNavigationItemIconProps) {
    const item = use(ItemContext);
    const register = item?.registerIcon;
    useLayoutEffect(() => register?.(), [register]);
    const expanded = !!item?.expanded && item.expandable;
    return (
        <Icon
            {...props}
            data-slot="list-navigation-item-icon"
            className={cn(
                'inline-flex h-11 w-9 items-center justify-center align-top font-sap-content-icon-font-family text-base leading-11 text-(--vn-ic)',
                expanded && !item?.condensedLevel && 'pe-2',
                // 0.25rem to the text: the space between icon and text in fundamental-styles' markup, which lines
                // the text up with the second-level texts; condensed, the icon is centred; in the panel header, it
                // starts 0.875rem in, 0.5rem and the space before the text
                item?.panelOpen ? 'ms-0 me-3 ps-[0.875rem]' : item?.condensedLevel ? 'mx-2' : 'me-1',
                className
            )}
        />
    );
}

export type ListNavigationItemArrowProps = ComponentProps<'button'>;

/** The arrow of an expandable navigation item; it marks the item expandable. */
export function ListNavigationItemArrow({
    'aria-hidden': ariaHidden = true,
    className,
    ...props
}: ListNavigationItemArrowProps) {
    const item = use(ItemContext);
    const register = item?.registerArrow;
    useLayoutEffect(() => register?.(), [register]);
    const condensed = !!item?.condensedLevel;
    return (
        <button
            type="button"
            tabIndex={-1}
            role="presentation"
            aria-hidden={ariaHidden}
            {...props}
            data-slot="list-navigation-item-arrow"
            className={cn(
                'absolute end-0 top-0 m-0 box-border flex size-11 cursor-pointer items-center justify-center rounded-sap-button-border-corner-radius border-none bg-transparent p-0 font-sap-content-icon-font-family text-base leading-11 text-(--vn-arrow) outline-none',
                // condensed: a small corner triangle
                condensed &&
                    "w-full before:absolute before:end-0 before:bottom-0 before:me-3 before:mb-[0.5625rem] before:size-0 before:border-solid before:border-transparent before:border-t-[0.25rem] before:border-e-[0.25rem] before:border-e-(--vn-arrow) before:content-[''] rtl:before:rotate-90",
                item?.panelOpen && 'hidden',
                className
            )}
        >
            {!condensed && (
                <Icon
                    glyph={item?.expanded ? 'navigation-down-arrow' : 'navigation-right-arrow'}
                    className="rtl:-scale-x-100"
                />
            )}
        </button>
    );
}

export type VerticalNavigationGroupHeaderProps = ComponentProps<'li'>;

/** A group header between navigation items; not focusable. */
export function VerticalNavigationGroupHeader({ className, children, ...props }: VerticalNavigationGroupHeaderProps) {
    return (
        <li
            role="none"
            {...props}
            data-slot="vertical-navigation-group-header"
            className={cn(
                'm-0 box-border flex h-11 items-end overflow-hidden border-0 border-b border-solid border-sap-list-group-header-border-color bg-sap-list-alternating-background px-[0.9375rem] py-0 font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-text-color',
                className
            )}
        >
            {/* fundamental-styles' list title of a group header */}
            <span className="m-0 min-w-0 truncate p-0 font-sap-font-header-family text-sap-font-header6-size leading-8 font-bold text-sap-list-table-group-header-text-color">
                {children}
            </span>
        </li>
    );
}
