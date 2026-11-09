import { createRef, useState, useSyncExternalStore } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { FdDate } from '@/lib/datetime';
import { Time, TimeColumn, type FdTimeActiveView, type TimeActions } from './time';

const frame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));

interface HostState {
    time: FdDate;
    meridian: boolean;
    step: number;
    seconds: boolean;
    twoDigits: boolean;
    spinners: boolean;
    tablet: boolean;
}

/** The state of the host, as the Angular spec's signals: tests read and set it, the host renders it. */
function createStore(configure?: (state: HostState) => void) {
    let state: HostState = {
        time: new FdDate(2024, 3, 9, 14, 30, 15),
        meridian: false,
        step: 1,
        seconds: true,
        twoDigits: false,
        spinners: true,
        tablet: false
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
        <Time
            id="t"
            time={s.time}
            onTimeChange={(time) => store.set({ time })}
            meridian={s.meridian}
            minuteStep={s.step}
            displaySeconds={s.seconds}
            keepTwoDigits={s.twoDigits}
            spinnerButtons={s.spinners}
            tablet={s.tablet}
        />
    );
}

async function setup(configure?: (state: HostState) => void) {
    const store = createStore(configure);
    const screen = await render(<Host store={store} />);
    await frame();
    const root = screen.container;
    const column = (name: string) => root.querySelector<HTMLElement>(`#t-${name}`)!;
    const shown = (name: string) =>
        [...column(name).querySelectorAll('[data-displayed-value]')].map((item) => item.textContent!.trim());
    const set = async (patch: Partial<HostState>) => {
        store.set(patch);
        await frame();
    };
    return { screen, host: store.get, set, root, column, shown, stable: frame };
}

