/*
 * Port of fundamental-react (SearchInput) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Autocomplete } from '@base-ui/react/autocomplete';
import {
    useCallback,
    useId,
    useRef,
    useState,
    type ChangeEvent,
    type ComponentProps,
    type CSSProperties,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/ui/button/button';
import { type FormState } from '@/ui/input/input';
import { InputGroup, InputGroupAddon, InputGroupInput, type InputGroupProps } from '@/ui/input-group/input-group';
import { LIST_DROPDOWN_ITEM, ListMessage } from '@/ui/list/list';
import { popoverSurfaceVariants } from '@/ui/popover/popover';

/** A suggestion of a search input. */
export interface SearchInputItem {
    /** Text of the suggestion, put in the input when it is chosen. */
    text: string;
    /** Called when the suggestion is chosen. */
    callback?: () => void;
}

/** Why the value of a search input changed, and the suggestions that match it. */
export interface SearchInputChangeDetails {
    /** The suggestions of `searchList` that match the new value. */
    matches: SearchInputItem[];
    /** `input-change` (typing), `item-press` (a suggestion), `clear-press` (the clear button), `escape-key`, ... */
    reason: string;
    event: Event | undefined;
}

export interface SearchInputProps extends Omit<
    ComponentProps<'div'>,
    'defaultValue' | 'onChange' | 'onSelect' | 'children' | 'placeholder'
> {
    /** The suggestions; without them the field has no popup. */
    searchList?: SearchInputItem[] | null;
    /** Matches the text anywhere in the suggestions instead of at their start. */
    subStringSearch?: boolean;
    /** The text, for a controlled search input (with `onValueChange`). */
    value?: string;
    /** The initial text, for an uncontrolled search input. */
    defaultValue?: string;
    /** Called with the new text on every change, with the matching suggestions. */
    onValueChange?: (value: string, details: SearchInputChangeDetails) => void;
    /** Called with the text on Enter (when no suggestion is highlighted) and on the search button. */
    onSearch?: (value: string) => void;
    /** Called when a suggestion is chosen, after its `callback`. */
    onItemSelect?: (item: SearchInputItem, event: Event | MouseEvent | KeyboardEvent | undefined) => void;
    /** Whether the suggestions are open (controlled). */
    open?: boolean;
    /** Called when the suggestions open or close. */
    onOpenChange?: (open: boolean) => void;
    placeholder?: string;
    /** Id of the input, for an external `<label htmlFor>`. */
    inputId?: string;
    name?: string;
    disabled?: boolean;
    /** The text cannot be changed; no buttons and no suggestions. */
    readOnly?: boolean;
    /** Value state of the field. */
    state?: FormState | null;
    /** Text of the value state, shown above the suggestions and announced with the input. */
    stateMessage?: ReactNode;
    /** Renders no search button. */
    noSearchButton?: boolean;
    /** Shows a clear button while there is text (default true). */
    showClearButton?: boolean;
    /** Accessible name of the search button. */
    searchButtonLabel?: string;
    /** Accessible name of the clear button. */
    clearButtonLabel?: string;
    /** Shown in the list when no suggestion matches. */
    noResultsText?: ReactNode;
    /** Announced count of the suggestions; `{count}` is replaced. */
    resultsLabel?: string;
    /** Maximum height of the suggestions. */
    maxHeight?: string;
    /** Element the suggestions are rendered into (default `document.body`). */
    container?: Autocomplete.Portal.Props['container'];
    /** Props of the input. */
    inputProps?: Omit<ComponentProps<'input'>, 'value' | 'defaultValue' | 'disabled' | 'readOnly'>;
    /** Ref of the input, e.g. to focus it. */
    inputRef?: Ref<HTMLInputElement>;
    /** Props of the input group around the input and buttons. */
    inputGroupProps?: Omit<InputGroupProps, 'children' | 'state' | 'disabled' | 'readOnly'>;
    /** Props of the search button. */
    searchButtonProps?: Omit<ButtonProps, 'onClick'> & { onClick?: (event: MouseEvent<HTMLButtonElement>) => void };
    /** Props of the list of suggestions. */
    listProps?: Omit<Autocomplete.List.Props, 'children' | 'render' | 'className'> & { className?: string };
    /** Props of the popup around the list. */
    popoverProps?: Omit<Autocomplete.Popup.Props, 'children' | 'render' | 'className' | 'style'> & {
        className?: string;
        style?: CSSProperties;
    };
}

