import { createRef, useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Dialog, DialogBody, DialogPopup, DialogTitle } from '@/ui/dialog/dialog';
import { FormInputMessageGroup } from '@/ui/form/form-input-message-group';
import { FormMessage } from '@/ui/form/form-message';
import { MultiInput, type MultiInputActions, type MultiInputMobileConfig, type MultiInputProps } from './multi-input';

const FRUITS = ['Apple', 'Apricot', 'Banana', 'Cherry'];

const wait = (ms = 50) => new Promise((r) => setTimeout(r, ms));
const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
const options = () => [...document.querySelectorAll<HTMLElement>('ul[role=listbox] [role=option]')];
const optionTexts = () => options().map((o) => o.textContent?.trim());
const tokens = () => [...document.querySelectorAll<HTMLElement>('[data-token]')].map((t) => t.textContent?.trim());
const listOpen = () => !!document.querySelector('ul[role=listbox]');
const more = () => document.querySelectorAll<HTMLElement>('[data-tokenizer-more]');
const values = (count: number) => Array.from({ length: count }, (_, i) => `item${i}`);

interface HostProps<T, V> extends Partial<MultiInputProps<T, V>> {
    initial?: V[];
    width?: number;
    changes?: V[][];
}

/** A controlled multi-input that records its changes, between two buttons (Angular's hosts with a form control). */
function Host<T = string, V = string>({
    initial = [],
    width = 600,
    changes = [],
    onSelectedChange,
    ...props
}: HostProps<T, V>) {
    const [selected, setSelected] = useState<V[]>(initial);
    return (
        <>
            <button type="button" id="before">
                Before
            </button>
            <div style={{ width }}>
                <MultiInput<T, V>
                    aria-label="Fruits"
                    dropdownValues={FRUITS as T[]}
                    selected={selected}
                    onSelectedChange={(next) => {
                        changes.push(next);
                        setSelected(next);
                        onSelectedChange?.(next);
                    }}
                    {...props}
                />
            </div>
            <button type="button" id="after">
                After
            </button>
        </>
    );
}

async function setup<T = string, V = string>(props: HostProps<T, V> = {}) {
    const screen = await render(<Host<T, V> {...props} />);
    const input = screen.container.querySelector<HTMLInputElement>('input[role=combobox]')!;
    const addon = () => screen.container.querySelector<HTMLButtonElement>('button[aria-haspopup]')!;
    return { screen, input, addon };
}

