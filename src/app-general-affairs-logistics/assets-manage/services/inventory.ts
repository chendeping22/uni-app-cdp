import { request } from '@/utils/request';

/** 盘点统计 */
export function getAssetInventoryStatistic() {
  return request(`/assetInventory/approve/statistic`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 盘点任务列表 */
export function getAssetInventoryPage(data: Record<string, any>) {
  return request(`/assetInventoryTasks/page`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}
