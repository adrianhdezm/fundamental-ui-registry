import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Avatar } from '@/ui/avatar/avatar';
import { BusyIndicator } from '@/ui/busy-indicator/busy-indicator';
import { Button } from '@/ui/button/button';
import { Calendar, type FdCalendarView } from '@/ui/calendar/calendar';
import {
    IllustratedMessage,
    IllustratedMessageActions,
    IllustratedMessageFigcaption,
    IllustratedMessageText,
    IllustratedMessageTitle
} from '@/ui/illustrated-message/illustrated-message';
import { Link } from '@/ui/link/link';
import {
    List,
    ListByline,
    ListContent,
    ListIcon,
    ListItem,
    ListLink,
    ListSecondary,
    ListThumbnail,
    ListTitle
} from '@/ui/list/list';
import { Menu, MenuAddon, MenuItem, MenuPopup, MenuTitle, MenuTrigger } from '@/ui/menu/menu';
import { ObjectStatus } from '@/ui/object-status/object-status';
import { Skeleton } from '@/ui/skeleton/skeleton';
import { UNABLE_TO_LOAD } from '../../../docs/assets/illustrations';
import {
    Card,
    CardContent,
    CardCounter,
    CardExtendedHeader,
    CardFooter,
    CardFooterActions,
    CardHeader,
    CardHeaderAction,
    CardHeaderColumn,
    CardHeaderRow,
    CardIndicator,
    CardIndicatorTitle,
    CardIndicatorValue,
    CardKpiAnalytics,
    CardKpiAnalyticsContent,
    CardKpiAnalyticsLabel,
    CardKpiHeader,
    CardKpiScaleIcon,
    CardKpiScaleText,
    CardKpiValue,
    CardList,
    CardLoader,
    CardMainHeader,
    CardMedia,
    CardMediaContentContainer,
    CardMediaHeading,
    CardMediaImage,
    CardMediaImageContainer,
    CardMediaText,
    CardNumericContainer,
    CardNumericHeader,
    CardSecondSubtitle,
    CardSubtitle,
    CardTitle,
    type CardLegendColor,
    type CardShellColor
} from './card';

