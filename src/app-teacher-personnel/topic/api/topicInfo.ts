import { request } from '@/utils/request';

const prefix = '/topicInfos/';

// 分页查询
export const queryPage = (params: any) => {
  return request(prefix + 'queryPage', params, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

//详情
export const getTopicDetail = (id: any, showLoading = true) => {
  return request(prefix + id, { source: 1 }, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: showLoading,
    defaultError: false,
  });
};

// 新增
export const save = (params: any) => {
  // return toastErrorMsg(Http.getInstance().post(prefix, params));
  return request(prefix, params, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

// 编辑
export const update = (id: any, params: any) => {
  // return toastErrorMsg(Http.getInstance().put(prefix + id, params));
  return request(prefix + id, params, 'PUT', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

// 删除
export const deleteTopic = (id: any) => {
  // return toastErrorMsg(Http.getInstance().delete(prefix + ids[0]));
  return request(prefix + id, {}, 'DELETE', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

// 撤回至草稿
export const withdraw = (id: any) => {
  return request(`${prefix}${id}/actions/withdraw`, {}, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

export const addTrend = (data: any) => {
  return request(`/topicTrendContents`, data, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};
export const editTrend = (id: string, data: any) => {
  return request(`/topicTrendContents/${id}`, data, 'PUT', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};
export const deleteTrend = (id: string) => {
  return request(`/topicTrendContents/${id}`, {}, 'DELETE', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

export const updateMembers = (id: string, data: any[]) => {
  // return toastErrorMsg(Http.getInstance().put(`${prefix}/${id}/actions/updateMembers`, data));
  return request(`${prefix}/${id}/actions/updateMembers`, data, 'PUT', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

export const addMaterialsFile = (id: string, data: any) => {
  return request(`/topicMaterials/${id}/actions/add`, data, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

export const deleteMaterialsFile = (id: string, data: any) => {
  return request(`/topicMaterials/${id}/actions/del`, data, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

/** 驳回申请 */
export const reject = (id: string) => {
  return request(`/topicInfos/${id}/actions/reject`, {}, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

/** 通过申请、确认立项 */
export const approve = (id: string) => {
  return request(`/topicInfos/${id}/actions/approve`, {}, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

/** 撤销立项 */
export const revoke = (id: string) => {
  return request(`/topicInfos/${id}/actions/revoke`, {}, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

/** 中期检查-成绩评定 */
export const termEvaluate = (id: string, score: number) => {
  return request(`/topicInfos/${id}/actions/termEvaluate?score=${score}`, {}, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};

/** 结题鉴定-成绩评定 */
export const authenticateEvaluate = (id: string, score: number) => {
  return request(`/topicInfos/${id}/actions/authenticateEvaluate?score=${score}`, {}, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: true,
  });
};
