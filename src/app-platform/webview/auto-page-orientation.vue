<template>
  <web-view :src="src" @message="handleMessage" @load="webviewLoaded" @error="webviewError" />
</template>

<script lang="ts" setup>
import { callBridge } from '@/js-bridge/call-bridge';
import { Action } from '@/js-bridge/enums';
import { hideLoading, log, showLoading } from '@/utils/tools';
import { onBackPress, onHide, onLoad, onNavigationBarButtonTap, onShow } from '@dcloudio/uni-app';
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue';
import { formatWebviewOpenPath } from '../utils/tools';
import { IWebViewBridgeOptions } from './types';

const src = ref('');
const isWVRendered = ref(false);
let renderCheckIntervalId: any = undefined;

onBeforeMount(() => {
  // #ifndef APP-PLUS
  console.log('webview-onBeforeMount');
  // uni.showNavigationBarLoading();
  // #endif
});

onLoad(option => {
  log('option' + JSON.stringify(option));

  const path = JSON.parse(decodeURIComponent(option?.path));
  const title = option?.title ?? '';
  uni.setNavigationBarTitle({ title: title });

  log('🚀 ~ file: index.vue:21 ~ path:' + path + title);
  init(path, option?.openFrom, title);
  registerCallBridge(1);
});

onShow(() => {
  const currentWebview = getCurrentWebview();
  currentWebview?.evalJS('onShow&&onShow()');
});

onHide(() => {
  const currentWebview = getCurrentWebview();
  currentWebview?.evalJS('onHide&&onHide()');
});

onMounted(() => {
  // #ifdef APP-PLUS
  showLoading();
  var webview = getWebview();

  // event: "close" | "dragBounce" | "error" | "hide" | "loading" | "loaded" | "maskClick" | "show" | "popGesture" | "titleUpdate",
  webview?.addEventListener('close', () => {
    console.log('webview-close');
    // webview被关闭回调
    hideLoading();
  });
  webview?.addEventListener('hide', () => {
    console.log('webview-hide');
    hideLoading();
  });
  webview?.addEventListener('titleUpdate', () => {
    console.log('webview-titleUpdate');
    // webview title更新回调
  });
  webview?.addEventListener('show', () => {
    console.log('webview-show');
    // 此时页面加载完毕，即已经渲染完毕了
    if (!isWVRendered.value) {
      checkRenderedResult(webview);
    }
  });
  webview?.addEventListener('loading', () => {
    console.log('webview-loading');
  });
  webview?.addEventListener('loaded', () => {
    console.log('webview-loaded');
    // 微信小程序、支付宝小程序、抖音小程序、QQ小程序
  });
  webview?.addEventListener('error', () => {
    console.log('webview-error');
    hideLoading();
    // 微信小程序、支付宝小程序、抖音小程序、QQ小程序
  });
  webview?.addEventListener('rendered', () => {
    console.log('webview-rendered');
    // 此时页面渲染完毕
    isWVRendered.value = true;
    hideLoading();
  });
  // #endif
});

const checkRenderedResult = (webview: any) => {
  renderCheckIntervalId = setInterval(() => {
    webview.checkRenderedContent(
      {},
      (result: any) => {
        const wbRendered = result['rendered'] as boolean;
        if (wbRendered) {
          clearInterval(renderCheckIntervalId);
          hideLoading();
        }
      },
      (err: any) => {
        console.log('checkRenderedContent-err : ' + JSON.stringify(err));
        clearInterval(renderCheckIntervalId);
        hideLoading();
      },
    );
  }, 500);
};

onUnmounted(() => {
  console.log('webview-onUnmounted');
  // uni.hideNavigationBarLoading();
  if (renderCheckIntervalId) {
    clearInterval(renderCheckIntervalId);
  }
});

const webviewLoaded = () => {
  // 微信小程序、支付宝小程序、抖音小程序、QQ小程序
  console.log('webview-webviewLoaded');
  // uni.hideNavigationBarLoading();
};

const webviewError = () => {
  // 微信小程序、支付宝小程序、抖音小程序、QQ小程序
  console.log('webview-webviewError');
  // uni.hideNavigationBarLoading();
};

/**
 * init
 * @param openPath 跳转链接
 * @param openFrom 打开来源
 */
const init = async (openPath: string, openFrom: string, title: string) => {
  const url = formatWebviewOpenPath(openPath, openFrom, title);
  src.value = url;
};

const getWebview = () => {
  let pages = getCurrentPages();
  let page = pages[pages.length - 1];
  let currentWebview = page.$getAppWebview ? page.$getAppWebview() : null;
  return currentWebview;
};

const getCurrentWebview = () => {
  let currentWebview = getWebview();
  return currentWebview?.children()[0];
};

// 注册callbridge
const registerCallBridge = (count: number) => {
  setTimeout(() => {
    var currentWebview = getCurrentWebview();
    if (currentWebview) {
      const jsCode = `
      window.callBridge = message => {
        if (window.uniWebview) {
          window.uniWebview.postMessage({data:message});
        }
      };
    `;
      currentWebview?.evalJS(jsCode);
    } else if (count <= 5) {
      registerCallBridge(count + 1);
    }
  }, 1000);
};

// 接受html发送的消息
let backData: any = undefined;
const handleMessage = async (e: { detail: { data: IWebViewBridgeOptions[] } }) => {
  log('handleMessage -->:' + JSON.stringify(e));

  const message = e.detail.data?.[0];
  callBridge(message)
    .then((res: any) => {
      log('handleMessage <--', res);
      if (message?.action === Action.navigationBack) {
        backData = res;
      } else if (message?.action === Action.scanCode) {
        // 解决H5无法解析对象字符串问题(兼容底层)
        res.result = JSON.parse(res.result);
      }

      if (message.success) {
        const currentWebview = getCurrentWebview();
        currentWebview?.evalJS(message.success + "('" + JSON.stringify(res) + "')");
      }
    })
    .catch(err => {
      log('handleMessage error', err);
      if (message.fail) {
        const currentWebview = getCurrentWebview();
        currentWebview?.evalJS(message.fail + "('" + JSON.stringify(err) + "')");
      }
    });
};

// #ifdef APP-PLUS || H5
onBackPress(e => {
  log('用户点击返回按钮', e);
  if (!backData) {
    return false;
  }

  uni.showModal({
    title: backData.title ?? '',
    content: backData.content,
    cancelText: backData.cancelText ?? '取消',
    confirmText: backData.confirmText ?? '确定',
    success: function (res) {
      if (res.confirm) {
        backData = undefined;
        const currentWebview = getCurrentWebview();
        currentWebview?.canBack(result => {
          if (result.canBack === 1) {
            currentWebview?.back();
          } else {
            uni.navigateBack();
          }
          log('用户点击确定', result);
        });
      } else if (res.cancel) {
        log('用户点击取消');
      }
    },
  });
  return true;
});

onNavigationBarButtonTap(e => {
  const currentWebview = getCurrentWebview();
  currentWebview?.evalJS("onNavigationBarButtonTap('" + e.index + "')");
});
// #endif
</script>
