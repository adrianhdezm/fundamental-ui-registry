/*
 * Port of fundamental-react (Switch) and @fundamental-ngx/core (switch) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { useId, useState, type ComponentProps, type ReactNode, type Ref } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui/icon/icon';

export type SwitchChangeEventDetails = BaseSwitch.Root.ChangeEventDetails;

/** Track and handle colours: [unchecked, unchecked hover, checked, checked hover]. */
const COLORS = {
    standard: [
        '[--sw-track-bg:var(--sapButton_Track_Background)] [--sw-track-bc:var(--sapButton_Track_BorderColor)] [--sw-handle-bg:var(--sapButton_Handle_Background)] [--sw-handle-bc:var(--sapButton_Track_BorderColor)]',
        'hover:[--sw-track-bg:var(--sapButton_Track_Hover_Background)] hover:[--sw-track-bc:var(--sapButton_Track_Hover_BorderColor)] hover:[--sw-handle-bg:var(--sapButton_Handle_Selected_Hover_Background)] hover:[--sw-handle-bc:var(--sapButton_Handle_Hover_BorderColor)]',
        '[--sw-track-bg:var(--sapButton_Track_Selected_Background)] [--sw-track-bc:var(--sapButton_Selected_BorderColor)] [--sw-handle-bg:var(--sapButton_Selected_Background)] [--sw-handle-bc:var(--sapButton_Selected_BorderColor)]',
        'hover:[--sw-track-bg:var(--sapButton_Track_Selected_Hover_Background)] hover:[--sw-track-bc:var(--sapButton_Track_Selected_Hover_BorderColor)] hover:[--sw-handle-bg:var(--sapButton_Handle_Selected_Hover_Background)] hover:[--sw-handle-bc:var(--sapButton_Handle_Selected_Hover_BorderColor)]'
    ],
    semantic: [
        '[--sw-track-bg:var(--sapButton_Track_Negative_Background)] [--sw-track-bc:var(--sapButton_Track_Negative_BorderColor)] [--sw-handle-bg:var(--sapButton_Handle_Negative_Background)] [--sw-handle-bc:var(--sapButton_Track_Negative_Background)] hc:[--sw-handle-bc:var(--sapButton_Handle_Negative_BorderColor)]',
        'hover:[--sw-track-bg:var(--sapButton_Track_Negative_Hover_Background)] hover:[--sw-track-bc:var(--sapButton_Track_Negative_Hover_BorderColor)] hover:[--sw-handle-bg:var(--sapButton_Handle_Negative_Hover_Background)] hover:[--sw-handle-bc:var(--sapButton_Handle_Negative_Hover_BorderColor)]',
        '[--sw-track-bg:var(--sapButton_Track_Positive_Background)] [--sw-track-bc:var(--sapButton_Track_Positive_BorderColor)] [--sw-handle-bg:var(--sapButton_Handle_Positive_Background)] [--sw-handle-bc:var(--sapButton_Track_Positive_Background)] hc:[--sw-handle-bc:var(--sapButton_Handle_Positive_BorderColor)]',
        'hover:[--sw-track-bg:var(--sapButton_Track_Positive_Hover_Background)] hover:[--sw-track-bc:var(--sapButton_Track_Positive_Hover_BorderColor)] hover:[--sw-handle-bg:var(--sapButton_Handle_Positive_Hover_Background)] hover:[--sw-handle-bc:var(--sapButton_Handle_Positive_Hover_BorderColor)]'
    ]
} as const;

/** Handle offsets of the sliding track (off/on), cozy and compact. RTL mirrors them. */
const OFFSETS = {
    standard: '[--sw-off:-1.2475rem] [--sw-on:-0.5075rem] compact:[--sw-off:-0.8125rem] compact:[--sw-on:-0.3125rem]',
    text: '[--sw-off:-1.125rem] [--sw-on:-0.25rem] compact:[--sw-off:-0.5625rem] compact:[--sw-on:0.1875rem]'
};

export interface SwitchProps extends Omit<
    ComponentProps<'span'>,
    'children' | 'defaultChecked' | 'defaultValue' | 'onChange'
