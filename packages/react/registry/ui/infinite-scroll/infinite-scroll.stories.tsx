import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import { BusyIndicator } from '@/ui/busy-indicator/busy-indicator';
import { List, ListItem, ListTitle } from '@/ui/list/list';
import { InfiniteScroll, useInfiniteScroll, type InfiniteScrollProps } from './infinite-scroll';

/** Items that load `count` more after half a second, ignoring calls while loading. */
function useItems(initial: number, count: number) {
    const [items, setItems] = useState(() => Array.from({ length: initial }, (_, i) => i + 1));
    const [loading, setLoading] = useState(false);
    // the scroll check may run again before the state update re-renders: guard with a ref
    const busy = useRef(false);
    const more = () => {
        if (busy.current) return;
        busy.current = true;
        setLoading(true);
        setTimeout(() => {
            setItems((list) => [...list, ...Array.from({ length: count }, (_, i) => list.length + i + 1)]);
            setLoading(false);
            busy.current = false;
        }, 500);
    };
    return { items, loading, more };
}

/** A list that loads ten more items near its end, with a busy indicator in a last, inactive item. */
function InfiniteListDemo(props: Omit<InfiniteScrollProps, 'onScrollAction'>) {
    const { items, loading, more } = useItems(20, 10);
    return (
        <div className="max-w-md">
            <InfiniteScroll
                {...props}
                onScrollAction={more}
                render={<List aria-label="Infinite list" />}
                className="scrollbar-sap block h-72 overflow-y-scroll"
            >
                {items.map((i) => (
                    <ListItem key={i}>
                        <ListTitle>List item {i}</ListTitle>
                    </ListItem>
                ))}
                <ListItem noData>
                    <ListTitle>
                        <BusyIndicator loading={loading} size="s" aria-label="Loading more" />
                    </ListTitle>
                </ListItem>
            </InfiniteScroll>
            <p
                role="status"
                className="m-0 mt-2 font-sap-font-family text-sap-font-small-size text-sap-content-label-color"
            >
                {items.length} items loaded
            </p>
        </div>
    );
}

const meta = {
    title: 'Components/Infinite Scroll',
    component: InfiniteScroll,
    parameters: {
        docs: {
            description: {
                component:
                    'Calls `onScrollAction` when a scroll container nears the end of its content, e.g. to load more ' +
                    'list items. It has no visuals of its own; `useInfiniteScroll` does the same for an element of ' +
                    'your own.'
            }
        }
    },
    args: { scrollPercent: 75, scrollOffset: 40 },
    render: (args) => <InfiniteListDemo {...args} />
} satisfies Meta<typeof InfiniteScroll>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingMoreItems: Story = {
    name: 'Loading more items',
    parameters: {
        docs: {
            description: {
                story:
                    'The list renders as the scroll container (`render={<List />}`); scrolling to within 40px of its ' +
                    'end (`scrollOffset`) loads ten more items.'
            }
        }
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const list = canvas.getByRole('list', { name: 'Infinite list' });
        await expect(canvas.getByRole('status')).toHaveTextContent('20 items loaded');
        list.scrollTop = list.scrollHeight;
        await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('30 items loaded'), {
            timeout: 3000
        });
        await expect(canvas.getByText('List item 30')).toBeInTheDocument();
    }
};

export const ScrollPercent: Story = {
    name: 'Scroll percent',
    parameters: {
        docs: {
            description: {
                story: 'Without `scrollOffset`, more items load once 50% of the content (`scrollPercent`) is in view.'
            }
        }
    },
    args: { scrollPercent: 50, scrollOffset: undefined }
};

/** A plain list of your own, loading five more items with the hook. */
function HookDemo() {
    const { items, loading, more } = useItems(10, 5);
    const ref = useInfiniteScroll<HTMLUListElement>({ onScrollAction: more });
    return (
        <BusyIndicator loading={loading} size="l" block aria-label="Loading" className="max-w-md">
            <List ref={ref} aria-label="Hook list" className="scrollbar-sap block max-h-[15.625rem] overflow-y-auto">
                {items.map((i) => (
                    <ListItem key={i}>
                        <ListTitle>List item {i}</ListTitle>
                    </ListItem>
                ))}
            </List>
        </BusyIndicator>
    );
}

export const Hook: Story = {
    name: 'With the hook',
    parameters: {
        docs: {
            description: {
                story:
                    '`useInfiniteScroll` on a `List` of your own: past 75% of the content, five more items load while ' +
                    'a busy indicator covers the list.'
            }
        }
    },
    render: () => <HookDemo />
};
