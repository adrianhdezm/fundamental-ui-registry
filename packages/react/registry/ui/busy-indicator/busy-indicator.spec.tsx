import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { BusyIndicator, BusyIndicatorExtended, type BusyIndicatorProps } from './busy-indicator';

interface HostProps {
    block?: Partial<BusyIndicatorProps>;
    standalone?: Partial<BusyIndicatorProps>;
    loading?: boolean;
    onInside?: () => void;
}

function Host({ block, standalone, loading = true, onInside }: HostProps) {
    return (
        <div>
            <button id="before">Before</button>
            <div id="scroller" style={{ height: 200, overflow: 'auto' }}>
                <BusyIndicator id="block" loading={loading} block aria-label="Loading orders" {...block}>
                    <div style={{ height: 150 }}>
                        <button id="inside" onClick={onInside}>
                            Inside
                        </button>
                    </div>
                </BusyIndicator>
                <div style={{ height: 1000 }} />
            </div>
            <BusyIndicator id="standalone" loading={loading} {...standalone} />
            <BusyIndicatorExtended>
                <BusyIndicator id="extended" loading label="Loading data" />
            </BusyIndicatorExtended>
            <span id="probe" />
        </div>
    );
}

async function setup(initial: HostProps = {}) {
    let current: HostProps = { onInside: vi.fn(), ...initial };
    const screen = await render(<Host {...current} />);
    const root = screen.container;
    const probe = root.querySelector<HTMLElement>('#probe')!;
    const standalone = () => root.querySelector<HTMLElement>('#standalone')!;
    return {
        screen,
        root,
        onInside: current.onInside as ReturnType<typeof vi.fn>,
        block: () => root.querySelector<HTMLElement>('#block')!,
        standalone,
        inside: () => root.querySelector<HTMLButtonElement>('#inside')!,
        dots: (el: HTMLElement = standalone()) => [...el.querySelectorAll<HTMLElement>('[data-busy-dots] > div')],
        resolve: (variable: string) => {
            probe.style.color = `var(${variable})`;
            return getComputedStyle(probe).color;
        },
        update: async (change: HostProps) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
        }
    };
}

