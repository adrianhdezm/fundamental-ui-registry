import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BADGE_ENABLED_BUTTON_VARIANTS, Button, ButtonBadge } from './button';

const VARIANTS = ['standard', 'emphasized', 'ghost', 'positive', 'negative', 'attention', 'transparent'] as const;

const meta = {
    title: 'Components/Button',
    component: Button,
    parameters: {
        docs: {
            description: {
                component:
                    'Buttons trigger actions. Use **emphasized** for the main action of a page, **positive** and ' +
                    '**negative** for semantic actions, **transparent** in toolbars and headers and **ghost** to ' +
                    'highlight a secondary action. Icon-only buttons need an `aria-label`.'
            }
        }
    },
    argTypes: {
        variant: { control: 'select', options: VARIANTS },
        glyphPosition: { control: 'inline-radio', options: ['before', 'after'] }
    },
    args: {
        label: 'Button',
        variant: 'standard',
        glyph: '',
        glyphPosition: 'before',
        menu: false,
        toggled: false,
        disabled: false,
        focusableWhenDisabled: false,
        fullWidth: false,
        decisive: false
    }
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Types: Story = {
    parameters: {
        docs: {
            description: { story: 'The button types. Each special type adds a hidden description for screen readers.' }
        }
    },
    render: () => (
        <div className="flex flex-wrap items-center gap-2">
            <Button label="Standard Button" />
            <Button label="Emphasized Button" variant="emphasized" />
            <Button label="Ghost Button" variant="ghost" aria-description="Ghost button with a custom description" />
            <Button label="Positive Button" variant="positive" aria-description="This adds a new record" />
            <Button label="Negative Button" variant="negative" description="This permanently deletes the record" />
            <Button label="Attention Button" variant="attention" typeDescription="This requires immediate attention" />
            <Button label="Transparent Button" variant="transparent" />
        </div>
    )
};

export const Options: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Emphasis: one **emphasized** button per page for the primary call to action, **standard** for ' +
                    'most buttons, **transparent** for the lowest priority, e.g. in tables and lists.'
            }
        }
    },
    render: () => (
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="emphasized">Emphasized Button</Button>
            <Button>Default Button</Button>
            <Button variant="transparent">Transparent Button</Button>
        </div>
    )
};

export const Menu: Story = {
    parameters: { docs: { description: { story: 'Menu buttons show an arrow and open a menu.' } } },
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                {VARIANTS.map((v) => (
                    <Button key={v} menu variant={v} glyph="cart" label="Add to Cart" />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {VARIANTS.map((v) => (
                    <Button key={v} menu variant={v} glyph="cart" aria-label={`Menu ${v}`} title={`Menu ${v}`} />
                ))}
            </div>
        </div>
    )
};

export const Sizes: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Cozy (default) and compact density: set `data-density` on the button or an ancestor, or use the Density toolbar switch.'
            }
        }
    },
    render: () => (
        <div className="flex flex-wrap items-center gap-2">
            <Button data-density="cozy" label="Cozy Button" />
            <Button data-density="compact" label="Compact Button" />
            <Button data-density="cozy" glyph="cart" aria-label="Cart, cozy" />
            <Button data-density="compact" glyph="cart" aria-label="Cart, compact" />
        </div>
    )
};

export const Icons: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                {VARIANTS.map((v) => (
                    <Button key={v} variant={v} glyph="cart" label="Add to Cart" />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {VARIANTS.map((v) => (
                    <Button key={v} variant={v} glyph="cart" aria-label={`Cart ${v}`} title={`Cart ${v}`} />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button glyph="navigation-right-arrow" glyphPosition="after" label="Next" />
                <Button variant="transparent" glyph="nav-back" label="Back" />
            </div>
        </div>
    )
};

export const State: Story = {
    parameters: {
        docs: {
            description: {
                story: '`disabled` removes the button from interaction. With `focusableWhenDisabled` it stays focusable (aria-disabled) so a tooltip stays reachable.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <Button toggled label="Toggled State" />
                <Button disabled focusableWhenDisabled label="ARIA Disabled State" />
                <Button disabled label="Disabled State" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {VARIANTS.map((v) => (
                    <Button key={v} disabled variant={v} label={v} />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button nativeButton={false} render={<a href="#" />} label="Link as button" />
                <Button nativeButton={false} render={<a href="#" />} disabled label="Disabled link" />
            </div>
        </div>
    )
};

export const States: Story = {
    name: 'States by type',
    parameters: {
        docs: {
            description: {
                story:
                    'Default, selected, disabled and disabled but focusable for every type. A focusable disabled button ' +
                    'describes why it is disabled (`disabledMessage`) and announces `enabledMessage` once enabled.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-4">
            {VARIANTS.map((v) => (
                <div key={v} className="flex flex-wrap items-center gap-2">
                    <Button variant={v} label={`${v} default`} />
                    <Button variant={v} selected label={`${v} selected`} />
                    <Button variant={v} disabled label={`${v} disabled`} />
                    <Button
                        variant={v}
                        disabled
                        focusableWhenDisabled
                        disabledMessage="Enable it with the switch in the Playground story"
                        enabledMessage="This button is now enabled"
                        label={`${v} focusable`}
                    />
                </div>
            ))}
        </div>
    )
};

function ToggledDemo() {
    const [state, setState] = useState<Record<string, boolean>>({ standard: true });
    return (
        <div className="flex flex-wrap items-center gap-2">
            {VARIANTS.map((v) => (
                <Button
                    key={v}
                    variant={v}
                    toggled={!!state[v]}
                    onClick={() => setState((s) => ({ ...s, [v]: !s[v] }))}
                    label={`${v === 'standard' ? 'Default' : v[0].toUpperCase() + v.slice(1)} Toggle`}
                />
            ))}
        </div>
    );
}

export const Toggled: Story = {
    parameters: { docs: { description: { story: 'Toggle buttons expose their state with `aria-pressed`.' } } },
    render: () => <ToggledDemo />
};

export const Badge: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Badges show a counter (up to 4 characters) on standard, emphasized, ghost and transparent buttons, ' +
                    'with `ButtonBadge` or the `badge` prop. In compact density the badge sits inline.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-6 p-2">
            <div className="flex flex-wrap items-center gap-4">
                {BADGE_ENABLED_BUTTON_VARIANTS.map((v, i) => (
                    <Button key={v} variant={v} label={v}>
                        <ButtonBadge>{i + 1}</ButtonBadge>
                    </Button>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button badge="1234" label="Default" />
                <Button badge="123" variant="emphasized" label="Emphasized" />
                <Button badge="12" variant="transparent" label="Transparent" />
                <Button badge="1234" data-density="compact" label="Default compact" />
                <Button badge="123" variant="emphasized" data-density="compact" label="Emphasized compact" />
                <Button badge="12" variant="transparent" data-density="compact" label="Transparent compact" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button glyph="bell" aria-label="999 notifications">
                    <ButtonBadge>999</ButtonBadge>
                </Button>
                <Button variant="transparent" glyph="message-popup" aria-label="Messages">
                    <ButtonBadge attention />
                </Button>
            </div>
        </div>
    )
};
