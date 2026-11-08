/*
 * Port of @fundamental-ngx/core (card) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button as BaseButton } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import {
    Children,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ElementType,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/ui/avatar/avatar';
import { ObjectStatus, type IndicationColor, type ObjectStatusType } from '@/ui/object-status/object-status';

export type CardType =
    'standard' | 'component' | 'analytical' | 'list' | 'table' | 'object' | 'quickView' | 'linkList' | 'banner';
export type CardKpiStatus = 'positive' | 'negative' | 'critical' | 'informative';
/** Shell category colour 1-16. */
export type CardShellColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
/** Legend colour 1-20. */
export type CardLegendColor = CardShellColor | 17 | 18 | 19 | 20;

const TEXT_STATUS: Record<CardKpiStatus | 'neutral', string> = {
    neutral: 'text-sap-neutral-text-color',
    positive: 'text-sap-positive-text-color',
    negative: 'text-sap-negative-text-color',
    critical: 'text-sap-critical-text-color',
    informative: 'text-sap-informative-text-color'
};

/** Media background (--cm-bg), heading (--cm-hc, --cm-hs) and text (--cm-tc) colours per shell category. */
const SHELL_COLOR: Record<CardShellColor, string> = {
    1: '[--cm-bg:var(--sapShell_Category_1_Background)] [--cm-hc:var(--sapShell_Category_1_TextColor)] [--cm-hs:var(--sapShell_Category_1_TextShadow)] [--cm-tc:var(--sapShell_Category_1_TextColor)] [--cm-cbg:transparent]',
    2: '[--cm-bg:var(--sapShell_Category_2_Background)] [--cm-hc:var(--sapShell_Category_2_TextColor)] [--cm-hs:var(--sapShell_Category_2_TextShadow)] [--cm-tc:var(--sapShell_Category_2_TextColor)] [--cm-cbg:transparent]',
    3: '[--cm-bg:var(--sapShell_Category_3_Background)] [--cm-hc:var(--sapShell_Category_3_TextColor)] [--cm-hs:var(--sapShell_Category_3_TextShadow)] [--cm-tc:var(--sapShell_Category_3_TextColor)] [--cm-cbg:transparent]',
    4: '[--cm-bg:var(--sapShell_Category_4_Background)] [--cm-hc:var(--sapShell_Category_4_TextColor)] [--cm-hs:var(--sapShell_Category_4_TextShadow)] [--cm-tc:var(--sapShell_Category_4_TextColor)] [--cm-cbg:transparent]',
    5: '[--cm-bg:var(--sapShell_Category_5_Background)] [--cm-hc:var(--sapShell_Category_5_TextColor)] [--cm-hs:var(--sapShell_Category_5_TextShadow)] [--cm-tc:var(--sapShell_Category_5_TextColor)] [--cm-cbg:transparent]',
    6: '[--cm-bg:var(--sapShell_Category_6_Background)] [--cm-hc:var(--sapShell_Category_6_TextColor)] [--cm-hs:var(--sapShell_Category_6_TextShadow)] [--cm-tc:var(--sapShell_Category_6_TextColor)] [--cm-cbg:transparent]',
    7: '[--cm-bg:var(--sapShell_Category_7_Background)] [--cm-hc:var(--sapShell_Category_7_TextColor)] [--cm-hs:var(--sapShell_Category_7_TextShadow)] [--cm-tc:var(--sapShell_Category_7_TextColor)] [--cm-cbg:transparent]',
    8: '[--cm-bg:var(--sapShell_Category_8_Background)] [--cm-hc:var(--sapShell_Category_8_TextColor)] [--cm-hs:var(--sapShell_Category_8_TextShadow)] [--cm-tc:var(--sapShell_Category_8_TextColor)] [--cm-cbg:transparent]',
    9: '[--cm-bg:var(--sapShell_Category_9_Background)] [--cm-hc:var(--sapShell_Category_9_TextColor)] [--cm-hs:var(--sapShell_Category_9_TextShadow)] [--cm-tc:var(--sapShell_Category_9_TextColor)] [--cm-cbg:transparent]',
    10: '[--cm-bg:var(--sapShell_Category_10_Background)] [--cm-hc:var(--sapShell_Category_10_TextColor)] [--cm-hs:var(--sapShell_Category_10_TextShadow)] [--cm-tc:var(--sapShell_Category_10_TextColor)] [--cm-cbg:transparent]',
    11: '[--cm-bg:var(--sapShell_Category_11_Background)] [--cm-hc:var(--sapShell_Category_11_TextColor)] [--cm-hs:var(--sapShell_Category_11_TextShadow)] [--cm-tc:var(--sapShell_Category_11_TextColor)] [--cm-cbg:transparent]',
    12: '[--cm-bg:var(--sapShell_Category_12_Background)] [--cm-hc:var(--sapShell_Category_12_TextColor)] [--cm-hs:var(--sapShell_Category_12_TextShadow)] [--cm-tc:var(--sapShell_Category_12_TextColor)] [--cm-cbg:transparent]',
    13: '[--cm-bg:var(--sapShell_Category_13_Background)] [--cm-hc:var(--sapShell_Category_13_TextColor)] [--cm-hs:var(--sapShell_Category_13_TextShadow)] [--cm-tc:var(--sapShell_Category_13_TextColor)] [--cm-cbg:transparent]',
    14: '[--cm-bg:var(--sapShell_Category_14_Background)] [--cm-hc:var(--sapShell_Category_14_TextColor)] [--cm-hs:var(--sapShell_Category_14_TextShadow)] [--cm-tc:var(--sapShell_Category_14_TextColor)] [--cm-cbg:transparent]',
    15: '[--cm-bg:var(--sapShell_Category_15_Background)] [--cm-hc:var(--sapShell_Category_15_TextColor)] [--cm-hs:var(--sapShell_Category_15_TextShadow)] [--cm-tc:var(--sapShell_Category_15_TextColor)] [--cm-cbg:transparent]',
    16: '[--cm-bg:var(--sapShell_Category_16_Background)] [--cm-hc:var(--sapShell_Category_16_TextColor)] [--cm-hs:var(--sapShell_Category_16_TextShadow)] [--cm-tc:var(--sapShell_Category_16_TextColor)] [--cm-cbg:transparent]'
};
/** Media colours per legend colour. */
const LEGEND_COLOR: Record<CardLegendColor, string> = {
    1: '[--cm-bg:var(--sapLegendBackgroundColor1)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    2: '[--cm-bg:var(--sapLegendBackgroundColor2)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    3: '[--cm-bg:var(--sapLegendBackgroundColor3)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    4: '[--cm-bg:var(--sapLegendBackgroundColor4)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    5: '[--cm-bg:var(--sapLegendBackgroundColor5)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    6: '[--cm-bg:var(--sapLegendBackgroundColor6)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    7: '[--cm-bg:var(--sapLegendBackgroundColor7)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    8: '[--cm-bg:var(--sapLegendBackgroundColor8)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    9: '[--cm-bg:var(--sapLegendBackgroundColor9)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    10: '[--cm-bg:var(--sapLegendBackgroundColor10)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    11: '[--cm-bg:var(--sapLegendBackgroundColor11)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    12: '[--cm-bg:var(--sapLegendBackgroundColor12)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    13: '[--cm-bg:var(--sapLegendBackgroundColor13)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    14: '[--cm-bg:var(--sapLegendBackgroundColor14)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    15: '[--cm-bg:var(--sapLegendBackgroundColor15)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    16: '[--cm-bg:var(--sapLegendBackgroundColor16)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    17: '[--cm-bg:var(--sapLegendBackgroundColor17)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    18: '[--cm-bg:var(--sapLegendBackgroundColor18)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    19: '[--cm-bg:var(--sapLegendBackgroundColor19)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]',
    20: '[--cm-bg:var(--sapLegendBackgroundColor20)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none] [--cm-cbg:transparent]'
};
/** The same colours on a content container (e.g. over an image). */
const CONTAINER_SHELL_COLOR: Record<CardShellColor, string> = {
    1: '[--cm-cbg:var(--sapShell_Category_1_Background)] [--cm-hc:var(--sapShell_Category_1_TextColor)] [--cm-hs:var(--sapShell_Category_1_TextShadow)] [--cm-tc:var(--sapShell_Category_1_TextColor)]',
    2: '[--cm-cbg:var(--sapShell_Category_2_Background)] [--cm-hc:var(--sapShell_Category_2_TextColor)] [--cm-hs:var(--sapShell_Category_2_TextShadow)] [--cm-tc:var(--sapShell_Category_2_TextColor)]',
    3: '[--cm-cbg:var(--sapShell_Category_3_Background)] [--cm-hc:var(--sapShell_Category_3_TextColor)] [--cm-hs:var(--sapShell_Category_3_TextShadow)] [--cm-tc:var(--sapShell_Category_3_TextColor)]',
    4: '[--cm-cbg:var(--sapShell_Category_4_Background)] [--cm-hc:var(--sapShell_Category_4_TextColor)] [--cm-hs:var(--sapShell_Category_4_TextShadow)] [--cm-tc:var(--sapShell_Category_4_TextColor)]',
    5: '[--cm-cbg:var(--sapShell_Category_5_Background)] [--cm-hc:var(--sapShell_Category_5_TextColor)] [--cm-hs:var(--sapShell_Category_5_TextShadow)] [--cm-tc:var(--sapShell_Category_5_TextColor)]',
    6: '[--cm-cbg:var(--sapShell_Category_6_Background)] [--cm-hc:var(--sapShell_Category_6_TextColor)] [--cm-hs:var(--sapShell_Category_6_TextShadow)] [--cm-tc:var(--sapShell_Category_6_TextColor)]',
    7: '[--cm-cbg:var(--sapShell_Category_7_Background)] [--cm-hc:var(--sapShell_Category_7_TextColor)] [--cm-hs:var(--sapShell_Category_7_TextShadow)] [--cm-tc:var(--sapShell_Category_7_TextColor)]',
    8: '[--cm-cbg:var(--sapShell_Category_8_Background)] [--cm-hc:var(--sapShell_Category_8_TextColor)] [--cm-hs:var(--sapShell_Category_8_TextShadow)] [--cm-tc:var(--sapShell_Category_8_TextColor)]',
    9: '[--cm-cbg:var(--sapShell_Category_9_Background)] [--cm-hc:var(--sapShell_Category_9_TextColor)] [--cm-hs:var(--sapShell_Category_9_TextShadow)] [--cm-tc:var(--sapShell_Category_9_TextColor)]',
    10: '[--cm-cbg:var(--sapShell_Category_10_Background)] [--cm-hc:var(--sapShell_Category_10_TextColor)] [--cm-hs:var(--sapShell_Category_10_TextShadow)] [--cm-tc:var(--sapShell_Category_10_TextColor)]',
    11: '[--cm-cbg:var(--sapShell_Category_11_Background)] [--cm-hc:var(--sapShell_Category_11_TextColor)] [--cm-hs:var(--sapShell_Category_11_TextShadow)] [--cm-tc:var(--sapShell_Category_11_TextColor)]',
    12: '[--cm-cbg:var(--sapShell_Category_12_Background)] [--cm-hc:var(--sapShell_Category_12_TextColor)] [--cm-hs:var(--sapShell_Category_12_TextShadow)] [--cm-tc:var(--sapShell_Category_12_TextColor)]',
    13: '[--cm-cbg:var(--sapShell_Category_13_Background)] [--cm-hc:var(--sapShell_Category_13_TextColor)] [--cm-hs:var(--sapShell_Category_13_TextShadow)] [--cm-tc:var(--sapShell_Category_13_TextColor)]',
    14: '[--cm-cbg:var(--sapShell_Category_14_Background)] [--cm-hc:var(--sapShell_Category_14_TextColor)] [--cm-hs:var(--sapShell_Category_14_TextShadow)] [--cm-tc:var(--sapShell_Category_14_TextColor)]',
    15: '[--cm-cbg:var(--sapShell_Category_15_Background)] [--cm-hc:var(--sapShell_Category_15_TextColor)] [--cm-hs:var(--sapShell_Category_15_TextShadow)] [--cm-tc:var(--sapShell_Category_15_TextColor)]',
    16: '[--cm-cbg:var(--sapShell_Category_16_Background)] [--cm-hc:var(--sapShell_Category_16_TextColor)] [--cm-hs:var(--sapShell_Category_16_TextShadow)] [--cm-tc:var(--sapShell_Category_16_TextColor)]'
};
const CONTAINER_LEGEND_COLOR: Record<CardLegendColor, string> = {
    1: '[--cm-cbg:var(--sapLegendBackgroundColor1)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    2: '[--cm-cbg:var(--sapLegendBackgroundColor2)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    3: '[--cm-cbg:var(--sapLegendBackgroundColor3)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    4: '[--cm-cbg:var(--sapLegendBackgroundColor4)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    5: '[--cm-cbg:var(--sapLegendBackgroundColor5)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    6: '[--cm-cbg:var(--sapLegendBackgroundColor6)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    7: '[--cm-cbg:var(--sapLegendBackgroundColor7)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    8: '[--cm-cbg:var(--sapLegendBackgroundColor8)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    9: '[--cm-cbg:var(--sapLegendBackgroundColor9)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    10: '[--cm-cbg:var(--sapLegendBackgroundColor10)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    11: '[--cm-cbg:var(--sapLegendBackgroundColor11)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    12: '[--cm-cbg:var(--sapLegendBackgroundColor12)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    13: '[--cm-cbg:var(--sapLegendBackgroundColor13)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    14: '[--cm-cbg:var(--sapLegendBackgroundColor14)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    15: '[--cm-cbg:var(--sapLegendBackgroundColor15)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    16: '[--cm-cbg:var(--sapLegendBackgroundColor16)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    17: '[--cm-cbg:var(--sapLegendBackgroundColor17)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    18: '[--cm-cbg:var(--sapLegendBackgroundColor18)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    19: '[--cm-cbg:var(--sapLegendBackgroundColor19)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]',
    20: '[--cm-cbg:var(--sapLegendBackgroundColor20)] [--cm-hc:var(--sapTextColor)] [--cm-tc:var(--sapTextColor)] [--cm-hs:none]'
};

/** Inner focus frame of interactive card areas. */
const FAKE_OUTLINE = [
    "focus:outline-none focus:before:pointer-events-none focus:before:absolute focus:before:inset-px focus:before:z-[3] focus:before:block focus:before:content-['']",
    'focus:before:rounded-(--card-fr) focus:before:border-(length:--sapContent_FocusWidth) focus:before:[border-style:var(--sapContent_FocusStyle)] focus:before:border-sap-content-focus-color'
];

/** Rounded top and bottom corners of card parts depending on their position (badges come first). */
const PART_CORNERS =
    'first:rounded-t-(--card-r) last:rounded-b-(--card-r) [[data-card-badges]+&]:rounded-t-(--card-r) first:[--card-fr:var(--card-r)_var(--card-r)_0_0] last:[--card-fr:0_0_var(--card-r)_var(--card-r)] only:[--card-fr:var(--card-r)]';

const BADGE_CLASS = 'max-w-full min-h-[0.875rem] rounded-lg px-1 py-0 [&>span]:truncate';

/**
 * Sorts the direct children whose component is one of `slots` into those slots, as the Angular templates project
 * their content; `rest` holds the other children in their order.
 */
function slotted<K extends string>(
    children: ReactNode,
    slots: Record<K, ElementType>
): Record<K, ReactNode[]> & { rest: ReactNode[] } {
    const out: Record<string, ReactNode[]> = { rest: [] };
    const entries = Object.entries(slots) as [K, ElementType][];
    for (const [key] of entries) out[key] = [];
    for (const child of Children.toArray(children)) {
        const match = isValidElement(child) ? entries.find(([, type]) => type === child.type) : undefined;
        out[match ? match[0] : 'rest'].push(child);
    }
    return out as Record<K, ReactNode[]> & { rest: ReactNode[] };
}

const has = (nodes: ReactNode[]) => nodes.length > 0;

/* ------------------------------------------------------------------------------------------------------------ */
/* Contexts                                                                                                      */
/* ------------------------------------------------------------------------------------------------------------ */

/** Parts whose ids name (title, media heading) or describe (subtitles, counter) the card. */
export type CardPart = 'title' | 'mediaHeading' | 'subtitle' | 'secondSubtitle' | 'counter';

/** What the parts of a card read from it (Angular injects the parent `Card`). */
export interface CardContextValue {
    id: string;
    cardType: CardType;
    role: string;
    /** Registers the id of a part for the card's aria-labelledby/aria-describedby; returns the unregister call. */
    registerPart: (part: CardPart, id: string) => () => void;
}

const CardContext = createContext<CardContextValue | null>(null);

/** The card a part is in, or null outside a card. */
export function useCard(): CardContextValue | null {
    return useContext(CardContext);
}

/** Registers a part's id with the enclosing card while it is mounted. */
function useCardPart(part: CardPart, id: string) {
    const register = useContext(CardContext)?.registerPart;
    useLayoutEffect(() => register?.(part, id), [register, part, id]);
}

interface CardListContextValue {
    registerCard: (element: HTMLElement) => () => void;
}

const CardListContext = createContext<CardListContextValue | null>(null);

/* ------------------------------------------------------------------------------------------------------------ */
/* Card                                                                                                          */
/* ------------------------------------------------------------------------------------------------------------ */

export interface CardProps extends useRender.ComponentProps<'div'> {
    /** The kind of card: sets the default role description ("List Card") and type-specific layout. */
    cardType?: CardType;
    /** Loading state: shows the `CardLoader` children instead of the card content. */
    isLoading?: boolean;
    /** `region` by default; `button` or `listitem` make the whole card interactive and focusable. */
    role?: string;
    /** Hover, pressed and focus states on the whole card. */
    interactive?: boolean;
    /** Selected state (visual, `data-selected`; list item cards cannot expose it to assistive technology). */
    selected?: boolean;
    /** Text of the first badge, at the top end corner. */
    badge?: string | null;
    /** Icon of the first badge. */
    badgeIcon?: string | null;
    /** Indication colour 1-10 of the first badge. */
    badgeColor?: IndicationColor | null;
    /** The secondary set of indication colours for the first badge. */
    badgeColorSecondary?: boolean;
    /** Semantic status of the first badge, instead of an indication colour. */
    badgeStatus?: ObjectStatusType | null;
    /** Accessible name of the first badge (e.g. for an icon-only badge). */
    badgeAriaLabel?: string | null;
    secondBadge?: string | null;
    secondBadgeIcon?: string | null;
    secondBadgeColor?: IndicationColor | null;
    secondBadgeColorSecondary?: boolean;
    secondBadgeStatus?: ObjectStatusType | null;
    secondBadgeAriaLabel?: string | null;
}

/**
 * Card: a container for a header (title, subtitle, avatar, counter, KPI), content and footer, with up to two badges
 * on its top edge. The footer is placed last whatever the order of the children. Cards with role `button` or
 * `listitem` (in a `CardList`) are interactive: focusable, with hover, pressed, focus and selected states.
 *
 * The card is a `region` labelled by its `CardTitle` (or `CardMediaHeading`) and described by its subtitles,
 * counter and badges.
 *
 * ```tsx
 * <Card badge="New" badgeColor={6}>
 *     <CardHeader>
 *         <CardMainHeader><CardTitle>Orders</CardTitle><CardSubtitle>Open</CardSubtitle></CardMainHeader>
 *     </CardHeader>
 *     <CardContent>...</CardContent>
 * </Card>
 * ```
 */
export function Card({
    cardType = 'standard',
    isLoading = false,
    role = 'region',
    interactive = false,
    selected = false,
    badge,
    badgeIcon,
    badgeColor,
    badgeColorSecondary = false,
    badgeStatus,
    badgeAriaLabel,
    secondBadge,
    secondBadgeIcon,
    secondBadgeColor,
    secondBadgeColorSecondary = false,
    secondBadgeStatus,
    secondBadgeAriaLabel,
    id: idProp,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-roledescription': ariaRoledescription,
    'aria-description': ariaDescription,
    'aria-posinset': ariaPosinset,
    'aria-setsize': ariaSetsize,
    tabIndex,
    ref,
    render,
    className,
    children,
    ...props
}: CardProps) {
    const autoId = useId();
    const id = idProp ?? `fd-card-${autoId}`;
    const [parts, setParts] = useState<Partial<Record<CardPart, string[]>>>({});
    const registerPart = useCallback((part: CardPart, partId: string) => {
        setParts((prev) => ({ ...prev, [part]: [...(prev[part] ?? []), partId] }));
        return () =>
            setParts((prev) => {
                const list = [...(prev[part] ?? [])];
                list.splice(list.indexOf(partId), 1);
                return { ...prev, [part]: list };
            });
    }, []);
    const context = useMemo(() => ({ id, cardType, role, registerPart }), [id, cardType, role, registerPart]);

    // register with a CardList for its arrow-key navigation
    const list = useContext(CardListContext);
    const element = useRef<HTMLDivElement>(null);
    const registerCard = list?.registerCard;
    useLayoutEffect(
        () => (registerCard && element.current ? registerCard(element.current) : undefined),
        [registerCard]
    );

    const first = (part: CardPart) => parts[part]?.[0];
    const hasBadge = !!(badge || badgeIcon);
    const hasSecondBadge = !!(secondBadge || secondBadgeIcon);
    const listItem = role === 'listitem';
    const isInteractive = interactive || listItem || role === 'button';
    const describedBy =
        [
            first('subtitle'),
            first('secondSubtitle'),
            first('counter'),
            !isLoading && hasBadge && `${id}-badge`,
            !isLoading && hasSecondBadge && `${id}-second-badge`,
            ariaDescribedby
        ]
            .filter(Boolean)
            .join(' ') || undefined;

    const { loader, footer, rest } = slotted(children, { loader: CardLoader, footer: CardFooter });

    const element_ = useRender({
        render,
        defaultTagName: 'div',
        ref: ref ? [ref, element] : element,
        props: {
            ...props,
            id,
            role,
            'aria-label': ariaLabel,
            'aria-labelledby': ariaLabel ? undefined : (ariaLabelledby ?? first('title') ?? first('mediaHeading')),
            'aria-describedby': describedBy,
            'aria-roledescription':
                ariaRoledescription || `${cardType.charAt(0).toUpperCase()}${cardType.slice(1)} Card`,
            'aria-description': listItem ? ariaDescription || 'Active, Press Enter to activate' : ariaDescription,
            'aria-posinset': listItem ? ariaPosinset : undefined,
            'aria-setsize': listItem ? ariaSetsize : undefined,
            tabIndex: tabIndex ?? (listItem || role === 'button' ? 0 : -1),
            'data-selected': selected ? '' : undefined,
            className: cn(
                'relative m-0 box-border flex min-h-full w-full flex-1 flex-col p-0 font-sap-font-family text-sap-font-size',
                'rounded-(--card-r) border border-solid border-(--card-bc) bg-(--card-bg) [box-shadow:var(--card-shadow)]',
                '[--card-r:var(--sapTile_BorderCornerRadius)] [--card-fr:var(--card-r)] [--card-bc:var(--sapTile_BorderColor)] [--card-bg:var(--sapTile_Background)]',
                '[--card-shadow:var(--sapContent_Shadow0)] hc:[--card-shadow:none] [--card-hts:0.25rem] compact:[--card-hts:0.5rem]',
                // media defaults, overridden by media colours and banner layout
                '[--cm-hc:var(--sapTile_TitleTextColor)] [--cm-tc:var(--sapTile_TextColor)] [--cm-hs:none] [--cm-cbg:var(--sapTile_Background)]',
                '[--cm-iw:100%] [--cm-ih:100%] [--cm-cw:100%] [--cm-ch:100%] [--cm-cp:1rem] [--cm-ir:0]',
                isInteractive && [
                    'cursor-pointer',
                    'enabled-hover:[--card-bg:var(--sapTile_Hover_Background)] enabled-hover:[--card-shadow:var(--sapContent_Shadow2)] hc:enabled-hover:[--card-shadow:none]',
                    'active:[--card-bg:var(--sapTile_Active_Background)] active:[--card-shadow:none] active:[--card-bc:var(--sapTile_Interactive_BorderColor)]',
                    FAKE_OUTLINE,
                    "data-selected:before:pointer-events-none data-selected:before:absolute data-selected:before:inset-px data-selected:before:z-[3] data-selected:before:rounded-(--card-r) data-selected:before:content-['']",
                    'data-selected:before:border-(length:--sapContent_FocusWidth) data-selected:before:[border-style:var(--sapContent_FocusStyle)] data-selected:before:border-sap-content-focus-color'
                ],
                // banners keep their shadow (a 1px ring in the high contrast themes)
                cardType === 'banner' && 'h-full hc:[--card-shadow:var(--sapContent_Shadow0)]',
                className
            ),
            children: isLoading ? (
                loader
            ) : (
                <>
                    {(hasBadge || hasSecondBadge) && (
                        <div
                            data-card-badges=""
                            className="absolute -top-2 end-2 z-10 m-0 flex max-w-[calc(100%_-_1rem)] min-w-[1.375rem] items-center gap-1 p-0"
                        >
                            {hasBadge && (
                                <ObjectStatus
                                    inverted
                                    className={BADGE_CLASS}
                                    id={`${id}-badge`}
                                    glyph={badgeIcon}
                                    status={badgeStatus}
                                    indicationColor={badgeColor}
                                    secondaryIndication={badgeColorSecondary}
                                    label={badge || undefined}
                                    aria-label={badgeAriaLabel || undefined}
                                />
                            )}
                            {hasSecondBadge && (
                                <ObjectStatus
                                    inverted
                                    className={BADGE_CLASS}
                                    id={`${id}-second-badge`}
                                    glyph={secondBadgeIcon}
                                    status={secondBadgeStatus}
                                    indicationColor={secondBadgeColor}
                                    secondaryIndication={secondBadgeColorSecondary}
                                    label={secondBadge || undefined}
                                    aria-label={secondBadgeAriaLabel || undefined}
                                />
                            )}
                        </div>
                    )}
                    {rest}
                    {footer}
                </>
            )
        }
    });
    return <CardContext.Provider value={context}>{element_}</CardContext.Provider>;
}

/* ------------------------------------------------------------------------------------------------------------ */
/* Header                                                                                                        */
/* ------------------------------------------------------------------------------------------------------------ */

export type CardHeaderProps = useRender.ComponentProps<'div'>;

/** Header area of a card, above or below the content: a `group` described as "Card Header". */
export function CardHeader({ render, className, ...props }: CardHeaderProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            role: 'group',
            'aria-roledescription': 'Card Header',
            ...props,
            className: cn(`group/ch m-0 block overflow-hidden p-0 ${PART_CORNERS}`, className)
        }
    });
}

export interface CardHeaderActionProps {
    children?: ReactNode;
}

/**
 * Marks its children (e.g. an overflow `Button`) as header actions: `CardMainHeader` places them at the end, above
 * the counter. Renders no element of its own.
 */
export function CardHeaderAction({ children }: CardHeaderActionProps) {
    return <>{children}</>;
}

export interface CardMainHeaderProps extends Omit<useRender.ComponentProps<'div'>, 'title'> {
    /** The header area (avatar, title, subtitles, KPI) is a button that navigates or acts. */
    interactive?: boolean;
    /** Description and tooltip of the interactive header area. */
    title?: string;
    /** Called when the interactive header area is activated: a click, Enter or Space. */
    onAction?: (event: MouseEvent<HTMLElement>) => void;
}

/**
 * Main header: the `Avatar`, `CardTitle`, `CardSubtitle`, `CardKpiHeader` and `CardSecondSubtitle` children go in
 * the text area, in that order; `CardHeaderAction` and `CardCounter` children at the end. Other children follow.
 * With `interactive`, the text area is a button (Base UI's Button: Enter and Space activate it) that calls
 * `onAction`; header actions stay outside it.
 */
export function CardMainHeader({
    interactive = false,
    title = 'Activate for action/navigation',
    onAction,
    render,
    className,
    children,
    ...props
}: CardMainHeaderProps) {
    const card = useCard();
    const role = card?.role;
    const s = slotted(children, {
        avatar: Avatar,
        title: CardTitle,
        subtitle: CardSubtitle,
        kpi: CardKpiHeader,
        secondSubtitle: CardSecondSubtitle,
        action: CardHeaderAction,
        counter: CardCounter
    });
    const hasText = has(s.title) || has(s.subtitle) || has(s.kpi) || has(s.secondSubtitle) || has(s.avatar);

    const containerClass = cn(
        'relative m-0 flex h-fit w-full flex-1 items-start gap-2 p-0',
        (interactive || role === 'button') && FAKE_OUTLINE,
        role === 'listitem' && 'pointer-events-none'
    );
    const containerContent = (
        <>
            {s.avatar}
            <div className="m-0 flex h-full w-full flex-col gap-(--card-hts) self-center p-0">
                {has(s.title) && <div className="m-0 flex w-full items-start justify-between p-0">{s.title}</div>}
                {has(s.subtitle) && (
                    <div className={cn('m-0 flex items-end p-0', card?.cardType === 'analytical' && 'mt-2')}>
                        {s.subtitle}
                    </div>
                )}
                {s.kpi}
                {s.secondSubtitle}
            </div>
        </>
    );

    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'relative m-0 box-border flex gap-2 px-4 pt-4 pb-3 no-underline bg-(--card-bg)',
                'border-b border-solid border-transparent group-last/ch:border-t group-last/ch:border-b-0 group-last/ch:pb-4',
                'group-only/ch:border-y-0 group-only/ch:pb-4',
                interactive &&
                    'cursor-pointer enabled-hover:bg-sap-tile-hover-background has-[[role=button]:active]:bg-sap-tile-active-background',
                className
            ),
            children: (
                <>
                    {hasText &&
                        (interactive ? (
                            <BaseButton
                                render={<div />}
                                nativeButton={false}
                                aria-description={title}
                                title={title}
                                className={containerClass}
                                onClick={onAction}
                            >
                                {containerContent}
                            </BaseButton>
                        ) : (
                            <div className={containerClass}>{containerContent}</div>
                        ))}
                    {(has(s.counter) || has(s.action)) && (
                        <div className="z-[5] m-0 flex flex-col items-end gap-1 p-0">
                            {s.action}
                            {s.counter}
                        </div>
                    )}
                    {s.rest}
                </>
            )
        }
    });
}

export interface CardExtendedHeaderProps extends useRender.ComponentProps<'div'> {
    /** Vertical alignment of the columns; centred by default. */
    align?: 'top' | 'bottom' | null;
}

/** Extra header area for custom content (statuses, texts, a micro chart): a `group` described as "Extended content". */
export function CardExtendedHeader({ align, render, className, ...props }: CardExtendedHeaderProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            role: 'group',
            'aria-roledescription': 'Extended content',
            ...props,
            className: cn(
                'm-0 flex items-center gap-2 px-4 py-2',
                align === 'top' && 'items-start',
                align === 'bottom' && 'items-end',
                className
            )
        }
    });
}

export type CardNumericHeaderProps = useRender.ComponentProps<'div'>;

/** Numeric header area (KPI, indicators): a `group` described as "Numeric content". */
export function CardNumericHeader({ render, className, ...props }: CardNumericHeaderProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            role: 'group',
            'aria-roledescription': 'Numeric content',
            ...props,
            className: cn('m-0 flex flex-col gap-1 px-4 py-1', className)
        }
    });
}

export type CardHeaderRowProps = useRender.ComponentProps<'div'>;

/** A row of an extended or numeric header: its items side by side. */
export function CardHeaderRow({ render, className, ...props }: CardHeaderRowProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, className: cn('m-0 flex gap-2 p-0', className) }
    });
}

export interface CardHeaderColumnProps extends useRender.ComponentProps<'div'> {
    /** `right` aligns the rows to the end (the left in RTL). */
    align?: 'left' | 'right';
}

/** A column of rows in an extended header. */
export function CardHeaderColumn({ align = 'left', render, className, ...props }: CardHeaderColumnProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                align === 'right'
                    ? 'm-0 flex flex-1 flex-col items-end gap-1 p-0'
                    : 'm-0 flex flex-1 flex-col items-start gap-1 p-0',
                className
            )
        }
    });
}

