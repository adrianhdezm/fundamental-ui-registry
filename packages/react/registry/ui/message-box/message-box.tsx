/*
 * Port of fundamental-react (MessageBox) and @fundamental-ngx/core (message-box) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import {
    Children,
    createContext,
    isValidElement,
    useContext,
    useId,
    useMemo,
    useRef,
    type ReactElement,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import { Bar, BarElement, BarLeft, BarMiddle, BarRight, ButtonBar } from '@/ui/bar/bar';
import {
    DialogBody,
    DialogFooter,
    DialogPopup,
    DialogTitle,
    useDialogRef,
    useDialogService,
    type DialogBodyProps,
    type DialogConfig,
    type DialogPopupProps,
    type DialogRef,
    type DialogTitleProps
} from '@/ui/dialog/dialog';
import { Icon, type IconColor, type IconProps } from '@/ui/icon/icon';
import { TitleSizeContext, type HeaderSize } from '@/ui/title/title';

export type MessageBoxType = 'error' | 'success' | 'warning' | 'information' | 'confirmation';

/** The handle of an open message box: a `DialogRef`. */
export type MessageBoxRef<T = unknown, P = unknown> = DialogRef<T, P>;

/** The semantic options of a message box, from its props or from the config it was opened with. */
interface MessageBoxSemantics {
    type?: MessageBoxType | null;
    showSemanticIcon?: boolean;
    customSemanticIcon?: string | null;
}

const SEMANTIC_ICON: Record<MessageBoxType, string> = {
    error: 'error',
    success: 'sys-enter-2',
    warning: 'alert',
    information: 'information',
    confirmation: 'sys-help-2'
};

/** Header shadow (a coloured line) per type. */
const TYPE_HEADER: Record<MessageBoxType, string> = {
    confirmation: '[--bar-shadow:var(--sapContent_HeaderShadow)]',
    error: '[--bar-shadow:var(--sapContent_Error_HeaderShadow)]',
    success: '[--bar-shadow:var(--sapContent_Success_HeaderShadow)]',
    warning: '[--bar-shadow:var(--sapContent_Warning_HeaderShadow)]',
    information: '[--bar-shadow:var(--sapContent_Information_HeaderShadow)]'
};

/** Semantic icon colour per type. */
const TYPE_ICON: Record<MessageBoxType, IconColor> = {
    confirmation: 'neutral',
    error: 'negative',
    success: 'positive',
    warning: 'critical',
    information: 'information'
};

/** The semantics of the message box around its parts. */
const MessageBoxContext = createContext<MessageBoxSemantics | null>(null);
/** The config of a message box opened by `useMessageBoxService()`. */
const MessageBoxConfigContext = createContext<MessageBoxConfig | null>(null);

/* ------------------------------------------------------------------------------------------------------------------
 * Parts
 * ---------------------------------------------------------------------------------------------------------------- */

export interface MessageBoxProps extends DialogPopupProps {
    /** Semantic type: colours the header line and picks the semantic icon. */
    type?: MessageBoxType | null;
    /** Shows the icon of the type before the title. */
    showSemanticIcon?: boolean;
    /** Icon before the title instead of the type icon (shown without `showSemanticIcon`). */
    customSemanticIcon?: string | null;
}

/**
 * Message box: a modal alert dialog for errors, warnings, confirmations and other messages that need a decision. It
 * is the window of a `Dialog` (a `DialogPopup` with `role="alertdialog"`), so it traps the focus, closes on Escape
 * and gives the focus back; `type` colours the header line and, with `showSemanticIcon`, adds the type icon before
 * the title. Native props, `className` and `ref` go to the window, as do the `DialogPopup` options (`width`,
 * `position`, `mobile`, `size`, ...).
 *
 * ```tsx
 * <Dialog>
 *     <DialogTrigger render={<Button label="Delete" />} />
 *     <MessageBox type="confirmation" showSemanticIcon>
 *         <MessageBoxHeader>
 *             <MessageBoxTitle>Delete order?</MessageBoxTitle>
 *         </MessageBoxHeader>
 *         <MessageBoxBody>The order will be deleted permanently.</MessageBoxBody>
 *         <MessageBoxFooter>
 *             <DialogClose render={<ButtonBar variant="emphasized" label="Delete" />} />
 *             <DialogClose render={<ButtonBar label="Cancel" />} />
 *         </MessageBoxFooter>
 *     </MessageBox>
 * </Dialog>
 * ```
 *
 * From code, `useMessageBoxService().open()` opens one from a render function, an element or a `MessageBoxContent`
 * object.
 */
