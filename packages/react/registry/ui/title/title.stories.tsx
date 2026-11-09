import type { Meta, StoryObj } from '@storybook/react-vite';
import { Title, TitleSizeContext } from './title';

const LONG = 'A very long title that does not fit into the available width of its container';

const meta = {
    title: 'Components/Title',
    component: Title,
    parameters: {
        docs: {
            description: {
                component:
                    'Titles structure a page. Use `level` for the document outline and `headerSize` to change only the visual size.'
            }
        }
    }
} satisfies Meta<typeof Title>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Semantic: Story = {
    name: 'Semantic levels',
    render: () => (
        <>
            <Title level={1}>Page Title (H1)</Title>
            <Title level={2}>Section Title (H2)</Title>
            <Title level={3}>Subsection Title (H3)</Title>
            <Title level={4}>Minor Heading (H4)</Title>
            <Title level={5}>Subheading (H5)</Title>
            <Title level={6}>Smallest Heading (H6)</Title>
        </>
    )
};

export const Visual: Story = {
    name: 'Visual levels',
    render: () => (
        <>
            <Title level={1} headerSize={6}>
                H1 element styled as H6
            </Title>
            <Title level={2} headerSize={5}>
                H2 element styled as H5
            </Title>
            <Title level={3} headerSize={4}>
                H3 element styled as H4
            </Title>
            <Title level={4} headerSize={3}>
                H4 element styled as H3
            </Title>
            <Title level={5} headerSize={2}>
                H5 element styled as H2
            </Title>
            <Title level={6} headerSize={1}>
                H6 element styled as H1
            </Title>
        </>
    )
};

export const Elision: Story = {
    name: 'Truncation',
    render: () => (
        <div className="w-[300px]">
            {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                <Title key={level} level={level}>
                    {LONG}
                </Title>
            ))}
        </div>
    )
};

export const Wrapping: Story = {
    render: () => (
        <div className="w-[300px]">
            {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                <Title key={level} level={level} wrap>
                    {LONG}
                </Title>
            ))}
            <Title level={3} headerSize={5} twoLineClamp>
                {LONG} and that is clamped to two lines when it gets even longer than this
            </Title>
        </div>
    )
};

export const DefaultSize: Story = {
    name: 'Default size from the context',
    parameters: {
        docs: {
            description: {
                story: 'A component can provide `TitleSizeContext` to give the titles inside it a default visual size; an explicit `headerSize` still wins.'
            }
        }
    },
    render: () => (
        <TitleSizeContext value={5}>
            <Title level={2}>H2 element, default size 5 from the context</Title>
            <Title level={3}>H3 element, default size 5 from the context</Title>
            <Title level={3} headerSize={2}>
                H3 element with an explicit headerSize 2
            </Title>
        </TitleSizeContext>
    )
};
