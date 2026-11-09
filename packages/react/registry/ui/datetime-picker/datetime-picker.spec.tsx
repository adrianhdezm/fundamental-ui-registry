import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { DatetimeAdapterProvider, FdDate, FdDatetimeAdapter } from '@/lib/datetime';
import { type SpecialDayRule } from '@/ui/calendar/calendar';
import { DatetimePicker, type DatetimePickerActions } from './datetime-picker';

const frame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
const stable = async () => {
    await frame();
    await frame();
};

const picker = (id = 'dt') => document.getElementById(id)!;
const input = (id = 'dt') => picker(id).querySelector<HTMLInputElement>('input')!;
const button = (id = 'dt') => picker(id).querySelector<HTMLButtonElement>('button[aria-label="Open picker"]')!;
/** The cell of a day of the current month in the open calendar. */
const day = (n: number, id = 'dt') =>
    document.querySelector<HTMLElement>(
        `#${id}-calendar [data-fd-calendar-month-status="current"][data-fd-calendar-date-day="${n}"]`
    )!;
const buttonNamed = (name: string) =>
    [...document.querySelectorAll('button')].find((b) => b.textContent!.trim().startsWith(name));
/** All the texts that describe the input. */
const description = (field: HTMLInputElement) =>
    (field.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .map((id) => document.getElementById(id)?.textContent ?? '')
        .join(' ');
const open = async (id = 'dt') => {
    await userEvent.click(button(id));
    await stable();
};

interface HostOptions {
    footer?: boolean;
    onBlur?: boolean;
    disable?: (date: FdDate) => boolean;
    message?: string | null;
}

/** The picker of the Angular spec's host, with its date in state (`[(date)]`); `host` reads the latest. */
async function setup(options: HostOptions = {}) {
    const host = { date: null as FdDate | null, setMessage: (_: string | null) => {} };
    function Host() {
        const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9, 14, 30, 0));
        const [message, setMessage] = useState<string | null>(options.message ?? null);
        Object.assign(host, { date, setMessage });
        return (
            <>
                <DatetimePicker
                    id="dt"
                    date={date}
                    onDateChange={setDate}
                    showFooter={options.footer ?? true}
                    processInputOnBlur={options.onBlur ?? false}
                    disableFunction={options.disable}
                    message={message}
                    messageType="information"
                />
                <button id="after">After</button>
            </>
        );
    }
    await render(<Host />);
    return host;
}

