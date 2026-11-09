/*
 * Port of fundamental-react (List) and @fundamental-ngx/core (list) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    Children,
    cloneElement,
    createContext,
    isValidElement,
    use,
    useCallback,
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Checkbox, type CheckboxProps } from '@/ui/checkbox/checkbox';
import { Icon, iconGlyphChar, type IconFont, type IconProps } from '@/ui/icon/icon';
import { Radio, type RadioProps } from '@/ui/radio/radio';

export type ListSecondaryType = 'positive' | 'critical' | 'negative' | 'informative';
export type ListBylineStatus = 'neutral' | 'positive' | 'negative' | 'critical' | 'informative';
export type ListMessageType = 'error' | 'warning' | 'success' | 'information';
export type FocusEscapeDirection = 'up' | 'down';

const STATUS_COLOR: Record<ListBylineStatus, string> = {
    neutral: 'text-sap-neutral-text-color',
    positive: 'text-sap-positive-text-color',
    negative: 'text-sap-negative-text-color',
    critical: 'text-sap-critical-text-color',
    informative: 'text-sap-informative-text-color'
};

const MESSAGE_BACKGROUND: Record<ListMessageType | 'neutral', string> = {
    neutral: 'bg-sap-neutral-background',
    error: 'bg-sap-error-background',
    warning: 'bg-sap-warning-background',
    success: 'bg-sap-success-background',
    information: 'bg-sap-information-background'
};

/** Visible focus of list items and links: an inner frame, in the contrast colour while pressed. */
const FOCUS_FRAME = [
    "focus:outline-none focus:before:pointer-events-none focus:before:absolute focus:before:inset-x-0.5 focus:before:top-0.5 focus:before:bottom-px focus:before:block focus:before:content-['']",
    'focus:before:border-(length:--sapContent_FocusWidth) focus:before:[border-style:var(--sapContent_FocusStyle)] focus:before:border-sap-content-focus-color',
    'hc:focus:active:before:border-sap-content-contrast-focus-color'
];

/**
 * Item of a dropdown list (select, combobox): `aria-selected` marks the selection, `data-active` the
 * option highlighted with aria-activedescendant and `aria-disabled` an unavailable option.
 */
export const LIST_DROPDOWN_ITEM = [
    'relative m-0 box-border flex min-h-10 list-none items-center gap-x-4 px-[0.9375rem] py-0 compact:min-h-8',
    'bg-(--li-bg) font-sap-font-family text-sap-font-size text-sap-list-text-color [--li-bg:var(--sapList_Background)]',
    'cursor-pointer outline-none [&_[data-slot=list-secondary]]:ms-auto',
    'hover:[--li-bg:var(--sapList_Hover_Background)] aria-selected:hover:[--li-bg:var(--sapList_Hover_SelectionBackground)]',
    'active:[--li-bg:var(--sapList_Active_Background)] active:text-sap-list-active-text-color aria-selected:active:[--li-bg:var(--sapList_Active_Background)]',
    'aria-selected:[--li-bg:var(--sapList_SelectionBackgroundColor)] aria-selected:border-b-(length:--sapList_BorderWidth) aria-selected:border-solid aria-selected:border-sap-list-selection-border-color',
    // keyboard focus frame of the active descendant
    "data-[active]:before:pointer-events-none data-[active]:before:absolute data-[active]:before:inset-x-0.5 data-[active]:before:top-0.5 data-[active]:before:bottom-px data-[active]:before:content-['']",
    'data-[active]:before:border-(length:--sapContent_FocusWidth) data-[active]:before:[border-style:var(--sapContent_FocusStyle)] data-[active]:before:border-sap-content-focus-color',
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-(--sapContent_DisabledOpacity) aria-disabled:hover:[--li-bg:var(--sapList_Background)] aria-disabled:active:[--li-bg:var(--sapList_Background)]'
];

/** The SAP icon font check mark of a check box. */
export const LIST_CHECK_GLYPH = '';

/**
 * A check box drawn in a multi-select dropdown option (the option carries the selection; the box is
 * hidden from assistive technology). Set `data-glyph` to `LIST_CHECK_GLYPH` when checked and add
 * `data-indeterminate` for a partial selection.
 */
export const LIST_DROPDOWN_CHECK = [
    'relative m-0 me-1 box-border inline-flex size-[1.375rem] min-w-[1.375rem] shrink-0 items-center justify-center compact:size-4 compact:min-w-4',
    'rounded-sap-field-border-corner-radius border-width-sap-field-border-width [border-style:var(--sapField_Selector_BorderStyle)] border-sap-field-border-color bg-sap-field-background',
    'font-sap-content-icon-font-family text-sap-font-size leading-[normal] text-sap-content-selected-foreground-color before:content-[attr(data-glyph)]',
    "data-[indeterminate]:after:absolute data-[indeterminate]:after:size-3 data-[indeterminate]:after:bg-sap-content-selected-foreground-color data-[indeterminate]:after:content-[''] compact:data-[indeterminate]:after:size-2"
].join(' ');

