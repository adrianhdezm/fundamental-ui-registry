import { createRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { MenuAddon, MenuItem, MenuTitle } from '@/ui/menu/menu';
import { SplitButton, type SplitButtonMainAction, type SplitButtonProps } from './split-button';

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const wait = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));
const settle = async () => {
    await frame();
    await frame();
    await wait();
};

const option = (text: string) =>
    [...document.querySelectorAll<HTMLElement>('[data-menu-link]')].find((e) => e.textContent!.trim() === text)!;

/** Mirrors the Angular test host: three items that log what was chosen. */
function Host({ log, ...props }: Omit<SplitButtonProps, 'children'> & { log: { main: number; chosen: string } }) {
    return (
        <SplitButton
            {...props}
            onPrimaryButtonClick={(event) => {
                log.main++;
                props.onPrimaryButtonClick?.(event);
            }}
        >
            <MenuItem id="one" onClick={() => (log.chosen = 'one')}>
                One
            </MenuItem>
            <MenuItem id="two" onClick={() => (log.chosen = 'two')}>
                Two
            </MenuItem>
            <MenuItem id="long" onClick={() => (log.chosen = 'long')}>
                Three has a longer title
            </MenuItem>
        </SplitButton>
    );
}

async function setup(props: Omit<SplitButtonProps, 'children'> = {}) {
    const log = { main: 0, chosen: '' };
    const screen = await render(<Host log={log} {...props} />);
    await settle();
    const [main, arrow] = [...screen.container.querySelectorAll<HTMLButtonElement>('[role=group] > button')];
    return { screen, log, main: main!, arrow: arrow! };
}

