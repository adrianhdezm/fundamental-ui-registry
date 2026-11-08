import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { PLACEMENTS, type Placement, type PopoverFillMode } from '@/ui/popover/popover';
import { Radio, RadioGroup } from '@/ui/radio/radio';
import { Title } from '@/ui/title/title';
import {
    Menu,
    MenuAddon,
    MenuCheckboxItem,
    MenuContent,
    MenuItem,
    MenuItemInput,
    MenuPopup,
    MenuRadioGroup,
    MenuRadioItem,
    MenuShortcut,
    MenuSubtitle,
    MenuTitle,
    MenuTrigger,
    createMenuHandle,
    type MenuPathItem,
    type MenuProps
} from './menu';

const meta = {
    title: 'Components/Menu',
    component: Menu,
    subcomponents: {
        MenuTrigger,
        MenuPopup,
        MenuItem,
        MenuCheckboxItem,
        MenuRadioGroup,
        MenuRadioItem,
        MenuTitle,
        MenuSubtitle,
        MenuContent,
        MenuAddon,
        MenuShortcut,
        MenuItemInput
    } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 420 },
            description: {
                component:
                    "A menu lists actions in a popover opened by its trigger, on Base UI's Menu. Compose it from `Menu` " +
                    '(state and options), `MenuTrigger` (the control; `render` your own `Button`) and `MenuPopup` (the ' +
                    'menu, in a portal) with `MenuItem`s inside. Click, Enter, Space or ArrowDown on the trigger open ' +
                    'it; ArrowUp/ArrowDown, Home and End move between the enabled items; ArrowRight opens a submenu and ' +
                    'ArrowLeft closes it (mirrored in RTL); Enter and Space activate; Escape and Tab close.\n\n' +
                    'Items can have icons (`MenuAddon`), subtitles (`MenuContent`, `MenuSubtitle`), shortcuts ' +
                    '(`MenuShortcut`) and separators (`hasSeparator`), open a submenu (`submenu`), toggle a value ' +
                    '(`MenuCheckboxItem`), form a single-choice group (`MenuRadioGroup`, `MenuRadioItem`) or hold an ' +
                    'input (`MenuItemInput`). With `mobile` the menu opens in a full-screen dialog, one level at a time.\n\n' +
                    '```tsx\n' +
                    '<Menu>\n' +
                    '    <MenuTrigger render={<Button menu label="Actions" />} />\n' +
                    '    <MenuPopup aria-label="Actions">\n' +
                    '        <MenuItem onClick={edit}>Edit</MenuItem>\n' +
                    '        <MenuItem submenu={<MenuItem>PDF</MenuItem>}>\n' +
                    '            <MenuTitle>Export</MenuTitle>\n' +
                    '            <MenuAddon submenuIndicator />\n' +
                    '        </MenuItem>\n' +
                    '    </MenuPopup>\n' +
                    '</Menu>\n' +
                    '```'
            }
        }
    },
    argTypes: {
        placement: { control: 'select', options: PLACEMENTS },
        fillControlMode: { control: 'inline-radio', options: [null, 'at-least', 'equal', 'fit-content'] }
    },
    args: {
        placement: 'bottom-start',
        disabled: false,
        fixedPosition: false,
        closeOnOutsideClick: true,
        closeOnEscapeKey: true,
        closeOnSelect: true,
        focusAutoCapture: true,
        restoreFocusOnClose: true,
        disableScrollbar: false,
        openOnHoverTime: 0,
        mobile: false
    }
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

const TEXT = 'font-sap-font-family text-sap-font-size text-sap-text-color';

/** A trigger button and its menu. */
function MenuButton({
    label,
    menuLabel,
    children,
    ...props
}: MenuProps & { label: string; menuLabel?: string; children: ReactNode }) {
    return (
        <Menu {...props}>
            <MenuTrigger render={<Button menu label={label} />} />
            <MenuPopup aria-label={menuLabel ?? label}>{children}</MenuPopup>
        </Menu>
    );
}

export const Playground: Story = {
    render: (args) => (
        <MenuButton {...args} label="Menu">
            <MenuItem>Option 1</MenuItem>
            <MenuItem hasSeparator>Option 2</MenuItem>
            <MenuItem
                submenu={
                    <>
                        <MenuItem>Sub-option 1</MenuItem>
                        <MenuItem>Sub-option 2</MenuItem>
                    </>
                }
            >
                <MenuTitle>Option 3</MenuTitle>
                <MenuAddon submenuIndicator />
            </MenuItem>
            <MenuItem disabled>Option 4</MenuItem>
        </MenuButton>
    )
};

