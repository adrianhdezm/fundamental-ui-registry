import { createRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Dialog, DialogBody, DialogPopup, DialogTitle } from '@/ui/dialog/dialog';
import {
    MultiCombobox,
    type MultiComboboxActions,
    type MultiComboboxMobileConfig,
    type MultiComboboxProps
} from './multi-combobox';

interface Item {
    id: number;
    name: string;
    type: string;
}

const ITEMS: Item[] = [
    { id: 1, name: 'Apple', type: 'Fruit' },
    { id: 2, name: 'Banana', type: 'Fruit' },
    { id: 3, name: 'Red Pepper', type: 'Vegetable' },
    { id: 4, name: 'Spinach', type: 'Vegetable' }
];

const wait = (ms = 50) => new Promise((r) => setTimeout(r, ms));
const options = () => [...document.querySelectorAll<HTMLElement>('ul[role=listbox] [role=option]')];
const optionTexts = () => options().map((o) => o.textContent?.trim());
const tokens = () => [...document.querySelectorAll<HTMLElement>('[data-token]')].map((t) => t.textContent?.trim());
const names = (items: Item[] | undefined) => (items ?? []).map((i) => i.name);
const listOpen = () => !!document.querySelector('ul[role=listbox]');
const more = () => document.querySelectorAll<HTMLElement>('[data-tokenizer-more]');
const dialog = () => document.querySelector<HTMLElement>('[role=dialog]');
const dialogButton = (label: string) =>
    [...document.querySelectorAll<HTMLButtonElement>('[role=dialog] button')].find(
        (b) => b.textContent?.trim().startsWith(label) || b.getAttribute('aria-label') === label
    );

interface HostProps<T> extends Partial<MultiComboboxProps<T>> {
    initial?: T[];
    width?: number;
    changes?: T[][];
}

/** A controlled multi-combobox that records its changes, between two buttons (Angular's hosts with a form control). */
function Host<T = Item>({ initial = [], width = 400, changes = [], onSelectedItemsChange, ...props }: HostProps<T>) {
    const [selected, setSelected] = useState<T[]>(initial);
    return (
        <>
            <button type="button" id="before">
                Before
            </button>
            <div style={{ width }}>
                <MultiCombobox<T>
                    aria-label="Food"
                    displayKey="name"
                    lookupKey="id"
                    dataSource={ITEMS as T[]}
                    selectedItems={selected}
                    onSelectedItemsChange={(next) => {
                        changes.push(next);
                        setSelected(next);
                        onSelectedItemsChange?.(next);
                    }}
                    {...props}
                />
            </div>
            <button type="button" id="after">
                Outside
            </button>
        </>
    );
}

async function setup<T = Item>(props: HostProps<T> = {}) {
    const screen = await render(<Host<T> {...props} />);
    const input = screen.container.querySelector<HTMLInputElement>('input[role=combobox]')!;
    const addon = () => screen.container.querySelector<HTMLButtonElement>('button[aria-haspopup]')!;
    return { screen, input, addon };
}

