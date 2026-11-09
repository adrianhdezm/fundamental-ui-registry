/*
 * Port of @fundamental-ngx/core (product-switch) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    useSyncExternalStore,
    type ComponentProps,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactElement,
    type ReactNode
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Avatar, type ColorAccent } from '@/ui/avatar/avatar';
import { BusyIndicator } from '@/ui/busy-indicator/busy-indicator';
import { Button } from '@/ui/button/button';
import { Icon, type IconFont } from '@/ui/icon/icon';
import {
    createPopoverHandle,
    Popover,
    PopoverBody,
    PopoverTrigger,
    type Placement,
    type PopoverOpenChangeDetails,
    type TriggerConfig
} from '@/ui/popover/popover';

/** A product of the switch: an icon or avatar, a title and an optional subtitle. */
export interface ProductSwitchItem {
    title: string;
    subtitle?: string;
    /** Called on click (with the click event); otherwise `url` opens in `target`. */
    callback?: (event: ReactMouseEvent<HTMLLIElement>) => void;
    url?: string;
    target?: '_self' | '_blank' | '_parent' | '_top';
    icon?: string;
    font?: IconFont;
    /**
     * An avatar instead of the icon. Prefer an `image` or a `glyph`: the initials of a `label` are visible text that
     * the item's accessible name (title, subtitle) does not contain (WCAG 2.5.3, Label in Name).
     */
    avatar?: {
        glyph?: string;
        label?: string;
        image?: string;
        circle?: boolean;
        transparent?: boolean;
        placeholder?: boolean;
        tile?: boolean;
        colorAccent?: ColorAccent | null;
        border?: boolean;
        ariaLabel?: string;
    };
    /** The item cannot be dragged. */
    disabledDragAndDrop?: boolean;
    /** The item keeps its position when others are dragged. */
    stickToPosition?: boolean;
}

const TARGET_LABEL: Record<string, string> = {
    _blank: 'Opens in a new tab',
    _parent: 'Opens in the parent frame',
    _top: 'Opens in the full window'
};

/** Pointer movement in px before a press on an item becomes a drag (the CDK's drag start threshold). */
const DRAG_THRESHOLD = 5;

/** Closes the product switch the body sits in; nothing outside of a `ProductSwitch`. */
const ProductSwitchContext = createContext<{ close: () => void } | null>(null);

/** The window width, as the CDK's `ViewportRuler`. */
function useViewportWidth(): number {
    return useSyncExternalStore(
        (onChange) => {
            window.addEventListener('resize', onChange);
            return () => window.removeEventListener('resize', onChange);
        },
        () => window.innerWidth,
        () => 1280
    );
}

/** Stable React keys for the product objects, so a reordered item keeps its element. */
const KEYS = new WeakMap<ProductSwitchItem, number>();
let nextKey = 0;
function keyOf(item: ProductSwitchItem): number {
    let key = KEYS.get(item);
    if (key === undefined) {
        key = nextKey++;
        KEYS.set(item, key);
    }
    return key;
}

function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
    const items = [...list];
    const [item] = items.splice(from, 1);
    items.splice(to, 0, item);
    return items;
}

function itemLabel(item: ProductSwitchItem): string {
    const parts = [item.title];
    if (item.subtitle) parts.push(item.subtitle);
    const target = item.target ?? '_blank';
    if (item.url && target !== '_self') parts.push(TARGET_LABEL[target]);
    return parts.join(' ');
}

interface DragState {
    /** Index of the dragged product in `products`. */
    from: number;
    /** Index it would be dropped at. */
    over: number;
    /** Pointer position and the grab point inside the item, for the preview that follows the pointer. */
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
}

export interface ProductSwitchBodyProps extends Omit<ComponentProps<'div'>, 'children'> {
    /** The products (controlled); drops call `onProductsChange` with the new order. */
    products?: ProductSwitchItem[];
    /** The initial products (uncontrolled). */
    defaultProducts?: ProductSwitchItem[];
    /** Called with the reordered products after a drop. */
    onProductsChange?: (products: ProductSwitchItem[]) => void;
    /** Products can be reordered by drag and drop (default true). */
    dragAndDropEnabled?: boolean;
    /** Always shows the list layout. */
    forceListMode?: boolean;
    /** Shows the busy indicator over the products. */
    busy?: boolean;
    /** Called when a product is opened, before its callback or url. */
    onItemClick?: (item: ProductSwitchItem) => void;
}

/**
 * The products: a grid of four (seven or more products), three (three to six) or two columns that becomes a list on
 * small screens (below 776px with four columns, 588px otherwise) or with `forceListMode`. A `menu` of `menuitem`s,
 * each named by its title, subtitle and, for a url that opens elsewhere, where it opens. Arrow keys move between
 * them (Up and Down by a row; in the list they wrap), Home and End to the first and last, Enter and Space open them.
 * Products can be reordered with the mouse; sticky ones keep their place. Opening a product closes the switch.
 *
 * Native props, `className` and `ref` go to the root element.
 */
