/*
 * Port of fundamental-react (Shellbar) and @fundamental-ngx/core (shellbar) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    Children,
    cloneElement,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    type ReactElement,
    type ReactNode,
    type Ref,
    type RefCallback
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ActionSheet, ActionSheetBody, ActionSheetControl, ActionSheetItem } from '@/ui/action-sheet/action-sheet';
import { Avatar, type ColorAccent } from '@/ui/avatar/avatar';
import { Button, ButtonBadge, type ButtonProps, type ButtonVariant } from '@/ui/button/button';
import type { IconFont } from '@/ui/icon/icon';
import { Menu, MenuAddon, MenuItem, MenuPopup, MenuTitle, MenuTrigger, type MenuProps } from '@/ui/menu/menu';
import type { Placement, PopoverFillMode } from '@/ui/popover/popover';
import { UserMenu } from '@/ui/user-menu/user-menu';

export type ShellbarSize = 's' | 'm' | 'l' | 'xl';
/** Minimum widths in px from which each size applies. */
export type ShellbarBreakpoints = Record<ShellbarSize, number>;
export type ShellbarGroup = 'product' | 'search' | 'actions';
export type ShellbarGroupFlexOptions = Partial<Record<ShellbarGroup, { shrink?: boolean; flexBasisAuto?: boolean }>>;

/** The signed-in user shown by a shellbar user menu. */
export interface ShellbarUser {
    initials?: string;
    image?: string;
    fullName?: string;
    colorAccent?: ColorAccent;
}

/** An item of a shellbar user menu. */
export interface ShellbarUserMenuItem {
    text: string;
    callback?: (event: ReactMouseEvent<HTMLElement>) => void;
}

/** An item of a product menu. */
export interface ShellbarMenuItem {
    name: string;
    callback?: (event: ReactMouseEvent<HTMLElement>) => void;
    link?: string;
    glyph?: string;
    /** Opens the link in a new tab. */
    newTab?: boolean;
}

export const SHELLBAR_DEFAULT_BREAKPOINTS: ShellbarBreakpoints = { s: 0, m: 320, l: 600, xl: 1240 };

/**
 * Shell colours for transparent buttons inside the shellbar: the SAP button variables are mapped to the shell
 * variables, so every transparent button (actions, product switch, menus) follows them.
 */
const SHELL_BUTTON_VARS = [
    '[--sapButton_Lite_TextColor:var(--sapShell_InteractiveTextColor)]',
    '[--sapButton_Lite_Hover_Background:var(--sapShell_Hover_Background)]',
    '[--sapButton_Lite_Hover_TextColor:var(--sapShell_InteractiveTextColor)]',
    '[--sapButton_Lite_Active_Background:var(--sapShell_Active_Background)]',
    '[--sapButton_Active_TextColor:var(--sapShell_Active_TextColor)]',
    '[--sapButton_Selected_Background:var(--sapShell_Selected_Background)]',
    '[--sapButton_Selected_Hover_Background:var(--sapShell_Selected_Hover_Background)]',
    '[--sapButton_Selected_TextColor:var(--sapShell_Selected_TextColor)]',
    '[--sapButton_Selected_BorderColor:var(--sapButton_Lite_Active_BorderColor)]',
    '[--sapButton_Selected_Hover_BorderColor:var(--sapButton_Lite_Active_BorderColor)]'
];

/** Marks elements that collapse into the overflow menu when the actions do not fit. */
const COLLAPSIBLE = 'data-shellbar-collapsible';

interface ActionsApi {
    el: HTMLElement;
    setOverflow(overflow: boolean): void;
}

interface ContextAreaApi {
    showAll(): void;
    hideWhile(exceeds: () => boolean): void;
}

/** What the parts of a shellbar know about it. */
interface ShellbarContextValue {
    size: ShellbarSize;
    /** Whether the search field is open from its button (or in place of everything on small screens). */
    searchOpen: boolean;
    searchInCenter: boolean;
    hasSearch: boolean;
    hasContextArea: boolean;
    groupFlex: ShellbarGroupFlexOptions | null | undefined;
    /** Where the search field renders: the middle, the actions, or a hidden holder. */
    searchTarget: HTMLElement | null;
    openSearch(): void;
    closeSearch(): void;
    /** True once after `openSearch`, for the search field to take the focus. */
    takeFocusRequest(): boolean;
    setSearchOutlet(el: HTMLElement | null): void;
    registerActions(api: ActionsApi | null): void;
    registerContextArea(api: ContextAreaApi | null): void;
}

const ShellbarContext = createContext<ShellbarContextValue | null>(null);

function mergeRefs<E>(...refs: (Ref<E> | undefined)[]): RefCallback<E> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
}

/** The children of the given component types, and the rest. */
function partition(children: ReactNode) {
    const items = Children.toArray(children);
    const of = (...types: unknown[]) => items.filter((c) => isValidElement(c) && types.includes(c.type));
    const known = new Set<unknown>();
    const take = (...types: unknown[]) => {
        types.forEach((t) => known.add(t));
        return of(...types);
    };
    return { items, take, rest: () => items.filter((c) => !isValidElement(c) || !known.has(c.type)) };
}