/* ------------------------------------------------------------------------------------------------------------------
 * Angular stories
 * ---------------------------------------------------------------------------------------------------------------- */

const basicItems = (
    <>
        <MenuItem>
            <MenuContent>
                <MenuTitle>Menu title</MenuTitle>
                <MenuSubtitle>Menu subtitle</MenuSubtitle>
            </MenuContent>
        </MenuItem>
        <MenuItem>
            <MenuContent>
                <MenuTitle>
                    Menu title lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque, deserunt molestias
                    suscipit esse incidunt nobis.
                </MenuTitle>
                <MenuSubtitle>
                    Menu subtitle quidem est dolores vitae aliquam autem impedit reiciendis doloribus.
                </MenuSubtitle>
            </MenuContent>
        </MenuItem>
        <MenuItem>
            <MenuContent>
                <MenuTitle truncate>
                    Truncated menu title lorem ipsum dolor sit amet consectetur adipisicing elit.
                </MenuTitle>
                <MenuSubtitle truncate>
                    Truncated menu subtitle quidem est dolores vitae aliquam autem impedit.
                </MenuSubtitle>
            </MenuContent>
        </MenuItem>
        <MenuItem hasSeparator>Menu item with separator</MenuItem>
        <MenuItem disabled>Disabled item</MenuItem>
        <MenuItem>Menu item</MenuItem>
    </>
);

export const Basic: Story = {
    name: 'Menu',
    render: () => (
        <MenuButton label="Menu" menuLabel="Basic menu">
            {basicItems}
        </MenuButton>
    )
};

const iconItems = (
    <>
        <MenuItem>
            <MenuAddon glyph="cart" />
            <MenuTitle>Option 1</MenuTitle>
        </MenuItem>
        <MenuItem>
            <MenuAddon glyph="accept" />
            <MenuTitle>Option 2</MenuTitle>
            <MenuAddon glyph="decline" />
        </MenuItem>
        <MenuItem>
            <MenuTitle>Option 3</MenuTitle>
            <MenuAddon glyph="menu" />
        </MenuItem>
        <MenuItem>
            <MenuAddon glyph="cart" />
            <MenuContent>
                <MenuTitle>Option 4</MenuTitle>
                <MenuSubtitle>Option 4 subtitle</MenuSubtitle>
            </MenuContent>
        </MenuItem>
        <MenuItem>
            <MenuContent>
                <MenuTitle>Option 5</MenuTitle>
                <MenuSubtitle>Option 5 subtitle</MenuSubtitle>
            </MenuContent>
            <MenuAddon glyph="menu" />
        </MenuItem>
    </>
);

const shortcutItems = (
    <>
        <MenuItem>
            <MenuTitle>Save</MenuTitle>
            <MenuShortcut>Ctrl + S</MenuShortcut>
        </MenuItem>
        <MenuItem>
            <MenuTitle>Print</MenuTitle>
            <MenuShortcut>Ctrl + P</MenuShortcut>
        </MenuItem>
        <MenuItem>
            <MenuContent>
                <MenuTitle>Close tab</MenuTitle>
                <MenuSubtitle>Additional command</MenuSubtitle>
            </MenuContent>
            <MenuShortcut>Ctrl + W</MenuShortcut>
        </MenuItem>
    </>
);

export const Addons: Story = {
    name: 'Icons and shortcuts',
    render: () => (
        <div className="flex flex-wrap gap-4">
            <MenuButton label="Menu with icons">{iconItems}</MenuButton>
            <MenuButton label="Menu with shortcuts">{shortcutItems}</MenuButton>
        </div>
    )
};

