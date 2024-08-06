import dayjs from 'dayjs';

export enum AudioTimeCode {
  TODAY, // 今日,
  WEEK, // 近一周,
  MONTH, // 近一个月
}

export const AudioTimeEnum = [
  {
    value: AudioTimeCode.TODAY,
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
    value: AudioTimeCode.WEEK,
    label: '近一周',
    getTimeScope: () => {
      return {
        alarmTimeStart: dayjs().subtract(7, 'day').startOf('day').valueOf(),
        alarmTimeEnd: dayjs().endOf('day').valueOf(),
      };
    },
  },
  {
    value: AudioTimeCode.MONTH,
    label: '近一个月',
    getTimeScope: () => {
      return {
        alarmTimeStart: dayjs().subtract(30, 'day').startOf('day').valueOf(),
        alarmTimeEnd: dayjs().endOf('day').valueOf(),
      };
    },
  },
];
