/*
 * Port of fundamental-react (Tree) and @fundamental-ngx/core (tree) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    Children,
    Fragment,
    cloneElement,
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
    type Ref,
    type RefCallback
} from 'react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/ui/button/button';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { Icon, type IconProps } from '@/ui/icon/icon';
import { Radio, RadioGroup } from '@/ui/radio/radio';

export type TreeItemState = 'default' | 'error' | 'success' | 'warning';
export type TreeSelectionType = 'none' | 'single' | 'multiple';
export type TreeSelectionPlacement = 'left' | 'right' | 'none' | 'afterExpand';

/** A lazily loaded list of tree items, e.g. the children of an item fetched on expansion. */
export interface TreeDataSource<T> {
    fetch(): Promise<T[]> | T[];
    /** Number of items, to know before fetching whether an item can be expanded. */
    getTotalItems?(): Promise<number> | number;
}

export type TreeAcceptableDataSource<T = unknown> = T[] | Promise<T[]> | TreeDataSource<T> | null | undefined;

/** A tree item as data: what `renderItem` gets. */
export interface TreeItemData<T = unknown> {
    id: string;
    data: T;
    children?: TreeAcceptableDataSource<Partial<TreeItemData<T>>>;
    expanded?: boolean;
    navigatable?: boolean;
    state?: TreeItemState;
    level: number;
    parentId: string | null;
}

let nextId = 0;

/** Normalizes data items: ids, levels and parents. */
export function normalizeTreeItems<T>(
    items: readonly Partial<TreeItemData<T>>[] | null | undefined,
    parentId: string | null = null,
    level = 1
): TreeItemData<T>[] {
    return (items ?? []).map((item) => ({
        ...item,
        data: item.data as T,
        id: item.id || `fd-tree-item-${nextId++}`,
        level,
        parentId
    }));
}

const isThenable = <V,>(value: unknown): value is PromiseLike<V> =>
    !!value && typeof (value as PromiseLike<V>).then === 'function';

/** Loads a data source of any accepted kind: the items now, or a promise of them. */
function load<T>(source: TreeAcceptableDataSource<T>): T[] | PromiseLike<T[]> {
    if (!source) return [];
    if (Array.isArray(source)) return source;
    if (isThenable<T[]>(source)) return source;
    return (source as TreeDataSource<T>).fetch();
}

/** The number of items of a data source (now or as a promise), or null while it cannot be known. */
function total<T>(source: TreeAcceptableDataSource<T>): number | PromiseLike<number> | null {
    if (!source) return 0;
    if (Array.isArray(source)) return source.length;
    if (isThenable<T[]>(source)) return source.then((items) => items.length);
    const count = (source as TreeDataSource<T>).getTotalItems?.();
    return count === undefined ? null : count;
}

/** Indentation per level by the deepest expanded level, as in fundamental-styles. */
function levelIndent(level: number, expandedLevel: number): number {
    if (level <= 1 || expandedLevel < 1) return 0;
    if (expandedLevel >= 6) return (level - 1) * 0.25;
    if (expandedLevel === 1) return level === 2 ? 1.5 : 0;
    if (expandedLevel === 2) return level === 2 ? 1 : level === 3 ? 2.5 : 0;
    return level <= 6 ? (level - 1) * 0.5 : 0;
}

/** Colour of the highlight indicator at the start of the row, per state. */
const HIGHLIGHT: Record<TreeItemState, string> = {
    default: '[--tree-hl:var(--sapInformationBorderColor)]',
    error: '[--tree-hl:var(--sapErrorBorderColor)]',
    warning: '[--tree-hl:var(--sapWarningBorderColor)]',
    success: '[--tree-hl:var(--sapSuccessBorderColor)]'
};

