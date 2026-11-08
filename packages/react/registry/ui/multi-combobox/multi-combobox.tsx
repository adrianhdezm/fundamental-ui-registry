/*
 * Port of @fundamental-ngx/core (multi-combobox) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type ComponentProps,
    type FocusEvent as ReactFocusEvent,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { BarElement, BarMiddle, ButtonBar } from '@/ui/bar/bar';
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
import { type FormState } from '@/ui/input/input';
import { INPUT_GROUP_BUTTON_VARS, STATE_BUTTON_VARS } from '@/ui/input-group/input-group';
import {
    LIST_CHECK_GLYPH,
    LIST_DROPDOWN_CHECK,
    LIST_DROPDOWN_ITEM,
    ListGroupHeader,
    ListMessage,
    ListSecondary,
    ListTitle
} from '@/ui/list/list';
import { Popover, PopoverBody, type PopoverBodyProps, type PopoverFillMode } from '@/ui/popover/popover';
import { Token, Tokenizer, TokenizerInput, type TokenizerInputProps } from '@/ui/token/token';

/** How typed text matches the items: the start of any word (default), the start of the text, or anywhere. */
export type MultiComboboxMatchingStrategy = 'startsWithPerTerm' | 'startsWith' | 'contains';

/** Dialog options of a multi-combobox in mobile mode. */
export interface MultiComboboxMobileConfig {
    title?: string;
    /** Shows a close button in the header (default true). */
    hasCloseButton?: boolean;
    /** Applies the selection; without it the selection applies right away. */
    approveButtonText?: string;
    cancelButtonText?: string;
}

/** Imperative actions of a multi-combobox, through `actionsRef`. */
export interface MultiComboboxActions {
    /** Opens the list (or the mobile dialog). */
    open(): void;
    /** Closes the list (or the mobile dialog) and clears the text. */
    close(): void;
    /** Selects all items, or none. */
    selectAll(select: boolean): void;
}

/** Context of `renderItem` and `renderSelectedItem`. */
export interface MultiComboboxItemContext {
    /** Index of the option in the shown list. */
    index: number;
}

interface Suggestion<T> {
    id: unknown;
    label: string;
    secondaryText: string;
    group: string | null;
    value: T;
}

interface Entry<T> {
    suggestion: Suggestion<T>;
    index: number;
}

const DEFAULT_MOBILE_CONFIG: MultiComboboxMobileConfig = {
    hasCloseButton: true,
    approveButtonText: 'OK',
    cancelButtonText: 'Cancel'
};
const NONE: never[] = [];

/** The dropdown width of fundamental-styles (40rem): the most the list takes from a wider field. */
const DROPDOWN_MAX_WIDTH = 640;

/** The list: no background of its own (the options draw it), as fundamental-styles' multi input list. */
const listClassName = 'relative m-0 box-border block min-w-20 list-none overflow-auto p-0 outline-none scrollbar-sap';

/** Reads a dot path from an object. */
function getPath(value: unknown, path: string): unknown {
    return path
        .split('.')
        .reduce<unknown>((obj, key) => (obj == null ? obj : (obj as Record<string, unknown>)[key]), value);
}

function assignRef<E>(ref: Ref<E> | undefined, node: E | null) {
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
}

export interface MultiComboboxProps<T = unknown> extends Omit<
    ComponentProps<'div'>,
    'children' | 'defaultValue' | 'onChange' | 'placeholder'
