import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Bar, BarElement, BarRight, ButtonBar } from '@/ui/bar/bar';
import { Button } from '@/ui/button/button';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogPopup, DialogTitle } from '@/ui/dialog/dialog';
import { FormItem, FormLabel } from '@/ui/form/form';
import { Input } from '@/ui/input/input';
import { Link } from '@/ui/link/link';
import { MessageStrip } from '@/ui/message-strip/message-strip';
import { Radio, RadioGroup } from '@/ui/radio/radio';
import { Select, SelectOption } from '@/ui/select/select';
import { Skeleton } from '@/ui/skeleton/skeleton';
import { Title } from '@/ui/title/title';
import {
    Wizard,
    WizardContent,
    WizardNavigation,
    WizardNextStep,
    WizardProgressBar,
    WizardStep,
    WizardStepIndicator,
    type WizardContentBackground,
    type WizardProps,
    type WizardSize,
    type WizardStepStatus
} from './wizard';

const LOREM =
    'Sed fermentum, mi et tristique ullamcorper, sapien sapien faucibus sem, quis pretium nibh lorem malesuada diam. Nulla quis arcu aliquet, feugiat massa semper, volutpat diam. Nam vitae ante posuere, molestie neque sit amet, dapibus velit. Maecenas eleifend tempor lorem. Mauris vitae elementum mi, sed eleifend ligula. ';
const TEXT = 'font-sap-font-family text-sap-font-size text-sap-text-color';

/** Statuses of `count` steps with the step at `current` current. */
const statuses = (count: number, current: number): WizardStepStatus[] =>
    Array.from({ length: count }, (_, i) => (i < current ? 'completed' : i === current ? 'current' : 'upcoming'));

/** A heading of step content: an h3 in header size 4, as Angular's stories. */
const StepTitle = ({ children }: { children: ReactNode }) => (
    <Title level={3} headerSize={4} className="mb-4">
        {children}
    </Title>
);

