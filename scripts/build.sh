#!/usr/bin/env zsh

set -e

# Pass an argument to ignore unnecessary steps in development mode
export DEVMODE=$1

./scripts/build_js.sh $DEVMODE
./scripts/build_css.sh $DEVMODE

source ./scripts/utils.sh

[ "$DEVMODE" ] && echo 'skip fonts compression (dev mode)' || {
  echo 'Fonts compression'
  compressFile ./public/fonts/ionicons.ttf
}

echo 'done building'

exit 0
