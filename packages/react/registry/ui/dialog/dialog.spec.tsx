import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef, useState, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { BarElement, BarLeft, BarMiddle, BarRight, ButtonBar } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogCloseButton,
    DialogDescription,
    DialogFooter,
    DialogFullScreenButton,
    DialogHeader,
    DialogPopup,
    DialogProvider,
    DialogSubheader,
    DialogTitle,
    DialogTrigger,
    createDialogHandle,
    useDialogRef,
    useDialogService,
    type DialogConfig,
    type DialogPopupProps,
    type DialogProps,
    type DialogRef,
    type DialogService
} from './dialog';

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
/** Waits for the fade in or out (150ms / 75ms) to end, also on a busy machine, and for the render after it. */
const settle = async () => {
    await wait(100);
    for (let i = 0; i < 20; i++) {
        const fades = document.getAnimations().filter((a) => a instanceof CSSTransition);
        if (!fades.length) break;
        await Promise.all(fades.map((a) => a.finished.catch(() => undefined)));
        await frame();
    }
    await frame();
    await frame();
};
const windows = () => [...document.querySelectorAll<HTMLElement>('[role=dialog], [role=alertdialog]')];
const near = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);

/** Drags with the real mouse from the centre of an element by an offset. */
async function drag(el: Element, dx: number, dy: number): Promise<void> {
    const rect = el.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);
    const mouse = (type: 'mousePressed' | 'mouseReleased' | 'mouseMoved', px: number, py: number) =>
        cdp().send('Input.dispatchMouseEvent', { type, x: px, y: py, button: 'left', buttons: 1, clickCount: 1 });
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await mouse('mousePressed', x, y);
    for (let step = 1; step <= 5; step++) await mouse('mouseMoved', x + (dx * step) / 5, y + (dy * step) / 5);
    await mouse('mouseReleased', x + dx, y + dy);
    await frame();
    await frame();
}

/* ------------------------------------------------------------------------------------------------------------------
 * The service, as the Angular spec
 * ---------------------------------------------------------------------------------------------------------------- */

/** The Angular template dialog: a title, the data in the body and OK / Cancel buttons. */
function templateDialog(dialog: DialogRef<unknown, unknown>) {
    return (
        <DialogPopup>
            <DialogHeader>
                <DialogTitle>Title</DialogTitle>
            </DialogHeader>
            <DialogBody>Body {String(dialog.data ?? '')}</DialogBody>
            <DialogFooter>
                <ButtonBar variant="emphasized" label="OK" onClick={() => dialog.close('ok')} />
                <ButtonBar label="Cancel" onClick={() => dialog.dismiss('cancel')} />
            </DialogFooter>
        </DialogPopup>
    );
}

/** A dialog component: it reads its ref and data. */
let lastComponentRef: DialogRef<{ text: string }> | null = null;
function ComponentDialog() {
    const ref = useDialogRef<{ text: string }>();
    lastComponentRef = ref;
    return (
        <DialogPopup>
            <DialogHeader>
                <DialogTitle>Component dialog</DialogTitle>
            </DialogHeader>
            <DialogBody>{ref.data?.text}</DialogBody>
        </DialogPopup>
    );
}

let service: DialogService;
function ServiceHost({ children }: { children?: ReactNode }) {
    service = useDialogService();
    return (
        <>
            <button id="trigger">Open</button>
            <span data-testid="count">{service.openDialogCount}</span>
            {children}
        </>
    );
}

async function setupService(defaultConfig?: DialogConfig) {
    const screen = await render(
        <DialogProvider defaultConfig={defaultConfig}>
            <ServiceHost />
        </DialogProvider>
    );
    const open = async (config?: DialogConfig) => {
        document.querySelector<HTMLElement>('#trigger')!.focus();
        const ref = service.open(templateDialog, config);
        await settle();
        return ref;
    };
    return { screen, open, service: () => service };
}

const backdrop = () => document.querySelector<HTMLElement>('[data-dialog-backdrop]');
const viewport = () => windows()[0]!.parentElement!;

afterEach(async () => {
    service?.dismissAll();
    await settle();
    document.documentElement.removeAttribute('dir');
});

