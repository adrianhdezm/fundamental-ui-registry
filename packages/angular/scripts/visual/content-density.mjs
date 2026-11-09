/** Visual cases for content-density; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// ContentDensity renders nothing of its own (fundamental-styles has no story for it; its density is the
// `is-compact` class the toolbar sets). The Nested densities story wraps a button and an input in a section of the
// other density and, inside it, a section of the toolbar density again, so they match fundamental-styles' button and
// input of that density only if both overrides work.
const NESTED = 'components-content-density--nested-densities';

export default [
    {
        label: 'button in the nested density',
        ours: { story: NESTED, selector: '[data-testid="nested"] button' },
        ref: { story: `${FS}buttons-button--styles`, selector: 'button.fd-button >> nth=0' }
    },
    {
        label: 'button hover in the nested density',
        hover: true,
        ours: { story: NESTED, selector: '[data-testid="nested"] button' },
        ref: { story: `${FS}buttons-button--styles`, selector: 'button.fd-button >> nth=0' }
    },
    {
        // fundamental-styles' input fills the story width: styles only
        label: 'input in the nested density',
        pixels: false,
        ignore: ['width'],
        ours: { story: NESTED, selector: '[data-testid="nested"] input' },
        ref: { story: `${FS}forms-input--primary`, selector: '#input-default' }
    }
];
