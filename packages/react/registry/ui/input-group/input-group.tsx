/*
 * Port of fundamental-react (InputGroup) and @fundamental-ngx/core (input-group) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Input as BaseInput } from '@base-ui/react/input';
import {
    Children,
    createContext,
    isValidElement,
    use,
    useCallback,
    useEffect,
    useId,
    useRef,
    type ChangeEvent,
    type ComponentProps,
    type MouseEvent,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';
import { Icon, type IconFont } from '@/ui/icon/icon';
import { fieldBase, fieldStates, type FormState } from '@/ui/input/input';

export type InputGroupPlacement = 'before' | 'after';
export type InputGroupValue = string | number | null;

/** Text colour and shadow of an addon button while the group has the focus, per value state. */
export const STATE_BUTTON_VARS: Record<FormState, string> = {
    default: '',
    success:
        '[--igBtnFocusColor:var(--sapButton_Accept_Selected_TextColor)] [--igBtnShadow:var(--sapContent_Positive_Shadow)]',
    error: '[--igBtnFocusColor:var(--sapButton_Reject_Selected_TextColor)] [--igBtnShadow:var(--sapContent_Negative_Shadow)]',
    warning:
        '[--igBtnFocusColor:var(--sapButton_Attention_Selected_TextColor)] [--igBtnShadow:var(--sapContent_Critical_Shadow)]',
    information:
        '[--igBtnFocusColor:var(--sapButton_Selected_TextColor)] [--igBtnShadow:var(--sapContent_Informative_Shadow)]'
};

/**
 * Gives transparent `Button`s inside an element the look of field buttons: no border, the field corner radius, a
 * hover shadow and a selected icon colour while pressed.
 */
export const INPUT_GROUP_BUTTON_VARS = [
    // high contrast keeps the lite button backgrounds, as fundamental-styles
    'not-hc:[--sapButton_Lite_Background:transparent] not-hc:[--sapButton_Lite_Hover_Background:transparent] not-hc:[--sapButton_Lite_Active_Background:transparent]',
    '[&_button]:border-0 [--sapButton_Lite_BorderColor:transparent] [--sapButton_Lite_Hover_BorderColor:transparent] [--sapButton_Lite_Active_BorderColor:transparent]',
    '[--sapButton_Lite_TextColor:var(--sapField_TextColor)] [--sapButton_Lite_Hover_TextColor:var(--sapField_TextColor)]',
    '[--sapButton_Active_TextColor:var(--igBtnFocusColor,var(--sapButton_Selected_TextColor))]',
    '[--sapButton_BorderCornerRadius:var(--sapField_BorderCornerRadius)]',
    '[&_button:hover:not(:disabled)]:[box-shadow:var(--igBtnShadow,var(--sapField_Hover_Shadow))] [&_button:active]:[box-shadow:var(--igBtnShadow,var(--sapField_Hover_Shadow))]'
].join(' ');

/** Colour of the focus frame per value state. */
export const STATE_FOCUS_COLOR: Record<FormState, string> = {
    default: 'after:border-sap-field-active-border-color',
    success: 'after:border-sap-field-success-color',
    error: 'after:border-sap-field-invalid-color',
    warning: 'after:border-sap-field-warning-color',
    information: 'after:border-sap-field-information-color'
};

/** What the group shares with its projected parts. */
interface InputGroupContextValue {
    disabled: boolean;
    readOnly: boolean;
    state: FormState;
}

const InputGroupContext = createContext<InputGroupContextValue | null>(null);

/** Whether `children` holds an element of `type` at the top level (Angular's `contentChild`). */
const hasPart = (children: ReactNode, type: unknown) =>
    Children.toArray(children).some((child) => isValidElement(child) && child.type === type);

/** Sets every ref in `refs` to `node`. */
function assignRefs<T>(node: T | null, ...refs: (Ref<T> | undefined)[]) {
    for (const ref of refs) {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
    }
}

export interface InputGroupProps extends Omit<
    ComponentProps<'div'>,
    'defaultValue' | 'onChange' | 'children' | 'placeholder'
