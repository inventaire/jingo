#!/usr/bin/env sh
# Replace inventaire.io fonts by local fonts to work around CORS policies
# when testing a build locally
sed -i 's/https:\/\/inventaire\.io/http:\/\/localhost:3006/g' ./public/css/bundle.min.css
