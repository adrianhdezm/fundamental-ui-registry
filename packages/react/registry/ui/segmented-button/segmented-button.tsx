/*
 * Port of fundamental-react (Button) and @fundamental-ngx/core (segmented-button) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import {
    Children,
    cloneElement,
    createContext,
    Fragment,
    isValidElement,
    use,
    type ReactElement,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/ui/button/button';

export type SegmentedButtonChangeEventDetails = ToggleGroup.ChangeEventDetails;

interface SegmentedButtonBaseProps extends Omit<
    ToggleGroup.Props,
    'className' | 'value' | 'defaultValue' | 'onValueChange' | 'multiple' | 'orientation' | 'loopFocus'
> {
    /** Stacks the buttons; ArrowUp and ArrowDown move between them. */
    vertical?: boolean;
    /** Disables every button of the group. */
    disabled?: boolean;
    /** Role description of the group, announced by screen readers. */
    groupRoleDescription?: string;
    /** Role description of each button, announced by screen readers. */
    buttonRoleDescription?: string;
    className?: string;
    /** `SegmentedButtonItem`s. */
    children?: ReactNode;
}

export interface SegmentedButtonSingleProps extends SegmentedButtonBaseProps {
    /** Several buttons can be selected; the value is then an array. */
    toggle?: false;
    /** Value of the selected button (controlled); `null` selects none. */
    value?: string | null;
    /** Value of the initially selected button (uncontrolled). */
    defaultValue?: string | null;
    /** Called with the value of the button the user selects. */
    onValueChange?: (value: string, eventDetails: SegmentedButtonChangeEventDetails) => void;
}

export interface SegmentedButtonToggleProps extends SegmentedButtonBaseProps {
    /** Several buttons can be selected; the value is then an array. */
    toggle: true;
    /** Values of the selected buttons (controlled), in the order they were selected. */
    value?: readonly string[] | null;
    /** Values of the initially selected buttons (uncontrolled). */
    defaultValue?: readonly string[] | null;
    /** Called with the values of the selected buttons after the user selects or deselects one. */
    onValueChange?: (value: string[], eventDetails: SegmentedButtonChangeEventDetails) => void;
}

export type SegmentedButtonProps = SegmentedButtonSingleProps | SegmentedButtonToggleProps;

interface SegmentedButtonContextValue {
    buttonRoleDescription: string;
}

const SegmentedButtonContext = createContext<SegmentedButtonContextValue>({
    buttonRoleDescription: 'Segmented button'
});
/** Position of a button in the group and the size of the set. */
const SegmentedButtonPositionContext = createContext<{ setSize: number; position: number } | null>(null);

/** Children with fragments flattened, keeping unique keys. */
function flatten(children: ReactNode, prefix = ''): ReactNode[] {
    return Children.toArray(children).flatMap((child) => {
        if (!isValidElement<{ children?: ReactNode }>(child)) return [child];
        if (child.type === Fragment) return flatten(child.props.children, `${prefix}${child.key}/`);
        return [prefix ? cloneElement(child, { key: `${prefix}${child.key}` }) : child];
    });
}

function toArray(value: string | readonly string[] | null | undefined): readonly string[] | undefined {
    if (value === undefined) return undefined;
    if (value === null) return [];
    return typeof value === 'string' ? [value] : value;
}

/**
 * Segmented button: a group of buttons of which one (or, with `toggle`, several) is selected, on Base UI's
 * ToggleGroup. A listbox of options for assistive technology; arrow keys, Home and End move between the buttons
 * (one tab stop), Enter and Space select.
 *
 * ```tsx
 * <SegmentedButton aria-label="View" value={view} onValueChange={setView}>
 *     <SegmentedButtonItem value="list" glyph="list" aria-label="List" />
 *     <SegmentedButtonItem value="grid" glyph="grid" aria-label="Grid" />
 * </SegmentedButton>
 * ```
 */
