import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Bar, BarElement, BarRight } from '@/ui/bar/bar';
import { Breadcrumb, BreadcrumbItem } from '@/ui/breadcrumb/breadcrumb';
import { Button } from '@/ui/button/button';
import { MessageStrip } from '@/ui/message-strip/message-strip';
import { Tab, TabList, type TabListActions } from '@/ui/tabs/tabs';
import { Toolbar, ToolbarItem } from '@/ui/toolbar/toolbar';
import {
    DynamicPage,
    DynamicPageBreadcrumb,
    DynamicPageContent,
    DynamicPageFooter,
    DynamicPageGlobalActions,
    DynamicPageHeader,
    DynamicPageLayoutActions,
    DynamicPageSubheader,
    DynamicPageTabs,
    DynamicPageTitleContent,
    dynamicPageWidthToSize,
    type DynamicPageActions,
    type DynamicPageResponsiveSize
} from './dynamic-page';

const TEXT = 'Lorem ipsum dolor sit amet. '.repeat(200);

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const stable = async () => {
    await frame();
    await frame();
    await frame();
};

async function scroll(element: HTMLElement, top: number) {
    element.scrollTop = top;
    element.dispatchEvent(new Event('scroll'));
    await stable();
}

interface HostProps {
    tabs?: boolean;
    stacked?: boolean;
    breadcrumb?: boolean;
    noSnap?: boolean;
    tabActions?: React.Ref<TabListActions>;
    actions?: React.Ref<DynamicPageActions>;
}

/** The Angular test host: breadcrumb, pinnable subheader, content (or two tabs) and a footer. */
function Host({ tabs = false, stacked = false, breadcrumb = true, noSnap = false, tabActions, actions }: HostProps) {
    return (
        <div style={{ height: '30rem', width: '60rem' }}>
            <DynamicPage aria-label="Page" expandContent={false} disableSnapOnScroll={noSnap} actionsRef={actions}>
                <DynamicPageHeader title="Product">
                    <DynamicPageBreadcrumb>
                        {breadcrumb ? (
                            <Breadcrumb>
                                <BreadcrumbItem>
                                    <a href="#">Home</a>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <span aria-current="page">Product</span>
                                </BreadcrumbItem>
                            </Breadcrumb>
                        ) : (
                            <a href="#">Home</a>
                        )}
                    </DynamicPageBreadcrumb>
                </DynamicPageHeader>
                <DynamicPageSubheader pinnable>Facets</DynamicPageSubheader>
                {tabs ? (
                    <TabList ariaLabel="Sections" stackContent={stacked} actionsRef={tabActions}>
                        <Tab title="One">
                            <DynamicPageContent>{TEXT}</DynamicPageContent>
                        </Tab>
                        <Tab title="Two">
                            <DynamicPageContent>{TEXT}</DynamicPageContent>
                        </Tab>
                    </TabList>
                ) : (
                    <DynamicPageContent>{TEXT}</DynamicPageContent>
                )}
                <DynamicPageFooter>Footer</DynamicPageFooter>
            </DynamicPage>
        </div>
    );
}

async function setup(props: HostProps = {}) {
    const actions = createRef<DynamicPageActions>();
    const screen = await render(<Host {...props} actions={actions} />);
    await stable();
    const root = screen.container as HTMLElement;
    const toggle = root.querySelector<HTMLElement>('span[role=button][aria-expanded]')!;
    const subheader = root.querySelector<HTMLElement>('section[aria-label="Expanded Header"]')!;
    return { screen, root, actions, toggle, subheader };
}

interface HeaderHostProps {
    width?: number;
    expand?: boolean;
    offset?: number;
    autoResponsive?: boolean;
    size?: DynamicPageResponsiveSize;
    title?: string;
    subtitle?: string;
    wrap?: boolean;
    titleId?: string;
    headingLevel?: number | string;
    subtitleHeadingLevel?: number;
    custom?: boolean;
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    actions?: React.Ref<DynamicPageActions>;
}

