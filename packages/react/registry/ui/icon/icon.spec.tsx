import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Icon, iconGlyphChar, type IconProps, type IconSize } from './icon';

async function setup(props: IconProps = { glyph: 'accept' }) {
    const screen = await render(
        <div>
            <Icon id="icon" {...props} />
            <span id="probe" />
        </div>
    );
    const icon = () => screen.container.querySelector<HTMLElement>('#icon')!;
    const probe = screen.container.querySelector<HTMLElement>('#probe')!;
    /** The computed colour of a theme variable, to compare with the icon's colours. */
    const resolve = (variable: string) => {
        probe.style.color = `var(${variable})`;
        return getComputedStyle(probe).color;
    };
    return {
        icon,
        resolve,
        before: () => getComputedStyle(icon(), '::before'),
        update: (next: IconProps) =>
            screen.rerender(
                <div>
                    <Icon id="icon" {...next} />
                    <span id="probe" />
                </div>
            )
    };
}

describe('Icon', () => {
    afterEach(() => document.documentElement.removeAttribute('dir'));

    it('resolves glyph names of SAP-icons, TNT and Business Suite fonts; unknown glyph renders nothing', async () => {
        const { icon, before, update } = await setup();
        expect(icon().dataset['glyph']).toBe(String.fromCodePoint(0xe05b));
        expect(before().content).toBe(`"${String.fromCodePoint(0xe05b)}"`);
        expect(before().fontFamily).toContain('SAP-icons');

        await update({ font: 'SAP-icons-TNT', glyph: 'actor' });
        expect(icon().dataset['glyph']).toBe(String.fromCodePoint(0xe03c));
        expect(before().fontFamily).toContain('SAP-icons-TNT');

        await update({ font: 'BusinessSuiteInAppSymbols', glyph: 'add-note' });
        expect(icon().dataset['glyph']).toBe(String.fromCodePoint(0xe008));
        expect(before().fontFamily).toContain('SAP-icons-Business-Suite');

        // a name of another font does not resolve
        await update({ font: 'BusinessSuiteInAppSymbols', glyph: 'accept' });
        expect(icon().hasAttribute('data-glyph')).toBe(false);
        await update({ glyph: 'no-such-glyph' });
        expect(icon().hasAttribute('data-glyph')).toBe(false);
        expect(before().content).toBe('""');
        await update({ glyph: null });
        expect(icon().hasAttribute('data-glyph')).toBe(false);
        expect(iconGlyphChar('accept')).toBe(String.fromCodePoint(0xe05b));
        expect(iconGlyphChar('nope')).toBe('');
    });

    it('mirrored glyphs flip in RTL', async () => {
        const { icon, update } = await setup({ glyph: 'arrow-left' });
        expect(getComputedStyle(icon()).scale).toBe('none');

        document.documentElement.dir = 'rtl';
        expect(getComputedStyle(icon()).scale.startsWith('-1')).toBe(true);

        // glyphs without a mirrored form keep their direction
        await update({ glyph: 'accept' });
        expect(getComputedStyle(icon()).scale).toBe('none');
    });

    it('decorative icons are aria-hidden; aria-label makes them role img', async () => {
        const { icon, update } = await setup();
        expect(icon().getAttribute('aria-hidden')).toBe('true');
        expect(icon().getAttribute('role')).toBe('presentation');
        expect(icon().hasAttribute('aria-label')).toBe(false);

        await update({ glyph: 'accept', 'aria-label': 'Accepted' });
        expect(icon().getAttribute('role')).toBe('img');
        expect(icon().getAttribute('aria-label')).toBe('Accepted');
        expect(icon().hasAttribute('aria-hidden')).toBe(false);

        // an explicit aria-hidden wins
        await update({ glyph: 'accept', 'aria-label': 'Accepted', 'aria-hidden': true });
        expect(icon().getAttribute('aria-hidden')).toBe('true');
        await update({ glyph: 'accept', 'aria-hidden': false });
        expect(icon().getAttribute('aria-hidden')).toBe('false');
    });

    it('size, color and background variants', async () => {
        const { icon, resolve, update } = await setup();
        const sizes: [IconSize, string][] = [
            ['default', '16px'],
            ['sm', '16px'],
            ['md', '32px'],
            ['lg', '48px'],
            ['xl', '64px'],
            ['xxl', '80px']
        ];
        for (const [size, px] of sizes) {
            await update({ glyph: 'accept', size });
            expect(getComputedStyle(icon()).fontSize).toBe(px);
        }

        // inherits the text colour by default
        icon().parentElement!.style.color = 'rgb(1, 2, 3)';
        expect(getComputedStyle(icon()).color).toBe('rgb(1, 2, 3)');
        await update({ glyph: 'accept', color: 'negative' });
        expect(getComputedStyle(icon()).color).toBe(resolve('--sapNegativeElementColor'));
        await update({ glyph: 'accept', color: 'information' });
        expect(getComputedStyle(icon()).color).toBe(resolve('--sapInformativeElementColor'));
        expect(getComputedStyle(icon()).backgroundColor).toBe('rgba(0, 0, 0, 0)');

        // a background switches the glyph to the contrasting colour
        await update({ glyph: 'accept', background: 'positive' });
        expect(getComputedStyle(icon()).backgroundColor).toBe(resolve('--sapPositiveElementColor'));
        expect(getComputedStyle(icon()).color).toBe(resolve('--sapGroup_ContentBackground'));
    });

    it('passes className, native attributes, event handlers and the ref through', async () => {
        const onClick = vi.fn();
        const ref = createRef<HTMLSpanElement>();
        const { icon } = await setup({ glyph: 'accept', className: 'm-1', title: 'Hint', onClick, ref });
        expect(icon().classList.contains('m-1')).toBe(true);
        expect(icon().title).toBe('Hint');
        expect(ref.current).toBe(icon());
        icon().click();
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
