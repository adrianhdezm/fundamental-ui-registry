import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { Counter, type CounterProps } from './counter';

function Host(p: CounterProps & { dir?: 'ltr' | 'rtl' }) {
    const { dir = 'ltr', ...props } = p;
    return (
        <div dir={dir}>
            <div id="wrapper" style={{ position: 'relative', padding: 40 }}>
                <Counter id="counter" {...props}>
                    25
                </Counter>
            </div>
            <span id="probe" />
        </div>
    );
}

async function setup(initial: CounterProps & { dir?: 'ltr' | 'rtl' } = {}) {
    let current = initial;
    const screen = await render(<Host {...current} />);
    const root = screen.container;
    const counter = () => root.querySelector<HTMLElement>('#counter')!;
    const probe = root.querySelector<HTMLElement>('#probe')!;
    return {
        counter,
        wrapper: () => root.querySelector<HTMLElement>('#wrapper')!,
        hidden: () => [...counter().querySelectorAll('.sr-only-sap')].map((el) => el.textContent),
        resolve: (property: 'color' | 'backgroundColor' | 'fontSize', variable: string) => {
            probe.style[property] = `var(${variable})`;
            return getComputedStyle(probe)[property];
        },
        update: async (change: CounterProps & { dir?: 'ltr' | 'rtl' }) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
        }
    };
}

describe('Counter', () => {
    it('renders a badge in the SAP badge colours, 1rem high and fully rounded', async () => {
        const { counter, resolve } = await setup();
        const style = getComputedStyle(counter());
        expect(counter().tagName).toBe('SPAN');
        expect(style.display).toBe('inline-block');
        expect(style.height).toBe('16px');
        expect(style.borderTopLeftRadius).toBe('8px');
        expect(style.paddingLeft).toBe('5px');
        expect(style.paddingRight).toBe('5px');
        expect(style.borderTopWidth).toBe('1px');
        expect(style.borderTopStyle).toBe('solid');
        expect(style.lineHeight).toBe('14px');
        expect(style.fontWeight).toBe('400');
        expect(style.fontSize).toBe(resolve('fontSize', '--sapFontSmallSize'));
        expect(style.fontFamily.startsWith('"72"')).toBe(true);
        expect(style.textAlign).toBe('center');
        expect(style.color).toBe(resolve('color', '--sapContent_BadgeTextColor'));
        expect(style.backgroundColor).toBe(resolve('backgroundColor', '--sapContent_BadgeBackground'));
        expect(counter().textContent).toBe('Unread count 25');
    });

    it('announces counterLabel before the count; an empty label adds no hidden text', async () => {
        const { counter, hidden, update } = await setup();
        expect(hidden()).toEqual(['Unread count ']);
        // the hidden text takes no space: the badge is as wide as a counter without it
        await update({ counterLabel: '' });
        expect(hidden()).toEqual([]);
        const width = counter().getBoundingClientRect().width;
        await update({ counterLabel: 'Ungelesen' });
        expect(hidden()).toEqual(['Ungelesen ']);
        expect(counter().getBoundingClientRect().width).toBe(width);
        expect(counter().hasAttribute('aria-label')).toBe(false);
    });

    it('notification moves the counter up by half its height and towards the start by 40% of its width', async () => {
        const { counter, wrapper, update } = await setup();
        // the rendered position against the layout position (offsets ignore transforms; they are whole pixels)
        const offset = () => {
            const box = counter().getBoundingClientRect();
            const host = wrapper().getBoundingClientRect();
            return {
                dx: box.left - host.left - counter().offsetLeft,
                dy: box.top - host.top - counter().offsetTop,
                width: box.width,
                height: box.height
            };
        };
        expect(offset().dx).toBeCloseTo(0, 0);
        expect(offset().dy).toBeCloseTo(0, 0);

        await update({ notification: true });
        const moved = offset();
        expect(moved.dx).toBeCloseTo(-0.4 * moved.width, 0);
        expect(moved.dy).toBeCloseTo(-0.5 * moved.height, 0);

        await update({ dir: 'rtl' });
        const rtl = offset();
        expect(rtl.dx).toBeCloseTo(0.4 * rtl.width, 0);
        expect(rtl.dy).toBeCloseTo(-0.5 * rtl.height, 0);
    });

    it('passes className, native props and the ref through; render swaps the element', async () => {
        const ref = createRef<HTMLSpanElement>();
        const screen = await render(
            <div>
                <Counter ref={ref} className="ms-2" data-sample="Sample" title="Hint">
                    5
                </Counter>
                <Counter render={<strong />} id="as-strong">
                    7
                </Counter>
            </div>
        );
        const counter = screen.container.querySelector<HTMLElement>('[data-sample]')!;
        expect(ref.current).toBe(counter);
        expect(counter.tagName).toBe('SPAN');
        expect(counter.dataset['sample']).toBe('Sample');
        expect(counter.title).toBe('Hint');
        expect(counter.classList.contains('ms-2')).toBe(true);
        expect(counter.classList.contains('rounded-lg')).toBe(true);
        expect(screen.container.querySelector('#as-strong')!.tagName).toBe('STRONG');
    });
});
