/** Visual cases for illustrated-message; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

// Our "Sizes" story repeats fundamental-styles' Large, Medium, Small, Extra Small and Base examples with their texts.
// fundamental-styles draws its own demo illustrations (an ice cream, a folder, a phone), ours are SAP illustrations
// from @ui5/webcomponents-fiori: the illustration and the parts holding it compare by computed style and box size,
// the figcaption, title, text and actions also by pixels.
const ours = (n, selector) => ({
    story: 'components-illustrated-message--sizes',
    selector: selector ? `figure >> nth=${n} >> ${selector}` : `figure >> nth=${n}`
});
const ref = (story, selector) => ({ story: `${FS}illustrated-message--${story}`, selector });

const FLEX = ['display', 'flex-direction', 'align-items', 'justify-content', 'column-gap', 'row-gap'];
const MARGINS = ['margin-top', 'margin-bottom'];

const SIZES = [
    ['large', 'large'],
    ['medium', 'medium'],
    ['small', 'small'],
    ['xsmall', 'x-small'],
    ['base', 'base']
];

export default SIZES.flatMap(([size, story], n) => [
    {
        label: `${size}: message`,
        pixels: false,
        props: [...FLEX, 'text-align'],
        ours: ours(n),
        ref: ref(story, '.fd-illustrated-message')
    },
    {
        label: `${size}: container`,
        pixels: false,
        props: FLEX,
        // fundamental-styles' xsmall and base examples put the actions into the container, its other examples and
        // Angular after it: there our container is lower by the actions (the message has the same height)
        ignore: ['height'],
        ours: ours(n, ':scope > div'),
        ref: ref(story, '.fd-illustrated-message__container')
    },
    ...(size === 'base'
        ? []
        : [
              {
                  label: `${size}: illustration`,
                  pixels: false,
                  props: [...MARGINS, 'max-width', 'max-height'],
                  ours: ours(n, 'svg >> nth=0'),
                  ref: ref(story, '.fd-illustrated-message__illustration')
              }
          ]),
    {
        label: `${size}: figcaption`,
        props: [...FLEX, 'max-width'],
        ours: ours(n, 'figcaption'),
        ref: ref(story, '.fd-illustrated-message__figcaption')
    },
    {
        label: `${size}: title`,
        props: [...MARGINS, 'text-align'],
        ours: ours(n, 'h2'),
        ref: ref(story, '.fd-illustrated-message__title')
    },
    {
        label: `${size}: text`,
        props: [...MARGINS, 'text-align'],
        ours: ours(n, 'p'),
        ref: ref(story, '.fd-illustrated-message__text')
    },
    {
        label: `${size}: actions`,
        props: [...FLEX, ...MARGINS],
        ours: ours(n, ':scope > div:last-child'),
        ref: ref(story, '.fd-illustrated-message__actions')
    }
]);
