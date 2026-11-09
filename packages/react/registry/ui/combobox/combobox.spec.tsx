import { createRef, useState, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Dialog, DialogBody, DialogPopup } from '@/ui/dialog/dialog';
import { iconGlyphChar } from '@/ui/icon/icon';
import { ListMessage } from '@/ui/list/list';
import { Combobox, type ComboboxActions, type ComboboxProps } from './combobox';

interface Item {
    id: number;
    name: string;
}

interface Fruit {
    name: string;
    code: string;
}

const KIWI: Fruit = { name: 'Kiwi', code: 'K1' };
const BANANA: Fruit = { name: 'Banana', code: 'B1' };
const APPLE: Fruit = { name: 'Apple', code: 'A1' };
const APPLE_2: Fruit = { name: 'Apple', code: 'A2' };

const FRUITS = ['Apple', 'Apricot', 'Banana', 'Cherry'];
const displayAny = (item: unknown) =>
    item == null ? '' : typeof item === 'string' ? item : ((item as Fruit).name ?? '');

const wait = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
/** Waits for the dialog fade in or out to end. */
const settle = async () => {
    await wait(100);
    for (let i = 0; i < 20; i++) {
        const fades = document.getAnimations().filter((a) => a instanceof CSSTransition);
        if (!fades.length) break;
        await Promise.all(fades.map((a) => a.finished.catch(() => undefined)));
        await frame();
    }
    await frame();
};
const options = () => [...document.querySelectorAll<HTMLElement>('[role=option]')];
const optionTexts = () => options().map((option) => option.textContent?.trim());
const listbox = () => document.querySelector<HTMLElement>('[role=listbox]');
const option = (text: string) => options().find((o) => o.textContent?.trim() === text)!;
/** A button of the open mobile dialog by its text or label. */
const dialogButton = (label: string) =>
    [...document.querySelectorAll<HTMLButtonElement>('[role=dialog] button')].find(
        (b) => b.textContent?.trim().startsWith(label) || b.getAttribute('aria-label') === label
    );

/** A combobox bound to a value, as an Angular form control: `emitted` holds the user's changes, `set` writes one. */
function setupValue<T>(props: Partial<ComboboxProps<T>>, initial: unknown = null) {
    const emitted: unknown[] = [];
    const control = { value: initial, set: (_value: unknown) => {} };
    function Host({ extra }: { extra?: ReactNode }) {
        const [value, setValue] = useState<unknown>(initial);
        control.value = value;
        control.set = setValue;
        return (
            <>
                <Combobox<T>
                    aria-label="Fruit"
                    {...props}
                    value={value}
                    onValueChange={(next) => {
                        emitted.push(next);
                        setValue(next);
                        props.onValueChange?.(next);
                    }}
                />
                <button type="button">Outside</button>
                {extra}
            </>
        );
    }
    return { Host, emitted, control };
}

async function mount<T>(props: Partial<ComboboxProps<T>>, initial: unknown = null) {
    const { Host, emitted, control } = setupValue<T>(props, initial);
    const screen = await render(<Host />);
    const input = screen.container.querySelector<HTMLInputElement>('input')!;
    const outside = [...screen.container.querySelectorAll<HTMLButtonElement>('button')].find(
        (b) => b.textContent === 'Outside'
    )!;
    const buttons = () =>
        [...screen.container.querySelectorAll<HTMLButtonElement>('button')].filter((b) => b !== outside);
    /** Writes a value from outside, as `control.setValue`. */
    const set = async (value: unknown) => {
        control.set(value);
        await expect.poll(() => control.value).toBe(value);
    };
    /** Opens the list with Alt+Down and clicks the option with the text. */
    const pick = async (text: string) => {
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await userEvent.click(option(text));
    };
    return { screen, input, outside, buttons, emitted, control, set, pick };
}

