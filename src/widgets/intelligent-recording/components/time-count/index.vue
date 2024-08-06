<template>
  <view>
    <text v-if="showCount">{{ title }}{{ timeCount }}</text>
    <text v-else>直播中</text>
  </view>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
type TProps = {
  startTime?: number;
  title?: string;
};
const viewerProp = withDefaults(defineProps<TProps>(), {
  startTime: 0,
  title: '',
});
const fiveMinutes = 5 * 60 * 1000;

const timeCount = ref(''); // 倒计时时间显示
const timer = ref();
const showCount = ref(true); // 开始时间与当前时间差

const formatNum = (time: number) => {
  return time?.toString().padStart(2, '0');
};

/**计时器格式处理 */
const formatTime = (hour: number, min: number) => {
  return `${formatNum(hour)}:${formatNum(min)}`;
};

const calculationInterval = (duration: number) => {
  const hourSeconds = 60 * 60 * 1000;
  const hour: number = Math.floor(duration / hourSeconds) ?? 0;
  const min: number = Math.floor((duration - hour * hourSeconds) / (60 * 1000)) ?? 0;
  const second: number = Math.floor((duration - hour * hourSeconds - min * 60 * 1000) / 1000) ?? 0;
  return { hour, min, second };
};

const handleTimeCount = () => {
  if (!viewerProp?.startTime) return;
  const nowTime = +new Date();
  const t = viewerProp?.startTime - nowTime;
  showCount.value = t >= 1000;
  if (t >= 0 && t <= fiveMinutes) {
    const { hour, min } = calculationInterval(t);
    timeCount.value = formatTime(hour, min);
  }
  if (t < 0) {
    clearInterval(timer.value);
  }
};

onMounted(() => {
  handleTimeCount();
  timer.value = setInterval(() => {
    handleTimeCount();
  }, 30000);
});

onUnmounted(() => {
  clearInterval(timer.value);
});
</script>
