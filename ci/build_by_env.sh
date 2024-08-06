#!/bin/sh

set -e
set -o errexit

pwd

# dev|test|pre|prod metastu guardian
echo yarn build:h5 -env=$2 -project=$3 -kind=$1
yarn build:h5 -env=$2 -project=$3 -kind=$1

set +e