/** Hover and pressed states of interactive items and links (through the --li-* colours). */
const INTERACTIVE_STATES = [
    'cursor-pointer enabled-hover:[--li-bg:var(--sapList_Hover_Background)]',
    'data-[selected]:enabled-hover:[--li-bg:var(--sapList_Hover_SelectionBackground)]',
    'active:[--li-bg:var(--sapList_Active_Background)] active:[--li-tc:var(--sapList_Active_TextColor)] active:[--li-bc:var(--sapList_Active_Background)]',
    'data-[selected]:active:[--li-bg:var(--sapList_Active_Background)] data-[selected]:active:[--li-tc:var(--sapList_Active_TextColor)] data-[selected]:active:[--li-bc:var(--sapList_Active_Background)]',
    'active:[&_*]:[text-shadow:none]'
];

/** Keys the list moves the focus with. */
const NAVIGATION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']);
/** Items Page Up and Page Down move by, as the Angular CDK's FocusKeyManager. */
const PAGE_DELTA = 10;
/** Elements whose keys stay with them. */
const FIELD = 'input, textarea, select, [contenteditable]:not([contenteditable=false])';
/** A focusable entry of the list: an item or a group header. */
const FOCUSABLE = '[data-list-focusable]';

interface ListContextValue {
    byline: boolean;
    subline: boolean;
    selection: boolean;
    noBorder: boolean;
    navigationIndicator: boolean;
    unreadIndicator: boolean;
    wrap: boolean;
    selectedLabel: string;
    notSelectedLabel: string;
}

const ListContext = createContext<ListContextValue | null>(null);

/** The link of a navigation item, as its `ListLink` registers it. */
interface ListLinkEntry {
    element: HTMLElement;
    focusable: boolean;
}

interface ListItemContextValue {
    byline: boolean;
    wrapped: boolean;
    unread: boolean;
    noData: boolean;
    action: boolean;
    growing: boolean;
    counter: number | null | undefined;
    counterRole: string | undefined;
    counterAriaLabel: string | undefined;
    /** Enter or Space is held on the item of a link. */
    linkPressed: boolean;
    registerLink(link: ListLinkEntry): () => void;
}

const ListItemContext = createContext<ListItemContextValue | null>(null);
const ListGroupHeaderContext = createContext(false);

/** Formats a counter as Angular's `number: '1.0-2'` pipe: grouping, up to two decimals. */
function formatCounter(counter: number): string {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(counter);
}

/** Imperative actions of a list, through `actionsRef`. */
export interface ListActions {
    /** Focuses the entry (item or group header) at the index and makes it the tab stop. */
    setItemActive(index: number): void;
}

export interface ListProps extends useRender.ComponentProps<'ul'> {
    /** Items with a title and byline (larger, two-line items). fundamental-react's `hasByline`. */
    byline?: boolean;
    /** Items with a title and a subline. */
    subline?: boolean;
    /** Items with a checkbox or radio button for selection; the list becomes a `listbox` unless `role` says otherwise. */
    selection?: boolean;
    noBorder?: boolean;
    /** Reserves space for navigation arrows of link items. */
    navigationIndicator?: boolean;
    /** Reserves space for unread indicators. */
    unreadIndicator?: boolean;
    /** Leaves room for a list message (`ListMessage`) above the items. */
    hasMessage?: boolean;
    /** Titles and secondary texts wrap instead of truncating. */
    wrap?: boolean;
    /** Arrow-key navigation between items (one tab stop). */
    keyboardSupport?: boolean;
    /** Announced for selected items of a selection list. */
    selectedLabel?: string;
    /** Announced for items of a selection list that are not selected. */
    notSelectedLabel?: string;
    /** Called on Arrow Up on the first or Arrow Down on the last entry, instead of moving the focus. */
    onFocusEscapeList?: (direction: FocusEscapeDirection) => void;
    /** Imperative actions: `setItemActive(index)`. */
    actionsRef?: Ref<ListActions>;
}

/**
 * List: items with titles, secondary text, icons, bylines, links, selection controls, group headers and footers.
 * One entry is in the tab order; Arrow keys, Home, End, Page Up and Page Down move between the entries (items and
 * group headers), skipping inactive items. Renders a `<ul>`.
 *
 * ```tsx
 * <List aria-label="Fruits">
 *     <ListItem><ListTitle>Apples</ListTitle><ListSecondary>12</ListSecondary></ListItem>
 *     <ListItem interactive onSelectedChange={setPears}><ListTitle>Pears</ListTitle></ListItem>
 * </List>
 * ```
 */
