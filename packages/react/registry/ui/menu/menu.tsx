/*
 * Port of fundamental-react (Menu) and @fundamental-ngx/core (menu) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { useRender } from '@base-ui/react/use-render';
import {
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type CSSProperties,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    type ReactElement,
    type ReactNode,
    type Ref
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { BarElement, BarLeft, BarRight, ButtonBar } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import {
    Dialog,
    DialogBody,
    DialogCloseButton,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle,
    type DialogPopupProps
} from '@/ui/dialog/dialog';
import { Icon } from '@/ui/icon/icon';
import { Input, type InputProps } from '@/ui/input/input';
import {
    getPlacement,
    normalizeTriggers,
    popoverSurfaceVariants,
    type Placement,
    type PopoverFillMode,
    type TriggerConfig
} from '@/ui/popover/popover';

/* ------------------------------------------------------------------------------------------------------------------
 * Classes
 * ---------------------------------------------------------------------------------------------------------------- */

/** Sizes of menu items, as CSS variables on each list: cozy, compact and mobile. */
const LIST_VARS = [
    '[--mi-icon-w:2.25rem] [--mi-h:2.75rem] [--mi-pad:0.75rem] [--mi-sub-pad:1rem] [--mi-sc-pl:1rem] [--mi-sc-pr:0.75rem] [--mi-text-r:0.75rem]',
    'compact:[--mi-icon-w:2rem] compact:[--mi-h:2rem] compact:[--mi-pad:0.5rem] compact:[--mi-sub-pad:0.5rem] compact:[--mi-sc-pr:0.5rem] compact:[--mi-text-r:0.5rem]',
    '[--mi-pl:var(--mi-pad)] [--mi-pr:var(--mi-pad)]',
    '[--mr:var(--sapPopover_BorderCornerRadius)]'
].join(' ');
const MOBILE_VARS =
    '[--mi-icon-w:2.75rem]! [--mi-pad:1rem]! [--mi-sc-pr:1rem]! compact:[--mi-sc-pr:0.5rem]! [--mi-text-r:1rem]! [--mr:0]!';
/** Lists with icons align their texts after the icon column instead of padding the items. */
const ICON_VARS = '[--mi-pl:0]! [--mi-pr:0]!';
/** In a menu with icons, a submenu without icons gets wider paddings. */
const SUBMENU_PADDING_VARS = '[--mi-pl:var(--mi-sub-pad)] [--mi-pr:var(--mi-sub-pad)]';

const LIST = 'm-0 box-border flex list-none flex-col flex-nowrap p-0 max-w-80 rounded-(--mr)';
const NAV = 'm-0 box-border block w-fit p-0 font-sap-font-family text-sap-font-size outline-none';
const SUBMENU_LIST =
    'min-w-(--anchor-width) bg-sap-list-background [box-shadow:var(--sapContent_Shadow1)] outline-none';

const LIST_ITEM = 'relative m-0 box-border w-full max-w-full p-0 bg-sap-list-background';
const LIST_ITEM_ENDS = 'first:rounded-t-(--mr) last-of-type:rounded-b-(--mr)';
const SEPARATOR = 'border-b border-solid border-sap-group-content-border-color';

const INTERACTIVE = [
    'relative m-0 box-border flex w-full min-h-(--mi-h) cursor-pointer items-center p-0 ps-(--mi-pl) pe-(--mi-pr)',
    'rounded-[inherit] no-underline outline-none bg-(--mi-bg) border-b border-solid border-b-(--mi-bb)',
    '[--mi-bg:var(--sapList_Background)] [--mi-bb:transparent] [--mi-ic:var(--sapContent_NonInteractiveIconColor)] [--mi-sc:var(--sapContent_LabelColor)] [--mi-tc:var(--sapList_TextColor)]',
    'enabled-hover:[--mi-bg:var(--sapList_Hover_Background)]',
    // focus: an inner frame
    "focus:after:pointer-events-none focus:after:absolute focus:after:inset-0.5 focus:after:content-['']",
    'focus:after:border-(length:--sapContent_FocusWidth) focus:after:[border-style:var(--sapContent_FocusStyle)] focus:after:border-sap-content-focus-color',
    // pressed
    'enabled-active:[--mi-bg:var(--sapList_Active_Background)] enabled-active:[--mi-ic:var(--sapList_Active_TextColor)] enabled-active:after:hidden'
].join(' ');
/** An open submenu, or an item shown as the current choice. */
const INTERACTIVE_SELECTED =
    'not-active:[--mi-bg:var(--sapList_SelectionBackgroundColor)] not-active:[--mi-bb:var(--sapList_SelectionBorderColor)] not-active:enabled-hover:[--mi-bg:var(--sapList_Hover_SelectionBackground)]';
/** fundamental-react's `active`: the pressed look while not pressed. */
const INTERACTIVE_ACTIVE = '[--mi-bg:var(--sapList_Active_Background)]! [--mi-ic:var(--sapList_Active_TextColor)]!';
const INTERACTIVE_DISABLED = 'pointer-events-none opacity-(--sapContent_DisabledOpacity) focus:after:hidden';

const ADDON =
    'm-0 box-border flex shrink-0 items-center justify-center p-0 w-(--mi-icon-w) min-w-(--mi-icon-w) self-stretch bg-transparent text-sap-font-large-size text-(--mi-ic)';

/** Texts of a list with icons start after the icon column, unless an addon precedes them. */
const TEXT_IN_ICON_LIST =
    '[[data-menu-icons]>[data-menu-link]>&]:first:ms-(--mi-icon-w) [[data-menu-icons]>[data-menu-link]>&]:last:me-(--mi-text-r)';

/* ------------------------------------------------------------------------------------------------------------------
 * Contexts
 * ---------------------------------------------------------------------------------------------------------------- */

/** An activated item of the active path: an open submenu or the last selected item. */
export interface MenuPathItem {
    /** The `id` of the item element. */
    id: string;
    /** The text of the item's `MenuTitle` (or its `label`). */
    title: string;
    /** Whether the item opens a submenu. */
    submenu: boolean;
}

/** Options of the dialog a mobile menu opens in. */
export interface MenuMobileConfig {
    /** Title of the dialog at the first level; deeper levels show the title of their parent item. */
    title?: string;
    /** Text of an emphasized footer button that closes the menu. */
    approveButtonText?: string;
    /** Text of a footer button that closes the menu. */
    cancelButtonText?: string;
    /** Shows the close button in the header (default true). */
    hasCloseButton?: boolean;
    /** Props of the dialog window (Angular's `dialogConfig`), e.g. `className` or `mobileOuterSpacing`. */
    dialogProps?: Partial<DialogPopupProps>;
}

/** Details of an open state change: `reason` (`trigger-press`, `item-press`, `escape-key`, ...) and `event`. */
export interface MenuOpenChangeDetails {
    reason: string;
    event?: Event;
}

/** A handle that connects a `Menu` with triggers rendered elsewhere, and opens or closes it from code. */
export type MenuHandle<Payload = unknown> = BaseMenu.Handle<Payload>;

/**
 * Creates a handle for a menu whose trigger lives outside of it, or to open and close a (desktop) menu from code.
 *
 * ```tsx
 * const actions = createMenuHandle();
 * <MenuTrigger handle={actions} render={<Button menu label="Actions" />} />
 * <Menu handle={actions}><MenuPopup aria-label="Actions">…</MenuPopup></Menu>
 * ```
 */
