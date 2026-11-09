/*
 * Port of fundamental-react (MessageStrip) and @fundamental-ngx/core (message-strip) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type MouseEvent,
    type ReactNode,
    type Ref
} from 'react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/ui/button/button';
import { Icon } from '@/ui/icon/icon';

export type MessageStripType = 'warning' | 'success' | 'information' | 'error';
export type MessageStripIndicationColor =
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '1b'
    | '2b'
    | '3b'
    | '4b'
    | '5b'
    | '6b'
    | '7b'
    | '8b'
    | '9b'
    | '10b';

export const MESSAGE_STRIP_TYPES: MessageStripType[] = ['information', 'success', 'warning', 'error'];
export const MESSAGE_STRIP_INDICATION_COLORS: MessageStripIndicationColor[] = [
    '1',
    '1b',
    '2',
    '2b',
    '3',
    '3b',
    '4',
    '4b',
    '5',
    '5b',
    '6',
    '6b',
    '7',
    '7b',
    '8',
    '8b',
    '9',
    '9b',
    '10',
    '10b'
];

/** Background (--ms-bg), border (--ms-bc) and icon (--ms-ic) colours of each type. */
const TYPE: Record<MessageStripType | 'neutral', string> = {
    neutral:
        '[--ms-bg:var(--sapNeutralBackground)] [--ms-bc:var(--sapNeutralBorderColor)] [--ms-ic:var(--sapNeutralElementColor)]',
    warning:
        '[--ms-bg:var(--sapWarningBackground)] [--ms-bc:var(--sapMessage_WarningBorderColor)] [--ms-ic:var(--sapCriticalElementColor)]',
    error: '[--ms-bg:var(--sapErrorBackground)] [--ms-bc:var(--sapMessage_ErrorBorderColor)] [--ms-ic:var(--sapNegativeElementColor)]',
    success:
        '[--ms-bg:var(--sapSuccessBackground)] [--ms-bc:var(--sapMessage_SuccessBorderColor)] [--ms-ic:var(--sapPositiveElementColor)]',
    information:
        '[--ms-bg:var(--sapInformationBackground)] [--ms-bc:var(--sapMessage_InformationBorderColor)] [--ms-ic:var(--sapInformativeElementColor)]'
};
const INDICATION: Record<MessageStripIndicationColor, string> = {
    '1': '[--ms-bg:var(--sapIndicationColor_1_Background)] [--ms-bc:var(--sapIndicationColor_1_BorderColor)]',
    '2': '[--ms-bg:var(--sapIndicationColor_2_Background)] [--ms-bc:var(--sapIndicationColor_2_BorderColor)]',
    '3': '[--ms-bg:var(--sapIndicationColor_3_Background)] [--ms-bc:var(--sapIndicationColor_3_BorderColor)]',
    '4': '[--ms-bg:var(--sapIndicationColor_4_Background)] [--ms-bc:var(--sapIndicationColor_4_BorderColor)]',
    '5': '[--ms-bg:var(--sapIndicationColor_5_Background)] [--ms-bc:var(--sapIndicationColor_5_BorderColor)]',
    '6': '[--ms-bg:var(--sapIndicationColor_6_Background)] [--ms-bc:var(--sapIndicationColor_6_BorderColor)]',
    '7': '[--ms-bg:var(--sapIndicationColor_7_Background)] [--ms-bc:var(--sapIndicationColor_7_BorderColor)]',
    '8': '[--ms-bg:var(--sapIndicationColor_8_Background)] [--ms-bc:var(--sapIndicationColor_8_BorderColor)]',
    '9': '[--ms-bg:var(--sapIndicationColor_9_Background)] [--ms-bc:var(--sapIndicationColor_9_BorderColor)]',
    '10': '[--ms-bg:var(--sapIndicationColor_10_Background)] [--ms-bc:var(--sapIndicationColor_10_BorderColor)]',
    '1b': '[--ms-bg:var(--sapIndicationColor_1b_Background)] [--ms-bc:var(--sapIndicationColor_1b_BorderColor)]',
    '2b': '[--ms-bg:var(--sapIndicationColor_2b_Background)] [--ms-bc:var(--sapIndicationColor_2b_BorderColor)]',
    '3b': '[--ms-bg:var(--sapIndicationColor_3b_Background)] [--ms-bc:var(--sapIndicationColor_3b_BorderColor)]',
    '4b': '[--ms-bg:var(--sapIndicationColor_4b_Background)] [--ms-bc:var(--sapIndicationColor_4b_BorderColor)]',
    '5b': '[--ms-bg:var(--sapIndicationColor_5b_Background)] [--ms-bc:var(--sapIndicationColor_5b_BorderColor)]',
    '6b': '[--ms-bg:var(--sapIndicationColor_6b_Background)] [--ms-bc:var(--sapIndicationColor_6b_BorderColor)]',
    '7b': '[--ms-bg:var(--sapIndicationColor_7b_Background)] [--ms-bc:var(--sapIndicationColor_7b_BorderColor)]',
    '8b': '[--ms-bg:var(--sapIndicationColor_8b_Background)] [--ms-bc:var(--sapIndicationColor_8b_BorderColor)]',
    '9b': '[--ms-bg:var(--sapIndicationColor_9b_Background)] [--ms-bc:var(--sapIndicationColor_9b_BorderColor)]',
    '10b': '[--ms-bg:var(--sapIndicationColor_10b_Background)] [--ms-bc:var(--sapIndicationColor_10b_BorderColor)]'
};
/** Text and icon colours on a strong (1-10) or light (1b-10b) indication background. */
const INDICATION_STRONG =
    '[--ms-tc:var(--sapContent_ContrastTextColor)] [--ms-ic:var(--sapContent_ContrastTextColor)] [--ms-btn:var(--sapContent_ContrastIconColor)] [--ms-focus:var(--sapContent_ContrastFocusColor)] [text-shadow:var(--sapContent_ContrastTextShadow)] [&_a]:[text-shadow:var(--sapContent_ContrastTextShadow)] [&_a]:text-sap-content-contrast-text-color [&_a:hover]:text-sap-content-contrast-text-color';
