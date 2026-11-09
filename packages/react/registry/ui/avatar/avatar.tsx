/*
 * Port of fundamental-react (Avatar) and @fundamental-ngx/core (avatar) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import {
    useId,
    useRef,
    useState,
    type ComponentProps,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconFont } from '@/ui/icon/icon';

export type AvatarSize = 'xs' | 's' | 'sm' | 'm' | 'md' | 'l' | 'lg' | 'xl';
export type ColorAccent = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type IndicationColor = ColorAccent;
export type AvatarValueState = 'positive' | 'caution' | 'negative' | 'information';
export type AvatarImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

/** Accent colours: background, border, text and hover background of each SAP avatar palette. */
const ACCENT: Record<ColorAccent, string> = {
    1: '[--av-bg:var(--sapAvatar_1_Background)] [--av-border:var(--sapAvatar_1_BorderColor)] [--av-color:var(--sapAvatar_1_TextColor)] [--av-hover-bg:var(--sapAvatar_1_Hover_Background)]',
    2: '[--av-bg:var(--sapAvatar_2_Background)] [--av-border:var(--sapAvatar_2_BorderColor)] [--av-color:var(--sapAvatar_2_TextColor)] [--av-hover-bg:var(--sapAvatar_2_Hover_Background)]',
    3: '[--av-bg:var(--sapAvatar_3_Background)] [--av-border:var(--sapAvatar_3_BorderColor)] [--av-color:var(--sapAvatar_3_TextColor)] [--av-hover-bg:var(--sapAvatar_3_Hover_Background)]',
    4: '[--av-bg:var(--sapAvatar_4_Background)] [--av-border:var(--sapAvatar_4_BorderColor)] [--av-color:var(--sapAvatar_4_TextColor)] [--av-hover-bg:var(--sapAvatar_4_Hover_Background)]',
    5: '[--av-bg:var(--sapAvatar_5_Background)] [--av-border:var(--sapAvatar_5_BorderColor)] [--av-color:var(--sapAvatar_5_TextColor)] [--av-hover-bg:var(--sapAvatar_5_Hover_Background)]',
    6: '[--av-bg:var(--sapAvatar_6_Background)] [--av-border:var(--sapAvatar_6_BorderColor)] [--av-color:var(--sapAvatar_6_TextColor)] [--av-hover-bg:var(--sapAvatar_6_Hover_Background)]',
    7: '[--av-bg:var(--sapAvatar_7_Background)] [--av-border:var(--sapAvatar_7_BorderColor)] [--av-color:var(--sapAvatar_7_TextColor)] [--av-hover-bg:var(--sapAvatar_7_Hover_Background)]',
    8: '[--av-bg:var(--sapAvatar_8_Background)] [--av-border:var(--sapAvatar_8_BorderColor)] [--av-color:var(--sapAvatar_8_TextColor)] [--av-hover-bg:var(--sapAvatar_8_Hover_Background)]',
    9: '[--av-bg:var(--sapAvatar_9_Background)] [--av-border:var(--sapAvatar_9_BorderColor)] [--av-color:var(--sapAvatar_9_TextColor)] [--av-hover-bg:var(--sapAvatar_9_Hover_Background)]',
    10: '[--av-bg:var(--sapAvatar_10_Background)] [--av-border:var(--sapAvatar_10_BorderColor)] [--av-color:var(--sapAvatar_10_TextColor)] [--av-hover-bg:var(--sapAvatar_10_Hover_Background)]'
};

