import { request } from '@/utils/request';

/**
 * 访客信息
 */
export type TVisitor = {
  submitter: number; // 是否是预约人 0 随行人 1 预约人
  visitStatus?: number; // 访问状态 1 未来访 2 已来访 3 已签退  4 已过期
  visitorName: string; // 访客姓名
  visitorTel: string; // 访客电话
  visitorImageUrl?: string; // 预约人头像
  visitorImageId?: string; // 预约人头像ID
  certificateType?: number; // 证件类型
  certificateNumber?: string; // 证件号
  vehicleNo?: string; // 车牌号
};

/**
 * 访问记录
 */
export type TTrace = {
  visitorName: string; // 访客名称
  content: string; // 记录内容 (签到 签退 自动签离)
  signTime: number; // 记录打卡时间
  temperature?: number; // 体温
};

/**
 * 来源访问信息
 */
export type TSourceInfo = {
  visitorSource: number; // 访问申请来源  0 邀请 1 扫码
  locationId: string; // 项目ID
  locationName: string; // 项目名称
  hostName?: string; // 被访人名称
  hostTel?: string; // 被访人手机号
  inviteToken?: string; // 加密token
  expired: number; // 是否有效  0 有效 1 失效
  faceSwitch: number; // 人脸开关 0 关闭 1 打开
};

/**
 * 预约单信息
 */
export type TApplyInfo = {
  id?: string; // 申请单id
  locationId: string; // 被访问的项目ID
  visitorName: string; // 访客姓名
  visitBeginTime: number; // 拜访开始时间
  visitEndTime: number; // 拜访结束时间
  submitTime?: number; // 提交时间
  visitStatus: number; // 访问状态 -1 已驳回 0 待审核  1 未来访 2 已来访 3 已签退  4 已过期
  [key: string]: any;
};

/**
 * 获取预约列表
 */
export const fetchApplyList = (params: {
  pageSize: number;
  pageNum: number;
  tag: number; // 0 历史记录 1 待处理 2 已预约
}) => {
  return request<{
    result: TApplyInfo[];
  }>('/visitorRecords/frontend/action/list/app', params, 'GET', {
    showLoading: true,
    spaceType: request.service.ioc,
  });
};

/**
 * 获取邀请信息
 */
export const fetchInviteInfo = () => {
  return request<TSourceInfo>('/visitor/invite/frontend/invite', null, 'GET', {
    showLoading: true,
    spaceType: request.service.ioc,
  });
};

/**
 * 短信邀请
 */
export const inviteBySms = (tels: string[]) => {
  return request('/visitor/invite/frontend/invite/sms', tels, 'POST', {
    spaceType: request.service.ioc,
  });
};

/** 用户职位 */
export const getPositionInfoByUserId = () =>
  request(`/v2/teachers/actions/getPositionInfoByUserId`, {}, 'GET', {
    spaceType: request.service.campusbase,
  });
