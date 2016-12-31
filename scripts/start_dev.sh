#!/usr/bin/env sh

nodemon ./jingo -c config.yaml &
onchange-mini ./public/css/style.scss ./public/js/multilang.js -- npm run build dev-mode
