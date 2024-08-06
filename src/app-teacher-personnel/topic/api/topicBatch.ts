import { request } from '@/utils/request';

const prefix = '/topicBatchs/';

// 分页查询
export const queryPage = (params: any) => {
  // return Http.getInstance().post(prefix + 'queryPage', params);
  return request(prefix + 'queryPage', params, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

//详情 type(manage/mine/declare)不传相当于不走权限判断 source: 1app 0web
export const detail = (id: any, type?: string) => {
  // return Http.getInstance().get(prefix + id);
  const params = type ? { source: 1, type } : { source: 1 };
  return request(prefix + id, params, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
    defaultError: false,
  });
};

//新增
export const save = (params: any) => {
  // return Http.getInstance().post(prefix, params);
  return request(prefix, params, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

//修改
export const update = (params: any) => {
  // return Http.getInstance().put(prefix + params.id, params);
  return request(prefix + params.id, params, 'PUT', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

//批量删除
export const deleteBatch = (ids: any) => {
  // return Http.getInstance().delete(prefix + ids[0]);
  return request(prefix + ids[0], {}, 'DELETE', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

//修改截止时间
export const modifyDeadline = (id: any, params: any) => {
  // return toastErrorMsg(Http.getInstance().put(prefix + id + '/actions/modifyDeadline', params));
  return request(prefix + id + '/actions/modifyDeadline', params, 'PUT', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

//进入下一阶段预校验
export const nextStageCheck = (id: any, next: number) => {
  // return Http.getInstance().get(prefix + id + '/actions/nextStageCheck');
  return request(prefix + id + `/actions/nextStageCheck?next=${next}`, {}, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

//进入下一阶段
export const nextStage = (id: any, next: number) => {
  // return Http.getInstance().post(prefix + id + '/actions/nextStage');
  return request(prefix + id + `/actions/nextStage?next=${next}`, {}, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

//通知给相关人员
export const forward = (id: any, params: any) => {
  // return Http.getInstance().post(prefix + id + '/actions/forward', params);
  return request(prefix + id + '/actions/forward', params, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

export const checkManage = () => {
  return request(prefix + '/actions/checkManage', {}, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};
