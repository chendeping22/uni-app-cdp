import { request } from '@/utils/request';

export default {
  // 检测时间
  getStudentScreenTime(params) {
    return request('/rest/ma/screenRecord/getStudentScreenTime', params, 'GET');
  },
  // 获取学生检测记录
  getParentStudentRecord(params) {
    return request('/rest/ma/screenRecord/getParentStudentRecord', params, 'GET');
  },
  // 推荐阅读
  scienceOutreachsRecommended() {
    return request(
      `/anon/scienceOutreachs/recommended`,
      { apiService: request.apiService.science },
      'GET',
    );
  },
  // 推荐阅读(富文本数据)
  scienceOutreachsRead(params) {
    return request(
      `/anon/scienceOutreachs/read`,
      { apiService: request.apiService.science, ...params },
      'GET',
    );
  },
  // 推荐阅读(阅读量)
  scienceOutreachsReadCount(params) {
    return request(
      `/anon/scienceOutreachs/readCount`,
      { apiService: request.apiService.science, ...params },
      'POST',
    );
  },
};
