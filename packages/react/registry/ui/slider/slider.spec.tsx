import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Field } from '@base-ui/react/field';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Slider, type SliderCustomValue, type SliderProps, type SliderValue } from './slider';

const MONTHS: SliderCustomValue[] = [
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Feb' },
    { value: 3, label: 'Mar' }
];

/** The parent of a controlled slider: keeps the model in state, as Angular's `[(value)]` host. */
function Host({
    initial = 50,
    changes,
    width = 400,
    height,
    ...props
}: SliderProps & { initial?: SliderValue; changes: SliderValue[]; width?: number; height?: number }) {
    const [model, setModel] = useState<SliderValue>(initial);
    return (
        <div>
            <div style={{ width, height }}>
                <Slider
                    aria-label="Value"
                    {...props}
                    value={model}
                    onValueChange={(v) => {
                        changes.push(v);
                        setModel(v);
                    }}
                />
            </div>
            <button id="outside">Outside</button>
        </div>
    );
}

const frame = () => new Promise((r) => requestAnimationFrame(() => r(undefined)));

async function setup(
    initial: SliderProps & { initial?: SliderValue; width?: number; height?: number; rtl?: boolean } = {}
) {
    const { rtl, ...rest } = initial;
    let current = rest;
    const changes: SliderValue[] = [];
    const ui = (p: typeof current) => {
        const host = <Host {...p} changes={changes} />;
        // as Storybook: Base UI's DirectionProvider and the dir attribute it expects next to it
        return rtl ? (
            <DirectionProvider direction="rtl">
                <div dir="rtl">{host}</div>
            </DirectionProvider>
        ) : (
            host
        );
    };
    const screen = await render(ui(current));
    const root = screen.container;
    await frame();
    // the pointer of an earlier test must not hover the slider
    await userEvent.hover(root.querySelector<HTMLElement>('#outside')!);
    const track = () => root.querySelector<HTMLElement>('[data-slot=slider-track]')!;
    /** Dispatches a pointer event at a fraction of the track (from the left, or from the bottom when vertical). */
    const pointer = (target: HTMLElement | Document, type: string, ratio: number) => {
        const rect = track().getBoundingClientRect();
        target.dispatchEvent(
            new PointerEvent(type, {
                bubbles: true,
                button: 0,
                buttons: type === 'pointerup' ? 0 : 1,
                clientX: rect.left + rect.width * ratio,
                clientY: rect.bottom - rect.height * ratio
            })
        );
    };
    return {
        root,
        changes,
        track,
        pointer,
        slider: () => root.querySelector<HTMLElement>('[data-slot=slider]')!,
        /** The thumbs; Base UI's visually hidden range input in each is the `slider`. */
        handles: () => [...root.querySelectorAll<HTMLElement>('[data-slot=slider-handle]')],
        inputs: () => [...root.querySelectorAll<HTMLInputElement>('input[type=range]')],
        last: () => changes[changes.length - 1],
        update: async (change: Partial<typeof current>) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('Slider', () => {
    afterEach(() => document.documentElement.removeAttribute('dir'));

    it('exposes the value as an ARIA slider', async () => {
        const { inputs, handles } = await setup({ step: 10, showTicks: true, showTicksLabels: true });
        const [input] = inputs();
        await expect.element(input).toHaveRole('slider');
        expect(input.min).toBe('0');
        expect(input.max).toBe('100');
        expect(input.getAttribute('aria-valuenow')).toBe('50');
        expect(input.getAttribute('aria-label')).toBe('Value');
        expect(input.hasAttribute('aria-valuetext')).toBe(false);
        expect(handles()[0].style.insetInlineStart).toBe('50%');
    });

    it('moves by step with the arrows, by jump with Shift and to the ends with Home and End', async () => {
        const { inputs, last } = await setup({ step: 10 });
        inputs()[0].focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(last()).toBe(60);
        await userEvent.keyboard('{ArrowDown}{ArrowDown}');
        expect(last()).toBe(40);
        await userEvent.keyboard('{End}');
        expect(last()).toBe(100);
        await userEvent.keyboard('{ArrowRight}');
        expect(last()).toBe(100);
        await userEvent.keyboard('{Home}');
        expect(last()).toBe(0);
        await expect.element(inputs()[0]).toHaveAttribute('aria-valuenow', '0');
        await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
        expect(last()).toBe(10);
        await userEvent.keyboard('{PageUp}{PageUp}{PageDown}');
        expect(last()).toBe(20);
    });

    it('steps Shift+arrows and Page Up/Down by jump', async () => {
        const { inputs, last } = await setup({ jump: 25, initial: 0 });
        inputs()[0].focus();
        await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
        expect(last()).toBe(25);
        await userEvent.keyboard('{PageUp}');
        expect(last()).toBe(50);
        await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
        expect(last()).toBe(25);
    });

    it('sets the value from a press on the track and a drag of the handle', async () => {
        const { inputs, handles, track, pointer, last } = await setup({ step: 10 });
        pointer(track(), 'pointerdown', 0.2);
        pointer(document, 'pointerup', 0.2);
        expect(last()).toBe(20);
        await expect.poll(() => document.activeElement).toBe(inputs()[0]);
        const handle = handles()[0];
        pointer(handle, 'pointerdown', 0.2);
        pointer(document, 'pointermove', 0.71);
        pointer(document, 'pointerup', 0.71);
        expect(last()).toBe(70);
    });

    it('moves the handles of a range separately and together', async () => {
        const { root, inputs, last } = await setup({ mode: 'range', initial: [20, 60], step: 10 });
        expect(inputs()).toHaveLength(2);
        inputs()[1].focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(last()).toEqual([20, 70]);
        const group = root.querySelector<HTMLElement>('[role=group][data-slot=slider-focus-range]')!;
        group.focus();
        await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
        expect(last()).toEqual([30, 80]);
        await userEvent.keyboard('{End}');
        expect(last()).toEqual([50, 100]);
        await expect.element(group).toHaveAttribute('aria-label', 'Range from 50 to 100');
        await userEvent.keyboard('{Home}');
        expect(last()).toEqual([0, 50]);
    });

    it('announces range changes in a polite live region', async () => {
        const { root, inputs } = await setup({ mode: 'range', initial: [20, 60] });
        const status = root.querySelector<HTMLElement>('[role=status]')!;
        expect(status.getAttribute('aria-live')).toBe('polite');
        inputs()[0].focus();
        await userEvent.keyboard('{ArrowRight}');
        await expect.element(status).toHaveTextContent('Range from 21 to 60');
    });

    it('works with custom values', async () => {
        const { root, inputs, last } = await setup({
            customValues: MONTHS,
            initial: MONTHS[1],
            showTicks: true,
            showTicksLabels: true
        });
        expect(inputs()[0].getAttribute('aria-valuetext')).toBe('Feb');
        expect(inputs()[0].max).toBe('2');
        inputs()[0].focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(last()).toEqual(MONTHS[2]);
        await expect.element(inputs()[0]).toHaveAttribute('aria-valuetext', 'Mar');
        expect(root.textContent).toContain('Jan');
        expect(root.textContent).toContain('Mar');
        // Shift and Page Up step by one custom value
        await userEvent.keyboard('{Home}{PageUp}');
        expect(last()).toEqual(MONTHS[1]);
    });

    it('works with a range of custom values', async () => {
        const { root, inputs, last } = await setup({
            mode: 'range',
            customValues: MONTHS,
            initial: [MONTHS[0], MONTHS[1]]
        });
        inputs()[1].focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(last()).toEqual([MONTHS[0], MONTHS[2]]);
        const group = root.querySelector<HTMLElement>('[data-slot=slider-focus-range]')!;
        await expect.element(group).toHaveAttribute('aria-label', 'Range from Jan to Mar');
    });

    it('is disabled', async () => {
        const { slider, inputs, update, root } = await setup();
        await update({ disabled: true });
        expect(inputs()[0].disabled).toBe(true);
        expect(slider().className).toContain('pointer-events-none');
        await update({ mode: 'range', disabled: true, initial: [20, 60] });
        expect(root.querySelector('[data-slot=slider-focus-range]')!.getAttribute('tabindex')).toBe('-1');
    });

    describe('configuration', () => {
        it('cozy makes the handles larger', async () => {
            const { handles, update } = await setup();
            const small = handles()[0].getBoundingClientRect();
            await update({ cozy: true });
            const large = handles()[0].getBoundingClientRect();
            expect(large.width).toBeGreaterThan(small.width);
            expect(large.height).toBeGreaterThan(small.height);
        });

        it('vertical slider is aria-orientation vertical, fills from the bottom and steps with Up/Down', async () => {
            const { inputs, handles, track, pointer, last } = await setup({ vertical: true, initial: 20, height: 300 });
            const [handle] = handles();
            expect(inputs()[0].getAttribute('aria-orientation')).toBe('vertical');
            expect(handle.style.bottom).toBe('20%');
            const trackRect = track().getBoundingClientRect();
            expect(trackRect.height).toBeGreaterThan(trackRect.width);
            const center = handle.getBoundingClientRect().top + handle.getBoundingClientRect().height / 2;
            expect(center).toBeCloseTo(trackRect.bottom - trackRect.height * 0.2, 0);
            inputs()[0].focus();
            await userEvent.keyboard('{ArrowUp}');
            expect(last()).toBe(21);
            await userEvent.keyboard('{ArrowDown}{ArrowDown}');
            expect(last()).toBe(19);
            pointer(track(), 'pointerdown', 0.75);
            pointer(document, 'pointerup', 0.75);
            expect(last()).toBe(75);
        });

        it('dragging the range between the handles moves both', async () => {
            const { root, pointer, last } = await setup({ mode: 'range', initial: [20, 60] });
            const group = root.querySelector<HTMLElement>('[data-slot=slider-focus-range]')!;
            pointer(group, 'pointerdown', 0.4);
            pointer(group, 'pointermove', 0.55);
            expect(last()).toEqual([35, 75]);
            expect(document.activeElement).toBe(group);
            // the range stops at the end and keeps its size
            pointer(group, 'pointermove', 0.95);
            pointer(group, 'pointerup', 0.95);
            expect(last()).toEqual([60, 100]);
            // a later move without a press does nothing
            pointer(group, 'pointermove', 0.5);
            expect(last()).toEqual([60, 100]);
        });

        it('a pointer beyond either end clamps to min or max', async () => {
            const { handles, track, pointer, last } = await setup({ min: -50, max: 50, initial: 10 });
            pointer(track(), 'pointerdown', 0.5);
            pointer(document, 'pointerup', 0.5);
            expect(last()).toBe(0);
            const handle = handles()[0];
            pointer(handle, 'pointerdown', 0.5);
            pointer(document, 'pointermove', -0.5);
            expect(last()).toBe(-50);
            pointer(document, 'pointermove', 1.5);
            pointer(document, 'pointerup', 1.5);
            expect(last()).toBe(50);
            await expect.poll(() => handle.style.insetInlineStart).toBe('100%');
        });

        it('steps of 0.2 produce values without floating point noise', async () => {
            const { inputs, track, pointer, last } = await setup({ min: -1, max: 1, step: 0.2, initial: 0.4 });
            inputs()[0].focus();
            await userEvent.keyboard('{ArrowRight}');
            expect(last()).toBe(0.6);
            await userEvent.keyboard('{ArrowRight}{ArrowRight}');
            expect(last()).toBe(1);
            await userEvent.keyboard('{ArrowLeft}');
            expect(last()).toBe(0.8);
            pointer(track(), 'pointerdown', 0.11);
            pointer(document, 'pointerup', 0.11);
            expect(last()).toBe(-0.8);
            await expect.element(inputs()[0]).toHaveAttribute('aria-valuenow', '-0.8');
        });

        it('shows a tick per step and a label every tickmarksBetweenLabels ticks', async () => {
            const { root, update } = await setup({ showTicks: true, showTicksLabels: true, max: 10, initial: 5 });
            const labels = () => root.querySelector<HTMLElement>('[data-slot=slider-labels]')!;
            const ticks = () => root.querySelectorAll('[data-slot=slider-tick]');
            expect(ticks()).toHaveLength(11);
            expect(labels().getAttribute('aria-hidden')).toBe('true');
            expect(labels().children).toHaveLength(11);
            expect(labels().textContent).toBe('012345678910');
            await update({ tickmarksBetweenLabels: 2 });
            expect(ticks()).toHaveLength(11);
            expect(labels().children).toHaveLength(6);
            expect([...labels().children].map((el) => el.textContent).join(' ')).toBe('0 2 4 6 8 10');
            // ticks up to the value are in range
            expect(root.querySelectorAll('[data-slot=slider-tick][data-in-range]')).toHaveLength(6);
            await update({ hideProgressBar: true });
            expect(root.querySelectorAll('[data-slot=slider-tick][data-in-range]')).toHaveLength(0);
            expect(root.querySelector('[data-slot=slider-range]')).toBeNull();
        });

        it('collapses ticks closer than 8px to the two ends', async () => {
            const { root } = await setup({ showTicks: true, showTicksLabels: true, width: 200, max: 1000 });
            await expect.poll(() => root.querySelectorAll('[data-slot=slider-tick]').length).toBe(2);
            expect(root.querySelector('[data-slot=slider-labels]')!.textContent).toBe('01000');
        });

        it('range handles can cross and the value stays sorted', async () => {
            const { root, inputs, last } = await setup({ mode: 'range', initial: [20, 60] });
            const [first, second] = inputs();
            first.focus();
            await userEvent.keyboard('{End}');
            expect(last()).toEqual([60, 100]);
            // the moved value passed the other handle: the focus follows it to the second thumb
            await expect.element(second).toHaveAttribute('aria-valuenow', '100');
            expect(first.getAttribute('aria-valuenow')).toBe('60');
            expect(document.activeElement).toBe(second);
            await expect
                .element(root.querySelector<HTMLElement>('[data-slot=slider-focus-range]')!)
                .toHaveAttribute('aria-label', 'Range from 60 to 100');
            await userEvent.keyboard('{Home}');
            expect(last()).toEqual([0, 60]);
            expect(document.activeElement).toBe(first);
        });

        it('readonly tooltip shows the value on hover and focus', async () => {
            const { root, slider, inputs } = await setup({ tooltipMode: 'readonly', initial: 30 });
            const tooltip = () => root.querySelector('[data-slot=slider-tooltip] span[aria-hidden="true"]');
            expect(tooltip()).toBeNull();
            await userEvent.hover(slider());
            await expect.poll(() => tooltip()?.textContent).toBe('30');
            await userEvent.unhover(slider());
            await expect.poll(() => tooltip()).toBeNull();
            inputs()[0].focus();
            await expect.poll(() => tooltip()?.textContent).toBe('30');
            root.querySelector<HTMLElement>('#outside')!.focus();
            await expect.poll(() => tooltip()).toBeNull();
        });

        it('editable tooltip sets the value on Enter and blur', async () => {
            const { root, inputs, last } = await setup({ tooltipMode: 'editable', step: 5, initial: 30 });
            inputs()[0].focus();
            await expect.poll(() => root.querySelector('[data-slot=slider-tooltip] input')).not.toBeNull();
            const input = root.querySelector<HTMLInputElement>('[data-slot=slider-tooltip] input')!;
            expect(input.value).toBe('30');
            expect(input.getAttribute('aria-label')).toBe('Value');
            await userEvent.clear(input);
            await userEvent.type(input, '42{Enter}');
            expect(last()).toBe(40);
            expect(input.value).toBe('40');
            await userEvent.clear(input);
            await userEvent.type(input, 'abc{Enter}');
            expect(last()).toBe(40);
            expect(input.value).toBe('40');
            await expect.element(inputs()[0]).toHaveAttribute('aria-valuenow', '40');
            // a decimal comma, applied on blur (the focus stays in the slider)
            await userEvent.clear(input);
            await userEvent.type(input, '62,4');
            inputs()[0].focus();
            expect(last()).toBe(60);
            // a key on the handle updates the input
            await userEvent.keyboard('{ArrowRight}');
            await expect.poll(() => input.value).toBe('65');
        });

        it('names the tooltip inputs of a range by their position', async () => {
            const { root, inputs } = await setup({ mode: 'range', tooltipMode: 'editable', initial: [20, 70] });
            inputs()[0].focus();
            await expect.poll(() => root.querySelectorAll('[data-slot=slider-tooltip] input').length).toBe(2);
            const labels = [...root.querySelectorAll('[data-slot=slider-tooltip] input')].map((el) =>
                el.getAttribute('aria-label')
            );
            expect(labels).toEqual(['Value 1', 'Value 2']);
        });

        it('RTL mirrors the handle position and arrow keys (DirectionProvider)', async () => {
            const { inputs, handles, track, pointer, last } = await setup({ initial: 20, rtl: true });
            const handle = handles()[0];
            const trackRect = track().getBoundingClientRect();
            const center = handle.getBoundingClientRect().left + handle.getBoundingClientRect().width / 2;
            expect(center).toBeCloseTo(trackRect.right - trackRect.width * 0.2, 0);
            inputs()[0].focus();
            await userEvent.keyboard('{ArrowLeft}');
            expect(last()).toBe(21);
            await userEvent.keyboard('{ArrowRight}{ArrowRight}');
            expect(last()).toBe(19);
            pointer(track(), 'pointerdown', 0.25);
            pointer(document, 'pointerup', 0.25);
            expect(last()).toBe(75);
        });

        it('RTL follows the dir attribute without a DirectionProvider', async () => {
            document.documentElement.setAttribute('dir', 'rtl');
            const { inputs, track, pointer, last } = await setup({ initial: 20 });
            inputs()[0].focus();
            await userEvent.keyboard('{ArrowLeft}');
            expect(last()).toBe(21);
            pointer(track(), 'pointerdown', 0.25);
            pointer(document, 'pointerup', 0.25);
            expect(last()).toBe(75);
        });
    });

    it('works uncontrolled, submits its value and reports touched in a Base UI Field', async () => {
        const onValueChange = vi.fn();
        const screen = await render(
            <form>
                <Field.Root>
                    <Slider aria-label="Value" name="volume" defaultValue={30} onValueChange={onValueChange} />
                </Field.Root>
                <button type="button">After</button>
            </form>
        );
        const input = screen.container.querySelector<HTMLInputElement>('input[type=range]')!;
        expect(input.name).toBe('volume');
        input.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(onValueChange).toHaveBeenLastCalledWith(31);
        await expect.element(input).toHaveAttribute('aria-valuenow', '31');
        const form = screen.container.querySelector('form')!;
        expect(new FormData(form).get('volume')).toBe('31');
        screen.container.querySelector<HTMLElement>('button')!.focus();
        await expect
            .poll(() => screen.container.querySelector('[data-slot=slider]')!.hasAttribute('data-touched'))
            .toBe(true);
    });

    it('passes className, native props and the ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        const onBlur = vi.fn();
        const screen = await render(
            <Slider ref={ref} aria-label="Value" className="extra" data-testid="sl" id="sl" onBlur={onBlur} />
        );
        const root = screen.container.querySelector<HTMLElement>('[data-slot=slider]')!;
        expect(ref.current).toBe(root);
        expect(root.id).toBe('sl');
        expect(root.dataset['testid']).toBe('sl');
        expect(root.className).toContain('extra');
        expect(root.className).toContain('py-4');
        root.querySelector<HTMLInputElement>('input')!.focus();
        root.querySelector<HTMLInputElement>('input')!.blur();
        expect(onBlur).toHaveBeenCalled();
    });

    it('follows value changes from the parent', async () => {
        const screen = await render(<Slider aria-label="Value" value={10} />);
        const input = screen.container.querySelector<HTMLInputElement>('input')!;
        expect(input.getAttribute('aria-valuenow')).toBe('10');
        await screen.rerender(<Slider aria-label="Value" value={80} />);
        expect(input.getAttribute('aria-valuenow')).toBe('80');
        // out of range and off-step values snap to the domain
        await screen.rerender(<Slider aria-label="Value" value={180} />);
        expect(input.getAttribute('aria-valuenow')).toBe('100');
        await screen.rerender(<Slider aria-label="Value" value={null} min={5} />);
        expect(input.getAttribute('aria-valuenow')).toBe('5');
    });
});