describe('DatetimePicker', () => {
    it('shows the date and time in the field', async () => {
        await setup();
        expect(input().value).toBe('3/9/2024, 2:30 PM');
        expect(input().getAttribute('aria-label')).toBe('Date and time input');
        expect(button().getAttribute('aria-expanded')).toBe('false');
    });

    it('opens on the date with the time columns of the format', async () => {
        await setup();
        await open();
        expect((document.activeElement as HTMLElement).getAttribute('data-fd-calendar-date-day')).toBe('9');
        expect(document.querySelector('#dt-time-hours')!.getAttribute('aria-valuetext')).toBe('2');
        expect(document.querySelector('#dt-time-period')).not.toBeNull();
        expect(document.querySelector('#dt-time-seconds')).toBeNull();
    });

    it('applies the picked date and time with OK', async () => {
        const host = await setup();
        await open();
        await userEvent.click(day(12));
        document.querySelector<HTMLElement>('#dt-time-hours')!.focus();
        await userEvent.keyboard('{ArrowDown}');
        await stable();
        // not applied yet
        expect(host.date!.day).toBe(9);
        await userEvent.click(buttonNamed('OK')!);
        await stable();
        expect(host.date!.toString()).toBe(new FdDate(2024, 3, 12, 15, 30, 0).toString());
        expect(input().value).toBe('3/12/2024, 3:30 PM');
        await expect.poll(() => document.querySelector('#dt-calendar')).toBeNull();
        expect(document.activeElement).toBe(input());
    });

    it('drops the picked values with Cancel and Escape', async () => {
        const host = await setup();
        await open();
        await userEvent.click(day(12));
        await userEvent.click(buttonNamed('Cancel')!);
        await stable();
        expect(host.date!.day).toBe(9);
        await expect.poll(() => document.querySelector('#dt-calendar')).toBeNull();
        expect(document.activeElement).toBe(input());
        await open();
        await userEvent.click(day(13));
        await userEvent.keyboard('{Escape}');
        await stable();
        expect(host.date!.day).toBe(9);
        await expect.poll(() => document.querySelector('#dt-calendar')).toBeNull();
        expect(document.activeElement).toBe(input());
    });

    it('applies at once without the footer', async () => {
        const host = await setup({ footer: false });
        await open();
        expect(buttonNamed('OK')).toBeUndefined();
        await userEvent.click(day(20));
        await stable();
        expect(host.date!.day).toBe(20);
        expect(host.date!.hour).toBe(14);
    });

    it('reads typed values; the error shows once the field was left', async () => {
        const host = await setup();
        await userEvent.clear(input());
        await userEvent.type(input(), '4/1/2024, 9:15 AM');
        await stable();
        expect(host.date!.toString()).toBe(new FdDate(2024, 4, 1, 9, 15, 0).toString());
        await userEvent.clear(input());
        await userEvent.type(input(), 'tomorrowish');
        await stable();
        expect(input().hasAttribute('aria-invalid')).toBe(false);
        await userEvent.tab();
        await stable();
        expect(input().value).toBe('tomorrowish');
        expect(input().getAttribute('aria-invalid')).toBe('true');
    });

    it('reads on Enter only with processInputOnBlur, and checks the disable function', async () => {
        const host = await setup({ onBlur: true, disable: (d) => d.day === 13 });
        await userEvent.clear(input());
        await userEvent.type(input(), '3/13/2024, 8:00 AM');
        await stable();
        expect(host.date!.day).toBe(9);
        await userEvent.keyboard('{Enter}');
        await userEvent.tab();
        await stable();
        // a disabled date is read but not emitted, as upstream: the bound date keeps its day
        expect(host.date!.day).toBe(9);
        expect(input().value).toBe('3/13/2024, 8:00 AM');
        expect(input().getAttribute('aria-invalid')).toBe('true');
    });

    it('references the state and the message from aria-describedby', async () => {
        const host = await setup();
        expect(input().hasAttribute('aria-describedby')).toBe(false);
        host.setMessage('Times are local');
        await stable();
        expect(description(input())).toContain('Times are local');
        await userEvent.clear(input());
        await userEvent.type(input(), 'tomorrowish');
        await userEvent.tab();
        await stable();
        expect(description(input())).toContain('Value state Error');
        expect(description(input())).toContain('Times are local');
    });

    it('keeps aria-haspopup "dialog" on the button, as the picker opens in a dialog', async () => {
        await setup();
        expect(button().getAttribute('aria-haspopup')).toBe('dialog');
        await open();
        const dialog = document.querySelector('#dt-calendar')!.closest('[role="dialog"]')!;
        expect(dialog.getAttribute('aria-label')).toBe('Choose date and time');
        expect(button().getAttribute('aria-expanded')).toBe('true');
    });

    it('opens with F4 and Alt+Down and toggles with F4', async () => {
        await setup();
        input().focus();
        await userEvent.keyboard('{F4}');
        await stable();
        expect(document.querySelector('#dt-calendar')).not.toBeNull();
        input().focus();
        await userEvent.keyboard('{F4}');
        await stable();
        await expect.poll(() => document.querySelector('#dt-calendar')).toBeNull();
        input().focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await stable();
        expect(document.querySelector('#dt-calendar')).not.toBeNull();
    });
});

