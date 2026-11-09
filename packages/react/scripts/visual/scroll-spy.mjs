/** Visual cases for scroll-spy; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// The scroll spy has no visuals of its own (fundamental-styles has no story for it): these cases check the table of
// contents of our story, built from Link and Title, against fundamental-styles' links and titles. The texts are the
// story's section names: styles only. The Detection threshold story is the same table of contents without the play
// of the first story, which leaves a link focused.
const TOC = 'components-scroll-spy--detection-threshold';

export default [
    {
        label: 'current entry (emphasized link)',
        pixels: false,
        ignore: ['width'],
        ours: { story: TOC, selector: 'nav a[aria-current="location"]' },
        ref: { story: `${FS}link--primary`, selector: '.fd-link--emphasized >> nth=0' }
    },
    {
        label: 'entry (link)',
        pixels: false,
        ignore: ['width'],
        ours: { story: TOC, selector: 'nav a:not([aria-current]) >> nth=0' },
        ref: { story: `${FS}link--primary`, selector: 'a.fd-link >> nth=0' }
    },
    {
        label: 'entry hover',
        hover: true,
        pixels: false,
        ignore: ['width'],
        ours: { story: TOC, selector: 'nav a:not([aria-current]) >> nth=0 >> span >> nth=0' },
        ref: { story: `${FS}link--primary`, selector: 'a.fd-link.is-hover >> nth=0 >> .fd-link__content' }
    },
    {
        label: 'section title (h3 in header size 5)',
        pixels: false,
        ignore: ['width'],
        ours: { story: TOC, selector: 'section h3 >> nth=0' },
        ref: { story: `${FS}title--levels`, selector: 'h5' }
    }
];