export interface ShellbarProps extends Omit<ComponentProps<'div'>, 'children'> {
    children?: ReactNode;
    /** Fixed size; follows the width when not set. */
    size?: ShellbarSize | null;
    /** Minimum widths of the sizes. */
    breakpoints?: ShellbarBreakpoints;
    /** Lets the product, search and actions groups shrink (`shrink`) and size to their content (`flexBasisAuto`). */
    groupFlex?: ShellbarGroupFlexOptions | null;
    /** Shows the navigation (side navigation) button before the branding. */
    showNavigationButton?: boolean;
    /** Replaces the default navigation button (Angular's `navigationButtonTemplate`). */
    navigationButton?: ReactNode;
    /** Shows the back button before the branding. */
    showBackButton?: boolean;
    navigationButtonLabel?: string;
    backButtonLabel?: string;
    /** Text of the button that closes the search opened on small screens. */
    cancelLabel?: string;
    /** On small screens, keeps the search button and collapses all other actions. */
    showSearchFieldOnSizeSmall?: boolean;
    onNavigationButtonClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
    onBackButtonClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

/**
 * Shellbar: the top bar of an SAP application with the branding, an optional context area, a search field and the
 * actions, user menu and product switch. Its size (s, m, l, xl) follows its width: actions that do not fit collapse
 * into an overflow menu, context area items hide by priority, and on small screens the search opens in place of
 * everything else.
 *
 * Its parts are direct children: `ShellbarBranding` (or `ShellbarLogo` and `ShellbarTitle`), `ProductMenu`,
 * `ShellbarSubtitle`, `ShellbarContextArea`, `ShellbarSearch` and `ShellbarActions`. Native props, `className` and
 * `ref` go to the bar.
 *
 * ```tsx
 * <Shellbar>
 *     <ShellbarBranding interactiveBranding aria-label="Product home" onClick={home}>
 *         <ShellbarLogo><img src="logo.svg" alt="Company" /></ShellbarLogo>
 *         <ShellbarTitle>Product</ShellbarTitle>
 *     </ShellbarBranding>
 *     <ShellbarSearch placeholder="Search" onSearchSubmit={search} />
 *     <ShellbarActions>
 *         <ShellbarAction glyph="bell" label="Notifications" notificationCount={3} />
 *     </ShellbarActions>
 * </Shellbar>
 * ```
 */
export function Shellbar({
    size: sizeProp,
    breakpoints = SHELLBAR_DEFAULT_BREAKPOINTS,
    groupFlex,
    showNavigationButton = false,
    navigationButton,
    showBackButton = false,
    navigationButtonLabel = 'Navigation',
    backButtonLabel = 'Back',
    cancelLabel = 'Cancel',
    showSearchFieldOnSizeSmall = false,
    onNavigationButtonClick,
    onBackButtonClick,
    className,
    children,
    ref,
    ...props
}: ShellbarProps) {
    const bar = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [center, setCenter] = useState<HTMLElement | null>(null);
    const [holder, setHolder] = useState<HTMLElement | null>(null);
    const [searchOutlet, setSearchOutlet] = useState<HTMLElement | null>(null);
    const actions = useRef<ActionsApi | null>(null);
    const contextArea = useRef<ContextAreaApi | null>(null);
    const focusRequest = useRef(false);

    const parts = partition(children);
    const branding = parts.take(ShellbarBranding);
    const logo = parts.take(ShellbarLogo);
    const titles = parts.take(ShellbarTitle, ProductMenu, ShellbarSubtitle, ShellbarSeparator);
    const context = parts.take(ShellbarContextArea);
    const search = parts.take(ShellbarSearch);
    const actionGroups = parts.take(ShellbarActions);
    const others = parts.rest();
    const hasSearch = search.length > 0;
    const hasContextArea = context.length > 0;

    const size = useMemo<ShellbarSize>(() => {
        if (sizeProp) return sizeProp;
        const sizes = (Object.keys(breakpoints) as ShellbarSize[]).sort((a, b) => breakpoints[b] - breakpoints[a]);
        return sizes.find((s) => width >= breakpoints[s]) ?? 's';
    }, [sizeProp, breakpoints, width]);
    const searchInCenter = hasSearch && ((size === 'xl' && !hasContextArea) || (size === 's' && searchOpen));
    /** On small screens the open search replaces everything else. */
    const hideAll = size === 's' && searchOpen;
    const hideTitles = size !== 'xl' && size !== 'l' && searchOpen;

    const openSearch = useCallback(() => {
        focusRequest.current = true;
        setSearchOpen(true);
    }, []);
    const closeSearch = useCallback(() => setSearchOpen(false), []);

    /** Whether the end of the actions is past the end of the bar's content box. */
    const exceeds = useCallback(() => {
        const el = bar.current;
        const own = actions.current?.el;
        if (!el || !own) return false;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const box = own.getBoundingClientRect();
        return style.direction === 'rtl'
            ? box.left < rect.left + parseFloat(style.paddingLeft) - 0.5
            : box.right > rect.right - parseFloat(style.paddingRight) + 0.5;
    }, []);

    /**
     * Shows everything, then collapses what does not fit: the actions into the overflow menu, the branding title,
     * and the context area items by priority. A search opened in the actions closes when even that is not enough.
     */
    const state = useRef({ size, searchOpen, searchInCenter, showSearchFieldOnSizeSmall });
    state.current = { size, searchOpen, searchInCenter, showSearchFieldOnSizeSmall };
    const layout = useCallback(() => {
        const own = actions.current;
        const el = bar.current;
        if (!own || !el) return;
        const current = state.current;
        const brandingTitles = el.querySelectorAll<HTMLElement>('[data-shellbar-branding] [data-shellbar-title]');
        brandingTitles.forEach((title) => (title.style.display = ''));
        contextArea.current?.showAll();
        own.setOverflow(current.size === 's' && current.showSearchFieldOnSizeSmall);
        if (!exceeds()) {
            // everything fits again: report that no context item is hidden any more
            contextArea.current?.hideWhile(() => false);
            return;
        }
        own.setOverflow(true);
        if (exceeds()) brandingTitles.forEach((title) => (title.style.display = 'none'));
        contextArea.current?.hideWhile(exceeds);
        if (current.searchOpen && !current.searchInCenter && exceeds()) setSearchOpen(false);
    }, [exceeds]);

    useLayoutEffect(() => {
        const el = bar.current;
        if (!el) return;
        setWidth(el.getBoundingClientRect().width);
        const observer = new ResizeObserver(() => {
            setWidth(el.getBoundingClientRect().width);
            layout();
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [layout]);

    // a size change re-measures once the new layout is rendered
    useLayoutEffect(() => {
        layout();
    }, [layout, size, searchInCenter, searchOpen, showSearchFieldOnSizeSmall]);

    const searchTarget = searchInCenter ? center : searchOpen ? searchOutlet : holder;
    const value = useMemo<ShellbarContextValue>(
        () => ({
            size,
            searchOpen,
            searchInCenter,
            hasSearch,
            hasContextArea,
            groupFlex,
            searchTarget,
            openSearch,
            closeSearch,
            takeFocusRequest: () => {
                const requested = focusRequest.current;
                focusRequest.current = false;
                return requested;
            },
            setSearchOutlet,
            registerActions: (api) => (actions.current = api),
            registerContextArea: (api) => (contextArea.current = api)
        }),
        [size, searchOpen, searchInCenter, hasSearch, hasContextArea, groupFlex, searchTarget, openSearch, closeSearch]
    );

    const product = groupFlex?.product;
    const middle = groupFlex?.search;

    return (
        <ShellbarContext.Provider value={value}>
            <div
                {...props}
                ref={mergeRefs(bar, ref)}
                data-density="cozy"
                data-size={size}
                className={cn(
                    'relative m-0 box-border flex h-[3.25rem] items-center justify-between gap-2 py-0',
                    'bg-sap-shell-color [box-shadow:inset_0_-0.0625rem_0_0_var(--sapShell_BorderColor)] font-sap-font-family text-sap-font-size text-sap-shell-text-color',
                    SHELL_BUTTON_VARS,
                    showNavigationButton ? 'ps-3.5 pe-4' : size === 's' ? 'px-4' : size === 'xl' ? 'px-12' : 'px-8',
                    hasContextArea && 'justify-start',
                    className
                )}
            >
                <div
                    className={cn(
                        'order-1 m-0 box-border flex items-center justify-start gap-2 p-0',
                        product?.shrink && 'min-w-0 shrink grow-0',
                        product?.flexBasisAuto && 'basis-auto',
                        hideAll && 'hidden'
                    )}
                >
                    {showNavigationButton &&
                        !searchOpen &&
                        (navigationButton ?? (
                            <Button
                                variant="transparent"
                                glyph="menu2"
                                aria-label={navigationButtonLabel}
                                title={navigationButtonLabel}
                                onClick={onNavigationButtonClick}
                            />
                        ))}
                    {showBackButton && !searchOpen && (
                        <Button
                            variant="transparent"
                            glyph="nav-back"
                            aria-label={backButtonLabel}
                            title={backButtonLabel}
                            onClick={onBackButtonClick}
                        />
                    )}
                    {branding}
                    {others}
                    {logo}
                    <div className={hideTitles ? 'hidden' : 'contents'}>{titles}</div>
                </div>
                <div className={hideAll ? 'hidden' : 'contents'}>{context}</div>
                {searchInCenter && (
                    <div
                        className={cn(
                            'order-2 m-0 mx-2 box-border flex min-w-0 items-center justify-center gap-2 p-0',
                            hideAll && 'mx-0 flex-1',
                            middle?.shrink && 'shrink grow-0',
                            middle?.flexBasisAuto && 'basis-auto'
                        )}
                    >
                        <div ref={setCenter} className="flex min-w-0 flex-1 justify-center" />
                        {hideAll && <Button variant="transparent" label={cancelLabel} onClick={closeSearch} />}
                    </div>
                )}
                <div className={hideAll ? 'hidden' : 'contents'}>{actionGroups}</div>
                <div ref={setHolder} hidden />
                {search}
            </div>
        </ShellbarContext.Provider>
    );
}

export interface ShellbarBrandingProps extends ComponentProps<'div'> {
    /** Shows hover and active states and makes the branding a focusable link (Enter clicks it). */
    interactiveBranding?: boolean;
}

/**
 * The logo and title of the product, optionally interactive (a link to the home page, `role="link"`): handle
 * `onClick` for the navigation and give it an `aria-label`.
 */
export function ShellbarBranding({
    interactiveBranding = false,
    className,
    onKeyDown,
    children,
    ...props
}: ShellbarBrandingProps) {
    const shellbar = useContext(ShellbarContext);
    const small = shellbar?.size === 's' || shellbar?.size === 'm';
    return (
        <div
            role={interactiveBranding ? 'link' : undefined}
            tabIndex={interactiveBranding ? 0 : undefined}
            {...props}
            data-shellbar-branding=""
            className={cn(
                'm-0 box-border flex h-9 shrink-0 items-center gap-1 rounded-[0.375rem] py-0.5 ps-1 pe-2 outline-none',
                'border-width-sap-button-border-width border-solid border-sap-button-lite-border-color bg-sap-button-lite-background',
                small && 'gap-0',
                interactiveBranding
                    ? [
                          'cursor-pointer hover:border-sap-button-lite-hover-border-color hover:bg-sap-shell-hover-background',
                          'active:border-sap-button-lite-active-border-color active:bg-sap-button-lite-active-background',
                          'focus-visible:outline-(length:--sapContent_FocusWidth) focus-visible:-outline-offset-2 focus-visible:outline-sap-content-focus-color focus-visible:[outline-style:var(--sapContent_FocusStyle)]'
                      ]
                    : 'cursor-auto',
                className
            )}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.defaultPrevented) return;
                if (interactiveBranding && event.key === 'Enter' && event.target === event.currentTarget) {
                    event.currentTarget.click();
                }
            }}
        >
            {children}
        </div>
    );
}

/** The product logo: an image or SVG. */
export function ShellbarLogo({ className, ...props }: ComponentProps<'span'>) {
    return (
        <span
            {...props}
            className={cn(
                'relative m-0 box-border inline-flex h-8 max-h-8 shrink-0 items-center px-1 py-px align-middle [&>*]:block [&>*]:h-[1.875rem] [&>*]:max-w-16',
                className
            )}
        />
    );
}

/** The product name, a heading (`<h1>`); hidden on small shellbars. */
export function ShellbarTitle({ className, ...props }: ComponentProps<'h1'>) {
    const shellbar = useContext(ShellbarContext);
    return (
        <h1
            {...props}
            data-shellbar-title=""
            className={cn(
                'm-0 box-border min-w-0 truncate p-0 align-middle font-sap-font-semibold-duplex-family text-sap-font-header5-size font-normal text-sap-shell-sub-brand-text-color',
                shellbar?.size === 's' && 'hidden',
                className
            )}
        />
    );
}

/** A second line of text next to the title; hidden on small shellbars. */
export function ShellbarSubtitle({ className, ...props }: ComponentProps<'div'>) {
    const shellbar = useContext(ShellbarContext);
    return (
        <div
            {...props}
            className={cn(
                'm-0 box-border min-w-0 truncate p-0 text-sap-font-small-size text-sap-object-header-subtitle-text-color',
                shellbar?.size === 's' && 'hidden',
                className
            )}
        />
    );
}

/** A vertical line between groups (`role="separator"`); hidden on small and medium shellbars. */
export function ShellbarSeparator({ className, ...props }: ComponentProps<'div'>) {
    const shellbar = useContext(ShellbarContext);
    const small = shellbar?.size === 's' || shellbar?.size === 'm';
    return (
        <div
            role="separator"
            aria-orientation="vertical"
            {...props}
            className={cn(
                'm-0 box-border flex h-8 w-px shrink-0 bg-sap-toolbar-separator-color p-0',
                small && 'hidden',
                className
            )}
        />
    );
}

export interface ShellbarContextAreaProps extends ComponentProps<'div'> {
    /** Called with the items hidden for lack of space (empty when all fit again). */
    onContentItemVisibilityChange?: (hidden: HTMLElement[]) => void;
}

/**
 * Additional information after the branding: separators, menus, statuses or switches (`role="group"`, named
 * "Additional information" by default). Items hide from the last one when the shellbar runs out of space, or by their
 * `data-hide-priority` (Angular's `fdShellbarHidePriority`): higher numbers hide first.
 */
export function ShellbarContextArea({
    onContentItemVisibilityChange,
    className,
    ref,
    'aria-label': ariaLabel = 'Additional information',
    ...props
}: ShellbarContextAreaProps) {
    const shellbar = useContext(ShellbarContext);
    const el = useRef<HTMLDivElement | null>(null);
    const hidden = useRef<HTMLElement[]>([]);
    const changed = useRef(onContentItemVisibilityChange);
    changed.current = onContentItemVisibilityChange;
    const register = shellbar?.registerContextArea;

    useLayoutEffect(() => {
        if (!register) return;
        /** Children sorted by priority: the attribute value, or the position. */
        const items = () =>
            [...(el.current?.children ?? [])]
                .map((child, index) => {
                    const value = child.getAttribute('data-hide-priority');
                    const priority = value === null || value === '' ? NaN : Number(value);
                    return { el: child as HTMLElement, priority: isNaN(priority) ? index + 1 : priority };
                })
                .sort((a, b) => a.priority - b.priority)
                .map((i) => i.el);
        register({
            showAll: () => items().forEach((item) => (item.style.display = '')),
            hideWhile: (exceeds) => {
                const all = items();
                const next: HTMLElement[] = [];
                for (let i = all.length - 1; i >= 0 && exceeds(); i--) {
                    all[i]!.style.display = 'none';
                    next.push(all[i]!);
                }
                const differs =
                    next.length !== hidden.current.length || next.some((item) => !hidden.current.includes(item));
                hidden.current = next;
                if (differs) changed.current?.(next);
            }
        });
        return () => register(null);
    }, [register]);

    return (
        <div
            role="group"
            aria-label={ariaLabel ?? undefined}
            {...props}
            ref={mergeRefs(el, ref)}
            className={cn(
                'order-2 m-0 box-border flex min-w-0 flex-none items-center gap-2 p-0 [&>[data-hide-priority]]:shrink-0',
                className
            )}
        />
    );
}

export interface ShellbarSearchProps extends Omit<
    ComponentProps<'div'>,
    'defaultValue' | 'onChange' | 'children' | 'placeholder'
> {
    /** The text, for a controlled search (with `onValueChange`). */
    value?: string;
    /** The initial text, for an uncontrolled search. */
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string | null;
    clearLabel?: string;
    submitLabel?: string;
    /** Called with the text on Enter or the search button. */
    onSearchSubmit?: (value: string) => void;
    /** Ref of the input. */
    inputRef?: Ref<HTMLInputElement>;
}

const SEARCH_ADDON =
    'me-1 size-auto! h-(--sb-btn-h)! max-h-none! w-(--sb-btn-w)! min-w-(--sb-btn-w)! shrink-0 rounded-(--sb-btn-r)! px-0! focus:after:-inset-px focus:after:rounded-(--sb-btn-r)';

/**
 * A search field for the shellbar (`role="search"`): a rounded input with clear and search buttons. On extra large
 * shellbars it sits in the middle; on smaller ones a search button in the actions opens it, and on small ones it
 * replaces everything else, with a Cancel button. Enter and the search button call `onSearchSubmit`; Escape closes
 * a search opened from its button. `aria-label` (default "Search") names the input; other native props, `className`
 * and `ref` go to the field.
 */
export function ShellbarSearch({
    value: valueProp,
    defaultValue = '',
    onValueChange,
    placeholder = 'Search',
    'aria-label': ariaLabel = 'Search',
    clearLabel = 'Clear',
    submitLabel = 'Search',
    onSearchSubmit,
    inputRef,
    className,
    ...props
}: ShellbarSearchProps) {
    const shellbar = useContext(ShellbarContext);
    const input = useRef<HTMLInputElement | null>(null);
    const [ownValue, setOwnValue] = useState(defaultValue);
    const value = valueProp ?? ownValue;
    const setValue = (next: string) => {
        if (valueProp === undefined) setOwnValue(next);
        onValueChange?.(next);
    };
    const size = shellbar?.size;
    const center = !!shellbar?.searchInCenter;

    // the search opened from its button takes the focus once it is rendered in its place
    useEffect(() => {
        if (input.current && shellbar?.takeFocusRequest()) input.current.focus();
    });

    const submit = () => {
        onSearchSubmit?.(value);
        // an empty search closes the field opened from the search button
        if (!value) shellbar?.closeSearch();
    };

    const field = (
        <div
            role="search"
            {...props}
            className={cn(
                'relative m-0 box-border flex h-sap-element-height cursor-text items-center border-none p-0 text-sap-field-text-color',
                '[--sb-btn-w:1.75rem] [--sb-btn-h:var(--sapElement_Compact_Height)] [--sb-btn-r:1.063rem] hc:[--sb-btn-w:2.25rem] hc:[--sb-btn-h:var(--sapElement_Height)] hc:[--sb-btn-r:var(--sapButton_BorderCornerRadius)]',
                // the field's bottom border line comes with the background style, as fundamental-styles'
                'rounded-[1.125rem] [background:var(--sapField_BackgroundStyle)_var(--sapShell_InteractiveBackground)] [box-shadow:var(--sapField_Shadow)] hc:rounded-none',
                'hover:[background:var(--sapField_Hover_BackgroundStyle)_var(--sapShell_Hover_Background)] hover:[box-shadow:var(--sapField_Hover_Shadow)] hc:hover:[background:transparent]',
                'has-[input:focus]:[background:transparent] has-[input:focus]:[box-shadow:0_0_0_0.125rem_var(--sapButton_Lite_Active_BorderColor)] hc:has-[input:focus]:[box-shadow:none]',
                size === 's'
                    ? 'w-full max-w-full'
                    : center
                      ? 'w-[25rem] max-w-[25rem]'
                      : size === 'm'
                        ? 'max-w-60'
                        : 'max-w-[25rem]',
                className
            )}
        >
            <input
                ref={mergeRefs(input, inputRef)}
                type="search"
                className={cn(
                    'm-0 box-border h-full min-w-0 flex-1 appearance-none border-none bg-transparent py-0 ps-3.5 pe-1 outline-none',
                    'font-sap-font-family text-sap-font-size text-sap-field-text-color placeholder:text-sap-field-placeholder-text-color placeholder:italic',
                    '[&::-webkit-search-cancel-button]:hidden',
                    'hc:border-(length:--sapElement_BorderWidth) hc:border-solid hc:border-sap-shell-interactive-border-color hc:bg-sap-shell-interactive-background',
                    'hc:hover:bg-transparent hc:focus:border-(length:--sapContent_FocusWidth) hc:focus:[border-style:var(--sapContent_FocusStyle)] hc:focus:bg-sap-shell-active-background',
                    center && size === 'xl' ? 'w-60' : size === 'm' ? 'w-auto max-w-24' : 'w-auto'
                )}
                placeholder={placeholder ?? undefined}
                aria-label={ariaLabel}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => {
                    if (event.key === 'Enter') submit();
                    else if (event.key === 'Escape' && shellbar?.searchOpen) {
                        event.preventDefault();
                        shellbar.closeSearch();
                    }
                }}
            />
            {value && (
                <Button
                    variant="transparent"
                    glyph="decline"
                    aria-label={clearLabel}
                    className={SEARCH_ADDON}
                    onClick={() => {
                        setValue('');
                        input.current?.focus();
                    }}
                />
            )}
            <Button
                variant="transparent"
                glyph="search"
                aria-label={submitLabel}
                // the search button turns emphasized while the field is focused and has text
                className={cn(
                    SEARCH_ADDON,
                    value &&
                        '[input:focus~&]:border-sap-button-emphasized-border-color [input:focus~&]:bg-sap-button-emphasized-background [input:focus~&]:text-sap-button-emphasized-text-color'
                )}
                onClick={submit}
            />
        </div>
    );

