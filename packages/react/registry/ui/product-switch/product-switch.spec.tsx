import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { ProductSwitch, ProductSwitchBody, type ProductSwitchItem } from './product-switch';

const products = (count: number): ProductSwitchItem[] =>
    Array.from({ length: count }, (_, i) => ({ title: `Product ${i + 1}`, icon: 'home', callback: () => undefined }));

interface HostProps {
    initial?: ProductSwitchItem[];
    open?: boolean;
    disabled?: boolean;
    custom?: boolean;
    busy?: boolean;
    list?: boolean;
    dnd?: boolean;
    onOpened?: (title: string) => void;
    onOpenChange?: (open: boolean) => void;
    onProducts?: (products: ProductSwitchItem[]) => void;
}

const EIGHT = products(8);

/** Mirrors the Angular test host: the products are state that drops update. */
function Host({
    initial = EIGHT,
    open,
    disabled = false,
    custom = false,
    busy = false,
    list = false,
    dnd = true,
    onOpened,
    onOpenChange,
    onProducts
}: HostProps) {
    const [items, setItems] = useState(initial);
    const [last, setLast] = useState(initial);
    // a new `initial` replaces the products, as the Angular host's signal
    if (last !== initial) {
        setLast(initial);
        setItems(initial);
    }
    return (
        <ProductSwitch
            open={open}
            disabled={disabled}
            onOpenChange={onOpenChange}
            button={
                custom ? (
                    <button type="button" className="custom">
                        Products
                    </button>
                ) : undefined
            }
        >
            <ProductSwitchBody
                products={items}
                onProductsChange={(next) => {
                    setItems(next);
                    onProducts?.(next);
                }}
                busy={busy}
                forceListMode={list}
                dragAndDropEnabled={dnd}
                onItemClick={(item) => onOpened?.(item.title)}
            />
        </ProductSwitch>
    );
}

const wait = (ms = 100) => new Promise((r) => setTimeout(r, ms));
const frame = () => new Promise(requestAnimationFrame);
const focused = () => document.activeElement!.getAttribute('aria-label');
const items = () => Array.from(document.querySelectorAll<HTMLElement>('[role=menu] [role=menuitem]'));
const titles = () => items().map((item) => item.getAttribute('aria-label'));

async function setup(props: HostProps = {}) {
    const screen = await render(<Host {...props} />);
    const button = screen.container.querySelector<HTMLElement>('button')!;
    return { screen, button };
}

async function open(props: HostProps = {}) {
    const rendered = await setup(props);
    await userEvent.click(rendered.button);
    await wait();
    return rendered;
}

/** Number of items in the first row of the grid. */
function columns(): number {
    const top = items()[0].getBoundingClientRect().top;
    return items().filter((item) => Math.abs(item.getBoundingClientRect().top - top) < 1).length;
}

const center = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
};

/** Drags `from` onto `to` with the real mouse, and returns once the drop is done (the browser clicks on release). */
async function drag(from: HTMLElement, to: HTMLElement): Promise<void> {
    const start = center(from);
    const end = center(to);
    const mouse = (type: 'mousePressed' | 'mouseReleased' | 'mouseMoved', x: number, y: number) =>
        cdp().send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: 1, clickCount: 1 });
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: start.x, y: start.y });
    await mouse('mousePressed', start.x, start.y);
    for (let step = 1; step <= 10; step++) {
        await mouse('mouseMoved', start.x + ((end.x - start.x) * step) / 10, start.y + ((end.y - start.y) * step) / 10);
        await frame();
    }
    await mouse('mouseReleased', end.x, end.y);
    await frame();
}

