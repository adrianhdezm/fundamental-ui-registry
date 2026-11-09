import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Pagination, paginationPages, type PaginationProps } from './pagination';

const wait = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
const button = (root: ParentNode, label: string) =>
    root.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
const combobox = () => document.querySelector<HTMLElement>('[role=combobox]')!;
const optionTexts = () =>
    [...document.querySelectorAll<HTMLElement>('[role=listbox] [role=option]')].map((o) => o.textContent?.trim());

interface HostProps extends Partial<PaginationProps> {
    page?: number;
    size?: number;
}

/** A pagination whose page and items per page are kept by the host (Angular's two-way bindings). */
function Host({ page: initialPage = 1, size: initialSize = 10, onPageChangeStart, ...props }: HostProps) {
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);
    const [requested, setRequested] = useState<number | null>(null);
    return (
        <>
            <Pagination
                totalItems={500}
                itemsPerPageOptions={[10, 25]}
                {...props}
                currentPage={page}
                onCurrentPageChange={setPage}
                itemsPerPage={size}
                onItemsPerPageChange={setSize}
                onPageChangeStart={(next) => {
                    setRequested(next);
                    onPageChangeStart?.(next);
                }}
            />
            <output id="page">{page}</output>
            <output id="size">{size}</output>
            <output id="requested">{requested ?? 'null'}</output>
        </>
    );
}

async function setup(props: HostProps = {}) {
    const screen = await render(<Host {...props} />);
    const root = screen.container;
    const out = (name: string) => root.querySelector(`#${name}`)!.textContent;
    return { screen, root, out };
}

describe('paginationPages', () => {
    it('shows all pages up to nine and ellipses beyond', () => {
        expect(paginationPages(5, 2)).toEqual([1, 2, 3, 4, 5]);
        expect(paginationPages(50, 1)).toEqual([1, 2, 3, 4, 5, 6, 7, -1, 50]);
        expect(paginationPages(50, 25)).toEqual([1, -1, 23, 24, 25, 26, 27, -1, 50]);
        expect(paginationPages(50, 50)).toEqual([1, -1, 44, 45, 46, 47, 48, 49, 50]);
    });

    it('shows only one ellipsis while the current page is near an end', () => {
        expect(paginationPages(50, 2)).toEqual([1, 2, 3, 4, 5, 6, 7, -1, 50]);
        expect(paginationPages(50, 5)).toEqual([1, 2, 3, 4, 5, 6, 7, -1, 50]);
        expect(paginationPages(50, 6)).toEqual([1, -1, 4, 5, 6, 7, 8, -1, 50]);
        expect(paginationPages(50, 46)).toEqual([1, -1, 44, 45, 46, 47, 48, 49, 50]);
        expect(paginationPages(50, 49)).toEqual([1, -1, 44, 45, 46, 47, 48, 49, 50]);
        expect(paginationPages(10, 9)).toEqual([1, -1, 4, 5, 6, 7, 8, 9, 10]);
    });
});

