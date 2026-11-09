import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { DialogBody } from '@/ui/dialog/dialog';
import {
    QuickView,
    QuickViewGroup,
    QuickViewGroupItem,
    QuickViewGroupItemContent,
    QuickViewGroupItemContentElement,
    QuickViewGroupItemLabel,
    QuickViewGroupTitle,
    QuickViewSubheader,
    QuickViewSubheaderSubtitle,
    QuickViewSubheaderTitle,
    QuickViewTitle,
    type QuickViewTitleAlign
} from './quick-view';

/** Angular's host: a subheader title and a group with one email item. */
function Contact() {
    return (
        <QuickView>
            <QuickViewSubheader>
                <QuickViewSubheaderTitle>Ann Smith</QuickViewSubheaderTitle>
            </QuickViewSubheader>
            <QuickViewGroup>
                <QuickViewGroupTitle headingLevel={4}>Contact</QuickViewGroupTitle>
                <QuickViewGroupItem>
                    <QuickViewGroupItemLabel>Email</QuickViewGroupItemLabel>
                    <QuickViewGroupItemContent>
                        <QuickViewGroupItemContentElement render={<a href="mailto:ann@example.com" />}>
                            ann@example.com
                        </QuickViewGroupItemContentElement>
                    </QuickViewGroupItemContent>
                </QuickViewGroupItem>
            </QuickViewGroup>
        </QuickView>
    );
}

const LONG = 'A very long text that does not fit on one line of the quick view and has to wrap or truncate';

function Layout({ align = 'middle', wrap = false }: { align?: QuickViewTitleAlign; wrap?: boolean }) {
    return (
        <QuickView id="employee" style={{ width: 320 }}>
            <QuickViewTitle align={align}>
                <span data-testid="title">Employee</span>
            </QuickViewTitle>
            <QuickViewSubheader>
                <QuickViewSubheaderTitle allowWrap={wrap}>{LONG}</QuickViewSubheaderTitle>
                <QuickViewSubheaderSubtitle allowWrap={wrap} data-testid="subtitle">
                    {LONG}
                </QuickViewSubheaderSubtitle>
            </QuickViewSubheader>
            <QuickViewGroup>
                <QuickViewGroupTitle allowWrap={wrap}>{LONG}</QuickViewGroupTitle>
                <QuickViewGroupItem>
                    <QuickViewGroupItemLabel allowWrap={wrap}>{LONG}</QuickViewGroupItemLabel>
                    <QuickViewGroupItemContent>
                        <QuickViewGroupItemContentElement>Value</QuickViewGroupItemContentElement>
                    </QuickViewGroupItemContent>
                </QuickViewGroupItem>
            </QuickViewGroup>
        </QuickView>
    );
}

