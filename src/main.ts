import { createPinia } from 'pinia';
import { createSSRApp, type App as VueApp } from 'vue';
import App from './App.vue';
import { EnvType } from './utils/env';
// @ts-ignore
import * as sentry from 'sentry-mina';
// @ts-ignore
import uView from './uni_modules/vk-uview-ui';
import { initConfig } from './utils/global-config';
/*给旧应用迁移用 新开发业务禁止使用 请使用pinia*/
import store, { IStoreKey } from './store/old';
// #ifdef APP-PLUS
// @ts-ignore
import { debuggerModule } from './uni_modules/imengyu-IMDebuggerWindow/common/debuggerExtern.js';
// #endif

const VITE_SERVER_ENV = import.meta.env.VITE_SERVER_ENV;
const isDev = process.env.NODE_ENV === 'development';

// #ifdef H5
async function erudaOpen() {
  const { default: erdua } = await import('eruda');
  erdua.init();
}
// #endif

function turnOnSentry(app: VueApp<Element>) {
  const environment = VITE_SERVER_ENV !== EnvType.EnvType_PROD ? 'env_pre' : 'env_prod';
  const dsn =
    VITE_SERVER_ENV !== EnvType.EnvType_PROD
      ? 'https://ec8891b6b5a54abfbb997bad0dab337f@impsentry.leedarson.com/9'
      : 'https://6fd5cba9fd7c4d5b8af3c605d27a6b4f@impsentry.leedarson.com/11';
  const sentryOptions = {
    dsn: dsn,
    environment: environment,
    minaContext: uni,
    release: '',
  };

  let version = import.meta.env.VITE_APP_VERSION;
  // #ifdef APP-PLUS
  const tempVersion = plus.runtime.version;
  if (tempVersion && tempVersion?.length > 0) {
    version = tempVersion;
  }
  // #endif
  // #ifdef MP-WEIXIN
  const { miniProgram } = uni?.getAccountInfoSync?.() || {};
  if (miniProgram.version && miniProgram.version?.length > 0) {
    version = miniProgram.version;
  }
  // #endif
  const appName = import.meta.env.VITE_APP_NAME;
  sentryOptions.release = `${appName}@${version}`;

  sentry.init(sentryOptions);
  app.config.errorHandler = (error, vm, info) => {
    sentry.captureException(error);
    // #ifdef APP-PLUS
    if (VITE_SERVER_ENV !== EnvType.EnvType_PROD || isDev) {
      if (debuggerModule) debuggerModule.addVueError(error, vm, info);
    }
    // #endif
  };
}

export function createApp() {
  initConfig();
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia as any);
  app.use(uView);
  /*给旧应用迁移用 新开发业务禁止使用 请使用pinia*/
  app.use(store, IStoreKey);

  // #ifdef H5
  if (isDev || VITE_SERVER_ENV !== EnvType.EnvType_PROD) {
    erudaOpen();
  }
  // #endif

  // #ifdef H5 || APP-PLUS
  // 临时修复tmui内部调用这个api，默认这个是uniapp提供的，可能是我们这个版本不支持，导致报错
  // uni.onThemeChange = () => {};
  // app.use(tmui as any, {});
  // #endif

  // setTimeout(() => {
  //   app.config.errorHandler = undefined;
  // }, 500);

  if (VITE_SERVER_ENV === EnvType.EnvType_PRE || VITE_SERVER_ENV === EnvType.EnvType_PROD) {
    turnOnSentry(app);
  }

  return {
    app,
  };
}
