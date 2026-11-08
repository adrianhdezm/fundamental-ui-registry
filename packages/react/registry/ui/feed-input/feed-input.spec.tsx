import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    FeedInput,
    FeedInputAvatar,
    FeedInputButton,
    FeedInputTextarea,
    type FeedInputTextareaProps
} from './feed-input';

const lines = (count: number) =>
    Array.from({ length: count }, (_, i) => `line ${i + 1}`).join('{Shift>}{Enter}{/Shift}');

/** Angular's Host: a feed input whose button posts the text. */
function Host({ disabled = false, onPost }: { disabled?: boolean; onPost: (text: string) => void }) {
    const [text, setText] = useState('');
    return (
        <FeedInput aria-label="Post a comment" disabled={disabled}>
            <FeedInputTextarea aria-label="Comment" maxRows={3} value={text} onValueChange={setText} />
            <FeedInputButton onClick={() => onPost(text)} />
        </FeedInput>
    );
}

async function setup(disabled = false) {
    const onPost = vi.fn();
    const screen = await render(<Host disabled={disabled} onPost={onPost} />);
    const root = screen.container;
    return {
        onPost,
        textarea: root.querySelector('textarea')!,
        button: root.querySelector<HTMLButtonElement>('button')!,
        group: root.querySelector('[role=group]')!
    };
}

interface SizingProps {
    width?: string;
    textarea?: FeedInputTextareaProps;
}

