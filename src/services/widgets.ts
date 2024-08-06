import { request } from '@/utils/request';
import { IGetLiveLessons, IGetLiveLessonsRtn } from '@/widgets/intelligent-recording/types';

export type TReportItemData = {
  count?: number; // 人数/人次
  rate?: string; // 出勤率
  objectId?: string; // 对象id
  objectName?: string; // 对象名称
};

// 排行榜展示
export type TRankData = {
  id: string;
  title: string;
  label: string;
  percent: number;
  progressColor?: string; // 指定时覆盖组件的progressColor
};

/**
 * 异常学生信息
 */
export type TExceptionStudent = {
  personId: string; // 学生标识
  personName: string; // 姓名
  gender: number; // 性别：2、女；1、男
  personHeadImg: string; // 学生头像url
  dataType: number; // 数据类型：1、迟到，2、早退，3、缺勤，4、请假，5、正常
  attendanceDate: number; // 考勤日期
  attendanceTime: string; // 考勤时间
  earlyTime?: number; // 早退时间(分钟)
  lateTime?: number; // 迟到时间(分钟)
  leaveTime?: number; // 请假时间(分钟)
  signInTime?: string; // 签到时间
  signOutTime?: string; // 签退时间
  clockType?: number; // 签到类型 1签到 2签退
  statusUpdateFlag?: number; // 是否修改过的数据1是，0否
  hostelDataId: string; // 数据id
};

/**
 * 统计信息
 */
export type TReportData = {
  absence: number; // 缺勤人数
  absenceList?: TReportItemData[] | TRankData[]; // 缺勤列表
  attendance: number; // 出勤人数
  attendanceSortList?: TReportItemData[] | TRankData[]; // 出勤率排行
  early: number; // 早退
  earlyList?: TReportItemData[] | TRankData[]; // 早退列表
  late: number; // 迟到
  lateList?: TReportItemData[] | TRankData[]; // 迟到列表
  shouldArrive: number; // 应到人数
  leave: number; // 请假
  studentAbsenceList?: TExceptionStudent[]; // 异常学生缺勤列表
  studentEarlyList?: TExceptionStudent[]; // 异常学生早退列表
  studentLateList?: TExceptionStudent[]; // 异常学生迟到列表
  studentLeaveList?: TExceptionStudent[]; // 异常学生请假列表
  studentNormalList?: TExceptionStudent[]; // 正常学生列表
  exceptionCode?: number; // 异常情况 1：没有权限 2：没有配置考勤时间规则 3：没有数据 4：非法参数"
};

/**
 * 获取工作台统计信息
 * @returns
 */
export const fetchWorkbenchReportData = () => {
  return request<TReportData>('/v1/attendance-report/data/applet', {}, 'GET', {
    showLoading: false,
    spaceType: request.service.attendance,
  });
};

export type AlarmDataItem = {
  name: string;
  typeCode?: string;
  total: number;
  label: string;
  value: number;
  alarmType?: number;
};
/**
 * 工作台 -- AI布控 - 告警占比
 */
export const getAiAlarmProportionApi = (data: {
  date: string;
  size: number;
  timeScope: string;
}) => {
  return request<AlarmDataItem[]>('/statistics/ai/type', data, 'POST', {
    spaceType: request.service.sas,
    showLoading: false,
  });
};

export type IAiAlarmDataItem = {
  behavior: number;
  person: number;
  total: number;
};

/**
 * 工作台 -- AI布控 - 告警统计
 */
export const getAiAlarmStatisticsApi = (data: { date: string; timeScope: string }) => {
  return request<IAiAlarmDataItem>('/statistics/ai', data, 'POST', {
    spaceType: request.service.sas,
    showLoading: false,
  });
};

export interface AttendData {
  totalNum: number;
  arrivedNum: number;
  absentNum: number;
  lateNum: number;
  earlyNum: number;
  leaveNum: number;
  averageRate: string;
  attendanceDimensionResultVOList: [];
  cycleType: number;
  totalPersonNum: number;
  arrivedPersonNum: number;
  absentPersonNum: number;
}
/**
 * 工作台 -- 教务管理 - 考勤统计
 */

