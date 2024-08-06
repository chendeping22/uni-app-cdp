import { request } from '@/utils/request';
import { isGuardian } from './is';

const spaceType = () => (isGuardian() ? 'timeset/cus' : 'timeset');

export interface IGetStudentRtn {
  id: string;
  name: string;
  photoNum: number;
  gender: number;
  studentCode: string;
  clazzId: string;
  clazzName: string;
  imageUrl: string;
  unReadCount: number;
}

export const getStudents = (clazzId: string) =>
  request<IGetStudentRtn[]>(`/resources/actions/students/${clazzId}`, {}, 'GET', {
    spaceType: request.service.timeset,
  });

export interface IGetTimeImpressionQuery {
  studentId: string;
  startDate: string;
  endDate: string;
  resourceType?: number;
  taskId?: string;
}

export interface IresourceList {
  resourceId: string;
  resourceType: number;
  name: string;
  thumbnailURL: string;
  resourceURL: string;
  evaluateStatus: 0 | 1;
  resourceRelId: string;
  uploadDate: any;
  pushed: number;
}

export interface IGetTimeImpressionQueryRtn {
  uploadDate: number;
  count: number;
  resourceList: IresourceList[];
}
/** 麦塔校园时光印象 */
export const getTimeImpressionQuery = (data: IGetTimeImpressionQuery) =>
  request<IGetTimeImpressionQueryRtn[]>(`/resourceStudents/actions/query`, data, 'GET', {
    spaceType: spaceType(),
  });
export interface IGetTimeImpressionQueryRes {
  uploadDate: number;
  count: number;
  labels: string[];
  resourceGroups: {
    remark: string;
    evaluateCount: number;
    unReadCount: number;
    resourceList: IresourceList[];
  }[];
}
/** 麦塔校园时光集 */
export const findStudentTimeSets = (data: IGetTimeImpressionQuery) =>
  request<IGetTimeImpressionQueryRes[]>(
    `/resourceStudents/actions/findStudentTimeSets`,
    data,
    'GET',
    {
      spaceType: spaceType(),
    },
  );
export interface IGetObserveTasks {
  pageNum: number;
  pageSize: number;
  name?: string;
  studentIds?: string[];
}
export interface IGetObserveTasksRtn {
  name: string;
  createTime: number;
  id: string;
  createByName: string;
  observeStudentsVO: {
    id: string;
    studentName: string;
  }[];
}
export const getObserveTasks = (data: IGetObserveTasks) =>
  request<IRequestList<IGetObserveTasksRtn[]>>(`/observeTasks/actions/queryPage`, data, 'POST', {
    spaceType: request.service.timeset,
  });

export interface IGetObserveTaskDetailRtn {
  name: string;
  createTime: number;
  id: string;
  createByName: string;
}

export const getObserveTaskDetail = (id: string) =>
  request<IGetObserveTaskDetailRtn>(`/observeTasks/${id}`, {}, 'GET', {
    spaceType: request.service.timeset,
  });

export interface IGetObserveTaskStudentRtn {
  id: string;
  observeTaskId: string;
  studentId: string;
  studentName: string;
  gender: number;
  clazzName: string;
  clazzId: string;
  studentCode: string;
  photoNum: number;
}
export const getObserveTaskStudent = (observeTaskId: string) =>
  request<IRequestList<IGetObserveTaskStudentRtn[]>>(
    `/observeTasks/actions/queryTaskStudentPage`,
    {
      observeTaskId,
      pageNum: 1,
      pageSize: 9999,
    },
    'POST',
    {
      spaceType: request.service.timeset,
    },
  );

export interface IPostSaveObserveTask {
  name: string;
  studentIds: string[];
}
export const postSaveObserveTask = (data: IPostSaveObserveTask) =>
  request(`/observeTasks/actions/save`, data, 'POST', {
    spaceType: request.service.timeset,
  });

export interface IPostQuerySourceLib {
  startDate: string;
  endDate: string;
  studentIds: string[];
  labelIds: string[];
  source: number; // 1手动 2设备上报 3观察记录
  resourceType: number; // 1照片 2视频
  pageSize: number;
  pageNum: number;
  evaluateStatus?: number;
}
export interface IPostQuerySourceLibRtn {
  thumbnailURL: string;
  resourceURL: string;
  resourceType: number;
  resourceFileId: string;
  id: string;
  evaluateStatus: number; //  1已评价 0未评价
  name: string;
}
/** 查询资源库列表 */
export const postQuerySourceLib = (data: Optional<IPostQuerySourceLib>) =>
  request<IRequestList<IPostQuerySourceLibRtn[]>>(`/resources/actions/queryPage`, data, 'POST', {
    spaceType: request.service.timeset,
  });

