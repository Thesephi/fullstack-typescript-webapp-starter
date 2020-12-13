#!/bin/bash

# you may define env vars that are then passed into client & server apps (by webpack) here
export APP_NAME="A db-agnostic, React-based web application starter boilerplate"

LAST_COMMIT=$(git log -1 --pretty=format:"%h" 2>>_shared-env.err.log)
GIT_DIRTY_STATE=$(git diff --quiet 2>>_shared-env.err.log || echo "*")
START_TIME=$(date +%s)
export BUILD_SIGNATURE="$LAST_COMMIT$GIT_DIRTY_STATE $START_TIME"

printf "BUILD_SIGNATURE: $BUILD_SIGNATURE\n\n"

# uncomment if you want to use Atlaskit
# cp -r ./node_modules/@atlaskit/css-reset/dist/bundle.css ./build/public/css/css-reset.css

# uncomment if you want to use Blueprint
# cp -r ./node_modules/@blueprintjs/datetime/lib/css/* ./build/public/css/
# cp -r ./node_modules/normalize.css/normalize.css ./build/public/css/
# cp -r ./node_modules/@blueprintjs/core/lib/css/* ./build/public/css/
# cp -r ./node_modules/@blueprintjs/icons/lib/css/* ./build/public/css/

THIS_DIR=`dirname $0`
export BUILD_DIR=`realpath "$THIS_DIR/../build"`

export WEBPACK_CLIENT_APP_OUTPUT_DIR="$BUILD_DIR/public"
export WEBPACK_CLIENT_APP_OUTPUT_FILENAME="js/main.js"

export WEBPACK_SERVER_APP_OUTPUT_DIR="$BUILD_DIR/server"
export WEBPACK_SERVER_APP_OUTPUT_FILENAME="main.js"

export SERVER_APP="$WEBPACK_SERVER_APP_OUTPUT_DIR/$WEBPACK_SERVER_APP_OUTPUT_FILENAME"
export CLIENT_APP="$WEBPACK_CLIENT_APP_OUTPUT_DIR/$WEBPACK_CLIENT_APP_OUTPUT_FILENAME"
