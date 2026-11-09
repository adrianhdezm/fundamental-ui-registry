import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Icon } from '@/ui/icon/icon';
import { ObjectStatus } from '@/ui/object-status/object-status';
import { RatingIndicator } from '@/ui/rating-indicator/rating-indicator';
import { Facet, FacetContainer, FacetContent, FacetFormValue, FacetGroup } from './facets';

const Host = ({ width = 1200, level }: { width?: number; level?: number | string }) => (
    <div style={{ width }}>
        <FacetGroup aria-label="Product facets" data-testid="group">
            <Facet id="form" type="form" facetTitle="Technical data" headingLevel={level}>
                <FacetContent id="row1">
                    <span>Base unit:</span>
                    <FacetFormValue id="value1">Each</FacetFormValue>
                </FacetContent>
                <FacetContent id="row2">
                    <Icon id="icon" glyph="accept" />
                    <FacetFormValue>Checked</FacetFormValue>
                </FacetContent>
                <FacetContent id="row3">
                    <span>Width:</span>
                    <FacetFormValue>86 cm</FacetFormValue>
                </FacetContent>
            </Facet>
            <Facet id="kv" type="key-value" facetTitle="Status">
                <ObjectStatus id="kv-status" status="positive" label="Delivered" large />
            </Facet>
            <Facet id="rating" type="rating-indicator" facetTitle="Rating" subtitle="12 reviews">
                <FacetContent>
                    <span id="stars">4 of 5</span>
                </FacetContent>
            </Facet>
            <Facet id="image" type="image" facetTitle="Ignored">
                <span id="img">Image</span>
            </Facet>
            <Facet id="end" type="key-value" facetTitle="Price" alignEnd>
                <span id="price">12 EUR</span>
            </Facet>
        </FacetGroup>
        <ObjectStatus id="plain-status" status="positive" label="Delivered" large />
        <FacetContainer id="container" flexDirection="row" alignItems="center" flexGap={2}>
            <span>One</span>
            <span>Two</span>
        </FacetContainer>
    </div>
);

const el = (id: string) => document.getElementById(id)!;

function cssFont(variable: string): string {
    const probe = document.createElement('div');
    probe.style.fontFamily = `var(${variable})`;
    document.body.appendChild(probe);
    const font = getComputedStyle(probe).fontFamily;
    probe.remove();
    return font;
}

