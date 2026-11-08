/*
 * Port of @fundamental-ngx/core (rating-indicator) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, type ComponentProps, type KeyboardEvent, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui/icon/icon';
import { Link } from '@/ui/link/link';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';

export type RatingIndicatorSize = 'xs' | 'sm' | 'md' | 'lg';

/** Size of the icons, the gap between them and, in display mode, of unselected icons. */
const SIZES: Record<RatingIndicatorSize, string> = {
    xs: '[--ri-size:0.75rem] [--ri-gap:0.0625rem] [--ri-small:0.5625rem] [--ri-small-gap:0.0938rem]',
    sm: '[--ri-size:1.375rem] [--ri-gap:0.1875rem] [--ri-small:1.0313rem] [--ri-small-gap:0.1719rem]',
    md: '[--ri-size:1.5rem] [--ri-gap:0.1875rem] [--ri-small:1.125rem] [--ri-small-gap:0.1875rem]',
    lg: '[--ri-size:2rem] [--ri-gap:0.25rem] [--ri-small:1.5rem] [--ri-small-gap:0.25rem]'
};

const DYNAMIC_TEXT = 'm-0 truncate p-0 font-sap-font-family text-sap-font-small-size text-sap-content-label-color';

interface Star {
    index: number;
    /** Whether the first and the second half are rated. */
    first: boolean;
    second: boolean;
}

export interface RatingIndicatorProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange' | 'children'> {
    /** The rating (controlled). Without a value (`null`), the average of `ratings` (or `ratingAverage`) shows. */
    value?: number | null;
    /** Initial rating (uncontrolled). */
    defaultValue?: number | null;
    /** Called with the new rating when the user rates (Angular's `value` change and `ratingChanged`). */
    onValueChange?: (value: number) => void;
    /** Number of icons, the maximum rating (5; at least 1). */
    indicatorCapacity?: number;
    /** Rates in halves. */
    allowHalves?: boolean;
    size?: RatingIndicatorSize;
    /** Read-only, with smaller unselected icons. */
    displayMode?: boolean;
    /** Read-only without the display mode look. */
    nonInteractive?: boolean;
    disabled?: boolean;
    /** Votes per rating, e.g. `{ 1: 3, 5: 12 }`; sets the average and the number of votes. */
    ratings?: Record<number, number> | null;
    ratingAverage?: number | null;
    totalRatings?: number | null;
    /** Shows the votes per rating in a popover from the number of votes. */
    displayAllRatings?: boolean;
    /** Shows "(2 of 5)", or the number of votes, after the icons. */
    showDynamicText?: boolean;
    /** The word between the rating and the maximum in "(2 of 5)". */
    dynamicTextIndicator?: string;
    /** Name of the votes link and of the popover with the votes per rating. */
    totalRatingsLabel?: string;
    /** Icon of rated values (`favorite` by default). */
    ratedIcon?: string | null;
    /** Icon of unrated values (`unfavorite` by default; `favorite` in display mode). */
    unratedIcon?: string | null;
}

/**
 * SAP Fiori rating indicator: shows a rating as stars (or custom icons) and, unless read-only, lets the user rate.
 * It is a slider: Left/Down and Right/Up change the rating by one (a half with `allowHalves`), Home and End go to 0
 * and the maximum and digits set it; a click on the first half of a star rates a half. With `ratings` it shows the
 * number of votes and, with `displayAllRatings`, the votes per rating in a popover.
 *
 * ```tsx
 * <RatingIndicator aria-label="Product rating" value={rating} onValueChange={setRating} />
 * <RatingIndicator displayMode size="sm" value={3.5} allowHalves />
 * ```
 */
