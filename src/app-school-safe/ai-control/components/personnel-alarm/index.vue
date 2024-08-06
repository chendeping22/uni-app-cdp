<template>
  <c-card class="person-monitor-container">
    <view class="box">
      <view class="title">
        <view class="title-size">人员布控告警</view>
        <view class="sub-title-size">{{ total }}</view>
      </view>
      <view class="mt-b">
        <AlarmStatisticsBar v-if="data?.length" :data="data" :denominator="denominator" />
        <c-empty v-else content="暂无数据" top="0" />
      </view>
    </view>
  </c-card>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { IAlarmDataItem } from '../../../services/ai-control';
import AlarmStatisticsBar from '../alarm-statistics-bar/index.vue';

defineProps({
  data: {
    type: Array as PropType<Array<IAlarmDataItem>>,
    default() {
      return [];
    },
  },
  denominator: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
});
</script>

<style lang="scss" scoped>
.box {
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #1d2129;
    .title-size {
      font-size: 34rpx;
      font-weight: 600;
    }
    .sub-title-size {
      font-size: 30rpx;
    }
  }
}
</style>