    if (!shellbar) return field;
    return shellbar.searchTarget ? createPortal(field, shellbar.searchTarget) : null;
}

export interface ShellbarActionProps extends Omit<ButtonProps, 'variant' | 'label' | 'children' | 'glyph'> {
    glyph?: string | null;
    glyphFont?: IconFont;
    /** Text of the action: its accessible name (unless `aria-label`), title and name in the overflow menu. */
    label?: string;
    /** Announced after the name with a notification count, e.g. "5 unread" (default: the count). */
    notificationLabel?: string | null;
    /** Shows a badge with the count. */
    notificationCount?: number | null;
    /** Button type (Angular's `fdType`). */
    variant?: ButtonVariant;
    /** Shows the action pressed (`aria-pressed`). */
    toggled?: boolean;
}

/**
 * An action button of the shellbar, with an optional notification count. Actions collapse into the overflow menu when
 * the shellbar runs out of space. Native props, `className`, `ref` and `onClick` (Angular's `callback`) go to the
 * button.
 */
export function ShellbarAction({
    glyph,
    glyphFont = 'SAP-icons',
    label = '',
    notificationLabel,
    notificationCount,
    variant = 'transparent',
    toggled = false,
    title,
    'aria-label': ariaLabelProp,
    ...props
}: ShellbarActionProps) {
    const name = ariaLabelProp || label;
    /** The name with the notifications, e.g. "Notifications, 5 unread". */
    const accessibleName = notificationCount ? `${name}, ${notificationLabel || notificationCount}` : name;
    return (
        <div {...{ [COLLAPSIBLE]: '' }} className="flex shrink-0">
            <Button
                {...props}
                variant={variant}
                glyph={glyph}
                glyphFont={glyphFont}
                toggled={toggled}
                aria-label={accessibleName || undefined}
                title={title || ariaLabelProp || label || undefined}
            >
                {!!notificationCount && <ButtonBadge aria-hidden="true">{notificationCount}</ButtonBadge>}
            </Button>
        </div>
    );
}

