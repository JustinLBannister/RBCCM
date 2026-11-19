# RBCCM Marketo Modal

"Talk with an expert." pop-up with an embedded Marketo form. It stays hidden until a visitor clicks any link on the page whose URL is `#` plus the Modal ID (default `#request-demo`), for example the hero and CTA band "Request a demo" buttons. Place one instance anywhere on the page.

## For editors and BAs

### Purpose
A pop-up dialog that holds a Marketo form, so a visitor can ask for a demo without leaving the page. After a successful submit the form is swapped for a thank-you message. Used on MAAS+MATA (live). It has one skin.

### What the editor can change
- The heading, in two parts: "Heading (dark part)" and "Heading (blue part)".
- The subheading under it (plain text or light HTML such as bold, italic and links).
- Which Marketo form loads, by typing its number in "Marketo form ID".
- The button wording: the submit button label, the Cancel label, the close (X) label for screen readers and the thank-you close button label.
- The thank-you heading and message shown after a successful submit. `{FirstName}` in the thank-you heading is replaced with the first name the visitor typed.
- The "Modal ID". Buttons elsewhere on the page open the pop-up by linking to `#` plus this ID.
- Technical fields exist and are set at deploy: CSS path, JS path, "Last updated" (cache version), Marketo base URL and Marketo Munchkin ID.

### What it does not do
- The form's fields, the consent checkbox and which fields are required are not set in TeamSite. They come from the form in Marketo (form builder). To add, remove or change a field, change the form in Marketo.
- Field labels come from Marketo, except seven that the script always rewrites: First name, Last name, Company, Title, Business email, Phone number and Asset class. Changing those seven labels in Marketo has no effect here.
- The error messages are fixed in the script and cannot be edited: "This field is required.", "Must be valid email." and "Must be Business email.".
- It does not accept personal email addresses. Addresses at gmail, yahoo, hotmail, live, aol and outlook are rejected. That list is fixed in the script.
- It does not put a button on the page. The buttons that open it belong to other components (hero, CTA band); set their URL to `#` plus the Modal ID.
- It does not send the visitor to another page after submit. The thank-you message shows in the same pop-up.
- It does not go back to the form after a successful submit. Reopening the pop-up shows the thank-you message until the page is reloaded.
- It does not show Marketo's field instruction text; the stylesheet hides it.
- It does not store or email the lead itself. The submit goes to Marketo.

### Limits
- One Marketo form per pop-up. The Modal ID must be unique on the page.
- The panel is at most 600px wide. From 600px wide the fields sit in two columns (First name and Last name, Company and Title, Business email and Phone number) with Asset class, the consent checkbox and the buttons full width. Below 600px everything is one column.
- Fields the design does not know about keep their Marketo label and are placed full width after the known ones.
- A field that allows several choices (such as Asset class) is shown as a row of checkboxes.
- If the form is taller than the screen, the content scrolls inside the pop-up and a thin progress bar on the right shows how far down the visitor is.
- Modal ID: letters, numbers, hyphens and underscores only; anything else is removed. Marketo form ID: digits only; anything else is removed.
- Text length: No enforced character limit on the TeamSite fields.

### Empty and edge cases
- Subheading blank: hidden. Blue heading part blank: only the dark part shows.
- Both heading parts blank: an empty heading is output and the pop-up has no name for screen readers. Fill in at least the dark part.
- Marketo form ID blank: the pop-up opens with the heading and subheading only, and no form.
- Submit, Cancel or close labels blank: "Submit", "Cancel" and "Close" are used.
- Thank-you message blank: hidden. Thank-you heading blank: an empty heading is output.
- `{FirstName}` with no first name entered: the placeholder is dropped, along with a comma in front of it.
- Modal ID blank: `request-demo` is used.
- A page address ending in `#` plus the Modal ID opens the pop-up as the page loads. Closing it removes that ending from the address bar.
- Scripts off: the pop-up never opens, so the buttons that link to it do nothing.
- Marketo unreachable or blocked: the pop-up opens with the heading and an empty form area. No fallback message is shown.
- A second Marketo form on the same page (for example the Marketo footer): supported. This form's field IDs are renamed so the two do not clash.
- On a successful submit a "mktoLead" event is pushed to the page's dataLayer.

### Accessibility
- The heading is an `h2`, and so is the thank-you heading. The editor cannot change the level.
- The pop-up is a dialog named by its heading.
- On open, focus moves to the pop-up itself so screen readers announce the dialog and its heading; the next Tab goes to the close button.
- Keyboard: Tab and Shift+Tab stay inside the pop-up and loop round. Esc closes it. The page behind cannot be reached or scrolled while it is open.
- It closes from the X, Cancel, the thank-you close button, Esc or a click outside the panel. Focus then returns to the button that opened it.
- The close (X) button takes its name from "Close (X) button label for screen readers"; its icon is hidden from screen readers.
- Errors: on submit, every field with a problem gets its own message underneath, tied to the field for screen readers, and focus moves to the first one on screen. Messages update as the visitor corrects each field.
- Required fields show an asterisk after the label, following what Marketo marks as required.
- Rows of checkboxes built from a multi-choice field are grouped and labelled with the field's label.
- After a successful submit, focus moves to the thank-you heading.
- Reduced motion: the opening animation and the label, arrow and progress bar transitions are turned off.
- There are no images, so no alt text.

### Open questions
- Which fields are on the Marketo form (default ID 1602), and which are required, is set in Marketo and not recorded in these files.
- The consent wording and privacy link come from the Marketo form and are not recorded in these files.
- The error messages and the seven rewritten field labels are fixed in English. Confirm whether a French version is needed.
- Confirm that the list of rejected email providers (gmail, yahoo, hotmail, live, aol, outlook) is the agreed one.
- What happens to a lead after submit (routing, notifications) is on the Marketo side and not in these files.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-marketo-modal.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-marketo-modal.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-marketo-modal.css` and `/assets/rbccm/js/components/rbccm-marketo-modal.js`.

## Files

| File | What it is |
|---|---|
| `rbccm-marketo-modal.xsl` | TeamSite skin |
| `rbccm-marketo-modal-properties.xml` | Fields |
| `rbccm-marketo-modal.css` | Ships to `/assets/rbccm/css/components/rbccm-marketo-modal.css` |
| `rbccm-marketo-modal.js` | Ships to `/assets/rbccm/js/components/rbccm-marketo-modal.js` |
| `local-test.html` | Local preview (two sample buttons that open the pop-up) |