const INDICATION_LIGHT =
    '[--ms-tc:var(--sapTextColor)] [--ms-ic:var(--sapContent_IconColor)] [--ms-btn:var(--sapContent_IconColor)] [--ms-focus:var(--sapContent_FocusColor)] [text-shadow:none] [&_a]:[text-shadow:none] [&_a]:text-sap-link-subtle-color [&_a:hover]:text-sap-link-subtle-color';

const GLYPH: Record<MessageStripType, string> = {
    warning: 'alert',
    success: 'sys-enter-2',
    error: 'error',
    information: 'information'
};
const ANNOUNCEMENT: Record<MessageStripType, string> = {
    warning: 'Warning Message Strip',
    success: 'Success Message Strip',
    error: 'Error Message Strip',
    information: 'Information Message Strip'
};

/** Imperative actions of a message strip, through `actionsRef`. */
export interface MessageStripActions {
    /** Shows the strip (and starts the auto-dismiss timer). */
    open(): void;
    /** Hides the strip and calls `onDismiss`, as the dismiss button does. */
    dismiss(): void;
}

export interface MessageStripProps extends Omit<ComponentProps<'div'>, 'children'> {
    children?: ReactNode;
    /** Semantic type: colours, icon and screen reader description. Without one the strip is neutral. */
    type?: MessageStripType | null;
    /** Generic colour 1-10 (strong) or 1b-10b (light), instead of a type. */
    indicationColor?: MessageStripIndicationColor | null;
    /** Shows the dismiss button. */
    dismissible?: boolean;
    /** Hides the type icon (and a custom `icon`). */
    noIcon?: boolean;
    /** Custom icon, e.g. `<Icon glyph="survey" />`, instead of the type icon. */
    icon?: ReactNode;
    /** Label and title of the dismiss button; defaults to "<type> Message Strip Close". */
    dismissBtnTitle?: string | null;
    /** Props of the dismiss button, e.g. `data-*` attributes. */
    dismissButtonProps?: Partial<ButtonProps>;
    /** CSS width, e.g. `300px` or `50%`. */
    width?: string;
    /** CSS minimum width. */
    minWidth?: string;
    /** CSS bottom margin. */
    marginBottom?: string;
    /** Whether the strip is shown (controlled). */
    open?: boolean;
    /** Whether the strip is shown at first (uncontrolled). Defaults to true, or false with `autoDismiss`. */
    defaultOpen?: boolean;
    /** Called when the strip is shown or hidden by its dismiss button, the timer or `actionsRef`. */
    onOpenChange?: (open: boolean) => void;
    /** Called when the strip is dismissed: dismiss button, auto-dismiss timer or `actionsRef.dismiss()`. */
    onDismiss?: () => void;
    /** Dismisses a dismissible strip `duration` ms after it opens. */
    autoDismiss?: boolean;
    /** Milliseconds before auto-dismissal; negative values never dismiss. */
    duration?: number;
    /** Keeps an auto-dismissing strip open while the pointer is over it, and restarts the timer on leave. */
    mousePersist?: boolean;
    /** Imperative `open()` and `dismiss()`. */
    actionsRef?: Ref<MessageStripActions>;
}

