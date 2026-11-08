import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Icon } from '@/ui/icon/icon';
import { RatingIndicator, type RatingIndicatorProps, type RatingIndicatorSize } from './rating-indicator';

/** The parent of a controlled rating: keeps the model in state, as Angular's form control host. */
function Host({
    initial = 2,
    changes,
    ...props
}: RatingIndicatorProps & { initial?: number | null; changes: number[] }) {
    const [model, setModel] = useState<number | null>(initial);
    return (
        <div>
            <RatingIndicator
                aria-label="Rating"
                {...props}
                value={model}
                onValueChange={(v) => {
                    changes.push(v);
                    setModel(v);
                }}
            />
            <output data-testid="model">{String(model)}</output>
            <button id="after">After</button>
        </div>
    );
}

/** Per star: 1 rated, 0.5 the first half rated, 0 unrated. */
const rated = (root: HTMLElement) =>
    [...root.querySelectorAll('[role=slider] li')].map((li) => {
        const halves = [...li.querySelectorAll('[data-glyph]')].map((icon) =>
            icon.className.includes('text-sap-content-rated-color')
        );
        return halves[0] && halves[1] ? 1 : halves[0] ? 0.5 : 0;
    });

async function setup(initial: RatingIndicatorProps & { initial?: number | null; rtl?: boolean } = {}) {
    const { rtl, ...rest } = initial;
    let current = rest;
    const changes: number[] = [];
    const ui = (p: typeof current) => {
        const host = <Host {...p} changes={changes} />;
        return rtl ? (
            <DirectionProvider direction="rtl">
                <div dir="rtl">{host}</div>
            </DirectionProvider>
        ) : (
            host
        );
    };
    const screen = await render(ui(current));
    const root = screen.container;
    return {
        root,
        changes,
        slider: () => root.querySelector<HTMLElement>('[role=slider]')!,
        stars: () => [...root.querySelectorAll<HTMLElement>('[role=slider] li')],
        model: () => root.querySelector('[data-testid=model]')!.textContent,
        update: async (change: Partial<typeof current>) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('RatingIndicator', () => {
    it('is a slider with the rating as its value', async () => {
        const { root, slider } = await setup();
        expect(slider().getAttribute('aria-valuemin')).toBe('0');
        expect(slider().getAttribute('aria-valuemax')).toBe('5');
        expect(slider().getAttribute('aria-valuenow')).toBe('2');
        expect(slider().getAttribute('aria-valuetext')).toBe('2 of 5');
        expect(slider().getAttribute('aria-roledescription')).toBe('Rating Indicator');
        expect(slider().getAttribute('aria-label')).toBe('Rating');
        expect(slider().getAttribute('tabindex')).toBe('0');
        expect(slider().querySelector('ul')!.getAttribute('aria-hidden')).toBe('true');
        expect(rated(root)).toEqual([1, 1, 0, 0, 0]);
        expect(root.textContent).toContain('(2 of 5)');
    });

    it('rates with the keyboard', async () => {
        const { slider, model, changes } = await setup();
        slider().focus();
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        expect(model()).toBe('4');
        await userEvent.keyboard('{ArrowLeft}');
        expect(model()).toBe('3');
        await userEvent.keyboard('{End}');
        expect(model()).toBe('5');
        await userEvent.keyboard('{Home}');
        expect(model()).toBe('0');
        await userEvent.keyboard('4');
        expect(model()).toBe('4');
        expect(changes).toHaveLength(6);
        await userEvent.keyboard('{ArrowUp}{ArrowDown}{ArrowDown}');
        expect(model()).toBe('3');
        // a digit above the maximum stops there; at the maximum, Right is no change
        await userEvent.keyboard('9{ArrowRight}');
        expect(model()).toBe('5');
        expect(changes).toHaveLength(10);
    });

    it('steps by halves with allowHalves', async () => {
        const { slider, model } = await setup({ allowHalves: true });
        slider().focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(model()).toBe('2.5');
        await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
        expect(model()).toBe('1.5');
    });

    it('mirrors Left and Right in RTL', async () => {
        const { slider, model } = await setup({ rtl: true });
        slider().focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(model()).toBe('3');
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        expect(model()).toBe('1');
    });

    it('rates halves by clicking the first half of a star', async () => {
        const { root, stars, model, slider } = await setup({ allowHalves: true });
        const star = stars()[3];
        const rect = star.getBoundingClientRect();
        await userEvent.click(star, { position: { x: 2, y: rect.height / 2 } });
        expect(model()).toBe('3.5');
        expect(document.activeElement).toBe(slider());
        await userEvent.click(star, { position: { x: rect.width - 2, y: rect.height / 2 } });
        expect(model()).toBe('4');
        expect(rated(root)).toEqual([1, 1, 1, 1, 0]);
    });

    it('rates the first half of a star from the right in RTL', async () => {
        const { stars, model } = await setup({ allowHalves: true, rtl: true });
        const star = stars()[3];
        const rect = star.getBoundingClientRect();
        await userEvent.click(star, { position: { x: rect.width - 2, y: rect.height / 2 } });
        expect(model()).toBe('3.5');
    });

    it('rounds values to whole or half stars', async () => {
        const screen = await render(<RatingIndicator aria-label="Rating" allowHalves value={2.4} />);
        expect(rated(screen.container)).toEqual([1, 1, 0.5, 0, 0]);
        await screen.rerender(<RatingIndicator aria-label="Rating" allowHalves value={4.8} />);
        expect(rated(screen.container)).toEqual([1, 1, 1, 1, 1]);
        // without halves, .5 rounds down and more rounds up
        await screen.rerender(<RatingIndicator aria-label="Rating" value={2.5} />);
        expect(rated(screen.container)).toEqual([1, 1, 0, 0, 0]);
        await screen.rerender(<RatingIndicator aria-label="Rating" value={2.6} />);
        expect(rated(screen.container)).toEqual([1, 1, 1, 0, 0]);
    });

    it('shows the average and the number of votes of ratings', async () => {
        const { root, slider } = await setup({ initial: null, ratings: { 5: 3, 3: 1 } });
        // the average 4.5 rounds down without halves
        expect(slider().getAttribute('aria-valuenow')).toBe('4');
        expect(root.textContent).toContain('(4)');
    });

    it('shows ratingAverage and totalRatings, and hides the text without a rating', async () => {
        const screen = await render(<RatingIndicator aria-label="Rating" ratingAverage={3.2} totalRatings={126} />);
        const slider = screen.container.querySelector('[role=slider]')!;
        expect(slider.getAttribute('aria-valuenow')).toBe('3');
        expect(screen.container.textContent).toContain('(126)');
        await screen.rerender(<RatingIndicator aria-label="Rating" />);
        expect(slider.getAttribute('aria-valuenow')).toBe('0');
        expect(screen.container.textContent).toBe('');
        await screen.rerender(<RatingIndicator aria-label="Rating" value={2} showDynamicText={false} />);
        expect(screen.container.textContent).toBe('');
    });

    it('is read-only in display mode, with smaller unrated icons and filled unrated stars', async () => {
        const { slider, stars, model, update } = await setup({ displayMode: true });
        expect(slider().getAttribute('aria-readonly')).toBe('true');
        slider().focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(model()).toBe('2');
        await userEvent.click(stars()[4]);
        expect(model()).toBe('2');
        expect(stars()[4].hasAttribute('data-small')).toBe(true);
        expect(stars()[0].hasAttribute('data-small')).toBe(false);
        expect(stars()[4].getBoundingClientRect().width).toBe(18);
        const glyphs = stars().map((s) => s.querySelector('[data-glyph]')!.getAttribute('data-glyph'));
        expect(new Set(glyphs).size).toBe(1);
        await update({ displayMode: false, nonInteractive: true });
        expect(slider().getAttribute('aria-readonly')).toBe('true');
        expect(stars()[4].hasAttribute('data-small')).toBe(false);
        await userEvent.keyboard('{ArrowRight}');
        expect(model()).toBe('2');
    });

    it('lists the votes per rating in a named popover with displayAllRatings', async () => {
        const { root, update } = await setup({ initial: null, ratings: { 5: 3, 3: 1 } });
        await update({ displayAllRatings: true });
        const link = root.querySelector<HTMLElement>('a')!;
        expect(link.textContent!.trim()).toBe('4');
        expect(link.getAttribute('aria-label')).toBe('Total ratings 4');
        await userEvent.hover(link);
        // the dialog needs a name (axe aria-dialog-name)
        await expect.poll(() => document.querySelector('[role=dialog]')).not.toBeNull();
        const body = document.querySelector<HTMLElement>('[role=dialog]')!;
        expect(body.getAttribute('aria-label')).toBe('Total ratings');
        const items = [...body.querySelectorAll('ul[aria-label="Total ratings"] > li')];
        expect(items.map((item) => item.textContent!.replace(/\s+/g, ' ').trim())).toEqual([
            '5 of 5:(3)',
            '3 of 5:(1)'
        ]);
        // a click on the link does not navigate
        const click = new MouseEvent('click', { bubbles: true, cancelable: true });
        link.dispatchEvent(click);
        expect(click.defaultPrevented).toBe(true);
        await userEvent.unhover(link);
        await userEvent.hover(root.querySelector<HTMLElement>('#after')!);
        await expect.poll(() => document.querySelector('[role=dialog]')).toBeNull();
    });

    it('opens the votes per rating on focus', async () => {
        const { root } = await setup({ initial: null, ratings: { 4: 2 }, displayAllRatings: true });
        root.querySelector<HTMLElement>('a')!.focus();
        await expect.poll(() => document.querySelector('[role=dialog]')).not.toBeNull();
        root.querySelector<HTMLElement>('#after')!.focus();
        await expect.poll(() => document.querySelector('[role=dialog]')).toBeNull();
    });
});

describe('RatingIndicator options', () => {
    function Glyphs() {
        return (
            <div>
                <Icon id="ref-rated" glyph="heart" />
                <Icon id="ref-unrated" glyph="heart-2" />
                <Icon id="ref-star" glyph="favorite" />
                <Icon id="ref-empty" glyph="unfavorite" />
            </div>
        );
    }

    it('uses custom rated and unrated icons', async () => {
        const screen = await render(
            <>
                <RatingIndicator aria-label="Rating" value={2} />
                <Glyphs />
            </>
        );
        const root = screen.container;
        const glyphs = () =>
            [...root.querySelectorAll('[role=slider] li')].map((star) =>
                star.querySelector('[data-glyph]')!.getAttribute('data-glyph')
            );
        const ref = (id: string) => root.querySelector(`#${id}`)!.getAttribute('data-glyph');
        expect(glyphs()).toEqual([
            ref('ref-star'),
            ref('ref-star'),
            ref('ref-empty'),
            ref('ref-empty'),
            ref('ref-empty')
        ]);
        await screen.rerender(
            <>
                <RatingIndicator aria-label="Rating" value={2} ratedIcon="heart" unratedIcon="heart-2" />
                <Glyphs />
            </>
        );
        expect(glyphs()).toEqual([
            ref('ref-rated'),
            ref('ref-rated'),
            ref('ref-unrated'),
            ref('ref-unrated'),
            ref('ref-unrated')
        ]);
    });

    it('sizes the icons with size', async () => {
        const screen = await render(<RatingIndicator aria-label="Rating" value={2} />);
        const width = () => screen.container.querySelector('[role=slider] li')!.getBoundingClientRect().width;
        const sizes: Record<RatingIndicatorSize, number> = { xs: 12, sm: 22, md: 24, lg: 32 };
        for (const size of ['xs', 'sm', 'md', 'lg'] as const) {
            await screen.rerender(<RatingIndicator aria-label="Rating" value={2} size={size} />);
            expect(width()).toBe(sizes[size]);
        }
    });

    it('sets the maximum with indicatorCapacity and falls back to 5 for 0', async () => {
        const screen = await render(<RatingIndicator aria-label="Rating" value={2} indicatorCapacity={7} />);
        const slider = screen.container.querySelector('[role=slider]')!;
        const stars = () => screen.container.querySelectorAll('[role=slider] li');
        expect(stars()).toHaveLength(7);
        expect(slider.getAttribute('aria-valuemax')).toBe('7');
        expect(slider.getAttribute('aria-valuetext')).toBe('2 of 7');
        await screen.rerender(<RatingIndicator aria-label="Rating" value={3.5} allowHalves indicatorCapacity={4} />);
        expect(stars()).toHaveLength(4);
        expect(slider.getAttribute('aria-valuetext')).toBe('3.5 of 4');
        await screen.rerender(<RatingIndicator aria-label="Rating" value={3.5} allowHalves indicatorCapacity={0} />);
        expect(stars()).toHaveLength(5);
        expect(slider.getAttribute('aria-valuemax')).toBe('5');
    });

    it('shows half values in the value text', async () => {
        const screen = await render(<RatingIndicator aria-label="Rating" value={3.5} allowHalves />);
        const slider = screen.container.querySelector('[role=slider]')!;
        expect(slider.getAttribute('aria-valuenow')).toBe('3.5');
        expect(slider.getAttribute('aria-valuetext')).toBe('3.5 of 5');
        expect(screen.container.textContent).toContain('(3.5 of 5)');
    });

    it('puts dynamicTextIndicator between the rating and the maximum', async () => {
        const screen = await render(<RatingIndicator aria-label="Rating" value={2} dynamicTextIndicator="von" />);
        expect(screen.container.querySelector('[role=slider]')!.getAttribute('aria-valuetext')).toBe('2 von 5');
        expect(screen.container.textContent).toContain('(2 von 5)');
    });

    it('takes aria-labelledby and aria-roledescription', async () => {
        const screen = await render(
            <RatingIndicator aria-labelledby="name" aria-roledescription="Bewertung" value={1} />
        );
        const slider = screen.container.querySelector('[role=slider]')!;
        expect(slider.getAttribute('aria-labelledby')).toBe('name');
        expect(slider.hasAttribute('aria-label')).toBe(false);
        expect(slider.getAttribute('aria-roledescription')).toBe('Bewertung');
    });
});

describe('RatingIndicator events and forms', () => {
    it('calls onValueChange on a click (Angular ratingChanged), not for the same rating again', async () => {
        const { stars, model, changes } = await setup();
        await userEvent.click(stars()[3]);
        expect(model()).toBe('4');
        expect(changes).toEqual([4]);
        await userEvent.click(stars()[3]);
        expect(changes).toEqual([4]);
    });

    it('is disabled', async () => {
        const { root, slider, stars, model, changes, update } = await setup();
        await update({ disabled: true });
        expect(slider().getAttribute('tabindex')).toBe('-1');
        expect(slider().getAttribute('aria-disabled')).toBe('true');
        expect(root.querySelector('[data-slot=rating-indicator]')!.getAttribute('aria-disabled')).toBe('true');
        stars()[4].click();
        slider().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        expect(model()).toBe('2');
        expect(changes).toHaveLength(0);
        await update({ disabled: false });
        expect(slider().getAttribute('tabindex')).toBe('0');
        expect(slider().hasAttribute('aria-disabled')).toBe(false);
    });

    it('works uncontrolled and reports touched through onBlur', async () => {
        const onValueChange = vi.fn();
        const onBlur = vi.fn();
        const screen = await render(
            <RatingIndicator aria-label="Rating" defaultValue={1} onValueChange={onValueChange} onBlur={onBlur} />
        );
        const slider = screen.container.querySelector<HTMLElement>('[role=slider]')!;
        slider.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(onValueChange).toHaveBeenLastCalledWith(2);
        expect(slider.getAttribute('aria-valuenow')).toBe('2');
        slider.blur();
        expect(onBlur).toHaveBeenCalled();
    });

    it('passes className, native props and the ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <RatingIndicator ref={ref} aria-label="Rating" className="extra" id="ri" data-testid="ri" value={2} />
        );
        const root = screen.container.querySelector<HTMLElement>('[data-slot=rating-indicator]')!;
        expect(ref.current).toBe(root);
        expect(root.id).toBe('ri');
        expect(root.dataset['testid']).toBe('ri');
        expect(root.className).toContain('extra');
        expect(root.className).toContain('inline-flex');
    });
});