> {
    children?: ReactNode;
    /** Where the generated addon goes. */
    placement?: InputGroupPlacement;
    /** Text of the addon, e.g. a currency, or of the addon button. */
    addOnText?: string | null;
    /** Icon of the addon. */
    glyph?: string | null;
    /** Icon font of the glyph. */
    glyphFont?: IconFont;
    /** Accessible name of the addon icon or button; falls back to the glyph name. */
    glyphAriaLabel?: string | null;
    /** Tooltip of the addon icon or button. */
    iconTitle?: string | null;
    /** The addon is a button; it calls `onAddOnButtonClick`. */
    button?: boolean;
    /** The addon button is in the tab order; otherwise clicks on it keep the focus in the input. */
    buttonFocusable?: boolean;
    /** Hides the addon button from assistive technology (e.g. when the input already offers its action). */
    addonButtonAriaHidden?: boolean;
    /** The group controls a popup (combobox, date picker): the button gets `aria-haspopup` and `aria-expanded`. */
    isControl?: boolean;
    /** The popup of a control group is open. */
    isExpanded?: boolean;
    /** Shows the focus frame while the input has the focus. */
    showFocus?: boolean;
    /** Takes the width of its content instead of the full width. */
    inline?: boolean;
    /** Value state of the group. Pair it with a form message that explains the state. */
    state?: FormState | null;
    /** Dims the group and disables the generated input, the addon button and projected `InputGroupInput`s. */
    disabled?: boolean;
    /** Read-only style; the generated input and projected `InputGroupInput`s become read-only. */
    readOnly?: boolean;

    /** Id of the generated input, for an external `<label htmlFor>`. Generated when not given. */
    inputId?: string;
    /** Type of the generated input; `number` reports numbers (or `null` when empty). */
    type?: string;
    placeholder?: string;
    name?: string;
    required?: boolean;
    /** The value of the generated input, for a controlled group (with `onValueChange`). */
    value?: InputGroupValue;
    /** The initial value of the generated input, for an uncontrolled group. */
    defaultValue?: InputGroupValue;
    /** Called with the new value on every change; a number (or `null`) for `type="number"`. */
    onValueChange?: (value: InputGroupValue, event: ChangeEvent<HTMLInputElement>) => void;
    /** Called when the addon button is clicked. */
    onAddOnButtonClick?: (event: MouseEvent<HTMLElement>) => void;
    /** The native `search` event of a `type="search"` input (Enter, or the clear button). */
    onSearch?: (event: Event) => void;
    /** Props of the generated input. */
    inputProps?: Omit<BaseInput.Props, 'className'> & { className?: string };
    /** Ref of the generated input, e.g. to focus it. */
    inputRef?: Ref<HTMLInputElement>;
}

/**
 * A field with an input and text, icon or button addons before or after it. Without a projected `InputGroupInput`
 * the group renders its own input (on Base UI's Input, so it works inside a Base UI `Field`); `aria-label`,
 * `aria-labelledby` and `aria-describedby` then go to that input. Compact density is `data-density="compact"` on
 * the group or an ancestor.
 *
 * ```tsx
 * <InputGroup addOnText="$" placement="before" placeholder="Amount" value={amount} onValueChange={setAmount} />
 * <InputGroup glyph="decline" button glyphAriaLabel="Clear" onAddOnButtonClick={clear} />
 *
 * <InputGroup>
 *     <InputGroupInput aria-label="Date" />
 *     <InputGroupAddon button>
 *         <Button variant="transparent" glyph="calendar" aria-label="Calendar" />
 *     </InputGroupAddon>
 * </InputGroup>
 * ```
 */