export const fetchStaffAttendanceStatisticsApi = (data: {
  scopeType: number;
  dimensionType: number;
  dateBegin: number;
  dateEnd: number;
  cycleType: number;
}) => {
  return request<AttendData>('/attendanceDays/actions/statisticsAttendance', data, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

/**
 * 工作台 -- 教务管理 - 获取考勤打卡信息
 */
export interface ClockItem {
  frequency: number; // 频次 一天1次；2、一天2次；3、一天3次
  type: number; // 类型 1上班 2下班
  time: string; // 考勤时间 24小时制
  clockTime: string; // 打卡时间
  status: number; // 状态(0、正常，1、迟到，2、早退，3、缺勤，4、请假)
  id: number; // 打卡记录id;
}
export interface ClockWayInfo {
  addr: string; // 地址
  addrName: string; // 地址名称
  lat: string; // 纬度
  lng: string; // 经度
  range: string; // 范围
  name: string; // wifi名称
  mac: string; // mac地址
}
export interface ClockWays {
  type: number; // 类型 1地点 2 wifi
  info: ClockWayInfo;
}
export interface ClockRulesData {
  restFlag: number; //是否休息日 0否 1是
  clockFlag: number; // 是否要打卡 0=未配置考勤组 1=未配置手机打卡 2=可以正常打卡
  serviceTime: number; // 服务器时间
  ways: ClockWays[];
  clockItems: ClockItem[];
  clockType: number; // 打卡类型 1表示上班 2表示下班
}
export const fetchClockRulesInfoApi = () => {
  return request<ClockRulesData>('/attendanceRecords/clockRules', {}, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};
/**
 * 工作台 -- 教务管理 - 打卡
 */
export interface AppClockParams {
  clockWay: number;
  clockTime: number;
  clockAddr: string;
  clockWifi: string;
}
export const fetchAppClock = (data: AppClockParams) => {
  return request<ClockRulesData>('/attendanceRecords/appClock', data, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

export interface IThreeInspectionData {
  inspectionMorningProgress: string | null;
  inspectionAfternoonProgress: string | null;
  inspectionEveningProgress: string | null;
  leavePercent: string | null;
  abnormalPercent: string | null;
  [p: string]: string | null;
}

/** 获取一日三检统计情况 */
export const getThreeInspectionData = () =>
  request(`/v2/threeInspection/actions/statistics`, {}, 'GET', {
    spaceType: request.service.dailyhealth,
    showLoading: false,
  });

export interface IGetHealthDayTasks {
  inspectionMode: 1 | 2 | 3; // 1-晨检, 2-午检, 3-晚检
  unInspectedNum: number;
  hasInspectionItem: boolean; // 是否有检测项
}

/** 获取当日三检 */
export const getHealthDayTasks = (handlerId: string) =>
  request<{ inspectionDeatil: IGetHealthDayTasks[]; inspectionTaskId: string }>(
    `/mobile/inspectionTasks/${handlerId}/actions/getTask`,
    {},
    'GET',
    { spaceType: request.service.dailyhealth },
  );
/**
 * 获取晨检设备类型
 * @returns
 */
export const getInspectionDeviceType = (isGuardian?: boolean) =>
  request(
    `${isGuardian ? '/cus' : ''}/inspectionDeviceTypes/actions/getInspectionDeviceType`,
    {},
    'GET',
    { spaceType: request.service.dailyhealth },
  );
/**
 * 工作台 -- 教务管理 - 更新打卡时间
 */
export interface AppUpdateClockParams {
  id: number;
  clockTime: number;
}
export const fetchAppUpdateClock = (data: AppUpdateClockParams) => {
  return request('/attendanceRecords/updClockTime', data, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

/**
 * 工作台 -- 教务管理 - 获取低代码配置的模块flowid
 */
export const fetchWorkFlowId = (flowCodes: string) => {
  const url = `/Engine/flowTemplate/getProcessInfo/${flowCodes}`;
  return request(url, {}, 'GET', {
    showLoading: true,
    spaceType: request.service.workflow,
    defaultError: false,
  });
};

/**
 * 工作台 -- 学生请假 - 今日学生请假情况
 */
export type TTodayLeaveCountData = {
  leave: number;
  casualLeave: number;
  sickLeave: number;
  unusualLeave: number;
  total: number;
  percent: number;
};
export const fetchTodayLeaveCountApi = () => {
  return request<TTodayLeaveCountData>('/v1/student-leave/teacher/todayLeaveCount', {}, 'GET', {
    showLoading: false,
    spaceType: request.service.campus,
  });
};

/**
 * 工作台 -- 学生请假 - 学生请假审批情况
 */
export type TLeaveItem = {
  id: string; // 请假id
  personName: string; // 学生名称
  className: string; // 班级名称
  leaveType: number; // 请假类型
};
export const fetchLeaveList = (params: {
  pageSize: number;
  pageNum: number;
  offset?: string; // 首次为空,后续第一次的list[0].id
  reviewStatus?: string; // 审核状态,多状态逗号拼接 0-待审批；1-已同意；2-已驳回；3-已撤回，字符串
  ccFlag?: string; // 是否抄送我 0-否 1-是
}) => {
  return request<{
    total: number;
    result: TLeaveItem[];
  }>('/v1/student-leave/teacher/leaves', params, 'GET', {
    showLoading: true,
    spaceType: request.service.attendance,
  });
};

/**
 * 工作台 -- 场地预定 - 今日预约情况
 */
export type TTodayReserveInfo = {
  num: number; // 剩余预约场次
  dataList: {
    id: string; // 预约记录id
    reserveName: string; // 预约名称
    reserveScope?: string; // 预定时间范围
    reserveStatus?: number; // 预约记录状态：0、未开始；1、进行中；2、已结束
    spaceName: string; // 场地名称
    [key: string]: any;
  }[];
};

/**
 * 获取今日预约数据
 */
export const fetchTodayReserve = () => {
  return request<TTodayReserveInfo>('/placeReserveRecords/lastReserve', null, 'GET', {
    showLoading: false,
    spaceType: request.service.ioc,
  });
};

/**
 * 今日预约数据
 */
export type TTodayVisitor = {
  total: number; // 今日访客数量
  signIns: {
    count: number; // 数量
    visitorStatus: number; // 访问状态 1 未来访 2 已来访 3 已签退
    names: string[]; // 人员名称列表
  }[]; // 访客预约明细
};

/**
 * 获取访客今日数据
 */
export const fetchTodayVisitor = () => {
  return request<TTodayVisitor>('/visitor/tools/module/frontend/action/today', null, 'GET', {
    showLoading: false,
    spaceType: request.service.ioc,
  });
};

/**
 * 工作台 -- 智慧物联 - 设备监测
 */
export const getDeviceSituation = () => {
  const url = `/v1/actions/device/deviceMonitor`;
  return request(url, {}, 'GET', {
    showLoading: false,
    spaceType: request.service.building,
    defaultError: false,
  });
};

/**
 * 工作台 -- 智慧物联 - 设备开启情况
 */
export const getDeviceStatistic = () => {
  const url = `/v1/actions/device/statistic`;
  return request(url, {}, 'GET', {
    showLoading: false,
    spaceType: request.service.building,
    defaultError: false,
  });
};

/**
 * 工作台 -- 智慧物联 - 教室能耗排行Top5
 */
interface IGetClassroomEnergyRank {
  type: number;
  locationId: number | string;
}
export interface IGetClassroomEnergyRankRtn {
  id: string;
  name: string;
  value: number;
}
export const getClassroomEnergyRank = (data: IGetClassroomEnergyRank) => {
  const url = `/v1/dataOverviewComponents/actions/getClassroomEnergyRank`;
  return request<IGetClassroomEnergyRankRtn[]>(url, data, 'GET', {
    showLoading: false,
    spaceType: request.service.building,
  });
};

/**
 * 工作台 -- 养成打卡 - 打卡任务
 */
export interface IClockInsItems {
  firstLetter: number;
  personId: string;
  studentId: string;
  clockinNum: string;
  studentName: string;
  url: string;
}
export interface IClassItems {
  allStudentNum: number;
  clazzId: string;
  clazzName: string;
  clockinNum: number;
  studentNum: number;
  clockins: IClockInsItems[];
  studentIds: IClockInsItems[];
  studentVos: IClockInsItems[];
  unclockins: IClockInsItems[];
}
export interface ITasksList {
  id: number;
  title: string;
  clazzs: IClassItems[];
}
export const getBenchTasks = () => {
  return request<ITasksList[]>('/v1/clockin/tasks/actions/byToday', {}, 'GET', {
    spaceType: request.service.clockin,
    showLoading: false,
  });
};
export type ITeacherPickupInfo = {
  afterSchoolTime: string; // 放学时间
  clazzId: string; // 班级id
  dateStr: string; // 日期
  clazzName: string; // 班级名称
  studentTotal: number; // 学生总数
  waitStudentTotal: number; // 待接送学生人数
  parentsArriveTotal: number; // 家长已到人数
};
/**
 * 教师端 - 离园接送组件
 * @returns
 */
export const getTeacherPickUpInfo = () =>
  request<ITeacherPickupInfo[]>('/teachers/actions/getClazzPickupInfo', {}, 'GET', {
    spaceType: request.service.pickup,
    showLoading: false,
  });

export type IGuardianPickupInfo = {
  afterSchoolTime: string; // 放学时间
  studentName: string; // 学生名字
  isSign: 0 | 1; // 家长是否签到 0否；1是
  studentId: string; // 学生id
  gender: number; // 性别
  studentAvatar?: string; // 头像
};
/**
 * 家长端 - 离园接送组件 - 签到
 * @param id
 * @returns
 */
export const studentSignIn = (id: string) =>
  request(`/students/${id}/actions/signIn`, {}, 'POST', {
    spaceType: request.service.pickup,
  });
/**
 * 家长端 - 离园接送
 * @returns
 */
export const getGuardianPickUpInfo = () =>
  request<IGuardianPickupInfo[]>('/guardians/pickupInfo', {}, 'GET', {
    spaceType: request.service.pickup,
    showLoading: false,
  });
/**
 * 获取签到方式
 * @returns
 */
export const fetchSignType = () => {
  return request<{
    face: number;
    online: number;
  }>('/guardians/app/getSignType', null, 'GET', {
    showLoading: true,
    spaceType: request.service.campus,
  });
};
/**
 * 家长端 - 录播小组件 - 云上课堂课程列表
 * @returns
 */
export const getLiveLessons = (params: IGetLiveLessons) =>
  request<IGetLiveLessonsRtn>('/liveLessons', { q_eq_queryMode: '3', ...params }, 'GET', {
    spaceType: request.service.campus,
  });

/**
 * 教师端 - 课表 - 查询教师课表周视角
 * @returns
 */
export function getTeacherSchedule(data: any) {
  return request('/v2/school/schedule/queries/course/teacher/week-view', data, 'POST', {
    spaceType: request.service.campusbase,
    showLoading: false,
  });
}

/**
 * 家长/学生端 - 课表 - 查询班级课表周视角
 * @returns
 */
export function getStudentSchedule(studentId: string, data: any) {
  return request(
    `/v2/school/schedule/queries/course/student/${studentId}/week-view`,
    data,
    'POST',
    {
      spaceType: request.service.campusbase,
      showLoading: false,
    },
  );
}

/**
 * 移动端小组件-办公效能
 */
export function getOfficeEfficacyData(data: any) {
  return request(`/largeScreenCounts/QueryHistory`, data, 'POST', {
    spaceType: request.service.documentv2,
    showLoading: false,
  });
}

/**
 * 移动端小组件-公文管理待办待阅数量
 */
export function getMissiveTodoNum(data: any) {
  return request(`/workflow/Engine/FlowTask/actions/getMsgNum`, data, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}

/**
 * 移动端小组件-公文管理待办待阅数量
 */
export function getMissiveTodoList(category: number, data: any) {
  return request(`/workflow/Engine/FlowBefore/List/` + category, data, 'GET', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}
/**
 * 会议小组件(时间范围内有数据的天)
 */
export function meetingPoint(data: any) {
  return request(`/school/baseInfo/meeting/point`, data, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}
/**
 * 会议小组件(某一天的数据)
 */
export function meetingPointDay(data: any) {
  return request(`/school/baseInfo/meeting/point/day`, data, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}
