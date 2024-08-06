import { log } from '@/utils/tools';
import services from './call-wechat-import';
import type {
  IBridgeOptions,
  IBridgeResponse,
  TRejectCallback,
  TResolveCallback,
  TServices,
} from './types';

export const callWeChat = (
  options: IBridgeOptions,
  resolve: TResolveCallback,
  reject: TRejectCallback,
) => {
  const prefix = `${options.service}.${options.action}`;
  log('callWeChat -->', prefix, options.data);
  try {
    const service = (services as TServices)[options.service];
    if (service && service[options.action]) {
      service[options.action](
        options,
        (res: IBridgeResponse['data']) => {
          log('callWeChat <--', prefix, res);
          resolve(res);
        },
        (err: IBridgeResponse) => {
          log('callWeChat <--', prefix, err);
          reject(err);
        },
      );
    } else {
      const msg = '不支持该功能';
      log('callWeChat', prefix, msg);
      reject({ code: -1, msg });
    }
  } catch (error) {
    log('callWeChat error', prefix, error);
    reject({ code: -1, msg: 'callWeChat error', data: error });
  }
};
