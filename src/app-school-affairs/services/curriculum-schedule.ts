import { request } from '@/utils/request';

// 获取周列表
export function getWeekList(params: any) {
  return request('/v1/school/calendars/actions/findSchoolYearByLocation', params, 'GET', {
    spaceType: request.service.campusbase,
  });
}

// 我的课表
// 查找学生课表周视角
export function getStudentSchedule(studentId: string, data: any) {
  return request(
    `/v2/school/schedule/queries/course/student/${studentId}/week-view`,
    data,
    'POST',
    {
      spaceType: request.service.campusbase,
    },
  );
}
// 查询教师课表周视角
export function getTeacherSchedule(data: any) {
  return request('/v2/school/schedule/queries/course/teacher/week-view', data, 'POST', {
    spaceType: request.service.campusbase,
  });
}

// 班级课表
// 班级树
export function getLocationClasses(locationId: string, status: 1 | 0) {
  return request(`/v1/school/roster/biz/tree/${locationId}?status=${status}`, {}, 'GET', {
    spaceType: request.service.campusbase,
  });
}
// 查询班级课表周视角
export function getClassSchedule(classId: any, data: any) {
  return request(`/v2/school/schedule/queries/course/clazz/${classId}/week-view`, data, 'POST', {
    spaceType: request.service.campusbase,
  });
}

// 教师课表
// 查询教师
export function fetchTeachers(data: any) {
  return request('/v1/userManagement/actions/pageUser', data, 'POST', {
    spaceType: request.service.building,
  });
}

// 查询教师课表周视角
export function getTeacherScheduleById(teacherId: any, data: any) {
  return request(
    `/v2/school/schedule/queries/course/teacher/${teacherId}/week-view`,
    data,
    'POST',
    {
      spaceType: request.service.campusbase,
    },
  );
}
