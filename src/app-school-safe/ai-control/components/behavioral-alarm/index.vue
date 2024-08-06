<template>
  <c-card class="person-monitor-container">
    <view class="box">
      <view class="title">
        <view class="title-size">行为布控告警</view>
        <view class="sub-title-size">{{ total }}</view>
      </view>
      <view class="mt-b">
        <view v-if="data?.length > 0">
          <view class="chart-box">
            <qiun-data-charts
              canvas2d
              type="ring"
              :opts="barOptions"
              :chart-data="renderData"
              :echarts-resize="true"
              :enable-scroll="true"
              :in-scroll-view="true"
            />
          </view>
          <AlarmStatisticsBar :data="data" :denominator="denominator" />
        </view>
        <c-empty v-else content="暂无数据" top="0" />
      </view>
    </view>
  </c-card>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import QiunDataCharts from '../../../components/biz/qiun-data-charts/qiun-data-charts.vue';
import { IAlarmDataItem } from '../../../services/ai-control';
import AlarmStatisticsBar from '../alarm-statistics-bar/index.vue';

const props = defineProps({
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

const barOptions = computed(() => {
  const options = {
    padding: 0,
    legend: { show: true, position: 'right' },
    title: {
      name: undefined,
      fontSize: 22,
      color: '#1D2129',
      show: false,
    },
    subtitle: { show: false, name: undefined },
    extra: {
      ring: {
        customRadius: 48,
        ringWidth: 8,
        labelWidth: 2,
        border: false,
      },
    },
  };
  return options;
});

const renderData = computed(() => {
  const max = 5;
  let data = [];
  const actionMonitorDataLength = props?.data?.length;
  const other = {
    name: '其他',
    value: 0,
  };
  data = props?.data
    .map((item, index) => {
      if (index < max) {
        return item;
      } else {
        other.value += item.value;
      }
    })
    .filter(Boolean);
  if (actionMonitorDataLength > max) {
    data = data.concat(other);
  }
  const chartData = {
    series: [{ data }],
  };
  return chartData;
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
  .chart-box {
    width: 100%;
    height: 400rpx;
  }
}
</style>
