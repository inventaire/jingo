# Jingo

Node.js based Wiki, customized for the needs of inventaire.io https://wiki.inventaire.io

## What is customized here
- authentification uses [inventaire](http://github.com/inventaire/inventaire) API
- user pictures are taken from their inventaire profile
- multilangue
- redirection support: `#REDIRECT[[Home]]`

**See also [claudioc/jingo README](https://github.com/claudioc/jingo)**

## Install
```sh
git clone https://github.com/inventaire/jingo
cd jingo
# Use SSH cloning to be able to push on this repo
git clone git@github.com:inventaire/inventaire-wiki.git data
```
### Production
Setup the prod config:
```sh
export JINGO_PATH=$PWD
export JINGO_SECRET=$(head -c 30 /dev/urandom | base64)
envsubst < config.prod.yaml.template > config.yaml
```
