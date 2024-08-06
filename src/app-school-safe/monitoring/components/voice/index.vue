<template>
  <view>
    <view :info="voiceProps" :change:info="voiceModule.receiveVoiceProps"></view>
    <view v-show="isVoiceing" class="voiceing-container flex-center flex-column-plain plr-l">
      <view class="voice-analyser">
        <c-image :src="voiceGif" width="372" height="48" />
      </view>
      <view
        :class="{ 'volume-container': volumeControl }"
        class="flex-column-plain flex-center radius-small mtb-b mlr-l"
      >
        <view v-if="volumeControl && isVoiceing" class="flex-center plr-l col-24 mtb-b">
          <c-icon name="icon_sound" size="48" color-type="black" />
          <slider
            class="mlr-l slider"
            :height="8"
            :edge-anchor="true"
            :value="volume"
            :block-size="24"
            @changing="showLiftValue"
            @change="handleChangeVol"
          />
          <view class="volumn"> {{ volumeEnd }}% </view>
        </view>
        <view class="hand-up" @click="voiceModule.stopVoice">
          <c-icon name="icon_phone_off" size="48" color-type="white" />
        </view>
      </view>
    </view>
    <c-modal v-model:show="modalShow" :has-cancel="false" @onConfirm="dialogConfirm">
      <view class="text-center font-title color-base bold"> {{ message }} </view>
    </c-modal>
  </view>
</template>

<script lang="ts">
import { setVol } from '@/app-school-safe/services/monitoring';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import { RtcStateEnum } from '../rtc';

export interface IVoiceRtcProps {
  signalUrl: string;
  taskCode?: string | number;
  serverIpList: string[];
  protocol: number;
  port: number;
  deviceId: string;
  deviceModel: string;
  onlineStatus: string;
}

export default defineComponent({
  components: {},
  props: {
    keepRtcConnected: {
      type: Boolean,
      default: false,
    },
    voiceStatus: {
      type: String,
      default: '',
    },
    volumeControl: {
      type: Boolean,
      default: false,
    },
    volume: {
      type: Number,
      default: 30,
    },
    speakerInfo: {
      type: Object,
      default: () => {
        return {
          signalUrl: '',
          taskCode: 0,
          serverIpList: [],
          protocol: 1,
          port: 80,
          devideId: '',
          deviceModel: '',
        };
      },
    },
    containerId: {
      type: String,
      default: () => '',
    },
  },
  emits: ['changeVoiceStatus'],
  setup(props, { emit }) {
    const voiceProps = ref<any>({});
    const voiceGif =
      'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/wechat/voice_analysis.gif';
    const modalShow = ref<boolean>(false);
    const message = ref<string>('设备占线，发起喊话失败');
    const volumeEnd = ref<number>(30);

    const isVoiceing = computed(() => {
      return props.voiceStatus === RtcStateEnum.CONNECTED;
    });

    const showLiftValue = ({ detail: { value } }) => {
      volumeEnd.value = value;
    };

    const handleChangeVol = ({ detail: { value } }) => {
      console.log(`handleChangeVol${value}`);
      const volValue = value;
      volumeEnd.value = volValue;
      setVol(props.speakerInfo.deviceId, volValue);
    };

    const changeVoiceStatus = function (data: { status: RtcStateEnum }) {
      const state = data.status;

      emit('changeVoiceStatus', state);
    };

    const lineBusy = () => {
      modalShow.value = true;
      message.value = '设备占线，发起喊话失败';
      changeVoiceStatus({ status: RtcStateEnum.CLOSED });
    };

    const deviceOffline = () => {
      modalShow.value = true;
      message.value = '设备离线，发起喊话失败';
      changeVoiceStatus({ status: RtcStateEnum.CLOSED });
    };

    const callFail = () => {
      modalShow.value = true;
      message.value = '连接异常，发起喊话失败';
      changeVoiceStatus({ status: RtcStateEnum.CLOSED });
    };

    const dialogConfirm = () => {
      modalShow.value = false;
    };

    watchEffect(async () => {
      console.log(`props:${JSON.stringify(props)}`);
      if (!Object.keys(props.speakerInfo)?.length) return;
      volumeEnd.value = props.volume;
      if (props.voiceStatus === RtcStateEnum.CONNECTING) {
        if (
          !props.speakerInfo?.onlineStatus ||
          props.speakerInfo?.onlineStatus.includes('disconnect')
        ) {
          deviceOffline();
          return;
        }
      }

      voiceProps.value = {
        ...props,
      };
    });

    return {
      voiceProps,
      voiceGif,
      modalShow,
      isVoiceing,
      message,
      volumeEnd,
      changeVoiceStatus,
      lineBusy,
      dialogConfirm,
      callFail,
      handleChangeVol,
      showLiftValue,
    };
  },
});
</script>

<script module="voiceModule" lang="renderjs">
import Rtc, { RtcEventEnum, RtcLineStatusEnum, RtcStateEnum} from '../rtc';
import SimpleEventBus from '../rtc/simple-event-bus';
import Voice from '../rtc/voice';

let rtcInstance;
let options;

