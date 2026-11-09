import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { FdDate } from '@/lib/datetime';
import { DateRange, type SpecialDayRule } from '@/ui/calendar/calendar';
import { DatePicker, type DatePickerValue } from './date-picker';

const frame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
const stable = async () => {
    await frame();
    await frame();
};

/** The cell of a day of the current month in an open calendar. */
function dayCell(calendarId: string, day: number): HTMLElement {
    return document.querySelector<HTMLElement>(
        `#${calendarId} [data-fd-calendar-month-status="current"][data-fd-calendar-date-day="${day}"]`
    )!;
}

const picker = (id: string) => document.getElementById(id)!;
const input = (id = 'dp') => picker(id).querySelector<HTMLInputElement>('input')!;
const button = (id = 'dp') => picker(id).querySelector<HTMLButtonElement>('button[aria-label="Open picker"]')!;
const buttonNamed = (name: string) =>
    [...document.querySelectorAll('button')].find((b) => b.textContent!.trim().startsWith(name))!;
const todayButton = () => [...document.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Today')!;
/** Month and year shown in the header of an open calendar. */
const header = (id: string) =>
    [...document.querySelectorAll<HTMLButtonElement>(`#${id}-calendar > div:first-child button`)]
        .map((b) => b.textContent!.trim())
        .filter(Boolean);
/** All the texts that describe the input. */
const description = (field: HTMLInputElement) =>
    (field.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .map((id) => document.getElementById(id)?.textContent ?? '')
        .join(' ');

interface HostOptions {
    disable?: (date: FdDate) => boolean;
    onBlur?: boolean;
    today?: boolean;
    message?: string | null;
}

/** The pickers of the Angular spec's host, with their values in state; `values` reads the latest. */
async function setup(options: HostOptions = {}) {
    const values = {
        date: null as FdDate | null,
        range: null as DateRange<FdDate> | null,
        dates: [] as FdDate[],
        setMessage: (_: string | null) => {}
    };
    function Host() {
        const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9));
        const [range, setRange] = useState<DateRange<FdDate> | null>(null);
        const [dates, setDates] = useState<FdDate[]>([]);
        const [message, setMessage] = useState<string | null>(options.message ?? null);
        Object.assign(values, { date, range, dates, setMessage });
        return (
            <>
                <DatePicker
                    id="dp"
                    selectedDate={date}
                    onSelectedDateChange={setDate}
                    disableFunction={options.disable}
                    processInputOnBlur={options.onBlur}
                    showTodayButton={options.today}
                    message={message}
                    messageType="information"
                />
                <DatePicker id="rg" type="range" selectedRangeDate={range} onSelectedRangeDateChange={setRange} />
                <DatePicker
                    id="mu"
                    allowMultipleSelection
                    selectedMultipleDates={dates}
                    onSelectedMultipleDatesChange={setDates}
                />
                <button id="after">After</button>
            </>
        );
    }
    await render(<Host />);
    return values;
}