describe('Dialog service', () => {
    it('is a labelled modal that takes the focus and gives it back when closed', async () => {
        const { open } = await setupService();
        const ref = await open({ data: 'one' });
        const win = windows()[0]!;
        expect(win.getAttribute('aria-modal')).toBe('true');
        expect(document.getElementById(win.getAttribute('aria-labelledby')!)!.textContent).toBe('Title');
        expect(win.textContent).toContain('Body one');
        expect(win.contains(document.activeElement)).toBe(true);
        expect(ref.isOpen).toBe(true);

        await userEvent.click(win.querySelector<HTMLElement>('[data-dialog-footer] button')!);
        expect(await ref.afterClosed).toEqual({ status: 'closed', value: 'ok' });
        await settle();
        expect(windows()).toHaveLength(0);
        expect(document.activeElement!.id).toBe('trigger');
    });

    it('dismisses on Escape unless escKeyCloseable is false', async () => {
        const { open } = await setupService();
        const kept = await open({ escKeyCloseable: false });
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(kept.isOpen).toBe(true);
        expect(windows()).toHaveLength(1);
        kept.close();
        await settle();

        const ref = await open();
        await userEvent.keyboard('{Escape}');
        expect(await ref.afterClosed).toEqual({ status: 'dismissed', reason: 'escape' });
        expect(ref.status).toBe('dismissed');
    });

    it('keeps the focus inside the dialog', async () => {
        const { open } = await setupService();
        await open();
        const win = windows()[0]!;
        for (let i = 0; i < 5; i++) {
            await userEvent.keyboard('{Tab}');
            expect(win.contains(document.activeElement)).toBe(true);
        }
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
        expect(win.contains(document.activeElement)).toBe(true);
    });

    it('dismisses on a backdrop click only when backdropClickCloseable', async () => {
        const { open } = await setupService();
        const ref = await open();
        await userEvent.click(viewport(), { position: { x: 5, y: 5 } });
        await settle();
        expect(ref.isOpen).toBe(true);
        ref.close();
        await settle();

        const closable = await open({ backdropClickCloseable: true });
        await userEvent.click(viewport(), { position: { x: 5, y: 5 } });
        expect(await closable.afterClosed).toEqual({ status: 'dismissed', reason: 'backdrop' });
    });

    it('dims the page once for stacked dialogs', async () => {
        const { open, service } = await setupService();
        await open();
        await open();
        expect(service().openDialogCount).toBe(2);
        expect(windows()).toHaveLength(2);
        const layers = document.querySelectorAll('[data-dialog-backdrop]');
        expect(layers).toHaveLength(1);
        expect(getComputedStyle(layers[0]!, '::before').content).toBe('""');
        // the last one is on top and takes Escape first
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(service().openDialogCount).toBe(1);
        expect(document.querySelectorAll('[data-dialog-backdrop]')).toHaveLength(1);
    });

    it('hides, shows a loader and toggles full screen through its ref', async () => {
        const { open } = await setupService();
        const ref = await open();
        ref.hide(true);
        await settle();
        expect(ref.isHidden).toBe(true);
        expect(getComputedStyle(viewport()).display).toBe('none');
        expect(getComputedStyle(backdrop()!).display).toBe('none');
        ref.hide(false);
        ref.loading({ isLoading: true, loadingLabel: 'Fetching', loadingContent: 'Loading the details.' });
        ref.toggleFullScreen();
        await settle();
        expect(getComputedStyle(viewport()).display).not.toBe('none');
        const progress = windows()[0]!.querySelector('[data-dialog-body] [role=progressbar]')!;
        expect(progress.getAttribute('aria-label')).toBe('Fetching');
        expect(windows()[0]!.querySelector('[data-dialog-body]')!.textContent).toContain('Loading the details.');
        expect(ref.isLoading).toBe(true);
        expect(ref.isFullScreen).toBe(true);
        expect(windows()[0]!.getBoundingClientRect().width).toBe(window.innerWidth);
        expect(windows()[0]!.getBoundingClientRect().height).toBe(window.innerHeight);
        ref.loading(false);
        ref.toggleFullScreen();
        await settle();
        expect(windows()[0]!.querySelector('[role=progressbar]')).toBeNull();
        expect(windows()[0]!.getBoundingClientRect().width).toBeLessThan(window.innerWidth);
    });

    it('builds a dialog from an object with its footer buttons', async () => {
        const { service } = await setupService();
        let approved = false;
        let canceled = false;
        const ref = service().open({
            title: 'Object title',
            content: <p>Object content</p>,
            approveButton: 'Approve',
            approveButtonCallback: () => (approved = true),
            cancelButton: 'Cancel',
            cancelButtonCallback: () => (canceled = true),
            closeButtonCallback: () => ref.dismiss('x'),
            closeButtonTitle: 'Close'
        });
        await settle();
        const win = windows()[0]!;
        expect(document.getElementById(win.getAttribute('aria-labelledby')!)!.textContent).toBe('Object title');
        expect(document.getElementById(win.getAttribute('aria-describedby')!)!.textContent).toBe('Object content');
        // the approve button takes the focus
        expect(document.activeElement!.textContent).toContain('Approve');
        await userEvent.click(document.activeElement as HTMLElement);
        expect(approved).toBe(true);
        await userEvent.click(win.querySelectorAll<HTMLElement>('[data-dialog-footer] button')[1]!);
        expect(canceled).toBe(true);
        expect(ref.isOpen).toBe(true);
        const close = win.querySelector<HTMLElement>('[data-dialog-header] button[aria-label="Close"]')!;
        expect(close.title).toBe('Close');
        await userEvent.click(close);
        expect(await ref.afterClosed).toEqual({ status: 'dismissed', reason: 'x' });
    });

    it('builds an object dialog with a subheader and a full-screen toggle', async () => {
        const { service } = await setupService();
        const onFullScreen = vi.fn();
        const ref = service().open({
            title: 'With subheader',
            subHeader: (
                <BarMiddle>
                    <BarElement fullWidth>
                        <input type="search" aria-label="Search" />
                    </BarElement>
                </BarMiddle>
            ),
            allowFullScreen: true,
            fullScreenButtonCallback: onFullScreen,
            fullScreenExpandButtonText: 'Enter full-screen mode',
            fullScreenMinifyButtonText: 'Exit full-screen mode',
            closeButtonCallback: () => undefined
        });
        await settle();
        const win = windows()[0]!;
        expect(win.querySelector('[data-bar-design=header-with-subheader]')).not.toBeNull();
        expect(win.querySelector('[data-bar-design=subheader] input[type=search]')).not.toBeNull();
        const toggle = win.querySelector<HTMLElement>('button[title="Enter full-screen mode"]')!;
        await userEvent.click(toggle);
        expect(onFullScreen).toHaveBeenCalledTimes(1);
        expect(ref.isFullScreen).toBe(true);
        expect(win.querySelector('button[title="Exit full-screen mode"]')).not.toBeNull();
        // a close button whose callback leaves the dialog open still closes it
        await userEvent.click(win.querySelector<HTMLElement>('button[aria-label="Close"]')!);
        expect(await ref.afterClosed).toEqual({ status: 'dismissed', reason: 'close button' });
    });

    it('opens a component and gives it its DialogRef and data', async () => {
        const { service } = await setupService();
        const ref = service().open(<ComponentDialog />, { data: { text: 'From a component' } });
        await settle();
        const win = windows()[0]!;
        expect(win.querySelector('[data-dialog-body]')!.textContent).toBe('From a component');
        expect(document.getElementById(win.getAttribute('aria-labelledby')!)!.textContent).toBe('Component dialog');
        expect(lastComponentRef).toBe(ref);
        expect(ref.data).toEqual({ text: 'From a component' });
        lastComponentRef!.close('done');
        expect(await ref.afterClosed).toEqual({ status: 'closed', value: 'done' });
    });

    it('builds an object dialog without buttons with no footer', async () => {
        const { service } = await setupService();
        service().open({ title: 'No buttons' });
        await settle();
        const win = windows()[0]!;
        expect(document.getElementById(win.getAttribute('aria-labelledby')!)!.textContent).toBe('No buttons');
        expect(win.querySelector('[data-dialog-footer]')).toBeNull();
        expect(win.querySelector('button')).toBeNull();
        expect(win.hasAttribute('aria-describedby')).toBe(false);
    });

    it('dismissAll closes every open dialog and removes them', async () => {
        const { open, service, screen } = await setupService();
        const first = await open();
        const second = await open();
        expect(service().openDialogCount).toBe(2);
        await expect.element(screen.getByTestId('count')).toHaveTextContent('2');
        service().dismissAll('all');
        expect(await first.afterClosed).toEqual({ status: 'dismissed', reason: 'all' });
        expect(await second.afterClosed).toEqual({ status: 'dismissed', reason: 'all' });
        expect(service().hasOpenDialogs).toBe(false);
        expect(service().dialogs).toEqual([]);
        await expect.element(screen.getByTestId('count')).toHaveTextContent('0');
        await settle();
        expect(windows()).toHaveLength(0);
        expect(backdrop()).toBeNull();
    });

    it('locks the page scroll while a modal dialog is open', async () => {
        const tall = document.createElement('div');
        tall.style.height = '3000px';
        document.body.appendChild(tall);
        const locked = () =>
            [document.documentElement, document.body].some((el) => getComputedStyle(el).overflowY === 'hidden');
        const { open, service } = await setupService();
        expect(locked()).toBe(false);
        await open();
        expect(locked()).toBe(true);
        service().dismissAll();
        await settle();
        expect(locked()).toBe(false);
        // without backdrop the page keeps scrolling
        await open({ hasBackdrop: false });
        expect(locked()).toBe(false);
        tall.remove();
    });

    it('dismisses its dialogs when the provider unmounts', async () => {
        const { open, screen } = await setupService();
        const ref = await open();
        screen.unmount();
        expect(await ref.afterClosed).toEqual({ status: 'dismissed', reason: 'service destroyed' });
    });

    it('close() sets the status closed and exposes the result; dismiss() the reason', async () => {
        const { open } = await setupService();
        const ref = await open();
        expect(ref.status).toBe('loaded');
        expect(ref.isLoaded).toBe(true);
        expect(ref.closeResult).toBeNull();
        ref.close('saved');
        expect(ref.status).toBe('closed');
        expect(ref.isClosed).toBe(true);
        expect(ref.isOpen).toBe(false);
        expect(ref.closeResult).toEqual({ status: 'closed', value: 'saved' });
        // a closed dialog stays closed
        ref.dismiss('late');
        expect(ref.status).toBe('closed');
        await settle();

        const dismissed = await open();
        await dismissed.afterLoaded;
        dismissed.dismiss('cancel');
        expect(dismissed.status).toBe('dismissed');
        expect(dismissed.closeResult).toEqual({ status: 'dismissed', reason: 'cancel' });
    });

    it('places the dialog at the configured position', async () => {
        const { open, service } = await setupService();
        await open({ position: { top: '40px', left: 60 } });
        const host = viewport().getBoundingClientRect();
        let rect = windows()[0]!.getBoundingClientRect();
        near(rect.top - host.top, 40);
        near(rect.left - host.left, 60);
        service().dismissAll();
        await settle();

        await open({ position: { bottom: 30, right: '20px' } });
        rect = windows()[0]!.getBoundingClientRect();
        near(host.bottom - rect.bottom, 30);
        near(host.right - rect.right, 20);
    });

    it('applies width, height and min/max sizes', async () => {
        const { open, service } = await setupService();
        await open({ width: 500, maxWidth: '400px', height: 100, minHeight: '300px' });
        let rect = windows()[0]!.getBoundingClientRect();
        near(rect.width, 400);
        near(rect.height, 300);
        service().dismissAll();
        await settle();

        await open({ width: '100px', minWidth: '200px', height: '400px', maxHeight: '300px' });
        rect = windows()[0]!.getBoundingClientRect();
        near(rect.width, 200);
        near(rect.height, 300);
    });

    it('applies dialogPanelClass to the window and backdropClass to the backdrop', async () => {
        const { open } = await setupService();
        await open({ dialogPanelClass: 'custom-panel', backdropClass: 'custom-backdrop' });
        expect(windows()[0]!.classList).toContain('custom-panel');
        expect(backdrop()!.classList).toContain('custom-backdrop');
    });

    it('mobile mode fills the viewport, mobileOuterSpacing keeps a margin', async () => {
        const { open, service } = await setupService();
        await open({ mobile: true, width: '300px' });
        const screenRect = viewport().getBoundingClientRect();
        let rect = windows()[0]!.getBoundingClientRect();
        expect(rect.width).toBe(screenRect.width);
        expect(rect.height).toBe(screenRect.height);
        service().dismissAll();
        await settle();

        // 5% of the width and 3% of the height on each side, with rounded corners
        await open({ mobile: true, mobileOuterSpacing: true });
        rect = windows()[0]!.getBoundingClientRect();
        near(rect.width, screenRect.width * 0.9);
        near(rect.height, screenRect.height * 0.94);
        near(rect.left, screenRect.width * 0.05);
        near(rect.top, screenRect.height * 0.03);
        expect(getComputedStyle(windows()[0]!).borderTopLeftRadius).not.toBe('0px');
    });

    it('drags by the header only when draggable', async () => {
        const { open, service } = await setupService();
        await open({ width: '20rem' });
        let win = windows()[0]!;
        let before = win.getBoundingClientRect();
        await drag(win.querySelector('[data-dialog-header]')!, 40, 30);
        expect(win.getBoundingClientRect().left).toBe(before.left);
        service().dismissAll();
        await settle();

        await open({ width: '20rem', draggable: true });
        win = windows()[0]!;
        before = win.getBoundingClientRect();
        // the body is no drag handle
        await drag(win.querySelector('[data-dialog-body]')!, 40, 30);
        expect(win.getBoundingClientRect().left).toBe(before.left);
        await drag(win.querySelector('[data-dialog-header] h2')!, 40, 30);
        const after = win.getBoundingClientRect();
        near(after.left - before.left, 40);
        near(after.top - before.top, 30);
        // it stays inside the viewport
        await drag(win.querySelector('[data-dialog-header] h2')!, -2000, -2000);
        near(win.getBoundingClientRect().left, 0);
        near(win.getBoundingClientRect().top, 0);
    });

    it('resizes with the handle when resizable and announces it', async () => {
        const { open, service } = await setupService();
        await open({ width: '20rem' });
        expect(windows()[0]!.hasAttribute('aria-description')).toBe(false);
        expect(windows()[0]!.querySelector('[data-dialog-resize-handle]')).toBeNull();
        service().dismissAll();
        await settle();

        await open({ width: '20rem', height: '12rem', resizable: true });
        const win = windows()[0]!;
        expect(win.getAttribute('aria-description')).toBe('Resizable');
        const before = win.getBoundingClientRect();
        const handle = win.querySelector('[data-dialog-resize-handle]')!;
        expect(handle.getAttribute('aria-hidden')).toBe('true');
        const grip = handle.getBoundingClientRect();
        await drag(handle, 50, 40);
        // the bottom end corner follows the pointer
        const after = win.getBoundingClientRect();
        near(after.right, Math.round(grip.left + grip.width / 2) + 50);
        near(after.bottom, Math.round(grip.top + grip.height / 2) + 40);
        expect(after.width).toBeGreaterThan(before.width + 40);
        expect(after.height).toBeGreaterThan(before.height + 30);
        // the window stays where it was
        near(after.left, before.left);
        near(after.top, before.top);
    });

    it('resizes towards the left in RTL', async () => {
        // the portal leaves the subtree: the direction comes from Base UI's DirectionProvider
        await render(
            <DirectionProvider direction="rtl">
                <DialogProvider>
                    <ServiceHost />
                </DialogProvider>
            </DirectionProvider>
        );
        service.open(templateDialog, { width: '20rem', height: '12rem', resizable: true });
        await settle();
        const win = windows()[0]!;
        expect(getComputedStyle(win).direction).toBe('rtl');
        const before = win.getBoundingClientRect();
        const handle = win.querySelector('[data-dialog-resize-handle]')!;
        // the handle is in the bottom left corner
        const grip = handle.getBoundingClientRect();
        near(grip.left, before.left - 8);
        await drag(handle, -50, 40);
        // the bottom start corner follows the pointer
        const after = win.getBoundingClientRect();
        near(after.left, Math.round(grip.left + grip.width / 2) - 50);
        near(after.bottom, Math.round(grip.top + grip.height / 2) + 40);
        near(after.right, before.right);
        near(after.top, before.top);
    });

    it('applies ariaLabel, ariaLabelledBy, ariaDescribedBy and id from the config', async () => {
        const { open, service } = await setupService();
        await open({ ariaLabel: 'Custom label', ariaDescribedBy: 'external-description', id: 'my-dialog' });
        let win = windows()[0]!;
        expect(win.getAttribute('aria-label')).toBe('Custom label');
        expect(win.getAttribute('aria-describedby')).toBe('external-description');
        expect(win.getAttribute('role')).toBe('dialog');
        expect(win.id).toBe('my-dialog');
        service().dismissAll();
        await settle();

        await open({ ariaLabelledBy: 'trigger' });
        win = windows()[0]!;
        expect(win.getAttribute('aria-labelledby')).toBe('trigger');
    });

    it('dismisses on navigation unless closeOnNavigation is false', async () => {
        const { open } = await setupService();
        const kept = await open({ closeOnNavigation: false });
        window.dispatchEvent(new PopStateEvent('popstate'));
        await settle();
        expect(kept.isOpen).toBe(true);
        kept.close();
        await settle();

        const ref = await open();
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(await ref.afterClosed).toEqual({ status: 'dismissed', reason: 'navigation change' });
    });

    it('applies the provider defaults under the config of each dialog', async () => {
        const { open } = await setupService({ width: '18rem', escKeyCloseable: false });
        const ref = await open({ width: '22rem' });
        near(windows()[0]!.getBoundingClientRect().width, 22 * 16);
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(ref.isOpen).toBe(true);
    });

    it('keeps the page usable without backdrop and focus trap', async () => {
        const { open } = await setupService();
        const ref = await open({ hasBackdrop: false, focusTrapped: false, width: '20rem' });
        expect(backdrop()).toBeNull();
        // the window itself takes the focus
        expect(document.activeElement).toBe(windows()[0]);
        const trigger = document.querySelector<HTMLElement>('#trigger')!;
        await userEvent.click(trigger);
        expect(document.activeElement).toBe(trigger);
        expect(ref.isOpen).toBe(true);
    });

    it('renders into a container and flows with it without backdrop', async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const { open, service } = await setupService();
        await open({ container, width: '20rem' });
        expect(container.contains(windows()[0]!)).toBe(true);
        expect(getComputedStyle(viewport()).position).toBe('fixed');
        service().dismissAll();
        await settle();

        await open({ container, width: '20rem', hasBackdrop: false, focusTrapped: false });
        expect(container.contains(windows()[0]!)).toBe(true);
        expect(getComputedStyle(viewport()).position).toBe('relative');
        expect(container.getBoundingClientRect().height).toBeGreaterThan(100);
        service().dismissAll();
        await settle();
        container.remove();
    });

    it('forces a content density', async () => {
        const { open } = await setupService();
        await open({ contentDensity: 'compact' });
        expect(viewport().getAttribute('data-density')).toBe('compact');
        expect(windows()[0]!.querySelector('[data-dialog-bar]')!.getBoundingClientRect().height).toBe(40);
    });
});

