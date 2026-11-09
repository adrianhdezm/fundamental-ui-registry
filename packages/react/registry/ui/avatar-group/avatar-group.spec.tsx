import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Avatar } from '@/ui/avatar/avatar';
import type { Placement } from '@/ui/popover/popover';
import {
    AvatarGroup,
    AvatarGroupItem,
    AvatarGroupOverflowList,
    type AvatarGroupOrientation,
    type AvatarGroupProps,
    type AvatarGroupType
} from './avatar-group';

interface Person {
    name: string;
    force?: boolean;
}

const NAMES = [
    'Alexander Hamilton',
    'Benjamin Franklin',
    'Charlotte Bronte',
    'Dorothy Hodgkin',
    'Emmy Noether',
    'Frida Kahlo',
    'Grace Hopper',
    'Hedy Lamarr',
    'Isaac Newton',
    'Jane Austen',
    'Katherine Johnson',
    'Leonardo Vinci'
];

interface HostProps {
    width?: number;
    /** Room above the group, for popovers centred next to it. */
    offset?: number;
    type?: AvatarGroupType;
    orientation?: AvatarGroupOrientation;
    placement?: Placement;
    max?: number | null;
    shape?: 'circle' | 'square';
    ariaLabel?: string | null;
    people?: Person[];
}

