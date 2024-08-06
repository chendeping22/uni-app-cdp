import { request } from '@/utils/request';

/** 1-进行中, 2-已结束  */
export type IClockInStatusType = 1 | 2;

/** 素材 */
export interface IMedia {
  fileId: string;
  url: string;
  type: number; // 1:图片 2:视频 3:录音
  videoSnapshotUrl?: string;
}
export interface IGetClockInTask {
  pageSize: number;
  pageNum: number;
  status: IClockInStatusType;
}

export interface IClockInTask {
  id: string;
  personId: number;
  personName: string;
  content: string;
  title: string;
  status: number;
  startDate: number;
  endDate: number;
  rate: string;
  clazzs: {
    clazzId: string;
    clazzName: string;
    studentNum: number;
  }[];
  currentDay: number;
  totalDay: number;
  createTime: number;
}

export interface IGetClockInTaskRtn {
  total: number;
  result: IClockInTask[];
}
/** 打卡任务列表 */
export const getClockInTask = (params: IGetClockInTask) => {
  return request<IGetClockInTaskRtn>('/v1/clockin/task', params, 'GET', {
    spaceType: request.service.clockin,
    overdueShowLoadingTime: 0,
  });
};

export interface IGetClockInDetailRtn {
  id: string;
  userId: string;
  personId: string;
  personName: string;
  title: string;
  content: string;

  status: number;
  startDate: number;
  enabledRetry: number; // 0:否 1:是 默认:否
  enabledView: number; // 0:否 1:是  默认：是
  clockinWay: string; // 指定打卡方式 1:图片 2:视频 3:录音 （多个逗号分割

  endDate: number;
  currentDate: number;
  currentDay: number;
  totalDay: number;
  createTime: number;
  medias: IMedia[];
  calendarVoList: {
    clockinDate: number;
    clockinStatus: number; // 0 - 未打卡 1 - 已打卡
  }[];
  clazzs: {
    clazzId: string;
    clazzName: string;
    studentNum: number;
    clockinNum: number;
  }[];
  students: {
    personId: string;
    studentId: string;
    studentName: string;
  }[];
  rate: string;
}

/** 打卡任务详情 */
export const getClockInDetail = (taskId: string) => {
  return request<IGetClockInDetailRtn>(`/v1/clockin/task/${taskId}`, {}, 'GET', {
    spaceType: request.service.clockin,
    defaultError: false,
  });
};

interface IGetClockinRecord {
  taskId: string;
  pageSize: number;
  pageNum: number;
  clockinDate: number;
  clazzId?: string;
}

interface IRecordComment {
  id: string;
  recordId: string;
  studentId: string;
  personId: string;
  personName: string;
  personType: number; //人员类型0老师 1家长
  commentType: number; //评论类型 0点赞 1评论
  remark: string;
  relation: any; //小孩和家长关系
  relationName: string;
}

export interface IClockinRecord {
  clockTime: number;
  clockinDate: number;
  clockinDay: number;
  content: string;
  studentId: string;
  studentName: string;
  clazzName: string;
  gender: number;
  id: string;
  imgUrl: string;
  mediaList: IMedia[];
  praiseCount: number;
  commentCount: number;
  clockinRecordCommentList: IRecordComment[];
}
export interface IGetClockinRecordRtn {
  result: IClockinRecord[];
  total: number;
}
export const getClockinRecord = (params: IGetClockinRecord) => {
  return request<IGetClockinRecordRtn>(`/v1/clockin/task/actions/getClockinRecord`, params, 'GET', {
    spaceType: request.service.clockin,
    overdueShowLoadingTime: 0,
  });
};

interface IExecuteClockin {
  taskId: string;
  content: string;
  clockinDate: string;
  studentId?: string;
  mediaList?: IMedia[];
}
export const executeClockin = (params: IExecuteClockin) => {
  return request(`/v1/clockin/task/actions/executeClockin`, params, 'POST', {
    spaceType: request.service.clockin,
  });
};

export const getClockInTaskByTeacher = ({ pageNum, pageSize, status }: IGetClockInTask) => {
  return request<IGetClockInTaskRtn>(
    `/v1/clockin/tasks/actions/pages/${pageNum}/${pageSize}/${status}`,
    {},
    'GET',
    {
      spaceType: request.service.clockin,
    },
  );
};

