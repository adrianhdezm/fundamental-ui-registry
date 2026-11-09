/*
 * Port of fundamental-react (Tabs) and @fundamental-ngx/core (tabs) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import {
    Children,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Icon, iconGlyphChar, type IconFont } from '@/ui/icon/icon';
import { Menu, MenuItem, MenuPopup, MenuTitle, MenuTrigger } from '@/ui/menu/menu';
import { OverflowItem, OverflowLayout } from '@/ui/overflow-layout/overflow-layout';
import { useScrollSpy } from '@/ui/scroll-spy/scroll-spy';

export type TabModes = 'icon-only' | 'process' | 'filter';
export type TabSizes = 's' | 'm' | 'l' | 'xl' | 'xxl';
export type TabItemState = 'success' | 'error' | 'warning' | 'information' | 'neutral';

/** What the parts of tabs know about their container (Angular's `FD_TABS`). */
interface TabsContextValue {
    mode: TabModes | null | undefined;
    stackContent: boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

/** The mode of the tab list or tab nav the part renders in. */
const useMode = () => useContext(TabsContext)?.mode;

/* ------------------------------------------------------------------------------------------------------------------
 * Classes
 * ---------------------------------------------------------------------------------------------------------------- */

/** The selection bar under a tab: shown while its tab (`group/tab`) is selected. */
const SELECTION_BAR = [
    "after:absolute after:-start-[0.1875rem] after:inline-block after:h-[0.188rem] after:w-[calc(100%+0.375rem)] after:rounded-t-[0.125rem] after:content-['']",
    'after:transition-all after:duration-150 after:ease-in hc:after:h-[0.313rem]',
    'group-aria-selected/tab:after:bg-(--tab-bar,var(--sapContent_Selected_ForegroundColor))'
].join(' ');

/** The focus frame of a tab, drawn around its tag or icon. */
const FOCUS_FRAME =
    "group-focus-visible/tab:before:absolute group-focus-visible/tab:before:inset-0 group-focus-visible/tab:before:content-[''] group-focus-visible/tab:before:outline-(length:--sapContent_FocusWidth) group-focus-visible/tab:before:[outline-style:var(--sapContent_FocusStyle)] group-focus-visible/tab:before:outline-sap-content-focus-color group-focus-visible/tab:before:outline-offset-(--sapContent_FocusWidth)";

/** Colours of a tab with a value state: text (the readable text colour), icon and selection bar. */
const STATE_VARS: Record<TabItemState, string> = {
    success:
        '[--tab-tag:var(--sapPositiveTextColor)] [--tab-tag-selected:var(--sapPositiveTextColor)] [--tab-icon:var(--sapSuccessColor)] [--tab-bar:var(--sapSuccessColor)]',
    error: '[--tab-tag:var(--sapNegativeTextColor)] [--tab-tag-selected:var(--sapNegativeTextColor)] [--tab-icon:var(--sapErrorColor)] [--tab-bar:var(--sapErrorColor)]',
    warning:
        '[--tab-tag:var(--sapCriticalTextColor)] [--tab-tag-selected:var(--sapCriticalTextColor)] [--tab-icon:var(--sapWarningColor)] [--tab-bar:var(--sapWarningColor)]',
    information:
        '[--tab-tag:var(--sapInformativeTextColor)] [--tab-tag-selected:var(--sapInformativeTextColor)] [--tab-icon:var(--sapInformationColor)] [--tab-bar:var(--sapInformationColor)]',
    neutral:
        '[--tab-tag:var(--sapNeutralTextColor)] [--tab-tag-selected:var(--sapNeutralTextColor)] [--tab-icon:var(--sapNeutralColor)] [--tab-bar:var(--sapNeutralColor)]'
};

/** Classes of a tab bar. */
function tabBarClass(size: TabSizes, className?: string): string {
    return cn(
        'm-0 flex items-center bg-sap-object-header-background p-0 font-sap-font-family text-sap-font-size text-sap-content-label-color [box-shadow:var(--sapContent_HeaderShadow)]',
        size === 's' ? 'px-4' : size === 'xl' || size === 'xxl' ? 'px-12' : 'px-8',
        className
    );
}

/** Classes of a tab (the `TabLink`, or the Base UI tab of a `TabList`). */
function tabLinkClass(mode: TabModes | null | undefined, className?: string): string {
    return cn(
        'group/tab relative m-0 block cursor-pointer px-3 py-[0.875rem] leading-4 text-sap-content-label-color no-underline outline-none',
        (mode === 'icon-only' || mode === 'process') && 'py-4',
        mode === 'process' && 'flex items-center px-0',
        mode === 'filter' && [
            'flex h-(--tabs-filter-height) flex-col items-center justify-center px-[0.188rem] pt-[0.875rem] pb-[0.625rem] text-center',
            '[--tabs-filter-height:5.5rem] compact:[--tabs-filter-height:4.75rem]',
            SELECTION_BAR,
            'after:bottom-0'
        ],
        className
    );
}

/**
 * The first item of a tab bar has no start margin and its tab no start padding; without a mode the tab starts
 * 0.1875rem in (fundamental-styles' `.fd-tabs__item:first-child`).
 */
const FIRST_ITEM = 'ms-0 [&>[role=tab]]:ps-0';
const FIRST_ITEM_INLINE = '[&>[role=tab]]:ms-[0.1875rem]';

interface TabItemClassOptions {
    mode: TabModes | null | undefined;
    tabItemState?: TabItemState | null;
    header?: boolean;
    disabled?: boolean;
    /** Whether it is the first item; `undefined` decides with `:first-child`. */
    first?: boolean;
    className?: string;
}

function tabItemClass({ mode, tabItemState, header, disabled, first, className }: TabItemClassOptions): string {
    return cn(
        'relative m-0 mx-1 shrink-0 p-0',
        first === undefined && 'first:ms-0 [&:first-child>[role=tab]]:ps-0',
        first === undefined && !mode && '[&:first-child>[role=tab]]:ms-[0.1875rem]',
        first && FIRST_ITEM,
        first && !mode && FIRST_ITEM_INLINE,
        mode === 'process' && 'my-0 ms-0 me-1 flex items-center',
        mode === 'filter' && ['m-0 px-1 py-0', header ? 'w-auto' : 'w-[5.375rem]'],
        tabItemState && STATE_VARS[tabItemState],
        disabled && 'pointer-events-none opacity-(--sapContent_DisabledOpacity)',
        className
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Parts
 * ---------------------------------------------------------------------------------------------------------------- */

/** The text of a tab, with the selection bar (Angular's `fdTabTag`). */
export function TabTag({ className, ...props }: ComponentProps<'span'>) {
    return (
        <span
            {...props}
            className={cn(
                'relative m-0 inline-block p-0 leading-4 whitespace-nowrap text-(--tab-tag,var(--sapTextColor)) group-aria-selected/tab:text-(--tab-tag-selected,var(--sapContent_Selected_ForegroundColor)) after:-bottom-[0.875rem]',
                SELECTION_BAR,
                FOCUS_FRAME,
                className
            )}
        />
    );
}

/** A count of a tab (Angular's `fdTabCount`): above the tag, or at the top end of the round icon. */
export function TabCount({ className, ...props }: ComponentProps<'span'>) {
    const mode = useMode();
    return (
        <span
            {...props}
            className={cn(
                'm-0 p-0 pb-0.5 leading-4 text-sap-content-label-color',
                // the line height after the font size: tailwind-merge drops one that comes before
                mode && 'text-sap-font-small-size leading-4',
                (mode === 'icon-only' || mode === 'filter') && 'absolute start-[calc(100%+0.1875rem)] top-0',
                className
            )}
        />
    );
}

export interface TabIconProps extends ComponentProps<'span'> {
    /** Glyph of the icon. */
    icon?: string | null;
    iconFont?: IconFont;
}

/** The round icon of a tab in icon-only, filter and process modes, with an optional count inside (Angular's `fdTabIcon`). */
export function TabIcon({ icon, iconFont = 'SAP-icons', className, children, ...props }: TabIconProps) {
    const mode = useMode();
    return (
        <span
            data-tab-icon=""
            {...props}
            className={cn(
                'relative mx-[0.188rem] my-0 box-border flex size-(--tabs-icon-height) items-center justify-center rounded-[50%] bg-transparent p-0 leading-[normal]',
                '[--tabs-icon-height:2.625rem] compact:[--tabs-icon-height:1.875rem]',
                'border-[length:0.125rem] border-solid border-(--tab-icon,var(--sapContent_Selected_ForegroundColor)) text-(--tab-icon,var(--sapContent_Selected_ForegroundColor))',
                'group-aria-selected/tab:bg-(--tab-icon,var(--sapSelectedColor)) group-aria-selected/tab:text-sap-content-contrast-icon-color',
                FOCUS_FRAME,
                mode === 'filter' ? 'mb-1.5' : [SELECTION_BAR, 'after:-bottom-[1.0625rem]'],
                className
            )}
        >
            {icon && (
                <Icon
                    glyph={icon}
                    font={iconFont}
                    className="text-[length:var(--tabs-icon-size,1.125rem)] leading-none"
                />
            )}
            {children}
        </span>
    );
}

/** A label of a tab in filter and process modes (Angular's `fdTabLabel`). */
export function TabLabel({ className, ...props }: ComponentProps<'span'>) {
    const mode = useMode();
    return (
        <span
            data-tab-label=""
            {...props}
            className={cn(
                'm-0 block max-w-full p-0 ps-0.5 text-sap-font-small-size text-sap-content-label-color first:pb-1.5 compact:first:pb-1',
                mode === 'filter' && 'truncate leading-[0.875rem]',
                mode === 'process' && 'max-w-[7.5rem] overflow-hidden leading-[0.875rem] whitespace-nowrap',
                className
            )}
        />
    );
}

/** The texts of a tab in process mode (Angular's `fdTabProcess`). */
export function TabProcess({ className, ...props }: ComponentProps<'span'>) {
    return <span {...props} className={cn('m-0 p-0', className)} />;
}

/** The header of a filter tab bar: a large count and a label (Angular's `fdTabHeader`). */
export function TabHeader({ className, ...props }: ComponentProps<'span'>) {
    return <span {...props} className={cn('m-0 flex items-center p-0 [&_[data-tab-label]]:max-w-16', className)} />;
}

/** The large count of a filter tab bar header (Angular's `fdTabCounterHeader`). */
export function TabCounterHeader({ className, ...props }: ComponentProps<'span'>) {
    return (
        <span
            {...props}
            className={cn('m-0 p-0 pe-2 text-[1.5rem] leading-6 text-sap-content-label-color', className)}
        />
    );
}

/**
 * The arrow between process tabs (Angular's `fdTabProcessIcon`): the glyph as the content of `::before`, as wide as
 * the glyph (an `Icon` is a 1em box), mirrored in RTL.
 */
export function TabProcessIcon({ className, ...props }: Omit<ComponentProps<'span'>, 'children'>) {
    return (
        <span
            aria-hidden="true"
            {...props}
            data-glyph={iconGlyphChar('process')}
            className={cn(
                'm-0 flex px-2 py-0 text-[1rem] leading-none text-sap-content-non-interactive-icon-color',
                'before:content-[attr(data-glyph)] before:font-sap-content-icon-font-family before:[text-rendering:optimizeLegibility] rtl:-scale-x-100',
                className
            )}
        />
    );
}

/** A vertical line after a filter tab bar header (Angular's `fdTabSeparator`). */
export function TabSeparator({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            aria-hidden="true"
            {...props}
            className={cn(
                'm-0 mx-1 h-8 border-0 border-e border-solid border-sap-group-title-border-color p-0 leading-8',
                className
            )}
        />
    );
}

export interface TabItemProps extends ComponentProps<'div'> {
    /** Value state: colours of the text, icon and selection bar. */
    tabItemState?: TabItemState | null;
    /** The header of a filter tab bar. */
    header?: boolean;
    disabled?: boolean;
}

/** An item of a tab bar: holds a `TabLink` and sets its value state colours (Angular's `fdTabItem`). */
export function TabItem({ tabItemState, header = false, disabled = false, className, ...props }: TabItemProps) {
    const mode = useMode();
    return <div {...props} className={tabItemClass({ mode, tabItemState, header, disabled, className })} />;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Tab nav
 * ---------------------------------------------------------------------------------------------------------------- */

interface TabNavLinkState {
    active: boolean;
    disabled: boolean;
}

interface TabNavContextValue {
    /** The one link in the tab order. */
    stop: HTMLElement | null;
    register: (element: HTMLElement, state: TabNavLinkState) => () => void;
}

const TabNavContext = createContext<TabNavContextValue | null>(null);

/** Moves the focus between tabs with Left, Right, Home and End, wrapping around (Angular's `moveFocus`). */
function moveFocus(event: KeyboardEvent<HTMLElement>, items: HTMLElement[]): void {
    const elements = items.filter((el) => el.offsetParent !== null);
    const index = elements.indexOf(document.activeElement as HTMLElement);
    if (index < 0) return;
    const rtl = getComputedStyle(elements[index]!).direction === 'rtl';
    let next = -1;
    if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) next = (index + 1) % elements.length;
    else if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) next = (index - 1 + elements.length) % elements.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = elements.length - 1;
    else return;
    event.preventDefault();
    elements[next]!.focus();
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
    if (typeof ref === 'function') ref(value);
    else if (ref) (ref as { current: T | null }).current = value;
}

export interface TabLinkProps extends ComponentProps<'a'> {
    /** Whether the link is the current one, e.g. the active route. */
    active?: boolean;
    disabled?: boolean;
}

/**
 * A tab of a `TabNav`: an `<a role="tab">` for router navigation (Angular's `fdTabLink`). Put it in a `TabItem` and
 * its text in a `TabTag`.
 */
export function TabLink({ active = false, disabled = false, className, ref, ...props }: TabLinkProps) {
    const mode = useMode();
    const nav = useContext(TabNavContext);
    const [element, setElement] = useState<HTMLAnchorElement | null>(null);
    const register = nav?.register;
    useLayoutEffect(() => {
        if (!register || !element) return;
        return register(element, { active, disabled });
    }, [register, element, active, disabled]);
    return (
        <a
            {...props}
            ref={(node) => {
                setElement(node);
                assignRef(ref, node);
            }}
            role="tab"
            aria-selected={active}
            aria-disabled={disabled || undefined}
            tabIndex={element && nav?.stop === element ? 0 : -1}
            className={tabLinkClass(mode, className)}
        />
    );
}

export interface TabNavProps extends ComponentProps<'nav'> {
    mode?: TabModes | null;
    size?: TabSizes;
}

/**
 * A tab bar of links, e.g. for router navigation (Angular's `fd-tab-nav`): a `<nav role="tablist">` of `TabItem`s
 * with a `TabLink` each. Left and Right (and Home and End) move between the enabled links, which form one tab stop:
 * the focused, the active or the first enabled link.
 *
 * ```tsx
 * <TabNav aria-label="Pages">
 *     <TabItem>
 *         <TabLink href="/home" active={route === 'home'}><TabTag>Home</TabTag></TabLink>
 *     </TabItem>
 * </TabNav>
 * ```
 */
export function TabNav({ mode, size = 'm', className, onKeyDown, onFocus, ref, children, ...props }: TabNavProps) {
    const navRef = useRef<HTMLElement | null>(null);
    const links = useRef(new Map<HTMLElement, TabNavLinkState>());
    const focused = useRef<HTMLElement | null>(null);
    const [stop, setStop] = useState<HTMLElement | null>(null);

    /** The links in DOM order. */
    const ordered = useCallback(() => {
        const nav = navRef.current;
        if (!nav) return [];
        return [...nav.querySelectorAll<HTMLElement>('[role=tab]')].filter((el) => links.current.has(el));
    }, []);
    // one tab stop: the focused, the active or the first enabled link
    const update = useCallback(() => {
        const all = ordered();
        if (!navRef.current) return;
        const state = (el: HTMLElement) => links.current.get(el)!;
        const next =
            (focused.current && all.includes(focused.current) ? focused.current : null) ??
            all.find((el) => state(el).active && !state(el).disabled) ??
            all.find((el) => !state(el).disabled) ??
            null;
        setStop(next);
    }, [ordered]);
    const register = useCallback(
        (element: HTMLElement, state: TabNavLinkState) => {
            links.current.set(element, state);
            update();
            return () => {
                links.current.delete(element);
                update();
            };
        },
        [update]
    );
    // the links register before the nav element is attached on the first render
    useLayoutEffect(() => update());

    const context = useMemo(() => ({ stop, register }), [stop, register]);
    const tabs = useMemo(() => ({ mode, stackContent: false }), [mode]);

    return (
        <TabsContext.Provider value={tabs}>
            <TabNavContext.Provider value={context}>
                <nav
                    role="tablist"
                    {...props}
                    ref={(node) => {
                        navRef.current = node;
                        assignRef(ref, node);
                    }}
                    className={tabBarClass(size, className)}
                    onFocus={(event: FocusEvent<HTMLElement>) => {
                        onFocus?.(event);
                        const target = event.target as HTMLElement;
                        if (links.current.has(target)) {
                            focused.current = target;
                            update();
                        }
                    }}
                    onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
                        onKeyDown?.(event);
                        if (event.defaultPrevented) return;
                        moveFocus(
                            event,
                            ordered().filter((el) => !links.current.get(el)!.disabled)
                        );
                    }}
                >
                    {children}
                </nav>
            </TabNavContext.Provider>
        </TabsContext.Provider>
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Tab list
 * ---------------------------------------------------------------------------------------------------------------- */

/** What a `Tab` gets from its `TabList`. */
interface TabPanelContextValue {
    tabId: string;
    panelId: string;
    expanded: boolean;
    stackContent: boolean;
}

const TabPanelContext = createContext<TabPanelContextValue | null>(null);

export interface TabProps extends Omit<ComponentProps<'div'>, 'title' | 'id'> {
    /** Id of the tab; its panel gets `<id>-panel`. Generated when not given. */
    id?: string;
    /** Text of the tab. */
    title?: string | null;
    /** A count: above the title, in the icon (icon-only and filter modes) or as a label (process mode). */
    count?: string | number | null;
    /** Glyph of the round icon in icon-only, process and filter modes. */
    glyph?: string | null;
    /** The header of a filter tab bar: the count large, then the title, then a separator. */
    header?: boolean;
    disabled?: boolean;
    /** Value state: colours of the text, icon and selection bar. */
    tabState?: TabItemState | null;
    /** Accessible name of the tab (the native `aria-label` names the panel). */
    ariaLabel?: string | null;
    /** Id of the element that names the tab, when there is no `ariaLabel`. */
    ariaLabelledBy?: string | null;
    /** Content of the tab in place of the title, count and icon (Angular's `fdTabTitleTemplate`). */
    titleContent?: ReactNode;
    /** Props of the tab element, the `<a role="tab">` (fundamental-react's `linkProps`). */
    linkProps?: Omit<ComponentProps<'a'>, 'id' | 'role' | 'children' | 'type' | 'ref'> & {
        [data: `data-${string}`]: string;
    };
    /** Called when the panel opens (`true`) or closes (Angular's `opened` and `closed`). */
    onOpenChange?: (open: boolean) => void;
}

/**
 * A tab of a `TabList` (Angular's `fd-tab`): its title, count, icon and state, and the content shown while it is
 * selected. Renders the panel, a `<div role="tabpanel">`; native props, `className` and `ref` go to it.
 */
export function Tab({
    id: _id,
    title: _title,
    count: _count,
    glyph: _glyph,
    header: _header,
    disabled: _disabled,
    tabState: _tabState,
    ariaLabel: _ariaLabel,
    ariaLabelledBy: _ariaLabelledBy,
    titleContent: _titleContent,
    linkProps: _linkProps,
    onOpenChange,
    className,
    children,
    ...props
}: TabProps) {
    const panel = useContext(TabPanelContext);
    const expanded = !!panel?.expanded;

    const previous = useRef(false);
    const changed = useRef(onOpenChange);
    changed.current = onOpenChange;
    useEffect(() => {
        if (expanded === previous.current) return;
        previous.current = expanded;
        changed.current?.(expanded);
    }, [expanded]);

    return (
        <div
            {...props}
            role="tabpanel"
            id={panel?.panelId}
            aria-labelledby={panel?.tabId}
            tabIndex={expanded && !panel?.stackContent ? 0 : undefined}
            className={cn('m-0 block p-0 outline-none', !expanded && 'hidden', className)}
        >
            {expanded && children}
        </div>
    );
}

/** Imperative actions of a tab list, through `actionsRef`. */
export interface TabListActions {
    /** Selects a tab by its id (or its panel's id), as a click on it would. */
    selectTab(id: string | null | undefined): void;
    /** The element that scrolls the panels. */
    scrollElement(): HTMLElement | null;
}

export interface TabListProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
    /** The `Tab`s. */
    children?: ReactNode;
    mode?: TabModes | null;
    /** Horizontal padding of the bar: `s` 1rem, `m` and `l` 2rem, `xl` and `xxl` 3rem. */
    size?: TabSizes;
    /** Tabs that do not fit go into a "More" menu; without it they are hidden. */
    collapseOverflow?: boolean;
    /** Upper limit of tabs in the bar, with `collapseOverflow`. */
    maxVisibleTabs?: number;
    /** Shows all panels one below the other; the tabs scroll to them and follow the scrolling. */
    stackContent?: boolean;
    /** Maximum height of the content (a CSS length). */
    maxContentHeight?: string;
    /** Clicking the selected tab collapses it (nothing is selected). */
    collapsibleTabs?: boolean;
    /** Id of the selected tab, or `null` for none (controlled). */
    value?: string | null;
    /**
     * Id of the tab selected first (Angular's `defaultTab`); the first enabled tab without it. Until a tab is chosen,
     * the selection follows changes of the default.
     */
    defaultValue?: string | null;
    /** Called when the selected tab changes, with its id and index (`null` and -1 when a tab collapses). */
    onValueChange?: (value: string | null, index: number) => void;
    /** Selects the default tab again when the tabs change. */
    selectDefaultOnTabsChange?: boolean;
    /** Moves the focus into a stacked panel after scrolling to it. */
    focusFirstFocusableElement?: boolean;
    /** Accessible name of the tab list (and of the stacked content). */
    ariaLabel?: string | null;
    /** Text of the "More" button. */
    moreLabel?: string;
    onVisibleItemsCountChange?: (count: number) => void;
    onHiddenItemsCountChange?: (count: number) => void;
    /** Imperative actions: `selectTab(id)` and `scrollElement()`. */
    actionsRef?: Ref<TabListActions>;
}

interface TabEntry {
    key: string;
    id: string;
    panelId: string;
    index: number;
    props: TabProps;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const MORE =
    'ms-auto flex cursor-pointer items-center gap-2 border-0 bg-transparent px-3 py-[0.875rem] font-sap-font-family text-sap-font-size leading-4 text-sap-content-label-color outline-none focus-visible:outline-sap';

/** The default (or first enabled) tab. */
function fallbackOf(entries: TabEntry[], defaultValue: string | null | undefined): string | null {
    const enabled = entries.filter((entry) => !entry.props.disabled);
    return (enabled.find((entry) => entry.id === defaultValue) ?? enabled[0])?.id ?? null;
}

/** The content of a tab in the bar, by mode (Angular's `titleTpl`). */
function TabTitle({ tab, mode }: { tab: TabProps; mode: TabModes | null | undefined }) {
    if (tab.titleContent != null) return <>{tab.titleContent}</>;
    const count = tab.count != null && tab.count !== '';
    switch (mode) {
        case 'filter':
            return tab.header ? (
                <TabHeader>
                    {count && <TabCounterHeader>{tab.count}</TabCounterHeader>}
                    {tab.title && <TabLabel>{tab.title}</TabLabel>}
                </TabHeader>
            ) : (
                <>
                    <TabIcon icon={tab.glyph}>{count && <TabCount>{tab.count}</TabCount>}</TabIcon>
                    <TabLabel>{tab.title}</TabLabel>
                </>
            );
        case 'icon-only':
            return (
                <>
                    <TabIcon icon={tab.glyph}>{count && <TabCount>{tab.count}</TabCount>}</TabIcon>
                    {!tab.ariaLabel && tab.title && <span className="sr-only-sap">{tab.title}</span>}
                </>
            );
        case 'process':
            return (
                <>
                    {tab.glyph && <TabIcon icon={tab.glyph} />}
                    <TabProcess>
                        {count && <TabLabel>{tab.count}</TabLabel>}
                        {tab.title && <TabLabel>{tab.title}</TabLabel>}
                    </TabProcess>
                </>
            );
        default:
            return (
                <>
                    {count && <TabCount className="block">{tab.count}</TabCount>}
                    <TabTag>{tab.title}</TabTag>
                </>
            );
    }
}

/**
 * Tab list: a tab bar for its `Tab`s and the content of the selected one, on Base UI's Tabs. Tabs that do not fit go
 * into a "More" menu. With `stackContent` all panels show one below the other and the tabs scroll to them and follow
 * the scrolling. Left and Right (Home and End) move between the enabled tabs, which form one tab stop; Enter, Space
 * and a click select.
 *
 * ```tsx
 * <TabList ariaLabel="Product">
 *     <Tab title="Info">Information</Tab>
 *     <Tab title="Notes" count={3}>Notes</Tab>
 * </TabList>
 * ```
 */
export function TabList({
    children,
    mode,
    size = 'm',
    collapseOverflow = true,
    maxVisibleTabs = Number.POSITIVE_INFINITY,
    stackContent = false,
    maxContentHeight = '100%',
    collapsibleTabs = false,
    value,
    defaultValue,
    onValueChange,
    selectDefaultOnTabsChange = false,
    focusFirstFocusableElement = true,
    ariaLabel,
    moreLabel = 'More',
    onVisibleItemsCountChange,
    onHiddenItemsCountChange,
    actionsRef,
    className,
    ref,
    ...props
}: TabListProps) {
    const baseId = useId();
    const entries = useMemo<TabEntry[]>(() => {
        const list: TabEntry[] = [];
        Children.toArray(children).forEach((node) => {
            if (!isValidElement<TabProps>(node) || node.type !== Tab) return;
            const key = String(node.key);
            const id = node.props.id ?? `fd-tab${baseId}${key.replace(/[^\w-]/g, '_')}`;
            list.push({ key, id, panelId: `${id}-panel`, index: list.length, props: node.props });
        });
        return list;
    }, [children, baseId]);
    const signature = entries.map((entry) => entry.id).join('\u0000');

    const controlled = value !== undefined;
    const [own, setOwn] = useState<string | null>(() => fallbackOf(entries, defaultValue));
    const selected = controlled ? value : own;
    /** Whether the selected tab is the default one, not one chosen by the user or `selectTab()`. */
    const defaultSelected = useRef(own !== null);
    const [forced, setForced] = useState<string | null>(null);
    const [scrollRequest, setScrollRequest] = useState<{ id: string } | null>(null);
    const [focusRequest, setFocusRequest] = useState<{ id: string } | null>(null);
    const [spyPaused, setSpyPaused] = useState(false);
    const [restoreFocus, setRestoreFocus] = useState(true);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    // the latest values for the callbacks below
    const latest = useRef({ entries, selected, controlled, collapsibleTabs, stackContent, onValueChange });
    latest.current = { entries, selected, controlled, collapsibleTabs, stackContent, onValueChange };

    const emit = useCallback((id: string | null) => {
        const { entries: all, onValueChange: changed } = latest.current;
        changed?.(id, id === null ? -1 : all.findIndex((entry) => entry.id === id));
    }, []);
    const set = useCallback((id: string | null) => {
        latest.current.selected = id;
        if (!latest.current.controlled) setOwn(id);
    }, []);

    /** Selects a tab; `scroll` scrolls to it in stacked mode. */
    const select = useCallback(
        (id: string, scroll: boolean) => {
            const changed = latest.current.selected !== id;
            set(id);
            if (latest.current.stackContent && scroll) setScrollRequest({ id });
            if (changed) emit(id);
        },
        [set, emit]
    );

    /** Selects a tab; `expand = false` collapses it in collapsible tab lists (Angular's `expandTab`). */
    const expand = useCallback(
        (id: string, open: boolean) => {
            const entry = latest.current.entries.find((e) => e.id === id);
            if (!entry || entry.props.disabled) return;
            defaultSelected.current = false;
            if (!open) {
                if (latest.current.collapsibleTabs && latest.current.selected === id) {
                    set(null);
                    emit(null);
                }
                return;
            }
            select(id, true);
        },
        [set, emit, select]
    );

    useImperativeHandle(
        actionsRef,
        () => ({
            selectTab(id) {
                const entry = latest.current.entries.find((e) => e.id === id || e.panelId === id);
                if (entry) expand(entry.id, true);
            },
            scrollElement: () => contentRef.current
        }),
        [expand]
    );

    // the first selection is reported, as Angular's
    const reported = useRef(false);
    useEffect(() => {
        if (reported.current) return;
        reported.current = true;
        if (!controlled && own !== null) emit(own);
    }, [controlled, own, emit]);

    // select the default (or first enabled) tab again when the tabs or the default change; until a tab is chosen
    // the selection follows the default
    const previousSignature = useRef(signature);
    const reselect = useRef(selectDefaultOnTabsChange);
    reselect.current = selectDefaultOnTabsChange;
    useLayoutEffect(() => {
        const changed = previousSignature.current !== signature;
        previousSignature.current = signature;
        const { entries: all, selected: current, controlled: isControlled } = latest.current;
        if (isControlled) return;
        const fallback = fallbackOf(all, defaultValue);
        const keep =
            current != null &&
            all.some((entry) => entry.id === current) &&
            !(changed && reselect.current) &&
            !(defaultSelected.current && fallback !== current);
        if (keep) return;
        if (fallback !== null && fallback !== current) select(fallback, false);
        defaultSelected.current = fallback !== null;
    }, [signature, defaultValue, select]);

    // scroll to a stacked panel after selecting its tab, without the spy reporting the panels on the way
    const focusFirst = useRef(focusFirstFocusableElement);
    focusFirst.current = focusFirstFocusableElement;
    useEffect(() => {
        const container = contentRef.current;
        if (!scrollRequest || !container || !latest.current.stackContent) return;
        const entry = latest.current.entries.find((e) => e.id === scrollRequest.id);
        const panel = Array.from(container.children).find((el) => el.id === entry?.panelId) as HTMLElement | undefined;
        if (!panel) return;
        setSpyPaused(true);
        container.scrollTo({ top: panel.offsetTop, behavior: 'smooth' });
        const timer = setTimeout(() => setSpyPaused(false), 600);
        if (focusFirst.current) panel.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
        return () => clearTimeout(timer);
    }, [scrollRequest]);

    // a tab picked from the "More" menu gets the focus once it is in the bar
    useEffect(() => {
        if (!focusRequest) return;
        rootRef.current?.querySelectorAll<HTMLElement>('[role=tab]').forEach((el) => {
            if (el.id === focusRequest.id) el.focus();
        });
    }, [focusRequest]);

    const spyRef = useScrollSpy<HTMLDivElement>({
        trackedTags: ['div'],
        disabled: !stackContent || spyPaused,
        onSpyChange: (element) => {
            const entry = latest.current.entries.find((e) => e.panelId === element?.id);
            if (entry && entry.id !== latest.current.selected) {
                defaultSelected.current = false;
                set(entry.id);
                emit(entry.id);
            }
        }
    });

    // stable, so the spy keeps its listener and its current panel across renders
    const contentCallback = useCallback(
        (node: HTMLDivElement | null) => {
            contentRef.current = node;
            return spyRef(node);
        },
        [spyRef]
    );

    const onOverflowSelect = (id: string) => {
        setForced(id);
        setRestoreFocus(false);
        expand(id, true);
        setFocusRequest({ id });
    };

    const isExpanded = (entry: TabEntry) => (stackContent ? !entry.props.disabled : selected === entry.id);
    const byKey = new Map(entries.map((entry) => [entry.key, entry]));
    const tabsContext = useMemo(() => ({ mode, stackContent }), [mode, stackContent]);

    return (
        <TabsContext.Provider value={tabsContext}>
            <BaseTabs.Root
                {...props}
                ref={(node: HTMLDivElement | null) => {
                    rootRef.current = node;
                    assignRef(ref, node);
                }}
                value={selected ?? null}
                onValueChange={(next) => {
                    if (typeof next === 'string') expand(next, true);
                }}
                className={cn('flex h-full flex-col', className)}
            >
                {/* Base UI's list gives the arrow keys and the roving tab stop; the tablist role is on the row of tabs */}
                <BaseTabs.List
                    role="presentation"
                    className={cn(tabBarClass(size), 'shrink-0 flex-nowrap')}
                    onKeyDown={(event) => {
                        // only between the tabs, not from the "More" button or its menu
                        if ((event.target as HTMLElement).getAttribute('role') !== 'tab') event.preventBaseUIHandler();
                    }}
                >
                    <OverflowLayout<TabEntry>
                        ariaRole="tablist"
                        ariaLabel={ariaLabel ?? undefined}
                        className="min-w-0"
                        enableKeyboardNavigation={false}
                        maxVisibleItems={collapseOverflow ? maxVisibleTabs : Number.POSITIVE_INFINITY}
                        showMoreButton={collapseOverflow}
                        onVisibleItemsCountChange={onVisibleItemsCountChange}
                        onHiddenItemsCountChange={onHiddenItemsCountChange}
                        renderMore={(hidden) => (
                            <Menu
                                placement="bottom-end"
                                restoreFocusOnClose={restoreFocus}
                                onOpenChange={(open) => open && setRestoreFocus(true)}
                            >
                                <MenuTrigger render={<button type="button" className={MORE} aria-label={moreLabel} />}>
                                    <span>{moreLabel}</span>
                                    <Icon glyph="slim-arrow-down" />
                                </MenuTrigger>
                                <MenuPopup aria-label={moreLabel}>
                                    {hidden.map(({ key, item }) => (
                                        <MenuItem
                                            key={key}
                                            disabled={!!item.props.disabled}
                                            onClick={() => onOverflowSelect(item.id)}
                                        >
                                            <MenuTitle>{item.props.title || item.props.count}</MenuTitle>
                                        </MenuItem>
                                    ))}
                                </MenuPopup>
                            </Menu>
                        )}
                    >
                        {entries.map((entry) => {
                            const tab = entry.props;
                            const active = selected === entry.id;
                            const linkProps = {
                                ...tab.linkProps,
                                id: entry.id,
                                'aria-controls': entry.panelId,
                                'aria-label': tab.ariaLabel || undefined,
                                'aria-labelledby':
                                    !tab.ariaLabel && tab.ariaLabelledBy ? tab.ariaLabelledBy : undefined,
                                className: tabLinkClass(mode, tab.linkProps?.className)
                            };
                            return (
                                <OverflowItem
                                    key={entry.key}
                                    item={entry}
                                    forceVisibility={entry.id === forced || active}
                                >
                                    {({ first }) => (
                                        <div className="flex items-center">
                                            <div
                                                className={tabItemClass({
                                                    mode,
                                                    tabItemState: tab.tabState,
                                                    header: tab.header,
                                                    disabled: tab.disabled,
                                                    first
                                                })}
                                            >
                                                {tab.disabled ? (
                                                    // disabled tabs are no Base UI tabs: the arrow keys skip them, as in Angular
                                                    <a
                                                        {...linkProps}
                                                        role="tab"
                                                        aria-selected={false}
                                                        aria-disabled
                                                        tabIndex={-1}
                                                    >
                                                        <TabTitle tab={tab} mode={mode} />
                                                    </a>
                                                ) : (
                                                    <BaseTabs.Tab
                                                        // the props of an <a>: the tab renders one
                                                        {...(linkProps as Omit<BaseTabs.Tab.Props, 'value'>)}
                                                        value={entry.id}
                                                        nativeButton={false}
                                                        render={<a />}
                                                        onClick={(event) => {
                                                            tab.linkProps?.onClick?.(
                                                                event as unknown as MouseEvent<HTMLAnchorElement>
                                                            );
                                                            // Base UI selects inactive tabs; a click on the selected one collapses
                                                            // it, or scrolls to it again in stacked mode
                                                            if (latest.current.selected !== entry.id) return;
                                                            if (collapsibleTabs && !stackContent)
                                                                expand(entry.id, false);
                                                            else if (stackContent) expand(entry.id, true);
                                                        }}
                                                    >
                                                        <TabTitle tab={tab} mode={mode} />
                                                    </BaseTabs.Tab>
                                                )}
                                                {mode === 'process' && entry.index < entries.length - 1 && (
                                                    <TabProcessIcon />
                                                )}
                                            </div>
                                            {tab.header && <TabSeparator />}
                                        </div>
                                    )}
                                </OverflowItem>
                            );
                        })}
                    </OverflowLayout>
                </BaseTabs.List>
                <div
                    ref={contentCallback}
                    tabIndex={stackContent ? 0 : undefined}
                    role={stackContent ? 'region' : undefined}
                    aria-label={stackContent ? ariaLabel || undefined : undefined}
                    className={cn('min-h-0 grow overflow-y-auto scrollbar-sap', stackContent && 'relative')}
                    style={{ maxHeight: maxContentHeight }}
                >
                    {Children.toArray(children).map((node) => {
                        const entry = isValidElement(node) ? byKey.get(String(node.key)) : undefined;
                        if (!entry) return node;
                        return (
                            <TabPanelContext.Provider
                                key={entry.key}
                                value={{
                                    tabId: entry.id,
                                    panelId: entry.panelId,
                                    expanded: isExpanded(entry),
                                    stackContent
                                }}
                            >
                                {node}
                            </TabPanelContext.Provider>
                        );
                    })}
                </div>
            </BaseTabs.Root>
        </TabsContext.Provider>
    );
}
