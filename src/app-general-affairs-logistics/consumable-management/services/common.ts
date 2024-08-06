import { request } from '@/utils/request';

export interface IListParams {
  // code?: string;
  // taskStatus?: number | string[];
  pageSize: number;
  pageNum: number;
}
/** 获取状态公共接口 */
export function getAssetSuppliers(entryCode: string) {
  return request(`/dictionaries?entryCode=${entryCode}`, {}, 'GET', {
    spaceType: request.service.auth,
    showLoading: false,
    defaultError: false,
  });
}

/** 库存列表
 * searchValues
 */
export function getMaterialBaseInfos(params: IListParams) {
  return request(`/materialBaseInfos/queryPage`, params, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/** 所属学院接口
 * status
 */
export function getSchoolRosterTree(id: string, status: number) {
  return request(`/v1/school/roster/biz/tree/${id}?status=${status}`, {}, 'GET', {
    spaceType: request.service.campusbase,
    showLoading: false,
    defaultError: false,
  });
}

/** 申请人信息 */
export function getUserManagement(id: string) {
  return request(`/v1/userManagement/${id}`, {}, 'GET', {
    spaceType: request.service.building,
    showLoading: false,
    defaultError: false,
  });
}

/** 审批接口 */
export function setMaterialCommonProcess(data: any) {
  return request(`/material/common/process`, data, 'POST', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/** 获取refreshToken
 * accessToken
 * refreshToken
 */
export function getRefreshToken(data: any) {
  return request(`/anon/refreshToken`, data, 'POST', {
    spaceType: request.service.building,
    showLoading: false,
    defaultError: false,
  });
}

/**根据单位查询仓库列表 */
export function getStoresBySpaceId() {
  return request(`/materialStores/getStoresBySpaceId`, {}, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/**所属学段、所属学院 */
export function getCollegesOrSectionsList() {
  return request(`/materialStores/getCollegesOrSectionsList`, {}, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}