export interface ITaskDetail {
  clazzId: string;
  date: number;
  id: string;
}

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

// 获取班级明细
export const getClassTaskDetail = (params: ITaskDetail) => {
  return request(`/v1/clockin/tasks/actions/byClazz`, params, 'GET', {
    spaceType: request.service.clockin,
  });
};

/** 打卡任务详情 -- 教师 */
export const getClockInDetailByTeacher = (id: string) => {
  return request<IGetClockInDetailRtn>(`/v1/clockin/tasks/actions/detail?id=${id}`, {}, 'GET', {
    spaceType: request.service.clockin,
    defaultError: false,
  });
};

// 结束打卡
export const taskEnding = (id: string) => {
  return request<IGetClockInDetailRtn>(`/v1/clockin/tasks/actions/ending/${id}`, {}, 'GET', {
    spaceType: request.service.clockin,
    defaultError: false,
  });
};

// 删除打卡
export const taskDel = (id: string) => {
  return request<IGetClockInDetailRtn>(`/v1/clockin/tasks/actions/${id}`, {}, 'DELETE', {
    spaceType: request.service.clockin,
    defaultError: false,
  });
};

// 获取布控库列表
export const getClazzes = () => {
  return request(`/v1/clockin/tasks/actions/clazzes`, {}, 'GET', {
    spaceType: request.service.clockin,
  });
};
// 获取校级班级列表
export const getSchoolClazzes = () => {
  return request('/v1/frontend/security/getClazzListByLocationId', {}, 'GET', {
    spaceType: request.service.security,
  });
};
//
export const addClock = (data: any) => {
  return data?.id
    ? request(`/v1/clockin/tasks/actions/update`, { ...data }, 'PUT', {
        spaceType: request.service.clockin,
      })
    : request(`/v1/clockin/tasks/actions/create`, { ...data }, 'POST', {
        spaceType: request.service.clockin,
      });
};
//
export const getClockConfigInfo = (id: string) => {
  return request(`/v1/clockin/tasks/actions/${id}`, {}, 'GET', {
    spaceType: request.service.clockin,
  });
};

export const getClockinTemplate = (id: string) => {
  return request(`/v1/clockinTemplate/${id}`, {}, 'GET', {
    spaceType: request.service.auth,
  });
};

export type ITemplateParams = {
  keywords?: string; // 暂时不用
  pageNum: number;
  pageSize: number;
  validStatus: number; // 启用状态 0 禁用 1 启用  查询数据时，传启用状态的
};
export type ITemplateItem = {
  createBy: number;
  createTime: number;
  hot: number;
  id: number | string;
  imageFileId: string;
  imageFileUrl: string;
  templateContent: string;
  templateName: string;
  updateBy: number;
  updateTime: number;
  validStatus: number;
};
export type ITemplateResp = {
  endRow: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  result: ITemplateItem[];
  startRow: number;
  total: number;
};
/**
 * 根据条件分页查询模板信息
 * @param params
 * @returns
 */
export const getClockinTemplatePage = (params: ITemplateParams) =>
  request<ITemplateResp>('/v1/clockinTemplate/actions/teacherPage', params, 'GET', {
    spaceType: request.service.auth,
  });

/**
 * 更新打卡模板热度
 * @param id
 * @returns
 */
export const updateTemplateHot = (id: string | number) =>
  request(`/v1/clockinTemplate/actions/updateTemplateHot/${id}`, {}, 'PUT', {
    spaceType: request.service.auth,
  });

/**
 * 点赞及评论
 * @param recordId: 打卡记录ID
 * @param studentId: 学生ID
 * @param commentType: 打卡类型  0点赞 1评论
 * @param remark
 * @returns
 */
export const sendComments = (params: any, isTeacher: boolean) =>
  request(`${isTeacher ? '' : '/cus'}/clockinRecordComments/actions/save`, params, 'POST', {
    spaceType: request.service.clockin,
  });

/**
 * 提醒打卡
 * @returns
 */
export const sendClickInMessage = (taskId: string, params: any) =>
  request(`/v1/clockin/tasks/actions/sendMessage/${taskId}`, params, 'POST', {
    spaceType: request.service.clockin,
  });

/**
 * 提醒打卡
 * @returns
 */
export const getVideoSnapshot = (params: any) =>
  request(`/files/createVideoSnapshot`, params, 'GET', {
    spaceType: request.service.resource,
  });
