/*
 * Port of fundamental-react (Pagination) and @fundamental-ngx/core (pagination) with the visual design of fundamental-styles,
 * Copyright (c) SAP SE or an SAP affiliate company and Fundamental Library contributors.
 * Modified for fundamental-ui-registry: rewritten in React with Base UI and Tailwind CSS.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type FocusEvent,
    type KeyboardEvent,
    type ReactNode
} from 'react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/ui/button/button';
import { Input } from '@/ui/input/input';
import { Select, SelectOption } from '@/ui/select/select';

/** The ellipsis between page numbers. */
const MORE = -1;
/** Pages kept at each end and on each side of the current page. */
const CORNER_PAGES = 1;
const SIDE_PAGES = 2;
/** Items per page when `itemsPerPage` is not a number. */
const DEFAULT_ITEMS_PER_PAGE = 10;
/** Screens up to this width get the mobile layout. */
const NARROW = '(max-width: 1023px)';

/** Items per page as upstream coerces them: a number, rounded down, at least 1, or 10 when not a number. */
function normalisePageSize(value: unknown): number {
    const size = typeof value === 'string' && value.trim() === '' ? NaN : Number(value);
    return Math.max(1, Math.floor(Number.isFinite(size) ? size : DEFAULT_ITEMS_PER_PAGE));
}

/** The pages to show: all of them, or the ends and the neighbours of the current page with ellipses (-1). */
export function paginationPages(totalPages: number, currentPage: number): number[] {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const shown = CORNER_PAGES * 2 + SIDE_PAGES * 2 + 1 + 2;
    if (pages.length <= shown) return pages;
    const gap = Math.round(shown / 2);
    if (currentPage - 1 < gap) return [...pages.slice(0, shown - 2), MORE, ...pages.slice(totalPages - CORNER_PAGES)];
    if (totalPages - currentPage < gap)
        return [...pages.slice(0, CORNER_PAGES), MORE, ...pages.slice(totalPages - shown + 2)];
    return [
        ...pages.slice(0, CORNER_PAGES),
        MORE,
        ...pages.slice(currentPage - SIDE_PAGES - 1, currentPage + SIDE_PAGES),
        MORE,
        ...pages.slice(totalPages - CORNER_PAGES)
    ];
}

/** What a pagination shows: the range of items on the current page. */
export interface PaginationShowing {
    from: number;
    to: number;
    totalCount: number;
}

/** What `renderItemsPerPage` gets: the choices and the callback that selects one. */
export interface PaginationItemsPerPageContext {
    onSelect: (size: number) => void;
    pageOptions: number[];
}

/** Props for a button or a span of the pagination, with `data-*` attributes. */
type PartProps<T> = Partial<T> & { [key: `data-${string}`]: string | undefined };

