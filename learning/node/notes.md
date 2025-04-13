# Node.js notes

- Node runs JavaScript outside the browser, powered by V8.
- Common core modules: fs, path, os, http, events, stream, readline.
- `require` brings in modules; the `events` module gives us EventEmitter.
- The http module can serve requests, but frameworks like Express simplify routing.
- Async code: callbacks, promises and `async/await`.
- Express middleware run in order: json parsing, logging, security, then routes.
- npm installs packages into `node_modules` and tracks them in `package.json`.
