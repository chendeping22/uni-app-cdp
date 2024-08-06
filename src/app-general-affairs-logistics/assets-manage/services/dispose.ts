import { request } from '@/utils/request';

/** 处置-新增 */
export function saveAssetDisposals(data: Record<string, any>) {
  return request(`/assetDisposals/create`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 处置-详情 */
export function getAssetDisposalsDetails(id: string) {
  return request(`/assetDisposals/details`, { id }, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 处置类型列表 */
export function getAssetDisposalsList() {
  return request(`/assetDisposals/type/list`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}
