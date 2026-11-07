import { createRef, useSyncExternalStore } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { DatetimeAdapterProvider, FdDate } from '@/lib/datetime';
import {
    Calendar,
    CalendarCloseButton,
    CalendarLegend,
    CalendarLegendItem,
    DateRange,
    type CalendarActions,
    type CalendarType,
    type DaysOfWeek,
    type FdCalendarView,
    type SpecialDayRule
} from './calendar';

const frame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));

interface HostState {
    calType: CalendarType;
    multiple: boolean;
    weekStart: DaysOfWeek | undefined;
    weekNumbers: boolean;
    disable: ((date: FdDate) => boolean) | undefined;
    rules: SpecialDayRule<FdDate>[];
    legendCol: boolean;
    hoverEffect: boolean;
    date: FdDate | null;
    range: DateRange<FdDate> | null;
    dates: FdDate[];
    ranges: DateRange<FdDate>[];
    closes: number;
}

/** The state of the host, as the Angular spec's signals: tests read and set it, the host renders it. */
function createStore(configure?: (state: HostState) => void) {
    let state: HostState = {
        calType: 'single',
        multiple: false,
        weekStart: 1,
        weekNumbers: false,
        disable: undefined,
        rules: [],
        legendCol: false,
        hoverEffect: false,
        date: new FdDate(2024, 3, 9),
        range: null,
        dates: [],
        ranges: [],
        closes: 0
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
        <Calendar
            id="cal"
            calType={s.calType}
            allowMultipleSelection={s.multiple}
            startingDayOfWeek={s.weekStart}
            showWeekNumbers={s.weekNumbers}
            disableFunction={s.disable}
            specialDaysRules={s.rules}
            showCalendarLegend={!!s.rules.length}
            legendCol={s.legendCol}
            rangeHoverEffect={s.hoverEffect}
            selectedDate={s.date}
            onSelectedDateChange={(date) => store.set({ date })}
            selectedRangeDate={s.range}
            onSelectedRangeDateChange={(range) => store.set({ range })}
            selectedMultipleDates={s.dates}
            onSelectedMultipleDatesChange={(dates) => store.set({ dates })}
            selectedMultipleDateRanges={s.ranges}
            onSelectedMultipleDateRangesChange={(ranges) => store.set({ ranges })}
            onCloseCalendar={() => store.set({ closes: store.get().closes + 1 })}
        />
    );
}

async function setup(configure?: (state: HostState) => void) {
    const store = createStore(configure);
    const screen = await render(<Host store={store} />);
    await frame();
    const root = screen.container;
    const host = store.get;
    const set = async (patch: Partial<HostState>) => {
        store.set(patch);
        await frame();
    };
    const currentMonthDay = (label: string) =>
        root.querySelector<HTMLElement>(
            `td[data-fd-calendar-date-day="${label}"][data-fd-calendar-month-status="current"]`
        )!;
    const header = () =>
        [...root.querySelector('[role=group]')!.firstElementChild!.querySelectorAll('button')].map((b) =>
            b.textContent!.trim()
        );
    const button = (label: string) => root.querySelector<HTMLButtonElement>(`button[aria-label^="${label}"]`)!;
    return { screen, host, set, root, stable: frame, currentMonthDay, header, button };
}

/** Visible text of the header buttons: month and year, or the years range. */
const headerOf = (root: HTMLElement) =>
    [...root.querySelector('[role=group]')!.firstElementChild!.querySelectorAll('button')]
        .map((b) => b.textContent!.trim())
        .filter(Boolean);