const meta = {
    title: 'Components/Card',
    component: Card,
    subcomponents: {
        CardHeader,
        CardMainHeader,
        CardTitle,
        CardSubtitle,
        CardSecondSubtitle,
        CardCounter,
        CardHeaderAction,
        CardExtendedHeader,
        CardNumericHeader,
        CardHeaderRow,
        CardHeaderColumn,
        CardKpiHeader,
        CardKpiValue,
        CardKpiScaleIcon,
        CardKpiScaleText,
        CardKpiAnalytics,
        CardKpiAnalyticsLabel,
        CardKpiAnalyticsContent,
        CardNumericContainer,
        CardIndicator,
        CardIndicatorTitle,
        CardIndicatorValue,
        CardContent,
        CardFooter,
        CardFooterActions,
        CardLoader,
        CardMedia,
        CardMediaImageContainer,
        CardMediaImage,
        CardMediaContentContainer,
        CardMediaHeading,
        CardMediaText,
        CardList
    },
    parameters: {
        // Horizon's inverted badges and white text on shell category colours are below 4.5:1 by design
        a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
        docs: {
            description: {
                component:
                    'Cards group information about one topic: a header (title, subtitle, avatar, counter, KPI), content and an optional footer with actions. Badges sit on the top edge. Cards with role `button` or `listitem` are interactive.'
            }
        }
    }
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

const row = 'flex flex-wrap items-start gap-8';

/** Stand-in for fundamental-styles' `fd-text` (the Text component is not ported yet). */
function Text({ children }: { children: ReactNode }) {
    return <span className="text-sap-font-size leading-[normal] text-sap-text-color">{children}</span>;
}

function Items({ n = 3 }: { n?: number }) {
    return (
        <List noBorder aria-label="Items">
            {Array.from({ length: n }, (_, i) => (
                <ListItem key={i}>
                    <ListTitle>Item {i + 1}</ListTitle>
                    <ListSecondary>Secondary</ListSecondary>
                </ListItem>
            ))}
        </List>
    );
}

function FooterButtons({ approve = 'Approve', reject = 'Reject' }: { approve?: string; reject?: string }) {
    return (
        <CardFooter>
            <CardFooterActions>
                <Button variant="positive" label={approve} />
                <Button variant="negative" label={reject} />
            </CardFooterActions>
        </CardFooter>
    );
}

function OverflowAction() {
    return (
        <CardHeaderAction>
            <Button variant="transparent" glyph="overflow" aria-label="More" title="More" />
        </CardHeaderAction>
    );
}

/** Extended header with object statuses at the start and a timestamp at the end. */
function StatusHeader() {
    return (
        <CardExtendedHeader>
            <CardHeaderColumn>
                <CardHeaderRow>
                    <ObjectStatus status="negative" glyph="error" label="Negative" />
                    <ObjectStatus status="critical" glyph="alert" label="Critical" />
                </CardHeaderRow>
            </CardHeaderColumn>
            <CardHeaderColumn align="right">
                <CardHeaderRow>
                    <Text>Timestamp</Text>
                </CardHeaderRow>
            </CardHeaderColumn>
        </CardExtendedHeader>
    );
}

/** Extended header aligned to the bottom: two text rows and an amount. */
function TravelHeader() {
    return (
        <CardExtendedHeader align="bottom">
            <CardHeaderColumn>
                <CardHeaderRow>
                    <Text>Las Vegas, TechEd</Text>
                </CardHeaderRow>
                <CardHeaderRow>
                    <Text>May 3rd - 5th 2024</Text>
                </CardHeaderRow>
            </CardHeaderColumn>
            <CardHeaderColumn align="right">
                <CardHeaderRow>
                    <span className="text-sap-font-header4-size text-sap-tile-title-text-color">956.00 EUR</span>
                </CardHeaderRow>
            </CardHeaderColumn>
        </CardExtendedHeader>
    );
}

export const Standard: Story = {
    name: 'Header, content and badges',
    render: () => (
        <div className={row}>
            <Card className="w-80" badge="Badge" badgeIcon="example" badgeColor={2}>
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Card Title</CardTitle>
                    </CardMainHeader>
                </CardHeader>
                <CardContent>
                    <Items n={2} />
                </CardContent>
            </Card>
            <Card
                className="w-80"
                cardType="list"
                badge="Updated"
                badgeColor={4}
                secondBadgeIcon="pushpin-on"
                secondBadgeColor={4}
            >
                <CardHeader>
                    <CardMainHeader interactive>
                        <Avatar circle size="s" label="John Doe" image="assets/person.svg" />
                        <CardTitle>List card</CardTitle>
                        <CardSubtitle>Card Subtitle</CardSubtitle>
                        <CardCounter status="positive">3 of 10</CardCounter>
                    </CardMainHeader>
                </CardHeader>
                <CardContent>
                    <Items />
                </CardContent>
            </Card>
            <Card
                className="w-80"
                badge="Badge with a very long text that should truncate on the first line"
                badgeStatus="positive"
                badgeIcon="example"
            >
                <CardContent>
                    <img src="assets/landscape.svg" alt="Landscape" className="block h-40 w-full object-cover" />
                </CardContent>
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Header at the bottom</CardTitle>
                        <CardSubtitle>Card Subtitle</CardSubtitle>
                    </CardMainHeader>
                </CardHeader>
            </Card>
        </div>
    )
};

/** fundamental-styles' "Standard card | Main Header": non-interactive and interactive headers, badges. */
export const Anatomy: Story = {
    name: 'Main header anatomy',
    render: () => (
        <div className="flex flex-wrap justify-around">
            <div className="m-4 h-[400px] w-[300px]">
                <Card>
                    <CardHeader>
                        <CardMainHeader>
                            <Avatar circle size="s" image="assets/person.svg" aria-label="John Doe" />
                            <CardTitle level={3}>Non-interactive header</CardTitle>
                            <CardSubtitle>Card Subtitle</CardSubtitle>
                            <CardHeaderAction>
                                <Button variant="transparent" glyph="overflow" aria-label="overflow" />
                            </CardHeaderAction>
                            <CardCounter>1 of 3</CardCounter>
                        </CardMainHeader>
                    </CardHeader>
                    <CardContent />
                    <FooterButtons approve="Button" reject="Button" />
                </Card>
            </div>
            <div className="m-4 h-[400px] w-[300px]">
                <Card>
                    <CardHeader>
                        <CardMainHeader interactive>
                            <Avatar circle size="s" image="assets/person.svg" aria-label="John Doe" />
                            <CardTitle level={3}>Interactive header</CardTitle>
                            <CardSubtitle>Card Subtitle</CardSubtitle>
                            <CardHeaderAction>
                                <Button variant="transparent" glyph="overflow" aria-label="overflow" />
                            </CardHeaderAction>
                            <CardCounter>1 of 3</CardCounter>
                        </CardMainHeader>
                    </CardHeader>
                    <CardContent />
                    <FooterButtons approve="Button" reject="Button" />
                </Card>
            </div>
            <div className="m-4 h-[400px] w-[300px]">
                <Card badge="badge" badgeColor={6}>
                    <CardHeader>
                        <CardMainHeader interactive>
                            <Avatar circle size="s" image="assets/person.svg" aria-label="John Doe" />
                            <CardTitle level={3}>
                                Card title that truncates lorem ipsum dolor sit amet consectetur adipisicing elit.
                                Impedit, enim. Aliquam magnam vel culpa eos explicabo.
                            </CardTitle>
                            <CardSubtitle>
                                Card subtitle that truncates lorem ipsum dolor sit amet consectetur adipisicing elit.
                                Impedit, enim. Aliquam magnam vel culpa eos explicabo.
                            </CardSubtitle>
                            <CardCounter>1 of 3</CardCounter>
                        </CardMainHeader>
                    </CardHeader>
                    <CardContent />
                    <CardFooter>
                        <Link href="#">Footer with a link</Link>
                    </CardFooter>
                </Card>
            </div>
            <div className="m-4 h-[400px] w-[300px]">
                <Card
                    badge="badge lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae distinctio natus aperiam doloremque beatae quas, fuga sequi iste officia similique sunt, iusto ad obcaecati voluptatum. Commodi perferendis assumenda modi laudantium."
                    badgeIcon="example"
                    badgeColor={3}
                >
                    <CardHeader>
                        <CardMainHeader>
                            <Avatar circle size="s" image="assets/person.svg" aria-label="John Doe" />
                            <CardTitle level={3}>Card with a long badge</CardTitle>
                            <CardSubtitle>Badge text truncates</CardSubtitle>
                        </CardMainHeader>
                    </CardHeader>
                    <CardContent />
                </Card>
            </div>
            <div className="m-4 h-[400px] w-[300px]">
                <Card badge="badge" badgeIcon="example" badgeColor={5} badgeColorSecondary>
                    <CardHeader>
                        <CardMainHeader>
                            <Avatar circle size="s" image="assets/person.svg" aria-label="John Doe" />
                            <CardTitle level={3}>Card with Badge</CardTitle>
                            <CardSubtitle>Badge with icon</CardSubtitle>
                        </CardMainHeader>
                    </CardHeader>
                    <CardContent />
                </Card>
            </div>
        </div>
    )
};

export const FooterAndLoading: Story = {
    name: 'Footer actions, header action and loading',
    render: () => (
        <div className={row}>
            <Card className="w-80" cardType="list">
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Card Title</CardTitle>
                        <CardSubtitle>With header action</CardSubtitle>
                        <OverflowAction />
                    </CardMainHeader>
                </CardHeader>
                <CardContent>
                    <Items />
                </CardContent>
                <FooterButtons />
            </Card>
            <Card className="w-80" isLoading>
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Loading</CardTitle>
                    </CardMainHeader>
                </CardHeader>
                <CardLoader>
                    <BusyIndicator loading aria-label="Loading card" />
                </CardLoader>
            </Card>
            <Card className="w-80" cardType="object">
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Object card</CardTitle>
                        <CardSubtitle>Content with spacing</CardSubtitle>
                    </CardMainHeader>
                </CardHeader>
                <CardContent>
                    <p className="m-0 text-sap-text-color">
                        Object cards show attributes of an object in their content area.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
};

export const Analytical: Story = {
    name: 'Analytical (KPI header)',
    render: () => (
        <div className={row}>
            <Card className="w-96" cardType="analytical">
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Failure Breakdown</CardTitle>
                        <CardSubtitle>By plant</CardSubtitle>
                        <CardKpiHeader>
                            <CardKpiValue status="positive">42.2</CardKpiValue>
                            <CardKpiScaleIcon
                                render={<ObjectStatus status="positive" glyph="up" glyphAriaLabel="Up" />}
                            />
                            <CardKpiScaleText render={<ObjectStatus status="positive" label="%" />} />
                            <CardKpiAnalytics>
                                <CardKpiAnalyticsLabel>Deviation</CardKpiAnalyticsLabel>
                                <CardKpiAnalyticsContent>7.52%</CardKpiAnalyticsContent>
                            </CardKpiAnalytics>
                            <CardKpiAnalytics>
                                <CardKpiAnalyticsLabel>Target</CardKpiAnalyticsLabel>
                                <CardKpiAnalyticsContent>45%</CardKpiAnalyticsContent>
                            </CardKpiAnalytics>
                        </CardKpiHeader>
                        <CardSecondSubtitle>Q1, 2019</CardSecondSubtitle>
                    </CardMainHeader>
                </CardHeader>
                <CardContent className="p-4">
                    <Skeleton type="rectangle" width="100%" height="8rem" animated={false} />
                </CardContent>
            </Card>
        </div>
    )
};

/** fundamental-styles' "Numeric Header": a KPI block and two indicators under the main header. */
export const NumericHeader: Story = {
    name: 'Numeric header',
    render: () => (
        <div className="m-4 h-[400px] w-[500px]">
            <Card>
                <CardHeader>
                    <CardMainHeader>
                        <Avatar circle size="s" image="assets/person.svg" aria-label="John Doe" />
                        <CardTitle level={3}>Card Title</CardTitle>
                        <CardSubtitle>Card Subtitle</CardSubtitle>
                        <CardHeaderAction>
                            <Button variant="transparent" glyph="overflow" aria-label="overflow" />
                        </CardHeaderAction>
                        <CardCounter>1 of 3</CardCounter>
                    </CardMainHeader>
                    <CardNumericHeader>
                        <CardHeaderRow>
                            <CardNumericContainer>
                                <CardKpiValue status="negative">1Ñç</CardKpiValue>
                                <CardKpiScaleIcon
                                    render={<ObjectStatus status="negative" glyph="down" glyphAriaLabel="Down" />}
                                />
                                <CardKpiScaleText>M</CardKpiScaleText>
                            </CardNumericContainer>
                            <CardIndicator>
                                <CardIndicatorTitle>Indicator 1</CardIndicatorTitle>
                                <CardIndicatorValue>500k</CardIndicatorValue>
                            </CardIndicator>
                            <CardIndicator>
                                <CardIndicatorTitle>Indicator 2</CardIndicatorTitle>
                                <CardIndicatorValue>500k</CardIndicatorValue>
                            </CardIndicator>
                        </CardHeaderRow>
                    </CardNumericHeader>
                </CardHeader>
                <CardContent />
            </Card>
        </div>
    )
};

const PRODUCTS = ['Notebook Basic 15', 'Notebook Basic 17', 'Notebook Basic 18'];

export const Interactive: Story = {
    name: 'Interactive cards in a card list',
    render: () => (
        <>
            <CardList aria-label="Products" className={row}>
                {PRODUCTS.map((p, i) => (
                    <Card
                        key={p}
                        className="w-72"
                        role="listitem"
                        aria-posinset={i + 1}
                        aria-setsize={PRODUCTS.length}
                        selected={i === 1}
                    >
                        <CardHeader>
                            <CardMainHeader>
                                <Avatar size="s" glyph="product" aria-label="Product" />
                                <CardTitle>{p}</CardTitle>
                                <CardSubtitle>HT-100{i}</CardSubtitle>
                            </CardMainHeader>
                        </CardHeader>
                    </Card>
                ))}
            </CardList>
            <CardList aria-label="Requests" className={`${row} mt-8`}>
                <Card
                    className="w-96"
                    role="listitem"
                    badge="New"
                    badgeIcon="example"
                    badgeColor={2}
                    badgeAriaLabel="New card"
                    aria-roledescription="Catalog Item Card"
                >
                    <CardHeader>
                        <CardMainHeader>
                            <Avatar glyph="cart" circle size="s" aria-label="Cart" />
                            <CardTitle>Card Title</CardTitle>
                            <CardSubtitle>Card Subtitle</CardSubtitle>
                            <CardCounter status="positive">3 of 10</CardCounter>
                        </CardMainHeader>
                        <StatusHeader />
                    </CardHeader>
                    <CardContent />
                </Card>
                <Card
                    className="w-96"
                    role="listitem"
                    badgeIcon="example"
                    badgeColor={3}
                    badgeAriaLabel="Requires attention"
                >
                    <CardHeader>
                        <CardMainHeader>
                            <Avatar glyph="travel-expense" size="s" aria-label="Travel expense" />
                            <CardTitle>Travel Request</CardTitle>
                            <CardSubtitle>Marie Johnson</CardSubtitle>
                            <CardCounter>2 hours ago</CardCounter>
                        </CardMainHeader>
                        <TravelHeader />
                    </CardHeader>
                    <FooterButtons />
                </Card>
            </CardList>
        </>
    )
};

const STATES = ['Normal State', 'Hover state', 'Active state', 'Focus state', 'Selected state'];

/** fundamental-styles' "Interactive card with role listitem": hover, press and focus the cards to see their states; the last one is selected. */
export const InteractiveStates: Story = {
    name: 'Interactive card states',
    render: () => (
        <CardList aria-label="Interactive Cards and States" className="flex flex-wrap gap-8">
            {STATES.map((state, i) => (
                <Card
                    key={state}
                    className="w-[400px] flex-none"
                    role="listitem"
                    aria-posinset={i + 1}
                    aria-setsize={STATES.length}
                    selected={i === 4}
                >
                    <CardHeader>
                        <CardMainHeader>
                            <Avatar circle size="s" image="assets/person.svg" aria-label="John Doe" />
                            <CardTitle level={3}>{state}</CardTitle>
                            <CardSubtitle>Card Subtitle</CardSubtitle>
                        </CardMainHeader>
                    </CardHeader>
                    <CardContent className="h-[100px]" />
                    <FooterButtons approve="Button" reject="Button" />
                </Card>
            ))}
        </CardList>
    )
};

export const Media: Story = {
    render: () => (
        <div className={row}>
            <Card className="w-80">
                <CardMedia>
                    <CardMediaImageContainer>
                        <CardMediaImage src="assets/landscape.svg" alt="Landscape" className="max-h-48" />
                    </CardMediaImageContainer>
                </CardMedia>
                <CardHeader>
                    <CardMainHeader>
                        <Avatar glyph="cart" circle size="s" aria-label="Cart" />
                        <CardTitle>Card Title</CardTitle>
                        <CardSubtitle>Card Subtitle</CardSubtitle>
                    </CardMainHeader>
                </CardHeader>
                <FooterButtons />
            </Card>
            <Card className="h-fit w-80">
                <CardMedia hasPadding>
                    <CardMediaImageContainer>
                        <CardMediaImage src="assets/landscape.svg" alt="Landscape" className="max-h-48" />
                    </CardMediaImageContainer>
                </CardMedia>
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Media with padding</CardTitle>
                    </CardMainHeader>
                </CardHeader>
            </Card>
            <Card className="h-fit w-80">
                <CardMedia shellColor={3}>
                    <CardMediaContentContainer>
                        <CardMediaHeading>Shell colour</CardMediaHeading>
                        <CardMediaText>Media text on a shell category colour.</CardMediaText>
                    </CardMediaContentContainer>
                </CardMedia>
            </Card>
        </div>
    )
};

function MediaColorCard({ shell, legend }: { shell?: CardShellColor; legend?: CardLegendColor }) {
    return (
        <div className="m-4 h-[400px] w-[300px]">
            <Card>
                <CardMedia shellColor={shell} legendColor={legend}>
                    <CardMediaContentContainer>
                        <CardMediaHeading>Incoming Applications</CardMediaHeading>
                    </CardMediaContentContainer>
                </CardMedia>
                <CardHeader>
                    <CardMainHeader>
                        <Avatar circle size="s" image="assets/person.svg" aria-label="John Doe" />
                        <CardTitle level={3}>{shell ? `Shell colour ${shell}` : `Legend colour ${legend}`}</CardTitle>
                        <CardSubtitle>Card Subtitle</CardSubtitle>
                    </CardMainHeader>
                </CardHeader>
                <CardContent />
                <FooterButtons approve="Button" reject="Button" />
            </Card>
        </div>
    );
}

/** fundamental-styles' "Title on Media": the heading on shell category and legend colours. */
export const MediaColors: Story = {
    name: 'Title on media colours',
    render: () => (
        <div className="flex flex-wrap justify-around">
            <MediaColorCard shell={1} />
            <MediaColorCard shell={2} />
            <MediaColorCard shell={3} />
            <MediaColorCard legend={1} />
            <MediaColorCard legend={2} />
            <MediaColorCard legend={3} />
        </div>
    )
};

const LOREM =
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat quo delectus deleniti excepturi tempora impedit nobis nulla sint qui quae consequuntur reprehenderit, accusamus amet nihil esse quia doloribus praesentium quidem?';

export const Banner: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Text on a shell colour, text on a legend colour beside an image, and text over an image. Below 1024px the image takes 20%; below 640px it stacks above the text.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-8">
            <div>
                <Card cardType="banner">
                    <CardMedia shellColor={13}>
                        <CardMediaContentContainer>
                            <CardMediaHeading>Get Ready for the AI Learning Days!</CardMediaHeading>
                            <CardMediaText>{LOREM}</CardMediaText>
                            <Button label="Register" />
                        </CardMediaContentContainer>
                    </CardMedia>
                </Card>
            </div>
            <div className="h-72">
                <Card cardType="banner">
                    <CardMedia>
                        <CardMediaContentContainer legendColor={13}>
                            <CardMediaHeading>AI Learning Days: register now</CardMediaHeading>
                            <CardMediaText>{LOREM}</CardMediaText>
                            <Button variant="emphasized" label="Register" />
                        </CardMediaContentContainer>
                        <CardMediaImageContainer>
                            <CardMediaImage src="assets/landscape.svg" alt="Landscape" />
                        </CardMediaImageContainer>
                    </CardMedia>
                </Card>
            </div>
            <div className="h-[400px]">
                <Card cardType="banner">
                    <CardMedia>
                        <CardMediaContentContainer isOverlay>
                            <CardMediaHeading>AI Learning Days: text over the image</CardMediaHeading>
                            <CardMediaText>{LOREM}</CardMediaText>
                            <Button label="Register" />
                        </CardMediaContentContainer>
                        <CardMediaImageContainer>
                            <CardMediaImage src="assets/landscape.svg" alt="Landscape" />
                        </CardMediaImageContainer>
                    </CardMedia>
                </Card>
            </div>
        </div>
    )
};

