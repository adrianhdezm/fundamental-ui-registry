import { DirectionProvider } from '@base-ui/react/direction-provider';
import type { Decorator, Preview } from '@storybook/react-vite';
import './styles.css';

export const THEMES = {
    sap_horizon: 'Horizon',
    sap_horizon_dark: 'Horizon Dark',
    sap_horizon_hcb: 'Horizon HC Black',
    sap_horizon_hcw: 'Horizon HC White'
} as const;

/** Applies theme, density and direction to <html>, so portals attached to <body> follow them too. */
const withFoundation: Decorator = (Story, context) => {
    const { theme, density, dir } = context.globals;
    const html = document.documentElement;
    html.setAttribute('data-sap-theme', theme ?? 'sap_horizon');
    html.setAttribute('dir', dir ?? 'ltr');
    if (density === 'compact') {
        html.setAttribute('data-density', 'compact');
    } else {
        html.removeAttribute('data-density');
    }
    return (
        <DirectionProvider direction={dir === 'rtl' ? 'rtl' : 'ltr'}>
            <div dir={dir ?? 'ltr'} className="p-4">
                <Story />
            </div>
        </DirectionProvider>
    );
};

const preview: Preview = {
    globalTypes: {
        theme: {
            description: 'SAP theme',
            toolbar: {
                title: 'Theme',
                icon: 'paintbrush',
                items: Object.entries(THEMES).map(([value, title]) => ({ value, title })),
                dynamicTitle: true
            }
        },
        density: {
            description: 'Content density',
            toolbar: {
                title: 'Density',
                icon: 'component',
                items: [
                    { value: 'cozy', title: 'Cozy' },
                    { value: 'compact', title: 'Compact' }
                ],
                dynamicTitle: true
            }
        },
        dir: {
            description: 'Text direction',
            toolbar: {
                title: 'Direction',
                icon: 'transfer',
                items: [
                    { value: 'ltr', title: 'LTR' },
                    { value: 'rtl', title: 'RTL' }
                ],
                dynamicTitle: true
            }
        }
    },
    initialGlobals: {
        theme: 'sap_horizon',
        density: 'cozy',
        dir: 'ltr'
    },
    decorators: [withFoundation],
    parameters: {
        layout: 'fullscreen',
        controls: {
            expanded: true,
            matchers: { color: /(background|color)$/i }
        },
        backgrounds: { disable: true },
        a11y: {
            test: 'todo',
            // Base UI surrounds its popups and triggers with visually hidden, aria-hidden focus guards (tabindex 0)
            // that pass focus on at once; they are not content, so axe does not check them
            context: { include: ['body'], exclude: ['[data-base-ui-focus-guard]'] }
        },
        options: {
            storySort: {
                order: ['Introduction', 'Foundations', 'Components']
            }
        }
    }
};

export default preview;