/** Indication colours, which also define active (pressed/toggled) colours. */
const INDICATION: Record<IndicationColor, string> = {
    1: '[--av-bg:var(--sapIndicationColor_1_Background)] [--av-border:var(--sapIndicationColor_1_BorderColor)] [--av-color:var(--sapIndicationColor_1_TextColor)] [--av-hover-bg:var(--sapIndicationColor_1_Hover_Background)] [--av-active-bg:var(--sapIndicationColor_1_Active_Background)] [--av-active-border:var(--sapIndicationColor_1_Active_BorderColor)] [--av-active-color:var(--sapIndicationColor_1_Active_TextColor)] [--av-active-hover-bg:var(--sapIndicationColor_1_Active_Background)] [--av-active-hover-border:var(--sapIndicationColor_1_Active_BorderColor)] [--av-active-hover-color:var(--sapIndicationColor_1_Active_TextColor)]',
    2: '[--av-bg:var(--sapIndicationColor_2_Background)] [--av-border:var(--sapIndicationColor_2_BorderColor)] [--av-color:var(--sapIndicationColor_2_TextColor)] [--av-hover-bg:var(--sapIndicationColor_2_Hover_Background)] [--av-active-bg:var(--sapIndicationColor_2_Active_Background)] [--av-active-border:var(--sapIndicationColor_2_Active_BorderColor)] [--av-active-color:var(--sapIndicationColor_2_Active_TextColor)] [--av-active-hover-bg:var(--sapIndicationColor_2_Active_Background)] [--av-active-hover-border:var(--sapIndicationColor_2_Active_BorderColor)] [--av-active-hover-color:var(--sapIndicationColor_2_Active_TextColor)]',
    3: '[--av-bg:var(--sapIndicationColor_3_Background)] [--av-border:var(--sapIndicationColor_3_BorderColor)] [--av-color:var(--sapIndicationColor_3_TextColor)] [--av-hover-bg:var(--sapIndicationColor_3_Hover_Background)] [--av-active-bg:var(--sapIndicationColor_3_Active_Background)] [--av-active-border:var(--sapIndicationColor_3_Active_BorderColor)] [--av-active-color:var(--sapIndicationColor_3_Active_TextColor)] [--av-active-hover-bg:var(--sapIndicationColor_3_Active_Background)] [--av-active-hover-border:var(--sapIndicationColor_3_Active_BorderColor)] [--av-active-hover-color:var(--sapIndicationColor_3_Active_TextColor)]',
    4: '[--av-bg:var(--sapIndicationColor_4_Background)] [--av-border:var(--sapIndicationColor_4_BorderColor)] [--av-color:var(--sapIndicationColor_4_TextColor)] [--av-hover-bg:var(--sapIndicationColor_4_Hover_Background)] [--av-active-bg:var(--sapIndicationColor_4_Active_Background)] [--av-active-border:var(--sapIndicationColor_4_Active_BorderColor)] [--av-active-color:var(--sapIndicationColor_4_Active_TextColor)] [--av-active-hover-bg:var(--sapIndicationColor_4_Active_Background)] [--av-active-hover-border:var(--sapIndicationColor_4_Active_BorderColor)] [--av-active-hover-color:var(--sapIndicationColor_4_Active_TextColor)]',
    5: '[--av-bg:var(--sapIndicationColor_5_Background)] [--av-border:var(--sapIndicationColor_5_BorderColor)] [--av-color:var(--sapIndicationColor_5_TextColor)] [--av-hover-bg:var(--sapIndicationColor_5_Hover_Background)] [--av-active-bg:var(--sapIndicationColor_5_Active_Background)] [--av-active-border:var(--sapIndicationColor_5_Active_BorderColor)] [--av-active-color:var(--sapIndicationColor_5_Active_TextColor)] [--av-active-hover-bg:var(--sapIndicationColor_5_Active_Background)] [--av-active-hover-border:var(--sapIndicationColor_5_Active_BorderColor)] [--av-active-hover-color:var(--sapIndicationColor_5_Active_TextColor)]',
    6: '[--av-bg:var(--sapIndicationColor_6_Background)] [--av-border:var(--sapIndicationColor_6_BorderColor)] [--av-color:var(--sapIndicationColor_6_TextColor)] [--av-hover-bg:var(--sapIndicationColor_6_Hover_Background)] [--av-active-bg:var(--sapIndicationColor_6_Active_Background)] [--av-active-border:var(--sapIndicationColor_6_Active_BorderColor)] [--av-active-color:var(--sapIndicationColor_6_Active_TextColor)] [--av-active-hover-bg:var(--sapIndicationColor_6_Active_Background)] [--av-active-hover-border:var(--sapIndicationColor_6_Active_BorderColor)] [--av-active-hover-color:var(--sapIndicationColor_6_Active_TextColor)]',
    7: '[--av-bg:var(--sapIndicationColor_7_Background)] [--av-border:var(--sapIndicationColor_7_BorderColor)] [--av-color:var(--sapIndicationColor_7_TextColor)] [--av-hover-bg:var(--sapIndicationColor_7_Hover_Background)] [--av-active-bg:var(--sapIndicationColor_7_Active_Background)] [--av-active-border:var(--sapIndicationColor_7_Active_BorderColor)] [--av-active-color:var(--sapIndicationColor_7_Active_TextColor)] [--av-active-hover-bg:var(--sapIndicationColor_7_Active_Background)] [--av-active-hover-border:var(--sapIndicationColor_7_Active_BorderColor)] [--av-active-hover-color:var(--sapIndicationColor_7_Active_TextColor)]',
    8: '[--av-bg:var(--sapIndicationColor_8_Background)] [--av-border:var(--sapIndicationColor_8_BorderColor)] [--av-color:var(--sapIndicationColor_8_TextColor)] [--av-hover-bg:var(--sapIndicationColor_8_Hover_Background)] [--av-active-bg:var(--sapIndicationColor_8_Active_Background)] [--av-active-border:var(--sapIndicationColor_8_Active_BorderColor)] [--av-active-color:var(--sapIndicationColor_8_Active_TextColor)] [--av-active-hover-bg:var(--sapIndicationColor_8_Active_Background)] [--av-active-hover-border:var(--sapIndicationColor_8_Active_BorderColor)] [--av-active-hover-color:var(--sapIndicationColor_8_Active_TextColor)]',
    9: '[--av-bg:var(--sapIndicationColor_9_Background)] [--av-border:var(--sapIndicationColor_9_BorderColor)] [--av-color:var(--sapIndicationColor_9_TextColor)] [--av-hover-bg:var(--sapIndicationColor_9_Hover_Background)] [--av-active-bg:var(--sapIndicationColor_9_Active_Background)] [--av-active-border:var(--sapIndicationColor_9_Active_BorderColor)] [--av-active-color:var(--sapIndicationColor_9_Active_TextColor)] [--av-active-hover-bg:var(--sapIndicationColor_9_Active_Background)] [--av-active-hover-border:var(--sapIndicationColor_9_Active_BorderColor)] [--av-active-hover-color:var(--sapIndicationColor_9_Active_TextColor)]',
    10: '[--av-bg:var(--sapIndicationColor_10_Background)] [--av-border:var(--sapIndicationColor_10_BorderColor)] [--av-color:var(--sapIndicationColor_10_TextColor)] [--av-hover-bg:var(--sapIndicationColor_10_Hover_Background)] [--av-active-bg:var(--sapIndicationColor_10_Active_Background)] [--av-active-border:var(--sapIndicationColor_10_Active_BorderColor)] [--av-active-color:var(--sapIndicationColor_10_Active_TextColor)] [--av-active-hover-bg:var(--sapIndicationColor_10_Active_Background)] [--av-active-hover-border:var(--sapIndicationColor_10_Active_BorderColor)] [--av-active-hover-color:var(--sapIndicationColor_10_Active_TextColor)]'
};