export interface ShellbarActionsProps extends ComponentProps<'div'> {
    /** The user of a simple user menu (an avatar with a menu). */
    user?: ShellbarUser | null;
    /** The items of the simple user menu. */
    userMenu?: ShellbarUserMenuItem[] | null;
    /** Closes the simple user menu when an item is chosen. */
    closePopoverOnSelect?: boolean;
    /** The product switch, after the user menu (Angular's projected `fd-product-switch`). */
    productSwitch?: ReactNode;
    /** Shows a help button for assistive tools. */
    assistiveTools?: boolean;
    onAssistiveToolsClick?: (event: ReactMouseEvent<HTMLElement>) => void;
    assistiveToolsLabel?: string;
    /** Name of the overflow button and its menu. */
    overflowLabel?: string;
    /** Name of the search button and its overflow item. */
    searchLabel?: string;
}

/**
 * The actions of the shellbar: `ShellbarAction`s, the search button, the simple user menu (`user` and `userMenu`, or
 * a `ShellbarUserMenu` child), the full user menu (a `UserMenu` child) and the product switch, in this order. Actions
 * that do not fit collapse into an overflow menu (an action sheet), whose button shows the sum of their
 * notifications. Other children go first.
 */
export function ShellbarActions({
    user,
    userMenu,
    closePopoverOnSelect = false,
    productSwitch,
    assistiveTools = false,
    onAssistiveToolsClick,
    assistiveToolsLabel = 'Assistive Tools',
    overflowLabel = 'Collapsed Item Menu',
    searchLabel = 'Search',
    className,
    children,
    ref,
    ...props
}: ShellbarActionsProps) {
    const shellbar = useContext(ShellbarContext);
    const el = useRef<HTMLDivElement | null>(null);
    const overflowEl = useRef<HTMLDivElement | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const parts = partition(children);
    const actions = parts.take(ShellbarAction) as ReactElement<ShellbarActionProps>[];
    const userMenus = parts.take(ShellbarUserMenu);
    const fullUserMenus = parts.take(UserMenu) as ReactElement<ComponentProps<typeof UserMenu>>[];
    const others = parts.rest();

    const totalNotifications = actions.reduce((sum, a) => sum + (Number(a.props.notificationCount) || 0), 0);
    const showSearchButton = !!shellbar?.hasSearch && !shellbar.searchInCenter && !shellbar.searchOpen;
    const register = shellbar?.registerActions;

    useLayoutEffect(() => {
        if (!register || !el.current) return;
        const root = el.current;
        register({
            el: root,
            setOverflow: (overflow) => {
                if (overflowEl.current) overflowEl.current.style.display = overflow ? 'flex' : '';
                root.querySelectorAll<HTMLElement>(`[${COLLAPSIBLE}]`).forEach((item) => {
                    item.style.display = overflow ? 'none' : '';
                });
            }
        });
        return () => register(null);
    }, [register]);

    const close = () => setSheetOpen(false);
    const flex = shellbar?.groupFlex?.actions;

    return (
        <div
            {...props}
            ref={mergeRefs(el, ref)}
            className={cn(
                'order-3 m-0 box-border flex shrink-0 items-center justify-end gap-2 p-0',
                shellbar?.size === 's' && 'gap-0.5',
                flex?.shrink && 'shrink grow-0',
                flex?.flexBasisAuto && 'basis-auto',
                // after a context area the actions keep to the end
                shellbar?.hasContextArea && 'ms-auto',
                className
            )}
        >
            <div ref={shellbar?.setSearchOutlet} className="flex min-w-0 empty:hidden" />
            <div ref={overflowEl} className="hidden">
                <ActionSheet placement="bottom-end" open={sheetOpen} onOpenChange={setSheetOpen}>
                    <ActionSheetControl
                        render={
                            <Button
                                variant="transparent"
                                glyph="overflow"
                                aria-label={
                                    totalNotifications ? `${overflowLabel}, ${totalNotifications}` : overflowLabel
                                }
                                title={overflowLabel}
                            >
                                {!!totalNotifications && (
                                    <ButtonBadge aria-hidden="true">{totalNotifications}</ButtonBadge>
                                )}
                            </Button>
                        }
                    />
                    <ActionSheetBody aria-label={overflowLabel}>
                        {showSearchButton && (
                            <ActionSheetItem
                                glyph="search"
                                label={searchLabel}
                                onClick={() => {
                                    shellbar?.openSearch();
                                    close();
                                }}
                            />
                        )}
                        {actions.map((action, index) => {
                            const p = action.props;
                            return (
                                <ActionSheetItem
                                    key={action.key ?? index}
                                    variant={p.variant ?? 'transparent'}
                                    toggled={p.toggled}
                                    glyph={p.glyph}
                                    glyphFont={p.glyphFont}
                                    label={p.label || p['aria-label']}
                                    onClick={(event) => {
                                        p.onClick?.(event as never);
                                        close();
                                    }}
                                >
                                    {!!p.notificationCount && <ButtonBadge>{p.notificationCount}</ButtonBadge>}
                                </ActionSheetItem>
                            );
                        })}
                        {onAssistiveToolsClick && (
                            <ActionSheetItem
                                glyph="sys-help"
                                label={assistiveToolsLabel}
                                onClick={(event) => {
                                    onAssistiveToolsClick(event);
                                    close();
                                }}
                            />
                        )}
                    </ActionSheetBody>
                </ActionSheet>
            </div>
            {others}
            {showSearchButton && (
                <div {...{ [COLLAPSIBLE]: '' }} className="flex shrink-0">
                    <Button
                        variant="transparent"
                        glyph="search"
                        aria-label={searchLabel}
                        title={searchLabel}
                        onClick={() => shellbar?.openSearch()}
                    />
                </div>
            )}
            {actions}
            {user && !userMenus.length && (
                <ShellbarUserMenu user={user} userMenu={userMenu} closeOnSelect={closePopoverOnSelect} />
            )}
            {userMenus}
            {fullUserMenus.map((menu) => cloneElement(menu, { className: cn('shrink-0', menu.props.className) }))}
            {productSwitch != null && productSwitch !== false && (
                <div className="ms-2 flex shrink-0">{productSwitch}</div>
            )}
            {assistiveTools && (
                <div {...{ [COLLAPSIBLE]: '' }} className="flex shrink-0">
                    <Button
                        variant="transparent"
                        glyph="sys-help"
                        aria-label={assistiveToolsLabel}
                        title={assistiveToolsLabel}
                        onClick={(event) => onAssistiveToolsClick?.(event)}
                    />
                </div>
            )}
        </div>
    );
}

