import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { StatusIndicator } from './status-indicator';

const CEREAL = [
    'M14.664,29.825c-0.133,0-0.217-0.004-0.236-0.005l-0.202-0.01l-0.032-0.2c-0.021-0.137-0.515-3.368,1.238-5.323c1.754-1.954,5.02-1.814,5.158-1.806l0.202,0.01l0.032,0.2c0.021,0.137,0.516,3.368-1.238,5.323C18.082,29.69,15.467,29.825,14.664,29.825z',
    'M13.626,25.116c-0.803,0-3.417-0.135-4.922-1.811c-1.753-1.955-1.26-5.186-1.238-5.322l0.032-0.2l0.202-0.01c0.14-0.004,3.404-0.148,5.158,1.806l0,0c1.754,1.955,1.26,5.186,1.238,5.323l-0.032,0.2l-0.202,0.01C13.843,25.112,13.759,25.116,13.626,25.116z',
    'M15.337,21.752c-0.133,0-0.217-0.004-0.236-0.005l-0.202-0.01l-0.032-0.2c-0.021-0.137-0.515-3.368,1.238-5.323c1.754-1.954,5.018-1.813,5.158-1.806l0.202,0.01l0.032,0.2c0.021,0.137,0.516,3.368-1.238,5.323C18.755,21.617,16.14,21.752,15.337,21.752z',
    'M13.626,17.432c-0.803,0-3.417-0.135-4.922-1.811c-1.753-1.955-1.26-5.186-1.238-5.322l0.032-0.2l0.202-0.01c0.14-0.005,3.404-0.148,5.158,1.806l0,0c1.754,1.955,1.26,5.186,1.238,5.323l-0.032,0.2l-0.202,0.01C13.843,17.428,13.759,17.432,13.626,17.432z',
    'M15.337,14.068c-0.133,0-0.217-0.004-0.236-0.005l-0.202-0.01l-0.032-0.2c-0.021-0.137-0.515-3.368,1.238-5.323c1.754-1.954,5.018-1.814,5.158-1.806l0.202,0.01l0.032,0.2c0.021,0.137,0.516,3.368-1.238,5.323C18.755,13.933,16.14,14.068,15.337,14.068z',
    'M13.107,10.54l-0.164-0.119c-0.112-0.081-2.747-2.017-2.889-4.64c-0.143-2.623,2.268-4.832,2.37-4.924l0.15-0.136l0.164,0.119c0.112,0.081,2.746,2.017,2.888,4.64c0.143,2.623-2.267,4.832-2.369,4.924L13.107,10.54z'
];
const EURO = [
    'M13,0.5c-6.6,0-12,5.4-12,12s5.4,12,12,12s12-5.4,12-12S19.6,0.5,13,0.5z M16.4,10.1L15.9,12h-5.3v0.3H16l-0.5,1.9h-4.6c0.5,1.3,1.6,2,3.1,2c0.8,0,1.5-0.2,2.2-0.7l0.7-0.6v2.7l-0.1,0.1c-0.9,0.4-1.8,0.6-2.6,0.6c-1.6,0-2.9-0.3-3.8-1c-0.9-0.7-1.5-1.7-2-3H6.4l0.5-1.9h1V12H6.4l0.5-1.9h1.3C8.6,8.9,9.3,8,10.3,7.3c1-0.8,2.3-1.1,3.8-1.1c1.1,0,2,0.2,2.8,0.7L17.3,7l-0.6,2.3l-0.5-0.4c-0.4-0.2-0.9-0.4-1.4-0.5c-0.6-0.1-1.1-0.1-1.7,0c-0.6,0.1-1,0.3-1.5,0.7c-0.3,0.3-0.6,0.6-0.7,1H16.4z'
];
const CART = [
    'M22.9,17.2c-1.7,0-3.2,1.2-3.5,2.8h-4.8c-0.4-1.6-1.8-2.8-3.6-2.8c-0.1,0-0.2,0-0.3,0l-0.5-1.7h16L30.5,5H7L5.8,1l0,0l0,0l0-0.1L5.6,0.9l-5-0.4l0.2,1.7l3.4,0.3l4.7,15.4c-0.9,0.7-1.5,1.7-1.5,2.9c0,2,1.6,3.7,3.7,3.7c1.7,0,3.2-1.2,3.6-2.8h4.8c0.4,1.6,1.8,2.8,3.5,2.8c2,0,3.7-1.6,3.7-3.7C26.6,18.8,24.9,17.2,22.9,17.2z'
];
const FACTORY = [
    'M19.6,12.9l0-3.7l-4.9,3.7V9.2l-5,3.9l-0.3,0l0-9.4H5.8v9.4H4.6V0.5H1l-0.3,24h23.6V9.3L19.6,12.9z M22.2,19.9H17v-2.4h5.2V19.9z'
];
const TRUCK = [
    'M44.2,13.1l-2.6-6.5c-0.1-0.2-0.6-1.9-2.2-1.9h-6V2.3c0-1-0.8-1.8-1.8-1.8H2.7c-1.1,0-1.9,0.9-1.9,1.9v18.4h3.3h0.5l0,0c0,2,1.6,3.7,3.7,3.7c2,0,3.7-1.6,3.7-3.7l0,0h0.5h0.6l0,0c0,2,1.6,3.7,3.7,3.7c2,0,3.7-1.6,3.7-3.7l0,0h9.1h2.9l0,0c0,2,1.6,3.7,3.7,3.7c2,0,3.7-1.6,3.7-3.7l0,0h4.5V13.1z'
];
const FLIGHT = [
    'M8.8,24.5C8.8,24.5,8.8,24.5,8.8,24.5c-0.1,0-0.2-0.1-0.2-0.1l-2.9-4.9l-0.2-0.2l-4.8-2.9c-0.1,0-0.1-0.1-0.1-0.2c0-0.1,0-0.1,0.1-0.2c0-0.1,0.9-1.2,1-1.4c0,0,0,0,0,0c0.1-0.1,0.2-0.1,0.2-0.1l4.7,1.6l5.5-6.7L2.3,2.8C2.2,2.7,2.2,2.6,2.2,2.5l0.6-1.1C2.9,1.3,3,1.2,3.1,1.3l12.4,4.8l3.5-3.4c0.9-0.8,1.8-1.4,2.7-1.8c0.2-0.1,0.4-0.1,0.5-0.2c0,0,1.1-0.4,1.8,0.3c0.7,0.7,0.3,1.7,0.3,1.8c-0.1,0.2-0.1,0.4-0.2,0.5c-0.4,0.9-1,1.8-1.8,2.7l-3.4,3.5l4.8,12.4c0,0.1,0,0.2-0.1,0.3l-1.1,0.6c-0.1,0.1-0.2,0-0.3-0.1l-6.7-9.8l-6.7,5.5l1.6,4.7c0,0.1,0,0.2-0.1,0.2c0,0,0,0,0,0c-0.1,0.1-1.3,1-1.4,1C8.9,24.5,8.8,24.5,8.8,24.5z'
];

