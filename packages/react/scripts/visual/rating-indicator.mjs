/** Visual cases for rating-indicator; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

/** Our rating indicator named by the label with this id, or a part of it. */
const ours = (id, part = '') => `[data-slot=rating-indicator]:has([aria-labelledby="${id}"])${part}`;
/** Ours named by aria-label. */
const named = (label, part = '') => `[data-slot=rating-indicator]:has([aria-label="${label}"])${part}`;
const SIZE_REF = {
    lg: '.fd-rating-indicator--lg',
    md: '.fd-rating-indicator:not([class*="--"])',
    sm: '.fd-rating-indicator--sm',
    xs: '.fd-rating-indicator--xs'
};
const DISPLAY_REF = {
    lg: '.fd-rating-indicator--lg',
    md: '.fd-rating-indicator--md',
    sm: '.fd-rating-indicator--sm',
    xs: '.fd-rating-indicator--xs'
};

export default [
    ...['lg', 'md', 'sm', 'xs'].map((size) => ({
        label: `${size}`,
        ours: { story: 'components-rating-indicator--sizes', selector: ours(`ri-s-${size}`) },
        ref: { story: `${FS}rating-indicator--sizes`, selector: SIZE_REF[size] }
    })),
    {
        label: 'lg hover',
        hover: true,
        ours: { story: 'components-rating-indicator--sizes', selector: ours('ri-s-lg') },
        ref: { story: `${FS}rating-indicator--sizes`, selector: SIZE_REF.lg }
    },
    // the first rating of the story takes the Tab focus
    {
        label: 'lg focus',
        focus: true,
        refFocus: true,
        ours: { story: 'components-rating-indicator--sizes', selector: ours('ri-s-lg') },
        ref: { story: `${FS}rating-indicator--sizes`, selector: SIZE_REF.lg }
    },
    {
        label: 'md star',
        ours: {
            story: 'components-rating-indicator--sizes',
            selector: ours('ri-s-md', ' [data-slot=rating-indicator-item]')
        },
        ref: { story: `${FS}rating-indicator--sizes`, selector: `${SIZE_REF.md} .fd-rating-indicator__item` }
    },
    {
        label: 'md rated half',
        // fundamental-styles' icons have a text shadow colour as box-shadow, clipped away by the half's clip-path
        ignore: ['box-shadow'],
        ours: { story: 'components-rating-indicator--sizes', selector: ours('ri-s-md', ' [data-glyph]') },
        ref: { story: `${FS}rating-indicator--sizes`, selector: `${SIZE_REF.md} .fd-rating-indicator__icon` }
    },
    {
        label: 'md unrated half',
        // fundamental-styles' icons have a text shadow colour as box-shadow, clipped away by the half's clip-path
        ignore: ['box-shadow'],
        ours: {
            story: 'components-rating-indicator--sizes',
            selector: ours('ri-s-md', ' li:last-child [data-glyph]')
        },
        ref: {
            story: `${FS}rating-indicator--sizes`,
            selector: `${SIZE_REF.md} .fd-rating-indicator__icon--unselected`
        }
    },
    {
        label: 'md dynamic text',
        ours: { story: 'components-rating-indicator--sizes', selector: ours('ri-s-md', ' > span') },
        ref: { story: `${FS}rating-indicator--sizes`, selector: `${SIZE_REF.md} .fd-rating-indicator__dynamic-text` }
    },
    ...['lg', 'md', 'sm', 'xs'].map((size) => ({
        label: `display ${size}`,
        ours: { story: 'components-rating-indicator--sizes', selector: ours(`ri-d-${size}`) },
        ref: { story: `${FS}rating-indicator--display-mode`, selector: DISPLAY_REF[size] }
    })),
    {
        label: 'display md small star',
        ours: {
            story: 'components-rating-indicator--sizes',
            selector: ours('ri-d-md', ' [data-small]')
        },
        ref: {
            story: `${FS}rating-indicator--display-mode`,
            selector: `${DISPLAY_REF.md} .fd-rating-indicator__item:last-child`
        }
    },
    {
        label: 'halves md',
        ours: { story: 'components-rating-indicator--sizes', selector: ours('ri-h-md') },
        ref: { story: `${FS}rating-indicator--half-values`, selector: '.fd-rating-indicator' }
    },
    {
        label: 'halves lg',
        ours: { story: 'components-rating-indicator--sizes', selector: ours('ri-h-lg') },
        ref: { story: `${FS}rating-indicator--sizes`, selector: SIZE_REF.lg },
        // 2.5 against fundamental-styles' 2 (their large half value example has custom icons): styles only
        pixels: false,
        ignore: ['width']
    },
    {
        label: 'custom icons',
        ours: { story: 'components-rating-indicator--custom-icons', selector: named('Custom icons') },
        ref: { story: `${FS}rating-indicator--half-values`, selector: '.fd-rating-indicator >> nth=1' }
    },
    {
        label: 'custom icons lg',
        ours: { story: 'components-rating-indicator--custom-icons', selector: named('Custom icons large') },
        ref: { story: `${FS}rating-indicator--half-values`, selector: '.fd-rating-indicator--lg' }
    },
    {
        label: 'six',
        ours: { story: 'components-rating-indicator--custom-icons', selector: named('Six') },
        ref: {
            story: `${FS}rating-indicator--different-values`,
            selector: '.fd-rating-indicator:has([aria-valuemax="6"])'
        }
    },
    {
        label: 'seven',
        ours: { story: 'components-rating-indicator--custom-icons', selector: named('Seven') },
        ref: {
            story: `${FS}rating-indicator--different-values`,
            selector: '.fd-rating-indicator:has([aria-valuemax="7"])'
        }
    },
    {
        label: 'disabled',
        ours: { story: 'components-rating-indicator--custom-icons', selector: named('Disabled') },
        ref: { story: `${FS}rating-indicator--disabled`, selector: '.fd-rating-indicator' }
    }
];