/** Angular's SizingHost: an avatar, an uncontrolled text area and a button, in a box of the given width. */
async function setupSizing(initial: SizingProps = {}) {
    let current = initial;
    const values: string[] = [];
    const ui = (p: SizingProps) => (
        <div style={{ width: p.width ?? '600px' }}>
            <FeedInput aria-label="Post a comment">
                <FeedInputAvatar label="John Doe" />
                <FeedInputTextarea aria-label="Comment" onValueChange={(v) => values.push(v)} {...p.textarea} />
                <FeedInputButton />
            </FeedInput>
        </div>
    );
    const screen = await render(ui(current));
    const root = screen.container;
    return {
        values,
        root,
        textarea: root.querySelector('textarea')!,
        avatar: root.querySelector<HTMLElement>('[role=img]')!,
        button: root.querySelector<HTMLButtonElement>('button')!,
        update: async (change: SizingProps) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('FeedInput', () => {
    it('enables the send button once there is text', async () => {
        const { onPost, textarea, button, group } = await setup();
        expect(group.getAttribute('aria-label')).toBe('Post a comment');
        expect(button.disabled).toBe(true);
        expect(button.getAttribute('aria-disabled')).toBe('true');
        expect(button.getAttribute('aria-label')).toBe('Send');
        expect(button.getAttribute('title')).toBe('Send');
        await userEvent.type(textarea, 'Hello');
        expect(button.disabled).toBe(false);
        expect(button.hasAttribute('aria-disabled')).toBe(false);
        await userEvent.click(button);
        expect(onPost).toHaveBeenCalledWith('Hello');
        await userEvent.clear(textarea);
        expect(button.disabled).toBe(true);
        // only spaces count as empty
        await userEvent.type(textarea, '   ');
        expect(button.disabled).toBe(true);
    });

    it('grows with its text up to the maximum rows', async () => {
        const { textarea } = await setup();
        const start = textarea.offsetHeight;
        await userEvent.type(
            textarea,
            'one{Shift>}{Enter}{/Shift}two{Shift>}{Enter}{/Shift}three{Shift>}{Enter}{/Shift}four{Shift>}{Enter}{/Shift}five'
        );
        expect(textarea.offsetHeight).toBeGreaterThan(start);
        const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
        expect(parseFloat(textarea.style.maxHeight)).toBeCloseTo(lineHeight * 3, 0);
        expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
    });

    it('shrinks back when the text is removed', async () => {
        const { textarea } = await setup();
        const start = textarea.offsetHeight;
        await userEvent.type(textarea, lines(3));
        expect(textarea.offsetHeight).toBeGreaterThan(start);
        await userEvent.clear(textarea);
        expect(textarea.offsetHeight).toBe(start);
    });

    it('disables the text area and the button', async () => {
        const { textarea, button, group } = await setup(true);
        expect(textarea.disabled).toBe(true);
        expect(button.disabled).toBe(true);
        expect(getComputedStyle(group).cursor).toBe('not-allowed');
        // the placeholder stays readable
        expect(getComputedStyle(textarea).pointerEvents).toBe('auto');
    });

    it('emits onValueChange while typing', async () => {
        const { values, textarea } = await setupSizing();
        await userEvent.type(textarea, 'Hi!');
        expect(values).toEqual(['H', 'Hi', 'Hi!']);
        await userEvent.clear(textarea);
        expect(values.at(-1)).toBe('');
    });

    it('caps the height at 20rem without max rows', async () => {
        const { textarea } = await setupSizing();
        expect(textarea.style.maxHeight).toBe('');
        expect(getComputedStyle(textarea).maxHeight).toBe('320px');
        await userEvent.type(textarea, lines(30));
        expect(textarea.getBoundingClientRect().height).toBe(320);
        expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
    });

    it('computes the row cap when line-height is normal', async () => {
        const { textarea, update } = await setupSizing({
            textarea: { maxRows: 2, style: { lineHeight: 'normal', fontSize: '20px' } }
        });
        expect(getComputedStyle(textarea).lineHeight).toBe('normal');
        // like upstream, a normal line height counts as 1.1 times the font size
        expect(parseFloat(textarea.style.maxHeight)).toBeCloseTo(20 * 1.1 * 2, 5);
        // a new cap, then none
        await update({ textarea: { maxRows: 4, style: { lineHeight: 'normal', fontSize: '20px' } } });
        expect(parseFloat(textarea.style.maxHeight)).toBeCloseTo(20 * 1.1 * 4, 5);
        await update({ textarea: { maxRows: null, style: { lineHeight: 'normal', fontSize: '20px' } } });
        expect(textarea.style.maxHeight).toBe('');
    });

    it('fits an initial text and enables the button for it', async () => {
        const { textarea, button } = await setupSizing({ textarea: { defaultValue: 'Hello' } });
        expect(button.disabled).toBe(false);
        const multiline = await setupSizing({ textarea: { defaultValue: 'a\nb\nc\nd' } });
        expect(multiline.textarea.offsetHeight).toBeGreaterThan(textarea.offsetHeight);
    });

    it('hides the avatar below 20rem', async () => {
        const { avatar, update } = await setupSizing();
        expect(getComputedStyle(avatar).display).not.toBe('none');
        await update({ width: '300px' });
        expect(getComputedStyle(avatar).display).toBe('none');
        await update({ width: '400px' });
        expect(getComputedStyle(avatar).display).not.toBe('none');
    });

    it('passes className, native props and the ref through', async () => {
        const groupRef = createRef<HTMLDivElement>();
        const textareaRef = createRef<HTMLTextAreaElement>();
        const buttonRef = createRef<HTMLButtonElement>();
        const screen = await render(
            <FeedInput ref={groupRef} className="custom" data-testid="feed" aria-label="Post">
                <FeedInputAvatar label="John Doe" className="avatar-class" />
                <FeedInputTextarea ref={textareaRef} className="text-class" placeholder="Post something here" />
                <FeedInputButton ref={buttonRef} aria-label="Submit" className="button-class" />
            </FeedInput>
        );
        const root = screen.container;
        const group = root.querySelector<HTMLElement>('[data-testid=feed]')!;
        expect(groupRef.current).toBe(group);
        expect(group.getAttribute('role')).toBe('group');
        expect(group.classList.contains('custom')).toBe(true);
        expect(textareaRef.current).toBe(root.querySelector('textarea'));
        expect(textareaRef.current!.classList.contains('text-class')).toBe(true);
        expect(textareaRef.current!.rows).toBe(1);
        expect(textareaRef.current!.placeholder).toBe('Post something here');
        expect(buttonRef.current).toBe(root.querySelector('button'));
        expect(buttonRef.current!.classList.contains('button-class')).toBe(true);
        expect(buttonRef.current!.getAttribute('title')).toBe('Submit');
        expect(buttonRef.current!.type).toBe('button');
        expect(root.querySelector('.avatar-class')!.classList.contains('shrink-0')).toBe(true);
        // the send button stays cozy in compact density
        expect(buttonRef.current!.getAttribute('data-density')).toBe('cozy');
    });

    it('works outside a feed input', async () => {
        const screen = await render(
            <>
                <FeedInputTextarea aria-label="Comment" />
                <FeedInputButton />
            </>
        );
        expect(screen.container.querySelector('button')!.disabled).toBe(false);
    });
});
