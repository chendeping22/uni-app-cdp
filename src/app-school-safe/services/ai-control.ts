import { request } from '@/utils/request';

// 获取人员布控记录
export const getFaceRecord = (params: {
  pageNum: number;
  pageSize: number;
  status?: string;
  libraryId?: string;
  alarmTimeStart?: string;
  alarmTimeEnd?: string;
}) => {
  return request(`/v1/face/record`, params, 'GET', {
    spaceType: request.service.sas,
  });
};
// 获取行为布控记录
export const getPersonMonitorRecords = (params: {
  pageNum: number;
  pageSize: number;
  status?: string;
  typeId?: string;
  alarmTimeStart?: string;
  alarmTimeEnd?: string;
  largeModelResults?: number[];
}) => {
  return request(`/v1/personMonitorRecords`, params, 'POST', {
    spaceType: request.service.sas,
  });
};
// 获取布控库列表
export const getMonitorLibraries = () => {
  return request(`/v1/face/monitorLibraries/actions/list`, {}, 'GET', {
    spaceType: request.service.sas,
  });
};

export type IAlarmDataItem = {
  total: number;
  processed: number;
  notProcessed: number;
  value: number;
};
// 获取行为布控告警统计
export const getActionsStatistics = (startTime: string | null, endTime: string | null) => {
  return request<IAlarmDataItem[]>(
    `/v1/overviews/actions/statistics/action`,
    { startTime, endTime },
    'GET',
    {
      spaceType: request.service.sas,
    },
  );
};

// 获取行为布控告警统计
export const getFaceStatistics = (startTime: string | null, endTime: string | null) => {
  return request<IAlarmDataItem[]>(
    `/v1/overviews/actions/statistics/face`,
    { startTime, endTime },
    'GET',
    {
      spaceType: request.service.sas,
    },
  );
};

export type IStatisticItem = {
  id?: string;
  label: string;
  value: number;
  code?: string;
  key?: number[];
};

export type IHourItem = {
  alarmTypeDataList: IStatisticItem[];
  spaceDataList: IStatisticItem[];
};

export type IOverData = {
  ratio: number;
  normalCount: number;
  importantCount: number;
  emergencyCount: number;
  total: number;
};

export type IMiscOverview = {
  improve: string;
  more: string;
  ratio: number;
};

export type IEventData = {
  emergencyOverview: {
    miscOverview?: IMiscOverview;
    alarmCounts: { count: number; alarmName: string }[];
    alarmList: {
      title: string;
      reportTime: number;
      handleStatus: number;
      handleTime: number;
      spaceName: string;
    }[];
  };
};

// AI布控告警区域统计
export const getAlarmAreaApi = (data: {
  startDate: string | null;
  endDate: string | null;
  top: number;
}) => {
  return request<IStatisticItem[]>('/statistics/ai/app/area', data, 'POST', {
    spaceType: request.service.sas,
  });
};

// AI布控告警时段统计
export const getAlarmTimeRangeApi = (data: {
  startDate: string | null;
  endDate: string | null;
}) => {
  return request<IStatisticItem[]>('/statistics/ai/app/hour', data, 'POST', {
    spaceType: request.service.sas,
  });
};

// AI布控告警小时详情
export const getAlarmByHourApi = (data: {
  endDate: string | null;
  startDate: string | null;
  hours: number[] | undefined;
}) => {
  return request<IHourItem>('/statistics/ai/hour/detail', data, 'POST', {
    spaceType: request.service.sas,
  });
};

// 获取场景列表
export const getSceneListApi = () => {
  return request<{ id: string; name: string }[]>('/ai/scene/configs/list', {}, 'GET', {
    spaceType: request.service.sas,
  });
};

// 场景报告详情
export const getSceneReportApi = (data: { dailyId: string }) => {
  return request<{
    sceneName: string;
    overview: IOverData;
    spaceReport: IEventData[];
    sceneId: string;
  }>('/ai/scene/daily/papers/combineReport', data, 'POST', {
    spaceType: request.service.sas,
  });
};

// 行为布控批量处理
export const batchBehaviorAlarmHandle = (data: {
  alarmIds?: (string | number)[];
  handleType?: number;
  handleCode?: string;
  handleContent?: string;
  objectType?: number;
  objectIds?: string[];
  handleDescription?: string;
  disturbTimeInterval?: string | null;
}) => {
  return request(`/v1/personMonitorRecords/actions/batchHandle`, data, 'PUT', {
    spaceType: request.service.sas,
  });
};

// 人员布控批量处理
export const batchFaceAlarmHandle = (data: {
  alarmIds?: (string | number)[];
  handleCode?: string;
  handleContent?: string;
  handleDescription?: string;
  disturbTimeInterval?: string | null;
}) => {
  return request(`/v1/face/record/actions/batchHandle`, data, 'PUT', {
    spaceType: request.service.sas,
  });
};

/**
 * 审批节点
 */
export interface IAssigneeItem {
  assignee: string; // 审批者id
  assigneeName: string; // 审批者名称
  createTime: number; // 创建时间
  handleStatus: number; // 操作类型 0拒绝 1同意 2提交 3撤回 4终止 5指派 6加签 7转办 8变更 9复活 10前加签 11挂起 12恢复 100结束 -1节点撤回 -2当前正在处理
  comment?: string; // 备注说明
}