export const ExtendedHeader: Story = {
    name: 'Extended header and header interaction',
    render: () => (
        <div className={row}>
            <Card className="w-96">
                <CardHeader>
                    <CardMainHeader>
                        <Avatar glyph="cart" circle size="s" aria-label="Cart" />
                        <CardTitle>Card Title</CardTitle>
                        <CardSubtitle>Card Subtitle</CardSubtitle>
                        <CardCounter status="positive">3 of 10</CardCounter>
                        <OverflowAction />
                    </CardMainHeader>
                    <StatusHeader />
                </CardHeader>
                <CardContent>
                    <div className="h-32" />
                </CardContent>
            </Card>
            <Card className="w-96">
                <CardHeader>
                    <CardMainHeader interactive>
                        <Avatar glyph="travel-expense" size="s" aria-label="Travel expense" />
                        <CardTitle>Travel Request</CardTitle>
                        <CardSubtitle>Marie Johnson</CardSubtitle>
                        <CardCounter>2 hours ago</CardCounter>
                        <OverflowAction />
                    </CardMainHeader>
                    <TravelHeader />
                </CardHeader>
                <FooterButtons />
            </Card>
            <Card className="w-96">
                <CardContent>
                    <div className="h-32" />
                </CardContent>
                <CardHeader>
                    <CardMainHeader interactive>
                        <Avatar glyph="cart" circle size="s" aria-label="Cart" />
                        <CardTitle>Interactive header at the bottom</CardTitle>
                        <CardSubtitle>Card Subtitle</CardSubtitle>
                        <CardCounter status="positive">3 of 10</CardCounter>
                    </CardMainHeader>
                </CardHeader>
            </Card>
        </div>
    )
};

