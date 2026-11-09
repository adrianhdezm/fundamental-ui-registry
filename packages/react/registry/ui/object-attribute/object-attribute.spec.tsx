import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { ObjectAttribute, type ObjectAttributeProps } from './object-attribute';

async function setup(initial: ObjectAttributeProps & { width?: string } = {}) {
    let current: ObjectAttributeProps & { width?: string } = {
        label: 'Manufacturer',
        children: ': Titanium',
        ...initial
    };
    const clicks: string[] = [];
    const ui = ({ width = 'auto', ...p }: ObjectAttributeProps & { width?: string }) => (
        <div>
            <button id="before">Before</button>
            <div style={{ width }}>
                <ObjectAttribute id="oa" onObjectAttributeClick={(event) => clicks.push(event.type)} {...p} />
            </div>
            <div id="away" style={{ height: 20 }} />
        </div>
    );
    const screen = await render(ui(current));
    // keep the pointer of earlier tests off the element
    await userEvent.hover(document.getElementById('away')!);
    const element = () => document.getElementById('oa')!;
    return {
        clicks,
        element,
        link: () => element().querySelector<HTMLElement>('span'),
        update: async (change: ObjectAttributeProps & { width?: string }) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('ObjectAttribute', () => {
    it('renders the label and the value as plain text without a link', async () => {
        const { element, link } = await setup();
        expect(element().textContent?.trim()).toBe('Manufacturer: Titanium');
        expect(link()).toBeNull();
        expect(element().querySelector('[role="link"]')).toBeNull();
    });

    it('shows linkText as plain text without a link role or tab stop when isLink is off', async () => {
        const { clicks, link } = await setup({ linkText: 'Jane Doe' });
        expect(link()?.textContent).toBe('Jane Doe');
        expect(link()?.getAttribute('role')).toBeNull();
        expect(link()?.hasAttribute('tabindex')).toBe(false);
        await userEvent.click(link()!);
        expect(clicks).toEqual([]);
    });

    it('with isLink renders a focusable link that calls onObjectAttributeClick on click and Enter', async () => {
        const { clicks, link } = await setup({ linkText: 'Jane Doe', isLink: true });
        expect(link()?.getAttribute('role')).toBe('link');
        expect(link()?.getAttribute('tabindex')).toBe('0');
        expect(link()?.getAttribute('aria-disabled')).toBeNull();
        expect(link()?.getAttribute('title')).toBe('Jane Doe');

        await userEvent.click(link()!);
        expect(clicks).toEqual(['click']);

        document.getElementById('before')!.focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(link());
        await userEvent.keyboard('{Enter}');
        expect(clicks).toEqual(['click', 'keydown']);
        // other keys do not activate it
        await userEvent.keyboard(' ');
        expect(clicks).toEqual(['click', 'keydown']);
    });

    it('disabled link is removed from the tab order, marked aria-disabled and does not activate', async () => {
        const { clicks, link, update } = await setup({ linkText: 'Jane Doe', isLink: true, disabled: true });
        expect(link()?.getAttribute('tabindex')).toBe('-1');
        expect(link()?.getAttribute('aria-disabled')).toBe('true');
        expect(getComputedStyle(link()!).pointerEvents).toBe('none');
        expect(getComputedStyle(link()!).opacity).toBe('0.4');

        link()!.click();
        link()!.focus();
        await userEvent.keyboard('{Enter}');
        expect(clicks).toEqual([]);

        await update({ disabled: false });
        expect(link()?.getAttribute('tabindex')).toBe('0');
        link()!.click();
        expect(clicks).toEqual(['click']);
    });

    it('uses the link colour only for action links, underlined on hover', async () => {
        const { element, link, update } = await setup({ linkText: 'Jane Doe' });
        expect(getComputedStyle(link()!).color).toBe(getComputedStyle(element()).color);
        await update({ isLink: true });
        expect(getComputedStyle(link()!).color).not.toBe(getComputedStyle(element()).color);
        expect(getComputedStyle(link()!).cursor).toBe('pointer');
        expect(getComputedStyle(link()!).textDecorationLine).toBe('none');
        await userEvent.hover(link()!);
        expect(getComputedStyle(link()!).textDecorationLine).toBe('underline');
    });

    it('truncates to a single line with an ellipsis and keeps the label as title', async () => {
        const long = 'A very long attribute label that does not fit into the narrow container';
        const { element, update } = await setup();
        await update({ label: long, width: '120px' });
        const style = getComputedStyle(element());
        expect(style.textOverflow).toBe('ellipsis');
        expect(style.whiteSpace).toBe('nowrap');
        expect(element().scrollWidth).toBeGreaterThan(element().clientWidth);
        expect(element().getBoundingClientRect().width).toBeLessThanOrEqual(120);
        expect(element().getAttribute('title')).toBe(long);
    });

    it('has no title without a label', async () => {
        const { element, update } = await setup();
        await update({ label: null });
        expect(element().hasAttribute('title')).toBe(false);
        expect(element().textContent?.trim()).toBe(': Titanium');
    });

    it('passes className, native props and the ref through; render swaps the element', async () => {
        const ref = createRef<HTMLSpanElement>();
        const screen = await render(
            <div>
                <ObjectAttribute ref={ref} label="Owner" className="m-1" title="Hint" data-testid="spread" />
                <ObjectAttribute render={<div />} id="as-div" label="Block" />
            </div>
        );
        const element = screen.container.querySelector<HTMLElement>('[data-testid="spread"]')!;
        expect(ref.current).toBe(element);
        expect(element.tagName).toBe('SPAN');
        expect(element.classList.contains('m-1')).toBe(true);
        // a title of its own wins over the label
        expect(element.title).toBe('Hint');
        expect(screen.container.querySelector('#as-div')!.tagName).toBe('DIV');
    });
});
