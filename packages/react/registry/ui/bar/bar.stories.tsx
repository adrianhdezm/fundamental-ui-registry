import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Avatar } from '@/ui/avatar/avatar';
import { Button } from '@/ui/button/button';
import { Input } from '@/ui/input/input';
import { Title } from '@/ui/title/title';
import { Bar, BarElement, BarLeft, BarMiddle, BarRight, ButtonBar, type BarDesign, type BarProps } from './bar';

const COL = 'flex flex-col gap-8';
const LABEL = 'm-0 mb-2 text-sap-font-small-size text-sap-content-label-color';

function Labelled({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <p className={LABEL}>{label}</p>
            {children}
        </div>
    );
}

/** The Angular example: back button and texts in the three areas, an avatar at the end. */
function Sections(props: BarProps) {
    return (
        <Bar {...props}>
            <BarLeft>
                <ButtonBar aria-label="Back" glyph="navigation-left-arrow" />
                <BarElement>Left Section</BarElement>
            </BarLeft>
            <BarMiddle>
                <BarElement>Middle Section</BarElement>
            </BarMiddle>
            <BarRight>
                <BarElement>Right Section</BarElement>
                <BarElement>
                    <Avatar size="xs" label="John Doe" image="assets/person.svg" />
                </BarElement>
            </BarRight>
        </Bar>
    );
}

interface ExampleProps {
    design?: BarDesign;
    /** A title (default) or navigation buttons at the start. */
    start?: 'title' | 'back-home' | 'back-home-account';
    /** A text element after the start. */
    text?: string;
    /** Without the middle area. */
    noMiddle?: boolean;
    /** Compact buttons, as some fundamental-react and fundamental-styles examples. */
    compact?: boolean;
    'aria-label'?: string;
}

/**
 * fundamental-react's and fundamental-styles' bar: a title or navigation buttons at the start, a group of buttons
 * in the middle, an avatar and a products button at the end.
 */
function Example({ design, start = 'title', text, noMiddle = false, compact = false, ...props }: ExampleProps) {
    const density = compact ? 'compact' : undefined;
    return (
        <Bar barDesign={design} aria-label={props['aria-label'] ?? 'Bar'}>
            <BarLeft data-density={density}>
                {start === 'title' ? (
                    <BarElement>
                        <Title level={5}>TEXT</Title>
                    </BarElement>
                ) : (
                    <>
                        <ButtonBar glyph="navigation-left-arrow" aria-label="Back" />
                        <ButtonBar glyph="home" aria-label="Home" />
                        {start === 'back-home-account' && <ButtonBar glyph="account" aria-label="Account" />}
                    </>
                )}
                {text && <BarElement>{text}</BarElement>}
            </BarLeft>
            {!noMiddle && (
                <BarMiddle data-density={density}>
                    <BarElement>
                        <div className="flex" role="group" aria-label="Devices">
                            <Button glyph="email" aria-label="Email" toggled />
                            <Button glyph="iphone" aria-label="Phone" />
                            <Button glyph="notification-2" aria-label="Notifications" />
                        </div>
                    </BarElement>
                </BarMiddle>
            )}
            <BarRight data-density={density}>
                <BarElement>
                    <Avatar circle size="xs" label="John Doe" />
                </BarElement>
                <ButtonBar glyph="grid" aria-label="Products" />
            </BarRight>
        </Bar>
    );
}

/** A subheader with a full width field in the middle. */
function FieldSubheader() {
    return (
        <Bar barDesign="subheader" aria-label="Subheader">
            <BarMiddle>
                <BarElement fullWidth>
                    <Input data-density="compact" defaultValue="1234568910" aria-label="Search term" />
                </BarElement>
            </BarMiddle>
        </Bar>
    );
}

/** Save and Cancel at the end of a footer. */
function FooterActions({ compact = false }: { compact?: boolean }) {
    return (
        <BarRight data-density={compact ? 'compact' : undefined}>
            <ButtonBar variant="emphasized" label="Save" />
            <ButtonBar label="Cancel" />
        </BarRight>
    );
}

type PlaygroundArgs = Pick<BarProps, 'barDesign' | 'inPage' | 'inHomePage' | 'size' | 'clear'>;

const meta: Meta<PlaygroundArgs> = {
    title: 'Components/Bar',
    component: Bar,
    parameters: {
        docs: {
            description: {
                component:
                    'Bars hold titles and actions in left, middle and right areas. They serve as headers, subheaders and ' +
                    'footers of pages, dialogs and popovers.'
            }
        }
    },
    argTypes: {
        barDesign: {
            control: 'select',
            options: [null, 'header', 'subheader', 'header-with-subheader', 'footer', 'floating-footer']
        },
        size: { control: 'select', options: [null, 's', 'm_l', 'xl'] }
    },
    args: { barDesign: 'header', inPage: false, inHomePage: false, clear: false, size: null }
};
export default meta;
type Story = StoryObj<PlaygroundArgs>;

export const Playground: Story = {
    render: (args) => <Sections {...args} aria-label="Playground bar" />
};

export const Default: Story = {
    name: 'Default',
    render: () => (
        <div className={COL}>
            <Example />
            <Example start="back-home-account" />
        </div>
    )
};

