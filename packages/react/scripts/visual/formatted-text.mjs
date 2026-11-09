/** Visual cases for formatted-text; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// fundamental-styles has no formatted text: these cases check the typography of the sanitised markup of our Default
// story against fundamental-styles' title, text and link. The texts differ: styles only. The line height is the SAP
// content line height (multi-line rich text, as Angular), where the single-line references have `normal`.
const FT = 'components-formatted-text--default';

export default [
    {
        label: 'h3 heading',
        pixels: false,
        ignore: ['width', 'height', 'line-height'],
        ours: { story: FT, selector: 'h3' },
        ref: { story: `${FS}title--levels`, selector: 'h3' }
    },
    {
        label: 'paragraph',
        pixels: false,
        ignore: ['width', 'height', 'line-height'],
        ours: { story: FT, selector: 'p >> nth=0' },
        ref: { story: `${FS}text--default-example`, selector: '.fd-text >> nth=0' }
    },
    {
        label: 'link',
        pixels: false,
        ignore: ['width', 'height', 'line-height'],
        ours: { story: FT, selector: 'a[href^="https"]' },
        ref: { story: `${FS}link--primary`, selector: 'a.fd-link >> nth=0' }
    },
    {
        label: 'link hover',
        hover: true,
        pixels: false,
        ignore: ['width', 'height', 'line-height'],
        ours: { story: FT, selector: 'a[href^="https"]' },
        ref: { story: `${FS}link--primary`, selector: 'a.fd-link.is-hover >> nth=0 >> .fd-link__content' }
    }
];
