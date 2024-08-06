import { request } from '@/utils/request';

/**
 * 根据学生姓名/姓名首拼/班内学号查询学生
 */
export function searchStudent(params: { keyword: string; date: number }) {
  return request('/v2/classEvaluationEvaluators/getStudent', params, 'GET', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
    overdueShowLoadingTime: 0,
  });
}

export function getStudentByClass(params: { keyword: string; clazzIds: string[] }) {
  return request('/v2/classEvaluationEvaluators/getStudentTree', params, 'POST', {
    spaceType: request.service.classEvaluation,
    defaultError: false,
    overdueShowLoadingTime: 0,
  });
}
