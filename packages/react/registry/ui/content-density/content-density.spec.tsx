import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button } from '@/ui/button/button';
import {
    ContentDensity,
    contentDensityProps,
    resolveContentDensity,
    useContentDensity,
    type ContentDensityMode
} from './content-density';

function Host({ outer = null, compact = true }: { outer?: ContentDensityMode | null; compact?: boolean }) {
    return (
        <>
            <Button label="Root" data-testid="root" />
            <ContentDensity render={<section />} density={outer} data-testid="outer">
                <Button label="Outer" data-testid="outer-button" />
                <ContentDensity cozy data-testid="island">
                    <Button label="Island" data-testid="island-button" />
                </ContentDensity>
                <ContentDensity compact={compact} data-testid="toggle">
                    <Button label="Toggle" data-testid="toggle-button" />
                </ContentDensity>
            </ContentDensity>
            <ContentDensity compact data-testid="compact" />
            <ContentDensity condensed data-testid="condensed" />
            <ContentDensity cozy data-testid="cozy" />
            <ContentDensity density="condensed" compact data-testid="explicit" />
            <ContentDensity density="" data-testid="none" />
            <ContentDensity cozy render={<section />} data-testid="cozy-parent">
                <ContentDensity compact data-testid="compact-child">
                    <Button label="Compact child" data-testid="compact-child-button" />
                </ContentDensity>
            </ContentDensity>
        </>
    );
}

async function setup(outer: ContentDensityMode | null = null) {
    const screen = await render(<Host outer={outer} />);
    const el = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
    const height = (id: string) => el(id).getBoundingClientRect().height;
    return { screen, el, height };
}

/* ------------------------------------------------------------------------------------------------------------------
 * The Angular spec
 * ---------------------------------------------------------------------------------------------------------------- */

describe('ContentDensity', () => {
    it('sets data-density from the explicit density or the shorthands', async () => {
        const { el } = await setup();
        expect(el('outer').hasAttribute('data-density')).toBe(false);
        expect(el('compact').getAttribute('data-density')).toBe('compact');
        expect(el('condensed').getAttribute('data-density')).toBe('condensed');
        expect(el('cozy').getAttribute('data-density')).toBe('cozy');
        // the explicit density wins over a shorthand
        expect(el('explicit').getAttribute('data-density')).toBe('condensed');
        // an empty density sets none
        expect(el('none').hasAttribute('data-density')).toBe(false);
    });

    it('data-density="compact" on an ancestor switches compact: utilities on descendants', async () => {
        const { screen, el, height } = await setup();
        const cozy = height('outer-button');
        expect(cozy).toBe(height('root'));

        await screen.rerender(<Host outer="compact" />);
        expect(el('outer').getAttribute('data-density')).toBe('compact');
        expect(height('outer-button')).toBeLessThan(cozy);
        // outside the subtree nothing changes
        expect(height('root')).toBe(cozy);

        await screen.rerender(<Host outer="cozy" />);
        expect(height('outer-button')).toBe(cozy);
    });

    it('density on the document element applies to the whole page', async () => {
        const { height } = await setup();
        const cozy = height('root');
        document.documentElement.setAttribute('data-density', 'compact');
        try {
            expect(height('root')).toBeLessThan(cozy);
            // a cozy island still restores cozy sizes
            expect(height('island-button')).toBe(cozy);
        } finally {
            document.documentElement.removeAttribute('data-density');
        }
    });

    it('a cozy island inside a compact subtree restores cozy sizes', async () => {
        const { height } = await setup('compact');
        const cozy = height('root');
        expect(height('outer-button')).toBeLessThan(cozy);
        expect(height('island-button')).toBe(cozy);
    });

    it('condensed falls back to compact sizes where no condensed size exists', async () => {
        const { screen, height } = await setup('compact');
        const compact = height('outer-button');

        await screen.rerender(<Host outer="condensed" />);
        expect(height('outer-button')).toBe(compact);
        expect(height('outer-button')).toBeLessThan(height('root'));
        // a cozy island resets condensed as well
        expect(height('island-button')).toBe(height('root'));
    });

    // Upstream lets a consumer configured with restrictChildContentDensity force its density on children. Here density
    // is CSS (the `compact:`/`condensed:` variants), so the nearest data-density always wins; this pins that choice.
    it('a density set on a child wins over the density of its parent', async () => {
        const { el, height } = await setup();
        expect(el('cozy-parent').getAttribute('data-density')).toBe('cozy');
        expect(el('compact-child').getAttribute('data-density')).toBe('compact');
        expect(height('compact-child-button')).toBeLessThan(height('root'));
    });

    it('compact set back to false removes data-density so the inherited density applies', async () => {
        const { screen, el, height } = await setup();
        const cozy = height('root');
        expect(el('toggle').getAttribute('data-density')).toBe('compact');
        expect(height('toggle-button')).toBeLessThan(cozy);

        await screen.rerender(<Host compact={false} />);
        expect(el('toggle').hasAttribute('data-density')).toBe(false);
        expect(height('toggle-button')).toBe(cozy);

        // with no density of its own it follows the parent
        await screen.rerender(<Host compact={false} outer="compact" />);
        expect(height('toggle-button')).toBe(height('outer-button'));
        expect(height('toggle-button')).toBeLessThan(cozy);
    });
});

