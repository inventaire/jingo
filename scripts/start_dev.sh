#!/usr/bin/env sh

nodemon ./jingo -c config.yaml &
while true ; do inotifywait -r ./lib -e modify && npm run build dev-mode && echo 'CHANGE'; done
