import type { IRequestList } from '@/services/contact.ts';
import { request } from '@/utils/request';
export type TUser = {
  personId: string;
  personName: string; // 姓名
  gender: number; // 性别
  personHeadImg?: string; // 头像url
  departName: string; // 部门
};

/**
 * 异常信息
 */
export type TExceptionData = {
  dataType: number; // 数据类型：0、正常 1迟到，2、早退，3、缺勤，4、请假 5、未到时间
  attendanceDay?: string; // 考勤日期
  attendanceTime?: string; // 考勤时间
  earlyTime?: number; // 早退时间(分钟)
  lateTime?: number; // 迟到时间(分钟)
  signInTime?: string; // 签到时间
  signOutTime?: string; // 签退时间
  clockType?: number; // 签到类型 1签到 2签退
  counterSignTime?: string; // 补签时间
  counterSignCreateTime?: string; // 补签创建时间
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
  attendanceDay: string; // 考勤日期
  attendanceTime: string; // 考勤时间
  earlyTime?: number; // 早退时间(分钟)
  lateTime?: number; // 迟到时间(分钟)
  leaveTime?: number; // 请假时间(分钟)
  signInTime?: string; // 签到时间
  signOutTime?: string; // 签退时间
  clockType?: number; // 签到类型 1签到 2签退
  statusUpdateFlag?: number; // 是否修改过的数据1是，0否
  hostelDataId: string; // 数据id
  counterSignTime?: string;
  counterSignCreateTime?: string;
  signInApplicationFlag?: number;
  signOutApplicationFlag?: number;
  signInTimeValid?: number;
  signOutTimeValid?: number;
};
/**
 * 考勤详情
 */
export type TAttendanceData = {
  attendanceDay: string; // 考勤日期
  attendanceTime: string; // 考勤时间
  attendanceStatusIn: number; // 签到状态 0、正常，1、迟到，2、早退，3、缺勤，4、补签, 5、未到打卡时间
  attendanceStatusOut: number; // 签退状态
  signInApplicationFlag: number; // 签到缺勤是否提交申请
  signOutApplicationFlag: number; // 签退缺勤是否提交申请
  signInFlag: number; // 签到是否补卡
  signOutFlag: number; // 签退是否补卡
  signInTime?: string; // 签到时间
  signInTimeValid?: string; // 补签到有效时间
  signOutTime?: string; // 签退时间
  signOutTimeValid?: string; // 补签退有效时间
};

export type TReportData = TUser & {
  staffReportDetailDtoList?: TAttendanceData[]; // 考勤列表
  shouldArrive?: number; // 应到天数
  attendance?: number; // 出勤天数
  exceptionCode?: number; // 异常类型 1：没有权限 2：没有配置考勤时间规则 3：没有数据
  absenceList?: TExceptionData[]; // 缺勤列表
  earlyList?: TExceptionData[]; // 早退列表
  lateList?: TExceptionData[]; // 迟到列表
  counterSignList?: TExceptionData[]; // 补签列表
};

/**
 * 获取统计信息
 * @returns
 */
export const fetchReportData = (params: {
  dataCycle: string; // 统计周期 日：Day，周：Week，月：Month
  dataDate: number; // 统计日期
}) => {
  return request<TReportData>('/attendanceRecords/attendanceStatistics', params, 'GET', {
    showLoading: true,
    spaceType: request.service.staffAttend,
  });
};

/**
 * 查询指定时间点的工单状态
 * @param params
 * @returns
 */
export const fetchWorkOrderStatus = (params: { time: number; attendanceTime: string }) => {
  return request<boolean>('/v1/staff-report/app/workOrderStatus', params, 'GET', {
    showLoading: true,
    spaceType: request.service.attendance,
  });
};

// 获取用户权限
export const fetchPersonPurview = () => {
  return request<{ deptId: string; deptName: string }>(
    '/v1/staff-report/app/personPurview',
    {},
    'GET',
    {
      showLoading: true,
      spaceType: request.service.attendance,
    },
  );
};

export type IDataListItem = {
  attendanceTime: string;
  signInTime: string;
  signOutTime: string;
  personHeadImg: string;
  gender: number;
  attendanceStatusIn: number;
  attendanceStatusOut: number;
  personName: string;
  personId: string;
};

export type IDataList = {
  absenteeismNum: number;
  earlyNum: number;
  lateNum: number;
  leaveNum: number;
  totalNum: number;
};

export type IStatisticsData = {
  arrivedNum: number;
  dataList: IDataList[];
  totalNum: number;
  type?: number;
};
export interface RuleTimeItem {
  weekday: number;
  className: string;
  timeGap: string;
}

export interface RuleAddrWaysItem {
  addr: string;
  addrName: string;
  lat: string;
  lng: string;
  range: string;
}

export interface RuleWifiWays {
  name: string;
  mac: string;
}
export interface RuleDevWays {
  type: number;
  name: string;
}
export interface RuleData {
  times: RuleTimeItem[];
  addrWays: RuleAddrWaysItem[];
  wifiWays: RuleWifiWays[];
  devWays: RuleDevWays[];
}

// 考勤统计
export const fetchStaffAttendanceAccount = (params: { deptId: string; attendanceDate: number }) => {
  return request<IStatisticsData>('/attendanceRecords/app/staffAttendanceAccount', params, 'GET', {
    showLoading: true,
    spaceType: request.service.staffAttend,
  });
};

type IDataParam = {
  attendanceDate: number;
  attendanceStatus: number;
  pageSize: number;
  pageNum: number;
  deptId: string;
  frequency: number;
};

// 考勤异常统计--分页
export const fetchStaffAttendanceData = (data: IDataParam) => {
  return request<IRequestList<IDataListItem[]>>(
    '/attendanceDays/adapter/searchWithPage',
    data,
    'POST',
    {
      showLoading: true,
      spaceType: request.service.staffAttend,
    },
  );
};

export type IDeptTreeNode = {
  id: string;
  name: string;
  filterCode?: string;
  children: { id: string; name: string }[];
};

// 通过 token 获取部门树
export const getUserDeptTreeApi = () => {
  return request<IDeptTreeNode[]>('/v1/staffAttendance/app/userDeptTree', {}, 'GET', {
    showLoading: true,
    spaceType: request.service.campus,
  });
};

// 获取考勤规则
export const fetchStaffAttendanceRule = () => {
  return request<RuleData>('/attendance/group/myRules', {}, 'GET', {
    showLoading: true,
    spaceType: request.service.staffAttend,
  });
};

// 获取工作台id
export const fetchWorkFlowId = (flowCodes: string) => {
  const url = `/Engine/flowTemplate/getProcessInfo/${flowCodes}`;
  return request(url, {}, 'GET', {
    showLoading: true,
    spaceType: request.service.workflow,
    defaultError: false,
  });
};
