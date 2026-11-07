import {
    createRef,
    useState,
    type MouseEvent as ReactMouseEvent,
    type KeyboardEvent as ReactKeyboardEvent
} from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Token, Tokenizer, TokenizerInput, type TokenProps, type TokenizerActions, type TokenizerProps } from './token';

const wait = (ms = 50) => new Promise((r) => setTimeout(r, ms));
const options = () => [...document.querySelectorAll<HTMLElement>('[role=option]')];
const focused = () => document.activeElement?.textContent?.trim();
const selectedStates = () => options().map((o) => o.getAttribute('aria-selected'));

interface TokenHostProps extends TokenProps {
    clicks?: (ReactMouseEvent<HTMLElement> | ReactKeyboardEvent<HTMLElement>)[];
    closes?: (ReactMouseEvent<HTMLElement> | undefined)[];
    focusEvents?: boolean[];
}

/** A token in a listbox, recording its events, as the Angular test host. */
function TokenHost({ clicks = [], closes = [], focusEvents = [], ...props }: TokenHostProps) {
    return (
        <div role="listbox" aria-label="Tokens">
            <Token
                onTokenClick={(e) => clicks.push(e)}
                onCloseClick={(e) => closes.push(e)}
                onFocusChange={(f) => focusEvents.push(f)}
                {...props}
            >
                Apple
            </Token>
        </div>
    );
}

const tokenEl = () => document.querySelector<HTMLElement>('[role=option]')!;
const closeEl = () => document.querySelector<HTMLElement>('[role=option] > [aria-hidden=true]');

interface HostProps extends Omit<TokenizerProps, 'children'> {
    width?: string;
    initial?: string[];
    onValues?: (values: string[]) => void;
}

/** Mirrors the Angular test host: a tokenizer whose tokens remove themselves, and a button outside. */
function Host({ width = '40rem', initial = ['Apple', 'Banana', 'Cherry'], onValues, ...props }: HostProps) {
    const [values, setValues] = useState(initial);
    const remove = (value: string) =>
        setValues((current) => {
            const next = current.filter((x) => x !== value);
            onValues?.(next);
            return next;
        });
    return (
        <>
            <div style={{ width }}>
                <Tokenizer input={<TokenizerInput aria-label="Values" />} {...props}>
                    {values.map((value) => (
                        <Token key={value} onCloseClick={() => remove(value)}>
                            {value}
                        </Token>
                    ))}
                </Tokenizer>
            </div>
            <button type="button">Outside</button>
        </>
    );
}

const FIVE = ['Apple', 'Banana', 'Cherry', 'Dragon fruit', 'Elderberry'];

async function setup(props: HostProps = {}) {
    const values = { current: props.initial ?? ['Apple', 'Banana', 'Cherry'] };
    const screen = await render(<Host {...props} onValues={(v) => (values.current = v)} />);
    await wait();
    return { screen, values, input: document.querySelector('input')! };
}

