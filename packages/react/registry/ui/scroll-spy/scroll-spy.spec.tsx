import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { ScrollSpy, useScrollSpy, type ScrollSpyProps } from './scroll-spy';

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

function Content() {
    return (
        <>
            <p id="lead" style={{ height: 50, margin: 0 }}>
                Lead
            </p>
            <section id="one" style={{ height: 200 }}>
                One
            </section>
            <h2 id="h-two" style={{ height: 50, margin: 0 }}>
                Heading
            </h2>
            <section id="two" style={{ height: 200 }}>
                Two
            </section>
            <section id="three" style={{ height: 200 }}>
                Three
            </section>
            <section id="four" style={{ height: 200 }}>
                Four
            </section>
        </>
    );
}

async function setup(initial: Partial<ScrollSpyProps> = {}) {
    let current: Partial<ScrollSpyProps> = { trackedTags: ['section'], ...initial };
    const spied: (string | undefined)[] = [];
    const ui = (p: Partial<ScrollSpyProps>) => (
        <ScrollSpy
            data-testid="spy"
            onSpyChange={(element) => spied.push(element?.id)}
            style={{ height: 200, overflow: 'auto' }}
            {...p}
        >
            <Content />
        </ScrollSpy>
    );
    const screen = await render(ui(current));
    await frame();
    await frame();
    const container = screen.container.querySelector<HTMLElement>('[data-testid="spy"]')!;
    const scrollTo = async (top: number) => {
        container.scrollTop = top;
        container.dispatchEvent(new Event('scroll'));
        await frame();
    };
    return {
        screen,
        spied,
        container,
        scrollTo,
        update: async (change: Partial<ScrollSpyProps>) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

// Offsets from the first child: lead 0, one 50, h-two 250, two 300, three 500, four 700.
describe('ScrollSpy', () => {
    it('reports once on render with the tracked child at the top', async () => {
        const { spied } = await setup({ trackedTags: ['p', 'section'] });
        expect(spied).toEqual(['lead']);
    });

    it('reports the section nearest the top while scrolling', async () => {
        const { spied, scrollTo } = await setup();
        spied.length = 0;
        await scrollTo(60);
        expect(spied).toEqual(['one']);
        // no new report while the same section stays at the top
        await scrollTo(150);
        expect(spied).toEqual(['one']);
        await scrollTo(320);
        await scrollTo(520);
        expect(spied).toEqual(['one', 'two', 'three']);
        // and back up
        await scrollTo(310);
        expect(spied).toEqual(['one', 'two', 'three', 'two']);
    });

    it('trackedTags filters the children', async () => {
        const { spied, scrollTo } = await setup({ trackedTags: ['h2'] });
        expect(spied).toEqual([undefined]);
        spied.length = 0;
        await scrollTo(100);
        expect(spied).toEqual([]);
        await scrollTo(260);
        await scrollTo(600);
        // h2 stays the spied element, sections are ignored
        expect(spied).toEqual(['h-two']);
    });

    it('matches tag names case-insensitively and tracks several tags', async () => {
        const { spied, scrollTo } = await setup({ trackedTags: ['SECTION', 'H2'] });
        spied.length = 0;
        await scrollTo(60);
        await scrollTo(260);
        await scrollTo(310);
        expect(spied).toEqual(['one', 'h-two', 'two']);
    });

    it('tracks nothing without trackedTags', async () => {
        const { spied, scrollTo } = await setup({ trackedTags: undefined });
        expect(spied).toEqual([undefined]);
        await scrollTo(520);
        expect(spied).toEqual([undefined]);
    });

    it('targetOffset moves the reach line', async () => {
        const { spied, scrollTo } = await setup({ targetOffset: 100 });
        spied.length = 0;
        // 'two' is at 300; with the offset it is reached at scrollTop 200
        await scrollTo(210);
        expect(spied).toEqual(['two']);
    });

    it('targetPercent counts part of the container height as reached', async () => {
        const { spied, scrollTo } = await setup({ targetPercent: 0.5 });
        spied.length = 0;
        // reach line at scrollTop + 100: 'two' (300) is reached at 200
        await scrollTo(210);
        expect(spied).toEqual(['two']);
    });

    it('fireEmpty reports undefined when no tracked child is reached yet', async () => {
        const { spied, scrollTo } = await setup({ trackedTags: ['h2'], fireEmpty: true });
        await scrollTo(260);
        expect(spied.at(-1)).toBe('h-two');
        await scrollTo(0);
        expect(spied.at(-1)).toBeUndefined();
    });

    it('without fireEmpty, scrolling back above all tracked children keeps the last one', async () => {
        const { spied, scrollTo } = await setup({ trackedTags: ['h2'] });
        await scrollTo(260);
        spied.length = 0;
        await scrollTo(0);
        expect(spied).toEqual([]);
    });

    it('disabled stops the reports', async () => {
        const { spied, scrollTo, update } = await setup();
        await update({ disabled: true });
        spied.length = 0;
        await scrollTo(520);
        expect(spied).toEqual([]);
        await update({ disabled: false });
        await scrollTo(530);
        expect(spied).toEqual(['three']);
    });

    it('reports the current child again when the container is resized', async () => {
        const { spied, container, scrollTo } = await setup();
        await scrollTo(320);
        spied.length = 0;
        container.style.height = '250px';
        await frame();
        await frame();
        expect(spied).toEqual(['two']);
    });

    it('takes option and callback changes without remounting', async () => {
        const { spied, scrollTo, update } = await setup();
        await scrollTo(210);
        expect(spied.at(-1)).toBe('one');
        const later: (string | undefined)[] = [];
        await update({ targetOffset: 100, onSpyChange: (element) => later.push(element?.id) });
        await scrollTo(220);
        expect(later).toEqual(['two']);
    });

    it('passes native props, className and the ref to a div, and render renders another element', async () => {
        const ref = createRef<HTMLDivElement>();
        const { screen, container, update } = await setup({
            ref,
            className: 'custom',
            id: 'spy',
            'aria-label': 'Content',
            tabIndex: 0
        });
        expect(container.tagName).toBe('DIV');
        expect(container.className).toBe('custom');
        expect(container.id).toBe('spy');
        expect(container.getAttribute('aria-label')).toBe('Content');
        expect(container.tabIndex).toBe(0);
        expect(ref.current).toBe(container);

        await update({ render: <main /> });
        const main = screen.container.querySelector<HTMLElement>('main[data-testid="spy"]')!;
        expect(main).not.toBeNull();
        expect(ref.current).toBe(main);
    });

    it('stops listening when unmounted', async () => {
        const { screen, spied, container } = await setup();
        screen.unmount();
        spied.length = 0;
        container.scrollTop = 520;
        container.dispatchEvent(new Event('scroll'));
        expect(spied).toEqual([]);
    });
});

describe('useScrollSpy', () => {
    it('spies on an element of your own', async () => {
        const spied: (string | undefined)[] = [];
        function Article() {
            const ref = useScrollSpy<HTMLElement>({
                trackedTags: ['h2'],
                fireEmpty: true,
                onSpyChange: (element) => spied.push(element?.id)
            });
            return (
                <article ref={ref} data-testid="article" style={{ height: 100, overflow: 'auto' }}>
                    <p style={{ height: 150, margin: 0 }}>Lead</p>
                    <h2 id="a" style={{ height: 150, margin: 0 }}>
                        A
                    </h2>
                    <h2 id="b" style={{ height: 300, margin: 0 }}>
                        B
                    </h2>
                </article>
            );
        }
        const screen = await render(<Article />);
        await frame();
        await frame();
        expect(spied).toEqual([undefined]);
        const article = screen.container.querySelector<HTMLElement>('[data-testid="article"]')!;
        article.scrollTop = 160;
        article.dispatchEvent(new Event('scroll'));
        article.scrollTop = 310;
        article.dispatchEvent(new Event('scroll'));
        article.scrollTop = 10;
        article.dispatchEvent(new Event('scroll'));
        expect(spied).toEqual([undefined, 'a', 'b', undefined]);
    });
});
