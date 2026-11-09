/** Visual cases for object-attribute; see ../visual.config.mjs for the fields. */
const DEV = 'sap-design-dev-object-attribute--';
const OA = 'components-object-attribute--';

/**
 * Object attribute is a dev component in fundamental-styles: its Storybook renders the markup without
 * object-attribute.css, so colours, cursor, decoration, opacity and truncation are the browser's defaults there.
 * These cases compare the typography and box only; the rest was compared by hand against the published
 * object-attribute.css (fundamental-styles 0.42.0) injected into the same stories.
 */
const UNSTYLED = ['color', 'cursor', 'text-decoration-line', 'opacity'];

export default [
    {
        label: 'text',
        pixels: false,
        ignore: UNSTYLED,
        ours: { story: `${OA}text`, selector: '[title="Standard Object Attribute Text"]' },
        ref: { story: `${DEV}text`, selector: '#standardtext' }
    },
    {
        label: 'link',
        pixels: false,
        ignore: UNSTYLED,
        ours: { story: `${OA}link`, selector: '[role="link"]:text-is("Text With Link")' },
        ref: { story: `${DEV}text-with-link`, selector: '#textwithlink' }
    },
    {
        label: 'link hover',
        hover: true,
        pixels: false,
        ignore: UNSTYLED,
        ours: { story: `${OA}link`, selector: '[role="link"]:text-is("Text With Link")' },
        ref: { story: `${DEV}text-with-link`, selector: '#textwithlink' }
    },
    {
        label: 'link focus',
        focus: true,
        refFocus: true,
        pixels: false,
        ignore: UNSTYLED,
        ours: { story: `${OA}link`, selector: '[role="link"]:text-is("Text With Link")' },
        ref: { story: `${DEV}text-with-link`, selector: '#textwithlink' }
    },
    {
        label: 'disabled link',
        pixels: false,
        // the reference is a block (object-attribute.css on the link itself) as wide as the page; ours is the
        // inline link inside the attribute
        ignore: [...UNSTYLED, 'width'],
        ours: {
            story: `${OA}disabled-link`,
            selector: '[role="link"]:text-is("Disabled Object Attribute linked Text")'
        },
        ref: { story: `${DEV}disabled-link`, selector: '#disabledlink' }
    },
    {
        label: 'truncated',
        pixels: false,
        // unstyled, the reference wraps onto three lines instead of truncating
        ignore: [...UNSTYLED, 'width', 'height'],
        ours: { story: `${OA}truncation`, selector: '[title="Truncate Very long Object Attribute Text"]' },
        ref: { story: `${DEV}truncated-text`, selector: '#truncated' }
    }
];
