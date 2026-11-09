import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    FeedList,
    FeedListAction,
    FeedListAvatar,
    FeedListFooter,
    FeedListFooterByline,
    FeedListItem,
    type FeedListItemProps,
    type FeedListProps
} from './feed-list';

const TEXT = 'x'.repeat(40);

/** Angular's Host: a linked author with a collapsed text, actions and a footer, then a rich text post. */
async function setup(mobile = false) {
    const screen = await render(
        <FeedList aria-label="Comments" mobile={mobile}>
            <FeedListItem
                authorTitle="John Doe"
                authorLink="https://example.com/"
                text={TEXT}
                maxChars={10}
                actions={
                    <FeedListAction>
                        <button type="button">Act</button>
                    </FeedListAction>
                }
                footer={
                    <FeedListFooter>
                        <FeedListFooterByline>Aug 20</FeedListFooterByline>
                        <FeedListFooterByline>Reply</FeedListFooterByline>
                    </FeedListFooter>
                }
            />
            <FeedListItem authorTitle="Cruz" text="Short <strong>rich</strong>" isRichText />
        </FeedList>
    );
    const root = screen.container;
    return { root, items: () => [...root.querySelectorAll<HTMLElement>('[role=listitem]')] };
}

interface OptionsProps {
    list?: FeedListProps;
    item?: FeedListItemProps;
}

