import { createRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Link } from '@/ui/link/link';
import { ObjectIdentifier, type ObjectIdentifierProps } from './object-identifier';

interface State extends ObjectIdentifierProps {
    showLink?: boolean;
}

async function setup(initial: State = {}) {
    let current: State = { description: 'Laptop, 15 inch', showLink: true, ...initial };
    const ui = ({ showLink, ...p }: State) => (
        <div>
            <ObjectIdentifier id="oi" {...p}>
                Notebook Basic 15
            </ObjectIdentifier>
            <ObjectIdentifier id="oi-link" description={p.description}>
                {showLink && <Link href="#order">Order 4711</Link>}
            </ObjectIdentifier>
        </div>
    );
    const screen = await render(ui(current));
    const root = screen.container;
    const byId = (id: string) => document.getElementById(id) as HTMLElement | null;
    return {
        root,
        byId,
        title: () => byId('oi-title')!,
        link: () => root.querySelector<HTMLAnchorElement>('a'),
        labelText: (element: HTMLElement) =>
            (element.getAttribute('aria-labelledby') ?? '')
                .split(' ')
                .map((id) => byId(id)?.textContent?.trim())
                .join(' '),
        update: async (change: State) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('ObjectIdentifier', () => {
    it('renders the title and the description below it', async () => {
        const { title, byId } = await setup();
        expect(title().textContent?.trim()).toBe('Notebook Basic 15');
        const text = byId('oi-text')!;
        expect(text.textContent?.trim()).toBe('Laptop, 15 inch');
        expect(text.getBoundingClientRect().top).toBeGreaterThanOrEqual(title().getBoundingClientRect().bottom);
    });

    it('omits the description when there is none', async () => {
        const { byId, update } = await setup();
        await update({ description: null });
        expect(byId('oi-text')).toBeNull();
    });

    it('bold title is bold, regular otherwise', async () => {
        const { title, update } = await setup();
        expect(Number(getComputedStyle(title()).fontWeight)).toBeLessThan(700);
        await update({ bold: true });
        expect(Number(getComputedStyle(title()).fontWeight)).toBeGreaterThanOrEqual(700);
    });

    it('uses the large font size unless medium', async () => {
        const { title, byId, update } = await setup();
        const large = parseFloat(getComputedStyle(title()).fontSize);
        await update({ medium: true });
        const medium = parseFloat(getComputedStyle(title()).fontSize);
        expect(large).toBeGreaterThan(medium);
        expect(medium).toBe(parseFloat(getComputedStyle(byId('oi')!).fontSize));
    });

    it('a link in the title inherits the title font size and weight', async () => {
        const { link, byId } = await setup();
        const linkTitle = byId('oi-link-title')!;
        expect(getComputedStyle(link()!).fontSize).toBe(getComputedStyle(linkTitle).fontSize);
        expect(getComputedStyle(link()!).fontWeight).toBe(getComputedStyle(linkTitle).fontWeight);
    });

    it('has a hidden role text for assistive technology, overridable with objectIdentifierLabel', async () => {
        const { byId, update } = await setup();
        const description = byId('oi-description')!;
        expect(description.textContent?.trim()).toBe('Object Identifier');
        expect(description.getAttribute('aria-hidden')).toBeNull();
        expect(description.getBoundingClientRect().width).toBeLessThanOrEqual(1);
        await update({ objectIdentifierLabel: 'Product' });
        expect(byId('oi-description')!.textContent?.trim()).toBe('Product');
    });

    it('a link in the title is labelled by its text, the role text and the description', async () => {
        const { link, labelText, byId } = await setup();
        expect(link()!.id).toBe('oi-link-link-0');
        expect(link()!.getAttribute('aria-labelledby')).toBe('oi-link-link-0 oi-link-description oi-link-text');
        expect(labelText(link()!)).toBe('Order 4711 Object Identifier Laptop, 15 inch');
        // the role text is only read through the link
        expect(byId('oi-link-description')!.getAttribute('aria-hidden')).toBe('true');
    });

    it('updates the link label when the description goes away and comes back', async () => {
        const { link, labelText, update } = await setup();
        await update({ description: null });
        expect(link()!.getAttribute('aria-labelledby')).toBe('oi-link-link-0 oi-link-description');
        expect(labelText(link()!)).toBe('Order 4711 Object Identifier');
        await update({ description: 'Open since Monday' });
        expect(labelText(link()!)).toBe('Order 4711 Object Identifier Open since Monday');
    });

    it('keeps an existing link id', async () => {
        const screen = await render(
            <ObjectIdentifier id="own" description="Desc">
                <Link id="my-link" href="#x">
                    Title
                </Link>
            </ObjectIdentifier>
        );
        const link = screen.container.querySelector('a')!;
        expect(link.id).toBe('my-link');
        expect(link.getAttribute('aria-labelledby')).toBe('my-link own-description own-text');
    });

    it('the role text is exposed again when the link is removed', async () => {
        const { byId, update } = await setup();
        await update({ showLink: false });
        expect(byId('oi-link-description')!.getAttribute('aria-hidden')).toBeNull();
    });

    it('labels a link that a child component shows later', async () => {
        function Later() {
            const [shown, setShown] = useState(false);
            return shown ? (
                <Link href="#later">Later</Link>
            ) : (
                <button type="button" onClick={() => setShown(true)}>
                    Show
                </button>
            );
        }
        const screen = await render(
            <ObjectIdentifier id="later" description="Desc">
                <Later />
            </ObjectIdentifier>
        );
        expect(document.getElementById('later-description')!.getAttribute('aria-hidden')).toBeNull();
        await userEvent.click(screen.container.querySelector('button')!);
        await expect
            .poll(() => screen.container.querySelector('a')?.getAttribute('aria-labelledby'))
            .toBe('later-link-0 later-description later-text');
        expect(document.getElementById('later-description')!.getAttribute('aria-hidden')).toBe('true');
    });

    it('generates ids when none is given', async () => {
        const screen = await render(
            <div>
                <ObjectIdentifier description="One">A</ObjectIdentifier>
                <ObjectIdentifier description="Two">B</ObjectIdentifier>
            </div>
        );
        const [a, b] = [...screen.container.querySelectorAll<HTMLElement>(':scope > div > div')];
        expect(a.id).toBeTruthy();
        expect(a.id).not.toBe(b.id);
        expect(document.getElementById(`${a.id}-text`)?.textContent).toBe('One');
    });

    it('passes className, native props and the ref through; render swaps the element', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <div>
                <ObjectIdentifier ref={ref} data-sample="Sample" className="m-1" aria-label="Identifier">
                    Title
                </ObjectIdentifier>
                <ObjectIdentifier render={<section />} id="as-section">
                    Section
                </ObjectIdentifier>
            </div>
        );
        const identifier = screen.container.querySelector<HTMLElement>('[data-sample="Sample"]')!;
        expect(ref.current).toBe(identifier);
        expect(identifier.tagName).toBe('DIV');
        expect(identifier.classList.contains('m-1')).toBe(true);
        expect(identifier.getAttribute('aria-label')).toBe('Identifier');
        expect(screen.container.querySelector('#as-section')!.tagName).toBe('SECTION');
    });
});
