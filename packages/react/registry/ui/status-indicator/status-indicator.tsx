/*
 * Port of @fundamental-ngx/core (status-indicator) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { useId, useLayoutEffect, useRef, useState, type AriaRole, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export type StatusIndicatorSize = 'sm' | 'md' | 'lg' | 'xl';
export type StatusIndicatorColor = 'negative' | 'critical' | 'positive';
export type StatusIndicatorLabelPosition = 'left' | 'right' | 'top' | 'bottom';
export type StatusIndicatorFillingType = 'radial' | 'angled' | 'linearup' | 'lineardown' | 'linearleft';
export type StatusIndicatorFillDirection = 'clockwise' | 'counterclockwise';

const SVG_SIZE: Record<StatusIndicatorSize, string> = {
    sm: 'w-[1.875rem] h-[1.375rem]',
    md: 'w-[2.8125rem] h-[1.875rem]',
    lg: 'w-20 h-[3.4375rem]',
    xl: 'w-[9.0625rem] h-[6.25rem]'
};
const LABEL_SIZE: Record<StatusIndicatorSize, string> = {
    sm: 'text-sap-font-small-size [--si-gap:0.375rem]',
    md: 'text-sap-font-size [--si-gap:0.5rem]',
    lg: 'text-[1.125rem] [--si-gap:0.75rem]',
    xl: 'text-[1.875rem] [--si-gap:1rem]'
};
const LABEL_POSITION: Record<StatusIndicatorLabelPosition, string> = {
    top: 'mb-(--si-gap)',
    bottom: 'mt-(--si-gap)',
    left: 'me-(--si-gap)',
    right: 'ms-(--si-gap)'
};
/** Shapes use the element colour; the label the text colour of the status, which meets text contrast. */
const COLOR: Record<StatusIndicatorColor, string> = {
    positive: 'fill-sap-positive-element-color text-sap-positive-text-color',
    critical: 'fill-sap-critical-element-color text-sap-critical-text-color',
    negative: 'fill-sap-negative-element-color text-sap-negative-text-color'
};

interface Point {
    x: number;
    y: number;
}

/** Gradient vector (x1, y1, x2, y2) of a linear fill in the given direction, in degrees. */
function gradientVector(angle: number): [number, number, number, number] {
    if (angle === 0 || angle === 360) return [1, 0, 0, 0];
    if (angle > 0 && angle < 45) return [1, 0, 0, 1];
    if (angle >= 45 && angle < 135) return [0, 0, 0, 1];
    if (angle >= 135 && angle < 180) return [0, 0, 1, 1];
    if (angle >= 180 && angle < 225) return [0, 0, 1, 0];
    if (angle >= 225 && angle < 270) return [0, 1, 1, 0];
    if (angle >= 270 && angle < 315) return [0, 1, 0, 0];
    if (angle >= 315 && angle < 360) return [1, 1, 0, 0];
    return [0, 0, 0, 0];
}

const FILL_ANGLE: Partial<Record<StatusIndicatorFillingType, number>> = {
    linearup: 90,
    lineardown: 270,
    linearleft: 180
};

/** Polygon that covers `percent` of a box, swept from 12 o'clock around its centre. */
function radialPolygon(percent: number, box: DOMRect, counterclockwise: boolean): string {
    const angle = 3.6 * percent;
    const start = { x: box.x + box.width / 2, y: box.y };
    const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const adjust = (p: Point): Point => (counterclockwise ? { x: centre.x - (p.x - centre.x), y: p.y } : p);
    const offset = (from: number, length: number) => (Math.tan(((from - angle) * Math.PI) / 180) * length) / 2;
    const points: Point[] = [start];
    if (angle > 0 && angle < 45) points.push(adjust({ x: start.x - offset(0, box.height), y: start.y }));
    if (angle >= 45) points.push(adjust({ x: box.x + box.width, y: box.y }));
    if (angle > 45 && angle < 135)
        points.push(adjust({ x: box.x + box.width, y: box.y + box.height / 2 - offset(90, box.width) }));
    if (angle >= 135) points.push(adjust({ x: box.x + box.width, y: box.y + box.height }));
    if (angle > 135 && angle < 225)
        points.push(adjust({ x: box.x + box.width / 2 + offset(180, box.height), y: box.y + box.height }));
    if (angle >= 225) points.push(adjust({ x: box.x, y: box.y + box.height }));
    if (angle > 225 && angle < 315)
        points.push(adjust({ x: box.x, y: box.y + box.height / 2 + offset(270, box.width) }));
    if (angle >= 315) points.push(adjust({ x: box.x, y: box.y }));
    if (angle > 315 && angle <= 360)
        points.push(adjust({ x: box.x + box.width / 2 - offset(360, box.height), y: box.y }));
    points.push(centre);
    return points.map((p) => `${p.x},${p.y}`).join(' ');
}

