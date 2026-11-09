import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import {
    DynamicSideContent,
    DynamicSideContentMain,
    DynamicSideContentSide,
    type DynamicSideContentPosition,
    type DynamicSideContentSize
} from './dynamic-side-content';

interface State {
    position?: DynamicSideContentPosition;
    size?: DynamicSideContentSize;
    sideFirst?: boolean;
}

function Host({ position, size, sideFirst = false }: State) {
    const main = (
        <DynamicSideContentMain key="main" id="main">
            <div className="h-10">Main</div>
        </DynamicSideContentMain>
    );
    const side = (
        <DynamicSideContentSide key="side" id="side">
            <div className="h-10">Side</div>
        </DynamicSideContentSide>
    );
    return (
        <div style={{ width: 1000 }}>
            <DynamicSideContent data-testid="dsc" position={position} size={size}>
                {sideFirst ? [side, main] : [main, side]}
            </DynamicSideContent>
        </div>
    );
}

async function setup(initial: State = {}) {
    const screen = await render(<Host {...initial} />);
    const root = screen.container;
    const el = (id: 'main' | 'side') => root.querySelector<HTMLElement>(`#${id}`)!;
    return {
        root,
        update: (next: State) => screen.rerender(<Host {...next} />),
        unmount: () => screen.unmount(),
        order: () =>
            [...root.querySelector('[data-testid="dsc"]')!.children].map((child) =>
                child.hasAttribute('data-dsc-main') ? 'main' : 'side'
            ),
        rect: (id: 'main' | 'side') => el(id).getBoundingClientRect(),
        display: (id: 'main' | 'side') => getComputedStyle(el(id)).display
    };
}

describe('DynamicSideContent', () => {
    it('position left/right/bottom renders the side content before/after the main content in the DOM', async () => {
        const left = await setup({ position: 'left' });
        expect(left.order()).toEqual(['side', 'main']);
        expect(left.rect('side').left).toBeLessThan(left.rect('main').left);
        await left.unmount();

        const right = await setup({ position: 'right', sideFirst: true });
        expect(right.order()).toEqual(['main', 'side']);
        expect(right.rect('side').left).toBeGreaterThan(right.rect('main').left);
        await right.unmount();

        const bottom = await setup({ position: 'bottom', sideFirst: true });
        expect(bottom.order()).toEqual(['main', 'side']);
    });

    it('moves the side content when the position changes', async () => {
        const { update, order, root } = await setup({ position: 'right' });
        expect(order()).toEqual(['main', 'side']);
        await update({ position: 'left' });
        expect(order()).toEqual(['side', 'main']);
        expect(root.querySelector('#side')!.textContent).toBe('Side');
        await update({ position: 'right' });
        expect(order()).toEqual(['main', 'side']);
    });

    it('position none/equalSplit keeps the order of the children', async () => {
        for (const position of ['none', 'equalSplit'] as const) {
            const mainFirst = await setup({ position });
            expect(mainFirst.order()).toEqual(['main', 'side']);
            await mainFirst.unmount();
            const sideFirst = await setup({ position, sideFirst: true });
            expect(sideFirst.order()).toEqual(['side', 'main']);
            await sideFirst.unmount();
        }
        // none is the default
        const byDefault = await setup({ sideFirst: true });
        expect(byDefault.order()).toEqual(['side', 'main']);
    });

    it('size sm hides the side content; md/lg give main 66.666%; xl (default) 75%', async () => {
        const { update, rect, display } = await setup({ position: 'right' });
        expect(rect('main').width).toBeCloseTo(750, 0);
        expect(rect('side').width).toBeCloseTo(250, 0);
        for (const size of ['md', 'lg'] as const) {
            await update({ position: 'right', size });
            expect(rect('main').width).toBeCloseTo(666.66, 0);
            expect(rect('side').width).toBeCloseTo(333.34, 0);
        }
        await update({ position: 'right', size: 'sm' });
        expect(display('side')).toBe('none');
        expect(rect('main').width).toBe(1000);
    });

    it('bottom stacks vertically with full widths; equalSplit gives 50% each', async () => {
        const { update, rect, display } = await setup({ position: 'bottom', size: 'md' });
        expect(rect('main').width).toBe(1000);
        expect(rect('side').width).toBe(1000);
        expect(rect('side').top).toBeGreaterThanOrEqual(rect('main').bottom);
        // the side content stays visible below the main content even on small sizes
        await update({ position: 'bottom', size: 'sm' });
        expect(display('side')).toBe('block');
        expect(rect('side').width).toBe(1000);

        await update({ position: 'equalSplit', size: 'xl' });
        expect(rect('main').width).toBe(500);
        expect(rect('side').width).toBe(500);
        expect(rect('side').top).toBe(rect('main').top);
    });

    it('generates ids and keeps given ones', async () => {
        const screen = await render(
            <DynamicSideContent>
                <DynamicSideContentMain>Main</DynamicSideContentMain>
                <DynamicSideContentSide>Side</DynamicSideContentSide>
            </DynamicSideContent>
        );
        const root = screen.container.firstElementChild as HTMLElement;
        expect(root.id).toMatch(/^fd-dynamic-side-content-.+$/);
        expect(root.children[0].id).toMatch(/^fd-dynamic-side-content-main-.+$/);
        expect(root.children[1].id).toMatch(/^fd-dynamic-side-content-side-.+$/);
        const { root: host } = await setup();
        expect(host.querySelector('#main')).not.toBeNull();
    });

    it('passes native props, className and refs to the layout and its parts, and render renders another element', async () => {
        const ref = createRef<HTMLDivElement>();
        const mainRef = createRef<HTMLDivElement>();
        const sideRef = createRef<HTMLDivElement>();
        const screen = await render(
            <DynamicSideContent
                ref={ref}
                position="left"
                className="custom"
                aria-label="Layout"
                data-foo="bar"
                render={<section />}
            >
                <DynamicSideContentMain ref={mainRef} className="main-class" role="main">
                    Main
                </DynamicSideContentMain>
                <DynamicSideContentSide ref={sideRef} className="side-class" render={<aside />}>
                    Side
                </DynamicSideContentSide>
            </DynamicSideContent>
        );
        const root = screen.container.firstElementChild as HTMLElement;
        expect(ref.current).toBe(root);
        expect(root.tagName).toBe('SECTION');
        expect(root.className).toContain('custom');
        expect(root.className).toContain('flex');
        expect(root.getAttribute('aria-label')).toBe('Layout');
        expect(root.dataset['foo']).toBe('bar');
        expect(mainRef.current!.className).toBe('main-class');
        expect(mainRef.current!.getAttribute('role')).toBe('main');
        expect(sideRef.current!.tagName).toBe('ASIDE');
        expect(sideRef.current!.className).toBe('side-class');
        expect(root.firstElementChild).toBe(sideRef.current);
    });

    it('keeps other children in their place', async () => {
        const screen = await render(
            <DynamicSideContent position="left">
                <DynamicSideContentMain>Main</DynamicSideContentMain>
                <span id="other">Other</span>
                <DynamicSideContentSide>Side</DynamicSideContentSide>
            </DynamicSideContent>
        );
        const root = screen.container.firstElementChild as HTMLElement;
        expect([...root.children].map((c) => c.textContent)).toEqual(['Side', 'Other', 'Main']);
    });
});
