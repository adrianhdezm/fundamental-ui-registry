import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Token, Tokenizer, TokenizerInput, type TokenProps } from './token';

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Dragon fruit', 'Elderberry', 'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon'];

type PlaygroundArgs = Omit<TokenProps, 'children'> & { children: string };

const meta = {
    title: 'Components/Token',
    component: Token,
    subcomponents: { Tokenizer, TokenizerInput } as Record<string, ComponentType<unknown>>,
    parameters: {
        docs: {
            description: {
                component:
                    'Tokens represent chosen values. In a `Tokenizer` they share one field with an input (`input`): ' +
                    'Left and Right move between the tokens and the input, Backspace and Delete remove the focused or ' +
                    'selected tokens, Space selects, Ctrl+A selects all, and Ctrl or Shift clicks extend the selection. ' +
                    'While the tokenizer does not have the focus, tokens that do not fit collapse into an "n more" link ' +
                    'that lists them in a popover.\n\n' +
                    '```tsx\n' +
                    '<Tokenizer input={<TokenizerInput aria-label="Values" />}>\n' +
                    '    {values.map((value) => (\n' +
                    '        <Token key={value} onCloseClick={() => remove(value)}>{value}</Token>\n' +
                    '    ))}\n' +
                    '</Tokenizer>\n' +
                    '```\n\n' +
                    'A token is an `option` described as a token: put standalone tokens in a `role="listbox"` element.'
            }
        }
    },
    args: { children: 'Token', selected: false, readOnly: false, disabled: false },
    render: (args) => (
        <div role="listbox" aria-label="Tokens">
            <Token {...args} />
        </div>
    )
} satisfies Meta<PlaygroundArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A listbox of standalone tokens. */
function Tokens({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
    return (
        <div role="listbox" aria-label={label} className={className ?? 'flex flex-wrap items-center gap-2'}>
            {children}
        </div>
    );
}

const text = 'm-0 font-sap-font-family text-sap-font-size text-sap-text-color';

export const Playground: Story = {};

export const Primary: Story = {
    render: () => (
        <Tokens label="Tokens">
            <Token>Default</Token>
        </Tokens>
    )
};

export const ReadOnly: Story = {
    name: 'Read only',
    render: () => (
        <Tokens label="Tokens">
            <Token readOnly>Read Only</Token>
        </Tokens>
    )
};

export const TokensStory: Story = {
    name: 'Tokens',
    render: () => (
        <Tokens label="Tokens">
            <Token>Default</Token>
            <Token defaultSelected>Selected</Token>
            <Token readOnly>Read only</Token>
            <Token disabled>Disabled</Token>
            <Token>A token with a long text that truncates when it does not fit</Token>
        </Tokens>
    )
};

export const CompactTokens: Story = {
    name: 'Compact tokens',
    render: () => (
        <div data-density="compact">
            <Tokens label="Filters">
                <Token>Bibendum</Token>
                <Token>Lorem</Token>
                <Token defaultSelected>Dolor</Token>
                <Token readOnly>Filter</Token>
            </Tokens>
        </div>
    )
};

/** The states of fundamental-styles' token story (the visual reference). */
export const States: Story = {
    render: () => (
        <Tokens
            label="Token states"
            className="grid w-80 grid-cols-[auto_auto] items-center justify-start justify-items-start gap-4"
        >
            <Token id="token-normal">tokenopolis</Token>
            <Token id="token-selected" defaultSelected>
                tokenopolis
            </Token>
            <Token id="token-readonly" readOnly>
                tokenopolis
            </Token>
            <Token id="token-disabled" disabled>
                tokenopolis
            </Token>
        </Tokens>
    )
};

interface FruitTokenizerProps {
    width?: string;
    compact?: boolean;
    glyph?: boolean;
    count?: number;
}

/** A tokenizer of fruits: Enter adds the typed fruit, the close icon and Backspace remove one. */
function FruitTokenizer({ width = '32rem', compact = false, glyph = false, count = 6 }: FruitTokenizerProps) {
    const [values, setValues] = useState(() => FRUITS.slice(0, count));
    const [draft, setDraft] = useState('');
    const remove = (value: string) => setValues((current) => current.filter((x) => x !== value));
    const add = () => {
        const value = draft.trim();
        if (value && !values.includes(value)) setValues((current) => [...current, value]);
        setDraft('');
    };
    return (
        <div style={{ maxWidth: width }} data-density={compact ? 'compact' : undefined}>
            <Tokenizer
                glyph={glyph ? 'value-help' : null}
                glyphAriaLabel="Value help"
                input={
                    <TokenizerInput
                        aria-label="Fruits"
                        placeholder="Type a fruit and press Enter"
                        value={draft}
                        onValueChange={setDraft}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') add();
                        }}
                    />
                }
            >
                {values.map((value) => (
                    <Token key={value} readOnly={value === 'Fig'} onCloseClick={() => remove(value)}>
                        {value}
                    </Token>
                ))}
            </Tokenizer>
            <p className={`${text} mt-2`} aria-live="polite">
                {values.length} tokens
            </p>
        </div>
    );
}

