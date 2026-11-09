/*
 * Port of fundamental-react (MultiInput) and @fundamental-ngx/core (multi-input) with the visual design of fundamental-styles,
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
import { Button } from '@/ui/button/button';
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
import { type IconFont } from '@/ui/icon/icon';
import { type FormState } from '@/ui/input/input';
import { INPUT_GROUP_BUTTON_VARS, STATE_BUTTON_VARS } from '@/ui/input-group/input-group';
import { Link } from '@/ui/link/link';
import { LIST_CHECK_GLYPH, LIST_DROPDOWN_CHECK, LIST_DROPDOWN_ITEM } from '@/ui/list/list';
import { Popover, PopoverBody, type PopoverBodyProps, type PopoverFillMode } from '@/ui/popover/popover';
import { Token, Tokenizer, TokenizerInput, type TokenizerInputProps, type TokenizerProps } from '@/ui/token/token';

/** Dialog options of a multi-input in mobile mode. */
export interface MultiInputMobileConfig {
    title?: string;
    /** Shows a close button in the header (default true). */
    hasCloseButton?: boolean;
    /** Applies the selection; without it the selection applies right away. */
    approveButtonText?: string;
    cancelButtonText?: string;
}

/** Imperative actions of a multi-input, through `actionsRef`. */
export interface MultiInputActions {
    /** Opens the list (or the mobile dialog). */
    open(): void;
    /** Closes the list (or the mobile dialog) and clears the search. */
    close(): void;
    /** Selects all items or none. */
    selectAllItems(selectAll: boolean): void;
}

interface OptionView<T, V> {
    id: string;
    item: T;
    value: V;
    label: string;
    selected: boolean;
}

const DEFAULT_MOBILE_CONFIG: MultiInputMobileConfig = { hasCloseButton: true, approveButtonText: 'Select' };
const NONE: never[] = [];

const defaultDisplay = (item: unknown): string =>
    item != null && typeof item === 'object' && 'label' in item ? `${(item as { label: unknown }).label}` : `${item}`;
const defaultValue = (item: unknown): unknown =>
    item != null && typeof item === 'object' && 'value' in item ? (item as { value: unknown }).value : item;
const defaultParse = (text: string): unknown => text;
const defaultValidate = (text: string): boolean => !!text;

export interface MultiInputProps<T = unknown, V = unknown> extends Omit<
    ComponentProps<'div'>,
    'children' | 'defaultValue' | 'onChange' | 'placeholder' | 'title'