describe('BusyIndicator', () => {
    afterEach(async () => {
        document.documentElement.removeAttribute('data-sap-theme');
        await cdp().send('Emulation.setEmulatedMedia', { features: [] });
    });

    it('loading shows the dots with role progressbar, aria-busy and the label; idle renders no ARIA attributes', async () => {
        const { standalone, dots, update } = await setup();
        expect(standalone().getAttribute('role')).toBe('progressbar');
        expect(standalone().getAttribute('aria-busy')).toBe('true');
        // named "Loading" by default, as fundamental-react
        expect(standalone().getAttribute('aria-label')).toBe('Loading');
        expect(standalone().getAttribute('aria-valuetext')).toBe('Busy');
        expect(standalone().getAttribute('aria-valuemin')).toBe('0');
        expect(standalone().getAttribute('aria-valuemax')).toBe('100');
        expect(standalone().getAttribute('title')).toBe('Please wait');
        expect(standalone().getAttribute('tabindex')).toBe('0');
        expect(dots()).toHaveLength(3);
        for (const dot of dots()) expect(dot.getBoundingClientRect().width).toBeGreaterThan(0);

        await update({ standalone: { title: 'Saving', 'aria-label': 'Saving order' } });
        expect(standalone().getAttribute('title')).toBe('Saving');
        expect(standalone().getAttribute('aria-label')).toBe('Saving order');

        // aria-labelledby replaces the default name
        await update({ standalone: { 'aria-labelledby': 'probe' } });
        expect(standalone().hasAttribute('aria-label')).toBe(false);
        expect(standalone().getAttribute('aria-labelledby')).toBe('probe');

        await update({ loading: false });
        expect(dots()).toHaveLength(0);
        expect(standalone().getAttribute('role')).toBe('presentation');
        for (const name of [
            'aria-busy',
            'aria-label',
            'aria-labelledby',
            'aria-valuetext',
            'aria-valuemin',
            'aria-valuemax',
            'aria-live',
            'title'
        ])
            expect(standalone().hasAttribute(name)).toBe(false);
        expect(standalone().getAttribute('tabindex')).toBe('-1');
    });

    it('shows the label under the dots', async () => {
        const { root, block, update } = await setup();
        const extended = root.querySelector<HTMLElement>('#extended')!;
        const label = [...extended.querySelectorAll('span')].find((s) => s.textContent === 'Loading data')!;
        const dots = extended.querySelector('[data-busy-dots]')!.getBoundingClientRect();
        expect(label.getBoundingClientRect().top).toBeGreaterThanOrEqual(dots.bottom);

        // over wrapped content the label sits below the centred dots
        await update({ block: { label: 'Loading orders' } });
        const blockLabel = [...block().querySelectorAll('span')].find((s) => s.textContent === 'Loading orders')!;
        const blockDots = block().querySelector('[data-busy-dots]')!.getBoundingClientRect();
        const rect = blockLabel.getBoundingClientRect();
        expect(rect.top).toBeGreaterThanOrEqual(blockDots.bottom - 1);
        expect(Math.abs(rect.left + rect.width / 2 - (blockDots.left + blockDots.width / 2))).toBeLessThanOrEqual(1);
    });

    it('block mode overlays the content and makes it inert while loading', async () => {
        const { root, block, inside, dots, onInside, update } = await setup();
        expect(getComputedStyle(block()).display).toBe('block');
        expect(inside().closest('[inert]')).not.toBeNull();

        // the dots are centred over the content
        const rect = block().getBoundingClientRect();
        const box = block().querySelector('[data-busy-dots]')!.getBoundingClientRect();
        expect(Math.abs(box.left + box.width / 2 - (rect.left + rect.width / 2))).toBeLessThanOrEqual(1);
        expect(Math.abs(box.top + box.height / 2 - (rect.top + rect.height / 2))).toBeLessThanOrEqual(1);
        expect(dots(block())).toHaveLength(3);

        // the overlay covers the content and takes the clicks
        const button = inside().getBoundingClientRect();
        const hit = document.elementFromPoint(button.left + 2, button.top + 2)!;
        expect(inside().contains(hit)).toBe(false);
        expect(block().contains(hit)).toBe(true);
        // keyboard: the indicator takes the focus, the content is skipped
        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(block());
        await userEvent.tab();
        expect(document.activeElement).not.toBe(inside());
        inside().focus();
        expect(document.activeElement).not.toBe(inside());

        await update({ loading: false });
        expect(inside().closest('[inert]')).toBeNull();
        await userEvent.click(inside());
        expect(onInside).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(inside());
    });

    it('size s, m, l and the contrast variant', async () => {
        const { standalone, dots, resolve, update } = await setup();
        const sizes: [BusyIndicatorProps['size'], number][] = [
            ['s', 8],
            ['m', 16],
            ['l', 32]
        ];
        for (const [size, px] of sizes) {
            await update({ standalone: { size } });
            expect(dots().map((d) => d.offsetWidth)).toEqual([px, px, px]);
            expect(getComputedStyle(dots()[0]).borderRadius).not.toBe('0px');
        }
        expect(dots()[2].getBoundingClientRect().left).toBeGreaterThan(dots()[0].getBoundingClientRect().right);
        // fundamental-styles' dot colour: the brand blue in Horizon and Horizon Dark, the busy colour in HC
        expect(getComputedStyle(dots()[0]).backgroundColor).toBe(resolve('--fdBusy_Indicator_Dot_Color'));
        expect(getComputedStyle(dots()[0]).backgroundColor).toBe('rgb(0, 112, 242)');
        document.documentElement.setAttribute('data-sap-theme', 'sap_horizon_hcw');
        expect(getComputedStyle(dots()[0]).backgroundColor).toBe(resolve('--sapContent_BusyColor'));
        document.documentElement.removeAttribute('data-sap-theme');

        await update({ standalone: { size: 'l', contrast: true } });
        expect(getComputedStyle(dots()[0]).backgroundColor).toBe(resolve('--sapContent_ContrastIconColor'));
        // high contrast themes keep the busy colour
        document.documentElement.setAttribute('data-sap-theme', 'sap_horizon_hcb');
        expect(getComputedStyle(dots()[0]).backgroundColor).toBe(resolve('--sapContent_BusyColor'));
        expect(standalone().getBoundingClientRect().width).toBeGreaterThan(0);
    });

    it('respects prefers-reduced-motion', async () => {
        const { dots } = await setup();
        const animations = () => dots().map((d) => getComputedStyle(d).animationName);
        expect(animations().every((name) => name !== 'none')).toBe(true);
        expect(dots().map((d) => getComputedStyle(d).animationDelay)).toEqual(['0s', '0.2s', '0.4s']);

        await cdp().send('Emulation.setEmulatedMedia', {
            features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
        });
        expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
        expect(animations()).toEqual(['none', 'none', 'none']);
        // the dots stay visible
        for (const dot of dots()) expect(getComputedStyle(dot).opacity).toBe('1');
    });

    it('aria-live announces the label; preventWheelEvents blocks scrolling of the covered content', async () => {
        const { root, block, update } = await setup();
        expect(block().hasAttribute('aria-live')).toBe(false);
        await update({ block: { 'aria-live': 'polite' } });
        expect(block().getAttribute('aria-live')).toBe('polite');
        expect(block().getAttribute('aria-label')).toBe('Loading orders');

        const scroller = root.querySelector<HTMLElement>('#scroller')!;
        const wheel = async () => {
            scroller.scrollTop = 0;
            await userEvent.wheel(block(), { delta: { y: 100 } });
            await new Promise((resolve) => setTimeout(resolve, 100));
            return scroller.scrollTop;
        };
        expect(await wheel()).toBeGreaterThan(0);

        await update({ block: { 'aria-live': 'polite', preventWheelEvents: true } });
        expect(await wheel()).toBe(0);
        const event = new WheelEvent('wheel', { deltaY: 100, cancelable: true, bubbles: true });
        block().dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);

        // only while loading
        await update({ loading: false });
        expect(block().hasAttribute('aria-live')).toBe(false);
        expect(await wheel()).toBeGreaterThan(0);
    });

    it('is inline-block by default and uses a custom aria-valuetext while loading', async () => {
        const { standalone, update } = await setup();
        expect(getComputedStyle(standalone()).display).toBe('inline-block');
        await update({ standalone: { 'aria-valuetext': 'Fetching orders' } });
        expect(standalone().getAttribute('aria-valuetext')).toBe('Fetching orders');
        await update({ loading: false });
        expect(standalone().hasAttribute('aria-valuetext')).toBe(false);
    });

    it('sets aria-live assertive and off', async () => {
        const { block, update } = await setup();
        await update({ block: { 'aria-live': 'assertive' } });
        expect(block().getAttribute('aria-live')).toBe('assertive');
        await update({ block: { 'aria-live': 'off' } });
        expect(block().getAttribute('aria-live')).toBe('off');
    });

    it('stops blocking wheel events when preventWheelEvents turns off and removes the listener on unmount', async () => {
        const { screen, block, update } = await setup();
        const element = block();
        const wheel = () => {
            const event = new WheelEvent('wheel', { deltaY: 100, cancelable: true, bubbles: true });
            element.dispatchEvent(event);
            return event.defaultPrevented;
        };
        await update({ block: { preventWheelEvents: true } });
        expect(wheel()).toBe(true);
        await update({ block: { preventWheelEvents: false } });
        expect(wheel()).toBe(false);

        await update({ block: { preventWheelEvents: true } });
        expect(wheel()).toBe(true);
        const removed = vi.spyOn(element, 'removeEventListener');
        await screen.unmount();
        expect(removed).toHaveBeenCalledWith('wheel', expect.any(Function));
        expect(wheel()).toBe(false);
    });

    it('passes className, native props and the ref through', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(<BusyIndicator ref={ref} loading className="m-2" data-testid="spread" />);
        const el = screen.container.querySelector<HTMLElement>('[data-testid="spread"]')!;
        expect(ref.current).toBe(el);
        expect(el.classList.contains('m-2')).toBe(true);
    });
});
