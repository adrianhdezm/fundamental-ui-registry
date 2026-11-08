/*
 * Port of @fundamental-ngx/core (object-number) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button as BaseButton } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import { isValidElement, useMemo } from 'react';
import { cn } from '@/lib/utils';

export type ObjectNumberStatus = 'negative' | 'critical' | 'positive' | 'informative';

const COLOR: Record<ObjectNumberStatus, string> = {
    positive: '[--on-c:var(--sapPositiveTextColor)]',
    critical: '[--on-c:var(--sapCriticalTextColor)]',
    negative: '[--on-c:var(--sapNegativeTextColor)]',
    informative: '[--on-c:var(--sapInformativeTextColor)]'
};

/** Inverted colours: regular, hover (--on-h-*) and active (--on-a-*). */
const INVERTED: Record<ObjectNumberStatus | 'neutral', string> = {
    neutral:
        '[--on-c:var(--sapTextColor)] [--on-bg:var(--sapNeutralBackground)] [--on-bc:var(--sapNeutralBorderColor)] [--on-h-c:var(--sapButton_Neutral_Hover_TextColor)] [--on-h-bg:var(--sapButton_Neutral_Hover_Background)] [--on-h-bc:var(--sapButton_Neutral_Hover_BorderColor)] [--on-a-c:var(--sapButton_Active_TextColor)] [--on-a-bg:var(--sapButton_Neutral_Active_Background)] [--on-a-bc:var(--sapButton_Neutral_Active_BorderColor)]',
    positive:
        '[--on-c:var(--sapButton_Success_TextColor)] [--on-bg:var(--sapButton_Success_Background)] [--on-bc:var(--sapButton_Success_BorderColor)] [--on-h-c:var(--sapButton_Success_Hover_TextColor)] [--on-h-bg:var(--sapButton_Success_Hover_Background)] [--on-h-bc:var(--sapButton_Success_Hover_BorderColor)] [--on-a-c:var(--sapButton_Accept_Selected_TextColor)] [--on-a-bg:var(--sapButton_Success_Active_Background)] [--on-a-bc:var(--sapButton_Success_Active_BorderColor)]',
    critical:
        '[--on-c:var(--sapButton_Critical_TextColor)] [--on-bg:var(--sapButton_Critical_Background)] [--on-bc:var(--sapButton_Critical_BorderColor)] [--on-h-c:var(--sapButton_Critical_Hover_TextColor)] [--on-h-bg:var(--sapButton_Critical_Hover_Background)] [--on-h-bc:var(--sapButton_Critical_Hover_BorderColor)] [--on-a-c:var(--sapButton_Attention_Selected_TextColor)] [--on-a-bg:var(--sapButton_Critical_Active_Background)] [--on-a-bc:var(--sapButton_Critical_Active_BorderColor)]',
    negative:
        '[--on-c:var(--sapButton_Negative_TextColor)] [--on-bg:var(--sapButton_Negative_Background)] [--on-bc:var(--sapButton_Negative_BorderColor)] [--on-h-c:var(--sapButton_Negative_Hover_TextColor)] [--on-h-bg:var(--sapButton_Negative_Hover_Background)] [--on-h-bc:var(--sapButton_Negative_Hover_BorderColor)] [--on-a-c:var(--sapButton_Reject_Selected_TextColor)] [--on-a-bg:var(--sapButton_Negative_Active_Background)] [--on-a-bc:var(--sapButton_Negative_Active_BorderColor)]',
    informative:
        '[--on-c:var(--sapButton_Information_TextColor)] [--on-bg:var(--sapButton_Information_Background)] [--on-bc:var(--sapButton_Information_BorderColor)] [--on-h-c:var(--sapButton_Information_Hover_TextColor)] [--on-h-bg:var(--sapButton_Information_Hover_Background)] [--on-h-bc:var(--sapButton_Information_Hover_BorderColor)] [--on-a-c:var(--sapButton_Selected_TextColor)] [--on-a-bg:var(--sapButton_Information_Active_Background)] [--on-a-bc:var(--sapButton_Information_Active_BorderColor)]'
};

const STATUS_TEXT: Record<ObjectNumberStatus, string> = {
    negative: 'Value State Error',
    critical: 'Value State Warning',
    positive: 'Value State Success',
    informative: 'Value State Information'
};