describe('Calendar', () => {
    it('shows the month of the selected date as a grid', async () => {
        const { root, header, currentMonthDay } = await setup();
        expect(root.querySelector('#cal')!.getAttribute('role')).toBe('group');
        expect(header()).toEqual(['', 'March', '2024', '']);
        const grid = root.querySelector('table[role=grid]')!;
        expect(grid.getAttribute('aria-roledescription')).toBe('Calendar');
        const headers = [...grid.querySelectorAll('thead th')].map((th) => th.textContent!.trim());
        expect(headers).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
        const nine = currentMonthDay('9');
        expect(nine.getAttribute('aria-selected')).toBe('true');
        expect(nine.getAttribute('aria-label')).toContain('March 9, 2024');
        expect(nine.getAttribute('aria-label')).toContain('Selected date');
        expect(nine.tabIndex).toBe(0);
        expect(root.querySelectorAll('td[tabindex="0"]')).toHaveLength(1);
        // March 2024 starts on a Friday: 5 days of February before it
        expect(root.querySelectorAll('td[role=gridcell]')[5]!.textContent!.trim()).toBe('1');
    });

    it('starts the week on the given day and shows week numbers', async () => {
        const { root } = await setup((h) => {
            h.weekStart = 2;
            h.weekNumbers = true;
        });
        const headers = [...root.querySelectorAll('thead th')].map((th) => th.textContent!.trim());
        expect(headers.slice(1, 3)).toEqual(['Mon', 'Tue']);
        expect(headers[0]).toBe('Calendar week');
        const weeks = [...root.querySelectorAll('tbody th[data-fd-calendar-week]')].map((th) => th.textContent!.trim());
        expect(weeks[0]).toBe('9');
        expect(weeks.at(-1)).toBe('13');
    });

    it('selects a date with a click', async () => {
        const { host, currentMonthDay, stable } = await setup();
        await userEvent.click(currentMonthDay('14'));
        await stable();
        expect(host().date!.toDateString()).toBe('2024-03-14');
        expect(host().closes).toBe(1);
        expect(currentMonthDay('14').getAttribute('aria-selected')).toBe('true');
    });

    it('does not select disabled dates', async () => {
        const { host, currentMonthDay, stable } = await setup((h) => (h.disable = () => true));
        const target = currentMonthDay('14');
        expect(target.getAttribute('aria-disabled')).toBe('true');
        target.click();
        await stable();
        expect(host().date!.toDateString()).toBe('2024-03-09');
    });

    it('moves with the arrow keys across months and selects with Enter', async () => {
        const { host, root, header, stable, currentMonthDay } = await setup();
        currentMonthDay('9').focus();
        await userEvent.keyboard('{ArrowDown}{ArrowRight}');
        await stable();
        expect(document.activeElement!.getAttribute('aria-label')).toContain('March 17, 2024');
        for (let i = 0; i < 3; i++) await userEvent.keyboard('{ArrowDown}');
        await stable();
        expect(header()[1]).toBe('April');
        expect(document.activeElement!.getAttribute('aria-label')).toContain('April 7, 2024');
        await userEvent.keyboard('{Enter}');
        await stable();
        expect(host().date!.toDateString()).toBe('2024-04-07');
        // Tab keeps the focus in the calendar: back to the previous button
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement!.id).toBe('cal-header-left-arrow');
        expect(root.contains(document.activeElement)).toBe(true);
    });

    it('navigates months, and picks a month and a year in their views', async () => {
        const { root, header, button, stable } = await setup();
        await userEvent.click(button('Next month'));
        await userEvent.click(button('Next month'));
        await stable();
        expect(header()[1]).toBe('May');
        await userEvent.click(button('May, Select month'));
        await stable();
        const months = [...root.querySelectorAll('td[data-fd-calendar-month]')];
        expect(months).toHaveLength(12);
        expect(document.activeElement).toBe(months[4]);
        await userEvent.click(months[7]!);
        await stable();
        expect(header()[1]).toBe('August');
        await userEvent.click(button('2024, Select year'));
        await stable();
        const years = [...root.querySelectorAll('td[data-fd-calendar-year]')];
        expect(years).toHaveLength(20);
        expect(years[0]!.textContent!.trim()).toBe('2024');
        await userEvent.click(button('Next year'));
        await stable();
        expect(root.querySelector('td[data-fd-calendar-year]')!.textContent!.trim()).toBe('2044');
        await userEvent.click(root.querySelector<HTMLElement>('td[data-fd-calendar-year="2050"]')!);
        await stable();
        expect(header()).toEqual(['', 'August', '2050', '']);
    });

    it('picks a range in either order', async () => {
        const { host, currentMonthDay, stable } = await setup((h) => (h.calType = 'range'));
        await userEvent.click(currentMonthDay('20'));
        await stable();
        expect(host().range!.start!.day).toBe(20);
        expect(host().range!.end).toBeNull();
        await userEvent.click(currentMonthDay('12'));
        await stable();
        expect([host().range!.start!.day, host().range!.end!.day]).toEqual([12, 20]);
        expect(currentMonthDay('15').className).toContain('sapList_SelectionBackgroundColor');
        expect(currentMonthDay('12').getAttribute('aria-label')).toContain('Range start');
    });

    it('selects several dates and spans with Shift', async () => {
        const { host, currentMonthDay, stable } = await setup((h) => (h.multiple = true));
        await userEvent.click(currentMonthDay('4'));
        await userEvent.click(currentMonthDay('6'));
        await stable();
        expect(host().dates.map((d) => d.day)).toEqual([4, 6]);
        await userEvent.click(currentMonthDay('4'));
        await stable();
        expect(host().dates.map((d) => d.day)).toEqual([6]);
        await userEvent.keyboard('{Shift>}');
        await userEvent.click(currentMonthDay('9'));
        await userEvent.keyboard('{/Shift}');
        await stable();
        // the deselected 4 is the anchor of the span
        expect(
            host()
                .dates.map((d) => d.day)
                .sort((a, b) => a - b)
        ).toEqual([4, 5, 6, 7, 8, 9]);
    });

    it('merges several overlapping ranges', async () => {
        const { host, currentMonthDay, stable } = await setup((h) => {
            h.calType = 'range';
            h.multiple = true;
        });
        // a second range around the first one swallows it
        for (const label of ['4', '6', '2', '8']) {
            await userEvent.click(currentMonthDay(label));
            await stable();
        }
        expect(host().ranges.map((r) => `${r.start!.day}-${r.end!.day}`)).toEqual(['2-8']);
    });

    it('marks special days and lists them in the legend', async () => {
        const { root, stable, currentMonthDay } = await setup(
            (h) =>
                (h.rules = [
                    { specialDayNumber: 3, legendText: 'Meeting', rule: (d) => d.day === 13 },
                    { specialDayNumber: 7, legendText: 'Release', rule: (d) => d.day === 20 }
                ])
        );
        expect(currentMonthDay('13').style.getPropertyValue('--cal-legend')).toBe('var(--sapLegendColor3)');
        const legend = root.querySelector('[role=list]')!;
        expect(legend.getAttribute('role')).toBe('list');
        const items = [...legend.querySelectorAll<HTMLElement>('[role=listitem]')];
        expect(items.map((i) => i.textContent!.trim()).slice(-2)).toEqual(['Meeting', 'Release']);
        // while an entry has the focus, only its days keep the marker
        items.at(-1)!.focus();
        await stable();
        expect(currentMonthDay('13').className).not.toContain('shadow-[inset_0_-0.3125rem');
        expect(currentMonthDay('20').className).toContain('shadow-[inset_0_-0.3125rem');
        items.at(-1)!.blur();
        await stable();
        expect(currentMonthDay('13').className).toContain('shadow-[inset_0_-0.3125rem');
    });
});

