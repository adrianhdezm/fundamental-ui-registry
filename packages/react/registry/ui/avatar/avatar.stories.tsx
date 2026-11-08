import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, type AvatarProps, type ColorAccent } from './avatar';

const SIZES = ['xs', 's', 'm', 'l', 'xl'] as const;
const COLORS: ColorAccent[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const meta = {
    title: 'Components/Avatar',
    component: Avatar,
    parameters: {
        docs: {
            description: {
                component:
                    'An avatar shows an image, initials or an icon for a person, business object or entity. ' +
                    'Give image and icon avatars an `aria-label`; clickable avatars become buttons. Built on ' +
                    "Base UI's Avatar, which loads the image."
            }
        }
    },
    argTypes: {
        size: { control: 'inline-radio', options: SIZES },
        colorAccent: { control: { type: 'number', min: 1, max: 10 } },
        valueState: { control: 'select', options: [null, 'positive', 'caution', 'negative', 'information'] }
    },
    args: { label: 'Jane Doe', size: 'l', circle: false, clickable: false, transparent: false, border: false }
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** One avatar per size, with the same props. */
const Row = (props: AvatarProps) => (
    <div className="flex flex-wrap items-center gap-4">
        {SIZES.map((size) => (
            <Avatar key={size} size={size} {...props} />
        ))}
    </div>
);

export const Playground: Story = {};

export const Sizes: Story = {
    render: () => <Row glyph="washing-machine" aria-label="Washing machine" />
};

export const Icon: Story = {
    parameters: {
        docs: { description: { story: 'Clickable icon avatars have role="button" and react to Enter and Space.' } }
    },
    render: () => (
        <div className="flex flex-col gap-4">
            <Row glyph="product" aria-label="Product" />
            <Row circle glyph="person-placeholder" aria-label="Person" />
            <Row glyph="group" aria-label="Group" clickable onAvatarClick={() => console.log('avatar clicked')} />
        </div>
    )
};

export const Initials: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <Row label="Wendy Wallace" />
            <Row label="Marjolein van Veen" />
            <Row label="Anna María Agustí Suárez" />
        </div>
    )
};

export const Circle: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <Row circle glyph="person-placeholder" aria-label="Person" />
            <Row circle label="Wendy Wallace" />
            <Row circle glyph="batch-payments" aria-label="Batch payments" />
        </div>
    )
};

export const BackgroundImage: Story = {
    name: 'Background image',
    render: () => (
        <div className="flex flex-col gap-4">
            <Row circle image="assets/person.svg" aria-label="John Doe" />
            <div className="flex flex-wrap items-center gap-4">
                {SIZES.map((size) => (
                    <Avatar key={size} size={size} image="assets/landscape.svg" aria-label="Landscape" />
                ))}
                <Avatar size="xl" contain image="assets/landscape.svg" aria-label="Landscape, contained" />
            </div>
        </div>
    )
};

export const Transparent: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <Row circle transparent glyph="person-placeholder" aria-label="Person" />
            <Row circle transparent label="Wendy Wallace" />
            <Row transparent glyph="car-rental" aria-label="Car rental" />
        </div>
    )
};

export const Placeholder: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <Row circle placeholder glyph="person-placeholder" aria-label="Person" />
            <div className="flex flex-wrap items-center gap-4">
                <Avatar placeholder size="xs" glyph="product" aria-label="Product" />
                <Avatar placeholder size="s" glyph="product" aria-label="Product" />
                <Avatar placeholder size="m" glyph="product" aria-label="Product" />
            </div>
        </div>
    )
};

export const Tile: Story = {
    parameters: { docs: { description: { story: 'For avatars inside tiles: the tile background and icon colour.' } } },
    render: () => (
        <div className="flex flex-col gap-4">
            <Row circle tile glyph="person-placeholder" aria-label="Person" />
            <div className="rounded-sap-tile-border-corner-radius bg-sap-tile-background p-4">
                <Row tile glyph="favorite" aria-label="Favorite" />
            </div>
        </div>
    )
};

export const AccentColors: Story = {
    name: 'Accent and indication colors',
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
                {COLORS.map((c) => (
                    <Avatar key={c} size="m" colorAccent={c} glyph="product" aria-label={`Accent ${c}`} />
                ))}
            </div>
            <div className="flex flex-wrap gap-4">
                {COLORS.map((c) => (
                    <Avatar key={c} size="m" colorIndication={c} glyph="product" aria-label={`Indication ${c}`} />
                ))}
            </div>
            <div className="flex flex-wrap gap-4">
                {COLORS.map((c) => (
                    <Avatar key={c} colorIndication={c} interactive tabIndex={0} label="Jane Doe" />
                ))}
            </div>
        </div>
    )
};