export type CardHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface CardTitleProps extends useRender.ComponentProps<'h2'> {
    /** Heading level: renders `<h1>`…`<h6>`; default 2. */
    level?: CardHeadingLevel;
}

/** Title of the card, at most three lines (two in analytical cards); it names the card. */
export function CardTitle({ level = 2, id: idProp, render, className, ...props }: CardTitleProps) {
    const autoId = useId();
    const id = idProp ?? `fd-card-title-${autoId}`;
    useCardPart('title', id);
    const analytical = useCard()?.cardType === 'analytical';
    return useRender({
        render,
        defaultTagName: `h${level}` as const,
        props: {
            ...props,
            id,
            className: cn(
                'm-0 max-h-[4.2rem] max-w-full p-0 font-sap-font-header-family text-sap-font-header6-size font-normal break-words text-sap-tile-title-text-color line-clamp-3',
                analytical && 'max-h-[2.8rem] line-clamp-2',
                className
            )
        }
    });
}

export type CardSubtitleProps = useRender.ComponentProps<'div'>;

/** Subtitle under the title, at most two lines; it describes the card. */
export function CardSubtitle({ id: idProp, render, className, ...props }: CardSubtitleProps) {
    const autoId = useId();
    const id = idProp ?? `fd-card-subtitle-${autoId}`;
    useCardPart('subtitle', id);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            id,
            className: cn(
                'm-0 line-clamp-2 max-h-10 max-w-full p-0 text-sap-font-size font-normal break-words text-sap-tile-text-color',
                className
            )
        }
    });
}