export interface StatusIndicatorProps extends Omit<useRender.ComponentProps<'div'>, 'role'> {
    /** Size of the shape. */
    size?: StatusIndicatorSize;
    /** Status colour of the filled part (and the label); neutral when unset. */
    status?: StatusIndicatorColor | null;
    /** Text next to the shape, e.g. "40%". */
    statusLabel?: string | null;
    /** Where the label goes; the label is not rendered without a position. */
    labelPosition?: StatusIndicatorLabelPosition | null;
    labelSize?: StatusIndicatorSize;
    /** One SVG path per shape; shapes fill one after another. */
    path?: string[];
    /** `viewBox` of the SVG the paths are drawn in, e.g. `"0 0 26 25"`. */
    viewBox?: string;
    /** 0-100. */
    fillPercentage?: number | null;
    fillingType?: StatusIndicatorFillingType;
    /** Sweep direction of fillingType="radial". */
    fillDirection?: StatusIndicatorFillDirection;
    /** Fill direction in degrees for fillingType="angled" (270, bottom to top, by default). */
    angle?: number | null;
    /** Shows a pointer; Enter and Space click a clickable, focusable indicator. */
    clickable?: boolean;
    /** Puts the indicator in the tab order. */
    focusable?: boolean;
    /** "progressbar" by default; "progressbar" and "meter" get the value attributes. `null` renders no role. */
    role?: AriaRole | null;
}

/**
 * Status indicator: an SVG shape (one or more paths) filled to a percentage, linearly, at an angle or radially,
 * coloured by status. It is a progressbar (`aria-valuenow`, `aria-valuetext` of the percentage) named by
 * `aria-label`; the SVG is hidden from assistive technology.
 *
 * ```tsx
 * <StatusIndicator path={euroPaths} viewBox="0 0 26 25" status="positive" fillPercentage={60}
 *     aria-label="Budget used" statusLabel="60%" labelPosition="right" />
 * ```
 */