export const EmptyState: Story = {
    name: 'Empty state',
    render: () => (
        <Card className="w-96">
            <CardHeader>
                <CardMainHeader interactive>
                    <Avatar glyph="cart" circle size="s" aria-label="Cart" />
                    <CardTitle>Card Title</CardTitle>
                    <CardSubtitle>Card Subtitle</CardSubtitle>
                </CardMainHeader>
            </CardHeader>
            <CardContent>
                <IllustratedMessage type="dialog" svgConfig={UNABLE_TO_LOAD} svgAriaLabel="Unable to load data">
                    <IllustratedMessageFigcaption>
                        <IllustratedMessageTitle>Unable to load data</IllustratedMessageTitle>
                        <IllustratedMessageText>
                            Try reloading. If that still doesn&apos;t help, check with your administrator.
                        </IllustratedMessageText>
                    </IllustratedMessageFigcaption>
                    <IllustratedMessageActions>
                        <Button label="Reload" />
                    </IllustratedMessageActions>
                </IllustratedMessage>
            </CardContent>
        </Card>
    )
};

/** An attribute group of an object card: a title and label/text pairs. */
function Attributes({ title }: { title: string }) {
    return (
        <div className="flex min-w-40 flex-1 flex-col gap-4">
            <div className="text-sap-font-header6-size font-bold text-sap-group-title-text-color">{title}</div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-1">
                    <span className="text-sap-content-label-color">Label</span>
                    <span className="text-sap-text-color">Text</span>
                </div>
            ))}
        </div>
    );
}

