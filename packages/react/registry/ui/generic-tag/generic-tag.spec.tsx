import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { GenericTag, type GenericTagProps, type GenericTagType } from './generic-tag';

type Props = Partial<GenericTagProps> & { width?: string };

async function setup(initial: Props = {}) {
    let current: Props = { name: 'Overdue', value: '12 days', ...initial };
    let clicks = 0;
    const ui = ({ width = 'auto', ...p }: Props) => (
        <div>
            <div style={{ width }}>
                <GenericTag id="tag" name="" onClick={() => clicks++} {...p} />
            </div>
            <span id="probe" />
            <div id="away" style={{ height: 20 }} />
        </div>
    );
    const screen = await render(ui(current));
    // keep the pointer of earlier tests off the element
    await userEvent.hover(document.getElementById('away')!);
    const tag = () => document.getElementById('tag')!;
    const probe = document.getElementById('probe')!;
    return {
        tag,
        clicks: () => clicks,
        icon: () => tag().querySelector<HTMLElement>('[data-glyph]'),
        texts: () => [...tag().querySelectorAll<HTMLElement>(':scope > span:not([data-glyph])')],
        resolve: (variable: string) => {
            probe.style.color = `var(${variable})`;
            return getComputedStyle(probe).color;
        },
        update: async (change: Props) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('GenericTag', () => {
    it('type (error, warning, success, information) shows the status icon and colors', async () => {
        const { tag, icon, texts, resolve, update } = await setup();
        expect(icon()).toBeNull();
        expect(getComputedStyle(tag()).backgroundColor).toBe(resolve('--sapNeutralBackground'));
        expect(getComputedStyle(tag()).backgroundImage).toContain(resolve('--sapNeutralElementColor'));

        const types: [GenericTagType, number, string, string, string][] = [
            ['error', 0xe0b1, '--sapNegativeElementColor', '--sapErrorBackground', '--sapNegativeTextColor'],
            ['warning', 0xe201, '--sapCriticalElementColor', '--sapWarningBackground', '--sapCriticalTextColor'],
            ['success', 0xe203, '--sapPositiveElementColor', '--sapSuccessBackground', '--sapPositiveTextColor'],
            [
                'information',
                0xe202,
                '--sapInformativeElementColor',
                '--sapInformationBackground',
                '--sapInformativeTextColor'
            ]
        ];
        for (const [type, glyph, element, background, text] of types) {
            await update({ type });
            expect(icon()!.dataset['glyph']).toBe(String.fromCodePoint(glyph));
            expect(icon()!.getAttribute('aria-hidden')).toBe('true');
            expect(getComputedStyle(icon()!).color).toBe(resolve(element));
            expect(getComputedStyle(tag()).backgroundColor).toBe(resolve(background));
            // status strip on the start edge
            expect(getComputedStyle(tag()).backgroundImage).toContain(resolve(element));
            expect(getComputedStyle(texts()[1]).color).toBe(resolve(text));
            expect(getComputedStyle(texts()[0]).color).toBe(resolve('--sapList_TextColor'));
        }
    });

    it('name and value are rendered and separated', async () => {
        const { texts, update } = await setup();
        expect(texts().map((el) => el.textContent!.trim())).toEqual(['Overdue', '12 days']);
        const [name, value] = texts();
        expect(value.getBoundingClientRect().left - name.getBoundingClientRect().right).toBeGreaterThanOrEqual(12);
        expect(getComputedStyle(value).marginInlineStart).toBe('12px');

        await update({ value: null });
        expect(texts().map((el) => el.textContent!.trim())).toEqual(['Overdue']);
    });

    it('role description (ariaRoleDescription) and readable name/value for assistive technology', async () => {
        const { tag, update } = await setup();
        expect(tag().getAttribute('role')).toBe('button');
        expect(tag().getAttribute('aria-roledescription')).toBe('Generic Tag');
        await expect.element(page.getByRole('button', { name: 'Overdue 12 days' })).toBeInTheDocument();

        await update({ ariaRoleDescription: 'Key figure', type: 'error' });
        expect(tag().getAttribute('aria-roledescription')).toBe('Key figure');
        // the status icon is decorative and does not add to the name
        await expect.element(page.getByRole('button', { name: 'Overdue 12 days', exact: true })).toBeInTheDocument();
    });

    it('is focusable and activates with click, Enter and Space', async () => {
        const { tag, clicks } = await setup();
        await userEvent.tab();
        expect(document.activeElement).toBe(tag());
        expect(tag().getAttribute('tabindex')).toBe('0');
        await userEvent.keyboard('{Enter}');
        expect(clicks()).toBe(1);
        await userEvent.keyboard(' ');
        expect(clicks()).toBe(2);
        await userEvent.click(tag());
        expect(clicks()).toBe(3);
        expect(getComputedStyle(tag()).cursor).toBe('pointer');
    });

    it('hover changes the background and keeps the status colours; focus shows the SAP outline', async () => {
        const { tag, texts, resolve } = await setup({ type: 'error' });
        tag().style.transition = 'none';
        await userEvent.hover(tag());
        expect(getComputedStyle(tag()).backgroundColor).toBe(resolve('--sapList_Hover_Background'));
        expect(getComputedStyle(texts()[1]).color).toBe(resolve('--sapNegativeTextColor'));
        expect(getComputedStyle(texts()[0]).textShadow).toBe('none');
        tag().focus();
        expect(getComputedStyle(tag()).outlineStyle).not.toBe('none');
        expect(getComputedStyle(tag()).outlineColor).toBe(resolve('--sapContent_FocusColor'));
    });

    it('truncation of the name with full text in title', async () => {
        const { tag, texts, update } = await setup();
        const long = 'Accumulated depreciation of fixed assets';
        await update({ name: long, width: '12rem' });
        const [name, value] = texts();
        expect(tag().getBoundingClientRect().width).toBeLessThanOrEqual(192);
        expect(getComputedStyle(name).textOverflow).toBe('ellipsis');
        expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
        expect(name.title).toBe(long);
        expect(value.title).toBe('12 days');
        // the value stays visible next to the truncated name
        expect(value.getBoundingClientRect().right).toBeLessThanOrEqual(tag().getBoundingClientRect().right);
    });

    it('passes className, native props and the ref through; render swaps the element', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <div>
                <GenericTag ref={ref} name="Cost" className="m-1" title="Hint" data-testid="spread" />
                <GenericTag render={<button type="button" />} id="as-button" name="Native" />
            </div>
        );
        const tag = screen.container.querySelector<HTMLElement>('[data-testid="spread"]')!;
        expect(ref.current).toBe(tag);
        expect(tag.tagName).toBe('DIV');
        expect(tag.classList.contains('m-1')).toBe(true);
        expect(tag.title).toBe('Hint');
        const button = screen.container.querySelector<HTMLElement>('#as-button')!;
        expect(button.tagName).toBe('BUTTON');
        expect(button.hasAttribute('role')).toBe(false);
    });
});
