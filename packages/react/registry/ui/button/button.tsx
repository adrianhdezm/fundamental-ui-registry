/*
 * Port of fundamental-react (Button) and @fundamental-ngx/core (button) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button as BaseButton } from '@base-ui/react/button';
import { useEffect, useId, useRef, useState, type ComponentProps, type MouseEvent, type ReactNode } from 'react';
import { cn, cva, type VariantProps } from '@/lib/utils';
import { Icon, type IconFont } from '@/ui/icon/icon';

export const buttonVariants = cva(
    [
        'relative box-border inline-flex items-center justify-center gap-1.5 align-middle',
        'h-sap-element-height max-h-sap-element-height min-w-9 px-[calc(0.625rem_-_var(--sapButton_BorderWidth))]',
        'compact:h-sap-element-compact-height compact:max-h-sap-element-compact-height compact:min-w-8 compact:px-[calc(0.5rem_-_var(--sapButton_BorderWidth))]',
        'rounded-sap-button-border-corner-radius border-solid border-width-sap-button-border-width',
        'text-sap-font-size leading-[normal] text-center whitespace-nowrap no-underline select-none cursor-pointer appearance-none outline-0 [forced-color-adjust:none]',
        // extended touch area: 2.75rem cozy, 2rem compact
        "before:absolute before:inset-x-0 before:-inset-y-[calc((2.75rem_-_var(--sapElement_Height))/2)] before:content-['']",
        'compact:before:-inset-y-[calc((2rem_-_var(--sapElement_Compact_Height))/2)]',
        // SAP focus indicator: an inner rounded frame
        "focus:z-[5] focus:after:pointer-events-none focus:after:absolute focus:after:inset-(--sapButton_BorderWidth) focus:after:content-['']",
        'focus:after:rounded-[calc(var(--sapButton_BorderCornerRadius)_-_var(--sapContent_FocusWidth))]',
        'focus:after:border-(length:--sapContent_FocusWidth) focus:after:[border-style:var(--sapContent_FocusStyle)] focus:after:border-sap-content-focus-color',
        'disabled:cursor-not-allowed disabled:opacity-(--sapContent_DisabledOpacity) disabled:shadow-none',
        'aria-disabled:cursor-not-allowed aria-disabled:opacity-(--sapContent_DisabledOpacity) aria-disabled:shadow-none'
    ],
    {
        variants: {
            variant: {
                standard: [
                    'font-sap-button-font-family bg-sap-button-background border-sap-button-border-color text-sap-button-text-color',
                    'enabled-hover:bg-sap-button-hover-background enabled-hover:border-sap-button-hover-border-color enabled-hover:text-sap-button-hover-text-color',
                    'enabled-active:bg-sap-button-active-background enabled-active:border-sap-button-active-border-color enabled-active:text-sap-button-active-text-color',
                    'toggled:bg-sap-button-selected-background toggled:border-sap-button-selected-border-color toggled:text-sap-button-selected-text-color',
                    'toggled:enabled-hover:bg-sap-button-selected-hover-background toggled:enabled-hover:border-sap-button-selected-hover-border-color toggled:enabled-hover:text-sap-button-selected-text-color',
                    'toggled:enabled-active:bg-sap-button-selected-hover-background toggled:enabled-active:border-sap-button-selected-hover-border-color toggled:enabled-active:text-sap-button-selected-text-color'
                ],
                emphasized: [
                    'font-sap-button-emphasized-font-family border-width-sap-button-emphasized-border-width',
                    'bg-sap-button-emphasized-background border-sap-button-emphasized-border-color text-sap-button-emphasized-text-color',
                    'enabled-hover:bg-sap-button-emphasized-hover-background enabled-hover:border-sap-button-emphasized-hover-border-color enabled-hover:text-sap-button-emphasized-hover-text-color',
                    'enabled-active:bg-sap-button-emphasized-active-background enabled-active:border-sap-button-emphasized-active-border-color enabled-active:text-sap-button-emphasized-active-text-color',
                    'toggled:bg-sap-button-selected-background toggled:border-sap-button-selected-border-color toggled:text-sap-button-selected-text-color',
                    'toggled:enabled-hover:bg-sap-button-selected-hover-background toggled:enabled-hover:border-sap-button-selected-hover-border-color toggled:enabled-hover:text-sap-button-selected-text-color',
                    'toggled:enabled-active:bg-sap-button-selected-hover-background toggled:enabled-active:border-sap-button-selected-hover-border-color toggled:enabled-active:text-sap-button-selected-text-color',
                    'focus:after:border-sap-content-contrast-focus-color focus:enabled-active:after:border-sap-content-focus-color',
                    'toggled:focus:after:border-sap-content-focus-color compact:focus:enabled-active:after:border-transparent'
                ],
                ghost: [
                    'font-sap-button-font-family bg-sap-button-background border-sap-button-border-color text-sap-button-text-color',
                    'enabled-hover:bg-sap-button-hover-background enabled-hover:border-sap-button-hover-border-color enabled-hover:text-sap-button-hover-text-color',
                    'enabled-active:bg-sap-button-active-background enabled-active:border-sap-button-active-border-color enabled-active:text-sap-button-active-text-color',
                    'toggled:bg-sap-button-selected-background toggled:border-sap-button-selected-border-color toggled:text-sap-button-selected-text-color',
                    'toggled:enabled-hover:bg-sap-button-selected-hover-background toggled:enabled-hover:border-sap-button-selected-hover-border-color toggled:enabled-hover:text-sap-button-selected-text-color',
                    'toggled:enabled-active:bg-sap-button-selected-hover-background toggled:enabled-active:border-sap-button-selected-hover-border-color toggled:enabled-active:text-sap-button-selected-text-color'
                ],
                positive: [
                    'font-sap-button-font-family bg-sap-button-accept-background border-sap-button-accept-border-color text-sap-button-accept-text-color',
                    'enabled-hover:bg-sap-button-accept-hover-background enabled-hover:border-sap-button-accept-hover-border-color enabled-hover:text-sap-button-accept-hover-text-color',
                    'enabled-active:bg-sap-button-accept-active-background enabled-active:border-sap-button-accept-active-border-color enabled-active:text-sap-button-accept-active-text-color',
                    'toggled:bg-sap-button-accept-selected-background toggled:border-sap-button-accept-selected-border-color toggled:text-sap-button-accept-selected-text-color',
                    'toggled:enabled-hover:bg-sap-button-accept-selected-hover-background toggled:enabled-hover:border-sap-button-accept-selected-hover-border-color toggled:enabled-hover:text-sap-button-accept-selected-text-color',
                    'toggled:enabled-active:bg-sap-button-accept-selected-hover-background toggled:enabled-active:border-sap-button-accept-selected-hover-border-color toggled:enabled-active:text-sap-button-accept-selected-text-color'
                ],
                negative: [
                    'font-sap-button-font-family bg-sap-button-reject-background border-sap-button-reject-border-color text-sap-button-reject-text-color',
                    'enabled-hover:bg-sap-button-reject-hover-background enabled-hover:border-sap-button-reject-hover-border-color enabled-hover:text-sap-button-reject-hover-text-color',
                    'enabled-active:bg-sap-button-reject-active-background enabled-active:border-sap-button-reject-active-border-color enabled-active:text-sap-button-reject-active-text-color',
                    'toggled:bg-sap-button-reject-selected-background toggled:border-sap-button-reject-selected-border-color toggled:text-sap-button-reject-selected-text-color',
                    'toggled:enabled-hover:bg-sap-button-reject-selected-hover-background toggled:enabled-hover:border-sap-button-reject-selected-hover-border-color toggled:enabled-hover:text-sap-button-reject-selected-text-color',
                    'toggled:enabled-active:bg-sap-button-reject-selected-hover-background toggled:enabled-active:border-sap-button-reject-selected-hover-border-color toggled:enabled-active:text-sap-button-reject-selected-text-color'
                ],
                attention: [
                    'font-sap-button-font-family bg-sap-button-attention-background border-sap-button-attention-border-color text-sap-button-attention-text-color',
                    'enabled-hover:bg-sap-button-attention-hover-background enabled-hover:border-sap-button-attention-hover-border-color enabled-hover:text-sap-button-attention-hover-text-color',
                    'enabled-active:bg-sap-button-attention-active-background enabled-active:border-sap-button-attention-active-border-color enabled-active:text-sap-button-attention-active-text-color',
                    'toggled:bg-sap-button-attention-selected-background toggled:border-sap-button-attention-selected-border-color toggled:text-sap-button-attention-selected-text-color',
                    'toggled:enabled-hover:bg-sap-button-attention-selected-hover-background toggled:enabled-hover:border-sap-button-attention-selected-hover-border-color toggled:enabled-hover:text-sap-button-attention-selected-text-color',
                    'toggled:enabled-active:bg-sap-button-attention-selected-hover-background toggled:enabled-active:border-sap-button-attention-selected-hover-border-color toggled:enabled-active:text-sap-button-attention-selected-text-color'
                ],
                transparent: [
                    'font-sap-button-font-family bg-sap-button-lite-background border-sap-button-lite-border-color text-sap-button-lite-text-color',
                    'enabled-hover:bg-sap-button-lite-hover-background enabled-hover:border-sap-button-lite-hover-border-color enabled-hover:text-sap-button-lite-hover-text-color',
                    'enabled-active:bg-sap-button-lite-active-background enabled-active:border-sap-button-lite-active-border-color enabled-active:text-sap-button-active-text-color',
                    'toggled:bg-sap-button-selected-background toggled:border-sap-button-selected-border-color toggled:text-sap-button-selected-text-color',
                    'toggled:enabled-hover:bg-sap-button-selected-hover-background toggled:enabled-hover:border-sap-button-selected-hover-border-color toggled:enabled-hover:text-sap-button-selected-text-color',
                    'toggled:enabled-active:bg-sap-button-selected-hover-background toggled:enabled-active:border-sap-button-selected-hover-border-color toggled:enabled-active:text-sap-button-selected-text-color'
                ]
            },
            menu: {
                true: 'max-w-48',
                false: ''
            },
            /** Fills the width of its container. */
            fullWidth: {
                true: 'flex w-full min-w-full',
                false: ''
            },
            /** Minimum width for decisive actions (OK, Cancel) in dialogs and footers. */
            decisive: {
                // also in compact, over the compact minimum (`compact:min-w-8`)
                true: 'min-w-16 compact:min-w-16',
                false: ''
            }
        },
        defaultVariants: { variant: 'standard', menu: false, fullWidth: false, decisive: false }
    }
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type GlyphPosition = 'before' | 'after';

