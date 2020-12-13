#!/bin/bash

source $(dirname $0)/_shared-env.sh

# $BUILD_DIR is declared in `_shared-env.sh`, but a null guard on it is very
# much needed lest that script is (mistakenly) not sourced in by this point
if [ -z $BUILD_DIR ] || [ "$BUILD_DIR" == "/" ] ; then
  echo "BUILD_DIR not properly specified, exiting..."
  exit 1
fi

# clean dist dir before every new prod build
# more context: everything is served in memory in development, so this only makes
# sense when building for production
echo "cleaning up $BUILD_DIR/{server,public} ..."
rm -rf $BUILD_DIR/{server,public}
mkdir -p $BUILD_DIR/{server,public/css}

# uncomment & adjust as needed if you want to use Atlaskit
# cp -r ./node_modules/@atlaskit/css-reset/dist/bundle.css ./build/public/css/css-reset.css

# uncomment & adjust as needed if you want to use Blueprint
# cp -r ./node_modules/@blueprintjs/datetime/lib/css/* ./build/public/css/
# cp -r ./node_modules/normalize.css/normalize.css ./build/public/css/
# cp -r ./node_modules/@blueprintjs/core/lib/css/* ./build/public/css/
# cp -r ./node_modules/@blueprintjs/icons/lib/css/* ./build/public/css/

# force production mode (we have `start-dev.sh` for development mode already)
export NODE_ENV=production

echo "building production client-side assets..."
npx webpack --config ./src/client/webpack.config.js

echo "building production server-side assets..."
npx webpack --config ./src/server/webpack.config.js

printf "\nall builds triggered, you may start the app now e.g. with \`node $SERVER_APP\`\n\n"