export type CardSecondSubtitleProps = useRender.ComponentProps<'div'>;

/** Second subtitle, one truncated line in the small font (e.g. under a KPI); it describes the card. */
export function CardSecondSubtitle({ id: idProp, render, className, ...props }: CardSecondSubtitleProps) {
    const autoId = useId();
    const id = idProp ?? `fd-card-second-subtitle-${autoId}`;
    useCardPart('secondSubtitle', id);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            id,
            className: cn(
                'm-0 mt-1 w-full truncate p-0 text-sap-font-small-size font-normal text-sap-tile-text-color',
                className
            )
        }
    });
}

export interface CardCounterProps extends useRender.ComponentProps<'span'> {
    /** Colour of the counter; neutral by default. */
    status?: CardKpiStatus | 'neutral' | null;
}

/** Counter at the end of the header (e.g. "3 of 10"), coloured by status; it describes the card. */
export function CardCounter({ status, id: idProp, render, className, ...props }: CardCounterProps) {
    const autoId = useId();
    const id = idProp ?? `fd-card-counter-${autoId}`;
    useCardPart('counter', id);
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            id,
            className: cn(
                'm-0 ms-4 mt-[0.125rem] flex min-h-4 p-0 text-sap-font-small-size leading-4 whitespace-nowrap',
                TEXT_STATUS[status ?? 'neutral'],
                className
            )
        }
    });
}