export function RatingIndicator({
    value: valueProp,
    defaultValue,
    onValueChange,
    indicatorCapacity: capacityProp = 5,
    allowHalves = false,
    size = 'md',
    displayMode = false,
    nonInteractive = false,
    disabled = false,
    ratings,
    ratingAverage,
    totalRatings,
    displayAllRatings = false,
    showDynamicText = true,
    dynamicTextIndicator = 'of',
    totalRatingsLabel = 'Total ratings',
    ratedIcon,
    unratedIcon,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-roledescription': ariaRoledescription = 'Rating Indicator',
    className,
    ...props
}: RatingIndicatorProps) {
    const [uncontrolled, setUncontrolled] = useState<number | null | undefined>(defaultValue);
    const value = valueProp !== undefined ? valueProp : uncontrolled;
    const capacity = Math.max(1, Math.round(Number(capacityProp)) || 5);
    const readonly = displayMode || nonInteractive;
    const interactive = !readonly && !disabled;
    const sizeClass = SIZES[size] ?? SIZES.md;

    const ratingItems = Object.entries(ratings ?? {})
        .map(([rate, votes]) => ({ rate: Number(rate), votes: Number(votes) }))
        .filter((r) => r.rate > 0 && !isNaN(r.votes))
        .sort((a, b) => b.rate - a.rate);
    const voteCount = ratingItems.reduce((sum, r) => sum + r.votes, 0);
    const average = voteCount
        ? ratingItems.reduce((sum, r) => sum + r.rate * r.votes, 0) / voteCount
        : (ratingAverage ?? null);
    const votes = ratingItems.length ? voteCount : (totalRatings ?? null);

    /** Rounds to a whole (or half) value within the capacity. */
    const round = (v: number) => {
        if (!v) return 0;
        const whole = Math.floor(v);
        const fraction = v - whole;
        let result = whole;
        if (allowHalves && fraction > 0.25 && fraction <= 0.5) result = whole + 0.5;
        else if (fraction > 0.5) result = whole + 1;
        return Math.min(capacity, Math.max(0, result));
    };
    /** The shown rating. */
    const current = round(value ?? average ?? 0);
    const ratedGlyph = ratedIcon || 'favorite';
    const unratedGlyph = unratedIcon || (displayMode && !ratedIcon ? 'favorite' : 'unfavorite');
    const valueText = `${current} ${dynamicTextIndicator} ${capacity}`;
    const hideDynamicText = !current && votes == null;
    const dynamicText = votes != null ? `(${votes})` : `(${valueText})`;

    const starsFor = (v: number): Star[] =>
        Array.from({ length: capacity }, (_, index) => ({ index, first: v >= index + 0.5, second: v >= index + 1 }));

    const select = (next: number) => {
        if (next === current && value != null) return;
        if (valueProp === undefined) setUncontrolled(next);
        onValueChange?.(next);
    };

    const onStarClick = (event: MouseEvent<HTMLLIElement>, index: number) => {
        const item = event.currentTarget;
        const rect = item.getBoundingClientRect();
        const rtl = getComputedStyle(item).direction === 'rtl';
        const firstHalf = rtl ? event.clientX > rect.left + rect.width / 2 : event.clientX < rect.left + rect.width / 2;
        select(allowHalves && firstHalf ? index + 0.5 : index + 1);
        item.closest<HTMLElement>('[role=slider]')?.focus();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!interactive) return;
        const step = allowHalves ? 0.5 : 1;
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        let next: number | null = null;
        switch (event.key) {
            case 'ArrowUp':
            case rtl ? 'ArrowLeft' : 'ArrowRight':
                next = current + step;
                break;
            case 'ArrowDown':
            case rtl ? 'ArrowRight' : 'ArrowLeft':
                next = current - step;
                break;
            case 'Home':
                next = 0;
                break;
            case 'End':
                next = capacity;
                break;
            default:
                if (/^\d$/.test(event.key)) next = Number(event.key);
        }
        if (next === null) return;
        event.preventDefault();
        select(Math.max(0, Math.min(capacity, next)));
    };

    const stars = (list: Star[], clickable: boolean) => (
        <ul className="m-0 inline-flex list-none items-center gap-(--ri-gap) p-0" aria-hidden="true">
            {list.map((star) => (
                <li
                    key={star.index}
                    data-slot="rating-indicator-item"
                    data-small={displayMode && !star.first && !star.second ? '' : undefined}
                    onClick={clickable ? (event) => onStarClick(event, star.index) : undefined}
                    className={cn(
                        'relative m-0 inline-flex size-(--ri-size) items-center justify-center p-0',
                        // display mode shows unrated icons smaller
                        'data-[small]:mx-(--ri-small-gap) data-[small]:size-(--ri-small)'
                    )}
                >
                    {[star.first, star.second].map((rated, half) => (
                        <Icon
                            key={half}
                            glyph={rated ? ratedGlyph : unratedGlyph}
                            data-rated={rated || undefined}
                            className={cn(
                                // one half of an icon, clipped to its side
                                'absolute start-0 top-0 text-(length:--ri-size) leading-none [[data-small]_&]:text-(length:--ri-small) [[data-small]_&]:leading-none',
                                rated ? 'text-sap-content-rated-color' : 'text-sap-content-unrated-color',
                                half === 0
                                    ? '[clip-path:inset(0_48%_0_0)] rtl:[clip-path:inset(0_0_0_48%)]'
                                    : '[clip-path:inset(0_0_0_50%)] rtl:[clip-path:inset(0_50%_0_0)]'
                            )}
                        />
                    ))}
                </li>
            ))}
        </ul>
    );

    return (
        <div
            data-slot="rating-indicator"
            // the dimmed text belongs to the disabled control
            aria-disabled={disabled || undefined}
            {...props}
            className={cn(
                'm-0 my-[0.8125rem] inline-flex items-center gap-2 p-0 align-middle',
                sizeClass,
                interactive && 'cursor-pointer hover:opacity-90',
                disabled && 'pointer-events-none opacity-(--sapContent_DisabledOpacity)',
                className
            )}
        >
            <div
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-label={ariaLabel ?? undefined}
                aria-labelledby={ariaLabelledBy ?? undefined}
                aria-roledescription={ariaRoledescription}
                aria-valuemin={0}
                aria-valuemax={capacity}
                aria-valuenow={current}
                aria-valuetext={valueText}
                aria-readonly={readonly || undefined}
                aria-disabled={disabled || undefined}
                onKeyDown={onKeyDown}
                className={cn(
                    // square in the HC themes (fundamental-styles), so the focus outline is too
                    'm-0 inline-flex items-center rounded-[0.5rem] p-1 outline-none hc:rounded-none',
                    !disabled &&
                        'focus-visible:outline-(length:--sapContent_FocusWidth) focus-visible:[outline-style:var(--sapContent_FocusStyle)] focus-visible:outline-sap-content-focus-color focus-visible:-outline-offset-2'
                )}
            >
                {stars(starsFor(current), interactive)}
            </div>
            {showDynamicText &&
                !hideDynamicText &&
                (displayAllRatings && ratingItems.length ? (
                    <Popover
                        placement="top"
                        noArrow={false}
                        focusAutoCapture={false}
                        triggers={['mouseenter', 'mouseleave', 'focusin', 'focusout']}
                    >
                        <span className={DYNAMIC_TEXT}>
                            (
                            <PopoverTrigger
                                nativeButton={false}
                                render={
                                    <Link
                                        href="#"
                                        aria-label={`${totalRatingsLabel} ${votes}`}
                                        onClick={(event) => event.preventDefault()}
                                    />
                                }
                            >
                                {votes}
                            </PopoverTrigger>
                            )
                        </span>
                        <PopoverBody aria-label={totalRatingsLabel}>
                            <ul className={cn('m-0 list-none px-0 py-2', sizeClass)} aria-label={totalRatingsLabel}>
                                {ratingItems.map((item) => (
                                    <li
                                        key={item.rate}
                                        className="flex items-center gap-2 px-4 py-2 font-sap-font-family text-sap-font-small-size text-sap-content-label-color"
                                    >
                                        <span className="sr-only-sap">
                                            {`${item.rate} ${dynamicTextIndicator} ${capacity}:`}
                                        </span>
                                        <span className="inline-flex" aria-hidden="true">
                                            {stars(starsFor(item.rate), false)}
                                        </span>
                                        {`(${item.votes})`}
                                    </li>
                                ))}
                            </ul>
                        </PopoverBody>
                    </Popover>
                ) : (
                    <span className={DYNAMIC_TEXT}>{dynamicText}</span>
                ))}
        </div>
    );
}
