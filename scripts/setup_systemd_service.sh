#!/usr/bin/env zsh

set -e

PROJECT_ROOT=$(pwd)
NODE_VERSION=$(node -v)
HOME_FOLDER=~

cat $PROJECT_ROOT/etc/jingo.base.service |
 sed "s@PROJECT_ROOT@$PROJECT_ROOT@g" |
 sed "s@NODE_VERSION@$NODE_VERSION@g" |
 sed "s@HOME_FOLDER@$HOME_FOLDER@g" |
 sed "s@USERNAME@$USERNAME@g" > $PROJECT_ROOT/etc/jingo.service

# Copy instead of simply linking as some system fail to find the symbolic link target
sudo cp $PROJECT_ROOT/etc/jingo.service /etc/systemd/system/

# setup jingo systemd service
sudo systemctl daemon-reload
sudo systemctl enable jingo.service
sudo systemctl start jingo.service
