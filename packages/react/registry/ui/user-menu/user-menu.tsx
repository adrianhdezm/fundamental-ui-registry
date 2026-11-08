/*
 * Port of @fundamental-ngx/core (user-menu) with the visual design of fundamental-styles,
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
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type Dispatch,
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactElement,
    type ReactNode,
    type Ref,
    type RefCallback,
    type RefObject,
    type SetStateAction
} from 'react';
import { cn } from '@/lib/utils';
import { Bar, BarElement, BarLeft, BarMiddle, BarRight } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import { Dialog, DialogBody, DialogHeader, DialogPopup } from '@/ui/dialog/dialog';
import { Icon } from '@/ui/icon/icon';
import { Popover, PopoverBody, PopoverTrigger, type Placement } from '@/ui/popover/popover';
import { Title } from '@/ui/title/title';

/** Sizes of the menu items, as CSS variables on each list: cozy and compact. */
const LIST_VARS =
    '[--um-icon-w:2.25rem] [--um-h:2.75rem] [--um-pad:0.75rem] [--um-text-r:0.75rem] compact:[--um-icon-w:2.5rem] compact:[--um-h:2.5rem] compact:[--um-text-r:0.5rem]';
const LIST = 'm-0 box-border flex w-full list-none flex-col p-0';
/** Lists with icons align their texts after the icon column instead of padding the items. */
const ICON_VARS = '[--um-pl:0] [--um-pr:0]';
const PAD_VARS = '[--um-pl:var(--um-pad)] [--um-pr:var(--um-pad)]';

const ADDON =
    'm-0 box-border flex w-(--um-icon-w) min-w-(--um-icon-w) shrink-0 items-center justify-center self-stretch p-0 text-sap-font-large-size';

const USER_NAME =
    'm-0 box-border max-w-full p-0 font-sap-font-semibold-duplex-family text-sap-font-large-size leading-[1.4rem] text-sap-text-color';

/** Marks the surfaces of a user menu (popover, submenus, dialog): focus moving between them stays in the menu. */
const SURFACE = 'data-user-menu-surface';
const IN_SURFACE = `[${SURFACE}]`;

function mergeRefs<E>(...refs: (Ref<E> | undefined)[]): RefCallback<E> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
}

/** The menu items directly in a list (not those of its submenus), in order. */
function directItems(list: HTMLElement | null): HTMLElement[] {
    if (!list) return [];
    return [...list.children]
        .map((li) => li.querySelector<HTMLElement>(':scope > [role="menuitem"]'))
        .filter((el): el is HTMLElement => !!el);
}

/* ------------------------------------------------------------------------------------------------------------------
 * Contexts
 * ---------------------------------------------------------------------------------------------------------------- */

/** An item of a list, as its list, its submenu and the menu see it. */
interface ItemHandle {
    readonly id: string;
    text: string;
    submenu: ReactNode;
    /** The item whose submenu holds this item; null in the main list. */
    parent: ItemHandle | null;
    focus(): void;
    /** Closes the submenu, optionally moving the focus back to the item. */
    closeSubmenu(restoreFocus?: boolean): void;
    cancelClose(): void;
    /** Closes the open submenu after a short delay. */
    scheduleClose(): void;
}

interface UserNameState {
    id: string | null;
    text: string;
    /** Whether the user name is scrolled into view; the header bars show it otherwise. */
    visible: boolean;
}

const NO_USER_NAME: UserNameState = { id: null, text: '', visible: true };

interface UserMenuContextValue {
    open: boolean;
    mobile: boolean;
    setOpen: (open: boolean) => void;
    controlRef: RefObject<HTMLElement | null>;
    /** Open submenu levels in mobile mode. */
    levels: ItemHandle[];
    /** Shows the submenu of an item in place of the main view (mobile mode). */
    show: (item: ItemHandle) => void;
    /** Back to the previous level (mobile mode). */
    back: () => void;
    setBody: (el: HTMLElement | null) => void;
    setUserName: Dispatch<SetStateAction<UserNameState>>;
}

const UserMenuContext = createContext<UserMenuContextValue | null>(null);

/** The item whose submenu is rendered; read by the submenu's list. */
const ParentItemContext = createContext<ItemHandle | null>(null);

interface ListContextValue {
    /** Whether texts align after an icon column. */
    icons: boolean;
    parentItem: ItemHandle | null;
    /** The item reachable with Tab: the last focused one, or the first. */
    tabStop: string | null;
    setActive: Dispatch<SetStateAction<string | null>>;
    /** Resets the tab stop when the focus leaves the menu for `next`. */
    leave: (next: Element | null) => void;
    items: Set<ItemHandle>;
    /**
     * Places the submenu popover of an item after the list: Base UI leaves a hidden owner element where a popover
     * is rendered, which a `menu` may not contain.
     */
    setSubmenu: (id: string, node: ReactNode) => void;
}

