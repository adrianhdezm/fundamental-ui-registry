import { DirectionProvider } from '@base-ui/react/direction-provider';
import { createRef, useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { SegmentedButton, SegmentedButtonItem } from './segmented-button';

interface HostProps {
    initial?: string | null;
    initialStyles?: string[];
    vertical?: boolean;
    middleDisabled?: boolean;
    singleChanges?: unknown[];
    multiChanges?: unknown[];
}

/** The parent of two controlled groups, as Angular's ngModel and [(value)] host. */
function Host({
    initial = 'middle',
    initialStyles = ['bold'],
    vertical = false,
    middleDisabled = false,
    singleChanges,
    multiChanges
}: HostProps) {
    const [model, setModel] = useState<string | null>(initial);
    const [styles, setStyles] = useState<string[]>(initialStyles);
    return (
        <div>
            <button id="before">Before</button>
            <SegmentedButton
                id="single"
                aria-label="Alignment"
                vertical={vertical}
                value={model}
                onValueChange={(v) => {
                    singleChanges?.push(v);
                    setModel(v);
                }}
            >
                <SegmentedButtonItem label="Left" value="left" />
                <SegmentedButtonItem label="Middle" value="middle" disabled={middleDisabled} />
                <SegmentedButtonItem label="Right" value="right" />
            </SegmentedButton>
            <button id="after">After</button>
            <span id="style-label">Text style</span>
            <SegmentedButton
                id="multi"
                aria-labelledby="style-label"
                toggle
                value={styles}
                onValueChange={(v) => {
                    multiChanges?.push(v);
                    setStyles(v);
                }}
            >
                <SegmentedButtonItem label="Bold" value="bold" />
                <SegmentedButtonItem label="Italic" value="italic" />
                <SegmentedButtonItem label="Underline" value="underline" />
            </SegmentedButton>
            <output data-testid="model">{JSON.stringify(model)}</output>
            <output data-testid="styles">{JSON.stringify(styles)}</output>
            <button id="set-left" onClick={() => setModel('left')}>
                Set left
            </button>
            <button id="set-null" onClick={() => setModel(null)}>
                Clear
            </button>
        </div>
    );
}

async function setup(props: HostProps = {}, wrap: (ui: ReactNode) => ReactNode = (ui) => ui) {
    const singleChanges: unknown[] = [];
    const multiChanges: unknown[] = [];
    const screen = await render(wrap(<Host {...props} singleChanges={singleChanges} multiChanges={multiChanges} />));
    const root = screen.container;
    return {
        screen,
        root,
        singleChanges,
        multiChanges,
        group: (id: string) => root.querySelector<HTMLElement>(`#${id}`)!,
        buttons: (id: string) => [...root.querySelectorAll<HTMLButtonElement>(`#${id} > button`)],
        model: () => JSON.parse(root.querySelector('[data-testid=model]')!.textContent!) as unknown,
        styles: () => JSON.parse(root.querySelector('[data-testid=styles]')!.textContent!) as unknown,
        click: (id: string) => userEvent.click(root.querySelector<HTMLElement>(`#${id}`)!)
    };
}

const selected = (buttons: HTMLElement[]) => buttons.map((b) => b.getAttribute('aria-selected'));

/** The groups of a form with Angular's form controls: value, dirty, touched, and enable()/disable(). */
function FormHost({ withLarge = false }: { withLarge?: boolean }) {
    const [size, setSize] = useState<string | null>('s');
    const [dirty, setDirty] = useState(false);
    const [touched, setTouched] = useState(false);
    const [disabled, setDisabled] = useState(false);
    return (
        <div>
            <SegmentedButton
                aria-label="Size"
                disabled={disabled}
                value={size}
                onValueChange={(v) => {
                    setSize(v);
                    setDirty(true);
                }}
                onBlur={() => setTouched(true)}
            >
                <SegmentedButtonItem label="S" value="s" />
                <SegmentedButtonItem label="M" value="m" />
                {withLarge && <SegmentedButtonItem label="L" value="l" disabled />}
            </SegmentedButton>
            <output data-testid="state">{JSON.stringify({ size, dirty, touched })}</output>
            <button id="toggle-disabled" onClick={() => setDisabled(!disabled)}>
                Toggle disabled
            </button>
            <button id="set-s" onClick={() => setSize('s')}>
                Set s
            </button>
        </div>
    );
}

function DynamicHost({ views }: { views: string[] }) {
    const [view, setView] = useState<string | null>('list');
    return (
        <div>
            <SegmentedButton aria-label="Views" value={view} onValueChange={setView}>
                {views.map((v) => (
                    <SegmentedButtonItem key={v} label={v} value={v} />
                ))}
            </SegmentedButton>
            <output data-testid="view">{JSON.stringify(view)}</output>
        </div>
    );
}

describe('SegmentedButton', () => {
    it('is a labelled listbox of options', async () => {
        const { group, buttons } = await setup();
        const single = group('single');
        expect(single.getAttribute('role')).toBe('listbox');
        expect(single.getAttribute('aria-label')).toBe('Alignment');
        expect(single.getAttribute('aria-multiselectable')).toBe('false');
        expect(single.getAttribute('aria-roledescription')).toBe('Segmented button group');
        const multi = group('multi');
        expect(multi.getAttribute('aria-labelledby')).toBe('style-label');
        expect(multi.hasAttribute('aria-label')).toBe(false);
        expect(multi.getAttribute('aria-multiselectable')).toBe('true');
        const options = buttons('single');
        expect(options.map((b) => b.getAttribute('role'))).toEqual(['option', 'option', 'option']);
        expect(options.map((b) => b.getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
        expect(options.every((b) => b.getAttribute('aria-setsize') === '3')).toBe(true);
        expect(options[0].getAttribute('aria-roledescription')).toBe('Segmented button');
        // the selection is aria-selected, not a toggle button's aria-pressed
        expect(options.some((b) => b.hasAttribute('aria-pressed'))).toBe(false);
    });

    it('custom role descriptions', async () => {
        const screen = await render(
            <SegmentedButton aria-label="View" groupRoleDescription="Ansicht" buttonRoleDescription="Option">
                <SegmentedButtonItem label="List" value="list" />
            </SegmentedButton>
        );
        const group = screen.container.querySelector<HTMLElement>('[role=listbox]')!;
        expect(group.getAttribute('aria-roledescription')).toBe('Ansicht');
        expect(group.querySelector('button')!.getAttribute('aria-roledescription')).toBe('Option');
    });

    it('controlled: the selected button follows the value and a click selects', async () => {
        const { buttons, model, click, singleChanges } = await setup();
        const options = buttons('single');
        expect(selected(options)).toEqual(['false', 'true', 'false']);
        await userEvent.click(options[2]);
        expect(model()).toBe('right');
        expect(selected(options)).toEqual(['false', 'false', 'true']);
        // a second click keeps the selection
        await userEvent.click(options[2]);
        expect(model()).toBe('right');
        expect(selected(options)).toEqual(['false', 'false', 'true']);
        expect(singleChanges).toEqual(['right']);
        await click('set-left');
        expect(selected(options)).toEqual(['true', 'false', 'false']);
        await click('set-null');
        expect(selected(options)).toEqual(['false', 'false', 'false']);
    });

    it('selected buttons show the selected colours of the button', async () => {
        const { buttons } = await setup();
        const options = buttons('single');
        expect(options.map((b) => b.hasAttribute('data-selected'))).toEqual([false, true, false]);
        expect(getComputedStyle(options[1]).backgroundColor).not.toBe(getComputedStyle(options[0]).backgroundColor);
    });

    it('uncontrolled: defaultValue, then clicks select', async () => {
        const onValueChange = vi.fn();
        const screen = await render(
            <SegmentedButton aria-label="Alignment" defaultValue="b" onValueChange={onValueChange}>
                <SegmentedButtonItem label="A" value="a" />
                <SegmentedButtonItem label="B" value="b" />
            </SegmentedButton>
        );
        const options = [...screen.container.querySelectorAll<HTMLButtonElement>('button')];
        expect(selected(options)).toEqual(['false', 'true']);
        await userEvent.click(options[0]);
        expect(selected(options)).toEqual(['true', 'false']);
        expect(onValueChange).toHaveBeenCalledWith('a', expect.anything());
    });

    it('toggle mode allows several selected buttons and deselects on a second click', async () => {
        const { buttons, styles } = await setup();
        const options = buttons('multi');
        expect(selected(options)).toEqual(['true', 'false', 'false']);
        await userEvent.click(options[2]);
        expect(styles()).toEqual(['bold', 'underline']);
        expect(selected(options)).toEqual(['true', 'false', 'true']);
        await userEvent.click(options[0]);
        expect(styles()).toEqual(['underline']);
        expect(selected(options)).toEqual(['false', 'false', 'true']);
    });

    it('toggle mode with an empty initial state', async () => {
        const { buttons, styles } = await setup({ initialStyles: [] });
        const options = buttons('multi');
        expect(selected(options)).toEqual(['false', 'false', 'false']);
        await userEvent.click(options[1]);
        expect(styles()).toEqual(['italic']);
    });

    it('form state: value, dirty, touched and disabled', async () => {
        const screen = await render(<FormHost />);
        const root = screen.container;
        const group = root.querySelector<HTMLElement>('[role=listbox]')!;
        const options = [...group.querySelectorAll<HTMLButtonElement>('button')];
        const state = () => JSON.parse(root.querySelector('[data-testid=state]')!.textContent!);
        expect(selected(options)).toEqual(['true', 'false']);
        await userEvent.click(options[1]);
        expect(state()).toMatchObject({ size: 'm', dirty: true });
        options[1].blur();
        await expect.poll(() => state().touched).toBe(true);
        await userEvent.click(root.querySelector<HTMLElement>('#toggle-disabled')!);
        expect(group.getAttribute('aria-disabled')).toBe('true');
        expect(options.every((b) => b.disabled)).toBe(true);
        expect(options.every((b) => b.tabIndex === -1)).toBe(true);
        options[0].click();
        expect(state().size).toBe('m');
        await userEvent.click(root.querySelector<HTMLElement>('#toggle-disabled')!);
        await userEvent.click(root.querySelector<HTMLElement>('#set-s')!);
        expect(group.hasAttribute('aria-disabled')).toBe(false);
        expect(options.every((b) => !b.disabled)).toBe(true);
        expect(selected(options)).toEqual(['true', 'false']);
    });

    it('the selected button is the only tab stop', async () => {
        const { root, buttons } = await setup();
        const options = buttons('single');
        expect(options.map((b) => b.tabIndex)).toEqual([-1, 0, -1]);
        root.querySelector<HTMLElement>('#before')!.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(options[1]);
        await userEvent.tab();
        expect(document.activeElement).toBe(root.querySelector('#after'));
    });

    it('without a selection the first button is the tab stop', async () => {
        const { buttons } = await setup({ initial: null });
        expect(buttons('single').map((b) => b.tabIndex)).toEqual([0, -1, -1]);
    });

    it('arrow keys, Home and End move focus (roving tabindex); Space and Enter select', async () => {
        const { buttons, model } = await setup();
        const options = buttons('single');
        options[1].focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(options[2]);
        expect(options.map((b) => b.tabIndex)).toEqual([-1, -1, 0]);
        expect(model()).toBe('middle');
        // no wrapping at the end
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(options[2]);
        await userEvent.keyboard('{Home}');
        await expect.poll(() => document.activeElement).toBe(options[0]);
        await userEvent.keyboard(' ');
        expect(model()).toBe('left');
        await userEvent.keyboard('{End}');
        await expect.poll(() => document.activeElement).toBe(options[2]);
        await userEvent.keyboard('{ArrowLeft}');
        await expect.poll(() => document.activeElement).toBe(options[1]);
        await userEvent.keyboard('{Enter}');
        expect(model()).toBe('middle');
    });

    it('arrow keys are mirrored in RTL', async () => {
        const { buttons } = await setup({}, (ui) => (
            <DirectionProvider direction="rtl">
                <div dir="rtl">{ui}</div>
            </DirectionProvider>
        ));
        const options = buttons('single');
        options[1].focus();
        await userEvent.keyboard('{ArrowLeft}');
        await expect.poll(() => document.activeElement).toBe(options[2]);
        await userEvent.keyboard('{ArrowRight}');
        await userEvent.keyboard('{ArrowRight}');
        await expect.poll(() => document.activeElement).toBe(options[0]);
    });

    it('arrow keys skip disabled buttons, which cannot be selected', async () => {
        const { buttons, model } = await setup({ middleDisabled: true, initial: 'left' });
        const options = buttons('single');
        expect(options[1].disabled).toBe(true);
        options[1].click();
        expect(model()).toBe('left');
        options[0].focus();
        await userEvent.keyboard('{ArrowRight}');
        await expect.poll(() => document.activeElement).toBe(options[2]);
        expect(options.map((b) => b.tabIndex)).toEqual([-1, -1, 0]);
        await userEvent.keyboard('{ArrowLeft}');
        await expect.poll(() => document.activeElement).toBe(options[0]);
    });

    it('vertical orientation stacks the buttons and uses ArrowUp/ArrowDown', async () => {
        const { group, buttons } = await setup({ vertical: true });
        expect(group('single').getAttribute('aria-orientation')).toBe('vertical');
        const options = buttons('single');
        const [a, b] = options.map((o) => o.getBoundingClientRect());
        expect(b.top).toBeGreaterThanOrEqual(a.bottom - 1);
        expect(b.left).toBe(a.left);
        options[1].focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(options[1]);
        await userEvent.keyboard('{ArrowDown}');
        await expect.poll(() => document.activeElement).toBe(options[2]);
        await userEvent.keyboard('{ArrowUp}');
        await expect.poll(() => document.activeElement).toBe(options[1]);
    });

    it('horizontal orientation lays the buttons out in a row', async () => {
        const { group, buttons } = await setup();
        expect(group('single').getAttribute('aria-orientation')).toBe('horizontal');
        const [a, b] = buttons('single').map((o) => o.getBoundingClientRect());
        expect(b.left).toBeGreaterThanOrEqual(a.right - 1);
        expect(b.top).toBe(a.top);
    });

    it('only the outer corners of the group are rounded', async () => {
        const { buttons } = await setup();
        const [first, middle, last] = buttons('single').map((b) => getComputedStyle(b));
        expect(first.borderStartStartRadius).not.toBe('0px');
        expect(first.borderStartEndRadius).toBe(middle.borderStartStartRadius);
        expect(last.borderEndEndRadius).toBe(first.borderStartStartRadius);
    });

    it('an individually disabled button stays disabled after the group is re-enabled', async () => {
        const screen = await render(<FormHost withLarge />);
        const root = screen.container;
        const options = [...root.querySelectorAll<HTMLButtonElement>('[role=listbox] > button')];
        const state = () => JSON.parse(root.querySelector('[data-testid=state]')!.textContent!);
        expect(options.map((b) => b.disabled)).toEqual([false, false, true]);
        await userEvent.click(root.querySelector<HTMLElement>('#toggle-disabled')!);
        expect(options.every((b) => b.disabled)).toBe(true);
        await userEvent.click(root.querySelector<HTMLElement>('#toggle-disabled')!);
        expect(options.map((b) => b.disabled)).toEqual([false, false, true]);
        options[2].click();
        expect(state().size).toBe('s');
    });

    it('a button added after render gets option role, posinset and setsize, and setsize updates on the others', async () => {
        const screen = await render(<DynamicHost views={['list', 'grid']} />);
        const root = screen.container;
        const options = () => [...root.querySelectorAll<HTMLButtonElement>('[role=listbox] > button')];
        const view = () => JSON.parse(root.querySelector('[data-testid=view]')!.textContent!);
        expect(options().map((b) => b.getAttribute('aria-setsize'))).toEqual(['2', '2']);
        await screen.rerender(<DynamicHost views={['list', 'grid', 'table']} />);
        const added = options()[2];
        expect(added.getAttribute('role')).toBe('option');
        expect(added.getAttribute('aria-roledescription')).toBe('Segmented button');
        expect(options().map((b) => b.getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
        expect(options().map((b) => b.getAttribute('aria-setsize'))).toEqual(['3', '3', '3']);
        expect(selected(options())).toEqual(['true', 'false', 'false']);
        await userEvent.click(added);
        expect(view()).toBe('table');
        expect(selected(options())).toEqual(['false', 'false', 'true']);
        await screen.rerender(<DynamicHost views={['grid', 'table']} />);
        expect(options().map((b) => b.getAttribute('aria-posinset'))).toEqual(['1', '2']);
        expect(options().map((b) => b.getAttribute('aria-setsize'))).toEqual(['2', '2']);
    });

    it('items take the button props: glyph, variant and native props', async () => {
        const onClick = vi.fn();
        const screen = await render(
            <SegmentedButton aria-label="Tools" defaultValue="cart">
                <SegmentedButtonItem value="cart" glyph="cart" aria-label="Add to cart" title="Add to cart" />
                <SegmentedButtonItem value="action" glyph="action" aria-label="Action" onClick={onClick} />
            </SegmentedButton>
        );
        const [cart, action] = [...screen.container.querySelectorAll<HTMLButtonElement>('button')];
        expect(cart.querySelector('[data-glyph]')).not.toBeNull();
        expect(cart.getAttribute('aria-label')).toBe('Add to cart');
        expect(cart.title).toBe('Add to cart');
        expect(cart.type).toBe('button');
        await userEvent.click(action);
        expect(onClick).toHaveBeenCalledOnce();
        expect(selected([cart, action])).toEqual(['false', 'true']);
    });

    it('passes className, native props and the ref to the group (fundamental-react prop spreading and ref)', async () => {
        const ref = createRef<HTMLDivElement>();
        const itemRef = createRef<HTMLButtonElement>();
        const screen = await render(
            <SegmentedButton ref={ref} aria-label="Group" data-sample="Sample" className="m-2">
                <SegmentedButtonItem ref={itemRef} value="a" label="A" data-sample="Item" className="px-4" />
            </SegmentedButton>
        );
        const group = screen.container.querySelector<HTMLElement>('[role=listbox]')!;
        expect(ref.current).toBe(group);
        expect(group.tagName).toBe('DIV');
        expect(group.getAttribute('data-sample')).toBe('Sample');
        expect(group.classList.contains('m-2')).toBe(true);
        const button = group.querySelector('button')!;
        expect(itemRef.current).toBe(button);
        expect(button.getAttribute('data-sample')).toBe('Item');
        expect(button.classList.contains('px-4')).toBe(true);
    });
});