describe('Facets', () => {
    afterEach(() => {
        document.documentElement.removeAttribute('dir');
    });

    it('facet group is a group with an accessible name; facets wrap with the reference spacing', async () => {
        const screen = await render(<Host />);
        const group = screen.getByTestId('group').element() as HTMLElement;
        expect(group.getAttribute('role')).toBe('group');
        await expect.element(page.getByRole('group', { name: 'Product facets' })).toBeInTheDocument();
        expect(getComputedStyle(group).columnGap).toBe('32px');
        expect(getComputedStyle(el('form')).marginInlineEnd).toBe('32px');
        expect(getComputedStyle(el('form')).marginBottom).toBe('16px');
        expect(el('kv').getBoundingClientRect().top).toBe(el('form').getBoundingClientRect().top);
        await screen.rerender(<Host width={300} />);
        // on a narrow width the facets wrap to new lines
        expect(el('kv').getBoundingClientRect().top).toBeGreaterThan(el('form').getBoundingClientRect().bottom);
    });

    it('non-image facets are groups labelled by their title; headingLevel makes the title a heading', async () => {
        const screen = await render(<Host />);
        const facet = el('form');
        expect(facet.getAttribute('role')).toBe('group');
        const title = document.getElementById(facet.getAttribute('aria-labelledby')!)!;
        expect(title.textContent).toBe('Technical data');
        expect(title.hasAttribute('role')).toBe(false);
        // 1rem below the title, as fundamental-styles' facets
        expect(getComputedStyle(title).marginBottom).toBe('16px');
        await expect.element(page.getByRole('group', { name: 'Technical data' })).toBeInTheDocument();
        await expect.element(page.getByRole('group', { name: 'Status' })).toBeInTheDocument();
        await screen.rerender(<Host level={3} />);
        expect(title.getAttribute('role')).toBe('heading');
        expect(title.getAttribute('aria-level')).toBe('3');
        await expect.element(page.getByRole('heading', { name: 'Technical data', level: 3 })).toBeInTheDocument();
        // Angular also takes a tag name
        await screen.rerender(<Host level="h4" />);
        expect(title.getAttribute('aria-level')).toBe('4');
    });

    it('image facets come first (order -1) and have no title', async () => {
        await render(<Host />);
        const image = el('image');
        expect(image.hasAttribute('role')).toBe(false);
        expect(image.hasAttribute('aria-labelledby')).toBe(false);
        expect(image.textContent).toBe('Image');
        expect(getComputedStyle(image).order).toBe('-1');
        // the image is the last in the DOM but the first in the row
        expect(image.getBoundingClientRect().left).toBeLessThan(el('form').getBoundingClientRect().left);
        expect(getComputedStyle(image).marginBottom).toBe('0px');
    });

    it('form facet rows space evenly and icons get an end margin', async () => {
        await render(<Host />);
        const rows = ['row1', 'row2', 'row3'].map(el);
        expect(rows.map((r) => getComputedStyle(r).marginBottom)).toEqual(['8px', '8px', '0px']);
        // stretched, as fundamental-styles' rows: an icon and its value share the top edge, the row is as high as both
        expect(rows.map((r) => getComputedStyle(r).alignItems)).toEqual(['normal', 'normal', 'normal']);
        const icon = el('icon').getBoundingClientRect();
        expect(icon.top).toBe(rows[1].getBoundingClientRect().top);
        expect(rows[1].getBoundingClientRect().height).toBe(icon.height);
        // no gap: the label's own end margin (or the icon's) separates the value, as fundamental-styles'
        expect(getComputedStyle(rows[0]).columnGap).toBe('normal');
        const gaps = [
            rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().bottom,
            rows[2].getBoundingClientRect().top - rows[1].getBoundingClientRect().bottom
        ];
        expect(gaps[0]).toBeCloseTo(gaps[1], 0);
        expect(getComputedStyle(el('icon')).marginInlineEnd).toBe('8px');
        // the rows stack in a column
        expect(rows[1].getBoundingClientRect().top).toBeGreaterThan(rows[0].getBoundingClientRect().top);
    });

    it('form values use the group title text colour', async () => {
        await render(<Host />);
        const probe = document.createElement('div');
        probe.style.color = 'var(--sapGroup_TitleTextColor)';
        document.body.appendChild(probe);
        expect(getComputedStyle(el('value1')).color).toBe(getComputedStyle(probe).color);
        probe.remove();
        expect(el('value1').tagName).toBe('SPAN');
    });

    it('key-value facets use the regular font family for large object statuses', async () => {
        await render(<Host />);
        const regular = cssFont('--sapFontFamily');
        expect(getComputedStyle(el('kv-status')).fontFamily).toBe(regular);
        expect(getComputedStyle(el('plain-status')).fontFamily).not.toBe(regular);
    });

    it('rating facet shows the subtitle (review count) under the title', async () => {
        await render(<Host />);
        const rating = el('rating');
        const [title, subtitle] = [...rating.children] as HTMLElement[];
        expect(title.textContent).toBe('Rating');
        expect(subtitle.textContent).toBe('12 reviews');
        expect(subtitle.getBoundingClientRect().top).toBeGreaterThanOrEqual(title.getBoundingClientRect().bottom);
        expect(el('stars').getBoundingClientRect().top).toBeGreaterThanOrEqual(subtitle.getBoundingClientRect().bottom);
        // other facet types ignore the subtitle
        expect(el('kv').textContent).not.toContain('reviews');
    });

    it('rating facet stacks a rating indicator with its dynamic text at the end', async () => {
        await render(
            <Facet type="rating-indicator" facetTitle="Rating">
                <RatingIndicator value={2.5} allowHalves nonInteractive aria-label="Rating" data-testid="ri" />
            </Facet>
        );
        const ri = page.getByTestId('ri').element() as HTMLElement;
        const style = getComputedStyle(ri);
        expect(style.flexDirection).toBe('column');
        expect(style.marginTop).toBe('0px');
        const stars = ri.querySelector<HTMLElement>('[role=slider]')!;
        const text = ri.lastElementChild as HTMLElement;
        expect(text.textContent).toBe('(2.5 of 5)');
        expect(text.getBoundingClientRect().top).toBeGreaterThanOrEqual(stars.getBoundingClientRect().bottom);
        expect(text.getBoundingClientRect().right).toBeCloseTo(stars.getBoundingClientRect().right, 0);
    });

    it('alignEnd pushes the facet to the end in LTR and RTL', async () => {
        const screen = await render(<Host />);
        const group = screen.getByTestId('group').element() as HTMLElement;
        const groupRect = () => group.getBoundingClientRect();
        expect(el('price').getBoundingClientRect().right).toBeCloseTo(groupRect().right, 0);
        expect(el('end').getBoundingClientRect().left).toBeGreaterThan(el('rating').getBoundingClientRect().right);
        document.documentElement.setAttribute('dir', 'rtl');
        expect(el('price').getBoundingClientRect().left).toBeCloseTo(groupRect().left, 0);
        expect(el('end').getBoundingClientRect().right).toBeLessThan(el('rating').getBoundingClientRect().left);
    });

    it('facet container lays out its content with the given flex options', async () => {
        await render(<Host />);
        const style = getComputedStyle(el('container'));
        expect(style.display).toBe('flex');
        expect(style.flexDirection).toBe('row');
        expect(style.alignItems).toBe('center');
        expect(style.columnGap).toBe('32px');
    });

    it('facet container defaults to a column with a 1rem gap', async () => {
        await render(<FacetContainer data-testid="c" />);
        const style = getComputedStyle(page.getByTestId('c').element());
        expect(style.flexDirection).toBe('column');
        expect(style.rowGap).toBe('16px');
        expect(style.alignItems).toBe('start');
        expect(style.justifyContent).toBe('start');
    });

    it('generates the facet and title ids unless an id is given', async () => {
        await render(
            <>
                <Facet facetTitle="A" data-testid="a" />
                <Facet facetTitle="B" data-testid="b" />
            </>
        );
        const a = page.getByTestId('a').element();
        const b = page.getByTestId('b').element();
        expect(a.id).toMatch(/^fd-facet-/);
        expect(a.id).not.toBe(b.id);
        expect(a.getAttribute('aria-labelledby')).toMatch(/^fd-facet-title-/);
        expect(a.getAttribute('aria-labelledby')).not.toBe(b.getAttribute('aria-labelledby'));
    });

    it('passes className, native props and the ref to every part', async () => {
        const refs = {
            group: createRef<HTMLDivElement>(),
            facet: createRef<HTMLDivElement>(),
            content: createRef<HTMLDivElement>(),
            value: createRef<HTMLSpanElement>(),
            container: createRef<HTMLDivElement>()
        };
        await render(
            <FacetGroup ref={refs.group} className="custom-group" data-testid="g" aria-busy="true">
                <Facet ref={refs.facet} className="custom-facet" data-testid="f" type="form" title="native">
                    <FacetContent ref={refs.content} className="custom-content" data-testid="c">
                        <FacetFormValue ref={refs.value} className="custom-value" data-testid="v">
                            Value
                        </FacetFormValue>
                    </FacetContent>
                </Facet>
                <FacetContainer ref={refs.container} className="custom-container" data-testid="k" />
            </FacetGroup>
        );
        const ids = { group: 'g', facet: 'f', content: 'c', value: 'v', container: 'k' } as const;
        for (const [part, id] of Object.entries(ids)) {
            const node = page.getByTestId(id).element();
            expect(refs[part as keyof typeof refs].current).toBe(node);
            expect(node.classList.contains(`custom-${part}`)).toBe(true);
        }
        expect(page.getByTestId('g').element().getAttribute('aria-busy')).toBe('true');
        expect(page.getByTestId('f').element().getAttribute('title')).toBe('native');
        // the user class wins over the facet's own
        await render(<Facet className="me-0" data-testid="m" />);
        expect(getComputedStyle(page.getByTestId('m').element()).marginInlineEnd).toBe('0px');
    });

    it('FacetContent and FacetFormValue render another element with render', async () => {
        await render(
            <Facet type="form">
                <FacetContent render={<li />} data-testid="li">
                    <FacetFormValue render={<strong />} data-testid="strong">
                        Value
                    </FacetFormValue>
                </FacetContent>
            </Facet>
        );
        expect(page.getByTestId('li').element().tagName).toBe('LI');
        expect(page.getByTestId('strong').element().tagName).toBe('STRONG');
    });
});
