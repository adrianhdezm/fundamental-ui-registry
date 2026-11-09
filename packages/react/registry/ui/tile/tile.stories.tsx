import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import {
    NumericContent,
    NumericContentKpi,
    NumericContentKpiContainer,
    NumericContentLaunchIcon,
    NumericContentLaunchIconContainer,
    NumericContentScale,
    NumericContentScaleArrow,
    NumericContentScaleContainer,
    NumericContentScaleText,
    type NumericContentSize,
    type NumericContentState
} from './numeric-content';
import {
    Tile,
    TileActionClose,
    TileActionContainer,
    TileActionIndicator,
    TileBackgroundImg,
    TileBadge,
    TileContainer,
    TileContent,
    TileContentByline,
    TileContentText,
    TileDot,
    TileFooter,
    TileFooterText,
    TileHeader,
    TileHeaderContent,
    TileLogo,
    TilePageIndicator,
    TileProfileImg,
    TileRefresh,
    TileSection,
    TileSlideContainer,
    TileSubtitle,
    TileTitle,
    TileTitleContainer,
    TileToggle,
    type TileProps
} from './tile';

const meta = {
    title: 'Components/Tile',
    component: Tile,
    subcomponents: {
        TileContainer,
        TileHeader,
        TileHeaderContent,
        TileTitleContainer,
        TileTitle,
        TileSubtitle,
        TileContent,
        TileFooter,
        TileSection,
        TileContentText,
        TileContentByline,
        TileFooterText,
        TileRefresh,
        TileProfileImg,
        TileLogo,
        TileBadge,
        TileBackgroundImg,
        TileToggle,
        TileSlideContainer,
        TilePageIndicator,
        TileDot,
        TileActionClose,
        TileActionIndicator,
        TileActionContainer,
        NumericContent,
        NumericContentLaunchIconContainer,
        NumericContentLaunchIcon,
        NumericContentKpiContainer,
        NumericContentKpi,
        NumericContentScaleContainer,
        NumericContentScale,
        NumericContentScaleArrow,
        NumericContentScaleText
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Tiles are fixed-size containers on a launchpad that show app information (launch, KPI and feed tiles), news (slide tiles) or links (line tiles). Tiles have a regular and a small size and can be double width. Interactive tiles are `clickable` (role button; click, Enter and Space call `onTileClick`) or links (`render={<a href="..." />}`).'
            }
        }
    },
    argTypes: {
        size: { control: 'inline-radio', options: [undefined, 's'] },
        type: { control: 'select', options: [undefined, 'launch', 'kpi', 'feed', 'slide'] }
    },
    args: { size: undefined, double: false, type: undefined, clickable: true, action: false, disabled: false }
} satisfies Meta<typeof Tile>;
export default meta;
type Story = StoryObj<typeof meta>;

const ROW = 'flex flex-wrap items-start gap-8';
const HEADING = 'm-0 mb-2 w-full font-sap-font-family text-sap-font-header5-size font-bold text-sap-title-color';
const PERSON = 'assets/person.svg';
const LANDSCAPE = 'assets/landscape.svg';

/** fundamental-react's primary tile: the header's `title` and `subtitle` props, a description and a footer. */
export const Primary: Story = {
    parameters: {
        docs: {
            description: {
                story: '`TileHeader` takes `title` and `subtitle` props (fundamental-react) as well as `TileTitle` and `TileSubtitle` children. The tile props are controls.'
            }
        }
    },
    render: (args) => (
        <Tile {...args}>
            <TileHeader title="Tile Title" subtitle="Tile Subtitle" />
            <TileContent>
                <p className="m-0">Tile Description</p>
            </TileContent>
            <TileFooter>
                <TileFooterText>Tile Footer</TileFooterText>
            </TileFooter>
        </Tile>
    )
};

export const Subtitle: Story = {
    parameters: {
        docs: { description: { story: 'The subtitle is optional; it has one line before it is truncated.' } }
    },
    render: () => (
        <Tile clickable>
            <TileHeader>
                <TileTitle>Tile Title</TileTitle>
                <TileSubtitle>Tile Subtitle</TileSubtitle>
            </TileHeader>
            <TileContent>
                <p className="m-0">Tile Description</p>
            </TileContent>
        </Tile>
    )
};

const BOX = 'bg-sap-information-background';

