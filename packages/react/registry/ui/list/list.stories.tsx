import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useMemo, useRef, useState, type ComponentType, type ReactNode, type UIEvent } from 'react';
import { BusyIndicator } from '@/ui/busy-indicator/busy-indicator';
import { Button } from '@/ui/button/button';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { Avatar } from '@/ui/avatar/avatar';
import { Icon } from '@/ui/icon/icon';
import { Input } from '@/ui/input/input';
import { Radio, RadioGroup } from '@/ui/radio/radio';
import { Skeleton } from '@/ui/skeleton/skeleton';
import { Title } from '@/ui/title/title';
import {
    List,
    ListByline,
    ListBylineLeft,
    ListBylineRight,
    ListContent,
    ListFooter,
    ListGroupHeader,
    ListIcon,
    ListItem,
    ListLink,
    ListMessage,
    ListSecondary,
    ListSubline,
    ListThumbnail,
    ListTitle,
    ListTitleText,
    type ListActions,
    type ListProps
} from './list';

const meta = {
    title: 'Components/List',
    component: List,
    subcomponents: {
        ListItem,
        ListTitle,
        ListTitleText,
        ListSecondary,
        ListIcon,
        ListLink,
        ListGroupHeader,
        ListFooter,
        ListMessage,
        ListContent,
        ListByline,
        ListBylineLeft,
        ListBylineRight,
        ListThumbnail,
        ListSubline
    } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            description: {
                component:
                    'Lists show items with titles, secondary text, icons, bylines, links and selection controls. One ' +
                    'entry is in the tab order; Arrow keys, Home, End, Page Up and Page Down move between items and ' +
                    'group headers. Compact density comes from `data-density="compact"` on the list or an ancestor.'
            }
        }
    },
    args: {
        byline: false,
        noBorder: false,
        wrap: false,
        keyboardSupport: true
    },
    render: (args) => (
        <List aria-label="Playground" {...args}>
            <ListItem>
                <ListIcon glyph="accept" />
                <ListTitle>List item 1</ListTitle>
                <ListSecondary>Secondary</ListSecondary>
            </ListItem>
            <ListItem interactive>
                <ListTitle>List item 2 (interactive)</ListTitle>
            </ListItem>
            <ListItem>
                <ListTitle>
                    List item 3 with a long title that is truncated unless the list wraps its texts, so that it can be
                    read in full
                </ListTitle>
            </ListItem>
        </List>
    )
} satisfies Meta<ListProps>;
export default meta;
type Story = StoryObj<typeof meta>;

const heading = 'm-0 mb-2 font-sap-font-header-family text-sap-font-header6-size text-sap-title-color';
const note = 'm-0 mt-2 text-sap-font-small-size text-sap-content-label-color';
const stack = 'flex flex-col gap-8';

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section>
            <h3 className={heading}>{title}</h3>
            {children}
        </section>
    );
}

/** fundamental-react's `header` and `footer`: a heading that names the list and a footer after it. */
function HeaderFooterList({ header, footer, children, ...props }: ListProps & { header: string; footer?: ReactNode }) {
    const id = useId();
    return (
        <div>
            <Title level={4} id={id} className="m-0 mb-2">
                {header}
            </Title>
            <List aria-labelledby={id} {...props}>
                {children}
            </List>
            {footer && <ListFooter render={<div />}>{footer}</ListFooter>}
        </div>
    );
}

const FRUITS = ['Apple', 'Banana', 'Durian', 'Grape'];
const fruitItems = FRUITS.map((fruit) => (
    <ListItem key={fruit}>
        <ListTitle>{fruit}</ListTitle>
    </ListItem>
));

const LONG_TEXT =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ut laoreet lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean sagittis aliquam justo et suscipit.';

export const Playground: Story = {};

