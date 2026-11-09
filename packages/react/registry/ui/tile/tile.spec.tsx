import { createRef, useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    NumericContent,
    NumericContentKpi,
    NumericContentKpiContainer,
    NumericContentLaunchIcon,
    NumericContentLaunchIconContainer,
    NumericContentScale,
    NumericContentScaleArrow,
    NumericContentScaleContainer,
    NumericContentScaleText,
    type NumericContentSize,
    type NumericContentState
} from './numeric-content';
import {
    Tile,
    TileActionClose,
    TileActionContainer,
    TileActionIndicator,
    TileBackgroundImg,
    TileBadge,
    TileContainer,
    TileContent,
    TileContentByline,
    TileContentText,
    TileDot,
    TileFooter,
    TileFooterText,
    TileHeader,
    TileHeaderContent,
    TileLogo,
    TilePageIndicator,
    TileProfileImg,
    TileRefresh,
    TileSection,
    TileSlideContainer,
    TileSubtitle,
    TileTitle,
    TileTitleContainer,
    TileToggle,
    type TileSize
} from './tile';

const LONG = 'Title with very very very very very very very very very very very very very long text';

const rect = (el: Element) => el.getBoundingClientRect();
const style = (el: Element) => getComputedStyle(el);
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/** Resolved color of a CSS custom property. */
function cssColor(variable: string): string {
    const probe = document.createElement('span');
    probe.style.color = `var(${variable})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
}

async function mount(ui: ReactElement) {
    const screen = await render(ui);
    const root = screen.container;
    return {
        root,
        rerender: async (next: ReactElement) => {
            await screen.rerender(next);
            await frame();
        },
        q: <E extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<E>(selector)!,
        all: <E extends HTMLElement = HTMLElement>(selector: string) => [...root.querySelectorAll<E>(selector)]
    };
}

afterEach(() => {
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('data-density');
});

function ClickHost({ onTile, onInner, onLink }: { onTile: () => void; onInner: () => void; onLink: () => void }) {
    return (
        <div>
            <Tile id="clickable" type="launch" clickable aria-label="Sales" onTileClick={onTile}>
                <TileHeader>
                    <TileTitle>Sales</TileTitle>
                </TileHeader>
                <TileContent>
                    <button id="inner" onClick={onInner}>
                        Inner
                    </button>
                </TileContent>
            </Tile>
            <Tile id="static" type="launch" onTileClick={onTile}>
                <TileHeader>
                    <TileTitle>Static</TileTitle>
                </TileHeader>
            </Tile>
            <Tile id="group" type="launch" clickable role="group" aria-labelledby="title" />
            <Tile id="link" type="launch" render={<a href="#tile-link" />} onTileClick={onLink}>
                <TileHeader>
                    <TileTitle>Link</TileTitle>
                </TileHeader>
            </Tile>
            <span id="title">Labelled</span>
        </div>
    );
}

async function clickSetup() {
    const onTile = vi.fn();
    const onInner = vi.fn();
    const onLink = vi.fn();
    const screen = await mount(<ClickHost onTile={onTile} onInner={onInner} onLink={onLink} />);
    return { ...screen, onTile, onInner, onLink };
}

function SizeHost({ size, double }: { size?: TileSize; double?: boolean }) {
    return (
        <div className="flex items-start gap-4">
            <Tile id="regular" type="launch" size={size} double={double}>
                <TileHeader data-part="header">
                    <TileTitle>Title</TileTitle>
                </TileHeader>
                <TileContent data-part="content">Content</TileContent>
                <TileFooter data-part="footer">
                    <TileFooterText>Footer</TileFooterText>
                </TileFooter>
            </Tile>
        </div>
    );
}

function LineHost({
    list = false,
    action = false,
    badge = false,
    disabledLast = false,
    onTileClick
}: {
    list?: boolean;
    action?: boolean;
    badge?: boolean;
    disabledLast?: boolean;
    onTileClick?: (index: number) => void;
}) {
    const titles = ['Short', 'Second', LONG + ' ' + LONG];
    return (
        <div style={{ width: 1000 }}>
            <TileContainer list={list} data-testid="container">
                {titles.map((title, i) => (
                    <Tile
                        key={title}
                        data-testid="line"
                        type="line"
                        clickable
                        disabled={i === 2 && disabledLast}
                        action={action}
                        onTileClick={() => onTileClick?.(i)}
                    >
                        <TileHeader>
                            <TileTitleContainer>
                                {badge && <TileBadge>Badge</TileBadge>}
                                <TileTitle data-testid="title">{title}</TileTitle>
                            </TileTitleContainer>
                            <TileSubtitle data-testid="subtitle">Subtitle</TileSubtitle>
                        </TileHeader>
                        {action && (
                            <TileActionContainer>
                                <TileActionIndicator tabIndex={-1} />
                                <TileActionClose />
                            </TileActionContainer>
                        )}
                    </Tile>
                ))}
            </TileContainer>
        </div>
    );
}

function ActionHost({ action, onRemove }: { action: boolean; onRemove: () => void }) {
    return (
        <div style={{ padding: 20 }}>
            <Tile id="tile" type="launch" action={action} role="group" aria-label="Leave">
                <TileActionClose aria-label="Remove Leave" onClick={onRemove} />
                <TileActionIndicator tabIndex={-1} />
                <TileBadge>New</TileBadge>
                <TileHeader>
                    <TileTitle>Leave</TileTitle>
                </TileHeader>
                <TileContent>Content</TileContent>
                <TileFooter data-testid="footer">
                    <TileFooterText>Footer</TileFooterText>
                </TileFooter>
            </Tile>
        </div>
    );
}

function SlideHost({ current = 1, size }: { current?: number; size?: TileSize }) {
    const [playing, setPlaying] = useState(false);
    return (
        <div>
            <button id="before">Before</button>
            <Tile id="slide" type="slide" size={size}>
                <TileBackgroundImg backgroundImage="assets/landscape.svg" data-testid="background" />
                <TileToggle id="toggle" playing={playing} onClick={() => setPlaying(!playing)} />
                <TileSlideContainer data-testid="band">
                    <TileHeader>
                        <TileTitle>Wind map</TileTitle>
                    </TileHeader>
                    <TileFooter>
                        <TileFooterText>May 14</TileFooterText>
                    </TileFooter>
                    <TilePageIndicator>
                        {[0, 1, 2].map((page) => (
                            <TileDot key={page} data-testid="dot" active={page === current} />
                        ))}
                    </TilePageIndicator>
                </TileSlideContainer>
            </Tile>
            <TileToggle id="labelled" aria-label="Stop slides" />
        </div>
    );
}

interface NumericState {
    tileSize?: TileSize;
    size?: NumericContentSize;
    state?: NumericContentState;
    arrowLabel?: string;
}

function NumericHost({ tileSize, size, state, arrowLabel }: NumericState) {
    return (
        <Tile type="kpi" size={tileSize}>
            <TileContent>
                <NumericContent size={size} data-testid="content">
                    <NumericContentKpiContainer data-testid="kpi-container">
                        <NumericContentKpi state={state} data-testid="kpi">
                            -1.2
                        </NumericContentKpi>
                    </NumericContentKpiContainer>
                    <NumericContentScaleContainer data-testid="scale-container">
                        <NumericContentScale state={state} data-testid="scale">
                            <NumericContentScaleArrow glyph="up" aria-label={arrowLabel} data-testid="arrow" />
                            <NumericContentScaleText>M</NumericContentScaleText>
                        </NumericContentScale>
                    </NumericContentScaleContainer>
                </NumericContent>
            </TileContent>
        </Tile>
    );
}

function RefreshHost({ label, onRefresh }: { label?: string; onRefresh: () => void }) {
    return (
        <Tile>
            <TileHeader>
                <TileTitle render={<h2 />}>Sales</TileTitle>
            </TileHeader>
            <TileFooter>
                <TileSection>
                    <TileRefresh aria-label={label} onClick={onRefresh} />
                    <TileFooterText>Now</TileFooterText>
                </TileSection>
            </TileFooter>
        </Tile>
    );
}

describe('Tile', () => {
    it('clickable tile is role button, focusable, calls onTileClick on click, Enter and Space (not when the key comes from an inner button)', async () => {
        const { q, onTile, onInner } = await clickSetup();
        const tile = q('#clickable');
        expect(tile.getAttribute('role')).toBe('button');
        expect(tile.getAttribute('tabindex')).toBe('0');
        expect(tile.getAttribute('aria-label')).toBe('Sales');

        await userEvent.click(tile);
        expect(onTile).toHaveBeenCalledTimes(1);

        tile.focus();
        expect(document.activeElement).toBe(tile);
        await userEvent.keyboard('{Enter}');
        expect(onTile).toHaveBeenCalledTimes(2);
        await userEvent.keyboard(' ');
        expect(onTile).toHaveBeenCalledTimes(3);

        q('#inner').focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        // the keys activate the inner button (Space is not swallowed); the tile sees only the bubbled clicks
        expect(onInner).toHaveBeenCalledTimes(2);
        expect(onTile).toHaveBeenCalledTimes(5);
    });

    it('a non-clickable tile has no role, is not focusable and calls no onTileClick', async () => {
        const { q, onTile } = await clickSetup();
        const tile = q('#static');
        expect(tile.hasAttribute('role')).toBe(false);
        expect(tile.hasAttribute('tabindex')).toBe(false);
        await userEvent.click(tile);
        expect(onTile).not.toHaveBeenCalled();
    });

    it('a custom role and aria-labelledby replace the button role', async () => {
        const { q } = await clickSetup();
        const tile = q('#group');
        expect(tile.getAttribute('role')).toBe('group');
        expect(tile.getAttribute('aria-labelledby')).toBe('title');
        expect(tile.getAttribute('tabindex')).toBe('0');
    });

    it('Tab moves through the clickable tile and the link but skips the static tile', async () => {
        const { q } = await clickSetup();
        q('#clickable').focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(q('#inner'));
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(q('#group'));
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(q('#link'));
    });

    it('a link tile keeps the link semantics and calls onTileClick on click', async () => {
        const { q, onLink } = await clickSetup();
        const link = q<HTMLAnchorElement>('#link');
        expect(link.tagName).toBe('A');
        expect(link.hasAttribute('role')).toBe(false);
        expect(link.hasAttribute('tabindex')).toBe(false);
        expect(link.getAttribute('href')).toBe('#tile-link');
        expect(link.tabIndex).toBe(0);

        await userEvent.click(link);
        expect(onLink).toHaveBeenCalledTimes(1);
        expect(location.hash).toBe('#tile-link');

        // Enter follows the link (a native click), it does not call twice
        link.focus();
        await userEvent.keyboard('{Enter}');
        expect(onLink).toHaveBeenCalledTimes(2);
        history.replaceState(null, '', location.pathname + location.search);
    });

    it('size s and double width; header/content/footer heights per size', async () => {
        const { q, rerender } = await mount(<SizeHost />);
        const tile = q('#regular');
        const parts = () =>
            ['header', 'content', 'footer'].map((part) => Math.round(rect(q(`[data-part="${part}"]`)).height));

        expect(Math.round(rect(tile).width)).toBe(176);
        expect(Math.round(rect(tile).height)).toBe(176);
        expect(parts()).toEqual([58, 62, 16]);

        await rerender(<SizeHost double />);
        expect(Math.round(rect(tile).width)).toBe(360);
        expect(Math.round(rect(tile).height)).toBe(176);

        await rerender(<SizeHost double size="s" />);
        expect(Math.round(rect(tile).width)).toBe(304);
        expect(Math.round(rect(tile).height)).toBe(148);

        await rerender(<SizeHost size="s" />);
        expect(Math.round(rect(tile).width)).toBe(148);
        expect(Math.round(rect(tile).height)).toBe(148);
        expect(parts()).toEqual([52, 55, 17]);
    });

    it('two-column sections; feed tile content columns', async () => {
        const { q } = await mount(
            <Tile type="feed">
                <TileHeader twoColumn data-testid="header">
                    <TileSection id="h1">
                        <TileTitle>Left</TileTitle>
                    </TileSection>
                    <TileSection id="h2">
                        <TileTitle>Right</TileTitle>
                    </TileSection>
                </TileHeader>
                <TileContent twoColumn data-testid="content">
                    <TileSection id="c1">
                        <TileContentText data-testid="text">{LONG + ' ' + LONG}</TileContentText>
                        <TileContentByline data-testid="byline">About 1 minute ago</TileContentByline>
                    </TileSection>
                    <TileSection id="c2">
                        <span style={{ display: 'block', width: 100, height: 20 }} />
                    </TileSection>
                </TileContent>
                <TileFooter twoColumn>
                    <TileSection id="f1">
                        <TileFooterText>Start</TileFooterText>
                    </TileSection>
                    <TileSection id="f2">
                        <TileFooterText>End</TileFooterText>
                    </TileSection>
                </TileFooter>
            </Tile>
        );
        const h1 = rect(q('#h1'));
        const h2 = rect(q('#h2'));
        const header = rect(q('[data-testid="header"]'));
        // the header halves sit side by side, spread to both ends
        expect(h2.left).toBeGreaterThan(h1.right);
        expect(Math.abs(h1.top - h2.top)).toBeLessThan(1);
        expect(Math.round(h1.left)).toBe(Math.round(header.left));
        expect(Math.round(h2.right)).toBe(Math.round(header.right));

        // feed content: the text column grows, the second column fits its content
        const c1 = rect(q('#c1'));
        const c2 = rect(q('#c2'));
        expect(c2.left).toBeGreaterThanOrEqual(c1.right);
        expect(Math.round(c2.width)).toBe(108);
        expect(Math.round(c2.right)).toBe(Math.round(rect(q('[data-testid="content"]')).right));
        expect(style(q('#c1')).flexDirection).toBe('column');
        const text = q('[data-testid="text"]');
        expect(style(text).webkitLineClamp).toBe('2');
        expect(text.scrollHeight).toBeGreaterThan(text.clientHeight);
        expect(rect(q('[data-testid="byline"]')).top).toBeGreaterThanOrEqual(rect(text).bottom - 1);

        // footer: the last section is aligned to the end
        const f2 = q('#f2');
        expect(style(f2).justifyContent).toBe('flex-end');
        expect(Math.round(rect(f2.firstElementChild!).right)).toBe(Math.round(rect(f2).right));
    });

    it('line tile: floating vs list container, title ellipsis, compact heights, disabled', async () => {
        const clicked: number[] = [];
        const onTileClick = (i: number) => clicked.push(i);
        const { all, q, rerender } = await mount(<LineHost onTileClick={onTileClick} />);
        const [first, second, third] = all('[data-testid="line"]');

        // floating: tiles flow in a row and wrap
        expect(Math.abs(rect(first).top - rect(second).top)).toBeLessThan(1);
        expect(rect(second).left).toBeGreaterThan(rect(first).right);
        expect(rect(third).top).toBeGreaterThan(rect(first).bottom);
        expect(Math.round(rect(first).height)).toBe(32);

        // a long title truncates with an ellipsis
        const title = third.querySelector<HTMLElement>('[data-testid="title"]')!;
        expect(style(title).textOverflow).toBe('ellipsis');
        expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
        expect(rect(third).right).toBeLessThanOrEqual(rect(q('[data-testid="container"]')).right + 1);

        // list: the tiles stack vertically; a long title wraps the subtitle to a second line, up to 3.25rem
        await rerender(<LineHost list onTileClick={onTileClick} />);
        expect(rect(second).top).toBeGreaterThanOrEqual(rect(first).bottom);
        expect(Math.round(rect(first).left)).toBe(Math.round(rect(second).left));
        expect(Math.round(rect(first).height)).toBe(32);
        expect(Math.round(rect(third).height)).toBe(52);
        const subtitle = third.querySelector('[data-testid="subtitle"]')!;
        expect(rect(subtitle).top).toBeGreaterThanOrEqual(rect(title).bottom - 1);

        // compact density
        document.documentElement.setAttribute('data-density', 'compact');
        await frame();
        expect(Math.round(rect(first).height)).toBe(26);
        expect(Math.round(rect(third).height)).toBe(46);
        await rerender(<LineHost onTileClick={onTileClick} />);
        expect(Math.round(rect(first).height)).toBe(26);

        // clickable line tiles
        expect(first.getAttribute('role')).toBe('button');
        await userEvent.click(first);
        expect(clicked).toEqual([0]);

        // disabled: not focusable, aria-disabled, no onTileClick, dimmed
        await rerender(<LineHost disabledLast onTileClick={onTileClick} />);
        expect(third.getAttribute('aria-disabled')).toBe('true');
        expect(third.hasAttribute('tabindex')).toBe(false);
        expect(style(third).pointerEvents).toBe('none');
        expect(Number(style(third).opacity)).toBe(0.5);
        third.click();
        third.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(clicked).toEqual([0]);
    });

    it('line tile in action mode shows the action buttons inline and keeps the badge', async () => {
        const { all } = await mount(<LineHost action badge />);
        const tile = all('[data-testid="line"]')[0]!;
        const close = tile.querySelector<HTMLButtonElement>('button[aria-label="Remove"]')!;
        const indicator = tile.querySelector<HTMLButtonElement>('button[aria-label="More"]')!;
        expect(close.type).toBe('button');
        expect(indicator.tabIndex).toBe(-1);
        expect(style(close).position).toBe('relative');
        expect(rect(close).right).toBeLessThanOrEqual(rect(tile).right + 1);
        // no overlay inside line tiles
        expect(tile.querySelector(':scope > div.absolute')).toBeNull();
        expect(style(tile.querySelector('[data-testid="title"]')!.previousElementSibling!).display).not.toBe('none');
    });

    it('action mode shows the overlay, close and indicator buttons and hides footer and badge', async () => {
        const onRemove = vi.fn();
        const { q, rerender } = await mount(<ActionHost action onRemove={onRemove} />);
        const tile = q('#tile');
        const overlay = tile.firstElementChild as HTMLElement;
        expect(overlay.tagName).toBe('DIV');
        expect(style(overlay).position).toBe('absolute');
        expect(Math.round(rect(overlay).width)).toBe(Math.round(rect(tile).width) - 2);
        expect(Number(style(overlay).opacity)).toBeCloseTo(0.7);

        const close = q<HTMLButtonElement>('button[aria-label="Remove Leave"]');
        const indicator = q<HTMLButtonElement>('button[aria-label="More"]');
        expect(close.type).toBe('button');
        // close at the top end corner, above the overlay; indicator at the bottom end
        expect(rect(close).top).toBeLessThan(rect(tile).top);
        expect(rect(close).right).toBeGreaterThan(rect(tile).right);
        expect(Number(style(close).zIndex)).toBeGreaterThan(Number(style(overlay).zIndex));
        expect(rect(indicator).bottom).toBeLessThanOrEqual(rect(tile).bottom);
        expect(rect(indicator).bottom).toBeGreaterThan(rect(tile).bottom - 10);

        const badge = [...tile.children].find((el) => el.textContent === 'New')!;
        expect(style(q('[data-testid="footer"]')).display).toBe('none');
        expect(style(badge).display).toBe('none');

        await userEvent.click(close);
        expect(onRemove).toHaveBeenCalledTimes(1);

        await rerender(<ActionHost action={false} onRemove={onRemove} />);
        expect(tile.firstElementChild).toBe(close);
        expect(style(q('[data-testid="footer"]')).display).not.toBe('none');
        expect(style(badge).display).not.toBe('none');
    });

    it('slide tile: toggle button shows on hover/focus/touch, play/pause label; page dots', async () => {
        const { q, all, rerender } = await mount(<SlideHost />);
        const tile = q('#slide');
        const toggle = q<HTMLButtonElement>('#toggle');
        expect(toggle.type).toBe('button');
        expect(toggle.getAttribute('aria-label')).toBe('Play');
        const shown = () => style(toggle).opacity === '1';
        await userEvent.hover(q('#before'));
        expect(shown()).toBe(false);

        await userEvent.hover(tile);
        expect(shown()).toBe(true);
        await userEvent.hover(q('#before'));
        expect(shown()).toBe(false);

        // hidden visually only: keyboard users can still Tab to it, and focus shows it
        q('#before').focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(toggle);
        expect(shown()).toBe(true);

        await userEvent.keyboard('{Enter}');
        expect(toggle.getAttribute('aria-label')).toBe('Pause');
        expect(toggle.getAttribute('data-glyph')).toBeTruthy();
        expect(q('#labelled').getAttribute('aria-label')).toBe('Stop slides');

        // the background covers the tile, the slide band sits at the bottom
        expect(style(q('[data-testid="background"]')).backgroundImage).toContain('landscape.svg');
        expect(Math.round(rect(q('[data-testid="band"]')).bottom)).toBe(Math.round(rect(tile).bottom) - 1);

        // page dots: one filled, the others outlined
        const dots = all('[data-testid="dot"]');
        expect(dots).toHaveLength(3);
        expect(Math.round(rect(dots[0]!).width)).toBe(6);
        const transparent = 'rgba(0, 0, 0, 0)';
        expect(style(dots[1]!).backgroundColor).not.toBe(transparent);
        expect(style(dots[0]!).backgroundColor).toBe(transparent);
        expect(style(dots[0]!).borderTopWidth).toBe('1px');
        await rerender(<SlideHost current={2} />);
        expect(style(dots[2]!).backgroundColor).not.toBe(transparent);
        expect(style(dots[1]!).backgroundColor).toBe(transparent);
        expect(rect(dots[1]!).left).toBeGreaterThan(rect(dots[0]!).right);
    });

    it('badge position (top end) and inline in line tiles', async () => {
        const { q } = await mount(
            <div>
                <div style={{ padding: 20 }}>
                    <Tile id="tile" type="launch">
                        <TileBadge id="badge">Badge</TileBadge>
                        <TileHeader>
                            <TileTitle>Tile</TileTitle>
                        </TileHeader>
                    </Tile>
                </div>
                <TileContainer style={{ width: 600 }}>
                    <Tile id="line" type="line">
                        <TileHeader>
                            <TileTitleContainer>
                                <TileBadge id="inline">Inline</TileBadge>
                                <TileTitle id="line-title">Line</TileTitle>
                            </TileTitleContainer>
                        </TileHeader>
                    </Tile>
                </TileContainer>
            </div>
        );
        const tile = q('#tile');
        const badge = q('#badge');
        expect(style(badge).position).toBe('absolute');
        expect(rect(badge).top).toBeLessThan(rect(tile).top);
        // 0.5rem from the end of the padding box (inside the 1px border)
        expect(Math.round(rect(tile).right - rect(badge).right)).toBe(9);
        expect(Math.round(rect(badge).height)).toBe(16);

        const line = q('#line');
        const inline = q('#inline');
        expect(style(inline).position).toBe('relative');
        expect(rect(inline).top).toBeGreaterThanOrEqual(rect(line).top);
        expect(rect(inline).right).toBeLessThanOrEqual(rect(q('#line-title')).left);

        document.documentElement.setAttribute('dir', 'rtl');
        await frame();
        expect(Math.round(rect(badge).left - rect(tile).left)).toBe(9);
        expect(rect(inline).left).toBeGreaterThanOrEqual(rect(q('#line-title')).right);
    });

    it('numeric content sizes l/m/s, small-tile sizes, state colors, RTL value direction', async () => {
        const { q, rerender } = await mount(<NumericHost />);
        const content = q('[data-testid="content"]');
        const kpi = q('[data-testid="kpi"]');
        const sizes = () => [Math.round(rect(content).height), style(kpi).fontSize];

        expect(sizes()).toEqual([48, '36px']);
        await rerender(<NumericHost size="m" />);
        expect(sizes()).toEqual([40, '32px']);
        await rerender(<NumericHost size="s" />);
        expect(sizes()).toEqual([36, '28px']);
        await rerender(<NumericHost size="s" tileSize="s" />);
        expect(sizes()).toEqual([38, '24px']);
        // the value keeps a normal line height (it comes after the font size)
        expect(style(kpi).lineHeight).toBe('normal');

        // state colors on the value and the scale
        const scale = q('[data-testid="scale"]');
        expect(style(kpi).color).toBe(cssColor('--sapNeutralTextColor'));
        const states: [NumericContentState, string][] = [
            ['positive', '--sapPositiveTextColor'],
            ['negative', '--sapNegativeTextColor'],
            ['critical', '--sapCriticalTextColor'],
            ['informative', '--sapInformativeTextColor']
        ];
        for (const [state, variable] of states) {
            await rerender(<NumericHost size="s" tileSize="s" state={state} />);
            expect(style(kpi).color).toBe(cssColor(variable));
            expect(style(scale).color).toBe(cssColor(variable));
        }

        // the scale sits after the value
        expect(rect(q('[data-testid="scale-container"]')).left).toBeGreaterThanOrEqual(
            rect(q('[data-testid="kpi-container"]')).right
        );

        // RTL: the number keeps its LTR direction in small tiles
        document.documentElement.setAttribute('dir', 'rtl');
        await frame();
        expect(style(kpi).direction).toBe('ltr');
        expect(style(kpi).textAlign).toBe('right');
        expect(rect(q('[data-testid="scale-container"]')).right).toBeLessThanOrEqual(
            rect(q('[data-testid="kpi-container"]')).left
        );
    });

    it('scale arrow is decorative unless it has a label', async () => {
        const { q, rerender } = await mount(<NumericHost />);
        const arrow = q('[data-testid="arrow"]');
        expect(arrow.getAttribute('aria-hidden')).toBe('true');
        expect(arrow.hasAttribute('role')).toBe(false);
        expect(arrow.getAttribute('data-glyph')).toBeTruthy();
        await rerender(<NumericHost arrowLabel="Up" />);
        expect(arrow.getAttribute('role')).toBe('img');
        expect(arrow.getAttribute('aria-label')).toBe('Up');
        expect(arrow.hasAttribute('aria-hidden')).toBe(false);
    });

    it('the refresh button in the footer has an accessible name and calls its onClick', async () => {
        const onRefresh = vi.fn();
        const { q, rerender } = await mount(<RefreshHost onRefresh={onRefresh} />);
        const refresh = q<HTMLButtonElement>('button');
        expect(refresh.type).toBe('button');
        expect(refresh.getAttribute('aria-label')).toBe('Refresh');
        // the refresh glyph is drawn from the icon font
        expect(refresh.getAttribute('data-glyph')).toBeTruthy();
        expect(rect(refresh).width).toBeGreaterThan(0);
        await userEvent.click(refresh);
        expect(onRefresh).toHaveBeenCalledTimes(1);
        refresh.focus();
        expect(document.activeElement).toBe(refresh);
        await userEvent.keyboard('{Enter}');
        expect(onRefresh).toHaveBeenCalledTimes(2);
        await rerender(<RefreshHost label="Reload sales" onRefresh={onRefresh} />);
        expect(refresh.getAttribute('aria-label')).toBe('Reload sales');
    });

    // fundamental-react
    it('spreads native props, merges className and forwards the ref of the tile and its parts (fundamental-react)', async () => {
        const tileRef = createRef<HTMLDivElement>();
        const headerRef = createRef<HTMLDivElement>();
        const contentRef = createRef<HTMLDivElement>();
        const footerRef = createRef<HTMLDivElement>();
        const onClick = vi.fn();
        const { q } = await mount(
            <Tile ref={tileRef} data-sample="Sample" className="custom" clickable onClick={onClick}>
                <TileHeader ref={headerRef} data-sample="Header" className="test">
                    <TileTitle>Sample Title</TileTitle>
                </TileHeader>
                <TileContent ref={contentRef} data-sample="Content" title="Sample">
                    Test Content
                </TileContent>
                <TileFooter ref={footerRef} data-sample="Footer">
                    <TileFooterText>Footer</TileFooterText>
                </TileFooter>
            </Tile>
        );
        const tile = q('[data-sample="Sample"]');
        expect(tileRef.current).toBe(tile);
        expect(tile.tagName).toBe('DIV');
        expect(tile.className).toContain('custom');
        expect(headerRef.current).toBe(q('[data-sample="Header"]'));
        expect(headerRef.current!.className).toContain('test');
        expect(contentRef.current).toBe(q('[data-sample="Content"]'));
        expect(contentRef.current!.title).toBe('Sample');
        expect(footerRef.current).toBe(q('[data-sample="Footer"]'));
        // the native onClick still runs
        await userEvent.click(tile);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('header renders the title and subtitle props with their own props (fundamental-react)', async () => {
        const titleProps = { className: 'test-title', 'data-sample': 'Title' };
        const { q } = await mount(
            <Tile>
                <TileHeader
                    data-testid="header"
                    title="Sample Title"
                    subtitle="Test subtitle"
                    titleProps={titleProps}
                    subtitleProps={{ className: 'test-subtitle' }}
                />
            </Tile>
        );
        const header = q('[data-testid="header"]');
        expect(header.children).toHaveLength(2);
        const [title, subtitle] = [...header.children] as HTMLElement[];
        expect(title!.textContent).toBe('Sample Title');
        expect(title!.className).toContain('test-title');
        expect(title!.getAttribute('data-sample')).toBe('Title');
        expect(style(title!).fontWeight).toBe('700');
        expect(subtitle!.textContent).toBe('Test subtitle');
        expect(subtitle!.className).toContain('test-subtitle');
    });

    it('title clamps to two lines, four in a combined header and content', async () => {
        const { q } = await mount(
            <div className="flex gap-4">
                <Tile type="launch">
                    <TileHeader>
                        <TileTitle id="two">{LONG}</TileTitle>
                    </TileHeader>
                </Tile>
                <Tile type="launch">
                    <TileHeaderContent data-testid="header-content">
                        <TileTitle id="four">{LONG + ' ' + LONG}</TileTitle>
                        <TileSubtitle>Subtitle</TileSubtitle>
                    </TileHeaderContent>
                </Tile>
            </div>
        );
        expect(style(q('#two')).webkitLineClamp).toBe('2');
        expect(style(q('#four')).webkitLineClamp).toBe('4');
        expect(Math.round(rect(q('[data-testid="header-content"]')).height)).toBe(124);
    });

    it('launch icon, profile image and logo sizes per tile size', async () => {
        const ui = (size?: TileSize) => (
            <Tile type="launch" size={size}>
                <TileContent>
                    <NumericContent>
                        <NumericContentLaunchIconContainer data-testid="icon-container">
                            <NumericContentLaunchIcon glyph="line-charts" data-testid="icon" />
                        </NumericContentLaunchIconContainer>
                    </NumericContent>
                    <TileProfileImg backgroundImage="assets/person.svg" aria-label="Profile" data-testid="profile" />
                    <TileLogo src="assets/landscape.svg" alt="Logo" data-testid="logo" />
                </TileContent>
            </Tile>
        );
        const { q, rerender } = await mount(ui());
        const icon = q('[data-testid="icon"]');
        const profile = q('[data-testid="profile"]');
        expect(icon.getAttribute('aria-hidden')).toBe('true');
        expect(icon.getAttribute('data-glyph')).toBeTruthy();
        expect(style(icon).fontSize).toBe('28px');
        expect(Math.round(rect(q('[data-testid="icon-container"]')).width)).toBe(28);
        expect(profile.getAttribute('role')).toBe('img');
        expect(profile.id).toMatch(/^fd-tile-profile-img-.+/);
        expect(style(profile).backgroundImage).toContain('person.svg');
        expect(Math.round(rect(profile).width)).toBe(56);
        expect(q('[data-testid="logo"]').tagName).toBe('IMG');
        expect(Math.round(rect(q('[data-testid="logo"]')).width)).toBe(58);

        await rerender(ui('s'));
        expect(style(icon).fontSize).toBe('24px');
        expect(Math.round(rect(profile).width)).toBe(48);
        expect(Math.round(rect(q('[data-testid="logo"]')).width)).toBe(48);
    });
});
