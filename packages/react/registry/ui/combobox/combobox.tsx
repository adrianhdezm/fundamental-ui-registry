/*
 * Port of fundamental-react (ComboboxInput) and @fundamental-ngx/core (combobox) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import {
    Children,
    cloneElement,
    isValidElement,
    useCallback,
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useReducer,
    useRef,
    type ComponentProps,
    type CSSProperties,
    type FocusEvent as ReactFocusEvent,
    type InputEvent as ReactInputEvent,
    type KeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    type ReactElement,
    type ReactNode,
    type Ref,
    type SyntheticEvent
} from 'react';
import { cn } from '@/lib/utils';
import { BarElement, BarMiddle, ButtonBar } from '@/ui/bar/bar';
import { Button, type ButtonProps } from '@/ui/button/button';
import {
    Dialog,
    DialogBody,
    DialogCloseButton,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogSubheader,
    DialogTitle
} from '@/ui/dialog/dialog';
import { FormInputMessageGroup } from '@/ui/form/form-input-message-group';
import { FormMessage } from '@/ui/form/form-message';
import { type IconFont } from '@/ui/icon/icon';
import { type FormState } from '@/ui/input/input';
import { InputGroup, InputGroupAddon, InputGroupInput, type InputGroupProps } from '@/ui/input-group/input-group';
import { LIST_DROPDOWN_ITEM, ListGroupHeader, ListMessage, ListTitle } from '@/ui/list/list';
import { popoverSurfaceVariants } from '@/ui/popover/popover';

/** Groups the values of a combobox under headers: `{ header: values }`. */
export type ComboboxGroupFunction<T = unknown> = (items: T[]) => Record<string, T[]>;

/** A chosen item and its index in `dropdownValues`. */
export interface ComboboxItem<T = unknown> {
    item: T;
    index: number;
}

/** What `renderItem` gets besides the item. */
export interface ComboboxItemContext {
    /** The text in the input, to highlight it in the item. */
    inputText: string;
}

/** Dialog options of a combobox in mobile mode. */
export interface ComboboxMobileConfig {
    title?: string;
    /** Shows a close button in the header (default true). */
    hasCloseButton?: boolean;
    /** With an approve button the choice is applied only when it is pressed. */
    approveButtonText?: string;
    cancelButtonText?: string;
    /** Text above the list. */
    instruction?: string;
}

/** Imperative actions of a combobox, through `actionsRef`. */
export interface ComboboxActions {
    open(): void;
    close(): void;
}

export interface ComboboxProps<T = unknown> extends Omit<
    ComponentProps<'div'>,
    'defaultValue' | 'onChange' | 'onSelect' | 'children' | 'placeholder' | 'title'