export const createMenuHandle: <Payload = unknown>() => MenuHandle<Payload> = BaseMenu.createHandle;

interface MenuContextValue {
    open: boolean;
    setOpen: (open: boolean, details?: MenuOpenChangeDetails) => void;
    disabled: boolean;
    mobile: boolean;
    mobileConfig: MenuMobileConfig;
    placement: Placement;
    sideOffset: number;
    alignOffset: number;
    fixedPosition: boolean;
    fillControlMode: PopoverFillMode | null;
    disableScrollbar: boolean;
    focusTrapped: boolean;
    focusAutoCapture: boolean;
    restoreFocusOnClose: boolean;
    closeOnSelect: boolean;
    openOnHoverTime: number;
    hoverTrigger: boolean;
    path: MenuPathItem[];
    setPath: (path: MenuPathItem[]) => void;
    /** The id of the menu element, for the trigger's `aria-controls` in mobile mode. */
    listId: string;
    setListId: (id: string | null) => void;
    /** Mobile mode: where the lists of the submenu levels render. */
    levels: HTMLElement | null;
    setLevels: (element: HTMLElement | null) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

interface MenuLevelContextValue {
    /** The items that lead to this list, from the root. */
    ancestors: MenuPathItem[];
    /** Whether any item of this list shows an icon. */
    icons: boolean;
    registerIcon: () => () => void;
    /** Inside a single-choice group. */
    group: boolean;
}

const ROOT_LEVEL: MenuLevelContextValue = {
    ancestors: [],
    icons: false,
    registerIcon: () => () => undefined,
    group: false
};
const MenuLevelContext = createContext<MenuLevelContextValue>(ROOT_LEVEL);

interface MenuItemContextValue {
    registerInput: () => () => void;
    registerIcon: () => () => void;
}

const MenuItemContext = createContext<MenuItemContextValue | null>(null);

interface MenuRadioContextValue {
    value: unknown;
    setValue: (value: unknown, event?: Event) => void;
    disabled: boolean;
}

const MenuRadioContext = createContext<MenuRadioContextValue | null>(null);

/** The submenu an item passes to its `Submenu`: the path to it and, in mobile mode, whether it is shown. */
interface SubmenuContextValue {
    ancestors: MenuPathItem[];
    parentId: string;
    parentTitle: () => string;
    /** Mobile mode: the level is the current one (shown), or an ancestor of it (hidden). */
    current: boolean;
}

const SubmenuContext = createContext<SubmenuContextValue | null>(null);

/** The element the root menu is rendered into: its submenus go there too. */
const MenuContainerContext = createContext<BaseMenu.Portal.Props['container']>(undefined);

/* ------------------------------------------------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------------------------------------------------- */

/** A stable function that always calls the latest `fn`. */
function useEvent<A extends unknown[], R>(fn: ((...args: A) => R) | undefined): (...args: A) => R | undefined {
    const ref = useRef(fn);
    useLayoutEffect(() => {
        ref.current = fn;
    });
    return useCallback((...args: A) => ref.current?.(...args), []);
}

/** A count of registered things (icons, inputs), with a register function that returns its cleanup. */
function useRegistry(): [boolean, () => () => void] {
    const [count, setCount] = useState(0);
    const register = useCallback(() => {
        setCount((n) => n + 1);
        return () => setCount((n) => n - 1);
    }, []);
    return [count > 0, register];
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
    const [own, setOwn] = useState(defaultValue);
    const controlled = value !== undefined;
    const current = controlled ? value : own;
    const change = useEvent(onChange);
    const set = useCallback(
        (next: T) => {
            if (!controlled) setOwn(next);
            change(next);
        },
        [controlled, change]
    );
    return [current, set] as const;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
    if (typeof ref === 'function') ref(value);
    else if (ref) (ref as { current: T | null }).current = value;
}

/** The item elements of a list (not of its submenus), in order. */
function listItems(list: HTMLElement): HTMLElement[] {
    return [...list.querySelectorAll<HTMLElement>('[data-menu-link]')].filter(
        (el) => el.closest('[data-menu-list]') === list
    );
}

const isDisabled = (el: HTMLElement) => el.getAttribute('aria-disabled') === 'true' || el.hasAttribute('data-disabled');

/** The first enabled item of a list. */
function firstEnabled(list: HTMLElement | null | undefined): HTMLElement | undefined {
    return list ? listItems(list).find((el) => !isDisabled(el)) : undefined;
}

/** The title of an item, from its `MenuTitle`. */
function titleOf(el: HTMLElement | null, label?: string): string {
    return label ?? el?.querySelector('[data-menu-title]')?.textContent?.trim() ?? el?.textContent?.trim() ?? '';
}

/* ------------------------------------------------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------------------------------------------- */

export interface MenuProps {
    children?: ReactNode;
    /** Whether the menu is open (controlled; Angular's `isOpen`). */
    open?: boolean;
    /** Whether the menu is open initially (uncontrolled). */
    defaultOpen?: boolean;
    /** Called when the menu opens (Angular's `beforeOpen`) or closes; `details.reason` says why. */
    onOpenChange?: (open: boolean, details?: MenuOpenChangeDetails) => void;
    /** Called after the open or close transition has finished. */
    onOpenChangeComplete?: (open: boolean) => void;
    /** Connects triggers outside the menu and opens or closes it from code, see `createMenuHandle`. */
    handle?: MenuHandle;
    /** Imperative `close()` and `unmount()` of a desktop menu (Base UI `actionsRef`). */
    actionsRef?: BaseMenu.Root.Props['actionsRef'];
    /** Preferred placement of the menu; it flips to the other side when there is no room, unless `fixedPosition`. */
    placement?: Placement;
    /** Extra distance from the trigger in px. */
    sideOffset?: number;
    /** Shift along the trigger edge in px. */
    alignOffset?: number;
    /** Keeps the placement even when the menu does not fit. */
    fixedPosition?: boolean;
    /** Menu width relative to the trigger: `at-least` as wide, `equal` exactly as wide, `fit-content` its content. */
    fillControlMode?: PopoverFillMode | null;
    /**
     * How the trigger opens the menu: `click` (default; also Enter, Space and ArrowDown) and/or hover
     * (`mouseenter`/`mouseleave`, closing once the pointer leaves trigger and menu).
     */
    triggers?: readonly (string | TriggerConfig)[];
    /** Prevents opening, disables the trigger and closes an open menu. */
    disabled?: boolean;
    /** Closes on Escape (default true). */
    closeOnEscapeKey?: boolean;
    /** Closes on a press outside the menu and the trigger (default true). */
    closeOnOutsideClick?: boolean;
    /** Traps the focus in a mobile menu (default true); a desktop menu closes on Tab instead. */
    focusTrapped?: boolean;
    /** Focuses the first enabled item when the menu opens (default true). */
    focusAutoCapture?: boolean;
    /** Returns the focus to the trigger when the menu closes (default true). */
    restoreFocusOnClose?: boolean;
    /** Renders the items without the scrolling wrapper. */
    disableScrollbar?: boolean;
    /** Delay in ms before hovering an item opens its submenu (default 0). */
    openOnHoverTime?: number;
    /** Closes the menu when a plain item is selected (not toggles, options or items with an input; default true). */
    closeOnSelect?: boolean;
    /** Opens the menu in a full-screen dialog, with one level at a time. */
    mobile?: boolean;
    /** Title and buttons of the mobile dialog. */
    mobileConfig?: MenuMobileConfig;
    /** Called with the path of activated items from the root: open submenus and the last selected item. */
    onActivePathChange?: (path: MenuPathItem[]) => void;
}

const DEFAULT_TRIGGERS = ['click'] as const;
const DEFAULT_MOBILE_CONFIG: MenuMobileConfig = { hasCloseButton: true };
const HOVER_EVENTS = new Set(['mouseenter', 'mouseleave']);

/**
 * Menu: a list of actions in a popover opened by a `MenuTrigger`, on Base UI's Menu. Items can open submenus, show
 * icons, subtitles and shortcuts, act as toggles (`MenuCheckboxItem`) or as a single-choice group
 * (`MenuRadioGroup`), and hold an input. ArrowUp/ArrowDown, Home and End move between the enabled items;
 * ArrowRight opens a submenu and ArrowLeft closes it (mirrored in RTL); Enter and Space activate; Escape and Tab
 * close. In `mobile` mode it opens in a full-screen dialog, one level at a time.
 *
 * `Menu` renders no element: it holds the state and the options its parts read.
 *
 * ```tsx
 * <Menu>
 *     <MenuTrigger render={<Button menu label="Actions" />} />
 *     <MenuPopup aria-label="Actions">
 *         <MenuItem onClick={edit}>Edit</MenuItem>
 *         <MenuItem submenu={<MenuItem>PDF</MenuItem>}>
 *             <MenuTitle>Export</MenuTitle>
 *             <MenuAddon submenuIndicator />
 *         </MenuItem>
 *     </MenuPopup>
 * </Menu>
 * ```
 */
export function Menu({
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onOpenChangeComplete,
    handle,
    actionsRef,
    placement = 'bottom-start',
    sideOffset = 0,
    alignOffset = 0,
    fixedPosition = false,
    fillControlMode = null,
    triggers = DEFAULT_TRIGGERS,
    disabled = false,
    closeOnEscapeKey = true,
    closeOnOutsideClick = true,
    focusTrapped = true,
    focusAutoCapture = true,
    restoreFocusOnClose = true,
    disableScrollbar = false,
    openOnHoverTime = 0,
    closeOnSelect = true,
    mobile = false,
    mobileConfig = DEFAULT_MOBILE_CONFIG,
    onActivePathChange
}: MenuProps) {
    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const open = (openProp ?? ownOpen) && !disabled;
    const changed = useEvent(onOpenChange);
    const setOpen = useCallback(
        (next: boolean, details?: MenuOpenChangeDetails) => {
            if (openProp === undefined) setOwnOpen(next);
            changed(next, details);
        },
        [openProp, changed]
    );

    const normalized = useMemo(() => normalizeTriggers(triggers), [triggers]);
    const clickTrigger = normalized.some((t) => t.trigger === 'click');
    const hoverTrigger = normalized.some((t) => HOVER_EVENTS.has(t.trigger));

    const [path, setPathState] = useState<MenuPathItem[]>([]);
    const pathRef = useRef(path);
    const pathChanged = useEvent(onActivePathChange);
    const setPath = useCallback(
        (next: MenuPathItem[]) => {
            const current = pathRef.current;
            if (current.length === next.length && current.every((item, i) => item.id === next[i]!.id)) return;
            pathRef.current = next;
            setPathState(next);
            pathChanged(next);
        },
        [pathChanged]
    );
    // a closed menu starts again from the root
    useEffect(() => {
        if (!open) setPath([]);
    }, [open, setPath]);
    // a menu disabled while open closes
    useEffect(() => {
        if (disabled && (openProp ?? ownOpen)) setOpen(false, { reason: 'none' });
    }, [disabled, openProp, ownOpen, setOpen]);

    const autoId = useId();
    const [listIdOverride, setListId] = useState<string | null>(null);
    const listId = listIdOverride ?? `fd-menu-${autoId}`;
    const [levels, setLevels] = useState<HTMLElement | null>(null);

    const context = useMemo<MenuContextValue>(
        () => ({
            open,
            setOpen,
            disabled,
            mobile,
            mobileConfig,
            placement,
            sideOffset,
            alignOffset,
            fixedPosition,
            fillControlMode,
            disableScrollbar,
            focusTrapped,
            focusAutoCapture,
            restoreFocusOnClose,
            closeOnSelect,
            openOnHoverTime,
            hoverTrigger,
            path,
            setPath,
            listId,
            setListId,
            levels,
            setLevels
        }),
        [
            open,
            setOpen,
            disabled,
            mobile,
            mobileConfig,
            placement,
            sideOffset,
            alignOffset,
            fixedPosition,
            fillControlMode,
            disableScrollbar,
            focusTrapped,
            focusAutoCapture,
            restoreFocusOnClose,
            closeOnSelect,
            openOnHoverTime,
            hoverTrigger,
            path,
            setPath,
            listId,
            levels
        ]
    );

    return (
        <MenuContext.Provider value={context}>
            {mobile ? (
                children
            ) : (
                <BaseMenu.Root
                    open={open}
                    handle={handle}
                    actionsRef={actionsRef}
                    disabled={disabled}
                    // the page stays usable, as in Angular: no scroll lock, no inert page
                    modal={false}
                    // no wrap-around past the ends, and hover does not move the focus
                    loopFocus={false}
                    highlightItemOnHover={false}
                    onOpenChangeComplete={onOpenChangeComplete}
                    onOpenChange={(next, details) => {
                        const { reason, event } = details;
                        const blocked =
                            (next && disabled) ||
                            (reason === 'trigger-press' && !clickTrigger) ||
                            (!next && reason === 'outside-press' && !closeOnOutsideClick) ||
                            // Tab leaves (and closes) the menu; a press on a focusable element outside moves focus first
                            (!next &&
                                reason === 'focus-out' &&
                                !closeOnOutsideClick &&
                                !(event instanceof KeyboardEvent)) ||
                            (!next && reason === 'escape-key' && !closeOnEscapeKey);
                        if (blocked) {
                            details.cancel();
                            return;
                        }
                        setOpen(next, details);
                    }}
                >
                    {children}
                </BaseMenu.Root>
            )}
        </MenuContext.Provider>
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------------------------------------------------- */

export interface MenuTriggerProps extends Omit<BaseMenu.Trigger.Props, 'ref'> {
    ref?: Ref<HTMLElement>;
}

/**
 * The element that opens the menu: a `<button>` by default, with `aria-haspopup="menu"`, `aria-expanded` and
 * `aria-controls`. Render your own control with `render`, e.g. `render={<Button menu label="Actions" />}`. Click,
 * Enter, Space and ArrowDown open the menu. Outside of its `Menu`, connect it with `handle`.
 */
export function MenuTrigger(props: MenuTriggerProps) {
    const context = useContext(MenuContext);
    if (context?.mobile && !props.handle) return <MobileMenuTrigger {...props} context={context} />;
    const { openOnHover, delay, closeDelay, ref, ...rest } = props;
    const hover = !!context?.hoverTrigger;
    return (
        <BaseMenu.Trigger
            {...rest}
            ref={ref as Ref<HTMLButtonElement>}
            openOnHover={openOnHover ?? hover}
            delay={delay ?? (hover ? 0 : undefined)}
            closeDelay={closeDelay ?? (hover ? 50 : undefined)}
        />
    );
}

/** Mobile mode: the trigger toggles the dialog. */
function MobileMenuTrigger({
    context,
    render,
    disabled,
    className,
    style,
    onClick,
    onKeyDown,
    ref,
    // Base UI trigger options with no meaning here
    openOnHover: _openOnHover,
    delay: _delay,
    closeDelay: _closeDelay,
    payload: _payload,
    nativeButton: _nativeButton,
    ...props
}: MenuTriggerProps & { context: MenuContextValue }) {
    const isDisabled = !!disabled || context.disabled;
    const state = { open: context.open, disabled: isDisabled };
    return useRender({
        render: render as useRender.RenderProp,
        defaultTagName: 'button',
        ref,
        props: {
            type: 'button',
            ...props,
            disabled: isDisabled || undefined,
            className: typeof className === 'function' ? className(state as never) : className,
            style: typeof style === 'function' ? style(state as never) : style,
            'aria-haspopup': 'menu',
            'aria-expanded': context.open,
            'aria-controls': context.open ? context.listId : undefined,
            onClick: (event: ReactMouseEvent<HTMLElement>) => {
                onClick?.(event as never);
                // a disabled menu ignores its trigger
                if (!isDisabled) context.setOpen(!context.open, { reason: 'trigger-press', event: event.nativeEvent });
            },
            onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
                onKeyDown?.(event as never);
                if (event.key === 'ArrowDown' && !context.open && !isDisabled) {
                    event.preventDefault();
                    context.setOpen(true, { reason: 'trigger-press', event: event.nativeEvent });
                }
            }
        }
    });
}

/* ------------------------------------------------------------------------------------------------------------------
 * Popup and lists
 * ---------------------------------------------------------------------------------------------------------------- */

export interface MenuPopupProps extends Omit<ComponentProps<'nav'>, 'role'> {
    /**
     * Role of the menu element (default `menu`). Angular's `role`; Base UI requires `menu` for its keyboard
     * handling, so only change it in mobile mode.
     */
    role?: string;
    /** Classes of the popover surface around the menu (Angular's `additionalBodyClass`). */
    bodyClassName?: string;
    /** Classes of the item list (`<ul>`) inside the menu element. */
    listClassName?: string;
    /** Element the menu and its submenus are rendered into (default `document.body`). */
    container?: BaseMenu.Portal.Props['container'];
    /** Keeps the menu in the DOM while closed (hidden). */
    keepMounted?: boolean;
}

/**
 * The menu: a popover surface next to the trigger (in a portal) with the items as children. Native props, `id`,
 * `aria-label`/`aria-labelledby`, `className` and `ref` go to the menu element (`<nav role="menu">`), whose
 * `<ul>` holds the items. In mobile mode it is a full-screen dialog instead.
 */
export function MenuPopup({ bodyClassName, container, keepMounted, ...props }: MenuPopupProps) {
    const context = useContext(MenuContext);
    const { setListId } = context ?? {};
    useEffect(() => {
        if (!setListId || !props.id) return;
        setListId(props.id);
        return () => setListId(null);
    }, [setListId, props.id]);

    if (context?.mobile) return <MobileMenu {...props} context={context} />;

    const options = context ?? DEFAULT_CONTEXT;
    const { side, align } = getPlacement(options.placement);
    const fill = options.fillControlMode;
    return (
        <BaseMenu.Portal container={container} keepMounted={keepMounted}>
            <BaseMenu.Positioner
                side={side}
                align={align}
                sideOffset={options.sideOffset}
                alignOffset={options.alignOffset}
                collisionAvoidance={
                    options.fixedPosition ? { side: 'none', align: 'none', fallbackAxisSide: 'none' } : undefined
                }
                className="z-[1000]"
            >
                <RootPopup
                    options={options}
                    className={cn(
                        popoverSurfaceVariants({ arrow: false }),
                        'max-h-(--available-height)',
                        bodyClassName
                    )}
                    style={{
                        minWidth: fill === 'at-least' ? 'var(--anchor-width)' : undefined,
                        width: fill === 'equal' ? 'var(--anchor-width)' : undefined
                    }}
                >
                    <MenuContainerContext.Provider value={container}>
                        <MenuList {...props} id={props.id ?? options.listId} mode="desktop" />
                    </MenuContainerContext.Provider>
                </RootPopup>
            </BaseMenu.Positioner>
        </BaseMenu.Portal>
    );
}

const DEFAULT_CONTEXT: MenuContextValue = {
    open: false,
    setOpen: () => undefined,
    disabled: false,
    mobile: false,
    mobileConfig: DEFAULT_MOBILE_CONFIG,
    placement: 'bottom-start',
    sideOffset: 0,
    alignOffset: 0,
    fixedPosition: false,
    fillControlMode: null,
    disableScrollbar: false,
    focusTrapped: true,
    focusAutoCapture: true,
    restoreFocusOnClose: true,
    closeOnSelect: true,
    openOnHoverTime: 0,
    hoverTrigger: false,
    path: [],
    setPath: () => undefined,
    listId: 'fd-menu',
    setListId: () => undefined,
    levels: null,
    setLevels: () => undefined
};

/** The Base UI popup of the root menu: the surface, the scrolling wrapper and the initial focus. */
function RootPopup({
    options,
    className,
    style,
    children
}: {
    options: MenuContextValue;
    className: string;
    style: CSSProperties;
    children: ReactNode;
}) {
    const popup = useRef<HTMLDivElement | null>(null);
    // the first enabled item takes the focus, also when the menu opens by pointer (Base UI focuses the list then)
    const initialFocus = () =>
        options.focusAutoCapture ? (firstEnabled(popup.current?.querySelector('[data-menu-list]')) ?? true) : false;
    return (
        <BaseMenu.Popup
            ref={popup}
            {...({ initialFocus } as object)}
            finalFocus={options.restoreFocusOnClose ? undefined : false}
            className={className}
            style={style}
        >
            {options.disableScrollbar ? (
                children
            ) : (
                <div className="scrollbar-sap relative w-full max-h-full max-w-full overflow-auto rounded-[inherit]">
                    {children}
                </div>
            )}
        </BaseMenu.Popup>
    );
}

type ListMode = 'desktop' | 'submenu' | 'mobile';

interface MenuListProps extends MenuPopupProps {
    mode: ListMode;
}

/**
 * The menu element and its item list, for the root menu, a submenu and a mobile level: the arrow keys skip disabled
 * items, the items get their position in the list, and texts align after the icon column when an item has an icon.
 */
function MenuList({
    mode,
    role,
    listClassName,
    className,
    hidden,
    onKeyDown,
    ref,
    children,
    ...props
}: Omit<MenuListProps, 'bodyClassName' | 'container' | 'keepMounted'>) {
    const parent = useContext(MenuLevelContext);
    const submenu = useContext(SubmenuContext);
    const [icons, registerIcon] = useRegistry();
    const list = useRef<HTMLUListElement | null>(null);

    const level = useMemo<MenuLevelContextValue>(
        () => ({ ancestors: submenu?.ancestors ?? [], icons, registerIcon, group: false }),
        [submenu, icons, registerIcon]
    );

    // aria-posinset/aria-setsize from the items of this list, as Angular
    useLayoutEffect(() => {
        const ul = list.current;
        if (!ul) return;
        const items = listItems(ul);
        items.forEach((el, i) => {
            el.setAttribute('aria-posinset', String(i + 1));
            el.setAttribute('aria-setsize', String(items.length));
        });
    });

    /** ArrowUp/ArrowDown, Home and End move between the enabled items of this list, without wrapping. */
    const navigate = (event: ReactKeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event);
        const ul = list.current;
        if (!ul || event.defaultPrevented) return;
        const current = (event.target as Element).closest<HTMLElement>('[data-menu-link]');
        const items = listItems(ul);
        const index = current ? items.indexOf(current) : -1;
        if (index === -1) return;
        let next: HTMLElement | undefined;
        if (event.key === 'ArrowDown') next = items.slice(index + 1).find((el) => !isDisabled(el));
        else if (event.key === 'ArrowUp')
            next = items
                .slice(0, index)
                .reverse()
                .find((el) => !isDisabled(el));
        else if (event.key === 'Home') next = items.find((el) => !isDisabled(el));
        else if (event.key === 'End') next = [...items].reverse().find((el) => !isDisabled(el));
        else return;
        event.preventDefault();
        // instead of Base UI's list navigation, which moves to disabled items too
        event.stopPropagation();
        next?.focus();
    };

    const ulClass = cn(
        LIST,
        LIST_VARS,
        mode === 'mobile' && ['max-w-full', MOBILE_VARS],
        mode === 'submenu' && [SUBMENU_LIST, parent.icons && !icons && SUBMENU_PADDING_VARS],
        icons && ICON_VARS,
        listClassName
    );
    const ul = (
        <ul ref={list} role="none" data-menu-list="" className={ulClass}>
            {children}
        </ul>
    );
    const navClass = cn(NAV, mode === 'mobile' && 'w-full max-w-full', className);
    const navProps = {
        ...props,
        hidden,
        onKeyDown: navigate,
        className: navClass
    };

    return (
        <MenuLevelContext.Provider value={level}>
            {mode === 'mobile' ? (
                <nav {...navProps} ref={ref} role={role ?? 'menu'}>
                    {ul}
                </nav>
            ) : (
                <BaseMenu.List {...navProps} ref={ref as Ref<HTMLDivElement>} render={<nav />}>
                    {ul}
                </BaseMenu.List>
            )}
        </MenuLevelContext.Provider>
    );
}

/** Mobile mode: the menu in a full-screen dialog, with one level at a time and a back button. */
function MobileMenu({ context, ...props }: MenuPopupProps & { context: MenuContextValue }) {
    const { open, setOpen, mobileConfig: config, path, setPath, setLevels } = context;
    const levels = path.filter((item) => item.submenu);
    const level = levels[levels.length - 1];
    const title = level?.title || config.title || '';
    const titleId = `${context.listId}-title`;
    const close = () => setOpen(false, { reason: 'close-press' });

    const back = () => {
        if (!level) return;
        setPath(path.slice(0, path.indexOf(level)));
        requestAnimationFrame(() => document.getElementById(level.id)?.focus());
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next, details) => setOpen(next, details)}
            escKeyCloseable
            backdropClickCloseable={false}
            focusTrapped={context.focusTrapped}
        >
            <DialogPopup mobile {...config.dialogProps}>
                <DialogHeader>
                    <BarLeft>
                        {level && (
                            <BarElement>
                                <Button
                                    variant="transparent"
                                    glyph="navigation-left-arrow"
                                    aria-label={`Go to previous menu level: ${title}`}
                                    onClick={back}
                                />
                            </BarElement>
                        )}
                        <BarElement className="min-w-0">
                            <DialogTitle level={1} id={titleId}>
                                {title}
                            </DialogTitle>
                        </BarElement>
                    </BarLeft>
                    <BarRight>
                        {config.hasCloseButton !== false && (
                            <BarElement>
                                <DialogCloseButton mobile />
                            </BarElement>
                        )}
                    </BarRight>
                </DialogHeader>
                <DialogBody disablePaddings>
                    <MobileInitialFocus />
                    <MenuList {...props} id={props.id ?? context.listId} mode="mobile" hidden={!!level} />
                    <div ref={setLevels} className="contents" />
                </DialogBody>
                {(config.approveButtonText || config.cancelButtonText) && (
                    <DialogFooter>
                        {config.approveButtonText && (
                            <ButtonBar variant="emphasized" label={config.approveButtonText} onClick={close} />
                        )}
                        {config.cancelButtonText && <ButtonBar label={config.cancelButtonText} onClick={close} />}
                    </DialogFooter>
                )}
            </DialogPopup>
        </Dialog>
    );
}

