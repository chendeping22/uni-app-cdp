<template>
  <view class="common-card components-persist-info">
    <text class="common-title">告警进展</text>
    <view class="common-item">
      <text class="common-label">事件状态</text>
      <text class="common-value">{{
        eventStatus === EventStatusCode.PENDING ? '持续中' : '已结束'
      }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">更新时间</text>
      <text class="common-value">{{
        dayjs(eventStatus === EventStatusCode.PENDING ? snapTime : secondSnapTime).format(
          'YYYY-MM-DD HH:mm:ss',
        )
      }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">持续时间</text>
      <text class="common-value">{{ showTimeStr }}</text>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { formatDurationByDiffTime } from '@/app-school-safe/utils';
import dayjs from 'dayjs';
import { onBeforeMount, onMounted, ref, toRefs } from 'vue';
import { EventStatusCode } from '../../constants/EventStatusEnum';

interface IProps {
  eventStatus: EventStatusCode;
  snapTime?: number | string;
  secondSnapTime?: number | string;
}

const props = withDefaults(defineProps<IProps>(), {
  snapTime: dayjs().valueOf(),
  secondSnapTime: dayjs().valueOf(),
});

const { eventStatus, snapTime, secondSnapTime } = toRefs(props);

const timer = ref();
const showTimeStr = ref();

onMounted(() => {
  timer.value = setInterval(() => {
    showTimeStr.value = formatDurationByDiffTime(
      dayjs(snapTime.value).valueOf(),
      eventStatus.value === EventStatusCode.PENDING
        ? dayjs().valueOf()
        : dayjs(secondSnapTime.value).valueOf(),
    );
  }, 1000);
});

onBeforeMount(() => {
  timer.value && clearInterval(timer.value);
});
</script>
<style scoped lang="scss">
@import '@/app-school-safe/styles/alarm-card.scss';
</style>