describe('DatetimePicker mobile', () => {
    it('shows the calendar or the time in a dialog and applies with OK', async () => {
        const host = { date: null as FdDate | null };
        function MobileHost() {
            const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9, 14, 30, 0));
            host.date = date;
            return (
                <DatetimePicker id="dt" mobile date={date} onDateChange={setDate} mobileConfig={{ title: 'Meeting' }} />
            );
        }
        await render(<MobileHost />);
        await userEvent.click(input());
        await stable();
        const dialog = document.querySelector('[role=dialog][aria-modal=true]')!;
        expect(dialog.textContent).toContain('Meeting');
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(dialog.getAttribute('aria-labelledby')).toBe('dt-dialog-title');
        const time = document.getElementById('dt-time')!;
        expect(getComputedStyle(time).display).toBe('none');
        await userEvent.click(day(11));
        // not applied before OK in mobile mode
        expect(host.date!.day).toBe(9);
        await userEvent.click(buttonNamed('Time')!);
        await stable();
        expect(getComputedStyle(time).display).not.toBe('none');
        expect(getComputedStyle(document.querySelector('#dt-calendar')!).display).toBe('none');
        await userEvent.click(buttonNamed('OK')!);
        await stable();
        expect(host.date!.day).toBe(11);
        await expect.poll(() => document.querySelector('#dt-calendar')).toBeNull();
    });

    it('discards the picked values on Escape, Cancel and the close button', async () => {
        const changes: (FdDate | null)[] = [];
        const closed = vi.fn();
        await render(
            <DatetimePicker
                id="dt"
                mobile
                defaultDate={new FdDate(2024, 3, 9, 14, 30, 0)}
                mobileConfig={{ title: 'Meeting', cancelButtonText: 'Discard' }}
                onDateChange={(d) => changes.push(d)}
                onClosed={closed}
            />
        );
        for (const close of [
            () => userEvent.keyboard('{Escape}'),
            () => userEvent.click(buttonNamed('Discard')!),
            () => userEvent.click(document.querySelector<HTMLElement>('[role=dialog] button[aria-label="Close"]')!)
        ]) {
            await userEvent.click(input());
            await stable();
            await userEvent.click(day(20));
            await close();
            await stable();
            await expect.poll(() => document.querySelector('#dt-calendar')).toBeNull();
        }
        expect(changes).toEqual([]);
        expect(closed).toHaveBeenCalledTimes(3);
        expect(input().value).toBe('3/9/2024, 2:30 PM');
    });

    it('shows the calendar and the time side by side in landscape', async () => {
        await render(<DatetimePicker id="dt" mobile mobileLandscape defaultDate={new FdDate(2024, 3, 9, 14, 30, 0)} />);
        await userEvent.click(button());
        await stable();
        expect(document.querySelector('[role=dialog][aria-modal=true]')!.getAttribute('aria-label')).toBe(
            'Choose date and time'
        );
        expect(getComputedStyle(document.getElementById('dt-time')!).display).not.toBe('none');
        expect(getComputedStyle(document.getElementById('dt-calendar')!).display).not.toBe('none');
        const switcher = document.querySelector('[role=dialog][aria-modal=true] [aria-label="Show date or time"]')!;
        expect(switcher.parentElement!.className).toContain('hidden');
    });
});

describe('DatetimePicker forms', () => {
    it('writes, reads, validates and disables', async () => {
        const values: (FdDate | null)[] = [];
        const validity: boolean[] = [];
        const form = { write: (_: FdDate | null) => {}, disable: (_: boolean) => {} };
        function FormHost() {
            const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 1, 15, 8, 0, 0));
            const [disabled, setDisabled] = useState(false);
            Object.assign(form, { write: setDate, disable: setDisabled });
            return (
                <DatetimePicker
                    id="dt"
                    date={date}
                    allowNull={false}
                    disabled={disabled}
                    onValueChange={(value) => values.push(value)}
                    onValidityChange={(valid) => validity.push(valid)}
                />
            );
        }
        await render(<FormHost />);
        expect(input().value).toBe('1/15/2024, 8:00 AM');
        expect(validity).toEqual([true]);
        await userEvent.clear(input());
        await userEvent.type(input(), '2/2/2024, 10:00 AM');
        expect(values.at(-1)!.toString()).toBe(new FdDate(2024, 2, 2, 10, 0, 0).toString());
        await userEvent.clear(input());
        await stable();
        expect(values.at(-1)).toBeNull();
        expect(validity.at(-1)).toBe(false);
        form.write(new FdDate(2024, 7, 1, 9, 0, 0));
        await stable();
        expect(input().value).toBe('7/1/2024, 9:00 AM');
        expect(validity.at(-1)).toBe(true);
        form.disable(true);
        await stable();
        expect(input().disabled).toBe(true);
        expect(button().disabled).toBe(true);
    });
});

