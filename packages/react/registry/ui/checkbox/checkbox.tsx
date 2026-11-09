/*
 * Port of fundamental-react (Forms) and @fundamental-ngx/core (checkbox) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { useId, useState, type ComponentProps, type ReactNode, type Ref } from 'react';
import { cn } from '@/lib/utils';

export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate';
export type FormState = 'success' | 'error' | 'warning' | 'information' | 'default';

/** Values of the model (`value`) for each state. */
export interface CheckboxValues {
    trueValue?: unknown;
    falseValue?: unknown;
    thirdStateValue?: unknown;
}

export const CHECKBOX_DEFAULT_VALUES: Readonly<Required<CheckboxValues>> = {
    trueValue: true,
    falseValue: false,
    thirdStateValue: null
};

export type CheckboxChangeEventDetails = BaseCheckbox.Root.ChangeEventDetails;

/** Same value, or objects/arrays with the same own keys and values. */
function shallowEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    return (
        ka.length === kb.length &&
        ka.every((k) => Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
    );
}

/** Colours of the check box square per value state: background, border width/style/colour, mark, hover background. */
const BOX_STATE: Record<FormState | 'readonly', string> = {
    default: [
        '[--cb-bg:var(--sapField_Background)] [--cb-bw:var(--sapField_BorderWidth)] [--cb-bs:var(--sapField_Selector_BorderStyle)]',
        '[--cb-bc:var(--sapField_BorderColor)] [--cb-mark:var(--sapContent_Selected_ForegroundColor)]',
        '[--cb-hover-bg:var(--sapContent_Selected_Hover_Background)] hc:[--cb-hover-bg:var(--sapSelectedColor)] [--cb-hover-bc:var(--sapField_Hover_BorderColor)]'
    ].join(' '),
    error: [
        '[--cb-bg:var(--sapField_InvalidBackground)] [--cb-bw:var(--sapField_InvalidBorderWidth)] [--cb-bs:var(--sapField_Selector_InvalidBorderStyle)]',
        '[--cb-bc:var(--sapField_InvalidColor)] [--cb-mark:var(--sapField_InvalidColor)] [--cb-hover-bc:var(--sapField_InvalidColor)]',
        '[--cb-hover-bg:var(--sapField_Hover_Background)] hc:[--cb-hover-bg:var(--sapField_InvalidBackground)]'
    ].join(' '),
    warning: [
        '[--cb-bg:var(--sapField_WarningBackground)] [--cb-bw:var(--sapField_WarningBorderWidth)] [--cb-bs:var(--sapField_Selector_WarningBorderStyle)]',
        '[--cb-bc:var(--sapField_WarningColor)] [--cb-mark:var(--sapField_WarningColor)] [--cb-hover-bc:var(--sapField_WarningColor)] [--cb-hover-bg:var(--sapField_Hover_Background)] hc:[--cb-hover-bg:var(--sapField_Hover_Background)]'
    ].join(' '),
    success: [
        '[--cb-bg:var(--sapField_SuccessBackground)] [--cb-bw:var(--sapField_SuccessBorderWidth)] [--cb-bs:var(--sapField_Selector_SuccessBorderStyle)]',
        '[--cb-bc:var(--sapField_SuccessColor)] [--cb-mark:var(--sapField_SuccessColor)] [--cb-hover-bc:var(--sapField_SuccessColor)] [--cb-hover-bg:var(--sapField_Hover_Background)] hc:[--cb-hover-bg:var(--sapField_Hover_Background)]'
    ].join(' '),
    information: [
        '[--cb-bg:var(--sapField_InformationBackground)] [--cb-bw:var(--sapField_InformationBorderWidth)] [--cb-bs:var(--sapField_Selector_InformationBorderStyle)]',
        '[--cb-bc:var(--sapField_InformationColor)] [--cb-mark:var(--sapField_InformationColor)] [--cb-hover-bc:var(--sapField_InformationColor)] [--cb-hover-bg:var(--sapField_Hover_Background)] hc:[--cb-hover-bg:var(--sapField_Hover_Background)]'
    ].join(' '),
    readonly: [
        '[--cb-bg:var(--sapField_ReadOnly_Background)] [--cb-bw:var(--sapElement_BorderWidth)] [--cb-bs:var(--sapField_Selector_ReadOnly_BorderStyle)]',
        '[--cb-bc:var(--sapField_ReadOnly_BorderColor)] [--cb-mark:var(--sapField_TextColor)] [--cb-hover-bc:var(--sapField_ReadOnly_BorderColor)] [--cb-hover-bg:var(--sapField_ReadOnly_Background)]'
    ].join(' ')
};

