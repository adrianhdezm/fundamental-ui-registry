/*
 * Port of fundamental-react (Forms) and @fundamental-ngx/core (radio) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import {
    createContext,
    use,
    useId,
    useRef,
    type ComponentProps,
    type MouseEvent,
    type ReactNode,
    type Ref,
    type RefCallback
} from 'react';
import { cn } from '@/lib/utils';

export type RadioState = 'success' | 'error' | 'warning' | 'information' | 'default';

export type RadioGroupChangeEventDetails = BaseRadioGroup.ChangeEventDetails;

/** Circle colours per value state: background, border width/style/colour, dot, hover background and border. */
const CIRCLE_STATE: Record<RadioState | 'readonly', string> = {
    default: [
        '[--rb-bg:var(--sapField_Background)] [--rb-bw:var(--sapField_BorderWidth)] [--rb-bs:var(--sapField_Selector_BorderStyle)]',
        '[--rb-bc:var(--sapField_BorderColor)] [--rb-dot:var(--sapContent_Selected_ForegroundColor)]',
        '[--rb-hover-bg:var(--sapContent_Selected_Hover_Background)] hc:[--rb-hover-bg:var(--sapSelectedColor)] [--rb-hover-bc:var(--sapField_Hover_BorderColor)]'
    ].join(' '),
    error: [
        '[--rb-bg:var(--sapField_InvalidBackground)] [--rb-bw:var(--sapField_InvalidBorderWidth)] [--rb-bs:var(--sapField_Selector_InvalidBorderStyle)]',
        '[--rb-bc:var(--sapField_InvalidColor)] [--rb-dot:var(--sapField_InvalidColor)] [--rb-hover-bc:var(--sapField_InvalidColor)]',
        '[--rb-hover-bg:var(--sapField_Hover_Background)] hc:[--rb-hover-bg:var(--sapField_InvalidBackground)]'
    ].join(' '),
    warning: [
        '[--rb-bg:var(--sapField_WarningBackground)] [--rb-bw:var(--sapField_WarningBorderWidth)] [--rb-bs:var(--sapField_Selector_WarningBorderStyle)]',
        '[--rb-bc:var(--sapField_WarningColor)] [--rb-dot:var(--sapField_WarningColor)] [--rb-hover-bc:var(--sapField_WarningColor)]',
        '[--rb-hover-bg:var(--sapField_Hover_Background)] hc:[--rb-hover-bg:var(--sapField_Hover_Background)]'
    ].join(' '),
    success: [
        '[--rb-bg:var(--sapField_SuccessBackground)] [--rb-bw:var(--sapField_SuccessBorderWidth)] [--rb-bs:var(--sapField_Selector_SuccessBorderStyle)]',
        '[--rb-bc:var(--sapField_SuccessColor)] [--rb-dot:var(--sapField_SuccessColor)] [--rb-hover-bc:var(--sapField_SuccessColor)]',
        '[--rb-hover-bg:var(--sapField_Hover_Background)] hc:[--rb-hover-bg:var(--sapField_Hover_Background)]'
    ].join(' '),
    information: [
        '[--rb-bg:var(--sapField_InformationBackground)] [--rb-bw:var(--sapField_InformationBorderWidth)] [--rb-bs:var(--sapField_Selector_InformationBorderStyle)]',
        '[--rb-bc:var(--sapField_InformationColor)] [--rb-dot:var(--sapField_InformationColor)] [--rb-hover-bc:var(--sapField_InformationColor)]',
        '[--rb-hover-bg:var(--sapField_Hover_Background)] hc:[--rb-hover-bg:var(--sapField_Hover_Background)]'
    ].join(' '),
    readonly: [
        '[--rb-bg:var(--sapField_ReadOnly_Background)] [--rb-bw:var(--sapElement_BorderWidth)] [--rb-bs:var(--sapField_Selector_ReadOnly_BorderStyle)]',
        '[--rb-bc:var(--sapField_ReadOnly_BorderColor)] [--rb-dot:var(--sapField_TextColor)] [--rb-hover-bc:var(--sapField_ReadOnly_BorderColor)]',
        '[--rb-hover-bg:var(--sapField_ReadOnly_Background)] hc:[--rb-hover-bg:var(--sapField_ReadOnly_Background)]'
    ].join(' ')
};

