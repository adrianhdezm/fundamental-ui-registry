import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { iconGlyphChar } from '@/ui/icon/icon';
import {
    MessagePage,
    MessagePageActions,
    MessagePageMore,
    MessagePageSubtitle,
    MessagePageTitle,
    type MessagePageProps
} from './message-page';

type State = Pick<MessagePageProps, 'type' | 'glyph' | 'hasIcon' | 'glyphFont'>;

function Host(props: State) {
    return (
        <MessagePage data-testid="page" {...props}>
            <MessagePageTitle>Nothing here</MessagePageTitle>
            <MessagePageSubtitle>Try again</MessagePageSubtitle>
        </MessagePage>
    );
}

/** The parts out of order, as the Angular spec projects them: the page puts each part in its slot. */
function PartsHost() {
    return (
        <div style={{ height: 600 }}>
            <MessagePage>
                <MessagePageMore data-testid="more">
                    <button id="more">Show details</button>
                </MessagePageMore>
                <MessagePageActions data-testid="actions">
                    <button id="primary">Contact support</button>
                    <button id="secondary">Reload page</button>
                </MessagePageActions>
                <MessagePageSubtitle data-testid="subtitle">Check the address</MessagePageSubtitle>
                <MessagePageTitle data-testid="title">Page not found</MessagePageTitle>
            </MessagePage>
        </div>
    );
}

async function setupParts() {
    const screen = await render(<PartsHost />);
    const root = screen.container;
    const part = (selector: string) => root.querySelector<HTMLElement>(selector)!;
    const id = (name: string) => part(`[data-testid="${name}"]`);
    return {
        status: part('[role=status]'),
        title: id('title'),
        subtitle: id('subtitle'),
        actions: id('actions'),
        more: id('more'),
        part
    };
}

const box = (el: Element) => el.getBoundingClientRect();

