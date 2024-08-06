import type { IBridgeOptions, TRejectCallback, TResolveCallback } from './types';

const getConnectedWifi = (
  options: IBridgeOptions,
  resolve: TResolveCallback,
  reject: TRejectCallback,
) => {
  uni.startWifi({
    success: () => {
      uni.getConnectedWifi({
        success: res => {
          const wifi = {
            ssid: res.wifi.SSID,
            bssid: (res.wifi.BSSID ?? '').toLowerCase(),
          };
          resolve(wifi);
        },
        fail: err => {
          const error = {
            code: err.errCode,
            msg: err.errMsg,
          };
          reject(error);
        },
      });
    },
    fail: err => {
      const error = {
        code: err.errCode,
        msg: err.errMsg,
      };
      reject(error);
    },
  });
};

export default {
  getConnectedWifi,
};