/* ------------------------------------------------------------------------------------------------------------ */
/* KPI and numeric content                                                                                       */
/* ------------------------------------------------------------------------------------------------------------ */

function KpiBlock({ value, icon, text }: { value: ReactNode[]; icon: ReactNode[]; text: ReactNode[] }) {
    return (
        <div className="m-0 flex h-12 w-auto shrink-0 p-0">
            <div className="m-0 me-[0.375rem] flex h-full items-center overflow-hidden p-0 pt-0.5">{value}</div>
            <div className="m-0 flex h-full overflow-hidden p-0 pt-2 pb-[0.375rem]">
                <div className="m-0 flex flex-col items-center justify-between p-0">
                    {icon}
                    {text}
                </div>
            </div>
        </div>
    );
}

export type CardKpiHeaderProps = useRender.ComponentProps<'div'>;

/**
 * KPI header in a `CardMainHeader`: the `CardKpiValue` with its `CardKpiScaleIcon` above the `CardKpiScaleText`,
 * then the `CardKpiAnalytics` (deviation, target...), whatever the order of the children.
 */
export function CardKpiHeader({ render, className, children, ...props }: CardKpiHeaderProps) {
    const s = slotted(children, {
        value: CardKpiValue,
        icon: CardKpiScaleIcon,
        text: CardKpiScaleText,
        analytics: CardKpiAnalytics
    });
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn('m-0 mt-2 flex overflow-hidden p-0', className),
            children: (
                <>
                    <KpiBlock value={s.value} icon={s.icon} text={s.text} />
                    <div className="m-0 ms-8 flex w-full overflow-x-hidden p-0 whitespace-nowrap">{s.analytics}</div>
                    {s.rest}
                </>
            )
        }
    });
}