describe('DatetimePicker dateChange', () => {
    interface EmitOptions {
        footer?: boolean;
        allowNull?: boolean;
        disable?: (date: FdDate) => boolean;
    }

    /** A form control: the value it holds (every user change, `onValueChange`), its validity and the emitted dates. */
    async function setupEmit(options: EmitOptions = {}) {
        const host = {
            value: null as FdDate | null,
            valid: true,
            changes: [] as (FdDate | null)[],
            setValue: (_: FdDate | null) => {}
        };
        function EmitHost() {
            const [value, setValue] = useState<FdDate | null>(new FdDate(2024, 3, 9, 14, 30, 0));
            Object.assign(host, { value, setValue });
            return (
                <DatetimePicker
                    id="dt"
                    date={value}
                    onValueChange={setValue}
                    onValidityChange={(valid) => (host.valid = valid)}
                    onDateChange={(date) => host.changes.push(date)}
                    showFooter={options.footer ?? true}
                    allowNull={options.allowNull ?? true}
                    disableFunction={options.disable}
                />
            );
        }
        await render(<EmitHost />);
        /** Puts the whole text in the field at once, as a paste does. */
        const enter = async (text: string) => {
            await userEvent.fill(input(), text);
            await stable();
        };
        const changes = () => host.changes.map((d) => d?.toString() ?? null);
        return { host, enter, changes };
    }

    it('emits once per accepted change and not for a written value, Cancel or a no-op submit', async () => {
        const { host, enter, changes } = await setupEmit();
        host.setValue(new FdDate(2024, 3, 10, 9, 0, 0));
        await stable();
        expect(input().value).toBe('3/10/2024, 9:00 AM');
        expect(changes()).toEqual([]);
        // Cancel drops a picked day
        await open();
        await userEvent.click(day(12));
        await userEvent.click(buttonNamed('Cancel')!);
        await stable();
        expect(changes()).toEqual([]);
        // OK without a change
        await open();
        await userEvent.click(buttonNamed('OK')!);
        await stable();
        expect(changes()).toEqual([]);
        // OK with a change
        await open();
        await userEvent.click(day(12));
        await userEvent.click(buttonNamed('OK')!);
        await stable();
        expect(changes()).toEqual([new FdDate(2024, 3, 12, 9, 0, 0).toString()]);
        expect(host.value!.toString()).toBe(new FdDate(2024, 3, 12, 9, 0, 0).toString());
        // typed and accepted once, then Enter and blur add nothing
        await enter('4/1/2024, 9:15 AM');
        await enter('4/1/2024, 9:15 AM');
        input().focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.tab();
        await stable();
        expect(changes()).toEqual([
            new FdDate(2024, 3, 12, 9, 0, 0).toString(),
            new FdDate(2024, 4, 1, 9, 15, 0).toString()
        ]);
        // the form writing the emitted value back does not emit again
        host.setValue(host.changes.at(-1)!);
        await stable();
        expect(changes()).toHaveLength(2);
    });

    it('emits null once when an allowed value is cleared', async () => {
        const { host, enter, changes } = await setupEmit();
        await enter('');
        await enter('');
        expect(changes()).toEqual([null]);
        expect(host.value).toBeNull();
        expect(host.valid).toBe(true);
    });

    it('does not emit for unreadable, disabled or disallowed null input, but passes it to the form', async () => {
        const { host, enter, changes } = await setupEmit({ allowNull: false, disable: (d) => d.day === 13 });
        await enter('not a date');
        expect(changes()).toEqual([]);
        expect(host.value).not.toBeNull();
        expect(host.valid).toBe(false);
        await enter('3/13/2024, 8:00 AM');
        expect(changes()).toEqual([]);
        expect(host.value!.toString()).toBe(new FdDate(2024, 3, 13, 8, 0, 0).toString());
        expect(host.valid).toBe(false);
        await enter('');
        expect(changes()).toEqual([]);
        expect(host.value).toBeNull();
        expect(host.valid).toBe(false);
        // a valid value emits again
        await enter('3/14/2024, 8:00 AM');
        expect(changes()).toEqual([new FdDate(2024, 3, 14, 8, 0, 0).toString()]);
        expect(host.valid).toBe(true);
    });

    it('emits once without the footer and keeps the popover open after a day pick', async () => {
        const { host, changes } = await setupEmit({ footer: false });
        await open();
        await userEvent.click(day(9));
        await stable();
        // the same day and time: nothing to apply
        expect(changes()).toEqual([]);
        await userEvent.click(day(20));
        await stable();
        expect(changes()).toEqual([new FdDate(2024, 3, 20, 14, 30, 0).toString()]);
        expect(host.value!.day).toBe(20);
        expect(document.querySelector('#dt-calendar')).not.toBeNull();
    });
});

