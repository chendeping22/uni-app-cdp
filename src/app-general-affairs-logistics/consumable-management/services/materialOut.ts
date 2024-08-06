import { request } from '@/utils/request';
import { IMaterialState } from '../types/material';

interface IOutQueryPage {
  startTime?: string;
  endTime?: string;
  pageNum?: number;
  pageSize?: number;
  searchValues?: string;
  flag?: number;
}

interface IMaterialInfos {
  pageNum?: number;
  pageSize?: number;
  searchValues?: string;
  storeId?: string | number;
}

/**耗材出库、耗损出库-分页查询 */
export function getMaterialOutsPage(data: IOutQueryPage) {
  return request(`/materialOuts/queryPage`, data, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/**耗材出库、耗损出库-新增耗材出库 */
export function saveMaterialOuts(data: IMaterialState) {
  return request(`/materialOuts/saveMaterial`, data, 'POST', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/**耗材出库、耗损出库-耗材详情 */
export function getMaterialOutsDetail(id: string | number) {
  return request(`/materialOuts/getMaterialOut/${id}`, {}, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/**耗材出库、耗损出库-耗材入库信息 */
export function getMaterialInfos(data: IMaterialInfos) {
  return request(`/materialInfos/getMaterialPage`, data, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}
