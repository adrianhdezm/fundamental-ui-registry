import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Skeleton } from '@/ui/skeleton/skeleton';
import {
    Card,
    CardContent,
    CardCounter,
    CardExtendedHeader,
    CardFooter,
    CardFooterActions,
    CardHeader,
    CardHeaderAction,
    CardHeaderColumn,
    CardHeaderRow,
    CardIndicator,
    CardIndicatorTitle,
    CardIndicatorValue,
    CardKpiAnalytics,
    CardKpiAnalyticsContent,
    CardKpiAnalyticsLabel,
    CardKpiHeader,
    CardKpiScaleIcon,
    CardKpiScaleText,
    CardKpiValue,
    CardList,
    CardLoader,
    CardMainHeader,
    CardMedia,
    CardMediaContentContainer,
    CardMediaHeading,
    CardMediaImage,
    CardMediaImageContainer,
    CardMediaText,
    CardNumericContainer,
    CardNumericHeader,
    CardSecondSubtitle,
    CardSubtitle,
    CardTitle,
    type CardKpiStatus,
    type CardLegendColor,
    type CardShellColor,
    type CardType
} from './card';

const IMG =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="teal"/></svg>'
    );

const rect = (el: Element) => el.getBoundingClientRect();
const style = (el: Element, pseudo?: string) => getComputedStyle(el, pseudo);
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

function cssColor(variable: string): string {
    const probe = document.createElement('span');
    probe.style.color = `var(${variable})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
}

function cssBackground(variable: string): string {
    const probe = document.createElement('span');
    probe.style.backgroundColor = `var(${variable})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
}

afterEach(async () => {
    document.documentElement.removeAttribute('dir');
    await page.viewport(1280, 800);
});

async function mount(ui: React.ReactElement) {
    const screen = await render(ui);
    const root = screen.container;
    return {
        root,
        rerender: async (next: React.ReactElement) => {
            await screen.rerender(next);
            await frame();
        },
        q: <E extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<E>(selector)!,
        all: <E extends HTMLElement = HTMLElement>(selector: string) => [...root.querySelectorAll<E>(selector)]
    };
}

interface StandardState {
    cardType?: CardType;
    badge?: string;
    secondBadge?: string;
    describedby?: string;
    counterStatus?: CardKpiStatus | 'neutral';
}

