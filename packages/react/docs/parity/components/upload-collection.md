## upload-collection

Sources: fundamental-react: none · Angular [`registry/ui/upload-collection`](../../../../angular/registry/ui/upload-collection/) ·
fundamental-styles [Upload Collection](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-components-upload-collection--docs)
Registry: `registry/ui/upload-collection/`, built on the registry's byline `List` (its keyboard navigation and
selection), `Input`, `Button` and `ObjectStatus`; no Base UI part of its own.

API: Angular's component and directives, composed the same way:

```tsx
<UploadCollection>
  <UploadCollectionItem fileName={file.name} onFileNameChange={rename} extension="pdf" onDelete={remove}>
    <UploadCollectionThumbnail>
      <Icon glyph="pdf-attachment" />
    </UploadCollectionThumbnail>
    <ListContent>
      <UploadCollectionTitleContainer>
        <UploadCollectionTitle render={<Link href="#" />} />
        <UploadCollectionFormItem />
      </UploadCollectionTitleContainer>
      <UploadCollectionDescription>
        Uploaded by Lisa Miller <UploadCollectionTextSeparator /> 1.2 MB
      </UploadCollectionDescription>
      <UploadCollectionStatusGroup>
        <UploadCollectionStatusItem status="positive" label="Approved" />
      </UploadCollectionStatusGroup>
    </ListContent>
    <UploadCollectionButtonGroup />
  </UploadCollectionItem>
</UploadCollection>
```

