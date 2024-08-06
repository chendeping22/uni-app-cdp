/** 审批单据类型枚举 */
export enum RecordTypeEnum {
  /**采购单 */
  ApprovalRecord = 0,
  /** 采购清单 */
  InventoryRecord = 1,
}

export const commonTabs = [
  {
    name: '采购单',
    key: RecordTypeEnum.ApprovalRecord,
  },
  {
    name: '采购清单',
    key: RecordTypeEnum.InventoryRecord,
  },
];
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
}
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
  {
    label: '未采购',
    value: StatusEnum.Approve,
    type: 'inventory',
  },
  {
    label: '已采购',
    value: StatusEnum.Agree,
    type: 'inventory',
  },
];
