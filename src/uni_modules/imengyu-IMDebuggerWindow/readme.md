# IMDebuggerWindow

一款调试工具，方便您在 APP 上无法连接电脑时查看 Console，网络请求，报错，Storage。

## 使用方法

1. 基础数据类型的日志，如字符串、数字, 可直接使用 console.info, console.log 方法，会自动捕捉
2. 对象或数组类型的数据，需要使用 tools.ts 下的 log 方法。第三方组件代码支持有问题，后期可修复

## 安装

导入插件后，请在您的代码中安装，让 IMDebuggerWindow 正常运行。

1. 在 main.js 中安装钩子：

```js
// #ifdef APP-PLUS
import { debuggerModule } from '@/uni_modules/imengyu-IMDebuggerWindow/common/debuggerExtern.js';

const VITE_SERVER_ENV = import.meta.env.VITE_SERVER_ENV;
const isDev = process.env.NODE_ENV === 'development';

const errorHandler = (err: any, vm: any, info: any) => {
  if (debuggerModule) debuggerModule.addVueError(err, vm, info);
};
if (VITE_SERVER_ENV !== 'PROD' || isDev) {
  app.config.errorHandler = errorHandler;
}

// #endif
```

2. 在 App.vue 中安装钩子：

```js
// #ifdef APP-PLUS
import {
  debuggerModule,
  installDebugger,
} from '@/uni_modules/imengyu-IMDebuggerWindow/common/debuggerExtern.js';
// #endif

const VITE_SERVER_ENV = import.meta.env.VITE_SERVER_ENV;
const isDev = process.env.NODE_ENV === 'development';

export default {
  onLaunch: function () {
    // #ifdef APP-PLUS
    if (VITE_SERVER_ENV !== 'PROD' || isDev) {
      installDebugger({
        enableRequestInterceptor: true,
        showGlobalFloatWindow: false,
      });
    }
    // #endif
  },
  onUnhandledRejection: function (err: any) {
    // #ifdef APP-PLUS
    if (debuggerModule) debuggerModule.addAppErr(err);
    // #endif
  },
  onError: function (err: any) {
    // #ifdef APP-PLUS
    if (debuggerModule) debuggerModule.addAppErr(err);
    // #endif
  },
};
```

## 组件式调试窗口

定义一个`console.vue`组件，放在你的`page.vue`下

```vue
<!--#ifdef APP-PLUS-->
<console />
<!--#endif-->
```

`console.vue`具体内容

```vue
<template>
  <view v-if="VITE_SERVER_ENV !== 'PROD' || isDev">
    <view class="components-console">
      <view v-if="!showDebuggerWindow" class="console-logo" @click="showDebuggerWindow = true"
        >vConsole</view
      >
    </view>
    <debuggerBox v-if="showDebuggerWindow" @close="showDebuggerWindow = false" />
  </view>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import debuggerBox from '@/uni_modules/imengyu-IMDebuggerWindow/pages/components/debuggerBox.vue';

const VITE_SERVER_ENV = import.meta.env.VITE_SERVER_ENV;
const isDev = process.env.NODE_ENV === 'development';

export default defineComponent({
  components: {
    debuggerBox,
  },
  props: {
    title: { type: String, default: '' },
  },
  emits: [],
  setup() {
    const showDebuggerWindow = ref(false);

    return { showDebuggerWindow, VITE_SERVER_ENV, isDev };
  },
});
</script>
<style scoped lang="scss">
.components-console {
  position: fixed;
  right: 0;
  left: 0;
  bottom: 80rpx;
  z-index: 9999999;

  .console-logo {
    background: $ui-color-success;
    color: $ui-color-white;
    padding: $ui-gap-xxs $ui-gap-xs;
    border-radius: $ui-radius-default;
    border: 1px solid $ui-color-success;
    position: absolute;
    right: 40rpx;
  }
}
</style>
```
