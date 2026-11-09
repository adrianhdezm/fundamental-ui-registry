/*
 * Port of fundamental-react (Select) and @fundamental-ngx/core (select) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Select as BaseSelect } from '@base-ui/react/select';
import { useDirection } from '@base-ui/react/direction-provider';
import {
    Children,
    createContext,
    isValidElement,
    use,
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type ComponentProps,
    type CSSProperties,
    type FocusEvent,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { ButtonBar } from '@/ui/bar/bar';
import { buttonVariants } from '@/ui/button/button';
import {
    Dialog,
    DialogBody,
    DialogCloseButton,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle
} from '@/ui/dialog/dialog';
import { Icon, type IconFont } from '@/ui/icon/icon';
import { fieldBase, fieldStates, type FormState } from '@/ui/input/input';
import { LIST_DROPDOWN_ITEM, ListMessage, ListTitle } from '@/ui/list/list';
import { popoverSurfaceVariants, type PopoverFillMode } from '@/ui/popover/popover';

export type TextOverflowMode = 'full' | 'ellipsis';

/**
 * fundamental-styles' parts of a dropdown option: no gap (the icon box and the secondary text's start padding space
 * them), icons 1.125rem (1rem compact) on a 1rem line, a title at least one line high that wraps, and title and
 * secondary text sharing the row.
 */
const OPTION_PARTS = [
    'gap-x-0',
    '[--li-ifs:1.125rem] compact:[--li-ifs:1rem] [&_[data-slot=list-icon]]:leading-4',
    '[&_[data-slot=list-title]]:min-h-4 compact:[&_[data-slot=list-title]]:min-h-3.5 [&_[data-slot=list-title]]:flex-auto [&_[data-slot=list-title]]:whitespace-normal',
    '[&_[data-slot=list-secondary]]:flex-auto [&_[data-slot=list-secondary]]:max-w-64'
].join(' ');

/** Dialog options of a select in mobile mode. */
export interface SelectMobileConfig {
    /** Title of the dialog; it names the dialog. */
    title?: string;
    /** Shows a close button in the header (default true). */
    hasCloseButton?: boolean;
    /** With an approve button the choice is applied only when it is pressed. */
    approveButtonText?: string;
    cancelButtonText?: string;
}

