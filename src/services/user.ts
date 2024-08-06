import type { ITreePermission, IUserInfo } from '@/store/modules/env';
import { loginStore } from '@/store/modules/login';
import { getUserTypes } from '@/utils/kind';
import { request } from '@/utils/request';

export interface AppVersionData {
  content: string; // APP版本内容
  forced: boolean; // 强制更新标识 0:否；1:是
  popUp: boolean; // 是否升级弹窗提醒 0否 1是
  terminal: number; // APP系统类型 1:安卓 2:IOS
  version: string; // APP版本
  url: string; // 安卓包下载链接
}

/**
 * 获取APP最大版本信息
 */
export const getAppVersion = (data?: any, showLoading = true) => {
  return request<AppVersionData>('/anon/files/v3/apps/actions/max', data, 'GET', {
    spaceType: request.service.building,
    defaultError: false,
    showLoading: showLoading,
  });
};

/**
 * 切换组织
 * @param userType
 * @param locationId
 */
export const changeLocation = (
  userType: number,
  locationId: string,
  cid: string,
  childId: number,
  wxCode: string,
  appId: string,
) => {
  return request(
    '/mobile/changeLocation',
    {
      userType,
      locationId,
      cid,
      childId,
      wxCode,
      appId,
      terminal: loginStore().currentEnv.terminal,
    },
    'POST',
    {
      defaultError: false,
      showLoading: false,
    },
  );
};

/**
 * 获取UserType{0, 1, 2}
 */
export const getUserType = (id: string) => {
  return request<any>('/v1/cuser/getById', { id: id }, 'GET', {
    spaceType: request.service.auth,
    defaultError: false,
    showLoading: false,
  });
};

/**
 * 获取用户信息
 * @param defaultError
 * @param showLoading
 */
export const findByUserId = (userId: string) => {
  return request<any>(`/v1/accounts/actions/findByUserId?userId=${userId}`, {}, 'POST', {
    spaceType: request.service.auth,
    defaultError: false,
    showLoading: false,
  });
};

/**
 * 获取用户信息
 * @param defaultError
 * @param showLoading
 */
export const getUserInfo = (defaultError = true, showLoading = true) => {
  return request<IUserInfo>('/v2/actions/getUserInfoVo', {}, 'POST', {
    defaultError: false,
    showLoading: false,
  });
};

/**
 * 获取用户信息New
 * @param defaultError
 * @param showLoading
 */
export const getUserInfoNew = (defaultError = true, showLoading = true) => {
  return request<IUserInfo>('/personalCenter', {}, 'GET', {
    defaultError: false,
    showLoading: false,
    spaceType: request.service.building,
  });
};

/**
 * 获取用户权限
 */
export const getTreePermissions = () => {
  return request<ITreePermission[]>('/permission/actions/getTreePermissions', {}, 'GET', {
    defaultError: false,
    showLoading: false,
    spaceType: request.service.auth,
  });
};

/**
 * 缓存刷新登录
 * @param clientId
 */
export const refreshLogin = (clientId: string) => {
  return request('/anon/mobile/loginByClientId', { clientId }, 'GET', {
    defaultError: false,
    showLoading: false,
    spaceType: request.service.building,
  });
};

/**
 * 组织级别
 */
export enum LocationLevel {
  /** 局级、总部 */
  Headquarter,
  /** 校级、园区 */
  Branch,
}

// locationItem
export type ILocationItem = {
  id: string;
  name: string; // 组织名称
  parentId: string; // 挂靠组织ID
  industryCode: string; // 组织行业code（Edu:教育行业 Manu:制造业）
  locationLevel: LocationLevel; // 组织级别（0:局级/总部 1:校级/园区）
  locationUse: number; // 组织用途（1:正式项目 0:测试项目 2:演示/样板房）
  province: string; // 省份
  city: string; // 城市
  district: string; // 区县
  address: string; // 地址
  longitude: string; // 精度
  latitude: string; // 纬度
  contacts: string; // 联系人
  mobilePhone: string; // 手机号
  adminAccount: string; // 超管账号
  adminAccountPassword: string; // 超管账号密码
  deployWay: number; // 部署方式（0:私有云 1:公有云 2:混合云）
  logoFileId: string; // logo
  orderNum: number; // 序号
  status: number; // 状态（0:禁用 1:启用）
  createBy: string; // 创建人
  updateBy: string; // 更新人
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
  childs: ILocationItem[];
};

export const refreshTokenApi = (
  clientId: string,
  token: string,
  locationId: string,
  userId: string,
  userType: number,
) => {
  return request(
    `/anon/mobile/refreshTokenByClientId/${clientId}`,
    {
      token,
      locationId,
      userId,
      userType,
    },
    'POST',
    {
      defaultError: false,
      showLoading: false,
    },
  );
};

export const refreshToken = (accessToken: string, refreshToken: string) => {
  return request<{
    accessToken: string;
    expireTime: string;
    refreshToken: string;
    refreshExpireTime: string;
  }>(
    `/anon/refreshToken`,
    {
      accessToken,
      refreshToken,
      terminal: loginStore().currentEnv.terminal,
    },
    'POST',
    {
      defaultError: false,
      showLoading: false,
      spaceType: request.service.building,
    },
  );
};

export const locations = () => {
  return request('/mobile/locations', getUserTypes(), 'POST', {
    defaultError: false,
    showLoading: false,
    spaceType: request.service.building,
  });
};
