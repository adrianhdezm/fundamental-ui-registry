import { Field } from '@base-ui/react/field';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { FormInputMessageGroup } from '@/ui/form/form-input-message-group';
import { FormMessage, type FormMessageType } from '@/ui/form/form-message';
import { Input, Textarea, type FormState, type InputProps, type TextareaProps } from './input';

const opacity = (el: Element) => Number(getComputedStyle(el).opacity);

describe('Input', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('works controlled with value and onValueChange', async () => {
        const onValueChange = vi.fn();
        function Host({ initial }: { initial: string }) {
            const [value, setValue] = useState(initial);
            return (
                <>
                    <Input
                        id="model"
                        aria-label="Model"
                        value={value}
                        onValueChange={(next, details) => {
                            onValueChange(next, details);
                            setValue(next);
                        }}
                    />
                    <span id="echo">{value}</span>
                    <button id="again" onClick={() => setValue('Again')}>
                        Again
                    </button>
                </>
            );
        }
        const screen = await render(<Host initial="Hello" />);
        const input = screen.container.querySelector<HTMLInputElement>('#model')!;
        expect(input.value).toBe('Hello');
        await userEvent.clear(input);
        await userEvent.type(input, 'World');
        expect(screen.container.querySelector('#echo')!.textContent).toBe('World');
        expect(onValueChange).toHaveBeenLastCalledWith('World', expect.anything());
        // a value set by the app replaces what was typed
        await userEvent.click(screen.container.querySelector('#again')!);
        expect(input.value).toBe('Again');
    });

    it('works uncontrolled with defaultValue, tracks touched and dirty, and can be disabled', async () => {
        // touched and dirty come from a Base UI Field around the input
        const ui = (disabled: boolean) => (
            <Field.Root>
                <Input id="reactive" aria-label="Reactive" defaultValue="Initial" disabled={disabled} />
            </Field.Root>
        );
        const screen = await render(ui(false));
        const input = screen.container.querySelector<HTMLInputElement>('#reactive')!;
        expect(input.value).toBe('Initial');
        await userEvent.clear(input);
        await userEvent.type(input, 'Typed');
        expect(input.value).toBe('Typed');
        expect(input.hasAttribute('data-dirty')).toBe(true);
        await userEvent.tab();
        expect(input.hasAttribute('data-touched')).toBe(true);
        await screen.rerender(ui(true));
        expect(input.disabled).toBe(true);
        expect(opacity(input)).toBeLessThan(1);
    });

    it('states set aria-invalid only for errors and change the field colours', async () => {
        const ui = (state: FormState | null) => <Input id="model" aria-label="Model" state={state} />;
        const screen = await render(ui(null));
        const input = screen.container.querySelector<HTMLInputElement>('#model')!;
        const borders = new Set([getComputedStyle(input).borderBottomColor]);
        expect(input.hasAttribute('aria-invalid')).toBe(false);
        for (const state of ['error', 'warning', 'success', 'information'] as const) {
            await screen.rerender(ui(state));
            expect(input.getAttribute('aria-invalid')).toBe(state === 'error' ? 'true' : null);
            borders.add(getComputedStyle(input).borderBottomColor);
        }
        expect(borders.size).toBe(5);
        await screen.rerender(ui('default'));
        expect(input.hasAttribute('aria-invalid')).toBe(false);
    });

    it('native readonly keeps the value, stays focusable and uses the read-only style', async () => {
        const screen = await render(
            <>
                <Input id="readonly" aria-label="Read-only" readOnly defaultValue="Fixed" />
                <Input id="normal" aria-label="Normal" />
            </>
        );
        const readonly = screen.container.querySelector<HTMLInputElement>('#readonly')!;
        const normal = screen.container.querySelector<HTMLInputElement>('#normal')!;
        expect(getComputedStyle(readonly).backgroundColor).not.toBe(getComputedStyle(normal).backgroundColor);
        expect(getComputedStyle(readonly).opacity).toBe('1');
        await userEvent.click(readonly);
        expect(document.activeElement).toBe(readonly);
        await userEvent.keyboard('abc');
        expect(readonly.value).toBe('Fixed');
    });

    it('native disabled is dimmed and not focusable', async () => {
        const screen = await render(<Input id="disabled" aria-label="Disabled" disabled defaultValue="Off" />);
        const disabled = screen.container.querySelector<HTMLInputElement>('#disabled')!;
        expect(opacity(disabled)).toBeLessThan(1);
        expect(getComputedStyle(disabled).pointerEvents).toBe('none');
        disabled.focus();
        expect(document.activeElement).not.toBe(disabled);
    });

    it('noNumberSpinner hides the number spinner', async () => {
        const ui = (noNumberSpinner: boolean) => (
            <Input id="number" aria-label="Number" type="number" noNumberSpinner={noNumberSpinner} />
        );
        const screen = await render(ui(false));
        const number = screen.container.querySelector<HTMLInputElement>('#number')!;
        number.style.width = '200px';
        const clickSpinUp = async () => {
            number.value = '42';
            const { width } = number.getBoundingClientRect();
            await userEvent.click(number, { position: { x: width - 16, y: 10 } });
            return number.value;
        };
        expect(await clickSpinUp()).toBe('43');
        await screen.rerender(ui(true));
        expect(await clickSpinUp()).toBe('42');
    });

    it('compact density makes the field lower', async () => {
        const screen = await render(<Input id="model" aria-label="Model" />);
        const input = screen.container.querySelector<HTMLInputElement>('#model')!;
        expect(input.getBoundingClientRect().height).toBe(36);
        document.documentElement.setAttribute('data-density', 'compact');
        expect(input.getBoundingClientRect().height).toBe(26);
        // fundamental-react's `compact` prop: data-density on the field itself
        document.documentElement.removeAttribute('data-density');
        await screen.rerender(<Input id="model" aria-label="Model" data-density="compact" />);
        expect(input.getBoundingClientRect().height).toBe(26);
    });

    it('passes className, native props and the ref through', async () => {
        const ref = createRef<HTMLInputElement>();
        const props: InputProps = { className: 'wonderful-styles', 'data-sample': 'Sample' } as InputProps;
        const screen = await render(<Input ref={ref} aria-label="Spread" {...props} />);
        const input = screen.container.querySelector('input')!;
        expect(ref.current).toBe(input);
        expect(input.tagName).toBe('INPUT');
        expect(input.getAttribute('data-sample')).toBe('Sample');
        expect(input.classList).toContain('wonderful-styles');
        // the SAP field classes stay
        expect(getComputedStyle(input).height).toBe('36px');
    });

    it('works inside a Base UI Field: labelled by Field.Label, invalid from validation', async () => {
        const screen = await render(
            <Field.Root validationMode="onChange">
                <Field.Label>Email</Field.Label>
                <Input type="email" required id="email" />
            </Field.Root>
        );
        const input = screen.container.querySelector<HTMLInputElement>('#email')!;
        expect(screen.getByRole('textbox', { name: 'Email' }).element()).toBe(input);
        await userEvent.type(input, 'not-an-email');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.hasAttribute('data-invalid')).toBe(true);
    });

    it('the state message is shown while the field has focus and linked with aria-describedby', async () => {
        const ui = (type: FormMessageType) => (
            <div>
                <FormInputMessageGroup>
                    <Input id="vat" aria-label="VAT" state={type} />
                    <FormMessage type={type}>Enter a valid VAT number.</FormMessage>
                </FormInputMessageGroup>
                <button id="after">After</button>
            </div>
        );
        const screen = await render(ui('error'));
        const input = screen.container.querySelector<HTMLInputElement>('#vat')!;
        await expect.poll(() => input.getAttribute('aria-describedby')).toBeTruthy();
        const describedBy = input.getAttribute('aria-describedby')!;
        expect(input.getAttribute('aria-invalid')).toBe('true');
        const message = () => document.getElementById(describedBy)!;
        // hidden until the field has focus
        expect(message().checkVisibility()).toBe(false);
        await userEvent.click(input);
        await expect.poll(() => message().checkVisibility()).toBe(true);
        expect(message().getBoundingClientRect().top).toBeGreaterThanOrEqual(input.getBoundingClientRect().bottom - 1);
        expect(message().getAttribute('aria-live')).toBe('assertive');
        expect(message().textContent).toContain('Invalid Entry');
        expect(message().textContent).toContain('Enter a valid VAT number.');
        expect(document.activeElement).toBe(input);
        await userEvent.tab();
        expect(document.activeElement).toBe(screen.container.querySelector('#after'));
        await expect.poll(() => message().checkVisibility()).toBe(false);
        await screen.rerender(ui('warning'));
        await expect.poll(() => input.hasAttribute('aria-invalid')).toBe(false);
        expect(input.getAttribute('aria-describedby')).toBe(describedBy);
        input.focus();
        await expect.poll(() => message().checkVisibility()).toBe(true);
        expect(message().textContent).toContain('Warning');
    });
});

