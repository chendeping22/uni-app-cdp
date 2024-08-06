import type { ETargetType } from '@/store/modules/workbench';
import { request } from '@/utils/request';

type IListParams = {
  locationId?: string;
  startTime?: string;
  endTime?: string;
  pageNum?: number;
  pageSize?: number;
  readStatus?: number; //  0未读；1已读
  title?: string;
  userType?: number;
  userId?: string;
  clientType?: 'WEB' | 'APP' | 'WXA' | string; // 客户端类型 'WEB' | 'APP' | 'WXA',
  groupType?: string;
};

export type ListItemNew = {
  applicationId: number; // 应用ID
  locationId: string; // 组织ID
  id: number; // 消息ID
  title: string; // 标题
  content: string; // 内容
  notifyTime: number; // 通知时间
  target: string; // 打开方式
  path: string; // 路径
};

export type ListItem = {
  applicationId?: number; // 应用ID
  applicationCode: string; // 应用code
  bizCode: string; // biz_code（业务代码(由业务定，用于JSON格式解析用)）
  bizDataJson: string; // 业务数据
  bizSeq: string; // 业务SEQ
  title: string; // 标题
  content: string; // 内容
  updateBy: string; // 修改人
  updateTime: string;
  createBy: string;
  createTime: string;
  displayMode: number; // 显示方式（1:手动2:/自动消失）
  exceptionInfo: string; // 异常信息
  id: number; // 消息ID
  ids: number[];
  locationId: string; // 组织ID
  notifyStatus: number; // 通知状态(0:未通知1:已通知、2:通知失败)
  notifyTime: number; // 通知时间
  readStatus: number; // 0:未读,1:已读
  retryCount: number; // 重试次数
  current: number; // 当前页
  size: number; // 分页大小
  userId: string; // 用户ID
  userType: string; // 用户类型1：IMP用户 2：C端用户
  // 告警使用
  videoFileId: string; // 视频地址
  videoFileUrl: string; // 视频地址URL
  videoBuildStatus: number; // 视频生成状态（0：无视频文件 1：已生成 2：生成中）
  imageFileId: string; // 图片地址
  imageFileUrl: string; // 图片地址URL
  // 新基座补充字段
  target: ETargetType; // 打开方式
  path: string; // 路径
};

type ListResp = {
  endRow: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  result: ListItem[];
  startRow: number;
  total: number;
};

type IUnreadNumParams = {
  userId: string; // 用户id
  userType: number; // 消息有自己的userType  b端用户就是老师都是1  c端用户学生家长就是2
  clientType: 'WEB' | 'APP' | 'WXA' | string; // 客户端类型 'WEB' | 'APP' | 'WXA'
};
export type IUnreadNumParamsFilter = IUnreadNumParams & {
  filterBizGroupCode?: string; // 过滤传入的bizGroupCode的值,多个以逗号隔开（例如不要云上课堂，则传入对应bizCode：cloudClass
};

/**
 * 根据用户id获取未读通知数（旧）
 * @param params
 * @returns
 */
export const getUnreadNumByUser = (params: IUnreadNumParams) =>
  request<number>('/v1/systemMessages/actions/getUnreadNumByUser', params, 'GET', {
    spaceType: request.service.building,
    showLoading: false,
  });

/**
 * 根据用户id获取未读通知数（新）
 * 旧接口还是会保留，只是不支持过滤bizGroupCode。新接口两种都支持，如果不过滤，放空即可
 * @param params
 * @returns
 */
export const getUnreadNumByUserFilter = (params: IUnreadNumParamsFilter) =>
  request<number>('/v1/systemMessages/countUnreadQty', params, 'GET', {
    spaceType: request.service.message,
    showLoading: false,
  });

/**
 * 获取通知类型
 * 旧接口还是会保留，只是不支持过滤bizGroupCode。新接口两种都支持，如果不过滤，放空即可
 * @returns
 */
export const getNotifyTypeGroupFilter = (params: IUnreadNumParamsFilter) => {
  return request<any[]>('/v1/systemMessages/groupByBizGroupCode', params, 'GET', {
    spaceType: request.service.message,
  });
};

/**
 * 获取通知详情
 * @param id
 * @returns
 */
export const getNotificationDetail = (id: string) =>
  request<ListItem>(`/v1/systemMessages/${id}`, {}, 'GET', {
    spaceType: request.service.building,
  });

/**
 * 全部通知已读（新）
 * @returns number
 */
export const markReadFilterBizGroupCode = (params: IUnreadNumParams) =>
  request(
    `/v1/systemMessages/actions/markReadFilterBizGroupCode?userId=${params.userId}&clientType=${params.clientType}&userType=${params.userType}&filterBizGroupCode=${params.filterBizGroupCode}`,
    params,
    'POST',
    {
      spaceType: request.service.message,
    },
  );

export type IReadMsgParams = {
  userId: string; // 用户id
  userType: number; // 消息有自己的userType  b端用户就是老师都是1  c端用户学生家长就是2
  clientType: 'WEB' | 'APP' | 'WXA' | string; // 客户端类型 'WEB' | 'APP' | 'WXA'
  locationId: string;
  bizGroupCode: string;
};

/**
 * 应用消息已读
 * @param params
 * @returns
 */
export const readMsgRequest = (params: IReadMsgParams) =>
  request(
    `/v1/systemMessages/actions/readMsg?userId=${params.userId}&clientType=${params.clientType}&userType=${params.userType}&locationId=${params.locationId}&bizGroupCode=${params.bizGroupCode}`,
    params,
    'POST',
    {
      spaceType: request.service.message,
      showLoading: true,
      defaultError: true,
    },
  );

/**
 * 通知中心列表
 * @param params
 * @returns
 */
export const getNotificationList = (params: IListParams) =>
  request<ListResp>('/v1/systemMessages/pageByLocation', params, 'POST', {
    spaceType: request.service.building,
  });

/**
 * 单个通知已读
 * @param id
 * @returns
 */
export const markRead = (id: number) =>
  request(`/v1/systemMessages/${id}/actions/read`, {}, 'GET', {
    spaceType: request.service.building,
  });

/**
 * 全部通知已读
 * @returns number
 */
export const markReadAll = (params: IUnreadNumParams) =>
  request('/v1/systemMessages/actions/markReadByLocation', params, 'GET', {
    spaceType: request.service.building,
  });
