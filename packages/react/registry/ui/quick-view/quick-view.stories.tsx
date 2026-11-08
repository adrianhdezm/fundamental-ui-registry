import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Avatar } from '@/ui/avatar/avatar';
import { ButtonBar } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle,
    DialogTrigger
} from '@/ui/dialog/dialog';
import { Link } from '@/ui/link/link';
import { Popover, PopoverBody, PopoverTrigger, popoverSurfaceVariants } from '@/ui/popover/popover';
import { Text } from '@/ui/text/text';
import {
    QuickView,
    QuickViewGroup,
    QuickViewGroupItem,
    QuickViewGroupItemContent,
    QuickViewGroupItemContentElement,
    QuickViewGroupItemLabel,
    QuickViewGroupTitle,
    QuickViewSubheader,
    QuickViewSubheaderSubtitle,
    QuickViewSubheaderTitle,
    QuickViewTitle,
    type QuickViewTitleAlign
} from './quick-view';

const meta = {
    title: 'Components/Quick View',
    component: QuickView,
    subcomponents: {
        QuickViewTitle,
        QuickViewSubheader,
        QuickViewSubheaderTitle,
        QuickViewSubheaderSubtitle,
        QuickViewGroup,
        QuickViewGroupTitle,
        QuickViewGroupItem,
        QuickViewGroupItemLabel,
        QuickViewGroupItemContent,
        QuickViewGroupItemContentElement
    },
    parameters: {
        docs: {
            description: {
                component:
                    'A quick view gives a short overview of a person, an object or a company: an optional header, a subheader with an avatar, and groups of label-value pairs. ' +
                    'Values in a `QuickViewGroupItemContentElement` are labelled by their label. Use it in a popover or a dialog.'
            }
        }
    }
} satisfies Meta<typeof QuickView>;
export default meta;
type Story = StoryObj<typeof meta>;

const LONG = ' Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio ipsam cupiditate voluptatibus et.';

interface Field {
    label: string;
    value: string;
    href?: string;
}

const DATA: {
    title: string;
    subHeader: { title: string; subtitle: string };
    groups: { title: string; items: Field[] }[];
} = {
    title: 'Employee',
    subHeader: { title: 'Ann Smith', subtitle: 'Senior sales manager' },
    groups: [
        {
            title: 'Contact details',
            items: [
                { label: 'Mobile', value: '+1 202 555 0175', href: 'tel:+12025550175' },
                { label: 'Phone', value: '+1 202 555 0123', href: 'tel:+12025550123' },
                { label: 'Email', value: 'ann.smith@example.com', href: 'mailto:ann.smith@example.com' }
            ]
        },
        {
            title: 'Company',
            items: [
                { label: 'Name', value: 'Example Corp.' },
                { label: 'Address', value: '481 West Street, Anytown 45066, USA' }
            ]
        }
    ]
};

interface EmployeeProps {
    withTitle?: boolean;
    align?: QuickViewTitleAlign;
    /** Appends a long text to every title and label, which wrap instead of truncating. */
    long?: boolean;
    className?: string;
}

/** The quick view of the Angular stories: an employee with contact details and company. */
function Employee({ withTitle = false, align = 'middle', long = false, className }: EmployeeProps) {
    const suffix = long ? LONG : '';
    return (
        <QuickView className={className}>
            {withTitle && (
                <QuickViewTitle align={align}>
                    {DATA.title}
                    {suffix}
                </QuickViewTitle>
            )}
            <QuickViewSubheader>
                <Avatar size="s" label={DATA.subHeader.title} />
                <QuickViewSubheaderTitle allowWrap={long}>
                    {DATA.subHeader.title}
                    {suffix}
                </QuickViewSubheaderTitle>
                <QuickViewSubheaderSubtitle allowWrap={long}>
                    {DATA.subHeader.subtitle}
                    {suffix}
                </QuickViewSubheaderSubtitle>
            </QuickViewSubheader>
            {DATA.groups.map((group) => (
                <QuickViewGroup key={group.title}>
                    <QuickViewGroupTitle allowWrap={long}>
                        {group.title}
                        {suffix}
                    </QuickViewGroupTitle>
                    {group.items.map((item) => (
                        <QuickViewGroupItem key={item.label}>
                            <QuickViewGroupItemLabel allowWrap={long}>
                                {item.label}
                                {suffix}
                            </QuickViewGroupItemLabel>
                            <QuickViewGroupItemContent>
                                {item.href ? (
                                    <QuickViewGroupItemContentElement render={<Link href={item.href} />}>
                                        {item.value}
                                    </QuickViewGroupItemContentElement>
                                ) : (
                                    <QuickViewGroupItemContentElement>{item.value}</QuickViewGroupItemContentElement>
                                )}
                            </QuickViewGroupItemContent>
                        </QuickViewGroupItem>
                    ))}
                </QuickViewGroup>
            ))}
        </QuickView>
    );
}

export const Playground: StoryObj<EmployeeProps> = {
    args: { withTitle: true, align: 'middle', long: false },
    argTypes: { align: { control: 'inline-radio', options: ['left', 'middle', 'right'] } },
    render: (args) => <Employee className="max-w-sm" {...args} />
};

export const Default: Story = {
    name: 'Quick view',
    render: () => <Employee className="max-w-sm" />
};

export const WithTitle: Story = {
    name: 'With header',
    render: () => <Employee className="max-w-sm" withTitle align="left" />
};

