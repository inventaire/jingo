#!/usr/bin/env zsh

set -e

# Pass an argument to ignore unnecessary steps in development mode
DEVMODE=$1

CSS_BUNDLE=./public/css/bundle.min.css
JS_BUNDLE=./public/js/bundle.min.js

# reset bundles
rm -f $JS_BUNDLE $CSS_BUNDLE

logsize(){ [ $DEVMODE ] ||du -sh $@ ; }

addFile(){
  logsize $1
  cat $1 >> $2
  echo '\n' >> $2
}

compressFile(){
  [ $DEVMODE ] ||gzip -9kf $1
  logsize $1*
}

applyPostCss(){
  [ $DEVMODE ] ||postcss --use autoprefixer --autoprefixer.browsers "> 5%" \
                          --use cssnano \
                          -o $1 $1
}

log(){ [ $DEVMODE ] ||echo $1 ; }

log '---- JS SRC FILES'
### RUN IN DEV MODE
addFile ./public/vendor/jquery.min.js $JS_BUNDLE &&
addFile ./public/vendor/bootstrap/js/bootstrap.min.js $JS_BUNDLE &&
uglifyjs ./public/js/app.js -c -m -o ./public/js/app.min.js
addFile ./public/js/app.min.js $JS_BUNDLE &&
###
log '---- JS BUNDLE' &&
compressFile $JS_BUNDLE

log '\n---- JS MULTILANG'
logsize ./public/js/multilang.js
### RUN IN DEV MODE
uglifyjs ./public/js/multilang.js -c -m -o ./public/js/multilang.min.js
###
[ $DEVMODE ] ||compressFile ./public/js/multilang.min.js

log '\n---- JS SIMPLEMDE'
mkdir -p ./public/vendor/simplemde
cp ./node_modules/simplemde/dist/* ./public/vendor/simplemde

log '\n---- CSS/FONT FONT-AWESOME'
mkdir -p ./public/vendor/font-awesome ./public/vendor/fonts
cp ./node_modules/font-awesome/css/font-awesome.min.css ./public/vendor/font-awesome/css
# That's where the css will be looking for the fonts
mkdir -p ./public/vendor/fonts
cp ./node_modules/font-awesome/fonts/* ./public/vendor/fonts

log '\n---- CSS SRC FILES'
### RUN IN DEV MODE
addFile ./public/vendor/bootstrap/css/bootstrap.min.css $CSS_BUNDLE
node-sass ./public/css/style.scss > ./public/css/style.css
[ $DEVMODE ] && sed -i 's@https://inventaire.io@http://localhost:3006@' ./public/css/style.css
addFile ./public/css/style.css $CSS_BUNDLE
addFile ./public/css/ionicons.min.css $CSS_BUNDLE
addFile ./public/css/shCoreDefault.css $CSS_BUNDLE
###

log '---- CSS BUNDLE'
logsize $CSS_BUNDLE
applyPostCss $CSS_BUNDLE
compressFile $CSS_BUNDLE

log '\n FONTS COMPRESSION'
compressFile ./public/fonts/ionicons.ttf

echo 'done building'

exit 0
