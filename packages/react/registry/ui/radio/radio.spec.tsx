import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Radio, RadioGroup, type RadioGroupProps, type RadioState } from './radio';

interface HostProps {
    initial?: string | null;
    disabledOption?: string | null;
    readOnly?: boolean;
    state?: RadioState;
    changes?: unknown[];
    group?: Partial<RadioGroupProps<string>>;
}

/** The parent of a controlled group: keeps the model in state, as Angular's ngModel host. */
function Host({
    initial = 'm',
    disabledOption = null,
    readOnly = false,
    state = 'default',
    changes,
    group
}: HostProps) {
    const [model, setModel] = useState<string | null>(initial);
    return (
        <div>
            <button id="before">Before</button>
            <RadioGroup
                aria-label="Size"
                name="size"
                {...group}
                value={model}
                onValueChange={(v) => {
                    changes?.push(v);
                    setModel(v);
                }}
            >
                {['s', 'm', 'l'].map((option) => (
                    <Radio
                        key={option}
                        value={option}
                        disabled={option === disabledOption}
                        readOnly={readOnly}
                        state={state}
                    >
                        {option}
                    </Radio>
                ))}
            </RadioGroup>
            <output data-testid="model">{JSON.stringify(model)}</output>
            <button id="after">After</button>
            <button id="set-s" onClick={() => setModel('s')}>
                Set s
            </button>
            <button id="set-null" onClick={() => setModel(null)}>
                Clear
            </button>
        </div>
    );
}

