import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
    title: 'Foundations',
    parameters: {
        docs: { description: { component: 'SAP Fiori visual foundations, rendered from the live theme tokens.' } }
    }
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const LABEL = 'w-48 shrink-0 text-sap-font-small-size text-sap-content-label-color';
const SAMPLE = 'The quick brown fox jumps over the lazy dog';

function Swatch({ token }: { token: string }) {
    return (
        <div className="flex items-center gap-3">
            <span
                className="size-10 shrink-0 rounded-sap-element-border-corner-radius border border-sap-group-content-border-color"
                style={{ background: `var(${token})` }}
            />
            <code className="text-sap-font-small-size text-sap-content-label-color">{token}</code>
        </div>
    );
}

function Group({ title, tokens }: { title: string; tokens: string[] }) {
    return (
        <section className="mb-6">
            <h3 className="mb-3 font-sap-font-header-family text-sap-font-header5-size text-sap-title-color">
                {title}
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-3">
                {tokens.map((token) => (
                    <Swatch key={token} token={token} />
                ))}
            </div>
        </section>
    );
}

export const Colors: Story = {
    render: () => (
        <>
            <Group
                title="Base"
                tokens={[
                    '--sapBrandColor',
                    '--sapHighlightColor',
                    '--sapBaseColor',
                    '--sapShellColor',
                    '--sapBackgroundColor',
                    '--sapTextColor',
                    '--sapTitleColor',
                    '--sapLinkColor',
                    '--sapHoverColor',
                    '--sapActiveColor',
                    '--sapSelectedColor'
                ]}
            />
            <Group
                title="Semantic"
                tokens={[
                    '--sapNegativeColor',
                    '--sapCriticalColor',
                    '--sapPositiveColor',
                    '--sapInformativeColor',
                    '--sapNeutralColor',
                    '--sapErrorBackground',
                    '--sapWarningBackground',
                    '--sapSuccessBackground',
                    '--sapInformationBackground',
                    '--sapNeutralBackground'
                ]}
            />
            <Group
                title="Elements"
                tokens={[
                    '--sapButton_Background',
                    '--sapButton_Emphasized_Background',
                    '--sapField_Background',
                    '--sapField_BorderColor',
                    '--sapGroup_ContentBackground',
                    '--sapList_Background',
                    '--sapContent_FocusColor',
                    '--sapContent_IconColor'
                ]}
            />
        </>
    )
};

const SIZES = ['Header1', 'Header2', 'Header3', 'Header4', 'Header5', 'Header6'];
const FAMILIES = [
    '--sapFontLightFamily',
    '--sapFontFamily',
    '--sapFontSemiboldDuplexFamily',
    '--sapFontBoldFamily',
    '--sapFontBlackFamily',
    '--sapContent_MonospaceFontFamily'
];

export const Typography: Story = {
    render: () => (
        <>
            <section className="mb-8 flex flex-col gap-2">
                {SIZES.map((size) => (
                    <div key={size} className="flex items-baseline gap-4">
                        <code className={LABEL}>--sapFont{size}Size</code>
                        <span
                            className="font-sap-font-header-family text-sap-title-color"
                            style={{ fontSize: `var(--sapFont${size}Size)` }}
                        >
                            Fiori for web
                        </span>
                    </div>
                ))}
                <div className="flex items-baseline gap-4">
                    <code className={LABEL}>--sapFontLargeSize</code>
                    <span className="text-sap-font-large-size">{SAMPLE}</span>
                </div>
                <div className="flex items-baseline gap-4">
                    <code className={LABEL}>--sapFontSize</code>
                    <span className="text-sap-font-size">{SAMPLE}</span>
                </div>
                <div className="flex items-baseline gap-4">
                    <code className={LABEL}>--sapFontSmallSize</code>
                    <span className="text-sap-font-small-size">{SAMPLE}</span>
                </div>
            </section>
            <section className="flex flex-col gap-2">
                {FAMILIES.map((family) => (
                    <div key={family} className="flex items-baseline gap-4">
                        <code className={LABEL}>{family}</code>
                        <span className="text-sap-font-large-size" style={{ fontFamily: `var(${family})` }}>
                            72 typeface — 0123456789
                        </span>
                    </div>
                ))}
            </section>
        </>
    )
};

export const Elevation: Story = {
    render: () => (
        <div className="flex flex-wrap gap-8 p-4">
            {['0', '1', '2', '3'].map((level) => (
                <div
                    key={level}
                    className="flex size-36 items-center justify-center rounded-sap-element-border-corner-radius bg-sap-group-content-background text-sap-font-small-size"
                    style={{ boxShadow: `var(--sapContent_Shadow${level})` }}
                >
                    --sapContent_Shadow{level}
                </div>
            ))}
        </div>
    )
};

export const Density: Story = {
    render: () => (
        <table className="border-collapse text-start">
            <tbody>
                <tr>
                    <th className="pe-6 text-start">Token</th>
                    <th className="pe-6 text-start">Cozy</th>
                    <th className="text-start">Compact</th>
                </tr>
                <tr>
                    <td className="pe-6">
                        <code>Element height</code>
                    </td>
                    <td className="pe-6">
                        <div className="h-sap-element-height w-24 rounded-sap-field-border-corner-radius bg-sap-informative-element-color" />
                    </td>
                    <td>
                        <div className="h-sap-element-compact-height w-24 rounded-sap-field-border-corner-radius bg-sap-informative-element-color" />
                    </td>
                </tr>
            </tbody>
        </table>
    )
};
