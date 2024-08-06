import { request } from '@/utils/request';

export const getUploadUrl = (params: any) => {
  return request('/files/getUploadUrl', params, 'GET', {
    spaceType: request.service.resource,
    showLoading: false,
    defaultError: false,
  });
};
