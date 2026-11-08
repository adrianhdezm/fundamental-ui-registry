/*
 * Port of @fundamental-ngx/core (object-attribute) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import type { KeyboardEvent, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

export interface ObjectAttributeProps extends useRender.ComponentProps<'span'> {
    /** Text before the value; also the tooltip of the attribute. */
    label?: string | null;
    /** Text after the value, shown as a link with `isLink`. */
    linkText?: string | null;
    /** Styles the link text as an action link: focusable, activates with click and Enter. */
    isLink?: boolean;
    /** Disables the action link: aria-disabled, out of the tab order, no pointer events. */
    disabled?: boolean;
    /** Called when the action link is activated with a click or Enter. */
    onObjectAttributeClick?: (event: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) => void;
}

/**
 * Object attribute: a single-line property of an object (label and value), truncated with an ellipsis, optionally
 * with an action link. Renders a block `<span>`; `render` renders another element.
 *
 * ```tsx
 * <ObjectAttribute label="Manufacturer">: Titanium</ObjectAttribute>
 * <ObjectAttribute label="Owner: " isLink linkText="Jane Doe" onObjectAttributeClick={open} />
 * ```
 */
export function ObjectAttribute({
    label,
    linkText,
    isLink = false,
    disabled = false,
    onObjectAttributeClick,
    render,
    className,
    children,
    ...props
}: ObjectAttributeProps) {
    const activate = (event: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) => {
        if (isLink && !disabled) onObjectAttributeClick?.(event);
    };

    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            title: label ?? undefined,
            ...props,
            className: cn(
                'm-0 box-border block truncate border-0 p-0 font-sap-font-family text-sap-font-size font-normal leading-[normal]',
                'text-sap-content-label-color forced-color-adjust-none',
                className
            ),
            children: (
                <>
                    {label}
                    {children}
                    {linkText != null && (
                        <span
                            role={isLink ? 'link' : undefined}
                            tabIndex={isLink ? (disabled ? -1 : 0) : undefined}
                            title={linkText}
                            aria-disabled={(isLink && disabled) || undefined}
                            onClick={activate}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') activate(event);
                            }}
                            className={cn(
                                isLink && [
                                    'cursor-pointer no-underline text-sap-link-color visited:text-sap-link-visited-color',
                                    'enabled-hover:underline enabled-hover:text-sap-link-hover-color',
                                    'focus:outline-sap focus:-outline-offset-1',
                                    disabled && 'pointer-events-none opacity-(--sapContent_DisabledOpacity)'
                                ]
                            )}
                        >
                            {linkText}
                        </span>
                    )}
                </>
            )
        }
    });
}
