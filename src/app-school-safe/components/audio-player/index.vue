<template>
  <view class="flex">
    <u-loading
      v-if="[PlayerStatus.LOADING, PlayerStatus.BUFFERING].includes(status)"
      class="color-primary"
      show
      :size="iconSize"
    />
    <u-icon
      v-if="
        [PlayerStatus.NONE, PlayerStatus.CANPLAY, PlayerStatus.PAUSE, PlayerStatus.ENDED].includes(
          status,
        )
      "
      :class="canplay ? 'color-primary' : 'color-disabled'"
      name="play-circle-fill"
      :size="iconSize"
      @click="play"
    />
    <u-icon
      v-if="[PlayerStatus.PLAYING].includes(status)"
      class="color-primary"
      name="pause-circle-fill"
      :size="iconSize"
      @click="pause"
    />
    <u-icon
      v-if="[PlayerStatus.ERROR].includes(status)"
      class="color-error"
      name="reload"
      :size="iconSize"
      @click="play"
    />
    <view class="flex-grow flex">
      <u-slider
        v-model="processPercent"
        class="flex-grow mlr-l"
        :disabled="!canplay"
        @start="startSeek"
        @end="endSeek"
      />
      <view class="no-shrink">{{ currentTimeStr }}/{{ durationStr }}</view>
    </view>
    <slot />
  </view>
</template>

<script lang="ts" setup>
import { formatDuration } from '@/app-school-safe/utils';
import { computed, onBeforeUnmount, ref, toRefs, watch } from 'vue';
import { PlayerStatus } from './constants';

interface IProps {
  autoPlay?: boolean; // 是否自动播放
  url?: string; // 音频地址
  duration?: number; // 音频长度(单位秒), 用于未初始化播放前的时长展示, 加载完成后以实际的音频时长为准
  currentTime?: number; // 当前音频播放位置(单位秒)
  iconSize?: number; // 操作按钮大小
  disabled?: boolean; // 是否禁止播放
  disabledToastContent?: string; // 禁止播放点击时的提示语
}

const props = withDefaults(defineProps<IProps>(), {
  autoPlay: false,
  url: '',
  duration: 0,
  currentTime: 0,
  iconSize: 48,
  disabled: false,
  disabledToastContent: '',
  showBorder: true,
});

const { autoPlay, url, disabled, duration, disabledToastContent } = toRefs(props);

const emits = defineEmits(['statusUpdate', 'error']);

let innerAudioContext: any;
let downloadTask: any;

const status = ref(PlayerStatus.NONE);
const realDuration = ref(duration.value);
const currentTime = ref(0);
const processPercent = ref(0);
const isSeeking = ref(false);

const canplay = computed(() => {
  return url.value && !disabled.value;
});

// 视频时长
const durationStr = computed(() => {
  if (!realDuration.value) return '-';
  const format = realDuration.value > 3600 ? 'HH:mm:ss' : 'mm:ss';
  return formatDuration(realDuration.value, format);
});

// 当前进度时间
const currentTimeStr = computed(() => {
  const format = currentTime.value > 3600 ? 'HH:mm:ss' : 'mm:ss';
  return formatDuration(currentTime.value, format);
});