describe('MultiInput', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('shows the selected values as tokens', async () => {
        const { screen } = await setup({ initial: ['Banana'] });
        expect(tokens()).toEqual(['Banana']);
        await screen.rerender(
            <MultiInput aria-label="Fruits" dropdownValues={FRUITS} selected={['Apple', 'Cherry']} />
        );
        expect(tokens()).toEqual(['Apple', 'Cherry']);
    });

    it('filters the options while typing and marks the selected ones', async () => {
        const { input } = await setup({ initial: ['Banana'], autoComplete: false });
        await userEvent.type(input, 'a');
        expect(input.getAttribute('aria-expanded')).toBe('true');
        expect(optionTexts()).toEqual(['Apple', 'Apricot']);
        await userEvent.clear(input);
        await userEvent.keyboard('{ArrowDown}');
        expect(options()).toHaveLength(4);
        expect(options()[2].getAttribute('aria-selected')).toBe('true');
        expect(document.querySelector('ul[role=listbox][aria-multiselectable=true]')).not.toBeNull();
    });

    it('toggles options by click and with Enter on the highlighted option', async () => {
        const changes: string[][] = [];
        const { input } = await setup({ initial: ['Banana'], changes });
        input.focus();
        await userEvent.keyboard('{ArrowDown}');
        await userEvent.click(options()[0]);
        expect(changes.at(-1)).toEqual(['Banana', 'Apple']);
        expect(document.activeElement).toBe(input);
        await userEvent.keyboard('{ArrowDown}{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[2].id);
        expect(options()[2].hasAttribute('data-active')).toBe(true);
        await userEvent.keyboard('{Enter}');
        expect(changes.at(-1)).toEqual(['Apple']);
        expect(tokens()).toEqual(['Apple']);
    });

    it('selects the first match with Enter and clears the search', async () => {
        const changes: string[][] = [];
        const { input } = await setup({ initial: ['Banana'], changes });
        input.focus();
        await userEvent.keyboard('ch');
        await wait();
        expect(input.value).toBe('Cherry');
        // the completed part is selected, so typing replaces it
        expect([input.selectionStart, input.selectionEnd]).toEqual([2, 6]);
        expect(input.getAttribute('aria-autocomplete')).toBe('both');
        await userEvent.keyboard('{Enter}');
        expect(changes.at(-1)).toEqual(['Banana', 'Cherry']);
        expect(input.value).toBe('');
        expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('adds new tokens when allowed', async () => {
        const changes: string[][] = [];
        const { input } = await setup({ initial: ['Banana'], allowNewTokens: true, autoComplete: false, changes });
        await userEvent.type(input, 'Mango{Enter}');
        expect(changes.at(-1)).toEqual(['Banana', 'Mango']);
        expect(tokens()).toEqual(['Banana', 'Mango']);
        // the new item is in the list
        await userEvent.keyboard('{ArrowDown}');
        expect(optionTexts()).toEqual([...FRUITS, 'Mango']);
    });

    it('validates and parses new tokens', async () => {
        const changes: string[][] = [];
        const { input } = await setup({
            allowNewTokens: true,
            autoComplete: false,
            newTokenValidateFn: (text) => text.length > 3,
            newTokenParseFn: (text) => text.toUpperCase(),
            changes
        });
        await userEvent.type(input, 'Fig{Enter}');
        expect(changes).toEqual([]);
        await userEvent.clear(input);
        await userEvent.type(input, 'Mango{Enter}');
        expect(changes.at(-1)).toEqual(['MANGO']);
    });

    it('removes tokens with the close icon and Backspace', async () => {
        const changes: string[][] = [];
        const { input } = await setup({ initial: ['Apple', 'Banana'], changes });
        await userEvent.click(document.querySelector<HTMLElement>('[data-token] [aria-hidden=true]')!);
        expect(changes.at(-1)).toEqual(['Banana']);
        input.focus();
        await userEvent.keyboard('{Backspace}{Backspace}');
        await frame();
        expect(changes.at(-1)).toEqual([]);
        // the focus goes back to the input once no token is left
        expect(document.activeElement).toBe(input);
    });

    it('closes with Escape and collapses the tokens when the focus leaves', async () => {
        const { input, screen } = await setup({ initial: values(20), dropdownValues: values(20), maxVisibleTokens: 5 });
        await userEvent.type(input, 'i');
        expect(tokens()).toHaveLength(20);
        await userEvent.keyboard('{Escape}');
        expect(input.getAttribute('aria-expanded')).toBe('false');
        expect(input.value).toBe('');
        await userEvent.click(screen.container.querySelector<HTMLElement>('#after')!);
        expect(tokens()).toHaveLength(5);
    });

    it('shows the placeholder while nothing is selected', async () => {
        const screen = await render(
            <MultiInput aria-label="Values" placeholder="Search fruits" dropdownValues={FRUITS} />
        );
        const input = () => screen.container.querySelector('input')!;
        expect(input().getAttribute('placeholder')).toBe('Search fruits');
        await screen.rerender(<MultiInput aria-label="Values" placeholder="Type a fruit" dropdownValues={FRUITS} />);
        expect(input().getAttribute('placeholder')).toBe('Type a fruit');
        await screen.rerender(
            <MultiInput aria-label="Values" placeholder="Type a fruit" dropdownValues={FRUITS} selected={['Apple']} />
        );
        expect(input().hasAttribute('placeholder')).toBe(false);
    });

    it('emits onSearchTermChange while typing and when the search clears', async () => {
        const terms: string[] = [];
        const { input } = await setup({ autoComplete: false, onSearchTermChange: (t) => terms.push(t) });
        await userEvent.type(input, 'ap');
        expect(terms).toEqual(['a', 'ap']);
        expect(optionTexts()).toEqual(['Apple', 'Apricot']);
        await userEvent.keyboard('{Escape}');
        expect(terms).toEqual(['a', 'ap', '']);
    });

    it('the addon button opens and closes the list and keeps the focus in the input', async () => {
        let clicks = 0;
        const { input, addon } = await setup({ autoComplete: false, onAddOnButtonClick: () => clicks++ });
        expect(addon().getAttribute('aria-label')).toBe('Show options');
        expect(addon().tabIndex).toBe(-1);
        await userEvent.click(addon());
        expect(listOpen()).toBe(true);
        expect(optionTexts()).toHaveLength(4);
        expect(input.getAttribute('aria-expanded')).toBe('true');
        expect(input.getAttribute('aria-controls')).toBe(document.querySelector('ul[role=listbox]')!.id);
        expect(addon().getAttribute('aria-expanded')).toBe('true');
        expect(document.activeElement).toBe(input);
        expect(clicks).toBe(1);
        await userEvent.click(addon());
        await expect.poll(listOpen).toBe(false);
        expect(input.getAttribute('aria-expanded')).toBe('false');
        expect(clicks).toBe(2);
    });

    it('openDropdownOnAddOnClicked=false only emits onAddOnButtonClick', async () => {
        let clicks = 0;
        const opens: boolean[] = [];
        const { input, addon } = await setup({
            openDropdownOnAddOnClicked: false,
            onAddOnButtonClick: () => clicks++,
            onOpenChange: (o) => opens.push(o)
        });
        await userEvent.click(addon());
        expect(clicks).toBe(1);
        expect(listOpen()).toBe(false);
        expect(input.getAttribute('aria-expanded')).toBe('false');
        expect(opens).toEqual([]);
    });

    it('Show All lists every option after filtering and clears the search', async () => {
        const terms: string[] = [];
        const { input } = await setup({ autoComplete: false, onSearchTermChange: (t) => terms.push(t) });
        await userEvent.type(input, 'b');
        expect(optionTexts()).toEqual(['Banana']);
        const showAll = () => document.querySelector<HTMLAnchorElement>('[data-slot=link], a[href]');
        expect(showAll()!.textContent?.trim()).toBe('Show All (4)');
        await userEvent.click(showAll()!);
        expect(optionTexts()).toEqual(FRUITS);
        expect(input.value).toBe('');
        expect(terms.at(-1)).toBe('');
        expect(document.activeElement).toBe(input);
        expect(showAll()).toBeNull();
    });

    it('displayFn and valueFn map objects to tokens and values', async () => {
        interface Product {
            id: number;
            name: string;
        }
        const products: Product[] = [
            { id: 1, name: 'Laptop' },
            { id: 2, name: 'Monitor' },
            { id: 3, name: 'Mouse' }
        ];
        const changes: number[][] = [];
        const { input } = await setup<Product, number>({
            dropdownValues: products,
            displayFn: (p) => p.name,
            valueFn: (p) => p.id,
            autoComplete: false,
            initial: [2],
            changes
        });
        expect(tokens()).toEqual(['Monitor']);
        await userEvent.type(input, 'm');
        expect(optionTexts()).toEqual(['Monitor', 'Mouse']);
        expect(options()[0].getAttribute('aria-selected')).toBe('true');
        await userEvent.click(options()[1]);
        expect(changes.at(-1)).toEqual([2, 3]);
        expect(tokens()).toEqual(['Monitor', 'Mouse']);
    });

    it('uses the label and value of option items without functions', async () => {
        const items = [
            { label: 'Apple', value: 'apple_value' },
            { label: 'Kiwi', value: 'kiwi_value' }
        ];
        const changes: string[][] = [];
        const { addon } = await setup<(typeof items)[number], string>({ dropdownValues: items, changes });
        await userEvent.click(addon());
        expect(optionTexts()).toEqual(['Apple', 'Kiwi']);
        await userEvent.click(options()[1]);
        expect(changes.at(-1)).toEqual(['kiwi_value']);
        expect(tokens()).toEqual(['Kiwi']);
    });

    it('keeps the selection when dropdownValues change', async () => {
        const changes: string[][] = [];
        const { input, screen } = await setup({
            dropdownValues: ['foo', 'baz', 'bar'],
            initial: ['foo1'],
            autoComplete: false,
            changes
        });
        expect(tokens()).toEqual(['foo1']);
        input.focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(optionTexts()).toEqual(['foo', 'baz', 'bar']);
        await userEvent.click(options()[1]);
        expect(changes.at(-1)).toEqual(['foo1', 'baz']);
        await screen.rerender(
            <Host dropdownValues={['foo1']} initial={['foo1']} autoComplete={false} changes={changes} />
        );
        expect(optionTexts()).toEqual(['foo1']);
        expect(options()[0].getAttribute('aria-selected')).toBe('true');
        expect(tokens()).toEqual(['foo1', 'baz']);
    });

    it('select all and deselect all emit onAllItemsSelectedChange', async () => {
        const all: boolean[] = [];
        const changes: string[][] = [];
        const actions = createRef<MultiInputActions>();
        await setup({ actionsRef: actions, onAllItemsSelectedChange: (a) => all.push(a), changes });
        expect(all).toEqual([false]);
        actions.current!.selectAllItems(true);
        await expect.poll(() => tokens()).toHaveLength(4);
        expect(changes.at(-1)).toEqual(FRUITS);
        expect(all).toEqual([false, true]);
        actions.current!.selectAllItems(false);
        await expect.poll(() => tokens()).toHaveLength(0);
        expect(changes.at(-1)).toEqual([]);
        expect(all).toEqual([false, true, false]);
    });

    it('opens and closes through actionsRef and the open prop', async () => {
        const actions = createRef<MultiInputActions>();
        const opens: boolean[] = [];
        const { input, screen } = await setup({ actionsRef: actions, onOpenChange: (o) => opens.push(o) });
        actions.current!.open();
        await expect.poll(listOpen).toBe(true);
        actions.current!.close();
        await expect.poll(listOpen).toBe(false);
        expect(opens).toEqual([true, false]);
        await screen.rerender(<Host open />);
        await expect.poll(listOpen).toBe(true);
        expect(input.getAttribute('aria-expanded')).toBe('true');
    });

    it('a disabled multi input is not focusable or clickable until re-enabled', async () => {
        const { screen, input, addon } = await setup({ initial: ['Apple'], disabled: true });
        const field = addon().parentElement!;
        expect(input.disabled).toBe(true);
        expect(getComputedStyle(field).pointerEvents).toBe('none');
        expect(Number(getComputedStyle(field).opacity)).toBeLessThan(1);
        screen.container.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(screen.container.querySelector('#after'));
        addon().click();
        await wait();
        expect(listOpen()).toBe(false);
        await screen.rerender(<Host initial={['Apple']} />);
        expect(input.disabled).toBe(false);
        expect(getComputedStyle(field).pointerEvents).not.toBe('none');
        screen.container.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(input);
    });

    it('renders maxVisibleTokens tokens plus "+N more" until focused, and collapses on an outside blur', async () => {
        const { screen, input } = await setup({ width: 2400, dropdownValues: values(50), initial: values(50) });
        expect(tokens()).toHaveLength(12);
        expect(more()).toHaveLength(1);
        expect(more()[0].textContent?.trim()).toBe('38 more');

        input.focus();
        await expect.poll(() => tokens()).toHaveLength(50);
        expect(more()).toHaveLength(0);

        // a click on a token stays inside the multi input
        await userEvent.click(document.querySelector<HTMLElement>('[data-token]')!);
        expect(tokens()).toHaveLength(50);

        await userEvent.click(screen.container.querySelector<HTMLElement>('#after')!);
        expect(tokens()).toHaveLength(12);
        expect(more()).toHaveLength(1);

        await screen.rerender(<Host width={2400} dropdownValues={values(50)} initial={values(8)} key="eight" />);
        expect(tokens()).toHaveLength(8);
        expect(more()).toHaveLength(0);
    });

    it('"+N more" is a button activated by Enter and Space', async () => {
        const { screen, input } = await setup({
            width: 2400,
            dropdownValues: values(20),
            initial: values(20),
            maxVisibleTokens: 5
        });
        const after = screen.container.querySelector<HTMLElement>('#after')!;
        for (const key of ['{Enter}', ' ']) {
            expect(tokens()).toHaveLength(5);
            const link = more()[0];
            expect(link.getAttribute('role')).toBe('button');
            expect(link.getAttribute('tabindex')).toBe('0');
            expect(link.textContent?.trim()).toBe('15 more');
            let prevented: boolean | null = null;
            link.addEventListener('keydown', (e) => setTimeout(() => (prevented = e.defaultPrevented)));
            link.focus();
            await userEvent.keyboard(key);
            await expect.poll(() => tokens()).toHaveLength(20);
            expect(more()).toHaveLength(0);
            // the list shows only the selected values and the focus moves to the input
            expect(optionTexts()).toHaveLength(20);
            expect(options().every((o) => o.getAttribute('aria-selected') === 'true')).toBe(true);
            expect(document.activeElement).toBe(input);
            await wait();
            if (key === ' ') expect(prevented).toBe(true);
            await userEvent.keyboard('{Escape}');
            after.focus();
            await expect.poll(() => tokens()).toHaveLength(5);
        }
    });

    it('selects a range with Shift clicks', async () => {
        const changes: string[][] = [];
        const { addon } = await setup({ changes });
        await userEvent.click(addon());
        await userEvent.click(options()[0]);
        await userEvent.click(options()[2], { modifiers: ['Shift'] });
        expect(changes.at(-1)).toEqual(['Apple', 'Apricot', 'Banana']);
        // a Shift click on a selected option deselects the range from the last click
        await userEvent.click(options()[1], { modifiers: ['Shift'] });
        expect(changes.at(-1)).toEqual(['Apple']);
    });

    it('moves the highlight with Up and Down and closes with Alt+Up and Tab', async () => {
        const { input } = await setup();
        input.focus();
        await userEvent.keyboard('{ArrowUp}');
        expect(listOpen()).toBe(true);
        expect(input.hasAttribute('aria-activedescendant')).toBe(false);
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[3].id);
        await userEvent.keyboard('{ArrowUp}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[2].id);
        await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');
        await expect.poll(listOpen).toBe(false);
        await userEvent.keyboard('{ArrowDown}');
        expect(listOpen()).toBe(true);
        await userEvent.tab();
        await expect.poll(listOpen).toBe(false);
    });

    it('closes the list on a click outside but not on a click in the field', async () => {
        const { input, screen } = await setup({ autoComplete: false });
        await userEvent.type(input, 'a');
        expect(listOpen()).toBe(true);
        await userEvent.click(input);
        expect(listOpen()).toBe(true);
        await userEvent.click(screen.container.querySelector<HTMLElement>('#before')!);
        await expect.poll(listOpen).toBe(false);
        expect(input.value).toBe('');
    });

    it('renders the options with renderItem and without highlight', async () => {
        const { input } = await setup({
            autoComplete: false,
            renderItem: (item) => <span data-testid="item">{`${item}!`}</span>
        });
        await userEvent.type(input, 'ch');
        expect(optionTexts()).toEqual(['Cherry!']);
        expect(options()[0].querySelector('b')).toBeNull();
    });

    it('matches any part of the text with includes, and with a custom filterFn', async () => {
        const { input, screen } = await setup({ includes: true });
        await userEvent.type(input, 'an');
        expect(optionTexts()).toEqual(['Banana']);
        expect(input.value).toBe('an');
        expect(input.getAttribute('aria-autocomplete')).toBe('list');
        expect(options()[0].querySelector('b')!.textContent).toBe('an');
        await screen.rerender(
            <Host autoComplete={false} filterFn={(items, term) => items.filter((item) => item.startsWith(term))} />
        );
        await userEvent.clear(input);
        await userEvent.type(input, 'a');
        await expect.poll(listOpen).toBe(false);
        await userEvent.clear(input);
        await userEvent.type(input, 'A');
        expect(optionTexts()).toEqual(['Apple', 'Apricot']);
    });

    it('labels the input and the list, and marks required and invalid fields', async () => {
        const { input, addon } = await setup({
            'aria-label': undefined,
            'aria-labelledby': 'label',
            'aria-describedby': 'help',
            required: true,
            state: 'error',
            title: 'Fruits field',
            inputId: 'fruits'
        });
        expect(input.id).toBe('fruits');
        expect(input.getAttribute('aria-labelledby')).toBe('label');
        expect(input.getAttribute('aria-describedby')).toBe('help');
        expect(input.getAttribute('aria-required')).toBe('true');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.getAttribute('aria-haspopup')).toBe('listbox');
        expect(input.title).toBe('Fruits field');
        await userEvent.click(addon());
        expect(document.querySelector('ul[role=listbox]')!.getAttribute('aria-labelledby')).toBe('label');
    });

    it('hides the addon button with displayAddonButton false and makes it focusable with buttonFocusable', async () => {
        const { screen } = await setup({ displayAddonButton: false });
        expect(screen.container.querySelector('button[aria-haspopup]')).toBeNull();
        await screen.rerender(<Host buttonFocusable addOnButtonAriaLabel="Value help" addonIconTitle="Help" />);
        const button = screen.container.querySelector<HTMLButtonElement>('button[aria-haspopup]')!;
        expect(button.tabIndex).toBe(0);
        expect(button.getAttribute('aria-label')).toBe('Value help');
        expect(button.title).toBe('Help');
    });

    it('opens the list above the field with placement top, and limits its width', async () => {
        const screen = await render(
            <div style={{ paddingTop: 400, width: 300 }}>
                <MultiInput aria-label="Fruits" dropdownValues={FRUITS} placement="top" bodyMaxWidth={150} />
            </div>
        );
        const addon = () => screen.container.querySelector<HTMLButtonElement>('button[aria-haspopup]')!;
        await userEvent.click(addon());
        const list = document.querySelector<HTMLElement>('ul[role=listbox]')!;
        const field = addon().parentElement!.getBoundingClientRect();
        await expect.poll(() => list.getBoundingClientRect().bottom <= field.top + 1).toBe(true);
        expect(list.closest<HTMLElement>('[data-side]')!.getBoundingClientRect().width).toBeLessThanOrEqual(150);
    });

    it('in a dialog, opens its list above the dialog and closes only the list with Escape', async () => {
        const screen = await render(
            <Dialog defaultOpen>
                <DialogPopup>
                    <DialogTitle>Fruits</DialogTitle>
                    <DialogBody>
                        <MultiInput aria-label="Fruits" dropdownValues={FRUITS} autoComplete={false} />
                    </DialogBody>
                </DialogPopup>
            </Dialog>
        );
        const dialog = () => document.querySelector<HTMLElement>('[role=dialog]');
        await expect.poll(dialog).not.toBeNull();
        const input = dialog()!.querySelector<HTMLInputElement>('input[role=combobox]')!;
        await userEvent.type(input, 'a');
        expect(listOpen()).toBe(true);
        const option = options()[0].getBoundingClientRect();
        const hit = document.elementFromPoint(option.left + option.width / 2, option.top + option.height / 2);
        expect(options()[0].contains(hit)).toBe(true);
        await userEvent.click(options()[0]);
        expect(tokens()).toEqual(['Apple']);
        await userEvent.keyboard('{Escape}');
        await expect.poll(listOpen).toBe(false);
        await wait(100);
        expect(dialog()).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await expect.poll(dialog).toBeNull();
        screen.unmount();
    });

    it('the mobile dialog applies the selection on approve and restores it on cancel', async () => {
        const config: MultiInputMobileConfig = {
            title: 'Fruits',
            approveButtonText: 'Select',
            cancelButtonText: 'Cancel'
        };
        const changes: string[][] = [];
        const { input, addon } = await setup({ mobile: true, mobileConfig: config, initial: ['Banana'], changes });
        const dialog = () => document.querySelector<HTMLElement>('[role=dialog]');
        const footerButton = (label: string) =>
            [...dialog()!.querySelectorAll<HTMLButtonElement>('[data-dialog-footer] button')].find((b) =>
                b.textContent?.trim().startsWith(label)
            )!;
        expect(input.getAttribute('aria-haspopup')).toBe('dialog');
        expect(addon().getAttribute('aria-haspopup')).toBe('dialog');

        await userEvent.click(addon());
        await expect.poll(dialog).not.toBeNull();
        expect(dialog()!.querySelector('h1')!.textContent).toBe('Fruits');
        expect(dialog()!.getAttribute('aria-labelledby')).toBe(dialog()!.querySelector('h1')!.id);
        const dialogInput = dialog()!.querySelector<HTMLInputElement>('input[role=combobox]')!;
        await expect.poll(() => document.activeElement).toBe(dialogInput);
        await userEvent.click(options()[0]);
        expect(tokens()).toContain('Apple');
        expect(changes).toEqual([]);
        await userEvent.click(footerButton('Cancel'));
        await expect.poll(dialog).toBeNull();
        expect(changes).toEqual([]);
        expect(tokens()).toEqual(['Banana']);

        await userEvent.click(addon());
        await expect.poll(dialog).not.toBeNull();
        await userEvent.click(options()[3]);
        expect(changes).toEqual([]);
        await userEvent.click(footerButton('Select'));
        await expect.poll(dialog).toBeNull();
        expect(changes).toEqual([['Banana', 'Cherry']]);
        expect(tokens()).toEqual(['Banana', 'Cherry']);
        await expect.poll(() => document.activeElement).toBe(input);
    });

    it('the mobile dialog opens from the keyboard, selects all and applies right away without approve button', async () => {
        const changes: string[][] = [];
        const { input } = await setup({
            mobile: true,
            mobileConfig: { title: 'Fruits', cancelButtonText: 'Close list' },
            changes
        });
        input.focus();
        await userEvent.keyboard('a');
        const dialog = () => document.querySelector<HTMLElement>('[role=dialog]');
        await expect.poll(dialog).not.toBeNull();
        expect(input.getAttribute('aria-expanded')).toBe('true');
        const selectAll = dialog()!.querySelector<HTMLButtonElement>('button[aria-pressed]')!;
        expect(selectAll.getAttribute('aria-label')).toBe('Select all');
        expect(selectAll.getAttribute('aria-pressed')).toBe('false');
        await userEvent.click(selectAll);
        expect(changes.at(-1)).toEqual(FRUITS);
        expect(selectAll.getAttribute('aria-pressed')).toBe('true');
        await userEvent.click(selectAll);
        expect(changes.at(-1)).toEqual([]);
        // the list in the dialog takes the keys of its input
        const list = dialog()!.querySelector<HTMLElement>('ul[role=listbox]')!;
        list.focus();
        await userEvent.keyboard('{ArrowDown}{Enter}');
        expect(changes.at(-1)).toEqual(['Apple']);
        expect(list.getAttribute('aria-activedescendant')).toBe(options()[0].id);
        // the close button closes the dialog
        await userEvent.click(dialog()!.querySelector<HTMLButtonElement>('button[aria-label=Close]')!);
        await expect.poll(dialog).toBeNull();
        expect(changes.at(-1)).toEqual(['Apple']);
    });

    it('shows one value state message in a form input message group, which describes the input (fundamental-react)', async () => {
        const screen = await render(
            <FormInputMessageGroup>
                <MultiInput aria-label="Fruits" dropdownValues={FRUITS} state="error" />
                <FormMessage type="error">Test validation state</FormMessage>
            </FormInputMessageGroup>
        );
        const input = screen.container.querySelector('input')!;
        await userEvent.click(input);
        input.focus();
        const shown = () =>
            [...document.querySelectorAll<HTMLElement>('[data-slot="form-message"]')].filter((m) =>
                m.checkVisibility()
            );
        await expect.poll(() => shown()).toHaveLength(1);
        expect(input.getAttribute('aria-describedby')).toBe(shown()[0].id);
        expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('works uncontrolled with defaultSelected', async () => {
        const screen = await render(
            <MultiInput aria-label="Fruits" dropdownValues={FRUITS} defaultSelected={['Kiwi']} autoComplete={false} />
        );
        expect(tokens()).toEqual(['Kiwi']);
        const input = screen.container.querySelector('input')!;
        // without autoComplete Enter does not take the first match
        await userEvent.type(input, 'b{Enter}');
        expect(tokens()).toEqual(['Kiwi']);
        await userEvent.keyboard('{Escape}{ArrowDown}{ArrowDown}{Enter}');
        expect(tokens()).toEqual(['Kiwi', 'Apple']);
    });

    it('is shorter in compact density (fundamental-react compact)', async () => {
        const { addon } = await setup();
        const field = addon().parentElement!;
        const cozy = field.getBoundingClientRect().height;
        document.documentElement.setAttribute('data-density', 'compact');
        await wait();
        expect(field.getBoundingClientRect().height).toBeLessThan(cozy);
    });

    it('passes native props, className and the ref to the root, and the part props to their elements (fundamental-react)', async () => {
        const ref = createRef<HTMLDivElement>();
        const inputRef = createRef<HTMLInputElement>();
        const screen = await render(
            <MultiInput
                ref={ref}
                inputRef={inputRef}
                aria-label="Fruits"
                className="blue"
                data-sample="Sample"
                dropdownValues={FRUITS}
                defaultSelected={['Apple']}
                inputProps={{ 'data-sample': 'Input' } as object}
                tokenizerProps={{ 'data-sample': 'Tokens' } as object}
                listProps={{ 'data-sample': 'List' } as object}
                popoverProps={{ 'data-sample': 'Popover' } as object}
            />
        );
        const root = screen.container.firstElementChild as HTMLElement;
        expect(ref.current).toBe(root);
        expect(root.classList.contains('blue')).toBe(true);
        expect(root.dataset['sample']).toBe('Sample');
        expect(inputRef.current).toBe(screen.container.querySelector('input'));
        expect(inputRef.current!.dataset['sample']).toBe('Input');
        expect(root.querySelector<HTMLElement>('[data-sample=Tokens]')).not.toBeNull();
        await userEvent.click(screen.container.querySelector<HTMLButtonElement>('button[aria-haspopup]')!);
        expect(document.querySelector<HTMLElement>('ul[role=listbox]')!.dataset['sample']).toBe('List');
        expect(document.querySelector<HTMLElement>('[data-sample=Popover] ul[role=listbox]')).not.toBeNull();
    });

    it('lists the options with a check box and truncates tokens beyond maxVisibleTokens (fundamental-react)', async () => {
        const changes: string[][] = [];
        const { addon } = await setup({ maxVisibleTokens: 3, dropdownValues: ['A1', 'A2', 'A3', 'A4'], changes });
        await userEvent.click(addon());
        for (const index of [0, 1, 2, 3]) await userEvent.click(options()[index]);
        expect(changes.at(-1)).toEqual(['A1', 'A2', 'A3', 'A4']);
        expect(options()[0].querySelector('[aria-hidden=true][data-glyph]')!.getAttribute('data-glyph')).not.toBe('');
        await userEvent.click(document.querySelector<HTMLElement>('#before')!);
        await expect.poll(() => tokens()).toHaveLength(3);
        expect(more()[0].textContent?.trim()).toBe('1 more');
        // unchecking removes the token
        await userEvent.click(addon());
        await userEvent.click(options()[0]);
        expect(changes.at(-1)).toEqual(['A2', 'A3', 'A4']);
    });
});