function LayoutTile(props: TileProps) {
    return (
        <Tile {...props}>
            <TileHeader className={BOX}>
                <TileTitle>Title</TileTitle>
                <TileSubtitle>Subtitle</TileSubtitle>
            </TileHeader>
            <TileContent className={BOX}>Content</TileContent>
            <TileFooter className={BOX}>
                <TileFooterText>Footer</TileFooterText>
            </TileFooter>
        </Tile>
    );
}

export const Sizes: Story = {
    name: 'Sizes and layout',
    parameters: {
        docs: {
            description: {
                story: 'Regular (11rem) and small (`size="s"`, 9.25rem, for screens up to 374px) tiles, single and `double` width (2×1), with the header, content and footer areas highlighted.'
            }
        }
    },
    render: () => (
        <div className={ROW}>
            <LayoutTile />
            <LayoutTile double />
            <LayoutTile size="s" />
            <LayoutTile size="s" double />
        </div>
    )
};

function ColumnsTile(props: TileProps) {
    const sections = (
        <>
            <TileSection className={BOX} />
            <TileSection className={BOX} />
        </>
    );
    return (
        <Tile {...props}>
            <TileHeader twoColumn>{sections}</TileHeader>
            <TileContent twoColumn>{sections}</TileContent>
            <TileFooter twoColumn>{sections}</TileFooter>
        </Tile>
    );
}

