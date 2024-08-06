import { request } from '@/utils/request';

/** 变更-详情 */
export function getAssetPutDetails(id: string) {
  return request(`/assetPut/${id}`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}
