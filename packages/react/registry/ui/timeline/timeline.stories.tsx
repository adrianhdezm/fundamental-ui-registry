import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Avatar } from '@/ui/avatar/avatar';
import { Button } from '@/ui/button/button';
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
    type TimelineAxis,
    type TimelineSidePosition
} from './timeline';

interface Post {
    user: string;
    title: string;
    date: Date;
    post: string;
    glyph?: string;
    action?: boolean;
}

const POSTS: Post[] = [
    {
        user: 'John Li',
        title: 'created the sales order',
        date: new Date(2026, 2, 3, 9, 15),
        post: 'Sales order 4711 for 120 notebooks was created and sent for approval.',
        glyph: 'sales-order',
        action: true
    },
    {
        user: 'Sarah Miller',
        title: 'approved the order',
        date: new Date(2026, 2, 3, 11, 40),
        post: 'Approved. Please make sure that the delivery date is confirmed by the vendor before the end of the week, because the customer needs the notebooks for the onboarding of new employees.',
        glyph: 'approvals'
    },
    {
        user: 'Very Best Screens',
        title: 'confirmed the delivery',
        date: new Date(2026, 2, 4, 8, 5),
        post: 'Delivery confirmed for March 10.',
        glyph: 'shipping-status',
        action: true
    },
    {
        user: 'John Li',
        title: 'added a comment',
        date: new Date(2026, 2, 5, 16, 20),
        post: 'Customer asked for a partial delivery of 60 notebooks on March 8. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        glyph: 'comment'
    },
    {
        user: 'Warehouse',
        title: 'shipped the goods',
        date: new Date(2026, 2, 8, 7, 0),
        post: 'Partial delivery of 60 notebooks shipped.',
        glyph: 'shipping-status'
    }
];

const DATE = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' });

interface StoryTimelineProps {
    axis?: TimelineAxis;
    layout?: TimelineSidePosition;
    glyphs?: boolean;
    maxLines?: number | null;
    data?: Post[] | null;
    className?: string;
}

function StoryTimeline({
    axis = 'vertical',
    layout = 'right',
    glyphs = true,
    maxLines = null,
    data = POSTS,
    className
}: StoryTimelineProps) {
    return (
        <div className={className}>
            <Timeline
                dataSource={data}
                axis={axis}
                layout={layout}
                aria-label="Order history"
                renderNode={(node) => (
                    <TimelineNode glyph={glyphs ? node.glyph : null}>
                        <TimelineNodeHeader>
                            <Avatar circle size="xs" label={node.user} />
                            <TimelineNodeHeaderInfo>
                                <TimelineNodeHeaderInfoTitle>{node.user}</TimelineNodeHeaderInfoTitle>
                                <TimelineNodeHeaderInfoText>{node.title}</TimelineNodeHeaderInfoText>
                                <TimelineNodeHeaderInfoSubtitle>
                                    {DATE.format(node.date)}
                                </TimelineNodeHeaderInfoSubtitle>
                            </TimelineNodeHeaderInfo>
                        </TimelineNodeHeader>
                        <TimelineNodeBody content={node.post} maxLines={maxLines} />
                        {node.action && (
                            <TimelineNodeFooter>
                                <Button variant="transparent" data-density="compact" label="Reply" />
                                <Button variant="transparent" data-density="compact" label="Forward" />
                            </TimelineNodeFooter>
                        )}
                    </TimelineNode>
                )}
            />
        </div>
    );
}

function StoryTimelineLoading() {
    const [data, setData] = useState<Post[] | null>(null);
    return (
        <div className="flex flex-col items-start gap-4">
            <Button label={data ? 'Reload' : 'Load posts'} onClick={() => setData(data ? null : POSTS)} />
            <StoryTimeline className="block w-full" data={data} />
        </div>
    );
}

const meta = {
    title: 'Components/Timeline',
    component: Timeline,
    parameters: {
        docs: {
            description: {
                component:
                    'Timelines show posts in chronological order along a vertical or horizontal line, on one side or ' +
                    'alternating on both sides (double). Nodes are rendered from a `dataSource` with `renderNode`; ' +
                    'without data the timeline shows loading placeholders. Each node shows a dot or an icon on the line.'
            }
        }
    }
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;

const SCROLL = 'block h-[37.5rem] overflow-auto scrollbar-sap';

export const Vertical: Story = {
    name: 'Vertical, right',
    render: () => <StoryTimeline className={SCROLL} />
};

export const VerticalLeft: Story = {
    name: 'Vertical, left, dots and collapsed text',
    render: () => <StoryTimeline className={SCROLL} layout="left" glyphs={false} maxLines={2} />
};

export const VerticalDouble: Story = {
    name: 'Vertical, double-sided',
    render: () => <StoryTimeline className={SCROLL} layout="double" />
};

export const Horizontal: Story = {
    name: 'Horizontal, bottom',
    render: () => <StoryTimeline className={SCROLL} axis="horizontal" layout="bottom" maxLines={3} />
};

export const HorizontalTop: Story = {
    name: 'Horizontal, top',
    render: () => <StoryTimeline className={SCROLL} axis="horizontal" layout="top" maxLines={3} />
};

export const HorizontalDouble: Story = {
    name: 'Horizontal, double-sided',
    render: () => <StoryTimeline className={SCROLL} axis="horizontal" layout="double" maxLines={3} />
};

export const Loading: Story = {
    name: 'Loading',
    render: () => <StoryTimelineLoading />
};