const SECONDS_FORMAT = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
} as const;

const RULES: SpecialDayRule<FdDate>[] = [
    { specialDayNumber: 5, legendText: 'Team meeting', rule: (d) => d.day === 13 },
    { specialDayNumber: 6, legendText: 'Release', appointment: true, rule: (d) => d.day === 15 }
];

describe('DatetimePicker modes', () => {
    /** The pickers of the Angular spec's modes host, with an adapter of their own. */
    async function setupModes() {
        const adapter = new FdDatetimeAdapter();
        const host = { custom: null as FdDate | null };
        const date = new FdDate(2024, 3, 9, 14, 30, 15);
        function ModesHost() {
            const [custom, setCustom] = useState<FdDate | null>(new FdDate(2024, 3, 9, 14, 30, 0));
            host.custom = custom;
            return (
                <DatetimeAdapterProvider adapter={adapter}>
                    <DatetimePicker id="dis" disabled date={date} />
                    <DatetimePicker id="sec" date={date} customDateTimeFormat={SECONDS_FORMAT} />
                    <DatetimePicker
                        id="cus"
                        date={custom}
                        onDateChange={setCustom}
                        customDateTimeFormat={SECONDS_FORMAT}
                    />
                    <DatetimePicker id="leg" date={date} specialDaysRules={RULES} showCalendarLegend legendCol />
                    <DatetimePicker id="msg" date={date} message="Times are local" messageType="information" />
                </DatetimeAdapterProvider>
            );
        }
        await render(<ModesHost />);
        return { adapter, host };
    }

    it('does not open when disabled', async () => {
        await setupModes();
        expect(button('dis').disabled).toBe(true);
        button('dis').click();
        input('dis').dispatchEvent(new KeyboardEvent('keydown', { key: 'F4', bubbles: true }));
        await stable();
        expect(document.querySelector('#dis-calendar')).toBeNull();
        expect(button('dis').getAttribute('aria-expanded')).toBe('false');
    });

    it('shows 24-hour columns with seconds for a matching format', async () => {
        await setupModes();
        expect(input('sec').value).toBe('3/9/2024, 14:30:15');
        await open('sec');
        expect(document.querySelector('#sec-time-hours')!.getAttribute('aria-valuetext')).toBe('14');
        expect(document.querySelector('#sec-time-seconds')!.getAttribute('aria-valuetext')).toBe('15');
        expect(document.querySelector('#sec-time-period')).toBeNull();
    });

    it('parses typed text with customDateTimeFormat', async () => {
        const { adapter, host } = await setupModes();
        const parse = vi.spyOn(adapter, 'parse');
        expect(input('cus').value).toBe('3/9/2024, 14:30:00');
        await userEvent.clear(input('cus'));
        await userEvent.type(input('cus'), '3/12/2024, 16:45:30');
        await userEvent.tab();
        await stable();
        // the format of the picker, not the provided one, reads the text
        expect(parse).toHaveBeenLastCalledWith('3/12/2024, 16:45:30', SECONDS_FORMAT);
        expect(host.custom!.toString()).toBe(new FdDate(2024, 3, 12, 16, 45, 30).toString());
        expect(input('cus').value).toBe('3/12/2024, 16:45:30');
        parse.mockRestore();
    });

    it('keeps what was typed when the date it emitted comes back after a later keystroke', async () => {
        // Angular's flaky case: "3/12/2024, " is a date (emitted, bound back later), "3/12/2024, 1" is not; the date
        // given back must not replace the text typed since
        const { adapter, host } = await setupModes();
        await userEvent.clear(input('cus'));
        await userEvent.type(input('cus'), '3/12/2024, ');
        expect(adapter.isValid(host.custom)).toBe(true);
        const emitted = host.custom;
        await userEvent.type(input('cus'), '1');
        await stable();
        expect(host.custom).toBe(emitted);
        expect(input('cus').value).toBe('3/12/2024, 1');
        await userEvent.type(input('cus'), '6:45:30');
        await stable();
        expect(input('cus').value).toBe('3/12/2024, 16:45:30');
        expect(host.custom!.toString()).toBe(new FdDate(2024, 3, 12, 16, 45, 30).toString());
    });

    it('renders the legend inside the calendar', async () => {
        await setupModes();
        await open('leg');
        const calendar = document.getElementById('leg-calendar')!;
        expect(calendar.textContent).toContain('Team meeting');
        expect(calendar.textContent).toContain('Release');
        // one legend, the calendar's: the picker shows none of its own
        expect(calendar.closest('[role=dialog]')!.textContent!.match(/Team meeting/g)).toHaveLength(1);
    });

    it('hides the message while open and shows it again on close', async () => {
        await setupModes();
        /** The message shown next to the field, not the one inside the picker. */
        const fieldMessage = () =>
            [...document.querySelectorAll<HTMLElement>('[aria-label="Field validation messages"]')].find(
                (m) =>
                    m.textContent!.includes('Times are local') &&
                    m.checkVisibility() &&
                    m.getBoundingClientRect().height > 0
            );
        input('msg').focus();
        await stable();
        await expect.poll(() => fieldMessage()).toBeDefined();
        await open('msg');
        await expect.poll(() => fieldMessage()).toBeUndefined();
        // the picker shows it inside instead
        expect(document.querySelector('#msg-calendar')!.closest('[role="dialog"]')!.textContent).toContain(
            'Times are local'
        );
        await userEvent.keyboard('{Escape}');
        await stable();
        expect(document.activeElement).toBe(input('msg'));
        await expect.poll(() => fieldMessage()).toBeDefined();
    });
});

