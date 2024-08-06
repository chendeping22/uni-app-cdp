import { request, TRequestOptions } from '@/utils/request';

export interface ClassRecordParams {
  /**
   * 班级id集合
   */
  classIdList?: string[];
  gradeIdList?: string[];
  /**
   * 点评状态
   */
  commentState?: boolean;
  /**
   * 日期
   */
  date?: string;
  /**
   * 页码
   */
  // pageNum: number;
  /**
   * 页面大小
   */
  // pageSize: number;
  /**
   * 评价方案id
   */
  schemeId?: number;
}

/** 人脸扫码后返回的学生信息 */
export interface IFaceStudentInfo {
  /** 班级id */
  clazzId?: string;
  /** 班级名称 */
  clazzName?: string;
  /** 年级id */
  gradeId?: string;
  /** 年级名称 */
  gradeName?: string;
  /** 学生id */
  personId?: string;
  /** 学生名称 */
  personName?: string;
}

/**
 * 根据条件获取评价班级分页接口
 */
export function getClassRecord(params: ClassRecordParams) {
  return request('/v2/classEvaluationEvaluators/getClassRecordListByCondition', params, 'POST', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
    // overdueShowLoadingTime: 0,
  });
}

/**
 * 根据方案ID获取评价指标列表接口
 */
export function getEvaluationIndicator(params: { schemeId: string }) {
  return request('/v2/classEvaluationSchemes/getEvaluationIndicatorBySchemeId', params, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
    // overdueShowLoadingTime: 0,
  });
}

/**
 * 根据方案ID获取评价指标列表接口
 */
export function addEvaluation(data: any) {
  return request('/v2/classEvaluationRecords/add', data, 'POST', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
    overdueShowLoadingTime: 0,
  });
}

/**
 * 获取用户有权限点评的班级树
 */
export function getEvaluationClassTree(data: any) {
  return request('/v2/classEvaluationEvaluators/getEvaluationClassTree', data, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/** 通过班级id和日期获取方案相关信息-date为时间戳 */
export function getSchemeInfoByClazzIdAndDate(data: { clazzId: string; date: number }) {
  return request('/v2/classEvaluationSchemes/getSchemeInfoByClazzIdAndDate', data, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/** 人脸识别 */
export function getIntelligentIdentificationFace(data: { imgUrl: string; imgId: string }) {
  return request('/IntelligentIdentification/actions/face', { ...data, personType: 1 }, 'POST', {
    spaceType: request.service.sas,
    defaultError: false,
  });
}

/** 获取组织方案日期信息 */
export function getSchemeDateInfo(data: { schemeId: string }) {
  return request('/v2/classEvaluationSchemes/getSchemeDateInfo', data, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

// 获取用户的相关信息
export function getEvaluatorUserInfo() {
  return request('/v2/classEvaluationEvaluators/getUserInfo', {}, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

export const fetchVideoSnapshot = (
  params: { fileId: string },
  options?: Partial<TRequestOptions>,
) => {
  return request(`/files/createVideoSnapshot?fileId=${params.fileId}`, params, 'GET', {
    spaceType: request.service.resource,
    showLoading: false,
    defaultError: false,
    ...options,
  });
};