/** 回收站查询 */
export const postQueryRecyclePage = (data: Optional<IPostQuerySourceLib>) =>
  request<IRequestList<IPostQuerySourceLibRtn[]>>(
    `/resources/actions/queryRecyclePage`,
    data,
    'POST',
    {
      spaceType: request.service.timeset,
    },
  );

export interface IGetSourceDetail {
  id: string;
  thumbnailURL: string;
  resourceFileURL: string;
  name: string;
  evaluate: string;
  evaluateStatus: number;

  evaluateByName: string;

  ableEvaluate: number; //0不能评价 1可以评价
  resourceType: number; //1照片 2视频

  createByName: string;
  resourceStudentIds: string[]; // 学生和资源关系id

  uploadDate: number; //上传日期
  source: number; // 类型 1手动 2设备 3观察记录
  sourceType: number; // 类型 1手动 2设备 3观察记录
  resourceDTO: any;
  resourceMoreCommentDTOList: any;
  labelList: {
    name: string;
    id: string;
    count: string;
  }[];
  studentList: {
    name: string;
    id: string;
  }[];
}

// export const getSourceDetail = (resourceId: string) =>
//   request<IGetSourceDetail>(`/resources/actions/${resourceId}`, {}, 'GET', {
//     spaceType: request.service.timeset,
//   });
export const getSourceDetail = (data: any) =>
  request(
    `/resources/actions/detailByResourceIdAndStudentId?resourceId=${data.resourceId}&studentId=${data.studentId}`,
    {},
    'GET',
    {
      spaceType: spaceType(),
    },
  );

/** 资源库删除 */
export const deleteSources = (resourceIds: string[]) =>
  request(`/resources/actions/delete`, { resourceIds }, 'DELETE', {
    spaceType: request.service.timeset,
  });

/** 时光印象删除 */
export const deleteTimeSet = (resourceIds: string[]) =>
  request(`/resourceStudents/actions/student`, { resourceIds }, 'DELETE', {
    spaceType: spaceType(),
  });

/** 推送 */
export const pushSource = (resourceRelIds: string[]) =>
  request(`/resources/push`, { resourceRelIds }, 'PUT', {
    spaceType: request.service.timeset,
  });

export interface IEditSource {
  evaluate: string;
  labelIds: string[];
  name: string;
  taskId?: string;
  resourceId: string;
  resourceIds: string[];
  studentIds: string[];
}
export const editSource = (data: IEditSource) =>
  request(`/resources/actions/edit`, data, 'PUT', {
    spaceType: request.service.timeset,
  });

export interface IQueryRecentLabelsRtn {
  id: string;
  name: string;
  resourceCount?: number;
  count: number;
}
export const queryRecentLabels = () =>
  request<IQueryRecentLabelsRtn[]>(`/labels/actions/queryRecentLabels`, {}, 'GET', {
    spaceType: request.service.timeset,
  });

export const queryAllLabels = () =>
  request<IQueryRecentLabelsRtn[]>(`/labels/`, {}, 'GET', {
    spaceType: request.service.timeset,
  });

/** 模糊查询 */
export const queryNameLikeLabels = (nameLike: string) =>
  request<IQueryRecentLabelsRtn[]>(
    `/labels/query`,
    { nameLike, pageNum: 1, pageSize: 9999 },
    'GET',
    {
      spaceType: request.service.timeset,
    },
  );

export const addLabel = (name: string) =>
  request<IQueryRecentLabelsRtn[]>(`/labels`, { name }, 'POST', {
    spaceType: request.service.timeset,
    overdueShowLoadingTime: 0,
  });

export interface IAddTimeImpression {
  resourceIds: string[];
  studentId: string;
  taskId?: string;
}
export const addTimeImpression = (data: IAddTimeImpression) =>
  request(`/resourceStudents/actions/add`, data, 'POST', {
    spaceType: request.service.timeset,
    overdueShowLoadingTime: 0,
  });

export interface IPostBatchAssignLabels {
  labelIds: string[];
  resourceIds: string[];
  studentIds: string[];
}

export const postBatchAssignLabels = (data: IPostBatchAssignLabels) =>
  request(`/resources/actions/batchAssignLabels`, data, 'POST', {
    spaceType: request.service.timeset,
  });

/** 从资源库删除 */
export const deleteResource = (resourceIds: string[]) =>
  request(`/resources/actions/delete`, { resourceIds }, 'DELETE', {
    spaceType: request.service.timeset,
  });

