/*
 * Port of @fundamental-ngx/core (text) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { Link } from '@/ui/link/link';

export type Hyphenation = 'none' | 'manual' | 'auto' | null;

const HYPHENS: Record<NonNullable<Hyphenation>, string> = {
    none: 'hyphens-none',
    manual: 'hyphens-manual',
    auto: 'hyphens-auto'
};

export interface TextProps extends useRender.ComponentProps<'p'> {
    /** Clamps the text to this many lines (0 or less: no limit). */
    maxLines?: number | null;
    /** Keeps the line breaks and spaces of the text. */
    whitespaces?: boolean;
    /** Hyphenation of the text: `auto` needs a `lang` on the page or an ancestor. */
    hyphenation?: Hyphenation;
    /** Shows a More/Less toggle when the text is longer than `maxLines`. */
    expandable?: boolean;
    /** Collapsed state of an expandable text (controlled). */
    collapsed?: boolean;
    /** Initial collapsed state of an expandable text (uncontrolled). */
    defaultCollapsed?: boolean;
    /** Called with the new collapsed state when the toggle is activated. */
    onCollapsedChange?: (collapsed: boolean) => void;
    /** Smaller, label-coloured text of two lines at most, e.g. under a title. */
    subline?: boolean;
    /** Text of the toggle of a collapsed text. */
    moreLabel?: string;
    /** Text of the toggle of an expanded text. */
    lessLabel?: string;
}

/**
 * Text: a paragraph with an optional line limit, More/Less expansion, preserved whitespace and hyphenation.
 * Renders a `<p>`; `render` renders another element.
 *
 * ```tsx
 * <Text maxLines={3} expandable>{description}</Text>
 * ```
 */
export function Text({
    maxLines,
    whitespaces = false,
    hyphenation = null,
    expandable = false,
    collapsed: collapsedProp,
    defaultCollapsed = true,
    onCollapsedChange,
    subline = false,
    moreLabel = 'More',
    lessLabel = 'Less',
    render,
    className,
    children,
    ...props
}: TextProps) {
    const [collapsedState, setCollapsedState] = useState(defaultCollapsed);
    const isCollapsed = collapsedProp ?? collapsedState;
    const lines = maxLines != null && maxLines > 0 ? maxLines : 0;
    const clamped = lines > 0 && (!expandable || isCollapsed);

    const clampRef = useRef<HTMLSpanElement>(null);
    /** Whether the full text is longer than maxLines. */
    const [overflows, setOverflows] = useState(false);

    /** Clamps the text for a moment if it is expanded, and compares its full height with the visible lines. */
    const measure = useCallback(() => {
        const el = clampRef.current;
        if (!el || !lines) return setOverflows(false);
        const style = el.style;
        const expanded = getComputedStyle(el).webkitLineClamp === 'none';
        if (expanded) {
            style.display = '-webkit-box';
            style.setProperty('-webkit-box-orient', 'vertical');
            style.setProperty('-webkit-line-clamp', String(lines));
            style.overflow = 'hidden';
        }
        setOverflows(el.scrollHeight > el.clientHeight + 1);
        if (expanded) {
            style.removeProperty('display');
            style.removeProperty('-webkit-box-orient');
            style.removeProperty('-webkit-line-clamp');
            style.removeProperty('overflow');
        }
    }, [lines]);

    // after every render: the text, the line limit or the state may have changed
    useLayoutEffect(measure);
    useLayoutEffect(() => {
        const el = clampRef.current;
        if (!el) return;
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [measure]);

    const toggle = () => {
        const next = !isCollapsed;
        if (collapsedProp === undefined) setCollapsedState(next);
        onCollapsedChange?.(next);
    };

    return useRender({
        render,
        defaultTagName: 'p',
        props: {
            ...props,
            className: cn(
                'm-0 box-border border-0 p-0 font-sap-font-family text-sap-font-size font-normal leading-[normal] text-sap-text-color forced-color-adjust-none',
                'selection:bg-sap-selected-color selection:text-sap-content-contrast-text-color',
                whitespaces && 'whitespace-pre-wrap',
                hyphenation && HYPHENS[hyphenation],
                subline && 'line-clamp-2 text-sap-font-small-size text-sap-content-label-color',
                className
            ),
            children: (
                <>
                    <span
                        ref={clampRef}
                        className={clamped ? 'line-clamp-(--fd-lines)' : 'block'}
                        style={{ '--fd-lines': lines || undefined } as CSSProperties}
                    >
                        {children}
                    </span>
                    {expandable && lines > 0 && overflows && (
                        <Link
                            render={<button type="button" />}
                            aria-expanded={!isCollapsed}
                            className="capitalize"
                            onClick={toggle}
                        >
                            {isCollapsed ? moreLabel : lessLabel}
                        </Link>
                    )}
                </>
            )
        }
    });
}
