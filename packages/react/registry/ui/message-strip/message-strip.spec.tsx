import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Icon } from '@/ui/icon/icon';
import { Link } from '@/ui/link/link';
import { MessageStrip, type MessageStripActions, type MessageStripProps } from './message-strip';
import {
    MessageStripAlertProvider,
    useMessageStripAlertRef,
    useMessageStripAlerts,
    type MessageStripAlertPosition,
    type MessageStripAlerts
} from './message-strip-alert';

const frame = () => new Promise((r) => requestAnimationFrame(r));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const visible = (el: Element | null) => !!el && (el as HTMLElement).checkVisibility();

async function setup(initial: MessageStripProps = {}) {
    let current: MessageStripProps = { type: 'warning', ...initial };
    const onDismiss = vi.fn();
    const actions = createRef<MessageStripActions>();
    const ui = (p: MessageStripProps) => (
        <div>
            <MessageStrip id="strip" onDismiss={onDismiss} actionsRef={actions} {...p}>
                Session expires soon.
            </MessageStrip>
            <MessageStrip id="custom" dismissible={false} icon={<Icon glyph="survey" />}>
                Survey open
            </MessageStrip>
            <MessageStrip id="labelled" aria-labelledby="ext" width="300px" minWidth="200px" marginBottom="12px">
                Labelled
            </MessageStrip>
            <span id="ext">External</span>
        </div>
    );
    const screen = await render(ui(current));
    const root = screen.container;
    return {
        root,
        onDismiss,
        actions,
        strip: () => root.querySelector<HTMLElement>('#strip')!,
        hidden: () => document.getElementById('strip-hidden-text')!,
        close: () => root.querySelector<HTMLButtonElement>('#strip button')!,
        update: async (change: MessageStripProps) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('MessageStrip', () => {
    it('is a note labelled by its hidden type description and its text', async () => {
        const { root, strip, hidden } = await setup();
        expect(strip().getAttribute('role')).toBe('note');
        expect(strip().getAttribute('aria-labelledby')).toBe('strip-hidden-text strip-content-text');
        expect(hidden().textContent).toBe('Warning Message Strip Closable');
        expect(hidden().getBoundingClientRect().width).toBeLessThanOrEqual(1);
        expect(document.getElementById('strip-content-text')!.textContent!.trim()).toBe('Session expires soon.');
        await expect
            .element(page.getByRole('note', { name: 'Warning Message Strip Closable Session expires soon.' }))
            .toBeInTheDocument();
        const labelled = root.querySelector<HTMLElement>('#labelled')!;
        expect(labelled.getAttribute('aria-labelledby')).toBe('ext');
        expect(labelled.style.width).toBe('300px');
        expect(labelled.style.minWidth).toBe('200px');
    });

    it('types use the semantic colours, their icon and type description', async () => {
        const { strip, hidden, update } = await setup();
        const backgrounds = new Set<string>();
        const glyphs = new Set<string>();
        for (const [type, text] of [
            ['warning', 'Warning Message Strip'],
            ['error', 'Error Message Strip'],
            ['success', 'Success Message Strip'],
            ['information', 'Information Message Strip']
        ] as const) {
            await update({ type });
            expect(hidden().textContent).toBe(`${text} Closable`);
            backgrounds.add(getComputedStyle(strip()).backgroundColor);
            const iconBox = strip().querySelector('div[aria-hidden=true]')!;
            expect(iconBox).not.toBeNull();
            glyphs.add(iconBox.querySelector('[data-glyph]')!.getAttribute('data-glyph')!);
        }
        expect(backgrounds.size).toBe(4);
        expect(glyphs.size).toBe(4);
        await update({ type: null });
        expect(hidden().textContent).toBe('Message strip');
        expect(strip().querySelector('div[aria-hidden=true]')).toBeNull();
    });

    it('noIcon hides the icon; a custom icon replaces it', async () => {
        const { root, strip, update } = await setup();
        const withIcon = parseFloat(getComputedStyle(strip()).paddingInlineStart);
        await update({ noIcon: true });
        expect(strip().querySelector('div[aria-hidden=true]')).toBeNull();
        expect(parseFloat(getComputedStyle(strip()).paddingInlineStart)).toBeLessThan(withIcon);
        const custom = root.querySelectorAll('#custom div[aria-hidden=true] [data-glyph]');
        expect(custom).toHaveLength(1);
        expect(root.querySelectorAll('#custom [data-glyph]')).toHaveLength(1);
        // the custom icon replaces the type icon too
        await update({ noIcon: false, icon: <Icon glyph="survey" /> });
        expect(strip().querySelectorAll('[data-glyph]')).toHaveLength(2); // icon and close button
        expect(strip().querySelector('div[aria-hidden=true] [data-glyph]')!.getAttribute('data-glyph')).toBe(
            custom[0]!.getAttribute('data-glyph')
        );
    });

    it('indication colours change the background and text colour', async () => {
        const { strip, update } = await setup();
        const text = () => document.getElementById('strip-content-text')!;
        const base = getComputedStyle(strip()).backgroundColor;
        await update({ indicationColor: '6' });
        const strong = getComputedStyle(strip()).backgroundColor;
        const strongText = getComputedStyle(text()).color;
        expect(strong).not.toBe(base);
        await update({ indicationColor: '6b' });
        expect(getComputedStyle(strip()).backgroundColor).not.toBe(strong);
        expect(getComputedStyle(text()).color).not.toBe(strongText);
    });

    it('the dismiss button closes the strip and calls onDismiss', async () => {
        const { strip, close, onDismiss } = await setup();
        expect(close().getAttribute('aria-label')).toBe('Warning Message Strip Close');
        expect(close().title).toBe('Warning Message Strip Close');
        expect(close().getAttribute('aria-controls')).toBe('strip');
        await userEvent.click(close());
        expect(onDismiss).toHaveBeenCalledTimes(1);
        expect(visible(strip())).toBe(false);
    });

    it('the dismiss button works from the keyboard and takes a custom title', async () => {
        const { close, onDismiss } = await setup({ dismissBtnTitle: 'Hide message' });
        expect(close().getAttribute('aria-label')).toBe('Hide message');
        close().focus();
        await userEvent.keyboard('{Enter}');
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('dismissible=false hides the dismiss button', async () => {
        const { strip, hidden, update } = await setup({ dismissible: false });
        expect(strip().querySelector('button')).toBeNull();
        expect(hidden().textContent).toBe('Warning Message Strip');
        await update({ dismissible: true });
        expect(strip().querySelector('button')).not.toBeNull();
    });

    it('actionsRef.open() shows a dismissed strip again', async () => {
        const { strip, close, actions } = await setup();
        await userEvent.click(close());
        expect(visible(strip())).toBe(false);
        actions.current!.open();
        await expect.poll(() => visible(strip())).toBe(true);
    });

    it('actionsRef.dismiss() calls onDismiss and hides the strip', async () => {
        const { strip, onDismiss, actions } = await setup();
        actions.current!.dismiss();
        await expect.poll(() => visible(strip())).toBe(false);
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('open, defaultOpen and onOpenChange: controlled and uncontrolled', async () => {
        const onOpenChange = vi.fn();
        const { strip, close, update } = await setup({ defaultOpen: false, onOpenChange });
        expect(visible(strip())).toBe(false);
        await update({ open: true });
        expect(visible(strip())).toBe(true);
        // controlled: the dismiss button asks the parent to close it
        await userEvent.click(close());
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
        expect(visible(strip())).toBe(true);
        await update({ open: false });
        expect(visible(strip())).toBe(false);
    });

    it('aria-label sets the aria-label and marginBottom the bottom margin', async () => {
        const { root, strip, update } = await setup();
        expect(strip().hasAttribute('aria-label')).toBe(false);
        await update({ 'aria-label': 'Session message' });
        expect(strip().getAttribute('aria-label')).toBe('Session message');
        expect(getComputedStyle(root.querySelector<HTMLElement>('#labelled')!).marginBottom).toBe('12px');
    });

    it('the dismiss button label follows dismissBtnTitle changes and falls back when it is empty', async () => {
        const { close, update } = await setup({ dismissBtnTitle: 'Hide message' });
        expect(close().getAttribute('aria-label')).toBe('Hide message');
        await update({ dismissBtnTitle: 'Close the warning' });
        expect(close().getAttribute('aria-label')).toBe('Close the warning');
        expect(close().title).toBe('Close the warning');
        await update({ dismissBtnTitle: '' });
        expect(close().getAttribute('aria-label')).toBe('Warning Message Strip Close');
        expect(close().title).toBe('Warning Message Strip Close');
        await update({ dismissBtnTitle: null, type: null });
        expect(close().getAttribute('aria-label')).toBe('Close');
    });

    it('passes className, style, native props and the ref through; dismissButtonProps reach the button', async () => {
        const ref = createRef<HTMLDivElement>();
        const onClick = vi.fn();
        const { strip, close, onDismiss } = await setup({
            ref,
            className: 'custom-class',
            style: { maxWidth: '500px' },
            'data-sample': 'Sample',
            dismissButtonProps: { 'data-sample': 'Button', onClick } as MessageStripProps['dismissButtonProps']
        } as MessageStripProps);
        expect(ref.current).toBe(strip());
        expect(strip().classList.contains('custom-class')).toBe(true);
        expect(strip().style.maxWidth).toBe('500px');
        expect(strip().getAttribute('data-sample')).toBe('Sample');
        expect(close().getAttribute('data-sample')).toBe('Button');
        await userEvent.click(close());
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('links in the text are spaced, and take the contrast or subtle colour on indication colours', async () => {
        const screen = await render(
            <div>
                <MessageStrip id="plain" type="information">
                    Text <Link href="#">Link</Link>
                </MessageStrip>
                <MessageStrip id="strong" indicationColor="1">
                    Text <Link href="#">Link</Link>
                </MessageStrip>
                <MessageStrip id="light" indicationColor="1b">
                    Text <Link href="#">Link</Link>
                </MessageStrip>
                <span id="probe" />
            </div>
        );
        const root = screen.container;
        const probe = root.querySelector<HTMLElement>('#probe')!;
        const resolve = (variable: string) => {
            probe.style.color = `var(${variable})`;
            return getComputedStyle(probe).color;
        };
        const link = (id: string) => root.querySelector<HTMLElement>(`#${id} a`)!;
        expect(getComputedStyle(link('plain')).marginInlineStart).toBe('4px');
        expect(getComputedStyle(link('plain')).paddingInlineEnd).toBe('4px');
        expect(getComputedStyle(link('plain')).color).toBe(resolve('--sapLinkColor'));
        expect(getComputedStyle(link('strong')).color).toBe(resolve('--sapContent_ContrastTextColor'));
        expect(getComputedStyle(link('light')).color).toBe(resolve('--sapLink_SubtleColor'));
    });

    describe('auto dismiss', () => {
        async function autoSetup(props: MessageStripProps) {
            const onDismiss = vi.fn();
            let setOpen!: (open: boolean) => void;
            function Host() {
                const [open, set] = useState(false);
                setOpen = set;
                return (
                    <div>
                        <MessageStrip
                            id="auto"
                            type="information"
                            autoDismiss
                            open={open}
                            onOpenChange={set}
                            onDismiss={onDismiss}
                            {...props}
                        >
                            Auto dismissed
                        </MessageStrip>
                        <button id="outside">Outside</button>
                    </div>
                );
            }
            const screen = await render(<Host />);
            const root = screen.container;
            await userEvent.hover(root.querySelector<HTMLElement>('#outside')!);
            return {
                root,
                onDismiss,
                strip: () => root.querySelector<HTMLElement>('#auto')!,
                open: async () => {
                    setOpen(true);
                    await frame();
                }
            };
        }

        it('starts hidden, opening shows it and it dismisses itself after the duration', async () => {
            const { strip, open, onDismiss } = await autoSetup({ duration: 600 });
            expect(visible(strip())).toBe(false);
            await open();
            expect(visible(strip())).toBe(true);
            await wait(200);
            expect(visible(strip())).toBe(true);
            await wait(600);
            expect(visible(strip())).toBe(false);
            expect(onDismiss).toHaveBeenCalledTimes(1);
        });

        it('uncontrolled: starts hidden and actionsRef.open() starts the timer', async () => {
            const actions = createRef<MessageStripActions>();
            const onDismiss = vi.fn();
            const screen = await render(
                <MessageStrip id="auto" autoDismiss duration={300} actionsRef={actions} onDismiss={onDismiss}>
                    Auto
                </MessageStrip>
            );
            const strip = screen.container.querySelector<HTMLElement>('#auto')!;
            expect(visible(strip)).toBe(false);
            actions.current!.open();
            await expect.poll(() => visible(strip)).toBe(true);
            await wait(500);
            expect(visible(strip)).toBe(false);
            expect(onDismiss).toHaveBeenCalledTimes(1);
        });

        it('mousePersist pauses the timer while hovered and restarts it on leave', async () => {
            const { root, strip, open } = await autoSetup({ duration: 1000, mousePersist: true });
            await open();
            await userEvent.hover(strip());
            await wait(1300);
            expect(visible(strip())).toBe(true);
            await userEvent.hover(root.querySelector<HTMLElement>('#outside')!);
            await wait(400);
            expect(visible(strip())).toBe(true);
            await wait(900);
            expect(visible(strip())).toBe(false);
        });

        it('without mousePersist hovering does not keep it open', async () => {
            const { strip, open, onDismiss } = await autoSetup({ duration: 1000 });
            await open();
            await userEvent.hover(strip());
            await wait(1300);
            expect(visible(strip())).toBe(false);
            expect(onDismiss).toHaveBeenCalledTimes(1);
        });

        it('does not dismiss when not dismissible or with a negative duration', async () => {
            const a = await autoSetup({ duration: 200, dismissible: false });
            const b = await autoSetup({ duration: -1 });
            await a.open();
            await b.open();
            await wait(400);
            expect(visible(a.strip())).toBe(true);
            expect(visible(b.strip())).toBe(true);
            expect(a.onDismiss).not.toHaveBeenCalled();
        });
    });

    describe('MessageStripAlertProvider', () => {
        afterEach(() => page.viewport(1280, 800));

        const positions: MessageStripAlertPosition[] = [
            'top-start',
            'top-middle',
            'top-end',
            'bottom-start',
            'bottom-middle',
            'bottom-end'
        ];

        const alerts = () => [...document.querySelectorAll<HTMLElement>('[data-message-strip-alerts] [role=alert]')];

        async function alertSetup() {
            const service: { current: MessageStripAlerts | null } = { current: null };
            function Capture() {
                service.current = useMessageStripAlerts();
                return <span id="count">{service.current.openAlerts.length}</span>;
            }
            await render(
                <MessageStripAlertProvider>
                    <Capture />
                </MessageStripAlertProvider>
            );
            const stable = async () => {
                await frame();
                await frame();
            };
            return { service: () => service.current!, stable };
        }

        it('opens alerts in the six positions', async () => {
            const { service, stable } = await alertSetup();
            for (const position of positions) {
                service().open({ content: position, position, messageStrip: { type: 'information', duration: 0 } });
            }
            await stable();
            expect(alerts()).toHaveLength(6);
            expect(service().openAlerts).toHaveLength(6);
            const rectOf = (text: string) =>
                alerts()
                    .find((a) => a.textContent!.includes(text))!
                    .querySelector('[role=note]')!
                    .getBoundingClientRect();
            const width = window.innerWidth;
            const height = window.innerHeight;
            for (const position of positions) {
                const rect = rectOf(position);
                const [vertical, horizontal] = position.split('-');
                if (vertical === 'top') expect(rect.top).toBeLessThan(height / 4);
                else expect(rect.bottom).toBeGreaterThan((height * 3) / 4);
                const centre = rect.left + rect.width / 2;
                if (horizontal === 'start') expect(rect.left).toBeLessThan(width / 4);
                else if (horizontal === 'end') expect(rect.right).toBeGreaterThan((width * 3) / 4);
                else expect(Math.abs(centre - width / 2)).toBeLessThan(2);
            }
            service().dismissAll();
            await stable();
            expect(alerts()).toHaveLength(0);
            expect(service().openAlerts).toHaveLength(0);
        });

        it('newest alerts come first, and alerts are announced with role alert', async () => {
            const { service, stable } = await alertSetup();
            service().open({ content: 'First', messageStrip: { duration: 0 } });
            service().open({ content: 'Second', messageStrip: { duration: 0, type: 'success' } });
            await stable();
            const list = alerts();
            expect(list.map((a) => a.textContent!.includes('Second'))).toEqual([true, false]);
            expect(list.every((a) => a.getAttribute('role') === 'alert')).toBe(true);
            expect(list[0]!.querySelector('[role=note]')!.getAttribute('aria-labelledby')).toBeTruthy();
            await expect.element(page.getByRole('alert').first()).toBeInTheDocument();
            service().dismissAll();
        });

        it('the dismiss button and the ref close an alert; afterDismissed and onDismiss fire', async () => {
            const { service, stable } = await alertSetup();
            const onDismiss = vi.fn();
            const afterDismissed = vi.fn();
            const ref = service().open({ content: 'Closable', messageStrip: { duration: 0, onDismiss } });
            void ref.afterDismissed.then(afterDismissed);
            const other = service().open({ content: 'Other', messageStrip: { duration: 0 } });
            await stable();
            const closable = alerts().find((a) => a.textContent!.includes('Closable'))!;
            await userEvent.click(closable.querySelector('button')!);
            await stable();
            expect(onDismiss).toHaveBeenCalledTimes(1);
            expect(afterDismissed).toHaveBeenCalledTimes(1);
            expect(ref.dismissed).toBe(true);
            expect(alerts()).toHaveLength(1);
            other.dismiss();
            await stable();
            expect(alerts()).toHaveLength(0);
        });

        it('alerts dismiss themselves after the duration', async () => {
            const { service, stable } = await alertSetup();
            service().open({ content: 'Short', messageStrip: { duration: 500 } });
            await stable();
            expect(alerts()).toHaveLength(1);
            expect(visible(alerts()[0]!.querySelector('[role=note]'))).toBe(true);
            await wait(700);
            await stable();
            expect(alerts()).toHaveLength(0);
        });

        it('renders function and component content; components can read the ref', async () => {
            const { service, stable } = await alertSetup();
            function AlertContent() {
                const ref = useMessageStripAlertRef();
                return (
                    <button id="in-alert" onClick={() => ref?.dismiss()}>
                        Close me
                    </button>
                );
            }
            service().open({
                content: (ref) => <span className="fn">{ref.dismissed ? 'closed' : 'Function alert'}</span>,
                messageStrip: { duration: 0 }
            });
            service().open({ content: <AlertContent />, messageStrip: { duration: 0 } });
            await stable();
            expect(document.querySelector('[role=alert] .fn')!.textContent).toBe('Function alert');
            await userEvent.click(document.querySelector<HTMLElement>('#in-alert')!);
            await stable();
            expect(alerts()).toHaveLength(1);
            expect(document.querySelector('#in-alert')).toBeNull();
            service().dismissAll();
        });

        it('passes strip props to the alerts', async () => {
            const { service, stable } = await alertSetup();
            service().open({
                content: 'Styled',
                messageStrip: { duration: 0, type: 'error', dismissible: false, className: 'alert-class' }
            });
            await stable();
            const note = alerts()[0]!.querySelector<HTMLElement>('[role=note]')!;
            expect(note.classList.contains('alert-class')).toBe(true);
            expect(note.querySelector('button')).toBeNull();
            expect(note.textContent).toContain('Error Message Strip');
            service().dismissAll();
        });

        it('collapses all positions to the middle on narrow screens', async () => {
            await page.viewport(500, 800);
            await frame();
            const { service, stable } = await alertSetup();
            service().open({ content: 'Start', position: 'top-start', messageStrip: { duration: 0 } });
            service().open({ content: 'End', position: 'bottom-end', messageStrip: { duration: 0 } });
            await stable();
            for (const alert of alerts()) {
                const rect = alert.querySelector('[role=note]')!.getBoundingClientRect();
                const centre = rect.left + rect.width / 2;
                expect(Math.abs(centre - window.innerWidth / 2)).toBeLessThan(2);
            }
            service().dismissAll();
            await stable();
        });

        it('throws outside a provider', async () => {
            function Outside() {
                useMessageStripAlerts();
                return null;
            }
            const error = vi.spyOn(console, 'error').mockImplementation(() => {});
            await expect(render(<Outside />)).rejects.toThrow(/MessageStripAlertProvider/);
            error.mockRestore();
        });
    });
});
