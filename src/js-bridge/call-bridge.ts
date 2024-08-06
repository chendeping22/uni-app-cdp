import type { IBridgeOptions, IBridgeResponse } from './types';
// #ifdef H5
import { callH5 } from './call-h5';
// #endif
// #ifdef APP-PLUS
import { callNative } from './call-native';
// #endif
// #ifdef MP-WEIXIN
import { callWeChat } from './call-wechat';
// #endif

/*
参考文档地址：https://confluence.leedarson.com/display/CPXT/UniApp+JSBridge+API
*/
export const callBridge = (options: IBridgeOptions): Promise<IBridgeResponse> => {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    callNative(options, resolve, reject);
    // #endif
    // #ifdef MP-WEIXIN
    // 分包异步加载js uni不支持
    callWeChat(options, resolve, reject);
    // #endif
    // #ifdef H5
    callH5(options, resolve, reject);
    // #endif
  });
};