export const Default: Story = {
    name: 'Standard, secondary text and icons',
    render: () => (
        <div className={stack}>
            <Section title="Standard (with unread items)">
                <List aria-label="Standard list">
                    <ListItem>
                        <ListTitle>List item 1</ListTitle>
                    </ListItem>
                    <ListItem>
                        <ListTitle>List item 2</ListTitle>
                    </ListItem>
                    <ListItem unread>
                        <ListTitle>Unread list item 3</ListTitle>
                    </ListItem>
                    <ListItem unread>
                        <ListTitle>Unread list item 4</ListTitle>
                    </ListItem>
                </List>
            </Section>
            <Section title="Compact">
                <List data-density="compact" aria-label="Compact list">
                    {[1, 2, 3, 4].map((i) => (
                        <ListItem key={i}>
                            <ListTitle>List item {i}</ListTitle>
                        </ListItem>
                    ))}
                </List>
            </Section>
            <Section title="Secondary text and counters">
                <List aria-label="Secondary text">
                    <ListItem>
                        <ListTitle>Neutral</ListTitle>
                        <ListSecondary>Neutral Status</ListSecondary>
                    </ListItem>
                    <ListItem>
                        <ListTitle>Positive</ListTitle>
                        <ListSecondary type="positive">Positive Status</ListSecondary>
                    </ListItem>
                    <ListItem>
                        <ListTitle>Critical</ListTitle>
                        <ListSecondary type="critical">Critical Status</ListSecondary>
                    </ListItem>
                    <ListItem>
                        <ListTitle>Negative</ListTitle>
                        <ListSecondary type="negative">Negative Status</ListSecondary>
                    </ListItem>
                    <ListItem>
                        <ListTitle>Informative</ListTitle>
                        <ListSecondary type="informative">Informative Status</ListSecondary>
                    </ListItem>
                    <ListItem counter={12345}>
                        <ListTitle>With counter</ListTitle>
                    </ListItem>
                    <ListItem counter={1234.5}>
                        <ListTitle>With a decimal counter</ListTitle>
                    </ListItem>
                </List>
            </Section>
            <Section title="Icons">
                <List aria-label="Icons">
                    <ListItem>
                        <ListIcon glyph="cart" />
                        <ListTitle>Icon before</ListTitle>
                    </ListItem>
                    <ListItem>
                        <ListTitle>Icon after</ListTitle>
                        <ListIcon glyph="lightbulb" />
                    </ListItem>
                    <ListItem>
                        <ListIcon glyph="history" />
                        <ListTitle>Icon and secondary</ListTitle>
                        <ListSecondary>Secondary</ListSecondary>
                    </ListItem>
                </List>
            </Section>
            <Section title="Borderless">
                <List noBorder aria-label="Borderless">
                    <ListItem>
                        <ListTitle>List item 1</ListTitle>
                    </ListItem>
                    <ListItem selected>
                        <ListTitle>List item 2 (selected)</ListTitle>
                    </ListItem>
                    <ListItem>
                        <ListTitle>List item 3</ListTitle>
                    </ListItem>
                </List>
            </Section>
            <Section title="Wrapping text">
                <List aria-label="Wrapping">
                    <ListItem>
                        <ListTitle wrap>
                            A very long title that wraps onto several lines instead of being truncated with an ellipsis
                            at the end of the item. {LONG_TEXT}
                        </ListTitle>
                        <ListSecondary>Secondary</ListSecondary>
                    </ListItem>
                    <ListItem>
                        <ListTitle>
                            A very long title that is truncated with an ellipsis at the end of the list item.{' '}
                            {LONG_TEXT}
                        </ListTitle>
                    </ListItem>
                </List>
            </Section>
        </div>
    )
};

/** A group header, items, a growing "Show more" item that loads two more, and a footer. */
function GrowingList() {
    const [items, setItems] = useState([1, 2, 3]);
    const [loading, setLoading] = useState(false);
    const more = () => {
        setLoading(true);
        setTimeout(() => {
            setItems((list) => [...list, list.length + 1, list.length + 2]);
            setLoading(false);
        }, 600);
    };
    return (
        <List aria-label="Grouped">
            <ListGroupHeader>
                <ListTitle>Group header 1</ListTitle>
            </ListGroupHeader>
            {items.map((i) => (
                <ListItem key={i}>
                    <ListTitle>List item {i}</ListTitle>
                </ListItem>
            ))}
            <ListItem action growing>
                <ListTitle render={<button type="button" />} onClick={more}>
                    <BusyIndicator loading={loading} size="s" aria-label="Loading" />
                    <ListTitleText>Show more</ListTitleText>
                </ListTitle>
            </ListItem>
            <ListFooter>Footer text</ListFooter>
        </List>
    );
}

export const Interactive: Story = {
    name: 'Interactive, groups, actions and footer',
    render: () => (
        <div className={stack}>
            <Section title="Interactive (click or Enter toggles selection)">
                <List aria-label="Interactive">
                    <ListItem interactive>
                        <ListTitle>Regular State</ListTitle>
                    </ListItem>
                    <ListItem interactive defaultSelected>
                        <ListTitle>Selected State</ListTitle>
                    </ListItem>
                    <ListItem interactive>
                        <ListTitle>List item 3</ListTitle>
                        <ListSecondary>Secondary</ListSecondary>
                    </ListItem>
                    <ListItem interactive inactive>
                        <ListTitle>Inactive item</ListTitle>
                    </ListItem>
                </List>
            </Section>
            <Section title="Group header, growing item and footer">
                <GrowingList />
            </Section>
            <Section title="Action items">
                <List aria-label="Actions">
                    <ListItem>
                        <ListTitle>Regular item</ListTitle>
                    </ListItem>
                    <ListItem action>
                        <ListTitle render={<button type="button" />}>Action</ListTitle>
                    </ListItem>
                    <ListItem action>
                        <ListTitle render={<button type="button" />}>Save</ListTitle>
                    </ListItem>
                </List>
            </Section>
            <Section title="Buttons in items">
                <List aria-label="Buttons">
                    <ListItem>
                        <ListTitle>Edit or delete</ListTitle>
                        <Button variant="transparent" glyph="edit" aria-label="Edit" />
                        <Button variant="transparent" glyph="delete" aria-label="Delete" />
                    </ListItem>
                    <ListItem>
                        <ListTitle>Message</ListTitle>
                        <ListSecondary>Info</ListSecondary>
                        <Button variant="transparent" glyph="decline" aria-label="Remove" />
                    </ListItem>
                </List>
            </Section>
            <Section title="Message">
                <List hasMessage aria-label="With message">
                    <ListMessage type="error">Error message</ListMessage>
                    <ListItem>
                        <ListTitle>List item 1</ListTitle>
                    </ListItem>
                    <ListItem>
                        <ListTitle>List item 2</ListTitle>
                    </ListItem>
                </List>
            </Section>
        </div>
    )
};

