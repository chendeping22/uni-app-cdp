<template>
  <view class="container bg-fill-default flex-row plr-l pt-l">
    <uni-list>
      <uni-list-item
        class="monitor-name"
        :title="selectedIpcInfo?.name || '/'"
        :ellipsis="1"
        show-arrow
        :border="false"
        clickable
        :thumb="icon_monitoring"
        thumb-size="base"
        @click="switchIPC"
      >
      </uni-list-item>
    </uni-list>
    <view class="video-wrap">
      <view v-if="selectedIpcInfo && !selectedIpcInfo.status" class="video-offline flex-center">
        <view class="flex-column">
          <c-icon name="icon_camera" size="60" color-type="disabled" />
          <view class="color-disabled font-content mt-s">设备已离线</view>
        </view>
      </view>
      <video
        v-else
        id="myVideo"
        :key="`${selectedIpcInfo?.uuid}_${playerInfo?.mainUrl}`"
        class="video"
        :src="playerInfo?.mainUrl"
        :show-fullscreen-btn="true"
        :show-play-btn="true"
        :show-progress="false"
        :duration="3600"
        :enable-progress-gesture="false"
      />
      <view class="monitor-info">
        <view class="monitor-info-item">
          <text class="label">空间名称</text>
          <text class="value">{{
            selectedIpcInfo?.spaceName || selectedIpcInfo?.name || '/'
          }}</text>
        </view>
        <view class="monitor-info-item">
          <text class="label">IP地址</text>
          <text class="value">{{ selectedIpcInfo?.ip || '/' }}</text>
        </view>
      </view>
    </view>
    <view :class="{ 'voiceing-container': isVoiceing, 'call-container': !isVoiceing }">
      <Voice
        :voice-status="voiceStatus"
        :speaker-info="speakerInfo"
        :keep-rtc-connected="false"
        volume-control
        :volume="volume"
        @changeVoiceStatus="changeVoiceStatus"
      >
      </Voice>
      <view
        v-if="!isVoiceing && speakers.length > 0"
        class="voice-btn-container"
        @click="handleStartVoice"
      >
        <c-icon name="icon_voice_call" size="48" :color-type="iconCall" />
      </view>
    </view>
    <view v-if="!isVoiceing" class="face-alarm-container">
      <view class="title-switch">
        <text class="title">抓拍记录</text>
        <view class="switch">
          <c-subsection
            v-model:current="dateType"
            :font-size="24"
            :list="[
              {
                name: '今日',
              },
              {
                name: '近一周',
              },
              {
                name: '近一个月',
              },
            ]"
            @change="setDateType"
          />
        </view>
      </view>
      <face-list v-if="selectedIpcInfo" class-name="face-list" :uuid="uuid" :date-type="dateType" />
    </view>
    <c-select
      v-model:show="showSelectSpeakPopup"
      :list="speakers"
      auto-close-after-select
      title="选择播放终端"
      @onSelect="handleSelectPopup"
    />
  </view>
</template>
<script lang="ts" setup>
import { usePlayerInfo } from '@/app-school-safe/hooks/use-player-info';
import {
  IIpcNodeType,
  ISpeaker,
  fetchIpcList,
  fetchSpeakerInfo,
  fetchSpeakerList,
  setVol,
  stopSpeaker,
} from '@/app-school-safe/services/monitoring';
import icon_monitoring from '@/app-school-safe/static/svg/icon_monitoring.svg';
import {
  gotoAppPermissionSetting,
  requestAndroidPermission,
  requestIOSPermission,
} from '@/app-school-safe/utils/plus-permission';
import { loginStore } from '@/store/modules/login';
import { makeStorageKey } from '@/utils/storage-keys';
import { onShow } from '@dcloudio/uni-app';
import { computed, onBeforeMount, ref, watch } from 'vue';
import FaceList from './components/face-list/index.vue';
import { RtcStateEnum } from './components/rtc';
import Voice, { IVoiceRtcProps } from './components/voice/index.vue';

interface IPopupItem extends ISpeaker {
  text: string;
  checked: boolean;
}

const flatIpcList = ref<IIpcNodeType[]>([]);
const uuid = ref<string>();
const dateType = ref(0);
const voiceStatus = ref<string>(RtcStateEnum.CLOSED);
const speakers = ref<IPopupItem[]>([]);
const showSelectSpeakPopup = ref<boolean>(false);
const speakerInfo = ref<IVoiceRtcProps>({});
const volume = ref<number>(30);

// 默认选中第一个ipc设备
const selectedIpcInfo = computed(() => {
  let selectedItem;
  if (uuid.value?.length) selectedItem = flatIpcList.value.find(item => item.uuid === uuid.value);
  if (!selectedItem) selectedItem = flatIpcList.value?.[0];
  return selectedItem;
});

const playerInfo = usePlayerInfo(uuid);

const isVoiceing = computed(() => {
  return voiceStatus.value === RtcStateEnum.CONNECTED;
});

const iconCall = computed(() => {
  return voiceStatus.value === RtcStateEnum.CONNECTING ? 'disabled' : 'primary';
});

const switchIPC = () => {
  uni.navigateTo({
    url: '/app-school-safe/monitoring/switch-ipc',
  });
};

