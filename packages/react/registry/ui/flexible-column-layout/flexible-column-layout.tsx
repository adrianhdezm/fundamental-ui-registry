/*
 * Port of @fundamental-ngx/core (flexible-column-layout) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    createContext,
    useContext,
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';

export type FlexibleColumnLayout =
    | 'OneColumnStartFullScreen'
    | 'OneColumnMidFullScreen'
    | 'OneColumnEndFullScreen'
    | 'TwoColumnsStartExpanded'
    | 'TwoColumnsMidExpanded'
    | 'TwoColumnsEndExpanded'
    | 'ThreeColumnsMidExpanded'
    | 'ThreeColumnsEndExpanded'
    | 'ThreeColumnsStartMinimized'
    | 'ThreeColumnsEndMinimized';

/** Widths of the start, mid and end columns in percent. */
export interface FlexibleColumnSettings {
    start: number;
    mid: number;
    end: number;
}

export type FlexibleColumnLayoutDefinition = Record<FlexibleColumnLayout, FlexibleColumnSettings>;

export interface FlexibleLayoutConfig {
    layouts: FlexibleColumnLayoutDefinition;
}

export type FlexibleColumnLayoutBackgroundDesign = 'solid' | 'translucent' | 'transparent';

export const DEFAULT_FLEXIBLE_LAYOUT_CONFIG: FlexibleLayoutConfig = {
    layouts: {
        OneColumnStartFullScreen: { start: 100, mid: 0, end: 0 },
        OneColumnMidFullScreen: { start: 0, mid: 100, end: 0 },
        OneColumnEndFullScreen: { start: 0, mid: 0, end: 100 },
        TwoColumnsStartExpanded: { start: 67, mid: 33, end: 0 },
        TwoColumnsMidExpanded: { start: 33, mid: 67, end: 0 },
        TwoColumnsEndExpanded: { start: 0, mid: 33, end: 67 },
        ThreeColumnsMidExpanded: { start: 25, mid: 50, end: 25 },
        ThreeColumnsEndExpanded: { start: 25, mid: 25, end: 50 },
        ThreeColumnsStartMinimized: { start: 0, mid: 67, end: 33 },
        ThreeColumnsEndMinimized: { start: 33, mid: 67, end: 0 }
    }
};

const FlexibleLayoutConfigContext = createContext<FlexibleLayoutConfig>(DEFAULT_FLEXIBLE_LAYOUT_CONFIG);

export interface FlexibleColumnLayoutConfigProviderProps {
    /** Column widths of some layouts; the others keep their defaults. */
    layouts?: Partial<FlexibleColumnLayoutDefinition>;
    children?: ReactNode;
}

/**
 * Overrides some of the column widths of the layouts for every flexible column layout inside, as Angular's
 * `provideFlexibleColumnLayoutConfig()`.
 *
 * ```tsx
 * <FlexibleColumnLayoutConfigProvider layouts={{ TwoColumnsMidExpanded: { start: 50, mid: 50, end: 0 } }}>
 *     <FlexibleColumnLayout … />
 * </FlexibleColumnLayoutConfigProvider>
 * ```
 */
export function FlexibleColumnLayoutConfigProvider({ layouts, children }: FlexibleColumnLayoutConfigProviderProps) {
    const value = { layouts: { ...DEFAULT_FLEXIBLE_LAYOUT_CONFIG.layouts, ...layouts } };
    return <FlexibleLayoutConfigContext.Provider value={value}>{children}</FlexibleLayoutConfigContext.Provider>;
}

/** The layout configuration of the nearest `FlexibleColumnLayoutConfigProvider`, or the default one. */
export function useFlexibleColumnLayoutConfig(): FlexibleLayoutConfig {
    return useContext(FlexibleLayoutConfigContext);
}

type ScreenSize = 'sm' | 'md' | 'lg';
/** Direction the arrow of a separator points to. */
type Separator = 'left' | 'right' | null;