interface Selectable {
    label: string;
    selected: boolean;
}

/** A multi-selection list of checkboxes whose models live in state. */
function MultiSelection({
    label,
    initial,
    disabled = false,
    compact = false
}: {
    label: string;
    initial: boolean[];
    disabled?: boolean;
    compact?: boolean;
}) {
    const [items, setItems] = useState<Selectable[]>(() =>
        initial.map((selected, i) => ({ label: `List item ${i + 1}`, selected }))
    );
    return (
        <List selection aria-multiselectable="true" aria-label={label} data-density={compact ? 'compact' : undefined}>
            {items.map((item, i) => (
                <ListItem key={item.label} aria-disabled={disabled || undefined}>
                    <Checkbox
                        aria-label={item.label}
                        disabled={disabled}
                        checked={item.selected}
                        onCheckedChange={(checked) =>
                            setItems((all) => all.map((m, j) => (j === i ? { ...m, selected: checked } : m)))
                        }
                    />
                    <ListTitle>{item.label}</ListTitle>
                </ListItem>
            ))}
        </List>
    );
}

/** A single-selection list of radio buttons: the radio group around the list owns the value. */
function SingleSelection({ label, initial, compact = false }: { label: string; initial: string; compact?: boolean }) {
    const [value, setValue] = useState(initial);
    return (
        <div>
            {/* the list is the listbox; the group only holds the value, so it has no role of its own */}
            <RadioGroup value={value} onValueChange={setValue} role="none">
                <List selection aria-label={label} data-density={compact ? 'compact' : undefined}>
                    {['radio1', 'radio2', 'radio3'].map((v) => (
                        <ListItem key={v}>
                            <Radio value={v} aria-label={v} />
                            <ListTitle>{v}</ListTitle>
                        </ListItem>
                    ))}
                </List>
            </RadioGroup>
            <p className={note}>Selected: {value}</p>
        </div>
    );
}

export const Selection: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Items with a `Checkbox` or `Radio` are options of a listbox: a click, Space or Enter on the item ' +
                    'changes its control, which is only visual (inert). Radio lists sit in a `RadioGroup` that owns the value.'
            }
        }
    },
    render: () => (
        <div className={stack}>
            <Section title="Multi selection">
                <MultiSelection label="Multi selection" initial={[true, false, false]} />
            </Section>
            <Section title="Multi selection with disabled checkboxes">
                <MultiSelection label="Multi selection, disabled" initial={[true, false, true]} disabled />
            </Section>
            <Section title="Multi selection (compact)">
                <MultiSelection label="Compact multi selection" initial={[false, true, false]} compact />
            </Section>
            <Section title="Single selection">
                <SingleSelection label="Single selection" initial="radio2" />
            </Section>
            <Section title="Single selection (compact)">
                <SingleSelection label="Compact single selection" initial="radio1" compact />
            </Section>
        </div>
    )
};

export const Navigation: Story = {
    name: 'Navigation (links)',
    render: () => (
        <div className={stack}>
            <Section title="Links">
                <List aria-label="Navigation">
                    <ListItem>
                        <ListLink href="#">
                            <ListTitle>List item 1</ListTitle>
                        </ListLink>
                    </ListItem>
                    <ListItem>
                        <ListLink href="#" navigated>
                            <ListIcon glyph="history" />
                            <ListTitle>List item 2</ListTitle>
                        </ListLink>
                    </ListItem>
                    <ListItem selected>
                        <ListLink href="#">
                            <ListTitle>List item 3</ListTitle>
                            <ListIcon glyph="map" />
                        </ListLink>
                    </ListItem>
                    <ListItem counter={42}>
                        <ListLink href="#">
                            <ListIcon glyph="cart" />
                            <ListTitle>List item 4 with counter</ListTitle>
                        </ListLink>
                    </ListItem>
                </List>
            </Section>
            <Section title="Navigation indicator">
                <List navigationIndicator aria-label="Navigation indicator">
                    <ListItem>
                        <ListLink href="#" navigationIndicator>
                            <ListTitle>List item 1</ListTitle>
                        </ListLink>
                    </ListItem>
                    <ListItem>
                        <ListLink href="#" navigationIndicator>
                            <ListTitle>List item 2</ListTitle>
                            <ListSecondary>Secondary</ListSecondary>
                        </ListLink>
                    </ListItem>
                    <ListItem>
                        <ListLink href="#" navigationIndicator navigated>
                            <ListTitle>List item 3 (navigated)</ListTitle>
                        </ListLink>
                    </ListItem>
                    <ListItem>
                        <ListLink href="#">
                            <ListTitle>Without indicator</ListTitle>
                        </ListLink>
                    </ListItem>
                </List>
            </Section>
        </div>
    )
};

