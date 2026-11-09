import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Checkbox, type CheckboxProps } from './checkbox';

/** The parent of a controlled checkbox: keeps the model in state, as Angular's ngModel host. */
function Host({
    initial = false,
    changes,
    onHostClick,
    ...props
}: CheckboxProps & { initial?: unknown; changes?: unknown[]; onHostClick?: () => void }) {
    const [model, setModel] = useState<unknown>(initial);
    return (
        <div>
            <Checkbox
                label="Accept terms"
                {...props}
                value={model}
                onValueChange={(v) => {
                    changes?.push(v);
                    setModel(v);
                }}
                onClick={onHostClick}
                data-testid="host"
            />
            <output data-testid="model">{JSON.stringify(model)}</output>
            <button id="after">After</button>
            <button id="set-true" onClick={() => setModel(true)}>
                Set true
            </button>
            <button id="set-false" onClick={() => setModel(false)}>
                Set false
            </button>
        </div>
    );
}

async function setup(initial: CheckboxProps & { initial?: unknown } = {}) {
    let current = initial;
    const changes: unknown[] = [];
    const hostClick = vi.fn();
    const ui = (p: typeof current) => <Host {...p} changes={changes} onHostClick={hostClick} />;
    const screen = await render(ui(current));
    const root = screen.container;
    // the pointer of an earlier test must not hover the box
    await userEvent.hover(root.querySelector<HTMLElement>('#after')!);
    return {
        root,
        changes,
        hostClick,
        /** The focusable checkbox control (Base UI's `role="checkbox"` element). */
        control: () => root.querySelector<HTMLElement>('[data-slot=checkbox]')!,
        input: () => root.querySelector<HTMLInputElement>('input[type=checkbox]')!,
        /** The SAP-icons glyph shown in the box, if any. */
        glyph: () => root.querySelector('[data-slot=checkbox] > span')!.getAttribute('data-glyph'),
        label: () => root.querySelector<HTMLLabelElement>('label')!,
        model: () => JSON.parse(root.querySelector('[data-testid=model]')!.textContent!) as unknown,
        click: (id: string) => userEvent.click(root.querySelector<HTMLElement>(`#${id}`)!),
        update: async (change: Partial<typeof current>) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

/** Clicks the label text (not the box). */
const clickText = (label: HTMLLabelElement) => userEvent.click(label.querySelector(':scope > span:not([data-slot])')!);

describe('Checkbox', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('controlled: clicks call onValueChange and value changes update the box', async () => {
        const { control, input, label, model, changes, click } = await setup();
        expect(input().checked).toBe(false);
        expect(control().getAttribute('aria-checked')).toBe('false');
        await clickText(label());
        expect(model()).toBe(true);
        expect(input().checked).toBe(true);
        expect(control().getAttribute('aria-checked')).toBe('true');
        expect(changes).toEqual([true]);
        await click('set-false');
        expect(input().checked).toBe(false);
        expect(control().getAttribute('aria-checked')).toBe('false');
    });

    it('uncontrolled in a form: submits its name, reports blur, and the disabled state stops changes', async () => {
        const onCheckedChange = vi.fn();
        const onFocusChange = vi.fn();
        const ui = (disabled: boolean) => (
            <form data-testid="form">
                <Checkbox
                    label="Newsletter"
                    name="newsletter"
                    formValue="yes"
                    defaultChecked
                    disabled={disabled}
                    onCheckedChange={onCheckedChange}
                    onFocusChange={onFocusChange}
                />
                <button type="button" id="after">
                    After
                </button>
            </form>
        );
        const screen = await render(ui(false));
        const form = screen.container.querySelector<HTMLFormElement>('form')!;
        const control = screen.container.querySelector<HTMLElement>('[data-slot=checkbox]')!;
        const input = screen.container.querySelector<HTMLInputElement>('input[type=checkbox]')!;
        expect(new FormData(form).get('newsletter')).toBe('yes');
        await userEvent.click(control);
        expect(onCheckedChange).toHaveBeenLastCalledWith(false, expect.anything());
        expect(new FormData(form).get('newsletter')).toBeNull();
        await userEvent.click(screen.container.querySelector<HTMLElement>('#after')!);
        expect(onFocusChange.mock.calls.map(([f]) => f)).toEqual([true, false]);

        await screen.rerender(ui(true));
        expect(input.disabled).toBe(true);
        expect(control.getAttribute('aria-disabled')).toBe('true');
        screen.container.querySelector('label')!.click();
        control.click();
        expect(onCheckedChange).toHaveBeenCalledTimes(1);
        expect(input.checked).toBe(false);

        await screen.rerender(ui(false));
        expect(input.disabled).toBe(false);
        await userEvent.click(control);
        expect(input.checked).toBe(true);
    });

    it('the disabled checkbox stops changes', async () => {
        const { input, control, label, model } = await setup({ disabled: true });
        expect(input().disabled).toBe(true);
        expect(control().getAttribute('aria-disabled')).toBe('true');
        expect(getComputedStyle(label()).pointerEvents).toBe('none');
        expect(getComputedStyle(label()).opacity).toBe('0.4');
        label().click();
        expect(model()).toBe(false);
    });

    it('Space toggles the focused checkbox', async () => {
        const { control, model } = await setup();
        control().focus();
        await userEvent.keyboard(' ');
        expect(model()).toBe(true);
        await userEvent.keyboard(' ');
        expect(model()).toBe(false);
        // Enter does not toggle a checkbox
        await userEvent.keyboard('{Enter}');
        expect(model()).toBe(false);
    });

    it('the label and the box toggle, and the root onClick fires once per click', async () => {
        const { control, input, label, model, hostClick } = await setup();
        await clickText(label());
        expect(model()).toBe(true);
        expect(hostClick).toHaveBeenCalledTimes(1);
        await userEvent.click(control());
        expect(model()).toBe(false);
        expect(hostClick).toHaveBeenCalledTimes(2);
        expect(label().htmlFor).toBe(input().id);
        expect(document.activeElement).toBe(control());
    });

    it('tristate cycles unchecked → indeterminate → checked → unchecked when tristateSelectable', async () => {
        const { control, input, label, model, changes } = await setup({ tristate: true, tristateSelectable: true });
        await clickText(label());
        expect(model()).toBe(null);
        expect(input().indeterminate).toBe(true);
        expect(control().getAttribute('aria-checked')).toBe('mixed');
        await clickText(label());
        expect(model()).toBe(true);
        expect(input().indeterminate).toBe(false);
        expect(control().getAttribute('aria-checked')).toBe('true');
        await clickText(label());
        expect(model()).toBe(false);
        expect(control().getAttribute('aria-checked')).toBe('false');
        expect(changes).toEqual([null, true, false]);
    });

    it('a tristate checkbox that is not selectable leaves the mixed state but never returns to it', async () => {
        const { control, label, model } = await setup({ tristate: true, initial: null });
        expect(control().getAttribute('aria-checked')).toBe('mixed');
        await clickText(label());
        expect(model()).toBe(true);
        await clickText(label());
        expect(model()).toBe(false);
        await clickText(label());
        expect(model()).toBe(true);
    });

    it('without tristate, the third state value shows as unchecked', async () => {
        const { control, input } = await setup({ initial: null });
        expect(input().indeterminate).toBe(false);
        expect(control().getAttribute('aria-checked')).toBe('false');
    });

    it('custom values map to checked, unchecked and indeterminate', async () => {
        const values = { trueValue: 'yes', falseValue: 'no', thirdStateValue: { partial: 1 } };
        const { control, input, label, model, update } = await setup({
            values,
            tristate: true,
            tristateSelectable: true,
            initial: 'no'
        });
        expect(control().getAttribute('aria-checked')).toBe('false');
        await clickText(label());
        expect(model()).toEqual({ partial: 1 });
        expect(control().getAttribute('aria-checked')).toBe('mixed');
        await clickText(label());
        expect(model()).toBe('yes');
        expect(input().checked).toBe(true);
        // a controlled value from outside, compared shallowly
        const ui = (value: unknown) => <Checkbox label="Custom" values={values} tristate value={value} />;
        const screen = await render(ui({ partial: 1 }));
        const other = () => screen.container.querySelector<HTMLElement>('[data-slot=checkbox]')!;
        expect(other().getAttribute('aria-checked')).toBe('mixed');
        await screen.rerender(ui('no'));
        expect(other().getAttribute('aria-checked')).toBe('false');
        await screen.rerender(ui('yes'));
        expect(other().getAttribute('aria-checked')).toBe('true');
        await update({});
    });

    it('error state sets aria-invalid; other states colour the box but are valid', async () => {
        const { control, update } = await setup();
        const defaultBorder = getComputedStyle(control()).borderColor;
        expect(control().hasAttribute('aria-invalid')).toBe(false);
        const borders = new Set<string>([defaultBorder]);
        for (const state of ['error', 'warning', 'success', 'information'] as const) {
            await update({ state });
            expect(control().getAttribute('aria-invalid'), state).toBe(state === 'error' ? 'true' : null);
            borders.add(getComputedStyle(control()).borderColor);
        }
        expect(borders.size).toBe(5);
    });

    it('clearing the state removes the state colour and aria-invalid', async () => {
        const { control, update } = await setup();
        const defaultBorder = getComputedStyle(control()).borderColor;
        await update({ state: 'error' });
        expect(control().getAttribute('aria-invalid')).toBe('true');
        expect(getComputedStyle(control()).borderColor).not.toBe(defaultBorder);

        await update({ state: null });
        expect(control().hasAttribute('aria-invalid')).toBe(false);
        expect(getComputedStyle(control()).borderColor).toBe(defaultBorder);

        await update({ state: 'warning' });
        expect(getComputedStyle(control()).borderColor).not.toBe(defaultBorder);
        await update({ state: 'default' });
        expect(control().hasAttribute('aria-invalid')).toBe(false);
        expect(getComputedStyle(control()).borderColor).toBe(defaultBorder);
    });

    it('readOnly keeps the value, stays focusable and sets aria-readonly', async () => {
        const { control, input, label, model, changes } = await setup({ readOnly: true, initial: true });
        expect(control().getAttribute('aria-readonly')).toBe('true');
        expect(input().disabled).toBe(false);
        label().click();
        control().click();
        expect(model()).toBe(true);
        control().focus();
        expect(document.activeElement).toBe(control());
        await userEvent.keyboard(' ');
        expect(model()).toBe(true);
        expect(input().checked).toBe(true);
        expect(changes).toEqual([]);
    });

    it('displayOnly shows the value as a glyph without a box and ignores clicks', async () => {
        const { control, input, label, model, click, glyph } = await setup({ displayOnly: true });
        expect(input().disabled).toBe(true);
        const unchecked = glyph();
        expect(unchecked).toBeTruthy();
        expect(getComputedStyle(control()).borderTopWidth).toBe('0px');
        expect(getComputedStyle(label()).opacity).toBe('1');
        label().click();
        control().click();
        expect(model()).toBe(false);
        await click('set-true');
        expect(glyph()).toBeTruthy();
        expect(glyph()).not.toBe(unchecked);
    });

    it('a checked box shows the check glyph; unchecked shows none; the glyph is not part of the name', async () => {
        const { control, click, glyph } = await setup();
        expect(glyph()).toBeNull();
        await click('set-true');
        expect(glyph()).toBeTruthy();
        expect(control().querySelector('[data-glyph]')!.getAttribute('aria-hidden')).toBe('true');
        await expect.element(page.getByRole('checkbox', { name: 'Accept terms', exact: true })).toBeInTheDocument();
    });

    it('required sets aria-required and shows the asterisk', async () => {
        const { control, input, label } = await setup({ required: true });
        expect(control().getAttribute('aria-required')).toBe('true');
        expect(input().required).toBe(true);
        const text = label().querySelector(':scope > span:not([data-slot]) > span')!;
        expect(getComputedStyle(text, '::after').content).toContain('*');
    });

    it('compact density shrinks the box', async () => {
        const { control } = await setup();
        expect(control().getBoundingClientRect().width).toBe(22);
        document.documentElement.setAttribute('data-density', 'compact');
        await expect.poll(() => control().getBoundingClientRect().width).toBe(16);
    });

    it('wrapLabel lets long labels wrap; valignLabel top aligns the box with the first line', async () => {
        const ui = (valignLabel: 'top' | 'middle') => (
            <div style={{ width: 120 }}>
                <Checkbox
                    label="A very long label text that has to wrap onto several lines"
                    wrapLabel
                    valignLabel={valignLabel}
                />
            </div>
        );
        const screen = await render(ui('middle'));
        const label = screen.container.querySelector('label')!;
        const box = label.querySelector<HTMLElement>('[data-slot=checkbox]')!;
        const text = label.querySelector<HTMLElement>(':scope > span:not([data-slot])')!;
        expect(text.getBoundingClientRect().height).toBeGreaterThan(30);
        const middleOffset = box.getBoundingClientRect().top - label.getBoundingClientRect().top;
        await screen.rerender(ui('top'));
        const topOffset = box.getBoundingClientRect().top - label.getBoundingClientRect().top;
        expect(topOffset).toBeLessThan(middleOffset);
    });

    it('focus and blur call onFocusChange; the control ref focuses it', async () => {
        const onFocusChange = vi.fn();
        const control = createRef<HTMLElement>();
        const screen = await render(
            <div>
                <Checkbox label="Focus" onFocusChange={onFocusChange} inputProps={{ ref: control }} />
                <button>After</button>
            </div>
        );
        control.current!.focus();
        expect(document.activeElement).toBe(screen.container.querySelector('[data-slot=checkbox]'));
        await userEvent.tab();
        expect(onFocusChange.mock.calls.map(([f]) => f)).toEqual([true, false]);
    });

    it('the label shows the focus indicator while the control has focus', async () => {
        const { control, label } = await setup();
        expect(getComputedStyle(label()).outlineStyle).toBe('none');
        control().focus();
        expect(getComputedStyle(label()).outlineStyle).not.toBe('none');
        expect(getComputedStyle(control()).outlineStyle).toBe('none');
    });

    it('checked, defaultChecked and indeterminate (fundamental-react)', async () => {
        const onCheckedChange = vi.fn();
        const screen = await render(
            <div>
                <Checkbox data-testid="checked" checked onCheckedChange={onCheckedChange}>
                    Checked
                </Checkbox>
                <Checkbox data-testid="default" defaultChecked>
                    Default
                </Checkbox>
                <Checkbox data-testid="mixed" indeterminate>
                    Mixed
                </Checkbox>
            </div>
        );
        const input = (id: string) =>
            screen.container.querySelector<HTMLInputElement>(`[data-testid=${id}] input[type=checkbox]`)!;
        const control = (id: string) =>
            screen.container.querySelector<HTMLElement>(`[data-testid=${id}] [data-slot=checkbox]`)!;
        expect(input('checked').checked).toBe(true);
        expect(input('default').checked).toBe(true);
        expect(input('mixed').indeterminate).toBe(true);
        expect(control('mixed').getAttribute('aria-checked')).toBe('mixed');

        // controlled: reports the change, keeps the value until the parent changes it
        await userEvent.click(control('checked'));
        expect(onCheckedChange).toHaveBeenCalledWith(false, expect.anything());
        expect(input('checked').checked).toBe(true);
        // indeterminate stays shown while the value underneath toggles
        await userEvent.click(control('mixed'));
        expect(control('mixed').getAttribute('aria-checked')).toBe('mixed');
        expect(input('mixed').checked).toBe(true);
    });

    it('is named by its label, or by aria-label', async () => {
        const screen = await render(
            <div>
                <Checkbox>Text Option</Checkbox>
                <Checkbox aria-label="Select row" />
            </div>
        );
        await expect.element(page.getByRole('checkbox', { name: 'Text Option', exact: true })).toBeInTheDocument();
        await expect.element(page.getByRole('checkbox', { name: 'Select row', exact: true })).toBeInTheDocument();
        // no label: the empty text container is hidden
        const empty = screen.container.querySelectorAll('label')[1].querySelector(':scope > span:not([data-slot])')!;
        expect(getComputedStyle(empty).display).toBe('none');
    });

    it('passes className, native props and the ref to the root; labelProps, inputProps and the class props', async () => {
        const ref = createRef<HTMLSpanElement>();
        const screen = await render(
            <Checkbox
                ref={ref}
                className="wonderful-styles"
                data-sample="Sample"
                labelClassName="label-styles"
                textClassName="text-styles"
                labelProps={{ 'data-sample': 'Label' } as object}
                inputProps={{ 'data-sample': 'Input', className: 'input-styles' } as object}
                title="Tooltip"
            >
                Label
            </Checkbox>
        );
        const root = screen.container.firstElementChild as HTMLElement;
        expect(ref.current).toBe(root);
        expect(root.tagName).toBe('SPAN');
        expect(root.classList).toContain('wonderful-styles');
        expect(root.getAttribute('data-sample')).toBe('Sample');
        const label = root.querySelector('label')!;
        expect(label.getAttribute('data-sample')).toBe('Label');
        expect(label.classList).toContain('label-styles');
        expect(label.title).toBe('Tooltip');
        const control = root.querySelector<HTMLElement>('[data-slot=checkbox]')!;
        expect(control.getAttribute('data-sample')).toBe('Input');
        expect(control.classList).toContain('input-styles');
        expect(root.querySelector('.text-styles')!.textContent).toBe('Label');
    });

    it('uses the given id for the input, so an external label works', async () => {
        const onCheckedChange = vi.fn();
        const screen = await render(
            <div>
                <label htmlFor="external">External label</label>
                <Checkbox id="external" label="Option" onCheckedChange={onCheckedChange} />
            </div>
        );
        expect(screen.container.querySelector('input[type=checkbox]')!.id).toBe('external');
        await userEvent.click(screen.container.querySelector<HTMLElement>('label[for=external]')!);
        expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    });
});
