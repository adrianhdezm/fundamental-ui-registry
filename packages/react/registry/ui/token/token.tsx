/*
 * Port of fundamental-react (Token) and @fundamental-ngx/core (token) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Input as BaseInput } from '@base-ui/react/input';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type FocusEvent as ReactFocusEvent,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button/button';
import { Icon, type IconFont } from '@/ui/icon/icon';
import { fieldStates, type FormState } from '@/ui/input/input';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';

/** What a token tells its tokenizer; the methods read the token's latest props. */
interface TokenEntry {
    id: string;
    element: HTMLElement;
    isSelected(): boolean;
    setSelected(selected: boolean): void;
    isDisabled(): boolean;
    isReadOnly(): boolean;
    text(): string;
    /** The close icon (or a remove button) was clicked: emits `onCloseClick` unless disabled or read-only. */
    closeClick(event: ReactMouseEvent<HTMLElement>): void;
    /** Backspace or Delete removed the token: emits `onCloseClick` without an event. */
    close(): void;
    remove(): void;
}

interface TokenizerContextValue {
    register(entry: TokenEntry): () => void;
    /** Ids of the tokens in DOM order. */
    order: readonly string[];
    tokenClick(entry: TokenEntry, event: ReactMouseEvent<HTMLElement>): void;
}

const TokenizerContext = createContext<TokenizerContextValue | null>(null);

const closeClassName =
    'm-0 box-border inline-flex h-(--tk-h) w-(--tk-close-w) min-w-(--tk-close-w) shrink-0 cursor-pointer items-center justify-center bg-transparent p-0 py-(--tk-close-py) px-(--tk-close-px) text-sap-font-small-size leading-5 text-(--tk-close)';

export interface TokenProps extends ComponentProps<'span'> {
    /** Selected tokens are removed together with Backspace or Delete (controlled). */
    selected?: boolean;
    /** Initial selection (uncontrolled). */
    defaultSelected?: boolean;
    /** Called when a click or a key in the tokenizer selects or unselects the token. */
    onSelectedChange?: (selected: boolean) => void;
    disabled?: boolean;
    /** No close icon, and the read-only look. */
    readOnly?: boolean;
    /**
     * The close icon was clicked (with the click event), or Backspace/Delete removed the token in a tokenizer
     * (without an event). Remove the token here.
     */
    onCloseClick?: (event?: ReactMouseEvent<HTMLElement>) => void;
    /** Called by the tokenizer's `removeSelectedTokens()`. */
    onRemove?: () => void;
    /** The token was clicked, or Enter or Space was pressed on it. */
    onTokenClick?: (event: ReactMouseEvent<HTMLElement> | ReactKeyboardEvent<HTMLElement>) => void;
    onTokenKeyDown?: (event: ReactKeyboardEvent<HTMLElement>) => void;
    /** Called with `true` when the token gets the focus and `false` when it loses it. */
    onFocusChange?: (focused: boolean) => void;
}

/**
 * Token: a removable item such as a chosen value, usually in a `Tokenizer`. Click and Space select it, the close
 * icon (or Backspace and Delete in a tokenizer) removes it. It is an `option` described as a token, so put
 * standalone tokens in a `role="listbox"` element.
 *
 * ```tsx
 * <Token onCloseClick={() => remove(value)}>{value}</Token>
 * ```
 */