describe('Calendar forms', () => {
    it('writes and reads the value and validates it', async () => {
        const onValueChange = vi.fn();
        const onIsValidDateChange = vi.fn();
        const ui = (date: FdDate | null) => (
            <Calendar selectedDate={date} onValueChange={onValueChange} onIsValidDateChange={onIsValidDateChange} />
        );
        const screen = await render(ui(new FdDate(2024, 5, 5)));
        const root = screen.container;
        expect(root.textContent).toContain('May');
        expect(onIsValidDateChange).toHaveBeenLastCalledWith(true);
        const cell = root.querySelector<HTMLElement>(
            'td[data-fd-calendar-date-day="20"][data-fd-calendar-month-status="current"]'
        )!;
        await userEvent.click(cell);
        expect((onValueChange.mock.lastCall![0] as FdDate).toDateString()).toBe('2024-05-20');
        await screen.rerender(ui(new FdDate(2024, 2, 30)));
        await frame();
        expect(onIsValidDateChange).toHaveBeenLastCalledWith(false);
        await screen.rerender(ui(null));
        await frame();
        // required: no date is no valid date
        expect(onIsValidDateChange).toHaveBeenLastCalledWith(false);
    });
});

describe('Calendar views and grids', () => {
    it('grids expose aria-readonly and aria-multiselectable per selection mode', async () => {
        const { set, root, button } = await setup();
        const grid = () => root.querySelector('table[role=grid]')!;
        expect(grid().getAttribute('aria-readonly')).toBe('false');
        expect(grid().getAttribute('aria-multiselectable')).toBe('false');
        await set({ calType: 'range' });
        expect(grid().getAttribute('aria-multiselectable')).toBe('true');
        await set({ calType: 'single', multiple: true });
        expect(grid().getAttribute('aria-multiselectable')).toBe('true');
        // the text of a cell is no button of its own
        expect(root.querySelectorAll('td[role=gridcell] [role=button], td[role=gridcell] button')).toHaveLength(0);
        await userEvent.click(button('March, Select month'));
        await frame();
        expect(grid().getAttribute('aria-readonly')).toBe('false');
        expect(grid().getAttribute('aria-multiselectable')).toBe('false');
        expect(root.querySelectorAll('td[role=gridcell] button')).toHaveLength(0);
        await userEvent.click(button('2024, Select year'));
        await frame();
        expect(grid().getAttribute('aria-multiselectable')).toBe('false');
    });

    it('months with six weeks render six rows, others five or four', async () => {
        const { set, root } = await setup();
        const rows = () => root.querySelectorAll('tbody tr[role=row]');
        // March 2024 starts on a Friday: six weeks
        expect(rows()).toHaveLength(6);
        // February 2015 starts on a Sunday and has 28 days: four weeks, the grid keeps its height
        await set({ date: new FdDate(2015, 2, 10) });
        expect(rows()).toHaveLength(4);
        expect(root.querySelectorAll('tbody tr[aria-hidden=true]')).toHaveLength(2);
        // February 2020 with Monday first: the weeks of upstream's spec
        await set({ weekStart: 2, date: new FdDate(2020, 2, 10) });
        expect([...rows()].map((row) => [...row.querySelectorAll('td')].map((td) => td.textContent!.trim()))).toEqual([
            ['27', '28', '29', '30', '31', '1', '2'],
            ['3', '4', '5', '6', '7', '8', '9'],
            ['10', '11', '12', '13', '14', '15', '16'],
            ['17', '18', '19', '20', '21', '22', '23'],
            ['24', '25', '26', '27', '28', '29', '1']
        ]);
    });

    it('today is the tab stop when nothing is selected', async () => {
        const { root } = await setup((h) => (h.date = null));
        const stops = root.querySelectorAll<HTMLElement>('td[tabindex="0"]');
        expect(stops).toHaveLength(1);
        expect(stops[0]!.getAttribute('data-fd-calendar-date-day')).toBe(String(FdDate.getNow().day));
        expect(stops[0]!.getAttribute('data-fd-calendar-month-status')).toBe('current');
        expect(stops[0]!.getAttribute('aria-label')).toContain('Today');
    });

    it('range hover marks the days up to the hovered day', async () => {
        const { root, currentMonthDay, stable } = await setup((h) => {
            h.calType = 'range';
            h.hoverEffect = true;
        });
        const marked = () =>
            [...root.querySelectorAll<HTMLElement>('td[data-fd-calendar-month-status="current"]')]
                .filter((td) => td.className.includes('sapList_SelectionBackgroundColor'))
                .map((td) => Number(td.getAttribute('data-fd-calendar-date-day')));
        await userEvent.click(currentMonthDay('12'));
        await userEvent.hover(currentMonthDay('16'));
        await stable();
        expect(marked()).toEqual([13, 14, 15]);
        await userEvent.hover(currentMonthDay('8'));
        await stable();
        expect(marked()).toEqual([9, 10, 11]);
    });

    it('the years-range view lists year ranges and Enter selects one', async () => {
        const { root, stable, button } = await setup();
        await userEvent.click(button('2024, Select year'));
        await stable();
        await userEvent.click(button('2024 - 2043, Select years range'));
        await stable();
        const cells = [...root.querySelectorAll<HTMLElement>('td[role=gridcell]')];
        expect(cells).toHaveLength(12);
        expect(cells.slice(0, 3).map((td) => td.textContent!.trim())).toEqual([
            '2004 - 2023',
            '2024 - 2043',
            '2044 - 2063'
        ]);
        expect(root.querySelector('table[role=grid]')!.getAttribute('aria-multiselectable')).toBe('false');
        // the period of the shown year has the focus
        expect(document.activeElement).toBe(cells[1]);
        await userEvent.keyboard('{ArrowRight}{Enter}');
        await stable();
        const years = [...root.querySelectorAll<HTMLElement>('td[data-fd-calendar-year]')];
        expect(years[0]!.textContent!.trim()).toBe('2044');
        expect(years).toHaveLength(20);
        expect(document.activeElement).toBe(years[0]);
    });

    it('arrow keys and Enter/Space pick a month and a year', async () => {
        const { root, stable, button } = await setup();
        await userEvent.click(button('March, Select month'));
        await stable();
        const months = () => [...root.querySelectorAll<HTMLElement>('td[data-fd-calendar-month]')];
        expect(document.activeElement).toBe(months()[2]);
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(months()[5]);
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(months()[4]);
        await userEvent.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(months()[1]);
        await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
        await userEvent.keyboard('{Enter}');
        await stable();
        expect(headerOf(root)).toEqual(['May', '2024']);
        await userEvent.click(button('2024, Select year'));
        await stable();
        const years = () => [...root.querySelectorAll<HTMLElement>('td[data-fd-calendar-year]')];
        expect(document.activeElement).toBe(years()[0]);
        await userEvent.keyboard('{ArrowRight}{ArrowDown}');
        expect(document.activeElement!.textContent!.trim()).toBe('2030');
        await userEvent.keyboard(' ');
        await stable();
        expect(headerOf(root)).toEqual(['May', '2030']);
    });

    it('ArrowUp on the first row and ArrowLeft on the first cell go to the previous month', async () => {
        const { root, stable, currentMonthDay } = await setup();
        // March 2024 starts on a Friday: the 2nd is in the first row
        currentMonthDay('2').focus();
        await userEvent.keyboard('{ArrowUp}');
        await stable();
        expect(headerOf(root)).toEqual(['February', '2024']);
        expect(document.activeElement!.getAttribute('aria-label')).toContain('February 24, 2024');
        // the first cell of February's grid is January 28
        const first = root.querySelector<HTMLElement>('td[role=gridcell]')!;
        expect(first.getAttribute('aria-label')).toContain('January 28, 2024');
        first.focus();
        await userEvent.keyboard('{ArrowLeft}');
        await stable();
        expect(headerOf(root)).toEqual(['January', '2024']);
        expect(document.activeElement!.getAttribute('aria-label')).toContain('January 27, 2024');
    });

    it('mirrors the left and right arrow keys in RTL', async () => {
        const screen = await render(
            <div dir="rtl">
                <Calendar defaultSelectedDate={new FdDate(2024, 3, 9)} />
            </div>
        );
        const day = (label: string) =>
            screen.container.querySelector<HTMLElement>(
                `td[data-fd-calendar-date-day="${label}"][data-fd-calendar-month-status="current"]`
            )!;
        day('9').focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(day('10'));
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        expect(document.activeElement).toBe(day('8'));
    });

    it('Space selects the focused day', async () => {
        const { host, stable, currentMonthDay } = await setup();
        currentMonthDay('9').focus();
        await userEvent.keyboard('{ArrowRight} ');
        await stable();
        expect(host().date!.toDateString()).toBe('2024-03-10');
        expect(currentMonthDay('10').getAttribute('aria-selected')).toBe('true');
    });

    it('legend items are list items; the legend is labelled and can be a column; appointment entries show a circle', async () => {
        const { set, root } = await setup(
            (h) =>
                (h.rules = [
                    { specialDayNumber: 3, legendText: 'Meeting', rule: (d) => d.day === 13 },
                    { specialDayNumber: 7, legendText: 'Release', appointment: true, rule: (d) => d.day === 20 }
                ])
        );
        const legend = root.querySelector<HTMLElement>('[role=list]')!;
        expect(legend.getAttribute('role')).toBe('list');
        expect(legend.getAttribute('aria-label')).toBe('Calendar Legend');
        const items = [...legend.querySelectorAll<HTMLElement>('[role=listitem]')];
        expect(items.every((item) => item.getAttribute('role') === 'listitem' && item.tabIndex === 0)).toBe(true);
        // today, selected, work and non-work days first
        expect(items).toHaveLength(6);
        const marker = (item: HTMLElement) => getComputedStyle(item.firstElementChild!).borderTopLeftRadius;
        expect(marker(items.at(-2)!)).toBe('0px');
        expect(marker(items.at(-1)!)).not.toBe('0px');
        expect(getComputedStyle(legend).columnWidth).not.toBe('auto');
        await set({ legendCol: true });
        expect(getComputedStyle(legend).columnWidth).toBe('auto');
        // the legend follows the rules
        await set({ rules: [{ specialDayNumber: 4, legendText: 'Holiday', rule: (d) => d.day === 1 }] });
        const texts = [...root.querySelectorAll('[role=listitem]')].map((i) => i.textContent!.trim());
        expect(texts.at(-1)).toBe('Holiday');
        expect(texts).not.toContain('Release');
    });
});