> {
    /** The items to choose from. */
    dataSource?: T[] | null;
    /** The chosen items (controlled). */
    selectedItems?: T[];
    /** The items chosen initially (uncontrolled). */
    defaultSelectedItems?: T[];
    /** Called with the chosen items when the user changes them (in approve mode, once approved). */
    onSelectedItemsChange?: (items: T[]) => void;
    /** Whether the list (or the mobile dialog) is open (controlled). */
    open?: boolean;
    /** Whether the list is open initially (uncontrolled). */
    defaultOpen?: boolean;
    /** Called when the list opens or closes. */
    onOpenChange?: (open: boolean) => void;
    /** Property (dot path) with the text of object items; a function there is called. */
    displayKey?: string;
    /** Property (dot path) with the identifier of object items (default: the item itself). */
    lookupKey?: string;
    /** Property (dot path) with the secondary text of object items. */
    secondaryKey?: string;
    /** Shows the secondary text in a second column. */
    showSecondaryText?: boolean;
    /** Alignment of the secondary text (default `right`, the end). */
    secondaryTextAlignment?: 'left' | 'right';
    /** Groups the items by `groupKey` under group headers. */
    group?: boolean;
    /** Property (dot path) with the group of object items. */
    groupKey?: string;
    /** How the typed text matches the items (default `startsWithPerTerm`). */
    matchingStrategy?: MultiComboboxMatchingStrategy;
    /** Shows every match instead of the first `mapLimit`. */
    limitless?: boolean;
    /** Most matches shown (default 12). */
    mapLimit?: number;
    /** A select all option at the top of the list. */
    showSelectAll?: boolean;
    /** Text of the select all option; `{selected}` and `{total}` are replaced. */
    selectAllLabel?: string;
    /** Error shown briefly when typed text matches no item (default `Invalid entry`; `null` rejects silently). */
    invalidEntryMessage?: string | null;
    /** Milliseconds the invalid entry error is shown (default 3000). */
    invalidEntryDisplayTime?: number;
    /** Completes the typed text with the first item that starts with it (default true). */
    autoComplete?: boolean;
    placeholder?: string;
    /** Id of the input, for an external `<label htmlFor>`. */
    inputId?: string;
    /** Value state of the field. */
    state?: FormState | null;
    /** Text of the value state: shown on top of the open list and describing the input. */
    stateMessage?: string | null;
    disabled?: boolean;
    readOnly?: boolean;
    /** Marks the input `aria-required`. */
    required?: boolean;
    /** Accessible name of the addon button (default `Show options`). */
    glyphAriaLabel?: string;
    /** Tooltip of the addon button. */
    addonIconTitle?: string;
    /** The addon button opens and closes the list (default true); otherwise it only calls `onAddOnButtonClick`. */
    openDropdownOnAddOnClicked?: boolean;
    /** The addon button is in the tab order; otherwise clicking it keeps the focus in the input. */
    buttonFocusable?: boolean;
    /** Maximum height of the list (default `250px`). */
    maxHeight?: string;
    /** List width relative to the field (default `at-least` as wide). */
    fillControlMode?: PopoverFillMode | null;
    /** Maximum width of the list: `none` (its content, up to 40rem), the width of the field (`container`) or pixels. */
    bodyMaxWidth?: 'none' | 'container' | number;
    /** Taller options, for item content with a byline. */
    byline?: boolean;
    /** Tokens rendered while the field does not have the focus; the rest count in the "n more" link (default 12). */
    maxVisibleTokens?: number;
    /** Opens the list in a full-screen dialog. */
    mobile?: boolean;
    /** Title and buttons of the mobile dialog (default: close button, OK and Cancel). */
    mobileConfig?: MultiComboboxMobileConfig;
    /** Name of the dialog close button. */
    closeLabel?: string;
    /** Name of the token list. */
    tokensLabel?: string;
    /** Content of an option after its check box (Angular's `optionItemTemplate`). */
    renderItem?: ((item: T, context: MultiComboboxItemContext) => ReactNode) | null;
    /** Content of a chosen option (Angular's `selectedItemTemplate`). */
    renderSelectedItem?: ((item: T, context: MultiComboboxItemContext) => ReactNode) | null;
    /** Secondary text of an option (Angular's `secondaryItemTemplate`). */
    renderSecondaryText?: ((item: T) => ReactNode) | null;
    /** Content of a group header, instead of a list group header (Angular's `groupItemTemplate`). */
    renderGroupHeader?: ((label: string) => ReactNode) | null;
    /** Called when the addon button is clicked. */
    onAddOnButtonClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
    /** `open()`, `close()` and `selectAll(select)`. */
    actionsRef?: Ref<MultiComboboxActions>;
    /** Ref of the input, e.g. to focus it. */
    inputRef?: Ref<HTMLInputElement>;
    /** Props of the input. */
    inputProps?: Omit<TokenizerInputProps, 'value' | 'defaultValue' | 'disabled' | 'readOnly' | 'id'>;
    /** Element the list or the mobile dialog is rendered into (default `document.body`). */
    container?: PopoverBodyProps['container'];
}

/**
 * Multi-combobox: chooses several items with check box options shown as tokens. Typing filters the items (by default
 * the start of any word) and text that matches nothing is rejected with a brief error. The focus stays in the input:
 * Down and Up highlight options, Space toggles the highlighted option, Enter toggles it and closes, Ctrl+A selects
 * and Ctrl+Shift+A deselects all. Closed, Down and Up put the next item in the input and Enter chooses it. Items can
 * be grouped and show a secondary text. In mobile mode the list opens in a full-screen dialog.
 *
 * Native props, `className` and `ref` go to the root `<div>`; `aria-label`, `aria-labelledby` and `aria-describedby`
 * go to the input (the first two also name the list).
 *
 * ```tsx
 * <MultiCombobox inputId="fruits" displayKey="name" lookupKey="id" dataSource={fruits} selectedItems={chosen} onSelectedItemsChange={setChosen} />
 * ```
 */