describe('DatetimePicker reopening', () => {
    it('reopens on the month of the submitted date', async () => {
        const host = await setup();
        await open();
        const header = () =>
            [...document.querySelectorAll<HTMLButtonElement>('#dt-calendar > div:first-child button')]
                .map((b) => b.textContent!.trim())
                .filter(Boolean);
        expect(header()).toEqual(['March', '2024']);
        const next = () => document.querySelector<HTMLButtonElement>('#dt-calendar button[aria-label^="Next"]')!;
        await userEvent.click(next());
        await userEvent.click(next());
        await stable();
        expect(header()).toEqual(['May', '2024']);
        await userEvent.click(day(15));
        await userEvent.click(buttonNamed('OK')!);
        await stable();
        expect(host.date!.toDateString()).toBe('2024-05-15');
        await expect.poll(() => document.querySelector('#dt-calendar')).toBeNull();
        await open();
        expect(header()).toEqual(['May', '2024']);
        expect((document.activeElement as HTMLElement).getAttribute('data-fd-calendar-date-day')).toBe('15');
    });

    it('opens on today without a value, with OK disabled until a day is picked', async () => {
        await render(<DatetimePicker id="dt" />);
        expect(input().value).toBe('');
        await open();
        const today = FdDate.getToday();
        expect((document.activeElement as HTMLElement).getAttribute('data-fd-calendar-date-day')).toBe(
            String(today.day)
        );
        expect(buttonNamed('OK')!.disabled).toBe(true);
        await userEvent.click(day(today.day));
        await stable();
        expect(buttonNamed('OK')!.disabled).toBe(false);
    });
});