/** The Angular header host: every title area part, a message strip and a pinnable, controlled subheader. */
function HeaderHost({
    width = 1400,
    expand = false,
    offset = 0,
    autoResponsive = true,
    size = 'extra-large',
    title = 'Product title',
    subtitle = 'Product subtitle',
    wrap = false,
    titleId = 'product-title',
    headingLevel = 2,
    subtitleHeadingLevel,
    custom = false,
    collapsed,
    onCollapsedChange,
    actions
}: HeaderHostProps) {
    return (
        <div style={{ height: '30rem', width }}>
            <DynamicPage
                aria-label="Page"
                expandContent={expand}
                offset={offset}
                autoResponsive={autoResponsive}
                size={size}
                actionsRef={actions}
            >
                <DynamicPageHeader
                    title={title}
                    subtitle={subtitle}
                    titleWrap={wrap}
                    subtitleWrap={wrap}
                    titleId={titleId}
                    headingLevel={headingLevel}
                    subtitleHeadingLevel={subtitleHeadingLevel}
                    renderTitle={
                        custom
                            ? (c) => <span data-testid="custom-title">{c ? 'Title collapsed' : 'Title expanded'}</span>
                            : undefined
                    }
                    renderSubtitle={
                        custom
                            ? (c) => (
                                  <span data-testid="custom-subtitle">
                                      {c ? 'Subtitle collapsed' : 'Subtitle expanded'}
                                  </span>
                              )
                            : undefined
                    }
                >
                    <DynamicPageBreadcrumb>
                        <a href="#">Home</a>
                    </DynamicPageBreadcrumb>
                    <DynamicPageGlobalActions>
                        <Button label="Accept" />
                    </DynamicPageGlobalActions>
                    <DynamicPageLayoutActions>
                        <Button glyph="decline" aria-label="Close" />
                    </DynamicPageLayoutActions>
                    <MessageStrip type="warning" dismissible={false}>
                        Not confirmed yet.
                    </MessageStrip>
                </DynamicPageHeader>
                <DynamicPageSubheader pinnable collapsed={collapsed} onCollapsedChange={onCollapsedChange}>
                    Facets
                </DynamicPageSubheader>
                <DynamicPageContent>Content</DynamicPageContent>
            </DynamicPage>
        </div>
    );
}

async function setupHeader(props: HeaderHostProps = {}) {
    const actions = createRef<DynamicPageActions>();
    let current = { ...props };
    const screen = await render(<HeaderHost {...current} actions={actions} />);
    await stable();
    const root = screen.container as HTMLElement;
    const header = () => root.querySelector<HTMLElement>('article header > div > div:last-child')!;
    const heading = () => header().querySelector<HTMLElement>('[role=heading]')!;
    /** The subtitle: below the title area when expanded, inside it when collapsed. */
    const subtitle = () =>
        [...header().querySelectorAll<HTMLElement>('span')].find((el) => el.textContent!.includes('ubtitle'))!;
    const toggle = () => root.querySelector<HTMLElement>('span[role=button][aria-expanded]')!;
    const update = async (next: HeaderHostProps) => {
        current = { ...current, ...next };
        await screen.rerender(<HeaderHost {...current} actions={actions} />);
        await stable();
    };
    return { screen, root, actions, header, heading, subtitle, toggle, update };
}

/** A page with the global actions in a toolbar, as the Angular overflow host. */
function OverflowHost({ width }: { width: number }) {
    return (
        <div style={{ height: '20rem', width }}>
            <DynamicPage aria-label="Page" expandContent={false}>
                <DynamicPageHeader title="Product">
                    <DynamicPageGlobalActions>
                        <Toolbar variant="transparent" clearBorder aria-label="Product actions">
                            <ToolbarItem>
                                <Button variant="positive" label="Accept" data-label="Accept" />
                            </ToolbarItem>
                            <ToolbarItem>
                                <Button variant="negative" label="Reject" data-label="Reject" />
                            </ToolbarItem>
                        </Toolbar>
                    </DynamicPageGlobalActions>
                </DynamicPageHeader>
                <DynamicPageContent>Content</DynamicPageContent>
            </DynamicPage>
        </div>
    );
}

