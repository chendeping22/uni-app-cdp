import { Action, Service } from '@/js-bridge/enums';
import { log } from '@/utils/tools';
import { callBridge } from './call-bridge';

const VITE_SERVER_ENV = import.meta.env.VITE_SERVER_ENV;
const envTypeMap: Record<string, 0 | 1 | 2> = {
  PROD: 0,
  DEV: 1,
  TEST: 2,
  TEST2: 2,
  TEST3: 2,
  PRE: 0, // 转到正式版
};
const envType = envTypeMap[VITE_SERVER_ENV];

export const checkX5Core = () => {
  callBridge({
    service: Service.x5,
    action: Action.checkX5Core,
    data: {},
  })
    .then((res: any) => {
      log(Action.checkX5Core, 'response:', res);
    })
    .catch(err => {
      log(Action.checkX5Core, 'err:', err);
    });
};

export const openUseX5 = (url: string, title: string) => {
  callBridge({
    service: Service.x5,
    action: Action.openUseX5,
    data: { url: url, title: title },
  })
    .then((res: any) => {
      log(Action.openUseX5, 'response:', res);
    })
    .catch(err => {
      log(Action.openUseX5, 'err:', err);
    });
};

export const commConfig = () => {
  callBridge({
    service: Service.system,
    action: Action.commConfig,
    data: {
      wxId: import.meta.env.VITE_WX_ID,
      wxAppId: import.meta.env.VITE_WX_APP_ID,
      wxWebUrl: import.meta.env.VITE_WX_WEB_URL,
      envType: envType,
    },
  })
    .then((res: any) => {
      log(Action.commConfig, 'response:', res);
    })
    .catch(err => {
      log(Action.commConfig, 'err:', err);
    });
};
