/** Visual cases for message-box; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// open message boxes rendered into the page (no backdrop), as fundamental-styles' static message boxes
const OURS = 'components-message-box--variants';
const box = (variant) => `[data-variant="${variant}"]`;
const TYPES = `${FS}message-box--types`;
const RESPONSIVE = `${FS}message-box--responsive`;

const type = (name) => ({
    label: `${name} message box`,
    ours: { story: OURS, selector: box(name) },
    ref: { story: TYPES, selector: `.fd-message-box--${name} .fd-message-box__content` }
});

const header = (name) => ({
    label: `${name} header bar`,
    ours: { story: OURS, selector: `${box(name)} [data-dialog-header] > [data-dialog-bar]` },
    ref: { story: TYPES, selector: `.fd-message-box--${name} .fd-message-box__header` }
});

const icon = (name) => ({
    label: `${name} semantic icon`,
    props: ['margin-inline-end'],
    ours: { story: OURS, selector: `${box(name)} [data-message-box-semantic-icon]` },
    ref: { story: TYPES, selector: `.fd-message-box--${name} .fd-message-box__header i` }
});

const size = (name) => ({
    label: `message box, padding ${name}`,
    ours: { story: OURS, selector: box(name) },
    ref: { story: RESPONSIVE, selector: `.fd-message-box__content--${name}` }
});

export default [
    ...['confirmation', 'error', 'success', 'warning', 'information'].map(type),
    ...['confirmation', 'error', 'success', 'warning', 'information'].map(header),
    ...['confirmation', 'error', 'success', 'warning', 'information'].map(icon),
    {
        label: 'title',
        ours: { story: OURS, selector: `${box('confirmation')} h1` },
        ref: { story: TYPES, selector: '.fd-message-box--confirmation .fd-title' }
    },
    {
        label: 'body',
        ours: { story: OURS, selector: `${box('confirmation')} [data-dialog-body]` },
        ref: { story: TYPES, selector: '.fd-message-box--confirmation .fd-message-box__body' }
    },
    {
        label: 'footer bar',
        ours: { story: OURS, selector: `${box('confirmation')} [data-dialog-footer] > [data-dialog-bar]` },
        ref: { story: TYPES, selector: '.fd-message-box--confirmation .fd-message-box__footer' }
    },
    {
        label: 'emphasized decisive button',
        ours: { story: OURS, selector: `${box('confirmation')} [data-dialog-footer] button >> nth=0` },
        ref: { story: TYPES, selector: '.fd-message-box--confirmation .fd-button--emphasized' }
    },
    {
        label: 'transparent decisive button',
        ours: { story: OURS, selector: `${box('confirmation')} [data-dialog-footer] button >> nth=1` },
        ref: { story: TYPES, selector: '.fd-message-box--confirmation .fd-button--transparent' }
    },
    ...['s', 'm', 'l', 'xl'].map(size),
    {
        label: 'body, padding xl',
        ours: { story: OURS, selector: `${box('xl')} [data-dialog-body]` },
        ref: { story: RESPONSIVE, selector: '.fd-message-box__content--xl .fd-message-box__body' }
    },
    {
        label: 'show more',
        props: ['margin-top'],
        ours: { story: OURS, selector: `${box('s')} [data-dialog-body] > div` },
        ref: { story: RESPONSIVE, selector: '.fd-message-box__more' }
    }
];
