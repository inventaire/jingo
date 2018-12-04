#!/usr/bin/env zsh

set -e

# Start the ssh-agent to make it available for ssh-add
# see https://lowendbox.com/blog/generate-ssh-key-setup-ssh-agent/
eval $(ssh-agent -s)
# Add the ssh key: will request the key password
ssh-add ~/.ssh/id_rsa

# The SSH_AUTH_SOCK will then be found by ./lib/set_ssh_socket_env.js
