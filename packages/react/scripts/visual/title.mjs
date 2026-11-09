/** Visual cases for title; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// titles are blocks as wide as their container and the texts differ: typography and box height only
export default [
    ...[1, 2, 3, 4, 5, 6].map((level) => ({
        label: `h${level}`,
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-title--semantic', selector: `h${level}` },
        ref: { story: `${FS}title--levels`, selector: `h${level}` }
    })),
    {
        label: 'h1 styled as h6',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-title--visual', selector: 'h1' },
        ref: { story: `${FS}title--visual-level`, selector: 'h1' }
    },
    {
        label: 'h6 styled as h1',
        pixels: false,
        ignore: ['width'],
        ours: { story: 'components-title--visual', selector: 'h6' },
        ref: { story: `${FS}title--visual-level`, selector: 'h6' }
    }
];
