<template>
  <view @click="jumpTo">
    <view class="flex-between mb-b">
      <view class="bold font-xt"> 睡眠数据 </view>
      <c-icon class="mr-s" name="icon_arrow_right" size="40" color-type="placeholder" />
    </view>
    <view class="flex-around pb-b">
      <view class="text-center w33p lineR">
        <view class="color-secondary font-secondary"> 人均睡眠时长 </view>
        <view class="flex-center">
          <view class="font-xxt color-base mr-xxs bold"> {{ list?.sleepTimeAvg || '0' }} </view>
          <view class="color-secondary font-secondary"> 分钟 </view>
        </view>
      </view>
      <view class="text-center w33p lineR">
        <view class="color-secondary font-secondary"> 人均深度睡眠时长 </view>
        <view class="flex-center">
          <view class="font-xxt color-base mr-xxs bold"> {{ list?.deepSleepTimeAvg || '0' }} </view>
          <view class="color-secondary font-secondary"> 分钟 </view>
        </view>
      </view>
      <view class="text-center w33p">
        <view class="color-secondary font-secondary"> 人均浅度睡眠时长 </view>
        <view class="flex-center">
          <view class="font-xxt color-base mr-xxs bold">
            {{ list?.shallowSleepTimeAvg || '0' }}
          </view>
          <view class="color-secondary font-secondary"> 分钟 </view>
        </view>
      </view>
    </view>
  </view>
  <view class="color-secondary mb-b bold font-title"> 近七天人均睡眠时长对比图 </view>
  <view class="charts-box">
    <qiun-data-charts
      type="column"
      :opts="opts"
      :chart-data="chartData"
      :animation="true"
      :enable-scroll="true"
      :ontouch="true"
      :canvas2d="true"
      tooltip-format="tooltipCustom1"
    />
  </view>
</template>

<script lang="ts" setup>
import QiunDataCharts from '@/app-preprimary-education/components/biz/qiun-data-charts/qiun-data-charts.vue';
import {
  avgByStudentSleep,
  statisticsAvgByDay,
} from '@/app-preprimary-education/services/health-day';
import { cloneDeep } from '@/utils/lodash-es';
import dayjs from 'dayjs';
import { ref, watchEffect } from 'vue';

/** 1. props定义 */
interface IProps {
  classIds?: string[];
  date?: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {
  classIds: [],
  date: '',
});

const emits = defineEmits(['jumpToStudentRecord']);
const list = ref({});
const maxValue = ref(0);
const chartData = ref({
  categories: [],
  series: [
    {
      name: '人均深度睡眠时长',
      data: [],
    },
    {
      name: '人均浅度睡眠时长',
      data: [],
    },
  ],
});
const colorList = ['#3491FA', '#FC8452', '#FE7C00', '#F53F3F', '#ea7ccc'];
const opts = ref({
  color: cloneDeep(colorList),
  unit: '分',
  padding: [15, 15, 0, 5],
  legend: {
    itemGap: 10,
    padding: 15,
    fontColor: '#1D2129',
  },
  // enableScroll: true,
  dataLabel: false,
  xAxis: {
    disableGrid: true,
    calibration: true,
    fontColor: '#1D2129',
    gridColor: '#e5e6eb',
    axisLineColor: '#e5e6eb',
    fontSize: 12,
    itemCount: 5,
    scrollShow: false,
    rotateLabel: true, // 文字旋转(这个是自动的, 文字不够显示时才会旋转)
  },
  yAxis: {
    gridType: 'dash',
    dashLength: 4,
    axisLineColor: '#e5e6eb',
    data: [
      {
        axisLine: false,
        max: 80,
        min: 0,
        fontColor: '#86909c',
        unit: '分',
      },
    ],
  },
  extra: {
    column: {
      type: 'stack',
      width: 16,
      activeBgOpacity: 0.15,
    },
    tooltip: {
      showCategory: true,
    },
  },
  series: {
    show: false,
  },
});

const jumpTo = () => {
  emits('jumpToStudentRecord', {});
};

const getAvgByStudent = async () => {
  const data = {
    date: props.date,
    classIds: props.classIds,
  };
  const res = await avgByStudentSleep(data);
  list.value = res;
};
/**近七天人均步数走势图*/
const getChartData = async () => {
  const params = {
    startDate: dayjs(props.date).subtract(6, 'day').format('YYYY-MM-DD'),
    date: props.date,
    classIds: props.classIds,
  };
  const res = await statisticsAvgByDay(params);
  const dateList: string[] = [];
  const deepList: number[] = [];
  const lightList: number[] = [];
  res?.map((item: any) => {
    dateList.push(item.label);
    deepList.push(item.distribute[0].value);
    lightList.push(item.distribute[1].value);
  });
  const maxDeepList = Math.max(...deepList);
  const maxLightList = Math.max(...lightList);
  const maxValue = maxDeepList > maxLightList ? maxDeepList : maxLightList;
  opts.value.yAxis.data[0].max = maxValue > 100 ? maxValue : 100;
  chartData.value = {
    categories: dateList,
    series: [
      {
        name: '人均深度睡眠时长',
        data: deepList,
      },
      {
        name: '人均浅度睡眠时长',
        data: lightList,
      },
    ],
  };
};
watchEffect(() => {
  getChartData();
  getAvgByStudent();
});
</script>

<style scoped lang="scss">
.text-center {
  text-align: center;
}
.w33p {
  width: 33.33%;
}
.lineR {
  border-right: 1px solid #ddd;
}
.charts-box {
  width: 100%;
  height: 300px;
}
</style>