export function MessageBox({ type, showSemanticIcon, customSemanticIcon, className, ...props }: MessageBoxProps) {
    const config = useContext(MessageBoxConfigContext);
    const resolvedType = type === undefined ? config?.type : type;
    const resolvedShow = showSemanticIcon ?? config?.showSemanticIcon ?? false;
    const resolvedCustom = customSemanticIcon === undefined ? config?.customSemanticIcon : customSemanticIcon;
    const semantics = useMemo<MessageBoxSemantics>(
        () => ({ type: resolvedType, showSemanticIcon: resolvedShow, customSemanticIcon: resolvedCustom }),
        [resolvedType, resolvedShow, resolvedCustom]
    );
    return (
        <MessageBoxContext.Provider value={semantics}>
            <DialogPopup
                role="alertdialog"
                data-message-box-type={resolvedType || undefined}
                {...props}
                className={cn('overflow-hidden', className)}
            />
        </MessageBoxContext.Provider>
    );
}

export interface MessageBoxSemanticIconProps extends Omit<IconProps, 'glyph'> {
    /** Glyph instead of the type icon (and of the config's `customSemanticIcon`). */
    glyph?: string | null;
}

/**
 * The icon of the message box type, decorative and in the type colour. The header shows it on its own with
 * `showSemanticIcon` or `customSemanticIcon`; place it in the `MessageBoxHeader` to replace it.
 */
export function MessageBoxSemanticIcon({ glyph, className, ...props }: MessageBoxSemanticIconProps) {
    const box = useContext(MessageBoxContext);
    const type = box?.type;
    return (
        <Icon
            {...props}
            glyph={glyph || box?.customSemanticIcon || (type ? SEMANTIC_ICON[type] : '')}
            color={type ? TYPE_ICON[type] : 'default'}
            data-message-box-semantic-icon=""
            // the body font, not the header font of the bar element (fundamental-styles' icon)
            className={cn('me-2 font-sap-font-family', className)}
        />
    );
}

/** The title of the message box: an SAP title (`<h2>` with the header 5 size by default) that labels the window. */
export function MessageBoxTitle(props: DialogTitleProps) {
    return <DialogTitle {...props} />;
}

const BAR = '[--bar-px:var(--dlg-px)] shrink-0';
const AREAS: unknown[] = [BarLeft, BarMiddle, BarRight];
const isType = (child: ReactNode, type: unknown): child is ReactElement => isValidElement(child) && child.type === type;

/**
 * Header of a message box: a header bar with the semantic icon and the `MessageBoxTitle` at its start, and the header
 * line in the colour of the type. Put `BarLeft`/`BarMiddle`/`BarRight` areas directly inside for a custom header.
 * Native props go to its element, a `<div>` (`render={<header />}` for another element).
 */
export function MessageBoxHeader({ render, className, children, ...props }: useRender.ComponentProps<'div'>) {
    const box = useContext(MessageBoxContext);
    const items = Children.toArray(children);
    const custom = items.some((child) => isValidElement(child) && AREAS.includes(child.type));
    const ownIcon = items.some((child) => isType(child, MessageBoxSemanticIcon));
    const showIcon = !ownIcon && !!((box?.type && box.showSemanticIcon) || box?.customSemanticIcon);
    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            'data-dialog-header': '',
            className: cn('block shrink-0', className),
            children: (
                <TitleSizeContext.Provider value={5}>
                    <Bar
                        role="group"
                        barDesign="header"
                        data-dialog-bar=""
                        className={cn(BAR, box?.type && TYPE_HEADER[box.type])}
                    >
                        {custom ? (
                            items
                        ) : (
                            <BarLeft>
                                {/* icon and title in one element, as fundamental-styles; the title truncates */}
                                <BarElement className="min-w-0">
                                    {showIcon && <MessageBoxSemanticIcon />}
                                    {items}
                                </BarElement>
                            </BarLeft>
                        )}
                    </Bar>
                </TitleSizeContext.Provider>
            )
        }
    });
}

