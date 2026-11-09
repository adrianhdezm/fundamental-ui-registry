import { createRef, useState, type ReactNode, type RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { Radio, RadioGroup } from '@/ui/radio/radio';
import {
    List,
    ListByline,
    ListBylineLeft,
    ListBylineRight,
    ListContent,
    ListFooter,
    ListGroupHeader,
    ListIcon,
    ListItem,
    ListLink,
    ListMessage,
    ListSecondary,
    ListSubline,
    ListThumbnail,
    ListTitle,
    ListTitleText,
    type FocusEscapeDirection,
    type ListActions
} from './list';

async function setup(ui: ReactNode) {
    const screen = await render(ui);
    const root = screen.container;
    const el = (id: string) => root.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
    const items = (list = 0) => [
        ...root.querySelectorAll('[data-slot=list]')[list]!.querySelectorAll<HTMLElement>('[data-slot=list-item]')
    ];
    return { screen, root, el, items };
}

/** The colour a CSS variable resolves to, as getComputedStyle reports it. */
function themed(property: 'backgroundColor' | 'color', value: string): string {
    const probe = document.createElement('div');
    probe.style[property] = value;
    document.body.appendChild(probe);
    const computed = getComputedStyle(probe)[property];
    probe.remove();
    return computed;
}

const rect = (el: Element) => el.getBoundingClientRect();

interface KeyboardProps {
    items?: string[];
    keyboardSupport?: boolean;
    escapes?: FocusEscapeDirection[];
    actionsRef?: RefObject<ListActions | null>;
}

function KeyboardHost({
    items = ['One', 'Two', 'Three', 'Four'],
    keyboardSupport,
    escapes,
    actionsRef
}: KeyboardProps) {
    return (
        <div>
            <button data-testid="before">Before</button>
            <List
                aria-label="Keyboard"
                keyboardSupport={keyboardSupport}
                actionsRef={actionsRef}
                onFocusEscapeList={(direction) => escapes?.push(direction)}
            >
                <ListGroupHeader>
                    <ListTitle>Group</ListTitle>
                </ListGroupHeader>
                {items.map((item) => (
                    <ListItem key={item}>
                        <ListTitle>{item}</ListTitle>
                        {item === 'Two' && <input aria-label="Field" data-testid="field" />}
                    </ListItem>
                ))}
            </List>
            <button data-testid="after">After</button>
        </div>
    );
}

interface SelectionModel {
    label: string;
    selected: boolean;
}

function SelectionHost({ initialSingle = 'r2' }: { initialSingle?: string }) {
    const [multi, setMulti] = useState<SelectionModel[]>([
        { label: 'Item 1', selected: true },
        { label: 'Item 2', selected: false }
    ]);
    const [single, setSingle] = useState(initialSingle);
    return (
        <div>
            <List selection aria-multiselectable="true" aria-label="Multi">
                {multi.map((item, i) => (
                    <ListItem key={item.label}>
                        <Checkbox
                            aria-label={item.label}
                            checked={item.selected}
                            onCheckedChange={(checked) =>
                                setMulti((all) => all.map((m, j) => (j === i ? { ...m, selected: checked } : m)))
                            }
                        />
                        <ListTitle>{item.label}</ListTitle>
                    </ListItem>
                ))}
            </List>
            <RadioGroup value={single} onValueChange={setSingle} role="none">
                <List selection aria-label="Single" selectedLabel="Chosen" notSelectedLabel="Not chosen">
                    {['r1', 'r2', 'r3'].map((v) => (
                        <ListItem key={v}>
                            <Radio value={v} aria-label={v} />
                            <ListTitle>{v}</ListTitle>
                        </ListItem>
                    ))}
                </List>
            </RadioGroup>
            <output data-testid="multi">{multi.map((m) => (m.selected ? 1 : 0)).join('')}</output>
            <output data-testid="single">{single}</output>
        </div>
    );
}

function InteractiveHost({
    selected,
    changes,
    keys,
    onInner
}: {
    selected?: boolean;
    changes: boolean[];
    keys: string[];
    onInner: () => void;
}) {
    return (
        <List aria-label="Interactive">
            <ListItem interactive selected={selected} onSelectedChange={(s) => changes.push(s)}>
                <ListTitle>Interactive</ListTitle>
                <button data-testid="inner" onClick={onInner}>
                    Inner
                </button>
            </ListItem>
            <ListItem interactive inactive onSelectedChange={(s) => changes.push(s)}>
                <ListTitle>Inactive</ListTitle>
            </ListItem>
            <ListItem interactive preventClick onSelectedChange={(s) => changes.push(s)}>
                <ListTitle>Prevent click</ListTitle>
            </ListItem>
            <ListItem onKeyDown={(event) => keys.push(event.key)}>
                <ListTitle>Plain</ListTitle>
            </ListItem>
        </List>
    );
}

function NavigationHost({ visited }: { visited: string[] }) {
    const go = (target: string) => (event: { preventDefault(): void }) => {
        event.preventDefault();
        visited.push(target);
    };
    return (
        <List navigationIndicator aria-label="Navigation" style={{ width: 400 }}>
            <ListItem>
                <ListLink href="#one" navigationIndicator onClick={go('one')}>
                    <ListTitle>One</ListTitle>
                </ListLink>
            </ListItem>
            <ListItem counter={42}>
                <ListLink href="#two" navigated onClick={go('two')}>
                    <ListIcon glyph="cart" />
                    <ListTitle>Two</ListTitle>
                </ListLink>
            </ListItem>
            <ListItem>
                <ListLink href="#three" focusable onClick={go('three')}>
                    <ListTitle>Three</ListTitle>
                </ListLink>
            </ListItem>
        </List>
    );
}

function GrowingHost() {
    const [items, setItems] = useState([1, 2, 3]);
    return (
        <List aria-label="Growing">
            {items.map((i) => (
                <ListItem key={i}>
                    <ListTitle>Item {i}</ListTitle>
                </ListItem>
            ))}
            <ListItem action growing>
                <ListTitle
                    render={<button type="button" />}
                    data-testid="more"
                    onClick={() => setItems((list) => [...list, list.length + 1, list.length + 2])}
                >
                    <ListTitleText>Show more</ListTitleText>
                </ListTitle>
            </ListItem>
            <ListFooter>Footer</ListFooter>
        </List>
    );
}

const LONG_TEXT = 'A very long title that does not fit into the list item and needs several lines';

function ContentHost() {
    return (
        <div>
            <List byline unreadIndicator aria-label="Byline" data-testid="byline-list">
                <ListItem unread data-testid="unread">
                    <ListThumbnail>
                        <ListIcon glyph="activate" />
                    </ListThumbnail>
                    <ListContent>
                        <ListTitle render={<div />} data-testid="unread-title">
                            Unread
                        </ListTitle>
                        <ListByline twoCol>
                            <ListBylineLeft data-testid="byline-left">Left</ListBylineLeft>
                            <ListBylineRight status="positive" data-testid="byline-right">
                                Available
                            </ListBylineRight>
                        </ListByline>
                    </ListContent>
                </ListItem>
                <ListItem data-testid="read">
                    <ListContent>
                        <ListTitle render={<div />} data-testid="read-title">
                            Read
                        </ListTitle>
                        <ListByline data-testid="byline">Byline text</ListByline>
                    </ListContent>
                </ListItem>
            </List>
            <List subline aria-label="Subline">
                <ListItem data-testid="subline-item">
                    <ListContent>
                        <ListTitle render={<div />}>Jane Doe</ListTitle>
                        <ListSubline data-testid="subline">Developer</ListSubline>
                    </ListContent>
                </ListItem>
            </List>
            <List hasMessage aria-label="Message" data-testid="message-list">
                <ListMessage type="error" data-testid="message">
                    Error message
                </ListMessage>
                <ListItem data-testid="message-item">
                    <ListTitle>Item</ListTitle>
                </ListItem>
                <ListFooter align="end" data-testid="footer">
                    Footer
                </ListFooter>
            </List>
            <List hasMessage aria-label="Success message">
                <ListMessage type="success" data-testid="success-message">
                    Saved
                </ListMessage>
                <ListItem>
                    <ListTitle>Item</ListTitle>
                </ListItem>
            </List>
            <List aria-label="Counter">
                <ListItem counter={1234.5} counterAriaLabel="1234 items" data-testid="counter-item">
                    <ListTitle>Counter</ListTitle>
                    <ListSecondary type="negative" data-testid="secondary">
                        Rejected
                    </ListSecondary>
                </ListItem>
                <ListItem active data-testid="active-item">
                    <ListTitle>Current</ListTitle>
                </ListItem>
                <ListItem noData>
                    <ListTitle data-testid="no-data">No data</ListTitle>
                </ListItem>
            </List>
            <List aria-label="Groups">
                <ListGroupHeader data-testid="group-header">
                    <ListTitle>Group A</ListTitle>
                </ListGroupHeader>
                <ListItem>
                    <ListTitle>A1</ListTitle>
                </ListItem>
                <ListGroupHeader role="presentation" data-testid="presentational-header">
                    <ListTitle>Group B</ListTitle>
                </ListGroupHeader>
            </List>
            <List aria-label="Actions" style={{ width: 300 }}>
                <ListItem>
                    <ListTitle>Regular</ListTitle>
                </ListItem>
                <ListItem action data-testid="action-item">
                    <ListTitle render={<button type="button" />} data-testid="action">
                        Action
                    </ListTitle>
                </ListItem>
            </List>
            <List wrap aria-label="Wrap" style={{ width: 200 }}>
                <ListItem data-testid="wrap-item">
                    <ListTitle data-testid="wrap-title">{LONG_TEXT}</ListTitle>
                </ListItem>
            </List>
            <List aria-label="Truncate" style={{ width: 200 }}>
                <ListItem>
                    <ListTitle data-testid="truncate-title">{LONG_TEXT}</ListTitle>
                </ListItem>
            </List>
        </div>
    );
}

describe('List', () => {
    afterEach(() => {
        document.documentElement.removeAttribute('data-density');
        document.documentElement.removeAttribute('data-sap-theme');
    });

    describe('keyboard', () => {
        it('has one tab stop: the first entry, then the last focused one', async () => {
            const { root, el, items } = await setup(<KeyboardHost />);
            const header = root.querySelector<HTMLElement>('[data-slot=list-group-header]')!;
            expect(root.querySelector('[data-slot=list]')!.getAttribute('role')).toBe('list');
            expect(items().every((item) => item.getAttribute('role') === 'listitem')).toBe(true);
            expect(header.tabIndex).toBe(0);
            expect(items().map((item) => item.tabIndex)).toEqual([-1, -1, -1, -1]);

            el('before').focus();
            await userEvent.tab();
            expect(document.activeElement).toBe(header);
            await userEvent.keyboard('{ArrowDown}{ArrowDown}');
            expect(document.activeElement).toBe(items()[1]);
            expect(items()[1]!.tabIndex).toBe(0);
            expect(header.tabIndex).toBe(-1);

            // Tab leaves the list (through the field in the item) and Shift+Tab comes back to the item
            el('after').focus();
            await userEvent.tab({ shift: true });
            expect(document.activeElement).toBe(el('field'));
            await userEvent.tab({ shift: true });
            expect(document.activeElement).toBe(items()[1]);
        });

        it('arrow keys move focus between items; Home/End and Page Up/Down', async () => {
            const { items } = await setup(<KeyboardHost />);
            items()[0]!.focus();
            await userEvent.keyboard('{ArrowDown}');
            expect(document.activeElement).toBe(items()[1]);
            await userEvent.keyboard('{ArrowDown}');
            expect(document.activeElement).toBe(items()[2]);
            await userEvent.keyboard('{ArrowUp}');
            expect(document.activeElement).toBe(items()[1]);
            await userEvent.keyboard('{End}');
            expect(document.activeElement).toBe(items()[3]);
            await userEvent.keyboard('{Home}');
            expect(document.activeElement!.getAttribute('data-slot')).toBe('list-group-header');
            await userEvent.keyboard('{PageDown}');
            expect(document.activeElement).toBe(items()[3]);
            await userEvent.keyboard('{PageUp}');
            expect(document.activeElement!.getAttribute('data-slot')).toBe('list-group-header');
        });

        it('keeps up with items that change', async () => {
            const { screen, items } = await setup(<KeyboardHost />);
            await screen.rerender(<KeyboardHost items={['One', 'Two', 'Three', 'Four', 'Five']} />);
            items()[0]!.focus();
            await userEvent.keyboard('{End}');
            expect(document.activeElement).toBe(items()[4]);
            expect(document.activeElement!.textContent!.trim()).toBe('Five');

            await screen.rerender(<KeyboardHost items={['Two', 'Four']} />);
            items()[0]!.focus();
            await userEvent.keyboard('{ArrowDown}');
            expect(document.activeElement).toBe(items()[1]);
            expect(document.activeElement!.textContent!.trim()).toBe('Four');
            // the tab stop stays on an existing entry
            await screen.rerender(<KeyboardHost items={['Two']} />);
            const entries = [...document.querySelectorAll<HTMLElement>('[data-list-focusable]')];
            expect(entries.filter((entry) => entry.tabIndex === 0)).toHaveLength(1);
        });

        it('setItemActive focuses the entry at the index and moves the tab stop to it', async () => {
            const actionsRef = createRef<ListActions>();
            const { root, items } = await setup(<KeyboardHost actionsRef={actionsRef} />);
            const header = root.querySelector<HTMLElement>('[data-slot=list-group-header]')!;
            // index 0 is the group header, so 2 is the second item
            actionsRef.current!.setItemActive(2);
            expect(document.activeElement).toBe(items()[1]);
            expect(items()[1]!.tabIndex).toBe(0);
            expect(header.tabIndex).toBe(-1);
            expect([header, ...items()].filter((el) => el.tabIndex === 0)).toHaveLength(1);
            await userEvent.keyboard('{ArrowDown}');
            expect(document.activeElement).toBe(items()[2]);
        });

        it('clicking an item makes it the tab stop', async () => {
            const { root, el, items } = await setup(<KeyboardHost />);
            const header = root.querySelector<HTMLElement>('[data-slot=list-group-header]')!;
            await userEvent.click(items()[2]!);
            expect(document.activeElement).toBe(items()[2]);
            expect(items()[2]!.tabIndex).toBe(0);
            expect(header.tabIndex).toBe(-1);
            el('after').focus();
            await userEvent.tab({ shift: true });
            expect(document.activeElement).toBe(items()[2]);
            await userEvent.keyboard('{ArrowUp}');
            expect(document.activeElement).toBe(items()[1]);
        });

        it('keys typed into a field inside an item stay with the field', async () => {
            const { el } = await setup(<KeyboardHost />);
            el('field').focus();
            await userEvent.keyboard('{ArrowDown}{Home}');
            expect(document.activeElement).toBe(el('field'));
        });

        it('onFocusEscapeList is called at the ends instead of moving focus', async () => {
            const escapes: FocusEscapeDirection[] = [];
            const { root, items } = await setup(<KeyboardHost escapes={escapes} />);
            root.querySelector<HTMLElement>('[data-slot=list-group-header]')!.focus();
            await userEvent.keyboard('{ArrowUp}');
            expect(escapes).toEqual(['up']);
            items()[3]!.focus();
            await userEvent.keyboard('{ArrowDown}');
            expect(escapes).toEqual(['up', 'down']);
            expect(document.activeElement).toBe(items()[3]);
        });

        it('keyboardSupport={false} turns arrow navigation off', async () => {
            const { screen, items } = await setup(<KeyboardHost />);
            await screen.rerender(<KeyboardHost keyboardSupport={false} />);
            expect(items().every((item) => item.tabIndex === -1)).toBe(true);
            items()[0]!.focus();
            await userEvent.keyboard('{ArrowDown}');
            expect(document.activeElement).toBe(items()[0]);
        });
    });

    describe('selection', () => {
        it('items are options with aria-selected; the checkbox is inert and the item toggles it', async () => {
            const { el, items, root } = await setup(<SelectionHost />);
            expect(root.querySelector('[data-slot=list]')!.getAttribute('role')).toBe('listbox');
            const [first, second] = items(0);
            expect(first!.getAttribute('role')).toBe('option');
            expect(first!.getAttribute('aria-selected')).toBe('true');
            expect(second!.getAttribute('aria-selected')).toBe('false');
            // the checkbox is not reachable on its own
            expect(first!.querySelector('[data-slot=checkbox]')!.closest('[inert]')).not.toBeNull();
            expect(first!.querySelector<HTMLElement>('[data-slot=checkbox]')!.tabIndex).toBe(-1);

            await userEvent.click(second!);
            expect(el('multi').textContent).toBe('11');
            expect(second!.getAttribute('aria-selected')).toBe('true');
            expect(second!.hasAttribute('data-selected')).toBe(true);

            second!.focus();
            await userEvent.keyboard(' ');
            expect(el('multi').textContent).toBe('10');
            expect(second!.getAttribute('aria-selected')).toBe('false');

            await userEvent.keyboard('{Enter}');
            expect(el('multi').textContent).toBe('11');
        });

        it('describes the selection state for screen readers', async () => {
            const { items } = await setup(<SelectionHost />);
            const describedBy = (item: HTMLElement) =>
                document.getElementById(item.getAttribute('aria-describedby')!)!.textContent!.trim();
            expect(describedBy(items(0)[0]!)).toBe('Selected');
            expect(describedBy(items(0)[1]!)).toBe('Not selected');
            expect(describedBy(items(1)[1]!)).toBe('Chosen');
            expect(describedBy(items(1)[0]!)).toBe('Not chosen');
            await userEvent.click(items(0)[0]!);
            expect(describedBy(items(0)[0]!)).toBe('Not selected');
        });

        it('items of a list without selection have no aria-describedby and no selection text', async () => {
            const { root, items } = await setup(<KeyboardHost />);
            for (const item of items()) {
                expect(item.hasAttribute('aria-describedby')).toBe(false);
                expect(item.hasAttribute('aria-selected')).toBe(false);
                expect(item.querySelector('.sr-only-sap')).toBeNull();
            }
            expect(root.textContent).not.toContain('Not selected');
        });

        it('radio items select their radio button on click and Space; arrow keys move between items', async () => {
            const { el, items } = await setup(<SelectionHost />);
            const radios = items(1);
            expect(radios.map((item) => item.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
            await userEvent.click(radios[0]!);
            expect(el('single').textContent).toBe('r1');
            expect(radios.map((item) => item.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);

            radios[2]!.focus();
            await userEvent.keyboard(' ');
            expect(el('single').textContent).toBe('r3');
            expect(radios[2]!.getAttribute('aria-selected')).toBe('true');

            // the radio group around the list does not take over the arrow keys
            await userEvent.keyboard('{ArrowUp}');
            expect(document.activeElement).toBe(radios[1]);
            expect(el('single').textContent).toBe('r3');
        });

        it('disabled controls are not changed through their item', async () => {
            const { items } = await setup(
                <List selection aria-label="Disabled">
                    <ListItem aria-disabled="true">
                        <Checkbox aria-label="Item" disabled defaultChecked />
                        <ListTitle>Item</ListTitle>
                    </ListItem>
                </List>
            );
            // Playwright does not click aria-disabled elements
            items()[0]!.click();
            items()[0]!.focus();
            await userEvent.keyboard(' ');
            expect(items()[0]!.getAttribute('aria-selected')).toBe('true');
        });
    });

    describe('interactive items', () => {
        it('onSelectedChange is called on clicks, Space and Enter', async () => {
            const changes: boolean[] = [];
            const { items } = await setup(<InteractiveHost changes={changes} keys={[]} onInner={() => {}} />);
            const item = items()[0]!;
            expect(item.getAttribute('role')).toBe('listitem');
            expect(item.hasAttribute('aria-selected')).toBe(false);

            await userEvent.click(item);
            expect(changes).toEqual([true]);
            expect(item.hasAttribute('data-selected')).toBe(true);
            await userEvent.unhover(item);
            expect(getComputedStyle(item).backgroundColor).toBe(
                themed('backgroundColor', 'var(--sapList_SelectionBackgroundColor)')
            );

            item.focus();
            await userEvent.keyboard(' ');
            expect(changes).toEqual([true, false]);
            expect(item.hasAttribute('data-selected')).toBe(false);

            await userEvent.keyboard('{Enter}');
            expect(changes).toEqual([true, false, true]);
        });

        it('follows the selected prop', async () => {
            const changes: boolean[] = [];
            const host = (selected?: boolean) => (
                <InteractiveHost selected={selected} changes={changes} keys={[]} onInner={() => {}} />
            );
            const { screen, items } = await setup(host(false));
            await screen.rerender(host(true));
            expect(items()[0]!.hasAttribute('data-selected')).toBe(true);
            expect(changes).toEqual([]);
            // controlled: a click reports the change, the parent decides
            await userEvent.click(items()[0]!);
            expect(changes).toEqual([false]);
            expect(items()[0]!.hasAttribute('data-selected')).toBe(true);
        });

        it('clicks on a control inside the item do not toggle it', async () => {
            const changes: boolean[] = [];
            const onInner = vi.fn();
            const { el, items } = await setup(<InteractiveHost changes={changes} keys={[]} onInner={onInner} />);
            await userEvent.click(el('inner'));
            expect(onInner).toHaveBeenCalledTimes(1);
            expect(changes).toEqual([]);
            expect(items()[0]!.hasAttribute('data-selected')).toBe(false);
        });

        it('inactive items ignore the pointer and preventClick items ignore clicks', async () => {
            const changes: boolean[] = [];
            const { items } = await setup(<InteractiveHost changes={changes} keys={[]} onInner={() => {}} />);
            expect(getComputedStyle(items()[1]!).pointerEvents).toBe('none');
            items()[2]!.click();
            expect(changes).toEqual([]);
        });

        it('inactive items are skipped by the arrow keys', async () => {
            const { items } = await setup(<InteractiveHost changes={[]} keys={[]} onInner={() => {}} />);
            items()[0]!.focus();
            await userEvent.keyboard('{ArrowDown}');
            expect(document.activeElement).toBe(items()[2]);
        });

        it('onKeyDown receives the keys of plain items', async () => {
            const keys: string[] = [];
            const { items } = await setup(<InteractiveHost changes={[]} keys={keys} onInner={() => {}} />);
            items()[3]!.focus();
            await userEvent.keyboard('{Enter}a');
            expect(keys).toEqual(['Enter', 'a']);
        });
    });

    describe('navigation items', () => {
        it('the link fills the item and is opened with Enter or Space on the item', async () => {
            const visited: string[] = [];
            const { items } = await setup(<NavigationHost visited={visited} />);
            const [first] = items();
            const link = first!.querySelector<HTMLElement>('a')!;
            expect(link.tabIndex).toBe(-1);
            expect(rect(link).width).toBeCloseTo(rect(first!).width, 0);
            expect(rect(link).height).toBeGreaterThan(rect(first!).height - 2);

            await userEvent.click(items()[1]!.querySelector('[data-slot=list-title]')!);
            expect(visited).toEqual(['two']);

            first!.focus();
            await userEvent.keyboard('{Enter}');
            expect(visited).toEqual(['two', 'one']);
            await userEvent.keyboard(' ');
            expect(visited).toEqual(['two', 'one', 'one']);
        });

        it('shows the navigation indicator arrow and reserves its space in the list', async () => {
            const { items } = await setup(<NavigationHost visited={[]} />);
            const withIndicator = getComputedStyle(items()[0]!.querySelector('a')!, '::after');
            expect(withIndicator.content).not.toBe('none');
            expect(withIndicator.content).not.toBe('""');
            expect(withIndicator.minWidth).toBe('40px');
            // items without the arrow keep the space empty
            const without = getComputedStyle(items()[1]!.querySelector('a')!, '::after');
            expect(without.content).toBe('""');
            expect(without.minWidth).toBe('40px');
        });

        it('navigated marks the link with the selection border colour', async () => {
            const { items } = await setup(<NavigationHost visited={[]} />);
            const shadow = getComputedStyle(items()[1]!.querySelector('a')!).boxShadow;
            expect(shadow).toContain('inset');
            expect(shadow).toContain(themed('color', 'var(--sapList_SelectionBorderColor)'));
            expect(getComputedStyle(items()[0]!.querySelector('a')!).boxShadow).not.toContain('inset');
        });

        it('a counter is shown inside the link', async () => {
            const { items } = await setup(<NavigationHost visited={[]} />);
            const link = items()[1]!.querySelector('a')!;
            expect(link.lastElementChild!.textContent!.trim()).toBe('42');
            expect(items()[1]!.querySelectorAll(':scope > span')).toHaveLength(0);
        });

        it('a focusable link receives the focus of its item', async () => {
            const { items } = await setup(<NavigationHost visited={[]} />);
            items()[2]!.focus();
            expect(document.activeElement).toBe(items()[2]!.querySelector('a'));
        });
    });

    describe('growing', () => {
        it('growing item loads more (button) and keeps focus', async () => {
            const { el, items } = await setup(<GrowingHost />);
            expect(items()).toHaveLength(4);
            el('more').focus();
            await userEvent.keyboard('{Enter}');
            expect(items()).toHaveLength(6);
            expect(document.activeElement).toBe(el('more'));
            await userEvent.click(el('more'));
            expect(items()).toHaveLength(8);
            expect(document.activeElement).toBe(el('more'));
            expect(items()[6]!.textContent!.trim()).toBe('Item 7');
        });

        it('the growing button fills the item and its label is bold', async () => {
            const { el } = await setup(<GrowingHost />);
            const item = el('more').closest('[data-slot=list-item]')!;
            expect(rect(el('more')).width).toBeCloseTo(rect(item).width, 0);
            expect(getComputedStyle(el('more').querySelector('[data-slot=list-title-text]')!).fontWeight).toBe('700');
        });
    });

    describe('content', () => {
        it('byline items show the title above the byline; twoCol splits it', async () => {
            const { el } = await setup(<ContentHost />);
            expect(rect(el('byline')).top).toBeGreaterThanOrEqual(rect(el('read-title')).bottom);
            expect(rect(el('read')).height).toBeGreaterThanOrEqual(80);
            expect(rect(el('byline-left')).right).toBeLessThanOrEqual(rect(el('byline-right')).left + 1);
            expect(getComputedStyle(el('byline-right')).color).toBe(themed('color', 'var(--sapPositiveTextColor)'));
        });

        it('unread items have a bold title and an unread dot', async () => {
            const { el } = await setup(<ContentHost />);
            expect(getComputedStyle(el('unread-title')).fontWeight).toBe('700');
            expect(getComputedStyle(el('read-title')).fontWeight).toBe('400');
            const dot = el('unread').querySelector(':scope > [data-glyph]')!;
            expect(dot.getAttribute('aria-hidden')).toBe('true');
            expect(rect(dot).left).toBeLessThan(rect(el('unread').querySelector('[data-slot=list-thumbnail]')!).left);
            expect(el('read').querySelector(':scope > [data-glyph]')).toBeNull();
        });

        it('subline items show the subline below the title', async () => {
            const { el } = await setup(<ContentHost />);
            const title = el('subline-item').querySelector('[data-slot=list-title]')!;
            expect(rect(el('subline')).top).toBeGreaterThanOrEqual(rect(title).bottom);
            expect(rect(el('subline-item')).height).toBeGreaterThanOrEqual(72);
        });

        it('counter, secondary text and the active check mark', async () => {
            const { el } = await setup(<ContentHost />);
            const counter = el('counter-item').querySelector('[aria-label="1234 items"]')!;
            expect(counter.textContent!.trim()).toBe('1,234.5');
            expect(rect(counter).left).toBeGreaterThan(rect(el('secondary')).right - 1);
            expect(getComputedStyle(el('secondary')).color).toBe(themed('color', 'var(--sapNegativeTextColor)'));
            expect(el('active-item').querySelector('[data-glyph]')!.getAttribute('data-glyph')).toBeTruthy();
            expect(getComputedStyle(el('no-data')).textAlign).toBe('center');
        });

        it('group headers are focusable list items unless presentational', async () => {
            const { el } = await setup(<ContentHost />);
            expect(el('group-header').getAttribute('role')).toBe('listitem');
            expect(el('group-header').hasAttribute('tabindex')).toBe(true);
            expect(getComputedStyle(el('group-header')).backgroundColor).toBe(
                themed('backgroundColor', 'var(--sapList_GroupHeaderBackground)')
            );
            expect(el('presentational-header').getAttribute('role')).toBe('presentation');
            expect(el('presentational-header').hasAttribute('tabindex')).toBe(false);
        });

        it('the message sits above the items and the footer below them', async () => {
            const { el } = await setup(<ContentHost />);
            expect(getComputedStyle(el('message-list')).paddingTop).toBe('32px');
            expect(rect(el('message')).top).toBe(rect(el('message-list')).top);
            expect(rect(el('message')).bottom).toBeLessThanOrEqual(rect(el('message-item')).top);
            expect(getComputedStyle(el('message')).backgroundColor).toBe(
                themed('backgroundColor', 'var(--sapErrorBackground)')
            );
            expect(rect(el('footer')).top).toBeGreaterThanOrEqual(rect(el('message-item')).bottom);
            expect(getComputedStyle(el('footer')).justifyContent).toBe('flex-end');
        });

        it('a success message uses the success background', async () => {
            const { el } = await setup(<ContentHost />);
            expect(getComputedStyle(el('success-message')).backgroundColor).toBe(
                themed('backgroundColor', 'var(--sapSuccessBackground)')
            );
            expect(el('success-message').className).not.toContain('bg-sap-error-background');
        });

        it('titles truncate by default and wrap in a wrap list', async () => {
            const { el } = await setup(<ContentHost />);
            const truncated = el('truncate-title');
            expect(truncated.scrollWidth).toBeGreaterThan(truncated.clientWidth);
            const wrapped = el('wrap-title');
            expect(getComputedStyle(wrapped).whiteSpace).toBe('normal');
            expect(rect(wrapped).height).toBeGreaterThan(rect(truncated).height * 2);
            expect(rect(el('wrap-item')).height).toBeGreaterThan(
                rect(truncated.closest('[data-slot=list-item]')!).height
            );
        });

        it('compact density makes the items shorter', async () => {
            const { el } = await setup(<ContentHost />);
            const item = el('message-item');
            const cozy = rect(item).height;
            document.documentElement.setAttribute('data-density', 'compact');
            expect(rect(item).height).toBeLessThan(cozy);
        });
    });

    describe('action items', () => {
        it('in Horizon the whole item is the button', async () => {
            const { el } = await setup(<ContentHost />);
            const button = el('action');
            const item = el('action-item');
            expect(rect(button).width).toBeCloseTo(rect(item).width, 0);
            expect(getComputedStyle(button).borderTopWidth).toBe('0px');
            expect(getComputedStyle(button).borderRadius).toBe('0px');
            expect(getComputedStyle(button).color).toBe(themed('color', 'var(--sapButton_TextColor)'));
        });

        it('in high contrast it is an inset bordered button', async () => {
            const { el } = await setup(<ContentHost />);
            document.documentElement.setAttribute('data-sap-theme', 'sap_horizon_hcb');
            const style = getComputedStyle(el('action'));
            expect(style.borderTopWidth).toBe('1px');
            expect(style.borderTopStyle).toBe('solid');
            expect(style.borderRadius).toBe('6px');
            expect(style.marginTop).toBe('4px');
            expect(rect(el('action')).width).toBeLessThan(rect(el('action-item')).width);
        });
    });

    describe('props', () => {
        it('passes className, native props and the ref to the list (fundamental-react)', async () => {
            const ref = createRef<HTMLUListElement>();
            const { el } = await setup(
                <List ref={ref} className="custom-list" data-sample="Sample" data-testid="list" aria-label="Props">
                    <ListItem data-sample="Item">
                        <ListTitle>Item</ListTitle>
                    </ListItem>
                </List>
            );
            expect(ref.current!.tagName).toBe('UL');
            expect(el('list').getAttribute('data-sample')).toBe('Sample');
            expect(el('list').classList).toContain('custom-list');
            expect(el('list').classList).toContain('list-none');
        });

        it('passes className and native props to every part', async () => {
            const parts = (
                <List aria-label="Parts">
                    <ListGroupHeader data-sample="header">
                        <ListTitle data-sample="title">Group</ListTitle>
                    </ListGroupHeader>
                    <ListItem data-sample="item" className="custom-item">
                        <ListLink href="#" data-sample="link" className="custom-link">
                            <ListIcon glyph="cart" data-sample="icon" className="custom-icon" />
                            <ListTitle>Link</ListTitle>
                            <ListSecondary data-sample="secondary">2</ListSecondary>
                        </ListLink>
                    </ListItem>
                    <ListItem byline>
                        <ListThumbnail data-sample="thumbnail" />
                        <ListContent data-sample="content">
                            <ListTitle render={<div />}>Title</ListTitle>
                            <ListByline data-sample="byline" twoCol>
                                <ListBylineLeft data-sample="byline-left">Left</ListBylineLeft>
                                <ListBylineRight data-sample="byline-right">Right</ListBylineRight>
                            </ListByline>
                            <ListSubline data-sample="subline">Subline</ListSubline>
                        </ListContent>
                    </ListItem>
                    <ListItem action>
                        <ListTitle render={<button type="button" />}>
                            <ListTitleText data-sample="title-text">More</ListTitleText>
                        </ListTitle>
                    </ListItem>
                    <ListMessage data-sample="message">Message</ListMessage>
                    <ListFooter data-sample="footer">Footer</ListFooter>
                </List>
            );
            const { root } = await setup(parts);
            for (const name of [
                'header',
                'title',
                'item',
                'link',
                'icon',
                'secondary',
                'thumbnail',
                'content',
                'byline',
                'byline-left',
                'byline-right',
                'subline',
                'title-text',
                'message',
                'footer'
            ]) {
                expect(root.querySelector(`[data-sample="${name}"]`), name).not.toBeNull();
            }
            const link = root.querySelector('[data-sample="link"]')!;
            expect(link.classList).toContain('custom-link');
            expect(link.classList).toContain('no-underline');
            const icon = root.querySelector('[data-sample="icon"]')!;
            expect(icon.classList).toContain('custom-icon');
            expect(icon.classList).toContain('pointer-events-none');
            expect(icon.getAttribute('aria-hidden')).toBe('true');
            expect(root.querySelector('[data-sample="item"]')!.classList).toContain('custom-item');
        });

        it('onClick of an item is called on clicks (fundamental-react)', async () => {
            const onClick = vi.fn();
            const { items } = await setup(
                <List aria-label="Click">
                    <ListItem onClick={onClick}>
                        <ListTitle>Test</ListTitle>
                    </ListItem>
                </List>
            );
            await userEvent.click(items()[0]!);
            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('a selection item calls onClick once when it toggles its control', async () => {
            const onClick = vi.fn();
            const { items } = await setup(
                <List selection aria-label="Click">
                    <ListItem onClick={onClick}>
                        <Checkbox aria-label="Item" />
                        <ListTitle>Item</ListTitle>
                    </ListItem>
                </List>
            );
            await userEvent.click(items()[0]!);
            expect(onClick).toHaveBeenCalledTimes(1);
            expect(items()[0]!.getAttribute('aria-selected')).toBe('true');
        });
    });
});