export interface PaginationProps extends Omit<ComponentProps<'div'>, 'children'> {
    /** Number of items; nothing is shown while it is 0. */
    totalItems?: number;
    /** The current page, from 1 (controlled). Rounded down and kept in range. */
    currentPage?: number;
    /** The initial page (uncontrolled). */
    defaultCurrentPage?: number;
    /** Called with the requested page; the page changes when `currentPage` follows (controlled). */
    onCurrentPageChange?: (page: number) => void;
    /** Called with the requested page, as Angular's `pageChangeStart` (at the same moments as `onCurrentPageChange`). */
    onPageChangeStart?: (page: number) => void;
    /** Items per page (controlled). Rounded down and at least 1; 10 when it is not a number. */
    itemsPerPage?: number;
    /** The initial items per page (uncontrolled). */
    defaultItemsPerPage?: number;
    /** Called when the user picks another number of items per page. */
    onItemsPerPageChange?: (size: number) => void;
    /** Choices of a select for the items per page. */
    itemsPerPageOptions?: number[];
    /** Renders the items per page control instead of the select (Angular's `itemsPerPageTemplate`). */
    renderItemsPerPage?: (context: PaginationItemsPerPageContext) => ReactNode;
    /** Shows the number of results (fundamental-react's `displayTotal`). */
    displayTotalItems?: boolean;
    /** Renders the results text (Angular's `displayTextTemplate`). */
    renderDisplayText?: (showing: PaginationShowing) => ReactNode;
    /** The compact mobile layout; also used on screens up to 1023px. */
    mobile?: boolean;
    firstLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
    lastLabel?: string;
    /** `{page}` is replaced. */
    pageLabel?: string;
    pageInputLabel?: string;
    /** `{total}` is replaced. */
    ofLabel?: string;
    itemsPerPageLabel?: string;
    /** `{from}`, `{to}` and `{total}` are replaced. */
    totalResultsLabel?: string;
    /** Announced after a page change; `{page}` and `{total}` are replaced. */
    pageAnnouncement?: string;
    /** Props of the page buttons (fundamental-react's `linkProps`). */
    pageProps?: PartProps<ButtonProps>;
    /** Props of the previous page button (fundamental-react's `prevProps`). */
    previousProps?: PartProps<ButtonProps>;
    /** Props of the next page button (fundamental-react's `nextProps`). */
    nextProps?: PartProps<ButtonProps>;
    /** Props of the results text (fundamental-react's `displayTotalProps`). */
    displayTotalProps?: PartProps<ComponentProps<'span'>>;
}

/** fundamental-styles' form label text (with its text cursor). */
const LABEL = 'shrink-0 cursor-text font-sap-font-family text-sap-font-size text-sap-content-label-color';
/** fundamental-styles turns the media icons in RTL (the arrows mirror themselves). */
const MEDIA_BUTTON = 'rtl:[&_[data-glyph]]:rotate-180';
const PAGE_BUTTON = 'min-w-9 compact:min-w-8';
/** The current page in short paginations looks pressed. */
const CURRENT_BUTTON =
    'min-w-9 compact:min-w-8 bg-sap-button-lite-active-background border-sap-button-lite-active-border-color text-sap-button-active-text-color';

function useNarrow(): boolean {
    const [narrow, setNarrow] = useState(() => typeof matchMedia === 'function' && matchMedia(NARROW).matches);
    useEffect(() => {
        if (typeof matchMedia !== 'function') return;
        const query = matchMedia(NARROW);
        setNarrow(query.matches);
        const listener = (event: MediaQueryListEvent) => setNarrow(event.matches);
        query.addEventListener('change', listener);
        return () => query.removeEventListener('change', listener);
    }, []);
    return narrow;
}

/**
 * Pagination: previous and next buttons, page numbers with ellipses (or, with more than nine pages, an input for the
 * current page), an optional items per page select and the number of results. The arrow keys, Home and End move
 * between the controls, which form one tab stop. In mobile mode (and on screens up to 1023px) it shows first,
 * previous, "Page: [input] of N", next and last. Page changes are announced in a polite live region.
 *
 * Native props, `className` and `ref` go to the root `<div>`; `aria-label` (default "Pagination") names the `<nav>`.
 *
 * ```tsx
 * <Pagination totalItems={500} currentPage={page} onCurrentPageChange={setPage} itemsPerPageOptions={[10, 20, 50]} />
 * ```
 */
