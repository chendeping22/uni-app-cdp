type TCallBackFun = (args: any | null) => void;

class SimpleEventBus {
  listener: Record<
    string,
    {
      isOnce: boolean;
      func: TCallBackFun;
    }[]
  >;
  constructor() {
    this.listener = {};
  }

  private static instance: SimpleEventBus | null;

  static getInstance() {
    if (!SimpleEventBus.instance) {
      SimpleEventBus.instance = new SimpleEventBus();
    }
    return SimpleEventBus.instance;
  }

  isExist(eventName: string) {
    const eventArr = this.listener[eventName] ?? [];
    return eventArr.length > 0;
  }

  on(eventName: string, func: TCallBackFun) {
    const eventArr = this.listener[eventName] ?? [];

    const isExist = eventArr.find(item => item.func === func && !item.isOnce);
    if (isExist) return;

    eventArr.push({
      isOnce: false,
      func,
    });

    this.listener[eventName] = eventArr;
  }

  once(eventName: string, func: TCallBackFun) {
    const eventArr = this.listener[eventName] ?? [];

    const isExist = eventArr.find(item => item.func === func && item.isOnce);

    if (isExist) return;

    eventArr.push({
      isOnce: true,
      func,
    });

    this.listener[eventName] = eventArr;
  }

  off(eventName: string, func: TCallBackFun) {
    const eventArr = this.listener[eventName];

    const isExist = eventArr.find(item => item.func === func);

    if (!eventArr || !isExist) return;

    const filterEvent = eventArr.filter(item => item.func !== func);

    this.listener[eventName] = filterEvent;
  }

  emit(eventName: string, ...args: any) {
    const eventArr = this.listener[eventName] ?? [];

    const length = eventArr.length;

    if (!length) return;

    for (let i = 0; i < length; i++) {
      const event = eventArr[i];

      if (typeof event?.func === 'function') {
        event.func.call(null, ...args);
      }

      if (event?.isOnce) {
        eventArr.splice(i);
        i--;
      }
    }
    this.listener[eventName] = eventArr;
  }

  clear(eventName: string) {
    this.listener[eventName] = [];
  }

  clearAll() {
    this.listener = {};
  }
}

const bus = SimpleEventBus.getInstance();

export default bus;
