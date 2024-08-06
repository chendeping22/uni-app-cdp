import { request } from '@/utils/request';

/** 退还-新增 */
export function getAssetAcceptanceReturnCreate(data: Record<string, any>) {
  return request(`/assetAcceptanceReturn/create`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 退还-详情 */
export function getAssetAcceptanceReturnDetails(id: string) {
  return request(`/assetAcceptanceReturn/details`, { id }, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}
