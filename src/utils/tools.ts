import { LocationLevel } from '@/services/user';
import { loginStore } from '@/store/modules/login';
import { isEmpty, startsWith } from '@/utils/lodash-es';
import dayjs from 'dayjs';
import { getConfig } from './global-config';
// #ifdef APP-PLUS
import { debuggerModule } from '@/uni_modules/imengyu-IMDebuggerWindow/common/debuggerExtern.js';

// #endif

let clientType: 'APP' | 'WXA' = 'WXA';
// #ifdef APP-PLUS
clientType = 'APP';
// #endif
export { clientType };

// 取环境类型
const SERVER_ENV = import.meta.env.VITE_SERVER_ENV;

/** 是否是app端 */
export const isAppPlatform = clientType === 'APP';

const { miniProgram } = uni?.getAccountInfoSync?.() || {};
const { appId, envVersion } = miniProgram ?? {};

// 默认无需mask, 影响操作, 授权失败或接口异常的可以用mask
export const showInfo = (text: string, mask = false, duration = 3000) => {
  uni.showToast({
    title: text || '',
    icon: 'none',
    mask,
    duration,
  });
};

export const showLoading = (text?: string) => {
  uni.showLoading({
    title: text || '',
    mask: true,
  });
};

export const hideLoading = () => {
  uni.hideLoading();
};

interface IShowConfirm {
  title?: string;
  content: string;
  [k: string]: any;
}
/** 对话框, 注意不要传事件 */
export const showConfirm = (options: IShowConfirm) => {
  return new Promise(resolve => {
    uni.showModal({
      ...options,
      success: () => {},
      fail: () => {},
      complete: (res: any) => {
        resolve(res.confirm);
      },
    });
  });
};

export const delay = (time = 1000) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(1);
    }, time);
  });
};

export const deepClone = (obj: any) => {
  if (!obj) return '';
  return JSON.parse(JSON.stringify(obj));
};

export function getUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 是否是局级 */
export const isEdu = () => {
  const store = loginStore();
  const { userInfo } = store;
  const isEducators = import.meta.env.VITE_COMPOSITION === 'educators';
  const isHeadquarter = userInfo?.locationLevel === LocationLevel.Headquarter;
  return isHeadquarter || isEducators;
};

/**
 * 是否空字符串
 */
export const isEmptyStr = (str: any) => [undefined, null, ''].includes(str);

export const getPageParams = <T = any>(h5Type = 'h5') => {
  const pages = getCurrentPages();
  const curPage = pages[pages.length - 1] as any;
  let options = {} as T;
  // #ifdef MP-WEIXIN
  options = curPage?.options ?? (curPage?.$route?.query as T);
  // #endif

  // #ifdef H5
  if (h5Type === 'dd') {
    // 钉钉参数要兼容从location获取
    options = curPage?.options ?? (curPage?.$page?.options as T);
    if (!(options as any).sourceType) {
      const paramStr = window.location.search.substring(1) || '';
      paramStr.split('&').forEach(str => {
        const tmp = str.split('=');
        (options as any)[tmp[0]] = tmp[1];
      });
    }
  } else {
    options = !isEmpty(curPage?.options) ? curPage?.options : (curPage?.$page?.options as T);
  }

  // #endif

  // #ifdef APP-PLUS
  options = curPage.$page.options as T;
  // #endif
  return options;
};

export const setPageParams = (obj: any, prefix?: string) => {
  const arr = Object.keys(obj).map(k => {
    return `${k}=${obj[k]}`;
  });
  const str = arr.join('&');
  if (str && prefix) {
    return prefix + str;
  }
  return str;
};

/** url 路径如果不是 `/` 开头，则加上 `/` */
export const setUrlStartWithSlash = (url: string) => (startsWith(url, '/') ? url : `/${url}`);

export const fixZero = (t: number, needFix = true) => (needFix && t < 10 ? `0${t}` : `${t}`);

/** 通用日期显示格式 */
export const commonDateStr = (date: number) => {
  const today = new Date();
  const target = new Date(date);
  if (today.getDate() === target.getDate()) return formatDate(date, 'hh:mm');
  if (today.getDate() === target.getDate() + 1) return formatDate(date, '昨天 hh:mm');
  if (today.getFullYear() === target.getFullYear()) return formatDate(date, 'MM月DD日');
  return formatDate(date, 'YYYY年MM月DD日');
};