const row = 'flex flex-wrap items-center gap-8';
const heading = 'm-0 mt-6 mb-2 font-sap-font-header-family text-sap-font-header6-size text-sap-title-color first:mt-0';

const meta = {
    title: 'Components/Status Indicator',
    component: StatusIndicator,
    parameters: {
        docs: {
            description: {
                component:
                    'Status indicators fill one or more SVG shapes to a percentage (linearly, at an angle or radially) and colour them by status. They are announced as progress bars.'
            }
        }
    },
    argTypes: {
        status: { control: 'select', options: [null, 'negative', 'critical', 'positive'] },
        size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
        labelSize: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
        fillingType: { control: 'select', options: ['lineardown', 'linearup', 'linearleft', 'angled', 'radial'] },
        fillDirection: { control: 'inline-radio', options: ['clockwise', 'counterclockwise'] },
        labelPosition: { control: 'select', options: [null, 'left', 'right', 'top', 'bottom'] },
        fillPercentage: { control: { type: 'range', min: 0, max: 100 } }
    },
    args: {
        path: CEREAL,
        viewBox: '0 0 24 31',
        status: 'positive',
        size: 'xl',
        fillPercentage: 40,
        fillingType: 'lineardown',
        statusLabel: '40%',
        labelPosition: 'right',
        labelSize: 'lg',
        'aria-label': 'Harvest progress'
    }
} satisfies Meta<typeof StatusIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const StatusAndSizes: Story = {
    name: 'Status and sizes',
    render: () => (
        <>
            <h3 className={heading}>Status</h3>
            <div className={row}>
                <StatusIndicator size="lg" path={EURO} viewBox="0 0 26 25" fillPercentage={35} aria-label="Neutral" />
                <StatusIndicator
                    size="lg"
                    status="negative"
                    path={EURO}
                    viewBox="0 0 26 25"
                    fillPercentage={35}
                    aria-label="Negative"
                />
                <StatusIndicator
                    size="lg"
                    status="critical"
                    path={CART}
                    viewBox="0 0 31 25"
                    fillPercentage={60}
                    aria-label="Critical"
                />
                <StatusIndicator
                    size="lg"
                    status="positive"
                    path={FACTORY}
                    viewBox="0 0 25 25"
                    fillPercentage={80}
                    aria-label="Positive"
                />
            </div>
            <h3 className={heading}>Sizes</h3>
            <div className={row}>
                {(
                    [
                        ['sm', 'Small'],
                        ['md', 'Medium'],
                        ['lg', 'Large'],
                        ['xl', 'Extra large']
                    ] as const
                ).map(([size, label]) => (
                    <StatusIndicator
                        key={size}
                        size={size}
                        status="positive"
                        path={TRUCK}
                        viewBox="0 0 45 25"
                        fillPercentage={50}
                        aria-label={label}
                    />
                ))}
            </div>
            <h3 className={heading}>Multiple shapes</h3>
            <div className={row}>
                <StatusIndicator
                    size="xl"
                    status="critical"
                    path={CEREAL}
                    viewBox="0 0 24 31"
                    fillPercentage={45}
                    aria-label="Six shapes, 45%"
                />
                <StatusIndicator
                    size="xl"
                    status="negative"
                    path={FLIGHT}
                    viewBox="0 0 25 25"
                    fillPercentage={70}
                    aria-label="Flight, 70%"
                />
            </div>
        </>
    )
};

