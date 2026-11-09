/*
 * Port of @fundamental-ngx/core (skeleton) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { useId } from 'react';
import { cn } from '@/lib/utils';

export type SkeletonType = 'rectangle' | 'circle' | 'text';

/** Distance between the tops of two text lines, in px (the lines are 8px high). */
const LINE_SPACING = 20;

const STOP = '[stop-color:var(--sapContent_Placeholderloading_Background)]';

export interface SkeletonProps extends useRender.ComponentProps<'div'> {
    /** Predefined shape; omit it to draw your own SVG shapes, passed as children. */
    type?: SkeletonType | null;
    /** Shimmer animation (off for users who prefer reduced motion). */
    animated?: boolean;
    /** Lines of the `text` type; the last of several lines is 60% wide. */
    textLines?: number;
    /** CSS width; a number is in px. `text` fills its container without it; a `circle` takes the height. */
    width?: string | number | null;
    /** CSS height; a number is in px. `text` is as high as its lines without it; a `circle` takes the width. */
    height?: string | number | null;
}

type Size = string | number | null;

function dimensions(type: SkeletonType | null | undefined, width: Size, height: Size, textLines: number) {
    switch (type) {
        case 'text': {
            const lines = Math.max(1, textLines);
            return { width: width ?? '100%', height: height ?? (lines > 1 ? `${LINE_SPACING * lines}px` : '8px') };
        }
        case 'circle':
            // a circle is always square
            return { width: width ?? height, height: height ?? width };
        default:
            return { width, height };
    }
}

/**
 * Skeleton: a shimmering placeholder in the shape of content that is still loading. Use a predefined `type`, or
 * pass SVG shapes (`<rect>`, `<circle>`) as children to draw your own; they mask the shimmer. The drawing is
 * hidden from assistive technology: mark the loading region itself (e.g. `aria-busy` on the list).
 *
 * ```tsx
 * <Skeleton type="circle" width="3rem" />
 * <Skeleton type="text" width="12rem" textLines={2} />
 * <Skeleton width={160} height={50}><rect x="0" y="0" width="100" height="16" rx="4" /></Skeleton>
 * ```
 */
export function Skeleton({
    type,
    animated = true,
    textLines = 3,
    width = null,
    height = null,
    render,
    className,
    style,
    children,
    ...props
}: SkeletonProps) {
    // useId may contain characters that are not valid in a url(#…) reference
    const id = `fd-skeleton-${useId().replace(/[^\w-]/g, '')}`;
    const size = dimensions(type, width, height, textLines);
    // like upstream, zero (or fewer) lines draws no lines; the height above keeps one line's worth
    const lines = Math.max(0, textLines || 0);
    const lineWidths = Array.from({ length: lines }, (_, i) => (lines > 1 && i === lines - 1 ? '60%' : '100%'));

    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            style: { width: size.width ?? undefined, height: size.height ?? undefined, ...style },
            className: cn('m-0 box-border inline-block cursor-wait p-0', className),
            children: (
                <svg width="100%" height="100%" aria-hidden="true" className="block">
                    <defs>
                        <linearGradient id={`${id}-gradient`}>
                            <stop offset="0" className={STOP} />
                            <stop className={cn(STOP, 'motion-safe:animate-sap-shimmer')}>
                                <animate
                                    attributeName="offset"
                                    values="0; 0; 0.5; 1; 1"
                                    dur="2s"
                                    repeatCount="indefinite"
                                />
                            </stop>
                            <stop offset="1" className={STOP} />
                        </linearGradient>
                        <mask id={`${id}-mask`} className="fill-white">
                            {type === 'rectangle' && <rect x="0" y="0" width="100%" height="100%" rx="4" />}
                            {type === 'circle' && <circle cx="50%" cy="50%" r="50%" />}
                            {type === 'text' &&
                                lineWidths.map((lineWidth, i) => (
                                    <rect key={i} x="0" y={i * LINE_SPACING} height="8" rx="4" width={lineWidth} />
                                ))}
                            {children}
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        mask={`url(#${id}-mask)`}
                        fill={animated ? `url(#${id}-gradient)` : undefined}
                        className={
                            animated
                                ? 'motion-reduce:fill-sap-content-placeholderloading-background'
                                : 'fill-sap-content-placeholderloading-background'
                        }
                    />
                </svg>
            )
        }
    });
}
