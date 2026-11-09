import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '@/ui/avatar/avatar';
import { Button } from '@/ui/button/button';
import { FormLabel } from '@/ui/form/form';
import { Icon } from '@/ui/icon/icon';
import { Link } from '@/ui/link/link';
import { ObjectNumber } from '@/ui/object-number/object-number';
import { ObjectStatus } from '@/ui/object-status/object-status';
import { RatingIndicator } from '@/ui/rating-indicator/rating-indicator';
import { Skeleton } from '@/ui/skeleton/skeleton';
import { Text } from '@/ui/text/text';
import { Title } from '@/ui/title/title';
import { Facet, FacetContainer, FacetContent, FacetFormValue, FacetGroup } from './facets';

const meta = {
    title: 'Components/Facets',
    component: Facet,
    parameters: {
        docs: {
            description: {
                component:
                    'Facets show key information in the header of an object page: form facets (label and value rows), key-value facets (an object status or number), rating facets and image facets. A facet group lays them out in a wrapping row; `alignEnd` pushes a facet to the end.'
            }
        }
    }
} satisfies Meta<typeof Facet>;
export default meta;
type Story = StoryObj<typeof meta>;

// texts as in fundamental-styles' Facets stories, so the facets can be compared by pixels

const FormFacet = ({ id }: { id: string }) => (
    <Facet type="form" facetTitle="Technical Data" headingLevel={3} data-testid="form-facet">
        {[
            ['Base unit', 'Each'],
            ['Length', '23.24 Centimeter'],
            ['Width', '86.1 Centimeter'],
            ['Height', '20.8 Centimeter']
        ].map(([label, value], i) => (
            <FacetContent key={label}>
                <FormLabel colon htmlFor={`${id}-${i}`}>
                    {label}
                </FormLabel>
                <Text id={`${id}-${i}`}>{value}</Text>
            </FacetContent>
        ))}
    </Facet>
);

const ImageFacet = () => (
    <Facet type="image" data-testid="image-facet">
        <Avatar size="l" glyph="money-bills" aria-label="Product" />
    </Facet>
);

const KeyValues = () => (
    <>
        <Facet type="key-value" facetTitle="Status" headingLevel={3} data-testid="status-facet">
            <ObjectStatus status="positive" label="Delivery" large />
        </Facet>
        <Facet type="key-value" facetTitle="Delivery Time" headingLevel={3} data-testid="time-facet">
            <ObjectStatus status="critical" glyph="shipping-status" label="12 days" large />
        </Facet>
        <Facet type="key-value" facetTitle="Assembly Option" headingLevel={3} data-testid="option-facet">
            <ObjectStatus status="negative" label="To be selected" large />
        </Facet>
        <Facet type="key-value" facetTitle="Pricing" headingLevel={3} data-testid="price-facet">
            <ObjectNumber number={579} unit="EUR" status="informative" large />
        </Facet>
    </>
);

const RatingFacet = ({ subtitle }: { subtitle?: string }) => (
    <Facet
        type="rating-indicator"
        facetTitle="Average User Rating"
        subtitle={subtitle}
        headingLevel={3}
        data-testid="rating-facet"
    >
        <RatingIndicator value={2.5} allowHalves nonInteractive aria-label="Average user rating" />
    </Facet>
);

export const Group: Story = {
    name: 'Facet group',
    render: () => (
        <FacetGroup aria-label="Product facets">
            <ImageFacet />
            <FormFacet id="group" />
            <KeyValues />
            <RatingFacet />
        </FacetGroup>
    )
};

export const FormFacets: Story = {
    name: 'Form facet',
    render: () => (
        <FacetGroup aria-label="Form facets">
            <FormFacet id="form" />
            <Facet type="form" facetTitle="Contact Information" headingLevel={3} data-testid="contact-facet">
                <FacetContent>
                    <Icon glyph="add-employee" aria-label="Contact person" />
                    <Link href="#">John Miller</Link>
                </FacetContent>
                <FacetContent>
                    <Icon glyph="outgoing-call" aria-label="Phone" />
                    <Link href="#">+1 234 5678</Link>
                </FacetContent>
                <FacetContent>
                    <Icon glyph="email" aria-label="Email" />
                    <Link href="#">john.miller@company.com</Link>
                </FacetContent>
                <FacetContent>
                    <FormLabel colon htmlFor="form-value-height">
                        Height
                    </FormLabel>
                    <FacetFormValue id="form-value-height">20.8 Centimeter</FacetFormValue>
                </FacetContent>
            </Facet>
        </FacetGroup>
    )
};

export const KeyValue: Story = {
    name: 'Key-value facets',
    render: () => (
        <FacetGroup aria-label="Key values">
            <KeyValues />
        </FacetGroup>
    )
};

export const Rating: Story = {
    name: 'Rating facet',
    parameters: {
        docs: { description: { story: 'A rating facet; `subtitle` shows a text below its title.' } }
    },
    render: () => (
        <FacetGroup aria-label="Ratings">
            <RatingFacet />
            <Facet type="rating-indicator" facetTitle="Average User Rating" subtitle="6 reviews" headingLevel={3}>
                <RatingIndicator value={4} nonInteractive aria-label="Rating from 6 reviews" />
            </Facet>
        </FacetGroup>
    )
};