export const Byline: Story = {
    name: 'Byline and subline',
    render: () => (
        <div className={stack}>
            <Section title="Byline">
                <List byline aria-label="Byline">
                    <ListItem>
                        <ListThumbnail>
                            <Icon glyph="activate" />
                        </ListThumbnail>
                        <ListContent>
                            <ListTitle render={<div />}>List Item Title</ListTitle>
                            <ListByline>Byline (description)</ListByline>
                        </ListContent>
                    </ListItem>
                    <ListItem>
                        <ListThumbnail>
                            <Icon glyph="employee" />
                        </ListThumbnail>
                        <ListContent>
                            <ListTitle render={<div />}>Two-column byline</ListTitle>
                            <ListByline twoCol>
                                <ListBylineLeft>First text item in byline (standard text)</ListBylineLeft>
                                <ListBylineRight status="positive">Available</ListBylineRight>
                            </ListByline>
                        </ListContent>
                    </ListItem>
                    <ListItem unread>
                        <ListContent>
                            <ListTitle render={<div />}>Unread item</ListTitle>
                            <ListByline twoCol>
                                <ListBylineLeft>Byline</ListBylineLeft>
                                <ListBylineRight status="negative">Overdue</ListBylineRight>
                            </ListByline>
                        </ListContent>
                    </ListItem>
                </List>
            </Section>
            <Section title="Byline navigation">
                <List byline navigationIndicator aria-label="Byline navigation">
                    {['Notebook Basic 15', 'Notebook Basic 17'].map((title, i) => (
                        <ListItem key={title}>
                            <ListLink href="#" navigationIndicator>
                                <ListThumbnail>
                                    <Icon glyph="product" />
                                </ListThumbnail>
                                <ListContent>
                                    <ListTitle render={<div />}>{title}</ListTitle>
                                    <ListByline>HT-100{i}</ListByline>
                                </ListContent>
                            </ListLink>
                        </ListItem>
                    ))}
                </List>
            </Section>
            <Section title="Subline">
                <List subline aria-label="Subline">
                    {[
                        ['Jane Doe', 'Software Developer', 'employee'],
                        ['Max Mustermann', 'Product Owner', 'customer']
                    ].map(([name, role, glyph]) => (
                        <ListItem key={name} interactive>
                            <Avatar size="s" circle glyph={glyph!} aria-label={name} />
                            <ListContent>
                                <ListTitle render={<div />}>{name}</ListTitle>
                                <ListSubline>{role}</ListSubline>
                            </ListContent>
                        </ListItem>
                    ))}
                    <ListItem interactive active>
                        <Avatar size="s" circle glyph="manager" aria-label="Current user" />
                        <ListContent>
                            <ListTitle render={<div />}>Current user</ListTitle>
                            <ListSubline>Team lead</ListSubline>
                            <ListSubline wrap>{LONG_TEXT}</ListSubline>
                        </ListContent>
                    </ListItem>
                </List>
            </Section>
        </div>
    )
};

const FILTER_FRUITS = ['Apple', 'Banana', 'Orange', 'Pineapple', 'Strawberry'];

function FilterSortList() {
    const [term, setTerm] = useState('');
    const [ascending, setAscending] = useState(true);
    const [items, setItems] = useState(FILTER_FRUITS);
    const shown = useMemo(() => {
        const lower = term.toLocaleLowerCase();
        const sign = ascending ? 1 : -1;
        return items
            .filter((item) => item.toLocaleLowerCase().includes(lower))
            .sort((a, b) => a.localeCompare(b) * sign);
    }, [term, ascending, items]);
    return (
        <div className="max-w-xl">
            <div role="toolbar" aria-label="Filter and sort" className="mb-2 flex items-center gap-2">
                <label
                    htmlFor="list-filter-search"
                    className="me-auto font-sap-font-family text-sap-font-size text-sap-content-label-color"
                >
                    Filter for list elements
                </label>
                <Input
                    id="list-filter-search"
                    placeholder="Search"
                    className="w-48"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                />
                <Button
                    glyph="sort-ascending"
                    aria-label="Sort ascending"
                    title="Sort ascending"
                    onClick={() => setAscending(true)}
                />
                <Button
                    glyph="sort-descending"
                    aria-label="Sort descending"
                    title="Sort descending"
                    onClick={() => setAscending(false)}
                />
            </div>
            <List aria-label="Fruits">
                {shown.length ? (
                    shown.map((item) => (
                        <ListItem key={item}>
                            <ListTitle>{item}</ListTitle>
                            <Button
                                variant="transparent"
                                glyph="delete"
                                aria-label={`Remove ${item}`}
                                title="Remove"
                                onClick={() => setItems((all) => all.filter((i) => i !== item))}
                            />
                        </ListItem>
                    ))
                ) : (
                    <ListItem noData>
                        <ListTitle>No results found!</ListTitle>
                    </ListItem>
                )}
            </List>
            <p className={note} aria-live="polite">
                Sorted {ascending ? 'ascending' : 'descending'}
            </p>
        </div>
    );
}