// leading-[normal] after the font size: tailwind-merge drops a line-height that comes before one
const SIZE: Record<AvatarSize, string> = {
    xs: 'size-8 min-w-8 max-w-8 min-h-8 max-h-8 text-[1rem] leading-[normal] [--av-zoom-size:1.125rem] [--av-zoom-font:0.75rem] [--av-zoom-offset:-0.125rem]',
    s: 'size-12 min-w-12 max-w-12 min-h-12 max-h-12 text-[1.125rem] leading-[normal] [--av-zoom-size:1.125rem] [--av-zoom-font:0.75rem] [--av-zoom-offset:-0.125rem]',
    sm: 'size-12 min-w-12 max-w-12 min-h-12 max-h-12 text-[1.125rem] leading-[normal] [--av-zoom-size:1.125rem] [--av-zoom-font:0.75rem] [--av-zoom-offset:-0.125rem]',
    m: 'size-16 min-w-16 max-w-16 min-h-16 max-h-16 text-[1.5rem] leading-[normal] [--av-zoom-size:1.125rem] [--av-zoom-font:0.75rem] [--av-zoom-offset:-0.125rem]',
    md: 'size-16 min-w-16 max-w-16 min-h-16 max-h-16 text-[1.5rem] leading-[normal] [--av-zoom-size:1.125rem] [--av-zoom-font:0.75rem] [--av-zoom-offset:-0.125rem]',
    l: 'size-20 min-w-20 max-w-20 min-h-20 max-h-20 text-[2.25rem] leading-[normal] [--av-zoom-size:1.25rem] [--av-zoom-font:0.875rem] [--av-zoom-offset:-0.1875rem]',
    lg: 'size-20 min-w-20 max-w-20 min-h-20 max-h-20 text-[2.25rem] leading-[normal] [--av-zoom-size:1.25rem] [--av-zoom-font:0.875rem] [--av-zoom-offset:-0.1875rem]',
    xl: 'size-28 min-w-28 max-w-28 min-h-28 max-h-28 text-[3rem] leading-[normal] [--av-zoom-size:1.75rem] [--av-zoom-font:1rem] [--av-zoom-offset:-0.25rem]'
};

