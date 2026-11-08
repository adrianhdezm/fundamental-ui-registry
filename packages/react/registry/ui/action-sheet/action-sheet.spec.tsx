import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Button } from '@/ui/button/button';
import {
    ActionSheet,
    ActionSheetBody,
    ActionSheetControl,
    ActionSheetItem,
    type ActionSheetOpenChangeDetails,
    type ActionSheetProps
} from './action-sheet';

interface HostProps extends Omit<ActionSheetProps, 'open' | 'onOpenChange'> {
    onPick?: (action: string) => void;
    onChange?: (open: boolean, details: ActionSheetOpenChangeDetails) => void;
}

/** Mirrors the Angular test host: four actions, the second disabled, the last a close button. */
function Host({ onPick, onChange, ...sheet }: HostProps) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button data-testid="before">Before</button>
            <span data-testid="state">{open ? 'open' : 'closed'}</span>
            <ActionSheet
                {...sheet}
                open={open}
                onOpenChange={(next, details) => {
                    setOpen(next);
                    onChange?.(next, details);
                }}
            >
                <ActionSheetControl id="control">Actions</ActionSheetControl>
                <ActionSheetBody aria-label="Actions">
                    <ActionSheetItem label="One" onClick={() => onPick?.('one')} />
                    <ActionSheetItem label="Two" disabled />
                    <ActionSheetItem label="Three" />
                    <ActionSheetItem label="Close" isCloseButton />
                </ActionSheetBody>
            </ActionSheet>
        </div>
    );
}

const wait = (ms = 100) => new Promise((r) => setTimeout(r, ms));
const focused = () => document.activeElement!.textContent!.trim();
const menu = () => document.querySelector<HTMLElement>('[role=menu]');

async function setup(props: HostProps = {}) {
    const screen = await render(<Host {...props} />);
    const control = screen.container.querySelector<HTMLElement>('#control')!;
    const state = () => screen.container.querySelector('[data-testid=state]')!.textContent;
    await userEvent.click(control);
    await wait();
    return { screen, control, state };
}

