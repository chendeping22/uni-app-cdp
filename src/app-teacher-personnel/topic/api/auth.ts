import { request } from '@/utils/request';

export const getApplicationsMenus = appCode => {
  return request(`/mobile/applications/${appCode}/menus`, {}, 'GET', {
    spaceType: request.service.auth,
    showLoading: false,
    defaultError: false,
  });
};
