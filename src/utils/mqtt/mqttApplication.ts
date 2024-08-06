import { mqttNotifySub, mqttNotifyUnsub } from '@/services/mqtt';
import { log } from '../tools';
import MQTTService from './MQTTService';
import mqttStateObservable from './lib/mqtt/mqtt-state-observable';
import type { Callback } from './lib/mqtt/types';

type Topics = string[] | string;
type MqttActions = Record<string, Callback>;
type Subscribe = {
  topics: Topics;
  mqttActions: MqttActions;
  isConnect: boolean;
};
type Unsubscribe = {
  topics: Topics;
  mqttActions: MqttActions;
  isConnect: boolean;
};
type TCommon = Record<string, any>;
type TSub = {
  topic: string;
  clientId?: string;
  bid: string;
};

let t: unknown = undefined;

class MqttApplication {
  mqttServiceInstance: typeof MQTTService;

  public uuid = 0;

  private apiDepJson: TCommon = {};

  private mqttId = ''; // mqttUuid

  private topicPrefix = 'iot/v1/c'; // 客户端订阅必须从这个主题出去

  // APP与login要拆分，不然APP进行APP中import对应文件会初始化该实例，导致mqttId为undefined
  private noUnSubscribeTopics: string[] = [];

  private filterTopics = (topics: Topics) => {
    if (typeof topics === 'string') {
      return this.noUnSubscribeTopics.includes(topics) ? undefined : topics;
    }
    const filterResult = topics.filter(item => !this.noUnSubscribeTopics.includes(item));
    return filterResult.length ? filterResult : undefined;
  };

  private combineTopic = (topic: string) => {
    // return [this.topicPrefix, this.mqttId, topic].join('/');
    return [this.topicPrefix, this.mqttId, topic].join('/');
  };

  private transTopics2Subscribe = (topics: Topics) => {
    // topics: Topics
    return () =>
      this.mqttServiceInstance.subscribe({
        topic: this.combineTopic(topics as string),
      });
    // if (typeof topics === 'string') {
    //   return () => this.mqttServiceInstance.subscribe({ topic: this.combineTopic(topics) });
    // }
    // return () => {
    //   topics.forEach(item => {
    //     this.mqttServiceInstance.subscribe({ topic: this.combineTopic(item) });
    //   });
    // };
  };

  private unsubscribeTopics = (topics: Topics) => {
    //  1、黑名单过滤
    const filterTopics: Topics | undefined = this.filterTopics(topics);
    if (!filterTopics) return;
    this.mqttServiceInstance.unsubscribe({ topic: this.combineTopic('#') });
    // if (typeof filterTopics === 'string') {
    //   this.mqttServiceInstance.unsubscribe({ topic: this.combineTopic(filterTopics) });
    //   return;
    // }
    // filterTopics.forEach(topic => {
    //   this.mqttServiceInstance.unsubscribe({ topic: this.combineTopic(topic) });
    // });
  };

  private getTopicKey = (topic: string) => {
    return topic.substring(topic.lastIndexOf('/') + 1);
  };

  private getMqttCallbackParams = (topic: string, actions: string[]) => {
    const callbackKey = this.getTopicKey(topic);
    const compareTopicName = topic.split('/').join('_').toUpperCase();
    const actionName = actions.find((action: string) => action.includes(compareTopicName));
    return [callbackKey, actionName];
  };

  public getStoreMqttInfo = () => {
    return this.mqttServiceInstance.getStoreMqttInfo();
  };

  public clearInterval() {
    clearInterval(t as number);
  }

  // 切换项目或初始化连接mqtt成功后，轮询守护mqtt连接状态，（小程序、app须要这个）
  public checkMqttStatusOfRetryMqtt = (times = 0) => {
    log('轮询守护mqtt连接开始');
    this.clearInterval();
    t = setInterval(() => {
      if (!this.mqttStateObservable.getIsConnected()) {
        if (this.getStoreMqttInfo().mqttUuid) {
          log(
            '<imp-mqtt-subscriber> 重新连接 mqtt。',
            new Date().getMinutes() + '分',
            new Date().getSeconds() + '秒',
          );
          // this.store.commit(ENV_COMMITS.setClientId, '');
          this.mqttServiceInstance?.end({
            force: true,
            options: {},
          });
          this.mqttSubscribe(
            {
              topics: [],
              mqttActions: {},
              isConnect: true,
            },
            () => {
              this.checkMqttStatusOfRetryMqtt(times);
            },
          );
        }
      }
    }, times);
  };

  /**
   * @description 通知后端接口，订阅交给调用层；取消订阅托管内部
   * @param {boolean} isBind 控制是订阅还是取消订阅
   * @param {TSub} sub 通知订阅的参数，仅对订阅接口生效{topic:string, bid: 业务id}
   */
  public notifySubOrUnSubToEndApi = (isBind: boolean, sub?: TSub) => {
    if (isBind) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { topic, bid } = sub!;
      if (!this.apiDepJson[this.uuid]) {
        this.apiDepJson[this.uuid] = [];
      }
      this.apiDepJson[this.uuid].push({ topic, bid });
      this.manualSubOrUnsub(isBind, sub);
      return;
    }

