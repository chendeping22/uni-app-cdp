import { request } from '@/utils/request';

// 获取列表
export function getAdjustList(params: any) {
  return request('/schCourseAdjustAgentApply', params, 'GET', {
    spaceType: request.service.campusbase,
  });
}

// 获取详情
export function getAdjustDetail(applyId: string) {
  return request(`/schCourseAdjustAgentApply/${applyId}`, {}, 'GET', {
    spaceType: request.service.campusbase,
  });
}

// 待处理总数
export function getMyPendingCount() {
  return request('/schCourseAdjustAgentApply/receive/count', {}, 'GET', {
    spaceType: request.service.campusbase,
  });
}

// 查询教师年级列表
export function getAllTeachingGrades() {
  return request('/v2/teachers/actions/getAllTeachingGrades', {}, 'GET', {
    spaceType: request.service.campusbase,
  });
}

// 查询自己调课列表按周查询
/**
 * @param data
 * {
 *  "startDate": "",
 *  "endDate": "",
 *  "gradeId": "",
 *  onlyQueryOneGradeCourse: true,
 * needQueryProcessingApply: true,
 * }
 */
export function getTeacherDateList(data: any) {
  return request('/v2/school/schedule/queries/course/teacher/week-view/date-list', data, 'POST', {
    spaceType: request.service.campusbase,
  });
}

// 获取本节次空闲老师
// cellId
// pageNum
// pageSize
// clazzDate
// type=1同班级，type=2同年级
// keyword非必传
export function getCourseFreeTeachers(params: any) {
  return request('/v2/teachers/actions/getCourseFreeTeachers', params, 'GET', {
    spaceType: request.service.campusbase,
  });
}

export function getFreeTeachersForAgent(data: any) {
  return request('/v2/teachers/actions/getFreeTeachersForAgent', data, 'POST', {
    spaceType: request.service.campusbase,
  });
}

// 查询教师课表周视角-调课选择-天列表
export function getTeacherDateListByTeacherId(teacherId: string, data: any) {
  return request(
    `/v2/school/schedule/queries/course/teacher/${teacherId}/adjustSelect/week-view/date-list`,
    data,
    'POST',
    {
      spaceType: request.service.campusbase,
    },
  );
}

// 新增调课申请
export function applyAdjust(data: any) {
  return request('/courseApply/adjust', data, 'POST', {
    spaceType: request.service.classSchedule,
    showLoading: false,
  });
}

// 新增代课申请
export function applySupply(data: any) {
  return request('/courseApply/agent', data, 'POST', {
    spaceType: request.service.classSchedule,
    showLoading: false,
  });
}

// 更新申请状态（同意，拒绝，撤销）
export function updateAdjust(applyId: string, data: any) {
  return request(`/courseApply/${applyId}/status`, data, 'PUT', {
    spaceType: request.service.classSchedule,
  });
}