/** Scrolling body of a message box; its paddings follow the `MessageBox` options, as a `DialogBody`. */
export function MessageBoxBody(props: DialogBodyProps) {
    return <DialogBody {...props} />;
}

/**
 * Footer of a message box: its buttons go to the end and are at least 4rem wide (decisive buttons). Put
 * `BarLeft`/`BarMiddle`/`BarRight` areas directly inside for a custom footer.
 */
export function MessageBoxFooter({ className, ...props }: useRender.ComponentProps<'div'>) {
    // square bar corners, as fundamental-styles: the window clips them
    return <DialogFooter {...props} className={cn('[&>[data-dialog-bar]]:rounded-b-none', className)} />;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Service
 * ---------------------------------------------------------------------------------------------------------------- */

/** Dialog options plus the semantics of the message box. */
export interface MessageBoxConfig<T = unknown> extends DialogConfig<T> {
    type?: MessageBoxType;
    /** Shows the icon of the type before the title. */
    showSemanticIcon?: boolean;
    /** Icon before the title instead of the type icon. */
    customSemanticIcon?: string;
}

/** Content of a message box built from an object. */
export interface MessageBoxContent {
    title?: ReactNode;
    titleId?: string;
    titleHeadingLevel?: HeaderSize;
    /** Content of the body; it describes the message box. */
    content?: ReactNode;
    contentId?: string;
    approveButton?: string;
    approveButtonId?: string;
    approveButtonAriaLabel?: string;
    approveButtonCallback?: () => void;
    cancelButton?: string;
    cancelButtonId?: string;
    cancelButtonAriaLabel?: string;
    cancelButtonCallback?: () => void;
}

/**
 * What the service opens: a render function that gets the `MessageBoxRef` and the config, a React element (e.g. a
 * component that calls `useMessageBoxRef()`), or a `MessageBoxContent` object. The function or element renders a
 * `MessageBox`.
 */
export type MessageBoxContentType<T = unknown, P = unknown> =
    ((ref: MessageBoxRef<T, P>, config: MessageBoxConfig<T>) => ReactNode) | ReactElement | MessageBoxContent;

/** Opens message boxes from code: the React form of Angular's `MessageBoxService`. */
export interface MessageBoxService {
    open<T = unknown, P = unknown>(
        content: MessageBoxContentType<T, P>,
        config?: MessageBoxConfig<T>
    ): MessageBoxRef<T, P>;
    /** Dismisses every open message box and dialog of the dialog service with `reason`. */
    dismissAll(reason?: unknown): void;
    /** Open message boxes and dialogs of the dialog service, oldest first. */
    readonly dialogs: readonly DialogRef[];
    readonly hasOpenDialogs: boolean;
    /** Number of open message boxes and dialogs (Angular's `dialogsOpen`). */
    readonly openDialogCount: number;
}

const MessageBoxDefaultsContext = createContext<MessageBoxConfig | undefined>(undefined);

export interface MessageBoxProviderProps {
    children?: ReactNode;
    /** App-wide defaults of the message boxes opened below it (Angular's `MESSAGE_BOX_DEFAULT_CONFIG`). */
    defaultConfig?: MessageBoxConfig;
}

/**
 * Sets the defaults of the message boxes opened by `useMessageBoxService()` below it. They are rendered by the nearest
 * `DialogProvider`, so put one above (or below, around the components that open message boxes).
 */
export function MessageBoxProvider({ children, defaultConfig }: MessageBoxProviderProps) {
    return <MessageBoxDefaultsContext.Provider value={defaultConfig}>{children}</MessageBoxDefaultsContext.Provider>;
}

/**
 * The message box service: `open(content, config)` opens a message box in the nearest `DialogProvider` and returns its
 * `MessageBoxRef`. Message boxes have responsive paddings by default.
 *
 * ```tsx
 * const messageBoxes = useMessageBoxService();
 * const ref = messageBoxes.open(
 *     { title: 'Error', content: 'The order could not be saved.', approveButton: 'Close', approveButtonCallback: () => ref.close() },
 *     { type: 'error', showSemanticIcon: true }
 * );
 * const result = await ref.afterClosed; // { status: 'closed', value } or { status: 'dismissed', reason }
 * ```
 */
export function useMessageBoxService(): MessageBoxService {
    const dialogs = useDialogService();
    const defaults = useContext(MessageBoxDefaultsContext);
    return useMemo<MessageBoxService>(
        () => ({
            open: <T, P>(content: MessageBoxContentType<T, P>, config?: MessageBoxConfig<T>) => {
                const merged = { responsivePadding: true, ...defaults, ...config } as MessageBoxConfig<T>;
                return dialogs.open<T, P>(
                    (ref, resolved) => (
                        <MessageBoxConfigContext.Provider value={resolved as MessageBoxConfig}>
                            {typeof content === 'function' ? (
                                content(ref, resolved as MessageBoxConfig<T>)
                            ) : isValidElement(content) ? (
                                content
                            ) : (
                                <MessageBoxDefault content={content} />
                            )}
                        </MessageBoxConfigContext.Provider>
                    ),
                    merged
                );
            },
            dismissAll: (reason?: unknown) => dialogs.dismissAll(reason),
            get dialogs() {
                return dialogs.dialogs;
            },
            get hasOpenDialogs() {
                return dialogs.hasOpenDialogs;
            },
            get openDialogCount() {
                return dialogs.openDialogCount;
            }
        }),
        [dialogs, defaults]
    );
}

/** The `MessageBoxRef` of the message box this component is rendered in (Angular's `inject(MessageBoxRef)`). */
export function useMessageBoxRef<T = unknown, P = unknown>(): MessageBoxRef<T, P> {
    return useDialogRef<T, P>();
}

/** The message box rendered for a `MessageBoxContent` object. */
function MessageBoxDefault({ content: c }: { content: MessageBoxContent }) {
    const config = useContext(MessageBoxConfigContext);
    const id = `fd-message-box-default-${useId()}`;
    const approve = useRef<HTMLButtonElement | null>(null);
    const contentId = c.contentId || `${id}-content`;
    return (
        <MessageBox
            // the body describes the message box unless the config names another element
            aria-describedby={config?.ariaDescribedBy ?? contentId}
            // without a focus trap the window itself takes the focus
            initialFocus={c.approveButton && config?.focusTrapped !== false ? approve : undefined}
        >
            <MessageBoxHeader>
                <MessageBoxTitle id={c.titleId || `${id}-title`} level={c.titleHeadingLevel ?? 2}>
                    {c.title}
                </MessageBoxTitle>
            </MessageBoxHeader>
            <MessageBoxBody id={contentId}>{c.content}</MessageBoxBody>
            {(c.approveButton || c.cancelButton) && (
                <MessageBoxFooter>
                    {c.approveButton && (
                        <ButtonBar
                            ref={approve}
                            variant="emphasized"
                            id={c.approveButtonId || `${id}-approve`}
                            label={c.approveButton}
                            aria-label={c.approveButtonAriaLabel}
                            onClick={() => c.approveButtonCallback?.()}
                        />
                    )}
                    {c.cancelButton && (
                        <ButtonBar
                            id={c.cancelButtonId || `${id}-cancel`}
                            label={c.cancelButton}
                            aria-label={c.cancelButtonAriaLabel}
                            onClick={() => c.cancelButtonCallback?.()}
                        />
                    )}
                </MessageBoxFooter>
            )}
        </MessageBox>
    );
}
