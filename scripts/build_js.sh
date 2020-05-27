#!/usr/bin/env bash

set -e

# Pass an argument to ignore unnecessary steps in development mode
export DEVMODE=$1

source ./scripts/utils.sh

mkdir -p ./public/js

JS_BUNDLE=./public/js/bundle.min.js

# reset
rm -f $JS_BUNDLE

echo '---- JS SRC FILES'
browserify ./client/app/app.js -o ./public/js/app.js
addFile ./public/vendor/jquery.min.js $JS_BUNDLE
addFile ./public/vendor/bootstrap/js/bootstrap.min.js $JS_BUNDLE
./node_modules/.bin/uglifyjs ./public/js/app.js -c -m -o ./public/js/app.min.js
addFile ./public/js/app.min.js $JS_BUNDLE
echo '---- JS BUNDLE'
compressFile $JS_BUNDLE

echo '---- JS MULTILANG'
browserify ./client/multilang/multilang.js -o ./public/js/multilang.js
logsize ./public/js/multilang.js
./node_modules/.bin/uglifyjs ./public/js/multilang.js -c -m -o ./public/js/multilang.min.js
[ $DEVMODE ] || compressFile ./public/js/multilang.min.js

echo '---- JS SIMPLEMDE'
[ "$DEVMODE" ] && echo 'skip building simplemde (dev mode)' || {
  mkdir -p ./public/vendor/simplemde
  browserify ./node_modules/simplemde -s SimpleMDE -o ./public/vendor/simplemde/simplemde.js
  ./node_modules/.bin/uglifyjs ./public/vendor/simplemde/simplemde.js -c -m -o ./public/vendor/simplemde/simplemde.min.js
  cp ./node_modules/simplemde/dist/*css ./public/vendor/simplemde
  compressFile ./public/vendor/simplemde/simplemde.min.css
  compressFile ./public/vendor/simplemde/simplemde.min.js
}
