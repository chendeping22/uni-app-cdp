import { request } from '@/utils/request';

export interface IInventory {
  /**盘点单ID */
  inventoryId?: string;
  /**资产Id */
  assetId?: string;
  /**盘点方式：1-手动，2-扫码 */
  inventoryMode?: number;
  /**盘点任务Id */
  inventoryTaskId?: string;
  /**盘点类型:1-移动端，2-web端 */
  inventoryType?: number;
  /**盘点备注 */
  remark?: string;
  /**图片地址 */
  fileId?: string;
}

/** 盘点 */
export function saveAssetInventory(data: IInventory) {
  return request(`/assetInventory/inventory`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 取消盘点 */
export function cancelAssetInventory(data: IInventory) {
  return request(`/assetInventory/inventory/cancel`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 审批 */
export function checkAssetInventory(data: { woId?: string; comment?: string }) {
  return request(
    `/assetInventory/commit/${data?.woId}`,
    { comment: data?.comment, nodeIndex: 1 },
    'POST',
    {
      spaceType: request.service.school,
      showLoading: false,
      defaultError: false,
    },
  );
}

/** 手动盘点详情 */
export function getTaskItemDetail(data: { id: string }) {
  return request(`/assetInventorySubtasks/taskItemDetail`, data, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 删除盘点信息 */
export function deleteSubtasks(id: string) {
  return request(`/assetInventorySubtasks/delete/${id}`, {}, 'DELETE', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 修改盘点信息 */
export function saveInventorySubtasks(data: any) {
  return request(`/assetInventorySubtasks/modify`, data, 'PUT', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}
