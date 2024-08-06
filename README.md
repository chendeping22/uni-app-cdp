#### 重要

```
tui/tmui/uni-ui/vuex 给旧应用迁移用,新开发业务禁止使用,请使用vk-uview-ui提供的
```

#### 安装 nrm 及公司私服

```
yarn global add nrm

nrm add lds http://192.168.5.155:4873/
```

说明：安装 tui 需要切换到公司私服

#### 安装

```
yarn
```

#### yarn 命令

1. 开发模式

```ts
yarn dev:mp-weixin // 开发模式-微信小程序
yarn dev:h5 // 开发模式-h5
yarn dev:app // 开发模式-app
```

2. 打包

```ts
yarn build:mp-weixin // 打包-小程序
yarn build:app // 打包-app
```

#### 命名规范

1. 文件夹/文件使用中划线命名法

```
中划线命名法：每个单词间使用中划线“-”分割，所有字母均小写，如“app-platform”；
```

#### 分支管理规范

1. 功能分支统一从`master`分支拉取；
2. `hotfix`分支统一从当前线上最新的`tag`拉取（一般情况下等同于`master`分支）；
3. `hotfix`上线后对应分支会合并到`master`分支；
4. 测试时根据 pjm 或测试的安排将功能分支合并到`test1`或`test2`（若无安排，默认月中版本合并到`test1`，月末版本合并到`test2`）；
5. 迭代进入`pre`阶段时，代码会从`test`分支合并到`master`分支；
6. `develop`分支只做开发阶段测试用，可合并任意分支，但是不可合并到其他分支；