const meta = {
    title: 'Components/Wizard',
    component: Wizard,
    parameters: {
        layout: 'fullscreen',
        docs: {
            story: { inline: false, iframeHeight: 640 },
            description: {
                component:
                    'A wizard breaks a long task into steps. The progress bar shows them; the content of the visited steps shows one below the other and scrolling it updates the current step ' +
                    '(with `appendToWizard={false}` only the current step shows). Visited steps can be clicked to go back; in the progress bar the steps form one tab stop and Left and Right move between the visited ones. ' +
                    'A summary step replaces the steps at the end unless `displaySummaryStep` is set. On narrow screens the steps stack and the indicator next to them lists them in an action sheet.\n\n' +
                    '```tsx\n' +
                    '<Wizard contentHeight="26rem">\n' +
                    '    <WizardNavigation>\n' +
                    '        <WizardProgressBar size="lg" aria-label="Steps">\n' +
                    '            <WizardStep status={status[0]} onStatusChange={(s) => update(0, s)} label="Product type">\n' +
                    '                <WizardStepIndicator glyph="product" />\n' +
                    '                <WizardContent size="lg">\n' +
                    '                    …\n' +
                    '                    <WizardNextStep><Button variant="emphasized" label="Step 2" onClick={() => go(1)} /></WizardNextStep>\n' +
                    '                </WizardContent>\n' +
                    '            </WizardStep>\n' +
                    '        </WizardProgressBar>\n' +
                    '    </WizardNavigation>\n' +
                    '    <Bar barDesign="footer">…</Bar>\n' +
                    '</Wizard>\n' +
                    '```'
            }
        }
    },
    args: {
        appendToWizard: true,
        contentHeight: '26rem',
        responsivePaddings: false,
        displaySummaryStep: false
    }
} satisfies Meta<typeof Wizard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Angular's default example: five steps with glyphs, a form, an optional step and a summary. */
function DefaultWizard(props: WizardProps) {
    const [status, setStatus] = useState(() => statuses(5, 0));
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const go = (step: number) => setStatus(statuses(5, step));
    const sync = (index: number) => (next: WizardStepStatus) =>
        setStatus((all) => all.map((s, i) => (i === index ? next : s)));
    return (
        <Wizard contentHeight="26rem" {...props}>
            <WizardNavigation>
                <WizardProgressBar size="lg" aria-label="Wizard steps">
                    <WizardStep
                        status={status[0]}
                        onStatusChange={sync(0)}
                        label="Product Type"
                        aria-label="Step 1: Product Type"
                    >
                        <WizardStepIndicator glyph="product" />
                        <WizardContent size="lg">
                            <StepTitle>1. Product Type</StepTitle>
                            <MessageStrip type="information" dismissible={false} className="mb-4">
                                The wizard breaks a large task into smaller steps that are easier to work with.
                            </MessageStrip>
                            <p className="m-0">{LOREM.repeat(3)}</p>
                            <WizardNextStep>
                                <Button variant="emphasized" label="Step 2" onClick={() => go(1)} />
                            </WizardNextStep>
                        </WizardContent>
                    </WizardStep>
                    <WizardStep
                        status={status[1]}
                        onStatusChange={sync(1)}
                        label="Customer Information"
                        aria-label="Step 2: Customer Information"
                    >
                        <WizardStepIndicator glyph="user-edit" />
                        <WizardContent size="lg">
                            <StepTitle>2. Customer Information</StepTitle>
                            <MessageStrip type="information" dismissible={false} className="mb-4">
                                The next step stays disabled until the required fields are filled.
                            </MessageStrip>
                            <FormItem className="mb-2">
                                <FormLabel required htmlFor="wizard-name">
                                    Full name
                                </FormLabel>
                                <Input
                                    id="wizard-name"
                                    value={name}
                                    onValueChange={(value) => setName(value)}
                                    autoComplete="off"
                                />
                            </FormItem>
                            <FormItem>
                                <FormLabel required htmlFor="wizard-address">
                                    Address
                                </FormLabel>
                                <Input
                                    id="wizard-address"
                                    value={address}
                                    onValueChange={(value) => setAddress(value)}
                                    autoComplete="off"
                                />
                            </FormItem>
                            <WizardNextStep>
                                <Button
                                    variant="emphasized"
                                    label="Step 3"
                                    disabled={!name || !address}
                                    onClick={() => go(2)}
                                />
                            </WizardNextStep>
                        </WizardContent>
                    </WizardStep>
                    <WizardStep
                        status={status[2]}
                        onStatusChange={sync(2)}
                        label="Additional Information"
                        optionalText="(Optional)"
                        aria-label="Step 3: Additional Information"
                    >
                        <WizardStepIndicator glyph="accelerated" />
                        <WizardContent size="lg">
                            <StepTitle>3. Additional Information</StepTitle>
                            <p className="m-0">{LOREM.repeat(4)}</p>
                            <WizardNextStep>
                                <Button variant="emphasized" label="Step 4" onClick={() => go(3)} />
                            </WizardNextStep>
                        </WizardContent>
                    </WizardStep>
                    <WizardStep
                        status={status[3]}
                        onStatusChange={sync(3)}
                        label="Payment Details"
                        aria-label="Step 4: Payment Details"
                    >
                        <WizardStepIndicator glyph="credit-card" />
                        <WizardContent size="lg">
                            <StepTitle>4. Payment Details</StepTitle>
                            <p className="m-0">{LOREM.repeat(4)}</p>
                            <WizardNextStep>
                                <Button variant="emphasized" label="Review" onClick={() => go(4)} />
                            </WizardNextStep>
                        </WizardContent>
                    </WizardStep>
                    <WizardStep status={status[4]} onStatusChange={sync(4)} label="Summary" isSummary>
                        <WizardStepIndicator glyph="sys-enter-2" />
                        <WizardContent size="lg">
                            <StepTitle>Summary</StepTitle>
                            <p className="m-0 mb-2">
                                Customer: {name || '-'}, {address || '-'}
                            </p>
                            <p className="m-0 mb-2">
                                <Link
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        go(1);
                                    }}
                                >
                                    Edit the customer information
                                </Link>
                            </p>
                            <p className="m-0">{LOREM}</p>
                        </WizardContent>
                    </WizardStep>
                </WizardProgressBar>
            </WizardNavigation>
        </Wizard>
    );
}

export const Playground: Story = {
    render: (args) => <DefaultWizard {...args} />
};

export const Default: Story = {
    name: 'Default',
    parameters: {
        docs: {
            description: {
                story: 'The content of the visited steps shows one below the other; scrolling it makes the step at the top current. The summary replaces the steps at the end.'
            }
        }
    },
    render: () => <DefaultWizard />
};

export const CurrentStepOnly: Story = {
    name: 'Current step only',
    render: () => <DefaultWizard appendToWizard={false} />
};

