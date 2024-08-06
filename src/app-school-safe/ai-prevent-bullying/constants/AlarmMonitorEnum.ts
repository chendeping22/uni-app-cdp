export enum AlarmMonitorCode {
  ALL = -1, // 全部
  NORMALIZED_RECORDING = 0, // 常态化录音
  ANTI_BULLYING_MONITOR = 6, // 关键字
  SOUND_INTENSITY = 7, // 声强
  SMOKE_DETECTOR = 8, // 烟感
  INFRARED_INDUCTION = 9, // 红外感应
  ONE_KEY_ALARM = 10, // 设备端一键告警
  LIGHT_PERCEPTION = 11, // 光感
}

export const AlarmMonitorEnum = [
  {
    value: AlarmMonitorCode.ALL,
    label: '全部类型',
  },
  {
    value: AlarmMonitorCode.NORMALIZED_RECORDING,
    label: '常态化录音',
  },
  {
    value: AlarmMonitorCode.ANTI_BULLYING_MONITOR,
    label: '关键字报警',
  },
  {
    value: AlarmMonitorCode.SOUND_INTENSITY,
    label: '声强报警',
  },
  {
    value: AlarmMonitorCode.SMOKE_DETECTOR,
    label: '烟感报警',
  },
  {
    value: AlarmMonitorCode.INFRARED_INDUCTION,
    label: '红外感应报警',
  },
  {
    value: AlarmMonitorCode.ONE_KEY_ALARM,
    label: '一键告警',
  },
  {
    value: AlarmMonitorCode.LIGHT_PERCEPTION,
    label: '光感告警',
  },
];
