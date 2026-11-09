import { createRef, type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    OverflowItem,
    OverflowLayout,
    useOverflowItem,
    type OverflowItemRef,
    type OverflowLayoutActions,
    type OverflowLayoutProps
} from './overflow-layout';

interface HostProps {
    width?: number;
    itemWidth?: number;
    items?: string[];
    max?: number;
    position?: 'left' | 'right';
    reverse?: boolean;
    forced?: string | null;
    keyboard?: boolean;
    showMoreButton?: boolean;
    onForce?: (item: string) => void;
}

/** Mirrors the Angular test host: five 100px buttons in a 450px wide layout. */
function createHost() {
    const log = {
        visible: null as number | null,
        hidden: null as number | null,
        hiddenLabels: [] as string[],
        moves: [] as string[]
    };
    const actions = createRef<OverflowLayoutActions>();
    function Host({
        width = 450,
        itemWidth = 100,
        items = ['A', 'B', 'C', 'D', 'E'],
        max = Number.POSITIVE_INFINITY,
        position = 'right',
        reverse = false,
        forced = null,
        keyboard = true,
        showMoreButton = true,
        onForce
    }: HostProps) {
        return (
            <div style={{ width }}>
                <OverflowLayout<string>
                    ariaRole="list"
                    ariaLabel="Tags"
                    maxVisibleItems={max}
                    showMorePosition={position}
                    reverseHiddenItems={reverse}
                    enableKeyboardNavigation={keyboard}
                    showMoreButton={showMoreButton}
                    actionsRef={actions}
                    onVisibleItemsCountChange={(count) => (log.visible = count)}
                    onHiddenItemsCountChange={(count) => (log.hidden = count)}
                    onHiddenItemsChange={(refs) => (log.hiddenLabels = refs.map((ref) => ref.item))}
                >
                    {items.map((item) => (
                        <OverflowItem
                            key={item}
                            item={item}
                            forceVisibility={forced === item}
                            onHiddenChange={(hidden) => log.moves.push(`${item}:${hidden}`)}
                        >
                            {({ hidden, globalIndex }) => (
                                <button
                                    data-hidden={hidden}
                                    data-index={globalIndex}
                                    style={{ width: itemWidth, flex: 'none' }}
                                    onClick={() => hidden && onForce?.(item)}
                                >
                                    {item}
                                </button>
                            )}
                        </OverflowItem>
                    ))}
                </OverflowLayout>
            </div>
        );
    }
    return { Host, log, actions };
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const stable = async () => {
    await frame();
    await frame();
    await frame();
};

async function setup(initial: HostProps = {}) {
    const { Host, log, actions } = createHost();
    let current = initial;
    const screen = await render(<Host {...current} />);
    await stable();
    const root = screen.container;
    const row = () => root.querySelector<HTMLElement>('[role="list"]')!;
    return {
        log,
        actions,
        root,
        row,
        update: async (change: Partial<HostProps>) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
            await stable();
        },
        visibleLabels: () =>
            [...row().querySelectorAll<HTMLElement>(':scope > [data-overflow-item] button')].map((b) =>
                b.textContent!.trim()
            ),
        visibleButtons: () => [...row().querySelectorAll<HTMLButtonElement>(':scope > [data-overflow-item] button')],
        moreButton: () =>
            [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.trim().endsWith('more')),
        popover: () => document.querySelector<HTMLElement>('[role=dialog]'),
        popoverLabels: () =>
            [...document.querySelectorAll<HTMLElement>('[role=dialog] [data-hidden]')].map((b) => b.textContent!.trim())
    };
}

