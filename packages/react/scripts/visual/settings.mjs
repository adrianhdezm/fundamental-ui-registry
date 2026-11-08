/** Visual cases for settings; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// our User account story repeats fundamental-styles' User account story inline, at the size of its dialog body
// (60rem wide, the 42.5rem window less its footer bar: 39.75rem, compact 40rem)
const OURS = 'components-settings--user-account';
const REF = `${FS}settings--user-account`;

export default [
    {
        label: 'list area',
        ours: { story: OURS, selector: '[data-settings-list-area]' },
        ref: { story: REF, selector: '.fd-settings__list-area' }
    },
    {
        label: 'list item, selected',
        ours: { story: OURS, selector: '[data-settings-list-area] [data-slot=list-item] >> nth=0' },
        ref: { story: REF, selector: '.fd-settings__list .fd-list__item >> nth=0' }
    },
    {
        label: 'list item',
        ours: { story: OURS, selector: '[data-settings-list-area] [data-slot=list-item] >> nth=1' },
        ref: { story: REF, selector: '.fd-settings__list .fd-list__item >> nth=1' }
    },
    {
        label: 'list item hover',
        hover: true,
        ours: { story: OURS, selector: '[data-settings-list-area] [data-slot=list-link] >> nth=1' },
        ref: { story: REF, selector: '.fd-settings__list .fd-list__link >> nth=1' }
    },
    {
        label: 'detail area',
        // the avatar image differs (fundamental-styles' portrait photo): styles only
        pixels: false,
        ours: { story: OURS, selector: '[data-settings-detail-area]' },
        ref: { story: REF, selector: '.fd-settings__detail-area' }
    },
    {
        label: 'detail header',
        ours: { story: OURS, selector: '[data-settings-header]' },
        ref: { story: REF, selector: '.fd-settings__header' }
    },
    {
        label: 'content',
        pixels: false,
        ours: { story: OURS, selector: '[data-settings-detail-area] div.scrollbar-sap' },
        ref: { story: REF, selector: '.fd-settings__content' }
    },
    {
        label: 'profile card',
        pixels: false,
        props: ['gap', 'align-items'],
        ours: { story: OURS, selector: '[data-settings-detail-area] h3 >> xpath=..' },
        ref: { story: REF, selector: '.fd-settings__profile-card' }
    },
    {
        label: 'profile card name',
        props: ['margin-top'],
        ours: { story: OURS, selector: '[data-settings-detail-area] h3' },
        ref: { story: REF, selector: '.fd-settings__profile-card-name' }
    },
    {
        label: 'profile card subline',
        ours: { story: OURS, selector: '[data-settings-detail-area] h3 + div' },
        ref: { story: REF, selector: '.fd-settings__profile-card-subline >> nth=0' }
    },
    {
        label: 'profile card button',
        props: ['margin-top'],
        ours: { story: OURS, selector: '[data-settings-detail-area] h3 ~ button' },
        ref: { story: REF, selector: '.fd-settings__profile-card button' }
    }
];