describe('DynamicPage', () => {
    it('moves the global actions of a toolbar into its overflow when the page is small', async () => {
        const screen = await render(<OverflowHost width={1000} />);
        await stable();
        const toolbar = screen.container.querySelector<HTMLElement>('[aria-label="Product actions"]')!;
        const more = () => toolbar.querySelector('button[aria-label="More"]');
        const inline = () =>
            [...toolbar.querySelectorAll<HTMLElement>(':scope > [data-toolbar-item] button[data-label]')].map((b) =>
                b.getAttribute('data-label')
            );
        expect(inline()).toEqual(['Accept', 'Reject']);
        expect(more()).toBeNull();

        await screen.rerender(<OverflowHost width={500} />);
        await stable();
        expect(inline()).toEqual([]);
        expect(more()).not.toBeNull();

        await screen.rerender(<OverflowHost width={1000} />);
        await stable();
        expect(inline()).toEqual(['Accept', 'Reject']);
        expect(more()).toBeNull();
    });

    it('toggles the header by clicking the title area but not its links', async () => {
        const { root, toggle, subheader } = await setup({ breadcrumb: false });
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        await userEvent.click(root.querySelector('[role=heading]')!);
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        expect(subheader.hidden).toBe(true);
        const link = root.querySelector<HTMLAnchorElement>('[role=navigation] a')!;
        link.addEventListener('click', (e) => e.preventDefault());
        await userEvent.click(link);
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('toggles the header with Enter and Space on the header button', async () => {
        const { toggle } = await setup();
        toggle.focus();
        await userEvent.keyboard('{Enter}');
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        await userEvent.keyboard(' ');
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        expect(toggle.getAttribute('aria-label')).toBe('Toggle Header');
    });

    it('collapses the header while the content scrolls, unless pinned', async () => {
        const { root, actions, toggle } = await setup();
        const content = root.querySelector<HTMLElement>('article > div[tabindex]')!;
        expect(actions.current!.scrollElement()).toBe(content);
        expect(content.tabIndex).toBe(0);
        await scroll(content, 200);
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        await scroll(content, 0);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        await userEvent.click(root.querySelector('button[aria-label="Pin Header"]')!);
        await scroll(content, 200);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('keeps the header expanded with disableSnapOnScroll', async () => {
        const { root, toggle } = await setup({ noSnap: true });
        await scroll(root.querySelector<HTMLElement>('article > div[tabindex]')!, 200);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('scrolls the content of tabs in the tab list and collapses the header from it', async () => {
        const tabActions = createRef<TabListActions>();
        const { root, actions, toggle } = await setup({ tabs: true, tabActions });
        const area = tabActions.current!.scrollElement()!;
        expect(actions.current!.scrollElement()).toBe(area);
        // with tabs the subheader casts no shadow: the tab bar does
        const visibility = root.querySelector<HTMLElement>('[aria-label="Header actions"]')!.parentElement!;
        expect(getComputedStyle(visibility).boxShadow).toBe('none');
        const content = root.querySelector<HTMLElement>('[role=tabpanel] > div')!;
        expect(content.hasAttribute('tabindex')).toBe(false);
        expect(area.scrollHeight).toBeGreaterThan(area.clientHeight);
        await scroll(area, 200);
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        await scroll(area, 0);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('leaves room for the footer below each content, or only the last with stacked tabs', async () => {
        const spacers = (root: HTMLElement) =>
            [...root.querySelectorAll('article div.scrollbar-sap:not([role])')]
                .filter((c) => !c.querySelector('[role=tab]'))
                .map((c) => !!c.querySelector(':scope > [aria-hidden=true]'));
        const single = await setup();
        expect(spacers(single.root)).toEqual([true]);
        await single.screen.unmount();
        const stacked = await setup({ tabs: true, stacked: true });
        const contents = [...stacked.root.querySelectorAll('[role=tabpanel] > div')];
        expect(contents.map((c) => !!c.querySelector(':scope > [aria-hidden=true]'))).toEqual([false, true]);
    });

    it('does not nest a navigation landmark around a Breadcrumb', async () => {
        const withBreadcrumb = await setup();
        expect(withBreadcrumb.root.querySelectorAll('[role=navigation], nav').length).toBe(1);
        expect(withBreadcrumb.root.querySelector('nav')).not.toBeNull();
        await withBreadcrumb.screen.unmount();
        const plain = await setup({ breadcrumb: false });
        const nav = plain.root.querySelector('[role=navigation]')!;
        expect(nav.getAttribute('aria-label')).toBe('Breadcrumbs');
        expect(nav.querySelector('a')).not.toBeNull();
    });

    describe('header', () => {
        it('global and layout actions are labelled toolbars', async () => {
            const { root } = await setupHeader();
            const toolbars = [...root.querySelectorAll('[role=toolbar]')].map((t) => t.getAttribute('aria-label'));
            expect(toolbars).toEqual(['Global actions', 'Layout actions', 'Header actions']);
        });

        it('renders title and subtitle, and moves the subtitle into the title area when collapsed', async () => {
            const { header, heading, subtitle, toggle, update } = await setupHeader();
            expect(heading().textContent!.trim()).toBe('Product title');
            expect(subtitle().textContent!.trim()).toBe('Product subtitle');
            // expanded: the subtitle is a row of its own below the title area
            expect(subtitle().parentElement).toBe(header());

            toggle().click();
            await stable();
            expect(subtitle().parentElement).not.toBe(header());
            expect(subtitle().parentElement!.contains(heading())).toBe(true);

            await update({ title: 'Renamed' });
            expect(heading().textContent!.trim()).toBe('Renamed');
        });

        it('truncates the title and subtitle unless titleWrap/subtitleWrap are set', async () => {
            const { heading, subtitle, update } = await setupHeader();
            expect(getComputedStyle(heading()).whiteSpace).toBe('nowrap');
            expect(getComputedStyle(heading()).textOverflow).toBe('ellipsis');
            expect(getComputedStyle(subtitle()).whiteSpace).toBe('nowrap');

            await update({ wrap: true });
            expect(getComputedStyle(heading()).whiteSpace).toBe('normal');
            expect(getComputedStyle(subtitle()).whiteSpace).toBe('normal');
        });

        it('uses titleId for the heading and sets aria-level from headingLevel', async () => {
            const { heading, toggle, update } = await setupHeader();
            expect(heading().id).toBe('product-title');
            expect(heading().getAttribute('aria-level')).toBe('2');
            // the header toggle is described by the title
            expect(toggle().getAttribute('aria-describedby')).toBe('product-title');

            await update({ titleId: 'custom-id', headingLevel: 'h3' });
            expect(heading().id).toBe('custom-id');
            expect(heading().getAttribute('aria-level')).toBe('3');
            expect(toggle().getAttribute('aria-describedby')).toBe('custom-id');
        });

        it('generates a title id when none is given', async () => {
            const screen = await render(
                <DynamicPage expandContent={false}>
                    <DynamicPageHeader title="Product" />
                    <DynamicPageSubheader>Facets</DynamicPageSubheader>
                </DynamicPage>
            );
            const heading = screen.container.querySelector<HTMLElement>('[role=heading]')!;
            expect(heading.id).toMatch(/^fd-dynamic-page-title-/);
            expect(screen.container.querySelector('span[role=button]')!.getAttribute('aria-describedby')).toBe(
                heading.id
            );
        });

        it('gives the subtitle a heading role only with subtitleHeadingLevel', async () => {
            const { subtitle, update } = await setupHeader();
            expect(subtitle().hasAttribute('role')).toBe(false);
            expect(subtitle().hasAttribute('aria-level')).toBe(false);

            await update({ subtitleHeadingLevel: 3 });
            expect(subtitle().getAttribute('role')).toBe('heading');
            expect(subtitle().getAttribute('aria-level')).toBe('3');
        });

        it('derives the size from the width and honours size when autoResponsive is false', async () => {
            const { root, update } = await setupHeader({ width: 599 });
            const article = root.querySelector<HTMLElement>('article')!;
            const padding = () => getComputedStyle(article).getPropertyValue('--dp-px').trim();
            const content = root.querySelector<HTMLElement>('article > div[tabindex]')!;
            expect(padding()).toBe('1rem');
            expect(getComputedStyle(content).paddingLeft).toBe('16px');
            for (const [width, size] of [
                [600, 'medium'],
                [1023, 'medium'],
                [1024, 'large'],
                [1439, 'large'],
                [1440, 'extra-large']
            ] as const) {
                await update({ width });
                expect(dynamicPageWidthToSize(article.getBoundingClientRect().width)).toBe(size);
                expect(padding()).toBe(size === 'extra-large' ? '3rem' : '2rem');
            }
            expect(getComputedStyle(content).paddingLeft).toBe('48px');

            await update({ autoResponsive: false, size: 'small' });
            expect(padding()).toBe('1rem');
        });

        it('reports the size with onSizeChange', async () => {
            const sizes: DynamicPageResponsiveSize[] = [];
            const Sized = ({ width }: { width: number }) => (
                <div style={{ width }}>
                    <DynamicPage expandContent={false} onSizeChange={(s) => sizes.push(s)}>
                        <DynamicPageContent>Content</DynamicPageContent>
                    </DynamicPage>
                </div>
            );
            const screen = await render(<Sized width={500} />);
            await stable();
            await screen.rerender(<Sized width={800} />);
            await stable();
            expect(sizes).toEqual(['small', 'medium']);
        });

        it('moves the layout actions into the breadcrumb row below 1280px', async () => {
            const { root, heading, update } = await setupHeader({ width: 1300 });
            const layout = () => root.querySelector<HTMLElement>('[aria-label="Layout actions"]')!;
            const breadcrumb = () => root.querySelector<HTMLElement>('[role=navigation]')!;
            const centre = (el: HTMLElement) => {
                const rect = el.getBoundingClientRect();
                return rect.top + rect.height / 2;
            };
            // wide: in the title row, next to the global actions
            expect(Math.abs(centre(layout()) - centre(heading()))).toBeLessThan(
                Math.abs(centre(layout()) - centre(breadcrumb()))
            );

            await update({ width: 1279 });
            expect(Math.abs(centre(layout()) - centre(breadcrumb()))).toBeLessThan(
                Math.abs(centre(layout()) - centre(heading()))
            );
            expect(layout().getBoundingClientRect().bottom).toBeLessThanOrEqual(heading().getBoundingClientRect().top);
        });

        it('passes the collapsed state to custom title and subtitle templates', async () => {
            const { root, toggle } = await setupHeader({ custom: true });
            const text = (id: string) => root.querySelector(`[data-testid="${id}"]`)!.textContent!.trim();
            expect(text('custom-title')).toBe('Title expanded');
            expect(text('custom-subtitle')).toBe('Subtitle expanded');
            toggle().click();
            await stable();
            expect(text('custom-title')).toBe('Title collapsed');
            expect(text('custom-subtitle')).toBe('Subtitle collapsed');
        });

        it('renders a message strip in the header; clicking it does not toggle the header', async () => {
            const { root, heading, toggle } = await setupHeader();
            const strip = root.querySelector<HTMLElement>('[role=note]')!;
            expect(strip).not.toBeNull();
            expect(strip.getBoundingClientRect().top).toBeGreaterThan(heading().getBoundingClientRect().bottom);
            await userEvent.click(strip);
            expect(toggle().getAttribute('aria-expanded')).toBe('true');
        });

        it('pin button toggles its pressed state and label', async () => {
            const { root } = await setupHeader();
            const pin = () =>
                root.querySelector<HTMLButtonElement>(
                    'button[aria-label="Pin Header"], button[aria-label="Unpin Header"]'
                )!;
            expect(pin().getAttribute('aria-label')).toBe('Pin Header');
            expect(pin().title).toBe('Pin Header');
            expect(pin().getAttribute('aria-pressed')).toBeNull();

            await userEvent.click(pin());
            expect(pin().getAttribute('aria-label')).toBe('Unpin Header');
            expect(pin().title).toBe('Unpin Header');
            expect(pin().getAttribute('aria-pressed')).toBe('true');

            await userEvent.click(pin());
            expect(pin().getAttribute('aria-label')).toBe('Pin Header');
            expect(pin().getAttribute('aria-pressed')).toBeNull();
        });

        it('collapse button switches between Collapse and Expand Header and updates collapsed', async () => {
            const changes: boolean[] = [];
            let collapsed = false;
            const onCollapsedChange = (next: boolean) => {
                changes.push(next);
                collapsed = next;
            };
            const { root, toggle, update } = await setupHeader({ collapsed, onCollapsedChange });
            const sync = () => update({ collapsed, onCollapsedChange });
            const button = () =>
                root.querySelector<HTMLButtonElement>('[aria-label="Header actions"] button[aria-expanded]')!;
            const section = root.querySelector<HTMLElement>('section')!;
            expect(button().getAttribute('aria-label')).toBe('Collapse Header');
            expect(button().getAttribute('aria-expanded')).toBe('true');
            expect(button().getAttribute('aria-controls')).toBe(section.id);

            await userEvent.click(button());
            await sync();
            expect(changes).toEqual([true]);
            expect(button().getAttribute('aria-label')).toBe('Expand Header');
            expect(button().title).toBe('Expand Header');
            expect(button().getAttribute('aria-expanded')).toBe('false');
            expect(toggle().getAttribute('aria-expanded')).toBe('false');
            // the pin button is hidden while collapsed
            expect(root.querySelector('button[aria-label="Pin Header"]')).toBeNull();

            // collapsing from the title area updates the state too
            toggle().click();
            await sync();
            expect(changes).toEqual([true, false]);
            expect(button().getAttribute('aria-label')).toBe('Collapse Header');

            // and the state drives the page
            collapsed = true;
            await sync();
            expect(toggle().getAttribute('aria-expanded')).toBe('false');
            expect(section.hidden).toBe(true);
        });

        it('starts collapsed with defaultCollapsed', async () => {
            const screen = await render(
                <DynamicPage expandContent={false}>
                    <DynamicPageHeader title="Product" />
                    <DynamicPageSubheader defaultCollapsed>Facets</DynamicPageSubheader>
                    <DynamicPageContent>Content</DynamicPageContent>
                </DynamicPage>
            );
            const toggle = screen.container.querySelector<HTMLElement>('span[role=button]')!;
            expect(toggle.getAttribute('aria-expanded')).toBe('false');
            toggle.click();
            await stable();
            expect(toggle.getAttribute('aria-expanded')).toBe('true');
        });

        it('has no header toggle or collapse buttons when the subheader is not collapsible', async () => {
            const screen = await render(
                <DynamicPage expandContent={false}>
                    <DynamicPageHeader title="Product" />
                    <DynamicPageSubheader collapsible={false}>Facets</DynamicPageSubheader>
                    <DynamicPageContent>{TEXT}</DynamicPageContent>
                </DynamicPage>
            );
            const root = screen.container;
            expect(root.querySelector('span[role=button]')).toBeNull();
            expect(root.querySelector('[aria-label="Header actions"]')).toBeNull();
            await userEvent.click(root.querySelector('[role=heading]')!);
            expect(root.querySelector('section')!.hidden).toBe(false);
            // the header casts the shadow
            expect(getComputedStyle(root.querySelector('header')!).boxShadow).not.toBe('none');
        });

        it('fills the viewport below its top, minus offset', async () => {
            const { root, update, actions } = await setupHeader({ expand: true });
            const article = root.querySelector<HTMLElement>('article')!;
            const expected = (offset: number) => window.innerHeight - article.getBoundingClientRect().top - offset;
            expect(article.getBoundingClientRect().height).toBeCloseTo(expected(0), 0);

            await update({ offset: 50 });
            expect(article.getBoundingClientRect().height).toBeCloseTo(expected(50), 0);

            // refreshSize() measures again after the page moved
            const spacer = document.createElement('div');
            spacer.style.height = '40px';
            root.prepend(spacer);
            actions.current!.refreshSize();
            await stable();
            expect(article.getBoundingClientRect().height).toBeCloseTo(expected(50), 0);
            spacer.remove();
        });

        it('shows the facet before the title only while collapsed', async () => {
            const screen = await render(
                <DynamicPage expandContent={false}>
                    <DynamicPageHeader title="Product" facet={<span data-testid="facet">Facet</span>}>
                        <DynamicPageTitleContent>Key information</DynamicPageTitleContent>
                    </DynamicPageHeader>
                    <DynamicPageSubheader>Facets</DynamicPageSubheader>
                    <DynamicPageContent>Content</DynamicPageContent>
                </DynamicPage>
            );
            const root = screen.container;
            expect(root.querySelector('[data-testid=facet]')).toBeNull();
            (root.querySelector('span[role=button]') as HTMLElement).click();
            await stable();
            const facet = root.querySelector<HTMLElement>('[data-testid=facet]')!;
            expect(facet.compareDocumentPosition(root.querySelector('[role=heading]')!)).toBe(
                Node.DOCUMENT_POSITION_FOLLOWING
            );
            const probe = document.createElement('div');
            probe.style.fontSize = 'var(--sapObjectHeader_Title_SnappedFontSize)';
            document.body.appendChild(probe);
            expect(getComputedStyle(root.querySelector('[role=heading]')!).fontSize).toBe(
                getComputedStyle(probe).fontSize
            );
            probe.remove();
        });
    });

    describe('layout', () => {
        it('places the parts in their slots and the footer in a footer element', async () => {
            const screen = await render(
                <DynamicPage expandContent={false} positionRelative>
                    <DynamicPageFooter data-testid="footer">
                        <Bar barDesign="floating-footer">
                            <BarRight>
                                <BarElement>
                                    <Button label="Save" />
                                </BarElement>
                            </BarRight>
                        </Bar>
                    </DynamicPageFooter>
                    <DynamicPageContent data-testid="content">Content</DynamicPageContent>
                    <DynamicPageTabs data-testid="tabs">Tabs</DynamicPageTabs>
                    <DynamicPageSubheader data-testid="subheader">Facets</DynamicPageSubheader>
                    <DynamicPageHeader title="Product" data-testid="header" />
                </DynamicPage>
            );
            const article = screen.container.querySelector('article')!;
            expect(article.getAttribute('aria-roledescription')).toBe('Dynamic Page');
            expect(getComputedStyle(article).position).toBe('relative');
            const order = [...article.querySelectorAll('[data-testid]')].map((e) => e.getAttribute('data-testid'));
            expect(order).toEqual(['header', 'subheader', 'tabs', 'content', 'footer']);
            expect(article.querySelector('header [data-testid=subheader]')).not.toBeNull();
            expect(article.querySelector('footer > [data-testid=footer]')).not.toBeNull();
            // the floating footer is offset by the page size
            const bar = article.querySelector<HTMLElement>('[data-bar-design=floating-footer]')!;
            expect(getComputedStyle(bar).bottom).toBe('16px');
            // with tabs the subheader casts no shadow
            const visibility = article.querySelector<HTMLElement>('[aria-label="Header actions"]')!.parentElement!;
            expect(getComputedStyle(visibility).boxShadow).toBe('none');
        });

        it('uses the list and transparent backgrounds', async () => {
            const ui = (background: 'list' | 'transparent' | 'solid') => (
                <DynamicPage expandContent={false} background={background}>
                    <DynamicPageHeader title="Product" />
                    <DynamicPageContent>Content</DynamicPageContent>
                </DynamicPage>
            );
            const token = (name: string) => {
                const probe = document.createElement('div');
                probe.style.backgroundColor = `var(${name})`;
                document.body.appendChild(probe);
                const value = getComputedStyle(probe).backgroundColor;
                probe.remove();
                return value;
            };
            const screen = await render(ui('solid'));
            const content = () => screen.container.querySelector<HTMLElement>('article > div[tabindex]')!;
            const header = () => screen.container.querySelector<HTMLElement>('header > div > div')!;
            expect(getComputedStyle(content()).backgroundColor).toBe(token('--sapBackgroundColor'));
            expect(getComputedStyle(header()).backgroundColor).toBe(token('--sapObjectHeader_Background'));
            await screen.rerender(ui('list'));
            expect(getComputedStyle(content()).backgroundColor).toBe(token('--sapGroup_ContentBackground'));
            await screen.rerender(ui('transparent'));
            expect(getComputedStyle(content()).backgroundColor).toBe('rgba(0, 0, 0, 0)');
            expect(getComputedStyle(header()).backgroundColor).toBe('rgba(0, 0, 0, 0)');
        });

        it('passes className, native props and the ref to every part', async () => {
            const refs = {
                page: createRef<HTMLElement>(),
                content: createRef<HTMLDivElement>()
            };
            const onClick = vi.fn();
            const screen = await render(
                <DynamicPage expandContent={false} ref={refs.page} className="custom" data-testid="page" id="page">
                    <DynamicPageHeader title="Product" className="custom" data-testid="header" onClick={onClick}>
                        <DynamicPageBreadcrumb className="custom" data-testid="breadcrumb">
                            Home
                        </DynamicPageBreadcrumb>
                        <DynamicPageTitleContent className="custom" data-testid="title-content">
                            Info
                        </DynamicPageTitleContent>
                        <DynamicPageGlobalActions className="custom" data-testid="global" aria-label="Product actions">
                            <Button label="Edit" />
                        </DynamicPageGlobalActions>
                        <DynamicPageLayoutActions className="custom" data-testid="layout" aria-label="Page actions">
                            <Button glyph="decline" aria-label="Close" />
                        </DynamicPageLayoutActions>
                    </DynamicPageHeader>
                    <DynamicPageSubheader className="custom" data-testid="subheader" id="sub">
                        Facets
                    </DynamicPageSubheader>
                    <DynamicPageContent className="custom" data-testid="content" ref={refs.content}>
                        Content
                    </DynamicPageContent>
                    <DynamicPageFooter className="custom" data-testid="footer">
                        Footer
                    </DynamicPageFooter>
                </DynamicPage>
            );
            const root = screen.container;
            for (const id of [
                'page',
                'header',
                'breadcrumb',
                'title-content',
                'global',
                'layout',
                'subheader',
                'content',
                'footer'
            ]) {
                expect(root.querySelector(`[data-testid="${id}"]`)!.classList.contains('custom')).toBe(true);
            }
            expect(refs.page.current).toBe(root.querySelector('article'));
            expect(refs.page.current!.id).toBe('page');
            expect(refs.content.current).toBe(root.querySelector('[data-testid=content]'));
            expect(root.querySelector('[data-testid=global]')!.getAttribute('aria-label')).toBe('Product actions');
            expect(root.querySelector('[data-testid=layout]')!.getAttribute('aria-label')).toBe('Page actions');
            expect(root.querySelector('#sub-content')).not.toBeNull();
            await userEvent.click(root.querySelector('[role=heading]')!);
            expect(onClick).toHaveBeenCalledTimes(1);
            expect(root.querySelector('section')!.hidden).toBe(true);
        });

        it('toggleCollapse() collapses and expands the header', async () => {
            const { actions, toggle } = await setup();
            actions.current!.toggleCollapse();
            await stable();
            expect(toggle.getAttribute('aria-expanded')).toBe('false');
            actions.current!.toggleCollapse();
            await stable();
            expect(toggle.getAttribute('aria-expanded')).toBe('true');
        });
    });
});
