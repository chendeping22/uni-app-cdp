const enum weekCycleCode {
  Mon = 1, // 周一
  Tues, // 周二
  Wed, // 周三
  Thur,
  Fri,
  Sat,
  Sun,
}
export interface weekItem {
  name: string;
  className: string;
  timeGap: string;
  weekday: number;
}
const weekCycleEnum = [
  {
    name: '周一',
    className: '休息',
    timeGap: '',
    weekday: weekCycleCode.Mon,
  },
  {
    name: '周二',
    className: '休息',
    timeGap: '',
    weekday: weekCycleCode.Tues,
  },
  {
    name: '周三',
    className: '休息',
    timeGap: '',
    weekday: weekCycleCode.Wed,
  },
  {
    name: '周四',
    className: '休息',
    timeGap: '',
    weekday: weekCycleCode.Thur,
  },
  {
    name: '周五',
    className: '休息',
    timeGap: '',
    weekday: weekCycleCode.Fri,
  },
  {
    name: '周六',
    className: '休息',
    timeGap: '',
    weekday: weekCycleCode.Sat,
  },
  {
    name: '周日',
    className: '休息',
    timeGap: '',
    weekday: weekCycleCode.Sun,
  },
];

const enum DevWaysTypeTextMap {
  UP = 1,
  DOWN,
  UPDOWN,
}

export { DevWaysTypeTextMap, weekCycleCode, weekCycleEnum };
