import { loginStore } from '@/store/modules/login';
import { EApplicationType, ETargetType, IApplication } from '@/store/modules/workbench';
import { Privacy_Url } from '@/utils/constant';
import { getRemoteConfig } from '@/utils/global-config';
import { goToApplication } from '@/utils/go-to-application';
import { EUserType } from '@/utils/kind';
import { isNil, join, map } from '@/utils/lodash-es';
import { makeStorageKey } from '@/utils/storage-keys';
import { log, showInfo } from '@/utils/tools';
import { regExpVerifyPassword } from './regs';

/** 获取微信code */
export const getWxCode = () => {
  console.log('Call getWxCode ...... ');
  return new Promise<string>(resolve => {
    uni.login({
      success: (res: any) => {
        resolve(res.code);
        console.log('Call getWxCode ...... res.code:', res.code);
      },
      fail: () => {
        showInfo('登录失败, 请检查网络连接');
        resolve('');
      },
    });
  });
};

/**
 * 从 storage 获取 AppClientId，如果不存在，则重新生成
 * @param {boolean} doSetAppClientId 是否在 AppClientId 不存在，重新生成时，执行 setAppClientId
 * @returns 返回 [appClientId值, 是否已存在]
 */
export const getAppClientId = async (doSetAppClientId = true) => {
  const clientIdKey = makeStorageKey('clientId');
  let appClientId: string = uni.getStorageSync(clientIdKey);
  const exist = !!appClientId;
  // 1. 先判断appClientId, 若无手动登录
  if (!exist && doSetAppClientId) {
    console.log('AppClientId 不存在，重新设置。');
    appClientId = await setAppClientId();
  }
  return [appClientId, exist] as [string, boolean];
};

export const setAppClientId = async () => {
  const clientIdKey = makeStorageKey('clientId');
  const appClientId = generateClientId();
  while (true) {
    uni.setStorageSync(clientIdKey, appClientId);
    await wait(300);
    const newStorageClientId = uni.getStorageSync(clientIdKey);
    if (newStorageClientId) {
      break;
    }
  }
  return appClientId;
};

export const wait = async (t = 0) => {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, t);
  });
};

/**
 * 生成cliend
 * @returns
 */
export const generateClientId = () => {
  const random = fillZero(Math.floor(Math.random() * 100000), 5);
  const now = new Date();
  // 时间格式 年月日时分秒毫秒
  const timeStr = `${fillZero(now.getFullYear(), 4)}${fillZero(now.getMonth() + 1)}${fillZero(
    now.getDate(),
  )}${fillZero(now.getHours())}${fillZero(now.getMinutes())}${fillZero(now.getSeconds())}${fillZero(
    now.getMilliseconds(),
  )}`;

  return `${timeStr}_${random}`;
};

/**
 * 填充数字位数, 如12=>'00012', 如果已经超过count, 则截取前面的, 如123456返回'1234'
 * @param val // 默认整数
 * @param count // 总位数
 */
export const fillZero = (val: number, count = 2) => {
  if (Number.isNaN(val)) return new Array(count).fill('0').join('');
  const str = val.toString();
  const len = str.length;
  if (len >= count) return str;
  return `${new Array(count - len).fill('0').join('')}${str}`;
};

/**
 * 基础信息加*
 */
export function getCaptcha(
  txt: string,
  flag: boolean,
  option?: {
    start: number;
    end?: number;
    maskChar?: string;
  },
) {
  const { start = 0, end = 0, maskChar = '*' } = option || {};
  const text = txt;
  if (!flag) {
    return text;
  }
  return join(
    map(text, (char, i) => {
      if (i >= start && i < end) {
        return maskChar;
      }
      return char;
    }),
    '',
  );
}

export const validatePassword = async (value: string) => {
  if (!value) {
    return Promise.reject({ desc: '请输入密码' });
  }

  if (value.length > 20 || value.length < 8) {
    return Promise.reject({ desc: '请输入8-20位密码' });
  }

  const errorDesc = '您设置的密码安全等级较低，请重新输入';

  // eslint-disable-next-line no-useless-escape
  if (!value.match(regExpVerifyPassword)) {
    return Promise.reject(errorDesc);
  }

  if (
    value.match(/^[0-9]+$/) ||
    value.match(/^[a-z]+$/) ||
    value.match(/^[A-Z]+$/) ||
    // eslint-disable-next-line no-useless-escape
    value.match(/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/)
  ) {
    return Promise.reject({ desc: errorDesc });
  }

  return Promise.resolve();
};

export const goToPrivate = () => {
  const item: IApplication = {
    code: '',
    icon: '',
    id: '',
    name: '隐私政策',
    path: Privacy_Url,
    target: ETargetType.TargetTypeAbsoluteH5,
    type: EApplicationType.New,
  };
  goToApplication(item);
};

export const formatWebviewOpenPath = (openPath: string, openFrom: string, title: string) => {
  const store = loginStore();
  const { authInfo, currentUserType, currentOrganization, userInfo } = store;
  const accessToken = authInfo?.accessToken || '';
  let url: string;

  if (openPath.includes('token=')) {
    url = openPath;
  } else {
    let platform = '';
    // #ifdef APP-PLUS
    platform = 'app';
    // #endif
    // #ifdef MP-WEIXIN
    platform = 'wx';
    // #endif
    // #ifdef H5
    platform = 'h5';
    // #endif

    /** NOTE: 新增参数尽量以短参数名命名，以减少url长度 */
    const searchParams: Record<string, string | number | boolean | undefined> = {
      isBasePlatform: 1, // 新基座来源标识，原 isBasePlatform 变量
      impHost: getRemoteConfig('imp'),
      openFrom,
      platform,
      userType: currentUserType,
      locationId: currentOrganization?.id,
      locationLevel: currentOrganization?.locationLevel,
      locationType: currentOrganization?.locationType,
      uid: userInfo?.id,
      userId: userInfo?.userId,
      personId: userInfo?.personId,
      // tokenKey: authInfo?.tokenHeaderName,
      tokenKey: 'token',
      rft: authInfo?.refreshToken, // refreshToken
      token: accessToken,
      te: authInfo?.tokenExpire, // tokenExpire
      title,
    };
    if (currentUserType === EUserType.guardian) {
      searchParams.currentChildId = currentOrganization?.childId;
    }

    const searchString: string[] = [];
    for (const [key, value] of Object.entries(searchParams)) {
      if (!isNil(value)) {
        searchString.push(`${key}=${encodeURIComponent(value)}`);
      }
    }

    url = `${openPath}${/\?/.test(openPath) ? '&' : '?'}${searchString.join('&')}`;
  }
  log('src: ' + url);
  return url;
};