export function List({
    byline = false,
    subline = false,
    selection = false,
    noBorder = false,
    navigationIndicator = false,
    unreadIndicator = false,
    hasMessage = false,
    wrap = false,
    keyboardSupport = true,
    selectedLabel = 'Selected',
    notSelectedLabel = 'Not selected',
    onFocusEscapeList,
    actionsRef,
    role,
    render,
    ref,
    className,
    onKeyDown,
    onFocus,
    ...props
}: ListProps) {
    const rootRef = useRef<HTMLUListElement>(null);
    const tabbable = useRef(0);
    const keyboard = useRef(keyboardSupport);
    keyboard.current = keyboardSupport;

    /** The items and group headers of this list (not of nested lists), in document order. */
    const focusables = useCallback((): HTMLElement[] => {
        const root = rootRef.current;
        if (!root) return [];
        return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
            (el) => el.parentElement?.closest('[data-slot=list]') === root
        );
    }, []);

    /** Keeps one entry in the tab order: the last focused one, or the first. */
    const sync = useCallback(() => {
        const items = focusables();
        const index = Math.max(Math.min(tabbable.current, items.length - 1), 0);
        items.forEach((el, i) => {
            const tabIndex = keyboard.current && i === index ? 0 : -1;
            if (el.tabIndex !== tabIndex) el.tabIndex = tabIndex;
        });
    }, [focusables]);

    const activate = useCallback(
        (index: number) => {
            focusables()[index]?.focus();
            tabbable.current = index;
            sync();
        },
        [focusables, sync]
    );

    useImperativeHandle(actionsRef, () => ({ setItemActive: activate }), [activate]);

    // after every render, and whenever entries are added or removed by their own components
    useLayoutEffect(sync);
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const observer = new MutationObserver(sync);
        observer.observe(root, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [sync]);

    const handleFocus = (event: FocusEvent<HTMLElement>) => {
        onFocus?.(event as FocusEvent<HTMLUListElement>);
        const index = focusables().findIndex((el) => el.contains(event.target));
        if (index < 0) return;
        tabbable.current = index;
        sync();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event as KeyboardEvent<HTMLUListElement>);
        if (!keyboardSupport || event.defaultPrevented) return;
        // keys typed in a field inside an item stay with the field
        if ((event.target as HTMLElement).matches?.(FIELD)) return;
        const items = focusables();
        const current = items.findIndex((el) => el.contains(document.activeElement));
        if (current < 0) return;
        if (event.key === 'ArrowUp' && current === 0) {
            onFocusEscapeList?.('up');
            return;
        }
        if (event.key === 'ArrowDown' && current === items.length - 1) {
            onFocusEscapeList?.('down');
            return;
        }
        if (!NAVIGATION_KEYS.has(event.key) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }
        event.preventDefault();
        const last = items.length - 1;
        const [start, step] = {
            ArrowUp: [current - 1, -1],
            ArrowDown: [current + 1, 1],
            Home: [0, 1],
            End: [last, -1],
            PageUp: [Math.max(current - PAGE_DELTA, 0), 1],
            PageDown: [Math.min(current + PAGE_DELTA, last), -1]
        }[event.key]!;
        // the first entry from start in the direction of step that is not inactive
        for (let i = start; i >= 0 && i <= last; i += step) {
            if (!items[i].hasAttribute('data-inactive')) {
                activate(i);
                return;
            }
        }
    };

    const context = useMemo<ListContextValue>(
        () => ({
            byline,
            subline,
            selection,
            noBorder,
            navigationIndicator,
            unreadIndicator,
            wrap,
            selectedLabel,
            notSelectedLabel
        }),
        [
            byline,
            subline,
            selection,
            noBorder,
            navigationIndicator,
            unreadIndicator,
            wrap,
            selectedLabel,
            notSelectedLabel
        ]
    );

    const element = useRender({
        render,
        defaultTagName: 'ul',
        ref: ref ? [rootRef, ref] : rootRef,
        props: {
            ...props,
            role: role ?? (selection ? 'listbox' : 'list'),
            'data-slot': 'list',
            onKeyDown: handleKeyDown,
            onFocus: handleFocus,
            className: cn(
                'relative m-0 box-border w-full max-w-full list-none p-0 font-sap-font-family text-sap-font-size',
                '[--li-fs:var(--sapFontLargeSize)] compact:[--li-fs:var(--sapFontSize)] [--li-ifs:1.125rem] compact:[--li-ifs:1rem]',
                '[--li-h:var(--sapElement_LineHeight)] compact:[--li-h:var(--sapElement_Compact_LineHeight)]',
                hasMessage && 'pt-8',
                className
            )
        }
    });
    return <ListContext value={context}>{element}</ListContext>;
}

type ControlElement = ReactElement<CheckboxProps> | ReactElement<RadioProps>;

/** The checkbox or radio button among the direct children of an item. */
function isControl(child: ReactNode): child is ControlElement {
    return isValidElement(child) && (child.type === Checkbox || child.type === Radio);
}

export interface ListItemProps extends useRender.ComponentProps<'li'> {
    /** Selection of interactive items (controlled). Items with a checkbox or radio button follow their control. */
    selected?: boolean;
    /** Initial selection of interactive items (uncontrolled). */
    defaultSelected?: boolean;
    /** Called with the new selection when the user toggles an interactive item. */
    onSelectedChange?: (selected: boolean) => void;
    /** Clickable item with hover and pressed states that toggles its selection on click, Enter and Space. */
    interactive?: boolean;
    /** Unavailable item: no pointer events, skipped by the arrow keys. */
    inactive?: boolean;
    /** Placeholder item ("No data") with a centered title. */
    noData?: boolean;
    /** Item that holds an action button (a `ListTitle` rendered as a `<button>`). */
    action?: boolean;
    /** "More" item that loads further items. */
    growing?: boolean;
    /** Bold title and, in byline lists, an unread dot. */
    unread?: boolean;
    /** Byline layout for this item only. */
    byline?: boolean;
    /** Wraps the title and secondary text of this item. */
    wrap?: boolean;
    /** Shows a check mark after the content (e.g. the current entry). */
    active?: boolean;
    /** Number shown at the end of the item (or of its link). */
    counter?: number | null;
    /** Role of the counter. */
    counterRole?: string;
    /** Accessible name of the counter. */
    counterAriaLabel?: string;
    /** Ignores clicks (no selection toggling). */
    preventClick?: boolean;
}

