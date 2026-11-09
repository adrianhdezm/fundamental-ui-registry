/*
 * Port of @fundamental-ngx/core (object-marker) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { useId, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconFont } from '@/ui/icon/icon';

export interface ObjectMarkerProps extends useRender.ComponentProps<'span'> {
    /** Glyph name of an SAP icon shown before the label. */
    glyph?: string | null;
    /** Icon font of the glyph. */
    glyphFont?: IconFont;
    /** Text of the marker. */
    label?: string | null;
    /**
     * Interactive marker: a focusable `role="link"` that activates with click and Enter. Render it as a link with
     * `render={<a href="…" />}`.
     */
    clickable?: boolean;
    /** Announced before the label; `activeText` or `inactiveText` by default. */
    statusText?: string | null;
    /** Default status text of a clickable marker. */
    activeText?: string;
    /** Default status text of a non-clickable marker. */
    inactiveText?: string;
    /** Tooltip and accessible name of an icon-only marker; the glyph name by default. */
    title?: string;
}

/**
 * Object marker: a technical status of an object (draft, locked, favourite...) as an icon and/or text. Clickable
 * markers are links. Renders a `<span>`; `render` renders another element, e.g. `<a href>` for clickable ones.
 *
 * ```tsx
 * <ObjectMarker glyph="private" label="Locked" />
 * <ObjectMarker clickable glyph="user-edit" label="Unsaved changes" render={<a href="#changes" />} />
 * ```
 */
export function ObjectMarker({
    glyph,
    glyphFont = 'SAP-icons',
    label,
    clickable = false,
    statusText,
    activeText = 'Active Object Marker',
    inactiveText = 'Inactive Object Marker',
    title,
    id: idProp,
    'aria-labelledby': ariaLabelledBy,
    tabIndex,
    onKeyDown,
    render,
    className,
    children,
    ...props
}: ObjectMarkerProps) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const iconOnly = !!glyph && !label;
    const iconTitle = iconOnly ? (title ?? glyph) : undefined;

    // role="link" hosts that are not native links (or buttons) activate with Enter like links
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event);
        const host = event.currentTarget;
        const native =
            (host instanceof HTMLAnchorElement && host.hasAttribute('href')) || host instanceof HTMLButtonElement;
        if (event.defaultPrevented || event.key !== 'Enter' || !clickable || event.target !== host || native) return;
        event.preventDefault();
        host.click();
    };

    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            id,
            tabIndex: tabIndex ?? (clickable ? 0 : -1),
            role: clickable ? 'link' : iconOnly ? 'img' : undefined,
            'aria-labelledby':
                ariaLabelledBy ?? (iconOnly ? `${id}-sr-only ${id}-sr-only-icon-only` : `${id}-sr-only ${id}-label`),
            onKeyDown: handleKeyDown,
            className: cn(
                'group/om relative m-0 box-border inline-flex max-w-full items-center p-0 align-middle',
                'font-sap-font-family text-base leading-none [&+&]:ms-2',
                clickable && [
                    // fundamental-styles' link markers have a normal line height
                    'leading-[normal] cursor-pointer text-sap-link-color text-shadow-sap-content-text-shadow transition-all duration-[125ms] ease-in break-words',
                    'visited:text-sap-link-visited-color hover:text-sap-link-hover-color active:text-sap-link-active-color',
                    // Horizon: filled focus; high contrast: outline
                    'focus:outline-none focus:text-sap-content-contrast-text-color focus:[text-shadow:none]',
                    'focus:bg-sap-content-focus-color focus:rounded-[0.125rem] active:focus:bg-transparent',
                    'hc:focus:bg-transparent hc:focus:rounded-none hc:focus:outline-(length:--sapContent_FocusWidth) hc:focus:outline-offset-[0.125rem]',
                    'hc:focus:[outline-style:var(--sapContent_FocusStyle)] hc:focus:outline-sap-content-focus-color',
                    '[&:focus_[data-glyph]]:text-inherit'
                ],
                className
            ),
            children: (
                <>
                    <span className="sr-only-sap" id={`${id}-sr-only`} aria-hidden>
                        {statusText ?? (clickable ? activeText : inactiveText)}
                    </span>
                    {glyph && (
                        // as wide as the glyph, as fundamental-styles' marker icons; the gap is a margin, not a
                        // padding, so it stays on the label side when a mirrored glyph is flipped in RTL
                        <Icon
                            glyph={glyph}
                            font={glyphFont}
                            title={iconTitle}
                            className="flex w-auto items-center justify-center me-1 text-base leading-[normal] text-sap-content-marker-icon-color"
                        />
                    )}
                    {label && (
                        <span
                            id={`${id}-label`}
                            className={
                                clickable
                                    ? cn(
                                          '[text-decoration:var(--sapLink_TextDecoration)] group-hover/om:[text-decoration:var(--sapLink_Hover_TextDecoration)]',
                                          'group-active/om:[text-decoration:var(--sapLink_Active_TextDecoration)] group-focus/om:underline'
                                      )
                                    : 'm-0 p-0 text-base not-italic leading-[normal] break-words text-sap-content-label-color'
                            }
                        >
                            {label}
                        </span>
                    )}
                    {iconOnly && (
                        <span className="sr-only-sap" id={`${id}-sr-only-icon-only`} aria-hidden>
                            {iconTitle}
                        </span>
                    )}
                    {children}
                </>
            )
        }
    });
}
