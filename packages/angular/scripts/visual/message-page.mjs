/** Visual cases for message-page; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        // start-aligned lines (message-page-1); the column centres the box of a short subtitle
        label: 'subtitle',
        props: ['margin-top', 'margin-bottom', 'text-align', 'max-width'],
        ours: { story: 'components-message-page--filter', selector: 'fd-message-page-subtitle' },
        ref: { story: `${FS}message-page--filter`, selector: '.fd-message-page__subtitle' }
    }
];