describe('MultiCombobox', () => {
    it('shows the chosen items as tokens', async () => {
        const { screen } = await setup({ initial: [ITEMS[1]] });
        expect(tokens()).toEqual(['Banana']);
        await screen.rerender(<Host key="two" initial={[ITEMS[0], ITEMS[3]]} />);
        expect(tokens()).toEqual(['Apple', 'Spinach']);
    });

    it('filters by the start of any word', async () => {
        const { input } = await setup({ autoComplete: false });
        await userEvent.type(input, 'pe');
        expect(input.getAttribute('aria-expanded')).toBe('true');
        expect(optionTexts()).toEqual(['Red Pepper']);
        expect(options()[0].querySelector('b')!.textContent).toBe('Pe');
    });

    it('matches the start of the text with startsWith, and any part with contains', async () => {
        const { input, screen } = await setup({ autoComplete: false, matchingStrategy: 'startsWith' });
        await userEvent.type(input, 'pe');
        // nothing starts with "p": the text is rejected
        expect(input.value).toBe('');
        await userEvent.type(input, 'sp');
        expect(optionTexts()).toEqual(['Spinach']);
        await userEvent.clear(input);
        await screen.rerender(<Host autoComplete={false} matchingStrategy="contains" />);
        await userEvent.type(input, 'na');
        expect(optionTexts()).toEqual(['Banana', 'Spinach']);
    });

    it('rejects text that matches nothing with a brief error', async () => {
        const { input, screen } = await setup({ invalidEntryDisplayTime: 200, autoComplete: false });
        await userEvent.type(input, 'a');
        await userEvent.keyboard('z');
        expect(input.value).toBe('a');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(screen.container.textContent).toContain('Invalid entry');
        // the message describes the input and shows on top of the open list
        expect(document.getElementById(input.getAttribute('aria-describedby')!)!.textContent).toBe('Invalid entry');
        expect(document.querySelector('[data-slot=list-message]')!.textContent).toBe('Invalid entry');
        await wait(300);
        await expect.poll(() => input.getAttribute('aria-invalid')).toBeNull();
        expect(input.hasAttribute('aria-describedby')).toBe(false);
    });

    it('toggles options with the keyboard and the mouse', async () => {
        const changes: Item[][] = [];
        const { input } = await setup({ initial: [ITEMS[1]], changes });
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await userEvent.keyboard('{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[0].id);
        expect(options()[0].hasAttribute('data-active')).toBe(true);
        await userEvent.keyboard(' ');
        expect(names(changes.at(-1))).toEqual(['Banana', 'Apple']);
        expect(input.getAttribute('aria-expanded')).toBe('true');
        // a click on the check box keeps the list open
        await userEvent.click(options()[2].querySelector<HTMLElement>('[aria-hidden=true]')!);
        expect(names(changes.at(-1))).toEqual(['Banana', 'Apple', 'Red Pepper']);
        expect(listOpen()).toBe(true);
        // a click on the option closes it
        await userEvent.click(options()[1]);
        expect(names(changes.at(-1))).toEqual(['Apple', 'Red Pepper']);
        await expect.poll(listOpen).toBe(false);
        expect(input.getAttribute('aria-expanded')).toBe('false');
        expect(changes).toHaveLength(3);
        expect(document.activeElement).toBe(input);
    });

    it('Enter toggles the highlighted option and closes the list', async () => {
        const changes: Item[][] = [];
        const { input } = await setup({ changes });
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}{ArrowDown}{ArrowDown}{Enter}');
        expect(names(changes.at(-1))).toEqual(['Banana']);
        await expect.poll(listOpen).toBe(false);
    });

    it('chooses the item named by the text with Enter', async () => {
        const changes: Item[][] = [];
        const { input } = await setup({ initial: [ITEMS[1]], changes, autoComplete: false });
        await userEvent.type(input, 'spinach{Enter}');
        expect(names(changes.at(-1))).toEqual(['Banana', 'Spinach']);
        expect(input.value).toBe('');
    });

    it('completes the typed text with the first match, which Enter chooses', async () => {
        const changes: Item[][] = [];
        const { input } = await setup({ changes });
        await userEvent.type(input, 're');
        await expect.poll(() => input.value).toBe('Red Pepper');
        // the completed part is selected, so typing replaces it
        expect([input.selectionStart, input.selectionEnd]).toEqual([2, 10]);
        expect(input.getAttribute('aria-autocomplete')).toBe('both');
        // the list filters by the typed text
        expect(optionTexts()).toEqual(['Red Pepper']);
        await userEvent.keyboard('{Enter}');
        expect(names(changes.at(-1))).toEqual(['Red Pepper']);
        expect(input.value).toBe('');
    });

    it('Down and Up in a closed field put the next item that is not chosen in the input', async () => {
        const changes: Item[][] = [];
        const { input } = await setup({ initial: [ITEMS[1]], changes });
        input.focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(listOpen()).toBe(false);
        expect(input.value).toBe('Apple');
        // Banana is chosen: it is skipped
        await userEvent.keyboard('{ArrowDown}');
        expect(input.value).toBe('Red Pepper');
        await userEvent.keyboard('{ArrowUp}');
        expect(input.value).toBe('Apple');
        await userEvent.keyboard('{Enter}');
        expect(names(changes.at(-1))).toEqual(['Banana', 'Apple']);
        expect(input.value).toBe('');
    });

    it('selects all with the select all option and Ctrl+A, and deselects all with Ctrl+Shift+A', async () => {
        const changes: Item[][] = [];
        const { input } = await setup({ showSelectAll: true, initial: [ITEMS[1]], changes });
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        expect(options()[0].textContent).toContain('Select All (1/4)');
        expect(options()[0].querySelector('[data-indeterminate]')).not.toBeNull();
        // Down highlights the select all option first
        await userEvent.keyboard('{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[0].id);
        await userEvent.keyboard('{ArrowDown}{ArrowUp}{ArrowUp}');
        expect(input.hasAttribute('aria-activedescendant')).toBe(false);
        await userEvent.click(options()[0]);
        expect(changes.at(-1)).toHaveLength(4);
        expect(options()[0].getAttribute('aria-selected')).toBe('true');
        input.focus();
        await userEvent.keyboard('{ArrowDown}{Control>}{Shift>}a{/Shift}{/Control}');
        expect(changes.at(-1)).toEqual([]);
        await userEvent.keyboard('{Control>}a{/Control}');
        expect(changes.at(-1)).toHaveLength(4);
        await userEvent.keyboard('{Escape}');
        await expect.poll(listOpen).toBe(false);
        // without a highlighted option Ctrl+A is the input's
        await userEvent.keyboard('{Control>}{Shift>}a{/Shift}{/Control}');
        expect(changes.at(-1)).toHaveLength(4);
    });

    it('groups the options under headers', async () => {
        const { input } = await setup({ group: true, groupKey: 'type' });
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        const groups = [...document.querySelectorAll<HTMLElement>('ul[role=listbox] [role=group]')];
        expect(groups).toHaveLength(2);
        // a list may take the group role (an li may not), inside a presentational li
        expect(groups.map((g) => g.tagName)).toEqual(['UL', 'UL']);
        expect(groups[0].parentElement!.getAttribute('role')).toBe('none');
        expect(groups.map((g) => g.querySelectorAll('[role=option]').length)).toEqual([2, 2]);
        expect(document.getElementById(groups[1].getAttribute('aria-labelledby')!)?.textContent?.trim()).toBe(
            'Vegetable'
        );
        // the header is a list group header: its title in the header font, on a 2rem line at the bottom
        const header = document.getElementById(groups[0].getAttribute('aria-labelledby')!)!;
        const title = header.querySelector<HTMLElement>('[data-slot=list-title]')!;
        expect(header.getAttribute('role')).toBe('presentation');
        expect(header.hasAttribute('tabindex')).toBe(false);
        expect(getComputedStyle(header).alignItems).toBe('flex-end');
        expect(getComputedStyle(title).lineHeight).toBe('32px');
        expect(getComputedStyle(title).fontWeight).toBe('700');
        expect(title.getBoundingClientRect().bottom).toBeCloseTo(header.getBoundingClientRect().bottom - 1, 0);
        // the arrows run through the groups
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[2].id);
    });

    it('the addon button opens and closes the list and keeps the focus in the input', async () => {
        let clicks = 0;
        const { input, addon } = await setup({ onAddOnButtonClick: () => clicks++ });
        expect(addon().getAttribute('aria-label')).toBe('Show options');
        expect(addon().tabIndex).toBe(-1);
        await userEvent.click(addon());
        expect(input.getAttribute('aria-expanded')).toBe('true');
        expect(input.getAttribute('aria-controls')).toBe(document.querySelector('ul[role=listbox]')!.id);
        expect(addon().getAttribute('aria-expanded')).toBe('true');
        expect(options()).toHaveLength(4);
        expect(document.activeElement).toBe(input);
        await userEvent.click(addon());
        await expect.poll(listOpen).toBe(false);
        expect(input.getAttribute('aria-expanded')).toBe('false');
        expect(clicks).toBe(2);
    });

    it('openDropdownOnAddOnClicked=false keeps the list closed', async () => {
        let clicks = 0;
        const opens: boolean[] = [];
        const { input, addon } = await setup({
            openDropdownOnAddOnClicked: false,
            onAddOnButtonClick: () => clicks++,
            onOpenChange: (o) => opens.push(o)
        });
        await userEvent.click(addon());
        expect(input.getAttribute('aria-expanded')).toBe('false');
        expect(options()).toHaveLength(0);
        expect(clicks).toBe(1);
        expect(opens).toEqual([]);
    });

    it('limitless shows every item, otherwise mapLimit', async () => {
        const many = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
        const { addon, screen } = await setup<string>({ dataSource: many, displayKey: '', lookupKey: '' });
        await userEvent.click(addon());
        expect(options()).toHaveLength(12);
        await userEvent.click(addon());
        await screen.rerender(<Host<string> dataSource={many} limitless />);
        await userEvent.click(addon());
        expect(options()).toHaveLength(20);
        await userEvent.click(addon());
        await screen.rerender(<Host<string> dataSource={many} mapLimit={5} />);
        await userEvent.click(addon());
        expect(options()).toHaveLength(5);
    });

    it('shows secondary text in a second column', async () => {
        const { addon, screen } = await setup({ secondaryKey: 'type', showSecondaryText: true });
        await userEvent.click(addon());
        const cells = [...options()[2].querySelectorAll<HTMLElement>('span[title]')];
        expect(cells.map((c) => c.textContent?.trim())).toEqual(['Red Pepper', 'Vegetable']);
        expect(getComputedStyle(cells[1]).textAlign).toBe('end');
        expect(cells[1].getBoundingClientRect().right).toBeGreaterThan(cells[0].getBoundingClientRect().right);
        await screen.rerender(<Host secondaryKey="type" showSecondaryText secondaryTextAlignment="left" />);
        expect(getComputedStyle(options()[2].querySelectorAll<HTMLElement>('span[title]')[1]).textAlign).toBe('start');
    });

    it('filters the new items after the dataSource is replaced, and handles an empty one', async () => {
        const { input, screen } = await setup({ autoComplete: false });
        await userEvent.type(input, 'b');
        expect(optionTexts()).toEqual(['Banana']);
        await userEvent.keyboard('{Escape}');
        const vegetables = [
            { id: 5, name: 'Beetroot', type: 'Vegetable' },
            { id: 6, name: 'Broccoli', type: 'Vegetable' },
            { id: 7, name: 'Carrot', type: 'Vegetable' }
        ];
        await screen.rerender(<Host autoComplete={false} dataSource={vegetables} />);
        await userEvent.type(input, 'b');
        expect(optionTexts()).toEqual(['Beetroot', 'Broccoli']);
        await userEvent.keyboard('r');
        expect(optionTexts()).toEqual(['Broccoli']);
        await userEvent.clear(input);
        expect(optionTexts()).toEqual(['Beetroot', 'Broccoli', 'Carrot']);

        await userEvent.keyboard('{Escape}');
        await screen.rerender(<Host autoComplete={false} dataSource={[]} />);
        await userEvent.type(input, 'b');
        expect(input.value).toBe('');
        expect(screen.container.textContent).toContain('Invalid entry');
        expect(optionTexts()).toEqual([]);
    });

    it('the selectedItems prop adds, replaces and clears tokens and the checked options', async () => {
        let changes = 0;
        const props = { 'aria-label': 'Food', displayKey: 'name', lookupKey: 'id', dataSource: ITEMS };
        const screen = await render(
            <MultiCombobox<Item>
                {...props}
                selectedItems={[ITEMS[0], ITEMS[1]]}
                onSelectedItemsChange={() => changes++}
            />
        );
        const addon = () => screen.container.querySelector<HTMLButtonElement>('button[aria-haspopup]')!;
        const checked = () => options().filter((o) => o.getAttribute('aria-selected') === 'true');
        expect(tokens()).toEqual(['Apple', 'Banana']);

        await screen.rerender(<MultiCombobox<Item> {...props} selectedItems={[ITEMS[1]]} />);
        expect(tokens()).toEqual(['Banana']);
        await userEvent.click(addon());
        expect(checked().map((o) => o.textContent?.trim())).toEqual(['Banana']);
        await userEvent.click(addon());

        await screen.rerender(<MultiCombobox<Item> {...props} selectedItems={[]} />);
        expect(tokens()).toEqual([]);
        await userEvent.click(addon());
        expect(checked()).toEqual([]);
        expect(changes).toBe(0);
    });

    it('removing a token unchecks it in the open list and keeps the others', async () => {
        const changes: Item[][] = [];
        const { addon } = await setup({ initial: [ITEMS[0], ITEMS[2]], changes });
        await userEvent.click(addon());
        const token = [...document.querySelectorAll<HTMLElement>('[data-token]')].find((t) =>
            t.textContent?.includes('Apple')
        )!;
        await userEvent.click(token.querySelector<HTMLElement>('[aria-hidden=true]')!);
        expect(tokens()).toEqual(['Red Pepper']);
        expect(names(changes.at(-1))).toEqual(['Red Pepper']);
        expect(options().map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true', 'false']);
    });

    it('removes tokens with Backspace, and the focus goes back to the input', async () => {
        const changes: Item[][] = [];
        const { input } = await setup({ initial: [ITEMS[0]], changes });
        input.focus();
        await userEvent.keyboard('{Backspace}{Backspace}');
        expect(changes.at(-1)).toEqual([]);
        await expect.poll(() => document.activeElement).toBe(input);
    });

    it('renders the chosen items once the data arrives (Angular: an observable dataSource)', async () => {
        const { screen, input } = await setup({ dataSource: [], initial: [ITEMS[1]] });
        expect(tokens()).toEqual(['Banana']);
        await screen.rerender(<Host initial={[ITEMS[1]]} />);
        expect(tokens()).toEqual(['Banana']);
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        expect(options().map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false', 'false']);
    });

    it('leaving the field with the exact text of an item chooses it and collapses the tokens', async () => {
        const many = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
        const changes: string[][] = [];
        const { input, screen } = await setup<string>({
            dataSource: many,
            initial: many.slice(0, 8),
            width: 1000,
            maxVisibleTokens: 5,
            autoComplete: false,
            changes
        });
        expect(tokens()).toHaveLength(5);
        expect(more()[0].textContent?.trim()).toBe('3 more');
        input.focus();
        await expect.poll(() => tokens()).toHaveLength(8);
        await userEvent.type(input, 'Item 12');
        await userEvent.click(screen.container.querySelector<HTMLElement>('#before')!);
        expect(changes.at(-1)).toEqual([...many.slice(0, 8), 'Item 12']);
        await expect.poll(listOpen).toBe(false);
        expect(input.value).toBe('');
        expect(tokens()).toHaveLength(5);
        expect(more()[0].textContent?.trim()).toBe('4 more');
        // a text that is not an exact label chooses nothing
        await userEvent.type(input, 'item 1');
        await userEvent.click(screen.container.querySelector<HTMLElement>('#before')!);
        expect(changes).toHaveLength(1);
    });

    it('the "n more" link lists only the chosen items', async () => {
        const many = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
        const { input } = await setup<string>({ dataSource: many, initial: many.slice(3, 10), maxVisibleTokens: 2 });
        await userEvent.click(more()[0]);
        await expect.poll(() => tokens()).toHaveLength(7);
        expect(optionTexts()).toEqual(many.slice(3, 10));
        expect(options().every((o) => o.getAttribute('aria-selected') === 'true')).toBe(true);
        expect(document.activeElement).toBe(input);
    });

    it('moves the highlight with Up and Down and closes with Escape, Alt+Up and Tab', async () => {
        const { input, screen } = await setup();
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        expect(input.hasAttribute('aria-activedescendant')).toBe(false);
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[3].id);
        await userEvent.keyboard('{ArrowUp}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[2].id);
        await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');
        await expect.poll(listOpen).toBe(false);
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        expect(listOpen()).toBe(true);
        await userEvent.keyboard('{Escape}');
        await expect.poll(listOpen).toBe(false);
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await userEvent.tab();
        await expect.poll(listOpen).toBe(false);
        expect(document.activeElement).toBe(screen.container.querySelector('#after'));
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

    it('selects a range with Shift clicks on the check boxes, and in the mobile dialog on the options', async () => {
        const changes: Item[][] = [];
        const { addon, screen } = await setup({ changes });
        const check = (index: number) => options()[index].querySelector<HTMLElement>('[aria-hidden=true]')!;
        await userEvent.click(addon());
        await userEvent.click(check(0));
        await userEvent.click(check(2), { modifiers: ['Shift'] });
        expect(names(changes.at(-1))).toEqual(['Apple', 'Banana', 'Red Pepper']);
        // a Shift click on a chosen option removes the range from the last click
        await userEvent.click(check(1), { modifiers: ['Shift'] });
        expect(names(changes.at(-1))).toEqual(['Apple']);
        await userEvent.click(screen.container.querySelector<HTMLElement>('#before')!);

        await screen.rerender(<Host key="mobile" mobile mobileConfig={{ title: 'Food' }} changes={changes} />);
        await userEvent.click(addon());
        await expect.poll(dialog).not.toBeNull();
        await userEvent.click(options()[1]);
        await userEvent.click(options()[3], { modifiers: ['Shift'] });
        expect(names(changes.at(-1))).toEqual(['Banana', 'Red Pepper', 'Spinach']);
    });

    it('renders the templates of options, chosen options, secondary texts and group headers', async () => {
        const { addon } = await setup({
            initial: [ITEMS[0]],
            group: true,
            groupKey: 'type',
            showSecondaryText: true,
            renderItem: (item, { index }) => <span data-testid="item">{`${item.name} #${index}`}</span>,
            renderSelectedItem: (item) => <span data-testid="chosen">{`${item.name} (chosen)`}</span>,
            renderSecondaryText: (item) => <span data-testid="secondary">{item.id}</span>,
            renderGroupHeader: (label) => <strong>{label.toUpperCase()}</strong>
        });
        await userEvent.click(addon());
        expect(optionTexts()).toEqual(['Apple (chosen)', 'Banana #12', 'Red Pepper #23', 'Spinach #34']);
        expect(document.querySelectorAll('[data-testid=secondary]')).toHaveLength(3);
        const group = document.querySelector<HTMLElement>('[role=group]')!;
        expect(document.getElementById(group.getAttribute('aria-labelledby')!)!.textContent).toBe('FRUIT');
    });

    it('labels the input and the list, and marks required and invalid fields', async () => {
        const { input, addon, screen } = await setup({
            'aria-label': undefined,
            'aria-labelledby': 'label',
            'aria-describedby': 'help',
            required: true,
            state: 'error',
            stateMessage: 'Choose a fruit',
            inputId: 'food',
            glyphAriaLabel: 'Open the list',
            addonIconTitle: 'Help'
        });
        // the multi-combobox's own live region (the tokenizer has one too)
        const live = () => screen.container.querySelector('div[style] > div > [aria-live=polite]')!;
        expect(input.id).toBe('food');
        expect(input.getAttribute('role')).toBe('combobox');
        expect(input.getAttribute('aria-labelledby')).toBe('label');
        expect(input.getAttribute('aria-required')).toBe('true');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.getAttribute('aria-haspopup')).toBe('listbox');
        const [message, help] = input.getAttribute('aria-describedby')!.split(' ');
        expect(document.getElementById(message)!.textContent).toBe('Choose a fruit');
        expect(help).toBe('help');
        expect(addon().getAttribute('aria-label')).toBe('Open the list');
        expect(addon().title).toBe('Help');
        // the message is announced while the list is closed
        expect(live().textContent).toBe('Choose a fruit');
        await userEvent.click(addon());
        const list = document.querySelector('ul[role=listbox]')!;
        expect(list.getAttribute('aria-labelledby')).toBe('label');
        expect(list.getAttribute('aria-multiselectable')).toBe('true');
        const shown = document.querySelector<HTMLElement>('[data-slot=list-message]')!;
        expect(shown.textContent).toBe('Choose a fruit');
        expect(shown.getBoundingClientRect().bottom).toBeLessThanOrEqual(list.getBoundingClientRect().top + 1);
        expect(live().textContent).toBe('');
    });

    it('shows the placeholder while nothing is chosen', async () => {
        const props = { 'aria-label': 'Food', displayKey: 'name', lookupKey: 'id', dataSource: ITEMS };
        const screen = await render(<MultiCombobox<Item> {...props} placeholder="Search food" />);
        const input = () => screen.container.querySelector('input')!;
        expect(input().getAttribute('placeholder')).toBe('Search food');
        await screen.rerender(<MultiCombobox<Item> {...props} placeholder="Search food" selectedItems={[ITEMS[0]]} />);
        expect(input().hasAttribute('placeholder')).toBe(false);
    });

    it('a read-only multi-combobox shows its tokens but does not open or change', async () => {
        const changes: Item[][] = [];
        const { input, screen } = await setup({ readOnly: true, initial: [ITEMS[0], ITEMS[1]], changes });
        expect(screen.container.querySelector('button[aria-haspopup]')).toBeNull();
        expect(input.readOnly).toBe(true);
        expect(input.getAttribute('aria-readonly')).toBe('true');
        expect(document.querySelector('[data-token] [aria-hidden=true]')).toBeNull();
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}{ArrowDown}{Enter}{Backspace}{Backspace}');
        await wait();
        expect(listOpen()).toBe(false);
        expect(changes).toEqual([]);
        expect(tokens()).toEqual(['Apple', 'Banana']);
    });

    it('a disabled multi-combobox is not focusable or clickable until re-enabled', async () => {
        const { screen, input, addon } = await setup({ initial: [ITEMS[0]], disabled: true });
        const field = addon().parentElement!;
        expect(input.disabled).toBe(true);
        expect(getComputedStyle(field).pointerEvents).toBe('none');
        screen.container.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(screen.container.querySelector('#after'));
        addon().click();
        await wait();
        expect(listOpen()).toBe(false);
        await screen.rerender(<Host initial={[ITEMS[0]]} />);
        expect(input.disabled).toBe(false);
        screen.container.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(input);
    });

    it('opens and closes through actionsRef and the open prop, and selects all through actionsRef', async () => {
        const actions = createRef<MultiComboboxActions>();
        const opens: boolean[] = [];
        const changes: Item[][] = [];
        const { input, screen } = await setup({ actionsRef: actions, onOpenChange: (o) => opens.push(o), changes });
        actions.current!.open();
        await expect.poll(listOpen).toBe(true);
        actions.current!.close();
        await expect.poll(listOpen).toBe(false);
        expect(opens).toEqual([true, false]);
        actions.current!.selectAll(true);
        await expect.poll(() => tokens()).toHaveLength(4);
        actions.current!.selectAll(false);
        await expect.poll(() => tokens()).toHaveLength(0);
        expect(changes).toHaveLength(2);
        await screen.rerender(<Host open />);
        await expect.poll(listOpen).toBe(true);
        expect(input.getAttribute('aria-expanded')).toBe('true');
    });

    it('works uncontrolled with defaultSelectedItems', async () => {
        const screen = await render(
            <MultiCombobox aria-label="Food" dataSource={['Apple', 'Kiwi', 'Lemon']} defaultSelectedItems={['Kiwi']} />
        );
        expect(tokens()).toEqual(['Kiwi']);
        const input = screen.container.querySelector('input')!;
        await userEvent.type(input, 'lemon{Enter}');
        expect(tokens()).toEqual(['Kiwi', 'Lemon']);
    });

    it('limits the list height and width, and fills the field width less two group borders', async () => {
        const screen = await render(
            <div style={{ width: 300 }}>
                <MultiCombobox aria-label="Food" dataSource={['Apple', 'Kiwi']} bodyMaxWidth={150} maxHeight="40px" />
            </div>
        );
        const addon = () => screen.container.querySelector<HTMLButtonElement>('button[aria-haspopup]')!;
        await userEvent.click(addon());
        const list = document.querySelector<HTMLElement>('ul[role=listbox]')!;
        expect(list.style.maxHeight).toBe('40px');
        await expect
            .poll(() => list.closest<HTMLElement>('[data-side]')!.getBoundingClientRect().width)
            .toBeLessThanOrEqual(150);
        await userEvent.click(addon());
        await screen.rerender(
            <div style={{ width: 300 }}>
                <MultiCombobox aria-label="Food" dataSource={['Apple', 'Kiwi']} />
            </div>
        );
        await userEvent.click(addon());
        await expect.poll(() => document.querySelector('[data-side]')!.getBoundingClientRect().width).toBe(298);
    });

    it('in a dialog, opens its list above the dialog and closes only the list with Escape', async () => {
        const screen = await render(
            <Dialog defaultOpen>
                <DialogPopup>
                    <DialogTitle>Food</DialogTitle>
                    <DialogBody>
                        <MultiCombobox aria-label="Food" displayKey="name" lookupKey="id" dataSource={ITEMS} />
                    </DialogBody>
                </DialogPopup>
            </Dialog>
        );
        await expect.poll(dialog).not.toBeNull();
        const input = dialog()!.querySelector<HTMLInputElement>('input[role=combobox]')!;
        input.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        expect(input.getAttribute('aria-expanded')).toBe('true');
        const option = options()[0].getBoundingClientRect();
        const hit = document.elementFromPoint(option.left + option.width / 2, option.top + option.height / 2);
        expect(options()[0].contains(hit)).toBe(true);
        await userEvent.keyboard('{Escape}');
        await expect.poll(listOpen).toBe(false);
        await wait(100);
        expect(dialog()).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await expect.poll(dialog).toBeNull();
        screen.unmount();
    });

    describe('mobile', () => {
        const config: MultiComboboxMobileConfig = {
            title: 'Food',
            approveButtonText: 'OK',
            cancelButtonText: 'Cancel'
        };

        it('Approve commits once and Cancel restores the selection', async () => {
            const changes: Item[][] = [];
            const { input, addon } = await setup({ mobile: true, mobileConfig: config, initial: [ITEMS[1]], changes });
            expect(input.getAttribute('aria-haspopup')).toBe('dialog');
            expect(addon().getAttribute('aria-haspopup')).toBe('dialog');
            await userEvent.click(addon());
            await expect.poll(dialog).not.toBeNull();
            expect(dialog()!.getAttribute('aria-labelledby')).toBe(dialog()!.querySelector('h1')!.id);
            const dialogInput = dialog()!.querySelector<HTMLInputElement>('input[role=combobox]')!;
            await expect.poll(() => document.activeElement).toBe(dialogInput);
            expect(input.getAttribute('aria-expanded')).toBe('true');
            // the dialog field has no addon button
            expect(dialog()!.querySelectorAll('button[aria-haspopup]')).toHaveLength(0);
            await userEvent.click(options()[0]);
            await userEvent.click(options()[1]);
            expect(options()[0].getAttribute('aria-selected')).toBe('true');
            expect(changes).toEqual([]);
            await userEvent.click(dialogButton('Cancel')!);
            await expect.poll(dialog).toBeNull();
            expect(tokens()).toEqual(['Banana']);
            expect(changes).toEqual([]);

            await userEvent.click(addon());
            await expect.poll(dialog).not.toBeNull();
            expect(options().map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false', 'false']);
            await userEvent.click(options()[3]);
            await userEvent.click(dialogButton('OK')!);
            await expect.poll(dialog).toBeNull();
            expect(changes.map(names)).toEqual([['Banana', 'Spinach']]);
            expect(tokens()).toEqual(['Banana', 'Spinach']);
            await expect.poll(() => document.activeElement).toBe(input);
        });

        it('deselecting the last item keeps the focus in the dialog', async () => {
            const { addon } = await setup({ mobile: true, mobileConfig: config, initial: [ITEMS[1]] });
            await userEvent.click(addon());
            await expect.poll(dialog).not.toBeNull();
            const field = dialog()!.querySelector<HTMLInputElement>('input[role=combobox]')!;
            await expect.poll(() => document.activeElement).toBe(field);
            await userEvent.keyboard('{ArrowDown}{ArrowDown} ');
            expect(options()[1].getAttribute('aria-selected')).toBe('false');
            expect(tokens()).toEqual([]);
            expect(document.activeElement).toBe(field);
        });

        it('opens from the keyboard, takes the keys on its list, applies right away without approve button', async () => {
            const changes: Item[][] = [];
            const { input } = await setup({
                mobile: true,
                showSelectAll: true,
                mobileConfig: { cancelButtonText: 'Close list' },
                changes
            });
            input.focus();
            await userEvent.keyboard('a');
            await expect.poll(dialog).not.toBeNull();
            // without a title the dialog takes the name of the field
            expect(dialog()!.getAttribute('aria-label')).toBe('Food');
            const list = dialog()!.querySelector<HTMLElement>('ul[role=listbox]')!;
            list.focus();
            await userEvent.keyboard('{ArrowDown}{Enter}');
            expect(changes.at(-1)).toHaveLength(4);
            expect(list.getAttribute('aria-activedescendant')).toBe(options()[0].id);
            await userEvent.keyboard('{ArrowDown} ');
            expect(names(changes.at(-1))).toEqual(['Banana', 'Red Pepper', 'Spinach']);
            await userEvent.click(dialog()!.querySelector<HTMLButtonElement>('button[aria-label=Close]')!);
            await expect.poll(dialog).toBeNull();
            expect(tokens()).toEqual(['Banana', 'Red Pepper', 'Spinach']);
        });
    });

    it('passes native props, className and the ref to the root, and the input props and ref to the input', async () => {
        const ref = createRef<HTMLDivElement>();
        const inputRef = createRef<HTMLInputElement>();
        const screen = await render(
            <MultiCombobox
                ref={ref}
                inputRef={inputRef}
                aria-label="Food"
                className="blue"
                data-sample="Sample"
                dataSource={['Apple']}
                inputProps={{ 'data-sample': 'Input' } as object}
            />
        );
        const root = screen.container.firstElementChild as HTMLElement;
        expect(ref.current).toBe(root);
        expect(root.classList.contains('blue')).toBe(true);
        expect(root.dataset['sample']).toBe('Sample');
        expect(inputRef.current).toBe(screen.container.querySelector('input'));
        expect(inputRef.current!.dataset['sample']).toBe('Input');
        expect(inputRef.current!.getAttribute('aria-label')).toBe('Food');
        expect(root.hasAttribute('aria-label')).toBe(false);
    });
});
