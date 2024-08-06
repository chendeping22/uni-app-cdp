/** 审批状态对应文案 */
export const flowStatusMap: Record<number | string, string> = {
  0: '已驳回',
  1: '已同意',
  2: '提交',
  3: '已撤回',
  '-2': '审批中',
};

/** 通用流程状态 */
export const statusList = [
  '退回',
  '同意',
  '发起',
  '撤回',
  '终止',
  '指派',
  '后加签',
  '转办',
  '变更',
  '复活',
  '前加签',
  '挂起',
  '恢复',
];

export const flowStatusStyleMap: Record<number | string, string> = {
  0: 'color-error',
  1: 'color-success',
  2: 'color-success',
  3: 'color-error',
  '-2': 'color-primary',
};

/** 接口类型 */
export enum TypeEnum {
  /** 资产管理 */
  AssetManager = 'assetManager',
  /** 公共 */
  Common = 'common',
}
