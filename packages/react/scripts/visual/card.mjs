/** Visual cases for card; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our "Main header anatomy", "Interactive card states", "Numeric header" and "Title on media colours" stories follow
// fundamental-styles' Card stories with the same texts and sizes. fundamental-styles' avatars and media images do
// not load in its Storybook (an empty transparent box), ours show a photo: parts holding an avatar or an image
// compare by computed styles, the texts, badges, footers and content areas also by pixels.
const ours = (story, selector) => ({ story: `components-card--${story}`, selector });
const ref = (story, selector) => ({ story: `${FS}card-${story}`, selector });

const HEADER = '[aria-roledescription="Card Header"]';
const LISTITEM = '[role=listitem]';
const FLEX = ['display', 'flex-direction', 'align-items', 'justify-content', 'column-gap', 'row-gap'];

export default [
    // the parts of a card (Standard card | Main Header)
    {
        label: 'card',
        pixels: false,
        props: ['display', 'flex-direction', 'overflow'],
        ours: ours('anatomy', '[role=region] >> nth=0'),
        ref: ref('card--card-anatomy', '.fd-card >> nth=0')
    },
    {
        label: 'header',
        pixels: false,
        ours: ours('anatomy', `${HEADER} >> nth=0`),
        ref: ref('card--card-anatomy', '.fd-card__header >> nth=0')
    },
    {
        label: 'main header',
        pixels: false,
        props: FLEX,
        ours: ours('anatomy', `${HEADER} > div >> nth=0`),
        ref: ref('card--card-anatomy', '.fd-card__header-main >> nth=0')
    },
    {
        label: 'main header container (avatar and texts)',
        pixels: false,
        props: FLEX,
        ours: ours('anatomy', `${HEADER} > div > div:first-child >> nth=0`),
        ref: ref('card--card-anatomy', '.fd-card__header-main-container >> nth=0')
    },
    {
        label: 'title',
        ours: ours('anatomy', 'h3 >> nth=0'),
        ref: ref('card--card-anatomy', '.fd-card__title >> nth=0')
    },
    {
        label: 'subtitle',
        ours: ours('anatomy', '[id^="fd-card-subtitle-"] >> nth=0'),
        ref: ref('card--card-anatomy', '.fd-card__subtitle >> nth=0')
    },
    {
        label: 'title truncated after three lines',
        ours: ours('anatomy', 'h3 >> nth=2'),
        ref: ref('card--card-anatomy', '.fd-card__title >> nth=2')
    },
    {
        label: 'subtitle truncated after two lines',
        ours: ours('anatomy', '[id^="fd-card-subtitle-"] >> nth=2'),
        ref: ref('card--card-anatomy', '.fd-card__subtitle >> nth=2')
    },
    {
        label: 'counter',
        ours: ours('anatomy', '[id^="fd-card-counter-"] >> nth=0'),
        ref: ref('card--card-anatomy', '.fd-card__counter >> nth=0')
    },
    {
        label: 'header actions (overflow button and counter)',
        props: FLEX,
        ours: ours('anatomy', `${HEADER} > div > div:nth-child(2) >> nth=0`),
        ref: ref('card--card-anatomy', '.fd-card__header-main-actions >> nth=0')
    },
    {
        label: 'content',
        ours: ours('anatomy', '[role=region] >> nth=0 >> :scope > div:nth-child(2)'),
        ref: ref('card--card-anatomy', '.fd-card__content >> nth=0')
    },
    {
        label: 'footer with actions',
        props: FLEX,
        ours: ours('anatomy', '[role=region] >> nth=0 >> :scope > div:last-child'),
        ref: ref('card--card-anatomy', '.fd-card__footer >> nth=0')
    },
    {
        label: 'footer with a link',
        ours: ours('anatomy', '[role=region] >> nth=2 >> :scope > div:last-child'),
        ref: ref('card--card-anatomy', '.fd-card__footer >> nth=2')
    },
    {
        label: 'interactive header (hover)',
        pixels: false,
        hover: true,
        ours: ours('anatomy', 'div:has(> [role=button]) >> nth=0'),
        ref: ref('card--card-anatomy', '.fd-card__header--interactive .fd-card__header-main >> nth=0')
    },
    {
        label: 'interactive header area (focus)',
        // the focus frame is the ::before of the area, checked in the spec; fundamental-styles' story is the media one
        pixels: false,
        focus: true,
        ignore: ['width'],
        ours: ours('anatomy', '[role=button] >> nth=0'),
        ref: {
            story: `${FS}card-media-card--card-media`,
            selector: '.fd-card__header-main-container.is-focus >> nth=0'
        }
    },
    {
        label: 'badges',
        props: FLEX,
        ours: ours('anatomy', '[data-card-badges] >> nth=0'),
        ref: ref('card--card-anatomy', '.fd-card__badge-container >> nth=0')
    },
    {
        label: 'badge',
        ours: ours('anatomy', '[data-card-badges] > span >> nth=0'),
        ref: ref('card--card-anatomy', '.fd-card__badge >> nth=0')
    },
    {
        label: 'long badge with icon (truncated)',
        ours: ours('anatomy', '[data-card-badges] > span >> nth=1'),
        ref: ref('card--card-anatomy', '.fd-card__badge >> nth=1')
    },
    {
        label: 'badge with icon (secondary indication)',
        ours: ours('anatomy', '[data-card-badges] > span >> nth=2'),
        ref: ref('card--card-anatomy', '.fd-card__badge >> nth=2')
    },

    // interactive cards (role listitem); the press state cannot be held, the focus frame is the selected one
    {
        label: 'interactive card',
        pixels: false,
        ours: ours('interactive-states', `${LISTITEM} >> nth=0`),
        ref: ref('card--card-interactive-listitem', '.fd-card >> nth=0')
    },
    {
        label: 'interactive card (hover)',
        pixels: false,
        hover: true,
        ours: ours('interactive-states', `${LISTITEM} >> nth=1`),
        ref: ref('card--card-interactive-listitem', '.fd-card.is-hover')
    },
    {
        label: 'interactive card (focus)',
        pixels: false,
        focus: true,
        ours: ours('interactive-states', `${LISTITEM} >> nth=3`),
        ref: ref('card--card-interactive-listitem', '.fd-card.is-focus')
    },
    {
        label: 'interactive card content (hover background)',
        hover: true,
        ours: ours('interactive-states', `${LISTITEM} >> nth=1 >> :scope > div:nth-child(2)`),
        ref: ref('card--card-interactive-listitem', '.fd-card.is-hover .fd-card__content')
    },
    {
        label: 'selected card content (frame)',
        ours: ours('interactive-states', `${LISTITEM} >> nth=4 >> :scope > div:nth-child(2)`),
        ref: ref('card--card-interactive-listitem', '.fd-card.is-selected .fd-card__content')
    },

    // numeric header
    {
        label: 'numeric header',
        pixels: false,
        props: FLEX,
        // fundamental-styles adds a "Total value" form label row
        ignore: ['height'],
        ours: ours('numeric-header', '[aria-roledescription="Numeric content"]'),
        ref: ref('card--numeric-header', '.fd-card__header-numeric')
    },
    {
        label: 'numeric header row',
        pixels: false,
        props: FLEX,
        ours: ours('numeric-header', '[aria-roledescription="Numeric content"] > div'),
        ref: ref('card--numeric-header', '.fd-card__header-numeric > .fd-card__header-row >> nth=0')
    },
    {
        label: 'indicator',
        props: FLEX,
        ours: ours('numeric-header', '[aria-roledescription="Numeric content"] > div > div:nth-child(2)'),
        ref: ref('card--numeric-header', '.fd-card__indicator >> nth=0')
    },
    {
        label: 'indicator title',
        ours: ours(
            'numeric-header',
            '[aria-roledescription="Numeric content"] > div > div:nth-child(2) > span:first-child'
        ),
        ref: ref('card--numeric-header', '.fd-card__indicator-title >> nth=0')
    },
    {
        label: 'indicator value',
        ours: ours(
            'numeric-header',
            '[aria-roledescription="Numeric content"] > div > div:nth-child(2) > span:last-child'
        ),
        ref: ref('card--numeric-header', '.fd-card__indicator-value >> nth=0')
    },

    // extended header (texts and statuses differ)
    {
        label: 'extended header',
        pixels: false,
        props: FLEX,
        // the cards are 384px wide here, 500px there
        ignore: ['height', 'width'],
        ours: ours('extended-header', '[aria-roledescription="Extended content"] >> nth=0'),
        ref: ref('card--extended-header', '.fd-card__header-extended >> nth=0')
    },
    {
        label: 'extended header, bottom aligned',
        pixels: false,
        props: FLEX,
        // the cards are 384px wide here, 500px there
        ignore: ['height', 'width'],
        ours: ours('extended-header', '[aria-roledescription="Extended content"] >> nth=1'),
        ref: ref('card--extended-header', '.fd-card__header-extended--bottom-aligned >> nth=0')
    },
    {
        label: 'header column, end aligned',
        pixels: false,
        props: FLEX,
        ignore: ['height', 'width'],
        ours: ours('extended-header', '[aria-roledescription="Extended content"] >> nth=0 >> :scope > div:last-child'),
        ref: ref('card--extended-header', '.fd-card__header-column--right-aligned >> nth=0')
    },

    // media
    {
        label: 'media with an image',
        pixels: false,
        props: FLEX,
        // the image heights differ (a broken image there), and the card widths (320px here, 300px there)
        ignore: ['height', 'width'],
        ours: ours('media', '[aria-roledescription="Card Media Block"] >> nth=0'),
        ref: { story: `${FS}card-media-card--card-media`, selector: '.fd-card__media >> nth=1' }
    },
    {
        label: 'media with padding',
        pixels: false,
        ignore: ['height', 'width'],
        ours: ours('media', '[aria-roledescription="Card Media Block"] >> nth=1'),
        ref: { story: `${FS}card-media-card--card-media`, selector: '.fd-card__media--with-padding' }
    },
    ...[
        ['shell colour 1', 0, '.fd-card__media--bg-shell-1'],
        ['shell colour 3', 2, '.fd-card__media--bg-shell-3'],
        ['legend colour 1', 3, '.fd-card__media--bg-legend-1']
    ].map(([label, nth, selector]) => ({
        label: `title on media, ${label}`,
        ours: ours('media-colors', `[aria-roledescription="Card Media Block"] >> nth=${nth}`),
        ref: { story: `${FS}card-media-card--card-media-title`, selector }
    })),
    {
        label: 'media heading',
        ours: ours('media-colors', '[role=heading] >> nth=0'),
        ref: { story: `${FS}card-media-card--card-media-title`, selector: '.fd-card__media-heading >> nth=0' }
    },

    // banner
    {
        label: 'banner on a shell colour',
        ours: ours('banner', '[role=region] >> nth=0'),
        ref: { story: `${FS}card-media-card--card-media-banner`, selector: '.fd-card--banner >> nth=0' }
    },
    {
        label: 'banner text',
        ours: ours('banner', '[role=region] >> nth=0 >> p'),
        ref: { story: `${FS}card-media-card--card-media-banner`, selector: '.fd-card__media-text >> nth=0' }
    },
    {
        label: 'banner text over the image',
        pixels: false,
        props: FLEX,
        // the heading text differs
        ignore: ['height'],
        ours: ours('banner', '[aria-roledescription="Card Media Block"] >> nth=2 >> :scope > div:first-child'),
        ref: {
            story: `${FS}card-media-card--card-media-banner`,
            selector: '.fd-card__media-content-container--overlay >> nth=0'
        }
    },
    {
        label: 'banner image beside the overlay',
        pixels: false,
        ours: ours('banner', '[data-card-media-image] >> nth=1'),
        ref: { story: `${FS}card-media-card--card-media-banner`, selector: '.fd-card__media-image-container >> nth=1' }
    },

    // analytical and object cards (fundamental-styles' KPI is a numeric content block, texts differ)
    {
        label: 'analytical second subtitle',
        pixels: false,
        ignore: ['width'],
        ours: ours('analytical', '[id^="fd-card-second-subtitle-"]'),
        ref: ref('card--analytical-card', '.fd-card__second-subtitle >> nth=0')
    },
    {
        label: 'object card content',
        pixels: false,
        ignore: ['height', 'width'],
        ours: ours('object-card', '[role=region] >> nth=0 >> :scope > div:nth-child(2)'),
        ref: ref('card--object-card', '.fd-card--object .fd-card__content >> nth=0')
    }
];
