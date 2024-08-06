import { request } from '@/utils/request';
import { IMaterialState } from '../types/material';

interface IBackQueryPage {
  startTime?: string;
  endTime?: string;
  pageNum?: number;
  pageSize?: number;
  searchValues?: string;
}

/**耗材退库-分页查询 */
export function getMaterialBacksPage(data: IBackQueryPage) {
  return request(`/materialBacks/queryPage`, data, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/**耗材退库-详情 */
export function getMaterialBackDetail(id: string | number) {
  return request(`/materialBacks/getMaterialBack/${id}`, {}, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/**耗材退库-新增耗材退库 */
export function saveMaterialBack(data: IMaterialState) {
  return request(`/materialBacks/saveMaterialBack`, data, 'POST', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}
