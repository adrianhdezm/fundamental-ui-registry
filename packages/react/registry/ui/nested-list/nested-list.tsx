/*
 * Port of @fundamental-ngx/core (nested-list) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useDirection } from '@base-ui/react/direction-provider';
import { useRender } from '@base-ui/react/use-render';
import {
    Children,
    createContext,
    isValidElement,
    use,
    useCallback,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
    type RefObject
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Icon, type IconFont } from '@/ui/icon/icon';
import { Popover, PopoverBody } from '@/ui/popover/popover';

/** An item of a nested list built from data: a group header, or a link with an optional child list. */
export interface NestedListItemModel {
    /** Renders a group header instead of an item. */
    headerTitle?: string;
    list?: NestedListModel;
    link?: NestedListLinkModel;
    /** Shows the child list at first. */
    expanded?: boolean;
}

/** A nested list built from data, see `PreparedNestedList`. */
export interface NestedListModel {
    textOnly?: boolean;
    items: NestedListItemModel[];
}

/** The link of an item built from data. */
export interface NestedListLinkModel {
    icon?: string;
    title: string;
    callback?: () => void;
    href?: string;
    selected?: boolean;
}

/** The attribute of the element whose rows the arrow keys move between (a side navigation, a popover body). */
export const NESTED_LIST_SCOPE_ATTRIBUTE = 'data-nested-scope';
const FOCUSABLE = 'data-nested-focusable';

/** State shared by the lists of one navigation: condensed mode, selectability and the selected item. */
interface NestedListState {
    condensed: boolean;
    selectable: boolean;
    /** An enclosing element carries the scope attribute and holds the rows of every list. */
    scoped: boolean;
    /** Ids from the top item down to the clicked one; null until an item is clicked. */
    selectedPath: readonly string[] | null;
    select: (path: readonly string[]) => void;
}

const NestedListStateContext = createContext<NestedListState | null>(null);

/** Creates the state of a navigation; the selection lives here. */
function useNestedListState(condensed: boolean, selectable: boolean, scoped: boolean): NestedListState {
    const [selectedPath, setSelectedPath] = useState<readonly string[] | null>(null);
    return useMemo(
        () => ({ condensed, selectable, scoped, selectedPath, select: setSelectedPath }),
        [condensed, selectable, scoped, selectedPath]
    );
}

export interface NestedListProviderProps {
    children?: ReactNode;
    /** First-level items show their icons only and open their children in popovers. */
    condensed?: boolean;
    /** Clicking an item selects it and highlights its parents; false keeps the `selected` props (default true). */
    selectable?: boolean;
    /**
     * An enclosing element has the `data-nested-scope` attribute (`NESTED_LIST_SCOPE_ATTRIBUTE`), and the arrow keys
     * move across the rows of all its lists, e.g. the main and utility lists of a side navigation.
     */
    scoped?: boolean;
}

/**
 * Shares one state between the lists of a navigation (Angular's `NestedListState`): condensed mode, whether items
 * are selectable, and the selected item. A top `NestedList` without a provider has a state of its own.
 */
export function NestedListProvider({
    children,
    condensed = false,
    selectable = true,
    scoped = false
}: NestedListProviderProps) {
    const state = useNestedListState(condensed, selectable, scoped);
    return <NestedListStateContext value={state}>{children}</NestedListStateContext>;
}

/** What a list tells its items and child lists. */
interface ListContextValue {
    level: number;
    inPopover: boolean;
    ariaLabelSelected: string;
    parentItem: ItemContextValue | null;
    state: NestedListState;
}

/** What an item tells its rows, its child list and its popover. */
interface ItemContextValue {
    id: string;
    /** Ids from the top item down to this one. */
    path: readonly string[];
    list: ListContextValue;
    expanded: boolean;
    hasChildren: boolean;
    hasPopover: boolean;
    selected: boolean;
    title: string;
    rtl: boolean;
    row: RefObject<HTMLElement | null>;
    link: RefObject<HTMLElement | null>;
    hasContent: RefObject<boolean>;
    setExpanded: (expanded: boolean) => void;
    open: (fromKeyboard?: boolean) => void;
    close: (restoreFocus?: boolean) => void;
    activate: () => void;
    select: () => void;
    registerChildList: () => () => void;
    registerPopover: (focusFirst: () => void) => () => void;
    setContentSelected: (selected: boolean) => void;
    setLinkSelected: (selected: boolean) => void;
    setTitle: (title: string) => void;
}