describe('DatePicker', () => {
    it('shows the date in the field', async () => {
        await setup();
        expect(input().value).toBe('3/9/2024');
        expect(input().getAttribute('aria-label')).toBe('Date input');
        expect(input('rg').getAttribute('aria-label')).toBe('Date range input');
        expect(button().getAttribute('aria-expanded')).toBe('false');
    });

    it('opens the calendar on the date, picks a day and closes', async () => {
        const values = await setup();
        await userEvent.click(button());
        await stable();
        expect(button().getAttribute('aria-expanded')).toBe('true');
        expect((document.activeElement as HTMLElement).getAttribute('data-fd-calendar-date-day')).toBe('9');
        await userEvent.keyboard('{ArrowRight}{Enter}');
        await stable();
        expect(values.date!.toDateString()).toBe('2024-03-10');
        expect(input().value).toBe('3/10/2024');
        await expect.poll(() => document.querySelector('#dp-calendar')).toBeNull();
        expect(document.activeElement).toBe(input());
    });

    it('opens with F4 and Alt+Down and closes with Escape', async () => {
        await setup();
        input().focus();
        await userEvent.keyboard('{F4}');
        await stable();
        expect(document.querySelector('#dp-calendar')).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await stable();
        await expect.poll(() => document.querySelector('#dp-calendar')).toBeNull();
        expect(document.activeElement).toBe(input());
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await stable();
        expect(document.querySelector('#dp-calendar')).not.toBeNull();
    });

    it('reads typed dates while typing, and an unreadable date sets the error state', async () => {
        const values = await setup();
        await userEvent.clear(input());
        await userEvent.type(input(), ' 4/1/2024');
        await stable();
        expect(values.date!.toDateString()).toBe('2024-04-01');
        // what was typed stays, spaces included
        expect(input().value).toBe(' 4/1/2024');
        await userEvent.clear(input());
        await userEvent.type(input(), 'someday');
        await userEvent.tab();
        await stable();
        expect(input().value).toBe('someday');
        expect(input().getAttribute('aria-invalid')).toBe('true');
        await userEvent.clear(input());
        await stable();
        expect(values.date).toBeNull();
        expect(input().hasAttribute('aria-invalid')).toBe(false);
    });

    it('reads on Enter and blur only with processInputOnBlur', async () => {
        const values = await setup({ onBlur: true });
        await userEvent.clear(input());
        await userEvent.type(input(), '5/20/2024');
        await stable();
        expect(values.date!.toDateString()).toBe('2024-03-09');
        expect(input().value).toBe('5/20/2024');
        await userEvent.keyboard('{Enter}');
        await stable();
        expect(values.date!.toDateString()).toBe('2024-05-20');
    });

    it('formats a typed date on blur', async () => {
        await setup();
        await userEvent.clear(input());
        await userEvent.type(input(), ' 04/01/2024 ');
        expect(input().value).toBe(' 04/01/2024 ');
        await userEvent.tab();
        await stable();
        expect(input().value).toBe('4/1/2024');
    });

    it('sets the error state for a disabled date', async () => {
        await setup({ disable: (d) => d.day === 13 });
        await userEvent.clear(input());
        await userEvent.type(input(), '3/13/2024');
        await userEvent.tab();
        await stable();
        expect(input().getAttribute('aria-invalid')).toBe('true');
    });

    it('picks a range with two clicks and reads a typed range', async () => {
        const values = await setup();
        await userEvent.click(button('rg'));
        await stable();
        await userEvent.click(dayCell('rg-calendar', 4));
        await stable();
        expect(values.range).toBeNull();
        // the picked start shows in the calendar
        expect(dayCell('rg-calendar', 4).getAttribute('aria-selected')).toBe('true');
        await userEvent.click(dayCell('rg-calendar', 2));
        await stable();
        expect(values.range!.start!.day).toBe(2);
        expect(values.range!.end!.day).toBe(4);
        expect(input('rg').value).toMatch(/^\d+\/2\/\d{4} - \d+\/4\/\d{4}$/);
        await expect.poll(() => document.querySelector('#rg-calendar')).toBeNull();
        await userEvent.clear(input('rg'));
        await userEvent.type(input('rg'), '6/10/2024 - 6/1/2024');
        await stable();
        // the ends are ordered
        expect(values.range!.start!.toDateString()).toBe('2024-06-01');
        expect(values.range!.end!.toDateString()).toBe('2024-06-10');
    });

    it('picks multiple dates and keeps the calendar open', async () => {
        const values = await setup();
        await userEvent.click(button('mu'));
        await stable();
        await userEvent.click(dayCell('mu-calendar', 3));
        await userEvent.click(dayCell('mu-calendar', 5));
        await stable();
        expect(values.dates).toHaveLength(2);
        expect(document.querySelector('#mu-calendar')).not.toBeNull();
        expect(input('mu').value.split(', ')).toHaveLength(2);
    });

    it('selects today with the today button', async () => {
        const values = await setup({ today: true });
        await userEvent.click(button());
        await stable();
        await userEvent.click(todayButton());
        await stable();
        expect(values.date!.toDateString()).toBe(FdDate.getNow().toDateString());
        await expect.poll(() => document.querySelector('#dp-calendar')).toBeNull();
    });

    it('describes the field with the state and the message', async () => {
        const values = await setup();
        expect(input().hasAttribute('aria-describedby')).toBe(false);
        values.setMessage('Dates are local');
        await stable();
        expect(description(input())).toContain('Dates are local');
        await userEvent.clear(input());
        await userEvent.type(input(), 'someday');
        await stable();
        expect(description(input())).toContain('Value state Error');
        expect(description(input())).toContain('Dates are local');
    });

    it('keeps aria-haspopup "dialog" on the button, as the calendar opens in a dialog', async () => {
        // upstream says "grid" on the input; the popup here is the popover body with role="dialog"
        await setup();
        expect(button().getAttribute('aria-haspopup')).toBe('dialog');
        await userEvent.click(button());
        await stable();
        const dialog = document.querySelector('#dp-calendar')!.closest('[role="dialog"]')!;
        expect(dialog.getAttribute('aria-label')).toBe('Choose date');
        expect(button().getAttribute('aria-controls')).toBe(dialog.id);
    });

    it('shows the message in the popover', async () => {
        await setup({ message: 'Dates are local' });
        await userEvent.click(button());
        await stable();
        const body = document.querySelector('#dp-calendar')!.closest('[role="dialog"]')!;
        expect(body.textContent).toContain('Dates are local');
    });

    it('keeps the calendar open when the field is pressed, and closes on a press outside', async () => {
        await setup();
        await userEvent.click(button());
        await stable();
        await userEvent.click(input());
        await stable();
        expect(document.querySelector('#dp-calendar')).not.toBeNull();
        await userEvent.click(document.getElementById('after')!);
        await stable();
        await expect.poll(() => document.querySelector('#dp-calendar')).toBeNull();
        // the focus stays where the press put it
        expect(document.activeElement).toBe(document.getElementById('after'));
    });

    it('keeps the button out of the tab order unless buttonFocusable', async () => {
        const screen = await render(<DatePicker id="dp" />);
        expect(button().tabIndex).toBe(-1);
        await screen.rerender(<DatePicker id="dp" buttonFocusable />);
        expect(button().tabIndex).toBe(0);
    });
});

