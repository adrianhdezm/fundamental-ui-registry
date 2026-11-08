/*
 * Port of fundamental-react (SideNavigation) and @fundamental-ngx/core (side-navigation) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useCallback, useSyncExternalStore, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import {
    NESTED_LIST_SCOPE_ATTRIBUTE,
    NestedListProvider,
    PreparedNestedList,
    type NestedListModel
} from '@/ui/nested-list/nested-list';

/** A side navigation built from data. */
export interface SideNavigationModel {
    condensed?: boolean;
    mainNavigation: NestedListModel;
    utilityNavigation?: NestedListModel;
}

/** A link at the start of the navigation, shown on focus, that skips it (fundamental-react's `skipLink`). */
export interface SideNavigationSkipLink {
    /** Where the page content starts, e.g. `#content`. */
    href: string;
    label: string;
}

export interface SideNavigationProps extends ComponentProps<'nav'> {
    /** Builds the navigation from data instead of children. */
    sideNavigationConfiguration?: SideNavigationModel | null;
    /** Shows the icons of the first level only and opens their child lists in popovers. */
    condensed?: boolean;
    /** Condenses the navigation while the window is at most this wide (px). */
    collapseWidth?: number | null;
    /** Clicking an item selects it and highlights its parents; false keeps the `selected` props (default true). */
    selectable?: boolean;
    /** A link to the page content before the lists, visible while it has the focus. */
    skipLink?: SideNavigationSkipLink;
}

const subscribeResize = (onChange: () => void) => {
    window.addEventListener('resize', onChange);
    return () => window.removeEventListener('resize', onChange);
};

/** Whether the window is at most `width` px wide; false without a width. */
function useNarrow(width: number | null | undefined): boolean {
    const snapshot = useCallback(() => !!width && window.innerWidth <= width, [width]);
    return useSyncExternalStore(subscribeResize, snapshot, () => false);
}

/**
 * Side navigation (Angular's `fd-side-nav`): main and utility nested lists in a column, with arrow-key navigation
 * across both and one selection. Condensed, it shows the icons of the first level only and opens child lists in
 * popovers. The vertical navigation is its successor in SAP Fiori.
 *
 * ```tsx
 * <SideNavigation>
 *     <SideNavigationMain>
 *         <NestedList>...</NestedList>
 *     </SideNavigationMain>
 *     <SideNavigationUtility>
 *         <NestedList>...</NestedList>
 *     </SideNavigationUtility>
 * </SideNavigation>
 * ```
 */
export function SideNavigation({
    sideNavigationConfiguration: config,
    condensed = false,
    collapseWidth,
    selectable = true,
    skipLink,
    'aria-label': ariaLabel = 'Main Navigation',
    className,
    children,
    ...props
}: SideNavigationProps) {
    const narrow = useNarrow(collapseWidth);
    const isCondensed = condensed || !!config?.condensed || narrow;

    return (
        <nav
            aria-label={ariaLabel}
            {...props}
            {...{ [NESTED_LIST_SCOPE_ATTRIBUTE]: '' }}
            data-slot="side-navigation"
            data-condensed={isCondensed ? '' : undefined}
            className={cn(
                'm-0 box-border flex h-full max-h-full flex-col bg-sap-list-background p-0 font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-text-color',
                isCondensed ? 'w-16' : 'w-full',
                className
            )}
        >
            {skipLink && (
                <a
                    href={skipLink.href}
                    data-slot="side-navigation-skip-link"
                    className="sr-only font-sap-font-family text-sap-font-size leading-[normal] text-sap-link-color focus:not-sr-only focus:block focus:px-4 focus:py-2 focus:outline-sap focus:-outline-offset-[0.1875rem]"
                >
                    {skipLink.label}
                </a>
            )}
            <NestedListProvider condensed={isCondensed} selectable={selectable} scoped>
                {config ? (
                    <>
                        {config.mainNavigation && (
                            <SideNavigationMain>
                                <PreparedNestedList condensed={isCondensed} list={config.mainNavigation} />
                            </SideNavigationMain>
                        )}
                        {config.utilityNavigation && (
                            <SideNavigationUtility>
                                <PreparedNestedList condensed={isCondensed} list={config.utilityNavigation} />
                            </SideNavigationUtility>
                        )}
                    </>
                ) : (
                    children
                )}
            </NestedListProvider>
        </nav>
    );
}

export type SideNavigationMainProps = ComponentProps<'div'>;

/** The main links, at the top (Angular's `fd-side-nav-main`); it scrolls when the navigation is too short. */
export function SideNavigationMain({ className, ...props }: SideNavigationMainProps) {
    return (
        <div
            {...props}
            data-slot="side-navigation-main"
            className={cn('m-0 box-border block min-h-0 flex-1 overflow-y-auto p-0 scrollbar-sap', className)}
        />
    );
}

export type SideNavigationUtilityProps = ComponentProps<'div'>;

/** The utility links, at the bottom (Angular's `fd-side-nav-utility`). */
export function SideNavigationUtility({ className, ...props }: SideNavigationUtilityProps) {
    return (
        <div
            {...props}
            data-slot="side-navigation-utility"
            className={cn('m-0 box-border block shrink-0 p-0', className)}
        />
    );
}
