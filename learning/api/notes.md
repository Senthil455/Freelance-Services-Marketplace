# API structure notes

- All routes live under the /api prefix.
- The server, config, models, controllers and middleware get separate folders under src/.
- Controllers stay thin: read inputs, call models, return a json response.
- Errors flow to a central error handler instead of try/catch everywhere.
- Auth uses an httpOnly cookie so the browser sends the token automatically.
- Multer handles uploads; files are stored on disk under the uploads folder.
- Resource routes (gigs, orders, categories) live in their own route files.
- Bigger flows use a status machine (orders) and aggregate queries (ratings).
