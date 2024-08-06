import { request } from '@/utils/request';

// 获取工单流程节点人员处理信息  data:{nodeCode,id} id工单id也就是taskId，nodeCode不传取所有
export function getTaskNodeHandleInfo(data: any) {
  return request(`/workflow/Engine/FlowBefore/v2/${data.id}/taskNodeHandleInfo`, data, 'GET', {
    spaceType: request.service.lowcode,
  });
}

export function getFlowBeforeInfoId(id: string) {
  return request(`/workflow/Engine/FlowBefore/infoId/${id}`, { type: 0 }, 'GET', {
    spaceType: request.service.lowcode,
  });
}

// 获取待我审批信息
export function getFlowBeforeInfo(id: string, data: any) {
  return request(`/workflow/Engine/FlowBefore/${id}`, data, 'GET', {
    spaceType: request.service.lowcode,
  });
}
