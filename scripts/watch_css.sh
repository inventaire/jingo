#!/usr/bin/env bash
while true ;
do
  npm run build-css dev
  inotifywait ./public/css/*.scss -e modify
  date
  echo 'SCSS CHANGE'
done
