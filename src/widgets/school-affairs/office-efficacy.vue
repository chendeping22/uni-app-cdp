<template>
  <view
    class="u-m-l-32 u-m-r-32 u-m-t-24 u-p-l-24 u-p-r-24 widget all-container"
    style="height: 902rpx"
  >
    <view>
      <u-cell-item
        :icon="widget.applicationLogoUrl"
        :title="widget.title"
        :title-style="{ fontSize: '30rpx', fontWeight: 600 }"
        :border-bottom="false"
        :arrow="false"
        :hover-class="'none'"
      >
      </u-cell-item>
    </view>
    <!-- 上部 -->
    <view class="flex-around mt-s top-backgroup height-cell-large">
      <view class="flex-column">
        <view class="view-center-value">{{ officeKey || '-' }}</view>
        <view class="view-label">综合效能指数</view>
      </view>
    </view>
    <!-- 中部 -->
    <view class="mt-l pl-xs pr-xs">
      <view name="up" class="flex-between">
        <view class="flex-column view-container">
          <view class="view-value">{{ noticeKey || '-' }}</view>
          <view class="view-label">通知效能</view>
        </view>
        <view class="flex-column view-container">
          <view class="view-value">{{ meetingKey || '-' }}</view>
          <view class="view-label">会议效能</view>
        </view>
        <view class="flex-column view-container">
          <view class="view-value">{{ missiveKey || '-' }}</view>
          <view class="view-label">公文效能</view>
        </view>
      </view>
      <view name="down" class="flex-between mt-l">
        <view class="flex-column view-container">
          <view class="view-value">{{ fillReportKey || '-' }}</view>
          <view class="view-label">填报效能</view>
        </view>
        <view class="flex-column view-container">
          <view class="view-value">{{ approveKey || '-' }}</view>
          <view class="view-label">审批效能</view>
        </view>
        <view class="flex-column view-container">
          <view class="view-value">{{ cloudDiskKey || '-' }}</view>
          <view class="view-label">云盘效能</view>
        </view>
      </view>
    </view>
    <!-- 下部 -->
    <view v-if="chartData.series && chartData.series.length > 0" class="office-line">
      <qiun-data-charts
        :canvas-id="`officeLine_${Math.ceil(Math.random() * 1000000)}`"
        type="line"
        :opts="opts"
        :chart-data="chartData"
        tooltip-format="myTooltipEfficacy"
        :canvas2d="true"
        :ontouch="true"
      />
    </view>
    <view v-else class="empty-contain">
      <u-empty-custom
        card
        bg-type="fill-light"
        type="mini"
        class-name="mt-b ptb-b"
        text="暂无数据"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { getOfficeEfficacyData } from '@/services/widgets';
import type { IWidget } from '@/store/modules/workbench';
import QiunDataCharts from '@/widgets/components/qiun-data-charts/qiun-data-charts/qiun-data-charts.vue';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// 定义接口接收父级参数
const props = withDefaults(defineProps<IProps>(), {});
const isLoad = ref(true);
const officeKey = ref(null);
const noticeKey = ref(null);
const meetingKey = ref(null);
const missiveKey = ref(null);
const fillReportKey = ref(null);
const approveKey = ref(null);
const cloudDiskKey = ref(null);

const opts = ref({
  color: ['#1677FF', '#FADB14', '#13C2C2', '#FA541C', '#FAAD14', '#722ED1'],
  padding: [20, 10, 10, 0],
  dataLabel: false,
  dataPointShape: false,
  inScrollView: true,
  legend: {
    show: true,
    width: 660,
    fontSize: 10,
    textStyle: {
      color: '#00000099', // 图例文本颜色
      lineHeight: 16,
    },
  },
  xAxis: {
    disableGrid: true,
    axisLabel: {
      interval: 1,
      textStyle: {
        color: '#00000066',
        fontSize: 11,
        lineHeight: 16,
      },
    },
  },
  yAxis: {
    disabled: true,
    showAxisLine: false,
    gridType: 'dash',
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
      width: 2,
      activeType: 'hollow',
    },
  },
});