describe('ProductSwitch', () => {
    afterEach(() => vi.restoreAllMocks());

    it('opens a menu of products and focuses the first one', async () => {
        const { button } = await open();
        expect(button.getAttribute('aria-haspopup')).toBe('menu');
        expect(button.getAttribute('aria-expanded')).toBe('true');
        expect(button.getAttribute('aria-label')).toBe('Product switch');
        expect(button.getAttribute('title')).toBe('Product switch');
        expect(items()).toHaveLength(8);
        expect(items()[3].getAttribute('aria-posinset')).toBe('4');
        expect(items()[3].getAttribute('aria-setsize')).toBe('8');
        expect(focused()).toBe('Product 1');
    });

    it('moves through the grid with the arrow keys', async () => {
        await open();
        await userEvent.keyboard('{ArrowRight}');
        expect(focused()).toBe('Product 2');
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Product 6');
        await userEvent.keyboard('{ArrowUp}{ArrowLeft}');
        expect(focused()).toBe('Product 1');
        await userEvent.keyboard('{End}{ArrowRight}');
        expect(focused()).toBe('Product 1');
        await userEvent.keyboard('{End}');
        expect(focused()).toBe('Product 8');
        await userEvent.keyboard('{Home}');
        expect(focused()).toBe('Product 1');
    });

    it('swaps ArrowLeft and ArrowRight in RTL', async () => {
        document.documentElement.dir = 'rtl';
        try {
            await open();
            await userEvent.keyboard('{ArrowLeft}');
            expect(focused()).toBe('Product 2');
            await userEvent.keyboard('{ArrowRight}');
            expect(focused()).toBe('Product 1');
        } finally {
            document.documentElement.dir = '';
        }
    });

    it('ArrowDown/ArrowUp move by three columns with 3–6 products', async () => {
        await open({ initial: products(6) });
        await userEvent.keyboard('{ArrowRight}{ArrowDown}');
        expect(focused()).toBe('Product 5');
        await userEvent.keyboard('{ArrowUp}');
        expect(focused()).toBe('Product 2');
    });

    it('lays out two, three or four columns by product count', async () => {
        const { screen } = await open({ initial: products(2) });
        expect(columns()).toBe(2);
        await screen.rerender(<Host initial={products(6)} />);
        await wait();
        expect(columns()).toBe(3);
        await screen.rerender(<Host initial={products(8)} />);
        await wait();
        expect(columns()).toBe(4);
    });

    it('forceListMode shows a list where ArrowDown/ArrowUp wrap', async () => {
        await open({ list: true, initial: products(3) });
        expect(columns()).toBe(1);
        await userEvent.keyboard('{ArrowUp}');
        expect(focused()).toBe('Product 3');
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Product 1');
        await userEvent.keyboard('{ArrowDown}');
        expect(focused()).toBe('Product 2');
    });

    it('busy shows the busy indicator', async () => {
        const { screen } = await open();
        expect(document.querySelector('[role=progressbar]')).toBeNull();
        await screen.rerender(<Host busy />);
        await wait();
        const indicator = document.querySelector('[role=progressbar]')!;
        expect(indicator.getAttribute('aria-busy')).toBe('true');
        expect(indicator.contains(items()[0])).toBe(true);
    });

    it('renders a subtitle only when given and an anchor only for items with a url', async () => {
        await open({
            initial: [
                { title: 'Default', subtitle: 'New tab', icon: 'home', url: 'https://example.com/a' },
                { title: 'Same tab', icon: 'home', url: 'https://example.com/b', target: '_self' },
                { title: 'Callback', icon: 'home', callback: () => undefined }
            ]
        });
        expect(items().map((item) => item.innerText.replace(/\s+/g, ' ').trim())).toEqual([
            'Default New tab',
            'Same tab',
            'Callback'
        ]);
        const links = items().map((item) => item.querySelector('a'));
        expect(links[0]!.getAttribute('href')).toBe('https://example.com/a');
        expect(links[0]!.target).toBe('_blank');
        expect(links[1]!.target).toBe('_self');
        expect(links[2]).toBeNull();
        // the link is for the browser only: the item is the menu item, so it is not focusable or exposed
        expect(links[0]!.getAttribute('aria-hidden')).toBe('true');
        expect(links[0]!.tabIndex).toBe(-1);
        expect(items()[0].getAttribute('aria-label')).toBe('Default New tab Opens in a new tab');
        expect(items()[1].getAttribute('aria-label')).toBe('Same tab');
    });

    it('names items by where a url opens', async () => {
        await open({
            initial: [
                { title: 'Parent', icon: 'home', url: 'https://example.com/a', target: '_parent' },
                { title: 'Top', icon: 'home', url: 'https://example.com/b', target: '_top' }
            ]
        });
        expect(titles()).toEqual(['Parent Opens in the parent frame', 'Top Opens in the full window']);
    });

    it('url items open with window.open in _blank by default or their target, not when a callback is set', async () => {
        const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
        const callback = vi.fn();
        const onOpened = vi.fn();
        const list: ProductSwitchItem[] = [
            { title: 'Default', icon: 'home', url: 'https://example.com/a' },
            { title: 'Same tab', icon: 'home', url: 'https://example.com/b', target: '_self' },
            { title: 'Callback', icon: 'home', url: 'https://example.com/c', callback },
            { title: 'Nothing', icon: 'home' }
        ];
        const { button } = await open({ initial: list, onOpened });
        await userEvent.click(items()[0]);
        expect(windowOpen).toHaveBeenLastCalledWith('https://example.com/a', '_blank');
        for (const index of [1, 2, 3]) {
            await userEvent.click(button);
            await wait();
            await userEvent.click(items()[index]);
        }
        expect(windowOpen).toHaveBeenCalledTimes(2);
        expect(windowOpen).toHaveBeenLastCalledWith('https://example.com/b', '_self');
        expect(callback).toHaveBeenCalledOnce();
        expect(onOpened).toHaveBeenLastCalledWith('Nothing');
    });

    it('the callback receives the click event', async () => {
        const callback = vi.fn();
        await open({ initial: [{ title: 'One', icon: 'home', callback }] });
        const item = items()[0];
        await userEvent.click(item);
        expect(callback).toHaveBeenCalledOnce();
        const event = callback.mock.calls[0][0];
        expect(event.nativeEvent).toBeInstanceOf(MouseEvent);
        expect(event.type).toBe('click');
        expect(item.contains(event.target as Node)).toBe(true);
    });

    it('Space opens the focused product and closes the switch', async () => {
        const onOpened = vi.fn();
        const { button } = await open({ onOpened });
        await userEvent.keyboard('{ArrowRight}{ArrowRight}[Space]');
        await wait();
        expect(onOpened).toHaveBeenLastCalledWith('Product 3');
        expect(button.getAttribute('aria-expanded')).toBe('false');
        expect(items()).toHaveLength(0);
        expect(document.activeElement).toBe(button);
    });

    it('Enter opens the focused product', async () => {
        const onOpened = vi.fn();
        await open({ onOpened });
        await userEvent.keyboard('{ArrowRight}{Enter}');
        expect(onOpened).toHaveBeenLastCalledWith('Product 2');
    });

    it('setting open opens the menu and onOpenChange is not called on init', async () => {
        const onOpenChange = vi.fn();
        function Controlled() {
            const [isOpen, setOpen] = useState(false);
            return (
                <>
                    <button type="button" data-testid="toggle" onClick={() => setOpen(true)}>
                        Open
                    </button>
                    <ProductSwitch
                        open={isOpen}
                        onOpenChange={(next) => {
                            setOpen(next);
                            onOpenChange(next);
                        }}
                    >
                        <ProductSwitchBody defaultProducts={products(8)} />
                    </ProductSwitch>
                </>
            );
        }
        const screen = await render(<Controlled />);
        const button = screen.container.querySelector<HTMLElement>('button[aria-haspopup]')!;
        expect(items()).toHaveLength(0);
        screen.container.querySelector<HTMLElement>('[data-testid=toggle]')!.click();
        await wait();
        expect(items()).toHaveLength(8);
        expect(button.getAttribute('aria-expanded')).toBe('true');
        expect(onOpenChange).not.toHaveBeenCalled();
        await userEvent.keyboard('{Escape}');
        await wait();
        expect(items()).toHaveLength(0);
        expect(onOpenChange).toHaveBeenCalledOnce();
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes on an outside click', async () => {
        await open();
        await userEvent.click(document.body, { position: { x: 5, y: 700 } });
        await wait();
        expect(items()).toHaveLength(0);
    });

    it('a disabled product switch does not open', async () => {
        const onOpenChange = vi.fn();
        const { button } = await setup({ disabled: true, onOpenChange });
        button.click();
        button.focus();
        await userEvent.keyboard('{Enter}');
        await wait();
        expect(items()).toHaveLength(0);
        expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('a custom button replaces the grid button', async () => {
        const { screen, button } = await open({ custom: true });
        const buttons = screen.container.querySelectorAll('button');
        expect(buttons).toHaveLength(1);
        expect(button.classList).toContain('custom');
        expect(button.textContent).toBe('Products');
        expect(button.getAttribute('aria-haspopup')).toBe('menu');
        expect(items()).toHaveLength(8);
    });

    it('dropping an item emits the reordered products, sticky items keep their place', async () => {
        const onProducts = vi.fn();
        await open({
            onProducts,
            initial: [
                { title: 'Home', icon: 'home', stickToPosition: true, disabledDragAndDrop: true },
                ...products(7).slice(1)
            ]
        });
        await drag(items()[2], items()[4]);
        await wait();
        const order = ['Home', 'Product 2', 'Product 4', 'Product 5', 'Product 3', 'Product 6', 'Product 7'];
        expect(onProducts).toHaveBeenCalledOnce();
        expect(onProducts.mock.calls[0][0].map((p: ProductSwitchItem) => p.title)).toEqual(order);
        expect(titles()).toEqual(order);
        // the switch stays open
        expect(items()).toHaveLength(7);
        // nothing can be sorted into the place of a sticky item
        await drag(items()[1], items()[0]);
        await wait();
        expect(titles()[0]).toBe('Home');
        expect(titles()).toEqual(order);
    });

    it('shows the dragged product under the pointer while the others make room', async () => {
        await open();
        const start = center(items()[1]);
        const end = center(items()[3]);
        const mouse = (type: 'mousePressed' | 'mouseReleased' | 'mouseMoved', x: number, y: number) =>
            cdp().send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: 1, clickCount: 1 });
        await mouse('mousePressed', start.x, start.y);
        for (let step = 1; step <= 5; step++) {
            await mouse('mouseMoved', start.x + ((end.x - start.x) * step) / 5, end.y);
            await frame();
        }
        const preview = document.querySelector<HTMLElement>('[data-product-switch-preview]')!;
        expect(preview.getAttribute('aria-hidden')).toBe('true');
        expect(preview.textContent).toBe('Product 2');
        expect(Math.abs(center(preview).x - end.x)).toBeLessThanOrEqual(1);
        // the placeholder is in the drop place
        expect(titles().slice(0, 4)).toEqual(['Product 1', 'Product 3', 'Product 4', 'Product 2']);
        expect(items()[3].hasAttribute('data-dragging')).toBe(true);
        await mouse('mouseReleased', end.x, end.y);
        await frame();
        expect(document.querySelector('[data-product-switch-preview]')).toBeNull();
    });

    it('a click that ends a drag does not open the product, the next click does', async () => {
        const onOpened = vi.fn();
        await open({ onOpened });
        const item = items()[1];
        // the click a browser may fire on the dragged item right after mouseup
        const click = () => item.click();
        window.addEventListener('mouseup', click, { once: true });
        await drag(item, items()[3]);
        expect(onOpened).not.toHaveBeenCalled();
        await wait();
        items()[0].click();
        expect(onOpened).toHaveBeenCalledWith('Product 1');
    });

    it('dragAndDropEnabled false or disabledDragAndDrop makes items not draggable', async () => {
        const onProducts = vi.fn();
        const initial = [{ title: 'Fixed', icon: 'home', disabledDragAndDrop: true }, ...products(3).slice(1)];
        const { screen } = await open({ onProducts, initial });
        const before = titles();
        await drag(items()[0], items()[2]);
        await wait();
        expect(titles()).toEqual(before);

        await screen.rerender(<Host onProducts={onProducts} initial={initial} dnd={false} />);
        await wait();
        await drag(items()[1], items()[2]);
        await wait();
        expect(titles()).toEqual(before);
        expect(onProducts).not.toHaveBeenCalled();
    });

    it('reorders uncontrolled products (defaultProducts)', async () => {
        const onProductsChange = vi.fn();
        await render(<ProductSwitchBody defaultProducts={products(3)} onProductsChange={onProductsChange} />);
        await drag(items()[0], items()[2]);
        await wait();
        expect(titles()).toEqual(['Product 2', 'Product 3', 'Product 1']);
        expect(onProductsChange).toHaveBeenCalledOnce();
    });

    it('shows an avatar instead of the icon', async () => {
        await open({
            initial: [
                {
                    title: 'Data',
                    icon: 'home',
                    avatar: { glyph: 'customer-briefing', colorAccent: 6, ariaLabel: 'Data' }
                }
            ]
        });
        // the avatar in place of the product icon
        const avatar = items()[0].firstElementChild!;
        expect(avatar.getAttribute('role')).toBe('img');
        expect(avatar.getAttribute('aria-label')).toBe('Data');
    });

    it('passes native props, className and ref to the roots', async () => {
        const ref = createRef<HTMLDivElement>();
        const bodyRef = createRef<HTMLDivElement>();
        const screen = await render(
            <ProductSwitch ref={ref} className="blue" data-sample="Sample" aria-label="Apps" buttonClassName="wide">
                <ProductSwitchBody ref={bodyRef} className="red" data-body="Body" defaultProducts={products(2)} />
            </ProductSwitch>
        );
        const root = screen.container.querySelector<HTMLElement>('[data-sample]')!;
        expect(root.className).toContain('blue');
        expect(ref.current).toBe(root);
        const button = root.querySelector('button')!;
        expect(button.getAttribute('aria-label')).toBe('Apps');
        expect(button.className).toContain('wide');
        expect(root.hasAttribute('aria-label')).toBe(false);
        await userEvent.click(button);
        await wait();
        const body = document.querySelector<HTMLElement>('[data-body]')!;
        expect(body.className).toContain('red');
        expect(bodyRef.current).toBe(body);
    });
});