/** Mobile mode: moves the focus to the first enabled item once the dialog is open. */
function MobileInitialFocus() {
    const context = useContext(MenuContext);
    const self = useRef<HTMLSpanElement | null>(null);
    const capture = context?.focusAutoCapture ?? true;
    useEffect(() => {
        if (!capture) return;
        const frame = requestAnimationFrame(() =>
            firstEnabled(self.current?.parentElement?.querySelector<HTMLElement>('[data-menu-list]'))?.focus()
        );
        return () => cancelAnimationFrame(frame);
    }, [capture]);
    return <span ref={self} hidden />;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Submenu
 * ---------------------------------------------------------------------------------------------------------------- */

export interface SubmenuProps extends Omit<ComponentProps<'nav'>, 'role'> {
    /** Classes of the item list (`<ul>`) inside the submenu element. */
    listClassName?: string;
}

/**
 * The items of a submenu, passed to the parent item: `<MenuItem submenu={<Submenu aria-label="…">…</Submenu>}>`.
 * Only needed for the submenu's own props (`id`, `aria-label`, `className`); `submenu` also takes the items
 * directly. It is labelled by its parent item unless it has an `aria-label`.
 */
export function Submenu(props: SubmenuProps) {
    const context = useContext(MenuContext);
    const submenu = useContext(SubmenuContext);
    const container = useContext(MenuContainerContext);
    if (!submenu) return null;
    if (context?.mobile) {
        if (!context.levels) return null;
        return createPortal(
            <MenuList
                aria-label={props['aria-label'] ?? submenu.parentTitle()}
                {...props}
                mode="mobile"
                hidden={!submenu.current}
                data-menu-level={submenu.parentId}
            />,
            context.levels
        );
    }
    return (
        <BaseMenu.Portal container={container}>
            {/* Angular's inline submenu sits 0.25rem into the item and 0.25rem below its top */}
            <BaseMenu.Positioner side="inline-end" align="start" sideOffset={-4} alignOffset={4} className="z-[1000]">
                <BaseMenu.Popup className="outline-none">
                    <MenuList {...props} mode="submenu" />
                </BaseMenu.Popup>
            </BaseMenu.Positioner>
        </BaseMenu.Portal>
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Items
 * ---------------------------------------------------------------------------------------------------------------- */

type Mark = 'check' | 'dot' | 'empty' | null;

interface ItemBaseProps extends Omit<ComponentProps<'div'>, 'onClick' | 'ref'> {
    /** Renders another element for the item, e.g. `render={<a href="…" />}` or `render={<button />}`. */
    render?: ReactElement;
    /** Link target: renders the item as an `<a href>` (fundamental-react's `url`). */
    href?: string;
    /** Whether the item ignores user interaction (skipped by the arrow keys). */
    disabled?: boolean;
    /** Draws a separator line below the item. */
    hasSeparator?: boolean;
    /** Shows the item as the current choice, e.g. the main action of a split button. */
    selected?: boolean;
    /** Shows the item pressed (fundamental-react's `active`). */
    active?: boolean;
    /** Glyph of an icon before the text (fundamental-react's `addonBefore`). */
    addonBefore?: string;
    /** Glyph of an icon after the text (fundamental-react's `addonAfter`). */
    addonAfter?: string;
    /** Text for typeahead and for the active path, when different from the `MenuTitle`. */
    label?: string;
    /** Props of the `<li>` around the item element. */
    listItemProps?: ComponentProps<'li'>;
    /** Called when the item is activated: a click, Enter or Space (Angular's `onSelect`). */
    onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
    ref?: Ref<HTMLElement>;
}

export interface MenuItemProps extends ItemBaseProps {
    /** The submenu this item opens: its items, or a `Submenu` with its own props. */
    submenu?: ReactNode;
}

/** Wraps plain text children in a `MenuTitle`, as fundamental-react's items. */
function content(children: ReactNode, addonBefore?: string, addonAfter?: string, mark: Mark = null) {
    const text = typeof children === 'string' || typeof children === 'number';
    return (
        <>
            {mark && (
                <span className={ADDON} aria-hidden="true" data-menu-mark={mark}>
                    {mark === 'check' && <Icon glyph="accept" className="text-sap-content-selected-foreground-color" />}
                    {mark === 'dot' && (
                        <span className="size-3 rounded-[100%] bg-sap-content-selected-foreground-color" />
                    )}
                </span>
            )}
            {addonBefore && <MenuAddon glyph={addonBefore} />}
            {text ? <MenuTitle>{children}</MenuTitle> : children}
            {addonAfter && <MenuAddon glyph={addonAfter} />}
        </>
    );
}

function interactiveClass({
    disabled,
    selected,
    active,
    submenu,
    className
}: {
    disabled?: boolean;
    selected?: boolean;
    active?: boolean;
    submenu?: boolean;
    className?: string;
}) {
    return cn(
        INTERACTIVE,
        submenu && 'pe-0',
        selected && INTERACTIVE_SELECTED,
        active && INTERACTIVE_ACTIVE,
        disabled && INTERACTIVE_DISABLED,
        className
    );
}

/** The `<li>` of an item, and the item context its addons and inputs register with. */
function useItemShell(listItemProps: ComponentProps<'li'> | undefined, hasSeparator: boolean | undefined) {
    const level = useContext(MenuLevelContext);
    const [hasInput, registerInput] = useRegistry();
    const itemContext = useMemo<MenuItemContextValue>(
        () => ({ registerInput, registerIcon: level.registerIcon }),
        [registerInput, level.registerIcon]
    );
    const li = (children: ReactNode, extraClass?: string) => (
        <li
            role="none"
            {...listItemProps}
            data-menu-icons={level.icons ? '' : undefined}
            className={cn(
                LIST_ITEM,
                !level.group && LIST_ITEM_ENDS,
                hasSeparator && SEPARATOR,
                extraClass,
                listItemProps?.className
            )}
        >
            <MenuItemContext.Provider value={itemContext}>{children}</MenuItemContext.Provider>
        </li>
    );
    return { level, hasInput, li };
}

/** Enter or Space on an item with an input moves the focus into the input. */
function focusInput(event: ReactKeyboardEvent<HTMLElement>): boolean {
    if (event.key !== 'Enter' && event.key !== ' ') return false;
    if (event.target !== event.currentTarget) return false;
    const input = event.currentTarget.querySelector<HTMLElement>('[data-menu-item-input]');
    if (!input) return false;
    event.preventDefault();
    input.focus();
    return true;
}

/**
 * An item of a menu: an `<li>` with the focusable item element (`role="menuitem"`, a `<div>` by default) inside.
 * Children are its `MenuTitle`, `MenuContent`, `MenuAddon`s and `MenuShortcut`, or plain text (a title). Native
 * props, `className`, `ref` and `onClick` go to the item element; `listItemProps` to the `<li>`. With `submenu` it
 * opens a submenu (ArrowRight, Enter, Space, click or hover).
 */
export function MenuItem(props: MenuItemProps) {
    const {
        submenu,
        render,
        href,
        disabled = false,
        hasSeparator,
        selected,
        active,
        addonBefore,
        addonAfter,
        label,
        listItemProps,
        className,
        children,
        onClick,
        onKeyDown,
        id: idProp,
        ref,
        ...rest
    } = props;
    const menu = useContext(MenuContext) ?? DEFAULT_CONTEXT;
    const { level, hasInput, li } = useItemShell(listItemProps, hasSeparator);
    const autoId = useId();
    const id = idProp ?? `fd-menu-item-${autoId}`;
    const element = useRef<HTMLElement | null>(null);
    const setRef = (node: HTMLElement | null) => {
        element.current = node;
        assignRef(ref, node);
    };
    const entry = (): MenuPathItem => ({ id, title: titleOf(element.current, label), submenu: !!submenu });
    const activate = () => menu.setPath([...level.ancestors, entry()]);
    const renderElement = render ?? (href ? <a href={href} /> : undefined);
    const inner = content(children, addonBefore, addonAfter);
    const submenuNode = submenu == null ? null : isSubmenu(submenu) ? submenu : <Submenu>{submenu}</Submenu>;

    if (menu.mobile) {
        const inPath = !!submenu && menu.path.some((item) => item.id === id);
        const levels = menu.path.filter((item) => item.submenu);
        return li(
            <>
                <MobileItemElement
                    {...rest}
                    id={id}
                    ref={setRef}
                    render={renderElement}
                    role="menuitem"
                    disabled={disabled}
                    className={interactiveClass({ disabled, selected, active, submenu: !!submenu, className })}
                    onKeyDown={onKeyDown}
                    onActivate={(event) => {
                        onClick?.(event);
                        activate();
                        if (submenu) {
                            requestAnimationFrame(() =>
                                firstEnabled(
                                    document.querySelector<HTMLElement>(
                                        `[data-menu-level="${CSS.escape(id)}"] [data-menu-list]`
                                    )
                                )?.focus()
                            );
                        } else if (menu.closeOnSelect && !hasInput) {
                            menu.setOpen(false, { reason: 'item-press', event: event.nativeEvent });
                        }
                    }}
                >
                    {inner}
                </MobileItemElement>
                {inPath && (
                    <SubmenuContext.Provider
                        value={{
                            ancestors: [...level.ancestors, entry()],
                            parentId: id,
                            parentTitle: () => titleOf(element.current, label),
                            current: levels[levels.length - 1]?.id === id
                        }}
                    >
                        {submenuNode}
                    </SubmenuContext.Provider>
                )}
            </>
        );
    }

    if (submenu != null) {
        return (
            <DesktopSubmenuItem
                {...rest}
                id={id}
                setRef={setRef}
                render={renderElement}
                disabled={disabled}
                label={label}
                selected={selected}
                active={active}
                className={className}
                onClick={onClick}
                onKeyDown={onKeyDown}
                li={li}
                ancestors={level.ancestors}
                entry={entry}
                submenu={submenuNode}
            >
                {inner}
            </DesktopSubmenuItem>
        );
    }

    return li(
        <BaseMenu.Item
            {...rest}
            id={id}
            ref={setRef as Ref<HTMLDivElement>}
            render={renderElement}
            nativeButton={renderElement?.type === 'button'}
            disabled={disabled}
            label={label}
            data-menu-link=""
            data-active={active ? '' : undefined}
            data-selected={selected ? '' : undefined}
            closeOnClick={menu.closeOnSelect && !hasInput}
            className={interactiveClass({ disabled, selected, active, className })}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                if (focusInput(event)) event.preventBaseUIHandler();
            }}
            onClick={(event) => {
                onClick?.(event);
                activate();
            }}
        >
            {inner}
        </BaseMenu.Item>
    );
}

function isSubmenu(node: ReactNode): node is ReactElement {
    return isValidElement(node) && node.type === Submenu;
}

/** Desktop item with a submenu: Base UI's SubmenuRoot and SubmenuTrigger. */
function DesktopSubmenuItem({
    id,
    setRef,
    render,
    disabled,
    label,
    selected,
    active,
    className,
    onClick,
    onKeyDown,
    li,
    ancestors,
    entry,
    submenu,
    children,
    ...rest
}: Omit<ItemBaseProps, 'ref'> & {
    id: string;
    setRef: (node: HTMLElement | null) => void;
    li: (children: ReactNode) => ReactNode;
    ancestors: MenuPathItem[];
    entry: () => MenuPathItem;
    submenu: ReactNode;
}) {
    const menu = useContext(MenuContext) ?? DEFAULT_CONTEXT;
    const [open, setOpen] = useState(false);
    // read on every render: the title comes from the rendered item
    const submenuContext: SubmenuContextValue = {
        ancestors: [...ancestors, entry()],
        parentId: id,
        parentTitle: () => entry().title,
        current: open
    };
    return (
        <BaseMenu.SubmenuRoot
            disabled={disabled}
            loopFocus={false}
            highlightItemOnHover={false}
            // Escape closes the whole menu, as in Angular
            closeParentOnEsc
            onOpenChange={(next) => {
                setOpen(next);
                if (next) {
                    menu.setPath([...ancestors, entry()]);
                } else {
                    // closes this submenu and everything below it
                    const index = menu.path.findIndex((item) => item.id === id);
                    if (index !== -1) menu.setPath(menu.path.slice(0, index));
                }
            }}
        >
            {li(
                <>
                    <BaseMenu.SubmenuTrigger
                        {...rest}
                        id={id}
                        ref={setRef as Ref<HTMLDivElement>}
                        render={render}
                        nativeButton={render?.type === 'button'}
                        disabled={disabled}
                        label={label}
                        delay={menu.openOnHoverTime}
                        data-menu-link=""
                        className={(state) =>
                            interactiveClass({
                                disabled,
                                selected: selected || state.open,
                                active,
                                submenu: true,
                                className
                            })
                        }
                        onKeyDown={onKeyDown}
                        onClick={onClick}
                    >
                        {children}
                    </BaseMenu.SubmenuTrigger>
                    <SubmenuContext.Provider value={submenuContext}>{submenu}</SubmenuContext.Provider>
                </>
            )}
        </BaseMenu.SubmenuRoot>
    );
}

/** Mobile mode: an item element without Base UI, activated by click, Enter and Space. */
function MobileItemElement({
    render,
    disabled,
    onActivate,
    onKeyDown,
    ref,
    ...props
}: Omit<ComponentProps<'div'>, 'onClick' | 'ref'> & {
    render?: ReactElement;
    disabled: boolean;
    onActivate: (event: ReactMouseEvent<HTMLElement>) => void;
    ref?: Ref<HTMLElement>;
}) {
    return useRender({
        render: render as useRender.RenderProp,
        defaultTagName: 'div',
        ref,
        props: {
            ...props,
            tabIndex: disabled ? -1 : 0,
            'aria-disabled': disabled || undefined,
            'data-disabled': disabled ? '' : undefined,
            'data-menu-link': '',
            onClick: (event: ReactMouseEvent<HTMLElement>) => {
                if (disabled) {
                    event.preventDefault();
                    return;
                }
                onActivate(event);
            },
            onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
                onKeyDown?.(event as ReactKeyboardEvent<HTMLDivElement>);
                if (event.defaultPrevented || focusInput(event)) return;
                if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
                    event.preventDefault();
                    event.currentTarget.click();
                }
            }
        }
    });
}