function SubmenuExample({ openOnHoverTime = 0 }: { openOnHoverTime?: number }) {
    const [path, setPath] = useState<MenuPathItem[]>([]);
    const leaf = (title: string) => <MenuItem key={title}>{title}</MenuItem>;
    const parent = (title: string, children: ReactNode, glyph?: string) => (
        <MenuItem submenu={children}>
            {glyph && <MenuAddon glyph={glyph} />}
            <MenuTitle>{title}</MenuTitle>
            <MenuAddon submenuIndicator />
        </MenuItem>
    );
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Menu openOnHoverTime={openOnHoverTime} onActivePathChange={setPath}>
                <MenuTrigger render={<Button menu label="Menu with submenus" />} />
                <MenuPopup aria-label="Groceries">
                    {parent('Fruits', [leaf('Pineapple'), leaf('Banana')], 'nutrition-activity')}
                    {parent('Vegetables', [leaf('Cucumber'), leaf('Onion')], 'e-care')}
                    {parent(
                        'Milk products',
                        <>
                            {parent('Cheese', [leaf('Parmesan'), leaf('Brie')])}
                            {parent('Yogurts', [leaf('Greek'), leaf('Natural')])}
                            {leaf('Butter')}
                        </>
                    )}
                    {leaf('Meat')}
                </MenuPopup>
            </Menu>
            <span className={TEXT} aria-live="polite">
                Active path: {path.map((item) => item.title).join(' › ')}
            </span>
        </div>
    );
}

export const Submenus: Story = {
    name: 'Submenus',
    render: () => <SubmenuExample />
};

interface Node {
    title: string;
    children: Node[];
}

const TREE: Node[] = [
    {
        title: 'Documents',
        children: [
            { title: 'Recent', children: [] },
            {
                title: 'Shared',
                children: [
                    { title: 'With me', children: [] },
                    { title: 'By me', children: [] }
                ]
            }
        ]
    },
    { title: 'Images', children: [{ title: 'Screenshots', children: [] }] },
    { title: 'Trash', children: [] }
];

function renderNode(node: Node): ReactNode {
    return node.children.length ? (
        <MenuItem key={node.title} submenu={node.children.map(renderNode)}>
            <MenuTitle>{node.title}</MenuTitle>
            <MenuAddon submenuIndicator />
        </MenuItem>
    ) : (
        <MenuItem key={node.title}>{node.title}</MenuItem>
    );
}

export const Dynamic: Story = {
    name: 'Submenus from data',
    parameters: {
        docs: { description: { story: 'Items and submenus rendered from a tree, recursively.' } }
    },
    render: () => <MenuButton label="Menu from data">{TREE.map(renderNode)}</MenuButton>
};

function ExtendedExample() {
    const [toggle, setToggle] = useState(false);
    const [sort, setSort] = useState<unknown>('asc');
    const [text, setText] = useState('');
    return (
        <>
            <dl className={`m-0 mb-2 grid grid-cols-[auto_1fr] gap-x-2 ${TEXT}`}>
                <dt>Toggle value:</dt>
                <dd className="m-0">{String(toggle)}</dd>
                <dt>Sort value:</dt>
                <dd className="m-0">{sort == null ? 'none' : String(sort)}</dd>
                <dt>Text input value:</dt>
                <dd className="m-0">{text}</dd>
            </dl>
            <MenuButton label="Extended items">
                <MenuCheckboxItem render={<button />} checked={toggle} onCheckedChange={setToggle}>
                    Toggle button
                </MenuCheckboxItem>
                <MenuItem render={<button />} hasSeparator id="extended-sort">
                    <MenuAddon glyph="sort" />
                    <MenuTitle>Sort</MenuTitle>
                </MenuItem>
                <MenuRadioGroup aria-labelledby="extended-sort" value={sort} onValueChange={setSort}>
                    <MenuRadioItem render={<button />} value="asc">
                        Ascending
                    </MenuRadioItem>
                    <MenuRadioItem render={<button />} value="desc">
                        Descending
                    </MenuRadioItem>
                    <MenuRadioItem render={<button />} value={null}>
                        None
                    </MenuRadioItem>
                </MenuRadioGroup>
                <MenuItem>
                    <MenuItemInput
                        aria-label="Text"
                        placeholder="Field placeholder text"
                        value={text}
                        onValueChange={setText}
                    />
                </MenuItem>
            </MenuButton>
        </>
    );
}

export const Extended: Story = {
    name: 'Toggle, single-choice group and input',
    render: () => <ExtendedExample />
};

