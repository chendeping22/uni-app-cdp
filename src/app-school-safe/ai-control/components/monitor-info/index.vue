<template>
  <view :class="['common-card components-monitor-info', { 'only-video': !showLive }]">
    <slot name="header" />
    <view>
      <image-line
        v-if="detail.id"
        v-show="!currentSelect"
        :key="`${detail.id}_${snapImg}`"
        class="video-image"
        :alarm-type="alarmType"
        :sub-type-code="subTypeCode"
        :class="{ hidden: currentSelect }"
        :src="snapImg"
        :roi="roiData.roi"
        :object-roi="roiData.objectRoi"
        :cross-direct="roiData.crossDirect"
        :roi-disabled="roiData.roiDisabled"
        :polygon-disabled="roiData.polygonDisabled"
        class-name="notification-monitor-info-image "
        :disable-roi="roiData.disableRoi"
        :area-id="Number(roiData.areaId || '1')"
        :monitor-type="roiData.monitorType"
      />
      <view v-else-if="!currentSelect" class="video-image"> </view>
      <view v-if="currentSelect">
        <video
          v-if="currentUrl"
          :src="currentUrl"
          class="video-image"
          :show-fullscreen-btn="true"
          :show-play-btn="true"
          :show-progress="currentSelect === 'video' ? true : false"
          :duration="currentSelect === 'video' ? 0 : 3600"
          :enable-progress-gesture="currentSelect === 'video' ? true : false"
        />
        <view v-else class="video-image">
          <c-empty content="暂无视频" top="0" />
        </view>
      </view>
    </view>
    <view class="video-select">
      <view v-if="hasPlaybackPermission" class="video-item" @click="handleSelectItem('video')">
        <image :src="reportImg" class="icon" />
        <text :class="['title', { 'is-selected': currentSelect === 'video' }]">告警视频</text>
        <c-icon
          name="icon_arrow_right"
          :size="32"
          :color-type="currentSelect === 'video' ? 'primary' : 'default'"
        />
      </view>
      <view
        v-if="showLive && hasPlayingPermission"
        class="video-item monitor-btn"
        @click="handleSelectItem('live')"
      >
        <image :src="monitorImg" class="icon" />
        <text :class="['title', { 'is-selected': currentSelect === 'live' }]">监控画面</text>
        <c-icon
          name="icon_arrow_right"
          :size="32"
          :color-type="currentSelect === 'live' ? 'primary' : 'default'"
        />
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { FinishCaptureEnum } from '@/app-school-safe/constants/FinishCaptureEnum';
import usePermissions from '@/hooks/use-permissions';
import { hasPermission } from '@/utils/permissions';
import { showInfo } from '@/utils/tools';
import { computed, reactive, ref, toRefs, watchEffect } from 'vue';
import { AlarmTypeEnum } from '../../../constants/AlarmTypeEnum';
import { usePlayerInfo } from '../../../hooks/use-player-info';
import monitorImg from '../../../static/svg/icon_inform_monitoring.svg';
import reportImg from '../../../static/svg/icon_inform_report.svg';
import { BehaviorMonitorEnum } from '../../constants/BehaviorMonitorEnum';
import ImageLine from '../image-line/index.vue';

interface IProps {
  detail: any;
  alarmType: AlarmTypeEnum;
  showLive: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  detail: () => {},
  showLive: true,
});

const { detail, alarmType, showLive } = reactive(props);
const currentSelect = ref('');
const currentUrl = ref('');
const roiData = ref({
  roi: [],
  objectRoi: [],
  crossDirect: 0,
  roiDisabled: true,
  polygonDisabled: true,
  disableRoi: [],
  areaId: undefined,
  monitorType: '',
});

const { deviceId } = toRefs(detail);

const playerInfo = usePlayerInfo(deviceId);