> {
    /** List messages (`ListMessage`) shown at the top of the list. */
    children?: ReactNode;
    /** Id of the input, for `<label htmlFor>`. */
    inputId?: string;
    placeholder?: string;
    /** Tooltip of the input and the dropdown button. */
    title?: string;
    /** The values to suggest. */
    dropdownValues?: readonly T[] | null;
    /** Text of a value. */
    displayFn?: (value: T | null | undefined) => string;
    /** Filters the values by the search text; by default by the start (or with `includes` any part) of the text. */
    filterFn?: ((values: T[], searchTerm: string) => T[]) | null;
    /** Matches the search text anywhere in the values instead of at the start. */
    includes?: boolean;
    /** Shows the values that do not match after the matching ones. */
    showAllEntries?: boolean;
    groupFn?: ComboboxGroupFunction<T> | null;
    /** Content of an item; you are responsible for highlighting the search text in it. */
    renderItem?: ((item: T, context: ComboboxItemContext) => ReactNode) | null;
    /** Bold search text in the items. */
    highlighting?: boolean;
    /** Completes the typed text with the first matching value. */
    autoComplete?: boolean;
    /** Values are the items (or their `valueProperty`) instead of their text. */
    communicateByObject?: boolean;
    valueProperty?: string | null;
    /** The value, for a controlled combobox: the text, or with `communicateByObject` the item (or its property). */
    value?: unknown;
    /** The initial value, for an uncontrolled combobox. */
    defaultValue?: unknown;
    /** Called when the user changes the value (not when `value` changes). */
    onValueChange?: (value: unknown) => void;
    /** Called when the text in the input changes. */
    onInputValueChange?: (text: string) => void;
    /** Called when the list (or the mobile dialog) opens or closes. */
    onOpenChange?: (open: boolean) => void;
    /** Called when an item is chosen (also while stepping through the values with the arrow keys). */
    onItemSelect?: (selected: ComboboxItem<T>) => void;
    /** Called with the text on Enter and on the dropdown or search button. */
    onSearch?: (text: string) => void;
    state?: FormState | null;
    /** Text of the value state: under the field while it has the focus, and at the top of the open list. */
    stateMessage?: ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    /** A search field: a search button and a clear button. */
    isSearch?: boolean;
    showClearButton?: boolean;
    /** Accessible name and tooltip of the clear button. */
    clearButtonTitle?: string;
    showDropdownButton?: boolean;
    glyph?: string;
    glyphFont?: IconFont;
    /** Accessible name of the dropdown button. */
    glyphAriaLabel?: string;
    /** The dropdown button is in the tab order; otherwise clicks on it keep the focus in the input. */
    buttonFocusable?: boolean;
    clearButtonFocusable?: boolean;
    closeOnSelect?: boolean;
    /** Choosing an item puts its text in the input. */
    fillOnSelect?: boolean;
    /** Typing opens the list. */
    openOnKeyboardEvent?: boolean;
    closeOnOutsideClick?: boolean;
    /** Maximum height of the list. */
    maxHeight?: string;
    /** Maximum width of the list in pixels (default 640). */
    dropdownMaxWidth?: number;
    noDropdownMaxWidth?: boolean;
    /** List width relative to the field: `at-least` as wide, `equal` exactly as wide, `fit-content` its content. */
    fillControlMode?: 'at-least' | 'equal' | 'fit-content' | null;
    /** Width of the combobox, e.g. `"300px"`. */
    width?: string | null;
    /** Shown in the open list when no value matches; without it the list closes. */
    noMatchesText?: ReactNode;
    /** Two-line items (use `ListContent`, `ListTitle` and `ListByline` in `renderItem`). */
    byline?: boolean;
    /** `closeAndSelect` completes the text with the highlighted or completed value when Tab leaves. */
    tabOutStrategy?: 'close' | 'closeAndSelect';
    /** Opens the list in a full-screen dialog. */
    mobile?: boolean;
    mobileConfig?: ComboboxMobileConfig;
    /** Accessible name of the close button of the mobile dialog. */
    closeLabel?: string;
    /** Announced count of the suggestions; `{count}` is replaced. */
    resultsLabel?: string;
    /** Element the list is rendered into (default `document.body`). */
    container?: BaseCombobox.Portal.Props['container'];
    /** Props of the input. */
    inputProps?: Omit<ComponentProps<'input'>, 'value' | 'defaultValue' | 'disabled' | 'readOnly'>;
    /** Ref of the input on the page. */
    inputRef?: Ref<HTMLInputElement>;
    /** Props of the input group around the input and the buttons. */
    inputGroupProps?: Omit<InputGroupProps, 'children' | 'state' | 'disabled' | 'readOnly'>;
    /** Props of the dropdown button. */
    buttonProps?: Omit<ButtonProps, 'onClick' | 'glyph' | 'glyphFont'>;
    /** Props of the popup around the list. */
    popoverProps?: Omit<BaseCombobox.Popup.Props, 'children' | 'render' | 'className' | 'style'> & {
        className?: string;
        style?: CSSProperties;
    };
    /** Imperative `open()` and `close()`. */
    actionsRef?: Ref<ComboboxActions>;
}

interface DisplayedGroup<T> {
    key: string | null;
    items: { item: T; index: number }[];
}

interface ComboboxState {
    /** Whether the list (or the mobile dialog) is open. */
    isOpen: boolean;
    /** The text: what was typed or chosen. */
    inputText: string;
    /** What the input shows: the text, or the text with its inline completion. */
    fieldText: string;
    /** The text that filters the list; it changes only while typing. */
    searchTerm: string;
    modelValue: unknown;
    activeIndex: number;
    focused: boolean;
    /** Ids of the `<label>`s of the input. */
    labelIds: string;
}

interface Confirmed {
    text: string;
    value: unknown;
}

const defaultDisplay = (value: unknown) => (value == null ? '' : `${value}`);

/** Stops Base UI's own handler of the event (its list navigation, Enter and Escape). */
function preventBaseUI(event: SyntheticEvent) {
    (event as SyntheticEvent & { preventBaseUIHandler?: () => void }).preventBaseUIHandler?.();
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
}

/**
 * Combobox: an input that suggests values from a list while typing, on Base UI's Combobox. It filters the list,
 * completes the text inline and bolds the search text. The focus stays in the input: Down and Up highlight items
 * (and fill the input), Enter chooses, Escape closes, Alt+Down opens the whole list and Alt+Up closes it. While
 * closed, Down and Up step through the values. In mobile mode the list opens in a full-screen dialog.
 *
 * The value is the text, or with `communicateByObject` the matching item (or its `valueProperty`). Native props,
 * `className` and `ref` go to the root `<div>`; `aria-label` and `aria-labelledby` go to the input and the list.
 * Compact density is `data-density="compact"` on the combobox or an ancestor.
 *
 * ```tsx
 * <FormLabel htmlFor="fruit">Fruit</FormLabel>
 * <Combobox inputId="fruit" placeholder="Type a fruit" dropdownValues={fruits} value={fruit} onValueChange={setFruit} />
 * ```
 */