    if (!this.getStoreMqttInfo().accessToken) return; // 退出，导致token失效，接口
    // 依赖收集 -> 自动卸载 - mqttCallbackOperate 中执行
    log('🚀 已订阅的主题总数：>>>>>>>>>>>', this.apiDepJson);
    const uuidToTopics = this.apiDepJson[this.uuid] || [];
    log('🚀 即将待取消主题数：>>>>>>>>>>>', uuidToTopics);
    uuidToTopics.forEach((unsub: Omit<TSub, 'clientId'>) => this.manualSubOrUnsub(isBind, unsub));
    this.apiDepJson[this.uuid] = null;
    delete this.apiDepJson[this.uuid];
  };

  public manualSubOrUnsub = (isBind: boolean, sub?: Omit<TSub, 'clientId'>) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { topic, bid } = sub!;
    const universal = isBind ? mqttNotifySub : mqttNotifyUnsub; // 订阅|取消订阅
    const PARAMS: TSub = {
      topic: [this.topicPrefix, 'uuid', topic].join('/'),
      clientId: this.mqttId,
      bid,
    };
    if (!this.getStoreMqttInfo || !this.mqttId) return; // 退出，导致token失效，接口
    universal(PARAMS as any).catch(({ desc }: any) => {
      log(`${isBind ? '' : '取消'}订阅接口挂了, ${desc}！`);
    });
  };

  private mqttCallbackOperate = (isBind: boolean, topics: Topics, mqttActions: MqttActions) => {
    // 先on、off回调 => 再通知取消订阅接口
    const actions = Object.keys(mqttActions);
    const mqttOperate = isBind ? this.mqttServiceInstance.on : this.mqttServiceInstance.off;
    if (typeof topics === 'string') {
      const [callbackKey, actionName] = this.getMqttCallbackParams(topics, actions);
      if (!actionName) return;
      mqttOperate(callbackKey as any, mqttActions[actionName]);
      !isBind && this.notifySubOrUnSubToEndApi(isBind); // 取消订阅托管内部
    } else {
      topics.forEach((item: string) => {
        const [callbackKey, actionName] = this.getMqttCallbackParams(item, actions);
        if (!actionName) return;
        mqttOperate(callbackKey as any, mqttActions[actionName]);
        !isBind && this.notifySubOrUnSubToEndApi(isBind); // 取消订阅托管内部
      });
    }
  };

  mqttStateObservable = mqttStateObservable;

  constructor() {
    this.mqttServiceInstance = MQTTService;
  }

  mqttConnect = (
    subscribeTopics: Callback,
    mqttCallbackBind: Callback,
    mqttConnectSuccessCallback: Callback,
  ) => {
    const connectSuccessCallback = (clientId: string) => {
      // fix: store获取不到clientId情况
      this.mqttId = clientId || '';
      mqttConnectSuccessCallback(true);
      log('[subscribeTopics] MQTT连接成功，"#"通配主题订阅成功！！！');
      subscribeTopics();
      mqttCallbackBind();
      this.mqttStateObservable.setIsConnected();
    };
    try {
      this.mqttServiceInstance.connect(connectSuccessCallback, (message: string) => {
        this.mqttStateObservable.setIsConnected(false);
        log(`MQTT出错信息:::${message}`, this.mqttId);
      });
    } catch (err) {
      console.log(`MQTT异常信息:::${err}`);
    }
  };

  mqttSubscribe = (
    { topics, mqttActions, isConnect = false }: Subscribe,
    mqttConnectSuccessCallback: Callback,
  ) => {
    // 1、构造对应订阅方法\回调绑定方法
    this.uuid++;
    const subscribeTopics: Callback = topics ? this.transTopics2Subscribe('#') : () => {};
    const mqttCallbackBind = () => this.mqttCallbackOperate(true, topics, mqttActions);
    // 2、进行订阅（是否新建mqtt连接）
    // this.mqttServiceInstance应该暴露底层mqtt的实例是否已建立，以判断是否需要继续订阅
    if (isConnect) {
      this.mqttConnect(subscribeTopics, mqttCallbackBind, mqttConnectSuccessCallback);
      return;
    }
    subscribeTopics();
    // 3、回调处理
    mqttCallbackBind();
  };

  mqttUnSubscribe = ({ topics, mqttActions, isConnect = false }: Unsubscribe) => {
    // 对于黑名单的topic，应该卸载回调方法，但是不应该卸载topic
    // 1、卸载topic
    if (isConnect) {
      try {
        this.unsubscribeTopics(topics);
        // 感觉有问题，先暂时注释, end 是关闭客户端
        // this.mqttServiceInstance?.end?.({} as any);
      } catch (error) {
        log('mqtt服务断开:', error);
      }
    }

    // 2、卸载回调方法
    this.mqttCallbackOperate(false, topics, mqttActions);
  };
}

const mqttApplication = new MqttApplication();

export default mqttApplication;
