import { request } from '@/utils/request';
export interface IListParams {
  code?: string;
  taskStatus?: number | string[];
  pageSize: number;
  currentPage: number;
}

/** 审批-领用单列表 */
export function getApproveReceiveList(data: IListParams) {
  return request(`/assetAcceptance/query`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 审批-退还单列表 */
export function getAssetAcceptanceReturnList(data: IListParams) {
  return request(`/assetAcceptanceReturn/query`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/** 审批-借用单列表 */
export function getAssetBorrowList(data: IListParams) {
  return request(`/assetBorrow/page`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
  });
}
/** 审批-归还单列表 */
export function getAssetBorrowReturnList(data: IListParams) {
  return request(`/assetBorrowReturn/page`, { ...data, pageType: 2 }, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
  });
}
/** 审批-报修单列表 */
export function getAssetRepairsList(data: IListParams) {
  return request(`/assetRepairs/query`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/** 审批-维修单列表 */
export function getAssetRepairTaskList(data: IListParams) {
  return request(`/AssetRepairTask/getList`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/** 审批-变更单列表 */
export function getAssetVariationList(data: IListParams) {
  return request(`/AssetChange/page`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/** 审批-处置单列表 */
export function getAssetDisposalsList(data: IListParams) {
  return request(`/assetDisposals/query`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/** 审批-入库单列表 */
export function getAssetPutList(data: IListParams) {
  return request(`/assetPut/page`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
  });
}