export interface MenuCheckboxItemProps extends ItemBaseProps {
    /** Whether the toggle is on (controlled). */
    checked?: boolean;
    /** Whether the toggle is on initially (uncontrolled). */
    defaultChecked?: boolean;
    /** Called when the item is toggled. */
    onCheckedChange?: (checked: boolean) => void;
}

/**
 * A menu item that toggles a value (`role="menuitemcheckbox"`), with a checkmark when on (Angular's
 * `fd-menu-interactive toggle`). The menu stays open.
 */
export function MenuCheckboxItem({
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    render,
    href,
    disabled = false,
    hasSeparator,
    selected,
    active,
    addonBefore,
    addonAfter,
    label,
    listItemProps,
    className,
    children,
    onClick,
    id: idProp,
    ref,
    ...rest
}: MenuCheckboxItemProps) {
    const menu = useContext(MenuContext) ?? DEFAULT_CONTEXT;
    const { li, level } = useItemShell(listItemProps, hasSeparator);
    const [checked, setChecked] = useControllable(checkedProp, defaultChecked, onCheckedChange);
    useEffect(() => level.registerIcon(), [level.registerIcon]);
    const autoId = useId();
    const id = idProp ?? `fd-menu-item-${autoId}`;
    const renderElement = render ?? (href ? <a href={href} /> : undefined);
    const inner = content(children, addonBefore, addonAfter, checked ? 'check' : 'empty');
    const classes = interactiveClass({ disabled, selected, active, className });

    if (menu.mobile) {
        return li(
            <MobileItemElement
                {...rest}
                id={id}
                ref={ref}
                render={renderElement}
                role="menuitemcheckbox"
                aria-checked={checked}
                disabled={disabled}
                className={classes}
                onActivate={(event) => {
                    onClick?.(event);
                    setChecked(!checked);
                }}
            >
                {inner}
            </MobileItemElement>
        );
    }
    return li(
        <BaseMenu.CheckboxItem
            {...rest}
            id={id}
            ref={ref as Ref<HTMLDivElement>}
            render={renderElement}
            nativeButton={renderElement?.type === 'button'}
            disabled={disabled}
            label={label}
            checked={checked}
            onCheckedChange={(next) => setChecked(next)}
            data-menu-link=""
            className={classes}
            onClick={onClick}
        >
            {inner}
        </BaseMenu.CheckboxItem>
    );
}