/**
 * List item. Interactive items toggle their selection on click, Enter and Space; items with a `Checkbox` or `Radio`
 * as a direct child are options (`role="option"`, `aria-selected`) that toggle or select their control, which is
 * then only visual (inert); items with a `ListLink` open it with Enter and Space.
 */
export function ListItem({
    selected: selectedProp,
    defaultSelected = false,
    onSelectedChange,
    interactive = false,
    inactive = false,
    noData = false,
    action = false,
    growing = false,
    unread = false,
    byline: bylineProp = false,
    wrap: wrapProp = false,
    active = false,
    counter,
    counterRole,
    counterAriaLabel,
    preventClick = false,
    id: idProp,
    role: roleProp,
    render,
    ref,
    className,
    children,
    onClick,
    onKeyDown,
    onKeyUp,
    onFocus,
    ...props
}: ListItemProps) {
    const list = use(ListContext);
    const autoId = useId();
    const id = idProp ?? `fd-list-item-${autoId}`;
    const controlRef = useRef<HTMLDivElement>(null);
    /** Set while the item clicks its control, so that click is not handled again. */
    const forwarding = useRef(false);

    const [uncontrolled, setUncontrolled] = useState(defaultSelected);
    const [controlChecked, setControlChecked] = useState(false);
    const [link, setLink] = useState<ListLinkEntry | null>(null);
    const [linkPressed, setLinkPressed] = useState(false);

    const items = Children.toArray(children);
    const controlIndex = items.findIndex(isControl);
    const control = controlIndex >= 0 ? (items[controlIndex] as ControlElement) : null;
    const content = control ? items.filter((_, i) => i !== controlIndex) : children;

    const role = roleProp ?? (control ? 'option' : 'listitem');
    const isSelected = control ? controlChecked : (selectedProp ?? uncontrolled);
    const isByline = bylineProp || !!list?.byline;
    const isWrapped = wrapProp || !!list?.wrap;
    const selection = !!list?.selection;

    // the selection of a control item is the checked state of its control
    useLayoutEffect(() => {
        const wrapper = controlRef.current;
        if (!wrapper) return;
        const read = () =>
            setControlChecked(
                wrapper.querySelector('[data-slot=checkbox], [data-slot=radio]')?.getAttribute('aria-checked') ===
                    'true'
            );
        read();
        const observer = new MutationObserver(read);
        observer.observe(wrapper, { attributes: true, attributeFilter: ['aria-checked'], subtree: true });
        return () => observer.disconnect();
    }, [control != null]);

    const registerLink = useCallback((entry: ListLinkEntry) => {
        setLink(entry);
        return () => setLink((current) => (current === entry ? null : current));
    }, []);

    /** The control's interactive element, unless it is disabled. */
    const enabledControl = (): HTMLElement | null => {
        const el = controlRef.current?.querySelector<HTMLElement>('[data-slot=checkbox], [data-slot=radio]');
        return el && !el.hasAttribute('data-disabled') ? el : null;
    };

    const toggleControl = (el: HTMLElement) => {
        forwarding.current = true;
        try {
            el.click();
        } finally {
            forwarding.current = false;
        }
    };

    const toggleSelected = () => {
        const next = !isSelected;
        if (selectedProp === undefined) setUncontrolled(next);
        onSelectedChange?.(next);
    };

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        if (forwarding.current) return;
        onClick?.(event as MouseEvent<HTMLLIElement>);
        if (preventClick) return;
        const target = event.target as Element;
        if (control && !link) {
            const el = enabledControl();
            // a click on the control itself (when it is not inert) already changed it
            if (el && !controlRef.current!.contains(target)) toggleControl(el);
            return;
        }
        if (interactive && !isInsideControl(target, event.currentTarget)) toggleSelected();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event as KeyboardEvent<HTMLLIElement>);
        if (event.defaultPrevented) return;
        if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
            const el = control ? enabledControl() : null;
            if (el) toggleControl(el);
            else if (control && !link) {
                // a disabled control: nothing to change
            } else if (interactive) toggleSelected();
            else if (link) setLinkPressed(true);
            else return;
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const handleKeyUp = (event: KeyboardEvent<HTMLElement>) => {
        onKeyUp?.(event as KeyboardEvent<HTMLLIElement>);
        if ((event.key === 'Enter' || event.key === ' ') && link && linkPressed) {
            setLinkPressed(false);
            link.element.click();
            event.preventDefault();
        }
    };

    const handleFocus = (event: FocusEvent<HTMLElement>) => {
        onFocus?.(event as FocusEvent<HTMLLIElement>);
        if (event.target === event.currentTarget && link?.focusable) link.element.focus();
    };

    const context = useMemo<ListItemContextValue>(
        () => ({
            byline: isByline,
            wrapped: isWrapped,
            unread,
            noData,
            action,
            growing,
            counter,
            counterRole,
            counterAriaLabel,
            linkPressed,
            registerLink
        }),
        [
            isByline,
            isWrapped,
            unread,
            noData,
            action,
            growing,
            counter,
            counterRole,
            counterAriaLabel,
            linkPressed,
            registerLink
        ]
    );

    const hasLink = !!link;
    const element = useRender({
        render,
        defaultTagName: 'li',
        ref,
        props: {
            ...props,
            id,
            role,
            tabIndex: -1,
            'data-slot': 'list-item',
            'data-list-focusable': '',
            'data-inactive': inactive ? '' : undefined,
            'data-selected': isSelected ? '' : undefined,
            'aria-selected': role === 'option' ? isSelected : undefined,
            'aria-describedby': selection ? `${id}-selection` : props['aria-describedby'],
            onClick: handleClick,
            onKeyDown: handleKeyDown,
            onKeyUp: handleKeyUp,
            onFocus: handleFocus,
            className: cn(
                'relative m-0 box-border flex items-center bg-(--li-bg) font-sap-font-family text-sap-font-size',
                'h-(--li-h) border-b-(length:--li-bw) border-solid border-(--li-bc)',
                '[--li-bg:var(--sapList_Background)] [--li-tc:var(--sapList_TextColor)] [--li-bc:var(--sapList_BorderColor)] [--li-bw:var(--sapList_BorderWidth)]',
                // avatars and buttons (other than an action title) next to the title
                'px-[0.9375rem] py-0 [&>[data-slot=avatar]:first-child]:me-3 [&>button:not([data-slot=list-title])]:ms-0.5 [&>button:not([data-slot=list-title])]:self-center',
                FOCUS_FRAME,
                // selected: any item
                'data-[selected]:[--li-bg:var(--sapList_SelectionBackgroundColor)] data-[selected]:[--li-bc:var(--sapList_SelectionBorderColor)]',
                (interactive || selection) && !hasLink && INTERACTIVE_STATES,
                list?.noBorder && '[--li-bw:0] data-[selected]:[--li-bw:var(--sapList_BorderWidth)]',
                isWrapped && 'h-auto min-h-(--li-h)',
                'has-[[data-list-wrap]]:h-auto has-[[data-list-wrap]]:min-h-(--li-h)',
                selection && 'ps-11',
                isByline && [
                    'h-auto min-h-20 w-full items-start px-4 py-[0.9375rem]',
                    selection && 'ps-11',
                    list?.unreadIndicator && 'ps-[2.125rem]',
                    list?.noBorder && 'py-2 first:pt-[0.9375rem] last:pb-[0.9375rem]'
                ],
                list?.subline && 'h-auto min-h-[4.5rem] gap-3 px-4 py-2',
                hasLink && 'p-0',
                action && [
                    'p-0 text-center [--li-h:var(--sapElement_LineHeight)] compact:[--li-h:var(--sapElement_Compact_LineHeight)]',
                    'first:border-t first:border-sap-list-border-color hc:[--li-bw:0] hc:first:border-t-0'
                ],
                growing && 'compact:[--li-h:var(--sapElement_LineHeight)] [--li-h:var(--sapElement_LineHeight)]',
                inactive && 'pointer-events-none',
                className
            ),
            children: (
                <>
                    {control && (
                        // options carry the selection themselves; the control is only visual
                        <div
                            ref={controlRef}
                            inert={role === 'option'}
                            className={cn(
                                'm-0 flex items-center',
                                selection && [
                                    'absolute start-0 top-0 z-[5] compact:start-1.5',
                                    isByline ? 'top-[0.3125rem] compact:top-2' : isWrapped && 'top-1/2 -translate-y-1/2'
                                ]
                            )}
                        >
                            {cloneElement(control, {
                                // reached through the item, not with Tab
                                inputProps: { ...control.props.inputProps, tabIndex: -1 }
                            } as Partial<CheckboxProps>)}
                        </div>
                    )}
                    {selection && (
                        <span className="sr-only-sap" id={`${id}-selection`} aria-hidden="true">
                            {isSelected ? list!.selectedLabel : list!.notSelectedLabel}
                        </span>
                    )}
                    {unread && (!list || list.byline) && (
                        <Icon
                            glyph="circle-task-2"
                            className="absolute start-4 top-1/2 -translate-y-1/2 text-[0.375rem] leading-none text-sap-accent-color6"
                        />
                    )}
                    {content}
                    {counter != null && !hasLink && (
                        <span
                            className={cn(
                                'm-0 ms-4 shrink-0 truncate p-0 text-sap-content-marker-text-color',
                                isByline && 'flex h-full min-w-8 items-center justify-end self-center'
                            )}
                            role={counterRole}
                            aria-label={counterAriaLabel}
                        >
                            {formatCounter(counter)}
                        </span>
                    )}
                    {active && (
                        <Icon glyph="sys-enter-2" className="ms-2 text-sap-content-non-interactive-icon-color" />
                    )}
                </>
            )
        }
    });
    return <ListItemContext value={context}>{element}</ListItemContext>;
}