export function Token({
    selected: selectedProp,
    defaultSelected = false,
    onSelectedChange,
    disabled = false,
    readOnly = false,
    onCloseClick,
    onRemove,
    onTokenClick,
    onTokenKeyDown,
    onFocusChange,
    'aria-roledescription': ariaRoleDescription = 'token',
    className,
    children,
    ref,
    onClick,
    onKeyDown,
    onFocus,
    onBlur,
    ...props
}: TokenProps) {
    const tokenizer = useContext(TokenizerContext);
    const id = useId();
    const element = useRef<HTMLSpanElement | null>(null);
    const [ownSelected, setOwnSelected] = useState(defaultSelected);
    const selected = selectedProp ?? ownSelected;

    // the latest props, for the tokenizer
    const latest = useRef({ selected, selectedProp, disabled, readOnly, onSelectedChange, onCloseClick, onRemove });
    latest.current = { selected, selectedProp, disabled, readOnly, onSelectedChange, onCloseClick, onRemove };

    const entry = useMemo<Omit<TokenEntry, 'element'>>(
        () => ({
            id,
            isSelected: () => latest.current.selected,
            setSelected: (next) => {
                const current = latest.current;
                if (next === current.selected) return;
                // the next read sees the new value before React renders
                current.selected = next;
                if (current.selectedProp === undefined) setOwnSelected(next);
                current.onSelectedChange?.(next);
            },
            isDisabled: () => latest.current.disabled,
            isReadOnly: () => latest.current.readOnly,
            text: () => element.current?.textContent?.trim() ?? '',
            closeClick: (event) => {
                event.stopPropagation();
                if (!latest.current.disabled && !latest.current.readOnly) latest.current.onCloseClick?.(event);
            },
            close: () => latest.current.onCloseClick?.(undefined),
            remove: () => latest.current.onRemove?.()
        }),
        [id]
    );
    const register = tokenizer?.register;
    useLayoutEffect(() => {
        if (!register || !element.current) return;
        return register({ ...entry, element: element.current });
    }, [register, entry]);

    const index = tokenizer ? tokenizer.order.indexOf(id) : -1;
    const active = selected && !readOnly;

    return (
        <span
            role="option"
            tabIndex={tokenizer ? -1 : 0}
            aria-selected={selected}
            aria-disabled={disabled || undefined}
            aria-setsize={index < 0 ? undefined : tokenizer!.order.length}
            aria-posinset={index < 0 ? undefined : index + 1}
            {...props}
            aria-roledescription={ariaRoleDescription}
            data-token=""
            ref={(node) => {
                element.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            className={cn(
                'relative m-0 box-border inline-flex h-(--tk-h) max-w-full min-w-(--tk-min-w) shrink-0 cursor-default items-center justify-center p-0 ps-(--tk-ps) text-center whitespace-nowrap outline-none',
                'font-sap-font-family text-sap-font-size leading-6 text-(--tk-fg) rounded-[0.375rem] hc:rounded-[0.25rem] bg-(--tk-bg) border-width-sap-button-border-width border-solid border-(--tk-bc)',
                '[--tk-h:1.625rem] [--tk-min-w:3.625rem] [--tk-ps:0.3125rem] [--tk-close-w:1.75rem] [--tk-close-px:0.5rem] [--tk-close-py:0.25rem] [--tk-close:var(--sapContent_IconColor)]',
                'compact:[--tk-h:1.25rem] compact:[--tk-min-w:3rem] compact:[--tk-ps:0.25rem] compact:[--tk-close-w:1.25rem] compact:[--tk-close-px:0.25rem] compact:[--tk-close-py:0.125rem] compact:leading-[1.125rem]',
                '[--tk-fg:var(--sapTextColor)] [--tk-bg:var(--sapButton_TokenBackground)] [--tk-bc:var(--sapButton_TokenBorderColor)]',
                'hover:[--tk-bg:var(--sapButton_Hover_Background)]',
                // focus: an outer frame, the token corners grow to follow it
                'focus:outline-sap focus:outline-offset-1 focus:rounded-[0.5rem] compact:focus:outline-offset-0 hc:focus:-outline-offset-[0.1875rem] hc:focus:rounded-[0.1875rem]',
                // the gap between tokens in a tokenizer
                tokenizer && 'me-[0.3125rem] compact:me-1',
                active && [
                    '[--tk-fg:var(--sapButton_Selected_TextColor)] [--tk-bg:var(--sapButton_Selected_Background)] [--tk-bc:var(--sapButton_Selected_BorderColor)] [--tk-close:var(--sapButton_Selected_TextColor)]',
                    'hover:[--tk-bg:var(--sapButton_Selected_Hover_Background)] font-sap-font-semibold-duplex-family',
                    // a thicker bottom line
                    'shadow-[inset_0_-0.0625rem_0_0_var(--sapButton_Selected_BorderColor)] hc:shadow-none focus:outline-sap-content-focus-color hc:focus:outline-sap-content-contrast-focus-color'
                ],
                readOnly && [
                    '[--tk-fg:var(--sapContent_LabelColor)] [--tk-bc:var(--sapField_ReadOnly_BorderColor)] [--tk-ps:0.3125rem] pe-(--tk-ps) compact:[--tk-ps:0.25rem]',
                    'hc:[--tk-bg:var(--sapField_ReadOnly_Background)] hover:[--tk-bg:var(--sapButton_TokenBackground)] hc:hover:[--tk-bg:var(--sapField_ReadOnly_Background)]'
                ],
                disabled && 'cursor-not-allowed opacity-(--sapContent_DisabledOpacity)',
                className
            )}
            onClick={(event) => {
                onClick?.(event);
                onTokenClick?.(event);
                const el = element.current;
                if (tokenizer && el) tokenizer.tokenClick({ ...entry, element: el }, event);
            }}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                onTokenKeyDown?.(event);
                if (event.key === 'Enter' || event.key === ' ') onTokenClick?.(event);
            }}
            onFocus={(event) => {
                onFocus?.(event);
                if (event.target === event.currentTarget) onFocusChange?.(true);
            }}
            onBlur={(event) => {
                onBlur?.(event);
                if (event.target === event.currentTarget) onFocusChange?.(false);
            }}
        >
            <span className="w-full min-w-0 truncate select-none">{children}</span>
            {!readOnly && (
                <span aria-hidden="true" className={closeClassName} onClick={(event) => entry.closeClick(event)}>
                    <Icon glyph="decline" className="text-[length:inherit]" />
                </span>
            )}
        </span>
    );
}

