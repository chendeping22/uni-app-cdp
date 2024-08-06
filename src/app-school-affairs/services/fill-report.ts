import { request } from '@/utils/request';

export const getFillReportInfo = (id: string, flowBeforeId: string, fromType?: string) => {
  if (!fromType) {
    return request(`/v1/baseFillReports/${id}/detail`, { flowBeforeId }, 'GET', {
      spaceType: request.service.lowcode,
      defaultError: false,
    });
  } else {
    return request(`/v1/baseFillReports/${id}/detail`, { flowBeforeId, fromType }, 'GET', {
      spaceType: request.service.lowcode,
      defaultError: false,
    });
  }
};
export function getReportList(data: any) {
  if (!data.fromType) {
    return request(
      `/v1/baseFillReports/${data.id}/data/list?flowBeforeId=${data.flowBeforeId}`,
      data,
      'POST',
      {
        spaceType: request.service.lowcode,
        showLoading: false,
      },
    );
  } else {
    return request(
      `/v1/baseFillReports/${data.id}/data/list?flowBeforeId=${data.flowBeforeId}&fromType=${data.fromType}`,
      data,
      'POST',
      {
        spaceType: request.service.lowcode,
        showLoading: false,
      },
    );
  }
}
export function createReportItem(reportId: string, data: any) {
  return request(`/v1/baseFillReports/${reportId}/data/saveOrUpdate`, data, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}
// 更新填报动态数据
export function updateReportItem(reportId: string, dataId: string, data: any) {
  return request(
    `/v1/baseFillReports/${reportId}/data/saveOrUpdate?dataId=${dataId}`,
    data,
    'POST',
    {
      spaceType: request.service.lowcode,
      showLoading: false,
    },
  );
}
// 删除填报动态数据
export function deleteReportItem(reportId: string, flowBeforeId: string, dataId: string) {
  return request(
    `/v1/baseFillReports/${reportId}/data/del?flowBeforeId=${flowBeforeId}&dataId=${dataId}`,
    {},
    'DELETE',
    {
      spaceType: request.service.lowcode,
      showLoading: false,
    },
  );
}
// 提交填报
export function submitReport(fillReportId: string, flowBeforeId: string) {
  return request('/v1/fillReport/actions/commit', { fillReportId, flowBeforeId }, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}
// 结束填报
export function endReport(fillReportId: string) {
  return request('/v1/fillReport/actions/end', { fillReportId }, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}
/////////////////////////////lj start
export const myCount = () => {
  return request(`/v1/fillReportApp/myCount`, {}, 'GET', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
};
export const baseFillReportsList = (prams: any) => {
  return request(`/v1/baseFillReports/list`, prams, 'GET', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
};
export const batchUrgeHandle = (prams: any) => {
  return request(`/v1/fillReportApp/batchUrgeHandle`, prams, 'GET', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
};
export const pageDoFillReport = (prams: any) => {
  return request(`/v1/fillReportApp/actions/pageDoFillReport`, prams, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
};
export const dispatchPageDetail = (prams: any) => {
  return request(`/v1/fillReportApp/actions/dispatchPageDetail`, prams, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: true,
  });
};
export const urgeHandle = (prams: any, reportId: string) => {
  return request(`/v1/baseFillReports/${reportId}/urgeHandle`, prams, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: true,
  });
};
export const dispatchApi = (prams: any) => {
  return request(`/v1/fillReport/actions/dispatch`, prams, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: true,
  });
};
export const selectExclude = (reportId: any) => {
  return request(`/v1/baseFillReports/${reportId}/selectExclude?tag=user,org,stu`, {}, 'GET', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
};

export const getUploadUrl = (params: any) => {
  return request('/files/getUploadUrl', params, 'GET', {
    spaceType: request.service.resource,
    showLoading: false,
    defaultError: false,
  });
};
