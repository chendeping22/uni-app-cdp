import { request } from '@/utils/request';

/** 盘点任务详情 */
export function getInventoryDetail(data: Record<string, any>) {
  return request(`/assetInventory/detail/${data.inventoryId}`, { taskId: data.taskId }, 'GET', {
    spaceType: request.service.school,
    defaultError: false,
  });
}

/** 盘点任务资产列表 */
export const getInventoryAssets = (data: any, type: string) => {
  return request(`/assetInventory/page/${type}`, data, 'POST', {
    spaceType: request.service.school,
    defaultError: false,
  });
};
