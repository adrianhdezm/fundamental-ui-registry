import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { FormattedText, sanitizeFormattedText, type FormattedTextProps } from './formatted-text';

const LONG = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>'.repeat(20);

function Host(props: FormattedTextProps) {
    return (
        <div>
            <button id="before">Before</button>
            <FormattedText id="ft" {...props} />
        </div>
    );
}

async function setup(initial: FormattedTextProps) {
    let current = initial;
    const screen = await render(<Host {...current} />);
    const root = screen.container;
    return {
        screen,
        root,
        text: () => root.querySelector<HTMLElement>('#ft')!,
        update: async (change: FormattedTextProps) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
        }
    };
}

/** Parses sanitised markup, to inspect it. */
function parse(html: string): HTMLDivElement {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
}

type Pwned = { pwned?: boolean };

describe('FormattedText', () => {
    it('sanitizes htmlText: keeps the allowed tags and attributes, strips scripts and event handlers', async () => {
        (window as unknown as Pwned).pwned = false;
        const { text, update } = await setup({
            htmlText: `
            <h3 title="Heading">Release notes</h3>
            <p class="intro" style="color: rgb(1, 2, 3)" onclick="window.pwned = true">Some <strong>bold</strong>, <em>italic</em> and <u>underlined</u> text.</p>
            <ul><li>One</li><li>Two</li></ul>
            <script>window.pwned = true</script>
            <img src="x" onerror="window.pwned = true">
            <iframe src="about:blank"></iframe>
            <div data-x="1">Unwrapped <span>text</span></div>
            <a href="javascript:window.pwned = true">Bad link</a>
            <svg><text>svg text</text></svg>
        `
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect((window as unknown as Pwned).pwned).toBe(false);

        expect(text().querySelector('h3')!.textContent).toBe('Release notes');
        expect(text().querySelector('h3')!.title).toBe('Heading');
        const p = text().querySelector('p')!;
        expect(p.className).toBe('intro');
        expect(getComputedStyle(p).color).toBe('rgb(1, 2, 3)');
        expect(p.hasAttribute('onclick')).toBe(false);
        expect(p.querySelector('strong')!.textContent).toBe('bold');
        expect(getComputedStyle(p.querySelector('strong')!).fontWeight).toBe('700');
        expect(getComputedStyle(p.querySelector('em')!).fontStyle).toBe('italic');
        expect(getComputedStyle(p.querySelector('u')!).textDecorationLine).toBe('underline');
        expect(text().querySelectorAll('ul > li').length).toBe(2);
        expect(getComputedStyle(text().querySelector('ul')!).listStyleType).toBe('disc');

        expect(text().querySelector('script, img, iframe, svg, div')).toBeNull();
        expect(text().textContent).not.toContain('pwned');
        expect(text().textContent).not.toContain('svg text');
        // unknown tags are dropped, their text is kept
        expect(text().textContent).toContain('Unwrapped text');
        expect(text().querySelector('[data-x]')).toBeNull();
        const bad = [...text().querySelectorAll('a')].find((a) => a.textContent === 'Bad link')!;
        expect(bad.hasAttribute('href')).toBe(false);

        await update({ htmlText: '   ' });
        expect(text().innerHTML).toBe('');
        await update({ htmlText: null });
        expect(text().innerHTML).toBe('');
    });

    it('sanitizeFormattedText keeps safe link schemes only', () => {
        const html = sanitizeFormattedText(
            '<a href="https://sap.com">a</a><a href="mailto:x@y.z">b</a><a href="ftp://f">c</a>' +
                '<a href="/relative">d</a><a href="data:text/html,x">e</a><a href="JaVaScRiPt:alert(1)">f</a>' +
                // entities and whitespace are decoded by the parser before the check
                '<a href="&#106;avascript:alert(1)">g</a><a href=" javascript:alert(1)">h</a>' +
                '<a href="java&#x09;script:alert(1)">i</a><a href="vbscript:x">j</a>'
        );
        expect([...parse(html).querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual([
            'https://sap.com',
            'mailto:x@y.z',
            'ftp://f',
            '/relative',
            null,
            null,
            null,
            null,
            null,
            null
        ]);
    });

    it('sanitizeFormattedText keeps the allowed attributes only and removes dangerous content', () => {
        (window as unknown as Pwned).pwned = false;
        const html = sanitizeFormattedText(
            '<a href="/f.pdf" download="f.pdf" hreflang="de" type="application/pdf" rel="author" title="File" ' +
                'id="x" data-y="1" onmouseover="window.pwned = true" tabindex="-1">File</a>' +
                '<p><noscript><img src=x onerror="window.pwned = true"></noscript>after noscript</p>' +
                '<textarea><img src=x onerror="window.pwned = true"></textarea>' +
                '<template><img src=x onerror="window.pwned = true"></template><style>p { color: red }</style>' +
                '<object data="x"></object><embed src="x"><math><mi>m</mi></math>' +
                '<form action="https://evil"><input value="field"><button>Send</button></form>' +
                '<svg><a href="https://evil">svg link</a></svg><SPAN CLASS="up">Upper</SPAN>'
        );
        const div = parse(html);
        const link = div.querySelector('a')!;
        expect([...link.attributes].map((a) => a.name).sort()).toEqual(
            ['download', 'href', 'hreflang', 'rel', 'target', 'title', 'type'].sort()
        );
        expect(link.getAttribute('rel')).toBe('author noopener');
        // a textarea is dropped, its markup stays text (escaped), never an element
        expect(
            div.querySelector('img, textarea, noscript, template, style, object, embed, math, form, input')
        ).toBeNull();
        expect(div.textContent).toContain('<img src=x onerror="window.pwned = true">');
        expect(div.textContent).toContain('after noscript');
        expect(div.textContent).toContain('Send');
        expect(div.textContent).not.toContain('svg link');
        expect(div.textContent).not.toContain('color: red');
        expect(div.querySelector('span.up')!.textContent).toBe('Upper');
        // parsing the output again gives the same markup (no mutation through serialisation)
        expect(parse(sanitizeFormattedText(html)).isEqualNode(div)).toBe(true);
        expect((window as unknown as Pwned).pwned).toBe(false);
    });

    it('links get convertedLinksDefaultTarget and rel noopener, and keep the link focus styles', async () => {
        const { root, text, update } = await setup({
            htmlText:
                '<p><a href="https://sap.com">External</a> <a href="#section">Anchor</a> <a href="https://x.y" rel="author">Author</a></p>'
        });
        const links = () => [...text().querySelectorAll('a')];
        const [external, anchor, author] = links();
        expect(external.target).toBe('_blank');
        expect(external.rel).toBe('noopener');
        expect(author.rel).toBe('author noopener');
        // in-page links stay in the page
        expect(anchor.hasAttribute('target')).toBe(false);
        expect(anchor.hasAttribute('rel')).toBe(false);

        const probe = document.createElement('span');
        text().appendChild(probe);
        probe.style.color = 'var(--sapLinkColor)';
        expect(getComputedStyle(external).color).toBe(getComputedStyle(probe).color);

        // keyboard focus shows the SAP focus indicator
        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(links()[0]);
        const style = getComputedStyle(links()[0]);
        expect(style.outlineStyle).not.toBe('none');
        expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
        probe.style.color = 'var(--sapContent_FocusColor)';
        expect(style.outlineColor).toBe(getComputedStyle(probe).color);
        await userEvent.hover(links()[0]);
        expect(getComputedStyle(links()[0]).textDecorationLine).toBe('underline');
        expect(getComputedStyle(links()[0]).textUnderlineOffset).toBe('2px');
        probe.style.color = 'var(--sapLink_Hover_Color)';
        expect(getComputedStyle(links()[0]).color).toBe(getComputedStyle(probe).color);
        probe.remove();

        await update({ convertedLinksDefaultTarget: '_self' });
        expect(links()[0].target).toBe('_self');
        expect(links()[0].hasAttribute('rel')).toBe(false);
        expect(links()[2].rel).toBe('author');
        await update({ convertedLinksDefaultTarget: '' });
        expect(links()[0].hasAttribute('target')).toBe(false);
        // without a default target, a link keeps its own
        await update({ htmlText: '<a href="https://sap.com" target="_top">Top</a>' });
        expect(links()[0].target).toBe('_top');
    });

    it('width and height constrain the container', async () => {
        const { text, update } = await setup({ htmlText: LONG });
        expect(getComputedStyle(text()).overflowY).toBe('visible');
        const full = text().getBoundingClientRect().height;
        expect(full).toBeGreaterThan(200);

        await update({ height: '10rem', width: '300px' });
        const rect = text().getBoundingClientRect();
        expect(rect.height).toBe(160);
        expect(rect.width).toBe(300);
        expect(getComputedStyle(text()).overflowY).toBe('auto');
        expect(getComputedStyle(text()).overflowX).toBe('auto');
        expect(text().scrollHeight).toBeGreaterThan(text().clientHeight);
        text().scrollTop = 100;
        expect(text().scrollTop).toBe(100);
    });

    it('restores the document typography with the SAP fonts', async () => {
        const { text } = await setup({
            htmlText:
                '<h1>One</h1><h6>Six</h6><p>Para</p><ol><li>Item</li></ol><blockquote>Quote</blockquote>' +
                '<code>code</code><abbr title="Abbreviation">abbr</abbr><dl><dt>Term</dt><dd>Definition</dd></dl>'
        });
        const probe = document.createElement('span');
        text().appendChild(probe);
        const size = (token: string) => {
            probe.style.fontSize = `var(${token})`;
            return getComputedStyle(probe).fontSize;
        };
        const el = (selector: string) => getComputedStyle(text().querySelector(selector)!);
        expect(el('h1').fontSize).toBe(size('--sapFontHeader1Size'));
        expect(el('h6').fontSize).toBe(size('--sapFontHeader6Size'));
        expect(el('h1').fontFamily).toContain('72');
        expect(el('p').fontSize).toBe(size('--sapFontSize'));
        expect(el('p').marginTop).toBe(`${parseFloat(el('p').fontSize) / 2}px`);
        expect(el('ol').listStyleType).toBe('decimal');
        expect(el('blockquote').marginInlineStart).toBe('32px');
        expect(el('dd').marginInlineStart).toBe('32px');
        expect(el('code').fontFamily).toContain('72Mono');
        expect(el('abbr').textDecorationStyle).toBe('dotted');
        probe.remove();
    });

    it('renders nothing on the server and the content once hydrated', () => {
        const html = renderToString(<FormattedText htmlText="<p>Hello <script>x()</script></p>" />);
        expect(html).not.toContain('Hello');
        expect(html).not.toContain('script');
    });

    it('passes className, native props and the ref through', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <FormattedText
                ref={ref}
                htmlText="<p>Hi</p>"
                className="m-2"
                data-testid="spread"
                style={{ color: 'rgb(1, 2, 3)' }}
                height="5rem"
            />
        );
        const el = screen.container.querySelector<HTMLElement>('[data-testid="spread"]')!;
        expect(ref.current).toBe(el);
        expect(el.classList.contains('m-2')).toBe(true);
        expect(el.style.color).toBe('rgb(1, 2, 3)');
        expect(el.style.height).toBe('5rem');
        expect(el.querySelector('p')!.textContent).toBe('Hi');
    });
});