const ListContext = createContext<ListContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);
/** Set inside a content row: its link is not the row. */
const ContentContext = createContext(false);
/** Set inside the body of a condensed popover, with the header text that names its list. */
const PopoverHeadingContext = createContext<string | null>(null);

/** Arrow-key navigation over the visible rows of the scope of a row; Up and Down wrap around, as upstream. */
function onRowKeyDown(event: KeyboardEvent<HTMLElement>, item: ItemContextValue): void {
    if (event.target !== event.currentTarget) return;
    const row = event.currentTarget;
    const scope = row.closest(`[${NESTED_LIST_SCOPE_ATTRIBUTE}]`) ?? row.closest('ul');
    const rows = [...(scope?.querySelectorAll<HTMLElement>(`[${FOCUSABLE}]`) ?? [])].filter(
        (el) => el.offsetParent !== null
    );
    const index = rows.indexOf(row);
    const forward = item.rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = item.rtl ? 'ArrowRight' : 'ArrowLeft';
    switch (event.key) {
        case 'ArrowDown':
            rows[(index + 1) % rows.length]?.focus();
            break;
        case 'ArrowUp':
            rows[(index - 1 + rows.length) % rows.length]?.focus();
            break;
        case 'Home':
            rows[0]?.focus();
            break;
        case 'End':
            rows[rows.length - 1]?.focus();
            break;
        case forward:
            if (item.hasChildren && !item.expanded) item.open(true);
            break;
        case backward:
            if (item.hasChildren && item.expanded) item.close();
            else if (item.list.inPopover) item.list.parentItem?.close(true);
            break;
        case 'Enter':
        case ' ':
            item.activate();
            break;
        default:
            return;
    }
    event.preventDefault();
}

/** Classes of a row: a link, or the content of an item with children. */
function rowClass(item: ItemContextValue | null, childContainer: boolean): string {
    const inPopover = !!item?.list.inPopover;
    return cn(
        'relative m-0 box-border flex h-(--nl-h) w-full cursor-pointer items-center p-0 ps-(--nl-pl) pe-(--nl-pr) no-underline',
        'border-0 border-t border-solid border-sap-list-border-color bg-(--nl-bg) text-start outline-none',
        // transparent at rest over the item background, as fundamental-styles
        '[--nl-bg:transparent] hover:[--nl-bg:var(--sapList_Hover_Background)]',
        'focus-visible:outline-sap focus-visible:-outline-offset-[0.1875rem]',
        'active:[--nl-bg:var(--sapList_Active_Background)] active:[--nl-fg:var(--sapList_Active_TextColor)]',
        // the first item of a list (after hidden headers only) has no line above it; nor do deeper levels
        '[li:not(li:not([data-hidden])~li)>&]:border-t-0 [li:not(li:not([data-hidden])~li)>*>&]:border-t-0',
        (item?.list.level ?? 1) > 1 && 'border-t-0',
        inPopover && '[li:first-child>&]:rounded-t-sap-popover-border-corner-radius',
        inPopover && '[li:last-child>&]:rounded-b-sap-popover-border-corner-radius',
        item?.selected &&
            'border-b border-b-sap-list-selection-border-color not-active:[--nl-bg:var(--sapList_SelectionBackgroundColor)] not-active:hover:[--nl-bg:var(--sapList_Hover_SelectionBackground)]',
        // the link and the expand button cover the content row and have the pointer
        childContainer && 'cursor-auto justify-between ps-0 pe-0'
    );
}

/** Whether the rows of the item show their icon only: first-level items of a condensed navigation. */
const iconOnly = (list: ListContextValue | null | undefined) =>
    !!list?.state.condensed && list.level === 1 && !list.inPopover;

