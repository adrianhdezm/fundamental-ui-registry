import { Dialog } from '@base-ui/react/dialog';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    PLACEMENTS,
    Popover,
    PopoverBody,
    PopoverBodyFooter,
    PopoverBodyHeader,
    PopoverClose,
    PopoverTitle,
    PopoverTrigger,
    createPopoverHandle,
    getPlacement,
    normalizeTriggers,
    toPlacement,
    arrowEdge,
    type Placement,
    type PopoverBodyProps,
    type PopoverProps
} from './popover';

interface HostProps extends PopoverProps {
    body?: PopoverBodyProps;
    triggerWidth?: number;
    contentWidth?: string;
    contentHeight?: string;
    offsetTop?: string;
    offsetStart?: string;
    header?: boolean;
    /** A div as trigger (Angular's non-focusable control) instead of a button. */
    divTrigger?: boolean;
    rtl?: boolean;
}

/** Mirrors the Angular test host: a trigger with two buttons in the body, and buttons outside. */
function Host({
    body,
    triggerWidth = 80,
    contentWidth = 'auto',
    contentHeight = 'auto',
    offsetTop = '100px',
    offsetStart = '400px',
    header = false,
    divTrigger = false,
    rtl = false,
    ...popover
}: HostProps) {
    const ui = (
        <div dir={rtl ? 'rtl' : 'ltr'}>
            <button data-testid="outside">Outside</button>
            <div data-testid="plain" style={{ height: 40 }}>
                Plain text
            </div>
            <div style={{ paddingTop: offsetTop, paddingInlineStart: offsetStart }}>
                <Popover {...popover}>
                    {divTrigger ? (
                        <PopoverTrigger
                            nativeButton={false}
                            render={<div data-testid="trigger" />}
                            style={{ width: triggerWidth, height: 36 }}
                        >
                            Control
                        </PopoverTrigger>
                    ) : (
                        <PopoverTrigger data-testid="trigger" style={{ width: triggerWidth, height: 36 }}>
                            Open
                        </PopoverTrigger>
                    )}
                    <PopoverBody aria-label="Details" data-testid="surface" {...body}>
                        {header && (
                            <PopoverBodyHeader data-testid="header" style={{ height: 40 }}>
                                Header
                            </PopoverBodyHeader>
                        )}
                        <div data-testid="content" style={{ padding: 8, width: contentWidth, height: contentHeight }}>
                            <button data-testid="first">First</button>
                            <button data-testid="last">Last</button>
                        </div>
                        {header && (
                            <PopoverBodyFooter data-testid="footer" style={{ height: 40 }}>
                                Footer
                            </PopoverBodyFooter>
                        )}
                    </PopoverBody>
                </Popover>
            </div>
            <button data-testid="other">Other</button>
        </div>
    );
    return rtl ? <DirectionProvider direction="rtl">{ui}</DirectionProvider> : ui;
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const stable = async () => {
    await frame();
    await frame();
    await wait(20);
};

async function setup(initial: HostProps = {}) {
    let current = initial;
    const screen = await render(<Host {...current} />);
    await stable();
    const el = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
    return {
        screen,
        el,
        trigger: () => el('trigger'),
        surface: () => document.querySelector<HTMLElement>('[data-testid="surface"]'),
        update: async (change: Partial<HostProps>) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
            await stable();
        }
    };
}

/** Clicks the trigger and waits for the body to open (or `false`: to be closed). */
async function click(target: HTMLElement) {
    await userEvent.click(target);
    await stable();
}

const rect = (el: Element) => el.getBoundingClientRect();
/** Positions match within the sub-pixel rounding of the positioner. */
const near = (actual: number, expected: number, tolerance = 1.5) =>
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);

afterEach(() => {
    document.documentElement.removeAttribute('dir');
});

