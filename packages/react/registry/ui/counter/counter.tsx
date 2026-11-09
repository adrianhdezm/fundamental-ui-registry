/*
 * Port of fundamental-react (Counter) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { cn } from '@/lib/utils';

export interface CounterProps extends useRender.ComponentProps<'span'> {
    /** Notification counter: moved up and towards the start, onto the icon it follows (e.g. a bell button). */
    notification?: boolean;
    /** Announced before the count, e.g. "Unread count 5". Empty for no hidden text. */
    counterLabel?: string;
}

/**
 * Counter: a small badge with a number, such as unread items. The count is the content (minimum 1, shown as "999+"
 * above 999); a hidden `counterLabel` ("Unread count") is read before it. Renders a `<span>`.
 *
 * ```tsx
 * <p>Inbox <Counter>5</Counter></p>
 * <Button glyph="bell" variant="transparent" aria-label="Notifications"><Counter notification>25</Counter></Button>
 * ```
 */
export function Counter({
    notification = false,
    counterLabel = 'Unread count',
    render,
    className,
    children,
    ...props
}: CounterProps) {
    return useRender({
        render,
        defaultTagName: 'span',
        props: {
            ...props,
            className: cn(
                'z-[1] m-0 box-border inline-block h-4 rounded-lg border border-solid border-(--fdBadge_Border_Color) px-[0.3125rem] py-0',
                'bg-sap-content-badge-background text-center font-sap-font-family font-normal text-sap-font-small-size leading-[0.875rem] text-sap-content-badge-text-color [forced-color-adjust:none]',
                notification && '-translate-x-2/5 -translate-y-1/2 rtl:translate-x-2/5',
                className
            ),
            children: (
                <>
                    {counterLabel && <span className="sr-only-sap">{`${counterLabel} `}</span>}
                    {children}
                </>
            )
        }
    });
}
