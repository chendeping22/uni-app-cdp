/* eslint-disable */
/*
 * @Author: linbin@leedarson.com
 * @Date: 2019-07-09 11:05:18
 * Copyright © Leedarson. All rights reserved.
 */

import { log } from '@/utils/tools';
import mqtt from 'mqtt/dist/mqtt.min';
import mqttStateObservable from './mqtt-state-observable';
// TODO: 互踢
class Mqtt {
  client: any;
  options: any;
  listeners: any;
  sequences: any;
  constructor() {
    this.client = null; // mqtt连接实例
    this.options = {}; // 连接mqtt配置选项
    // 监听事件，用于处理非publish返回
    // 需要先添加监听 mqtt.on(method, callback)
    // listeners: {method: [Function]}
    this.listeners = {};
    // 序列号，用于处理publish返回
    // sequences: { [seq]: {resolve, reject, expire} }
    this.sequences = {};
    // 发布超时, 默认不处理
    // this.timeout = 6 * 1000; // 毫秒
  }

  /**
   * 添加被动接受消息，事件队列
   * @param {String} key - 关键字
   * @param {Function} callback - 回调函数
   */
  on(key: string | number, callback: any) {
    if (this.listeners[key]) {
      if (
        !callback ||
        this.listeners[key].find((cb: any) => {
          return cb === callback;
        })
      )
        return;
      this.listeners[key].push(callback);
    } else {
      this.listeners[key] = [callback];
    }
  }

  /**
   * 移除被动接受消息，事件队列
   * @param {String} key - 关键字
   * @param {Function} callback - 回调函数
   */
  off(key: string | number, callback: any) {
    if (Object.prototype.toString.call(callback) === '[object Function]') {
      const callbacks = this.listeners[key] || [];
      this.listeners[key] = callbacks.filter((cb: any) => cb !== callback); // 移除某一个回调
    } else {
      delete this.listeners[key]; // 移除全部回调
    }
  }

  /**
   * MQTT连接
   * @param {*} url - MQTT服务器地址
   * @param {*} options - 选项
   * @param {*} connectCallback - 连接成功回调
   * @param {*} errorCallback - 错误回调（互踢）
   * @returns {undefined}
   */
  connect(
    url: string,
    options = {},
    connectCallback: (arg0: any) => void,
    errorCallback: (arg0: any) => void,
  ) {
    this.options = options;
    // 连接 MQTT

    try {
      log('mqtt start connect -->', url, options);
      this.client = mqtt.connect(url, options);
    } catch (e) {
      log('mqtt connect err <--', e);
    }

    // 连接成功，调用此事件
    this.client.on('connect', (connect: any) => {
      connectCallback(connect);
      log(
        'mqtt connect success.......',
        new Date().getMinutes() + '分',
        new Date().getSeconds() + '秒',
      );
    });

    // 连接成功，调用此事件
    this.client.on('reconnect', () => {
      // if (process.env.NODE_ENV !== 'development') {
      log('mqtt 重连了.......', new Date().getMinutes() + '分', new Date().getSeconds() + '秒');
      // }
    });
    this.client.on('close', () => {
      // if (process.env.NODE_ENV !== 'development') {
      log('mqtt close了........', new Date().getMinutes() + '分', new Date().getSeconds() + '秒');
      // }
    });
    this.client.on('disconnect', () => {
      log('mqtt 断连了..........', new Date().getMinutes() + '分', new Date().getSeconds() + '秒');
    });
    this.client.on('offline', () => {
      log('mqtt 离线了...........', new Date().getMinutes() + '分', new Date().getSeconds() + '秒');
    });
    this.client.on('error', (error: any) => {
      log('mqtt error...........', new Date().getMinutes() + '分', new Date().getSeconds() + '秒');
      errorCallback(error);
      this.client.end();
    });
    this.client.on('end', () => {
      errorCallback('end');
      log('mqtt end.了...........', new Date().getMinutes() + '分', new Date().getSeconds() + '秒');
    });
    // 所有订阅消息，都会调用此事件（我们是模糊订阅）
    this.client.on('message', (topic: string, message: any, packet: any) => {
      // 1. Buffer --> Object
      const _message = JSON.parse(String(message)); // ArrayBuffer
      console.log('🚀 ~ file: Mqtt.ts ~ line 118 ~ Mqtt ~ this.client.on ~ _message', _message);
      // this.store.commit(MQTT_COMMITS.setData, _message);
      mqttStateObservable.setTopic(_message);
      // 2. 日志
      // 3. 处理resolve||reject返回（publish）
      const { seq } = _message;
      const sequence = this.sequences[seq];
      if (sequence) {
        const { resolve, reject, expire } = sequence;
        delete this.sequences[seq];
        if (Date.now() < expire) {
          resolve(_message);
        } else {
          reject('[MQTT] publish timeout');
        }
        return;
      }
      // 4. 处理lister返回（listener/on）
      const method = topic.split('/').pop() as string;
      (this.listeners[method] || []).forEach((listener: (arg0: any) => void) => {
        listener(_message);
      });
    });
    // 所有发布消息，都会调用此事件
    this.client.on('packetsend', () => {});
    // 所有接收消息，都会调用此事件
    this.client.on('packetreceive', () => {});
    return this.client;
  }

