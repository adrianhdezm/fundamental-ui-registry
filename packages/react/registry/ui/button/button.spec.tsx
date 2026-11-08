import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/ui/menu/menu';
import { Button, ButtonBadge, type ButtonProps } from './button';

const BUTTON_DEFAULTS: ButtonProps = { label: 'Save' };

async function setup(initial: ButtonProps = {}) {
    let current: ButtonProps = { ...BUTTON_DEFAULTS, ...initial };
    const onClick = vi.fn();
    const onAnchorClick = vi.fn((event: { preventDefault(): void }) => event.preventDefault());
    const ui = (p: ButtonProps) => (
        <div>
            <button id="before">Before</button>
            <Button id="btn" {...p} onClick={onClick} />
            <Button
                id="anchor"
                nativeButton={false}
                render={<a href="#" />}
                label="Anchor"
                disabled={p.disabled}
                onClick={onAnchorClick}
            />
            <button id="after">After</button>
            <span id="probe" />
            <span id="external">External description</span>
        </div>
    );
    const screen = await render(ui(current));
    const root = screen.container;
    const button = () => root.querySelector<HTMLButtonElement>('#btn')!;
    const probe = root.querySelector<HTMLElement>('#probe')!;
    return {
        root,
        button,
        anchor: () => root.querySelector<HTMLAnchorElement>('#anchor')!,
        onClick,
        onAnchorClick,
        icons: () => [...button().querySelectorAll<HTMLElement>('[data-glyph]')],
        /** Accessible description, from the elements aria-describedby points to. */
        description: () =>
            (button().getAttribute('aria-describedby') ?? '')
                .split(' ')
                .filter(Boolean)
                .map((id) => document.getElementById(id)?.textContent?.trim())
                .join(' '),
        resolve: (variable: string) => {
            probe.style.color = `var(${variable})`;
            return getComputedStyle(probe).color;
        },
        update: async (change: Partial<ButtonProps>) => {
            current = { ...current, ...change };
            await screen.rerender(ui(current));
        }
    };
}

