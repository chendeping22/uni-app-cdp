import { map, noop } from '@/utils/lodash-es';
import type { Callback } from './lib/mqtt/types';
import mqttApplication from './mqttApplication';

type OnMessageHandler = (event?: { message: any; topic: string }) => void;

type TMqttSubscriberOptions = {
  topics: string[];
  mqttActions?: Record<string, Callback>;
  onMessage?: OnMessageHandler;
};

/**
 * @class MattSubscriber
 * Mqtt 订阅
 * @example
 * ```
 * // 订阅主题消息
 * const mqttSubscriber = new MqttSubscriber({
 *    topics: ['xxx/xxx'],
 *    onMessage({message, topic}) {  }
 * });
 *
 * // 不再使用时需要手动销毁
 * mqttSubscriber.destroy();
 * ```
 */
class MqttSubscriber {
  private topics: string[] = [];
  private mqttActions: Record<string, Callback> = {};
  private onMessage: OnMessageHandler = noop;

  destroy = noop;

  constructor({ topics, mqttActions, onMessage }: TMqttSubscriberOptions) {
    this.topics = topics;
    this.mqttActions = mqttActions || {};
    if (onMessage) {
      this.onMessage = onMessage;
    }

    const unsubscribeTopics = map(this.topics, topic => {
      return mqttApplication.mqttStateObservable.subscribe(
        topic,
        message => {
          if (!message) return;
          this.onMessage({ message, topic });
        },
        false,
      );
    });

    const unsubscribeIsConnected = mqttApplication.mqttStateObservable.subscribeIsConnected(b => {
      if (!b) {
        return;
      }
      mqttApplication.mqttSubscribe(
        {
          topics: this.topics,
          mqttActions: this.mqttActions,
          isConnect: false,
        },
        () => {},
      );
    });

    this.destroy = () => {
      unsubscribeIsConnected?.();
      unsubscribeTopics.forEach(cb => cb?.());
    };
  }

  private connectMqttSuccess() {}

  end() {
    mqttApplication.mqttServiceInstance.end({
      force: true,
      options: {},
    });
  }

  connect() {
    mqttApplication.mqttSubscribe(
      {
        topics: this.topics,
        mqttActions: this.mqttActions,
        isConnect: false,
      },
      this.connectMqttSuccess,
    );
  }

  manualSubOrUnsub(...args: any) {
    if (!mqttApplication.getStoreMqttInfo().accessToken) {
      return;
    }
    (mqttApplication.manualSubOrUnsub as any)(...args);
  }
}

export default MqttSubscriber;