describe('Time', () => {
    it('shows spinbutton columns; the active one shows a window around the value', async () => {
        const { root, column, shown } = await setup();
        const time = root.querySelector<HTMLElement>('#t')!;
        expect(time.getAttribute('role')).toBe('group');
        expect(time.getAttribute('aria-label')).toBe('Time picker');
        const hours = column('hours');
        expect(hours.getAttribute('role')).toBe('spinbutton');
        expect(hours.getAttribute('aria-label')).toBe('Hours');
        expect(hours.getAttribute('aria-valuetext')).toBe('14');
        expect(hours.getAttribute('aria-valuenow')).toBe('14');
        expect(hours.getAttribute('aria-valuemin')).toBe('0');
        expect(hours.getAttribute('aria-valuemax')).toBe('23');
        expect(hours.getAttribute('aria-description')).toContain('press top arrow or bottom arrow');
        expect(shown('hours')).toEqual(['11', '12', '13', '14', '15', '16', '17']);
        // inactive columns show only their value
        expect(shown('minutes')).toEqual([]);
        expect(column('minutes').textContent!.trim()).toBe('30');
        expect(root.querySelectorAll('button[aria-label="Decrease hours"]')).toHaveLength(1);
        expect(root.querySelector('#t-hours-label')!.textContent).toBe('Hrs');
    });

    it('changes the active column with Up and Down, wrapping around', async () => {
        const { host, column, shown, stable } = await setup((h) => (h.time = new FdDate(2024, 3, 9, 23, 0, 0)));
        column('hours').focus();
        await userEvent.keyboard('{ArrowDown}');
        await stable();
        expect(host().time.hour).toBe(0);
        expect(shown('hours')[3]).toBe('0');
        await userEvent.keyboard('{ArrowUp}{ArrowUp}');
        await stable();
        expect(host().time.hour).toBe(22);
        // the date stays
        expect(host().time.toDateString()).toBe('2024-03-09');
    });

    it('moves between the columns with Left and Right', async () => {
        const { host, column, shown, stable } = await setup();
        column('hours').focus();
        await userEvent.keyboard('{ArrowRight}');
        await stable();
        expect(document.activeElement).toBe(column('minutes'));
        expect(shown('minutes')[3]).toBe('30');
        await userEvent.keyboard('{ArrowDown}');
        await stable();
        expect(host().time.minute).toBe(31);
        await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
        await stable();
        expect(document.activeElement).toBe(column('seconds'));
    });

    it('mirrors Left and Right in RTL', async () => {
        await render(
            <div dir="rtl">
                <Time id="t" defaultTime={new FdDate(2024, 3, 9, 14, 30, 15)} />
            </div>
        );
        const column = (name: string) => document.querySelector<HTMLElement>(`#t-${name}`)!;
        column('hours').focus();
        await userEvent.keyboard('{ArrowLeft}');
        await frame();
        expect(document.activeElement).toBe(column('minutes'));
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        await frame();
        expect(document.activeElement).toBe(column('seconds'));
    });

    it('picks a clicked value and steps with the spinner buttons', async () => {
        const { host, root, column, stable } = await setup();
        await userEvent.click(column('hours').querySelector('[data-displayed-value="16"]')!);
        await stable();
        expect(host().time.hour).toBe(16);
        await userEvent.click(root.querySelector('button[aria-label="Increase hours"]')!);
        await stable();
        expect(host().time.hour).toBe(17);
        expect(document.activeElement).toBe(column('hours'));
        // a click on an inactive column activates it
        await userEvent.click(column('seconds'));
        await stable();
        expect(root.querySelector('button[aria-label="Decrease seconds"]')).not.toBeNull();
        expect(root.querySelector('button[aria-label="Decrease hours"]')).toBeNull();
    });

    it('takes typed digits', async () => {
        const { host, column, stable } = await setup();
        column('hours').focus();
        await userEvent.keyboard('9');
        await new Promise((resolve) => setTimeout(resolve, 600));
        await stable();
        expect(host().time.hour).toBe(9);
        await userEvent.keyboard('21');
        await stable();
        expect(host().time.hour).toBe(21);
    });

    it('splits the day into periods with a 12-hour clock', async () => {
        const { host, column, shown, stable } = await setup((h) => {
            h.meridian = true;
            h.twoDigits = true;
        });
        expect(column('hours').getAttribute('aria-valuetext')).toBe('02');
        expect(column('period').textContent!.trim()).toBe('PM');
        column('period').focus();
        await stable();
        // the short period column does not wrap
        expect(shown('period')).toEqual(['AM', 'PM']);
        await userEvent.keyboard('a');
        await stable();
        expect(host().time.hour).toBe(2);
        await userEvent.keyboard('{ArrowDown}');
        await stable();
        expect(host().time.hour).toBe(14);
        // at the end of a column that does not loop the value stays
        await userEvent.keyboard('{ArrowDown}');
        await stable();
        expect(host().time.hour).toBe(14);
    });

    it('steps minutes', async () => {
        const { host, column, shown, stable } = await setup((h) => {
            h.step = 15;
            h.time = new FdDate(2024, 3, 9, 10, 20, 0);
        });
        column('minutes').focus();
        await stable();
        expect(column('minutes').getAttribute('aria-valuetext')).toBe('15');
        expect(shown('minutes')).toEqual(['0', '15', '30', '45']);
        await userEvent.keyboard('{ArrowDown}');
        await stable();
        expect(host().time.minute).toBe(30);
    });

    it('switches the period when the hours step across 11 and 12', async () => {
        const { host, column, stable } = await setup((h) => {
            h.meridian = true;
            h.time = new FdDate(2024, 3, 9, 11, 0, 0);
        });
        expect(column('period').textContent!.trim()).toBe('AM');
        column('hours').focus();
        await userEvent.keyboard('{ArrowDown}');
        await stable();
        expect(host().time.hour).toBe(12);
        expect(column('hours').getAttribute('aria-valuetext')).toBe('12');
        expect(column('period').getAttribute('aria-valuetext')).toBe('PM');
        await userEvent.keyboard('{ArrowUp}');
        await stable();
        expect(host().time.hour).toBe(11);
        expect(column('period').getAttribute('aria-valuetext')).toBe('AM');
    });

    it('moves within a column with Page Up, Page Down, Home and End', async () => {
        const { host, column, stable } = await setup((h) => (h.time = new FdDate(2024, 3, 9, 10, 0, 0)));
        column('hours').focus();
        await userEvent.keyboard('{PageDown}');
        await stable();
        // a page is the seven values shown
        expect(host().time.hour).toBe(17);
        await userEvent.keyboard('{PageUp}{PageUp}');
        await stable();
        expect(host().time.hour).toBe(3);
        await userEvent.keyboard('{End}');
        await stable();
        expect(host().time.hour).toBe(23);
        await userEvent.keyboard('{Home}');
        await stable();
        expect(host().time.hour).toBe(0);
    });

    it('steps the active column with the mouse wheel', async () => {
        const { host, column, stable } = await setup();
        const wheel = (target: HTMLElement, deltaY: number) => {
            const event = new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true });
            target.dispatchEvent(event);
            return event;
        };
        expect(wheel(column('hours'), 100).defaultPrevented).toBe(true);
        await stable();
        expect(host().time.hour).toBe(15);
        wheel(column('hours'), -100);
        wheel(column('hours'), -100);
        await stable();
        expect(host().time.hour).toBe(13);
        // an inactive column leaves the wheel to the page
        expect(wheel(column('minutes'), 100).defaultPrevented).toBe(false);
        await stable();
        expect(host().time.minute).toBe(30);
    });

    it('changes the value when a column is dragged', async () => {
        const { host, column, stable } = await setup();
        const hours = column('hours');
        const itemHeight = hours.querySelector<HTMLElement>('[data-displayed-value]')!.getBoundingClientRect().height;
        const { left, top } = hours.getBoundingClientRect();
        const pointer = (type: string, target: EventTarget, clientY: number) =>
            target.dispatchEvent(
                new PointerEvent(type, { button: 0, clientX: left + 10, clientY, bubbles: true, pointerId: 1 })
            );
        const start = top + 3 * itemHeight + 10;
        pointer('pointerdown', hours, start);
        // dragging up by two values shows later hours
        pointer('pointermove', document, start - 2 * itemHeight - 1);
        pointer('pointerup', document, start - 2 * itemHeight - 1);
        await stable();
        expect(host().time.hour).toBe(16);
        pointer('pointerdown', hours, start);
        pointer('pointermove', document, start + itemHeight + 1);
        pointer('pointerup', document, start + itemHeight + 1);
        await stable();
        expect(host().time.hour).toBe(15);
    });

    it('hides the spinner buttons with spinnerButtons false', async () => {
        const { root, set } = await setup();
        expect(root.querySelectorAll('#t button')).toHaveLength(2);
        await set({ spinners: false });
        expect(root.querySelectorAll('#t button')).toHaveLength(0);
    });

    it('uses smaller paddings and larger compact values for tablets', async () => {
        const { root, column, set, stable } = await setup();
        const time = root.querySelector<HTMLElement>('#t')!;
        const itemHeight = () =>
            column('hours').querySelector<HTMLElement>('[data-displayed-value]')!.getBoundingClientRect().height;
        expect(getComputedStyle(time).paddingTop).toBe('16px');
        expect(itemHeight()).toBe(46);
        time.setAttribute('data-density', 'compact');
        await stable();
        expect(itemHeight()).toBe(32);
        await set({ tablet: true });
        expect(getComputedStyle(time).paddingTop).toBe('8px');
        // tablets keep touch-sized values in compact density
        expect(itemHeight()).toBe(46);
    });

    it('hides columns and shows the given labels', async () => {
        await render(
            <Time
                id="t"
                defaultTime={new FdDate(2024, 3, 9, 14, 30, 15)}
                displayHours={false}
                displaySeconds={false}
                labels={{
                    componentAriaName: 'Zeit',
                    minutes: { ...TIME_MINUTES, label: 'Min.', fullLabel: 'Minuten' }
                }}
            />
        );
        const root = document.querySelector<HTMLElement>('#t')!;
        expect(root.getAttribute('aria-label')).toBe('Zeit');
        expect(root.querySelectorAll('[role=spinbutton]')).toHaveLength(1);
        const minutes = root.querySelector<HTMLElement>('#t-minutes')!;
        expect(minutes.getAttribute('aria-label')).toBe('Minuten');
        expect(root.querySelector('#t-minutes-label')!.textContent).toBe('Min.');
        // the first column shown is not the active one by default: `hour` is hidden
        minutes.focus();
        await frame();
        expect(minutes.querySelectorAll('[data-displayed-value]')).toHaveLength(7);
    });

    it('shows today at midnight without a time, and for an invalid one', async () => {
        const changes: FdDate[] = [];
        const screen = await render(<Time<FdDate> id="t" time={null} onTimeChange={(time) => changes.push(time)} />);
        const hours = () => document.querySelector<HTMLElement>('#t-hours')!;
        expect(hours().getAttribute('aria-valuetext')).toBe('0');
        await screen.rerender(<Time id="t" time={new FdDate(2024, 13, 40)} onTimeChange={(t) => changes.push(t)} />);
        expect(hours().getAttribute('aria-valuetext')).toBe('0');
        hours().focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(changes[0]!.hour).toBe(1);
        expect(changes[0]!.toDateString()).toBe(FdDate.getToday().toDateString());
    });

    it('keeps a controlled time without a change handler and an uncontrolled one by itself', async () => {
        const screen = await render(<Time id="t" time={new FdDate(2024, 3, 9, 14, 0, 0)} />);
        const hours = () => document.querySelector<HTMLElement>('#t-hours')!;
        hours().focus();
        await userEvent.keyboard('{ArrowDown}');
        await frame();
        expect(hours().getAttribute('aria-valuetext')).toBe('14');
        await screen.rerender(<Time id="t" key="own" defaultTime={new FdDate(2024, 3, 9, 14, 0, 0)} />);
        hours().focus();
        await userEvent.keyboard('{ArrowDown}');
        await frame();
        expect(hours().getAttribute('aria-valuetext')).toBe('15');
    });

    it('can control the active column and focus it from code', async () => {
        const actions = createRef<TimeActions>();
        const views: FdTimeActiveView[] = [];
        function ControlledHost() {
            const [view, setView] = useState<FdTimeActiveView>('second');
            return (
                <Time
                    id="t"
                    defaultTime={new FdDate(2024, 3, 9, 14, 30, 15)}
                    activeView={view}
                    onActiveViewChange={(next) => {
                        views.push(next);
                        setView(next);
                    }}
                    actionsRef={actions}
                />
            );
        }
        await render(<ControlledHost />);
        const column = (name: string) => document.querySelector<HTMLElement>(`#t-${name}`)!;
        expect(column('seconds').querySelectorAll('[data-displayed-value]')).toHaveLength(7);
        actions.current!.focusActiveColumn();
        expect(document.activeElement).toBe(column('seconds'));
        await userEvent.keyboard('{ArrowRight}');
        await frame();
        // without the period, Right wraps around to the hours
        expect(views).toEqual(['hour']);
        expect(document.activeElement).toBe(column('hours'));
    });

    it('passes className, native props and the ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        const onKeyDown = vi.fn();
        await render(
            <Time ref={ref} className="custom" data-sample="Sample" onKeyDown={onKeyDown} aria-label="Start time" />
        );
        const root = ref.current!;
        expect(root.getAttribute('role')).toBe('group');
        expect(root.classList.contains('custom')).toBe(true);
        expect(root.classList.contains('p-4')).toBe(true);
        expect(root.getAttribute('data-sample')).toBe('Sample');
        expect(root.getAttribute('aria-label')).toBe('Start time');
        expect(root.id).toMatch(/^fd-time/);
        root.querySelector<HTMLElement>('[role=spinbutton]')!.focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(onKeyDown).toHaveBeenCalled();
    });

    it('steps from midnight with the spinner buttons of the active column (fundamental-react)', async () => {
        const changes: FdDate[] = [];
        function OwnHost() {
            const [time, setTime] = useState(new FdDate(2024, 3, 9, 0, 0, 0));
            return (
                <Time
                    id="t"
                    meridian
                    keepTwoDigits
                    time={time}
                    onTimeChange={(next) => {
                        changes.push(next);
                        setTime(next);
                    }}
                />
            );
        }
        await render(<OwnHost />);
        const button = (label: string) => document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
        const column = (name: string) => document.querySelector<HTMLElement>(`#t-${name}`)!;
        // the 12-hour clock shows midnight as 12
        expect(column('hours').getAttribute('aria-valuetext')).toBe('12');
        await userEvent.click(button('Increase hours'));
        expect(changes.at(-1)!.hour).toBe(1);
        await userEvent.click(button('Decrease hours'));
        await userEvent.click(button('Decrease hours'));
        // 11 PM: the hours wrap around, the minutes and seconds stay
        expect(changes.at(-1)!.hour).toBe(23);
        expect(column('period').getAttribute('aria-valuetext')).toBe('PM');
        await userEvent.click(column('minutes'));
        await userEvent.click(button('Decrease minutes'));
        expect(changes.at(-1)!.minute).toBe(59);
        expect(changes.at(-1)!.hour).toBe(23);
        await userEvent.click(button('Increase minutes'));
        await userEvent.click(button('Increase minutes'));
        expect(changes.at(-1)!.minute).toBe(1);
        // a click on a value of the period
        await userEvent.click(column('period'));
        await userEvent.click(column('period').querySelector('[data-displayed-value="AM"]')!);
        expect(changes.at(-1)!.hour).toBe(11);
    });
});

