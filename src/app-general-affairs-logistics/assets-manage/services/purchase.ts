import { request } from '@/utils/request';
/** 采购列表  1-采购申请，2-采购清单*/
export function getAssetPurchasesPage(data: any) {
  return request(`/assetPurchases/page`, data, 'POST', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 采购单据-详情 */
export function getAssetPurchasesDetails(id: string) {
  return request(`/assetPurchases/detail/${id}`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
    defaultError: false,
  });
}

/** 采购单据-详情 */
// export function getAssetPurchasesDetails(id: string) {
//   return request(`/assetPurchases/detail/${id}`, {}, 'GET', {
//     spaceType: request.service.school,
//     showLoading: false,
//     defaultError: false,
//   });
// }
