/*
 * Port of fundamental-react (Forms) and @fundamental-ngx/core (form) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
    Children,
    isValidElement,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import {
    getPlacement,
    normalizeTriggers,
    popoverArrowClassName,
    popoverSurfaceVariants,
    type Placement,
    type PopoverFillMode,
    type TriggerConfig
} from '@/ui/popover/popover';
import { FormMessage, FormMessageGroupContext, type FormMessageRegistration } from './form-message';

const DEFAULT_TRIGGERS = ['focusin', 'focusout'] as const;
const HOVER_EVENTS = new Set(['mouseenter', 'mouseleave', 'mouseover', 'mouseout']);
const LEAVE_EVENTS = new Set(['focusout', 'mouseleave', 'mouseout']);
/** Size of the popover arrow, also the gap between the field and a message with an arrow (0.5rem). */
const ARROW_SIZE = 8;

/**
 * The fields a message describes: native fields and the focusable controls of Base UI (checkbox, radio, switch,
 * ...), not the hidden inputs behind those.
 */
const FIELDS = [
    'input:not([type=hidden]):not([aria-hidden=true])',
    'textarea',
    'select',
    '[contenteditable]:not([contenteditable=false])',
    '[role=checkbox]',
    '[role=radio]',
    '[role=switch]',
    '[role=combobox]',
    '[role=slider]',
    '[role=spinbutton]',
    '[role=textbox]'
].join(', ');

/** What the group added to a field, so that it removes only that. */
interface Managed {
    id: string | null;
    invalid: boolean;
}

const tokens = (value: string | null) => (value ?? '').split(/\s+/).filter(Boolean);

/**
 * Adds the message id to the field's `aria-describedby` (after the field's own ids) and, for an error, sets
 * `aria-invalid`; removes what it added when the message goes. An `aria-errormessage` the field points at is moved
 * to `aria-describedby`, as in Angular. Setting an attribute only when it differs keeps the observer quiet.
 */
function linkField(el: HTMLElement, message: FormMessageRegistration | null, managed: WeakMap<HTMLElement, Managed>) {
    const own = managed.get(el) ?? { id: null, invalid: false };
    let ids = tokens(el.getAttribute('aria-describedby'));
    if (own.id) ids = ids.filter((id) => id !== own.id);
    let id: string | null = null;
    if (message) {
        const errormessage = el.getAttribute('aria-errormessage');
        if (errormessage) el.removeAttribute('aria-errormessage');
        id = errormessage || message.id;
        if (!ids.includes(id)) ids.push(id);
        else if (own.id !== id) id = null; // the field's own id: not the group's to remove
    }
    const describedBy = ids.join(' ');
    if ((el.getAttribute('aria-describedby') ?? '') !== describedBy) {
        if (describedBy) el.setAttribute('aria-describedby', describedBy);
        else el.removeAttribute('aria-describedby');
    }
    let invalid = own.invalid;
    if (message?.type === 'error') {
        if (el.getAttribute('aria-invalid') !== 'true') {
            el.setAttribute('aria-invalid', 'true');
            invalid = true;
        }
    } else if (own.invalid) {
        if (el.getAttribute('aria-invalid') === 'true') el.removeAttribute('aria-invalid');
        invalid = false;
    }
    managed.set(el, { id, invalid });
}

export interface FormInputMessageGroupProps extends Omit<ComponentProps<'div'>, 'children'> {
    /** The field (input, textarea, checkbox, radio group, ...) and its `FormMessage`. */
    children?: ReactNode;
    /**
     * Events on the field that show and hide the message (default: focus). With several, even entries open and
     * odd entries close, or pass `{ trigger, openAction, closeAction }`; `[]` leaves it to `open`.
     */
    triggers?: readonly (string | TriggerConfig)[];
    /** Hides the message on a press outside the field and the message (default false). */
    closeOnOutsideClick?: boolean;
    /** Hides the message on Escape (default false). */
    closeOnEscapeKey?: boolean;
    /** Hides the arrow (default true). */
    noArrow?: boolean;
    /** Message width relative to the field: `at-least` as wide, `equal` exactly as wide, `fit-content` its content. */
    fillControlMode?: PopoverFillMode | null;
    /** Placement of the message (default `bottom-start`). */
    placement?: Placement;
    /** Accessible name of the message popover. */
    popoverAriaLabel?: string;
    /** Whether the message is shown (controlled). */
    open?: boolean;
    /** Whether the message is shown initially (uncontrolled). */
    defaultOpen?: boolean;
    /** Called when the message is shown or hidden. */
    onOpenChange?: (open: boolean) => void;
}

/**
 * Shows the `FormMessage` among its children in a popover under the field (on focus by default). The popup is
 * Base UI's Tooltip with the SAP popover surface: positioned like a popover, but without focus management, so Tab
 * moves from the field to the next field and focus never leaves the field when the message opens. The message describes the field (`aria-describedby`, after the field's own ids) and an `error` message
 * marks it invalid (`aria-invalid`). The message stays in the DOM while hidden, so the description is always
 * there; focus stays in the field.
 *
 * ```tsx
 * <FormInputMessageGroup>
 *     <Input id="vat" state="error" />
 *     <FormMessage type="error">Enter a valid VAT number.</FormMessage>
 * </FormInputMessageGroup>
 * ```
 */