export interface NestedListProps extends ComponentProps<'ul'> {
    /** Items without icons; titles align with the padding. */
    textOnly?: boolean;
    /** Role description of a tree. */
    ariaRoledescriptionTree?: string;
    /** Role description of the first level of a condensed navigation. */
    ariaRoledescriptionMenuBar?: string;
    /** Added to the names of selected links when items are not selectable. */
    ariaLabelSelected?: string;
}

/**
 * A list of navigation items that can nest (Angular's `fd-nested-list`): items open their child lists with an
 * expand button or the arrow keys, and clicking an item selects it and highlights its parents. The top list is a
 * `tree`, child lists are `group`s. Up and Down move across the visible rows (wrapping at the ends), Home and End
 * jump to the first and last; Right opens a child list (Left in RTL) and Left closes it.
 *
 * ```tsx
 * <NestedList>
 *     <NestedListItem>
 *         <NestedListLink href="#home">
 *             <NestedListIcon glyph="home" />
 *             <NestedListTitle>Home</NestedListTitle>
 *         </NestedListLink>
 *     </NestedListItem>
 * </NestedList>
 * ```
 */
export function NestedList({
    textOnly = false,
    ariaRoledescriptionTree = 'Navigation List Tree',
    ariaRoledescriptionMenuBar = 'Navigation List Menu Bar',
    ariaLabelSelected = 'Selected',
    className,
    style,
    children,
    ...props
}: NestedListProps) {
    const parentItem = use(ItemContext);
    const shared = use(NestedListStateContext);
    const parentList = parentItem?.list ?? null;
    // a top list outside a provider has a state of its own
    const ownState = useNestedListState(false, true, false);
    const state = parentList?.state ?? shared ?? ownState;
    const heading = use(PopoverHeadingContext);
    const inPopover = heading !== null;
    /**
     * The top list of a popover is a tree of its own, named by the popover title: the overlay is outside the
     * navigation tree, so a group there would have no tree around it.
     */
    const popoverTree = inPopover && !parentList?.inPopover;
    /** A list at the top of its own navigation handles the arrow keys of its rows. */
    const scope = !parentItem && !state.scoped;
    const ownLevel = parentList ? parentList.level + 1 : 1;
    const level = state.condensed ? Math.min(ownLevel, 2) : ownLevel;
    /** A collapsed parent hides its list. */
    const hidden = !!parentItem && !inPopover && !parentItem.expanded;
    const role = popoverTree || level === 1 ? 'tree' : 'group';
    const roleDescription =
        role === 'tree'
            ? state.condensed && !popoverTree
                ? ariaRoledescriptionMenuBar
                : ariaRoledescriptionTree
            : undefined;
    const isTextOnly = textOnly || inPopover;
    /** Rows of further levels are indented: 2.75rem on the second level, 1rem more on each further one. */
    const indent = inPopover ? '1rem' : level > 1 ? `${level - 2 + 2.75}rem` : isTextOnly ? '1rem' : '0rem';

    const registerChildList = parentItem?.registerChildList;
    useLayoutEffect(() => registerChildList?.(), [registerChildList]);

    const context = useMemo<ListContextValue>(
        () => ({ level, inPopover, ariaLabelSelected, parentItem, state }),
        [level, inPopover, ariaLabelSelected, parentItem, state]
    );

    const list = (
        <ul
            role={role}
            aria-roledescription={roleDescription}
            aria-label={popoverTree ? (heading ?? undefined) : undefined}
            aria-hidden={hidden || undefined}
            {...props}
            data-level={level}
            data-nested-scope={scope ? '' : undefined}
            data-text-only={isTextOnly ? '' : undefined}
            style={{ '--nl-pl': indent, ...style } as ComponentProps<'ul'>['style']}
            className={cn(
                'm-0 box-border block w-full list-none p-0 font-sap-font-family',
                '[--nl-h:2.75rem] [--nl-title:var(--sapFontLargeSize)] [--nl-icon:var(--sapFontHeader4Size)] [--nl-pr:0] [--nl-fg:var(--sapList_TextColor)]',
                'compact:[--nl-h:2rem] compact:[--nl-title:var(--sapFontSize)] compact:[--nl-icon:var(--sapFontLargeSize)]',
                level === 1 && !inPopover && 'border-b border-solid border-sap-list-border-color',
                hidden && 'hidden',
                className
            )}
        >
            <ListContext value={context}>{children}</ListContext>
        </ul>
    );
    return parentList || shared ? list : <NestedListStateContext value={state}>{list}</NestedListStateContext>;
}

