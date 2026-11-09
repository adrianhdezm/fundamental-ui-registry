import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, useId, useState, type MouseEvent } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Link } from '@/ui/link/link';
import { Title } from '@/ui/title/title';
import { ScrollSpy, useScrollSpy, type ScrollSpyProps } from './scroll-spy';

const SECTIONS = ['Introduction', 'Installation', 'Usage', 'Theming', 'Accessibility', 'API'];
const TEXT =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ut laoreet lorem. Vestibulum ante ipsum ' +
    'primis in faucibus orci luctus et ultrices posuere cubilia curae. Aenean sagittis aliquam justo et suscipit.';

/** A table of contents whose current entry follows the section at the top of the content. */
function TableOfContentsDemo(props: Omit<ScrollSpyProps, 'onSpyChange'>) {
    // keeps the section ids unique when several demos share the docs page
    const idPrefix = useId();
    const [active, setActive] = useState<string | undefined>(SECTIONS[0]);
    const go = (event: MouseEvent, section: string) => {
        event.preventDefault();
        document.getElementById(idPrefix + section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    return (
        <div className="flex max-w-3xl gap-6">
            <nav aria-label="Sections" className="flex w-40 shrink-0 flex-col gap-2">
                {SECTIONS.map((section) => (
                    <Link
                        key={section}
                        href={`#${idPrefix}${section}`}
                        emphasized={active === section}
                        aria-current={active === section ? 'location' : undefined}
                        onClick={(event) => go(event, section)}
                    >
                        {section}
                    </Link>
                ))}
            </nav>
            <ScrollSpy
                {...props}
                onSpyChange={(element) => setActive(element?.dataset['section'])}
                role="region"
                tabIndex={0}
                aria-label="Content"
                className="scrollbar-sap h-72 flex-1 overflow-auto pb-60 text-sap-text-color focus-visible:outline-sap"
            >
                {SECTIONS.map((section) => (
                    <section key={section} id={idPrefix + section} data-section={section} className="mb-6">
                        <Title level={3} headerSize={5} className="mb-2">
                            {section}
                        </Title>
                        <p className="m-0 font-sap-font-family text-sap-font-size">{TEXT}</p>
                    </section>
                ))}
            </ScrollSpy>
        </div>
    );
}

const meta = {
    title: 'Components/Scroll Spy',
    component: ScrollSpy,
    parameters: {
        docs: {
            description: {
                component:
                    'Reports which tracked child of a scroll container is at the top, e.g. to highlight the current ' +
                    'entry of a table of contents. It has no visuals of its own; `useScrollSpy` does the same for an ' +
                    'element of your own.'
            }
        }
    },
    args: {
        trackedTags: ['section'],
        targetPercent: 0,
        targetOffset: 0,
        fireEmpty: false,
        disabled: false
    },
    render: (args) => <TableOfContentsDemo {...args} />
} satisfies Meta<typeof ScrollSpy>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TableOfContents: Story = {
    name: 'Table of contents',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const nav = within(canvas.getByRole('navigation', { name: 'Sections' }));
        await expect(nav.getByRole('link', { name: /Introduction/ })).toHaveAttribute('aria-current', 'location');
        await userEvent.click(nav.getByRole('link', { name: /Usage/ }));
        await waitFor(
            () => expect(nav.getByRole('link', { name: /Usage/ })).toHaveAttribute('aria-current', 'location'),
            { timeout: 3000 }
        );
        await expect(nav.getByRole('link', { name: /Introduction/ })).not.toHaveAttribute('aria-current');
    }
};

export const DetectionThreshold: Story = {
    name: 'Detection threshold',
    parameters: {
        docs: {
            description: {
                story: 'With `targetPercent={0.5}`, a section becomes current once it reaches the middle of the container.'
            }
        }
    },
    args: { targetPercent: 0.5 }
};

export const Offset: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'With `targetOffset={100}`, a section becomes current once it is 100px from the top of the ' +
                    'container. `fireEmpty` reports `undefined` when no section is there yet.'
            }
        }
    },
    args: { targetOffset: 100, fireEmpty: true }
};

/** Headings of an article of your own, with the hook. */
function HookDemo() {
    const [current, setCurrent] = useState<string>();
    const ref = useScrollSpy<HTMLElement>({
        trackedTags: ['h2'],
        fireEmpty: true,
        onSpyChange: (element) => setCurrent(element?.textContent ?? undefined)
    });
    return (
        <div className="flex max-w-xl flex-col gap-2 font-sap-font-family text-sap-font-size text-sap-text-color">
            <p className="m-0" aria-live="polite">
                Current heading: <strong>{current ?? 'none'}</strong>
            </p>
            <article
                ref={ref}
                tabIndex={0}
                aria-label="Article"
                className="scrollbar-sap h-60 overflow-auto focus-visible:outline-sap rounded-sap-element-border-corner-radius border border-sap-group-content-border-color px-4 pt-4 pb-48"
            >
                <p className="m-0 mb-4">{TEXT}</p>
                {['Overview', 'Details', 'Summary'].map((heading) => (
                    <Fragment key={heading}>
                        <Title level={2} headerSize={5} className="mb-2">
                            {heading}
                        </Title>
                        <p className="m-0 mb-4">
                            {TEXT} {TEXT}
                        </p>
                    </Fragment>
                ))}
            </article>
        </div>
    );
}

export const Hook: Story = {
    name: 'With the hook',
    parameters: {
        docs: {
            description: {
                story:
                    '`useScrollSpy` returns a ref for a scroll container of your own; here it tracks the `h2` headings ' +
                    'of an article and reports none above the first one (`fireEmpty`).'
            }
        }
    },
    render: () => <HookDemo />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('none')).toBeVisible();
        const details = canvas.getByRole('heading', { name: 'Details' });
        const article = canvas.getByRole('article', { name: 'Article' });
        // reached once its distance from the first child is scrolled away
        article.scrollTop = details.offsetTop - (article.firstElementChild as HTMLElement).offsetTop + 1;
        await waitFor(() => expect(canvas.getByText('Details', { selector: 'strong' })).toBeVisible());
        article.scrollTop = 0;
        await waitFor(() => expect(canvas.getByText('none')).toBeVisible());
    }
};
