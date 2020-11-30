#!/bin/bash

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

# client-side
build_client() {

  printf "\nbuilding for client-side...\n\n"

  # webpack will be under `watch` mode if WATCH=true, hence the parallel process
  { webpack --config ./src/client/webpack.config.js >&1 ; } &

  # uncomment if you want to use Atlaskit
  # cp -r ./node_modules/@atlaskit/css-reset/dist/bundle.css ./build/public/css/css-reset.css

  # uncomment if you want to use Blueprint
  # cp -r ./node_modules/@blueprintjs/datetime/lib/css/* ./build/public/css/
  # cp -r ./node_modules/normalize.css/normalize.css ./build/public/css/
  # cp -r ./node_modules/@blueprintjs/core/lib/css/* ./build/public/css/
  # cp -r ./node_modules/@blueprintjs/icons/lib/css/* ./build/public/css/

}

# server-side
build_server() {

  printf "\nbuilding for server-side...\n\n"

  if [ ! -z "$WATCH" ]; then

    # we now use webpack to compile server-side app to allow for more versatile
    # module resolution (all during dev time, compile time, and run time)
    # the following tsc command is kept for historical reasons only
    # tsc will be under `watch` mode if WATCH=true, hence the parallel process
    # { tsc -w --preserveWatchOutput -p ./src/server/ >&1 ; } &

    # webpack will be under `watch` mode if WATCH=true, hence the parallel process
    { webpack --watch --config ./src/server/webpack.config.js >&1 ; } &

  else
    # tsc -p ./src/server/
    webpack --config ./src/server/webpack.config.js
  fi

  # since utilising HMR, we've let html-webpack-plugin take care of generating
  # the index.html entry file; feel free to inject variables following their
  # [document](https://github.com/jantimon/html-webpack-plugin#options)
  #cp -r ./src/server/view-templates ./build/server/

}

# file update monitoring helper
wait_for_file() {

  # if the file was last modified **BEFORE** this script is started
  # (or if the file doesn't exist yet)
  # we wait until this condition is false
  while [ $(get_last_modified_ts $1) -lt $START_TIME ] ; do
    if [ ! -z "$VERBOSE" ]; then
      echo "waiting for $1"
    fi
    sleep 1
  done

}

get_last_modified_ts() {

  # if the file already exists, we get its last modified timestamp
  if [ -f "$1" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      local FILE_LAST_MODIFIED_TS=$(stat -f "%a" "$1")
    else
      local FILE_LAST_MODIFIED_TS=$(stat -c %Y "$1")
    fi
  # if the file does not exist yet, treat its last modified timestamp as 0
  else
    local FILE_LAST_MODIFIED_TS=0
  fi

  echo $FILE_LAST_MODIFIED_TS

}

trigger_builds() {

  # build_client
  # wait_for_file "$CLIENT_APP"
  build_server
  wait_for_file "$SERVER_APP"

  # if we are under `watch` mode, the verb is "access", otherwise "start"
  [[ ! -z "$WATCH" ]] && VERB="access" || VERB="start"
  [[ ! -z "$WATCH" ]] && INSTRUCTION="" || INSTRUCTION="e.g. with \`node $SERVER_APP\`"
  printf "\nall builds triggered, you may $VERB the app now $INSTRUCTION\n\n"

}

trigger_builds
