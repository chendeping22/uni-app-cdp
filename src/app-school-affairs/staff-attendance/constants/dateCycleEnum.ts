const enum dateCycleCode {
  DAY = 'Day', // 日
  WEEK = 'Week', // 周
  MONTH = 'Month', // 月
}

const dateCycleEnum = [
  {
    name: '日统计',
    value: dateCycleCode.DAY,
  },
  {
    name: '周统计',
    value: dateCycleCode.WEEK,
  },
  {
    name: '月统计',
    value: dateCycleCode.MONTH,
  },
];

export { dateCycleCode, dateCycleEnum };
