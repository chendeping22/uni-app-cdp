import { request } from '@/utils/request';

/**
 * 统计-获取方案列表
 */
export function getClassEvaluationSchemes(params: any) {
  return request('/v2/classEvaluationSchemes/latestList', params, 'POST', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/**
 * 统计-获取组织方案日期信息
 */
export function getSchemeDateInfo(params: { schemeId: string }) {
  return request('/v2/classEvaluationSchemes/getSchemeDateInfo', params, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}
/**
 * 统计-荣誉榜单时间周期
 */
export function getRankingStatisticssList(params: { evaluationSchemeId: string }) {
  return request('/v2/classRankingStatisticss/cycleList', params, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/**
 * 统计-荣誉统计
 */
export function getRankingHonorStatisticsList(data: any) {
  return request('/v2/classRankingStatisticss/honorStatisticsList', data, 'POST', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/**
 * 统计-班级统计
 */
export function getClassStatisticsList(evaluationSchemeId: string) {
  return request('/v2/classRankingStatisticss/classStatisticsList', { evaluationSchemeId }, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/**
 * 统计-班级统计
 */
export function getSemesterSummary(initialSchemeId: string) {
  return request('/v2/classRankingStatisticss/semesterSummary', { initialSchemeId }, 'POST', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}

/**
 * 统计-班级统计详情
 */
export function getClassStatisticsDetail(data: { clazzId: string; evaluationSchemeId: string }) {
  return request('/v2/classRankingStatisticss/oneClassStatisticsList', data, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}
