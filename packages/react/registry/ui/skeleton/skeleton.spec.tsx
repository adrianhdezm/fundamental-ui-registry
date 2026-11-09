import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cdp } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Skeleton, type SkeletonProps } from './skeleton';

function Host({ main }: { main?: Partial<SkeletonProps> }) {
    return (
        <div>
            <Skeleton id="main" type="rectangle" width="100px" height="50px" textLines={3} animated {...main} />
            <Skeleton id="second" type="rectangle" width="40px" height="20px" />
            <Skeleton id="custom" width="160px" height="50px">
                <circle cx="25" cy="25" r="25" />
                <rect x="60" y="0" width="100" height="16" rx="4" />
            </Skeleton>
            <div style={{ width: 300 }}>
                <Skeleton id="bare" />
                <Skeleton id="text-default" type="text" />
                <Skeleton id="text-two" type="text" textLines={2} />
            </div>
        </div>
    );
}

async function setup(main: Partial<SkeletonProps> = {}) {
    let current = main;
    const screen = await render(<Host main={current} />);
    const root = screen.container;
    const parts = (id: string) => {
        const el = root.querySelector<HTMLElement>(`#${id}`)!;
        return {
            el,
            svg: el.querySelector('svg')!,
            mask: el.querySelector('mask')!,
            gradient: el.querySelector('linearGradient')!,
            fillRect: el.querySelector<SVGRectElement>('svg > rect')!
        };
    };
    return {
        screen,
        root,
        parts,
        update: async (change: Partial<SkeletonProps>) => {
            current = { ...current, ...change };
            await screen.rerender(<Host main={current} />);
        }
    };
}

const size = (el: Element) => {
    const { width, height } = el.getBoundingClientRect();
    return [width, height];
};