/** Angular's branching example: the payment type decides the second step; the summary stays a step. */
function BranchingWizard() {
    const [status, setStatus] = useState(() => statuses(3, 0));
    const [payment, setPayment] = useState('card');
    const go = (step: number) => setStatus(statuses(3, step));
    const sync = (index: number) => (next: WizardStepStatus) => {
        if (next === 'current') go(index);
    };
    const details = payment === 'card' ? 'Card Details' : 'Bank Details';
    return (
        <Wizard contentHeight="26rem" displaySummaryStep>
            <WizardNavigation>
                <WizardProgressBar size="md" aria-label="Order steps">
                    <WizardStep status={status[0]} onStatusChange={sync(0)} label="Payment Type" branching>
                        <WizardStepIndicator>1</WizardStepIndicator>
                        <WizardContent size="md">
                            <StepTitle>1. Payment Type</StepTitle>
                            <RadioGroup
                                aria-label="Payment type"
                                value={payment}
                                onValueChange={(value) => setPayment(value as string)}
                            >
                                <Radio value="card">Credit card</Radio>
                                <Radio value="bank">Bank transfer</Radio>
                            </RadioGroup>
                            <WizardNextStep>
                                <Button variant="emphasized" label="Next" onClick={() => go(1)} />
                            </WizardNextStep>
                        </WizardContent>
                    </WizardStep>
                    <WizardStep key={payment} status={status[1]} onStatusChange={sync(1)} label={details}>
                        <WizardStepIndicator>2</WizardStepIndicator>
                        <WizardContent size="md">
                            <StepTitle>2. {details}</StepTitle>
                            <p className="m-0">{LOREM.repeat(2)}</p>
                            <WizardNextStep>
                                <Button variant="emphasized" label="Next" onClick={() => go(2)} />
                            </WizardNextStep>
                        </WizardContent>
                    </WizardStep>
                    <WizardStep status={status[2]} onStatusChange={sync(2)} label="Summary" isSummary>
                        <WizardStepIndicator>3</WizardStepIndicator>
                        <WizardContent size="md">
                            <StepTitle>3. Summary</StepTitle>
                            <p className="m-0">Paying by {payment === 'card' ? 'credit card' : 'bank transfer'}.</p>
                        </WizardContent>
                    </WizardStep>
                </WizardProgressBar>
            </WizardNavigation>
        </Wizard>
    );
}

export const Branching: Story = {
    name: 'Branching steps and a visible summary',
    render: () => <BranchingWizard />
};

const NARROW_STEPS = ['Account', 'Profile', 'Address', 'Contacts', 'Payment', 'Shipping', 'Review'];

/** Angular's narrow example: seven steps in a narrow wizard stack; a footer moves between them. */
function NarrowWizard() {
    const [current, setCurrent] = useState(3);
    const status = statuses(NARROW_STEPS.length, current);
    return (
        <div className="max-w-[38rem] border border-solid border-sap-group-title-border-color">
            <Wizard contentHeight="22rem" appendToWizard={false}>
                <WizardNavigation>
                    <WizardProgressBar size="sm" aria-label="Setup steps">
                        {NARROW_STEPS.map((step, i) => (
                            <WizardStep
                                key={step}
                                status={status[i]}
                                onStatusChange={(next) => next === 'current' && setCurrent(i)}
                                label={step}
                            >
                                <WizardStepIndicator>{i + 1}</WizardStepIndicator>
                                <WizardContent size="sm">
                                    <StepTitle>
                                        {i + 1}. {step}
                                    </StepTitle>
                                    <p className="m-0">{LOREM}</p>
                                </WizardContent>
                            </WizardStep>
                        ))}
                    </WizardProgressBar>
                </WizardNavigation>
                <Bar barDesign="footer" aria-label="Wizard actions">
                    <BarRight>
                        <BarElement>
                            <Button label="Previous" disabled={current === 0} onClick={() => setCurrent(current - 1)} />
                        </BarElement>
                        <BarElement>
                            <Button
                                variant="emphasized"
                                label="Next"
                                disabled={current === NARROW_STEPS.length - 1}
                                onClick={() => setCurrent(current + 1)}
                            />
                        </BarElement>
                    </BarRight>
                </Bar>
            </Wizard>
        </div>
    );
}

export const Narrow: Story = {
    name: 'Stacked steps and a footer',
    render: () => <NarrowWizard />
};

