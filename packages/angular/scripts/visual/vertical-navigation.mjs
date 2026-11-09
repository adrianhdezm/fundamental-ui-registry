/** Visual cases for vertical-navigation; see ../visual.config.mjs for the fields. */

/*
 * fundamental-styles' Vertical Navigation stories: Default (`cozy`: Calendar and Customers expanded), Condensed,
 * Text Only, Navigation Indication (an indicated second-level item, expanded and condensed) and Grouping. Its
 * condensed panel opens on a click of its own story script; the `fd-vn-open` selector engine (registered below, before
 * scripts/visual.mjs launches the browser) opens it the same way, with the `is-expanded` class, then queries in the
 * page. Our story texts are Angular's ("Today", "Upcoming Events Upcoming Events"), theirs "Second level item 1",
 * so rows with second-level texts are compared by style only.
 */
import { selectors } from 'playwright';

const FS = 'sap-design-components-';
const COZY = `${FS}vertical-navigation--cozy`;
const CONDENSED = `${FS}vertical-navigation--condensed`;
const TEXT = `${FS}vertical-navigation--text`;
const INDICATION = `${FS}vertical-navigation--indication`;
const GROUPING = `${FS}vertical-navigation--grouping`;

const ENGINE = `({
    query(root, css) {
        root.querySelector('#parentCalendarButton')?.classList.add('is-expanded');
        return root.querySelector(css);
    },
    queryAll(root, css) {
        root.querySelector('#parentCalendarButton')?.classList.add('is-expanded');
        return [...root.querySelectorAll(css)];
    }
})`;
await selectors.register('fd-vn-open', { content: ENGINE });

const OURS = 'components-vertical-navigation--';
const ours = (story, selector) => ({ story: `${OURS}${story}`, selector });
// the column is the div around our nav
const NAV = 'fd-vertical-navigation > div';
const item = (n) => `[role=treeitem] >> nth=${n}`;
const text = (n) => `[fd-list-navigation-item-text] >> nth=${n}`;
const arrow = (n) => `[fd-list-navigation-item-arrow] >> nth=${n}`;
const refItem = (n) => `.fd-list__navigation-item >> nth=${n}`;
const refText = (n) => `.fd-list__navigation-item-text >> nth=${n}`;
// the open panel of a condensed item: its header and its list
const PANEL = '[role=treeitem][aria-expanded=true] > div';
const REF_PANEL = '#parentCalendarButton';