export function ProductSwitchBody({
    products: productsProp,
    defaultProducts = [],
    onProductsChange,
    dragAndDropEnabled = true,
    forceListMode = false,
    busy = false,
    onItemClick,
    className,
    ...props
}: ProductSwitchBodyProps) {
    const parent = useContext(ProductSwitchContext);
    const [own, setOwn] = useState(defaultProducts);
    const products = productsProp ?? own;
    const list = useRef<HTMLUListElement>(null);
    const viewportWidth = useViewportWidth();
    const [drag, setDrag] = useState<DragState | null>(null);
    /** Set while a drag ends, so the click that follows the drop does not open the product. */
    const dragged = useRef(false);
    const cleanup = useRef<(() => void) | null>(null);
    useEffect(() => () => cleanup.current?.(), []);

    const columns = products.length >= 7 ? 4 : products.length >= 3 ? 3 : 2;
    const listMode = forceListMode || viewportWidth < (columns === 4 ? 776 : 588);
    const shown = drag ? moveItem(products, drag.from, drag.over) : products;

    const items = () => Array.from(list.current?.querySelectorAll<HTMLElement>(':scope > [role=menuitem]') ?? []);

    const open = (item: ProductSwitchItem, event: ReactMouseEvent<HTMLLIElement>) => {
        if (dragged.current) {
            dragged.current = false;
            return;
        }
        onItemClick?.(item);
        parent?.close();
        if (item.callback) item.callback(event);
        else if (item.url) window.open(item.url, item.target ?? '_blank');
    };

    const onKeyDown = (event: ReactKeyboardEvent<HTMLLIElement>, index: number) => {
        if (event.key === 'Tab' || drag) return;
        const all = items();
        const last = all.length - 1;
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        let next: number | null = null;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            all[index].click();
            return;
        }
        if (listMode) {
            if (event.key === 'ArrowDown') next = index === last ? 0 : index + 1;
            if (event.key === 'ArrowUp') next = index === 0 ? last : index - 1;
        } else {
            const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
            const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
            if (event.key === forward) next = index === last ? 0 : index + 1;
            if (event.key === backward) next = index - 1;
            if (event.key === 'ArrowDown') next = index + columns;
            if (event.key === 'ArrowUp') next = index - columns;
        }
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = last;
        if (next === null) return;
        event.preventDefault();
        all[next]?.focus();
    };

    /** Starts a drag once the pointer moves past the threshold; the item under the pointer becomes the drop place. */
    const onPointerDown = (event: ReactPointerEvent<HTMLLIElement>, index: number) => {
        const item = products[index];
        if (!dragAndDropEnabled || event.button !== 0 || item.disabledDragAndDrop || item.stickToPosition) return;
        cleanup.current?.();
        const element = event.currentTarget;
        const startX = event.clientX;
        const startY = event.clientY;
        let state: DragState | null = null;
        const move = (e: PointerEvent) => {
            if (!state) {
                if (Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD) return;
                const rect = element.getBoundingClientRect();
                state = {
                    from: index,
                    over: index,
                    x: e.clientX,
                    y: e.clientY,
                    offsetX: startX - rect.left,
                    offsetY: startY - rect.top,
                    width: rect.width,
                    height: rect.height
                };
                document.body.style.userSelect = 'none';
                window.getSelection()?.removeAllRanges();
            }
            e.preventDefault();
            const target = items().findIndex((el) => {
                const r = el.getBoundingClientRect();
                return e.clientX >= r.left && e.clientX < r.right && e.clientY >= r.top && e.clientY < r.bottom;
            });
            // sticky products keep their index: nothing is sorted into their place
            const over =
                target >= 0 && target !== state.over && !products[target]?.stickToPosition ? target : state.over;
            state = { ...state, x: e.clientX, y: e.clientY, over };
            setDrag(state);
        };
        const end = (drop: boolean) => {
            stop();
            if (!state) return;
            dragged.current = true;
            // the click that ends a drag does not open the product
            setTimeout(() => (dragged.current = false));
            setDrag(null);
            if (drop && state.over !== state.from) {
                const next = moveItem(products, state.from, state.over);
                if (productsProp === undefined) setOwn(next);
                onProductsChange?.(next);
            }
        };
        const up = () => end(true);
        const cancel = () => end(false);
        const stop = () => {
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', up);
            document.removeEventListener('pointercancel', cancel);
            document.body.style.userSelect = '';
            cleanup.current = null;
        };
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
        document.addEventListener('pointercancel', cancel);
        cleanup.current = stop;
    };

    // the item keeps the focus when it moves in the DOM
    const focusedKey = useRef<number | null>(null);
    useLayoutEffect(() => {
        if (focusedKey.current === null) return;
        const el = list.current?.querySelector<HTMLElement>(`[data-key="${focusedKey.current}"]`);
        if (el && document.activeElement !== el) el.focus();
    });

    const itemClass = cn(
        'group/ps m-0 box-border flex gap-1 hover:cursor-pointer rounded-sap-element-border-corner-radius bg-sap-list-background',
        'outline-2 -outline-offset-2 outline-transparent hover:bg-sap-list-hover-background',
        'active:bg-sap-list-active-background active:outline-sap-content-focus-color',
        'focus:outline-(length:--sapContent_FocusWidth) focus:[outline-style:var(--sapContent_FocusStyle)] focus:outline-sap-content-focus-color focus:-outline-offset-3',
        listMode
            ? 'min-h-24 max-w-full flex-auto flex-row gap-3 p-4 text-start'
            : 'min-h-[7.375rem] max-w-[11.25rem] flex-[1_0_25%] flex-col items-center px-2 py-4 text-center'
    );

    const content = (product: ProductSwitchItem) => (
        <>
            {product.avatar ? (
                <Avatar
                    size="s"
                    glyph={product.avatar.glyph ?? null}
                    label={product.avatar.label ?? null}
                    image={product.avatar.image ?? null}
                    circle={!!product.avatar.circle}
                    transparent={!!product.avatar.transparent}
                    placeholder={!!product.avatar.placeholder}
                    tile={!!product.avatar.tile}
                    border={!!product.avatar.border}
                    colorAccent={product.avatar.colorAccent ?? null}
                    aria-label={product.avatar.ariaLabel}
                />
            ) : (
                <Icon
                    role="presentation"
                    glyph={product.icon}
                    font={product.font ?? 'SAP-icons'}
                    className="flex min-h-12 min-w-12 items-center justify-center text-[1.5rem] leading-none text-sap-content-icon-color group-active/ps:text-sap-list-active-text-color"
                />
            )}
            <div className={cn('m-0 flex w-full flex-col gap-1 p-0', listMode && 'h-full justify-between')}>
                <div className="m-0 p-0 whitespace-normal text-sap-title-color group-active/ps:text-sap-list-active-text-color">
                    {product.title}
                </div>
                {/* a space between title and subtitle in the text, so it reads as the item's name */}
                {product.subtitle && ' '}
                {product.subtitle && (
                    <div className="m-0 p-0 text-sap-font-small-size whitespace-normal text-sap-content-label-color group-active/ps:text-sap-list-active-text-color">
                        {product.subtitle}
                    </div>
                )}
            </div>
        </>
    );

    const preview = drag && products[drag.from];

    return (
        <div
            {...props}
            className={cn(
                'block font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color',
                className
            )}
        >
            <BusyIndicator loading={busy} block>
                <div
                    className={cn(
                        'm-0 box-border max-h-[33rem] w-fit overflow-y-auto bg-sap-list-background px-4 py-6 scrollbar-sap',
                        'rounded-sap-popover-border-corner-radius',
                        listMode && 'w-full max-w-[353px] max-h-screen overflow-x-hidden rounded-none p-4'
                    )}
                >
                    <ul
                        ref={list}
                        role="menu"
                        className={cn(
                            'relative m-0 box-border flex list-none flex-wrap gap-2 p-0',
                            listMode
                                ? 'w-full flex-col gap-0'
                                : { 4: 'w-[46.5rem]', 3: 'w-[34.75rem]', 2: 'w-[23rem]' }[columns]
                        )}
                    >
                        {shown.map((product, i) => {
                            const key = keyOf(product);
                            const index = products.indexOf(product);
                            return (
                                <li
                                    key={key}
                                    data-key={key}
                                    role="menuitem"
                                    tabIndex={0}
                                    aria-label={itemLabel(product)}
                                    aria-posinset={i + 1}
                                    aria-setsize={shown.length}
                                    data-dragging={drag && index === drag.from ? '' : undefined}
                                    className={cn(itemClass, 'data-dragging:opacity-0')}
                                    onClick={(event) => open(product, event)}
                                    onKeyDown={(event) => onKeyDown(event, i)}
                                    onPointerDown={(event) => onPointerDown(event, index)}
                                    onFocus={() => (focusedKey.current = key)}
                                    onBlur={() => (focusedKey.current = null)}
                                >
                                    {product.url ? (
                                        // a real link for the browser (hover shows the URL); the item handles click and keys
                                        <a
                                            tabIndex={-1}
                                            aria-hidden="true"
                                            draggable={false}
                                            className="contents text-inherit no-underline"
                                            href={product.url}
                                            target={product.target ?? '_blank'}
                                            onClick={(event) => event.preventDefault()}
                                        >
                                            {content(product)}
                                        </a>
                                    ) : (
                                        content(product)
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </BusyIndicator>
            {preview &&
                createPortal(
                    // the dragged product follows the pointer, as fundamental-styles' `dragged` item
                    <div
                        aria-hidden="true"
                        data-product-switch-preview=""
                        className={cn(
                            itemClass,
                            'pointer-events-none fixed z-[1001] cursor-grabbing font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color',
                            '[box-shadow:var(--sapContent_Shadow2)] hover:bg-sap-list-background'
                        )}
                        style={{
                            left: drag.x - drag.offsetX,
                            top: drag.y - drag.offsetY,
                            width: drag.width,
                            height: drag.height
                        }}
                    >
                        {content(preview)}
                    </div>,
                    list.current?.ownerDocument.body ?? document.body
                )}
        </div>
    );
}

export interface ProductSwitchProps extends Omit<ComponentProps<'div'>, 'children'> {
    /** The `ProductSwitchBody`. */
    children?: ReactNode;
    /** Placement of the products against the button (default `bottom-end`). */
    placement?: Placement;
    /** The switch cannot be opened. */
    disabled?: boolean;
    /** Closes on Escape (default true). */
    closeOnEscapeKey?: boolean;
    /** Closes on a press outside (default true). */
    closeOnOutsideClick?: boolean;
    /** Hides the popover arrow (default true). */
    noArrow?: boolean;
    /** Events on the button that open and close the switch (default `['click']`), see `Popover`. */
    triggers?: readonly (string | TriggerConfig)[];
    /** Keeps Tab inside the products (default false). */
    focusTrapped?: boolean;
    /** Name and tooltip of the default button (default "Product switch"). */
    'aria-label'?: string;
    /** Classes of the default button, e.g. shellbar button styles (Angular's `buttonClass`). */
    buttonClassName?: string;
    /** An element that replaces the grid button (Angular's `fdProductSwitchButton`); it becomes the trigger. */
    button?: ReactElement;
    /** Whether the switch is open (controlled). */
    open?: boolean;
    /** Whether the switch is open initially (uncontrolled). */
    defaultOpen?: boolean;
    /** Called when the switch opens or closes by the user. */
    onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
    /** Called before the switch opens. */
    onBeforeOpen?: () => void;
}

/**
 * Product switch: a grid button (in the shellbar) that opens the products of the user in a popover. The button has
 * `aria-haspopup="menu"` and `aria-expanded`; opening focuses the first product, Escape and an outside click close
 * it, and choosing a product closes it and returns the focus to the button.
 *
 * ```tsx
 * <ProductSwitch>
 *     <ProductSwitchBody products={products} onProductsChange={setProducts} />
 * </ProductSwitch>
 * ```
 *
 * Native props, `className` and `ref` go to the root element; `aria-label` names the button.
 */
export function ProductSwitch({
    children,
    placement = 'bottom-end',
    disabled = false,
    closeOnEscapeKey = true,
    closeOnOutsideClick = true,
    noArrow = true,
    triggers = DEFAULT_TRIGGERS,
    focusTrapped = false,
    'aria-label': ariaLabel = 'Product switch',
    buttonClassName,
    button,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onBeforeOpen,
    className,
    ...props
}: ProductSwitchProps) {
    const [own, setOwn] = useState(defaultOpen);
    const open = openProp ?? own;
    const [handle] = useState(() => createPopoverHandle());
    // choosing a product closes the switch
    const [context] = useState(() => ({ close: () => handle.close() }));

    return (
        <div {...props} className={cn('inline-block', className)}>
            <Popover
                handle={handle}
                placement={placement}
                open={open}
                onOpenChange={(next, details) => {
                    if (next) onBeforeOpen?.();
                    if (openProp === undefined) setOwn(next);
                    onOpenChange?.(next, details);
                }}
                disabled={disabled}
                triggers={triggers}
                closeOnEscapeKey={closeOnEscapeKey}
                closeOnOutsideClick={closeOnOutsideClick}
                noArrow={noArrow}
                disableScrollbar
                focusTrapped={focusTrapped}
                focusAutoCapture
            >
                <PopoverTrigger
                    aria-haspopup="menu"
                    render={
                        button ?? (
                            <Button
                                variant="transparent"
                                glyph="grid"
                                data-density="cozy"
                                aria-label={ariaLabel}
                                title={ariaLabel}
                                className={buttonClassName}
                            />
                        )
                    }
                />
                <PopoverBody role={undefined}>
                    <ProductSwitchContext.Provider value={context}>{children}</ProductSwitchContext.Provider>
                </PopoverBody>
            </Popover>
        </div>
    );
}

const DEFAULT_TRIGGERS = ['click'] as const;
