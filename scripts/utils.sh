#!/usr/bin/env bash

logsize(){ [ $DEVMODE ] || du -sh $@ ; }

addFile(){
  echo "add file $1 -> $2"
  logsize $1
  cat $1 >> $2
  echo -e '\n' >> $2
}

compressFile(){
  [ $DEVMODE ] && echo "skip $1 compression (dev mode)" || { gzip -9kf $1 && echo "compressed $1" ; }
  logsize $1*
}
