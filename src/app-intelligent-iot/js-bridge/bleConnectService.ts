import { callBridge } from '@/js-bridge/call-bridge';
import { callNative } from '@/js-bridge/call-native';
import { Action, Service } from '@/js-bridge/enums';
import { log } from '@/utils/tools';

export type Callback = (...args: any[]) => void;

export const search = (callback: Callback) => {
  callNative(
    {
      service: Service.ble,
      action: Action.bleSearch,
    },
    res => {
      const data = { data: res };
      log('search success', res, data, typeof callback);
      callback(data);
    },
    err => {
      log('err', err);
    },
  );
};

/**
 * 建立BLE连接
 * @param callBack {Callback}请求回调
 */
export const connect = (data: { id: string; uuid: string }, callback: Callback) => {
  callBridge({
    service: Service.ble,
    action: Action.bleConnect,
    data: {
      deviceId: data.id,
      uuid: data.uuid ?? '',
    },
  })
    .then(res => {
      callback({ code: '0', data: res });
    })
    .catch(err => {
      callback(err);
    });
};
/**
 * 重新建立BLE连接
 * @param callBack {Callback}请求回调
 */
export const reconnect = (id: string, callback: Callback) => {
  callBridge({
    service: Service.ble,
    action: Action.bleReConnect,
    data: {
      deviceId: id,
    },
  })
    .then(res => {
      callback({ data: res });
    })
    .catch(err => {
      callback(err);
    });
};
/**
 * 断开BLE连接
 * @param callBack {Callback}请求回调
 */
export const disconnect = (id: string, callback: Callback) => {
  callBridge({
    service: Service.ble,
    action: Action.bleDisConnect,
    data: {
      deviceId: id,
    },
  })
    .then(res => {
      callback({ data: res });
    })
    .catch(err => {
      callback(err);
    });
};

/**
 * BLE发送消息
 * @param topic {string} topic 订阅主题---BLE不需要
 * @param message {object} 消息内容
 * @param timeout {number} 超时时间
 * @param callBack {Callback}请求回调
 */
export const publish = (id: string, message: any, callback: Callback) => {
  callBridge({
    service: Service.ble,
    action: Action.blePublish,
    data: {
      deviceId: id,
      data: message,
    },
  })
    .then(res => {
      callback({ code: 0, data: res });
    })
    .catch(err => {
      callback(err);
    });
};
