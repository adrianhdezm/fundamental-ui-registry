import { Field } from '@base-ui/react/field';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Icon } from '@/ui/icon/icon';
import { StepInput, type StepInputProps } from './step-input';

const wait = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

/** A step input with a value held by its host, echoed in `#echo`. */
function Host({ initial = 5, ...props }: Partial<StepInputProps> & { initial?: number | null }) {
    const [value, setValue] = useState<number | null>(initial);
    return (
        <>
            <StepInput aria-label="Quantity" {...props} value={value} onValueChange={setValue} />
            <span id="echo">{String(value)}</span>
            <button type="button" id="outside">
                Outside
            </button>
        </>
    );
}

async function setup(props: Partial<StepInputProps> & { initial?: number | null } = {}) {
    const screen = await render(<Host {...props} />);
    const root = screen.container;
    const input = root.querySelector<HTMLInputElement>('input[role=spinbutton]')!;
    const buttons = () => [...root.querySelectorAll<HTMLButtonElement>('[role=group] button')];
    const echo = () => root.querySelector('#echo')!.textContent;
    return { screen, root, input, buttons, echo, field: input.parentElement as HTMLElement };
}

/** A token colour as the browser computes it. */
function tokenColor(token: string): string {
    const probe = document.createElement('span');
    probe.style.color = `var(${token})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
}

describe('StepInput', () => {
    it('is a spin button with the value and its limits', async () => {
        const { input, buttons } = await setup({ min: 0, max: 10, locale: 'en-US' });
        const [decrement, increment] = buttons();
        expect(input.getAttribute('role')).toBe('spinbutton');
        expect(input.getAttribute('aria-roledescription')).toBe('Step Input');
        expect(input.value).toBe('5');
        expect(input.getAttribute('aria-valuenow')).toBe('5');
        expect(input.getAttribute('aria-valuetext')).toBe('5');
        expect(input.getAttribute('aria-valuemin')).toBe('0');
        expect(input.getAttribute('aria-valuemax')).toBe('10');
        expect(increment.getAttribute('aria-label')).toBe('Increase');
        expect(decrement.getAttribute('aria-label')).toBe('Decrease');
        expect(decrement.getAttribute('aria-controls')).toBe(input.id);
        expect(increment.tabIndex).toBe(-1);
    });

    it('steps with the buttons and disables them at the limits', async () => {
        const { input, buttons, echo } = await setup({ initial: 9, min: 0, max: 10 });
        const [decrement, increment] = buttons();
        await userEvent.click(increment);
        expect(echo()).toBe('10');
        expect(input.value).toBe('10');
        expect(increment.disabled).toBe(true);
        await userEvent.click(decrement);
        expect(echo()).toBe('9');
        expect(document.activeElement).toBe(input);
    });

    it('steps with the keyboard', async () => {
        const { input, echo } = await setup({ min: 0, max: 10 });
        input.focus();
        await userEvent.keyboard('{ArrowUp}{ArrowUp}');
        expect(echo()).toBe('7');
        await userEvent.keyboard('{ArrowDown}');
        expect(echo()).toBe('6');
        await userEvent.keyboard('{End}');
        expect(echo()).toBe('10');
        await userEvent.keyboard('{Home}');
        expect(echo()).toBe('0');
    });

    it('adds decimal steps without floating point noise', async () => {
        const { input, echo } = await setup({ initial: 0.2, step: 0.1 });
        input.focus();
        await userEvent.keyboard('{ArrowUp}');
        expect(echo()).toBe('0.3');
    });

    it('parses typed text in the locale, limits it, and formats it on blur', async () => {
        const { input, echo } = await setup({ initial: 1, min: 0, max: 10, locale: 'de-DE' });
        await userEvent.clear(input);
        await userEvent.type(input, '7,5');
        expect(echo()).toBe('7.5');
        expect(input.value).toBe('7,5');
        await userEvent.clear(input);
        await userEvent.type(input, '42');
        expect(echo()).toBe('10');
        await userEvent.tab();
        expect(input.value).toBe('10');
        // letters are not typed
        await userEvent.type(input, 'abc');
        expect(input.value).toBe('10');
        expect(echo()).toBe('10');
        await userEvent.clear(input);
        expect(echo()).toBe('null');
        expect(input.hasAttribute('aria-valuenow')).toBe(false);
    });

    it('starts an empty value at the minimum going up, and at the maximum going down', async () => {
        const { input, buttons, echo, screen } = await setup({ initial: null, min: 0, max: 10 });
        await userEvent.click(buttons()[1]);
        expect(echo()).toBe('0');
        await userEvent.clear(input);
        await userEvent.click(buttons()[0]);
        expect(echo()).toBe('10');
        expect(input.value).toBe('10');
        await screen.rerender(<Host initial={null} min={-5} max={5} />);
        await userEvent.clear(input);
        input.focus();
        await userEvent.keyboard('{ArrowUp}');
        expect(echo()).toBe('-5');
    });

    it('repeats while a button is held', async () => {
        const { buttons, echo } = await setup({ initial: 0 });
        const increment = buttons()[1];
        increment.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }));
        await wait(700);
        window.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'mouse' }));
        const value = Number(echo());
        expect(value).toBeGreaterThan(2);
        await wait(150);
        expect(Number(echo())).toBe(value);
    });

    it('describes the input with the unit and is marked touched on blur in a Base UI Field', async () => {
        const screen = await render(
            <Field.Root>
                <Field.Label>Weight</Field.Label>
                <StepInput unit="kg" defaultValue={70} />
            </Field.Root>
        );
        const input = screen.container.querySelector('input[role=spinbutton]') as HTMLInputElement;
        const unit = document.getElementById(input.getAttribute('aria-describedby')!);
        expect(unit?.textContent?.trim()).toBe('kg');
        expect(input.labels?.[0]?.textContent).toBe('Weight');
        input.focus();
        await userEvent.keyboard('{ArrowUp}');
        expect(input.hasAttribute('data-dirty')).toBe(true);
        await userEvent.tab();
        expect(input.hasAttribute('data-touched')).toBe(true);
    });

    it('calls onFocus and onBlur of the root (Angular onFocusIn and onFocusOut)', async () => {
        const events: string[] = [];
        const { root, input } = await setup({ onFocus: () => events.push('in'), onBlur: () => events.push('out') });
        await userEvent.click(input);
        expect(events).toEqual(['in']);
        await userEvent.click(root.querySelector('#outside')!);
        expect(events).toEqual(['in', 'out']);
    });

    it('ignores values that are not numbers', async () => {
        const ui = (value: unknown) => <StepInput aria-label="Quantity" value={value as number} />;
        const screen = await render(ui(5));
        const input = screen.container.querySelector('input[role=spinbutton]') as HTMLInputElement;
        await screen.rerender(ui('12ab34'));
        expect(input.value).toBe('5');
        expect(input.getAttribute('aria-valuenow')).toBe('5');
        await screen.rerender(ui(7));
        expect(input.value).toBe('7');
        await screen.rerender(ui(null));
        expect(input.value).toBe('');
        expect(input.hasAttribute('aria-valuenow')).toBe(false);
    });

    it('announces stepped values with the unit', async () => {
        const { root, input } = await setup({ unit: 'kg', locale: 'en-US', initial: 999 });
        input.focus();
        await userEvent.keyboard('{ArrowUp}');
        expect(root.querySelector('[role=status]')!.textContent).toBe('1,000 kg');
    });

    it('calls onValueCommitted with the final value', async () => {
        const onValueCommitted = vi.fn();
        const { input, buttons } = await setup({ initial: null, min: 3, onValueCommitted });
        await userEvent.click(buttons()[1]);
        expect(onValueCommitted).toHaveBeenLastCalledWith(3, expect.anything());
        await userEvent.type(input, '0');
        expect(onValueCommitted).toHaveBeenCalledTimes(1);
        await userEvent.tab();
        expect(onValueCommitted).toHaveBeenLastCalledWith(30, expect.anything());
    });

    it('works uncontrolled and submits its value with a name', async () => {
        const onSubmit = vi.fn((event: SubmitEvent) => {
            event.preventDefault();
            return new FormData(event.target as HTMLFormElement).get('qty');
        });
        const screen = await render(
            <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
                <StepInput aria-label="Quantity" name="qty" defaultValue={2} />
                <button type="submit">Send</button>
            </form>
        );
        const input = screen.container.querySelector('input[role=spinbutton]') as HTMLInputElement;
        input.focus();
        await userEvent.keyboard('{ArrowUp}');
        expect(input.value).toBe('3');
        await userEvent.click(screen.container.querySelector('button[type=submit]')!);
        expect(onSubmit).toHaveReturnedWith('3');
    });
});

describe('StepInput options', () => {
    it('steps with Enter and Space on the buttons', async () => {
        const { buttons, echo } = await setup();
        const [decrement, increment] = buttons();
        increment.focus();
        await userEvent.keyboard('{Enter}');
        expect(echo()).toBe('6');
        await userEvent.keyboard(' ');
        expect(echo()).toBe('7');
        decrement.focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        expect(echo()).toBe('5');
    });

    it('steps by a custom step, and by ten steps with Page Up and Page Down', async () => {
        const { input, buttons, echo } = await setup({ initial: 10, step: 5 });
        await userEvent.click(buttons()[1]);
        expect(echo()).toBe('15');
        input.focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(echo()).toBe('10');
        await userEvent.keyboard('{PageUp}');
        expect(echo()).toBe('60');
        expect(input.value).toBe('60');
        await userEvent.keyboard('{PageDown}{PageDown}');
        expect(echo()).toBe('-40');
    });

    it('steps from typed text with Page Up', async () => {
        const { input, echo } = await setup({ initial: 1 });
        await userEvent.clear(input);
        await userEvent.type(input, '3');
        await userEvent.keyboard('{PageUp}');
        expect(echo()).toBe('13');
        expect(input.value).toBe('13');
    });

    it('is smaller in compact density', async () => {
        const { field, buttons, screen } = await setup();
        const cozy = {
            field: field.getBoundingClientRect().height,
            button: buttons()[0].getBoundingClientRect().width
        };
        await screen.rerender(<Host data-density="compact" />);
        expect(field.getBoundingClientRect().height).toBeLessThan(cozy.field);
        expect(buttons()[0].getBoundingClientRect().width).toBeLessThan(cozy.button);
    });

    it('shows the error state with aria-invalid and the invalid border colour', async () => {
        const { input, field, screen } = await setup();
        expect(input.hasAttribute('aria-invalid')).toBe(false);
        await screen.rerender(<Host state="error" />);
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(getComputedStyle(field).borderTopColor).toBe(tokenColor('--sapField_InvalidColor'));
        await screen.rerender(<Host state="success" />);
        expect(input.hasAttribute('aria-invalid')).toBe(false);
        expect(getComputedStyle(field).borderTopColor).toBe(tokenColor('--sapField_SuccessColor'));
    });

    it('shows the focus frame around the field while the input has the focus', async () => {
        const { input, field } = await setup();
        expect(getComputedStyle(field, '::after').display).toBe('none');
        input.focus();
        await expect.poll(() => getComputedStyle(field, '::after').display).toBe('block');
    });

    it('puts titles on the buttons and the input, and takes custom button icons', async () => {
        const ui = (icons?: Partial<StepInputProps>) => (
            <>
                <StepInput aria-label="Items" inputTitle="Number of items" {...icons} />
                <Icon id="ref-up" glyph="arrow-top" />
                <Icon id="ref-down" glyph="arrow-bottom" />
            </>
        );
        const screen = await render(ui());
        const root = screen.container;
        const [decrement, increment] = [...root.querySelectorAll('[role=group] button')];
        expect(decrement.getAttribute('title')).toBe('Decrease');
        expect(increment.getAttribute('title')).toBe('Increase');
        expect(root.querySelector('input[role=spinbutton]')!.getAttribute('title')).toBe('Number of items');
        const glyph = (el: Element) => el.querySelector('[data-glyph]')!.getAttribute('data-glyph');
        const defaultUp = glyph(increment);
        await screen.rerender(ui({ incrementButtonIcon: 'arrow-top', decrementButtonIcon: 'arrow-bottom' }));
        expect(glyph(increment)).not.toBe(defaultUp);
        expect(glyph(increment)).toBe(root.querySelector('#ref-up')!.getAttribute('data-glyph'));
        expect(glyph(decrement)).toBe(root.querySelector('#ref-down')!.getAttribute('data-glyph'));
        await screen.rerender(ui({ incrementLabel: 'Step up', decrementLabel: 'Step down' }));
        expect(increment.getAttribute('aria-label')).toBe('Step up');
        expect(decrement.getAttribute('title')).toBe('Step down');
    });

    it('puts inputId, aria-label and aria-labelledby on the input', async () => {
        const { input, buttons, screen } = await setup({ inputId: 'items-count', 'aria-label': 'Items' });
        expect(input.id).toBe('items-count');
        expect(input.getAttribute('aria-label')).toBe('Items');
        expect(buttons()[1].getAttribute('aria-controls')).toBe('items-count');
        await screen.rerender(<Host inputId="items-count" aria-labelledby="outside" />);
        expect(input.getAttribute('aria-labelledby')).toBe('outside');
    });

    it('steps with the wheel only while focused, and not with disableWheel', async () => {
        const { input, root, echo, screen } = await setup();
        const wheel = (deltaY: number) => {
            const event = new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true });
            input.dispatchEvent(event);
            return event;
        };
        expect(wheel(-100).defaultPrevented).toBe(false);
        expect(echo()).toBe('5');
        input.focus();
        expect(wheel(-100).defaultPrevented).toBe(true);
        await expect.poll(echo).toBe('6');
        wheel(100);
        await expect.poll(echo).toBe('5');
        wheel(100);
        await expect.poll(echo).toBe('4');
        root.querySelector<HTMLElement>('#outside')!.focus();
        wheel(-100);
        await wait();
        expect(echo()).toBe('4');
        await screen.rerender(<Host disableWheel />);
        input.focus();
        expect(wheel(-100).defaultPrevented).toBe(false);
        await wait();
        expect(echo()).toBe('4');
    });

    it('starts from the limit when a value at the maximum is cleared', async () => {
        const { input, buttons, echo } = await setup({ initial: 100, min: 100, max: 100 });
        await userEvent.clear(input);
        await userEvent.tab();
        expect(echo()).toBe('null');
        await userEvent.click(buttons()[1]);
        expect(echo()).toBe('100');
        await userEvent.clear(input);
        await userEvent.tab();
        expect(echo()).toBe('null');
        await userEvent.click(buttons()[0]);
        expect(echo()).toBe('100');
    });

    it('formats and parses euros in currency mode, with the sign after the field', async () => {
        const { root, input, echo } = await setup({
            initial: 1234.5,
            mode: 'currency',
            currency: 'EUR',
            locale: 'en-US'
        });
        expect(input.value).toBe('1,234.50');
        const unit = root.querySelector(`#${CSS.escape(input.getAttribute('aria-describedby')!)}`)!;
        expect(unit.textContent!.trim()).toBe('€');
        await userEvent.clear(input);
        await userEvent.type(input, '2,000.25');
        await userEvent.tab();
        expect(echo()).toBe('2000.25');
        expect(input.value).toBe('2,000.25');
    });

    it('formats with the fraction digits and grouping given, and rounds to the maximum', async () => {
        const { input, echo, screen } = await setup({ initial: 1.5, minFractionDigits: 4, locale: 'en-US' });
        expect(input.value).toBe('1.5000');
        await screen.rerender(<Host initial={1.5} maxFractionDigits={0} locale="en-US" />);
        await userEvent.clear(input);
        await userEvent.type(input, '2.6');
        await userEvent.tab();
        expect(echo()).toBe('3');
        await screen.rerender(<Host useGrouping={false} locale="en-US" />);
        await userEvent.clear(input);
        await userEvent.type(input, '12000');
        await userEvent.tab();
        expect(input.value).toBe('12000');
    });

    it('hides the buttons and blocks changes when read-only', async () => {
        const { input, buttons, echo } = await setup({ readOnly: true });
        expect(buttons()).toHaveLength(0);
        expect(input.readOnly).toBe(true);
        input.focus();
        await userEvent.keyboard('{ArrowUp}{PageUp}');
        await userEvent.type(input, '9');
        input.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }));
        await wait();
        expect(echo()).toBe('5');
        expect(input.value).toBe('5');
    });

    it('hides the buttons with hasStepButtons off, and aligns the text', async () => {
        const { input, buttons, root, screen } = await setup();
        expect(getComputedStyle(input).textAlign).toBe('end');
        await screen.rerender(<Host hasStepButtons={false} textAlign="center" fullWidth />);
        expect(buttons()).toHaveLength(0);
        expect(getComputedStyle(input).textAlign).toBe('center');
        const stepInput = root.firstElementChild as HTMLElement;
        expect(stepInput.getBoundingClientRect().width).toBe(root.getBoundingClientRect().width);
    });

    it('disables the input and both buttons', async () => {
        const { input, buttons, field, screen } = await setup();
        await screen.rerender(<Host disabled />);
        const [decrement, increment] = buttons();
        expect(input.disabled).toBe(true);
        expect(increment.disabled).toBe(true);
        expect(decrement.disabled).toBe(true);
        expect(Number(getComputedStyle(field).opacity)).toBeLessThan(1);
        // the field is dimmed, its disabled buttons are not dimmed again
        expect(Number(getComputedStyle(increment).opacity)).toBe(1);
        await screen.rerender(<Host />);
        expect(input.disabled).toBe(false);
        expect(increment.disabled).toBe(false);
        expect(decrement.disabled).toBe(false);
    });

    it('marks required inputs', async () => {
        const { input } = await setup({ required: true });
        expect(input.required).toBe(true);
        expect(input.getAttribute('aria-required')).toBe('true');
    });
});