export interface CardKpiValueProps extends useRender.ComponentProps<'span'> {
    /** Colour of the value; neutral by default. */
    status?: CardKpiStatus | null;
}

/** The KPI value, in the large light font; it stays left-to-right in RTL. */
export function CardKpiValue({ status, render, className, ...props }: CardKpiValueProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            className: cn(
                'm-0 p-0 text-[2.25rem] leading-[normal] font-light rtl:[direction:ltr]',
                TEXT_STATUS[status ?? 'neutral'],
                className
            )
        }
    });
}

export type CardKpiScaleIconProps = useRender.ComponentProps<'span'>;

/** Trend icon above the scale, e.g. `render={<ObjectStatus status="positive" glyph="up" />}`. */
export function CardKpiScaleIcon({ render, className, ...props }: CardKpiScaleIconProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: { ...props, className: cn('text-[0.875rem] leading-[normal]', className) }
    });
}

export type CardKpiScaleTextProps = useRender.ComponentProps<'span'>;

/** Scale or unit of the KPI value (e.g. "%", "K"). */
export function CardKpiScaleText({ render, className, ...props }: CardKpiScaleTextProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: { ...props, className: cn('m-0 p-0 text-[0.875rem] leading-[normal]', className) }
    });
}

export type CardKpiAnalyticsProps = useRender.ComponentProps<'div'>;

