#!/usr/bin/env sh

PROJECT_ROOT=$(pwd)

mkdir ./data ./db
cd ./data
git init
git remote add origin add git@github.com:inventaire/inventaire-wiki.git
# If it is the first time, `git push origin master` to init
# the remote master branch

cd $PROJECT_ROOT
./scripts/setup_systemd_service.sh
