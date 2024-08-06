/** 审批状态枚举 */
export enum StatusEnum {
  /**审批中-1 */
  Approve = 1,
  /**已同意-2 */
  Agree = 2,
  /** 驳回 -3*/
  Reject = 3,
  /** 撤回 -4 */
  Withdraw = 4,
  /** 已完成 */
  Done = 5,
}

/** 紧急程度枚举 */
export enum UrgentEnum {
  /**一般 0*/
  commonly = 0,
  /** 紧急 1*/
  urgent,
  /** 抢修 2*/
  emergency,
}

/** 资产状态 */
export enum AssetStatus {
  /** 闲置-0 */
  Unused = 0,
  /** 在用-1 */
  InUse = 1,
  /** 借用-2 */
  Borrow = 2,
  /** 审批中-3 */
  Approve = 3,
  /** 维修中-4 */
  Repair = 4,
  /** 调拨中-5 */
  Allot = 5,
  /** 已处置-6 */
  Disposed = 6,
  /** 已报废-7 */
  Scrap = 7,
  /** 保养中-8 */
  Maintain = 8,
  /** 待维修-9 */
  WaitingRepair = 9,
}

/** 通用筛选条件 */
export const statusList: any[] = [
  {
    label: '审批中',
    value: StatusEnum.Approve,
    type: 'common',
  },
  {
    label: '已同意',
    value: StatusEnum.Agree,
    type: 'common',
  },
  {
    label: '已驳回',
    value: StatusEnum.Reject,
    type: 'common',
  },
  {
    label: '已撤回',
    value: StatusEnum.Withdraw,
    type: 'common',
  },
];

/** 维修单筛选条件 */
export const serviceStatusList: any[] = [
  {
    label: '维修中',
    value: StatusEnum.Approve,
    type: 'service',
  },
  {
    label: '维修完成',
    value: StatusEnum.Agree,
    type: 'service',
  },
  {
    label: '不维修',
    value: StatusEnum.Reject,
    type: 'service',
  },
];

/** 处置单状态 */
export const disposeStatusList: Record<string, any>[] = [
  ...statusList,
  {
    label: '已完成',
    value: StatusEnum.Done,
  },
];

export const urgencyList = [
  {
    label: '一般',
    value: UrgentEnum.commonly,
  },
  {
    label: '紧急',
    value: UrgentEnum.urgent,
  },
  {
    label: '抢修',
    value: UrgentEnum.emergency,
  },
];

/** 审批单据类型枚举 */
export enum RecordTypeEnum {
  /**领用单 */
  ReceiveRecord = 0,
  /** 退还单 */
  SendBackRecord = 1,
  /**借用单 */
  BorrowRecord = 2,
  /**归还单 */
  ReturnRecord = 3,
  /**报修单 */
  RepairRecord = 4,
  /**维修单 */
  ServiceRecord = 5,
  /**变更单 */
  VariationRecord = 6,
  /**处置单 */
  DisposeRecord = 7,
  /**入库单 */
  PutRecord = 8,
}
