import { request } from '@/utils/request';
export interface IChangesPage {
  id?: string;
  pageSize?: number;
  pageNUmber?: number;
}

/**库存-分页查询 */
export function getMaterialInfosPage(data: any) {
  return request(`/materialInfos/queryPage`, data, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}

/**变更记录-列表 */
export function getMaterialChanges(data: IChangesPage) {
  return request(`/materialChanges/queryPage`, data, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
    defaultError: false,
  });
}
