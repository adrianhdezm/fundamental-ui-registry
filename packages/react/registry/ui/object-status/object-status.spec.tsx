import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { ObjectStatus, type IndicationColor, type ObjectStatusProps, type ObjectStatusType } from './object-status';

async function setup(initial: ObjectStatusProps = {}) {
    let current: ObjectStatusProps = { label: 'Approved', ...initial };
    let width = 'auto';
    const clicks: string[] = [];
    const ui = (p: ObjectStatusProps) => (
        <div>
            <button id="before">Before</button>
            <div style={{ width }}>
                <ObjectStatus id="os" onClick={() => clicks.push('span')} {...p} />
            </div>
            <ObjectStatus
                id="os-button"
                clickable
                label="In review"
                render={<button />}
                onClick={() => clicks.push('button')}
            />
            <ObjectStatus id="os-children">
                <b>Custom</b> text
            </ObjectStatus>
            <span id="probe" />
            <div id="away" style={{ height: 20 }} />
        </div>
    );
    const screen = await render(ui(current));
    const root = screen.container;
    await userEvent.hover(root.querySelector<HTMLElement>('#away')!);
    const element = () => root.querySelector<HTMLElement>('#os')!;
    const probe = root.querySelector<HTMLElement>('#probe')!;
    return {
        root,
        clicks,
        element,
        icon: () => element().querySelector<HTMLElement>('[data-glyph]'),
        text: () => element().querySelector<HTMLElement>('span:not(.sr-only-sap):not([data-glyph])'),
        hidden: (el = element()) => [...el.querySelectorAll('.sr-only-sap')].map((e) => e.textContent!.trim()),
        /** Resolves a CSS colour (e.g. a theme variable) to its computed rgb value. */
        color: (value: string) => {
            probe.style.color = value;
            return getComputedStyle(probe).color;
        },
        setWidth: (value: string) => {
            width = value;
        },
        update: async (change: ObjectStatusProps) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('ObjectStatus', () => {
    it('status colours the text with the semantic text colour and the icon with the element colour', async () => {
        const { element, icon, color, update } = await setup({ glyph: 'sys-enter-2' });
        const colors: Record<ObjectStatusType, [string, string]> = {
            neutral: ['--sapNeutralTextColor', '--sapNeutralElementColor'],
            positive: ['--sapPositiveTextColor', '--sapPositiveElementColor'],
            critical: ['--sapCriticalTextColor', '--sapCriticalElementColor'],
            negative: ['--sapNegativeTextColor', '--sapNegativeElementColor'],
            informative: ['--sapInformativeTextColor', '--sapInformativeElementColor']
        };
        expect(getComputedStyle(element()).color).toBe(color('var(--sapNeutralTextColor)'));
        for (const [status, [text, iconColor]] of Object.entries(colors) as [ObjectStatusType, [string, string]][]) {
            await update({ status });
            expect(getComputedStyle(element()).color, status).toBe(color(`var(${text})`));
            expect(getComputedStyle(icon()!).color, status).toBe(color(`var(${iconColor})`));
        }
    });

    it('renders the glyph before the label, decorative unless glyphAriaLabel is set', async () => {
        const { icon, text, update } = await setup();
        expect(icon()).toBeNull();
        await update({ glyph: 'sys-enter-2' });
        expect(icon()?.getAttribute('data-glyph')).toBeTruthy();
        expect(icon()?.getAttribute('aria-hidden')).toBe('true');
        expect(icon()!.getBoundingClientRect().right).toBeLessThanOrEqual(text()!.getBoundingClientRect().left);
        await update({ glyphAriaLabel: 'Approved' });
        expect(icon()?.getAttribute('role')).toBe('img');
        expect(icon()?.getAttribute('aria-label')).toBe('Approved');
        expect(icon()?.hasAttribute('aria-hidden')).toBe(false);
    });

    it('icon-only status renders no text', async () => {
        const { icon, text, element, update } = await setup();
        await update({ label: null, glyph: 'alert' });
        expect(icon()).not.toBeNull();
        expect(text()).toBeNull();
        // as wide as the icon, as fundamental-styles
        expect(element().getBoundingClientRect().width).toBe(16);
    });

    it('inverted status is a filled badge in the button colours', async () => {
        const { element, color, update } = await setup();
        expect(getComputedStyle(element()).backgroundColor).toBe('rgba(0, 0, 0, 0)');
        await update({ inverted: true, status: 'positive' });
        expect(getComputedStyle(element()).backgroundColor).toBe(color('var(--sapButton_Success_Background)'));
        expect(getComputedStyle(element()).color).toBe(color('var(--sapButton_Success_TextColor)'));
        expect(getComputedStyle(element()).borderTopColor).toBe(color('var(--sapButton_Success_BorderColor)'));
        expect(getComputedStyle(element()).textShadow).toBe('none');
        await update({ status: null });
        expect(getComputedStyle(element()).backgroundColor).toBe(color('var(--sapNeutralBackground)'));
    });

    it('indication colours 1–10 replace the status colour and are announced', async () => {
        const { element, hidden, color, update } = await setup({ status: 'negative' });
        for (let i = 1 as IndicationColor; i <= 10; i++) {
            await update({ indicationColor: i });
            expect(getComputedStyle(element()).color, `indication ${i}`).toBe(color(`var(--sapIndicationColor_${i})`));
            expect(hidden()).toContain(`Indication Color ${i}`);
        }
    });

    it('inverted indication colours, and the secondary set', async () => {
        const { element, hidden, color, update } = await setup({ inverted: true, indicationColor: 6 });
        expect(getComputedStyle(element()).backgroundColor).toBe(color('var(--sapIndicationColor_6_Background)'));
        expect(getComputedStyle(element()).color).toBe(color('var(--sapIndicationColor_6_TextColor)'));
        await update({ secondaryIndication: true });
        expect(getComputedStyle(element()).backgroundColor).toBe(color('var(--sapIndicationColor_6b)'));
        expect(getComputedStyle(element()).color).toBe(color('var(--sapIndicationColor_6)'));
        expect(hidden()).toContain('Indication Color 6b');
    });

    it('is neither focusable nor a button unless clickable', async () => {
        const { element, clicks } = await setup();
        expect(element().tagName).toBe('SPAN');
        expect(element().getAttribute('role')).toBeNull();
        expect(element().hasAttribute('tabindex')).toBe(false);
        expect(element().hasAttribute('aria-roledescription')).toBe(false);
        element().focus();
        expect(document.activeElement).not.toBe(element());
        await userEvent.keyboard('{Enter}');
        expect(clicks).toEqual([]);
    });

    it('roleDescription overrides the role description of a clickable status', async () => {
        const { element, update } = await setup({ roleDescription: 'Status link' });
        expect(element().hasAttribute('aria-roledescription')).toBe(false);
        await update({ clickable: true });
        expect(element().getAttribute('aria-roledescription')).toBe('Status link');
        await update({ 'aria-roledescription': 'Native' });
        expect(element().getAttribute('aria-roledescription')).toBe('Native');
    });

    it('clickable status is a focusable role button that activates with click, Enter and Space', async () => {
        const { root, element, clicks, update } = await setup();
        await update({ clickable: true });
        expect(element().tagName).toBe('SPAN');
        expect(element().getAttribute('role')).toBe('button');
        expect(element().getAttribute('tabindex')).toBe('0');
        expect(element().getAttribute('aria-roledescription')).toBe('Object Status Button');
        expect(getComputedStyle(element()).cursor).toBe('pointer');

        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(element());

        await userEvent.keyboard('{Enter}');
        expect(clicks).toEqual(['span']);
        await userEvent.keyboard(' ');
        expect(clicks).toEqual(['span', 'span']);
        await userEvent.click(element());
        expect(clicks).toEqual(['span', 'span', 'span']);
    });

    it('Space on a clickable status is prevented so the page does not scroll, and activates on keyup', async () => {
        const { element, clicks, update } = await setup();
        await update({ clickable: true });
        const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
        element().dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
        // as a native button: Space activates on keyup
        expect(clicks).toEqual([]);
        element().dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }));
        expect(clicks).toEqual(['span']);
    });

    it('a clickable <button> status activates once (natively) with Enter and Space', async () => {
        const { root, clicks } = await setup();
        const button = root.querySelector<HTMLButtonElement>('#os-button')!;
        expect(button.tagName).toBe('BUTTON');
        expect(button.getAttribute('type')).toBe('button');
        expect(button.hasAttribute('role')).toBe(false);
        button.focus();
        await userEvent.keyboard('{Enter}');
        expect(clicks).toEqual(['button']);
        await userEvent.keyboard(' ');
        expect(clicks).toEqual(['button', 'button']);
    });

    it('a clickable link status keeps the native link semantics', async () => {
        const { element, update } = await setup();
        await update({ clickable: true, render: <a href="#status" /> });
        expect(element().tagName).toBe('A');
        expect(element().hasAttribute('role')).toBe(false);
        expect(element().hasAttribute('tabindex')).toBe(false);
        expect(getComputedStyle(element()).cursor).toBe('pointer');
        element().focus();
        expect(document.activeElement).toBe(element());
    });

    it('clickable status shows the filled focus style', async () => {
        const { element, color, update } = await setup();
        await update({ clickable: true });
        const before = getComputedStyle(element()).backgroundColor;
        element().focus();
        expect(getComputedStyle(element()).backgroundColor).not.toBe(before);
        expect(getComputedStyle(element()).backgroundColor).toBe(color('var(--sapContent_FocusColor)'));
        expect(getComputedStyle(element()).color).toBe(color('var(--sapContent_ContrastTextColor)'));
    });

    it('in high contrast, a focused clickable status keeps its colour and shows a dotted outline', async () => {
        const { root, element, color, update } = await setup({ status: 'negative' });
        root.setAttribute('data-sap-theme', 'sap_horizon_hcb');
        await update({ clickable: true });
        element().focus();
        expect(getComputedStyle(element()).color).toBe(color('var(--sapNegativeTextColor)'));
        expect(getComputedStyle(element()).outlineStyle).toBe('dotted');
        root.removeAttribute('data-sap-theme');
    });

    it('inverted clickable status changes colours on hover', async () => {
        const { element, color } = await setup({ inverted: true, clickable: true, status: 'negative' });
        expect(getComputedStyle(element()).backgroundColor).toBe(color('var(--sapButton_Negative_Background)'));
        await userEvent.hover(element());
        expect(getComputedStyle(element()).backgroundColor).toBe(color('var(--sapButton_Negative_Hover_Background)'));
    });

    it('underlines the text of a clickable status, but not on hover or of an inverted one', async () => {
        const { root, text, element, update } = await setup({ clickable: true });
        const decoration = () => getComputedStyle(text()!).textDecorationLine;
        expect(decoration()).toBe('underline');
        await userEvent.hover(element());
        expect(decoration()).toBe('none');
        await userEvent.hover(root.querySelector<HTMLElement>('#away')!);
        await update({ inverted: true });
        expect(decoration()).toBe('none');
    });

    it('large uses a bigger font and icon', async () => {
        const { element, icon, update } = await setup({ glyph: 'sys-enter-2' });
        const regular = parseFloat(getComputedStyle(element()).fontSize);
        await update({ large: true });
        expect(parseFloat(getComputedStyle(element()).fontSize)).toBe(24);
        expect(parseFloat(getComputedStyle(element()).fontSize)).toBeGreaterThan(regular);
        expect(parseFloat(getComputedStyle(icon()!).fontSize)).toBe(24);
    });

    it('truncate shortens long text with an ellipsis instead of wrapping', async () => {
        const { element, text, setWidth, update } = await setup();
        setWidth('120px');
        await update({ label: 'A very long status text that does not fit into the container' });
        const lineHeight = parseFloat(getComputedStyle(text()!).lineHeight);
        expect(text()!.getBoundingClientRect().height).toBeGreaterThan(lineHeight * 1.5);

        await update({ truncate: true });
        expect(getComputedStyle(text()!).textOverflow).toBe('ellipsis');
        expect(text()!.getBoundingClientRect().height).toBeLessThanOrEqual(lineHeight + 1);
        expect(text()!.scrollWidth).toBeGreaterThan(text()!.clientWidth);
        expect(element().getBoundingClientRect().width).toBeLessThanOrEqual(120);
    });

    it('announces "Object Status" (or objectStatusLabel) when not clickable; clickable uses the role description', async () => {
        const { element, hidden, update } = await setup();
        expect(hidden()).toEqual(['Object Status']);
        await update({ objectStatusLabel: 'Approval' });
        expect(hidden()).toEqual(['Approval']);
        await update({ clickable: true, objectStatusLabel: undefined });
        expect(hidden()).toEqual([]);
        expect(element().getAttribute('aria-roledescription')).toBe('Object Status Button');
    });

    it('announces a status message per status, overridable with statusMessage', async () => {
        const { hidden, update } = await setup();
        const texts: Partial<Record<ObjectStatusType, string>> = {
            critical: 'Warning issued',
            informative: 'Informative entry',
            negative: 'Invalid Entry',
            positive: 'Entry successfully validated'
        };
        for (const [status, message] of Object.entries(texts) as [ObjectStatusType, string][]) {
            await update({ status });
            expect(hidden()).toEqual(['Object Status', message]);
        }
        await update({ status: 'neutral' });
        expect(hidden()).toEqual(['Object Status']);
        await update({ status: 'negative', statusMessage: 'Rejected by the manager' });
        expect(hidden()).toEqual(['Object Status', 'Rejected by the manager']);
    });

    it('renders children as the text', async () => {
        const { root, hidden } = await setup();
        const status = root.querySelector<HTMLElement>('#os-children')!;
        expect(status.querySelector('b')?.textContent).toBe('Custom');
        expect(status.textContent).toContain('Custom text');
        expect(hidden(status)).toEqual(['Object Status']);
    });

    it('passes className, native props and the ref through; render swaps the element', async () => {
        const ref = createRef<HTMLSpanElement>();
        const clickRef = createRef<HTMLElement>();
        const onClick = vi.fn();
        const screen = await render(
            <div>
                <ObjectStatus ref={ref} aria-label="Placeholder label" data-sample="Sample" className="m-1">
                    ObjectStatus
                </ObjectStatus>
                <ObjectStatus ref={clickRef} clickable data-sample="Clickable" onClick={onClick} label="Go" />
                <ObjectStatus render={<div />} id="as-div" label="Div" />
            </div>
        );
        const status = screen.container.querySelector<HTMLElement>('[data-sample="Sample"]')!;
        expect(ref.current).toBe(status);
        expect(status.tagName).toBe('SPAN');
        expect(status.classList.contains('m-1')).toBe(true);
        expect(status.getAttribute('aria-label')).toBe('Placeholder label');
        expect(clickRef.current).toBe(screen.container.querySelector('[data-sample="Clickable"]'));
        await userEvent.click(clickRef.current!);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(screen.container.querySelector('#as-div')!.tagName).toBe('DIV');
    });
});
