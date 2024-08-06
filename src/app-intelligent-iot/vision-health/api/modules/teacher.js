import { request } from '@/utils/request';

export default {
  // 筛查数据
  getClazzRecord(params) {
    return request('/rest/ma/screenRecord/getClazzRecord', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 数据记录
  getStudentRecord(params) {
    return request('/rest/ma/screenRecord/getStudentRecord', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 筛查结果
  getScreenReport(params) {
    return request('/rest/ma/screenRecord/queryById', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 查询当前学年工作
  getNowWork(params) {
    return request('/rest/ma/screenWork/getNowWork', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 获取班级信息
  getClassDetail(params) {
    return request('/rest/ma/screenWork/getClassDetail', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
};