/** fundamental-styles' Sizes example: the euro shape in the four sizes. */
export const Sizes: Story = {
    render: () => (
        <div className={row}>
            {(
                [
                    ['sm', 'negative', 35, 'small size'],
                    ['md', 'critical', 50, 'medium size'],
                    ['lg', 'positive', 80, 'large size'],
                    ['xl', null, 0, 'extra large size']
                ] as const
            ).map(([size, status, value, label]) => (
                <StatusIndicator
                    key={size}
                    size={size}
                    status={status}
                    path={EURO}
                    viewBox="0 0 26 25"
                    fillPercentage={value}
                    aria-label={`Euro status indicator, ${label}`}
                    title={`${value}% with ${label}`}
                    focusable
                />
            ))}
        </div>
    )
};

/** fundamental-styles' Fill values example: negative, critical and positive at 35, 60 and 100%. */
export const FillValues: Story = {
    name: 'Fill values',
    render: () => (
        <div className={row}>
            {(
                [
                    ['negative', 35],
                    ['critical', 60],
                    ['positive', 100]
                ] as const
            ).map(([status, value]) => (
                <StatusIndicator
                    key={status}
                    size="lg"
                    status={status}
                    path={EURO}
                    viewBox="0 0 26 25"
                    fillPercentage={value}
                    aria-label={`Euro status indicator with ${status} filling`}
                    focusable
                />
            ))}
        </div>
    )
};

