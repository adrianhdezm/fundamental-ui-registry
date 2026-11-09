/*
 * Port of fundamental-react (StepInput) and @fundamental-ngx/core (step-input) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { NumberField } from '@base-ui/react/number-field';
import {
    useId,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type KeyboardEvent as ReactKeyboardEvent,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';
import { fieldBase, fieldStates, type FormState } from '@/ui/input/input';
import { INPUT_GROUP_BUTTON_VARS, STATE_BUTTON_VARS, STATE_FOCUS_COLOR } from '@/ui/input-group/input-group';

export type StepInputChangeDetails = NumberField.Root.ChangeEventDetails;
export type StepInputCommitDetails = NumberField.Root.CommitEventDetails;

/** Changes that step the value (buttons, keys, wheel), as opposed to typing. */
const STEP_REASONS = new Set(['increment-press', 'decrement-press', 'keyboard', 'wheel']);

export interface StepInputProps extends Omit<
    ComponentProps<'div'>,
    'children' | 'defaultValue' | 'onChange' | 'placeholder' | 'title'
> {
    /** The number, for a controlled step input (with `onValueChange`); `null` when empty. */
    value?: number | null;
    /** The initial number, for an uncontrolled step input. */
    defaultValue?: number | null;
    /** Called with the new number (or `null` when empty) while it changes: on every step and as it is typed. */
    onValueChange?: (value: number | null, details: StepInputChangeDetails) => void;
    /** Called when a change is final: on blur after typing, on release of a button, on each key or wheel step. */
    onValueCommitted?: (value: number | null, details: StepInputCommitDetails) => void;
    min?: number | null;
    max?: number | null;
    /** Amount of one step; Page Up and Page Down (and Shift with the arrows) step ten times as much. */
    step?: number;
    /** Id of the input, for an external `<label htmlFor>`. Generated when not given. */
    inputId?: string;
    name?: string;
    placeholder?: string;
    /** Tooltip of the input. */
    inputTitle?: string;
    /** Role description of the input, announced by screen readers. */
    'aria-roledescription'?: string;
    /** Accessible name and tooltip of the increment button. */
    incrementLabel?: string;
    /** Accessible name and tooltip of the decrement button. */
    decrementLabel?: string;
    incrementButtonIcon?: string;
    decrementButtonIcon?: string;
    /** Shows the decrement and increment buttons. */
    hasStepButtons?: boolean;
    disabled?: boolean;
    /** Keeps the value and hides the buttons; the input stays focusable. */
    readOnly?: boolean;
    required?: boolean;
    /** Value state of the field. Pair it with a form message that explains the state. */
    state?: FormState | null;
    /** Fills the width of its container. */
    fullWidth?: boolean;
    /** Alignment of the text; the end of the field by default. */
    textAlign?: 'left' | 'center' | 'right' | null;
    /** The mouse wheel does not step the value (it steps only while the input has the focus). */
    disableWheel?: boolean;
    /** Locale of the number format; the runtime locale by default. */
    locale?: string;
    localeMatcher?: 'lookup' | 'best fit';
    /** `currency` formats the value with the fraction digits of `currency`, whose sign shows after the field. */
    mode?: 'decimal' | 'currency';
    /** ISO currency code, e.g. `EUR`. */
    currency?: string;
    currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
    /** A unit shown after the field and describing the input, e.g. "kg"; replaces the currency sign. */
    unit?: string;
    useGrouping?: boolean;
    minFractionDigits?: number;
    /** Also rounds the value to this many fraction digits. */
    maxFractionDigits?: number;
    /** Props of the input. */
    inputProps?: Omit<NumberField.Input.Props, 'className'> & { className?: string };
    /** Ref of the input, e.g. to focus it. */
    inputRef?: Ref<HTMLInputElement>;
}

/** A value from the app: a number, `null`, or `undefined` for one that is not a number (ignored, as Angular). */
function toNumber(value: unknown): number | null | undefined {
    if (value == null || value === '') return null;
    const number = Number(value);
    return Number.isNaN(number) ? undefined : number;
}

