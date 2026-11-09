import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Button } from '@/ui/button/button';
import { Input } from '@/ui/input/input';
import { InlineHelp, type InlineHelpProps } from './inline-help';

const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const wait = (ms = 50) => new Promise((r) => setTimeout(r, ms));
const settle = async () => {
    await frame();
    await wait(50);
    await frame();
};
const body = (id: string) => document.getElementById(id);

interface HostProps extends Partial<InlineHelpProps> {
    show?: boolean;
    rtl?: boolean;
}

function Host({ show = true, rtl = false, ...props }: HostProps) {
    const ui = (
        <div style={{ padding: 200 }} dir={rtl ? 'rtl' : 'ltr'}>
            <button id="before">Before</button>
            {show && <InlineHelp id="help" bodyId="help-body" content="Explains the field" {...props} />}
            <InlineHelp
                content="Format: YYYY-MM-DD"
                bodyId="field-body"
                render={<Input id="field" aria-label="Field" />}
            />
            <InlineHelp
                bodyId="rich-body"
                content={
                    <span className="rich">
                        Rich <b>help</b>
                    </span>
                }
                render={<span id="rich-trigger" tabIndex={0} />}
            >
                Rich
            </InlineHelp>
            <InlineHelp
                content="Clicked help"
                bodyId="click-body"
                triggers={['click']}
                render={<Button id="click" label="Click" />}
            />
        </div>
    );
    return rtl ? <DirectionProvider direction="rtl">{ui}</DirectionProvider> : ui;
}

async function setup(props: HostProps = {}) {
    const screen = await render(<Host {...props} />);
    await settle();
    return {
        screen,
        icon: document.getElementById('help')!,
        before: document.getElementById('before')!,
        rerender: async (next: HostProps) => {
            await screen.rerender(<Host {...props} {...next} />);
            await settle();
        }
    };
}

/** Moves the pointer away from the trigger and waits for the help to close. */
const leave = async (to: HTMLElement) => {
    await userEvent.hover(to);
    await settle();
    await wait(150);
};

