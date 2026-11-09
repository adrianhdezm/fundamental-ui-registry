import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/ui/button/button';
import { Tab, TabList } from '@/ui/tabs/tabs';
import { Counter } from './counter';

const meta = {
    title: 'Components/Counter',
    component: Counter,
    parameters: {
        docs: {
            description: {
                component:
                    'Counters show a number, such as unread items, next to a text or an icon. The minimum value is 1; ' +
                    'above 999 show "999+". A hidden label ("Unread count") is read before the number.'
            }
        }
    },
    args: { children: '5', notification: false, counterLabel: 'Unread count' }
} satisfies Meta<typeof Counter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Standalone: Story = {
    parameters: { docs: { description: { story: 'Counter has a minimum value 1. Maximum display is 999+.' } } },
    render: () => (
        <div className="flex items-center gap-2">
            <Counter>5</Counter>
            <Counter>25</Counter>
            <Counter>101</Counter>
            <Counter>999+</Counter>
        </div>
    )
};

export const Inline: Story = {
    name: 'Inline with text',
    render: () => (
        <p className="font-sap-font-family text-sap-font-size text-sap-text-color">
            Lorem ipsum <Counter>5</Counter>
        </p>
    )
};

export const Notification: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'With `notification`, the counter moves up onto the icon it follows, e.g. in a transparent bell button. ' +
                    'The button name includes the visible count, so speech input users can say what they see.'
            }
        }
    },
    render: () => (
        <div className="flex items-center gap-2">
            {['1', '20', '300', '999+'].map((count) => (
                <Button key={count} glyph="bell" variant="transparent" aria-label={`Notifications, ${count} unread`}>
                    <Counter notification>{count}</Counter>
                </Button>
            ))}
        </div>
    )
};

export const Tabs: Story = {
    parameters: {
        docs: {
            description: {
                story: "A counter next to a tab's text, with the tab's `titleContent` (fundamental-styles' Tabs example)."
            }
        }
    },
    render: () => (
        <TabList ariaLabel="Mailbox" defaultValue="counter-selected">
            <Tab
                id="counter-link"
                titleContent={
                    <>
                        Link <Counter>25</Counter>
                    </>
                }
            >
                <p className="m-0 p-4 font-sap-font-family text-sap-font-size text-sap-text-color">Link content</p>
            </Tab>
            <Tab id="counter-selected" title="Selected">
                <p className="m-0 p-4 font-sap-font-family text-sap-font-size text-sap-text-color">Selected content</p>
            </Tab>
            <Tab id="counter-other" title="Link">
                <p className="m-0 p-4 font-sap-font-family text-sap-font-size text-sap-text-color">Other content</p>
            </Tab>
            <Tab id="counter-disabled" title="Disabled" disabled />
        </TabList>
    )
};
