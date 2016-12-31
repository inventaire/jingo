#!/usr/bin/env sh

# Pass an argument to ignore unnecessary steps in development mode
DEVMODE=$1

CSS_BUNDLE=./public/css/bundle.min.css
JS_BUNDLE=./public/js/bundle.min.js
CODEMIRROR_BUNDLE=./public/css/codemirror-bundle.min.css

# reset bundles
rm -f $JS_BUNDLE $CSS_BUNDLE
[ $DEVMODE ] ||rm -f $CODEMIRROR_BUNDLE

logsize(){ [ $DEVMODE ] ||du -sh $1 ; }

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
addFile ./public/js/app.js $JS_BUNDLE &&
###
log '---- JS BUNDLE' &&
compressFile $JS_BUNDLE

log '\n---- JS MULTILANG'
logsize ./public/js/multilang.js
### RUN IN DEV MODE
uglifyjs ./public/js/multilang.js -c -m -o ./public/js/multilang.min.js
###
[ $DEVMODE ] ||compressFile ./public/js/multilang.min.js

log '\n---- JS CODEMIRROR'
[ $DEVMODE ] ||compressFile ./public/vendor/codemirror/codemirror.min.js

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

log '\n---- CSS CODEMIRROR BUNDLE'
[ $DEVMODE ] ||addFile ./public/css/codemirror-ext.css $CODEMIRROR_BUNDLE &&
addFile ./public/vendor/codemirror/codemirror.css $CODEMIRROR_BUNDLE &&
addFile ./public/vendor/codemirror/fullscreen.css $CODEMIRROR_BUNDLE &&
applyPostCss $CODEMIRROR_BUNDLE &&
compressFile $CODEMIRROR_BUNDLE

echo 'done building'

exit 0
