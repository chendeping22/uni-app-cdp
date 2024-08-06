import { request } from '@/utils/request';

export default {
  // 查询问卷
  getList(params) {
    return request('/rest/ma/question/phoneList', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 获取问题列表
  getQuestion(params) {
    return request('/rest/ma/question/getQuestion', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 获取问题详情
  getQuestionDetails(params) {
    return request('/rest/ma/questionRecord/queryDetails', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 提交问卷
  addRecord(params) {
    return request('/rest/ma/question/addRecord', params, 'POST', {
      spaceType: request.service.vision,
    });
  },

  /* 家长端-问卷调查 */
  getListInGuardian(params) {
    return request('/rest/ma/question/phoneList', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 家长端-提交问卷
  addRecordInGuardian(params) {
    return request('/rest/ma/question/addRecord', params, 'POST', {
      spaceType: request.service.vision,
    });
  },
  // 家长端-获取问题列表
  getQuestionInGuardian(params) {
    return request('/rest/ma/question/getQuestion', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 获取问题详情
  getQuestionDetailsInGuardian(params) {
    return request('/rest/ma/questionRecord/queryDetails', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
};