const VALUE_STATE: Record<AvatarValueState, { glyph: string; className: string }> = {
    positive: {
        glyph: 'sys-enter-2',
        className: 'bg-sap-success-background border-sap-positive-text-color text-sap-positive-text-color'
    },
    caution: {
        glyph: 'warning',
        className: 'bg-sap-warning-background border-sap-critical-text-color text-sap-critical-text-color'
    },
    negative: {
        glyph: 'error',
        className: 'bg-sap-error-background border-sap-negative-text-color text-sap-negative-text-color'
    },
    information: {
        glyph: 'information',
        className: 'bg-sap-information-background border-sap-informative-text-color text-sap-informative-text-color'
    }
};

/** Letters of any script, for initials. */
const LETTERS = /^\p{L}+$/u;

/** Initials of up to three words, or null. */
export function avatarInitials(label: string | null | undefined): string | null {
    const words = (label ?? '').split(' ').filter(Boolean);
    if (!words.length || words.length > 3) return null;
    const initials = words.map((w) => [...w][0]).join('');
    return LETTERS.test(initials) ? initials : null;
}

export function randomColorAccent(): ColorAccent {
    return (Math.floor(Math.random() * 10) + 1) as ColorAccent;
}

/** Accent colour derived from a name, so the same person always gets the same colour. */
export function labelColorAccent(label: string): ColorAccent {
    let hash = 0;
    for (const char of label) hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
    return ((hash % 10) + 1) as ColorAccent;
}

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
    /** Name shown as initials (up to three words); also the accessible name unless `aria-label` is set. */
    label?: string | null;
    /** xs 2rem, s 3rem, m 4rem, l 5rem (default), xl 7rem; sm, md and lg are aliases of s, m and l. */
    size?: AvatarSize;
    /** Icon font of `glyph`. */
    font?: IconFont;
    /** Icon shown instead of initials, e.g. "employee". Give the avatar an `aria-label`. */
    glyph?: string | null;
    /** Icon of the small badge at the bottom-end corner, e.g. "edit"; makes the avatar a button. */
    zoomGlyph?: string | null;
    circle?: boolean;
    /** Hover and press styles without a click handler (e.g. for an avatar that opens a menu). */
    interactive?: boolean;
    /** Transparent background. */
    transparent?: boolean;
    /** Scales the image to fit (contain) instead of covering. */
    contain?: boolean;
    /** Image placeholder background. */
    placeholder?: boolean;
    /** Tile background, for avatars inside tiles. */
    tile?: boolean;
    border?: boolean;
    /** Accent colour 1-10 (6 by default). */
    colorAccent?: ColorAccent | null;
    /** Indication colour 1-10; used when no accent colour is set. */
    colorIndication?: IndicationColor | null;
    /** Picks an accent colour from the label (the same label always gets the same colour), else a random one. */
    random?: boolean;
    /** Makes the avatar a button (role, tabindex, Enter/Space) that calls `onAvatarClick`. */
    clickable?: boolean;
    /** Shows a value state badge instead of the zoom glyph. */
    valueState?: AvatarValueState | null;
    /** Image URL, shown as the background once it has loaded. */
    image?: string | null;
    /** Fallbacks when the image fails, in order, separated by `|`: "content", "alt", "backup", "default-icon". */
    alterIcon?: string | null;
    /** Image tried by the "backup" fallback. */
    backupImage?: string | null;
    /** Alternative text: the accessible name when there is no label, and the name behind the "alt" fallback. */
    alt?: string | null;
    /** Hidden; its text gives the initials of the "content" fallback. */
    children?: ReactNode;
    /** Click, Enter or Space on a `clickable` avatar. */
    onAvatarClick?: (event: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) => void;
    /** Click, Enter or Space on an avatar with a `zoomGlyph`. */
    onZoomGlyphClick?: () => void;
    /** Loading status of the current image (the `image`, then the `backupImage`). */
    onImageLoadingStatusChange?: (status: AvatarImageLoadingStatus) => void;
}