export const FilterSort: Story = {
    name: 'Filter and sort',
    render: () => <FilterSortList />
};

const COMPLEX_GLYPHS = ['cart', 'wrench', 'lightbulb', 'history'];

export const Complex: Story = {
    name: 'Complex (borderless, groups and footer)',
    render: () => (
        <List noBorder aria-label="Complex list" className="max-w-xl">
            {[1, 2].map((group) => [
                <ListGroupHeader key={`g${group}`}>
                    <ListTitle>Group header {group}</ListTitle>
                </ListGroupHeader>,
                ...COMPLEX_GLYPHS.map((glyph, i) => (
                    <ListItem key={`${group}-${glyph}`}>
                        <ListIcon glyph={glyph} />
                        <ListTitle>List item {(group - 1) * 4 + i + 1}</ListTitle>
                    </ListItem>
                ))
            ])}
            <ListFooter>Footer text</ListFooter>
        </List>
    )
};

function KeyboardList() {
    const actions = useRef<ListActions>(null);
    const before = useRef<HTMLButtonElement>(null);
    const [message, setMessage] = useState(
        'Arrow Up on the first item focuses the button; the button focuses the first item.'
    );
    return (
        <div className="flex max-w-md flex-col items-start gap-4">
            <Button
                ref={before}
                label="Focused when the focus leaves the list upwards"
                onClick={() => actions.current?.setItemActive(0)}
            />
            <List
                aria-label="Keyboard support"
                actionsRef={actions}
                onFocusEscapeList={(direction) =>
                    direction === 'up' ? before.current?.focus() : setMessage('End of list reached')
                }
            >
                {[1, 2, 3, 4].map((i) => (
                    <ListItem key={i}>
                        <ListTitle>List item {i}</ListTitle>
                    </ListItem>
                ))}
            </List>
            <p className={note} aria-live="polite">
                {message}
            </p>
        </div>
    );
}

export const KeyboardSupport: Story = {
    name: 'Keyboard support',
    render: () => <KeyboardList />
};

function InfiniteList() {
    const [items, setItems] = useState<string[]>(() => Array.from({ length: 10 }, () => 'Initially shown item'));
    const [loading, setLoading] = useState(false);
    const onScroll = (event: UIEvent<HTMLElement>) => {
        const el = event.currentTarget;
        if (loading || el.scrollHeight - el.scrollTop - el.clientHeight > 40) return;
        setLoading(true);
        setTimeout(() => {
            setItems((all) => [...all, ...Array.from({ length: 5 }, (_, i) => `Element ${all.length + i}`)]);
            setLoading(false);
        }, 1000);
    };
    return (
        <BusyIndicator loading={loading} size="l" block aria-label="Loading" className="max-w-md">
            <List
                aria-label="Infinite scroll"
                className="scrollbar-sap block max-h-[15.625rem] overflow-y-scroll"
                onScroll={onScroll}
            >
                {items.map((item, i) => (
                    <ListItem key={i}>
                        <ListTitle>{item}</ListTitle>
                    </ListItem>
                ))}
            </List>
        </BusyIndicator>
    );
}

export const InfiniteScroll: Story = {
    name: 'Infinite scroll',
    parameters: {
        docs: { description: { story: 'Scrolling to the end of the list loads five more items.' } }
    },
    render: () => <InfiniteList />
};

function LoadingList() {
    const [loading, setLoading] = useState(true);
    return (
        <div>
            <Button
                className="mb-4"
                label={loading ? 'Show items' : 'Show loading'}
                onClick={() => setLoading(!loading)}
            />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <List aria-label="Loading list" aria-busy={loading || undefined}>
                    {[1, 2, 3].map((i) => (
                        <ListItem key={i}>
                            {loading ? (
                                <Skeleton type="text" width="40%" textLines={1} className="my-auto" />
                            ) : (
                                <ListTitle>List item {i}</ListTitle>
                            )}
                        </ListItem>
                    ))}
                </List>
                <List byline aria-label="Loading byline list" aria-busy={loading || undefined}>
                    {[1, 2, 3].map((i) => (
                        <ListItem key={i}>
                            {loading ? (
                                <Skeleton width="100%" height="48px" className="my-auto">
                                    <rect x="0" y="0" width="48" height="48" rx="4" />
                                    <rect x="60" y="0" width="40%" height="12" rx="4" />
                                    <rect x="60" y="20" width="30%" height="8" rx="4" />
                                </Skeleton>
                            ) : (
                                <>
                                    <ListThumbnail>
                                        <Icon glyph="activate" />
                                    </ListThumbnail>
                                    <ListContent>
                                        <ListTitle render={<div />}>Title {i}</ListTitle>
                                        <ListByline>Byline text</ListByline>
                                    </ListContent>
                                </>
                            )}
                        </ListItem>
                    ))}
                </List>
            </div>
        </div>
    );
}

