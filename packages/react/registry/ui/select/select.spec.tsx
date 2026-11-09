import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { ListSecondary, ListTitle } from '@/ui/list/list';
import { Select, SelectOption, type SelectMobileConfig, type SelectProps } from './select';

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date'];

interface HostProps extends Omit<Partial<SelectProps<string>>, 'value' | 'defaultValue'> {
    options?: string[];
    initial?: string | null;
}

/** A select with a value kept in state (as Angular's form control host), printed in `#value`. */
function Host({ options = FRUITS, initial = null, onValueChange, ...props }: HostProps) {
    const [value, setValue] = useState<string | null>(initial);
    return (
        <>
            <Select
                aria-label="Fruit"
                placeholder="Pick one"
                {...props}
                value={value}
                onValueChange={(next) => {
                    setValue(next);
                    onValueChange?.(next);
                }}
            >
                {options.map((option) => (
                    <SelectOption key={option} value={option} disabled={option === 'Cherry'}>
                        {option}
                    </SelectOption>
                ))}
            </Select>
            <output id="value">{value ?? 'null'}</output>
            <button type="button" id="outside">
                Outside
            </button>
        </>
    );
}

interface Car {
    id: number;
    name: string;
}
const CARS: Car[] = [
    { id: 1, name: 'Sedan' },
    { id: 2, name: 'Coupe' },
    { id: 3, name: 'Convertible' }
];

function CompareHost({ initial, compareWith }: { initial: Car | null; compareWith?: (a: Car, b: Car) => boolean }) {
    const [value, setValue] = useState<Car | null>(initial);
    return (
        <>
            <Select<Car>
                aria-label="Car"
                placeholder="Pick one"
                compareWith={compareWith}
                value={value}
                onValueChange={setValue}
            >
                {CARS.map((car) => (
                    <SelectOption key={car.id} value={car}>
                        {car.name}
                    </SelectOption>
                ))}
            </Select>
            <output id="value">{value ? `${value.id}` : 'null'}</output>
            <button type="button" id="set-copy" onClick={() => setValue({ ...CARS[1]! })}>
                Copy
            </button>
            <button type="button" id="set-same" onClick={() => setValue(CARS[1]!)}>
                Same
            </button>
        </>
    );
}

const wait = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
const options = () =>
    [...document.querySelectorAll<HTMLElement>('[role=option]')].filter((el) => !el.closest('[hidden]'));
const listbox = () =>
    [...document.querySelectorAll<HTMLElement>('[role=listbox]')].find((el) => !el.closest('[hidden]')) ?? null;
const dialog = () => document.querySelector<HTMLElement>('[role=dialog]');
const button = (label: string) =>
    [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.trim().startsWith(label));
const valueText = () => document.getElementById('value')!.textContent;
const focusedText = () => document.activeElement?.textContent?.trim();

async function setup(props: HostProps = {}) {
    const screen = await render(<Host {...props} />);
    const combobox = screen.container.querySelector<HTMLElement>('[role=combobox]')!;
    return { screen, combobox };
}

/** Opens the select with a click and waits for the list. */
async function openList(combobox: HTMLElement) {
    await userEvent.click(combobox);
    await expect.poll(() => listbox()).not.toBeNull();
    await wait();
}

