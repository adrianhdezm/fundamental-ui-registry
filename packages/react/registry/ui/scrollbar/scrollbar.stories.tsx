import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Scrollbar } from './scrollbar';

const PARAGRAPHS = Array.from(
    { length: 12 },
    (_, i) =>
        `Paragraph ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ` +
        'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut ' +
        'aliquip ex ea commodo consequat.'
);

/** Paragraphs wider and taller than the box, so it scrolls both ways. */
const Text = () =>
    PARAGRAPHS.map((paragraph) => (
        <p key={paragraph} className="m-0 mb-3 w-[48rem]">
            {paragraph}
        </p>
    ));

const box =
    'h-48 w-full max-w-lg rounded-sap-element-border-corner-radius border border-sap-group-content-border-color bg-sap-group-content-background p-4';

const meta = {
    title: 'Components/Scrollbar',
    component: Scrollbar,
    parameters: {
        docs: {
            description: {
                component:
                    'A scroll container with SAP-themed scrollbars. Either direction can be turned off, and ' +
                    '`alwaysVisible` keeps the scrollbars when the content fits.'
            }
        }
    },
    args: { noHorizontalScroll: false, noVerticalScroll: false, alwaysVisible: false }
} satisfies Meta<typeof Scrollbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <Scrollbar {...args} role="region" tabIndex={0} aria-label="Scrollable text" className={box}>
            <Text />
        </Scrollbar>
    )
};

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' example: a 300 × 100 px box with much larger content."
            }
        }
    },
    render: (args) => (
        <Scrollbar {...args} role="region" tabIndex={0} aria-label="Large content" className="h-25 w-75">
            <div className="size-[9000px]" />
        </Scrollbar>
    )
};

export const Directions: Story = {
    render: () => (
        <div className="flex flex-col gap-6">
            <Scrollbar role="region" tabIndex={0} aria-label="Both directions" className={box}>
                <Text />
            </Scrollbar>
            <Scrollbar noHorizontalScroll role="region" tabIndex={0} aria-label="Vertical only" className={box}>
                <Text />
            </Scrollbar>
            <Scrollbar noVerticalScroll role="region" tabIndex={0} aria-label="Horizontal only" className={box}>
                <Text />
            </Scrollbar>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const vertical = canvas.getByLabelText('Vertical only');
        await expect(getComputedStyle(vertical).overflowX).toBe('hidden');
        await expect(getComputedStyle(canvas.getByLabelText('Horizontal only')).overflowY).toBe('hidden');
    }
};

export const AlwaysVisible: Story = {
    name: 'Always visible',
    parameters: {
        docs: {
            description: {
                story:
                    'With `alwaysVisible` the scrollbars stay even though the text fits; with `noHorizontalScroll` ' +
                    'only the vertical one.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-6">
            <Scrollbar alwaysVisible role="region" tabIndex={0} aria-label="Both scrollbars" className={box}>
                <p className="m-0">This text fits in the box.</p>
            </Scrollbar>
            <Scrollbar
                alwaysVisible
                noHorizontalScroll
                role="region"
                tabIndex={0}
                aria-label="Vertical scrollbar"
                className={box}
            >
                <p className="m-0">This text fits in the box.</p>
            </Scrollbar>
        </div>
    )
};
