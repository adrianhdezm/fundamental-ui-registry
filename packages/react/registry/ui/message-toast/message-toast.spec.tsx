import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    MessageToastProvider,
    useMessageToastRef,
    useMessageToastService,
    type MessageToastConfig,
    type MessageToastService
} from './message-toast';

const wait = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
const toasts = () => [...document.querySelectorAll<HTMLElement>('[data-message-toast]')];

let service!: MessageToastService;
function Capture() {
    service = useMessageToastService();
    return null;
}

/** Renders a provider and returns its service. */
async function setup(defaultConfig?: MessageToastConfig): Promise<MessageToastService> {
    await render(
        <MessageToastProvider defaultConfig={defaultConfig}>
            <Capture />
        </MessageToastProvider>
    );
    return service;
}

/** Parks the real pointer away from the toasts, so only the moves of a test reach them. */
async function parkPointer(): Promise<() => void> {
    const corner = document.createElement('div');
    corner.style.cssText = 'position:fixed;top:0;left:0;width:10px;height:10px';
    document.body.appendChild(corner);
    await userEvent.hover(corner);
    return () => corner.remove();
}

function ToastContent() {
    const ref = useMessageToastRef<{ text: string }>();
    return <span className="content">{ref.data.text}</span>;
}

/* ------------------------------------------------------------------------------------------------------------------
 * The Angular spec
 * ---------------------------------------------------------------------------------------------------------------- */

describe('MessageToast', () => {
    it('announces a string message and disappears after its duration', async () => {
        const toastService = await setup();
        let dismissed = false;
        const ref = toastService.open('Saved', { duration: 200 });
        ref.afterDismissed.then(() => (dismissed = true));
        await wait();
        expect(toasts()).toHaveLength(1);
        expect(toasts()[0]!.getAttribute('role')).toBe('alert');
        expect(toasts()[0]!.getAttribute('aria-live')).toBe('polite');
        expect(toasts()[0]!.textContent!.trim()).toBe('Saved');
        expect(ref.data).toBe('Saved');
        await wait(400);
        expect(dismissed).toBe(true);
        expect(toasts()).toHaveLength(0);
    });

    it('renders components with their data and stays open while hovered', async () => {
        const unpark = await parkPointer();
        const toastService = await setup();
        toastService.open(<ToastContent />, { data: { text: 'From a component' }, duration: 400 });
        await wait();
        expect(toasts()[0]!.querySelector('.content')!.textContent).toBe('From a component');
        await userEvent.hover(toasts()[0]!);
        await wait(600);
        expect(toasts()).toHaveLength(1);
        await userEvent.unhover(toasts()[0]!);
        await wait(700);
        expect(toasts()).toHaveLength(0);
        unpark();
    });

    it('stacks toasts at a position and closes them all', async () => {
        const toastService = await setup();
        toastService.open('One', { position: 'top-right', duration: 0 });
        toastService.open('Two', { position: 'top-right', duration: 0 });
        toastService.open('Three', { position: 'bottom-left', duration: 0 });
        await wait();
        const [one, two, three] = toasts();
        expect(one!.parentElement).toBe(two!.parentElement);
        expect(three!.parentElement).not.toBe(one!.parentElement);
        expect(two!.getBoundingClientRect().top).toBeGreaterThan(one!.getBoundingClientRect().top);
        // top-right: aligned to the right edge, 1rem in
        expect(Math.round(window.innerWidth - one!.getBoundingClientRect().right)).toBe(16);
        expect(toastService.openCount).toBe(3);
        expect(toastService.hasOpenMessageToasts).toBe(true);
        toastService.hideAll();
        await wait();
        expect(toasts()).toHaveLength(0);
        expect(toastService.openCount).toBe(0);
        expect(toastService.hasOpenMessageToasts).toBe(false);
    });

    it('opens a toast from a render function (template) with its data', async () => {
        const toastService = await setup();
        const ref = toastService.open<{ text: string }>((toast) => <span className="tpl">{toast.data.text}</span>, {
            data: { text: 'From a template' },
            duration: 0
        });
        await wait();
        expect(toasts()).toHaveLength(1);
        expect(toasts()[0]!.querySelector('.tpl')!.textContent).toBe('From a template');
        expect(ref.data).toEqual({ text: 'From a template' });
    });

    it('afterOpened resolves once the toast is shown; ref.dismiss() closes it and resolves afterDismissed', async () => {
        const toastService = await setup();
        const ref = toastService.open('Opened', { duration: 0, animated: true });
        let opened = 0;
        let dismissed = 0;
        ref.afterOpened.then(() => opened++);
        ref.afterDismissed.then(() => dismissed++);
        expect(opened).toBe(0);
        await expect.poll(() => opened).toBe(1);
        expect(toasts()).toHaveLength(1);
        // a toast with duration 0 stays until dismissed
        await wait(200);
        expect(toasts()).toHaveLength(1);
        expect(ref.isOpen).toBe(true);
        ref.dismiss();
        expect(ref.isOpen).toBe(false);
        await expect.poll(() => dismissed).toBe(1);
        expect(toasts()).toHaveLength(0);
        expect(toastService.openCount).toBe(0);
        ref.dismiss();
        await wait();
        expect(dismissed).toBe(1);
    });

    it('a custom top/left position places the toast there', async () => {
        const toastService = await setup();
        toastService.open('Placed', { position: { top: '100px', left: '50px' }, duration: 0 });
        await wait();
        const rect = toasts()[0]!.getBoundingClientRect();
        expect(Math.round(rect.top)).toBe(100);
        expect(Math.round(rect.left)).toBe(50);
    });

    it('boundTo places the toast next to the element', async () => {
        const anchor = document.createElement('button');
        anchor.textContent = 'Anchor';
        anchor.style.cssText = 'position:fixed;top:200px;left:300px;width:120px;height:30px';
        document.body.appendChild(anchor);
        const toastService = await setup();
        toastService.open('Bound', { position: { boundTo: anchor, side: 'bottom', align: 'center' }, duration: 0 });
        await wait(100);
        const toast = toasts()[0]!.getBoundingClientRect();
        const box = anchor.getBoundingClientRect();
        expect(Math.abs(toast.top - box.bottom)).toBeLessThanOrEqual(1);
        expect(Math.abs(toast.left + toast.width / 2 - (box.left + box.width / 2))).toBeLessThanOrEqual(1);
        anchor.remove();
    });

    it('maxWidth limits the toast width', async () => {
        const toastService = await setup();
        const text = 'A long message toast that would be wider than one hundred pixels on a single line.';
        toastService.open(text, { maxWidth: '100px', duration: 0, position: 'top-left' });
        toastService.open(text, { duration: 0, position: 'bottom-left' });
        await wait();
        const [limited, wide] = toasts();
        expect(limited!.getBoundingClientRect().width).toBeLessThanOrEqual(100);
        expect(wide!.getBoundingClientRect().width).toBeGreaterThan(100);
    });
});

