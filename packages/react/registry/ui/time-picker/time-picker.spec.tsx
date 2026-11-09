import { createRef, useState, useSyncExternalStore } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { DatetimeAdapterProvider, FdDate, type FdDateTimeFormatOptions } from '@/lib/datetime';
import { TimePicker, type TimePickerActions } from './time-picker';

const frame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
const settle = async () => {
    await frame();
    await new Promise((r) => setTimeout(r, 50));
    await frame();
};

interface HostState {
    time: FdDate | null | undefined;
    message: string | null;
    allowNull: boolean;
    disabled: boolean;
    displayFormat: FdDateTimeFormatOptions | undefined;
}

/** The state of the host, as the Angular spec's signals: tests read and set it, the host renders it. */
function createStore(configure?: (state: HostState) => void) {
    let state: HostState = {
        time: new FdDate(2024, 3, 9, 14, 30, 0),
        message: null,
        allowNull: true,
        disabled: false,
        displayFormat: undefined
    };
    configure?.(state);
    const listeners = new Set<() => void>();
    return {
        get: () => state,
        set(patch: Partial<HostState>) {
            state = { ...state, ...patch };
            for (const listener of listeners) listener();
        },
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
}
type Store = ReturnType<typeof createStore>;

function Host({ store }: { store: Store }) {
    const s = useSyncExternalStore(store.subscribe, store.get);
    return (
        <>
            <TimePicker
                id="tp"
                time={s.time ?? null}
                onTimeChange={(time) => store.set({ time })}
                message={s.message}
                messageType="information"
                allowNull={s.allowNull}
                disabled={s.disabled}
                displayFormat={s.displayFormat}
            />
            <button id="after">After</button>
        </>
    );
}

async function setup(configure?: (state: HostState) => void) {
    const store = createStore(configure);
    const screen = await render(<Host store={store} />);
    const root = screen.container;
    await settle();
    return {
        store,
        screen,
        root,
        input: root.querySelector<HTMLInputElement>('input')!,
        button: root.querySelector<HTMLButtonElement>('button[aria-label="Open picker"]')!
    };
}

const $ = (selector: string) => document.querySelector<HTMLElement>(selector);

/** Value state messages shown in the field's message popover. */
const fieldMessage = () =>
    [...document.querySelectorAll<HTMLElement>('[aria-label="Field validation messages"]')].find(
        (m) => m.checkVisibility() && m.getBoundingClientRect().height > 0
    ) ?? null;

describe('TimePicker', () => {
    it('shows the time in the display format', async () => {
        const { input, button } = await setup();
        expect(input.value).toBe('2:30 PM');
        expect(input.id).toBe('tp-input');
        expect(input.getAttribute('aria-label')).toBe('Time picker input');
        expect(input.placeholder).toBe('hh:mm am/pm');
        expect(button.getAttribute('aria-expanded')).toBe('false');
        expect(button.getAttribute('aria-haspopup')).toBe('dialog');
        expect(button.title).toBe('Open picker');
    });

    it('reads typed times on Enter and on blur', async () => {
        const { store, input } = await setup();
        await userEvent.clear(input);
        await userEvent.type(input, '9:05 AM{Enter}');
        await settle();
        expect(store.get().time!.hour).toBe(9);
        expect(store.get().time!.minute).toBe(5);
        expect(input.value).toBe('9:05 AM');
        await userEvent.clear(input);
        await userEvent.type(input, '18:45');
        await userEvent.tab();
        await settle();
        expect(store.get().time!.hour).toBe(18);
        expect(input.value).toBe('6:45 PM');
    });

    it('sets the error state for an unreadable time', async () => {
        const { input } = await setup();
        await userEvent.clear(input);
        await userEvent.type(input, 'teatime{Enter}');
        await settle();
        expect(input.value).toBe('teatime');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        await userEvent.clear(input);
        await userEvent.type(input, '{Enter}');
        await settle();
        expect(input.hasAttribute('aria-invalid')).toBe(false);
    });

    it('picks a time in the columns', async () => {
        const { store, input, button } = await setup();
        await userEvent.click(button);
        await settle();
        expect(button.getAttribute('aria-expanded')).toBe('true');
        const hours = $('#tp-time-hours')!;
        expect(document.activeElement).toBe(hours);
        expect($('#tp-time-period')).not.toBeNull();
        expect($('#tp-time-seconds')).toBeNull();
        await userEvent.keyboard('{ArrowDown}');
        await settle();
        expect(store.get().time!.hour).toBe(15);
        expect(input.value).toBe('3:30 PM');
        await userEvent.keyboard('{Escape}');
        await settle();
        expect($('#tp-time-hours')).toBeNull();
        expect(document.activeElement).toBe(input);
    });

    it('opens with Alt+Down', async () => {
        const { input } = await setup();
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await settle();
        expect(document.activeElement!.id).toBe('tp-time-hours');
    });

    it('follows the locale of the adapter', async () => {
        const store = createStore();
        function LocaleHost({ locale }: { locale: string }) {
            const s = useSyncExternalStore(store.subscribe, store.get);
            return (
                <DatetimeAdapterProvider locale={locale}>
                    <TimePicker time={s.time ?? null} onTimeChange={(time) => store.set({ time })} />
                </DatetimeAdapterProvider>
            );
        }
        const screen = await render(<LocaleHost locale="en-US" />);
        const input = screen.container.querySelector('input')!;
        expect(input.value).toBe('2:30 PM');
        await screen.rerender(<LocaleHost locale="de-DE" />);
        await settle();
        expect(input.value).toBe('14:30');
        await screen.rerender(<LocaleHost locale="en-US" />);
        await settle();
        expect(input.value).toBe('2:30 PM');
    });

    it('shows the message while the field has the focus', async () => {
        const { input } = await setup((s) => (s.message = 'Times are local'));
        expect(fieldMessage()).toBeNull();
        input.focus();
        await settle();
        expect(fieldMessage()!.textContent).toContain('Times are local');
        expect(input.getAttribute('aria-describedby')).toBeTruthy();
    });

    it('shows hours, minutes and seconds without a period for a 24-hour format with seconds', async () => {
        const { input, button } = await setup(
            (s) => (s.displayFormat = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
        );
        expect(input.value).toBe('14:30:00');
        expect(input.placeholder).toBe('hh:mm:ss');
        await userEvent.click(button);
        await settle();
        expect($('#tp-time-hours')).not.toBeNull();
        expect($('#tp-time-minutes')).not.toBeNull();
        expect($('#tp-time-seconds')).not.toBeNull();
        expect($('#tp-time-period')).toBeNull();
        expect($('#tp-time-hours')!.getAttribute('aria-valuetext')).toBe('14');
    });

    it('hides the message while the columns are open and shows it again on close', async () => {
        const { input, button } = await setup((s) => (s.message = 'Times are local'));
        input.focus();
        await settle();
        expect(fieldMessage()).not.toBeNull();
        await userEvent.click(button);
        await settle();
        expect(fieldMessage()).toBeNull();
        // the open columns show the message inside the popover instead
        const body = $('#tp-time-hours')!.closest('[role="dialog"]')!;
        expect(body.getAttribute('aria-label')).toBe('Time picker');
        expect(body.textContent).toContain('Times are local');
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(document.activeElement).toBe(input);
        expect(fieldMessage()).not.toBeNull();
    });

    it('closes the columns on a click outside', async () => {
        const { root, button } = await setup();
        await userEvent.click(button);
        await settle();
        expect($('#tp-time-hours')).not.toBeNull();
        await userEvent.click(root.querySelector<HTMLElement>('#after')!);
        await settle();
        expect($('#tp-time-hours')).toBeNull();
        expect(button.getAttribute('aria-expanded')).toBe('false');
        // the focus stays where the press put it
        expect(document.activeElement!.id).toBe('after');
    });

    it('keeps the columns open on a press in the field, and closes them with the button', async () => {
        const { input, button } = await setup();
        await userEvent.click(button);
        await settle();
        await userEvent.click(input);
        await settle();
        expect($('#tp-time-hours')).not.toBeNull();
        expect(document.activeElement).toBe(input);
        await userEvent.click(button);
        await settle();
        expect($('#tp-time-hours')).toBeNull();
        expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('does not open when disabled', async () => {
        const { input, button } = await setup((s) => (s.disabled = true));
        expect(input.disabled).toBe(true);
        expect(button.disabled).toBe(true);
        button.click();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }));
        await settle();
        expect($('#tp-time-hours')).toBeNull();
        expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('closes the columns when disabled while open', async () => {
        const { store, button } = await setup();
        await userEvent.click(button);
        await settle();
        expect($('#tp-time-hours')).not.toBeNull();
        store.set({ disabled: true });
        await settle();
        expect($('#tp-time-hours')).toBeNull();
    });

    it('keeps Tab within the open columns, like upstream (focus trapped)', async () => {
        const { button } = await setup();
        await userEvent.click(button);
        await settle();
        const hours = $('#tp-time-hours')!;
        expect(document.activeElement).toBe(hours);
        await userEvent.tab();
        expect(document.activeElement!.id).toBe('tp-time-minutes');
        await userEvent.tab();
        expect(document.activeElement!.id).toBe('tp-time-period');
        await userEvent.tab();
        await settle();
        expect(document.activeElement).toBe(hours);
        expect(button.getAttribute('aria-expanded')).toBe('true');
    });
});

/** Angular's form control host: the value, its changes, touched and validity. */
function ChangeHost({
    initial = new FdDate(2024, 1, 1, 8, 0, 0),
    allowNull = true,
    onChange,
    onTouched,
    onInvalidChange,
    disabled = false
}: {
    initial?: FdDate | null;
    allowNull?: boolean;
    onChange: (time: FdDate | null) => void;
    onTouched?: () => void;
    onInvalidChange?: (invalid: boolean) => void;
    disabled?: boolean;
}) {
    const [time, setTime] = useState<FdDate | null>(initial);
    return (
        <TimePicker
            id="tpc"
            time={time}
            allowNull={allowNull}
            disabled={disabled}
            onTimeChange={(next) => {
                setTime(next);
                onChange(next);
            }}
            onTouched={onTouched}
            onInvalidChange={onInvalidChange}
        />
    );
}

describe('TimePicker changes', () => {
    it('keeps an empty field valid with allowNull', async () => {
        const onChange = vi.fn();
        const onInvalidChange = vi.fn();
        const screen = await render(<ChangeHost onChange={onChange} onInvalidChange={onInvalidChange} />);
        const input = screen.container.querySelector('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, '{Enter}');
        await settle();
        expect(onChange.mock.calls).toEqual([[null]]);
        expect(onInvalidChange).not.toHaveBeenCalled();
        expect(input.hasAttribute('aria-invalid')).toBe(false);
    });

    it('does not emit a change when focus leaves an unchanged field', async () => {
        const onChange = vi.fn();
        const onTouched = vi.fn();
        const screen = await render(<ChangeHost onChange={onChange} onTouched={onTouched} />);
        const input = screen.container.querySelector('input')!;
        input.focus();
        // past the picker button and out of the picker
        await userEvent.tab();
        expect(onTouched).not.toHaveBeenCalled();
        await userEvent.tab();
        await settle();
        expect(onChange).not.toHaveBeenCalled();
        expect(onTouched).toHaveBeenCalledTimes(1);
        // retyping the same time is no change either
        await userEvent.clear(input);
        await userEvent.type(input, '8:00 AM{Enter}');
        await settle();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('does not emit a change when the columns pick the current time', async () => {
        const onChange = vi.fn();
        const screen = await render(<ChangeHost onChange={onChange} />);
        await userEvent.click(screen.container.querySelector<HTMLElement>('button[aria-label="Open picker"]')!);
        await settle();
        await userEvent.click($('#tpc-time-hours [data-displayed-value="8"]')!);
        await settle();
        expect(onChange).not.toHaveBeenCalled();
        await userEvent.click($('#tpc-time-hours [data-displayed-value="9"]')!);
        await settle();
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0].hour).toBe(9);
    });
});

describe('TimePicker forms', () => {
    it('writes and reads the value and validates it', async () => {
        const onChange = vi.fn();
        const onInvalidChange = vi.fn();
        const actions = createRef<TimePickerActions>();
        function FormHost({ disabled = false }: { disabled?: boolean }) {
            const [time, setTime] = useState<FdDate | null>(new FdDate(2024, 1, 1, 8, 0, 0));
            return (
                <TimePicker
                    time={time}
                    allowNull={false}
                    disabled={disabled}
                    actionsRef={actions}
                    onInvalidChange={onInvalidChange}
                    onTimeChange={(next) => {
                        setTime(next);
                        onChange(next);
                    }}
                />
            );
        }
        const screen = await render(<FormHost />);
        const input = screen.container.querySelector('input')!;
        expect(input.value).toBe('8:00 AM');
        await userEvent.clear(input);
        await userEvent.type(input, '10:15 AM{Enter}');
        expect(onChange.mock.lastCall![0].hour).toBe(10);
        expect(actions.current!.isInvalid()).toBe(false);
        await userEvent.clear(input);
        await userEvent.type(input, '{Enter}');
        await settle();
        expect(onChange.mock.lastCall![0]).toBeNull();
        expect(actions.current!.isInvalid()).toBe(true);
        expect(onInvalidChange.mock.calls).toEqual([[true]]);
        expect(input.getAttribute('aria-invalid')).toBe('true');
        await screen.rerender(<FormHost disabled />);
        expect(input.disabled).toBe(true);
    });

    it('validates times written from outside, as writeValue', async () => {
        function Outside({ time }: { time: FdDate | null }) {
            return <TimePicker time={time} allowNull={false} />;
        }
        const screen = await render(<Outside time={new FdDate(2024, 1, 1, 8, 0, 0)} />);
        const input = screen.container.querySelector('input')!;
        expect(input.hasAttribute('aria-invalid')).toBe(false);
        await screen.rerender(<Outside time={null} />);
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.value).toBe('');
        await screen.rerender(<Outside time={new FdDate(2024, 1, 1, 9, 15, 0)} />);
        expect(input.hasAttribute('aria-invalid')).toBe(false);
        expect(input.value).toBe('9:15 AM');
    });
});

describe('TimePicker options', () => {
    it('opens and closes from code and controlled, and parses from code', async () => {
        const actions = createRef<TimePickerActions>();
        const onOpenChange = vi.fn();
        const onTimeChange = vi.fn();
        const screen = await render(
            <TimePicker id="code" actionsRef={actions} onOpenChange={onOpenChange} onTimeChange={onTimeChange} />
        );
        const input = screen.container.querySelector('input')!;
        expect(input.value).toBe('');
        actions.current!.setOpen(true);
        await settle();
        expect($('#code-time-hours')).not.toBeNull();
        expect(onOpenChange.mock.calls).toEqual([[true]]);
        actions.current!.setOpen(false);
        await settle();
        expect($('#code-time-hours')).toBeNull();
        actions.current!.parse('7:20 PM');
        await settle();
        expect(input.value).toBe('7:20 PM');
        expect(onTimeChange.mock.lastCall![0].hour).toBe(19);

        await screen.rerender(<TimePicker id="code" open />);
        await settle();
        expect($('#code-time-hours')).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await settle();
        // controlled: stays open
        expect($('#code-time-hours')).not.toBeNull();
    });

    it('shows now in the columns without a time, and the column options', async () => {
        const screen = await render(
            <TimePicker
                id="opt"
                defaultOpen
                meridian={false}
                displaySeconds
                keepTwoDigitsTime
                minuteStep={15}
                spinnerButtons={false}
                tablet
                placeholder="Start"
                timeLabels={{ componentAriaName: 'Start time' }}
            >
                <p id="extra">Projected</p>
            </TimePicker>
        );
        await settle();
        const input = screen.container.querySelector('input')!;
        expect(input.placeholder).toBe('Start');
        const now = new Date();
        expect($('#opt-time-hours')!.getAttribute('aria-valuetext')).toBe(String(now.getHours()).padStart(2, '0'));
        expect($('#opt-time-seconds')).not.toBeNull();
        expect($('#opt-time-period')).toBeNull();
        expect($('#opt-time-minutes')!.getAttribute('aria-valuemax')).toBe('3');
        expect($('#opt-time')!.querySelector('button')).toBeNull();
        expect($('#opt-time')!.className).toContain('p-2');
        const body = $('#opt-time')!.closest('[role="dialog"]')!;
        expect(body.getAttribute('aria-label')).toBe('Start time');
        expect(body.querySelector('#extra')!.textContent).toBe('Projected');
    });

    it('labels the input from aria-labelledby or the input label, and keeps the button out of the tab order', async () => {
        const screen = await render(
            <>
                <span id="lbl">Start</span>
                <TimePicker aria-labelledby="lbl" required buttonFocusable={false} timePickerButtonLabel="Show times" />
                <TimePicker timePickerInputLabel="End time" inputId="end" />
            </>
        );
        const [first, second] = screen.container.querySelectorAll('input');
        expect(first.getAttribute('aria-labelledby')).toBe('lbl');
        expect(first.hasAttribute('aria-label')).toBe(false);
        expect(first.getAttribute('aria-required')).toBe('true');
        const button = screen.container.querySelector<HTMLButtonElement>('button[aria-label="Show times"]')!;
        expect(button.tabIndex).toBe(-1);
        expect(second.id).toBe('end');
        expect(second.getAttribute('aria-label')).toBe('End time');
    });

    it('takes a state, which wins over the validation, unless useValidation is off', async () => {
        const screen = await render(<TimePicker state="success" defaultTime={new FdDate(2024, 1, 1, 8, 0, 0)} />);
        const input = screen.container.querySelector('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, 'never{Enter}');
        expect(input.hasAttribute('aria-invalid')).toBe(false);
        await screen.rerender(<TimePicker useValidation={false} defaultTime={new FdDate(2024, 1, 1, 8, 0, 0)} />);
        expect(input.hasAttribute('aria-invalid')).toBe(false);
        await screen.rerender(<TimePicker state="error" />);
        expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('reads day period texts of dayPeriod formats', async () => {
        const onTimeChange = vi.fn();
        const screen = await render(
            <TimePicker
                defaultTime={new FdDate(2024, 3, 9, 14, 30, 0)}
                displayFormat={{ hour: 'numeric', minute: '2-digit', hourCycle: 'h23', dayPeriod: true }}
                onTimeChange={onTimeChange}
            />
        );
        const input = screen.container.querySelector('input')!;
        expect(input.value).toBe('14:30 in the afternoon');
        await userEvent.clear(input);
        await userEvent.type(input, '9:10 in the morning{Enter}');
        expect(onTimeChange.mock.lastCall![0].hour).toBe(9);
        expect(input.value).toBe('09:10 in the morning');
    });
});

describe('TimePicker (fundamental-react)', () => {
    it('keeps the typed text and calls onTimeChange once per read', async () => {
        const onTimeChange = vi.fn();
        const screen = await render(<TimePicker onTimeChange={onTimeChange} meridian displaySeconds />);
        const input = screen.container.querySelector('input')!;
        await userEvent.type(input, '12:34:56 am');
        expect(input.value).toBe('12:34:56 am');
        expect(onTimeChange).not.toHaveBeenCalled();
        await userEvent.tab();
        expect(onTimeChange).toHaveBeenCalledTimes(1);
        expect(onTimeChange.mock.lastCall![0].hour).toBe(0);
        expect(onTimeChange.mock.lastCall![0].second).toBe(56);
    });

    it('passes className, native props and the ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <TimePicker ref={ref} id="root" className="wonderful-styles" data-sample="Sample" />
        );
        expect(ref.current).toBe(screen.container.querySelector('#root'));
        expect(ref.current!.classList).toContain('wonderful-styles');
        expect(ref.current!.classList).toContain('inline-block');
        expect(ref.current!.getAttribute('data-sample')).toBe('Sample');
    });

    it('spreads props on the input, the button, the popover and the time (inputProps, buttonProps, popoverProps, timeProps)', async () => {
        const inputRef = createRef<HTMLInputElement>();
        const screen = await render(
            <TimePicker
                id="spread"
                inputProps={{ 'data-sample': 'Input', ref: inputRef } as object}
                buttonProps={{ 'data-sample': 'Button' } as object}
                popoverProps={{ 'data-sample': 'Popover' } as object}
                timeProps={{ 'data-sample': 'Time' } as object}
            />
        );
        expect(inputRef.current).toBe(screen.container.querySelector('input'));
        expect(inputRef.current!.getAttribute('data-sample')).toBe('Input');
        const button = screen.container.querySelector<HTMLElement>('button')!;
        expect(button.getAttribute('data-sample')).toBe('Button');
        await userEvent.click(button);
        await settle();
        expect($('#spread-time')!.getAttribute('data-sample')).toBe('Time');
        expect($('#spread-time')!.closest('[role="dialog"]')!.getAttribute('data-sample')).toBe('Popover');
    });
});
