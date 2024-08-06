<template>
  <view class="circle-container">
    <c-circle-progress
      :percent="percent"
      :height="220"
      :width="440"
      :start-angle="270"
      :end-angle="90"
      :border-width="20"
    >
      <view class="extend-info">
        <view class="count">{{ count }}</view>
        <view>{{ `${numberText}/${countText}` }}</view>
      </view>
    </c-circle-progress>
  </view>
</template>
<script lang="ts" setup>
import { isNil } from '@/utils/lodash-es';
import { ref, watch } from 'vue';

interface Props {
  attendance: number;
  shouldArrive: number;
  attendanceText: string;
  shouldArriveText: string;
}
const props = withDefaults(defineProps<Props>(), {
  attendance: 0,
  shouldArrive: 0,
  attendanceText: '出勤人数',
  shouldArriveText: '应到人数',
});
const count = ref('0/0');
const percent = ref();
const countText = ref(props.shouldArriveText);
const numberText = ref(props.attendanceText);

watch(
  () => [props.attendance, props.shouldArrive],
  () => {
    count.value =
      isNil(props.attendance) || isNil(props.shouldArrive)
        ? '0 / 0'
        : `${props.attendance}/${props.shouldArrive}`;
    percent.value =
      isNil(props.attendance) || !props.shouldArrive
        ? 0
        : ((props.attendance * 1.0) / props.shouldArrive) * 100;
  },
);
</script>
<style lang="scss" scoped>
.extend-info {
  margin-top: 90rpx;
}
.circle-container {
  display: flex;
  justify-content: center;
}
.count {
  height: 52rpx;
  text-align: center;
  font-weight: bold;
  font-size: 40rpx;
  color: #1d2129;
}
</style>
