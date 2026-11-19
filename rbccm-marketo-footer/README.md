# RBCCM Marketo Footer

"Stay informed" sign-up band: a heading, a subheading and an embedded Marketo form. The form's fields, consent checkbox and button are built by Marketo; this component places the form on the page and adds the heading above it.

## For editors and BAs

### Purpose
A sign-up strip near the bottom of a page where a visitor subscribes to updates through a Marketo form. After a successful submit the strip shows a thank-you message in place of the form. Used on ETF Innovators and 2027 Outlook (both in progress, not live yet). It has one skin.

### What the editor can change
- The heading and the subheading (plain text or light HTML such as bold, italic and links).
- Which Marketo form loads, by typing its number in "Marketo form ID".
- An optional section ID for anchor links (default `stay-informed`) and an optional section aria-label.
- Technical fields exist and are set at deploy: CSS path, "Last updated" (cache version), Marketo base URL and Marketo Munchkin ID.

### What it does not do
- The form's fields, the consent checkbox and which fields are required are not set in TeamSite. They come from the form in Marketo (form builder). To add, remove or change a field, change the form in Marketo.
- It does not restyle the form. The stylesheet covers the band, the heading and the subheading only; the fields and button look the way the Marketo form and its theme output them.
- The submit button always reads "Sign up". The skin sets that wording, whatever the button says in Marketo, and there is no TeamSite field for it.
- The thank-you wording cannot be edited in TeamSite. It is fixed in the skin: "Thanks for signing up." followed by the visitor's first name and ", look for RBC Capital Markets insights in your inbox soon."
- It does not accept personal email addresses. Addresses at gmail, yahoo, hotmail, live, aol and outlook are rejected with the fixed message "Must be Business email.".
- It does not send the visitor to another page after submit.
- It has no background colour field. The band is always light grey-blue (#E7EEF1).
- It does not store or email the sign-up itself. The submit goes to Marketo.

### Limits
- One Marketo form per instance. One skin.
- Content is at most 1140px wide with 23px side gutters.
- The layout changes once, at 992px wide (larger heading and subheading, more space between the heading and the form).
- Marketo form ID: digits only; anything else is removed.
- Text length: No enforced character limit on the TeamSite fields.

### Empty and edge cases
- Heading blank: hidden. Subheading blank: hidden. Both blank: the header block is left out and only the form shows.
- Marketo form ID blank: the heading and subheading show with no form.
- Section aria-label blank: the heading is used. With no heading either, the section has no label.
- Section ID blank: no anchor is output.
- CSS path blank: no stylesheet is linked, so the band is unstyled. Leave the deploy value in place.
- Scripts off, or Marketo unreachable or blocked: the heading and subheading show but the form does not. No fallback message is shown.
- After a successful submit the heading, subheading and form are all replaced by the thank-you message. If the form passes no first name, the second line starts with the comma.
- The "Autofill with LinkedIn" block is output with the form. When jQuery is on the page it is moved into the consent row and hidden on Safari; without jQuery it stays where it is output, below the form.
- A second Marketo form on the same page (for example the Marketo modal): supported. The behaviour here applies only to this form's ID.
- On a successful submit a "mktoLead" event is pushed to the page's dataLayer.

### Accessibility
- The heading is an `h2`, and so is the thank-you heading. The editor cannot change the level.
- The section is labelled with the section aria-label, or the heading when that is blank.
- Field labels, required markers, error messages and keyboard behaviour inside the form come from the Marketo form. The component adds one error, "Must be Business email.", shown against the email field.
- When the thank-you message replaces the form, the skin does not move keyboard focus to it or announce it to screen readers.
- There are no images, so no alt text. There is no animation, so nothing changes under reduced motion.

### Open questions
- Which fields are on the Marketo form (default ID 1574), and which are required, is set in Marketo and not recorded in these files.
- The thank-you line starts with the visitor's first name. Confirm the Marketo form collects a first name.
- The "Sign up" button text, the thank-you wording and the business email message are fixed in English. Confirm whether they need to be editable or available in French.
- The notes in the fields file and the skin say the component styles the Marketo fields; the stylesheet says it leaves the form as Marketo outputs it. Confirm which is intended.
- Confirm that the list of rejected email providers (gmail, yahoo, hotmail, live, aol, outlook) is the agreed one.
- Confirm whether the thank-you message needs to be announced to screen reader users.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-marketo-footer.css` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site this loads from `/assets/rbccm/css/components/rbccm-marketo-footer.css`.

## Files

| File | What it is |
|---|---|
| `rbccm-marketo-footer.xsl` | TeamSite skin (includes the form's behaviour script) |
| `rbccm-marketo-footer-properties.xml` | Fields |
| `rbccm-marketo-footer.css` | Ships to `/assets/rbccm/css/components/rbccm-marketo-footer.css` |
| `local-test.html` | Local preview (live Marketo form, and header only) |
