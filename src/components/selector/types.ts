import { Layered } from '@/business-components/selector/types';

/** 选择器类型 */
export enum SelectorTypeEnum {
  /** 选择组织 */
  location = 1,
  /** 选择部门 */
  department,
  /** 选择人员 */
  person,
  /** 选择人员范围 */
  personScope,
  /** 跨组织选择人员 */
  acrossLocationPerson,
  /** 跨组织选择人员范围 */
  acrossLocationPersonScope,
  /** 选择学生 */
  student,
  /** 选择学生范围 */
  studentScope,
  /** 跨组织选择学生 */
  acrossLocationStudent,
  /** 选择年级/班级 */
  gradeClass,
  /** 跨组织选择学生范围 */
  acrossLocationStudentScope,
  /** 选择设备 */
  device,
  /** 选择设备范围 */
  deviceScope,
  /** 选择角色 */
  personRole,
  /** 选择空间 */
  space,
  /** 选择职位 */
  position,
  /** 选择离职人员 */
  separatedPerson,
}

/** 跨组织选择人员时查询得数据范围 */
export enum LocationScopeEnum {
  /** 全部组织 */
  all = 'all',
  /** 祖先组织 */
  ancestor = 'ancestor',
  /** 父级组织 */
  parent = 'parent',
  /** 儿孙组织 */
  descendant = 'descendant',
  /** 儿子组织 */
  children = 'children',
  /** 兄弟组织 */
  sibling = 'sibling',
}

/** 设备选项的类型 1空间 2设备 */
export enum DeviceItemLevelEnum {
  /** 空间 */
  space = 0,
  /** 设备 */
  device = 1,
}

export interface SelectorValue {
  id: string;
  name?: string;
  level?: PersonItemLevelEnum | StudentItemLevelEnum;
}

export interface SelectorCommonParams<Multiple extends boolean = true> {
  value?: Multiple extends false ? string | Layered : string[] | Layered[];
  /**
   * LocationScopeEnum 跨组织可选范围
   * StudentItemLevelEnum 班级学生需要展示到的层级
   */
  scope?: LocationScopeEnum | StudentItemLevelEnum;
  /** 是否多选 默认值: true */
  multiple?: Multiple extends false ? false : Multiple;
}

export interface ShowSelectorParams<Multiple extends boolean = true>
  extends SelectorCommonParams<Multiple> {
  type: SelectorTypeEnum;
  /** 不可操作得人员 id 列表 */
  disabledItemIds?: string[];
  locationId?: string;
  callback: (
    value?: Multiple extends false ? string : string[],
    data?: Multiple extends false ? SelectorValue : SelectorValue[],
  ) => void;
}

/** 选择器属性 */
export type SelectorProps = SelectorCommonParams;

/** 人员选项类型： 0组织 1部门 2人员 3角色 4用户组 */
export enum PersonItemLevelEnum {
  /** 0组织 */
  location = 0,
  /** 1部门 */
  department,
  /** 2人员 */
  user,
  /** 3角色 */
  role,
  /** 4用户组 */
  userGroup,
}

/** 学生选项的类型： 1学校 2学段 3年级 4班级 21学院 22专业 */
export enum StudentItemLevelEnum {
  /** 0组织 */
  location = 0,
  /** 1学校 */
  school = 1,
  /** 2学段 */
  section = 2,
  /** 3年级 */
  grade = 3,
  /** 4班级 */
  class = 4,
  /** 21学生 */
  student = 5,
  /** 21学院 */
  academy = 21,
  /** 22专业 */
  major = 22,
}
