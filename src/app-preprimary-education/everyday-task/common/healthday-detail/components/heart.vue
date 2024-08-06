<template>
  <view class="flex-between padR padB" @click="jumpTo">
    <view class="flex">
      <c-image class="lh-0 mr-b" :src="iconHeartRate" :width="48" :height="48" />
      <view class="bold font-xt"> 心率 </view>
    </view>
    <c-icon name="icon_arrow_right" size="40" color-type="placeholder" />
  </view>
  <view class="flex-around pt-b" @click="jumpTo">
    <view v-for="(item, index) in list" :key="index" class="box p-all-b">
      <view class="color-secondary font-content"> {{ item.name }} </view>
      <view class="flex">
        <view
          :class="['flex font-xxt', index === 2 && item.value > 0 ? 'color-error' : 'color-base']"
          >{{ item.value || 0 }}</view
        >
        <view>{{ item.unit }}</view>
      </view>
    </view>
  </view>
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
    <u-empty-custom v-else text="暂无数据" />
  </view>
</template>

<script lang="ts">
import QiunDataCharts from '@/app-preprimary-education/components/biz/qiun-data-charts/qiun-data-charts.vue';
import {
  statSectionHearts,
  statSectionHeartsParents,
} from '@/app-preprimary-education/services/health-day';
import dayjs from 'dayjs';
import { defineComponent, ref, watchEffect } from 'vue';
import iconHeartRate from '../../../../static/image/heart_rate_icon.png';

export default defineComponent({
  components: {
    QiunDataCharts,
  },
  props: {
    data: {
      type: Object,
      default: {},
    },
    date: {
      type: String,
      default: '',
    },
    studentId: {
      type: String,
      default: '',
    },
    isGuardian: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['toHeartDetail'],
  setup(props, { emit }) {
    const list = ref([
      {
        name: '最大心率',
        value: 0,
        unit: '次/分',
      },
      {
        name: '最小心率',
        value: 0,
        unit: '次/分',
      },
      {
        name: '提醒次数',
        value: 0,
        unit: '',
      },
    ]);

    watchEffect(() => {
      list.value = [
        {
          name: '最大心率',
          value: props.data.maxHeart,
          unit: '次/分',
        },
        {
          name: '最小心率',
          value: props.data.minHeart,
          unit: '次/分',
        },
        {
          name: '提醒次数',
          value: props.data.alarmNum,
          unit: '',
        },
      ];
    });

    const chartData = ref({
      categories: [],
      series: [
        {
          name: '最大心率',
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
        splitNumber: 9,
        data: [
          {
            min: 0,
            max: 180,
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

    const formatData = (data: any) => {
      const xAxisLabel: string[] = [];
      const yAxisData: number[] = [];

      data.distribute.forEach((item: any) => {
        xAxisLabel.push(item.label);
        yAxisData.push(item.value);
      });
      return [xAxisLabel, [...yAxisData.values()]];
    };

    /**近七天人均步数走势图*/
    const getChartData = async () => {
      const params = {
        startDate: dayjs(props.date)
          .set('hour', 9)
          .set('minute', 0)
          .set('second', 0)
          .format('YYYY-MM-DD HH:mm:ss'),
        endDate: dayjs(props.date)
          .set('hour', 16)
          .set('minute', 59)
          .set('second', 59)
          .format('YYYY-MM-DD HH:mm:ss'),
        studentId: props.studentId,
      };
      const res = await (props.isGuardian
        ? statSectionHeartsParents(params)
        : statSectionHearts(params));
      const [xAxisLabel, yAxisData] = formatData(res);
      chartData.value = {
        categories: xAxisLabel,
        series: [
          {
            name: '最大心率',
            data: yAxisData,
          },
        ],
      };
    };

    const jumpTo = () => {
      emit('toHeartDetail', {});
    };

    watchEffect(() => {
      if (props.data && props.studentId) {
        getChartData();
      }
    });

    return {
      list,
      iconHeartRate,
      opts,
      chartData,
      jumpTo,
    };
  },
});
</script>

<style scoped lang="scss">
.box {
  height: 150rpx;
  width: 30%;
  background: #f8f8fa;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.charts-box {
  width: 100%;
  height: 300px;
}
</style>