export interface MenuRadioGroupProps extends Omit<ComponentProps<'ul'>, 'defaultValue' | 'onChange'> {
    /** The chosen value (controlled). */
    value?: unknown;
    /** The value chosen initially (uncontrolled). */
    defaultValue?: unknown;
    /** Called when an option is chosen. */
    onValueChange?: (value: unknown) => void;
    /** Disables every option. */
    disabled?: boolean;
}

/**
 * A single-choice group of `MenuRadioItem`s (Angular's `fdMenuSegmentedButtonHeader` options): a `role="group"`
 * list with a separator below its last option. Put its header (a `MenuItem` with `hasSeparator`) before it, and
 * name the group with `aria-label` or `aria-labelledby`. Native props go to the group's `<ul>`.
 */
export function MenuRadioGroup({
    value: valueProp,
    defaultValue = null,
    onValueChange,
    disabled = false,
    className,
    children,
    ...props
}: MenuRadioGroupProps) {
    const menu = useContext(MenuContext) ?? DEFAULT_CONTEXT;
    const level = useContext(MenuLevelContext);
    const [value, setValue] = useControllable<unknown>(valueProp, defaultValue, onValueChange);
    const radio = useMemo<MenuRadioContextValue>(() => ({ value, setValue, disabled }), [value, setValue, disabled]);
    const groupLevel = useMemo<MenuLevelContextValue>(() => ({ ...level, group: true }), [level]);
    const listProps = { role: 'group', ...props, className: cn('m-0 list-none p-0', className) };
    return (
        <li role="none" className={cn(LIST_ITEM, LIST_ITEM_ENDS, SEPARATOR)}>
            <MenuRadioContext.Provider value={radio}>
                <MenuLevelContext.Provider value={groupLevel}>
                    {menu.mobile ? (
                        <ul {...listProps}>{children}</ul>
                    ) : (
                        <BaseMenu.RadioGroup
                            value={value}
                            onValueChange={(next) => setValue(next)}
                            disabled={disabled}
                            render={<ul {...listProps} />}
                        >
                            {children}
                        </BaseMenu.RadioGroup>
                    )}
                </MenuLevelContext.Provider>
            </MenuRadioContext.Provider>
        </li>
    );
}

