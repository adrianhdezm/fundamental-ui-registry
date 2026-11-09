/** Visual cases for object-marker; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const OM = 'components-object-marker--';
const REF = `${FS}object-marker--`;

/** Our marker whose label is `text`. */
const marker = (text, nth = 0) => `:is(span, a):has(> span:text-is("${text}")):not(.sr-only-sap) >> nth=${nth}`;
/** Our icon-only marker whose icon title is `title`. */
const iconMarker = (title) => `[role="img"]:has(> [title="${title}"])`;

export default [
    // icon only
    {
        label: 'icon only',
        ours: { story: `${OM}icon-only`, selector: iconMarker('Request') },
        ref: { story: `${REF}icon-only`, selector: '.fd-object-marker >> nth=0' }
    },
    {
        // a narrow glyph: the icon is as wide as the glyph
        label: 'icon only flag',
        ours: { story: `${OM}icon-only`, selector: iconMarker('Flag') },
        ref: { story: `${REF}icon-only`, selector: '.fd-object-marker >> nth=2' }
    },
    // text only
    {
        label: 'text only',
        ours: { story: `${OM}text-only`, selector: marker('Draft') },
        ref: { story: `${REF}marker-text`, selector: '.fd-object-marker >> nth=0' }
    },
    {
        label: 'text only text',
        ours: { story: `${OM}text-only`, selector: `${marker('Locked')} >> span:text-is("Locked")` },
        ref: { story: `${REF}marker-text`, selector: '.fd-object-marker__text >> nth=1' }
    },
    // icon and text
    {
        label: 'icon and text',
        ours: { story: `${OM}icon-and-text`, selector: marker('Favourite') },
        ref: { story: `${REF}icon-and-text`, selector: '.fd-object-marker >> nth=1' }
    },
    {
        label: 'icon and text locked',
        ours: { story: `${OM}icon-and-text`, selector: marker('Locked') },
        ref: { story: `${REF}icon-and-text`, selector: '.fd-object-marker >> nth=4' }
    },
    {
        label: 'icon and text text',
        ours: { story: `${OM}icon-and-text`, selector: `${marker('Request')} >> span:text-is("Request")` },
        ref: { story: `${REF}icon-and-text`, selector: '.fd-object-marker__text >> nth=0' }
    },
    // clickable
    {
        label: 'clickable',
        ours: { story: `${OM}clickable`, selector: marker('Unsaved Changes') },
        ref: { story: `${REF}clickable-object-marker`, selector: '.fd-object-marker >> nth=1' }
    },
    {
        label: 'clickable text',
        ours: { story: `${OM}clickable`, selector: `${marker('Unsaved Changes')} >> span:text-is("Unsaved Changes")` },
        ref: { story: `${REF}clickable-object-marker`, selector: '.fd-object-marker__text >> nth=1' }
    },
    {
        label: 'clickable locked',
        ours: { story: `${OM}clickable`, selector: marker('Locked') },
        ref: { story: `${REF}clickable-object-marker`, selector: '.fd-object-marker >> nth=0' }
    },
    {
        label: 'clickable hover',
        hover: true,
        ours: { story: `${OM}clickable`, selector: marker('Unsaved Changes') },
        ref: { story: `${REF}clickable-object-marker`, selector: '.fd-object-marker >> nth=1' }
    },
    {
        label: 'clickable hover text',
        hover: true,
        ours: { story: `${OM}clickable`, selector: `${marker('Unsaved Changes')} >> span:text-is("Unsaved Changes")` },
        ref: { story: `${REF}clickable-object-marker`, selector: '.fd-object-marker__text >> nth=1' }
    },
    {
        label: 'clickable focus',
        focus: true,
        refFocus: true,
        ours: { story: `${OM}clickable`, selector: marker('Unsaved Changes') },
        ref: { story: `${REF}clickable-object-marker`, selector: '.fd-object-marker >> nth=1' }
    },
    {
        label: 'clickable focus icon',
        focus: true,
        refFocus: true,
        ours: { story: `${OM}clickable`, selector: marker('Locked') },
        ref: { story: `${REF}clickable-object-marker`, selector: '.fd-object-marker >> nth=0' }
    }
];
