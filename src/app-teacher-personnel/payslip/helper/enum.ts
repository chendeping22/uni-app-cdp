/**
 * 密码修改页面类型
 */
export enum PageStageEum {
  LOADING = 0,
  // 第一次配置
  FIRST_CONFIG = 1,
  // 不是第一次配置
  NO_FIRST_CONFIG = 2,
  // 修改密码
  MODIFY = 3,
  // 忘记密码
  FORGET = 4,
  // 工资列表
  // MINE_SALARY_LIST = 5,
  // // 错误页面
  // ERROR = 100,
}

// 查看状态
export const readStatus = [
  {
    label: '未查看',
    value: 0,
    color: 'blue',
  },
  {
    label: '已查看',
    value: 1,
    color: 'default',
  },
];

// 确认状态
export const confirmStatus = [
  {
    label: '未确认',
    value: 0,
    color: 'blue',
  },
  {
    label: '已确认',
    value: 1,
    color: 'default',
  },
];
