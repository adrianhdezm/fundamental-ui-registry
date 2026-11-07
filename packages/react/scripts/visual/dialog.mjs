/** Visual cases for dialog; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// open windows rendered into the page (no backdrop), as fundamental-styles' static dialogs
const OURS = 'components-dialog--variants';
const win = (variant) => `[data-variant="${variant}"]`;

const window = (label, variant, story, selector) => ({
    label,
    ours: { story: OURS, selector: win(variant) },
    ref: { story: `${FS}dialog--${story}`, selector }
});

export default [
    window('window, padding s', 'Small', 'sizes', '.fd-dialog__content--s'),
    window('window, padding m', 'Medium', 'sizes', '.fd-dialog__content--m'),
    window('window, padding l', 'Large', 'sizes', '.fd-dialog__content--l'),
    window('window, padding xl', 'Extra large', 'sizes', '.fd-dialog__content--xl'),
    {
        label: 'header bar',
        ours: { story: OURS, selector: `${win('Small')} [data-dialog-header] > [data-dialog-bar]` },
        ref: { story: `${FS}dialog--sizes`, selector: '.fd-dialog__content--s .fd-dialog__header' }
    },
    {
        label: 'title',
        ours: { story: OURS, selector: `${win('Small')} h2` },
        ref: { story: `${FS}dialog--sizes`, selector: '.fd-dialog__content--s .fd-title' }
    },
    {
        label: 'body',
        ours: { story: OURS, selector: `${win('Small')} [data-dialog-body]` },
        ref: { story: `${FS}dialog--sizes`, selector: '.fd-dialog__content--s .fd-dialog__body' }
    },
    {
        label: 'body, padding xl',
        ours: { story: OURS, selector: `${win('Extra large')} [data-dialog-body]` },
        ref: { story: `${FS}dialog--sizes`, selector: '.fd-dialog__content--xl .fd-dialog__body' }
    },
    {
        label: 'footer bar',
        ours: { story: OURS, selector: `${win('Small')} [data-dialog-footer] > [data-dialog-bar]` },
        ref: { story: `${FS}dialog--sizes`, selector: '.fd-dialog__content--s .fd-dialog__footer' }
    },
    {
        label: 'decisive button',
        ours: { story: OURS, selector: `${win('Small')} [data-dialog-footer] button` },
        ref: { story: `${FS}dialog--sizes`, selector: '.fd-dialog__content--s .fd-dialog__decisive-button' }
    },
    window('resizable window', 'Resizable', 'resizable', '.fd-dialog__content'),
    {
        label: 'resize handle',
        ours: { story: OURS, selector: `${win('Resizable')} [data-dialog-resize-handle]` },
        ref: { story: `${FS}dialog--resizable`, selector: '.fd-dialog__resize-handle' }
    },
    {
        // the grab cursor shows while the window is hovered
        label: 'draggable header, hovered',
        hover: true,
        ours: { story: OURS, selector: `${win('Draggable')} [data-dialog-header] > [data-dialog-bar]` },
        ref: { story: `${FS}dialog--draggable`, selector: '.fd-dialog__header' }
    },
    {
        // fundamental-styles' Loading story uses old busy indicator classes and shows no dots: the loader of the
        // Default story (a medium indicator; ours is large, as Angular) is compared by its box, not by pixels
        label: 'loader',
        pixels: false,
        ignore: ['width', 'height'],
        props: ['margin-top', 'margin-bottom', 'text-align'],
        ours: { story: OURS, selector: `${win('Loading')} [data-dialog-loader]` },
        ref: { story: `${FS}dialog--default-dialog`, selector: '.fd-dialog__loader' }
    }
];
