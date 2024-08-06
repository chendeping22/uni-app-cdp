import { forEach, isEqual, slice } from '@/utils/lodash-es';
import { TopicUrls } from '../../mqtt.topics';

type ISubscribeCallback<T = any> = (val: T) => void;

// const initState: TMqttState = {
//   isConnected: false
// };

export class Observable<T extends Record<string, any> = Record<string, any>> {
  private state!: T;

  private initState!: T;

  private subscribers: Record<string, ISubscribeCallback[]> = {};

  constructor(initState: T = {} as any) {
    this.initState = initState;
    this.resetState();
  }

  setState(state: Partial<T>) {
    forEach(Object.keys(state), key => {
      const val = state[key];
      if (val !== this.state[key]) {
        (this.state as any)[key] = val;
        forEach(this.subscribers[key], callback => callback(val));
      }
    });
  }

  getState(key: keyof T) {
    return this.state[key];
  }

  resetState() {
    this.state = {
      ...this.initState,
    };
  }

  subscribe(key: string, callback: ISubscribeCallback, immediate = true) {
    const val = this.state[key];
    this.subscribers[key] = this.subscribers[key] ?? [];
    this.subscribers[key].push(callback);
    if (immediate) {
      callback(val);
    }
    return () => this.unsubscribe(key, callback);
  }

  unsubscribe(key: string, callback: ISubscribeCallback) {
    this.subscribers[key] = (this.subscribers[key] ?? []).filter(item => item !== callback);
  }
}

type TMqttState = {
  [key in TopicUrls]?: any;
} & {
  isConnected: boolean;
};

export class MqttStateObservable extends Observable<TMqttState> {
  setIsConnected(isConnected = true) {
    // @todo
    if (this.getIsConnected() === isConnected) return;
    this.setState({ isConnected });
  }

  getIsConnected(): boolean {
    return this.getState('isConnected');
  }

  subscribeIsConnected(callback: ISubscribeCallback<boolean>) {
    return this.subscribe('isConnected', callback);
  }

  setTopic(message: { payload: { topic: string; [key: string]: any } }) {
    const { topic, ...data } = message.payload;
    const key = slice(topic.split('/'), 4).join('/') as TopicUrls;
    const oldData = this.getState(key);
    const equal = isEqual(oldData, data);
    if (!equal) {
      this.setState({
        [key]: data,
      });
    }
  }
}

const mqttStateObservable = new MqttStateObservable({
  isConnected: false,
});

export default mqttStateObservable;
