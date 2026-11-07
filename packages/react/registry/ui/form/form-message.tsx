/*
 * Port of fundamental-react (Forms) and @fundamental-ngx/core (form) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { createContext, use, useId, useLayoutEffect, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { iconGlyphChar } from '@/ui/icon/icon';

export type FormMessageType = 'success' | 'error' | 'warning' | 'information' | 'default';

const TYPE: Record<FormMessageType, { className: string; glyph: string | null; label: string }> = {
    error: {
        className: 'bg-sap-error-background before:text-sap-negative-element-color',
        glyph: 'error',
        label: 'Invalid Entry'
    },
    warning: {
        className: 'bg-sap-warning-background before:text-sap-critical-element-color',
        glyph: 'alert',
        label: 'Warning'
    },
    success: {
        className: 'bg-sap-success-background before:text-sap-positive-element-color',
        glyph: 'sys-enter-2',
        label: 'Success'
    },
    information: {
        className: 'bg-sap-information-background before:text-sap-informative-element-color',
        glyph: 'information',
        label: 'Information'
    },
    default: { className: '', glyph: null, label: '' }
};

/** What a `FormMessage` tells its `FormInputMessageGroup`: its id (describes the field) and type (errors mark it invalid). */
export interface FormMessageRegistration {
    id: string;
    type: FormMessageType;
}

/** Lets a `FormMessage` register with the `FormInputMessageGroup` it is in. */
export const FormMessageGroupContext = createContext<((message: FormMessageRegistration | null) => void) | null>(null);

export interface FormMessageProps extends Omit<ComponentProps<'div'>, 'className'> {
    className?: string;
    /** Value state the message explains: an icon, a background and a hidden description of the type. */
    type?: FormMessageType;
    /** Width follows the content instead of the field. */
    static?: boolean;
    /** Inside a popover or container: no shadow, full width. */
    embedded?: boolean;
    /** Hidden prefix announced before the message; defaults to the type ("Invalid Entry", "Warning", ...). */
    valueStateMessage?: string;
}

/**
 * Value state message of a field, announced assertively. Put it in a `FormInputMessageGroup` with the field to
 * show it in a popover under the field and describe the field with it.
 *
 * ```tsx
 * <FormMessage type="error">Enter a valid email address.</FormMessage>
 * ```
 */
export function FormMessage({
    type = 'default',
    static: isStatic = false,
    embedded = false,
    valueStateMessage = '',
    id: idProp,
    className,
    children,
    ...props
}: FormMessageProps) {
    const autoId = useId();
    const id = idProp ?? `fd-form-message-${autoId}`;
    const register = use(FormMessageGroupContext);
    useLayoutEffect(() => {
        if (!register) return;
        register({ id, type });
        return () => register(null);
    }, [register, id, type]);
    const { glyph, label } = TYPE[type];
    const srOnly = valueStateMessage || label;

    return (
        <div
            {...props}
            id={id}
            aria-live="assertive"
            aria-atomic="true"
            data-slot="form-message"
            data-glyph={glyph ? iconGlyphChar(glyph) : undefined}
            className={cn(
                'm-0 box-border flex w-full min-w-24 max-w-[22rem] items-center p-2',
                'font-sap-font-family text-sap-font-small-size font-normal leading-[1.125rem] text-sap-text-color whitespace-pre-line',
                '[box-shadow:var(--sapContent_Shadow1)] rounded-sap-popover-border-corner-radius',
                'hc:[box-shadow:none] hc:rounded-none hc:border-solid hc:border-[calc(var(--sapField_BorderWidth)*2)] hc:border-sap-field-border-color',
                'before:block before:self-start before:me-1.5 before:font-sap-content-icon-font-family before:text-[1rem] before:content-[attr(data-glyph)]',
                TYPE[type].className,
                isStatic && 'w-fit',
                embedded && '[box-shadow:none] max-w-full',
                className
            )}
        >
            {srOnly && <span className="sr-only-sap">{srOnly}</span>}
            <span>{children}</span>
        </div>
    );
}