/** A button, link or field inside the item (not the item itself). */
function isInsideControl(target: Element, item: Element): boolean {
    const control = target.closest?.('button, a, input, textarea, select');
    return !!control && control !== item && item.contains(control);
}

export interface ListTitleProps extends useRender.ComponentProps<'span'> {
    /** Wraps the title instead of truncating it. */
    wrap?: boolean;
    /** Scope of search results (smaller, label coloured). */
    scope?: boolean;
}

/**
 * Title of a list item. Renders a `<span>`; `render={<button type="button" />}` gives the button of an action item,
 * `render={<div />}` a block title in byline content.
 */
export function ListTitle({ wrap = false, scope = false, render, className, ...props }: ListTitleProps) {
    const list = use(ListContext);
    const item = use(ListItemContext);
    const inGroupHeader = use(ListGroupHeaderContext);
    const wrapped = wrap || !!item?.wrapped;
    const byline = !!item?.byline;
    const anchor = isValidElement(render) && render.type === 'a';

    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            tabIndex: anchor ? -1 : undefined,
            ...props,
            'data-slot': 'list-title',
            'data-list-wrap': wrap ? '' : undefined,
            className: inGroupHeader
                ? cn(
                      'm-0 truncate p-0 font-sap-font-header-family text-sap-font-header6-size leading-8 font-bold text-sap-list-table-group-header-text-color',
                      wrapped && 'whitespace-normal break-words',
                      className
                  )
                : cn(
                      'pointer-events-none m-0 min-h-(--li-fs) flex-[3_3_10%] truncate p-0 text-(length:--li-fs) leading-[normal] text-(--li-tc) [&:last-child:first-child]:basis-auto',
                      wrapped && ['whitespace-normal break-words', !byline && 'my-3'],
                      byline && 'min-h-4',
                      item?.unread && 'font-bold',
                      item?.noData && 'text-center',
                      list?.subline &&
                          'w-full max-w-full font-sap-font-semibold-duplex-family text-sap-font-size leading-[normal] text-sap-list-text-color not-italic',
                      scope && 'text-sap-font-size leading-[normal] text-sap-content-label-color',
                      item?.growing && 'flex items-center justify-center gap-2',
                      item?.action && [
                          // Horizon: the whole item is the button; high contrast: an inset bordered button
                          'pointer-events-auto m-0 h-full w-full cursor-pointer rounded-none border-0 bg-transparent px-[0.9375rem] py-0 text-sap-button-text-color',
                          'hc:m-1 hc:h-10 hc:rounded-[0.375rem] hc:border hc:border-solid hc:border-sap-list-border-color compact:hc:h-[1.625rem]',
                          'enabled-hover:bg-sap-list-hover-background active:bg-sap-list-active-background active:text-sap-list-active-text-color',
                          'focus:outline-sap focus:-outline-offset-2 hc:active:focus:outline-sap-content-contrast-focus-color'
                      ],
                      className
                  )
        }
    });
}

