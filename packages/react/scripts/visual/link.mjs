/** Visual cases for link; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        label: 'emphasized',
        ours: { story: 'components-link--visual-modifiers', selector: 'a:has-text("Emphasized Link")' },
        ref: { story: `${FS}link--primary`, selector: '.fd-link--emphasized >> nth=0' }
    },
    {
        label: 'subtle',
        ours: { story: 'components-link--visual-modifiers', selector: 'a:has-text("Subtle Link")' },
        ref: { story: `${FS}link--primary`, selector: '.fd-link--subtle >> nth=0' }
    },
    // "Standard Link" here, "Regular Link" in fundamental-styles: styles only
    {
        label: 'regular',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-link--standard', selector: 'a >> nth=0' },
        ref: { story: `${FS}link--primary`, selector: 'a.fd-link >> nth=0' }
    },
    {
        label: 'regular text',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-link--standard', selector: 'a >> nth=0 >> span >> nth=0' },
        ref: { story: `${FS}link--primary`, selector: 'a.fd-link >> nth=0 >> .fd-link__content' }
    },
    {
        label: 'regular hover text',
        hover: true,
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-link--standard', selector: 'a >> nth=0 >> span >> nth=0' },
        ref: { story: `${FS}link--primary`, selector: 'a.fd-link.is-hover >> nth=0 >> .fd-link__content' }
    },
    {
        label: 'disabled',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-link--states', selector: 'a[aria-disabled="true"]' },
        ref: { story: `${FS}link--primary`, selector: 'a.fd-link[aria-disabled="true"] >> nth=0' }
    },
    {
        label: 'inverted',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-link--inverted', selector: 'a' },
        ref: { story: `${FS}link--primary`, selector: 'a.fd-link--inverted >> nth=0' }
    }
];