const chartData = ref<{
  categories: [];
  series: [];
}>({
  categories: [],
  series: [],
});

const tooltipFormat = (item, category, index, opts) => {
  console.log('tooltipFormat', item);
};

enum OfficeKyeEnum {
  noticeKey = '通知',
  meetingKey = '会议',
  missiveKey = '公文',
  fillReportKey = '填报',
  approveKey = '审批',
  cloudDiskKey = '云盘',
}

enum OfficeKyeSortEnum {
  '通知' = 1,
  '会议' = 2,
  '公文' = 3,
  '填报' = 4,
  '审批' = 5,
  '云盘' = 6,
}

const getData = async () => {
  const params = {
    countKey: '',
    countType: 'office',
    timeSlot: 'oneMonth',
    unitType: 'department',
  };
  const data = await getOfficeEfficacyData(params);
  console.log('data', data);
  if (data && data.statistics) {
    officeKey.value = data.statistics.officeKey;
    noticeKey.value = data.statistics.noticeKey;
    meetingKey.value = data.statistics.meetingKey;
    missiveKey.value = data.statistics.missiveKey;
    fillReportKey.value = data.statistics.fillReportKey;
    approveKey.value = data.statistics.approveKey;
    cloudDiskKey.value = data.statistics.cloudDiskKey;
  }
  let dateTmp = [];
  for (let i = 6; i >= 0; i--) {
    let diff = dayjs().add(-i, 'day').format('YYYY-MM-DD');
    dateTmp.push(diff);
  }
  let series = [];

  if (data && data.detail) {
    let detail = data.detail;

    for (let key in OfficeKyeEnum) {
      let tmpKey = {};
      tmpKey.name = OfficeKyeEnum[key];
      tmpKey.legendShape = 'circle';
      tmpKey.symbolSize = 5;
      let tmpMap = {};
      let tmpList = detail[key];
      if (tmpList && tmpList.length > 0) {
        tmpList.forEach(item => {
          tmpMap[item.countDay] = item;
        });

        let keyData = [];
        dateTmp.forEach(day => {
          let obj = tmpMap[day];
          let objValue = !obj ? 0 : parseFloat(obj.value);
          keyData.push(objValue);
        });
        tmpKey.data = keyData;
        series.push(tmpKey);
      }
    }
  }
  series.sort((a, b) => {
    return OfficeKyeSortEnum[a.name] - OfficeKyeSortEnum[b.name];
  });

  let categories = [];
  dateTmp.forEach(day => {
    var tmp = dayjs(day).add(-1, 'day');
    var dayTmp = dayjs(tmp).format('MM-DD');
    categories.push(dayTmp);
  });

  chartData.value.categories = categories;
  chartData.value.series = series;

  console.log('chartData', chartData);
};

onMounted(() => {
  getData();
});
</script>

<style lang="scss" scoped>
.top-backgroup {
  background: linear-gradient(to right, #e6f4ff, #f6ffed);
  border-radius: 16rpx;
  padding: 16rpx;
}
.view-center-value {
  font-weight: 500;
  font-size: 40rpx;
  line-height: 52rpx;
  color: #000000e0;
}
.view-value {
  font-weight: 500;
  font-size: 30rpx;
  line-height: 40rpx;
  color: #000000e0;
}
.view-label {
  font-weight: 400;
  font-size: 26rpx;
  line-height: 36rpx;
  color: #00000073;
}
.office-line {
  width: 622;
  height: 360rpx;
  margin-top: 20rpx;
  padding-left: 16rpx;
}
.view-container {
  background-color: #00000005;
  width: 192rpx;
  height: 108rpx;
  border-radius: 16rpx;
  padding: 16rpx;
}
.all-container {
  background-color: #ffffff;
  border-radius: 8px;
  margin: 0;
  box-shadow: none;
  box-sizing: border-box;
}
.empty-contain {
  margin-top: 60rpx;
  padding-bottom: 80rpx;
}
</style>