describe('DatePicker mobile', () => {
    function MobileHost({ values }: { values: { date: FdDate | null } }) {
        const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 3, 9));
        values.date = date;
        return (
            <DatePicker
                id="mob"
                mobile
                selectedDate={date}
                onSelectedDateChange={setDate}
                mobileConfig={{ title: 'Pick', approveButtonText: 'Save', cancelButtonText: 'Cancel' }}
            />
        );
    }

    it('opens a dialog; cancel restores the date, save keeps it', async () => {
        const values = { date: null as FdDate | null };
        await render(<MobileHost values={values} />);
        const field = input('mob');
        await userEvent.click(field);
        await stable();
        const dialog = document.querySelector('#mob-calendar')!.closest('[role=dialog]')!;
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(dialog.textContent).toContain('Pick');
        expect(dialog.getAttribute('aria-labelledby')).toBe(document.getElementById('mob-dialog-title')!.id);
        expect((document.activeElement as HTMLElement).getAttribute('data-fd-calendar-date-day')).toBe('9');
        await userEvent.click(dayCell('mob-calendar', 12));
        await stable();
        expect(values.date!.day).toBe(12);
        // still open
        expect(document.querySelector('#mob-calendar')).not.toBeNull();
        await userEvent.click(buttonNamed('Cancel'));
        await stable();
        expect(values.date!.day).toBe(9);
        expect(field.value).toBe('3/9/2024');
        await expect.poll(() => document.querySelector('#mob-calendar')).toBeNull();
        await userEvent.click(field);
        await stable();
        await userEvent.click(dayCell('mob-calendar', 20));
        await userEvent.click(buttonNamed('Save'));
        await stable();
        expect(values.date!.day).toBe(20);
        await expect.poll(() => document.querySelector('#mob-calendar')).toBeNull();
    });

    it('discards the change on Escape and on the close button', async () => {
        const values = { date: null as FdDate | null };
        await render(<MobileHost values={values} />);
        await userEvent.click(button('mob'));
        await stable();
        await userEvent.click(dayCell('mob-calendar', 14));
        expect(values.date!.day).toBe(14);
        await userEvent.keyboard('{Escape}');
        await stable();
        expect(values.date!.day).toBe(9);
        await expect.poll(() => document.querySelector('#mob-calendar')).toBeNull();
        await userEvent.click(button('mob'));
        await stable();
        await userEvent.click(dayCell('mob-calendar', 15));
        await userEvent.click(document.querySelector<HTMLElement>('[role=dialog] button[aria-label="Close"]')!);
        await stable();
        expect(values.date!.day).toBe(9);
    });
});

