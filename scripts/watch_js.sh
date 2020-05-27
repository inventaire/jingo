#!/usr/bin/env bash
while true ;
do
  npm run build-js dev
  inotifywait -r ./client -e modify
  date
  printf 'JS CHANGE '
done
