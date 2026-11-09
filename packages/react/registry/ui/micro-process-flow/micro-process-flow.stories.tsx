import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Icon } from '@/ui/icon/icon';
import { List, ListItem, ListLink, ListTitle } from '@/ui/list/list';
import { Popover, PopoverBody, PopoverTrigger } from '@/ui/popover/popover';
import { StatusIndicator } from '@/ui/status-indicator/status-indicator';
import { Title } from '@/ui/title/title';
import {
    MicroProcessFlow,
    MicroProcessFlowFocusableItem,
    MicroProcessFlowIcon,
    MicroProcessFlowIntermediaryItem,
    MicroProcessFlowItem,
    type MicroProcessFlowItemType
} from './micro-process-flow';

const EURO = [
    'M13,0.5c-6.6,0-12,5.4-12,12s5.4,12,12,12s12-5.4,12-12S19.6,0.5,13,0.5z M16.4,10.1L15.9,12h-5.3v0.3H16l-0.5,1.9h-4.6c0.5,1.3,1.6,2,3.1,2c0.8,0,1.5-0.2,2.2-0.7l0.7-0.6v2.7l-0.1,0.1c-0.9,0.4-1.8,0.6-2.6,0.6c-1.6,0-2.9-0.3-3.8-1c-0.9-0.7-1.5-1.7-2-3H6.4l0.5-1.9h1V12H6.4l0.5-1.9h1.3C8.6,8.9,9.3,8,10.3,7.3c1-0.8,2.3-1.1,3.8-1.1c1.1,0,2,0.2,2.8,0.7L17.3,7l-0.6,2.3l-0.5-0.4c-0.4-0.2-0.9-0.4-1.4-0.5c-0.6-0.1-1.1-0.1-1.7,0c-0.6,0.1-1,0.3-1.5,0.7c-0.3,0.3-0.6,0.6-0.7,1H16.4z'
];
const CART = [
    'M22.9,17.2c-1.7,0-3.2,1.2-3.5,2.8h-4.8c-0.4-1.6-1.8-2.8-3.6-2.8c-0.1,0-0.2,0-0.3,0l-0.5-1.7h16L30.5,5H7L5.8,1l0,0l0,0l0-0.1L5.6,0.9l-5-0.4l0.2,1.7l3.4,0.3l4.7,15.4c-0.9,0.7-1.5,1.7-1.5,2.9c0,2,1.6,3.7,3.7,3.7c1.7,0,3.2-1.2,3.6-2.8h4.8c0.4,1.6,1.8,2.8,3.5,2.8c2,0,3.7-1.6,3.7-3.7C26.6,18.8,24.9,17.2,22.9,17.2z'
];
const FACTORY = [
    'M19.6,12.9l0-3.7l-4.9,3.7V9.2l-5,3.9l-0.3,0l0-9.4H5.8v9.4H4.6V0.5H1l-0.3,24h23.6V9.3L19.6,12.9z M22.2,19.9H17v-2.4h5.2V19.9z'
];

const heading = 'mt-6 mb-2 first:mt-0';

interface Step {
    state: MicroProcessFlowItemType;
    glyph: string | null;
    label: string;
}

const STEPS: Step[] = [
    { state: 'none', glyph: null, label: 'Created' },
    { state: 'positive', glyph: 'pending', label: 'Pending' },
    { state: 'information', glyph: 'phone', label: 'Called' },
    { state: 'negative', glyph: 'map', label: 'Address rejected' },
    { state: 'critical', glyph: 'log', label: 'Logged' }
];

const MANY = Array.from({ length: 14 }, (_, i) => ({ ...STEPS[i % STEPS.length]!, label: `Step ${i + 1}` }));

const WIDTHS = [8, 4, 10, 10, 10];

/** The round, focusable icon of a step, named by its label (also the tooltip). */
const stepIcon = (step: Step) => (
    <MicroProcessFlowIcon focusable glyph={step.glyph} glyphAriaLabel={step.label} title={step.label} />
);

const INDICATORS = [
    { state: 'none', status: 'positive', path: CART, viewBox: '0 0 31 25', fill: 100, label: 'Cart' },
    { state: 'positive', status: 'positive', path: EURO, viewBox: '0 0 26 25', fill: 100, label: 'Payment' },
    { state: 'information', status: 'critical', path: FACTORY, viewBox: '0 0 25 25', fill: 60, label: 'Production' },
    { state: 'negative', status: 'negative', path: CART, viewBox: '0 0 31 25', fill: 20, label: 'Delivery' }
] as const;

const ACTIONS = ['Show details', 'Change owner', 'Cancel step'];

