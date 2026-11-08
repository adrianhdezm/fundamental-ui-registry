import { createRef, type Key } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
    Timeline,
    TimelineNode,
    TimelineNodeBody,
    TimelineNodeFooter,
    TimelineNodeHeader,
    TimelineNodeHeaderInfo,
    TimelineNodeHeaderInfoSubtitle,
    TimelineNodeHeaderInfoText,
    TimelineNodeHeaderInfoTitle,
    type TimelineActions,
    type TimelineAxis,
    type TimelineSidePosition
} from './timeline';

interface Post {
    title: string;
    text: string;
}

const LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt. '.repeat(6);

const POSTS: Post[] = [
    { title: 'First', text: 'Short text.' },
    { title: 'Second', text: LONG },
    { title: 'Third', text: 'Another short text.' },
    { title: 'Fourth', text: LONG },
    { title: 'Fifth', text: 'The end.' }
];

interface HostProps {
    width: number;
    posts: Post[] | null;
    axis: TimelineAxis;
    layout: TimelineSidePosition;
    trackBy?: (index: number, post: Post) => Key;
}

function Host({ width, posts, axis, layout, trackBy }: HostProps) {
    return (
        <div style={{ width }}>
            <Timeline
                dataSource={posts}
                axis={axis}
                layout={layout}
                trackBy={trackBy}
                aria-label="Activity"
                renderNode={(post, i) => (
                    <TimelineNode aria-label={post.title} data-index={i} glyph={i === 0 ? 'calendar' : null}>
                        <TimelineNodeHeader>
                            <TimelineNodeHeaderInfo>
                                <TimelineNodeHeaderInfoTitle data-title="">{post.title}</TimelineNodeHeaderInfoTitle>
                            </TimelineNodeHeaderInfo>
                        </TimelineNodeHeader>
                        <TimelineNodeBody content={post.text} maxLines={2} />
                    </TimelineNode>
                )}
            />
        </div>
    );
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const stable = async () => {
    await frame();
    await frame();
};

async function setup(config: Partial<HostProps> = {}) {
    let props: HostProps = { width: 800, posts: POSTS, axis: 'vertical', layout: 'right', ...config };
    const screen = await render(<Host {...props} />);
    await stable();
    const root = screen.container;
    const timeline = root.querySelector<HTMLElement>('[role="list"]')!;
    const nodes = () =>
        [...timeline.querySelectorAll<HTMLElement>('[role="listitem"]')].sort(
            (a, b) => Number(a.dataset['index']) - Number(b.dataset['index'])
        );
    const parts = (node: HTMLElement) => {
        const [container, post] = [...node.children] as HTMLElement[];
        const [wrapper, line] = [...container.children] as HTMLElement[];
        return { marker: wrapper.firstElementChild as HTMLElement, line, post };
    };
    return {
        screen,
        root,
        timeline,
        nodes,
        parts,
        update: async (change: Partial<HostProps>) => {
            props = { ...props, ...change };
            await screen.rerender(<Host {...props} />);
            await stable();
        },
        lists: () => [timeline.children[0] as HTMLElement, timeline.children[2] as HTMLElement],
        indexes: (list: HTMLElement) =>
            [...list.querySelectorAll<HTMLElement>('[role="listitem"]')].map((n) => Number(n.dataset['index']))
    };
}

describe('Timeline', () => {
    afterEach(() => {
        document.documentElement.removeAttribute('dir');
    });

    it('renders nodes from the data source with renderNode (which gets the index)', async () => {
        const { nodes, update } = await setup();
        expect(nodes().map((n) => n.querySelector('[data-title]')!.textContent)).toEqual(POSTS.map((p) => p.title));
        expect(nodes()[0].querySelector('[data-glyph]')).not.toBeNull();
        expect(nodes()[1].querySelector('[data-glyph]')).toBeNull();
        await update({ posts: POSTS.slice(0, 2) });
        expect(nodes()).toHaveLength(2);

        // a different node per index, and nothing for an index renderNode skips (Angular: one template per index)
        const screen = await render(
            <Timeline
                dataSource={['one', 'two', 'three']}
                renderNode={(post, i) =>
                    i === 0 ? (
                        <TimelineNode className="first-template">A {post}</TimelineNode>
                    ) : i === 1 ? (
                        <TimelineNode className="second-template">
                            B {post} {i}
                        </TimelineNode>
                    ) : null
                }
            />
        );
        const rendered = [...screen.container.querySelectorAll('[role="listitem"]')];
        expect(rendered.map((n) => n.textContent!.trim())).toEqual(['A one', 'B two 1']);
    });

    it('layout left/right/top/bottom puts all nodes on one side; double alternates by index', async () => {
        const { update, lists, indexes, nodes, parts } = await setup();
        expect(indexes(lists()[0])).toEqual([]);
        expect(indexes(lists()[1])).toEqual([0, 1, 2, 3, 4]);
        for (const node of nodes()) {
            const { marker, post } = parts(node);
            expect(post.getBoundingClientRect().left).toBeGreaterThan(marker.getBoundingClientRect().right);
        }

        await update({ layout: 'left' });
        expect(indexes(lists()[0])).toEqual([0, 1, 2, 3, 4]);
        expect(indexes(lists()[1])).toEqual([]);
        for (const node of nodes()) {
            const { marker, post } = parts(node);
            expect(post.getBoundingClientRect().right).toBeLessThan(marker.getBoundingClientRect().left);
        }

        await update({ layout: 'double' });
        expect(indexes(lists()[0])).toEqual([0, 2, 4]);
        expect(indexes(lists()[1])).toEqual([1, 3]);
        // all markers sit on the same line
        const centers = nodes().map((n) => {
            const rect = parts(n).marker.getBoundingClientRect();
            return Math.round(rect.left + rect.width / 2);
        });
        expect(new Set(centers).size).toBe(1);

        await update({ axis: 'horizontal', layout: 'top' });
        expect(indexes(lists()[0])).toEqual([0, 1, 2, 3, 4]);
        for (const node of nodes()) {
            const { marker, post } = parts(node);
            expect(post.getBoundingClientRect().bottom).toBeLessThan(marker.getBoundingClientRect().top);
        }
        await update({ layout: 'bottom' });
        expect(indexes(lists()[1])).toEqual([0, 1, 2, 3, 4]);
        for (const node of nodes()) {
            const { marker, post } = parts(node);
            expect(post.getBoundingClientRect().top).toBeGreaterThan(marker.getBoundingClientRect().bottom);
        }
        await update({ layout: 'double' });
        expect(indexes(lists()[0])).toEqual([0, 2, 4]);
        expect(indexes(lists()[1])).toEqual([1, 3]);
    });

    it('connecting lines reach the next node along the axis; the last line is hidden', async () => {
        const vertical = await setup();
        const nodesV = vertical.nodes();
        nodesV.forEach((node, i) => {
            const { line } = vertical.parts(node);
            if (i === nodesV.length - 1) {
                expect(line.style.opacity).toBe('0');
                return;
            }
            expect(line.style.opacity).toBe('');
            const next = vertical.parts(nodesV[i + 1]).marker.getBoundingClientRect();
            expect(line.getBoundingClientRect().bottom + 4).toBeCloseTo(next.top, 0);
        });
        await vertical.screen.unmount();

        const horizontal = await setup({ axis: 'horizontal', layout: 'bottom' });
        const checkHorizontal = (rtl: boolean) => {
            const nodes = horizontal.nodes();
            nodes.slice(0, -1).forEach((node, i) => {
                const line = horizontal.parts(node).line.getBoundingClientRect();
                const next = horizontal.parts(nodes[i + 1]).marker.getBoundingClientRect();
                if (rtl) expect(line.left - 4).toBeCloseTo(next.right, 0);
                else expect(line.right + 4).toBeCloseTo(next.left, 0);
            });
            expect(horizontal.parts(nodes.at(-1)!).line.style.opacity).toBe('0');
        };
        checkHorizontal(false);
        document.documentElement.setAttribute('dir', 'rtl');
        horizontal.timeline.style.width = '99%';
        await stable();
        checkHorizontal(true);
    });

    it('double vertical layout spaces alternating nodes so each comes after the previous', async () => {
        const { nodes, parts } = await setup({ layout: 'double' });
        const markers = nodes().map((n) => parts(n).marker.getBoundingClientRect());
        for (let i = 1; i < markers.length; i++) {
            expect(markers[i].top).toBeGreaterThanOrEqual(markers[i - 1].bottom + 24 - 0.5);
        }
        // the lines run from one side to the node on the other side
        nodes()
            .slice(0, -1)
            .forEach((node, i) => {
                const line = parts(node).line.getBoundingClientRect();
                expect(line.bottom + 4).toBeCloseTo(markers[i + 1].top, 0);
            });
    });

    it('lines update when a post resizes (e.g. More/Less in the body) or the timeline resizes', async () => {
        const { update, nodes, parts } = await setup();
        const lineToNext = () => parts(nodes()[1]).line.getBoundingClientRect().height;
        const reaches = () =>
            expect(parts(nodes()[1]).line.getBoundingClientRect().bottom + 4).toBeCloseTo(
                parts(nodes()[2]).marker.getBoundingClientRect().top,
                0
            );
        const collapsed = lineToNext();
        const more = [...nodes()[1].querySelectorAll<HTMLElement>('button')].find(
            (b) => b.textContent!.trim() === 'More'
        )!;
        expect(more.getAttribute('aria-expanded')).toBe('false');
        await userEvent.click(more);
        await stable();
        expect(more.textContent!.trim()).toBe('Less');
        expect(lineToNext()).toBeGreaterThan(collapsed);
        reaches();
        const expanded = lineToNext();

        await update({ width: 400 });
        expect(lineToNext()).toBeGreaterThan(expanded);
        reaches();
    });

    it('calculatePositions (actionsRef) redraws the lines after a post changed its size', async () => {
        const actions = createRef<TimelineActions>();
        const screen = await render(
            <Timeline
                actionsRef={actions}
                dataSource={['a', 'b']}
                renderNode={(item) => <TimelineNode data-item={item}>{item}</TimelineNode>}
            />
        );
        await stable();
        const [first, second] = [...screen.container.querySelectorAll<HTMLElement>('[role="listitem"]')];
        const line = first.firstElementChild!.children[1] as HTMLElement;
        const marker = () => second.firstElementChild!.firstElementChild!.firstElementChild!.getBoundingClientRect();
        line.style.height = '1px';
        actions.current!.calculatePositions();
        await stable();
        expect(line.getBoundingClientRect().bottom + 4).toBeCloseTo(marker().top, 0);
    });

    it('without data shows three loading placeholders and aria-busy', async () => {
        const { timeline, update, lists, nodes } = await setup({ posts: null });
        expect(timeline.getAttribute('aria-busy')).toBe('true');
        expect(lists()[1].querySelectorAll('[role="listitem"]')).toHaveLength(3);
        expect(lists()[1].querySelectorAll('svg').length).toBeGreaterThanOrEqual(3);
        await update({ layout: 'left' });
        expect(lists()[0].querySelectorAll('[role="listitem"]')).toHaveLength(3);
        expect(lists()[1].querySelectorAll('[role="listitem"]')).toHaveLength(0);

        await update({ posts: POSTS });
        expect(timeline.hasAttribute('aria-busy')).toBe(false);
        expect(timeline.querySelector('svg')).toBeNull();
        expect(nodes()).toHaveLength(5);
    });

    it('role list / listitem; arrows of the posts point to the line in LTR and RTL', async () => {
        const { timeline, nodes, parts, update } = await setup();
        expect(timeline.getAttribute('role')).toBe('list');
        await expect.element(page.getByRole('list', { name: 'Activity' })).toBeInTheDocument();
        expect(nodes().every((n) => n.getAttribute('role') === 'listitem')).toBe(true);
        await expect.element(page.getByRole('listitem', { name: 'Second' })).toBeInTheDocument();

        const arrow = (node: HTMLElement) => getComputedStyle(parts(node).post, '::after');
        // posts right of the line point left (to the start)
        expect(arrow(nodes()[0]).rotate).toBe('-135deg');
        expect(arrow(nodes()[0]).left).toBe('-7px');
        document.documentElement.setAttribute('dir', 'rtl');
        expect(arrow(nodes()[0]).rotate).toBe('45deg');
        expect(arrow(nodes()[0]).right).toBe('-7px');
        // posts on the other side point the other way
        await update({ layout: 'left' });
        expect(arrow(nodes()[0]).rotate).toBe('-135deg');
        expect(arrow(nodes()[0]).left).toBe('-7px');
        document.documentElement.removeAttribute('dir');
        expect(arrow(nodes()[0]).rotate).toBe('45deg');
        expect(arrow(nodes()[0]).right).toBe('-7px');
    });

    it('with trackBy, replacing the data keeps the DOM nodes of unchanged items', async () => {
        const { update, nodes } = await setup({ trackBy: (_, post) => post.title });
        const before = nodes();
        await update({ posts: POSTS.map((post) => ({ ...post })) });
        const after = nodes();
        expect(after).toHaveLength(5);
        after.forEach((node, i) => expect(node).toBe(before[i]));
        // a changed item is re-rendered, the others are kept
        await update({ posts: POSTS.map((post, i) => (i === 2 ? { ...post, title: 'Changed' } : { ...post })) });
        const changed = nodes();
        expect(changed[2]).not.toBe(before[2]);
        expect(changed[2].getAttribute('aria-label')).toBe('Changed');
        [0, 1, 3, 4].forEach((i) => expect(changed[i]).toBe(before[i]));
    });

    it('without trackBy, new data objects re-render the nodes; the same objects keep them', async () => {
        const { update, nodes } = await setup();
        const before = nodes();
        await update({ posts: [...POSTS] });
        nodes().forEach((node, i) => expect(node).toBe(before[i]));
        await update({ posts: POSTS.map((post) => ({ ...post })) });
        const after = nodes();
        expect(after).toHaveLength(5);
        after.forEach((node, i) => {
            expect(node).not.toBe(before[i]);
            expect(node.getAttribute('aria-label')).toBe(POSTS[i].title);
        });
    });

    it('appending an item adds a node and extends the previous line', async () => {
        const { update, nodes, parts } = await setup();
        expect(parts(nodes()[4]).line.style.opacity).toBe('0');
        await update({ posts: [...POSTS, { title: 'Sixth', text: 'One more.' }] });
        const all = nodes();
        expect(all).toHaveLength(6);
        expect(all[5].getAttribute('aria-label')).toBe('Sixth');
        const { line } = parts(all[4]);
        expect(line.style.opacity).toBe('');
        const next = parts(all[5]).marker.getBoundingClientRect();
        expect(line.getBoundingClientRect().bottom + 4).toBeCloseTo(next.top, 0);
        expect(parts(all[5]).line.style.opacity).toBe('0');
    });

    it('switching the axis clears the line length and the double-layout spacing of the other axis', async () => {
        const { update, nodes, parts } = await setup({ layout: 'double' });
        expect(nodes()[1].style.marginTop).not.toBe('');
        await update({ axis: 'horizontal' });
        nodes().forEach((node) => {
            expect(node.style.marginTop).toBe('');
            expect(parts(node).line.style.height).toBe('');
        });
    });

    it('header parts, body children and footer render their elements with their classes', async () => {
        const screen = await render(
            <Timeline
                dataSource={[1]}
                renderNode={() => (
                    <TimelineNode>
                        <TimelineNodeHeader data-testid="header">
                            <TimelineNodeHeaderInfo>
                                <TimelineNodeHeaderInfoTitle data-testid="title">John</TimelineNodeHeaderInfoTitle>
                                <TimelineNodeHeaderInfoText render={<em />} data-testid="text">
                                    posted
                                </TimelineNodeHeaderInfoText>
                                <TimelineNodeHeaderInfoSubtitle data-testid="subtitle">
                                    today
                                </TimelineNodeHeaderInfoSubtitle>
                            </TimelineNodeHeaderInfo>
                        </TimelineNodeHeader>
                        <TimelineNodeBody content="Hello">
                            <i data-testid="extra">extra</i>
                        </TimelineNodeBody>
                        <TimelineNodeFooter data-testid="footer">
                            <button type="button">Reply</button>
                        </TimelineNodeFooter>
                    </TimelineNode>
                )}
            />
        );
        const get = (id: string) => screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
        expect(getComputedStyle(get('title')).fontWeight).toBe('700');
        expect(get('text').tagName).toBe('EM');
        expect(getComputedStyle(get('subtitle')).display).toBe('block');
        expect(get('extra').previousElementSibling!.textContent).toBe('Hello');
        expect(getComputedStyle(get('footer')).display).toBe('flex');
        expect(getComputedStyle(get('header')).alignItems).toBe('center');
        // a body without maxLines has no toggle
        expect(screen.container.querySelector('[aria-expanded]')).toBeNull();
    });

    it('passes className, native props and the ref through (timeline and node)', async () => {
        const ref = createRef<HTMLDivElement>();
        const nodeRef = createRef<HTMLDivElement>();
        const screen = await render(
            <Timeline
                ref={ref}
                id="tl"
                className="custom"
                data-x="1"
                dataSource={['a']}
                renderNode={() => (
                    <TimelineNode ref={nodeRef} className="node-custom" id="node">
                        a
                    </TimelineNode>
                )}
            />
        );
        const timeline = screen.container.querySelector<HTMLElement>('#tl')!;
        expect(ref.current).toBe(timeline);
        expect(timeline.classList.contains('custom')).toBe(true);
        expect(timeline.dataset['x']).toBe('1');
        expect(timeline.getAttribute('aria-label')).toBe('Timeline');
        expect(nodeRef.current!.id).toBe('node');
        expect(nodeRef.current!.classList.contains('node-custom')).toBe(true);
    });
});