const USER_MENU_BUTTON = 'h-fit! max-h-none! min-w-fit! rounded-[20rem]! p-0! focus:after:rounded-[20rem]!';

export interface ShellbarUserMenuProps extends Omit<ComponentProps<'div'>, 'children'> {
    user?: ShellbarUser | null;
    /** Items of the menu; `children` add more (`MenuItem`s). */
    userMenu?: ShellbarUserMenuItem[] | null;
    children?: ReactNode;
    /** Replaces the avatar button (Angular's `fdShellbarUserMenuButton`); it gets the round button classes. */
    button?: ReactElement;
    /** Name of the menu (default: the user's name). */
    menuLabel?: string;
    placement?: Placement;
    triggers?: MenuProps['triggers'];
    fillControlMode?: PopoverFillMode | null;
    closeOnEscapeKey?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnSelect?: boolean;
    disabled?: boolean;
    /** Called with the chosen item, before its `callback`. */
    onItemClick?: (item: ShellbarUserMenuItem) => void;
}

/**
 * A simple user menu: the user's avatar (in a round transparent button) opening a menu of items, on the `menu`
 * component. `aria-label` names the avatar (default: the user's name or initials); other native props go to the
 * wrapper.
 *
 * ```tsx
 * <ShellbarUserMenu user={{ fullName: 'Lisa Miller' }} userMenu={[{ text: 'Sign out', callback: signOut }]} />
 * ```
 */
