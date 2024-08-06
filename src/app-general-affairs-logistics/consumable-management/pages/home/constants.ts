/** 首页tab类型枚举 */
export enum RecordTypeEnum {
  /** 首页 */
  HomeRecord = 0,
  /** 采购申请 */
  PurchaseRequestRecord,
  /** 采购清单 */
  ProcurementListRecord,
  /** 耗材入库 */
  ConsumableInventoryRecord,
  /** 耗材出库 */
  ConsumablesOutboundRecord,
  /** 耗损出库 */
  ConsumablesLossOutboundRecord,
  /** 耗材退库 */
  ConsumablesReturnRecord,
  /** 库存管理 */
  InventoryManagementRecord,
}

export enum StatusEnum {
  /** 未提交 */
  Unsubmitted = 0,
  /** 已提交 */
  Submitted = 1,
  /** 驳回 */
  Reject = 3,
  /** 退回  */
  Return = 4,
  /** 通过 */
  Adopt = 5,
}

export const TabList = [
  {
    name: '首页',
    key: RecordTypeEnum.HomeRecord,
  },
  {
    name: '采购申请',
    key: RecordTypeEnum.PurchaseRequestRecord,
  },
  {
    name: '采购清单',
    key: RecordTypeEnum.ProcurementListRecord,
  },
  {
    name: '耗材入库',
    key: RecordTypeEnum.ConsumableInventoryRecord,
  },
  {
    name: '耗材出库',
    key: RecordTypeEnum.ConsumablesOutboundRecord,
  },
  {
    name: '耗损出库',
    key: RecordTypeEnum.ConsumablesLossOutboundRecord,
  },
  {
    name: '耗材退库',
    key: RecordTypeEnum.ConsumablesReturnRecord,
  },
  {
    name: '库存管理',
    key: RecordTypeEnum.InventoryManagementRecord,
  },
];

export const colorList = [
  '#FAAD14',
  '#1677FF',
  '#52C41A',
  '#00000040',
  '#FF4D4F',
  '#722ED1',
  '#FADB14',
  '#FA541C',
];
export const statusList: any[] = [
  {
    label: '全部',
    value: '',
  },
  {
    label: '已提交',
    value: StatusEnum.Submitted,
  },
  {
    label: '驳回',
    value: StatusEnum.Reject,
  },
  {
    label: '通过',
    value: StatusEnum.Adopt,
  },
  {
    label: '退回',
    value: StatusEnum.Return,
  },
];
export const purchaseStatusList: any[] = [
  {
    label: '全部',
    value: '',
  },
  {
    label: '未采购',
    value: '0',
  },
  {
    label: '已采购',
    value: '1',
  },
];

/** 库存状态列表 */
export const inventoryStatusList: any[] = [
  {
    label: '全部',
    value: '',
  },
  {
    label: '安全库存',
    value: '1',
  },
  {
    label: '库存预警',
    value: '2',
  },
];

/** 底部按钮配置 */
export const bottomBtn: Record<number, any> = {
  [RecordTypeEnum.PurchaseRequestRecord]: {
    name: '新增采购申请',
    url: '/app-general-affairs-logistics/consumable-management/pages/purchase/index',
  },
  [RecordTypeEnum.ProcurementListRecord]: {
    name: '',
    url: '',
  },
  [RecordTypeEnum.ConsumableInventoryRecord]: {
    name: '新增入库',
    url: '/app-general-affairs-logistics/consumable-management/pages/materialPuts/index',
  },
  [RecordTypeEnum.ConsumablesOutboundRecord]: {
    name: '新增出库',
    url: '/app-general-affairs-logistics/consumable-management/pages/materialOut/index',
  },
  [RecordTypeEnum.ConsumablesLossOutboundRecord]: {
    name: '新增耗损出库',
    url: '/app-general-affairs-logistics/consumable-management/pages/materialLoseOut/index',
  },
  [RecordTypeEnum.ConsumablesReturnRecord]: {
    name: '',
    url: '',
  },
  [RecordTypeEnum.InventoryManagementRecord]: {
    name: '',
    url: '',
  },
};
export const cardConfig: Record<string, any> = {
  [RecordTypeEnum.PurchaseRequestRecord]: {
    detailUrl: '/app-general-affairs-logistics/consumable-management/pages/purchase/detail/index', // 详情地址
    orderIdName: '', // 单据id参数，默认fId
  },
  [RecordTypeEnum.ProcurementListRecord]: {
    detailUrl: '/app-general-affairs-logistics/consumable-management/pages/purchase/detail/index', // 详情地址
    orderIdName: '',
  },
  [RecordTypeEnum.ConsumableInventoryRecord]: {
    detailUrl:
      '/app-general-affairs-logistics/consumable-management/pages/materialPuts/detail/index',
    orderIdName: '',
  },
  [RecordTypeEnum.ConsumablesOutboundRecord]: {
    detailUrl:
      '/app-general-affairs-logistics/consumable-management/pages/materialOut/detail/index',
    orderIdName: '',
  },
  [RecordTypeEnum.ConsumablesLossOutboundRecord]: {
    detailUrl:
      '/app-general-affairs-logistics/consumable-management/pages/materialLoseOut/detail/index',
    orderIdName: '',
  },
  [RecordTypeEnum.ConsumablesReturnRecord]: {
    detailUrl:
      '/app-general-affairs-logistics/consumable-management/pages/materialBack/detail/index',
    orderIdName: '',
  },
  [RecordTypeEnum.InventoryManagementRecord]: {
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/variation/detail',
    orderIdName: '',
  },
};
