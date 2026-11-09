import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { iconGlyphChar } from '@/ui/icon/icon';
import {
    Carousel,
    CarouselEngine,
    CarouselItem,
    type CarouselActions,
    type CarouselActiveSlides,
    type CarouselBackgroundOptions,
    type CarouselItemRef,
    type CarouselProps
} from './carousel';

const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

interface HostProps extends Partial<CarouselProps> {
    slides?: number[];
}

function Host({ slides = [1, 2, 3, 4], ...props }: HostProps) {
    return (
        <Carousel aria-label="Slides" width="300px" slideTransitionDuration={0} {...props}>
            {slides.map((slide) => (
                <CarouselItem key={slide} value={slide}>
                    <div style={{ width: 300, height: 100 }}>Slide {slide}</div>
                </CarouselItem>
            ))}
        </Carousel>
    );
}

async function setup(props: HostProps & { count?: number } = {}) {
    const changes: CarouselActiveSlides[] = [];
    const { count, ...rest } = props;
    const element = (p: HostProps) => (
        <Host visibleSlidesCount={count} onSlideChange={(event) => changes.push(event)} {...rest} {...p} />
    );
    const screen = await render(element({}));
    await frame();
    const root = screen.container;
    const listbox = root.querySelector<HTMLElement>('[role=listbox]')!;
    const button = (label: string) => root.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
    return {
        screen,
        root,
        listbox,
        changes,
        rerender: async (p: HostProps) => {
            await screen.rerender(element(p));
            await frame();
        },
        previous: () => button('Go to previous item'),
        next: () => button('Go to next item'),
        selected: () =>
            [...root.querySelectorAll('[role=option][aria-selected=true]')].map((o) => o.textContent!.trim()),
        live: () => root.querySelector('[aria-live]')!.textContent!.replace(/\s+/g, ' ').trim(),
        track: () => root.querySelector<HTMLElement>('[data-carousel-track]')!,
        transform: () => root.querySelector<HTMLElement>('[data-carousel-track]')!.style.transform,
        options: () => [...root.querySelectorAll<HTMLElement>('[role=option]')],
        dots: () => root.querySelectorAll('[role=img]')
    };
}