/** Mirrors the Angular test host: twelve small bordered avatars with details, in a 300px wide wrapper. */
function createHost() {
    const log = { visibleCount: -1 };
    function Host({
        width = 300,
        offset = 0,
        type = 'individual',
        orientation = 'horizontal',
        placement,
        max = null,
        shape = 'square',
        ariaLabel = null,
        people = NAMES.map((name) => ({ name }))
    }: HostProps) {
        return (
            <>
                <button id="before">Before</button>
                <div id="wrapper" style={{ width, paddingTop: offset }}>
                    <AvatarGroup
                        size="s"
                        type={type}
                        orientation={orientation}
                        placement={placement}
                        maxVisibleItems={max}
                        overflowButtonShape={shape}
                        ariaLabel={ariaLabel}
                        overflowPopoverTitle="Team members"
                        onVisibleCountChange={(count) => (log.visibleCount = count)}
                    >
                        {people.map((p) => (
                            <AvatarGroupItem
                                key={p.name}
                                title={p.name}
                                forceVisibility={!!p.force}
                                details={
                                    <div className="details p-4">
                                        <span className="details-name">{p.name}</span>
                                        <button className="details-action">Message {p.name}</button>
                                        {/* a widget that keeps its keys to itself */}
                                        <input
                                            className="details-stopper"
                                            aria-label="Note"
                                            onKeyDown={(event) => event.stopPropagation()}
                                        />
                                    </div>
                                }
                            >
                                <Avatar circle border size="s" label={p.name} data-name={p.name} />
                            </AvatarGroupItem>
                        ))}
                    </AvatarGroup>
                </div>
            </>
        );
    }
    return { Host, log };
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const stable = async () => {
    for (let i = 0; i < 4; i++) await frame();
};

async function setup(initial: HostProps = {}) {
    const { Host, log } = createHost();
    let current = initial;
    const screen = await render(<Host {...current} />);
    await stable();
    const root = screen.container;
    const group = root.querySelector<HTMLElement>('#wrapper > div')!;
    return {
        log,
        root,
        group,
        /** Names of the avatars shown in the group (not in the popover). */
        visible: () =>
            [...group.querySelectorAll<HTMLElement>('[data-avatar-group-item] [data-name]')].map(
                (a) => a.dataset['name']
            ),
        overflow: () => group.querySelector<HTMLElement>('[data-avatar-group-overflow]'),
        overflowTrigger: () => group.querySelector<HTMLElement>('[data-avatar-group-overflow] [role=button]'),
        body: () => document.querySelector<HTMLElement>('[role=dialog]'),
        update: async (change: Partial<HostProps>) => {
            current = { ...current, ...change };
            await screen.rerender(<Host {...current} />);
            await stable();
        }
    };
}

/** A token colour as the browser computes it. */
function tokenColor(token: string): string {
    const probe = document.createElement('span');
    probe.style.color = `var(${token})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
}

/** Waits until the popover is gone (Base UI unmounts it after its exit). */
async function closed(body: () => HTMLElement | null) {
    await expect.poll(body).toBeNull();
}

describe('AvatarGroup', () => {
    afterEach(() => document.documentElement.removeAttribute('dir'));

    it('shows as many avatars as fit and moves the rest into the overflow button ("+N")', async () => {
        const { log, group, visible, overflow } = await setup();
        const shown = visible();
        expect(shown.length).toBeGreaterThan(2);
        expect(shown.length).toBeLessThan(NAMES.length);
        expect(shown).toEqual(NAMES.slice(0, shown.length));
        expect(overflow()!.textContent!.trim()).toBe(`+${NAMES.length - shown.length}`);
        expect(log.visibleCount).toBe(shown.length);

        // everything fits inside the group, and one more avatar would not
        const right = group.getBoundingClientRect().right;
        expect(overflow()!.getBoundingClientRect().right).toBeLessThanOrEqual(right);
        const avatar = group.querySelector('[data-name]')!.getBoundingClientRect().width;
        expect(overflow()!.getBoundingClientRect().right + avatar).toBeGreaterThan(right - avatar);

        // a list of avatars, the overflow button is the last item
        const list = group.querySelector('[role=list]')!;
        const items = list.querySelectorAll(':scope > [role=listitem]');
        expect(items).toHaveLength(shown.length + 1);
        expect(items[items.length - 1]).toBe(overflow());
        expect(overflow()!.querySelector('[role=button]')!.getAttribute('aria-label')).toBe(
            `+${NAMES.length - shown.length} more`
        );
    });

    it('shows all avatars without overflow button when they fit', async () => {
        const { visible, overflow } = await setup({ width: 1000 });
        expect(visible()).toEqual(NAMES);
        expect(overflow()).toBeNull();
    });

    it('maxVisibleItems caps the visible avatars; forceVisibility keeps an avatar visible', async () => {
        const { visible, overflow, update } = await setup({ width: 1000, max: 5 });
        // the overflow button takes the last slot
        expect(visible()).toEqual(NAMES.slice(0, 4));
        expect(overflow()!.textContent!.trim()).toBe('+8');

        await update({ people: NAMES.map((name, i) => ({ name, force: i === 9 })) });
        expect(visible()).toEqual([NAMES[9], ...NAMES.slice(0, 3)]);
        expect(overflow()!.textContent!.trim()).toBe('+8');

        // forced avatars stay even when space is short
        await update({ max: null, width: 120 });
        expect(visible()).toContain(NAMES[9]);
    });

    it('overflow count is wrapped in <bdi dir="ltr"> so "+8" stays readable in RTL', async () => {
        const { overflow } = await setup({ width: 1000, max: 5 });
        const bdi = overflow()!.querySelector('bdi')!;
        expect(bdi.getAttribute('dir')).toBe('ltr');
        expect(bdi.textContent).toBe('+8');

        document.documentElement.dir = 'rtl';
        await stable();
        const range = document.createRange();
        range.setStart(bdi.firstChild!, 0);
        range.setEnd(bdi.firstChild!, 1);
        const plus = range.getBoundingClientRect();
        range.setStart(bdi.firstChild!, 1);
        range.setEnd(bdi.firstChild!, 2);
        // "+" stays left of the digit
        expect(plus.left).toBeLessThan(range.getBoundingClientRect().left);
    });

    it('individual type: each avatar opens its details popover', async () => {
        const { group, body } = await setup();
        const triggers = [...group.querySelectorAll<HTMLElement>('[data-avatar-group-item] [role=button]')];
        expect(triggers.length).toBeGreaterThan(2);
        expect(triggers[1]!.getAttribute('aria-haspopup')).toBe('dialog');
        expect(triggers[1]!.getAttribute('tabindex')).toBe('0');

        await userEvent.click(triggers[1]!);
        await stable();
        expect(body()!.querySelector('.details-name')!.textContent).toBe(NAMES[1]);
        // the details dialog is named by the avatar's title
        expect(body()!.getAttribute('aria-label')).toBe(NAMES[1]);
        // focus moves into the details
        await wait(50);
        expect(body()!.contains(document.activeElement)).toBe(true);

        await userEvent.keyboard('{Escape}');
        await closed(body);
        expect(document.activeElement).toBe(triggers[1]);

        // keyboard: Enter opens the popover of the focused avatar
        triggers[2]!.focus();
        await userEvent.keyboard('{Enter}');
        await stable();
        expect(body()!.querySelector('.details-name')!.textContent).toBe(NAMES[2]);
        await userEvent.keyboard('{Escape}');
        await closed(body);
        await userEvent.keyboard(' ');
        await stable();
        expect(body()!.querySelector('.details-name')!.textContent).toBe(NAMES[2]);
        await userEvent.keyboard('{Escape}');
        await closed(body);
    });

    it('group type: the whole group opens the list of all avatars', async () => {
        const { group, body } = await setup({ type: 'group' });
        const trigger = group.querySelector<HTMLElement>('[role=button]')!;
        // one trigger only; the avatars overlap
        expect(group.querySelectorAll('[role=button]')).toHaveLength(1);
        const avatars = [...trigger.querySelectorAll<HTMLElement>('[data-name]')];
        expect(avatars[1]!.getBoundingClientRect().left).toBeLessThan(avatars[0]!.getBoundingClientRect().right);

        await userEvent.click(trigger);
        await stable();
        const items = body()!.querySelectorAll('[role=list] > [role=listitem]');
        expect(items).toHaveLength(NAMES.length);
        expect(body()!.querySelector('[role=heading]')!.textContent).toBe('Team members');
        await userEvent.keyboard('{Escape}');
        await closed(body);

        trigger.focus();
        await userEvent.keyboard('{Enter}');
        await stable();
        expect(body()).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await closed(body);
    });

    it('overflow popover: list stage → details stage → back button returns and restores focus', async () => {
        const { overflowTrigger, body } = await setup({ width: 1000, max: 5 });
        await userEvent.click(overflowTrigger()!);
        await stable();
        const heading = () => body()!.querySelector('[role=heading]')!.textContent;
        const items = () => [...body()!.querySelectorAll<HTMLElement>('[role=list] > [role=listitem]')];
        expect(heading()).toBe('Team members');
        expect(body()!.getAttribute('aria-label')).toBe('Team members');
        expect(items().map((i) => i.querySelector<HTMLElement>('[data-name]')!.dataset['name'])).toEqual(
            NAMES.slice(4)
        );
        expect(items()[0]!.getAttribute('aria-haspopup')).toBe('dialog');

        // details of the third hidden avatar, by keyboard
        items()[2]!.focus();
        await userEvent.keyboard('{Enter}');
        await stable();
        expect(heading()).toBe(NAMES[6]);
        expect(body()!.querySelector('.details-name')!.textContent).toBe(NAMES[6]);
        expect(body()!.querySelector('[role=list]')).toBeNull();
        // focus moves to the first focusable element: the back button
        const back = body()!.querySelector<HTMLElement>('button[aria-label="Back"]')!;
        expect(document.activeElement).toBe(back);

        await userEvent.click(back);
        await stable();
        expect(heading()).toBe('Team members');
        expect(document.activeElement).toBe(items()[2]);

        // Space works as well
        await userEvent.keyboard(' ');
        await stable();
        expect(heading()).toBe(NAMES[6]);
        await userEvent.keyboard('{Escape}');
        await closed(body);
        expect(document.activeElement).toBe(overflowTrigger());
    });

    it('re-measures when the container resizes or items change', async () => {
        const { log, visible, overflow, update } = await setup();
        const before = visible().length;
        await update({ width: 500 });
        await wait(50);
        await stable();
        expect(visible().length).toBeGreaterThan(before);
        expect(log.visibleCount).toBe(visible().length);

        await update({ width: 160 });
        await stable();
        expect(visible().length).toBeLessThan(before);
        expect(overflow()!.textContent!.trim()).toBe(`+${NAMES.length - visible().length}`);

        await update({ width: 500, people: NAMES.slice(0, 3).map((name) => ({ name })) });
        await stable();
        expect(visible()).toEqual(NAMES.slice(0, 3));
        expect(overflow()).toBeNull();
    });

    it('group trigger has an accessible name built from the visible avatars', async () => {
        const { group, update } = await setup({ type: 'group' });
        const trigger = group.querySelector<HTMLElement>('[role=button]')!;
        const name = () => trigger.querySelector('.sr-only-sap')!;
        expect(name().textContent!.trim()).toBe(`Avatar group, ${NAMES.length} avatars`);
        // the avatars and the overflow count do not add to the name
        for (const el of trigger.querySelectorAll('[data-avatar-group-item], [data-avatar-group-overflow]'))
            expect(el.getAttribute('aria-hidden')).toBe('true');

        await update({ ariaLabel: 'Project team' });
        expect(name().textContent!.trim()).toBe('Project team');

        // individual groups label their list
        await update({ type: 'individual', ariaLabel: null });
        expect(group.querySelector('[role=list]')!.getAttribute('aria-label')).toBe('Individual avatar group');
    });

    it('the overflow button is square by default and circular with overflowButtonShape=circle', async () => {
        const names = NAMES.slice(0, 4);
        const avatars = names.map((name) => (
            <AvatarGroupItem key={name}>
                <Avatar circle size="s" label={name} />
            </AvatarGroupItem>
        ));
        const screen = await render(
            <>
                {(['circle', 'square'] as const).map((shape) => (
                    <div key={shape} style={{ width: 1000 }}>
                        <AvatarGroup size="s" maxVisibleItems={2} overflowButtonShape={shape}>
                            {avatars}
                        </AvatarGroup>
                    </div>
                ))}
                <div style={{ width: 1000 }}>
                    <AvatarGroup size="s" maxVisibleItems={2}>
                        {avatars}
                    </AvatarGroup>
                </div>
            </>
        );
        await stable();
        const buttons = [...screen.container.querySelectorAll<HTMLElement>('[data-avatar-group-overflow] > span')];
        const radius = (el: HTMLElement) => parseFloat(getComputedStyle(el).borderTopLeftRadius);
        const [circle, square, byDefault] = buttons;
        expect(buttons).toHaveLength(3);
        expect(radius(circle!)).toBeGreaterThanOrEqual(circle!.getBoundingClientRect().width / 2);
        expect(radius(square!)).toBeLessThan(square!.getBoundingClientRect().width / 2);
        expect(radius(byDefault!)).toBe(radius(square!));
    });

    it('vertical groups open their popovers to the right unless placement is set', async () => {
        const { group, body, update } = await setup({ type: 'group', width: 1000, max: 4, offset: 200 });
        const trigger = () => group.querySelector<HTMLElement>('[role=button]')!;
        /** Opens the group popover and returns where it is relative to the trigger. */
        const side = async () => {
            await userEvent.click(trigger());
            await stable();
            const t = trigger().getBoundingClientRect();
            const b = body()!.getBoundingClientRect();
            await userEvent.keyboard('{Escape}');
            await closed(body);
            if (b.left >= t.right - 1) return 'right';
            if (b.top >= t.bottom - 1) return 'bottom';
            if (b.bottom <= t.top + 1) return 'top';
            return 'other';
        };
        expect(await side()).toBe('bottom');
        await update({ orientation: 'vertical' });
        expect(await side()).toBe('right');
        await update({ placement: 'bottom' });
        expect(await side()).toBe('bottom');
        await update({ placement: undefined });
        expect(await side()).toBe('right');

        // the details popovers of an individual vertical group open to the right as well
        await update({ type: 'individual' });
        const avatar = group.querySelector<HTMLElement>('[data-avatar-group-item] [role=button]')!;
        await userEvent.click(avatar);
        await stable();
        expect(body()!.getBoundingClientRect().left).toBeGreaterThanOrEqual(avatar.getBoundingClientRect().right - 1);
        await userEvent.keyboard('{Escape}');
        await closed(body);
    });

    it('focusing an avatar of an individual group announces its position', async () => {
        const { group, overflowTrigger } = await setup({ width: 1000, max: 5 });
        const status = group.querySelector<HTMLElement>('[role=status]')!;
        expect(status.getAttribute('aria-live')).toBe('polite');
        const triggers = [...group.querySelectorAll<HTMLElement>('[data-avatar-group-item] [role=button]')];
        expect(triggers).toHaveLength(4);
        triggers[1]!.focus();
        await expect.poll(() => status.textContent).toBe('2 of 5');
        // the overflow button is the last item of the list
        overflowTrigger()!.focus();
        await expect.poll(() => status.textContent).toBe('5 of 5');
    });

    it('a maxVisibleItems larger than what fits still leaves room for the overflow button', async () => {
        const { group, visible, overflow } = await setup({ max: 10 });
        const shown = visible().length;
        expect(shown).toBeLessThan(10);
        expect(overflow()!.textContent!.trim()).toBe(`+${NAMES.length - shown}`);
        expect(overflow()!.getBoundingClientRect().right).toBeLessThanOrEqual(group.getBoundingClientRect().right);
    });

    it('Escape closes the overflow popover even when its content stops propagation', async () => {
        const { overflowTrigger, body } = await setup({ width: 1000, max: 5 });
        await userEvent.click(overflowTrigger()!);
        await stable();
        body()!.querySelector<HTMLElement>('[role=list] > [role=listitem]')!.focus();
        await userEvent.keyboard('{Enter}');
        await stable();
        const stopper = body()!.querySelector<HTMLElement>('.details-stopper')!;
        stopper.focus();
        // other keys stay with the content
        await userEvent.keyboard('a');
        await stable();
        expect(body()).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await closed(body);
        expect(document.activeElement).toBe(overflowTrigger());
    });

    it('Escape closes a details popover even when its content stops propagation', async () => {
        const { group, body } = await setup();
        const trigger = group.querySelector<HTMLElement>('[data-avatar-group-item] [role=button]')!;
        await userEvent.click(trigger);
        await stable();
        body()!.querySelector<HTMLElement>('.details-stopper')!.focus();
        await userEvent.keyboard('{Escape}');
        await closed(body);
        expect(document.activeElement).toBe(trigger);
    });

    it('onVisibleCountChange follows changes of maxVisibleItems', async () => {
        const { log, update } = await setup({ width: 1000 });
        expect(log.visibleCount).toBe(NAMES.length);
        await update({ max: 3 });
        expect(log.visibleCount).toBe(2);
        await update({ max: null });
        expect(log.visibleCount).toBe(NAMES.length);
    });

    it('maxVisibleItems: 0 hides every avatar, the total count hides none, and changes apply', async () => {
        const { log, visible, overflow, update } = await setup({ width: 1000, max: 0 });
        expect(visible()).toEqual([]);
        expect(overflow()!.textContent!.trim()).toBe(`+${NAMES.length}`);

        await update({ max: NAMES.length });
        expect(visible()).toEqual(NAMES);
        expect(overflow()).toBeNull();
        expect(log.visibleCount).toBe(NAMES.length);

        await update({ max: 3 });
        expect(visible()).toEqual(NAMES.slice(0, 2));
        expect(overflow()!.textContent!.trim()).toBe(`+${NAMES.length - 2}`);
        expect(log.visibleCount).toBe(2);
    });

    it('group type respects maxVisibleItems', async () => {
        const { group, update } = await setup({ type: 'group', width: 1000, max: 4 });
        const shown = () => group.querySelectorAll('[data-avatar-group-item]').length;
        const count = () => group.querySelector('[data-avatar-group-overflow]')?.textContent!.trim();
        expect(shown()).toBe(3);
        expect(count()).toBe(`+${NAMES.length - 3}`);
        await update({ max: null });
        expect(shown()).toBe(NAMES.length);
        expect(count()).toBeUndefined();
    });

    it('vertical orientation caps by maxVisibleItems and ignores the container width', async () => {
        const { group, visible, overflow, update } = await setup({ orientation: 'vertical', width: 60 });
        // a narrow container does not hide anything in a column
        expect(visible()).toEqual(NAMES);
        expect(overflow()).toBeNull();
        const avatars = [...group.querySelectorAll<HTMLElement>('[data-avatar-group-item]')];
        expect(avatars[1]!.getBoundingClientRect().top).toBeGreaterThanOrEqual(
            avatars[0]!.getBoundingClientRect().bottom
        );

        await update({ max: 4 });
        expect(visible()).toEqual(NAMES.slice(0, 3));
        expect(overflow()!.textContent!.trim()).toBe(`+${NAMES.length - 3}`);
        // the overflow button is below the last avatar
        const last = group.querySelectorAll<HTMLElement>('[data-avatar-group-item]')[2]!;
        expect(overflow()!.getBoundingClientRect().top).toBeGreaterThanOrEqual(last.getBoundingClientRect().bottom);
    });

    it('overflowButtonShape applies to group-type groups and follows changes', async () => {
        const { group, update } = await setup({ type: 'group', width: 1000, max: 4 });
        const button = () => group.querySelector<HTMLElement>('[data-avatar-group-overflow] > span')!;
        const round = () =>
            parseFloat(getComputedStyle(button()).borderTopLeftRadius) >= button().getBoundingClientRect().width / 2;
        expect(round()).toBe(false);
        await update({ shape: 'circle' });
        expect(round()).toBe(true);
        await update({ shape: 'square' });
        expect(round()).toBe(false);
    });

    it('renderOverflowButton and renderOverflowBody replace the overflow button and popover content', async () => {
        const screen = await render(
            <div style={{ width: 1000 }}>
                <AvatarGroup
                    size="s"
                    maxVisibleItems={3}
                    overflowPopoverTitle="Team members"
                    renderOverflowButton={(hidden) => <span id="custom-button">{`${hidden.length} others`}</span>}
                    renderOverflowBody={(items) => (
                        <ul id="custom-body">
                            {items.map((item) => (
                                <li key={item.key}>{item.title}</li>
                            ))}
                        </ul>
                    )}
                >
                    {NAMES.slice(0, 5).map((name) => (
                        <AvatarGroupItem key={name} title={name}>
                            <Avatar circle size="s" label={name} />
                        </AvatarGroupItem>
                    ))}
                </AvatarGroup>
            </div>
        );
        await stable();
        const button = screen.container.querySelector<HTMLElement>('#custom-button')!;
        expect(button.textContent).toBe('3 others');
        await userEvent.click(button);
        await stable();
        expect([...document.querySelectorAll('#custom-body li')].map((li) => li.textContent)).toEqual(
            NAMES.slice(2, 5)
        );
        await userEvent.keyboard('{Escape}');
        await closed(() => document.querySelector('[role=dialog]'));
    });

    it('avatars without details are not buttons; the overflow list exports on its own', async () => {
        const screen = await render(
            <>
                <AvatarGroup size="s" ariaLabel="Plain">
                    <AvatarGroupItem key="a">
                        <Avatar size="s" label="Ann Lee" />
                    </AvatarGroupItem>
                </AvatarGroup>
                <AvatarGroupOverflowList
                    id="list"
                    title="People"
                    headingLevel={3}
                    items={[
                        {
                            key: 'a',
                            avatar: <Avatar size="s" label="Ann Lee" />,
                            title: 'Ann Lee',
                            details: null,
                            forceVisibility: false
                        }
                    ]}
                />
            </>
        );
        await stable();
        const list = screen.container.querySelector('[aria-label="Plain"]')!;
        expect(list.querySelector('[role=button]')).toBeNull();
        const overflowList = screen.container.querySelector('#list')!;
        expect(overflowList.querySelector('[role=heading]')!.getAttribute('aria-level')).toBe('3');
        expect(overflowList.querySelector('[role=listitem]')!.hasAttribute('tabindex')).toBe(false);
    });

    it('avatars take the hover colours of their button, and of the whole group in group-type groups', async () => {
        const hoverBorder = tokenColor('--sapAvatar_Hover_BorderColor');
        const { root, group, update } = await setup({ width: 1000, max: 5 });
        const avatar = () => group.querySelector<HTMLElement>('[data-avatar-group-item] [data-name]')!;
        const border = () => getComputedStyle(avatar()).borderTopColor;
        await userEvent.hover(root.querySelector<HTMLElement>('#before')!);
        expect(border()).not.toBe(hoverBorder);
        await userEvent.hover(group.querySelector<HTMLElement>('[data-avatar-group-item] [role=button]')!);
        await expect.poll(border).toBe(hoverBorder);

        // the overflow button has button colours and the avatars' hover border
        const button = group.querySelector<HTMLElement>('[data-avatar-group-overflow] > span')!;
        expect(getComputedStyle(button).backgroundColor).toBe(tokenColor('--sapButton_Background'));
        expect(getComputedStyle(button).color).toBe(tokenColor('--sapButton_TextColor'));
        await userEvent.hover(button);
        await expect.poll(() => getComputedStyle(button).borderTopColor).toBe(hoverBorder);
        await expect
            .poll(() => getComputedStyle(button).backgroundColor)
            .toBe(tokenColor('--sapButton_Hover_Background'));

        await update({ type: 'group' });
        await userEvent.hover(root.querySelector<HTMLElement>('#before')!);
        await expect.poll(border).not.toBe(hoverBorder);
        await userEvent.hover(group.querySelector<HTMLElement>('[role=button]')!);
        await expect.poll(border).toBe(hoverBorder);
        await userEvent.hover(root.querySelector<HTMLElement>('#before')!);
    });

    it('a group that hugs its avatars (in a flex row) keeps them', async () => {
        const screen = await render(
            <div style={{ display: 'flex', gap: 48, width: 800 }}>
                <AvatarGroup id="hugging" size="s" maxVisibleItems={5} overflowButtonShape="circle">
                    {NAMES.map((name) => (
                        <AvatarGroupItem key={name}>
                            <Avatar circle size="s" label={name} data-name={name} />
                        </AvatarGroupItem>
                    ))}
                </AvatarGroup>
            </div>
        );
        await stable();
        await wait(50);
        await stable();
        const group = screen.container.querySelector<HTMLElement>('#hugging')!;
        expect(group.querySelectorAll('[data-avatar-group-item]')).toHaveLength(4);
        expect(group.querySelector('[data-avatar-group-overflow]')!.textContent).toBe('+8');
    });

    it('a custom overflow button is named by its content', async () => {
        const screen = await render(
            <div style={{ width: 1000 }}>
                <AvatarGroup
                    size="s"
                    maxVisibleItems={2}
                    overflowPopoverTitle="Team members"
                    renderOverflowButton={(hidden) => <span>{`${hidden.length} more people`}</span>}
                >
                    {NAMES.slice(0, 4).map((name) => (
                        <AvatarGroupItem key={name} title={name}>
                            <Avatar circle size="s" label={name} />
                        </AvatarGroupItem>
                    ))}
                </AvatarGroup>
            </div>
        );
        await stable();
        const trigger = screen.container.querySelector<HTMLElement>('[data-avatar-group-overflow] [role=button]')!;
        expect(trigger.hasAttribute('aria-label')).toBe(false);
        expect(trigger.textContent).toBe('3 more people');
    });

    it('passes className, native props and the ref to the root (registry convention)', async () => {
        const ref = createRef<HTMLDivElement>();
        const props: AvatarGroupProps = { className: 'mt-2', id: 'group' };
        const screen = await render(
            <AvatarGroup ref={ref} {...props} data-sample="Sample">
                <AvatarGroupItem key="a">
                    <Avatar size="s" label="Ann Lee" />
                </AvatarGroupItem>
            </AvatarGroup>
        );
        const root = screen.container.querySelector<HTMLElement>('#group')!;
        expect(ref.current).toBe(root);
        expect(root.dataset['sample']).toBe('Sample');
        expect(root.classList.contains('mt-2')).toBe(true);
        expect(root.classList.contains('flex')).toBe(true);
    });
});