/** Button types that announce their semantics to screen readers through a hidden description. */
const SPECIAL_TYPE_DESCRIPTIONS: Partial<Record<ButtonVariant, string>> = {
    emphasized: 'Default Action',
    positive: 'Positive Action',
    negative: 'Negative Action',
    attention: 'Warning'
};

/** Roles that support aria-selected; elsewhere `selected` is visual only. */
const SELECTABLE_ROLES = new Set(['option', 'tab', 'gridcell', 'row', 'treeitem', 'columnheader', 'rowheader']);

/** Button types that support a badge. */
export const BADGE_ENABLED_BUTTON_VARIANTS: ButtonVariant[] = ['emphasized', 'standard', 'ghost', 'transparent'];

export interface ButtonProps extends Omit<BaseButton.Props, 'className' | 'children'> {
    className?: string;
    children?: ReactNode;
    /** Visual type of the button. */
    variant?: ButtonVariant;
    /** Text of the button. Children work too. */
    label?: ReactNode;
    /** Glyph name of an SAP icon shown in the button. */
    glyph?: string | null;
    /** Whether the glyph goes before or after the label. */
    glyphPosition?: GlyphPosition;
    /** Icon font of the glyph. */
    glyphFont?: IconFont;
    /** Shows the menu arrow; use for buttons that open a menu. */
    menu?: boolean;
    /** Toggle button state, exposed as aria-pressed. */
    toggled?: boolean;
    /**
     * Selected state, e.g. inside a group. Shown with the selected colours; exposed as aria-selected when the button
     * has a role that supports it (option, tab, ...).
     */
    selected?: boolean;
    /**
     * With `disabled`, keeps the button focusable and exposes the state with aria-disabled instead (e.g. to keep a
     * tooltip reachable). Clicks and keyboard activation are still ignored.
     */
    focusableWhenDisabled?: boolean;
    /** Fills the width of its container. */
    fullWidth?: boolean;
    /** Minimum width for decisive actions (OK, Cancel) in dialogs and footers. */
    decisive?: boolean;
    /** Extra description announced after the name. The native `aria-description` prop works the same way. */
    description?: string | null;
    /** Overrides the default description of the special types (emphasized, positive, negative, attention). */
    typeDescription?: string | null;
    /** Badge content (up to 4 characters), as a `ButtonBadge`. */
    badge?: ReactNode;
    /** Announced while the button is disabled and focusable: why it is disabled or how to enable it. */
    disabledMessage?: string;
    /** Announced when a disabled, focusable button becomes enabled. */
    enabledMessage?: string;
}