describe('Time forms', () => {
    it('writes, reads and disables', async () => {
        const changes: FdDate[] = [];
        const ui = (time: FdDate, disabled = false) => (
            <Time id="t" time={time} disabled={disabled} onTimeChange={(next) => changes.push(next)} />
        );
        const screen = await render(ui(new FdDate(2024, 1, 1, 8, 15, 0)));
        const hours = document.querySelector<HTMLElement>('[role=spinbutton]')!;
        expect(hours.getAttribute('aria-valuetext')).toBe('8');
        hours.focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(changes.at(-1)!.hour).toBe(9);
        await screen.rerender(ui(changes.at(-1)!, true));
        expect(hours.getAttribute('aria-disabled')).toBe('true');
        expect(hours.closest('.pointer-events-none')).not.toBeNull();
        await userEvent.keyboard('{ArrowDown}');
        expect(changes).toHaveLength(1);
        // a value written from outside shows
        await screen.rerender(ui(new FdDate(2024, 1, 1, 20, 0, 0), true));
        expect(hours.getAttribute('aria-valuetext')).toBe('20');
    });

    it('reports touched when the focus leaves the time', async () => {
        const onTouched = vi.fn();
        const onBlur = vi.fn();
        await render(
            <>
                <Time onTouched={onTouched} onBlur={onBlur} />
                <button id="after">After</button>
            </>
        );
        document.querySelector<HTMLElement>('[role=spinbutton]')!.focus();
        // moving between the columns stays inside
        await userEvent.keyboard('{ArrowRight}');
        await frame();
        expect(onTouched).not.toHaveBeenCalled();
        expect(onBlur).toHaveBeenCalledTimes(1);
        document.querySelector<HTMLElement>('#after')!.focus();
        await frame();
        expect(onTouched).toHaveBeenCalledTimes(1);
    });
});