/* ------------------------------------------------------------------------------------------------------------------
 * React API
 * ---------------------------------------------------------------------------------------------------------------- */

describe('ContentDensity (React API)', () => {
    it('passes native props, className and the ref to a div, and render renders another element', async () => {
        let element: HTMLElement | null = null;
        const screen = await render(
            <ContentDensity
                compact
                ref={(node) => {
                    element = node;
                }}
                className="custom"
                id="density"
                aria-label="Compact area"
            >
                Text
            </ContentDensity>
        );
        const root = screen.container.querySelector<HTMLElement>('#density')!;
        expect(element).toBe(root);
        expect(root.tagName).toBe('DIV');
        expect(root.className).toBe('custom');
        expect(root.getAttribute('aria-label')).toBe('Compact area');
        await screen.rerender(<ContentDensity compact render={<section />} id="density" />);
        expect(screen.container.querySelector('#density')!.tagName).toBe('SECTION');
    });

    it('the nearest density wins through alternating levels (compact, cozy, compact, cozy)', async () => {
        const screen = await render(
            <>
                <Button label="Cozy" data-testid="cozy" />
                <ContentDensity compact>
                    <Button label="Compact" data-testid="l1" />
                    <ContentDensity cozy>
                        <Button label="Cozy" data-testid="l2" />
                        <ContentDensity compact>
                            <Button label="Compact" data-testid="l3" />
                            <ContentDensity cozy>
                                <Button label="Cozy" data-testid="l4" />
                            </ContentDensity>
                        </ContentDensity>
                    </ContentDensity>
                </ContentDensity>
            </>
        );
        const height = (id: string) =>
            screen.container.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect().height;
        const cozy = height('cozy');
        expect(height('l1')).toBeLessThan(cozy);
        expect(height('l2')).toBe(cozy);
        expect(height('l3')).toBe(height('l1'));
        expect(height('l4')).toBe(cozy);
    });

    it('useContentDensity returns the density of the nearest ContentDensity, inherited through ones without', async () => {
        const seen: (ContentDensityMode | null)[] = [];
        function Probe() {
            seen.push(useContentDensity());
            return null;
        }
        await render(
            <>
                <Probe />
                <ContentDensity compact>
                    <Probe />
                    <ContentDensity>
                        <Probe />
                    </ContentDensity>
                    <ContentDensity cozy>
                        <Probe />
                    </ContentDensity>
                </ContentDensity>
            </>
        );
        expect(seen).toEqual([null, 'compact', 'compact', 'cozy']);
    });

    it('resolveContentDensity and contentDensityProps follow the same order', () => {
        expect(resolveContentDensity({})).toBeNull();
        expect(resolveContentDensity({ cozy: true, condensed: true })).toBe('condensed');
        expect(resolveContentDensity({ compact: true, condensed: true })).toBe('compact');
        expect(resolveContentDensity({ density: 'cozy', compact: true })).toBe('cozy');
        expect(contentDensityProps({ compact: true })).toEqual({ 'data-density': 'compact' });
        expect(contentDensityProps({ density: '' })).toEqual({});
    });
});
