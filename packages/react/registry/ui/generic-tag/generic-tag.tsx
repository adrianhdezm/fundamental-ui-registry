/*
 * Port of @fundamental-ngx/core (generic-tag) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button as BaseButton } from '@base-ui/react/button';
import type { useRender } from '@base-ui/react/use-render';
import { isValidElement } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui/icon/icon';

export type GenericTagType = 'error' | 'success' | 'warning' | 'information';

/** Decorator (--gt-deco), background (--gt-bg), icon (--gt-ic) and value (--gt-vc) colours. */
const TYPE: Record<GenericTagType | 'neutral', string> = {
    neutral:
        '[--gt-deco:var(--sapNeutralElementColor)] [--gt-bg:var(--sapNeutralBackground)] [--gt-ic:var(--sapNeutralElementColor)] [--gt-vc:var(--sapNeutralTextColor)]',
    error: '[--gt-deco:var(--sapNegativeElementColor)] [--gt-bg:var(--sapErrorBackground)] [--gt-ic:var(--sapNegativeElementColor)] [--gt-vc:var(--sapNegativeTextColor)]',
    warning:
        '[--gt-deco:var(--sapCriticalElementColor)] [--gt-bg:var(--sapWarningBackground)] [--gt-ic:var(--sapCriticalElementColor)] [--gt-vc:var(--sapCriticalTextColor)]',
    success:
        '[--gt-deco:var(--sapPositiveElementColor)] [--gt-bg:var(--sapSuccessBackground)] [--gt-ic:var(--sapPositiveElementColor)] [--gt-vc:var(--sapPositiveTextColor)]',
    information:
        '[--gt-deco:var(--sapInformativeElementColor)] [--gt-bg:var(--sapInformationBackground)] [--gt-ic:var(--sapInformativeElementColor)] [--gt-vc:var(--sapInformativeTextColor)]'
};

const textClass = 'm-0 min-w-[1.5625rem] truncate p-0 text-shadow-(--gt-ts)';

export interface GenericTagProps extends Omit<useRender.ComponentProps<'div'>, 'children'> {
    /** Status of the key figure: a status icon, decorator strip, background and value colour. Neutral by default. */
    type?: GenericTagType | null;
    /** Name of the key figure. */
    name: string;
    /** Value of the key figure, after the name. */
    value?: string | null;
    /** Announced as the type of the button. */
    ariaRoleDescription?: string;
    /** Whether `render` renders a native `<button>`; detected for a `<button />` element. */
    nativeButton?: boolean;
}

/**
 * Generic tag: a key figure (name and value) with an optional status, shown in object page headers. A focusable
 * `role="button"` (Base UI's Button) that activates with click, Enter and Space. Renders a `<div>`; `render` renders
 * another element.
 *
 * ```tsx
 * <GenericTag name="Product Cost" value="3.5M EUR" />
 * <GenericTag type="error" name="Overdue" value="12 days" onClick={open} />
 * ```
 */
export function GenericTag({
    type,
    name,
    value,
    ariaRoleDescription = 'Generic Tag',
    nativeButton,
    render,
    className,
    ...props
}: GenericTagProps) {
    const tag = isValidElement(render) && typeof render.type === 'string' ? render.type : null;
    return (
        <BaseButton
            aria-roledescription={ariaRoleDescription}
            // typed for the rendered <div>; Base UI types its handlers for a <button>
            {...(props as Omit<BaseButton.Props, 'className'>)}
            render={render ?? <div />}
            nativeButton={nativeButton ?? tag === 'button'}
            className={cn(
                'mx-0 my-[0.5625rem] compact:my-[0.1875rem] box-border flex h-[1.625rem] w-fit max-w-full cursor-pointer items-center gap-[0.375rem] border-0 py-0 ps-3 pe-[0.375rem]',
                'font-sap-font-family text-sap-font-size font-normal leading-[normal] text-sap-text-color forced-color-adjust-none',
                'rounded-sap-button-border-corner-radius [box-shadow:var(--sapContent_Shadow0)]',
                '[--gt-nc:var(--sapList_TextColor)] [--gt-ts:var(--sapContent_TextShadow)] [--gt-pos:0] rtl:[--gt-pos:100%]',
                // status decorator strip on the start edge over the background colour
                '[background:var(--gt-pos)_0_/_0.375rem_100%_no-repeat_linear-gradient(0deg,var(--gt-deco),var(--gt-deco))_var(--gt-bg)]',
                TYPE[type ?? 'neutral'],
                'enabled-hover:[--gt-bg:var(--sapList_Hover_Background)] enabled-hover:[--gt-ts:none]',
                'hc:enabled-hover:[--gt-nc:var(--sapList_Active_TextColor)] hc:enabled-hover:[--gt-vc:var(--sapList_Active_TextColor)] hc:enabled-hover:[--gt-ic:var(--sapList_Active_TextColor)]',
                // enabled-active, not active: it has to come after the enabled-hover custom variant in the CSS to win
                'enabled-active:[--gt-bg:var(--sapList_Active_Background)] enabled-active:[--gt-ts:none] enabled-active:[--gt-nc:var(--sapList_Active_TextColor)]',
                'enabled-active:[--gt-vc:var(--sapList_Active_TextColor)] enabled-active:[--gt-ic:var(--sapList_Active_TextColor)]',
                'focus:outline-sap active:outline-sap hc:outline-offset-[-0.1875rem]',
                className
            )}
        >
            {type && (
                <Icon
                    glyph={`message-${type}`}
                    className="flex items-center justify-center text-[1rem] leading-none text-(--gt-ic)"
                />
            )}
            <span className={cn(textClass, 'text-(--gt-nc)')} title={name}>
                {name}
            </span>
            {value && (
                <span className={cn(textClass, 'ms-3 text-(--gt-vc)')} title={value}>
                    {value}
                </span>
            )}
        </BaseButton>
    );
}
