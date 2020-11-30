# env vars passed into client & server apps (done by webpack)
export APP_NAME="A db-agnostic, React-based web application starter boilerplate"

LAST_COMMIT=$(git log -1 --pretty=format:"%h")
GIT_DIRTY_STATE=$(git diff --quiet || echo "*")
export BUILD_SIGNATURE=$LAST_COMMIT$GIT_DIRTY_STATE

# some lines are commented out as they are optional features

START_TIME=$(date +%s)

mkdir -p ./build/{server,public/css}

THIS_DIR=`dirname $0`
BUILD_DIR=`realpath "$THIS_DIR/../build"`

export WEBPACK_CLIENT_APP_OUTPUT_DIR="$BUILD_DIR/public"
export WEBPACK_CLIENT_APP_OUTPUT_FILENAME="js/main.js"

export WEBPACK_SERVER_APP_OUTPUT_DIR="$BUILD_DIR/server"
export WEBPACK_SERVER_APP_OUTPUT_FILENAME="main.js"

export SERVER_APP="$WEBPACK_SERVER_APP_OUTPUT_DIR/$WEBPACK_SERVER_APP_OUTPUT_FILENAME"
export CLIENT_APP="$WEBPACK_CLIENT_APP_OUTPUT_DIR/$WEBPACK_CLIENT_APP_OUTPUT_FILENAME"

# force development mode (we have `build-prod.sh` for production mode already)
export NODE_ENV=development

EFFECTIVE_PORT=$PORT
if [ -z $EFFECTIVE_PORT ]; then
    EFFECTIVE_PORT=3000
fi

PORT=$EFFECTIVE_PORT ts-node --project src/server/tsconfig.json -r tsconfig-paths/register src/server/main.ts
