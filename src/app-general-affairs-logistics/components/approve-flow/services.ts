import { request } from '@/utils/request';

/** 获取节点统计数 */
export function fetchFlowTaskStatistics(orderId?: string) {
  return request(`/workflow/Engine/FlowTask/static/${orderId}`, {}, 'GET', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}

/** 审批流程 */
export function fetchFlowTaskNodeHandleInfo(orderId?: string) {
  return request(`/workflow/Engine/FlowBefore/v2/${orderId}/taskNodeHandleInfo`, {}, 'GET', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}

/** 审批详情 */
export function fetchFlowInfoDetail(orderId?: string) {
  return request(`/assetManager/flowInfo/detail/${orderId}`, {}, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
  });
}

/** 通用审批详情接口-获取审批flowId */
export function fetchFlowBeforeInfoId(id?: string) {
  return request(`/workflow/Engine/FlowBefore/infoId/${id}`, { type: 0 }, 'GET', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}

/** 通用审批详情接口-获取审批详情 */
export function fetchFlowBeforeInfo(id: string, params) {
  return request(`/workflow/Engine/FlowBefore/${id}`, params, 'GET', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}
