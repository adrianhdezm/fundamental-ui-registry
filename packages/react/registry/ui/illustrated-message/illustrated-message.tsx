/*
 * Port of @fundamental-ngx/core (illustrated-message) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { Children, isValidElement, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** An illustration: a sprite `url` (or inline SVG `file`) and the `id` of the symbol to show. */
export interface SvgItemConfig {
    id: string;
    /** URL of an SVG sprite (or file) holding the element with `id`; same origin. */
    url?: string;
    /** Inline SVG markup containing the element with `id`. Trusted markup only: it is inserted as is. */
    file?: string;
}

/** Illustrations per size; scene, dialog, spot and dot are the SAP names of large, medium, small and xsmall. */
export interface SvgConfig {
    large?: SvgItemConfig;
    medium?: SvgItemConfig;
    small?: SvgItemConfig;
    xsmall?: SvgItemConfig;
    scene?: SvgItemConfig;
    dialog?: SvgItemConfig;
    spot?: SvgItemConfig;
    dot?: SvgItemConfig;
}

export type IllustratedMessageType =
    'large' | 'medium' | 'small' | 'xsmall' | 'base' | 'scene' | 'dialog' | 'spot' | 'dot';
export type IllustratedMessageSize = 'large' | 'medium' | 'small' | 'xsmall' | 'base';

const ALIAS: Record<IllustratedMessageType, IllustratedMessageSize> = {
    large: 'large',
    medium: 'medium',
    small: 'small',
    xsmall: 'xsmall',
    base: 'base',
    scene: 'large',
    dialog: 'medium',
    spot: 'small',
    dot: 'xsmall'
};

/** Sizes as CSS variables: padding, illustration, gaps, title and text. */
const SIZE: Record<IllustratedMessageSize, string> = {
    large: '[--im-p:1rem] [--im-ill:20rem] [--im-ill-h:15rem] [--im-ill-mb:1rem] [--im-title:2rem] [--im-title-mb:1rem] [--im-text:var(--sapFontLargeSize)] [--im-fig:40.625rem] [--im-act:0.5rem]',
    medium: '[--im-p:1rem] [--im-ill:10rem] [--im-ill-h:10rem] [--im-ill-mb:0.5rem] [--im-title:1.5rem] [--im-title-mb:0.5rem] [--im-text:var(--sapFontSize)] [--im-fig:19.938rem] [--im-act:0.5rem]',
    small: '[--im-p:0.5rem] [--im-ill:8rem] [--im-ill-h:8rem] [--im-ill-mb:0.5rem] [--im-title:1.25rem] [--im-title-mb:0.5rem] [--im-text:var(--sapFontSize)] [--im-fig:10.938rem] [--im-act:0.5rem]',
    xsmall: '[--im-p:0.25rem] [--im-ill:2.8125rem] [--im-ill-h:2.8125rem] [--im-ill-mb:0.25rem] [--im-title:1rem] [--im-title-mb:0.25rem] [--im-text:var(--sapFontSize)] [--im-fig:8.438rem] [--im-act:0.25rem]',
    base: '[--im-p:0.25rem] [--im-ill:0] [--im-ill-h:0] [--im-ill-mb:0] [--im-title:1rem] [--im-title-mb:0.25rem] [--im-text:var(--sapFontSize)] [--im-fig:8.375rem] [--im-act:0.25rem]'
};

/** The size of a message without a `type`, from its width (the breakpoints of fundamental-styles). */
function sizeForWidth(width: number): IllustratedMessageSize {
    return width >= 682 ? 'large' : width >= 361 ? 'medium' : width >= 261 ? 'small' : width >= 161 ? 'xsmall' : 'base';
}

function itemFor(config: SvgConfig | null | undefined, size: IllustratedMessageSize): SvgItemConfig | undefined {
    if (!config) return undefined;
    return {
        large: config.large ?? config.scene,
        medium: config.medium ?? config.dialog,
        small: config.small ?? config.spot,
        xsmall: config.xsmall ?? config.dot,
        base: undefined
    }[size];
}

export type IllustratedMessageFigcaptionProps = useRender.ComponentProps<'figcaption'>;

/** The title and text of an illustrated message: a `<figcaption>`, placed under the illustration. */
export function IllustratedMessageFigcaption({ render, className, ...props }: IllustratedMessageFigcaptionProps) {
    return useRender({
        render,
        defaultTagName: 'figcaption',
        props: {
            ...props,
            className: cn('m-0 box-border flex max-w-(--im-fig) flex-col items-center overflow-hidden p-0', className)
        }
    });
}

export type IllustratedMessageTitleProps = useRender.ComponentProps<'h3'>;

