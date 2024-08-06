import dayjs from 'dayjs';

export enum AlarmTimeCode {
  ALL, // 全部
  TODAY, // 今日,
  YESTERDAY, // 昨日,
  WEEK, // 本周,
  LASTWEEK, // 上周
  MONTH, // 本月
  LASTMONTH, // 上个月
}

export const AlarmTimeEnum = [
  {
    value: AlarmTimeCode.ALL,
    label: '全部',
    getTimeScope: () => ({
      alarmTimeStart: undefined,
      alarmTimeEnd: undefined,
    }),
  },
  {
    value: AlarmTimeCode.TODAY,
    label: '今日',
    getTimeScope: () => {
      const date = dayjs();
      return {
        alarmTimeStart: date.startOf('day').valueOf(),
        alarmTimeEnd: date.endOf('day').valueOf(),
      };
    },
  },
  {
    value: AlarmTimeCode.YESTERDAY,
    label: '昨日',
    getTimeScope: () => {
      const date = dayjs().subtract(1, 'day');
      return {
        alarmTimeStart: date.startOf('day').valueOf(),
        alarmTimeEnd: date.endOf('day').valueOf(),
      };
    },
  },
  {
    value: AlarmTimeCode.WEEK,
    label: '本周',
    getTimeScope: () => {
      const date = dayjs();
      return {
        alarmTimeStart: date.startOf('week').valueOf(),
        alarmTimeEnd: date.endOf('week').valueOf(),
      };
    },
  },
  {
    value: AlarmTimeCode.LASTWEEK,
    label: '上周',
    getTimeScope: () => {
      const date = dayjs().subtract(1, 'week');
      return {
        alarmTimeStart: date.startOf('week').valueOf(),
        alarmTimeEnd: date.endOf('week').valueOf(),
      };
    },
  },
  {
    value: AlarmTimeCode.MONTH,
    label: '本月',
    getTimeScope: () => {
      const date = dayjs();
      return {
        alarmTimeStart: date.startOf('month').valueOf(),
        alarmTimeEnd: date.endOf('month').valueOf(),
      };
    },
  },
  {
    value: AlarmTimeCode.LASTMONTH,
    label: '上月',
    getTimeScope: () => {
      const date = dayjs().subtract(1, 'month');
      return {
        alarmTimeStart: date.startOf('month').valueOf(),
        alarmTimeEnd: date.endOf('month').valueOf(),
      };
    },
  },
];
