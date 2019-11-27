#!/usr/bin/env zsh

# /!\ do not convert to bash script before fixing the bash problem
# "Failed to enable unit: Unit file NODE_ENV\x3dproduction.service does not exist."

# To see the colors in log, use the -a,-all command:
# journalctl -u jingo -f -a
sudo env "PATH=$PATH" add-to-systemd \
  --cwd . \
  --user $USERNAME \
  --env NODE_ENV=production \
  --env PATH=$PATH:$(pwd)/node_modules/.bin \
  --env FORCE_COLOR=true \
  jingo "$(which node) ./jingo -c config.yaml"
