import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ObjectAttribute } from './object-attribute';

const heading = 'm-0 mt-6 mb-2 text-sap-font-header6-size font-sap-font-header-family text-sap-title-color first:mt-0';

const meta = {
    title: 'Components/Object Attribute',
    component: ObjectAttribute,
    parameters: {
        docs: {
            description: {
                component:
                    'Object attributes show a single-line property of an object, truncated with an ellipsis. The ' +
                    'value can be an action link.'
            }
        }
    },
    args: { label: 'Owner: ', linkText: 'Jane Doe', isLink: true, disabled: false }
} satisfies Meta<typeof ObjectAttribute>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// fundamental-styles' examples and texts first, then the Angular ones
export const Text: Story = {
    render: () => (
        <div>
            <ObjectAttribute label="Standard Object Attribute Text" />
            <h3 className={heading}>Label and value</h3>
            <ObjectAttribute label="Text placed inside attribute">: Checked</ObjectAttribute>
        </div>
    )
};

function ActionLink() {
    const [clicks, setClicks] = useState(0);
    return (
        <>
            <ObjectAttribute
                isLink
                label="Check"
                linkText="Notify action"
                onObjectAttributeClick={() => setClicks((c) => c + 1)}
            >
                :{' '}
            </ObjectAttribute>
            <p className="m-0 mt-1 text-sap-font-small-size text-sap-content-label-color">Clicked {clicks} times</p>
        </>
    );
}

export const Link: Story = {
    name: 'Link with an action',
    render: () => (
        <div>
            <ObjectAttribute isLink linkText="Text With Link" />
            <h3 className={heading}>Label and link</h3>
            <ActionLink />
        </div>
    )
};

export const DisabledLink: Story = {
    name: 'Disabled link',
    render: () => (
        <div>
            <ObjectAttribute isLink disabled linkText="Disabled Object Attribute linked Text" />
            <ObjectAttribute isLink disabled linkText="Navigate to home" />
        </div>
    )
};

export const Truncation: Story = {
    name: 'Truncation in a 120px container',
    render: () => (
        <div className="w-[120px]">
            <ObjectAttribute label="Truncate Very long Object Attribute Text" />
            <ObjectAttribute label="very very very very Looooooooooooooooooooooong Text" />
        </div>
    )
};