/**
 * SAP Fiori button, on Base UI's Button. Renders a `<button>`; pass `render={<a href="..." />}` with
 * `nativeButton={false}` for a link that looks like a button.
 *
 * ```tsx
 * <Button label="Save" variant="emphasized" />
 * <Button glyph="add" aria-label="Add" />
 * <Button toggled={bold} onClick={() => setBold(!bold)}>Bold</Button>
 * ```
 */
export function Button({
    variant = 'standard',
    label,
    glyph,
    glyphPosition = 'before',
    glyphFont = 'SAP-icons',
    menu = false,
    toggled = false,
    selected = false,
    disabled = false,
    focusableWhenDisabled = false,
    fullWidth = false,
    decisive = false,
    description,
    typeDescription,
    badge,
    disabledMessage,
    enabledMessage,
    nativeButton = true,
    type = 'button',
    id: idProp,
    className,
    children,
    onClick,
    'aria-description': nativeDescription,
    ...props
}: ButtonProps) {
    const autoId = useId();
    const id = idProp ?? `fd-button-${autoId}`;

    const userDescribedBy = props['aria-describedby'];
    const effectiveDescription = description ?? nativeDescription;
    const fallbackType = SPECIAL_TYPE_DESCRIPTIONS[variant];
    const effectiveTypeDescription = fallbackType ? typeDescription || fallbackType : null;
    const focusableDisabled = disabled && focusableWhenDisabled;
    const announced = useEnabledAnnouncement(focusableDisabled, enabledMessage);

    const describedBy: string[] = [];
    if (effectiveDescription) describedBy.push(`${id}-description`);
    if (effectiveTypeDescription) describedBy.push(`${id}-type-description`);
    if (focusableDisabled && disabledMessage) describedBy.push(`${id}-disabled-message`);

    // icon-only special buttons fall back to the glyph name
    const hasText = label != null && label !== '' ? true : children != null && children !== '';
    const ariaLabel = props['aria-label'] ?? (fallbackType && !hasText && glyph ? glyph.replace(/-/g, ' ') : undefined);

    const glyphIcon = glyph ? <Icon glyph={glyph} font={glyphFont} /> : null;

    return (
        <>
            <BaseButton
                {...props}
                id={id}
                type={nativeButton ? type : undefined}
                nativeButton={nativeButton}
                disabled={disabled}
                focusableWhenDisabled={focusableWhenDisabled}
                aria-label={ariaLabel}
                aria-pressed={toggled ? true : props['aria-pressed']}
                aria-selected={selected && SELECTABLE_ROLES.has(props.role ?? '') ? true : props['aria-selected']}
                data-selected={selected ? '' : undefined}
                aria-describedby={userDescribedBy ?? (describedBy.length ? describedBy.join(' ') : undefined)}
                className={cn(buttonVariants({ variant, menu, fullWidth, decisive }), className)}
                onClick={(event: MouseEvent<HTMLElement>) => {
                    // Safari does not focus buttons on click; focus them so the focus indicator shows consistently.
                    // Buttons out of the tab order (e.g. in input groups) stay unfocused.
                    const target = event.currentTarget;
                    if (target.tabIndex >= 0 && document.activeElement !== target) target.focus();
                    onClick?.(event as Parameters<NonNullable<typeof onClick>>[0]);
                }}
            >
                {glyphPosition === 'before' && glyphIcon}
                {label != null && label !== '' && (
                    <span className={cn('truncate font-[inherit] text-inherit', menu && 'flex-1 text-start leading-4')}>
                        {label}
                    </span>
                )}
                {children}
                {glyphPosition === 'after' && glyphIcon}
                {menu && <Icon glyph="slim-arrow-down" />}
                {badge != null && badge !== '' && <ButtonBadge>{badge}</ButtonBadge>}
                {!userDescribedBy && effectiveDescription && (
                    <span className="sr-only-sap" id={`${id}-description`}>
                        {effectiveDescription}
                    </span>
                )}
                {!userDescribedBy && effectiveTypeDescription && (
                    <span className="sr-only-sap" id={`${id}-type-description`}>
                        {effectiveTypeDescription}
                    </span>
                )}
                {!userDescribedBy && focusableDisabled && disabledMessage && (
                    <span className="sr-only-sap" id={`${id}-disabled-message`}>
                        {disabledMessage}
                    </span>
                )}
            </BaseButton>
            {enabledMessage && (
                <span className="sr-only-sap" role="status" aria-live="polite">
                    {announced ? enabledMessage : ''}
                </span>
            )}
        </>
    );
}

