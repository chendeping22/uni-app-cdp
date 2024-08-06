const enum visitStatus {
  REJECT = -1, // 已驳回
  PENDING = 0, // 待审核
  WAITING, // 未来访
  SIGNIN, // 已来访
  SIGNOUT, // 已签退
  EXPIRED, // 已过期
}

const visitStatusEnum = [
  {
    label: '已驳回',
    value: visitStatus.REJECT,
    bgType: 'error',
    colorType: 'white',
    secondaryBgType: 'error-light-3',
    secondaryColorType: 'error',
  },
  {
    label: '未审批',
    value: visitStatus.PENDING,
    bgType: 'blue',
    colorType: 'white',
    secondaryBgType: 'blue-light-3',
    secondaryColorType: 'blue',
  },
  {
    label: '未来访',
    value: visitStatus.WAITING,
    bgType: 'warnning',
    colorType: 'white',
    secondaryBgType: 'primary-light-3',
    secondaryColorType: 'blue',
  },
  {
    label: '已来访',
    value: visitStatus.SIGNIN,
    bgType: 'success',
    colorType: 'white',
    secondaryBgType: 'success-light-3',
    secondaryColorType: 'success',
  },
  {
    label: '已签离',
    value: visitStatus.SIGNOUT,
    bgType: 'success',
    colorType: 'white',
    secondaryBgType: 'success-light-3',
    secondaryColorType: 'success',
  },
  {
    label: '已过期',
    value: visitStatus.EXPIRED,
    bgType: 'fill-default',
    colorType: 'secondary',
    secondaryBgType: 'fill-light',
    secondaryColorType: 'secondary',
  },
];

export { visitStatus, visitStatusEnum };