/** The label on each side, with fundamental-styles' statuses and values; every indicator is focusable. */
export const Labels: Story = {
    render: () => (
        <div className={row}>
            {(
                [
                    ['top', 'critical'],
                    ['bottom', 'positive'],
                    ['left', 'critical'],
                    ['right', 'positive']
                ] as const
            ).map(([position, status]) => (
                <StatusIndicator
                    key={position}
                    size="lg"
                    labelSize="lg"
                    status={status}
                    path={EURO}
                    viewBox="0 0 26 25"
                    fillPercentage={100}
                    statusLabel="100%"
                    labelPosition={position}
                    aria-label={`Label ${position}`}
                    focusable
                />
            ))}
        </div>
    )
};

export const FillTypes: Story = {
    name: 'Linear, angled and radial filling',
    render: () => (
        <>
            <h3 className={heading}>Linear</h3>
            <div className={row}>
                {(
                    [
                        ['lineardown', 'Down'],
                        ['linearup', 'Up'],
                        ['linearleft', 'Left']
                    ] as const
                ).map(([type, label]) => (
                    <StatusIndicator
                        key={type}
                        size="xl"
                        status="positive"
                        path={EURO}
                        viewBox="0 0 26 25"
                        fillPercentage={40}
                        fillingType={type}
                        statusLabel={label}
                        labelPosition="bottom"
                        aria-label={`Linear ${label.toLowerCase()}`}
                    />
                ))}
            </div>
            <h3 className={heading}>Angled</h3>
            <div className={row}>
                {[45, 90, 180, 270].map((angle) => (
                    <StatusIndicator
                        key={angle}
                        size="xl"
                        status="critical"
                        path={EURO}
                        viewBox="0 0 26 25"
                        fillPercentage={50}
                        fillingType="angled"
                        angle={angle}
                        statusLabel={`${angle}°`}
                        labelPosition="bottom"
                        aria-label={`Angled ${angle} degrees`}
                    />
                ))}
            </div>
            <h3 className={heading}>Radial</h3>
            <div className={row}>
                <StatusIndicator
                    size="xl"
                    status="negative"
                    path={EURO}
                    viewBox="0 0 26 25"
                    fillPercentage={40}
                    fillingType="radial"
                    statusLabel="Clockwise"
                    labelPosition="bottom"
                    aria-label="Radial clockwise"
                />
                <StatusIndicator
                    size="xl"
                    status="negative"
                    path={EURO}
                    viewBox="0 0 26 25"
                    fillPercentage={40}
                    fillingType="radial"
                    fillDirection="counterclockwise"
                    statusLabel="Counterclockwise"
                    labelPosition="bottom"
                    aria-label="Radial counterclockwise"
                />
                <StatusIndicator
                    size="xl"
                    status="negative"
                    path={CEREAL}
                    viewBox="0 0 24 31"
                    fillPercentage={40}
                    fillingType="radial"
                    statusLabel="Six shapes"
                    labelPosition="bottom"
                    aria-label="Radial six shapes"
                />
            </div>
        </>
    )
};

function ClickableDemo() {
    const [value, setValue] = useState(20);
    return (
        <StatusIndicator
            size="xl"
            status="positive"
            path={EURO}
            viewBox="0 0 26 25"
            clickable
            focusable
            role="button"
            aria-label="Add 20%"
            statusLabel={`${value}%`}
            labelPosition="right"
            labelSize="lg"
            fillPercentage={value}
            onClick={() => setValue(value >= 100 ? 0 : value + 20)}
        />
    );
}

export const Clickable: Story = {
    parameters: {
        docs: {
            description: {
                story: 'A clickable, focusable indicator with the button role: click it, or press Enter or Space, to add 20%.'
            }
        }
    },
    render: () => <ClickableDemo />
};