/** What a group passes down to its radios for their styles (Base UI already applies it to their behaviour). */
interface RadioGroupContextValue {
    disabled: boolean;
    readOnly: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue>({ disabled: false, readOnly: false });

export interface RadioGroupProps<Value = unknown> extends Omit<
    BaseRadioGroup.Props<Value>,
    'className' | 'render' | 'value' | 'defaultValue' | 'onValueChange'
> {
    /** The selected value (controlled): the radio with this `value` is checked; `null` checks none. */
    value?: Value | null;
    /** The initially selected value (uncontrolled). */
    defaultValue?: Value | null;
    /** Called with the value of the radio the user selects. */
    onValueChange?: (value: Value, eventDetails: RadioGroupChangeEventDetails) => void;
    /** Shows the radio buttons in a row (wrapping) instead of a column. */
    inline?: boolean;
    className?: string;
    children?: ReactNode;
}

/**
 * Groups radio buttons: one value, one `name`, one tab stop. Arrow keys move the selection between the enabled
 * radios, as with native radio buttons; Space selects the focused one.
 *
 * ```tsx
 * <RadioGroup aria-label="Size" value={size} onValueChange={setSize}>
 *     <Radio value="s">Small</Radio>
 *     <Radio value="m">Medium</Radio>
 * </RadioGroup>
 * ```
 */
export function RadioGroup<Value = unknown>({
    inline = false,
    disabled = false,
    readOnly = false,
    className,
    children,
    onValueChange,
    ...props
}: RadioGroupProps<Value>) {
    return (
        <RadioGroupContext value={{ disabled, readOnly }}>
            <BaseRadioGroup<Value | null>
                {...props}
                disabled={disabled}
                readOnly={readOnly}
                // a user selection is always one of the radios' values, never null
                onValueChange={onValueChange as BaseRadioGroup.Props<Value | null>['onValueChange']}
                className={cn(
                    'm-0 box-border flex flex-col items-start border-0 p-0',
                    'font-sap-font-family text-sap-font-size leading-[normal] text-sap-text-color',
                    inline && 'flex-row flex-wrap justify-start',
                    className
                )}
            >
                {children}
            </BaseRadioGroup>
        </RadioGroupContext>
    );
}

export interface RadioProps<Value = unknown> extends Omit<ComponentProps<'span'>, 'children' | 'title'> {
    /** The value of this option, selected in the group's `value` when the radio is checked. */
    value: Value;
    /** Text of the label. `children` work too, for rich content. */
    label?: ReactNode;
    children?: ReactNode;
    /** Value state: success, error, warning or information. */
    state?: RadioState | null;
    disabled?: boolean;
    /** Keeps the value; the radio stays focusable and is described as read-only. */
    readOnly?: boolean;
    /** Lets long labels wrap. */
    wrapLabel?: boolean;
    /** Vertical alignment of the circle next to a wrapped label. */
    valignLabel?: 'top' | 'middle';
    /** Id of the (hidden) native radio input, for an external `<label htmlFor>`. Generated when not given. */
    id?: string;
    /** Tooltip of the label. */
    title?: string;
    /** Announced for read-only radio buttons (`aria-description`). */
    readOnlyDescription?: string;
    /** Classes of the `<label>`. */
    labelClassName?: string;
    /** Classes of the label text. */
    textClassName?: string;
    /** Props of the `<label>`. */
    labelProps?: ComponentProps<'label'>;
    /** Props of the radio control (the focusable `role="radio"` element). */
    inputProps?: Omit<BaseRadio.Root.Props<Value>, 'className' | 'value'> & { className?: string };
    /** Ref of the (visually hidden) native radio input. */
    inputRef?: Ref<HTMLInputElement>;
}

/** Sets every ref in the list. */
function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
}

/**
 * SAP Fiori radio button, on Base UI's Radio, inside a `RadioGroup`: a circle and a label, with value states and
 * read-only and disabled modes. The whole label is clickable.
 */
