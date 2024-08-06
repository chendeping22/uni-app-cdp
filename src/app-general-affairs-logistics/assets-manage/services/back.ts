import { request } from '@/utils/request';
/**归还 新增 */
export function assetBorrowReturn(data: any) {
  return request(`/assetBorrowReturn/create `, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/**归还 详情 */
export function getAssetBorrowReturnDetail(id: string) {
  return request(`/assetBorrowReturn/detail/${id} `, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}