/**
 * Step input: a number field with decrement and increment buttons, on Base UI's NumberField. The value is formatted
 * for the locale (as a decimal or a currency) and parsed back from what is typed. The buttons repeat while pressed;
 * Up and Down (Page Up and Page Down by ten steps, Home and End to the limits) and the mouse wheel step the value
 * while the input has the focus. Compact density is `data-density="compact"` on the field or an ancestor.
 *
 * ```tsx
 * <label htmlFor="qty">Quantity</label>
 * <StepInput inputId="qty" min={0} max={10} value={quantity} onValueChange={setQuantity} />
 * ```
 */
export function StepInput({
    value: valueProp,
    defaultValue = null,
    onValueChange,
    onValueCommitted,
    min,
    max,
    step = 1,
    inputId: inputIdProp,
    name,
    placeholder,
    inputTitle,
    'aria-roledescription': ariaRoleDescription = 'Step Input',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    incrementLabel = 'Increase',
    decrementLabel = 'Decrease',
    incrementButtonIcon = 'add',
    decrementButtonIcon = 'less',
    hasStepButtons = true,
    disabled = false,
    readOnly = false,
    required = false,
    state,
    fullWidth = false,
    textAlign,
    disableWheel = false,
    locale,
    localeMatcher,
    mode = 'decimal',
    currency,
    currencyDisplay,
    unit,
    useGrouping = true,
    minFractionDigits,
    maxFractionDigits,
    inputProps,
    inputRef,
    id,
    className,
    ...props
}: StepInputProps) {
    const autoId = useId();
    const inputId = inputIdProp ?? `fd-step-input-${autoId}`;
    const unitId = `${inputId}-unit`;
    const stateValue = state ?? 'default';
    const lower = min ?? undefined;
    const upper = max ?? undefined;

    // always controlled towards Base UI, so an empty value can start at a limit (see `handleValueChange`)
    const [internal, setInternal] = useState<number | null>(() => toNumber(defaultValue) ?? null);
    const lastValue = useRef<number | null>(null);
    const given = toNumber(valueProp === undefined ? internal : valueProp);
    if (given !== undefined) lastValue.current = given;
    const value = given === undefined ? lastValue.current : given;

    const currencyMode = mode === 'currency' && !!currency;
    const { format, currencySign } = useMemo(() => {
        const minDigits = minFractionDigits ?? undefined;
        const maxDigits =
            maxFractionDigits != null && minDigits != null
                ? Math.max(minDigits, maxFractionDigits)
                : (maxFractionDigits ?? undefined);
        const options: Intl.NumberFormatOptions = {
            localeMatcher,
            useGrouping,
            minimumFractionDigits: minDigits,
            maximumFractionDigits: maxDigits
        };
        let sign = '';
        if (currency) {
            const currencyFormat = new Intl.NumberFormat(locale, {
                style: 'currency',
                currency,
                currencyDisplay,
                minimumFractionDigits: minDigits,
                maximumFractionDigits: maxDigits
            });
            sign = currencyFormat.formatToParts(1).find((part) => part.type === 'currency')?.value ?? '';
            // the value takes the fraction digits of the currency; its sign shows after the field
            if (currencyMode) {
                const resolved = currencyFormat.resolvedOptions();
                options.minimumFractionDigits = resolved.minimumFractionDigits;
                options.maximumFractionDigits = resolved.maximumFractionDigits;
            }
        }
        return { format: options, currencySign: sign };
    }, [
        locale,
        localeMatcher,
        useGrouping,
        minFractionDigits,
        maxFractionDigits,
        currency,
        currencyDisplay,
        currencyMode
    ]);
    const unitText = unit || currencySign;
    const formatted = (number: number | null) =>
        number == null ? '' : new Intl.NumberFormat(locale, format).format(number);

    // a step from an empty value starts at the minimum (up) or the maximum (down), as Angular
    const seeded = useRef<number | null | undefined>(undefined);
    const [announcement, setAnnouncement] = useState('');
    const handleValueChange = (next: number | null, details: StepInputChangeDetails) => {
        let result = next;
        if (value == null && next != null && STEP_REASONS.has(details.reason)) {
            const up = stepsUp(details);
            if (up !== null) {
                const start = up ? (lower ?? 0) : (upper ?? 0);
                result = Math.min(upper ?? Infinity, Math.max(lower ?? -Infinity, start));
                seeded.current = result;
            }
        }
        onValueChange?.(result, details);
        if (details.isCanceled) return;
        setInternal(result);
        if (STEP_REASONS.has(details.reason)) {
            setAnnouncement(formatted(result) + (unitText ? ` ${unitText}` : ''));
        }
    };

    const showButtons = hasStepButtons && !readOnly;
    const describedBy = [ariaDescribedBy, unitText && unitId].filter(Boolean).join(' ') || undefined;
    const {
        className: inputClassName,
        onKeyDown: inputKeyDown,
        style: inputStyle,
        ...restInputProps
    } = inputProps ?? {};

    const stepButton = (increment: boolean) => {
        const Part = increment ? NumberField.Increment : NumberField.Decrement;
        const label = increment ? incrementLabel : decrementLabel;
        return (
            <Part
                aria-label={label}
                title={label}
                render={
                    <Button
                        variant="transparent"
                        glyph={increment ? incrementButtonIcon : decrementButtonIcon}
                        className={buttonClasses}
                    />
                }
            />
        );
    };

    return (
        <NumberField.Root
            {...props}
            render={id ? <div id={id} /> : undefined}
            id={inputId}
            name={name}
            value={value}
            onValueChange={handleValueChange}
            onValueCommitted={(committed, details) => {
                const result = seeded.current !== undefined ? seeded.current : committed;
                seeded.current = undefined;
                onValueCommitted?.(result, details);
            }}
            min={lower}
            max={upper}
            step={step}
            smallStep={step}
            largeStep={step * 10}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            allowWheelScrub={!disableWheel}
            locale={locale}
            format={format}
            className={cn('inline-flex max-w-full items-center', fullWidth && 'flex w-full', className)}
        >
            <NumberField.Group
                className={cn(
                    fieldBase,
                    'flex w-auto items-center overflow-hidden p-0 compact:p-0',
                    fieldStates[stateValue],
                    STATE_BUTTON_VARS[stateValue],
                    INPUT_GROUP_BUTTON_VARS,
                    // focus frame around the whole field while the input has the focus
                    'has-[input:focus]:[background:var(--sapField_Focus_Background)] has-[input:focus]:hover:[background:var(--sapField_Focus_Background)] has-[input:focus]:hover:[box-shadow:none]',
                    FOCUS_STATE[stateValue],
                    "after:pointer-events-none after:absolute after:inset-0 after:hidden after:content-[''] has-[input:focus]:after:block hc:after:inset-px",
                    'after:rounded-sap-field-border-corner-radius after:border-(length:--sapContent_FocusWidth) after:[border-style:var(--sapContent_FocusStyle)]',
                    STATE_FOCUS_COLOR[stateValue],
                    fullWidth && 'w-full',
                    readOnly && [
                        '[box-shadow:none] border-sap-field-read-only-border-color',
                        '[background:var(--sapField_ReadOnly_BackgroundStyle)_var(--sapField_ReadOnly_Background)]',
                        'hover:[background:var(--sapField_ReadOnly_BackgroundStyle)_var(--sapField_ReadOnly_Background)] hover:border-sap-field-read-only-border-color hover:[box-shadow:none]'
                    ],
                    // the field is dimmed, so its disabled parts are not dimmed again
                    disabled && 'pointer-events-none opacity-(--sapContent_DisabledOpacity) [&_:disabled]:opacity-100!'
                )}
            >
                {showButtons && stepButton(false)}
                <NumberField.Input
                    {...restInputProps}
                    ref={inputRef}
                    role="spinbutton"
                    inputMode="decimal"
                    title={inputTitle || undefined}
                    placeholder={placeholder || undefined}
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    aria-describedby={describedBy}
                    aria-roledescription={ariaRoleDescription || undefined}
                    aria-valuenow={value ?? undefined}
                    aria-valuetext={value != null ? formatted(value) : undefined}
                    aria-valuemin={lower}
                    aria-valuemax={upper}
                    aria-required={required || undefined}
                    aria-invalid={stateValue === 'error' || undefined}
                    style={{ ...inputStyle, ...(textAlign ? { textAlign } : null) }}
                    onKeyDown={(event) => {
                        inputKeyDown?.(event);
                        pageStep(event, disabled || readOnly);
                    }}
                    className={cn(
                        'm-0 box-border h-full min-w-0 flex-1 appearance-none border-0 bg-transparent px-1 py-0 text-end rtl:text-start',
                        'font-sap-font-family text-sap-font-size leading-[normal] font-normal not-italic text-sap-field-text-color [box-shadow:none] outline-none',
                        'placeholder:italic placeholder:text-sap-field-placeholder-text-color hc:placeholder:not-italic',
                        'selection:bg-sap-selected-color selection:text-sap-content-contrast-text-color',
                        'disabled:placeholder:opacity-0 readonly:placeholder:opacity-0',
                        !showButtons && 'px-2.5 compact:px-2',
                        inputClassName
                    )}
                />
                {showButtons && stepButton(true)}
            </NumberField.Group>
            {unitText && (
                <span
                    id={unitId}
                    className="ms-2 font-sap-font-family text-sap-font-size leading-[normal] text-sap-content-label-color"
                >
                    {unitText}
                </span>
            )}
            <span className="sr-only-sap" role="status" aria-live="polite">
                {announcement}
            </span>
        </NumberField.Root>
    );
}

