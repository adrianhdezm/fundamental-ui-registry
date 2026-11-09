/*
 * Port of fundamental-react (Icon) and @fundamental-ngx/core (icon) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ComponentProps } from 'react';
import { cn, cva, type VariantProps } from '@/lib/utils';
import { SAP_ICONS, SAP_ICONS_BUSINESS_SUITE, SAP_ICONS_TNT, type IconGlyph } from './icon-glyphs';

export type IconFont = 'SAP-icons' | 'BusinessSuiteInAppSymbols' | 'SAP-icons-TNT';

const GLYPHS: Record<IconFont, Readonly<Record<string, IconGlyph>>> = {
    'SAP-icons': SAP_ICONS,
    BusinessSuiteInAppSymbols: SAP_ICONS_BUSINESS_SUITE,
    'SAP-icons-TNT': SAP_ICONS_TNT
};

export const iconVariants = cva(
    // a 1em box whatever the glyph's width, as fundamental-styles' icons
    'inline-flex shrink-0 items-center justify-center w-[1em] not-italic font-normal normal-case no-underline ' +
        'before:content-[attr(data-glyph)] before:text-center before:[text-rendering:optimizeLegibility]',
    {
        variants: {
            font: {
                'SAP-icons': 'before:font-sap-content-icon-font-family',
                BusinessSuiteInAppSymbols: "before:font-['SAP-icons-Business-Suite']",
                'SAP-icons-TNT': "before:font-['SAP-icons-TNT']"
            },
            // leading-none after the font size: tailwind-merge drops a line-height that comes before one
            size: {
                default: 'text-[1rem] leading-none',
                sm: 'text-[1rem] leading-none',
                md: 'text-[2rem] leading-none',
                lg: 'text-[3rem] leading-none',
                xl: 'text-[4rem] leading-none',
                xxl: 'text-[5rem] leading-none'
            },
            color: {
                inherit: 'text-inherit',
                default: 'text-sap-content-icon-color',
                contrast: 'text-sap-content-contrast-icon-color',
                'non-interactive': 'text-sap-content-non-interactive-icon-color',
                tile: 'text-sap-tile-icon-color',
                marker: 'text-sap-content-marker-icon-color',
                critical: 'text-sap-critical-element-color',
                negative: 'text-sap-negative-element-color',
                neutral: 'text-sap-neutral-element-color',
                positive: 'text-sap-positive-element-color',
                information: 'text-sap-informative-element-color'
            },
            background: {
                none: '',
                default: 'text-sap-group-content-background bg-sap-content-icon-color',
                contrast: 'text-sap-content-icon-color bg-sap-group-content-background',
                'non-interactive': 'text-sap-group-content-background bg-sap-content-non-interactive-icon-color',
                tile: 'text-sap-group-content-background bg-sap-tile-icon-color',
                marker: 'text-sap-group-content-background bg-sap-content-marker-icon-color',
                critical: 'text-sap-group-content-background bg-sap-critical-element-color',
                negative: 'text-sap-group-content-background bg-sap-negative-element-color',
                neutral: 'text-sap-group-content-background bg-sap-neutral-element-color',
                positive: 'text-sap-group-content-background bg-sap-positive-element-color',
                information: 'text-sap-group-content-background bg-sap-informative-element-color'
            },
            mirrored: {
                true: 'rtl:-scale-x-100',
                false: ''
            }
        },
        defaultVariants: { font: 'SAP-icons', size: 'default', color: 'inherit', background: 'none', mirrored: false }
    }
);

type IconVariants = VariantProps<typeof iconVariants>;
export type IconSize = NonNullable<IconVariants['size']>;
export type IconColor = NonNullable<IconVariants['color']>;
export type IconBackground = NonNullable<IconVariants['background']>;

/** Resolves a glyph name of an SAP icon font to its character, or '' if the font has no such glyph. */
export function iconGlyphChar(glyph: string | null | undefined, font: IconFont = 'SAP-icons'): string {
    const entry = glyph ? GLYPHS[font][glyph] : undefined;
    if (entry === undefined) return '';
    return String.fromCodePoint(typeof entry === 'number' ? entry : entry[0]);
}

export interface IconProps extends Omit<ComponentProps<'span'>, 'color' | 'children'> {
    /** Name of the glyph, e.g. "accept". See the Icon stories for the full list. */
    glyph?: string | null;
    /** Icon font the glyph comes from. */
    font?: IconFont;
    /** Semantic icon colour. Inherits the text colour by default. */
    color?: IconColor | null;
    /** Semantic background colour; also switches the glyph to the contrasting colour. */
    background?: IconBackground | null;
    /** Icon size: sm 1rem, md 2rem, lg 3rem, xl 4rem, xxl 5rem. */
    size?: IconSize | null;
}

/**
 * An icon from the SAP icon fonts.
 *
 * Decorative by default (aria-hidden). Give it an `aria-label` to expose it as an image.
 *
 * ```tsx
 * <Icon glyph="accept" />
 * <Icon glyph="exceptions" font="SAP-icons-TNT" color="negative" aria-label="Exceptions" />
 * ```
 */
export function Icon({ glyph, font = 'SAP-icons', color, background, size, className, ...props }: IconProps) {
    const entry = glyph ? GLYPHS[font][glyph] : undefined;
    const label = props['aria-label'];
    return (
        <span
            role={label ? 'img' : 'presentation'}
            aria-hidden={label ? undefined : true}
            {...props}
            data-glyph={iconGlyphChar(glyph, font) || undefined}
            className={cn(
                iconVariants({
                    font,
                    size: size ?? 'default',
                    color: color ?? 'inherit',
                    background: background ?? 'none',
                    mirrored: Array.isArray(entry)
                }),
                className
            )}
        />
    );
}
