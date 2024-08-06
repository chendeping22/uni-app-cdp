<template>
  <view class="">
    <view class="item-card">
      <view class="">
        {{ title }}
      </view>
      <view class="">
        <qiun-data-charts type="line" :opts="pageData.opts" :chartData="chartData" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue';
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
});
const pageData = reactive({
  opts: {
    color: ['#176BFB', '#FE7C00'],
    dataLabel: false,
    xAxis: {
      disableGrid: true,
      calibration: true,
      fontColor: '#86909C',
      rotateLabel: true,
    },
    yAxis: {
      data: [
        {
          // min: 3,
          // max: 5.5,
          axisLine: false,
          fontColor: '#86909C',
          tofix: 1,
        },
      ],
    },
    extra: {
      // column: {
      // 	type: "group"
      // },
      line: {
        type: 'curve',
        width: 2,
      },
    },
  },
});
</script>

<style lang="scss" scoped></style>
