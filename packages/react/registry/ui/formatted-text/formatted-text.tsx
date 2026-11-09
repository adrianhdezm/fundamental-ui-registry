/*
 * Port of @fundamental-ngx/core (formatted-text) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useRender } from '@base-ui/react/use-render';
import { useMemo, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

export type LinkTarget = '' | '_blank' | '_self' | '_top' | '_parent' | '_search';

/** Elements that are kept, with the allowed attributes. */
const TAGS = new Set([
    'A',
    'ABBR',
    'BLOCKQUOTE',
    'BR',
    'CITE',
    'CODE',
    'DL',
    'DT',
    'DD',
    'EM',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'P',
    'PRE',
    'STRONG',
    'SPAN',
    'U',
    'UL',
    'OL',
    'LI'
]);
const ATTRIBUTES = ['class', 'style', 'href', 'target', 'download', 'hreflang', 'rel', 'type', 'title'];
/** Elements removed with their content. */
const DROPPED = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH']);
const SAFE_SCHEMES = ['http', 'https', 'ftp', 'mailto'];

/**
 * Keeps allow-listed tags and attributes only; other elements are dropped but keep their text, except scripts,
 * styles, templates, frames, objects, SVG and MathML, which go with their content. Event handlers and every other
 * attribute are removed. Links with a scheme other than http(s), ftp or mailto lose their href; links that leave the
 * page open in `linkTarget` (none for in-page `#` links), and `_blank` adds `rel="noopener"`.
 *
 * The input is parsed in an inert document (nothing runs or loads) and copied node by node into another one, so
 * only the allowed markup reaches the page. Needs a DOM (`DOMParser`).
 */
export function sanitizeFormattedText(html: string, linkTarget: LinkTarget = '_blank'): string {
    const doc = new DOMParser().parseFromString(`<body>${html.trim()}</body>`, 'text/html');
    const target = document.implementation.createHTMLDocument('');
    const copy = (node: Node, into: Node): void => {
        for (const child of Array.from(node.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
                into.appendChild(target.createTextNode(child.textContent ?? ''));
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const source = child as Element;
                const tag = source.tagName.toUpperCase();
                if (TAGS.has(tag) && source.namespaceURI === 'http://www.w3.org/1999/xhtml') {
                    const el = target.createElement(tag);
                    for (const name of ATTRIBUTES) {
                        const value = source.getAttribute(name);
                        if (value === null) continue;
                        if (
                            name === 'href' &&
                            value.includes(':') &&
                            !SAFE_SCHEMES.some((s) => value.startsWith(`${s}:`))
                        )
                            continue;
                        el.setAttribute(name, value);
                    }
                    if (tag === 'A') {
                        const href = el.getAttribute('href');
                        if (!href || href.startsWith('#')) el.removeAttribute('target');
                        else if (linkTarget) el.setAttribute('target', linkTarget);
                        if (
                            el.getAttribute('target') === '_blank' &&
                            !/\bnoopener\b/.test(el.getAttribute('rel') ?? '')
                        )
                            el.setAttribute('rel', `${el.getAttribute('rel') ?? ''} noopener`.trim());
                    }
                    copy(source, el);
                    into.appendChild(el);
                } else if (!DROPPED.has(tag)) {
                    // other tags are dropped but their text is kept
                    copy(source, into);
                }
            }
        }
    };
    const out = target.createElement('div');
    copy(doc.body, out);
    return out.innerHTML;
}

/** Restores document typography that Tailwind's preflight removes, with SAP fonts and sizes. */
const TYPOGRAPHY = [
    'block font-sap-font-family text-sap-font-size leading-(--sapContent_LineHeight) text-sap-text-color',
    '[&_p]:my-[0.5em] [&_blockquote]:my-[0.5em] [&_blockquote]:mx-8 [&_pre]:my-[0.5em] [&_dl]:my-[0.5em] [&_dd]:ms-8',
    '[&_ul]:my-[0.5em] [&_ul]:list-disc [&_ul]:ps-8 [&_ol]:my-[0.5em] [&_ol]:list-decimal [&_ol]:ps-8',
    '[&_h1]:my-[0.5em] [&_h2]:my-[0.5em] [&_h3]:my-[0.5em] [&_h4]:my-[0.5em] [&_h5]:my-[0.5em] [&_h6]:my-[0.5em]',
    '[&_h1]:font-sap-font-header-family [&_h2]:font-sap-font-header-family [&_h3]:font-sap-font-header-family',
    '[&_h4]:font-sap-font-header-family [&_h5]:font-sap-font-header-family [&_h6]:font-sap-font-header-family',
    '[&_h1]:text-sap-font-header1-size [&_h2]:text-sap-font-header2-size [&_h3]:text-sap-font-header3-size',
    '[&_h4]:text-sap-font-header4-size [&_h5]:text-sap-font-header5-size [&_h6]:text-sap-font-header6-size',
    '[&_strong]:font-sap-font-bold-family [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_abbr]:underline [&_abbr]:decoration-dotted',
    '[&_code]:font-sap-content-monospace-font-family [&_pre]:font-sap-content-monospace-font-family',
    '[&_a]:text-sap-link-color [&_a]:underline-offset-[0.125rem] [&_a:hover]:text-sap-link-hover-color [&_a:hover]:underline [&_a:focus-visible]:outline-sap'
].join(' ');

const subscribe = () => () => {};

export interface FormattedTextProps extends Omit<useRender.ComponentProps<'div'>, 'children'> {
    /** The HTML to show; reduced to the allowed subset (see `sanitizeFormattedText`). */
    htmlText?: string | null;
    /** Target of links that leave the page. */
    convertedLinksDefaultTarget?: LinkTarget;
    /** Fixed height, e.g. `"10rem"`; the content scrolls vertically. */
    height?: string | null;
    /** Fixed width, e.g. `"20rem"`; the content scrolls horizontally. */
    width?: string | null;
}

/**
 * Formatted text: renders a limited, sanitised subset of HTML (paragraphs, headings, lists, emphasis, links, code)
 * with the SAP typography. Scripts, images, event handlers and unsafe link schemes are removed before the markup
 * reaches the page. On the server it renders empty and fills in when hydrated, as sanitising needs a DOM.
 *
 * ```tsx
 * <FormattedText htmlText={releaseNotes} height="10rem" />
 * ```
 */
export function FormattedText({
    htmlText,
    convertedLinksDefaultTarget = '_blank',
    height,
    width,
    render,
    ref,
    className,
    style,
    ...props
}: FormattedTextProps) {
    // sanitising needs a DOM: nothing on the server, the content once on the client
    const client = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );
    const html = useMemo(
        () => (client && htmlText?.trim() ? sanitizeFormattedText(htmlText, convertedLinksDefaultTarget) : ''),
        [client, htmlText, convertedLinksDefaultTarget]
    );
    return useRender({
        render,
        ref,
        defaultTagName: 'div',
        props: {
            ...props,
            style: { ...style, height: height || undefined, width: width || undefined },
            className: cn(TYPOGRAPHY, height && 'overflow-y-auto', width && 'overflow-x-auto', className),
            // only the allow-listed markup of sanitizeFormattedText
            dangerouslySetInnerHTML: { __html: html }
        }
    });
}