describe('Skeleton', () => {
    afterEach(async () => {
        await cdp().send('Emulation.setEmulatedMedia', { features: [] });
    });

    it('rectangle fills the given size with a rounded rectangle', async () => {
        const { parts } = await setup();
        const { el, svg, mask } = parts('main');
        expect(size(el)).toEqual([100, 50]);
        expect(svg.getAttribute('aria-hidden')).toBe('true');
        const shapes = [...mask.children];
        expect(shapes).toHaveLength(1);
        expect(shapes[0].tagName).toBe('rect');
        expect(shapes[0].getAttribute('width')).toBe('100%');
        expect(shapes[0].getAttribute('height')).toBe('100%');
        expect(shapes[0].getAttribute('rx')).toBe('4');
        expect(getComputedStyle(el).cursor).toBe('wait');
        expect(getComputedStyle(el).display).toBe('inline-block');
    });

    it('circle is square when only width or height is given', async () => {
        const { parts, update } = await setup({ type: 'circle', height: null, width: '40px' });
        const { el, mask } = parts('main');
        expect(size(el)).toEqual([40, 40]);
        expect(mask.querySelector('circle')!.getAttribute('r')).toBe('50%');
        await update({ width: null, height: '30px' });
        expect(size(el)).toEqual([30, 30]);
        // a number is in px
        await update({ width: undefined, height: 24 });
        expect(size(el)).toEqual([24, 24]);
    });

    it('text draws textLines lines, the last of several at 60% width', async () => {
        const { parts, update } = await setup({ type: 'text', height: null, width: '200px' });
        const { el, mask } = parts('main');
        const lines = () => [...mask.querySelectorAll('rect')];
        expect(lines().map((l) => [l.getAttribute('y'), l.getAttribute('width')])).toEqual([
            ['0', '100%'],
            ['20', '100%'],
            ['40', '60%']
        ]);
        expect(size(el)).toEqual([200, 60]);
        await update({ textLines: 2 });
        expect(lines().map((l) => l.getAttribute('width'))).toEqual(['100%', '60%']);
        expect(size(el)).toEqual([200, 40]);
        await update({ textLines: 1 });
        expect(lines().map((l) => l.getAttribute('width'))).toEqual(['100%']);
        expect(size(el)).toEqual([200, 8]);
    });

    it('text with textLines 0 draws no lines but keeps the one-line height', async () => {
        const { parts } = await setup({ type: 'text', height: null, width: '200px', textLines: 0 });
        const { el, mask } = parts('main');
        expect(mask.querySelectorAll('rect')).toHaveLength(0);
        expect(size(el)).toEqual([200, 8]);
    });

    it('uses no type, 3 text lines and no size by default', async () => {
        const { parts } = await setup();
        const bare = parts('bare');
        expect(bare.mask.children).toHaveLength(0);
        expect(bare.el.style.width).toBe('');
        expect(bare.el.style.height).toBe('');
        const text = parts('text-default');
        expect([...text.mask.querySelectorAll('rect')].map((l) => l.getAttribute('width'))).toEqual([
            '100%',
            '100%',
            '60%'
        ]);
        expect(size(text.el)).toEqual([300, 60]);
    });

    it('text with 2 lines fills its container and is 40px high', async () => {
        // Angular coerces a string textLines attribute here; in React textLines is typed as a number
        const { parts } = await setup();
        const { el, mask } = parts('text-two');
        expect([...mask.querySelectorAll('rect')].map((l) => l.getAttribute('width'))).toEqual(['100%', '60%']);
        expect(size(el)).toEqual([300, 40]);
    });

    it('text without a width fills its container', async () => {
        const { parts, root } = await setup({ type: 'text', width: null, height: null });
        root.style.display = 'block';
        root.style.width = '300px';
        expect(size(parts('main').el)[0]).toBe(300);
    });

    it('custom SVG shapes are drawn into the mask', async () => {
        const { parts } = await setup();
        const { el, mask } = parts('custom');
        expect(size(el)).toEqual([160, 50]);
        const shapes = [...mask.children];
        expect(shapes.map((s) => s.tagName)).toEqual(['circle', 'rect']);
        expect(shapes.every((s) => s instanceof SVGElement)).toBe(true);
        expect(shapes[0].getAttribute('r')).toBe('25');
    });

    it('each instance has unique gradient and mask ids that its fill references', async () => {
        const { parts } = await setup();
        const ids = new Set<string>();
        for (const id of ['main', 'second', 'custom']) {
            const { mask, gradient, fillRect } = parts(id);
            ids.add(mask.id);
            ids.add(gradient.id);
            expect(fillRect.getAttribute('mask')).toBe(`url(#${mask.id})`);
            expect(fillRect.getAttribute('fill')).toBe(`url(#${gradient.id})`);
            expect(document.querySelectorAll(`[id="${mask.id}"]`)).toHaveLength(1);
            // the ids are valid in a url(#…) reference and a selector
            expect(document.querySelector(`#${mask.id}`)).toBe(mask);
        }
        expect(ids.size).toBe(6);
    });

    it('animates with the shimmer gradient by default', async () => {
        const { parts } = await setup();
        const { fillRect, gradient } = parts('main');
        expect(getComputedStyle(fillRect).fill).toContain(`#${gradient.id}`);
        expect(gradient.querySelector('animate')!.getAttribute('repeatCount')).toBe('indefinite');
        const animatedStop = gradient.querySelectorAll('stop')[1];
        expect(getComputedStyle(animatedStop).animationName).not.toBe('none');
    });

    it('animated=false uses a solid fill', async () => {
        const { parts } = await setup({ animated: false });
        const { fillRect } = parts('main');
        expect(fillRect.hasAttribute('fill')).toBe(false);
        expect(getComputedStyle(fillRect).fill).toMatch(/^rgb/);
    });

    it('prefers-reduced-motion uses a solid fill and stops the CSS animation', async () => {
        const { parts } = await setup();
        await cdp().send('Emulation.setEmulatedMedia', {
            features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
        });
        expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
        const { fillRect, gradient } = parts('main');
        expect(getComputedStyle(fillRect).fill).toMatch(/^rgb/);
        expect(getComputedStyle(gradient.querySelectorAll('stop')[1]).animationName).toBe('none');
    });

    it('passes className, style, native props and the ref through', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <Skeleton
                ref={ref}
                type="rectangle"
                width="100px"
                height="20px"
                className="my-2"
                style={{ verticalAlign: 'middle' }}
                data-testid="spread"
            />
        );
        const el = screen.container.querySelector<HTMLElement>('[data-testid="spread"]')!;
        expect(ref.current).toBe(el);
        expect(el.tagName).toBe('DIV');
        expect(el.classList.contains('my-2')).toBe(true);
        expect(el.style.verticalAlign).toBe('middle');
        expect(size(el)).toEqual([100, 20]);
    });
});
