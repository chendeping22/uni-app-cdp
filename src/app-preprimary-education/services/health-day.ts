import { request } from '@/utils/request';

interface IGetWorkOrders {
  type: string;
  pageNum: number;
  pageSize: number;
}

export interface IGetWorkOrdersRtn {
  arriveTime: string;
  createBy: string;
  createTime: number;
  endRemarks: string;
  endStatus: number;
  id: number;
  procInstId: string;
  processNo: string;
  promoter: string;
  promoterName: string;

  urgency: number; // 0紧急 1重要 2一般
  urgencyStr: string;
  spaceId: string;
  spaceStr: string;
  woStatus: number;
  woStatusStr: string;
  processType: number; // 1处理中，2已完结，3已撤回，4已驳回，5拟稿中
  processTypeStr: string;
}

export const getWorkOrders = (data: IGetWorkOrders) =>
  request('/v1/workOrders/console', data, 'GET', {
    spaceType: request.service.flow,
  });

export interface IGetProcessOrgRtn {
  configJson: string;
  id: string;
  locationId: number;
  name: string;
  processKey: string;
  processType: number;
}
export const getProcessOrg = () =>
  request<IGetProcessOrgRtn[]>('/v1/process/getOrg', {}, 'GET', {
    spaceType: request.service.flow,
  });

export const getUrgencyTypes = () =>
  request('/v1/workOrders/getUrgencyTypes', {}, 'GET', { spaceType: request.service.flow });

export interface IGetDeviceCatalogListRtn {
  id: string;
  name: string;
}
/** 获取设备分类 */
export const getDeviceCatalogList = () =>
  request<IGetDeviceCatalogListRtn[]>('/product/getDeviceCatalogList', {}, 'GET');

export interface IGetDeviceTypesRtn {
  id: string;
  name: string;
}
/** 获取设备类型 */
export const getDeviceTypes = (catalogId: string) =>
  request<IGetDeviceTypesRtn[]>(`/device/deviceTypes/list?catalogId=${catalogId}`, {}, 'GET');

export interface IGetDeviceList {
  spaceFilterCode: string;
  searchText: string;
  deviceCategoryId: string;
  deviceTypeId: string;

  edgeDeviceId: string;
  filterCodeSelectStatus: number;
  excludeDevModel: string;
}

export interface IGetDeviceListRtn {
  activeStatus: number;
  deviceId: string;
  name: string;
}
/** 获取设备列表 */
export const getDeviceList = (params: IGetDeviceList) =>
  request<IRequestList<IGetDeviceListRtn[]>>('/device/v2/findDirectDeviceList', params);

export interface IFlowNodeUserList {
  name: string;
  value: string;
}
export interface IFlowNode {
  childNode?: IFlowNode;
  conditionNodes: any[];
  name: string;
  nextId: string;
  nodeId: string;
  prevId: string;
  properties: {
    userList: IFlowNodeUserList[];
    userType: 0 | 1 | 2 | 3; // 0发起人自选 1指定人员 2发起人 3上级处理人指定
  };
  type: 'start' | 'approver' | 'handle';
}
export interface IGetProcessDetailRtn {
  name: string;
  processKey: string;
  processType: number;
  flowNode: IFlowNode;
}
/** 获取流程详情 */
export const getProcessDetail = (key: string) =>
  request<IGetProcessDetailRtn>(`/v1/process/${key}/detail`, {}, 'GET', {
    spaceType: request.service.flow,
  });

interface IGetUserList {
  condition?: string;
  roleId?: number | string;
  pageNum: number;
  pageSize: number;
}
export interface IGetUserListRtn {
  name: string;
  roleName: string;
  id: string;
}
export const getUserList = (data: IGetUserList) =>
  request<IRequestList<IGetUserListRtn[]>>('/v1/userManagement/actions/pageUser', data, 'POST', {
    spaceType: request.service.building,
  });

