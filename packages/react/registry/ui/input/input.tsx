/*
 * Port of fundamental-react (Forms) and @fundamental-ngx/core (input) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Input as BaseInput } from '@base-ui/react/input';
import { useId, useState, type ChangeEvent, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FormState = 'success' | 'error' | 'warning' | 'information' | 'default';

/**
 * Field styles shared by inputs, textareas and other field-like controls (select, combobox, ...).
 * The background shorthand carries the SAP bottom border line, so style and colour go together.
 */
export const fieldBase = [
    'relative z-[1] box-border m-0 my-1 w-full min-w-11 h-sap-element-height min-h-sap-element-height px-2.5 py-0',
    'compact:my-[0.1875rem] compact:min-w-8 compact:h-sap-element-compact-height compact:min-h-sap-element-compact-height compact:px-2',
    'font-sap-font-family text-sap-font-size font-normal leading-[normal] text-sap-field-text-color truncate',
    'rounded-sap-field-border-corner-radius [box-shadow:var(--sapField_Shadow)] outline-none appearance-none cursor-text [forced-color-adjust:none]',
    'border-width-sap-field-border-width [border-style:var(--sapField_BorderStyle)] border-sap-field-border-color',
    '[background:var(--sapField_BackgroundStyle)_var(--sapField_Background)]',
    'placeholder:italic placeholder:text-sap-field-placeholder-text-color hc:placeholder:not-italic rtl:placeholder:indent-[0.125rem]',
    'selection:bg-sap-selected-color selection:text-sap-content-contrast-text-color',
    'hover:[background:var(--sapField_Hover_BackgroundStyle)_var(--sapField_Hover_Background)] hover:border-sap-field-hover-border-color hover:[box-shadow:var(--sapField_Hover_Shadow)]',
    'focus:z-[5] focus:[background:var(--sapField_Focus_Background)] focus:[box-shadow:none] focus:outline-sap focus:outline-sap-field-active-border-color',
    'focus:outline-offset-[-0.125rem] hc:focus:outline-offset-[-0.25rem]',
    'aria-expanded:z-[4]',
    'disabled:pointer-events-none disabled:opacity-(--sapContent_DisabledOpacity) disabled:placeholder:opacity-0',
    'aria-disabled:pointer-events-none aria-disabled:opacity-(--sapContent_DisabledOpacity) aria-disabled:placeholder:opacity-0',
    'readonly:[box-shadow:none] readonly:border-sap-field-read-only-border-color readonly:placeholder:opacity-0',
    'readonly:[background:var(--sapField_ReadOnly_BackgroundStyle)_var(--sapField_ReadOnly_Background)]',
    'readonly:hover:[box-shadow:none] readonly:hover:border-sap-field-read-only-border-color',
    'readonly:hover:[background:var(--sapField_ReadOnly_BackgroundStyle)_var(--sapField_ReadOnly_Background)]',
    'readonly:focus:[background:var(--sapField_ReadOnly_BackgroundStyle)_var(--sapField_ReadOnly_Background)] readonly:focus:outline-offset-[-0.25rem]'
].join(' ');

/** Value state styles of fields. Error and warning in high contrast use italic bold text. */
export const fieldStates: Record<FormState, string> = {
    default: '',
    error: [
        '[background:var(--sapField_InvalidBackgroundStyle)_var(--sapField_InvalidBackground)] [box-shadow:var(--sapField_InvalidShadow)]',
        'border-sap-field-invalid-color border-width-sap-field-invalid-border-width [border-style:var(--sapField_InvalidBorderStyle)]',
        'hover:[background:var(--sapField_InvalidBackgroundStyle)_var(--sapField_Hover_Background)] hover:border-sap-field-invalid-color hover:[box-shadow:var(--sapField_InvalidShadow)]',
        'focus:[background:var(--sapField_Focus_Background)] focus:outline-sap-field-invalid-color focus:[box-shadow:var(--sapField_InvalidShadow)] focus:hover:[box-shadow:none]',
        'placeholder:text-sap-field-text-color hc:italic hc:font-bold hc:placeholder:font-bold'
    ].join(' '),
    warning: [
        '[background:var(--sapField_WarningBackgroundStyle)_var(--sapField_WarningBackground)] [box-shadow:var(--sapField_WarningShadow)]',
        'border-sap-field-warning-color border-width-sap-field-warning-border-width [border-style:var(--sapField_WarningBorderStyle)]',
        'hover:[background:var(--sapField_WarningBackgroundStyle)_var(--sapField_Hover_Background)] hover:border-sap-field-warning-color hover:[box-shadow:var(--sapContent_Critical_Shadow)]',
        'focus:[background:var(--sapField_Focus_Background)] focus:outline-sap-field-warning-color focus:[box-shadow:var(--sapField_WarningShadow)] focus:hover:[box-shadow:none]',
        'hc:italic hc:font-bold hc:placeholder:font-bold'
    ].join(' '),
    success: [
        '[background:var(--sapField_SuccessBackgroundStyle)_var(--sapField_SuccessBackground)] [box-shadow:var(--sapField_SuccessShadow)]',
        'border-sap-field-success-color border-width-sap-field-success-border-width [border-style:var(--sapField_SuccessBorderStyle)]',
        'hover:[background:var(--sapField_SuccessBackgroundStyle)_var(--sapField_Hover_Background)] hover:border-sap-field-success-color hover:[box-shadow:var(--sapContent_Positive_Shadow)]',
        'focus:[background:var(--sapField_Focus_Background)] focus:outline-sap-field-success-color focus:[box-shadow:var(--sapField_SuccessShadow)] focus:hover:[box-shadow:none]'
    ].join(' '),
    information: [
        '[background:var(--sapField_InformationBackgroundStyle)_var(--sapField_InformationBackground)] [box-shadow:var(--sapField_InformationShadow)]',
        'border-sap-field-information-color border-width-sap-field-information-border-width [border-style:var(--sapField_InformationBorderStyle)]',
        'hover:[background:var(--sapField_InformationBackgroundStyle)_var(--sapField_Hover_Background)] hover:border-sap-field-information-color hover:[box-shadow:var(--sapContent_Informative_Shadow)]',
        'focus:[background:var(--sapField_Focus_Background)] focus:outline-sap-field-information-color focus:[box-shadow:var(--sapField_InformationShadow)] focus:hover:[box-shadow:none]'
    ].join(' ')
};