describe('DatePicker values', () => {
    it('writes, reads, validates and disables', async () => {
        const changes: DatePickerValue<FdDate>[] = [];
        const validity: boolean[] = [];
        const form = { write: (_: FdDate | null) => {}, disable: (_: boolean) => {} };
        function Host() {
            const [date, setDate] = useState<FdDate | null>(new FdDate(2024, 1, 15));
            const [disabled, setDisabled] = useState(false);
            Object.assign(form, { write: setDate, disable: setDisabled });
            return (
                <>
                    <DatePicker
                        id="f1"
                        selectedDate={date}
                        onSelectedDateChange={setDate}
                        allowNull={false}
                        onValueChange={(value) => changes.push(value)}
                        onValidityChange={(valid) => validity.push(valid)}
                    />
                    <DatePicker
                        id="f2"
                        type="range"
                        disabled={disabled}
                        defaultSelectedRangeDate={new DateRange(new FdDate(2024, 1, 1), new FdDate(2024, 1, 5))}
                    />
                </>
            );
        }
        await render(<Host />);
        expect(input('f1').value).toBe('1/15/2024');
        expect(input('f2').value).toBe('1/1/2024 - 1/5/2024');
        expect(validity).toEqual([true]);
        await userEvent.clear(input('f1'));
        await userEvent.type(input('f1'), '2/2/2024');
        expect((changes.at(-1) as FdDate).toDateString()).toBe('2024-02-02');
        await userEvent.clear(input('f1'));
        await stable();
        expect(changes.at(-1)).toBeNull();
        expect(validity.at(-1)).toBe(false);
        expect(input('f1').getAttribute('aria-invalid')).toBe('true');
        form.write(new FdDate(2024, 7, 1));
        await stable();
        expect(input('f1').value).toBe('7/1/2024');
        expect(validity.at(-1)).toBe(true);
        form.disable(true);
        await stable();
        expect(input('f2').disabled).toBe(true);
        expect(picker('f2').querySelector('button')!.disabled).toBe(true);
    });

    it('shows the value it is given when controlled', async () => {
        const onChange = vi.fn();
        await render(<DatePicker id="dp" selectedDate={new FdDate(2024, 1, 15)} onSelectedDateChange={onChange} />);
        await userEvent.click(input());
        await userEvent.keyboard('{End}{Backspace}');
        expect(onChange).toHaveBeenCalled();
        expect(input().value).toBe('1/15/2024');
    });

    it('writes and clears multiple dates and multiple ranges', async () => {
        const changes: DatePickerValue<FdDate>[] = [];
        const view = (dates: FdDate[] | undefined, ranges: DateRange<FdDate>[] | undefined) => (
            <>
                <DatePicker
                    id="fm"
                    allowMultipleSelection
                    selectedMultipleDates={dates}
                    onValueChange={(value) => changes.push(value)}
                />
                <DatePicker id="fr" type="range" allowMultipleSelection selectedMultipleDateRanges={ranges} />
            </>
        );
        const screen = await render(
            view(
                [new FdDate(2024, 1, 2), new FdDate(2024, 1, 3)],
                [new DateRange(new FdDate(2024, 1, 1), new FdDate(2024, 1, 5))]
            )
        );
        expect(input('fm').value).toBe('1/2/2024, 1/3/2024');
        expect(input('fr').value).toBe('1/1/2024 - 1/5/2024');
        await screen.rerender(
            view(
                [new FdDate(2024, 6, 1)],
                [
                    new DateRange(new FdDate(2024, 6, 1), new FdDate(2024, 6, 3)),
                    new DateRange(new FdDate(2024, 6, 10), new FdDate(2024, 6, 12))
                ]
            )
        );
        expect(input('fm').value).toBe('6/1/2024');
        expect(input('fr').value).toBe('6/1/2024 - 6/3/2024, 6/10/2024 - 6/12/2024');
        await screen.rerender(view([], []));
        expect(input('fm').value).toBe('');
        expect(input('fr').value).toBe('');
        expect(input('fm').hasAttribute('aria-invalid')).toBe(false);
        // uncontrolled from here
        await screen.rerender(view(undefined, undefined));
        await userEvent.type(input('fm'), '7/4/2024, 7/5/2024');
        expect((changes.at(-1) as FdDate[]).map((d) => d.toDateString())).toEqual(['2024-07-04', '2024-07-05']);
        expect(input('fm').value).toBe('7/4/2024, 7/5/2024');
    });

    it('follows the format of customDateTimeFormat', async () => {
        const screen = await render(<DatePicker id="dp" selectedDate={new FdDate(2024, 3, 9)} />);
        await screen.rerender(
            <DatePicker
                id="dp"
                selectedDate={new FdDate(2024, 3, 9)}
                customDateTimeFormat={{ year: 'numeric', month: 'long', day: 'numeric' }}
            />
        );
        expect(input().value).toBe('March 9, 2024');
    });
});

