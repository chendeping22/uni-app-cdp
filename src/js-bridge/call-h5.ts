import { log } from '@/utils/tools';
import services from './call-h5-import';
import type {
  IBridgeOptions,
  IBridgeResponse,
  TRejectCallback,
  TResolveCallback,
  TServices,
} from './types';

export const callH5 = (
  options: IBridgeOptions,
  resolve: TResolveCallback,
  reject: TRejectCallback,
) => {
  const prefix = `${options.service}.${options.action}`;
  log('callH5 -->', prefix, options.data);
  try {
    const service = (services as TServices)[options.service];
    if (service && service[options.action]) {
      service[options.action](
        options,
        (res: IBridgeResponse['data']) => {
          log('callH5 <--', prefix, res);
          resolve(res);
        },
        (err: IBridgeResponse) => {
          log('callH5 <--', prefix, err);
          reject(err);
        },
      );
    } else {
      const msg = '不支持该功能';
      log('callH5', prefix, msg);
      reject({ code: -1, msg });
    }
  } catch (error) {
    log('callH5 error', prefix, error);
    reject({ code: -1, msg: 'callH5 error', data: error });
  }
};