describe('StepInput (fundamental-react)', () => {
    it('renders a div and passes className, native props, the ref and the input ref through', async () => {
        const ref = createRef<HTMLDivElement>();
        const inputRef = createRef<HTMLInputElement>();
        const screen = await render(
            <StepInput
                ref={ref}
                inputRef={inputRef}
                id="si-root"
                aria-label="Amount"
                data-sample="Sample"
                className="custom"
                inputProps={{ className: 'custom-input', 'data-input': 'yes' } as never}
            />
        );
        const root = screen.container.firstElementChild as HTMLElement;
        expect(root.tagName).toBe('DIV');
        expect(root).toBe(ref.current);
        expect(root.id).toBe('si-root');
        expect(root.getAttribute('data-sample')).toBe('Sample');
        expect(root.classList).toContain('custom');
        expect(inputRef.current?.getAttribute('role')).toBe('spinbutton');
        expect(inputRef.current?.classList).toContain('custom-input');
        expect(inputRef.current?.getAttribute('data-input')).toBe('yes');
    });

    it('calls onValueChange for typed numbers, not for other text, and for the step buttons', async () => {
        const onValueChange = vi.fn();
        const screen = await render(
            <StepInput
                aria-label="Amount"
                defaultValue={0}
                incrementLabel="Step Up"
                decrementLabel="Step Down"
                onValueChange={onValueChange}
            />
        );
        const input = screen.container.querySelector('input[role=spinbutton]') as HTMLInputElement;
        await userEvent.type(input, '4');
        expect(onValueChange).toHaveBeenCalledTimes(1);
        expect(onValueChange).toHaveBeenLastCalledWith(4, expect.anything());
        await userEvent.type(input, 'abc');
        expect(onValueChange).toHaveBeenCalledTimes(1);
        await userEvent.click(screen.container.querySelector('button[aria-label="Step Up"]')!);
        expect(onValueChange).toHaveBeenLastCalledWith(5, expect.anything());
        await userEvent.click(screen.container.querySelector('button[aria-label="Step Down"]')!);
        expect(onValueChange).toHaveBeenLastCalledWith(4, expect.anything());
        expect(onValueChange).toHaveBeenCalledTimes(3);
    });
});
