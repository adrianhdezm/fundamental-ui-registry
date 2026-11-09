import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button } from '@/ui/button/button';
import {
    LayoutPanel,
    LayoutPanelActions,
    LayoutPanelBody,
    LayoutPanelDescription,
    LayoutPanelFilters,
    LayoutPanelFooter,
    LayoutPanelHead,
    LayoutPanelHeader,
    LayoutPanelTitle,
    type LayoutPanelBodyProps,
    type LayoutPanelFooterProps,
    type LayoutPanelProps
} from './layout-panel';

const IMAGE =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

interface State {
    panel?: Pick<LayoutPanelProps, 'transparent' | 'backgroundImage'>;
    bleed?: LayoutPanelBodyProps['bleed'];
    footer?: LayoutPanelFooterProps['position'];
}

/** The parts in the reverse order, as the Angular spec projects them. */
function Host({ panel, bleed, footer }: State) {
    return (
        <div style={{ width: 600 }}>
            <LayoutPanel data-testid="panel" {...panel}>
                <LayoutPanelFooter data-testid="footer" position={footer}>
                    <button>Footer action</button>
                </LayoutPanelFooter>
                <LayoutPanelBody data-testid="body" bleed={bleed}>
                    <p id="body">Body</p>
                </LayoutPanelBody>
                <LayoutPanelFilters data-testid="filters">Filters</LayoutPanelFilters>
                <LayoutPanelHeader data-testid="header">
                    <LayoutPanelActions data-testid="actions">
                        <button>Edit</button>
                    </LayoutPanelActions>
                    <LayoutPanelHead data-testid="head">
                        <LayoutPanelTitle data-testid="title">Sales</LayoutPanelTitle>
                        <LayoutPanelDescription data-testid="description">Per quarter</LayoutPanelDescription>
                    </LayoutPanelHead>
                </LayoutPanelHeader>
            </LayoutPanel>
        </div>
    );
}

async function setup(initial: State = {}) {
    const screen = await render(<Host {...initial} />);
    const q = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
    return { q, root: screen.container, update: (next: State) => screen.rerender(<Host {...next} />) };
}

