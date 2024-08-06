const enum processTypeCode {
  CONFIRMED = 1,
  MEDICATION = 2,
  MEDICATED = 3,
  REJECTED = 4,
  REVOKE = 5,
  EXPIRED = 6,
} // 1待确认 2待服药 3已服药 4已拒绝 5已撤回 6已失效
const processTypeEnum = [
  {
    label: '待确认',
    value: processTypeCode.CONFIRMED,
    bgColor: '#F2F3F4',
    color: '#4E5969',
  },
  {
    label: '待服药',
    value: processTypeCode.MEDICATION,
    bgColor: '#3491FA ',
    color: '#FFFFFF',
  },
  {
    label: '已服药',
    value: processTypeCode.MEDICATED,
    bgColor: '#00B42A ',
    color: '#FFFFFF',
  },
  {
    label: '已拒绝',
    value: processTypeCode.REJECTED,
    bgColor: '#F53F3F ',
    color: '#FFFFFF',
  },
  {
    label: '已失效',
    value: processTypeCode.REVOKE,
    bgColor: '#F2F3F4',
    color: '#4E5969',
  },
  {
    label: '已撤回',
    value: processTypeCode.EXPIRED,
    bgColor: '#F2F3F4',
    color: '#4E5969',
  },
];

export { processTypeCode, processTypeEnum };
