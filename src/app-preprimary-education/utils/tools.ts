import { LocationType, loginStore } from '@/store/modules/login';
import profile_photo_boy from '../static/image/profile_photo_boy.png';
import profile_photo_girl from '../static/image/profile_photo_girl.png';
import { REGS } from './regs';

/** 小孩头像  */
export const childHeaderImg = (url: string, gender: number) =>
  transformImageUrl(url) || (gender === 2 && profile_photo_girl) || profile_photo_boy;

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

  if (import.meta.env.VITE_SERVER_ENV.includes('TEST')) {
    return url
      .replace('https://testimpfile.lexikos.com', 'http://testimp.leedarson.com:12000')
      .replace(/\?.*$/, '');
  }

  return url;
};

//yyyy-mm-dd格式
export const dateToStr = (t: Date | number | any) => {
  const date = typeof t === 'number' ? new Date(t) : t;
  return `${date.getFullYear()}-${fixZero(date.getMonth() + 1)}-${fixZero(date.getDate())}`;
};

// 当前年-月-日
export const getCurDate = (t: Date | number) => dateToStr(t);

export const fixZero = (t: number, needFix = true) => (needFix && t < 10 ? `0${t}` : `${t}`);

/** 组织类型为幼教时，需要特殊展示的应用 */
export enum specialApp {
  /** 学生考勤=>幼儿考勤 */
  StudentAttendance = 'student-attendance',
  /** 家校通知=>信息发布 */
  HomeSchoolNotice = 'home-school-notice',
  /** 安全日志=>安全台账 */
  SecurityLog = 'security-log',
  /** 智能检索=>轨迹分析 */
  IntelligentRetrieval = 'intelligent-retrieval',
  /** 离园接送 */
  ReturnProcess = 'return-process',
  /** 巡更管理=>安全巡检 */
  PatrolManagement = 'patrol-management',
  /** 学生请假=>幼儿请假 */
  StudentForLeave = 'student-for-leave',
  /** 每日健康=>幼儿晨检 */
  DailyHealth = 'daily-health',
  /** 排班管理=>值日表 */
  DutyRoster = 'duty-roster',
  /** 作息管理=>一日作息 */
  WorkRestManagement = 'work-rest-management',
  /** 时光集=>随手拍 */
  TimeCollection = 'time-collection',
  /** 观察记录=>观察评价 */
  ObservationRecord = 'observation-record',
  /** 成长档案=>时光机 */
  GrowthPortfolio = 'growth-portfolio',
}
/** 组织类型为幼教时，需要特殊展示的应用名称 */
const specialAppNameMap: Record<string, string> = {
  [specialApp.StudentAttendance]: '幼儿考勤',
  [specialApp.HomeSchoolNotice]: '信息发布',
  [specialApp.SecurityLog]: '安全台账',
  [specialApp.IntelligentRetrieval]: '轨迹分析',
  [specialApp.ReturnProcess]: '离园接送',
  [specialApp.PatrolManagement]: '安全巡检',
  [specialApp.StudentForLeave]: '幼儿请假',
  [specialApp.DailyHealth]: '一日三检',
  [specialApp.WorkRestManagement]: '一日作息',
  [specialApp.TimeCollection]: '随手拍',
  [specialApp.ObservationRecord]: '观察评价',
  [specialApp.GrowthPortfolio]: '时光集',
};
/** 组织类型为幼教时，特殊展示应用名称和分类 */
export const getSpecialAppName = (appCode: string) => {
  // 根据locationType判断，仅当组织类型为幼教时需要处理
  if (loginStore().userInfo?.locationType !== LocationType.PreSchool) {
    return null;
  }
  return specialAppNameMap[appCode];
};

export const delay = (time = 1000) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(1);
    }, time);
  });
};

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

// 默认无需mask, 影响操作, 授权失败或接口异常的可以用mask
export const showInfo = (text: string, mask = false, duration = 3000) => {
  uni.showToast({
    title: text || '',
    icon: 'none',
    mask,
    duration,
  });
};

// 日志必须统一管理, 否则具有体验版权限的人员可以在正式版中打开vconsole, 从而暴露日志数据
export const log = (...args: any[]) => {
  console.info.apply(null, Array.prototype.slice.call(args));
  // #ifdef MP-WEIXIN || H5
  // Pre 可以查看调试日志
  // !(envVersion === 'release' && CORAL_ENV === 'PROD') &&
  //   console.info.apply(null, Array.prototype.slice.call(args));
  // #endif

  // #ifdef APP-PLUS
  // if (CORAL_ENV !== 'PROD') {
  //   args.forEach((arg, inx) => {
  //     debuggerModule.addLog({
  //       time: inx === 0 ? formatDate(new Date(), 'YYYY-MM-DD hh:mm:ss') : '',
  //       type: 'log',
  //       str: JSON.stringify(args),
  //       solvedObjs: [arg],
  //     });
  //   });
  // }
  // #endif
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

/** 返回字符串长度, 以半角为准 */
export const strLen = (str: string) => {
  if (!str) return 0;
  let count = 0;
  const strs = str.split('');
  strs.forEach(s => {
    if (REGS.halfAngle.test(s)) {
      count++;
    } else {
      count += 2;
    }
  });
  return count;
};

/** 以半角的长度截取字符串 */
export const subStringByHalfAngle = (str: string, size: number) => {
  let count = 0;
  let inx = 0;
  const strs = str.split('');
  for (let i = 0; i < strs.length; i++) {
    const s = strs[i];
    if (REGS.halfAngle.test(s)) {
      count++;
    } else {
      count += 2;
    }
    inx++;
    if (count >= size) {
      if (count > size) inx--;

      break;
    }
  }
  return str.substring(0, inx);
};

// 默认无需mask, 影响操作, 授权失败或接口异常的可以用mask
export const showSuccess = (text: string, mask = false) => {
  uni.showToast({
    title: text || '',
    icon: 'success',
    mask,
    duration: 3000,
  });
};