/** Next layout when the start (left) separator is clicked. */
const START_SEPARATOR_NEXT: Partial<Record<FlexibleColumnLayout, FlexibleColumnLayout>> = {
    TwoColumnsStartExpanded: 'TwoColumnsMidExpanded',
    TwoColumnsMidExpanded: 'TwoColumnsStartExpanded',
    ThreeColumnsMidExpanded: 'ThreeColumnsEndMinimized',
    ThreeColumnsEndMinimized: 'TwoColumnsStartExpanded',
    ThreeColumnsStartMinimized: 'ThreeColumnsEndMinimized'
};

/** Next layout when the end (right) separator is clicked. */
const END_SEPARATOR_NEXT: Partial<Record<FlexibleColumnLayout, FlexibleColumnLayout>> = {
    TwoColumnsEndExpanded: 'ThreeColumnsStartMinimized',
    ThreeColumnsMidExpanded: 'ThreeColumnsEndExpanded',
    ThreeColumnsEndExpanded: 'ThreeColumnsMidExpanded',
    ThreeColumnsEndMinimized: 'ThreeColumnsMidExpanded',
    ThreeColumnsStartMinimized: 'TwoColumnsEndExpanded'
};

function startSeparator(layout: FlexibleColumnLayout): Separator {
    switch (layout) {
        case 'TwoColumnsStartExpanded':
            return 'left';
        case 'TwoColumnsMidExpanded':
        case 'ThreeColumnsMidExpanded':
        case 'ThreeColumnsEndMinimized':
        case 'ThreeColumnsStartMinimized':
            return 'right';
        default:
            return null;
    }
}

function endSeparator(layout: FlexibleColumnLayout): Separator {
    switch (layout) {
        case 'TwoColumnsEndExpanded':
        case 'ThreeColumnsEndExpanded':
            return 'right';
        case 'ThreeColumnsMidExpanded':
        case 'ThreeColumnsEndMinimized':
        case 'ThreeColumnsStartMinimized':
            return 'left';
        default:
            return null;
    }
}

/**
 * Shows fewer columns on smaller widths and restores the layout when there is room again. Returns the next layout
 * and the layout to restore later.
 */
function adapt(
    layout: FlexibleColumnLayout,
    size: ScreenSize,
    restore: FlexibleColumnLayout | null
): { layout: FlexibleColumnLayout; restore: FlexibleColumnLayout | null } {
    const fullScreen = (target: FlexibleColumnLayout) => ({ layout: target, restore: layout });
    let next = layout;
    switch (layout) {
        case 'OneColumnMidFullScreen':
        case 'OneColumnEndFullScreen':
            if (size !== 'sm' && restore) return { layout: restore, restore: null };
            return { layout, restore };
        case 'TwoColumnsStartExpanded':
        case 'TwoColumnsMidExpanded':
            if (size === 'sm') return fullScreen('OneColumnMidFullScreen');
            break;
        case 'TwoColumnsEndExpanded':
            if (size === 'sm') return fullScreen('OneColumnEndFullScreen');
            if (size === 'lg') next = 'ThreeColumnsEndExpanded';
            break;
        case 'ThreeColumnsStartMinimized':
            if (size === 'sm') return fullScreen('OneColumnEndFullScreen');
            if (size === 'lg') next = 'ThreeColumnsMidExpanded';
            break;
        case 'ThreeColumnsEndMinimized':
            if (size === 'sm') return fullScreen('OneColumnEndFullScreen');
            break;
        case 'ThreeColumnsMidExpanded':
            if (size === 'sm') return fullScreen('OneColumnEndFullScreen');
            if (size === 'md') next = 'ThreeColumnsStartMinimized';
            break;
        case 'ThreeColumnsEndExpanded':
            if (size === 'sm') return fullScreen('OneColumnEndFullScreen');
            if (size === 'md') next = 'TwoColumnsEndExpanded';
            break;
    }
    // a layout chosen on a small width replaces the one to restore
    return { layout: next, restore: next === layout && size === 'sm' ? null : restore };
}