const setDateType = (type: number) => {
  dateType.value = type;
};

const treeToArray = (data: IIpcNodeType[], spaceName?: string) => {
  return data.reduce((res, item) => {
    const { children, name, type } = item;
    item.spaceName = type === 'SPACE' ? name : spaceName;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return res.concat(item, children && children.length ? treeToArray(children, item.name) : []);
  }, []);
};

const changeVoiceStatus = (state: RtcStateEnum) => {
  voiceStatus.value = state;

  if (
    [RtcStateEnum.CLOSED, RtcStateEnum.FAILED, RtcStateEnum.DISCONNECTED].includes(state) &&
    speakerInfo.value.deviceId
  ) {
    stopSpeaker([speakerInfo.value.deviceId]);
  }
};

const getSpeakInfo = async (deviceId: string) => {
  const res = await fetchSpeakerInfo([deviceId]);
  if (res) {
    speakerInfo.value = res;
  }
};

const getSpeakerList = async (deviceId: string) => {
  const res = await fetchSpeakerList(deviceId);

  if (res) {
    speakers.value = res.map(item => {
      return {
        ...item,
        text: item.deviceName,
        checked: false,
      };
    });
  }
};

const handleSelectPopup = async (idx: number) => {
  const deviceId = speakers.value[idx]?.deviceId;
  await getSpeakInfo(deviceId);

  await setVol(deviceId, 30);
  volume.value = 30;
  changeVoiceStatus(RtcStateEnum.CONNECTING);
};

/**
 * 获取麦克风权限
 */
const checkPermisson = async () => {
  let status =
    uni.getSystemInfoSync().platform === 'ios'
      ? await requestIOSPermission('record')
      : await requestAndroidPermission('android.permission.RECORD_AUDIO');
  if (status === null || status === 1) return true;
  uni.showModal({
    title: '麦克风权限开启提醒',
    content: '您尚未开启应用的麦克风权限，无法发起喊话，是否前往设置?',
    confirmText: '去设置',
    success: function (res) {
      if (res.confirm) {
        gotoAppPermissionSetting();
      }
    },
  });
  return false;
};

const handleStartVoice = async () => {
  // 权限判断
  const status = await checkPermisson();
  if (status) {
    const length = speakers.value.length;
    if (!length || voiceStatus.value === RtcStateEnum.CONNECTING) return;

    if (length === 1) {
      await handleSelectPopup(0);
    } else {
      showSelectSpeakPopup.value = true;
    }
  }
};

watch(uuid, () => {
  if (uuid.value) getSpeakerList(uuid.value);
});

watch(flatIpcList, () => {
  if (!uuid.value) uuid.value = flatIpcList.value?.[0]?.uuid;
});

onShow(() => {
  // 记住用户上一次选择的ipc设备
  const userInfo = loginStore().userInfo;
  if (userInfo) uuid.value = uni.getStorageSync(makeStorageKey(`${userInfo.locationId}_ipcUuid`));
});

onBeforeMount(async () => {
  const res = await fetchIpcList();
  flatIpcList.value = treeToArray(res || []).filter((v: IIpcNodeType) => v.type !== 'SPACE');
});
</script>

<style scoped lang="scss">
.container {
  height: 100vh;
  overflow: hidden;
}

.video-wrap {
  margin-top: $ui-gap-default;
  height: 513rpx;
  background: $ui-color-white;
  box-shadow: 0px 0px 20rpx 0px rgba(24, 25, 68, 0.05);
  border-radius: $ui-radius-xl;
  padding: $ui-gap-default $ui-gap-large 0;
  margin-bottom: $ui-gap-default;
}
.video,
.video-offline {
  width: 100%;
  height: 360rpx;
  background-color: $ui-color-black;
  border-radius: $ui-radius-large;
}
.monitor-info .monitor-info-item {
  height: 48rpx;
  line-height: 48rpx;
  display: flex;
  flex-wrap: nowrap;
}
.monitor-info-item .label {
  display: inline-block;
  flex-grow: 0;
  flex-shrink: 0;
  width: 140rpx;
  font-size: $ui-font-size-title;
  color: $ui-color-placeholder;
  display: inline-block;
}
.monitor-info-item .value {
  display: inline-block;
  flex: 1;
  font-size: $ui-font-size-title;
  color: $ui-color-base;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.face-alarm-container {
  flex: 1;
  display: flex;
  flex-direction: column;

  .title-switch {
    display: flex;
    justify-content: space-between;
    flex-wrap: nowrap;
    align-items: center;
    margin-top: 0rpx;
  }
  .title-switch .title {
    height: 44rpx;
    font-size: $ui-font-size-content;
    color: $ui-color-placeholder;
    line-height: 44rpx;
    font-weight: 500;
    flex-shrink: 0;
    flex-grow: 0;
  }
  .title-switch .switch {
    width: 340rpx;
    flex-shrink: 0;
    flex-grow: 0;
  }

  .face-list {
    flex: 0;
  }
}

.voiceing-container {
  position: relative;
  width: 100%;
  height: 300rpx;
}

.call-container {
  position: absolute;
  bottom: 136rpx;
  right: 32rpx;
  z-index: 1000;
}

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
</style>