/** Extra styles of multi-line fields. */
export const textareaBase = [
    'block h-auto min-w-24 min-h-sap-element-height py-2 px-2.5 whitespace-pre-wrap overflow-auto resize-none leading-(--sapContent_LineHeight)',
    'compact:h-auto compact:min-h-sap-element-compact-height compact:py-[0.1875rem] compact:px-2',
    'readonly:border-dashed readonly:border-sap-field-read-only-border-color readonly:border-width-sap-field-border-width',
    'readonly:[background:var(--sapField_ReadOnly_Background)] readonly:hover:[background:var(--sapField_ReadOnly_Background)] readonly:focus:[background:var(--sapField_ReadOnly_Background)]'
].join(' ');

/** `aria-invalid` for a value state: only errors are invalid. */
const invalid = (state: FormState | null | undefined, own: InputProps['aria-invalid']) =>
    state === 'error' ? true : own;

export interface InputProps extends Omit<BaseInput.Props, 'className'> {
    className?: string;
    /** Value state of the field. Pair it with a form message that explains the state. */
    state?: FormState | null;
    /** Hides the spin buttons of number inputs. */
    noNumberSpinner?: boolean;
}

/**
 * Single-line text field: a native `<input>` with the SAP field styles, on Base UI's Input (works inside a Base UI
 * `Field`). `value` with `onValueChange` for a controlled field, `defaultValue` for an uncontrolled one. Compact
 * density is `data-density="compact"` on the field or an ancestor.
 *
 * ```tsx
 * <label htmlFor="name">Name</label>
 * <Input id="name" placeholder="Name" />
 * <Input state="error" aria-describedby="name-error" />
 * ```
 */
export function Input({ state, noNumberSpinner = false, className, ...props }: InputProps) {
    return (
        <BaseInput
            {...props}
            aria-invalid={invalid(state, props['aria-invalid'])}
            className={cn(
                fieldBase,
                '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
                noNumberSpinner &&
                    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                fieldStates[state ?? 'default'],
                className
            )}
        />
    );
}

export interface TextareaProps extends Omit<ComponentProps<'textarea'>, 'className' | 'value' | 'defaultValue'> {
    className?: string;
    /** The value, for a controlled textarea (with `onValueChange`). */
    value?: string;
    /** The initial value, for an uncontrolled textarea. */
    defaultValue?: string;
    /** Called with the new value on every change. */
    onValueChange?: (value: string, eventDetails: BaseInput.ChangeEventDetails) => void;
    /** Value state of the field. Pair it with a form message that explains the state. */
    state?: FormState | null;
    /** Limits the length and shows a counter of the characters left below the textarea. */
    maxLength?: number;
    /** Props of the counter element (e.g. a `className`). */
    counterProps?: ComponentProps<'div'>;
    /** Text of the counter for the characters left. */
    charactersLeftLabel?: (count: number) => string;
}

const charactersLeft = (count: number) => `${count} ${count === 1 ? 'character' : 'characters'} left`;

/**
 * Multi-line text field: a native `<textarea>` with the SAP field styles, on Base UI's Input (works inside a Base
 * UI `Field`). With `maxLength`, a counter of the characters left follows the textarea and describes it.
 *
 * ```tsx
 * <label htmlFor="notes">Notes</label>
 * <Textarea id="notes" rows={4} maxLength={200} />
 * ```
 */
export function Textarea({
    state,
    maxLength,
    counterProps,
    charactersLeftLabel = charactersLeft,
    className,
    value,
    defaultValue,
    onChange,
    ...props
}: TextareaProps) {
    const counterId = useId();
    const [typedLength, setTypedLength] = useState(() => (defaultValue ?? '').length);
    const length = value !== undefined ? value.length : typedLength;
    const counter = maxLength != null && maxLength >= 0 && !props.disabled && !props.readOnly;
    const describedBy = [props['aria-describedby'], counter && (counterProps?.id ?? counterId)]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <BaseInput
                {...(props as BaseInput.Props)}
                render={<textarea />}
                value={value}
                defaultValue={defaultValue}
                maxLength={maxLength}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setTypedLength(event.currentTarget.value.length);
                    onChange?.(event as unknown as ChangeEvent<HTMLTextAreaElement>);
                }}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid(state, props['aria-invalid'])}
                className={cn(fieldBase, textareaBase, fieldStates[state ?? 'default'], className)}
            />
            {counter && (
                <div
                    id={counterId}
                    {...counterProps}
                    className={cn(
                        'box-border m-0 border-0 pt-1.5 pb-2 px-0.5 text-end truncate font-sap-font-family font-normal',
                        'text-sap-font-small-size leading-[normal] text-sap-content-label-color [forced-color-adjust:none]',
                        counterProps?.className
                    )}
                >
                    {charactersLeftLabel(Math.max(maxLength - length, 0))}
                </div>
            )}
        </>
    );
}
