# MongoDB notes

- MongoDB stores documents in collections inside a database.
- `mongod` starts the server, `mongosh` opens a shell.
- Basic commands:
  - `show dbs`
  - `use marketplace`
  - `db.users.insertOne({ name: 'Ada', email: 'ada@example.com' })`
  - `db.users.find({ name: 'Ada' })`
  - `db.users.updateOne({ name: 'Ada' }, { $set: { role: 'seller' } })`
- ObjectId is the default `_id` format.