const ListContext = createContext<ListContextValue | null>(null);

/** The state of the user menu around a component: `open`, `mobile`, `setOpen`, `close()` and `toggle()`. */
export interface UserMenuApi {
    open: boolean;
    mobile: boolean;
    setOpen: (open: boolean) => void;
    close: () => void;
    toggle: () => void;
}

/**
 * The state of the enclosing `UserMenu` (Angular's `#menu="fdUserMenu"`), e.g. to close it when an item is chosen:
 * `const menu = useUserMenu(); <UserMenuListItem text="Settings" onClick={menu?.close} />`. Null outside a menu.
 */
export function useUserMenu(): UserMenuApi | null {
    const menu = useContext(UserMenuContext);
    return useMemo(
        () =>
            menu && {
                open: menu.open,
                mobile: menu.mobile,
                setOpen: menu.setOpen,
                close: () => menu.setOpen(false),
                toggle: () => menu.setOpen(!menu.open)
            },
        [menu]
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------------------------------------------- */

export interface UserMenuProps extends ComponentProps<'div'> {
    /** Whether the menu is open (controlled; Angular's `isOpen`). */
    open?: boolean;
    /** Whether the menu is open initially (uncontrolled). */
    defaultOpen?: boolean;
    /** Called when the menu opens or closes (Angular's `isOpenChange`). */
    onOpenChange?: (open: boolean) => void;
    /** Opens the menu in a full-screen dialog; submenus replace the main view. */
    mobile?: boolean;
    /** Placement of the popover (default `bottom-end`). */
    placement?: Placement;
    /** Accessible name of the back button of the dialog header in mobile mode. */
    backLabel?: string;
    /** Accessible name of the close button of the dialog header in mobile mode. */
    closeLabel?: string;
    /** Element the popover or dialog is rendered into (default `document.body`). */
    container?: HTMLElement | RefObject<HTMLElement | null> | null;
}

const isType = (child: ReactNode, type: unknown): child is ReactElement => isValidElement(child) && child.type === type;

/**
 * User menu: the signed-in user's name, details and actions in a popover opened from an avatar, usually in the
 * shellbar. The user name moves into a header bar when it scrolls out of view. List items open submenus to the side;
 * in mobile mode the menu opens in a full-screen dialog and submenus replace the main view.
 *
 * `UserMenuControl`, `UserMenuBody` and `UserMenuFooter` must be direct children: the menu places the body and the
 * footer in the popover (or dialog). Native props, `className` and `ref` go to the wrapper (`inline-flex`).
 *
 * ```tsx
 * <UserMenu>
 *     <UserMenuControl><Avatar size="xs" circle label="Lisa Miller" /></UserMenuControl>
 *     <UserMenuBody>
 *         <UserMenuHeader>
 *             <UserMenuHeaderContainer><UserMenuUserName>Lisa Miller</UserMenuUserName></UserMenuHeaderContainer>
 *         </UserMenuHeader>
 *         <UserMenuContentContainer>
 *             <UserMenuList><UserMenuListItem icon="action-settings" text="Settings" /></UserMenuList>
 *         </UserMenuContentContainer>
 *     </UserMenuBody>
 *     <UserMenuFooter>…</UserMenuFooter>
 * </UserMenu>
 * ```
 */
export function UserMenu({
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    mobile = false,
    placement = 'bottom-end',
    backLabel = 'Go back',
    closeLabel = 'Close',
    container,
    className,
    children,
    ...props
}: UserMenuProps) {
    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const open = openProp ?? ownOpen;
    const setOpen = useCallback(
        (next: boolean) => {
            if (openProp === undefined) setOwnOpen(next);
            onOpenChange?.(next);
        },
        [openProp, onOpenChange]
    );
    const controlRef = useRef<HTMLElement | null>(null);
    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const bodyRef = useRef<HTMLElement | null>(null);
    const [levels, setLevels] = useState<ItemHandle[]>([]);
    const [userName, setUserName] = useState<UserNameState>(NO_USER_NAME);
    const level = levels.at(-1) ?? null;

    // a closed menu starts on the main view next time
    useEffect(() => {
        if (!open) setLevels([]);
    }, [open]);

    // a new level focuses its first item; going back focuses the item that opened the level
    const popped = useRef<ItemHandle | null>(null);
    const depth = useRef(0);
    useEffect(() => {
        const deeper = levels.length > depth.current;
        depth.current = levels.length;
        const target = popped.current;
        popped.current = null;
        const frame = requestAnimationFrame(() => {
            if (deeper)
                bodyRef.current?.querySelector<HTMLElement>(':scope > div:last-child [role="menuitem"]')?.focus();
            else target?.focus();
        });
        return () => cancelAnimationFrame(frame);
    }, [levels]);

    const show = useCallback((item: ItemHandle) => setLevels((all) => [...all, item]), []);
    const back = useCallback(() => {
        setLevels((all) => {
            popped.current = all.at(-1) ?? null;
            return all.slice(0, -1);
        });
    }, []);
    const setBody = useCallback((el: HTMLElement | null) => {
        bodyRef.current = el;
    }, []);

    const context = useMemo<UserMenuContextValue>(
        () => ({ open, mobile, setOpen, controlRef, levels, show, back, setBody, setUserName }),
        [open, mobile, setOpen, levels, show, back, setBody]
    );

    const items = Children.toArray(children);
    const control = items.filter((child) => isType(child, UserMenuControl));
    const body = items.filter((child) => isType(child, UserMenuBody));
    const footer = items.filter((child) => isType(child, UserMenuFooter));
    const rest = items.filter(
        (child) => !isType(child, UserMenuControl) && !isType(child, UserMenuBody) && !isType(child, UserMenuFooter)
    );

    /** The first item of the main list takes the focus when the menu opens. */
    const focusFirstItem = () =>
        surfaceRef.current?.querySelector<HTMLElement>('[data-user-menu-list] > li > [role="menuitem"]') ?? false;
    /** The focus returns to the control unless the user moved it elsewhere. */
    const returnFocus = () => {
        const active = document.activeElement;
        return !active || active === document.body || !!active.closest(IN_SURFACE)
            ? (controlRef.current ?? true)
            : false;
    };
    const userNameClass = cn(USER_NAME, 'truncate');

    return (
        <div {...props} className={cn('inline-flex', className)}>
            <UserMenuContext.Provider value={context}>
                {mobile ? (
                    <>
                        {control}
                        {rest}
                        <Dialog open={open} onOpenChange={(next) => setOpen(next)} escKeyCloseable>
                            <DialogPopup
                                {...{ [SURFACE]: '' }}
                                ref={surfaceRef}
                                mobile
                                container={container}
                                aria-labelledby={userName.id ?? undefined}
                                initialFocus={focusFirstItem}
                                finalFocus={returnFocus}
                            >
                                <DialogHeader>
                                    <BarLeft>
                                        {level && (
                                            <>
                                                <BarElement>
                                                    <Button
                                                        variant="transparent"
                                                        glyph="navigation-left-arrow"
                                                        aria-label={backLabel}
                                                        onClick={back}
                                                    />
                                                </BarElement>
                                                <BarElement className="min-w-0">
                                                    <Title level={1}>{level.text}</Title>
                                                </BarElement>
                                            </>
                                        )}
                                    </BarLeft>
                                    {!level && (
                                        <BarMiddle
                                            aria-hidden="true"
                                            className={cn(
                                                'transition-opacity duration-150',
                                                userName.visible && 'opacity-0'
                                            )}
                                        >
                                            <BarElement className="min-w-0">
                                                <div className={userNameClass}>{userName.text}</div>
                                            </BarElement>
                                        </BarMiddle>
                                    )}
                                    <BarRight>
                                        <BarElement>
                                            <Button
                                                variant="transparent"
                                                glyph="decline"
                                                aria-label={closeLabel}
                                                onClick={() => setOpen(false)}
                                            />
                                        </BarElement>
                                    </BarRight>
                                </DialogHeader>
                                <DialogBody disablePaddings>{body}</DialogBody>
                                <div className="shrink-0">{footer}</div>
                            </DialogPopup>
                        </Dialog>
                    </>
                ) : (
                    <Popover
                        open={open}
                        onOpenChange={(next) => setOpen(next)}
                        placement={placement}
                        noArrow={false}
                        disableScrollbar
                        focusTrapped
                        focusAutoCapture={false}
                        restoreFocusOnClose={false}
                    >
                        {control}
                        {rest}
                        <PopoverBody
                            {...{ [SURFACE]: '' }}
                            ref={surfaceRef}
                            container={container ?? undefined}
                            aria-labelledby={userName.id ?? undefined}
                            initialFocus={focusFirstItem}
                            finalFocus={returnFocus}
                        >
                            <div className="relative flex max-h-[calc(100vh-4rem)] w-80 flex-col overflow-hidden rounded-[inherit]">
                                <Bar
                                    barDesign="header"
                                    aria-hidden="true"
                                    role={null}
                                    className={cn(
                                        'absolute inset-x-0 top-0 z-10 overflow-hidden rounded-t-[inherit] transition-opacity duration-150',
                                        userName.visible && 'pointer-events-none opacity-0'
                                    )}
                                >
                                    <BarMiddle>
                                        <BarElement className="min-w-0">
                                            <div className={userNameClass}>{userName.text}</div>
                                        </BarElement>
                                    </BarMiddle>
                                </Bar>
                                <div
                                    data-user-menu-scroll=""
                                    className="min-h-0 flex-1 overflow-auto overscroll-contain scrollbar-sap"
                                >
                                    {body}
                                </div>
                                {footer}
                            </div>
                        </PopoverBody>
                    </Popover>
                )}
            </UserMenuContext.Provider>
        </div>
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Control
 * ---------------------------------------------------------------------------------------------------------------- */

const CONTROL =
    'inline-flex h-fit w-fit cursor-pointer items-center justify-center rounded-full outline-offset-1 focus-visible:outline-sap';

/**
 * The element that opens the user menu, usually an avatar: a `button` (`tabIndex` 0, `aria-haspopup="dialog"`,
 * `aria-expanded`) that opens the menu on click, Enter and Space. Native props, `className` and `ref` go to it.
 */
export function UserMenuControl({ className, onClick, onKeyDown, ref, ...props }: ComponentProps<'div'>) {
    const menu = useContext(UserMenuContext);
    const setRef = mergeRefs(ref, menu?.controlRef);
    if (menu && !menu.mobile) {
        return (
            <PopoverTrigger
                nativeButton={false}
                render={<div {...props} onClick={onClick} onKeyDown={onKeyDown} />}
                aria-haspopup="dialog"
                ref={setRef}
                className={cn(CONTROL, className)}
            />
        );
    }
    return (
        <div
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={menu ? menu.open : undefined}
            {...props}
            ref={setRef}
            className={cn(CONTROL, className)}
            onClick={(event) => {
                onClick?.(event);
                menu?.setOpen(true);
            }}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                menu?.setOpen(true);
            }}
        />
    );
}

/**
 * Marks the element inside the control that shows the open state (`data-state="open"` while the menu is open), e.g.
 * `<UserMenuControlElement render={<Avatar size="xs" circle label="Lisa Miller" />} />`.
 */
export function UserMenuControlElement({ render, ...props }: useRender.ComponentProps<'span'>) {
    const menu = useContext(UserMenuContext);
    return useRender({
        render,
        defaultTagName: 'span',
        props: { ...props, 'data-state': menu?.open ? 'open' : undefined }
    });
}

/* ------------------------------------------------------------------------------------------------------------------
 * Body and header
 * ---------------------------------------------------------------------------------------------------------------- */

/**
 * Content of the user menu: a `UserMenuHeader` with the user's details and a `UserMenuContentContainer` with lists
 * and panels. In mobile mode it shows the submenu of an item instead of the main view. Clicks inside it do not bubble
 * out of the menu, as in fundamental-ngx.
 */
export function UserMenuBody({ className, children, onClick, ref, ...props }: ComponentProps<'div'>) {
    const menu = useContext(UserMenuContext);
    const levels = menu?.levels ?? [];
    const level = levels.length > 0;
    return (
        <div
            {...props}
            ref={mergeRefs(ref, menu?.setBody)}
            className={cn(
                'relative m-0 box-border flex flex-col gap-2 whitespace-normal font-sap-font-family text-sap-font-size text-sap-text-color',
                menu?.mobile ? 'w-full px-2 pt-4 pb-2' : 'w-80 px-2 pt-10 pb-2',
                level && 'p-0',
                className
            )}
            onClick={(event) => {
                onClick?.(event);
                event.stopPropagation();
            }}
        >
            <div className={level ? 'hidden' : 'contents'}>{children}</div>
            {/* earlier levels stay rendered, so going back can focus the item that opened the level */}
            {levels.map((item, index) => (
                <div key={item.id} className={index === levels.length - 1 ? 'm-0 box-border p-4' : 'hidden'}>
                    <ParentItemContext.Provider value={item}>{item.submenu}</ParentItemContext.Provider>
                </div>
            ))}
        </div>
    );
}

/** The user's avatar, details and actions at the top of the menu. */
export function UserMenuHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('m-0 box-border flex flex-col items-center gap-2 p-0', className)} />;
}