/**
 * 日期格式化
 * @param date {Date|Number} - 时间
 * @param format {String='YYYY-MM-DD'} - 匹配词区分大小写 YYYY MM DD hh mm ss
 * @param needFix {Boolean=true} - 是否需要补0, 默认true
 * @returns
 */
export const formatDate = (date: Date | number, format = 'YYYY-MM-DD', needFix = true) => {
  if (!date) return '';
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  return format.replace(/YYYY|MM|DD|hh|mm|ss/g, field => {
    switch (field) {
      case 'YYYY':
        return dateObj.getFullYear() + '';
      case 'MM':
        return fixZero(dateObj.getMonth() + 1, needFix);
      case 'DD':
        return fixZero(dateObj.getDate(), needFix);
      case 'hh':
        return fixZero(dateObj.getHours(), needFix);
      case 'mm':
        return fixZero(dateObj.getMinutes(), needFix);
      case 'ss':
        return fixZero(dateObj.getSeconds(), needFix);
      default:
        return '';
    }
  });
};

/** 获取指定参数 */
export function queryURL(name: string, search: string) {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  const params = search;
  const r = params.match(reg);
  if (r != null) return decodeURIComponent(r[2]);
  return null;
}

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
/** 获取服务器地址
 * 顺序: 配置地址 -> env默认地址
 */
export const getHost = () => {
  return getConfig().server_host;
};

/** 获取低码地址
 * 顺序: env默认地址
 */
export const getLowCodeH5Host = () => {
  return getConfig().lowcode_h5_host;
};

export const getLowCodeHost = () => {
  return getConfig().lowcode_host;
};

/** 获取实训地址
 * 顺序: env默认地址
 */
export const getTrainingHost = () => {
  return getConfig().imp2_training_h5_host;
};

/**
 * 转换图片的路径
 * 仅小程序且test环境, 需要转url, 按如下规则
 * http://testimp.leedarson.com:9000/xxx?xx=xx
 * ->
 * https://testimp.leedarson.com:12000/xxx
 * @param url
 * @returns
 */
export const transformImageUrl = (url: string) => {
  if (!url) return '';

  if (SERVER_ENV === 'TEST') {
    return url
      .replace('https://testimpfile.lexikos.com', 'http://testimp.leedarson.com:12000')
      .replace(/\?.*$/, '');
  }

  return url;
};

/** 判断是否有网络 */
export const hasNetwork = async () => {
  return new Promise<boolean>(resolve => {
    uni.getNetworkType({
      success: res => {
        resolve(res.networkType !== 'none');
      },
    });
  });
};

// 日志必须统一管理, 否则具有体验版权限的人员可以在正式版中打开vconsole, 从而暴露日志数据
export const log = (...args: any[]) => {
  // #ifdef MP-WEIXIN || H5
  // Pre 可以查看调试日志
  !(envVersion === 'release' && SERVER_ENV === 'PROD') &&
    console.info.apply(null, Array.prototype.slice.call(args));
  // #endif

  // #ifdef APP-PLUS
  if (SERVER_ENV !== 'PROD') {
    args.forEach((arg, inx) => {
      debuggerModule.addLog({
        time: inx === 0 ? formatDate(new Date(), 'YYYY-MM-DD hh:mm:ss') : '',
        type: 'log',
        str: JSON.stringify(args),
        solvedObjs: [arg],
      });
    });
  }
  // #endif
};

// 假设有数值变量 num
export const formattedNum = (num: number) => {
  let amount = num;
  if (num >= 10000) {
    amount = Math.round((num / 10000) * 100) / 100;
  }

  // 分离整数和小数部分
  const [integer, decimal] = amount.toString().split('.');

  // 处理整数部分，每隔 3 位加一个逗号
  const integerArr = integer.split('');
  for (let i = integerArr.length - 3; i > 0; i -= 3) {
    integerArr.splice(i, 0, ',');
  }
  const formattedInteger = integerArr.join('');

  // 拼接整数和小数部分
  if (num >= 10000) {
    return `${formattedInteger}${decimal ? '.' + decimal : ''}万`;
  } else {
    return `${formattedInteger}${decimal ? '.' + decimal : ''}`;
  }
};

/** 日期格式化 */
export const getFormatDate = (
  data: string | number | Date | dayjs.Dayjs | null | undefined,
  formatData?: string,
  emptyDefault?: string,
): any => {
  const emptyData = emptyDefault ?? data;
  return data ? dayjs(data).format(formatData || 'YYYY-MM-DD') : emptyData;
};