/** Angular's (upstream's) customizable example: solid content background, mixed sizes, compact next buttons. */
function CustomizableWizard() {
    const steps = ['Solid background', 'Medium content', 'Last step'];
    const [current, setCurrent] = useState(0);
    const status = statuses(steps.length, current);
    return (
        <Wizard contentHeight="20rem" appendToWizard={false}>
            <WizardNavigation>
                <WizardProgressBar size="sm" aria-label="Wizard steps">
                    {steps.map((step, i) => (
                        <WizardStep
                            key={step}
                            status={status[i]}
                            onStatusChange={(next) => next === 'current' && setCurrent(i)}
                            label={step}
                        >
                            {i === 0 ? (
                                <WizardStepIndicator glyph="accept" />
                            ) : (
                                <WizardStepIndicator>{i + 1}</WizardStepIndicator>
                            )}
                            <WizardContent size="md" contentBackground={i === 0 ? 'solid' : null}>
                                <StepTitle>
                                    {i + 1}. {step}
                                </StepTitle>
                                <p className="m-0">{LOREM}</p>
                                {i < steps.length - 1 && (
                                    <WizardNextStep>
                                        <Button
                                            data-density="compact"
                                            variant="emphasized"
                                            label={`Go to step ${i + 2}`}
                                            onClick={() => setCurrent(i + 1)}
                                        />
                                    </WizardNextStep>
                                )}
                            </WizardContent>
                        </WizardStep>
                    ))}
                </WizardProgressBar>
            </WizardNavigation>
            <Bar barDesign="footer" aria-label="Wizard actions">
                <BarRight>
                    <ButtonBar variant="emphasized" label="Save" />
                    <ButtonBar label="Cancel" />
                </BarRight>
            </Bar>
        </Wizard>
    );
}

export const Customizable: Story = {
    name: 'Customizable',
    render: () => <CustomizableWizard />
};

/** Angular's (upstream's) mobile example: a small wizard with a floating footer and floating next buttons. */
function MobileWizard() {
    const steps = ['Account', 'Profile', 'Review'];
    const [current, setCurrent] = useState(0);
    const status = statuses(steps.length, current);
    return (
        <div className="relative max-w-[24rem] border border-solid border-sap-group-title-border-color">
            <Wizard contentHeight="24rem" appendToWizard={false}>
                <WizardNavigation>
                    <WizardProgressBar size="sm" aria-label="Mobile wizard steps">
                        {steps.map((step, i) => (
                            <WizardStep
                                key={step}
                                status={status[i]}
                                onStatusChange={(next) => next === 'current' && setCurrent(i)}
                                label={step}
                            >
                                <WizardStepIndicator>{i + 1}</WizardStepIndicator>
                                <WizardContent size="sm">
                                    <StepTitle>
                                        {i + 1}. {step}
                                    </StepTitle>
                                    <p className="m-0">{LOREM}</p>
                                    <WizardNextStep floating>
                                        <Button
                                            variant="emphasized"
                                            label={i < steps.length - 1 ? `Go to step ${i + 2}` : 'Submit'}
                                            onClick={() => i < steps.length - 1 && setCurrent(i + 1)}
                                        />
                                    </WizardNextStep>
                                </WizardContent>
                            </WizardStep>
                        ))}
                    </WizardProgressBar>
                </WizardNavigation>
                <Bar barDesign="floating-footer" aria-label="Wizard actions">
                    <BarRight>
                        <ButtonBar variant="emphasized" label="Save" />
                        <ButtonBar label="Cancel" />
                    </BarRight>
                </Bar>
            </Wizard>
        </div>
    );
}

export const Mobile: Story = {
    name: 'Mobile, floating footer',
    render: () => <MobileWizard />
};

