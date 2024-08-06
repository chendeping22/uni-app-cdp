type FlagType = 0 | 1;

export interface IWeek {
  defaultFlag: FlagType;
  endDate: string;
  startDate: string;
  weekNo: number;
  weekName: string;
}

export interface WeeklyCalendarsItem {
  defaultFlag: FlagType;
  endDate: string;
  startDate: string;
  name: string;
  sectionTypes: number[];
  schoolWeeks: IWeek[];
  defaultSectionType: number | null;
}

export enum SectionTypesEnum {
  '学前' = 0,
  '小学',
  '初中',
  '高中',
}

export interface NavFormData {
  curCalendar: WeeklyCalendarsItem;
  curWeekItem: IWeek;
  curFaculty: number;
  viewType: boolean;
  queryType: any;
}

export interface ConditionReqData {
  endDate: string;
  startDate: string;
  queryTypes: number[] | [];
  sectionType: number;
  daysOfWeek?: number;
}
export interface ConditionRspData {
  calendarDate: string;
  calendars: CalendarsItem[];
}
export interface CalendarsItem {
  calendarDate: string;
  canEdit: boolean;
  canRemove: boolean;
  content: string;
  contentType: ContentTypeEnum;
  createTime: string;
  endTime: string;
  id: number;
  joinObjs: string;
  joinUsers: string;
  place: string;
  remindRule: string;
  responsibleDepts: string;
  responsibleUsers: string;
  startTime: string;
}

export enum ContentTypeEnum {
  '周行事历' = 1,
  '课表',
  '会议',
}

export enum QueryTypeTextEnum {
  '全部日程' = 0,
  '个人日程' = 1,
  '本部门负责',
  '本人负责',
  '本人参与',
  '课程表',
  '会议',
}

export enum QueryTypeEnum {
  ALL = 0,
  PERSON = 1,
  DEPARTMENT,
  SELF,
  JOINS,
  COURSE,
  MEET,
}

export enum ScheduleTypeEnum {
  UNIT = 1,
  DEPARTMENT,
  PERSON,
}

export enum ScheduleTypeTextEnum {
  '单位日程' = 1,
  '部门日程',
  '个人日程',
}

export enum ModalTypeEnum {
  ADD = 0,
  EDIT,
}

export enum AllowEnum {
  FORBID = 0,
  ALLOW,
}
export enum RuleEnum {
  REMIND = 1,
  REPEAT,
}
export interface RemindRuleItem {
  name: string;
  rule?: string;
  remindType?: number | null;
  id: number;
}
export interface RepeatRulesItem {
  createBy: number;
  createTime: string;
  id: string;
  name: string;
  rule: string;
  type: RuleEnum;
  updateBy: number;
  updateTime: string;
}
export interface ResponsibleDeptsItem {
  id: string;
  name: string;
}
export interface ActionsConfigRspData {
  canAddLocationCalendar: AllowEnum;
  remindRules: RemindRuleItem[];
  repeatRules: RepeatRulesItem[];
  responsibleDepts: ResponsibleDeptsItem[];
}

export interface WeeklyCalendarsReq {
  belongDeptId?: string; //归属部门Id
  calendarDate: string; // 事项日期
  content: string; // 事项内容
  endTime?: string; // 结束时间
  id?: number;
  joinObjs?: string; // 参加对象
  joinUserIds?: any[]; // 提醒的参与对象列表
  place: string; // 事项地点
  remindRuleId?: string; // 提醒规则id
  repeatEndDate?: string; // 重复规则结束日期
  repeatRuleIds?: any[]; // 重复规则id
  responsibleDeptIds?: any[]; // 负责部门列表
  responsibleUserIds?: any[]; // 负责人id列表
  sectionType?: ScheduleTypeEnum; //学段
  startTime?: string; //开始时间
  type: number; //日程类型
  updateType?: number; //
}

export interface WeeklyCalendarExportReq extends ConditionReqData {
  exportType: string;
  schoolCalendarName: string;
  weekNo: number;
}

export enum IsEdit {
  /**不可以编辑 */
  noEdit,
  /**可以编辑 */
  canEdit,
}
export enum IsRemove {
  /**不可以删除 */
  noRemove,
  /**可以删除 */
  canRemove,
}
export interface WeeklyItem {
  calendarDate: string;
  canEdit: boolean;
  canRemove: boolean;
  content: string;
  contentType: ContentTypeEnum;
  createTime: string;
  endTime: string;
  id: number;
  joinObjs: string;
  joinUsers: string;
  place: string;
  remindRule: string;
  responsibleDepts: string;
  responsibleUsers: string;
  startTime: string;
  tagTypes: number[];
  responsibleDeptIds: string[];
  responsibleUserIds: string[];
  joinUserIds: string[];
  belongDeptId?: string | undefined;
  repeatRuleIds: string[];
  remindRuleId: string;
  repeatEndDate: string;
}

export interface ModalParams {
  date?: string;
  weeklyItem?: WeeklyItem;
}

export interface FormState {
  type: number;
  calendarDate: string;
  content: string;
  place: string;
  joinObjs: string;
  joinUserIds: string | string[] | undefined;
  joinUserIdsName: string | undefined;
  joinUserIdsByDept: string[] | undefined;
  responsibleDeptIds: string | string[] | undefined;
  responsibleDeptIdsName: string | undefined;
  responsibleUserIds: string | string[] | undefined;
  responsibleUserIdsName: string | undefined;
  responsibleUserIdsByDept: string[] | undefined;
  remindRuleId: string;
  repeatEndDate: string;
  repeatRuleIds: (string | number)[];
  belongDeptId: string | undefined;
  startTime: string;
  endTime: string;
  sectionType: number;
  id: number | '';
  updateType: number;
  remindRuleIdName: string;
  belongDeptName: string;
  repeatRuleNames: string;
}

export enum DaysOfWeek {
  /**七天 */
  sevenDay = 7,
  /**五天 */
  fiveDay = 5,
}
export enum SchoolTimetableChecked {
  /**课堂同步关闭 */
  close,
  /**课堂同步打开 */
  open,
}
export enum MeetingChecked {
  /**会议同步关闭 */
  close,
  /**会议同步打开 */
  open,
}

export const ModalTypeTips = [
  '1、单位日程为具备权限的人员可添加，添加后全单位人员可查看；',
  '2、部门日程为部门负责人可添加，与部门负责人同部门人员可查看；',
  '3、个人日程仅个人可编辑和查看；',
];