/** Resolves a theme variable to the colour the browser computes for it. */
function token(variable: string): string {
    const probe = document.createElement('div');
    probe.style.color = `var(${variable})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
}

/** Drags the slides with the primary pointer along the carousel's axis, from one offset to another. */
function drag(track: HTMLElement, axis: 'x' | 'y', from: number, to: number): void {
    const box = track.getBoundingClientRect();
    const point = (offset: number) =>
        axis === 'x'
            ? { clientX: box.left + offset, clientY: box.top + 50 }
            : { clientX: box.left + 50, clientY: box.top + offset };
    const fire = (type: string, target: EventTarget, offset: number) =>
        target.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0, isPrimary: true, ...point(offset) }));
    fire('pointerdown', track, from);
    fire('pointermove', document, (from + to) / 2);
    fire('pointermove', document, to);
    fire('pointerup', document, to);
}

afterEach(() => vi.restoreAllMocks());

describe('Carousel', () => {
    it('is a listbox of slides with page indicators', async () => {
        const { root, listbox, selected, live, previous, next, dots } = await setup();
        expect(listbox.getAttribute('aria-roledescription')).toBe('Carousel');
        expect(listbox.getAttribute('aria-label')).toBe('Slides');
        expect(listbox.tabIndex).toBe(0);
        const options = root.querySelectorAll('[role=option]');
        expect(options.length).toBe(4);
        expect(options[2].getAttribute('aria-setsize')).toBe('4');
        expect(options[2].getAttribute('aria-posinset')).toBe('3');
        expect(options[2].getAttribute('aria-hidden')).toBe('true');
        expect(options[0].id).toMatch(/^fd-carousel-item-/);
        expect(listbox.getAttribute('aria-activedescendant')).toBe(options[0].id);
        expect(selected()).toEqual(['Slide 1']);
        expect(live()).toBe('Displaying item 1 of 4');
        expect(dots().length).toBe(4);
        expect(dots()[0].getAttribute('aria-label')).toBe('Item 1 of 4 displayed');
        expect(previous().disabled).toBe(true);
        expect(previous().title).toBe('Go to previous item');
        expect(next().disabled).toBe(false);
    });

    it('moves with the buttons and stops at the ends', async () => {
        const { changes, selected, previous, next, transform, live } = await setup();
        await userEvent.click(next());
        expect(selected()).toEqual(['Slide 2']);
        expect(transform()).toBe('translateX(-300px)');
        expect(live()).toBe('Displaying item 2 of 4');
        expect(changes.at(-1)!.slideDirection).toBe('Next');
        await userEvent.click(next());
        await userEvent.click(next());
        expect(selected()).toEqual(['Slide 4']);
        expect(next().disabled).toBe(true);
        await userEvent.click(previous());
        expect(selected()).toEqual(['Slide 3']);
        expect(changes.at(-1)!.slideDirection).toBe('Previous');
        expect(changes.at(-1)!.activeItems.length).toBe(1);
        expect(changes.at(-1)!.activeItems[0]).toMatchObject({ index: 2, value: 3 });
    });

    it('moves with the arrow keys', async () => {
        const { listbox, selected } = await setup();
        listbox.focus();
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        expect(selected()).toEqual(['Slide 3']);
        await userEvent.keyboard('{ArrowLeft}');
        expect(selected()).toEqual(['Slide 2']);
        // Up and Down only move a vertical carousel
        await userEvent.keyboard('{ArrowDown}');
        expect(selected()).toEqual(['Slide 2']);
        expect(document.activeElement).toBe(listbox);
    });

    it('mirrors Left and Right in RTL', async () => {
        const { screen, selected, listbox } = await setup();
        await screen.rerender(
            <div dir="rtl">
                <DirectionProvider direction="rtl">
                    <Host />
                </DirectionProvider>
            </div>
        );
        await frame();
        const rtlList = screen.container.querySelector<HTMLElement>('[role=listbox]') ?? listbox;
        rtlList.focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(selected()).toEqual(['Slide 2']);
        expect(screen.container.querySelector<HTMLElement>('[data-carousel-track]')!.style.transform).toBe(
            'translateX(300px)'
        );
        await userEvent.keyboard('{ArrowRight}');
        expect(selected()).toEqual(['Slide 1']);
    });

    it('moves a vertical carousel with Up and Down', async () => {
        const { listbox, selected, transform } = await setup({ vertical: true });
        listbox.focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(selected()).toEqual(['Slide 2']);
        expect(transform()).toMatch(/^translateY\(-\d+px\)$/);
        await userEvent.keyboard('{ArrowUp}');
        expect(selected()).toEqual(['Slide 1']);
    });

    it('wraps around with loop', async () => {
        const { selected, previous, next } = await setup({ loop: true });
        expect(previous().disabled).toBe(false);
        await userEvent.click(previous());
        expect(selected()).toEqual(['Slide 4']);
        await userEvent.click(next());
        expect(selected()).toEqual(['Slide 1']);
    });

    it('shows the next slide beside the current one when looping', async () => {
        const { selected, previous, options, track } = await setup({ loop: true });
        await userEvent.click(previous());
        await frame();
        expect(selected()).toEqual(['Slide 4']);
        // the last slide is placed before the first (with the CSS order) and shown in the viewport
        const box = track().parentElement!.getBoundingClientRect();
        const shown = options()[3].getBoundingClientRect();
        expect(Math.round(shown.left)).toBe(Math.round(box.left));
        expect(Number(options()[3].style.order)).toBeLessThan(Number(options()[0].style.order));
    });

    it('shows several slides at once', async () => {
        const { selected, next, dots } = await setup({ count: 2 });
        expect(selected()).toEqual(['Slide 1', 'Slide 2']);
        // pages: 4 slides, 2 at a time
        expect(dots().length).toBe(3);
        await userEvent.click(next());
        await userEvent.click(next());
        expect(selected()).toEqual(['Slide 3', 'Slide 4']);
        expect(next().disabled).toBe(true);
    });

    it('shows a numeric indicator for more than eight slides', async () => {
        const { root, dots } = await setup({ slides: [1, 2, 3, 4, 5, 6, 7, 8, 9] });
        expect(dots().length).toBe(0);
        expect(root.textContent!.replace(/\s+/g, ' ')).toContain('1 of 9');
    });

    it('numericIndicator, pageIndicator and pageIndicatorContainer', async () => {
        const { root, rerender, dots, next } = await setup({ numericIndicator: true });
        expect(dots().length).toBe(0);
        expect(root.querySelector('[dir=ltr]')!.textContent).toBe('1 of 4');
        await rerender({ pageIndicator: false });
        expect(dots().length).toBe(0);
        expect(next()).not.toBeNull();
        await rerender({ pageIndicatorContainer: false });
        expect(dots().length).toBe(0);
        expect(next()).toBeNull();
    });

    it('puts the buttons over the slides and the indicators on top', async () => {
        const { root, next, dots } = await setup({ navigatorInPageIndicator: false, pageIndicatorsOrientation: 'top' });
        const content = root.querySelector('[data-carousel-list]')!.parentElement!;
        expect(content.contains(next())).toBe(true);
        expect(next().className).toContain('absolute');
        // the indicator bar comes before the slides
        const bar = dots()[0].parentElement!.parentElement!;
        expect(bar.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('navigation={false} hides the buttons; the keys still move', async () => {
        const { listbox, selected, root } = await setup({ navigation: false });
        expect(root.querySelectorAll('button').length).toBe(0);
        listbox.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(selected()).toEqual(['Slide 2']);
    });

    it('slides by dragging', async () => {
        const { selected, changes, track } = await setup();
        drag(track(), 'x', 250, 50);
        await frame();
        expect(selected()).toEqual(['Slide 2']);
        expect(changes.at(-1)!.slideDirection).toBe('Next');
    });

    it('swipeEnabled={false} ignores dragging', async () => {
        const { selected, changes, track } = await setup({ swipeEnabled: false });
        drag(track(), 'x', 250, 50);
        await frame();
        expect(selected()).toEqual(['Slide 1']);
        expect(changes.length).toBe(0);
    });

    it('goes back to the first slide when the slides change', async () => {
        const { selected, next, rerender, dots } = await setup();
        await userEvent.click(next());
        await rerender({ slides: [1, 2, 3] });
        expect(selected()).toEqual(['Slide 1']);
        expect(dots().length).toBe(3);
    });

    it('contentBackground, pageIndicatorBackground and noPaginationContainerBorder apply their tokens', async () => {
        const { root, rerender, dots } = await setup();
        const content = root.querySelector<HTMLElement>('[data-carousel-list]')!.parentElement!;
        const indicators = () => dots()[0].parentElement!.parentElement! as HTMLElement;
        const background = (el: HTMLElement) => getComputedStyle(el).backgroundColor;
        // defaults: translucent content, solid page indicator, with a border
        expect(background(content)).toBe(token('--sapBackgroundColor'));
        expect(background(indicators())).toBe(token('--sapPageFooter_Background'));
        expect(getComputedStyle(indicators()).borderTopColor).toBe(token('--sapList_BorderColor'));

        const props = (content: CarouselBackgroundOptions, indicators: CarouselBackgroundOptions) => ({
            contentBackground: content,
            pageIndicatorBackground: indicators,
            noPaginationContainerBorder: true
        });
        await rerender(props('solid', 'translucent'));
        expect(background(content)).toBe(token('--sapGroup_ContentBackground'));
        expect(background(indicators())).toBe(token('--sapBackgroundColor'));
        expect(getComputedStyle(indicators()).borderTopColor).toBe('rgba(0, 0, 0, 0)');

        await rerender(props('transparent', 'transparent'));
        expect(background(content)).toBe('rgba(0, 0, 0, 0)');
        expect(background(indicators())).toBe('rgba(0, 0, 0, 0)');
    });

    it('a vertical carousel shows up and down navigation icons', async () => {
        const { root, rerender } = await setup();
        const glyphs = () =>
            [...root.querySelectorAll<HTMLElement>('button [data-glyph]')].map((icon) => icon.dataset['glyph']);
        expect(glyphs()).toEqual([iconGlyphChar('slim-arrow-left'), iconGlyphChar('slim-arrow-right')]);
        await rerender({ vertical: true });
        expect(glyphs()).toEqual([iconGlyphChar('slim-arrow-up'), iconGlyphChar('slim-arrow-down')]);
    });

    it('changing visibleSlidesCount re-pages the slides', async () => {
        const { selected, next, transform, rerender, dots, changes } = await setup();
        expect(dots().length).toBe(4);
        await rerender({ visibleSlidesCount: 2 });
        expect(selected()).toEqual(['Slide 1', 'Slide 2']);
        expect(dots().length).toBe(3);
        await userEvent.click(next());
        expect(selected()).toEqual(['Slide 2', 'Slide 3']);
        // the slides are half as wide: the offset follows (Angular keeps the old one)
        expect(transform()).toBe('translateX(-150px)');

        await rerender({ visibleSlidesCount: 4 });
        expect(selected()).toEqual(['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4']);
        // one page: no indicators and no navigation
        expect(dots().length).toBe(0);
        expect(next()).toBeNull();
        expect(transform()).toBe('translateX(0px)');
        // like upstream, a new count reports the shown slides
        expect(changes.at(-1)!.slideDirection).toBe('None');
        expect(changes.at(-1)!.activeItems.length).toBe(4);
    });

    it('keeps the shown slide in place when the carousel is resized', async () => {
        const { next, transform, rerender } = await setup();
        await userEvent.click(next());
        expect(transform()).toBe('translateX(-300px)');
        await rerender({ width: '260px' });
        expect(transform()).toBe('translateX(-260px)');
    });

    it('aria-activedescendant and aria-hidden follow the active slide after navigating', async () => {
        const { listbox, options, next } = await setup();
        await userEvent.click(next());
        await userEvent.click(next());
        await frame();
        expect(listbox.getAttribute('aria-activedescendant')).toBe(options()[2].id);
        expect(options().map((o) => o.getAttribute('aria-hidden'))).toEqual(['true', 'true', 'false', 'true']);
        expect(options().map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true', 'false']);
        expect(getComputedStyle(options()[2]).visibility).toBe('visible');
        expect(getComputedStyle(options()[0]).visibility).toBe('hidden');
    });

    it('releasing a drag before half a slide snaps back', async () => {
        const { selected, track, transform, changes } = await setup();
        drag(track(), 'x', 250, 150);
        await frame();
        expect(selected()).toEqual(['Slide 1']);
        expect(transform()).toBe('translateX(0px)');
        expect(changes.length).toBe(0);
    });

    it('dragging a vertical carousel moves to the next slide', async () => {
        const { selected, track, transform, changes } = await setup({ vertical: true });
        drag(track(), 'y', 90, 10);
        await frame();
        expect(selected()).toEqual(['Slide 2']);
        expect(transform()).toMatch(/^translateY\(-\d+px\)$/);
        expect(changes.at(-1)!.slideDirection).toBe('Next');
    });

    it('slides with the transition duration, and without one for prefers-reduced-motion', async () => {
        const { next, track } = await setup({ slideTransitionDuration: 300 });
        await userEvent.click(next());
        expect(track().style.transitionDuration).toBe('300ms');

        const matchMedia = window.matchMedia.bind(window);
        vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
            const list = matchMedia(query);
            if (query !== '(prefers-reduced-motion: reduce)') return list;
            return Object.defineProperty(list, 'matches', { value: true });
        });
        const reduced = await setup({ slideTransitionDuration: 300 });
        await userEvent.click(reduced.next());
        expect(reduced.selected()).toEqual(['Slide 2']);
        expect(reduced.track().style.transitionDuration).toBe('0ms');
    });

    it('a click on the slides focuses the carousel; the buttons keep the focus', async () => {
        const { listbox, root, next } = await setup();
        await userEvent.click(root.querySelector('[role=option]')!);
        expect(document.activeElement).toBe(listbox);
        await userEvent.click(next());
        expect(document.activeElement).toBe(next());
    });

    it('a loading slide shows a busy indicator', async () => {
        const screen = await render(
            <Carousel aria-label="Loading" width="300px">
                <CarouselItem loading>
                    <div style={{ width: 300, height: 100 }}>Slide 1</div>
                </CarouselItem>
                <CarouselItem>
                    <div style={{ width: 300, height: 100 }}>Slide 2</div>
                </CarouselItem>
            </Carousel>
        );
        const options = screen.container.querySelectorAll('[role=option]');
        expect(options[0].getAttribute('aria-busy')).toBe('true');
        expect(options[0].querySelector('[role=progressbar]')).not.toBeNull();
        // out of the focus order: no nested interactive control in the option
        expect(options[0].querySelector('[role=progressbar]')!.hasAttribute('tabindex')).toBe(false);
        expect(options[1].hasAttribute('aria-busy')).toBe(false);
        expect(options[1].querySelector('[role=progressbar]')).toBeNull();
    });

    it('other content without slides is no listbox', async () => {
        const screen = await render(
            <Carousel aria-label="Error" width="300px">
                <p>Items could not be loaded.</p>
            </Carousel>
        );
        const list = screen.container.querySelector('[data-carousel-list]')!;
        expect(list.hasAttribute('role')).toBe(false);
        expect(list.hasAttribute('tabindex')).toBe(false);
        expect(screen.container.querySelectorAll('button').length).toBe(0);
        expect(screen.container.textContent).toContain('Items could not be loaded.');
    });

    it('actionsRef moves and focuses the carousel', async () => {
        const actions = createRef<CarouselActions>();
        const { selected, rerender, listbox } = await setup();
        await rerender({ actionsRef: actions });
        actions.current!.next();
        actions.current!.next();
        await frame();
        expect(selected()).toEqual(['Slide 3']);
        actions.current!.previous();
        await frame();
        expect(selected()).toEqual(['Slide 2']);
        actions.current!.focus();
        expect(document.activeElement).toBe(listbox);
    });

    it('passes native props and the ref to the root, and the labels to the listbox', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <Carousel
                ref={ref}
                id="photos"
                className="custom"
                data-testid="carousel"
                aria-labelledby="photos-title"
                aria-describedby="photos-hint"
                width="20rem"
                height="10rem"
            >
                <CarouselItem id="first" aria-label="First" className="slide">
                    A
                </CarouselItem>
            </Carousel>
        );
        const root = screen.container.firstElementChild as HTMLElement;
        expect(ref.current).toBe(root);
        expect(root.id).toBe('photos');
        expect(root.className).toContain('custom');
        expect(root.getAttribute('data-testid')).toBe('carousel');
        expect(root.style.width).toBe('20rem');
        expect((root.firstElementChild as HTMLElement).style.height).toBe('10rem');
        const listbox = root.querySelector('[role=listbox]')!;
        expect(listbox.getAttribute('aria-labelledby')).toBe('photos-title');
        expect(listbox.getAttribute('aria-describedby')).toBe('photos-hint');
        expect(root.hasAttribute('aria-labelledby')).toBe(false);
        const option = root.querySelector('[role=option]')!;
        expect(option.id).toBe('first');
        expect(option.getAttribute('aria-label')).toBe('First');
        expect(option.className).toContain('slide');
        expect(listbox.getAttribute('aria-activedescendant')).toBe('first');
    });
});

describe('CarouselEngine', () => {
    it('keeps the active item in the middle when infinite', async () => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'height: 30px; overflow: hidden';
        const track = document.createElement('div');
        track.style.cssText = 'display: flex; flex-direction: column';
        wrapper.appendChild(track);
        const items: (CarouselItemRef & { value: number })[] = [0, 1, 2, 3, 4].map((value) => {
            const element = document.createElement('div');
            element.style.cssText = 'height: 30px; flex-shrink: 0';
            element.textContent = String(value);
            track.appendChild(element);
            return {
                value,
                element,
                getWidth: () => element.getBoundingClientRect().width,
                getHeight: () => element.getBoundingClientRect().height
            };
        });
        document.body.appendChild(wrapper);
        const engine = new CarouselEngine(track);
        engine.config = { vertical: true, infinite: true, transition: '0ms' };
        engine.setItems(items);
        // the order the items are shown in (the CSS order; the DOM is left alone)
        const order = () =>
            [...track.children]
                .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
                .map((e) => Number(e.textContent));
        engine.goToItem(items[0]);
        // the first item moves to the middle: the last ones wrap around before it
        expect(order()).toEqual([3, 4, 0, 1, 2]);
        expect([...track.children].map((e) => Number(e.textContent))).toEqual([0, 1, 2, 3, 4]);
        expect(engine.currentTransitionPx).toBe(-60);
        engine.pickPrevious();
        expect((engine.active as (typeof items)[number]).value).toBe(4);
        expect(order()).toEqual([2, 3, 4, 0, 1]);
        engine.resetOrder();
        expect(order()).toEqual([0, 1, 2, 3, 4]);
        engine.destroy();
        wrapper.remove();
    });
});