> {
    /** Label content, shown after the switch. The whole label is clickable. */
    children?: ReactNode;
    /** On/off state (controlled). */
    checked?: boolean;
    /** Initial state (uncontrolled). */
    defaultChecked?: boolean;
    /** Called with the new state when the user switches it. */
    onCheckedChange?: (checked: boolean, eventDetails: SwitchChangeEventDetails) => void;
    /** Accept/decline colours and icons; the state is announced with `acceptLabel`/`declineLabel`. */
    semantic?: boolean;
    /** Short text shown when on (e.g. "On"); replaces the icon. */
    activeText?: string;
    /** Short text shown when off (e.g. "Off"); replaces the icon. */
    inactiveText?: string;
    disabled?: boolean;
    required?: boolean;
    /** Name of the field when a form is submitted. */
    name?: string;
    /** Value submitted with the form when on (the native input's `value`; "on" by default). */
    formValue?: string;
    /** Id of the (visually hidden) native input, for an external `<label htmlFor>`. Generated when not given. */
    id?: string;
    /** Announced state of a semantic switch when on. */
    acceptLabel?: string;
    /** Announced state of a semantic switch when off. */
    declineLabel?: string;
    /** Props of the `<label>`. */
    labelProps?: ComponentProps<'label'>;
    /** Props of the switch control (the focusable `role="switch"` element, which draws the track). */
    inputProps?: Omit<BaseSwitch.Root.Props, 'className'> & { className?: string };
    /** Ref of the (visually hidden) native checkbox input. */
    inputRef?: Ref<HTMLInputElement>;
}

/**
 * SAP Fiori switch, on Base UI's Switch: turns a setting on or off immediately. A semantic switch shows
 * accept/decline colours; `activeText`/`inactiveText` show short texts (e.g. ON/OFF) instead of icons. The whole
 * label is clickable; Space toggles the focused switch.
 *
 * ```tsx
 * <Switch aria-label="Wi-Fi" checked={wifi} onCheckedChange={setWifi} />
 * <Switch semantic defaultChecked>Approved</Switch>
 * ```
 */
