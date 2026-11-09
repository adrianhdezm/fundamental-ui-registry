import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType, type ReactNode } from 'react';
import { Button } from '@/ui/button/button';
import { Title } from '@/ui/title/title';
import { SegmentedButton, SegmentedButtonItem } from './segmented-button';

interface PlaygroundArgs {
    toggle: boolean;
    vertical: boolean;
    disabled: boolean;
}

const meta = {
    title: 'Components/Segmented Button',
    component: SegmentedButton as ComponentType<PlaygroundArgs>,
    subcomponents: { SegmentedButtonItem } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            description: {
                component:
                    'A segmented button lets users pick one option (or several, with `toggle`) from a small set. Put ' +
                    '`SegmentedButtonItem`s in a `SegmentedButton`, which owns the value (`value`/`defaultValue`/' +
                    '`onValueChange`; an array with `toggle`). It is a listbox of options: arrow keys, Home and End ' +
                    'move between the buttons, Enter or Space selects, and only one button is a tab stop.'
            }
        }
    },
    args: { toggle: false, vertical: false, disabled: false },
    render: ({ toggle, ...args }) => (
        <SegmentedButton
            key={String(toggle)}
            aria-label="Chart type"
            {...(toggle ? { toggle: true, defaultValue: ['pie-chart'] } : { defaultValue: 'pie-chart' })}
            {...args}
        >
            <SegmentedButtonItem value="survey" glyph="survey" aria-label="Survey" />
            <SegmentedButtonItem value="pie-chart" glyph="pie-chart" aria-label="Pie chart" />
            <SegmentedButtonItem value="pool" glyph="pool" aria-label="Pool" />
        </SegmentedButton>
    )
} satisfies Meta<PlaygroundArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

const COL = 'flex flex-col items-start gap-3';
const VALUE = 'm-0 font-sap-font-family text-sap-font-small-size text-sap-content-label-color';

function Heading({ children }: { children: ReactNode }) {
    return (
        <Title level={3} headerSize={6} className="mt-6 mb-1 first:mt-0">
            {children}
        </Title>
    );
}

export const Playground: Story = {};

function SingleExample() {
    const [value, setValue] = useState<string | null>('second');
    return (
        <div className={COL}>
            <Heading>Labels</Heading>
            <SegmentedButton aria-label="Alignment" value={value} onValueChange={setValue}>
                <SegmentedButtonItem label="Left" value="first" />
                <SegmentedButtonItem label="Middle" value="second" />
                <SegmentedButtonItem label="Right" value="third" />
            </SegmentedButton>
            <Heading>Icons</Heading>
            <SegmentedButton aria-label="Tools" value={value} onValueChange={setValue}>
                <SegmentedButtonItem glyph="cart" title="Add to cart" aria-label="Add to cart" value="first" />
                <SegmentedButtonItem glyph="action" title="Action" aria-label="Action" value="second" />
                <SegmentedButtonItem glyph="activities" title="Activities" aria-label="Activities" value="third" />
            </SegmentedButton>
            <Heading>Vertical</Heading>
            <SegmentedButton aria-label="Tools vertical" vertical value={value} onValueChange={setValue}>
                <SegmentedButtonItem glyph="cart" title="Add to cart" aria-label="Add to cart" value="first" />
                <SegmentedButtonItem glyph="action" title="Action" aria-label="Action" value="second" />
                <SegmentedButtonItem glyph="activities" title="Activities" aria-label="Activities" value="third" />
            </SegmentedButton>
            <p className={VALUE}>value: {value}</p>
        </div>
    );
}

export const Single: Story = {
    name: 'Single selection',
    parameters: {
        docs: {
            description: {
                story: 'One selected button, with labels, icons, or stacked with `vertical`. The three groups share one value.'
            }
        }
    },
    render: () => <SingleExample />
};

const ICONS: [string, string][] = [
    ['survey', 'Survey'],
    ['pie-chart', 'Chart'],
    ['basket', 'Basket'],
    ['da', 'Joule'],
    ['pool', 'Pool']
];
const VERTICAL_ICONS: [string, string][] = [
    ['survey', 'Survey'],
    ['database', 'Database'],
    ['pie-chart', 'Chart'],
    ['basket', 'Basket'],
    ['calendar', 'Calendar'],
    ['favorite', 'Favorite'],
    ['pool', 'Pool']
];

function ToggleExample() {
    const [value, setValue] = useState<string[]>(['first']);
    const [empty, setEmpty] = useState<string[]>([]);
    return (
        <div className={COL}>
            <SegmentedButton aria-label="Alignment multiple" toggle value={value} onValueChange={setValue}>
                <SegmentedButtonItem label="Left" value="first" />
                <SegmentedButtonItem label="Middle" value="second" />
                <SegmentedButtonItem label="Right" value="third" />
            </SegmentedButton>
            <p className={VALUE}>value: {JSON.stringify(value)}</p>
            <Heading>Empty initial state</Heading>
            <SegmentedButton aria-label="Text style" toggle value={empty} onValueChange={setEmpty}>
                {['Bold', 'Italic', 'Underline'].map((v) => (
                    <SegmentedButtonItem key={v} label={v} value={v} />
                ))}
            </SegmentedButton>
            <p className={VALUE}>value: {JSON.stringify(empty)}</p>
            <Heading>Icons</Heading>
            <SegmentedButton aria-label="Views" toggle defaultValue={['pie-chart', 'da']}>
                {ICONS.map(([glyph, name]) => (
                    <SegmentedButtonItem key={glyph} value={glyph} glyph={glyph} title={name} aria-label={name} />
                ))}
            </SegmentedButton>
            <Heading>Vertical</Heading>
            <SegmentedButton aria-label="Views vertical" toggle vertical defaultValue={['pie-chart', 'calendar']}>
                {VERTICAL_ICONS.map(([glyph, name]) => (
                    <SegmentedButtonItem key={glyph} value={glyph} glyph={glyph} title={name} aria-label={name} />
                ))}
            </SegmentedButton>
        </div>
    );
}

