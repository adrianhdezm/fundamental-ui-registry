import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import {
    Shellbar,
    ShellbarAction,
    ShellbarActions,
    ShellbarBranding,
    ShellbarLogo,
    ShellbarTitle
} from '@/ui/shellbar/shellbar';
import { SearchInput, type SearchInputItem, type SearchInputProps } from './search-input';

/** Plain label until the form component is ported. */
function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
    return (
        <label
            htmlFor={htmlFor}
            className="font-sap-font-family text-sap-font-size leading-[normal] text-sap-content-label-color"
        >
            {children}
        </label>
    );
}

const COLUMN = 'flex flex-col gap-4';
const ITEM = 'flex flex-col';
const TEXT = 'm-0 font-sap-font-family text-sap-font-small-size text-sap-content-label-color';

/** fundamental-react's fruits, capitalized as fundamental-styles' combobox fruits. */
const SEARCH_DATA: SearchInputItem[] = [
    'Apple',
    'Apricot',
    'Banana',
    'Blueberry',
    'Blackberry',
    'Calabash',
    'Clementines',
    'Kiwi',
    'Orange'
].map((text) => ({ text }));

const QUESTIONS: SearchInputItem[] = [
    { text: 'who is a supplier user?' },
    { text: 'who is a buyer user?' },
    { text: 'who is a worker user?' },
    { text: 'how to change the pin?' },
    { text: 'how to set the pin?' }
];

const meta = {
    title: 'Components/Search Input',
    component: SearchInput,
    parameters: {
        docs: {
            description: {
                component:
                    'A search field with a clear and a search button that suggests matching entries of `searchList` ' +
                    "while typing, on Base UI's Autocomplete. The input is a combobox and keeps the focus: Down and Up " +
                    'highlight suggestions, Enter chooses the highlighted one or searches, Escape closes the ' +
                    'suggestions and then clears the text, a click in the input opens or closes them. Enter and the ' +
                    'search button call `onSearch` with the text; a chosen suggestion calls its `callback` and ' +
                    '`onItemSelect`. Without `searchList` it is a plain search field. Compact density is ' +
                    '`data-density="compact"` on the field or an ancestor.\n\n' +
                    '```tsx\n' +
                    '<SearchInput\n' +
                    '    aria-label="Fruit"\n' +
                    '    placeholder="Search"\n' +
                    "    searchList={[{ text: 'Apple' }, { text: 'Banana' }]}\n" +
                    '    onSearch={(text) => find(text)}\n' +
                    '/>\n' +
                    '```'
            }
        }
    },
    argTypes: {
        state: { control: 'select', options: ['default', 'success', 'error', 'warning', 'information'] }
    },
    args: {
        'aria-label': 'Search input for dev testing',
        placeholder: 'Select a Fruit',
        searchList: SEARCH_DATA,
        subStringSearch: false,
        disabled: false,
        readOnly: false,
        noSearchButton: false,
        showClearButton: true,
        state: 'default',
        stateMessage: 'placeholder text'
    }
} satisfies Meta<typeof SearchInput>;
export default meta;
type Story = StoryObj<typeof meta>;

/** fundamental-react's dev story: every knob, with the callbacks printed. */
function PlaygroundExample(args: Story['args']) {
    const [log, setLog] = useState<string[]>([]);
    const add = (line: string) => setLog((lines) => [line, ...lines].slice(0, 5));
    return (
        <div className="flex max-w-96 flex-col gap-2">
            <SearchInput
                {...args}
                onValueChange={(value, details) => add(`onValueChange: "${value}" (${details.matches.length} matches)`)}
                onSearch={(value) => add(`onSearch: "${value}"`)}
                onItemSelect={(item) => add(`onItemSelect: ${item.text}`)}
            />
            {log.map((line, index) => (
                <p key={index} className={TEXT}>
                    {line}
                </p>
            ))}
        </div>
    );
}

export const Playground: Story = {
    render: (args) => <PlaygroundExample {...args} />
};

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Type to filter the suggestions by the start of their text; the typed text is bold. A label ' +
                    'names the input with `inputId`. With text the field shows a clear button (`showClearButton`), ' +
                    "and the search button can be left out (`noSearchButton`), as fundamental-styles' Input With " +
                    'Actions examples.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            <div className={ITEM}>
                <Label htmlFor="search-default">Search</Label>
                <SearchInput inputId="search-default" placeholder="Placeholder" searchList={SEARCH_DATA} />
            </div>
            <div className={ITEM}>
                <Label htmlFor="search-value">Input with 2 icon actions</Label>
                <SearchInput
                    inputId="search-value"
                    placeholder="Placeholder"
                    defaultValue="100"
                    searchList={SEARCH_DATA}
                />
            </div>
            <div className={ITEM}>
                <Label htmlFor="search-no-button">Without search button</Label>
                <SearchInput
                    inputId="search-no-button"
                    placeholder="Placeholder"
                    defaultValue="Kiwi"
                    noSearchButton
                    searchList={SEARCH_DATA}
                />
            </div>
        </div>
    )
};

