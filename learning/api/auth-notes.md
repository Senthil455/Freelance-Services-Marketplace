# Auth flow notes

- Register: create user -> sign a token -> set an httpOnly cookie -> return profile.
- Login: find user, compare hashed password, same cookie flow.
- Logout: clear the cookie.
- Protected routes verify the cookie, load the user, and attach it to req.
- Passwords are hashed with bcrypt before saving; never stored in plain text.
- The token carries the user id and expires after a few days.
