import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ActionSheet, ActionSheetBody, ActionSheetControl, ActionSheetItem } from '@/ui/action-sheet/action-sheet';
import { Avatar } from '@/ui/avatar/avatar';
import { Button } from '@/ui/button/button';
import { Link } from '@/ui/link/link';
import {
    FeedList,
    FeedListAction,
    FeedListAvatar,
    FeedListFooter,
    FeedListFooterByline,
    FeedListItem,
    type FeedListProps
} from './feed-list';

const LONG =
    'Long text, you can toggle the view with the more and less link. Lorem Ipsum is simply dummy text of the printing and typesetting industry. ' +
    'Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.';

const POSTS = [
    { author: 'John Doe', link: 'https://example.com/', text: LONG, date: 'Aug 20, 2020' },
    {
        author: 'Cruz',
        link: null,
        text: 'Maecenas convallis velit quis felis dictum, in ultrices quam faucibus.',
        date: 'Aug 21, 2020'
    },
    {
        author: 'Sanchez',
        link: null,
        text: 'Rich text with <strong>bold</strong>, <em>italic</em> and a <a href="https://example.com">link</a>.',
        rich: true,
        date: 'Aug 22, 2020'
    }
];

/** The action sheet of a post: Edit, Share and Delete. */
function PostActions({ author, mobile }: { author: string; mobile: boolean }) {
    const [open, setOpen] = useState(false);
    return (
        <ActionSheet open={open} onOpenChange={setOpen} placement="bottom-end" mobile={mobile}>
            <ActionSheetControl
                render={
                    <Button variant="transparent" glyph="overflow" aria-label={`Actions for the post of ${author}`} />
                }
            />
            <ActionSheetBody aria-label="Post actions">
                <ActionSheetItem label="Edit" glyph="edit" onClick={() => setOpen(false)} />
                <ActionSheetItem label="Share" glyph="share" onClick={() => setOpen(false)} />
                <ActionSheetItem label="Delete" glyph="delete" negative onClick={() => setOpen(false)} />
            </ActionSheetBody>
        </ActionSheet>
    );
}

interface ExampleProps extends FeedListProps {
    avatars?: boolean;
    actions?: boolean;
    maxChars?: number | null;
    moreLabel?: string;
    lessLabel?: string;
}

/** Mirrors Angular's story component: three posts (a linked author with a long text, a short one, rich text). */
function Example({
    mobile = false,
    avatars = true,
    actions = false,
    maxChars = 120,
    moreLabel,
    lessLabel,
    ...props
}: ExampleProps) {
    return (
        <div style={{ maxWidth: mobile ? '22rem' : undefined }}>
            <FeedList aria-label="Comments" mobile={mobile} {...props}>
                {POSTS.map((post) => (
                    <FeedListItem
                        key={post.author}
                        authorTitle={post.author}
                        authorLink={post.link}
                        text={post.text}
                        maxChars={maxChars}
                        isRichText={!!post.rich}
                        moreLabel={moreLabel}
                        lessLabel={lessLabel}
                        avatar={
                            avatars && (
                                <FeedListAvatar>
                                    <Avatar size="s" circle label={post.author} />
                                </FeedListAvatar>
                            )
                        }
                        actions={
                            actions && (
                                <FeedListAction>
                                    <PostActions author={post.author} mobile={mobile} />
                                </FeedListAction>
                            )
                        }
                        footer={
                            <FeedListFooter>
                                <FeedListFooterByline>{post.date}</FeedListFooterByline>
                                <FeedListFooterByline>
                                    <Link href="#" onClick={(event) => event.preventDefault()}>
                                        Reply
                                    </Link>
                                </FeedListFooterByline>
                            </FeedListFooter>
                        }
                    />
                ))}
            </FeedList>
        </div>
    );
}

const meta = {
    title: 'Components/Feed List',
    component: FeedList,
    parameters: {
        docs: {
            description: {
                component:
                    'A feed list shows posts and comments: the author (a link with `authorLink`), a text collapsed to `maxChars` characters with a More/Less link (or rich text), an avatar, actions and a footer of bylines. ' +
                    'In mobile mode the author, footer and actions go in a header above the text.'
            }
        }
    },
    args: { mobile: false, isGroup: true, borderLess: false }
} satisfies Meta<typeof FeedList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => <Example {...args} />
};

export const Default: Story = { render: () => <Example /> };

export const WithActions: Story = {
    name: 'With actions',
    render: () => <Example actions />
};

export const NoAvatars: Story = {
    name: 'No avatars',
    render: () => <Example avatars={false} />
};

export const Borderless: Story = { render: () => <Example borderLess /> };

export const Mobile: Story = { render: () => <Example mobile actions maxChars={null} /> };

export const CustomLabels: Story = {
    name: 'Custom more/less labels',
    render: () => <Example moreLabel="Show {count} more" lessLabel="Show less" />
};

/** Opens the action sheet of the first post. */
async function openFirstActions(canvasElement: HTMLElement) {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Actions for the post of John Doe' }));
    await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menuitem'));
}

export const OpenActions: Story = {
    name: 'Open: actions',
    tags: ['!autodocs'],
    render: WithActions.render,
    play: ({ canvasElement }) => openFirstActions(canvasElement)
};

export const OpenMobileActions: Story = {
    name: 'Open: mobile actions',
    tags: ['!autodocs'],
    render: Mobile.render,
    play: ({ canvasElement }) => openFirstActions(canvasElement)
};