> {
    /** The values of the selected items (controlled). */
    selected?: V[];
    /** The values selected initially (uncontrolled). */
    defaultSelected?: V[];
    /** Called with the new values when items are selected or removed (in approve mode, once approved). */
    onSelectedChange?: (values: V[]) => void;
    /** Whether the list (or the mobile dialog) is open (controlled). */
    open?: boolean;
    /** Whether the list is open initially (uncontrolled). */
    defaultOpen?: boolean;
    /** Called when the list opens or closes. */
    onOpenChange?: (open: boolean) => void;
    /** The items of the list (fundamental-react's `data`). */
    dropdownValues?: T[] | null;
    /** Text of an item (default: its `label`, or the item itself). */
    displayFn?: (item: T) => string;
    /** Value of an item in `selected` (default: its `value`, or the item itself). */
    valueFn?: (item: T) => V;
    /** Filters the items by the search text; by default by the start (or with `includes` any part) of the text. */
    filterFn?: ((items: T[], searchTerm: string) => T[]) | null;
    /** The search text matches any part of an item's text. */
    includes?: boolean;
    /** Bold search text in the options (default true). */
    highlight?: boolean;
    /** Completes the typed text with the first matching item (default true). */
    autoComplete?: boolean;
    /** Renders the content of an option after its check box (Angular's `itemTemplate`). */
    renderItem?: ((item: T) => ReactNode) | null;
    /** Enter adds a typed text that matches no item as a new token. */
    allowNewTokens?: boolean;
    /** Turns a typed text into a new item. */
    newTokenParseFn?: (text: string) => T;
    /** Whether a typed text may become a new token (default: any text). */
    newTokenValidateFn?: (text: string) => boolean;
    placeholder?: string;
    /** Id of the input, for an external `<label htmlFor>`. */
    inputId?: string;
    /** Tooltip of the input. */
    title?: string;
    /** Value state of the field; pair it with a form message that explains it. */
    state?: FormState | null;
    disabled?: boolean;
    /** Marks the input `aria-required`. */
    required?: boolean;
    /** Icon of the addon button (default `value-help`, mirrored in RTL). */
    glyph?: string;
    glyphFont?: IconFont;
    /** Shows the addon button (default true). */
    displayAddonButton?: boolean;
    /** Accessible name of the addon button (fundamental-react's `buttonLabel`). */
    addOnButtonAriaLabel?: string;
    /** Tooltip of the addon button. */
    addonIconTitle?: string;
    /** The addon button opens and closes the list (default true); otherwise it only calls `onAddOnButtonClick`. */
    openDropdownOnAddOnClicked?: boolean;
    /** The addon button is in the tab order; otherwise clicking it keeps the focus in the input. */
    buttonFocusable?: boolean;
    /** Maximum height of the list (default `300px`). */
    maxHeight?: string;
    /** List width relative to the field (default `at-least` as wide). */
    fillControlMode?: PopoverFillMode | null;
    /** Maximum width of the list: `none` (its content, up to 40rem), the width of the field (`container`) or pixels. */
    bodyMaxWidth?: 'none' | 'container' | number;
    /** Opens the list below (default) or above the field. */
    placement?: 'top' | 'bottom';
    /** A link under a filtered list that shows all items again (default true). */
    showAllButton?: boolean;
    /** Text of the "show all" link; `{count}` is the number of items. */
    showAllLabel?: string;
    /** Tokens rendered while the field does not have the focus; the rest count in the "n more" link (default 12). */
    maxVisibleTokens?: number;
    /** Taller options, for item content with a byline. */
    byline?: boolean;
    /** Opens the list in a full-screen dialog with a select all button. */
    mobile?: boolean;
    /** Title and buttons of the mobile dialog. */
    mobileConfig?: MultiInputMobileConfig;
    /** Name of the dialog close button. */
    closeLabel?: string;
    /** Name of the select all button of the dialog. */
    selectAllLabel?: string;
    /** Name of the token list. */
    tokensLabel?: string;
    /** Called with the search text while typing and when it clears. */
    onSearchTermChange?: (term: string) => void;
    /** Called when the addon button is clicked. */
    onAddOnButtonClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
    /** Called when every shown option becomes selected, or no longer is. */
    onAllItemsSelectedChange?: (allSelected: boolean) => void;
    /** `open()`, `close()` and `selectAllItems(selectAll)`. */
    actionsRef?: Ref<MultiInputActions>;
    /** Ref of the input, e.g. to focus it. */
    inputRef?: Ref<HTMLInputElement>;
    /** Props of the input. */
    inputProps?: Omit<TokenizerInputProps, 'value' | 'defaultValue' | 'disabled' | 'id'>;
    /** Props of the tokenizer (fundamental-react's `tagProps`). */
    tokenizerProps?: Omit<TokenizerProps, 'children' | 'input'>;
    /** Props of the list (`<ul role="listbox">`). */
    listProps?: Omit<ComponentProps<'ul'>, 'children'>;
    /** Props of the popover body around the list. */
    popoverProps?: Omit<PopoverBodyProps, 'children'>;
    /** Element the list or the mobile dialog is rendered into (default `document.body`). */
    container?: PopoverBodyProps['container'];
}

function assignRef<E>(ref: Ref<E> | undefined, node: E | null) {
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
}

/** The list: no background of its own (the options draw it), as fundamental-styles' multi input list. */
const listClassName = 'relative m-0 box-border block min-w-20 list-none overflow-auto p-0 outline-none scrollbar-sap';

/** The dropdown width of fundamental-styles (40rem): the most the list takes from a wider field. */
const DROPDOWN_MAX_WIDTH = 640;