export function MultiCombobox<T = unknown>({
    dataSource,
    selectedItems: selectedProp,
    defaultSelectedItems,
    onSelectedItemsChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    displayKey = '',
    lookupKey = '',
    secondaryKey = '',
    showSecondaryText = false,
    secondaryTextAlignment = 'right',
    group = false,
    groupKey = '',
    matchingStrategy = 'startsWithPerTerm',
    limitless = false,
    mapLimit = 12,
    showSelectAll = false,
    selectAllLabel = 'Select All ({selected}/{total})',
    invalidEntryMessage = 'Invalid entry',
    invalidEntryDisplayTime = 3000,
    autoComplete = true,
    placeholder,
    inputId,
    state,
    stateMessage,
    disabled = false,
    readOnly = false,
    required = false,
    glyphAriaLabel = 'Show options',
    addonIconTitle,
    openDropdownOnAddOnClicked = true,
    buttonFocusable = false,
    maxHeight = '250px',
    fillControlMode = 'at-least',
    bodyMaxWidth = 'none',
    byline = false,
    maxVisibleTokens = 12,
    mobile = false,
    mobileConfig = DEFAULT_MOBILE_CONFIG,
    closeLabel = 'Close',
    tokensLabel = 'Selected items',
    renderItem,
    renderSelectedItem,
    renderSecondaryText,
    renderGroupHeader,
    onAddOnButtonClick,
    actionsRef,
    inputRef,
    inputProps,
    container,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    className,
    ref,
    onBlur,
    ...props
}: MultiComboboxProps<T>) {
    const autoId = useId().replace(/:/g, '');
    const id = `fd-multi-combobox-${autoId}`;
    const listId = `${id}-list`;
    const messageId = `${id}-message`;
    const dialogInputId = `${id}-dialog-input`;
    const dialogTitleId = `${id}-dialog-title`;
    const selectAllId = `${id}-select-all`;
    const optionId = (index: number) => `${id}-option-${index}`;

    const root = useRef<HTMLDivElement | null>(null);
    const field = useRef<HTMLInputElement | null>(null);
    const dialogField = useRef<HTMLInputElement | null>(null);
    const tokenizer = useRef<HTMLDivElement | null>(null);
    const popoverBody = useRef<HTMLDivElement | null>(null);
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    // selection: the committed items, and a draft while an approve-mode dialog is open
    const [ownSelected, setOwnSelected] = useState<T[]>(() => defaultSelectedItems ?? NONE);
    const committed = selectedProp ?? ownSelected;
    const [draft, setDraft] = useState<T[] | null>(null);
    const selected = draft ?? committed;
    const selectedRef = useRef(selected);
    selectedRef.current = selected;

    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const open = openProp ?? ownOpen;
    const openRef = useRef(open);
    openRef.current = open;

    /** The typed text (it filters the list), and the text in the input (the typed text plus its completion). */
    const [text, setTextState] = useState('');
    const [fieldText, setFieldText] = useState('');
    const textRef = useRef(text);
    textRef.current = text;
    const completion = useRef<{ typed: string; label: string } | null>(null);
    /** Highlighted option: an index, -1 for none, -2 for the select all option. */
    const [activeIndex, setActiveIndex] = useState(-1);
    const [onlySelected, setOnlySelected] = useState(false);
    const [showAllTokens, setShowAllTokens] = useState(false);
    const [invalidEntry, setInvalidEntry] = useState(false);
    const invalidTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const anchor = useRef<number | null>(null);

    const approveMode = mobile && !!mobileConfig.approveButtonText;
    const dialogOpen = mobile && open;
    const isGroup = group && !!groupKey;
    const currentState = invalidEntry ? 'error' : state;
    const currentStateMessage = invalidEntry ? invalidEntryMessage : stateMessage;

    const lookup = (value: T): unknown =>
        value != null && typeof value === 'object' ? (lookupKey ? getPath(value, lookupKey) : value) : value;
    const displayOf = (value: T): string => {
        if (value != null && typeof value === 'object') {
            const label = displayKey ? getPath(value, displayKey) : undefined;
            return `${typeof label === 'function' ? (label as () => unknown)() : (label ?? '')}`;
        }
        return `${value ?? ''}`;
    };
    const toSuggestion = (value: T): Suggestion<T> => ({
        id: lookup(value),
        label: displayOf(value),
        secondaryText: secondaryKey ? `${getPath(value, secondaryKey) ?? ''}` : '',
        group: isGroup ? `${getPath(value, groupKey) ?? ''}` || null : null,
        value
    });

    const data = dataSource ?? NONE;
    const suggestions = useMemo(
        () => data.map(toSuggestion),
        // the keys decide the suggestions
        [data, displayKey, lookupKey, secondaryKey, groupKey, isGroup]
    );
    const suggestionsRef = useRef(suggestions);
    suggestionsRef.current = suggestions;
    const selectedIds = useMemo(() => new Set(selected.map(lookup)), [selected, lookupKey]);
    const isSelected = (suggestion: Suggestion<T>) => selectedIds.has(suggestion.id);

    const matches = (suggestion: Suggestion<T>, value: string): boolean => {
        const term = value.trim().toLocaleLowerCase();
        if (!term) return true;
        const label = suggestion.label.toLocaleLowerCase();
        switch (matchingStrategy) {
            case 'contains':
                return label.includes(term);
            case 'startsWith':
                return label.startsWith(term);
            default:
                return label.startsWith(term) || label.split(/\s+/).some((word) => word.startsWith(term));
        }
    };

    /** Suggestions of the chosen items, in the order of choosing. */
    const selectedSuggestions = selected.map(
        (item) => suggestions.find((s) => Object.is(s.id, lookup(item))) ?? toSuggestion(item)
    );

    /** The suggestions shown in the list, limited and in group order. */
    const filtered = (() => {
        let items = onlySelected ? suggestions.filter(isSelected) : suggestions.filter((s) => matches(s, text));
        if (!limitless && !onlySelected) items = items.slice(0, mapLimit);
        if (!isGroup) return items;
        const order: string[] = [];
        const groups = new Map<string, Suggestion<T>[]>();
        for (const item of items) {
            if (!item.group) continue;
            if (!groups.has(item.group)) {
                groups.set(item.group, []);
                order.push(item.group);
            }
            groups.get(item.group)!.push(item);
        }
        return order.flatMap((g) => groups.get(g)!);
    })();
    const rows: { key: string; header: string | null; items: Entry<T>[] }[] = [];
    filtered.forEach((suggestion, index) => {
        let row = rows[rows.length - 1];
        const header = isGroup ? suggestion.group : null;
        if (!row || row.header !== header) {
            row = { key: `${rows.length}`, header, items: [] };
            rows.push(row);
        }
        row.items.push({ suggestion, index });
    });

    const renderedTokens =
        showAllTokens || selectedSuggestions.length <= maxVisibleTokens
            ? selectedSuggestions
            : selectedSuggestions.slice(0, maxVisibleTokens);
    const hiddenCount = selectedSuggestions.length - renderedTokens.length;
    const allSelected = suggestions.length > 0 && suggestions.every(isSelected);
    const someSelected = !allSelected && selected.length > 0;
    const selectAllText = selectAllLabel
        .replace('{selected}', `${selected.length}`)
        .replace('{total}', `${suggestions.length}`);
    const listShown = !mobile && open && (filtered.length > 0 || !!currentStateMessage);
    const firstIndex = showSelectAll && filtered.length ? -2 : 0;
    const activeId = activeIndex === -2 ? selectAllId : activeIndex >= 0 ? optionId(activeIndex) : undefined;

    // keep the highlighted option visible
    useEffect(() => {
        if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' });
    }, [activeId]);

    // the typed text completed with the first match, the completion selected (after every render: typing over a
    // completion can end with the same text)
    useLayoutEffect(() => {
        const done = completion.current;
        const el = dialogOpen ? dialogField.current : field.current;
        if (!done || !el || el.value !== done.label) return;
        completion.current = null;
        el.setSelectionRange(done.typed.length, done.label.length);
    });

    useEffect(
        () => () => {
            if (invalidTimer.current) clearTimeout(invalidTimer.current);
        },
        []
    );

    const setOpen = (next: boolean) => {
        if (openRef.current === next) return;
        openRef.current = next;
        if (openProp === undefined) setOwnOpen(next);
        onOpenChange?.(next);
    };

    /** Sets the typed text and the input text; a new text forgets the Shift click anchor (the list changes). */
    const setText = (value: string) => {
        setFieldText(value);
        if (value === textRef.current) return;
        textRef.current = value;
        setTextState(value);
        anchor.current = null;
    };

    const commit = (items: T[]) => {
        if (selectedProp === undefined) setOwnSelected(items);
        onSelectedItemsChange?.(items);
    };

    const setSelected = (items: T[]) => {
        selectedRef.current = items;
        if (approveMode && openRef.current) setDraft(items);
        else commit(items);
    };

    const focusField = () => (dialogOpen ? dialogField.current : field.current)?.focus();

    const openList = () => {
        if (disabled || readOnly || openRef.current) return;
        setOpen(true);
    };

    const close = () => {
        if (!openRef.current) return;
        setOpen(false);
        setActiveIndex(-1);
        setOnlySelected(false);
        anchor.current = null;
        setText('');
        // the dialog gives the focus back to the field (its finalFocus)
        if (mobile) setDraft(null);
    };

    const selectAll = (select: boolean) => {
        setSelected(select ? suggestionsRef.current.map((s) => s.value) : []);
        setText('');
    };

    useImperativeHandle(actionsRef, () => ({ open: openList, close, selectAll }));

    // a disabled multi-combobox closes
    useEffect(() => {
        if (disabled) close();
    }, [disabled]);

    /** Chooses or removes a suggestion. */
    const toggle = (suggestion: Suggestion<T>, select = !selectedIds.has(suggestion.id)) => {
        const rest = selectedRef.current.filter((item) => !Object.is(lookup(item), suggestion.id));
        setSelected(select ? [...rest, suggestion.value] : rest);
    };

    /** Removes the item of a token; without tokens left the focus goes to the input, as the token is gone. */
    const removeToken = (suggestion: Suggestion<T>) => {
        if (disabled || readOnly) return;
        toggle(suggestion, false);
        if (!selectedRef.current.length) focusField();
    };

    const showInvalidEntry = () => {
        if (!invalidEntryMessage) return;
        setInvalidEntry(true);
        if (invalidTimer.current) clearTimeout(invalidTimer.current);
        invalidTimer.current = setTimeout(() => {
            if (mounted.current) setInvalidEntry(false);
        }, invalidEntryDisplayTime);
    };

    const onInput = (event: ChangeEvent<HTMLInputElement>, dialog: boolean) => {
        const typed = event.target.value;
        // text that matches nothing is rejected: the input keeps the typed text
        if (typed && !suggestions.some((s) => matches(s, typed))) {
            setFieldText(textRef.current);
            showInvalidEntry();
            return;
        }
        setText(typed);
        setActiveIndex(-1);
        setOnlySelected(false);
        if (typed && !dialog) openList();
        const inputType = (event.nativeEvent as InputEvent).inputType;
        if (autoComplete && typed && inputType?.startsWith('insert')) {
            const lower = typed.toLocaleLowerCase();
            const match = suggestions.find((s) => s.label.toLocaleLowerCase().startsWith(lower));
            if (match) {
                completion.current = { typed, label: match.label };
                setFieldText(match.label);
            }
        }
    };

    const toggleActive = () => {
        if (activeIndex === -2) selectAll(!allSelected);
        else if (filtered[activeIndex]) toggle(filtered[activeIndex]);
    };

    /** Enter in the input chooses (or removes) the item named by the text. */
    const toggleByText = (value: string) => {
        const lower = value.toLocaleLowerCase();
        const item = suggestions.find((s) => s.label.toLocaleLowerCase() === lower);
        if (!item) return;
        toggle(item);
        setText('');
    };

    /** Down and Up in a closed field put the next item that is not chosen in the input. */
    const chooseOther = (offset: number, el: HTMLInputElement) => {
        if (suggestions.every(isSelected)) return;
        let index = suggestions.findIndex((s) => s.label === el.value);
        if (index < 0) index = offset > 0 ? -1 : suggestions.length;
        for (let i = index + offset; i >= 0 && i < suggestions.length; i += offset) {
            if (!isSelected(suggestions[i])) {
                setText(suggestions[i].label);
                return;
            }
        }
    };

    const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>, dialog: boolean) => {
        if (disabled || readOnly) return;
        const key = event.key;
        if (mobile && !dialog) {
            if (key === 'Enter' || key === 'ArrowDown' || (key.length === 1 && !event.ctrlKey && !event.metaKey)) {
                event.preventDefault();
                openList();
            }
            return;
        }
        const el = dialog ? dialogField.current : field.current;
        const shown = dialog || listShown;
        if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'a' && shown && activeIndex !== -1) {
            event.preventDefault();
            // not the tokenizer's Ctrl+A, which selects the tokens
            event.stopPropagation();
            selectAll(!event.shiftKey);
            return;
        }
        switch (key) {
            case 'ArrowDown':
                event.preventDefault();
                if (event.altKey && !dialog) openList();
                else if (shown && filtered.length)
                    setActiveIndex(
                        activeIndex === -1
                            ? firstIndex
                            : activeIndex === -2
                              ? 0
                              : Math.min(activeIndex + 1, filtered.length - 1)
                    );
                else if (el) chooseOther(1, el);
                return;
            case 'ArrowUp':
                event.preventDefault();
                if (event.altKey && !dialog) close();
                else if (shown)
                    setActiveIndex(
                        activeIndex === 0 && firstIndex === -2 ? -2 : activeIndex <= 0 ? -1 : activeIndex - 1
                    );
                else if (el) chooseOther(-1, el);
                return;
            case ' ':
                if (shown && activeIndex !== -1) {
                    event.preventDefault();
                    toggleActive();
                }
                return;
            case 'Enter':
                event.preventDefault();
                if (shown && activeIndex !== -1) {
                    toggleActive();
                    if (!dialog) close();
                    return;
                }
                if (el) toggleByText(el.value);
                return;
            case 'Escape':
                if (openRef.current && !dialog) {
                    event.preventDefault();
                    event.stopPropagation();
                    close();
                }
                return;
            case 'Tab':
                if (openRef.current && !dialog) close();
                return;
        }
    };

    const clickRange = (index: number, event: ReactMouseEvent) => {
        const item = filtered[index];
        if (!item) return;
        const select = !isSelected(item);
        if (event.shiftKey && anchor.current !== null) {
            const [from, to] = [Math.min(anchor.current, index), Math.max(anchor.current, index)];
            const range = filtered.slice(from, to + 1);
            const ids = new Set(range.map((s) => s.id));
            const rest = selectedRef.current.filter((v) => !ids.has(lookup(v)));
            setSelected(select ? [...rest, ...range.map((s) => s.value)] : rest);
        } else {
            toggle(item, select);
        }
        anchor.current = index;
        setActiveIndex(index);
    };

    /** A click on an option chooses it and closes the list; Shift chooses a range. */
    const onOptionClick = (index: number, event: ReactMouseEvent) => {
        clickRange(index, event);
        if (!mobile) close();
    };

    /** A click on the check box keeps the list open. */
    const onCheckClick = (index: number, event: ReactMouseEvent) => {
        event.stopPropagation();
        clickRange(index, event);
        setText('');
    };

    const onAddOnClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
        onAddOnButtonClick?.(event);
        if (mobile) {
            openList();
            return;
        }
        if (openDropdownOnAddOnClicked && !openRef.current) {
            setText('');
            openList();
        } else close();
        field.current?.focus();
    };

    /** The "n more" link lists only the chosen items. */
    const onMoreClick = () => {
        setShowAllTokens(true);
        setOnlySelected(true);
        openList();
        field.current?.focus();
    };

    /** The focus left the field: a text that names exactly one item chooses it, and the list closes. */
    const leave = () => {
        const value = textRef.current;
        const match = value ? suggestionsRef.current.filter((s) => s.label === value) : [];
        if (match.length === 1 && !selectedRef.current.some((item) => Object.is(lookup(item), match[0].id)))
            toggle(match[0], true);
        close();
        setText('');
        setShowAllTokens(false);
    };

    const handleBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
        onBlur?.(event);
        if (mobile) return;
        const next = event.relatedTarget as Node | null;
        if (!next) {
            // a focused token that is removed blurs while it leaves the DOM: the focus goes back to the field
            const target = event.target as Node;
            queueMicrotask(() => {
                if (!mounted.current) return;
                if (!target.isConnected && root.current?.isConnected) {
                    field.current?.focus();
                    return;
                }
                if (root.current?.contains(document.activeElement)) return;
                leave();
            });
            return;
        }
        if (
            root.current?.contains(next) ||
            popoverBody.current?.contains(next) ||
            (next as Element).closest?.('[data-tokenizer-popover]')
        )
            return;
        leave();
    };

    const finishDialog = () => {
        setOpen(false);
        setDraft(null);
        setActiveIndex(-1);
        setOnlySelected(false);
        setText('');
    };
    const dialogApprove = () => {
        commit(selectedRef.current);
        finishDialog();
    };
    const dialogDismiss = () => finishDialog();

    const popoverMaxWidth =
        bodyMaxWidth === 'none'
            ? DROPDOWN_MAX_WIDTH
            : typeof bodyMaxWidth === 'number'
              ? bodyMaxWidth
              : listShown
                ? (root.current?.getBoundingClientRect().width ?? null)
                : null;
    // fundamental-styles' dropdown fill: the field width less two group borders (not with a list as wide as the field)
    const fillWidth = 'calc(var(--anchor-width) - 2 * var(--sapGroup_BorderWidth))';
    const popoverStyle =
        fillControlMode === 'at-least' && bodyMaxWidth !== 'container'
            ? { minWidth: popoverMaxWidth != null ? `min(${fillWidth}, ${popoverMaxWidth}px)` : fillWidth }
            : undefined;
    const dialogLabelledBy = ariaLabelledBy || (mobileConfig.title ? dialogTitleId : undefined);
    const describedBy = cn(currentStateMessage && messageId, ariaDescribedBy) || undefined;

    const control = (dialog: boolean) => {
        const ownInputRef = dialog ? dialogField : field;
        return (
            <Tokenizer
                ref={(node) => {
                    if (!dialog) tokenizer.current = node;
                }}
                state={currentState}
                disabled={disabled}
                readOnly={readOnly}
                disableKeyboardDeletion={readOnly}
                open={open}
                showOverflowPopover={false}
                externalHiddenCount={hiddenCount}
                glyph={readOnly || dialog ? null : 'navigation-down-arrow'}
                glyphAriaLabel={glyphAriaLabel}
                glyphTitle={addonIconTitle}
                glyphHasPopup={mobile ? 'dialog' : 'listbox'}
                glyphExpanded={open}
                buttonFocusable={buttonFocusable}
                tokenizerLabel={tokensLabel}
                className={cn(
                    // the addon button looks like an input group button (fundamental-styles' multi combobox is an
                    // input group around a tokenizer): no border, the field hover shadow, and in high contrast as
                    // high as the field, over its border
                    INPUT_GROUP_BUTTON_VARS,
                    STATE_BUTTON_VARS[currentState ?? 'default'],
                    'hc:[&>div>button]:-my-(--sapField_BorderWidth)',
                    (!currentState || currentState === 'default') &&
                        !readOnly &&
                        '[&>div:hover]:[box-shadow:var(--sapField_Hover_Shadow)]',
                    // fundamental-styles' read-only multi combobox field has no field shadow
                    readOnly && '[&>div]:[box-shadow:none] [&>div:hover]:[box-shadow:none]'
                )}
                onMoreClick={onMoreClick}
                onAddOnButtonClick={onAddOnClick}
                input={
                    <TokenizerInput
                        type="text"
                        role="combobox"
                        autoComplete="off"
                        {...inputProps}
                        ref={(node: HTMLInputElement | null) => {
                            ownInputRef.current = node;
                            if (!dialog) assignRef(inputRef, node);
                            assignRef(inputProps?.ref, node);
                        }}
                        id={dialog ? dialogInputId : inputId || `${id}-input`}
                        value={fieldText}
                        disabled={disabled}
                        readOnly={readOnly}
                        placeholder={selectedSuggestions.length ? undefined : placeholder || undefined}
                        aria-label={dialog ? ariaLabel || placeholder || undefined : ariaLabel}
                        aria-labelledby={dialog ? dialogLabelledBy : ariaLabelledBy}
                        aria-describedby={describedBy}
                        aria-required={required || undefined}
                        aria-readonly={readOnly || undefined}
                        aria-invalid={currentState === 'error' || undefined}
                        aria-autocomplete={autoComplete ? 'both' : 'list'}
                        aria-haspopup={mobile && !dialog ? 'dialog' : 'listbox'}
                        aria-expanded={mobile && !dialog ? open : dialog || listShown}
                        aria-controls={open && (dialog || mobile || listShown) ? listId : undefined}
                        aria-activedescendant={(dialog || listShown) && activeId ? activeId : undefined}
                        onChange={(event) => {
                            inputProps?.onChange?.(event);
                            onInput(event, dialog);
                        }}
                        onKeyDown={(event) => {
                            inputProps?.onKeyDown?.(event);
                            onKeyDown(event, dialog);
                        }}
                        onFocus={(event) => {
                            inputProps?.onFocus?.(event);
                            setShowAllTokens(true);
                        }}
                    />
                }
            >
                {renderedTokens.map((suggestion, index) => (
                    <Token
                        key={
                            typeof suggestion.id === 'object' && suggestion.id !== null ? index : String(suggestion.id)
                        }
                        disabled={disabled}
                        readOnly={readOnly}
                        title={suggestion.label}
                        onCloseClick={() => removeToken(suggestion)}
                        onRemove={() => removeToken(suggestion)}
                    >
                        {suggestion.label}
                    </Token>
                ))}
            </Tokenizer>
        );
    };

    const highlight = (label: string): [string, string, string] => {
        const term = text.trim();
        if (!term) return [label, '', ''];
        const at = label.toLocaleLowerCase().indexOf(term.toLocaleLowerCase());
        if (at < 0) return [label, '', ''];
        return [label.slice(0, at), label.slice(at, at + term.length), label.slice(at + term.length)];
    };

    const optionClassName = cn(
        LIST_DROPDOWN_ITEM,
        // a list item of fundamental-styles' multi combobox list: 2.75rem high in cozy, plus the selection line of a
        // selected item
        'min-h-11 gap-x-2 ps-3 pe-4 aria-selected:min-h-[2.8125rem] compact:aria-selected:min-h-[2.0625rem]',
        byline && 'py-2'
    );

    const renderOption = ({ suggestion, index }: Entry<T>) => {
        const chosen = isSelected(suggestion);
        let content: ReactNode;
        if (chosen && renderSelectedItem) content = renderSelectedItem(suggestion.value, { index });
        else {
            const parts = highlight(suggestion.label);
            content = (
                <>
                    {renderItem ? (
                        renderItem(suggestion.value, { index })
                    ) : (
                        <span
                            className={cn(
                                'min-h-4 min-w-0 flex-auto truncate compact:min-h-3.5',
                                // title and secondary text share the row, as fundamental-styles' dropdown list
                                showSecondaryText && 'max-w-96'
                            )}
                            title={suggestion.label}
                        >
                            {parts[0]}
                            <b className="font-bold">{parts[1]}</b>
                            {parts[2]}
                        </span>
                    )}
                    {showSecondaryText &&
                        (renderSecondaryText ? (
                            renderSecondaryText(suggestion.value)
                        ) : (
                            <ListSecondary
                                className={cn(
                                    'min-w-0 flex-auto max-w-64',
                                    secondaryTextAlignment === 'left' && 'text-start'
                                )}
                                title={suggestion.secondaryText}
                            >
                                {suggestion.secondaryText}
                            </ListSecondary>
                        ))}
                </>
            );
        }
        return (
            <li
                key={index}
                role="option"
                id={optionId(index)}
                aria-selected={chosen}
                data-active={index === activeIndex ? '' : undefined}
                className={optionClassName}
                onClick={(event) => onOptionClick(index, event)}
            >
                <span
                    aria-hidden="true"
                    className={LIST_DROPDOWN_CHECK}
                    data-glyph={chosen ? LIST_CHECK_GLYPH : ''}
                    onClick={(event) => onCheckClick(index, event)}
                />
                {content}
            </li>
        );
    };

    const list = (dialog: boolean) => (
        <div className="flex w-full min-w-0 flex-col" onMouseDown={(event) => event.preventDefault()}>
            {currentStateMessage && (
                // the input is described by the message; this is its visible copy
                <ListMessage
                    render={<div />}
                    aria-hidden="true"
                    type={currentState && currentState !== 'default' ? currentState : null}
                    className="static block"
                >
                    {currentStateMessage}
                </ListMessage>
            )}
            <ul
                role="listbox"
                aria-multiselectable="true"
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                id={listId}
                tabIndex={dialog ? 0 : undefined}
                aria-activedescendant={dialog && activeId ? activeId : undefined}
                style={{ maxHeight: dialog ? undefined : maxHeight }}
                className={cn(listClassName, mobile ? 'w-full' : 'w-full max-w-[40rem] rounded-[inherit]')}
                onKeyDown={(event) => {
                    // keys on the list in the mobile dialog work as in its input
                    if (dialog) onKeyDown(event, true);
                }}
            >
                {showSelectAll && filtered.length > 0 && (
                    <li
                        role="option"
                        id={selectAllId}
                        aria-selected={allSelected}
                        data-active={activeIndex === -2 ? '' : undefined}
                        className={cn(
                            optionClassName,
                            'border-b-(length:--sapList_BorderWidth) border-solid border-sap-list-border-color'
                        )}
                        onClick={() => selectAll(!allSelected)}
                    >
                        <span
                            aria-hidden="true"
                            className={LIST_DROPDOWN_CHECK}
                            data-glyph={allSelected ? LIST_CHECK_GLYPH : ''}
                            data-indeterminate={someSelected ? '' : undefined}
                        />
                        <span className="min-w-0 flex-auto truncate">{selectAllText}</span>
                    </li>
                )}
                {rows.map((row) =>
                    row.header === null ? (
                        row.items.map(renderOption)
                    ) : (
                        <li key={row.key} role="none" className="m-0 list-none p-0">
                            <ul role="group" aria-labelledby={`${id}-group-${row.key}`} className="m-0 list-none p-0">
                                {renderGroupHeader ? (
                                    <li role="presentation" id={`${id}-group-${row.key}`}>
                                        {renderGroupHeader(row.header)}
                                    </li>
                                ) : (
                                    <ListGroupHeader
                                        role="presentation"
                                        id={`${id}-group-${row.key}`}
                                        className="cursor-default"
                                    >
                                        <ListTitle className="min-h-4">{row.header}</ListTitle>
                                    </ListGroupHeader>
                                )}
                                {row.items.map(renderOption)}
                            </ul>
                        </li>
                    )
                )}
            </ul>
        </div>
    );

    return (
        <div
            {...props}
            ref={(node) => {
                root.current = node;
                assignRef(ref, node);
            }}
            className={cn('block', className)}
            onBlur={handleBlur}
        >
            {mobile ? (
                control(false)
            ) : (
                <Popover
                    placement="bottom-start"
                    open={listShown}
                    triggers={NONE}
                    anchor={tokenizer}
                    noArrow
                    disabled={disabled || readOnly}
                    closeOnEscapeKey={false}
                    fillControlMode={fillControlMode}
                    maxWidth={popoverMaxWidth}
                    focusTrapped={false}
                    focusAutoCapture={false}
                    restoreFocusOnClose={false}
                    disableScrollbar
                    onOpenChange={(next, details) => {
                        if (next) return;
                        // presses on the field are not outside: the field handles them
                        const target = details.event?.target as Node | null;
                        if (target && root.current?.contains(target)) return;
                        // as leaving the field: the outside press can come before the focus moves
                        leave();
                    }}
                >
                    {control(false)}
                    <PopoverBody role="presentation" container={container} style={popoverStyle} ref={popoverBody}>
                        {list(false)}
                    </PopoverBody>
                </Popover>
            )}
            {currentStateMessage && (
                <span className="sr-only-sap" id={messageId}>
                    {currentStateMessage}
                </span>
            )}
            <span className="sr-only-sap" aria-live="polite">
                {currentStateMessage && !open ? currentStateMessage : ''}
            </span>
            {mobile && (
                <Dialog
                    open={dialogOpen}
                    escKeyCloseable={false}
                    backdropClickCloseable={false}
                    onOpenChange={(next) => {
                        if (!next) dialogDismiss();
                    }}
                >
                    <DialogPopup
                        container={container}
                        mobile
                        disablePaddings
                        aria-labelledby={mobileConfig.title ? undefined : ariaLabelledBy}
                        aria-label={mobileConfig.title || ariaLabelledBy ? undefined : ariaLabel}
                        initialFocus={dialogField}
                        finalFocus={field}
                    >
                        <DialogHeader>
                            {mobileConfig.title && (
                                <DialogTitle level={1} id={dialogTitleId}>
                                    {mobileConfig.title}
                                </DialogTitle>
                            )}
                            {mobileConfig.hasCloseButton !== false && (
                                <DialogCloseButton mobile aria-label={closeLabel} />
                            )}
                            <DialogSubheader>
                                <BarMiddle className="w-full">
                                    <BarElement className="min-w-0 flex-1">{control(true)}</BarElement>
                                </BarMiddle>
                            </DialogSubheader>
                        </DialogHeader>
                        <DialogBody>{list(true)}</DialogBody>
                        {(mobileConfig.approveButtonText || mobileConfig.cancelButtonText) && (
                            <DialogFooter>
                                {mobileConfig.approveButtonText && (
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
                    </DialogPopup>
                </Dialog>
            )}
        </div>
    );
}