/** An option as the select knows it: its value, whether it is disabled and its text. */
export interface SelectOptionData<T = unknown> {
    value: T | null | undefined;
    disabled: boolean;
    /** The text shown in the control and matched by typeahead. */
    label: string;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Options
 * ---------------------------------------------------------------------------------------------------------------- */

interface SelectContextValue {
    /** `popup`: Base UI items in the dropdown; `dialog`: plain options in the mobile dialog. */
    mode: 'popup' | 'dialog';
    isSelected: (value: unknown) => boolean;
    /** The option highlighted in the mobile dialog (aria-activedescendant). */
    activeId: string | null;
    /** Chooses an option of the mobile dialog. */
    choose: (value: unknown, id: string) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

export interface SelectOptionProps<T = unknown> extends Omit<ComponentProps<'li'>, 'value' | 'children'> {
    /** The value the option stands for; an option without a value clears the select (shows the placeholder). */
    value?: T | null;
    disabled?: boolean;
    /** The text shown in the control and matched by typeahead (default: the text of its `ListTitle`, or of the option). */
    label?: string;
    /** Plain text is the title; add `ListTitle`, `ListSecondary` and `ListIcon` parts for richer options. */
    children?: ReactNode;
}

/** Text of a React node: its strings and numbers, in order. */
function textOf(node: ReactNode): string {
    if (node == null || typeof node === 'boolean') return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(textOf).join('');
    if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
    return '';
}

/** The `ListTitle` among the children of an option, at any depth. */
function findTitle(node: ReactNode): ReactElement<{ children?: ReactNode }> | undefined {
    for (const child of Children.toArray(node)) {
        if (!isValidElement<{ children?: ReactNode }>(child)) continue;
        if (child.type === ListTitle) return child;
        const inner = findTitle(child.props.children);
        if (inner) return inner;
    }
    return undefined;
}

/** The text of an option: its `label`, or the text of its title, or all of its text. */
function optionLabel(props: SelectOptionProps): string {
    if (props.label != null) return props.label;
    const title = findTitle(props.children);
    return textOf(title ? title.props.children : props.children)
        .replace(/\s+/g, ' ')
        .trim();
}

/** The `SelectOption`s among the children of a select, in order, at any depth (as Angular's `contentChildren`). */
function collectOptions<T>(node: ReactNode, into: SelectOptionData<T>[] = []): SelectOptionData<T>[] {
    for (const child of Children.toArray(node)) {
        if (!isValidElement<SelectOptionProps<T>>(child)) continue;
        if (child.type === SelectOption) {
            into.push({ value: child.props.value, disabled: !!child.props.disabled, label: optionLabel(child.props) });
        } else {
            collectOptions(child.props.children, into);
        }
    }
    return into;
}

/**
 * An option of a select: a dropdown list item (`LIST_DROPDOWN_ITEM`). Plain text is shown as the title; add
 * `ListTitle`, `ListSecondary` and `ListIcon` parts for richer options. Native props go to its `<li>`.
 *
 * ```tsx
 * <SelectOption value="apple">Apple</SelectOption>
 * ```
 */
export function SelectOption<T = unknown>({
    value,
    disabled = false,
    label,
    id: idProp,
    className,
    children,
    ...props
}: SelectOptionProps<T>) {
    const context = use(SelectContext);
    const autoId = useId();
    const id = idProp ?? `fd-option-${autoId}`;
    const text = label ?? optionLabel({ label, children });
    const content = findTitle(children) ? (
        children
    ) : (
        <span className="min-h-4 min-w-0 flex-auto whitespace-normal compact:min-h-3.5">{children}</span>
    );

    if (context?.mode === 'popup') {
        return (
            <BaseSelect.Item
                {...(props as Omit<BaseSelect.Item.Props, 'value' | 'className' | 'render'>)}
                value={value ?? null}
                disabled={disabled}
                label={text}
                className={cn(LIST_DROPDOWN_ITEM, OPTION_PARTS, className)}
                render={(itemProps, state) => (
                    <li
                        {...(itemProps as ComponentProps<'li'>)}
                        id={id}
                        aria-disabled={disabled || undefined}
                        data-active={state.highlighted ? '' : undefined}
                    />
                )}
            >
                {content}
            </BaseSelect.Item>
        );
    }

    const selected = !!context && value != null && context.isSelected(value);
    return (
        <li
            {...props}
            id={id}
            role="option"
            tabIndex={-1}
            aria-selected={selected}
            aria-disabled={disabled || undefined}
            data-value-label={text}
            data-active={context?.activeId === id ? '' : undefined}
            className={cn(LIST_DROPDOWN_ITEM, OPTION_PARTS, className)}
            onMouseDown={(event) => {
                props.onMouseDown?.(event);
                // the focus stays on the listbox
                event.preventDefault();
            }}
            onClick={(event) => {
                props.onClick?.(event);
                if (!disabled) context?.choose(value, id);
            }}
        >
            {content}
        </li>
    );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Select
 * ---------------------------------------------------------------------------------------------------------------- */

export interface SelectProps<T = unknown> extends Omit<
    ComponentProps<'div'>,
    'defaultValue' | 'onChange' | 'onSelect' | 'children' | 'placeholder'
> {
    /** The `SelectOption`s, with group headers (`ListGroupHeader role="presentation"`) between them if needed. */
    children?: ReactNode;
    /** The selected value, for a controlled select (with `onValueChange`); `null` for none. */
    value?: T | null;
    /** The initial value, for an uncontrolled select. */
    defaultValue?: T | null;
    /** Called with the new value when the user chooses an option (`null` for an option without a value). */
    onValueChange?: (value: T | null) => void;
    placeholder?: string;
    /** Id of the control (the combobox). */
    controlId?: string;
    /** Value state of the field. */
    state?: FormState | null;
    /** Message shown on top of the list, coloured by the state. */
    stateMessage?: ReactNode;
    /** `full` wraps the state message; `ellipsis` truncates it. */
    textOverflow?: TextOverflowMode;
    disabled?: boolean;
    /** Shows the value without the arrow; the list does not open. */
    readOnly?: boolean;
    required?: boolean;
    /** Takes the width of the selected text (default) instead of the full width. */
    inline?: boolean;
    /** Opens the list in a full-screen dialog. */
    mobile?: boolean;
    mobileConfig?: SelectMobileConfig;
    /** Accessible name of the close button of the mobile dialog. */
    closeLabel?: string;
    /** Maximum height of the list; 45% of the viewport by default. */
    maxHeight?: string;
    glyph?: string;
    glyphFont?: IconFont;
    /** Closes the list on a click outside (default true). */
    closeOnOutsideClick?: boolean;
    /** Width of the list relative to the control: `at-least` as wide (default), `equal`, or `fit-content`. */
    fillControlMode?: PopoverFillMode | null;
    /** Element the list is rendered into (default `document.body`). */
    container?: BaseSelect.Portal.Props['container'];
    /** Renders the control text (Angular's `controlTemplate`): the text and the selected option. */
    renderValue?: (text: string, selected: SelectOptionData<T> | undefined) => ReactNode;
    /** Compares option values with the value (default `===`). */
    compareWith?: (a: T, b: T) => boolean;
    /** Time in ms typed characters are collected before they are matched (default 250). */
    typeaheadDebounceInterval?: number;
    /** `closeAndSelect` selects the highlighted option when Tab closes the list. */
    tabOutStrategy?: 'close' | 'closeAndSelect';
    tabIndex?: number;
    /** Whether the list is open (controlled). */
    open?: boolean;
    defaultOpen?: boolean;
    /** Called when the list opens or closes. */
    onOpenChange?: (open: boolean) => void;
    /** Name of the hidden input, for form submission. */
    name?: string;
    /** Id of the form the hidden input belongs to. */
    form?: string;
    /** Ref of the control (the combobox), e.g. to focus it. */
    controlRef?: Ref<HTMLDivElement>;
    /** Classes of the control (Angular's `selectControlClass`, fundamental-react's `controlClassName`). */
    controlClassName?: string;
    /** Classes of the text in the control (fundamental-react's `textContentClassName`). */
    textClassName?: string;
    /** Classes of the arrow button (fundamental-react's `triggerClassName`). */
    buttonClassName?: string;
    /** Classes of the listbox (fundamental-react's `listClassName`). */
    listClassName?: string;
    /** Props of the popup around the list (fundamental-react's `popoverProps`). */
    popoverProps?: Omit<ComponentProps<'div'>, 'children'> & { [key: `data-${string}`]: string | undefined };
}

const MESSAGE_TYPE = { success: 'success', error: 'error', warning: 'warning', information: 'information' } as const;

/** Keys that open the closed list. */
const isOpenKey = (event: KeyboardEvent, typing: boolean) =>
    (!typing &&
        (event.key === 'Enter' || event.key === ' ') &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !event.altKey) ||
    (event.altKey && event.key === 'ArrowDown') ||
    event.key === 'F4';

/** Keys that close the open list. */
const isCloseKey = (event: KeyboardEvent) =>
    event.key === 'Escape' ||
    (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) ||
    event.key === 'F4';

/** A printable character for typeahead (Shift is allowed, as the Angular CDK). */
const isTypeaheadKey = (event: KeyboardEvent) =>
    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

/** The index of the next enabled entry from `from` by `delta`, without wrapping; -1 when there is none. */
function step(disabled: boolean[], from: number, delta: number): number {
    for (let i = from + delta; i >= 0 && i < disabled.length; i += delta) if (!disabled[i]) return i;
    return -1;
}

/** The first enabled entry after `from` (wrapping) whose label starts with `letters`; -1 when there is none. */
function matchLabel(labels: string[], disabled: boolean[], from: number, letters: string): number {
    const query = letters.toLocaleUpperCase();
    for (let i = 1; i <= labels.length; i++) {
        const index = (from + i + labels.length) % labels.length;
        if (!disabled[index] && labels[index]!.toLocaleUpperCase().trim().startsWith(query)) return index;
    }
    return -1;
}

/** Collects typed characters and matches them once typing pauses, as the Angular CDK's typeahead. */
function useTypeahead(interval: number) {
    const letters = useRef('');
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);
    const type = useCallback(
        (key: string, onMatch: (letters: string) => void) => {
            letters.current += key;
            clearTimeout(timer.current);
            timer.current = setTimeout(() => {
                const typed = letters.current;
                letters.current = '';
                onMatch(typed);
            }, interval);
        },
        [interval]
    );
    const reset = useCallback(() => {
        clearTimeout(timer.current);
        letters.current = '';
    }, []);
    return { type, reset, isTyping: () => letters.current !== '' };
}

/**
 * Select: a field that opens a list of options, on Base UI's Select. The control is a `combobox` with
 * `aria-haspopup="listbox"`. Closed, the arrow keys, Home, End and typing change the value directly; Enter, Space,
 * Alt+Down and F4 open the list, as does a click. Open, the focus is on the highlighted option: Up, Down, Home, End
 * and typing move it (disabled options are skipped), Enter, Space or a click choose it, and Escape, Alt+Up or F4
 * close the list. In mobile mode the list opens in a full-screen dialog, optionally with approve and cancel buttons.
 *
 * Native props, `className` and `ref` go to the root `<div>`; `aria-label`, `aria-labelledby` and
 * `aria-describedby` go to the control (and name the listbox).
 *
 * ```tsx
 * <FormLabel id="fruit-label">Fruit</FormLabel>
 * <Select aria-labelledby="fruit-label" placeholder="Select a fruit" value={fruit} onValueChange={setFruit}>
 *     {fruits.map((fruit) => <SelectOption key={fruit} value={fruit}>{fruit}</SelectOption>)}
 * </Select>
 * ```
 */
export function Select<T = unknown>({
    children,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    placeholder,
    controlId: controlIdProp,
    state,
    stateMessage,
    textOverflow = 'ellipsis',
    disabled = false,
    readOnly = false,
    required = false,
    inline = true,
    mobile = false,
    mobileConfig = { hasCloseButton: true },
    closeLabel = 'Close',
    maxHeight,
    glyph = 'slim-arrow-down',
    glyphFont = 'SAP-icons',
    closeOnOutsideClick = true,
    fillControlMode = 'at-least',
    container,
    renderValue,
    compareWith,
    typeaheadDebounceInterval = 250,
    tabOutStrategy = 'close',
    tabIndex = 0,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    name,
    form,
    controlRef,
    controlClassName,
    textClassName,
    buttonClassName,
    listClassName,
    popoverProps,
    className,
    onBlur,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
}: SelectProps<T>) {
    const autoId = useId();
    const controlId = controlIdProp ?? `fd-select-${autoId}`;
    const listId = `${controlId}-list-box`;
    const messageId = `${controlId}-message`;
    const dialogTitleId = `${controlId}-dialog-title`;
    const rtl = useDirection() === 'rtl';
    const stateValue = state ?? 'default';

    const [ownValue, setOwnValue] = useState<T | null>(defaultValue);
    const value = valueProp !== undefined ? valueProp : ownValue;
    const compare = useCallback(
        (a: T | null | undefined, b: T | null | undefined) => {
            if (a == null || b == null) return a == null && b == null;
            try {
                return compareWith ? compareWith(a, b) : a === b;
            } catch {
                return false;
            }
        },
        [compareWith]
    );

    const options = collectOptions<T>(children);
    const selectedIndex = value == null ? -1 : options.findIndex((o) => o.value != null && compare(o.value, value));
    const selected = options[selectedIndex];
    const triggerText = selected?.label || placeholder || '';
    const interactive = !disabled && !readOnly;

    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const open = interactive && options.length > 0 && (openProp ?? ownOpen);
    const approveMode = mobile && !!mobileConfig.approveButtonText;
    // the pending choice of a mobile dialog with an approve button
    const [pending, setPending] = useState<T | null>(value);

    const control = useRef<HTMLDivElement | null>(null);
    const setControl = useCallback(
        (node: HTMLDivElement | null) => {
            control.current = node;
            if (typeof controlRef === 'function') controlRef(node);
            else if (controlRef) controlRef.current = node;
        },
        [controlRef]
    );
    const popup = useRef<HTMLDivElement | null>(null);
    const list = useRef<HTMLUListElement | null>(null);
    const dialogWindow = useRef<HTMLDivElement | null>(null);
    const tabbing = useRef(false);
    const typeahead = useTypeahead(typeaheadDebounceInterval);
    const [activeId, setActiveId] = useState<string | null>(null);

    const setOpen = (next: boolean) => {
        if (next && (!interactive || !options.length)) return;
        if (next === open) return;
        typeahead.reset();
        if (next) setPending(value);
        if (openProp === undefined) setOwnOpen(next);
        onOpenChange?.(next);
    };

    // a disabled or read-only select closes
    useEffect(() => {
        if (!interactive && (openProp ?? ownOpen) && openProp === undefined) setOwnOpen(false);
    }, [interactive, openProp, ownOpen]);

    /** Applies a value chosen by the user. */
    const commit = (next: T | null | undefined) => {
        const nextValue = next ?? null;
        if (compare(nextValue, value)) return;
        if (valueProp === undefined) setOwnValue(nextValue);
        onValueChange?.(nextValue);
    };

    const focusControl = () => control.current?.focus();

    /* -------------------------------- closed: the keys change the value directly -------------------------------- */

    const onControlKeyDown = (event: KeyboardEvent<HTMLElement> & { preventBaseUIHandler?: () => void }) => {
        if (event.key === 'Tab') return;
        // the keys of the closed list are ours; Base UI's would open the list on the arrow keys
        event.preventBaseUIHandler?.();
        if (!interactive || open) return;
        const disabledList = options.map((o) => o.disabled);
        const choose = (index: number) => {
            if (index >= 0) commit(options[index]!.value);
        };
        if (isOpenKey(event, typeahead.isTyping())) {
            event.preventDefault();
            setOpen(true);
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            choose(event.key === 'Home' ? step(disabledList, -1, 1) : step(disabledList, disabledList.length, -1));
        } else if (
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)
        ) {
            event.preventDefault();
            const forward = event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
            const from = selectedIndex < 0 ? (forward ? -1 : options.length) : selectedIndex;
            choose(step(disabledList, from, forward ? 1 : -1));
        } else if (isTypeaheadKey(event)) {
            typeahead.type(event.key, (letters) => {
                choose(
                    matchLabel(
                        options.map((o) => o.label),
                        disabledList,
                        selectedIndex,
                        letters
                    )
                );
            });
        }
    };