/** One analytics figure of a KPI header: a `CardKpiAnalyticsLabel` above its `CardKpiAnalyticsContent`. */
export function CardKpiAnalytics({ render, className, ...props }: CardKpiAnalyticsProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 ms-4 flex max-w-[calc(50%_-_1rem)] flex-col items-end justify-end overflow-hidden p-0 pb-1 text-sap-font-small-size',
                className
            )
        }
    });
}

export type CardKpiAnalyticsLabelProps = useRender.ComponentProps<'span'>;

export function CardKpiAnalyticsLabel({ render, className, ...props }: CardKpiAnalyticsLabelProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: { ...props, className: cn('m-0 p-0 pb-1 text-sap-tile-text-color', className) }
    });
}

export type CardKpiAnalyticsContentProps = useRender.ComponentProps<'span'>;

/** Value of an analytics figure; it stays left-to-right in RTL. */
export function CardKpiAnalyticsContent({ render, className, ...props }: CardKpiAnalyticsContentProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            className: cn('m-0 p-0 text-sap-tile-title-text-color rtl:[direction:ltr] rtl:text-end', className)
        }
    });
}

export type CardIndicatorProps = useRender.ComponentProps<'div'>;

/** Indicator in a numeric header: a `CardIndicatorTitle` above its `CardIndicatorValue`. */
export function CardIndicator({ render, className, children, ...props }: CardIndicatorProps) {
    const s = slotted(children, { title: CardIndicatorTitle, value: CardIndicatorValue });
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn('m-0 flex flex-col items-end gap-0.5 p-0 pt-2', className),
            children: (
                <>
                    {s.title}
                    {s.value}
                    {s.rest}
                </>
            )
        }
    });
}

