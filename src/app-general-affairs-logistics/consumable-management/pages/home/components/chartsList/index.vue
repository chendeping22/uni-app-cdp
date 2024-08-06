<script setup lang="ts">
import DashboardDatePicker from '@/components/dashboard-date-picker/index.vue';
import { omit } from '@/utils/lodash-es';
import QiunDataCharts from '@/widgets/components/qiun-data-charts/qiun-data-charts/qiun-data-charts.vue';
import dayjs from 'dayjs';
import { computed, reactive, ref, watch } from 'vue';
import { colorList } from '../../constants';
const componentPlaceholder = {
  'qiun-data-charts': 'view',
};

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  sourceData: {
    type: Object,
    default: () => {},
  },
  storeList: {
    /** 卡片数据 */
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits<{
  (e: 'onSearch', val: any): void;
}>();

const storeList = computed(() => props.storeList);
const typeData = ref(null);
const typeIndex = ref();
const getTypeData = (item: any, index: number) => {
  typeData.value = item;
  typeIndex.value = index;
};
const clearTypeData = () => {
  typeData.value = null;
  typeIndex.value = null;
};
const chartData = ref<{
  categories: [];
  series: [];
}>({
  categories: [],
  series: [],
});
const showStore = ref<boolean>(false);
const showDateType = ref<boolean>(false);
const dateTime = ref<any>(dayjs());
const dateTypeList = [
  { label: '按年', value: 'Year' },
  { label: '按月', value: 'Month' },
  { label: '按周', value: 'Week' },
];
const searchState = reactive<{
  timeLabel?: string;
  beginTime?: string;
  endTime?: string;
  storeId?: string;
  storeName?: string;
  dateType?: string;
  dateTypeName?: string;
}>({
  storeName: '全部',
  dateType: 'Year',
  dateTypeName: '按年',
  timeLabel: dayjs().subtract(0, 'day').format('YYYY'),
  beginTime: dayjs().startOf('year').format('YYYY-MM-DD'),
  endTime: dayjs().endOf('year').format('YYYY-MM-DD'),
});
const opts = ref({
  color: [
    '#1677FF',
    '#91CB74',
    '#FAC858',
    '#EE6666',
    '#73C0DE',
    '#3CA272',
    '#FC8452',
    '#9A60B4',
    '#ea7ccc',
  ],
  padding: [15, 15, 0, 0],
  dataLabel: false,
  dataPointShape: false,
  enableScroll: false,
  legend: {
    show: false,
  },
  xAxis: {
    disableGrid: true,
    interval: 'auto',
    labelCount: 12,
    format: 'xAxisConsumable',
  },
  yAxis: {
    gridType: 'solid',
    dashLength: 2,
    data: [
      {
        axisLineColor: '#ffffff',
      },
    ],
  },
  extra: {
    line: {
      type: 'curve',
      width: 3,
      activeType: 'solid',
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

watch(
  () => props.sourceData,
  () => {
    chartData.value.categories = props.sourceData?.lineItems.map(item => item.name) || [];
    chartData.value.series = [
      {
        name: props.title,
        data: props.sourceData?.lineItems.map(item => Number(item.value)) || [],
      },
    ];
    switch (searchState.dateType) {
      case 'Year':
        opts.value.xAxis.labelCount = 13;
        break;
      case 'Month':
        opts.value.xAxis.labelCount = 6;
        break;
      case 'Week':
        opts.value.xAxis.labelCount = 6;
        break;
    }
  },
  {
    immediate: true,
  },
);
const getDateText = () => {
  if (searchState.dateType === 'Year') return `${searchState.timeLabel}年`;
  switch (searchState.dateType) {
    case 'Year':
      return `${searchState.timeLabel}年`;
    case 'Month':
      return `${searchState.timeLabel.split('-')[0]}年${searchState.timeLabel.split('-')[1]}月`;
    case 'Week':
      return searchState.timeLabel;
  }
};
const showPicker = ref<boolean>(false);
const params = ref<any>({
  year: true,
  month: false,
  day: false,
  hour: false,
  minute: false,
  second: false,
  timestamp: true,
});
const changeDateObj = (dateObj: any) => {
  searchState.timeLabel = dateObj.label.substring(0, 9);
  if (dateObj.mode === 'Month') {
    searchState.beginTime = dayjs(dateObj.value).startOf('month').format('YYYY-MM-DD');
    searchState.endTime = dayjs(dateObj.value).endOf('month').format('YYYY-MM-DD');
  } else {
    searchState.beginTime = dayjs(dateObj.value).format('YYYY-MM-DD');
    searchState.endTime = dayjs(dateObj.value).add(6, 'day').format('YYYY-MM-DD');
  }
  emit('onSearch', {
    ...omit(searchState, ['storeName', 'dateType', 'dateTypeName', 'timeLabel']),
    dateType: searchState.dateType === 'Year' ? 1 : 0,
  });
};
const handleConfirmStore = (val: { value?: string; label?: string }[]) => {
  searchState.storeId = val?.[0]?.value;
  searchState.storeName = val?.[0]?.label;
  emit('onSearch', {
    ...omit(searchState, ['storeName', 'dateType', 'dateTypeName', 'timeLabel']),
    dateType: searchState.dateType === 'Year' ? 1 : 0,
  });
};

const handleConfirmDateType = (val: { value?: string; label?: string }[]) => {
  searchState.dateType = val?.[0]?.value;
  searchState.dateTypeName = val?.[0]?.label;
  if (searchState.dateType === 'Year') {
    searchState.timeLabel = dayjs().subtract(0, 'day').format('YYYY');
    searchState.beginTime = dayjs().startOf('year').format('YYYY-MM-DD');
    searchState.endTime = dayjs().endOf('year').format('YYYY-MM-DD');
    emit('onSearch', {
      ...omit(searchState, ['storeName', 'dateType', 'dateTypeName', 'timeLabel']),
      dateType: searchState.dateType === 'Year' ? 1 : 0,
    });
  }
};
const handleConfirmDate = (val: any) => {
  searchState.timeLabel = val?.year;
  searchState.beginTime = dayjs(val?.year).startOf('year').format('YYYY-MM-DD');
  searchState.endTime = dayjs(val?.year).endOf('year').format('YYYY-MM-DD');
  emit('onSearch', {
    ...omit(searchState, ['storeName', 'dateType', 'dateTypeName', 'timeLabel']),
    dateType: searchState.dateType === 'Year' ? 1 : 0,
  });
};
</script>
<template>
  <view class="list-wrap">
    <view class="list-head">
      <view class="list-title">{{ title }}</view>
    </view>
    <view class="list-filter">
      <view class="list-filter-item" @click="showStore = true">
        <view class="list-filter-item-title">
          {{ searchState?.storeName }}
        </view>
        <u-icon
          name="arrow-down-fill"
          class="list-filter-item-down"
          size="24"
          color="rgba(0, 0, 0, 0.45)"
        ></u-icon
      ></view>
      <view class="list-filter-item" style="flex: 1" @click="showDateType = true"
        >{{ searchState?.dateTypeName }}
        <u-icon
          name="arrow-down-fill"
          class="list-filter-item-down"
          size="24"
          color="rgba(0, 0, 0, 0.45)"
        ></u-icon
      ></view>
      <view
        v-if="searchState.dateType === 'Year'"
        class="list-filter-item"
        @click="showPicker = true"
      >
        {{ searchState.timeLabel }}
        <u-icon
          name="arrow-down-fill"
          class="list-filter-item-down"
          size="24"
          color="rgba(0, 0, 0, 0.45)"
        ></u-icon>
      </view>
      <view v-else class="list-filter-item">
        <DashboardDatePicker
          :mode="searchState.dateType"
          :default-date="dateTime"
          @change="changeDateObj"
          >{{ searchState.timeLabel
          }}<u-icon
            name="arrow-down-fill"
            class="list-filter-item-down"
            size="24"
            color="rgba(0, 0, 0, 0.45)"
          ></u-icon>
        </DashboardDatePicker>
      </view>
    </view>
    <view class="list-top">
      <view v-if="sourceData?.count" class="list-top-wrap">
        <view class="list-top-head">
          <view
            v-if="typeData"
            :style="{
              background: colorList[typeIndex % 8],
            }"
            class="list-top-icon"
          ></view>
          <view v-if="typeData" class="list-top-center">
            <view class="list-top-title">{{ `${typeData.name}` }}</view
            ><view>
              {{
                `${getDateText()}${title.slice(-2)}数量：${typeData?.value}(${Number(
                  typeData?.percent?.split('%')[0],
                )?.toFixed(0)})%` || 0
              }}</view
            ></view
          >
          <view v-else class="list-top-title"
            >{{ getDateText() }}{{ title.slice(-2) }}总数：{{ sourceData?.count || 0 }}</view
          >
        </view>
        <view class="list-chart-wrap">
          <template v-if="sourceData?.pieItems?.length">
            <view
              v-for="(item, index) in sourceData?.pieItems"
              :key="item.name"
              class="chart-item"
              :style="{
                width: `${item.percent}`,
                background: colorList[index % 8],
              }"
              @touchstart="() => getTypeData(item, index)"
              @touchend="() => clearTypeData()"
            >
              <view v-if="typeIndex === index" class="triangle"></view>
            </view>
          </template>
        </view>
        <view v-if="chartData.series && chartData.series.length > 0" class="charts-box">
          <qiun-data-charts
            :canvas-id="`officeLine_${Math.ceil(Math.random() * 1000000)}`"
            type="line"
            :opts="opts"
            :chart-data="chartData"
            tooltip-format="consumableManagement"
            :canvas2d="true"
            :ontouch="false"
          />
        </view>
      </view>
      <u-empty-custom v-else mode="data"></u-empty-custom>
    </view>
    <u-select
      v-model="showStore"
      :list="storeList"
      value-name="id"
      label-name="name"
      @cancel="showStore = false"
      @confirm="handleConfirmStore"
    ></u-select>
    <u-select
      v-model="showDateType"
      :list="dateTypeList"
      @cancel="showDateType = false"
      @confirm="handleConfirmDateType"
    ></u-select>
    <u-picker
      v-model="showPicker"
      mode="time"
      :params="params"
      :default-time="dayjs().format('YYYY-MM-DD HH:mm')"
      :end-year="dayjs().format('YYYY')"
      @cancel="showPicker = false"
      @confirm="handleConfirmDate"
    ></u-picker>
  </view>
</template>
<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.list-wrap {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.04);
}
.list-head {
  padding: 24rpx 32rpx 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  font-family: 'PingFang SC';
  .list-title {
    color: #000000;
    font-size: 32rpx;
  }
  .list-type {
    color: #1677ff;
    font-size: 30rpx;
  }
}
.list-filter {
  height: 96rpx;
  display: flex;
  align-items: center;
  &-item {
    display: flex;
    justify-content: center;
    flex: 2;
    margin-left: 16rpx;
    color: #000000e0;
    font-family: 'PingFang SC';
    font-size: 26rpx;
    font-style: normal;
    font-weight: 400;
    overflow: hidden;
    &-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: right;
    }
    &-down {
      margin-left: 8rpx;
    }
    &:first-child {
      margin-left: 24rpx;
    }
  }
}
.list-top {
  padding: 0 24rpx 24rpx;
  &-head {
    display: flex;
    padding: 16rpx 24rpx;
    align-items: center;
    align-self: stretch;
    border-radius: 8rpx;
    background: #0000000a;
    overflow: hidden;
  }
  &-icon {
    flex-shrink: 0;
    margin-right: 24rpx;
    width: 16rpx;
    height: 16rpx;
    border-radius: 16rpx;
  }
  &-center {
    display: flex;
    overflow: hidden;
  }
  &-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .list-top-wrap {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24rpx;
    align-self: stretch;
    border-radius: 16rpx;
    .list-chart-wrap {
      width: 100%;
      background: #fff;
      height: 32rpx;
      display: flex;
      gap: 2rpx;
      border-radius: 10rpx;
    }
  }
}
.chart-item {
  position: relative;
  &:first-child {
    border-top-left-radius: 10rpx;
    border-bottom-left-radius: 10rpx;
  }
  &:last-child {
    border-top-right-radius: 10rpx;
    border-bottom-right-radius: 10rpx;
  }
  .triangle {
    position: absolute;
    top: -24rpx;
    left: 50%;
    margin-left: -20rpx;
    width: 0;
    height: 0;
    border: 20rpx solid transparent;
    border-top-color: #0000000a;
  }
}
.up-down {
  width: 100%;
  height: 56rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.list-item {
  position: relative;
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  .item-con {
    flex: 1;
    display: flex;
    justify-content: space-between;
    .item-con-left {
      display: flex;
      align-items: center;
      .item-icon {
        margin-right: 16rpx;
        width: 16rpx;
        height: 40rpx;
        border-radius: 8rpx;
        border: 1px solid #faad14;
        background: rgba(250, 219, 20, 0.1);
      }
      .item-title {
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        color: rgba(0, 0, 0, 0.88);
        text-overflow: ellipsis;
        font-family: 'PingFang SC';
        font-size: 30rpx;
        font-style: normal;
        font-weight: 400;
        line-height: 20px;
      }
      .item-percent {
        color: rgba(0, 0, 0, 0.45);
        font-size: 24rpx;
      }
    }
    .item-con-right {
      color: rgba(0, 0, 0, 0.45);
      text-align: right;
      font-family: 'PingFang SC';
      font-size: 26rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 36rpx;
    }
  }
  &::after {
    position: absolute;
    content: '';
    display: block;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1rpx;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.06);
  }
}
.charts-box {
  width: 100%;
  height: 400rpx;
}
</style>
