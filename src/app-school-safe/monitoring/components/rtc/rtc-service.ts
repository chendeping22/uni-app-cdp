import { RtcEventEnum } from './index';

import SimpleEventBus from './simple-event-bus';

interface IOption {
  onCreateOffer: (offer: any) => void;
  onTrack: (offer: any) => void;
  onIcecandidate: (iceCandidate: any) => void;
  onRtcStateChange: (status: string) => void;
}

export interface IConstraint {
  video: boolean | Record<string, any>;
  audio: boolean | Record<string, any>;
  taskCode?: number;
  isUdp: boolean;
  success: (stream: any) => void;
  fail: (err: string) => void;
}

export default class RtcService {
  config: any;
  pc: any;
  facingMode: string;
  remoteStream: any;

  onCreateOffer: (offer: any) => void;
  onTrack: (offer: any) => void;
  onIcecandidate: (iceCandidate: any) => void;
  onRtcStateChange: (state: string) => void;

  constructor(opt: IOption) {
    this.remoteStream = null; // 远程推过来的流
    this.facingMode = 'user'; //前置摄像头还是后置摄像头 user-前置 environment-后置

    this.config = {
      offerAnswerOption: {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
      },
      iceServers: [
        {
          urls: [
            'stun:stun.sipgate.net:3478',
            'stun:stun.callwithus.com:3478',
            'stun:stun.minisipserver.com:3478',
            'stun:stun.voipbuster.com:3478',
            'stun:stun.voipstunt.com:3478',
            'stun:stun.voip.aebc.com:3478',
            'stun:stun.internetcalls.com:3478',
          ],
        },
      ],
    };
    this.pc = null; // rtc
    this.onCreateOffer = opt.onCreateOffer;
    this.onTrack = opt.onTrack;
    this.onIcecandidate = opt.onIcecandidate;
    this.onRtcStateChange = opt.onRtcStateChange;

    this.init();
  }

  init() {
    this.pc = new RTCPeerConnection(this.config.iceServers);

    this.pc.addTransceiver('audio', { direction: 'sendrecv' });
    this.pc.addTransceiver('video', { direction: 'sendrecv' });

    if (this.pc.onaddstream) {
      console.log('onaddstream');
      this.pc.onaddstream = event => {
        this.remoteStream = event.stream;
        this.onTrack?.(this.remoteStream);
        SimpleEventBus.emit(RtcEventEnum.ON_ADD_STREAM, this.remoteStream);
      };
    } else {
      this.pc.ontrack = event => {
        console.log('ontrack');
        this.remoteStream = event.streams;
        this.onTrack?.(this.remoteStream);
        SimpleEventBus.emit(RtcEventEnum.ON_TRACK, this.remoteStream);
      };
    }

    // 本地打洞
    this.pc.onicecandidate = event => {
      // 监听ice
      const iceCandidate = event.candidate;
      if (iceCandidate) {
        console.log('本地打洞', iceCandidate);
        this.onIcecandidate?.(iceCandidate);
      }
    };

    // 通道状态监测
    this.pc.onconnectionstatechange = () => {
      const connectionState = this.pc.connectionState;
      // connected、disconnected、closed、failed
      console.log('RTC连接状态：', connectionState);

      this.onRtcStateChange?.(connectionState);
    };
  }

  createOffer() {
    this.pc.createOffer().then(offer => {
      console.log('创建本地offer', offer);
      this.pc.setLocalDescription(offer);
      this.onCreateOffer?.(offer);
    });
  }

  getState() {
    return this.pc?.connectionState;
  }

  sendStream(stream) {
    // 发送音频
    console.log('发送音频', stream, stream.getTracks());

    stream.getTracks().forEach(track => {
      // const sender = this.pc.getSenders().find(s => s.track.kind === track.kind);
      // console.log('Found sender:', sender);
      // if (sender) {
      //   sender.replaceTrack(track);
      // } else {

      // }
      this.pc.addTrack(track, stream);
    });
  }

  close() {
    this.pc && this.pc?.close();
    this.pc = null;
  }

  addIceCandidate(iceCandidate: any) {
    let candidateData = iceCandidate;
    if (typeof iceCandidate !== 'object') {
      candidateData = JSON.parse(iceCandidate);
    }

    this.pc.addIceCandidate(new RTCIceCandidate(candidateData));
  }

  setRemoteDescription(remoteSdp: any) {
    this.pc.setRemoteDescription(new RTCSessionDescription(remoteSdp));
  }
}