/* ------------------------------------------------------------------------------------------------------------------
 * The rest of the Angular API
 * ---------------------------------------------------------------------------------------------------------------- */

describe('MessageToast API', () => {
    it('bottom positions grow upwards, top positions downwards, from 1rem off the edge', async () => {
        const toastService = await setup();
        toastService.open('Old', { duration: 0 });
        toastService.open('New', { duration: 0 });
        await wait();
        const [old, recent] = toasts().map((t) => t.getBoundingClientRect());
        expect(recent!.bottom).toBeLessThan(old!.top);
        expect(Math.round(window.innerHeight - old!.bottom)).toBe(16);
        // bottom-center: centred
        expect(Math.abs(old!.left + old!.width / 2 - window.innerWidth / 2)).toBeLessThanOrEqual(1);
        // 1rem between toasts
        expect(Math.round(old!.top - recent!.bottom)).toBe(16);
    });

    it('custom positions with the same values share a stack', async () => {
        const toastService = await setup();
        toastService.open('One', { position: { top: '5rem', right: '2rem' }, duration: 0 });
        toastService.open('Two', { position: { top: '5rem', right: '2rem' }, duration: 0 });
        await wait();
        const [one, two] = toasts();
        expect(one!.parentElement).toBe(two!.parentElement);
        expect(Math.round(window.innerWidth - one!.getBoundingClientRect().right)).toBe(32);
    });

    it('takes the provider defaults and setNewPositionStrategy for toasts without a position', async () => {
        const toastService = await setup({ duration: 0, maxWidth: '8rem' });
        toastService.setNewPositionStrategy('top-left');
        toastService.open('A message toast with the defaults of the provider');
        await wait(100);
        const rect = toasts()[0]!.getBoundingClientRect();
        expect(Math.round(rect.top)).toBe(16);
        expect(Math.round(rect.left)).toBe(16);
        expect(rect.width).toBeLessThanOrEqual(128);
        // duration 0 from the defaults
        await wait(300);
        expect(toasts()).toHaveLength(1);
    });

    it('sets id and aria-label, and is focusable from code only', async () => {
        const toastService = await setup();
        toastService.open('Labelled', { id: 'my-toast', ariaLabel: 'Status', duration: 0 });
        await wait();
        const toast = toasts()[0]!;
        expect(toast.id).toBe('my-toast');
        expect(toast.getAttribute('aria-label')).toBe('Status');
        expect(toast.getAttribute('tabindex')).toBe('-1');
        expect(toast.hasAttribute('aria-modal')).toBe(false);
        expect(toast.closest('[role=region]')!.getAttribute('aria-label')).toBe('Notifications');
    });

    it('has the toast styles: dark background, contrast text, centred, at most 15rem wide', async () => {
        const toastService = await setup();
        toastService.open('Product added', { duration: 0 });
        await wait();
        const style = getComputedStyle(toasts()[0]!);
        // inline-flex, blockified to flex as an item of the stack column
        expect(style.display).toBe('flex');
        expect(style.textAlign).toBe('center');
        expect(style.padding).toBe('16px');
        expect(style.maxWidth).toBe('240px');
        expect(style.backgroundColor).toBe('rgb(29, 45, 62)');
        expect(style.color).toBe('rgb(255, 255, 255)');
    });

    it('without mousePersist the toast closes while hovered', async () => {
        const unpark = await parkPointer();
        const toastService = await setup();
        // long enough for the hover to land on a busy machine before the toast closes
        toastService.open('Not persistent', { duration: 1500, mousePersist: false });
        await wait();
        await userEvent.hover(toasts()[0]!);
        expect(toasts()).toHaveLength(1);
        await expect.poll(() => toasts().length, { timeout: 4000 }).toBe(0);
        unpark();
    });

    it('a toast hovered before its duration starts waits for the pointer to leave', async () => {
        const unpark = await parkPointer();
        const toastService = await setup();
        toastService.open('First', { duration: 0, position: 'top-left' });
        await wait();
        await userEvent.hover(toasts()[0]!);
        toastService.open('Second', { duration: 200, position: 'top-left' });
        await wait(400);
        expect(toasts()).toHaveLength(2);
        await userEvent.unhover(toasts()[0]!);
        await wait(400);
        expect(toasts().map((t) => t.textContent)).toEqual(['First']);
        unpark();
    });

    it('dismissAfter and cancelDismiss change the timer of an open toast', async () => {
        const toastService = await setup();
        const ref = toastService.open('Timed', { duration: 200 });
        await ref.afterOpened;
        ref.cancelDismiss();
        await wait(400);
        expect(toasts()).toHaveLength(1);
        ref.dismissAfter(100);
        await wait(300);
        expect(toasts()).toHaveLength(0);
    });

    it('slides an animated toast in and fades it out', async () => {
        const toastService = await setup();
        const ref = toastService.open('Animated', { duration: 0, animated: true });
        await wait(20);
        const toast = toasts()[0]!;
        expect(getComputedStyle(toast).transitionDuration).toBe('0.15s');
        await ref.afterOpened;
        expect(getComputedStyle(toast).opacity).toBe('1');
        ref.dismiss();
        await wait(20);
        expect(toast.hasAttribute('data-ending-style')).toBe(true);
        await ref.afterDismissed;
        expect(toasts()).toHaveLength(0);
    });

    it('opens a toast from the first effect of a component below the provider', async () => {
        function OpenOnMount() {
            const toastService = useMessageToastService();
            useEffect(() => {
                toastService.open('On mount', { duration: 0 });
            }, [toastService]);
            return null;
        }
        await render(
            <MessageToastProvider>
                <OpenOnMount />
            </MessageToastProvider>
        );
        await expect.poll(() => toasts().map((t) => t.textContent)).toEqual(['On mount']);
    });

    it('F6 moves the focus to the toasts; Escape closes the focused toast', async () => {
        const toastService = await setup();
        toastService.open('Focus me', { duration: 0 });
        await wait();
        await userEvent.keyboard('{F6}');
        const region = toasts()[0]!.closest<HTMLElement>('[role=region]')!;
        expect(document.activeElement).toBe(region);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(toasts()[0]);
        await userEvent.keyboard('{Escape}');
        await wait();
        expect(toasts()).toHaveLength(0);
    });

    it('renders the toasts in the container of the provider', async () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        await render(
            <MessageToastProvider container={host}>
                <Capture />
            </MessageToastProvider>
        );
        service.open('Inside', { duration: 0 });
        await wait();
        expect(host.contains(toasts()[0]!)).toBe(true);
        host.remove();
    });

    it('unmounting the provider closes its toasts', async () => {
        const screen = await render(
            <MessageToastProvider>
                <Capture />
            </MessageToastProvider>
        );
        const toastService = service;
        const ref = toastService.open('Gone', { duration: 0 });
        await wait();
        expect(toasts()).toHaveLength(1);
        await screen.unmount();
        await ref.afterDismissed;
        expect(toasts()).toHaveLength(0);
        expect(toastService.openCount).toBe(0);
    });

    it('useMessageToastService and useMessageToastRef throw outside their provider and toast', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        function Service() {
            useMessageToastService();
            return null;
        }
        function Ref() {
            useMessageToastRef();
            return null;
        }
        await expect(render(<Service />)).rejects.toThrow(/MessageToastProvider/);
        await expect(render(<Ref />)).rejects.toThrow(/useMessageToastService/);
        error.mockRestore();
    });
});
