<template>
  <view @click="jumpTo">
    <view class="flex-between mb-b">
      <view class="bold font-xt"> 心率数据 </view>
      <c-icon class="mr-s" name="icon_arrow_right" size="40" color-type="placeholder" />
    </view>
    <view class="flex-around mb-b">
      <view class="text-center w50p lineR">
        <view class="font-content color-secondary"> 提醒人数 </view>
        <view class="bold font-xxt font-base"> {{ list?.heartRemindStudent || '0' }} </view>
      </view>
      <view class="text-center w50p">
        <view class="font-content color-secondary"> 提醒次数 </view>
        <view class="bold font-xxt font-base"> {{ list?.heartRemindCount || '0' }} </view>
      </view>
    </view>
  </view>
  <view class="font-content mb-b bold font-title"> 近七天心率提醒次数折线图 </view>
  <view class="charts-box pb-b">
    <qiun-data-charts
      v-if="chartData?.categories?.length"
      type="line"
      :opts="opts"
      :chart-data="chartData"
      :canvas2d="true"
      :animation="false"
      canvas-id="bcb8abed2873"
    />
    <c-empty v-else />
  </view>
  <view class="font-content color-placeholder">
    {{ props.date }}心率提醒阈值：大于{{ heartValue }} bpm
  </view>
</template>

<script lang="ts" setup>
import QiunDataCharts from '@/app-preprimary-education/components/biz/qiun-data-charts/qiun-data-charts.vue';
import {
  getHisDayQuery,
  remind,
  statisticByDay,
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

const emits = defineEmits(['jumpToStudentRecord']);
const list = ref({});
const heartValue = ref(0);
const chartData = ref({
  categories: [],
  series: [
    {
      name: '心率提醒人数',
      data: [],
    },
  ],
});
const opts = ref({
  color: ['#EE6666', '#73C0DE', '#3CA272', '#FC8452', '#9A60B4', '#ea7ccc'],
  padding: [15, 10, 0, 15],
  enableScroll: false,
  dataLabel: false,
  legend: {},
  xAxis: {
    disableGrid: true,
    rotateLabel: true,
  },

  yAxis: {
    gridType: 'dash',
    dashLength: 2,
    data: [
      {
        min: 0,
        max: 1,
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
  const res = await statisticByDay(params);
  const [xAxisLabel, yAxisLabel, yAxisData] = formatData(res);
  const maxValue = Math.max(...yAxisData[0]);
  opts.value.yAxis.data[0].max = maxValue > 150 ? maxValue : heartValue.value + 160;
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
const getAvgByStudent = async () => {
  const data = {
    date: props.date,
    classIds: props.classIds,
  };
  const res = await remind(data);
  list.value = res;
};
const getHeart = async () => {
  const res = await getHisDayQuery(props.date);
  // opts.value.extra.markLine.data[0].value = res?.heart;
  heartValue.value = res?.heart;
};
watchEffect(() => {
  getHeart();
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
