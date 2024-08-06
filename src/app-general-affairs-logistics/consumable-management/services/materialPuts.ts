import { request } from '@/utils/request';
import { IMaterialState } from '../types/material';

interface IPutQueryPage {
  startTime?: string;
  endTime?: string;
  pageNum?: number;
  pageSize?: number;
  searchValues?: string;
  storeId?: string;
}

/**耗材入库-新建/编辑 */
export function saveMaterialPuts(data: IMaterialState) {
  return request(`/materialPuts/save`, data, 'POST', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/**耗材入库-分页查询 */
export function getMaterialPutsPage(data: IPutQueryPage) {
  return request(`/materialPuts/queryPage`, data, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/**耗材入库-详情 */
export function getMaterialPutsDetail(id: string | number) {
  return request(`/materialPuts/detail/${id}`, {}, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}