export default [
    {
        label: 'navigation',
        pixels: false,
        // our story frame is 30rem high, fundamental-styles' story as high as its items
        ignore: ['height'],
        ours: ours('default', NAV),
        ref: { story: COZY, selector: '.fd-vertical-nav' }
    },
    {
        label: 'navigation, condensed',
        pixels: false,
        ignore: ['height'],
        ours: ours('condensed', NAV),
        ref: { story: CONDENSED, selector: '.fd-vertical-nav' }
    },
    { label: 'item', ours: ours('default', item(0)), ref: { story: COZY, selector: refItem(0) } },
    { label: 'item, hover', hover: true, ours: ours('default', item(0)), ref: { story: COZY, selector: refItem(0) } },
    {
        label: 'item, focus',
        focus: true,
        refFocus: true,
        ours: ours('default', item(0)),
        ref: { story: COZY, selector: refItem(0) }
    },
    { label: 'item text', ours: ours('default', text(0)), ref: { story: COZY, selector: refText(0) } },
    {
        label: 'item icon',
        ours: ours('default', '[role=treeitem] > div > div > fd-icon >> nth=0'),
        ref: { story: COZY, selector: '.fd-list__navigation-item-icon >> nth=0' }
    },
    {
        label: 'item, indicated',
        // Support in ours, Sales in theirs; the reference sets the selected colour on the row too, which no text
        // uses (the text and icon have their own, compared in the item text case)
        pixels: false,
        ignore: ['width', 'color'],
        ours: ours('grouping', '[role=treeitem][aria-selected=true]'),
        ref: {
            story: GROUPING,
            selector: '.fd-vertical-nav__main-navigation > .fd-list > .fd-list__navigation-item--indicated'
        }
    },
    {
        label: 'item text, indicated',
        pixels: false,
        ignore: ['width'],
        ours: ours('grouping', '[role=treeitem][aria-selected=true] [fd-list-navigation-item-text]'),
        ref: {
            story: GROUPING,
            selector:
                '.fd-vertical-nav__main-navigation > .fd-list > .fd-list__navigation-item--indicated .fd-list__navigation-item-text'
        }
    },
    {
        label: 'expanded parent',
        // the texts of the second-level items differ
        pixels: false,
        ours: ours('default', item(1)),
        ref: { story: COZY, selector: refItem(1) }
    },
    {
        label: 'expanded parent text',
        ours: ours('default', text(1)),
        ref: { story: INDICATION, selector: refText(1) }
    },
    {
        label: 'arrow, expanded',
        ours: ours('default', arrow(0)),
        ref: { story: COZY, selector: '.fd-list__navigation-item-arrow >> nth=0' }
    },
    {
        label: 'arrow, collapsed',
        // the only collapsed arrow of fundamental-styles' stories is Calendar's in Grouping, under the indicator of
        // its indicated second-level item
        pixels: false,
        ours: ours('default', arrow(1)),
        ref: { story: GROUPING, selector: '.fd-list__navigation-item-arrow >> nth=0' }
    },
    {
        label: 'second-level item',
        pixels: false,
        // fundamental-styles' `.fd-list { max-width: 100% }` stops the second-level list 1rem before the end of the
        // row, against its own `width: auto` and -1rem end margin; ours spans the row, as Angular's
        ignore: ['width'],
        ours: ours('default', item(3)),
        ref: { story: COZY, selector: refItem(3) }
    },
    {
        label: 'second-level item, indicated',
        pixels: false,
        // width as above; the reference's first second-level item takes the top border of first-level items
        // (`.fd-vertical-nav__main-navigation .fd-list__navigation-item:first-child`), and its own colour, which no
        // text uses (the text has its own)
        ignore: ['width', 'border-top-width', 'border-top-color', 'color'],
        ours: ours('default', item(2)),
        ref: { story: INDICATION, selector: '.fd-list__navigation-item--indicated >> nth=0' }
    },
    {
        label: 'second-level text',
        pixels: false,
        ignore: ['width'],
        ours: ours('default', text(3)),
        ref: { story: COZY, selector: refText(3) }
    },
    {
        label: 'group header',
        ours: ours('grouping', '[fd-vertical-navigation-group-header]'),
        ref: { story: GROUPING, selector: '.fd-vertical-nav__group-header' }
    },
    { label: 'condensed item', ours: ours('condensed', item(0)), ref: { story: CONDENSED, selector: refItem(0) } },
    {
        label: 'condensed item, hover',
        hover: true,
        ours: ours('condensed', item(0)),
        ref: { story: CONDENSED, selector: refItem(0) }
    },
    {
        label: 'condensed parent, indicated child',
        ours: ours('condensed', item(1)),
        ref: { story: INDICATION, selector: REF_PANEL }
    },
    { label: 'text only item', ours: ours('no-icons', item(0)), ref: { story: TEXT, selector: refItem(0) } },
    {
        label: 'text only expanded parent',
        pixels: false,
        ours: ours('no-icons', item(1)),
        ref: { story: TEXT, selector: refItem(1) }
    },
    { label: 'text only text', ours: ours('no-icons', text(1)), ref: { story: TEXT, selector: refText(1) } },
    {
        label: 'text only second-level text',
        pixels: false,
        ignore: ['width'],
        ours: ours('no-icons', text(2)),
        ref: { story: TEXT, selector: refText(2) }
    },
    {
        label: 'panel header',
        ours: ours('open-condensed', `${PANEL} > div >> nth=0`),
        ref: { story: INDICATION, selector: `fd-vn-open=${REF_PANEL} .fd-list__navigation-item-popover--first-level` }
    },
    {
        label: 'panel header text',
        // the reference's panel texts are inline (no box height), ours inline blocks of the row's height; the
        // position is compared in the panel header's pixels
        pixels: false,
        ignore: ['height'],
        ours: ours('open-condensed', `${PANEL} > div ${text(0)}`),
        ref: {
            story: INDICATION,
            selector: `fd-vn-open=${REF_PANEL} .fd-list__navigation-item-popover--first-level .fd-list__navigation-item-text`
        }
    },
    {
        label: 'panel list',
        pixels: false,
        ours: ours('open-condensed', `${PANEL} > div >> nth=1`),
        ref: { story: INDICATION, selector: `fd-vn-open=${REF_PANEL} .fd-list__navigation-item-popover--second-level` }
    },
    {
        label: 'panel item',
        pixels: false,
        ours: ours('open-condensed', `${PANEL} ${item(1)}`),
        ref: {
            story: INDICATION,
            selector: `fd-vn-open=${REF_PANEL} .fd-list__navigation-item-popover--second-level li:nth-child(2)`
        }
    },
    {
        label: 'panel item text',
        pixels: false,
        // the reference's panel texts are inline (no box height), ours inline blocks of the row's height
        ignore: ['width', 'height'],
        ours: ours('open-condensed', `${PANEL} ${text(2)}`),
        ref: {
            story: INDICATION,
            selector: `fd-vn-open=${REF_PANEL} .fd-list__navigation-item-popover--second-level li:nth-child(2) .fd-list__navigation-item-text`
        }
    }
];
