/** Visual cases for object-status; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const OS = 'components-object-status--';
const REF = `${FS}object-status--`;
const STATUS = '[fd-object-status]';

export default [
    // icon-only statuses: as wide as the icon (object-status-1)
    {
        label: 'icon only critical',
        ours: { story: `${OS}default`, selector: `${STATUS} >> nth=1` },
        ref: { story: `${REF}icon`, selector: '.fd-object-status--critical' }
    },
    {
        label: 'inverted icon only',
        ours: { story: `${OS}inverted`, selector: `${STATUS} >> nth=0` },
        ref: {
            story: `${REF}inverted`,
            selector: '.fd-object-status--inverted.fd-object-status--negative:not(:has(.fd-object-status__text))'
        }
    },
    // large inverted: the regular 72 font (object-status-2); ours is clickable with another text: styles only
    {
        label: 'large inverted',
        pixels: false,
        ignore: ['width', 'cursor'],
        ours: { story: `${OS}large`, selector: `${STATUS} >> nth=19` },
        ref: {
            story: `${REF}inverted`,
            selector: '.fd-object-status--inverted.fd-object-status--negative.fd-object-status--large'
        }
    },
    // focused clickable: the contrast colour in Horizon, the status colour in HC (object-status-3); other texts
    {
        label: 'clickable negative focus',
        focus: true,
        pixels: false,
        ignore: ['width'],
        ours: { story: `${OS}default`, selector: `${STATUS} >> nth=24` },
        ref: { story: `${REF}clickable-object-status`, selector: '.fd-object-status--negative.is-focus' }
    }
];