export interface ObjectNumberProps extends useRender.ComponentProps<'span'> {
    /** The number, formatted for `locale` with `decimal` decimal places. */
    number?: number | null;
    /** Fixed number of decimal places. */
    decimal?: number;
    /** Unit of measurement shown after the number. */
    unit?: string | null;
    /** Locale of the number format; the runtime locale by default. */
    locale?: string;
    /** Bold number (ignored when large). */
    emphasized?: boolean;
    /** Large design, e.g. in a page header. */
    large?: boolean;
    /** Value state: the colour of the number, or of the badge when inverted. Neutral by default. */
    status?: ObjectNumberStatus | null;
    /** Announced instead of the default text of the status (e.g. "Value State Error" for negative). */
    statusMessage?: string | null;
    /** Announced for emphasized numbers. */
    emphasizedText?: string;
    /**
     * Clickable number: a focusable `role="button"` (on Base UI's Button) that activates with click, Enter and
     * Space. With `render={<button />}` it is a native button.
     */
    interactive?: boolean;
    /** Filled badge style. */
    inverted?: boolean;
    /** Whether the rendered element is a native `<button>`; detected from `render` by default. */
    nativeButton?: boolean;
}

/**
 * Object number: a formatted number with an optional unit, coloured by value state. Interactive numbers are
 * buttons. Renders a `<span>`; `render` renders another element.
 *
 * ```tsx
 * <ObjectNumber number={1000.37} decimal={2} unit="EUR" status="positive" />
 * <ObjectNumber number={-2000} unit="EUR" status="negative" inverted interactive onClick={open} />
 * ```
 */
export function ObjectNumber({
    number,
    decimal = 0,
    unit,
    locale,
    emphasized = false,
    large = false,
    status,
    statusMessage,
    emphasizedText = 'Emphasized',
    interactive = false,
    inverted = false,
    nativeButton,
    render,
    className,
    ...props
}: ObjectNumberProps) {
    const tag = isValidElement(render) && typeof render.type === 'string' ? render.type : null;
    const formatted = useMemo(
        () =>
            number == null
                ? ''
                : new Intl.NumberFormat(locale, {
                      minimumFractionDigits: decimal,
                      maximumFractionDigits: decimal
                  }).format(number),
        [number, decimal, locale]
    );

    const partClass = cn(
        'm-0 inline-block max-w-full truncate p-0 align-middle text-inherit',
        'leading-[inherit] [min-height:inherit]',
        inverted ? '[text-shadow:none]' : 'text-shadow-sap-content-text-shadow',
        interactive && !inverted && 'underline group-hover/on:no-underline'
    );

    const classes = cn(
        'group/on relative m-0 box-border inline-block max-w-full p-0 align-middle',
        // leading after the font size: tailwind-merge drops a line-height that comes before one
        'min-h-4 text-sap-font-size leading-4 font-sap-font-family text-(--on-c) [--on-c:var(--sapNeutralTextColor)]',
        status && COLOR[status],
        large && 'min-h-8 text-2xl leading-8 font-sap-font-light-family',
        inverted && [
            'min-h-4 px-1 py-[0.1875rem] text-sap-font-small-size leading-4 font-sap-font-bold-family',
            'border border-solid border-(--on-bc) bg-(--on-bg) rounded-sap-button-border-corner-radius',
            INVERTED[status ?? 'neutral']
        ],
        interactive && [
            'cursor-pointer focus:z-[5] focus:outline-none',
            'focus:after:pointer-events-none focus:after:absolute focus:after:content-[""]',
            'focus:after:border-(length:--sapContent_FocusWidth) focus:after:[border-style:var(--sapContent_FocusStyle)] focus:after:border-sap-content-focus-color',
            inverted
                ? [
                      'focus:after:-inset-0.5 focus:after:rounded-sap-button-border-corner-radius',
                      'hover:text-(--on-h-c) hover:bg-(--on-h-bg) hover:border-(--on-h-bc)',
                      'active:text-(--on-a-c) active:bg-(--on-a-bg) active:border-(--on-a-bc)'
                  ]
                : 'focus:after:-inset-[0.1875rem] focus:after:rounded-[0.25rem]'
        ],
        className
    );

    const content = (
        <>
            <span className={cn(partClass, !large && emphasized && 'font-bold')}>
                <bdi dir="ltr">{formatted}</bdi>
                {' '}
            </span>
            <span className={cn(partClass, 'font-sap-font-light-family')}>
                <bdi>{unit}</bdi>
            </span>
            {emphasized && <span className="sr-only-sap">{emphasizedText}</span>}
            {status && <span className="sr-only-sap">{statusMessage || STATUS_TEXT[status]}</span>}
        </>
    );

    if (interactive) {
        return (
            <BaseButton
                {...props}
                render={render ?? <span />}
                nativeButton={nativeButton ?? tag === 'button'}
                className={classes}
            >
                {content}
            </BaseButton>
        );
    }
    return (
        <PlainNumber {...props} render={render} className={classes}>
            {content}
        </PlainNumber>
    );
}

function PlainNumber({ render, ...props }: useRender.ComponentProps<'span'>) {
    return useRender({ render, defaultTagName: 'span', props });
}