describe('Calendar shift-click', () => {
    const days = (dates: FdDate[]) => dates.map((d) => d.toDateString()).sort();
    /** Several dates, March 2024 shown through a first selected date (no anchor yet). */
    const multiple = (h: HostState) => {
        h.multiple = true;
        h.dates = [new FdDate(2024, 3, 1)];
    };

    it('shift-click without an anchor selects only the clicked date', async () => {
        const { host, currentMonthDay, stable } = await setup(multiple);
        await userEvent.keyboard('{Shift>}');
        await userEvent.click(currentMonthDay('15'));
        await userEvent.keyboard('{/Shift}');
        await stable();
        // no span from the 1st, which was not clicked
        expect(days(host().dates)).toEqual(['2024-03-01', '2024-03-15']);
    });

    it('shift-click fills across months and in reverse', async () => {
        const { host, currentMonthDay, stable, button } = await setup(multiple);
        await userEvent.click(currentMonthDay('30'));
        await userEvent.click(button('Next month'));
        await stable();
        await userEvent.keyboard('{Shift>}');
        await userEvent.click(currentMonthDay('2'));
        await userEvent.keyboard('{/Shift}');
        await stable();
        expect(days(host().dates)).toEqual(['2024-03-01', '2024-03-30', '2024-03-31', '2024-04-01', '2024-04-02']);
        // a later anchor and an earlier click
        await userEvent.click(currentMonthDay('12'));
        await userEvent.keyboard('{Shift>}');
        await userEvent.click(currentMonthDay('9'));
        await userEvent.keyboard('{/Shift}');
        await stable();
        expect(days(host().dates)).toEqual([
            '2024-03-01',
            '2024-03-30',
            '2024-03-31',
            '2024-04-01',
            '2024-04-02',
            '2024-04-09',
            '2024-04-10',
            '2024-04-11',
            '2024-04-12'
        ]);
    });
});