/** The user name and sublines. */
export function UserMenuHeaderContainer({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            {...props}
            className={cn('m-0 mb-2 box-border flex max-w-full flex-col items-center gap-1 p-0 text-center', className)}
        />
    );
}

/** Free content below the user details, e.g. a message strip. */
export function UserMenuHeaderContentArea({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('m-0 box-border block w-full p-2', className)} />;
}

export interface UserMenuUserNameProps extends ComponentProps<'div'> {
    /** Keeps the name on one line with an ellipsis. */
    truncate?: boolean;
    /** Shows the full name on as many lines as needed. */
    wrap?: boolean;
}

/**
 * The user name; clamped to two lines, or one with `truncate`. It names the menu (`aria-labelledby`), and the header
 * bar shows it once it scrolls out of view.
 */
export function UserMenuUserName({
    id: idProp,
    truncate = false,
    wrap = false,
    className,
    ref,
    ...props
}: UserMenuUserNameProps) {
    const autoId = useId();
    const id = idProp ?? `fd-user-menu-user-name-${autoId}`;
    const report = useContext(UserMenuContext)?.setUserName;
    const el = useRef<HTMLDivElement | null>(null);

    // tracks the text and whether the name is scrolled into view, while the menu shows it
    useLayoutEffect(() => {
        const node = el.current;
        if (!node || !report) return;
        const text = () => node.textContent?.trim() ?? '';
        report({ id, text: text(), visible: true });
        const root = node.closest<HTMLElement>('[data-user-menu-scroll], [data-dialog-body]');
        const header = root?.hasAttribute('data-user-menu-scroll') ? '-44px' : '0px';
        const intersection = new IntersectionObserver(
            (entries) => report((state) => ({ ...state, visible: entries.at(-1)?.isIntersecting ?? true })),
            { root, threshold: 0, rootMargin: `${header} 0px 0px 0px` }
        );
        intersection.observe(node);
        const mutation = new MutationObserver(() => report((state) => ({ ...state, text: text() })));
        mutation.observe(node, { childList: true, characterData: true, subtree: true });
        return () => {
            intersection.disconnect();
            mutation.disconnect();
            report(NO_USER_NAME);
        };
    }, [id, report]);

    return (
        <div
            {...props}
            id={id}
            ref={mergeRefs(el, ref)}
            className={cn(USER_NAME, truncate ? 'truncate' : wrap ? 'block' : 'line-clamp-2 max-h-[2.8rem]', className)}
        />
    );
}

