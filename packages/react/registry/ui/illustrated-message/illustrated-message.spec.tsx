import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import {
    IllustratedMessage,
    IllustratedMessageActions,
    IllustratedMessageFigcaption,
    IllustratedMessageText,
    IllustratedMessageTitle,
    type IllustratedMessageProps,
    type SvgConfig
} from './illustrated-message';

const svg = (id: string) => `<svg id="${id}" viewBox="0 0 10 10"><rect width="10" height="10" /></svg>`;
const CONFIG: SvgConfig = {
    scene: { id: 'test-scene', file: svg('test-scene') },
    dialog: { id: 'test-dialog', file: svg('test-dialog') },
    spot: { id: 'test-spot', url: '/sprite.svg' },
    dot: { id: 'test-dot', file: svg('test-dot') }
};

interface HostProps extends IllustratedMessageProps {
    width?: string;
    hidden?: boolean;
}

const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

async function setup(initial: HostProps = {}) {
    let current: HostProps = { type: 'dialog', svgConfig: CONFIG, width: '60rem', ...initial };
    const ui = ({ width, hidden, ...props }: HostProps) => (
        <div style={{ width, display: hidden ? 'none' : undefined }}>
            <IllustratedMessage {...props}>
                <IllustratedMessageFigcaption>
                    <IllustratedMessageTitle>Title</IllustratedMessageTitle>
                    <IllustratedMessageText>Text</IllustratedMessageText>
                </IllustratedMessageFigcaption>
                <IllustratedMessageActions>
                    <button>Action</button>
                </IllustratedMessageActions>
            </IllustratedMessage>
        </div>
    );
    const screen = await render(ui(current));
    const figure = () => screen.container.querySelector('figure')!;
    return {
        figure,
        update: async (change: Partial<HostProps>) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
            await frame();
        }
    };
}