describe('TimeColumn', () => {
    it('is a spinbutton of its rows that steps from code', async () => {
        const rows = ['a', 'b', 'c'].map((value) => ({ value, label: value.toUpperCase() }));
        const picked: string[] = [];
        const actions = createRef<{ focus(): void; step(steps: number): void }>();
        function ColumnHost() {
            const [value, setValue] = useState(rows[0]);
            return (
                <div className="[--time-item-h:2.875rem]">
                    <TimeColumn
                        id="col"
                        data-testid="column"
                        rows={rows}
                        activeValue={value}
                        active
                        loop={false}
                        elementsAtOnce={3}
                        actionsRef={actions}
                        onActiveValueChange={(item) => {
                            picked.push(item.value);
                            setValue(item);
                        }}
                    />
                </div>
            );
        }
        await render(<ColumnHost />);
        const column = document.querySelector<HTMLElement>('#col')!;
        expect(column.getAttribute('aria-valuetext')).toBe('A');
        expect(document.querySelector('[data-testid=column]')!.contains(column)).toBe(true);
        // the window has an empty place before the first value of a column that does not loop
        expect([...column.querySelectorAll('[aria-hidden] ')].map((item) => item.textContent)).toEqual(['', 'A', 'B']);
        actions.current!.step(5);
        await frame();
        expect(picked).toEqual(['c']);
        expect(document.activeElement).toBe(column);
        await userEvent.keyboard('b');
        expect(picked).toEqual(['c', 'b']);
    });
});

const TIME_MINUTES = {
    label: 'Min',
    fullLabel: 'Minutes',
    decreaseLabel: 'Decrease minutes',
    increaseLabel: 'Increase minutes',
    navigationInstruction: 'Up and Down'
};
