import { request } from '@/utils/request';

/**
 * 根据日期获取组织方案日期信息(最早日期为方案起始日期)
 */
export function getSchemeDateInfoByDate(date: string | number, type) {
  return request(
    '/v2/classEvaluationSchemes/schemeDateInfoByDate',
    { date, type: type || 0 },
    'GET',
    {
      spaceType: request.service.classEvaluation,
      defaultError: false,
    },
  );
}

/**
 * 根据日期获取方案日期信息（起始日期为聚合方案的所产出的评价数据最早的日期，止为当前日期）
 */
export function getSchemeDateInfoFilterComment(date: string | number) {
  return request('/v2/classEvaluationSchemes/schemeDateInfoFilterComment', { date }, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
  });
}