export type ListTitleTextProps = useRender.ComponentProps<'span'>;

/** Text inside a title, e.g. the label of a growing item. */
export function ListTitleText({ render, className, ...props }: ListTitleTextProps) {
    const item = use(ListItemContext);
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            'data-slot': 'list-title-text',
            className: cn(
                'm-0 flex items-center truncate p-0 text-sap-font-size text-inherit [text-shadow:inherit]',
                item?.growing && 'font-bold',
                className
            )
        }
    });
}

export interface ListSecondaryProps extends useRender.ComponentProps<'span'> {
    /** Status colour of the text. */
    type?: ListSecondaryType | null;
    /** Wraps the text instead of truncating it. */
    wrap?: boolean;
}

/** Secondary text at the end of a list item, optionally coloured by status. */
export function ListSecondary({ type, wrap = false, render, className, ...props }: ListSecondaryProps) {
    const item = use(ListItemContext);
    const wrapped = wrap || !!item?.wrapped;
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            'data-slot': 'list-secondary',
            'data-list-wrap': wrap ? '' : undefined,
            className: cn(
                'pointer-events-none m-0 max-w-[40%] truncate p-0 ps-4 text-end text-sap-font-size leading-[normal]',
                STATUS_COLOR[type ?? 'neutral'],
                wrapped && ['whitespace-normal break-words', !item?.byline && 'my-3'],
                className
            )
        }
    });
}

export interface ListIconProps extends Omit<IconProps, 'size' | 'color' | 'background'> {
    /** Icon font of the glyph (fundamental-react's and Angular's `glyphFont`). */
    font?: IconFont;
}

/** Icon of a list item, before or after the title (decorative). */
export function ListIcon({ glyph, font = 'SAP-icons', className, ...props }: ListIconProps) {
    const list = use(ListContext);
    return (
        <Icon
            {...props}
            glyph={glyph}
            font={font}
            data-slot="list-icon"
            className={cn(
                // leading-none after the size: tailwind-merge drops a line height that comes before a font size
                'pointer-events-none flex w-11 flex-[0_0_auto] items-center justify-center bg-inherit text-(length:--li-ifs) leading-none text-sap-content-non-interactive-icon-color',
                'first:-ms-4 [[data-slot=list-title]~&]:-me-4',
                list?.navigationIndicator && 'last:m-0',
                className
            )}
        />
    );
}