export const Loading: Story = {
    parameters: {
        docs: {
            description: {
                story: 'While loading, skeletons shaped like the items stand in for them and the lists are `aria-busy`.'
            }
        }
    },
    render: () => <LoadingList />
};

export const BylineBorderless: Story = {
    name: 'Byline: borderless',
    render: () => (
        <List byline noBorder aria-label="Borderless byline" className="max-w-xl">
            <ListItem>
                <ListThumbnail>
                    <Icon glyph="activate" />
                </ListThumbnail>
                <ListContent>
                    <ListTitle render={<div />}>Title</ListTitle>
                    <ListByline>Byline Text</ListByline>
                </ListContent>
            </ListItem>
            <ListItem>
                <ListThumbnail>
                    <Icon glyph="employee" />
                </ListThumbnail>
                <ListContent>
                    <ListTitle render={<div />}>List item with no byline</ListTitle>
                </ListContent>
            </ListItem>
            <ListItem>
                <ListThumbnail>
                    <Icon glyph="calendar" />
                </ListThumbnail>
                <ListContent>
                    <ListTitle render={<div />}>List Item With Two-Column Byline</ListTitle>
                    <ListByline twoCol>
                        <ListBylineLeft>First text item in Byline (Standard text item)</ListBylineLeft>
                        <ListBylineRight>Second text item in Byline (Can be semantic (Status) or not)</ListBylineRight>
                    </ListByline>
                </ListContent>
            </ListItem>
        </List>
    )
};

const BYLINE_ITEMS = [
    { title: 'Title 1', byline: 'Byline 1', glyph: 'calendar' },
    { title: 'Title 2', byline: 'Byline 2', glyph: 'activate' },
    { title: 'Title 3', byline: 'Byline 3', glyph: 'employee' }
];

function BylineSelectionLists() {
    const [checked, setChecked] = useState([false, true, false]);
    const [single, setSingle] = useState('radio1');
    const content = (item: (typeof BYLINE_ITEMS)[number]) => (
        <>
            <ListThumbnail>
                <Icon glyph={item.glyph} />
            </ListThumbnail>
            <ListContent>
                <ListTitle render={<div />}>{item.title}</ListTitle>
                <ListByline>{item.byline}</ListByline>
            </ListContent>
        </>
    );
    return (
        <div className={stack}>
            <Section title="With checkboxes">
                <List byline selection aria-multiselectable="true" aria-label="Byline with checkboxes">
                    {BYLINE_ITEMS.map((item, i) => (
                        <ListItem key={item.title}>
                            <Checkbox
                                aria-label={item.title}
                                checked={checked[i]}
                                onCheckedChange={(value) =>
                                    setChecked((all) => all.map((c, j) => (j === i ? value : c)))
                                }
                            />
                            {content(item)}
                        </ListItem>
                    ))}
                </List>
            </Section>
            <Section title="With radio buttons">
                <RadioGroup value={single} onValueChange={setSingle} role="none">
                    <List byline selection aria-label="Byline with radio buttons">
                        {BYLINE_ITEMS.map((item, i) => (
                            <ListItem key={item.title}>
                                <Radio value={`radio${i + 1}`} aria-label={item.title} />
                                {content(item)}
                            </ListItem>
                        ))}
                    </List>
                </RadioGroup>
            </Section>
        </div>
    );
}

export const BylineSelection: Story = {
    name: 'Byline: selection',
    render: () => <BylineSelectionLists />
};

export const BylineButtons: Story = {
    name: 'Byline: buttons and counter',
    render: () => (
        <List byline aria-label="Byline with buttons" className="max-w-xl">
            <ListItem>
                <ListThumbnail>
                    <Icon glyph="activate" />
                </ListThumbnail>
                <ListContent>
                    <ListTitle render={<div />}>Title</ListTitle>
                    <ListByline>Byline Text</ListByline>
                </ListContent>
                <Button variant="transparent" glyph="edit" aria-label="Edit" title="Edit" />
                <Button variant="transparent" glyph="decline" aria-label="Decline" title="Decline" />
            </ListItem>
            <ListItem counter={132441}>
                <ListThumbnail>
                    <Icon glyph="activate" />
                </ListThumbnail>
                <ListContent>
                    <ListTitle render={<div />}>Byline list with counter</ListTitle>
                    <ListByline>Byline Text</ListByline>
                </ListContent>
            </ListItem>
        </List>
    )
};