export type CardIndicatorTitleProps = useRender.ComponentProps<'span'>;

export function CardIndicatorTitle({ render, className, ...props }: CardIndicatorTitleProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: { ...props, className: cn('m-0 p-0 text-sap-font-small-size text-sap-tile-text-color', className) }
    });
}

export type CardIndicatorValueProps = useRender.ComponentProps<'span'>;

export function CardIndicatorValue({ render, className, ...props }: CardIndicatorValueProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            className: cn('m-0 p-0 text-end text-sap-font-small-size text-sap-tile-title-text-color', className)
        }
    });
}

export type CardNumericContainerProps = useRender.ComponentProps<'div'>;

/** KPI block of a numeric header: value, scale icon and scale text, laid out as in `CardKpiHeader`. */
export function CardNumericContainer({ render, className, children, ...props }: CardNumericContainerProps) {
    const s = slotted(children, { value: CardKpiValue, icon: CardKpiScaleIcon, text: CardKpiScaleText });
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn('m-0 flex-1 p-0', className),
            children: (
                <>
                    <KpiBlock value={s.value} icon={s.icon} text={s.text} />
                    {s.rest}
                </>
            )
        }
    });
}

/* ------------------------------------------------------------------------------------------------------------ */
/* Content, footer, loader                                                                                       */
/* ------------------------------------------------------------------------------------------------------------ */

export type CardContentProps = useRender.ComponentProps<'div'>;

/** Content area of a card; object cards pad it, compact table cards add room at the bottom. */
export function CardContent({ render, className, ...props }: CardContentProps) {
    const type = useCard()?.cardType;
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                `relative m-0 block flex-[1_0_auto] p-0 first:overflow-hidden last:overflow-hidden [[data-card-badges]+&]:overflow-hidden ${PART_CORNERS}`,
                '[--card-fr:0]',
                FAKE_OUTLINE,
                type === 'object' && 'p-4',
                type === 'table' && 'compact:pb-2',
                className
            )
        }
    });
}

export type CardFooterActionsProps = useRender.ComponentProps<'div'>;

/** Actions of a footer, aligned to the end (Angular's `*fdCardFooterActionItem` templates). */
export function CardFooterActions({ render, className, ...props }: CardFooterActionsProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, className: cn('m-0 flex w-full justify-end gap-2 p-0', className) }
    });
}

export type CardFooterProps = useRender.ComponentProps<'div'>;

/** Footer of a card, always placed last: its content, then the `CardFooterActions` at the end. */
export function CardFooter({ render, className, children, ...props }: CardFooterProps) {
    const s = slotted(children, { actions: CardFooterActions });
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 flex items-center rounded-b-(--card-r) border-t border-solid border-transparent bg-(--card-bg) px-4 pt-3 pb-4 first:rounded-t-(--card-r)',
                className
            ),
            children: (
                <>
                    {s.rest}
                    {s.actions}
                </>
            )
        }
    });
}

export type CardLoaderProps = useRender.ComponentProps<'div'>;

/** Shown instead of the card content while the card `isLoading` (e.g. a `BusyIndicator` or skeletons). */
export function CardLoader({ render, className, ...props }: CardLoaderProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: { ...props, className: cn('m-0 flex min-h-20 items-center justify-center p-0', className) }
    });
}

/* ------------------------------------------------------------------------------------------------------------ */
/* Media                                                                                                         */
/* ------------------------------------------------------------------------------------------------------------ */

export interface CardMediaProps extends useRender.ComponentProps<'div'> {
    /** Insets the image from the card edges, with rounded corners. */
    hasPadding?: boolean;
    /** Shell category background 1-16, with its text colours. */
    shellColor?: CardShellColor | null;
    /** Legend background 1-20, with the text colour. */
    legendColor?: CardLegendColor | null;
}

/**
 * Media block: an image (`CardMediaImageContainer`) and/or text (`CardMediaContentContainer`), optionally on a shell
 * or legend colour. In a banner card the text and image sit side by side (text 50%, or 80% without an image; text
 * 80% and image 20% below 1024px) and stack below 640px; text `isOverlay` sits over an image of the full width.
 */
