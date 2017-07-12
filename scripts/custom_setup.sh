#!/usr/bin/env zsh

set -e

PROJECT_ROOT=$(pwd)
DATA_FOLDER="$PROJECT_ROOT/data"
DB_FOLDER="$PROJECT_ROOT/db"

mkdir $DATA_FOLDER $DB_FOLDER
cd $DATA_FOLDER
git init
git remote add origin git@github.com:inventaire/inventaire-wiki.git
# If it is the first time, `git push origin master` to init
# the remote master branch

# Make sure your ssh key is well configured by trying to push any way
# Will need to be run at every startup
# TODO: find a way to make it start at system startup
# without the need to enter a password manually
./scripts/start_ssh_agent.sh

cat $PROJECT_ROOT/config.base.yaml |
 sed "s@DATA_FOLDER@$DATA_FOLDER@g" > $PROJECT_ROOT/config.yaml

cd $PROJECT_ROOT
./scripts/setup_systemd_service.sh
