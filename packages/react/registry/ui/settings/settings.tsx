/*
 * Port of @fundamental-ngx/core (settings) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    createContext,
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
    type MouseEvent,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Bar, BarElement, BarLeft } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import type { DialogConfig } from '@/ui/dialog/dialog';
import { List, ListItem, type ListItemProps, type ListProps } from '@/ui/list/list';
import { Title, type HeaderSize } from '@/ui/title/title';

export type SettingsViewMode = 'lg' | 'md' | 'sm';
export type SettingsSpacingSize = 'small' | 'medium' | 'large' | 'form';

/** A view pushed on top of the detail area, e.g. the details of a setting. */
export interface SettingsStackedView {
    view: ReactNode;
    title: string;
}

/**
 * Classes of a settings dialog window: 60rem by 42.5rem on large screens, narrower on medium ones, and full screen
 * on small ones, following the view mode of the settings container inside.
 */
export const SETTINGS_DIALOG_CLASS = [
    'w-[60rem] h-[42.5rem] max-w-[60rem] max-h-[42.5rem]',
    'has-[[data-settings-view=md]]:w-[80%] has-[[data-settings-view=md]]:max-w-[40rem] has-[[data-settings-view=md]]:h-[88%]',
    'has-[[data-settings-view=sm]]:w-full has-[[data-settings-view=sm]]:max-w-full has-[[data-settings-view=sm]]:h-full has-[[data-settings-view=sm]]:max-h-full',
    'has-[[data-settings-view=sm]]:rounded-none has-[[data-settings-view=sm]]:shadow-none'
].join(' ');

/**
 * Options of a settings dialog opened by `useDialogService()`: no body paddings and the settings window size. With
 * a `DialogPopup` of your own, pass `className={SETTINGS_DIALOG_CLASS}` and `<DialogBody disablePaddings>`.
 */
export function settingsDialogConfig<T>(config: DialogConfig<T> = {}): DialogConfig<T> {
    return {
        ...config,
        disablePaddings: true,
        dialogPanelClass: cn(SETTINGS_DIALOG_CLASS, config.dialogPanelClass)
    };
}

/* ------------------------------------------------------------------------------------------------------------------
 * Container
 * ---------------------------------------------------------------------------------------------------------------- */

interface SettingsItemEntry {
    value: string;
    view: ReactNode;
    title: () => string;
    element: () => HTMLElement | null;
}

/** What a settings view can do: push further views, go back, select an item. */
export interface SettingsActions {
    /** Shows a further view in the detail area, with a back button. */
    pushView(view: ReactNode, title: string): void;
    /** Back to the previous view. */
    popView(): void;
    clearViewStack(): void;
    /** Opens the view of the list item with this value. */
    select(value: string): void;
}

interface SettingsContextValue extends SettingsActions {
    viewMode: SettingsViewMode;
    showListArea: boolean;
    activeValue: string | null;
    register(entry: SettingsItemEntry, defaultSelected: boolean): () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * The actions of the nearest `SettingsContainer` (Angular's `SettingsContainer` instance), e.g. to push the details
 * of a setting from its view, and its view mode.
 */
export function useSettings(): SettingsActions & { viewMode: SettingsViewMode } {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings() needs a <SettingsContainer> above it');
    return context;
}

/** lg from 1024px, md from 600px, sm below (window width). */
function viewModeOf(width: number): SettingsViewMode {
    return width < 600 ? 'sm' : width < 1024 ? 'md' : 'lg';
}

function useWindowViewMode(): SettingsViewMode {
    const [mode, setMode] = useState<SettingsViewMode>(() =>
        viewModeOf(typeof window === 'undefined' ? 1280 : window.innerWidth)
    );
    useEffect(() => {
        const resize = () => setMode(viewModeOf(window.innerWidth));
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);
    return mode;
}

/** Runs `fn` after the next commit (Angular's `afterNextRender`). */
function useAfterRender(): (fn: () => void) => void {
    const queue = useRef<(() => void)[]>([]);
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const pending = queue.current;
        queue.current = [];
        pending.forEach((fn) => fn());
    }, [tick]);
    return useCallback((fn: () => void) => {
        queue.current.push(fn);
        setTick((t) => t + 1);
    }, []);
}

export interface SettingsContainerProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
    /** Heading level of the detail area title (default 2). */
    detailsAreaTitleHeading?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Visual size of the detail area title (default 5). */
    detailsAreaTitleHeadingSize?: HeaderSize;
    /** Name and tooltip of the back button. */
    backBtnAriaLabel?: string;
    /** Value of the open list item (controlled). */
    value?: string | null;
    /** Value of the list item open at first (uncontrolled); else the item with `defaultSelected`. */
    defaultValue?: string | null;
    /** Called when a list item is opened. */
    onValueChange?: (value: string) => void;
    /** Imperative `pushView`, `popView`, `clearViewStack` and `select`. */
    actionsRef?: Ref<SettingsActions>;
}