export const BylineWrap: Story = {
    name: 'Byline: wrap',
    render: () => (
        <List byline aria-label="Wrapping byline" className="max-w-xl">
            <ListItem>
                <ListThumbnail>
                    <Icon glyph="activate" />
                </ListThumbnail>
                <ListContent>
                    <ListTitle render={<div />} wrap>
                        Long Title - {LONG_TEXT}
                    </ListTitle>
                    <ListByline wrap>Long byline text - {LONG_TEXT}</ListByline>
                </ListContent>
            </ListItem>
            <ListItem>
                <ListThumbnail>
                    <Icon glyph="activate" />
                </ListThumbnail>
                <ListContent>
                    <ListTitle render={<div />} wrap>
                        Long Title - {LONG_TEXT}
                    </ListTitle>
                    <ListByline twoCol>
                        <ListBylineLeft wrap>Long First Column - {LONG_TEXT}</ListBylineLeft>
                        <ListBylineRight wrap>Long Second Column - {LONG_TEXT}</ListBylineRight>
                    </ListByline>
                </ListContent>
            </ListItem>
        </List>
    )
};

export const BylineInteractive: Story = {
    name: 'Byline: interactive',
    render: () => (
        <List byline aria-label="Interactive byline" className="max-w-xl">
            {[
                ['activate', 'Title', false],
                ['employee', 'Title', false],
                ['calendar', 'Title (selected)', true],
                ['activate', 'Title (selected)', true]
            ].map(([glyph, title, selected], i) => (
                <ListItem key={i} interactive defaultSelected={selected as boolean}>
                    <ListThumbnail>
                        <Icon glyph={glyph as string} />
                    </ListThumbnail>
                    <ListContent>
                        <ListTitle render={<div />}>{title}</ListTitle>
                        <ListByline>Byline Text</ListByline>
                    </ListContent>
                </ListItem>
            ))}
        </List>
    )
};

export const BylineUnread: Story = {
    name: 'Byline: unread',
    render: () => (
        <List byline unreadIndicator aria-label="Unread byline" className="max-w-xl">
            <ListItem unread aria-description="unread">
                <ListThumbnail>
                    <Icon glyph="activate" />
                </ListThumbnail>
                <ListContent>
                    <ListTitle render={<div />}>Title</ListTitle>
                    <ListByline>Byline Text</ListByline>
                </ListContent>
            </ListItem>
            <ListItem>
                <ListThumbnail>
                    <Icon glyph="employee" />
                </ListThumbnail>
                <ListContent>
                    <ListTitle render={<div />}>List item with no byline</ListTitle>
                </ListContent>
            </ListItem>
            <ListItem unread aria-description="unread">
                <ListThumbnail>
                    <Icon glyph="calendar" />
                </ListThumbnail>
                <ListContent>
                    <ListTitle render={<div />}>List Item With Two-Column Byline</ListTitle>
                    <ListByline twoCol>
                        <ListBylineLeft>First text item in Byline (Standard text item)</ListBylineLeft>
                        <ListBylineRight>Second text item in Byline (Can be semantic (Status) or not)</ListBylineRight>
                    </ListByline>
                </ListContent>
            </ListItem>
            <ListItem>
                <ListContent>
                    <ListTitle render={<div />}>Text-Only List Item</ListTitle>
                    <ListByline>Byline Text (description)</ListByline>
                </ListContent>
            </ListItem>
        </List>
    )
};

/* fundamental-react's stories */

export const Simple: Story = {
    name: 'Simple list',
    render: () => <List aria-label="Fruits">{fruitItems}</List>
};

export const HeaderFooter: Story = {
    name: 'With header and footer',
    parameters: {
        docs: {
            description: {
                story:
                    "fundamental-react's `header` and `footer`: a heading that names the list (`aria-labelledby`) and " +
                    'a `ListFooter` rendered as a `<div>` after it.'
            }
        }
    },
    render: () => (
        <HeaderFooterList header="Fruits" footer="Updated 3 minutes ago">
            {fruitItems}
        </HeaderFooterList>
    )
};

export const NoBorder: Story = {
    name: 'With no borders',
    render: () => (
        <HeaderFooterList header="Fruits" footer="Updated 3 minutes ago" noBorder>
            {fruitItems}
        </HeaderFooterList>
    )
};

export const Compact: Story = {
    render: () => (
        <div data-density="compact">
            <HeaderFooterList header="Fruits" footer="Updated 3 minutes ago">
                {fruitItems}
            </HeaderFooterList>
        </div>
    )
};

const SETTINGS = [
    ['cart', 'Checkout Cart'],
    ['wrench', 'Profile Settings'],
    ['lightbulb', 'Information'],
    ['history', 'Order History']
];