export interface UserMenuSublineProps extends ComponentProps<'div'> {
    /** Truncates the line (the default); kept for compatibility. */
    truncate?: boolean;
    /** Wraps a long line instead of truncating it. */
    wrap?: boolean;
}

/** A line below the user name: an e-mail, a role or an organisation. Truncated unless it wraps. */
export function UserMenuSubline({ truncate: _truncate, wrap = false, className, ...props }: UserMenuSublineProps) {
    return (
        <div
            {...props}
            className={cn(
                'm-0 box-border w-full max-w-full p-0 text-sap-content-label-color',
                wrap ? 'break-words whitespace-normal' : 'truncate',
                className
            )}
        />
    );
}

/** Lists and panels below the header. */
export function UserMenuContentContainer({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('m-0 box-border block p-0', className)} />;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Lists
 * ---------------------------------------------------------------------------------------------------------------- */

/** The `<ul role="menu">` of a list: one tab stop, arrow keys, Home and End. */
function MenuList({
    icons,
    root,
    className,
    children,
    ...props
}: ComponentProps<'ul'> & { icons: boolean; root?: boolean }) {
    const parentItem = useContext(ParentItemContext);
    const list = useRef<HTMLUListElement | null>(null);
    const [active, setActive] = useState<string | null>(null);
    const [first, setFirst] = useState<string | null>(null);
    const [items] = useState(() => new Set<ItemHandle>());
    const [submenus, setSubmenus] = useState<ReadonlyMap<string, ReactNode>>(() => new Map());
    const setSubmenu = useCallback((id: string, node: ReactNode) => {
        setSubmenus((all) => {
            if (all.get(id) === node) return all;
            const next = new Map(all);
            if (node == null) next.delete(id);
            else next.set(id, node);
            return next;
        });
    }, []);
    const leave = useCallback((next: Element | null) => {
        if (next && (list.current?.contains(next) || next.closest(IN_SURFACE))) return;
        setActive(null);
    }, []);

    // the first item is the tab stop until another one takes the focus
    useLayoutEffect(() => {
        const id = directItems(list.current)[0]?.id ?? null;
        if (id !== first) setFirst(id);
    });

    const context = useMemo<ListContextValue>(
        () => ({ icons, parentItem, tabStop: active ?? first, setActive, leave, items, setSubmenu }),
        [icons, parentItem, active, first, leave, items, setSubmenu]
    );

    const onKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
        const all = directItems(list.current);
        const index = all.indexOf(event.target as HTMLElement);
        if (index < 0) return;
        const next = {
            ArrowDown: all[index + 1],
            ArrowUp: all[index - 1],
            Home: all[0],
            End: all[all.length - 1]
        }[event.key];
        if (!(event.key in { ArrowDown: 1, ArrowUp: 1, Home: 1, End: 1 })) return;
        next?.focus();
        event.preventDefault();
    };

    return (
        <ListContext.Provider value={context}>
            <ul
                role="menu"
                {...props}
                {...(root ? { 'data-user-menu-list': '' } : null)}
                ref={list}
                className={cn(LIST, LIST_VARS, icons ? ICON_VARS : PAD_VARS, className)}
                onKeyDown={onKeyDown}
                // leaving the menu makes the first item tabbable again; moving into a submenu keeps the item
                onBlur={(event) => leave(event.relatedTarget as Element | null)}
            >
                {children}
            </ul>
            {[...submenus].map(([id, node]) => (
                <Fragment key={id}>{node}</Fragment>
            ))}
        </ListContext.Provider>
    );
}

