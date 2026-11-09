/** Visual cases for layout-panel; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-layouts-';

export default [
    {
        label: 'title',
        // fundamental-styles' text is the class name of the part, ours a readable text: styles only; ours is the
        // heading itself, fundamental-styles wraps an h5 in a div
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-layout-panel--transparent', selector: '[fd-layout-panel-title]' },
        ref: { story: `${FS}layout-panel--transparent-background`, selector: '.fd-layout-panel__title h5' }
    },
    {
        // a 10rem panel (layout-panel-2): the title keeps its type and wraps in the head. Neither head shrinks under
        // its title; fundamental-styles' head does not wrap either, so its actions run outside its panel, where ours
        // wrap below the head: the sizes differ there, styles only
        label: 'narrow title',
        viewport: { width: 192, height: 800 },
        pixels: false,
        ignore: ['width', 'height'],
        ours: { story: 'components-layout-panel--narrow', selector: '[fd-layout-panel-title]' },
        ref: { story: `${FS}layout-panel--primary`, selector: '.fd-layout-panel__title h5' }
    },
    {
        label: 'narrow panel',
        viewport: { width: 192, height: 800 },
        pixels: false,
        ignore: ['height'],
        ours: { story: 'components-layout-panel--narrow', selector: 'fd-layout-panel' },
        ref: { story: `${FS}layout-panel--primary`, selector: '.fd-layout-panel' }
    }
];