export function StatusIndicator({
    size = 'md',
    status,
    statusLabel,
    labelPosition,
    labelSize = 'sm',
    path = [],
    viewBox,
    fillPercentage,
    fillingType = 'lineardown',
    fillDirection = 'clockwise',
    angle,
    clickable = false,
    focusable = false,
    role = 'progressbar',
    id,
    tabIndex,
    'aria-valuetext': ariaValueText,
    onKeyDown,
    render,
    ref,
    className,
    ...props
}: StatusIndicatorProps) {
    // useId may contain characters that are not valid in a url(#…) reference
    const autoId = `fd-status-indicator-${useId().replace(/[^\w-]/g, '')}`;
    const svgId = id ? `${id}-svg` : autoId;
    const percentage = Math.max(0, Math.min(100, fillPercentage ?? 0));
    const isRange = role === 'progressbar' || role === 'meter';
    /** Number of shapes filled, e.g. 2.5 = two full shapes and half of the third. */
    const filled = (percentage * path.length) / 100;
    const vector = gradientVector(fillingType === 'angled' ? (angle ?? 270) : (FILL_ANGLE[fillingType] ?? 270));
    const radial = fillingType === 'radial';
    const counterclockwise = fillDirection === 'counterclockwise';

    /** Radial fill polygons of partially filled shapes, measured after render. */
    const shapes = useRef<(SVGPathElement | null)[]>([]);
    const [polygons, setPolygons] = useState<(string | null)[]>([]);
    const paths = path.join('\n');
    useLayoutEffect(() => {
        const next = paths.split('\n').map((_, i) => {
            const part = filled - i;
            const shape = shapes.current[i];
            if (!radial || part <= 0 || part >= 1 || !shape) return null;
            return radialPolygon(Number(part.toFixed(2)) * 100, shape.getBBox(), counterclockwise);
        });
        setPolygons((current) => (current.join('|') === next.join('|') ? current : next));
    }, [paths, filled, radial, counterclockwise]);

    const label = labelPosition && (
        <span className={cn(LABEL_SIZE[labelSize], LABEL_POSITION[labelPosition])}>{statusLabel}</span>
    );

    return useRender({
        render,
        ref,
        defaultTagName: 'div',
        props: {
            ...props,
            id,
            role: role ?? undefined,
            'aria-valuetext': isRange ? ariaValueText || `${percentage}%` : undefined,
            'aria-valuenow': isRange ? percentage : undefined,
            'aria-valuemin': isRange ? 0 : undefined,
            'aria-valuemax': isRange ? 100 : undefined,
            tabIndex: tabIndex ?? (focusable ? 0 : undefined),
            onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                onKeyDown?.(event);
                if (event.defaultPrevented || !clickable || event.target !== event.currentTarget) return;
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                event.currentTarget.click();
            },
            className: cn(
                'm-0 box-border inline-flex flex-col items-center border-0 p-0 align-middle font-sap-font-family font-normal text-sap-font-size leading-[normal]',
                'text-sap-text-color fill-transparent forced-color-adjust-none',
                (labelPosition === 'left' || labelPosition === 'right') && 'flex-row',
                status && COLOR[status],
                clickable && 'cursor-pointer',
                'focus:outline-sap focus:outline-offset-(length:--sapContent_FocusWidth)',
                className
            ),
            children: (
                <>
                    {(labelPosition === 'left' || labelPosition === 'top') && label}
                    <svg
                        id={svgId}
                        viewBox={viewBox}
                        preserveAspectRatio="xMidYMid meet"
                        aria-hidden="true"
                        className={cn('stroke-sap-neutral-element-color [stroke-width:0.25]', SVG_SIZE[size])}
                    >
                        {path.map((d, i) => {
                            const prefix = `${svgId}-${i}`;
                            const points = polygons[i];
                            return (
                                <svg key={i} overflow="visible" preserveAspectRatio="xMidYMid meet">
                                    <defs>
                                        {points ? (
                                            <mask id={`${prefix}-mask`}>
                                                <polygon fill="white" points={points} />
                                            </mask>
                                        ) : (
                                            <>
                                                <linearGradient
                                                    id={`${prefix}-gradient`}
                                                    x1={vector[0]}
                                                    y1={vector[1]}
                                                    x2={vector[2]}
                                                    y2={vector[3]}
                                                >
                                                    <stop offset={filled - i} stopColor="white">
                                                        <animate
                                                            attributeName="offset"
                                                            values={`0, ${filled - i}`}
                                                            dur="1s"
                                                            repeatCount="1"
                                                        />
                                                    </stop>
                                                    <stop offset={filled - i} stopColor="transparent">
                                                        <animate
                                                            attributeName="offset"
                                                            values={`0, ${filled - i}`}
                                                            dur="1s"
                                                            repeatCount="1"
                                                        />
                                                    </stop>
                                                </linearGradient>
                                                <mask id={`${prefix}-mask`}>
                                                    <path d={d} strokeWidth="0" fill={`url(#${prefix}-gradient)`} />
                                                </mask>
                                            </>
                                        )}
                                    </defs>
                                    <path d={d} strokeWidth="0" mask={`url(#${prefix}-mask)`} />
                                    <path
                                        ref={(el) => {
                                            shapes.current[i] = el;
                                        }}
                                        d={d}
                                        strokeWidth="0.25"
                                        fill="transparent"
                                    />
                                </svg>
                            );
                        })}
                    </svg>
                    {(labelPosition === 'right' || labelPosition === 'bottom') && label}
                </>
            )
        }
    });
}