/**
 * Settings: a list of settings next to the view of the selected one, side by side on large screens. On medium and
 * small screens (window below 1024px and 600px) the list and the view replace each other, with a back button.
 * Views can push further views (`useSettings().pushView`), e.g. the details of a notification setting.
 *
 * ```tsx
 * <SettingsContainer backBtnAriaLabel="Back">
 *     <SettingsListArea>
 *         <Bar barDesign="header">…</Bar>
 *         <SettingsListContainer>
 *             <SettingsList navigationIndicator noBorder aria-label="Settings">
 *                 <SettingsListItem view={<AccountView />} defaultSelected>
 *                     <ListLink navigationIndicator><ListTitle>User Account</ListTitle></ListLink>
 *                 </SettingsListItem>
 *             </SettingsList>
 *         </SettingsListContainer>
 *     </SettingsListArea>
 * </SettingsContainer>
 * ```
 */
export function SettingsContainer({
    detailsAreaTitleHeading = 2,
    detailsAreaTitleHeadingSize = 5,
    backBtnAriaLabel = 'Navigate Back',
    value: valueProp,
    defaultValue = null,
    onValueChange,
    actionsRef,
    className,
    children,
    ref,
    ...props
}: SettingsContainerProps) {
    const viewMode = useWindowViewMode();
    const afterRender = useAfterRender();
    const root = useRef<HTMLDivElement | null>(null);
    const [items, setItems] = useState<readonly SettingsItemEntry[]>([]);
    const [ownValue, setOwnValue] = useState<string | null>(defaultValue);
    const initial = useRef(defaultValue);
    const [stack, setStack] = useState<readonly SettingsStackedView[]>([]);
    /** On medium and small screens: whether the detail view replaces the list. */
    const [detailOpen, setDetailOpen] = useState(false);

    const activeValue = valueProp !== undefined ? valueProp : ownValue;
    const active = items.find((item) => item.value === activeValue) ?? null;
    const showListArea = viewMode === 'lg' || !detailOpen;
    const showDetailArea = viewMode === 'lg' || detailOpen;
    const current = stack.at(-1);

    /** The registered items in document order. */
    const ordered = useCallback(
        () =>
            [...items].sort((a, b) => {
                const ea = a.element();
                const eb = b.element();
                if (!ea || !eb) return 0;
                return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
            }),
        [items]
    );

    const register = useCallback((entry: SettingsItemEntry, defaultSelected: boolean) => {
        setItems((list) => [...list.filter((e) => e.value !== entry.value), entry]);
        if (defaultSelected && initial.current === null) {
            initial.current = entry.value;
            setOwnValue(entry.value);
        }
        return () => setItems((list) => list.filter((e) => e !== entry));
    }, []);

    const focusBackButton = useCallback(
        () =>
            afterRender(() => root.current?.querySelector<HTMLElement>('button[data-settings-header-button]')?.focus()),
        [afterRender]
    );

    const pushView = useCallback(
        (view: ReactNode, title: string) => {
            setStack((s) => [...s, { view, title }]);
            focusBackButton();
        },
        [focusBackButton]
    );
    const popView = useCallback(() => setStack((s) => s.slice(0, -1)), []);
    const clearViewStack = useCallback(() => setStack([]), []);

    const select = useCallback(
        (value: string) => {
            if (valueProp === undefined) setOwnValue(value);
            onValueChange?.(value);
            setStack([]);
            if (viewMode !== 'lg') {
                setDetailOpen(true);
                focusBackButton();
            }
        },
        [valueProp, onValueChange, viewMode, focusBackButton]
    );

    useImperativeHandle(actionsRef, () => ({ pushView, popView, clearViewStack, select }), [
        pushView,
        popView,
        clearViewStack,
        select
    ]);

    // in a dialog, the selected item (or the first) takes the focus once the dialog has placed it
    const focusedOnce = useRef(false);
    useEffect(() => {
        if (focusedOnce.current || !items.length) return;
        focusedOnce.current = true;
        if (!root.current?.closest('[role=dialog]') || !showListArea) return;
        const target = (active ?? ordered()[0])?.element();
        const timer = setTimeout(() => target?.focus());
        return () => clearTimeout(timer);
    }, [items.length, active, ordered, showListArea]);

    const onHeaderBackClick = () => {
        if (stack.length) {
            popView();
            return;
        }
        if (viewMode !== 'lg') {
            setDetailOpen(false);
            const target = active ?? ordered()[0];
            afterRender(() => target?.element()?.focus());
        }
    };

    const context = useMemo<SettingsContextValue>(
        () => ({
            viewMode,
            showListArea,
            activeValue,
            register,
            pushView,
            popView,
            clearViewStack,
            select
        }),
        [viewMode, showListArea, activeValue, register, pushView, popView, clearViewStack, select]
    );

    const title = current?.title ?? active?.title() ?? '';
    const view = current ? current.view : (active?.view ?? null);

    return (
        <SettingsContext.Provider value={context}>
            <div
                {...props}
                ref={(node) => {
                    root.current = node;
                    if (typeof ref === 'function') return ref(node);
                    if (ref) ref.current = node;
                }}
                data-settings-view={viewMode}
                className={cn('m-0 box-border flex h-full w-full p-0 font-sap-font-family', className)}
            >
                {children}
                {showDetailArea && (
                    <SettingsDetailArea>
                        <Bar barDesign="header" data-settings-header="" className="shrink-0">
                            <BarLeft>
                                {(viewMode !== 'lg' || stack.length > 0) && (
                                    <BarElement>
                                        <Button
                                            data-settings-header-button=""
                                            variant="transparent"
                                            glyph="navigation-left-arrow"
                                            aria-label={backBtnAriaLabel}
                                            title={backBtnAriaLabel}
                                            onClick={onHeaderBackClick}
                                        />
                                    </BarElement>
                                )}
                                <BarElement>
                                    <Title level={detailsAreaTitleHeading} headerSize={detailsAreaTitleHeadingSize}>
                                        {title}
                                    </Title>
                                </BarElement>
                            </BarLeft>
                        </Bar>
                        <div className="min-h-0 flex-1">{view}</div>
                    </SettingsDetailArea>
                )}
            </div>
        </SettingsContext.Provider>
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * List area
 * ---------------------------------------------------------------------------------------------------------------- */

/** Marks an element as the root of settings (Angular's `fd-settings`). */
export function Settings({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({ render, defaultTagName: 'div', props: { ...props, className: cn('block', className) } });
}

/**
 * The column of the list of settings, with a header bar: 20rem wide with an end border on large screens, the full
 * width (in place of the view) on medium and small ones.
 */
export function SettingsListArea({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    const container = useContext(SettingsContext);
    const mode = container?.viewMode ?? 'lg';
    const hidden = container ? !container.showListArea : false;
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            // kept mounted while the view replaces it, so its items stay registered
            hidden: hidden || undefined,
            'data-settings-list-area': '',
            className: cn(
                'm-0 box-border flex h-full shrink-0 flex-col p-0 font-sap-font-family',
                mode === 'lg'
                    ? 'w-80 min-w-80 max-w-80 border-0 border-e border-solid border-sap-list-border-color [&_[data-slot=list-link]]:after:hidden'
                    : 'w-full min-w-full max-w-full',
                hidden && 'hidden',
                className
            )
        }
    });
}

/** The lists of the list area: the main list and an optional footer list. */
export function SettingsListContainer({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'relative m-0 box-border flex h-full min-h-0 flex-col justify-between overflow-hidden p-0',
                className
            )
        }
    });
}

