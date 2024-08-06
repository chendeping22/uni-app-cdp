/** 每日三检类型 */
export const HealthDayCheckType = {
  1: '晨检',
  2: '午检',
  3: '晚检',
};

/** 正常体温默认值 */
export const DEFAULT_NORMAL_TEMPERATURE = '37.0';

/**
 * 是否具有比班主任或任课老师更高的权限
 * role: 1-> 学校管理员; 2->学段负责人; 6->任课老师; 7->年级主任; 8->班主任; 9->超管; 10->部门负责人
 */
export const isHigherMastorOrTeacher = (roles: number[]) => {
  return [1, 2, 7, 9, 10].some(t => roles.includes(t));
};
