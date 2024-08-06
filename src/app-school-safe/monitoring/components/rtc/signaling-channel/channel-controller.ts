import WebSocketChannel from './websocket-channel';

export interface IOption {
  url: string;
  onChannelConnected: () => void;
  onError: (errorMsg: Record<string, any>) => void;
  onClose: () => void;
  onMessage: (message: any) => void;
}

enum ChannelTypeEnum {
  'WEBSOCKET',
  'HTTP',
}

type TChannelType = ChannelTypeEnum.WEBSOCKET | ChannelTypeEnum.HTTP;

class ChannelController {
  channelType: TChannelType;
  channelClass: any;
  channelInstance: any;
  option: IOption;

  constructor(option: IOption) {
    this.option = option;

    this.channelType = this.getChannelType();
    this.channelClass = null;
    this.channelInstance = null;

    this.init();
  }

  getChannelType() {
    if (/wss?:\/\/(.+?)/.test(this.option?.url)) {
      return ChannelTypeEnum.WEBSOCKET;
    }
    return ChannelTypeEnum.HTTP;
  }

  init() {
    if (!this.option.url) return;
    this.selectChannel();
    this.createChannel();
  }

  selectChannel() {
    if (this.channelType === ChannelTypeEnum.WEBSOCKET) {
      this.channelClass = WebSocketChannel;
    } else {
      throw 'channel error';
    }
  }

  createChannel() {
    this.channelInstance = new this.channelClass(this.option);
    this.channelInstance.open();
  }

  sendMsg(msg: any) {
    this.channelInstance.sendMsg(msg);
  }

  close() {
    this.channelInstance?.close();
    this.channelInstance = null;
  }
}

export default ChannelController;