export function Pagination({
    totalItems: totalItemsProp = 0,
    currentPage: currentPageProp,
    defaultCurrentPage = 1,
    onCurrentPageChange,
    onPageChangeStart,
    itemsPerPage: itemsPerPageProp,
    defaultItemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    onItemsPerPageChange,
    itemsPerPageOptions = [],
    renderItemsPerPage,
    displayTotalItems = true,
    renderDisplayText,
    mobile = false,
    firstLabel = 'First page',
    previousLabel = 'Previous page',
    nextLabel = 'Next page',
    lastLabel = 'Last page',
    pageLabel = 'Page {page}',
    pageInputLabel = 'Page:',
    ofLabel = 'of {total}',
    itemsPerPageLabel = 'Results per page:',
    totalResultsLabel = '{total} Results',
    pageAnnouncement = 'Page {page} of {total}',
    pageProps,
    previousProps,
    nextProps,
    displayTotalProps,
    className,
    ref,
    'aria-label': ariaLabel,
    ...props
}: PaginationProps) {
    const id = `fd-pagination-${useId()}`;
    const root = useRef<HTMLDivElement | null>(null);
    const narrow = useNarrow();
    const mobileLayout = mobile || narrow;

    const totalItems = Math.max(0, Number(totalItemsProp) || 0);
    const [ownSize, setOwnSize] = useState<number>(defaultItemsPerPage);
    const pageSize = normalisePageSize(itemsPerPageProp !== undefined ? itemsPerPageProp : ownSize);
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const [ownPage, setOwnPage] = useState<number>(defaultCurrentPage);
    const rawPage = currentPageProp !== undefined ? currentPageProp : ownPage;
    const page = Math.min(Math.max(1, Math.floor(Number(rawPage)) || 1), totalPages);

    const short = totalPages <= 9;
    const pages = paginationPages(totalPages, page);
    const pagesBefore = pages.slice(0, pages.indexOf(page));
    const pagesAfter = pages.slice(pages.indexOf(page) + 1);
    const isFirst = page <= 1;
    const isLast = page >= totalPages;
    const hasPerPage = !!renderItemsPerPage || itemsPerPageOptions.length > 0;
    const showTotal = displayTotalItems && !mobileLayout;

    const pageOptions = [...new Set(itemsPerPageOptions.map((v) => Math.floor(v)).filter((v) => v > 0))];
    if (!pageOptions.includes(pageSize)) pageOptions.push(pageSize);
    pageOptions.sort((a, b) => a - b);

    const showing: PaginationShowing = {
        from: Math.min((page - 1) * pageSize + 1, totalItems),
        to: Math.min(page * pageSize, totalItems),
        totalCount: totalItems
    };

    const [announcement, setAnnouncement] = useState('');
    const [draft, setDraft] = useState<string | null>(null);
    const [tabStop, setTabStop] = useState('current');
    const [focusCurrent, setFocusCurrent] = useState(0);

    const pageText = (n: number) => pageLabel.replace('{page}', `${n}`);
    const isValidPage = (value: string) => {
        const n = Number(value);
        return value.trim() !== '' && Number.isInteger(n) && n >= 1 && n <= totalPages;
    };

    /** Requests a page; out of range pages and the current page are ignored. */
    const goToPage = (next: number, keepFocus = false) => {
        if (!isValidPage(`${next}`) || next === page) return;
        if (currentPageProp === undefined) setOwnPage(next);
        onCurrentPageChange?.(next);
        onPageChangeStart?.(next);
        setAnnouncement(pageAnnouncement.replace('{page}', `${next}`).replace('{total}', `${totalPages}`));
        setTabStop('current');
        if (keepFocus) setFocusCurrent((n) => n + 1);
    };

    const onPerPage = (size: number) => {
        if (!size || size === pageSize) return;
        if (itemsPerPageProp === undefined) setOwnSize(size);
        onItemsPerPageChange?.(size);
        const last = Math.max(1, Math.ceil(totalItems / size));
        if (Number(rawPage) > last) {
            if (currentPageProp === undefined) setOwnPage(last);
            onCurrentPageChange?.(last);
            onPageChangeStart?.(last);
        }
    };

    // after a page change from a page button or the input, the focus goes to the current page
    useLayoutEffect(() => {
        if (focusCurrent) root.current?.querySelector<HTMLElement>('[data-pg-item][data-key="current"]')?.focus();
    }, [focusCurrent]);

    // the keys of the enabled controls, in order; the tab stop falls back to the current page when its control is gone
    const keys = [
        ...(mobileLayout && !isFirst ? ['first'] : []),
        ...(!isFirst ? ['previous'] : []),
        ...(mobileLayout ? [] : pagesBefore.filter((p) => p !== MORE).map((p) => `page-${p}`)),
        'current',
        ...(mobileLayout ? [] : pagesAfter.filter((p) => p !== MORE).map((p) => `page-${p}`)),
        ...(!isLast ? ['next'] : []),
        ...(mobileLayout && !isLast ? ['last'] : [])
    ];
    const stop = keys.includes(tabStop) ? tabStop : 'current';
    const tab = (key: string) => (stop === key ? 0 : -1);

    const onFocus = (event: FocusEvent<HTMLElement>) => {
        const key = (event.target as HTMLElement).closest<HTMLElement>('[data-pg-item]')?.dataset['key'];
        if (key) setTabStop(key);
    };

    /** Left and Right (and Home and End) move between the controls. */
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' && (event.key === 'Home' || event.key === 'End')) return;
        const nav = event.currentTarget;
        const items = [...nav.querySelectorAll<HTMLElement>('[data-pg-item]')].filter(
            (el) => !(el as HTMLButtonElement).disabled
        );
        const index = items.findIndex((el) => el === target || el.contains(target));
        if (index < 0) return;
        const rtl = getComputedStyle(nav).direction === 'rtl';
        let next = -1;
        if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) next = Math.min(index + 1, items.length - 1);
        else if (event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) next = Math.max(index - 1, 0);
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        else return;
        event.preventDefault();
        items[next]?.focus();
    };

    const pageButton = (p: number, index: number) =>
        p === MORE ? (
            <span
                key={`more-${index}`}
                aria-hidden="true"
                className="block w-6 text-center font-sap-font-family text-sap-font-size text-sap-text-color"
            >
                ...
            </span>
        ) : (
            <Button
                key={`page-${p}`}
                variant="transparent"
                {...pageProps}
                data-pg-item=""
                data-key={`page-${p}`}
                tabIndex={tab(`page-${p}`)}
                aria-label={pageText(p)}
                title={pageText(p)}
                className={cn(PAGE_BUTTON, pageProps?.className)}
                onClick={(event) => {
                    pageProps?.onClick?.(event);
                    goToPage(p, true);
                }}
            >
                {p}
            </Button>
        );

    const iconButton = (
        key: 'first' | 'previous' | 'next' | 'last',
        glyph: string,
        label: string,
        disabled: boolean,
        target: number,
        own?: PartProps<ButtonProps>
    ) => (
        <Button
            variant="transparent"
            glyph={glyph}
            {...own}
            data-pg-item=""
            data-key={key}
            tabIndex={tab(key)}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={cn((key === 'first' || key === 'last') && MEDIA_BUTTON, own?.className)}
            onClick={(event) => {
                own?.onClick?.(event);
                goToPage(target);
            }}
        />
    );

    const inputInvalid = draft !== null && !isValidPage(draft);
    const ofText = ofLabel.replace('{total}', `${totalPages}`);
    // form labels with their end margin, as fundamental-styles
    const labelClass = cn(LABEL, 'me-2', !mobileLayout && 'hidden');

    const totalText = totalResultsLabel
        .replace('{from}', `${showing.from}`)
        .replace('{to}', `${showing.to}`)
        .replace('{total}', `${showing.totalCount}`);

    const perPageSelect = (
        <>
            {!mobileLayout && (
                <span id={`${id}-per-page`} className={LABEL}>
                    {itemsPerPageLabel}
                </span>
            )}
            <Select<number>
                aria-labelledby={mobileLayout ? undefined : `${id}-per-page`}
                aria-label={mobileLayout ? itemsPerPageLabel : undefined}
                value={pageSize}
                onValueChange={(size) => size != null && onPerPage(size)}
            >
                {pageOptions.map((option) => (
                    <SelectOption key={option} value={option}>
                        {`${option}`}
                    </SelectOption>
                ))}
            </Select>
        </>
    );

    return (
        <div
            {...props}
            ref={(node) => {
                root.current = node;
                if (typeof ref === 'function') return ref(node);
                if (ref) ref.current = node;
            }}
            className={cn(
                'm-0 box-border flex h-11 w-full items-center justify-between px-4 py-0 font-sap-font-family',
                className
            )}
        >
            {totalItems > 0 && (
                <>
                    {hasPerPage && (
                        <div className="flex shrink-0 items-center gap-2">
                            {renderItemsPerPage
                                ? renderItemsPerPage({ onSelect: onPerPage, pageOptions })
                                : perPageSelect}
                        </div>
                    )}
                    {totalPages > 1 && (
                        <nav
                            aria-label={ariaLabel ?? 'Pagination'}
                            aria-describedby={showTotal ? `${id}-total` : undefined}
                            // centred; in the mobile layout after an items per page control, at the end
                            className={cn(
                                'mx-auto flex items-center justify-center gap-1',
                                mobileLayout && hasPerPage && 'me-0'
                            )}
                            onKeyDown={onKeyDown}
                            onFocus={onFocus}
                        >
                            {mobileLayout && iconButton('first', 'media-rewind', firstLabel, isFirst, 1)}
                            {iconButton(
                                'previous',
                                'navigation-left-arrow',
                                previousLabel,
                                isFirst,
                                page - 1,
                                previousProps
                            )}
                            {!mobileLayout && pagesBefore.map(pageButton)}
                            {short && !mobileLayout ? (
                                <Button
                                    variant="transparent"
                                    data-pg-item=""
                                    data-key="current"
                                    tabIndex={tab('current')}
                                    aria-current="page"
                                    aria-label={pageText(page)}
                                    className={CURRENT_BUTTON}
                                >
                                    {page}
                                </Button>
                            ) : (
                                <>
                                    {/* the labels show in the mobile layout only; on desktop they still name the input */}
                                    <span id={`${id}-page-label`} className={labelClass}>
                                        {pageInputLabel}
                                    </span>
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        data-pg-item=""
                                        data-key="current"
                                        min={1}
                                        max={totalPages}
                                        required
                                        noNumberSpinner
                                        tabIndex={tab('current')}
                                        value={draft ?? `${page}`}
                                        aria-labelledby={`${id}-page-label ${id}-page-of`}
                                        aria-invalid={inputInvalid || undefined}
                                        className={cn(
                                            'w-auto max-w-20 min-w-10 text-center',
                                            inputInvalid && 'border-sap-field-invalid-color'
                                        )}
                                        onChange={(event) => setDraft(event.currentTarget.value)}
                                        onKeyDown={(event) => {
                                            if (event.key !== 'Enter') return;
                                            if (draft !== null) goToPage(Number(draft), true);
                                            setDraft(null);
                                        }}
                                        onBlur={() => setDraft(null)}
                                    />
                                    <span id={`${id}-page-of`} className={labelClass}>
                                        {ofText}
                                    </span>
                                </>
                            )}
                            {!mobileLayout && pagesAfter.map(pageButton)}
                            {iconButton('next', 'navigation-right-arrow', nextLabel, isLast, page + 1, nextProps)}
                            {mobileLayout && iconButton('last', 'media-forward', lastLabel, isLast, totalPages)}
                        </nav>
                    )}
                    {showTotal && (
                        <span
                            {...displayTotalProps}
                            id={`${id}-total`}
                            className={cn(LABEL, displayTotalProps?.className)}
                        >
                            {renderDisplayText ? renderDisplayText(showing) : totalText}
                        </span>
                    )}
                </>
            )}
            <span className="sr-only-sap" role="status" aria-live="polite">
                {announcement}
            </span>
        </div>
    );
}
