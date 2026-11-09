import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '@/ui/button/button';
import { Card, CardContent, CardHeader, CardMainHeader, CardSubtitle, CardTitle } from '@/ui/card/card';
import { MessagePage, MessagePageTitle } from '@/ui/message-page/message-page';
import { Title } from '@/ui/title/title';
import {
    Carousel,
    CarouselItem,
    type CarouselActions,
    type CarouselBackgroundOptions,
    type CarouselProps
} from './carousel';

const COLORS = ['7eb8da', '81c784', 'ffb74d', 'e57373', 'ba68c8', '4dd0e1', 'a1887f', '90a4ae', 'f06292', 'aed581'];

/** A coloured placeholder image with a label. */
const image = (index: number, width = 500, height = width) =>
    `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><rect fill='#${COLORS[index % COLORS.length]}' width='${width}' height='${height}'/><text fill='#fff' font-family='sans-serif' font-size='${Math.min(width, height) / 16}' x='${width / 2}' y='${height / 2}' dominant-baseline='middle' text-anchor='middle'>Slide ${index + 1}</text></svg>`
    )}`;

const HEADING = 'mt-6 mb-2 first:mt-0';

function Heading({ children }: { children: ReactNode }) {
    return (
        <Title level={3} headerSize={5} className={HEADING}>
            {children}
        </Title>
    );
}

/** `count` image slides. */
function slides(count: number, width = 500, height = width) {
    return Array.from({ length: count }, (_, index) => (
        <CarouselItem key={index}>
            <img src={image(index, width, height)} alt={`Slide ${index + 1}`} />
        </CarouselItem>
    ));
}

/** A carousel that starts at the slide `at` (with `actionsRef`), as fundamental-styles shows its fifth dot active. */
function At({ at, ...props }: CarouselProps & { at: number }) {
    const actions = useRef<CarouselActions>(null);
    useEffect(() => {
        // after the slides registered (the carousel goes back to the first slide when they change)
        const frame = requestAnimationFrame(() => {
            for (let i = 0; i < at; i++) actions.current?.next();
        });
        return () => cancelAnimationFrame(frame);
    }, [at]);
    return <Carousel {...props} actionsRef={actions} />;
}

const meta = {
    title: 'Components/Carousel',
    component: Carousel,
    parameters: {
        docs: {
            description: {
                component:
                    'A carousel shows one or more slides at a time, with navigation buttons, page indicators (dots, ' +
                    'or "2 of 9" for more than eight slides) and swiping. The carousel is one tab stop: Left and Right ' +
                    '(Up and Down when vertical) move between the slides, mirrored in RTL, and the shown slide is ' +
                    'announced. `loop` wraps around; `visibleSlidesCount="auto"` shows as many slides as fit. The ' +
                    'slides move without a transition for `prefers-reduced-motion`. `CarouselEngine` adds the same ' +
                    'sliding and swiping to any flex container.\n\n' +
                    '```tsx\n' +
                    '<Carousel width="31.25rem" aria-label="Products">\n' +
                    '    <CarouselItem><img src="a.png" alt="A" /></CarouselItem>\n' +
                    '    <CarouselItem><img src="b.png" alt="B" /></CarouselItem>\n' +
                    '</Carousel>\n' +
                    '```'
            }
        }
    },
    args: {
        'aria-label': 'Playground',
        width: '31.25rem',
        loop: false,
        navigation: true,
        navigatorInPageIndicator: true,
        numericIndicator: false,
        pageIndicatorContainer: true,
        pageIndicator: true,
        pageIndicatorsOrientation: 'bottom',
        swipeEnabled: true,
        vertical: false,
        noPaginationContainerBorder: false,
        contentBackground: 'translucent',
        pageIndicatorBackground: 'solid',
        visibleSlidesCount: 1,
        slideTransitionDuration: 150
    },
    argTypes: {
        pageIndicatorsOrientation: { control: 'inline-radio', options: ['bottom', 'top'] },
        contentBackground: { control: 'inline-radio', options: ['translucent', 'solid', 'transparent'] },
        pageIndicatorBackground: { control: 'inline-radio', options: ['solid', 'translucent', 'transparent'] }
    }
} satisfies Meta<typeof Carousel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <div className="flex justify-center">
            <Carousel {...args} height={args.vertical ? '22.5rem' : args.height}>
                {slides(5, args.vertical ? 300 : 500)}
            </Carousel>
        </div>
    )
};