const COLUMN = [
    'm-0 box-border min-w-0 overflow-hidden p-0 [container-type:inline-size]',
    'transition-[width,visibility] duration-[560ms] ease-[cubic-bezier(0.1,0,0.05,1)] motion-reduce:transition-none',
    'border-x border-solid border-sap-group-content-border-color first:border-s-0 last:border-e-0 hc:border-x-0'
];
const HIDDEN_COLUMN = 'invisible h-0 border-0';

const SEPARATOR = [
    'group/sep relative m-0 box-border flex w-4 min-w-4 shrink-0 cursor-pointer items-center justify-center p-0',
    // gradient lines above and below the button, in sRGB as fundamental-styles' linear-gradient
    "before:absolute before:start-1/2 before:bottom-[calc(50%_+_1rem)] before:block before:h-16 before:w-px before:-translate-x-1/2 before:[background-image:linear-gradient(to_top,var(--sapHighlightColor),transparent)] before:transition-all before:duration-100 before:ease-in before:content-[''] rtl:before:translate-x-1/2",
    "after:absolute after:start-1/2 after:top-[calc(50%_+_1rem)] after:block after:h-16 after:w-px after:-translate-x-1/2 after:[background-image:linear-gradient(to_bottom,var(--sapHighlightColor),transparent)] after:transition-all after:duration-100 after:ease-in after:content-[''] rtl:after:translate-x-1/2",
    'hover:before:h-28 hover:after:h-28'
];
const SEPARATOR_DESIGN: Record<FlexibleColumnLayoutBackgroundDesign, string> = {
    solid: 'bg-sap-content-foreground-color',
    translucent: 'bg-sap-group-content-background hc:bg-sap-background-color',
    transparent: 'bg-transparent hc:bg-sap-background-color'
};
// 2rem × 1.5rem, 1.625rem high in compact (the button's compact height), as fundamental-styles; the compact
// minimum width and padding of the button are overridden too
const SEPARATOR_BUTTON =
    'absolute start-1/2 top-1/2 z-2 h-8 w-6 min-w-6 -translate-1/2 justify-center p-0 rtl:translate-x-1/2 compact:min-w-6 compact:px-0';

export interface FlexibleColumnLayoutProps extends Omit<ComponentProps<'div'>, 'children'> {
    ref?: Ref<HTMLDivElement>;
    /** The layout (controlled): which columns show and how wide they are. */
    layout?: FlexibleColumnLayout;
    /** The initial layout (uncontrolled). */
    defaultLayout?: FlexibleColumnLayout;
    /** Called with the next layout: from a separator, or when the layout adapts to the width. */
    onLayoutChange?: (layout: FlexibleColumnLayout) => void;
    /** Background of the separators. */
    backgroundDesign?: FlexibleColumnLayoutBackgroundDesign;
    /** Column widths of some layouts, over those of the `FlexibleColumnLayoutConfigProvider` (or the defaults). */
    layoutDefinitions?: Partial<FlexibleColumnLayoutDefinition>;
    /** Width (of the layout) up to which one column fills the layout. */
    smBreakPoint?: number;
    /** Width up to which at most two columns are shown. */
    lgBreakPoint?: number;
    /** Label of the separator buttons that expand a column. */
    expandTitle?: string;
    /** Label of the separator buttons that collapse a column. */
    collapseTitle?: string;
    expandTitleStartBtn?: string | null;
    collapseTitleStartBtn?: string | null;
    expandTitleEndBtn?: string | null;
    collapseTitleEndBtn?: string | null;
    /** Content of the start column (e.g. a list). */
    startColumn?: ReactNode;
    /** Content of the mid column (e.g. the detail). */
    midColumn?: ReactNode;
    /** Content of the end column (e.g. the detail of the detail). */
    endColumn?: ReactNode;
}