/** The highlight indicator (start), the navigated indicator (end), or both, as fundamental-styles' shadows. */
const SHADOW = {
    highlight: '[box-shadow:inset_0.375rem_0_0_0_var(--tree-hl)] rtl:[box-shadow:inset_-0.375rem_0_0_0_var(--tree-hl)]',
    navigated:
        '[box-shadow:inset_-0.1875rem_0_0_0_var(--sapSelectedColor)] rtl:[box-shadow:inset_0.1875rem_0_0_0_var(--sapSelectedColor)]',
    both: '[box-shadow:inset_-0.1875rem_0_0_0_var(--sapSelectedColor),inset_0.375rem_0_0_0_var(--tree-hl)] rtl:[box-shadow:inset_0.1875rem_0_0_0_var(--sapSelectedColor),inset_-0.375rem_0_0_0_var(--tree-hl)]'
};

const ROOT_ROW =
    'm-0 box-border flex min-h-(--tree-h) w-full items-center border-0 border-b border-solid border-sap-list-border-color bg-sap-list-background p-0 pe-4';
const CHILD_LOADING_ROW =
    'm-0 box-border flex min-h-(--tree-h) w-full items-center border-0 border-b border-solid border-transparent bg-sap-list-alternating-background p-0 pe-4';
/** A line of text that is still loading (fundamental-styles' text skeleton, 6.25rem wide). */
const TEXT_PLACEHOLDER =
    'block h-2 w-[6.25rem] shrink-0 cursor-wait rounded-sm bg-sap-content-placeholderloading-background';
const LOADING_ROWS = [0, 1, 2, 3, 4];

/** What the tree keeps of each rendered item, for the keyboard. */
interface TreeItemHandle {
    row: HTMLElement | null;
    level: number;
    expandable: boolean;
    expanded: boolean;
    setExpanded: (expanded: boolean) => void;
}

interface TreeContextValue {
    selection: TreeSelectionType;
    selectionPlacement: TreeSelectionPlacement;
    independentSections: boolean;
    navigationIndicator: boolean;
    noBorder: boolean;
    loadingLabel: string;
    expandedLevel: number;
    /** The item in the tab order: the focused or the first one. */
    tabbableId: string | null;
    isSelected: (value: unknown) => boolean;
    toggleSelection: (value: unknown) => void;
    setFocused: (id: string) => void;
    register: (id: string, handle: { current: TreeItemHandle }) => () => void;
    reportExpanded: (id: string, level: number, expanded: boolean) => void;
    renderItem: ((item: TreeItemData<never>) => ReactNode) | null;
}

const TreeContext = createContext<TreeContextValue | null>(null);
/** Level of the parent (0 at the top) and the size of the set and position of an item among its siblings. */
const TreeParentLevelContext = createContext(0);
const TreePositionContext = createContext<{ setSize: number; position: number } | null>(null);

/** Children with fragments flattened, keeping unique keys. */
function flatten(children: ReactNode, prefix = ''): ReactNode[] {
    return Children.toArray(children).flatMap((child) => {
        if (!isValidElement<{ children?: ReactNode }>(child)) return [child];
        if (child.type === Fragment) return flatten(child.props.children, `${prefix}${child.key}/`);
        return [prefix ? cloneElement(child, { key: `${prefix}${child.key}` }) : child];
    });
}

/** Renders sibling items, telling each its position in the set. */
function ItemSet({ items }: { items: ReactElement[] }) {
    return items.map((item, index) => (
        <TreePositionContext key={item.key ?? index} value={{ setSize: items.length, position: index + 1 }}>
            {item}
        </TreePositionContext>
    ));
}

/** Sets every ref in the list. */
function mergeRefs<E>(...refs: (Ref<E> | undefined)[]): RefCallback<E> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
}

export type TreeItemIconProps = IconProps;

/** The icon of a tree item, before its text (Angular's `fdTreeItemIcon`). */
export function TreeItemIcon({ className, ...props }: TreeItemIconProps) {
    return (
        <Icon
            {...props}
            className={cn(
                'flex min-h-(--tree-exp) min-w-(--tree-exp) shrink-0 items-center justify-center text-[1.125rem] leading-none text-sap-content-non-interactive-icon-color group-active/row:text-sap-list-active-text-color',
                className
            )}
        />
    );
}