export interface ListLinkProps extends useRender.ComponentProps<'a'> {
    /** Navigation arrow at the end. */
    navigationIndicator?: boolean;
    /** Marks the currently shown target. */
    navigated?: boolean;
    /** The item forwards its focus to the link. */
    focusable?: boolean;
}

/**
 * Link filling a list item; the item becomes a navigation item and opens it with Enter or Space. Renders an `<a>`;
 * `render` renders a router link.
 */
export function ListLink({
    navigationIndicator = false,
    navigated = false,
    focusable = false,
    render,
    ref,
    className,
    children,
    ...props
}: ListLinkProps) {
    const list = use(ListContext);
    const item = use(ListItemContext);
    const linkRef = useRef<HTMLAnchorElement>(null);
    const register = item?.registerLink;
    useLayoutEffect(() => {
        if (!register || !linkRef.current) return;
        return register({ element: linkRef.current, focusable });
    }, [register, focusable]);

    const byline = !!item?.byline;
    const selection = !!list?.selection;
    const unread = !!list?.unreadIndicator;
    const indication = !!list?.navigationIndicator;
    const counter = item?.counter;

    return useRender({
        render,
        defaultTagName: 'a',
        ref: ref ? [linkRef, ref] : linkRef,
        props: {
            tabIndex: -1,
            ...props,
            'data-slot': 'list-link',
            'data-nav-glyph': navigationIndicator ? iconGlyphChar('navigation-right-arrow') : undefined,
            className: cn(
                'relative m-0 box-border flex h-full w-full items-center bg-(--li-bg) text-(--li-tc) no-underline',
                'border-b-(length:--sapList_BorderWidth) border-solid border-transparent [--li-bc:transparent] hover:border-sap-list-border-color',
                'ps-[0.9375rem] pe-[0.9375rem]',
                INTERACTIVE_STATES,
                item?.linkPressed &&
                    '[--li-bg:var(--sapList_Active_Background)] [--li-tc:var(--sapList_Active_TextColor)]',
                FOCUS_FRAME,
                unread && 'ps-[2.125rem]',
                selection && 'ps-11',
                byline && ['px-4 py-[0.9375rem]', unread && 'ps-[2.125rem]', selection && 'ps-11'],
                indication && 'pe-0',
                navigationIndicator
                    ? [
                          'after:flex after:h-full after:min-w-10 after:items-center after:justify-center after:content-[attr(data-nav-glyph)]',
                          'after:font-sap-content-icon-font-family after:text-sap-font-large-size after:text-sap-content-non-interactive-icon-color after:no-underline rtl:after:-scale-x-100'
                      ]
                    : indication && "after:min-w-10 after:content-['']",
                navigated &&
                    '[--li-nav:var(--sapList_SelectionBorderColor)] [box-shadow:inset_-0.1875rem_0_0_0_var(--li-nav)] rtl:[box-shadow:inset_0.1875rem_0_0_0_var(--li-nav)]',
                className
            ),
            children: (
                <>
                    {children}
                    {counter != null && (
                        <span
                            className="m-0 ms-4 shrink-0 truncate p-0 text-sap-content-marker-text-color"
                            role={item?.counterRole}
                            aria-label={item?.counterAriaLabel}
                        >
                            {formatCounter(counter)}
                        </span>
                    )}
                </>
            )
        }
    });
}

export type ListGroupHeaderProps = useRender.ComponentProps<'li'>;

/**
 * Header of a group of items: a focusable list item, unless its role is `presentation` or `none` (e.g. in a
 * listbox). Put a `ListTitle` in it.
 */
export function ListGroupHeader({ id: idProp, role = 'listitem', render, className, ...props }: ListGroupHeaderProps) {
    const list = use(ListContext);
    const autoId = useId();
    const presentational = role === 'presentation' || role === 'none';
    const element = useRender({
        render,
        defaultTagName: 'li',
        props: {
            ...props,
            id: idProp ?? `fd-list-group-header-${autoId}`,
            role,
            tabIndex: presentational ? undefined : -1,
            'data-slot': 'list-group-header',
            'data-list-focusable': presentational ? undefined : '',
            className: cn(
                'relative m-0 box-border flex h-sap-element-line-height items-end px-[0.9375rem] py-0',
                'border-b-(length:--sapList_BorderWidth) border-solid border-sap-list-group-header-border-color bg-sap-list-group-header-background',
                list?.noBorder && 'border-b-0',
                FOCUS_FRAME,
                className
            )
        }
    });
    return <ListGroupHeaderContext value={true}>{element}</ListGroupHeaderContext>;
}

export interface ListFooterProps extends useRender.ComponentProps<'li'> {
    /** Alignment of the footer content. */
    align?: 'start' | 'end' | null;
}

