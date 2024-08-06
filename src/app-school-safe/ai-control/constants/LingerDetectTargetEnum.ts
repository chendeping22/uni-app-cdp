// 定点徘徊检测目标
export enum LingerDetectTargetEnum {
  wherever = -1,
  top,
  center,
  bottom,
  algorithm,
}

export const LingerDetectTargetOpts = [
  { label: '任意点', value: LingerDetectTargetEnum.wherever },
  { label: '底部', value: LingerDetectTargetEnum.bottom },
  { label: '中心点', value: LingerDetectTargetEnum.center },
  { label: '顶部', value: LingerDetectTargetEnum.top },
  { label: '算法等效点', value: LingerDetectTargetEnum.algorithm },
];
