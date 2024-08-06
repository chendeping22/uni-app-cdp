<template>
  <c-popup
    v-model:show="showPopup"
    width="90%"
    :safe-area-inset-bottom="true"
    :z-index="9999999999"
    :mask-close-able="true"
    :mode="'center'"
    :mask-custom-style="{ background: 'rgba(0, 0, 0, 0.5)' }"
    @close="closePopup"
  >
    <view class="ptb-xl">
      <view>
        <view class="flex-between alarm-type-box">
          <c-button
            v-for="(item, inx) in typeList"
            :key="inx"
            :custom-style="{
              background: activeInx === inx ? '#176bfb' : '#f2f3f4',
              color: activeInx === inx ? '#ffffff' : '#4E5969',
              fontWeight: 600,
            }"
            width="160rpx"
            :icon-size="28"
            height-size="button-xxs"
            @click="changeType(inx)"
          >
            {{ item?.name }}</c-button
          >
        </view>
      </view>
      <c-empty v-if="!renderData?.series?.[0]?.data?.length" content="暂无数据" top="0" />
      <view v-else :key="activeInx" class="chart-box mt-l plr-l">
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
    </view>
  </c-popup>
</template>

<script lang="ts" setup>
type IChartItem = {
  series: {
    data: {
      label: string;
      value: number;
      name?: string;
    }[];
  }[];
};

const typeList = [
  { name: '空间', type: 'space' },
  { name: '告警类型', type: 'alarmType' },
];

import { PropType, computed, ref } from 'vue';
import QiunDataCharts from '../../../components/biz/qiun-data-charts/qiun-data-charts.vue';
import { IHourItem } from '../../../services/ai-control';

const props = defineProps({
  detailData: {
    type: Object as PropType<IHourItem>,
    default() {
      return {
        alarmTypeDataList: [],
        spaceDataList: [],
      };
    },
  },
  infoData: {
    type: Object,
    default() {
      return {
        title: 0,
        value: '',
      };
    },
  },
  timeRangeModal: {
    type: Boolean,
    default: false,
  },
  clickClose: {
    type: Function,
    default: () => {},
  },
});
const chartData = ref<IChartItem>({} as IChartItem);
const activeInx = ref(0);

const showPopup = computed(() => {
  const isShow = props.timeRangeModal;
  return isShow;
});

const barOptions = computed(() => {
  const options = {
    padding: [32],
    legend: { show: true, position: 'bottom', padding: 12, margin: 12 },
    title: {
      name: props?.infoData?.title,
      fontSize: 22,
      color: '#1D2129',
    },
    subtitle: { name: props?.infoData?.value, fontSize: 14, color: '#86909C' },
    extra: {
      ring: {
        customRadius: 65,
        ringWidth: 12,
        labelWidth: 2,
        border: false,
      },
    },
  };
  return options;
});

const changeType = (inx: number) => {
  activeInx.value = inx;
};

const closePopup = () => {
  chartData.value = { series: [] };
  props?.clickClose && props.clickClose();
};

const renderData = computed(() => {
  let data = [];
  if (activeInx.value === 1) {
    data =
      (props?.detailData?.alarmTypeDataList || []).map(item => ({
        ...item,
        name: item.label,
        labelText: `${item?.value}次`,
      })) || [];
  } else {
    data =
      (props?.detailData?.spaceDataList || []).map(item => ({
        ...item,
        name: item.label,
        labelText: `${item?.value}次`,
      })) || [];
  }
  const chartData = {
    series: [{ data }],
  };
  return chartData;
});
</script>
<style lang="scss" scoped>
.alarm-type-box {
  width: 350rpx;
  margin: 0 auto;
}
.chart-box {
  width: 100%;
  height: 500rpx;
}
</style>
