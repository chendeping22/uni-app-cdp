import { request } from '@/utils/request';

/** 采购申请保存*/
export function saveMaterialPurchases(data: any) {
  return request(`/materialPurchases/save`, data, 'POST', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/** 采购申请-详情 */
export function getMaterialPurchasesDetails(id: string) {
  return request(`/materialPurchases/detail/${id}`, {}, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/** 采购申请-删除 */
export function deleteMaterialPurchasesById(id: string) {
  return request(`/materialPurchases/deleteById/${id}`, {}, 'DELETE', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/** 采购重新提交 */
export function commonProcess(data: any) {
  return request(`/material/common/process`, data, 'POST', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}
