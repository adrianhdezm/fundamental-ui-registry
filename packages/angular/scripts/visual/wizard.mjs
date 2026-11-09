/** Visual cases for wizard; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our Stacked story is fundamental-styles' mobile example (first wizard): seven glyph steps in 300px, the fourth
// current, so the third is the stacked top step with its connector (wizard-2).
const STACKED = 'components-wizard--stacked';
const FS_MOBILE = `${FS}wizard--mobile`;

const step = (n) => `li[data-status]:nth-child(${n})`;
const connector = (n) => `${step(n)} > div > span:last-child`;

const fsWizard = '.fd-wizard:first-of-type';
const fsStep = (n) => `${fsWizard} .fd-wizard__step:nth-child(${n})`;

const pair = (label, selector, refSelector, extra = {}) => ({
    label,
    ours: { story: STACKED, selector },
    ref: { story: FS_MOBILE, selector: refSelector },
    ...extra
});

export default [
    pair('stacked progress bar (sm)', 'ul[role=list]', `${fsWizard} .fd-wizard__progress-bar`),
    pair('stacked completed step', step(1), fsStep(1)),
    pair('stacked top step', step(3), fsStep(3)),
    pair('stacked top connector', connector(3), `${fsStep(3)} .fd-wizard__connector`),
    pair('stacked current step', step(4), fsStep(4)),
    pair('stacked upcoming step', step(5), fsStep(5)),
    pair('stacked last step', step(7), fsStep(7))
];