/**
 * Flexible column layout: up to three columns (list, detail, detail-detail) whose widths follow the layout.
 * Separators between visible columns expand or collapse them, and the layout adapts to its width: up to
 * `smBreakPoint` one column fills the layout, up to `lgBreakPoint` at most two columns are shown, and the previous
 * layout comes back when there is room again.
 *
 * ```tsx
 * <FlexibleColumnLayout
 *     layout={layout}
 *     onLayoutChange={setLayout}
 *     startColumn={<ProductList />}
 *     midColumn={<ProductDetail />}
 *     endColumn={<Supplier />}
 * />
 * ```
 */
export function FlexibleColumnLayout({
    ref,
    layout: layoutProp,
    defaultLayout = 'OneColumnStartFullScreen',
    onLayoutChange,
    backgroundDesign = 'solid',
    layoutDefinitions,
    smBreakPoint = 960,
    lgBreakPoint = 1280,
    expandTitle = 'Expand',
    collapseTitle = 'Collapse',
    expandTitleStartBtn,
    collapseTitleStartBtn,
    expandTitleEndBtn,
    collapseTitleEndBtn,
    startColumn,
    midColumn,
    endColumn,
    className,
    ...props
}: FlexibleColumnLayoutProps) {
    const config = useFlexibleColumnLayoutConfig();
    const [ownLayout, setOwnLayout] = useState(defaultLayout);
    const layout = layoutProp ?? ownLayout;
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState<number | null>(null);
    /** Layout to restore when the layout collapsed to one full-screen column on a small width. */
    const restoreRef = useRef<FlexibleColumnLayout | null>(null);

    const columns = { ...config.layouts, ...layoutDefinitions }[layout];
    const size: ScreenSize = width === null || width > lgBreakPoint ? 'lg' : width > smBreakPoint ? 'md' : 'sm';

    const setLayout = (next: FlexibleColumnLayout) => {
        if (layoutProp === undefined) setOwnLayout(next);
        onLayoutChange?.(next);
    };

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        setWidth(root.clientWidth);
        const observer = new ResizeObserver(() => setWidth(root.clientWidth));
        observer.observe(root);
        return () => observer.disconnect();
    }, []);

    const measured = width !== null;
    useLayoutEffect(() => {
        if (!measured) return;
        const result = adapt(layout, size, restoreRef.current);
        restoreRef.current = result.restore;
        if (result.layout !== layout) setLayout(result.layout);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- adapts on layout and size changes only
    }, [layout, size, measured]);

    const separator = (
        direction: Separator,
        next: FlexibleColumnLayout | undefined,
        collapse: string | null | undefined,
        expand: string | null | undefined
    ) => {
        if (!direction) return null;
        const label = direction === 'left' ? (collapse ?? collapseTitle) : (expand ?? expandTitle);
        return (
            // the button is the keyboard and screen reader control; the separator is a larger click target
            <div className={cn(SEPARATOR, SEPARATOR_DESIGN[backgroundDesign])} onClick={() => next && setLayout(next)}>
                <Button
                    variant="transparent"
                    glyph={`slim-arrow-${direction}`}
                    aria-label={label}
                    title={label}
                    className={SEPARATOR_BUTTON}
                />
            </div>
        );
    };

    const column = (percent: number, content: ReactNode) => (
        <div
            className={cn(COLUMN, !percent && HIDDEN_COLUMN)}
            style={{ width: `${percent}%` }}
            aria-hidden={!percent || undefined}
        >
            {content}
        </div>
    );

    return (
        <div
            {...props}
            ref={(node: HTMLDivElement | null) => {
                rootRef.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            className={cn(
                'm-0 box-border flex p-0 font-sap-font-family text-sap-font-size text-sap-text-color',
                className
            )}
        >
            {column(columns.start, startColumn)}
            {separator(
                startSeparator(layout),
                START_SEPARATOR_NEXT[layout],
                collapseTitleStartBtn,
                expandTitleStartBtn
            )}
            {column(columns.mid, midColumn)}
            {separator(endSeparator(layout), END_SEPARATOR_NEXT[layout], collapseTitleEndBtn, expandTitleEndBtn)}
            {column(columns.end, endColumn)}
        </div>
    );
}