  /**
   * 发布消息
   * @param {String} topic - 发布主题
   * @param {Object} message - 发布消息
   * @param {Object} options - 发布选项 {qos, retain, dup, properties, cbStorePut}
   * @param {Number} options.qos - QoS级别，默认0
   * @param {Boolean} options.retain - 保留标志，默认false
   * @param {Boolean} options.dup - 是否重复标志，默认false
   * @param {Object} options.properties - MQTT 5.0
   * @param {Function} options.cbStorePut - 如果QoS为1或2，则在将消息放入outgoingStore时触发。
   * @param {Function} callback - function(err), 回调会在QoS处理完成或在下次处理前发生（QoS为0时）. An error occurs if client is disconnecting.
   * @param {Number} timeout - 超时，毫秒，默认不做超时处理
   * @returns {Promise}
   */
  publish({ topic, message, options = { qos: 1, retain: false, dup: false } }: any, timeout: any) {
    // iot/v1/c/[deviceId]/xxx  (用于发送给设备消息)
    // iot/v1/s/[userId]/xxx  (用于发送给云端消息)
    // iot/v1/cb/[userId]/xxx  (用于APP广播消息)
    const { username, clientId } = this.options;
    // const seq = getSeq();
    const seq = '1';
    message.clientId = clientId;
    message.seq = seq;
    message.srcAddr = `0.${username}`;
    if (this.client === null) {
      return Promise.reject('[MQTT] [call] [-->] client is null.');
    }
    return new Promise((resolve, reject) => {
      // 1. 回调处理
      const callback = (error: any) => {
        if (error) {
          reject(error);
        }
      };
      // 2. 序列列处理  注意：真实resolve和reject在message事件里面处理
      this.sequences[seq] = {
        resolve,
        reject,
        expire: Date.now() + (timeout || Date.now()), // 毫秒
      };
      // 3. 真正发布
      this.client.publish(topic, JSON.stringify(message), options, callback);
    });
  }

