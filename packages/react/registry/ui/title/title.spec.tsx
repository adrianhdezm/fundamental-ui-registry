import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { Title, TitleSizeContext, type HeaderSize, type TitleProps } from './title';

const LONG = 'A very long title that does not fit into the available width of its container';

/** The computed font size of an SAP header size token. */
function headerSize(level: number): string {
    const probe = document.createElement('div');
    probe.style.fontSize = `var(--sapFontHeader${level}Size)`;
    document.body.appendChild(probe);
    const size = getComputedStyle(probe).fontSize;
    probe.remove();
    return size;
}

const fontSize = (el: Element) => getComputedStyle(el).fontSize;

async function setup(long: TitleProps = {}, sized: HeaderSize | null = 4) {
    const ui = (l: TitleProps, s: HeaderSize | null) => (
        <div>
            {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                <Title key={level} level={level} data-testid={`h${level}`}>
                    Heading {level}
                </Title>
            ))}
            <Title data-testid="div">Not a heading</Title>
            <Title render={<h3 />} data-testid="rendered">
                Rendered h3
            </Title>
            <Title level={1} headerSize={s} data-testid="sized">
                Styled smaller
            </Title>
            <div style={{ width: 150 }}>
                <Title level={2} className="text-sap-negative-color" data-testid="long" {...l}>
                    {LONG}
                </Title>
            </div>
        </div>
    );
    const screen = await render(ui(long, sized));
    return {
        el: (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!,
        update: (l: TitleProps, s: HeaderSize | null = sized) => screen.rerender(ui(l, s))
    };
}

describe('Title', () => {
    it('stays a semantic heading and follows the heading level by default', async () => {
        const { el } = await setup();
        for (const level of [1, 2, 3, 4, 5, 6]) {
            const heading = el(`h${level}`);
            expect(heading.tagName).toBe(`H${level}`);
            expect(fontSize(heading)).toBe(headerSize(level));
        }
        // larger levels are smaller
        expect(parseFloat(fontSize(el('h1')))).toBeGreaterThan(parseFloat(fontSize(el('h6'))));
        // other elements use header size 5; a rendered heading follows its own level
        expect(el('div').tagName).toBe('DIV');
        expect(fontSize(el('div'))).toBe(headerSize(5));
        expect(el('rendered').tagName).toBe('H3');
        expect(fontSize(el('rendered'))).toBe(headerSize(3));
    });

    it('uses the SAP header typography', async () => {
        const { el } = await setup();
        const style = getComputedStyle(el('h2'));
        expect(style.fontWeight).toBe('400');
        expect(style.margin).toBe('0px');
        expect(style.lineHeight).toBe('normal');
        const probe = document.createElement('div');
        probe.style.color = 'var(--sapTextColor)';
        probe.style.fontFamily = 'var(--sapFontHeaderFamily)';
        document.body.appendChild(probe);
        expect(style.color).toBe(getComputedStyle(probe).color);
        expect(style.fontFamily).toBe(getComputedStyle(probe).fontFamily);
        probe.remove();
    });

    it('headerSize overrides the visual size independent of the heading level', async () => {
        const { el, update } = await setup();
        expect(el('sized').tagName).toBe('H1');
        expect(fontSize(el('sized'))).toBe(headerSize(4));

        await update({}, 6);
        expect(fontSize(el('sized'))).toBe(headerSize(6));

        await update({}, null);
        expect(fontSize(el('sized'))).toBe(headerSize(1));
    });

    it('TitleSizeContext sets the size for titles without headerSize', async () => {
        const screen = await render(
            <TitleSizeContext value={5}>
                <Title level={2} data-testid="default">
                    Default
                </Title>
                <Title level={2} headerSize={3} data-testid="explicit">
                    Explicit
                </Title>
            </TitleSizeContext>
        );
        const el = (id: string) => screen.container.querySelector(`[data-testid="${id}"]`)!;
        expect(fontSize(el('default'))).toBe(headerSize(5));
        expect(fontSize(el('explicit'))).toBe(headerSize(3));
    });

    it('truncates long titles on one line by default', async () => {
        const { el } = await setup();
        const long = el('long');
        const style = getComputedStyle(long);
        expect(style.whiteSpace).toBe('nowrap');
        expect(style.textOverflow).toBe('ellipsis');
        expect(long.scrollWidth).toBeGreaterThan(long.clientWidth);
        expect(long.getBoundingClientRect().height).toBeLessThan(parseFloat(style.fontSize) * 2);
    });

    it('wrap shows the whole title on several lines', async () => {
        const { el, update } = await setup();
        const oneLine = el('long').getBoundingClientRect().height;
        await update({ wrap: true });
        const long = el('long');
        expect(getComputedStyle(long).whiteSpace).toBe('normal');
        expect(long.getBoundingClientRect().height).toBeGreaterThan(oneLine * 2.5);
        expect(long.scrollWidth).toBeLessThanOrEqual(long.clientWidth);
    });

    it('twoLineClamp clamps the title to two lines', async () => {
        const { el, update } = await setup();
        const oneLine = el('long').getBoundingClientRect().height;
        await update({ twoLineClamp: true });
        const long = el('long');
        expect(getComputedStyle(long).webkitLineClamp).toBe('2');
        expect(long.getBoundingClientRect().height).toBeCloseTo(oneLine * 2, 0);
        expect(long.scrollHeight).toBeGreaterThan(long.clientHeight);
    });

    it('merges a user class and passes props and the ref through', async () => {
        const ref = createRef<HTMLHeadingElement>();
        const { el } = await setup();
        const probe = document.createElement('div');
        probe.style.color = 'var(--sapNegativeColor)';
        document.body.appendChild(probe);
        expect(getComputedStyle(el('long')).color).toBe(getComputedStyle(probe).color);
        probe.remove();

        const screen = await render(
            <Title level={3} ref={ref} id="custom" title="Hint">
                Ref
            </Title>
        );
        const heading = screen.container.querySelector('h3')!;
        expect(ref.current).toBe(heading);
        expect(heading.id).toBe('custom');
        expect(heading.title).toBe('Hint');
    });
});
