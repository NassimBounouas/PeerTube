#!/bin/sh

set -eu

if [ ! -f "./client/dist/en-US/index.html" ]; then
  echo "client/dist/en-US/index.html does not exist, compile client files..."
  npm run build:client -- --light
fi

npm run watch:server