describe('Popover', () => {
    describe('opening and closing', () => {
        it('opens on click into a portal with a labelled dialog body', async () => {
            const onOpenChange = vi.fn();
            const { screen, trigger, surface } = await setup({ onOpenChange });
            expect(surface()).toBeNull();
            expect(trigger().tabIndex).toBe(0);
            expect(trigger().getAttribute('aria-expanded')).toBe('false');
            expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
            await click(trigger());
            expect(surface()).not.toBeNull();
            expect(screen.container.contains(surface())).toBe(false);
            expect(onOpenChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ reason: 'trigger-press' }));
            expect(surface()!.getAttribute('role')).toBe('dialog');
            expect(surface()!.getAttribute('aria-label')).toBe('Details');
            expect(trigger().getAttribute('aria-expanded')).toBe('true');
            expect(trigger().getAttribute('aria-controls')).toBe(surface()!.id);
            expect(surface()!.textContent).toContain('First');

            // a second click on the trigger closes it
            await click(trigger());
            expect(surface()).toBeNull();
            expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'trigger-press' }));
        });

        it('closes on outside click and calls onClickOutside', async () => {
            const onClickOutside = vi.fn();
            const { el, trigger, surface } = await setup({ onClickOutside });
            await click(trigger());
            await click(el('outside'));
            expect(surface()).toBeNull();
            expect(onClickOutside).toHaveBeenCalledTimes(1);
            // focus moved elsewhere, so it is not pulled back
            expect(document.activeElement).toBe(el('outside'));
        });

        it('closes on Escape, calls onEscapeKey and returns focus to the trigger', async () => {
            const onEscapeKey = vi.fn();
            const { el, trigger, surface } = await setup({ onEscapeKey });
            await click(trigger());
            expect(document.activeElement).toBe(el('first'));
            await userEvent.keyboard('{Escape}');
            await stable();
            expect(surface()).toBeNull();
            expect(onEscapeKey).toHaveBeenCalledTimes(1);
            expect(document.activeElement).toBe(trigger());
        });

        it('closeOnOutsideClick=false and closeOnEscapeKey=false keep it open', async () => {
            const onClickOutside = vi.fn();
            const { el, trigger, surface } = await setup({
                closeOnOutsideClick: false,
                closeOnEscapeKey: false,
                onClickOutside
            });
            await click(trigger());
            await click(el('plain'));
            expect(surface()).not.toBeNull();
            // the callback still reports the outside click
            expect(onClickOutside).toHaveBeenCalledTimes(1);
            // a press on a focusable element outside moves focus out first: that does not close it either
            await click(el('outside'));
            expect(surface()).not.toBeNull();
            expect(onClickOutside).toHaveBeenCalledTimes(2);
            el('first').focus();
            await userEvent.keyboard('{Escape}');
            await stable();
            expect(surface()).not.toBeNull();
        });

        it('opens with Alt+ArrowDown on the trigger', async () => {
            const { trigger, surface } = await setup();
            trigger().focus();
            await userEvent.keyboard('{ArrowDown}');
            await stable();
            expect(surface()).toBeNull();
            await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
            await stable();
            expect(surface()).not.toBeNull();
        });

        it('opens and closes on hover with configured triggers', async () => {
            const { el, trigger, surface } = await setup({ triggers: ['mouseenter', 'mouseleave'] });
            trigger().click();
            await stable();
            // click is no trigger now
            expect(surface()).toBeNull();
            await userEvent.hover(trigger());
            await wait(50);
            await stable();
            expect(surface()).not.toBeNull();
            // moving into the body keeps it open
            await userEvent.hover(el('first'));
            await wait(100);
            await stable();
            expect(surface()).not.toBeNull();
            await userEvent.hover(el('plain'));
            await wait(150);
            await stable();
            expect(surface()).toBeNull();
        });

        it('a disabled popover does not open and disables its trigger', async () => {
            const { trigger, surface, update } = await setup({ disabled: true });
            trigger().click();
            await stable();
            expect(surface()).toBeNull();
            expect((trigger() as HTMLButtonElement).disabled).toBe(true);
            // an open popover closes once disabled
            await update({ disabled: false });
            await click(trigger());
            expect(surface()).not.toBeNull();
            await update({ disabled: true });
            expect(surface()).toBeNull();
        });
    });

    describe('open', () => {
        it('controlled open opens and closes; onOpenChange reports user changes', async () => {
            function Controlled() {
                const [open, setOpen] = useState(false);
                return (
                    <>
                        <button data-testid="open" onClick={() => setOpen(true)}>
                            Open popover
                        </button>
                        <button data-testid="close" onClick={() => setOpen(false)}>
                            Close popover
                        </button>
                        <span data-testid="state">{String(open)}</span>
                        <Popover open={open} onOpenChange={setOpen} focusAutoCapture={false}>
                            <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
                            <PopoverBody aria-label="Details" data-testid="surface">
                                <button>Inside</button>
                            </PopoverBody>
                        </Popover>
                    </>
                );
            }
            await render(<Controlled />);
            const el = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
            await click(el('open')!);
            expect(el('surface')).not.toBeNull();
            // the body is positioned against the trigger, which did not open it
            near(rect(el('surface')!).top, rect(el('trigger')!).bottom);
            await click(el('close')!);
            await expect.poll(() => el('surface')).toBeNull();

            await click(el('trigger')!);
            expect(el('state')!.textContent).toBe('true');
            await userEvent.keyboard('{Escape}');
            await stable();
            expect(el('state')!.textContent).toBe('false');
        });

        it('defaultOpen opens the popover on creation', async () => {
            const { surface } = await setup({ defaultOpen: true });
            expect(surface()).not.toBeNull();
        });

        it('a handle opens and closes it from code and connects a trigger outside', async () => {
            const handle = createPopoverHandle();
            await render(
                <>
                    <PopoverTrigger handle={handle} data-testid="external">
                        More
                    </PopoverTrigger>
                    <Popover handle={handle}>
                        <PopoverBody role="region" aria-label="More" data-testid="surface">
                            Plain text content
                        </PopoverBody>
                    </Popover>
                </>
            );
            const trigger = document.querySelector<HTMLElement>('[data-testid="external"]')!;
            const surface = () => document.querySelector<HTMLElement>('[data-testid="surface"]');
            expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
            await click(trigger);
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            expect(trigger.getAttribute('aria-controls')).toBe(surface()!.id);
            expect(surface()!.textContent!.trim()).toBe('Plain text content');
            expect(surface()!.getAttribute('role')).toBe('region');
            near(rect(surface()!).top, rect(trigger).bottom);
            await userEvent.keyboard('{Escape}');
            await stable();
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
            await expect.poll(surface).toBeNull();

            handle.open(trigger.id);
            await stable();
            expect(surface()).not.toBeNull();
            handle.close();
            await expect.poll(surface).toBeNull();
        });

        it('setting open to false returns focus to the trigger', async () => {
            const { el, trigger, surface, update } = await setup({ open: true });
            expect(surface()).not.toBeNull();
            expect(document.activeElement).toBe(el('first'));
            await update({ open: false });
            expect(surface()).toBeNull();
            expect(document.activeElement).toBe(trigger());
        });
    });

    describe('position', () => {
        it('opens below the trigger aligned to its start by default', async () => {
            const { trigger, surface } = await setup();
            await click(trigger());
            near(rect(surface()!).top, rect(trigger()).bottom);
            near(rect(surface()!).left, rect(trigger()).left);
        });

        it('follows the placement prop, also while open', async () => {
            const { trigger, surface, update } = await setup({ offsetTop: '300px', placement: 'top-end' });
            await click(trigger());
            near(rect(surface()!).bottom, rect(trigger()).top);
            near(rect(surface()!).right, rect(trigger()).right);

            await update({ placement: 'right' });
            near(rect(surface()!).left, rect(trigger()).right);
            const middle = (r: DOMRect) => (r.top + r.bottom) / 2;
            near(middle(rect(surface()!)), middle(rect(trigger())));
            expect(surface()!.getAttribute('data-side')).toBe('right');
        });

        it('flips when there is no room below', async () => {
            const { trigger, surface } = await setup({ offsetTop: '740px' });
            await click(trigger());
            expect(rect(trigger()).bottom).toBeGreaterThan(760);
            near(rect(surface()!).bottom, rect(trigger()).top);
            expect(surface()!.getAttribute('data-side')).toBe('top');
        });

        it('fixedPosition keeps the placement even without room', async () => {
            const { trigger, surface } = await setup({ offsetTop: '740px', fixedPosition: true });
            await click(trigger());
            near(rect(surface()!).top, rect(trigger()).bottom);
        });

        it('follows RTL: start aligns to the right, left/right placements stay physical', async () => {
            document.documentElement.setAttribute('dir', 'rtl');
            const { trigger, surface, update } = await setup({ rtl: true });
            await click(trigger());
            near(rect(surface()!).right, rect(trigger()).right);
            await userEvent.keyboard('{Escape}');
            await stable();

            await update({ placement: 'right' });
            await click(trigger());
            near(rect(surface()!).left, rect(trigger()).right);
        });

        it('sideOffset, alignOffset and anchor move the body', async () => {
            const { el, trigger, surface, update } = await setup({
                sideOffset: 16,
                alignOffset: 10,
                focusAutoCapture: false
            });
            await click(trigger());
            near(rect(surface()!).top, rect(trigger()).bottom + 16);
            near(rect(surface()!).left, rect(trigger()).left + 10);
            // a function of the sizes: over the trigger
            await update({ sideOffset: ({ anchor }) => -anchor.height, alignOffset: 0 });
            near(rect(surface()!).top, rect(trigger()).top);
            // another element as anchor
            await update({ sideOffset: 0, anchor: el('other') });
            near(rect(surface()!).top, rect(el('other')).bottom);
            // at the start of the page: Base UI keeps 5px from the viewport edge
            near(rect(surface()!).left, Math.max(rect(el('other')).left, 5));
        });

        it('position helpers: placements, sides and triggers', () => {
            expect(getPlacement('bottom-start')).toEqual({ side: 'bottom', align: 'start' });
            expect(getPlacement('left')).toEqual({ side: 'left', align: 'center' });
            expect(getPlacement('top-end')).toEqual({ side: 'top', align: 'end' });
            for (const p of PLACEMENTS) {
                const { side, align } = getPlacement(p);
                expect(toPlacement(side, align)).toBe(p);
            }
            expect(arrowEdge('bottom')).toBe('top');
            expect(arrowEdge('right')).toBe('left');
            expect(normalizeTriggers(['click'])).toEqual([{ trigger: 'click', openAction: true, closeAction: true }]);
            expect(normalizeTriggers(['focusin', 'focusout'])).toEqual([
                { trigger: 'focusin', openAction: true, closeAction: false },
                { trigger: 'focusout', openAction: false, closeAction: true }
            ]);
        });
    });

    describe('arrow', () => {
        const arrow = () => document.querySelector<HTMLElement>('[data-testid="surface"] > [aria-hidden="true"]');

        it('has no arrow by default', async () => {
            const { trigger, surface } = await setup();
            await click(trigger());
            expect(arrow()).toBeNull();
            expect(getComputedStyle(surface()!).boxShadow).toContain('2px 8px');
        });

        it('noArrow=false draws an arrow pointing at the trigger and leaves room for it', async () => {
            const { trigger, surface } = await setup({ noArrow: false });
            await click(trigger());
            const after = getComputedStyle(arrow()!, '::after');
            expect(after.content).toBe('""');
            // arrow on top of the body, below a trigger opening downwards
            expect(rect(arrow()!).bottom).toBe(rect(surface()!).top);
            expect(after.borderBottomWidth).toBe('8px');
            expect(after.borderTopWidth).toBe('0px');
            near(rect(surface()!).top - rect(trigger()).bottom, 8);
            // it points at the centre of the trigger
            const center = (r: DOMRect) => (r.left + r.right) / 2;
            near(center(rect(arrow()!)), center(rect(trigger())));
            expect(getComputedStyle(surface()!).boxShadow).toContain('10px 30px');
        });

        it('the arrow moves to the bottom when the popover opens upwards', async () => {
            const { trigger, surface } = await setup({ noArrow: false, placement: 'top' });
            await click(trigger());
            const after = getComputedStyle(arrow()!, '::after');
            expect(after.borderTopWidth).toBe('8px');
            expect(after.borderBottomWidth).toBe('0px');
            expect(rect(arrow()!).top).toBe(rect(surface()!).bottom);
            near(rect(trigger()).top - rect(surface()!).bottom, 8);
            const center = (r: DOMRect) => (r.left + r.right) / 2;
            near(center(rect(arrow()!)), center(rect(surface()!)));
        });

        it('arrows on the start and end sides point sideways', async () => {
            const { trigger, surface, update } = await setup({ noArrow: false, placement: 'right-start' });
            await click(trigger());
            expect(getComputedStyle(arrow()!, '::after').borderRightWidth).toBe('8px');
            near(rect(arrow()!).right, rect(surface()!).left, 0.5);
            const middle = (r: DOMRect) => (r.top + r.bottom) / 2;
            near(middle(rect(arrow()!)), middle(rect(trigger())));
            await update({ placement: 'left' });
            expect(getComputedStyle(arrow()!, '::after').borderLeftWidth).toBe('8px');
            near(rect(arrow()!).left, rect(surface()!).right, 0.5);
        });
    });

    describe('focus', () => {
        it('moves focus into the body and traps Tab inside it', async () => {
            const { el, trigger } = await setup();
            await click(trigger());
            expect(document.activeElement).toBe(el('first'));
            await userEvent.tab();
            expect(document.activeElement).toBe(el('last'));
            await userEvent.tab();
            expect(document.activeElement).toBe(el('first'));
            await userEvent.tab({ shift: true });
            expect(document.activeElement).toBe(el('last'));
        });

        it('traps focus without aria-hidden focusable elements in the body', async () => {
            const { el, trigger, surface } = await setup();
            await click(trigger());
            // axe aria-hidden-focus: nothing hidden from assistive technology may take focus
            const hiddenFocusable = [
                ...surface()!.querySelectorAll<HTMLElement>('[aria-hidden="true"], [aria-hidden="true"] *')
            ].filter((node) => node.tabIndex >= 0);
            expect(hiddenFocusable).toEqual([]);
            // Tab from a non-tabbable element inside the body moves on to the next tabbable one
            const text = el('content');
            text.tabIndex = -1;
            text.focus();
            await userEvent.tab();
            expect(document.activeElement).toBe(el('first'));
            await userEvent.tab({ shift: true });
            expect(document.activeElement).toBe(el('last'));
        });

        it('focusTrapped=false lets Tab leave the body', async () => {
            const { el, trigger, surface } = await setup({ focusTrapped: false });
            await click(trigger());
            el('last').focus();
            await userEvent.tab();
            await stable();
            expect(surface()?.contains(document.activeElement) ?? false).toBe(false);
        });

        it('focusAutoCapture=false leaves focus on the trigger', async () => {
            const { trigger, surface } = await setup({ focusAutoCapture: false });
            await click(trigger());
            expect(surface()).not.toBeNull();
            expect(document.activeElement).toBe(trigger());
        });

        it('restoreFocusOnClose=false does not return focus to the trigger', async () => {
            const { trigger, surface } = await setup({ restoreFocusOnClose: false });
            await click(trigger());
            await userEvent.keyboard('{Escape}');
            await stable();
            expect(surface()).toBeNull();
            expect(document.activeElement).not.toBe(trigger());
        });

        it('initialFocus on the body picks the element to focus', async () => {
            const last = createRef<HTMLButtonElement>();
            function WithInitialFocus() {
                return (
                    <Popover>
                        <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
                        <PopoverBody aria-label="Details" initialFocus={last}>
                            <button>First</button>
                            <button ref={last}>Last</button>
                        </PopoverBody>
                    </Popover>
                );
            }
            await render(<WithInitialFocus />);
            await click(document.querySelector<HTMLElement>('[data-testid="trigger"]')!);
            expect(document.activeElement).toBe(last.current);
        });

        it('an outside click on a non-focusable element returns focus to the trigger', async () => {
            const { el, trigger, surface } = await setup();
            await click(trigger());
            expect(document.activeElement).toBe(el('first'));
            await click(el('plain'));
            expect(surface()).toBeNull();
            expect(document.activeElement).toBe(trigger());
        });
    });

    describe('fillControlMode', () => {
        it('at-least makes the body at least as wide as the trigger', async () => {
            const { trigger, surface } = await setup({ fillControlMode: 'at-least', triggerWidth: 300 });
            await click(trigger());
            near(rect(surface()!).width, 300);
        });

        it('at-least still grows with wider content', async () => {
            const { trigger, surface } = await setup({
                fillControlMode: 'at-least',
                triggerWidth: 100,
                contentWidth: '250px'
            });
            await click(trigger());
            expect(rect(surface()!).width).toBeGreaterThanOrEqual(250);
        });

        it('equal makes the body exactly as wide as the trigger and follows it', async () => {
            const { trigger, surface, update } = await setup({
                fillControlMode: 'equal',
                triggerWidth: 200,
                contentWidth: '400px'
            });
            await click(trigger());
            near(rect(surface()!).width, 200);
            await update({ triggerWidth: 260 });
            // the body animates its size
            await wait(250);
            near(rect(surface()!).width, 260);
        });

        it('maxWidth caps the filled width', async () => {
            const { trigger, surface } = await setup({ fillControlMode: 'equal', triggerWidth: 300, maxWidth: 180 });
            await click(trigger());
            near(rect(surface()!).width, 180);
        });

        it('fit-content sizes the body to its content', async () => {
            const { trigger, surface } = await setup({ fillControlMode: 'fit-content', triggerWidth: 300 });
            await click(trigger());
            expect(rect(surface()!).width).toBeLessThan(300);
        });
    });

    describe('body options', () => {
        it('header and footer stay in place while the body scrolls', async () => {
            const { el, trigger, surface } = await setup({
                header: true,
                body: { maxHeight: '200px' },
                contentHeight: '600px'
            });
            await click(trigger());
            const scroller = el('content').parentElement!;
            expect(rect(surface()!).height).toBeLessThanOrEqual(201);
            const headerTop = rect(el('header')).top;
            const footerBottom = rect(el('footer')).bottom;
            near(headerTop, rect(surface()!).top);
            near(footerBottom, rect(surface()!).bottom);
            scroller.scrollTop = 200;
            await frame();
            expect(scroller.scrollTop).toBe(200);
            near(rect(el('header')).top, headerTop);
            near(rect(el('footer')).bottom, footerBottom);
        });

        it('body minWidth, minHeight, maxWidth and maxHeight size the body', async () => {
            const { trigger, surface, update } = await setup({ body: { minWidth: '300px', minHeight: '250px' } });
            await click(trigger());
            near(rect(surface()!).width, 300);
            near(rect(surface()!).height, 250);
            await userEvent.keyboard('{Escape}');
            await stable();

            await update({
                body: { maxHeight: '150px', maxWidth: '120px' },
                contentHeight: '400px',
                contentWidth: '400px'
            });
            await click(trigger());
            near(rect(surface()!).height, 150);
            near(rect(surface()!).width, 120);
        });

        it('className is added to the body and wins over the surface colour', async () => {
            const { trigger, surface } = await setup({ body: { className: 'bg-sap-information-background' } });
            await click(trigger());
            expect(surface()!.classList).toContain('bg-sap-information-background');
            expect(surface()!.classList).not.toContain('bg-sap-group-content-background');
            await wait(200);
            const reference = document.createElement('div');
            reference.className = 'bg-sap-information-background';
            document.body.appendChild(reference);
            expect(getComputedStyle(surface()!).backgroundColor).toBe(getComputedStyle(reference).backgroundColor);
            reference.remove();
        });

        it('resizable shows a handle that resizes the body', async () => {
            const { trigger, surface, update } = await setup();
            await click(trigger());
            expect(surface()!.querySelector('[role="presentation"]')).toBeNull();
            await userEvent.keyboard('{Escape}');
            await stable();

            await update({ resizable: true });
            await click(trigger());
            const handle = surface()!.querySelector<HTMLElement>('[role="presentation"][aria-hidden="true"]')!;
            expect(handle).not.toBeNull();
            // the resize-corner glyph
            expect(getComputedStyle(handle, '::after').content).toBe('""');
            const before = rect(surface()!);
            const h = rect(handle);
            const start = { clientX: h.left + 4, clientY: h.top + 4, pointerId: 1, bubbles: true, isPrimary: true };
            handle.dispatchEvent(new PointerEvent('pointerdown', { ...start, buttons: 1 }));
            handle.dispatchEvent(
                new PointerEvent('pointermove', {
                    ...start,
                    buttons: 1,
                    clientX: start.clientX + 60,
                    clientY: start.clientY + 40
                })
            );
            handle.dispatchEvent(new PointerEvent('pointerup', start));
            await stable();
            await wait(200);
            near(rect(surface()!).width, before.width + 60);
            near(rect(surface()!).height, before.height + 40);
            // a new opening starts at the natural size
            await userEvent.keyboard('{Escape}');
            await stable();
            await click(trigger());
            await wait(200);
            near(rect(surface()!).width, before.width);
        });

        it('the resize handle sits in the corner away from the trigger, as in fundamental-styles', async () => {
            const { trigger, surface, update } = await setup({
                resizable: true,
                offsetTop: '300px',
                focusAutoCapture: false
            });
            const cases: [Placement, string, string][] = [
                ['bottom-start', 'bottom-right', 'se-resize'],
                ['bottom-end', 'bottom-left', 'sw-resize'],
                ['top', 'top-right', 'ne-resize'],
                ['top-end', 'top-left', 'nw-resize'],
                ['left-start', 'bottom-left', 'sw-resize'],
                ['right-end', 'top-right', 'ne-resize']
            ];
            for (const [placement, corner, cursor] of cases) {
                await update({ placement, open: true });
                const handle = surface()!.querySelector<HTMLElement>('[role="presentation"]')!;
                expect(handle.dataset['corner'], placement).toBe(corner);
                expect(getComputedStyle(handle).cursor, placement).toBe(cursor);
                const [v, h] = corner.split('-') as ['top' | 'bottom', 'left' | 'right'];
                near(rect(handle)[v], rect(surface()!)[v] + (v === 'top' ? -8 : 8));
                near(rect(handle)[h], rect(surface()!)[h] + (h === 'left' ? -8 : 8));
            }
            void trigger;
        });

        it('in RTL the handle of a start-aligned body is on its left', async () => {
            document.documentElement.setAttribute('dir', 'rtl');
            const { surface } = await setup({ resizable: true, rtl: true, defaultOpen: true });
            await stable();
            const handle = surface()!.querySelector<HTMLElement>('[role="presentation"]')!;
            expect(handle.dataset['corner']).toBe('bottom-left');
        });

        it('disableScrollbar removes the scroll wrapper', async () => {
            const { el, trigger, surface, update } = await setup();
            await click(trigger());
            const wrapper = el('content').parentElement!;
            expect(wrapper).not.toBe(surface());
            expect(getComputedStyle(wrapper).overflow).toBe('auto');
            await userEvent.keyboard('{Escape}');
            await stable();

            await update({ disableScrollbar: true });
            await click(trigger());
            expect(el('content').parentElement).toBe(surface());
        });

        it('role and aria-labelledby label the body; PopoverTitle labels it too', async () => {
            const { trigger, surface } = await setup({
                body: { role: 'menu', 'aria-label': undefined, 'aria-labelledby': 'outside-label' }
            });
            await click(trigger());
            expect(surface()!.getAttribute('role')).toBe('menu');
            expect(surface()!.getAttribute('aria-labelledby')).toBe('outside-label');
            await userEvent.keyboard('{Escape}');
            await stable();

            function Titled() {
                return (
                    <Popover defaultOpen>
                        <PopoverTrigger>Open</PopoverTrigger>
                        <PopoverBody data-testid="titled">
                            <PopoverTitle>Details</PopoverTitle>
                        </PopoverBody>
                    </Popover>
                );
            }
            await render(<Titled />);
            await stable();
            const titled = document.querySelector<HTMLElement>('[data-testid="titled"]')!;
            const title = document.getElementById(titled.getAttribute('aria-labelledby')!);
            expect(title?.textContent).toBe('Details');
        });

        it('PopoverClose closes the popover and returns focus to the trigger', async () => {
            function WithClose() {
                return (
                    <Popover>
                        <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
                        <PopoverBody aria-label="Details" data-testid="surface">
                            <PopoverClose data-testid="close">Close</PopoverClose>
                        </PopoverBody>
                    </Popover>
                );
            }
            await render(<WithClose />);
            const trigger = document.querySelector<HTMLElement>('[data-testid="trigger"]')!;
            await click(trigger);
            await click(document.querySelector<HTMLElement>('[data-testid="close"]')!);
            expect(document.querySelector('[data-testid="surface"]')).toBeNull();
            expect(document.activeElement).toBe(trigger);
        });

        it('passes native props and the ref to the body and the trigger', async () => {
            const bodyRef = createRef<HTMLDivElement>();
            const triggerRef = createRef<HTMLElement>();
            await render(
                <Popover defaultOpen>
                    <PopoverTrigger ref={triggerRef} data-sample="trigger" className="trigger-class">
                        Open
                    </PopoverTrigger>
                    <PopoverBody ref={bodyRef} data-sample="Sample" id="custom-body" className="body-class">
                        Content
                    </PopoverBody>
                </Popover>
            );
            await stable();
            expect(bodyRef.current?.getAttribute('data-sample')).toBe('Sample');
            expect(bodyRef.current?.id).toBe('custom-body');
            expect(bodyRef.current?.classList).toContain('body-class');
            expect(triggerRef.current?.getAttribute('data-sample')).toBe('trigger');
            expect(triggerRef.current?.classList).toContain('trigger-class');
            expect(triggerRef.current?.getAttribute('aria-controls')).toBe('custom-body');
        });
    });

    describe('control and triggers', () => {
        it('a non-button trigger becomes tabbable and opens with Enter and Space', async () => {
            const { trigger, surface } = await setup({ divTrigger: true });
            expect(trigger().tabIndex).toBe(0);
            expect(trigger().getAttribute('role')).toBe('button');
            trigger().focus();
            await userEvent.keyboard('{Enter}');
            await stable();
            expect(surface()).not.toBeNull();
            await userEvent.keyboard('{Escape}');
            await stable();
            expect(document.activeElement).toBe(trigger());
            await userEvent.keyboard(' ');
            await stable();
            expect(surface()).not.toBeNull();
        });

        it('triggers=[] leaves opening to the open prop', async () => {
            const { trigger, surface, update } = await setup({ triggers: [] });
            await click(trigger());
            expect(surface()).toBeNull();
            await update({ triggers: ['click'] });
            await click(trigger());
            expect(surface()).not.toBeNull();
        });

        it('other DOM events open and close it: double click toggles', async () => {
            const { trigger, surface } = await setup({
                triggers: [{ trigger: 'dblclick', openAction: true, closeAction: true }]
            });
            await click(trigger());
            expect(surface()).toBeNull();
            await userEvent.dblClick(trigger());
            await stable();
            expect(surface()).not.toBeNull();
            await userEvent.keyboard('{Escape}');
            await stable();
            await userEvent.dblClick(trigger());
            await stable();
            expect(surface()).not.toBeNull();
            await userEvent.dblClick(trigger());
            await stable();
            expect(surface()).toBeNull();
        });

        it('opens on focus and closes on focusout without moving focus back', async () => {
            const { el, trigger, surface } = await setup({
                triggers: ['focusin', 'focusout'],
                focusAutoCapture: false
            });
            trigger().focus();
            await stable();
            expect(surface()).not.toBeNull();
            el('outside').focus();
            await stable();
            expect(surface()).toBeNull();
            expect(document.activeElement).toBe(el('outside'));
        });
    });

    describe('overlay and lifecycle', () => {
        it('applyOverlay dims the page only when the popover cannot be dismissed', async () => {
            const { trigger, update } = await setup({ applyOverlay: true });
            const backdrop = () =>
                [...document.body.querySelectorAll<HTMLElement>('div')].find((d) =>
                    d.className.includes('fdModal_BackgroundColor')
                );
            await click(trigger());
            // outside click and Escape still close it: no backdrop
            expect(backdrop()).toBeUndefined();
            await userEvent.keyboard('{Escape}');
            await stable();

            await update({ closeOnOutsideClick: false });
            await click(trigger());
            expect(backdrop()).toBeDefined();
            expect(getComputedStyle(backdrop()!).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
            // the trigger stays above the dimmed page
            expect(trigger().classList).toContain('z-[1001]');
            await userEvent.keyboard('{Escape}');
            await stable();
            expect(backdrop()).toBeUndefined();
            expect(trigger().classList).not.toContain('z-[1001]');
        });

        it('changing closeOnOutsideClick while open takes effect', async () => {
            const { el, trigger, surface, update } = await setup({ closeOnOutsideClick: false });
            await click(trigger());
            await click(el('plain'));
            expect(surface()).not.toBeNull();
            await update({ closeOnOutsideClick: true });
            await click(el('plain'));
            expect(surface()).toBeNull();
        });

        it('unmounting an open popover removes its body', async () => {
            const { trigger, surface, screen } = await setup();
            await click(trigger());
            expect(surface()).not.toBeNull();
            await screen.unmount();
            expect(surface()).toBeNull();
        });

        it('the body follows its trigger when it moves', async () => {
            const { trigger, surface } = await setup({ focusAutoCapture: false });
            await click(trigger());
            trigger().style.marginTop = '50px';
            await stable();
            await wait(50);
            near(rect(surface()!).top, rect(trigger()).bottom);
        });
    });

    describe('nesting', () => {
        it('a popover inside a popover keeps the first open; Escape closes the inner one first', async () => {
            await render(
                <Popover>
                    <PopoverTrigger data-testid="first">Open first</PopoverTrigger>
                    <PopoverBody aria-label="First level" data-testid="first-body">
                        <Popover placement="right-start">
                            <PopoverTrigger data-testid="second">Open second</PopoverTrigger>
                            <PopoverBody aria-label="Second level" data-testid="second-body">
                                <button>Inside</button>
                            </PopoverBody>
                        </Popover>
                    </PopoverBody>
                </Popover>
            );
            const el = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
            await click(el('first')!);
            await click(el('second')!);
            expect(el('first-body')).not.toBeNull();
            expect(el('second-body')).not.toBeNull();
            await userEvent.keyboard('{Escape}');
            await stable();
            expect(el('second-body')).toBeNull();
            expect(el('first-body')).not.toBeNull();
            expect(document.activeElement).toBe(el('second'));
        });

        it('Escape inside a dialog closes only the popover', async () => {
            await render(
                <Dialog.Root defaultOpen>
                    <Dialog.Portal>
                        <Dialog.Popup data-testid="dialog" aria-label="Dialog" className="fixed top-10 left-10 z-50">
                            <Popover>
                                <PopoverTrigger data-testid="dialog-trigger">Open</PopoverTrigger>
                                <PopoverBody aria-label="Details">
                                    <button data-testid="dialog-inside">Inside</button>
                                </PopoverBody>
                            </Popover>
                        </Dialog.Popup>
                    </Dialog.Portal>
                </Dialog.Root>
            );
            await stable();
            const trigger = document.querySelector<HTMLElement>('[data-testid="dialog-trigger"]')!;
            await click(trigger);
            expect(document.activeElement).toBe(document.querySelector('[data-testid="dialog-inside"]'));
            await userEvent.keyboard('{Escape}');
            await stable();
            expect(document.querySelector('[data-testid="dialog-inside"]')).toBeNull();
            expect(document.querySelector('[data-testid="dialog"]')).not.toBeNull();
            expect(document.activeElement).toBe(trigger);
            // a second Escape closes the dialog
            await userEvent.keyboard('{Escape}');
            await stable();
            await wait(100);
            expect(document.querySelector('[data-testid="dialog"]')).toBeNull();
        });
    });
});