/** The main list of settings (a `List`); it scrolls. */
export function SettingsList({ className, ...props }: ListProps) {
    return <List {...props} className={cn('min-h-0 flex-1 overflow-y-auto scrollbar-sap', className)} />;
}

/** A list at the bottom of the list area, e.g. Reset Settings (a `List` with a top border). */
export function SettingsListFooter({ className, ...props }: ListProps) {
    return (
        <List
            {...props}
            className={cn('shrink-0 border-0 border-t border-solid border-sap-list-border-color', className)}
        />
    );
}

export interface SettingsListItemProps extends Omit<ListItemProps, 'selected' | 'onSelectedChange'> {
    /** Identifies the item for `SettingsContainer`'s `value`; generated by default. */
    value?: string;
    /** The view shown in the detail area while the item is open (Angular's `settingsListTpl`). */
    view?: ReactNode;
    /** Title of the detail area; the text of the item's `ListTitle` by default. */
    viewTitle?: string;
    /** Opens this item first (Angular's `selected` on the first item). */
    defaultSelected?: boolean;
}

/** A list item (`ListItem`) that opens a settings view: its `view` shows in the detail area when it is clicked. */
export function SettingsListItem({
    value: valueProp,
    view,
    viewTitle,
    defaultSelected = false,
    onClick,
    ref,
    ...props
}: SettingsListItemProps) {
    const container = useContext(SettingsContext);
    const autoId = useId();
    const value = valueProp ?? autoId;
    const element = useRef<HTMLLIElement | null>(null);
    const latest = useRef({ view, viewTitle });
    latest.current = { view, viewTitle };
    const register = container?.register;

    // registered once per value; the entry reads the latest view and title
    const entry = useMemo<SettingsItemEntry>(
        () => ({
            value,
            get view() {
                return latest.current.view;
            },
            title: () =>
                latest.current.viewTitle ??
                element.current?.querySelector('[data-slot=list-title]')?.textContent?.trim() ??
                '',
            element: () => element.current
        }),
        [value]
    );
    const defaultSelectedRef = useRef(defaultSelected);
    useLayoutEffect(() => register?.(entry, defaultSelectedRef.current), [register, entry]);

    return (
        <ListItem
            {...props}
            ref={(node: HTMLLIElement | null) => {
                element.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            selected={container ? container.activeValue === value : undefined}
            defaultSelected={container ? undefined : defaultSelected}
            onClick={(event: MouseEvent<HTMLLIElement>) => {
                onClick?.(event);
                if (!event.defaultPrevented) container?.select(value);
            }}
        />
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Detail area and content
 * ---------------------------------------------------------------------------------------------------------------- */

/** The column that shows the open setting (rendered by `SettingsContainer`). */
export function SettingsDetailArea({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-settings-detail-area': '',
            className: cn('m-0 box-border flex h-full w-full max-w-full flex-col overflow-hidden p-0', className)
        }
    });
}

export interface SettingsContentProps extends useRender.ComponentProps<'div'> {
    noPadding?: boolean;
    noBackground?: boolean;
}

/** Content of a settings view: scrolls, with 1rem paddings unless `noPadding`. */
export function SettingsContent({
    noPadding = false,
    noBackground = false,
    render,
    className,
    ...props
}: SettingsContentProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border block h-full w-full overflow-y-auto font-sap-font-family text-sap-font-size text-sap-text-color scrollbar-sap',
                noPadding ? 'p-0' : 'p-4',
                noBackground && 'bg-transparent',
                className
            )
        }
    });
}