describe('Button', () => {
    afterEach(() => document.documentElement.removeAttribute('data-density'));

    it('variants (standard, emphasized, positive, negative, attention, transparent, ghost) use their token classes in all states', async () => {
        const { root, button, resolve, update } = await setup();
        const after = root.querySelector<HTMLElement>('#after')!;
        // keep the pointer of an earlier test file off the button: its rest colour is checked first
        await userEvent.hover(after);
        const variants: [ButtonProps['variant'], string, string, string][] = [
            ['standard', 'Button', 'Button_Hover', 'Button_Selected'],
            ['emphasized', 'Button_Emphasized', 'Button_Emphasized_Hover', 'Button_Selected'],
            ['positive', 'Button_Accept', 'Button_Accept_Hover', 'Button_Accept_Selected'],
            ['negative', 'Button_Reject', 'Button_Reject_Hover', 'Button_Reject_Selected'],
            ['attention', 'Button_Attention', 'Button_Attention_Hover', 'Button_Attention_Selected'],
            ['transparent', 'Button_Lite', 'Button_Lite_Hover', 'Button_Selected'],
            ['ghost', 'Button', 'Button_Hover', 'Button_Selected']
        ];
        const bg = () => getComputedStyle(button()).backgroundColor;
        for (const [variant, rest, hover, toggled] of variants) {
            await update({ variant, toggled: false, disabled: false });
            expect(bg(), variant).toBe(resolve(`--sap${rest}_Background`));
            await userEvent.hover(button());
            expect(bg(), `${variant} hover`).toBe(resolve(`--sap${hover}_Background`));
            await userEvent.hover(after);

            await update({ toggled: true });
            expect(bg(), `${variant} toggled`).toBe(resolve(`--sap${toggled}_Background`));

            // disabled: rest colours at reduced opacity, no hover colours
            await update({ toggled: false, disabled: true });
            expect(getComputedStyle(button()).opacity).toBe('0.4');
            expect(getComputedStyle(button()).cursor).toBe('not-allowed');
            await userEvent.hover(button(), { force: true });
            expect(bg(), `${variant} disabled hover`).toBe(resolve(`--sap${rest}_Background`));
            await userEvent.hover(after);
        }
        // emphasized text uses its own colour
        await update({ variant: 'emphasized', disabled: false });
        expect(getComputedStyle(button()).color).toBe(resolve('--sapButton_Emphasized_TextColor'));
    });

    it('glyph-only button requires aria-label; glyph before/after label', async () => {
        const { button, icons, update } = await setup();
        expect(icons()).toHaveLength(0);
        await update({ glyph: 'add' });
        const label = () => button().querySelector('span:not([data-glyph])')!;
        expect(icons()).toHaveLength(1);
        expect(icons()[0].compareDocumentPosition(label()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(icons()[0].getBoundingClientRect().right).toBeLessThanOrEqual(label().getBoundingClientRect().left);
        expect(icons()[0].getAttribute('aria-hidden')).toBe('true');

        await update({ glyphPosition: 'after' });
        expect(icons()[0].getBoundingClientRect().left).toBeGreaterThanOrEqual(label().getBoundingClientRect().right);

        // glyph only: named by aria-label
        await update({ label: null, 'aria-label': 'Add item' });
        expect(button().textContent!.trim()).toBe('');
        expect(button().getAttribute('aria-label')).toBe('Add item');
        await expect.element(page.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
        // square icon button
        const rect = button().getBoundingClientRect();
        expect(rect.width).toBe(rect.height);

        // icon-only special buttons fall back to the glyph name
        await update({ 'aria-label': undefined, variant: 'negative', glyph: 'decline-all' });
        expect(button().getAttribute('aria-label')).toBe('decline all');
        await update({ variant: 'standard' });
        expect(button().hasAttribute('aria-label')).toBe(false);
    });

    it('disabled vs focusableWhenDisabled: focusable disabled buttons stay in the tab order but swallow clicks', async () => {
        const { root, button, anchor, onClick, onAnchorClick, update } = await setup();
        await userEvent.click(button());
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(button());

        await update({ disabled: true });
        expect(button().disabled).toBe(true);
        expect(button().hasAttribute('aria-disabled')).toBe(false);
        await userEvent.click(button(), { force: true });
        expect(onClick).toHaveBeenCalledTimes(1);
        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        // the disabled button and anchor are skipped
        expect(document.activeElement!.id).toBe('after');

        // anchors: aria-disabled, out of the tab order, clicks swallowed
        expect(anchor().getAttribute('aria-disabled')).toBe('true');
        expect(anchor().getAttribute('tabindex')).toBe('-1');
        await userEvent.click(anchor(), { force: true });
        expect(onAnchorClick).not.toHaveBeenCalled();

        await update({ focusableWhenDisabled: true });
        expect(button().disabled).toBe(false);
        expect(button().getAttribute('aria-disabled')).toBe('true');
        expect(getComputedStyle(button()).opacity).toBe('0.4');
        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(button());
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        await userEvent.click(button(), { force: true });
        expect(onClick).toHaveBeenCalledTimes(1);

        await update({ disabled: false, focusableWhenDisabled: false });
        await userEvent.click(anchor());
        expect(onAnchorClick).toHaveBeenCalledTimes(1);
    });

    it('disabledMessage describes a focusable disabled button; enabledMessage is announced when it becomes enabled', async () => {
        const { button, description, update, root } = await setup({
            disabled: true,
            focusableWhenDisabled: true,
            disabledMessage: 'Fill in the name first',
            enabledMessage: 'Save is now enabled'
        });
        expect(description()).toBe('Fill in the name first');
        const status = root.querySelector<HTMLElement>('[role=status]')!;
        expect(status.getAttribute('aria-live')).toBe('polite');
        expect(status.textContent).toBe('');

        await update({ disabled: false });
        expect(description()).toBe('');
        await expect.poll(() => status.textContent).toBe('Save is now enabled');

        // a plain disabled button is not described: it cannot be focused
        await update({ disabled: true, focusableWhenDisabled: false });
        expect(button().hasAttribute('aria-describedby')).toBe(false);
    });

    it('toggled sets aria-pressed; selected shows the selected styles and aria-selected where the role allows it', async () => {
        const { button, resolve, update } = await setup();
        expect(button().hasAttribute('aria-pressed')).toBe(false);
        expect(button().hasAttribute('aria-selected')).toBe(false);

        await update({ toggled: true });
        expect(button().getAttribute('aria-pressed')).toBe('true');
        expect(getComputedStyle(button()).backgroundColor).toBe(resolve('--sapButton_Selected_Background'));
        expect(getComputedStyle(button()).color).toBe(resolve('--sapButton_Selected_TextColor'));
        expect(getComputedStyle(button()).borderColor).toBe(resolve('--sapButton_Selected_BorderColor'));

        // selected: the selected colours; aria-selected only for roles that support it
        await update({ toggled: false, selected: true });
        expect(button().hasAttribute('aria-pressed')).toBe(false);
        expect(button().hasAttribute('aria-selected')).toBe(false);
        expect(button().hasAttribute('data-selected')).toBe(true);
        expect(getComputedStyle(button()).backgroundColor).toBe(resolve('--sapButton_Selected_Background'));
        await update({ role: 'option' });
        expect(button().getAttribute('aria-selected')).toBe('true');
        await update({ selected: false });
        expect(button().hasAttribute('aria-selected')).toBe(false);
        expect(getComputedStyle(button()).backgroundColor).toBe(resolve('--sapButton_Background'));
    });

    it('menu adds the menu arrow at the end; a menu trigger announces and opens its menu', async () => {
        const screen = await render(
            <div>
                <Button id="plain" label="Plain" />
                <Menu>
                    <MenuTrigger render={<Button id="menu" menu label="Actions" />} />
                    <MenuPopup aria-label="Actions">
                        <MenuItem href="#">Edit</MenuItem>
                    </MenuPopup>
                </Menu>
            </div>
        );
        const plain = screen.container.querySelector<HTMLElement>('#plain')!;
        const trigger = screen.container.querySelector<HTMLElement>('#menu')!;
        expect(plain.querySelector('[data-glyph]')).toBeNull();
        const arrow = trigger.querySelector<HTMLElement>('[data-glyph]')!;
        expect(arrow.dataset['glyph']).toBe(String.fromCodePoint(0xe1ef));
        expect(arrow.getBoundingClientRect().left).toBeGreaterThanOrEqual(
            trigger.querySelector('span')!.getBoundingClientRect().right
        );
        expect(plain.hasAttribute('aria-haspopup')).toBe(false);
        expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');

        await userEvent.click(trigger);
        await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('true');
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('type defaults to "button" inside forms', async () => {
        const onSubmit = vi.fn((event: { preventDefault(): void }) => event.preventDefault());
        const screen = await render(
            <form onSubmit={onSubmit}>
                <input id="field" />
                <Button id="plain" label="Plain" />
                <Button id="submit" type="submit" label="Submit" />
            </form>
        );
        const plain = screen.container.querySelector<HTMLButtonElement>('#plain')!;
        const submit = screen.container.querySelector<HTMLButtonElement>('#submit')!;
        expect(plain.type).toBe('button');
        expect(submit.type).toBe('submit');

        await userEvent.click(plain);
        expect(onSubmit).not.toHaveBeenCalled();
        await userEvent.click(submit);
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('generates a unique id with the fd-button prefix and accepts a custom id', async () => {
        function Host() {
            const [customId, setCustomId] = useState('my-button');
            return (
                <div>
                    <Button variant="positive" label="First" />
                    <Button variant="positive" label="Second" />
                    <Button variant="positive" id={customId} label="Custom" onClick={() => setCustomId('renamed')} />
                </div>
            );
        }
        const screen = await render(<Host />);
        const [first, second, custom] = [...screen.container.querySelectorAll('button')];

        expect(first.id).toMatch(/^fd-button-/);
        expect(second.id).toMatch(/^fd-button-/);
        expect(first.id).not.toBe(second.id);
        expect(custom.id).toBe('my-button');
        // The hidden type description follows the custom id.
        expect(custom.getAttribute('aria-describedby')).toBe('my-button-type-description');
        expect(document.getElementById('my-button-type-description')).not.toBeNull();

        await userEvent.click(custom);
        await expect.poll(() => custom.id).toBe('renamed');
        expect(custom.getAttribute('aria-describedby')).toBe('renamed-type-description');
    });

    it('semantic variants announce their meaning through the hidden description', async () => {
        const { button, description, update } = await setup();
        expect(button().hasAttribute('aria-describedby')).toBe(false);

        const types: [ButtonProps['variant'], string][] = [
            ['emphasized', 'Default Action'],
            ['positive', 'Positive Action'],
            ['negative', 'Negative Action'],
            ['attention', 'Warning']
        ];
        for (const [variant, text] of types) {
            await update({ variant });
            expect(description()).toBe(text);
            // the description is visually hidden
            const hidden = document.getElementById(button().getAttribute('aria-describedby')!)!;
            expect(hidden.getBoundingClientRect().width).toBeLessThanOrEqual(1);
        }
        await expect.element(page.elementLocator(button())).toHaveAccessibleDescription('Warning');

        await update({ variant: 'emphasized', typeDescription: 'Primary', description: 'Saves the draft' });
        expect(description()).toBe('Saves the draft Primary');

        // the native aria-description prop works the same way
        await update({ description: undefined, 'aria-description': 'From the attribute' } as Partial<ButtonProps>);
        expect(description()).toBe('From the attribute Primary');
        expect(button().hasAttribute('aria-description')).toBe(false);

        // an explicit aria-describedby replaces the generated descriptions
        await update({ 'aria-describedby': 'external' });
        expect(button().getAttribute('aria-describedby')).toBe('external');
        expect(description()).toBe('External description');
        expect(button().querySelector('.sr-only-sap')).toBeNull();

        await update({
            'aria-describedby': undefined,
            'aria-description': undefined,
            variant: 'transparent'
        } as Partial<ButtonProps>);
        expect(button().hasAttribute('aria-describedby')).toBe(false);
    });

    it('badge (ButtonBadge or the badge prop) shows content and attention style', async () => {
        function Host() {
            const [count, setCount] = useState(12);
            return (
                <div className="p-4">
                    <Button id="count" glyph="bell" aria-label="Notifications" onClick={() => setCount(5)}>
                        <ButtonBadge>{count}</ButtonBadge>
                    </Button>
                    <Button id="dot" label="Inbox">
                        <ButtonBadge attention />
                    </Button>
                    <Button id="prop" label="Cart" badge="1234" />
                </div>
            );
        }
        const screen = await render(<Host />);
        const root = screen.container;
        const button = root.querySelector<HTMLElement>('#count')!;
        const badge = button.querySelector<HTMLElement>('span.absolute')!;
        expect(badge.textContent).toBe('12');
        // at the top-end corner, overlapping the edge
        const b = button.getBoundingClientRect();
        const r = badge.getBoundingClientRect();
        expect(r.top).toBeLessThan(b.top);
        expect(r.right).toBeGreaterThan(b.right);
        expect(r.height).toBe(16);

        await userEvent.click(button);
        await expect.poll(() => badge.textContent).toBe('5');

        const dot = root.querySelector<HTMLElement>('#dot span.absolute')!;
        expect(dot.textContent).toBe('');
        const d = dot.getBoundingClientRect();
        expect(d.width).toBe(12);
        expect(d.height).toBe(12);
        expect(getComputedStyle(dot).borderRadius).not.toBe('0px');

        expect(root.querySelector('#prop span.absolute')!.textContent).toBe('1234');

        // compact: the counter moves inline next to the content
        document.documentElement.setAttribute('data-density', 'compact');
        expect(getComputedStyle(badge).position).toBe('static');
        expect(getComputedStyle(dot).position).toBe('absolute');
    });

    it('compact density shrinks height via data-density', async () => {
        const { button } = await setup();
        expect(button().getBoundingClientRect().height).toBe(36);
        document.documentElement.setAttribute('data-density', 'compact');
        expect(button().getBoundingClientRect().height).toBe(26);
        // a cozy island inside compact content
        button().parentElement!.setAttribute('data-density', 'cozy');
        expect(button().getBoundingClientRect().height).toBe(36);
        button().parentElement!.removeAttribute('data-density');
    });

    it('decisive buttons are at least 4rem wide in cozy and compact density', async () => {
        const screen = await render(
            <>
                <Button label="OK" />
                <Button label="OK" decisive />
            </>
        );
        const [plain, decisive] = [...screen.container.querySelectorAll('button')];
        const minWidth = (el: Element) => getComputedStyle(el).minWidth;
        expect([minWidth(plain), minWidth(decisive)]).toEqual(['36px', '64px']);
        expect(decisive.getBoundingClientRect().width).toBe(64);
        document.documentElement.setAttribute('data-density', 'compact');
        expect([minWidth(plain), minWidth(decisive)]).toEqual(['32px', '64px']);
        expect(decisive.getBoundingClientRect().width).toBe(64);
    });

    it('focuses the button on click', async () => {
        const { button } = await setup();
        button().addEventListener('mousedown', (event) => event.preventDefault());
        await userEvent.click(button());
        expect(document.activeElement).toBe(button());
    });

    it('passes className, native props and the ref to the button', async () => {
        const ref = createRef<HTMLButtonElement>();
        const screen = await render(
            <Button ref={ref} className="m-2" data-testid="spread" title="Hint" label="Spread" glyph="cart" />
        );
        const button = screen.container.querySelector<HTMLButtonElement>('button')!;
        expect(ref.current).toBe(button);
        expect(button.classList.contains('m-2')).toBe(true);
        expect(button.dataset['testid']).toBe('spread');
        expect(button.title).toBe('Hint');
    });
});
