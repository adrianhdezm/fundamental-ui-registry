/*
 * Port of @fundamental-ngx/core (object-identifier) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The links in the title that are named by the identifier: anchors and `role="link"` elements. */
const LINKS = 'a, [role="link"]';

export interface ObjectIdentifierProps extends useRender.ComponentProps<'div'> {
    /** Text below the title. */
    description?: ReactNode;
    /** Bold title, for the key identifier of an object. */
    bold?: boolean;
    /** Regular font size instead of the large one, e.g. inside table cells. */
    medium?: boolean;
    /** Hidden text announced as the kind of element. */
    objectIdentifierLabel?: string;
}

/**
 * Object identifier: the title of an object, optionally a link, with a description below. `children` is the
 * title; a link in it (e.g. a `Link`) takes the title's font size and weight and is named by its own text, the
 * hidden "Object Identifier" text and the description. Renders a `<div>`; `render` renders another element.
 *
 * ```tsx
 * <ObjectIdentifier bold description="Laptop, 15 inch">Notebook Basic 15</ObjectIdentifier>
 * <ObjectIdentifier description="Order 4711"><Link href="/orders/4711">Order</Link></ObjectIdentifier>
 * ```
 */
export function ObjectIdentifier({
    description,
    bold = false,
    medium = false,
    objectIdentifierLabel = 'Object Identifier',
    id: idProp,
    render,
    className,
    children,
    ...props
}: ObjectIdentifierProps) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const hasDescription = description != null && description !== '' && description !== false;
    const titleRef = useRef<HTMLParagraphElement>(null);
    const [hasLinks, setHasLinks] = useState(false);

    // links in the title are named by their own text, the role text and the description; runs after every render
    // and when the title's content changes on its own (e.g. a child component that shows a link later)
    useLayoutEffect(() => {
        const title = titleRef.current;
        if (!title) return;
        const extra = hasDescription ? `${id}-description ${id}-text` : `${id}-description`;
        const label = () => {
            const links = [...title.querySelectorAll<HTMLElement>(LINKS)];
            links.forEach((link, index) => {
                link.id ||= `${id}-link-${index}`;
                link.setAttribute('aria-labelledby', `${link.id} ${extra}`);
            });
            setHasLinks(links.length > 0);
        };
        label();
        const observer = new MutationObserver(label);
        observer.observe(title, { childList: true, subtree: true });
        return () => observer.disconnect();
    });

    return useRender({
        render,
        defaultTagName: 'div',
        props: {
            ...props,
            id,
            className: cn('block font-sap-font-family text-sap-font-size', className),
            children: (
                <>
                    <p
                        ref={titleRef}
                        id={`${id}-title`}
                        className={cn(
                            'm-0 p-0 text-sap-list-text-color',
                            medium ? 'text-sap-font-size' : 'text-sap-font-large-size',
                            bold && 'font-bold',
                            '[&_a]:[font-size:inherit] [&_a]:[font-weight:inherit] [&_[role=link]]:[font-size:inherit] [&_[role=link]]:[font-weight:inherit]'
                        )}
                    >
                        {children}
                    </p>
                    {hasDescription && (
                        <p className="m-0 mt-2 p-0 leading-normal text-sap-content-label-color" id={`${id}-text`}>
                            {description}
                        </p>
                    )}
                    <span className="sr-only-sap" id={`${id}-description`} aria-hidden={hasLinks || undefined}>
                        {objectIdentifierLabel}
                    </span>
                </>
            )
        }
    });
}