/** SAP-icons glyphs: the check mark, and the display-only icons. */
const GLYPH = {
    check: '',
    displayUnchecked: '',
    displayChecked: '',
    displayIndeterminate: ''
};

export interface CheckboxProps extends Omit<
    ComponentProps<'span'>,
    'children' | 'defaultValue' | 'defaultChecked' | 'onChange' | 'title'
> {
    /** Text of the label. `children` work too, for rich content such as links. */
    label?: ReactNode;
    children?: ReactNode;
    /**
     * The model value (controlled), mapped to checked, unchecked and indeterminate through `values`
     * (by default `true`, `false` and, with `tristate`, `null`).
     */
    value?: unknown;
    /** The initial model value (uncontrolled). */
    defaultValue?: unknown;
    /** Called with the new model value when the user changes the checkbox. */
    onValueChange?: (value: unknown, eventDetails: CheckboxChangeEventDetails) => void;
    /** Boolean shorthand for `value` with the default values (controlled). */
    checked?: boolean;
    /** Boolean shorthand for `defaultValue` (uncontrolled). */
    defaultChecked?: boolean;
    /** Called with whether the checkbox is now checked. */
    onCheckedChange?: (checked: boolean, eventDetails: CheckboxChangeEventDetails) => void;
    /** Shows the mixed state whatever the value, e.g. for a "select all" checkbox driven by its children. */
    indeterminate?: boolean;
    /** Model values for checked, unchecked and indeterminate. */
    values?: CheckboxValues;
    /** Allows the indeterminate (third) state. */
    tristate?: boolean;
    /** Lets users select the third state by clicking. */
    tristateSelectable?: boolean;
    /** Value state: success, error, warning or information. */
    state?: FormState | null;
    disabled?: boolean;
    /** Keeps the value; the checkbox stays focusable and is announced as read-only. */
    readOnly?: boolean;
    /** Shows the value as an icon without the interactive box. */
    displayOnly?: boolean;
    required?: boolean;
    /** Lets long labels wrap. */
    wrapLabel?: boolean;
    /** Vertical alignment of the box next to a wrapped label. */
    valignLabel?: 'top' | 'middle';
    /** Id of the checkbox input, for an external `<label htmlFor>`. Generated when not given. */
    id?: string;
    /** Name of the field when a form is submitted. */
    name?: string;
    /** Value submitted with the form when checked (the native input's `value`; "on" by default). */
    formValue?: string;
    /** Tooltip of the label. */
    title?: string;
    /** Classes of the `<label>`. */
    labelClassName?: string;
    /** Classes of the label text. */
    textClassName?: string;
    /** Props of the `<label>`. */
    labelProps?: ComponentProps<'label'>;
    /** Props of the checkbox control (the focusable `role="checkbox"` element), e.g. `tabIndex` or `role`. */
    inputProps?: Omit<BaseCheckbox.Root.Props, 'className'> & { className?: string };
    /** Ref of the (visually hidden) native checkbox input. */
    inputRef?: Ref<HTMLInputElement>;
    /** Called with `true` when the checkbox gets focus and `false` when it loses it. */
    onFocusChange?: (focused: boolean) => void;
}

