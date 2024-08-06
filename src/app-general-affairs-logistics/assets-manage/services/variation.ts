import { request } from '@/utils/request';

/** 变更-新增 */
export function saveAssetAssetChange(data: Record<string, any>) {
  return request(`/AssetChange`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 变更-详情 */
export function getAssetChangeDetails(id: string) {
  return request(`/AssetChange/${id}`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 变更类型列表 */
export function getChangeTypeList() {
  return request(`/AssetChange/changeType/list`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}
