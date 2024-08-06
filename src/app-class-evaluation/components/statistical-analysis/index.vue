<script setup lang="ts">
import QiunDataCharts from '@/widgets/components/qiun-data-charts/qiun-data-charts/qiun-data-charts.vue';

import { map, orderBy } from 'lodash-es';
import { ref, watch } from 'vue';
const componentPlaceholder = {
  'qiun-data-charts': 'view',
};

const props = defineProps<{ sourceData: any; scrollTop?: number }>();
const list = [
  {
    name: '失分',
  },
  {
    name: '加分',
  },
];
const current = ref<number>(0);
const rendeData = ref<{ analyseDetail: any[]; totalScore: number }>({
  analyseDetail: [],
  totalScore: 0,
});
const colorList = [
  '#1677FF',
  '#91CB74',
  '#FAC858',
  '#EE6666',
  '#73C0DE',
  '#3CA272',
  '#FC8452',
  '#9A60B4',
  '#ea7ccc',
];
const opts = ref({
  color: colorList,
  padding: [5, 5, 5, 5],
  dataLabel: true,
  enableScroll: false,
  legend: {
    show: false,
  },
  title: {
    name: '100',
    fontSize: 20,
    color: '#000000e0',
  },
  subtitle: { show: false, name: undefined },
  extra: {
    ring: {
      ringWidth: 22,
      activeOpacity: 1,
      activeRadius: 8,
      offsetAngle: 0,
      labelWidth: 0,
      border: false,
      borderWidth: 1,
    },

    tooltip: {
      showArrow: false,
      borderRadius: 4,
      borderWidth: 1,
      bgColor: '#ffffff',
      fontColor: '#000000a6',
      bgOpacity: 1,
      borderOpacity: 0.2,
    },
  },
});
const chartData = ref<{
  categories: [];
  series: [];
}>({
  categories: [],
  series: [],
});
const handleChange = index => {
  if (index === 0) {
    rendeData.value = props.sourceData?.subtract;
  } else {
    rendeData.value = props.sourceData?.add;
  }
  opts.value.title.name = rendeData.value?.totalScore;
  chartData.value.series = [
    {
      data: orderBy(
        map(rendeData.value?.analyseDetail, i => {
          return {
            name: i.primaryIndicatorName,
            value: i.scoreType,
            labelShow: false,
          };
        }),
        ['value'],
        ['desc'],
      ),
    },
  ];
};
watch(
  () => props.sourceData,
  () => {
    handleChange(current.value);
  },
  { immediate: true },
);
</script>

<template>
  <view class="main-content">
    <view class="main-content-header">
      <view class="main-content-header-title">统计分析</view>
      <view style="width: 260rpx">
        <u-subsection
          font-size="26"
          v-model="current"
          :list="list"
          mode="button"
          @change="handleChange"
        ></u-subsection
      ></view>
    </view>
    <template v-if="rendeData?.analyseDetail?.length">
      <view>
        <qiun-data-charts
          style="height: 440rpx"
          :canvas-id="`officeLine_${Math.ceil(Math.random() * 1000000)}`"
          type="ring"
          :opts="opts"
          :chart-data="chartData"
          :canvas2d="true"
          :pageScrollTop="scrollTop"
          tooltip-format="consumableManagement"
          :ontouch="false"
          :echarts-resize="true"
          :in-scroll-view="true"
        />
      </view>
      <view class="table-wrap">
        <u-table border-color="#E1E1E1">
          <u-tr>
            <u-th style="flex: 1.5">
              <view style="padding-left: 32rpx; text-align: left">类别</view>
            </u-th>
            <u-th>分数</u-th>
            <u-th>百分比</u-th>
          </u-tr>
          <u-tr v-for="(item, index) in orderBy(rendeData?.analyseDetail, ['scoreType'], ['desc'])">
            <u-td style="flex: 1.5; text-align: left !important; overflow: hidden"
              ><view class="type-box">
                <view class="type-box-icon" :style="{ background: colorList[index % 9] }"></view>
                <view class="type-box-name">{{ item.primaryIndicatorName }}</view></view
              ></u-td
            >
            <u-td>{{ item.scoreType }}</u-td>
            <u-td>{{ item.percent.toFixed(2) }}%</u-td>
          </u-tr>
        </u-table>
      </view>
    </template>

    <view v-else style="padding-top: 48rpx">
      <u-empty-custom text="暂无数据" mode="data" card></u-empty-custom>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.main-content {
  margin-top: 24rpx;
  padding-bottom: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  &-header {
    padding: 0 32rpx;
    height: 96rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    font-family: 'PingFang SC';
    &-title {
      color: #000000;
      font-size: 32rpx;
    }
  }
}
.type-box {
  padding-left: 24rpx;
  display: flex;
  overflow: hidden;
  align-items: center;
  &-icon {
    width: 20rpx;
    height: 20rpx;
    margin-right: 12rpx;
    border-radius: 100%;
  }
  &-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }
}
</style>
