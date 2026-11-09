import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Title } from '@/ui/title/title';
import {
    DynamicSideContent,
    DynamicSideContentMain,
    DynamicSideContentSide,
    type DynamicSideContentProps
} from './dynamic-side-content';

/** Coloured content, as fundamental-styles' `docs-layout-grid-bg`: centred, 4rem tall. */
function Box({ side = false, children }: { side?: boolean; children: ReactNode }) {
    return (
        <div
            className={cn(
                'box-border flex h-16 items-center justify-center text-center rounded-sap-element-border-corner-radius border',
                side
                    ? 'border-sap-indication-color-6 bg-sap-indication-color-6-background text-sap-indication-color-6-text-color'
                    : 'border-sap-indication-color-5 bg-sap-indication-color-5-background text-sap-indication-color-5-text-color'
            )}
        >
            {children}
        </div>
    );
}

function Heading({ children }: { children: ReactNode }) {
    return (
        <Title level={3} headerSize={5} wrap className="mt-4 mb-2">
            {children}
        </Title>
    );
}

/** A layout with "Main content" and "Side content", the side content first with `sideFirst`. */
function Layout({ sideFirst = false, ...props }: DynamicSideContentProps & { sideFirst?: boolean }) {
    const main = (
        <DynamicSideContentMain key="main">
            <Box>Main content</Box>
        </DynamicSideContentMain>
    );
    const side = (
        <DynamicSideContentSide key="side">
            <Box side>Side content</Box>
        </DynamicSideContentSide>
    );
    return <DynamicSideContent {...props}>{sideFirst ? [side, main] : [main, side]}</DynamicSideContent>;
}

const meta = {
    title: 'Components/Dynamic Side Content',
    component: DynamicSideContent,
    subcomponents: { DynamicSideContentMain, DynamicSideContentSide },
    parameters: {
        docs: {
            description: {
                component:
                    'Dynamic side content shows supplementary content next to (left or right), below or in an equal ' +
                    'split with the main content. The size hides the side content (sm, for small screens) or sets ' +
                    'the share of the main content (md and lg: two thirds, xl: three quarters). With position none ' +
                    'or equalSplit the order of the children is kept; left, right and bottom place the side content ' +
                    'regardless of the order.'
            }
        }
    },
    argTypes: {
        position: { control: 'inline-radio', options: ['none', 'left', 'right', 'bottom', 'equalSplit'] },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] }
    },
    args: { position: 'right', size: 'xl' }
} satisfies Meta<typeof DynamicSideContent>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => <Layout {...args} />
};

export const Basic: Story = {
    name: 'Projected order',
    parameters: {
        docs: {
            description: {
                story: 'Without a position (`none`), the main and side content keep the order of the children.'
            }
        }
    },
    render: () => (
        <>
            <Heading>Main content first</Heading>
            <Layout />
            <Heading>Side content first</Heading>
            <Layout sideFirst />
        </>
    )
};

export const Positioning: Story = {
    name: 'Positions',
    render: () => (
        <>
            <Heading>Left (side content second among the children)</Heading>
            <Layout position="left" />
            <Heading>Right (side content first among the children)</Heading>
            <Layout position="right" sideFirst />
            <Heading>Bottom</Heading>
            <Layout position="bottom" sideFirst />
            <Heading>Equal split</Heading>
            <Layout position="equalSplit" sideFirst />
        </>
    )
};

export const Sizes: Story = {
    name: 'Sizes',
    render: () => (
        <>
            <Heading>sm: side content hidden</Heading>
            <Layout size="sm" position="right" />
            <Heading>md and lg: main content two thirds</Heading>
            <Layout size="md" position="right" />
            <Heading>xl: main content three quarters</Heading>
            <Layout size="xl" position="right" />
        </>
    )
};