export const Designs: Story = {
    render: () => (
        <div className={COL}>
            <Labelled label="Default">
                <Sections aria-label="Default bar" />
            </Labelled>
            <Labelled label="Title">
                <Bar aria-label="Bar with title">
                    <BarLeft>
                        <BarElement>
                            <Title level={5}>Title</Title>
                        </BarElement>
                    </BarLeft>
                    <BarRight>
                        <ButtonBar glyph="action-settings" aria-label="Settings" />
                    </BarRight>
                </Bar>
            </Labelled>
            <Labelled label="Header">
                <Sections barDesign="header" aria-label="Header bar" />
            </Labelled>
            <Labelled label="Header with subheader">
                <Bar barDesign="header-with-subheader" aria-label="Header with subheader">
                    <BarLeft>
                        <BarElement>Left Section</BarElement>
                    </BarLeft>
                    <BarMiddle>
                        <BarElement>Middle Section</BarElement>
                    </BarMiddle>
                    <BarRight>
                        <BarElement>Right Section</BarElement>
                    </BarRight>
                </Bar>
                <Bar barDesign="subheader" aria-label="Subheader">
                    <BarMiddle>
                        <BarElement fullWidth>Middle section with a full width element</BarElement>
                    </BarMiddle>
                </Bar>
            </Labelled>
            <Labelled label="Footer">
                <Bar barDesign="footer" aria-label="Footer">
                    <FooterActions />
                </Bar>
            </Labelled>
        </div>
    )
};

export const Header: Story = {
    render: () => <Example design="header" start="back-home" text="Header Text" aria-label="Header" />
};

export const Subheader: Story = {
    render: () => (
        <div className={COL}>
            <Example design="subheader" start="back-home" noMiddle compact aria-label="Subheader" />
            <Labelled label="Full width element">
                <FieldSubheader />
            </Labelled>
        </div>
    )
};

export const HeaderWithSubheader: Story = {
    name: 'Header with subheader',
    render: () => (
        <div>
            <Example design="header-with-subheader" start="back-home-account" compact aria-label="Header" />
            <FieldSubheader />
        </div>
    )
};

export const Footer: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Compact buttons, as in the fundamental-react and fundamental-styles examples.'
            }
        }
    },
    render: () => (
        <Bar barDesign="footer" aria-label="Footer">
            <BarLeft>
                <BarElement>Footer Text</BarElement>
            </BarLeft>
            <FooterActions compact />
        </Bar>
    )
};

export const FloatingFooter: Story = {
    name: 'Floating footer',
    render: () => (
        <div className={COL}>
            <div className="relative h-48 overflow-hidden rounded-sap-element-border-corner-radius bg-sap-background-color">
                <p className="m-4 text-sap-text-color">Page content</p>
                <Bar barDesign="floating-footer" aria-label="Floating footer">
                    <FooterActions />
                </Bar>
            </div>
            <Labelled label="In a home page, size xl">
                <div className="relative h-48 overflow-hidden rounded-sap-element-border-corner-radius bg-sap-background-color">
                    <Bar barDesign="floating-footer" inHomePage size="xl" aria-label="Floating footer in a home page">
                        <FooterActions compact />
                    </Bar>
                </div>
            </Labelled>
        </div>
    )
};

export const PageSizes: Story = {
    name: 'In page, responsive paddings',
    render: () => (
        <div className={COL}>
            {(['s', 'm_l', 'xl'] as const).map((size) => (
                <Labelled key={size} label={`Size ${size}`}>
                    <Bar inPage size={size} aria-label={`Page bar ${size}`}>
                        <BarLeft>
                            <BarElement>Left Section</BarElement>
                        </BarLeft>
                        <BarRight>
                            <ButtonBar label="Action" />
                        </BarRight>
                    </Bar>
                </Labelled>
            ))}
            <Labelled label="Home page, size s">
                <Bar inHomePage size="s" aria-label="Home page bar s">
                    <BarLeft>
                        <BarElement>Left Section</BarElement>
                    </BarLeft>
                    <BarRight>
                        <ButtonBar label="Action" />
                    </BarRight>
                </Bar>
            </Labelled>
        </div>
    )
};

export const Density: Story = {
    name: 'Cozy and compact',
    parameters: {
        docs: {
            description: {
                story:
                    'Compact density is `data-density="compact"` on the bar or an ancestor; `data-density="cozy"` ' +
                    'keeps a bar cozy inside a compact page.'
            }
        }
    },
    render: () => (
        <div className={COL}>
            <Labelled label="Cozy">
                <div data-density="cozy">
                    <Example />
                </div>
            </Labelled>
            <Labelled label="Compact">
                <div data-density="compact">
                    <Example />
                </div>
            </Labelled>
        </div>
    )
};

/** A neutral placeholder logo. */
const LOGO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'><rect width='60' height='30' rx='4' fill='%230070f2'/><text x='30' y='20' font-family='Arial' font-size='13' font-weight='bold' fill='white' text-anchor='middle'>ACME</text></svg>";

export const CustomShellbar: Story = {
    name: 'Custom shellbar',
    parameters: {
        docs: {
            description: {
                story:
                    'A plain bar on the shell colour, composed like a shellbar: a search field on the left, a logo ' +
                    'link in the middle, and a cart button and an avatar on the right.'
            }
        }
    },
    render: () => (
        <Bar className="[--bar-bg:var(--sapShellColor)] [--bar-px:2rem]" aria-label="Custom Shellbar">
            <BarLeft>
                <BarElement>
                    <Input data-density="compact" type="search" aria-label="Search" placeholder="Type some text..." />
                </BarElement>
            </BarLeft>
            <BarMiddle>
                <BarElement>
                    <a href="#" className="flex" aria-label="Home" onClick={(event) => event.preventDefault()}>
                        <img className="block h-8" src={LOGO} alt="" />
                    </a>
                </BarElement>
            </BarMiddle>
            <BarRight>
                <BarElement>
                    <Button glyph="cart" aria-label="Add to Cart" title="Add to Cart" />
                </BarElement>
                <BarElement>
                    <Avatar circle size="xs" colorAccent={1} label="Jane Doe" />
                </BarElement>
            </BarRight>
        </Bar>
    )
};