export const Basic: Story = {
    render: () => (
        <>
            <Heading>One slide at a time</Heading>
            <div className="flex justify-center">
                <Carousel width="31.25rem" aria-label="Photos">
                    {slides(5)}
                </Carousel>
            </div>

            <Heading>Many slides: a numeric indicator</Heading>
            <div className="flex justify-center">
                <Carousel width="31.25rem" aria-label="More photos">
                    {slides(10)}
                </Carousel>
            </div>
        </>
    ),
    play: async ({ canvasElement }) => {
        const listbox = canvasElement.querySelector<HTMLElement>('[aria-label="Photos"]')!;
        listbox.focus();
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(() => expect(listbox.getAttribute('aria-activedescendant')).toBeTruthy());
        await expect(canvasElement.querySelector('[aria-live]')?.textContent).toBe('Displaying item 2 of 5');
        await userEvent.keyboard('{ArrowLeft}');
    }
};

export const Navigation: Story = {
    name: 'Navigation, vertical and loop',
    render: () => (
        <>
            <Heading>Buttons over the slides, indicators on top</Heading>
            <div className="flex justify-center">
                <Carousel
                    width="31.25rem"
                    aria-label="Horizontal navigation"
                    navigatorInPageIndicator={false}
                    pageIndicatorsOrientation="top"
                >
                    {slides(5)}
                </Carousel>
            </div>

            <Heading>Vertical</Heading>
            <div className="flex justify-center">
                <Carousel
                    width="18.75rem"
                    height="22.5rem"
                    aria-label="Vertical navigation"
                    vertical
                    navigatorInPageIndicator={false}
                >
                    {slides(5, 300)}
                </Carousel>
            </div>

            <Heading>Looped</Heading>
            <div className="flex justify-center">
                <Carousel width="31.25rem" aria-label="Looped" loop>
                    {slides(5)}
                </Carousel>
            </div>

            <Heading>Without navigation buttons (swipe or use the arrow keys)</Heading>
            <div className="flex justify-center">
                <Carousel width="31.25rem" aria-label="Swipe only" navigation={false}>
                    {slides(5)}
                </Carousel>
            </div>

            <Heading>Without page indicators</Heading>
            <div className="flex justify-center">
                <Carousel width="31.25rem" aria-label="No indicators" pageIndicator={false}>
                    {slides(5)}
                </Carousel>
            </div>
        </>
    )
};

/** The visual reference: fundamental-styles' "Bottom page indicator" and "Top page indicator" stories. */
export const PageIndicators: Story = {
    name: 'Page indicators',
    render: () => (
        <div className="flex flex-col items-center">
            <Heading>Navigation buttons in page indicator</Heading>
            <At at={4} id="ci-bottom" width="20rem" aria-label="Bottom page indicator">
                {slides(7, 320, 200)}
            </At>
            <Heading>Navigation buttons in page indicator (vertical)</Heading>
            <At at={4} id="ci-vertical" width="20rem" height="15.5rem" vertical aria-label="Vertical page indicator">
                {slides(7, 320, 200)}
            </At>
            <Heading>Content navigation buttons</Heading>
            <At at={4} id="ci-content" width="20rem" navigatorInPageIndicator={false} aria-label="Content buttons">
                {slides(7, 320, 200)}
            </At>
            <Heading>Numeric page indicator</Heading>
            <Carousel id="ci-numeric" width="20rem" numericIndicator loop aria-label="Numeric page indicator">
                {slides(4, 320, 200)}
            </Carousel>
            <Heading>No page indicator</Heading>
            <Carousel
                id="ci-none"
                width="20rem"
                pageIndicatorContainer={false}
                navigatorInPageIndicator={false}
                aria-label="No page indicator"
            >
                {slides(4, 320, 200)}
            </Carousel>
            <Heading>Top page indicator with navigation buttons</Heading>
            <At at={4} id="ci-top" width="20rem" pageIndicatorsOrientation="top" aria-label="Top page indicator">
                {slides(7, 320, 200)}
            </At>
            <Heading>Top numeric page indicator</Heading>
            <Carousel
                id="ci-top-numeric"
                width="20rem"
                pageIndicatorsOrientation="top"
                navigatorInPageIndicator={false}
                numericIndicator
                aria-label="Top numeric page indicator"
            >
                {slides(4, 320, 200)}
            </Carousel>
        </div>
    )
};