/** Title of the message: an `<h3>` by default; render another heading level with `render`, e.g. `<h2 />`. */
export function IllustratedMessageTitle({ render, className, ...props }: IllustratedMessageTitleProps) {
    return useRender({
        render,
        defaultTagName: 'h3',
        props: {
            ...props,
            className: cn(
                'm-0 mb-(--im-title-mb) box-border w-full p-0 text-center font-sap-font-bold-family text-(length:--im-title) leading-[normal] text-sap-group-title-text-color',
                className
            )
        }
    });
}

export type IllustratedMessageTextProps = useRender.ComponentProps<'p'>;

/** Text of the message: a `<p>` by default. */
export function IllustratedMessageText({ render, className, ...props }: IllustratedMessageTextProps) {
    return useRender({
        render,
        defaultTagName: 'p',
        props: {
            ...props,
            className: cn(
                'm-0 box-border p-0 text-center text-(length:--im-text) leading-[normal] text-wrap text-sap-text-color',
                className
            )
        }
    });
}

export type IllustratedMessageActionsProps = useRender.ComponentProps<'div'>;

/** Buttons below the message, centred side by side. */
export function IllustratedMessageActions({ render, className, ...props }: IllustratedMessageActionsProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn('m-0 mt-(--im-act) box-border flex items-center justify-center gap-2 p-0', className)
        }
    });
}

export interface IllustratedMessageProps extends useRender.ComponentProps<'figure'> {
    /** Size; follows the width of the message when not set. */
    type?: IllustratedMessageType | null;
    /** The illustration of each size. */
    svgConfig?: SvgConfig | null;
    /** Accessible name of the illustration; decorative without it. */
    svgAriaLabel?: string | null;
    /** Text only, without the illustration. */
    noSvg?: boolean;
}

/**
 * Illustrated message: an SAP illustration with a title, a text and actions, for empty states, errors and
 * onboarding. Without a `type` the size follows the available width. An `IllustratedMessageFigcaption` child goes
 * under the illustration, the other children (e.g. `IllustratedMessageActions`) after them.
 *
 * ```tsx
 * <IllustratedMessage type="dialog" svgConfig={noMail}>
 *     <IllustratedMessageFigcaption>
 *         <IllustratedMessageTitle>No mail</IllustratedMessageTitle>
 *         <IllustratedMessageText>Check again later.</IllustratedMessageText>
 *     </IllustratedMessageFigcaption>
 *     <IllustratedMessageActions>
 *         <Button label="Refresh" />
 *     </IllustratedMessageActions>
 * </IllustratedMessage>
 * ```
 */
export function IllustratedMessage({
    type,
    svgConfig,
    svgAriaLabel,
    noSvg = false,
    id: idProp,
    ref,
    render,
    className,
    children,
    ...props
}: IllustratedMessageProps) {
    const autoId = useId();
    const id = idProp ?? `fd-illustrated-message-${autoId}`;
    const element = useRef<HTMLElement>(null);
    const [width, setWidth] = useState(0);
    const responsive = !type;

    // the size follows the width only without a type; a message created while hidden (width 0) picks its size
    // once it shows, as the observer reports the new width
    useLayoutEffect(() => {
        const el = element.current;
        if (!responsive || !el) return;
        setWidth(el.offsetWidth);
        const observer = new ResizeObserver(() => setWidth(el.offsetWidth));
        observer.observe(el);
        return () => observer.disconnect();
    }, [responsive]);

    const size = type ? ALIAS[type] : sizeForWidth(width);
    const item = noSvg ? undefined : itemFor(svgConfig, size);
    const showSvg = !noSvg && size !== 'base';

    // the figcaption goes into the container under the illustration, the rest (the actions) after it
    const items = Children.toArray(children);
    const isCaption = (child: ReactNode) => isValidElement(child) && child.type === IllustratedMessageFigcaption;

    return useRender({
        render,
        defaultTagName: 'figure',
        ref: ref ? [ref, element] : element,
        props: {
            ...props,
            id,
            'data-size': size,
            className: cn(
                'm-0 box-border flex w-full flex-col items-center p-(--im-p) text-center [forced-color-adjust:none]',
                'font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-text-color',
                SIZE[size],
                className
            ),
            children: (
                <>
                    <div className="m-0 box-border flex flex-col items-center p-0">
                        {showSvg && (
                            <svg
                                className="m-0 mb-(--im-ill-mb) box-border flex size-(--im-ill) max-h-(--im-ill-h) max-w-(--im-ill) p-0"
                                preserveAspectRatio="xMidYMid meet"
                                role={svgAriaLabel ? 'img' : undefined}
                                aria-label={svgAriaLabel || undefined}
                                aria-hidden={svgAriaLabel ? undefined : true}
                            >
                                {item && <use href={`${item.url ?? ''}#${item.id}`} />}
                            </svg>
                        )}
                        {showSvg && item?.file && <div hidden dangerouslySetInnerHTML={{ __html: item.file }} />}
                        {items.filter(isCaption)}
                    </div>
                    {items.filter((child) => !isCaption(child))}
                </>
            )
        }
    });
}
