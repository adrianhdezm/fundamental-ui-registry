/*
 * Port of @fundamental-ngx/core (dynamic-page) with the visual design of fundamental-styles,
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
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';
import { TabList, type TabListActions, type TabListProps } from '@/ui/tabs/tabs';
import { ToolbarForceOverflowContext } from '@/ui/toolbar/toolbar';

export type DynamicPageBackgroundType = 'solid' | 'list' | 'transparent';
export type DynamicPageResponsiveSize = 'small' | 'medium' | 'large' | 'extra-large';

/** Width below which the layout actions move up next to the breadcrumb. */
const ACTIONS_SQUASH_WIDTH = 1280;

/** The size of a page of the given width: small up to 599px, medium up to 1023px, large up to 1439px. */
export function dynamicPageWidthToSize(width: number): DynamicPageResponsiveSize {
    return width <= 599 ? 'small' : width <= 1023 ? 'medium' : width <= 1439 ? 'large' : 'extra-large';
}

/** Horizontal page padding per size. */
const PADDING: Record<DynamicPageResponsiveSize, string> = {
    small: '[--dp-px:1rem]',
    medium: '[--dp-px:2rem]',
    large: '[--dp-px:2rem]',
    'extra-large': '[--dp-px:3rem]'
};

/** Floating footer offsets per page size. */
const FOOTER_OFFSET: Record<DynamicPageResponsiveSize, string> = {
    small: '[&_[data-bar-design=floating-footer]]:inset-x-2',
    medium: '[&_[data-bar-design=floating-footer]]:inset-x-8',
    large: '[&_[data-bar-design=floating-footer]]:inset-x-8',
    'extra-large': '[&_[data-bar-design=floating-footer]]:inset-x-12'
};

const SHADOW = '[box-shadow:var(--sapContent_HeaderShadow)]';

/* ------------------------------------------------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------------------------------------------------- */

/** What the parts know about their page. */
interface DynamicPageContextValue {
    size: DynamicPageResponsiveSize;
    width: number | null;
    collapsed: boolean;
    collapsible: boolean;
    pinned: boolean;
    background: DynamicPageBackgroundType;
    hasTabs: boolean;
    hasFooter: boolean;
    titleId: string;
    toggleCollapse(): void;
    setPinned(pinned: boolean): void;
    registerContent(element: HTMLElement): () => void;
    lastContent: HTMLElement | null;
}

const DynamicPageContext = createContext<DynamicPageContextValue | null>(null);

/** Set around a `TabList` of the page: its contents do not scroll themselves. */
const DynamicPageTabListContext = createContext<{ stackContent: boolean } | null>(null);

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
    if (typeof ref === 'function') ref(value);
    else if (ref) ref.current = value;
}

/** Whether a click in the title area should leave the header as it is. */
const INTERACTIVE = 'a, button, input, select, textarea, [role=button], [data-dp-no-toggle]';

/* ------------------------------------------------------------------------------------------------------------------
 * Title area parts
 * ---------------------------------------------------------------------------------------------------------------- */

/** Breadcrumb above the title (Angular's `fd-dynamic-page-breadcrumb`). */
export function DynamicPageBreadcrumb({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('block', className)} />;
}

export interface DynamicPageGlobalActionsProps extends ComponentProps<'div'> {
    /** Accessible name of the toolbar. */
    'aria-label'?: string;
}

/**
 * Global (business) actions next to the title, a toolbar. A `Toolbar` inside moves all its items into its overflow
 * on small pages.
 */
export function DynamicPageGlobalActions({
    'aria-label': ariaLabel = 'Global actions',
    className,
    ...props
}: DynamicPageGlobalActionsProps) {
    const page = useContext(DynamicPageContext);
    return (
        <ToolbarForceOverflowContext.Provider value={page?.size === 'small'}>
            <div
                role="toolbar"
                aria-label={ariaLabel}
                {...props}
                className={cn(
                    'm-0 box-border flex items-center gap-2 py-0 ps-4 pe-1',
                    page?.size === 'medium' && 'p-0',
                    className
                )}
            />
        </ToolbarForceOverflowContext.Provider>
    );
}