export function ShellbarUserMenu({
    user,
    userMenu,
    children,
    button,
    menuLabel,
    placement = 'bottom-end',
    triggers,
    fillControlMode = null,
    closeOnEscapeKey = true,
    closeOnOutsideClick = true,
    closeOnSelect = true,
    disabled = false,
    onItemClick,
    'aria-label': ariaLabel,
    className,
    ...props
}: ShellbarUserMenuProps) {
    const name = user?.fullName ?? user?.initials ?? undefined;
    return (
        <div {...props} className={cn('flex shrink-0', className)}>
            <Menu
                placement={placement}
                triggers={triggers}
                fillControlMode={fillControlMode}
                closeOnEscapeKey={closeOnEscapeKey}
                closeOnOutsideClick={closeOnOutsideClick}
                closeOnSelect={closeOnSelect}
                disabled={disabled}
            >
                <MenuTrigger
                    className={USER_MENU_BUTTON}
                    render={
                        button ?? (
                            <Button variant="transparent" disabled={disabled}>
                                <Avatar
                                    size="xs"
                                    circle
                                    colorAccent={user?.colorAccent ?? null}
                                    label={user?.image ? null : name}
                                    aria-label={ariaLabel || name}
                                    image={user?.image ?? null}
                                />
                            </Button>
                        )
                    }
                />
                <MenuPopup aria-label={menuLabel ?? name}>
                    {(userMenu ?? []).map((item, index) => (
                        <MenuItem
                            key={index}
                            onClick={(event) => {
                                onItemClick?.(item);
                                item.callback?.(event);
                            }}
                        >
                            {item.text}
                        </MenuItem>
                    ))}
                    {children}
                </MenuPopup>
            </Menu>
        </div>
    );
}

