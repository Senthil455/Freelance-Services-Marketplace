# React form notes

- Controlled inputs read their value from state and update on change.
- Every keystroke re-renders the component, so validation runs live.
- Textareas and selects behave just like text inputs.
- Multi-value fields like tags and skills are arrays we push to and filter.
- Forms call preventDefault so the browser never reloads the page.
- Image uploads reach the api as FormData, not JSON.
- A hidden input plus a button that clicks it gives a clean upload button.
- URL.createObjectURL lets the browser preview a file before upload.
- Some sections updated below as I wired the gig gallery.
