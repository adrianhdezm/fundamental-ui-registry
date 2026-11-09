/*
 * Port of fundamental-react (BusyIndicator) and @fundamental-ngx/core (busy-indicator) with the visual design of
 * fundamental-styles, Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { useEffect, useRef, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type BusyIndicatorSize = 's' | 'm' | 'l';

const DOTS: Record<BusyIndicatorSize, string> = {
    s: '[--dot:0.5rem] [--dot-gap:0.0625rem]',
    m: '[--dot:1rem] [--dot-gap:0.1875rem]',
    l: '[--dot:2rem] [--dot-gap:0.25rem]'
};

const DOT =
    'relative inline-block size-(--dot) rounded-[50%] bg-current animate-sap-busy me-(--dot-gap) motion-reduce:animate-none';

export interface BusyIndicatorProps extends useRender.ComponentProps<'div'> {
    /** Shows the indicator and blocks the wrapped content (fundamental-react's `show`). */
    loading?: boolean;
    size?: BusyIndicatorSize;
    /** Wraps block content (display: block) instead of inline content. */
    block?: boolean;
    /** Dots in the contrast colour, for dark backgrounds. */
    contrast?: boolean;
    /** Text below the dots. */
    label?: string;
    /** Blocks mouse wheel scrolling over the indicator while loading. */
    preventWheelEvents?: boolean;
}

/**
 * Busy indicator: three pulsing dots that show that content is loading. Wrapping content covers it with a
 * translucent layer and makes it inert (not focusable or clickable) while loading. While loading it is a
 * progressbar named by `aria-label` ("Loading" by default) or `aria-labelledby`; its ARIA attributes, `title`
 * ("Please wait") and `aria-valuetext` ("Busy") apply only while loading.
 *
 * ```tsx
 * <BusyIndicator loading aria-label="Loading orders" />
 * <BusyIndicator loading={saving} block><form>...</form></BusyIndicator>
 * ```
 */
export function BusyIndicator({
    loading = false,
    size = 'm',
    block = false,
    contrast = false,
    label,
    preventWheelEvents = false,
    render,
    ref,
    className,
    children,
    tabIndex,
    title,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-valuetext': ariaValueText,
    'aria-live': ariaLive,
    ...props
}: BusyIndicatorProps) {
    const element = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(loading);
    loadingRef.current = loading;

    useEffect(() => {
        const el = element.current;
        if (!preventWheelEvents || !el) return;
        const listener = (event: WheelEvent) => {
            if (loadingRef.current) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        };
        el.addEventListener('wheel', listener, { passive: false });
        return () => el.removeEventListener('wheel', listener);
    }, [preventWheelEvents]);

    return useRender({
        render,
        ref: ref ? [ref, element] : element,
        defaultTagName: 'div',
        props: {
            ...props,
            role: loading ? 'progressbar' : 'presentation',
            tabIndex: loading ? (tabIndex === undefined ? 0 : tabIndex) : -1,
            'aria-busy': loading || undefined,
            'aria-live': loading ? ariaLive : undefined,
            'aria-label': loading ? (ariaLabel ?? (ariaLabelledBy ? undefined : 'Loading')) : undefined,
            'aria-labelledby': loading ? ariaLabelledBy : undefined,
            'aria-valuetext': loading ? ariaValueText || 'Busy' : undefined,
            'aria-valuemin': loading ? 0 : undefined,
            'aria-valuemax': loading ? 100 : undefined,
            title: loading ? title || 'Please wait' : undefined,
            className: cn(
                'relative focus:outline-sap',
                block ? 'block' : 'inline-block',
                !loading && 'outline-none',
                className
            ),
            children: (
                <>
                    <span className="contents" inert={loading || undefined}>
                        {children}
                    </span>
                    {loading && (
                        <>
                            <div
                                data-busy-dots=""
                                className={cn(
                                    'relative z-[11] block text-center text-[0] leading-none',
                                    contrast
                                        ? 'text-sap-content-contrast-icon-color hc:text-sap-content-busy-color'
                                        : 'text-(--fdBusy_Indicator_Dot_Color)',
                                    '[:not(:empty)+&]:absolute [:not(:empty)+&]:start-1/2 [:not(:empty)+&]:top-1/2 [:not(:empty)+&]:-translate-1/2 [:not(:empty)+&]:whitespace-nowrap rtl:[:not(:empty)+&]:translate-x-1/2',
                                    DOTS[size]
                                )}
                            >
                                <div className={DOT} />
                                <div className={cn(DOT, '[animation-delay:0.2s]')} />
                                <div className={cn(DOT, 'me-0 [animation-delay:0.4s]')} />
                            </div>
                            {label && (
                                <span className="block text-center font-sap-font-family text-sap-font-size text-sap-page-footer-text-color [:not(:empty)+[data-busy-dots]+&]:absolute [:not(:empty)+[data-busy-dots]+&]:start-1/2 [:not(:empty)+[data-busy-dots]+&]:top-1/2 [:not(:empty)+[data-busy-dots]+&]:z-[11] [:not(:empty)+[data-busy-dots]+&]:translate-y-1/2 [:not(:empty)+[data-busy-dots]+&]:-translate-x-1/2 [:not(:empty)+[data-busy-dots]+&]:whitespace-nowrap rtl:[:not(:empty)+[data-busy-dots]+&]:translate-x-1/2">
                                    {label}
                                </span>
                            )}
                            <div className="absolute inset-0 z-10 bg-sap-base-color opacity-72 [:empty+[data-busy-dots]~&]:bg-transparent" />
                        </>
                    )}
                </>
            )
        }
    });
}

/**
 * Container that stacks a busy indicator and its label, e.g. inside a message toast or dialog.
 *
 * ```tsx
 * <BusyIndicatorExtended><BusyIndicator loading label="Loading data" /></BusyIndicatorExtended>
 * ```
 */
export function BusyIndicatorExtended({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('flex flex-col items-center justify-center gap-4 p-4', className)} />;
}
