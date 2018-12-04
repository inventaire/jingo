#!/usr/bin/env zsh

set -e

# Start the ssh-agent and setup the environment variables
# to be available for ssh-add
# see https://lowendbox.com/blog/generate-ssh-key-setup-ssh-agent/
# Using '/tmp/ssh-agent' as a convention so that etc/jingo.base.service
# knows were to find it: Environment=SSH_AUTH_SOCK=/tmp/ssh-agent
eval $(ssh-agent -s -a /tmp/ssh-agent)
# Add the ssh key: will request the key password
ssh-add ~/.ssh/id_rsa
