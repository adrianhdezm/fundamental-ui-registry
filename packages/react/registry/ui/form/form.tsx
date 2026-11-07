/*
 * Port of fundamental-react (Forms) and @fundamental-ngx/core (form) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import { useRender } from '@base-ui/react/use-render';
import { createContext, use, useId, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export interface FormLabelProps extends ComponentProps<'label'> {
    /** Shows the required asterisk (empty alternative text: the field itself is `required`). */
    required?: boolean;
    /** Appends a colon that stays visible when the text is truncated. */
    colon?: boolean;
    /** Lets the label wrap instead of truncating. */
    allowWrap?: boolean;
    /** Aligns the label to the end of its column. */
    alignLabelEnd?: boolean;
    /** Dims the label (`aria-disabled` on its text); disable the field itself too. */
    disabled?: boolean;
    /** A unit description after a field (e.g. "EUR"), in the field text colour. */
    unitDescription?: boolean;
    /** A label not attached to a field, centred vertically. */
    independent?: boolean;
}

/**
 * Label of a form field, with required and colon markers. Connect it to the field with `htmlFor` (Angular's `for`)
 * and the field's `id`; it gets a generated `id` for `aria-labelledby` when none is given.
 *
 * ```tsx
 * <FormLabel htmlFor="name" required colon>Name</FormLabel>
 * <Input id="name" required />
 * ```
 */
export function FormLabel({
    required = false,
    colon = false,
    allowWrap = false,
    alignLabelEnd = false,
    disabled = false,
    unitDescription = false,
    independent = false,
    id: idProp,
    className,
    children,
    ...props
}: FormLabelProps) {
    const autoId = useId();
    return (
        <label
            {...props}
            id={idProp ?? `fd-form-label-${autoId}`}
            data-slot="form-label"
            className={cn('relative flex pb-0.5', alignLabelEnd && 'justify-end', className)}
        >
            <span
                aria-disabled={disabled || undefined}
                className={cn(
                    'relative m-0 -mb-0.5 inline-block w-fit max-w-full truncate p-0 me-2 self-start cursor-text',
                    'font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-content-label-color',
                    allowWrap && 'whitespace-normal',
                    required &&
                        "pe-2 after:absolute after:end-0 after:top-0 after:text-sap-font-large-size after:font-bold after:text-sap-field-required-color after:content-['*'_/_'']",
                    colon &&
                        "pe-1 before:absolute before:end-0 before:top-0 before:text-sap-font-size before:text-inherit before:content-[':']",
                    colon && required && 'pe-3 before:end-2',
                    unitDescription && 'm-0 p-0 ps-1 text-sap-field-text-color',
                    independent && 'self-center me-0',
                    disabled && 'pointer-events-none opacity-40'
                )}
            >
                {children}
            </span>
        </label>
    );
}

export interface FormItemProps extends ComponentProps<'div'> {
    /** Inline layout inside an inline form group (fundamental-react's `isInline`). */
    isInline?: boolean;
    /** Label and control on one line (fundamental-react's `isHorizontal`). */
    horizontal?: boolean;
}

/**
 * A label and its control, stacked (or side by side when `horizontal`).
 *
 * ```tsx
 * <FormItem>
 *     <FormLabel htmlFor="name">Name</FormLabel>
 *     <Input id="name" />
 * </FormItem>
 * ```
 */
export function FormItem({ isInline = false, horizontal = false, className, ...props }: FormItemProps) {
    return (
        <div
            {...props}
            data-slot="form-item"
            className={cn(
                'relative m-0 box-border flex flex-1 flex-col p-0',
                '[&>[data-slot=form-message]:not(:first-child)]:-mt-1',
                horizontal &&
                    'flex-row items-center [&_[data-slot=form-label]>span]:my-auto [&_[data-slot=form-label]>span]:me-1 [&_[data-slot=form-label]>span]:pb-0 [&>input]:flex-1',
                isInline && 'flex-none',
                className
            )}
        />
    );
}

export interface FormGroupProps extends ComponentProps<'div'> {
    /** Lays the items out in a wrapping row. */
    isInline?: boolean;
    /** Adds a 0.625rem gap between the items. */
    withSpacing?: boolean;
}

/**
 * Groups form items in a column, or in a wrapping row when `isInline`. Give it `role="group"` and
 * `aria-labelledby` (e.g. its `FormGroupHeader`) when the group needs a name.
 *
 * ```tsx
 * <FormGroup withSpacing>
 *     <FormItem>…</FormItem>
 *     <FormItem>…</FormItem>
 * </FormGroup>
 * ```
 */
