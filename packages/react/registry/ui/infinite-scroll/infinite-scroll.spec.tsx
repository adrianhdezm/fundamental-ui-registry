import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { InfiniteScroll, shouldTriggerAction, useInfiniteScroll, type InfiniteScrollProps } from './infinite-scroll';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface HostProps extends InfiniteScrollProps {
    count?: number;
}

/** Mirrors the Angular test host: a 200px container of 50px items. */
function Host({ count = 20, ...props }: HostProps) {
    return (
        <InfiniteScroll data-testid="scroller" style={{ height: 200, overflow: 'auto' }} {...props}>
            {Array.from({ length: count }, (_, i) => (
                <div key={i} style={{ height: 50 }}>
                    Item {i}
                </div>
            ))}
        </InfiniteScroll>
    );
}

async function setup(initial: HostProps = {}) {
    let current = initial;
    const loads = { count: 0 };
    const ui = (p: HostProps) => <Host onScrollAction={() => loads.count++} {...p} />;
    const screen = await render(ui(current));
    const scroller = document.querySelector<HTMLElement>('[data-testid="scroller"]')!;
    const scrollTo = async (top: number) => {
        scroller.scrollTop = top;
        scroller.dispatchEvent(new Event('scroll'));
        await wait(100);
    };
    return {
        screen,
        loads,
        scroller,
        scrollTo,
        update: async (change: HostProps) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('InfiniteScroll', () => {
    // content 1000px, viewport 200px: 75% is passed once scrollTop + 200 > 750
    it('calls onScrollAction when the scroll position is within scrollPercent of the end', async () => {
        const { loads, scrollTo } = await setup();
        await scrollTo(400);
        expect(loads.count).toBe(0);
        await scrollTo(600);
        expect(loads.count).toBe(1);
    });

    it('follows a custom scrollPercent', async () => {
        const { loads, scrollTo } = await setup({ scrollPercent: 30 });
        await scrollTo(50);
        expect(loads.count).toBe(0);
        await scrollTo(150);
        expect(loads.count).toBe(1);
    });

    it('scrollOffset fires within that many pixels of the end instead of a percentage', async () => {
        const { loads, scrollTo } = await setup({ scrollOffset: 20 });
        // past 75 %, but still more than 20px from the end
        await scrollTo(700);
        expect(loads.count).toBe(0);
        await scrollTo(790);
        expect(loads.count).toBe(1);
    });

    it('debounces a burst of scroll events into one call', async () => {
        const { loads, scroller } = await setup();
        for (const top of [600, 650, 700, 750, 800]) {
            scroller.scrollTop = top;
            scroller.dispatchEvent(new Event('scroll'));
        }
        expect(loads.count).toBe(0);
        await wait(100);
        expect(loads.count).toBe(1);
    });

    it('does not call again after more content moved the end away', async () => {
        const { loads, scrollTo, update } = await setup();
        await scrollTo(600);
        expect(loads.count).toBe(1);

        await update({ count: 40 });
        // 800px of 2000px is only 40 %
        await scrollTo(600);
        expect(loads.count).toBe(1);
        await scrollTo(1600);
        expect(loads.count).toBe(2);
    });

    it('listens to its own scroll container only', async () => {
        const outer = document.createElement('div');
        outer.style.cssText = 'height: 100px; overflow: auto';
        document.body.appendChild(outer);
        const loads = { count: 0 };
        await render(<Host onScrollAction={() => loads.count++} />, { container: outer });
        outer.scrollTop = 1000;
        outer.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('scroll'));
        await wait(100);
        expect(loads.count).toBe(0);
        outer.remove();
    });

    it('stops listening when unmounted, also with a check still pending', async () => {
        const { screen, loads, scroller } = await setup();
        scroller.scrollTop = 800;
        scroller.dispatchEvent(new Event('scroll'));
        await screen.unmount();
        scroller.dispatchEvent(new Event('scroll'));
        await wait(100);
        expect(loads.count).toBe(0);
    });

    it('takes option and callback changes without remounting', async () => {
        const { scroller, scrollTo, update } = await setup();
        const calls: string[] = [];
        await update({ scrollOffset: 20, onScrollAction: () => calls.push('second') });
        await scrollTo(700);
        expect(calls).toEqual([]);
        await scrollTo(790);
        expect(calls).toEqual(['second']);
        expect(document.querySelector('[data-testid="scroller"]')).toBe(scroller);
    });

    it('shouldTriggerAction tells whether the position is far enough', async () => {
        const { scroller } = await setup();
        scroller.scrollTop = 600;
        expect(shouldTriggerAction(scroller)).toBe(true);
        expect(shouldTriggerAction(scroller, { scrollPercent: 90 })).toBe(false);
        expect(shouldTriggerAction(scroller, { scrollOffset: 20 })).toBe(false);
        // an offset of 0 falls back to the percentage, as in Angular
        expect(shouldTriggerAction(scroller, { scrollOffset: 0 })).toBe(true);
    });

    it('passes native props, className and the ref to a div, and render renders another element', async () => {
        const ref = createRef<HTMLDivElement>();
        const { scroller, update, loads, scrollTo } = await setup({ ref, id: 'feed', className: 'scrollbar-sap' });
        expect(scroller.tagName).toBe('DIV');
        expect(scroller.id).toBe('feed');
        expect(scroller.className).toBe('scrollbar-sap');
        expect(ref.current).toBe(scroller);
        await update({ render: <section /> });
        const section = document.querySelector<HTMLElement>('[data-testid="scroller"]')!;
        expect(section.tagName).toBe('SECTION');
        await scrollTo(0);
        section.scrollTop = 600;
        section.dispatchEvent(new Event('scroll'));
        await wait(100);
        expect(loads.count).toBe(1);
    });
});

describe('useInfiniteScroll', () => {
    it('loads more on an element of your own', async () => {
        let loads = 0;
        function Feed() {
            const ref = useInfiniteScroll<HTMLUListElement>({ scrollOffset: 40, onScrollAction: () => loads++ });
            return (
                <ul ref={ref} data-testid="feed" style={{ height: 100, overflow: 'auto', margin: 0, padding: 0 }}>
                    {Array.from({ length: 10 }, (_, i) => (
                        <li key={i} style={{ height: 30 }}>
                            Item {i}
                        </li>
                    ))}
                </ul>
            );
        }
        await render(<Feed />);
        const feed = document.querySelector<HTMLElement>('[data-testid="feed"]')!;
        feed.scrollTop = 150;
        feed.dispatchEvent(new Event('scroll'));
        await wait(100);
        expect(loads).toBe(0);
        feed.scrollTop = 200;
        feed.dispatchEvent(new Event('scroll'));
        await wait(100);
        expect(loads).toBe(1);
    });
});
