/*
 * Port of @fundamental-ngx/core (split-button) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    Children,
    Fragment,
    cloneElement,
    isValidElement,
    useId,
    useRef,
    useState,
    type ComponentProps,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Button, type ButtonVariant } from '@/ui/button/button';
import type { IconFont } from '@/ui/icon/icon';
import {
    Menu,
    MenuAddon,
    MenuItem,
    MenuPopup,
    MenuShortcut,
    MenuSubtitle,
    MenuTitle,
    MenuTrigger,
    Submenu,
    type MenuItemProps,
    type MenuOpenChangeDetails,
    type MenuPathItem,
    type MenuPopupProps,
    type MenuProps
} from '@/ui/menu/menu';

/** The action of the main button when it is not taken from the menu. */
export interface SplitButtonMainAction {
    /** Content of the main button: a text, or any content (Angular's `fd-split-button-action-title` template). */
    mainActionTitle: ReactNode;
    /** Keeps this action on the main button when a menu item is chosen. */
    keepMainAction?: boolean;
    /** Called when the main button runs this action. */
    callback?: () => void;
}

/** Pad, border and separator colours behind the two buttons, per button type. */
const PAD: Record<ButtonVariant, string> = {
    standard:
        '[--sb-pad:var(--sapButton_Background)] [--sb-sep:var(--sapButton_TextColor)] [--sb-bd:var(--sapButton_BorderColor)]',
    emphasized:
        '[--sb-pad:var(--sapButton_Emphasized_Background)] [--sb-sep:var(--sapButton_Emphasized_TextColor)] [--sb-bd:var(--sapButton_Emphasized_BorderColor)]',
    ghost: '[--sb-pad:var(--sapButton_Background)] [--sb-sep:var(--sapButton_TextColor)] [--sb-bd:transparent]',
    transparent:
        '[--sb-pad:var(--sapButton_Lite_Background)] [--sb-sep:var(--sapButton_Lite_TextColor)] [--sb-bd:transparent]',
    positive:
        '[--sb-pad:var(--sapButton_Accept_Background)] [--sb-sep:var(--sapButton_Accept_TextColor)] [--sb-bd:var(--sapButton_Accept_BorderColor)]',
    negative:
        '[--sb-pad:var(--sapButton_Reject_Background)] [--sb-sep:var(--sapButton_Reject_TextColor)] [--sb-bd:var(--sapButton_Reject_BorderColor)]',
    attention:
        '[--sb-pad:var(--sapButton_Attention_Background)] [--sb-sep:var(--sapButton_Attention_TextColor)] [--sb-bd:var(--sapButton_Attention_BorderColor)]'
};

/** High contrast themes keep the own border of each button; the pad shows through, as in fundamental-styles. */
const HC_BUTTON: Record<ButtonVariant, string> = {
    standard: 'hc:border-sap-button-border-color',
    ghost: 'hc:border-sap-button-border-color',
    emphasized: 'hc:border-sap-button-emphasized-border-color',
    transparent: 'hc:border-sap-button-lite-border-color',
    positive: 'hc:border-sap-button-accept-border-color',
    negative: 'hc:border-sap-button-reject-border-color',
    attention: 'hc:border-sap-button-attention-border-color'
};

/** Pressed look of the arrow button while the menu is open. */
const OPEN: Record<ButtonVariant, string> = {
    standard:
        'bg-sap-button-active-background! border-sap-button-active-border-color! text-sap-button-active-text-color!',
    ghost: 'bg-sap-button-active-background! border-sap-button-active-border-color! text-sap-button-active-text-color!',
    emphasized:
        'bg-sap-button-emphasized-active-background! border-sap-button-emphasized-active-border-color! text-sap-button-emphasized-active-text-color!',
    transparent:
        'bg-sap-button-lite-active-background! border-sap-button-lite-active-border-color! text-sap-button-active-text-color!',
    positive:
        'bg-sap-button-accept-active-background! border-sap-button-accept-active-border-color! text-sap-button-accept-active-text-color!',
    negative:
        'bg-sap-button-reject-active-background! border-sap-button-reject-active-border-color! text-sap-button-reject-active-text-color!',
    attention:
        'bg-sap-button-attention-active-background! border-sap-button-attention-active-border-color! text-sap-button-attention-active-text-color!'
};

