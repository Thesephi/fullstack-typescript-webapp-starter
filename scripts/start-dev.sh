#!/bin/bash

source $(dirname $0)/_shared-env.sh

# force development mode (we have `build-prod.sh` for production mode already)
export NODE_ENV=development

EFFECTIVE_PORT=$PORT
if [ -z $EFFECTIVE_PORT ]; then
    EFFECTIVE_PORT=3000
fi

PORT=$EFFECTIVE_PORT nodemon
