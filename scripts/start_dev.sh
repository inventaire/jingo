#!/usr/bin/env sh

nodemon ./jingo -c config.yaml &
onchange-mini ./public/css/style.scss ./public/js/multilang.js ./public/js/app.js -- npm run build dev-mode
