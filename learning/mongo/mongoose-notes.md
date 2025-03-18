# Mongoose notes

- Mongoose is an ODM: schemas define shape, models wrap collections.
- A schema maps to a collection and validates documents on save.
- Common field types: String, Number, Boolean, Date, ObjectId, [String].
- `model('User', userSchema)` -> `users` collection.
- Queries: `find`, `findOne`, `findById`, `create`, `save`, `deleteOne`.
- `select('+password')` is needed for fields with `select: false`.
- Middleware hooks like `pre('save')` run before saving.
