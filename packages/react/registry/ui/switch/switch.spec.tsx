import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Switch, type SwitchProps } from './switch';

/** The parent of a controlled switch: keeps the model in state, as Angular's ngModel host. */
function Host({ initial = false, changes, ...props }: SwitchProps & { initial?: boolean; changes?: boolean[] }) {
    const [model, setModel] = useState(initial);
    return (
        <div>
            <Switch
                id="wifi"
                aria-labelledby="ext"
                {...props}
                checked={model}
                onCheckedChange={(v) => {
                    changes?.push(v);
                    setModel(v);
                }}
                data-testid="host"
            >
                Wi-Fi
            </Switch>
            <span id="ext">External</span>
            <output data-testid="model">{String(model)}</output>
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

async function setup(initial: SwitchProps & { initial?: boolean } = {}) {
    let current = initial;
    const changes: boolean[] = [];
    const ui = (p: typeof current) => <Host {...p} changes={changes} />;
    const screen = await render(ui(current));
    const root = screen.container;
    // the pointer of an earlier test must not hover the switch
    await userEvent.hover(root.querySelector<HTMLElement>('#after')!);
    return {
        root,
        changes,
        /** The focusable `role="switch"` control, which draws the track (Angular's slider). */
        control: () => root.querySelector<HTMLElement>('[data-slot=switch]')!,
        handle: () => root.querySelector<HTMLElement>('[data-slot=switch-handle]')!,
        input: () => root.querySelector<HTMLInputElement>('input[type=checkbox]')!,
        label: () => root.querySelector<HTMLLabelElement>('label')!,
        model: () => root.querySelector('[data-testid=model]')!.textContent === 'true',
        click: (id: string) => userEvent.click(root.querySelector<HTMLElement>(`#${id}`)!),
        update: async (change: Partial<typeof current>) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

/** Clicks the label text (not the track). */
const clickText = (label: HTMLLabelElement) => userEvent.click(label.querySelector(':scope > span:last-child')!);

describe('Switch', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('renders a control with role switch and aria-checked, next to a native checkbox', async () => {
        const { control, input, label } = await setup();
        expect(control().getAttribute('role')).toBe('switch');
        expect(control().getAttribute('aria-checked')).toBe('false');
        expect(input().type).toBe('checkbox');
        expect(input().id).toBe('wifi');
        expect(label().htmlFor).toBe('wifi');
        expect(label().textContent).toContain('Wi-Fi');
        expect(control().getAttribute('aria-labelledby')).toBe('ext');
        await expect.element(page.getByRole('switch', { name: 'External', exact: true })).toBeInTheDocument();
    });

    it('controlled: click and Space toggle the model, the model updates the switch', async () => {
        const { control, input, label, model, changes, click } = await setup();
        await clickText(label());
        expect(model()).toBe(true);
        // a click on the label focuses the switch, as Angular's focus() on label click
        expect(document.activeElement).toBe(control());
        expect(input().checked).toBe(true);
        expect(control().getAttribute('aria-checked')).toBe('true');
        await userEvent.click(control());
        expect(model()).toBe(false);
        expect(document.activeElement).toBe(control());
        await userEvent.keyboard(' ');
        expect(model()).toBe(true);
        expect(control().getAttribute('aria-checked')).toBe('true');
        expect(changes).toEqual([true, false, true]);
        await click('set-false');
        expect(input().checked).toBe(false);
        expect(control().getAttribute('aria-checked')).toBe('false');
    });

    it('Enter toggles the focused switch too (fundamental-react)', async () => {
        const { control, model } = await setup();
        control().focus();
        await userEvent.keyboard('{Enter}');
        expect(model()).toBe(true);
    });

    it('uncontrolled in a form: submits its name, reports blur, and the disabled state stops changes', async () => {
        const onCheckedChange = vi.fn();
        const onBlur = vi.fn();
        const ui = (disabled: boolean) => (
            <form>
                <Switch
                    name="notifications"
                    formValue="yes"
                    defaultChecked
                    disabled={disabled}
                    onCheckedChange={onCheckedChange}
                    inputProps={{ onBlur }}
                >
                    Reactive
                </Switch>
                <button type="button" id="after">
                    After
                </button>
            </form>
        );
        const screen = await render(ui(false));
        const form = screen.container.querySelector('form')!;
        const control = screen.container.querySelector<HTMLElement>('[data-slot=switch]')!;
        const input = screen.container.querySelector<HTMLInputElement>('input[type=checkbox]')!;
        expect(new FormData(form).get('notifications')).toBe('yes');
        await userEvent.click(screen.container.querySelector('label')!);
        expect(onCheckedChange).toHaveBeenLastCalledWith(false, expect.anything());
        expect(new FormData(form).get('notifications')).toBeNull();
        await userEvent.click(screen.container.querySelector<HTMLElement>('#after')!);
        expect(onBlur).toHaveBeenCalledTimes(1);

        await screen.rerender(ui(true));
        expect(input.disabled).toBe(true);
        expect(control.getAttribute('aria-disabled')).toBe('true');
        screen.container.querySelector('label')!.click();
        control.click();
        expect(onCheckedChange).toHaveBeenCalledTimes(1);
        expect(input.checked).toBe(false);
    });

    it('checked and onCheckedChange: reports the change and follows the parent', async () => {
        const onCheckedChange = vi.fn();
        const ui = (checked: boolean) => (
            <Switch name="notifications" checked={checked} onCheckedChange={onCheckedChange}>
                Two-way
            </Switch>
        );
        const screen = await render(ui(true));
        const control = screen.container.querySelector<HTMLElement>('[data-slot=switch]')!;
        expect(control.getAttribute('aria-checked')).toBe('true');
        await userEvent.click(screen.container.querySelector('label')!);
        expect(onCheckedChange.mock.calls.map(([v]) => v)).toEqual([false]);
        // controlled: stays on until the parent changes it
        expect(control.getAttribute('aria-checked')).toBe('true');
        await screen.rerender(ui(false));
        expect(control.getAttribute('aria-checked')).toBe('false');
    });

    it('the handle slides to the other side when switched on', async () => {
        const { control, handle, click } = await setup();
        const off = handle().getBoundingClientRect().left - control().getBoundingClientRect().left;
        await click('set-true');
        const on = handle().getBoundingClientRect().left - control().getBoundingClientRect().left;
        expect(on).toBeGreaterThan(off);
    });

    it('the handle position mirrors in RTL', async () => {
        const { control, handle, root } = await setup();
        const centre = (el: HTMLElement) => el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2;
        const ltrOffset = centre(handle()) - centre(control());
        root.querySelector('[data-testid=host]')!.setAttribute('dir', 'rtl');
        await expect.poll(() => Math.sign(centre(handle()) - centre(control()))).toBe(-Math.sign(ltrOffset));
    });

    it('semantic shows accept/decline glyphs and announces the state after the name', async () => {
        const { control, root, click } = await setup({ semantic: true });
        const icons = [...control().querySelectorAll<HTMLElement>('[data-glyph]')];
        expect(icons).toHaveLength(2);
        const [accept, decline] = icons;
        expect(getComputedStyle(accept).visibility).toBe('hidden');
        expect(getComputedStyle(decline).visibility).toBe('visible');
        expect(accept.getAttribute('data-glyph')).not.toBe(decline.getAttribute('data-glyph'));
        const semanticLabel = root.querySelector<HTMLElement>('#wifi-semantic-label')!;
        expect(control().getAttribute('aria-labelledby')).toBe('ext wifi-semantic-label');
        expect(semanticLabel.textContent).toBe('Decline');
        await expect.element(page.getByRole('switch', { name: 'External Decline', exact: true })).toBeInTheDocument();
        await click('set-true');
        expect(getComputedStyle(accept).visibility).toBe('visible');
        expect(getComputedStyle(decline).visibility).toBe('hidden');
        expect(semanticLabel.textContent).toBe('Accept');
    });

    it('a semantic switch keeps its label or aria-label in the name; acceptLabel and declineLabel', async () => {
        await render(
            <div>
                <Switch semantic acceptLabel="Approved" declineLabel="Rejected" defaultChecked>
                    Request
                </Switch>
                <Switch semantic aria-label="Invoice" />
            </div>
        );
        await expect.element(page.getByRole('switch', { name: 'Request Approved', exact: true })).toBeInTheDocument();
        await expect.element(page.getByRole('switch', { name: 'Invoice Decline', exact: true })).toBeInTheDocument();
    });

    it('the semantic switch uses different track colours than the standard one', async () => {
        const { control, update } = await setup();
        const standard = getComputedStyle(control()).backgroundColor;
        await update({ semantic: true });
        expect(getComputedStyle(control()).backgroundColor).not.toBe(standard);
    });

    it('hovering the label changes the track colour, off and on', async () => {
        const { root, control, label, click } = await setup();
        for (const on of [false, true]) {
            if (on) await click('set-true');
            await userEvent.hover(root.querySelector<HTMLElement>('#after')!);
            const rest = getComputedStyle(control()).backgroundColor;
            await userEvent.hover(label());
            expect(getComputedStyle(control()).backgroundColor, on ? 'on' : 'off').not.toBe(rest);
        }
    });

    it('activeText and inactiveText replace the icons', async () => {
        const { control, click } = await setup({ activeText: 'on', inactiveText: 'off' });
        expect(control().querySelectorAll('[data-glyph]')).toHaveLength(0);
        const texts = [...control().querySelectorAll<HTMLElement>('span')].filter((s) =>
            /^(on|off)$/.test(s.textContent!)
        );
        expect(texts).toHaveLength(2);
        const visibleText = () =>
            texts.filter((t) => getComputedStyle(t).visibility === 'visible').map((t) => t.innerText);
        expect(visibleText()).toEqual(['OFF']);
        await click('set-true');
        expect(visibleText()).toEqual(['ON']);
        // the texts are not part of the name
        await expect.element(page.getByRole('switch', { name: 'External', exact: true })).toBeInTheDocument();
    });

    it('disabled stops changes and dims the switch', async () => {
        const { control, input, label, model } = await setup({ disabled: true });
        expect(input().disabled).toBe(true);
        expect(control().getAttribute('aria-disabled')).toBe('true');
        expect(Number(getComputedStyle(label()).opacity)).toBeLessThan(1);
        expect(getComputedStyle(label()).pointerEvents).toBe('none');
        label().click();
        control().click();
        expect(model()).toBe(false);
    });

    it('compact density makes the track smaller', async () => {
        const { control } = await setup();
        expect(control().getBoundingClientRect().height).toBe(24);
        expect(control().getBoundingClientRect().width).toBe(40);
        document.documentElement.setAttribute('data-density', 'compact');
        await expect.poll(() => control().getBoundingClientRect().height).toBe(20);
        expect(control().getBoundingClientRect().width).toBe(32);
    });

    it('required sets aria-required and the native required', async () => {
        const { control, input } = await setup({ required: true });
        expect(control().getAttribute('aria-required')).toBe('true');
        expect(input().required).toBe(true);
    });

    it('name lands on the native input', async () => {
        const screen = await render(
            <div>
                <Switch name="notifications">Named</Switch>
                <Switch>Unnamed</Switch>
            </div>
        );
        const [named, unnamed] = screen.container.querySelectorAll<HTMLInputElement>('input[type=checkbox]');
        expect(named.name).toBe('notifications');
        expect(unnamed.hasAttribute('name')).toBe(false);
    });

    it('each switch gets a unique generated id', async () => {
        const screen = await render(
            <div>
                <Switch>One</Switch>
                <Switch>Two</Switch>
            </div>
        );
        const inputs = [...screen.container.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
        for (const input of inputs) expect(input.id).toMatch(/^fd-switch-/);
        expect(new Set(inputs.map((i) => i.id)).size).toBe(2);
        const labels = [...screen.container.querySelectorAll('label')];
        expect(labels.map((l) => l.htmlFor)).toEqual(inputs.map((i) => i.id));
    });

    it('the control ref focuses the switch; focus shows the frame around the track', async () => {
        const control = createRef<HTMLElement>();
        const screen = await render(<Switch inputProps={{ ref: control }}>Focus</Switch>);
        const element = screen.container.querySelector<HTMLElement>('[data-slot=switch]')!;
        expect(control.current).toBe(element);
        expect(getComputedStyle(element, '::before').content).toBe('none');
        control.current!.focus();
        expect(document.activeElement).toBe(element);
        expect(getComputedStyle(element, '::before').borderTopStyle).not.toBe('none');
    });

    it('defaults to off and takes checked (fundamental-react)', async () => {
        const screen = await render(
            <div>
                <Switch data-testid="off" />
                <Switch data-testid="on" checked />
            </div>
        );
        const control = (id: string) =>
            screen.container.querySelector<HTMLElement>(`[data-testid=${id}] [data-slot=switch]`)!;
        const input = (id: string) =>
            screen.container.querySelector<HTMLInputElement>(`[data-testid=${id}] input[type=checkbox]`)!;
        expect(control('off').getAttribute('aria-checked')).toBe('false');
        expect(input('off').checked).toBe(false);
        expect(control('on').getAttribute('aria-checked')).toBe('true');
        expect(input('on').checked).toBe(true);
    });

    it('calls onCheckedChange with the event of the change (fundamental-react onChange)', async () => {
        const onCheckedChange = vi.fn();
        const screen = await render(<Switch onCheckedChange={onCheckedChange}>Label</Switch>);
        await userEvent.click(screen.container.querySelector<HTMLElement>('[data-slot=switch]')!);
        expect(onCheckedChange).toHaveBeenCalledTimes(1);
        expect(onCheckedChange.mock.calls[0][1].event).toBeInstanceOf(Event);
    });

    it('passes className, native props and the ref to the root; labelProps and inputProps', async () => {
        const ref = createRef<HTMLSpanElement>();
        const inputRef = createRef<HTMLInputElement>();
        const screen = await render(
            <Switch
                ref={ref}
                className="wonderful-styles"
                data-sample="Sample"
                labelProps={{ 'data-sample': 'Label', className: 'label-styles' } as object}
                inputProps={{ 'data-sample': 'Input', className: 'input-styles' } as object}
                inputRef={inputRef}
            >
                Label
            </Switch>
        );
        const root = screen.container.firstElementChild as HTMLElement;
        expect(ref.current).toBe(root);
        expect(root.classList).toContain('wonderful-styles');
        expect(root.getAttribute('data-sample')).toBe('Sample');
        const label = root.querySelector('label')!;
        expect(label.getAttribute('data-sample')).toBe('Label');
        expect(label.classList).toContain('label-styles');
        const control = root.querySelector<HTMLElement>('[data-slot=switch]')!;
        expect(control.getAttribute('data-sample')).toBe('Input');
        expect(control.classList).toContain('input-styles');
        expect(inputRef.current).toBe(root.querySelector('input[type=checkbox]'));
    });

    it('is named by its label, or by aria-label', async () => {
        await render(
            <div>
                <Switch>Switch label</Switch>
                <Switch aria-label="Switch" />
            </div>
        );
        await expect.element(page.getByRole('switch', { name: 'Switch label', exact: true })).toBeInTheDocument();
        await expect.element(page.getByRole('switch', { name: 'Switch', exact: true })).toBeInTheDocument();
    });

    it('uses the given id for the input, so an external label works', async () => {
        const onCheckedChange = vi.fn();
        const screen = await render(
            <div>
                <label htmlFor="external">External label</label>
                <Switch id="external" onCheckedChange={onCheckedChange} />
            </div>
        );
        expect(screen.container.querySelector('input[type=checkbox]')!.id).toBe('external');
        await userEvent.click(screen.container.querySelector<HTMLElement>('label[for=external]')!);
        expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    });
});
