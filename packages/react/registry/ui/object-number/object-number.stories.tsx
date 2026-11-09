import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { ObjectNumber, type ObjectNumberStatus } from './object-number';

// fundamental-styles' numbers, so the visual comparison can compare pixels
const ITEMS: { number: number; status: ObjectNumberStatus | null }[] = [
    { number: -2000, status: 'negative' },
    { number: 0, status: 'critical' },
    { number: 1000, status: 'positive' },
    { number: 100, status: 'informative' },
    { number: 999, status: null }
];

const Row = ({ children }: { children: ReactNode }) => (
    <div className="flex flex-wrap items-center gap-6">{children}</div>
);

const meta = {
    title: 'Components/Object Number',
    component: ObjectNumber,
    parameters: {
        // Horizon's inverted status colours are below 4.5:1 by design
        a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
        docs: {
            description: {
                component:
                    'Object numbers display a formatted number and its unit of measurement, coloured by value ' +
                    'state. They can be emphasized, large, inverted or interactive (a button). A hidden text ' +
                    'announces the value state.'
            }
        }
    },
    argTypes: { status: { control: 'select', options: [null, 'negative', 'critical', 'positive', 'informative'] } },
    args: {
        number: 1000.37,
        decimal: 2,
        unit: 'EUR',
        status: 'positive',
        emphasized: false,
        large: false,
        inverted: false,
        interactive: false
    }
} satisfies Meta<typeof ObjectNumber>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Status: Story = {
    render: () => (
        <Row>
            {ITEMS.map((i) => (
                <ObjectNumber key={i.number} number={i.number} unit="EUR" status={i.status} decimal={2} />
            ))}
        </Row>
    )
};

export const Emphasized: Story = {
    render: () => (
        <Row>
            {ITEMS.map((i) => (
                <ObjectNumber key={i.number} number={i.number} unit="EUR" status={i.status} decimal={2} emphasized />
            ))}
        </Row>
    )
};

export const Decimals: Story = {
    render: () => (
        <Row>
            <ObjectNumber number={2000} unit="EUR" status="negative" decimal={2} />
            <ObjectNumber number={0.446} unit="EUR" status="critical" decimal={3} />
            <ObjectNumber number={1000.3} unit="EUR" status="positive" decimal={1} />
            <ObjectNumber number={100.88} unit="EUR" status="informative" />
        </Row>
    )
};

export const Units: Story = {
    render: () => (
        <Row>
            <ObjectNumber number={2000} unit="EUR" />
            <ObjectNumber number={0} unit="USD" status="informative" />
            <ObjectNumber number={1500} locale="de-DE" decimal={2} unit="EUR" />
        </Row>
    )
};

export const Truncation: Story = {
    name: 'Truncation in a 100px container',
    render: () => (
        <div className="flex flex-col gap-2">
            <div className="w-[100px]">
                <ObjectNumber number={-2000} unit="EUR" status="negative" decimal={2} />
            </div>
            <div className="w-[100px]">
                <ObjectNumber number={3000} unit="Floating unit" status="negative" decimal={2} />
            </div>
            <div className="w-[100px]">
                <ObjectNumber number={500000234} unit="USD" status="negative" decimal={2} />
            </div>
        </div>
    )
};

export const Interactive: Story = {
    render: () => (
        <Row>
            {ITEMS.map((i) => (
                <ObjectNumber key={i.number} number={i.number} unit="EUR" status={i.status} decimal={2} interactive />
            ))}
        </Row>
    )
};

export const InteractiveEmphasized: Story = {
    name: 'Interactive emphasized',
    render: () => (
        <Row>
            {ITEMS.map((i, index) => (
                <ObjectNumber
                    key={i.number}
                    number={i.number}
                    unit="EUR"
                    status={i.status}
                    decimal={2}
                    interactive
                    emphasized={index % 2 === 0}
                />
            ))}
        </Row>
    )
};

export const Inverted: Story = {
    render: () => (
        <Row>
            {ITEMS.map((i) => (
                <ObjectNumber key={i.number} number={i.number} unit="EUR" status={i.status} decimal={2} inverted />
            ))}
        </Row>
    )
};

export const InvertedInteractive: Story = {
    name: 'Inverted interactive',
    render: () => (
        <Row>
            {ITEMS.map((i) => (
                <ObjectNumber
                    key={i.number}
                    number={i.number}
                    unit="EUR"
                    status={i.status}
                    decimal={2}
                    inverted
                    interactive
                />
            ))}
        </Row>
    )
};

export const Large: Story = {
    render: () => (
        <Row>
            {ITEMS.map((i) => (
                <ObjectNumber key={i.number} number={i.number} unit="EUR" status={i.status} decimal={2} large />
            ))}
        </Row>
    )
};
