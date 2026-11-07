import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { ObjectStatus, type IndicationColor, type ObjectStatusType } from './object-status';

const STATUSES: { status: ObjectStatusType | null; glyph: string; label: string }[] = [
    { status: 'negative', glyph: 'error', label: 'Negative' },
    { status: 'critical', glyph: 'alert', label: 'Critical' },
    { status: 'positive', glyph: 'sys-enter-2', label: 'Positive' },
    { status: 'informative', glyph: 'information', label: 'Info' }
];
const NEUTRAL = { status: null, glyph: 'circle-task-2', label: 'Neutral' };
const INDICATIONS: [IndicationColor, string][] = [
    [1, 'Dark Red'],
    [2, 'Red'],
    [3, 'Yellow'],
    [4, 'Green'],
    [5, 'Blue'],
    [6, 'Teal'],
    [7, 'Purple'],
    [8, 'Pink'],
    [9, 'Indication 9'],
    [10, 'Indication 10']
];
const NUMBERS: { status: ObjectStatusType | null; label: string }[] = [
    { status: 'negative', label: '5' },
    { status: 'critical', label: '20' },
    { status: 'positive', label: '2.99' },
    { status: 'informative', label: '10' },
    { status: null, label: '99+' }
];
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as IndicationColor[];

const Row = ({ children }: { children: ReactNode }) => (
    <div className="flex flex-wrap items-center gap-4">{children}</div>
);
const Rows = ({ children }: { children: ReactNode }) => <div className="flex flex-col gap-6">{children}</div>;
const noop = () => {};

const meta = {
    title: 'Components/Object Status',
    component: ObjectStatus,
    parameters: {
        // Horizon's inverted status and informative text colours are below 4.5:1 by design
        a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
        docs: {
            description: {
                component:
                    'Object status shows the state of an object as semantic or generic indication colours, with an ' +
                    'optional icon. Inverted statuses are filled badges; clickable ones behave as buttons. A hidden ' +
                    'text announces "Object Status" and the meaning of the status.'
            }
        }
    },
    argTypes: {
        status: { control: 'select', options: [null, 'negative', 'critical', 'positive', 'informative'] },
        indicationColor: { control: { type: 'number', min: 1, max: 10 } }
    },
    args: {
        status: 'positive',
        glyph: 'sys-enter-2',
        label: 'Approved',
        inverted: false,
        clickable: false,
        large: false,
        truncate: false,
        secondaryIndication: false
    }
} satisfies Meta<typeof ObjectStatus>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Primary: Story = {
    render: () => (
        <Row>
            {STATUSES.map((s) => (
                <ObjectStatus key={s.label} status={s.status} glyph={s.glyph} label={s.label} />
            ))}
        </Row>
    )
};

export const IconOnly: Story = {
    name: 'Icon only',
    render: () => (
        <Row>
            {STATUSES.map((s) => (
                <ObjectStatus key={s.label} status={s.status} glyph={s.glyph} glyphAriaLabel={s.label} />
            ))}
            {/* fundamental-react: the name on the status itself */}
            <ObjectStatus glyph="to-be-reviewed" aria-label="Neutral" role="img" />
        </Row>
    )
};

export const TextOnly: Story = {
    name: 'Text only',
    render: () => (
        <Row>
            {[...STATUSES, NEUTRAL].map((s) => (
                <ObjectStatus key={s.label} status={s.status} label={s.label} />
            ))}
        </Row>
    )
};

export const IconAndText: Story = {
    name: 'Icon and text',
    render: () => (
        <Row>
            {[...STATUSES, NEUTRAL].map((s) => (
                <ObjectStatus key={s.label} status={s.status} glyph={s.glyph} label={s.label} />
            ))}
            <ObjectStatus status="positive" glyph="sys-enter-2">
                <b>Formatted</b> text
            </ObjectStatus>
        </Row>
    )
};

export const IndicationColors: Story = {
    name: 'Generic indication colors',
    render: () => (
        <Row>
            {INDICATIONS.map(([i, label]) => (
                <ObjectStatus key={i} indicationColor={i} label={label} />
            ))}
        </Row>
    )
};

export const Clickable: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Clickable statuses are buttons (`role="button"`, Enter and Space), underlined until hovered. ' +
                    'Render a `<button>` for a native button, or an `<a href>` for a link.'
            }
        }
    },
    render: () => (
        <Rows>
            <Row>
                {[...STATUSES, { ...NEUTRAL, glyph: '' }].map((s) => (
                    <ObjectStatus
                        key={s.label}
                        clickable
                        status={s.status}
                        glyph={s.glyph}
                        label={s.label}
                        onClick={noop}
                        render={<div />}
                    />
                ))}
            </Row>
            <Row>
                {INDICATIONS.map(([i, label]) => (
                    <ObjectStatus key={i} clickable indicationColor={i} label={label} onClick={noop} render={<div />} />
                ))}
            </Row>
            <Row>
                <ObjectStatus clickable status="informative" glyph="hint" label="Link" render={<a href="#" />} />
                <ObjectStatus clickable status="positive" label="Native button" onClick={noop} render={<button />} />
                <ObjectStatus clickable large status="negative" glyph="error" label="Large" onClick={noop} />
                <ObjectStatus clickable large indicationColor={2} label="Red" render={<a href="#" />} />
            </Row>
        </Rows>
    )
};

