import { request } from '@/utils/request';

/** 审批-撤回 */
export function getWorkOrderWithdraw(orderId: string) {
  return request(`/workflow/workOrder/withdraw/${orderId}`, {}, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: false,
    defaultError: false,
  });
}

/** 审批-催办 */
export function getFlowLaunchPress(orderId: string) {
  return request(`/workflow/Engine/FlowLaunch/Press/${orderId}`, {}, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: false,
    defaultError: false,
  });
}

/** 审批-驳回 */
export function getWorkOrderReject(params: {
  orderId: string;
  data: { comment?: string; fileIds?: any[] };
}) {
  return request(`/workflow/workOrder/reject/${params?.orderId}`, params?.data, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: false,
    defaultError: false,
  });
}

/** 审批-同意 */
export function getWorkOrderCommit(params: {
  orderId: string;
  data: { comment?: string; fileIds?: any[] };
}) {
  return request(`/workflow/workOrder/commit/${params?.orderId}`, params?.data, 'POST', {
    spaceType: request.service.lowcode,
    showLoading: false,
    defaultError: false,
  });
}

/** 采购审批-同意 */
export function getApprovalWorkOrderCommit(params: {
  orderId: string;
  data: { comment?: string; fileIds?: any[] };
  formData?: any;
}) {
  return request(
    `/assetPurchases/commit/${params?.orderId}`,
    {
      workOrderCommit: params?.data,
      formData: params?.formData,
    },
    'POST',
    {
      spaceType: request.service.school,
      showLoading: false,
      defaultError: false,
    },
  );
}