export interface TokenizerInputProps extends Omit<ComponentProps<'input'>, 'className'> {
    className?: string;
    /** Called with the new text (Base UI `Input`). */
    onValueChange?: (value: string) => void;
}

/** The text input of a tokenizer, on Base UI's Input. Pass it as the tokenizer's `input`. */
export function TokenizerInput({ className, ...props }: TokenizerInputProps) {
    return (
        <BaseInput
            {...(props as Omit<BaseInput.Props, 'className'>)}
            data-tokenizer-input=""
            className={cn(
                'm-0 box-border min-w-12 flex-1 basis-full self-stretch rounded-sap-field-border-corner-radius border-none bg-transparent px-[0.3125rem] py-0 shadow-none outline-none compact:min-w-8 compact:px-1',
                'font-sap-font-family text-sap-font-size text-sap-field-text-color placeholder:italic placeholder:text-sap-field-placeholder-text-color hc:placeholder:not-italic',
                className
            )}
        />
    );
}

/** Imperative actions of a tokenizer, through `actionsRef`. */
export interface TokenizerActions {
    /** Calls `onRemove` of the selected (and the focused) tokens. */
    removeSelectedTokens(): void;
    /** Focuses the token at `index`. */
    focusTokenElement(index: number): void;
}

export interface TokenizerProps extends Omit<ComponentProps<'div'>, 'children'> {
    /** The tokens. */
    children?: ReactNode;
    /** The input after the tokens, usually a `TokenizerInput`. */
    input?: ReactNode;
    /** Content between the tokens (and the overflow link) and the input. */
    extra?: ReactNode;
    /** Backspace and Delete do not remove tokens. */
    disableKeyboardDeletion?: boolean;
    /** Shows the field focus frame while its input has the focus (default true). */
    tokenizerFocusable?: boolean;
    /** Icon of an addon button after the field, e.g. a value help. */
    glyph?: string | null;
    glyphFont?: IconFont;
    glyphAriaLabel?: string | null;
    glyphTitle?: string | null;
    /** The addon button opens a popup, e.g. `listbox` or `dialog`. */
    glyphHasPopup?: ComponentProps<'button'>['aria-haspopup'] | null;
    glyphExpanded?: boolean;
    /** The addon button is in the tab order; otherwise clicking it keeps the focus in the input. */
    buttonFocusable?: boolean;
    disabled?: boolean;
    /** Text of the overflow link; `{count}` is the number of hidden tokens. */
    moreTerm?: string;
    /** Lists the hidden tokens in a popover (default true); otherwise only `onMoreClick` is called. */
    showOverflowPopover?: boolean;
    /**
     * Tokens hidden by the owner (e.g. a multi-input), counted in the overflow link. While it is above 0 the owner
     * shows the hidden tokens: the link only calls `onMoreClick`, without the popover.
     */
    externalHiddenCount?: number;
    /** Keeps the tokens expanded, e.g. while a value help is open. */
    open?: boolean;
    state?: FormState | null;
    readOnly?: boolean;
    /** Name of the token list and of the overflow popover. */
    tokenizerLabel?: string;
    /** Start of the names of the remove buttons in the overflow popover. */
    removeLabel?: string;
    /** Announced when the input gets the focus; `{length}` is the number of tokens. */
    tokensCountText?: string;
    /** The overflow link was clicked (or Enter or Space pressed on it). */
    onMoreClick?: () => void;
    /** The addon button was clicked. */
    onAddOnButtonClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
    /** `removeSelectedTokens()` and `focusTokenElement(index)`. */
    actionsRef?: Ref<TokenizerActions>;
}