/**
 * The main list of user menu actions (`UserMenuListItem`s), in a `<nav>` named by `aria-label`. Arrow keys, Home and
 * End move between the items; one item is in the tab order. Native props, `className` and `ref` go to the `<nav>`.
 */
export function UserMenuList({ className, children, ...props }: ComponentProps<'nav'>) {
    return (
        <nav {...props} className={cn('mt-1 block w-full', className)}>
            <MenuList icons root>
                {children}
            </MenuList>
        </nav>
    );
}

export interface UserMenuSublistProps extends ComponentProps<'div'> {
    /** Aligns the texts after an icon column. */
    hasIcons?: boolean;
}

/**
 * The items of a submenu, passed to an item's `submenu`: a `<ul role="menu">` named by the item's text.
 *
 * ```tsx
 * <UserMenuListItem text="Language" submenu={
 *     <UserMenuSublist><UserMenuListItem text="English" /></UserMenuSublist>
 * } />
 * ```
 */
export function UserMenuSublist({ hasIcons = false, className, children, ...props }: UserMenuSublistProps) {
    const menu = useContext(UserMenuContext);
    const parentItem = useContext(ParentItemContext);
    return (
        <div {...props} className={cn('block', menu?.mobile ? 'w-full' : 'w-76 max-w-full', className)}>
            <MenuList icons={hasIcons} aria-label={parentItem?.text}>
                {children}
            </MenuList>
        </div>
    );
}

