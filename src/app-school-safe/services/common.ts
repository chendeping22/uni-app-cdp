import { request } from '@/utils/request';

// 获取系统配置
export const getAllSystemConfig = () => {
  return request<{ algorithm: string }>('/v2/systemConfigs/actions/findAllCfg', {}, 'GET', {
    spaceType: request.service.auth,
  });
};

// 获取告警类型列表
export const getAlarmTypeList = (applicationId = -4) => {
  return request(`/v1/alarm/categories/actions/findAllCategories`, { applicationId }, 'GET', {
    spaceType: request.service.alarm,
  });
};

// 获取告警等级信息
export const getAlarmLevels = () => {
  return request(`/v1/system/alarm/levels/list`, {}, 'POST', {
    spaceType: request.service.alarm,
  });
};

export type TPlayerInfo = {
  mainUrl?: string; // 主码流地址
  subUrl?: string; // 子码流地址
  intranetMainUrl?: string; // 内网主码流
  intranetSubUrl?: string; // 内网子码流
  intranetUeigUrl?: string; // 内网ueig地址 ping用
  deviceExist: boolean; // 设备是否存在，true为存在，false为不存在
};

// 获取设备直播地址
export const getPlayerInfo = (deviceId: string) => {
  return request<TPlayerInfo>(`/v1/ifsVideos/actions/url/${deviceId}`, {}, 'POST', {
    spaceType: request.service.sas,
  });
};