/** The footer is written before the content, as in the Angular spec. */
function Standard({ cardType, badge = 'Badge', secondBadge, describedby, counterStatus }: StandardState) {
    return (
        <div style={{ padding: 24, width: 320 }}>
            <Card id="card" cardType={cardType} badge={badge} secondBadge={secondBadge} aria-describedby={describedby}>
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle id="title">Card Title</CardTitle>
                        <CardSubtitle id="subtitle">Card Subtitle</CardSubtitle>
                        <CardCounter id="counter" status={counterStatus}>
                            3 of 10
                        </CardCounter>
                    </CardMainHeader>
                </CardHeader>
                <CardFooter>
                    <CardFooterActions>
                        <button id="approve">Approve</button>
                        <button id="reject">Reject</button>
                    </CardFooterActions>
                    <span id="footer-text">Footer</span>
                </CardFooter>
                <CardContent>
                    <p id="content" style={{ margin: 0, height: 40 }}>
                        Content
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

interface InteractiveState {
    interactive?: boolean;
    hint?: string;
    keys: string[];
    actions: number[];
}

function Interactive({ interactive = true, hint, keys, actions }: InteractiveState) {
    return (
        <>
            <button id="before">Before</button>
            <Card id="card" onKeyDown={(event) => keys.push(event.key)}>
                <CardHeader>
                    <CardMainHeader interactive={interactive} title={hint} onAction={() => actions.push(1)}>
                        <CardTitle>Orders</CardTitle>
                        <CardSubtitle>Open</CardSubtitle>
                        <CardHeaderAction>
                            <button id="action">More</button>
                        </CardHeaderAction>
                    </CardMainHeader>
                </CardHeader>
                <CardContent>Content</CardContent>
            </Card>
        </>
    );
}

interface RoleState {
    role?: string;
    cardType?: CardType;
    ariaLabel?: string;
    roleDescription?: string;
    description?: string;
    selected?: boolean;
    interactive?: boolean;
}

function Role({ role, cardType, ariaLabel, roleDescription, description, selected, interactive }: RoleState) {
    return (
        <>
            <div id="spacer" style={{ height: 40 }} />
            <Card
                id="card"
                role={role}
                cardType={cardType}
                aria-label={ariaLabel}
                aria-roledescription={roleDescription}
                aria-description={description}
                selected={selected}
                interactive={interactive}
            >
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle id="title">Title</CardTitle>
                    </CardMainHeader>
                </CardHeader>
            </Card>
        </>
    );
}

function Kpi({ status = 'positive' }: { status?: CardKpiStatus | null }) {
    return (
        <div style={{ width: 400 }}>
            <Card cardType="analytical">
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Failure Breakdown</CardTitle>
                        <CardSubtitle>By plant</CardSubtitle>
                        <CardKpiHeader data-testid="kpi">
                            {/* written out of order: the header places them */}
                            <CardKpiAnalytics id="a1">
                                <CardKpiAnalyticsLabel>Deviation</CardKpiAnalyticsLabel>
                                <CardKpiAnalyticsContent>7.52%</CardKpiAnalyticsContent>
                            </CardKpiAnalytics>
                            <CardKpiScaleText id="scale">%</CardKpiScaleText>
                            <CardKpiScaleIcon id="icon">up</CardKpiScaleIcon>
                            <CardKpiValue id="value" status={status}>
                                42.2
                            </CardKpiValue>
                            <CardKpiAnalytics id="a2">
                                <CardKpiAnalyticsLabel>Target</CardKpiAnalyticsLabel>
                                <CardKpiAnalyticsContent>45%</CardKpiAnalyticsContent>
                            </CardKpiAnalytics>
                        </CardKpiHeader>
                        <CardSecondSubtitle id="second">Q1, 2019</CardSecondSubtitle>
                    </CardMainHeader>
                </CardHeader>
                <CardNumericHeader data-testid="numeric">
                    <CardHeaderRow>
                        <CardNumericContainer data-testid="numeric-container">
                            <CardKpiValue id="numeric-value" status="negative">
                                7
                            </CardKpiValue>
                            <CardKpiScaleText>K</CardKpiScaleText>
                        </CardNumericContainer>
                        <CardIndicator id="ind">
                            <CardIndicatorValue id="ind-value">8 K</CardIndicatorValue>
                            <CardIndicatorTitle id="ind-title">Target</CardIndicatorTitle>
                        </CardIndicator>
                    </CardHeaderRow>
                </CardNumericHeader>
            </Card>
        </div>
    );
}

function Loader({ loading = true }: { loading?: boolean }) {
    return (
        <Card id="card" isLoading={loading} badge="New">
            <CardHeader data-testid="header">
                <CardMainHeader>
                    <CardTitle>Loading</CardTitle>
                </CardMainHeader>
            </CardHeader>
            <CardContent>
                <p id="content">Content</p>
            </CardContent>
            <CardLoader data-testid="loader">
                <Skeleton type="rectangle" width="100%" height="4rem" animated={false} />
            </CardLoader>
        </Card>
    );
}

interface MediaState {
    padding?: boolean;
    shell?: CardShellColor | null;
    legend?: CardLegendColor;
}

function Media({ padding = false, shell = 3, legend }: MediaState) {
    return (
        <>
            <div style={{ width: 320 }}>
                <Card id="image-card">
                    <CardMedia hasPadding={padding} data-testid="image-media">
                        <CardMediaImageContainer>
                            <CardMediaImage src={IMG} alt="Landscape" style={{ maxHeight: 160 }} />
                        </CardMediaImageContainer>
                    </CardMedia>
                    <CardHeader>
                        <CardMainHeader>
                            <CardTitle>Title</CardTitle>
                        </CardMainHeader>
                    </CardHeader>
                </Card>
                <Card id="shell-card">
                    <CardMedia shellColor={shell} legendColor={legend} data-testid="shell-media">
                        <CardMediaContentContainer>
                            <CardMediaHeading id="heading">Shell colour</CardMediaHeading>
                            <CardMediaText>Media text</CardMediaText>
                        </CardMediaContentContainer>
                    </CardMedia>
                </Card>
            </div>
            <Card id="banner" cardType="banner" style={{ height: 288 }}>
                <CardMedia>
                    <CardMediaContentContainer legendColor={13} data-testid="banner-content">
                        <CardMediaHeading level={3}>Banner</CardMediaHeading>
                        <CardMediaText>Text</CardMediaText>
                    </CardMediaContentContainer>
                    <CardMediaImageContainer data-testid="banner-image">
                        <CardMediaImage src={IMG} alt="Landscape" />
                    </CardMediaImageContainer>
                </CardMedia>
            </Card>
            <Card id="text-banner" cardType="banner">
                <CardMedia shellColor={13}>
                    <CardMediaContentContainer data-testid="text-banner-content">
                        <CardMediaHeading>Text only</CardMediaHeading>
                    </CardMediaContentContainer>
                </CardMedia>
            </Card>
        </>
    );
}

const PRODUCTS = ['One', 'Two', 'Three', 'Four'];

function ProductList() {
    return (
        <>
            <button id="before">Before</button>
            <CardList aria-label="Products" style={{ display: 'flex', gap: 8 }}>
                {PRODUCTS.map((p, i) => (
                    <Card
                        key={p}
                        style={{ width: 200 }}
                        role="listitem"
                        aria-posinset={i + 1}
                        aria-setsize={PRODUCTS.length}
                        selected={i === 1}
                    >
                        <CardHeader>
                            <CardMainHeader>
                                <CardTitle>{p}</CardTitle>
                            </CardMainHeader>
                        </CardHeader>
                    </Card>
                ))}
            </CardList>
            <button id="after">After</button>
        </>
    );
}

function Corners() {
    return (
        <>
            <Card id="three">
                <CardHeader id="top">
                    <CardMainHeader>
                        <CardTitle>Top</CardTitle>
                    </CardMainHeader>
                </CardHeader>
                <CardContent id="middle">
                    <p style={{ margin: 0, height: 40 }}>Content</p>
                </CardContent>
                <CardHeader id="bottom">
                    <CardMainHeader>
                        <CardTitle>Bottom</CardTitle>
                    </CardMainHeader>
                </CardHeader>
            </Card>
            <Card id="badged" badge="Badge">
                <CardContent id="badged-content">
                    <p style={{ margin: 0, height: 40 }}>Content</p>
                </CardContent>
            </Card>
            <Card id="only">
                <CardContent id="only-content">
                    <p style={{ margin: 0, height: 40 }}>Content</p>
                </CardContent>
            </Card>
        </>
    );
}

function Extended({ align = 'bottom' }: { align?: 'top' | 'bottom' | null }) {
    return (
        <Card id="extended" style={{ width: 400 }}>
            <CardHeader id="extended-header">
                <CardMainHeader data-testid="main">
                    <CardTitle>Travel Request</CardTitle>
                    <CardSubtitle id="sub">Marie Johnson</CardSubtitle>
                    <CardSecondSubtitle id="second">Q1, 2024</CardSecondSubtitle>
                </CardMainHeader>
                <CardExtendedHeader id="ext" align={align}>
                    <CardHeaderColumn id="start-column">
                        <CardHeaderRow id="start-row">
                            <span>Las Vegas</span>
                            <span>TechEd</span>
                        </CardHeaderRow>
                        <CardHeaderRow>
                            <span>May 3rd - 5th</span>
                        </CardHeaderRow>
                    </CardHeaderColumn>
                    <CardHeaderColumn align="right" id="end-column">
                        <CardHeaderRow>
                            <span id="amount" style={{ fontSize: '1.4rem' }}>
                                956.00 EUR
                            </span>
                        </CardHeaderRow>
                    </CardHeaderColumn>
                </CardExtendedHeader>
            </CardHeader>
        </Card>
    );
}

describe('Card', () => {
    it('header, content and footer render in order; badges at the top end corner (two at most)', async () => {
        const { q, all, rerender } = await mount(<Standard />);
        const card = q('#card');
        const header = q('[aria-roledescription="Card Header"]');
        const content = q('#content').parentElement!;
        const footer = card.lastElementChild!;
        // the footer is placed last, even when written before the content
        expect([...card.children]).toEqual([q('[data-card-badges]'), header, content, footer]);
        expect(footer.contains(q('#approve'))).toBe(true);
        expect(rect(content).top).toBeGreaterThanOrEqual(rect(header).bottom - 1);
        expect(rect(footer).top).toBeGreaterThanOrEqual(rect(content).bottom - 1);

        // footer actions sit at the end, after the footer content
        const approve = q('#approve');
        const reject = q('#reject');
        expect(rect(reject).left).toBeGreaterThan(rect(approve).right);
        expect(Math.round(rect(footer).right - rect(reject).right)).toBe(16);
        expect(rect(approve).left).toBeGreaterThan(rect(q('#footer-text')).right);

        // the counter sits at the end of the header
        expect(rect(q('#counter')).left).toBeGreaterThan(rect(q('#title')).right);

        const badges = () => all('[data-card-badges] > span');
        const text = (b: HTMLElement) => b.textContent!.trim().replace('Object Status', '');
        expect(badges().map(text)).toEqual(['Badge']);
        const badgeBox = q('[data-card-badges]');
        expect(rect(badgeBox).top).toBeLessThan(rect(card).top);
        expect(Math.round(rect(card).right - rect(badgeBox).right)).toBe(9);

        await rerender(<Standard secondBadge="Second" />);
        expect(badges().map(text)).toEqual(['Badge', 'Second']);
        expect(rect(badges()[1]).left).toBeGreaterThan(rect(badges()[0]).right);
        expect(Math.round(rect(badges()[1]).right)).toBe(Math.round(rect(q('[data-card-badges]')).right));

        await rerender(<Standard badge="" />);
        expect(q('[data-card-badges]')).toBeNull();

        document.documentElement.setAttribute('dir', 'rtl');
        await rerender(<Standard />);
        expect(Math.round(rect(q('[data-card-badges]')).left - rect(card).left)).toBe(9);
    });

    it('the card is labelled by its title and described by subtitle, counter and badges', async () => {
        const { q, rerender } = await mount(<Standard />);
        const card = q('#card');
        expect(card.getAttribute('role')).toBe('region');
        expect(card.getAttribute('aria-labelledby')).toBe('title');
        expect(card.getAttribute('aria-describedby')).toBe('subtitle counter card-badge');
        expect(q('#card-badge').textContent!.trim().startsWith('Badge')).toBe(true);
        expect(card.getAttribute('tabindex')).toBe('-1');

        await rerender(<Standard secondBadge="Second" describedby="extra" />);
        expect(card.getAttribute('aria-describedby')).toBe('subtitle counter card-badge card-second-badge extra');
        const header = q('[aria-roledescription="Card Header"]');
        expect(header.getAttribute('role')).toBe('group');
    });

    it('generates ids for the card and its parts', async () => {
        const { q } = await mount(
            <Card badge="New">
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Title</CardTitle>
                        <CardSubtitle>Subtitle</CardSubtitle>
                    </CardMainHeader>
                </CardHeader>
            </Card>
        );
        const card = q('[role="region"]');
        expect(card.id).toMatch(/^fd-card-/);
        const title = q('h2');
        expect(title.id).toMatch(/^fd-card-title-/);
        expect(card.getAttribute('aria-labelledby')).toBe(title.id);
        const [subtitle, badge] = card.getAttribute('aria-describedby')!.split(' ');
        expect(document.getElementById(subtitle)!.textContent).toBe('Subtitle');
        expect(badge).toBe(`${card.id}-badge`);
        expect(document.getElementById(badge)).not.toBeNull();
    });

    it('counter color follows its status', async () => {
        const { q, rerender } = await mount(<Standard />);
        const counter = q('#counter');
        expect(style(counter).color).toBe(cssColor('--sapNeutralTextColor'));
        await rerender(<Standard counterStatus="negative" />);
        expect(style(counter).color).toBe(cssColor('--sapNegativeTextColor'));
    });

    it('interactive main header: a focusable button; Enter, Space and click call onAction; aria-description carries the hint', async () => {
        const keys: string[] = [];
        const actions: number[] = [];
        const { q, rerender } = await mount(<Interactive keys={keys} actions={actions} />);
        const button = q('[role="button"]');
        expect(button.getAttribute('tabindex')).toBe('0');
        expect(button.getAttribute('aria-description')).toBe('Activate for action/navigation');
        expect(button.getAttribute('title')).toBe('Activate for action/navigation');
        expect(button.contains(q('h2'))).toBe(true);
        // the header action stays outside the button
        expect(button.contains(q('#action'))).toBe(false);

        q('#before').focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(button);
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        expect(keys).toEqual(['Enter', ' ']);
        expect(actions).toHaveLength(2);
        await userEvent.click(button);
        expect(actions).toHaveLength(3);
        // the header action does not activate the header
        await userEvent.click(q('#action'));
        expect(actions).toHaveLength(3);

        // focus frame drawn inside the area
        button.focus();
        expect(style(button, '::before').position).toBe('absolute');
        expect(style(button, '::before').borderTopStyle).not.toBe('none');

        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(q('#action'));

        await rerender(<Interactive hint="Open orders" keys={keys} actions={actions} />);
        expect(q('[role="button"]').getAttribute('aria-description')).toBe('Open orders');

        await rerender(<Interactive interactive={false} keys={keys} actions={actions} />);
        expect(q('[role="button"]')).toBeNull();
        const area = q('h2').parentElement!.parentElement!.parentElement!;
        expect(area.hasAttribute('role')).toBe(false);
        expect(area.hasAttribute('tabindex')).toBe(false);
        expect(area.hasAttribute('aria-description')).toBe(false);
        expect(area.hasAttribute('title')).toBe(false);
    });

    it('card role description and hint are exposed on the root', async () => {
        const { q, rerender } = await mount(<Role />);
        const card = q('#card');
        expect(card.getAttribute('aria-roledescription')).toBe('Standard Card');
        expect(card.hasAttribute('aria-description')).toBe(false);

        await rerender(<Role cardType="quickView" />);
        expect(card.getAttribute('aria-roledescription')).toBe('QuickView Card');
        await rerender(<Role cardType="quickView" roleDescription="Product card" />);
        expect(card.getAttribute('aria-roledescription')).toBe('Product card');

        await rerender(<Role role="listitem" />);
        expect(card.getAttribute('role')).toBe('listitem');
        expect(card.getAttribute('aria-description')).toBe('Active, Press Enter to activate');
        expect(card.getAttribute('tabindex')).toBe('0');
        await rerender(<Role role="listitem" description="Opens the product" />);
        expect(card.getAttribute('aria-description')).toBe('Opens the product');

        // an explicit label replaces the title reference
        expect(card.getAttribute('aria-labelledby')).toBe('title');
        await rerender(<Role role="listitem" ariaLabel="Product" />);
        expect(card.getAttribute('aria-label')).toBe('Product');
        expect(card.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('role button makes the whole card focusable and interactive', async () => {
        const { q, rerender } = await mount(<Role />);
        const card = q('#card');
        await userEvent.hover(q('#spacer'));
        expect(style(card).cursor).not.toBe('pointer');
        await rerender(<Role role="button" />);
        expect(card.getAttribute('tabindex')).toBe('0');
        expect(style(card).cursor).toBe('pointer');
        expect(card.hasAttribute('aria-description')).toBe(false);
        card.focus();
        expect(style(card, '::before').position).toBe('absolute');

        await userEvent.hover(q('#spacer'));
        const before = style(card).backgroundColor;
        expect(before).toBe(cssBackground('--sapTile_Background'));
        await userEvent.hover(card);
        expect(style(card).backgroundColor).toBe(cssBackground('--sapTile_Hover_Background'));
        expect(style(card).backgroundColor).not.toBe(before);
    });

    it('selected card shows the selection border (data-selected), not aria-selected on listitems', async () => {
        const { q, rerender } = await mount(<Role role="listitem" />);
        const card = q('#card');
        expect(card.hasAttribute('data-selected')).toBe(false);
        expect(style(card, '::before').content).toBe('none');

        await rerender(<Role role="listitem" selected />);
        expect(card.hasAttribute('data-selected')).toBe(true);
        expect(card.hasAttribute('aria-selected')).toBe(false);
        const before = style(card, '::before');
        expect(before.position).toBe('absolute');
        expect(before.borderTopColor).toBe(cssColor('--sapContent_FocusColor'));
        expect(before.borderTopStyle).not.toBe('none');

        // a non-interactive card shows no selection frame
        await rerender(<Role selected />);
        expect(style(card, '::before').content).toBe('none');
        await rerender(<Role selected interactive />);
        expect(style(card, '::before').position).toBe('absolute');
    });

    it('KPI header: value, scale icon/text, analytics labels and indicators', async () => {
        const { q, rerender } = await mount(<Kpi />);
        const value = q('#value');
        expect(value.textContent).toBe('42.2');
        expect(style(value).fontSize).toBe('36px');
        expect(style(value).color).toBe(cssColor('--sapPositiveTextColor'));
        await rerender(<Kpi status={null} />);
        expect(style(value).color).toBe(cssColor('--sapNeutralTextColor'));
        await rerender(<Kpi status="critical" />);
        expect(style(value).color).toBe(cssColor('--sapCriticalTextColor'));

        // scale icon above the scale text, both after the value
        const icon = q('#icon');
        const scale = q('#scale');
        expect(rect(icon).left).toBeGreaterThanOrEqual(rect(value).right);
        expect(rect(scale).top).toBeGreaterThan(rect(icon).top);

        // analytics follow the KPI, labels above their values
        const [a1, a2] = [q('#a1'), q('#a2')];
        expect(rect(a1).left).toBeGreaterThan(rect(scale).right);
        expect(rect(a2).left).toBeGreaterThan(rect(a1).right);
        const [label, content] = [...a1.children];
        expect(rect(content).top).toBeGreaterThanOrEqual(rect(label).bottom - 1);
        expect(style(label).color).toBe(cssColor('--sapTile_TextColor'));
        expect(style(content).color).toBe(cssColor('--sapTile_TitleTextColor'));

        // the second subtitle comes below the KPI
        expect(rect(q('#second')).top).toBeGreaterThanOrEqual(rect(q('[data-testid="kpi"]')).bottom);

        // numeric header with an indicator at the end
        const numeric = q('[data-testid="numeric"]');
        expect(numeric.getAttribute('role')).toBe('group');
        expect(numeric.getAttribute('aria-roledescription')).toBe('Numeric content');
        const indicator = q('#ind');
        expect(rect(indicator).left).toBeGreaterThan(rect(q('[data-testid="numeric-container"]')).right - 1);
        expect(Math.round(rect(indicator).right)).toBe(Math.round(rect(numeric).right) - 16);
        // the title comes first whatever the order of the children
        const title = q('#ind-title');
        const indValue = q('#ind-value');
        expect(rect(indValue).top).toBeGreaterThanOrEqual(rect(title).bottom - 1);
        expect(Math.round(rect(indValue).right)).toBe(Math.round(rect(indicator).right));
        expect(style(q('#numeric-value')).color).toBe(cssColor('--sapNegativeTextColor'));
    });

    it('KPI values keep their LTR direction in RTL', async () => {
        const { q } = await mount(<Kpi />);
        document.documentElement.setAttribute('dir', 'rtl');
        await frame();
        expect(style(q('#value')).direction).toBe('ltr');
        expect(style(q('#a1').lastElementChild!).direction).toBe('ltr');
        // the analytics are laid out from the right
        expect(rect(q('#a2')).right).toBeLessThan(rect(q('#a1')).left);
    });

    it('loader state shows the loader and renders nothing else', async () => {
        const { q, rerender } = await mount(<Loader />);
        const card = q('#card');
        expect(q('[data-testid="loader"]')).not.toBeNull();
        expect(q('[data-testid="loader"] svg')!.getAttribute('aria-hidden')).toBe('true');
        // header, content and badges are not rendered at all
        expect(q('[data-testid="header"]')).toBeNull();
        expect(q('#content')).toBeNull();
        expect(q('[data-card-badges]')).toBeNull();
        expect(card.textContent!.trim()).toBe('');
        expect(card.hasAttribute('aria-labelledby')).toBe(false);
        expect(card.hasAttribute('aria-describedby')).toBe(false);
        expect(rect(q('[data-testid="loader"]')).height).toBeGreaterThanOrEqual(80);

        await rerender(<Loader loading={false} />);
        expect(q('[data-testid="loader"]')).toBeNull();
        expect(q('#content').textContent).toBe('Content');
        expect(q('[data-card-badges]')).not.toBeNull();
    });

    it('media card: image container/banner variants, shell and legend colors, responsive banner sizes', async () => {
        const { q, rerender } = await mount(<Media />);
        const imageCard = q('#image-card');
        const media = q('[data-testid="image-media"]');
        const image = q('#image-card img');
        expect(media.getAttribute('role')).toBe('group');
        expect(media.getAttribute('aria-roledescription')).toBe('Card Media Block');
        // the image fills the card width, no rounding
        expect(Math.round(rect(image).width)).toBe(Math.round(rect(imageCard).width) - 2);
        expect(style(image).borderTopLeftRadius).toBe('0px');
        expect(style(image).objectFit).toBe('cover');

        await rerender(<Media padding />);
        expect(Math.round(rect(image).left - rect(imageCard).left)).toBe(17);
        expect(style(image).borderTopLeftRadius).toBe('8px');

        // shell colour: background and text colours of the category
        const shellMedia = q('[data-testid="shell-media"]');
        const heading = q('#heading');
        expect(heading.getAttribute('role')).toBe('heading');
        expect(heading.getAttribute('aria-level')).toBe('2');
        expect(q('#shell-card').getAttribute('aria-labelledby')).toBe('heading');
        expect(style(shellMedia).backgroundColor).toBe(cssBackground('--sapShell_Category_3_Background'));
        expect(style(heading).color).toBe(cssColor('--sapShell_Category_3_TextColor'));
        await rerender(<Media padding shell={null} legend={5} />);
        expect(style(shellMedia).backgroundColor).toBe(cssBackground('--sapLegendBackgroundColor5'));
        expect(style(heading).color).toBe(cssColor('--sapTextColor'));
        await rerender(<Media padding shell={null} />);
        expect(style(shellMedia).backgroundColor).toBe(cssBackground('--sapTile_Background'));

        // legend colour on the content container of a banner
        const banner = q('#banner');
        const container = q('[data-testid="banner-content"]');
        expect(style(container).backgroundColor).toBe(cssBackground('--sapLegendBackgroundColor13'));
        expect(container.firstElementChild!.getAttribute('aria-level')).toBe('3');

        // banner: text and image side by side, half each
        const bannerImage = q('[data-testid="banner-image"]');
        const inner = rect(banner).width - 2;
        expect(Math.round(rect(container).width)).toBe(Math.round(inner / 2));
        expect(Math.round(rect(bannerImage).width)).toBe(Math.round(inner / 2));
        expect(rect(bannerImage).left).toBeGreaterThanOrEqual(rect(container).right - 1);
        expect(Math.round(rect(bannerImage).height)).toBe(Math.round(rect(banner).height) - 2);
        expect(style(container).paddingLeft).toBe('48px');
        // a text-only banner uses 80% for the text
        const textBanner = q('#text-banner');
        expect(Math.round(rect(q('[data-testid="text-banner-content"]')).width)).toBe(
            Math.round((rect(textBanner).width - 2) * 0.8)
        );

        // below lg: 80% text, 20% image
        await page.viewport(800, 800);
        await frame();
        const mid = rect(banner).width - 2;
        expect(Math.round(rect(container).width)).toBe(Math.round(mid * 0.8));
        expect(Math.round(rect(bannerImage).width)).toBe(Math.round(mid * 0.2));

        // below sm: the image stacks above the text, 10rem high, full width
        await page.viewport(500, 800);
        await frame();
        const small = rect(banner).width - 2;
        expect(Math.round(rect(bannerImage).width)).toBe(Math.round(small));
        expect(Math.round(rect(bannerImage).height)).toBe(160);
        expect(Math.round(rect(container).width)).toBe(Math.round(small));
        expect(rect(container).top).toBeGreaterThanOrEqual(rect(bannerImage).bottom - 1);
    });

    it('overlay content container sits over an image of the full width', async () => {
        const { q } = await mount(
            <Card cardType="banner" style={{ height: 300 }} data-testid="card">
                <CardMedia>
                    <CardMediaContentContainer isOverlay data-testid="overlay">
                        <CardMediaHeading>Over the image</CardMediaHeading>
                    </CardMediaContentContainer>
                    <CardMediaImageContainer data-testid="image">
                        <CardMediaImage src={IMG} alt="" />
                    </CardMediaImageContainer>
                </CardMedia>
            </Card>
        );
        const overlay = rect(q('[data-testid="overlay"]'));
        const image = rect(q('[data-testid="image"]'));
        expect(style(q('[data-testid="overlay"]')).position).toBe('absolute');
        const card = rect(q('[data-testid="card"]'));
        // the image takes the whole width; the text sits 3rem from the start, half as wide less 3rem
        expect(Math.round(image.width)).toBe(Math.round(card.width) - 2);
        expect(Math.round(overlay.left - image.left)).toBe(48);
        expect(Math.round(overlay.width)).toBe(Math.round(image.width / 2 - 48));
        expect(overlay.top).toBeGreaterThan(image.top);
        expect(overlay.bottom).toBeLessThan(image.bottom);

        // below lg the text is 80% less 3rem wide
        await page.viewport(800, 800);
        await frame();
        const mid = rect(q('[data-testid="image"]')).width;
        expect(Math.round(rect(q('[data-testid="overlay"]')).width)).toBe(Math.round(mid * 0.8 - 48));
    });

    it('card list: arrow keys move focus between cards, Home/End jump', async () => {
        const { q, all } = await mount(<ProductList />);
        const list = q('[role="list"]');
        expect(list.getAttribute('aria-label')).toBe('Products');
        expect(list.getAttribute('aria-roledescription')).toBe('Card List');
        const cards = all('[role="listitem"]');
        expect(cards.map((c) => c.getAttribute('aria-posinset'))).toEqual(['1', '2', '3', '4']);
        expect(cards.every((c) => c.getAttribute('aria-setsize') === '4')).toBe(true);
        // the header inside a list item is not a separate target
        expect(style(cards[0].querySelector('h2')!.parentElement!.parentElement!.parentElement!).pointerEvents).toBe(
            'none'
        );

        q('#before').focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(cards[0]);
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(cards[1]);
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(cards[2]);
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(cards[1]);
        await userEvent.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(cards[0]);
        // no wrap at the ends
        await userEvent.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(cards[0]);
        await userEvent.keyboard('{End}');
        expect(document.activeElement).toBe(cards[3]);
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(cards[3]);
        await userEvent.keyboard('{Home}');
        expect(document.activeElement).toBe(cards[0]);

        // every card is a tab stop
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(cards[1]);
    });

    it('card list ignores keys from elements that are not cards, and calls onKeyDown', async () => {
        const keys: string[] = [];
        const { q } = await mount(
            <CardList aria-label="Products" onKeyDown={(event) => keys.push(event.key)}>
                <button id="inside">Inside</button>
                <Card role="listitem">
                    <CardContent>One</CardContent>
                </Card>
            </CardList>
        );
        q('#inside').focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(keys).toEqual(['ArrowDown']);
        expect(document.activeElement).toBe(q('#inside'));
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
        q('[role="list"]').dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
    });

    it('corner rounding of the first/last part follows the card radius', async () => {
        const { q } = await mount(<Corners />);
        const radius = style(q('#three')).borderTopLeftRadius;
        expect(radius).not.toBe('0px');
        const corners = (el: Element) => {
            const s = style(el);
            return [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius];
        };
        expect(corners(q('#top'))).toEqual([radius, radius, '0px', '0px']);
        expect(corners(q('#middle'))).toEqual(['0px', '0px', '0px', '0px']);
        expect(corners(q('#bottom'))).toEqual(['0px', '0px', radius, radius]);
        // badges come first in the DOM, the content after them still gets the top corners
        expect(corners(q('#badged-content'))).toEqual([radius, radius, radius, radius]);
        expect(corners(q('#only-content'))).toEqual([radius, radius, radius, radius]);
        // the bottom header of the three-part card has a top border instead of a bottom one
        expect(style(q('#bottom').firstElementChild!).borderTopWidth).toBe('1px');
        expect(style(q('#top').firstElementChild!).borderBottomWidth).toBe('1px');
    });

    it('aria-describedby includes the second subtitle', async () => {
        const { q } = await mount(<Extended />);
        expect(q('#extended').getAttribute('aria-describedby')).toBe('sub second');
    });

    it('extended header: a group whose end column aligns to the end and whose content can sit at the bottom', async () => {
        const { q, rerender } = await mount(<Extended />);
        const ext = q('#ext');
        expect(ext.getAttribute('role')).toBe('group');
        expect(ext.getAttribute('aria-roledescription')).toBe('Extended content');
        // the extended header follows the main header inside the card header
        expect(rect(ext).top).toBeGreaterThanOrEqual(rect(q('[data-testid="main"]')).bottom - 1);

        // columns sit side by side; the end column's content hugs the end edge
        const start = rect(q('#start-column'));
        const end = rect(q('#end-column'));
        expect(end.left).toBeGreaterThanOrEqual(start.right - 1);
        expect(Math.abs(rect(q('#amount')).right - end.right)).toBeLessThan(1);
        // rows lay out their items side by side
        const [a, b] = [...q('#start-row').children].map(rect);
        expect(b.left).toBeGreaterThan(a.right - 1);

        // align bottom: the shorter end column sits at the bottom of the taller start column
        expect(Math.abs(end.bottom - start.bottom)).toBeLessThan(1);
        expect(end.top).toBeGreaterThan(start.top + 1);
        await rerender(<Extended align="top" />);
        expect(Math.abs(rect(q('#end-column')).top - rect(q('#start-column')).top)).toBeLessThan(1);
    });

    it('main header places avatar, texts, KPI, actions and counter in their areas whatever the order', async () => {
        const { q } = await mount(
            <Card cardType="analytical" style={{ width: 400 }}>
                <CardHeader>
                    <CardMainHeader data-testid="main">
                        <CardCounter id="counter">1 of 3</CardCounter>
                        <CardSecondSubtitle id="second">Second</CardSecondSubtitle>
                        <CardSubtitle id="subtitle">Subtitle</CardSubtitle>
                        <CardHeaderAction>
                            <button id="action">More</button>
                        </CardHeaderAction>
                        <CardTitle id="title">Title</CardTitle>
                        <span id="avatar-stand-in">other</span>
                    </CardMainHeader>
                </CardHeader>
            </Card>
        );
        const ids = [...q('[data-testid="main"]').querySelectorAll('[id]')].map((el) => el.id);
        expect(ids).toEqual(['title', 'subtitle', 'second', 'action', 'counter', 'avatar-stand-in']);
        // analytical: the subtitle area has a top margin and the title clamps at two lines
        expect(style(q('#subtitle').parentElement!).marginTop).toBe('8px');
        expect(style(q('#title')).webkitLineClamp).toBe('2');
        // the action is above the counter at the end
        expect(rect(q('#counter')).top).toBeGreaterThan(rect(q('#action')).top);
        expect(rect(q('#action')).left).toBeGreaterThan(rect(q('#title')).right);
    });

    it('content of object and compact table cards', async () => {
        const { q } = await mount(
            <>
                <Card cardType="object">
                    <CardContent data-testid="object">Object</CardContent>
                </Card>
                <div data-density="compact">
                    <Card cardType="table">
                        <CardContent data-testid="table">Table</CardContent>
                    </Card>
                </div>
            </>
        );
        expect(style(q('[data-testid="object"]')).paddingTop).toBe('16px');
        expect(style(q('[data-testid="table"]')).paddingBottom).toBe('8px');
        expect(style(q('[data-testid="table"]')).paddingTop).toBe('0px');
    });

    it('title level and render', async () => {
        const { q } = await mount(
            <Card>
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle level={3} id="title">
                            Title
                        </CardTitle>
                        <CardSubtitle render={<h4 />} id="subtitle">
                            Subtitle
                        </CardSubtitle>
                    </CardMainHeader>
                </CardHeader>
            </Card>
        );
        expect(q('#title').tagName).toBe('H3');
        expect(q('#subtitle').tagName).toBe('H4');
        // the card title typography whatever the level: the bold header font without synthetic bold
        expect(style(q('#title')).fontWeight).toBe('400');
        expect(style(q('#subtitle')).fontWeight).toBe('400');
    });

    it('spreads native props, merges className and forwards the refs of the card and its parts', async () => {
        const cardRef = createRef<HTMLDivElement>();
        const titleRef = createRef<HTMLHeadingElement>();
        const contentRef = createRef<HTMLDivElement>();
        const listRef = createRef<HTMLDivElement>();
        const { q } = await mount(
            <CardList ref={listRef} data-testid="list" className="custom-list">
                <Card ref={cardRef} role="listitem" data-testid="card" className="custom-card" title="Card tooltip">
                    <CardHeader data-testid="header" className="custom-header">
                        <CardMainHeader data-testid="main">
                            <CardTitle ref={titleRef}>Title</CardTitle>
                        </CardMainHeader>
                    </CardHeader>
                    <CardContent ref={contentRef} data-testid="content" className="custom-content" />
                </Card>
            </CardList>
        );
        const card = q('[data-testid="card"]');
        expect(cardRef.current).toBe(card);
        expect(card.classList.contains('custom-card')).toBe(true);
        expect(card.classList.contains('rounded-(--card-r)')).toBe(true);
        expect(card.getAttribute('title')).toBe('Card tooltip');
        expect(titleRef.current).toBe(q('h2'));
        expect(contentRef.current).toBe(q('[data-testid="content"]'));
        expect(listRef.current).toBe(q('[data-testid="list"]'));
        expect(q('[data-testid="header"]').classList.contains('custom-header')).toBe(true);
        expect(q('[data-testid="list"]').classList.contains('custom-list')).toBe(true);
        // the list still knows the card behind a forwarded ref
        card.focus();
        await userEvent.keyboard('{End}');
        expect(document.activeElement).toBe(card);
    });

    it('renders another element with render', async () => {
        const { q } = await mount(
            <Card render={<section />} data-testid="card">
                <CardContent render={<article />}>Content</CardContent>
                <CardFooter render={<footer />}>Footer</CardFooter>
            </Card>
        );
        const card = q('[data-testid="card"]');
        expect(card.tagName).toBe('SECTION');
        expect(card.querySelector('article')!.textContent).toBe('Content');
        expect(card.querySelector('footer')!.textContent).toBe('Footer');
    });
});