function cssColor(variable: string): string {
    const probe = document.createElement('div');
    probe.style.backgroundColor = `var(${variable})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
}

const rect = (el: Element) => el.getBoundingClientRect();

describe('LayoutPanel', () => {
    it('places header, filters, body and footer in that order whatever the order of the children', async () => {
        const { q } = await setup();
        const panel = q('panel');
        expect(panel.id).toMatch(/^fd-layout-panel-.+$/);
        expect([...panel.children].map((c) => c.getAttribute('data-testid'))).toEqual([
            'header',
            'filters',
            'body',
            'footer'
        ]);
        const tops = [...panel.children].map((c) => rect(c).top);
        expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    });

    it('keeps other children and wrapper components in place, and an explicit id', async () => {
        function Header() {
            return <LayoutPanelHeader data-testid="header">Wrapped header</LayoutPanelHeader>;
        }
        const screen = await render(
            <LayoutPanel id="custom" data-testid="panel">
                <Header />
                <LayoutPanelFooter data-testid="footer">Footer</LayoutPanelFooter>
                <span data-testid="extra">Extra</span>
                <LayoutPanelBody data-testid="body">Body</LayoutPanelBody>
            </LayoutPanel>
        );
        const panel = screen.container.querySelector<HTMLElement>('[data-testid="panel"]')!;
        expect(panel.id).toBe('custom');
        // the known parts swap places; the wrapper and the span stay where they are
        expect([...panel.children].map((c) => c.getAttribute('data-testid'))).toEqual([
            'header',
            'body',
            'extra',
            'footer'
        ]);
    });

    it('header with title, description, actions and filters', async () => {
        const { q } = await setup();
        const header = q('header');
        // the head comes first and the actions sit at the end of the header
        expect(header.firstElementChild).toBe(q('head'));
        expect(rect(q('actions')).left).toBeGreaterThan(rect(q('head')).right);
        expect(rect(q('actions')).right).toBeCloseTo(rect(header).right - 16, 0);
        const title = q('title');
        expect(title.tagName).toBe('H3');
        // the header font family is the bold face: no synthetic bold on top (fundamental-styles' weight)
        expect(getComputedStyle(title).fontWeight).toBe('400');
        expect(getComputedStyle(title).fontFamily).toContain('72-Bold');
        expect(getComputedStyle(title).color).toBe(cssColor('--sapGroup_TitleTextColor'));
        const description = q('description');
        expect(description.tagName).toBe('P');
        expect(description.textContent).toBe('Per quarter');
        expect(getComputedStyle(description).color).toBe(cssColor('--sapContent_LabelColor'));
        expect(rect(description).top).toBeGreaterThanOrEqual(rect(title).bottom);
        expect(getComputedStyle(header).borderBottomStyle).toBe('solid');
        expect(getComputedStyle(header).borderTopWidth).toBe('0px');
        expect(getComputedStyle(header).borderBottomWidth).toBe('1px');
        expect(getComputedStyle(header).borderBottomColor).toBe(cssColor('--sapGroup_TitleBorderColor'));
        const filters = q('filters');
        expect(filters.textContent!.trim()).toBe('Filters');
        expect(getComputedStyle(filters).borderBottomStyle).toBe('solid');
        expect(rect(filters).top).toBeGreaterThanOrEqual(rect(header).bottom);
    });

    it('a narrow header wraps the actions under the head instead of overlapping it', async () => {
        const screen = await render(
            <div style={{ width: 220 }}>
                <LayoutPanel>
                    <LayoutPanelHeader>
                        <LayoutPanelHead
                            data-testid="head"
                            title="LayoutPanel Header with Actions"
                            description="LayoutPanel Description"
                        />
                        <LayoutPanelActions data-testid="actions">
                            <Button glyph="add" label="Add New Button" />
                        </LayoutPanelActions>
                    </LayoutPanelHeader>
                </LayoutPanel>
            </div>
        );
        const el = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
        const head = el('head');
        const button = el('actions').querySelector('button')!;
        expect(rect(el('actions')).width).toBeGreaterThanOrEqual(rect(button).width);
        expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
        // the texts stay inside the head (long words break) and the actions start 0.5rem under it
        for (const part of [head, ...head.children]) expect(part.scrollWidth).toBeLessThanOrEqual(part.clientWidth);
        expect(rect(el('actions')).top - rect(head).bottom).toBeGreaterThanOrEqual(8);
        // the head takes the whole line, its title wraps between words
        expect(rect(head).width).toBeCloseTo(220 - 32, 0);
        expect(head.querySelector('h3')!.textContent).toBe('LayoutPanel Header with Actions');
    });

    it('a header wide enough keeps the head and the actions on one line', async () => {
        const screen = await render(
            <div style={{ width: 600 }}>
                <LayoutPanel>
                    <LayoutPanelHeader>
                        <LayoutPanelHead data-testid="head" title="LayoutPanel Header with Actions" />
                        <LayoutPanelActions data-testid="actions">
                            <Button glyph="add" label="Add New Button" />
                        </LayoutPanelActions>
                    </LayoutPanelHeader>
                </LayoutPanel>
            </div>
        );
        const el = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
        expect(rect(el('actions')).left - rect(el('head')).right).toBeGreaterThanOrEqual(8);
        expect(rect(el('actions')).top).toBeLessThan(rect(el('head')).bottom);
    });

    it('head renders the title and description props at the heading level (fundamental-react)', async () => {
        const screen = await render(
            <LayoutPanelHead data-testid="head" title="Sample" description="Details" headingLevel={2}>
                <span data-testid="child">Child</span>
            </LayoutPanelHead>
        );
        const head = screen.container.querySelector<HTMLElement>('[data-testid="head"]')!;
        expect([...head.children].map((c) => c.tagName)).toEqual(['H2', 'P', 'SPAN']);
        expect(head.children[0].textContent).toBe('Sample');
        expect(head.children[1].textContent).toBe('Details');
        // the native title attribute is not set from the title prop
        expect(head.hasAttribute('title')).toBe(false);
        await screen.rerender(<LayoutPanelHead data-testid="head" title="Sample" />);
        expect([...head.children].map((c) => c.tagName)).toEqual(['H3']);
    });

    it('title level and render', async () => {
        const screen = await render(
            <div>
                <LayoutPanelTitle level={5} data-testid="h5">
                    Five
                </LayoutPanelTitle>
                <LayoutPanelTitle render={<h2 />} data-testid="rendered">
                    Rendered
                </LayoutPanelTitle>
            </div>
        );
        const el = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
        expect(el('h5').tagName).toBe('H5');
        expect(el('rendered').tagName).toBe('H2');
        // the group title size whatever the level
        expect(getComputedStyle(el('h5')).fontSize).toBe(getComputedStyle(el('rendered')).fontSize);
        expect(getComputedStyle(el('h5')).fontSize).toBe('16px');
    });

    it('body bleed removes the padding', async () => {
        const { q, root, update } = await setup();
        const body = q('body');
        expect(getComputedStyle(body).padding).toBe('16px');
        // the first and last children lose their outer margins
        const p = root.querySelector<HTMLElement>('#body')!;
        expect(getComputedStyle(p).marginTop).toBe('0px');
        expect(getComputedStyle(p).marginBottom).toBe('0px');
        await update({ bleed: true });
        expect(getComputedStyle(body).padding).toBe('0px');
        expect(rect(p).left).toBe(rect(q('panel')).left);
    });

    it('footer position start/end', async () => {
        const { q, update } = await setup();
        const footer = q('footer');
        const button = () => rect(footer.querySelector('button')!);
        const box = rect(footer);
        expect(getComputedStyle(footer).justifyContent).toBe('center');
        expect(getComputedStyle(footer).borderTopStyle).toBe('solid');
        expect(button().left + button().width / 2).toBeCloseTo(box.left + box.width / 2, 0);
        await update({ footer: 'start' });
        expect(getComputedStyle(footer).justifyContent).toBe('flex-start');
        expect(button().left).toBeCloseTo(box.left + 16, 0);
        await update({ footer: 'end' });
        expect(getComputedStyle(footer).justifyContent).toBe('flex-end');
        expect(button().right).toBeCloseTo(box.right - 16, 0);
    });

    it('transparent variant and backgroundImage', async () => {
        const { q, update } = await setup();
        const panel = q('panel');
        expect(getComputedStyle(panel).backgroundColor).toBe(cssColor('--sapGroup_ContentBackground'));
        expect(getComputedStyle(panel).backgroundImage).toBe('none');
        expect(getComputedStyle(panel).borderTopLeftRadius).toBe('16px');
        expect(getComputedStyle(panel).overflow).toBe('hidden');
        await update({ panel: { transparent: true } });
        expect(getComputedStyle(panel).backgroundColor).toBe('rgba(0, 0, 0, 0)');
        await update({ panel: { transparent: true, backgroundImage: IMAGE } });
        expect(getComputedStyle(panel).backgroundImage).toBe(`url("${IMAGE}")`);
        expect(getComputedStyle(panel).backgroundSize).toBe('cover');
        await update({ panel: { transparent: true, backgroundImage: null } });
        expect(panel.style.backgroundImage).toBe('');
    });

    it('uses the SAP text typography', async () => {
        const { q } = await setup();
        const style = getComputedStyle(q('panel'));
        const probe = document.createElement('div');
        probe.style.fontFamily = 'var(--sapFontFamily)';
        probe.style.color = 'var(--sapTextColor)';
        document.body.appendChild(probe);
        expect(style.fontFamily).toBe(getComputedStyle(probe).fontFamily);
        expect(style.color).toBe(getComputedStyle(probe).color);
        probe.remove();
        expect(style.fontSize).toBe('14px');
        expect(style.lineHeight).toBe('normal');
        expect(getComputedStyle(q('actions')).fontSize).toBe('12px');
    });

    it('spreads native props, merges className and style, and forwards the refs of every part', async () => {
        const refs = {
            panel: createRef<HTMLDivElement>(),
            header: createRef<HTMLDivElement>(),
            head: createRef<HTMLDivElement>(),
            title: createRef<HTMLHeadingElement>(),
            description: createRef<HTMLParagraphElement>(),
            actions: createRef<HTMLDivElement>(),
            filters: createRef<HTMLDivElement>(),
            body: createRef<HTMLDivElement>(),
            footer: createRef<HTMLDivElement>()
        };
        await render(
            <LayoutPanel
                ref={refs.panel}
                data-sample="panel"
                className="custom-panel"
                style={{ marginTop: 4 }}
                backgroundImage={IMAGE}
            >
                <LayoutPanelHeader ref={refs.header} data-sample="header" className="custom-header">
                    <LayoutPanelHead ref={refs.head} data-sample="head">
                        <LayoutPanelTitle ref={refs.title} data-sample="title">
                            Title
                        </LayoutPanelTitle>
                        <LayoutPanelDescription ref={refs.description} data-sample="description">
                            Description
                        </LayoutPanelDescription>
                    </LayoutPanelHead>
                    <LayoutPanelActions ref={refs.actions} data-sample="actions">
                        Actions
                    </LayoutPanelActions>
                </LayoutPanelHeader>
                <LayoutPanelFilters ref={refs.filters} data-sample="filters">
                    Filters
                </LayoutPanelFilters>
                <LayoutPanelBody ref={refs.body} data-sample="body">
                    Body
                </LayoutPanelBody>
                <LayoutPanelFooter ref={refs.footer} data-sample="footer" onClick={() => {}}>
                    Footer
                </LayoutPanelFooter>
            </LayoutPanel>
        );
        for (const [name, ref] of Object.entries(refs)) {
            expect(ref.current, name).toBeInstanceOf(HTMLElement);
            expect(ref.current!.getAttribute('data-sample')).toBe(name);
        }
        expect(refs.panel.current!.tagName).toBe('DIV');
        expect(refs.panel.current!.classList).toContain('custom-panel');
        expect(refs.panel.current!.classList).toContain('rounded-2xl');
        expect(refs.panel.current!.style.marginTop).toBe('4px');
        expect(refs.panel.current!.style.backgroundImage).toBe(`url("${IMAGE}")`);
        expect(refs.header.current!.classList).toContain('custom-header');
        expect(refs.header.current!.classList).toContain('justify-between');
    });

    it('renders another element with render', async () => {
        const screen = await render(
            <LayoutPanel render={<section aria-label="Sales" />}>
                <LayoutPanelHeader render={<header />}>
                    <LayoutPanelHead>
                        <LayoutPanelTitle>Sales</LayoutPanelTitle>
                    </LayoutPanelHead>
                </LayoutPanelHeader>
                <LayoutPanelFooter render={<footer />}>Footer</LayoutPanelFooter>
            </LayoutPanel>
        );
        const section = screen.container.querySelector('section')!;
        expect(section.getAttribute('aria-label')).toBe('Sales');
        expect([...section.children].map((c) => c.tagName)).toEqual(['HEADER', 'FOOTER']);
    });
});