describe('Calendar forms, all modes', () => {
    interface ModesProps {
        dates: FdDate[];
        range: DateRange<FdDate> | null;
        ranges: DateRange<FdDate>[];
        onDates?: (dates: FdDate[]) => void;
        valid: { dates?: boolean; range?: boolean; ranges?: boolean };
    }
    function Modes({ dates, range, ranges, onDates, valid }: ModesProps) {
        return (
            <>
                <Calendar
                    id="cm"
                    allowMultipleSelection
                    selectedMultipleDates={dates}
                    onSelectedMultipleDatesChange={onDates}
                    onIsValidDateChange={(v) => (valid.dates = v)}
                />
                <Calendar
                    id="cr"
                    calType="range"
                    selectedRangeDate={range}
                    onIsValidDateChange={(v) => (valid.range = v)}
                />
                <Calendar
                    id="cmr"
                    calType="range"
                    allowMultipleSelection
                    selectedMultipleDateRanges={ranges}
                    onIsValidDateChange={(v) => (valid.ranges = v)}
                />
            </>
        );
    }

    it('validates written multiple dates, ranges and multiple ranges', async () => {
        const valid: ModesProps['valid'] = {};
        const invalid = new FdDate(NaN);
        const ui = (props: Omit<ModesProps, 'valid'>) => <Modes {...props} valid={valid} />;
        const screen = await render(
            ui({
                dates: [new FdDate(2024, 3, 4)],
                range: new DateRange(new FdDate(2024, 3, 4), new FdDate(2024, 3, 8)),
                ranges: [new DateRange(new FdDate(2024, 3, 4), new FdDate(2024, 3, 8))]
            })
        );
        expect(valid).toEqual({ dates: true, range: true, ranges: true });
        await screen.rerender(
            ui({
                dates: [new FdDate(2024, 3, 4), invalid],
                range: new DateRange(new FdDate(2024, 3, 4), invalid),
                ranges: [new DateRange(invalid, new FdDate(2024, 3, 8))]
            })
        );
        await frame();
        expect(valid).toEqual({ dates: false, range: false, ranges: false });
        // a range without its end is not complete
        await screen.rerender(
            ui({
                dates: [new FdDate(2024, 5, 1), new FdDate(2024, 5, 2)],
                range: new DateRange(new FdDate(2024, 3, 4), null),
                ranges: [
                    new DateRange(new FdDate(2024, 5, 1), new FdDate(2024, 5, 3)),
                    new DateRange(new FdDate(2024, 5, 10), new FdDate(2024, 5, 12))
                ]
            })
        );
        await frame();
        expect(valid).toEqual({ dates: true, range: false, ranges: true });
    });

    it('writing a value resets the shift anchor', async () => {
        const store = { dates: [new FdDate(2024, 3, 4)] };
        const ui = () => (
            <Modes
                dates={store.dates}
                range={null}
                ranges={[]}
                valid={{}}
                onDates={(dates) => {
                    store.dates = dates;
                    void screen.rerender(ui());
                }}
            />
        );
        const screen = await render(ui());
        const day = (label: string) =>
            screen.container.querySelector<HTMLElement>(
                `#cm td[data-fd-calendar-date-day="${label}"][data-fd-calendar-month-status="current"]`
            )!;
        await userEvent.click(day('5'));
        await frame();
        expect(store.dates.map((d) => d.day)).toEqual([4, 5]);
        store.dates = [];
        await screen.rerender(ui());
        await frame();
        await userEvent.keyboard('{Shift>}');
        await userEvent.click(day('9'));
        await userEvent.keyboard('{/Shift}');
        await frame();
        // no fill from the 5th: the anchor was dropped
        expect(store.dates.map((d) => d.day)).toEqual([9]);
    });
});