const mobileItems = (
    <>
        <MenuItem
            submenu={
                <>
                    <MenuItem>Pineapple</MenuItem>
                    <MenuItem>Banana</MenuItem>
                </>
            }
        >
            <MenuTitle>Fruits</MenuTitle>
            <MenuAddon submenuIndicator />
        </MenuItem>
        <MenuItem>
            <MenuTitle>Save</MenuTitle>
            <MenuShortcut>Ctrl + S</MenuShortcut>
        </MenuItem>
        <MenuItem>Meat</MenuItem>
    </>
);

export const Mobile: Story = {
    name: 'Mobile mode',
    render: () => (
        <MenuButton
            label="Menu in mobile mode"
            menuLabel="Groceries"
            mobile
            mobileConfig={{ title: 'Groceries', cancelButtonText: 'Cancel', hasCloseButton: true }}
        >
            {mobileItems}
        </MenuButton>
    )
};

function ProgrammaticExample() {
    const [open, setOpen] = useState(false);
    const [events, setEvents] = useState<string[]>([]);
    const log = (entry: string) => setEvents((list) => [...list.slice(-7), entry]);
    const change = (next: boolean) => {
        if (next) log('beforeOpen');
        log(`onOpenChange: ${next}`);
        setOpen(next);
    };
    return (
        <>
            <div className="mb-2 flex flex-wrap items-center gap-2">
                <Menu
                    placement="right-start"
                    open={open}
                    onOpenChange={change}
                    onActivePathChange={(path) => log(`activePath: ${path.length} item(s)`)}
                >
                    <MenuTrigger render={<Button label="Open menu" />} />
                    <MenuPopup aria-label="Programmatic menu">
                        <MenuItem>Option 1</MenuItem>
                        <MenuItem>Option 2</MenuItem>
                        <MenuItem>Option 3</MenuItem>
                    </MenuPopup>
                </Menu>
                <Button variant="transparent" label="Open" onClick={() => setOpen(true)} />
                <Button variant="transparent" label="Close" onClick={() => setOpen(false)} />
                <Button variant="transparent" label="Toggle" onClick={() => setOpen(!open)} />
            </div>
            <ol className={`m-0 ps-6 ${TEXT}`} aria-label="Event log">
                {events.map((entry, index) => (
                    <li key={index}>{entry}</li>
                ))}
            </ol>
        </>
    );
}

export const Programmatic: Story = {
    name: 'Programmatic control',
    parameters: {
        docs: {
            description: {
                story:
                    'The controlled `open` prop opens and closes the menu from code; `onOpenChange` reports the ' +
                    "user's changes (Angular's `beforeOpen` and `isOpenChange`)."
            }
        }
    },
    render: () => <ProgrammaticExample />
};

const options = Array.from({ length: 40 }, (_, i) => `Option ${i + 1}`);

export const Scrollbar: Story = {
    name: 'Scrollbar',
    render: () => (
        <MenuButton label="Menu with 40 items" menuLabel="Menu with a scrollbar">
            {options.map((option) => (
                <MenuItem key={option}>{option}</MenuItem>
            ))}
        </MenuButton>
    )
};

function DisabledExample() {
    const [disabled, setDisabled] = useState(false);
    return (
        <div className="flex flex-wrap gap-8">
            <div className="flex flex-col items-start gap-2">
                <Title level={4} headerSize={5}>
                    Disabled menu
                </Title>
                <Checkbox label="Disable entire menu" checked={disabled} onCheckedChange={setDisabled} />
                <MenuButton label="Menu" menuLabel="Menu that can be disabled" disabled={disabled}>
                    <MenuItem>Option 1</MenuItem>
                    <MenuItem>Option 2</MenuItem>
                    <MenuItem>Option 3</MenuItem>
                </MenuButton>
            </div>
            <div className="flex flex-col items-start gap-2">
                <Title level={4} headerSize={5}>
                    Disabled menu items
                </Title>
                <p className={`m-0 ${TEXT}`}>Individual items can be disabled while the menu remains active.</p>
                <MenuButton label="Menu with disabled items">
                    <MenuItem>Active option</MenuItem>
                    <MenuItem disabled>Disabled option</MenuItem>
                    <MenuItem>Another active option</MenuItem>
                    <MenuItem disabled>Another disabled option</MenuItem>
                </MenuButton>
            </div>
        </div>
    );
}

export const Disabled: Story = {
    name: 'Disabled states',
    render: () => <DisabledExample />
};

