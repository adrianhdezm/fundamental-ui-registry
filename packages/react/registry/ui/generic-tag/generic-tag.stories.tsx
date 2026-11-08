import type { Meta, StoryObj } from '@storybook/react-vite';
import { GenericTag } from './generic-tag';

const meta = {
    title: 'Components/Generic Tag',
    component: GenericTag,
    parameters: {
        docs: {
            description: {
                component:
                    'Generic tags show a key figure of an object (a name and a value) with an optional status, ' +
                    'typically in an object page header.'
            }
        }
    },
    argTypes: { type: { control: 'select', options: [null, 'error', 'success', 'warning', 'information'] } },
    args: { name: 'Product Cost', value: '3.5M EUR', type: null }
} satisfies Meta<typeof GenericTag>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// fundamental-styles' example and texts
export const Types: Story = {
    render: () => (
        <div>
            <GenericTag name="Product Cost" value="3.5M EUR" />
            <GenericTag type="error" name="Product Cost" value="3.5M EUR" />
            <GenericTag type="success" name="Product Cost" value="3.5M EUR" />
            <GenericTag type="information" name="Product Cost" value="3.5M EUR" />
            <GenericTag type="warning" name="Product Cost" value="3.5M EUR" ariaRoleDescription="Warning Generic Tag" />
        </div>
    )
};

// the Angular example
export const NamesAndValues: Story = {
    name: 'Names and values',
    render: () => (
        <div>
            <GenericTag type="error" name="Error" value="3.5M EUR" />
            <GenericTag type="success" name="Success" value="3.5M EUR" />
            <GenericTag type="information" name="Information" value="3.5M EUR" />
            <GenericTag type="warning" name="Name only" />
            <div className="w-48">
                <GenericTag name="Accumulated depreciation of fixed assets" value="12 days" />
            </div>
        </div>
    )
};