/* ------------------------------------------------------------------------------------------------------------------
 * The declarative parts, and the fundamental-react tests
 * ---------------------------------------------------------------------------------------------------------------- */

interface HostProps extends DialogProps {
    popup?: Partial<DialogPopupProps>;
    header?: ReactNode;
    footer?: ReactNode;
    body?: ReactNode;
}

/** A trigger, the fundamental-react "Product Added" dialog with No / Yes actions, and a button outside. */
function Host({ popup, header, footer, body, ...dialog }: HostProps) {
    return (
        <>
            <Dialog {...dialog}>
                <DialogTrigger data-testid="trigger">Show Dialog</DialogTrigger>
                <DialogPopup data-testid="window" {...popup}>
                    {header ?? (
                        <DialogHeader data-testid="header">
                            <DialogTitle data-testid="title">Product Added</DialogTitle>
                            <DialogFullScreenButton />
                            <DialogCloseButton title="Close" />
                        </DialogHeader>
                    )}
                    <DialogBody data-testid="body">
                        {body ?? (
                            <DialogDescription>The new product have been added to your catalog.</DialogDescription>
                        )}
                    </DialogBody>
                    {footer ?? (
                        <DialogFooter data-testid="footer">
                            <DialogClose render={<ButtonBar label="No" />} />
                            <DialogClose render={<ButtonBar variant="emphasized" label="Yes" />} />
                        </DialogFooter>
                    )}
                </DialogPopup>
            </Dialog>
            <button data-testid="outside">Outside</button>
        </>
    );
}