function PlacementExample() {
    const [placement, setPlacement] = useState<Placement>('bottom-start');
    const [fill, setFill] = useState<string>('none');
    const [fixed, setFixed] = useState(false);
    return (
        <>
            <Title level={4} headerSize={5} className="mb-2">
                Placement options
            </Title>
            <div className="mb-6 flex flex-col gap-2">
                <RadioGroup
                    aria-label="Placement"
                    value={placement}
                    onValueChange={(value) => setPlacement(value as Placement)}
                    className="flex flex-wrap"
                >
                    {PLACEMENTS.map((option) => (
                        <Radio key={option} value={option}>
                            {option}
                        </Radio>
                    ))}
                </RadioGroup>
                <RadioGroup
                    aria-label="Fill mode"
                    value={fill}
                    onValueChange={(value) => setFill(value as string)}
                    className="flex flex-wrap"
                >
                    {['none', 'at-least', 'equal'].map((option) => (
                        <Radio key={option} value={option}>
                            {option}
                        </Radio>
                    ))}
                </RadioGroup>
                <Checkbox label="fixedPosition" checked={fixed} onCheckedChange={setFixed} />
            </div>
            <div className="mb-6 flex justify-center px-12 py-8">
                <Menu
                    placement={placement}
                    fillControlMode={fill === 'none' ? null : (fill as PopoverFillMode)}
                    fixedPosition={fixed}
                >
                    <MenuTrigger
                        render={<Button id="menu-placement-trigger" label="Open menu" className="min-w-50" />}
                    />
                    <MenuPopup aria-label="Placed menu">
                        <MenuItem>Option 1</MenuItem>
                        <MenuItem>Option 2</MenuItem>
                        <MenuItem>Option 3</MenuItem>
                    </MenuPopup>
                </Menu>
            </div>
            <Title level={4} headerSize={5} className="mb-2">
                Trigger modes
            </Title>
            <p className={`m-0 mb-2 ${TEXT}`}>
                The <code>triggers</code> prop sets how the menu opens; the default is click.
            </p>
            <div className="flex flex-wrap gap-4">
                <MenuButton label="Click to open" menuLabel="Click menu" triggers={['click']}>
                    <MenuItem>Click menu option</MenuItem>
                </MenuButton>
                <MenuButton label="Hover to open" menuLabel="Hover menu" triggers={['mouseenter', 'mouseleave']}>
                    <MenuItem>Hover menu option</MenuItem>
                </MenuButton>
            </div>
        </>
    );
}

export const PlacementAndTriggers: Story = {
    name: 'Placement and triggers',
    render: () => <PlacementExample />
};

const detached = createMenuHandle();

export const DetachedTrigger: Story = {
    name: 'Detached trigger',
    parameters: {
        docs: {
            description: {
                story: "A trigger outside its `Menu`, connected with `createMenuHandle()` (Angular's `[fdMenuTrigger]`)."
            }
        }
    },
    render: () => (
        <div className="flex flex-col items-start gap-4">
            <MenuTrigger handle={detached} render={<Button menu label="Actions" />} />
            <Menu handle={detached}>
                <MenuPopup aria-label="Actions">
                    <MenuItem>Edit</MenuItem>
                    <MenuItem>Share</MenuItem>
                </MenuPopup>
            </Menu>
        </div>
    )
};

/* ------------------------------------------------------------------------------------------------------------------
 * fundamental-react stories
 * ---------------------------------------------------------------------------------------------------------------- */

export const Primary: Story = {
    name: 'Primary',
    render: () => (
        <MenuButton label="Menu">
            <MenuItem href="#">Option 1</MenuItem>
            <MenuItem href="#">Option 2</MenuItem>
            <MenuItem href="#">Option 3</MenuItem>
        </MenuButton>
    )
};

export const Separator: Story = {
    name: 'With separator',
    render: () => (
        <MenuButton label="Menu">
            <MenuItem hasSeparator href="#">
                Option 1
            </MenuItem>
            <MenuItem href="#">Option 2</MenuItem>
            <MenuItem hasSeparator href="#">
                Option 3
            </MenuItem>
            <MenuItem href="#">Option 4</MenuItem>
        </MenuButton>
    )
};