export const Compact: Story = {
    parameters: {
        docs: {
            description: {
                story: '`data-density="compact"` on the field or an ancestor (fundamental-react\'s `compact`).'
            }
        }
    },
    render: () => (
        <div data-density="compact" className="max-w-96">
            <SearchInput aria-label="Compact search input" placeholder="Placeholder" searchList={SEARCH_DATA} />
        </div>
    )
};

export const Disabled: Story = {
    render: () => (
        <div className={COLUMN}>
            <SearchInput
                aria-label="Disabled search input"
                placeholder="Placeholder"
                disabled
                searchList={SEARCH_DATA}
            />
            <SearchInput
                aria-label="Disabled search input with text"
                placeholder="Placeholder"
                defaultValue="Apple"
                disabled
                searchList={SEARCH_DATA}
            />
        </div>
    )
};

export const ReadOnly: Story = {
    name: 'Read-only',
    parameters: {
        docs: { description: { story: 'Read-only fields have no buttons and no suggestions.' } }
    },
    render: () => (
        <SearchInput
            aria-label="Readonly search input"
            placeholder="Read Only"
            defaultValue="Apple"
            readOnly
            searchList={SEARCH_DATA}
        />
    )
};

export const SubstringSearch: Story = {
    name: 'Substring search',
    parameters: {
        docs: { description: { story: '`subStringSearch` matches the text anywhere in the suggestions.' } }
    },
    render: () => (
        <SearchInput
            aria-label="Search substring"
            placeholder="search substring"
            searchList={QUESTIONS}
            subStringSearch
        />
    )
};

const STATES = [
    ['error', 'Error', 'Search input with error'],
    ['warning', 'Warning', 'Search input with warning'],
    ['success', 'Success', 'Search input with success message'],
    ['information', 'Information', 'Search input with information']
] as const;

export const ValidationStates: Story = {
    name: 'Validation states',
    parameters: {
        docs: {
            description: {
                story:
                    "`state` colours the field; `stateMessage` is shown above the suggestions (as fundamental-styles' " +
                    'semantic combobox) and describes the input for assistive technology.'
            }
        }
    },
    render: () => (
        <div className={COLUMN}>
            {STATES.map(([state, placeholder, label]) => (
                <SearchInput
                    key={state}
                    aria-label={label}
                    placeholder={placeholder}
                    searchList={SEARCH_DATA}
                    state={state}
                    stateMessage="Test validation state"
                />
            ))}
        </div>
    )
};

/** A search field without suggestions, with the search term and the last search printed. */
function WithoutSuggestionsExample() {
    const [term, setTerm] = useState('');
    const [searched, setSearched] = useState('');
    return (
        <div className={ITEM}>
            <Label htmlFor="search-plain">Search input</Label>
            <SearchInput
                inputId="search-plain"
                placeholder="Search"
                value={term}
                onValueChange={setTerm}
                onSearch={setSearched}
            />
            <p className={TEXT}>
                Search term: {term}, searched for: {searched}
            </p>
        </div>
    );
}

export const WithoutSuggestions: Story = {
    name: 'Without suggestions',
    parameters: {
        docs: {
            description: {
                story:
                    'Without `searchList` the input is a plain search field (`role="searchbox"`): Enter and the search ' +
                    'button call `onSearch`, Escape clears the text.'
            }
        }
    },
    render: () => <WithoutSuggestionsExample />
};

/** A neutral placeholder logo. */
const LOGO =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'><rect width='60' height='30' rx='4' fill='%230070f2'/><text x='30' y='20' font-family='Arial' font-size='13' font-weight='bold' fill='white' text-anchor='middle'>ACME</text></svg>";

/** fundamental-react's `inShellbar`: a search input with suggestions among the actions of a shellbar. */
function InShellbarExample() {
    const [searched, setSearched] = useState('');
    return (
        <div className={COLUMN}>
            <Shellbar>
                <ShellbarBranding>
                    <ShellbarLogo>
                        <img src={LOGO} alt="ACME" />
                    </ShellbarLogo>
                    <ShellbarTitle>Corporate Portal</ShellbarTitle>
                </ShellbarBranding>
                <ShellbarActions user={{ fullName: 'John Snow', colorAccent: 8 }} userMenu={[{ text: 'Sign Out' }]}>
                    <SearchInput
                        aria-label="Fruit"
                        placeholder="Enter a fruit"
                        searchList={SEARCH_DATA}
                        onSearch={setSearched}
                    />
                    <ShellbarAction glyph="bell" label="Notifications" notificationCount={2} />
                </ShellbarActions>
            </Shellbar>
            <p className={TEXT}>Searched: {searched}</p>
        </div>
    );
}