/** Angular's (upstream's) dialog example: current step only, a visible summary step, the actions in the footer. */
function DialogWizard() {
    const steps = ['Product Type', 'Customer Information', 'Payment Details', 'Summary'];
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState(0);
    const [name, setName] = useState('');
    const [result, setResult] = useState('');
    const status = statuses(steps.length, current);
    const close = (text: string) => {
        setOpen(false);
        setResult(text);
    };
    return (
        <div className="p-4">
            <Button
                label="Open wizard in dialog"
                onClick={() => {
                    setCurrent(0);
                    setOpen(true);
                }}
            />
            <p className={TEXT} aria-live="polite">
                {result}
            </p>
            <Dialog
                open={open}
                onOpenChange={(next, details) => (next ? setOpen(true) : close(`Wizard dismissed: ${details.reason}`))}
            >
                <DialogPopup width="48rem" aria-label="Checkout">
                    <DialogHeader>
                        <DialogTitle>Checkout</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Wizard contentHeight="18rem" appendToWizard={false} displaySummaryStep aria-label="Checkout">
                            <WizardNavigation>
                                <WizardProgressBar size="sm" aria-label="Checkout steps">
                                    {steps.map((step, i) => (
                                        <WizardStep
                                            key={step}
                                            status={status[i]}
                                            onStatusChange={(next) => next === 'current' && setCurrent(i)}
                                            label={step}
                                            isSummary={i === steps.length - 1}
                                        >
                                            <WizardStepIndicator>{i + 1}</WizardStepIndicator>
                                            <WizardContent size="sm">
                                                <StepTitle>
                                                    {i + 1}. {step}
                                                </StepTitle>
                                                {i === 1 ? (
                                                    <FormItem>
                                                        <FormLabel required htmlFor="wizard-dialog-name">
                                                            Full name
                                                        </FormLabel>
                                                        <Input
                                                            id="wizard-dialog-name"
                                                            value={name}
                                                            onValueChange={(value) => setName(value)}
                                                            autoComplete="off"
                                                        />
                                                    </FormItem>
                                                ) : i === steps.length - 1 ? (
                                                    <p className="m-0">Customer: {name || '-'}</p>
                                                ) : (
                                                    <p className="m-0">{LOREM}</p>
                                                )}
                                            </WizardContent>
                                        </WizardStep>
                                    ))}
                                </WizardProgressBar>
                            </WizardNavigation>
                        </Wizard>
                    </DialogBody>
                    <DialogFooter>
                        {current > 0 && <ButtonBar label="Previous step" onClick={() => setCurrent(current - 1)} />}
                        {current < steps.length - 1 ? (
                            <ButtonBar
                                variant="emphasized"
                                label={current === steps.length - 2 ? 'Review' : 'Next step'}
                                disabled={current === 1 && !name}
                                onClick={() => setCurrent(current + 1)}
                            />
                        ) : (
                            <ButtonBar
                                variant="emphasized"
                                label="Finish"
                                onClick={() => close('Wizard closed: Finished')}
                            />
                        )}
                        <ButtonBar label="Cancel" onClick={() => close('Wizard dismissed: Cancel')} />
                    </DialogFooter>
                </DialogPopup>
            </Dialog>
        </div>
    );
}

export const InDialog: Story = {
    name: 'In a dialog',
    render: () => <DialogWizard />
};

export const Loading: Story = {
    name: 'Loading',
    parameters: {
        docs: { description: { story: 'Skeletons in place of the step indicators and the content.' } }
    },
    render: () => (
        <Wizard contentHeight="16rem" aria-label="Loading wizard">
            <WizardNavigation>
                <WizardProgressBar size="lg" aria-label="Loading steps">
                    {[0, 1, 2].map((i) => (
                        <WizardStep
                            key={i}
                            defaultStatus={i === 0 ? 'current' : 'upcoming'}
                            aria-label={`Loading step ${i + 1}`}
                        >
                            <Skeleton type="rectangle" width="2rem" height="2rem" />
                            <WizardContent size="lg">
                                <Skeleton type="text" width="60%" />
                            </WizardContent>
                        </WizardStep>
                    ))}
                </WizardProgressBar>
            </WizardNavigation>
            <Bar barDesign="footer" aria-label="Wizard actions">
                <BarRight>
                    <ButtonBar label="Save" disabled />
                    <ButtonBar label="Cancel" />
                </BarRight>
            </Bar>
        </Wizard>
    )
};

// fundamental-react's examples: its integrated `Wizard` (titles, next buttons, a footer with Cancel and, in tabs
// mode, Previous and Next) built from the parts

interface FrStep {
    title: string;
    glyph?: string;
    optionalText?: string;
    nextLabel?: string;
    branching?: boolean;
    /** Moving to the next step is allowed (fundamental-react's `valid`). */
    valid?: boolean;
    content: ReactNode;
}

interface FrWizardProps {
    steps: FrStep[];
    /** `anchors` shows the visited steps one below the other, `tabs` one at a time with buttons in the footer. */
    navigationType?: 'anchors' | 'tabs';
    showTitles?: boolean;
    nextLabel?: string;
    previousLabel?: string;
    cancelLabel?: string;
    headerSize?: WizardSize;
    contentSize?: WizardSize;
    background?: WizardContentBackground;
    contentHeight?: string;
    label?: string;
    footer?: boolean;
    /** The step that is current at first. */
    initialStep?: number;
}

