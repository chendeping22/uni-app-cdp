export enum LargeModelCode {
  NONE = -1, // 无需验证
  PENDING = 0, // 验证中
  SUCCESS = 1, // 验证通过
  FAIL = 2, // 验证不通过
  ERROR = 3, // 校验失败(网络超时等导致无法正常校验)
}

export const LargeModelEnum = [
  {
    label: '校验通过',
    value: LargeModelCode.SUCCESS,
  },

  {
    label: '校验不通过',
    value: LargeModelCode.FAIL,
  },
  {
    label: '校验中',
    value: LargeModelCode.PENDING,
  },
  {
    label: '校验失败',
    value: LargeModelCode.ERROR,
  },
];
