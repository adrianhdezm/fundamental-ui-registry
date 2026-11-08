import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { ObjectNumber, type ObjectNumberProps, type ObjectNumberStatus } from './object-number';

async function setup(initial: ObjectNumberProps = {}) {
    let current: ObjectNumberProps = { number: 1000.37, decimal: 2, unit: 'EUR', locale: 'en-US', ...initial };
    let clicks = 0;
    const ui = (p: ObjectNumberProps) => (
        <div>
            <ObjectNumber id="on" onClick={() => clicks++} {...p} />
            <span id="plain" tabIndex={-1}>
                plain
            </span>
            <span id="probe" />
        </div>
    );
    const screen = await render(ui(current));
    const root = screen.container;
    const element = () => root.querySelector<HTMLElement>('#on')!;
    const probe = root.querySelector<HTMLElement>('#probe')!;
    return {
        root,
        clicks: () => clicks,
        element,
        number: () => element().querySelectorAll('bdi')[0] as HTMLElement,
        unit: () => element().querySelectorAll('bdi')[1] as HTMLElement,
        hidden: () => [...element().querySelectorAll('.sr-only-sap')].map((e) => e.textContent?.trim()),
        /** Resolves a CSS colour (e.g. a theme variable) to its computed rgb value. */
        color: (value: string) => {
            probe.style.color = value;
            return getComputedStyle(probe).color;
        },
        update: async (change: ObjectNumberProps) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('ObjectNumber', () => {
    afterEach(() => document.documentElement.removeAttribute('dir'));

    it('formats with the given number of decimals', async () => {
        const { number, update } = await setup();
        expect(number().textContent).toBe('1,000.37');
        await update({ decimal: 0 });
        expect(number().textContent).toBe('1,000');
        await update({ number: 2.5, decimal: 3 });
        expect(number().textContent).toBe('2.500');
        await update({ number: -2000 });
        expect(number().textContent).toBe('-2,000.000');
        await update({ number: null });
        expect(number().textContent).toBe('');
    });

    it('formats with the locale', async () => {
        const { number } = await setup({ locale: 'de' });
        expect(number().textContent).toBe('1.000,37');
    });

    it('shows the unit after the number', async () => {
        const { element, number, unit, update } = await setup();
        expect(unit().textContent).toBe('EUR');
        expect(element().textContent?.replace(/\s+/g, ' ').trim()).toBe('1,000.37 EUR');
        expect(unit().getBoundingClientRect().left).toBeGreaterThan(number().getBoundingClientRect().right);
        await update({ unit: null });
        expect(unit().textContent).toBe('');
    });

    it('emphasized makes the number bold and announces it', async () => {
        const { number, unit, hidden, update } = await setup();
        expect(Number(getComputedStyle(number()).fontWeight)).toBeLessThan(700);
        expect(hidden()).toEqual([]);
        await update({ emphasized: true });
        expect(Number(getComputedStyle(number()).fontWeight)).toBeGreaterThanOrEqual(700);
        expect(Number(getComputedStyle(unit()).fontWeight)).toBeLessThan(700);
        expect(hidden()).toEqual(['Emphasized']);
        await update({ emphasizedText: 'Important' });
        expect(hidden()).toEqual(['Important']);
    });

    it('large uses a bigger font and ignores emphasized', async () => {
        const { element, number, update } = await setup();
        const regular = parseFloat(getComputedStyle(element()).fontSize);
        await update({ large: true, emphasized: true });
        expect(parseFloat(getComputedStyle(element()).fontSize)).toBe(24);
        expect(parseFloat(getComputedStyle(element()).fontSize)).toBeGreaterThan(regular);
        expect(Number(getComputedStyle(number()).fontWeight)).toBeLessThan(700);
    });

    it('status colours the number with the semantic text colour', async () => {
        const { element, color, update } = await setup();
        expect(getComputedStyle(element()).color).toBe(color('var(--sapNeutralTextColor)'));
        const colors: Record<ObjectNumberStatus, string> = {
            positive: '--sapPositiveTextColor',
            critical: '--sapCriticalTextColor',
            negative: '--sapNegativeTextColor',
            informative: '--sapInformativeTextColor'
        };
        for (const [status, variable] of Object.entries(colors) as [ObjectNumberStatus, string][]) {
            await update({ status });
            expect(getComputedStyle(element()).color, status).toBe(color(`var(${variable})`));
        }
    });

    it('status has a hidden text for assistive technology, overridable with statusMessage', async () => {
        const { element, hidden, update } = await setup();
        const texts: Record<ObjectNumberStatus, string> = {
            negative: 'Value State Error',
            critical: 'Value State Warning',
            positive: 'Value State Success',
            informative: 'Value State Information'
        };
        for (const [status, text] of Object.entries(texts) as [ObjectNumberStatus, string][]) {
            await update({ status });
            expect(hidden()).toEqual([text]);
        }
        await update({ statusMessage: 'Over budget' });
        expect(hidden()).toEqual(['Over budget']);
        const srOnly = element().querySelector<HTMLElement>('.sr-only-sap')!;
        expect(srOnly.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    });

    it('inverted shows a filled badge in the status colours', async () => {
        const { element, color, update } = await setup();
        expect(getComputedStyle(element()).backgroundColor).toBe('rgba(0, 0, 0, 0)');
        await update({ inverted: true });
        expect(getComputedStyle(element()).backgroundColor).toBe(color('var(--sapNeutralBackground)'));
        await update({ status: 'negative' });
        expect(getComputedStyle(element()).backgroundColor).toBe(color('var(--sapButton_Negative_Background)'));
        expect(getComputedStyle(element()).color).toBe(color('var(--sapButton_Negative_TextColor)'));
    });

    it('inverted interactive number changes colours on hover', async () => {
        const { element, color } = await setup({ inverted: true, interactive: true, status: 'positive' });
        await userEvent.hover(element());
        expect(getComputedStyle(element()).backgroundColor).toBe(color('var(--sapButton_Success_Hover_Background)'));
    });

    it('aria-label names the number', async () => {
        const { element, update } = await setup();
        expect(element().hasAttribute('aria-label')).toBe(false);
        await update({ 'aria-label': 'Price' });
        expect(element().getAttribute('aria-label')).toBe('Price');
    });

    it('is not focusable or a button unless interactive', async () => {
        const { element, clicks } = await setup();
        expect(element().getAttribute('role')).toBeNull();
        expect(element().hasAttribute('tabindex')).toBe(false);
        element().focus();
        await userEvent.keyboard('{Enter}');
        expect(clicks()).toBe(0);
    });

    it('interactive number is a focusable button that activates with click, Enter and Space', async () => {
        const { root, element, clicks, update } = await setup();
        await update({ interactive: true });
        expect(element().tagName).toBe('SPAN');
        expect(element().getAttribute('role')).toBe('button');
        expect(element().getAttribute('tabindex')).toBe('0');
        expect(getComputedStyle(element()).cursor).toBe('pointer');

        await userEvent.click(element());
        expect(clicks()).toBe(1);
        root.querySelector<HTMLElement>('#plain')!.focus();
        element().focus();
        expect(document.activeElement).toBe(element());
        await userEvent.keyboard('{Enter}');
        expect(clicks()).toBe(2);
        await userEvent.keyboard(' ');
        expect(clicks()).toBe(3);
    });

    it('Space on an interactive number is prevented so the page does not scroll, and activates on keyup', async () => {
        const { element, clicks, update } = await setup();
        await update({ interactive: true });
        const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
        element().dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
        // as a native button: Space activates on keyup
        expect(clicks()).toBe(0);
        element().dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }));
        expect(clicks()).toBe(1);
    });

    it('an interactive <button> number activates once (natively)', async () => {
        const { element, clicks, update } = await setup();
        await update({ interactive: true, render: <button /> });
        expect(element().tagName).toBe('BUTTON');
        expect(element().getAttribute('type')).toBe('button');
        expect(element().hasAttribute('role')).toBe(false);
        element().focus();
        await userEvent.keyboard('{Enter}');
        expect(clicks()).toBe(1);
        await userEvent.keyboard(' ');
        expect(clicks()).toBe(2);
    });

    it('interactive number shows a focus outline', async () => {
        const { element, update } = await setup();
        await update({ interactive: true });
        element().focus();
        const after = getComputedStyle(element(), '::after');
        expect(after.position).toBe('absolute');
        expect(parseFloat(after.borderTopWidth)).toBeGreaterThan(0);
    });

    it('underlines an interactive number, but not on hover or an inverted one', async () => {
        const { root, number, update } = await setup();
        const line = () => getComputedStyle(number().parentElement!).textDecorationLine;
        // The pointer may still rest where an earlier test left it, over the number: move it away first.
        await userEvent.hover(root.querySelector<HTMLElement>('#plain')!);
        expect(line()).toBe('none');
        await update({ interactive: true });
        expect(line()).toBe('underline');
        await userEvent.hover(number());
        expect(line()).toBe('none');
        await userEvent.hover(root.querySelector<HTMLElement>('#plain')!);
        await update({ inverted: true });
        expect(line()).toBe('none');
    });

    it('truncates a number wider than its container with an ellipsis', async () => {
        const screen = await render(
            <div style={{ width: 100 }}>
                <ObjectNumber id="narrow" number={500000234} decimal={2} unit="USD" locale="en-US" />
            </div>
        );
        const element = screen.container.querySelector<HTMLElement>('#narrow')!;
        expect(element.getBoundingClientRect().width).toBeLessThanOrEqual(100);
        const part = element.querySelector('bdi')!.parentElement!;
        expect(getComputedStyle(part).textOverflow).toBe('ellipsis');
        expect(part.scrollWidth).toBeGreaterThan(part.clientWidth);
    });

    it('number and unit are isolated with <bdi> for RTL', async () => {
        document.documentElement.setAttribute('dir', 'rtl');
        const { element, number, unit } = await setup({ number: -2000 });
        expect(number().tagName).toBe('BDI');
        expect(number().getAttribute('dir')).toBe('ltr');
        expect(unit().tagName).toBe('BDI');
        expect(getComputedStyle(element()).direction).toBe('rtl');
        expect(getComputedStyle(number()).direction).toBe('ltr');
        expect(getComputedStyle(number()).unicodeBidi).toBe('isolate');
        expect(getComputedStyle(unit()).unicodeBidi).toBe('isolate');
        // the minus stays in front of the digits and the unit is laid out on the left in RTL
        expect(number().textContent).toBe('-2,000.00');
        expect(unit().getBoundingClientRect().right).toBeLessThan(number().getBoundingClientRect().left);
    });

    it('passes className, native props and the ref through; render swaps the element', async () => {
        const ref = createRef<HTMLSpanElement>();
        const clickRef = createRef<HTMLElement>();
        const onClick = vi.fn();
        const screen = await render(
            <div>
                <ObjectNumber ref={ref} data-sample="Sample" className="m-1" number={1} />
                <ObjectNumber ref={clickRef} interactive data-sample="Interactive" onClick={onClick} number={2} />
                <ObjectNumber render={<div />} id="as-div" number={3} />
            </div>
        );
        const element = screen.container.querySelector<HTMLElement>('[data-sample="Sample"]')!;
        expect(ref.current).toBe(element);
        expect(element.tagName).toBe('SPAN');
        expect(element.classList.contains('m-1')).toBe(true);
        expect(clickRef.current).toBe(screen.container.querySelector('[data-sample="Interactive"]'));
        await userEvent.click(clickRef.current!);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(screen.container.querySelector('#as-div')!.tagName).toBe('DIV');
    });
});