export const InShellbar: Story = {
    name: 'In a shellbar',
    parameters: {
        docs: {
            description: {
                story:
                    'fundamental-react’s `inShellbar`: the search input needs no prop of its own in a shellbar; it is ' +
                    'one of the `ShellbarActions` (before the actions), and its transparent buttons take the shell ' +
                    'colours. The shellbar’s own search field is `ShellbarSearch`, which has no suggestions.'
            }
        }
    },
    render: () => <InShellbarExample />
};

/** Suggestions that follow the text, as fundamental-react's "list changed after creation" test. */
function ControlledExample() {
    const [value, setValue] = useState('');
    const [chosen, setChosen] = useState('');
    const list: SearchInputItem[] = value.toLowerCase().startsWith('pe')
        ? [{ text: 'Peaches' }, { text: 'Pear' }]
        : SEARCH_DATA.map((item) => ({ ...item, callback: () => setChosen(item.text) }));
    return (
        <div className={ITEM}>
            <Label htmlFor="search-controlled">Fruit</Label>
            <SearchInput
                inputId="search-controlled"
                placeholder="Type a fruit, or pe"
                value={value}
                onValueChange={setValue}
                searchList={list}
            />
            <p className={TEXT}>
                Value: {value}, chosen with a callback: {chosen}
            </p>
        </div>
    );
}

export const Controlled: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    '`value` with `onValueChange` controls the text; the app may change `searchList` while typing ' +
                    '(type "pe"). A suggestion\'s `callback` runs when it is chosen.'
            }
        }
    },
    render: () => <ControlledExample />
};

/**
 * Clicks the input of the story (and types `text`) and waits for its suggestions. While they are open, Base UI hides
 * everything else on the page from assistive technology, so the "Open: …" stories hold one field.
 */
async function openSuggestions(canvas: HTMLElement, text?: string): Promise<void> {
    const input = canvas.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    await userEvent.click(input);
    if (text) await userEvent.type(input, text);
    await waitFor(() => {
        expect(input.getAttribute('aria-expanded')).toBe('true');
        expect(document.getElementById(input.getAttribute('aria-controls') ?? '')).not.toBeNull();
    });
}

/** One labelled field for the "Open: …" stories, with its suggestions rendered inside the story. */
function OpenField(props: Partial<SearchInputProps>) {
    const [box, setBox] = useState<HTMLDivElement | null>(null);
    return (
        <div ref={setBox} className={ITEM}>
            {props['aria-label'] ? null : <Label htmlFor="search-open">Search</Label>}
            <SearchInput
                inputId="search-open"
                placeholder="Placeholder"
                searchList={SEARCH_DATA}
                container={box}
                {...props}
            />
        </div>
    );
}
const openField = (props: Partial<SearchInputProps> = {}) => <OpenField {...props} />;

export const OpenDefault: Story = {
    name: 'Open: default',
    tags: ['!autodocs'],
    render: () => openField(),
    play: ({ canvasElement }) => openSuggestions(canvasElement)
};
export const OpenFiltered: Story = {
    name: 'Open: filtered',
    tags: ['!autodocs'],
    render: () => openField(),
    play: async ({ canvasElement }) => {
        await openSuggestions(canvasElement, 'Bl');
        await userEvent.keyboard('{ArrowDown}');
    }
};
export const OpenNoResult: Story = {
    name: 'Open: no result',
    tags: ['!autodocs'],
    render: () => openField({ defaultValue: '100' }),
    play: ({ canvasElement }) => openSuggestions(canvasElement)
};
export const OpenSubstring: Story = {
    name: 'Open: substring search',
    tags: ['!autodocs'],
    render: () =>
        openField({
            'aria-label': 'Search substring',
            placeholder: 'search substring',
            searchList: QUESTIONS,
            subStringSearch: true
        }),
    play: ({ canvasElement }) => openSuggestions(canvasElement, 'pin')
};
export const OpenCompact: Story = {
    name: 'Open: compact',
    tags: ['!autodocs'],
    render: () => <div data-density="compact">{openField()}</div>,
    play: ({ canvasElement }) => openSuggestions(canvasElement)
};
const openState = (index: number): Story => {
    const [state, placeholder, label] = STATES[index]!;
    return {
        name: `Open: ${state}`,
        tags: ['!autodocs'],
        render: () => openField({ 'aria-label': label, placeholder, state, stateMessage: 'Test validation state' }),
        play: ({ canvasElement }) => openSuggestions(canvasElement)
    };
};
export const OpenError = openState(0);
export const OpenWarning = openState(1);
export const OpenSuccess = openState(2);
export const OpenInformation = openState(3);

/** The field with the focus in its input, for the visual focus case. */
export const Focus: Story = {
    name: 'Focus: default',
    tags: ['!autodocs'],
    render: () => (
        <div className={ITEM}>
            <Label htmlFor="search-focus">Focus</Label>
            <SearchInput inputId="search-focus" placeholder="Placeholder" defaultValue="100" />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector<HTMLInputElement>('#search-focus')!;
        input.focus();
        await expect(input).toHaveFocus();
    }
};
