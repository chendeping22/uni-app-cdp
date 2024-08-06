import type { IBridgeOptions, TRejectCallback, TResolveCallback } from './types';

const download = (options: IBridgeOptions, resolve: TResolveCallback, reject: TRejectCallback) => {
  const msg = '不支持该功能';
  reject({ code: -1, msg: msg });
};

export default {
  download,
};
