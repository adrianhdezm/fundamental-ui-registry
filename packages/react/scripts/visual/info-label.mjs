/** Visual cases for info-label; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';
const COLORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const LABEL = 'span.box-border.inline-flex';

export default [
    ...COLORS.map((c, nth) => ({
        label: `color ${c}`,
        ours: { story: 'components-info-label--colors', selector: `${LABEL} >> nth=${nth}` },
        ref: { story: `${FS}info-label--color-flavors`, selector: `.fd-info-label >> nth=${nth}` }
    })),
    ...COLORS.map((c, nth) => ({
        label: `with icon ${c}`,
        ours: { story: 'components-info-label--with-icon', selector: `${LABEL} >> nth=${nth}` },
        ref: { story: `${FS}info-label--info-label-with-icon`, selector: `.fd-info-label >> nth=${nth}` }
    })),
    {
        label: 'with icon 7: icon',
        ours: { story: 'components-info-label--with-icon', selector: `${LABEL} >> nth=6 >> [data-glyph]` },
        ref: {
            story: `${FS}info-label--info-label-with-icon`,
            selector: '.fd-info-label >> nth=6 >> .fd-info-label__icon'
        }
    },
    {
        label: 'with icon 7: text',
        ours: {
            story: 'components-info-label--with-icon',
            selector: `${LABEL} >> nth=6 >> span.font-sap-font-semibold-duplex-family`
        },
        ref: {
            story: `${FS}info-label--info-label-with-icon`,
            selector: '.fd-info-label >> nth=6 >> .fd-info-label__text'
        }
    },
    ...COLORS.map((c, nth) => ({
        label: `display ${c}`,
        ours: { story: 'components-info-label--display', selector: `${LABEL} >> nth=${nth}` },
        ref: { story: `${FS}info-label--display-mode-info-label`, selector: `.fd-info-label >> nth=${nth}` }
    })),
    ...COLORS.map((c, nth) => ({
        label: `display with icon ${c}`,
        ours: { story: 'components-info-label--display', selector: `${LABEL} >> nth=${nth + 10}` },
        ref: { story: `${FS}info-label--display-mode-info-label`, selector: `.fd-info-label >> nth=${nth + 10}` }
    })),
    {
        label: 'display with icon 7: icon',
        ours: { story: 'components-info-label--display', selector: `${LABEL} >> nth=16 >> [data-glyph]` },
        ref: {
            story: `${FS}info-label--display-mode-info-label`,
            selector: '.fd-info-label >> nth=16 >> .fd-info-label__icon'
        }
    }
];