export function SegmentedButton({
    toggle = false,
    vertical = false,
    disabled = false,
    value,
    defaultValue,
    onValueChange,
    groupRoleDescription = 'Segmented button group',
    buttonRoleDescription = 'Segmented button',
    className,
    children,
    ...props
}: SegmentedButtonProps) {
    const items = flatten(children);
    const setSize = items.filter(isValidElement).length;
    let position = 0;
    return (
        <SegmentedButtonContext value={{ buttonRoleDescription }}>
            <ToggleGroup
                {...props}
                role="listbox"
                aria-multiselectable={toggle}
                aria-orientation={vertical ? 'vertical' : 'horizontal'}
                aria-roledescription={groupRoleDescription}
                aria-disabled={disabled || undefined}
                multiple={toggle}
                orientation={vertical ? 'vertical' : 'horizontal'}
                loopFocus={false}
                disabled={disabled}
                value={toArray(value)}
                defaultValue={toArray(defaultValue)}
                onValueChange={(next, eventDetails) => {
                    // a single selection stays selected on a second click, as a radio group
                    if (!toggle && next.length === 0) {
                        eventDetails.cancel();
                        return;
                    }
                    if (toggle) (onValueChange as SegmentedButtonToggleProps['onValueChange'])?.(next, eventDetails);
                    else (onValueChange as SegmentedButtonSingleProps['onValueChange'])?.(next[0], eventDetails);
                }}
                className={cn(
                    'relative box-border inline-flex w-fit align-middle [&>button]:m-0 [&>button:hover]:z-[1]',
                    // transparent buttons on a pad (the ::before, as fundamental-styles); high contrast: joined bordered buttons
                    "before:absolute before:inset-0 before:content-[''] before:rounded-sap-button-border-corner-radius before:bg-sap-button-background",
                    'before:[box-shadow:inset_0_0_0_var(--sapButton_BorderWidth)_var(--sapButton_BorderColor)]',
                    '[&>button]:border-transparent [&>button]:bg-transparent hc:[&>button]:border-sap-button-border-color',
                    vertical
                        ? [
                              'flex-col',
                              '[&>button:not(:last-child)]:rounded-b-sap-button-segment-border-corner-radius [&>button:not(:first-child)]:rounded-t-sap-button-segment-border-corner-radius',
                              'hc:[&>button:not(:last-child)]:-mb-(--sapButton_BorderWidth)'
                          ]
                        : [
                              '[&>button:not(:last-child)]:rounded-e-sap-button-segment-border-corner-radius [&>button:not(:first-child)]:rounded-s-sap-button-segment-border-corner-radius',
                              'hc:[&>button:not(:last-child)]:-me-(--sapButton_BorderWidth)'
                          ],
                    className
                )}
            >
                {items.map((item, index) =>
                    isValidElement(item) ? (
                        <SegmentedButtonPositionContext
                            key={(item as ReactElement).key ?? index}
                            value={{ setSize, position: ++position }}
                        >
                            {item}
                        </SegmentedButtonPositionContext>
                    ) : (
                        item
                    )
                )}
            </ToggleGroup>
        </SegmentedButtonContext>
    );
}

export interface SegmentedButtonItemProps extends Omit<
    ButtonProps,
    | 'value'
    | 'toggled'
    | 'selected'
    | 'focusableWhenDisabled'
    | 'disabledMessage'
    | 'enabledMessage'
    | 'render'
    | 'nativeButton'
> {
    /** Identifies the button in the group's value. */
    value: string;
}

/**
 * A button of a `SegmentedButton`: our `Button` (all its props but the toggled and selected states, which the group
 * sets) as an option of the group.
 */
export function SegmentedButtonItem({
    value,
    disabled = false,
    variant,
    label,
    glyph,
    glyphPosition,
    glyphFont,
    menu,
    fullWidth,
    decisive,
    description,
    typeDescription,
    badge,
    className,
    children,
    ...props
}: SegmentedButtonItemProps) {
    const { buttonRoleDescription } = use(SegmentedButtonContext);
    const position = use(SegmentedButtonPositionContext);
    return (
        <Toggle
            {...(props as Toggle.Props)}
            value={value}
            disabled={disabled}
            render={(toggleProps, state) => (
                <Button
                    {...(toggleProps as ButtonProps)}
                    // the initial tab stop is the selected button (Base UI reads this attribute once)
                    data-composite-item-active={state.pressed ? '' : undefined}
                    // disabled buttons are out of the tab order
                    tabIndex={state.disabled ? -1 : toggleProps.tabIndex}
                    role="option"
                    aria-roledescription={buttonRoleDescription}
                    aria-posinset={position?.position}
                    aria-setsize={position?.setSize}
                    aria-pressed={undefined}
                    aria-selected={state.pressed}
                    selected={state.pressed}
                    disabled={state.disabled}
                    variant={variant}
                    label={label}
                    glyph={glyph}
                    glyphPosition={glyphPosition}
                    glyphFont={glyphFont}
                    menu={menu}
                    fullWidth={fullWidth}
                    decisive={decisive}
                    description={description}
                    typeDescription={typeDescription}
                    badge={badge}
                    className={className}
                >
                    {children}
                </Button>
            )}
        />
    );
}
