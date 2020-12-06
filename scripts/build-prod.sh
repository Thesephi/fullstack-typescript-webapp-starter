#!/bin/bash

source $(dirname $0)/_shared-env.sh

# force production mode (we have `start-server-dev.sh` for development mode already)
export NODE_ENV=production

echo "building production client-side assets..."
npx webpack --config ./src/client/webpack.config.js

echo "building production server-side assets..."
npx webpack --config ./src/server/webpack.config.js

printf "\nall builds triggered, you may start the app now e.g. with \`node $SERVER_APP\`\n\n"
