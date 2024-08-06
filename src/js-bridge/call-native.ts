import { log } from '@/utils/tools';
import services from './call-native-import';
import { Service } from './enums';
import type {
  IBridgeOptions,
  IBridgeResponse,
  TRejectCallback,
  TResolveCallback,
  TServices,
} from './types';

export const callNative = (
  options: IBridgeOptions,
  resolve: TResolveCallback,
  reject: TRejectCallback,
) => {
  const prefix = `${options.service}.${options.action}`;
  if (Service[options.service]) {
    const service = (services as TServices)[options.service];
    if (service && service[options.action]) {
      service[options.action](
        options,
        (res: IBridgeResponse['data']) => {
          log('callUniNative <--', prefix, res);
          resolve(res);
        },
        (err: IBridgeResponse) => {
          log('callUniNative <--', prefix, err);
          reject(err);
        },
      );
    } else {
      try {
        log('callNative -->', prefix, options.data);
        // 调用原生插件方式，向原生发送异步请求
        uni.requireNativePlugin('LDSCallNativeModule').callAsyncFunc(
          {
            timeout: 60000,
            ...options,
          },
          (response: IBridgeResponse) => {
            try {
              // response =
              //   typeof response === 'string' && !/^\s?$/.test(response)
              //     ? JSON.parse(response)
              //     : response;
              log('callNative <--', prefix, response);
              if (response.code === 200) {
                resolve(response.data);
              } else {
                reject(response);
              }
            } catch (e) {
              log('callNative <--', prefix, e);
              reject({ code: -1, msg: 'callNative error', data: e });
            }
          },
        );
      } catch (e) {
        log('callNative error', prefix, e);
        reject({ code: -1, msg: 'callNative error', data: e });
      }
    }
  } else {
    const msg = '不支持该功能';
    log('callNative', prefix, msg);
    reject({ code: -1, msg });
  }
};