export function CardMedia({
    hasPadding = false,
    shellColor,
    legendColor,
    render,
    className,
    ...props
}: CardMediaProps) {
    const banner = useCard()?.cardType === 'banner';
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            role: 'group',
            'aria-roledescription': 'Card Media Block',
            ...props,
            className: cn(
                'relative m-0 box-border flex h-full min-h-0 [flex-direction:var(--cm-dir)] overflow-hidden bg-(--cm-bg) p-0',
                '[--cm-dir:row] [--cm-bg:var(--sapTile_Background)] rounded-t-(--card-r) only:rounded-(--card-r)',
                hasPadding && 'px-4 pt-4 [--cm-ir:0.5rem]',
                shellColor && SHELL_COLOR[shellColor],
                legendColor && LEGEND_COLOR[legendColor],
                banner && [
                    // side by side, stacked below 640px
                    '[--cm-cw:80%] [--cm-cp:3rem] has-[[data-card-media-image]]:[--cm-cw:50%] has-[[data-card-media-image]]:[--cm-iw:50%]',
                    'max-lg:has-[[data-card-media-image]]:[--cm-cw:80%] max-lg:has-[[data-card-media-image]]:[--cm-iw:20%]',
                    'max-sm:[--cm-cw:100%] max-sm:has-[[data-card-media-image]]:[--cm-dir:column-reverse] max-sm:has-[[data-card-media-image]]:[--cm-iw:100%]',
                    'max-sm:has-[[data-card-media-image]]:[--cm-cw:100%] max-sm:has-[[data-card-media-image]]:[--cm-ih:10rem] max-sm:has-[[data-card-media-image]]:[--cm-ch:auto]',
                    // text over the image: the image takes the whole width
                    'has-[[data-card-media-overlay]]:has-[[data-card-media-image]]:[--cm-iw:100%]'
                ],
                className
            )
        }
    });
}

export type CardMediaImageContainerProps = useRender.ComponentProps<'div'>;

/** Holds the `CardMediaImage`. */
export function CardMediaImageContainer({ render, className, ...props }: CardMediaImageContainerProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-card-media-image': '',
            className: cn('m-0 flex h-(--cm-ih) min-h-0 w-(--cm-iw) shrink-0 p-0', className)
        }
    });
}

export type CardMediaImageProps = useRender.ComponentProps<'img'>;

/** The media image, covering its container. Give it an `alt` text (or `alt=""` when decorative). */
export function CardMediaImage({ render, className, ...props }: CardMediaImageProps) {
    return useRender({
        render,
        defaultTagName: 'img',
        props: { ...props, className: cn('h-full min-h-0 w-full flex-1 rounded-(--cm-ir) object-cover', className) }
    });
}

export interface CardMediaContentContainerProps extends useRender.ComponentProps<'div'> {
    /** Places the text over the image. */
    isOverlay?: boolean;
    shellColor?: CardShellColor | null;
    legendColor?: CardLegendColor | null;
}

/** Text block of a media card (`CardMediaHeading`, `CardMediaText`, a button), optionally over the image. */
export function CardMediaContentContainer({
    isOverlay = false,
    shellColor,
    legendColor,
    render,
    className,
    ...props
}: CardMediaContentContainerProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-card-media-overlay': isOverlay ? '' : undefined,
            className: cn(
                'relative z-[3] m-0 box-border flex h-(--cm-ch) max-h-full w-(--cm-cw) flex-col items-start justify-center gap-4',
                'bg-(--cm-cbg) px-(--cm-cp) py-(--cm-cp)',
                isOverlay &&
                    'absolute start-12 top-1/2 h-fit w-[calc(50%_-_3rem)] -translate-y-1/2 max-lg:w-[calc(80%_-_3rem)] max-sm:end-12 max-sm:w-auto max-sm:p-4',
                shellColor && CONTAINER_SHELL_COLOR[shellColor],
                legendColor && CONTAINER_LEGEND_COLOR[legendColor],
                className
            )
        }
    });
}

export interface CardMediaHeadingProps extends useRender.ComponentProps<'div'> {
    /** `aria-level` of the heading; default 2. */
    level?: number | null;
}

/** Heading of a media card (`role="heading"`); it names the card when it has no `CardTitle`. */
export function CardMediaHeading({ level = 2, id: idProp, render, className, ...props }: CardMediaHeadingProps) {
    const autoId = useId();
    const id = idProp ?? `fd-card-media-heading-${autoId}`;
    useCardPart('mediaHeading', id);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            role: 'heading',
            'aria-level': level ?? undefined,
            ...props,
            id,
            className: cn(
                'm-0 p-0 font-sap-font-header-family text-sap-font-header3-size font-bold text-(--cm-hc) [text-shadow:var(--cm-hs)]',
                className
            )
        }
    });
}

export type CardMediaTextProps = useRender.ComponentProps<'p'>;

/** Text of a media card. */
export function CardMediaText({ render, className, ...props }: CardMediaTextProps) {
    return useRender({
        render,
        defaultTagName: 'p',
        props: { ...props, className: cn('m-0 p-0 text-sap-font-size font-normal text-(--cm-tc)', className) }
    });
}

/* ------------------------------------------------------------------------------------------------------------ */
/* Card list                                                                                                     */
/* ------------------------------------------------------------------------------------------------------------ */

const KEYS: Record<string, (index: number, last: number) => number> = {
    ArrowDown: (i) => i + 1,
    ArrowRight: (i) => i + 1,
    ArrowUp: (i) => i - 1,
    ArrowLeft: (i) => i - 1,
    Home: () => 0,
    End: (_, last) => last
};

export type CardListProps = useRender.ComponentProps<'div'>;

/**
 * List of interactive cards (`role="listitem"`, also in nested elements): Arrow keys move the focus to the
 * previous or next card, Home and End to the first and last; every card stays a tab stop. Name it with
 * `aria-label`.
 *
 * ```tsx
 * <CardList aria-label="Products">
 *     <Card role="listitem" aria-posinset={1} aria-setsize={2}>...</Card>
 *     <Card role="listitem" aria-posinset={2} aria-setsize={2}>...</Card>
 * </CardList>
 * ```
 */
export function CardList({ render, onKeyDown, ...props }: CardListProps) {
    const cards = useRef(new Set<HTMLElement>());
    const context = useMemo<CardListContextValue>(
        () => ({
            registerCard: (element) => {
                cards.current.add(element);
                return () => cards.current.delete(element);
            }
        }),
        []
    );
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        // in document order
        const ordered = [...cards.current].sort((a, b) =>
            a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
        );
        const index = ordered.indexOf(document.activeElement as HTMLElement);
        const move = KEYS[event.key];
        if (index < 0 || !move) return;
        const next = move(index, ordered.length - 1);
        if (next < 0 || next >= ordered.length) return;
        event.preventDefault();
        ordered[next].focus();
    };
    const element = useRender({
        render,
        defaultTagName: 'div',
        props: { role: 'list', 'aria-roledescription': 'Card List', ...props, onKeyDown: handleKeyDown }
    });
    return <CardListContext.Provider value={context}>{element}</CardListContext.Provider>;
}