const PRODUCT_TITLE =
    'm-0 box-border truncate p-0 font-sap-font-semibold-duplex-family text-sap-font-header5-size font-normal text-sap-shell-sub-brand-text-color';

export interface ProductMenuProps extends ComponentProps<'div'> {
    /** The product name. */
    control?: ReactNode;
    /** Related products or apps; without them the name is a plain heading. */
    items?: ShellbarMenuItem[] | null;
    placement?: Placement;
    triggers?: MenuProps['triggers'];
    fillControlMode?: PopoverFillMode | null;
    closeOnEscapeKey?: boolean;
    closeOnOutsideClick?: boolean;
    closePopoverOnSelect?: boolean;
    disabled?: boolean;
}

/**
 * The product name as a menu of related products or apps (a transparent menu button, on the `menu` component), or
 * as a plain heading (`<h1>`) without items. Items with a `link` are links (`newTab` opens a new tab).
 */
export function ProductMenu({
    control,
    items,
    placement = 'bottom-end',
    triggers,
    fillControlMode = null,
    closeOnEscapeKey = true,
    closeOnOutsideClick = true,
    closePopoverOnSelect = false,
    disabled = false,
    className,
    ...props
}: ProductMenuProps) {
    return (
        <div {...props} className={cn('flex min-w-0 flex-col', className)}>
            {items?.length ? (
                <Menu
                    placement={placement}
                    triggers={triggers}
                    fillControlMode={fillControlMode}
                    closeOnEscapeKey={closeOnEscapeKey}
                    closeOnOutsideClick={closeOnOutsideClick}
                    closeOnSelect={closePopoverOnSelect}
                    disabled={disabled}
                >
                    <MenuTrigger
                        render={
                            <Button
                                variant="transparent"
                                glyph="slim-arrow-down"
                                glyphPosition="after"
                                className="min-w-0 max-w-full"
                                disabled={disabled}
                            >
                                <span className={PRODUCT_TITLE}>{control}</span>
                            </Button>
                        }
                    />
                    <MenuPopup aria-label={typeof control === 'string' ? control : undefined}>
                        {items.map((item, index) => (
                            <MenuItem
                                key={index}
                                render={
                                    item.link ? (
                                        <a
                                            href={item.link}
                                            target={item.newTab ? '_blank' : undefined}
                                            rel={item.newTab ? 'noreferrer' : undefined}
                                        />
                                    ) : undefined
                                }
                                onClick={(event) => item.callback?.(event)}
                            >
                                <MenuTitle>{item.name}</MenuTitle>
                                {item.glyph && <MenuAddon glyph={item.glyph} />}
                            </MenuItem>
                        ))}
                    </MenuPopup>
                </Menu>
            ) : (
                <h1 className={PRODUCT_TITLE}>{control}</h1>
            )}
        </div>
    );
}
