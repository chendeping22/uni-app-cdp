#!/bin/sh
# yarn config set registry http://npm.arnoo.lds/
# 移除掉依赖包进行重装拉取安装
# rm -rf yarn.lock
npm install core-js
yarn install  --frozen-lockfile
# '老师家长学生' 'dev' '麦塔校园' '1.0.0.17' '应用更新描述'
node bin/start-wx.js $1 $2 $3 $4 $5
yarn uni build -p mp-weixin
node bin/start-wx-upload.js $1 $2 $3 $4 $5
