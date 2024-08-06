import { request } from '@/utils/request';

export default {
  determineAppPermission(params) {
    return request('/rest/ma/screenUser/isPermission', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  getWorkList(params) {
    return request('/rest/ma/screenWork/getWorkList', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 统计检测人员数量
  getScreenNum(params) {
    return request('/rest/ma/screenWork/countSceenNum', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 手动选择检测对象树
  getWorkObjTree(params) {
    return request('/rest/ma/screenWork/getWorkObjTree', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 获取班级学生
  getStudents(params) {
    return request('/rest/ma/screenWork/getStudents', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 获取检测记录列表
  // getScreenRecord(params) {
  // 	return request('/rest/ma/screenRecord/getPageByWorkId', params, 'GET')
  // },
  getScreenRecord(params) {
    return request('/rest/ma/screenRecord/getScreenRecordPage', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 获取检测记录详情
  getScreenInfo(params) {
    return request('/rest/ma/screenRecord/getByParam', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 获取其他检测记录
  getOtherScreenInfo(params) {
    return request('/screen/ldxScreenOtherRecord/queryStudentScreenOtherRecord', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 上报其他检测记录
  saveOtherScreenInfo(params) {
    return request('/screen/ldxScreenOtherRecord/save', params, 'POST', {
      spaceType: request.service.vision,
    });
  },
  // 获取学生列表
  getScreenObjStudentList(params) {
    return request('/screen/ldxScreenObj/getScreenObjStudentList', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 新增检测记录
  addScreenRecord(params) {
    return request('/rest/ma/screenRecord/add', params, 'POST', {
      spaceType: request.service.vision,
      defaultError: false,
    });
  },
  // 更新检测记录
  editScreenRecord(params) {
    return request('/rest/ma/screenRecord/edit', params, 'POST', {
      spaceType: request.service.vision,
    });
  },
  // 获取复测学生
  getReScreenStudents(params) {
    return request('/rest/ma/screenRecord/getReScreenStudents', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 获取班级树
  getGradeClassTree(params) {
    return request('/school/getGradeClassTree', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
  // 获取检测记录 (动态)
  getItemIndicator(params) {
    return request('/screen/ldxScreenOtherRecord/getItemIndicator', params, 'GET', {
      spaceType: request.service.vision,
    });
  },
};
