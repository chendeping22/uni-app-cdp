import { request } from '@/utils/request';

export const loadDevices = (pageNum: number, pageSize: number, spaceId: string) =>
  request(`/airConditioner/pageAirConditioners`, { pageNum, pageSize, spaceId }, 'POST', {
    spaceType: request.service.device,
  });

export const loadGroups = (pageNum: number, pageSize: number) =>
  request(
    `/airConditioner/pageGroups`,
    { pageNum, pageSize, productType: 'AirCondition' },
    'POST',
    {
      spaceType: request.service.device,
    },
  );

// 设备锁定记录
export const loadDeviceLog = (data: any) =>
  request('/controlLog/queryDeviceLog', data, 'POST', { spaceType: request.service.controller });

export const loadMemberLog = (data: any) =>
  request('/controlLog/queryMemberLog', data, 'POST', { spaceType: request.service.controller });

export const loadDeviceProps = (deviceId: string) =>
  request(`/thingModel/actions/device/property`, { deviceId }, 'GET', {
    spaceType: request.service.device,
  });

export const controlDevice = (deviceId: string, params: any) =>
  request(
    `/device/v3/control`,
    {
      deviceId,
      commands: [{ params, method: 'setProp' }],
    },
    'POST',
    {
      spaceType: request.service.building,
      defaultError: false,
      showLoading: false,
    },
  );

export const controlDeviceMultiple = (deviceId: string, props: any[]) => {
  const commands = [] as any[];
  props.forEach(item => commands.push({ params: item, method: 'setProp' }));
  return request(
    `/device/v3/control`,
    {
      deviceId,
      commands,
    },
    'POST',
    {
      spaceType: request.service.building,
      defaultError: false,
      showLoading: false,
    },
  );
};

export const loadGroupLockInfo = (groupId: string) =>
  request(`/airConditioner/getLockedConfigItemByGroupId`, { groupId }, 'GET', {
    spaceType: request.service.device,
  });

export const setGroupLock = (groupId: string, params: any) => {
  const body = { groupId, method: 'setProp', params, clientType: 5 };
  // #ifdef MP-WEIXIN
  body.clientType = 2;
  // #endif
  // #ifdef H5
  body.clientType = 1;
  // #endif
  return request(`/groupDevice/lockedSetting`, body, 'POST', {
    showLoading: false,
    defaultError: false,
    spaceType: request.service.building,
  });
};

export const loadGroupProps = (groupId: string) =>
  request(`/airConditioner/getGroupConfigItemByGroupId`, { groupId }, 'GET', {
    spaceType: request.service.device,
  });

export const controlGroup = (groupId: string, params: any) => {
  const body = { groupId, method: 'setProp', params, clientType: 5 };
  // #ifdef MP-WEIXIN
  body.clientType = 2;
  // #endif
  // #ifdef H5
  body.clientType = 1;
  // #endif
  return request(`/groupDevice/groupControl`, body, 'POST', {
    spaceType: request.service.building,
    defaultError: false,
    showLoading: false,
  });
};
