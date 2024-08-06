import { request } from '@/utils/request';
/**借用 新增 */
export function addAssetBorrow(data: any) {
  return request(`/assetBorrow `, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/**借用 详情 */
export function getAssetBorrowDetail(borrowId: string) {
  return request(`/assetBorrow/${borrowId} `, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}