describe('Calendar (fundamental-react tests)', () => {
    it('passes className, native props and the ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(<Calendar ref={ref} className="extra" data-sample="Sample" aria-label="Pick" />);
        const root = screen.container.querySelector<HTMLElement>('[role=group]')!;
        expect(ref.current).toBe(root);
        expect(root.dataset['sample']).toBe('Sample');
        expect(root.classList.contains('extra')).toBe(true);
        expect(root.getAttribute('aria-label')).toBe('Pick');
        expect(root.id).toMatch(/^fd-calendar/);
    });

    it('opens on the month of today without a selection, and on a date from code (openToDate)', async () => {
        const actions = createRef<CalendarActions>();
        const screen = await render(<Calendar defaultSelectedDate={null} actionsRef={actions} />);
        const today = new Date();
        const names = ['January', 'February', 'March', 'April', 'May', 'June'];
        const monthNames = [...names, 'July', 'August', 'September', 'October', 'November', 'December'];
        expect(headerOf(screen.container)).toEqual([monthNames[today.getMonth()], String(today.getFullYear())]);
        actions.current!.setCurrentlyDisplayed(new FdDate(2000, 1, 1));
        await frame();
        expect(headerOf(screen.container)).toEqual(['January', '2000']);
        actions.current!.handleNextArrowClick();
        await frame();
        expect(headerOf(screen.container)).toEqual(['February', '2000']);
        actions.current!.handlePreviousArrowClick();
        actions.current!.initialFocus();
        await frame();
        expect(document.activeElement!.getAttribute('aria-label')).toContain('January 1, 2000');
        expect(actions.current!.isModelValid()).toBe(false);
    });

    it('pages back and forth by month and by 20 years, and keeps the month from the 31st', async () => {
        const screen = await render(<Calendar defaultSelectedDate={new FdDate(2019, 3, 28)} />);
        const root = screen.container;
        const click = async (label: string) => {
            await userEvent.click(root.querySelector<HTMLElement>(`button[aria-label^="${label}"]`)!);
            await frame();
        };
        await click('Previous month');
        expect(headerOf(root)).toEqual(['February', '2019']);
        await click('Next month');
        await click('Next month');
        expect(headerOf(root)).toEqual(['April', '2019']);
        await click('2019, Select year');
        await click('Previous year');
        expect(root.querySelector('td[data-fd-calendar-year]')!.textContent!.trim()).toBe('1999');
        await click('Next year');
        await click('Next year');
        expect(root.querySelector('td[data-fd-calendar-year]')!.textContent!.trim()).toBe('2039');
        await screen.rerender(<Calendar defaultSelectedDate={new FdDate(2019, 5, 31)} key="31st" />);
        await click('Next month');
        expect(headerOf(root)).toEqual(['June', '2019']);
    });

    it('starts the weeks on every day of the week', async () => {
        const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const screen = await render(<Calendar startingDayOfWeek={1} />);
        for (const start of [1, 2, 3, 4, 5, 6, 7] as DaysOfWeek[]) {
            await screen.rerender(<Calendar startingDayOfWeek={start} />);
            expect(screen.container.querySelector('thead th')!.textContent!.trim()).toBe(names[start - 1]);
        }
    });

    it('does not select the days a disable function rules out (weekends, before or after a date, ranges)', async () => {
        const onValueChange = vi.fn();
        const disabled = (d: FdDate) =>
            [1, 7].includes(d.getDayOfWeek()) || (d.month === 10 && d.day >= 15 && d.day <= 18);
        const screen = await render(
            <Calendar
                defaultSelectedDate={new FdDate(2020, 10, 1)}
                disableFunction={disabled}
                onValueChange={onValueChange}
            />
        );
        const day = (label: string) =>
            screen.container.querySelector<HTMLElement>(
                `td[data-fd-calendar-date-day="${label}"][data-fd-calendar-month-status="current"]`
            )!;
        // 10 October 2020 is a Saturday, 16 October inside the disabled range
        for (const label of ['10', '16']) {
            expect(day(label).getAttribute('aria-disabled')).toBe('true');
            day(label).click();
        }
        expect(onValueChange).not.toHaveBeenCalled();
        await userEvent.click(day('14'));
        expect((onValueChange.mock.lastCall![0] as FdDate).toDateString()).toBe('2020-10-14');
    });

    it('starts a new range after a complete one', async () => {
        const onValueChange = vi.fn();
        const screen = await render(
            <Calendar
                calType="range"
                defaultSelectedRangeDate={new DateRange(new FdDate(2024, 3, 1), null)}
                onValueChange={onValueChange}
            />
        );
        const day = (label: string) =>
            screen.container.querySelector<HTMLElement>(
                `td[data-fd-calendar-date-day="${label}"][data-fd-calendar-month-status="current"]`
            )!;
        const last = () => onValueChange.mock.lastCall![0] as DateRange<FdDate>;
        await userEvent.click(day('5'));
        expect([last().start!.day, last().end!.day]).toEqual([1, 5]);
        await userEvent.click(day('15'));
        expect([last().start!.day, last().end]).toEqual([15, null]);
        await userEvent.click(day('5'));
        expect([last().start!.day, last().end!.day]).toEqual([5, 15]);
    });

    it('names days and months in the locale of the adapter', async () => {
        const screen = await render(
            <DatetimeAdapterProvider locale="de-DE">
                <Calendar defaultSelectedDate={new FdDate(2024, 3, 9)} />
            </DatetimeAdapterProvider>
        );
        await frame();
        const root = screen.container;
        expect(headerOf(root)).toEqual(['März', '2024']);
        // Monday first in Germany
        expect([...root.querySelectorAll('thead th')].map((th) => th.textContent!.trim())[0]).toBe('Mo');
    });
});

