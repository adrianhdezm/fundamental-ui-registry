import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { InfoLabel, type InfoLabelProps } from './info-label';

function Host(props: InfoLabelProps) {
    return (
        <div>
            <InfoLabel id="label" {...props} />
            <span id="probe" />
        </div>
    );
}

async function setup(initial: InfoLabelProps = { children: 'In stock' }) {
    let current = initial;
    const screen = await render(<Host {...current} />);
    const root = screen.container;
    const label = () => root.querySelector<HTMLElement>('#label')!;
    const probe = root.querySelector<HTMLElement>('#probe')!;
    return {
        label,
        icon: () => label().querySelector<HTMLElement>('[data-glyph]'),
        text: () => label().querySelector<HTMLElement>(':scope > span:not(.sr-only-sap):not([data-glyph])'),
        srOnly: () => label().querySelector<HTMLElement>('.sr-only-sap'),
        resolve: (variable: string) => {
            probe.style.color = `var(${variable})`;
            return getComputedStyle(probe).color;
        },
        update: async (change: Partial<InfoLabelProps>) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
        }
    };
}

describe('InfoLabel', () => {
    afterEach(() => document.documentElement.removeAttribute('data-sap-theme'));

    it('colors 1–10 use the accent tokens (high contrast palette in HCB/HCW)', async () => {
        const { label, resolve, update } = await setup();
        // default colour 7
        expect(getComputedStyle(label()).backgroundColor).toBe(resolve('--sapAvatar_7_Background'));
        expect(getComputedStyle(label()).color).toBe(resolve('--sapAvatar_7_TextColor'));

        for (let c = 1; c <= 10; c++) {
            await update({ color: c as InfoLabelProps['color'] });
            expect(getComputedStyle(label()).backgroundColor).toBe(resolve(`--sapAvatar_${c}_Background`));
            expect(getComputedStyle(label()).color).toBe(resolve(`--sapAvatar_${c}_TextColor`));
            expect(getComputedStyle(label()).borderColor).toBe(resolve(`--sapAvatar_${c}_Background`));
        }
        // strings work too; out-of-range values fall back to 7
        await update({ color: '3' });
        expect(getComputedStyle(label()).backgroundColor).toBe(resolve('--sapAvatar_3_Background'));
        await update({ color: 42 as InfoLabelProps['color'] });
        expect(getComputedStyle(label()).backgroundColor).toBe(resolve('--sapAvatar_7_Background'));
        await update({ color: null });
        expect(getComputedStyle(label()).backgroundColor).toBe(resolve('--sapAvatar_7_Background'));

        await update({ color: 1 });
        const horizon = getComputedStyle(label()).backgroundColor;
        document.documentElement.setAttribute('data-sap-theme', 'sap_horizon_hcb');
        expect(getComputedStyle(label()).backgroundColor).toBe('rgb(54, 36, 1)');
        expect(getComputedStyle(label()).color).toBe('rgb(253, 165, 3)');
        expect(getComputedStyle(label()).backgroundColor).not.toBe(horizon);
        document.documentElement.setAttribute('data-sap-theme', 'sap_horizon_hcw');
        expect(getComputedStyle(label()).backgroundColor).toBe('rgb(255, 194, 24)');
        expect(getComputedStyle(label()).color).toBe('rgb(95, 41, 0)');
    });

    it('label with glyph, glyph only (needs aria-label), numeric type', async () => {
        const { label, icon, text, update } = await setup();
        expect(icon()).toBeNull();
        expect(text()!.textContent).toBe('In stock');

        await update({ type: 'icon', glyph: 'employee', children: 'Owner' });
        expect(label().dataset['type']).toBe('icon');
        expect(icon()!.dataset['glyph']).toBeTruthy();
        expect(icon()!.getAttribute('aria-hidden')).toBe('true');
        expect(icon()!.compareDocumentPosition(text()!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        // icon and text sit side by side, vertically centred
        const ir = icon()!.getBoundingClientRect();
        const tr = text()!.getBoundingClientRect();
        expect(ir.right).toBeLessThanOrEqual(tr.left);
        expect(Math.abs(ir.top + ir.height / 2 - (tr.top + tr.height / 2))).toBeLessThanOrEqual(1);
        expect(getComputedStyle(icon()!).fontSize).toBe('12px');

        // glyph only: the icon carries the accessible name
        await update({ children: undefined, 'aria-label': 'Employee' });
        expect(text()).toBeNull();
        expect(icon()!.getAttribute('role')).toBe('img');
        expect(icon()!.getAttribute('aria-label')).toBe('Employee');
        expect(label().hasAttribute('aria-label')).toBe(false);
        await expect.element(page.getByRole('img', { name: 'Employee' })).toBeInTheDocument();

        // numeric: the label holds the number, title explains it
        await update({ type: 'numeric', glyph: null, 'aria-label': undefined, children: '42k', title: 'Users' });
        expect(label().dataset['type']).toBe('numeric');
        expect(icon()).toBeNull();
        expect(text()!.textContent).toBe('42k');
        expect(label().title).toBe('Users');
        expect(label().getBoundingClientRect().height).toBe(22);
    });

    it('aria-label and aria-labelledby of a text label go to the text', async () => {
        const { label, text, icon, update } = await setup();
        expect(text()!.hasAttribute('aria-label')).toBe(false);
        await update({ glyph: 'employee', 'aria-label': 'Status: in stock', 'aria-labelledby': 'probe' });
        expect(text()!.getAttribute('aria-label')).toBe('Status: in stock');
        expect(text()!.getAttribute('aria-labelledby')).toBe('probe');
        expect(label().hasAttribute('aria-label')).toBe(false);
        expect(label().hasAttribute('aria-labelledby')).toBe(false);
        // not repeated on the icon
        expect(icon()!.hasAttribute('aria-label')).toBe(false);
    });

    it('display variant and srText for assistive technology', async () => {
        const { label, text, srOnly, update } = await setup();
        expect(label().getBoundingClientRect().height).toBe(22);
        expect(getComputedStyle(text()!).fontSize).toBe('14px');

        await update({ display: true });
        expect(label().getBoundingClientRect().height).toBe(16);
        expect(getComputedStyle(text()!).fontSize).toBe('12px');

        expect(srOnly()!.textContent).toBe('Info Label');
        expect(srOnly()!.getBoundingClientRect().width).toBeLessThanOrEqual(1);
        await update({ srText: 'Stock status' });
        expect(srOnly()!.textContent).toBe('Stock status');
        // the hidden text takes no space in the flex row
        const width = label().getBoundingClientRect().width;
        await update({ srText: '' });
        expect(srOnly()).toBeNull();
        expect(label().getBoundingClientRect().width).toBe(width);
    });

    it('renders the SAP info label box and typography', async () => {
        const { label, text } = await setup();
        const style = getComputedStyle(label());
        expect(label().tagName).toBe('SPAN');
        expect(style.display).toBe('inline-flex');
        expect(style.alignItems).toBe('center');
        expect(style.borderTopWidth).toBe('1px');
        expect(style.borderTopStyle).toBe('solid');
        expect(style.borderTopLeftRadius).toBe('4px');
        expect(style.paddingLeft).toBe('6px');
        expect(style.columnGap).toBe('4px');
        expect(style.fontFamily.startsWith('"72"')).toBe(true);
        expect(getComputedStyle(text()!).fontFamily).toContain('72-SemiboldDuplex');
        expect(getComputedStyle(text()!).fontWeight).toBe('400');
    });

    it('passes className, native props and the ref through (fundamental-react)', async () => {
        const ref = createRef<HTMLSpanElement>();
        const screen = await render(
            <InfoLabel ref={ref} className="ms-2" data-sample="Sample" onClick={() => {}}>
                Default
            </InfoLabel>
        );
        const label = screen.container.querySelector<HTMLElement>('[data-sample]')!;
        expect(ref.current).toBe(label);
        expect(label.tagName).toBe('SPAN');
        expect(label.dataset['sample']).toBe('Sample');
        expect(label.classList.contains('ms-2')).toBe(true);
        expect(label.classList.contains('inline-flex')).toBe(true);
        // an empty label renders only the hidden text
        await screen.rerender(<InfoLabel ref={ref} data-sample="Empty" />);
        expect(ref.current!.children).toHaveLength(1);
    });
});