function cssColor(variable: string): string {
    const probe = document.createElement('div');
    probe.style.color = `var(${variable})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
}

describe('MessagePage', () => {
    it('announces its content and shows the icon of its type', async () => {
        const screen = await render(<Host type="search" />);
        const el = screen.container;
        const status = el.querySelector('[role=status]')!;
        expect(status.getAttribute('aria-live')).toBe('polite');
        expect(status.textContent).toContain('Nothing here');
        const icon = () => el.querySelector('[data-glyph]');
        const searchGlyph = icon()!.getAttribute('data-glyph');
        expect(searchGlyph).toBe(iconGlyphChar('search'));
        await screen.rerender(<Host type="filter" />);
        expect(icon()!.getAttribute('data-glyph')).not.toBe(searchGlyph);
        expect(icon()!.getAttribute('role')).toBe('presentation');
        expect(icon()!.getAttribute('aria-hidden')).toBe('true');
        await screen.rerender(<Host type="filter" glyph="retail-store" />);
        const custom = icon()!.getAttribute('data-glyph');
        expect(custom).toBe(iconGlyphChar('retail-store'));
        await screen.rerender(<Host type="error" glyph="retail-store" />);
        expect(icon()!.getAttribute('data-glyph')).toBe(custom);
        await screen.rerender(<Host type="error" glyph="retail-store" hasIcon={false} />);
        expect(icon()).toBeNull();
    });

    it('has an icon per type, documents by default, and takes the glyph font', async () => {
        const screen = await render(<Host />);
        const icon = () => screen.container.querySelector<HTMLElement>('[data-glyph]')!;
        expect(icon().getAttribute('data-glyph')).toBe(iconGlyphChar('documents'));
        const glyphs = { filter: 'filter', search: 'search', 'no-items': 'product', error: 'document' } as const;
        for (const [type, glyph] of Object.entries(glyphs)) {
            await screen.rerender(<Host type={type as keyof typeof glyphs} />);
            expect(icon().getAttribute('data-glyph'), type).toBe(iconGlyphChar(glyph));
        }
        await screen.rerender(<Host glyph="exceptions" glyphFont="SAP-icons-TNT" />);
        expect(icon().getAttribute('data-glyph')).toBe(iconGlyphChar('exceptions', 'SAP-icons-TNT'));
        // a big, faded non-interactive icon
        const style = getComputedStyle(icon());
        expect(style.fontSize).toBe('96px');
        expect(style.opacity).toBe('0.5');
        expect(style.color).toBe(cssColor('--sapContent_NonInteractiveIconColor'));
        // as wide as the glyph, as fundamental-styles, not the icon's 1em box
        await screen.rerender(<Host type="error" />);
        expect(icon().getBoundingClientRect().width).toBeLessThan(96);
        expect(icon().getBoundingClientRect().height).toBe(96);
    });

    it('renders the subtitle below the title', async () => {
        const { status, title, subtitle } = await setupParts();
        expect([...status.children].slice(0, 2)).toEqual([title, subtitle]);
        expect(subtitle.textContent!.trim()).toBe('Check the address');
        expect(box(subtitle).top).toBeGreaterThanOrEqual(box(title).bottom);
        // both centred in the page
        const centre = (el: Element) => (box(el).left + box(el).right) / 2;
        expect(Math.abs(centre(subtitle) - centre(title))).toBeLessThanOrEqual(1);
        expect(status.textContent).toContain('Check the address');
        expect(getComputedStyle(title).color).toBe(cssColor('--sapGroup_TitleTextColor'));
        expect(getComputedStyle(subtitle).color).toBe(cssColor('--sapContent_LabelColor'));
        // the title is centred; the subtitle starts at the start, so a long one reads from there (fundamental-styles)
        expect(getComputedStyle(title).textAlign).toBe('center');
        expect(getComputedStyle(subtitle).textAlign).toBe('start');
    });

    it('renders actions and the more area after the subtitle', async () => {
        const { status, subtitle, actions, more, part } = await setupParts();
        expect([...status.children].slice(2)).toEqual([actions, more]);
        expect(box(actions).top).toBeGreaterThanOrEqual(box(subtitle).bottom);
        expect(box(more).top).toBeGreaterThanOrEqual(box(actions).bottom);
        // the actions sit side by side
        const primary = part('#primary');
        const secondary = part('#secondary');
        expect(box(primary).top).toBe(box(secondary).top);
        expect(box(secondary).left).toBeGreaterThan(box(primary).right);
        expect(more.contains(part('#more'))).toBe(true);
    });

    it('centres the content in the page it fills', async () => {
        const screen = await render(
            <div style={{ height: 600, width: 800 }}>
                <MessagePage data-testid="page">
                    <MessagePageTitle>Page not found</MessagePageTitle>
                </MessagePage>
            </div>
        );
        const page = screen.container.querySelector<HTMLElement>('[data-testid="page"]')!;
        expect(box(page).height).toBe(600);
        expect(box(page).width).toBe(800);
        const container = page.firstElementChild!;
        const centre = (r: DOMRect) => [(r.left + r.right) / 2, (r.top + r.bottom) / 2];
        const [px, py] = centre(box(page));
        const [cx, cy] = centre(box(container));
        expect(Math.abs(cx - px)).toBeLessThanOrEqual(1);
        expect(Math.abs(cy - py)).toBeLessThanOrEqual(1);
    });

    it('title (fundamental-react: should be created) and the other props render the parts', async () => {
        const screen = await render(
            <MessagePage
                title="foo"
                subtitle="Please try again."
                actions={<button>Try again</button>}
                more={<a href="#">More info</a>}
            >
                <span data-testid="extra">Extra</span>
            </MessagePage>
        );
        const status = screen.container.querySelector('[role=status]')!;
        const [title, subtitle, actions, more, extra] = [...status.children] as HTMLElement[];
        expect(title.textContent).toBe('foo');
        expect(getComputedStyle(title).textAlign).toBe('center');
        expect(subtitle.textContent).toBe('Please try again.');
        expect(actions.querySelector('button')!.textContent).toBe('Try again');
        expect(getComputedStyle(actions).display).toBe('flex');
        expect(more.querySelector('a')!.textContent).toBe('More info');
        expect(extra.getAttribute('data-testid')).toBe('extra');
        // the title prop is not the native title attribute
        expect(screen.container.firstElementChild!.hasAttribute('title')).toBe(false);
        // parts without content are not rendered
        await screen.rerender(<MessagePage title="foo" />);
        expect(status.children).toHaveLength(1);
    });

    it('sorts the prop parts with the children and keeps other children in place', async () => {
        function Wrapped() {
            return <MessagePageMore data-testid="wrapped">Wrapped</MessagePageMore>;
        }
        const screen = await render(
            <MessagePage subtitle="Subtitle">
                <Wrapped />
                <MessagePageTitle data-testid="title">Title</MessagePageTitle>
            </MessagePage>
        );
        const status = screen.container.querySelector('[role=status]')!;
        // the subtitle of the prop and the title child swap places; the wrapper stays where it is
        expect([...status.children].map((c) => c.getAttribute('data-testid') ?? c.textContent)).toEqual([
            'title',
            'wrapped',
            'Subtitle'
        ]);
    });

    it('image replaces the icon (fundamental-react)', async () => {
        const screen = await render(<MessagePage image={<img alt="Logo" data-testid="image" />} title="foo" />);
        const image = screen.container.querySelector('[data-testid="image"]')!;
        expect(image).not.toBeNull();
        expect(screen.container.querySelector('[data-glyph]')).toBeNull();
        // the image sits in the icon area, before the status
        expect(image.parentElement!.nextElementSibling!.getAttribute('role')).toBe('status');
        await screen.rerender(<MessagePage image={<img alt="Logo" data-testid="image" />} hasIcon={false} />);
        expect(screen.container.querySelector('[data-testid="image"]')).toBeNull();
    });

    it('uses the SAP text typography on the background colour', async () => {
        const screen = await render(<Host />);
        const page = screen.container.querySelector<HTMLElement>('[data-testid="page"]')!;
        const style = getComputedStyle(page);
        const probe = document.createElement('div');
        probe.style.fontFamily = 'var(--sapFontFamily)';
        probe.style.backgroundColor = 'var(--sapBackgroundColor)';
        document.body.appendChild(probe);
        expect(style.fontFamily).toBe(getComputedStyle(probe).fontFamily);
        expect(style.backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
        probe.remove();
        expect(style.color).toBe(cssColor('--sapTextColor'));
        expect(style.fontSize).toBe('14px');
        expect(style.lineHeight).toBe('normal');
    });

    it('spreads native props (fundamental-react), merges className and forwards the refs of every part', async () => {
        const refs = {
            page: createRef<HTMLDivElement>(),
            title: createRef<HTMLDivElement>(),
            subtitle: createRef<HTMLDivElement>(),
            actions: createRef<HTMLDivElement>(),
            more: createRef<HTMLDivElement>()
        };
        await render(
            <MessagePage ref={refs.page} data-sample="page" className="custom-page" style={{ marginTop: 4 }}>
                <MessagePageTitle ref={refs.title} data-sample="title" className="custom-title">
                    Title
                </MessagePageTitle>
                <MessagePageSubtitle ref={refs.subtitle} data-sample="subtitle">
                    Subtitle
                </MessagePageSubtitle>
                <MessagePageActions ref={refs.actions} data-sample="actions">
                    Actions
                </MessagePageActions>
                <MessagePageMore ref={refs.more} data-sample="more">
                    More
                </MessagePageMore>
            </MessagePage>
        );
        for (const [name, ref] of Object.entries(refs)) {
            expect(ref.current, name).toBeInstanceOf(HTMLDivElement);
            expect(ref.current!.getAttribute('data-sample')).toBe(name);
        }
        expect(refs.page.current!.classList).toContain('custom-page');
        expect(refs.page.current!.classList).toContain('justify-center');
        expect(refs.page.current!.style.marginTop).toBe('4px');
        expect(refs.title.current!.classList).toContain('custom-title');
        expect(refs.title.current!.classList).toContain('text-center');
    });

    it('renders another element with render', async () => {
        const screen = await render(
            <MessagePage render={<section aria-label="Not found" />}>
                <MessagePageTitle render={<h1 />}>Page not found</MessagePageTitle>
            </MessagePage>
        );
        const section = screen.container.querySelector('section')!;
        expect(section.getAttribute('aria-label')).toBe('Not found');
        expect(section.querySelector('[role=status] > h1')!.textContent).toBe('Page not found');
    });
});