export function Radio<Value = unknown>({
    value,
    label,
    children,
    state,
    disabled: disabledProp = false,
    readOnly: readOnlyProp = false,
    wrapLabel = false,
    valignLabel = 'middle',
    id: idProp,
    title,
    readOnlyDescription = 'This radio button is read-only and cannot be changed.',
    labelClassName,
    textClassName,
    labelProps,
    inputProps,
    inputRef,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    className,
    ...props
}: RadioProps<Value>) {
    const group = use(RadioGroupContext);
    const autoId = useId();
    const id = idProp ?? `fd-radio-${autoId}`;
    const disabled = disabledProp || group.disabled;
    const readOnly = readOnlyProp || group.readOnly;
    const stateValue = state ?? 'default';
    const content = label ?? children;
    const hasContent = content != null && content !== '' && content !== false;
    const controlRef = useRef<HTMLElement>(null);

    const { className: inputClassName, ref: inputPropsRef, ...controlProps } = inputProps ?? {};
    const {
        className: labelPropsClassName,
        onClick: onLabelClick,
        ...restLabelProps
    } = labelProps ?? ({} as ComponentProps<'label'>);

    /** A read-only radio keeps its value: a label click only focuses it. */
    const handleLabelClick = (event: MouseEvent<HTMLLabelElement>) => {
        onLabelClick?.(event);
        if (readOnly && !disabled) {
            event.preventDefault();
            controlRef.current?.focus();
        }
    };

    return (
        <span {...props} className={cn('relative inline-flex max-w-full', className)}>
            <label
                {...restLabelProps}
                htmlFor={id}
                title={title}
                onClick={handleLabelClick}
                className={cn(
                    'group/rb relative m-0 me-2 box-border flex w-fit max-w-full cursor-pointer items-center truncate',
                    'p-(--rb-pad) [--rb-pad:0.6875rem] [--rb-size:1.375rem] [--rb-dot-size:0.75rem]',
                    'compact:[--rb-pad:0.5rem] compact:[--rb-size:1rem] compact:[--rb-dot-size:0.5rem]',
                    'font-sap-font-family text-sap-font-size leading-4 text-sap-field-text-color',
                    // focus indicator around the label
                    'has-[[data-slot=radio]:focus]:outline-sap has-[[data-slot=radio]:focus]:outline-offset-[calc(0.25rem_-_var(--rb-pad))]',
                    'has-[[data-slot=radio]:focus]:rounded-[0.8rem] compact:has-[[data-slot=radio]:focus]:rounded-[0.5rem]',
                    CIRCLE_STATE[readOnly ? 'readonly' : 'default'],
                    !readOnly && stateValue !== 'default' && CIRCLE_STATE[stateValue],
                    wrapLabel && 'whitespace-normal',
                    wrapLabel && valignLabel === 'top' && 'items-start',
                    !hasContent && 'me-0',
                    disabled && 'pointer-events-none opacity-(--sapContent_DisabledOpacity)',
                    labelClassName,
                    labelPropsClassName
                )}
            >
                <BaseRadio.Root<Value>
                    {...controlProps}
                    ref={mergeRefs(controlRef, inputPropsRef)}
                    data-slot="radio"
                    id={id}
                    value={value}
                    disabled={disabled}
                    readOnly={readOnly}
                    inputRef={inputRef}
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={stateValue === 'error' || undefined}
                    aria-description={readOnly ? readOnlyDescription : undefined}
                    className={cn(
                        'relative m-0 box-border inline-flex size-(--rb-size) min-w-(--rb-size) shrink-0 items-center justify-center rounded-full outline-none [forced-color-adjust:none]',
                        'bg-(--rb-bg) border-(length:--rb-bw) [border-style:var(--rb-bs)] border-(--rb-bc)',
                        'group-hover/rb:bg-(--rb-hover-bg) group-hover/rb:border-(--rb-hover-bc)',
                        hasContent && 'me-(--rb-pad)',
                        inputClassName
                    )}
                >
                    <BaseRadio.Indicator className="block size-(--rb-dot-size) shrink-0 rounded-full bg-(--rb-dot)" />
                </BaseRadio.Root>
                <span
                    className={cn(
                        'm-0 truncate p-0 text-sap-font-size leading-[normal] text-sap-text-color',
                        wrapLabel && 'whitespace-normal',
                        !hasContent && 'hidden',
                        textClassName
                    )}
                >
                    {content}
                </span>
            </label>
        </span>
    );
}
