<template>
  <view @click="jumpTo">
    <view class="flex-between mb-b">
      <view class="bold font-xt"> 运动数据 </view>
      <c-icon class="mr-s" name="icon_arrow_right" size="40" color-type="placeholder" />
    </view>
    <view class="flex-around mb-b">
      <view class="text-center w50p lineR">
        <view class="font-content color-secondary"> 人均步数 </view>
        <view class="bold font-xxt font-base"> {{ list?.stepAvg || '0' }}</view>
      </view>
      <view class="text-center w50p">
        <view class="font-content color-secondary"> 人均卡路里 </view>
        <view class="bold font-xxt font-base"> {{ list?.caloriesAvg || '0' }}</view>
      </view>
    </view>
  </view>
  <view class="color-secondary bold font-title mb-b"> 近七天人均步数走势图 </view>
  <view class="charts-box">
    <qiun-data-charts
      v-if="chartData?.categories?.length"
      type="line"
      :opts="opts"
      :chart-data="chartData"
      :animation="false"
      canvas-id="d185569bdaad"
      :canvas2d="true"
    />
    <c-empty v-else />
  </view>
</template>

<script lang="ts" setup>
import QiunDataCharts from '@/app-preprimary-education/components/biz/qiun-data-charts/qiun-data-charts.vue';
import {
  avgByStudent,
  statisticsStepAvgByDay,
} from '@/app-preprimary-education/services/health-day';
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

/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const emits = defineEmits(['jumpToStudentRecord']);
// emits('XXX', val); // 用法
const list = ref({});
const chartData = ref({});
const opts = ref({
  color: [
    '#91CB74',
    '#1890FF',
    '#FAC858',
    '#EE6666',
    '#73C0DE',
    '#3CA272',
    '#FC8452',
    '#9A60B4',
    '#ea7ccc',
  ],
  enableScroll: false,
  dataLabel: false,
  legend: {},
  xAxis: {
    disableGrid: true,
    rotateLabel: true,
  },
  enableMarkLine: true,
  yAxis: {
    gridType: 'dash',
    dashLength: 2,
    data: [
      {
        min: 0,
        max: 100,
      },
    ],
  },
  extra: {
    line: {
      type: 'straight',
      width: 2,
      activeType: 'hollow',
      onShadow: true,
    },
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
  const res = await avgByStudent(data);
  list.value = res;
};
const formatData = (data: any) => {
  const xAxisLabel: string[] = [];
  const yAxisData = new Map();
  data.forEach(({ label, distribute }) => {
    xAxisLabel.push(label);
    distribute.forEach(item => {
      const currentMap = yAxisData.get(item.label) || [];
      yAxisData.set(item.label, [...currentMap, item.value]);
    });
  });

  return [xAxisLabel, [...yAxisData.keys()], [...yAxisData.values()]];
};
/**近七天人均步数走势图*/
const getChartData = async () => {
  const params = {
    startDate: dayjs(props.date).subtract(6, 'day').format('YYYY-MM-DD'),
    date: props.date,
    classIds: props.classIds,
  };
  const res = await statisticsStepAvgByDay(params);
  const [xAxisLabel, yAxisLabel, yAxisData] = formatData(res);
  const maxValue = Math.max(...yAxisData[0]);
  opts.value.yAxis.data[0].max = maxValue > 6000 ? maxValue : 7000;
  chartData.value = {
    categories: xAxisLabel,
    series: [
      {
        name: yAxisLabel,
        data: yAxisData[0],
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
.w50p {
  width: 50%;
}
.lineR {
  border-right: 1px solid #ddd;
}
.charts-box {
  width: 100%;
  height: 300px;
}
</style>