export const ObjectCard: Story = {
    name: 'Object card',
    render: () => (
        <div className={row}>
            {[
                ['w-72', 'stacked'],
                ['w-[30rem]', 'side by side']
            ].map(([width, layout]) => (
                <Card key={layout} className={width} cardType="object">
                    <CardHeader>
                        <CardMainHeader>
                            <Avatar image="assets/person.svg" circle size="s" aria-label="Photo of John Li" />
                            <CardTitle>Groups {layout}</CardTitle>
                            <CardSubtitle>Card Subtitle</CardSubtitle>
                        </CardMainHeader>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-x-8 gap-y-6">
                            <Attributes title="Group Title 1" />
                            <Attributes title="Group Title 2" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
};

const VIEW_LABEL: Record<FdCalendarView, string> = {
    day: 'Day view',
    month: 'Month view',
    year: 'Year view',
    aggregatedYear: 'Years range view'
};

function CalendarCardExample() {
    const [view, setView] = useState<FdCalendarView>('day');
    return (
        <Card className="w-fit">
            <CardHeader>
                <CardMainHeader>
                    <CardTitle>My calendar</CardTitle>
                    <CardSubtitle>{VIEW_LABEL[view]}</CardSubtitle>
                    <CardCounter>4 of 10</CardCounter>
                </CardMainHeader>
            </CardHeader>
            <CardContent>
                <Calendar activeView={view} onActiveViewChange={setView} />
            </CardContent>
        </Card>
    );
}

export const CalendarCard: Story = {
    name: 'Calendar card',
    parameters: { docs: { description: { story: 'The subtitle follows the calendar view.' } } },
    render: () => <CalendarCardExample />
};

const CONTACT = [
    {
        title: 'Contact Details',
        items: [
            { label: 'Mobile', value: '+89181818181', href: 'tel:+89181818181' },
            { label: 'Phone', value: '+2828282828', href: 'tel:+2828282828' },
            { label: 'Email', value: 'mail@example.com', href: 'mailto:mail@example.com' }
        ]
    },
    {
        title: 'Company',
        items: [
            { label: 'Name', value: 'Company A', href: '' },
            { label: 'Address', value: '481 West Street, Anytown 45066, USA', href: '' }
        ]
    }
];

export const QuickViewCard: Story = {
    name: 'Quick view card',
    parameters: {
        docs: {
            description: {
                story: 'The quick view content is plain markup (subheader, groups of label and value) until the Quick View component is ported.'
            }
        }
    },
    render: () => (
        <Card className="w-96" cardType="quickView">
            <CardHeader>
                <CardMainHeader>
                    <CardTitle>Contact Card</CardTitle>
                </CardMainHeader>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 px-4 pb-4 text-sap-font-size text-sap-text-color">
                    <div className="flex items-center gap-3">
                        <Avatar size="s" image="assets/person.svg" aria-label="Photo of Ann Smith" />
                        <div>
                            <h3 className="m-0 font-sap-font-header-family text-sap-font-header5-size">Ann Smith</h3>
                            <div className="text-sap-content-label-color">Senior sales manager</div>
                        </div>
                    </div>
                    {CONTACT.map((group) => (
                        <section key={group.title} className="flex flex-col gap-2">
                            <h4 className="m-0 font-sap-font-header-family text-sap-font-header6-size">
                                {group.title}
                            </h4>
                            {group.items.map((item) => (
                                <div key={item.label} className="flex flex-col">
                                    <span className="text-sap-content-label-color">{item.label}</span>
                                    {item.href ? <Link href={item.href}>{item.value}</Link> : <span>{item.value}</span>}
                                </div>
                            ))}
                        </section>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <CardFooterActions>
                    <Button label="Assign to Project" />
                </CardFooterActions>
            </CardFooter>
        </Card>
    )
};

const CONTACTS = [
    ['Donna Moore', 'Company A'],
    ['Elena Petrova', 'Company B'],
    ['Julia Armstrong', 'Company C'],
    ['John Li', 'Company D'],
    ['Richard Wilson', 'Company E'],
    ['Sabine Mayer', 'Company F']
];
const LINKS = [
    ['leads', 'Career'],
    ['address-book', 'Company Directory'],
    ['notes', 'Development Plan'],
    ['target-group', 'Business Goals'],
    ['travel-itinerary', 'Travel and Expenses'],
    ['general-leave-request', 'Time Off']
];

export const LinkListCard: Story = {
    name: 'Link list card',
    render: () => (
        <div className={row}>
            <Card className="w-80" cardType="linkList">
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Recent Contacts</CardTitle>
                    </CardMainHeader>
                </CardHeader>
                <CardContent>
                    <List byline noBorder aria-label="Recent contacts">
                        {CONTACTS.map(([name, company]) => (
                            <ListItem key={name}>
                                <ListLink href="#">
                                    <ListThumbnail>
                                        <Avatar size="s" image="assets/person.svg" aria-label={`Photo of ${name}`} />
                                    </ListThumbnail>
                                    <ListContent>
                                        <ListTitle>{name}</ListTitle>
                                        <ListByline>{company}</ListByline>
                                    </ListContent>
                                </ListLink>
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
            <Card className="w-80" cardType="linkList">
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Quick Links</CardTitle>
                    </CardMainHeader>
                </CardHeader>
                <CardContent>
                    <List noBorder aria-label="Quick links">
                        {LINKS.map(([glyph, label]) => (
                            <ListItem key={label}>
                                <ListLink href="#">
                                    <ListIcon glyph={glyph} />
                                    <ListTitle>{label}</ListTitle>
                                </ListLink>
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </div>
    )
};

function SkeletonList() {
    return (
        <List noBorder aria-label="Loading items" aria-busy="true">
            {[1, 2, 3].map((i) => (
                <ListItem key={i}>
                    <Skeleton type="text" width="30%" textLines={1} className="my-auto" />
                </ListItem>
            ))}
        </List>
    );
}

export const LoadingPlaceholders: Story = {
    name: 'Loading placeholders',
    render: () => (
        <div className={row}>
            <Card className="w-80" aria-label="Loading card">
                <CardHeader>
                    <CardMainHeader>
                        <Skeleton type="text" textLines={1} className="my-auto" />
                    </CardMainHeader>
                </CardHeader>
                <CardContent>
                    <SkeletonList />
                </CardContent>
            </Card>
            <Card className="w-80" aria-label="Loading card with the header at the bottom">
                <CardContent>
                    <Skeleton type="rectangle" width="100%" height="12rem" />
                </CardContent>
                <CardHeader>
                    <CardMainHeader>
                        <Skeleton type="text" textLines={1} className="my-auto" />
                    </CardMainHeader>
                </CardHeader>
            </Card>
            <Card className="w-80" cardType="list" badge="New" aria-label="Loading card with avatar">
                <CardHeader>
                    <CardMainHeader>
                        <Skeleton width="100%" height="48px">
                            <circle cx="24" cy="24" r="24" />
                            <rect x="60" y="0" rx="4" width="80%" height="12" />
                            <rect x="60" y="20" rx="4" width="50%" height="8" />
                        </Skeleton>
                    </CardMainHeader>
                </CardHeader>
                <CardContent>
                    <SkeletonList />
                </CardContent>
            </Card>
        </div>
    )
};

function FooterOverflowExample() {
    return (
        <div className={row}>
            <Card className="w-80" cardType="list">
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Footer actions</CardTitle>
                    </CardMainHeader>
                </CardHeader>
                <CardContent>
                    <Items n={4} />
                </CardContent>
                <CardFooter>
                    <CardFooterActions>
                        <Button variant="positive" label="Start" />
                        <Button variant="positive" label="Center" />
                        <Button variant="negative" label="End" />
                    </CardFooterActions>
                </CardFooter>
            </Card>
            <Card className="w-80" cardType="list">
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Footer actions with overflow</CardTitle>
                    </CardMainHeader>
                </CardHeader>
                <CardContent>
                    <Items n={4} />
                </CardContent>
                <CardFooter>
                    <CardFooterActions>
                        <Button variant="positive" label="Start" />
                        <Button variant="negative" label="End" />
                        <Menu>
                            <MenuTrigger
                                render={<Button variant="transparent" glyph="overflow" aria-label="More actions" />}
                            />
                            <MenuPopup aria-label="More actions">
                                <MenuItem>
                                    <MenuAddon glyph="cart" />
                                    <MenuTitle>Option 1</MenuTitle>
                                </MenuItem>
                                <MenuItem>
                                    <MenuAddon glyph="accept" />
                                    <MenuTitle>Option 2</MenuTitle>
                                </MenuItem>
                                <MenuItem>
                                    <MenuTitle>Option 3</MenuTitle>
                                    <MenuAddon glyph="menu" />
                                </MenuItem>
                            </MenuPopup>
                        </Menu>
                    </CardFooterActions>
                </CardFooter>
            </Card>
            <Card className="w-80" cardType="list">
                <CardHeader>
                    <CardMainHeader>
                        <CardTitle>Footer with a link</CardTitle>
                    </CardMainHeader>
                </CardHeader>
                <CardContent>
                    <Items n={4} />
                </CardContent>
                <CardFooter>
                    <Link href="#">Link to some action or details page</Link>
                </CardFooter>
            </Card>
        </div>
    );
}

export const FooterOverflow: Story = {
    name: 'Footer with overflow and link',
    render: () => <FooterOverflowExample />
};

export const OpenFooterOverflow: Story = {
    name: 'Open: footer overflow menu',
    tags: ['!autodocs'],
    render: () => <FooterOverflowExample />,
    play: async ({ canvasElement }) => {
        const trigger = canvasElement.querySelector<HTMLElement>('[aria-label="More actions"][aria-haspopup]')!;
        await userEvent.click(trigger);
        await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));
        await waitFor(() => expect(document.querySelector('[role=menu] [role=menuitem]')).not.toBeNull());
    }
};