describe('Token', () => {
    it('emits onTokenClick on click, Enter and Space', async () => {
        const clicks: TokenHostProps['clicks'] = [];
        await render(<TokenHost clicks={clicks} />);
        await userEvent.click(tokenEl());
        expect(clicks).toHaveLength(1);
        expect(clicks[0].type).toBe('click');
        tokenEl().focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        expect(clicks).toHaveLength(3);
        expect(clicks.slice(1).map((e) => (e as ReactKeyboardEvent).key)).toEqual(['Enter', ' ']);
        await userEvent.keyboard('a');
        expect(clicks).toHaveLength(3);
    });

    it('emits onCloseClick from the close icon only, without selecting the token', async () => {
        const clicks: TokenHostProps['clicks'] = [];
        const closes: TokenHostProps['closes'] = [];
        await render(<TokenHost clicks={clicks} closes={closes} />);
        await userEvent.click(closeEl()!);
        expect(closes).toHaveLength(1);
        expect(closes[0]?.type).toBe('click');
        // the click stops at the close icon
        expect(clicks).toHaveLength(0);
        expect(tokenEl().getAttribute('aria-selected')).toBe('false');

        // a click on the text is a token click, not a close click
        await userEvent.click(tokenEl().firstElementChild as HTMLElement);
        expect(closes).toHaveLength(1);
        expect(clicks).toHaveLength(1);
    });

    it('is a focusable option described as a token, selected through its props', async () => {
        const screen = await render(<TokenHost />);
        const token = tokenEl();
        expect(token.getAttribute('role')).toBe('option');
        expect(token.getAttribute('tabindex')).toBe('0');
        expect(token.getAttribute('aria-roledescription')).toBe('token');
        expect(token.getAttribute('aria-selected')).toBe('false');
        const background = getComputedStyle(token).backgroundColor;
        await screen.rerender(<TokenHost selected />);
        expect(tokenEl().getAttribute('aria-selected')).toBe('true');
        expect(getComputedStyle(tokenEl()).backgroundColor).not.toBe(background);
    });

    it('emits onFocusChange on focus and blur', async () => {
        const focusEvents: boolean[] = [];
        await render(<TokenHost focusEvents={focusEvents} />);
        tokenEl().focus();
        expect(focusEvents).toEqual([true]);
        tokenEl().blur();
        expect(focusEvents).toEqual([true, false]);
    });

    it('does not emit onCloseClick when disabled and is aria-disabled', async () => {
        const closes: TokenHostProps['closes'] = [];
        await render(<TokenHost disabled closes={closes} />);
        expect(tokenEl().getAttribute('aria-disabled')).toBe('true');
        closeEl()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(closes).toHaveLength(0);
    });

    it('has no close icon when read-only', async () => {
        const screen = await render(<TokenHost readOnly />);
        expect(closeEl()).toBeNull();
        await screen.rerender(<TokenHost readOnly={false} />);
        expect(closeEl()).not.toBeNull();
    });

    it('works uncontrolled with defaultSelected and reports onSelectedChange in a tokenizer', async () => {
        const onSelectedChange = vi.fn();
        await render(
            <Tokenizer>
                <Token defaultSelected>Apple</Token>
                <Token onSelectedChange={onSelectedChange}>Banana</Token>
            </Tokenizer>
        );
        expect(selectedStates()).toEqual(['true', 'false']);
        await userEvent.click(options()[1]);
        expect(onSelectedChange).toHaveBeenCalledWith(true);
        expect(selectedStates()).toEqual(['false', 'true']);
    });

    it('passes native props, className and the ref to the option (fundamental-react)', async () => {
        const ref = createRef<HTMLSpanElement>();
        await render(
            <div role="listbox" aria-label="Tokens">
                <Token ref={ref} data-sample="Sample" className="custom" aria-roledescription="filter">
                    Apple
                </Token>
            </div>
        );
        expect(ref.current).toBe(tokenEl());
        expect(ref.current?.tagName).toBe('SPAN');
        expect(tokenEl().dataset['sample']).toBe('Sample');
        expect(tokenEl().classList).toContain('custom');
        expect(tokenEl().getAttribute('aria-roledescription')).toBe('filter');
    });

    it('is shorter in compact density', async () => {
        const screen = await render(<TokenHost />);
        expect(tokenEl().getBoundingClientRect().height).toBe(26);
        await screen.rerender(
            <div data-density="compact">
                <TokenHost />
            </div>
        );
        expect(tokenEl().getBoundingClientRect().height).toBe(20);
    });
});

