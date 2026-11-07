/*
 * Port of fundamental-react (InfoLabel) and @fundamental-ngx/core (info-label) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconFont } from '@/ui/icon/icon';

export type InfoLabelColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type InfoLabelType = 'numeric' | 'icon';

/** Accent colours, from extensions.css (SAP avatar colours; a coloured palette in high contrast). */
const COLOR: Record<InfoLabelColor, string> = {
    1: '[--il-bg:var(--fdInfoLabel_Background_1)] [--il-c:var(--fdInfoLabel_Color_1)]',
    2: '[--il-bg:var(--fdInfoLabel_Background_2)] [--il-c:var(--fdInfoLabel_Color_2)]',
    3: '[--il-bg:var(--fdInfoLabel_Background_3)] [--il-c:var(--fdInfoLabel_Color_3)]',
    4: '[--il-bg:var(--fdInfoLabel_Background_4)] [--il-c:var(--fdInfoLabel_Color_4)]',
    5: '[--il-bg:var(--fdInfoLabel_Background_5)] [--il-c:var(--fdInfoLabel_Color_5)]',
    6: '[--il-bg:var(--fdInfoLabel_Background_6)] [--il-c:var(--fdInfoLabel_Color_6)]',
    7: '[--il-bg:var(--fdInfoLabel_Background_7)] [--il-c:var(--fdInfoLabel_Color_7)]',
    8: '[--il-bg:var(--fdInfoLabel_Background_8)] [--il-c:var(--fdInfoLabel_Color_8)]',
    9: '[--il-bg:var(--fdInfoLabel_Background_9)] [--il-c:var(--fdInfoLabel_Color_9)]',
    10: '[--il-bg:var(--fdInfoLabel_Background_10)] [--il-c:var(--fdInfoLabel_Color_10)]'
};

function validColor(color: InfoLabelProps['color']): InfoLabelColor {
    const n = Number(color ?? 7);
    return Number.isInteger(n) && n >= 1 && n <= 10 ? (n as InfoLabelColor) : 7;
}

export interface InfoLabelProps extends Omit<ComponentProps<'span'>, 'color'> {
    /** The label text. Leave it out for a glyph-only label (then give it an `aria-label`). */
    children?: ReactNode;
    /** "numeric" for counts, "icon" for icon labels; rendered as `data-type`. */
    type?: InfoLabelType | null;
    /** Glyph of an icon shown before the text. */
    glyph?: string | null;
    /** Icon font the glyph comes from. */
    font?: IconFont;
    /** Accent colour 1–10 (default 7); other values fall back to 7. */
    color?: InfoLabelColor | `${InfoLabelColor}` | null;
    /** Smaller variant for display contexts such as tables. */
    display?: boolean;
    /** Hidden text that tells screen reader users what the label is. Empty for none. */
    srText?: string;
}

/**
 * Info label: a small coloured label for a status, category or count that is not interactive. Renders a `<span>`.
 *
 * `aria-label` and `aria-labelledby` name the text (or, without text, the icon, which then becomes an image), not
 * the root `<span>`.
 *
 * ```tsx
 * <InfoLabel color={8}>In stock</InfoLabel>
 * <InfoLabel type="icon" glyph="employee">Owner</InfoLabel>
 * <InfoLabel type="numeric" title="Users">42k</InfoLabel>
 * <InfoLabel glyph="employee" aria-label="Employee" />
 * ```
 */
export function InfoLabel({
    type,
    glyph,
    font = 'SAP-icons',
    color = 7,
    display = false,
    srText = 'Info Label',
    className,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...props
}: InfoLabelProps) {
    const hasText = children != null && children !== false && children !== '';
    return (
        <span
            data-type={type ?? undefined}
            {...props}
            className={cn(
                // on the baseline as in fundamental-styles (Angular's align-middle moves inline labels down)
                'm-0 box-border inline-flex w-auto items-center gap-1 px-1.5 py-0',
                '[--il-h:1.375rem] [--il-icon:0.75rem] [--il-font:var(--sapFontSize)] h-(--il-h) rounded-[0.25rem]',
                'font-sap-font-family font-normal text-sap-font-size leading-[normal] border border-solid border-(--il-bg) bg-(--il-bg) text-(--il-c) [forced-color-adjust:none]',
                COLOR[validColor(color)],
                display &&
                    'gap-0.5 px-1 rounded-[0.1875rem] [--il-h:1rem] [--il-icon:0.625rem] [--il-font:var(--sapFontSmallSize)]',
                className
            )}
        >
            {glyph && (
                <Icon
                    glyph={glyph}
                    font={font}
                    aria-label={hasText ? undefined : ariaLabel || undefined}
                    // as wide as the glyph, not 1em: fundamental-styles' info label icon has no fixed width
                    className="h-(--il-h) w-auto text-(length:--il-icon) leading-(--il-h) text-inherit"
                />
            )}
            {hasText && (
                <span
                    className="m-0 p-0 font-sap-font-semibold-duplex-family font-normal text-(length:--il-font) leading-[normal] text-inherit"
                    aria-label={ariaLabel || undefined}
                    aria-labelledby={ariaLabelledBy || undefined}
                >
                    {children}
                </span>
            )}
            {srText && <span className="sr-only-sap">{srText}</span>}
        </span>
    );
}
