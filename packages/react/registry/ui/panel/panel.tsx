/*
 * Port of @fundamental-ngx/core (panel) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Collapsible } from '@base-ui/react/collapsible';
import { useRender } from '@base-ui/react/use-render';
import {
    Children,
    createContext,
    isValidElement,
    useContext,
    useId,
    useState,
    type CSSProperties,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';

interface PanelContextValue {
    transparent: boolean;
    noRadius: boolean;
}

const PanelContext = createContext<PanelContextValue | null>(null);

export type PanelTitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface PanelTitleProps extends useRender.ComponentProps<'h4'> {
    /** Heading level: renders `<h1>`…`<h6>`; default 4. The size is the group title size whatever the level. */
    level?: PanelTitleLevel;
    /** Wraps long titles (the default); `false` truncates them to one line with an ellipsis. */
    wrap?: boolean;
}

/** Title of a panel, in its header after the expand button (Angular's `fd-panel-title`). */
export function PanelTitle({ level = 4, wrap = true, id: idProp, render, className, ...props }: PanelTitleProps) {
    const autoId = useId();
    return useRender({
        render,
        defaultTagName: `h${level}` as const,
        props: {
            ...props,
            id: idProp ?? `fd-panel-title-${autoId}`,
            className: cn(
                'm-0 w-full max-w-full flex-1 p-0 ps-1 font-sap-font-header-family text-sap-group-title-font-size leading-[normal] font-normal text-sap-group-title-text-color',
                wrap ? 'whitespace-normal break-words' : 'truncate',
                className
            )
        }
    });
}

export interface PanelContentProps extends Omit<useRender.ComponentProps<'div'>, 'role'> {
    /** Role of the content; `region` by default, named with `aria-label` or `aria-labelledby`. */
    role?: string | null;
    /** Fixed height (CSS length); the content scrolls when it does not fit. */
    height?: string | null;
    /** Minimum height (CSS length). */
    minHeight?: string | null;
    /** Maximum height (CSS length); the content scrolls beyond it. */
    maxHeight?: string | null;
    /** Removes the padding, e.g. for a list. */
    noPadding?: boolean;
    /** Transparent background (also when the panel is transparent). */
    transparent?: boolean;
}

/**
 * Content of a panel: a region shown while the panel is expanded (always when it is fixed). In a `Panel` it is Base
 * UI's `Collapsible.Panel`, whose id the expand button's `aria-controls` points to; outside one it is a plain `<div>`.
 */
export function PanelContent({
    role = 'region',
    height,
    minHeight,
    maxHeight,
    noPadding = false,
    transparent = false,
    id: idProp,
    style,
    render,
    className,
    ...props
}: PanelContentProps) {
    const panel = useContext(PanelContext);
    const autoId = useId();
    const contentProps = {
        ...props,
        id: idProp ?? `fd-panel-content-${autoId}`,
        role: role ?? undefined,
        style: {
            ...(height != null && { height }),
            ...(minHeight != null && { minHeight }),
            ...(maxHeight != null && { maxHeight }),
            ...style
        } satisfies CSSProperties,
        className: cn(
            'scrollbar-sap m-0 box-border block overflow-auto px-4 py-[0.625rem] text-sap-text-color',
            'border-b border-solid border-transparent bg-sap-group-content-background rounded-b-sap-element-border-corner-radius',
            noPadding && 'p-0',
            (transparent || panel?.transparent) && 'bg-transparent',
            panel?.noRadius && 'rounded-none',
            className
        )
    };
    const plain = useRender({ render, defaultTagName: 'div', props: contentProps, enabled: !panel });
    if (!panel) return plain;
    return <Collapsible.Panel {...contentProps} render={render} />;
}

