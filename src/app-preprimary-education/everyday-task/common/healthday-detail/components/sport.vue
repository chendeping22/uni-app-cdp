<template>
  <view class="flex padR padB">
    <c-image class="lh-0 mr-b" :src="iconSport" :width="48" :height="48" />
    <view class="bold font-xt"> 运动 </view>
  </view>
  <view class="flex-between pt-b">
    <view class="flex font-content color-secondary">
      <view class="font-xxt color-base mr-s"> {{ list?.steps || 0 }} </view> 步
    </view>
    <view class="flex font-content color-secondary">
      消耗 <view class="font-xxt color-warnning mr-s ml-s">{{ list?.calorie || 0 }} </view> 卡路里
    </view>
  </view>

  <view class="flex-between ptb-b">
    <view class="flex boxBlue bg-primary-light-3 color-blue radius-default font-desc">
      打败同年级 <view class=""> {{ list?.winStepRate || 0 }} </view>%
    </view>
    <view class="flex boxBlue bg-primary-light-3 color-blue radius-default font-desc french_fries">
      ≈ <view class="">{{ list?.chipsCount || 0 }} </view> 包 薯条
      <c-image class="lh-0 ml-xs" :src="iconFrenchFries" :width="28" :height="28" />
    </view>
  </view>
  <c-divider class="w100" is-hair-line />
  <view class="mt-s">
    <view class="font-xt color-secondary">运动强度</view>
    <view class="charts-desc mt-s">
      <view class="font-secondary flex-inline color-placeholder">
        低 <view class="ml-s plr-s bg-line-default">0%~60%</view>
      </view>
      <view class="font-secondary flex-inline color-success flex-center">
        中 <view class="ml-s plr-s bg-success-light-3">60%~85%</view>
      </view>
      <view class="font-secondary flex-inline color-warnning flex-end">
        高 <view class="ml-s plr-s bg-error-light-3">85%以上</view>
      </view>
    </view>
  </view>
  <view class="charts-box">
    <!-- <view class="charts-color-area">
      <view class="chart-pink" />
      <view class="chart-green" />
      <view class="chart-gray" />
    </view> -->
    <qiun-data-charts
      v-if="chartData?.categories?.length"
      type="column"
      :opts="opts"
      :chart-data="chartData"
      :animation="true"
      :enable-scroll="true"
      :ontouch="true"
      :canvas2d="true"
      tooltip-format="tooltipFormat1"
    />
    <u-empty-custom v-else text="暂无数据" />
  </view>
</template>

<script lang="ts">
import QiunDataCharts from '@/app-preprimary-education/components/biz/qiun-data-charts/qiun-data-charts.vue';
import {
  statSectionSportParents,
  statSectionSportStrengths,
} from '@/app-preprimary-education/services/health-day';
import dayjs from 'dayjs';
import { defineComponent, ref, watchEffect } from 'vue';
import iconFrenchFries from '../../../../static/image/french_fries_icon.png';
import iconSport from '../../../../static/image/sport_icon.png';

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
  setup(props) {
    const list = ref({});

    const chartData = ref({
      categories: [],
      series: [
        {
          name: '运动强度',
          data: [],
        },
      ],
    });

    const getToolTipArr = () => {
      const list = chartData.value.categories.map((str, index) => {
        return [
          { text: `${str}\t强度\t${chartData.value.series[0].data[index]}%`, color: '#1890FF' },
        ];
      });
      return list;
    };
    const opts = ref({
      color: ['#176bfb', '#fe7c00'],
      dataLabel: false,
      enableScroll: false,
      enableMarkLine: true,
      legend: { itemGap: 24, padding: 15, fontColor: '#1D2129' },
      xAxis: {
        disableGrid: true,
        rotateLabel: true,
      },
      gridType: 'dash',
      dashLength: 4,
      axisLineColor: '#e5e6eb',
      yAxis: {
        data: [
          {
            max: 100,
            min: 0,
            fontColor: '#fff',
            unit: '%',
            format: '1',
            formatter: () => {
              return '123';
            },
          },
        ],
        disableGrid: true,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['#1D2129', '#e5e6eb', '#86909c'],
          },
        },
      },

      extra: {
        column: {
          type: 'group',
          width: 16,
          activeBgOpacity: 0.15,
          seriesGap: 0,
          // activeBgColor: '#fe7c00',
        },
        tooltip: {
          showCategory: true,
          toolTipArr: '',
        },
        markLine: {
          data: [
            {
              value: 60,
              labelText: '60%',
              showLabel: true,
              labelBgOpacity: 0,
              labelBgColor: '#fff',
              labelOffsetX: -3,
              // lineColor: '#f4f4f5',
            },
            {
              value: 85,
              labelText: '85%',
              showLabel: true,
              labelBgOpacity: 0,
              labelBgColor: '#fff',
              labelOffsetX: -5,
              // lineColor: '#dbf1e1',
            },
            {
              value: 100,
              labelText: '100%',
              showLabel: true,
              labelBgOpacity: 0,
              labelBgColor: '#fff',
              labelOffsetX: -5,
              // lineColor: '#fef0f0',
            },
          ],
        },
      },
    });

    const formatData = (data: any) => {
      const xAxisLabel: string[] = [];
      const yAxisData: number[] = [];

      data.distribute.forEach(item => {
        xAxisLabel.push(item.label);
        yAxisData.push(item.value);
      });
      return [xAxisLabel, [...yAxisData.values()]];
    };

    /** 运动强度 */
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
        ? statSectionSportParents(params)
        : statSectionSportStrengths(params));
      console.log('🚀 ~ getChartData ~ res:', res);
      const [xAxisLabel, yAxisData] = formatData(res);
      chartData.value = {
        categories: xAxisLabel,
        series: [
          {
            name: '运动强度',
            data: yAxisData,
          },
        ],
      };
      opts.value.extra.tooltip = {
        showCategory: true,
        toolTipArr: getToolTipArr(),
      };
    };

    watchEffect(() => {
      list.value = props.data;
      if (props.data && props.studentId) {
        getChartData();
      }
    });

    return {
      list,
      iconFrenchFries,
      iconSport,
      chartData,
      opts,
    };
  },
});
</script>

<style scoped lang="scss">
.boxBlue {
  width: fit-content;
  padding: 10rpx;
}
.french_fries {
  width: 200rpx;
  padding-left: 20rpx;
  :deep(.u-image__image) {
    border-radius: 0 !important;
  }
}
.chart {
  height: 100%;
}
.charts-box {
  margin-top: 20rpx;
  width: 100%;
  height: 300px;
}

.charts-color-area {
  position: absolute;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  .chart-pink {
    margin-top: 28rpx;
    background-color: #ffece8;
    justify-content: right;
    width: 525rpx;
    height: 60rpx;
    margin-right: 65rpx;
  }
  .chart-green {
    background-color: #e8ffea;
    justify-content: right;
    width: 525rpx;
    height: 100rpx;
    margin-right: 65rpx;
  }
  .chart-gray {
    background-color: #e5e6eb;
    justify-content: right;
    width: 525rpx;
    height: 240rpx;
    margin-right: 65rpx;
  }
}
.charts-desc {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
</style>
