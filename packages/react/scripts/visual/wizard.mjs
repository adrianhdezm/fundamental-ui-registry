/** Visual cases for wizard; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our Glyphs story is fundamental-styles' responsive example (first wizard): five glyph steps, the fourth current,
// xl paddings. Our Stacked story is its mobile example (first wizard): seven glyph steps in 300px, the fourth
// current. Numbered indicators, the branching connector and the list background come from other stories, with
// other texts: styles only.
const GLYPHS = 'components-wizard--glyphs';
const STACKED = 'components-wizard--stacked';
const FS_GLYPHS = `${FS}wizard--responsive`;
const FS_MOBILE = `${FS}wizard--mobile`;
const FS_DEFAULT = `${FS}wizard--default-example`;
const FS_CUSTOMIZED = `${FS}wizard--customized`;

const step = (n) => `li[data-status]:nth-child(${n})`;
const container = (n) => `${step(n)} [data-wizard-step-container]`;
const indicator = (n) => `${container(n)} > span:first-child`;
const label = (n) => `${container(n)} > span:last-child > span:first-child`;
const optional = (n) => `${container(n)} > span:last-child > span:nth-child(2)`;
const connector = (n) => `${step(n)} [data-wizard-connector]`;

const fsWizard = '.fd-wizard:first-of-type';
const fsStep = (n) => `${fsWizard} .fd-wizard__step:nth-child(${n})`;

const pair = (label, story, selector, ref, refSelector, extra = {}) => ({
    label,
    ours: { story, selector },
    ref: { story: ref, selector: refSelector },
    ...extra
});

export default [
    // progress bar and steps (responsive example)
    pair('progress bar (xl)', GLYPHS, 'ul[role=list]', FS_GLYPHS, `${fsWizard} .fd-wizard__progress-bar`),
    pair('completed step', GLYPHS, step(1), FS_GLYPHS, fsStep(1)),
    pair('completed indicator (glyph)', GLYPHS, indicator(1), FS_GLYPHS, `${fsStep(1)} .fd-wizard__step-indicator`),
    pair('completed label', GLYPHS, label(1), FS_GLYPHS, `${fsStep(1)} .fd-wizard__label`),
    pair('active connector', GLYPHS, connector(1), FS_GLYPHS, `${fsStep(1)} .fd-wizard__connector`),
    pair('optional text', GLYPHS, optional(2), FS_GLYPHS, `${fsStep(2)} .fd-wizard__optional-text`),
    pair('current step', GLYPHS, step(4), FS_GLYPHS, fsStep(4)),
    pair('current indicator (glyph)', GLYPHS, indicator(4), FS_GLYPHS, `${fsStep(4)} .fd-wizard__step-indicator`),
    pair('current label', GLYPHS, label(4), FS_GLYPHS, `${fsStep(4)} .fd-wizard__label`),
    pair('connector after the current step', GLYPHS, connector(4), FS_GLYPHS, `${fsStep(4)} .fd-wizard__connector`),
    pair('upcoming step (last)', GLYPHS, step(5), FS_GLYPHS, fsStep(5)),
    pair('upcoming indicator (glyph)', GLYPHS, indicator(5), FS_GLYPHS, `${fsStep(5)} .fd-wizard__step-indicator`),
    pair('upcoming label', GLYPHS, label(5), FS_GLYPHS, `${fsStep(5)} .fd-wizard__label`),
    pair('step, focus', GLYPHS, container(1), FS_GLYPHS, `${fsStep(1)} .fd-wizard__step-container`, {
        focus: true,
        refFocus: true
    }),
    // content (texts differ)
    pair(
        'content (xl)',
        GLYPHS,
        '[data-wizard-scroll] section >> nth=0',
        FS_GLYPHS,
        `${fsWizard} .fd-wizard__content`,
        // the content area is as high as the scrolling area (fundamental-styles sets a min-height of 300px)
        { pixels: false, ignore: ['width', 'height', 'min-height', 'padding-bottom'] }
    ),
    pair(
        'content container',
        GLYPHS,
        '[data-wizard-scroll] section >> nth=0 >> div >> nth=0',
        FS_GLYPHS,
        `${fsWizard} .fd-wizard__step-content-container`,
        { pixels: false, ignore: ['width', 'height'] }
    ),
    pair(
        'next step',
        'components-wizard--default',
        '[data-wizard-scroll] section >> nth=0 >> div >> nth=0 >> div:has(> button)',
        FS_DEFAULT,
        '.fd-wizard__next-step',
        { pixels: false, ignore: ['width'], props: ['margin-top'] }
    ),
    // numbered indicators (default example; other numbers)
    pair(
        'current indicator (number)',
        'components-wizard--anchors-mode',
        indicator(1),
        FS_DEFAULT,
        `${fsStep(2)} .fd-wizard__step-indicator`,
        { pixels: false }
    ),
    pair(
        'upcoming indicator (number)',
        'components-wizard--anchors-mode',
        indicator(3),
        FS_DEFAULT,
        `${fsStep(3)} .fd-wizard__step-indicator`
    ),
    // branching connector and list background (customized example)
    pair(
        'branching connector',
        'components-wizard--branching-choice',
        connector(1),
        FS_CUSTOMIZED,
        `${fsStep(3)} .fd-wizard__connector`,
        { pixels: false, ignore: ['width'] }
    ),
    pair(
        'content, list background (md)',
        'components-wizard--backgrounds',
        'section[aria-label=List] [data-wizard-scroll] section',
        FS_CUSTOMIZED,
        '.fd-wizard__content',
        { pixels: false, ignore: ['width', 'height', 'min-height', 'padding-bottom'] }
    ),
    // stacked steps (mobile example)
    pair('stacked progress bar (sm)', STACKED, 'ul[role=list]', FS_MOBILE, `${fsWizard} .fd-wizard__progress-bar`),
    pair('stacked completed step', STACKED, step(1), FS_MOBILE, fsStep(1)),
    pair('stacked top step', STACKED, step(3), FS_MOBILE, fsStep(3)),
    pair('stacked top indicator', STACKED, indicator(3), FS_MOBILE, `${fsStep(3)} .fd-wizard__step-indicator`),
    pair('stacked top connector', STACKED, connector(3), FS_MOBILE, `${fsStep(3)} .fd-wizard__connector`),
    pair('stacked current step', STACKED, step(4), FS_MOBILE, fsStep(4)),
    pair('stacked upcoming step', STACKED, step(5), FS_MOBILE, fsStep(5)),
    pair('stacked last step', STACKED, step(7), FS_MOBILE, fsStep(7))
];