export function FormInputMessageGroup({
    children,
    triggers = DEFAULT_TRIGGERS,
    closeOnOutsideClick = false,
    closeOnEscapeKey = false,
    noArrow = true,
    fillControlMode = null,
    placement = 'bottom-start',
    popoverAriaLabel = 'Field validation messages',
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    className,
    ...props
}: FormInputMessageGroupProps) {
    const [message, setMessage] = useState<FormMessageRegistration | null>(null);
    const [openState, setOpenState] = useState(defaultOpen);
    const open = openProp ?? openState;
    const openRef = useRef(open);
    openRef.current = open;
    const control = useRef<HTMLDivElement | null>(null);
    const body = useRef<HTMLDivElement | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [managed] = useState(() => new WeakMap<HTMLElement, Managed>());

    const setOpen = useCallback(
        (next: boolean) => {
            clearTimeout(closeTimer.current);
            if (openRef.current === next) return;
            openRef.current = next;
            if (openProp === undefined) setOpenState(next);
            onOpenChange?.(next);
        },
        [openProp, onOpenChange]
    );
    const closeSoon = useCallback(() => {
        clearTimeout(closeTimer.current);
        // a short delay, so the pointer can move onto the message (e.g. to a link in it) and back
        closeTimer.current = setTimeout(() => setOpen(false), 100);
    }, [setOpen]);

    // describe the fields with the message, and keep them described when they re-render
    useLayoutEffect(() => {
        const root = control.current;
        if (!root) return;
        const link = () => root.querySelectorAll<HTMLElement>(FIELDS).forEach((el) => linkField(el, message, managed));
        link();
        const observer = new MutationObserver(link);
        observer.observe(root, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['aria-describedby', 'aria-invalid', 'aria-errormessage']
        });
        return () => {
            observer.disconnect();
            root.querySelectorAll<HTMLElement>(FIELDS).forEach((el) => linkField(el, null, managed));
        };
    }, [message, managed]);

    const { side, align } = getPlacement(placement);
    const normalized = useMemo(() => normalizeTriggers(triggers), [triggers]);
    const hover = normalized.some((t) => HOVER_EVENTS.has(t.trigger));

    // the trigger events, listened to on the field
    useEffect(() => {
        const el = control.current;
        if (!el) return;
        const offs = normalized.map((t) => {
            const listener = (event: Event) => {
                const related = (event as FocusEvent | MouseEvent).relatedTarget as Node | null;
                // moving within the field, or between the field and the message, keeps it open
                const within =
                    LEAVE_EVENTS.has(event.type) &&
                    !!related &&
                    (el.contains(related) || !!body.current?.contains(related));
                if (openRef.current) {
                    if (!t.closeAction || within) return;
                    if (HOVER_EVENTS.has(t.trigger)) closeSoon();
                    else setOpen(false);
                } else if (t.openAction) {
                    setOpen(true);
                }
                if (t.stopPropagation) event.stopImmediatePropagation();
            };
            el.addEventListener(t.trigger, listener);
            return () => el.removeEventListener(t.trigger, listener);
        });
        return () => {
            offs.forEach((off) => off());
            clearTimeout(closeTimer.current);
        };
    }, [normalized, setOpen, closeSoon]);

    const messages: ReactNode[] = [];
    const field: ReactNode[] = [];
    Children.forEach(children, (child) => {
        (isValidElement(child) && child.type === FormMessage ? messages : field).push(child);
    });

    return (
        <div {...props} data-slot="form-input-message-group" className={cn('block', className)}>
            <FormMessageGroupContext value={setMessage}>
                <BaseTooltip.Root
                    open={open}
                    onOpenChange={(next, details) => {
                        const target = details.event?.target as Node | null;
                        const allowed =
                            (details.reason === 'escape-key' && closeOnEscapeKey) ||
                            // presses in the field are not outside: its triggers handle them
                            (details.reason === 'outside-press' &&
                                closeOnOutsideClick &&
                                !(target && control.current?.contains(target)));
                        if (!allowed) {
                            details.cancel();
                            return;
                        }
                        setOpen(next);
                    }}
                >
                    <div ref={control} className="block [&_input]:block">
                        {field}
                    </div>
                    <BaseTooltip.Portal keepMounted>
                        <BaseTooltip.Positioner
                            anchor={control}
                            side={side}
                            align={align}
                            sideOffset={noArrow ? 0 : ARROW_SIZE}
                            arrowPadding={ARROW_SIZE}
                            className="z-[999]"
                        >
                            <BaseTooltip.Popup
                                ref={body}
                                role="dialog"
                                aria-label={popoverAriaLabel}
                                className={cn(
                                    popoverSurfaceVariants({ arrow: !noArrow }),
                                    '[box-shadow:none] border-0'
                                )}
                                style={{
                                    minWidth: fillControlMode === 'at-least' ? 'var(--anchor-width)' : undefined,
                                    width: fillControlMode === 'equal' ? 'var(--anchor-width)' : undefined
                                }}
                                onMouseEnter={hover ? () => clearTimeout(closeTimer.current) : undefined}
                                onMouseLeave={
                                    hover
                                        ? (event) => {
                                              if (!control.current?.contains(event.relatedTarget as Node | null))
                                                  closeSoon();
                                          }
                                        : undefined
                                }
                            >
                                {!noArrow && <BaseTooltip.Arrow className={popoverArrowClassName} />}
                                {messages}
                            </BaseTooltip.Popup>
                        </BaseTooltip.Positioner>
                    </BaseTooltip.Portal>
                </BaseTooltip.Root>
            </FormMessageGroupContext>
        </div>
    );
}