describe('Select', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('shows the placeholder and the selected option as a combobox', async () => {
        const screen = await render(
            <Select aria-label="Fruit" placeholder="Pick one" value={null}>
                <SelectOption value="Apple">Apple</SelectOption>
                <SelectOption value="Banana">Banana</SelectOption>
            </Select>
        );
        const combobox = screen.container.querySelector<HTMLElement>('[role=combobox]')!;
        expect(combobox.getAttribute('aria-haspopup')).toBe('listbox');
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
        expect(combobox.getAttribute('aria-label')).toBe('Fruit');
        expect(combobox.getAttribute('tabindex')).toBe('0');
        expect(combobox.textContent?.trim()).toBe('Pick one');
        expect(combobox.hasAttribute('data-placeholder')).toBe(true);
        expect(combobox.getAttribute('title')).toBe('Pick one');
        await screen.rerender(
            <Select aria-label="Fruit" placeholder="Pick one" value="Banana">
                <SelectOption value="Apple">Apple</SelectOption>
                <SelectOption value="Banana">Banana</SelectOption>
            </Select>
        );
        expect(combobox.textContent?.trim()).toBe('Banana');
        expect(combobox.hasAttribute('data-placeholder')).toBe(false);
        expect(combobox.getAttribute('title')).toBe('Banana');
    });

    it('opens on click, highlights with the arrow keys and selects with Enter', async () => {
        const { combobox } = await setup();
        await openList(combobox);
        expect(combobox.getAttribute('aria-expanded')).toBe('true');
        expect(combobox.getAttribute('aria-controls')).toBe(listbox()!.id);
        expect(listbox()!.getAttribute('aria-label')).toBe('Fruit');
        // nothing selected: the first option is highlighted (Base UI moves the focus to it)
        await expect.poll(() => focusedText()).toBe('Apple');
        expect(options()[0]!.hasAttribute('data-active')).toBe(true);

        await userEvent.keyboard('{ArrowDown}{ArrowDown}');
        // Cherry is disabled and skipped
        expect(focusedText()).toBe('Date');
        expect(options()[3]!.hasAttribute('data-active')).toBe(true);
        await userEvent.keyboard('{Enter}');
        expect(valueText()).toBe('Date');
        await expect.poll(() => combobox.getAttribute('aria-expanded')).toBe('false');
        await expect.poll(() => document.activeElement).toBe(combobox);
        expect(combobox.textContent?.trim()).toBe('Date');
    });

    it('selects an option on click and marks it selected', async () => {
        const { combobox } = await setup();
        await openList(combobox);
        await userEvent.click(options()[1]!);
        expect(valueText()).toBe('Banana');
        await expect.poll(() => combobox.getAttribute('aria-expanded')).toBe('false');
        await openList(combobox);
        expect(options()[1]!.getAttribute('aria-selected')).toBe('true');
        expect(options()[0]!.getAttribute('aria-selected')).toBe('false');
        await expect.poll(() => focusedText()).toBe('Banana');
    });

    it('does not select a disabled option on click', async () => {
        const { combobox } = await setup({ initial: 'Apple' });
        await openList(combobox);
        const cherry = options()[2]!;
        expect(cherry.getAttribute('aria-disabled')).toBe('true');
        cherry.click();
        await wait();
        expect(valueText()).toBe('Apple');
        expect(cherry.getAttribute('aria-selected')).toBe('false');
        expect(combobox.getAttribute('aria-expanded')).toBe('true');
    });

    it('shrinks the control and the options in compact density', async () => {
        const { combobox } = await setup();
        await openList(combobox);
        const cozy = { control: combobox.offsetHeight, option: options()[0]!.offsetHeight };
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => listbox()).toBeNull();

        document.documentElement.setAttribute('data-density', 'compact');
        await openList(combobox);
        expect(combobox.offsetHeight).toBeLessThan(cozy.control);
        expect(options()[0]!.offsetHeight).toBeLessThan(cozy.option);
    });

    it('closes the list when the trigger is clicked again', async () => {
        const { combobox } = await setup();
        await openList(combobox);
        await userEvent.click(combobox);
        await expect.poll(() => combobox.getAttribute('aria-expanded')).toBe('false');
        await expect.poll(() => listbox()).toBeNull();
    });

    it('closes on an outside click unless closeOnOutsideClick is false', async () => {
        const { screen, combobox } = await setup();
        const outside = screen.container.querySelector<HTMLElement>('#outside')!;
        await openList(combobox);
        await userEvent.click(outside);
        await expect.poll(() => combobox.getAttribute('aria-expanded')).toBe('false');

        await screen.rerender(<Host closeOnOutsideClick={false} />);
        await openList(combobox);
        await userEvent.click(outside);
        await wait();
        expect(combobox.getAttribute('aria-expanded')).toBe('true');
        expect(valueText()).toBe('null');
    });

    it('shows the placeholder for a value that is not among the options', async () => {
        const { combobox } = await setup({ initial: 'Mango' });
        expect(combobox.textContent?.trim()).toBe('Pick one');
        expect(combobox.hasAttribute('data-placeholder')).toBe(true);
        await openList(combobox);
        expect(options().some((o) => o.getAttribute('aria-selected') === 'true')).toBe(false);
        // nothing selected: the first option is highlighted
        await expect.poll(() => focusedText()).toBe('Apple');
    });

    it('moves the active option with Home and End while open', async () => {
        const { combobox } = await setup();
        await openList(combobox);
        await userEvent.keyboard('{End}');
        expect(focusedText()).toBe('Date');
        await userEvent.keyboard('{Home}');
        expect(focusedText()).toBe('Apple');
        // moving the highlight while open does not change the value
        expect(valueText()).toBe('null');
        expect(combobox.getAttribute('aria-expanded')).toBe('true');
    });

    it('selects the active option with Space and closes', async () => {
        const { combobox } = await setup();
        await openList(combobox);
        await userEvent.keyboard('{ArrowDown}');
        await userEvent.keyboard(' ');
        expect(valueText()).toBe('Banana');
        await expect.poll(() => combobox.getAttribute('aria-expanded')).toBe('false');
        await expect.poll(() => document.activeElement).toBe(combobox);
    });

    it.each([
        ['Enter', '{Enter}'],
        ['Space', ' '],
        ['Alt+ArrowDown', '{Alt>}{ArrowDown}{/Alt}'],
        ['F4', '{F4}']
    ])('opens the list with %s on the trigger', async (_name, keys) => {
        const { combobox } = await setup();
        combobox.focus();
        await userEvent.keyboard(keys);
        await expect.poll(() => combobox.getAttribute('aria-expanded')).toBe('true');
        await expect.poll(() => listbox()).not.toBeNull();
        expect(valueText()).toBe('null');
    });

    it.each([
        ['Alt+ArrowUp', '{Alt>}{ArrowUp}{/Alt}'],
        ['F4', '{F4}'],
        ['Escape', '{Escape}']
    ])('closes the open list with %s and gives the focus back to the trigger', async (_name, keys) => {
        const { combobox } = await setup({ initial: 'Apple' });
        await openList(combobox);
        await userEvent.keyboard('{ArrowDown}');
        await userEvent.keyboard(keys);
        await expect.poll(() => combobox.getAttribute('aria-expanded')).toBe('false');
        await expect.poll(() => document.activeElement).toBe(combobox);
        expect(valueText()).toBe('Apple');
    });

    it('scrolls the selected option into view when the list opens', async () => {
        const many = Array.from({ length: 30 }, (_, i) => `Option ${i + 1}`);
        const { combobox } = await setup({ options: many, maxHeight: '8rem', initial: 'Option 25' });
        await openList(combobox);
        await wait();
        const scroller = listbox()!.parentElement!;
        const selected = options()[24]!;
        expect(selected.getAttribute('aria-selected')).toBe('true');
        expect(scroller.scrollTop).toBeGreaterThan(0);
        const box = scroller.getBoundingClientRect();
        const rect = selected.getBoundingClientRect();
        expect(rect.top).toBeGreaterThanOrEqual(box.top - 1);
        expect(rect.bottom).toBeLessThanOrEqual(box.bottom + 1);
    });

    it('moves to the option matching several typed characters', async () => {
        const { combobox } = await setup({ options: ['aaa', 'bbb', 'bxbb', 'ccc'] });
        await openList(combobox);
        await userEvent.keyboard('bx');
        await wait(300);
        expect(focusedText()).toBe('bxbb');
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => document.activeElement).toBe(combobox);

        // closed, typing changes the value directly
        await userEvent.keyboard('bx');
        await wait(300);
        expect(valueText()).toBe('bxbb');
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
    });

    it('matches the selected option by value with compareWith', async () => {
        const screen = await render(
            <CompareHost initial={{ id: 2, name: 'Coupe' }} compareWith={(a, b) => a.id === b.id} />
        );
        const combobox = screen.container.querySelector<HTMLElement>('[role=combobox]')!;
        expect(combobox.textContent?.trim()).toBe('Coupe');
        await openList(combobox);
        expect(options()[1]!.getAttribute('aria-selected')).toBe('true');
        await userEvent.click(options()[2]!);
        expect(valueText()).toBe('3');
        expect(combobox.textContent?.trim()).toBe('Convertible');
    });

    it('does not match a copied object with the default comparator', async () => {
        const screen = await render(<CompareHost initial={{ id: 2, name: 'Coupe' }} />);
        const combobox = screen.container.querySelector<HTMLElement>('[role=combobox]')!;
        expect(combobox.textContent?.trim()).toBe('Pick one');
        await openList(combobox);
        expect(options().some((o) => o.getAttribute('aria-selected') === 'true')).toBe(false);
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => listbox()).toBeNull();

        await userEvent.click(screen.container.querySelector<HTMLElement>('#set-same')!);
        expect(combobox.textContent?.trim()).toBe('Coupe');
        await userEvent.click(screen.container.querySelector<HTMLElement>('#set-copy')!);
        expect(combobox.textContent?.trim()).toBe('Pick one');
    });

    it('closes with Escape without changing the value', async () => {
        const { combobox } = await setup({ initial: 'Apple' });
        await openList(combobox);
        await userEvent.keyboard('{ArrowDown}{Escape}');
        await expect.poll(() => combobox.getAttribute('aria-expanded')).toBe('false');
        expect(valueText()).toBe('Apple');
    });

    it('changes the value with the arrow keys and typing while closed', async () => {
        const onValueChange = vi.fn();
        const { combobox } = await setup({ onValueChange });
        combobox.focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(valueText()).toBe('Apple');
        await userEvent.keyboard('{ArrowRight}');
        expect(valueText()).toBe('Banana');
        // Cherry is disabled and skipped
        await userEvent.keyboard('{ArrowDown}');
        expect(valueText()).toBe('Date');
        // no wrapping at the end
        await userEvent.keyboard('{ArrowDown}');
        expect(valueText()).toBe('Date');
        await userEvent.keyboard('{ArrowLeft}');
        expect(valueText()).toBe('Banana');
        await userEvent.keyboard('{End}');
        expect(valueText()).toBe('Date');
        await userEvent.keyboard('{Home}');
        expect(valueText()).toBe('Apple');
        await userEvent.keyboard('b');
        await wait(300);
        expect(valueText()).toBe('Banana');
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
        expect(onValueChange).toHaveBeenLastCalledWith('Banana');
    });

    it('swaps Left and Right in right-to-left text while closed', async () => {
        const screen = await render(
            <DirectionProvider direction="rtl">
                <div dir="rtl">
                    <Host initial="Banana" />
                </div>
            </DirectionProvider>
        );
        const combobox = screen.container.querySelector<HTMLElement>('[role=combobox]')!;
        combobox.focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(valueText()).toBe('Date');
        await userEvent.keyboard('{ArrowRight}');
        expect(valueText()).toBe('Banana');
    });

    it('calls onBlur when the field loses the focus, and follows the disabled state', async () => {
        const onBlur = vi.fn();
        const onFocus = vi.fn();
        const { screen, combobox } = await setup({ onBlur, onFocus });
        combobox.focus();
        expect(onFocus).toHaveBeenCalledTimes(1);
        combobox.blur();
        expect(onBlur).toHaveBeenCalledTimes(1);

        await screen.rerender(<Host onBlur={onBlur} onFocus={onFocus} disabled />);
        expect(combobox.getAttribute('aria-disabled')).toBe('true');
        expect(combobox.getAttribute('tabindex')).toBe('-1');
        await userEvent.click(combobox, { force: true });
        await wait();
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
    });

    it('does not call onBlur while the focus moves into the list and back (fundamental-react)', async () => {
        const onBlur = vi.fn();
        const { combobox } = await setup({ onBlur });
        await openList(combobox);
        await expect.poll(() => focusedText()).toBe('Apple');
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => document.activeElement).toBe(combobox);
        expect(onBlur).not.toHaveBeenCalled();
        await userEvent.click(document.getElementById('outside')!);
        expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('closes the list on Tab; closeAndSelect selects the highlighted option', async () => {
        const { screen, combobox } = await setup();
        await openList(combobox);
        await userEvent.keyboard('{ArrowDown}');
        await userEvent.keyboard('{Tab}');
        await expect.poll(() => combobox.getAttribute('aria-expanded')).toBe('false');
        expect(valueText()).toBe('null');
        // the focus moves on from the control
        await expect.poll(() => document.activeElement?.id).toBe('outside');

        await screen.rerender(<Host tabOutStrategy="closeAndSelect" />);
        await openList(combobox);
        await userEvent.keyboard('{ArrowDown}');
        await userEvent.keyboard('{Tab}');
        await expect.poll(() => combobox.getAttribute('aria-expanded')).toBe('false');
        expect(valueText()).toBe('Banana');
    });

    it('is read-only: no arrow, the list does not open and the keys do not change the value', async () => {
        const { combobox } = await setup({ readOnly: true, initial: 'Banana' });
        expect(combobox.getAttribute('aria-readonly')).toBe('true');
        expect(combobox.querySelector('[aria-hidden=true]')).toBeNull();
        await userEvent.click(combobox);
        await wait();
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
        combobox.focus();
        await userEvent.keyboard('{ArrowDown}{Enter}');
        await wait();
        expect(valueText()).toBe('Banana');
        expect(listbox()).toBeNull();
    });

    it('hides the placeholder when disabled or read-only', async () => {
        const { screen, combobox } = await setup({ disabled: true });
        expect(getComputedStyle(combobox.querySelector('span')!).visibility).toBe('hidden');
        await screen.rerender(<Host readOnly />);
        expect(getComputedStyle(combobox.querySelector('span')!).visibility).toBe('hidden');
        await screen.rerender(<Host key="other" readOnly initial="Apple" />);
        const remounted = screen.container.querySelector<HTMLElement>('[role=combobox]')!;
        expect(getComputedStyle(remounted.querySelector('span')!).visibility).toBe('visible');
    });

    it('shows the value state: aria-invalid for errors and the message above the options', async () => {
        const { screen, combobox } = await setup({ state: 'error', stateMessage: 'Pick a fruit' });
        expect(combobox.getAttribute('aria-invalid')).toBe('true');
        await openList(combobox);
        const message = document.querySelector<HTMLElement>('[data-slot=list-message]')!;
        expect(message.textContent).toBe('Pick a fruit');
        expect(listbox()!.getAttribute('aria-describedby')).toBe(message.id);
        expect(getComputedStyle(message).position).toBe('sticky');
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => listbox()).toBeNull();

        await screen.rerender(<Host state="success" stateMessage="A long message" textOverflow="full" />);
        expect(combobox.hasAttribute('aria-invalid')).toBe(false);
        await openList(combobox);
        const full = document.querySelector<HTMLElement>('[data-slot=list-message]')!;
        expect(getComputedStyle(full).position).toBe('static');
        expect(getComputedStyle(full).whiteSpace).toBe('normal');
    });

    it('opens and closes controlled with open and onOpenChange', async () => {
        const onOpenChange = vi.fn();
        const screen = await render(<Host open={false} onOpenChange={onOpenChange} />);
        const combobox = screen.container.querySelector<HTMLElement>('[role=combobox]')!;
        await userEvent.click(combobox);
        expect(onOpenChange).toHaveBeenLastCalledWith(true);
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
        await screen.rerender(<Host open onOpenChange={onOpenChange} />);
        await expect.poll(() => listbox()).not.toBeNull();
        expect(combobox.getAttribute('aria-expanded')).toBe('true');
        await screen.rerender(<Host open={false} onOpenChange={onOpenChange} />);
        await expect.poll(() => listbox()).toBeNull();
    });

    it('does not open without options', async () => {
        const { combobox } = await setup({ options: [] });
        await userEvent.click(combobox);
        await wait();
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
    });

    it('takes the selected text from rich options and renders a custom control text', async () => {
        const screen = await render(
            <Select
                aria-label="Food"
                placeholder="Select"
                defaultValue="apple"
                renderValue={(text, selected) => <b>{selected ? `${text} (${String(selected.value)})` : text}</b>}
            >
                <SelectOption value="apple">
                    <ListTitle>Apple</ListTitle>
                    <ListSecondary>52 kcal</ListSecondary>
                </SelectOption>
                <SelectOption value="pear" label="A pear">
                    Pear
                </SelectOption>
            </Select>
        );
        const combobox = screen.container.querySelector<HTMLElement>('[role=combobox]')!;
        expect(combobox.querySelector('b')!.textContent).toBe('Apple (apple)');
        await openList(combobox);
        await userEvent.click(options()[1]!);
        expect(combobox.querySelector('b')!.textContent).toBe('A pear (pear)');
    });

    it('clears the value with an option without a value', async () => {
        const onValueChange = vi.fn();
        const screen = await render(
            <Select aria-label="Fruit" placeholder="Pick one" defaultValue="a" onValueChange={onValueChange}>
                <SelectOption aria-label="None"> </SelectOption>
                <SelectOption value="a">A</SelectOption>
            </Select>
        );
        const combobox = screen.container.querySelector<HTMLElement>('[role=combobox]')!;
        expect(combobox.textContent?.trim()).toBe('A');
        await openList(combobox);
        await userEvent.click(options()[0]!);
        expect(onValueChange).toHaveBeenLastCalledWith(null);
        expect(combobox.textContent?.trim()).toBe('Pick one');
    });

    it('updates the text when the options and the value change (fundamental-react)', async () => {
        const list = (extra: string[], value: string) => (
            <Select aria-label="Item" value={value}>
                {['1', '2', '3', '4', ...extra].map((key) => (
                    <SelectOption key={key} value={key}>
                        List Item {key}
                    </SelectOption>
                ))}
            </Select>
        );
        const screen = await render(list([], '4'));
        const combobox = screen.container.querySelector<HTMLElement>('[role=combobox]')!;
        expect(combobox.textContent?.trim()).toBe('List Item 4');
        await screen.rerender(list(['5'], '5'));
        expect(combobox.textContent?.trim()).toBe('List Item 5');
        await screen.rerender(list(['5'], '1'));
        expect(combobox.textContent?.trim()).toBe('List Item 1');
    });

    it('passes className, native props and ref to the root and the classes to its parts', async () => {
        const ref = createRef<HTMLDivElement>();
        const controlRef = createRef<HTMLDivElement>();
        const screen = await render(
            <Select
                ref={ref}
                controlRef={controlRef}
                aria-label="Fruit"
                data-sample="Sample"
                className="wonderful-root"
                controlClassName="wonderful-control"
                textClassName="wonderful-text"
                buttonClassName="wonderful-button"
                listClassName="wonderful-list"
                popoverProps={{ className: 'wonderful-popup', 'data-sample': 'Popper-sample' }}
            >
                <SelectOption value="a" className="wonderful-option">
                    A
                </SelectOption>
            </Select>
        );
        const root = screen.container.firstElementChild as HTMLElement;
        expect(ref.current).toBe(root);
        expect(root.tagName).toBe('DIV');
        expect(root.getAttribute('data-sample')).toBe('Sample');
        expect(root.classList).toContain('wonderful-root');
        const combobox = root.querySelector<HTMLElement>('[role=combobox]')!;
        expect(controlRef.current).toBe(combobox);
        expect(combobox.classList).toContain('wonderful-control');
        expect(combobox.querySelector('span')!.classList).toContain('wonderful-text');
        expect(combobox.querySelector('[aria-hidden=true]')!.classList).toContain('wonderful-button');
        await openList(combobox);
        expect(listbox()!.classList).toContain('wonderful-list');
        expect(options()[0]!.classList).toContain('wonderful-option');
        const popup = listbox()!.closest<HTMLElement>('.wonderful-popup')!;
        expect(popup.getAttribute('data-sample')).toBe('Popper-sample');
    });

    it('makes the list at least as wide as the control, or exactly as wide with equal', async () => {
        const screen = await render(<Host inline={false} style={{ width: '20rem' }} />);
        const combobox = screen.container.querySelector<HTMLElement>('[role=combobox]')!;
        await openList(combobox);
        const popup = () => listbox()!.closest<HTMLElement>('[data-open], [data-side]')!;
        expect(Math.round(popup().getBoundingClientRect().width)).toBeGreaterThanOrEqual(
            Math.round(combobox.getBoundingClientRect().width)
        );
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => listbox()).toBeNull();
        await screen.rerender(<Host inline={false} style={{ width: '10rem' }} fillControlMode="equal" />);
        await openList(combobox);
        expect(Math.round(popup().getBoundingClientRect().width)).toBe(
            Math.round(combobox.getBoundingClientRect().width)
        );
    });

    it('takes the width of its text inline and the full width otherwise', async () => {
        const screen = await render(
            <div style={{ width: '600px' }}>
                <Host />
            </div>
        );
        const root = () => screen.container.querySelector<HTMLElement>('[role=combobox]')!.parentElement!;
        expect(root().getBoundingClientRect().width).toBeLessThan(300);
        await screen.rerender(
            <div style={{ width: '600px' }}>
                <Host inline={false} />
            </div>
        );
        expect(Math.round(root().getBoundingClientRect().width)).toBe(600);
    });

    it('submits its value with a form through a hidden input', async () => {
        const screen = await render(
            <form>
                <Select aria-label="Fruit" name="fruit" defaultValue="Banana" required>
                    <SelectOption value="Apple">Apple</SelectOption>
                    <SelectOption value="Banana">Banana</SelectOption>
                </Select>
            </form>
        );
        const formEl = screen.container.querySelector('form')!;
        expect(new FormData(formEl).get('fruit')).toBe('Banana');
        expect(screen.container.querySelector('[role=combobox]')!.getAttribute('aria-required')).toBe('true');
    });

    it('applies the choice in mobile mode only when it is approved', async () => {
        const mobileConfig: SelectMobileConfig = {
            title: 'Fruit',
            approveButtonText: 'Save',
            cancelButtonText: 'Cancel'
        };
        const { combobox } = await setup({ mobile: true, mobileConfig });
        await userEvent.click(combobox);
        await expect.poll(() => dialog()).not.toBeNull();
        expect(dialog()!.getAttribute('aria-labelledby')).toBe(dialog()!.querySelector('h2')!.id);
        expect(combobox.getAttribute('aria-expanded')).toBe('true');
        expect(combobox.getAttribute('aria-controls')).toBe(listbox()!.id);
        await expect.poll(() => document.activeElement).toBe(listbox());
        await userEvent.click(options()[1]!);
        expect(valueText()).toBe('null');
        expect(options()[1]!.getAttribute('aria-selected')).toBe('true');
        await userEvent.click(button('Save')!);
        expect(valueText()).toBe('Banana');
        await expect.poll(() => dialog()).toBeNull();
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
    });

    it('mobile: Cancel closes the dialog and keeps the old value', async () => {
        const mobileConfig: SelectMobileConfig = {
            title: 'Fruit',
            approveButtonText: 'Save',
            cancelButtonText: 'Cancel'
        };
        const { combobox } = await setup({ mobile: true, mobileConfig, initial: 'Apple' });
        await userEvent.click(combobox);
        await expect.poll(() => dialog()).not.toBeNull();
        await userEvent.click(options()[1]!);
        expect(options()[1]!.getAttribute('aria-selected')).toBe('true');
        await userEvent.click(button('Cancel')!);
        await expect.poll(() => dialog()).toBeNull();
        expect(valueText()).toBe('Apple');
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
        expect(combobox.textContent?.trim()).toBe('Apple');
    });

    it('mobile: renders with an empty mobileConfig and selects on click', async () => {
        const { combobox } = await setup({ mobile: true, mobileConfig: {} });
        await userEvent.click(combobox);
        await expect.poll(() => dialog()).not.toBeNull();
        const open = dialog()!;
        expect(open.querySelector('h2')).toBeNull();
        expect(button('Save')).toBeUndefined();
        expect(button('Cancel')).toBeUndefined();
        // the close button is shown by default, and the dialog is named by the select
        expect(open.querySelector('button[aria-label=Close]')).not.toBeNull();
        expect(open.getAttribute('aria-label')).toBe('Fruit');
        expect(open.querySelector('[role=listbox]')).not.toBeNull();

        await userEvent.click(options()[3]!);
        expect(valueText()).toBe('Date');
        await expect.poll(() => dialog()).toBeNull();
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
    });

    it('mobile: highlights with the keyboard (aria-activedescendant) and closes with Escape or the close button', async () => {
        const { combobox } = await setup({ mobile: true, initial: 'Banana', closeLabel: 'Close it' });
        combobox.focus();
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => document.activeElement).toBe(listbox());
        const list = listbox()!;
        const active = () => document.getElementById(list.getAttribute('aria-activedescendant') ?? '')?.textContent;
        expect(active()).toBe('Banana');
        await userEvent.keyboard('{ArrowDown}');
        expect(active()).toBe('Date');
        expect(options()[3]!.hasAttribute('data-active')).toBe(true);
        await userEvent.keyboard('{Home}');
        expect(active()).toBe('Apple');
        await userEvent.keyboard('d');
        await wait(300);
        expect(active()).toBe('Date');
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => dialog()).toBeNull();
        expect(valueText()).toBe('Banana');
        await expect.poll(() => document.activeElement).toBe(combobox);

        await userEvent.keyboard('{Enter}');
        await expect.poll(() => dialog()).not.toBeNull();
        await userEvent.keyboard('{End}{Enter}');
        expect(valueText()).toBe('Date');
        await expect.poll(() => dialog()).toBeNull();

        await userEvent.click(combobox);
        await expect.poll(() => dialog()).not.toBeNull();
        await userEvent.click(dialog()!.querySelector<HTMLElement>('button[aria-label="Close it"]')!);
        await expect.poll(() => dialog()).toBeNull();
        expect(valueText()).toBe('Date');
    });
});