/** Bolds the search text in a suggestion. */
function highlight(text: string, term: string): ReactNode {
    if (!term) return text;
    const at = text.toLocaleLowerCase().indexOf(term.toLocaleLowerCase());
    if (at < 0) return text;
    return (
        <>
            {text.slice(0, at)}
            <b className="font-bold">{text.slice(at, at + term.length)}</b>
            {text.slice(at + term.length)}
        </>
    );
}

/** Whether a suggestion matches the search text: at its start, or anywhere with `subString`. */
function matches(item: SearchInputItem, term: string, subString: boolean): boolean {
    const text = item.text.toLocaleLowerCase();
    const query = term.toLocaleLowerCase();
    return subString ? text.includes(query) : text.startsWith(query);
}

/**
 * Search input: a search field with a clear and a search button that suggests matching entries of `searchList` while
 * typing, on Base UI's Autocomplete. The input is a combobox (WAI-ARIA 1.2) and keeps the focus: Down and Up
 * highlight suggestions, Enter chooses the highlighted one or searches, Escape closes the suggestions (and clears the
 * text when they are closed), and a click in the input opens or closes them. The search button and Enter call
 * `onSearch` with the text.
 *
 * Native props, `className` and `ref` go to the root `<div>`; `aria-label`, `aria-labelledby` and `aria-describedby`
 * go to the input. Compact density is `data-density="compact"` on the field or an ancestor.
 *
 * ```tsx
 * <SearchInput aria-label="Fruit" placeholder="Search" searchList={[{ text: 'apple' }, { text: 'banana' }]} onSearch={find} />
 * ```
 */
