export const LockPowerOptions = [
  { value: '-1', label: '不锁定', index: 0 },
  { value: '1', label: '锁定开', index: 1 },
  { value: '0', label: '锁定关', index: 2 },
];

export const WindSpeedOptions = [
  { value: 1, label: '高速' },
  { value: 2, label: '中速' },
  { value: 3, label: '低速' },
  { value: 4, label: '自动' },
];

export const ModeOptions = [
  { value: 0, label: '自动' },
  { value: 1, label: '制冷' },
  { value: 2, label: '除湿' },
  { value: 3, label: '送风' },
  { value: 4, label: '制热' },
];

export const findMode = (value: number) =>
  ModeOptions.find(item => item.value == value) || ModeOptions[0];
export const findWindSpeed = (value: number) =>
  WindSpeedOptions.find(item => item.value == value) || WindSpeedOptions[0];
