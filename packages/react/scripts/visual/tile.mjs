/** Visual cases for tile; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

const ours = (story, selector) => ({ story: `components-tile--${story}`, selector });
const ref = (story, selector) => ({ story: `${FS}generic-tiles--${story}`, selector });
/** Our (non-line) tiles: the root carries the `group/tile` class. */
const TILE = '[class*="group/tile"]';
const tile = (nth) => `${TILE} >> nth=${nth}`;
/** The nth direct child of our nth tile. */
const part = (nth, child) => `${tile(nth)} >> :scope > div >> nth=${child}`;
const FLEX = ['display', 'align-items', 'justify-content'];
/** Our nth TileContainer in the line tile story. */
const CONTAINER = (nth) => `[class*="flex-wrap"][class*="rounded-sap-element"] >> nth=${nth}`;
/** The border fundamental-styles' line tiles lose to an invalid declaration (see the line tile cases). */
const LINE_BORDER = [
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-style',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color'
];
/** Box of fundamental-styles' fd-button around the action glyphs, which ours do not have. */
const BUTTON_BOX = [
    'padding-left',
    'padding-right',
    'min-height',
    'line-height',
    'font-family',
    'color',
    'background-color',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color'
];

export default [
    // sizes: fundamental-styles' texts are the class names of the parts and its docs colour the parts, ours are
    // readable texts on the information background, so the tiles compare by computed styles
    ...[
        ['tile', 0, '.fd-tile >> nth=0'],
        ['tile double', 1, '.fd-tile--double:not(.fd-tile--s) >> nth=0'],
        ['tile small', 2, '.fd-tile--s:not(.fd-tile--double) >> nth=0'],
        ['tile small double', 3, '.fd-tile--s.fd-tile--double >> nth=0']
    ].map(([label, nth, selector]) => ({
        label,
        pixels: false,
        props: ['width', 'max-height', 'margin-top'],
        ours: ours('columns', tile(nth)),
        ref: ref('generic-tile-content-columns', selector)
    })),
    ...[
        ['two-column header', 0, '.fd-tile__header--2-col'],
        ['two-column content', 1, '.fd-tile__content--2-col'],
        ['two-column footer', 2, '.fd-tile__footer--2-col']
    ].map(([label, child, selector]) => ({
        label,
        pixels: false,
        props: [...FLEX, 'margin-bottom'],
        ours: ours('columns', part(0, child)),
        ref: ref('generic-tile-content-columns', `${selector} >> nth=0`)
    })),
    {
        label: 'two-column section',
        pixels: false,
        props: ['width'],
        // the sections are coloured for the story: ours the information background, fundamental-styles a docs colour
        ignore: ['background-color'],
        ours: ours('columns', `${part(0, 0)} >> :scope > div >> nth=0`),
        ref: ref('generic-tile-content-columns', '.fd-tile__header--2-col >> nth=0 >> .fd-tile__section >> nth=0')
    },

    // launch tile: the numeric content texts differ (fundamental-styles shows "1Ñç"), the header and footer match
    {
        label: 'launch tile',
        pixels: false,
        ours: ours('launch-tile', tile(0)),
        ref: ref('launch-tile', '.fd-tile--launch >> nth=0')
    },
    {
        label: 'launch header',
        props: ['margin-bottom'],
        ours: ours('launch-tile', part(0, 0)),
        ref: ref('launch-tile', '.fd-tile--launch >> nth=0 >> .fd-tile__header')
    },
    {
        label: 'launch footer (refresh, two columns)',
        props: FLEX,
        ours: ours('launch-tile', part(0, 2)),
        ref: ref('launch-tile', '.fd-tile--launch >> nth=0 >> .fd-tile__footer')
    },
    {
        label: 'refresh',
        props: ['margin-right', 'margin-left', 'min-width'],
        ours: ours('launch-tile', `${tile(0)} >> button`),
        ref: ref('launch-tile', '.fd-tile__refresh >> nth=0')
    },
    {
        label: 'launch tile small',
        ours: ours('launch-tile', tile(1)),
        ref: ref('launch-tile', '.fd-tile--launch.fd-tile--s >> nth=0')
    },
    {
        label: 'launch icon',
        props: ['width'],
        ours: ours('launch-tile', `${tile(0)} >> [data-glyph] >> nth=0`),
        ref: ref('launch-tile', '.fd-numeric-content__launch-icon >> nth=0')
    },
    {
        label: 'launch icon container',
        props: ['width', 'margin-right', 'margin-left'],
        ours: ours('launch-tile', `${tile(0)} >> [data-glyph] >> nth=0 >> xpath=..`),
        ref: ref('launch-tile', '.fd-numeric-content__launch-icon-container >> nth=0')
    },
    {
        label: 'numeric content',
        pixels: false,
        ignore: ['width'],
        ours: ours('launch-tile', `${tile(0)} >> [data-glyph] >> nth=0 >> xpath=../..`),
        ref: ref('launch-tile', '.fd-numeric-content >> nth=0')
    },
    {
        label: 'kpi value',
        pixels: false,
        ignore: ['width'],
        ours: ours('launch-tile', `${tile(0)} >> :text-is("1.2")`),
        ref: ref('launch-tile', '.fd-numeric-content__kpi >> nth=0')
    },
    {
        label: 'scale container (arrow and unit)',
        ours: ours('launch-tile', `${tile(0)} >> :text-is("M") >> xpath=../..`),
        ref: ref('launch-tile', '.fd-numeric-content__scale-container >> nth=0')
    },
    {
        label: 'header and content',
        ours: ours('launch-tile', tile(2)),
        ref: ref('launch-tile', '.fd-tile__header-content >> nth=0 >> xpath=..')
    },
    {
        label: 'header and content small',
        ours: ours('launch-tile', tile(3)),
        ref: ref('launch-tile', '.fd-tile__header-content >> nth=1 >> xpath=..')
    },
    {
        label: 'profile image',
        pixels: false,
        // our story image is assets/person.svg, fundamental-styles' a photo
        ignore: ['background-image'],
        ours: ours('launch-tile', `${tile(4)} >> [role="img"]`),
        ref: ref('launch-tile', '.fd-tile__profile-img >> nth=0')
    },
    {
        label: 'profile image small',
        pixels: false,
        // our story image is assets/person.svg, fundamental-styles' a photo
        ignore: ['background-image'],
        ours: ours('launch-tile', `${tile(5)} >> [role="img"]`),
        ref: ref('launch-tile', '.fd-tile__profile-img >> nth=1')
    },
    {
        label: 'logo',
        pixels: false,
        ours: ours('launch-tile', `${tile(6)} >> img`),
        ref: ref('launch-tile', '.fd-tile__logo >> nth=0')
    },
    {
        label: 'logo small',
        pixels: false,
        ours: ours('launch-tile', `${tile(7)} >> img`),
        ref: ref('launch-tile', '.fd-tile__logo >> nth=1')
    },

    // KPI tiles: the medium and small rows have fundamental-styles' texts
    ...[
        ['kpi tile m', 2, '.fd-tile--kpi >> nth=2'],
        ['kpi tile m small', 3, '.fd-tile--kpi >> nth=3'],
        ['kpi tile s', 4, '.fd-tile--kpi >> nth=4'],
        ['kpi tile m in small tile', 5, '.fd-tile--kpi >> nth=5']
    ].map(([label, nth, selector]) => ({
        label,
        ours: ours('kpi-tile', tile(nth)),
        ref: ref('kpi-tile', selector)
    })),
    {
        label: 'kpi tile hover',
        hover: true,
        ours: ours('kpi-tile', tile(2)),
        ref: ref('kpi-tile', '.fd-tile--kpi >> nth=2')
    },
    {
        label: 'tile focus',
        focus: true,
        refFocus: true,
        pixels: false,
        // fundamental-styles has no focus style for launch, KPI, feed and slide tiles (the browser's auto outline);
        // ours is the SAP focus outline inside the border, as Angular's (kept, see the report)
        ignore: ['outline-style', 'outline-width', 'outline-color', 'outline-offset'],
        ours: ours('clickable', tile(0)),
        ref: ref('kpi-tile', '.fd-tile--kpi >> nth=0')
    },

    // feed and badge tiles: the same texts
    {
        label: 'feed tile',
        ours: ours('feed-tile', tile(0)),
        ref: ref('feed-tile', '.fd-tile--feed >> nth=0')
    },
    {
        label: 'feed tile small',
        ours: ours('feed-tile', tile(1)),
        ref: ref('feed-tile', '.fd-tile--feed >> nth=1')
    },
    {
        label: 'badge',
        // computed styles only: fundamental-styles' tile sits at x = 36.5px in its story, so its badge text is
        // anti-aliased at another sub-pixel offset (8-12% of the pixels); the same badge passes by pixels inside the
        // feed tile case and in the line tile cases
        pixels: false,
        props: ['position', 'top', 'right', 'max-width'],
        ours: ours('badge-tile', `${tile(0)} >> :text-is("Badge")`),
        ref: ref('badge-tile', '.fd-badge >> nth=0')
    },
    {
        label: 'badge long',
        pixels: false,
        props: ['max-width'],
        ours: ours('badge-tile', `${tile(1)} >> :scope > div >> nth=0`),
        ref: ref('badge-tile', '.fd-badge >> nth=1')
    },
    {
        label: 'feed tile with badge',
        ours: ours('badge-tile', tile(2)),
        ref: ref('badge-tile', '.fd-tile--feed >> nth=0')
    },

    // slide tiles: the background images differ, so the parts compare by computed styles
    ...[
        ['slide tile', 0],
        ['slide tile small', 1],
        ['slide tile double', 2]
    ].map(([label, nth]) => ({
        label,
        pixels: false,
        props: FLEX,
        ours: ours('slide-tile', tile(nth)),
        ref: ref('slide-tile', `.fd-tile--slide >> nth=${nth}`)
    })),
    {
        label: 'slide band',
        pixels: false,
        props: FLEX,
        ours: ours('slide-tile', part(0, 1)),
        ref: ref('slide-tile', '.fd-tile__container >> nth=0')
    },
    {
        label: 'slide band small',
        pixels: false,
        ours: ours('slide-tile', part(1, 1)),
        ref: ref('slide-tile', '.fd-tile__container >> nth=1')
    },
    {
        label: 'slide title',
        pixels: false,
        ours: ours(
            'slide-tile',
            `${part(2, 1)} >> :text-is("${'Wind Map: Monitoring Real-Time and Forecasted Wind Conditions Across the Globe'}")`
        ),
        ref: ref('slide-tile', '.fd-tile--slide >> nth=2 >> .fd-tile__title')
    },
    {
        label: 'slide subtitle and footer text',
        pixels: false,
        ignore: ['width'],
        ours: ours('slide-tile', `${part(0, 1)} >> :text-is("May 14, 2020")`),
        ref: ref('slide-tile', '.fd-tile--slide >> nth=0 >> .fd-tile__footer-text')
    },
    {
        label: 'page indicator',
        props: ['margin-top', 'margin-bottom'],
        ours: ours('slide-tile', `${part(0, 1)} >> :scope > div >> nth=2`),
        ref: ref('slide-tile', '.fd-tile__page-indicator >> nth=0')
    },
    {
        label: 'page dot',
        pixels: false,
        props: ['margin-right', 'margin-left', 'width'],
        ours: ours('slide-tile', `${part(0, 1)} >> :scope > div >> nth=2 >> span >> nth=0`),
        ref: ref('slide-tile', '.fd-tile__dot >> nth=0')
    },
    {
        label: 'page dot active',
        pixels: false,
        props: ['width'],
        ours: ours('slide-tile', `${part(0, 1)} >> :scope > div >> nth=2 >> span >> nth=2`),
        ref: ref('slide-tile', '.fd-tile__dot--active >> nth=0')
    },

    // line tiles. fundamental-styles' `.fd-tile--line` sets `border: .0625rem solid var(--fdTile_Border, …)` where
    // --fdTile_Border is itself a whole border shorthand, so the declaration is invalid and its line tiles have no
    // border; ours keep the 1px tile border (transparent in Horizon, visible in HC), as Angular's. The tiles are 2px
    // wider and taller boxes, so they compare by computed styles and their headers by pixels.
    {
        label: 'tile container',
        pixels: false,
        // the story widths differ
        ignore: ['width', 'height'],
        ours: ours('line-tile', CONTAINER(0)),
        ref: ref('link-tile', '.fd-tile-container >> nth=0')
    },
    {
        label: 'tile container list',
        pixels: false,
        ignore: ['width', 'height'],
        ours: ours('line-tile', CONTAINER(1)),
        ref: ref('link-tile', '.fd-tile-container--list >> nth=0')
    },
    ...[
        ['line tile', 0, 0, 0],
        ['line tile second short', 0, 2, 2],
        ['line tile list', 1, 0, 0],
        ['line tile list two lines', 1, 3, 4],
        ['line tile with badge', 2, 0, 0]
    ].flatMap(([label, container, nth, refNth]) => {
        const oursTile = `${CONTAINER(container)} >> [role="button"] >> nth=${nth}`;
        const refTile = `.fd-tile-container >> nth=${container} >> .fd-tile--line >> nth=${refNth}`;
        return [
            {
                label,
                pixels: false,
                props: ['margin-top', 'margin-right', 'margin-left', 'margin-bottom', ...FLEX],
                // list tiles are as wide as the container
                ignore: [...LINE_BORDER, 'width'],
                ours: ours('line-tile', oursTile),
                ref: ref('link-tile', refTile)
            },
            {
                label: `${label}: header`,
                pixels: container !== 1,
                // list tiles are as wide as the container
                ignore: container === 1 ? ['width'] : [],
                ours: ours('line-tile', `${oursTile} >> :scope > div >> nth=0`),
                ref: ref('link-tile', `${refTile} >> .fd-tile__header`)
            }
        ];
    }),
    {
        label: 'line tile hover',
        hover: true,
        pixels: false,
        ignore: [...LINE_BORDER, 'width'],
        ours: ours('line-tile', `${CONTAINER(0)} >> [role="button"] >> nth=0`),
        ref: ref('link-tile', '.fd-tile--line >> nth=0')
    },
    {
        label: 'line tile focus',
        focus: true,
        refFocus: true,
        pixels: false,
        props: ['outline-style', 'outline-width', 'outline-color', 'outline-offset'],
        ignore: [...LINE_BORDER, 'width'],
        ours: ours('line-tile', `${CONTAINER(0)} >> [role="button"] >> nth=0`),
        ref: ref('link-tile', '.fd-tile--line >> nth=0')
    },
    {
        label: 'line badge',
        props: ['position', 'margin-right', 'margin-left'],
        ours: ours('line-tile', `${CONTAINER(2)} >> :text-is("Badge") >> nth=0`),
        ref: ref('link-tile', '.fd-tile-container >> nth=2 >> .fd-badge >> nth=0')
    },
    {
        label: 'line tile in action mode',
        pixels: false,
        props: ['padding-right', 'padding-left', ...FLEX],
        ignore: [...LINE_BORDER, 'width'],
        ours: ours('line-tile', 'button[aria-label="Remove Title"] >> nth=0 >> xpath=../..'),
        ref: ref('link-tile', '.fd-tile--line.fd-tile--action >> nth=0')
    },
    {
        label: 'line action container',
        // computed styles only: holds the line action indicator (see below)
        pixels: false,
        props: ['margin-left', 'margin-right', ...FLEX],
        ours: ours('line-tile', 'button[aria-label="Remove Title"] >> nth=0 >> xpath=..'),
        ref: ref('link-tile', '.fd-tile--line.fd-tile--action >> nth=0 >> .fd-tile__action-container')
    },
    {
        // ours draws the circle on the glyph inside the button (as Angular), fundamental-styles on the button
        label: 'line action close',
        // computed styles only: the circle keeps its border, which fundamental-styles loses (below); in HC that
        // border is 1.7-3.5% of the pixels, in Horizon and Dark the circles match (0.0%)
        pixels: false,
        props: ['position', 'top', 'width'],
        // the padding of fundamental-styles' button around the glyph; its `top` is on the button, ours on our button
        // around the glyph; its line height; and its `border: var(--sapButton_BorderColor)`, an invalid declaration
        // that leaves the circle without the button border (ours keeps it, visible in HC only)
        ignore: [
            'padding-left',
            'padding-right',
            'font-family',
            'line-height',
            'min-height',
            'top',
            'border-top-width',
            'border-right-width',
            'border-bottom-width',
            'border-left-width',
            'border-top-style'
        ],
        ours: ours('line-tile', 'button[aria-label="Remove Title"] >> nth=0 >> span'),
        ref: ref('link-tile', '.fd-tile--line.fd-tile--action >> nth=0 >> .fd-tile__action-close')
    },
    {
        label: 'line action indicator',
        // computed styles only: fundamental-styles' action-mode rule sets `display: block` on the button, so its
        // glyph is no longer centred and overflows 3px to the end of the 1.625rem button; ours stays centred
        pixels: false,
        props: ['position', 'width'],
        // fundamental-styles' indicator is a transparent compact fd-button (1px transparent border, padding, the
        // button font, colour and lite background); ours a plain 1.625rem button whose glyph carries the colour
        ignore: BUTTON_BOX,
        ours: ours('line-tile', 'button[aria-label="More actions for Title"] >> nth=0'),
        ref: ref('link-tile', '.fd-tile--line.fd-tile--action >> nth=0 >> .fd-tile__action-indicator')
    },
    {
        label: 'line tile disabled',
        pixels: false,
        ignore: [...LINE_BORDER, 'width'],
        ours: ours('line-tile', '[aria-disabled="true"] >> nth=0'),
        ref: ref('link-tile', '.fd-tile--line.is-disabled >> nth=0')
    },

    // action mode
    {
        label: 'action tile',
        pixels: false,
        ours: ours('action-mode', tile(0)),
        ref: ref('tile-in-action-mode', '.fd-tile--action >> nth=0')
    },
    {
        label: 'action overlay',
        pixels: false,
        props: ['position', 'z-index'],
        ours: ours('action-mode', `${tile(0)} >> :scope > div >> nth=0`),
        ref: ref('tile-in-action-mode', '.fd-tile__overlay >> nth=0')
    },
    {
        // fundamental-styles' close button is a compact fd-button around the 1.375rem circle; the circle compares
        label: 'action close',
        // computed styles only: in the HC themes the 1px button border shows, and fundamental-styles' tile sits at
        // x = 36.5px in its story, so the border and glyph are anti-aliased at another sub-pixel offset (7-9%);
        // Horizon and Horizon Dark match by pixels (0.0-0.2%)
        pixels: false,
        props: ['width'],
        ours: ours('action-mode', 'button[aria-label="Remove Leave requests"] >> span'),
        ref: ref('tile-in-action-mode', '.fd-tile__action-close >> nth=0 >> i')
    },
    {
        label: 'action close position',
        pixels: false,
        props: ['position', 'top', 'right', 'z-index'],
        ignore: BUTTON_BOX,
        ours: ours('action-mode', 'button[aria-label="Remove Leave requests"]'),
        ref: ref('tile-in-action-mode', '.fd-tile__action-close >> nth=0')
    },
    {
        label: 'action indicator',
        // computed styles only: in the HC themes the 1px button border shows, and fundamental-styles' tile sits at
        // x = 36.5px in its story, so the border and glyph are anti-aliased at another sub-pixel offset (7-9%);
        // Horizon and Horizon Dark match by pixels (0.0-0.2%)
        pixels: false,
        props: ['position', 'bottom', 'right', 'margin-right', 'margin-bottom', 'z-index'],
        ignore: BUTTON_BOX,
        ours: ours('action-mode', 'button[aria-label="More actions for Leave requests"]'),
        ref: ref('tile-in-action-mode', '.fd-tile__action-indicator >> nth=0')
    },
    {
        label: 'action indicator on slide tile',
        // computed styles only, as the action indicator
        pixels: false,
        props: ['position', 'bottom', 'right'],
        ignore: BUTTON_BOX,
        ours: ours('action-mode', 'button[aria-label="More actions for Wind map"]'),
        ref: ref('tile-in-action-mode', '.fd-tile--slide .fd-tile__action-indicator >> nth=0')
    }
];