/**
 * Multi-input: a tokenizer field with a list of check box options. Typing filters the list and completes the text;
 * Enter selects the first match (or, with `allowNewTokens`, adds the text as a new token). The focus stays in the
 * input: Down and Up highlight options and Enter toggles the highlighted one. Tokens are removed with their close icon
 * or Backspace. In mobile mode the list opens in a dialog with a select all button.
 *
 * Native props, `className` and `ref` go to the root `<div>`; `aria-label`, `aria-labelledby` and `aria-describedby`
 * go to the input (the first two also name the list).
 *
 * ```tsx
 * <MultiInput aria-label="Fruits" placeholder="Search" dropdownValues={fruits} selected={chosen} onSelectedChange={setChosen} />
 * ```
 */
export function MultiInput<T = unknown, V = unknown>({
    selected: selectedProp,
    defaultSelected,
    onSelectedChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    dropdownValues,
    displayFn = defaultDisplay as (item: T) => string,
    valueFn = defaultValue as (item: T) => V,
    filterFn,
    includes = false,
    highlight = true,
    autoComplete = true,
    renderItem,
    allowNewTokens = false,
    newTokenParseFn = defaultParse as (text: string) => T,
    newTokenValidateFn = defaultValidate,
    placeholder,
    inputId,
    title,
    state,
    disabled = false,
    required = false,
    glyph = 'value-help',
    glyphFont = 'SAP-icons',
    displayAddonButton = true,
    addOnButtonAriaLabel = 'Show options',
    addonIconTitle,
    openDropdownOnAddOnClicked = true,
    buttonFocusable = false,
    maxHeight = '300px',
    fillControlMode = 'at-least',
    bodyMaxWidth = 'none',
    placement = 'bottom',
    showAllButton = true,
    showAllLabel = 'Show All ({count})',
    maxVisibleTokens = 12,
    byline = false,
    mobile = false,
    mobileConfig = DEFAULT_MOBILE_CONFIG,
    closeLabel = 'Close',
    selectAllLabel = 'Select all',
    tokensLabel = 'Selected values',
    onSearchTermChange,
    onAddOnButtonClick,
    onAllItemsSelectedChange,
    actionsRef,
    inputRef,
    inputProps,
    tokenizerProps,
    listProps,
    popoverProps,
    container,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    className,
    ref,
    onBlur,
    ...props
}: MultiInputProps<T, V>) {
    const autoId = useId().replace(/:/g, '');
    const id = `fd-multi-input-${autoId}`;
    const listId = `${id}-list`;
    const dialogInputId = `${id}-dialog-input`;
    const dialogTitleId = `${id}-dialog-title`;
    const optionId = (index: number) => `${id}-option-${index}`;

    const root = useRef<HTMLDivElement | null>(null);
    const field = useRef<HTMLInputElement | null>(null);
    const dialogField = useRef<HTMLInputElement | null>(null);
    const tokenizer = useRef<HTMLDivElement | null>(null);
    const dialogPopup = useRef<HTMLDivElement | null>(null);
    const popoverBody = useRef<HTMLDivElement | null>(null);

    // selection: the committed value, and a draft while an approve-mode dialog is open
    const [ownSelected, setOwnSelected] = useState<V[]>(() => defaultSelected ?? NONE);
    const committed = selectedProp ?? ownSelected;
    const [draft, setDraft] = useState<V[] | null>(null);
    const selected = draft ?? committed;
    const selectedRef = useRef(selected);
    selectedRef.current = selected;

    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const open = openProp ?? ownOpen;
    const openRef = useRef(open);
    openRef.current = open;

    /** The search text, and the input text (the search plus its completion). */
    const [searchTerm, setSearchTerm] = useState('');
    const [inputText, setInputText] = useState('');
    const searchRef = useRef(searchTerm);
    const completion = useRef<{ typed: string; label: string } | null>(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [onlySelected, setOnlySelected] = useState(false);
    const [showAllTokens, setShowAllTokens] = useState(false);
    /** Items added as new tokens. */
    const [addedItems, setAddedItems] = useState<T[]>([]);
    const anchor = useRef<number | null>(null);

    const approveMode = mobile && !!mobileConfig.approveButtonText;
    const dialogOpen = mobile && open;

    const allItems = useMemo(() => [...(dropdownValues ?? []), ...addedItems], [dropdownValues, addedItems]);
    const filteredItems = useMemo(() => {
        const term = searchTerm.trim();
        if (!term) return allItems;
        if (filterFn) return filterFn(allItems, term);
        const lower = term.toLocaleLowerCase();
        return allItems.filter((item) => {
            if (item == null) return false;
            const label = displayFn(item).toLocaleLowerCase();
            return includes ? label.includes(lower) : label.startsWith(lower);
        });
    }, [allItems, searchTerm, filterFn, displayFn, includes]);
    const selectedSet = useMemo(() => new Set(selected), [selected]);
    const toOption = (item: T, value: V = valueFn(item)): OptionView<T, V> => ({
        id: String(value),
        item,
        value,
        label: displayFn(item),
        selected: selectedSet.has(value)
    });
    const filteredOptions = filteredItems.map((item) => toOption(item));
    const displayedOptions = onlySelected ? filteredOptions.filter((o) => o.selected) : filteredOptions;
    /** Options of the selected values, in selection order. */
    const selectedOptions = selected.map((value) => {
        const item = allItems.find((i) => i != null && Object.is(valueFn(i), value)) ?? (value as unknown as T);
        return toOption(item, value);
    });
    const renderedTokens =
        showAllTokens || selectedOptions.length <= maxVisibleTokens
            ? selectedOptions
            : selectedOptions.slice(0, maxVisibleTokens);
    const hiddenCount = selectedOptions.length - renderedTokens.length;
    const allSelected = displayedOptions.length > 0 && displayedOptions.every((o) => o.selected);
    const listShown = !mobile && open && displayedOptions.length > 0;

    // allItemsSelectedChange: the first value and every change
    const allSelectedRef = useRef<boolean | null>(null);
    const onAllRef = useRef(onAllItemsSelectedChange);
    onAllRef.current = onAllItemsSelectedChange;
    useEffect(() => {
        if (allSelectedRef.current === allSelected) return;
        allSelectedRef.current = allSelected;
        onAllRef.current?.(allSelected);
    }, [allSelected]);

    // keep the highlighted option visible
    useEffect(() => {
        if (activeIndex < 0) return;
        document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: 'nearest' });
    }, [activeIndex]);

    // the typed text completed with the first match, the completion selected (after every render: typing over a
    // completion can end with the same text)
    useLayoutEffect(() => {
        const done = completion.current;
        const el = field.current;
        if (!done || !el || el.value !== done.label) return;
        completion.current = null;
        el.setSelectionRange(done.typed.length, done.label.length);
    });

    const setOpen = (next: boolean) => {
        if (openRef.current === next) return;
        openRef.current = next;
        if (openProp === undefined) setOwnOpen(next);
        onOpenChange?.(next);
    };

    const setSearch = (term: string) => {
        setInputText(term);
        if (term === searchRef.current) return;
        searchRef.current = term;
        setSearchTerm(term);
        onSearchTermChange?.(term);
        anchor.current = null;
    };

    const commit = (values: V[]) => {
        if (selectedProp === undefined) setOwnSelected(values);
        onSelectedChange?.(values);
    };

    const setSelected = (values: V[]) => {
        selectedRef.current = values;
        if (approveMode && openRef.current) setDraft(values);
        else commit(values);
    };

    const focusField = () => (dialogOpen ? dialogField.current : field.current)?.focus();

    const openList = () => {
        if (disabled || openRef.current) return;
        setOpen(true);
    };

    const close = () => {
        if (!openRef.current) return;
        setOpen(false);
        setActiveIndex(-1);
        setOnlySelected(false);
        setSearch('');
        // the dialog gives the focus back to the field (its finalFocus)
        if (mobile) setDraft(null);
    };

    const selectAllItems = (selectAll: boolean) => {
        if (!selectAll) {
            setSelected([]);
            return;
        }
        const values = new Set(selectedRef.current);
        allItems.forEach((item) => values.add(valueFn(item)));
        setSelected([...values]);
    };

    useImperativeHandle(actionsRef, () => ({ open: openList, close, selectAllItems }));

    // a disabled multi-input closes
    useEffect(() => {
        if (disabled) close();
    }, [disabled]);

    /** Selects or deselects an option. */
    const toggle = (option: OptionView<T, V>, select = !option.selected) => {
        const values = selectedRef.current.filter((v) => !Object.is(v, option.value));
        const next = select ? [...values, option.value] : values;
        setSelected(next);
        if (!next.length) focusField();
    };

    const onInput = (event: ChangeEvent<HTMLInputElement>, dialog: boolean) => {
        const typed = event.target.value;
        setSearch(typed);
        setActiveIndex(-1);
        setOnlySelected(false);
        if (typed && !dialog) openList();
        const inputType = (event.nativeEvent as InputEvent).inputType;
        if (autoComplete && !includes && !mobile && typed && inputType?.startsWith('insert')) {
            const lower = typed.toLocaleLowerCase();
            const match = allItems.find(
                (item) => item != null && displayFn(item).toLocaleLowerCase().startsWith(lower)
            );
            if (match) {
                const label = displayFn(match);
                completion.current = { typed, label };
                setInputText(label);
            }
        }
    };

    /** Enter selects the first match, or adds the text as a new token. */
    const submit = (el: HTMLInputElement) => {
        const text = el.value.trim() ? el.value : searchRef.current;
        if (!text) return;
        const first = filteredItems[0];
        if (first !== undefined && autoComplete) {
            const option = toOption(first);
            if (!option.selected) toggle(option, true);
        } else if (allowNewTokens && newTokenValidateFn(text)) {
            const item = newTokenParseFn(text);
            setAddedItems((items) => [...items, item]);
            const value = valueFn(item);
            if (!selectedRef.current.some((v) => Object.is(v, value))) setSelected([...selectedRef.current, value]);
        } else {
            return;
        }
        setSearch('');
        if (!mobile) close();
    };

    const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement | HTMLUListElement>, dialog: boolean) => {
        if (disabled) return;
        const key = event.key;
        if (mobile && !dialog) {
            if (
                key === 'Enter' ||
                key === 'ArrowDown' ||
                key === 'ArrowUp' ||
                (key.length === 1 && !event.ctrlKey && !event.metaKey)
            ) {
                event.preventDefault();
                openList();
            }
            return;
        }
        const shown = dialog || listShown;
        switch (key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!openRef.current) openList();
                else if (shown && displayedOptions.length)
                    setActiveIndex(Math.min(activeIndex + 1, displayedOptions.length - 1));
                return;
            case 'ArrowUp':
                event.preventDefault();
                if (event.altKey && !dialog) close();
                else if (shown) setActiveIndex(Math.max(activeIndex - 1, -1));
                else openList();
                return;
            case 'Enter': {
                event.preventDefault();
                const active = displayedOptions[activeIndex];
                if (shown && active) {
                    toggle(active);
                    return;
                }
                const el = dialog ? dialogField.current : field.current;
                if (el) submit(el);
                return;
            }
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

    const onOptionClick = (option: OptionView<T, V>, index: number, event: ReactMouseEvent<HTMLLIElement>) => {
        const select = !option.selected;
        if (event.shiftKey && anchor.current !== null) {
            const [from, to] = [Math.min(anchor.current, index), Math.max(anchor.current, index)];
            const range = displayedOptions.slice(from, to + 1);
            const values = selectedRef.current.filter((v) => !range.some((o) => Object.is(o.value, v)));
            setSelected(select ? [...values, ...range.map((o) => o.value)] : values);
        } else {
            toggle(option, select);
        }
        anchor.current = index;
        setActiveIndex(index);
    };

    const onAddOnClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
        onAddOnButtonClick?.(event);
        if (mobile) {
            openList();
            return;
        }
        if (openDropdownOnAddOnClicked && !openRef.current) {
            setSearch('');
            openList();
        } else close();
        field.current?.focus();
    };

    /** The "n more" link lists only the selected items. */
    const onMoreClick = () => {
        setShowAllTokens(true);
        setOnlySelected(true);
        setSearch('');
        openList();
        field.current?.focus();
    };

    const showAll = () => {
        setSearch('');
        focusField();
    };

    const finishDialog = () => {
        setOpen(false);
        setDraft(null);
        setActiveIndex(-1);
        setOnlySelected(false);
        setSearch('');
    };
    const dialogApprove = () => {
        if (draft) commit(draft);
        finishDialog();
    };
    const dialogDismiss = () => finishDialog();

    /** Focus moving out of the multi-input (and its list and dialog) collapses the tokens. */
    const handleBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
        onBlur?.(event);
        const next = event.relatedTarget as Node | null;
        if (
            next &&
            (root.current?.contains(next) ||
                dialogPopup.current?.contains(next) ||
                popoverBody.current?.contains(next) ||
                (next as Element).closest?.('[data-tokenizer-popover]'))
        )
            return;
        setShowAllTokens(false);
    };

    const popoverMaxWidth =
        bodyMaxWidth === 'none'
            ? DROPDOWN_MAX_WIDTH
            : typeof bodyMaxWidth === 'number'
              ? bodyMaxWidth
              : listShown
                ? (root.current?.getBoundingClientRect().width ?? null)
                : null;
    const dialogLabelledBy = ariaLabelledBy || (mobileConfig.title ? dialogTitleId : undefined);

    const control = (dialog: boolean) => {
        const expanded = mobile && !dialog ? open : dialog || listShown;
        const ownInputRef = dialog ? dialogField : field;
        return (
            <Tokenizer
                {...tokenizerProps}
                ref={(node) => {
                    if (!dialog) tokenizer.current = node;
                    assignRef(tokenizerProps?.ref, node);
                }}
                state={state}
                disabled={disabled}
                open={open}
                showOverflowPopover={false}
                externalHiddenCount={hiddenCount}
                glyph={displayAddonButton && !dialog ? glyph : null}
                glyphFont={glyphFont}
                glyphAriaLabel={addOnButtonAriaLabel}
                glyphTitle={addonIconTitle}
                glyphHasPopup={mobile ? 'dialog' : 'listbox'}
                glyphExpanded={open}
                buttonFocusable={buttonFocusable}
                tokenizerLabel={tokensLabel}
                className={cn(
                    // the addon button looks like an input group button (fundamental-styles' multi input is an
                    // input group around a tokenizer): no border, the field hover shadow, and in high contrast as
                    // high as the field, over its border
                    INPUT_GROUP_BUTTON_VARS,
                    STATE_BUTTON_VARS[state ?? 'default'],
                    'hc:[&>div>button]:-my-(--sapField_BorderWidth)',
                    (!state || state === 'default') && '[&>div:hover]:[box-shadow:var(--sapField_Hover_Shadow)]',
                    glyph === 'value-help' && 'rtl:[&>div>button_[data-glyph]]:-scale-x-100',
                    tokenizerProps?.className
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
                        value={inputText}
                        disabled={disabled}
                        placeholder={selectedOptions.length ? undefined : placeholder || undefined}
                        aria-label={dialog ? ariaLabel || placeholder || undefined : ariaLabel}
                        aria-labelledby={dialog ? dialogLabelledBy : ariaLabelledBy}
                        aria-describedby={dialog ? undefined : ariaDescribedBy}
                        aria-required={required || undefined}
                        aria-invalid={state === 'error' || undefined}
                        aria-autocomplete={autoComplete && !includes ? 'both' : 'list'}
                        aria-haspopup={mobile && !dialog ? 'dialog' : 'listbox'}
                        aria-expanded={expanded}
                        aria-controls={open && (dialog || mobile || listShown) ? listId : undefined}
                        aria-activedescendant={
                            (dialog || listShown) && activeIndex >= 0 ? optionId(activeIndex) : undefined
                        }
                        title={title || undefined}
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
                {renderedTokens.map((option) => (
                    <Token
                        key={option.id}
                        disabled={disabled}
                        title={option.label}
                        onCloseClick={() => toggle(option, false)}
                        onRemove={() => toggle(option, false)}
                    >
                        {option.label}
                    </Token>
                ))}
            </Tokenizer>
        );
    };

    const highlightParts = (label: string): [string, string, string] => {
        const term = searchTerm.trim();
        if (!highlight || !term) return [label, '', ''];
        const at = label.toLocaleLowerCase().indexOf(term.toLocaleLowerCase());
        if (at < 0) return [label, '', ''];
        return [label.slice(0, at), label.slice(at, at + term.length), label.slice(at + term.length)];
    };

    const list = (dialog: boolean) => (
        <div className="flex w-full min-w-0 flex-col">
            <ul
                role="listbox"
                aria-multiselectable="true"
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                {...listProps}
                id={listId}
                tabIndex={dialog ? 0 : undefined}
                aria-activedescendant={dialog && activeIndex >= 0 ? optionId(activeIndex) : undefined}
                style={{ maxHeight: dialog ? undefined : maxHeight, ...listProps?.style }}
                className={cn(
                    listClassName,
                    mobile ? 'w-full' : 'w-full max-w-[40rem] rounded-[inherit]',
                    listProps?.className
                )}
                onMouseDown={(event) => {
                    listProps?.onMouseDown?.(event);
                    event.preventDefault();
                }}
                onKeyDown={(event) => {
                    listProps?.onKeyDown?.(event);
                    // keys on the list in the mobile dialog work as in its input
                    if (dialog) onKeyDown(event, true);
                }}
            >
                {displayedOptions.map((option, index) => {
                    const parts = highlightParts(option.label);
                    return (
                        <li
                            key={option.id}
                            role="option"
                            id={optionId(index)}
                            aria-selected={option.selected}
                            data-active={index === activeIndex ? '' : undefined}
                            className={cn(
                                LIST_DROPDOWN_ITEM,
                                // a list item of fundamental-styles' multi input list: 2.75rem high in cozy, plus the
                                // selection line of a selected item
                                'min-h-11 gap-x-2 ps-3 pe-4 aria-selected:min-h-[2.8125rem] compact:aria-selected:min-h-[2.0625rem]',
                                byline && 'py-2'
                            )}
                            onClick={(event) => onOptionClick(option, index, event)}
                        >
                            <span
                                aria-hidden="true"
                                className={LIST_DROPDOWN_CHECK}
                                data-glyph={option.selected ? LIST_CHECK_GLYPH : ''}
                            />
                            {renderItem ? (
                                renderItem(option.item)
                            ) : (
                                <span className="min-h-4 min-w-0 flex-auto truncate compact:min-h-3.5">
                                    {parts[0]}
                                    <b className="font-bold">{parts[1]}</b>
                                    {parts[2]}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
            {showAllButton && !onlySelected && displayedOptions.length < allItems.length && (
                <div className="flex justify-end bg-sap-list-background px-4 py-2 font-sap-font-family text-sap-font-size">
                    <Link
                        href="#"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                            event.preventDefault();
                            showAll();
                        }}
                    >
                        {showAllLabel.replace('{count}', String(allItems.length))}
                    </Link>
                </div>
            )}
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
                    placement={placement === 'top' ? 'top-start' : 'bottom-start'}
                    open={listShown}
                    triggers={NONE}
                    anchor={tokenizer}
                    noArrow
                    disabled={disabled}
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
                        close();
                    }}
                >
                    {control(false)}
                    <PopoverBody
                        role="presentation"
                        container={container}
                        {...popoverProps}
                        ref={(node) => {
                            popoverBody.current = node;
                            assignRef(popoverProps?.ref, node);
                        }}
                    >
                        {list(false)}
                    </PopoverBody>
                </Popover>
            )}
            {mobile && (
                <Dialog
                    open={dialogOpen}
                    escKeyCloseable={false}
                    onOpenChange={(next) => {
                        if (!next) dialogDismiss();
                    }}
                >
                    <DialogPopup
                        ref={dialogPopup}
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
                                    <BarElement>
                                        <Button
                                            glyph="multiselect-all"
                                            variant={allSelected ? 'emphasized' : 'transparent'}
                                            aria-label={selectAllLabel}
                                            aria-pressed={allSelected}
                                            onClick={() => selectAllItems(!allSelected)}
                                        />
                                    </BarElement>
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
