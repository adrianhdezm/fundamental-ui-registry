import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { RatingIndicator, type RatingIndicatorProps } from './rating-indicator';

const ROW = 'flex flex-wrap items-center gap-4 font-sap-font-family text-sap-font-size text-sap-text-color';
const LABEL = 'min-w-48';
const SIZES = ['lg', 'md', 'sm', 'xs'] as const;

const meta = {
    title: 'Components/Rating Indicator',
    component: RatingIndicator,
    parameters: {
        docs: {
            description: {
                component:
                    'Shows a rating as stars or custom icons and lets the user rate. It is a slider: Left/Down and Right/Up change the rating by one (or a half with `allowHalves`), Home and End go to 0 and the maximum and digit keys set it; clicking the first half of a star rates a half. ' +
                    'With `ratings` it shows the average and the number of votes, and with `displayAllRatings` the votes per rating in a popover.'
            }
        }
    },
    argTypes: { size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] } },
    args: {
        'aria-label': 'Rating',
        defaultValue: 3,
        size: 'md',
        indicatorCapacity: 5,
        allowHalves: false,
        displayMode: false,
        nonInteractive: false,
        disabled: false,
        showDynamicText: true
    }
} satisfies Meta<typeof RatingIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** A rating with its value printed after it (Angular's `[(value)]` examples). */
function Rated({
    initial,
    counted = false,
    ...props
}: RatingIndicatorProps & { initial: number | null; counted?: boolean }) {
    const [value, setValue] = useState<number | null>(initial);
    const [changes, setChanges] = useState(0);
    return (
        <>
            <RatingIndicator
                {...props}
                value={value}
                onValueChange={(next) => {
                    setValue(next);
                    setChanges((n) => n + 1);
                }}
            />
            <span>
                Value: {String(value)}
                {counted && `, changes: ${changes}`}
            </span>
        </>
    );
}

/** Value and touched of a rating, the React form of Angular's form control example. */
function FormRating() {
    const [value, setValue] = useState<number | null>(4);
    const [touched, setTouched] = useState(false);
    return (
        <>
            <RatingIndicator
                aria-labelledby="ri-4"
                value={value}
                onValueChange={setValue}
                onBlur={() => setTouched(true)}
            />
            <span>
                Value: {String(value)}, touched: {String(touched)}
            </span>
        </>
    );
}

export const Default: Story = {
    render: () => (
        <div className="flex flex-col gap-2">
            <div className={ROW}>
                <span className={LABEL} id="ri-1">
                    Rate (whole stars)
                </span>
                <Rated aria-labelledby="ri-1" initial={2} counted />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-2">
                    Halves
                </span>
                <Rated aria-labelledby="ri-2" allowHalves initial={2.5} />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-3">
                    7 stars, rounded from 4.6
                </span>
                <RatingIndicator aria-labelledby="ri-3" indicatorCapacity={7} value={4.6} />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-4">
                    Forms
                </span>
                <FormRating />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-5">
                    Disabled
                </span>
                <RatingIndicator aria-labelledby="ri-5" disabled allowHalves value={3.5} />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-6">
                    Non-interactive
                </span>
                <RatingIndicator aria-labelledby="ri-6" nonInteractive value={2} />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-7">
                    No value
                </span>
                <RatingIndicator aria-labelledby="ri-7" />
            </div>
        </div>
    )
};

export const Sizes: Story = {
    name: 'Sizes and display mode',
    render: () => (
        <div className="flex flex-wrap gap-x-16 gap-y-6">
            <div className="flex flex-col gap-2">
                {SIZES.map((size) => (
                    <div key={size} className={ROW}>
                        <span className="w-16" id={`ri-s-${size}`}>
                            {size}
                        </span>
                        <RatingIndicator aria-labelledby={`ri-s-${size}`} size={size} value={2} />
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-2">
                {SIZES.map((size) => (
                    <div key={size} className={ROW}>
                        <span className="w-32" id={`ri-d-${size}`}>
                            Display {size}
                        </span>
                        <RatingIndicator displayMode aria-labelledby={`ri-d-${size}`} size={size} value={2} />
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-2">
                {SIZES.map((size) => (
                    <div key={size} className={ROW}>
                        <span className="w-32" id={`ri-h-${size}`}>
                            Halves {size}
                        </span>
                        <RatingIndicator allowHalves aria-labelledby={`ri-h-${size}`} size={size} value={2.5} />
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-2">
                {SIZES.map((size) => (
                    <div key={size} className={ROW}>
                        <span className="w-32" id={`ri-t-${size}`}>
                            Total ratings {size}
                        </span>
                        <RatingIndicator
                            showDynamicText
                            aria-labelledby={`ri-t-${size}`}
                            size={size}
                            value={3}
                            totalRatings={111}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
};

const RATINGS = { 1: 4, 2: 2, 3: 9, 4: 23, 5: 41 };

export const Ratings: Story = {
    name: 'Ratings and custom icons',
    render: () => (
        <div className="flex flex-col gap-2">
            <div className={ROW}>
                <span className={LABEL} id="ri-r1">
                    Average of ratings
                </span>
                <RatingIndicator aria-labelledby="ri-r1" allowHalves ratings={RATINGS} />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-r2">
                    Votes per rating on hover
                </span>
                <RatingIndicator aria-labelledby="ri-r2" displayMode displayAllRatings allowHalves ratings={RATINGS} />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-r6">
                    7 stars, votes per rating
                </span>
                <RatingIndicator
                    aria-labelledby="ri-r6"
                    indicatorCapacity={7}
                    displayAllRatings
                    ratings={{ 1: 1, 2: 100, 5: 1, 7: 10 }}
                />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-r7">
                    Wrong ratings data (an array)
                </span>
                {/* upstream's example of wrong data: an array is read as votes per index */}
                <RatingIndicator
                    aria-labelledby="ri-r7"
                    size="lg"
                    displayAllRatings
                    ratings={[1, 2, 3, 4, 5] as unknown as Record<number, number>}
                />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-r3">
                    Average and total given
                </span>
                <RatingIndicator aria-labelledby="ri-r3" nonInteractive ratingAverage={3.2} totalRatings={126} />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-r4">
                    Custom icons
                </span>
                <RatingIndicator
                    aria-labelledby="ri-r4"
                    allowHalves
                    ratedIcon="decline"
                    unratedIcon="circle-task-2"
                    value={2.5}
                />
            </div>
            <div className={ROW}>
                <span className={LABEL} id="ri-r5">
                    Custom icons, large
                </span>
                <RatingIndicator aria-labelledby="ri-r5" size="lg" ratedIcon="heart" unratedIcon="heart-2" value={3} />
            </div>
        </div>
    )
};

export const OpenVotes: Story = {
    name: 'Open: Votes per rating',
    tags: ['!autodocs'],
    render: () => (
        <RatingIndicator aria-label="Product rating" displayMode displayAllRatings allowHalves ratings={RATINGS} />
    ),
    // hovers the number of votes and waits for the votes per rating
    play: async ({ canvasElement }) => {
        await userEvent.hover(canvasElement.querySelector<HTMLElement>('[data-slot=rating-indicator] a')!);
        await waitFor(() => expect(document.querySelector('[role=dialog] ul li')).not.toBeNull());
    }
};

// fundamental-styles' examples, for the visual comparison

export const CustomIcons: Story = {
    name: 'Custom icons and capacities',
    parameters: {
        docs: {
            description: {
                story: "fundamental-styles' Custom icons and Different values examples: other icons (its `notification` glyph is `message-error` in the current SAP icon font), and 6 and 7 icons."
            }
        }
    },
    render: () => (
        <div className="flex flex-col items-start gap-4">
            <RatingIndicator
                aria-label="Custom icons"
                allowHalves
                ratedIcon="message-error"
                unratedIcon="bo-strategy-management"
                value={2.5}
            />
            <RatingIndicator
                aria-label="Custom icons large"
                size="lg"
                ratedIcon="message-error"
                unratedIcon="bo-strategy-management"
                value={2.5}
                allowHalves
            />
            <RatingIndicator aria-label="Six" indicatorCapacity={6} value={2} />
            <RatingIndicator aria-label="Seven" indicatorCapacity={7} value={2} />
            <RatingIndicator aria-label="Disabled" disabled value={2} />
        </div>
    )
};
