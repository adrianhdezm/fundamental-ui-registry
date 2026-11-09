/*
 * Port of fundamental-react (Link) and @fundamental-ngx/core (link) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { cn } from '@/lib/utils';

export interface LinkProps extends useRender.ComponentProps<'a'> {
    /** Bold link for important navigation. */
    emphasized?: boolean;
    /** Disables the link: aria-disabled, out of the tab order, no pointer events. */
    disabled?: boolean;
    /** For dark backgrounds such as the shell. */
    inverted?: boolean;
    /** Less prominent link, underlined at rest. */
    subtle?: boolean;
    /** Never underlined. */
    undecorated?: boolean;
    /** 1.5rem line height to meet the WCAG 2.2 minimum target size inside lists and tables. */
    touchTarget?: boolean;
    /** Announced after emphasized links. */
    emphasizedLabel?: string;
    /** Announced after subtle links. */
    subtleLabel?: string;
}

/**
 * SAP Fiori link. Renders an `<a>`; `render` renders another element (e.g. a router link, or a `<button>` for an
 * in-page action). Put an `Icon` before or after the text for icon links.
 *
 * ```tsx
 * <Link href="/orders">Orders</Link>
 * <Link emphasized href="/new">Create order <Icon glyph="arrow-right" /></Link>
 * ```
 */
export function Link({
    emphasized = false,
    disabled = false,
    inverted = false,
    subtle = false,
    undecorated = false,
    touchTarget = false,
    emphasizedLabel = 'Emphasized',
    subtleLabel = 'Subtle',
    render,
    className,
    children,
    tabIndex,
    ...props
}: LinkProps) {
    return useRender({
        render,
        defaultTagName: 'a',
        props: {
            ...props,
            'aria-disabled': disabled,
            tabIndex: disabled ? -1 : tabIndex,
            className: cn(
                'group/link inline-flex items-center cursor-pointer bg-transparent p-0 border-0 font-sap-font-family text-sap-font-size',
                'leading-4 whitespace-normal break-words [overflow-wrap:break-word] no-underline underline-offset-[0.125rem]',
                'text-sap-link-color text-shadow-sap-content-text-shadow transition-all duration-[125ms] ease-in',
                'visited:text-sap-link-visited-color hover:text-sap-link-hover-color active:text-sap-link-active-color',
                // Horizon: filled focus; high contrast: outline
                'focus:outline-none focus:shadow-none focus:z-[5] focus:text-sap-content-contrast-text-color focus:[text-shadow:none]',
                'focus:bg-sap-content-focus-color focus:rounded-[0.125rem] active:focus:bg-transparent',
                'hc:focus:bg-transparent hc:focus:rounded-none hc:focus:outline-(length:--sapContent_FocusWidth) hc:focus:outline-offset-[0.125rem]',
                'hc:focus:[outline-style:var(--sapContent_FocusStyle)] hc:focus:outline-sap-content-focus-color',
                '[&_[data-glyph]]:leading-none [&_[data-glyph]:first-child]:me-0.5 [&_[data-glyph]:last-child]:ms-0.5',
                emphasized && 'font-sap-font-bold-family',
                touchTarget && 'leading-6',
                subtle && 'text-sap-link-subtle-color',
                inverted &&
                    'text-sap-link-inverted-color hover:text-sap-link-inverted-color [text-shadow:none] focus:outline-sap-content-contrast-focus-color',
                disabled &&
                    'pointer-events-none opacity-(--sapContent_DisabledOpacity) text-sap-link-color visited:text-sap-link-color',
                className
            ),
            children: (
                <>
                    <span
                        className={
                            undecorated
                                ? 'no-underline has-[[data-glyph]]:leading-(--sapContent_LineHeight)'
                                : cn(
                                      'has-[[data-glyph]]:leading-(--sapContent_LineHeight)',
                                      subtle
                                          ? 'underline group-hover/link:no-underline group-active/link:underline'
                                          : '[text-decoration:var(--sapLink_TextDecoration)] group-hover/link:[text-decoration:var(--sapLink_Hover_TextDecoration)] group-active/link:[text-decoration:var(--sapLink_Active_TextDecoration)]',
                                      'group-focus/link:underline',
                                      disabled && '[text-decoration:var(--sapLink_TextDecoration)]'
                                  )
                        }
                    >
                        {children}
                    </span>
                    {emphasized && <span className="sr-only-sap">{emphasizedLabel}</span>}
                    {subtle && <span className="sr-only-sap">{subtleLabel}</span>}
                </>
            )
        }
    });
}