describe('ActionSheet', () => {
    for (const mobile of [false, true]) {
        describe(mobile ? 'mobile' : 'popover', () => {
            it('opens a menu of actions and focuses the first one', async () => {
                const { state } = await setup({ mobile });
                expect(state()).toBe('open');
                expect(menu()!.getAttribute('aria-label')).toBe('Actions');
                expect(document.activeElement!.getAttribute('role')).toBe('menuitem');
                expect(focused()).toBe('One');
            });

            it('moves with the arrow keys over disabled actions and wraps', async () => {
                await setup({ mobile });
                await userEvent.keyboard('{ArrowDown}');
                expect(focused()).toBe('Three');
                await userEvent.keyboard('{ArrowDown}{ArrowDown}');
                expect(focused()).toBe('One');
                await userEvent.keyboard('{End}');
                expect(focused()).toBe('Close');
                await userEvent.keyboard('{Home}');
                expect(focused()).toBe('One');
                await userEvent.keyboard('{ArrowUp}');
                expect(focused()).toBe('Close');
            });

            it('keeps one tab stop: the focused action', async () => {
                await setup({ mobile });
                const tabStops = () =>
                    [...menu()!.querySelectorAll<HTMLElement>('[role=menuitem]')]
                        .filter((el) => el.tabIndex === 0)
                        .map((el) => el.textContent!.trim());
                expect(tabStops()).toEqual(['One']);
                await userEvent.keyboard('{ArrowDown}');
                expect(tabStops()).toEqual(['Three']);
            });

            it('closes on Escape and returns the focus to the control', async () => {
                const { control, state } = await setup({ mobile });
                await userEvent.keyboard('{Escape}');
                await wait();
                expect(state()).toBe('closed');
                expect(document.activeElement).toBe(control);
            });

            it('closes on Tab and returns the focus to the control', async () => {
                const onChange = vi.fn();
                const { control, state } = await setup({ mobile, onChange });
                await userEvent.keyboard('{ArrowDown}');
                await userEvent.keyboard('{Tab}');
                await wait();
                expect(state()).toBe('closed');
                expect(menu()).toBeNull();
                expect(document.activeElement).toBe(control);
                expect(onChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'tab-key' }));
            });

            it('closes with a close button', async () => {
                const onChange = vi.fn();
                const { state } = await setup({ mobile, onChange });
                await userEvent.keyboard('{End}{Enter}');
                await wait();
                expect(state()).toBe('closed');
                expect(onChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'item-press' }));
            });

            it('runs an action without closing unless it is a close button', async () => {
                const onPick = vi.fn();
                const { state } = await setup({ mobile, onPick });
                await userEvent.keyboard('{Enter}');
                await wait();
                expect(onPick).toHaveBeenCalledWith('one');
                expect(state()).toBe('open');
            });

            it('opens and closes with the control', async () => {
                const { control } = await setup({ mobile });
                expect(control.getAttribute('aria-haspopup')).toBe('menu');
                expect(control.getAttribute('aria-expanded')).toBe('true');
                if (!mobile) {
                    await userEvent.click(control);
                    await wait();
                    expect(menu()).toBeNull();
                    expect(control.getAttribute('aria-expanded')).toBe('false');
                }
            });
        });
    }

    it('mobile mode closes on a click on the block layer', async () => {
        const { state } = await setup({ mobile: true });
        await userEvent.click(document.body, { position: { x: 20, y: 20 } });
        await wait();
        expect(state()).toBe('closed');
    });

    it('mobile mode shows the actions in a modal sheet at the bottom of the screen', async () => {
        await setup({ mobile: true });
        const dialog = menu()!.closest<HTMLElement>('[role=dialog]')!;
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(dialog.getAttribute('aria-label')).toBe('Actions');
        const rect = dialog.getBoundingClientRect();
        expect(Math.round(rect.bottom)).toBe(window.innerHeight);
        expect(Math.round(rect.width)).toBe(document.documentElement.clientWidth);
    });

    it('mobile mode shows the control title as a heading of the given level', async () => {
        const { screen } = await setup({ mobile: true, controlTitle: 'Choose an action', controlTitleHeading: 3 });
        const heading = document.querySelector<HTMLElement>('[data-sheet-bar] [role=heading]')!;
        expect(heading.textContent!.trim()).toBe('Choose an action');
        expect(heading.getAttribute('aria-level')).toBe('3');
        // the title labels the sheet
        expect(menu()!.closest('[role=dialog]')!.getAttribute('aria-labelledby')).toBe(heading.id);

        await screen.rerender(<Host mobile controlTitle="Choose an action" controlTitleHeading={5} />);
        expect(document.querySelector('[data-sheet-bar] [role=heading]')!.getAttribute('aria-level')).toBe('5');
    });

    it('shows no title bar in the popover', async () => {
        await setup({ controlTitle: 'Choose an action' });
        expect(document.querySelector('[data-sheet-bar]')).toBeNull();
        // the list is the menu: the popover body has no role of its own
        expect(menu()!.closest('[role=dialog]')).toBeNull();
    });

    it('shows the popover with an arrow unless noArrow', async () => {
        const { screen } = await setup();
        const arrow = () => menu()!.closest('[data-side]')!.querySelector(':scope > [aria-hidden="true"]');
        expect(arrow()).not.toBeNull();
        await screen.rerender(<Host noArrow />);
        expect(arrow()).toBeNull();
    });

    it('places the popover below the control by default and on the given side', async () => {
        const { control, screen } = await setup();
        const body = () => menu()!.closest<HTMLElement>('[data-side]')!;
        expect(body().getAttribute('data-side')).toBe('bottom');
        expect(body().getBoundingClientRect().top).toBeGreaterThanOrEqual(control.getBoundingClientRect().bottom);
        await screen.rerender(<Host placement="right" />);
        await wait();
        expect(body().getAttribute('data-side')).toBe('right');
    });

    it('styles actions as transparent, start-aligned buttons and negative ones centred', async () => {
        await render(
            <ActionSheet defaultOpen>
                <ActionSheetControl>Actions</ActionSheetControl>
                <ActionSheetBody aria-label="Actions">
                    <ActionSheetItem label="Standard" glyph="download" />
                    <ActionSheetItem label="Emphasized" variant="emphasized" />
                    <ActionSheetItem label="Toggled" toggled />
                    <ActionSheetItem label="Cancel" negative />
                </ActionSheetBody>
            </ActionSheet>
        );
        await wait();
        const [standard, emphasized, toggled, cancel] = [...menu()!.querySelectorAll<HTMLElement>('[role=menuitem]')];
        expect(standard!.className).toContain('bg-sap-button-lite-background');
        expect(standard!.className).toContain('justify-start');
        expect(standard!.querySelector('[data-glyph]')).not.toBeNull();
        expect(emphasized!.className).toContain('bg-sap-button-emphasized-background');
        expect(toggled!.getAttribute('aria-pressed')).toBe('true');
        expect(cancel!.className).toContain('bg-sap-button-reject-background');
        expect(cancel!.className).not.toContain('justify-start');
        expect(getComputedStyle(standard!).width).toBe(getComputedStyle(cancel!).width);
    });

    it('passes native props, className and ref to the list, the control and the actions', async () => {
        const listRef = createRef<HTMLUListElement>();
        const itemRef = createRef<HTMLButtonElement>();
        const controlRef = createRef<HTMLButtonElement>();
        await render(
            <ActionSheet defaultOpen>
                <ActionSheetControl ref={controlRef} data-testid="control" className="control-class">
                    Actions
                </ActionSheetControl>
                <ActionSheetBody aria-label="Actions" id="body" ref={listRef} className="list-class" data-x="1">
                    <ActionSheetItem
                        ref={itemRef}
                        label="One"
                        data-testid="one"
                        className="item-class"
                        listItemProps={{ className: 'li-class', 'data-li': '' } as never}
                    />
                </ActionSheetBody>
            </ActionSheet>
        );
        await wait();
        expect(listRef.current).toBe(menu());
        expect(listRef.current!.id).toBe('body');
        expect(listRef.current!.className).toContain('list-class');
        expect(listRef.current!.getAttribute('data-x')).toBe('1');
        expect(itemRef.current!.getAttribute('data-testid')).toBe('one');
        expect(itemRef.current!.className).toContain('item-class');
        expect(itemRef.current!.parentElement!.className).toContain('li-class');
        expect(itemRef.current!.parentElement!.getAttribute('role')).toBe('none');
        expect(controlRef.current!.getAttribute('data-testid')).toBe('control');
        expect(controlRef.current!.className).toContain('control-class');
    });

    it('works uncontrolled and with a custom control', async () => {
        const onOpenChange = vi.fn();
        const screen = await render(
            <ActionSheet onOpenChange={onOpenChange}>
                <ActionSheetControl render={<Button glyph="settings" aria-label="More" />} />
                <ActionSheetBody aria-label="Actions">
                    <ActionSheetItem label="One" isCloseButton />
                </ActionSheetBody>
            </ActionSheet>
        );
        const control = screen.container.querySelector<HTMLElement>('[aria-label=More]')!;
        expect(control.getAttribute('aria-haspopup')).toBe('menu');
        await userEvent.click(control);
        await wait();
        expect(onOpenChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ reason: 'trigger-press' }));
        expect(focused()).toBe('One');
        await userEvent.keyboard('{Enter}');
        await wait();
        expect(menu()).toBeNull();
        expect(document.activeElement).toBe(control);
    });

    it('initialFocus chooses what gets the focus on opening', async () => {
        const screen = await render(
            <ActionSheet>
                <ActionSheetControl id="control">Actions</ActionSheetControl>
                <ActionSheetBody aria-label="Actions" initialFocus={false}>
                    <ActionSheetItem label="One" />
                    <ActionSheetItem label="Two" />
                </ActionSheetBody>
            </ActionSheet>
        );
        const control = screen.container.querySelector<HTMLElement>('#control')!;
        await userEvent.click(control);
        await wait();
        expect(menu()).not.toBeNull();
        expect(document.activeElement).toBe(control);
    });

    it('does not run disabled actions', async () => {
        const onClick = vi.fn();
        await render(
            <ActionSheet defaultOpen>
                <ActionSheetControl>Actions</ActionSheetControl>
                <ActionSheetBody aria-label="Actions">
                    <ActionSheetItem label="One" />
                    <ActionSheetItem label="Off" disabled isCloseButton onClick={onClick} />
                </ActionSheetBody>
            </ActionSheet>
        );
        await wait();
        const off = [...menu()!.querySelectorAll<HTMLButtonElement>('[role=menuitem]')][1]!;
        expect(off.disabled).toBe(true);
        await userEvent.click(off, { force: true });
        await wait();
        expect(onClick).not.toHaveBeenCalled();
        expect(menu()).not.toBeNull();
    });
});
