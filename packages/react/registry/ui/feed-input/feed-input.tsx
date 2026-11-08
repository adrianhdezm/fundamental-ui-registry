/*
 * Port of @fundamental-ngx/core (feed-input) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    createContext,
    use,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type ComponentProps,
    type Ref,
    type RefCallback
} from 'react';
import { cn } from '@/lib/utils';
import { Avatar, type AvatarProps } from '@/ui/avatar/avatar';
import { Button, type ButtonProps } from '@/ui/button/button';
import { Icon } from '@/ui/icon/icon';
import { fieldBase, textareaBase } from '@/ui/input/input';

interface FeedInputContextValue {
    disabled: boolean;
    /** Current text of the text area. */
    value: string;
    setValue(value: string): void;
}

const FeedInputContext = createContext<FeedInputContextValue | null>(null);

function mergeRefs<E>(...refs: (Ref<E> | undefined)[]): RefCallback<E> {
    return (node) => {
        for (const ref of refs) {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        }
    };
}

export interface FeedInputProps extends ComponentProps<'div'> {
    /** Disables the text area and the send button. */
    disabled?: boolean;
}

/**
 * Feed input: a growing text area to post to a feed, with the user's avatar and a send button that is enabled once
 * there is text. Below 20rem the avatar hides. The root is a `role="group"`; name it with `aria-label`.
 *
 * ```tsx
 * <FeedInput aria-label="Post a comment">
 *     <FeedInputAvatar image={photo} aria-label="John Doe" />
 *     <FeedInputTextarea aria-label="Comment" placeholder="Post something here" value={text} onValueChange={setText} />
 *     <FeedInputButton onClick={() => post(text)} />
 * </FeedInput>
 * ```
 */
export function FeedInput({ disabled = false, className, children, ...props }: FeedInputProps) {
    const [value, setValue] = useState('');
    const context = useMemo<FeedInputContextValue>(() => ({ disabled, value, setValue }), [disabled, value]);
    return (
        <FeedInputContext.Provider value={context}>
            <div
                role="group"
                {...props}
                className={cn(
                    '@container m-0 box-border block h-full p-0',
                    disabled && 'cursor-not-allowed',
                    className
                )}
            >
                <div className="m-0 my-4 box-border flex gap-2 bg-sap-group-content-background py-4 ps-4 pe-2 font-sap-font-family @max-[20rem]:my-0">
                    {children}
                </div>
            </div>
        </FeedInputContext.Provider>
    );
}

export type FeedInputAvatarProps = AvatarProps;

/** The avatar of the posting user (an `Avatar`, size `s` by default); hidden in narrow feed inputs. */
export function FeedInputAvatar({ size = 's', className, ...props }: FeedInputAvatarProps) {
    return <Avatar size={size} {...props} className={cn('shrink-0 @max-[20rem]:hidden', className)} />;
}

export interface FeedInputTextareaProps extends Omit<ComponentProps<'textarea'>, 'value' | 'defaultValue'> {
    /** The text, for a controlled text area (with `onValueChange`). */
    value?: string;
    /** The initial text, for an uncontrolled text area. */
    defaultValue?: string;
    /** Called with the text on every change. */
    onValueChange?: (value: string) => void;
    /** Maximum number of rows before the text area scrolls; 20rem by default. */
    maxRows?: number | null;
}

/** Line height of the text area; a `normal` line height counts as 1.1 times the font size. */
function lineHeight(el: HTMLElement): number {
    const style = getComputedStyle(el);
    const height = parseFloat(style.lineHeight);
    return isNaN(height) ? parseFloat(style.fontSize) * 1.1 : height;
}

/** Fits the height of the text area to its text. */
function resize(el: HTMLTextAreaElement): void {
    const style = getComputedStyle(el);
    el.style.height = 'inherit';
    el.style.height = `${parseFloat(style.borderTopWidth) + el.scrollHeight + parseFloat(style.borderBottomWidth)}px`;
}

/**
 * The text area of a feed input: one row that grows with its text, up to `maxRows` rows (20rem by default), then
 * scrolls. `value` with `onValueChange` for a controlled text area, `defaultValue` for an uncontrolled one.
 */
export function FeedInputTextarea({
    value: valueProp,
    defaultValue,
    onValueChange,
    maxRows,
    disabled,
    rows = 1,
    ref,
    className,
    onChange,
    ...props
}: FeedInputTextareaProps) {
    const feed = use(FeedInputContext);
    const element = useRef<HTMLTextAreaElement>(null);
    const [own, setOwn] = useState(defaultValue ?? '');
    const value = valueProp ?? own;
    const typed = useRef(false);
    const setFeedValue = feed?.setValue;

    useLayoutEffect(() => {
        const el = element.current!;
        el.style.maxHeight = maxRows ? `${lineHeight(el) * maxRows}px` : '';
    }, [maxRows]);

    useLayoutEffect(() => {
        setFeedValue?.(value);
        // as Angular: an empty text area keeps its natural height until the first change
        if (value || typed.current) resize(element.current!);
    }, [value, setFeedValue]);

    const feedDisabled = !!feed?.disabled;
    return (
        <textarea
            {...props}
            ref={mergeRefs(element, ref)}
            rows={rows}
            value={value}
            disabled={feedDisabled || disabled}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                typed.current = true;
                const next = event.currentTarget.value;
                if (valueProp === undefined) setOwn(next);
                onChange?.(event);
                onValueChange?.(next);
            }}
            className={cn(
                fieldBase,
                textareaBase,
                'm-0 min-h-12 max-h-80 flex-1 px-2 py-1.5',
                feedDisabled &&
                    // a disabled feed input keeps its placeholder readable
                    'disabled:pointer-events-auto disabled:cursor-not-allowed disabled:placeholder:not-italic disabled:placeholder:text-sap-text-color disabled:placeholder:opacity-100',
                className
            )}
        />
    );
}

export type FeedInputButtonProps = Omit<ButtonProps, 'variant'>;

/**
 * The send button of a feed input (a paper plane): disabled while the feed input is disabled or its text is empty.
 * Always cozy, as in fundamental-styles.
 */
export function FeedInputButton({
    'aria-label': ariaLabel = 'Send',
    title,
    disabled,
    className,
    children,
    ...props
}: FeedInputButtonProps) {
    const feed = use(FeedInputContext);
    const inactive = !!feed && (feed.disabled || !feed.value.trim());
    return (
        <Button
            data-density="cozy"
            {...props}
            variant="standard"
            disabled={inactive || disabled}
            aria-disabled={inactive || disabled || undefined}
            aria-label={ariaLabel}
            title={title ?? ariaLabel}
            className={cn('my-1.5 shrink-0 self-end', className)}
        >
            {children ?? <Icon glyph="paper-plane" className="rtl:-scale-x-100" />}
        </Button>
    );
}
