# Auth scratch notes

- `protect` reads the token cookie, verifies it and loads the user.
- `authorize('admin')` narrows routes down to admins.
- Favorites live on the user document as an array of gig ids.
- A deleted account should also remove its notifications.
