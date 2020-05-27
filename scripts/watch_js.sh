#!/usr/bin/env bash
while true ;
do
  inotifywait -r ./client -e modify
  echo 'JS CHANGE'
  npm run build-js dev
done
