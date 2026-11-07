import { createRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Checkbox } from '@/ui/checkbox/checkbox';
import { Input } from '@/ui/input/input';
import { Radio, RadioGroup } from '@/ui/radio/radio';
import { FormFieldset, FormGroup, FormGroupHeader, FormHeader, FormItem, FormLabel, FormLegend } from './form';
import { FormInputMessageGroup, type FormInputMessageGroupProps } from './form-input-message-group';
import { FormMessage, type FormMessageType } from './form-message';

const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const settle = async () => {
    await frame();
    await new Promise((r) => setTimeout(r, 50));
    await frame();
};
const $ = <E extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<E>(selector)!;
const labelText = (label: HTMLElement) => label.querySelector<HTMLElement>(':scope > span')!;
const middle = (r: DOMRect) => r.top + r.height / 2;
/** Messages whose popover is shown. */
const openMessages = () =>
    [...document.querySelectorAll<HTMLElement>('[data-slot="form-message"]')].filter(
        (m) => m.checkVisibility() && m.getBoundingClientRect().height > 0
    );

function Labels() {
    return (
        <div>
            <FormItem id="item-name">
                <FormLabel id="name-label" htmlFor="name" required colon>
                    Name
                </FormLabel>
                <Input id="name" />
            </FormItem>
            <FormItem id="item-plain">
                <FormLabel htmlFor="plain">Plain</FormLabel>
                <Input id="plain" />
            </FormItem>
            <FormItem>
                <FormLabel htmlFor="off" disabled>
                    Off
                </FormLabel>
                <Input id="off" disabled />
            </FormItem>
            <FormItem horizontal id="item-horizontal">
                <FormLabel htmlFor="amount">Amount</FormLabel>
                <Input id="amount" />
                <FormLabel unitDescription>EUR</FormLabel>
            </FormItem>
            <div style={{ display: 'flex', height: 60 }} id="row">
                <FormLabel id="alone" independent>
                    Stand-alone
                </FormLabel>
                <FormLabel id="dependent">Dependent</FormLabel>
            </div>
            <div style={{ width: 120 }}>
                <FormLabel id="wrap" allowWrap>
                    A long label that is allowed to wrap onto lines
                </FormLabel>
                <FormLabel id="truncate">A long label that is truncated at the end</FormLabel>
            </div>
            <div style={{ width: 300 }}>
                <FormLabel id="end" alignLabelEnd>
                    End
                </FormLabel>
            </div>
        </div>
    );
}

function Layout({ disabled = false, noBorder = false, legendDisabled = false }) {
    return (
        <div>
            <FormHeader id="header">Address</FormHeader>
            <FormFieldset id="fieldset" disabled={disabled}>
                <FormLegend id="legend">Shipping address</FormLegend>
                <FormGroup id="column" withSpacing>
                    <FormItem>
                        <FormLabel htmlFor="street">Street</FormLabel>
                        <Input id="street" />
                    </FormItem>
                    <FormItem>
                        <FormLabel htmlFor="city">City</FormLabel>
                        <Input id="city" />
                    </FormItem>
                </FormGroup>
            </FormFieldset>
            <FormGroup id="inline" isInline>
                <FormItem isInline>
                    <FormLabel htmlFor="zip">Zip</FormLabel>
                    <Input id="zip" />
                </FormItem>
                <FormItem isInline>
                    <FormLabel htmlFor="country">Country</FormLabel>
                    <Input id="country" />
                </FormItem>
            </FormGroup>
            <fieldset>
                <FormLegend id="own-legend" disabled={legendDisabled}>
                    Own legend
                </FormLegend>
            </fieldset>
            <FormFieldset>
                <FormLegend>Size</FormLegend>
                <RadioGroup defaultValue="s">
                    <Radio value="s">Small</Radio>
                    <Radio value="m">Medium</Radio>
                </RadioGroup>
            </FormFieldset>
            <FormGroupHeader id="group-header" noBorder={noBorder}>
                Group header
            </FormGroupHeader>
        </div>
    );
}

interface MessageHostProps {
    type?: FormMessageType;
    prefix?: string;
    showMessage?: boolean;
    opens?: boolean[];
}

