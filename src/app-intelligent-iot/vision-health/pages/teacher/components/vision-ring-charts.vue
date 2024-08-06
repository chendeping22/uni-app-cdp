<template>
  <view class="">
    <view class="item-card">
      <view class="zy-border-solid-bottom zy-padding-bottom zy-padding-top-xs">
        {{ title }}
      </view>
      <view class="" style="height: 400rpx">
        <qiun-data-charts
          canvas2d
          type="ring"
          :tap-legend="false"
          :opts="opts"
          :chart-data="chartData"
          tooltip-format="tooltipRate"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import QiunDataCharts from '@/app-intelligent-iot/vision-health/pages/teacher/components/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  canvasId: {
    type: String,
    default: '',
  },
  chartData: {
    type: Object,
    default: () => {},
  },
  myopiaRate: {
    type: [String, Number],
    default: 0,
  },
});
const opts = computed(() => {
  return {
    rotate: false,
    rotateLock: false,
    color: ['#176BFB', '#0FC6C2', '#F53F3F'],
    dataLabel: false,
    padding: [30, 50, 30, 0],
    legend: {
      show: true,
      position: 'right',
      lineHeight: 25,
    },
    title: {
      name: Number((props.myopiaRate * 100).toFixed(2)) + '%',
      fontSize: 22,
      color: '#1D2129',
    },
    subtitle: {
      name: '近视率',
      fontSize: 14,
      color: '#86909C',
    },
    extra: {
      ring: {
        ringWidth: 10,
        activeOpacity: 0.5,
        activeRadius: 10,
        offsetAngle: 0,
        labelWidth: 15,
        border: false,
        borderWidth: 3,
        borderColor: '#FFFFFF',
      },
    },
  };
});
</script>
