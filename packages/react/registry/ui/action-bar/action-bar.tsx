/*
 * Port of fundamental-react (ActionBar) and @fundamental-ngx/core (action-bar) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Title, type HeaderSize, type TitleProps } from '@/ui/title/title';

/** Responsive size: s (small), m_l (medium/large) or xl; sets the horizontal padding. */
export type ActionBarSize = 's' | 'm_l' | 'xl';

const PADDING: Record<ActionBarSize, string> = { s: 'px-4', m_l: 'px-8', xl: 'px-12' };

export interface ActionBarProps extends useRender.ComponentProps<'div'> {
    /** Responsive size; sets the horizontal padding (1rem, 2rem or 3rem). */
    size?: ActionBarSize;
}

/**
 * Action bar: the header of a page with a back button, title, description and page actions. Renders a `<div>`;
 * `render` renders another element (e.g. `<header />`).
 *
 * ```tsx
 * <ActionBar>
 *     <ActionBarHeader>
 *         <ActionBarBack>
 *             <Button variant="transparent" glyph="navigation-left-arrow" aria-label="Back" onClick={goBack} />
 *         </ActionBarBack>
 *         <ActionBarTitle>Page Title</ActionBarTitle>
 *         <ActionBarActions>
 *             <Button variant="emphasized" label="Save" />
 *         </ActionBarActions>
 *     </ActionBarHeader>
 *     <ActionBarDescription withBackBtn>Description</ActionBarDescription>
 * </ActionBar>
 * ```
 */
export function ActionBar({ size = 'm_l', render, className, ...props }: ActionBarProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border block max-h-[4.25rem] min-h-12 justify-between py-2 break-words font-sap-font-family text-sap-font-size',
                // the shadow token on its own: the shadow-* utility adds Tailwind's transparent ring and inset layers
                'bg-sap-page-header-background [box-shadow:var(--sapContent_HeaderShadow)]',
                PADDING[size],
                className
            )
        }
    });
}

/** The first row of the action bar: back button, title and actions. */
export function ActionBarHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('m-0 box-border flex h-8 grow items-center p-0', className)} />;
}

/** Holds the back button, before the title. Hidden on small screens (below 600px). */
export function ActionBarBack({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('relative m-0 me-2 box-border block p-0 max-[600px]:hidden', className)} />;
}

export interface ActionBarTitleProps extends ComponentProps<'div'> {
    /** Heading level of the title. */
    level?: HeaderSize;
    /** Visual size of the title, independent of the level. */
    headerSize?: HeaderSize;
    /** Props for the heading element inside (e.g. an `id` for `aria-labelledby`). */
    headingProps?: Omit<TitleProps, 'level' | 'headerSize' | 'children'>;
}

/** The page title: a heading (level 2 by default) that truncates on one line. */
export function ActionBarTitle({
    level = 2,
    headerSize = 3,
    headingProps,
    className,
    children,
    ...props
}: ActionBarTitleProps) {
    return (
        <div
            {...props}
            className={cn(
                'm-0 box-border min-w-0 grow basis-0 truncate p-0 pe-2 align-middle leading-[1.375rem] [text-rendering:optimizeLegibility]',
                className
            )}
        >
            <Title {...headingProps} level={level} headerSize={headerSize}>
                {children}
            </Title>
        </div>
    );
}

/** The page actions, at the end of the header. The `hidden` attribute hides them. */
export function ActionBarActions({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            {...props}
            className={cn(
                'm-0 box-border flex h-8 items-center gap-2 p-0 visible transition-opacity duration-250 ease-in [&[hidden]]:invisible [&[hidden]]:opacity-0',
                className
            )}
        />
    );
}

export interface ActionBarDescriptionProps extends ComponentProps<'p'> {
    /** Aligns the description with the title next to a back button. */
    withBackBtn?: boolean;
}

/** A line under the title that truncates. Hidden on small screens (below 600px). */
export function ActionBarDescription({ withBackBtn = false, className, ...props }: ActionBarDescriptionProps) {
    return (
        <p
            {...props}
            className={cn(
                'm-0 box-border inline-block h-5 w-full truncate p-0 align-middle text-sap-content-label-color max-[600px]:hidden',
                withBackBtn && 'ps-10',
                className
            )}
        />
    );
}
