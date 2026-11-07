import { createRef, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { BarElement, BarLeft, BarRight, ButtonBar } from '@/ui/bar/bar';
import { Dialog, DialogClose, DialogProvider, DialogTrigger, type DialogProps } from '@/ui/dialog/dialog';
import { iconGlyphChar } from '@/ui/icon/icon';
import {
    MessageBox,
    MessageBoxBody,
    MessageBoxFooter,
    MessageBoxHeader,
    MessageBoxProvider,
    MessageBoxSemanticIcon,
    MessageBoxTitle,
    useMessageBoxRef,
    useMessageBoxService,
    type MessageBoxConfig,
    type MessageBoxProps,
    type MessageBoxRef,
    type MessageBoxService,
    type MessageBoxType
} from './message-box';

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
const boxes = () => [...document.querySelectorAll<HTMLElement>('[role=alertdialog]')];
const win = () => boxes()[0]!;
const near = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
const labelOf = (el: HTMLElement) => document.getElementById(el.getAttribute('aria-labelledby')!)!.textContent;
const descriptionOf = (el: HTMLElement) => document.getElementById(el.getAttribute('aria-describedby')!)!.textContent;
const semanticGlyphs = () =>
    [...win().querySelectorAll('[data-message-box-semantic-icon]')].map((icon) => icon.getAttribute('data-glyph'));
const button = (text: string) =>
    [...win().querySelectorAll<HTMLElement>('button')].find((b) => b.textContent!.includes(text))!;

/* ------------------------------------------------------------------------------------------------------------------
 * The service, as the Angular spec
 * ---------------------------------------------------------------------------------------------------------------- */

/** The Angular template message box: a custom footer with a note at the start and Next at the end. */
function templateBox(messageBox: MessageBoxRef<{ title: string } | undefined, string>) {
    return (
        <MessageBox>
            <MessageBoxHeader>
                <MessageBoxTitle level={1}>{messageBox.data?.title}</MessageBoxTitle>
            </MessageBoxHeader>
            <MessageBoxBody>Template body</MessageBoxBody>
            <MessageBoxFooter>
                <BarLeft>
                    <BarElement>
                        <span className="footer-note">Step 1 of 2</span>
                    </BarElement>
                </BarLeft>
                <BarRight>
                    <ButtonBar variant="emphasized" label="Next" onClick={() => messageBox.close('next')} />
                </BarRight>
            </MessageBoxFooter>
        </MessageBox>
    );
}

/** A message box component with its own semantic icon; it reads its ref. */
let lastRef: MessageBoxRef<{ count: number }, string> | null = null;
function BoxContent() {
    const ref = useMessageBoxRef<{ count: number }, string>();
    lastRef = ref;
    return (
        <MessageBox>
            <MessageBoxHeader>
                <MessageBoxSemanticIcon glyph="cart" />
                <MessageBoxTitle level={1}>Checkout</MessageBoxTitle>
            </MessageBoxHeader>
            <MessageBoxBody>{ref.data?.count} items in the cart</MessageBoxBody>
        </MessageBox>
    );
}

let service: MessageBoxService;
function ServiceHost() {
    service = useMessageBoxService();
    return (
        <>
            <button id="page-button">Page</button>
            <span data-testid="count">{service.openDialogCount}</span>
        </>
    );
}

async function setup(defaultConfig?: MessageBoxConfig, children?: ReactNode) {
    const screen = await render(
        <DialogProvider>
            <MessageBoxProvider defaultConfig={defaultConfig}>
                <ServiceHost />
                {children}
            </MessageBoxProvider>
        </DialogProvider>
    );
    const open: MessageBoxService['open'] = (content, config) => service.open(content, config);
    return { screen, open, service: () => service };
}

afterEach(async () => {
    service?.dismissAll();
    await settle();
});

describe('MessageBox service', () => {
    it('opens an alert dialog named by its title and described by its body', async () => {
        const { open } = await setup();
        const ref: MessageBoxRef<unknown, string> = open<unknown, string>(
            {
                title: 'Delete order',
                content: 'The order will be deleted.',
                approveButton: 'Delete',
                approveButtonCallback: () => ref.close('deleted'),
                cancelButton: 'Cancel',
                cancelButtonCallback: () => ref.dismiss('canceled')
            },
            { type: 'error', showSemanticIcon: true }
        );
        await settle();
        const dialog = win();
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(labelOf(dialog)).toBe('Delete order');
        expect(descriptionOf(dialog)).toBe('The order will be deleted.');
        expect(dialog.querySelector('[data-message-box-semantic-icon]')).not.toBeNull();
        expect(document.activeElement!.textContent).toContain('Delete');
        await userEvent.click(document.activeElement as HTMLElement);
        expect(await ref.afterClosed).toEqual({ status: 'closed', value: 'deleted' });
    });

    it('dismisses on Escape', async () => {
        const { open } = await setup();
        const ref = open({ title: 'Info', content: 'Text', approveButton: 'OK' }, { type: 'information' });
        await settle();
        await userEvent.keyboard('{Escape}');
        expect(await ref.afterClosed).toEqual({ status: 'dismissed', reason: 'escape' });
    });

    it('shows no semantic icon unless asked', async () => {
        const { open } = await setup();
        open({ title: 'Plain', content: 'Text' }, { type: 'warning' });
        await settle();
        expect(win().querySelector('[data-message-box-semantic-icon]')).toBeNull();
    });

    it('opens from a render function and a component with their data and ref', async () => {
        const { open } = await setup();
        const fromTemplate = open(templateBox, { data: { title: 'From a template' } });
        await settle();
        expect(labelOf(win())).toBe('From a template');
        expect(win().querySelector('[data-dialog-body]')!.textContent).toBe('Template body');
        await userEvent.click(button('Next'));
        expect(await fromTemplate.afterClosed).toEqual({ status: 'closed', value: 'next' });
        await settle();

        const fromComponent = open<{ count: number }, string>(<BoxContent />, { data: { count: 3 } });
        await settle();
        expect(win().querySelector('[data-dialog-body]')!.textContent).toBe('3 items in the cart');
        expect(labelOf(win())).toBe('Checkout');
        expect(lastRef).toBe(fromComponent);
        lastRef!.close('checkout');
        expect(await fromComponent.afterClosed).toEqual({ status: 'closed', value: 'checkout' });
    });

    it('the cancel callback dismisses with its reason', async () => {
        const { open } = await setup();
        const ref: MessageBoxRef = open({
            title: 'Discard changes',
            content: 'Your changes will be lost.',
            approveButton: 'Discard',
            approveButtonCallback: () => ref.close('discarded'),
            cancelButton: 'Keep editing',
            cancelButtonCallback: () => ref.dismiss('canceled')
        });
        await settle();
        await userEvent.click(button('Keep editing'));
        expect(await ref.afterClosed).toEqual({ status: 'dismissed', reason: 'canceled' });
    });

    it('focusTrapped false neither focuses the approve button nor traps the focus', async () => {
        const { open } = await setup();
        open({ title: 'Untrapped', content: 'Text', approveButton: 'OK' }, { focusTrapped: false });
        await settle();
        const approve = button('OK');
        expect(document.activeElement).not.toBe(approve);
        expect(document.activeElement).toBe(win());
        // Tab leaves the message box for the page
        const page = document.getElementById('page-button');
        const reached: Element[] = [];
        for (let i = 0; i < 6 && document.activeElement !== page; i++) {
            await userEvent.keyboard('{Tab}');
            reached.push(document.activeElement!);
        }
        expect(reached).toContain(approve);
        expect(document.activeElement).toBe(page);
    });

    it('each type shows its semantic glyph, a custom icon replaces it', async () => {
        const { open, service } = await setup();
        const expected: Record<MessageBoxType, string> = {
            error: 'error',
            success: 'sys-enter-2',
            warning: 'alert',
            information: 'information',
            confirmation: 'sys-help-2'
        };
        const names = [...Object.values(expected), 'cart'];
        // the reference glyphs are all different characters
        expect(new Set(names.map((name) => iconGlyphChar(name)).filter(Boolean)).size).toBe(names.length);
        for (const [type, name] of Object.entries(expected) as [MessageBoxType, string][]) {
            open({ title: type, content: 'Text' }, { type, showSemanticIcon: true });
            await settle();
            expect(semanticGlyphs()).toEqual([iconGlyphChar(name)]);
            service().dismissAll();
            await settle();
        }
        open({ title: 'Custom', content: 'Text' }, { type: 'error', customSemanticIcon: 'cart' });
        await settle();
        expect(semanticGlyphs()).toEqual([iconGlyphChar('cart')]);
    });

    it('colours the header line and the icon by type', async () => {
        const { open, service } = await setup();
        const colours: Record<MessageBoxType, [string, string]> = {
            confirmation: ['--sapContent_HeaderShadow', '--sapNeutralElementColor'],
            error: ['--sapContent_Error_HeaderShadow', '--sapNegativeElementColor'],
            success: ['--sapContent_Success_HeaderShadow', '--sapPositiveElementColor'],
            warning: ['--sapContent_Warning_HeaderShadow', '--sapCriticalElementColor'],
            information: ['--sapContent_Information_HeaderShadow', '--sapInformativeElementColor']
        };
        const probe = document.createElement('div');
        document.body.appendChild(probe);
        const resolve = (prop: string, value: string) => {
            probe.style.setProperty(prop, value);
            return getComputedStyle(probe).getPropertyValue(prop);
        };
        for (const [type, [shadow, colour]] of Object.entries(colours) as [MessageBoxType, [string, string]][]) {
            open({ title: type, content: 'Text' }, { type, showSemanticIcon: true });
            await settle();
            const bar = win().querySelector<HTMLElement>('[data-dialog-header] [data-dialog-bar]')!;
            expect(getComputedStyle(bar).boxShadow).toBe(resolve('box-shadow', `var(${shadow})`));
            const icon = win().querySelector<HTMLElement>('[data-message-box-semantic-icon]')!;
            expect(getComputedStyle(icon).color).toBe(resolve('color', `var(${colour})`));
            service().dismissAll();
            await settle();
        }
        probe.remove();
    });

    it('a semantic icon in the header replaces the type icon', async () => {
        const { open } = await setup();
        open(<BoxContent />, { type: 'error', showSemanticIcon: true, data: { count: 1 } });
        await settle();
        expect(semanticGlyphs()).toEqual([iconGlyphChar('cart')]);
    });

    it('the footer renders custom content in its bar areas', async () => {
        const { open } = await setup();
        open(templateBox, { data: { title: 'Custom footer' } });
        await settle();
        const footer = win().querySelector('[data-dialog-footer]')!;
        const note = footer.querySelector('.footer-note')!;
        expect(note.textContent).toBe('Step 1 of 2');
        const next = button('Next');
        expect(next.getBoundingClientRect().left).toBeGreaterThan(note.getBoundingClientRect().right);
    });

    it('dismisses on a backdrop click only when backdropClickCloseable', async () => {
        const { open } = await setup();
        const viewport = () => win().parentElement!;
        const kept = open({ title: 'Kept', content: 'Text' });
        await settle();
        await userEvent.click(viewport(), { position: { x: 5, y: 5 } });
        await settle();
        expect(kept.isOpen).toBe(true);
        kept.close();
        await settle();

        const ref = open({ title: 'Closable', content: 'Text' }, { backdropClickCloseable: true });
        await settle();
        await userEvent.click(viewport(), { position: { x: 5, y: 5 } });
        expect(await ref.afterClosed).toEqual({ status: 'dismissed', reason: 'backdrop' });
    });

    it('applies position, width and height', async () => {
        const { open } = await setup();
        open(
            { title: 'Placed', content: 'Text' },
            { position: { top: '30px', left: '40px' }, width: '400px', height: '250px' }
        );
        await settle();
        const host = win().parentElement!.getBoundingClientRect();
        const rect = win().getBoundingClientRect();
        near(rect.top - host.top, 30);
        near(rect.left - host.left, 40);
        near(rect.width, 400);
        near(rect.height, 250);
    });

    it('applies dialogPanelClass, ariaLabel and ariaDescribedBy', async () => {
        const { open } = await setup();
        open(
            { title: 'Labelled', content: 'Text' },
            { dialogPanelClass: 'custom-panel', ariaLabel: 'Custom label', ariaDescribedBy: 'page-button' }
        );
        await settle();
        expect(win().classList).toContain('custom-panel');
        expect(win().getAttribute('aria-label')).toBe('Custom label');
        expect(win().getAttribute('aria-describedby')).toBe('page-button');
    });

    it('mobile mode fills the viewport, mobileOuterSpacing keeps a margin', async () => {
        const { open, service } = await setup();
        open({ title: 'Mobile', content: 'Text' }, { mobile: true, width: '300px' });
        await settle();
        const viewport = win().parentElement!.getBoundingClientRect();
        let rect = win().getBoundingClientRect();
        expect(rect.width).toBe(viewport.width);
        expect(rect.height).toBe(viewport.height);
        service().dismissAll();
        await settle();

        open({ title: 'Mobile', content: 'Text' }, { mobile: true, mobileOuterSpacing: true });
        await settle();
        rect = win().getBoundingClientRect();
        near(rect.width, viewport.width * 0.9);
        near(rect.left, viewport.width * 0.05);
    });

    it('dismisses on navigation unless closeOnNavigation is false', async () => {
        const { open } = await setup();
        const kept = open({ title: 'Kept', content: 'Text' }, { closeOnNavigation: false });
        await settle();
        window.dispatchEvent(new PopStateEvent('popstate'));
        await settle();
        expect(kept.isOpen).toBe(true);
        kept.close();
        await settle();

        const ref = open({ title: 'Navigated', content: 'Text' });
        await settle();
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(await ref.afterClosed).toEqual({ status: 'dismissed', reason: 'navigation change' });
    });

    it('dismissAll closes every open box and removes them', async () => {
        const { open, service, screen } = await setup();
        const first = open({ title: 'First', content: 'Text' });
        const second = open({ title: 'Second', content: 'Text' });
        await settle();
        expect(service().openDialogCount).toBe(2);
        expect(service().hasOpenDialogs).toBe(true);
        await expect.element(screen.getByTestId('count')).toHaveTextContent('2');
        service().dismissAll('all');
        expect(await first.afterClosed).toEqual({ status: 'dismissed', reason: 'all' });
        expect(await second.afterClosed).toEqual({ status: 'dismissed', reason: 'all' });
        expect(service().openDialogCount).toBe(0);
        expect(service().dialogs).toEqual([]);
        await settle();
        expect(boxes()).toHaveLength(0);
        expect(document.querySelector('[data-dialog-backdrop]')).toBeNull();
    });

    it('has responsive paddings by default, and takes the provider defaults under each config', async () => {
        const { open, service } = await setup({ type: 'success', showSemanticIcon: true, width: '1100px' });
        open({ title: 'Defaults', content: 'Text' });
        await settle();
        expect(win().getAttribute('data-message-box-type')).toBe('success');
        expect(semanticGlyphs()).toEqual([iconGlyphChar('sys-enter-2')]);
        // 1100px wide: the l paddings (2rem)
        expect(getComputedStyle(win().querySelector('[data-dialog-body]')!).paddingLeft).toBe('32px');
        service().dismissAll();
        await settle();

        open({ title: 'Own', content: 'Text' }, { type: 'error', width: '400px', responsivePadding: false });
        await settle();
        expect(win().getAttribute('data-message-box-type')).toBe('error');
        expect(getComputedStyle(win().querySelector('[data-dialog-body]')!).paddingLeft).toBe('16px');
    });

    it('builds an object message box without buttons with no footer, and with a title heading level', async () => {
        const { open } = await setup();
        open({ title: 'No buttons', titleId: 'own-title', titleHeadingLevel: 3, content: 'Text', contentId: 'own' });
        await settle();
        expect(win().getAttribute('aria-labelledby')).toBe('own-title');
        expect(document.getElementById('own-title')!.tagName).toBe('H3');
        expect(win().getAttribute('aria-describedby')).toBe('own');
        expect(win().querySelector('[data-dialog-footer]')).toBeNull();
        expect(win().querySelector('button')).toBeNull();
    });

    it('gives the object buttons their ids and aria labels', async () => {
        const { open } = await setup();
        open({
            title: 'Ids',
            approveButton: 'Yes',
            approveButtonId: 'yes',
            approveButtonAriaLabel: 'Yes, delete',
            cancelButton: 'No',
            cancelButtonId: 'no',
            cancelButtonAriaLabel: 'No, keep'
        });
        await settle();
        expect(document.getElementById('yes')!.getAttribute('aria-label')).toBe('Yes, delete');
        expect(document.getElementById('no')!.getAttribute('aria-label')).toBe('No, keep');
        expect(document.activeElement!.id).toBe('yes');
    });

    it('needs a DialogProvider', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        function Bare() {
            useMessageBoxService();
            return null;
        }
        await expect(render(<Bare />)).rejects.toThrow(/DialogProvider/);
        error.mockRestore();
    });
});

