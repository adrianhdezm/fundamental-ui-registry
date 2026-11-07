import { Field } from '@base-ui/react/field';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    type InputGroupPlacement,
    type InputGroupProps,
    type InputGroupValue
} from './input-group';

const opacity = (el: Element) => Number(getComputedStyle(el).opacity);

describe('InputGroup', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('renders an input labelled by its label and described by the text addon', async () => {
        const screen = await render(
            <>
                <label htmlFor="amount">Amount</label>
                <InputGroup inputId="amount" addOnText="$" />
            </>
        );
        const input = screen.container.querySelector('input')!;
        expect(input.id).toBe('amount');
        expect(input.labels?.[0]?.textContent).toBe('Amount');
        const addon = input.nextElementSibling!;
        expect(addon.textContent?.trim()).toBe('$');
        expect(addon.id).not.toBe('');
        expect(input.getAttribute('aria-describedby')).toBe(addon.id);
    });

    it('places the addon before or after the input', async () => {
        const ui = (placement: InputGroupPlacement) => (
            <InputGroup aria-label="Amount" addOnText="$" placement={placement} />
        );
        const screen = await render(ui('after'));
        const group = screen.container.firstElementChild!;
        expect(group.firstElementChild?.tagName).toBe('INPUT');
        await screen.rerender(ui('before'));
        expect(group.firstElementChild?.tagName).toBe('SPAN');
        expect(group.firstElementChild?.textContent).toBe('$');
        expect(group.lastElementChild?.tagName).toBe('INPUT');
    });

    it('works controlled with value and onValueChange, and can be disabled', async () => {
        const onValueChange = vi.fn();
        function Host({ disabled }: { disabled?: boolean }) {
            const [value, setValue] = useState<InputGroupValue>('10');
            return (
                <>
                    <InputGroup
                        aria-label="Amount"
                        addOnText="$"
                        disabled={disabled}
                        value={value}
                        onValueChange={(next, event) => {
                            onValueChange(next, event);
                            setValue(next);
                        }}
                    />
                    <span id="echo">{value}</span>
                    <button id="set" onClick={() => setValue('xyz')}>
                        Set
                    </button>
                </>
            );
        }
        const screen = await render(<Host />);
        const input = screen.container.querySelector('input')!;
        expect(input.value).toBe('10');
        await userEvent.clear(input);
        await userEvent.type(input, 'abc');
        expect(screen.container.querySelector('#echo')!.textContent).toBe('abc');
        expect(onValueChange).toHaveBeenLastCalledWith('abc', expect.anything());
        // a value set by the app replaces what was typed
        await userEvent.click(screen.container.querySelector('#set')!);
        expect(input.value).toBe('xyz');

        await screen.rerender(<Host disabled />);
        const group = screen.container.firstElementChild!;
        expect(input.disabled).toBe(true);
        expect(group.hasAttribute('data-disabled')).toBe(true);
        expect(opacity(group)).toBeLessThan(1);
        // the group is dimmed, its disabled input is not dimmed again
        expect(opacity(input)).toBe(1);
    });

    it('works uncontrolled with defaultValue and tracks touched and dirty in a Base UI Field', async () => {
        const screen = await render(
            <Field.Root>
                <Field.Label>Amount</Field.Label>
                <InputGroup addOnText="$" defaultValue="10" />
            </Field.Root>
        );
        const input = screen.container.querySelector('input')!;
        expect(input.value).toBe('10');
        expect(input.labels?.[0]?.textContent).toBe('Amount');
        await userEvent.clear(input);
        await userEvent.type(input, 'abc');
        expect(input.value).toBe('abc');
        expect(input.hasAttribute('data-dirty')).toBe(true);
        await userEvent.tab();
        expect(input.hasAttribute('data-touched')).toBe(true);
    });

    it('reports numbers for number inputs', async () => {
        const onValueChange = vi.fn();
        const screen = await render(
            <InputGroup aria-label="Amount" type="number" defaultValue={10} onValueChange={onValueChange} />
        );
        const input = screen.container.querySelector('input')!;
        await userEvent.clear(input);
        expect(onValueChange).toHaveBeenLastCalledWith(null, expect.anything());
        await userEvent.type(input, '42');
        expect(onValueChange).toHaveBeenLastCalledWith(42, expect.anything());
    });

    it('calls onAddOnButtonClick from the addon button, which controls the input', async () => {
        const onClick = vi.fn();
        const screen = await render(
            <InputGroup
                aria-label="Search"
                glyph="decline"
                glyphAriaLabel="Clear"
                button
                onAddOnButtonClick={onClick}
            />
        );
        const button = screen.container.querySelector('button')!;
        const input = screen.container.querySelector('input')!;
        expect(button.getAttribute('aria-label')).toBe('Clear');
        expect(button.getAttribute('aria-controls')).toBe(input.id);
        expect(button.type).toBe('button');
        // a button addon names an action, it does not describe the input
        expect(input.hasAttribute('aria-describedby')).toBe(false);
        await userEvent.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('keeps the focus in the input when the button is not focusable', async () => {
        const onClick = vi.fn();
        const ui = (buttonFocusable: boolean) => (
            <InputGroup
                aria-label="Search"
                glyph="decline"
                glyphAriaLabel="Clear"
                button
                buttonFocusable={buttonFocusable}
                onAddOnButtonClick={onClick}
            />
        );
        const screen = await render(ui(true));
        const input = screen.container.querySelector('input')!;
        const button = screen.container.querySelector('button')!;
        expect(button.tabIndex).toBe(0);
        await screen.rerender(ui(false));
        expect(button.tabIndex).toBe(-1);
        input.focus();
        await userEvent.click(button);
        expect(document.activeElement).toBe(input);
        expect(onClick).toHaveBeenCalledTimes(1);
        // and out of the tab order
        await userEvent.tab();
        expect(document.activeElement).not.toBe(button);
    });

    it('exposes a popup control with aria-haspopup and aria-expanded, and can hide the button', async () => {
        const ui = (props: Partial<InputGroupProps>) => (
            <InputGroup aria-label="Date" glyph="calendar" button {...props} />
        );
        const screen = await render(ui({}));
        const button = screen.container.querySelector('button')!;
        expect(button.hasAttribute('aria-haspopup')).toBe(false);
        expect(button.hasAttribute('aria-expanded')).toBe(false);
        await screen.rerender(ui({ isControl: true }));
        expect(button.getAttribute('aria-haspopup')).toBe('true');
        expect(button.getAttribute('aria-expanded')).toBe('false');
        await screen.rerender(ui({ isControl: true, isExpanded: true }));
        expect(button.getAttribute('aria-expanded')).toBe('true');
        await screen.rerender(ui({ addonButtonAriaHidden: true, iconTitle: 'Open calendar' }));
        expect(button.getAttribute('aria-hidden')).toBe('true');
        expect(button.title).toBe('Open calendar');
    });

    it('uses projected inputs and addons instead of its own', async () => {
        const screen = await render(
            <InputGroup glyph="search" addOnText="ignored">
                <InputGroupInput aria-label="Date" />
                <InputGroupAddon button>
                    <button type="button" aria-label="Calendar">
                        C
                    </button>
                </InputGroupAddon>
            </InputGroup>
        );
        const group = screen.container.firstElementChild!;
        expect(group.querySelectorAll('input')).toHaveLength(1);
        expect(group.querySelector('input')!.getAttribute('aria-label')).toBe('Date');
        expect(group.querySelectorAll(':scope > span')).toHaveLength(1);
        expect(group.textContent).toBe('C');
    });

    it('passes disabled, readOnly and the error state to projected inputs', async () => {
        const ui = (props: Partial<InputGroupProps>) => (
            <InputGroup {...props}>
                <InputGroupInput aria-label="Date" />
            </InputGroup>
        );
        const screen = await render(ui({}));
        const input = screen.container.querySelector('input')!;
        expect(input.disabled).toBe(false);
        expect(input.readOnly).toBe(false);
        await screen.rerender(ui({ disabled: true }));
        expect(input.disabled).toBe(true);
        await screen.rerender(ui({ readOnly: true }));
        expect(input.readOnly).toBe(true);
        await screen.rerender(ui({ state: 'error' }));
        expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('states set aria-invalid only for errors and change the group colours', async () => {
        const ui = (state: InputGroupProps['state']) => <InputGroup aria-label="Amount" state={state} />;
        const screen = await render(ui(null));
        const group = screen.container.firstElementChild!;
        const input = screen.container.querySelector('input')!;
        const borders = new Set([getComputedStyle(group).borderBottomColor]);
        expect(input.hasAttribute('aria-invalid')).toBe(false);
        for (const state of ['error', 'warning', 'success', 'information'] as const) {
            await screen.rerender(ui(state));
            expect(input.getAttribute('aria-invalid')).toBe(state === 'error' ? 'true' : null);
            borders.add(getComputedStyle(group).borderBottomColor);
        }
        expect(borders.size).toBe(5);
    });

    it('shows the focus frame while the input has the focus, unless showFocus is off', async () => {
        const ui = (showFocus: boolean) => <InputGroup aria-label="Amount" addOnText="$" showFocus={showFocus} />;
        const screen = await render(ui(true));
        const group = screen.container.firstElementChild!;
        const input = screen.container.querySelector('input')!;
        // a frame is an ::after with content that is displayed
        const frame = () => {
            const after = getComputedStyle(group, '::after');
            return after.display !== 'none' && after.content !== 'none' && after.content !== 'normal';
        };
        expect(frame()).toBe(false);
        input.focus();
        expect(frame()).toBe(true);
        await screen.rerender(ui(false));
        expect(document.activeElement).toBe(input);
        expect(frame()).toBe(false);
    });

    it('read-only keeps the value and uses the read-only style', async () => {
        const screen = await render(
            <>
                <InputGroup id="readonly" aria-label="Read-only" addOnText="EUR" readOnly defaultValue="1,200.00" />
                <InputGroup id="normal" aria-label="Normal" addOnText="EUR" />
            </>
        );
        const readonly = screen.container.querySelector('#readonly')!;
        const normal = screen.container.querySelector('#normal')!;
        const input = readonly.querySelector('input')!;
        expect(readonly.hasAttribute('data-readonly')).toBe(true);
        expect(input.readOnly).toBe(true);
        expect(getComputedStyle(readonly).backgroundImage).not.toBe(getComputedStyle(normal).backgroundImage);
        await userEvent.click(input);
        await userEvent.keyboard('abc');
        expect(input.value).toBe('1,200.00');
    });

    it('inline groups take the width of their content', async () => {
        const screen = await render(
            <div style={{ width: 600 }}>
                <InputGroup id="block" aria-label="Block" addOnText="EUR" />
                <InputGroup id="inline" aria-label="Inline" addOnText="EUR" inline className="w-48" />
            </div>
        );
        expect(screen.container.querySelector('#block')!.getBoundingClientRect().width).toBe(600);
        const inline = screen.container.querySelector('#inline')!;
        expect(getComputedStyle(inline).display).toBe('inline-flex');
        expect(inline.getBoundingClientRect().width).toBe(192);
    });

    it('calls onSearch for the search event of a search input', async () => {
        const onSearch = vi.fn();
        const screen = await render(<InputGroup aria-label="Search" type="search" onSearch={onSearch} />);
        const input = screen.container.querySelector('input')!;
        await userEvent.type(input, 'Fiori{Enter}');
        expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it('compact density makes the group lower', async () => {
        const screen = await render(<InputGroup aria-label="Amount" addOnText="$" />);
        const group = screen.container.firstElementChild!;
        expect(group.getBoundingClientRect().height).toBe(36);
        document.documentElement.setAttribute('data-density', 'compact');
        expect(group.getBoundingClientRect().height).toBe(26);
        // fundamental-react's `compact` prop: data-density on the group itself
        document.documentElement.removeAttribute('data-density');
        await screen.rerender(<InputGroup aria-label="Amount" addOnText="$" data-density="compact" />);
        expect(group.getBoundingClientRect().height).toBe(26);
    });

    it('grows with a projected text area', async () => {
        const screen = await render(
            <InputGroup>
                <InputGroupInput aria-label="Notes" render={<textarea rows={4} />} />
                <InputGroupAddon type="textarea">x</InputGroupAddon>
            </InputGroup>
        );
        const group = screen.container.firstElementChild!;
        expect(screen.container.querySelector('textarea')).not.toBeNull();
        expect(group.getBoundingClientRect().height).toBeGreaterThan(36);
    });

    it('renders a div and passes className, native props and the refs through', async () => {
        const ref = createRef<HTMLDivElement>();
        const inputRef = createRef<HTMLInputElement>();
        const props = { className: 'wonderful-styles', 'data-sample': 'Sample' } as InputGroupProps;
        const screen = await render(
            <InputGroup ref={ref} inputRef={inputRef} aria-label="Spread" addOnText="$" {...props} />
        );
        const group = screen.container.firstElementChild!;
        expect(group.tagName).toBe('DIV');
        expect(ref.current).toBe(group);
        expect(inputRef.current).toBe(group.querySelector('input'));
        expect(group.getAttribute('data-sample')).toBe('Sample');
        expect(group.classList).toContain('wonderful-styles');
        // aria-label goes to the input, not the group
        expect(group.hasAttribute('aria-label')).toBe(false);
        expect(inputRef.current!.getAttribute('aria-label')).toBe('Spread');
        // the field classes stay
        expect(getComputedStyle(group).height).toBe('36px');
    });

    it('styles the input as the group input, and spreads props on inputs and addons', async () => {
        const screen = await render(
            <InputGroup>
                <InputGroupAddon data-sample="Addon">$</InputGroupAddon>
                <InputGroupInput aria-label="Amount" data-sample="Input" className="wonderful-styles" />
            </InputGroup>
        );
        const addon = screen.container.querySelector<HTMLElement>('[data-sample="Addon"]')!;
        const input = screen.container.querySelector<HTMLInputElement>('[data-sample="Input"]')!;
        expect(addon.tagName).toBe('SPAN');
        expect(input.classList).toContain('wonderful-styles');
        // the group draws the field: the input has no border or background of its own
        expect(getComputedStyle(input).borderBottomWidth).toBe('0px');
        expect(getComputedStyle(input).backgroundColor).toBe('rgba(0, 0, 0, 0)');
        expect(getComputedStyle(addon).borderBottomWidth).toBe('0px');
    });

    describe('addon accessible names', () => {
        const setupAddon = async (props: Partial<InputGroupProps>) => {
            const screen = await render(<InputGroup aria-label="Field" {...props} />);
            const addon = screen.container.querySelector('input')!.nextElementSibling as HTMLElement;
            return {
                addon,
                icon: addon.querySelector<HTMLElement>('[data-glyph]'),
                button: addon.querySelector('button')
            };
        };

        it('names the icon of a non-button addon with glyphAriaLabel, not the addon', async () => {
            const { addon, icon } = await setupAddon({ glyph: 'search', glyphAriaLabel: 'Search icon' });
            expect(addon.hasAttribute('aria-label')).toBe(false);
            expect(icon!.getAttribute('role')).toBe('img');
            expect(icon!.getAttribute('aria-label')).toBe('Search icon');
        });

        it('falls back to the glyph name for the icon of a non-button addon', async () => {
            const { addon, icon } = await setupAddon({ glyph: 'search' });
            expect(addon.hasAttribute('aria-label')).toBe(false);
            expect(icon!.getAttribute('role')).toBe('img');
            expect(icon!.getAttribute('aria-label')).toBe('search');
        });

        it('has no labelled icon in a text-only addon', async () => {
            const { addon, icon } = await setupAddon({ addOnText: 'USD' });
            expect(icon).toBeNull();
            expect(addon.hasAttribute('aria-label')).toBe(false);
            expect(addon.textContent?.trim()).toBe('USD');
        });

        it('falls back to the glyph name for a button addon without glyphAriaLabel', async () => {
            const { button } = await setupAddon({ glyph: 'search', button: true });
            expect(button!.getAttribute('aria-label')).toBe('search');
        });

        it('names a button addon without glyph by its addOnText', async () => {
            const { button } = await setupAddon({ addOnText: 'USD', button: true });
            // the text is the visible label of the button; with aria-label it must match it
            expect(button!.getAttribute('aria-label') ?? button!.textContent?.trim()).toBe('USD');
            expect(button!.textContent?.trim()).toBe('USD');
            expect(button!.querySelector('[data-glyph]')).toBeNull();
        });
    });
});
