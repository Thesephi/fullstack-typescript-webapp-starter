#!/bin/bash

source $(dirname $0)/_shared-env.sh

# force development mode (we have `build-prod.sh` for production mode already)
export NODE_ENV=development

EFFECTIVE_PORT=$PORT
if [ -z $EFFECTIVE_PORT ]; then
    EFFECTIVE_PORT=3000
fi

# old flow, using nodemon & ts-node directly, but is NOT compatible with SSR + SCSS importing by default
# PORT=$EFFECTIVE_PORT nodemon

# new, experimental flow, hopefully supporting all use cases
PORT=$EFFECTIVE_PORT ts-node -T scripts/startDevServer.ts