export const States: Story = {
    name: 'With states',
    parameters: {
        docs: { description: { story: 'Menu item states: `active` (pressed), `selected` and `disabled`.' } }
    },
    render: () => (
        <MenuButton label="Menu">
            <MenuItem hasSeparator href="#">
                Option 1
            </MenuItem>
            <MenuItem active href="#">
                Option 2
            </MenuItem>
            <MenuItem selected href="#">
                Option 3
            </MenuItem>
            <MenuItem disabled href="#">
                Option 4
            </MenuItem>
        </MenuButton>
    )
};

export const AddOns: Story = {
    name: 'With addons',
    render: () => (
        <MenuButton label="Menu">
            <MenuItem addonBefore="grid" href="#">
                Option 1
            </MenuItem>
            <MenuItem addonBefore="wrench" href="#">
                Option 2
            </MenuItem>
            <MenuItem addonBefore="history" addonAfter="accept" href="#">
                Option 3
            </MenuItem>
            <MenuItem addonBefore="lightbulb" href="#">
                Option 4
            </MenuItem>
        </MenuButton>
    )
};

/* ------------------------------------------------------------------------------------------------------------------
 * Visual reference
 * ---------------------------------------------------------------------------------------------------------------- */

/** An open menu rendered into a box of the page. */
function StaticMenu({
    variant,
    box,
    children,
    ...props
}: MenuProps & { variant: string; box: HTMLElement | null; children: ReactNode }) {
    return (
        <div className="relative h-0">
            <Menu defaultOpen focusAutoCapture={false} closeOnOutsideClick={false} closeOnEscapeKey={false} {...props}>
                <MenuTrigger aria-label={variant} className="sr-only-sap" />
                {box && (
                    <MenuPopup aria-label={variant} container={box} data-variant={variant}>
                        {children}
                    </MenuPopup>
                )}
            </Menu>
        </div>
    );
}

function VariantsExample() {
    const [boxes, setBoxes] = useState<Record<string, HTMLElement | null>>({});
    const box = (name: string) => (el: HTMLElement | null) => {
        if (el && boxes[name] !== el) setBoxes((all) => ({ ...all, [name]: el }));
    };
    const cell = (name: string, content: ReactNode, props: MenuProps = {}) => (
        <div className="relative min-h-[22rem] w-[20rem]" ref={box(name)}>
            <StaticMenu variant={name} box={boxes[name] ?? null} {...props}>
                {content}
            </StaticMenu>
        </div>
    );
    return (
        <div className="flex flex-wrap gap-8">
            {cell(
                'Default',
                <>
                    <MenuItem href="#">Option 1</MenuItem>
                    <MenuItem href="#">Option 2</MenuItem>
                    <MenuItem href="#">Option 3</MenuItem>
                    <MenuItem href="#">Option 4</MenuItem>
                </>
            )}
            {cell(
                'States',
                <>
                    <MenuItem href="#">Option 1- Regular</MenuItem>
                    <MenuItem href="#">Option 2 - Hover</MenuItem>
                    <MenuItem href="#" active>
                        Option 3 - Active
                    </MenuItem>
                    <MenuItem href="#" selected>
                        Option 4 - Selected
                    </MenuItem>
                    <MenuItem href="#" selected>
                        Option 5 - Selected-Hover
                    </MenuItem>
                    <MenuItem href="#" disabled>
                        Option 6 - Disabled
                    </MenuItem>
                </>
            )}
            {cell(
                'Separated',
                <>
                    <MenuItem href="#">Option 1</MenuItem>
                    <MenuItem href="#" selected hasSeparator>
                        Option 2
                    </MenuItem>
                    <MenuItem href="#">Option 3</MenuItem>
                    <MenuItem href="#" hasSeparator>
                        Option 4
                    </MenuItem>
                    <MenuItem href="#">Option 5</MenuItem>
                </>
            )}
            {cell(
                'Icons',
                <>
                    <MenuItem href="#">
                        <MenuAddon glyph="grid" />
                        <MenuTitle>Option 1 - Regular</MenuTitle>
                        <MenuShortcut>Ctrl + A</MenuShortcut>
                        <MenuAddon glyph="wrench" />
                    </MenuItem>
                    <MenuItem href="#">
                        <MenuAddon glyph="accept" />
                        <MenuTitle>Option 2 - Hover</MenuTitle>
                        <MenuShortcut>Ctrl + A</MenuShortcut>
                        <MenuAddon glyph="history" />
                    </MenuItem>
                    <MenuItem href="#">
                        <MenuTitle>Option 3 - Selected</MenuTitle>
                        <MenuShortcut>Ctrl + A</MenuShortcut>
                        <MenuAddon glyph="lightbulb" />
                    </MenuItem>
                    <MenuItem href="#">
                        <MenuAddon glyph="cart" />
                        <MenuContent>
                            <MenuTitle>Menu List Item</MenuTitle>
                            <MenuSubtitle>Sub-menu List Item</MenuSubtitle>
                        </MenuContent>
                    </MenuItem>
                </>
            )}
            {cell(
                'Extended',
                <>
                    <MenuItem href="#" hasSeparator>
                        <MenuAddon glyph="sort" />
                        <MenuTitle>Sort</MenuTitle>
                    </MenuItem>
                    <MenuRadioGroup aria-label="View" defaultValue="1">
                        <MenuRadioItem value="1" render={<a href="#" />}>
                            View 1
                        </MenuRadioItem>
                        <MenuRadioItem value="2" render={<a href="#" />}>
                            View 2
                        </MenuRadioItem>
                        <MenuRadioItem value="3" render={<a href="#" />}>
                            View 3
                        </MenuRadioItem>
                    </MenuRadioGroup>
                    <MenuCheckboxItem defaultChecked render={<a href="#" />}>
                        Toggle Button (toggled)
                    </MenuCheckboxItem>
                    <MenuItem>
                        <MenuAddon glyph="filter" />
                        <MenuTitle>Filter</MenuTitle>
                        <MenuItemInput aria-label="Filter" placeholder="Field placeholder text" />
                    </MenuItem>
                </>
            )}
            {cell(
                'Submenu',
                <>
                    <MenuItem href="#">Option 1</MenuItem>
                    <MenuItem
                        submenu={
                            <>
                                <MenuItem href="#">Sub-option 1</MenuItem>
                                <MenuItem href="#">Sub-option 2 - Hover</MenuItem>
                                <MenuItem href="#" disabled>
                                    Sub-option 6 - Disabled
                                </MenuItem>
                            </>
                        }
                    >
                        <MenuTitle>Option 2 with submenu</MenuTitle>
                        <MenuAddon submenuIndicator />
                    </MenuItem>
                    <MenuItem href="#">Option 3</MenuItem>
                    <MenuItem href="#">Option 4</MenuItem>
                </>
            )}
        </div>
    );
}

