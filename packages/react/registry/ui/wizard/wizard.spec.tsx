import { createRef, useEffect, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Bar, BarRight } from '@/ui/bar/bar';
import { iconGlyphChar } from '@/ui/icon/icon';
import {
    Wizard,
    WizardContent,
    WizardNavigation,
    WizardNextStep,
    WizardProgressBar,
    WizardStep,
    WizardStepIndicator,
    type WizardStepInfo,
    type WizardStepStatus
} from './wizard';

const TEXT = 'Lorem ipsum dolor sit amet. '.repeat(40);

const statusesAt = (count: number, current: number): WizardStepStatus[] =>
    Array.from({ length: count }, (_, i) => (i < current ? 'completed' : i === current ? 'current' : 'upcoming'));

interface HostProps {
    labels?: string[];
    width?: string;
    append?: boolean;
    withSummary?: boolean;
    showSummary?: boolean;
    glyph?: string | null;
    branchingStep?: number;
    validator?: (visited: boolean, completed: boolean) => boolean;
    /** Makes this step current when it changes (as the Angular host's `go`). */
    target?: number;
    changes?: string[];
    statusRef?: { current: WizardStepStatus[] };
    onStepClick?: (step: WizardStepInfo) => void;
}

/** Mirrors the Angular test host: four steps, the last a summary, each with a next button. */
function Host({
    labels = ['One', 'Two', 'Three', 'Summary'],
    width = '1000px',
    append = true,
    withSummary = true,
    showSummary = false,
    glyph = null,
    branchingStep = -1,
    validator,
    target,
    changes,
    statusRef,
    onStepClick
}: HostProps) {
    const [status, setStatus] = useState(() => statusesAt(labels.length, 0));
    if (statusRef) statusRef.current = status;
    const go = (step: number) => setStatus(statusesAt(labels.length, step));
    useEffect(() => {
        if (target !== undefined) go(target);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target]);
    return (
        <div style={{ width }}>
            <Wizard contentHeight="300px" appendToWizard={append} displaySummaryStep={showSummary}>
                <WizardNavigation>
                    <WizardProgressBar size="sm" aria-label="Steps">
                        {labels.map((label, i) => (
                            <WizardStep
                                key={label}
                                status={status[i]}
                                onStatusChange={(next) => {
                                    changes?.push(`${i}:${next}`);
                                    setStatus((all) => all.map((s, j) => (j === i ? next : s)));
                                }}
                                label={label}
                                isSummary={i === labels.length - 1 && withSummary}
                                stepClickValidator={validator}
                                branching={i === branchingStep}
                                onStepClick={onStepClick}
                            >
                                <WizardStepIndicator glyph={i === 0 ? glyph : null}>{i + 1}</WizardStepIndicator>
                                <WizardContent>
                                    <h3>Content {i + 1}</h3>
                                    <p>{TEXT}</p>
                                    <WizardNextStep>
                                        <button onClick={() => go(i + 1)}>Next {i + 1}</button>
                                    </WizardNextStep>
                                </WizardContent>
                            </WizardStep>
                        ))}
                    </WizardProgressBar>
                </WizardNavigation>
            </Wizard>
        </div>
    );
}

