/*
 * Port of fundamental-react (Bar) and @fundamental-ngx/core (bar) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { useId, type AriaRole, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/ui/button/button';

export type BarDesign = 'header' | 'subheader' | 'header-with-subheader' | 'footer' | 'floating-footer';
/** Responsive size of page bars: s (small), m_l (medium/large) or xl. */
export type BarSize = 's' | 'm_l' | 'xl';

/** Horizontal padding (--bar-px) and floating footer offset (--bar-off) per page size. */
const PAGE_SIZE: Record<BarSize | 'default', string> = {
    default: '[--bar-px:1rem] [--bar-off:1rem]',
    s: '[--bar-px:1rem] [--bar-off:1rem]',
    m_l: '[--bar-px:2rem] [--bar-off:2rem]',
    xl: '[--bar-px:3rem] [--bar-off:3rem]'
};
const HOME_PAGE_SIZE: Record<BarSize | 'default', string> = {
    ...PAGE_SIZE,
    s: '[--bar-px:0.5rem] [--bar-off:1rem]'
};

const DESIGN: Record<BarDesign, string> = {
    header: [
        '[--bar-tc:var(--sapPageHeader_TextColor)] [--bar-tf:var(--sapFontHeaderFamily)] [--bar-ts:var(--sapFontHeader5Size)]',
        'has-[+[data-bar-design=subheader]]:[--bar-shadow:none]'
    ].join(' '),
    subheader: '[--bar-h:3rem] compact:[--bar-h:2.25rem] [--bar-pb:0.25rem]',
    'header-with-subheader': 'relative z-[2] [--bar-shadow:none]',
    footer: [
        '[--bar-shadow:none] [--bar-bg:var(--sapPageFooter_Background)] [--bar-tc:var(--sapPageFooter_TextColor)]',
        'border-t-(length:--sapGroup_TitleBorderWidth) border-solid border-sap-page-footer-border-color'
    ].join(' '),
    'floating-footer': [
        '[--bar-shadow:var(--sapContent_Shadow1)] [--bar-bg:var(--sapPageFooter_Background)] [--bar-tc:var(--sapPageFooter_TextColor)]',
        'absolute inset-x-(--bar-off) bottom-2 z-[1000] rounded-sap-element-border-corner-radius [--bar-off:0.5rem]'
    ].join(' ')
};

export interface BarProps extends Omit<useRender.ComponentProps<'div'>, 'role'> {
    /** Header, subheader, header with subheader, footer or floating footer; a plain bar by default. */
    barDesign?: BarDesign | null;
    /** Page paddings (and floating footer offsets) for `size`. */
    inPage?: boolean;
    /** Home page paddings for `size`. */
    inHomePage?: boolean;
    /** Responsive size of `inPage` and `inHomePage` bars. */
    size?: BarSize | null;
    /** No shadow. */
    clear?: boolean;
    /** Grows with its content, with the top padding of an initial suggestion title. */
    initialSuggestionTitle?: boolean;
    /** Grows with its content, with the paddings of an initial suggestion subline. */
    initialSuggestionSubline?: boolean;
    /** `toolbar` by default; `null` removes the role. */
    role?: AriaRole | null;
}

/**
 * Bar: a horizontal container for titles and actions in left, middle and right areas, used as page, dialog and
 * popover headers, subheaders and footers. Renders a `<div role="toolbar">`; `render` renders another element
 * (e.g. `<header />` or `<footer />`).
 *
 * ```tsx
 * <Bar barDesign="footer" aria-label="Actions">
 *     <BarRight>
 *         <ButtonBar variant="emphasized" label="Save" />
 *         <ButtonBar label="Cancel" />
 *     </BarRight>
 * </Bar>
 * ```
 */
