/** Visual cases for action-sheet; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// our open action sheets render in the CDK overlay (popover) and a dialog (mobile); the actions differ from
// fundamental-styles' stories, so the surfaces compare by computed style
const POPOVER = 'components-action-sheet--open-default';
const MOBILE = 'components-action-sheet--open-mobile';
const FS_POPOVER = `${FS}action-sheet--default`;
const FS_MOBILE = `${FS}action-sheet--action-sheet-mobile`;

const pair = (label, story, selector, ref, refSelector) => ({
    label,
    pixels: false,
    ignore: ['width', 'height'],
    ours: { story, selector, overlay: true },
    ref: { story: ref, selector: refSelector }
});

export default [
    // the popover list's corner radius (action-sheet-4)
    pair('list', POPOVER, '[role=menu]', FS_POPOVER, '.fd-action-sheet'),
    // the title bar under the list (action-sheet-2) and the list's square top corners (action-sheet-1)
    pair('mobile title bar', MOBILE, '[data-sheet-bar]', FS_MOBILE, '.fd-action-sheet__bar'),
    pair('mobile list', MOBILE, '[role=menu]', FS_MOBILE, '.fd-action-sheet--mobile')
];
