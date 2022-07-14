# Database-agnostic React-based full-stack web application starter boilerplate

[![Build Status](https://travis-ci.com/Thesephi/fullstack-typescript-webapp-starter.svg?branch=master)](https://travis-ci.com/Thesephi/fullstack-typescript-webapp-starter)

This is an opinionated web app boilerplate that makes use of:
- [React](https://reactjs.org/) on the client-side
- [Somnus](https://github.com/somnusjs/somnus) on the server-side
- [TypeScript](https://typescriptlang.org)
- **no** database (*)

(*) it does come with a simple & stupid mock database client, exposed as simple JavaScript functions, which you can replace with your database integration of choice (NoSQL, SQL, Graph, whatever floating your boat)

Also, there is **no** session management, OAuth, user management, or anything beyond basic, stateless REST endpoint routing and React views. If you are looking for a one-size-fits-all or a full-feature starter pack, this boilerplate is **not** for you.

## Why this boilerplate

- It stresses on minimalism and will not bundle more than the bare minimum needed to get your project up & running
- Thanks to its minimalistic nature, it can be used as a core of a (traditional) monolithic app, or easily containerized & deployed as a microservice running in your architecture of choice (Docker Swarm, Kubernetes, etc.)
- It is deploy-ready out-of-the-box e.g. on Heroku, and is especially suitable to create quick prototypes that are immediately shareable with the world

## Why **not** this boilerplate

- If you wish to avoid React in your stack
- If you prefer the fuller-feature ExpressJS on the server-side
- If you need a "starter pack" with authentication, session management, database integration or database related features such as ORM, or otherwise any feature **beyond** basic, stateless REST endpoint routing & React views

## How to start the dev mode

1. clone this project and `cd` into the project root directory
2. run `npm install` (it'll take a while to download all frontend & backend libraries & DevTools)
3. run `npm run dev` then follow the pointer from the console log

Changes to the client-side or server-side code will be picked up automatically

## How to generate the production build

```bash
NODE_ENV=production npm run build
```

When the script finishes, the server app should be available at `build/server/main.js`, which can be ran with `node` itself, or a Node.js-supported app-server / process-manager of choice (e.g. `pm2`, NGINX Unit, etc.)

## How to test

From the project root directory, run:
```bash
npm test
```

## Environment Variables

- `PORT`: if set, the app will be available on this port number; otherwise, a random port will be chosen

## Caveats / TODOs

- Source mapping doesn't work yet for the server app, and thus JS error logs are not pointing to the desirable line/column in the .ts files
- The build is not yet optimized (output sizes larger than they could be in real production setups) ([#9](https://github.com/Thesephi/fullstack-typescript-webapp-starter/issues/9))
- There is no example test suite yet for the backend part (REST endpoints)
- The dev flow (`npm run dev`) has not been tested on platforms other than MacOS
