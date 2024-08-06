import type { IBridgeOptions, TRejectCallback, TResolveCallback } from './types';

const close = (options: IBridgeOptions, resolve: TResolveCallback, reject: TRejectCallback) => {
  setTimeout(() => {
    uni.navigateBack();
  }, 300);

  resolve({});
};

const refresh = (options: IBridgeOptions, resolve: TResolveCallback, reject: TRejectCallback) => {
  resolve({});
};

export default {
  close,
  refresh,
};