describe('Calendar parts', () => {
    it('views can be controlled', async () => {
        const onActiveViewChange = vi.fn();
        const ui = (view: FdCalendarView) => (
            <Calendar
                activeView={view}
                onActiveViewChange={onActiveViewChange}
                defaultSelectedDate={new FdDate(2024, 3, 9)}
            />
        );
        const screen = await render(ui('month'));
        expect(screen.container.querySelectorAll('td[data-fd-calendar-month]')).toHaveLength(12);
        await userEvent.click(screen.container.querySelector<HTMLElement>('td[data-fd-calendar-month="5"]')!);
        expect(onActiveViewChange).toHaveBeenLastCalledWith('day');
        // controlled: the month view stays until the prop changes
        expect(screen.container.querySelectorAll('td[data-fd-calendar-month]')).toHaveLength(12);
        await screen.rerender(ui('day'));
        expect(headerOf(screen.container)).toEqual(['May', '2024']);
    });

    it('a calendar that starts in the year view starts at the shown year', async () => {
        const screen = await render(<Calendar defaultActiveView="year" defaultSelectedDate={new FdDate(2018, 3, 1)} />);
        const years = [...screen.container.querySelectorAll<HTMLElement>('td[data-fd-calendar-year]')];
        expect(years[0]!.textContent!.trim()).toBe('2018');
        expect(years.find((td) => td.getAttribute('aria-selected') === 'true')!.textContent!.trim()).toBe('2018');
    });

    it('a legend of its own and a close button that names itself', async () => {
        const onClick = vi.fn();
        const screen = await render(
            <>
                <CalendarLegend displayWorkDayLegendItem={false} labels={{ legendLabel: 'Legend' }} col>
                    <CalendarLegendItem color="var(--sapLegendColor2)">Own entry</CalendarLegendItem>
                </CalendarLegend>
                <CalendarCloseButton onClick={onClick} />
                <CalendarCloseButton aria-label="Done" render={<button type="button" />} />
            </>
        );
        const legend = screen.container.querySelector('[role=list]')!;
        expect(legend.getAttribute('aria-label')).toBe('Legend');
        expect([...legend.querySelectorAll('[role=listitem]')].map((i) => i.textContent)).toEqual([
            'Own entry',
            'Today',
            'Selected date',
            'Non-Work day'
        ]);
        const [close, done] = [...screen.container.querySelectorAll('button')];
        expect(close!.getAttribute('aria-label')).toBe('Close calendar');
        expect(close!.title).toBe('Close calendar');
        await userEvent.click(close!);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(done!.getAttribute('aria-label')).toBe('Done');
        expect(done!.title).toBe('Done');
    });

    it('fills the dialog in mobile layouts', async () => {
        const screen = await render(
            <div style={{ width: 600, height: 400 }}>
                <Calendar mobileLandscape />
            </div>
        );
        const root = screen.container.querySelector<HTMLElement>('[role=group]')!;
        expect(root.getBoundingClientRect().width).toBe(600);
        await screen.rerender(
            <div style={{ width: 600, height: 400 }}>
                <Calendar />
            </div>
        );
        expect(root.getBoundingClientRect().width).toBe(288);
    });
});