export interface DynamicPageLayoutActionsProps extends ComponentProps<'div'> {
    /** Accessible name of the toolbar. */
    'aria-label'?: string;
}

/** Layout actions (e.g. full screen, close) at the end of the title row, a toolbar. */
export function DynamicPageLayoutActions({
    'aria-label': ariaLabel = 'Layout actions',
    className,
    ...props
}: DynamicPageLayoutActionsProps) {
    return (
        <div
            role="toolbar"
            aria-label={ariaLabel}
            {...props}
            className={cn('m-0 ms-auto box-border flex items-center gap-1 p-0', className)}
        />
    );
}

export interface DynamicPageTitleContentProps extends ComponentProps<'div'> {
    /** Wraps the key information instead of truncating it. */
    titleContentWrap?: boolean;
}

/** Key information next to the title. */
export function DynamicPageTitleContent({
    titleContentWrap = false,
    className,
    ...props
}: DynamicPageTitleContentProps) {
    return (
        <div
            {...props}
            className={cn(
                'm-0 box-border block min-w-0 py-0 ps-4 align-baseline',
                titleContentWrap ? 'whitespace-normal' : 'truncate',
                className
            )}
        />
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Header (title area)
 * ---------------------------------------------------------------------------------------------------------------- */

export interface DynamicPageHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
    /** Title of the page. */
    title?: ReactNode;
    /** Wraps the title instead of truncating it. */
    titleWrap?: boolean;
    /** Subtitle: below the title area, or next to the title while the header is collapsed. */
    subtitle?: ReactNode;
    /** Wraps the subtitle instead of truncating it. */
    subtitleWrap?: boolean;
    /** `aria-level` of the title, a number or e.g. `'h3'` (default 2). */
    headingLevel?: number | string;
    /** Makes the subtitle a heading of this level. */
    subtitleHeadingLevel?: number | null;
    /** Id of the title; the header toggle is described by it. */
    titleId?: string;
    /** Name of the navigation around a breadcrumb that is not a `Breadcrumb` itself. */
    breadcrumbsLabel?: string;
    /** Custom title, given whether the header is collapsed (Angular's `fdDynamicPageHeaderTitle`). */
    renderTitle?: (collapsed: boolean) => ReactNode;
    /** Custom subtitle, given whether the header is collapsed (Angular's `fdDynamicPageHeaderSubtitle`). */
    renderSubtitle?: (collapsed: boolean) => ReactNode;
    /** Shown before the title while the header is collapsed, e.g. a small avatar (Angular's projected `fd-facet`). */
    facet?: ReactNode;
}

const levelOf = (value: number | string | undefined) => {
    const level = Number(String(value ?? '').replace(/\D/g, ''));
    return Number.isFinite(level) && level > 0 ? level : 2;
};

/**
 * Title area of a dynamic page: breadcrumb, title, key information, global and layout actions, subtitle and other
 * children below (e.g. a message strip). Clicking it collapses or expands the header, except on its controls.
 */
export function DynamicPageHeader({
    title,
    titleWrap = false,
    subtitle,
    subtitleWrap = false,
    headingLevel = 2,
    subtitleHeadingLevel,
    titleId: titleIdProp,
    breadcrumbsLabel = 'Breadcrumbs',
    renderTitle,
    renderSubtitle,
    facet,
    className,
    onClick,
    children,
    ...props
}: DynamicPageHeaderProps) {
    const page = useContext(DynamicPageContext);
    const ownId = `fd-dynamic-page-title-${useId()}`;
    const titleId = titleIdProp ?? page?.titleId ?? ownId;
    const collapsed = !!page?.collapsed;
    const collapsible = !!page?.collapsible;
    const small = page?.size === 'small';
    const squashed = (page?.width ?? Number.POSITIVE_INFINITY) < ACTIONS_SQUASH_WIDTH;

    const slots = {
        breadcrumb: [] as ReactNode[],
        titleContent: [] as ReactNode[],
        globalActions: [] as ReactNode[],
        layoutActions: [] as ReactNode[],
        rest: [] as ReactNode[]
    };
    Children.toArray(children).forEach((node) => {
        const type = isValidElement(node) ? node.type : null;
        if (type === DynamicPageBreadcrumb) slots.breadcrumb.push(node);
        else if (type === DynamicPageTitleContent) slots.titleContent.push(node);
        else if (type === DynamicPageGlobalActions) slots.globalActions.push(node);
        else if (type === DynamicPageLayoutActions) slots.layoutActions.push(node);
        else slots.rest.push(node);
    });
    const hasBreadcrumb = slots.breadcrumb.length > 0;

    // a `Breadcrumb` is a navigation landmark of its own: no navigation around it
    const breadcrumbRef = useRef<HTMLDivElement | null>(null);
    const [nestedNav, setNestedNav] = useState(false);
    useLayoutEffect(() => {
        const nested = !!breadcrumbRef.current?.querySelector('nav, [role=navigation]');
        if (nested !== nestedNav) setNestedNav(nested);
    });

    const hasSubtitle = (subtitle != null && subtitle !== '' && subtitle !== false) || !!renderSubtitle;
    const subtitleNode = hasSubtitle && (
        <span
            role={subtitleHeadingLevel ? 'heading' : undefined}
            aria-level={subtitleHeadingLevel || undefined}
            className={cn(
                'm-0 mt-1 p-0 text-sap-font-size text-sap-object-header-subtitle-text-color',
                subtitleWrap ? 'whitespace-normal' : 'truncate'
            )}
        >
            {renderSubtitle ? renderSubtitle(collapsed) : subtitle}
        </span>
    );

    return (
        <div
            {...props}
            className={cn(
                'relative z-1 m-0 box-border flex min-h-12 flex-col justify-between bg-sap-object-header-background px-(--dp-px) py-2 [overflow-wrap:break-word]',
                'peer-focus-visible:outline-sap peer-focus-visible:-outline-offset-4',
                collapsible &&
                    'hover:cursor-pointer hover:bg-sap-object-header-hover-background hc:hover:border-b hc:hover:border-solid hc:hover:border-sap-object-header-border-color',
                collapsed && 'pb-4',
                page?.background === 'transparent' && 'bg-transparent hc:bg-sap-object-header-background',
                className
            )}
            onClick={(event: MouseEvent<HTMLDivElement>) => {
                onClick?.(event);
                const target = event.target as Element;
                // clicks in portals (e.g. a toolbar overflow) bubble through React, not through the header
                if (!event.currentTarget.contains(target)) return;
                // keep text selections
                if (window.getSelection()?.toString()) return;
                const control = target.closest(INTERACTIVE);
                if (control && event.currentTarget.contains(control)) return;
                page?.toggleCollapse();
            }}
        >
            <div className="m-0 flex justify-between p-0">
                <div className="m-0 min-w-0 flex-1 p-0">
                    {(hasBreadcrumb || squashed) && (
                        <div className="m-0 flex items-center justify-between p-0">
                            {hasBreadcrumb && (
                                <div
                                    ref={breadcrumbRef}
                                    data-dp-no-toggle=""
                                    role={nestedNav ? undefined : 'navigation'}
                                    aria-label={nestedNav ? undefined : breadcrumbsLabel}
                                    className={small ? 'w-full max-w-[60%]' : 'w-full max-w-[60%] pt-2 pb-1'}
                                >
                                    {slots.breadcrumb}
                                </div>
                            )}
                            {squashed && slots.layoutActions}
                        </div>
                    )}
                    <div className="m-0 flex items-center p-0 pt-[0.3125rem]">
                        {collapsed && facet}
                        <div className="m-0 flex min-w-0 flex-1 flex-col p-0">
                            <div className="m-0 flex items-center p-0 pt-[0.3125rem]">
                                <span
                                    role="heading"
                                    aria-level={levelOf(headingLevel)}
                                    id={titleId}
                                    className={cn(
                                        'm-0 min-w-0 p-0 font-sap-object-header-title-font-family text-sap-object-header-title-text-color',
                                        collapsed
                                            ? 'text-sap-object-header-title-snapped-font-size'
                                            : 'text-sap-object-header-title-font-size',
                                        titleWrap ? 'whitespace-normal' : 'truncate'
                                    )}
                                >
                                    {renderTitle ? renderTitle(collapsed) : title}
                                </span>
                                {slots.titleContent}
                                <div data-dp-no-toggle="" className="m-0 ms-auto flex items-center p-0">
                                    {slots.globalActions}
                                    {!squashed && slots.layoutActions}
                                </div>
                            </div>
                            {collapsed && subtitleNode}
                        </div>
                    </div>
                </div>
            </div>
            {!collapsed && subtitleNode}
            <div data-dp-no-toggle="" className="mt-4 mb-2 empty:hidden">
                {slots.rest}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Subheader (collapsible header content)
 * ---------------------------------------------------------------------------------------------------------------- */

export interface DynamicPageSubheaderProps extends ComponentProps<'div'> {
    /** Shows the collapse (and pin) buttons and lets the header collapse (default true). */
    collapsible?: boolean;
    /** Shows a pin button: a pinned header stays expanded while the content scrolls. */
    pinnable?: boolean;
    /** Whether the header is collapsed (controlled). */
    collapsed?: boolean;
    /** Whether the header is collapsed at first (uncontrolled). */
    defaultCollapsed?: boolean;
    /** Called when the header collapses (`true`) or expands. */
    onCollapsedChange?: (collapsed: boolean) => void;
    expandLabel?: string;
    collapseLabel?: string;
    pinAriaLabel?: string;
    unpinAriaLabel?: string;
    /** Accessible name of the header content region. */
    headerAriaLabel?: string | null;
    /** Accessible name of the toolbar with the collapse and pin buttons. */
    toolbarAriaLabel?: string;
}

/** The collapse and pin buttons: 1.5rem in both densities, on the header background. */
const HEADER_BUTTON = cn(
    "relative mx-1 my-0 h-6 w-6 min-w-6 bg-sap-object-header-background p-0 before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']",
    'compact:h-6 compact:max-h-6 compact:w-6 compact:min-w-6 compact:px-0'
);

/** The lines on both sides of the buttons, fading out (sRGB, as fundamental-styles; Tailwind's gradients use oklab). */
const GRADIENT_START =
    'h-px w-16 [background-image:linear-gradient(to_left,var(--sapObjectHeader_BorderColor),transparent)] rtl:[background-image:linear-gradient(to_right,var(--sapObjectHeader_BorderColor),transparent)]';
const GRADIENT_END =
    'h-px w-16 [background-image:linear-gradient(to_right,var(--sapObjectHeader_BorderColor),transparent)] rtl:[background-image:linear-gradient(to_left,var(--sapObjectHeader_BorderColor),transparent)]';

/**
 * Collapsible header content (e.g. facets) below the title area, with the collapse and pin buttons. Its
 * `collapsed`, `defaultCollapsed` and `onCollapsedChange` are the state of the page's header.
 */
export function DynamicPageSubheader({
    collapsible = true,
    pinnable = false,
    collapsed: _collapsed,
    defaultCollapsed: _defaultCollapsed,
    onCollapsedChange: _onCollapsedChange,
    expandLabel = 'Expand Header',
    collapseLabel = 'Collapse Header',
    pinAriaLabel = 'Pin Header',
    unpinAriaLabel = 'Unpin Header',
    headerAriaLabel = 'Expanded Header',
    toolbarAriaLabel = 'Header actions',
    id: idProp,
    className,
    children,
    ...props
}: DynamicPageSubheaderProps) {
    const page = useContext(DynamicPageContext);
    const autoId = useId();
    const id = idProp ?? `fd-dynamic-page-header-${autoId}`;
    const collapsed = !!page?.collapsed;
    const pinned = !!page?.pinned;
    const transparent = page?.background === 'transparent';
    return (
        <div {...props} id={id} className={cn('block', className)}>
            <section
                id={`${id}-content`}
                aria-label={headerAriaLabel ?? undefined}
                hidden={collapsed}
                className={cn(
                    'm-0 box-border block bg-sap-object-header-background px-(--dp-px) py-4 empty:p-0',
                    transparent && 'bg-transparent hc:bg-sap-object-header-background'
                )}
            >
                {children}
            </section>
            {collapsible && (
                <div
                    className={cn(
                        'relative z-2 m-0 flex min-h-px items-center justify-center bg-sap-object-header-background p-0',
                        !page?.hasTabs && SHADOW
                    )}
                >
                    <div className={GRADIENT_START} />
                    <div
                        role="toolbar"
                        aria-label={toolbarAriaLabel}
                        className="relative z-1 m-0 flex h-px w-[4.25rem] items-center justify-center bg-sap-object-header-border-color p-0"
                    >
                        <Button
                            glyph={collapsed ? 'slim-arrow-down' : 'slim-arrow-up'}
                            aria-label={collapsed ? expandLabel : collapseLabel}
                            title={collapsed ? expandLabel : collapseLabel}
                            aria-expanded={!collapsed}
                            aria-controls={`${id}-content`}
                            className={HEADER_BUTTON}
                            onClick={() => page?.toggleCollapse()}
                        />
                        {pinnable && !collapsed && (
                            <Button
                                glyph="pushpin-off"
                                toggled={pinned}
                                aria-label={pinned ? unpinAriaLabel : pinAriaLabel}
                                title={pinned ? unpinAriaLabel : pinAriaLabel}
                                className={HEADER_BUTTON}
                                onClick={() => page?.setPinned(!pinned)}
                            />
                        )}
                    </div>
                    <div className={GRADIENT_END} />
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Content, footer, tabs
 * ---------------------------------------------------------------------------------------------------------------- */

/**
 * Content of a dynamic page. It scrolls (and is focusable for keyboard scrolling), and scrolling collapses the
 * header unless it is pinned or the page has `disableSnapOnScroll`. Inside a `TabList` of the page the tab list
 * scrolls instead.
 */
export function DynamicPageContent({ className, children, ref, ...props }: ComponentProps<'div'>) {
    const page = useContext(DynamicPageContext);
    const tabs = useContext(DynamicPageTabListContext);
    const [element, setElement] = useState<HTMLDivElement | null>(null);
    const register = page?.registerContent;
    useLayoutEffect(() => (element && register ? register(element) : undefined), [element, register]);

    // room for a floating footer; with stacked tabs only below the last content
    const spacer = !!page?.hasFooter && (!tabs?.stackContent || page.lastContent === element);
    const background = page?.background;
    return (
        <div
            tabIndex={tabs ? undefined : 0}
            {...props}
            ref={(node: HTMLDivElement | null) => {
                setElement(node);
                assignRef(ref, node);
            }}
            className={cn(
                'm-0 box-border block h-full flex-1 overflow-y-auto bg-sap-background-color px-(--dp-px) py-4 scrollbar-sap',
                'outline-none focus-visible:outline-sap focus-visible:-outline-offset-2',
                tabs && 'h-auto overflow-visible',
                background === 'list' && 'bg-sap-group-content-background hc:bg-sap-background-color',
                background === 'transparent' && 'bg-transparent hc:bg-sap-background-color',
                className
            )}
        >
            {children}
            {spacer && <div className="h-12" aria-hidden="true" />}
        </div>
    );
}

/** Footer of a dynamic page, e.g. a floating footer `Bar` (its offsets follow the page size). */
export function DynamicPageFooter({ className, ...props }: ComponentProps<'div'>) {
    const page = useContext(DynamicPageContext);
    return (
        <div
            {...props}
            className={cn(
                'block [&_[data-bar-design=floating-footer]]:bottom-4',
                FOOTER_OFFSET[page?.size ?? 'extra-large'],
                className
            )}
        />
    );
}

/** Tabs (or another navigation) between the header and the content, other than a `TabList`. */
export function DynamicPageTabs({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            {...props}
            className={cn('relative z-1 block bg-sap-object-header-background px-(--dp-px)', SHADOW, className)}
        />
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------------------------------------------------------- */

/** Imperative actions of a dynamic page, through `actionsRef`. */
export interface DynamicPageActions {
    /** Measures the page again (size and height), e.g. after it moved. */
    refreshSize(): void;
    /** The element that scrolls: the content of a `TabList`, or the first content. */
    scrollElement(): HTMLElement | null;
    /** Collapses or expands the header, as a click on the title area. */
    toggleCollapse(): void;
}

export interface DynamicPageProps extends ComponentProps<'article'> {
    /** Keeps the header expanded while the content scrolls. */
    disableSnapOnScroll?: boolean;
    /** Background of the header and content: `solid` (default), `list` or `transparent`. */
    background?: DynamicPageBackgroundType;
    /** Takes the size from the width of the page (default); when false, `size` applies. */
    autoResponsive?: boolean;
    /** Size (paddings, footer offsets) when not `autoResponsive`, and before the first measure. */
    size?: DynamicPageResponsiveSize;
    /** Pixels subtracted from the height with `expandContent`. */
    offset?: number;
    /** Fills the viewport below the top of the page (default true). */
    expandContent?: boolean;
    /** Positions the page relative to itself (e.g. for a floating footer). */
    positionRelative?: boolean;
    /** Accessible name of the header toggle. */
    toggleHeaderLabel?: string;
    /** Called with the size when it changes (and with the first one). */
    onSizeChange?: (size: DynamicPageResponsiveSize) => void;
    /** Imperative actions: `refreshSize()`, `scrollElement()` and `toggleCollapse()`. */
    actionsRef?: Ref<DynamicPageActions>;
}

const byDocumentOrder = (a: HTMLElement, b: HTMLElement) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

/**
 * Dynamic page: a title area (`DynamicPageHeader`), a collapsible header (`DynamicPageSubheader`), optional tabs
 * (a `TabList` or `DynamicPageTabs`), the content (`DynamicPageContent`) and an optional footer
 * (`DynamicPageFooter`), placed in that order. The header collapses on a click of the title area, with the
 * collapse button, Enter or Space on the header toggle, or when the content scrolls; paddings adapt to the width.
 *
 * ```tsx
 * <DynamicPage aria-label="Product">
 *     <DynamicPageHeader title="Product" subtitle="Details" />
 *     <DynamicPageSubheader pinnable>Header content</DynamicPageSubheader>
 *     <DynamicPageContent>Content</DynamicPageContent>
 * </DynamicPage>
 * ```
 */
export function DynamicPage({
    disableSnapOnScroll = false,
    background = 'solid',
    autoResponsive = true,
    size: sizeProp = 'extra-large',
    offset = 0,
    expandContent = true,
    positionRelative = false,
    toggleHeaderLabel = 'Toggle Header',
    onSizeChange,
    actionsRef,
    'aria-roledescription': ariaRoledescription = 'Dynamic Page',
    className,
    style,
    children,
    ref,
    ...props
}: DynamicPageProps) {
    // the parts go to their places, as Angular's slots
    const headers: ReactElement<DynamicPageHeaderProps>[] = [];
    const subheaders: ReactElement<DynamicPageSubheaderProps>[] = [];
    const tabs: ReactNode[] = [];
    const footers: ReactNode[] = [];
    const rest: ReactNode[] = [];
    let tabList: ReactElement<TabListProps> | null = null;
    for (const node of Children.toArray(children)) {
        if (!isValidElement(node)) rest.push(node);
        else if (node.type === DynamicPageHeader) headers.push(node as ReactElement<DynamicPageHeaderProps>);
        else if (node.type === DynamicPageSubheader) subheaders.push(node as ReactElement<DynamicPageSubheaderProps>);
        else if (node.type === DynamicPageFooter) footers.push(node);
        else if (node.type === DynamicPageTabs) tabs.push(node);
        else if (node.type === TabList) {
            tabList ??= node as ReactElement<TabListProps>;
            tabs.push(node);
        } else rest.push(node);
    }
    const subheader = subheaders[0]?.props;
    const collapsible = subheader ? (subheader.collapsible ?? true) : false;
    const hasTabs = tabs.length > 0;
    const hasFooter = footers.length > 0;
    const autoTitleId = `fd-dynamic-page-title-${useId()}`;
    const titleId = headers[0]?.props.titleId ?? autoTitleId;

    // collapsed: the state of the subheader (Angular's two-way `collapsed` on fd-dynamic-page-subheader)
    const [ownCollapsed, setOwnCollapsed] = useState(!!subheader?.defaultCollapsed);
    const controlled = subheader?.collapsed !== undefined;
    const collapsed = controlled ? !!subheader.collapsed : ownCollapsed;
    const [pinned, setPinned] = useState(false);

    const articleRef = useRef<HTMLElement | null>(null);
    const tabActions = useRef<TabListActions | null>(null);
    const [contents, setContents] = useState<HTMLElement[]>([]);
    const [width, setWidth] = useState<number | null>(null);
    const [height, setHeight] = useState<string | null>(null);
    const size: DynamicPageResponsiveSize =
        !autoResponsive || width === null ? sizeProp : dynamicPageWidthToSize(width);

    const latest = useRef({
        collapsed,
        collapsible,
        pinned,
        controlled,
        disableSnapOnScroll,
        expandContent,
        offset,
        contents,
        onCollapsedChange: subheader?.onCollapsedChange
    });
    latest.current = {
        collapsed,
        collapsible,
        pinned,
        controlled,
        disableSnapOnScroll,
        expandContent,
        offset,
        contents,
        onCollapsedChange: subheader?.onCollapsedChange
    };

    const setCollapsed = useCallback((next: boolean) => {
        if (next === latest.current.collapsed) return;
        latest.current.collapsed = next;
        if (!latest.current.controlled) setOwnCollapsed(next);
        latest.current.onCollapsedChange?.(next);
    }, []);

    const toggleCollapse = useCallback(() => {
        if (!latest.current.collapsible) return;
        setPinned(false);
        setCollapsed(!latest.current.collapsed);
    }, [setCollapsed]);

    const scrollElement = useCallback(
        () => tabActions.current?.scrollElement() ?? latest.current.contents[0] ?? null,
        []
    );

    const measure = useCallback(() => {
        const article = articleRef.current;
        if (!article) return;
        const rect = article.getBoundingClientRect();
        setWidth(rect.width);
        setHeight(latest.current.expandContent ? `calc(100svh - ${rect.top + latest.current.offset}px)` : null);
    }, []);

    useLayoutEffect(() => {
        const article = articleRef.current;
        if (!article) return;
        const observer = new ResizeObserver(() => measure());
        observer.observe(article);
        window.addEventListener('resize', measure);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [measure]);
    useLayoutEffect(measure, [measure, expandContent, offset]);

    // scrolling the content (or the content of the tab list) collapses the header
    useEffect(() => {
        const article = articleRef.current;
        if (!article) return;
        const onScroll = (event: Event) => {
            const target = event.target as HTMLElement;
            const { contents, disableSnapOnScroll, collapsible, pinned } = latest.current;
            if (target !== tabActions.current?.scrollElement() && !contents.includes(target)) return;
            if (disableSnapOnScroll || !collapsible) return;
            setCollapsed(pinned ? false : target.scrollTop > 0);
        };
        article.addEventListener('scroll', onScroll, { capture: true, passive: true });
        return () => article.removeEventListener('scroll', onScroll, { capture: true });
    }, [setCollapsed]);

    const reported = useRef<DynamicPageResponsiveSize | null>(null);
    const sizeChanged = useRef(onSizeChange);
    sizeChanged.current = onSizeChange;
    useEffect(() => {
        // the first size is the measured one
        if (reported.current === size || (autoResponsive && width === null)) return;
        reported.current = size;
        sizeChanged.current?.(size);
    }, [size, autoResponsive, width]);

    useImperativeHandle(actionsRef, () => ({ refreshSize: measure, scrollElement, toggleCollapse }), [
        measure,
        scrollElement,
        toggleCollapse
    ]);

    const registerContent = useCallback((element: HTMLElement) => {
        setContents((list) => [...list.filter((e) => e !== element), element].sort(byDocumentOrder));
        return () => setContents((list) => list.filter((e) => e !== element));
    }, []);

    const userTabActions = tabList?.props.actionsRef;
    const tabListRef = useCallback(
        (actions: TabListActions | null) => {
            tabActions.current = actions;
            assignRef(userTabActions, actions);
        },
        [userTabActions]
    );

    const context = useMemo<DynamicPageContextValue>(
        () => ({
            size,
            width,
            collapsed,
            collapsible,
            pinned,
            background,
            hasTabs,
            hasFooter,
            titleId,
            toggleCollapse,
            setPinned,
            registerContent,
            lastContent: contents.at(-1) ?? null
        }),
        [
            size,
            width,
            collapsed,
            collapsible,
            pinned,
            background,
            hasTabs,
            hasFooter,
            titleId,
            toggleCollapse,
            registerContent,
            contents
        ]
    );

    return (
        <DynamicPageContext.Provider value={context}>
            <article
                aria-roledescription={ariaRoledescription}
                {...props}
                ref={(node: HTMLElement | null) => {
                    articleRef.current = node;
                    assignRef(ref, node);
                }}
                style={{ ...(height ? { height } : null), ...style }}
                className={cn(
                    'm-0 box-border flex h-full flex-col p-0 font-sap-font-family text-sap-font-size text-sap-text-color',
                    PADDING[size],
                    positionRelative && 'relative',
                    className
                )}
            >
                <header
                    className={cn(
                        'relative z-15 m-0 flex flex-col justify-between p-0',
                        !collapsible && !hasTabs && SHADOW
                    )}
                >
                    <div className="relative">
                        {collapsible && (
                            <span
                                role="button"
                                tabIndex={0}
                                className="peer sr-only-sap"
                                aria-expanded={!collapsed}
                                aria-label={toggleHeaderLabel}
                                aria-describedby={headers.length ? titleId : undefined}
                                onClick={toggleCollapse}
                                onKeyDown={(event: KeyboardEvent<HTMLSpanElement>) => {
                                    if (event.key === 'Enter') toggleCollapse();
                                    else if (event.key === ' ') {
                                        event.preventDefault();
                                        toggleCollapse();
                                    }
                                }}
                            />
                        )}
                        {headers}
                    </div>
                    {subheaders}
                </header>
                {tabs.map((node) =>
                    tabList && node === tabList ? (
                        <DynamicPageTabListContext.Provider
                            key="tab-list"
                            value={{ stackContent: !!tabList.props.stackContent }}
                        >
                            {cloneElement(tabList, {
                                actionsRef: tabListRef,
                                className: cn(
                                    // the bar follows the page paddings and casts its shadow on the content
                                    'min-h-0 flex-1 [&>div:first-child]:relative [&>div:first-child]:z-1 [&>div:first-child]:px-(--dp-px)',
                                    '[&>div:last-child]:bg-sap-background-color',
                                    background === 'list' &&
                                        '[&>div:last-child]:bg-sap-group-content-background hc:[&>div:last-child]:bg-sap-background-color',
                                    background === 'transparent' &&
                                        '[&>div:last-child]:bg-transparent hc:[&>div:last-child]:bg-sap-background-color',
                                    tabList.props.className
                                )
                            })}
                        </DynamicPageTabListContext.Provider>
                    ) : (
                        node
                    )
                )}
                {rest}
                <footer>{footers}</footer>
            </article>
        </DynamicPageContext.Provider>
    );
}
