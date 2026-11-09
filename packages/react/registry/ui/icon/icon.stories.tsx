import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Icon, type IconFont } from './icon';
import { SAP_ICONS, SAP_ICONS_BUSINESS_SUITE, SAP_ICONS_TNT } from './icon-glyphs';

const COLORS = [
    'default',
    'contrast',
    'non-interactive',
    'tile',
    'marker',
    'critical',
    'negative',
    'neutral',
    'positive',
    'information'
] as const;

const meta = {
    title: 'Components/Icon',
    component: Icon,
    parameters: {
        docs: {
            description: {
                component:
                    'Icons from the SAP icon fonts (SAP-icons, SAP-icons-TNT and Business Suite). Icons are decorative ' +
                    'unless they get an `aria-label`, which gives them `role="img"`. Glyphs marked for mirroring flip in RTL.'
            }
        }
    },
    argTypes: {
        font: { control: 'inline-radio', options: ['SAP-icons', 'SAP-icons-TNT', 'BusinessSuiteInAppSymbols'] },
        size: { control: 'select', options: ['default', 'sm', 'md', 'lg', 'xl', 'xxl'] },
        color: { control: 'select', options: ['inherit', ...COLORS] },
        background: { control: 'select', options: ['none', ...COLORS] }
    },
    args: { glyph: 'accept', font: 'SAP-icons', size: 'md', color: 'default', background: 'none' }
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
    render: () => (
        <div className="flex items-end gap-6 text-sap-content-icon-color">
            {(['sm', 'md', 'lg', 'xl', 'xxl'] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                    <Icon glyph="cart" size={s} />
                    <span className="text-sap-font-small-size">{s}</span>
                </div>
            ))}
        </div>
    )
};

export const Colors: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
                {COLORS.map((c) => (
                    <div key={c} className="flex w-24 flex-col items-center gap-1">
                        <Icon glyph="da" size="md" color={c} />
                        <span className="text-sap-font-small-size">{c}</span>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap gap-4">
                {COLORS.map((c) => (
                    <div key={c} className="flex w-24 flex-col items-center gap-1">
                        <Icon glyph="da" size="md" background={c} />
                        <span className="text-sap-font-small-size">{c}</span>
                    </div>
                ))}
            </div>
        </div>
    )
};

export const Accessible: Story = {
    name: 'Accessible icon',
    render: () => (
        <p className="flex items-center gap-2">
            <Icon glyph="message-error" color="negative" aria-label="Error" />
            <span>
                An icon with <code>aria-label</code> is announced as an image named "Error".
            </span>
        </p>
    )
};

export const RTL: Story = {
    name: 'Mirroring in RTL',
    parameters: {
        docs: { description: { story: 'Switch Direction to RTL in the toolbar: directional glyphs flip.' } }
    },
    render: () => (
        <div className="flex gap-4 text-sap-content-icon-color">
            <Icon glyph="navigation-right-arrow" size="md" />
            <Icon glyph="nav-back" size="md" />
            <Icon glyph="arrow-right" size="md" />
            <Icon glyph="accept" size="md" />
        </div>
    )
};

function Gallery({ map, font }: { map: Readonly<Record<string, unknown>>; font: IconFont }) {
    const [filter, setFilter] = useState('');
    return (
        <>
            <input
                className="mb-4 h-sap-element-height w-72 rounded-sap-field-border-corner-radius border border-sap-field-border-color bg-sap-field-background px-2 text-sap-field-text-color"
                placeholder="Search icons"
                aria-label="Search icons"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2">
                {Object.keys(map)
                    .filter((g) => !filter || g.includes(filter))
                    .map((g) => (
                        <div
                            key={g}
                            className="flex flex-col items-center gap-2 rounded-sap-element-border-corner-radius bg-sap-tile-background p-3 text-center text-sap-content-icon-color"
                        >
                            <Icon glyph={g} font={font} size="md" />
                            <span
                                className="w-full truncate text-sap-font-small-size text-sap-content-label-color"
                                title={g}
                            >
                                {g}
                            </span>
                        </div>
                    ))}
            </div>
        </>
    );
}

export const SapIcons: Story = { name: 'All SAP-icons', render: () => <Gallery map={SAP_ICONS} font="SAP-icons" /> };
export const TntIcons: Story = {
    name: 'All SAP-icons-TNT',
    render: () => <Gallery map={SAP_ICONS_TNT} font="SAP-icons-TNT" />
};
export const BusinessSuiteIcons: Story = {
    name: 'All Business Suite icons',
    render: () => <Gallery map={SAP_ICONS_BUSINESS_SUITE} font="BusinessSuiteInAppSymbols" />
};