const meta = {
    title: 'Components/Micro Process Flow',
    component: MicroProcessFlow,
    parameters: {
        docs: {
            description: {
                component:
                    'A micro process flow shows the steps of a process in a compact row: round icons (or status ' +
                    'indicators) in value-state colours, joined by connectors that can be interrupted or carry an ' +
                    'object. Steps that do not fit are reached with the links at the ends, which show how many steps ' +
                    'are hidden. The flow is one tab stop; Left and Right move between the steps and scroll them into view.'
            }
        }
    }
} satisfies Meta<typeof MicroProcessFlow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
    render: () => (
        <>
            <Title level={3} headerSize={5} className={heading}>
                States, with an intermediate step
            </Title>
            <MicroProcessFlow>
                {STEPS.map((step, i) => (
                    <MicroProcessFlowItem key={step.label} state={step.state} intermediate={i === 1}>
                        {stepIcon(step)}
                    </MicroProcessFlowItem>
                ))}
            </MicroProcessFlow>

            <Title level={3} headerSize={5} className={heading}>
                Independent steps
            </Title>
            <MicroProcessFlow independentSteps>
                {STEPS.map((step) => (
                    <MicroProcessFlowItem key={step.label} state={step.state}>
                        {stepIcon(step)}
                    </MicroProcessFlowItem>
                ))}
            </MicroProcessFlow>

            <Title level={3} headerSize={5} className={heading}>
                Objects between the steps
            </Title>
            <MicroProcessFlow>
                {STEPS.map((step, i) => (
                    <MicroProcessFlowItem key={step.label} state={step.state}>
                        {stepIcon(step)}
                        {i < STEPS.length - 1 && (
                            <MicroProcessFlowIntermediaryItem
                                render={
                                    <Icon
                                        glyph="syringe"
                                        color="critical"
                                        className="text-[1.5rem]"
                                        aria-label="Vaccination"
                                    />
                                }
                            />
                        )}
                    </MicroProcessFlowItem>
                ))}
            </MicroProcessFlow>

            <Title level={3} headerSize={5} className={heading}>
                Custom widths
            </Title>
            <MicroProcessFlow>
                {STEPS.map((step, i) => (
                    <MicroProcessFlowItem key={step.label} state={step.state} style={{ width: `${WIDTHS[i]}rem` }}>
                        {stepIcon(step)}
                    </MicroProcessFlowItem>
                ))}
            </MicroProcessFlow>
        </>
    )
};

export const Overflow: Story = {
    render: () => (
        <>
            <Title level={3} headerSize={5} className={heading}>
                Default transition
            </Title>
            <MicroProcessFlow>
                {MANY.map((step) => (
                    <MicroProcessFlowItem key={step.label} state={step.state}>
                        {stepIcon(step)}
                    </MicroProcessFlowItem>
                ))}
            </MicroProcessFlow>

            <Title level={3} headerSize={5} className={heading}>
                Custom transition
            </Title>
            <MicroProcessFlow transitionSpeed={200} transitionTimingFunction="cubic-bezier(.4,.01,.165,.99)">
                {MANY.map((step) => (
                    <MicroProcessFlowItem key={step.label} state={step.state}>
                        {stepIcon(step)}
                    </MicroProcessFlowItem>
                ))}
            </MicroProcessFlow>
        </>
    )
};

export const OtherControls: Story = {
    name: 'Status indicators and popovers',
    render: () => (
        <>
            <Title level={3} headerSize={5} className={heading}>
                Status indicators
            </Title>
            <MicroProcessFlow>
                {INDICATORS.map((item) => (
                    <MicroProcessFlowItem key={item.label} state={item.state}>
                        <MicroProcessFlowFocusableItem
                            render={
                                <StatusIndicator
                                    status={item.status}
                                    path={[...item.path]}
                                    viewBox={item.viewBox}
                                    fillPercentage={item.fill}
                                    aria-label={item.label}
                                    aria-valuetext={`${item.fill}%`}
                                    title={`${item.label}: ${item.fill}%`}
                                />
                            }
                        />
                    </MicroProcessFlowItem>
                ))}
            </MicroProcessFlow>

            <Title level={3} headerSize={5} className={heading}>
                Steps with popovers
            </Title>
            <MicroProcessFlow>
                {STEPS.map((step) => (
                    <MicroProcessFlowItem key={step.label} state={step.state}>
                        <Popover placement="bottom">
                            <PopoverTrigger
                                nativeButton={false}
                                render={
                                    <MicroProcessFlowIcon
                                        focusable
                                        glyph={step.glyph}
                                        aria-label={step.label}
                                        title={step.label}
                                    />
                                }
                            />
                            <PopoverBody aria-label={step.label}>
                                <List aria-label={`${step.label} actions`}>
                                    {ACTIONS.map((action) => (
                                        <ListItem key={action}>
                                            <ListLink href="#" onClick={(event) => event.preventDefault()}>
                                                <ListTitle>{action}</ListTitle>
                                            </ListLink>
                                        </ListItem>
                                    ))}
                                </List>
                            </PopoverBody>
                        </Popover>
                    </MicroProcessFlowItem>
                ))}
            </MicroProcessFlow>
        </>
    )
};

export const OpenPopover: Story = {
    name: 'Open: popover',
    tags: ['!autodocs'],
    render: OtherControls.render,
    play: async ({ canvasElement }) => {
        const trigger = canvasElement.querySelector<HTMLElement>('[aria-haspopup]')!;
        await userEvent.click(trigger);
        await waitFor(() => {
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            expect(document.getElementById(trigger.getAttribute('aria-controls') ?? '')).not.toBeNull();
        });
    }
};
