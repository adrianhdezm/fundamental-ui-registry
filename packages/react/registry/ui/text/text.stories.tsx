import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Text } from './text';

// fundamental-styles' texts
const LOREM =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore ' +
    'magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo ' +
    'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const MALESUADA =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore ' +
    'magna aliqua. Malesuada bibendum arcu vitae elementum. Ut etiam sit amet nisl. Laoreet suspendisse interdum ' +
    'consectetur libero id faucibus nisl. Tellus in metus vulputate eu scelerisque felis imperdiet proin fermentum. ' +
    'Ullamcorper morbi tincidunt ornare massa eget egestas purus viverra accumsan. Mauris vitae ultricies leo integer ' +
    'malesuada nunc vel risus. Nisi est sit amet facilisis. Eu turpis egestas pretium aenean. Nunc id cursus metus ' +
    'aliquam eleifend. Placerat in egestas erat imperdiet. Etiam dignissim diam quis enim lobortis scelerisque. A erat ' +
    'nam at lectus. Amet nisl purus in mollis nunc sed id. Purus semper eget duis at tellus at urna.';
const LONG =
    MALESUADA +
    ' Aliquet eget sit amet tellus cras adipiscing enim. Risus ultricies tristique nulla aliquet enim tortor. Varius ' +
    'quam quisque id diam vel quam elementum pulvinar. Eget aliquet nibh praesent tristique magna. Id interdum velit ' +
    'laoreet id donec ultrices tincidunt arcu. Suspendisse ultrices gravida dictum fusce ut placerat orci nulla. Montes ' +
    'nascetur ridiculus mus mauris vitae ultricies. In nisl nisi scelerisque eu. Suspendisse interdum consectetur ' +
    'libero id faucibus. Ut lectus arcu bibendum at varius. Placerat vestibulum lectus mauris ultrices eros in cursus ' +
    'turpis massa. Dolor magna eget est lorem ipsum dolor sit. Aliquam nulla facilisi cras fermentum odio eu feugiat ' +
    'pretium nibh. Augue neque gravida in fermentum et. Proin fermentum leo vel orci porta non pulvinar.';
const INDENTED =
    '\n    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididuntut labore et\n' +
    'dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut\n' +
    'aliquip ex ea commodo consequat.\n\n' +
    '    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore\n' +
    'eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia\n' +
    'deserunt mollit anim id est laborum.';
/** LOREM with fundamental-styles' soft hyphens (U+00AD). */
const SOFT =
    'Lorem ipsum dolor sit amet, con­sectetur adip­iscing el­it, sed do eiusmod tempor incididunt ut ' +
    'labore et do­lore magna aliqua. Ut enim ad mi­nim veniam, quis nostrud exer­citation ullamco ' +
    'laboris nisi ut aliquip ex ea commodo conse­quat. Duis aute irure dolor in repre­henderit in ' +
    'vo­luptate velit esse cillum dolore eu fu­giat nulla pari­atur. Excepteur sint occaecat ' +
    'cupidatat non pro­ident, sunt in culpa qui officia deserunt mollit anim id est la­bo­rum.';

const h = 'mt-4 mb-1 font-sap-font-header-family text-sap-font-header5-size text-sap-title-color first:mt-0';

const meta = {
    title: 'Components/Text',
    component: Text,
    parameters: {
        docs: {
            description: { component: 'Text shows paragraphs with an optional line limit and More/Less expansion.' }
        }
    },
    argTypes: {
        hyphenation: { control: 'select', options: [null, 'none', 'manual', 'auto'] },
        children: { control: 'text' }
    },
    args: {
        children: LONG,
        maxLines: 3,
        expandable: true,
        whitespaces: false,
        hyphenation: null,
        subline: false,
        moreLabel: 'More',
        lessLabel: 'Less'
    }
} satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Basic: Story = {
    render: () => (
        <div>
            <h3 className={h}>Long Text</h3>
            <Text>{LOREM}</Text>
            <h3 className={h}>Short Text</h3>
            <Text>Short text</Text>
        </div>
    )
};

export const MaxLines: Story = {
    name: 'Max lines',
    render: () => (
        <div>
            <h3 className={h}>No line limit</h3>
            <Text>{LONG}</Text>
            <h3 className={h}>Limited to 2 lines</h3>
            <Text maxLines={2}>{LONG}</Text>
            <h3 className={h}>Limited to 3 lines</h3>
            <Text maxLines={3}>{LONG}</Text>
        </div>
    )
};

function TwoWay() {
    const [collapsed, setCollapsed] = useState(true);
    return (
        <>
            <Text maxLines={3} expandable collapsed={collapsed} onCollapsedChange={setCollapsed}>
                {LONG}
            </Text>
            <p className="m-0 mt-1 font-sap-font-family text-sap-font-size text-sap-text-color">
                Current state: {collapsed ? 'Collapsed' : 'Expanded'}
            </p>
        </>
    );
}

export const Expandable: Story = {
    render: () => (
        <div>
            <h3 className={h}>Expandable text with 3 lines (collapsed by default)</h3>
            <Text maxLines={3} expandable>
                {LONG}
            </Text>
            <h3 className={h}>Expanded by default</h3>
            <Text maxLines={3} expandable defaultCollapsed={false}>
                {MALESUADA}
            </Text>
            <h3 className={h}>Expandable text with a controlled state</h3>
            <TwoWay />
            <h3 className={h}>Custom labels</h3>
            <Text maxLines={2} expandable moreLabel="Show more" lessLabel="Show less">
                {LONG}
            </Text>
        </div>
    )
};

export const Whitespaces: Story = {
    render: () => (
        <div>
            <h3 className={h}>Without whitespace preservation</h3>
            <Text>{INDENTED}</Text>
            <h3 className={h}>With whitespace preservation</h3>
            <Text whitespaces>{INDENTED}</Text>
        </div>
    )
};

export const Hyphenation: Story = {
    render: () => (
        <div lang="en">
            <div className="flex flex-wrap gap-[30px]">
                <div className="w-[300px]">
                    <h3 className={h}>Without hyphenation</h3>
                    <Text>{LOREM}</Text>
                </div>
                <div className="w-[300px]">
                    <h3 className={h}>Hyphenation</h3>
                    <Text hyphenation="auto">{SOFT}</Text>
                </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-6">
                <div className="w-36">
                    <h3 className={h}>None</h3>
                    <Text hyphenation="none">
                        Internationalization and localization are increasingly important for extraordinarily
                        comprehensive applications.
                    </Text>
                </div>
                <div className="w-36">
                    <h3 className={h}>Manual (soft hyphens)</h3>
                    <Text hyphenation="manual">
                        {
                            'Inter­national­ization and locali­zation are increasingly important for extra­ordinarily compre­hensive appli­cations.'
                        }
                    </Text>
                </div>
                <div className="w-36">
                    <h3 className={h}>Automatic</h3>
                    <Text hyphenation="auto">
                        Internationalization and localization are increasingly important for extraordinarily
                        comprehensive applications.
                    </Text>
                </div>
            </div>
        </div>
    )
};

export const Subline: Story = {
    render: () => (
        <div className="max-w-md">
            <h3 className={h}>Title</h3>
            <Text subline>{LOREM}</Text>
        </div>
    )
};
