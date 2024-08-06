import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { request } from '@/utils/request';

export interface IGetStudentRtn {
  id: number;
  recordId: any;
  studentId: string;
  clazzId: string;
  locationId: string;
  createBy: any;
  createTime: any;
  updateBy: any;
  updateTime: any;
  studentName: string;
  clazzName: string;
  studentCode: string;
  gender: number;
  observeNum: number;
}

export enum SchoolRosterTreeNodeLevel {
  /** 学校 */
  Project = 1,
  /** 学段 */
  Section = 2,
  /** 年级 */
  Grade = 3,
  /** 班级 */
  Clazz = 4,
  /** 学院 */
  Academy = 21,
  /** 专业 */
  Major = 22,
}

export interface SchoolRosterTreeNode {
  childNodeList: SchoolRosterTreeNode[];

  /**
   * 节点编码：当level为2时，表示为年级类型（aka SchoolGradeType）
   *
   * - 0: 幼儿园
   * - 1: 小学
   * - 2: 初中
   * - 3: 高中
   * - 4: 大学
   * - 5: 中高职
   * - 98: 社团
   * - 99: 兴趣班
   */
  nodeCode: number | null;

  /**
   * 当nodeLevel === SchoolRosterTreeNodeLevel.Project，nodeId就是locationId
   */
  nodeId: string;

  /**
   * 节点等级
   *
   * - 1: 学校
   * - 2: 学段
   * - 3: 年级
   * - 4: 班级
   */
  nodeLevel: SchoolRosterTreeNodeLevel;

  /**
   * 节点名称
   */
  nodeName: string | null;

  /**
   * 父节点基本信息，无子节点信息
   */
  parentNodeBase: SchoolRosterTreeNode | null;

  /**
   * 是否是标准学段
   *
   * - 1: 是
   * - 0: 否
   *
   * @remarks
   *
   * IMP-85335这个需求之后，是否是标准学段就已经没有意义，因为所有的学段都是标准的
   */
  stdFlag: number;
}

/**
 * （中高职/高校）获取老师对应的班级信息（包含年级、学段信息）
 * @param teacherId
 * @param skipRole 排除角色范围,多个时逗号隔开，目前支持排除的有: 'TakeCourseTeacher'
 * @returns
 */
export const getClazzWithSectionByTeacherId2 = async (teacherId: string, skipRole?: string) => {
  const data = await request<SchoolRosterTreeNode[]>(
    `/v1/frontend/clazzes/actions/getClazzWithSectionByTeacherId2`,
    {
      teacherId,
      skipRole: skipRole || '',
    },
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );

  return data;
};

export const getSpaceType = () => {
  const store = loginStore();
  return EUserType.teacher !== store.currentUserType ? 'observes/cus' : 'observes';
};

export const getStudents = (clazzId: string) =>
  request<IGetStudentRtn[]>(`/observeRecordStudents/actions/findByClazzId`, { clazzId }, 'GET', {
    spaceType: getSpaceType(),
  });

/**获取观察领域树*/
export const findTree = () =>
  request(`/observeDomainProjects/findTree`, {}, 'GET', {
    spaceType: getSpaceType(),
  });

/**获取观察领域树*/
export const findByStudentId = (data: any) =>
  request(`/observeRecords/actions/findByStudentId`, data, 'GET', {
    spaceType: getSpaceType(),
  });

/**获取观察记录的草稿箱*/
export const observeRecords = (data: any) =>
  request(`/observeRecords`, data, 'GET', {
    spaceType: getSpaceType(),
  });

/**获取观察记录详情*/
export const getObserveRecordById = (data: any) =>
  request(`/observeRecords/actions/getObserveRecordById`, data, 'GET', {
    spaceType: getSpaceType(),
  });

/** 新建发布 保存资源文件*/
export const publishApi = (data: any) =>
  request(`/observeRecords/actions/saveObserveRecord`, data, 'POST', {
    spaceType: getSpaceType(),
    overdueShowLoadingTime: 0,
  });

/** 保存评价*/
export const saveRecordEvaluate = (data: any) =>
  request(`/observeRecordEvaluates/actions/saveRecordEvaluate`, data, 'POST', {
    spaceType: getSpaceType(),
  });

/** 删除观察记录*/
export const deleteObserveRecord = (data: any) =>
  request(`/observeRecords/actions/deleteObserveRecord?recordId=${data.recordId}`, {}, 'DELETE', {
    spaceType: getSpaceType(),
    overdueShowLoadingTime: 0,
  });
/** 删除观察记录*/
export const deleteSingleObserveRecord = (data: any) =>
  request(
    `/observeRecords/actions/deleteObserveRecord/${data.recordId}/${data.studentId}`,
    {},
    'DELETE',
    {
      spaceType: getSpaceType(),
      overdueShowLoadingTime: 0,
    },
  );

/** 删除观察评价*/
export const deleteObserveRecordEvaluates = (id: any) =>
  request(`/observeRecordEvaluates/${id}`, {}, 'DELETE', {
    spaceType: getSpaceType(),
    overdueShowLoadingTime: 0,
  });

/** 更新观察记录*/
export const updateObserveRecord = (data: any) =>
  request(`/observeRecords/actions/updateObserveRecord`, data, 'PUT', {
    spaceType: getSpaceType(),
  });

// 获取孩子信息
export const getChildsById = (id: string) =>
  request(`/v2/parents/action/getDetailById?id=${id}`, {}, 'POST', {
    spaceType: request.service.campusbase,
  });

// 设置观察记录已读
export const setObserveRecordReads = (data: {
  studentId: string;
  type: number;
  recordId?: string;
}) =>
  request(
    `/observeRecordReads/actions/reads/${data.studentId}/${data.type}${
      data.type === 1 ? '' : `?recordId=${data.recordId}`
    }`,
    data,
    'POST',
    {
      spaceType: getSpaceType(),
    },
  );