export function Bar({
    barDesign,
    inPage = false,
    inHomePage = false,
    size,
    clear = false,
    initialSuggestionTitle = false,
    initialSuggestionSubline = false,
    role = 'toolbar',
    render,
    className,
    ...props
}: BarProps) {
    const sizeKey = size ?? 'default';
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            role: role ?? undefined,
            'data-bar-design': barDesign || undefined,
            className: cn(
                'relative z-[1] m-0 box-border flex justify-between gap-2 p-0 [forced-color-adjust:none]',
                'min-h-(--bar-h) ps-(--bar-px) pe-(--bar-px) pt-(--bar-pt) pb-(--bar-pb)',
                // the shadow on its own: the shadow-* utility adds Tailwind's transparent ring and inset layers
                'bg-(--bar-bg) [box-shadow:var(--bar-shadow)] font-sap-font-family text-sap-font-size font-normal leading-[normal] text-sap-text-color',
                '[--bar-h:2.75rem] compact:[--bar-h:2.5rem] [--bar-px:1rem] [--bar-pt:0] [--bar-pb:0]',
                '[--bar-shadow:var(--sapContent_HeaderShadow)] [--bar-bg:var(--sapPageHeader_Background)]',
                '[--bar-tc:var(--sapTextColor)] [--bar-tf:var(--sapFontFamily)] [--bar-ts:var(--sapFontSize)]',
                barDesign && DESIGN[barDesign],
                inPage && PAGE_SIZE[sizeKey],
                inHomePage && HOME_PAGE_SIZE[sizeKey],
                barDesign === 'floating-footer' && (inPage || inHomePage) && '[--bar-px:0.5rem]',
                clear && '[--bar-shadow:none]',
                initialSuggestionTitle && 'h-auto pt-2',
                initialSuggestionSubline && 'h-auto pt-1 [--bar-pb:0.5rem]',
                className
            )
        }
    });
}

const AREA =
    'm-0 box-border flex min-w-0 flex-[0_1_auto] items-center gap-2 p-0 has-[button,input]:min-w-fit has-[h1,h2,h3,h4,h5,h6]:min-w-0 has-[h1,h2,h3,h4,h5,h6]:shrink only:w-full only:flex-[1_1_100%]';

export interface BarAreaProps extends ComponentProps<'div'> {
    /** Stacks the elements of the area in a column. */
    stackContentsVertically?: boolean;
}

/** The start area of a bar (left in LTR). */
export function BarLeft({ stackContentsVertically = false, className, ...props }: BarAreaProps) {
    return <div {...props} className={cn(AREA, stackContentsVertically && 'flex-col', className)} />;
}

/** The centred area of a bar. */
export function BarMiddle({ stackContentsVertically = false, className, ...props }: BarAreaProps) {
    return <div {...props} className={cn(AREA, 'justify-center', stackContentsVertically && 'flex-col', className)} />;
}

/** The end area of a bar (right in LTR). */
export function BarRight({ stackContentsVertically = false, className, ...props }: BarAreaProps) {
    return <div {...props} className={cn(AREA, 'justify-end', stackContentsVertically && 'flex-col', className)} />;
}

const ELEMENT =
    'm-0 box-border flex max-h-full max-w-full items-center justify-center p-0 [text-wrap:auto] font-normal text-(--bar-tc) font-(family-name:--bar-tf) text-(length:--bar-ts) leading-[normal] [forced-color-adjust:none]';

export interface BarElementProps extends ComponentProps<'div'> {
    /** Stretches the element (and its first child) over the area. */
    fullWidth?: boolean;
}

/** An item of a bar area: a title, a control or a group. In a header bar its text takes the header font. */
export function BarElement({ fullWidth = false, className, ...props }: BarElementProps) {
    return <div {...props} className={cn(ELEMENT, fullWidth && 'w-full [&>*:first-child]:grow', className)} />;
}

export interface ButtonBarProps extends ButtonProps {
    /** Stretches the bar element and its button over the area. */
    fullWidth?: boolean;
    /** Props for the bar element around the button (e.g. a `className`). */
    elementProps?: ComponentProps<'div'>;
}

/**
 * A bar element with a button, transparent by default. Its props and `ref` go to the `Button`; `elementProps` go
 * to the bar element around it.
 *
 * ```tsx
 * <ButtonBar glyph="navigation-left-arrow" aria-label="Back" onClick={goBack} />
 * <ButtonBar variant="emphasized" label="Save" />
 * ```
 */
export function ButtonBar({
    variant = 'transparent',
    fullWidth = false,
    disabled = false,
    id: idProp,
    elementProps,
    ...props
}: ButtonBarProps) {
    const autoId = useId();
    const { className: elementClassName, ...elementRest } = elementProps ?? {};
    return (
        <div
            {...elementRest}
            className={cn(
                ELEMENT,
                fullWidth && 'w-full [&>*:first-child]:grow',
                disabled && 'pointer-events-none',
                elementClassName
            )}
        >
            <Button {...props} id={idProp ?? `fd-button-bar-${autoId}`} variant={variant} disabled={disabled} />
        </div>
    );
}
