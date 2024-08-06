import { loginStore } from '@/store/modules/login';
import { IWorkbench } from '@/store/modules/workbench';
import { EUserType } from '@/utils/kind';
import { request } from '@/utils/request';

/**
 * 应用中心
 */
export const getApplications = () => {
  return request('/mobile/applications', { terminal: loginStore().currentEnv.terminal }, 'GET', {
    spaceType: 'auth',
    defaultError: false,
    showLoading: false,
  });
};

/**
 * Banner列表(content为空)
 */
export const getBanners = (showLoading: boolean) => {
  return request('/schoolPublishInfos/campusInformations', {}, 'GET', {
    spaceType: request.service.campus,
    defaultError: false,
    showLoading,
  });
};

/**
 * 收藏列表
 */
export const getFavoriteApplications = (showLoading: boolean) => {
  return request(
    '/mobile/favoriteApplications',
    { terminal: loginStore().currentEnv.terminal },
    'GET',
    {
      spaceType: 'auth',
      defaultError: false,
      showLoading,
    },
  );
};

/**
 * 更新收藏列表
 */
export const updateFavoriteApplications = (codes: string[]) => {
  return request('/mobile/favoriteApplications', { codes }, 'PUT', { spaceType: 'auth' });
};

/**
 * 工作台列表查询
 */
export const getWorkbenchList = (showLoading: boolean) => {
  return request<IWorkbench>(
    '/user/workbenches/widgets',
    { clientType: 'mobile', terminal: loginStore().currentEnv.terminal },
    'GET',
    {
      spaceType: 'auth',
      defaultError: false,
      showLoading,
    },
  );
};

/**
 * 更新组件
 */
export const udpateWidgetList = (
  workbenchId: string,
  widgets: { id: string; layout: string }[],
) => {
  console.log(workbenchId, widgets);

  return request(`/user/workbenches/${workbenchId}`, { widgets, clientType: 'mobile' }, 'PATCH', {
    spaceType: 'auth',
    defaultError: false,
    showLoading: false,
  });
};

/**
 * 应用获取跳转小程序配置信息
 */
export const getWechatMiniProgramConfigInfo = (applicationId: string, userId: string) => {
  return request(
    '/v1/third/app/urls/actions/getAppReplacePlatformUrl',
    { applicationId, clientType: 'mobile', userId },
    'GET',
    {},
  );
};

/**
 * 获取第三方应用信息
 */
export const getThirdApplicationInfo = (applicationId: string, locationId: string) => {
  return request(
    '/applicationPaths/get/final/path',
    { applicationId, locationId, clientType: 2 },
    'GET',
    {
      spaceType: request.service.auth,
    },
  );
};

export interface IGetFollowStatusRtn {
  subscribe: 0 | 1; // 0-未关注(其实是用户取消关注了), 1-已关注
}

/**
 * 查询公众号的关注状态
 * @param type 类型 1-家长, 0-教师
 * @returns
 */
export const getFollowStatus = () => {
  const type = loginStore().currentUserType === EUserType.teacher ? 0 : 1;
  return request<IGetFollowStatusRtn | null>(
    `/v1/wechatAccounts/${type}/actions/attentionInfo`,
    {},
    'GET',
    {
      spaceType: request.service.auth,
      showLoading: false,
      defaultError: false,
    },
  );
};
