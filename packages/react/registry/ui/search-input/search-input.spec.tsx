import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { SearchInput, type SearchInputItem, type SearchInputProps } from './search-input';

const fruitNames = [
    'apple',
    'apricot',
    'banana',
    'blueberry',
    'blackberry',
    'calabash',
    'clementines',
    'kiwi',
    'orange'
];
const makeFruits = () => fruitNames.map((text) => ({ text, callback: vi.fn() }));

const options = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')];
const listbox = () => document.querySelector<HTMLElement>('[role="listbox"]');
const texts = () => options().map((option) => option.textContent);

async function setup(props: Partial<SearchInputProps> = {}) {
    const searchList = props.searchList === undefined ? makeFruits() : props.searchList;
    const screen = await render(
        <>
            <button id="outside">Outside</button>
            <SearchInput aria-label="Fruit" placeholder="Enter a fruit" {...props} searchList={searchList} />
        </>
    );
    const input = screen.container.querySelector('input')!;
    return { screen, input, searchList };
}

describe('SearchInput', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('is a combobox that opens its suggestions while typing and filters them by the start of the text', async () => {
        const { input } = await setup();
        expect(input.getAttribute('role')).toBe('combobox');
        expect(input.getAttribute('aria-expanded')).toBe('false');
        expect(input.getAttribute('aria-autocomplete')).toBe('list');
        expect(input.getAttribute('aria-haspopup')).toBe('listbox');
        expect(input.getAttribute('autocomplete')).toBe('off');
        await userEvent.type(input, 'b');
        expect(input.getAttribute('aria-expanded')).toBe('true');
        expect(input.getAttribute('aria-controls')).toBe(listbox()!.id);
        expect(listbox()!.getAttribute('aria-label')).toBe('Fruit');
        expect(texts()).toEqual(['banana', 'blueberry', 'blackberry']);
        // the typed text is bold in the suggestions
        expect(options()[0]!.querySelector('b')!.textContent).toBe('b');
        // the focus stays in the input
        expect(document.activeElement).toBe(input);
    });

    it('matches anywhere in the suggestions with subStringSearch', async () => {
        const searchList = [
            { text: 'who is a supplier user?' },
            { text: 'who is a buyer user?' },
            { text: 'who is a worker user?' },
            { text: 'how to change the pin?' },
            { text: 'how to set the pin?' }
        ];
        const { input } = await setup({ searchList, subStringSearch: true });
        await userEvent.click(input);
        expect(options()).toHaveLength(5);
        await userEvent.type(input, 'supplier');
        expect(texts()).toEqual(['who is a supplier user?']);
        expect(options()[0]!.querySelector('b')!.textContent).toBe('supplier');
        await userEvent.clear(input);
        await userEvent.type(input, 'pin');
        expect(options()).toHaveLength(2);
    });

    it('opens and closes the suggestions with a click in the input', async () => {
        const { input } = await setup();
        await userEvent.click(input);
        expect(listbox()).not.toBeNull();
        expect(options()).toHaveLength(fruitNames.length);
        await userEvent.click(input);
        await expect.poll(() => listbox()).toBeNull();
        expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('closes the suggestions on a click outside', async () => {
        const { screen, input } = await setup();
        await userEvent.type(input, 'apple');
        expect(listbox()).not.toBeNull();
        await userEvent.click(screen.container.querySelector('#outside')!);
        await expect.poll(() => listbox()).toBeNull();
        expect(input.value).toBe('apple');
    });

    it('chooses a suggestion with a click: fills the input, closes and calls its callback and onItemSelect', async () => {
        const onItemSelect = vi.fn();
        const onValueChange = vi.fn();
        const { input, searchList } = await setup({ onItemSelect, onValueChange });
        await userEvent.click(input);
        await userEvent.click(options()[2]!);
        expect(input.value).toBe('banana');
        expect(searchList![2]!.callback).toHaveBeenCalledTimes(1);
        expect(onItemSelect).toHaveBeenCalledTimes(1);
        expect(onItemSelect).toHaveBeenLastCalledWith(searchList![2], expect.anything());
        expect(onValueChange).toHaveBeenLastCalledWith(
            'banana',
            expect.objectContaining({ reason: 'item-press', matches: [searchList![2]] })
        );
        await expect.poll(() => listbox()).toBeNull();
        expect(document.activeElement).toBe(input);
    });

    it('highlights suggestions with the arrow keys and chooses with Enter (aria-activedescendant)', async () => {
        const onItemSelect = vi.fn();
        const onSearch = vi.fn();
        const { input, searchList } = await setup({ onItemSelect, onSearch });
        await userEvent.type(input, 'ap');
        expect(input.hasAttribute('aria-activedescendant')).toBe(false);
        await userEvent.keyboard('{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[0]!.id);
        expect(options()[0]!.hasAttribute('data-active')).toBe(true);
        await userEvent.keyboard('{ArrowDown}');
        expect(input.getAttribute('aria-activedescendant')).toBe(options()[1]!.id);
        expect(options()[0]!.hasAttribute('data-active')).toBe(false);
        // the text does not change while highlighting
        expect(input.value).toBe('ap');
        await userEvent.keyboard('{Enter}');
        expect(input.value).toBe('apricot');
        expect(onItemSelect).toHaveBeenCalledTimes(1);
        expect(onItemSelect).toHaveBeenLastCalledWith(searchList![1], expect.anything());
        expect(searchList![1]!.callback).toHaveBeenCalledTimes(1);
        expect(onSearch).not.toHaveBeenCalled();
        await expect.poll(() => listbox()).toBeNull();
    });

    it('calls onSearch with the text on Enter and closes the suggestions', async () => {
        const onSearch = vi.fn();
        const { input } = await setup({ onSearch });
        await userEvent.type(input, 'apple');
        expect(listbox()).not.toBeNull();
        await userEvent.keyboard('{Enter}');
        expect(onSearch).toHaveBeenLastCalledWith('apple');
        await expect.poll(() => listbox()).toBeNull();
    });

    it('calls onSearch on Enter without suggestions, as a plain search field', async () => {
        const onSearch = vi.fn();
        const onValueChange = vi.fn();
        const { input } = await setup({ searchList: null, onSearch, onValueChange });
        expect(input.getAttribute('role')).toBe('searchbox');
        expect(input.hasAttribute('aria-expanded')).toBe(false);
        expect(input.hasAttribute('aria-autocomplete')).toBe(false);
        await userEvent.click(input);
        await userEvent.type(input, 'banana');
        expect(listbox()).toBeNull();
        expect(onValueChange).toHaveBeenLastCalledWith('banana', expect.objectContaining({ reason: 'input-change' }));
        await userEvent.keyboard('{Enter}');
        expect(onSearch).toHaveBeenLastCalledWith('banana');
    });

    it('calls onSearch from the search button and closes the suggestions', async () => {
        const onSearch = vi.fn();
        const onValueChange = vi.fn();
        const { screen, input, searchList } = await setup({ onSearch, onValueChange });
        await userEvent.type(input, 'apple');
        expect(onValueChange).toHaveBeenLastCalledWith(
            'apple',
            expect.objectContaining({ reason: 'input-change', matches: [searchList![0]] })
        );
        await userEvent.click(screen.container.querySelector('[aria-label="Search"]')!);
        expect(onSearch).toHaveBeenLastCalledWith('apple');
        await expect.poll(() => listbox()).toBeNull();
        expect(input.value).toBe('apple');
    });

    it('closes the suggestions on Escape, then clears the text on a second Escape', async () => {
        const onValueChange = vi.fn();
        const { input } = await setup({ onValueChange });
        await userEvent.type(input, 'a');
        expect(listbox()).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => listbox()).toBeNull();
        expect(input.value).toBe('a');
        await userEvent.keyboard('{Escape}');
        expect(input.value).toBe('');
        expect(onValueChange).toHaveBeenLastCalledWith('', expect.objectContaining({ reason: 'escape-key' }));
    });

    it('clears the text with the clear button, shown while there is text', async () => {
        const onValueChange = vi.fn();
        const { screen, input } = await setup({ onValueChange, clearButtonLabel: 'Clear text' });
        expect(screen.container.querySelector('[aria-label="Clear text"]')).toBeNull();
        await userEvent.type(input, 'kiwi');
        await userEvent.click(screen.container.querySelector('[aria-label="Clear text"]')!);
        expect(input.value).toBe('');
        expect(onValueChange).toHaveBeenLastCalledWith('', expect.objectContaining({ reason: 'clear-press' }));
        expect(document.activeElement).toBe(input);
        expect(screen.container.querySelector('[aria-label="Clear text"]')).toBeNull();
    });

    it('can hide the clear button and the search button, and names the search button', async () => {
        const { screen } = await setup({ defaultValue: 'kiwi', searchButtonLabel: 'Find' });
        expect(screen.container.querySelectorAll('button[aria-label]')).toHaveLength(2);
        expect(screen.container.querySelector('button[aria-label="Find"]')).not.toBeNull();
        await screen.rerender(
            <SearchInput
                aria-label="Fruit"
                searchList={makeFruits()}
                defaultValue="kiwi"
                showClearButton={false}
                noSearchButton
            />
        );
        expect(screen.container.querySelectorAll('button')).toHaveLength(0);
        await screen.rerender(
            <SearchInput aria-label="Fruit" searchList={makeFruits()} defaultValue="kiwi" noSearchButton />
        );
        expect(screen.container.querySelector('button')!.getAttribute('aria-label')).toBe('Clear');
    });

    it('takes the buttons out of the tab order while the suggestions are open (hidden from assistive technology)', async () => {
        const { screen, input } = await setup({ defaultValue: 'a' });
        const buttons = [...screen.container.querySelectorAll<HTMLButtonElement>('button:not(#outside)')];
        expect(buttons).toHaveLength(2);
        expect(buttons.every((button) => button.tabIndex === 0)).toBe(true);
        await userEvent.click(input);
        expect(listbox()).not.toBeNull();
        expect(buttons.every((button) => button.tabIndex === -1)).toBe(true);
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => buttons.every((button) => button.tabIndex === 0)).toBe(true);
        await userEvent.tab();
        expect(document.activeElement).toBe(buttons[0]);
    });

    it('shows "No result" when no suggestion matches', async () => {
        const { input } = await setup({ noResultsText: 'Nothing found' });
        await userEvent.type(input, 'zz');
        expect(input.getAttribute('aria-expanded')).toBe('true');
        expect(options()).toHaveLength(0);
        await expect.poll(() => document.body.textContent).toContain('Nothing found');
    });

    it('announces the number of suggestions', async () => {
        const { screen, input } = await setup({ resultsLabel: '{count} results' });
        await userEvent.type(input, 'b');
        const status = [...screen.container.querySelectorAll('[role="status"]')].map((el) => el.textContent);
        expect(status).toContain('3 results');
    });

    it('works controlled with value and onValueChange', async () => {
        function Host() {
            const [value, setValue] = useState('ban');
            return (
                <>
                    <button id="set" onClick={() => setValue('kiwi')}>
                        Set
                    </button>
                    <span id="echo">{value}</span>
                    <SearchInput aria-label="Fruit" searchList={makeFruits()} value={value} onValueChange={setValue} />
                </>
            );
        }
        const screen = await render(<Host />);
        const input = screen.container.querySelector('input')!;
        expect(input.value).toBe('ban');
        await userEvent.type(input, 'a');
        expect(screen.container.querySelector('#echo')!.textContent).toBe('bana');
        await userEvent.click(screen.container.querySelector('#set')!);
        expect(input.value).toBe('kiwi');
    });

    it('opens and closes controlled with open and onOpenChange', async () => {
        const onOpenChange = vi.fn();
        const { screen, input } = await setup({ open: true, onOpenChange });
        expect(listbox()).not.toBeNull();
        await userEvent.click(input);
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
        expect(listbox()).not.toBeNull();
        await screen.rerender(
            <SearchInput aria-label="Fruit" searchList={makeFruits()} open={false} onOpenChange={onOpenChange} />
        );
        await expect.poll(() => listbox()).toBeNull();
    });

    it('updates the suggestions when the list changes', async () => {
        const fruits = makeFruits();
        const newer = [{ text: 'peaches' }, { text: 'pear' }];
        function Host() {
            const [list, setList] = useState<SearchInputItem[]>(fruits);
            return (
                <SearchInput
                    aria-label="Fruit"
                    searchList={list}
                    onValueChange={(value) => {
                        if (value === 'pe') setList(newer);
                    }}
                />
            );
        }
        const screen = await render(<Host />);
        const input = screen.container.querySelector('input')!;
        await userEvent.click(input);
        expect(options()).toHaveLength(fruits.length);
        await userEvent.type(input, 'pe');
        await expect.poll(() => options().length).toBe(2);
        await userEvent.type(input, 'ach');
        expect(texts()).toEqual(['peaches']);
    });

    it('is disabled: no suggestions and disabled buttons', async () => {
        const { screen, input } = await setup({ disabled: true, defaultValue: 'apple' });
        expect(input.disabled).toBe(true);
        expect(input.getAttribute('role')).toBe('searchbox');
        const buttons = [...screen.container.querySelectorAll('button:not(#outside)')] as HTMLButtonElement[];
        expect(buttons).toHaveLength(2);
        expect(buttons.every((button) => button.disabled)).toBe(true);
        expect(Number(getComputedStyle(input.parentElement!).opacity)).toBeLessThan(1);
    });

    it('is read-only: no buttons and no suggestions', async () => {
        const { screen, input } = await setup({ readOnly: true, defaultValue: 'apple' });
        expect(input.readOnly).toBe(true);
        expect(input.value).toBe('apple');
        expect(screen.container.querySelectorAll('button:not(#outside)')).toHaveLength(0);
        await userEvent.click(input);
        expect(listbox()).toBeNull();
        await userEvent.keyboard('{Escape}');
        expect(input.value).toBe('apple');
    });

    it('shows the value state, with its message above the suggestions and as the input description', async () => {
        const { screen, input } = await setup({ state: 'error', stateMessage: 'Test validation state' });
        expect(input.getAttribute('aria-invalid')).toBe('true');
        const description = document.getElementById(input.getAttribute('aria-describedby')!)!;
        expect(description.textContent).toBe('Test validation state');
        await userEvent.click(input);
        const popup = listbox()!.closest('[data-side]')!;
        const message = popup.querySelector('[data-slot="list-message"]')!;
        expect(message.textContent).toBe('Test validation state');
        expect(getComputedStyle(message).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        await screen.rerender(
            <>
                <button id="outside">Outside</button>
                <SearchInput aria-label="Fruit" searchList={makeFruits()} state="warning" />
            </>
        );
        expect(screen.container.querySelector('input')).toBe(input);
        expect(input.hasAttribute('aria-invalid')).toBe(false);
        expect(input.hasAttribute('aria-describedby')).toBe(false);
    });

    it('labels the input from its label with inputId, or aria-labelledby', async () => {
        const screen = await render(
            <>
                <label htmlFor="fruit-search">Fruit</label>
                <SearchInput inputId="fruit-search" searchList={makeFruits()} />
                <span id="other">Other</span>
                <SearchInput aria-labelledby="other" />
            </>
        );
        const [first, second] = [
            ...screen.container.querySelectorAll('input:not([aria-hidden])')
        ] as HTMLInputElement[];
        expect(first!.id).toBe('fruit-search');
        expect(first!.labels?.[0]?.textContent).toBe('Fruit');
        expect(second!.getAttribute('aria-labelledby')).toBe('other');
    });

    it('passes className, native props and ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(<SearchInput ref={ref} className="blue" data-sample="Sample" aria-label="Fruit" />);
        const root = screen.container.firstElementChild as HTMLElement;
        expect(ref.current).toBe(root);
        expect(root.classList).toContain('blue');
        expect(root.dataset['sample']).toBe('Sample');
        expect(root.hasAttribute('aria-label')).toBe(false);
    });

    it('spreads inputProps, inputRef, inputGroupProps and searchButtonProps', async () => {
        const inputRef = createRef<HTMLInputElement>();
        const onClick = vi.fn();
        const onSearch = vi.fn();
        const screen = await render(
            <SearchInput
                aria-label="Fruit"
                inputRef={inputRef}
                inputProps={{ 'data-sample': 'Sample' } as SearchInputProps['inputProps']}
                inputGroupProps={{ className: 'wonderful-styles' }}
                searchButtonProps={{ 'data-sample': 'Sample1', onClick } as SearchInputProps['searchButtonProps']}
                onSearch={onSearch}
            />
        );
        const input = screen.container.querySelector('input')!;
        expect(inputRef.current).toBe(input);
        expect(input.dataset['sample']).toBe('Sample');
        expect(input.parentElement!.classList).toContain('wonderful-styles');
        const button = screen.container.querySelector('button')!;
        expect(button.dataset['sample']).toBe('Sample1');
        await userEvent.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onSearch).toHaveBeenCalledWith('');
    });

    it('spreads listProps on the list and popoverProps on the popup', async () => {
        const { input } = await setup({
            listProps: { className: 'list-styles', 'data-sample': 'Sample' } as SearchInputProps['listProps'],
            popoverProps: { className: 'wonderful-styles', 'data-sample': 'Sample' } as SearchInputProps['popoverProps']
        });
        await userEvent.click(input);
        const list = listbox()!;
        expect(list.tagName).toBe('UL');
        expect(list.classList).toContain('list-styles');
        expect(list.dataset['sample']).toBe('Sample');
        const popup = document.querySelector<HTMLElement>('.wonderful-styles')!;
        expect(popup.dataset['sample']).toBe('Sample');
        expect(popup.contains(list)).toBe(true);
    });

    it('makes the suggestions at least as wide as the field', async () => {
        const screen = await render(
            <div style={{ width: 400, margin: 40 }}>
                <SearchInput aria-label="Fruit" searchList={makeFruits()} />
            </div>
        );
        const input = screen.container.querySelector('input')!;
        await userEvent.click(input);
        const group = input.parentElement!;
        const popup = listbox()!.closest('[data-side]') as HTMLElement;
        await expect.poll(() => Math.round(popup.getBoundingClientRect().width)).toBe(400);
        expect(Math.round(popup.getBoundingClientRect().left)).toBe(Math.round(group.getBoundingClientRect().left));
        expect(popup.getBoundingClientRect().top).toBeGreaterThanOrEqual(group.getBoundingClientRect().bottom - 1);
    });

    it('uses compact sizes with data-density="compact"', async () => {
        const { input } = await setup();
        await userEvent.click(input);
        const cozy = options()[0]!.getBoundingClientRect().height;
        const cozyField = input.parentElement!.getBoundingClientRect().height;
        document.documentElement.setAttribute('data-density', 'compact');
        await expect.poll(() => options()[0]!.getBoundingClientRect().height).toBeLessThan(cozy);
        expect(input.parentElement!.getBoundingClientRect().height).toBeLessThan(cozyField);
    });
});
