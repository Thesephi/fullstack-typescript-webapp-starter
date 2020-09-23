#!/bin/bash

# some lines are commented out as they are optional features

# export MONGOMS_SYSTEM_BINARY=$(which mongod)
# echo "Local mongod set at $MONGOMS_SYSTEM_BINARY"

THIS_DIR=`dirname $0`
BUILD_DIR=`realpath "$THIS_DIR/../build"`

# `source` the build script so that exported env vars in there are reusable
# note that this will start `tsc` and `webpack` compiling processes, potentially under
# `watch` mode as parallel processes piping their outputs to &1
source "./$THIS_DIR/build.sh"

while [ ! -f "$CLIENT_APP" ]
do
  echo "waiting for $CLIENT_APP"
  sleep 1
done

nodemon -w "$BUILD_DIR/server" $SERVER_APP