describe('DatetimePicker (React)', () => {
    it('passes native props, className and ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        await render(<DatetimePicker id="dt" ref={ref} className="custom" data-sample="Sample" />);
        expect(ref.current).toBe(picker());
        expect(ref.current!.classList.contains('custom')).toBe(true);
        expect(ref.current!.classList.contains('inline-block')).toBe(true);
        expect(ref.current!.dataset['sample']).toBe('Sample');
    });

    it('passes props to the input, the button, the calendar and the time', async () => {
        const onFocus = vi.fn();
        const onClick = vi.fn();
        await render(
            <DatetimePicker
                id="dt"
                inputId="field"
                defaultDate={new FdDate(2024, 3, 9, 14, 30, 0)}
                inputProps={{ onFocus, 'data-part': 'input' } as never}
                buttonProps={{ onClick, 'data-part': 'button' } as never}
                calendarProps={{ 'data-part': 'calendar' } as never}
                timeProps={{ 'data-part': 'time' } as never}
            />
        );
        expect(input().id).toBe('field');
        expect(input().dataset['part']).toBe('input');
        input().focus();
        expect(onFocus).toHaveBeenCalled();
        expect(button().dataset['part']).toBe('button');
        await open();
        expect(onClick).toHaveBeenCalled();
        expect(document.getElementById('dt-calendar')!.dataset['part']).toBe('calendar');
        expect(document.getElementById('dt-time')!.dataset['part']).toBe('time');
    });

    it('labels the input from aria-labelledby or aria-label, and sets aria-required', async () => {
        await render(
            <>
                <span id="label">Start</span>
                <DatetimePicker id="a" aria-labelledby="label" required />
                <DatetimePicker id="b" aria-label="End" />
            </>
        );
        expect(input('a').getAttribute('aria-labelledby')).toBe('label');
        expect(input('a').hasAttribute('aria-label')).toBe(false);
        expect(input('a').getAttribute('aria-required')).toBe('true');
        expect(input('b').getAttribute('aria-label')).toBe('End');
        expect(picker('a').hasAttribute('aria-labelledby')).toBe(false);
    });

    it('keeps the button out of the tab order unless buttonFocusable', async () => {
        await render(
            <>
                <DatetimePicker id="a" />
                <DatetimePicker id="b" buttonFocusable />
            </>
        );
        expect(button('a').tabIndex).toBe(-1);
        expect(button('b').tabIndex).toBe(0);
    });

    it('keeps the picker open on a press in the field, and closes it on a press outside', async () => {
        const closed = vi.fn();
        await render(
            <>
                <DatetimePicker id="dt" defaultDate={new FdDate(2024, 3, 9, 14, 30, 0)} onClosed={closed} />
                <button id="after">After</button>
            </>
        );
        await open();
        await userEvent.click(input());
        await stable();
        expect(document.querySelector('#dt-calendar')).not.toBeNull();
        await userEvent.click(document.getElementById('after')!);
        await stable();
        await expect.poll(() => document.querySelector('#dt-calendar')).toBeNull();
        expect(closed).toHaveBeenCalledTimes(1);
        // the focus stays where the press put it
        expect(document.activeElement).toBe(document.getElementById('after'));
    });

    it('opens and closes from code and controlled, and reports it', async () => {
        const actions = createRef<DatetimePickerActions>();
        const onOpenChange = vi.fn();
        const changes: (FdDate | null)[] = [];
        const { rerender } = await render(
            <DatetimePicker
                id="dt"
                actionsRef={actions}
                defaultDate={new FdDate(2024, 3, 9, 14, 30, 0)}
                onOpenChange={onOpenChange}
                onDateChange={(d) => changes.push(d)}
            />
        );
        actions.current!.setOpen(true);
        await stable();
        expect(document.querySelector('#dt-calendar')).not.toBeNull();
        expect(onOpenChange).toHaveBeenLastCalledWith(true);
        await userEvent.click(day(21));
        actions.current!.submit();
        await stable();
        await expect.poll(() => document.querySelector('#dt-calendar')).toBeNull();
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
        expect(changes.map((d) => d!.day)).toEqual([21]);
        actions.current!.read('not a date', true);
        await stable();
        expect(actions.current!.isInvalid()).toBe(true);
        await rerender(<DatetimePicker id="dt" open defaultDate={new FdDate(2024, 3, 9, 14, 30, 0)} />);
        await stable();
        expect(document.querySelector('#dt-calendar')).not.toBeNull();
        await rerender(<DatetimePicker id="dt" open={false} defaultDate={new FdDate(2024, 3, 9, 14, 30, 0)} />);
        await stable();
        await expect.poll(() => document.querySelector('#dt-calendar')).toBeNull();
    });

    it('takes an equal date given again (a new object each render) as no new date', async () => {
        function InlineHost() {
            const [, setCount] = useState(0);
            return (
                <DatetimePicker
                    id="dt"
                    date={new FdDate(2024, 3, 9, 14, 30, 0)}
                    onValueChange={() => setCount((count) => count + 1)}
                />
            );
        }
        await render(<InlineHost />);
        await userEvent.clear(input());
        await userEvent.type(input(), 'nope');
        await stable();
        expect(input().value).toBe('nope');
    });

    it('closes when disabled while open', async () => {
        const { rerender } = await render(<DatetimePicker id="dt" />);
        await open();
        expect(document.querySelector('#dt-calendar')).not.toBeNull();
        await rerender(<DatetimePicker id="dt" disabled />);
        await stable();
        await expect.poll(() => document.querySelector('#dt-calendar')).toBeNull();
    });

    it('reports touched when the field is left, and takes a state over the validation', async () => {
        const touched = vi.fn();
        const { rerender } = await render(
            <>
                <DatetimePicker id="dt" onTouched={touched} />
                <button id="after">After</button>
            </>
        );
        await userEvent.type(input(), 'nope');
        expect(touched).not.toHaveBeenCalled();
        await userEvent.tab();
        await stable();
        expect(touched).toHaveBeenCalled();
        expect(input().getAttribute('aria-invalid')).toBe('true');
        await rerender(
            <>
                <DatetimePicker id="dt" onTouched={touched} state="warning" />
                <button id="after">After</button>
            </>
        );
        expect(input().hasAttribute('aria-invalid')).toBe(false);
        expect(description(input())).toContain('Value state Warning');
        await rerender(
            <>
                <DatetimePicker id="dt" onTouched={touched} useValidation={false} />
                <button id="after">After</button>
            </>
        );
        expect(input().hasAttribute('aria-invalid')).toBe(false);
    });

    it('shows projected content in the picker and takes the column options', async () => {
        await render(
            <DatetimePicker
                id="dt"
                defaultDate={new FdDate(2024, 3, 9, 14, 30, 5)}
                displaySeconds
                meridian={false}
                keepTwoDigitsTime
                spinnerButtons={false}
            >
                <p id="projected">Pick a slot</p>
            </DatetimePicker>
        );
        await open();
        expect(document.getElementById('projected')!.closest('[role=dialog]')).not.toBeNull();
        expect(document.querySelector('#dt-time-hours')!.getAttribute('aria-valuetext')).toBe('14');
        expect(document.querySelector('#dt-time-seconds')!.getAttribute('aria-valuetext')).toBe('05');
        expect(document.querySelector('#dt-time-period')).toBeNull();
    });
});
