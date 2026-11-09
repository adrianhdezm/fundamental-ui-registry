import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Link, type LinkProps } from './link';

async function setup(initial: LinkProps = {}) {
    let current = initial;
    const onClick = vi.fn((event: { preventDefault(): void }) => event.preventDefault());
    const ui = (p: LinkProps) => (
        <div>
            <button id="before">Before</button>
            <Link id="link" href="#target" emphasizedLabel="Important" onClick={onClick} {...p}>
                Orders
            </Link>
            <button id="after">After</button>
            <Link id="action" tabIndex={0} role="button">
                Show more
            </Link>
            <span id="probe" />
            <div id="away" style={{ height: 20 }} />
        </div>
    );
    const screen = await render(ui(current));
    const root = screen.container;
    // keep the pointer of earlier tests off the element
    await userEvent.hover(root.querySelector<HTMLElement>('#away')!);
    const link = () => root.querySelector<HTMLAnchorElement>('#link')!;
    // read the end values of the colour and size transitions
    link().style.transition = 'none';
    const probe = root.querySelector<HTMLElement>('#probe')!;
    return {
        root,
        link,
        onClick,
        /** The span that carries the text decoration. */
        content: () => link().querySelector<HTMLElement>('span:not(.sr-only-sap)')!,
        srText: () => [...link().querySelectorAll('.sr-only-sap')].map((el) => el.textContent!.trim()),
        resolve: (variable: string) => {
            probe.style.color = `var(${variable})`;
            return getComputedStyle(probe).color;
        },
        update: async (change: LinkProps) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
            link().style.transition = 'none';
        }
    };
}

describe('Link', () => {
    it('emphasized, subtle, inverted and disabled styles; disabled link is aria-disabled and not navigable', async () => {
        const { root, link, onClick, resolve, update } = await setup();
        expect(getComputedStyle(link()).color).toBe(resolve('--sapLinkColor'));
        expect(getComputedStyle(link()).fontFamily.startsWith('"72"')).toBe(true);
        expect(link().getAttribute('aria-disabled')).toBe('false');
        expect(link().hasAttribute('tabindex')).toBe(false);

        await update({ emphasized: true });
        expect(getComputedStyle(link()).fontFamily.startsWith('"72-Bold"')).toBe(true);
        await update({ emphasized: false, subtle: true });
        expect(getComputedStyle(link()).color).toBe(resolve('--sapLink_SubtleColor'));
        await update({ subtle: false, inverted: true });
        expect(getComputedStyle(link()).color).toBe(resolve('--sapLink_InvertedColor'));

        await update({ inverted: false, disabled: true });
        expect(link().getAttribute('aria-disabled')).toBe('true');
        expect(link().getAttribute('tabindex')).toBe('-1');
        expect(getComputedStyle(link()).pointerEvents).toBe('none');
        expect(getComputedStyle(link()).opacity).toBe('0.4');

        // out of the tab order: Tab goes from the button before straight to the one after
        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement!.id).toBe('after');
        // clicks do not reach it
        const hit = document.elementFromPoint(
            link().getBoundingClientRect().left + 2,
            link().getBoundingClientRect().top + 2
        );
        expect(link().contains(hit)).toBe(false);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('is focusable and activates like a native link when enabled', async () => {
        const { root, link, onClick } = await setup();
        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(link());
        await userEvent.keyboard('{Enter}');
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('keeps the tabindex of links without href, unless disabled', async () => {
        const { root } = await setup();
        const action = root.querySelector<HTMLElement>('#action')!;
        expect(action.getAttribute('tabindex')).toBe('0');
        root.querySelector<HTMLElement>('#after')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(action);
    });

    it('underlines on hover and focus only; undecorated never; touchTarget enlarges the hit area', async () => {
        const { root, link, content, update } = await setup();
        const decoration = () => getComputedStyle(content()).textDecorationLine;
        expect(decoration()).toBe('none');
        await userEvent.hover(link());
        expect(decoration()).toBe('underline');
        await userEvent.unhover(link());
        expect(decoration()).toBe('none');
        link().focus();
        expect(decoration()).toBe('underline');
        // the underline sits 0.125rem below the text, as fundamental-styles'
        expect(getComputedStyle(content()).textUnderlineOffset).toBe('2px');
        link().blur();

        await update({ subtle: true });
        // subtle links are underlined at rest and lose the underline on hover
        expect(decoration()).toBe('underline');
        await userEvent.hover(link());
        expect(decoration()).toBe('none');
        await userEvent.unhover(link());

        await update({ subtle: false, undecorated: true });
        expect(decoration()).toBe('none');
        await userEvent.hover(link());
        expect(decoration()).toBe('none');
        link().focus();
        expect(decoration()).toBe('none');
        await userEvent.unhover(root.querySelector<HTMLElement>('#after')!);

        const height = link().getBoundingClientRect().height;
        expect(getComputedStyle(link()).lineHeight).toBe('16px');
        await update({ touchTarget: true });
        expect(getComputedStyle(link()).lineHeight).toBe('24px');
        expect(link().getBoundingClientRect().height).toBeGreaterThan(height);
        expect(link().getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
    });

    it('combines modifiers: subtle undecorated and emphasized inverted', async () => {
        const { root, link, content, resolve, update } = await setup();
        const decoration = () => getComputedStyle(content()).textDecorationLine;

        // a subtle undecorated link keeps the subtle colour and never underlines
        await update({ subtle: true, undecorated: true });
        expect(getComputedStyle(link()).color).toBe(resolve('--sapLink_SubtleColor'));
        expect(decoration()).toBe('none');
        await userEvent.hover(link());
        expect(decoration()).toBe('none');
        link().focus();
        expect(decoration()).toBe('none');
        link().blur();
        await userEvent.hover(root.querySelector<HTMLElement>('#away')!);

        // an emphasized inverted link is bold with the inverted colour
        await update({ subtle: false, undecorated: false, emphasized: true, inverted: true });
        expect(getComputedStyle(link()).color).toBe(resolve('--sapLink_InvertedColor'));
        expect(getComputedStyle(link()).fontFamily.startsWith('"72-Bold"')).toBe(true);
        await userEvent.hover(link());
        expect(getComputedStyle(link()).color).toBe(resolve('--sapLink_InvertedColor'));
    });

    it('emphasized and subtle links announce emphasizedLabel / subtleLabel', async () => {
        const { srText, update } = await setup();
        expect(srText()).toEqual([]);
        await update({ emphasized: true });
        expect(srText()).toEqual(['Important']);
        await update({ emphasized: false, subtle: true });
        expect(srText()).toEqual(['Subtle']);
    });

    it('passes className, native props and the ref through; render swaps the element', async () => {
        const ref = createRef<HTMLAnchorElement>();
        const screen = await render(
            <div>
                <Link ref={ref} href="#x" className="m-1" title="Hint" data-testid="spread">
                    Spread
                </Link>
                <Link render={<button type="button" />} id="as-button">
                    Action
                </Link>
            </div>
        );
        const link = screen.container.querySelector<HTMLAnchorElement>('[data-testid="spread"]')!;
        expect(ref.current).toBe(link);
        expect(link.tagName).toBe('A');
        expect(link.classList.contains('m-1')).toBe(true);
        expect(link.title).toBe('Hint');
        expect(screen.container.querySelector('#as-button')!.tagName).toBe('BUTTON');
    });
});