export function InputGroup({
    children,
    placement = 'after',
    addOnText,
    glyph,
    glyphFont = 'SAP-icons',
    glyphAriaLabel,
    iconTitle,
    button = false,
    buttonFocusable = true,
    addonButtonAriaHidden = false,
    isControl = false,
    isExpanded = false,
    showFocus = true,
    inline = false,
    state,
    disabled = false,
    readOnly = false,
    inputId: inputIdProp,
    type = 'text',
    placeholder,
    name,
    required = false,
    value,
    defaultValue,
    onValueChange,
    onAddOnButtonClick,
    onSearch,
    inputProps,
    inputRef,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
}: InputGroupProps) {
    const autoId = useId();
    const inputId = inputIdProp ?? `fd-input-group-input-${autoId}`;
    const addOnId = `fd-input-group-addon-${autoId}`;
    const addOnButtonId = `fd-input-group-button-${autoId}`;
    const stateValue = state ?? 'default';

    const projectedInput = hasPart(children, InputGroupInput);
    const projectedAddon = hasPart(children, InputGroupAddon);
    const generatedAddon = !projectedAddon && !!(glyph || addOnText);

    // the native `search` event has no React prop
    const field = useRef<HTMLInputElement | null>(null);
    const searchRef = useRef(onSearch);
    searchRef.current = onSearch;
    useEffect(() => {
        const input = field.current;
        if (!input) return;
        const listener = (event: Event) => searchRef.current?.(event);
        input.addEventListener('search', listener);
        return () => input.removeEventListener('search', listener);
    }, [projectedInput, placement]);
    const { className: inputClassName, ref: inputPropsRef, onChange, ...restInputProps } = inputProps ?? {};
    const setField = useCallback(
        (node: HTMLInputElement | null) => {
            field.current = node;
            assignRefs(node, inputRef, inputPropsRef as Ref<HTMLInputElement> | undefined);
        },
        [inputRef, inputPropsRef]
    );

    // the text or icon addon describes the input, e.g. "$"
    const describedBy = [ariaDescribedBy, !button && generatedAddon && addOnId].filter(Boolean).join(' ') || undefined;

    const input = projectedInput ? null : (
        <BaseInput
            {...restInputProps}
            ref={setField}
            id={inputId}
            type={type}
            name={name}
            placeholder={placeholder}
            value={value === undefined ? undefined : (value ?? '')}
            defaultValue={defaultValue ?? undefined}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            aria-invalid={stateValue === 'error' || undefined}
            onChange={(event) => {
                onChange?.(event);
                const target = event.currentTarget;
                const next = type === 'number' ? (target.value === '' ? null : target.valueAsNumber) : target.value;
                onValueChange?.(next, event);
            }}
            className={cn(inputClasses, inputClassName)}
        />
    );

    const addon = !generatedAddon ? null : button ? (
        <InputGroupAddon button>
            <Button
                variant="transparent"
                id={addOnButtonId}
                glyph={glyph}
                glyphFont={glyphFont}
                label={glyph ? undefined : addOnText}
                aria-label={glyphAriaLabel || glyph || undefined}
                disabled={disabled}
                className={cn(isExpanded && 'text-(--igBtnFocusColor,var(--sapButton_Selected_TextColor))')}
                tabIndex={buttonFocusable ? undefined : -1}
                aria-hidden={addonButtonAriaHidden || undefined}
                aria-haspopup={isControl || undefined}
                aria-expanded={isControl ? isExpanded : undefined}
                aria-controls={projectedInput ? undefined : inputId}
                title={iconTitle || undefined}
                onMouseDown={(event) => {
                    if (!buttonFocusable) event.preventDefault();
                }}
                onClick={onAddOnButtonClick}
            />
        </InputGroupAddon>
    ) : (
        <InputGroupAddon id={addOnId}>
            {glyph ? (
                <Icon
                    glyph={glyph}
                    font={glyphFont}
                    aria-label={glyphAriaLabel || glyph}
                    title={iconTitle || undefined}
                />
            ) : (
                addOnText
            )}
        </InputGroupAddon>
    );

    return (
        <InputGroupContext value={{ disabled, readOnly, state: stateValue }}>
            <div
                {...(projectedInput
                    ? {
                          'aria-label': ariaLabel,
                          'aria-labelledby': ariaLabelledBy,
                          'aria-describedby': ariaDescribedBy
                      }
                    : {})}
                {...props}
                data-disabled={disabled ? '' : undefined}
                data-readonly={readOnly ? '' : undefined}
                className={cn(
                    fieldBase,
                    'group/ig flex overflow-hidden p-0 compact:p-0 cursor-text',
                    // no minimum height (as fundamental-styles'), and as high as the rows of a text area
                    'min-h-0 compact:min-h-0 has-[textarea]:h-auto compact:has-[textarea]:h-auto',
                    fieldStates[stateValue],
                    STATE_BUTTON_VARS[stateValue],
                    showFocus && [
                        'has-[:is(input,textarea):focus]:[background:var(--sapField_Focus_Background)] has-[:is(input,textarea):focus]:hover:[background:var(--sapField_Focus_Background)]',
                        'has-[:is(input,textarea):focus]:[box-shadow:none] has-[:is(input,textarea):focus]:hover:[box-shadow:none]',
                        'after:pointer-events-none after:absolute after:inset-0 hc:after:inset-px after:hidden has-[:is(input,textarea):focus]:after:block',
                        'after:rounded-sap-field-border-corner-radius after:border-(length:--sapContent_FocusWidth) after:[border-style:var(--sapContent_FocusStyle)]',
                        STATE_FOCUS_COLOR[stateValue]
                    ],
                    inline && 'inline-flex w-auto align-bottom',
                    readOnly && [
                        'overflow-visible [box-shadow:none] border-sap-field-read-only-border-color',
                        '[background:var(--sapField_ReadOnly_BackgroundStyle)_var(--sapField_ReadOnly_Background)]',
                        'hover:[background:var(--sapField_ReadOnly_BackgroundStyle)_var(--sapField_ReadOnly_Background)] hover:border-sap-field-read-only-border-color hover:[box-shadow:none]'
                    ],
                    // the group is dimmed, so its disabled parts are not dimmed again
                    disabled &&
                        'pointer-events-none opacity-(--sapContent_DisabledOpacity) [&_:disabled]:opacity-100! [&_[aria-disabled=true]]:opacity-100!',
                    className
                )}
            >
                {placement === 'after' && input}
                {children}
                {addon}
                {placement === 'before' && input}
            </div>
        </InputGroupContext>
    );
}

