<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pull-down-refresh="getData"
    @show="getData"
  >
    <u-empty-custom v-if="list?.total === 0" card text="暂无数据" />
    <template v-else>
      <view class="data-box">
        <chart-circle
          :width="115"
          :height="115"
          :data="[
            { value: list?.behavior, color: '#FE7C00' },
            { value: list?.person, color: '#176BFB' },
          ]"
        >
          <view class="chart-num">{{ list?.total }}</view>
          <view class="chart-subTitle">告警数</view>
        </chart-circle>
        <view class="item-box">
          <view class="item" @click="() => handleDetail(2)"
            ><view class="badge" style="background-color: #fe7c00" /><view>行为布控</view
            ><view class="item-num">{{ list?.behavior }}</view></view
          >
          <view class="item" style="margin-top: 16rpx" @click="() => handleDetail(1)"
            ><view class="badge" style="background-color: #176bfb" /><view>人员布控</view
            ><view class="item-num">{{ list?.person }}</view></view
          >
        </view>
      </view>
    </template>
  </widget-card>
</template>
<script lang="ts" setup>
import ChartCircle from '@/components/chart/circle.vue';
import { getAiAlarmStatisticsApi, type IAiAlarmDataItem } from '@/services/widgets';
import type { IWidget } from '@/store/modules/workbench';
import { formatDate } from '@/utils/tools';
import widgetCard from '@/widgets/components/widget-card.vue';
import { onMounted, ref } from 'vue';

interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const isLoad = ref(false);
const list = ref<IAiAlarmDataItem>({} as IAiAlarmDataItem);

const handleClickNavigator = () => {
  uni.navigateTo({
    url: `/app-school-safe/ai-control/index?viewType=all`,
  });
};

const getData = async () => {
  const reqData = {
    date: formatDate(new Date(), 'YYYY-MM-DD'),
    timeScope: 'day',
  };
  const res = await getAiAlarmStatisticsApi(reqData);
  isLoad.value = true;
  list.value = res;
};

const handleDetail = (type: number) => {
  uni.navigateTo({
    url: `/app-school-safe/ai-control/index?alarmType=${type}&timeScope=today&viewType=item`,
  });
};

onMounted(() => {
  getData();
});
</script>
<style lang="scss" scoped>
.data-box {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: 24rpx;
  .chart-num {
    font-size: 32rpx;
    color: #1d2129;
    font-weight: 600;
    text-align: center;
  }
  .chart-subTitle {
    font-size: 24rpx;
    text-align: center;
    color: #4e5969;
  }
  .item-box {
    .item {
      color: #4e5969;
      font-size: 28rpx;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .badge {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        margin-right: 16rpx;
      }
      .item-num {
        font-size: 28rpx;
        color: #1d2129;
        font-weight: 600;
        margin-left: 32rpx;
      }
    }
  }
}
</style>