/** Angular's OptionsHost: custom labels, a changing link and borderLess. */
async function setupOptions(initial: OptionsProps = {}) {
    let current = initial;
    const ui = (p: OptionsProps) => (
        <FeedList aria-label="Posts" {...p.list}>
            <FeedListItem
                authorTitle="Jane"
                authorLink="https://example.com/jane"
                text={TEXT}
                maxChars={10}
                moreLabel="Show {count} more"
                lessLabel="Show less"
                {...p.item}
            />
            <FeedListItem authorTitle="Cruz" text="Second" />
        </FeedList>
    );
    const screen = await render(ui(current));
    const root = screen.container;
    return {
        root,
        items: () => [...root.querySelectorAll<HTMLElement>('[role=listitem]')],
        update: async (change: OptionsProps) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

const toggle = (item: HTMLElement, text: string) =>
    [...item.querySelectorAll('a')].find((a) => a.textContent!.includes(text))!;

describe('FeedList', () => {
    it('renders a list of posts with the author as a link', async () => {
        const { root, items } = await setup();
        const list = root.querySelector('[role=list]')!;
        expect(list.getAttribute('aria-label')).toBe('Comments');
        expect(items()).toHaveLength(2);
        const author = items()[0].querySelector<HTMLAnchorElement>('a[href]')!;
        expect(author.textContent).toContain('John Doe');
        expect(author.getAttribute('href')).toBe('https://example.com/');
        expect(author.getAttribute('target')).toBe('_blank');
        expect(author.getAttribute('title')).toBe('John Doe');
    });

    it('collapses long texts with a More/Less link', async () => {
        const { items } = await setup();
        const item = items()[0];
        expect(item.textContent).toContain('x'.repeat(10) + '...');
        expect(item.textContent).not.toContain('x'.repeat(11));
        const more = toggle(item, 'more');
        expect(more.textContent!.trim()).toBe('30 more');
        await userEvent.click(more);
        expect(item.textContent).toContain(TEXT);
        expect(more.textContent!.trim()).toBe('Less');
        await userEvent.click(more);
        expect(more.textContent!.trim()).toBe('30 more');
        // the link does not navigate
        expect(location.hash).toBe('');
    });

    it('renders rich text in full', async () => {
        const { items } = await setup();
        const rich = items()[1];
        expect(rich.querySelector('p span.block')!.innerHTML).toContain('<strong>rich</strong>');
        expect(rich.querySelectorAll('a')).toHaveLength(0);
    });

    it('moves the author, footer and actions above the text in mobile mode', async () => {
        const { items } = await setup(true);
        const item = items()[0];
        const header = item.firstElementChild!;
        expect(header.textContent).toContain('Aug 20');
        expect(header.querySelector('button')).not.toBeNull();
        expect(header.textContent).toContain('John Doe');
        expect(item.querySelector('p')!.textContent).not.toContain('John Doe');
        // the actions sit in the header row, with a start padding instead of floating
        const action = header.querySelector('button')!.parentElement!;
        expect(getComputedStyle(action).float).toBe('none');
        expect(getComputedStyle(action).paddingInlineStart).toBe('12px');
    });

    it('floats the actions to the end beside the text on desktop, in LTR and RTL', async () => {
        const { root, items } = await setup();
        const action = items()[0].querySelector('button')!.parentElement!;
        const text = items()[0].querySelector('p')!;
        expect(getComputedStyle(action).float).toBe('inline-end');
        expect(action.getBoundingClientRect().right).toBeGreaterThan(text.getBoundingClientRect().right);
        root.setAttribute('dir', 'rtl');
        expect(action.getBoundingClientRect().left).toBeLessThan(text.getBoundingClientRect().left);
    });

    it('renders the author as text without authorLink', async () => {
        const { items } = await setup();
        const plain = items()[1];
        expect(plain.querySelector('a')).toBeNull();
        expect(plain.textContent).toContain('Cruz');
    });

    it('uses custom moreLabel and lessLabel', async () => {
        const { items } = await setupOptions();
        expect(toggle(items()[0], 'Show').textContent!.trim()).toBe('Show 30 more');
        await userEvent.click(toggle(items()[0], 'Show'));
        expect(toggle(items()[0], 'Show').textContent!.trim()).toBe('Show less');
    });

    it('collapses again when the text changes', async () => {
        const { items, update } = await setupOptions();
        await userEvent.click(toggle(items()[0], 'Show'));
        expect(items()[0].textContent).toContain(TEXT);
        await update({ item: { text: 'y'.repeat(40) } });
        expect(items()[0].textContent).toContain('y'.repeat(10) + '...');
        expect(toggle(items()[0], 'Show').textContent!.trim()).toBe('Show 30 more');
    });

    it('collapses at 500 characters, or 300 in mobile mode, without maxChars', async () => {
        const { items, update } = await setupOptions({ item: { text: 'z'.repeat(600), maxChars: null } });
        expect(toggle(items()[0], 'Show').textContent!.trim()).toBe('Show 100 more');
        await update({ list: { mobile: true } });
        expect(toggle(items()[0], 'Show').textContent!.trim()).toBe('Show 300 more');
        // an item can be mobile on its own
        await update({ list: {}, item: { text: 'z'.repeat(600), maxChars: null, mobile: true } });
        expect(toggle(items()[0], 'Show').textContent!.trim()).toBe('Show 300 more');
    });

    it('does not render a javascript: authorLink as a live link', async () => {
        const { root, update } = await setupOptions();
        const author = () => root.querySelector<HTMLAnchorElement>('a[title="Jane"]')!;
        expect(author().getAttribute('href')).toBe('https://example.com/jane');
        await update({ item: { authorLink: 'javascript:alert(1)' } });
        expect(author().getAttribute('href')).not.toMatch(/^javascript:/i);
        expect(author().protocol).not.toBe('javascript:');
        await update({ item: { authorLink: 'JavaScript:alert(1)' } });
        expect(author().protocol).not.toBe('javascript:');
        // relative and other safe URLs pass
        await update({ item: { authorLink: '/people/jane' } });
        expect(author().getAttribute('href')).toBe('/people/jane');
        await update({ item: { authorLink: 'mailto:jane@example.com' } });
        expect(author().getAttribute('href')).toBe('mailto:jane@example.com');
    });

    it('removes the borders between items with borderLess', async () => {
        const { items, update } = await setupOptions();
        expect(getComputedStyle(items()[0]).borderTopWidth).toBe('0px');
        expect(getComputedStyle(items()[1]).borderTopWidth).toBe('1px');
        expect(getComputedStyle(items()[1]).borderBottomWidth).toBe('1px');
        await update({ list: { borderLess: true } });
        expect(getComputedStyle(items()[1]).borderTopWidth).toBe('0px');
        // as fundamental-styles: 16px above the first item and below the last, 12px between items
        expect(getComputedStyle(items()[0]).paddingTop).toBe('16px');
        expect(getComputedStyle(items()[0]).paddingBottom).toBe('12px');
        expect(getComputedStyle(items()[1]).paddingTop).toBe('12px');
        expect(getComputedStyle(items()[1]).paddingBottom).toBe('16px');
    });

    it('stacks the items unless isGroup is false', async () => {
        const { root, update } = await setupOptions();
        const list = root.querySelector<HTMLElement>('[role=list]')!;
        expect(getComputedStyle(list).flexDirection).toBe('column');
        await update({ list: { isGroup: false } });
        expect(getComputedStyle(list).flexDirection).toBe('row');
    });

    it('separates the footer bylines with bullets', async () => {
        const { items } = await setup();
        const bylines = [...items()[0].querySelectorAll('small')];
        expect(getComputedStyle(bylines[0], '::after').content).toBe('"•"');
        expect(getComputedStyle(bylines[1], '::after').content).toBe('none');
    });

    it('passes className, native props and the ref through', async () => {
        const listRef = createRef<HTMLDivElement>();
        const itemRef = createRef<HTMLDivElement>();
        const screen = await render(
            <FeedList ref={listRef} aria-label="Posts" className="list-class" data-testid="list">
                <FeedListItem
                    ref={itemRef}
                    authorTitle="Jane"
                    text="Hi"
                    className="item-class"
                    aria-label="Post of Jane"
                    avatar={<FeedListAvatar className="avatar-class">J</FeedListAvatar>}
                    footer={
                        <FeedListFooter className="footer-class">
                            <FeedListFooterByline className="byline-class" render={<span />}>
                                Today
                            </FeedListFooterByline>
                        </FeedListFooter>
                    }
                />
            </FeedList>
        );
        const root = screen.container;
        expect(listRef.current).toBe(root.querySelector('[data-testid=list]'));
        expect(listRef.current!.classList.contains('list-class')).toBe(true);
        expect(itemRef.current!.getAttribute('role')).toBe('listitem');
        expect(itemRef.current!.getAttribute('aria-label')).toBe('Post of Jane');
        expect(itemRef.current!.classList.contains('item-class')).toBe(true);
        expect(root.querySelector('.avatar-class')!.classList.contains('basis-12')).toBe(true);
        expect(root.querySelector('.footer-class')).not.toBeNull();
        expect(root.querySelector('.byline-class')!.tagName).toBe('SPAN');
    });
});