// 初始化播放器
const initPlayer = (callback?: () => void) => {
  console.log('初始化播放器，播放地址：', url.value);
  innerAudioContext = uni.createInnerAudioContext();
  // 兼容处理android部分音频会加载失败(-99), 改为文件下载模式
  console.log('音频文件开始下载');
  if (downloadTask) downloadTask.abort();
  downloadTask = uni.downloadFile({
    url: url.value,
    success: res => {
      console.log('音频文件下载成功：', res);
      if (res.statusCode === 200) {
        innerAudioContext.src = res.tempFilePath;
        innerAudioContext.autoplay = autoPlay.value;
      }
    },
    fail: (res: any) => {
      console.error('音频文件下载失败', res);
      status.value = PlayerStatus.ERROR;
    },
  });

  innerAudioContext.onCanplay(() => {
    console.log('音频资源准备就绪,可进入播放,总时长', innerAudioContext.duration);
    realDuration.value = innerAudioContext.duration;
    status.value = PlayerStatus.CANPLAY;
    callback?.();
  });

  innerAudioContext.onPlay(() => {
    console.log('开始播放');
    // 资源已就绪的情况下, 才算正式进入播放中状态
    if (status.value === PlayerStatus.CANPLAY) status.value = PlayerStatus.PLAYING;
  });

  innerAudioContext.onPause(() => {
    console.log('暂停播放');
    // 播放中的才可变更为暂停状态，避免外部手动调用暂停，状态变更
    if (status.value === PlayerStatus.PLAYING) status.value = PlayerStatus.PAUSE;
  });

  innerAudioContext.onStop(() => {
    console.log('停止播放');
    // 播放中或暂停中的才可变更为停止状态，避免外部手动调用停止，状态变更
    if ([PlayerStatus.PLAYING, PlayerStatus.PAUSE].includes(status.value))
      status.value = PlayerStatus.STOP;
  });

  innerAudioContext.onEnded(() => {
    console.log('音频播放结束');
    status.value = PlayerStatus.ENDED;
  });

  innerAudioContext.onTimeUpdate(() => {
    if (
      !innerAudioContext?.currentTime ||
      [PlayerStatus.PAUSE, PlayerStatus.ENDED].includes(status.value)
    )
      return;
    if (innerAudioContext.currentTime > 0) status.value = PlayerStatus.PLAYING;
    currentTime.value = innerAudioContext.currentTime;
    processPercent.value = (innerAudioContext.currentTime / innerAudioContext.duration) * 100;
  });

  innerAudioContext.onError((err: any) => {
    console.error(`音频播放失败【${err?.errCode}】: ${err?.errMsg}`);
    destroy();
    status.value = PlayerStatus.ERROR;
    emits('error', {
      errCode: err?.errCode,
      errMsg: err?.errMsg,
    });
  });

  innerAudioContext.onWaiting(() => {
    console.log('音频资源缓冲中');
    status.value = PlayerStatus.BUFFERING;
  });

  innerAudioContext.onSeeking(() => {
    console.log('音频seek中,暂停播放');
    pause();
  });
  innerAudioContext.onSeeked(() => {
    console.log('音频seek完成,继续播放');
    play();
  });
};

const play = () => {
  if (!canplay.value) {
    if (disabled.value && disabledToastContent.value)
      uni.showToast({
        title: disabledToastContent.value,
        icon: 'none',
      });
    return;
  }
  status.value = PlayerStatus.LOADING;
  if (!innerAudioContext || [PlayerStatus.NONE, PlayerStatus.ERROR].includes(status.value)) {
    initPlayer(() => {
      innerAudioContext.play();
    });
  } else {
    innerAudioContext.play();
  }
};

const pause = () => {
  // 暂停播放
  innerAudioContext?.pause();
};

const stop = () => {
  // 停止播放
  innerAudioContext?.stop();
};

const destroy = () => {
  // 销毁下载器
  downloadTask?.abort();
  downloadTask = undefined;
  // 销毁播放器
  innerAudioContext?.destroy();
  innerAudioContext = undefined;

  processPercent.value = 0;
  currentTime.value = 0;
  status.value = PlayerStatus.NONE;
};

// 开始拖动进度条
const startSeek = () => {
  isSeeking.value = true;
  pause();
};

// 结束拖动进度条
const endSeek = () => {
  isSeeking.value = false;
  innerAudioContext.seek((processPercent.value * realDuration.value) / 100);
};

defineExpose({
  play,
  pause,
  stop,
  destroy,
});

watch(canplay, () => {
  if (innerAudioContext) destroy();
  if (canplay.value) initPlayer();
});

watch(status, () => {
  console.log('当前播放器状态', status.value);
  emits('statusUpdate', status.value);
});

watch(processPercent, () => {
  // 对比上一次的播放进度，两次相差1及以上(slider默认步长为1)，视为进度条拖动，调用seek事件
  const prevProcessPercent = (innerAudioContext?.currentTime / realDuration.value) * 100;
  if (Math.abs(processPercent.value - prevProcessPercent) >= 1 && !isSeeking.value) {
    innerAudioContext.seek((processPercent.value * realDuration.value) / 100);
  }
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<style scoped lang="scss">
.radius-card {
  border-radius: $radius-base;
}
</style>