export interface NestedListItemProps extends ComponentProps<'li'> {
    /** Whether the child list shows (controlled). */
    expanded?: boolean;
    /** Whether the child list shows at first (uncontrolled). */
    defaultExpanded?: boolean;
    /** Called when the child list opens or closes. */
    onExpandedChange?: (expanded: boolean) => void;
}

/**
 * An item of a nested list (Angular's `fd-nested-list-item`): a `NestedListLink`, or a `NestedListContent` row with
 * a link and a `NestedListExpandIcon`, followed by a child `NestedList`. In a condensed navigation, wrap the row and
 * the child list of a first-level item in a `NestedListPopover`.
 */
export function NestedListItem({
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    className,
    children,
    ...props
}: NestedListItemProps) {
    const list = use(ListContext);
    const parentPath = list?.parentItem?.path;
    const autoId = useId();
    const id = `fd-nested-item-${autoId}`;
    const direction = useDirection();
    const row = useRef<HTMLElement | null>(null);
    const link = useRef<HTMLElement | null>(null);
    const hasContent = useRef(false);
    const focusFirstRef = useRef<(() => void) | null>(null);

    const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
    const expanded = expandedProp ?? uncontrolled;
    const latest = useRef({ expanded, controlled: expandedProp !== undefined, onExpandedChange });
    latest.current = { expanded, controlled: expandedProp !== undefined, onExpandedChange };
    const setExpanded = useCallback((next: boolean) => {
        if (next === latest.current.expanded) return;
        if (!latest.current.controlled) setUncontrolled(next);
        latest.current.onExpandedChange?.(next);
    }, []);

    const [childLists, setChildLists] = useState(0);
    const registerChildList = useCallback(() => {
        setChildLists((n) => n + 1);
        return () => setChildLists((n) => n - 1);
    }, []);
    const [hasPopover, setHasPopover] = useState(false);
    const registerPopover = useCallback((focusFirst: () => void) => {
        focusFirstRef.current = focusFirst;
        setHasPopover(true);
        return () => {
            focusFirstRef.current = null;
            setHasPopover(false);
        };
    }, []);
    const [contentSelected, setContentSelected] = useState(false);
    const [linkSelected, setLinkSelected] = useState(false);
    const [title, setTitle] = useState('');

    const path = useMemo(() => [...(parentPath ?? []), id], [parentPath, id]);
    const state = list?.state;
    /** Selected: the clicked item or one of its parents; before any click, the `selected` props. */
    const selected =
        state?.selectable && state.selectedPath !== null
            ? state.selectedPath.includes(id)
            : contentSelected || linkSelected;

    const context: ItemContextValue = {
        id,
        path,
        list: list!,
        expanded,
        hasChildren: childLists > 0 || hasPopover,
        hasPopover,
        selected,
        title,
        rtl: direction === 'rtl',
        row,
        link,
        hasContent,
        setExpanded,
        /** Opens the child list; from the keyboard, a popover moves the focus into it. */
        open: (fromKeyboard = false) => {
            setExpanded(true);
            if (fromKeyboard) focusFirstRef.current?.();
        },
        close: (restoreFocus = false) => {
            setExpanded(false);
            if (restoreFocus) row.current?.focus();
        },
        /** Runs the link of the item, which selects it. */
        activate: () => {
            if (link.current && hasContent.current) link.current.click();
            else row.current?.click();
        },
        select: () => {
            if (state?.selectable) state.select(path);
        },
        registerChildList,
        registerPopover,
        setContentSelected,
        setLinkSelected,
        setTitle
    };

    return (
        <li
            role="none"
            title={iconOnly(list) && title ? title : undefined}
            {...props}
            data-nested-item=""
            className={cn('m-0 box-border block bg-sap-list-background p-0', className)}
        >
            <ItemContext value={context}>{children}</ItemContext>
        </li>
    );
}

