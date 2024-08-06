import RtcService from './rtc-service';
import ChannelController from './signaling-channel/channel-controller';
import SimpleEventBus from './simple-event-bus';

// TODO 把其他事件修改为事件绑定的形式
export enum RtcEventEnum {
  CHECK_IS_BUSY = 'check_is_busy',
  VOICE_PROCESS = 'voice_process',
  ON_TRACK = 'on_track',
  ON_ADD_STREAM = 'on_add_stream',
  ON_CHANNEL_CONNECTED = 'on_channel_connected',
  ON_CHANNEL_CLOSED = 'on_channel_closed',
  ON_CHANNEL_FAILED = 'on_channel_failed',
  ON_RTC_STATE_CHANGE = 'on_rtc_state_change',
}

export enum RtcLineStatusEnum {
  BUSY = 'line_busy',
  FREE = 'line_free',
}

export enum RtcStateEnum {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CLOSED = 'closed',
  FAILED = 'failed',
}

export interface IRtcOption {
  url: string;
  onError?: (errorMsg: Record<string, any>) => void;
  onRtcStateChange?: (status: any) => void;
  onTrack: (stream: any) => void;
}
export default class Rtc {
  option: IRtcOption;
  rtcInstance: RtcService | null;
  channelInstance: ChannelController | null;
  // simpleEventBus:SimpleEventBus|null;
  os: string;
  timeOutHandle: any;

  constructor(option: IRtcOption) {
    this.option = option;
    this.rtcInstance = null;
    this.channelInstance = null;
    // this.simpleEventBus=null;
    this.os = plus.os.name ?? 'h5';
    this.timeOutHandle = null;
    this.init();
  }

  private static instance: Rtc | null;

  static getInstance(option: IRtcOption) {
    if (!Rtc.instance) {
      Rtc.instance = new Rtc(option);
    }
    return Rtc.instance;
  }

  private init() {
    this.channelInstance = this.initChannel();
  }

  private initChannel() {
    return new ChannelController({
      url: this.option.url,
      onChannelConnected: this.onChannelConnected.bind(this),
      onError: this.onChannelError,
      onClose: this.onChannelClose,
      onMessage: this.onChannelMessageArrive.bind(this),
    });
  }

  private initRtcService() {
    return new RtcService({
      onCreateOffer: this.onCreateOffer.bind(this),
      onTrack: this.onTrack.bind(this),
      onIcecandidate: this.onIcecandidate.bind(this),
      onRtcStateChange: this.onRtcStateChange.bind(this),
    });
  }

  private onChannelConnected() {
    this.rtcInstance = this.initRtcService();
    SimpleEventBus.emit(RtcEventEnum.ON_CHANNEL_CONNECTED);
  }

  private onCreateOffer(offer: any) {
    const msg = JSON.stringify({
      event: '_offer',
      data: { sdp: offer },
    });
    this.sendMsg(msg);
  }

  private onTrack(stream: MediaStream) {
    this.option?.onTrack(stream);
  }
  private onIcecandidate(iceCandidate: any) {
    const msg = JSON.stringify({
      event: '_ice_candidate',
      data: { candidate: iceCandidate },
    });
    this.sendMsg(msg);
  }

  private onRtcStateChange(state: string) {
    this.option?.onRtcStateChange?.(state);

    SimpleEventBus.emit(RtcEventEnum.ON_RTC_STATE_CHANGE, state);

    if (state === RtcStateEnum.CONNECTED) {
      this.clearTimeOutCheck();
    }
  }

  private onChannelError(errorMsg: Record<string, any>) {}

  private onChannelClose() {}

  private onChannelMessageArrive(event: any) {
    const reader = new FileReader();
    reader.readAsText(event.data, 'UTF-8');
    reader.onload = () => {
      const json = JSON.parse(reader.result as string);
      // 如果是一个ICE的候选，则将其加入到PeerConnection中，否则设定对方的session描述为传递过来的描述
      if (json.event === '_ice_candidate') {
        console.log('接收到对方candidate候选对象...');
        this.rtcInstance?.addIceCandidate(json.data.candidate);
      } else if ([RtcLineStatusEnum.BUSY, RtcLineStatusEnum.FREE].includes(json.event)) {
        console.log('接收到线路状态...', json.event);
        SimpleEventBus?.emit(RtcEventEnum.CHECK_IS_BUSY, json.event);
      } else {
        console.log('接收到对方SDP对象...');
        this.rtcInstance?.setRemoteDescription(json.data.sdp);
      }
    };
  }

  private sendMsg(msg: any) {
    this.channelInstance?.sendMsg(msg);
  }

  private timeOutCheck() {
    clearTimeout(this.timeOutHandle);

    this.timeOutHandle = setTimeout(() => {
      const state = this.getRtcState();
      if (state !== RtcStateEnum.CONNECTED) {
        SimpleEventBus.emit(RtcEventEnum.ON_RTC_STATE_CHANGE, RtcStateEnum.FAILED);
      }
    }, 10000);
  }

  private clearTimeOutCheck() {
    clearTimeout(this.timeOutHandle);
  }

  getRtcState() {
    return this.rtcInstance?.getState();
  }

  closeChannel() {
    this.channelInstance?.close();
    this.channelInstance = null;
  }

  closeRtc() {
    this.rtcInstance?.close();
    this.rtcInstance = null;
  }

  checkIsBusy() {
    const msg = JSON.stringify({
      cmd: '_line_request',
    });
    this.sendMsg(msg);
    this.timeOutCheck();
  }
  /**
   *
   * @param constraint 喊话/获取用户的流
   */
  call(constraint) {
    this.rtcInstance?.call(constraint);
  }

  /**
   *
   * 停止喊话
   */
  stopCall() {
    this.rtcInstance?.stopCall();
  }

  /**
   * 用当前的配置连接rtc
   */
  connect() {
    const state = this.rtcInstance?.getState();
    if (state != RtcStateEnum.CONNECTED) {
      this.rtcInstance?.createOffer();
      this.timeOutCheck();
    }
  }

  sendStream(stream: any) {
    this.rtcInstance?.sendStream(stream);
  }
  // 销毁rtc实例
  destroy() {
    this.closeChannel();
    this.closeRtc();
    SimpleEventBus.clearAll();

    Rtc.instance = null;
  }
}
