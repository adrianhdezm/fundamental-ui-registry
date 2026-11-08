import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { iconGlyphChar } from '@/ui/icon/icon';
import { ProgressIndicator, type ProgressIndicatorProps, type ProgressIndicatorState } from './progress-indicator';

interface HostProps extends ProgressIndicatorProps {
    width?: string;
}

function Host({ width = '400px', ...props }: HostProps) {
    return (
        <div style={{ width }}>
            <span id="pi-label">Import progress</span>
            <ProgressIndicator aria-label="Upload" valueNow={42} {...props} />
        </div>
    );
}

const wait = (ms = 50) => new Promise((r) => setTimeout(r, ms));

async function setup(initial: HostProps = {}) {
    let current = initial;
    const screen = await render(<Host {...current} />);
    const root = screen.container;
    const bar = () => root.querySelector<HTMLElement>('[role=progressbar]')!;
    return {
        screen,
        root,
        bar,
        fill: () => bar().querySelector<HTMLElement>('[style*="width"]'),
        update: async (change: HostProps) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
        }
    };
}

/** Resolves a CSS colour (e.g. a theme variable) to its computed rgb value. */
function color(value: string): string {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const result = getComputedStyle(probe).color;
    probe.remove();
    return result;
}

describe('ProgressIndicator', () => {
    it('is a progress bar with its value', async () => {
        const { bar, fill, root } = await setup();
        expect(bar().getAttribute('aria-valuenow')).toBe('42');
        expect(bar().getAttribute('aria-valuemin')).toBe('0');
        expect(bar().getAttribute('aria-valuemax')).toBe('100');
        expect(bar().getAttribute('aria-valuetext')).toBe('42%');
        expect(bar().getAttribute('aria-label')).toBe('Upload');
        expect(fill()?.style.width).toBe('42%');
        expect(root.textContent).toContain('42%');
        // the visible text is hidden from assistive technology: the bar announces it
        const label = [...root.querySelectorAll('span')].find((s) => s.textContent === '42%')!;
        expect(label.getAttribute('aria-hidden')).toBe('true');
    });

    it('shows a text and clamps the bar', async () => {
        const { bar, fill, root, update } = await setup();
        await update({ valueText: '80 of 100 MB', valueNow: 150 });
        expect(bar().getAttribute('aria-valuetext')).toBe('80 of 100 MB');
        expect(root.textContent).toContain('80 of 100 MB');
        expect(fill()?.style.width).toBe('100%');
        await update({ valueNow: 0 });
        expect(fill()).toBeNull();
    });

    it('shows an icon for a state', async () => {
        const { root, update } = await setup();
        expect(root.querySelector('[data-glyph]')).toBeNull();
        const glyphs: [ProgressIndicatorState, string][] = [
            ['informative', 'information'],
            ['positive', 'sys-enter-2'],
            ['critical', 'alert'],
            ['negative', 'sys-cancel-2']
        ];
        for (const [state, glyph] of glyphs) {
            await update({ state });
            const icon = root.querySelector<HTMLElement>('[data-glyph]')!;
            expect(icon.getAttribute('data-glyph'), state).toBe(iconGlyphChar(glyph));
            expect(icon.getAttribute('aria-hidden')).toBe('true');
        }
    });

    it('colours the bar, the track and the icon by state', async () => {
        const { bar, fill, root, update } = await setup();
        expect(getComputedStyle(fill()!).backgroundColor).toBe(color('var(--sapProgress_Value_Background)'));
        expect(getComputedStyle(bar()).backgroundColor).toBe(color('var(--sapProgress_Background)'));
        expect(getComputedStyle(bar()).borderTopColor).toBe(color('var(--sapProgress_BorderColor)'));
        const states: [ProgressIndicatorState, string][] = [
            ['informative', 'Information'],
            ['positive', 'Positive'],
            ['critical', 'Critical'],
            ['negative', 'Negative']
        ];
        for (const [state, token] of states) {
            await update({ state });
            expect(getComputedStyle(fill()!).backgroundColor, state).toBe(
                color(`var(--sapProgress_Value_${token}Background)`)
            );
            expect(getComputedStyle(fill()!).borderTopColor, state).toBe(
                color(`var(--sapProgress_Value_${token}BorderColor)`)
            );
            expect(getComputedStyle(bar()).backgroundColor, state).toBe(color(`var(--sapProgress_${token}Background)`));
            // the glyph in the large font size and the state colour, as fundamental-styles' icon
            const glyph = getComputedStyle(root.querySelector('[data-glyph]')!, '::before');
            expect(glyph.color, state).toBe(color(`var(--sapProgress_Value_${token}TextColor)`));
            expect(glyph.fontSize).toBe('16px');
            expect(glyph.verticalAlign).toBe('middle');
        }
        // Horizon's dots at both ends of the track, in the bar colour
        const before = getComputedStyle(bar(), '::before');
        expect(before.width).toBe('4px');
        expect(before.backgroundColor).toBe(getComputedStyle(fill()!).backgroundColor);
        expect(getComputedStyle(bar(), '::after').backgroundColor).toBe(getComputedStyle(fill()!).backgroundColor);
    });

    it('shows a truncated text in full in a popover', async () => {
        const { root, update } = await setup();
        expect(root.querySelector('button')).toBeNull();
        await update({ width: '120px', valueText: 'Importing 35 of 100 records from the customer master data' });
        await wait(100);
        const label = root.querySelector<HTMLButtonElement>('button')!;
        expect(label).not.toBeNull();
        expect(label.getAttribute('aria-haspopup')).toBe('dialog');
        await userEvent.click(label);
        const dialog = document.querySelector<HTMLElement>('[role=dialog]')!;
        expect(dialog.textContent).toContain('customer master data');
        expect(dialog.getAttribute('aria-label')).toBe('Importing 35 of 100 records from the customer master data');

        // the close button closes the popover and gives the focus back to the label
        const close = dialog.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!;
        await userEvent.click(close);
        await expect.poll(() => document.querySelector('[role=dialog]')).toBeNull();
        expect(document.activeElement).toBe(label);

        // a text that fits again is a plain label
        await update({ width: '400px', valueText: 'Done' });
        await wait(100);
        expect(root.querySelector('button')).toBeNull();
    });

    it('opens the popover from the keyboard and names the close button with closeLabel', async () => {
        const { root, update } = await setup({ width: '120px', closeLabel: 'Schließen' });
        await update({ valueText: 'Importing 35 of 100 records from the customer master data' });
        await wait(100);
        const label = root.querySelector<HTMLButtonElement>('button')!;
        label.focus();
        await userEvent.keyboard('{Enter}');
        const dialog = document.querySelector<HTMLElement>('[role=dialog]')!;
        expect(dialog).not.toBeNull();
        expect(dialog.querySelector('button[aria-label="Schließen"]')).not.toBeNull();
        // as wide as the label
        expect(Math.round(dialog.getBoundingClientRect().width)).toBe(Math.round(label.getBoundingClientRect().width));
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => document.querySelector('[role=dialog]')).toBeNull();
    });

    it('computes the width relative to valueMin and valueMax', async () => {
        const { bar, fill, update } = await setup({ valueMin: 1, valueMax: 5, valueNow: 3 });
        expect(bar().getAttribute('aria-valuemin')).toBe('1');
        expect(bar().getAttribute('aria-valuemax')).toBe('5');
        expect(fill()?.style.width).toBe('50%');
        await update({ valueNow: 2 });
        expect(fill()?.style.width).toBe('25%');
        await update({ valueNow: 9 });
        expect(fill()?.style.width).toBe('100%');
        // the fill reaches the end of the track
        expect(
            Math.abs(fill()!.getBoundingClientRect().right - bar().getBoundingClientRect().right)
        ).toBeLessThanOrEqual(1);
        // an empty range shows no fill
        await update({ valueMin: 5, valueMax: 5 });
        expect(fill()).toBeNull();
    });

    it('appends the unit to the default value text', async () => {
        const { bar, root, update } = await setup();
        await update({ valueNow: 25, unit: 'MB' });
        expect(bar().getAttribute('aria-valuetext')).toBe('25MB');
        expect(root.textContent).toContain('25MB');
    });

    it('names the bar with aria-labelledby and describes it with aria-describedby', async () => {
        const { bar } = await setup({
            'aria-label': undefined,
            'aria-labelledby': 'pi-label',
            'aria-describedby': 'pi-label'
        });
        expect(bar().getAttribute('aria-labelledby')).toBe('pi-label');
        expect(bar().getAttribute('aria-describedby')).toBe('pi-label');
        expect(bar().hasAttribute('aria-label')).toBe(false);
        expect(document.getElementById('pi-label')?.textContent).toBe('Import progress');
    });

    it('animate adds a width transition', async () => {
        const { fill, update } = await setup();
        expect(getComputedStyle(fill()!).transitionProperty).not.toContain('width');
        await update({ animate: true });
        const style = getComputedStyle(fill()!);
        expect(style.transitionProperty).toContain('width');
        expect(style.transitionDuration).toBe('0.5s');
    });

    it('lays out the label above the track, the icon after it, the bar over it', async () => {
        const { root, bar, fill, update } = await setup({ state: 'positive' });
        const host = root.querySelector<HTMLElement>('[style] > div')!;
        expect(host.getBoundingClientRect().height).toBe(32);
        const track = bar().getBoundingClientRect();
        expect(track.height).toBe(6);
        expect(Math.round(track.width)).toBe(400 - 20);
        expect(track.top - host.getBoundingClientRect().top).toBe(20);
        expect(fill()!.getBoundingClientRect().height).toBe(10);
        const label = [...root.querySelectorAll('span')].find((s) => s.textContent === '42%')!;
        expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(track.top);
        // inside the track border, as fundamental-styles: the label as wide as its text, the bar from the start
        expect(label.getBoundingClientRect().left).toBe(track.left + 1);
        expect(label.getBoundingClientRect().top).toBe(host.getBoundingClientRect().top + 1);
        expect(label.getBoundingClientRect().width).toBeLessThan(100);
        expect(fill()!.getBoundingClientRect().left).toBe(track.left + 1);
        expect(fill()!.getBoundingClientRect().top).toBe(track.top - 2);
        expect(getComputedStyle(label).lineHeight).toBe('normal');
        const icon = root.querySelector<HTMLElement>('[data-glyph]')!.getBoundingClientRect();
        expect(icon.left).toBeGreaterThanOrEqual(track.right);
        // RTL: the bar starts on the right, the icon is on the left
        await update({ dir: 'rtl' });
        const rtlTrack = bar().getBoundingClientRect();
        expect(Math.abs(fill()!.getBoundingClientRect().right - rtlTrack.right)).toBeLessThanOrEqual(1);
        expect(root.querySelector<HTMLElement>('[data-glyph]')!.getBoundingClientRect().right).toBeLessThanOrEqual(
            rtlTrack.left
        );
    });

    it('passes className, native props and the ref through', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <ProgressIndicator ref={ref} className="m-4" data-testid="spread" title="Upload" aria-label="Upload" />
        );
        const el = screen.container.querySelector<HTMLElement>('[data-testid="spread"]')!;
        expect(ref.current).toBe(el);
        expect(el.classList.contains('m-4')).toBe(true);
        expect(el.getAttribute('title')).toBe('Upload');
        expect(el.hasAttribute('aria-label')).toBe(false);
    });
});