function MessageHost({ type = 'error', prefix = '', showMessage = true, opens }: MessageHostProps) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <FormMessage id="message" type={type} valueStateMessage={prefix}>
                Explains the state
            </FormMessage>
            <FormInputMessageGroup>
                <Input id="own" aria-label="Own" aria-describedby="own-hint" />
                <FormMessage type="error">Error</FormMessage>
            </FormInputMessageGroup>
            <span id="own-hint">Hint</span>
            <FormInputMessageGroup
                open={open}
                onOpenChange={(next) => {
                    opens?.push(next);
                    setOpen(next);
                }}
            >
                <Input id="toggle" aria-label="Toggle" />
                {showMessage && <FormMessage type="error">Shown</FormMessage>}
            </FormInputMessageGroup>
            <span data-testid="open">{String(open)}</span>
            <button id="after">After</button>
        </div>
    );
}

function Groups({
    type = 'error',
    text = 'Message',
    ariaLabel,
    group
}: {
    type?: FormMessageType;
    text?: string;
    ariaLabel?: string;
    group?: Partial<FormInputMessageGroupProps>;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
            {[1, 2, 3, 4].map((n) => (
                <FormInputMessageGroup key={n} popoverAriaLabel={ariaLabel} {...group}>
                    <Input id={`field-${n}`} aria-label={`Field ${n}`} state={type} />
                    <FormMessage type={type}>{`${text} ${n}`}</FormMessage>
                </FormInputMessageGroup>
            ))}
            <div id="away" style={{ height: 40 }} />
        </div>
    );
}