function FrWizard({
    steps,
    navigationType = 'anchors',
    showTitles = true,
    nextLabel = 'Next Step',
    previousLabel = 'Previous Step',
    cancelLabel = 'Cancel',
    headerSize = 'sm',
    contentSize = 'sm',
    background,
    contentHeight = '14rem',
    label = 'Wizard',
    footer = true,
    initialStep = 0
}: FrWizardProps) {
    const [current, setCurrent] = useState(initialStep);
    const [message, setMessage] = useState('');
    const index = Math.min(current, steps.length - 1);
    const status = statuses(steps.length, index);
    const tabs = navigationType === 'tabs';
    const next = (i: number) => (i < steps.length - 1 ? setCurrent(i + 1) : setMessage('Wizard completed'));
    const step = steps[index]!;
    return (
        <div>
            <Wizard contentHeight={contentHeight} appendToWizard={!tabs} aria-label={label}>
                <WizardNavigation>
                    <WizardProgressBar size={headerSize} aria-label={`${label} steps`}>
                        {steps.map((s, i) => (
                            <WizardStep
                                key={s.title}
                                status={status[i]}
                                onStatusChange={(value) => value === 'current' && setCurrent(i)}
                                label={s.title}
                                optionalText={s.optionalText}
                                branching={s.branching}
                            >
                                <WizardStepIndicator glyph={s.glyph ?? (i < index ? 'accept' : null)}>
                                    {s.glyph || i < index ? null : i + 1}
                                </WizardStepIndicator>
                                <WizardContent
                                    size={contentSize}
                                    contentBackground={background}
                                    // unique names when a page shows several wizards
                                    aria-label={label === 'Wizard' ? undefined : `${label}: ${s.title}`}
                                >
                                    {showTitles && <StepTitle>{`${i + 1}. ${s.title}`}</StepTitle>}
                                    {s.content}
                                    {!tabs && (
                                        <WizardNextStep>
                                            <Button
                                                data-density="compact"
                                                variant="emphasized"
                                                label={s.nextLabel ?? nextLabel}
                                                disabled={s.valid === false}
                                                onClick={() => next(i)}
                                            />
                                        </WizardNextStep>
                                    )}
                                </WizardContent>
                            </WizardStep>
                        ))}
                    </WizardProgressBar>
                </WizardNavigation>
                {footer && (
                    <Bar barDesign="footer" aria-label={`${label} actions`}>
                        <BarRight>
                            {tabs && index > 0 && (
                                <ButtonBar
                                    data-density="compact"
                                    label={previousLabel}
                                    onClick={() => setCurrent(index - 1)}
                                />
                            )}
                            {tabs && (
                                <ButtonBar
                                    data-density="compact"
                                    variant="emphasized"
                                    label={step.nextLabel ?? nextLabel}
                                    disabled={step.valid === false}
                                    onClick={() => next(index)}
                                />
                            )}
                            <ButtonBar
                                data-density="compact"
                                variant="transparent"
                                label={cancelLabel}
                                onClick={() => setMessage('Wizard cancelled')}
                            />
                        </BarRight>
                    </Bar>
                )}
            </Wizard>
            {footer && (
                <p className={`${TEXT} m-0 px-4 py-2`} aria-live="polite">
                    {message}
                </p>
            )}
        </div>
    );
}

const p = (text: string) => <p className="m-0">{text}</p>;
const THREE_STEPS: FrStep[] = [
    { title: 'First Step', content: p('This is the first step.') },
    { title: 'Second Step', content: p('This is the second step.') },
    { title: 'Final Step', content: p('This is the final step.') }
];
const GLYPH_STEPS: FrStep[] = [
    { title: 'Customer', glyph: 'person-placeholder', content: p('This is the customer step.') },
    { title: 'Contact', glyph: 'contacts', optionalText: '(Optional)', content: p('This is the contact step.') },
    { title: 'Payment', glyph: 'money-bills', content: p('This is the payment step.') },
    { title: 'Bill To', glyph: 'batch-payments', content: p('This is the billing step.') },
    { title: 'Ship To', glyph: 'shipping-status', content: p('This is the shipping step.') }
];
/** fundamental-styles' mobile example: seven steps in 300px. */
const MORE_GLYPH_STEPS: FrStep[] = [
    ...GLYPH_STEPS,
    { title: 'Products', glyph: 'product', content: p('This is the products step.') },
    { title: 'Additional Information', glyph: 'course-program', content: p('This is the last step.') }
];

export const AnchorsMode: Story = {
    name: 'Anchors mode',
    parameters: {
        docs: {
            description: {
                story: "fundamental-react's default navigation: the visited steps show one below the other (`appendToWizard`)."
            }
        }
    },
    render: () => <FrWizard steps={THREE_STEPS} />
};

export const TabsMode: Story = {
    name: 'Tabs mode',
    parameters: {
        docs: {
            description: {
                story: 'One step at a time (`appendToWizard={false}`), with Previous and Next in the footer.'
            }
        }
    },
    render: () => <FrWizard steps={THREE_STEPS} navigationType="tabs" />
};