    /* ------------------------------------- open (dropdown): Base UI plus ours ------------------------------------- */

    /** The option elements in a list, in order. */
    const optionElements = (root: HTMLElement | null) =>
        root ? [...root.querySelectorAll<HTMLElement>('[role=option]')] : [];

    const onPopupKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
        const all = optionElements(list.current);
        const disabledList = all.map((el) => el.getAttribute('aria-disabled') === 'true');
        const current = all.findIndex((el) => el === document.activeElement || el.contains(document.activeElement));
        const focusAt = (index: number) => {
            if (index >= 0) all[index]!.focus();
        };
        if (isCloseKey(event) && event.key !== 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
            focusControl();
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            event.stopPropagation();
            focusAt(event.key === 'Home' ? step(disabledList, -1, 1) : step(disabledList, all.length, -1));
        } else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !event.altKey) {
            // the Angular CDK skips disabled options and does not wrap
            event.preventDefault();
            event.stopPropagation();
            const delta = event.key === 'ArrowDown' ? 1 : -1;
            focusAt(step(disabledList, current < 0 ? (delta > 0 ? -1 : all.length) : current, delta));
        } else if (event.key === 'Tab') {
            if (tabOutStrategy === 'closeAndSelect' && current >= 0 && !disabledList[current]) all[current]!.click();
            tabbing.current = true;
            setOpen(false);
            // the browser moves the focus on from the control
            focusControl();
            tabbing.current = false;
        }
    };

    /* -------------------------------------------- open (mobile dialog) -------------------------------------------- */

    const dialogOptions = () => optionElements(list.current);

    /** The selected option, or else the first enabled one. */
    const initialOption = (root: HTMLElement | null) => {
        const all = optionElements(root).filter((el) => el.getAttribute('aria-disabled') !== 'true');
        return all.find((el) => el.getAttribute('aria-selected') === 'true') ?? all[0];
    };

    /** The listbox of the mobile dialog: highlights the initial option when it mounts. */
    const setDialogList = useCallback((node: HTMLUListElement | null) => {
        list.current = node;
        if (!node) return;
        const first = initialOption(node);
        setActiveId(first?.id ?? null);
        first?.scrollIntoView?.({ block: 'nearest' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // dropdown: Base UI focuses the selected option on open, or else the list; Angular highlights the first option
    useEffect(() => {
        if (mobile || !open) return;
        const frame = requestAnimationFrame(() => {
            const root = list.current;
            const active = document.activeElement;
            if (!root || (active && active.getAttribute('role') === 'option' && root.contains(active))) return;
            initialOption(root)?.focus();
        });
        return () => cancelAnimationFrame(frame);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mobile, open]);

    const setActive = (el: HTMLElement | undefined) => {
        if (!el) return;
        setActiveId(el.id);
        el.scrollIntoView?.({ block: 'nearest' });
    };

    const closeDialog = () => {
        setOpen(false);
        // the dialog gives the focus back to the control
    };
    const cancelMobile = () => {
        setPending(value);
        closeDialog();
    };
    const approveMobile = () => {
        commit(pending);
        closeDialog();
    };
    const chooseInDialog = (next: unknown, id: string) => {
        setActiveId(id);
        if (approveMode) setPending((next ?? null) as T | null);
        else {
            commit(next as T | null | undefined);
            closeDialog();
        }
    };

    const onDialogListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
        const all = dialogOptions();
        const disabledList = all.map((el) => el.getAttribute('aria-disabled') === 'true');
        const current = all.findIndex((el) => el.id === activeId);
        if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            setActive(all[event.key === 'Home' ? step(disabledList, -1, 1) : step(disabledList, all.length, -1)]);
        } else if (isCloseKey(event)) {
            event.preventDefault();
            event.stopPropagation();
            cancelMobile();
        } else if (!typeahead.isTyping() && (event.key === 'Enter' || event.key === ' ') && current >= 0) {
            event.preventDefault();
            all[current]!.click();
        } else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !event.altKey) {
            event.preventDefault();
            const delta = event.key === 'ArrowDown' ? 1 : -1;
            setActive(all[step(disabledList, current < 0 ? (delta > 0 ? -1 : all.length) : current, delta)]);
        } else if (isTypeaheadKey(event)) {
            typeahead.type(event.key, (letters) => {
                const labels = all.map((el) => el.dataset['valueLabel'] ?? el.textContent ?? '');
                setActive(all[matchLabel(labels, disabledList, current, letters)]);
            });
        }
    };

    /* ----------------------------------------------------- view ----------------------------------------------------- */

    const messageType = stateValue !== 'default' ? MESSAGE_TYPE[stateValue] : null;
    const isSelected = (optionValue: unknown) =>
        compare(optionValue as T, approveMode && open ? pending : value) && optionValue != null;
    const context: SelectContextValue = {
        mode: mobile ? 'dialog' : 'popup',
        isSelected,
        activeId,
        choose: chooseInDialog
    };

    const controlClass = cn(
        fieldBase,
        // the field shadow is drawn by a frame that the focus does not remove; value states keep theirs
        "[box-shadow:none] focus:[box-shadow:none] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:[box-shadow:var(--sapField_Shadow)] after:content-['']",
        fieldStates[stateValue],
        // the arrow button is as high as the field: the field clips it inside its border, as fundamental-styles
        'group/select my-0 flex cursor-pointer items-center justify-between gap-1 overflow-hidden p-0 compact:my-0 compact:p-0',
        'aria-expanded:outline-none',
        // field button look of the arrow, as in input groups
        // high contrast keeps the lite button backgrounds, as fundamental-styles
        'not-hc:[--sapButton_Lite_Background:transparent] not-hc:[--sapButton_Lite_Hover_Background:transparent] not-hc:[--sapButton_Lite_Active_Background:transparent]',
        '[--sapButton_Lite_BorderColor:transparent] [--sapButton_Lite_Hover_BorderColor:transparent] [--sapButton_Lite_Active_BorderColor:transparent]',
        '[--sapButton_Lite_TextColor:var(--sapField_TextColor)] [--sapButton_Lite_Hover_TextColor:var(--sapField_TextColor)]',
        '[--sapButton_BorderCornerRadius:var(--sapField_BorderCornerRadius)]',
        readOnly && 'cursor-text',
        disabled && 'pointer-events-none opacity-(--sapContent_DisabledOpacity)',
        controlClassName
    );

    const textClass = cn(
        'm-0 box-border inline-block min-w-11 truncate ps-2.5 pe-0 text-sap-text-color compact:min-w-8 compact:ps-2',
        !selected && 'font-normal text-sap-field-placeholder-text-color italic',
        // value state backgrounds in high contrast need the full text colour
        !selected && stateValue !== 'default' && 'hc:text-sap-field-text-color',
        readOnly && 'pe-2.5',
        !selected && (readOnly || disabled) && 'invisible',
        textClassName
    );

    const buttonClass = cn(
        buttonVariants({ variant: 'transparent' }),
        'shrink-0 rounded-sap-field-border-corner-radius border-0 text-sap-font-size',
        'hover:[box-shadow:var(--sapField_Hover_Shadow)]',
        stateValue === 'success' &&
            'hover:[box-shadow:var(--sapContent_Positive_Shadow)] group-focus/select:text-sap-button-accept-selected-text-color group-focus/select:[box-shadow:var(--sapContent_Positive_Shadow)]',
        stateValue === 'error' &&
            'hover:[box-shadow:var(--sapContent_Negative_Shadow)] group-focus/select:text-sap-button-reject-selected-text-color group-focus/select:[box-shadow:var(--sapContent_Negative_Shadow)]',
        stateValue === 'warning' &&
            'hover:[box-shadow:var(--sapContent_Critical_Shadow)] group-focus/select:text-sap-button-attention-selected-text-color group-focus/select:[box-shadow:var(--sapContent_Critical_Shadow)]',
        stateValue === 'information' &&
            'hover:[box-shadow:var(--sapContent_Informative_Shadow)] group-focus/select:text-sap-button-selected-text-color group-focus/select:[box-shadow:var(--sapContent_Informative_Shadow)]',
        buttonClassName
    );

    const listClass = cn(
        // no background of its own: the options and the popup draw it, as fundamental-styles
        'm-0 box-border block w-full min-w-20 list-none p-0 outline-none',
        !mobile && 'rounded-[inherit]',
        listClassName
    );

    const message = stateMessage ? (
        <ListMessage
            render={<div />}
            id={messageId}
            type={messageType}
            className={
                textOverflow === 'full'
                    ? 'static block h-auto min-h-8 rounded-t-[inherit] py-2 leading-normal whitespace-normal'
                    : 'sticky top-0 z-[2] block rounded-t-[inherit]'
            }
        >
            {stateMessage}
        </ListMessage>
    ) : null;

    const listLabel = {
        'aria-label': ariaLabelledBy ? undefined : ariaLabel,
        'aria-labelledby': ariaLabelledBy,
        'aria-describedby': stateMessage ? messageId : undefined
    };

    const fill =
        fillControlMode === 'equal'
            ? 'w-(--anchor-width)'
            : fillControlMode === 'at-least'
              ? 'min-w-[min(var(--anchor-width),37.5rem)] max-w-[37.5rem]'
              : 'max-w-[37.5rem]';

    const { className: popupClassName, style: popupStyle, ...popupRest } = popoverProps ?? {};

    const onRootBlur = (event: FocusEvent<HTMLDivElement>) => {
        const next = event.relatedTarget as Node | null;
        // fundamental-react: called when the field loses the focus and the list is closed
        if (next && [event.currentTarget, popup.current, dialogWindow.current].some((el) => el?.contains(next))) return;
        if (open) return;
        onBlur?.(event);
    };

    return (
        <div
            {...props}
            onBlur={onRootBlur}
            className={cn(
                'm-0 my-1 box-border max-w-full compact:my-[0.1875rem]',
                inline ? 'inline-block w-fit align-middle' : 'block',
                className
            )}
        >
            <SelectContext value={context}>
                <BaseSelect.Root<T | null>
                    id={controlId}
                    value={value}
                    onValueChange={(next) => commit(next)}
                    open={!mobile && open}
                    onOpenChange={(next, details) => {
                        if (mobile) {
                            if (next) setOpen(true);
                            return;
                        }
                        if (
                            !next &&
                            !closeOnOutsideClick &&
                            // a release outside after pressing the control (cancel-open) is an outside click too
                            (details.reason === 'outside-press' ||
                                details.reason === 'cancel-open' ||
                                (details.reason === 'focus-out' && !tabbing.current))
                        ) {
                            details.cancel();
                            return;
                        }
                        setOpen(next);
                    }}
                    modal={false}
                    highlightItemOnHover={false}
                    isItemEqualToValue={(item, current) => compare(item, current)}
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    name={name}
                    form={form}
                >
                    <BaseSelect.Trigger
                        nativeButton={false}
                        render={<div />}
                        ref={setControl as unknown as Ref<HTMLButtonElement>}
                        id={controlId}
                        tabIndex={disabled ? -1 : tabIndex}
                        aria-label={ariaLabel}
                        aria-labelledby={ariaLabelledBy}
                        aria-describedby={ariaDescribedBy}
                        aria-disabled={disabled || undefined}
                        aria-invalid={stateValue === 'error' || undefined}
                        {...(mobile ? { 'aria-expanded': open, 'aria-controls': open ? listId : undefined } : {})}
                        title={triggerText || undefined}
                        data-placeholder={selected ? undefined : ''}
                        className={controlClass}
                        onKeyDown={onControlKeyDown}
                        onKeyUp={(event) => {
                            // Space opens on keydown (ours); the keyup of a Space that chose an option must not reopen
                            if (event.key === ' ') event.preventBaseUIHandler();
                        }}
                    >
                        <span className={textClass}>
                            {renderValue ? renderValue(triggerText, selected) : triggerText}
                        </span>
                        {!readOnly && (
                            <span aria-hidden="true" className={buttonClass}>
                                <Icon glyph={glyph} font={glyphFont} />
                            </span>
                        )}
                    </BaseSelect.Trigger>

                    {!mobile && (
                        <BaseSelect.Portal container={container}>
                            <BaseSelect.Positioner
                                side="bottom"
                                align="start"
                                alignItemWithTrigger={false}
                                className="z-[1000]"
                            >
                                <BaseSelect.Popup
                                    {...popupRest}
                                    ref={popup}
                                    className={cn(
                                        popoverSurfaceVariants({ arrow: false }),
                                        fill,
                                        'flex-col overflow-hidden',
                                        popupClassName
                                    )}
                                    style={popupStyle}
                                    onKeyDownCapture={onPopupKeyDownCapture}
                                >
                                    <div
                                        className="relative w-full max-w-full overflow-auto rounded-[inherit] scrollbar-sap"
                                        style={{ maxHeight: maxHeight || '45vh' } satisfies CSSProperties}
                                    >
                                        {message}
                                        <BaseSelect.List
                                            render={<ul />}
                                            ref={list as unknown as Ref<HTMLDivElement>}
                                            id={listId}
                                            {...listLabel}
                                            className={listClass}
                                        >
                                            {children}
                                        </BaseSelect.List>
                                    </div>
                                </BaseSelect.Popup>
                            </BaseSelect.Positioner>
                        </BaseSelect.Portal>
                    )}
                </BaseSelect.Root>

                {mobile && (
                    <Dialog
                        open={open}
                        onOpenChange={(next) => {
                            if (!next) cancelMobile();
                        }}
                        escKeyCloseable={false}
                        backdropClickCloseable={false}
                    >
                        <DialogPopup
                            ref={dialogWindow}
                            mobile
                            disablePaddings
                            initialFocus={list}
                            aria-labelledby={mobileConfig.title ? dialogTitleId : ariaLabelledBy}
                            aria-label={mobileConfig.title || ariaLabelledBy ? undefined : ariaLabel}
                        >
                            {(mobileConfig.title || mobileConfig.hasCloseButton !== false) && (
                                <DialogHeader>
                                    {mobileConfig.title && (
                                        <DialogTitle id={dialogTitleId}>{mobileConfig.title}</DialogTitle>
                                    )}
                                    {mobileConfig.hasCloseButton !== false && (
                                        <DialogCloseButton mobile aria-label={closeLabel} />
                                    )}
                                </DialogHeader>
                            )}
                            <DialogBody disablePaddings>
                                {message}
                                <ul
                                    ref={setDialogList}
                                    id={listId}
                                    role="listbox"
                                    tabIndex={0}
                                    {...listLabel}
                                    aria-activedescendant={activeId ?? undefined}
                                    className={listClass}
                                    onKeyDown={onDialogListKeyDown}
                                >
                                    {children}
                                </ul>
                            </DialogBody>
                            {(mobileConfig.approveButtonText || mobileConfig.cancelButtonText) && (
                                <DialogFooter>
                                    {mobileConfig.approveButtonText && (
                                        <ButtonBar
                                            variant="emphasized"
                                            label={mobileConfig.approveButtonText}
                                            onClick={approveMobile}
                                        />
                                    )}
                                    {mobileConfig.cancelButtonText && (
                                        <ButtonBar label={mobileConfig.cancelButtonText} onClick={cancelMobile} />
                                    )}
                                </DialogFooter>
                            )}
                        </DialogPopup>
                    </Dialog>
                )}
            </SelectContext>
        </div>
    );
}
