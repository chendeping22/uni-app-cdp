import { request } from '@/utils/request';

/**
 * 更新组件
 */
export const getApplication = (code: string) => {
  return request(`/v1/applications/actions/getByCode/${code}`, {}, 'GET', {
    spaceType: 'auth',
    defaultError: false,
    showLoading: false,
  });
};

/**
 * Banner详情
 */
export const getBannerDetail = (id: number) => {
  return request(`/schoolPublishInfos/campusInformations/${id}`, {}, 'GET', {
    spaceType: request.service.campus,
    defaultError: false,
    showLoading: false,
  });
};