export const ZoomIcon: Story = {
    name: 'Zoom icon',
    parameters: {
        docs: { description: { story: 'The zoom icon makes the avatar a button that calls `onZoomGlyphClick`.' } }
    },
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4 p-2">
                {SIZES.map((size, i) => (
                    <Avatar
                        key={size}
                        circle
                        size={size}
                        zoomGlyph="edit"
                        colorAccent={(i + 1) as ColorAccent}
                        glyph="person-placeholder"
                        aria-label="Edit person"
                        onZoomGlyphClick={() => console.log('zoom glyph clicked')}
                    />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 p-2">
                {SIZES.map((size, i) => (
                    <Avatar
                        key={size}
                        size={size}
                        zoomGlyph="edit"
                        colorAccent={(i + 6) as ColorAccent}
                        label="Wendy Wallace"
                        // the name contains the visible initials, as the avatar is a button
                        aria-label="WW, edit the photo of Wendy Wallace"
                    />
                ))}
            </div>
        </div>
    )
};

export const ValueStates: Story = {
    name: 'Value states',
    render: () => (
        <div className="flex flex-wrap items-center gap-4 p-2">
            <Avatar
                size="xl"
                circle
                colorAccent={2}
                valueState="negative"
                glyph="person-placeholder"
                aria-label="Person, negative"
            />
            <Avatar
                size="xl"
                circle
                colorAccent={3}
                valueState="caution"
                glyph="person-placeholder"
                aria-label="Person, caution"
            />
            <Avatar
                size="xl"
                circle
                colorAccent={4}
                valueState="positive"
                glyph="person-placeholder"
                aria-label="Person, positive"
            />
            <Avatar
                size="xl"
                circle
                colorAccent={5}
                valueState="information"
                glyph="person-placeholder"
                aria-label="Person, information"
            />
        </div>
    )
};

export const Border: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <Row border transparent glyph="product" aria-label="Product" />
            <Row border transparent circle label="Wendy Wallace" />
            <Row border transparent glyph="money-bills" aria-label="Money" />
            {/* a bordered image keeps the border colour, as fundamental-styles' avatar group thumbnails */}
            <Row border circle image="assets/person.svg" aria-label="John Doe" />
        </div>
    )
};

/** The interactive avatars of fundamental-styles' Interactive story, with a role and a name. */
const Interactive = (props: AvatarProps) => (
    <div className="flex flex-wrap items-center gap-6 p-2">
        {SIZES.map((size, i) => (
            <Avatar
                key={size}
                circle
                size={size}
                colorAccent={(i + 1) as ColorAccent}
                glyph="person-placeholder"
                aria-label="Person"
                {...props}
            />
        ))}
        {SIZES.map((size, i) => (
            <Avatar
                key={size}
                size={size}
                colorAccent={(i + 6) as ColorAccent}
                label="Wendy Wallace"
                // the name of a button contains its visible text
                aria-label="WW, Wendy Wallace"
                {...props}
            />
        ))}
        <Avatar size="xl" circle placeholder glyph="person-placeholder" aria-label="Person" {...props} />
        <Avatar size="xl" circle tile glyph="person-placeholder" aria-label="Person" {...props} />
        <Avatar size="xl" circle image="assets/person.svg" aria-label="John Doe" {...props} />
        <Avatar size="xl" circle transparent label="Wendy Wallace" aria-label="WW, Wendy Wallace" {...props} />
        <Avatar size="xl" transparent border glyph="person-placeholder" aria-label="Person" {...props} />
        <Avatar size="xl" circle transparent border label="Wendy Wallace" aria-label="WW, Wendy Wallace" {...props} />
        {SIZES.map((size, i) => (
            <Avatar
                key={size}
                circle
                size={size}
                colorIndication={(i + 1) as ColorAccent}
                glyph="product"
                aria-label="Product"
                {...props}
            />
        ))}
        {SIZES.map((size, i) => (
            <Avatar
                key={size}
                size={size}
                colorIndication={(i + 6) as ColorAccent}
                glyph="product"
                aria-label="Product"
                {...props}
            />
        ))}
    </div>
);

export const InteractiveStates: Story = {
    name: 'Interactive states',
    parameters: {
        docs: {
            description: {
                story:
                    'Clickable avatars get the hover and pressed colours; `aria-pressed` shows the toggled state and ' +
                    '`aria-disabled` the disabled one (an avatar opening a menu would use `interactive` with its own role).'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-4 font-sap-font-family text-sap-text-color">
            <p className="font-sap-font-bold-family">Regular</p>
            <Interactive clickable />
            <p className="font-sap-font-bold-family">Toggled</p>
            <Interactive clickable aria-pressed="true" />
            <p className="font-sap-font-bold-family">Disabled</p>
            <Interactive interactive role="button" aria-disabled="true" />
        </div>
    )
};

export const AlternativeOptions: Story = {
    name: 'Image with alternative options',
    parameters: {
        docs: {
            description: {
                story:
                    'When the image fails, `alterIcon` tries the content (children, hidden), the alt text, a backup ' +
                    'image and the default icon, in the given order.'
            }
        }
    },
    render: () => (
        <div className="flex flex-wrap items-center gap-4">
            <Avatar
                size="xs"
                image="missing-1.jpeg"
                alterIcon="content|alt|backup|default-icon"
                backupImage="assets/person.svg"
            >
                John Doe
            </Avatar>
            <Avatar
                size="s"
                image="missing-2.jpeg"
                alterIcon="content|alt|backup|default-icon"
                backupImage="assets/person.svg"
                alt="John Doe"
            />
            <Avatar
                size="m"
                image="missing-3.jpeg"
                alterIcon="content|alt|backup|default-icon"
                backupImage="assets/person.svg"
                aria-label="John Doe"
            />
            <Avatar size="l" image="missing-4.jpeg" alterIcon="alt|content|backup|default-icon" aria-label="John Doe" />
            <Avatar
                size="xl"
                image="missing-5.jpeg"
                alterIcon="custom"
                backupImage="missing-6.jpeg"
                aria-label="John Doe"
            />
            <Avatar size="xl" contain image="assets/person.svg" aria-label="John Doe" />
        </div>
    )
};
