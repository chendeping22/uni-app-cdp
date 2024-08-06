import { request } from '@/utils/request';

// const apiPrefix = '/api/workflow';

export function sendCaptcha(data: { phone: string; debug: number }) {
  // return defHttp.get({ url: `${apiPrefix}/archive/getVerificationCode`, data });
  // return request({
  //   url: `${apiPrefix}/archive/getVerificationCode`,
  //   method: "get",
  //   data,
  //   options: {
  //     load: false,
  //   },
  // });
  return request(`/archive/mine/getVerificationCode`, data, 'GET', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
}

// 获取手机号绑定状态
export function checkPhoneBindStatus(data: { phone: string; userId: string }) {
  // return defHttp.get({ url: `${apiPrefix}/archive/checkPhoneBindStatus`, data });
  // return request({
  //   url: `${apiPrefix}/archive/checkPhoneBindStatus`,
  //   method: 'get',
  //   data,
  //   options: {
  //     load: false,
  //   },
  // });
  return request(`/archive/mine/checkPhoneBindStatus`, data, 'GET', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
}
export function checkPhoneBindStatusApp(data: { phone: string; userId: string }) {
  return request(`/archive/mine/app/checkPhoneBindStatus`, data, 'GET', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
}

// 获取手机号绑定状态
export function bindArchive(data: any) {
  // return defHttp.post({ url: `${apiPrefix}/archive/bindArchive `, data });
  // return request({
  //   url: `${apiPrefix}/archive/bindArchive`,
  //   method: 'post',
  //   data,
  //   options: {
  //     load: false,
  //   },
  // });
  return request(`/archive/mine/bindArchive`, data, 'POST', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
}
// 获取我的档案
export function getMyArchive() {
  // return defHttp.get({ url: `${apiPrefix}/archive/mine` });
  // return request({
  //   url: `${apiPrefix}/archive/mine`,
  //   method: 'get',
  //   data: {},
  //   options: {
  //     load: false,
  //   },
  // });
  return request(`/archive/mine`, {}, 'GET', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
}

export function getDict(code: string) {
  return request(`/dictionaries?entryCode=${code}`, {}, 'GET', {
    spaceType: request.service.auth,
    showLoading: false,
  });
}
export function getDicts(codes: string[]) {
  return request(`/dictionaries/query?entryCodes=${codes?.join(',')}`, {}, 'GET', {
    spaceType: request.service.auth,
    showLoading: false,
  });
}
export function getSelectOptions(codes: string[]) {
  return request(`/dictionaries/query?entryCodes=${codes?.join(',')}`, {}, 'GET', {
    spaceType: request.service.auth,
    showLoading: false,
  });
}

// 档案具体详情 低码的，调试用
export function getMyArchiveDetail(id: string) {
  // return request({
  //   url: `/api/school/archive/detail/${id}`,
  //   method: 'get',
  //   data: {},
  //   options: {
  //     load: false,
  //   },
  // });
  return request(`/archive/detail/${id}`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/** 根据id获取档案基本信息 */
export const getArchiveBaseInfo = (id: string) => {
  // return await Http.getInstance().get(`/api/teacherArchive/archiveBases/${id}/actions/info`);
  return request(`/archiveBases/${id}/actions/info`, {}, 'GET', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
};
export const createArchiveBaseInfo = async (data: any) => {
  // return await toastErrorMsg(Http.getInstance().post(`/api/teacherArchive/archiveBases`, data));
  return request(`/archiveBases`, data, 'POST', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
};

export const saveArchiveBaseInfo = async (id: string, data: any) => {
  // return await toastErrorMsg(
  //   Http.getInstance().put(`/api/teacherArchive/archiveBases/${id}`, data),
  // );
  return request(`/archiveBases/${id}`, data, 'GET', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
};

export const updateArchiveBaseInfo = async (id: string, data: any) => {
  // return await toastErrorMsg(
  //   Http.getInstance().put(`/api/teacherArchive/archiveBases/${id}`, data),
  // );
  return request(`/archiveBases/${id}`, data, 'PUT', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
};

/** 查询子表信息列表 */
export const getSubInfoList = async (name: string, baseId: string) => {
  // return await toastErrorMsg(
  //   Http.getInstance().get(`/api/teacherArchive/${name}/list`, { baseId }),
  // );
  return request(`/${name}/list`, { baseId }, 'GET', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
};

/** 创建子表信息 */
export const createSubInfo = async (name: string, data: any) => {
  // return await toastErrorMsg(Http.getInstance().post(`/api/teacherArchive/${name}`, data));
  return request(`/${name}`, data, 'POST', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
};

/** 创建子表信息 */
export const updateSubInfo = async (name: string, id: string, data: any) => {
  // return await toastErrorMsg(Http.getInstance().put(`/api/teacherArchive/${name}/${id}`, data));
  return request(`/${name}/${id}`, data, 'PUT', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
};

/** 删除子表信息 */
export const deleteSubInfo = async (name: string, id: any) => {
  // return await toastErrorMsg(Http.getInstance().delete(`/api/teacherArchive/${name}/${id}`));
  return request(`/${name}/${id}`, {}, 'DELETE', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
};

//获取设置权限
export async function getAuth() {
  // return await Http.getInstance().get(`/api/teacherArchive/teacherArchiveConfigs/getAuth`);
  return request(`/teacherArchiveConfigs/getAuth`, {}, 'GET', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
}

//保存设置权限
export async function saveAuth(params: any) {
  // return await Http.getInstance().post(`/api/teacherArchive/teacherArchiveConfigs/`, params);
  return request(`/teacherArchiveConfigs`, params, 'POST', {
    spaceType: request.service.teacherArchive,
    showLoading: false,
  });
}
