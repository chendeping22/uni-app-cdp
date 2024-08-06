import { request } from '@/utils/request';

/**详情-移动端扫码 */
export function getDetailByRole(id: string) {
  return request(`/AssetInfo/detailByRole/${id}`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/**详情-获取资产履历 */
export function getDetailOperationResume(id: string) {
  return request(`/asset/operation/resume/${id}`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/**首页-获取用户角色 （是否是资产管理员） */
export function getPermissionInfo() {
  return request(`/assetEquipmentType/getPermissionInfo`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/**首页-获取用户下资产统计 */
export function getUserAssetCount() {
  return request(`/AssetInfo/userAssetCount`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/**首页-获取组织下资产统计 */
export function getLocationAssetCount() {
  return request(`/AssetInfo/locationAssetCount`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/**首页-普通用户资产列表 */
export function getOrdinaryList(data: any) {
  return request(`/AssetInfo/getListV2`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/**根据人员id获取部门 */
export function getDeptList(userId: string) {
  return request(`/AssetInfo/getDeptList`, { userId }, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/** 审批-状态 */
export function getWorkOrderStatus() {
  return request(`/WorkOrder/status/list`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 选择资产列表或资产库 */
export const fetchList = (data: {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  assetName?: string;
  spaceIds?: string[];
  assetStatuses?: number[] | string[];
  subjects?: string[];
  assetNo?: string;
  equipmentType?: string;
  tenantId?: string;
  excludeAssetIds?: string[];
  recipientIdList?: string[];
}) => {
  return request('/AssetInfo/getAssetList', data, 'POST', {
    spaceType: request.service.school,
    defaultError: false,
    overdueShowLoadingTime: 0,
  });
};

/** 选择资产列表或资产库 */
export const fetchLibraryList = (data: {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  assetName?: string;
  spaceIds?: string[];
  assetStatuses?: number[] | string[];
  subjects?: string[];
  assetNo?: string;
  equipmentType?: string;
  tenantId?: string;
  excludeAssetIds?: string[];
  recipientIdList?: string[];
}) => {
  return request('/AssetInfo/assetLibrary', data, 'POST', {
    spaceType: request.service.school,
    defaultError: false,
    overdueShowLoadingTime: 0,
  });
};

/** 状态 */
export function getAssetStatus() {
  return request(`/AssetInfo/status/list`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 获取当前组织使用的模板 */
export function getAssetPrintTemplate() {
  return request(`/assetTagTemplates/getTemplate`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}