export const IconsLeft: Story = {
    name: 'Icons left',
    render: () => (
        <HeaderFooterList header="Settings">
            {SETTINGS.map(([glyph, text]) => (
                <ListItem key={text}>
                    <ListIcon glyph={glyph} />
                    <ListTitle>{text}</ListTitle>
                </ListItem>
            ))}
        </HeaderFooterList>
    )
};

export const IconsRight: Story = {
    name: 'Icons right',
    render: () => (
        <HeaderFooterList header="Settings">
            {SETTINGS.map(([, text]) => (
                <ListItem key={text}>
                    <ListTitle>{text}</ListTitle>
                    <ListIcon glyph="navigation-right-arrow" />
                </ListItem>
            ))}
        </HeaderFooterList>
    )
};

const QUANTITIES = [2, 3, 1, 1];

export const SecondaryText: Story = {
    name: 'Secondary text',
    render: () => (
        <HeaderFooterList
            header="Order Receipt (4 items)"
            footer={
                <>
                    <span className="flex-1 font-bold">Total</span>
                    <span>7</span>
                </>
            }
        >
            {FRUITS.map((fruit, i) => (
                <ListItem key={fruit}>
                    <ListTitle>{fruit}</ListTitle>
                    <ListSecondary>Quantity: {QUANTITIES[i]}</ListSecondary>
                </ListItem>
            ))}
        </HeaderFooterList>
    )
};

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt';

export const OrderSummary: Story = {
    name: 'Byline (order summary)',
    render: () => (
        <HeaderFooterList header="Order Summary (4 items)" footer="Updated 3 minutes ago" byline>
            {FRUITS.map((fruit, i) => (
                <ListItem key={fruit}>
                    <ListContent>
                        <ListTitle render={<div />}>{fruit}</ListTitle>
                        {i < 3 ? (
                            <ListByline>{LOREM}</ListByline>
                        ) : (
                            <ListByline twoCol>
                                <ListBylineLeft>{LOREM}</ListBylineLeft>
                                <ListBylineRight status="negative">Out of stock</ListBylineRight>
                            </ListByline>
                        )}
                    </ListContent>
                </ListItem>
            ))}
        </HeaderFooterList>
    )
};

function CheckoutOptions() {
    const [checked, setChecked] = useState([true, false, false]);
    return (
        <HeaderFooterList header="Checkout options" footer="Company ©" selection aria-multiselectable="true">
            {['Coupon Applied: FREE', 'Add gift wrapping', 'Less packaging'].map((option, i) => (
                <ListItem key={option}>
                    <Checkbox
                        aria-label={option}
                        checked={checked[i]}
                        onCheckedChange={(value) => setChecked((all) => all.map((c, j) => (j === i ? value : c)))}
                    />
                    <ListTitle>{option}</ListTitle>
                </ListItem>
            ))}
        </HeaderFooterList>
    );
}

export const CheckoutSelection: Story = {
    name: 'Selection (checkout options)',
    render: () => <CheckoutOptions />
};

export const PartialNavigation: Story = {
    name: 'Partial navigation',
    render: () => (
        <HeaderFooterList header="Cart (3 items)" footer="Updated 3 minutes ago" navigationIndicator>
            <ListItem>
                <ListLink href="#" navigationIndicator>
                    <ListTitle>Add more items</ListTitle>
                </ListLink>
            </ListItem>
            {FRUITS.slice(0, 3).map((fruit) => (
                <ListItem key={fruit}>
                    <ListTitle>{fruit}</ListTitle>
                </ListItem>
            ))}
            <ListItem selected>
                <ListLink href="#" navigationIndicator>
                    <ListTitle>Checkout</ListTitle>
                </ListLink>
            </ListItem>
        </HeaderFooterList>
    )
};

export const NavigationList: Story = {
    name: 'Navigation list',
    render: () => (
        <HeaderFooterList header="Quick links" footer="Company ©" navigationIndicator>
            {SETTINGS.map(([, text], i) => (
                <ListItem key={text} selected={i === 3}>
                    <ListLink href="#" navigationIndicator>
                        <ListTitle>{text}</ListTitle>
                    </ListLink>
                </ListItem>
            ))}
        </HeaderFooterList>
    )
};

export const ActionList: Story = {
    name: 'Action list',
    render: () => (
        <HeaderFooterList header="Cart (4 items)" footer="Company ©">
            {FRUITS.map((fruit, i) => (
                <ListItem key={fruit}>
                    <ListTitle>{fruit}</ListTitle>
                    <ListSecondary>Quantity: {QUANTITIES[i]}</ListSecondary>
                </ListItem>
            ))}
            {['Empty cart', 'Apply Coupon', 'Checkout'].map((label) => (
                <ListItem key={label} action>
                    <ListTitle render={<button type="button" />}>{label}</ListTitle>
                </ListItem>
            ))}
        </HeaderFooterList>
    )
};