/* ------------------------------------------------------------------------------------------------------------------
 * Declarative message boxes, as the fundamental-react tests
 * ---------------------------------------------------------------------------------------------------------------- */

interface HostProps extends DialogProps {
    box?: Partial<MessageBoxProps>;
    header?: ReactNode;
    body?: ReactNode;
    footer?: ReactNode;
}

function Host({ box, header, body, footer, ...dialog }: HostProps) {
    return (
        <>
            <Dialog {...dialog}>
                <DialogTrigger data-testid="trigger">Open</DialogTrigger>
                <MessageBox data-testid="window" {...box}>
                    {header ?? (
                        <MessageBoxHeader>
                            <MessageBoxTitle data-testid="title">Message Box Title</MessageBoxTitle>
                        </MessageBoxHeader>
                    )}
                    <MessageBoxBody data-testid="body">{body ?? 'This is a message box.'}</MessageBoxBody>
                    {footer ?? (
                        <MessageBoxFooter data-testid="footer">
                            <DialogClose render={<ButtonBar variant="emphasized" label="OK" />} />
                        </MessageBoxFooter>
                    )}
                </MessageBox>
            </Dialog>
        </>
    );
}

async function setupHost(initial: HostProps = {}) {
    let current = initial;
    const screen = await render(<Host {...current} />);
    const el = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
    return {
        screen,
        el,
        update: async (change: Partial<HostProps>) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
            await settle();
        }
    };
}

