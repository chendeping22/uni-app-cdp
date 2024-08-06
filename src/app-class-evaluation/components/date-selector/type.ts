export const enum DateTypeEnum {
  Day = 'day',
  Month = 'month',
}

/** 时间选择起始日期的判断依据 scheme-取方案起始日期，evaluate-取评价日期最早的时间*/
export const enum LimitTypeEnum {
  /** 方案 */
  Scheme = 'scheme',
  /** 评价 */
  Evaluate = 'evaluate',
}
