import { request } from '@/utils/request';
import { IListParams } from './common';
/** 耗材统计 */
export function getCountAndComputePercent() {
  return request(`/materialInfos/countAndComputePercent`, {}, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/** 耗材入库 
 *  dateType: 
    beginTime: 
    endTime: 
 */
export function getCountMaterialPut(params) {
  return request(`/materialPutItems/countMaterialPut`, params, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/** 耗材出库、耗损出库 
 *  dateType: 
    type：0 耗材  1 耗损
    beginTime: 
    endTime: 
 */
export function getCountMaterialOut(params) {
  return request(`/materialOutItems/countMaterialOut`, params, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/** 耗材退库 
 *  dateType: 
    beginTime: 
    endTime: 
 */
export function getCountMaterialBack(params) {
  return request(`/materialBackItems/countMaterialBack`, params, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/** 采购申请列表 */
export function getMaterialPurchases(params: IListParams) {
  return request(`/materialPurchases/queryPage`, params, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/** 采购清单列表
 * status
 */
export function getMaterialPurchasesTask(params: IListParams) {
  return request(`/materialPurchases/task`, params, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}
