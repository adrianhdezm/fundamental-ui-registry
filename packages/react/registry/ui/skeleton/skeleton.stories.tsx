import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './skeleton';

const row = 'flex flex-wrap items-start gap-4';
const heading = 'm-0 mt-6 mb-2 font-sap-font-header-family text-sap-font-header6-size text-sap-title-color first:mt-0';

const meta = {
    title: 'Components/Skeleton',
    component: Skeleton,
    parameters: {
        docs: {
            description: {
                component:
                    'Skeletons are shimmering placeholders shaped like the content that is still loading: rectangles, ' +
                    'circles, text lines or any SVG shapes passed as children.'
            }
        }
    },
    argTypes: {
        type: { control: 'select', options: [null, 'rectangle', 'circle', 'text'] },
        width: { control: 'text' },
        height: { control: 'text' }
    },
    args: { type: 'rectangle', width: '100px', height: '50px', animated: true, textLines: 3 }
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Types: Story = {
    render: () => (
        <>
            <h3 className={heading}>Rectangle</h3>
            <div className={row}>
                <Skeleton type="rectangle" width="100px" height="50px" />
                <Skeleton type="rectangle" width="100px" height="50px" animated={false} />
            </div>
            <h3 className={heading}>Circle (width or height is enough)</h3>
            <div className={row}>
                <Skeleton type="circle" width="50px" />
                <Skeleton type="circle" height="50px" animated={false} />
            </div>
            <h3 className={heading}>Text: 3 lines (default), 2 lines and 1 line</h3>
            <div className={row}>
                <Skeleton type="text" width="100px" />
                <Skeleton type="text" width="100px" animated={false} />
                <Skeleton type="text" width="100px" textLines={2} />
                <Skeleton type="text" width="100px" textLines={1} />
            </div>
        </>
    )
};

export const Custom: Story = {
    name: 'Custom shapes',
    render: () => (
        <Skeleton width="160px" height="110px">
            <circle cx="25" cy="25" r="25" />
            <rect x="60" y="0" width="100" height="16" rx="4" />
            <rect x="60" y="30" width="60" height="12" rx="4" />
            <rect x="0" y="60" width="160" height="8" rx="4" />
            <rect x="0" y="80" width="160" height="8" rx="4" />
            <rect x="0" y="100" width="100" height="8" rx="4" />
        </Skeleton>
    )
};
