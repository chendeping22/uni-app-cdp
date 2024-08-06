import { request } from '@/utils/request';

export default {
  loginEvent(params) {
    return request(`openapi/kangrui/frontend/login?mobile=${params.mobile}`, params, 'POST', {
      spaceType: '',
      defaultError: false,
    });
  },
  findWorkPage(params) {
    return request(`openapi/kangrui/frontend/findWorkPage`, params, 'GET', {
      spaceType: '',
      defaultError: false,
    });
  },
  findScreenNum(params) {
    return request(`openapi/kangrui/frontend/findScreenNum`, params, 'GET', {
      spaceType: '',
      defaultError: false,
    });
  },
  findStudentDetail(params) {
    return request(`openapi/kangrui/frontend/findStudentDetail`, params, 'GET', {
      spaceType: '',
      defaultError: false,
    });
  },
  findWorkSchools(params) {
    return request(`openapi/kangrui/frontend/findWorkSchools`, params, 'GET', {
      spaceType: '',
      defaultError: false,
    });
  },
  findWorkStudentTree(params) {
    return request(`openapi/kangrui/frontend/findWorkStudentTree`, params, 'GET', {
      spaceType: '',
      defaultError: false,
    });
  },
  findStudents(params) {
    return request(`openapi/kangrui/frontend/findStudents`, params, 'GET', {
      spaceType: '',
      defaultError: false,
    });
  },
  reportScreenRecord(params) {
    return request(`openapi/kangrui/frontend/reportScreenRecord`, params, 'POST', {
      spaceType: '',
      defaultError: false,
    });
  },
};