describe('Pagination', () => {
    it('goes to pages with the buttons and disables them at the ends', async () => {
        const { screen, root, out } = await setup({ totalItems: 50 });
        expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Pagination');
        expect(button(root, 'Previous page').disabled).toBe(true);
        await userEvent.click(button(root, 'Page 3'));
        expect(out('page')).toBe('3');
        expect(out('requested')).toBe('3');
        expect(root.querySelector('[aria-current=page]')?.textContent?.trim()).toBe('3');
        await userEvent.click(button(root, 'Next page'));
        expect(out('page')).toBe('4');
        await screen.rerender(<Pagination totalItems={50} currentPage={5} />);
        expect(button(root, 'Next page').disabled).toBe(true);
        expect(root.textContent).toContain('50 Results');
    });

    it('takes a page from the input when there are more than nine pages', async () => {
        const { root, out } = await setup({ page: 30 });
        const input = root.querySelector<HTMLInputElement>('input[type=number]')!;
        expect(input.value).toBe('30');
        expect(root.textContent).toContain('of 50');
        await userEvent.clear(input);
        await userEvent.type(input, '42{Enter}');
        expect(out('page')).toBe('42');
        await userEvent.clear(input);
        await userEvent.type(input, '99');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        await userEvent.keyboard('{Enter}');
        expect(out('page')).toBe('42');
    });

    it('shows the "Page:" and "of" labels of the input in the mobile layout only, naming the input in both', async () => {
        const { screen, root } = await setup({ page: 30 });
        const labels = () => [...root.querySelectorAll<HTMLElement>('nav span[id]')];
        const input = () => root.querySelector<HTMLInputElement>('input[type=number]')!;
        const name = () =>
            input()
                .getAttribute('aria-labelledby')!
                .split(' ')
                .map((id) => document.getElementById(id)?.textContent?.trim())
                .join(' ');
        expect(labels().map((el) => el.textContent?.trim())).toEqual(['Page:', 'of 50']);
        expect(labels().every((el) => getComputedStyle(el).display === 'none')).toBe(true);
        expect(name()).toBe('Page: of 50');
        await screen.rerender(<Host page={30} mobile />);
        expect(labels().every((el) => getComputedStyle(el).display !== 'none')).toBe(true);
        expect(name()).toBe('Page: of 50');
    });

    it('moves between the controls with the arrow keys as one tab stop', async () => {
        const { root } = await setup({ totalItems: 50, page: 2 });
        const tabbable = () => [...root.querySelectorAll<HTMLElement>('nav [tabindex="0"]')];
        expect(tabbable()).toHaveLength(1);
        expect(tabbable()[0].textContent?.trim()).toBe('2');
        tabbable()[0].focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement?.textContent?.trim()).toBe('3');
        await userEvent.keyboard('{Home}');
        expect(document.activeElement?.getAttribute('aria-label')).toBe('Previous page');
        expect(tabbable()).toHaveLength(1);
        expect(tabbable()[0]).toBe(document.activeElement);
        await userEvent.keyboard('{End}');
        expect(document.activeElement?.getAttribute('aria-label')).toBe('Next page');
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement?.textContent?.trim()).toBe('5');
    });

    it('swaps Left and Right in RTL', async () => {
        const screen = await render(
            <div dir="rtl">
                <DirectionProvider direction="rtl">
                    <Pagination totalItems={50} defaultCurrentPage={2} />
                </DirectionProvider>
            </div>
        );
        screen.container.querySelector<HTMLElement>('[aria-current=page]')!.focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement?.textContent?.trim()).toBe('3');
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        expect(document.activeElement?.textContent?.trim()).toBe('1');
    });

    it('moves the focus to the current page after a page button or the input changes the page', async () => {
        const { root } = await setup({ totalItems: 50, page: 1 });
        await userEvent.click(button(root, 'Page 4'));
        expect(document.activeElement?.getAttribute('aria-current')).toBe('page');
        expect(document.activeElement?.textContent?.trim()).toBe('4');
        expect(root.querySelector('nav [tabindex="0"]')).toBe(document.activeElement);
    });

    it('announces page changes in a polite live region', async () => {
        const { root } = await setup({ totalItems: 50 });
        const status = root.querySelector('[role=status]')!;
        expect(status.getAttribute('aria-live')).toBe('polite');
        expect(status.textContent).toBe('');
        await userEvent.click(button(root, 'Next page'));
        expect(status.textContent).toBe('Page 2 of 5');
    });

    it('changes the items per page and keeps the page in range', async () => {
        const { out } = await setup({ page: 50 });
        await userEvent.click(combobox());
        await userEvent.click(
            [...document.querySelectorAll<HTMLElement>('[role=option]')].find((o) => o.textContent?.trim() === '25')!
        );
        expect(out('size')).toBe('25');
        expect(out('page')).toBe('20');
        expect(out('requested')).toBe('20');
    });

    it('labels the items per page select with the visible label, and with aria-label in the mobile layout', async () => {
        const { screen } = await setup();
        const labelledBy = combobox().getAttribute('aria-labelledby')!;
        expect(labelledBy.split(' ').map((id) => document.getElementById(id)?.textContent)).toContain(
            'Results per page:'
        );
        await screen.rerender(<Host mobile />);
        expect(combobox().getAttribute('aria-label')).toBe('Results per page:');
        expect(document.body.textContent).not.toContain('Results per page:');
    });

    it('centres the mobile nav, and puts it at the end after an items per page select', async () => {
        const { screen, root } = await setup({ mobile: true });
        const offsets = () => {
            const box = root.querySelector('nav')!.getBoundingClientRect();
            const outer = root.firstElementChild!.getBoundingClientRect();
            return { start: box.left - outer.left, end: outer.right - box.right };
        };
        const withSelect = offsets();
        expect(withSelect.end).toBeLessThan(withSelect.start);
        expect(withSelect.end).toBeCloseTo(16, 0);
        await screen.rerender(<Host mobile itemsPerPageOptions={[]} />);
        const alone = offsets();
        expect(Math.abs(alone.start - alone.end)).toBeLessThan(2);
    });

    it('shows first and last buttons in mobile mode', async () => {
        const { root, out } = await setup({ mobile: true, page: 3 });
        expect(button(root, 'Page 2')).toBeNull();
        expect(root.textContent).not.toContain('Results');
        expect(root.querySelector('nav')!.hasAttribute('aria-describedby')).toBe(false);
        await userEvent.click(button(root, 'Last page'));
        expect(out('page')).toBe('50');
        await userEvent.click(button(root, 'First page'));
        expect(out('page')).toBe('1');
    });

    it('uses the mobile layout on screens up to 1023px', async () => {
        const { root } = await setup({ page: 3 });
        expect(button(root, 'First page')).toBeNull();
        await page.viewport(800, 600);
        try {
            await expect.poll(() => button(root, 'First page')).not.toBeNull();
            expect(button(root, 'Page 2')).toBeNull();
        } finally {
            await page.viewport(1280, 800);
        }
        await expect.poll(() => button(root, 'First page')).toBeNull();
    });

    it('rounds itemsPerPage down, keeps it at least 1 and falls back to 10 when it is not a number', async () => {
        const screen = await render(<Pagination totalItems={50} itemsPerPageOptions={[10, 25]} />);
        const root = screen.container;
        const pageCount = () => {
            const of = root.querySelector('[id$="-page-of"]')?.textContent?.trim();
            return of ? of.replace('of ', '') : `${root.querySelectorAll('nav button[aria-label^="Page "]').length}`;
        };
        const sized = (itemsPerPage: unknown) => (
            <Pagination totalItems={50} itemsPerPageOptions={[10, 25]} itemsPerPage={itemsPerPage as number} />
        );
        await screen.rerender(sized(5.5));
        expect(pageCount()).toBe('10');
        await screen.rerender(sized(NaN));
        expect(pageCount()).toBe('5');
        await screen.rerender(sized('25'));
        expect(pageCount()).toBe('2');
        await screen.rerender(sized(0));
        expect(pageCount()).toBe('50');
        await screen.rerender(sized(-1));
        expect(pageCount()).toBe('50');
        await screen.rerender(sized(7.9));
        expect(combobox().textContent).toContain('7');
    });

    it('starts on the first page by default', async () => {
        const screen = await render(<Pagination totalItems={50} />);
        const root = screen.container;
        expect(root.querySelector('[aria-current=page]')?.textContent?.trim()).toBe('1');
        expect(button(root, 'Previous page').disabled).toBe(true);
    });

    it('rounds a fractional currentPage down and keeps it in range', async () => {
        const screen = await render(<Pagination totalItems={50} currentPage={3.7} />);
        const root = screen.container;
        const current = () => root.querySelector('[aria-current=page]')?.textContent?.trim();
        expect(current()).toBe('3');
        await screen.rerender(<Pagination totalItems={50} currentPage={999} />);
        expect(current()).toBe('5');
        expect(button(root, 'Next page').disabled).toBe(true);
        await screen.rerender(<Pagination totalItems={50} currentPage={-2} />);
        expect(current()).toBe('1');
        await screen.rerender(<Pagination totalItems={50} currentPage={null as unknown as number} />);
        expect(current()).toBe('1');
    });

    it('rounds items per page options down, drops values below 1, adds itemsPerPage and sorts them', async () => {
        const options = [20.7, 0, -5, 5, 20, 30.1];
        const screen = await render(<Pagination totalItems={100} itemsPerPageOptions={options} />);
        await userEvent.click(combobox());
        expect(optionTexts()).toEqual(['5', '10', '20', '30']);
        await userEvent.keyboard('{Escape}');
        await wait();
        await screen.rerender(<Pagination totalItems={100} itemsPerPageOptions={options} itemsPerPage={5} />);
        await userEvent.click(combobox());
        expect(optionTexts()).toEqual(['5', '20', '30']);
        await userEvent.keyboard('{Escape}');
        await wait();
    });

    it('resets an invalid page in the input to the current page on Enter and on blur', async () => {
        const { root, out } = await setup({ page: 12 });
        const input = root.querySelector<HTMLInputElement>('input[type=number]')!;
        await userEvent.clear(input);
        await userEvent.type(input, '99{Enter}');
        expect(out('page')).toBe('12');
        expect(input.value).toBe('12');
        await userEvent.clear(input);
        await userEvent.type(input, '0');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        input.blur();
        await expect.poll(() => input.value).toBe('12');
        expect(input.hasAttribute('aria-invalid')).toBe(false);
        expect(out('page')).toBe('12');
    });

    it('changes pages on its own when uncontrolled', async () => {
        const onCurrentPageChange = vi.fn();
        const screen = await render(
            <Pagination totalItems={101} defaultCurrentPage={5} onCurrentPageChange={onCurrentPageChange} />
        );
        const root = screen.container;
        const input = root.querySelector<HTMLInputElement>('input[type=number]')!;
        expect(input.value).toBe('5');
        await userEvent.click(button(root, 'Previous page'));
        expect(input.value).toBe('4');
        expect(onCurrentPageChange).toHaveBeenCalledWith(4);
        await userEvent.click(button(root, 'Page 1'));
        await userEvent.click(button(root, 'Previous page'), { force: true });
        expect(onCurrentPageChange).toHaveBeenCalledTimes(2);
    });

    it('waits for currentPage when controlled', async () => {
        const onPageChangeStart = vi.fn();
        const screen = await render(
            <Pagination totalItems={50} currentPage={2} onPageChangeStart={onPageChangeStart} />
        );
        await userEvent.click(button(screen.container, 'Next page'));
        expect(onPageChangeStart).toHaveBeenCalledWith(3);
        expect(screen.container.querySelector('[aria-current=page]')?.textContent?.trim()).toBe('2');
    });

    it('does not request the current page or pages out of range', async () => {
        const onCurrentPageChange = vi.fn();
        const screen = await render(
            <Pagination totalItems={110} defaultCurrentPage={11} onCurrentPageChange={onCurrentPageChange} />
        );
        const root = screen.container;
        const next = button(root, 'Next page');
        expect(next.disabled).toBe(true);
        await userEvent.click(next, { force: true });
        const input = root.querySelector<HTMLInputElement>('input[type=number]')!;
        await userEvent.clear(input);
        await userEvent.type(input, '11{Enter}');
        expect(onCurrentPageChange).not.toHaveBeenCalled();
    });

    it('takes the results text, the labels and the item range from props', async () => {
        const screen = await render(
            <Pagination
                totalItems={50}
                defaultCurrentPage={2}
                renderDisplayText={({ from, to, totalCount }) => `From ${from} to ${to}. Total items ${totalCount}`}
                previousLabel="Previous"
                nextLabel="Next"
                pageLabel="Goto page {page}"
            />
        );
        const root = screen.container;
        expect(root.textContent).toContain('From 11 to 20. Total items 50');
        expect(button(root, 'Previous')).not.toBeNull();
        expect(button(root, 'Next').title).toBe('Next');
        expect(button(root, 'Goto page 3')).not.toBeNull();
        const nav = root.querySelector('nav')!;
        expect(document.getElementById(nav.getAttribute('aria-describedby')!)?.textContent).toContain('From 11');
        await screen.rerender(<Pagination totalItems={101} totalResultsLabel="{total} Dalmations" />);
        expect(root.textContent).toContain('101 Dalmations');
        await screen.rerender(<Pagination totalItems={101} displayTotalItems={false} />);
        expect(root.textContent).not.toContain('101');
        expect(nav.hasAttribute('aria-describedby')).toBe(false);
    });

    it('renders a custom items per page control with the options and the selection callback', async () => {
        const onItemsPerPageChange = vi.fn();
        const screen = await render(
            <Pagination
                totalItems={150}
                defaultItemsPerPage={5}
                itemsPerPageOptions={[2, 100]}
                onItemsPerPageChange={onItemsPerPageChange}
                renderItemsPerPage={({ onSelect, pageOptions }) => (
                    <span>
                        {pageOptions.map((size) => (
                            <button key={size} type="button" data-size={size} onClick={() => onSelect(size)}>
                                {size}
                            </button>
                        ))}
                    </span>
                )}
            />
        );
        const root = screen.container;
        expect([...root.querySelectorAll('[data-size]')].map((b) => b.textContent)).toEqual(['2', '5', '100']);
        await userEvent.click(root.querySelector<HTMLElement>('[data-size="100"]')!);
        expect(onItemsPerPageChange).toHaveBeenCalledWith(100);
        expect(root.querySelector('[aria-current=page]')?.textContent?.trim()).toBe('1');
        expect(root.querySelectorAll('nav button[aria-label^="Page "]')).toHaveLength(2);
    });

    it('renders nothing but the live region without items, and no nav with a single page', async () => {
        const screen = await render(<Pagination totalItems={0} itemsPerPageOptions={[10]} />);
        const root = screen.container;
        expect(root.querySelector('nav')).toBeNull();
        expect(root.querySelector('[role=combobox]')).toBeNull();
        expect(root.textContent).toBe('');
        await screen.rerender(<Pagination totalItems={5} />);
        expect(root.querySelector('nav')).toBeNull();
        expect(root.textContent).toContain('5 Results');
    });

    it('creates 23 pages for 221 items and 10 pages for 10 items one per page', async () => {
        const screen = await render(<Pagination totalItems={221} />);
        const root = screen.container;
        expect(root.querySelector('[id$="-page-of"]')?.textContent).toBe('of 23');
        await screen.rerender(<Pagination totalItems={10} itemsPerPage={1} />);
        expect(root.querySelector('[id$="-page-of"]')?.textContent).toBe('of 10');
    });

    describe('fundamental-react', () => {
        it('navigates to the previous page, and not before the first', async () => {
            const screen = await render(<Pagination totalItems={101} defaultCurrentPage={5} />);
            const root = screen.container;
            const input = root.querySelector<HTMLInputElement>('input[type=number]')!;
            await userEvent.click(button(root, 'Previous page'));
            expect(input.value).toBe('4');
            for (let i = 0; i < 3; i++) await userEvent.click(button(root, 'Previous page'));
            expect(input.value).toBe('1');
            await userEvent.click(button(root, 'Previous page'), { force: true });
            expect(input.value).toBe('1');
        });

        it('navigates to the next page, and not after the last', async () => {
            const screen = await render(<Pagination totalItems={101} defaultCurrentPage={10} />);
            const root = screen.container;
            const input = root.querySelector<HTMLInputElement>('input[type=number]')!;
            await userEvent.click(button(root, 'Next page'));
            expect(input.value).toBe('11');
            expect(button(root, 'Next page').disabled).toBe(true);
            await userEvent.click(button(root, 'Next page'), { force: true });
            expect(input.value).toBe('11');
        });

        it('navigates to the page clicked', async () => {
            const onPageChangeStart = vi.fn();
            const screen = await render(<Pagination totalItems={101} onPageChangeStart={onPageChangeStart} />);
            await userEvent.click(button(screen.container, 'Page 4'));
            expect(onPageChangeStart).toHaveBeenCalledWith(4);
            expect(screen.container.querySelector<HTMLInputElement>('input[type=number]')!.value).toBe('4');
        });

        it('passes className, native props and the ref to the root', async () => {
            const ref = createRef<HTMLDivElement>();
            const screen = await render(
                <Pagination ref={ref} totalItems={101} className="blue" data-sample="Sample1" id="pg" />
            );
            const root = screen.container.firstElementChild as HTMLElement;
            expect(ref.current).toBe(root);
            expect(root.tagName).toBe('DIV');
            expect(root.id).toBe('pg');
            expect(root.classList.contains('blue')).toBe(true);
            expect(root.getAttribute('data-sample')).toBe('Sample1');
        });

        it('spreads props to the page, previous and next buttons and to the results text', async () => {
            const onClick = vi.fn();
            const screen = await render(
                <Pagination
                    totalItems={101}
                    pageProps={{ 'data-sample': 'Sample', onClick }}
                    previousProps={{ 'data-sample': 'Prev Sample' }}
                    nextProps={{ 'data-sample': 'Next Sample' }}
                    displayTotalProps={{ 'data-sample': 'Sample2', className: 'total' }}
                />
            );
            const root = screen.container;
            expect(button(root, 'Page 2').getAttribute('data-sample')).toBe('Sample');
            expect(button(root, 'Previous page').getAttribute('data-sample')).toBe('Prev Sample');
            expect(button(root, 'Next page').getAttribute('data-sample')).toBe('Next Sample');
            const total = root.querySelector<HTMLElement>('[data-sample="Sample2"]')!;
            expect(total.textContent).toBe('101 Results');
            expect(total.classList.contains('total')).toBe(true);
            await userEvent.click(button(root, 'Page 2'));
            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });
});