describe('Tokenizer', () => {
    afterEach(() => document.documentElement.removeAttribute('dir'));

    it('lists tokens as options with their positions', async () => {
        await setup();
        const listbox = document.querySelector('[role=listbox]')!;
        expect(listbox.getAttribute('aria-label')).toBe('Tokenizer');
        expect(listbox.getAttribute('aria-multiselectable')).toBe('true');
        expect(options()).toHaveLength(3);
        expect(options()[1].getAttribute('aria-posinset')).toBe('2');
        expect(options()[1].getAttribute('aria-setsize')).toBe('3');
    });

    it('moves between the input and the tokens with the arrow keys', async () => {
        const { input } = await setup();
        input.focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(focused()).toBe('Cherry');
        await userEvent.keyboard('{ArrowLeft}');
        expect(focused()).toBe('Banana');
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        expect(document.activeElement).toBe(input);
    });

    it('keeps the arrow keys in the input while the caret is not at the start', async () => {
        const { input } = await setup();
        input.focus();
        await userEvent.keyboard('ab{ArrowLeft}');
        expect(document.activeElement).toBe(input);
    });

    it('removes tokens with Backspace and Delete', async () => {
        const { values, input } = await setup();
        input.focus();
        await userEvent.keyboard('{Backspace}');
        expect(focused()).toBe('Cherry');
        await userEvent.keyboard('{Backspace}');
        await wait();
        expect(values.current).toEqual(['Apple', 'Banana']);
        expect(focused()).toBe('Banana');
        await userEvent.keyboard('{Delete}');
        await wait();
        expect(values.current).toEqual(['Apple']);
        expect(document.activeElement).toBe(input);
    });

    it('keeps the tokens with disableKeyboardDeletion', async () => {
        const { values, input } = await setup({ disableKeyboardDeletion: true });
        input.focus();
        await userEvent.keyboard('{ArrowLeft}{Backspace}{Delete}');
        await wait();
        expect(values.current).toEqual(['Apple', 'Banana', 'Cherry']);
        expect(options()).toHaveLength(3);
    });

    it('selects with clicks, Shift clicks and Ctrl+A', async () => {
        const { input } = await setup();
        await userEvent.click(options()[0]);
        expect(options()[0].getAttribute('aria-selected')).toBe('true');
        // a Shift click selects the range
        options()[2].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
        await wait(0);
        expect(options().filter((o) => o.getAttribute('aria-selected') === 'true')).toHaveLength(3);
        await userEvent.click(document.querySelector<HTMLElement>('button')!);
        await wait(0);
        expect(options().filter((o) => o.getAttribute('aria-selected') === 'true')).toHaveLength(0);
        input.focus();
        await userEvent.keyboard('{Control>}a{/Control}');
        expect(options().filter((o) => o.getAttribute('aria-selected') === 'true')).toHaveLength(3);
    });

    it('removes the selected tokens together with Backspace from the input', async () => {
        const { values, input } = await setup();
        input.focus();
        await userEvent.keyboard('{Control>}a{/Control}{Backspace}');
        await wait();
        expect(values.current).toEqual([]);
        expect(document.activeElement).toBe(input);
    });

    it('selects the focused token with Space and moves to the input with Enter', async () => {
        const { input } = await setup();
        await userEvent.click(options()[0]);
        input.focus();
        await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
        expect(focused()).toBe('Banana');
        await userEvent.keyboard(' ');
        // Space selects only the focused token
        expect(selectedStates()).toEqual(['false', 'true', 'false']);
        await userEvent.keyboard(' ');
        expect(options()[1].getAttribute('aria-selected')).toBe('false');
        await userEvent.keyboard('{Enter}');
        expect(document.activeElement).toBe(input);
    });

    it('collapses tokens that do not fit into an overflow link while not focused', async () => {
        const { input } = await setup({ width: '14rem', initial: FIVE });
        const more = document.querySelector<HTMLElement>('[data-tokenizer-more]')!;
        expect(more).not.toBeNull();
        expect(more.textContent).toMatch(/^\d more$/);
        input.focus();
        await wait();
        expect(document.querySelector('[data-tokenizer-more]')).toBeNull();
        expect(options().every((o) => o.offsetParent !== null)).toBe(true);
    });

    it('keeps the tokens expanded while open', async () => {
        await setup({ width: '14rem', initial: FIVE, open: true });
        expect(document.querySelector('[data-tokenizer-more]')).toBeNull();
        expect(options().every((o) => o.offsetParent !== null)).toBe(true);
    });

    it('counts externalHiddenCount in the n more link and leaves the hidden tokens to the owner', async () => {
        let moreClicks = 0;
        const onMoreClick = () => moreClicks++;
        const more = () => document.querySelector<HTMLElement>('[data-tokenizer-more]');
        const popoverList = () => document.querySelector('[data-tokenizer-popover] [role=list]');
        const { screen } = await setup({ onMoreClick });
        expect(more()).toBeNull();

        // shown with no width-hidden tokens
        await screen.rerender(<Host onMoreClick={onMoreClick} externalHiddenCount={5} />);
        await wait();
        expect(more()?.textContent?.trim()).toBe('5 more');
        await userEvent.click(more()!);
        await wait();
        expect(moreClicks).toBe(1);
        // the owner shows the hidden tokens: no popover of its own
        expect(popoverList()).toBeNull();
        more()!.focus();
        await userEvent.keyboard(' ');
        await userEvent.keyboard('{Enter}');
        expect(moreClicks).toBe(3);
        await screen.unmount();

        // added to the tokens hidden for lack of room
        const wide = await render(
            <Host onMoreClick={onMoreClick} externalHiddenCount={5} width="14rem" initial={FIVE} />
        );
        await wait(100);
        const hidden = options().filter((o) => o.offsetParent === null).length;
        expect(hidden).toBeGreaterThan(0);
        expect(more()?.textContent?.trim()).toBe(`${hidden + 5} more`);

        // back to 0: only the width-hidden tokens count, and the popover is back
        await wide.rerender(<Host onMoreClick={onMoreClick} externalHiddenCount={0} width="14rem" initial={FIVE} />);
        await wait();
        expect(more()?.textContent?.trim()).toBe(`${hidden} more`);
        await userEvent.click(more()!);
        await wait();
        expect(popoverList()).not.toBeNull();
    });

    it('only calls onMoreClick without showOverflowPopover', async () => {
        const onMoreClick = vi.fn();
        await setup({ width: '14rem', initial: FIVE, showOverflowPopover: false, onMoreClick });
        await userEvent.click(document.querySelector<HTMLElement>('[data-tokenizer-more]')!);
        await wait();
        expect(onMoreClick).toHaveBeenCalledTimes(1);
        expect(document.querySelector('[data-tokenizer-popover]')).toBeNull();
    });

    it('lists the hidden tokens in a named popover where they can be removed', async () => {
        const { values } = await setup({ width: '14rem', initial: FIVE, moreTerm: '{count} more' });
        const hidden = options()
            .filter((o) => o.offsetParent === null)
            .map((o) => o.textContent?.trim());
        expect(hidden.length).toBeGreaterThan(0);
        const more = document.querySelector<HTMLElement>('[data-tokenizer-more]')!;
        expect(more.getAttribute('role')).toBe('button');
        await userEvent.click(more);
        await wait();
        expect(more.getAttribute('aria-expanded')).toBe('true');
        const dialog = document.querySelector<HTMLElement>('[data-tokenizer-popover]')!;
        expect(dialog.getAttribute('role')).toBe('dialog');
        expect(dialog.getAttribute('aria-label')).toBe('Tokenizer');
        const items = [...dialog.querySelectorAll('li')];
        expect(items.map((li) => li.textContent?.trim())).toEqual(hidden);
        const remove = dialog.querySelector<HTMLButtonElement>('button')!;
        expect(remove.getAttribute('aria-label')).toBe(`Remove ${hidden[0]}`);
        await userEvent.click(remove);
        await wait();
        expect(values.current).not.toContain(hidden[0]);
        expect(values.current).toHaveLength(4);
    });

    it('toggles a token with a Ctrl click without clearing the others', async () => {
        await setup();
        await userEvent.click(options()[0]);
        options()[2].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
        await wait(0);
        expect(selectedStates()).toEqual(['true', 'false', 'true']);
        options()[0].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
        await wait(0);
        expect(selectedStates()).toEqual(['false', 'false', 'true']);
        options()[1].dispatchEvent(new MouseEvent('click', { bubbles: true, metaKey: true }));
        await wait(0);
        expect(selectedStates()).toEqual(['false', 'true', 'true']);
    });

    it('shows the collapsed tokens again when the tokenizer gets wider', async () => {
        const { screen } = await setup({ width: '14rem', initial: FIVE });
        expect(document.querySelector('[data-tokenizer-more]')).not.toBeNull();
        expect(options().some((o) => o.offsetParent === null)).toBe(true);
        await screen.rerender(<Host width="60rem" initial={FIVE} />);
        await wait(100);
        expect(document.querySelector('[data-tokenizer-more]')).toBeNull();
        expect(options().every((o) => o.offsetParent !== null)).toBe(true);
    });

    it('mirrors the arrow keys in RTL', async () => {
        document.documentElement.setAttribute('dir', 'rtl');
        const { input } = await setup();
        input.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(focused()).toBe('Cherry');
        await userEvent.keyboard('{ArrowRight}');
        expect(focused()).toBe('Banana');
        await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
        expect(document.activeElement).toBe(input);
    });

    it('keeps tokens in a tokenizer out of the tab order', async () => {
        await setup();
        expect(options().every((o) => o.getAttribute('tabindex') === '-1')).toBe(true);
    });

    it('announces the number of tokens when the input gets the focus', async () => {
        const { input } = await setup({ tokensCountText: '{length} tokens' });
        const live = document.querySelector('[aria-live=polite]')!;
        expect(live.textContent).toBe('');
        input.focus();
        await wait(0);
        expect(live.textContent).toBe('3 tokens');
    });

    it('removes the selected tokens and focuses a token through actionsRef', async () => {
        const actions = createRef<TokenizerActions>();
        const onRemove = vi.fn();
        await render(
            <Tokenizer actionsRef={actions}>
                <Token defaultSelected onRemove={() => onRemove('Apple')}>
                    Apple
                </Token>
                <Token onRemove={() => onRemove('Banana')}>Banana</Token>
                <Token defaultSelected onRemove={() => onRemove('Cherry')}>
                    Cherry
                </Token>
            </Tokenizer>
        );
        actions.current!.removeSelectedTokens();
        expect(onRemove.mock.calls).toEqual([['Apple'], ['Cherry']]);
        actions.current!.focusTokenElement(1);
        expect(focused()).toBe('Banana');
    });

    it('renders an addon button that keeps the focus in the input unless buttonFocusable', async () => {
        const onAddOnButtonClick = vi.fn();
        const screen = await render(
            <Host
                glyph="value-help"
                glyphAriaLabel="Value help"
                glyphHasPopup="dialog"
                onAddOnButtonClick={onAddOnButtonClick}
            />
        );
        const button = screen.getByRole('button', { name: 'Value help' }).element() as HTMLButtonElement;
        expect(button.getAttribute('tabindex')).toBe('-1');
        expect(button.getAttribute('title')).toBe('Value help');
        expect(button.getAttribute('aria-haspopup')).toBe('dialog');
        expect(button.getAttribute('aria-expanded')).toBe('false');
        const input = document.querySelector('input')!;
        input.focus();
        await userEvent.click(button);
        expect(onAddOnButtonClick).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(input);
        await screen.rerender(
            <Host
                glyph="value-help"
                glyphAriaLabel="Value help"
                glyphHasPopup="dialog"
                glyphExpanded
                buttonFocusable
                onAddOnButtonClick={onAddOnButtonClick}
            />
        );
        expect(button.getAttribute('tabindex')).toBeNull();
        expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    it('shows the focus frame, value states, read-only and disabled on the field', async () => {
        const field = () => document.querySelector<HTMLElement>('[role=listbox]')!.parentElement!.parentElement!;
        const { screen, input } = await setup();
        const border = getComputedStyle(field()).borderColor;
        const background = getComputedStyle(field()).backgroundColor;
        input.focus();
        expect(getComputedStyle(field()).outlineStyle).not.toBe('none');
        await screen.rerender(<Host state="error" />);
        expect(getComputedStyle(field()).borderColor).not.toBe(border);
        await screen.rerender(<Host readOnly />);
        expect(getComputedStyle(field()).backgroundColor).not.toBe(background);
        await screen.rerender(<Host disabled glyph="value-help" glyphAriaLabel="Value help" />);
        expect(getComputedStyle(field()).pointerEvents).toBe('none');
        expect(screen.getByRole('button', { name: 'Value help' }).element().hasAttribute('disabled')).toBe(true);
    });

    it('passes native props, className and the ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        await render(<Tokenizer ref={ref} data-sample="Sample" className="custom" />);
        expect(ref.current?.dataset['sample']).toBe('Sample');
        expect(ref.current?.classList).toContain('custom');
    });
});