/** A popover with a header, one without, and a dialog. */
function Overlays() {
    return (
        <div className="flex flex-wrap gap-2">
            <Popover placement="right-start" noArrow={false}>
                <PopoverTrigger render={<Button label="Open in a popover" />} />
                <PopoverBody aria-label="Employee" maxWidth="37.5rem">
                    <Employee withTitle />
                </PopoverBody>
            </Popover>
            <Popover placement="right-start" noArrow={false}>
                <PopoverTrigger render={<Button label="Open without heading" />} />
                <PopoverBody aria-label="Employee" maxWidth="37.5rem">
                    <Employee />
                </PopoverBody>
            </Popover>
            <Dialog>
                <DialogTrigger render={<Button label="Open in a dialog" />} />
                <DialogPopup width="25rem" aria-label="Employee">
                    <DialogHeader>
                        {/* h4: the quick view below starts at heading level 5 */}
                        <DialogTitle level={4}>Employee</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Employee />
                    </DialogBody>
                    <DialogFooter>
                        <DialogClose render={<ButtonBar variant="emphasized" label="Close" />} />
                    </DialogFooter>
                </DialogPopup>
            </Dialog>
        </div>
    );
}

export const InOverlays: Story = {
    name: 'In a popover or a dialog',
    parameters: { docs: { story: { inline: false, iframeHeight: 560 } } },
    render: () => <Overlays />
};

export const LongTexts: Story = {
    name: 'Long texts',
    parameters: {
        docs: {
            description: {
                story: 'With `allowWrap`, the subheader title and subtitle, group titles and labels wrap instead of truncating. The header bar title still truncates.'
            }
        }
    },
    render: () => <Employee className="max-w-sm" withTitle long />
};

/** A label and a text or link value, as in fundamental-styles' examples. */
function Item({ label, href, children }: { label: string; href?: string; children: ReactNode }) {
    return (
        <QuickViewGroupItem>
            <QuickViewGroupItemLabel>{label}</QuickViewGroupItemLabel>
            <QuickViewGroupItemContent>
                <QuickViewGroupItemContentElement render={href ? <Link href={href} /> : <Text />}>
                    {children}
                </QuickViewGroupItemContentElement>
            </QuickViewGroupItemContent>
        </QuickViewGroupItem>
    );
}

function CompanySubheader({ glyph }: { glyph: string }) {
    return (
        <QuickViewSubheader>
            <Avatar size="s" glyph={glyph} />
            <QuickViewSubheaderTitle>Company B</QuickViewSubheaderTitle>
            <QuickViewSubheaderSubtitle>Michael Adams</QuickViewSubheaderSubtitle>
        </QuickViewSubheader>
    );
}

function Schedule() {
    return (
        <QuickViewGroup aria-label="Schedule">
            <Item label="Start Date:">01/01/2015</Item>
            <Item label="End Date:">31/12/2015</Item>
            <Item label="Occurrence:">Weekly</Item>
        </QuickViewGroup>
    );
}

export const Examples: Story = {
    name: 'Company examples',
    parameters: {
        docs: {
            description: {
                story:
                    "fundamental-styles' Popover, Without the header and Dialog examples, shown in place (the surface of a popover body and a dialog body): " +
                    'a company with contact details, and a schedule without group titles.'
            }
        }
    },
    render: () => (
        <div className="flex flex-wrap items-start gap-8 whitespace-nowrap">
            <div className={popoverSurfaceVariants()} role="dialog" aria-label="Company">
                <QuickView>
                    <QuickViewTitle>Company</QuickViewTitle>
                    <CompanySubheader glyph="building" />
                    <QuickViewGroup>
                        <QuickViewGroupTitle headingLevel={4}>Contact Details</QuickViewGroupTitle>
                        <Item label="Phone" href="tel:+16055555555">
                            +1 605 555 5555
                        </Item>
                        <Item label="Address">
                            781 Main Street <br />
                            Anytown, SD 57401, USA
                        </Item>
                    </QuickViewGroup>
                    <QuickViewGroup>
                        <QuickViewGroupTitle headingLevel={4}>Main Contact</QuickViewGroupTitle>
                        <Item label="Name">Michael Adams</Item>
                        <Item label="Mobile" href="tel:+16055555555">
                            +1 605 555 5555
                        </Item>
                        <Item label="Mobile" href="tel:+16055555556">
                            +1 605 555 5555
                        </Item>
                    </QuickViewGroup>
                </QuickView>
            </div>
            <div className={popoverSurfaceVariants()} role="dialog" aria-label="Company B">
                <QuickView>
                    <CompanySubheader glyph="camera" />
                    <Schedule />
                </QuickView>
            </div>
            <div className="w-[25rem]" role="dialog" aria-label="Company B">
                <DialogBody>
                    <QuickView>
                        <CompanySubheader glyph="camera" />
                        <Schedule />
                    </QuickView>
                </DialogBody>
            </div>
        </div>
    )
};

/** Clicks the button that opens the overlay and waits for the quick view inside it. */
async function openOverlay(canvasElement: HTMLElement, label: string): Promise<void> {
    await userEvent.click(within(canvasElement).getByRole('button', { name: label }));
    await waitFor(() => expect(document.querySelector('[role=dialog][data-open] [data-quick-view]')).not.toBeNull());
    const animated = [...document.querySelectorAll<HTMLElement>('[role=dialog], [data-dialog-backdrop]')];
    await Promise.all(animated.flatMap((el) => el.getAnimations().map((a) => a.finished)));
}

export const OpenPopover: Story = {
    name: 'Open: In a popover',
    tags: ['!autodocs'],
    render: () => <Overlays />,
    play: ({ canvasElement }) => openOverlay(canvasElement, 'Open in a popover')
};

export const OpenDialog: Story = {
    name: 'Open: In a dialog',
    tags: ['!autodocs'],
    render: () => <Overlays />,
    play: ({ canvasElement }) => openOverlay(canvasElement, 'Open in a dialog')
};