/**
 * Message strip: an inline message about the current context, coloured by type or by an indication colour,
 * optionally dismissible or dismissing itself after a delay. It is a `note` named by its type and its text.
 *
 * ```tsx
 * <MessageStrip type="warning">Your session expires in 5 minutes.</MessageStrip>
 * <MessageStrip indicationColor="6" icon={<Icon glyph="survey" />}>Survey open</MessageStrip>
 * <MessageStrip type="success" autoDismiss duration={5000} open={saved} onOpenChange={setSaved}>Saved</MessageStrip>
 * ```
 */
export function MessageStrip({
    type,
    indicationColor,
    dismissible = true,
    noIcon = false,
    icon,
    dismissBtnTitle,
    dismissButtonProps,
    width,
    minWidth,
    marginBottom,
    open: openProp,
    defaultOpen,
    onOpenChange,
    onDismiss,
    autoDismiss = false,
    duration = 10000,
    mousePersist = false,
    actionsRef,
    id: idProp,
    ref,
    className,
    style,
    children,
    onMouseEnter,
    onMouseLeave,
    ...props
}: MessageStripProps) {
    const autoId = useId();
    const id = idProp ?? `fd-message-strip-${autoId}`;

    const [openState, setOpenState] = useState(defaultOpen ?? !autoDismiss);
    const open = openProp ?? openState;

    const element = useRef<HTMLDivElement | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const pointerInside = useRef(false);

    const stop = () => {
        clearTimeout(timer.current);
        timer.current = undefined;
    };

    const setOpen = (next: boolean) => {
        if (openProp === undefined) setOpenState(next);
        onOpenChange?.(next);
    };
    const dismiss = () => {
        stop();
        setOpen(false);
        onDismiss?.();
    };

    // the timer calls the latest dismiss, with the latest callbacks
    const latest = useRef({ dismiss, autoDismiss, dismissible, open, duration, mousePersist });
    useLayoutEffect(() => {
        latest.current = { dismiss, autoDismiss, dismissible, open, duration, mousePersist };
    });

    const start = () => {
        const current = latest.current;
        if (!current.autoDismiss || !current.dismissible || !current.open || current.duration < 0) return;
        if (current.mousePersist && pointerInside.current) return;
        stop();
        timer.current = setTimeout(() => latest.current.dismiss(), current.duration);
    };

    // (re)start the timer whenever the strip opens
    useEffect(() => {
        if (!open || !autoDismiss) return;
        pointerInside.current = element.current?.matches(':hover') ?? false;
        stop();
        start();
        return stop;
    }, [open, autoDismiss, dismissible, duration]);

    useImperativeHandle(actionsRef, () => ({ open: () => setOpen(true), dismiss }));

    const pointerChange = (inside: boolean) => {
        pointerInside.current = inside;
        if (!mousePersist) return;
        if (inside) stop();
        else start();
    };

    const showIcon = !noIcon && (icon != null || !!type);
    const hiddenText = type ? (dismissible ? `${ANNOUNCEMENT[type]} Closable` : ANNOUNCEMENT[type]) : 'Message strip';
    const closeLabel = dismissBtnTitle || (type ? `${ANNOUNCEMENT[type]} Close` : 'Close');

    return (
        <div
            role="note"
            {...props}
            aria-labelledby={props['aria-labelledby'] || `${id}-hidden-text ${id}-content-text`}
            id={id}
            ref={(node: HTMLDivElement | null) => {
                element.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            style={{ width, minWidth, marginBottom, ...style }}
            className={cn(
                'relative m-0 box-border block h-auto min-h-8 py-[0.4375rem] font-sap-font-family text-sap-font-size',
                'border-solid border-width-sap-message-border-width border-(--ms-bc) bg-(--ms-bg) rounded-sap-popover-border-corner-radius',
                '[--ms-tc:var(--sapTextColor)] [--ms-btn:var(--sapButton_Lite_TextColor)] [--ms-focus:var(--sapContent_FocusColor)]',
                showIcon ? 'ps-[2.4375rem]' : 'ps-[0.9375rem]',
                dismissible ? 'pe-[2.4375rem]' : 'pe-[0.9375rem]',
                TYPE[type ?? 'neutral'],
                indicationColor && [
                    INDICATION[indicationColor],
                    indicationColor.endsWith('b') ? INDICATION_LIGHT : INDICATION_STRONG
                ],
                !open && 'hidden',
                className
            )}
            onMouseEnter={(event: MouseEvent<HTMLDivElement>) => {
                pointerChange(true);
                onMouseEnter?.(event);
            }}
            onMouseLeave={(event: MouseEvent<HTMLDivElement>) => {
                pointerChange(false);
                onMouseLeave?.(event);
            }}
        >
            {showIcon && (
                <div
                    className="absolute start-0 top-[0.4375rem] m-0 flex w-10 items-center justify-center p-0 text-[1rem] leading-[normal] text-(--ms-ic) [&>*]:flex [&>*]:size-4 [&>*]:items-center [&>*]:justify-center [&>*]:leading-none"
                    aria-hidden="true"
                >
                    {icon ?? (type && <Icon glyph={GLYPH[type]} />)}
                </div>
            )}
            <span className="sr-only-sap" id={`${id}-hidden-text`}>
                {hiddenText}
            </span>
            <p
                className="m-0 p-0 leading-4 break-words whitespace-normal text-(--ms-tc) [&_a]:ms-1 [&_a]:px-1"
                id={`${id}-content-text`}
            >
                {children}
            </p>
            {dismissible && (
                <Button
                    variant="transparent"
                    glyph="decline"
                    data-density="compact"
                    aria-controls={id}
                    aria-label={closeLabel}
                    title={closeLabel}
                    {...dismissButtonProps}
                    className={cn(
                        'absolute end-0.5 top-0.5',
                        indicationColor && [
                            'text-(--ms-btn) enabled-hover:text-(--ms-btn) enabled-active:text-(--ms-btn)',
                            'enabled-hover:bg-sap-message-button-hover-background enabled-hover:border-(--ms-btn)',
                            'enabled-active:bg-sap-message-button-hover-background enabled-active:border-(--ms-btn)',
                            'focus:after:border-(--ms-focus)',
                            // focused: no background or border, unless hovered (fundamental-styles; visible in HC)
                            'focus:bg-transparent focus:border-transparent',
                            'focus:enabled-hover:bg-sap-message-button-hover-background focus:enabled-hover:border-(--ms-btn)'
                        ],
                        dismissButtonProps?.className
                    )}
                    onClick={(event) => {
                        dismissButtonProps?.onClick?.(event);
                        dismiss();
                    }}
                />
            )}
        </div>
    );
}
