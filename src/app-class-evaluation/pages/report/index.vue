<script setup lang="ts">
import DateSelector from '@/app-class-evaluation/components/date-selector/index.vue';
import { DateTypeEnum, LimitTypeEnum } from '@/app-class-evaluation/components/date-selector/type';
import MonthReport from './month/index.vue';
import WeekReport from './week/index.vue';

import { reactive } from 'vue';

const list = [{ name: '周报表' }, { name: '月汇总' }];

const state = reactive<{
  date?: number;
  current: number;
  reportDate?: number;
  startRange?: string;
}>({ current: 0 });

const handleReportDate = () => {
  state.reportDate = state.startRange ? state.date : undefined;
};

const change = (index: number) => {
  state.current = index;
  handleReportDate();
};

const handleDateChange = (val: any) => {
  state.startRange = val?.startRange;
  state.date = val?.data;
  handleReportDate();
};
</script>

<template>
  <view class="report">
    <view class="report-tab">
      <u-tabs :list="list" :is-scroll="false" v-model="state.current" @change="change"></u-tabs>
      <view class="report-tab-date">
        <DateSelector
          v-model="state.date"
          :date-type="state.current === 1 ? DateTypeEnum.Month : DateTypeEnum.Day"
          :limit-type="LimitTypeEnum.Evaluate"
          @on-change="handleDateChange"
        />
      </view>
    </view>
    <view class="report-scroll">
      <WeekReport v-if="state.current === 0" :date="state.reportDate"></WeekReport>
      <MonthReport v-if="state.current === 1" :date="state.reportDate"></MonthReport>
    </view>
    <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
  </view>
</template>

<style lang="scss" scoped>
.report {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  &-tab {
    position: fixed;
    width: 100%;
    z-index: 3;
    &-date {
      background-color: $color-bg-container;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx 0;
    }
  }
}
.report-scroll {
  height: 100%;
  flex: 1;
  margin-top: 160rpx;
}
</style>