const renderVideo = (containerId, stream) => {
  const video = document.createElement('video');
  const container = document.getElementById(containerId);

  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('controls', '');
  video.setAttribute('width', '100%');
  video.setAttribute('height', '100%');

  video.onloadedmetadata = () => {
    video?.play();
  };
  if ('srcObject' in video) {
    video.srcObject = stream;
  } else {
    video.src = window.URL.createObjectURL(stream);
  }

  if (container) {
    var childs = container.childNodes;
    for (var i = childs.length - 1; i >= 0; i--) {
      container.removeChild(childs[i]);
    }

    container.appendChild(video);

    video?.play();
  }
};

const initRtc = data => {
  const { url } = data ?? {};

  let transformUrl = !url
    ? ''
    : url?.lastIndexOf('sessionId') > -1
    ? url
    : `${url}&sessionId=${Math.random()}`;

  return new Rtc({
    url: transformUrl,
    onTrack: stream => {
      remoteStream = stream;
      if (options.containerId) {
        renderVideo(options.containerId, stream[0]);
      }
    },
  });
};

const startVoice = ownerInstance => {
  const { speakerInfo } = options;

  const { taskCode } = speakerInfo;

  const callOption = {
    video: false,
    audio: {
      sampleSize: 16,
      echoCancellation: true, //是否使用回声消除来尝试去除通过麦克风回传到扬声器的音频
      noiseSuppression: true, //是否尝试去除音频信号中的背景噪声
      autoGainControl: true,
      channelCount: 1,
      sampleRate: 48000,
    },
    taskCode,
    success: stream => {
      rtcInstance.sendStream(stream);
      rtcInstance.connect();
    },
    fail: e => {
      console.log('call fail', JSON.stringify(e));
      ownerInstance.callMethod('callFail');
    },
  };

  SimpleEventBus.once(RtcEventEnum.CHECK_IS_BUSY, status => {
      if (status === RtcLineStatusEnum.FREE) {
        Voice.call(callOption);
      } else if (status === RtcLineStatusEnum.BUSY) {
        ownerInstance.callMethod('lineBusy');
      }
    });
  rtcInstance?.checkIsBusy();
};

export default {
  methods: {
    receiveVoiceProps: (newValue, oldValue, ownerInstance, vm) => {
      const { voiceStatus, speakerInfo } = newValue;

      const { signalUrl, taskCode, protocol} = speakerInfo || {};

      options = newValue;
      if (!Object.keys(speakerInfo)?.length) return;

      console.log(`receiveVoiceProps:${JSON.stringify(newValue)}`);

      if (taskCode === '-1') {
        ownerInstance.callMethod('lineBusy');
        return;
      }

      if ((protocol === 1 && !signalUrl) || protocol === undefined) {
        ownerInstance.callMethod('callFail');
        return;
      }

      //喊话中，直接销毁，重新建立连接开始喊话
      if (voiceStatus === RtcStateEnum.CONNECTING) {
        rtcInstance?.destroy();

        rtcInstance = initRtc({
          url: signalUrl,
        });

        SimpleEventBus.on(RtcEventEnum.ON_RTC_STATE_CHANGE, state => {
          console.log(`onRtcStateChange:${state}`);
          if (state === RtcStateEnum.CONNECTED) {
            ownerInstance.callMethod('changeVoiceStatus', {
              status: state,
            });
          }

          if (state === RtcStateEnum.FAILED) {
            ownerInstance.callMethod('callFail');
          }
        });

        SimpleEventBus.once(RtcEventEnum.ON_CHANNEL_CONNECTED, () => {
          startVoice(ownerInstance);
        });
      } else if (voiceStatus !== RtcStateEnum.CONNECTED) {
        rtcInstance?.destroy();
      }

      if (voiceStatus !== RtcStateEnum.CONNECTED) {
        Voice.stopCall();
      }
    },
    stopVoice: (_event, ownerInstance) => {
      // const {keepRtcConnected}=options;
      // 如果是一建告警仅stopcall，其他destroy
      Voice.stopCall();
      rtcInstance?.destroy();

      SimpleEventBus.clearAll();

      ownerInstance.callMethod('changeVoiceStatus', {
        status: RtcStateEnum.CLOSED,
      });
    },
  },
};
</script>

<style scoped lang="scss">
.voice-btn-container {
  width: 88rpx;
  height: 88rpx;
  background-color: $ui-color-white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $ui-radius-default;
}

.voice-btn {
  color: $ui-color-primary;
}

.voiceing-container {
  margin-top: $ui-gap-default;
  min-height: 232rpx;
  background: $ui-color-white;
  box-shadow: 0px 0px 20rpx 0px rgba(24, 25, 68, 0.05);
  border-radius: $ui-radius-xl;
  padding: $ui-gap-large;
  margin-bottom: $ui-gap-default;
}

.volume-container {
  background-color: #f2f3f4;
  height: 316rpx;
  width: 100%;
}

.voice-analyser {
  width: 372rpx;
  height: 48rpx;
  margin-bottom: 32rpx;
}

.hand-up {
  background-color: $ui-color-error;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider {
  width: 400rpx;
}
.volumn {
  color: $ui-color-font-disabled;
}
</style>
