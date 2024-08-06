import { request } from '@/utils/request';

/** 供应商-列表 */
export function getAssetSuppliers(data: Record<string, any>) {
  return request(`/AssetSupplier/query`, data, 'POST', {
    spaceType: request.service.school,
    defaultError: false,
  });
}
