import { loginStore } from '@/store/modules/login';
import { ETargetType, workbenchStore } from '@/store/modules/workbench';
import { goToApplication } from './go-to-application';
import { getPageParams, setPageParams } from './tools';

export interface IShareParams {
  R: string; //Redirect缩写 重定向Url/业务参数(需要业务特殊处理)
  A: string; //ApplicationCode缩写 应用code/业务code(需要业务特殊处理)
  U: string; //EUserIdentityType缩写 打开角色
}

/** 身份类型 */
export enum EUserIdentityType {
  /** 老师 */
  teacher = 1,
  /** 学生 */
  student = 2,
  /** 家长 */
  guardian = 4,
}

/** 来源 */
export enum EOpenSourceType {
  /** 微信分享 */
  wxShare = 1,
  /** schemal */
  schemaUrl = 2,
  /** 扫一扫 */
  scan = 3,
}
export type TResolveCallback = (success: boolean) => void;
export type TRejectCallback = (fail: boolean) => void;

const handleShareParams: () => IShareParams & {
  scene: string;
} = () => {
  const params = getPageParams();

  // 小程序二维码特有参数
  if (params.scene) {
    const _params = {};
    // 录播：云上课堂家校小程序邀请，COCG === Classroom:On:Cloud:Guardian，因小程序码生成需限制32位长度，因此在此处特殊处理
    if (params.A === 'COCG') {
      const hashValue = params.R;
      const applicationCode = 'Classroom:On:Cloud:Guardian';
      const redirectUrl = `/intelligent-recording/classroom-on-cloud/doraemon-h5/index?hashValue=${hashValue}&isInvite=1`;
      _params.A = applicationCode;
      _params.R = redirectUrl;
      _params.U = params.U;
    }
    return _params;
  }

  return params;
};

export const handleShareLink = async (isFromWelcomePage = false, reject?: TRejectCallback) => {
  const params = handleShareParams();
  console.log('handleShareLink=>', params);
  handleLink(
    params,
    { source: EOpenSourceType.wxShare, isFromWelcomePage: isFromWelcomePage },
    reject,
  );
};

export const handleLink = async (
  params: IShareParams & { scene: string },
  options: { source: EOpenSourceType; isFromWelcomePage?: boolean },
  reject?: TRejectCallback,
) => {
  console.log('handleLink=>', params);

  if (!isFromShareLink(params)) {
    if (reject) {
      reject(false);
    }
    return;
  }

  const store = loginStore();
  const identityType: EUserIdentityType = Math.pow(2, store.currentUserType);
  const supportEUserIdentityType = Number(params.U);
  console.log(
    'identityType allEUserIdentityType ',
    identityType,
    supportEUserIdentityType,
    supportEUserIdentityType & identityType,
  );
  if ((supportEUserIdentityType & identityType) === identityType) {
    let applicationCategoryList = workbenchStore().applicationCategoryList;
    let selApplication;
    const applicationCodes = params.A.split(',') ?? [];
    console.log('applicationCodes', applicationCodes);
    console.log('applicationCategoryList', applicationCategoryList);
    if (!applicationCategoryList || applicationCategoryList.length < 1) {
      console.log('applicationCategoryList数据为空 重新请求');
      try {
        await workbenchStore().fetchApplicationCategorysData(false);
        applicationCategoryList = workbenchStore().applicationCategoryList;
        console.log('获取应用列表数据', applicationCategoryList);
      } catch (err) {
        applicationCategoryList = workbenchStore().applicationCategoryList;
        console.log('获取应用列表异常', err);
      }
    }
    for (const category of applicationCategoryList) {
      const application = category.applications.find(item => applicationCodes.includes(item.code));
      if (application) {
        selApplication = application;
        break;
      }
    }

    if (selApplication) {
      selApplication.path = decodeURIComponent(params.R);
      // 跳转H5页面 只能到首页后在跳转(解决webview在首页左上角不显示home按钮 而是显示返回问题)
      if (options.isFromWelcomePage && selApplication.target !== ETargetType.TargetTypeNative) {
        if (reject) {
          reject(true);
        }
        return;
      }
      goToApplication(selApplication);
    } else {
      const url = `/app-platform/workbench/application-auth-prompt?type=2&applicationCode=${
        params.A
      }&identity=${identity(params)}&source=${options.source}`;
      if (options.isFromWelcomePage) {
        uni.reLaunch({ url });
      } else {
        uni.navigateTo({
          url,
        });
      }
    }
  } else {
    const url = `/app-platform/workbench/application-auth-prompt?type=1&applicationCode=${
      params.A
    }&identity=${identity(params)}&source=${options.source}`;
    if (options.isFromWelcomePage) {
      uni.reLaunch({ url });
    } else {
      uni.navigateTo({
        url,
      });
    }
  }
};

const identity = (params: IShareParams) => {
  const supportEUserIdentityType = Number(params.U);
  const teacher =
    (supportEUserIdentityType & EUserIdentityType.teacher) === EUserIdentityType.teacher
      ? '老师'
      : '';
  const guardian =
    (supportEUserIdentityType & EUserIdentityType.guardian) === EUserIdentityType.guardian
      ? '家长'
      : '';
  const student =
    (supportEUserIdentityType & EUserIdentityType.student) === EUserIdentityType.student
      ? '学生'
      : '';
  return `${teacher}${guardian}${student}`;
};

/**
 *
 * @param params params.scene: 小程序二维码扫码附带参数，传值需严格按照U、A、R的顺序来传值，形如scene："6&COGC&35c49876"，参数之间使用&进行区分
 * @returns
 */
export const isFromShareLink = (_params: IShareParams & { scene: string }) => {
  const params = _params;
  if (params.scene) {
    const scene: string[] = decodeURIComponent(params.scene).split('&');
    params.U = scene[0];
    params.A = scene[1];
    params.R = scene[2];
  }
  return params && params?.R && params?.A && params?.U;
};

export const getLinkParams = () => {
  const params = getPageParams();
  if (isFromShareLink(params)) {
    if (params['R'].indexOf('?') !== -1) {
      params['R'] = encodeURIComponent(params['R']); //重新编码一下
    }
    return `?${setPageParams(params)}`;
  }
  return '';
};

export const createSharePath = (
  path: string,
  applicationCode: string,
  userType: EUserIdentityType,
) => {
  const encodePath = `/pages/welcome/welcome-wx?R=${encodeURIComponent(
    path,
  )}&A=${applicationCode}&U=${userType.toString()}`;
  return encodePath;
};
