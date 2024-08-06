import * as sentry from 'sentry-mina';
import { loginStore } from '../store/modules/login';
import { EnvType } from './env';
import { logout } from './logout';
import { OverdueTask } from './overdue-task';
// import { refreshToken, refreshTokenByClientId } from './refresh-token';
import { reLogin } from './relogin';
import { getHost, log, showInfo } from './tools';

/** request的第四个参数options的属性 */
export type TRequestOptions = {
  /** 请求时是否显示loading, 默认true, 注意：请求超过一定时间后才会显示loading,即ovderdue模式 */
  showLoading?: boolean;
  /** 延时显示loading的时间, 默认1000ms, 为0时确保同时只有一个接口在请求, 或至少接入在任务池的最后一位 */
  overdueShowLoadingTime?: number;
  /** 是否自动处理异常, 默认true */
  defaultError?: boolean;
  /** 空间类型, 如building, auth, space等, 默认building */
  spaceType?: string;
  /** 报文的Content-Type是否为application/x-www-form-urlencoded, 默认false */
  contentType_form?: boolean;
  /** 报文的Content-Type是否为application/json;charset=utf-8, 默认false */
  contentType_json?: boolean;
  timeout?: number;
  /** 自定义请求头参数 */
  header?: Record<string, any>;
  /** uni.request 调用时触发 */
  onUniRequest?: (instance: ReturnType<typeof uni.request>) => void;
};

// 报文头属性
type THeader = {
  CUSTOM_LANGUANGE_HEADER?: string;
  'business-subject'?: string;
  'Content-Type'?: string;
  'Content-Disposition'?: string; // 上传图片时使用
  token?: string;
  cuser_token?: string;
};

// 返回值的属性
export type TResponse = {
  code: number;
  data: any;
  result: any;
  desc: string;
};

// 日志黑名单, 可以不用全路径
const blackLogUrls = ['/v1/spaceDevice/statistics/', 'scene/template'];

let waitLoginQueue: any[] = [];
let isReLoginFetching = false;
/**
 * 重新登录并重新请求接口
 */
function tryReLogin(
  options: Parameters<typeof request>,
  resolve: (value: any) => void,
  reject: (error: any) => void,
) {
  waitLoginQueue.push([options, resolve, reject]);

  if (!isReLoginFetching) {
    isReLoginFetching = true;

    reLogin({
      onReLoginSuccess: () => {
        while (waitLoginQueue.length) {
          const [p, resolve, reject] = waitLoginQueue.shift()!;
          request(p[0], p[1], p[2], p[3]).then(resolve).catch(reject);
        }
        isReLoginFetching = false;
      },
      onReLoginError: () => {
        waitLoginQueue = [];
        isReLoginFetching = false;
      },
    }).catch(() => {
      waitLoginQueue = [];
      isReLoginFetching = false;
    });
  }
}

/**
 * 报文头
 * @param options
 * @param authInfo
 */
