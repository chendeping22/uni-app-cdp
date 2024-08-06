export interface ClassItem {
  /**
   * 班级id
   */
  classId: string;
  /**
   * 班级名称
   */
  className: string;
  classAbbreviation: string;
  /**
   * 点评状态
   */
  commentState: boolean;
  /**
   * 年级id
   */
  gradeId: number;
  /**
   * 年级名称
   */
  gradeName: string;
  /**
   * 评价方案id
   */
  schemeId: string;
  initialSchemeId: string;
  /**
   * 评价方案名称
   */
  schemeName: string;
  /**
   * 得分
   */
  score: number;
  /**
   * 班主任-用户id
   */
  userId: number;
  /**
   * 班主任-用户名称
   */
  userName: string;
}

export enum ListTypeEnum {
  list = 'list',
  card = 'card',
}

export interface Indicator {
  /**
   * 下级指标
   */
  children?: Indicator[];
  /**
   * 评价方案ID
   */
  evaluationSchemeId: string;
  /**
   * 主键
   */
  id: string;
  /**
   * 指标名称
   */
  indicatorName: string;
  /**
   * 项目id
   */
  locationId: string;
  /**
   * 上级指标ID
   */
  parentIndicatorId: string;
  /**
   * 分数（正数加分，负数减分）
   */
  score: number;
  /**
   * 排序（值大的靠前）
   */
  sortOrder?: number;
}