describe('SplitButton', () => {
    it('shows the first item as the main action and runs it from the main button', async () => {
        const { log, main } = await setup();
        expect(main.textContent!.trim()).toBe('One');
        await userEvent.click(main);
        expect(log.main).toBe(1);
        expect(log.chosen).toBe('one');
    });

    it('opens the menu from the arrow and makes the chosen item the main action', async () => {
        const onSelectedChange: string[] = [];
        const { log, main, arrow } = await setup({ onSelectedChange: (id) => onSelectedChange.push(id) });
        expect(arrow.getAttribute('aria-haspopup')).toBe('menu');
        expect(arrow.getAttribute('aria-expanded')).toBe('false');
        await userEvent.click(arrow);
        await settle();
        expect(arrow.getAttribute('aria-expanded')).toBe('true');
        await userEvent.click(option('Two'));
        await settle();
        expect(log.chosen).toBe('two');
        expect(main.textContent!.trim()).toBe('Two');
        expect(arrow.getAttribute('aria-expanded')).toBe('false');
        expect(onSelectedChange).toEqual(['two']);
        log.chosen = '';
        await userEvent.click(main);
        expect(log.chosen).toBe('two');
    });

    it('marks the main action as selected in the menu', async () => {
        const { arrow } = await setup();
        await userEvent.click(arrow);
        await settle();
        expect(option('One').hasAttribute('data-selected')).toBe(true);
        expect(option('Two').hasAttribute('data-selected')).toBe(false);
        await userEvent.click(option('Two'));
        await settle();
        await userEvent.click(arrow);
        await settle();
        expect(option('One').hasAttribute('data-selected')).toBe(false);
        expect(option('Two').hasAttribute('data-selected')).toBe(true);
    });

    it('keeps a constant main action and runs its callback', async () => {
        let called = 0;
        const { log, main, arrow } = await setup({
            mainAction: { mainActionTitle: 'Main', keepMainAction: true, callback: () => called++ }
        });
        expect(main.textContent!.trim()).toBe('Main');
        await userEvent.click(arrow);
        await settle();
        expect(option('One').hasAttribute('data-selected')).toBe(false);
        await userEvent.click(option('Two'));
        await settle();
        expect(log.chosen).toBe('two');
        expect(main.textContent!.trim()).toBe('Main');
        log.chosen = '';
        await userEvent.click(main);
        expect(called).toBe(1);
        expect(log.chosen).toBe('');
    });

    it('shows an additional main action until an item is chosen', async () => {
        let called = 0;
        const { log, main, arrow } = await setup({
            mainAction: { mainActionTitle: 'Action', callback: () => called++ }
        });
        expect(main.textContent!.trim()).toBe('Action');
        await userEvent.click(main);
        expect(called).toBe(1);
        expect(log.chosen).toBe('');
        await userEvent.click(arrow);
        await settle();
        await userEvent.click(option('Two'));
        await settle();
        expect(main.textContent!.trim()).toBe('Two');
        log.chosen = '';
        await userEvent.click(main);
        expect(called).toBe(1);
        expect(log.chosen).toBe('two');
    });

    it('the selected prop sets the main action and the main button runs it', async () => {
        const log = { main: 0, chosen: '' };
        const mainAction: SplitButtonMainAction = { mainActionTitle: 'Action' };
        const screen = await render(<Host log={log} mainAction={mainAction} selected={null} />);
        await settle();
        const main = screen.container.querySelector<HTMLButtonElement>('[role=group] > button')!;
        expect(main.textContent!.trim()).toBe('Action');
        await screen.rerender(<Host log={log} mainAction={mainAction} selected="two" />);
        await settle();
        expect(main.textContent!.trim()).toBe('Two');
        await userEvent.click(main);
        expect(log.chosen).toBe('two');
        expect(log.main).toBe(1);
    });

    it('a controlled selection follows the selected prop', async () => {
        function Controlled() {
            const [selected, setSelected] = useState<string | null>('long');
            return (
                <>
                    <output data-testid="selected">{selected}</output>
                    <Host log={{ main: 0, chosen: '' }} selected={selected} onSelectedChange={setSelected} />
                </>
            );
        }
        const screen = await render(<Controlled />);
        await settle();
        const [main, arrow] = [...screen.container.querySelectorAll<HTMLButtonElement>('[role=group] > button')];
        expect(main!.textContent!.trim()).toBe('Three has a longer title');
        await userEvent.click(arrow!);
        await settle();
        await userEvent.click(option('One'));
        await settle();
        expect(screen.getByTestId('selected').element().textContent).toBe('one');
        expect(main!.textContent!.trim()).toBe('One');
    });

    it('ArrowDown, Alt+ArrowDown, Enter and Space on the arrow open the menu and focus the first item', async () => {
        const { arrow } = await setup();
        for (const key of ['{ArrowDown}', '{Alt>}{ArrowDown}{/Alt}', '{Enter}', ' ']) {
            arrow.focus();
            await userEvent.keyboard(key);
            await settle();
            expect(arrow.getAttribute('aria-expanded'), key).toBe('true');
            expect(document.activeElement!.textContent!.trim(), key).toBe('One');
            await userEvent.keyboard('{Escape}');
            await settle();
            expect(arrow.getAttribute('aria-expanded'), key).toBe('false');
        }
    });

    it('Alt+ArrowDown on the main button opens the menu; ArrowDown alone does not', async () => {
        const { main, arrow } = await setup();
        main.focus();
        await userEvent.keyboard('{ArrowDown}');
        await settle();
        expect(arrow.getAttribute('aria-expanded')).toBe('false');
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await settle();
        expect(arrow.getAttribute('aria-expanded')).toBe('true');
        expect(document.activeElement!.textContent!.trim()).toBe('One');
    });

    it('Escape closes the menu and returns the focus to the arrow', async () => {
        const { arrow } = await setup();
        await userEvent.click(arrow);
        await settle();
        expect(document.activeElement!.textContent!.trim()).toBe('One');
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(arrow.getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(arrow);
    });

    it('disabled disables both buttons and does not open the menu', async () => {
        const { log, main, arrow } = await setup({ disabled: true });
        expect(main.disabled).toBe(true);
        expect(arrow.disabled).toBe(true);
        arrow.click();
        main.click();
        arrow.focus();
        await userEvent.keyboard('{ArrowDown}');
        await settle();
        expect(arrow.getAttribute('aria-expanded')).toBe('false');
        expect(document.querySelector('[role=menu]')).toBeNull();
        expect(log.main).toBe(0);
    });

    it('aria-controls points to the open menu, named by the arrow label', async () => {
        const { arrow } = await setup({ expandButtonAriaLabel: 'Other actions' });
        expect(arrow.hasAttribute('aria-controls')).toBe(false);
        await userEvent.click(arrow);
        await settle();
        const menu = document.getElementById(arrow.getAttribute('aria-controls')!)!;
        expect(menu.getAttribute('role')).toBe('menu');
        expect(menu.getAttribute('aria-label')).toBe('Other actions');
        expect(menu.textContent).toContain('Two');
    });

    it('fixedWidth keeps the main button width when a longer item is chosen', async () => {
        for (const fixed of [true, false]) {
            const { screen, main, arrow } = await setup({ fixedWidth: fixed });
            const before = main.getBoundingClientRect().width;
            await userEvent.click(arrow);
            await settle();
            await userEvent.click(option('Three has a longer title'));
            await settle();
            expect(main.textContent!.trim()).toBe('Three has a longer title');
            const after = main.getBoundingClientRect().width;
            if (fixed) expect(after).toBeCloseTo(before, 0);
            else expect(after).toBeGreaterThan(before + 10);
            await screen.unmount();
        }
    });

    it('labels the group and the arrow, with the arrow title', async () => {
        const { screen, arrow } = await setup();
        const group = screen.container.querySelector('[role=group]')!;
        expect(group.getAttribute('aria-label')).toBe('Split button');
        expect(group.getAttribute('tabindex')).toBe('-1');
        expect(arrow.getAttribute('aria-label')).toBe('More actions');
        expect(arrow.getAttribute('title')).toBe('More actions');
        await screen.rerender(
            <Host log={{ main: 0, chosen: '' }} aria-label="Save actions" expandButtonTitle="Show the actions" />
        );
        expect(group.getAttribute('aria-label')).toBe('Save actions');
        expect(arrow.getAttribute('title')).toBe('Show the actions');
    });

    it('focusing the group moves the focus to the arrow', async () => {
        const { screen, arrow } = await setup();
        screen.container.querySelector<HTMLElement>('[role=group]')!.focus();
        expect(document.activeElement).toBe(arrow);
    });

    it('places the menu below the whole group, at its start', async () => {
        const { screen, arrow } = await setup({ style: { marginInlineStart: 100 } });
        await userEvent.click(arrow);
        await settle();
        const group = screen.container.querySelector('[role=group]')!.getBoundingClientRect();
        const menu = document.querySelector('[role=menu]')!.getBoundingClientRect();
        expect(menu.left).toBeCloseTo(group.left, 0);
        expect(menu.top).toBeGreaterThanOrEqual(group.bottom - 1);
    });

    it('a stretched group grows the main button and keeps the arrow at the end', async () => {
        const { screen, arrow } = await setup({ style: { display: 'flex', width: 400 } });
        const group = screen.container.querySelector('[role=group]')!.getBoundingClientRect();
        expect(arrow.getBoundingClientRect().right).toBeCloseTo(group.right, 0);
    });

    it('shows the arrow pressed while the menu is open', async () => {
        const { arrow } = await setup({ variant: 'emphasized' });
        const rest = getComputedStyle(arrow).backgroundColor;
        await userEvent.click(arrow);
        await settle();
        expect(getComputedStyle(arrow).backgroundColor).not.toBe(rest);
    });

    it('takes the title of an item from its MenuTitle or label, and chooses items of submenus', async () => {
        const chosen: string[] = [];
        const screen = await render(
            <SplitButton>
                <MenuItem onClick={() => chosen.push('save')}>
                    <MenuAddon glyph="save" />
                    <MenuTitle>Save</MenuTitle>
                </MenuItem>
                <MenuItem label="Print it" onClick={() => chosen.push('print')}>
                    <MenuTitle>Print</MenuTitle>
                </MenuItem>
                <MenuItem
                    submenu={
                        <>
                            <MenuItem onClick={() => chosen.push('pdf')}>PDF</MenuItem>
                        </>
                    }
                >
                    <MenuTitle>Export</MenuTitle>
                    <MenuAddon submenuIndicator />
                </MenuItem>
            </SplitButton>
        );
        await settle();
        const [main, arrow] = [...screen.container.querySelectorAll<HTMLButtonElement>('[role=group] > button')];
        expect(main!.textContent!.trim()).toBe('Save');
        await userEvent.click(arrow!);
        await settle();
        await userEvent.click(option('Export'));
        await settle();
        await userEvent.click(option('PDF'));
        await settle();
        expect(main!.textContent!.trim()).toBe('PDF');
        await userEvent.click(main!);
        expect(chosen).toEqual(['pdf', 'pdf']);
        await userEvent.click(arrow!);
        await settle();
        await userEvent.click(
            [...document.querySelectorAll<HTMLElement>('[data-menu-link]')].find((e) => e.textContent === 'Print')!
        );
        await settle();
        expect(main!.textContent!.trim()).toBe('Print it');
    });

    it('opens and closes the menu from outside (controlled open)', async () => {
        function Controlled() {
            const [open, setOpen] = useState(false);
            return (
                <>
                    <button onClick={() => setOpen(true)}>Open</button>
                    <button onClick={() => setOpen(false)}>Close</button>
                    <SplitButton open={open} onOpenChange={setOpen} menuProps={{ closeOnOutsideClick: false }}>
                        <MenuItem>One</MenuItem>
                    </SplitButton>
                </>
            );
        }
        const screen = await render(<Controlled />);
        await screen.getByRole('button', { name: 'Open' }).click();
        await settle();
        expect(document.querySelector('[role=menu]')).not.toBeNull();
        await screen.getByRole('button', { name: 'Close' }).click();
        await settle();
        expect(document.querySelector('[role=menu]')).toBeNull();
    });

    it('passes className, native props and the ref to the group', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <SplitButton ref={ref} className="custom" data-testid="sb" id="sb">
                <MenuItem>One</MenuItem>
            </SplitButton>
        );
        const group = screen.getByTestId('sb').element();
        expect(group).toBe(ref.current);
        expect(group.getAttribute('role')).toBe('group');
        expect(group.id).toBe('sb');
        expect(group.classList.contains('custom')).toBe(true);
    });
});
