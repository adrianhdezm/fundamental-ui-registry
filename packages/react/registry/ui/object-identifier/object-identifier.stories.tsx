import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Link } from '@/ui/link/link';
import { ObjectIdentifier } from './object-identifier';

// fundamental-styles' texts, so the visual comparison can compare pixels
const TITLE = 'NoteBook Basic 15';
const DESCRIPTION =
    'Notebook Basic 15 with 2,80 GHz quad core, 15" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro';
const ROWS = [
    { product: 'Notebook Basic 15', description: 'HT-1000', country: 'Germany', price: '956 EUR' },
    { product: 'Notebook Basic 17', description: 'HT-1001', country: 'Poland', price: '1,249 EUR' },
    { product: 'Notebook Basic 18', description: 'HT-1002', country: 'France', price: '1,570 EUR' }
];

const Column = ({ children }: { children: ReactNode }) => <div className="flex flex-col gap-8">{children}</div>;

const meta = {
    title: 'Components/Object Identifier',
    component: ObjectIdentifier,
    parameters: {
        docs: {
            description: {
                component:
                    'Object identifiers show the key identifier of an object as a title, optionally a link, with a ' +
                    'description below. A hidden text announces "Object Identifier"; a link in the title is named ' +
                    'by its text, that text and the description.'
            }
        }
    },
    args: { children: 'Title', description: 'Description', bold: false, medium: false }
} satisfies Meta<typeof ObjectIdentifier>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
    name: 'Title, bold and description',
    render: () => (
        <Column>
            <ObjectIdentifier>{TITLE}</ObjectIdentifier>
            <ObjectIdentifier bold>{TITLE}</ObjectIdentifier>
            <ObjectIdentifier description={DESCRIPTION}>{TITLE}</ObjectIdentifier>
            <ObjectIdentifier bold description={DESCRIPTION}>
                {TITLE}
            </ObjectIdentifier>
        </Column>
    )
};

export const WithLink: Story = {
    name: 'Title as link',
    render: () => (
        <Column>
            <ObjectIdentifier>
                <Link href="#">{TITLE}</Link>
            </ObjectIdentifier>
            <ObjectIdentifier bold>
                <Link href="#">{TITLE}</Link>
            </ObjectIdentifier>
            <ObjectIdentifier description={DESCRIPTION}>
                <Link href="#">{TITLE}</Link>
            </ObjectIdentifier>
            <ObjectIdentifier bold description={DESCRIPTION}>
                <Link href="#">{TITLE}</Link>
            </ObjectIdentifier>
        </Column>
    )
};

export const Medium: Story = {
    name: 'Medium size in a table',
    render: () => (
        <Column>
            <ObjectIdentifier medium description={DESCRIPTION}>
                {TITLE}
            </ObjectIdentifier>
            <table className="self-start border-collapse bg-sap-list-background text-start font-sap-font-family text-sap-font-size">
                <thead>
                    <tr className="border-b border-sap-list-border-color">
                        <th className="p-2 text-start font-normal text-sap-list-header-text-color">Product</th>
                        <th className="p-2 text-start font-normal text-sap-list-header-text-color">Country</th>
                        <th className="p-2 text-start font-normal text-sap-list-header-text-color">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {ROWS.map((row) => (
                        <tr key={row.product} className="border-b border-sap-list-border-color">
                            <td className="p-2">
                                <ObjectIdentifier medium description={row.description}>
                                    {row.product}
                                </ObjectIdentifier>
                            </td>
                            <td className="p-2 text-sap-list-text-color">{row.country}</td>
                            <td className="p-2 text-sap-list-text-color">{row.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Column>
    )
};