describe('DatePicker modes', () => {
    const weekend = (date: FdDate) => [1, 7].includes(date.getDayOfWeek());
    const after2024 = (date: FdDate) => date.year > 2024;
    const rules: SpecialDayRule<FdDate>[] = [
        { specialDayNumber: 5, legendText: 'Team meeting', rule: (d) => d.day === 13 },
        { specialDayNumber: 6, legendText: 'Release', appointment: true, rule: (d) => d.day === 15 }
    ];

    async function setupModes() {
        const values = {
            dates: [] as FdDate[],
            ranges: [] as DateRange<FdDate>[],
            range: null as DateRange<FdDate> | null
        };
        function Host() {
            const [dates, setDates] = useState([new FdDate(2000, 10, 10)]);
            const [ranges, setRanges] = useState<DateRange<FdDate>[]>([]);
            const [range, setRange] = useState<DateRange<FdDate> | null>(null);
            Object.assign(values, { dates, ranges, range });
            return (
                <>
                    <DatePicker id="dis" disabled selectedDate={new FdDate(2024, 3, 9)} />
                    <DatePicker id="req" required />
                    <DatePicker
                        id="mut"
                        allowMultipleSelection
                        showTodayButton
                        selectedMultipleDates={dates}
                        onSelectedMultipleDatesChange={setDates}
                    />
                    <DatePicker
                        id="mur"
                        type="range"
                        allowMultipleSelection
                        showTodayButton
                        selectedMultipleDateRanges={ranges}
                        onSelectedMultipleDateRangesChange={setRanges}
                    />
                    <DatePicker
                        id="rgd"
                        type="range"
                        selectedRangeDate={range}
                        onSelectedRangeDateChange={setRange}
                        disableRangeStartFunction={weekend}
                        disableRangeEndFunction={after2024}
                    />
                    <DatePicker
                        id="leg"
                        selectedDate={new FdDate(2024, 3, 9)}
                        specialDaysRules={rules}
                        showCalendarLegend
                        legendCol
                    />
                </>
            );
        }
        await render(<Host />);
        const open = async (id: string) => {
            await userEvent.click(button(id));
            await stable();
        };
        return { values, open };
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

    it('sets aria-required', async () => {
        await setupModes();
        expect(input('req').getAttribute('aria-required')).toBe('true');
        expect(input('dis').hasAttribute('aria-required')).toBe(false);
    });

    it('keeps the displayed month when adding a multiple date', async () => {
        const { values, open } = await setupModes();
        await open('mut');
        expect(header('mut')).toEqual(['October', '2000']);
        await userEvent.click(document.querySelector<HTMLButtonElement>('#mut-calendar button[aria-label^="Next"]')!);
        await stable();
        expect(header('mut')).toEqual(['November', '2000']);
        await userEvent.click(dayCell('mut-calendar', 10));
        await stable();
        expect(header('mut')).toEqual(['November', '2000']);
        expect(values.dates.map((d) => d.toDateString())).toEqual(['2000-10-10', '2000-11-10']);
        expect(input('mut').value).toBe('10/10/2000, 11/10/2000');
    });

    it('today button navigates to today in multiple mode', async () => {
        const { values, open } = await setupModes();
        await open('mut');
        expect(header('mut')).toEqual(['October', '2000']);
        await userEvent.click(todayButton());
        await stable();
        const today = FdDate.getNow();
        expect(values.dates.map((d) => d.toDateString())).toEqual([today.toDateString()]);
        const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(today.toDate());
        expect(header('mut')).toEqual([month, String(today.year)]);
    });

    it('picks, types and rejects multiple date ranges', async () => {
        const { values, open } = await setupModes();
        await open('mur');
        await userEvent.click(dayCell('mur-calendar', 2));
        await userEvent.click(dayCell('mur-calendar', 4));
        await stable();
        expect(values.ranges).toHaveLength(1);
        expect(values.ranges[0]!.start!.day).toBe(2);
        expect(values.ranges[0]!.end!.day).toBe(4);
        // the calendar stays open for more ranges
        expect(document.querySelector('#mur-calendar')).not.toBeNull();
        await userEvent.click(todayButton());
        await stable();
        const today = FdDate.getNow().toDateString();
        expect(values.ranges.map((r) => [r.start!.toDateString(), r.end!.toDateString()])).toEqual([[today, today]]);
        await userEvent.keyboard('{Escape}');
        await stable();
        await userEvent.clear(input('mur'));
        await userEvent.type(input('mur'), '3/1/2024 - 3/3/2024, 3/12/2024 - 3/10/2024');
        await stable();
        expect(values.ranges.map((r) => `${r.start!.toDateString()}/${r.end!.toDateString()}`)).toEqual([
            '2024-03-01/2024-03-03',
            '2024-03-10/2024-03-12'
        ]);
        expect(input('mur').hasAttribute('aria-invalid')).toBe(false);
        await userEvent.clear(input('mur'));
        await userEvent.type(input('mur'), '3/1/2024 - 3/3/2024, sometime');
        await userEvent.tab();
        await stable();
        expect(input('mur').getAttribute('aria-invalid')).toBe('true');
        expect(input('mur').value).toBe('3/1/2024 - 3/3/2024, sometime');
    });

    it('accepts a reversed typed range and marks it invalid when its start or end is disabled', async () => {
        const { values } = await setupModes();
        const type = async (text: string) => {
            await userEvent.clear(input('rgd'));
            await userEvent.type(input('rgd'), text);
            await stable();
        };
        await type('3/15/2024 - 3/11/2024');
        expect(values.range!.start!.toDateString()).toBe('2024-03-11');
        expect(values.range!.end!.toDateString()).toBe('2024-03-15');
        expect(input('rgd').hasAttribute('aria-invalid')).toBe(false);
        // March 9, 2024 is a Saturday: the start is disabled
        await type('3/9/2024 - 3/15/2024');
        expect(input('rgd').getAttribute('aria-invalid')).toBe('true');
        await type('3/11/2024 - 3/15/2024');
        expect(input('rgd').hasAttribute('aria-invalid')).toBe(false);
        // the end is after 2024
        await type('3/11/2024 - 1/6/2025');
        expect(input('rgd').getAttribute('aria-invalid')).toBe('true');
    });

    it('renders the legend inside the calendar with legendCol', async () => {
        const { open } = await setupModes();
        await open('leg');
        const legend = document.querySelector<HTMLElement>('#leg-calendar [role="list"]')!;
        expect(legend).not.toBeNull();
        expect(getComputedStyle(legend).columnWidth).toBe('auto');
        const items = [...legend.querySelectorAll('[role="listitem"]')].map((i) => i.textContent!.trim());
        expect(items.slice(-2)).toEqual(['Team meeting', 'Release']);
        // the picker renders no legend of its own
        expect(document.querySelectorAll('[role="list"][aria-label="Calendar Legend"]')).toHaveLength(1);
    });

    it('picks months of a single date with dateRangeFormat', async () => {
        const onChange = vi.fn();
        await render(
            <DatePicker
                id="dp"
                dateRangeFormat="month"
                defaultSelectedDate={new FdDate(2024, 3, 9)}
                onSelectedDateChange={onChange}
            />
        );
        await userEvent.click(button());
        await stable();
        await userEvent.click(document.querySelector<HTMLElement>('#dp-calendar [data-fd-calendar-month="6"]')!);
        await stable();
        expect(onChange.mock.lastCall![0].toDateString()).toBe('2024-06-01');
        expect(input().value).toBe('6/1/2024');
    });
});

describe('DatePicker (fundamental-react)', () => {
    it('passes native props, className and ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        await render(<DatePicker id="dp" ref={ref} className="custom" data-sample="Sample" />);
        expect(ref.current).toBe(picker('dp'));
        expect(ref.current!.classList.contains('custom')).toBe(true);
        expect(ref.current!.dataset['sample']).toBe('Sample');
    });

    it('passes props to the input, the input group, the button and the calendar', async () => {
        const onClick = vi.fn();
        await render(
            <DatePicker
                id="dp"
                inputProps={{ 'data-sample': 'input' } as object}
                inputGroupProps={{ 'data-sample': 'group' } as object}
                buttonProps={{ 'data-sample': 'button', onClick } as object}
                calendarProps={{ 'data-sample': 'calendar' } as object}
            />
        );
        expect(input().dataset['sample']).toBe('input');
        expect(input().parentElement!.dataset['sample']).toBe('group');
        expect(button().dataset['sample']).toBe('button');
        await userEvent.click(button());
        await stable();
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(document.getElementById('dp-calendar')!.dataset['sample']).toBe('calendar');
    });

    it('labels the input from aria-labelledby or aria-label', async () => {
        const screen = await render(<DatePicker id="dp" aria-labelledby="lbl" />);
        expect(input().getAttribute('aria-labelledby')).toBe('lbl');
        expect(input().hasAttribute('aria-label')).toBe(false);
        await screen.rerender(<DatePicker id="dp" aria-label="Start" />);
        expect(input().getAttribute('aria-label')).toBe('Start');
    });

    it('has no button and does not open when readOnly', async () => {
        const screen = await render(<DatePicker id="dp" readOnly defaultSelectedDate={new FdDate(2012, 12, 12)} />);
        expect(input().readOnly).toBe(true);
        expect(input().value).toBe('12/12/2012');
        expect(picker('dp').querySelector('button')).toBeNull();
        input().focus();
        await userEvent.keyboard('{F4}');
        await stable();
        expect(document.querySelector('#dp-calendar')).toBeNull();
        await screen.rerender(<DatePicker id="dp" defaultSelectedDate={new FdDate(2012, 12, 12)} />);
        expect(button()).not.toBeNull();
    });

    it('reports opening and closing with onOpenChange', async () => {
        const onOpenChange = vi.fn();
        await render(<DatePicker id="dp" onOpenChange={onOpenChange} />);
        await userEvent.click(button());
        await stable();
        await userEvent.click(dayCell('dp-calendar', 12));
        await stable();
        expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    });

    it('opens on openToDate without a value', async () => {
        await render(<DatePicker id="dp" openToDate={new FdDate(2000, 1, 1)} />);
        await userEvent.click(button());
        await stable();
        expect(header('dp')).toEqual(['January', '2000']);
    });

    it('keeps the calendar open after today with closeOnDateChoose false', async () => {
        const onChange = vi.fn();
        await render(<DatePicker id="dp" showTodayButton closeOnDateChoose={false} onValueChange={onChange} />);
        await userEvent.click(button());
        await stable();
        await userEvent.click(todayButton());
        await stable();
        expect(onChange.mock.lastCall![0].toDateString()).toBe(FdDate.getNow().toDateString());
        expect(document.querySelector('#dp-calendar')).not.toBeNull();
    });

    it('shows projected content in the popover', async () => {
        await render(
            <DatePicker id="dp">
                <p id="extra">Pick a weekday</p>
            </DatePicker>
        );
        expect(document.getElementById('extra')).toBeNull();
        await userEvent.click(button());
        await stable();
        expect(document.getElementById('extra')!.closest('[role="dialog"]')).not.toBeNull();
    });
});
