import { request } from '@/utils/request';

export enum SortImgEnum {
  /** 不排序 */
  NORMAL = 0,
  /** 降序 */
  DESC = 1,
  /** 升序 */
  ASC = 2,
}
export interface IReportWeek {
  /** 评价日期 */
  evaluationDate?: string;
  /** 排序参数 */
  sortType?: number;
}

export interface IReportMonth {
  /** 评价日期-月 */
  evaluationMonth?: string;
  /** 评价日期-年 */
  evaluationYear?: string;
  /** 排序参数 */
  sortType?: number;
}

/** 报表升序降序枚举参数 */
export enum SortTypeEnum {
  /** 班级升序 */
  CLAZZ = 1,
  /** 周总分升序 */
  WEEK = 2,
  /** 月平均分升序 */
  MONTH = 3,
  /** 单日加分升序 */
  ADD = 4,
  /** 单日减分升序 */
  SUBTRACT = 5,
  /** 班级降序 */
  CLAZZ_DESC = 6,
  /** 周总分降序 */
  WEEK_DESC = 7,
  /** 月平均分降序 */
  MONTH_DESC = 8,
  /** 单日加分降序 */
  ADD_DESC = 9,
  /** 单日减分降序 */
  SUBTRACT_DESC = 10,
}

export interface ITotalSource {
  evaluationCount?: string;
  gradeRank?: number;
  totalScore?: number;
}
/**
 * 报表-周报表
 */
export function getClassReportFormWeek(data: IReportWeek) {
  return request('/v2/classReportForm/week', data, 'POST', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/**
 * 报表-月汇总
 */
export function getClassReportFormMonth(data: IReportMonth) {
  return request('/v2/classReportForm/month', data, 'POST', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/**
 * 报表-总分
 */
export function getStatisticTotal(data: any) {
  return request('/v2/classReportForm/statisticTotal', data, 'POST', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
    // overdueShowLoadingTime: 0,
  });
}

/**
 * 报表-分析
 */
export function getStatisticAnalyse(data: any) {
  return request('/v2/classReportForm/statisticAnalyse', data, 'POST', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/**
 * 获取一级指标列表
 */
export function getIndicators(params: any) {
  return request('/v2/classEvaluationRecords/getIndicators', params, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/**
 * 获取评价人列表
 */
export function getEvaluators(params: any) {
  return request('/v2/classEvaluationRecords/getEvaluators', params, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}
/**
 * 获取评价记录
 */
export function getEvaluationRecords(data: any) {
  return request('/v2/classEvaluationRecords/page', data, 'POST', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/**
 * 获取班级详情班级树
 */
export function getOnSchemeClassTree(params: any) {
  return request('/v2/classEvaluationSchemes/getOnSchemeClassTree', params, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}
