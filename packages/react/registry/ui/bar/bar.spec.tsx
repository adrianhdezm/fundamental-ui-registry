import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Bar, BarElement, BarLeft, BarMiddle, BarRight, ButtonBar, type BarDesign, type BarSize } from './bar';

interface HostProps {
    design?: BarDesign | null;
    inPage?: boolean;
    inHomePage?: boolean;
    size?: BarSize | null;
    clear?: boolean;
    role?: string | null;
    disabled?: boolean;
    width?: string;
    title?: string;
}

async function setup(initial: HostProps = {}) {
    let current: HostProps = { role: 'toolbar', width: '1000px', title: 'Title', ...initial };
    const clicks: string[] = [];
    const ui = (p: HostProps) => (
        <div style={{ position: 'relative', height: 300, width: p.width }}>
            <Bar
                data-testid="bar"
                aria-label="Test bar"
                barDesign={p.design}
                inPage={p.inPage}
                inHomePage={p.inHomePage}
                size={p.size}
                clear={p.clear}
                role={p.role}
            >
                <BarLeft data-testid="left">
                    <ButtonBar aria-label="Back" glyph="navigation-left-arrow" onClick={() => clicks.push('back')} />
                    <BarElement>
                        <h4 data-testid="title" style={{ margin: 0 }} className="truncate">
                            {p.title}
                        </h4>
                    </BarElement>
                </BarLeft>
                <BarMiddle data-testid="middle">
                    <BarElement>Middle</BarElement>
                </BarMiddle>
                <BarRight data-testid="right">
                    <ButtonBar
                        elementProps={{ 'data-testid': 'save' } as object}
                        label="Save"
                        glyph="save"
                        variant="emphasized"
                        title="Save the changes"
                        disabled={p.disabled}
                        onClick={() => clicks.push('save')}
                    />
                    <ButtonBar
                        elementProps={{ 'data-testid': 'cancel' } as object}
                        label="Cancel"
                        onClick={() => clicks.push('cancel')}
                    />
                </BarRight>
            </Bar>
        </div>
    );
    const screen = await render(ui(current));
    const el = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
    return {
        clicks,
        el,
        bar: () => el('bar'),
        button: (id: string) => el(id).querySelector('button')!,
        update: async (change: HostProps) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

/** Resolves a CSS value with theme variables the way the browser computes it. */
function themed(property: 'backgroundColor' | 'boxShadow' | 'borderTopColor' | 'color' | 'fontSize', value: string) {
    const probe = document.createElement('div');
    probe.style[property] = value;
    if (property === 'borderTopColor') probe.style.borderTopStyle = 'solid';
    document.body.appendChild(probe);
    const computed = getComputedStyle(probe)[property];
    probe.remove();
    return computed;
}

const rect = (el: Element) => el.getBoundingClientRect();
const center = (el: Element) => (rect(el).left + rect(el).right) / 2;
const paddingX = (el: Element) => [getComputedStyle(el).paddingInlineStart, getComputedStyle(el).paddingInlineEnd];

describe('Bar', () => {
    it('is a toolbar with left, middle and right areas in order', async () => {
        const { bar, el } = await setup();
        expect(bar().getAttribute('role')).toBe('toolbar');
        expect(bar().getAttribute('aria-label')).toBe('Test bar');
        expect(rect(el('left')).left).toBeCloseTo(rect(bar()).left + 16, 0);
        expect(rect(el('left')).right).toBeLessThan(rect(el('middle')).left);
        expect(rect(el('middle')).right).toBeLessThan(rect(el('right')).left);
        expect(rect(el('right')).right).toBeCloseTo(rect(bar()).right - 16, 0);
    });

    it('puts the left area at the end in RTL', async () => {
        const { bar, el, update } = await setup();
        document.documentElement.setAttribute('dir', 'rtl');
        try {
            await update({});
            expect(rect(el('left')).right).toBeCloseTo(rect(bar()).right - 16, 0);
            expect(rect(el('right')).left).toBeCloseTo(rect(bar()).left + 16, 0);
        } finally {
            document.documentElement.removeAttribute('dir');
        }
    });

    it('renders the left, middle and right contents', async () => {
        const screen = await render(
            <Bar>
                <BarLeft data-testid="l">
                    <BarElement>Left Text</BarElement>
                </BarLeft>
                <BarMiddle data-testid="m">
                    <BarElement>Middle Text</BarElement>
                </BarMiddle>
                <BarRight data-testid="r">
                    <BarElement>Right Text</BarElement>
                </BarRight>
            </Bar>
        );
        const text = (id: string) => screen.container.querySelector(`[data-testid="${id}"]`)!.textContent;
        expect([text('l'), text('m'), text('r')]).toEqual(['Left Text', 'Middle Text', 'Right Text']);
    });

    it('role toolbar can be overridden or removed', async () => {
        const { bar, update } = await setup();
        await update({ role: 'group' });
        expect(bar().getAttribute('role')).toBe('group');
        await update({ role: null });
        expect(bar().hasAttribute('role')).toBe(false);
    });

    it('defaults to the page header background and shadow', async () => {
        const { bar } = await setup();
        const style = getComputedStyle(bar());
        expect(bar().hasAttribute('data-bar-design')).toBe(false);
        expect(style.backgroundColor).toBe(themed('backgroundColor', 'var(--sapPageHeader_Background)'));
        expect(style.boxShadow).toBe(themed('boxShadow', 'var(--sapContent_HeaderShadow)'));
        expect(style.boxShadow).not.toBe('none');
        expect(rect(bar()).height).toBe(44);
    });

    it('clear removes the shadow', async () => {
        const { bar, update } = await setup();
        await update({ clear: true });
        expect(getComputedStyle(bar()).boxShadow).toBe('none');
    });

    it('header uses the page header text color and the header font', async () => {
        const { el } = await setup({ design: 'header' });
        const middle = el('middle').firstElementChild!;
        expect(getComputedStyle(middle).color).toBe(themed('color', 'var(--sapPageHeader_TextColor)'));
        expect(getComputedStyle(middle).fontSize).toBe(themed('fontSize', 'var(--sapFontHeader5Size)'));
        expect(el('bar').getAttribute('data-bar-design')).toBe('header');
    });

    it('a header followed by a subheader drops its shadow; the subheader is taller', async () => {
        const screen = await render(
            <>
                <Bar barDesign="header" data-testid="header">
                    <BarMiddle>Header</BarMiddle>
                </Bar>
                <Bar barDesign="subheader" data-testid="subheader">
                    <BarMiddle>Sub</BarMiddle>
                </Bar>
                <Bar barDesign="header" data-testid="alone">
                    <BarMiddle>Alone</BarMiddle>
                </Bar>
            </>
        );
        const el = (id: string) => screen.container.querySelector(`[data-testid="${id}"]`)!;
        expect(getComputedStyle(el('header')).boxShadow).toBe('none');
        expect(getComputedStyle(el('alone')).boxShadow).not.toBe('none');
        expect(rect(el('subheader')).height).toBe(48);
        expect(getComputedStyle(el('subheader')).paddingBottom).toBe('4px');
    });

    it('footer uses the page footer background with a top border and no shadow', async () => {
        const { bar } = await setup({ design: 'footer' });
        const style = getComputedStyle(bar());
        expect(style.backgroundColor).toBe(themed('backgroundColor', 'var(--sapPageFooter_Background)'));
        expect(style.boxShadow).toBe('none');
        expect(style.borderTopStyle).toBe('solid');
        expect(style.borderTopColor).toBe(themed('borderTopColor', 'var(--sapPageFooter_BorderColor)'));
    });

    it('floating footer floats above the bottom of its container with a shadow', async () => {
        const { bar } = await setup({ design: 'floating-footer' });
        const container = bar().parentElement!;
        const style = getComputedStyle(bar());
        expect(style.position).toBe('absolute');
        expect(style.boxShadow).toBe(themed('boxShadow', 'var(--sapContent_Shadow1)'));
        expect(style.backgroundColor).toBe(themed('backgroundColor', 'var(--sapPageFooter_Background)'));
        expect(rect(container).bottom - rect(bar()).bottom).toBe(8);
        expect(rect(bar()).left - rect(container).left).toBe(8);
        expect(rect(container).right - rect(bar()).right).toBe(8);
    });

    it('inPage paddings follow size s, m_l and xl', async () => {
        const { bar, update } = await setup();
        expect(paddingX(bar())).toEqual(['16px', '16px']);
        for (const [size, px] of [
            [null, '16px'],
            ['s', '16px'],
            ['m_l', '32px'],
            ['xl', '48px']
        ] as const) {
            await update({ inPage: true, size });
            expect(paddingX(bar())).toEqual([px, px]);
        }
    });

    it('inHomePage paddings follow every size and the default', async () => {
        const { bar, update } = await setup();
        for (const [size, px] of [
            [null, '16px'],
            ['s', '8px'],
            ['m_l', '32px'],
            ['xl', '48px']
        ] as const) {
            await update({ inHomePage: true, size });
            expect(paddingX(bar())).toEqual([px, px]);
        }
    });

    it('a floating footer in a page is offset by the page size', async () => {
        const { bar, update } = await setup({ design: 'floating-footer' });
        await update({ inPage: true, size: 'm_l' });
        const container = bar().parentElement!;
        expect(rect(bar()).left - rect(container).left).toBe(32);
        expect(getComputedStyle(bar()).paddingInlineStart).toBe('8px');
        await update({ inPage: false, inHomePage: true, size: 's' });
        expect(rect(bar()).left - rect(container).left).toBe(16);
        expect(getComputedStyle(bar()).paddingInlineStart).toBe('8px');
    });

    it('fullWidth makes a bar element fill its area', async () => {
        const ui = (fullWidth: boolean) => (
            <Bar data-testid="layout-bar" aria-label="Layout bar" style={{ width: 600 }}>
                <BarMiddle data-testid="area">
                    <BarElement data-testid="element" fullWidth={fullWidth}>
                        <input data-testid="input" aria-label="Field" size={5} />
                    </BarElement>
                </BarMiddle>
            </Bar>
        );
        const screen = await render(ui(false));
        const el = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
        const area = el('area');
        expect(rect(area).width).toBe(rect(el('layout-bar')).width - 32);
        expect(rect(el('element')).width).toBeLessThan(rect(area).width / 2);
        await screen.rerender(ui(true));
        expect(rect(el('element')).width).toBe(rect(area).width);
        // its first child grows with it
        expect(rect(el('input')).width).toBe(rect(area).width);
    });

    it('initialSuggestionTitle and initialSuggestionSubline let the bar grow with their paddings', async () => {
        const ui = (title: boolean, subline: boolean) => (
            <Bar
                data-testid="tall-bar"
                aria-label="Suggestions"
                initialSuggestionTitle={title}
                initialSuggestionSubline={subline}
            >
                <BarLeft>
                    <BarElement>
                        <div style={{ height: 64 }}>Suggestion</div>
                    </BarElement>
                </BarLeft>
            </Bar>
        );
        const screen = await render(ui(false, false));
        const bar = screen.container.querySelector<HTMLElement>('[data-testid="tall-bar"]')!;
        const paddings = () => [getComputedStyle(bar).paddingTop, getComputedStyle(bar).paddingBottom];
        // the 64px content is taller than the bar: it grows to fit, without padding
        expect(paddings()).toEqual(['0px', '0px']);
        expect(rect(bar).height).toBe(64);
        await screen.rerender(ui(true, false));
        expect(paddings()).toEqual(['8px', '0px']);
        expect(rect(bar).height).toBe(72);
        await screen.rerender(ui(false, true));
        expect(paddings()).toEqual(['4px', '8px']);
        expect(rect(bar).height).toBe(76);
    });

    it('middle stays centred between equal side areas', async () => {
        const screen = await render(
            <Bar data-testid="bar" style={{ width: 1000 }}>
                <BarLeft style={{ width: 200 }}>
                    <BarElement>Left</BarElement>
                </BarLeft>
                <BarMiddle data-testid="middle">
                    <BarElement>Middle</BarElement>
                </BarMiddle>
                <BarRight style={{ width: 200 }}>
                    <BarElement>Right</BarElement>
                </BarRight>
            </Bar>
        );
        const el = (id: string) => screen.container.querySelector(`[data-testid="${id}"]`)!;
        expect(Math.abs(center(el('middle')) - center(el('bar')))).toBeLessThanOrEqual(1);
    });

    it('stackContentsVertically stacks the elements of an area', async () => {
        const screen = await render(
            <Bar initialSuggestionSubline>
                {(
                    [
                        ['left', BarLeft],
                        ['middle', BarMiddle],
                        ['right', BarRight]
                    ] as const
                ).map(([name, Area]) => (
                    <Area key={name} data-testid={name} stackContentsVertically>
                        <BarElement>Title</BarElement>
                        <BarElement>Subline</BarElement>
                    </Area>
                ))}
            </Bar>
        );
        for (const name of ['left', 'middle', 'right']) {
            const [first, second] = screen.container.querySelector(`[data-testid="${name}"]`)!.children;
            expect(getComputedStyle(first.parentElement!).flexDirection, name).toBe('column');
            expect(rect(second).top).toBeGreaterThanOrEqual(rect(first).bottom);
        }
    });

    it('areas truncate titles before buttons', async () => {
        const long = 'A very long title that does not fit next to the buttons of this bar at all';
        const { el, button } = await setup({ width: '360px', title: long });
        const title = el('title');
        expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
        // the buttons keep their full size and stay inside the bar
        for (const id of ['save', 'cancel']) {
            const b = button(id);
            expect(b.scrollWidth).toBeLessThanOrEqual(b.clientWidth);
            expect(rect(b).right).toBeLessThanOrEqual(rect(el('bar')).right);
        }
        expect(rect(el('right')).right).toBeCloseTo(rect(el('bar')).right - 16, 0);
    });

    it('compact density makes the bar shorter', async () => {
        const { bar } = await setup();
        document.documentElement.setAttribute('data-density', 'compact');
        try {
            expect(rect(bar()).height).toBe(40);
        } finally {
            document.documentElement.removeAttribute('data-density');
        }
    });

    it('render renders another root element', async () => {
        const screen = await render(
            <Bar render={<footer />} barDesign="footer" data-testid="bar">
                <BarRight>Footer</BarRight>
            </Bar>
        );
        const bar = screen.container.querySelector('[data-testid="bar"]')!;
        expect(bar.tagName).toBe('FOOTER');
        expect(bar.getAttribute('role')).toBe('toolbar');
        expect(getComputedStyle(bar).borderTopStyle).toBe('solid');
    });

    it('passes className, native props and the ref to every part', async () => {
        const refs = {
            bar: createRef<HTMLDivElement>(),
            left: createRef<HTMLDivElement>(),
            middle: createRef<HTMLDivElement>(),
            right: createRef<HTMLDivElement>(),
            element: createRef<HTMLDivElement>(),
            button: createRef<HTMLButtonElement>()
        };
        const screen = await render(
            <Bar ref={refs.bar} data-sample="bar" className="mt-4">
                <BarLeft ref={refs.left} data-sample="left" className="mt-1">
                    <BarElement ref={refs.element} data-sample="element" className="text-sap-negative-color">
                        Text
                    </BarElement>
                </BarLeft>
                <BarMiddle ref={refs.middle} data-sample="middle" />
                <BarRight ref={refs.right} data-sample="right">
                    <ButtonBar
                        ref={refs.button}
                        data-sample="button"
                        className="mt-2"
                        label="Save"
                        elementProps={{ className: 'mt-3', title: 'element' }}
                    />
                </BarRight>
            </Bar>
        );
        const root = screen.container;
        for (const [name, ref] of Object.entries(refs)) {
            expect(ref.current, name).toBe(root.querySelector(`[data-sample="${name}"]`));
        }
        expect(getComputedStyle(refs.bar.current!).marginTop).toBe('16px');
        expect(getComputedStyle(refs.left.current!).marginTop).toBe('4px');
        expect(getComputedStyle(refs.element.current!).color).toBe(themed('color', 'var(--sapNegativeColor)'));
        expect(refs.button.current!.tagName).toBe('BUTTON');
        expect(getComputedStyle(refs.button.current!).marginTop).toBe('8px');
        const wrapper = refs.button.current!.parentElement!;
        expect(wrapper.title).toBe('element');
        expect(getComputedStyle(wrapper).marginTop).toBe('12px');
    });
});

describe('ButtonBar', () => {
    it('renders a transparent button with label and glyph', async () => {
        const { button } = await setup();
        const cancel = button('cancel');
        expect(cancel.getAttribute('type')).toBe('button');
        expect(cancel.textContent!.trim()).toBe('Cancel');
        expect(getComputedStyle(cancel).backgroundColor).toBe(
            themed('backgroundColor', 'var(--sapButton_Lite_Background)')
        );
        const save = button('save');
        expect(save.textContent!.trim().startsWith('Save')).toBe(true);
        expect(save.querySelector('[data-glyph]')!.getAttribute('data-glyph')).toBeTruthy();
        expect(save.getAttribute('title')).toBe('Save the changes');
        expect(save.id).toMatch(/^fd-button-bar-/);
        expect(save.id).not.toBe(cancel.id);
        // icon-only buttons are named by aria-label
        expect(button('left').getAttribute('aria-label')).toBe('Back');
    });

    it('keeps an id that is passed', async () => {
        const screen = await render(<ButtonBar id="save" label="Save" />);
        expect(screen.container.querySelector('button')!.id).toBe('save');
    });

    it('is compact in compact density', async () => {
        const { button } = await setup();
        expect(rect(button('cancel')).height).toBe(36);
        document.documentElement.setAttribute('data-density', 'compact');
        try {
            expect(rect(button('cancel')).height).toBe(26);
        } finally {
            document.documentElement.removeAttribute('data-density');
        }
    });

    it('clicks reach the handler; a disabled one is inert', async () => {
        const { clicks, button, el, update } = await setup();
        await userEvent.click(button('save'));
        button('cancel').focus();
        await userEvent.keyboard('{Enter}');
        expect(clicks).toEqual(['save', 'cancel']);
        await update({ disabled: true });
        expect(button('save').disabled).toBe(true);
        expect(getComputedStyle(el('save')).pointerEvents).toBe('none');
        button('save').click();
        expect(clicks).toEqual(['save', 'cancel']);
    });

    it('fullWidth stretches the element and its button over the area', async () => {
        const onClick = vi.fn();
        const screen = await render(
            <Bar style={{ width: 600 }}>
                <BarMiddle data-testid="area">
                    <ButtonBar fullWidth label="Wide" onClick={onClick} />
                </BarMiddle>
            </Bar>
        );
        const area = screen.container.querySelector('[data-testid="area"]')!;
        const button = screen.container.querySelector('button')!;
        expect(rect(button.parentElement!).width).toBe(rect(area).width);
        expect(rect(button).width).toBe(rect(area).width);
        await userEvent.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