export const Alignment: Story = {
    name: 'Alignment',
    render: () => (
        <FacetGroup aria-label="Aligned facets">
            <Facet type="image">
                <Avatar size="l" image="assets/landscape.svg" aria-label="Landscape" />
            </Facet>
            <Facet type="key-value" facetTitle="Status" headingLevel={3}>
                <ObjectStatus status="positive" label="Delivery" large />
            </Facet>
            <Facet type="key-value" facetTitle="Pricing" alignEnd headingLevel={3}>
                <ObjectNumber number={579} unit="EUR" large />
            </Facet>
        </FacetGroup>
    )
};

const EXTENSION_ID = '244e1ebe-c20a-45d3-ae15-0b0ebdb1ce9a';
const CopyId = () => <Button variant="transparent" glyph="copy" aria-label="Copy ID" title="Copy ID" />;

export const Custom: Story = {
    name: 'Custom facet',
    parameters: {
        docs: {
            description: {
                story: 'Custom facets hold any content. `FacetContainer` lays it out in a column or, with `flexDirection="row"`, in a row, for example a title with a copy button.'
            }
        }
    },
    render: () => (
        <div className="flex flex-col gap-8">
            <FacetGroup aria-label="Product description">
                <Facet type="custom" facetTitle="Product Description" headingLevel={3} className="w-1/2">
                    <div className="flex flex-col">
                        <span>- Top-design high-quality coffee mug - ideal for a comforting moment; Pack: 6;</span>
                        <span>
                            - Material: Porcelain - durable dishwasher and microwave-safe porcelain that cleans easily
                            and is ideal for everyday service.
                        </span>
                        <span className="mb-8">- Comes in two bright colors.</span>
                        <ObjectStatus
                            status="positive"
                            glyph="message-success"
                            label="In Stock"
                            large
                            className="self-start"
                        />
                    </div>
                </Facet>
            </FacetGroup>
            <FacetGroup aria-label="Custom facets">
                <Facet type="custom">
                    <FacetContainer flexDirection="row" alignItems="center">
                        <FacetContainer>
                            <Title level={3} headerSize={5}>
                                Status
                            </Title>
                            <ObjectStatus status="positive" label="Delivery" large />
                        </FacetContainer>
                        <FacetContainer>
                            <Button variant="transparent" glyph="copy" aria-label="Copy status" title="Copy status" />
                        </FacetContainer>
                    </FacetContainer>
                </Facet>
                <Facet type="custom">
                    <FacetContainer>
                        <FacetContainer flexGap={0.5}>
                            <Title level={3} headerSize={5}>
                                Extension ID
                            </Title>
                        </FacetContainer>
                        <FacetContainer flexDirection="row" alignItems="center" flexGap={0.5}>
                            <span>{EXTENSION_ID}</span>
                            <CopyId />
                        </FacetContainer>
                    </FacetContainer>
                </Facet>
                <Facet type="custom">
                    <FacetContainer flexGap={0.25}>
                        <FacetContainer flexDirection="row" alignItems="center" flexGap={0.5}>
                            <Title level={3} headerSize={5}>
                                Extension ID
                            </Title>
                            <CopyId />
                        </FacetContainer>
                        <FacetContainer>
                            <span>{EXTENSION_ID}</span>
                        </FacetContainer>
                    </FacetContainer>
                </Facet>
                <Facet type="custom">
                    <FacetContainer flexDirection="row" alignItems="center" flexGap={0.25}>
                        <FacetContainer flexGap={0.5}>
                            <Title level={3} headerSize={5}>
                                Extension ID
                            </Title>
                            <span>{EXTENSION_ID}</span>
                        </FacetContainer>
                        <FacetContainer>
                            <CopyId />
                        </FacetContainer>
                    </FacetContainer>
                </Facet>
                <Facet type="custom">
                    <FacetContainer>
                        <Title level={3} headerSize={5}>
                            Extension ID
                        </Title>
                        <Link href="#">
                            {EXTENSION_ID} <Icon glyph="copy" />
                        </Link>
                    </FacetContainer>
                </Facet>
                <Facet type="custom">
                    <FacetContainer flexGap={0.5}>
                        <FacetContent>
                            <FormLabel colon htmlFor="custom-base-unit">
                                Base unit
                            </FormLabel>
                            <Text id="custom-base-unit">Each</Text>
                        </FacetContent>
                        <FacetContainer flexDirection="row" alignItems="center" flexGap={0.5}>
                            <span>{EXTENSION_ID}</span>
                            <CopyId />
                        </FacetContainer>
                    </FacetContainer>
                </Facet>
            </FacetGroup>
        </div>
    )
};

export const Loading: Story = {
    name: 'Loading',
    render: () => (
        <FacetGroup aria-label="Loading facets" aria-busy="true">
            <Facet type="image">
                <Skeleton type="rectangle" width="5rem" height="5rem" />
            </Facet>
            <Facet type="custom">
                <FacetContainer flexGap={0.5}>
                    <Skeleton type="text" width="8rem" textLines={1} />
                    <Skeleton type="text" width="12rem" textLines={3} />
                </FacetContainer>
            </Facet>
            <Facet type="custom">
                <FacetContainer flexGap={0.5}>
                    <Skeleton type="text" width="6rem" textLines={1} />
                    <Skeleton type="rectangle" width="8rem" height="1.5rem" />
                </FacetContainer>
            </Facet>
        </FacetGroup>
    )
};