export interface UserMenuListItemProps extends Omit<ComponentProps<'li'>, 'children'> {
    /** The title. */
    text: string;
    /** Icon before the text. */
    icon?: string | null;
    /** Icon after the text, e.g. a checkmark. */
    iconAfter?: string | null;
    /** Colours the icon after the text as selected. */
    iconAfterActive?: boolean;
    /** Second line below the title; it describes the item (`aria-describedby`). */
    subtitle?: string | null;
    /** Id of the title element. */
    textId?: string;
    /** Id of the subtitle element. */
    subtitleId?: string;
    /** Keeps the title on one line with an ellipsis. */
    truncateText?: boolean;
    /** Keeps the subtitle on one line with an ellipsis. */
    truncateSubtitle?: boolean;
    /** Shows the submenu arrow (default: whether `submenu` is given). */
    hasSubmenu?: boolean;
    /** The submenu, a `UserMenuSublist` (Angular's `submenu` template). */
    submenu?: ReactNode;
    /** Selected item: selection colours and border. */
    selected?: boolean;
    /** Ref of the item's `<button role="menuitem">`. */
    buttonRef?: Ref<HTMLButtonElement>;
}

/**
 * An action of the user menu, with an icon, a title, a subtitle and an icon after the text: a `<li role="none">`
 * with a `<button role="menuitem">`. With a `submenu` it opens the submenu on hover, click or the Right arrow (Left
 * in RTL), beside the menu (Angular's `left-start` placement); the Left arrow and Escape close it. In mobile mode
 * the submenu replaces the main view. Native props, `className` and `ref` go to the `<li>`; React events bubble
 * from the submenu (a portal) through its item, so put click handlers on the items you choose.
 */
