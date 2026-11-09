/** Visual cases for button; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    ...[
        ['default', 'Options', 'button >> nth=1', 'button.fd-button >> nth=0'],
        ['emphasized', 'Options', 'button >> nth=0', '.fd-button--emphasized'],
        ['transparent', 'Options', 'button >> nth=2', '.fd-button--transparent'],
        ['ghost', 'Types', 'button:has-text("Ghost Button")', '.fd-button--ghost'],
        ['positive', 'Types', 'button:has-text("Positive Button")', '.fd-button--positive'],
        ['negative', 'Types', 'button:has-text("Negative Button")', '.fd-button--negative'],
        ['attention', 'Types', 'button:has-text("Attention Button")', '.fd-button--attention']
    ].map(([label, story, ours, ref]) => ({
        label,
        ours: { story: `components-button--${story.toLowerCase()}`, selector: ours },
        ref: { story: `${FS}buttons-button--styles`, selector: ref }
    })),
    {
        label: 'default hover',
        hover: true,
        ours: { story: 'components-button--options', selector: 'button >> nth=1' },
        ref: { story: `${FS}buttons-button--styles`, selector: 'button.fd-button >> nth=0' }
    },
    {
        label: 'emphasized hover',
        hover: true,
        ours: { story: 'components-button--options', selector: 'button >> nth=0' },
        ref: { story: `${FS}buttons-button--styles`, selector: '.fd-button--emphasized' }
    },
    {
        label: 'toggled',
        ours: { story: 'components-button--toggled', selector: 'button >> nth=0' },
        ref: { story: `${FS}buttons-button--toggle`, selector: '.fd-button--toggled >> nth=0' }
    },
    {
        label: 'disabled',
        ours: { story: 'components-button--state', selector: 'button:has(> span:text-is("Disabled State"))' },
        ref: { story: `${FS}buttons-button--button-states`, selector: 'button:text-is("Disabled State") >> nth=1' }
    },
    {
        label: 'icon only',
        ours: { story: 'components-button--icons', selector: '[aria-label="Cart standard"]' },
        ref: { story: `${FS}buttons-button--icon-and-text`, selector: 'button[title="Add to cart"] >> nth=1' }
    },
    {
        label: 'icon only emphasized',
        ours: { story: 'components-button--icons', selector: '[aria-label="Cart emphasized"]' },
        ref: { story: `${FS}buttons-button--icon-and-text`, selector: 'button[title="Add to cart"] >> nth=0' }
    },
    {
        label: 'menu icon only',
        ours: { story: 'components-button--menu', selector: '[aria-label="Menu standard"]' },
        ref: {
            story: `${FS}buttons-button--menu-button`,
            selector: '.fd-button--menu:not(:has(.fd-button__text)) >> nth=1'
        }
    },
    {
        label: 'badge',
        pixels: false,
        // different numbers in the two stories
        ignore: ['width'],
        ours: { story: 'components-button--badge', selector: '[aria-label="999 notifications"] span.absolute' },
        ref: { story: `${FS}buttons-button--badge-on-button`, selector: '.fd-button__badge >> nth=0' }
    },
    {
        label: 'badge attention',
        pixels: false,
        ours: { story: 'components-button--badge', selector: '[aria-label="Messages"] span.absolute' },
        ref: { story: `${FS}buttons-button--badge-on-button`, selector: '.fd-button__badge--attention >> nth=0' }
    }
];
