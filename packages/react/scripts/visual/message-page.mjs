/** Visual cases for message-page; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const ours = (story, selector) => ({ story: `components-message-page--${story}`, selector });
const ref = (story, selector) => ({ story: `${FS}message-page--${story}`, selector });
const PAGE = 'div:has(> div > [role=status])';
const CONTAINER = 'div:has(> [role=status])';
const ICON_CONTAINER = `${CONTAINER} > div:first-child`;
const FLEX = ['display', 'flex-direction', 'justify-content', 'align-items', 'max-width'];

export default [
    {
        label: 'page',
        pixels: false,
        props: FLEX,
        // our story frame is 32rem high, fundamental-styles' 600px
        ignore: ['height'],
        ours: ours('filter', PAGE),
        ref: ref('filter', '.fd-message-page')
    },
    // the stories have the same texts: the whole container compares by pixels
    ...[
        ['filter', 'filter'],
        ['search', 'search'],
        ['no-items', 'no-items'],
        ['error', 'error-page']
    ].map(([story, our]) => ({
        label: `container (${story})`,
        props: FLEX,
        ours: ours(our, CONTAINER),
        ref: ref(story, '.fd-message-page__container')
    })),
    {
        label: 'icon container',
        props: FLEX,
        ours: ours('filter', ICON_CONTAINER),
        ref: ref('filter', '.fd-message-page__icon-container')
    },
    ...[
        ['filter', 'filter'],
        ['search', 'search'],
        ['no-items', 'no-items'],
        ['error', 'error-page'],
        ['buttons', 'actions']
    ].map(([story, our]) => ({
        label: `icon (${story})`,
        props: ['opacity', 'max-width'],
        ours: ours(our, `${ICON_CONTAINER} > span`),
        ref: ref(story, '.fd-message-page__icon')
    })),
    {
        label: 'content',
        props: FLEX,
        ours: ours('filter', '[role=status]'),
        ref: ref('filter', '.fd-message-page__content')
    },
    {
        label: 'title',
        props: ['margin-top', 'margin-bottom', 'text-align', 'max-width'],
        ours: ours('filter', '[role=status] > div >> nth=0'),
        ref: ref('filter', '.fd-message-page__title')
    },
    {
        label: 'subtitle',
        props: ['margin-top', 'margin-bottom', 'text-align', 'max-width'],
        ours: ours('filter', '[role=status] > div >> nth=1'),
        ref: ref('filter', '.fd-message-page__subtitle')
    },
    {
        label: 'subtitle with a link',
        props: ['margin-bottom', 'text-align'],
        ours: ours('error-page', '[role=status] > div >> nth=1'),
        ref: ref('error', '.fd-message-page__subtitle')
    },
    // Angular's texts in the actions story, fundamental-styles' lorem ipsum and title-case labels: styles only
    {
        label: 'title (with actions)',
        pixels: false,
        props: ['margin-top', 'margin-bottom', 'text-align'],
        ignore: ['width'],
        ours: ours('actions', '[role=status] > div >> nth=0'),
        ref: ref('buttons', '.fd-message-page__title')
    },
    {
        label: 'subtitle (formatted text)',
        pixels: false,
        props: ['margin-bottom', 'text-align'],
        ignore: ['width', 'height'],
        ours: ours('actions', '[role=status] > div >> nth=1'),
        ref: ref('buttons', '.fd-message-page__subtitle')
    },
    {
        label: 'actions',
        pixels: false,
        props: [...FLEX, 'flex-wrap', 'min-height'],
        // as wide as the buttons
        ignore: ['width'],
        ours: ours('actions', '[role=status] > div >> nth=2'),
        ref: ref('buttons', '.fd-message-page__actions')
    },
    {
        label: 'more',
        pixels: false,
        props: [...FLEX, 'margin-top', 'min-height'],
        ignore: ['width'],
        ours: ours('actions', '[role=status] > div >> nth=3'),
        ref: ref('buttons', '.fd-message-page__more')
    }
];