/** The check state a model value stands for. */
function stateOf(value: unknown, values: Required<CheckboxValues>, tristate: boolean): CheckboxState {
    if (shallowEqual(value, values.trueValue)) return 'checked';
    if (shallowEqual(value, values.falseValue)) return 'unchecked';
    if (tristate && shallowEqual(value, values.thirdStateValue)) return 'indeterminate';
    return 'unchecked';
}

/**
 * SAP Fiori checkbox, on Base UI's Checkbox, with a label, value states, read-only and display-only modes and an
 * optional third state. The whole label is clickable; Space toggles the focused checkbox.
 *
 * ```tsx
 * <Checkbox label="Accept terms" checked={accepted} onCheckedChange={setAccepted} />
 * <Checkbox label="Select all" tristate value={all} onValueChange={setAll} />
 * ```
 */
export function Checkbox({
    label,
    children,
    value,
    defaultValue,
    onValueChange,
    checked,
    defaultChecked,
    onCheckedChange,
    indeterminate = false,
    values,
    tristate = false,
    tristateSelectable = false,
    state,
    disabled = false,
    readOnly = false,
    displayOnly = false,
    required = false,
    wrapLabel = false,
    valignLabel = 'middle',
    id: idProp,
    name,
    formValue,
    title,
    labelClassName,
    textClassName,
    labelProps,
    inputProps,
    inputRef,
    onFocusChange,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    className,
    ...props
}: CheckboxProps) {
    const autoId = useId();
    const id = idProp ?? `fd-checkbox-${autoId}`;
    const resolved = { ...CHECKBOX_DEFAULT_VALUES, ...values };

    const [uncontrolled, setUncontrolled] = useState<unknown>(() =>
        defaultValue !== undefined
            ? defaultValue
            : defaultChecked
              ? CHECKBOX_DEFAULT_VALUES.trueValue
              : resolved.falseValue
    );
    const valueControlled = value !== undefined;
    const checkedControlled = checked !== undefined;
    const model = valueControlled
        ? value
        : checkedControlled
          ? checked
              ? resolved.trueValue
              : resolved.falseValue
          : uncontrolled;
    const modelState = stateOf(model, resolved, tristate);
    const checkState: CheckboxState = indeterminate ? 'indeterminate' : modelState;

    /** Unchecked -> checked (or indeterminate when selectable) -> unchecked; indeterminate -> checked. */
    const next = (): unknown =>
        modelState === 'checked'
            ? resolved.falseValue
            : modelState === 'indeterminate'
              ? resolved.trueValue
              : tristate && tristateSelectable
                ? resolved.thirdStateValue
                : resolved.trueValue;

    const handleChange = (_: boolean, details: CheckboxChangeEventDetails) => {
        if (readOnly || displayOnly) return;
        const nextValue = next();
        if (!valueControlled && !checkedControlled) setUncontrolled(nextValue);
        onValueChange?.(nextValue, details);
        onCheckedChange?.(stateOf(nextValue, resolved, tristate) === 'checked', details);
    };

    const stateValue = state ?? 'default';
    const glyph = displayOnly
        ? checkState === 'checked'
            ? GLYPH.displayChecked
            : checkState === 'indeterminate'
              ? GLYPH.displayIndeterminate
              : GLYPH.displayUnchecked
        : checkState === 'checked'
          ? GLYPH.check
          : undefined;
    const content = label ?? children;
    const hasContent = content != null && content !== '' && content !== false;

    const { className: inputClassName, onFocus, onBlur, ...controlProps } = inputProps ?? {};
    const { className: labelPropsClassName, ...restLabelProps } = labelProps ?? {};

    return (
        <span {...props} className={cn('relative inline-flex max-w-full outline-none', className)}>
            <label
                {...restLabelProps}
                htmlFor={id}
                title={title}
                className={cn(
                    'group/cb relative m-0 box-border flex max-w-full w-fit cursor-pointer select-none items-center gap-(--cb-pad)',
                    'p-(--cb-pad) [--cb-pad:0.6875rem] [--cb-size:1.375rem] compact:[--cb-pad:0.5rem] compact:[--cb-size:1rem]',
                    'font-sap-font-family text-sap-font-size leading-4 text-sap-content-label-color truncate',
                    // focus indicator around the label
                    'has-[[data-slot=checkbox]:focus]:outline-sap has-[[data-slot=checkbox]:focus]:outline-offset-[calc(0.25rem_-_var(--cb-pad))]',
                    'has-[[data-slot=checkbox]:focus]:rounded-[0.8rem] compact:has-[[data-slot=checkbox]:focus]:rounded-[0.5rem]',
                    'hc:has-[[data-slot=checkbox]:focus]:outline-offset-0 hc:has-[[data-slot=checkbox]:focus]:rounded-none',
                    BOX_STATE[readOnly ? 'readonly' : 'default'],
                    !readOnly && stateValue !== 'default' && BOX_STATE[stateValue],
                    disabled && !displayOnly && 'pointer-events-none opacity-(--sapContent_DisabledOpacity)',
                    readOnly && 'pointer-events-none cursor-pointer',
                    displayOnly && 'gap-2 [--cb-mark:var(--sapTextColor)]',
                    wrapLabel && valignLabel === 'top' && 'items-start',
                    labelClassName,
                    labelPropsClassName
                )}
            >
                <BaseCheckbox.Root
                    {...controlProps}
                    data-slot="checkbox"
                    id={id}
                    name={name}
                    value={formValue}
                    checked={modelState === 'checked'}
                    indeterminate={checkState === 'indeterminate'}
                    onCheckedChange={handleChange}
                    disabled={disabled || displayOnly}
                    readOnly={readOnly}
                    required={required}
                    inputRef={inputRef}
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={stateValue === 'error' || undefined}
                    onFocus={(event) => {
                        onFocus?.(event);
                        onFocusChange?.(true);
                    }}
                    onBlur={(event) => {
                        onBlur?.(event);
                        onFocusChange?.(false);
                    }}
                    className={cn(
                        'relative m-0 box-border inline-flex size-(--cb-size) min-w-(--cb-size) items-center justify-center outline-none [forced-color-adjust:none]',
                        'font-sap-content-icon-font-family text-sap-font-size leading-[normal] text-(--cb-mark)',
                        'rounded-sap-field-border-corner-radius',
                        displayOnly
                            ? 'size-4 min-w-4 bg-transparent border-0'
                            : [
                                  'bg-(--cb-bg) border-(length:--cb-bw) [border-style:var(--cb-bs)] border-(--cb-bc)',
                                  'group-hover/cb:bg-(--cb-hover-bg) group-hover/cb:border-(--cb-hover-bc)',
                                  checkState === 'indeterminate' &&
                                      "after:absolute after:content-[''] after:size-3 compact:after:size-2 after:bg-(--cb-mark)"
                              ],
                        inputClassName
                    )}
                >
                    {/* the glyph lives in a hidden child, so it never becomes part of the accessible name */}
                    <span
                        aria-hidden="true"
                        data-glyph={glyph}
                        className={cn(
                            'before:content-[attr(data-glyph)]',
                            // display-only: a 1rem icon in a 1rem box
                            displayOnly && 'flex size-4 items-center justify-center text-[1rem] leading-[normal]'
                        )}
                    />
                </BaseCheckbox.Root>
                <span
                    className={cn(
                        'm-0 flex h-4 max-w-[inherit] items-center truncate p-0 text-sap-font-size leading-[normal] text-sap-text-color',
                        wrapLabel && 'h-auto whitespace-normal',
                        !hasContent && 'hidden'
                    )}
                >
                    <span
                        className={cn(
                            'm-0 max-w-[inherit] truncate p-0 empty:m-0 text-sap-font-size leading-[normal] text-sap-text-color',
                            wrapLabel && 'whitespace-normal',
                            required &&
                                "relative pe-2 after:absolute after:ps-0.5 after:text-sap-font-size after:font-bold after:text-sap-field-required-color after:content-['*'_/_'']",
                            textClassName
                        )}
                    >
                        {content}
                    </span>
                </span>
            </label>
        </span>
    );
}
