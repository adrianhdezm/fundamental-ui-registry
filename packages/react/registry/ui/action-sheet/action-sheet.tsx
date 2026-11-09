/*
 * Port of @fundamental-ngx/core (action-sheet) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    createContext,
    useCallback,
    useContext,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactElement,
    type ReactNode,
    type Ref,
    type RefCallback
} from 'react';
import { cn } from '@/lib/utils';
import { Bar, BarElement, BarLeft } from '@/ui/bar/bar';
import { Button, type ButtonProps, type ButtonVariant } from '@/ui/button/button';
import { Dialog, DialogPopup, DialogTrigger, type DialogPopupProps } from '@/ui/dialog/dialog';
import type { IconFont } from '@/ui/icon/icon';
import { Popover, PopoverBody, PopoverTrigger, type Placement, type PopoverBodyProps } from '@/ui/popover/popover';

/** Details of an open state change: `reason` (`trigger-press`, `outside-press`, `escape-key`, `item-press`, `tab-key`, ...) and `event`. */
export interface ActionSheetOpenChangeDetails {
    reason: string;
    event?: Event;
}

interface ActionSheetContextValue {
    mobile: boolean;
    open: boolean;
    setOpen: (open: boolean, details: ActionSheetOpenChangeDetails) => void;
    controlTitle: string | null;
    controlTitleHeading: 1 | 2 | 3 | 4 | 5 | 6;
}

const ActionSheetContext = createContext<ActionSheetContextValue | null>(null);

interface ActionSheetBodyContextValue {
    activeId: string | null;
    setActiveId: (id: string) => void;
}

const ActionSheetBodyContext = createContext<ActionSheetBodyContextValue | null>(null);

function mergeRefs<E>(...refs: (Ref<E> | undefined)[]): RefCallback<E> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
}

/** The actions of a menu that can take the focus, in DOM order. */
function enabledItems(list: HTMLElement | null): HTMLElement[] {
    if (!list) return [];
    return [...list.querySelectorAll<HTMLElement>('[role="menuitem"]')].filter(
        (el) => !el.matches(':disabled, [aria-disabled="true"]')
    );
}