export function UserMenuListItem({
    text,
    icon,
    iconAfter,
    iconAfterActive = false,
    subtitle,
    textId: textIdProp,
    subtitleId: subtitleIdProp,
    truncateText = false,
    truncateSubtitle = false,
    hasSubmenu: hasSubmenuProp,
    submenu,
    selected = false,
    buttonRef,
    id: idProp,
    className,
    onMouseEnter,
    onMouseLeave,
    ...props
}: UserMenuListItemProps) {
    const menu = useContext(UserMenuContext);
    const list = useContext(ListContext);
    const mobile = !!menu?.mobile;
    const hasSubmenu = hasSubmenuProp ?? (submenu != null && submenu !== false);
    const autoId = useId();
    const id = idProp ?? `fd-user-menu-list-item-${autoId}`;
    const linkId = `${id}-link`;
    const textId = textIdProp ?? `fd-user-menu-list-item-title-${autoId}`;
    const subtitleId = subtitleIdProp ?? `fd-user-menu-list-item-subtitle-${autoId}`;

    const [open, setOpenState] = useState(false);
    const openRef = useRef(false);
    const link = useRef<HTMLButtonElement | null>(null);
    const surface = useRef<HTMLDivElement | null>(null);
    const focusFirst = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const setOpen = useCallback((next: boolean) => {
        openRef.current = next;
        setOpenState(next);
    }, []);

    const [handle] = useState<ItemHandle>(() => {
        const self: ItemHandle = {
            id: linkId,
            text,
            submenu,
            parent: list?.parentItem ?? null,
            focus: () => link.current?.focus(),
            cancelClose: () => {
                if (timer.current !== null) clearTimeout(timer.current);
                timer.current = null;
            },
            closeSubmenu: (restoreFocus = false) => {
                self.cancelClose();
                if (openRef.current) setOpen(false);
                if (restoreFocus) self.focus();
            },
            scheduleClose: () => {
                if (!openRef.current) return;
                self.cancelClose();
                timer.current = setTimeout(() => {
                    timer.current = null;
                    setOpen(false);
                }, 150);
            }
        };
        return self;
    });

    useLayoutEffect(() => {
        handle.text = text;
        handle.submenu = submenu;
        handle.parent = list?.parentItem ?? null;
    });

    // the list knows its items, to close the submenus of the others
    useLayoutEffect(() => {
        const items = list?.items;
        items?.add(handle);
        return () => {
            items?.delete(handle);
            handle.cancelClose();
        };
    }, [list?.items, handle]);

    // an item that goes away gives the tab stop back
    const setActive = list?.setActive;
    useEffect(() => () => setActive?.((active) => (active === linkId ? null : active)), [setActive, linkId]);

    const rtl = () => !!link.current && getComputedStyle(link.current).direction === 'rtl';

    const openSubmenu = (moveFocus: boolean) => {
        handle.cancelClose();
        focusFirst.current = moveFocus;
        if (openRef.current) {
            if (moveFocus)
                requestAnimationFrame(() => surface.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
            return;
        }
        setOpen(true);
    };

    /** Hovering this item or its submenu keeps it and its ancestors open. */
    const keepOpen = () => {
        for (let item: ItemHandle | null = handle; item; item = item.parent) item.cancelClose();
    };

    const icons = list?.icons ?? true;

    const popover =
        hasSubmenu && !mobile ? (
            <Popover
                open={open}
                onOpenChange={(next, details) => {
                    // a press on the item itself keeps the submenu, as the item opens it
                    const target = details.event?.target as Node | null;
                    if (!next && details.reason === 'outside-press' && target && link.current?.contains(target)) {
                        details.cancel();
                        return;
                    }
                    if (!next) handle.closeSubmenu(details.reason === 'escape-key');
                }}
                anchor={link}
                triggers={[]}
                placement="left-start"
                noArrow
                focusTrapped
                focusAutoCapture={false}
                restoreFocusOnClose={false}
            >
                <PopoverBody
                    {...{ [SURFACE]: '' }}
                    ref={surface}
                    role="presentation"
                    initialFocus={() =>
                        focusFirst.current
                            ? (surface.current?.querySelector<HTMLElement>('[role="menuitem"]') ?? false)
                            : false
                    }
                    onKeyDown={(event) => {
                        // Tab stays in this submenu: the menu's own focus trap does not take it over
                        if (event.key === 'Tab') event.stopPropagation();
                        const closeKey = rtl() ? 'ArrowRight' : 'ArrowLeft';
                        if (event.key === closeKey || event.key === 'Escape') {
                            event.preventDefault();
                            event.stopPropagation();
                            handle.closeSubmenu(true);
                        }
                    }}
                    onMouseOver={keepOpen}
                    onMouseLeave={() => {
                        for (let item: ItemHandle | null = handle; item; item = item.parent) item.scheduleClose();
                    }}
                >
                    <ParentItemContext.Provider value={handle}>{submenu}</ParentItemContext.Provider>
                </PopoverBody>
            </Popover>
        ) : null;

    // the popover goes after the list (see `setSubmenu`), registered again with every render of the item
    const setSubmenu = list?.setSubmenu;
    useLayoutEffect(() => {
        setSubmenu?.(linkId, popover);
    });
    useLayoutEffect(() => () => setSubmenu?.(linkId, null), [setSubmenu, linkId]);

    return (
        <li
            role="none"
            {...props}
            id={id}
            className={cn('m-0 box-border block w-full p-0', className)}
            onMouseEnter={(event) => {
                onMouseEnter?.(event);
                if (mobile) return;
                keepOpen();
                if (document.activeElement !== link.current) handle.focus();
                list?.items.forEach((item) => item !== handle && item.closeSubmenu());
                if (hasSubmenu && !openRef.current) {
                    focusFirst.current = false;
                    setOpen(true);
                }
            }}
            onMouseLeave={(event) => {
                onMouseLeave?.(event);
                if (hasSubmenu && !mobile) handle.scheduleClose();
            }}
        >
            <button
                ref={mergeRefs(link, buttonRef)}
                id={linkId}
                type="button"
                role="menuitem"
                tabIndex={list?.tabStop === linkId ? 0 : -1}
                aria-haspopup={hasSubmenu ? 'menu' : undefined}
                aria-expanded={hasSubmenu && !mobile ? open : undefined}
                aria-describedby={subtitle ? subtitleId : undefined}
                className={cn(
                    'relative m-0 box-border flex min-h-(--um-h) w-full cursor-pointer items-center border-0 border-b border-solid border-b-(--um-bb) p-0 ps-(--um-pl) pe-(--um-pr)',
                    'bg-(--um-bg) text-start font-sap-font-family text-sap-font-size no-underline outline-none',
                    '[--um-bg:var(--sapList_Background)] [--um-bb:transparent] [--um-ic:var(--sapContent_NonInteractiveIconColor)] [--um-tc:var(--sapList_TextColor)]',
                    'hover:[--um-bg:var(--sapList_Hover_Background)]',
                    // focus: an inner frame
                    "focus-visible:after:pointer-events-none focus-visible:after:absolute focus-visible:after:inset-0.5 focus-visible:after:content-['']",
                    'focus-visible:after:border-(length:--sapContent_FocusWidth) focus-visible:after:[border-style:var(--sapContent_FocusStyle)] focus-visible:after:border-sap-content-focus-color',
                    (selected || (open && !mobile)) &&
                        'not-active:[--um-bg:var(--sapList_SelectionBackgroundColor)] not-active:[--um-bb:var(--sapList_SelectionBorderColor)] not-active:hover:[--um-bg:var(--sapList_Hover_SelectionBackground)]',
                    'active:[--um-bg:var(--sapList_Active_Background)] active:[--um-ic:var(--sapList_Active_TextColor)] active:[--um-tc:var(--sapList_Active_TextColor)] active:after:hidden',
                    hasSubmenu && 'pe-0'
                )}
                onFocus={() => list?.setActive(linkId)}
                onClick={(event) => {
                    if (!hasSubmenu) return;
                    if (mobile) {
                        if (submenu != null) menu?.show(handle);
                        return;
                    }
                    openSubmenu(event.detail === 0);
                }}
                onKeyDown={(event) => {
                    if (!hasSubmenu || mobile) return;
                    const openKey = rtl() ? 'ArrowLeft' : 'ArrowRight';
                    const closeKey = rtl() ? 'ArrowRight' : 'ArrowLeft';
                    if (event.key === openKey) {
                        event.preventDefault();
                        openSubmenu(true);
                    } else if (event.key === closeKey && openRef.current) {
                        event.preventDefault();
                        handle.closeSubmenu(true);
                    }
                }}
            >
                {icon && (
                    <span className={cn(ADDON, 'text-(--um-ic)')} aria-hidden="true">
                        <Icon glyph={icon} />
                    </span>
                )}
                <span
                    className={cn(
                        'm-0 box-border flex min-w-0 flex-1 flex-col overflow-hidden p-0',
                        icons && !icon && 'ms-(--um-icon-w)',
                        icons && !iconAfter && !hasSubmenu && 'me-(--um-text-r)'
                    )}
                >
                    <span
                        id={textId}
                        className={cn(
                            'm-0 my-1 box-border w-full p-0 text-start text-(--um-tc)',
                            truncateText ? 'truncate' : 'whitespace-normal'
                        )}
                    >
                        {text}
                    </span>
                    {subtitle && (
                        <span
                            id={subtitleId}
                            className={cn(
                                'm-0 mb-1 box-border w-full p-0 text-start text-sap-content-label-color',
                                truncateSubtitle ? 'truncate' : 'whitespace-normal'
                            )}
                        >
                            {subtitle}
                        </span>
                    )}
                </span>
                {iconAfter && (
                    <span
                        className={cn(
                            ADDON,
                            iconAfterActive ? 'text-sap-content-selected-foreground-color' : 'text-(--um-ic)'
                        )}
                        aria-hidden="true"
                    >
                        <Icon glyph={iconAfter} />
                    </span>
                )}
                {hasSubmenu && (
                    <span className={cn(ADDON, 'text-[1rem] text-(--um-ic)')} aria-hidden="true">
                        {/* the glyph mirrors itself in RTL */}
                        <Icon glyph="navigation-right-arrow" />
                    </span>
                )}
            </button>
            {!list && popover}
        </li>
    );
}

/** Bottom of the user menu, usually a footer bar with a sign-out button. */
export function UserMenuFooter({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('block min-h-8 shrink-0', className)} />;
}
