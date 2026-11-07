import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, type ReactNode } from 'react';
import { InfoLabel, type InfoLabelColor } from './info-label';

const COLORS: InfoLabelColor[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** One label per accent colour, inline and separated by spaces as in fundamental-styles' stories. */
function row(label: (c: InfoLabelColor) => ReactNode) {
    return COLORS.map((c) => <Fragment key={c}>{label(c)} </Fragment>);
}

const meta = {
    title: 'Components/Info Label',
    component: InfoLabel,
    parameters: {
        docs: {
            description: {
                component:
                    'Info labels highlight a status, category or count. They are not interactive and come in ten accent ' +
                    'colours. A hidden text ("Info Label") tells screen reader users what they are.'
            }
        }
    },
    argTypes: {
        color: { control: { type: 'number', min: 1, max: 10 } },
        type: { control: 'select', options: [undefined, 'numeric', 'icon'] },
        glyph: { control: 'text' }
    },
    args: { children: 'Default', color: 7, display: false, srText: 'Info Label' }
} satisfies Meta<typeof InfoLabel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Colors: Story = {
    name: 'Accent colors',
    parameters: { docs: { description: { story: 'Ten accent colours; 7 is the default.' } } },
    render: () => (
        <div>
            {row((c) => (
                <InfoLabel color={c}>{`color ${c}`}</InfoLabel>
            ))}
        </div>
    )
};

export const WithIcon: Story = {
    name: 'With icon',
    parameters: {
        docs: {
            description: {
                story: 'A glyph before the text; the icon is decorative. Without text, give an `aria-label`.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col items-start gap-4">
            <div>
                {row((c) => (
                    <InfoLabel type="icon" glyph="dark-mode" color={c}>
                        {`Color ${c}`}
                    </InfoLabel>
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
                <InfoLabel type="icon" glyph="add-activity-2">
                    add-activity-2
                </InfoLabel>
                <InfoLabel type="icon" glyph="bar-code">
                    bar-code
                </InfoLabel>
                <InfoLabel type="icon" glyph="hide">
                    hide
                </InfoLabel>
                <InfoLabel type="icon" glyph="key">
                    key
                </InfoLabel>
                <InfoLabel type="icon" glyph="upload-to-cloud" aria-label="Upload to cloud" />
            </div>
            <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                    <InfoLabel key={c} type="icon" glyph="component" font="BusinessSuiteInAppSymbols" color={c}>
                        {`With icon ${c}`}
                    </InfoLabel>
                ))}
            </div>
        </div>
    )
};

export const Numeric: Story = {
    parameters: {
        docs: { description: { story: 'Counts and numbers; a `title` explains what the number means.' } }
    },
    render: () => (
        <div className="flex flex-wrap gap-2">
            <InfoLabel type="numeric">1</InfoLabel>
            <InfoLabel type="numeric">10000</InfoLabel>
            <InfoLabel type="numeric" color={1} title="Total Items">
                6
            </InfoLabel>
            <InfoLabel type="numeric" color={2} title="Users Count">
                42k
            </InfoLabel>
            <InfoLabel type="numeric" color={3} title="Average Rating">
                14.7
            </InfoLabel>
            <InfoLabel type="icon" glyph="employee" color={6} aria-label="Employee" />
        </div>
    )
};

export const Display: Story = {
    name: 'Display size',
    parameters: {
        docs: { description: { story: '`display`: the smaller variant for display contexts such as tables.' } }
    },
    render: () => (
        <div>
            {row((c) => (
                <InfoLabel display color={c}>
                    {`color ${c}`}
                </InfoLabel>
            ))}
            <br />
            <br />
            {row((c) => (
                <InfoLabel display type="icon" glyph="dark-mode" color={c}>
                    {`Color ${c}`}
                </InfoLabel>
            ))}
        </div>
    )
};