interface ITaskAssignee {
  taskKey: string;
  taskName: string;
  taskAssignees: string[];
}
export type IFlowTaskAssignee =
  | ITaskAssignee & {
      userType: 0 | 1 | 2 | 3; // 0发起人自选 1指定人员 2发起人 3上级处理人指定
    };
interface ICreateWorkOrder {
  processKey: string;
  formDataMap: {
    devices: string;
    spaceId: string;
    spaceName: string;
    spaceFilterCode: string;
    problemDesc: string;
    attachments: string;
  };
  urgency: number;
  taskAssigneeList: ITaskAssignee[];
  ccPersonList?: string[];
}
export const createWorkOrder = (data: ICreateWorkOrder) =>
  request('/v1/workOrders', data, 'POST', {
    spaceType: request.service.flow,
  });

type IEditWorkOrder = Pick<
  ICreateWorkOrder,
  'formDataMap' | 'taskAssigneeList' | 'urgency' | 'ccPersonList'
>;

/** 编辑工单 */
export const editWorkOrder = (id: string, data: IEditWorkOrder) =>
  request(`/v1/workOrders/${id}/actions/draftCommit`, data, 'POST', {
    spaceType: request.service.flow,
  });

export interface IDetailFlowNode {
  taskKey: string;
  taskName: string;
  assigneeList: {
    assignee: string;
    assigneeName: string;
    comment: string;
    createTime: number;
    updateTime: number;
    fileUrls: string[];
    operation: string;
    operationType: number; // 1-提交 2-重新提交 3-通过 4-驳回 5-已处理 6-退回至 7-处理中
  }[];
}
export interface ITaskDefList {
  taskDefKey: string;
  taskDefName: string;
  taskOperationType: 'approver' | 'handle';
  userScope: string;
  userType: 0 | 1 | 2 | 3; // 0发起人自选 1指定人员 2发起人 3上级处理人指定
}
export interface IGetWorkOrderDetailRtn {
  ccPersonList: { id: string; nickname: string }[];
  createBy: string;
  createTime: number;
  endRemarks: string;
  endStatus: number;
  // formDataMap内的都是id
  formDataMap: {
    attachments: string; // 格式'[]';
    fileUrls: string[];
    devices: string;
    problemDesc: string;
    spaceId: string;
    spaceName: string;
    spaceFilterCode: string;
  };
  id: string;
  nextUserType: 0 | 1 | 2 | 3; // 0发起人自选 1指定人员 2发起人 3上级处理人指定;
  procInstId: string;
  processNo: string;
  processKey: string;
  processType: number;
  processTypeStr: string;
  promoter: string;
  promoterName: string;
  taskAssigneeList: IDetailFlowNode[];
  taskDefList: ITaskDefList[];
  urgency: number; // 0紧急 1重要 2一般
  urgencyStr: string;
  woStatus: number; // 1处理中，2已完结，3已撤回，4已驳回，5拟稿中
  woStatusStr: string;
  taskOperationType: 'approver' | 'handle';
}
export const getWorkOrderDetail = (id: string) =>
  request<IGetWorkOrderDetailRtn>(`/v1/workOrders/${id}`, {}, 'GET', {
    spaceType: request.service.flow,
  });

interface IPostWorkOrderPass {
  comment: string;
  endStatus: number;
  fileIds?: string[];
  targetUserId?: string;
}
/** 工单通过 */
export const postWorkOrderPass = (id: string, data: IPostWorkOrderPass) =>
  request(`/v1/workOrders/${id}/actions/commit`, data, 'POST', {
    spaceType: request.service.flow,
  });

/** 工单撤回 */
export const postWorkOrderCancel = (id: string) =>
  request(`/v1/workOrders/${id}/actions/cancel`, {}, 'POST', {
    spaceType: request.service.flow,
  });