export interface MenuRadioItemProps extends ItemBaseProps {
    /** The value the group takes when this option is chosen. */
    value: unknown;
}

/** An option of a `MenuRadioGroup` (`role="menuitemradio"`), with a dot when chosen. The menu stays open. */
export function MenuRadioItem({
    value,
    render,
    href,
    disabled: disabledProp = false,
    hasSeparator,
    selected,
    active,
    addonBefore,
    addonAfter,
    label,
    listItemProps,
    className,
    children,
    onClick,
    id: idProp,
    ref,
    ...rest
}: MenuRadioItemProps) {
    const menu = useContext(MenuContext) ?? DEFAULT_CONTEXT;
    const radio = useContext(MenuRadioContext);
    const { li, level } = useItemShell(listItemProps, hasSeparator);
    useEffect(() => level.registerIcon(), [level.registerIcon]);
    const autoId = useId();
    const id = idProp ?? `fd-menu-item-${autoId}`;
    const disabled = disabledProp || !!radio?.disabled;
    const chosen = Object.is(radio?.value, value);
    const renderElement = render ?? (href ? <a href={href} /> : undefined);
    const inner = content(children, addonBefore, addonAfter, chosen ? 'dot' : 'empty');
    const classes = interactiveClass({ disabled, selected, active, className });

    if (menu.mobile) {
        return li(
            <MobileItemElement
                {...rest}
                id={id}
                ref={ref}
                render={renderElement}
                role="menuitemradio"
                aria-checked={chosen}
                disabled={disabled}
                className={classes}
                onActivate={(event) => {
                    onClick?.(event);
                    radio?.setValue(value);
                }}
            >
                {inner}
            </MobileItemElement>
        );
    }
    return li(
        <BaseMenu.RadioItem
            {...rest}
            id={id}
            ref={ref as Ref<HTMLDivElement>}
            render={renderElement}
            nativeButton={renderElement?.type === 'button'}
            disabled={disabled}
            label={label}
            value={value}
            data-menu-link=""
            className={classes}
            onClick={onClick}
        >
            {inner}
        </BaseMenu.RadioItem>
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Item parts
 * ---------------------------------------------------------------------------------------------------------------- */

export interface MenuAddonProps extends ComponentProps<'span'> {
    /** Glyph of the icon. */
    glyph?: string | null;
    /** Shows the submenu arrow. */
    submenuIndicator?: boolean;
}

/**
 * An icon before or after the item text (its place in the children), or the submenu arrow with
 * `submenuIndicator`. A glyph addon makes the list align its texts after the icon column.
 *
 * ```tsx
 * <MenuAddon glyph="cart" />
 * <MenuAddon submenuIndicator />
 * ```
 */
export function MenuAddon({ glyph, submenuIndicator = false, className, children, ...props }: MenuAddonProps) {
    const item = useContext(MenuItemContext);
    const counts = !!glyph && !submenuIndicator;
    const register = item?.registerIcon;
    useEffect(() => (counts && register ? register() : undefined), [counts, register]);
    return (
        <span aria-hidden="true" {...props} className={cn(ADDON, className)}>
            {submenuIndicator ? <Icon glyph="navigation-right-arrow" /> : glyph ? <Icon glyph={glyph} /> : null}
            {children}
        </span>
    );
}

export interface MenuTextProps extends ComponentProps<'span'> {
    /** Truncates the text to one line. */
    truncate?: boolean;
}

/** Title of a menu item. */
export function MenuTitle({ truncate = false, className, ...props }: MenuTextProps) {
    return (
        <span
            {...props}
            data-menu-title=""
            className={cn(
                'm-0 my-1 box-border w-full p-0 text-start font-sap-font-family text-sap-font-size text-(--mi-tc)',
                'has-[+[data-menu-item-input]]:w-fit has-[+[data-menu-item-input]]:min-w-fit',
                TEXT_IN_ICON_LIST,
                truncate ? 'truncate' : 'whitespace-normal',
                className
            )}
        />
    );
}

/** Subtitle of a menu item, inside a `MenuContent` below the title. */
export function MenuSubtitle({ truncate = false, className, ...props }: MenuTextProps) {
    return (
        <span
            {...props}
            className={cn(
                'm-0 mb-1 box-border w-full p-0 text-start font-sap-font-family text-sap-font-size text-sap-content-label-color',
                truncate ? 'truncate' : 'whitespace-normal',
                className
            )}
        />
    );
}

/** Stacks a `MenuTitle` and a `MenuSubtitle`. */
export function MenuContent({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            {...props}
            className={cn('m-0 box-border flex flex-1 flex-col overflow-hidden p-0', TEXT_IN_ICON_LIST, className)}
        />
    );
}

export interface MenuShortcutProps extends ComponentProps<'span'> {
    /** Hides the shortcut in mobile mode (default true). */
    hideOnMobile?: boolean;
}

/** Keyboard shortcut at the end of an item. */
export function MenuShortcut({ hideOnMobile = true, className, ...props }: MenuShortcutProps) {
    const mobile = useContext(MenuContext)?.mobile ?? false;
    return (
        <span
            {...props}
            className={cn(
                'm-0 box-border flex shrink-0 truncate p-0 ps-(--mi-sc-pl) last:pe-(--mi-sc-pr)',
                'font-sap-font-family text-sap-font-size font-normal text-(--mi-sc)',
                hideOnMobile && mobile && 'hidden',
                className
            )}
        />
    );
}

/**
 * An input inside a menu item: the item keeps the menu open, Enter or Space on the item moves the focus into the
 * input, and the arrow keys, typing and clicks stay in the field (Tab and Escape still leave the menu).
 */
export function MenuItemInput({ className, onKeyDown, onKeyUp, onClick, ...props }: InputProps) {
    const item = useContext(MenuItemContext);
    const register = item?.registerInput;
    useEffect(() => register?.(), [register]);
    const stop = (event: ReactKeyboardEvent | ReactMouseEvent) => {
        if ('key' in event && (event.key === 'Tab' || event.key === 'Escape')) return;
        event.stopPropagation();
    };
    return (
        <Input
            {...props}
            data-menu-item-input=""
            className={cn('mx-(--mi-text-r)', className)}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                stop(event);
            }}
            onKeyUp={(event) => {
                onKeyUp?.(event);
                stop(event);
            }}
            onClick={(event) => {
                onClick?.(event);
                stop(event);
            }}
        />
    );
}
