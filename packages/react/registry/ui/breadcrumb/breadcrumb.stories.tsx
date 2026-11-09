import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Icon } from '@/ui/icon/icon';
import { Link } from '@/ui/link/link';
import { Breadcrumb, BreadcrumbItem, type BreadcrumbSeparatorStyle } from './breadcrumb';

const TEXT = 'm-0 font-sap-font-family text-sap-font-size text-sap-text-color';
/** The steps of the Angular stories (the first with a home icon). */
const STEPS = ['Home', 'Products', 'Computers', 'Laptops', 'Business laptops', 'Model 15 Pro'];
/** The steps of fundamental-styles' stories, for the visual comparison. */
const FS_STEPS = ['Products', 'Suppliers', 'Titanium', 'Ultra Portable', '12 inch', 'Super portable deluxe', 'Laptop'];

const meta = {
    title: 'Components/Breadcrumb',
    component: Breadcrumb,
    subcomponents: { BreadcrumbItem },
    parameters: {
        docs: {
            description: {
                component:
                    'A breadcrumb shows the path from the root to the current page (`aria-current="page"`). Items that ' +
                    'do not fit collapse into a menu at the start. The trail has one tab stop; the arrow keys move ' +
                    'between the visible links (mirrored in RTL). Resize the dashed box to collapse items.\n\n' +
                    '```tsx\n' +
                    '<Breadcrumb>\n' +
                    '    <BreadcrumbItem><Link href="/">Home</Link></BreadcrumbItem>\n' +
                    '    <BreadcrumbItem><span aria-current="page">Laptops</span></BreadcrumbItem>\n' +
                    '</Breadcrumb>\n' +
                    '```'
            }
        }
    },
    argTypes: {
        separatorStyle: {
            control: 'select',
            options: ['', 'backslash', 'double-slash', 'double-backslash', 'greater-than', 'double-greater-than']
        }
    }
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;

interface TrailProps {
    width?: string;
    separatorStyle?: BreadcrumbSeparatorStyle;
    reverse?: boolean;
    /** The last step is the current page (text); otherwise a link. */
    current?: boolean;
    ariaLabel?: string;
    steps?: string[];
    homeIcon?: boolean;
}

/** A trail in a resizable frame, with the collapsed count and the last navigation below (Angular's story host). */
function Trail({
    width = '100%',
    separatorStyle = '',
    reverse = false,
    current = true,
    ariaLabel = 'Breadcrumb trail',
    steps = STEPS,
    homeIcon = true
}: TrailProps) {
    const [hidden, setHidden] = useState(0);
    const [clicked, setClicked] = useState('');
    return (
        <div>
            <div
                className="resize-x overflow-hidden border border-dashed border-sap-group-content-border-color p-2"
                style={{ width }}
            >
                <Breadcrumb
                    ariaLabel={ariaLabel}
                    separatorStyle={separatorStyle}
                    reverse={reverse}
                    onHiddenItemsCountChange={setHidden}
                >
                    {steps.map((step, i) => (
                        <BreadcrumbItem key={step}>
                            {i === steps.length - 1 && current ? (
                                <span aria-current="page">{step}</span>
                            ) : (
                                <Link
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setClicked(step);
                                    }}
                                >
                                    {i === 0 && homeIcon && <Icon glyph="home" />}
                                    {step}
                                </Link>
                            )}
                        </BreadcrumbItem>
                    ))}
                </Breadcrumb>
            </div>
            <p className={TEXT} aria-live="polite">
                {hidden} collapsed. {clicked ? `Navigated to ${clicked}` : ''}
            </p>
        </div>
    );
}

export const Default: Story = {
    name: 'Breadcrumb',
    args: { separatorStyle: '', reverse: false },
    render: ({ separatorStyle, reverse }) => <Trail separatorStyle={separatorStyle} reverse={reverse} />
};

export const Separators: Story = {
    name: 'Separator styles',
    render: () => (
        <div className="flex flex-col gap-2">
            <Trail steps={FS_STEPS} homeIcon={false} ariaLabel="Slash trail" />
            <Trail steps={FS_STEPS} homeIcon={false} separatorStyle="backslash" ariaLabel="Backslash trail" />
            <Trail steps={FS_STEPS} homeIcon={false} separatorStyle="double-slash" ariaLabel="Double slash trail" />
            <Trail
                steps={FS_STEPS}
                homeIcon={false}
                separatorStyle="double-backslash"
                ariaLabel="Double backslash trail"
            />
            <Trail steps={FS_STEPS} homeIcon={false} separatorStyle="greater-than" ariaLabel="Greater than trail" />
            <Trail
                steps={FS_STEPS}
                homeIcon={false}
                separatorStyle="double-greater-than"
                current={false}
                ariaLabel="Double greater than trail"
            />
        </div>
    )
};

/** fundamental-styles' Current Item story: the current page as text, or as a link with `aria-current="page"`. */
export const CurrentItem: Story = {
    name: 'Current item',
    render: () => (
        <div className="flex flex-col gap-2">
            {[true, false].map((text) => (
                <Breadcrumb key={String(text)} ariaLabel={text ? 'Current page as text' : 'Current page as link'}>
                    {FS_STEPS.map((step, i) => (
                        <BreadcrumbItem key={step}>
                            {i < FS_STEPS.length - 1 ? (
                                <Link href="#">{step}</Link>
                            ) : text ? (
                                <span aria-current="page">{step}</span>
                            ) : (
                                <Link href="#" aria-current="page">
                                    {step}
                                </Link>
                            )}
                        </BreadcrumbItem>
                    ))}
                </Breadcrumb>
            ))}
        </div>
    )
};

/** The items that collapse wait for a resize observation; wait for it, so that axe does not scan a changing DOM. */
const collapsed = async (canvasElement: HTMLElement, count: number) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-breadcrumb-more]')).toHaveLength(count));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
};

export const Overflow: Story = {
    name: 'Collapsed items',
    render: () => (
        <div className="flex flex-col gap-2">
            <Trail width="22rem" />
            <Trail width="22rem" reverse ariaLabel="Reversed trail" />
        </div>
    ),
    play: async ({ canvasElement }) => collapsed(canvasElement, 2)
};

export const OpenOverflow: Story = {
    name: 'Open: collapsed items',
    tags: ['!autodocs'],
    render: () => <Trail width="22rem" />,
    play: async ({ canvasElement }) => {
        await collapsed(canvasElement, 1);
        const more = canvasElement.querySelector<HTMLElement>('[data-breadcrumb-more]')!;
        await userEvent.click(more);
        await waitFor(() => expect(more.getAttribute('aria-expanded')).toBe('true'));
        await waitFor(() => expect(document.querySelector('[role=menuitem]')).not.toBeNull());
    }
};

/** fundamental-react's Primary and "With url property" stories: three links. */
export const Primary: Story = {
    name: 'Links (fundamental-react)',
    render: () => (
        <Breadcrumb>
            {[1, 2, 3].map((i) => (
                <BreadcrumbItem key={i}>
                    <Link href="#">Link Text</Link>
                </BreadcrumbItem>
            ))}
        </Breadcrumb>
    )
};
