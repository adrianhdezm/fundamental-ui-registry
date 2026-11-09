import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type MouseEvent, type ReactNode } from 'react';
import { ObjectMarker } from './object-marker';

const Row = ({ children }: { children: ReactNode }) => (
    <div className="flex flex-wrap items-center gap-4">{children}</div>
);
const prevent = (event: MouseEvent) => event.preventDefault();

const meta = {
    title: 'Components/Object Marker',
    component: ObjectMarker,
    parameters: {
        docs: {
            description: {
                component:
                    'Object markers show technical states of an object, such as draft, locked or favourite, as an ' +
                    'icon, text or both. Clickable markers are links. A hidden text announces whether the marker is ' +
                    'active (clickable) or not, before its label.'
            }
        }
    },
    args: { glyph: 'private', label: 'Locked', clickable: false }
} satisfies Meta<typeof ObjectMarker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// fundamental-styles' examples and texts
export const IconOnly: Story = {
    name: 'Icon only',
    render: () => (
        <Row>
            <ObjectMarker glyph="request" title="Request" />
            <ObjectMarker glyph="favorite" title="Favourite" />
            <ObjectMarker glyph="flag" title="Flag" />
            <ObjectMarker glyph="user-edit" title="Edit" />
            <ObjectMarker glyph="private" title="Private" />
            <ObjectMarker clickable glyph="user-edit" title="Editable" render={<a href="#" onClick={prevent} />} />
            <ObjectMarker clickable glyph="private" title="Private" render={<a href="#" onClick={prevent} />} />
        </Row>
    )
};

export const TextOnly: Story = {
    name: 'Text only',
    render: () => (
        <Row>
            <ObjectMarker label="Draft" />
            <ObjectMarker label="Locked" />
            <ObjectMarker label="Request" />
            <ObjectMarker clickable label="Locked" render={<a href="#" onClick={prevent} />} />
            <ObjectMarker clickable label="Edit" render={<a href="#" onClick={prevent} />} />
        </Row>
    )
};

export const IconAndText: Story = {
    name: 'Icon and text',
    render: () => (
        <Row>
            <ObjectMarker glyph="request" label="Request" />
            <ObjectMarker glyph="favorite" label="Favourite" />
            <ObjectMarker glyph="flag" label="Flag" />
            <ObjectMarker glyph="user-edit" label="Draft" />
            <ObjectMarker glyph="private" label="Locked" />
        </Row>
    )
};

/** Clicking "Locked" toggles its icon between locked and unlocked. */
function ToggleLock() {
    const [glyph, setGlyph] = useState('private');
    return (
        <ObjectMarker
            clickable
            glyph={glyph}
            label="Locked"
            render={<a href="#" />}
            onClick={(event) => {
                event.preventDefault();
                setGlyph((g) => (g === 'private' ? 'unlocked' : 'private'));
            }}
        />
    );
}

export const Clickable: Story = {
    render: () => (
        <Row>
            <ToggleLock />
            <ObjectMarker
                clickable
                glyph="user-edit"
                label="Unsaved Changes"
                render={<a href="#" onClick={prevent} />}
            />
            <ObjectMarker clickable glyph="request" label="Request" />
        </Row>
    )
};

export const Adjacent: Story = {
    name: 'Next to each other',
    render: () => (
        <div>
            <ObjectMarker glyph="private" title="Locked" />
            <ObjectMarker glyph="favorite" title="Favourite" />
            <ObjectMarker glyph="flag" label="Flagged" />
        </div>
    )
};
