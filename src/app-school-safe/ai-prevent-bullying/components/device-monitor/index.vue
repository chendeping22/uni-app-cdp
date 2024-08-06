<template>
  <view class="container bg-fill-default flex-row plr-l">
    <u-card
      full
      :show-head="false"
      :show-foot="false"
      :padding="16"
      class="radius-card"
      :border="false"
    >
      <template #body>
        <view class="flex mlr-s flex-between">
          <view class="flex col-16" @click="switchDevice">
            <image
              :src="selectedDeviceInfo?.status === 0 ? icon_bullying_off : icon_bullying_on"
              class="icon-64 mr-s no-shrink"
            />
            <view class="font-title color-black text-ellipse mr-s">{{
              selectedDeviceInfo?.name || '/'
            }}</view>
            <u-icon name="arrow-right" :size="32" />
          </view>
          <alarm-call
            v-if="showAlarmCall"
            :device-id="selectedDeviceInfo?.id"
            :is-online="Boolean(selectedDeviceInfo?.status)"
            @call="startCall"
            @stop="stopCall"
          />
        </view>
      </template>
    </u-card>

    <u-card
      full
      :show-head="false"
      :show-foot="false"
      :padding="16"
      class="radius-card"
      :border="false"
    >
      <template #body>
        <view
          v-if="selectedDeviceInfo?.id && isNil(selectedIpcInfo)"
          class="video-offline flex-center"
        >
          <u-loading :size="100" />
        </view>

        <u-empty-custom
          v-else-if="isNil(selectedIpcInfo?.deviceId)"
          class="video-offline flex-center"
          card
          text="未检测到关联摄像头，如已配置，退出重新进入界面时显示关联信息"
        />
        <view
          v-else-if="selectedIpcInfo.onlineStatus === OnlineStatusEnum.Disconnected"
          class="video-offline flex-center"
        >
          <view class="flex-column">
            <c-icon name="icon_camera" size="60" color-type="disabled" />
            <view class="color-disabled font-content mt-s">设备已离线</view>
          </view>
        </view>
        <video
          v-else-if="showVideoElm"
          id="myVideo"
          :key="selectedIpcInfo?.deviceId"
          class="video"
          :src="playerInfo?.mainUrl"
          :show-fullscreen-btn="true"
          :show-play-btn="true"
          :show-progress="false"
          :duration="3600"
          :enable-progress-gesture="false"
        />
        <view v-if="selectedIpcInfo?.deviceId" class="monitor-info ptb-b">
          <view class="monitor-info-item mb-s">
            <text class="label uni-ellipsis-2">空间名称</text>
            <text class="value">{{ selectedIpcInfo?.spaceFullName || '/' }}</text>
          </view>
          <view class="monitor-info-item">
            <text class="label">设备名称</text>
            <text class="value">{{ selectedIpcInfo?.deviceName || '/' }}</text>
          </view>
        </view>
      </template>
    </u-card>
    <u-card
      full
      :show-head="false"
      :show-foot="false"
      :padding="16"
      class="radius-card"
      :border="false"
    >
      <template #body>
        <view class="plr-s">
          <audio-list :device-id="selectedDeviceInfo?.id" :deny-play-audio="isDeny" />
        </view>
      </template>
    </u-card>
  </view>
</template>
<script lang="ts" setup>
import { usePlayerInfo } from '@/app-school-safe/hooks/use-player-info';
import {
  IBullyingNodeType,
  IIpcInfo,
  fetchBullyingList,
  fetchRelIpcInfo,
} from '@/app-school-safe/services/ai-prevent-bullying';
import icon_bullying_off from '@/app-school-safe/static/svg/icon_bullying_off.svg';
import icon_bullying_on from '@/app-school-safe/static/svg/icon_bullying_on.svg';
import { makeStorageKey } from '@/utils/storage-keys';
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import AlarmCall from '../alarm-call/index.vue';
import AudioList from '../audio-list/index.vue';

import { OnlineStatusEnum } from '@/app-school-safe/constants/OnlineStatusEnum';
import { flatTree } from '@/app-school-safe/utils';
import { isNil } from '@/utils/lodash-es';

const flatDeviceList = ref<IBullyingNodeType[]>([]);
const deviceId = ref<string>();
const ipcUuid = ref<string>('');
const selectedIpcInfo = ref<IIpcInfo>();
const isDeny = ref(false); // 拨号/通话过程中拒绝播放录音或者切换设备
const showVideoElm = ref(true);

const playerInfo = usePlayerInfo(ipcUuid);

// 默认选中第一个防欺凌设备
const selectedDeviceInfo = computed(() => {
  let selectedItem;
  if (deviceId.value?.length)
    selectedItem = flatDeviceList.value.find(item => item.id === deviceId.value);
  if (!selectedItem) selectedItem = flatDeviceList.value?.[0];
  return selectedItem;
});

const showAlarmCall = computed(() => {
  // 仅支持android端
  return plus.os.name === 'Android';
});

const switchDevice = () => {
  uni.navigateTo({
    url: '/app-school-safe/ai-prevent-bullying/switch-device',
  });
};

const startCall = () => {
  isDeny.value = true;
};

const stopCall = () => {
  isDeny.value = false;
};

watch(selectedDeviceInfo, async () => {
  if (!selectedDeviceInfo.value?.id) return;
  const res = await fetchRelIpcInfo(selectedDeviceInfo.value?.id);
  selectedIpcInfo.value = res;
  ipcUuid.value = res?.deviceId;
});

onBeforeMount(async () => {
  // 记住用户上一次选择的防欺凌设备
  deviceId.value = uni.getStorageSync(makeStorageKey('selectedDeviceTreeNode_SpeechAlarm'));

  const res = await fetchBullyingList();
  flatDeviceList.value = flatTree(res || []).filter(
    (v: IBullyingNodeType) => v.deviceType === 'SpeechAlarm',
  );

  uni.$on('deviceTreeSelected', (node: { id: string; type: string }) => {
    uni.setStorageSync(makeStorageKey(`selectedDeviceTreeNode_${node.type}`), node.id);
    deviceId.value = node.id;
  });
});

onBeforeUnmount(() => {
  uni.$off('deviceTreeSelected');
});

defineExpose({
  destroyVideo: () => {
    // IOS中组件销毁后，video组件仍占据空间且层级较高，导致其他点击区域被覆盖了
    // 切换tab前，手动触发销毁掉video
    showVideoElm.value = false;
  },
});
</script>

<style scoped lang="scss">
.container {
  height: 100%;
  overflow: hidden;
}
.radius-card {
  border-radius: $radius-base;
}
.video,
.video-offline {
  width: 100%;
  height: 360rpx;
  border-radius: $radius-base;
}
.monitor-info .monitor-info-item {
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
  flex: 1;
  font-size: $ui-font-size-title;
  color: $ui-color-base;
}
</style>
