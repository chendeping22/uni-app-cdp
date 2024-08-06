import { loginStore } from '@/store/modules/login';
import { request } from '@/utils/request';
import useIsGuardian from '@/utils/use-is-guardian';

type EventCode = 'login' | 'switch_location' | 'pageview';

type PlatformType = 'web' | 'app' | 'wxa';

type OS = 'ios' | 'android' | 'window' | 'mac';

type LoginMode = 'sms' | 'wechat' | 'account';

/** 客户端类型 */
enum TrackClientId {
  /** IMP web端 */
  IMP = 1,
  /** 麦塔校园小程序 */
  WXAPP = 2,
  /** 麦塔校园APP */
  APP = 5,
  /** BOOS web端 */
  // BOSS = 6,
  /** 小管家 */
  // _XGJ = 7,
  /** 麦塔家校小程序 */
  // _MTMP = 9,
}

export interface TrackEnv {
  /** 客户端类型web, app, wxa */
  pt: PlatformType;
  /** application version应用版本，IMP或boss传迭代版本 */
  version?: string;
  /** 移动端的build版本号 */
  build?: string;
  /** equipment model型号，iPhone版本，android手机型号，浏览器版本（web端不用传，解析ua） */
  em?: string;
  /** 系统类型ios，android，window，mac（web端不用传，解析ua） */
  os?: OS;
  /** 操作系统版本（web端不用传，解析ua） */
  ov?: string;
}

export interface TrackEvent {
  /** 事件编码（login、pageview等） */
  code: EventCode;
  /** 组织id（location id） */
  lid: string | number;
  /** 时间戳 */
  ts: number;
  /** stop timestamp事件结束时间戳 */
  st?: number;
  /** IMP pageview事件的应用标识（application id） */
  ai?: string;
  /** login事件的登录方式，短信登录（sms），账号密码登录（account） */
  md?: string;
  /** pageview事件的页面路径 */
  url?: string;
}

export interface TrackUser {
  /** 用户唯一标识 */
  aid?: string;
  /** 用户标识，与组织关联，跟aid是一对多关系 */
  uid?: string;
  uIdentity?: string | number;
}

/** 埋点上报数据体 */
export interface TrackData {
  /** 客户端类型 */
  cid: TrackClientId;
  env: TrackEnv;
  events: TrackEvent[];
  /** 请求唯一标识，用于去重 */
  seq: string;
  user: TrackUser;
}

interface TrackOptions {
  locationId?: TrackEvent['lid'];
  appCode?: TrackEvent['ai'];
  url?: TrackEvent['url'];
  md?: LoginMode;
  permissionCode?: string;
}

const uuid = function () {
  const s: any[] = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 32; i++) {
    const idx = Math.floor(Math.random() * 0x10);
    s[i] = hexDigits.substring(idx, idx + 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  const idx19 = (s[19] & 0x3) | 0x8;
  s[19] = hexDigits.substring(idx19, idx19 + 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  const uuid = s.join('').replace('-', '');
  return uuid;
};

class TrackReport {
  private readonly cid: TrackClientId;
  private readonly env: TrackEnv;

  constructor() {
    const systemInfo = uni.getSystemInfoSync();
    this.cid = TrackClientId.WXAPP;
    this.env = {
      pt: 'wxa',
      os: systemInfo.osName,
      ov: systemInfo.osVersion,
      em: `model=${systemInfo?.model},system=${systemInfo?.system},ua=${systemInfo?.ua || ''}`,
      version: __INTERNAL_VERSION__,
    };
    // #ifdef MP-WEIXIN
    this.env.pt = 'wxa';
    this.cid = TrackClientId.WXAPP;
    const { miniProgram } = uni.getAccountInfoSync() || {};
    if (miniProgram.version) {
      this.env.version = miniProgram.version;
    }
    // #endif
    // #ifdef APP-PLUS
    this.cid = TrackClientId.APP;
    this.env.pt = 'app';
    const tempVersion = plus.runtime.version;
    this.env.build = tempVersion;
    if (tempVersion) {
      this.env.version = tempVersion;
    }
    // #endif
  }

  send(event: EventCode, params?: TrackOptions) {
    try {
      const userInfo = loginStore().userInfo;
      const isGuardian = useIsGuardian();
      const user: TrackUser = isGuardian
        ? {
            aid: userInfo?.userId,
            uid: userInfo?.personId,
            uIdentity: userInfo?.userIdentity,
          }
        : {
            aid: userInfo?.accountId,
            uid: userInfo?.id,
            uIdentity: userInfo?.userIdentity,
          };
      const data: TrackData = {
        cid: this.cid,
        env: this.env,
        events: [
          {
            code: event,
            lid: params?.locationId || userInfo?.locationId || 0,
            ts: Date.now(),
            // url: '',
          },
        ],
        seq: uuid(),
        user,
      };

      if (params) {
        if (params.appCode) data.events[0].ai = params.appCode;
        if (params.url) data.events[0].url = params.url;
      }

      switch (event) {
        case 'login': {
          if (params && params.md) data.events[0].md = params.md;
          break;
        }
        case 'switch_location': {
          break;
        }
        case 'pageview': {
          break;
        }
      }

      const url = `/anon/event/v1/report`;
      request(url, data, 'POST', {
        spaceType: request.service.ops,
        defaultError: false,
        showLoading: false,
      });
    } catch (e) {
      console.debug(e);
    }
  }
}

const instance = new TrackReport();

export default function track(event: EventCode, params?: TrackOptions) {
  instance.send(event, params);
}
