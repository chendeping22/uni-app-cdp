import { request } from '@/utils/request';

const apiPrefix = '/payslipDetailFacade/';

// 查询有数据的年份
export const findDataYear = () => {
  return request(apiPrefix + 'findDataYear', {}, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};

export function mePages(data) {
  return request(apiPrefix + 'me/pages', data, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
}

export function getDetailInfo(detailId: any) {
  return request(apiPrefix + `me/` + detailId, {}, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
    defaultError: false,
  });
}

export function doConfirm(detailId: any) {
  return request(`${apiPrefix}/me/${detailId}/confirm`, {}, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
}

export function countActualAmount(data) {
  return request(apiPrefix + 'countActualAmount', data, 'POST', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
}

//工资条详情
export function detail(id) {
  return request(apiPrefix + id, {}, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
}

export function getConfig(detailId: any) {
  return request(`/payslipDetails/` + detailId, {}, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
}