export function SearchInput({
    searchList,
    subStringSearch = false,
    value: valueProp,
    defaultValue,
    onValueChange,
    onSearch,
    onItemSelect,
    open: openProp,
    onOpenChange,
    placeholder,
    inputId: inputIdProp,
    name,
    disabled = false,
    readOnly = false,
    state,
    stateMessage,
    noSearchButton = false,
    showClearButton = true,
    searchButtonLabel = 'Search',
    clearButtonLabel = 'Clear',
    noResultsText = 'No result',
    resultsLabel = '{count} result list items',
    maxHeight = '50vh',
    container,
    inputProps,
    inputRef,
    inputGroupProps,
    searchButtonProps,
    listProps,
    popoverProps,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
}: SearchInputProps) {
    const autoId = useId();
    const inputId = inputIdProp ?? `fd-search-input-${autoId}`;
    const messageId = `${inputId}-message`;
    const stateValue = state ?? 'default';
    const showMessage = !!stateMessage && stateValue !== 'default';

    const [ownValue, setOwnValue] = useState(defaultValue ?? '');
    const value = valueProp ?? ownValue;
    const [ownOpen, setOwnOpen] = useState(false);
    const hasList = !!searchList && !disabled && !readOnly;
    const open = hasList && (openProp ?? ownOpen);
    const highlighted = useRef<SearchInputItem | undefined>(undefined);

    const items = searchList ?? [];
    const found = value ? items.filter((item) => matches(item, value, subStringSearch)) : items;

    const setOpen = (next: boolean) => {
        if (next && !hasList) return;
        setOwnOpen(next);
        if (next !== open) onOpenChange?.(next);
    };

    const setValue = (next: string, reason: string, event: Event | undefined) => {
        setOwnValue(next);
        onValueChange?.(next, {
            matches: next ? items.filter((item) => matches(item, next, subStringSearch)) : items,
            reason,
            event
        });
    };

    const choose = (item: SearchInputItem, event: Event | MouseEvent | KeyboardEvent | undefined) => {
        item.callback?.();
        onItemSelect?.(item, event);
    };

    const { className: listClassName, ...restListProps } = listProps ?? {};
    const { className: popupClassName, style: popupStyle, ...restPopoverProps } = popoverProps ?? {};
    const {
        className: searchButtonClassName,
        onClick: onSearchButtonClick,
        ...restSearchButtonProps
    } = searchButtonProps ?? {};
    const {
        onKeyDown: onInputKeyDown,
        onClick: onInputClick,
        onChange: onInputChange,
        ref: inputPropsRef,
        ...restInputProps
    } = inputProps ?? {};
    const input = useRef<HTMLInputElement | null>(null);
    const setInput = useCallback(
        (node: HTMLInputElement | null) => {
            input.current = node;
            for (const ref of [inputRef, inputPropsRef]) {
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
            }
        },
        [inputRef, inputPropsRef]
    );

    const describedBy = [ariaDescribedBy, showMessage && messageId].filter(Boolean).join(' ');

    return (
        <div {...props} className={cn('block max-w-full', className)}>
            <Autocomplete.Root
                items={items}
                filteredItems={found}
                itemToStringValue={(item: SearchInputItem) => item.text}
                value={value}
                onValueChange={(next, details) => {
                    setValue(next, details.reason, details.event);
                }}
                open={open}
                onOpenChange={(next, details) => {
                    // the input click toggles the list itself
                    if (details.reason === 'input-press') return;
                    setOpen(next);
                }}
                onItemHighlighted={(item) => {
                    highlighted.current = item;
                }}
                highlightItemOnHover={false}
                disabled={disabled}
                readOnly={readOnly}
            >
                <Autocomplete.InputGroup
                    render={
                        <InputGroup {...inputGroupProps} state={stateValue} disabled={disabled} readOnly={readOnly} />
                    }
                >
                    <InputGroupInput
                        {...restInputProps}
                        {...(hasList
                            ? { render: <Autocomplete.Input />, onChange: onInputChange }
                            : {
                                  // without suggestions: a plain search field
                                  role: 'searchbox',
                                  value,
                                  onChange: (event: ChangeEvent<HTMLInputElement>) => {
                                      onInputChange?.(event);
                                      setValue(event.currentTarget.value, 'input-change', event.nativeEvent);
                                  }
                              })}
                        ref={setInput}
                        id={inputId}
                        type="text"
                        name={name}
                        placeholder={placeholder}
                        autoComplete="off"
                        aria-label={ariaLabel}
                        aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
                        aria-describedby={describedBy || undefined}
                        onClick={(event) => {
                            onInputClick?.(event);
                            if (hasList) setOpen(!open);
                        }}
                        onKeyDown={(event) => {
                            onInputKeyDown?.(event);
                            if (event.defaultPrevented || disabled || readOnly) return;
                            if (event.key === 'Enter') {
                                // Base UI chooses a highlighted suggestion (its click)
                                if (open && highlighted.current) return;
                                onSearch?.(event.currentTarget.value);
                                setOpen(false);
                            } else if (event.key === 'Escape' && !open && value) {
                                // with the suggestions closed, Escape clears the text (WAI-ARIA combobox)
                                event.preventDefault();
                                setValue('', 'escape-key', event.nativeEvent);
                            }
                        }}
                    />
                    {showClearButton && value && !readOnly && (
                        <InputGroupAddon button>
                            <Button
                                variant="transparent"
                                glyph="decline"
                                aria-label={clearButtonLabel}
                                title={clearButtonLabel}
                                disabled={disabled}
                                tabIndex={open ? -1 : undefined}
                                onClick={(event) => {
                                    setValue('', 'clear-press', event.nativeEvent);
                                    input.current?.focus();
                                }}
                            />
                        </InputGroupAddon>
                    )}
                    {!noSearchButton && !readOnly && (
                        <InputGroupAddon button>
                            <Button
                                variant="transparent"
                                glyph="search"
                                aria-label={searchButtonLabel}
                                title={searchButtonLabel}
                                {...restSearchButtonProps}
                                disabled={disabled}
                                tabIndex={open ? -1 : restSearchButtonProps.tabIndex}
                                className={searchButtonClassName}
                                onClick={(event) => {
                                    onSearchButtonClick?.(event);
                                    onSearch?.(value);
                                    setOpen(false);
                                }}
                            />
                        </InputGroupAddon>
                    )}
                </Autocomplete.InputGroup>
                {showMessage && (
                    <span id={messageId} className="sr-only-sap">
                        {stateMessage}
                    </span>
                )}
                {hasList && (
                    <Autocomplete.Portal container={container}>
                        <Autocomplete.Positioner side="bottom" align="start" className="z-[1000]">
                            <Autocomplete.Popup
                                {...restPopoverProps}
                                className={cn(
                                    popoverSurfaceVariants({ arrow: false }),
                                    // at least as wide as the field, up to 40rem (fundamental-ngx's 640px dropdown width)
                                    'min-w-[min(var(--anchor-width),40rem)] max-w-[40rem] flex-col overflow-hidden',
                                    popupClassName
                                )}
                                style={{ maxHeight, ...popupStyle }}
                            >
                                <div className="scrollbar-sap relative w-full max-h-full max-w-full overflow-auto rounded-[inherit]">
                                    {showMessage && (
                                        <ListMessage
                                            render={<div />}
                                            type={stateValue}
                                            aria-hidden="true"
                                            // stays above the suggestions while they scroll
                                            className="sticky z-[1] block"
                                        >
                                            {stateMessage}
                                        </ListMessage>
                                    )}
                                    <Autocomplete.Empty className="empty:hidden">
                                        <div
                                            className={cn(
                                                LIST_DROPDOWN_ITEM,
                                                'cursor-default hover:[--li-bg:var(--sapList_Background)] active:[--li-bg:var(--sapList_Background)] active:text-sap-list-text-color'
                                            )}
                                        >
                                            {noResultsText}
                                        </div>
                                    </Autocomplete.Empty>
                                    <Autocomplete.List
                                        render={<ul />}
                                        {...restListProps}
                                        aria-label={ariaLabel}
                                        aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
                                        className={cn(
                                            'relative m-0 box-border block w-full min-w-20 list-none p-0 outline-none empty:hidden',
                                            listClassName
                                        )}
                                    >
                                        {(item: SearchInputItem, index: number) => (
                                            <Autocomplete.Item
                                                key={`${item.text}-${index}`}
                                                value={item}
                                                index={index}
                                                onClick={(event) => choose(item, event)}
                                                render={(itemProps, itemState) => (
                                                    <li
                                                        {...itemProps}
                                                        data-active={itemState.highlighted ? '' : undefined}
                                                    />
                                                )}
                                                className={cn(LIST_DROPDOWN_ITEM)}
                                            >
                                                <span className="min-w-0 flex-auto truncate">
                                                    {highlight(item.text, value)}
                                                </span>
                                            </Autocomplete.Item>
                                        )}
                                    </Autocomplete.List>
                                </div>
                            </Autocomplete.Popup>
                        </Autocomplete.Positioner>
                    </Autocomplete.Portal>
                )}
                {hasList && (
                    <Autocomplete.Status className="sr-only-sap">
                        {open ? resultsLabel.replace('{count}', `${found.length}`) : ''}
                    </Autocomplete.Status>
                )}
            </Autocomplete.Root>
        </div>
    );
}