async function setup(initial: HostProps = {}) {
    let current = initial;
    const screen = await render(<Host {...current} />);
    const el = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
    return {
        screen,
        el,
        trigger: () => el('trigger')!,
        win: () => el('window'),
        update: async (change: Partial<HostProps>) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
            await settle();
        }
    };
}

describe('Dialog', () => {
    it('opens from its trigger, closes with an action and returns the focus', async () => {
        const onOpenChange = vi.fn();
        const { trigger, win, el } = await setup({ onOpenChange });
        expect(win()).toBeNull();
        expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
        await userEvent.click(trigger());
        await settle();
        expect(onOpenChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ reason: 'trigger-press' }));
        expect(win()!.getAttribute('role')).toBe('dialog');
        expect(win()!.getAttribute('aria-modal')).toBe('true');
        expect(document.getElementById(win()!.getAttribute('aria-labelledby')!)).toBe(el('title'));
        expect(document.getElementById(win()!.getAttribute('aria-describedby')!)!.textContent).toContain('new product');
        expect(win()!.contains(document.activeElement)).toBe(true);
        expect(trigger().getAttribute('aria-expanded')).toBe('true');

        await userEvent.click(el('footer')!.querySelectorAll('button')[0]!);
        await settle();
        expect(win()).toBeNull();
        expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'close-press' }));
        expect(document.activeElement).toBe(trigger());
    });

    it('closes on Escape (fundamental-react onClose) unless escKeyCloseable is false', async () => {
        const onOpenChange = vi.fn();
        const { win, update } = await setup({ defaultOpen: true, onOpenChange });
        await settle();
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(win()).toBeNull();
        expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'escape-key' }));

        onOpenChange.mockClear();
        await update({ open: true, escKeyCloseable: false });
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(win()).not.toBeNull();
        expect(onOpenChange).not.toHaveBeenCalled();
        // a key besides Escape does nothing
        await userEvent.keyboard('{Enter}');
        expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('renders nothing while closed (fundamental-react show=false)', async () => {
        const { win, el } = await setup({ open: false });
        await settle();
        expect(win()).toBeNull();
        expect(el('title')).toBeNull();
    });

    it('is controlled with open and onOpenChange', async () => {
        function Controlled() {
            const [open, setOpen] = useState(false);
            return (
                <>
                    <button data-testid="open" onClick={() => setOpen(true)}>
                        Open
                    </button>
                    <span data-testid="state">{String(open)}</span>
                    <Dialog open={open} onOpenChange={setOpen} backdropClickCloseable>
                        <DialogPopup data-testid="window" aria-label="Controlled">
                            <DialogBody>Body</DialogBody>
                        </DialogPopup>
                    </Dialog>
                </>
            );
        }
        const screen = await render(<Controlled />);
        await userEvent.click(screen.getByTestId('open'));
        await settle();
        expect(document.querySelector('[data-testid=window]')).not.toBeNull();
        // a click on the backdrop closes it
        await userEvent.click(viewport(), { position: { x: 5, y: 5 } });
        await settle();
        expect(document.querySelector('[data-testid=window]')).toBeNull();
        await expect.element(screen.getByTestId('state')).toHaveTextContent('false');
    });

    it('lays out the header: title at the start, full-screen and close buttons at the end', async () => {
        const { el } = await setup({ defaultOpen: true });
        await settle();
        const bar = el('header')!.querySelector('[data-dialog-bar]')!;
        expect(bar.getAttribute('role')).toBe('group');
        expect(bar.getAttribute('data-bar-design')).toBe('header');
        const [start, end] = [...bar.children];
        expect(start!.contains(el('title'))).toBe(true);
        expect(el('title')!.tagName).toBe('H2');
        expect(getComputedStyle(el('title')!).fontSize).toBe('16px');
        const buttons = [...end!.querySelectorAll('button')];
        expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Enter full screen', 'Close']);
        // compact buttons in the header
        expect(buttons.every((b) => b.getAttribute('data-density') === 'compact')).toBe(true);
        expect(buttons[0]!.getBoundingClientRect().height).toBe(26);
    });

    it('toggles full screen with its button, and back on the next opening', async () => {
        const onFullScreenChange = vi.fn();
        const { el, win, trigger } = await setup({ defaultOpen: true, onFullScreenChange });
        await settle();
        const toggle = () => el('header')!.querySelector<HTMLElement>('button[aria-label$="full screen"]')!;
        await userEvent.click(toggle());
        expect(onFullScreenChange).toHaveBeenLastCalledWith(true);
        expect(toggle().getAttribute('aria-label')).toBe('Exit full screen');
        expect(win()!.getBoundingClientRect().width).toBe(window.innerWidth);
        expect(getComputedStyle(win()!).borderTopLeftRadius).toBe('0px');
        expect(getComputedStyle(el('header')!.querySelector('[data-dialog-bar]')!).borderTopLeftRadius).toBe('0px');
        await userEvent.keyboard('{Escape}');
        await settle();
        await userEvent.click(trigger());
        await settle();
        expect(toggle().getAttribute('aria-label')).toBe('Enter full screen');
        expect(win()!.getBoundingClientRect().width).toBeLessThan(window.innerWidth);
    });

    it('a mobile window fills the screen, hides the full-screen button and has a cozy close button', async () => {
        const { el, win } = await setup({ defaultOpen: true, popup: { mobile: true } });
        await settle();
        expect(win()!.getBoundingClientRect().width).toBe(window.innerWidth);
        expect(el('header')!.querySelector('button[aria-label$="full screen"]')).toBeNull();
        const close = el('header')!.querySelector<HTMLElement>('button[aria-label="Close"]')!;
        expect(close.hasAttribute('data-density')).toBe(false);
        expect(close.getBoundingClientRect().height).toBe(36);
    });

    it('a custom header and footer keep their bar areas; a subheader goes below the header', async () => {
        const { el } = await setup({
            defaultOpen: true,
            header: (
                <DialogHeader data-testid="header">
                    <BarLeft data-testid="left">
                        <BarElement>
                            <DialogTitle>Fresh Market</DialogTitle>
                        </BarElement>
                    </BarLeft>
                    <BarRight data-testid="right">
                        <ButtonBar label="Clear" />
                    </BarRight>
                    <DialogSubheader data-testid="subheader">
                        <BarMiddle>
                            <BarElement fullWidth>
                                <input type="search" aria-label="Search produce" />
                            </BarElement>
                        </BarMiddle>
                    </DialogSubheader>
                </DialogHeader>
            ),
            footer: (
                <DialogFooter data-testid="footer">
                    <BarLeft data-testid="footer-left">
                        <BarElement>Total price: 3 €</BarElement>
                    </BarLeft>
                    <BarRight>
                        <ButtonBar variant="emphasized" label="Checkout" />
                    </BarRight>
                </DialogFooter>
            )
        });
        await settle();
        const bar = el('header')!.querySelector('[data-dialog-bar]')!;
        expect(bar.getAttribute('data-bar-design')).toBe('header-with-subheader');
        expect([...bar.children]).toEqual([el('left'), el('right')]);
        expect(el('subheader')!.getAttribute('data-bar-design')).toBe('subheader');
        expect(bar.nextElementSibling).toBe(el('subheader'));
        expect(el('footer')!.querySelector('[data-dialog-bar]')!.firstElementChild).toBe(el('footer-left'));
    });

    it('wraps a plain subheader and footer buttons in bar areas', async () => {
        const { el } = await setup({
            defaultOpen: true,
            header: (
                <DialogHeader data-testid="header">
                    <span>Test header</span>
                    <DialogTitle>Product Added</DialogTitle>
                    <DialogSubheader data-testid="subheader">Test subheader</DialogSubheader>
                </DialogHeader>
            )
        });
        await settle();
        expect(el('subheader')!.textContent).toBe('Test subheader');
        expect(el('subheader')!.firstElementChild!.firstElementChild!.textContent).toBe('Test subheader');
        // fundamental-react's header text and the title share the start of the bar
        expect(el('header')!.querySelector('[data-dialog-bar]')!.children).toHaveLength(1);
        const footerArea = el('footer')!.querySelector('[data-dialog-bar]')!.firstElementChild!;
        expect(getComputedStyle(footerArea).justifyContent).toBe('flex-end');
        // decisive buttons are at least 4rem wide
        expect(footerArea.querySelector('button')!.getBoundingClientRect().width).toBeGreaterThanOrEqual(64);
    });

    it('sets the body paddings from the window options', async () => {
        const { el, update } = await setup({ defaultOpen: true, popup: { width: '30rem' } });
        await settle();
        const padding = () => {
            const style = getComputedStyle(el('body')!);
            return [style.paddingTop, style.paddingLeft];
        };
        expect(padding()).toEqual(['16px', '16px']);
        await update({ popup: { width: '30rem', size: 'xl' } });
        expect(padding()).toEqual(['16px', '48px']);
        // the header and footer bars follow the padding
        expect(getComputedStyle(el('header')!.querySelector('[data-dialog-bar]')!).paddingLeft).toBe('48px');
        await update({ popup: { width: '40rem', responsivePadding: true } });
        expect(padding()).toEqual(['16px', '32px']);
        await update({ popup: { width: '30rem', verticalPadding: false } });
        expect(padding()).toEqual(['0px', '16px']);
        await update({ popup: { width: '30rem', disablePaddings: true } });
        expect(padding()).toEqual(['0px', '0px']);
        await update({ popup: { width: '30rem', bodyMinHeight: '10rem' } });
        expect(el('body')!.getBoundingClientRect().height).toBe(160);
    });

    it('DialogBody disablePaddings removes its paddings', async () => {
        const { el } = await setup({
            defaultOpen: true,
            body: <p>List</p>
        });
        await settle();
        expect(getComputedStyle(el('body')!).paddingTop).toBe('16px');
        await render(
            <Dialog defaultOpen>
                <DialogPopup aria-label="List">
                    <DialogBody data-testid="list-body" disablePaddings>
                        List
                    </DialogBody>
                </DialogPopup>
            </Dialog>
        );
        await settle();
        expect(getComputedStyle(el('list-body')!).padding).toBe('0px');
    });

    it('shows a busy indicator while loading', async () => {
        const { el, update } = await setup({ defaultOpen: true, loading: true });
        await settle();
        expect(el('body')!.querySelector('[role=progressbar]')!.getAttribute('aria-label')).toBe('Loading');
        await update({ loading: { isLoading: true, loadingLabel: 'Fetching', loadingContent: 'Far away' } });
        expect(el('body')!.querySelector('[role=progressbar]')!.getAttribute('aria-label')).toBe('Fetching');
        expect(el('body')!.textContent).toContain('Far away');
        await update({ loading: false });
        expect(el('body')!.querySelector('[role=progressbar]')).toBeNull();
    });

    it('hidden hides the dialog without closing it', async () => {
        const { win, update } = await setup({ open: true });
        await settle();
        await update({ hidden: true });
        expect(getComputedStyle(viewport()).display).toBe('none');
        expect(backdrop()).not.toBeNull();
        expect(getComputedStyle(backdrop()!).display).toBe('none');
        await update({ hidden: false });
        expect(win()!.checkVisibility()).toBe(true);
    });

    it('is an alert dialog with role="alertdialog"', async () => {
        const { win } = await setup({ defaultOpen: true, popup: { role: 'alertdialog' } });
        await settle();
        expect(win()!.getAttribute('role')).toBe('alertdialog');
    });

    it("starts the focus on initialFocus (Angular's cdkFocusInitial)", async () => {
        const yes = createRef<HTMLButtonElement>();
        const { win } = await setup({
            defaultOpen: true,
            popup: { initialFocus: yes },
            footer: (
                <DialogFooter>
                    <ButtonBar label="No" />
                    <DialogClose render={<ButtonBar ref={yes} variant="emphasized" label="Yes" />} />
                </DialogFooter>
            )
        });
        await settle();
        expect(document.activeElement).toBe(yes.current);
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(win()).toBeNull();
    });

    it('opens from code with a handle and a trigger outside', async () => {
        const handle = createDialogHandle();
        await render(
            <>
                <DialogTrigger handle={handle} data-testid="external" render={<Button label="External" />} />
                <Dialog handle={handle}>
                    <DialogPopup data-testid="window" aria-label="Handle">
                        <DialogBody>Body</DialogBody>
                    </DialogPopup>
                </Dialog>
            </>
        );
        const trigger = document.querySelector<HTMLElement>('[data-testid=external]')!;
        await userEvent.click(trigger);
        await settle();
        expect(handle.isOpen).toBe(true);
        handle.close();
        await settle();
        expect(document.querySelector('[data-testid=window]')).toBeNull();
        expect(document.activeElement).toBe(trigger);
    });

    it('nested dialogs: Escape closes the inner one first and the page is dimmed once', async () => {
        await render(
            <Dialog defaultOpen>
                <DialogPopup data-testid="outer" aria-label="Outer">
                    <DialogBody>
                        <Dialog>
                            <DialogTrigger data-testid="inner-trigger">Inner</DialogTrigger>
                            <DialogPopup data-testid="inner" aria-label="Inner">
                                <DialogBody>Inner body</DialogBody>
                            </DialogPopup>
                        </Dialog>
                    </DialogBody>
                </DialogPopup>
            </Dialog>
        );
        await settle();
        await userEvent.click(document.querySelector<HTMLElement>('[data-testid=inner-trigger]')!);
        await settle();
        expect(document.querySelectorAll('[data-dialog-backdrop]')).toHaveLength(1);
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(document.querySelector('[data-testid=inner]')).toBeNull();
        expect(document.querySelector('[data-testid=outer]')).not.toBeNull();
        expect(document.activeElement).toBe(document.querySelector('[data-testid=inner-trigger]'));
    });

    it('Escape in a popover inside the dialog leaves the dialog open', async () => {
        const { win } = await setup({
            defaultOpen: true,
            body: (
                <Popover>
                    <PopoverTrigger data-testid="popover-trigger">Details</PopoverTrigger>
                    <PopoverBody aria-label="Details">
                        <button data-testid="inside">Inside</button>
                    </PopoverBody>
                </Popover>
            )
        });
        await settle();
        await userEvent.click(document.querySelector<HTMLElement>('[data-testid=popover-trigger]')!);
        await settle();
        const inside = document.querySelector<HTMLElement>('[data-testid=inside]')!;
        expect(document.activeElement).toBe(inside);
        // the popover body is above the dialog
        const rect = inside.getBoundingClientRect();
        expect(document.elementFromPoint(rect.left + 4, rect.top + 4)).toBe(inside);
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(document.querySelector('[data-testid=inside]')).toBeNull();
        expect(win()).not.toBeNull();
    });

    it('a close button outside of a dialog is a plain button', async () => {
        const onClick = vi.fn();
        const screen = await render(<DialogCloseButton onClick={onClick} />);
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    describe('fundamental-react: custom class names and prop spreading', () => {
        it('adds classes to the backdrop and to the window', async () => {
            const { win } = await setup({
                defaultOpen: true,
                popup: { backdropClassName: 'sample-backdrop', className: 'sample' }
            });
            await settle();
            expect(backdrop()!.classList).toContain('sample-backdrop');
            expect(win()!.classList).toContain('sample');
        });

        it('passes native props and the ref to the window, header, body, footer and title', async () => {
            const ref = createRef<HTMLDivElement>();
            const { win, el } = await setup({
                defaultOpen: true,
                popup: { ref, 'data-sample': 'Sample' } as Partial<DialogPopupProps>,
                header: (
                    <DialogHeader data-testid="header" data-sample="Header">
                        <DialogTitle data-testid="title" data-sample="Title" level={3}>
                            Title
                        </DialogTitle>
                    </DialogHeader>
                ),
                footer: (
                    <DialogFooter data-testid="footer" data-sample="Footer">
                        <ButtonBar label="OK" />
                    </DialogFooter>
                ),
                body: 'Body'
            });
            await settle();
            expect(ref.current).toBe(win());
            expect(win()!.getAttribute('data-sample')).toBe('Sample');
            expect(el('header')!.tagName).toBe('DIV');
            expect(el('header')!.getAttribute('data-sample')).toBe('Header');
            expect(el('footer')!.tagName).toBe('DIV');
            expect(el('footer')!.getAttribute('data-sample')).toBe('Footer');
            expect(el('title')!.getAttribute('data-sample')).toBe('Title');
            // fundamental-react headingLevel
            expect(el('title')!.tagName).toBe('H3');
            expect(getComputedStyle(el('title')!).fontSize).toBe('16px');
            expect(el('body')!.textContent).toBe('Body');
        });

        it('renders the header and footer as other elements with render', async () => {
            const { el } = await setup({
                defaultOpen: true,
                header: (
                    <DialogHeader data-testid="header" render={<header />}>
                        <DialogTitle>Title</DialogTitle>
                    </DialogHeader>
                ),
                footer: (
                    <DialogFooter data-testid="footer" render={<footer />}>
                        <ButtonBar label="OK" />
                    </DialogFooter>
                )
            });
            await settle();
            expect(el('header')!.tagName).toBe('HEADER');
            expect(el('header')!.hasAttribute('data-dialog-header')).toBe(true);
            expect(el('footer')!.tagName).toBe('FOOTER');
            expect(el('footer')!.querySelector('[data-bar-design=footer]')).not.toBeNull();
        });
    });
});