| Angular                                                                                   | React                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fd-upload-collection` (List host directive, byline), `small`, `ariaLabel`                | `UploadCollection`: a byline `List` (its props, e.g. `selection`), `small`, `aria-label` ("Uploaded files")                                                                                                                     |
| `li fd-list-item fd-upload-collection-item`                                               | `UploadCollectionItem`: a `ListItem` (its props), `role="listitem"` by default                                                                                                                                                  |
| `[(fileName)]`, `(fileNameChanged)`                                                       | `fileName` / `defaultFileName` with `onFileNameChange(name)` (after a rename)                                                                                                                                                   |
| `extension`, `(deleteClicked)`                                                            | `extension`, `onDelete`                                                                                                                                                                                                         |
| `fd-upload-collection-thumbnail` on `fd-list-thumbnail`                                   | `UploadCollectionThumbnail` (a `ListThumbnail`)                                                                                                                                                                                 |
| `fd-upload-collection-title-container`                                                    | `UploadCollectionTitleContainer`                                                                                                                                                                                                |
| `fd-upload-collection-title` on `a fdLink fd-list-title`                                  | `UploadCollectionTitle` (a `ListTitle`; `render={<Link href="…" />}` for the link)                                                                                                                                              |
| `fd-upload-collection-description`, `-text-separator`, `-status-group`                    | `UploadCollectionDescription`, `UploadCollectionTextSeparator`, `UploadCollectionStatusGroup`                                                                                                                                   |
| `fd-upload-collection-status-item` on `fd-object-status`                                  | `UploadCollectionStatusItem` (an `ObjectStatus`, its props)                                                                                                                                                                     |
| `fd-upload-collection-form-item` (`placeholder`, `ariaLabel`, ngModel, `fileNameChanged`) | `UploadCollectionFormItem` (`placeholder`, `aria-label`, both "Filename"; `onValueChange`, `Input` props)                                                                                                                       |
| `fd-upload-collection-button-group` (inputs and outputs)                                  | `UploadCollectionButtonGroup`: `allowFileNameEdit`, `allowFileDeletion`, `disableFileNameEdit`, `disableFileDeletion`, `editLabel`, `deleteLabel`, `okText`, `cancelText`, `onEditClick(editing)`, `onOkClick`, `onDeleteClick` |
| `item.editMode()`, `startEdit()`, … (directive API)                                       | `useUploadCollectionItem()` in custom parts                                                                                                                                                                                     |

Behaviour, as Angular: the edit button replaces the title and markers with a required field holding the name (the
extension after it) that takes the focus, and the buttons with Ok and Cancel; Enter or Ok applies the trimmed name
(not an empty one: Ok is disabled and the field shows the error state), Escape or Cancel discards it; either way the
focus goes back to the edit button. The title's text is the name and extension, shortened in the middle ("…" kept
within 95% of the container) until it fits, again when the container is resized, with the full name as its tooltip;
it is set as text, so markup in a name stays text. The small layout wraps the buttons below the file, and the
content keeps its line next to the thumbnail. With `selection` and a `Checkbox` in an item, the item shows and
describes its selection (the list's "Selected"/"Not selected"); the buttons stop their clicks from reaching the item,
so they do not toggle it.

**Differences from Angular, on purpose:**

- Enter in the rename field is prevented after it applies the name: the focus returns to the edit button within the
  same key press (React runs the effect right away; Angular waits for the next render), and the key would otherwise
  start editing again.
- `UploadCollection` is a `list` and its items `listitem`s also with `selection` (a `List` would be a `listbox` of
  `option`s); the items hold buttons and fields, which options cannot. The checkbox is reached through the item
  (Space and Enter toggle it, as `List`).
- The title and the rename field take pointer events (`pointer-events-auto`), as fundamental-styles' link title; the
  list content and title have `pointer-events: none`, which Angular's title link and rename field inherit.
- The button group is laid out as fundamental-styles': inline buttons with a 0.125rem start margin each (0.5rem after
  the first in the small layout) and a space between them, instead of Angular's flex row with `gap-0.5`/`gap-2`
  (no margin before the first button, no space).
- A title shrunk next to markers is shortened too (when its text overflows); Angular only shortens a title as wide
  as its container, so a long name with a marker is cut at the end by the ellipsis.
- The markers are hidden while renaming whatever they are (every child of the title container other than the title
  and the field); Angular hides `[fd-object-marker]` children only.
- A link title keeps the link colour and its 1rem line height over the list title's (`[a&]:` classes), as
  fundamental-styles' `fd-list__title fd-link`.

### Stories vs. sources

| Source  | Example                   | React story              | Status     | Notes                                                           |
| ------- | ------------------------- | ------------------------ | ---------- | --------------------------------------------------------------- |
| Angular | Default                   | `Default`                | ✅ covered | Three files, a marker, descriptions and statuses.               |
| Angular | Small                     | `Small`                  | ✅ covered | 29.5rem wide as fundamental-styles' (Angular 30rem).            |
| Angular | Empty                     | `Empty`                  | ✅ covered | A "No files uploaded" no-data item.                             |
| Angular | No data                   | `NoData`                 | ✅ covered | A message page.                                                 |
| Angular | Customization             | `Customization`          | ✅ covered | Buttons hidden or disabled per file.                            |
| Angular | Complex                   | `Complex`                | ✅ covered | Toolbar with a button-only `FileUploader`, selection, dialog.   |
| Angular | Open: delete confirmation | `OpenDeleteConfirmation` | ✅ covered | The confirmation `Dialog` opened in `play`.                     |
| —       | —                         | `Playground`             | ➕ added   | `small` and `selection`.                                        |
| —       | —                         | `Edit`, `EditSmall`      | ➕ added   | Every file being renamed (`play`), as fundamental-styles' Edit. |

### Tests vs. sources

| Source  | Behaviour                                           | React test                                                                  | Status     |
| ------- | --------------------------------------------------- | --------------------------------------------------------------------------- | ---------- |
| Angular | A list, names with extensions                       | is a list of files with their names and extensions                          | ✅ covered |
| Angular | Middle shortening, full name tooltip                | shortens long names in the middle, keeping the extension                    | ✅ covered |
| Angular | Rename: focus, empty disables Ok, Enter, focus back | renames a file in place                                                     | ✅ covered |
| Angular | Escape cancels                                      | cancels a rename with Escape                                                | ✅ covered |
| Angular | Delete                                              | deletes a file                                                              | ✅ covered |
| Angular | Markup in names stays text                          | renders a file name with markup as text, also after a rename                | ✅ covered |
| Angular | `allowFileNameEdit`, `allowFileDeletion`            | hides the buttons with allowFileNameEdit and allowFileDeletion (`rerender`) | ✅ covered |
| Angular | `disableFileNameEdit`, `disableFileDeletion`        | disables the buttons with disableFileNameEdit and disableFileDeletion       | ✅ covered |
| Angular | Cancel discards, focus back                         | discards a rename with Cancel                                               | ✅ covered |
| Angular | Form item as a form control                         | reports the edited name with onValueChange of the form item                 | ✅ covered |
| Angular | Small layout wraps the buttons                      | wraps the buttons below the file in small mode (`rerender`)                 | ✅ covered |
| Angular | Selection marks and describes items                 | marks items as selected with selection                                      | ✅ covered |
| —       | Re-fit on resize                                    | fits the name again when the container is resized                           | ➕ extra   |
| —       | Ok button, trimmed name                             | renames with the Ok button                                                  | ➕ extra   |
| —       | Labels and button callbacks                         | takes custom labels and reports the button clicks                           | ➕ extra   |
| —       | Parts                                               | lays out descriptions, separators, statuses and the thumbnail               | ➕ extra   |
| —       | Prop spreading, ref (registry convention)           | passes className, native props and the ref to the list and the items        | ➕ extra   |

### Visual comparison

`pnpm visual upload-collection`: 19 cases × 16 combinations, **304/304** matching, against fundamental-styles'
Default (standard and small) and Edit stories. By computed style only where the texts differ (the file names,
descriptions and statuses: fundamental-styles' "File_Name.extension" and long placeholder texts against Angular's
story): the collection, a file at rest and hovered, a file with markers, the thumbnail, the title container, the link
title, the description, the separator, the status group and the first and second statuses (their colours are
ignored: different statuses), the edit field, its form item and the extension. By pixels too: the edit and delete
buttons (cozy and small layout), the hovered edit button and the Ok and Cancel buttons.

| Difference                                                          | Cause                                                                                                                   | Resolution                                                    |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Link title in the list text colour, 18px high (not 16px)            | The list title's `text-(--li-tc)` and `leading-[normal]` win over the link's when tailwind-merge joins them             | Fixed: `[a&]:text-sap-link-color [a&]:leading-4` on the title |
| File 1px higher (100px)                                             | Followed from the title height                                                                                          | Fixed with the title                                          |
| Button group 4px narrower (76px instead of 80px; 104 for Ok/Cancel) | Angular's flex row with `gap-0.5`; fundamental-styles' inline buttons each have a start margin and a space between them | Fixed: inline buttons, `ms-0.5` each, a space between them    |
| Separator line height 14px instead of 16px                          | `leading-none` on the separator; fundamental-styles sets it on the bullet (`::before`)                                  | Fixed: `before:leading-none`                                  |
| Status group in the text colour, not the label colour               | Angular's status group has no colour (not visible: the statuses and separators have their own)                          | Fixed: `text-sap-content-label-color`                         |
| Separator 4px narrower                                              | fundamental-styles' separator holds the space after the bullet; ours sits between two spaces                            | Kept: the same text and spacing on the line                   |
| Extension `display: block` instead of `inline-block`                | A flex item of Angular's form item (fundamental-styles' is a block)                                                     | Kept: the same place                                          |
| Title container `cursor: auto` instead of `pointer`                 | fundamental-styles' file with a title container is an interactive item                                                  | Kept: not a difference of the container                       |

Reviewed by eye in Horizon, cozy and compact, LTR and RTL: Default, Edit mode (small) and Complex. In RTL the
thumbnail is at the right and the buttons at the left, and the extension reads "pdf." after the field (the bidi order
of a text starting with a dot, as fundamental-styles); compact keeps the height of the files (their content sets it) with 26px buttons and
fields. The no-data message page and the dialog are compared in their own reports.

Angular issues found: the link title takes the list text colour and a normal line height when tailwind-merge joins the
list title and link classes (seen in the React port with the same classes, not checked in Angular itself); the title
link and the rename field inherit `pointer-events: none` from the list content and title; the button group is 4px
narrower (`gap-0.5`, no first margin or space); the separator has its `leading-none` on the span instead of the bullet
and the status group no label colour (computed styles only); a long name next to a marker is not shortened in the
middle.
