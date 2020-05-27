#!/usr/bin/env bash

set -e

# Pass an argument to ignore unnecessary steps in development mode
export DEVMODE=$1

source ./scripts/utils.sh

mkdir -p ./public/css

CSS_BUNDLE=./public/css/bundle.min.css

# reset
rm -f "$CSS_BUNDLE"

echo '---- CSS/FONT FONT-AWESOME'
mkdir -p ./public/vendor/font-awesome ./public/vendor/fonts
cp ./node_modules/font-awesome/css/font-awesome.min.css ./public/vendor/font-awesome
compressFile ./public/vendor/font-awesome/font-awesome.min.css

# That's where the css will be looking for the fonts
mkdir -p ./public/vendor/fonts
cp ./node_modules/font-awesome/fonts/* ./public/vendor/fonts

echo '---- CSS SRC FILES'
cat ./public/vendor/bootstrap/css/bootstrap.min.css > $CSS_BUNDLE

# This is sometimes failing for some reason
if [ "$(cat ./public/vendor/bootstrap/css/bootstrap.min.css | wc -l)" != "$(cat $CSS_BUNDLE  | wc -l)" ] ; then
  echo "FAILED TO ADD Bootstrap"
  exit 1
fi

./node_modules/.bin/node-sass ./public/css/style.scss > ./public/css/style.css
addFile ./public/css/style.css $CSS_BUNDLE
addFile ./public/css/ionicons.min.css $CSS_BUNDLE
addFile ./public/css/shCoreDefault.css $CSS_BUNDLE

echo '---- CSS BUNDLE'
logsize $CSS_BUNDLE
compressFile $CSS_BUNDLE
