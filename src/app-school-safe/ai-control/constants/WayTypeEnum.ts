export enum WayTypeEnum {
  LINE = 2,
  AREA,
}

/** 配置方式 */
export const WayTypeEnumOpts = [
  {
    label: '跨线',
    value: WayTypeEnum.LINE,
  },
  {
    label: '跨区',
    value: WayTypeEnum.AREA,
  },
];
