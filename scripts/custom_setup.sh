#!/usr/bin/env sh
mkdir ./data ./db
cd ./data
git init
git remote add origin add git@github.com:inventaire/inventaire-wiki.git
# If it is the first time, `git push origin master` to init
# the remote master branch