describe('IllustratedMessage', () => {
    it('shows the illustration of its size from inline SVG or a sprite URL', async () => {
        const { figure, update } = await setup();
        expect(figure().querySelector('use')!.getAttribute('href')).toBe('#test-dialog');
        expect(figure().querySelector('#test-dialog')).not.toBeNull();
        expect(figure().querySelector('svg')!.getBoundingClientRect().width).toBe(160);
        await update({ type: 'spot' });
        expect(figure().querySelector('use')!.getAttribute('href')).toBe('/sprite.svg#test-spot');
        expect(figure().querySelector('svg')!.getBoundingClientRect().width).toBe(128);
    });

    it('accepts the size names large, medium, small and xsmall for the illustrations', async () => {
        const { figure, update } = await setup({
            type: 'large',
            svgConfig: { large: { id: 'l', file: svg('l') }, xsmall: { id: 'xs', file: svg('xs') } }
        });
        expect(figure().getAttribute('data-size')).toBe('large');
        expect(figure().querySelector('use')!.getAttribute('href')).toBe('#l');
        await update({ type: 'dot' });
        expect(figure().getAttribute('data-size')).toBe('xsmall');
        expect(figure().querySelector('use')!.getAttribute('href')).toBe('#xs');
        expect(figure().querySelector('svg')!.getBoundingClientRect().width).toBe(45);
    });

    it('is decorative unless the illustration is labelled', async () => {
        const { figure, update } = await setup();
        expect(figure().querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
        expect(figure().querySelector('svg')!.hasAttribute('role')).toBe(false);
        await update({ svgAriaLabel: 'Empty mailbox' });
        const svgEl = figure().querySelector('svg')!;
        expect(svgEl.getAttribute('role')).toBe('img');
        expect(svgEl.getAttribute('aria-label')).toBe('Empty mailbox');
        expect(svgEl.hasAttribute('aria-hidden')).toBe(false);
    });

    it('follows the available width without a type', async () => {
        const { figure, update } = await setup({ type: null });
        await frame();
        expect(figure().getAttribute('data-size')).toBe('large');
        expect(figure().querySelector('use')!.getAttribute('href')).toBe('#test-scene');
        await update({ width: '30rem' });
        expect(figure().getAttribute('data-size')).toBe('medium');
        await update({ width: '20rem' });
        expect(figure().getAttribute('data-size')).toBe('small');
        await update({ width: '12rem' });
        expect(figure().getAttribute('data-size')).toBe('xsmall');
        await update({ width: '8rem' });
        expect(figure().getAttribute('data-size')).toBe('base');
        expect(figure().querySelector('svg')).toBeNull();
    });

    it('renders the text without an illustration with noSvg', async () => {
        const { figure, update } = await setup();
        await update({ noSvg: true });
        expect(figure().querySelector('use')).toBeNull();
        expect([...figure().querySelectorAll('svg')].every((el) => el.getBoundingClientRect().width === 0)).toBe(true);
        expect(figure().querySelector('h3')!.textContent).toBe('Title');
        expect(figure().querySelector('p')!.textContent).toBe('Text');
    });

    it('renders text only with type base', async () => {
        const { figure, update } = await setup();
        await update({ type: 'base' });
        expect(figure().getAttribute('data-size')).toBe('base');
        expect(figure().querySelector('use')).toBeNull();
        expect(figure().querySelector('h3')!.textContent).toBe('Title');
    });

    it('picks its size once a message created while hidden becomes visible', async () => {
        const { figure, update } = await setup({ type: null, hidden: true });
        await frame();
        expect(figure().getAttribute('data-size')).toBe('base');
        expect(figure().querySelector('use')).toBeNull();
        await update({ hidden: false });
        await frame();
        expect(figure().getAttribute('data-size')).toBe('large');
        expect(figure().querySelector('use')!.getAttribute('href')).toBe('#test-scene');
    });

    it('places the figcaption under the illustration and the actions after them', async () => {
        const { figure } = await setup();
        const [container, actions] = [...figure().children] as HTMLElement[];
        expect(container!.querySelector('svg + div[hidden] + figcaption')).not.toBeNull();
        expect(actions!.textContent).toBe('Action');
        expect(getComputedStyle(actions!).marginTop).toBe('8px');
    });

    it('sets the sizes of each type', async () => {
        const { figure, update } = await setup({ type: 'scene' });
        const title = () => getComputedStyle(figure().querySelector('h3')!);
        expect(getComputedStyle(figure()).padding).toBe('16px');
        expect(title().fontSize).toBe('32px');
        expect(title().marginBottom).toBe('16px');
        expect(getComputedStyle(figure().querySelector('figcaption')!).maxWidth).toBe('650px');
        await update({ type: 'spot' });
        expect(getComputedStyle(figure()).padding).toBe('8px');
        expect(title().fontSize).toBe('20px');
        await update({ type: 'dot' });
        expect(getComputedStyle(figure()).padding).toBe('4px');
        expect(title().fontSize).toBe('16px');
        expect(getComputedStyle(figure().querySelector('svg')!).marginBottom).toBe('4px');
    });

    it('renders the parts as other elements with render', async () => {
        await render(
            <IllustratedMessage type="base" render={<section />}>
                <IllustratedMessageFigcaption render={<div />}>
                    <IllustratedMessageTitle render={<h2 />}>Title</IllustratedMessageTitle>
                    <IllustratedMessageText render={<span />}>Text</IllustratedMessageText>
                </IllustratedMessageFigcaption>
            </IllustratedMessage>
        );
        const root = document.querySelector('section[data-size="base"]')!;
        expect(root).not.toBeNull();
        expect(root.querySelector('div > h2')!.textContent).toBe('Title');
        expect(root.querySelector('span')!.textContent).toBe('Text');
    });

    it('generates an id unless one is given', async () => {
        const { figure, update } = await setup();
        expect(figure().id).toMatch(/^fd-illustrated-message-/);
        await update({ id: 'mine' });
        expect(figure().id).toBe('mine');
    });

    it('merges a user class and passes props and the ref through', async () => {
        const ref = createRef<HTMLElement>();
        const { figure } = await setup({
            ref,
            className: 'custom',
            'aria-label': 'Empty state',
            // @ts-expect-error data attributes are passed through
            'data-test': 'x'
        });
        expect(figure().classList.contains('custom')).toBe(true);
        expect(figure().classList.contains('flex')).toBe(true);
        expect(figure().getAttribute('aria-label')).toBe('Empty state');
        expect(figure().getAttribute('data-test')).toBe('x');
        expect(ref.current).toBe(figure());
    });
});