interface IPostWorkOrderBack {
  targetTaskKey: string;
  comment?: string;
  fileIds?: string[];
}
/** 工单退回 */
export const postWorkOrderBack = (id: string, data: IPostWorkOrderBack) =>
  request(`/v1/workOrders/${id}/actions/back`, data, 'POST', {
    spaceType: request.service.flow,
  });

interface IPostWorkOrderReject {
  comment: string;
  fileIds?: string[];
}
/** 工单驳回 */
export const postWorkOrderReject = (id: string, data: IPostWorkOrderReject) =>
  request(`/v1/workOrders/${id}/actions/reject`, data, 'POST', {
    spaceType: request.service.flow,
  });

/** 增加抄送人 */
export const addCcPersion = (id: string, userIds: string[]) =>
  request(`/v1/workOrders/${id}/actions/carbonCopy`, { ccPersons: userIds }, 'POST', {
    spaceType: request.service.flow,
  });

export interface IGetWorkOrderHandleHistoriesRtn {
  taskKey: string;
  taskName: string;
}

/** 获取工单历史任务节点(不包含退回之间的流转) */
export const getWorkOrderHandleHistories = (id: string) =>
  request<IGetWorkOrderHandleHistoriesRtn[]>(
    `/v1/workOrders/${id}/handledTasks/histories`,
    {},
    'GET',
    {
      spaceType: request.service.flow,
    },
  );

/** 获取检查任务列表*/
export const inspectionTasks = (data: any) =>
  request(`/v1/mobile/dailyHealth/inspectionTasks`, data, 'GET', {
    spaceType: request.service.dailyhealth,
  });

/** 获取检查任务列表*/
export const inspectionStudents = (params: any) => {
  return request<any>(
    `/v1/mobile/dailyHealth/inspectionTasks/${params.id}/inspectionStudents`,
    params,
    'GET',
    { spaceType: request.service.dailyhealth },
  );
};

export interface IInspectionRecordsRtn {
  id: string;
  gender: number;
  studentName: string;
  inspectionMode: 1 | 2 | 3; // 1-晨检, 2-午检, 3-晚检;
  clazzName: string;
  healthStatus: number; // 1正常 2异常
  imageUrl?: string;
}

/** 检查记录列表 */
export const inspectionRecords = (params: any) =>
  request<IRequestList<IInspectionRecordsRtn[]>>(
    `/mobile/inspectionRecords/actions/getRecordPage`,
    params,
    'POST',
    {
      spaceType: request.service.dailyhealth,
    },
  );

export interface IInspectItemDTO {
  detailList: exceptionDTO[];
  id?: number;
  inspectionTaskItemId: number;
  inspectionTaskItemName: string;
  inspectionTaskItemType: number;
  inspectionTaskItemValue: number;
  temperature: string;
  fileUrl?: string;
}

export interface IGetDetailByRecordIdRtn {
  age: number;
  birthday: string;
  certificateNo: string;
  clazzId: number;
  clazzName: string;
  clazzNo: number;
  comment: string;
  currentLevel: number;
  gender: 1 | 2;
  gradeId: number;
  gradeName: string;
  handler: string;
  handlerId: number;
  healthStatus: 1 | 2;
  id?: number;
  inspectionMode: 1 | 2 | 3; // 检测模式 1,2,3   1晨检2午检3晚检
  inspectionTaskId: number;
  inspectionModeName: string;
  inspectionTime: number;
  leaveSuggestion: 1 | 2; // 留园建议 1留园 2离园
  sectionType: number;
  studentCode: string;
  studentId: string;
  studentName: string;
  itemDTOList: IInspectItemDTO[];
  recordItemVOList: IInspectItemDTO[];
}
/** 获取检查记录详情*/
export const getDetailByRecordId = (recordId: string) => {
  return request<IGetDetailByRecordIdRtn>(
    `/mobile/inspectionRecords/${recordId}/actions/getRecordDetail`,
    {},
    'GET',
    { spaceType: request.service.dailyhealth },
  );
};

