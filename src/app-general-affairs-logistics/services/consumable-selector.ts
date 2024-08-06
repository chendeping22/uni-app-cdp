import { request } from '@/utils/request';

interface Params {
  pageNum: number;
  pageSize: number;
  searchValues?: string;
  storeId?: number;
}

/** 选择器 - 基础信息列表 （采购用） */
export function getSelectorBaseItems(data: Params) {
  return request(`/materialBaseInfos/queryPage`, data, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
  });
}

/** 选择器 - 采购列表 (入库用) */
export function getSelectorPurchaseItems(data: Params) {
  return request(`/materialPurchaseItems/queryPage`, data, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
  });
}

/** 选择器 - 入库列表 (出库用) */
export function getSelectorWarehouseItems(data: Params) {
  return request(`/materialInfos/getMaterialPage`, data, 'GET', {
    spaceType: request.service.asset,
    showLoading: false,
  });
}