describe('MessageBox', () => {
    it('opens from its trigger as an alert dialog, closes with its action and returns the focus', async () => {
        const onOpenChange = vi.fn();
        const { el } = await setupHost({ onOpenChange });
        expect(el('window')).toBeNull();
        await userEvent.click(el('trigger')!);
        await settle();
        const box = el('window')!;
        expect(box.getAttribute('role')).toBe('alertdialog');
        expect(box.getAttribute('aria-modal')).toBe('true');
        expect(document.getElementById(box.getAttribute('aria-labelledby')!)).toBe(el('title'));
        expect(el('title')!.textContent).toBe('Message Box Title');
        expect(box.contains(document.activeElement)).toBe(true);
        await userEvent.click(el('footer')!.querySelector('button')!);
        await settle();
        expect(el('window')).toBeNull();
        expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'close-press' }));
        expect(document.activeElement).toBe(el('trigger'));
    });

    it('closes on Escape (fundamental-react onClose), not on other keys', async () => {
        const onOpenChange = vi.fn();
        const { el } = await setupHost({ defaultOpen: true, onOpenChange });
        await settle();
        // a key besides Escape does nothing (fundamental-react listened on the document)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        el('window')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await settle();
        expect(onOpenChange).not.toHaveBeenCalled();
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(el('window')).toBeNull();
        expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'escape-key' }));
    });

    it('renders nothing while closed (fundamental-react show=false)', async () => {
        const { el, update } = await setupHost({ open: false });
        await settle();
        expect(el('window')).toBeNull();
        expect(el('title')).toBeNull();
        await update({ open: true });
        expect(el('title')).not.toBeNull();
    });

    it('shows the semantic icon of its type before the title only with showSemanticIcon', async () => {
        const { el, update } = await setupHost({ open: true, box: { type: 'warning' } });
        await settle();
        expect(el('window')!.querySelector('[data-message-box-semantic-icon]')).toBeNull();
        await update({ box: { type: 'warning', showSemanticIcon: true } });
        const icon = el('window')!.querySelector<HTMLElement>('[data-message-box-semantic-icon]')!;
        expect(icon.getAttribute('data-glyph')).toBe(iconGlyphChar('alert'));
        expect(icon.getAttribute('aria-hidden')).toBe('true');
        expect(icon.compareDocumentPosition(el('title')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(getComputedStyle(icon).marginInlineEnd).toBe('8px');
        await update({ box: { customSemanticIcon: 'cart' } });
        expect(el('window')!.querySelector('[data-message-box-semantic-icon]')!.getAttribute('data-glyph')).toBe(
            iconGlyphChar('cart')
        );
    });

    it('a custom header keeps its bar areas', async () => {
        const { el } = await setupHost({
            open: true,
            box: { type: 'error' },
            header: (
                <MessageBoxHeader data-testid="header">
                    <BarLeft data-testid="left">
                        <BarElement>
                            <MessageBoxTitle>Custom</MessageBoxTitle>
                        </BarElement>
                    </BarLeft>
                    <BarRight data-testid="right">
                        <ButtonBar glyph="decline" aria-label="Close" />
                    </BarRight>
                </MessageBoxHeader>
            )
        });
        await settle();
        const bar = el('header')!.querySelector('[data-dialog-bar]')!;
        expect(el('left')!.parentElement).toBe(bar);
        expect(el('right')!.parentElement).toBe(bar);
        expect(el('right')!.getBoundingClientRect().left).toBeGreaterThan(el('left')!.getBoundingClientRect().right);
    });

    it('takes the size paddings of fundamental-react', async () => {
        const { el, update } = await setupHost({ open: true, box: { size: 's' } });
        await settle();
        expect(getComputedStyle(el('body')!).paddingLeft).toBe('16px');
        await update({ box: { size: 'xl' } });
        expect(getComputedStyle(el('body')!).paddingLeft).toBe('48px');
        const footerBar = el('footer')!.querySelector<HTMLElement>('[data-dialog-bar]')!;
        expect(getComputedStyle(footerBar).paddingInlineEnd).toBe('48px');
    });

    describe('fundamental-react: custom class names and prop spreading', () => {
        it('adds classes to the backdrop and to the window', async () => {
            const { el } = await setupHost({
                defaultOpen: true,
                box: { backdropClassName: 'sample-backdrop', className: 'sample' }
            });
            await settle();
            expect(document.querySelector('[data-dialog-backdrop]')!.classList).toContain('sample-backdrop');
            expect(el('window')!.classList).toContain('sample');
        });

        it('passes native props and the ref to the window, header, title, body and footer', async () => {
            const ref = createRef<HTMLDivElement>();
            const { el } = await setupHost({
                defaultOpen: true,
                box: { ref, 'data-sample': 'Sample' } as Partial<MessageBoxProps>,
                header: (
                    <MessageBoxHeader data-testid="header" data-sample="Header">
                        <MessageBoxTitle data-testid="title" data-sample="Title">
                            Title
                        </MessageBoxTitle>
                    </MessageBoxHeader>
                ),
                footer: (
                    <MessageBoxFooter data-testid="footer" data-sample="Footer">
                        <ButtonBar label="OK" />
                    </MessageBoxFooter>
                )
            });
            await settle();
            expect(ref.current).toBe(el('window'));
            expect(el('window')!.getAttribute('data-sample')).toBe('Sample');
            expect(el('header')!.getAttribute('data-sample')).toBe('Header');
            expect(el('title')!.getAttribute('data-sample')).toBe('Title');
            expect(el('title')!.tagName).toBe('H2');
            expect(getComputedStyle(el('title')!).fontSize).toBe('16px');
            expect(el('body')!.textContent).toBe('This is a message box.');
            expect(el('footer')!.getAttribute('data-sample')).toBe('Footer');
        });

        it('renders the header as another element with render', async () => {
            const { el } = await setupHost({
                defaultOpen: true,
                header: (
                    <MessageBoxHeader data-testid="header" render={<header />}>
                        <MessageBoxTitle>Title</MessageBoxTitle>
                    </MessageBoxHeader>
                )
            });
            await settle();
            expect(el('header')!.tagName).toBe('HEADER');
            expect(el('header')!.hasAttribute('data-dialog-header')).toBe(true);
        });
    });
});
