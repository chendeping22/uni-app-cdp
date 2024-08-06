import { request } from '@/utils/request';

interface IScoreListParams {
  pageNum: number;
  pageSize: number;
  schoolYear: string; // "2023-2024"
  term: number;
  scoreType: string;
  userId: string; // 学生id
}

interface IScoreInfo {
  scoreTaskId: string;
  name: string;
  scoreType: string;
  scoreTypeName: string;
  publishTime: number;
}

export function getScoreList(data: IScoreListParams) {
  return request('/scoreTaskInfos/queryStudentScore/page', data, 'POST', {
    spaceType: request.service.scoreManagement,
    showLoading: false,
  });
}

export function getScoreInfoById(scoreTaskId: string) {
  return request<IScoreInfo>(`/scoreTaskInfos/queryStudentScore/${scoreTaskId}/detail`, {}, 'GET', {
    spaceType: request.service.scoreManagement,
    defaultError: false,
  });
}

// 获取周列表
export function getSchoolYear(params: any) {
  return request('/v1/school/calendars/actions/findSchoolYearByLocation', params, 'GET', {
    spaceType: request.service.campusbase,
  });
}

/** 获取某个学校所有的成绩类型 */
export function getScoreTypesList(params: any) {
  return request('/scoreTypes/getByLocationId', params, 'GET', {
    spaceType: request.service.scoreManagement,
  });
}

// 获取学生成绩数据
export function getStudentPublishScore(params: { scoreTaskId: string; studentId: string }) {
  return request('/studentMarks/actions/getStudentPublishScore', params, 'GET', {
    spaceType: request.service.scoreManagement,
  });
}
