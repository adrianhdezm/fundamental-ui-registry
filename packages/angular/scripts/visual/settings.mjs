/** Visual cases for settings; see ../visual.config.mjs for the fields. */
const FS = 'sap-design-components-';

export default [
    {
        // 72 Bold with a normal line height (settings-1); the names differ, so by computed style
        label: 'profile card name',
        pixels: false,
        props: ['margin-top'],
        ignore: ['width'],
        ours: { story: 'components-settings--open-dialog', selector: '[fd-settings-profile-card-name]', overlay: true },
        ref: { story: `${FS}settings--user-account`, selector: '.fd-settings__profile-card-name' }
    }
];
