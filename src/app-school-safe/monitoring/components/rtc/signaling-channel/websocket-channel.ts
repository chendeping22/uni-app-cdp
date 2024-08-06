import type { IOption } from './channel-controller';

class WebSocketChannel {
  static isSupported() {
    try {
      return typeof self.WebSocket !== 'undefined';
    } catch (e) {
      return false;
    }
  }

  TAG: string;
  ws: any;
  heartBeat: any;
  option: IOption;
  reconnectCount: number;
  onOpen: () => void;
  onError: (errorMsg: Record<string, any>) => void;
  onClose: () => void;
  onMessage: (message: any) => void;

  constructor(option: IOption) {
    this.TAG = 'WebSocketChannel';

    this.ws = null;
    this.heartBeat = null;
    this.option = option;
    this.reconnectCount = 0;

    this.onOpen = option.onChannelConnected;
    this.onError = option.onError;
    this.onClose = option.onClose;
    this.onMessage = option.onMessage;
  }

  open() {
    try {
      const ws = new WebSocket(this.option.url);

      ws.onopen = this.onWebSocketOpen.bind(this);
      ws.onclose = this.onWebSocketClose.bind(this);
      ws.onmessage = this.onWebSocketMessage.bind(this);
      ws.onerror = this.onWebSocketError.bind(this);

      this.ws = ws;

      this.keepHeartBeat();
    } catch (e) {
      const info = { code: e.code, msg: e.message };

      if (this.onError) {
        this.onError(info);
      } else {
        throw info.msg;
      }
    }
  }

  close() {
    const ws = this.ws;
    if (ws && (ws.readyState === 0 || ws.readyState === 1)) {
      ws.readyState === 1 && ws.send(JSON.stringify({ cmd: 'bye' }));
      ws.close();
    }

    this.ws = null;
    clearInterval(this.heartBeat);
  }

  sendMsg(msg: any) {
    const ws = this.ws;
    console.log('信令通道发送信息', ws.readyState === 1, msg);
    if (ws && ws.readyState === 1) {
      ws.send(msg);
    }
  }

  private keepHeartBeat() {
    this.heartBeat = setInterval(() => {
      if (this.ws?.readyState === 1) {
        this.ws.send(JSON.stringify({ cmd: 'heartbeat' }));
      }
    }, 30000);
  }

  private onWebSocketOpen(e) {
    console.log('开始建立Rtc信令通道...');
    this.onOpen?.(e);
  }

  private onWebSocketClose(e) {
    console.log('Rtc信令通道关闭...');
    this.close();
    this.onClose?.();
  }

  private onWebSocketMessage(e) {
    console.log('收到信令通道信息', JSON.stringify(e));
    this.onMessage?.(e);
  }

  private onWebSocketError(e) {
    console.log('Rtc信令通道发生错误...', e);
    const info = {
      code: e.code,
      msg: e.message,
    };
    if (this.reconnectCount < 6) {
      this.reconnectCount++;
      this.reconnect();
    } else {
      if (this.onError) {
        this.onError?.(info);
      } else {
        throw info.msg;
      }
    }
  }

  private reconnect() {
    setTimeout(() => {
      this.close();
      this.open();
    }, 3000);
  }
}

export default WebSocketChannel;
