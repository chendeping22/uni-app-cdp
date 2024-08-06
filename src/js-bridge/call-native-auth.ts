import { log } from '@/utils/tools';
import type { IBridgeOptions, TRejectCallback, TResolveCallback } from './types';

const weChat = (options: IBridgeOptions, resolve: TResolveCallback, reject: TRejectCallback) => {
  uni.login({
    provider: 'weixin',
    onlyAuthorize: true, // 微信登录仅请求授权认证
    success: function (event) {
      resolve(event);
    },
    fail: function (err) {
      log('err', err);
      let msg = err.errMsg;
      if (err.code === -100 || err.code === -2) {
        msg = '您取消了授权';
      } else if (err.code === -1002 || err.code === -8) {
        msg = '授权失败';
      }
      reject({ code: 400, msg });
    },
  });
};

export default {
  weChat,
};
