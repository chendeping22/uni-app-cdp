<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pullDownRefresh="handleOnMount"
  >
    <view v-if="!isPDA">
      <view class="flex">
        <view
          v-for="(item, index) in COLUMNS_LIST"
          :key="item.key"
          :class="[
            'flex-column',
            'col-8',
            {
              'border-right': index < COLUMNS_LIST.length - 1,
              'border-line-default': index < COLUMNS_LIST.length - 1,
            },
          ]"
        >
          <view class="color-secondary font-content no-bold">{{ item.name }}</view>
          <view class="color-base font-xxt bold">{{ formatData(item.key, '%') }}</view>
        </view>
      </view>
      <view class="flex flex-around w100 mt-l">
        <view v-for="item in CIRCLE_LIST" :key="item.key" class="w260 h-260 flex-column">
          <c-circle-progress
            :key="item.key"
            :percent="formatPercent(item.key)"
            :height="260"
            :width="260"
            :border-width="20"
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
    </view>
    <view v-else class="flex flex-between w100 mtb-s plr-l h100">
      <view>
        <view
          v-for="item in COLUMNS_LIST"
          :key="item.key"
          class="color-base flex-between statistic-item"
        >
          <view class="font-secondary">{{ item.name }}</view>
          <view class="font-xt bold ml-s">{{ formatData(item.key, '%') }}</view>
        </view>
      </view>
      <view class="w260 h-260 flex-column">
        <c-circle-progress
          :percent="Number(data.abnormalPercent || '0')"
          :height="260"
          :width="260"
          :border-width="20"
        >
          <view class="flex-column">
            <view class="font-xxt color-base">
              <text class="font-xxt bold">{{ data.abnormalPercent }}</text>
              <text class="color-secondary font-secondary">%</text>
            </view>
            <view class="font-secondary no-bold color-secondary">三检异常率</view>
          </view>
        </c-circle-progress>
      </view>
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import {
  IThreeInspectionData,
  getHealthDayTasks,
  getInspectionDeviceType,
  getThreeInspectionData,
} from '@/services/widgets';
import { loginStore } from '@/store/modules/login';
import type { IWidget } from '@/store/modules/workbench';
import { isNil } from '@/utils/lodash-es';
import widgetCard from '@/widgets/components/widget-card.vue';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const CIRCLE_LIST = [
  {
    key: 'leavePercent',
    name: '今日离园率',
  },
  {
    key: 'abnormalPercent',
    name: '今日异常率',
  },
];

const COLUMNS_LIST = [
  {
    key: 'inspectionMorningProgress',
    name: '晨检进度',
  },
  {
    key: 'inspectionAfternoonProgress',
    name: '午检进度',
  },
  {
    key: 'inspectionEveningProgress',
    name: '晚检进度',
  },
];
const isLoad = ref(false);
const data = ref({
  inspectionMorningProgress: null,
  inspectionAfternoonProgress: null,
  inspectionEveningProgress: null,
  leavePercent: null,
  abnormalPercent: null,
} as IThreeInspectionData);
const isPDA = ref(false);
const isShowMorningAndnoon = ref(false);

/** 调用API，获取真实数据 */
async function fetchData() {
  const res = await getThreeInspectionData();
  return res || {};
}

async function getPermissions() {
  const userInfo = loginStore().userInfo;
  const res = await getHealthDayTasks(userInfo?.id || '');
  if (!res) {
    isShowMorningAndnoon.value = false;
  } else {
    isShowMorningAndnoon.value = true;
  }
}

async function getDeviceType() {
  const res = await getInspectionDeviceType(false);
  if (res) isPDA.value = res.deviceType === 2;
}

async function handleOnMount() {
  getPermissions();
  getDeviceType();
  let res = await fetchData();

  data.value = {
    ...res,
  };
  isLoad.value = true;
}

onMounted(() => {
  handleOnMount();
});

const handleClickNavigator = () => {
  if (!isPDA.value && isShowMorningAndnoon.value) {
    uni.navigateTo({
      url: '/app-preprimary-education/everyday-task/widget/morning-noon/index',
    });
  } else {
    uni.navigateTo({
      url: `/app-preprimary-education/everyday-task/widget/inspection-record/index?data=${dayjs().format(
        'YYYY-MM-DD',
      )}&isHistory=0`,
    });
  }
};

const formatData = (key: string, unit?: string) => {
  const value = data.value[key];
  return isNil(value) ? '/' : value + (unit || '');
};

const formatPercent = (key: string) => {
  return Number(data.value[key] || 0);
};
</script>

<style lang="scss" scoped>
.extend-info {
  margin-top: 70rpx;
}

.h-260 {
  height: 260rpx;
}

.w-260 {
  height: 260rpx;
}
.statistic-item {
  margin-top: 4px;
  width: 250rpx;
}
</style>