// 是否有回放权限
const hasPlaybackPermission = computed(() => {
  if (alarmType === AlarmTypeEnum.BEHAVIOR) {
    return hasPermission(
      usePermissions().value || [],
      'Security:monitor:XWBKRecord:playback:Mobile',
    );
  } else {
    return hasPermission(usePermissions().value || [], 'Face:control:record:playback:Mobile');
  }
});
// 是否有实况权限
const hasPlayingPermission = computed(() => {
  if (alarmType === AlarmTypeEnum.BEHAVIOR) {
    return hasPermission(
      usePermissions().value || [],
      'Security:monitor:XWBKRecord:playing:Mobile',
    );
  } else {
    return hasPermission(usePermissions().value || [], 'Face:control:record:playing:Mobile');
  }
});

const videoDisabled = computed(() => {
  return showLive ? !detail.videoUrl : detail.finishCapture !== FinishCaptureEnum.Done;
});

const handleSelectItem = (item: 'video' | 'live') => {
  if (item === currentSelect.value) {
    currentSelect.value = '';
    currentUrl.value = '';
    return;
  }
  if (item === 'video' && videoDisabled.value) {
    showInfo(
      detail.finishCapture === FinishCaptureEnum.Fail
        ? '此段时间未录制告警视频'
        : '视频生成中，大约需要5分钟',
    );
    return;
  }
  currentSelect.value = item;
  const videoUrl = detail.videoUrl;
  const rtspUrl = playerInfo.value?.mainUrl;
  currentUrl.value = item === 'video' ? videoUrl : rtspUrl;
};
const snapImg = computed(() => {
  return alarmType === AlarmTypeEnum.FACE ? detail.snapBgImageUrl : detail.snapImgUrl;
});
const subTypeCode = computed(() => {
  return detail.typeCode || '';
});

watchEffect(() => {
  // 不显示区域绘制框,需求变更不特殊处理，字段暂且保留
  const polygonDisabledList: string[] = [];
  if (alarmType === AlarmTypeEnum.BEHAVIOR || alarmType === AlarmTypeEnum.FACE) {
    const { roi, objectRoi, crossDirect, typeCode, disableRoi, areaId } = detail;
    let data = {
      roi: roi ? JSON.parse(roi) : [],
      objectRoi: objectRoi ? JSON.parse(objectRoi) : [],
      crossDirect: crossDirect,
      polygonDisabled: polygonDisabledList.some(code => code === typeCode),
      roiDisabled:
        alarmType === AlarmTypeEnum.FACE ||
        (alarmType === AlarmTypeEnum.BEHAVIOR &&
          Object.values(BehaviorMonitorEnum).some(code => code === typeCode))
          ? false
          : true,
      disableRoi: disableRoi ? JSON.parse(disableRoi) : [],
      areaId,
      monitorType: typeCode,
    };
    roiData.value = data;
  }
});
</script>
<style scoped lang="scss">
@import '@/app-school-safe/styles/alarm-card.scss';
.components-monitor-info {
  min-height: 520rpx;

  .video-select {
    display: flex;

    .video-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
      height: 80rpx;
      background: $ui-color-fill-light;
      border-radius: $ui-radius-xl;
      padding: 0 $ui-gap-large;

      .icon {
        width: 44rpx;
        height: 44rpx;
      }

      .title {
        font-size: $ui-font-size-title;
        color: $ui-color-base;
        letter-spacing: 0;
        line-height: 48rpx;
      }

      .is-selected {
        color: $ui-color-primary;
      }
    }

    .monitor-btn {
      margin-left: $ui-gap-large;
    }
  }

  .video-image {
    display: flex;
    flex-direction: column;
    width: 622rpx;
    height: 360rpx;
    margin-bottom: $ui-gap-default;
    border-radius: $ui-radius-xl;
    position: relative;
  }

  .hidden {
    height: 0;
    margin-bottom: 0;
  }
}

.only-video {
  display: flex;
  flex-direction: column-reverse;

  .video-image {
    margin: $ui-gap-default 0 0;
  }
}
</style>