const moreClassName =
    'shrink-0 cursor-pointer pe-2 font-sap-font-family text-sap-font-size text-sap-link-color whitespace-nowrap outline-none focus-visible:outline-sap';

/**
 * Tokenizer: tokens and an input in one field. When it does not have the focus, tokens that do not fit collapse
 * into an "n more" link that lists them in a popover. Arrow keys move between the tokens and the input, Backspace
 * and Delete remove the focused or selected tokens, Space selects, Ctrl+A selects all, Ctrl and Shift clicks extend
 * the selection.
 *
 * ```tsx
 * <Tokenizer input={<TokenizerInput aria-label="Values" />}>
 *     {values.map((value) => (
 *         <Token key={value} onCloseClick={() => remove(value)}>{value}</Token>
 *     ))}
 * </Tokenizer>
 * ```
 */
export function Tokenizer({
    children,
    input,
    extra,
    disableKeyboardDeletion = false,
    tokenizerFocusable = true,
    glyph,
    glyphFont = 'SAP-icons',
    glyphAriaLabel = null,
    glyphTitle,
    glyphHasPopup,
    glyphExpanded = false,
    buttonFocusable = false,
    disabled = false,
    moreTerm = '{count} more',
    showOverflowPopover = true,
    externalHiddenCount = 0,
    open = false,
    state,
    readOnly = false,
    tokenizerLabel = 'Tokenizer',
    removeLabel = 'Remove',
    tokensCountText = 'Contains total tokens: {length}.',
    onMoreClick,
    onAddOnButtonClick,
    actionsRef,
    className,
    ref,
    onKeyDown,
    onFocus,
    onBlur,
    ...props
}: TokenizerProps) {
    const root = useRef<HTMLDivElement | null>(null);
    const inner = useRef<HTMLDivElement | null>(null);
    const entries = useRef(new Map<string, TokenEntry>());
    const [version, setVersion] = useState(0);
    const [order, setOrder] = useState<readonly string[]>([]);
    const [focused, setFocused] = useState(false);
    const [overflowOpen, setOverflowOpen] = useState(false);
    /** Ids of the tokens collapsed into the overflow link. */
    const [collapsed, setCollapsed] = useState<readonly string[]>([]);
    const [announcement, setAnnouncement] = useState('');
    const anchor = useRef<number | null>(null);
    const expanded = focused || open;

    /** The tokens in DOM order. */
    const tokens = useCallback(
        () =>
            [...entries.current.values()].sort((a, b) =>
                a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
            ),
        []
    );
    const register = useCallback((entry: TokenEntry) => {
        entries.current.set(entry.id, entry);
        setVersion((v) => v + 1);
        return () => {
            entries.current.delete(entry.id);
            setVersion((v) => v + 1);
        };
    }, []);
    const inputEl = useCallback(
        () =>
            root.current?.querySelector<HTMLInputElement>('[data-tokenizer-input]') ??
            root.current?.querySelector<HTMLInputElement>('input') ??
            null,
        []
    );
    const rtl = () => !!root.current && getComputedStyle(root.current).direction === 'rtl';
    const focusTokenElement = useCallback((index: number) => tokens()[index]?.element.focus(), [tokens]);
    const focusInput = () => inputEl()?.focus();
    const activeTokens = () => tokens().filter((t) => t.isSelected() || t.element === document.activeElement);

    useImperativeHandle(
        actionsRef,
        () => ({
            removeSelectedTokens: () =>
                tokens()
                    .filter((t) => t.isSelected() || t.element === document.activeElement)
                    .forEach((t) => t.remove()),
            focusTokenElement
        }),
        [tokens, focusTokenElement]
    );

    // positions for screen readers
    useLayoutEffect(() => {
        const ids = tokens().map((t) => t.id);
        setOrder((current) =>
            current.length === ids.length && current.every((id, i) => id === ids[i]) ? current : ids
        );
    }, [version, tokens]);

    /** Hides tokens from the start until the rest, the overflow link and the input fit. */
    const expandedRef = useRef(expanded);
    expandedRef.current = expanded;
    const layout = useCallback(() => {
        const el = inner.current;
        if (!el) return;
        const all = tokens();
        all.forEach((t) => (t.element.style.display = ''));
        if (expandedRef.current) {
            setCollapsed((current) => (current.length ? [] : current));
            el.scrollLeft = getComputedStyle(el).direction === 'rtl' ? -el.scrollWidth : el.scrollWidth;
            return;
        }
        const hidden: string[] = [];
        // room for the overflow link once tokens hide; the last token always stays
        const moreWidth = el.querySelector('[data-tokenizer-more]') ? 0 : 64;
        const fits = () => el.scrollWidth <= el.clientWidth - (hidden.length ? moreWidth : 0);
        for (const token of all) {
            if (fits() || hidden.length >= all.length - 1) break;
            token.element.style.display = 'none';
            hidden.push(token.id);
        }
        setCollapsed((current) =>
            current.length === hidden.length && current.every((id, i) => id === hidden[i]) ? current : hidden
        );
    }, [tokens]);

    // collapse or expand after every change of tokens or focus
    useLayoutEffect(() => layout(), [version, expanded, layout]);

    // and of size
    useEffect(() => {
        const el = root.current;
        if (!el) return;
        const observer = new ResizeObserver(() => layout());
        observer.observe(el);
        return () => observer.disconnect();
    }, [layout]);

    // a click outside unselects the tokens
    useEffect(() => {
        const outside = (event: MouseEvent) => {
            if (!root.current?.contains(event.target as Node)) tokens().forEach((t) => t.setSelected(false));
        };
        document.addEventListener('click', outside);
        return () => document.removeEventListener('click', outside);
    }, [tokens]);

    const tokenClick = useCallback(
        (entry: TokenEntry, event: ReactMouseEvent<HTMLElement>) => {
            if (entry.isDisabled()) return;
            event.stopPropagation();
            entry.element.focus();
            const all = tokens();
            const index = all.findIndex((t) => t.id === entry.id);
            if (event.ctrlKey || event.metaKey) {
                entry.setSelected(!entry.isSelected());
                anchor.current = index;
            } else if (event.shiftKey && anchor.current !== null) {
                const [from, to] = [Math.min(anchor.current, index), Math.max(anchor.current, index)];
                all.forEach((t, i) => t.setSelected(i >= from && i <= to));
            } else {
                all.forEach((t) => t.setSelected(t.id === entry.id));
                anchor.current = index;
            }
        },
        [tokens]
    );

    const context = useMemo<TokenizerContextValue>(
        () => ({ register, order, tokenClick }),
        [register, order, tokenClick]
    );

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        const all = tokens();
        const field = inputEl();
        const inInput = !!field && event.target === field;
        const index = inInput ? all.length : all.findIndex((t) => t.element === event.target);
        if (index < 0) return;
        const back = rtl() ? 'ArrowRight' : 'ArrowLeft';
        const forward = rtl() ? 'ArrowLeft' : 'ArrowRight';
        const caretAtStart = !inInput || (field.selectionStart === 0 && field.selectionEnd === 0);
        if ((event.key === 'Backspace' || event.key === 'Delete') && !disableKeyboardDeletion) {
            if (inInput && !all.some((t) => t.isSelected())) {
                if (event.key === 'Backspace' && !field.value && all.length) {
                    event.preventDefault();
                    focusTokenElement(all.length - 1);
                }
                return;
            }
            event.preventDefault();
            activeTokens().forEach((t) => t.close());
            if (event.key === 'Delete' || inInput) focusInput();
            // after the owner has removed the tokens
            else requestAnimationFrame(() => focusTokenElement(Math.max(index - 1, 0)));
            return;
        }
        if (inInput && !caretAtStart && event.key !== 'a') return;
        switch (event.key) {
            case back:
                if (index > 0) {
                    event.preventDefault();
                    focusTokenElement(index - 1);
                }
                break;
            case forward:
                if (!inInput) {
                    event.preventDefault();
                    if (index + 1 < all.length) focusTokenElement(index + 1);
                    else focusInput();
                }
                break;
            case ' ':
                if (!inInput) {
                    event.preventDefault();
                    const token = all[index];
                    all.forEach((t) => t !== token && t.setSelected(false));
                    token.setSelected(!token.isSelected());
                }
                break;
            case 'Enter':
                if (!inInput) focusInput();
                break;
            case 'a':
                if ((event.ctrlKey || event.metaKey) && !field?.value) {
                    event.preventDefault();
                    all.forEach((t) => t.setSelected(true));
                }
                break;
        }
    };

    /** Tokens expand while the input or a token has the focus, not the overflow link nor the popover. */
    const handleFocus = (event: ReactFocusEvent<HTMLDivElement>) => {
        onFocus?.(event);
        const target = event.target as Element;
        // focus in the overflow popover reaches here through the portal
        if (!root.current?.contains(target)) return;
        if (!target.closest('[data-tokenizer-more]')) setFocused(true);
        if (target === inputEl()) setAnnouncement(tokensCountText.replace('{length}', String(tokens().length)));
    };
    const handleBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
        onBlur?.(event);
        if (!root.current?.contains(event.target as Node)) return;
        const next = event.relatedTarget as Node | null;
        if (next && root.current.contains(next)) return;
        setAnnouncement('');
        // focus moved into the overflow popover
        if (next && (next as Element).closest?.('[data-tokenizer-popover]')) return;
        setFocused(false);
    };

    const entriesById = entries.current;
    const hiddenTokens = collapsed.map((id) => entriesById.get(id)).filter((t): t is TokenEntry => !!t);
    const hiddenCount = hiddenTokens.length + externalHiddenCount;
    const moreText = moreTerm.replace('{count}', String(hiddenCount));

    return (
        <div
            {...props}
            ref={(node) => {
                root.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            className={cn('block w-full', className)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            <div
                className={cn(
                    'relative box-border flex w-full min-h-sap-element-height cursor-text items-center overflow-hidden p-0 text-sap-field-text-color compact:min-h-sap-element-compact-height',
                    'rounded-sap-field-border-corner-radius border-width-sap-field-border-width [border-style:var(--sapField_BorderStyle)] border-sap-field-border-color [box-shadow:var(--sapField_Shadow)]',
                    '[background:var(--sapField_BackgroundStyle)_var(--sapField_Background)]',
                    'hover:[background:var(--sapField_Hover_BackgroundStyle)_var(--sapField_Hover_Background)] hover:border-sap-field-hover-border-color hover:[box-shadow:none]',
                    tokenizerFocusable && 'has-[input:focus]:outline-sap has-[input:focus]:-outline-offset-1',
                    fieldStates[state ?? 'default'],
                    readOnly && [
                        '[background:var(--sapField_ReadOnly_BackgroundStyle)_var(--sapField_ReadOnly_Background)] border-sap-field-read-only-border-color',
                        'hover:[background:var(--sapField_ReadOnly_BackgroundStyle)_var(--sapField_ReadOnly_Background)] hover:border-sap-field-read-only-border-color hover:[box-shadow:var(--sapField_Shadow)]'
                    ],
                    disabled &&
                        'pointer-events-none opacity-(--sapContent_DisabledOpacity) [&_:disabled]:opacity-100! [&_[aria-disabled=true]]:opacity-100!'
                )}
            >
                <div
                    ref={inner}
                    className={cn(
                        'flex w-full items-center self-stretch overflow-hidden px-[0.3125rem] whitespace-nowrap compact:px-1',
                        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                        expanded && 'overflow-x-auto'
                    )}
                >
                    <div
                        role="listbox"
                        className="flex items-center"
                        aria-label={tokenizerLabel}
                        aria-multiselectable="true"
                    >
                        <TokenizerContext.Provider value={context}>{children}</TokenizerContext.Provider>
                    </div>
                    {hiddenCount > 0 &&
                        (showOverflowPopover && externalHiddenCount === 0 ? (
                            <Popover
                                placement="bottom-start"
                                noArrow={false}
                                open={overflowOpen}
                                onOpenChange={setOverflowOpen}
                            >
                                <PopoverTrigger
                                    nativeButton={false}
                                    data-tokenizer-more=""
                                    className={moreClassName}
                                    render={<span />}
                                    onClick={() => onMoreClick?.()}
                                >
                                    {moreText}
                                </PopoverTrigger>
                                <PopoverBody aria-label={tokenizerLabel} data-tokenizer-popover="">
                                    <ul
                                        role="list"
                                        aria-label={tokenizerLabel}
                                        className="m-0 list-none p-1 font-sap-font-family text-sap-font-size text-sap-text-color"
                                    >
                                        {hiddenTokens.map((token) => (
                                            <li
                                                key={token.id}
                                                className="flex min-h-8 items-center justify-between gap-2 ps-3"
                                            >
                                                <span className="truncate">{token.text()}</span>
                                                {!token.isReadOnly() && (
                                                    <Button
                                                        variant="transparent"
                                                        glyph="decline"
                                                        aria-label={`${removeLabel} ${token.text()}`}
                                                        onClick={(event) => token.closeClick(event)}
                                                    />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </PopoverBody>
                            </Popover>
                        ) : (
                            <span
                                role="button"
                                tabIndex={0}
                                data-tokenizer-more=""
                                className={moreClassName}
                                onClick={() => onMoreClick?.()}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') onMoreClick?.();
                                    if (event.key === ' ') {
                                        event.preventDefault();
                                        onMoreClick?.();
                                    }
                                }}
                            >
                                {moreText}
                            </span>
                        ))}
                    {extra}
                    {input}
                </div>
                {glyph && (
                    <Button
                        variant="transparent"
                        type="button"
                        tabIndex={buttonFocusable ? undefined : -1}
                        glyph={glyph}
                        glyphFont={glyphFont}
                        aria-label={glyphAriaLabel ?? undefined}
                        title={glyphTitle || glyphAriaLabel || undefined}
                        aria-haspopup={glyphHasPopup ?? undefined}
                        aria-expanded={glyphHasPopup ? glyphExpanded : undefined}
                        disabled={disabled}
                        className={glyphExpanded ? 'shrink-0 text-sap-button-selected-text-color' : 'shrink-0'}
                        onMouseDown={(event) => {
                            if (!buttonFocusable) event.preventDefault();
                        }}
                        onClick={(event) => onAddOnButtonClick?.(event as ReactMouseEvent<HTMLButtonElement>)}
                    />
                )}
            </div>
            <span className="sr-only-sap" aria-live="polite">
                {announcement}
            </span>
        </div>
    );
}
