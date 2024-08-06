import { RtcEventEnum } from '.';
import { IConstraint } from './rtc-service';
import SimpleEventBus from './simple-event-bus';
import util from './util';

class Voice {
  localStream: any;
  audioCtx: any;
  scriptNode: any;

  constructor() {
    this.localStream = null; // 本地流
    this.audioCtx = null;
    this.scriptNode = null;
  }

  private static instance: Voice | null;

  static getInstance() {
    if (!Voice.instance) {
      Voice.instance = new Voice();
    }
    return Voice.instance;
  }

  getUserMedia(constraint: IConstraint) {
    const { video, audio, success, fail, taskCode } = constraint;

    navigator.mediaDevices
      .getUserMedia({
        video: video,
        audio: audio,
      })
      .then(stream => {
        this.localStream = stream;

        this.audioCtx = new AudioContext();
        this.scriptNode = this.audioCtx.createScriptProcessor(1024, 1, 1);

        const source = this.audioCtx.createMediaStreamSource(stream);
        source.connect(this.scriptNode);
        this.scriptNode.connect(this.audioCtx.destination);

        const isExistEventListener = SimpleEventBus?.isExist(RtcEventEnum.VOICE_PROCESS);

        // 当麦克风有声音输入时，会调用此事件
        // 实际上麦克风始终处于打开状态时，即使不说话，此事件也在一直调用
        this.scriptNode.onaudioprocess = (audioProcessingEvent: { inputBuffer: any }) => {
          if (!isExistEventListener) return;

          const inputBuffer = audioProcessingEvent.inputBuffer;
          // 由于只创建了一个音轨，这里只取第一个频道的数据
          const inputData = inputBuffer.getChannelData(0);
          // console.log('inputData', inputData);

          const pcmFormat = util.encodePCM(inputData, 16);
          // console.log('pcmFormat', pcmFormat);

          const udpData = util.encodeUdp(pcmFormat, taskCode);
          // console.log('udpData', udpData);

          util.DataViewToBase64(udpData, (data: any) => {
            // transformToArrayBuffer(data);
            // console.log('data', data);
            SimpleEventBus?.emit(RtcEventEnum.VOICE_PROCESS, { data });
          });
        };

        success?.(stream);
      })
      .catch(e => {
        fail?.(JSON.stringify(e));
      });
  }

  call(constraint: IConstraint) {
    this.getUserMedia({
      ...constraint,
    });
  }

  stopCall() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.scriptNode?.disconnect();
  }
}

const instance = Voice.getInstance();

export default instance;