describe('Textarea', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('works controlled, tracks dirty and touched, and can be disabled and enabled again', async () => {
        const onValueChange = vi.fn();
        function Host({ disabled = false }: { disabled?: boolean }) {
            const [value, setValue] = useState('First line');
            return (
                <>
                    <Textarea
                        id="reactive-area"
                        aria-label="Reactive area"
                        value={value}
                        disabled={disabled}
                        onValueChange={(next, details) => {
                            onValueChange(next, details);
                            setValue(next);
                        }}
                    />
                    <button id="reset" onClick={() => setValue('Reset')}>
                        Reset
                    </button>
                </>
            );
        }
        // touched and dirty come from a Base UI Field around the textarea
        const screen = await render(
            <Field.Root>
                <Host />
            </Field.Root>
        );
        const area = screen.container.querySelector<HTMLTextAreaElement>('#reactive-area')!;
        expect(area.value).toBe('First line');
        await userEvent.click(area);
        await userEvent.keyboard('{End}{Enter}Second line');
        expect(area.value).toBe('First line\nSecond line');
        expect(onValueChange).toHaveBeenLastCalledWith('First line\nSecond line', expect.anything());
        expect(area.hasAttribute('data-dirty')).toBe(true);
        await userEvent.tab();
        expect(area.hasAttribute('data-touched')).toBe(true);
        await userEvent.click(screen.container.querySelector('#reset')!);
        expect(area.value).toBe('Reset');
        await screen.rerender(
            <Field.Root>
                <Host disabled />
            </Field.Root>
        );
        expect(area.disabled).toBe(true);
        expect(opacity(area)).toBeLessThan(1);
        await screen.rerender(
            <Field.Root>
                <Host />
            </Field.Root>
        );
        expect(area.disabled).toBe(false);
        expect(getComputedStyle(area).opacity).toBe('1');
    });

    it('styles textareas as multi-line fields', async () => {
        const screen = await render(
            <>
                <Textarea id="area" aria-label="Area" rows={3} />
                <Input id="model" aria-label="Model" />
            </>
        );
        const area = screen.container.querySelector<HTMLTextAreaElement>('#area')!;
        const input = screen.container.querySelector<HTMLInputElement>('#model')!;
        expect(area.getBoundingClientRect().height).toBeGreaterThan(input.getBoundingClientRect().height);
        expect(getComputedStyle(area).resize).toBe('none');
        expect(getComputedStyle(area).whiteSpace).toBe('pre-wrap');
        // Enter adds a line, as in a native textarea
        await userEvent.click(area);
        await userEvent.keyboard('a{Enter}b');
        expect(area.value).toBe('a\nb');
    });

    it('states set aria-invalid only for errors; read-only textareas use a dashed border', async () => {
        const ui = (p: TextareaProps) => <Textarea id="area" aria-label="Area" {...p} />;
        const screen = await render(ui({ state: 'error' }));
        const area = screen.container.querySelector<HTMLTextAreaElement>('#area')!;
        expect(area.getAttribute('aria-invalid')).toBe('true');
        await screen.rerender(ui({ state: 'warning' }));
        expect(area.hasAttribute('aria-invalid')).toBe(false);
        await screen.rerender(ui({ readOnly: true }));
        expect(getComputedStyle(area).borderBottomStyle).toBe('dashed');
    });

    it('passes className, native props and the ref through', async () => {
        const ref = createRef<HTMLTextAreaElement>();
        const props = { className: 'wonderful-styles', 'data-sample': 'Sample' } as TextareaProps;
        const screen = await render(<Textarea ref={ref} aria-label="Spread" {...props} />);
        const area = screen.container.querySelector('textarea')!;
        expect(ref.current).toBe(area);
        expect(area.tagName).toBe('TEXTAREA');
        expect(area.getAttribute('data-sample')).toBe('Sample');
        expect(area.classList).toContain('wonderful-styles');
    });

    describe('counter', () => {
        const counter = (root: HTMLElement) => root.querySelector<HTMLElement>('textarea + div');

        it('passes counterProps to the counter, which describes the textarea', async () => {
            const screen = await render(
                <Textarea
                    aria-label="Area"
                    aria-describedby="hint"
                    maxLength={1}
                    counterProps={
                        { 'data-sample': 'Sample', className: 'wonderful-styles' } as TextareaProps['counterProps']
                    }
                />
            );
            const el = counter(screen.container)!;
            expect(el.getAttribute('data-sample')).toBe('Sample');
            expect(el.classList).toContain('wonderful-styles');
            const area = screen.container.querySelector('textarea')!;
            expect(area.getAttribute('aria-describedby')).toBe(`hint ${el.id}`);
            expect(area.maxLength).toBe(1);
        });

        it('takes the initial count from value or defaultValue', async () => {
            const screen = await render(
                <Textarea
                    aria-label="Area"
                    maxLength={150}
                    value="Hello world"
                    readOnly={false}
                    onValueChange={() => {}}
                />
            );
            expect(counter(screen.container)!.textContent).toBe('139 characters left');
            await screen.rerender(<Textarea key="b" aria-label="Area" maxLength={150} defaultValue="Hello world" />);
            expect(counter(screen.container)!.textContent).toBe('139 characters left');
        });

        it('shows no counter without maxLength, with maxLength < 0, or when disabled or read-only', async () => {
            const screen = await render(<Textarea aria-label="Area" />);
            expect(counter(screen.container)).toBeNull();
            await screen.rerender(<Textarea aria-label="Area" maxLength={-1} defaultValue="Some text" />);
            expect(counter(screen.container)).toBeNull();
            await screen.rerender(<Textarea aria-label="Area" maxLength={10} disabled />);
            expect(counter(screen.container)).toBeNull();
            await screen.rerender(<Textarea aria-label="Area" maxLength={10} readOnly />);
            expect(counter(screen.container)).toBeNull();
            expect(screen.container.querySelector('textarea')!.hasAttribute('aria-describedby')).toBe(false);
        });

        it('calls onChange and updates the counter upon typing', async () => {
            const onChange = vi.fn();
            const screen = await render(<Textarea aria-label="Area" maxLength={10} onChange={onChange} />);
            await userEvent.type(screen.container.querySelector('textarea')!, 'aaa');
            expect(onChange).toHaveBeenCalledTimes(3);
            expect(onChange.mock.calls[2][0].target.value).toBe('aaa');
            expect(counter(screen.container)!.textContent).toBe('7 characters left');
        });

        it('stops at 0 characters left and uses the singular for 1', async () => {
            const screen = await render(<Textarea aria-label="Area" maxLength={5} />);
            const area = screen.container.querySelector('textarea')!;
            await userEvent.type(area, '1234');
            expect(counter(screen.container)!.textContent).toBe('1 character left');
            // the native limit stops typing at 5
            await userEvent.type(area, '56');
            expect(area.value).toBe('12345');
            expect(counter(screen.container)!.textContent).toBe('0 characters left');
            // a longer value set by the app still counts 0
            await screen.rerender(<Textarea aria-label="Area" maxLength={5} value="012345" onValueChange={() => {}} />);
            expect(counter(screen.container)!.textContent).toBe('0 characters left');
        });

        it('uses a custom localized text, singular and plural', async () => {
            const label = (count: number) => `${count} ${count === 1 ? 'char' : 'chars'} remaining`;
            const screen = await render(
                <Textarea aria-label="Area" maxLength={150} defaultValue="Hello world" charactersLeftLabel={label} />
            );
            expect(counter(screen.container)!.textContent).toBe('139 chars remaining');
            await screen.rerender(
                <Textarea key="b" aria-label="Area" maxLength={2} defaultValue="H" charactersLeftLabel={label} />
            );
            expect(counter(screen.container)!.textContent).toBe('1 char remaining');
        });
    });
});
