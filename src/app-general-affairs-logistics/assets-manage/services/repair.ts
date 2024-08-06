import { request } from '@/utils/request';
export function getAdmin(tenantId: string, userId: string) {
  return request(`/assetEquipmentType/getIsAdmin`, { userId, tenantId }, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 报修-新增 */
export function assetAssetRepairsCreate(data: Record<string, any>) {
  return request(`/assetRepairs/create`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 报修-详情 */
export function getAssetAssetRepairsDetail(id: string) {
  return request(`/assetRepairs/details`, { id }, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 维修-新增 */
export function assetAssetRepairTask(data: Record<string, any>) {
  return request(`/AssetRepairTask/update`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 维修-详情 */
export function getAssetAssetRepairTaskDetail(id: string) {
  return request(`/AssetRepairTask/details`, { id }, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}