export const CustomLabels: Story = {
    name: 'Custom labels',
    render: () => (
        <FrWizard
            cancelLabel="Exit"
            nextLabel="Go to next step"
            steps={THREE_STEPS.map((step, i) => (i === 2 ? { ...step, nextLabel: 'Complete' } : step))}
        />
    )
};

export const NoTitles: Story = {
    name: 'No titles',
    render: () => <FrWizard steps={THREE_STEPS} showTitles={false} />
};

export const Glyphs: Story = {
    name: 'Glyphs and optional text',
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' responsive example: the fourth step is current, the first three are completed."
            }
        }
    },
    render: () => <FrWizard steps={GLYPH_STEPS} initialStep={3} headerSize="xl" contentSize="xl" />
};

export const Stacked: Story = {
    name: 'Stacked',
    parameters: {
        docs: {
            description: {
                story: 'Steps stack by themselves when they are narrower than 168px (fundamental-react\'s `option="stacked"`); the indicator next to the stacked steps lists them. Seven steps in 300px, as fundamental-styles\' mobile example.'
            }
        }
    },
    render: () => (
        <div className="max-w-[300px]">
            <FrWizard steps={MORE_GLYPH_STEPS} navigationType="tabs" initialStep={3} contentHeight="16rem" />
        </div>
    )
};

function ValidatorWizard({ navigationType }: { navigationType: 'anchors' | 'tabs' }) {
    const [one, setOne] = useState(false);
    const [two, setTwo] = useState(false);
    return (
        <FrWizard
            navigationType={navigationType}
            steps={[
                {
                    title: 'First Step',
                    valid: one,
                    content: (
                        <Checkbox checked={one} onCheckedChange={setOne}>
                            Is valid?
                        </Checkbox>
                    )
                },
                {
                    title: 'Second Step',
                    valid: two,
                    content: (
                        <Checkbox checked={two} onCheckedChange={setTwo}>
                            Is valid?
                        </Checkbox>
                    )
                },
                { title: 'Final Step', nextLabel: 'Complete', content: p('This is the final step.') }
            ]}
        />
    );
}

export const Validator: Story = {
    name: 'Validation',
    parameters: {
        docs: { description: { story: 'The next button of a step stays disabled until its checkbox is checked.' } }
    },
    render: () => <ValidatorWizard navigationType="anchors" />
};

export const TabsModeValidator: Story = {
    name: 'Validation, tabs mode',
    render: () => <ValidatorWizard navigationType="tabs" />
};

function BranchingFrWizard({ navigationType }: { navigationType: 'anchors' | 'tabs' }) {
    const [branch, setBranch] = useState<string | null>(null);
    const [branch2, setBranch2] = useState<string | null>(null);
    const steps: FrStep[] = [
        {
            title: 'Branch choice',
            branching: !branch,
            valid: !!branch,
            content: (
                <Select aria-label="Branch" placeholder="Select a branch" value={branch} onValueChange={setBranch}>
                    <SelectOption value="one">One extra element</SelectOption>
                    <SelectOption value="two">Two extra elements</SelectOption>
                    <SelectOption value="none">Empty</SelectOption>
                    <SelectOption value="deep">Two level</SelectOption>
                </Select>
            )
        }
    ];
    if (branch === 'one') steps.push({ title: 'Single', content: p('Extra step') });
    if (branch === 'two')
        steps.push(
            { title: 'Double 1', content: p('Extra step 1') },
            { title: 'Double 2', content: p('Extra step 2') }
        );
    if (branch === 'deep') {
        steps.push({
            title: 'Deep branch choice',
            branching: !branch2,
            valid: !!branch2,
            content: (
                <Select
                    aria-label="Deep branch"
                    placeholder="Select a branch"
                    value={branch2}
                    onValueChange={setBranch2}
                >
                    <SelectOption value="1">Branch 1</SelectOption>
                    <SelectOption value="2">Branch 2</SelectOption>
                </Select>
            )
        });
        if (branch2) steps.push({ title: `Deep step ${branch2}`, content: p(`Deep step ${branch2}`) });
    }
    steps.push({ title: 'Finish', nextLabel: 'Complete', content: p('This is the final step.') });
    return <FrWizard steps={steps} navigationType={navigationType} contentHeight="18rem" />;
}

export const BranchingChoice: Story = {
    name: 'Branching choice',
    parameters: {
        docs: {
            description: {
                story: 'The choice in the first step adds steps; until it is made, the step is `branching` (a dashed connector).'
            }
        }
    },
    render: () => <BranchingFrWizard navigationType="anchors" />
};

