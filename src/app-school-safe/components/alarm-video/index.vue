<template>
  <view class="common-card">
    <u-empty-custom v-if="!deviceId" card :text="placeholder" />
    <template v-else>
      <text v-if="title" class="common-title">{{ title }}</text>
      <view v-if="deviceName" class="common-item flex">
        <image :src="monitorImg" class="icon-32" />
        <text class="color-base font-title ml-xs">{{ deviceName }}</text>
      </view>
      <template v-if="showType === MediaType.SNAP">
        <u-empty-custom v-if="extraInfo" card :text="extraInfo" />
        <u-empty-custom
          v-else-if="!playbackUrl"
          card
          :text="
            finishCapture === FinishCaptureEnum.Fail
              ? '此段时间未录制告警视频'
              : '视频生成中，大约需要5分钟'
          "
        />
        <preview-image v-else class-name="media-container" :src="snapImgUrl" :height="360" />
      </template>

      <video
        v-else
        :src="showType === MediaType.PLAYBACK ? playbackUrl : playerInfo?.mainUrl"
        class="mtb-l media-container"
        :show-fullscreen-btn="true"
        :show-play-btn="true"
        :show-progress="showType === MediaType.PLAYBACK ? true : false"
        :duration="showType === MediaType.PLAYBACK ? 0 : 3600"
        :enable-progress-gesture="showType === MediaType.PLAYBACK ? true : false"
      />
      <view class="flex">
        <u-button
          class="flex-grow mr-b"
          shape="circle"
          plain
          :type="showType === MediaType.PLAYBACK ? 'primary' : 'default'"
          :disabled="!playbackUrl || !hasPlaybackPermission"
          @click="showPlayback"
        >
          <view class="flex-between w100">
            <image :src="reportImg" class="icon-32" />
            <view class="flex-grow">告警视频</view>
            <u-icon name="arrow-right" :size="32" />
          </view>
        </u-button>
        <u-button
          class="flex-grow ml-b"
          shape="circle"
          plain
          :type="showType === MediaType.LIVE ? 'primary' : 'default'"
          :disabled="!hasLivePermission"
          @click="showLive"
        >
          <view class="flex-between w100">
            <image :src="monitorImg" class="icon-32" />
            <view class="flex-grow">监控画面</view>
            <u-icon name="arrow-right" :size="32" />
          </view>
        </u-button>
      </view>
    </template>
  </view>
</template>

<script lang="ts" setup>
import PreviewImage from '@/app-school-safe/components/preview-image/index.vue';
import { FinishCaptureEnum } from '@/app-school-safe/constants/FinishCaptureEnum';
import { usePlayerInfo } from '@/app-school-safe/hooks/use-player-info';
import monitorImg from '@/app-school-safe/static/svg/icon_inform_monitoring.svg';
import reportImg from '@/app-school-safe/static/svg/icon_inform_report.svg';
import { ref, toRefs } from 'vue';

const enum MediaType {
  SNAP, // 抓拍
  LIVE, // 实时视频
  PLAYBACK, // 回放
}

interface IProps {
  title?: string; // 卡片标题
  deviceId?: string; // ipc-uuid(获取直播地址用)
  deviceName?: string; // 设备名称
  snapImgUrl?: string; // 抓拍图
  playbackUrl?: string; // 告警截取的小视频播放地址
  finishCapture?: number; // 告警小视频生成状态
  hasPlaybackPermission?: boolean; // 是否有回放权限
  hasLivePermission?: boolean; // 是否有实时播放权限
  placeholder?: string; // 无设备时占位文案
  extraInfo?: string; // 无抓怕时的占位文案
}

const props = withDefaults(defineProps<IProps>(), {
  title: '',
  deviceId: '',
  deviceName: '',
  snapImgUrl: '',
  playbackUrl: '',
  finishCapture: FinishCaptureEnum.Building,
  placeholder: '',
  extraInfo: '',
  hasPlaybackPermission: true,
  hasLivePermission: true,
});

const { deviceId } = toRefs(props);

const playerInfo = usePlayerInfo(deviceId);
const showType = ref(MediaType.SNAP);

const showLive = () => {
  if (showType.value === MediaType.LIVE) showType.value = MediaType.SNAP;
  else showType.value = MediaType.LIVE;
};

const showPlayback = () => {
  if (showType.value === MediaType.PLAYBACK) showType.value = MediaType.SNAP;
  else showType.value = MediaType.PLAYBACK;
};
</script>

<style scoped lang="scss">
@import '@/app-school-safe/styles//alarm-card.scss';
.media-container {
  width: 100%;
  height: 360rpx;
}
</style>