/** 从本页面删除 */
export const deleteCurrent = (resourceRelIds: string[]) =>
  request(`/resourceStudents/actions/student`, { resourceRelIds }, 'DELETE', {
    spaceType: spaceType(),
  });

/** 观察任务的本页面删除 */
export const deleteObseveCurrent = (resourceRelIds: string[]) =>
  request(`/observeTasks/actions/removePhoto`, { resourceRelIds }, 'DELETE', {
    spaceType: request.service.timeset,
  });

/** 观察任务新增资源 */
export const addStudentResources = (data: IAddTimeImpression) =>
  request(`/observeTasks/actions/addStudentResources`, data, 'POST', {
    spaceType: request.service.timeset,
    overdueShowLoadingTime: 0,
  });

export const queryStudentResource = (data: IGetTimeImpressionQuery) =>
  request<IGetTimeImpressionQueryRtn[]>(`/observeTasks/actions/queryStudentResource`, data, 'GET', {
    spaceType: request.service.timeset,
  });
export const getRecycleDetail = (resourceId: string) =>
  request<IGetSourceDetail>(`/resources/actions/recycleDetail/${resourceId}`, {}, 'GET', {
    spaceType: request.service.timeset,
  });

/** 清空回收站 */
export const clearRecycle = () =>
  request(`/resources/actions/clearRecycle`, {}, 'DELETE', {
    spaceType: request.service.timeset,
  });

/** 回收站删除 */
export const recycleDelete = (resourceIds: string[]) =>
  request(`/resources/actions/deleteRecycle`, { resourceIds }, 'DELETE', {
    spaceType: request.service.timeset,
  });

/** 回收站还原 */
export const restoreRecycle = (resourceIds: string[]) =>
  request(`/resources/actions/restoreRecycle`, { resourceIds }, 'PUT', {
    spaceType: request.service.timeset,
  });
/** 获取学生信息（家长） */
export const resourceStudents = (resourceIds: { id: string }) =>
  request(`/cus/resourceStudents/${resourceIds.id}`, {}, 'GET', {
    spaceType: request.service.timeset,
  });

export const getQueryExistResourceIds = (studentId: string) =>
  request(`/observeTasks/actions/queryExistResourceIds`, { studentId }, 'GET', {
    spaceType: request.service.timeset,
  });

/** 时光印象查询已有的 */
export const getQueryExistResourceIdsByTime = (studentId: string) =>
  request(`/resourceStudents/actions/bandingResource`, { studentId }, 'GET', {
    spaceType: request.service.timeset,
  });
/** 新建发布 保存资源文件*/
export const publishApi = (data: any) =>
  request(`/resources/`, data, 'POST', {
    spaceType: spaceType(),
    overdueShowLoadingTime: 0,
  });
/** 新建发布 资源库批量添加标签和关联学生*/
export const batchAssignLabels = (data: any) =>
  request(`/resources/actions/batchAssignLabels`, data, 'POST', {
    spaceType: spaceType(),
    overdueShowLoadingTime: 0,
  });
/** 家长端：新建发布 */
export const batchSaveResource = (data: any) =>
  request(`/resourceStudents/actions/batchSaveResource`, data, 'POST', {
    spaceType: spaceType(),
    overdueShowLoadingTime: 0,
  });
/** 保存评价*/
export const saveEvaluation = (data: any) =>
  request(`/resources/actions/saveEvaluation`, data, 'POST', {
    spaceType: spaceType(),
    overdueShowLoadingTime: 0,
  });
/** 删除评价*/
export const deleteEvaluation = (id: any) =>
  request(`/resources/actions/deleteEvaluation?commentId=${id}`, {}, 'DELETE', {
    spaceType: spaceType(),
    overdueShowLoadingTime: 0,
  });

export interface IPostFiles {
  thumbnailFileId: string;
  resourceFileId: string;
  name: string;
  resourceType: string;
}
export const postFiles = (arr: IPostFiles[]) =>
  request(`/resources/`, arr, 'POST', {
    spaceType: request.service.timeset,
  });

// 设置时光集已读
export const timesetResourceReads = (data: {
  studentId: string;
  type: number;
  resourceStudentId?: string;
}) =>
  request(
    `/timesetResourceReads/actions/reads/${data.studentId}/${data.type}${
      data.type === 1 ? '' : `?resourceStudentId=${data.resourceStudentId}`
    }`,
    data,
    'POST',
    {
      spaceType: spaceType(),
    },
  );