/** True once a disabled, focusable button became enabled, so its live region announces the enabled message. */
function useEnabledAnnouncement(focusableDisabled: boolean, enabledMessage: string | undefined): boolean {
    const [announced, setAnnounced] = useState(false);
    const wasDisabled = useRef(focusableDisabled);
    useEffect(() => {
        if (wasDisabled.current && !focusableDisabled && enabledMessage) setAnnounced(true);
        if (focusableDisabled) setAnnounced(false);
        wasDisabled.current = focusableDisabled;
    }, [focusableDisabled, enabledMessage]);
    return announced;
}

export interface ButtonBadgeProps extends ComponentProps<'span'> {
    /** Dot-only badge for attention without a number. */
    attention?: boolean;
}

/**
 * Counter badge on a button (up to 4 characters). Supported on standard, emphasized, ghost and transparent buttons.
 *
 * ```tsx
 * <Button glyph="bell" aria-label="Notifications"><ButtonBadge>12</ButtonBadge></Button>
 * ```
 */
export function ButtonBadge({ attention = false, className, children, ...props }: ButtonBadgeProps) {
    return (
        <span
            {...props}
            className={cn(
                'z-[1] box-border inline-flex items-center justify-center whitespace-nowrap',
                'absolute -top-[0.3125rem] -end-[0.3125rem] h-4 px-[0.3125rem] rounded-lg',
                'border border-solid border-sap-content-badge-border-color bg-sap-content-badge-background',
                'font-sap-font-family text-sap-font-small-size text-sap-content-badge-text-color leading-[normal]',
                'compact:static compact:ms-1',
                attention &&
                    'size-3 px-0 -top-[0.1875rem] -end-[0.1875rem] compact:absolute compact:ms-0 compact:size-2.5',
                className
            )}
        >
            {attention ? null : children}
        </span>
    );
}