/** The main part of a settings view, below a profile card. */
export function SettingsContentContainer({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, className: cn('m-0 box-border block flex-1 p-0', className) }
    });
}

export interface SettingsSpacingProps extends useRender.ComponentProps<'span'> {
    /** 0.5rem by default; small 1rem, medium 2rem, large 3rem, form 0.625rem (between form items). */
    size?: SettingsSpacingSize;
}

/** Vertical space between settings, hidden from assistive technology. */
export function SettingsSpacing({ size, render, className, ...props }: SettingsSpacingProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            role: 'presentation',
            'aria-hidden': true,
            ...props,
            className: cn(
                'm-0 box-border block w-full p-0',
                size === 'form'
                    ? 'h-2.5'
                    : size === 'small'
                      ? 'h-4'
                      : size === 'medium'
                        ? 'h-8'
                        : size === 'large'
                          ? 'h-12'
                          : 'h-2',
                className
            )
        }
    });
}

/** The user's avatar, name and details at the top of the user account view. */
export function SettingsProfileCard({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex w-full max-w-full flex-col items-center gap-1 overflow-hidden px-0 pt-10 pb-4 font-sap-font-family [&_button]:mt-1',
                className
            )
        }
    });
}

/** The user's name in a profile card. */
export function SettingsProfileCardName({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 mt-1 box-border p-0 font-sap-font-bold-family text-sap-font-large-size leading-[normal] break-all whitespace-normal text-sap-text-color',
                className
            )
        }
    });
}

/** A detail line of a profile card, e.g. the e-mail address. */
export function SettingsProfileCardSubline({ render, className, ...props }: useRender.ComponentProps<'div'>) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border p-0 font-sap-font-family text-sap-font-size break-all text-sap-content-label-color',
                className
            )
        }
    });
}