export const Columns: Story = {
    name: 'Two-column sections',
    parameters: {
        docs: {
            description: {
                story: "`twoColumn` on the header, content or footer splits it into two `TileSection`s spread to both ends (fundamental-react's `twoColumns`)."
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-6">
            <div className={ROW}>
                <ColumnsTile />
                <ColumnsTile double />
                <ColumnsTile size="s" />
                <ColumnsTile size="s" double />
            </div>
            <div className={ROW}>
                <h3 className={HEADING}>Text in the columns (fundamental-react)</h3>
                <Tile size="s">
                    <TileHeader title="Tile Title" />
                    <TileContent twoColumn>
                        <TileSection>
                            <p className="m-0">Left side content</p>
                        </TileSection>
                        <TileSection>
                            <p className="m-0">Right side content</p>
                        </TileSection>
                    </TileContent>
                </Tile>
                <Tile double>
                    <TileHeader title="Tile Title" />
                    <TileContent twoColumn>
                        <TileSection>
                            <p className="m-0">Left side content</p>
                        </TileSection>
                        <TileSection>
                            <p className="m-0">Right side content</p>
                        </TileSection>
                    </TileContent>
                </Tile>
            </div>
        </div>
    )
};

function RefreshFooter() {
    return (
        <TileFooter twoColumn>
            <TileSection>
                <TileRefresh />
                <TileFooterText>Now</TileFooterText>
            </TileSection>
            <TileSection>
                <TileFooterText>Footer</TileFooterText>
            </TileSection>
        </TileFooter>
    );
}

interface KpiProps {
    tile?: TileProps;
    title: string;
    subtitle?: string;
    size?: NumericContentSize;
    state?: NumericContentState;
    icon?: boolean;
    value: string;
    arrow?: 'up' | 'down';
    scale?: string;
    footer?: ReactNode;
}

function KpiExample({ tile, title, subtitle, size, state, icon, value, arrow, scale, footer }: KpiProps) {
    return (
        <Tile type="kpi" {...tile}>
            <TileHeader>
                <TileTitle render={<h4 />}>{title}</TileTitle>
                {subtitle && <TileSubtitle>{subtitle}</TileSubtitle>}
            </TileHeader>
            <TileContent>
                <NumericContent size={size}>
                    {icon && (
                        <NumericContentKpiContainer>
                            <NumericContentKpi glyph="line-charts" state={state} role="presentation" />
                        </NumericContentKpiContainer>
                    )}
                    <NumericContentKpiContainer>
                        <NumericContentKpi state={state}>{value}</NumericContentKpi>
                    </NumericContentKpiContainer>
                    {arrow && (
                        <NumericContentScaleContainer>
                            <NumericContentScale state={state}>
                                <NumericContentScaleArrow glyph={arrow} aria-label={arrow === 'up' ? 'Up' : 'Down'} />
                                {scale && <NumericContentScaleText>{scale}</NumericContentScaleText>}
                            </NumericContentScale>
                        </NumericContentScaleContainer>
                    )}
                </NumericContent>
            </TileContent>
            {footer ?? <RefreshFooter />}
        </Tile>
    );
}

function Footer({ children }: { children: ReactNode }) {
    return (
        <TileFooter>
            <TileFooterText>{children}</TileFooterText>
        </TileFooter>
    );
}

export const KpiTile: Story = {
    name: 'KPI tile',
    parameters: {
        docs: {
            description: {
                story: 'Numeric content in three sizes (l by default, m, s), with a state colour, an optional KPI icon and a scale (trend arrow and unit). In small tiles the numeric content has the small tile size.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-6">
            <div className={ROW}>
                <h3 className={HEADING}>Large numeric content (default)</h3>
                <KpiExample
                    title="Title"
                    subtitle="Subtitle"
                    state="negative"
                    icon
                    value="1.2"
                    arrow="down"
                    scale="M"
                />
                <KpiExample
                    tile={{ size: 's' }}
                    title="Title"
                    subtitle="Subtitle"
                    state="positive"
                    icon
                    value="1.2"
                    arrow="down"
                    scale="M"
                />
            </div>
            <div className={ROW}>
                <h3 className={HEADING}>Medium numeric content</h3>
                <KpiExample
                    title="Title: Eiusmod tempor incididunt ut labore"
                    size="m"
                    state="positive"
                    value="123"
                    arrow="down"
                    footer={<Footer>Unit, Notification</Footer>}
                />
                <KpiExample
                    tile={{ size: 's' }}
                    title="Title: Eiusmod tempor incididunt"
                    subtitle="Subtitle"
                    size="m"
                    state="negative"
                    value="-889"
                    arrow="up"
                    footer={<Footer>Unit, Notification</Footer>}
                />
            </div>
            <div className={ROW}>
                <h3 className={HEADING}>Small numeric content</h3>
                <KpiExample
                    title="Title"
                    size="s"
                    state="critical"
                    value="12"
                    arrow="down"
                    scale="%"
                    footer={<Footer>Unit</Footer>}
                />
                <KpiExample
                    tile={{ size: 's' }}
                    title="Title"
                    subtitle="Subtitle"
                    size="m"
                    state="informative"
                    value="1.95"
                    footer={<Footer>CAD, Current quarter</Footer>}
                />
            </div>
        </div>
    )
};

function LaunchExample(props: TileProps) {
    const small = props.size === 's';
    return (
        <Tile type="launch" {...props}>
            <TileHeader title="Title" subtitle="Subtitle" />
            <TileContent>
                <NumericContent>
                    <NumericContentLaunchIconContainer>
                        <NumericContentLaunchIcon glyph="line-charts" />
                    </NumericContentLaunchIconContainer>
                    <NumericContentKpiContainer>
                        <NumericContentKpi state={small ? 'positive' : 'negative'}>
                            {small ? '1234' : '1.2'}
                        </NumericContentKpi>
                    </NumericContentKpiContainer>
                    {!small && (
                        <NumericContentScaleContainer>
                            <NumericContentScale state="negative">
                                <NumericContentScaleArrow glyph="down" aria-label="Down" />
                                <NumericContentScaleText>M</NumericContentScaleText>
                            </NumericContentScale>
                        </NumericContentScaleContainer>
                    )}
                </NumericContent>
            </TileContent>
            {small ? <Footer>Unit, Notification</Footer> : <RefreshFooter />}
        </Tile>
    );
}

function HeaderContentTile(props: TileProps) {
    return (
        <Tile type="launch" {...props}>
            <TileHeaderContent>
                <TileTitle>Title: Lorem ipsum dolor sit amet, consectetur elit</TileTitle>
                <TileSubtitle>Subtitle</TileSubtitle>
            </TileHeaderContent>
            <RefreshFooter />
        </Tile>
    );
}

function ProfileTile(props: TileProps) {
    return (
        <Tile type="launch" {...props}>
            <TileHeader title="Title" subtitle="Subtitle" />
            <TileContent>
                <TileProfileImg backgroundImage={PERSON} aria-label="Profile Image" />
            </TileContent>
            <Footer>{props.size === 's' ? 'Unit, Notification' : 'Footer'}</Footer>
        </Tile>
    );
}

function LogoTile(props: TileProps) {
    return (
        <Tile type="launch" {...props}>
            <TileHeader title="Title" subtitle="Subtitle" />
            <TileContent>
                <TileLogo src={LANDSCAPE} alt="Company logo" />
            </TileContent>
            <Footer>{props.size === 's' ? 'Unit, Notification' : 'Footer'}</Footer>
        </Tile>
    );
}

export const LaunchTile: Story = {
    name: 'Launch tile',
    parameters: {
        docs: {
            description: {
                story: 'Launch tiles with numeric content and a launch icon, a combined header and content (`TileHeaderContent`, up to four title lines), a profile image or a company logo.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-6">
            <div className={ROW}>
                <h3 className={HEADING}>Numeric content and launch icon</h3>
                <LaunchExample />
                <LaunchExample size="s" />
            </div>
            <div className={ROW}>
                <h3 className={HEADING}>Combined header and content</h3>
                <HeaderContentTile />
                <HeaderContentTile size="s" />
            </div>
            <div className={ROW}>
                <h3 className={HEADING}>Profile</h3>
                <ProfileTile />
                <ProfileTile size="s" />
            </div>
            <div className={ROW}>
                <h3 className={HEADING}>Logo</h3>
                <LogoTile />
                <LogoTile size="s" />
            </div>
        </div>
    )
};

function ClickableTiles() {
    const [clicks, setClicks] = useState(0);
    const count = () => setClicks((n) => n + 1);
    return (
        <div className={ROW}>
            <Tile type="launch" clickable onTileClick={count}>
                <TileHeader title="Sales" subtitle="Launch tile as button" />
                <TileContent>
                    <NumericContent>
                        <NumericContentLaunchIconContainer>
                            <NumericContentLaunchIcon glyph="line-charts" />
                        </NumericContentLaunchIconContainer>
                        <NumericContentKpiContainer>
                            <NumericContentKpi state="negative">1.2</NumericContentKpi>
                        </NumericContentKpiContainer>
                        <NumericContentScaleContainer>
                            <NumericContentScale state="negative">
                                <NumericContentScaleArrow glyph="down" aria-label="Down" />
                                <NumericContentScaleText>M</NumericContentScaleText>
                            </NumericContentScale>
                        </NumericContentScaleContainer>
                    </NumericContent>
                </TileContent>
                <Footer>EUR, current quarter</Footer>
            </Tile>
            <Tile
                type="launch"
                size="s"
                render={<a href="#" />}
                onTileClick={count}
                onClick={(event) => event.preventDefault()}
            >
                <TileHeader title="Launch tile as link" subtitle="Subtitle" />
                <TileContent>
                    <NumericContent>
                        <NumericContentLaunchIconContainer>
                            <NumericContentLaunchIcon glyph="line-charts" />
                        </NumericContentLaunchIconContainer>
                        <NumericContentKpiContainer>
                            <NumericContentKpi state="positive">1234</NumericContentKpi>
                        </NumericContentKpiContainer>
                    </NumericContent>
                </TileContent>
                <Footer>Unit, Notification</Footer>
            </Tile>
            <p className="m-0 font-sap-font-family text-sap-font-size text-sap-text-color" aria-live="polite">
                Clicked {clicks} times
            </p>
        </div>
    );
}

export const Clickable: Story = {
    name: 'Clickable and link tiles',
    parameters: {
        docs: {
            description: {
                story: 'A `clickable` tile is a focusable button: click, Enter and Space call `onTileClick`. A link tile (`render={<a href="..." />}`) keeps the link semantics and calls `onTileClick` on click.'
            }
        }
    },
    render: () => <ClickableTiles />
};

interface FeedProps {
    small?: boolean;
    badge?: string;
    title: string;
    value: string;
    state?: NumericContentState;
}

function FeedExample({ small = false, badge, title, value, state }: FeedProps) {
    return (
        <Tile type="feed" double size={small ? 's' : undefined}>
            {badge && <TileBadge>{badge}</TileBadge>}
            <TileHeader title={title} subtitle="Subtitle" />
            <TileContent twoColumn>
                <TileSection>
                    <TileContentText>
                        {small
                            ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed eiusmod.'
                            : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt magna aliqua.'}
                    </TileContentText>
                    <TileContentByline>About 1 minute ago</TileContentByline>
                </TileSection>
                <TileSection>
                    <NumericContent size={small ? 'm' : undefined}>
                        <NumericContentKpiContainer>
                            <NumericContentKpi state={state}>{value}</NumericContentKpi>
                        </NumericContentKpiContainer>
                    </NumericContent>
                </TileSection>
            </TileContent>
            <Footer>Footer</Footer>
        </Tile>
    );
}

export const FeedTile: Story = {
    name: 'Feed tile',
    parameters: {
        docs: {
            description: {
                story: 'Double-width feed tiles: the first content section holds the text (two lines) and byline, the second fits its content.'
            }
        }
    },
    render: () => (
        <div className={ROW}>
            <FeedExample title="Title: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua" value="35" />
            <FeedExample small title="Title: Sed do eiusmod" value="9" state="negative" />
        </div>
    )
};

export const BadgeTile: Story = {
    name: 'Badge tile',
    parameters: {
        docs: {
            description: {
                story: '`TileBadge` sits at the top end corner of the tile; a long text is truncated.'
            }
        }
    },
    render: () => (
        <div className={`${ROW} pt-3`}>
            <Tile type="launch">
                <TileBadge>Badge</TileBadge>
                <TileHeader title="Launch tile title" subtitle="Subtitle" />
                <TileContent>
                    <TileProfileImg backgroundImage={PERSON} aria-label="Profile Image" />
                </TileContent>
                <Footer>Footer</Footer>
            </Tile>
            <Tile type="launch" size="s">
                <TileBadge>Badge with very very very very very very very very very long text</TileBadge>
                <TileHeader title="Launch tile title" subtitle="Subtitle" />
                <TileContent>
                    <TileProfileImg backgroundImage={PERSON} aria-label="Profile Image" />
                </TileContent>
                <Footer>Unit, Notification</Footer>
            </Tile>
            <FeedExample
                badge="New"
                title="Feed tile title: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
                value="35"
            />
            <FeedExample
                small
                badge="Badge with very very very very very very very very very long text"
                title="Feed tile title: Sed do eiusmod"
                value="9"
                state="negative"
            />
        </div>
    )
};

function SlideExample({
    title,
    dots,
    playing,
    ...props
}: TileProps & { title: string; dots: number; playing?: boolean }) {
    return (
        <Tile type="slide" role="group" aria-label="Wind map news" {...props}>
            <TileBackgroundImg backgroundImage={LANDSCAPE} />
            <TileToggle playing={playing} />
            <TileSlideContainer>
                <TileHeader title={title} subtitle="SAP News" />
                <TileFooter>
                    <TileFooterText>May 14, 2020</TileFooterText>
                </TileFooter>
                <TilePageIndicator>
                    {Array.from({ length: dots }, (_, i) => (
                        <TileDot key={i} active={i === 2} />
                    ))}
                </TilePageIndicator>
            </TileSlideContainer>
        </Tile>
    );
}

const WIND = 'Wind Map: Monitoring Real-Time and Forecasted Wind Conditions Across the Globe';

export const SlideTile: Story = {
    name: 'Slide tile',
    parameters: {
        docs: {
            description: {
                story: 'News tiles with a background image, a play/pause `TileToggle` (shown on hover, focus and touch devices) and page dots.'
            }
        }
    },
    render: () => (
        <div className={ROW}>
            <SlideExample title="Wind Map: Monitoring Real-Time" dots={5} />
            <SlideExample size="s" title="Wind Map: Monitoring Real-Time" dots={5} />
            <SlideExample double title={WIND} dots={7} playing />
            <SlideExample double size="s" title={WIND} dots={7} playing />
        </div>
    )
};

const TEXTS: [string, string][] = [
    ['Title', 'Subtitle'],
    ['Title with very very very very very very long text', 'Subtitle with very very very very very very long text'],
    ['Title', 'Subtitle'],
    [
        'Title: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
        'Subtitle: Aute irure dolor in reprehenderit in voluptate velit esse cillum'
    ],
    ['Title: Iusto odio dignissimos ducimus', 'Subtitle: Lorem ipsum dolor sit amet']
];

function LineExample({
    texts: [title, subtitle],
    badge = false,
    action = false,
    disabled = false
}: {
    texts: [string, string];
    badge?: boolean;
    action?: boolean;
    disabled?: boolean;
}) {
    return (
        <Tile type="line" action={action} clickable={!action} disabled={disabled}>
            <TileHeader>
                {badge ? (
                    <TileTitleContainer>
                        <TileBadge>Badge</TileBadge>
                        <TileTitle>{title}</TileTitle>
                    </TileTitleContainer>
                ) : (
                    <TileTitle>{title}</TileTitle>
                )}
                <TileSubtitle>{subtitle}</TileSubtitle>
            </TileHeader>
            {action && (
                <TileActionContainer>
                    <TileActionIndicator tabIndex={-1} aria-label={`More actions for ${title}`} />
                    <TileActionClose aria-label={`Remove ${title}`} />
                </TileActionContainer>
            )}
        </Tile>
    );
}

export const LineTile: Story = {
    name: 'Line (link) tile',
    parameters: {
        docs: {
            description: {
                story: 'Line tiles in a `TileContainer`: floating in rows, or stacked with `list` (a long title wraps the subtitle to a second line). Badges go in a `TileTitleContainer`; in action mode the buttons go in a `TileActionContainer`.'
            }
        }
    },
    render: () => (
        <div className="flex max-w-3xl flex-col gap-6">
            <h3 className={HEADING}>Floating</h3>
            <TileContainer>
                {TEXTS.map((texts, i) => (
                    <LineExample key={i} texts={texts} />
                ))}
            </TileContainer>
            <h3 className={HEADING}>List</h3>
            <TileContainer list>
                {TEXTS.map((texts, i) => (
                    <LineExample key={i} texts={texts} />
                ))}
            </TileContainer>
            <h3 className={HEADING}>Floating with badge</h3>
            <TileContainer>
                {TEXTS.map((texts, i) => (
                    <LineExample key={i} texts={texts} badge />
                ))}
            </TileContainer>
            <h3 className={HEADING}>Floating in action mode, disabled</h3>
            <TileContainer>
                {TEXTS.map((texts, i) => (
                    <LineExample key={i} texts={texts} action disabled={i === TEXTS.length - 1} />
                ))}
            </TileContainer>
            <h3 className={HEADING}>List in action mode</h3>
            <TileContainer list>
                {TEXTS.map((texts, i) => (
                    <LineExample key={i} texts={texts} badge action />
                ))}
            </TileContainer>
        </div>
    )
};

const ACTION_TILES = ['Leave requests', 'Travel expenses'];

function ActionTiles() {
    const [tiles, setTiles] = useState(ACTION_TILES);
    return (
        <div className={ROW}>
            {tiles.map((tile, i) => (
                <Tile key={tile} type="launch" size={i === 1 ? 's' : undefined} action role="group" aria-label={tile}>
                    <TileActionClose
                        aria-label={`Remove ${tile}`}
                        onClick={() => setTiles((list) => list.filter((t) => t !== tile))}
                    />
                    <TileActionIndicator tabIndex={-1} aria-label={`More actions for ${tile}`} />
                    <TileHeader title={tile} subtitle="Subtitle" />
                    <TileContent>
                        <TileProfileImg backgroundImage={PERSON} aria-label="Profile Image" />
                    </TileContent>
                    <Footer>Footer Text</Footer>
                </Tile>
            ))}
            <Tile type="slide" double action role="group" aria-label="Wind map">
                <TileBackgroundImg backgroundImage={LANDSCAPE} />
                <TileToggle playing />
                <TileActionClose aria-label="Remove Wind map" />
                <TileActionIndicator tabIndex={-1} aria-label="More actions for Wind map" />
                <TileSlideContainer>
                    <TileHeader title={WIND} subtitle="SAP News" />
                    <TileFooter>
                        <TileFooterText>May 14, 2020</TileFooterText>
                    </TileFooter>
                    <TilePageIndicator>
                        {Array.from({ length: 7 }, (_, i) => (
                            <TileDot key={i} active={i === 2} />
                        ))}
                    </TilePageIndicator>
                </TileSlideContainer>
            </Tile>
            <button
                className="cursor-pointer border-0 bg-transparent p-0 font-sap-font-family text-sap-link-color underline"
                onClick={() => setTiles(ACTION_TILES)}
            >
                Reset
            </button>
        </div>
    );
}

export const ActionMode: Story = {
    name: 'Action mode',
    parameters: {
        docs: {
            description: {
                story: 'In `action` mode a tile shows an overlay, a close button (`TileActionClose`, at the top end corner) and an actions indicator (`TileActionIndicator`, at the bottom end), and hides the footer and the badge.'
            }
        }
    },
    render: () => <ActionTiles />
};