export interface ActionSheetProps {
    children?: ReactNode;
    /** Shows the actions in a sheet at the bottom of the screen, over a block layer (for phones). */
    mobile?: boolean;
    /** Preferred placement of the popover; it flips to the other side when there is no room (default `bottom`). */
    placement?: Placement;
    /** Hides the arrow of the popover. */
    noArrow?: boolean;
    /** Whether the action sheet is open (controlled; Angular's `isOpen`). */
    open?: boolean;
    /** Whether the action sheet is open initially (uncontrolled). */
    defaultOpen?: boolean;
    /** Called when the action sheet opens or closes; `details.reason` says why. */
    onOpenChange?: (open: boolean, details: ActionSheetOpenChangeDetails) => void;
    /** Title above the actions in mobile mode. */
    controlTitle?: string | null;
    /** Heading level of the title in mobile mode (default 2). */
    controlTitleHeading?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Action sheet: a list of actions for the control that opens it, in a popover (Base UI's Popover), or with `mobile`
 * in a sheet at the bottom of the screen (a modal Base UI Dialog). ArrowUp/ArrowDown, Home and End move between the
 * actions; Escape and Tab close it, and the focus returns to the control. Close buttons close it when chosen.
 *
 * `ActionSheet` renders no element: it holds the state and the options its parts read.
 *
 * ```tsx
 * <ActionSheet>
 *     <ActionSheetControl render={<Button glyph="settings" aria-label="Actions" />} />
 *     <ActionSheetBody aria-label="Actions">
 *         <ActionSheetItem label="Download" glyph="download" onClick={download} />
 *         <ActionSheetItem label="Cancel" negative isCloseButton />
 *     </ActionSheetBody>
 * </ActionSheet>
 * ```
 */
export function ActionSheet({
    children,
    mobile = false,
    placement = 'bottom',
    noArrow = false,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    controlTitle = null,
    controlTitleHeading = 2
}: ActionSheetProps) {
    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const open = openProp ?? ownOpen;
    const controlled = openProp !== undefined;
    const setOpen = useCallback(
        (next: boolean, details: ActionSheetOpenChangeDetails) => {
            if (!controlled) setOwnOpen(next);
            onOpenChange?.(next, details);
        },
        [controlled, onOpenChange]
    );

    const context = useMemo<ActionSheetContextValue>(
        () => ({ mobile, open, setOpen, controlTitle, controlTitleHeading }),
        [mobile, open, setOpen, controlTitle, controlTitleHeading]
    );

    return (
        <ActionSheetContext.Provider value={context}>
            {mobile ? (
                <Dialog open={open} onOpenChange={(next, details) => setOpen(next, details)} backdropClickCloseable>
                    {children}
                </Dialog>
            ) : (
                <Popover
                    open={open}
                    onOpenChange={(next, details) => setOpen(next, details)}
                    placement={placement}
                    noArrow={noArrow}
                    // Tab closes the action sheet (see ActionSheetBody) instead of moving inside it
                    focusTrapped={false}
                >
                    {children}
                </Popover>
            )}
        </ActionSheetContext.Provider>
    );
}

export interface ActionSheetControlProps extends Omit<ComponentProps<'button'>, 'ref'> {
    /** Renders your own control, e.g. `render={<Button glyph="settings" aria-label="Actions" />}`. */
    render?: ReactElement;
    /** Set to false when `render` is not a `<button>`: the element becomes focusable and opens with Enter and Space. */
    nativeButton?: boolean;
    ref?: Ref<HTMLButtonElement>;
}

/**
 * The control that opens the action sheet: a `<button>` by default, with `aria-haspopup="menu"` and
 * `aria-expanded`. Render your own control with `render`, e.g.
 * `render={<Button glyph="settings" aria-label="Actions" />}`; for an element that is not a button, also pass
 * `nativeButton={false}`.
 */
export function ActionSheetControl({ 'aria-haspopup': hasPopup = 'menu', ref, ...props }: ActionSheetControlProps) {
    const sheet = useContext(ActionSheetContext);
    if (sheet?.mobile) {
        return <DialogTrigger {...props} ref={ref} aria-haspopup={hasPopup} aria-expanded={sheet.open} />;
    }
    return <PopoverTrigger {...props} ref={ref as Ref<HTMLElement>} aria-haspopup={hasPopup} />;
}

export interface ActionSheetBodyProps extends Omit<ComponentProps<'ul'>, 'role'> {
    /** Element the popover or the sheet is rendered into (default `document.body`). */
    container?: PopoverBodyProps['container'] & DialogPopupProps['container'];
    /** What gets the focus on opening (Base UI `initialFocus`): the first enabled action by default, `false` none. */
    initialFocus?: PopoverBodyProps['initialFocus'] & DialogPopupProps['initialFocus'];
}

const LIST =
    'm-0 box-border w-full list-none p-0 px-2 py-1 compact:px-[0.375rem] compact:py-[0.1875rem] rounded-sap-popover-border-corner-radius';
const MOBILE_LIST =
    'relative z-[1] ms-px w-[calc(100%_-_0.125rem)] overflow-auto bg-sap-group-content-background [box-shadow:var(--sapContent_Shadow1)] [[data-sheet-bar]+&]:rounded-t-none';

/**
 * The actions: a `<ul role="menu">` in the popover or the sheet. Give it an `aria-label` or `aria-labelledby`.
 * Native props, `className` and `ref` go to the list; `container` places the popover or sheet in another element.
 * The list is a single tab stop (the active action); the arrow keys, Home and End move between the actions and wrap,
 * skipping disabled ones; Tab closes the action sheet.
 */
export function ActionSheetBody({
    container,
    initialFocus,
    className,
    onKeyDown,
    ref,
    children,
    ...props
}: ActionSheetBodyProps) {
    const sheet = useContext(ActionSheetContext);
    const mobile = !!sheet?.mobile;
    const autoId = useId();
    const id = props.id ?? `fd-action-sheet-body-${autoId}`;
    const titleId = `${id}-title`;
    const list = useRef<HTMLUListElement | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    // one tab stop: the active action, or the first enabled one
    useLayoutEffect(() => {
        const items = enabledItems(list.current);
        if (!items.length || items.some((el) => el.id === activeId)) return;
        setActiveId(items[0]!.id);
    });

    const bodyContext = useMemo<ActionSheetBodyContextValue>(() => ({ activeId, setActiveId }), [activeId]);

    const onListKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === 'Tab') {
            event.preventDefault();
            sheet?.setOpen(false, { reason: 'tab-key', event: event.nativeEvent });
            return;
        }
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const items = enabledItems(list.current);
        if (!items.length) return;
        const current = items.indexOf(document.activeElement as HTMLElement);
        let next: number;
        if (event.key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % items.length;
        else if (event.key === 'ArrowUp')
            next = current < 0 ? items.length - 1 : (current - 1 + items.length) % items.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        else return;
        event.preventDefault();
        items[next]!.focus();
    };

    const labelled = { 'aria-label': props['aria-label'], 'aria-labelledby': props['aria-labelledby'] };
    const firstAction = initialFocus ?? (() => enabledItems(list.current)[0] ?? true);

    const menu = (
        <ActionSheetBodyContext.Provider value={bodyContext}>
            <ul
                {...props}
                ref={mergeRefs(list, ref)}
                id={id}
                role="menu"
                className={cn(LIST, mobile && MOBILE_LIST, className)}
                onKeyDown={onListKeyDown}
            >
                {children}
            </ul>
        </ActionSheetBodyContext.Provider>
    );

    if (mobile) {
        const title = sheet?.controlTitle;
        return (
            <DialogPopup
                container={container}
                // the sheet sits at the bottom of the screen, as wide as it; the parts draw the surfaces
                position={{ bottom: 0, left: 0 }}
                width="100%"
                className="min-w-0 min-h-0 max-w-full max-h-full rounded-none [box-shadow:none] overflow-visible"
                {...(title ? { 'aria-labelledby': titleId } : labelled)}
                initialFocus={firstAction}
            >
                {title && (
                    <Bar
                        data-sheet-bar=""
                        role={null}
                        className="ms-px w-[calc(100%_-_var(--sapGroup_BorderWidth)*2)] rounded-t-sap-popover-border-corner-radius [--bar-shadow:var(--sapContent_Shadow2)]"
                    >
                        <BarLeft>
                            <BarElement>
                                <div
                                    id={titleId}
                                    role="heading"
                                    aria-level={sheet?.controlTitleHeading ?? 2}
                                    className="truncate font-sap-font-header-family text-sap-font-header5-size text-sap-page-header-text-color"
                                >
                                    {title}
                                </div>
                            </BarElement>
                        </BarLeft>
                    </Bar>
                )}
                {menu}
            </DialogPopup>
        );
    }

    return (
        // the list is the menu: the popover body has no role of its own (Angular's `bodyRole` null)
        <PopoverBody container={container} role={undefined} initialFocus={firstAction}>
            {menu}
        </PopoverBody>
    );
}

export interface ActionSheetItemProps extends Omit<ButtonProps, 'role' | 'tabIndex' | 'variant' | 'fullWidth'> {
    /** Text of the action. Children work too. */
    label?: ReactNode;
    /** Glyph of an SAP icon before the text. */
    glyph?: string | null;
    /** Icon font of the glyph. */
    glyphFont?: IconFont;
    /** A destructive or cancelling action, shown centred in the negative style. */
    negative?: boolean;
    /** Closes the action sheet when chosen. */
    isCloseButton?: boolean;
    /** Button type of the action (Angular's `fdType`); `standard` shows as `transparent`, as fundamental-styles. */
    variant?: ButtonVariant;
    /** Props of the `<li>` around the action. */
    listItemProps?: ComponentProps<'li'>;
}

/**
 * An action of the action sheet: an `<li role="none">` with a full-width button (`role="menuitem"`). Native props,
 * `className`, `ref` and `onClick` go to the button; `listItemProps` to the `<li>`.
 */
export function ActionSheetItem({
    negative = false,
    isCloseButton = false,
    variant = 'standard',
    disabled = false,
    listItemProps,
    id: idProp,
    className,
    onClick,
    onFocus,
    ...props
}: ActionSheetItemProps) {
    const sheet = useContext(ActionSheetContext);
    const body = useContext(ActionSheetBodyContext);
    const autoId = useId();
    const id = idProp ?? `fd-action-sheet-item-${autoId}`;
    const computedVariant: ButtonVariant = negative ? 'negative' : variant === 'standard' ? 'transparent' : variant;

    return (
        <li
            role="none"
            {...listItemProps}
            className={cn('m-0 box-border block w-full p-0 py-1 compact:py-[0.1875rem]', listItemProps?.className)}
        >
            <Button
                {...props}
                id={id}
                role="menuitem"
                fullWidth
                variant={computedVariant}
                disabled={disabled}
                tabIndex={body?.activeId === id ? 0 : -1}
                className={cn(!negative && 'justify-start text-start', className)}
                onFocus={(event) => {
                    onFocus?.(event);
                    body?.setActiveId(id);
                }}
                onClick={(event) => {
                    if (disabled) return;
                    body?.setActiveId(id);
                    onClick?.(event);
                    if (isCloseButton) sheet?.setOpen(false, { reason: 'item-press', event: event.nativeEvent });
                }}
            />
        </li>
    );
}
