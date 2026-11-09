import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FeedInput, FeedInputAvatar, FeedInputButton, FeedInputTextarea, type FeedInputProps } from './feed-input';

const PHOTO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' fill='%23a2c4e6'/><circle cx='40' cy='31' r='15' fill='%23557a9e'/><path d='M12 80c3-18 15-26 28-26s25 8 28 26z' fill='%23557a9e'/></svg>";

interface ExampleProps extends Omit<FeedInputProps, 'defaultValue'> {
    avatar?: 'image' | 'placeholder' | 'circle' | 'none';
    maxRows?: number | null;
    width?: string;
    defaultValue?: string;
}

/** Mirrors Angular's story component: an avatar, the text area and a send button that posts the text. */
function Example({
    avatar = 'image',
    maxRows = null,
    width,
    defaultValue = '',
    disabled = false,
    ...props
}: ExampleProps) {
    const [text, setText] = useState(defaultValue);
    const [posted, setPosted] = useState('');
    return (
        <>
            <div style={{ maxWidth: width }}>
                <FeedInput aria-label="Post a comment" disabled={disabled} {...props}>
                    {avatar === 'image' && <FeedInputAvatar image={PHOTO} aria-label="John Doe" />}
                    {avatar === 'placeholder' && (
                        <FeedInputAvatar placeholder glyph="person-placeholder" aria-label="John Doe" />
                    )}
                    {avatar === 'circle' && <FeedInputAvatar circle image={PHOTO} aria-label="John Doe" />}
                    <FeedInputTextarea
                        aria-label="Comment"
                        maxRows={maxRows}
                        placeholder={disabled ? 'Disabled' : 'Post something here'}
                        value={text}
                        onValueChange={setText}
                    />
                    <FeedInputButton onClick={() => setPosted(text)} />
                </FeedInput>
            </div>
            <p className="m-0 font-sap-font-family text-sap-font-size text-sap-text-color" aria-live="polite">
                {posted ? `Posted: ${posted}` : ''}
            </p>
        </>
    );
}

const meta = {
    title: 'Components/Feed Input',
    component: FeedInput,
    parameters: {
        docs: {
            description: {
                component:
                    'The feed input posts to a feed: the user avatar, a text area that grows with its text (up to `maxRows` rows, 20rem by default) and a send button that is enabled once there is text. ' +
                    'Below 20rem the avatar hides.'
            }
        }
    },
    args: { disabled: false }
} satisfies Meta<typeof FeedInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: ({ defaultValue: _, ...args }) => <Example {...args} />
};

export const Default: Story = { render: () => <Example /> };

export const WithText: Story = {
    name: 'With text',
    parameters: { docs: { description: { story: 'With text, the send button is enabled.' } } },
    render: () => <Example defaultValue="When there is text, the submit button becomes active." />
};

export const CircleAvatar: Story = {
    name: 'Circle avatar',
    render: () => <Example avatar="circle" />
};

export const PlaceholderAvatar: Story = {
    name: 'Placeholder avatar',
    render: () => <Example avatar="placeholder" />
};

export const NoAvatar: Story = {
    name: 'No avatar',
    render: () => <Example avatar="none" />
};

export const Grow: Story = {
    name: 'Grow up to 7 rows',
    parameters: {
        docs: { description: { story: 'The text area grows with every line up to 7 rows, then scrolls.' } }
    },
    render: () => (
        <Example
            maxRows={7}
            defaultValue={'With every line\n"textarea" grows upward\nuntil it reaches\nthe max height'}
        />
    )
};

export const Disabled: Story = { render: () => <Example disabled /> };

export const Narrow: Story = {
    name: 'Narrow (below 20rem)',
    render: () => <Example width="18rem" />
};