describe('Form', () => {
    describe('FormLabel', () => {
        it('names the control and focuses it on click', async () => {
            await render(<Labels />);
            expect($<HTMLLabelElement>('#name-label').control).toBe($('#name'));
            await expect.element(page.getByRole('textbox', { name: 'Plain', exact: true })).toBeInTheDocument();
            await userEvent.click(labelText($('#name-label')));
            expect(document.activeElement).toBe($('#name'));
        });

        it('required shows an asterisk with empty alt text and colon a colon', async () => {
            await render(<Labels />);
            const required = labelText($('#name-label'));
            expect(getComputedStyle(required, '::after').content).toContain('"*"');
            expect(getComputedStyle(required, '::before').content).toBe('":"');
            const plain = labelText($('label[for=plain]'));
            expect(getComputedStyle(plain, '::after').content).toBe('none');
            expect(getComputedStyle(plain, '::before').content).toBe('none');
            // the colon sits before the asterisk at the end of the text
            expect(parseFloat(getComputedStyle(required, '::before').right)).toBeGreaterThan(
                parseFloat(getComputedStyle(required, '::after').right)
            );
            // the markers are not part of the accessible name
        });

        it('a disabled label is dimmed', async () => {
            await render(<Labels />);
            const text = labelText($('label[for=off]'));
            expect(text.getAttribute('aria-disabled')).toBe('true');
            expect(Number(getComputedStyle(text).opacity)).toBeLessThan(1);
            expect(labelText($('label[for=plain]')).hasAttribute('aria-disabled')).toBe(false);
        });

        it('an independent label renders stand-alone: centred, with no end margin', async () => {
            await render(<Labels />);
            const row = $('#row').getBoundingClientRect();
            const alone = labelText($('#alone'));
            const dependent = labelText($('#dependent'));
            expect(Math.abs(middle(alone.getBoundingClientRect()) - middle(row))).toBeLessThanOrEqual(1);
            expect(getComputedStyle(alone).marginInlineEnd).toBe('0px');
            expect(dependent.getBoundingClientRect().top).toBeLessThan(alone.getBoundingClientRect().top);
            expect(getComputedStyle(dependent).marginInlineEnd).not.toBe('0px');
        });

        it('gets a generated id', async () => {
            await render(<Labels />);
            expect($('label[for=plain]').id).toMatch(/^fd-form-label-/);
            expect($('#name-label').id).toBe('name-label');
        });

        it('allowWrap wraps long labels, otherwise they are truncated', async () => {
            await render(<Labels />);
            const wrap = labelText($('#wrap'));
            const truncate = labelText($('#truncate'));
            expect(wrap.getBoundingClientRect().height).toBeGreaterThan(truncate.getBoundingClientRect().height * 1.5);
            expect(truncate.scrollWidth).toBeGreaterThan(truncate.clientWidth);
            expect(getComputedStyle(truncate).textOverflow).toBe('ellipsis');
        });

        it('alignLabelEnd puts the text at the end of the column', async () => {
            await render(<Labels />);
            const label = $('#end').getBoundingClientRect();
            const text = labelText($('#end')).getBoundingClientRect();
            expect(label.right - text.right).toBeLessThanOrEqual(8);
            expect(text.left - label.left).toBeGreaterThan(200);
        });

        it('passes className, native props and the ref to the label (fundamental-react)', async () => {
            const ref = createRef<HTMLLabelElement>();
            await render(
                <FormLabel ref={ref} className="custom" data-sample="Sample" htmlFor="x">
                    Label
                </FormLabel>
            );
            expect(ref.current!.tagName).toBe('LABEL');
            expect(ref.current!.classList).toContain('custom');
            expect(ref.current!.getAttribute('data-sample')).toBe('Sample');
            expect(ref.current!.htmlFor).toBe('x');
        });
    });

    describe('FormItem', () => {
        it('stacks the label above the control by default', async () => {
            await render(<Labels />);
            const label = $('label[for=plain]').getBoundingClientRect();
            const input = $('#plain').getBoundingClientRect();
            expect(input.top).toBeGreaterThanOrEqual(label.bottom - 1);
            expect(Math.abs(input.left - label.left)).toBeLessThanOrEqual(1);
        });

        it('horizontal puts label, control and unit description on one line', async () => {
            await render(<Labels />);
            const label = $('label[for=amount]').getBoundingClientRect();
            const input = $('#amount').getBoundingClientRect();
            const unit = $('#item-horizontal label:last-child').getBoundingClientRect();
            expect(input.left).toBeGreaterThanOrEqual(label.right - 1);
            expect(unit.left).toBeGreaterThanOrEqual(input.right - 1);
            expect(Math.abs(middle(label) - middle(input))).toBeLessThan(input.height / 2);
        });

        it('passes className, native props and the ref to the root (fundamental-react)', async () => {
            const item = createRef<HTMLDivElement>();
            const group = createRef<HTMLDivElement>();
            await render(
                <FormGroup ref={group} className="g" data-sample="Group">
                    <FormItem ref={item} className="i" data-sample="Item" isInline />
                </FormGroup>
            );
            expect(item.current!.tagName).toBe('DIV');
            expect(item.current!.classList).toContain('i');
            expect(item.current!.getAttribute('data-sample')).toBe('Item');
            // isInline: the item does not grow
            expect(getComputedStyle(item.current!).flexGrow).toBe('0');
            expect(group.current!.tagName).toBe('DIV');
            expect(group.current!.classList).toContain('g');
            expect(group.current!.getAttribute('data-sample')).toBe('Group');
        });
    });

    describe('Fieldset and groups', () => {
        it('fieldset and legend form a named group', async () => {
            await render(<Layout />);
            const fieldset = $('#fieldset');
            expect(fieldset.tagName).toBe('FIELDSET');
            expect(fieldset.firstElementChild).toBe($('#legend'));
            expect($('#legend').tagName).toBe('LEGEND');
            await expect.element(page.getByRole('group', { name: 'Shipping address' })).toBeInTheDocument();
            // no browser chrome
            expect(getComputedStyle(fieldset).borderTopWidth).toBe('0px');
            expect(getComputedStyle(fieldset).paddingTop).toBe('0px');
        });

        it('the legend of a fieldset names the radio group inside it', async () => {
            await render(<Layout />);
            await expect.element(page.getByRole('radiogroup', { name: 'Size' })).toBeInTheDocument();
        });

        it('disabling the fieldset disables its controls and dims the legend', async () => {
            const screen = await render(<Layout />);
            expect(getComputedStyle($('#legend')).opacity).toBe('1');
            await screen.rerender(<Layout disabled />);
            expect($<HTMLInputElement>('#street').matches(':disabled')).toBe(true);
            expect(Number(getComputedStyle($('#legend')).opacity)).toBeLessThan(1);
        });

        it('a disabled legend is dimmed on its own', async () => {
            const screen = await render(<Layout />);
            const legend = $('#own-legend');
            expect(getComputedStyle(legend).opacity).toBe('1');
            await screen.rerender(<Layout legendDisabled />);
            expect(Number(getComputedStyle(legend).opacity)).toBeLessThan(1);
            expect(legend.closest('fieldset')!.disabled).toBe(false);
        });

        it('a form group stacks items in a column; withSpacing adds the gap', async () => {
            await render(<Layout />);
            const street = $('#street').closest<HTMLElement>('[data-slot=form-item]')!.getBoundingClientRect();
            const city = $('#city').closest<HTMLElement>('[data-slot=form-item]')!.getBoundingClientRect();
            expect(city.top - street.bottom).toBe(10);
        });

        it('isInline lays the items out in a row', async () => {
            await render(<Layout />);
            const zip = $('#zip').closest<HTMLElement>('[data-slot=form-item]')!.getBoundingClientRect();
            const country = $('#country').closest<HTMLElement>('[data-slot=form-item]')!.getBoundingClientRect();
            expect(country.left).toBeGreaterThanOrEqual(zip.right - 1);
            expect(country.top).toBe(zip.top);
        });

        it('form header and group header are title bars with a bottom line', async () => {
            const screen = await render(<Layout />);
            const header = $('#header');
            expect(header.tagName).toBe('H4');
            expect(getComputedStyle(header).display).toBe('flex');
            expect(getComputedStyle(header).boxShadow).not.toBe('none');
            expect(header.querySelector('span')!.textContent).toBe('Address');
            expect(getComputedStyle(header.querySelector('span')!).textOverflow).toBe('ellipsis');

            const groupHeader = $('#group-header');
            expect(getComputedStyle(groupHeader).fontWeight).toBe('700');
            expect(getComputedStyle(groupHeader).borderBottomWidth).not.toBe('0px');
            await screen.rerender(<Layout noBorder />);
            expect(getComputedStyle(groupHeader).borderBottomWidth).toBe('0px');
        });

        it('passes className, native props and the ref to fieldset and legend (fundamental-react)', async () => {
            const fieldset = createRef<HTMLFieldSetElement>();
            const legend = createRef<HTMLLegendElement>();
            const lone = createRef<HTMLLegendElement>();
            await render(
                <div>
                    <FormFieldset ref={fieldset} className="f" data-sample="Fieldset">
                        <FormLegend ref={legend} className="l" data-sample="Legend">
                            Legend
                        </FormLegend>
                    </FormFieldset>
                    <FormLegend ref={lone}>Default</FormLegend>
                </div>
            );
            expect(fieldset.current!.tagName).toBe('FIELDSET');
            expect(fieldset.current!.classList).toContain('f');
            expect(fieldset.current!.getAttribute('data-sample')).toBe('Fieldset');
            expect(legend.current!.tagName).toBe('LEGEND');
            expect(legend.current!.classList).toContain('l');
            expect(legend.current!.getAttribute('data-sample')).toBe('Legend');
            expect(lone.current!.tagName).toBe('LEGEND');
        });
    });

    describe('FormMessage', () => {
        it('types show a glyph, a background and a hidden type description', async () => {
            const screen = await render(<MessageHost />);
            const message = $('#message');
            expect(message.getAttribute('aria-live')).toBe('assertive');
            const seen = new Set<string>();
            for (const [type, label] of [
                ['error', 'Invalid Entry'],
                ['warning', 'Warning'],
                ['success', 'Success'],
                ['information', 'Information']
            ] as const) {
                await screen.rerender(<MessageHost type={type} />);
                const srOnly = message.querySelector<HTMLElement>('.sr-only-sap')!;
                expect(srOnly.textContent).toBe(label);
                expect(srOnly.getBoundingClientRect().width).toBeLessThanOrEqual(1);
                expect(message.getAttribute('data-glyph')).toBeTruthy();
                expect(getComputedStyle(message, '::before').content).not.toBe('""');
                seen.add(getComputedStyle(message).backgroundColor);
            }
            expect(seen.size).toBe(4);
            await screen.rerender(<MessageHost type="information" prefix="Check this" />);
            expect(message.querySelector('.sr-only-sap')!.textContent).toBe('Check this');
        });

        it('static and embedded change the width and the shadow', async () => {
            await render(
                <div style={{ width: 400 }}>
                    <FormMessage id="full" type="error">
                        Short
                    </FormMessage>
                    <FormMessage id="static" type="error" static>
                        Short
                    </FormMessage>
                    <FormMessage id="embedded" type="error" embedded>
                        Short
                    </FormMessage>
                </div>
            );
            expect($('#full').getBoundingClientRect().width).toBe(352);
            // fit-content: Angular's w-auto still fills a block container
            expect($('#static').getBoundingClientRect().width).toBeLessThan(150);
            expect(getComputedStyle($('#full')).boxShadow).not.toBe('none');
            expect(getComputedStyle($('#embedded')).boxShadow).toBe('none');
            expect($('#embedded').getBoundingClientRect().width).toBe(400);
        });

        it('passes className, native props and the ref to the root (fundamental-react)', async () => {
            const ref = createRef<HTMLDivElement>();
            await render(
                <FormMessage ref={ref} className="custom" data-sample="Sample">
                    Text
                </FormMessage>
            );
            expect(ref.current!.tagName).toBe('DIV');
            expect(ref.current!.classList).toContain('custom');
            expect(ref.current!.getAttribute('data-sample')).toBe('Sample');
        });
    });

    describe('FormInputMessageGroup', () => {
        it('the message group keeps an author aria-describedby, adds the message and marks errors invalid', async () => {
            await render(<MessageHost />);
            const input = $('#own');
            await expect.poll(() => input.getAttribute('aria-describedby')).toMatch(/^own-hint fd-form-message-/);
            expect(input.getAttribute('aria-invalid')).toBe('true');
            const [, id] = input.getAttribute('aria-describedby')!.split(' ');
            expect(document.getElementById(id)!.textContent).toContain('Error');
        });

        it('keeps the message in aria-describedby when the field changes its own description', async () => {
            const ui = (hint?: string) => (
                <div>
                    <FormInputMessageGroup>
                        <Input id="changing" aria-label="Changing" aria-describedby={hint} />
                        <FormMessage id="changing-message" type="warning">
                            Check
                        </FormMessage>
                    </FormInputMessageGroup>
                    <span id="hint-a">A</span>
                    <span id="hint-b">B</span>
                </div>
            );
            const screen = await render(ui('hint-a'));
            const input = $('#changing');
            await expect.poll(() => input.getAttribute('aria-describedby')).toBe('hint-a changing-message');
            await screen.rerender(ui('hint-b'));
            await expect.poll(() => input.getAttribute('aria-describedby')).toBe('hint-b changing-message');
            await screen.rerender(ui());
            await expect.poll(() => input.getAttribute('aria-describedby')).toBe('changing-message');
        });

        it('aria-errormessage is moved to aria-describedby', async () => {
            await render(
                <FormInputMessageGroup>
                    <Input id="errormessage" aria-label="Error message" aria-errormessage="custom-error" />
                    <FormMessage id="custom-error" type="error">
                        Custom
                    </FormMessage>
                </FormInputMessageGroup>
            );
            const input = $('#errormessage');
            await expect.poll(() => input.getAttribute('aria-describedby')).toBe('custom-error');
            expect(input.hasAttribute('aria-errormessage')).toBe(false);
            expect(input.getAttribute('aria-invalid')).toBe('true');
        });

        it('removing the message removes the managed aria-describedby and aria-invalid', async () => {
            const screen = await render(<MessageHost />);
            const input = $('#toggle');
            await expect.poll(() => input.getAttribute('aria-describedby')).toMatch(/^fd-form-message-/);
            expect(input.getAttribute('aria-invalid')).toBe('true');
            await screen.rerender(<MessageHost showMessage={false} />);
            await settle();
            expect(input.hasAttribute('aria-describedby')).toBe(false);
            expect(input.hasAttribute('aria-invalid')).toBe(false);
        });

        it('the message opens under the field on focus and onOpenChange follows it', async () => {
            const opens: boolean[] = [];
            await render(<MessageHost opens={opens} />);
            const input = $('#toggle');
            await expect.poll(() => input.getAttribute('aria-describedby')).toBeTruthy();
            const message = document.getElementById(input.getAttribute('aria-describedby')!)!;
            expect(message.checkVisibility()).toBe(false);
            await userEvent.click(input);
            await settle();
            expect(opens).toEqual([true]);
            await expect.element(page.getByTestId('open')).toHaveTextContent('true');
            expect(message.checkVisibility()).toBe(true);
            expect(message.textContent).toContain('Invalid Entry');
            expect(message.textContent).toContain('Shown');
            expect(message.getBoundingClientRect().top).toBeGreaterThanOrEqual(
                input.getBoundingClientRect().bottom - 1
            );
            // focus stays in the field
            expect(document.activeElement).toBe(input);
            await userEvent.tab();
            await settle();
            expect(opens).toEqual([true, false]);
            // Tab moves on to the next field
            expect(document.activeElement).toBe($('#after'));
            expect(message.checkVisibility()).toBe(false);
        });

        it('one click moves focus to another group and only its message stays open', async () => {
            await render(<Groups />);
            await userEvent.click($('#field-1'));
            await settle();
            expect(openMessages().map((m) => m.textContent)).toEqual([expect.stringContaining('Message 1')]);
            await userEvent.click($('#field-2'));
            await settle();
            expect(document.activeElement).toBe($('#field-2'));
            expect(openMessages().map((m) => m.textContent)).toEqual([expect.stringContaining('Message 2')]);
        });

        it('rapid focus changes across groups leave only the focused group open', async () => {
            await render(<Groups />);
            for (const id of [1, 3, 2, 4, 1, 3]) $(`#field-${id}`).focus();
            await settle();
            expect(document.activeElement).toBe($('#field-3'));
            expect(openMessages().map((m) => m.textContent)).toEqual([expect.stringContaining('Message 3')]);
            for (const id of [4, 3, 2]) await userEvent.click($(`#field-${id}`));
            await settle();
            expect(document.activeElement).toBe($('#field-2'));
            expect(openMessages().map((m) => m.textContent)).toEqual([expect.stringContaining('Message 2')]);
        });

        it('the message popover body has an aria-label (popoverAriaLabel)', async () => {
            const screen = await render(<Groups />);
            await userEvent.click($('#field-1'));
            await settle();
            const body = () => openMessages()[0].closest<HTMLElement>('[aria-label]')!;
            expect(body().getAttribute('aria-label')).toBe('Field validation messages');
            await userEvent.tab();
            await settle();
            await screen.rerender(<Groups ariaLabel="VAT messages" />);
            await userEvent.click($('#field-1'));
            await settle();
            expect(body().getAttribute('aria-label')).toBe('VAT messages');
        });

        it('non-error message types set aria-describedby without aria-invalid', async () => {
            const screen = await render(<Groups type="default" />);
            const input = $('#field-1');
            await expect.poll(() => input.getAttribute('aria-describedby')).toMatch(/^fd-form-message-/);
            const id = input.getAttribute('aria-describedby');
            expect(input.hasAttribute('aria-invalid')).toBe(false);
            await screen.rerender(<Groups type="error" />);
            expect(input.getAttribute('aria-invalid')).toBe('true');
            for (const type of ['warning', 'success', 'information'] as const) {
                await screen.rerender(<Groups type={type} />);
                await settle();
                expect(input.getAttribute('aria-describedby')).toBe(id);
                expect(input.hasAttribute('aria-invalid')).toBe(false);
            }
            await userEvent.click(input);
            await settle();
            expect(openMessages()[0].id).toBe(id);
        });

        it('changing the message text or type while open updates the popover', async () => {
            const screen = await render(<Groups />);
            const input = $('#field-1');
            await userEvent.click(input);
            await settle();
            const message = openMessages()[0];
            expect(message.textContent).toContain('Invalid Entry');
            const errorBackground = getComputedStyle(message).backgroundColor;
            await screen.rerender(<Groups type="warning" text="Changed" />);
            await settle();
            expect(openMessages()).toEqual([message]);
            expect(message.textContent).toContain('Changed 1');
            expect(message.textContent).toContain('Warning');
            expect(getComputedStyle(message).backgroundColor).not.toBe(errorBackground);
            expect(message.getBoundingClientRect().top).toBeGreaterThanOrEqual(
                input.getBoundingClientRect().bottom - 1
            );
            expect(document.activeElement).toBe(input);
        });

        it('hover triggers show the message while the pointer is on the field or the message', async () => {
            await render(<Groups group={{ triggers: ['mouseenter', 'mouseleave'] }} />);
            await userEvent.hover($('#field-1'));
            await settle();
            const message = openMessages()[0];
            expect(message.textContent).toContain('Message 1');
            // moving onto the message keeps it open, so a link in it can be reached
            await userEvent.hover(message);
            await new Promise((r) => setTimeout(r, 200));
            expect(openMessages()).toEqual([message]);
            await userEvent.hover($('#away'));
            await new Promise((r) => setTimeout(r, 200));
            expect(openMessages()).toEqual([]);
        });

        it('controlled open with no triggers, and Escape and outside clicks when enabled', async () => {
            function Controlled() {
                const [open, setOpen] = useState(true);
                return (
                    <div>
                        <FormInputMessageGroup
                            triggers={[]}
                            open={open}
                            onOpenChange={setOpen}
                            closeOnEscapeKey
                            closeOnOutsideClick
                        >
                            <Input id="controlled" aria-label="Controlled" />
                            <FormMessage type="warning">Controlled message</FormMessage>
                        </FormInputMessageGroup>
                        <button id="reopen" onClick={() => setOpen(true)}>
                            Reopen
                        </button>
                    </div>
                );
            }
            await render(<Controlled />);
            await settle();
            expect(openMessages().length).toBe(1);
            // a click in the field is not outside
            await userEvent.click($('#controlled'));
            await settle();
            expect(openMessages().length).toBe(1);
            await userEvent.keyboard('{Escape}');
            await settle();
            expect(openMessages().length).toBe(0);
            await userEvent.click($('#reopen'));
            await settle();
            expect(openMessages().length).toBe(1);
            await userEvent.click(document.body, { position: { x: 600, y: 600 } });
            await settle();
            expect(openMessages().length).toBe(0);
        });

        it('describes a checkbox and the radios of a group', async () => {
            await render(
                <div>
                    <FormInputMessageGroup>
                        <Checkbox label="Accept" />
                        <FormMessage type="error">Accept the terms</FormMessage>
                    </FormInputMessageGroup>
                    <FormInputMessageGroup>
                        <RadioGroup aria-label="Size" defaultValue="s">
                            <Radio value="s">Small</Radio>
                            <Radio value="m">Medium</Radio>
                        </RadioGroup>
                        <FormMessage type="warning">Small sizes sell out</FormMessage>
                    </FormInputMessageGroup>
                </div>
            );
            const checkbox = page.getByRole('checkbox', { name: 'Accept' });
            await expect.element(checkbox).toHaveAccessibleDescription(/Accept the terms/);
            await expect.element(checkbox).toHaveAttribute('aria-invalid', 'true');
            const radio = page.getByRole('radio', { name: 'Small' });
            await expect.element(radio).toHaveAccessibleDescription(/Small sizes sell out/);
            await userEvent.click(checkbox);
            await settle();
            expect(openMessages().map((m) => m.textContent)).toEqual([expect.stringContaining('Accept the terms')]);
            // the open message covers the next field, as in Angular: move on with Tab
            await userEvent.tab();
            await settle();
            await expect.element(radio).toHaveFocus();
            expect(openMessages().map((m) => m.textContent)).toEqual([expect.stringContaining('Small sizes')]);
        });

        it('passes className, native props and the ref to the root (fundamental-react wrapperProps)', async () => {
            const ref = createRef<HTMLDivElement>();
            await render(
                <FormInputMessageGroup ref={ref} className="custom" data-sample="Sample">
                    <Input aria-label="Field" />
                </FormInputMessageGroup>
            );
            expect(ref.current!.tagName).toBe('DIV');
            expect(ref.current!.classList).toContain('custom');
            expect(ref.current!.getAttribute('data-sample')).toBe('Sample');
            // no message: nothing is shown and the field is not described
            await userEvent.click(page.getByRole('textbox', { name: 'Field' }));
            await settle();
            expect(openMessages()).toEqual([]);
            expect(ref.current!.querySelector('input')!.hasAttribute('aria-describedby')).toBe(false);
        });
    });
});
