import { request } from '@/utils/request';

type TSub = {
  topic: string;
  clientId: string;
  bid: string;
};

/**
 *
 * @param data
 * @returns
 */
export const getMqttConnectInfo = async (clientId: string) => {
  const res = await request(`/mobile/getMqttConnectInfo/${clientId}`, {}, 'GET', {
    showLoading: false,
  });
  return {
    data: res,
  };
};

/**
 * 获取mqtt服务地址
 */
export const fetClientId = async (uuid: string, mqttPwd: string) => {
  const res = await request(`/v2/client/getCommonClientId`, { uuid, mqttPwd }, 'GET', {
    showLoading: false,
    defaultError: false,
  });
  return {
    data: res,
  };
};

/**
 * 发起订阅通知
 */
export const mqttNotifySub = async (data: TSub) => {
  const res = await request('/v2/client/notify/sub', data, 'POST', { showLoading: false });
  return {
    data: res,
  };
};

// 取消订阅通知
export const mqttNotifyUnsub = async (data: TSub) => {
  const res = await request('/v2/client/notify/unsub', data, 'POST', { showLoading: false });
  return {
    data: res,
  };
};
