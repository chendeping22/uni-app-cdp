export enum HandleTypeCodeEnum {
  DISPOSE = 1,
  UPGRADE,
}

export const HandleTypeEnum = [
  {
    label: '处置',
    value: HandleTypeCodeEnum.DISPOSE,
  },
  {
    label: '升级',
    value: HandleTypeCodeEnum.UPGRADE,
  },
];

export enum UpgradeTypeCodeEnum {
  PERSON = 1,
  DEPARTMENT,
}

export const UpgradeTypeEnum = [
  {
    label: '人员',
    value: UpgradeTypeCodeEnum.PERSON,
  },
  {
    label: '部门',
    value: UpgradeTypeCodeEnum.DEPARTMENT,
  },
];