export function Switch({
    children,
    checked,
    defaultChecked = false,
    onCheckedChange,
    semantic = false,
    activeText = '',
    inactiveText = '',
    disabled = false,
    required = false,
    name,
    formValue,
    id: idProp,
    acceptLabel = 'Accept',
    declineLabel = 'Decline',
    labelProps,
    inputProps,
    inputRef,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    className,
    ...props
}: SwitchProps) {
    const autoId = useId();
    const id = idProp ?? `fd-switch-${autoId}`;
    const [uncontrolled, setUncontrolled] = useState(defaultChecked);
    const isChecked = checked ?? uncontrolled;
    /** Transitions only after the first user change, so the initial state does not animate in. */
    const [animate, setAnimate] = useState(false);

    const handleChange = (next: boolean, details: SwitchChangeEventDetails) => {
        setAnimate(true);
        if (checked === undefined) setUncontrolled(next);
        onCheckedChange?.(next, details);
    };

    const hasText = !!(activeText || inactiveText);
    const hasContent = children != null && children !== '' && children !== false;
    const colors = COLORS[semantic ? 'semantic' : 'standard'];

    // A semantic switch is named by its label (or aria-label) followed by the announced state, as in Angular.
    const textId = `${id}-text`;
    const nameId = `${id}-name`;
    const semanticId = `${id}-semantic-label`;
    const labelledBy = semantic
        ? [ariaLabelledBy ?? (ariaLabel ? nameId : hasContent ? textId : undefined), semanticId]
              .filter(Boolean)
              .join(' ')
        : ariaLabelledBy;

    const iconClass = (on: boolean) =>
        cn(
            'absolute flex w-7 min-w-7 items-center justify-center',
            'text-sap-font-large-size leading-[1.375rem] compact:text-sap-font-size compact:leading-[1.375rem]',
            semantic
                ? on
                    ? 'text-sap-button-track-positive-border-color'
                    : 'text-sap-button-track-negative-border-color'
                : on
                  ? 'text-sap-button-handle-selected-text-color'
                  : 'text-sap-button-handle-text-color',
            on === isChecked ? 'visible opacity-100' : 'invisible opacity-0',
            animate && 'transition-[visibility,opacity] delay-[30ms] duration-0'
        );
    const textClass = (on: boolean) =>
        cn(
            'absolute flex w-7 items-center justify-center uppercase',
            'font-sap-font-semibold-duplex-family text-sap-font-small-size leading-none',
            on ? 'text-sap-button-handle-selected-text-color' : 'text-sap-button-handle-text-color',
            on === isChecked ? 'visible opacity-100' : 'invisible opacity-0',
            animate && 'transition-[visibility,opacity] delay-[30ms] duration-0'
        );

    const { className: inputClassName, ...controlProps } = inputProps ?? {};
    const { className: labelClassName, ...restLabelProps } = labelProps ?? {};

    return (
        <span {...props} className={cn('block', className)}>
            <label
                {...restLabelProps}
                htmlFor={id}
                className={cn(
                    'relative m-0 box-border flex w-fit max-w-full items-center gap-2 overflow-visible',
                    'px-[0.3125rem] py-2.5 compact:py-1.5 cursor-pointer',
                    'font-sap-font-family text-sap-font-size leading-[normal] text-sap-content-label-color',
                    semantic && 'compact:py-[0.1875rem] compact:px-0',
                    isChecked ? [colors[2], colors[3]] : [colors[0], colors[1]],
                    hasText ? OFFSETS.text : OFFSETS.standard,
                    disabled && 'pointer-events-none cursor-auto opacity-(--sapContent_DisabledOpacity)',
                    labelClassName
                )}
            >
                <span className="relative inline-block">
                    <BaseSwitch.Root
                        {...controlProps}
                        data-slot="switch"
                        id={id}
                        name={name}
                        value={formValue}
                        checked={isChecked}
                        onCheckedChange={handleChange}
                        disabled={disabled}
                        required={required}
                        inputRef={inputRef}
                        aria-label={ariaLabel}
                        aria-labelledby={labelledBy}
                        aria-describedby={ariaDescribedBy}
                        className={cn(
                            'relative m-0 block box-content p-0 rounded-[0.75rem] border-0 outline-none [forced-color-adjust:none]',
                            'h-6 w-10 compact:h-5 compact:w-8',
                            hasText && 'w-[2.875rem] compact:w-[2.75rem]',
                            'text-sap-text-color bg-(--sw-track-bg) [box-shadow:inset_0_0_0_0.0625rem_var(--sw-track-bc)]',
                            // focus frame around the track
                            "focus:before:absolute focus:before:block focus:before:content-['']",
                            'focus:before:-inset-[calc(var(--sapContent_FocusWidth)*2)] focus:before:rounded-[calc(0.75rem_+_var(--sapContent_FocusWidth)*2)]',
                            'focus:before:border-(length:--sapContent_FocusWidth) focus:before:[border-style:var(--sapContent_FocusStyle)] focus:before:border-sap-content-focus-color',
                            animate && 'transition-all duration-100',
                            inputClassName
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                'absolute top-1/2 m-0 flex min-w-[4.25rem] compact:min-w-[3.125rem] items-center justify-center p-0',
                                '[--sw-dir:1] rtl:[--sw-dir:-1]',
                                isChecked ? '[--sw-x:var(--sw-on)]' : '[--sw-x:var(--sw-off)]',
                                '[transform:translate(calc(var(--sw-x)*var(--sw-dir)),-50%)]',
                                animate && 'transition-all duration-100'
                            )}
                        >
                            {activeText ? (
                                <span className={textClass(true)}>{activeText}</span>
                            ) : (
                                <Icon glyph="accept" className={iconClass(true)} />
                            )}
                            <span
                                data-slot="switch-handle"
                                className={cn(
                                    'm-0 box-content p-0 bg-clip-padding hc:box-border',
                                    'min-h-5 min-w-6 rounded-[0.75rem] compact:min-h-4 compact:min-w-5',
                                    hasText && 'min-w-7 compact:min-w-7',
                                    'border-[0.125rem] border-solid border-(--sw-handle-bc) bg-(--sw-handle-bg)'
                                )}
                            />
                            {inactiveText ? (
                                <span className={textClass(false)}>{inactiveText}</span>
                            ) : (
                                <Icon glyph={semantic ? 'decline' : 'less'} className={iconClass(false)} />
                            )}
                        </span>
                    </BaseSwitch.Root>
                    {semantic && ariaLabel && !ariaLabelledBy && (
                        <span id={nameId} hidden>
                            {ariaLabel}
                        </span>
                    )}
                    {semantic && (
                        <span id={semanticId} hidden>
                            {isChecked ? acceptLabel : declineLabel}
                        </span>
                    )}
                </span>
                {hasContent && <span id={textId}>{children}</span>}
            </label>
        </span>
    );
}