export type TreeItemTextProps = useRender.ComponentProps<'span'>;

/** The text of a tree item, truncated unless the item wraps its content (Angular's `fdTreeItemText`). */
export function TreeItemText({ render, className, ...props }: TreeItemTextProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            'data-slot': 'tree-item-text',
            className: cn(
                'm-0 block w-full min-w-0 truncate p-0 text-(length:--tree-font) leading-(--tree-h) text-sap-list-text-color group-active/row:text-sap-list-active-text-color group-data-[wrap]/row:leading-[1.4] group-data-[wrap]/row:whitespace-normal',
                className
            )
        }
    });
}

export type TreeItemButtonProps = ButtonProps;

/** An action button at the end of a tree item, after its text (Angular's `fdTreeItemButton`). */
export function TreeItemButton({ className, ...props }: TreeItemButtonProps) {
    return <Button {...props} className={cn('shrink-0', className)} />;
}

export interface TreeItemProps<T = unknown> extends Omit<ComponentProps<'div'>, 'children'> {
    /** Icon, text, action buttons and nested `TreeItem`s. */
    children?: ReactNode;
    /** The value selected by the item; its id by default. */
    value?: unknown;
    /** The item navigates somewhere on click: hover and press states, and the navigation indicator. */
    navigatable?: boolean;
    /** The item is the one navigated to: an indicator at the end of the row (fundamental-react's `isNavigated`). */
    navigated?: boolean;
    /** Highlight indicator at the start of the item. */
    state?: TreeItemState | null;
    /** The children of a data tree item, loaded when it expands and rendered with the tree's `renderItem`. */
    childNodes?: TreeAcceptableDataSource<Partial<TreeItemData<T>>>;
    /** Wraps a long text instead of truncating it. */
    wrapContent?: boolean;
    /** Level of the item; nested items count their parents. */
    level?: number | null;
    /** Whether the children show (controlled). */
    expanded?: boolean;
    /** Whether the children show at first (uncontrolled). */
    defaultExpanded?: boolean;
    /** Called when the item expands or collapses. */
    onExpandedChange?: (expanded: boolean) => void;
    /** Called when the item is clicked, or activated with Enter or Space. */
    onTreeItemClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * A tree item: a row with an expander, an icon, a text and buttons, and its children, either nested `TreeItem`s or
 * the `childNodes` of a data tree, loaded when it expands. Native props and the ref go to the row
 * (`role="treeitem"`).
 */
export function TreeItem<T = unknown>({
    children,
    value,
    navigatable = false,
    navigated = false,
    state,
    childNodes,
    wrapContent = false,
    level: levelProp,
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    onTreeItemClick,
    id: idProp,
    ref,
    className,
    onClick,
    onKeyDown,
    onFocus,
    ...props
}: TreeItemProps<T>) {
    const tree = use(TreeContext);
    const parentLevel = use(TreeParentLevelContext);
    const position = use(TreePositionContext);
    const autoId = useId();
    const id = idProp ?? `fd-tree-item-${autoId}`;
    const level = levelProp ?? parentLevel + 1;
    const rowRef = useRef<HTMLDivElement>(null);

    const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
    const expanded = expandedProp ?? uncontrolledExpanded;
    const setExpanded = (next: boolean) => {
        if (expandedProp === undefined) setUncontrolledExpanded(next);
        onExpandedChange?.(next);
    };

    // the parts of the row and the nested items
    const parts = flatten(children);
    const nested = parts.filter((child): child is ReactElement => isValidElement(child) && child.type === TreeItem);
    const buttons = parts.filter((child) => isValidElement(child) && child.type === TreeItemButton);
    const content = parts.filter((child) => !nested.includes(child as ReactElement) && !buttons.includes(child));

    // the number of children of a data item, known now, later (a promise) or never (null)
    const count = useMemo(() => (childNodes ? total(childNodes) : 0), [childNodes]);
    const [asyncCount, setAsyncCount] = useState<{ source: unknown; count: number } | null>(null);
    useLayoutEffect(() => {
        if (!isThenable<number>(count)) return;
        let current = true;
        count.then((n) => current && setAsyncCount({ source: childNodes, count: n }));
        return () => {
            current = false;
        };
    }, [count, childNodes]);

    // the children of a data item, loaded when it expands and dropped when it collapses
    const [loaded, setLoaded] = useState<{ source: unknown; items: TreeItemData<T>[] } | null>(null);
    useLayoutEffect(() => {
        if (!expanded || !childNodes) {
            setLoaded(null);
            return;
        }
        let current = true;
        const result = load(childNodes);
        const done = (items: Partial<TreeItemData<T>>[]) => {
            if (current) setLoaded({ source: childNodes, items: normalizeTreeItems(items, id, level + 1) });
        };
        if (isThenable<Partial<TreeItemData<T>>[]>(result)) {
            setLoaded(null);
            result.then(done);
        } else done(result);
        return () => {
            current = false;
        };
        // the ids and levels are those of the moment the children load
    }, [expanded, childNodes]);
    const dataChildren = loaded && loaded.source === childNodes ? loaded.items : [];
    const childrenLoaded = !!loaded && loaded.source === childNodes;
    const childCount = childrenLoaded
        ? dataChildren.length
        : typeof count === 'number'
          ? count
          : asyncCount && asyncCount.source === childNodes
            ? asyncCount.count
            : null;
    const childrenLoading = !!childNodes && expanded && !childrenLoaded;
    const countLoading = !!childNodes && childCount === null && !childrenLoaded;
    const expandable = nested.length > 0 || (childCount ?? 0) > 0 || dataChildren.length > 0;

    const itemValue = value ?? id;
    const selection = tree?.selection ?? 'none';
    const selectable = selection !== 'none';
    const selected = selectable && (tree?.isSelected(itemValue) ?? false);
    const placement = selectable ? (tree?.selectionPlacement ?? 'none') : 'none';
    const independent = tree?.independentSections ?? false;

    // the keyboard handling of the tree reads the latest state of the item
    const handle = useRef<TreeItemHandle>({ row: null, level, expandable, expanded, setExpanded });
    handle.current = { row: rowRef.current, level, expandable, expanded, setExpanded };
    const register = tree?.register;
    useLayoutEffect(() => {
        handle.current.row = rowRef.current;
        return register?.(id, handle);
    }, [register, id]);
    const reportExpanded = tree?.reportExpanded;
    const expandedAndExpandable = expanded && expandable;
    useLayoutEffect(() => {
        reportExpanded?.(id, level, expandedAndExpandable);
    }, [reportExpanded, id, level, expandedAndExpandable]);
    useLayoutEffect(() => () => reportExpanded?.(id, level, false), [reportExpanded, id, level]);

    /** Start indentation of the item's level. */
    const indent = `${levelIndent(level, tree?.expandedLevel ?? 0)}rem`;
    /** Indentation of an item without expander: its level plus the expander's width. */
    const leafIndent = `calc(${indent} + var(--tree-exp))`;
    const contentIndent = expandable || countLoading || (placement === 'left' && !independent) ? undefined : leafIndent;

    const toggle = (event: MouseEvent) => {
        event.stopPropagation();
        setExpanded(!expanded);
        rowRef.current?.focus();
    };

    const activate = (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => {
        onTreeItemClick?.(event);
        if (selectable) tree?.toggleSelection(itemValue);
    };

    const selectionControl = (first: boolean) => (
        // the row selects; the control only shows the state, out of the tab order and the accessibility tree
        <span
            aria-hidden="true"
            className="pointer-events-none flex shrink-0 items-center [&_label]:m-0"
            style={{ marginInlineStart: first && !independent ? leafIndent : undefined }}
        >
            {selection === 'multiple' ? (
                <Checkbox checked={selected} inputProps={{ tabIndex: -1 }} />
            ) : (
                <RadioGroup value={selected ? 'selected' : null}>
                    <Radio value="selected" inputProps={{ tabIndex: -1 }} />
                </RadioGroup>
            )}
        </span>
    );

    const root = level === 1;
    const interactive = navigatable || selectable;

    return (
        <div role="none" className="block">
            <div
                {...props}
                ref={mergeRefs(rowRef, ref)}
                role="treeitem"
                id={id}
                data-tree-row=""
                tabIndex={tree?.tabbableId === id ? 0 : -1}
                aria-level={level}
                aria-setsize={position?.setSize}
                aria-posinset={position?.position}
                aria-expanded={expandable ? expanded : undefined}
                aria-selected={selectable ? selected : undefined}
                data-wrap={wrapContent || undefined}
                className={cn(
                    'group/row relative m-0 box-border flex min-h-(--tree-h) w-full items-center border-0 border-b border-solid p-0 pe-4 outline-none',
                    "focus:before:pointer-events-none focus:before:absolute focus:before:inset-0.5 focus:before:bottom-px focus:before:border-(length:--sapContent_FocusWidth) focus:before:[border-style:var(--sapContent_FocusStyle)] focus:before:border-sap-content-focus-color focus:before:content-['']",
                    root
                        ? [
                              'bg-sap-list-background',
                              tree?.noBorder ? 'border-transparent' : 'border-sap-list-border-color'
                          ]
                        : 'border-transparent bg-sap-list-alternating-background',
                    selected && 'border-sap-list-selection-border-color bg-sap-list-selection-background-color',
                    interactive && [
                        'cursor-pointer hover:bg-sap-list-hover-background active:border-sap-list-active-background active:bg-sap-list-active-background',
                        selected && 'hover:bg-sap-list-hover-selection-background'
                    ],
                    state && HIGHLIGHT[state],
                    state ? (navigated ? SHADOW.both : SHADOW.highlight) : navigated && SHADOW.navigated,
                    className
                )}
                onClick={(event) => {
                    onClick?.(event);
                    activate(event);
                }}
                onKeyDown={(event) => {
                    onKeyDown?.(event);
                    // keys on the action buttons in the row are theirs
                    if (event.target !== event.currentTarget) return;
                    if (event.key === 'Enter') activate(event);
                    else if (event.key === ' ') {
                        event.preventDefault();
                        activate(event);
                    }
                }}
                onFocus={(event) => {
                    onFocus?.(event);
                    tree?.setFocused(id);
                }}
            >
                {placement === 'left' && selectionControl(true)}
                {expandable ? (
                    <span
                        aria-hidden="true"
                        data-slot="tree-expander"
                        className="flex min-h-(--tree-exp) min-w-(--tree-exp) shrink-0 cursor-pointer items-center justify-center rounded-sap-button-border-corner-radius text-sap-button-icon-color"
                        style={{ marginInlineStart: placement === 'left' ? undefined : indent }}
                        onClick={toggle}
                    >
                        <Icon
                            glyph={expanded ? 'navigation-down-arrow' : 'navigation-right-arrow'}
                            className="text-(length:--tree-exp-icon) leading-none text-sap-button-icon-color group-active/row:text-sap-list-active-text-color"
                        />
                    </span>
                ) : (
                    countLoading && (
                        <span
                            aria-hidden="true"
                            data-slot="tree-expander"
                            className="flex min-h-(--tree-exp) min-w-(--tree-exp) shrink-0 items-center justify-center"
                            style={{ marginInlineStart: indent }}
                        >
                            <span className="block size-4 cursor-wait rounded-sm bg-sap-content-placeholderloading-background" />
                        </span>
                    )
                )}
                {placement === 'afterExpand' && expandable && selectionControl(false)}
                <div
                    data-slot="tree-item-content"
                    className={cn(
                        'm-0 box-border flex min-h-(--tree-h) w-full min-w-0 items-center p-0',
                        wrapContent ? 'whitespace-normal' : 'truncate'
                    )}
                    style={{ marginInlineStart: contentIndent }}
                >
                    {content}
                </div>
                {buttons}
                {placement === 'right' && selectionControl(false)}
                {navigatable && tree?.navigationIndicator && (
                    <Icon
                        glyph="slim-arrow-right"
                        data-slot="tree-navigation-indicator"
                        className="flex min-h-(--tree-exp) min-w-10 shrink-0 items-center justify-center text-xs leading-none text-sap-content-non-interactive-icon-color last:-me-4"
                    />
                )}
            </div>
            {expanded && (
                <div className="block">
                    <TreeParentLevelContext value={level}>
                        <ItemSet items={nested} />
                        {childrenLoading &&
                            LOADING_ROWS.map((row) => (
                                <div
                                    key={row}
                                    role="treeitem"
                                    aria-level={level + 1}
                                    aria-busy="true"
                                    aria-label={tree?.loadingLabel}
                                    className={CHILD_LOADING_ROW}
                                >
                                    <span className={TEXT_PLACEHOLDER} />
                                </div>
                            ))}
                        {tree?.renderItem && (
                            <ItemSet
                                items={dataChildren.map((child) => (
                                    <Fragment key={child.id}>{tree.renderItem!(child as TreeItemData<never>)}</Fragment>
                                ))}
                            />
                        )}
                    </TreeParentLevelContext>
                </div>
            )}
        </div>
    );
}

export interface TreeProps<T = unknown> extends Omit<ComponentProps<'div'>, 'children' | 'defaultValue' | 'onChange'> {
    /** Nested `TreeItem`s; or use `dataSource` with `renderItem`. */
    children?: ReactNode;
    /** The items of a data tree: an array, a promise or a `TreeDataSource`; `undefined` shows loading rows. */
    dataSource?: TreeAcceptableDataSource<Partial<TreeItemData<T>>>;
    /** Renders a data item, usually as a `TreeItem` with the item's `id`, `childNodes` and `defaultExpanded`. */
    renderItem?: (item: TreeItemData<T>) => ReactNode;
    /** Removes the borders between the top level items. */
    noBorder?: boolean;
    selection?: TreeSelectionType;
    /** Where the checkbox or radio button of a selectable item goes. */
    selectionPlacement?: TreeSelectionPlacement;
    /** Puts the selection controls of a left placement in one column. */
    independentSections?: boolean;
    /** Shows an arrow at the end of navigatable items. */
    navigationIndicator?: boolean;
    /** Text of the row shown when there are no items. */
    noDataText?: ReactNode;
    /** Name of the placeholder rows while items load. */
    loadingLabel?: string;
    /** The selected value (controlled): one value, or an array with multiple selection. */
    value?: unknown;
    /** The initially selected value (uncontrolled). */
    defaultValue?: unknown;
    /** Called with the selected value: one value (or null), or an array with multiple selection. */
    onValueChange?: (value: unknown) => void;
    /** Called when the data tree starts loading its items. */
    onDataRequested?: () => void;
    /** Called when the data tree received its items. */
    onDataReceived?: () => void;
}

const toArray = (value: unknown): unknown[] => (value == null ? [] : Array.isArray(value) ? [...value] : [value]);

/**
 * Tree: a hierarchy of items that expand and collapse. Nest `TreeItem`s, or pass a `dataSource` and a `renderItem`;
 * children of data items can load lazily. Items can be selected (single or multiple) and navigatable. The tree is one
 * tab stop: Up and Down move between the items, Home and End to the first and last, Right and Left expand, collapse
 * and move between parents and children (mirrored in RTL), Enter and Space select.
 *
 * ```tsx
 * <Tree aria-label="Products">
 *     <TreeItem>
 *         <TreeItemText>Laptops</TreeItemText>
 *         <TreeItem><TreeItemText>Notebook Basic</TreeItemText></TreeItem>
 *     </TreeItem>
 * </Tree>
 * ```
 */
export function Tree<T = unknown>({
    children,
    dataSource,
    renderItem,
    noBorder = false,
    selection = 'none',
    selectionPlacement = 'none',
    independentSections = false,
    navigationIndicator = false,
    noDataText = 'No data',
    loadingLabel = 'Loading',
    value,
    defaultValue,
    onValueChange,
    onDataRequested,
    onDataReceived,
    ref,
    className,
    onKeyDown,
    ...props
}: TreeProps<T>) {
    const rootRef = useRef<HTMLDivElement>(null);

    // selection
    const [uncontrolledValue, setUncontrolledValue] = useState<unknown>(defaultValue);
    const selectedValues = toArray(value !== undefined ? value : uncontrolledValue);
    const isSelected = (v: unknown) => selectedValues.includes(v);
    const toggleSelection = (v: unknown) => {
        const next = selectedValues.includes(v)
            ? selectedValues.filter((s) => s !== v)
            : selection === 'multiple'
              ? [...selectedValues, v]
              : [v];
        const output = selection === 'multiple' ? next : (next[0] ?? null);
        if (value === undefined) setUncontrolledValue(output);
        onValueChange?.(output);
    };

    // data items
    const [items, setItems] = useState<TreeItemData<T>[] | null>(null);
    const callbacks = useRef({ onDataRequested, onDataReceived });
    callbacks.current = { onDataRequested, onDataReceived };
    useLayoutEffect(() => {
        if (dataSource === undefined) return;
        let current = true;
        setItems(null);
        callbacks.current.onDataRequested?.();
        const done = (loaded: Partial<TreeItemData<T>>[]) => {
            if (!current) return;
            setItems(normalizeTreeItems(loaded));
            callbacks.current.onDataReceived?.();
        };
        const result = load(dataSource);
        if (isThenable<Partial<TreeItemData<T>>[]>(result)) result.then(done);
        else done(result);
        return () => {
            current = false;
        };
    }, [dataSource]);

    // the rendered items, for the keyboard and the tab stop
    const handles = useRef(new Map<string, { current: TreeItemHandle }>());
    // bumped when items come and go, to render the tab stop again
    const [, setRows] = useState(0);
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [firstId, setFirstId] = useState<string | null>(null);
    const register = useCallback((id: string, handle: { current: TreeItemHandle }) => {
        handles.current.set(id, handle);
        setRows((v) => v + 1);
        return () => {
            if (handles.current.get(id) === handle) handles.current.delete(id);
            setFocusedId((focused) => (focused === id ? null : focused));
            setRows((v) => v + 1);
        };
    }, []);
    const [expandedByItem, setExpandedByItem] = useState<ReadonlyMap<string, number>>(new Map());
    const reportExpanded = useCallback((id: string, level: number, expanded: boolean) => {
        setExpandedByItem((map) => {
            const current = map.get(id);
            if (expanded ? current === level : current === undefined) return map;
            const next = new Map(map);
            if (expanded) next.set(id, level);
            else next.delete(id);
            return next;
        });
    }, []);
    /** The deepest level up to which every level has an expanded item; it sets the indentation. */
    const expandedLevel = useMemo(() => {
        const levels = new Set(expandedByItem.values());
        let level = 0;
        while (levels.has(level + 1)) level++;
        return level;
    }, [expandedByItem]);

    /** The items whose rows show, in document order. */
    const visibleItems = (): TreeItemHandle[] => {
        const byRow = new Map<Element, TreeItemHandle>();
        for (const handle of handles.current.values())
            if (handle.current.row) byRow.set(handle.current.row, handle.current);
        return Array.from(rootRef.current?.querySelectorAll('[data-tree-row]') ?? [])
            .map((row) => byRow.get(row))
            .filter((item): item is TreeItemHandle => !!item);
    };

    useLayoutEffect(() => {
        const first = visibleItems()[0]?.row?.id ?? null;
        setFirstId((current) => (current === first ? current : first));
    });

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const visible = visibleItems();
        const index = visible.findIndex((item) => item.row === document.activeElement);
        if (index < 0) return;
        const item = visible[index];
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const expandKey = rtl ? 'ArrowLeft' : 'ArrowRight';
        const collapseKey = rtl ? 'ArrowRight' : 'ArrowLeft';
        const parentOf = () => {
            for (let i = index - 1; i >= 0; i--) if (visible[i].level < item.level) return visible[i];
            return undefined;
        };
        let target: TreeItemHandle | undefined;
        if (event.key === 'ArrowDown') target = visible[index + 1];
        else if (event.key === 'ArrowUp') target = visible[index - 1];
        else if (event.key === 'Home') target = visible[0];
        else if (event.key === 'End') target = visible.at(-1);
        else if (event.key === expandKey) {
            event.preventDefault();
            if (!item.expandable) return;
            if (!item.expanded) item.setExpanded(true);
            else if (visible[index + 1]?.level === item.level + 1) target = visible[index + 1];
        } else if (event.key === collapseKey) {
            event.preventDefault();
            if (item.expanded && item.expandable) item.setExpanded(false);
            else target = parentOf();
        } else return;
        event.preventDefault();
        target?.row?.focus();
    };

    const context: TreeContextValue = {
        selection,
        selectionPlacement,
        independentSections,
        navigationIndicator,
        noBorder,
        loadingLabel,
        expandedLevel,
        tabbableId: focusedId ?? firstId,
        isSelected,
        toggleSelection,
        setFocused: setFocusedId,
        register,
        reportExpanded,
        renderItem: (renderItem as TreeContextValue['renderItem']) ?? null
    };

    const noData = (
        <div role="treeitem" aria-level={1} className={cn(ROOT_ROW, 'justify-center')}>
            <span className="text-(length:--tree-font) leading-(--tree-h) text-sap-list-text-color">{noDataText}</span>
        </div>
    );

    let body: ReactNode;
    if (renderItem) {
        if (!items) {
            body = LOADING_ROWS.map((row) => (
                <div
                    key={row}
                    role="treeitem"
                    aria-level={1}
                    aria-busy="true"
                    aria-label={loadingLabel}
                    className={ROOT_ROW}
                >
                    <span className={cn(TEXT_PLACEHOLDER, 'ms-4')} />
                </div>
            ));
        } else if (items.length) {
            body = (
                <ItemSet
                    items={items.map((item) => (
                        <Fragment key={item.id}>{renderItem(item)}</Fragment>
                    ))}
                />
            );
        } else body = noData;
    } else {
        const nodes = flatten(children).filter((child): child is ReactElement => isValidElement(child));
        body = nodes.length ? <ItemSet items={nodes} /> : noData;
    }

    return (
        <div
            {...props}
            ref={mergeRefs(rootRef, ref)}
            role="tree"
            aria-multiselectable={selection === 'multiple' || undefined}
            className={cn(
                'm-0 box-border block w-full list-none p-0 font-sap-font-family text-sap-font-size text-sap-text-color',
                '[--tree-exp:2.75rem] [--tree-exp-icon:var(--sapFontLargeSize)] [--tree-h:2.75rem] [--tree-font:var(--sapFontLargeSize)]',
                'compact:[--tree-exp:2rem] compact:[--tree-exp-icon:var(--sapFontSmallSize)] compact:[--tree-h:2rem] compact:[--tree-font:var(--sapFontSize)]',
                className
            )}
            onKeyDown={handleKeyDown}
        >
            <TreeContext value={context}>
                <TreeParentLevelContext value={0}>{body}</TreeParentLevelContext>
            </TreeContext>
        </div>
    );
}
