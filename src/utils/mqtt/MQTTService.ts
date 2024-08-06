/* eslint-disable */
import { fetClientId } from '@/services/mqtt';
import { loginStore } from '@/store/modules/login';
import { formatDate, getSeq } from './lib/helper';
import { TOPIC, mqtt } from './lib/mqtt';
import type { Callback } from './lib/mqtt/types';

class Mqtt {
  mqtt = mqtt;

  getStoreMqttInfo() {
    const info = loginStore().mqttInfo;
    return {
      ...info,
      accessToken: loginStore().authInfo?.accessToken,
    };
  }

  /**
   * 获取mqtt服务地址
   * @param {String} clientId - 客户端标识，比如 'app-${username}'
   * @param {String} version - mqtt版本，比如 1.0.1
   * @returns {Promise}
   */
  async fetClientId() {
    if (!this.getStoreMqttInfo().mqttUuid) return '';
    try {
      const res = await fetClientId(
        this.getStoreMqttInfo().mqttUuid ?? '',
        this.getStoreMqttInfo().mqttPassword ?? '',
      );
      return res.data as string;
    } catch (e) {
      console.warn('clientId获取失败, mqtt连接必须的参数!!!');
      return '';
    }
  }

  /**
   * mqtt 连接
   * @param {String} version - MQTT版本号
   * @param {String} userId - 用户Id
   * @param {String} password - MQTT密码
   * @param {*} connectCallback - 连接成功回调
   * @param {*} errorCallback - 错误回调（互踢）
   * @returns {undefined}
   */
  async connect(connectCallback: Callback, errorCallback: Callback) {
    // 不缓存 clientId 了
    const clientId = await this.fetClientId();
    // this.store.commit(ENV_COMMITS.setClientId, clientId);
    if (!clientId) console.warn('clientId获取失败, mqtt连接必须的参数!!!');

    // TEST 环境、没有配置服务器地址的情况下使用本地配置 mqtt 地址，其它情况使用 userInfo 返回的地址
    let mqttProtocol = this.getStoreMqttInfo().mqttHostProtocol;
    const mqttServerAddr = this.getStoreMqttInfo().mqttHost;

    // #ifdef MP-WEIXIN || APP-PLUS
    // 小程序和app只能是wxs
    mqttProtocol = 'wxs';
    // #endif

    const mqttUrl = `${mqttProtocol}://${mqttServerAddr}/mqtt`;

    console.log('=================mqtt地址===================', mqttUrl);
    console.log('=================clientId===================', clientId);
    const options = {
      wsOptions: {}, // 只适用于WebSocket连接配置
      keepalive: 50, // 心跳间隔，秒
      reschedulePings: true, // 发送包后重新安排ping消息
      clientId,
      protocolId: 'MQTT',
      protocolVersion: 4, // MQTT 3.1.1 版本
      clean: true, // 注意：只能是true，设置为false，以便在脱机时接收QoS 1和2消息，Broker服务器不支持false，否则提示错误 Error: Connection refused: Server unavailable
      reconnectPeriod: 5000, // 重连间隔, 毫秒
      connectTimeout: 6000, // 连接超时，毫秒
      username: clientId,
      password: this.getStoreMqttInfo().mqttPassword,
      // incomingStore ？？？
      // outgoingStore ？？？
      // queueQoSZero: true, // 如果连接断开，QoS为0的消息xxx？？？
      // customHandleAcks // MQTT 5.0
      // properties // MQTT 5.0
      // authPacket ？？？
      // transformWsUrl: (url, options, client) => url, // 只适用于ws/wss，可用于实现重新连接时可能已过期的签名url
      // resubscribe: true, // 如果连接断开并重新连接，订阅的主题将自动再次订阅
      // 遗言，重连后会发送
      will: {
        topic: `${TOPIC.BROADCAST}/${clientId}/user/disconnect`,
        qos: 1,
        // retain: 1, // 保留标志
        // properties MQTT 5.0
        // 注意：只能传string
        payload: JSON.stringify({
          service: 'user',
          method: 'disconnect',
          seq: getSeq(),
          srcAddr: `0.${clientId}`,
          clientId,
          payload: {
            timestamp: formatDate(new Date()),
            uniqueMsgId: 0,
            token: `${this.getStoreMqttInfo().accessToken}`.split('.')[2], // 遗言给api用
          },
        }),
      },
    };

    mqtt.connect(mqttUrl, options, connectCallback.bind(this, clientId), errorCallback);
  }

  /**
   * 添加消息监听
   * @param {String} key - 关键字
   * @param {Function} callback - 回调函数
   * @returns {undefined}
   */
  on(key: string, listener: Callback) {
    mqtt.on(key, listener);
  }

  /**
   * 移除消息监听
   * @param {String} key - 关键字
   * @param {Function} callback - 回调函数
   * @returns {undefined}
   */
  off(key: string, listener: Callback) {
    mqtt.off(key, listener);
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
  end({ force = false, options, cb = () => {} }: { options: any; force?: boolean; cb?: Callback }) {
    if (!mqtt.end) return;
    mqtt.end({ force, options, cb });
  }

  subscribe(...args: any) {
    mqtt.subscribe.apply(mqtt, args);
  }

  unsubscribe(...args: any) {
    mqtt.unsubscribe.apply(mqtt, args);
  }

  publish(...args: any) {
    mqtt.publish.apply(mqtt, args);
  }
}

export default new Mqtt();
export { TOPIC } from './lib/mqtt';