export function FormGroup({ isInline = false, withSpacing = false, className, ...props }: FormGroupProps) {
    return (
        <div
            {...props}
            data-slot="form-group"
            className={cn(
                'm-0 box-border flex flex-col p-0',
                isInline && 'flex-row flex-wrap justify-start [&>[data-slot=form-item]]:flex-none',
                withSpacing && 'gap-2.5',
                className
            )}
        />
    );
}

export interface FormGroupHeaderProps extends useRender.ComponentProps<'div'> {
    /** Removes the inline padding. */
    noPadding?: boolean;
    /** Removes the bottom border. */
    noBorder?: boolean;
}

/**
 * Header of a form group: a title bar with the group title. Renders a `<div>`; use `render={<h4 />}` for a heading.
 */
export function FormGroupHeader({
    noPadding = false,
    noBorder = false,
    render,
    className,
    ...props
}: FormGroupHeaderProps) {
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex w-full items-center min-h-sap-element-line-height compact:min-h-sap-element-compact-line-height',
                // the title border width of the theme (2px in high contrast; Angular has 1px everywhere)
                'bg-sap-group-title-background border-b-(length:--sapGroup_TitleBorderWidth) border-b-sap-group-title-border-color px-4',
                'font-sap-font-header-family text-sap-group-title-font-size font-bold text-sap-group-title-text-color',
                noPadding && 'px-0',
                noBorder && 'border-b-0',
                className
            )
        }
    });
}

/**
 * Title bar above a form. Renders an `<h4>` (Angular's `<h4 fdFormHeader>`); change the level with `render`, e.g.
 * `render={<h3 />}`. The text is truncated with an ellipsis.
 */
export function FormHeader({ render, className, children, ...props }: useRender.ComponentProps<'h4'>) {
    return useRender({
        render,
        defaultTagName: 'h4',
        props: {
            ...props,
            className: cn(
                'm-0 box-border flex h-sap-element-line-height w-full items-center bg-sap-group-title-background px-4',
                // the bottom line as a shadow, the title border width of the theme (Angular: 3px in high contrast, not 2px)
                '[box-shadow:0_var(--sapGroup_TitleBorderWidth)_0_var(--sapGroup_TitleBorderColor)]',
                className
            ),
            children: (
                <span className="m-0 truncate p-0 font-sap-font-header-family text-sap-group-title-font-size font-normal text-sap-group-title-text-color">
                    {children}
                </span>
            )
        }
    });
}

/** Tells a `FormLegend` that it is in a `FormFieldset`, where it takes Base UI's legend part. */
const FieldsetContext = createContext(false);

export interface FormFieldsetProps extends Omit<BaseFieldset.Root.Props, 'className'> {
    className?: string;
}

/**
 * A `<fieldset>` without browser chrome, on Base UI's Fieldset: its `FormLegend` names the group (also a
 * `RadioGroup` inside it), and `disabled` disables its controls, Base UI fields included, and dims the legend.
 *
 * ```tsx
 * <FormFieldset>
 *     <FormLegend>Shipping address</FormLegend>
 *     <FormItem>…</FormItem>
 * </FormFieldset>
 * ```
 */
export function FormFieldset({ className, ...props }: FormFieldsetProps) {
    return (
        <FieldsetContext value={true}>
            <BaseFieldset.Root
                {...props}
                className={cn(
                    'm-0 box-border min-w-auto border-0 p-0 font-sap-font-family text-sap-font-size text-sap-text-color',
                    className
                )}
            />
        </FieldsetContext>
    );
}

export interface FormLegendProps extends ComponentProps<'legend'> {
    /** Dims the legend on its own (a disabled `FormFieldset` dims it too). */
    disabled?: boolean;
}

/** The `<legend>` of a fieldset: the name of the group. */
export function FormLegend({ disabled = false, id, className, ...props }: FormLegendProps) {
    const inFieldset = use(FieldsetContext);
    const legendClassName = cn(
        'm-0 block p-0 font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color',
        'data-disabled:opacity-(--sapContent_DisabledOpacity)',
        disabled && 'opacity-(--sapContent_DisabledOpacity)',
        className
    );
    if (inFieldset) {
        // Base UI's legend part (its id names the fieldset, its data-disabled follows the fieldset) as a <legend>
        return <BaseFieldset.Legend id={id} render={<legend {...props} />} className={legendClassName} />;
    }
    return <legend {...props} id={id} className={legendClassName} />;
}