const inputClasses = [
    'relative z-[1] m-0 box-border h-full min-h-0 w-full min-w-0 flex-[1_1_10rem] appearance-none self-stretch truncate border-0 bg-transparent px-1 py-0 first:ps-2.5 last:pe-2.5',
    // compact inputs keep fundamental-styles' compact field padding (0.5rem), at the group's edges too
    'compact:px-2 compact:first:ps-2 compact:last:pe-2',
    'font-sap-font-family text-sap-font-size leading-[normal] font-normal text-sap-field-text-color [box-shadow:none] outline-none',
    'placeholder:italic placeholder:text-sap-field-placeholder-text-color rtl:placeholder:indent-[0.125rem]',
    'selection:bg-sap-selected-color selection:text-sap-content-contrast-text-color',
    'disabled:placeholder:opacity-0 readonly:placeholder:opacity-0',
    '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
    'autofill:bg-clip-text',
    // text areas: several lines, resizable in height
    '[textarea&]:py-2 [textarea&]:whitespace-pre-wrap [textarea&]:overflow-auto [textarea&]:resize-y [textarea&]:leading-(--sapContent_LineHeight)',
    'compact:[textarea&]:py-[0.1875rem]'
].join(' ');

export interface InputGroupInputProps extends Omit<BaseInput.Props, 'className'> {
    className?: string;
}

/**
 * The input of an input group, for layouts the generated input does not cover. On Base UI's Input; pass
 * `render={<textarea />}` for a text area. Takes `disabled` and `readOnly` from the group, and `aria-invalid` from
 * its error state.
 */
export function InputGroupInput({ className, ...props }: InputGroupInputProps) {
    const group = use(InputGroupContext);
    return (
        <BaseInput
            disabled={group?.disabled || undefined}
            readOnly={group?.readOnly || undefined}
            aria-invalid={group?.state === 'error' || undefined}
            {...props}
            className={cn(inputClasses, className)}
        />
    );
}

export interface InputGroupAddonProps extends ComponentProps<'span'> {
    /** The addon holds a button; a transparent `Button` inside takes the look of a field button. */
    button?: boolean;
    /** `textarea` stretches the button to the height of a text area. */
    type?: 'textarea' | null;
}

/**
 * An addon of an input group: text, an icon, or with `button` a button. It goes where it is in the children.
 *
 * ```tsx
 * <InputGroupAddon id="unit">kg</InputGroupAddon>
 * <InputGroupAddon button><Button variant="transparent" glyph="decline" aria-label="Clear" /></InputGroupAddon>
 * ```
 */
export function InputGroupAddon({ button = false, type, className, ...props }: InputGroupAddonProps) {
    return (
        <span
            {...props}
            className={cn(
                'm-0 box-border flex min-h-full min-w-9 shrink-0 items-center justify-center truncate px-2.5 py-0 compact:min-w-8',
                'font-sap-font-family text-sap-font-large-size text-sap-content-non-interactive-icon-color',
                button && [
                    'overflow-visible p-0',
                    INPUT_GROUP_BUTTON_VARS,
                    'group-has-[:is(input,textarea):focus]/ig:[--sapButton_Lite_TextColor:var(--igBtnFocusColor,var(--sapField_TextColor))]',
                    'group-has-[:is(input,textarea):focus]/ig:[&_button]:[box-shadow:var(--igBtnShadow,none)]'
                ],
                type === 'textarea' && '[&>*]:h-full [&>*]:max-h-full',
                className
            )}
        />
    );
}