export interface IInspectionTasksListRtn {
  modeVOList: {
    inspectionMode: number;
    inspectionModeName: string;
  }[];
}
/** 所有的检测任务下拉 */
export const inspectionTasksList = () =>
  request<IInspectionTasksListRtn>(`/mobile/inspectionTasks/actions/getInspectionMode`, {}, 'GET', {
    spaceType: request.service.dailyhealth,
  });
/** 所有的检测任务下拉 */
export const getTree = () =>
  request(`/v1/clazzes/actions/tree?clazzType=0`, {}, 'GET', {
    spaceType: request.service.campusbase,
  });
/** 家长id获取关联学生 */
export const getStudentByTeacherId = () =>
  request(`/v1/cuser/parents/actions/students`, {}, 'GET', {
    spaceType: request.service.campusbase,
  });

/** 是否检测过 */
export const getCheckData = (data: any) =>
  request(
    `/v1/mobile/dailyHealth/inspectionTasks/${data.inspectionTaskId}/inspectionStudents/${data.studentId}`,
    {},
    'GET',
    {
      spaceType: request.service.dailyhealth,
    },
  );
/** 手动入录还是设备 */
export const recordCheck = (params: any) =>
  request(
    `/v1/mobile/dailyHealth/inspectionTasks/${params.inspectionTaskId}/actions/recordCheck`,
    params,
    'POST',
    {
      spaceType: request.service.dailyhealth,
    },
  );

/** 提交检查结果 */
export const submiteRecords = (params: any) =>
  request(
    `/v1/mobile/dailyHealth/inspectionTasks/${params.inspectionTaskId}/records`,
    params,
    'POST',
    {
      spaceType: request.service.dailyhealth,
      defaultError: false,
    },
  );

/** 晨检异常详情 */
export const inspectionTaskItems = (inspectionTaskId: any) =>
  request(
    `/v1/mobile/dailyHealth/inspectionTasks/${inspectionTaskId}/inspectionTaskItems`,
    {},
    'GET',
    {
      spaceType: request.service.campus,
    },
  );

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
    {
      spaceType: request.service.dailyhealth,
    },
  );

export interface IgetStudentList {
  age: number;
  birthday: string;
  certificateNumber: string;
  certificateType: number;
  clazzId: string;
  clazzName: string;
  clazzNo: number;
  currentLevel: number;
  enrollmentYear: number;
  firstLetter: string; // 名称首字母
  gender: number;
  gradeId: number;
  gradeName: string;
  healthStatus: number; // 1正常 2异常
  id: string;
  locationId: number;
  name: string;
  studentCode: string;
  sectionType: number;
  photoUrl: string;
}
export const getStudentList = (inspectionMode: string | number, inspectionTaskId: string) =>
  request<IgetStudentList[]>(
    `/inspectionTaskStudents/actions/getStudentList`,
    { inspectionMode, inspectionTaskId },
    'POST',
    {
      spaceType: request.service.building,
    },
  );

export interface IInspectionConf {
  id: number;
  asRcdId?: number | null; // 检测项id与纪录id冲突, 先用这个代替, 提交的时候再取
  type: 0 | 1; // 配置类型 0体温 1其他检测项
  name: string; // 配置名称
  taskItemValues: { id: string; abnormalValue: string }[]; // 异常值数组
  artificialityFlag: 0 | 1; // 人工录入：1是 0否 (仅type为0即体温时可用)
  deviceFlag: 0 | 1; // 设备录入：1是 0否 (仅type为0即体温时可用)
  inspectionTaskItemValue: string;
  selected?: any[];
  temperature?: string;
}

/** 检测配置项信息回显 */
export const getInspectionConfs = (inspectionTaskId: string, inspectionMode: string | number) =>
  request<IInspectionConf[]>(
    `/mobile/inspectionTasks/actions/getTaskItemDetail`,
    { inspectionTaskId, inspectionMode },
    'GET',
    {
      spaceType: request.service.dailyhealth,
    },
  );