export const Variants: Story = {
    name: 'Variants',
    tags: ['!autodocs'],
    parameters: {
        docs: {
            description: {
                story: 'Open menus rendered into boxes of the page (`container`), the visual reference cases.'
            }
        }
    },
    render: () => <VariantsExample />,
    play: async ({ canvasElement }) => {
        // the submenu of the last case, open
        const parent = await waitFor(() => {
            const el = canvasElement.querySelector<HTMLElement>('[data-variant="Submenu"] [aria-haspopup="menu"]');
            expect(el).not.toBeNull();
            return el!;
        });
        parent.focus();
        await userEvent.keyboard(getComputedStyle(parent).direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}');
        await waitFor(() => expect(parent.getAttribute('aria-expanded')).toBe('true'));
    }
};

function MobileVariantExample() {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <div ref={setBox} className="relative h-[30rem] w-[20rem]">
            {box && (
                <Menu
                    defaultOpen
                    mobile
                    focusAutoCapture={false}
                    mobileConfig={{
                        title: 'Example Submenu',
                        cancelButtonText: 'Cancel',
                        hasCloseButton: false,
                        dialogProps: { container: box, mobileOuterSpacing: true, 'data-variant': 'Mobile' } as object
                    }}
                >
                    <MenuTrigger aria-label="Mobile" className="sr-only-sap" />
                    <MenuPopup aria-label="example sub-menu options">
                        <MenuItem href="#">
                            <MenuAddon glyph="grid" />
                            <MenuTitle>Option 1</MenuTitle>
                            <MenuAddon glyph="wrench" />
                        </MenuItem>
                        <MenuItem href="#" submenu={<MenuItem>Sub-option 1</MenuItem>}>
                            <MenuAddon glyph="accept" />
                            <MenuTitle>Option 2</MenuTitle>
                            <MenuAddon submenuIndicator />
                        </MenuItem>
                        <MenuItem href="#">
                            <MenuTitle>Option 3</MenuTitle>
                            <MenuAddon glyph="lightbulb" />
                        </MenuItem>
                        <MenuItem href="#">
                            <MenuAddon glyph="grid" />
                            <MenuTitle>Option 4</MenuTitle>
                            <MenuShortcut hideOnMobile={false}>Ctrl+Alt+L</MenuShortcut>
                        </MenuItem>
                    </MenuPopup>
                </Menu>
            )}
        </div>
    );
}