export interface IMonitorDetail {
  createTime: string;
  credentialsUrl: string;
  crossDirect: string;
  deptFullNames: string;
  deptNames: string; // 部门
  deviceId: string; // 设备ID
  deviceName: string; // 设备名称
  faultAlarmType: string;
  handleContent: string; // 处理内容
  handleTime: string; // 处理时间
  handlerId: string;
  handleByName: string;
  handleDescription: string; // 处理描述
  id: string;
  levelCode: string; // 告警等级
  locationId: string;
  monitorId: string; // 布控id
  monitorName: string; // 布控名称
  content?: string; // 告警内容
  monitorType: string;
  noticePersons: {
    deptFullNames: string;
    deptIds: string;
    deptName: string;
    deptNames: string;
    id: string;
    jobName: string;
    mobileNumber: string;
    mobilePhone: string;
    name: string;
    positions: number[];
  }[];
  objectNum: string;
  objectProbability: string;
  personCode: string; // 人员Code
  personId: string; // 人员ID
  personLabelIds: string; // 人员标签ID
  personLabelNames: string; // 人员标签名称
  personName: string; // 人员名称
  presetPosition: string;
  roi: string;
  rtspUrl: string;
  sex: string; // 性别
  similarity: string; // 相似度
  smsTemplateContent: string;
  smsTemplateId: string;
  persistEvent?: number; // 是否持续性事件 0否1是
  eventStatus?: number; // 持续状态 0持续中1结束
  snapBgImgId: string; // 抓拍背景图ID
  snapBgImgUrl: string; // 抓拍背景图路径
  snapImgId: string; // 持续性事件开始抓拍图ID
  snapImgUrl: string; // 持续性事件开始抓拍图路径
  snapTime: string; // 持续性事件开始抓怕时间
  videoId: string; // 持续性事件开始抓拍视频ID
  videoUrl: string; // 持续性事件开始抓拍视频地址
  finishCapture: number; // 持续性事件开始小视频状态
  objectRoi: string; // 持续性事件开始人形框
  secondSnapImgId?: string; // 持续性事件结束抓拍图ID
  secondSnapImgUrl?: string; // 持续性事件结束抓拍图路径
  secondSnapTime?: string; // 持续性事件结束抓怕时间
  secondVideoId?: string; // 持续性事件结束抓拍视频ID
  secondVideoUrl?: string; // 持续性事件结束抓拍视频地址
  secondFinishCapture?: number; // 持续性事件结束小视频状态
  secondObjectRoi?: string; // 持续性事件结束人形框
  spaceFullName: string;
  spaceId: string; // 空间ID
  spaceName: string; // 空间名称
  status: string; // 处理状态0未处理 1已处理
  systemId: string;
  threshold: string;
  typeId: string; // 告警类型ID
  typeName: string; // 告警名称
  wayType: string;
  typeCode: string;
  sceneName: string; // 场景名称
  disturbDesc: string; // 防打扰说明
  [key: string]: any;
}

/**
 * 获取行为布控详情
 * @param id
 * @returns
 */
export const getMonitorAlarmDetail = (id: string) =>
  request<IMonitorDetail>(`/v1/personMonitorRecords/${id}/actions/getDetail`, {}, 'GET', {
    spaceType: request.service.sas,
  });

export interface IFaceDetail {
  faceInfoDTO: { faceRoi: any };
  captureId: string; // 人脸照片id
  levelCode: string; // 布控等级
  content?: string; // 告警内容
  archiveLabels: string[]; // 档案标签
  archiveNo: number; // 档案编号
  deviceName: string; // 告警设备名称
  features: string[]; // 人脸特征
  gender: number; // 性别
  handleByName: string; // 处理人
  handleContent: string; // 处理内容
  handleTime: string; // 处理时间
  handleDescription: string; // 处理描述
  id: number; // 记录ID
  libraryId: number; // 布控库ID
  libraryName: string; // 布控库名称
  libraryType: number; // 布控库类型
  name: string; // 人员名称
  personName: string; // 人员名称(行为布控)
  personImageUrl: string; // 人脸图
  personType: number; // 0、教职工；1、学生；2、家长；3、陌生人；99、其他,
  personTypeName: string;
  similarity: number; // 相似度
  snapImageUrl: string; // 抓拍图
  snapImgUrl: string; // 抓拍图(行为布控)
  snapTime: string; // 抓拍时间
  sourceImageUrl: string; // 原图
  spaceId: number; // 空间ID
  spaceName: string; // 空间名称/抓拍地址
  status: number; // 处理状态
  faceSnapImageUrl: string; // 抓拍图
  faceArchiveImageUrl: string; // 档案图
  sceneName: string; // 场景名称
  disturbDesc: string; // 防打扰说明
  [key: string]: any;
}

/**
 * 获取人脸布控详情
 * @param id
 * @returns
 */
export const getFaceAlarmDetail = (id: string) =>
  request<IFaceDetail>(`/v1/face/record/${id}/actions/getDetail`, {}, 'GET', {
    spaceType: request.service.sas,
  });

/**
 * 获取人脸布控faceRoi
 * @param id
 * @returns
 */
export const getFaceAlarmRoi = (id: string) =>
  request<IFaceDetail>(`/v1/face/search/${id}`, {}, 'GET', {
    spaceType: request.service.sas,
  });

/**
 * 变更大数据校验结果
 * @param id 告警id
 * @param largeModelResult
 * @returns
 */
export const updateLargeModelResult = (id: string, largeModelResult: number) =>
  request(
    `/v1/personMonitorRecords/actions/updateLargeModelResult`,
    { id, largeModelResult },
    'PUT',
    {
      spaceType: request.service.sas,
    },
  );

/**
 * 大模型二次校验重试
 * @param id 告警id
 * @param largeModelResult
 * @returns
 */
export const largeModelTryAgain = (id: string) =>
  request(`/v1/personMonitorRecords/${id}/actions/tryAgain`, {}, 'GET', {
    spaceType: request.service.sas,
  });