function Cards() {
    const [cards, setCards] = useState([1, 2, 3, 4, 5, 6]);
    const [last, setLast] = useState('None');
    const card = (n: number, name: string) => (
        <CarouselItem key={n}>
            <div className="w-75 p-2 leading-normal">
                <Card>
                    <CardHeader>
                        <CardMainHeader>
                            <CardTitle>
                                {name} {n}
                            </CardTitle>
                            <CardSubtitle>
                                Subtitle of {name.toLowerCase()} {n}
                            </CardSubtitle>
                        </CardMainHeader>
                    </CardHeader>
                    <CardContent>
                        <p className="m-0 p-4 font-sap-font-family text-sap-font-size text-sap-text-color">
                            Content of {name.toLowerCase()} {n}.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </CarouselItem>
    );
    return (
        <>
            <Heading>Two cards at a time</Heading>
            <div className="flex justify-center">
                <Carousel
                    visibleSlidesCount={2}
                    aria-label="Cards"
                    onSlideChange={(event) => setLast(event.slideDirection)}
                >
                    {cards.map((n) => card(n, 'Card'))}
                </Carousel>
            </div>
            <p className="font-sap-font-family text-sap-font-size text-sap-text-color">Last slide: {last}</p>

            <Heading>As many as fit (resize the window) and changing slides</Heading>
            <div className="mb-2 flex gap-2">
                <Button label="Add card" onClick={() => setCards((c) => [...c, c.length + 1])} />
                <Button label="Remove card" onClick={() => setCards((c) => c.slice(0, -1))} />
            </div>
            <Carousel visibleSlidesCount="auto" aria-label="Fitting cards">
                {cards.map((n) => card(n, 'Product'))}
            </Carousel>
        </>
    );
}

export const MultipleSlides: Story = {
    name: 'Several slides at once',
    render: () => <Cards />
};

const VARIANTS: {
    label: string;
    content: CarouselBackgroundOptions;
    indicators: CarouselBackgroundOptions;
    noBorder?: boolean;
}[] = [
    { label: 'Transparent content', content: 'transparent', indicators: 'solid' },
    { label: 'Solid content', content: 'solid', indicators: 'solid' },
    { label: 'Transparent page indicators', content: 'solid', indicators: 'transparent' },
    { label: 'Translucent page indicators', content: 'solid', indicators: 'translucent' },
    { label: 'Page indicators without a border', content: 'solid', indicators: 'solid', noBorder: true }
];

export const Backgrounds: Story = {
    render: () => (
        <>
            {VARIANTS.map((variant, index) => (
                <div key={variant.label}>
                    <Heading>{variant.label}</Heading>
                    <div className="flex justify-center">
                        <Carousel
                            id={`ci-background-${index}`}
                            width="25rem"
                            aria-label={variant.label}
                            contentBackground={variant.content}
                            pageIndicatorBackground={variant.indicators}
                            noPaginationContainerBorder={!!variant.noBorder}
                        >
                            {Array.from({ length: 3 }, (_, i) => (
                                <CarouselItem key={i} className="p-6">
                                    <img src={image(i, 200)} alt={`Slide ${i + 1}`} />
                                </CarouselItem>
                            ))}
                        </Carousel>
                    </div>
                </div>
            ))}
        </>
    )
};

function LoadingAndError() {
    const [loading, setLoading] = useState(true);
    return (
        <>
            <Heading>Loading a slide</Heading>
            <div className="flex flex-col items-center gap-2">
                <Carousel width="18.75rem" height="25rem" aria-label="Loading">
                    <CarouselItem loading={loading}>
                        <img src={image(0, 300)} alt="Slide 1" />
                    </CarouselItem>
                    <CarouselItem>
                        <img src={image(1, 300)} alt="Slide 2" />
                    </CarouselItem>
                </Carousel>
                <Button label={loading ? 'Stop loading' : 'Start loading'} onClick={() => setLoading(!loading)} />
            </div>

            <Heading>Error message</Heading>
            <div className="flex justify-center">
                <Carousel id="ci-error" width="31.25rem" height="25rem" aria-label="Error">
                    <MessagePage type="error">
                        <MessagePageTitle>Items could not be loaded.</MessagePageTitle>
                    </MessagePage>
                </Carousel>
            </div>
        </>
    );
}

export const States: Story = {
    name: 'Loading and error',
    render: () => <LoadingAndError />
};
