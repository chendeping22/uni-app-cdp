import { request } from '@/utils/request';

/**获取审批详情入参ids */
export function fetchWorkInfoId(orderId?: string, type?: number) {
  return request(`/workflow/Engine/FlowBefore/infoId/${orderId}`, { type: type ?? 1 }, 'GET', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}

/** 审批详情 */
export function fetchWorkOrderInfo(
  orderId: string,
  data: {
    taskNodeId: string;
    taskOperatorId: string;
    flowId: string;
  },
) {
  return request(`/workflow/Engine/FlowBefore/${orderId}`, data, 'GET', {
    spaceType: request.service.lowcode,
    showLoading: false,
  });
}

/** 审批节点详情 */
export function fetchFlowTaskNodes(data: { id: string; nodeCode: string }) {
  return request(`/assetManager/flowInfo/detail/${data?.id}`, data, 'GET', {
    spaceType: request.service.school,
    showLoading: false,
  });
}