async function setup(initial: HostProps = {}) {
    let current = initial;
    const changes: unknown[] = [];
    const ui = (p: HostProps) => <Host {...p} changes={changes} />;
    const screen = await render(ui(current));
    const root = screen.container;
    // the pointer of an earlier test must not hover a circle
    await userEvent.hover(root.querySelector<HTMLElement>('#after')!);
    return {
        root,
        changes,
        /** The focusable radio controls (Base UI's `role="radio"` elements). */
        controls: () => [...root.querySelectorAll<HTMLElement>('[data-slot=radio]')],
        inputs: () => [...root.querySelectorAll<HTMLInputElement>('input[type=radio]')],
        labels: () => [...root.querySelectorAll<HTMLLabelElement>('label')],
        model: () => JSON.parse(root.querySelector('[data-testid=model]')!.textContent!) as unknown,
        click: (id: string) => userEvent.click(root.querySelector<HTMLElement>(`#${id}`)!),
        update: async (change: Partial<HostProps>) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

const checkedStates = (controls: HTMLElement[]) => controls.map((c) => c.getAttribute('aria-checked'));
/** The label text (not the circle). */
const text = (label: HTMLLabelElement) => label.querySelector<HTMLElement>(':scope > span:not([data-slot])')!;

describe('Radio', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('controlled: the value selects one radio, a click calls onValueChange, null selects none', async () => {
        const { controls, inputs, labels, model, changes, click } = await setup();
        expect(checkedStates(controls())).toEqual(['false', 'true', 'false']);
        expect(inputs().map((i) => i.checked)).toEqual([false, true, false]);
        expect(inputs().every((i) => i.name === 'size')).toBe(true);
        await userEvent.click(text(labels()[2]));
        expect(model()).toBe('l');
        expect(changes).toEqual(['l']);
        expect(checkedStates(controls())).toEqual(['false', 'false', 'true']);
        await click('set-s');
        expect(checkedStates(controls())).toEqual(['true', 'false', 'false']);
        await click('set-null');
        expect(checkedStates(controls())).toEqual(['false', 'false', 'false']);
    });

    it('uncontrolled in a form: submits the group name, and a disabled group stops changes', async () => {
        const onValueChange = vi.fn();
        const ui = (disabled: boolean) => (
            <form>
                <RadioGroup
                    aria-label="Color"
                    name="color"
                    defaultValue="red"
                    disabled={disabled}
                    onValueChange={onValueChange}
                >
                    <Radio value="red">Red</Radio>
                    <Radio value="blue">Blue</Radio>
                </RadioGroup>
            </form>
        );
        const screen = await render(ui(false));
        const form = screen.container.querySelector('form')!;
        const controls = [...screen.container.querySelectorAll<HTMLElement>('[data-slot=radio]')];
        const inputs = [...screen.container.querySelectorAll<HTMLInputElement>('input[type=radio]')];
        expect(new FormData(form).get('color')).toBe('red');
        await userEvent.click(screen.container.querySelectorAll('label')[1]);
        expect(onValueChange).toHaveBeenLastCalledWith('blue', expect.anything());
        expect(new FormData(form).get('color')).toBe('blue');

        await screen.rerender(ui(true));
        expect(inputs.every((i) => i.disabled)).toBe(true);
        expect(controls.every((c) => c.getAttribute('aria-disabled') === 'true')).toBe(true);
        expect(screen.container.querySelector('[role=radiogroup]')!.getAttribute('aria-disabled')).toBe('true');
        screen.container.querySelectorAll('label')[0].click();
        controls[0].click();
        expect(onValueChange).toHaveBeenCalledTimes(1);
        expect(controls[1].getAttribute('aria-checked')).toBe('true');
    });

    it('a value from outside selects the radio (Angular selectedValue)', async () => {
        const ui = (value: string) => (
            <RadioGroup aria-label="Fruit" value={value}>
                <Radio value="apple">Apple</Radio>
                <Radio value="pear">Pear</Radio>
            </RadioGroup>
        );
        const screen = await render(ui('pear'));
        const controls = () => [...screen.container.querySelectorAll<HTMLElement>('[data-slot=radio]')];
        expect(checkedStates(controls())).toEqual(['false', 'true']);
        await screen.rerender(ui('apple'));
        expect(checkedStates(controls())).toEqual(['true', 'false']);
    });

    it('arrow keys move the selection inside the group; only the checked radio is tabbable', async () => {
        const { controls, model, root } = await setup();
        root.querySelector<HTMLButtonElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(controls()[1]);
        await userEvent.tab();
        expect(document.activeElement).toBe(root.querySelector('#after'));
        controls()[1].focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(controls()[2]);
        expect(model()).toBe('l');
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(controls()[0]);
        expect(model()).toBe('s');
        await userEvent.keyboard('{ArrowUp}');
        expect(model()).toBe('l');
        await userEvent.keyboard('{ArrowLeft}');
        expect(model()).toBe('m');
        await userEvent.keyboard('{ArrowRight}');
        expect(model()).toBe('l');
    });

    it('arrow keys skip disabled radios', async () => {
        const { controls, model } = await setup({ disabledOption: 'l' });
        controls()[1].focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(controls()[0]);
        expect(model()).toBe('s');
    });

    it('Space selects the focused radio; Enter does not', async () => {
        const { controls, model } = await setup({ initial: null });
        controls()[0].focus();
        await userEvent.keyboard('{Enter}');
        expect(model()).toBe(null);
        await userEvent.keyboard(' ');
        expect(model()).toBe('s');
    });

    it('a disabled radio cannot be selected and is dimmed', async () => {
        const { controls, inputs, labels, model } = await setup({ disabledOption: 's' });
        expect(inputs()[0].disabled).toBe(true);
        expect(controls()[0].getAttribute('aria-disabled')).toBe('true');
        expect(Number(getComputedStyle(labels()[0]).opacity)).toBeLessThan(1);
        expect(getComputedStyle(labels()[0]).pointerEvents).toBe('none');
        labels()[0].click();
        controls()[0].click();
        expect(model()).toBe('m');
    });

    it('a radio that is not read-only has no aria-description', async () => {
        const { controls, update } = await setup();
        expect(controls().every((c) => !c.hasAttribute('aria-description'))).toBe(true);
        await update({ readOnly: true });
        expect(controls()[0].getAttribute('aria-description')).toContain('read-only');
        await update({ readOnly: false });
        expect(controls()[0].hasAttribute('aria-description')).toBe(false);
    });

    it('readOnly keeps the value, stays focusable and is described as read-only', async () => {
        const { controls, inputs, labels, model, changes } = await setup({ readOnly: true });
        expect(inputs()[0].readOnly).toBe(true);
        // role="radio" has no aria-readonly: the description announces it, as in Angular
        expect(controls()[0].hasAttribute('aria-readonly')).toBe(false);
        expect(controls()[0].hasAttribute('data-readonly')).toBe(true);
        expect(controls()[0].getAttribute('aria-description')).toContain('read-only');
        await userEvent.click(text(labels()[0]));
        expect(model()).toBe('m');
        expect(checkedStates(controls())).toEqual(['false', 'true', 'false']);
        expect(document.activeElement).toBe(controls()[0]);
        await userEvent.keyboard(' ');
        await userEvent.keyboard('{ArrowDown}');
        expect(model()).toBe('m');
        expect(changes).toEqual([]);
    });

    it('a read-only group keeps its value and describes every radio', async () => {
        const { controls, labels, model, root } = await setup({ group: { readOnly: true } });
        expect(root.querySelector('[role=radiogroup]')!.getAttribute('aria-readonly')).toBe('true');
        expect(controls().every((c) => c.getAttribute('aria-description')?.includes('read-only'))).toBe(true);
        await userEvent.click(text(labels()[2]));
        expect(model()).toBe('m');
    });

    it('error state sets aria-invalid; every state colours the circle', async () => {
        const { controls, update } = await setup();
        const border = () => getComputedStyle(controls()[0]).borderTopColor;
        const colors = new Set([border()]);
        expect(controls()[0].hasAttribute('aria-invalid')).toBe(false);
        for (const state of ['error', 'warning', 'success', 'information'] as const) {
            await update({ state });
            expect(controls()[0].getAttribute('aria-invalid'), state).toBe(state === 'error' ? 'true' : null);
            colors.add(border());
        }
        expect(colors.size).toBe(5);
        await update({ state: 'default' });
        expect(controls()[0].hasAttribute('aria-invalid')).toBe(false);
    });

    it('the checked radio shows the dot', async () => {
        const { controls, click } = await setup();
        const dot = (i: number) => controls()[i].querySelector('span');
        expect(dot(1)).not.toBeNull();
        expect(getComputedStyle(dot(1)!).width).toBe('12px');
        expect(dot(0)).toBeNull();
        await click('set-s');
        expect(dot(0)).not.toBeNull();
        expect(dot(1)).toBeNull();
    });

    it('compact density shrinks the circle and the dot', async () => {
        const { controls } = await setup();
        expect(controls()[0].getBoundingClientRect().width).toBe(22);
        document.documentElement.setAttribute('data-density', 'compact');
        await expect.poll(() => controls()[0].getBoundingClientRect().width).toBe(16);
        expect(controls()[1].querySelector('span')!.getBoundingClientRect().width).toBe(8);
    });

    it('the label shows the focus indicator while the radio has focus', async () => {
        const { controls, labels } = await setup();
        expect(getComputedStyle(labels()[1]).outlineStyle).toBe('none');
        controls()[1].focus();
        expect(getComputedStyle(labels()[1]).outlineStyle).not.toBe('none');
        expect(getComputedStyle(controls()[1]).outlineStyle).toBe('none');
    });

    it('wrapLabel lets long labels wrap; valignLabel top aligns the circle with the first line', async () => {
        const ui = (valignLabel: 'top' | 'middle') => (
            <div style={{ width: 120 }}>
                <RadioGroup aria-label="Wrap">
                    <Radio value="a" wrapLabel valignLabel={valignLabel}>
                        A very long label text that has to wrap onto several lines
                    </Radio>
                </RadioGroup>
            </div>
        );
        const screen = await render(ui('middle'));
        const label = screen.container.querySelector('label')!;
        const circle = label.querySelector<HTMLElement>('[data-slot=radio]')!;
        expect(text(label).getBoundingClientRect().height).toBeGreaterThan(30);
        const middleOffset = circle.getBoundingClientRect().top - label.getBoundingClientRect().top;
        await screen.rerender(ui('top'));
        const topOffset = circle.getBoundingClientRect().top - label.getBoundingClientRect().top;
        expect(topOffset).toBeLessThan(middleOffset);
    });

    it('a long label is truncated without wrapLabel', async () => {
        const screen = await render(
            <div style={{ width: 120 }}>
                <RadioGroup aria-label="Truncate">
                    <Radio value="a">A very long label text that does not fit</Radio>
                </RadioGroup>
            </div>
        );
        const label = screen.container.querySelector('label')!;
        expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(120);
        expect(getComputedStyle(text(label)).textOverflow).toBe('ellipsis');
        expect(text(label).getBoundingClientRect().height).toBeLessThan(20);
    });

    it('required marks the group as required', async () => {
        const { root, inputs } = await setup({ group: { required: true } });
        expect(root.querySelector('[role=radiogroup]')!.getAttribute('aria-required')).toBe('true');
        expect(inputs().every((i) => i.required)).toBe(true);
    });

    it('is named by its label, or by aria-label', async () => {
        const screen = await render(
            <RadioGroup aria-label="Options">
                <Radio value="a">Text Option</Radio>
                <Radio value="b" aria-label="Select row" />
            </RadioGroup>
        );
        await expect.element(page.getByRole('radio', { name: 'Text Option', exact: true })).toBeInTheDocument();
        await expect.element(page.getByRole('radio', { name: 'Select row', exact: true })).toBeInTheDocument();
        await expect.element(page.getByRole('radiogroup', { name: 'Options' })).toBeInTheDocument();
        // no label: the empty text is hidden
        const empty = text(screen.container.querySelectorAll('label')[1]);
        expect(getComputedStyle(empty).display).toBe('none');
    });

    it('uses the given id for the input, so an external label works', async () => {
        const onValueChange = vi.fn();
        const screen = await render(
            <div>
                <label htmlFor="external">External label</label>
                <RadioGroup aria-label="Options" onValueChange={onValueChange}>
                    <Radio id="external" value="a">
                        Option
                    </Radio>
                </RadioGroup>
            </div>
        );
        expect(screen.container.querySelector('input[type=radio]')!.id).toBe('external');
        await userEvent.click(screen.container.querySelector<HTMLElement>('label[for=external]')!);
        expect(onValueChange).toHaveBeenCalledWith('a', expect.anything());
    });

    it('a group onValueChange gets the value of the selected radio, of any type (fundamental-react data)', async () => {
        const onValueChange = vi.fn();
        const data = { test3: 'nice' };
        const screen = await render(
            <RadioGroup<unknown> aria-label="Options" onValueChange={onValueChange}>
                <Radio value="test">Option 1</Radio>
                <Radio value={data}>Option 3</Radio>
            </RadioGroup>
        );
        await userEvent.click(screen.container.querySelectorAll('label')[1]);
        expect(onValueChange).toHaveBeenCalledTimes(1);
        expect(onValueChange.mock.calls[0][0]).toBe(data);
    });

    it('a disabled group disables every radio (fundamental-react)', async () => {
        const screen = await render(
            <RadioGroup aria-label="Options" disabled>
                <Radio value="1">Option 1</Radio>
                <Radio value="2">Option 2</Radio>
            </RadioGroup>
        );
        const inputs = [...screen.container.querySelectorAll<HTMLInputElement>('input[type=radio]')];
        expect(inputs.every((i) => i.disabled)).toBe(true);
        const labels = [...screen.container.querySelectorAll('label')];
        expect(labels.every((l) => getComputedStyle(l).pointerEvents === 'none')).toBe(true);
    });

    it('inline shows the radios in a row (fundamental-react)', async () => {
        const ui = (inline: boolean) => (
            <RadioGroup aria-label="Options" inline={inline}>
                <Radio value="1">Option 1</Radio>
                <Radio value="2">Option 2</Radio>
            </RadioGroup>
        );
        const screen = await render(ui(false));
        const roots = () => [...screen.container.querySelectorAll('[role=radiogroup] > span')];
        expect(roots()[1].getBoundingClientRect().top).toBeGreaterThan(roots()[0].getBoundingClientRect().top);
        await screen.rerender(ui(true));
        expect(roots()[1].getBoundingClientRect().top).toBe(roots()[0].getBoundingClientRect().top);
        expect(roots()[1].getBoundingClientRect().left).toBeGreaterThan(roots()[0].getBoundingClientRect().left);
    });

    it('checked and defaultChecked of fundamental-react are the group value and defaultValue', async () => {
        const screen = await render(
            <div>
                <RadioGroup aria-label="Controlled" value="b">
                    <Radio value="a">A</Radio>
                    <Radio value="b">B</Radio>
                </RadioGroup>
                <RadioGroup aria-label="Uncontrolled" defaultValue="d">
                    <Radio value="c">C</Radio>
                    <Radio value="d">D</Radio>
                </RadioGroup>
            </div>
        );
        const controls = [...screen.container.querySelectorAll<HTMLElement>('[data-slot=radio]')];
        expect(checkedStates(controls)).toEqual(['false', 'true', 'false', 'true']);
        // controlled: a click does not change the value until the parent does
        await userEvent.click(screen.container.querySelectorAll('label')[0]);
        expect(controls[1].getAttribute('aria-checked')).toBe('true');
        // uncontrolled: the group owns the value
        await userEvent.click(screen.container.querySelectorAll('label')[2]);
        expect(controls[2].getAttribute('aria-checked')).toBe('true');
    });

    it('passes className, native props and the ref to the root; labelProps, inputProps, inputRef and the class props', async () => {
        const ref = createRef<HTMLSpanElement>();
        const inputRef = createRef<HTMLInputElement>();
        const control = createRef<HTMLElement>();
        const groupRef = createRef<HTMLDivElement>();
        const screen = await render(
            <RadioGroup ref={groupRef} aria-label="Options" className="group-styles" data-sample="Group">
                <Radio
                    value="a"
                    ref={ref}
                    inputRef={inputRef}
                    className="wonderful-styles"
                    data-sample="Sample"
                    labelClassName="label-styles"
                    textClassName="text-styles"
                    labelProps={{ 'data-sample': 'Label' } as object}
                    inputProps={{ 'data-sample': 'Input', className: 'input-styles', ref: control } as object}
                    title="Tooltip"
                >
                    Label
                </Radio>
            </RadioGroup>
        );
        const group = screen.container.querySelector<HTMLElement>('[role=radiogroup]')!;
        expect(groupRef.current).toBe(group);
        expect(group.classList).toContain('group-styles');
        expect(group.getAttribute('data-sample')).toBe('Group');
        const root = group.firstElementChild as HTMLElement;
        expect(ref.current).toBe(root);
        expect(root.tagName).toBe('SPAN');
        expect(root.classList).toContain('wonderful-styles');
        expect(root.getAttribute('data-sample')).toBe('Sample');
        const label = root.querySelector('label')!;
        expect(label.getAttribute('data-sample')).toBe('Label');
        expect(label.classList).toContain('label-styles');
        expect(label.title).toBe('Tooltip');
        const radio = root.querySelector<HTMLElement>('[data-slot=radio]')!;
        expect(control.current).toBe(radio);
        expect(radio.getAttribute('data-sample')).toBe('Input');
        expect(radio.classList).toContain('input-styles');
        expect(inputRef.current).toBe(root.querySelector('input[type=radio]'));
        expect(root.querySelector('.text-styles')!.textContent).toBe('Label');
    });
});
