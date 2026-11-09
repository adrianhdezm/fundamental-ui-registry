import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button } from '@/ui/button/button';
import { Link } from '@/ui/link/link';
import {
    MessagePage,
    MessagePageActions,
    MessagePageMore,
    MessagePageSubtitle,
    MessagePageTitle
} from './message-page';

const meta = {
    title: 'Components/Message Page',
    component: MessagePage,
    subcomponents: { MessagePageTitle, MessagePageSubtitle, MessagePageActions, MessagePageMore },
    argTypes: {
        type: { control: 'select', options: ['', 'filter', 'search', 'no-items', 'error'] },
        glyph: { control: 'text' },
        glyphFont: { control: 'select', options: ['SAP-icons', 'BusinessSuiteInAppSymbols', 'SAP-icons-TNT'] }
    },
    parameters: {
        docs: {
            description: {
                component:
                    'A message page fills the page when there is nothing to show: no items, no search or filter results, or an error. ' +
                    'The type sets the icon; the title, subtitle and actions are announced as a polite status.'
            }
        }
    }
} satisfies Meta<typeof MessagePage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The page fills its container: give it a height. */
const Frame = ({ children }: { children: ReactNode }) => <div className="h-[32rem]">{children}</div>;

/** A neutral placeholder logo. */
const LOGO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'><rect width='120' height='60' rx='6' fill='%230070f2'/><text x='60' y='38' font-family='Arial' font-size='22' font-weight='bold' fill='white' text-anchor='middle'>LOGO</text></svg>";

export const Actions: Story = {
    name: 'With actions',
    parameters: {
        docs: {
            description: {
                story: 'Formatted text in the subtitle, two actions and a "more" area; the default type shows the documents icon.'
            }
        }
    },
    render: (args) => (
        <Frame>
            <MessagePage {...args}>
                <MessagePageTitle>Sorry, we can’t find this page.</MessagePageTitle>
                <MessagePageSubtitle>
                    <b>The page might have been moved or deleted.</b> Check the address or go back to the home page.{' '}
                    <i>Contact support if the problem persists.</i>
                </MessagePageSubtitle>
                <MessagePageActions>
                    <Button variant="emphasized" label="Contact support" />
                    <Button label="Reload page" />
                </MessagePageActions>
                <MessagePageMore>
                    <Button variant="transparent" label="Show details" />
                </MessagePageMore>
            </MessagePage>
        </Frame>
    )
};

export const Types: Story = {
    args: { type: 'search' },
    parameters: { docs: { description: { story: 'Pick the type in the controls: each one has its icon.' } } },
    render: (args) => (
        <Frame>
            <MessagePage {...args}>
                <MessagePageTitle>No matching items found.</MessagePageTitle>
                <MessagePageSubtitle>Check the filter settings or the search term.</MessagePageSubtitle>
            </MessagePage>
        </Frame>
    )
};

export const Filter: Story = {
    render: () => (
        <Frame>
            <MessagePage type="filter">
                <MessagePageTitle>No matching items found.</MessagePageTitle>
                <MessagePageSubtitle>Check the filter settings.</MessagePageSubtitle>
            </MessagePage>
        </Frame>
    )
};

export const Search: Story = {
    render: () => (
        <Frame>
            <MessagePage type="search">
                <MessagePageTitle>No matching items found.</MessagePageTitle>
            </MessagePage>
        </Frame>
    )
};

export const NoItems: Story = {
    name: 'No items',
    render: () => (
        <Frame>
            <MessagePage type="no-items">
                <MessagePageTitle>No items are currently available.</MessagePageTitle>
            </MessagePage>
        </Frame>
    )
};

export const ErrorPage: Story = {
    name: 'Error',
    render: () => (
        <Frame>
            <MessagePage type="error">
                <MessagePageTitle>Sorry, we can’t find this page.</MessagePageTitle>
                <MessagePageSubtitle>
                    <Link href="#">Home Page</Link>
                </MessagePageSubtitle>
            </MessagePage>
        </Frame>
    )
};

export const CustomIcon: Story = {
    name: 'Custom icon and no icon',
    parameters: {
        docs: { description: { story: '`glyph` replaces the icon of the type; `hasIcon={false}` hides it.' } }
    },
    render: () => (
        <div className="grid h-[24rem] grid-cols-2 gap-4">
            <MessagePage glyph="retail-store">
                <MessagePageTitle>The store is closed.</MessagePageTitle>
                <MessagePageMore>
                    <Button label="Show details" />
                </MessagePageMore>
            </MessagePage>
            <MessagePage hasIcon={false}>
                <MessagePageTitle>Sorry, we can’t find this page.</MessagePageTitle>
            </MessagePage>
        </div>
    )
};

export const Primary: Story = {
    parameters: {
        docs: { description: { story: "fundamental-react's API: the `title` prop renders the title." } }
    },
    render: () => (
        <Frame>
            <MessagePage title="No items found." />
        </Frame>
    )
};

export const Complex: Story = {
    parameters: {
        docs: {
            description: {
                story: "fundamental-react's API: `title`, `subtitle`, `actions` and `more` props render the parts, `glyph` the icon."
            }
        }
    },
    render: () => (
        <Frame>
            <MessagePage
                actions={<Button variant="emphasized" label="Try again" />}
                glyph="search"
                more={<Link href="#">More info</Link>}
                subtitle="Please try again."
                title="No items found."
            />
        </Frame>
    )
};

export const CustomImage: Story = {
    name: 'Custom image',
    parameters: {
        docs: { description: { story: '`image` replaces the icon with other content, e.g. an illustration.' } }
    },
    render: () => (
        <Frame>
            <MessagePage image={<img alt="Logo" src={LOGO} className="block h-24" />} title="No items found." />
        </Frame>
    )
};