/* ------------------------------------------------------------------------------------------------------------------
 * Menu items read from the children
 * ---------------------------------------------------------------------------------------------------------------- */

/** A `MenuItem` of the split button's menu, as the main action needs it. */
interface SplitButtonItem {
    id: string;
    title: string;
    onClick?: MenuItemProps['onClick'];
    submenu: boolean;
}

type AnyElement = ReactElement<{ children?: ReactNode } & Record<string, unknown>>;

/** The plain text of some content, without the addons, subtitles and shortcuts of a menu item. */
function textOf(node: ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(textOf).join('');
    if (!isValidElement(node)) return '';
    if (node.type === MenuAddon || node.type === MenuShortcut || node.type === MenuSubtitle) return '';
    return textOf((node as AnyElement).props.children);
}

/** The `MenuTitle` of an item's content, if it has one. */
function findTitle(node: ReactNode): ReactElement | null {
    for (const child of Children.toArray(node)) {
        if (!isValidElement(child)) continue;
        if (child.type === MenuTitle) return child;
        const found = findTitle((child as AnyElement).props.children);
        if (found) return found;
    }
    return null;
}

/** The title of an item: its `label`, the text of its `MenuTitle`, or its text. */
function titleOf(props: MenuItemProps): string {
    if (props.label) return props.label;
    const title = findTitle(props.children);
    return textOf(title ? (title as AnyElement).props.children : props.children).trim();
}

/**
 * Walks the menu items of the children (through fragments and submenus): gives items without an `id` one, so a
 * chosen item can be found again, marks the main action as `selected`, and collects the items.
 */
function mapItems(
    nodes: ReactNode,
    state: { prefix: string; count: number; marked: string | null; items: SplitButtonItem[] }
): ReactNode {
    return Children.map(nodes, (node) => {
        if (!isValidElement(node)) return node;
        const element = node as AnyElement;
        if (element.type === Fragment) return cloneElement(element, {}, mapItems(element.props.children, state));
        if (element.type !== MenuItem) return element;
        const props = element.props as MenuItemProps;
        const id = props.id ?? `${state.prefix}-${state.count++}`;
        state.items.push({ id, title: titleOf(props), onClick: props.onClick, submenu: props.submenu != null });
        let submenu = props.submenu;
        if (isValidElement(submenu) && submenu.type === Submenu) {
            const sub = submenu as AnyElement;
            submenu = cloneElement(sub, {}, mapItems(sub.props.children, state));
        } else if (submenu != null) {
            submenu = mapItems(submenu, state);
        }
        return cloneElement(element, {
            id,
            selected: id === state.marked,
            ...(props.submenu != null && { submenu })
        });
    });
}

/* ------------------------------------------------------------------------------------------------------------------
 * Split button
 * ---------------------------------------------------------------------------------------------------------------- */

export interface SplitButtonProps extends Omit<ComponentProps<'div'>, 'children' | 'ref'> {
    /** The menu: `MenuItem`s (also in fragments and with submenus). */
    children?: ReactNode;
    /** Button type of both buttons. */
    variant?: ButtonVariant;
    /** Glyph of the arrow button. */
    glyph?: string;
    /** Icon font of the arrow glyph. */
    glyphFont?: IconFont;
    /** Disables both buttons and the menu. */
    disabled?: boolean;
    /** Tooltip of the arrow button (default: its `expandButtonAriaLabel`). */
    expandButtonTitle?: string | null;
    /** Accessible name of the arrow button. */
    expandButtonAriaLabel?: string;
    /** The `id` of the menu item shown as the main action (controlled; Angular's `selected`). */
    selected?: string | null;
    /** The `id` of the menu item shown as the main action initially (uncontrolled). */
    defaultSelected?: string | null;
    /** Called with the `id` of a menu item chosen from the menu, which becomes the main action. */
    onSelectedChange?: (id: string) => void;
    /** Keeps the main button width when its title changes (default true). */
    fixedWidth?: boolean;
    /** The action of the main button until a menu item is chosen, or always with `keepMainAction`. */
    mainAction?: SplitButtonMainAction | null;
    /** Called on clicks on the main button (Angular's `primaryButtonClicked`), before the main action runs. */
    onPrimaryButtonClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    /** Whether the menu is open (controlled). */
    open?: boolean;
    /** Whether the menu is open initially (uncontrolled). */
    defaultOpen?: boolean;
    /** Called when the menu opens or closes. */
    onOpenChange?: (open: boolean, details?: MenuOpenChangeDetails) => void;
    /** Options of the menu (Angular's `fd-menu` inputs), e.g. `closeOnOutsideClick` or `mobile`. */
    menuProps?: Omit<MenuProps, 'children' | 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled'>;
    /** Props of the menu element, e.g. its `aria-label` (default: the `expandButtonAriaLabel`) or `id`. */
    menuPopupProps?: Omit<MenuPopupProps, 'children' | 'anchor'>;
    /** Classes of the main button. */
    mainButtonClassName?: string;
    /** Classes of the arrow button. */
    arrowButtonClassName?: string;
    ref?: Ref<HTMLDivElement>;
}