export const TabsModeBranching: Story = {
    name: 'Branching choice, tabs mode',
    render: () => <BranchingFrWizard navigationType="tabs" />
};

export const Sizes: Story = {
    name: 'Sizes',
    parameters: {
        docs: { description: { story: 'Horizontal paddings of the progress bar and the content: sm, md, lg and xl.' } }
    },
    render: () => (
        <div className="flex flex-col gap-4">
            {(
                [
                    ['sm', 'Small'],
                    ['md', 'Medium'],
                    ['lg', 'Large'],
                    ['xl', 'XL']
                ] as const
            ).map(([size, name]) => (
                <section key={size} aria-label={name}>
                    <Title level={3} headerSize={4} className="m-0 px-4 py-2">
                        {name}
                    </Title>
                    <FrWizard
                        steps={THREE_STEPS}
                        headerSize={size}
                        contentSize={size}
                        contentHeight="8rem"
                        label={`${name} wizard`}
                        footer={false}
                    />
                </section>
            ))}
        </div>
    )
};

export const Backgrounds: Story = {
    name: 'Content backgrounds',
    render: () => (
        <div className="flex flex-col gap-4 bg-sap-shell-background p-4">
            {(
                [
                    ['solid', 'Solid'],
                    ['list', 'List'],
                    ['transparent', 'Transparent']
                ] as const
            ).map(([background, name]) => (
                <section key={background} aria-label={name}>
                    <Title level={3} headerSize={4} className="m-0 py-2">
                        {name}
                    </Title>
                    <FrWizard
                        steps={THREE_STEPS}
                        background={background}
                        headerSize="md"
                        contentSize="md"
                        contentHeight="8rem"
                        label={`${name} wizard`}
                        footer={false}
                    />
                </section>
            ))}
        </div>
    )
};

export const Manual: Story = {
    name: 'Fixed statuses',
    parameters: {
        docs: {
            description: {
                story: 'Statuses set by the app without `onStatusChange` stay as they are (fundamental-react\'s "manual" wizard): a completed, a current and an upcoming step.'
            }
        }
    },
    render: () => (
        <Wizard contentHeight="12rem" aria-label="Manual wizard">
            <WizardNavigation>
                <WizardProgressBar size="sm" aria-label="Manual wizard steps">
                    <WizardStep status="completed" label="First Step">
                        <WizardStepIndicator glyph="accept" />
                        <WizardContent size="sm">
                            <p className="m-0">This is the first step.</p>
                        </WizardContent>
                    </WizardStep>
                    <WizardStep status="current" label="Second Step">
                        <WizardStepIndicator>2</WizardStepIndicator>
                        <WizardContent size="sm">
                            <p className="m-0">This is content</p>
                            <WizardNextStep>
                                <Button data-density="compact" variant="emphasized" label="Next" />
                            </WizardNextStep>
                        </WizardContent>
                    </WizardStep>
                    <WizardStep status="upcoming" label="Final Step">
                        <WizardStepIndicator>3</WizardStepIndicator>
                        <WizardContent size="sm">
                            <p className="m-0">This is the final step.</p>
                        </WizardContent>
                    </WizardStep>
                </WizardProgressBar>
            </WizardNavigation>
            <Bar barDesign="footer" aria-label="Manual wizard actions">
                <BarRight>
                    <ButtonBar data-density="compact" variant="transparent" label="Custom" />
                    <ButtonBar data-density="compact" variant="transparent" label="Cancel" />
                </BarRight>
            </Bar>
        </Wizard>
    )
};

export const OpenDialog: Story = {
    name: 'Open: dialog',
    tags: ['!autodocs'],
    render: () => <DialogWizard />,
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open wizard in dialog' }));
        await waitFor(() => expect(document.querySelector('[role=dialog][data-open] [role=region]')).not.toBeNull());
        const animated = [...document.querySelectorAll<HTMLElement>('[role=dialog], [data-dialog-backdrop]')];
        await Promise.all(animated.flatMap((el) => el.getAnimations().map((a) => a.finished)));
    }
};

export const OpenStacked: Story = {
    name: 'Open: stacked steps',
    tags: ['!autodocs'],
    render: () => <NarrowWizard />,
    play: async ({ canvasElement }) => {
        let trigger: HTMLElement | null = null;
        await waitFor(() => {
            trigger = canvasElement.querySelector<HTMLElement>('li [aria-haspopup="menu"]');
            expect(trigger).not.toBeNull();
        });
        await userEvent.click(trigger!);
        await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menuitem'));
    }
};