export interface IStudentDTO {
  // ['certificateNo', 'studentId', 'studentName'] 这三个与学生信息的不完全对上
  age: number;
  birthday: string;
  certificateNo: string;
  clazzId: number;
  clazzName: string;
  clazzNo: number;
  currentLevel: number;
  gender: number;
  gradeId: number;
  gradeName: string;
  sectionType: number;
  studentCode: string;
  studentId: string;
  studentName: string;
}

export interface exceptionDTO {
  inspectionItemValueId: string;
  abnormalValue: string;
  sicknessCategoryId: string;
  sicknessSymptomId: string;
}

export interface IInspectionTaskSaveOrUpdate extends IStudentDTO {
  id?: number;
  comment: string;
  inspectionMode: number;
  inspectionTaskId: string;
  leaveSuggestion: number;
  itemDTOList: IInspectItemDTO[];
  handlerId: string;
  handler: string;
  recordItemVOList: IInspectItemDTO[];
}
/** 检测提交 */
export const postInspectionTaskSaveOrUpdate = (data: IInspectionTaskSaveOrUpdate) =>
  request(`/inspectionRecords/actions/batchSaveOrUpdate`, data, 'POST', {
    spaceType: request.service.building,
    defaultError: false,
  });

/** 当天检测记录 */
export const getInspectionStudentRecord = (
  studentId: string,
  inspectionTaskId: string,
  inspectionMode: string | number,
) =>
  request<IInspectionTaskSaveOrUpdate>(
    `/mobile/inspectionRecords/actions/getStudentRecord`,
    { studentId, inspectionTaskId, inspectionMode },
    'GET',
    {
      spaceType: request.service.dailyhealth,
    },
  );

/** 获取学生体温 */
export const getStudentTemp = (studentId: string) =>
  request(`/mobile/inspectionTasks/${studentId}/actions/getStudentTemp`, {}, 'GET', {
    spaceType: request.service.dailyhealth,
  });

/** 麦塔家校-查询学生检查记录 */
export const getStudentRecords = (studentId: string) =>
  request<{ studentId: string; checkResultPrompt: string; detaillist: IGetDetailByRecordIdRtn[] }>(
    `/mobile/inspectionRecords/${studentId}/actions/getStudentRecordPage`,
    {},
    'GET',
    {
      spaceType: request.service.dailyhealth,
    },
  );

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

interface IQueryStudentTrainPage {
  studentName?: string;
  clazzId?: string;
  gradeId?: string;
  trainStatus?: number;
  signStatus?: number;
}
export interface IQueryStudentTrainPageRtn {
  certificateFaceUrl: string; //人脸凭证url
  classId: string; //	班级ID
  className: string; //班级名称
  firstLetter: string; // 名字首字母
  gender: number; // 性别 1男 2女
  gradeId: string; //	年级ID
  leftNaked: string; //	左眼裸眼视力
  leftSph: string; //	左眼屈光球镜S
  rightNaked: string; //右眼裸眼视力
  rightSph: string; // 右眼屈光球镜S
  studentId: string; // 学生ID
  studentName: string; //	姓名
  trainStatus: number; //	训练状态 0未训练 1已训练
  signStatus: number; //	签到状态 0未签到 1已签到
}
export const queryStudentTrainPage = (data: IQueryStudentTrainPage) =>
  request<IRequestList<IQueryStudentTrainPageRtn[]>>(
    `/visionTrainRecords/actions/queryStudentTrainPage`,
    { pageNum: 1, pageSize: 10000, ...data },
    'POST',
    {
      spaceType: request.service.dailyhealth,
    },
  );

interface ITeacherHandle {
  studentId: string;
  signStatus: number;
}
export const teacherHandle = (data: ITeacherHandle) =>
  request(`/visionTrainRecords/actions/teacherHandle`, data, 'GET', {
    spaceType: request.service.dailyhealth,
  });