/** The value text and the buttons keep the regular font of fundamental-styles in the HC error and warning states. */
const buttonClasses =
    'shrink-0 w-9 min-w-9 compact:w-8 compact:min-w-8 rounded-sap-field-border-corner-radius font-normal not-italic focus:after:hidden';

/**
 * While the input has the focus: a field without state loses its shadow; a field with a state keeps its state shadow,
 * and its buttons take the state colour and, in the HC themes, the active background (fundamental-styles).
 */
const FOCUS_STATE: Record<FormState, string> = {
    default: 'has-[input:focus]:[box-shadow:none]',
    success:
        'has-[input:focus]:[--sapButton_Lite_TextColor:var(--igBtnFocusColor)] has-[input:focus]:[&_button]:bg-sap-button-lite-active-background',
    error: 'has-[input:focus]:[--sapButton_Lite_TextColor:var(--igBtnFocusColor)] has-[input:focus]:[&_button]:bg-sap-button-lite-active-background',
    warning:
        'has-[input:focus]:[--sapButton_Lite_TextColor:var(--igBtnFocusColor)] has-[input:focus]:[&_button]:bg-sap-button-lite-active-background',
    information:
        'has-[input:focus]:[--sapButton_Lite_TextColor:var(--igBtnFocusColor)] has-[input:focus]:[&_button]:bg-sap-button-lite-active-background'
};

/** Whether a step change goes up (`true`) or down (`false`); `null` when not known. */
function stepsUp(details: StepInputChangeDetails): boolean | null {
    if (details.reason === 'increment-press') return true;
    if (details.reason === 'decrement-press') return false;
    const event = details.event as Event | undefined;
    if (event instanceof WheelEvent) return event.deltaY < 0;
    if (event instanceof KeyboardEvent) {
        if (event.key === 'ArrowUp') return true;
        if (event.key === 'ArrowDown') return false;
    }
    return null;
}

/**
 * Page Up and Page Down step by ten steps, as Angular: Base UI leaves them to the browser, so they go to its
 * Shift + Arrow handling (`largeStep`), which also commits any typed text first.
 */
function pageStep(event: ReactKeyboardEvent<HTMLInputElement>, locked: boolean) {
    if (locked || (event.key !== 'PageUp' && event.key !== 'PageDown') || event.defaultPrevented) return;
    event.preventDefault();
    event.currentTarget.dispatchEvent(
        new KeyboardEvent('keydown', {
            key: event.key === 'PageUp' ? 'ArrowUp' : 'ArrowDown',
            shiftKey: true,
            bubbles: true,
            cancelable: true
        })
    );
}