export const TokenizerStory: Story = { name: 'Tokenizer', render: () => <FruitTokenizer /> };
export const Overflow: Story = { render: () => <FruitTokenizer width="20rem" count={10} /> };
export const Compact: Story = { render: () => <FruitTokenizer compact glyph /> };

/** fundamental-styles' tokenizer stories (the visual reference): empty, with tokens, read-only. */
export const FieldStates: Story = {
    name: 'Field states',
    render: () => (
        <div className="flex flex-col gap-8">
            <Tokenizer
                id="tokenizer-empty"
                input={<TokenizerInput aria-label="Tokenizer input" placeholder="Type Ahead" />}
            />
            <Tokenizer
                id="tokenizer-tokens"
                tokenizerLabel="Tokens"
                input={<TokenizerInput aria-label="Tokenizer input" placeholder="Type Ahead" />}
            >
                <Token>Bibendum</Token>
                <Token>Lorem</Token>
                <Token>Dolor</Token>
                <Token>Filter</Token>
                <Token readOnly>Lorem</Token>
            </Tokenizer>
            <Tokenizer
                id="tokenizer-readonly"
                readOnly
                tokenizerLabel="Read-only tokens"
                input={<TokenizerInput aria-label="Read-only tokenizer input" readOnly />}
            >
                <Token readOnly>Bibendum</Token>
                <Token readOnly>Lorem</Token>
                <Token readOnly>Dolor</Token>
                <Token readOnly>Filter</Token>
                <Token readOnly>Lorem</Token>
            </Tokenizer>
            <Tokenizer
                id="tokenizer-state"
                state="error"
                tokenizerLabel="Invalid tokens"
                input={<TokenizerInput aria-label="Invalid tokenizer input" />}
            >
                <Token>Bibendum</Token>
            </Tokenizer>
            <Tokenizer
                id="tokenizer-disabled"
                disabled
                tokenizerLabel="Disabled tokens"
                input={<TokenizerInput aria-label="Disabled tokenizer input" disabled />}
            >
                <Token disabled>Bibendum</Token>
                <Token disabled>Lorem</Token>
            </Tokenizer>
        </div>
    )
};

export const OpenOverflow: Story = {
    name: 'Open: overflow',
    tags: ['!autodocs'],
    render: () => <FruitTokenizer width="20rem" count={10} />,
    play: async ({ canvasElement }) => {
        const more = await waitFor(() => {
            const link = canvasElement.querySelector<HTMLElement>('[data-tokenizer-more]');
            expect(link).not.toBeNull();
            return link!;
        });
        await userEvent.click(more);
        await waitFor(() =>
            expect(document.querySelector('[data-tokenizer-popover] [role=list] button')).not.toBeNull()
        );
    }
};