export const MobileVariant: Story = {
    name: 'Mobile variant',
    tags: ['!autodocs'],
    parameters: {
        docs: {
            description: { story: 'An open mobile menu rendered into a box of the page, a visual reference case.' }
        }
    },
    render: () => <MobileVariantExample />
};

/* ------------------------------------------------------------------------------------------------------------------
 * Open stories
 * ---------------------------------------------------------------------------------------------------------------- */

/** Clicks a trigger and waits for its menu to open. */
async function openMenu(trigger: HTMLElement): Promise<void> {
    await userEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));
    await waitFor(() => expect(document.querySelector('[role=menuitem]')).not.toBeNull());
    // keys sent before the menu has moved the focus to its first item would be lost
    await waitFor(() => expect(document.activeElement?.closest('[role=menu]')).not.toBeNull());
}
const triggers = (root: ParentNode) => [...root.querySelectorAll<HTMLElement>('[aria-haspopup=menu]')];

export const OpenBasic: Story = {
    name: 'Open: menu',
    tags: ['!autodocs'],
    render: Basic.render,
    play: ({ canvasElement }) => openMenu(triggers(canvasElement)[0]!)
};
export const OpenIcons: Story = {
    name: 'Open: icons',
    tags: ['!autodocs'],
    render: Addons.render,
    play: ({ canvasElement }) => openMenu(triggers(canvasElement)[0]!)
};
export const OpenShortcuts: Story = {
    name: 'Open: shortcuts',
    tags: ['!autodocs'],
    render: Addons.render,
    play: ({ canvasElement }) => openMenu(triggers(canvasElement)[1]!)
};
export const OpenSubmenus: Story = {
    name: 'Open: submenus',
    tags: ['!autodocs'],
    render: Submenus.render,
    play: async ({ canvasElement }) => {
        await openMenu(triggers(canvasElement)[0]!);
        // Milk products › Cheese; the arrow that opens a submenu points to the reading direction
        const forward = getComputedStyle(canvasElement).direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}';
        await userEvent.keyboard(`{ArrowDown}{ArrowDown}${forward}`);
        await waitFor(() => expect(document.activeElement?.textContent).toContain('Cheese'));
        await userEvent.keyboard(forward);
        await waitFor(() => expect(document.activeElement?.textContent).toBe('Parmesan'));
    }
};
export const OpenExtended: Story = {
    name: 'Open: extended items',
    tags: ['!autodocs'],
    render: Extended.render,
    play: ({ canvasElement }) => openMenu(triggers(canvasElement)[0]!)
};
export const OpenMobile: Story = {
    name: 'Open: mobile',
    tags: ['!autodocs'],
    render: Mobile.render,
    play: async ({ canvasElement }) => {
        const trigger = triggers(canvasElement)[0]!;
        await userEvent.click(trigger);
        await waitFor(() => expect(document.querySelector('[role=dialog] [role=menuitem]')).not.toBeNull());
    }
};
export const OpenMobileSubmenu: Story = {
    name: 'Open: mobile submenu',
    tags: ['!autodocs'],
    render: Mobile.render,
    play: async ({ canvasElement }) => {
        const trigger = triggers(canvasElement)[0]!;
        await userEvent.click(trigger);
        await waitFor(() => expect(document.activeElement?.textContent).toBe('Fruits'));
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement?.textContent).toBe('Pineapple'));
    }
};
export const OpenScrollbar: Story = {
    name: 'Open: scrollbar',
    tags: ['!autodocs'],
    render: Scrollbar.render,
    play: ({ canvasElement }) => openMenu(triggers(canvasElement)[0]!)
};
export const OpenPlacement: Story = {
    name: 'Open: placement',
    tags: ['!autodocs'],
    render: PlacementAndTriggers.render,
    play: ({ canvasElement }) => openMenu(canvasElement.querySelector<HTMLElement>('#menu-placement-trigger')!)
};