export function Combobox<T = unknown>({
    children,
    inputId: inputIdProp,
    placeholder,
    title,
    dropdownValues,
    displayFn = defaultDisplay,
    filterFn,
    includes = false,
    showAllEntries = false,
    groupFn,
    renderItem,
    highlighting = true,
    autoComplete = true,
    communicateByObject = false,
    valueProperty = null,
    value: valueProp,
    defaultValue,
    onValueChange,
    onInputValueChange,
    onOpenChange,
    onItemSelect,
    onSearch,
    state,
    stateMessage,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    isSearch = false,
    showClearButton = false,
    clearButtonTitle = 'Clear',
    showDropdownButton = true,
    glyph = 'navigation-down-arrow',
    glyphFont = 'SAP-icons',
    glyphAriaLabel = 'Show values',
    buttonFocusable = false,
    clearButtonFocusable = true,
    closeOnSelect = true,
    fillOnSelect = true,
    openOnKeyboardEvent = true,
    closeOnOutsideClick = true,
    maxHeight = '50vh',
    dropdownMaxWidth = 640,
    noDropdownMaxWidth = false,
    fillControlMode = 'at-least',
    width,
    noMatchesText,
    byline = false,
    tabOutStrategy = 'closeAndSelect',
    mobile = false,
    mobileConfig = { hasCloseButton: true },
    closeLabel = 'Close',
    resultsLabel = '{count} result list items',
    container,
    inputProps,
    inputRef,
    inputGroupProps,
    buttonProps,
    popoverProps,
    actionsRef,
    className,
    style,
    ref,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...props
}: ComboboxProps<T>) {
    const autoId = useId();
    const comboboxId = `fd-combobox-${autoId}`;
    const listId = `${comboboxId}-result`;
    const resultsId = `${comboboxId}-list-results`;
    const dialogTitleId = `${comboboxId}-dialog-title`;
    const dialogInputId = `${comboboxId}-dialog-input`;
    const optionId = (index: number) => `${comboboxId}-option-${index}`;
    const groupId = (index: number) => `${comboboxId}-group-${index}`;

    const values = (dropdownValues ?? []) as T[];
    const display = (item: T | null | undefined) => displayFn(item);
    const toValue = (item: T): unknown =>
        valueProperty && item != null && typeof item === 'object'
            ? (item as Record<string, unknown>)[valueProperty]
            : item;
    const stateValue = state ?? 'default';
    const approveMode = mobile && !!mobileConfig.approveButtonText?.trim();
    const hasMessage = !!stateMessage && stateValue !== 'default';

    /** What a written value shows and stands for (Angular's `writeValue`). */
    const resolve = (value: unknown): Confirmed => {
        let item: unknown = value;
        if (communicateByObject && valueProperty && value != null) {
            item = values.find((v) => v != null && (v as Record<string, unknown>)[valueProperty] === value) ?? value;
        }
        const text = value == null ? '' : display(item as T);
        return { text, value: communicateByObject ? (value ?? null) : text };
    };

    // the state, read and written synchronously by the handlers (as Angular's signals) and rendered from
    const [, rerender] = useReducer((n: number) => n + 1, 0);
    const st = useRef<ComboboxState>(null as unknown as ComboboxState);
    const confirmed = useRef<Confirmed | null>(null);
    if (st.current === null) {
        const initial = valueProp !== undefined ? valueProp : defaultValue;
        const written = initial === undefined ? null : resolve(initial);
        confirmed.current = written;
        st.current = {
            isOpen: false,
            inputText: written?.text ?? '',
            fieldText: written?.text ?? '',
            searchTerm: '',
            modelValue: written ? written.value : null,
            activeIndex: -1,
            focused: false,
            labelIds: ''
        };
    }
    const s = st.current;
    const update = (patch: Partial<ComboboxState>) => {
        Object.assign(st.current, patch);
        rerender();
    };
    /** The draft of the mobile dialog, restored by Cancel. */
    const snapshot = useRef<{ text: string; value: unknown; confirmed: Confirmed | null } | null>(null);
    /** A text selection to set after the next render (the inline completion). */
    const pendingSelection = useRef<[number, number] | null>(null);

    const field = useRef<HTMLInputElement | null>(null);
    const dialogField = useRef<HTMLInputElement | null>(null);
    const rootEl = useRef<HTMLDivElement | null>(null);
    const popupEl = useRef<HTMLDivElement | null>(null);

    // the values that match the search text, grouped
    const term = s.searchTerm;
    let displayed: T[] = values;
    if (term) {
        if (filterFn) displayed = filterFn(values, term);
        else {
            const lower = term.toLocaleLowerCase();
            displayed = values.filter((item) => {
                if (item == null) return false;
                const text = display(item).toLocaleLowerCase();
                return includes ? text.includes(lower) : text.startsWith(lower);
            });
        }
        if (showAllEntries) displayed = [...displayed, ...values.filter((item) => !displayed.includes(item))];
    }
    let counter = 0;
    const groups: DisplayedGroup<T>[] = groupFn
        ? Object.entries(groupFn(displayed)).map(([key, items]) => ({
              key,
              items: items.map((item) => ({ item, index: counter++ }))
          }))
        : [{ key: null, items: displayed.map((item) => ({ item, index: counter++ })) }];
    const flat = groups.flatMap((group) => group.items.map((entry) => entry.item));
    const matchCount = displayed.length;
    const listShown = !mobile && s.isOpen && (matchCount > 0 || noMatchesText != null);
    const activeId = s.activeIndex >= 0 ? optionId(s.activeIndex) : undefined;
    const resultsText = s.isOpen ? resultsLabel.replace('{count}', `${matchCount}`) : '';

    const isSelected = (item: T) =>
        communicateByObject ? toValue(item) === s.modelValue : display(item) === s.inputText;

    /* ---------------------------------------------------------------- the behaviour of the Angular combobox */

    const propagate = () => onValueChange?.(st.current.modelValue);
    const confirm = () => {
        confirmed.current = { text: st.current.inputText, value: st.current.modelValue };
    };
    const pageField = () => field.current;
    const activeField = () => (mobile && st.current.isOpen ? dialogField.current : field.current);

    const open = () => {
        if (disabled || readOnly || st.current.isOpen) return;
        update({ isOpen: true });
        onOpenChange?.(true);
        if (mobile) {
            snapshot.current = {
                text: st.current.inputText,
                value: st.current.modelValue,
                confirmed: confirmed.current
            };
            update({ searchTerm: '' });
        }
    };

    const close = () => {
        if (!st.current.isOpen) return;
        update({ isOpen: false, activeIndex: -1 });
        onOpenChange?.(false);
    };

    const writeValue = (value: unknown) => {
        const written = resolve(value);
        update({ inputText: written.text, fieldText: written.text, searchTerm: '', modelValue: written.value });
        confirmed.current = written;
        // a value written while a mobile draft is open is what Cancel goes back to
        if (snapshot.current) snapshot.current = { text: written.text, value: written.value, confirmed: written };
    };

    const setText = (text: string) => {
        update({ inputText: text });
        onInputValueChange?.(text);
        if (communicateByObject) {
            const matches = values.filter((item) => item != null && display(item) === text);
            if (matches.length === 1) update({ modelValue: toValue(matches[0]!) });
            else if (matches.length === 0) update({ modelValue: null });
        } else {
            update({ modelValue: text });
        }
        if (!approveMode || !st.current.isOpen) propagate();
    };

    /** Chooses an item: fills the input, updates the value and closes the list. */
    const choose = (item: T, close_: boolean) => {
        const index = values.indexOf(item);
        if (fillOnSelect) {
            const text = display(item);
            update({
                inputText: text,
                fieldText: text,
                modelValue: communicateByObject ? toValue(item) : text
            });
            onInputValueChange?.(text);
            if (!approveMode) {
                confirm();
                propagate();
            }
        }
        onItemSelect?.({ item, index });
        if (close_ && closeOnSelect && !approveMode) {
            update({ searchTerm: '' });
            close();
            pageField()?.focus();
        }
    };

    /** Down and Up in a closed combobox step through the values. */
    const chooseOther = (offset: number) => {
        const current = values.findIndex((item) => item != null && display(item) === st.current.inputText);
        const next = values[current + offset];
        if (next !== undefined && (current >= 0 || offset > 0)) choose(next, false);
    };

    /** Highlights the next or previous item and fills the input with it. */
    const moveActive = (offset: number) => {
        if (!flat.length) return;
        const next = st.current.activeIndex + offset;
        if (next < 0) {
            update({ activeIndex: -1 });
            return;
        }
        const index = Math.min(next, flat.length - 1);
        update({ activeIndex: index });
        choose(flat[index]!, false);
    };

    /** Takes over an inline completion as the text. */
    const acceptCompletion = (input: HTMLInputElement | null) => {
        const text = st.current.fieldText;
        const match = values.filter((item) => item != null && display(item) === text);
        if (text !== st.current.inputText) {
            input?.setSelectionRange(text.length, text.length);
            setText(text);
            if (match.length === 1) update({ searchTerm: text });
        }
        // a text that names one value is a choice
        if (match.length === 1 && !(approveMode && st.current.isOpen)) confirm();
    };

    /** The one value named by the input text, or by the text with its inline completion. */
    const completedCandidate = (input: HTMLInputElement | null): T | undefined => {
        const value = st.current.fieldText;
        const text = st.current.inputText;
        const completing =
            value !== text && input?.selectionStart === text.length && input?.selectionEnd === value.length;
        if (value !== text && !completing) return undefined;
        const matches = values.filter((item) => item != null && display(item) === value);
        return matches.length === 1 ? matches[0] : undefined;
    };

    /** Puts the last choice back in the input and the value. */
    const revert = () => {
        const text = confirmed.current?.text ?? '';
        update({ fieldText: text });
        if (text === st.current.inputText && st.current.modelValue === (confirmed.current?.value ?? null)) return;
        update({
            inputText: text,
            searchTerm: '',
            modelValue: confirmed.current ? confirmed.current.value : communicateByObject ? null : ''
        });
        onInputValueChange?.(text);
        propagate();
    };

    /**
     * Leaving the field with Tab or an outside click: a unique inline completion is taken over; otherwise free text
     * stays in text mode with `closeAndSelect` and without `autoComplete`, and any other text that is not the last
     * choice reverts to it.
     */
    const leave = () => {
        const input = pageField();
        const closeAndSelect = tabOutStrategy === 'closeAndSelect';
        if (closeAndSelect && completedCandidate(input) !== undefined) {
            acceptCompletion(input);
        } else if (closeAndSelect && !communicateByObject) {
            update({ fieldText: st.current.inputText });
        } else if (!autoComplete) {
            confirm();
        } else {
            revert();
            const active = flat[st.current.activeIndex];
            if (closeAndSelect && active !== undefined && !st.current.inputText) choose(active, false);
        }
        close();
    };

    const onInput = (event: ReactInputEvent<HTMLInputElement>) => {
        const typed = event.currentTarget.value;
        const native = event.nativeEvent as InputEvent;
        update({ fieldText: typed });
        setText(typed);
        update({ searchTerm: typed, activeIndex: -1 });
        if (openOnKeyboardEvent && typed) open();
        // complete the text inline with the first value that starts with it
        if (autoComplete && typed && native.inputType?.startsWith('insert') && !native.isComposing) {
            const match = values.find(
                (item) => item != null && display(item).toLocaleLowerCase().startsWith(typed.toLocaleLowerCase())
            );
            if (match !== undefined) {
                const text = display(match);
                update({ fieldText: text });
                pendingSelection.current = [typed.length, text.length];
            }
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLElement>, dialog: boolean) => {
        if (readOnly || disabled) return;
        const key = event.key;
        const input = dialog ? dialogField.current : pageField();
        if (mobile && !dialog) {
            if (key === 'Enter' || key === ' ' || (event.altKey && key === 'ArrowDown') || key.length === 1) {
                event.preventDefault();
                open();
            }
            return;
        }
        const shown = dialog || listShown;
        if (key === 'Tab') {
            if (st.current.isOpen && !dialog) leave();
            return;
        }
        if (key === 'Enter') {
            preventBaseUI(event);
            const active = flat[st.current.activeIndex];
            if (shown && st.current.activeIndex >= 0 && active !== undefined) {
                event.preventDefault();
                choose(active, true);
                return;
            }
            acceptCompletion(input);
            onSearch?.(st.current.inputText);
            if (!dialog) close();
            return;
        }
        if (key === 'Escape') {
            // Base UI's Escape would clear the value, and closing a dialog around the combobox is left to it
            preventBaseUI(event);
            if (st.current.isOpen && !dialog) {
                // closes only the list, not a dialog around the combobox
                event.preventDefault();
                event.stopPropagation();
                update({ fieldText: st.current.inputText });
                close();
            }
            return;
        }
        if (
            key === 'ArrowRight' &&
            input &&
            input.selectionStart !== input.selectionEnd &&
            input.selectionEnd === input.value.length
        ) {
            acceptCompletion(input);
            return;
        }
        if (key === 'ArrowDown' || key === 'ArrowUp') {
            preventBaseUI(event);
            event.preventDefault();
            const down = key === 'ArrowDown';
            if (event.altKey && !dialog) {
                if (down) {
                    update({ searchTerm: '' });
                    open();
                } else close();
                return;
            }
            if (shown) moveActive(down ? 1 : -1);
            else chooseOther(down ? 1 : -1);
        }
    };

    const onBlur = () => {
        if (st.current.isOpen) return;
        acceptCompletion(pageField());
    };

    const onPrimaryButtonClick = () => {
        if (mobile) {
            open();
            return;
        }
        onSearch?.(st.current.inputText);
        update({ searchTerm: '' });
        if (st.current.isOpen) close();
        else open();
        pageField()?.focus();
    };

    const clear = (dialog: boolean) => {
        update({ fieldText: '', searchTerm: '', activeIndex: -1 });
        setText('');
        (dialog ? dialogField.current : pageField())?.focus();
    };

    const dialogApprove = () => {
        snapshot.current = null;
        confirm();
        propagate();
        close();
    };

    const dialogDismiss = () => {
        const draft = snapshot.current;
        snapshot.current = null;
        // in immediate mode the choices are already applied: only an approve draft is discarded
        if (draft && approveMode) {
            update({ inputText: draft.text, fieldText: draft.text, modelValue: draft.value });
            confirmed.current = draft.confirmed;
        }
        close();
    };

    /* ---------------------------------------------------------------- sync with props and the DOM */

    // a controlled value written from outside (not the echo of our own change)
    const lastValueProp = useRef(valueProp);
    useLayoutEffect(() => {
        const previous = lastValueProp.current;
        lastValueProp.current = valueProp;
        if (valueProp === undefined || Object.is(valueProp, previous)) return;
        if (Object.is(valueProp, st.current.modelValue)) return;
        writeValue(valueProp);
    });

    useEffect(() => {
        if (disabled) close();
    });

    // the selection of an inline completion, once the input shows it
    useLayoutEffect(() => {
        const selection = pendingSelection.current;
        const input = activeField();
        if (!selection || !input) return;
        pendingSelection.current = null;
        if (input.value === st.current.fieldText) input.setSelectionRange(selection[0], selection[1]);
    });

    // while the list is open Base UI hides the page outside the input and the list from assistive technology, its
    // <label> too: the input and the list refer to the labels, so they keep their name
    useLayoutEffect(() => {
        const ids = [...(field.current?.labels ?? [])]
            .map((label) => label.id)
            .filter(Boolean)
            .join(' ');
        if (ids !== st.current.labelIds) update({ labelIds: ids });
    });
    const labelledBy = ariaLabelledBy || (ariaLabel ? undefined : s.labelIds || undefined);

    // keep the highlighted item visible
    useEffect(() => {
        if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' });
    }, [activeId]);

    // an outside click leaves the field like Tab: invalid text reverts to the last choice
    const latest = useRef({ leave, mobile, closeOnOutsideClick, disabled, readOnly });
    latest.current = { leave, mobile, closeOnOutsideClick, disabled, readOnly };
    useEffect(() => {
        const onMouseDown = (event: MouseEvent) => {
            const current = latest.current;
            if (current.mobile || !current.closeOnOutsideClick || current.disabled || current.readOnly) return;
            const target = event.target as Node | null;
            if (!target || rootEl.current?.contains(target) || popupEl.current?.contains(target)) return;
            if (!field.current || st.current.inputText === (confirmed.current?.text ?? '')) return;
            current.leave();
        };
        document.addEventListener('mousedown', onMouseDown, true);
        return () => document.removeEventListener('mousedown', onMouseDown, true);
    }, []);

    useImperativeHandle(actionsRef, () => ({ open, close }));

    const setRoot = useCallback(
        (node: HTMLDivElement | null) => {
            rootEl.current = node;
            assignRef(ref, node);
        },
        [ref]
    );
    const {
        onKeyDown: onInputKeyDown,
        onInput: onInputInput,
        onBlur: onInputBlur,
        onFocus: onInputFocus,
        ref: inputPropsRef,
        ...restInputProps
    } = inputProps ?? {};
    const setField = useCallback(
        (node: HTMLInputElement | null) => {
            field.current = node;
            assignRef(inputRef, node);
            assignRef(inputPropsRef, node);
        },
        [inputRef, inputPropsRef]
    );

    /* ---------------------------------------------------------------- rendering */

    const highlight = (item: T): ReactNode => {
        const text = display(item);
        if (!highlighting || !term) return text;
        const at = text.toLocaleLowerCase().indexOf(term.toLocaleLowerCase());
        if (at < 0) return text;
        return (
            <>
                {text.slice(0, at)}
                <b className="font-bold">{text.slice(at, at + term.length)}</b>
                {text.slice(at + term.length)}
            </>
        );
    };

    /** The input group with the input and its buttons, on the page (`dialog` false) or in the mobile dialog. */
    const renderControl = (dialog: boolean) => {
        const page = !dialog;
        const plain = mobile && page;
        const expandedOnPage = plain ? s.isOpen : listShown;
        const inputAttrs = {
            ...(page ? restInputProps : {}),
            id: dialog ? dialogInputId : (inputIdProp ?? `${comboboxId}-input`),
            type: 'text',
            name: page ? name : undefined,
            autoComplete: 'off',
            placeholder,
            title,
            'aria-label': dialog ? ariaLabel || placeholder || undefined : ariaLabel || undefined,
            'aria-labelledby': dialog ? ariaLabelledBy || (mobileConfig.title ? dialogTitleId : undefined) : labelledBy,
            'aria-describedby': resultsId,
            'aria-autocomplete': plain ? undefined : autoComplete ? ('both' as const) : ('list' as const),
            'aria-haspopup': plain ? ('dialog' as const) : ('listbox' as const),
            // the list is in view in the dialog
            'aria-expanded': dialog ? true : expandedOnPage,
            'aria-controls': (dialog || mobile ? s.isOpen : listShown) ? listId : undefined,
            'aria-activedescendant': (dialog ? s.isOpen : listShown) ? activeId : undefined,
            'aria-required': required || undefined,
            'aria-readonly': readOnly || undefined,
            'aria-invalid': stateValue === 'error' || undefined,
            // `input`, not React's `change`: typing over a completion with the same letter changes the text but not
            // the value of the input
            onInput: (event: ReactInputEvent<HTMLInputElement>) => {
                if (page) onInputInput?.(event);
                onInput(event);
            },
            onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                if (page) onInputKeyDown?.(event);
                if (event.defaultPrevented) return;
                onKeyDown(event, dialog);
            },
            onFocus: page
                ? (event: ReactFocusEvent<HTMLInputElement>) => {
                      onInputFocus?.(event);
                      update({ focused: true });
                  }
                : undefined,
            onBlur: page
                ? (event: ReactFocusEvent<HTMLInputElement>) => {
                      onInputBlur?.(event);
                      update({ focused: false });
                      onBlur();
                  }
                : undefined
        };
        const input = plain ? (
            <InputGroupInput {...inputAttrs} ref={setField} role="combobox" value={s.fieldText} />
        ) : (
            <InputGroupInput {...inputAttrs} ref={dialog ? dialogField : setField} render={<BaseCombobox.Input />} />
        );
        const buttons = (
            <>
                {(isSearch || showClearButton) && s.inputText && !readOnly && (
                    <InputGroupAddon button>
                        <Button
                            variant="transparent"
                            glyph="decline"
                            aria-label={clearButtonTitle}
                            title={clearButtonTitle}
                            // Base UI hides the page outside the input from assistive technology while the list is open
                            tabIndex={clearButtonFocusable && !listShown ? undefined : -1}
                            disabled={disabled}
                            onClick={() => clear(dialog)}
                        />
                    </InputGroupAddon>
                )}
                {showDropdownButton && !readOnly && !(dialog && !isSearch) && (
                    <InputGroupAddon button>
                        <Button
                            variant="transparent"
                            aria-label={glyphAriaLabel}
                            title={title || glyphAriaLabel}
                            aria-haspopup={mobile ? 'dialog' : 'listbox'}
                            aria-expanded={s.isOpen}
                            {...buttonProps}
                            glyph={isSearch ? 'search' : glyph}
                            glyphFont={isSearch ? 'SAP-icons' : glyphFont}
                            tabIndex={buttonFocusable ? buttonProps?.tabIndex : -1}
                            disabled={disabled}
                            className={cn(
                                listShown && 'text-(--igBtnFocusColor,var(--sapButton_Selected_TextColor))',
                                buttonProps?.className
                            )}
                            onMouseDown={(event) => {
                                buttonProps?.onMouseDown?.(event);
                                if (!buttonFocusable) event.preventDefault();
                            }}
                            onClick={onPrimaryButtonClick}
                        />
                    </InputGroupAddon>
                )}
            </>
        );
        const groupProps = page ? inputGroupProps : undefined;
        if (plain) {
            return (
                <InputGroup
                    {...groupProps}
                    state={stateValue}
                    disabled={disabled}
                    readOnly={readOnly}
                    showFocus
                    onClick={(event) => {
                        groupProps?.onClick?.(event);
                        open();
                    }}
                >
                    {input}
                    {buttons}
                </InputGroup>
            );
        }
        return (
            <BaseCombobox.InputGroup
                render={
                    <InputGroup {...groupProps} state={stateValue} disabled={disabled} readOnly={readOnly} showFocus />
                }
            >
                {input}
                {buttons}
            </BaseCombobox.InputGroup>
        );
    };

    const renderOption = (entry: { item: T; index: number }) => (
        <BaseCombobox.Item
            key={entry.index}
            index={entry.index}
            value={entry.item}
            // our ids, selection and highlight (aria-activedescendant) instead of Base UI's
            render={(itemProps) => (
                <li
                    {...itemProps}
                    id={optionId(entry.index)}
                    aria-selected={isSelected(entry.item)}
                    data-active={entry.index === s.activeIndex ? '' : undefined}
                />
            )}
            className={cn(LIST_DROPDOWN_ITEM, byline && 'py-2')}
            onClick={(event) => {
                // the choice is ours: Base UI's would select and close
                preventBaseUI(event);
                choose(entry.item, true);
            }}
        >
            {renderItem ? (
                renderItem(entry.item, { inputText: s.inputText })
            ) : (
                <span className="min-w-0 flex-auto truncate">{highlight(entry.item)}</span>
            )}
        </BaseCombobox.Item>
    );

    // list messages are presentational in the listbox
    const messages = Children.toArray(children).map((child) =>
        isValidElement<{ role?: string }>(child) && !child.props.role
            ? cloneElement(child as ReactElement<{ role?: string }>, { role: 'presentation' })
            : child
    );

    const renderList = (dialog: boolean) => (
        <BaseCombobox.List
            render={<ul />}
            id={listId}
            aria-label={ariaLabel || undefined}
            aria-labelledby={labelledBy}
            tabIndex={dialog ? 0 : undefined}
            aria-activedescendant={dialog ? activeId : undefined}
            style={{ maxHeight: dialog ? undefined : maxHeight }}
            className={cn(
                'relative m-0 box-border block min-w-20 list-none overflow-auto p-0 outline-none scrollbar-sap',
                dialog ? 'w-full bg-sap-list-background' : 'w-full',
                messages.length > 0 && 'pt-8'
            )}
            onKeyDown={dialog ? (event: KeyboardEvent<HTMLElement>) => onKeyDown(event, true) : undefined}
            onMouseDown={(event: ReactMouseEvent) => event.preventDefault()}
        >
            {hasMessage && !dialog && (
                <ListMessage
                    role="presentation"
                    type={stateValue}
                    aria-hidden="true"
                    // stays above the items while they scroll
                    className="sticky z-[1] block"
                >
                    {stateMessage}
                </ListMessage>
            )}
            {messages}
            {groups.map((group, g) =>
                group.key === null ? (
                    group.items.map(renderOption)
                ) : (
                    <li key={group.key} role="none" className="m-0 list-none p-0">
                        <BaseCombobox.Group render={<ul />} aria-labelledby={groupId(g)} className="m-0 list-none p-0">
                            <BaseCombobox.GroupLabel
                                id={groupId(g)}
                                render={<ListGroupHeader role="presentation" className="cursor-default" />}
                            >
                                <ListTitle>{group.key}</ListTitle>
                            </BaseCombobox.GroupLabel>
                            {group.items.map(renderOption)}
                        </BaseCombobox.Group>
                    </li>
                )
            )}
        </BaseCombobox.List>
    );

    const noMatches = noMatchesText != null && matchCount === 0 && (
        <div
            role="status"
            className={cn(
                LIST_DROPDOWN_ITEM,
                'cursor-default hover:[--li-bg:var(--sapList_Background)] active:[--li-bg:var(--sapList_Background)] active:text-sap-list-text-color'
            )}
        >
            {noMatchesText}
        </div>
    );

    const rootProps = {
        // Base UI's state is driven from ours: it opens, filters and highlights only as told
        value: null,
        inputValue: s.fieldText,
        openOnInputClick: false,
        highlightItemOnHover: false,
        filter: null,
        disabled,
        // not `required`: Base UI's hidden input holds no value here, so it would block the form; the input is
        // `aria-required`
        readOnly
    };

    const withMessage = (control: ReactNode) =>
        hasMessage ? (
            <FormInputMessageGroup triggers={[]} open={s.focused && !s.isOpen}>
                {control}
                <FormMessage type={stateValue}>{stateMessage}</FormMessage>
            </FormInputMessageGroup>
        ) : (
            control
        );

    const { className: popupClassName, style: popupStyle, ...restPopoverProps } = popoverProps ?? {};
    const maxWidth = noDropdownMaxWidth ? undefined : `${dropdownMaxWidth}px`;

    const desktop = (
        <BaseCombobox.Root<T>
            {...rootProps}
            open={listShown}
            onOpenChange={(next, details) => {
                if (next) return;
                if (details.reason === 'escape-key' || (details.reason === 'outside-press' && closeOnOutsideClick))
                    close();
            }}
        >
            {withMessage(renderControl(false))}
            <BaseCombobox.Portal container={container}>
                <BaseCombobox.Positioner side="bottom" align="start" className="z-[1000]">
                    <BaseCombobox.Popup
                        {...restPopoverProps}
                        ref={popupEl}
                        className={cn(
                            popoverSurfaceVariants({ arrow: false }),
                            'flex-col overflow-hidden',
                            popupClassName
                        )}
                        style={{
                            minWidth:
                                fillControlMode === 'at-least'
                                    ? maxWidth
                                        ? `min(var(--anchor-width), ${maxWidth})`
                                        : 'var(--anchor-width)'
                                    : undefined,
                            width: fillControlMode === 'equal' ? 'var(--anchor-width)' : undefined,
                            maxWidth,
                            ...popupStyle
                        }}
                    >
                        {noMatches}
                        {renderList(false)}
                    </BaseCombobox.Popup>
                </BaseCombobox.Positioner>
            </BaseCombobox.Portal>
        </BaseCombobox.Root>
    );

    const dialogOpen = mobile && s.isOpen;
    const mobileDialog = (
        <Dialog
            open={dialogOpen}
            onOpenChange={(next) => {
                // closed with Escape or the close button: discard like Cancel
                if (!next) dialogDismiss();
            }}
        >
            <DialogPopup
                mobile
                disablePaddings
                aria-labelledby={mobileConfig.title ? dialogTitleId : ariaLabelledBy || undefined}
                aria-label={mobileConfig.title || ariaLabelledBy ? undefined : ariaLabel || undefined}
                initialFocus={dialogField}
                finalFocus={field}
            >
                <BaseCombobox.Root<T> {...rootProps} inline open={dialogOpen}>
                    <DialogHeader>
                        {mobileConfig.title && <DialogTitle id={dialogTitleId}>{mobileConfig.title}</DialogTitle>}
                        {mobileConfig.hasCloseButton !== false && <DialogCloseButton mobile aria-label={closeLabel} />}
                        <DialogSubheader>
                            <BarMiddle className="w-full">
                                <BarElement fullWidth>{renderControl(true)}</BarElement>
                            </BarMiddle>
                        </DialogSubheader>
                    </DialogHeader>
                    <DialogBody>
                        {mobileConfig.instruction && (
                            <p className="m-0 px-4 pt-2 pb-2 font-sap-font-family text-sap-font-size text-sap-text-color">
                                {mobileConfig.instruction}
                            </p>
                        )}
                        {noMatches}
                        {renderList(true)}
                    </DialogBody>
                    {(approveMode || mobileConfig.cancelButtonText) && (
                        <DialogFooter>
                            {approveMode && (
                                <ButtonBar
                                    variant="emphasized"
                                    label={mobileConfig.approveButtonText}
                                    onClick={dialogApprove}
                                />
                            )}
                            {mobileConfig.cancelButtonText && (
                                <ButtonBar label={mobileConfig.cancelButtonText} onClick={dialogDismiss} />
                            )}
                        </DialogFooter>
                    )}
                </BaseCombobox.Root>
            </DialogPopup>
        </Dialog>
    );

    return (
        <div
            {...props}
            ref={setRoot}
            style={{ width: width || undefined, ...style }}
            className={cn(
                'inline-block max-w-full align-middle',
                (width || isSearch || showClearButton) && 'block',
                className
            )}
        >
            {mobile ? (
                <>
                    {withMessage(renderControl(false))}
                    {mobileDialog}
                </>
            ) : (
                desktop
            )}
            <span className="sr-only-sap" aria-live="polite" id={resultsId}>
                {resultsText}
            </span>
        </div>
    );
}