/** Footer of a list. Renders an `<li>` for the end of the list; `render={<div />}` for a footer after it. */
export function ListFooter({ align, render, className, ...props }: ListFooterProps) {
    return useRender({
        render,
        defaultTagName: 'li',
        props: {
            ...props,
            'data-slot': 'list-footer',
            className: cn(
                'm-0 box-border flex h-8 items-center bg-sap-list-footer-background px-[0.9375rem] py-0 text-sap-font-size text-sap-list-footer-text-color',
                align === 'end' && 'justify-end',
                align === 'start' && 'justify-start',
                className
            )
        }
    });
}

export interface ListMessageProps extends useRender.ComponentProps<'li'> {
    /** Message type: the background colour. */
    type?: ListMessageType | null;
}

/** Message bar above the items (set `hasMessage` on the list). */
export function ListMessage({ type, render, className, ...props }: ListMessageProps) {
    return useRender({
        render,
        defaultTagName: 'li',
        props: {
            ...props,
            'data-slot': 'list-message',
            className: cn(
                'absolute start-0 top-0 m-0 box-border h-8 w-full truncate p-0 ps-2 text-sap-font-small-size leading-8',
                MESSAGE_BACKGROUND[type ?? 'neutral'],
                className
            )
        }
    });
}

export type ListContentProps = useRender.ComponentProps<'div'>;

/** Content column of byline and subline items (title above the byline or subline). */
export function ListContent({ render, className, ...props }: ListContentProps) {
    const list = use(ListContext);
    const item = use(ListItemContext);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-slot': 'list-content',
            className: cn(
                list?.subline
                    ? [
                          'm-0 flex flex-1 flex-col items-start justify-center gap-1 overflow-hidden p-0',
                          item?.wrapped && 'overflow-visible'
                      ]
                    : 'pointer-events-none m-0 box-border flex h-full min-h-12 min-w-12 flex-[1_1_auto] flex-col content-between px-0 py-0.5',
                className
            )
        }
    });
}

export interface ListBylineProps extends useRender.ComponentProps<'div'> {
    /** Splits the byline into `ListBylineLeft` and `ListBylineRight` (fundamental-react's `twoColumns`). */
    twoCol?: boolean;
    /** Wraps the byline instead of truncating it. */
    wrap?: boolean;
}

/** Second line of a byline item. */
export function ListByline({ twoCol = false, wrap = false, render, className, ...props }: ListBylineProps) {
    const item = use(ListItemContext);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-slot': 'list-byline',
            'data-list-wrap': wrap ? '' : undefined,
            className: cn(
                'm-0 truncate p-0 pt-3 text-sap-font-size leading-4 text-sap-content-label-color',
                twoCol && 'pointer-events-auto flex',
                (wrap || item?.wrapped) && 'block whitespace-normal break-words',
                className
            )
        }
    });
}

export interface ListBylineLeftProps extends useRender.ComponentProps<'div'> {
    wrap?: boolean;
}

/** Start column of a two-column byline. */
export function ListBylineLeft({ wrap = false, render, className, ...props }: ListBylineLeftProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-slot': 'list-byline-left',
            className: cn(
                'm-0 w-[60%] self-end truncate p-0 pe-2 leading-4 text-sap-content-label-color',
                wrap && 'inline w-full whitespace-normal p-0',
                className
            )
        }
    });
}

export interface ListBylineRightProps extends useRender.ComponentProps<'div'> {
    /** Status colour of the text. */
    status?: ListBylineStatus | null;
    wrap?: boolean;
}

/** End column of a two-column byline, optionally coloured by status. */
export function ListBylineRight({ status, wrap = false, render, className, ...props }: ListBylineRightProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-slot': 'list-byline-right',
            className: cn(
                'm-0 w-[40%] self-end truncate p-0 ps-2 text-end leading-4',
                status ? STATUS_COLOR[status] : 'text-sap-content-label-color',
                wrap && 'float-right inline w-auto whitespace-normal p-0 rtl:float-left',
                className
            )
        }
    });
}

export type ListThumbnailProps = useRender.ComponentProps<'span'>;

/** Thumbnail (icon, image or avatar) of a byline item. */
export function ListThumbnail({ render, className, ...props }: ListThumbnailProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            'data-slot': 'list-thumbnail',
            className: cn(
                'pointer-events-none m-0 me-3 box-border flex size-12 min-h-12 min-w-12 max-w-12 items-center justify-center rounded-sm p-0 text-[2rem] text-sap-content-non-interactive-icon-color [&>svg]:h-full',
                // icons take the thumbnail size (2rem), not their own default size
                '[&>[data-glyph]]:text-[2rem]',
                className
            )
        }
    });
}

export interface ListSublineProps extends useRender.ComponentProps<'div'> {
    wrap?: boolean;
}

/** Second line of a subline item. */
export function ListSubline({ wrap = false, render, className, ...props }: ListSublineProps) {
    const item = use(ListItemContext);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-slot': 'list-subline',
            'data-list-wrap': wrap ? '' : undefined,
            className: cn(
                'm-0 w-full max-w-full truncate p-0 font-sap-font-family text-sap-font-size leading-[normal] text-sap-content-label-color not-italic',
                (wrap || item?.wrapped) && 'whitespace-normal break-words',
                className
            )
        }
    });
}
