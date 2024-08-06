<template>
  <view class="mtb-l">
    <u-card :show-head="false" full margin="0">
      <template #body>
        <view v-if="!detail.showPlayer || denyPlayAudio" class="flex">
          <view class="flex-column-plain flex-grow">
            <view class="flex font-content color-placeholder mb-xxs">
              <view class="mr-l">录音来源</view>
              <view>{{ monitorTypeStr }}</view>
            </view>
            <view class="flex font-content color-placeholder">
              <view class="mr-l">录制时间</view>
              <view>{{ dayjs(detail?.snapTime).format('YYYY-MM-DD HH:mm') }}</view>
            </view>
          </view>
          <view class="flex-column" @click="play">
            <u-icon
              :class="detail?.audioUrl ? 'color-primary' : 'color-disabled'"
              name="play-circle-fill"
              :size="48"
            />
            <view :class="detail?.audioUrl ? 'color-base' : 'color-disabled'">{{
              durationStr
            }}</view>
          </view>
        </view>
        <audio-player
          v-else
          class="flex-grow"
          :url="detail?.audioUrl"
          :duration="detail?.audioDuration"
          auto-play
          @error="errorHandle"
        >
          <u-icon class="color-base ml-l" name="close" :size="32" @click="closeAudioPlayer" />
        </audio-player>
      </template>
    </u-card>
  </view>
</template>

<script lang="ts" setup>
import AudioPlayer from '@/app-school-safe/components/audio-player/index.vue';
import { IAudioDataItem } from '@/app-school-safe/services/ai-prevent-bullying';
import { formatDuration } from '@/app-school-safe/utils';
import { computed, toRefs } from 'vue';
import { AlarmMonitorEnum } from '../../constants/AlarmMonitorEnum';

import dayjs from 'dayjs';

interface IProps {
  detail: IAudioDataItem;
  denyPlayAudio?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  denyPlayAudio: false,
});

const emits = defineEmits(['updateShowPlayer']);

const { denyPlayAudio, detail } = toRefs(props);

const durationStr = computed(() => {
  const seconds = detail.value?.audioDuration || 0;
  const format = seconds > 3600 ? 'HH:mm:ss' : 'mm:ss';
  return formatDuration(seconds, format);
});

const monitorTypeStr = computed(() => {
  return AlarmMonitorEnum.find(item => item.value === detail.value?.monitorType)?.label;
});

const errorHandle = () => {
  uni.showToast({
    title: '获取录音失败，请稍后再试',
    icon: 'none',
  });
};

const play = () => {
  if (denyPlayAudio.value)
    return uni.showToast({
      title: '对讲中，无法播放音频',
      icon: 'none',
    });
  if (!detail.value?.audioUrl) return;
  emits('updateShowPlayer', true);
};

const closeAudioPlayer = () => {
  emits('updateShowPlayer', false);
};
</script>

<style scoped lang="scss" />