describe('QuickView', () => {
    it('labels each value with its label and marks titles as headings', async () => {
        const screen = await render(<Contact />);
        const el = screen.container;
        const value = el.querySelector('a')!;
        const ids = value.getAttribute('aria-labelledby')!.split(' ');
        expect(ids.map((id) => document.getElementById(id)!.textContent!.trim())).toEqual(['Email', 'ann@example.com']);
        const headings = [...el.querySelectorAll('h1, h2, h3, h4, h5, h6, [role=heading]')];
        expect(headings.map((h) => [h.textContent!.trim(), h.tagName])).toEqual([
            ['Ann Smith', 'H5'],
            ['Contact', 'H4']
        ]);
        await expect.element(screen.getByRole('heading', { name: 'Ann Smith', level: 5 })).toBeVisible();
        await expect.element(screen.getByRole('heading', { name: 'Contact', level: 4 })).toBeVisible();
        await expect.element(screen.getByRole('link', { name: 'Email ann@example.com' })).toBeVisible();
    });

    it('names each group by its title', async () => {
        const screen = await render(<Contact />);
        const group = screen.getByRole('group', { name: 'Contact' }).element();
        const title = screen.getByRole('heading', { name: 'Contact' }).element();
        expect(title.id).toMatch(/^fd-quick-view-group-title-/);
        expect(group.getAttribute('aria-labelledby')).toBe(title.id);
        expect(group.getAttribute('data-slot')).toBe('form-group');
    });

    it('names a group by its own aria-labelledby or aria-label instead', async () => {
        const screen = await render(
            <QuickView>
                <span id="other">Other name</span>
                <QuickViewGroup aria-labelledby="other">
                    <QuickViewGroupTitle id="contact">Contact</QuickViewGroupTitle>
                </QuickViewGroup>
                <QuickViewGroup aria-label="Schedule">
                    <QuickViewGroupItem>
                        <QuickViewGroupItemLabel>Start</QuickViewGroupItemLabel>
                    </QuickViewGroupItem>
                </QuickViewGroup>
            </QuickView>
        );
        await expect.element(screen.getByRole('group', { name: 'Other name' })).toBeInTheDocument();
        await expect.element(screen.getByRole('group', { name: 'Schedule' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Contact' }).element().id).toBe('contact');
    });

    it('renders the id on the quick view', async () => {
        const screen = await render(<Layout />);
        expect(screen.container.querySelector('[data-quick-view]')!.id).toBe('employee');
        const other = await render(<Contact />);
        // a generated id when none is given
        expect(other.container.querySelector('[data-quick-view]')!.id).toMatch(/^fd-quick-view-/);
    });

    it('shows the title in a header bar on the left, middle or right by align', async () => {
        const screen = await render(<Layout />);
        const bar = () => screen.container.querySelector('[data-bar-design=header]')!.getBoundingClientRect();
        const title = () => screen.getByTestId('title').element().getBoundingClientRect();
        const centre = (r: DOMRect) => (r.left + r.right) / 2;

        expect(Math.abs(centre(title()) - centre(bar()))).toBeLessThanOrEqual(2);

        await screen.rerender(<Layout align="left" />);
        expect(title().left - bar().left).toBeLessThan(bar().width / 4);
        expect(centre(title())).toBeLessThan(centre(bar()) - 20);

        await screen.rerender(<Layout align="right" />);
        expect(bar().right - title().right).toBeLessThan(bar().width / 4);
        expect(centre(title())).toBeGreaterThan(centre(bar()) + 20);
    });

    it('allowWrap wraps the titles and labels instead of truncating', async () => {
        const screen = await render(<Layout />);
        const texts = () => [
            screen.container.querySelector<HTMLElement>('h5')!,
            screen.getByTestId('subtitle').element() as HTMLElement,
            screen.container.querySelector<HTMLElement>('h3')!,
            screen.container.querySelector<HTMLElement>('[data-slot=form-label-text]')!
        ];
        const lineHeight = (e: HTMLElement) => parseFloat(getComputedStyle(e).fontSize) * 1.6;

        for (const text of texts()) {
            expect(getComputedStyle(text).textOverflow).toBe('ellipsis');
            expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
            expect(text.getBoundingClientRect().height).toBeLessThan(lineHeight(text));
        }

        await screen.rerender(<Layout wrap />);
        for (const text of texts()) {
            expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
            expect(text.getBoundingClientRect().height).toBeGreaterThan(lineHeight(text));
        }
    });

    it('truncates a long header title', async () => {
        const screen = await render(
            <QuickView style={{ width: 320 }}>
                <QuickViewTitle>{LONG}</QuickViewTitle>
            </QuickView>
        );
        const element = screen.getByText(LONG).element() as HTMLElement;
        expect(getComputedStyle(element).textOverflow).toBe('ellipsis');
        expect(element.scrollWidth).toBeGreaterThan(element.clientWidth);
        expect(element.getBoundingClientRect().height).toBeLessThan(
            parseFloat(getComputedStyle(element).fontSize) * 1.6
        );
    });

    it('puts the title above the content area and the other children into it', async () => {
        const screen = await render(
            <QuickView>
                <p data-testid="extra">Extra</p>
                <>
                    <QuickViewTitle>Title</QuickViewTitle>
                </>
            </QuickView>
        );
        const root = screen.container.querySelector('[data-quick-view]')!;
        expect(root.children[0]!.querySelector('[role=group][data-bar-design=header]')).not.toBeNull();
        expect(root.children[1]!.hasAttribute('data-quick-view-content')).toBe(true);
        expect(root.children[1]!.contains(screen.getByTestId('extra').element())).toBe(true);
        // the header is sticky, as a popover body header
        expect(getComputedStyle(root.children[0]!).position).toBe('sticky');
    });

    it('puts the avatar before the subheader texts, with a gap', async () => {
        const screen = await render(
            <QuickView>
                <QuickViewSubheader aria-label="Person">
                    <QuickViewSubheaderSubtitle>Sales</QuickViewSubheaderSubtitle>
                    <span data-testid="avatar" style={{ width: 32, height: 32, display: 'inline-block' }} />
                    <QuickViewSubheaderTitle>Ann Smith</QuickViewSubheaderTitle>
                </QuickViewSubheader>
            </QuickView>
        );
        const subheader = screen.getByRole('group', { name: 'Person' }).element();
        expect(subheader.getAttribute('data-bar-design')).toBe('header-with-subheader');
        const area = subheader.firstElementChild!;
        const avatar = screen.getByTestId('avatar').element();
        expect(area.firstElementChild).toBe(avatar);
        expect(getComputedStyle(avatar).marginInlineEnd).toBe('12px');
        const texts = area.children[1]!;
        expect([...texts.children].map((c) => c.textContent)).toEqual(['Sales', 'Ann Smith']);
        expect(getComputedStyle(subheader).paddingBottom).toBe('12px');
        expect(getComputedStyle(subheader).paddingLeft).toBe('0px');
    });

    it('sets the heading level and size of the subheader title', async () => {
        const screen = await render(
            <QuickView>
                <QuickViewSubheader>
                    <QuickViewSubheaderTitle headerSize={3}>Ann Smith</QuickViewSubheaderTitle>
                </QuickViewSubheader>
            </QuickView>
        );
        const title = screen.getByRole('heading', { name: 'Ann Smith', level: 3 }).element();
        expect(title.className).toContain('text-sap-font-header3-size');
        expect(parseFloat(getComputedStyle(title).fontSize)).toBeGreaterThan(20);
    });

    it('spaces the items, except the first one after the group title', async () => {
        const screen = await render(
            <QuickView>
                <QuickViewGroup>
                    <QuickViewGroupTitle>Contact</QuickViewGroupTitle>
                    <QuickViewGroupItem data-testid="first">
                        <QuickViewGroupItemLabel>Phone</QuickViewGroupItemLabel>
                    </QuickViewGroupItem>
                    <QuickViewGroupItem data-testid="second">
                        <QuickViewGroupItemLabel>Email</QuickViewGroupItemLabel>
                    </QuickViewGroupItem>
                </QuickViewGroup>
                <QuickViewGroup aria-label="No title">
                    <QuickViewGroupItem data-testid="untitled">
                        <QuickViewGroupItemLabel>Name</QuickViewGroupItemLabel>
                    </QuickViewGroupItem>
                </QuickViewGroup>
            </QuickView>
        );
        const top = (id: string) => getComputedStyle(screen.getByTestId(id).element()).paddingTop;
        expect(top('first')).toBe('0px');
        expect(top('second')).toBe('12px');
        expect(top('untitled')).toBe('12px');
        expect(getComputedStyle(screen.getByTestId('second').element()).rowGap).toBe('4px');
    });

    it('uses the item id for the label and the value', async () => {
        const screen = await render(
            <QuickView>
                <QuickViewGroup aria-label="Contact">
                    <QuickViewGroupItem id="phone">
                        <QuickViewGroupItemLabel>Phone</QuickViewGroupItemLabel>
                        <QuickViewGroupItemContent>
                            <QuickViewGroupItemContentElement>+1 202 555 0123</QuickViewGroupItemContentElement>
                        </QuickViewGroupItemContent>
                    </QuickViewGroupItem>
                </QuickViewGroup>
            </QuickView>
        );
        expect(screen.container.querySelector('label')!.id).toBe('phone-label');
        const value = document.getElementById('phone-content')!;
        expect(value.textContent).toBe('+1 202 555 0123');
        expect(value.getAttribute('aria-labelledby')).toBe('phone-label phone-content');
    });

    it('leaves the value element unlabelled outside an item', async () => {
        const screen = await render(<QuickViewGroupItemContentElement>Value</QuickViewGroupItemContentElement>);
        const value = screen.getByText('Value').element();
        expect(value.hasAttribute('id')).toBe(false);
        expect(value.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('has the content paddings, without the vertical ones in a dialog body', async () => {
        const screen = await render(
            <>
                <Contact />
                <DialogBody>
                    <Contact />
                </DialogBody>
            </>
        );
        const [plain, inDialog] = [...screen.container.querySelectorAll<HTMLElement>('[data-quick-view-content]')];
        expect(getComputedStyle(plain!).padding).toBe('16px');
        expect(getComputedStyle(inDialog!).paddingTop).toBe('0px');
        expect(getComputedStyle(inDialog!).paddingBottom).toBe('0px');
        expect(getComputedStyle(inDialog!).paddingLeft).toBe('16px');
        expect(getComputedStyle(plain!.parentElement!).minWidth).toBe('320px');
    });

    it('passes native props, className and ref to the root', async () => {
        const ref = createRef<HTMLDivElement>();
        const screen = await render(
            <QuickView ref={ref} className="custom" data-testid="qv" aria-label="Employee" role="region">
                <QuickViewGroup aria-label="Contact" />
            </QuickView>
        );
        const root = screen.getByTestId('qv').element();
        expect(ref.current).toBe(root);
        expect(root.className).toContain('custom');
        expect(root.className).toContain('min-w-80');
        await expect.element(screen.getByRole('region', { name: 'Employee' })).toBeInTheDocument();
    });
});