export interface PanelProps extends Omit<useRender.ComponentProps<'div'>, 'render'> {
    /** Whether the content is shown (controlled). */
    expanded?: boolean;
    /** Initial expanded state when uncontrolled; default `false`. */
    defaultExpanded?: boolean;
    /** Called with the new state when the expand button is pressed. */
    onExpandedChange?: (expanded: boolean) => void;
    /** Content always shown, no expand button. */
    fixed?: boolean;
    /**
     * Transparent content background. The header keeps the group title background, as fundamental-styles'
     * `fd-panel--transparent` (Angular clears it too).
     */
    transparent?: boolean;
    /** Square corners. */
    noRadius?: boolean;
    /** Accessible name (and tooltip) of the expand button. */
    expandAriaLabel?: string;
    /** Id of an element (usually the title) that names the expand button, followed by the button itself. */
    expandAriaLabelledBy?: string;
    /** Id of the expand button. */
    expandId?: string;
}

/**
 * Panel: a container with a title bar whose content can be expanded and collapsed (or always shown with `fixed`), on
 * Base UI's Collapsible. The `PanelTitle` goes first in the header, other children (actions, a toolbar) after it,
 * and the `PanelContent` below the header.
 *
 * ```tsx
 * <Panel expanded={open} onExpandedChange={setOpen} expandAriaLabel="Details">
 *     <PanelTitle>Details</PanelTitle>
 *     <PanelContent aria-label="Details">...</PanelContent>
 * </Panel>
 * ```
 */
export function Panel({
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    fixed = false,
    transparent = false,
    noRadius = false,
    expandAriaLabel,
    expandAriaLabelledBy,
    expandId: expandIdProp,
    id: idProp,
    className,
    children,
    ...props
}: PanelProps) {
    const autoId = useId();
    const id = idProp ?? `fd-panel-${autoId}`;
    const expandId = expandIdProp ?? `fd-panel-expand-${autoId}`;
    const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
    const expanded = expandedProp ?? uncontrolled;
    const open = expanded || fixed;

    // as Angular projects them: the title first in the header, then the other children; the content below
    const items = Children.toArray(children);
    const isPart = (child: ReactNode, part: unknown) => isValidElement(child) && child.type === part;
    const titles = items.filter((child) => isPart(child, PanelTitle));
    const contents = items.filter((child) => isPart(child, PanelContent));
    const others = items.filter((child) => !isPart(child, PanelTitle) && !isPart(child, PanelContent));

    return (
        <Collapsible.Root
            {...props}
            id={id}
            open={open}
            onOpenChange={(next) => {
                if (fixed) return;
                if (expandedProp === undefined) setUncontrolled(next);
                onExpandedChange?.(next);
            }}
            className={cn('m-0 box-border flex flex-col p-0 not-last:mb-2', className)}
        >
            <div
                className={cn(
                    'relative m-0 box-border flex min-h-11 w-full min-w-full items-center overflow-hidden p-0 pe-2 compact:min-h-10',
                    'border-b-(length:--sapGroup_TitleBorderWidth) border-solid border-sap-group-title-border-color bg-sap-group-title-background',
                    'rounded-t-sap-element-border-corner-radius has-[>[role=toolbar]]:pe-0',
                    !open && 'rounded-b-sap-element-border-corner-radius',
                    fixed && 'ps-3',
                    noRadius && 'rounded-none'
                )}
            >
                {!fixed && (
                    <div className="m-0 flex h-11 min-h-11 w-11 shrink-0 items-center justify-center p-0 compact:h-10 compact:min-h-10">
                        <Collapsible.Trigger
                            render={
                                <Button
                                    variant="transparent"
                                    // 1rem glyph; the line height after the size, or tailwind-merge drops it
                                    className="text-base leading-[normal]"
                                    id={expandId}
                                    glyph={expanded ? 'slim-arrow-down' : 'slim-arrow-right'}
                                    aria-label={expandAriaLabel}
                                    aria-labelledby={
                                        expandAriaLabelledBy ? `${expandAriaLabelledBy} ${expandId}` : undefined
                                    }
                                    title={expandAriaLabel}
                                />
                            }
                        />
                    </div>
                )}
                {titles}
                {others}
            </div>
            <PanelContext.Provider value={{ transparent, noRadius }}>{contents}</PanelContext.Provider>
        </Collapsible.Root>
    );
}