export const Inverted: Story = {
    render: () => (
        <Rows>
            <Row>
                <ObjectStatus inverted status="negative" label="Inverted Negative" />
                <ObjectStatus inverted status="critical" label="Inverted Warning" />
                <ObjectStatus inverted status="positive" label="Inverted Success" />
                <ObjectStatus inverted status="informative" label="Inverted informative" />
                <ObjectStatus inverted label="Inverted Neutral" />
            </Row>
            <Row>
                {STATUSES.map((s) => (
                    <ObjectStatus key={s.label} inverted status={s.status} glyph={s.glyph} glyphAriaLabel={s.label} />
                ))}
                <ObjectStatus inverted glyph="to-be-reviewed" glyphAriaLabel="Neutral" />
            </Row>
            <Row>
                {[...STATUSES, { ...NEUTRAL, glyph: '' }].map((s) => (
                    <ObjectStatus key={s.label} inverted status={s.status} glyph={s.glyph} label={s.label} />
                ))}
            </Row>
            <Row>
                {NUMBERS.map((n) => (
                    <ObjectStatus key={n.label} inverted status={n.status} label={n.label} />
                ))}
                <ObjectStatus inverted indicationColor={1} label="Dark Red" />
                <ObjectStatus inverted indicationColor={2} label="Red" />
            </Row>
        </Rows>
    )
};

export const InvertedClickable: Story = {
    name: 'Inverted clickable',
    render: () => (
        <Rows>
            <Row>
                <ObjectStatus inverted clickable label="Neutral" onClick={noop} render={<div />} />
                {STATUSES.map((s) => (
                    <ObjectStatus
                        key={s.label}
                        inverted
                        clickable
                        status={s.status}
                        glyph={s.glyph}
                        label="Information"
                        onClick={noop}
                        render={<div />}
                    />
                ))}
            </Row>
            <Row>
                <ObjectStatus inverted clickable status="negative" glyph="error" label="Link" render={<a href="#" />} />
                <ObjectStatus inverted clickable indicationColor={1} label="Dark Red" render={<a href="#" />} />
                <ObjectStatus
                    inverted
                    clickable
                    status="informative"
                    glyph="hint"
                    aria-label="Informative"
                    render={<a href="#" />}
                />
            </Row>
        </Rows>
    )
};

export const InvertedIndication: Story = {
    name: 'Inverted indication colors',
    render: () => (
        <Rows>
            <Row>
                {LEVELS.map((i) => (
                    <ObjectStatus key={i} inverted indicationColor={i} label={`Indication${i}`} />
                ))}
            </Row>
            <Row>
                {LEVELS.map((i) => (
                    <ObjectStatus
                        key={i}
                        inverted
                        clickable
                        indicationColor={i}
                        label={`Indication${i}`}
                        onClick={noop}
                        render={<div />}
                    />
                ))}
            </Row>
        </Rows>
    )
};

export const InvertedIndicationSecondary: Story = {
    name: 'Secondary set of indication colors',
    render: () => (
        <Rows>
            <Row>
                {LEVELS.map((i) => (
                    <ObjectStatus key={i} inverted secondaryIndication indicationColor={i} label={`Indication${i}b`} />
                ))}
            </Row>
            <Row>
                {LEVELS.map((i) => (
                    <ObjectStatus
                        key={i}
                        inverted
                        clickable
                        secondaryIndication
                        indicationColor={i}
                        label={`Indication${i}b`}
                        onClick={noop}
                        render={<div />}
                    />
                ))}
            </Row>
        </Rows>
    )
};

export const Large: Story = {
    parameters: {
        docs: { description: { story: 'For statuses that need to stand out, e.g. in the page header.' } }
    },
    render: () => (
        <Rows>
            <Row>
                {STATUSES.map((s) => (
                    <ObjectStatus key={s.label} large status={s.status} glyph={s.glyph} label={s.label} />
                ))}
                <ObjectStatus large label="Neutral" />
            </Row>
            <Row>
                {NUMBERS.map((n) => (
                    <ObjectStatus key={n.label} large status={n.status} label={n.label} />
                ))}
                <ObjectStatus large indicationColor={1} label="Dark Red" />
                <ObjectStatus large status="informative" glyph="hint" glyphAriaLabel="Info" />
            </Row>
            <Row>
                <ObjectStatus large inverted status="negative" label="Inverted Negative" />
                <ObjectStatus large inverted status="critical" label="Inverted Warning" />
                <ObjectStatus large inverted status="positive" label="Inverted Success" />
                {STATUSES.map((s) => (
                    <ObjectStatus
                        key={s.label}
                        large
                        inverted
                        status={s.status}
                        glyph={s.glyph}
                        glyphAriaLabel={s.label}
                    />
                ))}
            </Row>
            <Row>
                {[...STATUSES, { ...NEUTRAL, glyph: '' }].map((s) => (
                    <ObjectStatus
                        key={s.label}
                        large
                        inverted
                        clickable
                        status={s.status}
                        glyph={s.glyph}
                        label={s.label}
                        onClick={noop}
                        render={<div />}
                    />
                ))}
            </Row>
        </Rows>
    )
};

export const Truncated: Story = {
    name: 'Truncated',
    render: () => (
        <div className="flex flex-col items-start gap-4">
            <ObjectStatus
                className="max-w-60"
                status="negative"
                glyph="error"
                label="Default behaviour of Object Status with very long text. The text goes on multiple lines."
            />
            <ObjectStatus
                className="max-w-60"
                truncate
                status="critical"
                glyph="alert"
                label="Object Status with text truncation with ellipsis"
            />
            <ObjectStatus
                className="max-w-60"
                truncate
                inverted
                status="negative"
                label="Inverted Negative with very, very long text which truncates"
            />
            <ObjectStatus
                className="max-w-60"
                truncate
                large
                status="positive"
                glyph="sys-enter-2"
                label="Positive with very, very long text which truncates"
            />
            <ObjectStatus
                className="max-w-60"
                truncate
                inverted
                clickable
                indicationColor={8}
                label="Indication8 with very, very long text which truncates"
                onClick={noop}
            />
        </div>
    )
};