/**获取学生数 */
export const getClzFile2 = (clzId: string) =>
  request(`/v1/cuser/clazzes/${clzId}`, {}, 'GET', {
    spaceType: request.service.campusbase,
  });
export interface IStudentParams {
  accommodation?: number; // 住校信息 0、走读；1、住宿；2、半走读
  gender?: number; // 性别：2、女；1、男
  clazzIdList?: string[]; // 班级id集合，这字段的优先级比gradeIdList高
  gradeIdList?: string[]; // 年级id集合，如果班级id集合有值，那么这个字段的查询条件会被忽略。因为班级是更精确的条件
  name?: string; // 学生姓名
  pageNum?: number;
  pageSize?: number;
}
export const getClzFile = (data: IStudentParams) =>
  request('/v2/students/actions/queryByConditionPage', data, 'POST', {
    spaceType: request.service.campusbase,
  });

interface IHealth {
  studentId: string;
  date: string;
}
/**
 *
 * 健康详情-（家长端）
 * @returns
 */
export const getHealthData = (data: IHealth) =>
  request(`/parents/actions/health/student/${data.studentId}/date/${data.date}`, {}, 'GET', {
    spaceType: request.service.dailyhealth,
  });
/**
 *
 * 健康详情-（校园端）
 * @returns
 */
export const getHealthData_teacher = (data: IHealth) =>
  request(`/teacher/actions/health/student/${data.studentId}/date/${data.date}`, {}, 'GET', {
    spaceType: request.service.dailyhealth,
  });

interface IDate {
  date: string;
  studentId?: string;
}
/**
 * 是否绑定手环设备(校园端)
 * @returns
 */
export const bandingSchool = (data: IDate) => {
  let url;
  if (data.studentId) {
    url = `/device/actions/banding/${data.date}?studentId=${data.studentId}`;
  } else {
    url = `/device/actions/banding/${data.date}`;
  }
  return request(url, {}, 'GET', {
    spaceType: request.service.dailyhealth,
  });
};

/**
 * 是否绑定手环设备(家长端)
 * @returns
 */
export const bandingParent = (data: IDate) =>
  request(`/parents/device/actions/banding/${data.date}?studentId=${data.studentId}`, {}, 'GET', {
    spaceType: request.service.dailyhealth,
  });

/**
 * 心率详情(家长端)
 * @returns
 */
export const heartRate_parent = (data: IHealth) =>
  request(`/parents/heartRate/actions/student/${data.studentId}/date/${data.date}`, {}, 'GET', {
    spaceType: request.service.dailyhealth,
  });
/**
 * 心率详情(校园端)
 * @returns
 */
export const heartRate_teacher = (data: IHealth) =>
  request(`/teacher/heartRate/actions/student/${data.studentId}/date/${data.date}`, {}, 'GET', {
    spaceType: request.service.dailyhealth,
  });

interface SearchFeAll {
  /**检查时间:年-月-日*/
  date: string;
  /**检查模式 */
  inspectionMode: any;
  /**班级id*/
  classIds: string[][];
}
/**
 * 离园率异常率
 * @returns
 */
export const statisticsByInspectionModel = (data: SearchFeAll) =>
  request(`/v2/inspection/actions/statisticsByInspectionModel`, data, 'POST', {
    spaceType: request.service.dailyhealth,
  });
interface SearchAll {
  /**检查时间:年-月-日*/
  date: string;
  /**班级id*/
  classIds?: string[];
}
/**
 * 人均步数和卡路里
 * @returns
 */
export const avgByStudent = (data: SearchAll) =>
  request(`/sport/actions/avgByStudent`, data, 'POST', {
    spaceType: request.service.dailyhealth,
  });