export interface NestedListContentProps extends ComponentProps<'div'> {
    /** Shows the row as selected before any item is clicked. */
    selected?: boolean;
}

/** The last group header before the item of a row, which describes the row. */
function useHeaderId(row: RefObject<HTMLElement | null>): string | undefined {
    const [headerId, setHeaderId] = useState<string | undefined>();
    useLayoutEffect(() => {
        let el = row.current?.closest('[data-nested-item]')?.previousElementSibling ?? null;
        while (el && !el.hasAttribute('data-nested-header')) el = el.previousElementSibling;
        const next = el?.id || undefined;
        setHeaderId((current) => (current === next ? current : next));
    });
    return headerId;
}

/**
 * The row of an item with children (Angular's `fd-nested-list-content`): a `NestedListLink` and a
 * `NestedListExpandIcon`. The row is the `treeitem` and takes the focus; its link does not.
 */
export function NestedListContent({
    selected = false,
    className,
    ref,
    onClick,
    onKeyDown,
    children,
    ...props
}: NestedListContentProps) {
    const item = use(ItemContext);
    const own = useRef<HTMLDivElement | null>(null);
    const headerId = useHeaderId(own);
    const setContentSelected = item?.setContentSelected;
    useLayoutEffect(() => {
        setContentSelected?.(selected);
    }, [setContentSelected, selected]);
    const hasContent = item?.hasContent;
    useLayoutEffect(() => {
        if (!hasContent) return;
        hasContent.current = true;
        return () => {
            hasContent.current = false;
        };
    }, [hasContent]);

    const setRef = (node: HTMLDivElement | null) => {
        own.current = node;
        if (item) item.row.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
    };

    return (
        <div
            tabIndex={0}
            aria-describedby={headerId}
            {...props}
            ref={setRef}
            role="treeitem"
            data-nested-focusable=""
            aria-level={item?.list.level}
            aria-expanded={item?.hasChildren ? item.expanded : undefined}
            aria-selected={item?.list.state.selectable ? item.selected : undefined}
            aria-haspopup={item?.hasPopover ? 'tree' : undefined}
            className={cn(rowClass(item, !!item?.hasChildren), className)}
            onClick={(event) => {
                onClick?.(event);
                item?.select();
            }}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                if (item && !event.defaultPrevented) onRowKeyDown(event, item);
            }}
        >
            <ContentContext value>{children}</ContentContext>
        </div>
    );
}

export interface NestedListLinkProps extends useRender.ComponentProps<'a'> {
    /** Shows the link as selected before any item is clicked. */
    selected?: boolean;
}

/**
 * The link of an item (Angular's `fd-nested-list-link`): an `<a>`, or another element with `render` (e.g. a router
 * link). On its own it is the row, a `treeitem` in the tab order; inside a `NestedListContent` the content is.
 */
