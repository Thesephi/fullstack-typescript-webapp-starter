# Database-agnostic React-based full-stack web application starter boilerplate

## How to start

1. clone this project and `cd` into the project root directory
2. run `npm install` (it'll take a while to download all frontend & backend libraries & DevTools)
3. run `npm start` then follow the pointer from the console log

## How to test

From the project root directory, run:
```bash
npm test
```

## Environment Variables

- `PORT`: if set, the app will be available on this port number; otherwise, a random port will be chosen

## Current Caveats

- Source mapping doesn't work yet for the server app, and thus JS error logs are not pointing to the desirable line/column in the .ts files
- Hot live-reloading is not enabled for client-side assets yet
- The build is not yet optimized (output sizes larger than they could be in real production setups)
- There is no example test suite for the backend part (REST endpoints)
- The dev flow (build/start) was not tested on platforms other than MacOS
