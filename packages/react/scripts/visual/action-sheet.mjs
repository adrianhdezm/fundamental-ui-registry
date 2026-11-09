/** Visual cases for action-sheet; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// open action sheets rendered into the page (popover) and into a 350 × 600 frame (mobile), with the texts and
// glyphs of fundamental-styles' stories, kept open; the first mobile action has the focus on opening, so the rest
// cases use another
const POPOVER = 'components-action-sheet--in-page';
const MOBILE = 'components-action-sheet--phone-frame';
const FS_POPOVER = `${FS}action-sheet--default`;
const FS_MOBILE = `${FS}action-sheet--action-sheet-mobile`;

const list = (variant) => `[data-variant="${variant}"]`;
const item = (variant, n) => `${list(variant)} > li:nth-child(${n})`;
const fsItem = (n) => `.fd-action-sheet__item:nth-child(${n})`;

const pair = (label, selector, story, ref, refSelector, extra = {}) => ({
    label,
    ours: { story, selector },
    ref: { story: ref, selector: refSelector },
    ...extra
});

export default [
    // popover
    pair('popover body', `div:has(> div > ${list('popover')})`, POPOVER, FS_POPOVER, '.fd-popover__body'),
    pair('list', list('popover'), POPOVER, FS_POPOVER, '.fd-action-sheet'),
    pair('item', item('popover', 4), POPOVER, FS_POPOVER, fsItem(4)),
    pair('action', `${item('popover', 4)} > button`, POPOVER, FS_POPOVER, `${fsItem(4)} button`),
    pair('action, hover', `${item('popover', 2)} > button`, POPOVER, FS_POPOVER, `${fsItem(2)} button`, {
        hover: true
    }),
    pair('action, focus', `${item('popover', 3)} > button`, POPOVER, FS_POPOVER, `${fsItem(3)} button`, {
        focus: true,
        refFocus: true
    }),
    pair('action without icon', `${item('popover', 5)} > button`, POPOVER, FS_POPOVER, `${fsItem(5)} button`),
    // mobile
    pair('mobile title bar', '[data-sheet-bar]', MOBILE, FS_MOBILE, '.fd-action-sheet__bar'),
    pair('mobile title', '[data-sheet-bar] [role="heading"]', MOBILE, FS_MOBILE, '.fd-action-sheet__title'),
    pair('mobile list', list('mobile'), MOBILE, FS_MOBILE, '.fd-action-sheet--mobile'),
    pair('mobile action', `${item('mobile', 4)} > button`, MOBILE, FS_MOBILE, `${fsItem(4)} button`),
    pair('mobile action, focus', `${item('mobile', 3)} > button`, MOBILE, FS_MOBILE, `${fsItem(3)} button`, {
        focus: true,
        refFocus: true
    }),
    pair('mobile negative action', `${item('mobile', 6)} > button`, MOBILE, FS_MOBILE, `${fsItem(6)} button`),
    pair('mobile negative action, hover', `${item('mobile', 6)} > button`, MOBILE, FS_MOBILE, `${fsItem(6)} button`, {
        hover: true
    })
];
