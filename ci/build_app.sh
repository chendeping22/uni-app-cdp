#!/bin/sh
# yarn config set registry http://npm.arnoo.lds/
yarn install  --frozen-lockfile
node bin/start-app.js $1 $2 $3 $4
yarn uni build -p app
