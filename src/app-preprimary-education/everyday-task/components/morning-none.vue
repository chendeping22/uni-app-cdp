<template>
  <view class="flex-between mb-b">
    <view class="bold font-xt"> 今日三检 </view>
    <c-icon name="icon_arrow_right" size="40" color-type="placeholder" />
  </view>
  <view v-if="!isPDA" class="flex-around">
    <view v-for="item in CIRCLE_LIST" :key="item.key" class="w260 h-260 flex-column">
      <c-circle-progress
        :key="item.key"
        :percent="formatPercent(item.key)"
        :height="260"
        :width="260"
        :border-width="20"
        :active-color="item.type"
      >
        <view class="flex-column">
          <view class="font-xxt color-base">
            <text class="font-xxt bold">{{ formatData(item.key) }}</text>
            <text v-if="!isNil(data[item.key])" class="color-secondary font-secondary">%</text>
          </view>
          <view class="font-secondary no-bold color-secondary">{{ item.name }}</view>
        </view>
      </c-circle-progress>
    </view>
  </view>
  <view v-else class="flex flex-between w100 mtb-s plr-l">
    <view>
      <view class="color-base flex-between statistic-item">
        <view class="flex">
          <c-image class="lh-0 mr-xs" :src="iconMorning" :width="28" :height="28" />
          <text class="font-secondary">晨检进度</text>
        </view>
        <view>
          <text class="font-xt bold ml-s">{{ data.inspectionMorningProgress }}%</text>
        </view>
      </view>
      <view class="color-base flex-between statistic-item">
        <view class="flex">
          <c-image class="lh-0 mr-xs" :src="iconNoon" :width="28" :height="28" />
          <text class="font-secondary">午检进度</text>
        </view>
        <view>
          <text class="font-xt bold ml-s">{{ data.inspectionAfternoonProgress }}%</text>
        </view>
      </view>
      <view class="color-base flex-between statistic-item">
        <view class="flex">
          <c-image class="lh-0 mr-xs" :src="iconEvening" :width="28" :height="28" />
          <text class="font-secondary">晚检进度</text>
        </view>
        <view>
          <text class="font-xt bold ml-s">{{ data.inspectionEveningProgress }}%</text>
        </view>
      </view>
    </view>
    <view class="w260 h-260 flex-column">
      <c-circle-progress
        :percent="data.abnormalPercent || 0"
        :height="260"
        :width="260"
        :border-width="20"
        active-color="#FC8452"
      >
        <view class="flex-column">
          <view class="color-base">
            <text class="font-xxt bold">{{ data.abnormalPercent }}</text>
            <text class="color-secondary">%</text>
          </view>
          <view class="no-bold color-secondary">三检异常率</view>
        </view>
      </c-circle-progress>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { IThreeInspectionData } from '@/app-preprimary-education/services/health-day';
import { isNil } from '@/utils/lodash-es';
import { ref, watchEffect } from 'vue';
import iconEvening from '../../static/image/evening_icon.png';
import iconMorning from '../../static/image/morning_icon.png';
import iconNoon from '../../static/image/noon_icon.png';

/** 1. props定义 */
interface IProps {
  data?: string | string[];
  isPDA?: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {
  data: '',
  isPDA: false,
});

/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits([]);
// emits('XXX', val); // 用法

const CIRCLE_LIST = [
  {
    key: 'leavePercent',
    name: '离园率',
    type: '#1890FF',
  },
  {
    key: 'abnormalPercent',
    name: '异常率',
    type: '#FC8452',
  },
];
const data = ref({
  leavePercent: null,
  abnormalPercent: null,
} as IThreeInspectionData);

const formatPercent = (key: string) => {
  return Number(data.value[key] || 0);
};
const formatData = (key: string, unit?: string) => {
  const value = data.value[key];
  return isNil(value) ? '0' : value + (unit || '');
};
watchEffect(() => {
  data.value = props.data;
});
</script>
<style lang="scss" scoped>
.statistic-item {
  margin-top: 4px;
  width: 250rpx;
}
</style>
