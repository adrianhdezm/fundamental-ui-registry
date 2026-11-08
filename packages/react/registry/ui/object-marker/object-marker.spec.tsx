import { createRef, type MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { ObjectMarker, type ObjectMarkerProps } from './object-marker';

async function setup(initial: ObjectMarkerProps = {}) {
    let current: ObjectMarkerProps = { glyph: 'private', label: 'Locked', ...initial };
    const clicks: string[] = [];
    const anchorClick = (event: MouseEvent) => {
        event.preventDefault();
        clicks.push('anchor');
    };
    const ui = (p: ObjectMarkerProps) => (
        <div>
            <button id="before">Before</button>
            <ObjectMarker id="om" onClick={() => clicks.push('span')} {...p} />
            <ObjectMarker
                id="om-link"
                clickable
                label="Unsaved changes"
                render={<a href="#marker" />}
                onClick={anchorClick}
            />
        </div>
    );
    const screen = await render(ui(current));
    const marker = () => document.getElementById('om')!;
    return {
        clicks,
        marker,
        icon: () => marker().querySelector<HTMLElement>('[data-glyph]'),
        name: (element: HTMLElement) =>
            (element.getAttribute('aria-labelledby') ?? '')
                .split(' ')
                .map((id) => document.getElementById(id)?.textContent?.trim())
                .join(' '),
        update: async (change: ObjectMarkerProps) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('ObjectMarker', () => {
    it('label with glyph: icon is presentational, name is the status text and the label', async () => {
        const { marker, icon, name } = await setup();
        expect(marker().getAttribute('role')).toBeNull();
        expect(icon()?.getAttribute('role')).toBe('presentation');
        expect(icon()?.hasAttribute('title')).toBe(false);
        expect(document.getElementById('om-label')?.textContent).toBe('Locked');
        expect(name(marker())).toBe('Inactive Object Marker Locked');
        // icon before the label
        expect(icon()!.getBoundingClientRect().right).toBeLessThanOrEqual(
            document.getElementById('om-label')!.getBoundingClientRect().left + 0.5
        );
    });

    it('glyphFont passes the icon font to the marker icon', async () => {
        const { icon, update } = await setup();
        const font = () => getComputedStyle(icon()!, '::before').fontFamily;
        expect(icon()!.dataset['glyph']).toBe(String.fromCodePoint(0xe0c8));
        expect(font()).toContain('SAP-icons');
        await update({ glyphFont: 'SAP-icons-TNT', glyph: 'actor' });
        expect(icon()!.dataset['glyph']).toBe(String.fromCodePoint(0xe03c));
        expect(font()).toContain('SAP-icons-TNT');
        await update({ glyphFont: 'BusinessSuiteInAppSymbols', glyph: 'add-note' });
        expect(icon()!.dataset['glyph']).toBe(String.fromCodePoint(0xe008));
        expect(font()).toContain('SAP-icons-Business-Suite');
    });

    it('label only renders no icon', async () => {
        const { icon, name, marker, update } = await setup();
        await update({ glyph: null });
        expect(icon()).toBeNull();
        expect(name(marker())).toBe('Inactive Object Marker Locked');
    });

    it('glyph-only marker is an image named by its title (defaulting to the glyph name)', async () => {
        const { marker, icon, name, update } = await setup();
        await update({ label: null });
        expect(marker().getAttribute('role')).toBe('img');
        expect(icon()?.getAttribute('title')).toBe('private');
        expect(name(marker())).toBe('Inactive Object Marker private');

        await update({ title: 'Locked by Jane' });
        expect(icon()?.getAttribute('title')).toBe('Locked by Jane');
        expect(name(marker())).toBe('Inactive Object Marker Locked by Jane');
        // the title names the icon, not the marker
        expect(marker().hasAttribute('title')).toBe(false);
    });

    it('statusText and aria-labelledby override the accessible name', async () => {
        const { marker, name, update } = await setup();
        await update({ statusText: 'Draft' });
        expect(name(marker())).toBe('Draft Locked');
        await update({ 'aria-labelledby': 'before' });
        expect(marker().getAttribute('aria-labelledby')).toBe('before');
    });

    it('activeText and inactiveText set the default status texts', async () => {
        const { marker, name, update } = await setup({ inactiveText: 'Status' });
        expect(name(marker())).toBe('Status Locked');
        await update({ clickable: true, activeText: 'Status (active)' });
        expect(name(marker())).toBe('Status (active) Locked');
    });

    it('non-clickable markers are not in the tab order', async () => {
        const { marker } = await setup();
        expect(marker().getAttribute('tabindex')).toBe('-1');
        document.getElementById('before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).not.toBe(marker());
    });

    it('clickable marker is a focusable link announced as active', async () => {
        const { marker, name, update } = await setup();
        await update({ clickable: true });
        expect(marker().getAttribute('role')).toBe('link');
        expect(marker().getAttribute('tabindex')).toBe('0');
        expect(name(marker())).toBe('Active Object Marker Locked');
        expect(getComputedStyle(marker()).cursor).toBe('pointer');

        document.getElementById('before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(marker());
    });

    it('clickable marker activates with a click and with Enter', async () => {
        const { clicks, marker, update } = await setup();
        await update({ clickable: true });
        await userEvent.click(marker());
        expect(clicks).toEqual(['span']);
        marker().focus();
        await userEvent.keyboard('{Enter}');
        expect(clicks).toEqual(['span', 'span']);
    });

    it('Enter does not activate a non-clickable marker', async () => {
        const { clicks, marker } = await setup();
        marker().focus();
        await userEvent.keyboard('{Enter}');
        expect(clicks).toEqual([]);
    });

    it('a clickable anchor marker activates once with Enter (natively)', async () => {
        const { clicks } = await setup();
        const anchor = document.getElementById('om-link') as HTMLAnchorElement;
        expect(anchor.tagName).toBe('A');
        expect(anchor.getAttribute('role')).toBe('link');
        anchor.focus();
        await userEvent.keyboard('{Enter}');
        expect(clicks).toEqual(['anchor']);
    });

    it('clickable marker shows the filled focus style', async () => {
        const { marker, update } = await setup();
        await update({ clickable: true });
        const before = getComputedStyle(marker()).backgroundColor;
        marker().focus();
        // background transitions in over 125ms
        await new Promise((resolve) => setTimeout(resolve, 200));
        expect(document.activeElement).toBe(marker());
        expect(getComputedStyle(marker()).backgroundColor).not.toBe(before);
    });

    it('adjacent markers are spaced apart', async () => {
        const screen = await render(
            <div>
                <ObjectMarker id="a" glyph="private" />
                <ObjectMarker id="b" glyph="flag" />
            </div>
        );
        const [a, b] = ['a', 'b'].map((id) => screen.container.querySelector<HTMLElement>(`#${id}`)!);
        expect(parseFloat(getComputedStyle(a).marginInlineStart)).toBe(0);
        expect(parseFloat(getComputedStyle(b).marginInlineStart)).toBe(8);
    });

    it('passes className, native props and the ref through; render swaps the element', async () => {
        const ref = createRef<HTMLSpanElement>();
        const onKeyDown = vi.fn();
        const screen = await render(
            <div>
                <ObjectMarker ref={ref} data-sample="Sample" className="m-1" label="Draft" onKeyDown={onKeyDown} />
                <ObjectMarker render={<div />} id="as-div" label="Div" />
            </div>
        );
        const marker = screen.container.querySelector<HTMLElement>('[data-sample="Sample"]')!;
        expect(ref.current).toBe(marker);
        expect(marker.tagName).toBe('SPAN');
        expect(marker.classList.contains('m-1')).toBe(true);
        marker.focus();
        await userEvent.keyboard('{Enter}');
        expect(onKeyDown).toHaveBeenCalledTimes(1);
        expect(screen.container.querySelector('#as-div')!.tagName).toBe('DIV');
    });
});
