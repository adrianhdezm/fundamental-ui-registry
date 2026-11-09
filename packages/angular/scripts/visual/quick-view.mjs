/** Visual cases for quick-view; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// the subheader bar keeps the bar's minimum height (quick-view-1); the texts differ, so by computed style
const FLEX = ['display', 'flex-direction', 'align-items', 'justify-content'];

export default [
    {
        label: 'subheader',
        pixels: false,
        props: FLEX,
        ignore: ['width', 'height'],
        ours: { story: 'components-quick-view--default', selector: 'fd-quick-view-subheader [fd-bar] >> nth=0' },
        ref: { story: `${FS}quick-view--popover`, selector: '.fd-bar--header-with-subheader' }
    }
];