/**
 * Split button: a main action and an arrow that opens a menu of alternative actions. Choosing a menu item makes it
 * the main action, unless `mainAction.keepMainAction` is set; without a `mainAction` the first item is the main
 * action. The main button runs the main action: the item's `onClick`, or `mainAction.callback`.
 *
 * Renders a `<div role="group">` with two `Button`s; the arrow is the `MenuTrigger` (`aria-haspopup`,
 * `aria-expanded`, `aria-controls`) and opens the menu with a click, Enter, Space, ArrowDown or Alt+ArrowDown (also
 * from the main button). The menu is placed below the whole group.
 *
 * ```tsx
 * <SplitButton variant="emphasized" onPrimaryButtonClick={log}>
 *     <MenuItem onClick={save}>Save</MenuItem>
 *     <MenuItem onClick={saveAs}>Save as</MenuItem>
 * </SplitButton>
 * ```
 */
export function SplitButton({
    children,
    variant = 'standard',
    glyph = 'slim-arrow-down',
    glyphFont = 'SAP-icons',
    disabled = false,
    expandButtonTitle = null,
    expandButtonAriaLabel = 'More actions',
    selected: selectedProp,
    defaultSelected = null,
    onSelectedChange,
    fixedWidth = true,
    mainAction,
    onPrimaryButtonClick,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    menuProps,
    menuPopupProps,
    mainButtonClassName,
    arrowButtonClassName,
    className,
    onFocus,
    ref,
    'aria-label': ariaLabel = 'Split button',
    ...props
}: SplitButtonProps) {
    const prefix = `fd-split-button-${useId()}-item`;
    const group = useRef<HTMLDivElement | null>(null);
    const mainButton = useRef<HTMLButtonElement | null>(null);
    const arrowButton = useRef<HTMLButtonElement | null>(null);

    const [ownSelected, setOwnSelected] = useState<string | null>(defaultSelected);
    const selectedId = selectedProp !== undefined ? selectedProp : ownSelected;
    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const open = (openProp ?? ownOpen) && !disabled;
    const [mainWidth, setMainWidth] = useState<number | null>(null);

    const keepMainAction = !!mainAction?.keepMainAction;

    // the items, first without marking, to find the main action
    const found: SplitButtonItem[] = [];
    mapItems(children, { prefix, count: 0, marked: null, items: found });
    // without a main action, the first item is the main action
    const selectedItem =
        found.find((item) => item.id === selectedId) ?? (mainAction ? undefined : found.find((i) => !i.submenu));
    const marked = keepMainAction ? null : (selectedItem?.id ?? null);
    const items: SplitButtonItem[] = [];
    const menuItems = mapItems(children, { prefix, count: 0, marked, items });

    const showMainAction = !!mainAction && (keepMainAction || !selectedItem);
    const title: ReactNode = showMainAction ? mainAction!.mainActionTitle : (selectedItem?.title ?? '');

    const setOpen = (next: boolean, details?: MenuOpenChangeDetails) => {
        if (openProp === undefined) setOwnOpen(next);
        onOpenChange?.(next, details);
    };

    /** A chosen menu item becomes the main action. */
    const choose = (path: MenuPathItem[]) => {
        menuProps?.onActivePathChange?.(path);
        const last = path[path.length - 1];
        if (!last || last.submenu || keepMainAction || last.id === selectedItem?.id) return;
        if (!items.some((item) => item.id === last.id)) return;
        if (fixedWidth && mainWidth == null && mainButton.current) {
            setMainWidth(mainButton.current.getBoundingClientRect().width);
        }
        if (selectedProp === undefined) setOwnSelected(last.id);
        onSelectedChange?.(last.id);
    };

    const runMainAction = (event: MouseEvent<HTMLButtonElement>) => {
        onPrimaryButtonClick?.(event);
        const item = keepMainAction ? undefined : selectedItem;
        if (item) item.onClick?.(event);
        else mainAction?.callback?.();
    };

    /** ArrowDown (Angular) and Alt/Option+ArrowDown (Fiori) open the menu. */
    const openFromKeyboard = (event: KeyboardEvent<HTMLElement>, altOnly: boolean) => {
        if (event.key !== 'ArrowDown' || (altOnly && !event.altKey) || open || disabled) return;
        event.preventDefault();
        setOpen(true, { reason: 'trigger-press', event: event.nativeEvent });
    };

    const buttonClass = cn(
        'm-0 border-transparent bg-transparent enabled-hover:z-[1] enabled-hover:shadow-none focus:z-[2]',
        HC_BUTTON[variant]
    );

    return (
        <div
            {...props}
            ref={(node) => {
                group.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            role="group"
            tabIndex={-1}
            aria-label={ariaLabel}
            data-open={open ? '' : undefined}
            className={cn(
                'relative inline-flex align-middle outline-none',
                PAD[variant],
                // the pad behind the buttons: background and border of a single button
                "before:absolute before:inset-0 before:rounded-sap-button-border-corner-radius before:bg-(--sb-pad) before:content-['']",
                'before:[box-shadow:inset_0_0_0_var(--sapButton_BorderWidth)_var(--sb-bd)] hc:before:[box-shadow:none]',
                // the separator between the buttons
                "after:absolute after:end-[2.125rem] after:top-1/2 after:z-10 after:mx-0.5 after:block after:h-4 after:w-(--sapButton_BorderWidth) after:-translate-y-1/2 after:bg-(--sb-sep) after:content-['']",
                'compact:after:end-[1.875rem] hover:after:hidden data-open:after:hidden hc:after:hidden',
                className
            )}
            onFocus={(event: FocusEvent<HTMLDivElement>) => {
                onFocus?.(event);
                // the group itself passes the focus on to the arrow, as Angular's
                if (event.target === event.currentTarget) arrowButton.current?.focus();
            }}
        >
            <Button
                ref={mainButton}
                variant={variant}
                disabled={disabled}
                label={title}
                style={mainWidth != null ? { width: `${mainWidth}px` } : undefined}
                className={cn(
                    buttonClass,
                    // a stretched group (e.g. in a toolbar's overflow) grows the main button, the arrow stays at the end
                    'grow justify-start hc:rounded-e-none hc:-me-px',
                    // in HC the focus frame follows the square inner corners
                    'hc:focus:after:rounded-s-sap-button-border-corner-radius hc:focus:after:rounded-e-none',
                    variant === 'emphasized' && 'hc:-me-(--sapButton_Emphasized_BorderWidth)',
                    '[&>span]:block [&>span]:max-w-34 compact:[&>span]:max-w-36 [&>span]:truncate',
                    mainButtonClassName
                )}
                onClick={runMainAction}
                onKeyDown={(event) => openFromKeyboard(event, true)}
            />
            <Menu {...menuProps} open={open} onOpenChange={setOpen} disabled={disabled} onActivePathChange={choose}>
                <MenuTrigger
                    ref={arrowButton}
                    disabled={disabled}
                    render={
                        <Button
                            variant={variant}
                            glyph={glyph}
                            glyphFont={glyphFont}
                            aria-label={expandButtonAriaLabel}
                            title={expandButtonTitle || expandButtonAriaLabel}
                            className={cn(
                                buttonClass,
                                'hc:rounded-s-none hc:focus:after:rounded-s-none hc:focus:after:rounded-e-sap-button-border-corner-radius',
                                open && OPEN[variant],
                                arrowButtonClassName
                            )}
                            onKeyDown={(event) => openFromKeyboard(event, false)}
                        />
                    }
                />
                <MenuPopup
                    aria-label={menuPopupProps?.['aria-labelledby'] ? undefined : expandButtonAriaLabel}
                    {...menuPopupProps}
                    anchor={group}
                >
                    {menuItems}
                </MenuPopup>
            </Menu>
        </div>
    );
}