describe('InlineHelp', () => {
    afterEach(() => {
        document.documentElement.removeAttribute('dir');
    });

    it('opens on hover and closes when the pointer leaves', async () => {
        const { icon, before } = await setup();
        expect(body('help-body')).toBeNull();
        await userEvent.hover(icon);
        await settle();
        const tooltip = body('help-body')!;
        expect(tooltip).not.toBeNull();
        expect(tooltip.getAttribute('role')).toBe('tooltip');
        expect(tooltip.textContent).toContain('Explains the field');
        await leave(before);
        expect(body('help-body')).toBeNull();
    });

    it('stays open while the pointer moves from the trigger onto the help', async () => {
        const { icon, before } = await setup();
        await userEvent.hover(icon);
        await settle();
        await userEvent.hover(body('help-body')!);
        await settle();
        await wait(150);
        expect(body('help-body')).not.toBeNull();
        await leave(before);
        expect(body('help-body')).toBeNull();
    });

    it('opens on focus and closes on blur, keeping focus on the trigger', async () => {
        const { icon, before } = await setup();
        before.focus();
        await userEvent.tab();
        await settle();
        expect(document.activeElement).toBe(icon);
        expect(body('help-body')).not.toBeNull();
        await userEvent.tab();
        await settle();
        await wait(150);
        expect(body('help-body')).toBeNull();
    });

    it('closes on Escape when closeOnEscapeKey is set', async () => {
        const { icon } = await setup({ closeOnEscapeKey: true });
        icon.focus();
        await settle();
        expect(body('help-body')).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await settle();
        await wait(150);
        expect(body('help-body')).toBeNull();
        expect(document.activeElement).toBe(icon);
    });

    it('stays open on Escape without closeOnEscapeKey', async () => {
        const { icon } = await setup();
        icon.focus();
        await settle();
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(body('help-body')).not.toBeNull();
    });

    it('a disabled inline help does not open, and disabling an open help closes it', async () => {
        const { icon, rerender } = await setup({ disabled: true });
        icon.focus();
        await userEvent.hover(icon);
        await settle();
        expect(body('help-body')).toBeNull();
        icon.blur();
        await rerender({ disabled: false });
        icon.focus();
        await settle();
        expect(body('help-body')).not.toBeNull();
        await rerender({ disabled: true });
        await wait(150);
        expect(body('help-body')).toBeNull();
    });

    it('custom triggers: click toggles the help', async () => {
        await setup();
        const button = document.getElementById('click')!;
        await userEvent.hover(button);
        await settle();
        expect(body('click-body')).toBeNull();
        await userEvent.click(button);
        await settle();
        expect(body('click-body')!.textContent).toContain('Clicked help');
        await userEvent.click(button);
        await settle();
        await wait(150);
        expect(body('click-body')).toBeNull();
    });

    it('a press that opens the help by focusing the trigger does not close it again with its click', async () => {
        // a tap on a touch screen: the press focuses the icon (focusin opens), then clicks it (click toggles)
        await setup({ triggers: ['focusin', 'focusout', { trigger: 'click', openAction: true, closeAction: true }] });
        const icon = document.getElementById('help')!;
        await userEvent.click(icon);
        await settle();
        expect(document.activeElement).toBe(icon);
        expect(body('help-body')).not.toBeNull();
        // a second click closes it
        await userEvent.click(icon);
        await settle();
        await wait(150);
        expect(body('help-body')).toBeNull();
    });

    it('the help text is referenced via aria-describedby with a hidden copy next to the trigger', async () => {
        const { icon } = await setup();
        expect(icon.getAttribute('aria-describedby')).toBe('help-body-text');
        const text = document.getElementById('help-body-text')!;
        expect(text.textContent).toBe('Explains the field');
        expect(text.hidden).toBe(true);
        expect(text.previousElementSibling).toBe(icon);
        // the icon trigger is focusable and stays visible to assistive technology
        expect(icon.getAttribute('aria-hidden')).not.toBe('true');
        expect(icon.getAttribute('role')).toBe('img');
        expect(icon.getAttribute('aria-label')).toBe('Help');
        expect(icon.tabIndex).toBe(0);

        const field = document.getElementById('field')!;
        expect(field.getAttribute('aria-describedby')).toBe('field-body-text');
        const fieldText = document.getElementById('field-body-text')!;
        expect(fieldText.previousElementSibling).toBe(field);
        expect(fieldText.textContent).toBe('Format: YYYY-MM-DD');
    });

    it('keeps the trigger’s own aria-describedby and adds the help text', async () => {
        await render(
            <>
                <InlineHelp content="Help" bodyId="own" aria-describedby="own-a" />
                <InlineHelp
                    content="Help"
                    bodyId="el"
                    render={<button type="button" id="el-trigger" aria-describedby="el-a" />}
                />
            </>
        );
        expect(document.querySelector('[aria-label=Help]')!.getAttribute('aria-describedby')).toBe('own-a own-text');
        expect(document.getElementById('el-trigger')!.getAttribute('aria-describedby')).toBe('el-a el-text');
    });

    it('the help text adds nothing to the name of a button trigger', async () => {
        await setup();
        const button = document.getElementById('click')!;
        expect(button.textContent).toBe('Click');
        expect(document.getElementById('click-body-text')!.textContent).toBe('Clicked help');
    });

    it('template content renders in the body and in the screen reader text', async () => {
        await setup();
        const trigger = document.getElementById('rich-trigger')!;
        expect(document.getElementById('rich-body-text')!.textContent).toBe('Rich help');
        expect(trigger.textContent).toBe('Rich');
        trigger.focus();
        await settle();
        expect(body('rich-body')!.querySelector('b')!.textContent).toBe('help');
    });

    it('placement positions the body next to the trigger', async () => {
        const { icon, rerender } = await setup({ placement: 'right' });
        icon.focus();
        await settle();
        const rect = body('help-body')!.getBoundingClientRect();
        expect(rect.left).toBeGreaterThanOrEqual(icon.getBoundingClientRect().right - 1);
        icon.blur();
        await settle();
        await wait(150);
        await rerender({ placement: 'top' });
        icon.focus();
        await settle();
        expect(body('help-body')!.getBoundingClientRect().bottom).toBeLessThanOrEqual(
            icon.getBoundingClientRect().top + 1
        );
    });

    it('the default placement is below the trigger, centred', async () => {
        const { icon } = await setup();
        icon.focus();
        await settle();
        const rect = body('help-body')!.getBoundingClientRect();
        const iconRect = icon.getBoundingClientRect();
        expect(rect.top).toBeGreaterThanOrEqual(iconRect.bottom - 1);
        expect(Math.abs(rect.left + rect.width / 2 - (iconRect.left + iconRect.width / 2))).toBeLessThanOrEqual(1);
    });

    it('placement follows RTL: start-aligned placements align with the right edge, left/right stay physical', async () => {
        document.documentElement.setAttribute('dir', 'rtl');
        const { icon, rerender } = await setup({ placement: 'bottom-start', rtl: true });
        icon.focus();
        await settle();
        const iconRect = icon.getBoundingClientRect();
        let rect = body('help-body')!.getBoundingClientRect();
        expect(rect.top).toBeGreaterThanOrEqual(iconRect.bottom - 1);
        // aligned with the icon's right edge, and grows to the left; the arrow keeps 0.5rem from the corner while
        // it points at the centre of the 1rem icon, so the body goes up to 8px past the icon edge
        expect(rect.right).toBeGreaterThanOrEqual(iconRect.right - 1);
        expect(rect.right - iconRect.right).toBeLessThanOrEqual(9);
        expect(rect.left).toBeLessThan(iconRect.left);
        icon.blur();
        await settle();
        await wait(150);
        await rerender({ placement: 'right' });
        icon.focus();
        await settle();
        rect = body('help-body')!.getBoundingClientRect();
        expect(rect.left).toBeGreaterThanOrEqual(iconRect.right - 1);
    });

    it('the help closes when the trigger is destroyed', async () => {
        const { icon, rerender } = await setup();
        icon.focus();
        await settle();
        expect(body('help-body')).not.toBeNull();
        await rerender({ show: false });
        expect(body('help-body')).toBeNull();
        expect(document.querySelector('[role=tooltip]')).toBeNull();
    });

    it('Escape closes a hover-opened help when closeOnEscapeKey is set', async () => {
        const { icon } = await setup({ closeOnEscapeKey: true });
        await userEvent.hover(icon);
        await settle();
        expect(body('help-body')).not.toBeNull();
        expect(document.activeElement).not.toBe(icon);
        await userEvent.keyboard('{Escape}');
        await settle();
        await wait(150);
        expect(body('help-body')).toBeNull();
    });

    it('Escape leaves a hover-opened help open without closeOnEscapeKey', async () => {
        const { icon } = await setup();
        await userEvent.hover(icon);
        await settle();
        expect(document.activeElement).not.toBe(icon);
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(body('help-body')).not.toBeNull();
    });

    it('closeOnOutsideClick closes the help on a press outside, not on the trigger', async () => {
        const { icon, before } = await setup({ triggers: ['click'], closeOnOutsideClick: true });
        await userEvent.click(icon);
        await settle();
        expect(body('help-body')).not.toBeNull();
        await userEvent.click(body('help-body')!);
        await settle();
        expect(body('help-body')).not.toBeNull();
        await userEvent.click(before);
        await settle();
        await wait(150);
        expect(body('help-body')).toBeNull();
    });

    it('stays open on a press outside without closeOnOutsideClick', async () => {
        const { icon, before } = await setup({ triggers: ['click'] });
        await userEvent.click(icon);
        await settle();
        await userEvent.click(before);
        await settle();
        await wait(150);
        expect(body('help-body')).not.toBeNull();
    });

    it('shows an arrow pointing at the trigger; noArrow hides it', async () => {
        const { icon, rerender } = await setup();
        icon.focus();
        await settle();
        const help = body('help-body')!;
        const arrow = help.querySelector<HTMLElement>('[data-side]:not([role])')!;
        expect(arrow).not.toBeNull();
        expect(getComputedStyle(arrow, '::after').content).toBe('""');
        // the arrow is on the top edge, centred on the icon
        const iconRect = icon.getBoundingClientRect();
        const arrowRect = arrow.getBoundingClientRect();
        expect(Math.abs(arrowRect.bottom - help.getBoundingClientRect().top)).toBeLessThanOrEqual(1);
        expect(
            Math.abs(arrowRect.left + arrowRect.width / 2 - (iconRect.left + iconRect.width / 2))
        ).toBeLessThanOrEqual(1);
        // 0.5rem between the trigger and the body
        expect(Math.abs(help.getBoundingClientRect().top - iconRect.bottom - 8)).toBeLessThanOrEqual(1);
        icon.blur();
        await settle();
        await wait(150);
        await rerender({ noArrow: true });
        icon.focus();
        await settle();
        expect(body('help-body')!.children.length).toBe(0);
        expect(Math.abs(body('help-body')!.getBoundingClientRect().top - iconRect.bottom)).toBeLessThanOrEqual(1);
    });

    it('the body has the inline help padding and the small font', async () => {
        const { icon } = await setup();
        icon.focus();
        await settle();
        const style = getComputedStyle(body('help-body')!);
        expect(style.paddingTop).toBe('12px');
        expect(style.paddingInlineStart).toBe('12px');
        const small = getComputedStyle(document.documentElement).getPropertyValue('--sapFontSmallSize').trim();
        const probe = document.createElement('div');
        probe.style.fontSize = small;
        document.body.appendChild(probe);
        expect(style.fontSize).toBe(getComputedStyle(probe).fontSize);
        probe.remove();
        expect(style.whiteSpace).toBe('normal');
    });

    it('maxWidth limits the body width', async () => {
        const { icon } = await setup({
            content: 'A long help text that would be much wider than the limit if it were not wrapped. '.repeat(3),
            maxWidth: 200
        });
        icon.focus();
        await settle();
        const rect = body('help-body')!.getBoundingClientRect();
        expect(Math.abs(rect.width - 200)).toBeLessThanOrEqual(1);
        // the text wraps onto several lines instead
        expect(rect.height).toBeGreaterThan(60);
    });

    it('anchor (appendTo) positions the body against the given element', async () => {
        const anchor = document.createElement('div');
        anchor.style.cssText = 'position: fixed; top: 400px; left: 600px; width: 40px; height: 40px';
        document.body.appendChild(anchor);
        const { icon } = await setup({ placement: 'bottom-start', anchor });
        icon.focus();
        await settle();
        const rect = body('help-body')!.getBoundingClientRect();
        // below the anchor (8px arrow gap) and aligned with its start edge, not with the icon
        expect(Math.abs(rect.top - 448)).toBeLessThanOrEqual(1.5);
        expect(Math.abs(rect.left - 600)).toBeLessThanOrEqual(1.5);
        anchor.remove();
    });

    it('container renders the body into the given element', async () => {
        const box = document.createElement('div');
        document.body.appendChild(box);
        await setup({ container: box, defaultOpen: true });
        expect(box.contains(body('help-body'))).toBe(true);
        box.remove();
    });

    it('closing never moves focus: the help leaves focus where it is', async () => {
        const { icon, before } = await setup({ closeOnEscapeKey: true });
        await userEvent.hover(icon);
        await settle();
        before.focus();
        await userEvent.keyboard('{Escape}');
        await settle();
        await wait(150);
        expect(body('help-body')).toBeNull();
        expect(document.activeElement).toBe(before);
    });

    it('bodyClassName is applied to the body', async () => {
        const { icon } = await setup({ bodyClassName: 'bg-sap-information-background' });
        icon.focus();
        await settle();
        const surface = body('help-body')!;
        // the body animates its colours
        await wait(200);
        expect(surface.classList).toContain('bg-sap-information-background');
        // it replaces the default surface colour
        const reference = document.createElement('div');
        reference.className = 'bg-sap-information-background';
        document.body.appendChild(reference);
        expect(getComputedStyle(surface).backgroundColor).toBe(getComputedStyle(reference).backgroundColor);
        reference.remove();
    });

    it('bodyRole changes the role of the body', async () => {
        const { icon } = await setup({ bodyRole: 'note' });
        icon.focus();
        await settle();
        expect(body('help-body')!.getAttribute('role')).toBe('note');
    });

    it('controlled: open shows the help, and onOpenChange follows the triggers', async () => {
        const onOpenChange = vi.fn();
        const { icon, rerender } = await setup({ open: true, onOpenChange });
        expect(body('help-body')).not.toBeNull();
        await rerender({ open: false, onOpenChange });
        await wait(150);
        expect(body('help-body')).toBeNull();
        icon.focus();
        await settle();
        expect(onOpenChange).toHaveBeenLastCalledWith(true);
        // still closed: the parent decides
        expect(body('help-body')).toBeNull();
    });

    it('passes className, native props and the ref to the trigger', async () => {
        const ref = createRef<HTMLElement>();
        const wrap = (node: ReactNode) => <div>{node}</div>;
        await render(
            wrap(
                <InlineHelp
                    ref={ref}
                    content="Help"
                    className="custom"
                    data-custom="value"
                    aria-label="More information"
                />
            )
        );
        const trigger = document.querySelector<HTMLElement>('[data-custom=value]')!;
        expect(ref.current).toBe(trigger);
        expect(trigger.classList).toContain('custom');
        expect(trigger.getAttribute('aria-label')).toBe('More information');
    });
});
