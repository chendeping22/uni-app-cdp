const enum exceptionCode {
  NORMAL = 0, // 正常
  LATE,
  EARLY,
  ABSENCE,
  LEAVE,
  WAIT, // 未开始
  COUNTERSIGN,
}

const exceptionEnum = [
  {
    label: '正常',
    value: exceptionCode.NORMAL,
    colorType: 'success',
  },
  {
    label: '缺勤',
    value: exceptionCode.ABSENCE,
    colorType: 'error',
  },
  {
    label: '迟到',
    value: exceptionCode.LATE,
    colorType: 'warnning',
  },
  {
    label: '早退',
    value: exceptionCode.EARLY,
    colorType: 'warnning',
  },
  {
    label: '请假',
    value: exceptionCode.LEAVE,
    colorType: 'primary',
  },
  {
    label: '补签',
    value: exceptionCode.COUNTERSIGN,
    colorType: 'success',
  },
];

const statisticsEnum = [
  {
    label: '缺勤',
    value: exceptionCode.ABSENCE,
    colorType: 'error',
    code: 'absenteeismNum',
  },
  {
    label: '迟到',
    value: exceptionCode.LATE,
    colorType: 'warnning',
    code: 'lateNum',
  },
  {
    label: '早退',
    value: exceptionCode.EARLY,
    colorType: 'warnning',
    code: 'earlyNum',
  },
  {
    label: '请假',
    value: exceptionCode.LEAVE,
    colorType: 'primary',
    code: 'leaveNum',
  },
];

type keyName = 'label' | 'value' | 'colorType';

export interface DataParams {
  key: keyName;
  type: number;
}

export interface ExceptionItem {
  label: string;
  value: number;
  colorType: string;
}

export { exceptionCode, exceptionEnum, statisticsEnum };
