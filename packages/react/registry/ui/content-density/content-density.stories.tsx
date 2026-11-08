import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { FormLabel } from '@/ui/form/form';
import { Input } from '@/ui/input/input';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';
import { Switch } from '@/ui/switch/switch';
import { ContentDensity, useContentDensity, type ContentDensityMode } from './content-density';

const box =
    'flex flex-col gap-2 rounded-sap-element-border-corner-radius border border-dashed border-sap-neutral-border-color p-3 font-sap-font-family text-sap-font-size text-sap-text-color';
const row = 'flex flex-wrap items-center gap-2';

function Fields({ name }: { name: string }) {
    return (
        <div className={row}>
            <Button label="Button" />
            <Input aria-label={`${name} input`} placeholder={`${name} input`} />
        </div>
    );
}

function Modes() {
    return (
        <div className="flex flex-col gap-4">
            <ContentDensity cozy render={<section />} className={box}>
                <span>
                    Cozy (<code>cozy</code>)
                </span>
                <Fields name="Cozy" />
            </ContentDensity>
            <ContentDensity compact render={<section />} className={box}>
                <span>
                    Compact (<code>compact</code>)
                </span>
                <Fields name="Compact" />
            </ContentDensity>
            <ContentDensity condensed render={<section />} className={box}>
                <span>
                    Condensed (<code>condensed</code>), compact sizes where a component has no condensed size
                </span>
                <Fields name="Condensed" />
            </ContentDensity>
        </div>
    );
}

function Inheritance() {
    return (
        <div className={box}>
            <span>No ContentDensity: follows the global density</span>
            <Button label="Global" className="self-start" />
            <ContentDensity cozy className={box}>
                <span>
                    Cozy regardless of the global density (<code>cozy</code>)
                </span>
                <div className={box}>
                    <span>Inherits cozy from its parent (no ContentDensity)</span>
                    <Button label="Inherited cozy" className="self-start" />
                    <ContentDensity density="condensed" className={box}>
                        <span>
                            Condensed regardless of its parent (<code>density="condensed"</code>)
                        </span>
                        <Button label="Condensed" className="self-start" />
                    </ContentDensity>
                </div>
                <ContentDensity compact className={box}>
                    <span>
                        Compact regardless of its parent (<code>compact</code>)
                    </span>
                    <Button label="Compact" className="self-start" />
                    <ContentDensity cozy className={box}>
                        <span>
                            A cozy island inside compact (<code>cozy</code>)
                        </span>
                        <Button label="Cozy island" className="self-start" />
                    </ContentDensity>
                </ContentDensity>
            </ContentDensity>
        </div>
    );
}

function Toggle() {
    const [compact, setCompact] = useState(true);
    return (
        <div className={box}>
            <Switch checked={compact} onCheckedChange={setCompact}>
                Use compact
            </Switch>
            <ContentDensity compact={compact} className="flex flex-col gap-2">
                <FormLabel htmlFor="density-toggle-input">
                    {compact ? 'compact = true: compact density' : 'compact = false: follows the global density'}
                </FormLabel>
                <Input id="density-toggle-input" placeholder="Input" />
                <Button label="Button" className="self-start" />
            </ContentDensity>
        </div>
    );
}

/** A popover body is portalled to <body>: useContentDensity() carries the density into it. */
function PortalBody() {
    const density = useContentDensity();
    return (
        <PopoverBody aria-label="Compact popover" data-density={density ?? undefined}>
            <div className="flex flex-col gap-2 p-4">
                <Input aria-label="Popover input" placeholder="Popover input" />
                <Button label="Popover button" className="self-start" />
            </div>
        </PopoverBody>
    );
}

function Portal() {
    return (
        <ContentDensity compact className={box}>
            <span>A compact section; its popover is rendered in a portal</span>
            <Popover placement="bottom-start">
                <PopoverTrigger render={<Button label="Open popover" className="self-start" />} />
                <PortalBody />
            </Popover>
        </ContentDensity>
    );
}

/**
 * The visual check: the outer section forces the other density, the inner one the toolbar density again, so the
 * button and input match fundamental-styles' only if both overrides work.
 */
function Nested({ density }: { density: ContentDensityMode }) {
    return (
        <ContentDensity density={density === 'compact' ? 'cozy' : 'compact'} className={box}>
            <span>The other density</span>
            <ContentDensity density={density} className={box} data-testid="nested">
                <span>The toolbar density again</span>
                <div className={row}>
                    <Button label="Default Button" />
                    <Input aria-label="Nested input" placeholder="e.g., Jane Doe" />
                </div>
            </ContentDensity>
        </ContentDensity>
    );
}

const meta = {
    title: 'Components/Content Density',
    parameters: {
        docs: {
            description: {
                component:
                    'Content density sets cozy, compact or condensed sizes for an element and everything inside it. ' +
                    '`ContentDensity` (`density`, or the `compact`, `cozy` and `condensed` shorthands) writes `data-density`; components react ' +
                    'through CSS, and the nearest `data-density` wins. The toolbar density switcher sets it on the ' +
                    'document element, which is the global density. Portals leave the subtree: `useContentDensity()` carries the density into them.\n\n' +
                    '```tsx\n' +
                    '<ContentDensity compact render={<section />}>…</ContentDensity>\n' +
                    '```'
            }
        }
    }
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const DensityModes: Story = { name: 'Content density modes', render: () => <Modes /> };

export const Directives: Story = { name: 'Directives and inheritance', render: () => <Inheritance /> };

export const ToggleDirective: Story = { name: 'Toggle directive', render: () => <Toggle /> };

export const OpenPortal: Story = {
    name: 'Open: density in a portal',
    tags: ['!autodocs'],
    render: () => <Portal />,
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open popover' }));
        await waitFor(() => expect(document.querySelector('[role=dialog][data-density="compact"]')).not.toBeNull());
    }
};

export const NestedDensities: Story = {
    name: 'Nested densities',
    parameters: {
        docs: {
            description: {
                story: 'A section in the other density with a section in the toolbar density inside: the visual check against fundamental-styles.'
            }
        }
    },
    render: (_, { globals }) => <Nested density={globals['density'] === 'compact' ? 'compact' : 'cozy'} />
};
