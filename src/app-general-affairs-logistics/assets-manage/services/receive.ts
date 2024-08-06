import { request } from '@/utils/request';

/** 领用-新增 */
export function getAssetAcceptanceCreate(data: Record<string, any>) {
  return request(`/assetAcceptance/create`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 领用-详情 */
export function getAssetAcceptanceDetails(id: string) {
  return request(`/assetAcceptance/details`, { id }, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}
