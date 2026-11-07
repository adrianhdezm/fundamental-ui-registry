/*
 * Port of fundamental-react (Popover) and @fundamental-ngx/core (popover) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Where the popover body goes, relative to its trigger: the side, then the alignment along that side.
 *
 * `top` and `bottom` sides align `start`/`end` with the reading direction (`bottom-start` is the left edge in LTR,
 * the right edge in RTL). `left` and `right` are physical sides, so they stay put in RTL; their `start` is the top.
 */
export type Placement =
    | 'top-start'
    | 'top'
    | 'top-end'
    | 'right-start'
    | 'right'
    | 'right-end'
    | 'bottom-start'
    | 'bottom'
    | 'bottom-end'
    | 'left-start'
    | 'left'
    | 'left-end';

export type PlacementSide = 'top' | 'right' | 'bottom' | 'left';
export type PlacementAlign = 'start' | 'center' | 'end';

/** How the popover body width relates to the trigger width. */
export type PopoverFillMode = 'at-least' | 'equal' | 'fit-content';

export const PLACEMENTS: readonly Placement[] = [
    'top-start',
    'top',
    'top-end',
    'right-start',
    'right',
    'right-end',
    'bottom-start',
    'bottom',
    'bottom-end',
    'left-start',
    'left',
    'left-end'
];

/**
 * The Base UI `side` and `align` of a placement, for `Positioner` parts (popover, menu, select, ...).
 *
 * ```ts
 * getPlacement('bottom-start'); // { side: 'bottom', align: 'start' }
 * getPlacement('left');         // { side: 'left', align: 'center' }
 * ```
 */
export function getPlacement(placement: Placement): { side: PlacementSide; align: PlacementAlign } {
    const [side, align = 'center'] = placement.split('-') as [PlacementSide, PlacementAlign | undefined];
    return { side, align };
}

/** The placement of a Base UI `side` and `align`, e.g. the `data-side`/`data-align` a popup was rendered with. */
export function toPlacement(side: PlacementSide, align: PlacementAlign = 'center'): Placement {
    return (align === 'center' ? side : `${side}-${align}`) as Placement;
}

/** Where the arrow of a body sits for the side the body was placed on: the edge that faces the trigger. */
export function arrowEdge(side: PlacementSide): PlacementSide {
    return ({ top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const)[side];
}

/** A DOM event on the trigger that opens and/or closes the popover. */
export interface TriggerConfig {
    /** DOM event name, e.g. `dblclick` or `focusin`. */
    trigger: string;
    openAction: boolean;
    closeAction: boolean;
    stopPropagation?: boolean;
}

/**
 * Normalises triggers. A lone trigger toggles; otherwise even entries open and odd entries close,
 * e.g. `['mouseenter', 'mouseleave']` or `['focusin', 'focusout']`.
 */
export function normalizeTriggers(triggers: readonly (string | TriggerConfig)[]): TriggerConfig[] {
    return triggers.map((t, i) =>
        typeof t === 'object'
            ? t
            : {
                  trigger: t,
                  openAction: triggers.length === 1 || i % 2 === 0,
                  closeAction: triggers.length === 1 || i % 2 === 1
              }
    );
}