/** Fallback state of one image URL. */
interface Fallback {
    /** The `image` this state belongs to; a new image starts over. */
    image: string | null | undefined;
    /** The backup image is being tried. */
    backup: string | null;
    /** Initials from the content or alt text, and the text they came from. */
    initials: string | null;
    name: string | null;
    /** No more options: the person placeholder icon. */
    forceDefault: boolean;
}

const fresh = (image: string | null | undefined): Fallback => ({
    image,
    backup: null,
    initials: null,
    name: null,
    forceDefault: false
});

/**
 * Avatar: an image, initials or an icon representing a person, object or entity. Built on Base UI's Avatar, which
 * loads the image; the image is shown as the background of the avatar, as in fundamental-styles.
 *
 * When the image fails, `alterIcon` options ("content", "alt", "backup", "default-icon", separated by `|`) are tried
 * in order, then the person placeholder icon.
 *
 * ```tsx
 * <Avatar label="John Doe" colorAccent={3} circle />
 * <Avatar image="/photo.jpg" aria-label="John Doe" size="s" circle clickable onAvatarClick={open} />
 * ```
 */
export function Avatar({
    label,
    size = 'l',
    font = 'SAP-icons',
    glyph,
    zoomGlyph,
    circle = false,
    interactive = false,
    transparent = false,
    contain = false,
    placeholder = false,
    tile = false,
    border = false,
    colorAccent,
    colorIndication,
    random = false,
    clickable = false,
    valueState,
    image,
    alterIcon,
    backupImage,
    alt,
    children,
    onAvatarClick,
    onZoomGlyphClick,
    onImageLoadingStatusChange,
    id,
    role,
    tabIndex,
    className,
    style,
    onClick,
    onKeyDown,
    ...props
}: AvatarProps) {
    const autoId = `fd-avatar-${useId()}`;
    const contentRef = useRef<HTMLSpanElement>(null);
    const [randomAccent] = useState(randomColorAccent);
    const [state, setState] = useState<Fallback>(() => fresh(image));
    // a new image starts over, without the fallback of the previous one
    const fallback = state.image === image ? state : fresh(image);
    if (state !== fallback) setState(fallback);
    const source = fallback.forceDefault ? null : (fallback.backup ?? image ?? null);

    const fallbackInitials = fallback.initials ?? (fallback.forceDefault ? null : avatarInitials(label));
    const showDefault = fallback.forceDefault || (!fallbackInitials && !glyph && !image);
    const accessibleName = props['aria-label'] || label || fallback.name || alt || undefined;
    const button = clickable || !!zoomGlyph;

    const name = label || props['aria-label'];
    const accent = random ? (name ? labelColorAccent(name) : randomAccent) : colorAccent;
    const indication = !accent ? colorIndication : null;
    const resolvedTabIndex = tabIndex ?? (button ? 0 : undefined);
    const isInteractive = interactive || button || tabIndex === 0;

    const badgeGlyph = valueState ? VALUE_STATE[valueState].glyph : zoomGlyph;

    function takeInitials(text: string | null | undefined): boolean {
        const initials = avatarInitials(text?.trim());
        if (initials) setState({ ...fallback, initials, name: text!.trim() });
        return !!initials;
    }

    function onImageError() {
        if (fallback.backup) {
            setState({ ...fallback, forceDefault: true });
            return;
        }
        for (const option of (alterIcon ?? '').split('|')) {
            if (option === 'content' && takeInitials(contentRef.current?.textContent)) return;
            if (option === 'alt' && takeInitials(alt)) return;
            if (option === 'backup' && backupImage) {
                // a backup that is the failed image itself fails too
                setState(
                    backupImage === image ? { ...fallback, forceDefault: true } : { ...fallback, backup: backupImage }
                );
                return;
            }
            if (option === 'default-icon') break;
        }
        setState({ ...fallback, forceDefault: true });
    }

    function activate(event: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) {
        if (!button) return;
        event.preventDefault();
        if (clickable) onAvatarClick?.(event);
        if (zoomGlyph) onZoomGlyphClick?.();
    }

    return (
        <BaseAvatar.Root
            {...props}
            id={id ?? autoId}
            role={role ?? (button ? 'button' : accessibleName || props['aria-labelledby'] ? 'img' : 'presentation')}
            aria-label={accessibleName}
            tabIndex={resolvedTabIndex}
            onClick={(event) => {
                onClick?.(event);
                activate(event);
            }}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.key === 'Enter' || event.key === ' ') activate(event);
            }}
            // the image is the background once Base UI reports it loaded
            style={(rootState) => ({
                ...style,
                ...(source && rootState.imageLoadingStatus === 'loaded' && { backgroundImage: `url("${source}")` })
            })}
            className={(rootState) =>
                cn(
                    // defaults: accent 6, theme radius, interaction colours of buttons
                    '[--av-bg:var(--sapAvatar_6_Background)] [--av-border:var(--sapAvatar_6_BorderColor)] [--av-color:var(--sapAvatar_6_TextColor)]',
                    '[--av-hover-bg:var(--sapAvatar_6_Hover_Background)] [--av-hover-border:var(--sapAvatar_Hover_BorderColor)]',
                    '[--av-active-bg:var(--sapButton_Active_Background)] [--av-active-border:var(--sapButton_Active_BorderColor)] [--av-active-color:var(--sapButton_Active_TextColor)]',
                    '[--av-active-hover-bg:var(--sapButton_Selected_Hover_Background)] [--av-active-hover-border:var(--sapButton_Selected_Hover_BorderColor)] [--av-active-hover-color:var(--sapButton_Selected_TextColor)]',
                    '[--av-zoom-pos:var(--av-zoom-offset)]',
                    'relative box-border m-0 p-0 inline-flex shrink-0 items-center justify-center overflow-visible align-middle',
                    'font-sap-font-family font-normal [forced-color-adjust:none]',
                    'rounded-sap-element-border-corner-radius border border-solid border-(--av-border) bg-(--av-bg) text-(--av-color)',
                    'bg-center bg-no-repeat bg-cover',
                    // SAP focus: a frame outside the avatar
                    "focus:outline-none focus:z-[5] focus:after:pointer-events-none focus:after:absolute focus:after:-inset-[0.3125rem] focus:after:content-['']",
                    'focus:after:rounded-[0.9rem] hc:focus:after:rounded-none',
                    'focus:after:border-(length:--sapContent_FocusWidth) focus:after:[border-style:var(--sapContent_FocusStyle)] focus:after:border-sap-content-focus-color',
                    SIZE[size],
                    accent ? ACCENT[accent] : indication ? INDICATION[indication] : '',
                    // 100% as fundamental-styles (rounded-full is a huge length: same look, other computed value)
                    circle && 'rounded-[100%] focus:after:rounded-[100%] hc:focus:after:rounded-none [--av-zoom-pos:0]',
                    contain && 'bg-contain',
                    transparent &&
                        '[--av-bg:var(--sapAvatar_Lite_Background)] [--av-border:var(--sapAvatar_Lite_BorderColor)] [--av-color:var(--sapContent_IconColor)] [--av-hover-border:var(--sapContent_IconColor)] [--av-hover-bg:var(--sapAvatar_Lite_Background)]',
                    tile &&
                        '[--av-bg:var(--sapTile_Background)] [--av-border:var(--sapAvatar_Lite_BorderColor)] [--av-color:var(--sapTile_IconColor)] [--av-hover-border:var(--sapTile_IconColor)] [--av-hover-bg:var(--sapTile_Background)]',
                    placeholder &&
                        '[--av-bg:var(--sapContent_ImagePlaceholderBackground)] [--av-border:var(--sapAvatar_Lite_BorderColor)] [--av-color:var(--sapContent_ImagePlaceholderForegroundColor)] [--av-hover-border:var(--sapContent_ImagePlaceholderForegroundColor)] [--av-hover-bg:var(--sapContent_ImagePlaceholderBackground)]',
                    isInteractive && [
                        'cursor-pointer hover:bg-(--av-hover-bg) hover:border-(--av-hover-border)',
                        'active:bg-(--av-active-bg) active:border-(--av-active-border) active:text-(--av-active-color)',
                        'active:hover:bg-(--av-active-hover-bg) active:hover:border-(--av-active-hover-border) active:hover:text-(--av-active-hover-color)',
                        'toggled:bg-(--av-active-bg) toggled:border-(--av-active-border) toggled:text-(--av-active-color)',
                        'aria-disabled:opacity-(--sapContent_DisabledOpacity) focus:p-0.5'
                    ],
                    // a loaded image: the lite background and border (none in Horizon), as fundamental-styles' thumbnail
                    source &&
                        rootState.imageLoadingStatus === 'loaded' &&
                        '[--av-bg:var(--sapAvatar_Lite_Background)] [--av-border:var(--sapAvatar_Lite_BorderColor)]',
                    // last: a border wins over the transparent, tile, placeholder and loaded-image borders, as
                    // fundamental-styles' `fd-avatar--border` (also on thumbnails, e.g. in avatar groups)
                    border &&
                        '[--av-border:var(--sapGroup_ContentBorderColor)] [--av-hover-border:var(--sapAvatar_Hover_BorderColor)]',
                    className
                )
            }
        >
            {source && (
                <BaseAvatar.Image
                    src={source}
                    onLoadingStatusChange={(status) => {
                        onImageLoadingStatusChange?.(status);
                        if (status === 'error') onImageError();
                    }}
                    // nothing to render: the root paints the image
                    render={(imageProps) => <span ref={imageProps.ref} hidden />}
                />
            )}
            <BaseAvatar.Fallback className="contents">
                {fallbackInitials}
                {(glyph || showDefault) && (
                    <Icon
                        className="flex items-center justify-center text-[1em]"
                        font={font}
                        glyph={glyph || 'person-placeholder'}
                    />
                )}
            </BaseAvatar.Fallback>
            {badgeGlyph && (
                <Icon
                    glyph={badgeGlyph}
                    className={cn(
                        'absolute z-[5] flex items-center justify-center rounded-[100%] border border-solid',
                        'size-(--av-zoom-size) text-(length:--av-zoom-font) leading-none bottom-(--av-zoom-pos) end-(--av-zoom-pos)',
                        valueState
                            ? VALUE_STATE[valueState].className
                            : 'bg-sap-button-emphasized-background border-sap-button-emphasized-border-color text-sap-button-emphasized-text-color'
                    )}
                    // keeps the focus on the avatar; the click on it reaches the avatar
                    onMouseDown={(event) => {
                        event.preventDefault();
                        event.currentTarget.parentElement?.focus();
                    }}
                />
            )}
            {children != null && (
                <span ref={contentRef} className="hidden">
                    {children}
                </span>
            )}
        </BaseAvatar.Root>
    );
}