interface SearchParms {
  /**开始日期:年-月-日*/
  startDate: string;
  /**结束日期:年-月-日*/
  date: string;
  /**班级id*/
  classIds?: string[];
}
/**
 * 近七天人均步数走势图
 * @returns
 */
export const statisticsStepAvgByDay = (data: SearchParms) =>
  request(`/sport/actions/statisticsStepAvgByDay`, data, 'POST', {
    spaceType: request.service.dailyhealth,
  });
/**
 * 睡眠总计
 * @returns
 */
export const avgByStudentSleep = (data: SearchAll) =>
  request(`/sleep/actions/avgByStudent`, data, 'POST', {
    spaceType: request.service.dailyhealth,
  });
/**
 * 近七天人均时长对比图
 * @returns
 */
export const statisticsAvgByDay = (data: SearchFeAll) =>
  request(`/sleep/actions/statisticsAvgByDay`, data, 'POST', {
    spaceType: request.service.dailyhealth,
  });
/**
 * 心率提醒人数和心率提醒次数
 * @returns
 */
export const remind = (data: SearchAll) =>
  request(`/heartRate/actions/remind`, data, 'POST', {
    spaceType: request.service.dailyhealth,
  });
/**
 * 近七天心率提醒人数折线图
 * @returns
 */
export const statisticByDay = (data: SearchAll) =>
  request(`/heartRate/actions/statisticByDay`, data, 'POST', {
    spaceType: request.service.dailyhealth,
  });
/**
 * 获取心率提醒
 * @returns
 */
export const getQuery = () =>
  request(`/heartRateConfig/actions/query`, {}, 'GET', {
    spaceType: request.service.dailyhealth,
  });
/**
 * 根据时间获取心率提醒
 * @returns
 */
export const getHisDayQuery = (date: string) =>
  request(`/heartConfigHiss/actions/hisDay?date=${date}`, {}, 'GET', {
    spaceType: request.service.dailyhealth,
  });
/**
 * 获取晨检设备类型
 * @returns
 */
export const getInspectionDeviceType = (isGuardian?: boolean) =>
  request(
    `${isGuardian ? '/cus' : ''}/inspectionDeviceTypes/actions/getInspectionDeviceType`,
    {},
    'GET',
    {
      spaceType: request.service.dailyhealth,
    },
  );
/**
 * 离园率异常率
 * @returns
 */
export const statisticsByInspectionPDAModel = (data: SearchFeAll) =>
  request(`/v2/threeInspection/actions/statistics/date`, data, 'POST', {
    spaceType: request.service.dailyhealth,
  });
interface SearchStudent {
  /**检查时间:年-月-日*/
  startDate: string;
  /**检查模式 */
  endDate: any;
  /**班级id*/
  studentId: string;
}
/**
 * 统计区间段内每个小时的运动强度
 * @returns
 */
export const statSectionSportStrengths = (data: SearchStudent) =>
  request(`/teacher/heartRate/actions/statSectionSportStrengths/${data.studentId}`, data, 'GET', {
    spaceType: request.service.dailyhealth,
  });
/**
 * 统计学生在指定时间段内每个小时心率
 * @returns
 */
export const statSectionHearts = (data: SearchStudent) =>
  request(`/teacher/heartRate/actions/statSectionHearts/${data.studentId}`, data, 'GET', {
    spaceType: request.service.dailyhealth,
  });
/**
 * 统计区间段内每个小时的运动强度-家长
 * @returns
 */
export const statSectionSportParents = (data: SearchStudent) =>
  request(`/parents/heartRate/actions/statSectionSportStrengths/${data.studentId}`, data, 'GET', {
    spaceType: request.service.dailyhealth,
  });
/**
 * 统计学生在指定时间段内每个小时心率-家长
 * @returns
 */
export const statSectionHeartsParents = (data: SearchStudent) =>
  request(`/parents/heartRate/actions/statSectionHearts/${data.studentId}`, data, 'GET', {
    spaceType: request.service.dailyhealth,
  });
