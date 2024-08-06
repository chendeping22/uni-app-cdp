export type LabelValue<L = string, V = string> = {
  label: L;
  value: V;
};

/** 课题级别 */
export enum TopicLevel {
  /** 国家级 */
  Country = 1,
  /** 省级 */
  Province,
  /** 地市级 */
  Prefecture,
  /** 区县级 */
  District,
  /** 校级 */
  School,
}
