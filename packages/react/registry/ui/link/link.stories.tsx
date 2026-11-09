import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@/ui/icon/icon';
import { Link } from './link';

const meta = {
    title: 'Components/Link',
    component: Link,
    parameters: {
        docs: {
            description: {
                component:
                    'Links navigate to another page or open external content. Use buttons for actions. ' +
                    'Emphasized and subtle links add a hidden hint for screen readers.'
            }
        }
    },
    args: {
        href: '#',
        children: 'Link text',
        emphasized: false,
        subtle: false,
        undecorated: false,
        inverted: false,
        disabled: false,
        touchTarget: false
    }
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Standard: Story = {
    render: () => (
        <div className="flex flex-col items-start gap-4">
            <Link href="#">Standard Link</Link>
            <Link href="https://www.sap.com" target="_blank" rel="noopener noreferrer">
                External Link (href)
            </Link>
        </div>
    )
};

export const VisualModifiers: Story = {
    name: 'Visual modifiers',
    render: () => (
        <div className="flex flex-col items-start gap-4">
            <Link href="#" emphasized>
                Emphasized Link
            </Link>
            <Link href="#" subtle>
                Subtle Link
            </Link>
            <Link href="#" undecorated>
                Undecorated Link
            </Link>
            <Link href="#" subtle undecorated>
                Subtle Undecorated Link
            </Link>
        </div>
    )
};

export const Inverted: Story = {
    render: () => (
        <div className="rounded-sap-field-border-corner-radius bg-sap-block-layer-background p-4">
            <Link href="#" inverted>
                Inverted Link
            </Link>
        </div>
    )
};

export const States: Story = {
    render: () => (
        <div className="flex flex-col items-start gap-4">
            <Link href="#" disabled>
                Disabled Link
            </Link>
            <Link href="#" touchTarget>
                Touch Target Link
            </Link>
            <p className="max-w-64">
                Long links wrap: <Link href="#">this link has a long text that wraps onto the next line</Link>.
            </p>
        </div>
    )
};

export const Icons: Story = {
    name: 'Icon support',
    render: () => (
        <div className="flex flex-col items-start gap-4">
            <Link href="#">
                Icon Right Link <Icon glyph="arrow-right" />
            </Link>
            <Link href="#">
                <Icon glyph="arrow-left" /> Icon Left Link
            </Link>
            <Link href="#">
                <Icon glyph="arrow-left" /> Link with Both Icons <Icon glyph="arrow-right" />
            </Link>
            <Link href="#" emphasized>
                <Icon glyph="arrow-right" /> Emphasized Link with Icon
            </Link>
        </div>
    )
};
