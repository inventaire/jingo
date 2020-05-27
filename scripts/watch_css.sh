#!/usr/bin/env bash
while true ;
do
  inotifywait ./public/css/*.scss -e modify
  echo 'SCSS CHANGE'
  npm run build-css dev
done
