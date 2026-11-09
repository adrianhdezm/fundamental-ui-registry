## upload-collection

Sources: fundamental-react: none · Angular [`registry/ui/upload-collection`](../../../angular/registry/ui/upload-collection/) ·
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

### Visual differences from fundamental-styles, kept on purpose

| Difference                                           | Cause                                                                                        | Resolution                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Separator 4px narrower                               | fundamental-styles' separator holds the space after the bullet; ours sits between two spaces | Kept: the same text and spacing on the line |
| Extension `display: block` instead of `inline-block` | A flex item of Angular's form item (fundamental-styles' is a block)                          | Kept: the same place                        |
| Title container `cursor: auto` instead of `pointer`  | fundamental-styles' file with a title container is an interactive item                       | Kept: not a difference of the container     |