describe('OverflowLayout', () => {
    afterEach(() => document.documentElement.removeAttribute('dir'));

    it('shows as many items as fit in the row (and at most maxVisibleItems); the rest go into the "N more" popover', async () => {
        const { update, row, visibleLabels, moreButton, popover, popoverLabels } = await setup();
        expect(row().getAttribute('aria-label')).toBe('Tags');
        expect(row().querySelector('[data-overflow-item]')!.getAttribute('role')).toBe('listitem');
        expect(visibleLabels()).toEqual(['A', 'B', 'C']);
        expect(moreButton()!.textContent!.trim()).toBe('2 more');
        // the items and the more button fit into the layout
        const layout = row().parentElement!.getBoundingClientRect();
        expect(moreButton()!.getBoundingClientRect().right).toBeLessThanOrEqual(layout.right);
        // the more button is a menu button that opens a dialog
        expect(moreButton()!.getAttribute('aria-haspopup')).toBe('dialog');

        await userEvent.click(moreButton()!);
        await stable();
        expect(popoverLabels()).toEqual(['D', 'E']);
        // the popover dialog is named like the button that opens it, and lists the items with the row's role
        expect(popover()!.getAttribute('aria-label')).toBe('2 more');
        expect(popover()!.querySelector('[role=list] > [role=listitem] [data-hidden]')).not.toBeNull();
        const popoverItems = [...popover()!.querySelectorAll<HTMLElement>('[data-hidden]')];
        // the item knows it renders in the popover and its index among all items
        expect(popoverItems.map((b) => b.dataset['hidden'])).toEqual(['true', 'true']);
        expect(popoverItems.map((b) => b.dataset['index'])).toEqual(['3', '4']);
        expect(row().querySelector('button')!.dataset['hidden']).toBe('false');

        await update({ max: 2 });
        expect(visibleLabels()).toEqual(['A', 'B']);
        expect(moreButton()!.textContent!.trim()).toBe('3 more');

        await update({ max: Number.POSITIVE_INFINITY, width: 1000 });
        expect(visibleLabels()).toEqual(['A', 'B', 'C', 'D', 'E']);
        expect(moreButton()).toBeUndefined();
    });

    it('forceVisibility keeps an item visible; onHiddenChange is called on moves', async () => {
        const { log, update, visibleLabels } = await setup();
        // the first layout moved the items that do not fit
        expect(log.moves).toEqual(['D:true', 'E:true']);
        log.moves.length = 0;
        await update({ forced: 'E' });
        expect(visibleLabels()).toEqual(['A', 'B', 'E']);
        expect([...log.moves].sort()).toEqual(['C:true', 'E:false']);
        await update({ forced: null });
        expect(visibleLabels()).toEqual(['A', 'B', 'C']);
        expect([...log.moves].sort()).toEqual(['C:false', 'C:true', 'E:false', 'E:true']);
        // a forced item stays visible when the layout gets narrower
        await update({ forced: 'A' });
        await update({ width: 200 });
        expect(visibleLabels()).toEqual(['A']);
    });

    it('showMorePosition left overflows from the start; reverseHiddenItems reverses the popover order', async () => {
        const { root, update, visibleLabels, moreButton, popoverLabels } = await setup({ position: 'left' });
        expect(visibleLabels()).toEqual(['C', 'D', 'E']);
        const layout = root.firstElementChild!.firstElementChild!;
        expect(layout.firstElementChild!.contains(moreButton()!)).toBe(true);
        expect(moreButton()!.getBoundingClientRect().right).toBeLessThanOrEqual(
            root.querySelector('[role="list"]')!.getBoundingClientRect().left
        );
        await userEvent.click(moreButton()!);
        await stable();
        expect(popoverLabels()).toEqual(['A', 'B']);
        await update({ reverse: true });
        expect(popoverLabels()).toEqual(['B', 'A']);
    });

    it('renderMore (custom "more" control) receives the hidden items', async () => {
        const screen = await render(
            <div style={{ width: 350 }}>
                <OverflowLayout<string>
                    renderMore={(hidden: OverflowItemRef<string>[]) => (
                        <button id="custom">{hidden.map((ref) => ref.item).join(',')}</button>
                    )}
                >
                    {['A', 'B', 'C', 'D', 'E'].map((item) => (
                        <OverflowItem key={item} item={item}>
                            <span style={{ display: 'inline-block', width: 100, flex: 'none' }}>{item}</span>
                        </OverflowItem>
                    ))}
                </OverflowLayout>
            </div>
        );
        await stable();
        expect(screen.container.querySelector('#custom')!.textContent).toBe('D,E');
        expect(screen.container.querySelector('[aria-haspopup]')).toBeNull();
    });

    it('onVisibleItemsCountChange / onHiddenItemsCountChange / onHiddenItemsChange report resizes and item changes', async () => {
        const { log, update } = await setup();
        expect([log.visible, log.hidden]).toEqual([3, 2]);
        expect(log.hiddenLabels).toEqual(['D', 'E']);
        await update({ width: 300 });
        expect([log.visible, log.hidden]).toEqual([2, 3]);
        expect(log.hiddenLabels).toEqual(['C', 'D', 'E']);
        await update({ items: ['A', 'B'] });
        expect([log.visible, log.hidden]).toEqual([2, 0]);
        expect(log.hiddenLabels).toEqual([]);
        await update({ items: ['A', 'B', 'C', 'D', 'E', 'F'] });
        expect([log.visible, log.hidden]).toEqual([2, 4]);
        expect(log.hiddenLabels).toEqual(['C', 'D', 'E', 'F']);
    });

    it('arrow keys move focus between visible focusable items (RTL aware)', async () => {
        const { visibleButtons } = await setup();
        const [a, b, c] = visibleButtons();
        a!.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(b);
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(c);
        // the last visible item does not move to the more button
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(c);
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(b);

        document.documentElement.setAttribute('dir', 'rtl');
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(a);
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(b);
    });

    it('enableKeyboardNavigation false leaves the arrow keys to the items', async () => {
        const { visibleButtons } = await setup({ keyboard: false });
        const [a] = visibleButtons();
        a!.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(a);
    });

    it('triggerRecalculation re-measures after content changes', async () => {
        const { actions, update, visibleLabels } = await setup({ width: 1000 });
        expect(visibleLabels()).toEqual(['A', 'B', 'C', 'D', 'E']);
        await update({ itemWidth: 300 });
        actions.current!.triggerRecalculation();
        await stable();
        expect(visibleLabels()).toEqual(['A', 'B', 'C']);
        await update({ itemWidth: 100 });
        actions.current!.triggerRecalculation();
        await stable();
        expect(visibleLabels()).toEqual(['A', 'B', 'C', 'D', 'E']);
    });

    it('re-measures by itself when the items change width, without triggerRecalculation', async () => {
        const { update, visibleLabels } = await setup({ width: 1000 });
        expect(visibleLabels()).toEqual(['A', 'B', 'C', 'D', 'E']);
        await update({ itemWidth: 300 });
        await stable();
        expect(visibleLabels()).toEqual(['A', 'B', 'C']);
        await update({ itemWidth: 100 });
        await stable();
        expect(visibleLabels()).toEqual(['A', 'B', 'C', 'D', 'E']);
    });

    it('moves a hidden item out of the popover when a click forces its visibility', async () => {
        let forced: string | null = null;
        const ctx: { update?: (change: Partial<HostProps>) => Promise<void> } = {};
        const onForce = (item: string) => {
            forced = item;
            void ctx.update!({ forced: item });
        };
        const { update, visibleLabels, moreButton, popoverLabels } = await setup({ onForce });
        ctx.update = update;
        await userEvent.click(moreButton()!);
        await stable();
        expect(popoverLabels()).toEqual(['D', 'E']);
        await userEvent.click(
            [...document.querySelectorAll<HTMLElement>('[role=dialog] [data-hidden]')].find(
                (b) => b.textContent!.trim() === 'E'
            )!
        );
        await stable();
        await stable();
        expect(forced).toBe('E');
        expect(visibleLabels()).toEqual(['A', 'B', 'E']);
        expect(popoverLabels()).toEqual(['C', 'D']);
    });

    it('showMoreButton false hides the overflowing items without a "more" control', async () => {
        const { log, visibleLabels, moreButton } = await setup({ showMoreButton: false });
        expect(moreButton()).toBeUndefined();
        expect(log.hidden).toBeGreaterThan(0);
        expect(visibleLabels().length + log.hidden!).toBe(5);
    });

    it('plain children are items; useOverflowItem gives nested components the item context', async () => {
        function Probe({ children }: { children: ReactNode }) {
            const context = useOverflowItem();
            return (
                <span data-probe={`${context?.hidden}:${context?.index}:${context?.first}:${context?.last}`}>
                    {children}
                </span>
            );
        }
        const screen = await render(
            <OverflowLayout>
                <Probe key="one">One</Probe>
                <Probe key="two">Two</Probe>
            </OverflowLayout>
        );
        await stable();
        const probes = [...screen.container.querySelectorAll<HTMLElement>('[data-probe]')];
        expect(probes.map((el) => el.dataset['probe'])).toEqual(['false:0:true:false', 'false:1:false:true']);
    });

    it('passes className, native props and the ref to the root (registry convention)', async () => {
        const ref = createRef<HTMLDivElement>();
        const props: OverflowLayoutProps = { className: 'mt-2', id: 'layout' };
        const screen = await render(
            <OverflowLayout ref={ref} {...props} data-sample="Sample">
                <span key="a">A</span>
            </OverflowLayout>
        );
        const root = screen.container.querySelector<HTMLElement>('#layout')!;
        expect(ref.current).toBe(root);
        expect(root.dataset['sample']).toBe('Sample');
        expect(root.classList.contains('mt-2')).toBe(true);
        expect(root.classList.contains('flex')).toBe(true);
    });
});