  /**
   * 订阅消息
   * @param {String|Array|Object} topic - 订阅主题（+ for single level， # for multi level）
   * @param {Object} options - 订阅选项 {qos, nl, rap, rh, properties}
   * @param {Number} options.qos - QoS级别，默认0
   * @param {Boolean} options.nl - No Local MQTT 5.0 flag
   * @param {Boolean} options.rap - Retain as Published MQTT 5.0 flag
   * @param {*} options.rh - Retain Handling MQTT 5.0
   * @param {Object} options.properties - 属性
   * @param {Number} options.properties.subscriptionIdentifier - 表示订阅的标识符
   * @param {Object} options.properties.userProperties - 用户属性，键值对
   * @param {Function} callback - function (err, granted) 订阅确认触发回调
   * @param {*} callback.err - 订阅错误或client断开连接时发生的错误
   * @param {Object[]} callback.granted - [{topic, qos}]
   * @param {String} callback.granted.topic - 订阅主题
   * @param {Number} callback.granted.qos - qos是被授予的qos级别
   * @param {Function} callback - function(err), fired when the QoS handling completes, or at the next tick if QoS 0. An error occurs if client is disconnecting.
   * @returns {Promise}
   */
  subscribe({ topic, options = { qos: 1 } }: any) {
    // iot/v1/c/[userId]/# （用于接收云端和设备发给APP的消息）
    // iot/v1/cb/[deviceId]/#  (用于接收设备的广播)

    if (this.client == null) {
      return;
      // return Promise.reject('[MQTT] [call] [subscribe] client is null.');
    }

    return new Promise((resolve, reject) => {
      const callback = (error: any, granted: unknown) => {
        if (error) {
          reject(error);
        } else {
          resolve(granted);
        }
      };
      this.client.subscribe(topic, options, callback);
    });
  }

  /**
   * 取消订阅
   * @param {String|Array} topic - 订阅主题
   * @param {Object} options - 取消订阅选项
   * @param {Object} options.properties - 属性
   * @param {Object} options.properties.userProperties - 用户属性，键值对
   * @param {Function} callback - function (err) 取消订阅确认触发回调，如果client断开连接会发生一个错误
   * @returns {undefined}
   */
  unsubscribe({ topic, options = {} }: any) {
    return new Promise((resolve, reject) => {
      const callback = (error: any, result: unknown) => {
        return error ? reject(error) : resolve(result);
      };
      this.client.unsubscribe(topic, options, callback);
    });
  }

  /**
   * 关闭连接
   * @param {Boolean} force - 如果设置为true，立即关闭client，不会等待已发送消息回复确认，这个参数是可选的。
   * @param {Object} options - 断开连接选项
   * @param {Number} options.reasonCode - 断开连接原因码
   * @param {Object} options.properties - 属性
   * @param {Number} options.properties.sessionExpiryInterval - 表示会话过期间隔(以秒为单位)
   * @param {String} options.properties.reasonString - 表示断开连接的原因
   * @param {Object} options.properties.userProperties - 用户属性，键值对
   * @param {String} options.properties.serverReference - 客户端可以使用该字符串标识要使用的其它服务器
   * @param {Function} cb - function () 将在客户端关闭时调用。这个参数是可选的
   */
  end({ force = false, options, cb = () => {} }: any) {
    this.client?.end(force, options, () => {
      this.listeners = {};
      cb();
    });
    mqttStateObservable.setIsConnected(false);
  }

  /**
   * 从outgoingStore中删除一条消息。如果消息被删除，将调用带错误的传出回调(“Message remove”)。
   * @param {*} mid - outgoingStore中消息的messageId
   */
  removeOutgoingMessage(mid: any) {
    this.client.removeOutgoingMessage(mid);
  }

  /**
   * 使用与Connect()相同的选项再次连接
   */
  reconnect() {
    this.client.reconnect();
  }

  /**
   * Handle messages with backpressure support, one at a time. Override at will, but always call callback, or the client will hang.
   * @param {Object} packet
   * @param {Function} callback
   */
  handleMessage({ packet, callback = () => {} }: any) {
    this.client.handleMessage(packet, callback);
  }

  /**
   * 如果client是连接，则将其设置为true。否则false。
   */
  get connected() {
    return this.client && this.client.connected; // client 默认值为null,作为一个getter直接，取值某些情况会报错
  }

  /**
   * 获取最后一个消息id。这仅适用于已发送的消息。
   */
  getLastMessageId() {
    return this.client.getLastMessageId();
  }

  /**
   * 如果client试图重新连接到服务器，则将其设置为true。否则false。
   */
  get reconnecting() {
    return this.client.reconnecting;
  }
}

export default Mqtt;