function FloatingHost() {
    return (
        <Wizard contentHeight="300px" appendToWizard={false}>
            <WizardNavigation>
                <WizardProgressBar size="sm" aria-label="Steps">
                    <WizardStep defaultStatus="current" label="One">
                        <WizardStepIndicator>1</WizardStepIndicator>
                        <WizardContent>
                            <p>{TEXT}</p>
                            <WizardNextStep floating>
                                <button>Next</button>
                            </WizardNextStep>
                        </WizardContent>
                    </WizardStep>
                    <WizardStep label="Two">
                        <WizardStepIndicator>2</WizardStepIndicator>
                        <WizardContent>
                            <p>Two</p>
                        </WizardContent>
                    </WizardStep>
                </WizardProgressBar>
            </WizardNavigation>
            <Bar barDesign="floating-footer">
                <BarRight>
                    <button>Save</button>
                </BarRight>
            </Bar>
        </Wizard>
    );
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const stable = async () => {
    await frame();
    await frame();
};

async function setup(props: HostProps = {}) {
    const screen = await render(<Host {...props} />);
    await stable();
    const root = screen.container;
    const steps = () => [...root.querySelectorAll<HTMLElement>('li[data-status]')];
    return {
        screen,
        root,
        rerender: async (next: HostProps) => {
            await screen.rerender(<Host {...props} {...next} />);
            await stable();
        },
        steps,
        contents: () => [...root.querySelectorAll('[data-wizard-scroll] h3')].map((h) => h.textContent),
        statuses: () => steps().map((s) => s.getAttribute('data-status')),
        container: (index: number) => steps()[index]!.querySelector<HTMLElement>('[data-wizard-step-container]')!,
        scroller: () => root.querySelector<HTMLElement>('[data-wizard-scroll]')!
    };
}

describe('Wizard', () => {
    it('shows the steps in a list and the content of the current step', async () => {
        const { root, steps, contents, container } = await setup();
        expect(root.querySelector('[role=region]')!.getAttribute('aria-label')).toBe('Wizard');
        expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Wizard');
        expect(root.querySelector('ul')!.getAttribute('role')).toBe('list');
        // the summary is no step of the progress bar
        expect(steps()[3]!.style.display).toBe('none');
        expect(contents()).toEqual(['Content 1']);
        expect(container(0).getAttribute('aria-current')).toBe('step');
        expect(container(0).getAttribute('role')).toBe('button');
        expect(container(0).tabIndex).toBe(0);
        expect(container(1).tabIndex).toBe(-1);
        expect(container(1).getAttribute('aria-disabled')).toBe('true');
        // the content is a section named by the step, in the scrolling area
        const section = root.querySelector('[data-wizard-scroll] section')!;
        expect(section.getAttribute('aria-label')).toBe('One');
        expect(section.id).toBe(`${steps()[0]!.id}-content`);
    });

    it('appends the content of the steps as they become current', async () => {
        const statusRef = { current: [] as WizardStepStatus[] };
        const { root, steps, contents, scroller } = await setup({ statusRef });
        await userEvent.click(root.querySelector('[data-wizard-scroll] button')!);
        await stable();
        expect(contents()).toEqual(['Content 1', 'Content 2']);
        // the completed step's next button hides and its connector turns active
        const next = root.querySelector<HTMLElement>('[data-wizard-scroll] button')!.parentElement!;
        expect(next.style.display).toBe('none');
        expect(steps()[0]!.querySelector('[data-wizard-connector]')!.className).toContain(
            'border-sap-content-selected-foreground-color'
        );
        await wait(600);
        expect(scroller().scrollTop).toBeGreaterThan(0);
        // the focus moved into the new step
        expect(document.activeElement!.textContent).toBe('Next 2');
        expect(statusRef.current.slice(0, 2)).toEqual(['completed', 'current']);
    });

    it('goes back to a visited step when it is clicked', async () => {
        const changes: string[] = [];
        const statusRef = { current: [] as WizardStepStatus[] };
        const onStepClick = vi.fn();
        const { rerender, statuses, container } = await setup({ changes, statusRef, onStepClick });
        await rerender({ target: 2 });
        expect(container(2).getAttribute('aria-disabled')).toBeNull();
        await userEvent.click(container(0));
        await stable();
        expect(statuses()).toEqual(['current', 'upcoming', 'upcoming', 'upcoming']);
        expect(statusRef.current).toEqual(['current', 'upcoming', 'upcoming', 'upcoming']);
        expect(changes).toContain('0:current');
        expect(onStepClick).toHaveBeenCalledWith(expect.objectContaining({ label: 'One', index: 0 }));
        // an upcoming step that was visited can be clicked again
        await userEvent.click(container(2));
        await stable();
        expect(statuses()[2]).toBe('current');
    });

    it('asks the step click validator', async () => {
        const { rerender, statuses, container } = await setup();
        await rerender({ target: 1, validator: () => false });
        await userEvent.click(container(0));
        await stable();
        expect(statuses()[1]).toBe('current');
    });

    it('moves the focus between visited steps with the arrow keys', async () => {
        const { rerender, container, statuses } = await setup();
        await rerender({ target: 2 });
        container(2).focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(container(1));
        await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
        expect(document.activeElement).toBe(container(0));
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(container(1));
        await userEvent.keyboard('{Enter}');
        await stable();
        expect(statuses()[1]).toBe('current');
        // Space too
        container(0).focus();
        await userEvent.keyboard(' ');
        await stable();
        expect(statuses()[0]).toBe('current');
    });

    it('shows only the current step without appendToWizard', async () => {
        const { rerender, contents } = await setup({ append: false });
        await rerender({ target: 1 });
        expect(contents()).toEqual(['Content 2']);
    });

    it('replaces the steps by the summary', async () => {
        const { root, rerender, contents } = await setup();
        await rerender({ target: 3 });
        expect(contents()).toEqual(['Content 4']);
        expect(root.querySelector<HTMLElement>('ul')!.style.display).toBe('none');
        await rerender({ target: 1 });
        expect(root.querySelector<HTMLElement>('ul')!.style.display).toBe('');
        expect(contents()).toEqual(['Content 1', 'Content 2', 'Content 3']);
    });

    it('makes the step whose content scrolls to the top current', async () => {
        const statusRef = { current: [] as WizardStepStatus[] };
        const { rerender, statuses, scroller } = await setup({ statusRef });
        await rerender({ target: 2 });
        await wait(700);
        scroller().scrollTop = 0;
        scroller().dispatchEvent(new Event('scroll'));
        await stable();
        expect(statuses().slice(0, 3)).toEqual(['current', 'upcoming', 'upcoming']);
        expect(statusRef.current[0]).toBe('current');
    });

    it('stacks steps that do not fit and lists them in the indicator', async () => {
        const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        const { root, rerender, steps } = await setup({ width: '600px', labels, withSummary: false });
        await rerender({ target: 3 });
        const stacked = steps().filter((step) => step.hasAttribute('data-stacked'));
        expect(stacked.length).toBeGreaterThan(0);
        const labelled = steps().filter((step) => !step.hasAttribute('data-stacked'));
        for (const step of labelled) expect(step.getBoundingClientRect().width).toBeGreaterThanOrEqual(167);
        const trigger = root.querySelector<HTMLElement>('[aria-haspopup=menu]')!;
        expect(trigger.textContent).toContain('Steps');
        await userEvent.click(trigger);
        await stable();
        const items = [...document.querySelectorAll('[role=menu] [role=menuitem]')].map((item) =>
            item.textContent!.trim()
        );
        expect(items.length).toBeGreaterThan(1);
        expect(items).toContain('C');
        // a visited step in the list goes back to it
        const c = [...document.querySelectorAll<HTMLElement>('[role=menuitem]')].find(
            (item) => item.textContent!.trim() === 'C'
        )!;
        await userEvent.click(c);
        await stable();
        expect(steps()[2]!.getAttribute('data-status')).toBe('current');
    });

    describe('more', () => {
        afterEach(() => document.documentElement.removeAttribute('dir'));

        it('shows the glyph of a step indicator', async () => {
            const { root, rerender } = await setup();
            await rerender({ glyph: 'product' });
            const icons = root.querySelectorAll<HTMLElement>('li [data-glyph]');
            expect(icons).toHaveLength(1);
            expect(icons[0]!.getAttribute('data-glyph')).toBe(iconGlyphChar('product'));
        });

        it('gives stacked steps their labels back when the wizard grows', async () => {
            const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
            const { root, rerender } = await setup({ width: '600px', labels, withSummary: false });
            await rerender({ target: 3 });
            const stacked = () => root.querySelectorAll('li[data-stacked]').length;
            expect(stacked()).toBeGreaterThan(0);
            await rerender({ target: 3, width: '1400px' });
            await wait(100);
            await stable();
            expect(stacked()).toBe(0);
            expect(root.querySelector('[aria-haspopup=menu]')).toBeNull();
        });

        it('keeps the summary in the progress bar with displaySummaryStep', async () => {
            const { root, rerender, steps, contents } = await setup({ showSummary: true });
            expect(steps()[3]!.style.display).toBe('');
            await rerender({ target: 3 });
            expect(root.querySelector<HTMLElement>('ul')!.style.display).toBe('');
            expect(steps()[3]!.getAttribute('data-status')).toBe('current');
            expect(contents()).toEqual(['Content 1', 'Content 2', 'Content 3', 'Content 4']);
        });

        it('draws a dashed connector after a branching step', async () => {
            const { rerender, steps } = await setup({ withSummary: false, branchingStep: 3 });
            const connector = (step: HTMLElement) => step.querySelector<HTMLElement>('[data-wizard-connector]');
            expect(getComputedStyle(connector(steps()[0]!)!).borderBottomStyle).toBe('solid');
            // the last step has a connector only when it branches
            expect(getComputedStyle(connector(steps()[3]!)!).borderBottomStyle).toBe('dashed');
            await rerender({ branchingStep: -1 });
            expect(connector(steps()[3]!)).toBeNull();
        });

        it('keeps a floating next step above the floating footer', async () => {
            const screen = await render(<FloatingHost />);
            await stable();
            const root = screen.container;
            const next = root.querySelector<HTMLElement>('[data-wizard-scroll] button')!.getBoundingClientRect();
            const footer = root.querySelector<HTMLElement>('[role=toolbar]')!.getBoundingClientRect();
            const scroller = root.querySelector<HTMLElement>('[data-wizard-scroll]')!.getBoundingClientRect();
            expect(next.height).toBeGreaterThan(0);
            expect(next.bottom).toBeLessThanOrEqual(footer.top);
            expect(next.bottom).toBeLessThanOrEqual(scroller.bottom);
            expect(next.top).toBeGreaterThanOrEqual(scroller.top);
        });

        it('mirrors the arrow keys between steps in RTL', async () => {
            document.documentElement.setAttribute('dir', 'rtl');
            const { rerender, container } = await setup();
            await rerender({ target: 2 });
            container(2).focus();
            await userEvent.keyboard('{ArrowRight}');
            expect(document.activeElement).toBe(container(1));
            await userEvent.keyboard('{ArrowRight}');
            expect(document.activeElement).toBe(container(0));
            await userEvent.keyboard('{ArrowLeft}');
            expect(document.activeElement).toBe(container(1));
        });

        it('keeps its own status without a status prop (uncontrolled)', async () => {
            const onStatusChange = vi.fn();
            const screen = await render(
                <Wizard contentHeight="200px">
                    <WizardNavigation>
                        <WizardProgressBar aria-label="Steps">
                            <WizardStep defaultStatus="current" label="One">
                                <WizardStepIndicator>1</WizardStepIndicator>
                                <WizardContent>One</WizardContent>
                            </WizardStep>
                            <WizardStep defaultStatus="upcoming" label="Two" onStatusChange={onStatusChange}>
                                <WizardStepIndicator>2</WizardStepIndicator>
                                <WizardContent>Two</WizardContent>
                            </WizardStep>
                        </WizardProgressBar>
                    </WizardNavigation>
                </Wizard>
            );
            await stable();
            const statuses = () =>
                [...screen.container.querySelectorAll('li')].map((li) => li.getAttribute('data-status'));
            expect(statuses()).toEqual(['current', 'upcoming']);
            // an upcoming step that was never visited cannot be clicked
            await userEvent.click(screen.container.querySelectorAll<HTMLElement>('[data-wizard-step-container]')[1]!, {
                force: true
            });
            expect(statuses()).toEqual(['current', 'upcoming']);
            expect(onStatusChange).not.toHaveBeenCalled();
        });
    });

    // fundamental-react's tests
    describe('parts', () => {
        it('renders the content of a step and passes native props, className and ref to the wizard', async () => {
            const ref = createRef<HTMLDivElement>();
            const screen = await render(
                <Wizard data-sample="Sample" className="custom" ref={ref}>
                    <WizardNavigation data-sample="Nav">
                        <WizardProgressBar data-sample="Bar">
                            <WizardStep data-sample="Step" defaultStatus="current" label="Foo">
                                <WizardStepIndicator data-sample="Indicator">F</WizardStepIndicator>
                                <WizardContent data-sample="Content">
                                    <span className="data">content</span>
                                </WizardContent>
                            </WizardStep>
                        </WizardProgressBar>
                    </WizardNavigation>
                </Wizard>
            );
            await stable();
            const root = screen.container.querySelector<HTMLElement>('[role=region]')!;
            expect(ref.current).toBe(root);
            expect(root.getAttribute('data-sample')).toBe('Sample');
            expect(root.className).toContain('custom');
            expect(root.querySelector('[data-wizard-scroll] .data')!.textContent).toBe('content');
            expect(root.querySelector('nav')!.getAttribute('data-sample')).toBe('Nav');
            expect(root.querySelector('ul')!.getAttribute('data-sample')).toBe('Bar');
            expect(root.querySelector('li')!.getAttribute('data-sample')).toBe('Step');
            expect(root.querySelector('[data-wizard-scroll] section')!.getAttribute('data-sample')).toBe('Content');
            const indicator = root.querySelector<HTMLElement>('[data-sample=Indicator]')!;
            expect(indicator.textContent).toBe('F');
            expect(root.querySelector('li')!.textContent).toContain('Foo');
        });

        it('renders an icon only when the indicator has a glyph', async () => {
            const screen = await render(
                <Wizard>
                    <WizardNavigation>
                        <WizardProgressBar>
                            <WizardStep label="Foo">
                                <WizardStepIndicator />
                            </WizardStep>
                            <WizardStep label="Bar">
                                <WizardStepIndicator glyph="accept" />
                            </WizardStep>
                        </WizardProgressBar>
                    </WizardNavigation>
                </Wizard>
            );
            const steps = screen.container.querySelectorAll('li');
            expect(steps[0]!.querySelector('[data-glyph]')).toBeNull();
            expect(steps[1]!.querySelector('[data-glyph]')).not.toBeNull();
        });

        it('renders the parts in place outside a wizard', async () => {
            const screen = await render(
                <div>
                    <WizardNavigation aria-label="Steps">
                        <WizardProgressBar size="md">
                            <WizardStep label="Foo" status="current">
                                <WizardStepIndicator>1</WizardStepIndicator>
                            </WizardStep>
                        </WizardProgressBar>
                    </WizardNavigation>
                    <WizardContent size="md" contentBackground="list">
                        content
                        <WizardNextStep>
                            <button>Next</button>
                        </WizardNextStep>
                    </WizardContent>
                </div>
            );
            expect(screen.container.querySelector('nav')!.getAttribute('aria-label')).toBe('Steps');
            expect(screen.container.querySelector('ul')!.className).toContain('px-8');
            expect(screen.container.querySelector('section')!.textContent).toBe('contentNext');
            expect(screen.container.querySelector('section')!.className).toContain('bg-sap-group-content-background');
            expect(screen.container.querySelector('li')!.getAttribute('data-status')).toBe('current');
        });
    });
});
