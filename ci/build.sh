#!/bin/sh
# app=$1
# profile=$2
# yarn config set registry http://npm.arnoo.lds/
yarn install  --frozen-lockfile
# yarn deploy:mp --${app} --${profile}
# $1:kind: teacher $2:env:TEST $3: project: 麦塔校园
sh ci/build_by_env.sh $1 $2 $3