export function NestedListLink({
    selected = false,
    render,
    className,
    ref,
    onClick,
    onKeyDown,
    ...props
}: NestedListLinkProps) {
    const item = use(ItemContext);
    const inContent = use(ContentContext);
    const standalone = !inContent;
    const own = useRef<HTMLElement | null>(null);
    const headerId = useHeaderId(own);
    const setLinkSelected = item?.setLinkSelected;
    useLayoutEffect(() => {
        setLinkSelected?.(selected);
    }, [setLinkSelected, selected]);

    const list = item?.list;
    const title = item?.title ?? '';
    const ariaLabel = title
        ? `${title}${list && !list.state.selectable && selected ? `, ${list.ariaLabelSelected}` : ''}`
        : undefined;

    const setRef = (node: HTMLElement | null) => {
        own.current = node;
        if (item) {
            item.link.current = node;
            if (standalone) item.row.current = node;
        }
    };

    return useRender({
        render,
        defaultTagName: 'a',
        ref: ref ? [setRef, ref] : setRef,
        props: {
            'aria-label': ariaLabel,
            'aria-describedby': standalone ? headerId : undefined,
            ...props,
            tabIndex: standalone ? 0 : -1,
            role: standalone ? 'treeitem' : undefined,
            'data-nested-focusable': standalone ? '' : undefined,
            'aria-level': standalone ? list?.level : undefined,
            'aria-selected': standalone && list?.state.selectable ? !!item?.selected : undefined,
            'aria-expanded': standalone && item?.hasChildren ? item.expanded : undefined,
            className: cn(
                standalone
                    ? rowClass(item, false)
                    : 'm-0 box-border flex h-full min-w-0 flex-1 cursor-pointer items-center bg-transparent p-0 ps-(--nl-pl) no-underline outline-none',
                className
            ),
            onClick: (event: MouseEvent<HTMLAnchorElement>) => {
                onClick?.(event);
                item?.select();
            },
            onKeyDown: (event: KeyboardEvent<HTMLAnchorElement>) => {
                onKeyDown?.(event);
                if (standalone && item && !event.defaultPrevented) onRowKeyDown(event, item);
            }
        }
    });
}

export type NestedListTitleProps = ComponentProps<'span'>;

