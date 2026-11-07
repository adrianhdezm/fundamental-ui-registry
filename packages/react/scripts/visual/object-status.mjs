/** Visual cases for object-status; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const OS = 'components-object-status--';
const REF = `${FS}object-status--`;

/** Our status whose text is `text` (the `nth` one in the story). */
const status = (text, nth = 0) => `span:has(> span:text-is("${text}")) >> nth=${nth}`;
const button = (text, nth = 0) => `[role="button"]:has(> span:text-is("${text}")) >> nth=${nth}`;
const REST = ':not(.is-hover):not(.is-focus):not(.is-active):not(.is-visited)';

export default [
    // plain statuses
    {
        label: 'icon and text negative',
        ours: { story: `${OS}icon-and-text`, selector: status('Negative') },
        ref: { story: `${REF}icon-and-text`, selector: '.fd-object-status--negative' }
    },
    {
        label: 'icon and text neutral',
        ours: { story: `${OS}icon-and-text`, selector: status('Neutral') },
        ref: { story: `${REF}icon-and-text`, selector: '.fd-object-status--neutral' }
    },
    {
        label: 'icon',
        ours: { story: `${OS}icon-and-text`, selector: `${status('Critical')} >> [data-glyph]` },
        ref: { story: `${REF}icon-and-text`, selector: '.fd-object-status--critical .fd-object-status__icon' }
    },
    {
        label: 'text positive',
        ours: { story: `${OS}text-only`, selector: status('Positive') },
        ref: { story: `${REF}text`, selector: '.fd-object-status--positive' }
    },
    {
        label: 'text informative',
        ours: { story: `${OS}text-only`, selector: status('Info') },
        ref: { story: `${REF}text`, selector: '.fd-object-status--informative' }
    },
    {
        label: 'icon only critical',
        ours: { story: `${OS}icon-only`, selector: 'span:has(> [aria-label="Critical"])' },
        ref: { story: `${REF}icon`, selector: '.fd-object-status--critical' }
    },
    {
        label: 'indication 3',
        ours: { story: `${OS}indication-colors`, selector: status('Yellow') },
        ref: { story: `${REF}generic-indication-colors`, selector: '.fd-object-status--indication-3' }
    },
    {
        label: 'indication 7',
        ours: { story: `${OS}indication-colors`, selector: status('Purple') },
        ref: { story: `${REF}generic-indication-colors`, selector: '.fd-object-status--indication-7' }
    },
    // clickable
    {
        label: 'clickable negative',
        ours: { story: `${OS}clickable`, selector: button('Negative') },
        ref: { story: `${REF}clickable-object-status`, selector: `.fd-object-status--negative${REST}` }
    },
    {
        label: 'clickable negative text',
        ours: { story: `${OS}clickable`, selector: `${button('Negative')} >> span:text-is("Negative")` },
        ref: {
            story: `${REF}clickable-object-status`,
            selector: `.fd-object-status--negative${REST} .fd-object-status__text`
        }
    },
    {
        label: 'clickable negative hover',
        hover: true,
        ours: { story: `${OS}clickable`, selector: button('Negative') },
        ref: { story: `${REF}clickable-object-status`, selector: '.fd-object-status--negative.is-hover' }
    },
    {
        label: 'clickable negative hover text',
        hover: true,
        ours: { story: `${OS}clickable`, selector: `${button('Negative')} >> span:text-is("Negative")` },
        ref: {
            story: `${REF}clickable-object-status`,
            selector: '.fd-object-status--negative.is-hover .fd-object-status__text'
        }
    },
    {
        label: 'clickable negative focus',
        focus: true,
        ours: { story: `${OS}clickable`, selector: button('Negative') },
        ref: { story: `${REF}clickable-object-status`, selector: '.fd-object-status--negative.is-focus' }
    },
    {
        label: 'clickable neutral',
        ours: { story: `${OS}clickable`, selector: button('Neutral') },
        ref: {
            story: `${REF}clickable-object-status`,
            selector: `.fd-object-status--link:has-text("Neutral")${REST} >> nth=0`
        }
    },
    {
        label: 'clickable indication 5 focus',
        focus: true,
        ours: { story: `${OS}clickable`, selector: button('Blue') },
        ref: { story: `${REF}clickable-object-status`, selector: '.fd-object-status--indication-5.is-focus' }
    },
    // inverted
    {
        label: 'inverted negative',
        ours: { story: `${OS}inverted`, selector: status('Inverted Negative') },
        ref: { story: `${REF}inverted`, selector: '.fd-object-status--inverted.fd-object-status--negative >> nth=0' }
    },
    {
        label: 'inverted neutral',
        ours: { story: `${OS}inverted`, selector: status('Inverted Neutral') },
        ref: { story: `${REF}inverted`, selector: '.fd-object-status--inverted:has-text("Inverted Neutral")' }
    },
    {
        label: 'inverted informative',
        ours: { story: `${OS}inverted`, selector: status('Inverted informative') },
        ref: { story: `${REF}inverted`, selector: '.fd-object-status--inverted:has-text("Inverted informative")' }
    },
    {
        label: 'inverted icon only',
        ours: { story: `${OS}inverted`, selector: 'span:has(> [aria-label="Negative"])' },
        ref: {
            story: `${REF}inverted`,
            selector: '.fd-object-status--inverted.fd-object-status--negative:not(:has(.fd-object-status__text))'
        }
    },
    {
        label: 'inverted icon and text critical',
        ours: { story: `${OS}inverted`, selector: status('Critical') },
        ref: {
            story: `${REF}inverted`,
            selector: '.fd-object-status--inverted.fd-object-status--critical:has(.fd-object-status__icon)'
        }
    },
    {
        label: 'inverted clickable positive',
        ours: { story: `${OS}inverted-clickable`, selector: button('Information', 2) },
        ref: { story: `${REF}inverted-states`, selector: `.fd-object-status--positive${REST}` }
    },
    {
        label: 'inverted clickable positive hover',
        hover: true,
        ours: { story: `${OS}inverted-clickable`, selector: button('Information', 2) },
        ref: { story: `${REF}inverted-states`, selector: '.fd-object-status--positive.is-hover:not(.is-focus)' }
    },
    {
        label: 'inverted clickable positive focus',
        focus: true,
        ours: { story: `${OS}inverted-clickable`, selector: button('Information', 2) },
        ref: { story: `${REF}inverted-states`, selector: '.fd-object-status--positive.is-focus:not(.is-hover)' }
    },
    {
        label: 'inverted clickable neutral hover',
        hover: true,
        ours: { story: `${OS}inverted-clickable`, selector: button('Neutral') },
        ref: {
            story: `${REF}inverted-states`,
            selector: '.fd-object-status--link:has-text("Neutral").is-hover:not(.is-focus)'
        }
    },
    {
        label: 'inverted indication 4',
        ours: { story: `${OS}inverted-indication`, selector: status('Indication4') },
        ref: {
            story: `${REF}inverted-indication`,
            selector: '.fd-object-status--indication-4:not(.fd-object-status--link)'
        }
    },
    {
        label: 'inverted indication 7 hover',
        hover: true,
        ours: { story: `${OS}inverted-indication`, selector: button('Indication7') },
        ref: { story: `${REF}inverted-indication`, selector: '.fd-object-status--indication-7.is-hover' }
    },
    {
        label: 'inverted indication 10 focus',
        focus: true,
        ours: { story: `${OS}inverted-indication`, selector: button('Indication10') },
        ref: { story: `${REF}inverted-indication`, selector: '.fd-object-status--indication-10.is-focus' }
    },
    {
        label: 'secondary indication 6b',
        ours: { story: `${OS}inverted-indication-secondary`, selector: status('Indication6b') },
        ref: {
            story: `${REF}inverted-indication-secondary`,
            selector: '.fd-object-status--indication-6b:not(.fd-object-status--link)'
        }
    },
    {
        label: 'secondary indication 2b hover',
        hover: true,
        ours: { story: `${OS}inverted-indication-secondary`, selector: button('Indication2b') },
        ref: { story: `${REF}inverted-indication-secondary`, selector: '.fd-object-status--indication-2b.is-hover' }
    },
    // large
    {
        label: 'large positive',
        ours: { story: `${OS}large`, selector: status('Positive') },
        ref: { story: `${REF}large-object-status`, selector: '.fd-object-status--large.fd-object-status--positive' }
    },
    {
        label: 'large neutral',
        ours: { story: `${OS}large`, selector: status('Neutral') },
        ref: { story: `${REF}large-object-status`, selector: '.fd-object-status--large:has-text("Neutral")' }
    },
    {
        label: 'large inverted',
        ours: { story: `${OS}large`, selector: status('Inverted Negative') },
        ref: {
            story: `${REF}inverted`,
            selector: '.fd-object-status--inverted.fd-object-status--negative.fd-object-status--large'
        }
    },
    // truncation
    {
        label: 'wrapping',
        ours: { story: `${OS}truncated`, selector: 'span >> nth=0' },
        ref: { story: `${REF}truncate-example`, selector: '.fd-object-status >> nth=0' }
    },
    {
        label: 'truncate',
        ours: { story: `${OS}truncated`, selector: 'span.truncate >> nth=0 >> ..' },
        ref: { story: `${REF}truncate-example`, selector: '.fd-object-status--truncate.fd-object-status--critical' }
    },
    {
        label: 'truncate inverted',
        ours: {
            story: `${OS}truncated`,
            selector: status('Inverted Negative with very, very long text which truncates')
        },
        ref: {
            story: `${REF}truncate-example`,
            selector: '.fd-object-status--truncate.fd-object-status--inverted:not(.fd-object-status--link)'
        }
    }
];