export const getHeader = (options: TRequestOptions) => {
  const header: THeader = {
    CUSTOM_LANGUANGE_HEADER: 'zh_CN',
  };

  if (options.contentType_form) {
    header['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  if (options.contentType_json) {
    header['Content-Type'] = 'application/json;charset=utf-8';
  }

  if (options.header) {
    Object.assign(header, options.header);
  }

  const authInfo = loginStore().authInfo;
  // const tokenKey = authInfo?.tokenHeaderName ? authInfo?.tokenHeaderName : 'token';
  // header[tokenKey] = authInfo?.accessToken ?? '';
  header.token = authInfo?.accessToken ?? '';
  return header;
};

/** 默认请求服务器失败的提示 */
export const defaultFailText = (obj: TResponse) => {
  return obj?.desc || '请求服务器失败';
};

/**
 * 业务级错误
 * 1. 部分错误码是系统级的, 会自动处理, catch无效;
 * 2. 其它错误码可走默认提示, 也可自行catch处理(需要配置defaultError为false, 否则catch无效)
 * @param res
 * @param options
 * @param authInfo
 * @param reject
 */
export const businessError = (
  res: TResponse,
  options: TRequestOptions,
  reject: any,
  statusCode: number,
) => {
  reject(res);

  if (res.desc?.includes('token required')) {
    logout({ showPrompt: true });
    return;
  }

  if (statusCode === 429) {
    showInfo('请求过于频繁');
    return;
  }

  switch (res.code) {
    // token失效
    case 600057: {
      reLogin();
      break;
    }
    // 以下异常码是登录异常
    case 660005:
    case 660006: {
      showInfo(res.desc, true);
      loginStore().clearAllData();
      // if (options.defaultError === false) {
      //   reject(res);
      // }
      break;
    }
    // session_key不同造成解密错误
    case 660008: {
      loginStore().clearAllData();
      // 自动登录有可能会触发
      // if (options.defaultError === false) {
      //   reject(res);
      // }
      break;
    }
    // 以下是权限类
    case 660010:
    case 660011:
    case 660012:
    case 660026: {
      showInfo(res.desc, true);
      // if (options.defaultError === false) {
      //   reject(res);
      // }
      break;
    }
    default: {
      if (options.defaultError === false) {
        // 自行处理异常, 需要catch和配置defaultError为false
        // reject(res);
      } else {
        // 默认处理, showInfo
        showInfo(defaultFailText(res), options.showMask);
      }
    }
  }
};

export const getCurrentUrl = () => {
  const currentPages = getCurrentPages();
  const currentPage = currentPages[currentPages.length - 1];
  const url = currentPage?.$page?.fullPath || '';
  return url;
};

/**
 * 网络错误
 * 有可能是用户网络问题, 也有可能是服务器网络问题
 * @param err
 * @param options
 * @param reject
 */
export const netWorkError = (errInfo: any, options: TRequestOptions, reject: any) => {
  console.log(`netWorkError ${errInfo.src} `, errInfo.err);

  // 这里禁用掉mqtt轮询补偿，断网之后提示
  if (
    `${errInfo.src}`.includes('v2/client/getClientId') ||
    `${errInfo.src}`.includes('v2/client/getCommonClientId')
  ) {
    return;
  }

  reject({ desc: '网络错误！请检查网络连接' });
  if (options.defaultError === false) {
  } else {
    showInfo('网络错误！请检查网络连接', true);
  }
};

/**
 * request 通用请求接口
 * @param src // 请求接口
 * @param param // 请求参数, 以对象传入
 * @param method // 请求方式, GET, POST等
 * @param options // 请求属性, 附加属性, 用于控制request的形为
 */
interface IRequest {
  <T>(
    src: string,
    param: any,
    method: UniApp.RequestOptions['method'],
    pOptions?: TRequestOptions,
  ): Promise<T>;
  service: typeof PREFIX_HASH;
}
const request: IRequest = <T>(
  src: string,
  param: any = {},
  method: UniApp.RequestOptions['method'] = 'POST',
  pOptions?: TRequestOptions,
) => {
  return new Promise<T>((resolve, reject) => {
    const options = {
      showMask: true,
      showLoading: true,
      overdueShowLoadingTime: 1000,
      mock: false,
      defaultError: true,
      timeout: 10000,
      spaceType: request.service.building,
    } as TRequestOptions;
    Object.assign(options, pOptions || {});

    // #ifdef MP-WEIXIN
    if (!blackLogUrls.some(black => src.includes(black))) {
      log(options.spaceType + src + '请求: ', param);
    }
    // #endif

    const overdueTaskKey = `${new Date().getTime()}_${src}`;
    if (options.showLoading) {
      OverdueTask.addTask(overdueTaskKey, options.overdueShowLoadingTime);
    }

    let host = getHost();
    // #ifdef H5
    host = '';
    if (
      process.env.NODE_ENV === 'development' &&
      import.meta.env.VITE_SERVER_ENV === EnvType.EnvType_DEV
    ) {
      // h5本地开发时, 若为dev环境，则需要走代理才能登录
      host = '';
    }
    // #endif

    const apiPrefix = '/api/';
    // spaceType默认building
    const urlPrefix = options.spaceType === 'openapi' ? '/openapi' : apiPrefix + options.spaceType;
    const header = getHeader(options);

    const api: UniApp.RequestOptions = {
      url: host + urlPrefix + src,
      method,
      data: param,
      header,
      timeout: options.timeout,
      success(response) {
        const res: TResponse = response.data as any;
        const store = loginStore();
        // #ifdef MP-WEIXIN
        if (!blackLogUrls.some(black => src.includes(black))) {
          // 返回的base64图片不要全部显示
          if (typeof res.data === 'string' && res.data.length > 1024) {
            log(options.spaceType + src + '返回: ', res.data.substring(0, 30));
          } else {
            log(options.spaceType + src + '返回: ', res.code === 200 ? res.data : res);
          }
        }
        // #endif
        if (options.showLoading) {
          OverdueTask.removeTask(overdueTaskKey);
        }
        if (response.statusCode === 200 && typeof response.data === 'string') {
          /** 返回的数据内容为纯字符串 */
          resolve(response.data as T);
        } else if (res.code === 200) {
          resolve(res.hasOwnProperty('data') ? res.data : res.result); // 成功
          // refreshTokenByClientId();
          store.refreshTokenOnExpire();
        } else if (res.code === 600057) {
          tryReLogin([src, param, method, pOptions], resolve, reject);
        } else {
          sentry.captureException({
            src: options.spaceType + src,
            accountName: store.userInfo?.accountName,
            authInfo: store.authInfo,
            request: param,
            response: res,
          });
          // 业务级错误
          businessError(res, options, reject, response.statusCode);
          log('业务级错误 : ', src, res);
        }
      },
      fail(err) {
        if (options.showLoading) {
          OverdueTask.removeTask(overdueTaskKey);
        }
        // 网络错误
        netWorkError({ src, err }, options, reject);
      },
    };

    const instance = uni.request(api);
    if (pOptions?.onUniRequest && typeof pOptions.onUniRequest === 'function') {
      pOptions.onUniRequest(instance);
    }
  });
};

const PREFIX_HASH = {
  building: 'building',
  sas: 'sas',
  space: 'space',
  device: 'device',
  auth: 'auth',
  product: 'product',
  ai: 'ai',
  controller: 'controller',
  connector: 'connector',
  campusbase: 'campusbase',
  car: 'car',
  data: 'data',
  boss: 'boss',
  file: 'file',
  ops: 'ops',
  alarm: 'alarm',
  card: 'card',
  venue: 'venue',
  privacy: 'privacy',
  attendance: 'attendance',
  ioc: 'ioc',
  flow: 'flow',
  campus: 'campus',
  jeecgboot: 'jeecgboot',
  passage: 'passage',
  openapi: 'openapi',
  quality: 'quality',
  security: 'security',
  dailyhealth: 'dailyhealth',
  interest: 'interest',
  schedule: 'schedule',
  arrange: 'arrange',
  evaluation: 'evaluation',
  recording: 'recording',
  timeset: 'timeset',
  studentEva: 'studentEva',
  message: 'message',
  visionProtection: 'visionProtection',
  visionTrain: 'visionTrain',
  science: 'science',
  medication: 'medication',
  asset: 'asset',
  person: 'c/person',
  portal: 'portal',
  strategy: 'strategy',
  classEvaluation: 'classEvaluation',
  pickup: 'pickup',
  vision: 'vision',
  canteenmanage: 'canteenmanage',
  clockin: 'clockin',
  sickness: 'sickness',
  examination: 'examination',
  staffAttend: 'staffAttend',
  lowcode: 'lowcode',
  workflow: 'workflow',
  resource: 'resource',
  school: 'school',
  weeklyCalendars: 'weeklyCalendars',
  teacherArchive: 'teacherArchive',
  documentv2: 'documentv2',
  classSchedule: 'classSchedule',
  scoreManagement: 'scoreManagement',
};

request.service = PREFIX_HASH;

export { request };