export const Toggle: Story = {
    name: 'Multiple selection (toggle)',
    parameters: {
        docs: {
            description: {
                story: 'With `toggle`, several buttons can be selected and a second click deselects; the value is an array, in the order of selection.'
            }
        }
    },
    render: () => <ToggleExample />
};

export const Compact: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Compact density: set `data-density="compact"` on the group or an ancestor, or use the Density toolbar switch.'
            }
        }
    },
    render: () => (
        <SegmentedButton aria-label="Alignment compact" data-density="compact" defaultValue="middle">
            <SegmentedButtonItem value="left">Left</SegmentedButtonItem>
            <SegmentedButtonItem value="middle">Middle</SegmentedButtonItem>
            <SegmentedButtonItem value="right">Right</SegmentedButtonItem>
        </SegmentedButton>
    )
};

export const Disabled: Story = {
    parameters: {
        docs: {
            description: {
                story: '`disabled` on the group disables every button; `disabled` on an item disables that button, which arrow keys skip.'
            }
        }
    },
    render: () => (
        <div className={COL}>
            <SegmentedButton aria-label="Disabled group" disabled defaultValue="second">
                <SegmentedButtonItem label="Left" value="first" />
                <SegmentedButtonItem label="Middle" value="second" />
                <SegmentedButtonItem label="Right" value="third" />
            </SegmentedButton>
            <SegmentedButton aria-label="Alignment with disabled option" defaultValue="second">
                <SegmentedButtonItem label="Left" value="first" />
                <SegmentedButtonItem label="Middle (disabled)" value="second" disabled />
                <SegmentedButtonItem label="Right" value="third" />
            </SegmentedButton>
        </div>
    )
};

/** A form field: value, whether it changed (dirty) and lost focus (touched), and whether it is disabled. */
function useField<V>(initial: V, initiallyDisabled = false) {
    const [value, setValue] = useState(initial);
    const [dirty, setDirty] = useState(false);
    const [touched, setTouched] = useState(false);
    const [disabled, setDisabled] = useState(initiallyDisabled);
    return {
        value,
        dirty,
        touched,
        disabled,
        toggleDisabled: () => setDisabled((d) => !d),
        props: {
            value,
            disabled,
            onValueChange: (v: V) => {
                setValue(v);
                setDirty(true);
            },
            onBlur: () => setTouched(true)
        }
    };
}

function FieldState({ field }: { field: { value: unknown; dirty: boolean; touched: boolean } }) {
    return (
        <p className={VALUE}>
            Value: {JSON.stringify(field.value)} · Dirty: {String(field.dirty)} · Touched: {String(field.touched)}
        </p>
    );
}

function FormExample() {
    const basic = useField<string | null>('first');
    const disabled = useField<string | null>('first', true);
    const toggled = useField<string[]>(['third']);
    const toggledDisabled = useField<string[]>(['second'], true);
    const items = (
        <>
            <SegmentedButtonItem label="Left" value="first" />
            <SegmentedButtonItem label="Middle" value="second" />
            <SegmentedButtonItem label="Right" value="third" />
        </>
    );
    return (
        <form className={COL} onSubmit={(event) => event.preventDefault()}>
            <Heading>Forms</Heading>
            <SegmentedButton aria-label="Forms" {...basic.props}>
                {items}
            </SegmentedButton>
            <FieldState field={basic} />
            <Heading>Disabled forms</Heading>
            <SegmentedButton aria-label="Disabled forms" {...disabled.props}>
                {items}
            </SegmentedButton>
            <FieldState field={disabled} />
            <Heading>Toggled</Heading>
            <SegmentedButton aria-label="Toggled" toggle {...toggled.props}>
                {items}
            </SegmentedButton>
            <FieldState field={toggled} />
            <Heading>Toggled disabled</Heading>
            <SegmentedButton aria-label="Toggled disabled" toggle {...toggledDisabled.props}>
                {items}
            </SegmentedButton>
            <FieldState field={toggledDisabled} />
            <div className="flex gap-2">
                <Button label="Enable or disable Forms" onClick={basic.toggleDisabled} />
                <Button label="Enable or disable Toggled" onClick={toggled.toggleDisabled} />
            </div>
        </form>
    );
}

export const Form: Story = {
    name: 'Form state',
    parameters: {
        docs: {
            description: {
                story: 'Groups as form fields: the value, whether it changed (dirty) and lost focus (touched), and `disabled` switched at run time.'
            }
        }
    },
    render: () => <FormExample />
};

const GENERATED = ['first', 'second', 'third'];

function GeneratedExample() {
    const [current, setCurrent] = useState<string | null>('first');
    return (
        <div className={COL}>
            <SegmentedButton aria-label="Generated" value={current} onValueChange={(v) => setCurrent(v)}>
                {GENERATED.map((v) => (
                    <SegmentedButtonItem key={v} label={v} value={v} />
                ))}
            </SegmentedButton>
            <p className={VALUE}>value: {current}</p>
        </div>
    );
}

export const Generated: Story = {
    name: 'Generated buttons',
    parameters: {
        docs: {
            description: {
                story: 'Buttons generated from an array, with a separate `value` and `onValueChange`.'
            }
        }
    },
    render: () => <GeneratedExample />
};