describe('Combobox', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('is a combobox input that filters the values while typing', async () => {
        const { input } = await mount({ dropdownValues: FRUITS, autoComplete: false });
        expect(input.getAttribute('role')).toBe('combobox');
        expect(input.getAttribute('aria-expanded')).toBe('false');
        expect(input.getAttribute('aria-autocomplete')).toBe('list');
        expect(input.getAttribute('aria-haspopup')).toBe('listbox');
        expect(input.getAttribute('autocomplete')).toBe('off');
        await userEvent.type(input, 'ap');
        expect(input.getAttribute('aria-expanded')).toBe('true');
        expect(input.getAttribute('aria-controls')).toBe(listbox()!.id);
        expect(listbox()!.getAttribute('aria-label')).toBe('Fruit');
        expect(optionTexts()).toEqual(['Apple', 'Apricot']);
        expect(options()[0]!.querySelector('b')?.textContent).toBe('Ap');
        // the focus stays in the input
        expect(document.activeElement).toBe(input);
    });

    it('completes the text inline and takes it over with Enter', async () => {
        const { input, control } = await mount({ dropdownValues: FRUITS });
        expect(input.getAttribute('aria-autocomplete')).toBe('both');
        input.focus();
        await userEvent.keyboard('b');
        await expect.poll(() => input.value).toBe('Banana');
        expect(input.selectionStart).toBe(1);
        expect(input.selectionEnd).toBe(6);
        expect(control.value).toBe('b');
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => control.value).toBe('Banana');
        expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('takes over the inline completion with the right arrow key', async () => {
        const { input, control } = await mount({ dropdownValues: FRUITS });
        input.focus();
        await userEvent.keyboard('ch');
        await expect.poll(() => input.value).toBe('Cherry');
        await userEvent.keyboard('{ArrowRight}');
        await expect.poll(() => control.value).toBe('Cherry');
        expect(input.selectionStart).toBe(6);
    });

    it('highlights items with the arrow keys and chooses with Enter', async () => {
        const onItemSelect = vi.fn();
        const { input, control } = await mount({ dropdownValues: FRUITS, autoComplete: false, onItemSelect });
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        expect(options()).toHaveLength(4);
        expect(input.hasAttribute('aria-activedescendant')).toBe(false);
        await userEvent.keyboard('{ArrowDown}{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[1]!.id);
        expect(options()[1]!.hasAttribute('data-active')).toBe(true);
        expect(input.value).toBe('Apricot');
        await userEvent.keyboard('{ArrowDown}{Enter}');
        expect(control.value).toBe('Banana');
        expect(onItemSelect).toHaveBeenLastCalledWith({ item: 'Banana', index: 2 });
        expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('goes back to no highlight with Up from the first item, and stops at the last', async () => {
        const { input } = await mount({ dropdownValues: FRUITS, autoComplete: false });
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[0]!.id);
        await userEvent.keyboard('{ArrowUp}');
        expect(input.hasAttribute('aria-activedescendant')).toBe(false);
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[3]!.id);
        expect(input.value).toBe('Cherry');
    });

    it('chooses an item on click and closes', async () => {
        const { input, control } = await mount({ dropdownValues: FRUITS, autoComplete: false });
        await userEvent.type(input, 'c');
        await userEvent.click(options()[0]!);
        expect(control.value).toBe('Cherry');
        expect(input.value).toBe('Cherry');
        expect(document.activeElement).toBe(input);
        expect(input.getAttribute('aria-expanded')).toBe('false');
        await expect.poll(() => listbox()).toBeNull();
    });

    it('steps through the values with the arrow keys while closed', async () => {
        const { input, control, set } = await mount({ dropdownValues: FRUITS, autoComplete: false });
        await set('Apricot');
        await expect.poll(() => input.value).toBe('Apricot');
        input.focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(control.value).toBe('Banana');
        await userEvent.keyboard('{ArrowUp}{ArrowUp}');
        expect(control.value).toBe('Apple');
        expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('opens the full list with the button and closes with Escape', async () => {
        const onOpenChange = vi.fn();
        const { input, buttons } = await mount({ dropdownValues: FRUITS, autoComplete: false, onOpenChange });
        const button = buttons()[0]!;
        expect(button.getAttribute('aria-label')).toBe('Show values');
        expect(button.getAttribute('aria-haspopup')).toBe('listbox');
        expect(button.tabIndex).toBe(-1);
        await userEvent.click(button);
        expect(options()).toHaveLength(4);
        expect(button.getAttribute('aria-expanded')).toBe('true');
        expect(document.activeElement).toBe(input);
        await userEvent.keyboard('{Escape}');
        expect(input.getAttribute('aria-expanded')).toBe('false');
        expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
        // the button toggles the list
        await userEvent.click(button);
        expect(input.getAttribute('aria-expanded')).toBe('true');
        await userEvent.click(button);
        expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('closes the list on Alt+Up and on a click outside', async () => {
        const { input, outside } = await mount({ dropdownValues: FRUITS });
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        expect(input.getAttribute('aria-expanded')).toBe('true');
        await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');
        expect(input.getAttribute('aria-expanded')).toBe('false');
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await userEvent.click(outside);
        expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('communicates by object with a value property', async () => {
        const items: Item[] = [
            { id: 1, name: 'One' },
            { id: 2, name: 'Two' }
        ];
        const { input, control } = await mount<Item>(
            {
                'aria-label': 'Item',
                communicateByObject: true,
                valueProperty: 'id',
                displayFn: (item) => item?.name ?? '',
                dropdownValues: items
            } as Partial<ComboboxProps<Item>>,
            2
        );
        expect(input.value).toBe('Two');
        await userEvent.clear(input);
        await userEvent.type(input, 'One');
        expect(control.value).toBe(1);
        await userEvent.type(input, 'x');
        expect(control.value).toBeNull();
    });

    describe('leaving the field', () => {
        const leaveProps = (extra: Partial<ComboboxProps<unknown>> = {}): Partial<ComboboxProps<unknown>> => ({
            communicateByObject: true,
            displayFn: displayAny,
            dropdownValues: [KIWI, BANANA, APPLE, APPLE_2],
            ...extra
        });

        it('Tab reverts invalid text to the last selection in object mode', async () => {
            const { input, control, pick } = await mount(leaveProps());
            await pick('Kiwi');
            expect(control.value).toBe(KIWI);
            await userEvent.type(input, '123');
            expect(control.value).toBeNull();
            await userEvent.keyboard('{Tab}');
            expect(input.value).toBe('Kiwi');
            expect(control.value).toBe(KIWI);
            expect(input.getAttribute('aria-expanded')).toBe('false');
        });

        it('tabOutStrategy close restores the selection without calling onItemSelect', async () => {
            const onItemSelect = vi.fn();
            const { input, control, pick } = await mount(leaveProps({ tabOutStrategy: 'close', onItemSelect }));
            await pick('Kiwi');
            expect(onItemSelect).toHaveBeenCalledTimes(1);
            await userEvent.clear(input);
            await userEvent.type(input, 'Custom');
            await userEvent.keyboard('{Tab}');
            expect(input.value).toBe('Kiwi');
            expect(control.value).toBe(KIWI);
            expect(onItemSelect).toHaveBeenCalledTimes(1);
        });

        it('Tab commits the completed autocomplete candidate once', async () => {
            const { input, control, emitted } = await mount({ dropdownValues: ['Kiwi', 'Banana'] });
            input.focus();
            await userEvent.keyboard('k');
            await expect.poll(() => input.value).toBe('Kiwi');
            expect(control.value).toBe('k');
            emitted.length = 0;
            await userEvent.keyboard('{Tab}');
            expect(input.value).toBe('Kiwi');
            expect(emitted).toEqual(['Kiwi']);
        });

        it('a duplicate completed label does not choose an arbitrary object on Tab', async () => {
            const onItemSelect = vi.fn();
            const { input, control, pick } = await mount(leaveProps({ onItemSelect }));
            await pick('Kiwi');
            await userEvent.clear(input);
            await userEvent.keyboard('a');
            await expect.poll(() => input.value).toBe('Apple');
            await userEvent.keyboard('{Tab}');
            expect(input.value).toBe('Kiwi');
            expect(control.value).toBe(KIWI);
            expect(onItemSelect).toHaveBeenCalledTimes(1);
        });

        it('an outside click reverts invalid text, but not when the text matches the selection', async () => {
            const { input, outside, control, emitted, pick } = await mount(leaveProps());
            await pick('Kiwi');
            emitted.length = 0;
            await userEvent.click(outside);
            expect(input.value).toBe('Kiwi');
            expect(emitted).toEqual([]);

            await userEvent.type(input, '123');
            expect(control.value).toBeNull();
            await userEvent.click(outside);
            expect(input.value).toBe('Kiwi');
            expect(control.value).toBe(KIWI);
            expect(input.getAttribute('aria-expanded')).toBe('false');
        });

        it('an outside click keeps free text in text mode', async () => {
            const { input, outside, control, pick } = await mount({ dropdownValues: ['Kiwi', 'Banana'] });
            await pick('Kiwi');
            await userEvent.type(input, '123');
            await userEvent.click(outside);
            expect(input.value).toBe('Kiwi123');
            expect(control.value).toBe('Kiwi123');
        });

        it('keeps free text on Tab and on a later close when autoComplete is false', async () => {
            const { input, control, pick } = await mount(leaveProps({ autoComplete: false }));
            await pick('Apple');
            expect(control.value).toBe(APPLE);
            await userEvent.clear(input);
            await userEvent.type(input, 'free text');
            await userEvent.keyboard('{Tab}');
            expect(input.value).toBe('free text');
            expect(control.value).toBeNull();

            input.focus();
            await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
            await userEvent.keyboard('{Tab}');
            expect(input.value).toBe('free text');
        });
    });

    it('groups options in labelled groups that are lists, not list items', async () => {
        const { input } = await mount({
            'aria-label': 'Food',
            dropdownValues: ['Apple', 'Banana', 'Carrot'],
            groupFn: (items: string[]) => ({
                Fruit: items.filter((i) => i !== 'Carrot'),
                Vegetable: items.filter((i) => i === 'Carrot')
            })
        } as Partial<ComboboxProps<string>>);
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        const groups = [...document.querySelectorAll<HTMLElement>('[role=listbox] [role=group]')];
        expect(groups.map((g) => g.tagName)).toEqual(['UL', 'UL']);
        expect(
            groups.map((g) => document.getElementById(g.getAttribute('aria-labelledby')!)?.textContent?.trim())
        ).toEqual(['Fruit', 'Vegetable']);
        expect(groups.map((g) => g.querySelectorAll('[role=option]').length)).toEqual([2, 1]);
        expect(groups[0]!.parentElement!.getAttribute('role')).toBe('none');
        // the header is a list group header: its title in the header font, on a 2rem line at the bottom
        const header = document.getElementById(groups[0]!.getAttribute('aria-labelledby')!)!;
        const title = header.querySelector<HTMLElement>('[data-slot=list-title]')!;
        expect(header.hasAttribute('tabindex')).toBe(false);
        expect(getComputedStyle(header).alignItems).toBe('flex-end');
        expect(getComputedStyle(title).lineHeight).toBe('32px');
        expect(getComputedStyle(title).fontWeight).toBe('700');
        expect(title.getBoundingClientRect().bottom).toBeCloseTo(header.getBoundingClientRect().bottom - 1, 0);
        // the arrow keys go through the groups in order
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
        expect(input.value).toBe('Carrot');
    });

    it('inside a dialog, Escape closes the list but not the dialog', async () => {
        function Host() {
            const [open, setOpen] = useState(true);
            return (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogPopup aria-label="Fruits">
                        <DialogBody>
                            <Combobox aria-label="Fruit" dropdownValues={['Apple', 'Banana']} />
                        </DialogBody>
                    </DialogPopup>
                </Dialog>
            );
        }
        await render(<Host />);
        await settle();
        const input = document.querySelector<HTMLInputElement>('[role=dialog] input[role=combobox]')!;
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        expect(input.getAttribute('aria-expanded')).toBe('true');
        await userEvent.keyboard('{Escape}');
        expect(input.getAttribute('aria-expanded')).toBe('false');
        await settle();
        expect(document.querySelector('[role=dialog]')).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(document.querySelector('[role=dialog]')).toBeNull();
    });

    it('calls onSearch on Enter and on the button', async () => {
        const onSearch = vi.fn();
        const { input, buttons } = await mount({ dropdownValues: ['Apple', 'Banana', 'Kiwi'], onSearch });
        input.focus();
        await userEvent.keyboard('{Enter}');
        expect(onSearch).toHaveBeenCalledTimes(1);
        await userEvent.click(buttons()[0]!);
        expect(onSearch).toHaveBeenCalledTimes(2);
    });

    it('takes over a completion when the input loses the focus (Angular: marks the control touched)', async () => {
        const onBlur = vi.fn();
        const { input, outside, control } = await mount({ dropdownValues: FRUITS, onBlur, openOnKeyboardEvent: false });
        input.focus();
        await userEvent.keyboard('ba');
        await expect.poll(() => input.value).toBe('Banana');
        expect(onBlur).not.toHaveBeenCalled();
        await userEvent.click(outside);
        expect(onBlur).toHaveBeenCalledTimes(1);
        expect(control.value).toBe('Banana');
    });

    it('search field shows a search addon and a clear button once there is text', async () => {
        const { input, control, buttons } = await mount({
            dropdownValues: ['Apple', 'Banana', 'Kiwi'],
            isSearch: true
        });
        expect(buttons()).toHaveLength(1);
        expect(buttons()[0]!.querySelector('[data-glyph]')!.getAttribute('data-glyph')).toBe(iconGlyphChar('search'));
        await userEvent.type(input, 'Ki');
        expect(buttons()).toHaveLength(2);
        expect(buttons()[0]!.getAttribute('aria-label')).toBe('Clear');
        // out of the tab order while the list is open (Base UI hides the rest of the field then)
        expect(buttons()[0]!.tabIndex).toBe(-1);
        await userEvent.keyboard('{Escape}');
        expect(buttons()[0]!.tabIndex).toBe(0);
        await userEvent.click(buttons()[0]!);
        expect(input.value).toBe('');
        expect(control.value).toBe('');
        expect(document.activeElement).toBe(input);
        expect(buttons()).toHaveLength(1);
    });

    it('keeps the list open on select when closeOnSelect is false', async () => {
        const { input, control } = await mount({ dropdownValues: ['Apple', 'Banana', 'Kiwi'], closeOnSelect: false });
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await userEvent.click(options()[1]!);
        expect(control.value).toBe('Banana');
        expect(input.value).toBe('Banana');
        expect(input.getAttribute('aria-expanded')).toBe('true');
        expect(options()[1]!.getAttribute('aria-selected')).toBe('true');
        expect(options()[0]!.getAttribute('aria-selected')).toBe('false');
    });

    it('fillOnSelect false calls onItemSelect without changing the text', async () => {
        const onItemSelect = vi.fn();
        const { input, control } = await mount({ dropdownValues: FRUITS, fillOnSelect: false, onItemSelect });
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await userEvent.click(option('Cherry'));
        expect(onItemSelect).toHaveBeenCalledWith({ item: 'Cherry', index: 3 });
        expect(input.value).toBe('');
        expect(control.value).toBeNull();
    });

    it('valueProperty: an unmatched written value shows no text, null clears', async () => {
        const { input, set } = await mount(
            {
                communicateByObject: true,
                valueProperty: 'code',
                displayFn: displayAny,
                dropdownValues: [KIWI, BANANA]
            },
            'B1'
        );
        expect(input.value).toBe('Banana');
        await set(99);
        await expect.poll(() => input.value).toBe('');
        await set('K1');
        await expect.poll(() => input.value).toBe('Kiwi');
        await set(null);
        await expect.poll(() => input.value).toBe('');
    });

    it('valueProperty is ignored without communicateByObject', async () => {
        const { input, control } = await mount({
            valueProperty: 'code',
            displayFn: displayAny,
            dropdownValues: [KIWI, BANANA]
        });
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await userEvent.click(options()[0]!);
        expect(control.value).toBe('Kiwi');
    });

    it('communicateByObject: clearing emits null, duplicate labels do not pick an arbitrary object', async () => {
        const { screen, input, control, emitted } = await mount({
            communicateByObject: true,
            isSearch: true,
            displayFn: displayAny,
            dropdownValues: [APPLE, APPLE_2, BANANA]
        });
        await userEvent.type(input, 'Banana');
        expect(control.value).toBe(BANANA);
        emitted.length = 0;
        await userEvent.click(screen.container.querySelector<HTMLButtonElement>('button[aria-label=Clear]')!);
        expect(emitted).toEqual([null]);

        emitted.length = 0;
        await userEvent.fill(input, 'Apple');
        expect(emitted.length).toBeGreaterThan(0);
        expect(emitted.at(-1)).not.toBe(APPLE);
        expect(emitted.at(-1)).not.toBe(APPLE_2);
    });

    describe('mobile', () => {
        const mobileProps = (extra: Partial<ComboboxProps<unknown>> = {}): Partial<ComboboxProps<unknown>> => ({
            mobile: true,
            mobileConfig: { title: 'Fruit' },
            displayFn: displayAny,
            dropdownValues: ['Apple', 'Banana', 'Kiwi'],
            ...extra
        });

        it('Approve commits the draft once, Cancel restores the form value', async () => {
            const onOpenChange = vi.fn();
            const { input, control, emitted } = await mount(
                mobileProps({
                    communicateByObject: true,
                    dropdownValues: [KIWI, BANANA, APPLE],
                    mobileConfig: { title: 'Fruit', approveButtonText: 'Save', cancelButtonText: 'Cancel' },
                    onOpenChange
                }),
                KIWI
            );
            expect(input.getAttribute('aria-haspopup')).toBe('dialog');
            expect(input.getAttribute('role')).toBe('combobox');
            await userEvent.click(input);
            await settle();
            expect(document.querySelector('[role=dialog] [role=listbox]')).not.toBeNull();
            expect(input.getAttribute('aria-expanded')).toBe('true');
            // the dialog is named by its title and its input has the focus
            const dialog = document.querySelector<HTMLElement>('[role=dialog]')!;
            expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('Fruit');
            expect(document.activeElement?.getAttribute('role')).toBe('combobox');
            expect(dialog.contains(document.activeElement)).toBe(true);

            await userEvent.click(option('Banana'));
            expect(document.querySelector('[role=dialog]')).not.toBeNull();
            expect(control.value).toBe(KIWI);
            expect(emitted).toEqual([]);

            await userEvent.click(dialogButton('Cancel')!);
            await settle();
            expect(document.querySelector('[role=dialog]')).toBeNull();
            expect(input.value).toBe('Kiwi');
            expect(control.value).toBe(KIWI);
            expect(emitted).toEqual([]);

            await userEvent.click(input);
            await settle();
            await userEvent.click(option('Apple'));
            await userEvent.click(dialogButton('Save')!);
            await settle();
            expect(document.querySelector('[role=dialog]')).toBeNull();
            expect(input.value).toBe('Apple');
            expect(control.value).toBe(APPLE);
            expect(emitted).toEqual([APPLE]);
            expect(onOpenChange.mock.calls.map(([open]) => open)).toEqual([true, false, true, false]);
            // the focus is back in the field
            expect(document.activeElement).toBe(input);
        });

        it('immediate mode (no approve text) commits on select and closes when closeOnSelect', async () => {
            const { input, control, emitted } = await mount(
                mobileProps({ mobileConfig: { title: 'Fruit', approveButtonText: '  ', cancelButtonText: 'Cancel' } })
            );
            await userEvent.click(input);
            await settle();
            expect(document.querySelectorAll('[role=dialog] [data-dialog-footer] button')).toHaveLength(1);
            await userEvent.click(option('Kiwi'));
            await settle();
            expect(document.querySelector('[role=dialog]')).toBeNull();
            expect(control.value).toBe('Kiwi');
            expect(emitted).toEqual(['Kiwi']);
            expect(input.value).toBe('Kiwi');
        });

        it('keeps a value written during a draft when Cancel discards the draft', async () => {
            const { input, control, set } = await mount(
                mobileProps({
                    mobileConfig: { title: 'Fruit', approveButtonText: 'Save', cancelButtonText: 'Cancel' }
                }),
                'Apple'
            );
            await userEvent.click(input);
            await settle();
            await userEvent.click(option('Banana'));
            await set('Kiwi');
            await userEvent.click(dialogButton('Cancel')!);
            await settle();
            expect(document.querySelector('[role=dialog]')).toBeNull();
            expect(input.value).toBe('Kiwi');
            expect(control.value).toBe('Kiwi');
        });

        it('immediate mode keeps the dialog open on select when closeOnSelect is false', async () => {
            const { input, control } = await mount(
                mobileProps({ closeOnSelect: false, mobileConfig: { title: 'Fruit', cancelButtonText: 'Cancel' } })
            );
            await userEvent.click(input);
            await settle();
            await userEvent.click(option('Banana'));
            expect(document.querySelector('[role=dialog]')).not.toBeNull();
            expect(control.value).toBe('Banana');
            await userEvent.click(dialogButton('Close')!);
            await settle();
            expect(document.querySelector('[role=dialog]')).toBeNull();
            expect(control.value).toBe('Banana');
            expect(input.value).toBe('Banana');
        });

        it('filters in the dialog input and moves with the arrow keys on the list', async () => {
            const { input, control } = await mount(mobileProps({ autoComplete: false }));
            input.focus();
            await userEvent.keyboard('{Enter}');
            await settle();
            const dialogInput = document.querySelector<HTMLInputElement>('[role=dialog] input')!;
            expect(document.activeElement).toBe(dialogInput);
            expect(dialogInput.getAttribute('aria-label')).toBe('Fruit');
            await userEvent.type(dialogInput, 'b');
            expect(optionTexts()).toEqual(['Banana']);
            await userEvent.keyboard('{ArrowDown}');
            expect(dialogInput.getAttribute('aria-activedescendant')).toBe(options()[0]!.id);
            await userEvent.keyboard('{Enter}');
            await settle();
            expect(document.querySelector('[role=dialog]')).toBeNull();
            expect(control.value).toBe('Banana');
        });
    });

    describe('fundamental-react', () => {
        it('passes className, native props and ref to the root', async () => {
            const ref = createRef<HTMLDivElement>();
            const { screen } = await mount({
                dropdownValues: FRUITS,
                className: 'extra',
                'data-sample': 'root',
                ref
            } as Partial<ComboboxProps<string>>);
            const root = screen.container.querySelector<HTMLElement>('[data-sample=root]')!;
            expect(root.classList.contains('extra')).toBe(true);
            expect(ref.current).toBe(root);
        });

        it('spreads inputProps, inputRef, buttonProps and popoverProps', async () => {
            const inputRef = createRef<HTMLInputElement>();
            const { input, buttons } = await mount({
                dropdownValues: FRUITS,
                inputProps: { 'data-sample': 'input' } as never,
                inputRef,
                buttonProps: { 'data-sample': 'button' } as never,
                popoverProps: { 'data-sample': 'popover' } as never
            });
            expect(input.dataset['sample']).toBe('input');
            expect(inputRef.current).toBe(input);
            expect(buttons()[0]!.dataset['sample']).toBe('button');
            await userEvent.click(buttons()[0]!);
            expect(document.querySelector('[data-sample=popover]')?.contains(listbox())).toBe(true);
        });

        it('pre-selects the value (selectedKey) and lets it change', async () => {
            const countries = [
                { key: 'CR', text: 'Costa Rica' },
                { key: 'CU', text: 'Cuba' }
            ];
            const screen = await render(
                <Combobox
                    aria-label="Country"
                    communicateByObject
                    valueProperty="key"
                    displayFn={(item) => item?.text ?? ''}
                    dropdownValues={countries}
                    defaultValue="CR"
                />
            );
            const input = screen.container.querySelector('input')!;
            expect(input.value).toBe('Costa Rica');
            await userEvent.click(screen.container.querySelector('button')!);
            expect(option('Costa Rica').getAttribute('aria-selected')).toBe('true');
        });

        it('shows the filtered options and selects the clicked one (manual selection)', async () => {
            const { input, control } = await mount({ dropdownValues: FRUITS, autoComplete: false });
            await userEvent.type(input, 'b');
            expect(optionTexts()).toEqual(['Banana']);
            // no automatic selection while typing or on blur: the value is the text
            expect(control.value).toBe('b');
            await userEvent.click(option('Banana'));
            expect(input.value).toBe('Banana');
            expect(control.value).toBe('Banana');
        });

        it('shows all entries, the matching ones first, with showAllEntries', async () => {
            const { input } = await mount({ dropdownValues: FRUITS, autoComplete: false, showAllEntries: true });
            await userEvent.type(input, 'ch');
            expect(optionTexts()).toEqual(['Cherry', 'Apple', 'Apricot', 'Banana']);
        });

        it('shows the no matches text when no value matches', async () => {
            const { input } = await mount({ dropdownValues: FRUITS, autoComplete: false, noMatchesText: 'No Matches' });
            await userEvent.type(input, 'xyz');
            expect(input.getAttribute('aria-expanded')).toBe('true');
            expect(options()).toHaveLength(0);
            expect(document.querySelector('[role=status]')?.textContent).toBe('No Matches');
        });

        it('closes the list without the no matches text', async () => {
            const { input } = await mount({ dropdownValues: FRUITS, autoComplete: false });
            await userEvent.type(input, 'xyz');
            expect(input.getAttribute('aria-expanded')).toBe('false');
            expect(input.hasAttribute('aria-controls')).toBe(false);
        });

        it('shows the value state message under the focused field and on top of the open list', async () => {
            const { input } = await mount({
                dropdownValues: FRUITS,
                state: 'error',
                stateMessage: 'Please select country of residence'
            });
            expect(input.getAttribute('aria-invalid')).toBe('true');
            const message = () => document.querySelector<HTMLElement>('[data-slot=form-message]');
            // the message describes the input
            expect(input.getAttribute('aria-describedby')).toContain(message()!.id);
            input.focus();
            await expect.poll(() => message()!.checkVisibility()).toBe(true);
            await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
            await expect.poll(() => message()!.checkVisibility()).toBe(false);
            const listMessage = listbox()!.querySelector<HTMLElement>('[data-slot=list-message]')!;
            expect(listMessage.textContent).toBe('Please select country of residence');
            expect(listMessage.getAttribute('aria-hidden')).toBe('true');
        });

        it('shows list messages at the top of the list', async () => {
            const screen = await render(
                <Combobox aria-label="Fruit" dropdownValues={FRUITS}>
                    <ListMessage type="information">Choose a product from the list</ListMessage>
                </Combobox>
            );
            await userEvent.click(screen.container.querySelector('button')!);
            const message = listbox()!.querySelector<HTMLElement>('[data-slot=list-message]')!;
            expect(message.getAttribute('role')).toBe('presentation');
            expect(message.textContent).toBe('Choose a product from the list');
            expect(getComputedStyle(listbox()!).paddingTop).toBe('32px');
        });

        it('renders items with renderItem and two-line items with byline', async () => {
            const screen = await render(
                <Combobox
                    aria-label="Fruit"
                    byline
                    dropdownValues={FRUITS}
                    renderItem={(item, { inputText }) => <span data-text={inputText}>{item.toUpperCase()}</span>}
                    defaultValue="Apple"
                />
            );
            await userEvent.click(screen.container.querySelector('button')!);
            expect(optionTexts()[0]).toBe('APPLE');
            expect(options()[0]!.querySelector('span')!.dataset['text']).toBe('Apple');
            expect(getComputedStyle(options()[0]!).paddingTop).toBe('8px');
        });

        it('filters with filterFn and matches any part with includes', async () => {
            const filterFn = vi.fn((values: string[], term: string) => values.filter((v) => v.startsWith(term)));
            const { input } = await mount({ dropdownValues: FRUITS, autoComplete: false, filterFn });
            await userEvent.type(input, 'a');
            expect(options()).toHaveLength(0);
            await userEvent.clear(input);
            await userEvent.type(input, 'A');
            expect(optionTexts()).toEqual(['Apple', 'Apricot']);
            expect(filterFn).toHaveBeenCalled();
        });

        it('matches any part of the values with includes, and does not bold without highlighting', async () => {
            const { input } = await mount({
                dropdownValues: FRUITS,
                autoComplete: false,
                includes: true,
                highlighting: false
            });
            await userEvent.type(input, 'an');
            expect(optionTexts()).toEqual(['Banana']);
            expect(options()[0]!.querySelector('b')).toBeNull();
        });

        it('is disabled: no list, disabled buttons', async () => {
            const screen = await render(
                <Combobox aria-label="Fruit" dropdownValues={FRUITS} disabled defaultValue="Cherry" />
            );
            const input = screen.container.querySelector('input')!;
            expect(input.disabled).toBe(true);
            expect(screen.container.querySelector('button')!.disabled).toBe(true);
            expect(input.value).toBe('Cherry');
        });

        it('is read-only: no buttons and no list', async () => {
            const screen = await render(
                <Combobox aria-label="Fruit" dropdownValues={FRUITS} readOnly defaultValue="Banana" />
            );
            const input = screen.container.querySelector('input')!;
            expect(input.readOnly).toBe(true);
            expect(input.getAttribute('aria-readonly')).toBe('true');
            expect(screen.container.querySelector('button')).toBeNull();
            input.focus();
            await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
            expect(listbox()).toBeNull();
        });

        it('hides the dropdown button, labels the input and sets width, title and required', async () => {
            const screen = await render(
                <>
                    <label htmlFor="cb-label">Fruit</label>
                    <Combobox
                        inputId="cb-label"
                        dropdownValues={FRUITS}
                        showDropdownButton={false}
                        width="300px"
                        title="Choose"
                        required
                    />
                </>
            );
            const input = screen.container.querySelector<HTMLInputElement>('#cb-label')!;
            expect(input.labels?.[0]?.textContent).toBe('Fruit');
            expect(input.title).toBe('Choose');
            expect(input.getAttribute('aria-required')).toBe('true');
            expect(screen.container.querySelector('button')).toBeNull();
            expect((input.closest('.block') as HTMLElement).getBoundingClientRect().width).toBe(300);
        });

        it('names the input and the list by their label, also while Base UI hides the page', async () => {
            const screen = await render(
                <>
                    <label id="cb-named-label" htmlFor="cb-named">
                        Fruit
                    </label>
                    <Combobox inputId="cb-named" dropdownValues={FRUITS} />
                </>
            );
            const input = screen.container.querySelector<HTMLInputElement>('#cb-named')!;
            await expect.poll(() => input.getAttribute('aria-labelledby')).toBe('cb-named-label');
            await userEvent.click(screen.container.querySelector('button')!);
            expect(listbox()!.getAttribute('aria-labelledby')).toBe('cb-named-label');
            expect(listbox()!.hasAttribute('aria-label')).toBe(false);
        });

        it('announces the number of results', async () => {
            const { input } = await mount({ dropdownValues: FRUITS, autoComplete: false });
            const status = document.getElementById(input.getAttribute('aria-describedby')!.split(' ')[0]!)!;
            expect(status.getAttribute('aria-live')).toBe('polite');
            expect(status.textContent).toBe('');
            await userEvent.type(input, 'a');
            expect(status.textContent).toBe('2 result list items');
        });

        it('opens and closes from actionsRef, and the list is at least as wide as the field', async () => {
            const actionsRef = createRef<ComboboxActions>();
            const screen = await render(
                <Combobox aria-label="Fruit" dropdownValues={FRUITS} width="400px" actionsRef={actionsRef} />
            );
            actionsRef.current!.open();
            await expect.poll(() => listbox()).not.toBeNull();
            const field = screen.container.querySelector<HTMLElement>('[role=group]')!;
            const popup = listbox()!.parentElement!;
            expect(popup.getBoundingClientRect().width).toBeGreaterThanOrEqual(field.getBoundingClientRect().width - 1);
            actionsRef.current!.close();
            await expect.poll(() => listbox()).toBeNull();
        });

        it('uses compact sizes', async () => {
            document.documentElement.setAttribute('data-density', 'compact');
            const screen = await render(<Combobox aria-label="Fruit" dropdownValues={FRUITS} />);
            const field = screen.container.querySelector<HTMLElement>('[role=group]')!;
            expect(field.getBoundingClientRect().height).toBe(26);
            await userEvent.click(screen.container.querySelector('button')!);
            expect(options()[0]!.getBoundingClientRect().height).toBe(32);
        });
    });
});