/** The text of a link (Angular's `fd-nested-list-title`); hidden visually on condensed first-level items. */
export function NestedListTitle({ className, ref, children, ...props }: NestedListTitleProps) {
    const item = use(ItemContext);
    const own = useRef<HTMLSpanElement | null>(null);
    const setTitle = item?.setTitle;
    useLayoutEffect(() => {
        setTitle?.(own.current?.textContent?.trim() ?? '');
    });

    return (
        <span
            {...props}
            data-slot="nested-list-title"
            ref={(node) => {
                own.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            className={cn(
                'm-0 box-border flex h-full w-full min-w-0 items-center truncate p-0 pe-4 text-start',
                'text-(length:--nl-title) leading-[normal] text-(--nl-fg)',
                // without an icon the title starts after the icon column, or at the padding of text-only lists
                'first:ps-11 in-data-[text-only]:first:ps-0',
                iconOnly(item?.list) && 'sr-only-sap',
                className
            )}
        >
            {children}
        </span>
    );
}

export interface NestedListIconProps extends Omit<ComponentProps<'span'>, 'children'> {
    /** Name of the glyph, e.g. "home". */
    glyph?: string | null;
    /** Icon font the glyph comes from. */
    font?: IconFont;
}

/** The icon of a link, before its title (Angular's `fd-nested-list-icon`). Decorative. */
export function NestedListIcon({ glyph, font = 'SAP-icons', className, ...props }: NestedListIconProps) {
    return (
        <span
            role="presentation"
            aria-hidden="true"
            {...props}
            data-slot="nested-list-icon"
            className={cn(
                'm-0 box-border flex h-full min-w-11 shrink-0 items-center justify-center p-0 not-italic text-(length:--nl-icon) leading-none text-(--nl-fg)',
                className
            )}
        >
            <Icon glyph={glyph} font={font} className="text-[length:inherit] leading-none" />
        </span>
    );
}

export type NestedListHeaderProps = ComponentProps<'li'>;

/** A group header between items (Angular's `fd-nested-list-header`); it describes the items after it. */
export function NestedListHeader({ id: idProp, className, ...props }: NestedListHeaderProps) {
    const autoId = useId();
    const id = idProp ?? `fd-nested-list-group-header-${autoId}`;
    // condensed navigations have no room for headers
    const condensed = !!use(ListContext)?.state.condensed;
    return (
        <li
            role="presentation"
            {...props}
            id={id}
            data-nested-header=""
            data-hidden={condensed ? '' : undefined}
            className={
                condensed
                    ? 'hidden'
                    : cn(
                          'm-0 box-border flex h-11 items-end truncate border-0 border-b border-solid border-sap-list-group-header-border-color bg-sap-list-group-header-background px-4 font-sap-font-family text-sap-font-size leading-8 font-bold whitespace-nowrap text-sap-list-group-header-text-color',
                          className
                      )
            }
        />
    );
}

export type NestedListExpandIconProps = ComponentProps<'button'>;

/** The button that expands and collapses the child list of an item (Angular's `fd-nested-list-expand-icon`). */
export function NestedListExpandIcon({ className, onClick, children, ...props }: NestedListExpandIconProps) {
    const item = use(ItemContext);
    // condensed first-level items open a popover and show no arrow
    const hidden = iconOnly(item?.list);
    return (
        <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            {...props}
            data-slot="nested-list-expand-icon"
            className={
                hidden
                    ? 'hidden'
                    : cn(
                          'm-0 box-border flex h-full min-w-10 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-sap-font-large-size text-sap-content-icon-color outline-none [[data-nested-focusable]:active_&]:text-sap-list-active-text-color',
                          className
                      )
            }
            onClick={(event) => {
                onClick?.(event);
                event.stopPropagation();
                item?.setExpanded(!item.expanded);
            }}
        >
            {children}
            <Icon
                glyph={item?.expanded ? 'navigation-down-arrow' : 'navigation-right-arrow'}
                className="text-[length:inherit] leading-none"
            />
        </button>
    );
}

export interface NestedListPopoverProps {
    /** The row of the item (a `NestedListContent` or `NestedListLink`) and its child `NestedList`. */
    children?: ReactNode;
    /** Header of the popover; the item title by default. It also names the list in the popover. */
    title?: string;
    /** Classes of the popover body. */
    className?: string;
}

/**
 * In a condensed navigation, opens the child list of a first-level item in a popover to the side (Angular's
 * `fd-nested-list-popover`), with the item title as its header. A click on the row, or Right (Left in RTL), opens it;
 * Escape, a click outside and Left in its rows close it. Built on our `Popover` (Base UI's Popover).
 */
export function NestedListPopover({ children, title = '', className }: NestedListPopoverProps) {
    const item = use(ItemContext);
    const direction = useDirection();
    const control = useRef<HTMLDivElement | null>(null);
    const body = useRef<HTMLDivElement | null>(null);
    const pendingFocus = useRef(false);
    const heading = title || item?.title || '';

    const rows: ReactNode[] = [];
    const lists: ReactNode[] = [];
    Children.forEach(children, (child) => {
        const type = isValidElement(child) ? (child as ReactElement).type : null;
        (type === NestedList || type === PreparedNestedList ? lists : rows).push(child);
    });

    /** Focuses the first row of the open popover, once it is rendered. */
    const focusFirst = useCallback(() => {
        const first = () => body.current?.querySelector<HTMLElement>(`[${FOCUSABLE}]`);
        if (first()) requestAnimationFrame(() => first()?.focus());
        else pendingFocus.current = true;
    }, []);
    const registerPopover = item?.registerPopover;
    useLayoutEffect(() => registerPopover?.(focusFirst), [registerPopover, focusFirst]);

    const expanded = item?.expanded ?? false;
    const setExpanded = item?.setExpanded;
    // Base UI puts a visually hidden `aria-owns` element where the body is rendered: outside the list, it does not
    // become a child of the tree (as the overlay container of Angular's popover)
    const [host, setHost] = useState<HTMLElement | null>(null);
    useLayoutEffect(() => setHost(document.body), []);

    return (
        <Popover
            open={expanded}
            onOpenChange={(open, details) => {
                // presses on the row toggle it themselves
                const target = details.event?.target as Node | null;
                if (!open && details.reason === 'outside-press' && target && control.current?.contains(target)) {
                    details.cancel();
                    return;
                }
                setExpanded?.(open);
            }}
            triggers={[]}
            anchor={control}
            placement={direction === 'rtl' ? 'left-start' : 'right-start'}
            noArrow={false}
            focusAutoCapture={false}
        >
            <div
                ref={control}
                className="block w-full"
                onClick={(event) => {
                    // clicks in the body (a portal) reach here through React, not through the DOM
                    if (control.current?.contains(event.target as Node)) setExpanded?.(!expanded);
                }}
            >
                {rows}
            </div>
            {host &&
                createPortal(
                    <PopoverBody aria-label={heading || undefined} className={className} finalFocus={item?.row}>
                        <div
                            ref={(node) => {
                                body.current = node;
                                if (node && pendingFocus.current) {
                                    pendingFocus.current = false;
                                    requestAnimationFrame(() =>
                                        node.querySelector<HTMLElement>(`[${FOCUSABLE}]`)?.focus()
                                    );
                                }
                            }}
                            data-nested-scope=""
                            className="min-w-48 font-sap-font-family"
                        >
                            <div
                                aria-hidden="true"
                                data-slot="nested-list-popover-header"
                                className="m-0 box-border flex h-11 items-center truncate rounded-t-sap-popover-border-corner-radius px-4 font-sap-font-family text-sap-font-large-size font-bold text-sap-list-text-color [box-shadow:0_0_0.25rem_0_var(--sapContent_ShadowColor),inset_0_-0.0625rem_0_0_var(--sapList_BorderColor)] compact:h-8 compact:text-sap-font-size"
                            >
                                {heading}
                            </div>
                            <PopoverHeadingContext value={heading}>{lists}</PopoverHeadingContext>
                        </div>
                    </PopoverBody>,
                    host
                )}
        </Popover>
    );
}

export interface PreparedNestedListProps extends Omit<NestedListProps, 'children' | 'textOnly'> {
    /** The items. */
    list?: NestedListModel | null;
    /**
     * Opens the child lists of first-level items in popovers and shows their icons only; the condensed state of the
     * enclosing `NestedListProvider` by default.
     */
    condensed?: boolean;
}

/** Expanded states of the data items, kept while the condensed mode switches between popovers and child lists. */
const ExpandedContext = createContext<WeakMap<NestedListItemModel, boolean> | null>(null);

/**
 * A nested list built from a model (Angular's `fd-prepared-nested-list`), with group headers, child lists and, in
 * condensed mode, popovers for the first level.
 */
export function PreparedNestedList({ list, condensed: condensedProp, ...props }: PreparedNestedListProps) {
    const shared = use(NestedListStateContext);
    const parentList = use(ListContext);
    const parentMap = use(ExpandedContext);
    const [ownMap] = useState(() => new WeakMap<NestedListItemModel, boolean>());
    const map = parentMap ?? ownMap;
    const first = !parentList;
    const condensed = condensedProp ?? shared?.condensed ?? false;

    const items = (
        <NestedList {...props} textOnly={!!list?.textOnly}>
            {(list?.items ?? []).map((item, index) => {
                if (item.headerTitle) return <NestedListHeader key={index}>{item.headerTitle}</NestedListHeader>;
                const l = item.link;
                const link = l && (
                    <NestedListLink
                        href={l.href}
                        selected={!item.list && !!l.selected}
                        onClick={l.callback ? () => l.callback?.() : undefined}
                    >
                        {l.icon && <NestedListIcon glyph={l.icon} />}
                        <NestedListTitle>{l.title}</NestedListTitle>
                    </NestedListLink>
                );
                const content = (selected: boolean) => (
                    <NestedListContent selected={selected}>
                        {link}
                        <NestedListExpandIcon />
                    </NestedListContent>
                );
                return (
                    <NestedListItem
                        key={index}
                        defaultExpanded={map.get(item) ?? !!item.expanded}
                        onExpandedChange={(expanded) => map.set(item, expanded)}
                    >
                        {item.list && condensed && first ? (
                            <NestedListPopover title={l?.title ?? ''}>
                                {content(!!l?.selected)}
                                <PreparedNestedList list={item.list} />
                            </NestedListPopover>
                        ) : item.list ? (
                            <>
                                {content(false)}
                                <PreparedNestedList list={item.list} />
                            </>
                        ) : (
                            link
                        )}
                    </NestedListItem>
                );
            })}
        </NestedList>
    );

    const withMap = parentMap ? items : <ExpandedContext value={map}>{items}</ExpandedContext>;
    // a condensed list outside a navigation shares its condensed state with its lists
    return condensed && !shared && first ? <NestedListProvider condensed>{withMap}</NestedListProvider> : withMap;
}
